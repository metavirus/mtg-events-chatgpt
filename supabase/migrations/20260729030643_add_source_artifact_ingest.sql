insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'source-artifacts',
  'source-artifacts',
  false,
  20971520,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table public.source_artifacts (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.sources(id) on delete restrict,
  origin_url text,
  platform text not null
    check (platform in (
      'discord',
      'instagram',
      'facebook',
      'website',
      'event_platform',
      'other'
    )),
  external_artifact_id text,
  published_at timestamptz,
  captured_at timestamptz not null default timezone('utc', now()),
  capture_method text not null
    check (capture_method in ('download', 'screenshot', 'user_supplied')),
  storage_bucket text not null default 'source-artifacts'
    check (storage_bucket = 'source-artifacts'),
  storage_path text not null,
  original_filename text,
  mime_type text not null
    check (mime_type in (
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf'
    )),
  byte_size bigint not null check (byte_size between 1 and 20971520),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  content_sha256 text not null
    check (content_sha256 ~ '^[0-9a-f]{64}$'),
  analysis_status text not null default 'pending'
    check (analysis_status in ('pending', 'analyzed', 'partial', 'unreadable')),
  extracted_text text,
  extracted_facts jsonb not null default '{}'::jsonb
    check (jsonb_typeof(extracted_facts) = 'object'),
  analysis_summary text,
  analysis_confidence text
    check (
      analysis_confidence is null
      or analysis_confidence in ('low', 'medium', 'high')
    ),
  analysis_idempotency_key text unique,
  idempotency_key text not null unique
    check (length(btrim(idempotency_key)) between 1 and 240),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.source_artifacts is
  'Durable visual/document source evidence. Images and PDFs are ordinary source data; extracted claims remain separate from the original artifact.';

create index source_artifacts_source_captured_idx
  on public.source_artifacts (source_id, captured_at desc);

create index source_artifacts_sha256_idx
  on public.source_artifacts (content_sha256);

create table public.source_artifact_links (
  artifact_id uuid not null
    references public.source_artifacts(id) on delete cascade,
  target_type text not null
    check (target_type in (
      'venue',
      'community',
      'event_series',
      'event_occurrence',
      'signal',
      'research_change',
      'surface_check'
    )),
  target_id text not null,
  relationship text not null default 'evidence'
    check (length(btrim(relationship)) between 1 and 120),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (artifact_id, target_type, target_id)
);

comment on table public.source_artifact_links is
  'Links one preserved source artifact to every canonical record or operational finding it supports.';

create index source_artifact_links_target_idx
  on public.source_artifact_links (target_type, target_id);

alter table public.source_artifacts enable row level security;
alter table public.source_artifact_links enable row level security;

revoke all on table public.source_artifacts from public;
revoke all on table public.source_artifacts from anon;
revoke all on table public.source_artifacts from authenticated;
grant all on table public.source_artifacts to service_role;

revoke all on table public.source_artifact_links from public;
revoke all on table public.source_artifact_links from anon;
revoke all on table public.source_artifact_links from authenticated;
grant all on table public.source_artifact_links to service_role;

create or replace function public.source_artifact_target_exists(
  p_target_type text,
  p_target_id text
)
returns boolean
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select case p_target_type
    when 'venue' then exists (
      select 1 from public.venues where id = p_target_id
    )
    when 'community' then exists (
      select 1 from public.communities where id = p_target_id
    )
    when 'event_series' then exists (
      select 1 from public.event_series where id = p_target_id
    )
    when 'event_occurrence' then exists (
      select 1 from public.event_occurrences where id = p_target_id
    )
    when 'signal' then exists (
      select 1 from public.signals where id = p_target_id
    )
    when 'research_change' then exists (
      select 1 from public.research_changes where id = p_target_id
    )
    when 'surface_check' then exists (
      select 1
      from public.entity_surface_coverage
      where id::text = p_target_id
    )
    else false
  end;
$$;

revoke all on function public.source_artifact_target_exists(text, text)
  from public;
revoke all on function public.source_artifact_target_exists(text, text)
  from anon;
revoke all on function public.source_artifact_target_exists(text, text)
  from authenticated;
grant execute on function public.source_artifact_target_exists(text, text)
  to service_role;

create or replace function public.record_source_artifact(
  p_idempotency_key text,
  p_source_id text,
  p_platform text,
  p_capture_method text,
  p_storage_path text,
  p_mime_type text,
  p_byte_size bigint,
  p_content_sha256 text,
  p_target_type text,
  p_target_id text,
  p_relationship text default 'evidence',
  p_origin_url text default null,
  p_external_artifact_id text default null,
  p_published_at timestamptz default null,
  p_captured_at timestamptz default null,
  p_original_filename text default null,
  p_width integer default null,
  p_height integer default null,
  p_dry_run boolean default false
)
returns table (
  artifact_id uuid,
  storage_path text,
  outcome text,
  wrote boolean
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_existing public.source_artifacts%rowtype;
  v_artifact_id uuid;
  v_captured_at timestamptz;
begin
  if p_idempotency_key is null
     or length(btrim(p_idempotency_key)) not between 1 and 240 then
    raise exception 'invalid idempotency_key';
  end if;

  if p_source_id is null
     or not exists (select 1 from public.sources where id = p_source_id) then
    raise exception 'unknown source: %', p_source_id;
  end if;

  if p_platform not in (
    'discord',
    'instagram',
    'facebook',
    'website',
    'event_platform',
    'other'
  ) then
    raise exception 'unsupported platform: %', p_platform;
  end if;

  if p_capture_method not in ('download', 'screenshot', 'user_supplied') then
    raise exception 'unsupported capture_method: %', p_capture_method;
  end if;

  if p_storage_path is null or length(btrim(p_storage_path)) = 0 then
    raise exception 'storage_path is required';
  end if;

  if p_mime_type not in (
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ) then
    raise exception 'unsupported mime_type: %', p_mime_type;
  end if;

  if p_byte_size is null or p_byte_size not between 1 and 20971520 then
    raise exception 'byte_size must be between 1 and 20971520';
  end if;

  if p_content_sha256 is null
     or p_content_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'content_sha256 must be a lowercase SHA-256 hex digest';
  end if;

  if p_target_type not in (
    'venue',
    'community',
    'event_series',
    'event_occurrence',
    'signal',
    'research_change',
    'surface_check'
  ) then
    raise exception 'unsupported target_type: %', p_target_type;
  end if;

  if p_target_id is null
     or not public.source_artifact_target_exists(p_target_type, p_target_id) then
    raise exception 'unknown % target: %', p_target_type, p_target_id;
  end if;

  if p_relationship is null
     or length(btrim(p_relationship)) not between 1 and 120 then
    raise exception 'relationship must contain 1 to 120 trimmed characters';
  end if;

  select *
  into v_existing
  from public.source_artifacts
  where idempotency_key = p_idempotency_key;

  if found then
    if v_existing.source_id is distinct from p_source_id
       or v_existing.platform is distinct from p_platform
       or v_existing.capture_method is distinct from p_capture_method
       or v_existing.storage_path is distinct from btrim(p_storage_path)
       or v_existing.mime_type is distinct from p_mime_type
       or v_existing.byte_size is distinct from p_byte_size
       or v_existing.content_sha256 is distinct from p_content_sha256
       or v_existing.origin_url is distinct from nullif(btrim(coalesce(p_origin_url, '')), '')
       or v_existing.external_artifact_id is distinct from nullif(btrim(coalesce(p_external_artifact_id, '')), '')
       or v_existing.published_at is distinct from p_published_at
       or v_existing.original_filename is distinct from nullif(btrim(coalesce(p_original_filename, '')), '')
       or v_existing.width is distinct from p_width
       or v_existing.height is distinct from p_height then
      raise exception 'idempotency_key reused with different artifact request';
    end if;

    if not exists (
      select 1
      from public.source_artifact_links
      where artifact_id = v_existing.id
        and target_type = p_target_type
        and target_id = p_target_id
        and relationship = btrim(p_relationship)
    ) then
      raise exception 'idempotency_key replay used with a different artifact link';
    end if;

    return query
      select
        v_existing.id,
        v_existing.storage_path,
        'replayed'::text,
        false;
    return;
  end if;

  if p_dry_run then
    return query
      select
        null::uuid,
        btrim(p_storage_path),
        'validated'::text,
        false;
    return;
  end if;

  v_captured_at := coalesce(p_captured_at, timezone('utc', now()));

  insert into public.source_artifacts (
    source_id,
    origin_url,
    platform,
    external_artifact_id,
    published_at,
    captured_at,
    capture_method,
    storage_path,
    original_filename,
    mime_type,
    byte_size,
    width,
    height,
    content_sha256,
    idempotency_key
  )
  values (
    p_source_id,
    nullif(btrim(coalesce(p_origin_url, '')), ''),
    p_platform,
    nullif(btrim(coalesce(p_external_artifact_id, '')), ''),
    p_published_at,
    v_captured_at,
    p_capture_method,
    btrim(p_storage_path),
    nullif(btrim(coalesce(p_original_filename, '')), ''),
    p_mime_type,
    p_byte_size,
    p_width,
    p_height,
    p_content_sha256,
    p_idempotency_key
  )
  returning id into v_artifact_id;

  insert into public.source_artifact_links (
    artifact_id,
    target_type,
    target_id,
    relationship
  )
  values (
    v_artifact_id,
    p_target_type,
    p_target_id,
    btrim(p_relationship)
  );

  return query
    select
      v_artifact_id,
      btrim(p_storage_path),
      'inserted'::text,
      true;
end;
$$;

create or replace function public.record_source_artifact_analysis(
  p_analysis_idempotency_key text,
  p_artifact_id uuid,
  p_analysis_status text,
  p_extracted_text text default null,
  p_extracted_facts jsonb default '{}'::jsonb,
  p_analysis_summary text default null,
  p_analysis_confidence text default null,
  p_dry_run boolean default false
)
returns table (
  artifact_id uuid,
  analysis_status text,
  outcome text,
  wrote boolean
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_existing public.source_artifacts%rowtype;
begin
  if p_analysis_idempotency_key is null
     or length(btrim(p_analysis_idempotency_key)) not between 1 and 240 then
    raise exception 'invalid analysis_idempotency_key';
  end if;

  select *
  into v_existing
  from public.source_artifacts
  where id = p_artifact_id;

  if not found then
    raise exception 'unknown source_artifact: %', p_artifact_id;
  end if;

  if p_analysis_status not in ('analyzed', 'partial', 'unreadable') then
    raise exception 'unsupported analysis_status: %', p_analysis_status;
  end if;

  if p_extracted_facts is null
     or jsonb_typeof(p_extracted_facts) <> 'object' then
    raise exception 'extracted_facts must be a JSON object';
  end if;

  if p_analysis_confidence is not null
     and p_analysis_confidence not in ('low', 'medium', 'high') then
    raise exception 'unsupported analysis_confidence: %', p_analysis_confidence;
  end if;

  if v_existing.analysis_idempotency_key is not null then
    if v_existing.analysis_idempotency_key is distinct from p_analysis_idempotency_key
       or v_existing.analysis_status is distinct from p_analysis_status
       or v_existing.extracted_text is distinct from nullif(btrim(coalesce(p_extracted_text, '')), '')
       or v_existing.extracted_facts is distinct from p_extracted_facts
       or v_existing.analysis_summary is distinct from nullif(btrim(coalesce(p_analysis_summary, '')), '')
       or v_existing.analysis_confidence is distinct from p_analysis_confidence then
      raise exception 'artifact already analyzed with different content';
    end if;

    return query
      select
        v_existing.id,
        v_existing.analysis_status,
        'replayed'::text,
        false;
    return;
  end if;

  if p_dry_run then
    return query
      select
        v_existing.id,
        p_analysis_status,
        'validated'::text,
        false;
    return;
  end if;

  update public.source_artifacts
  set analysis_status = p_analysis_status,
      extracted_text = nullif(btrim(coalesce(p_extracted_text, '')), ''),
      extracted_facts = p_extracted_facts,
      analysis_summary = nullif(btrim(coalesce(p_analysis_summary, '')), ''),
      analysis_confidence = p_analysis_confidence,
      analysis_idempotency_key = btrim(p_analysis_idempotency_key),
      updated_at = timezone('utc', now())
  where id = p_artifact_id;

  return query
    select
      p_artifact_id,
      p_analysis_status,
      'updated'::text,
      true;
end;
$$;

create or replace function public.link_source_artifact(
  p_artifact_id uuid,
  p_target_type text,
  p_target_id text,
  p_relationship text default 'evidence',
  p_dry_run boolean default false
)
returns table (
  artifact_id uuid,
  target_type text,
  target_id text,
  outcome text,
  wrote boolean
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.source_artifacts where id = p_artifact_id
  ) then
    raise exception 'unknown source_artifact: %', p_artifact_id;
  end if;

  if p_target_type not in (
    'venue',
    'community',
    'event_series',
    'event_occurrence',
    'signal',
    'research_change',
    'surface_check'
  ) then
    raise exception 'unsupported target_type: %', p_target_type;
  end if;

  if p_target_id is null
     or not public.source_artifact_target_exists(p_target_type, p_target_id) then
    raise exception 'unknown % target: %', p_target_type, p_target_id;
  end if;

  if p_relationship is null
     or length(btrim(p_relationship)) not between 1 and 120 then
    raise exception 'relationship must contain 1 to 120 trimmed characters';
  end if;

  if exists (
    select 1
    from public.source_artifact_links
    where artifact_id = p_artifact_id
      and target_type = p_target_type
      and target_id = p_target_id
  ) then
    return query
      select
        p_artifact_id,
        p_target_type,
        p_target_id,
        'replayed'::text,
        false;
    return;
  end if;

  if p_dry_run then
    return query
      select
        p_artifact_id,
        p_target_type,
        p_target_id,
        'validated'::text,
        false;
    return;
  end if;

  insert into public.source_artifact_links (
    artifact_id,
    target_type,
    target_id,
    relationship
  )
  values (
    p_artifact_id,
    p_target_type,
    p_target_id,
    btrim(p_relationship)
  );

  return query
    select
      p_artifact_id,
      p_target_type,
      p_target_id,
      'inserted'::text,
      true;
end;
$$;

comment on function public.record_source_artifact(
  text,
  text,
  text,
  text,
  text,
  text,
  bigint,
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  timestamptz,
  text,
  integer,
  integer,
  boolean
) is
  'Typed steward-only path for recording one preserved image/PDF artifact and its first evidence link.';

comment on function public.record_source_artifact_analysis(
  text,
  uuid,
  text,
  text,
  jsonb,
  text,
  text,
  boolean
) is
  'Typed steward-only path for recording facts extracted from an ordinary image/PDF source artifact.';

comment on function public.link_source_artifact(
  uuid,
  text,
  text,
  text,
  boolean
) is
  'Typed steward-only path for attaching an existing artifact to an additional canonical or operational target.';

revoke all on function public.record_source_artifact(
  text, text, text, text, text, text, bigint, text, text, text,
  text, text, text, timestamptz, timestamptz, text, integer, integer, boolean
) from public;
revoke all on function public.record_source_artifact(
  text, text, text, text, text, text, bigint, text, text, text,
  text, text, text, timestamptz, timestamptz, text, integer, integer, boolean
) from anon;
revoke all on function public.record_source_artifact(
  text, text, text, text, text, text, bigint, text, text, text,
  text, text, text, timestamptz, timestamptz, text, integer, integer, boolean
) from authenticated;
grant execute on function public.record_source_artifact(
  text, text, text, text, text, text, bigint, text, text, text,
  text, text, text, timestamptz, timestamptz, text, integer, integer, boolean
) to service_role;

revoke all on function public.record_source_artifact_analysis(
  text, uuid, text, text, jsonb, text, text, boolean
) from public;
revoke all on function public.record_source_artifact_analysis(
  text, uuid, text, text, jsonb, text, text, boolean
) from anon;
revoke all on function public.record_source_artifact_analysis(
  text, uuid, text, text, jsonb, text, text, boolean
) from authenticated;
grant execute on function public.record_source_artifact_analysis(
  text, uuid, text, text, jsonb, text, text, boolean
) to service_role;

revoke all on function public.link_source_artifact(
  uuid, text, text, text, boolean
) from public;
revoke all on function public.link_source_artifact(
  uuid, text, text, text, boolean
) from anon;
revoke all on function public.link_source_artifact(
  uuid, text, text, text, boolean
) from authenticated;
grant execute on function public.link_source_artifact(
  uuid, text, text, text, boolean
) to service_role;
