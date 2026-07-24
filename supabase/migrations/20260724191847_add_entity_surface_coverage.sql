create table public.entity_surface_coverage (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('venue', 'community')),
  entity_id text not null,
  surface_type text not null
    check (
      surface_type in (
        'official_site',
        'wpn_eventlink',
        'event_calendar',
        'instagram',
        'facebook',
        'discord',
        'review',
        'other'
      )
    ),
  source_id text references public.sources(id),
  disposition text not null
    check (
      disposition in (
        'inspected_current',
        'inspected_thin',
        'route_found_content_not_inspected',
        'blocked_gated',
        'unsafe_tbd',
        'not_found',
        'stale',
        'contradiction',
        'not_material'
      )
    ),
  checked_at timestamptz not null,
  is_useful boolean not null default false,
  materiality text not null default 'medium'
    check (materiality in ('low', 'medium', 'high')),
  summary text not null
    check (length(btrim(summary)) between 1 and 2000),
  followup_item_id uuid references public.coordination_items(id),
  idempotency_key text not null unique
    check (length(btrim(idempotency_key)) between 1 and 240),
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.entity_surface_coverage is
  'Append-only steward record of material source-surface checks. Operational coverage state, not canonical research truth.';

create index entity_surface_coverage_latest_idx
  on public.entity_surface_coverage (
    entity_type,
    entity_id,
    surface_type,
    checked_at desc
  );

alter table public.entity_surface_coverage enable row level security;

revoke all on table public.entity_surface_coverage from public;
revoke all on table public.entity_surface_coverage from anon;
revoke all on table public.entity_surface_coverage from authenticated;
grant all on table public.entity_surface_coverage to service_role;

create or replace function public.record_entity_surface_check(
  p_idempotency_key text,
  p_entity_type text,
  p_entity_id text,
  p_surface_type text,
  p_disposition text,
  p_checked_at timestamptz,
  p_summary text,
  p_source_id text default null,
  p_is_useful boolean default false,
  p_materiality text default 'medium',
  p_followup_item_id uuid default null,
  p_dry_run boolean default false
)
returns table (
  coverage_id uuid,
  outcome text,
  wrote boolean,
  research_change_id text
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_existing public.entity_surface_coverage%rowtype;
  v_coverage_id uuid;
  v_change_id text;
begin
  if p_idempotency_key is null
     or length(btrim(p_idempotency_key)) not between 1 and 240 then
    raise exception 'invalid idempotency_key';
  end if;

  if p_entity_type not in ('venue', 'community') then
    raise exception 'unsupported entity_type: %', p_entity_type;
  end if;

  if p_entity_id is null or length(btrim(p_entity_id)) = 0 then
    raise exception 'entity_id is required';
  end if;

  if p_surface_type not in (
    'official_site',
    'wpn_eventlink',
    'event_calendar',
    'instagram',
    'facebook',
    'discord',
    'review',
    'other'
  ) then
    raise exception 'unsupported surface_type: %', p_surface_type;
  end if;

  if p_disposition not in (
    'inspected_current',
    'inspected_thin',
    'route_found_content_not_inspected',
    'blocked_gated',
    'unsafe_tbd',
    'not_found',
    'stale',
    'contradiction',
    'not_material'
  ) then
    raise exception 'unsupported disposition: %', p_disposition;
  end if;

  if p_checked_at is null then
    raise exception 'checked_at is required';
  end if;

  if p_summary is null or length(btrim(p_summary)) not between 1 and 2000 then
    raise exception 'summary must contain 1 to 2000 trimmed characters';
  end if;

  if p_materiality not in ('low', 'medium', 'high') then
    raise exception 'unsupported materiality: %', p_materiality;
  end if;

  if p_entity_type = 'venue'
     and not exists (select 1 from public.venues where id = p_entity_id) then
    raise exception 'unknown venue: %', p_entity_id;
  end if;

  if p_entity_type = 'community'
     and not exists (select 1 from public.communities where id = p_entity_id) then
    raise exception 'unknown community: %', p_entity_id;
  end if;

  select *
  into v_existing
  from public.entity_surface_coverage
  where idempotency_key = p_idempotency_key;

  if found then
    if v_existing.entity_type is distinct from p_entity_type
       or v_existing.entity_id is distinct from p_entity_id
       or v_existing.surface_type is distinct from p_surface_type
       or v_existing.disposition is distinct from p_disposition
       or v_existing.checked_at is distinct from p_checked_at
       or v_existing.summary is distinct from btrim(p_summary)
       or v_existing.source_id is distinct from p_source_id
       or v_existing.is_useful is distinct from p_is_useful
       or v_existing.materiality is distinct from p_materiality
       or v_existing.followup_item_id is distinct from p_followup_item_id then
      raise exception 'idempotency_key reused with different request';
    end if;

    return query
      select
        v_existing.id,
        'replayed'::text,
        false,
        ('surface-check:' || p_idempotency_key)::text;
    return;
  end if;

  if p_dry_run then
    return query
      select
        null::uuid,
        'validated'::text,
        false,
        null::text;
    return;
  end if;

  insert into public.entity_surface_coverage (
    entity_type,
    entity_id,
    surface_type,
    source_id,
    disposition,
    checked_at,
    is_useful,
    materiality,
    summary,
    followup_item_id,
    idempotency_key
  )
  values (
    p_entity_type,
    p_entity_id,
    p_surface_type,
    p_source_id,
    p_disposition,
    p_checked_at,
    p_is_useful,
    p_materiality,
    btrim(p_summary),
    p_followup_item_id,
    p_idempotency_key
  )
  returning id into v_coverage_id;

  v_change_id := 'surface-check:' || p_idempotency_key;

  insert into public.research_changes (
    id,
    detected_at,
    change_type,
    entity_type,
    entity_id,
    summary,
    review_status
  )
  values (
    v_change_id,
    p_checked_at,
    'surface_check',
    p_entity_type,
    p_entity_id,
    btrim(p_summary),
    'accepted'
  )
  on conflict (id) do nothing;

  return query
    select
      v_coverage_id,
      'inserted'::text,
      true,
      v_change_id;
end;
$$;

comment on function public.record_entity_surface_check(
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  text,
  text,
  boolean,
  text,
  uuid,
  boolean
) is
  'Typed, idempotent steward-only path for recording one surface check and one research change.';

revoke all on function public.record_entity_surface_check(
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  text,
  text,
  boolean,
  text,
  uuid,
  boolean
) from public;

revoke all on function public.record_entity_surface_check(
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  text,
  text,
  boolean,
  text,
  uuid,
  boolean
) from anon;

revoke all on function public.record_entity_surface_check(
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  text,
  text,
  boolean,
  text,
  uuid,
  boolean
) from authenticated;

grant execute on function public.record_entity_surface_check(
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  text,
  text,
  boolean,
  text,
  uuid,
  boolean
) to service_role;
