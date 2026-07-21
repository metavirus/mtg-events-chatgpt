create table if not exists public.coordination_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  origin text not null check (
    origin in ('user', 'chatgpt', 'codex', 'steward', 'automation')
  ),
  target text not null check (
    target in ('user', 'chatgpt', 'codex', 'steward', 'shared')
  ),
  item_type text not null check (
    item_type in (
      'assignment', 'research_finding', 'source_lead', 'correction',
      'question', 'proposal', 'status_update', 'app_issue', 'handoff'
    )
  ),
  status text not null default 'new' check (
    status in (
      'new', 'acknowledged', 'in_progress', 'needs_clarification',
      'ready_for_review', 'accepted', 'rejected', 'deferred',
      'superseded', 'completed'
    )
  ),
  priority smallint not null default 50 check (priority between 0 and 100),
  title text not null check (char_length(title) between 1 and 240),
  summary text not null check (char_length(summary) between 1 and 6000),
  details jsonb not null default '{}'::jsonb check (
    jsonb_typeof(details) = 'object'
    and pg_column_size(details) <= 32768
  ),
  related_entity_type text check (
    related_entity_type is null
    or related_entity_type in (
      'venue', 'event_series', 'event_occurrence', 'community', 'source',
      'signal', 'research_change', 'app', 'other'
    )
  ),
  related_entity_id text check (
    related_entity_id is null or char_length(related_entity_id) between 1 and 240
  ),
  confidence numeric(3,2) check (confidence is null or confidence between 0 and 1),
  observed_at timestamptz,
  effective_date date,
  recommended_action text check (
    recommended_action is null or char_length(recommended_action) <= 4000
  ),
  parent_item_id uuid references public.coordination_items(id),
  assigned_at timestamptz,
  acknowledged_at timestamptz,
  disposition_at timestamptz,
  completed_at timestamptz,
  disposition text check (
    disposition is null
    or disposition in ('accepted', 'rejected', 'deferred', 'superseded', 'completed')
  ),
  disposition_reason text check (
    disposition_reason is null or char_length(disposition_reason) <= 6000
  ),
  deduplication_key text unique check (
    deduplication_key is null
    or char_length(deduplication_key) between 1 and 240
  ),
  check (
    (related_entity_type is null and related_entity_id is null)
    or (related_entity_type is not null and related_entity_id is not null)
  )
);

comment on table public.coordination_items is
  'Non-canonical ChatGPT-Codex intake queue. Queue contents require steward review before canonical promotion.';

create table if not exists public.coordination_sources (
  id uuid primary key default gen_random_uuid(),
  coordination_item_id uuid not null references public.coordination_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by text not null check (
    created_by in ('user', 'chatgpt', 'codex', 'steward', 'automation')
  ),
  url text not null check (char_length(url) between 1 and 4000),
  source_modality text not null check (
    source_modality in (
      'official_website', 'social', 'discord', 'wpn', 'event_platform',
      'review', 'marketplace', 'news', 'directory', 'user_supplied', 'other'
    )
  ),
  publisher_identity text check (
    publisher_identity is null or char_length(publisher_identity) <= 500
  ),
  observed_at timestamptz,
  published_at timestamptz,
  accessed_at timestamptz not null default now(),
  supported_claim text not null check (char_length(supported_claim) between 1 and 6000),
  inspection_status text not null check (
    inspection_status in ('inspected', 'discovered_only', 'inaccessible', 'unverified')
  ),
  freshness text not null default 'unknown' check (
    freshness in ('current', 'stale', 'historical', 'unknown')
  ),
  entity_caveat text check (
    entity_caveat is null or char_length(entity_caveat) <= 4000
  ),
  quoted_fragment text check (
    quoted_fragment is null or char_length(quoted_fragment) <= 1200
  )
);

comment on table public.coordination_sources is
  'Source evidence attached to non-canonical coordination intake items.';

create table if not exists public.coordination_activity (
  id uuid primary key default gen_random_uuid(),
  coordination_item_id uuid not null references public.coordination_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  actor text not null check (
    actor in ('user', 'chatgpt', 'codex', 'steward', 'automation')
  ),
  activity_type text not null check (
    activity_type in (
      'created', 'acknowledged', 'status_changed', 'clarification_question',
      'answer', 'note', 'disposition', 'completed'
    )
  ),
  from_status text,
  to_status text,
  message text check (message is null or char_length(message) <= 6000),
  details jsonb not null default '{}'::jsonb check (
    jsonb_typeof(details) = 'object'
    and pg_column_size(details) <= 16384
  )
);

comment on table public.coordination_activity is
  'Append-only lifecycle history for non-canonical coordination items.';

create index if not exists coordination_items_target_status_priority_idx
  on public.coordination_items (target, status, priority desc, created_at);
create index if not exists coordination_items_parent_idx
  on public.coordination_items (parent_item_id, created_at);
create index if not exists coordination_sources_item_idx
  on public.coordination_sources (coordination_item_id, created_at);
create index if not exists coordination_activity_item_idx
  on public.coordination_activity (coordination_item_id, created_at);

drop trigger if exists coordination_items_set_updated_at on public.coordination_items;
create trigger coordination_items_set_updated_at
before update on public.coordination_items
for each row execute function public.set_updated_at();

alter table public.coordination_items enable row level security;
alter table public.coordination_sources enable row level security;
alter table public.coordination_activity enable row level security;

revoke all on table public.coordination_items from public, anon, authenticated;
revoke all on table public.coordination_sources from public, anon, authenticated;
revoke all on table public.coordination_activity from public, anon, authenticated;
grant select, insert, update on table public.coordination_items to service_role;
grant select, insert on table public.coordination_sources to service_role;
grant select, insert on table public.coordination_activity to service_role;

create or replace function public.submit_coordination_item(
  p_origin text,
  p_target text,
  p_item_type text,
  p_title text,
  p_summary text,
  p_details jsonb default '{}'::jsonb,
  p_sources jsonb default '[]'::jsonb,
  p_priority smallint default 50,
  p_status text default 'ready_for_review',
  p_related_entity_type text default null,
  p_related_entity_id text default null,
  p_confidence numeric default null,
  p_observed_at timestamptz default null,
  p_effective_date date default null,
  p_recommended_action text default null,
  p_parent_item_id uuid default null,
  p_deduplication_key text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_item_id uuid;
  v_source jsonb;
  v_source_keys text[] := array[
    'url', 'source_modality', 'publisher_identity', 'observed_at',
    'published_at', 'accessed_at', 'supported_claim', 'inspection_status',
    'freshness', 'entity_caveat', 'quoted_fragment'
  ];
begin
  if p_origin not in ('user', 'chatgpt', 'codex', 'steward', 'automation') then
    raise exception 'invalid origin';
  end if;
  if p_target not in ('user', 'chatgpt', 'codex', 'steward', 'shared') then
    raise exception 'invalid target';
  end if;
  if p_item_type not in (
    'assignment', 'research_finding', 'source_lead', 'correction',
    'question', 'proposal', 'status_update', 'app_issue', 'handoff'
  ) then
    raise exception 'invalid item type';
  end if;
  if p_status not in (
    'new', 'acknowledged', 'in_progress', 'needs_clarification',
    'ready_for_review', 'accepted', 'rejected', 'deferred',
    'superseded', 'completed'
  ) then
    raise exception 'invalid status';
  end if;
  if p_priority not between 0 and 100 then
    raise exception 'invalid priority';
  end if;
  if p_details is null or jsonb_typeof(p_details) <> 'object'
     or pg_column_size(p_details) > 32768 then
    raise exception 'invalid details';
  end if;
  if p_sources is null or jsonb_typeof(p_sources) <> 'array'
     or jsonb_array_length(p_sources) > 20
     or pg_column_size(p_sources) > 65536 then
    raise exception 'invalid sources';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_sources) as source(value)
    where jsonb_typeof(source.value) <> 'object'
       or exists (
         select 1
         from jsonb_object_keys(source.value) as key(name)
         where not (key.name = any(v_source_keys))
       )
  ) then
    raise exception 'invalid source fields';
  end if;

  insert into public.coordination_items (
    origin, target, item_type, status, priority, title, summary, details,
    related_entity_type, related_entity_id, confidence, observed_at,
    effective_date, recommended_action, parent_item_id, deduplication_key,
    assigned_at
  ) values (
    p_origin, p_target, p_item_type, p_status, p_priority, p_title, p_summary,
    p_details, p_related_entity_type, p_related_entity_id, p_confidence,
    p_observed_at, p_effective_date, p_recommended_action, p_parent_item_id,
    p_deduplication_key,
    case when p_item_type = 'assignment' then now() else null end
  ) returning id into v_item_id;

  insert into public.coordination_activity (
    coordination_item_id, actor, activity_type, to_status, message
  ) values (
    v_item_id, p_origin, 'created', p_status, 'Coordination item created.'
  );

  for v_source in select value from jsonb_array_elements(p_sources)
  loop
    insert into public.coordination_sources (
      coordination_item_id, created_by, url, source_modality,
      publisher_identity, observed_at, published_at, accessed_at,
      supported_claim, inspection_status, freshness, entity_caveat,
      quoted_fragment
    ) values (
      v_item_id,
      p_origin,
      v_source->>'url',
      coalesce(v_source->>'source_modality', 'other'),
      nullif(v_source->>'publisher_identity', ''),
      nullif(v_source->>'observed_at', '')::timestamptz,
      nullif(v_source->>'published_at', '')::timestamptz,
      coalesce(nullif(v_source->>'accessed_at', '')::timestamptz, now()),
      v_source->>'supported_claim',
      coalesce(v_source->>'inspection_status', 'inspected'),
      coalesce(v_source->>'freshness', 'unknown'),
      nullif(v_source->>'entity_caveat', ''),
      nullif(v_source->>'quoted_fragment', '')
    );
  end loop;

  return v_item_id;
end;
$$;

comment on function public.submit_coordination_item is
  'Validated intake helper for non-canonical coordination items and attached source evidence.';

revoke all on function public.submit_coordination_item(
  text, text, text, text, text, jsonb, jsonb, smallint, text, text, text,
  numeric, timestamptz, date, text, uuid, text
) from public, anon, authenticated;
grant execute on function public.submit_coordination_item(
  text, text, text, text, text, jsonb, jsonb, smallint, text, text, text,
  numeric, timestamptz, date, text, uuid, text
) to service_role;

