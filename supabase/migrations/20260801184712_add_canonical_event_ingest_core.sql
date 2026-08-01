create table public.event_ingest_runs (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  source_family text not null,
  adapter_version integer not null,
  input_fingerprint text not null,
  run_mode text not null check (run_mode in ('validation', 'live')),
  run_status text not null default 'started'
    check (run_status in ('started', 'staged', 'reconciled', 'failed')),
  started_at timestamptz not null default timezone('utc', now()),
  finished_at timestamptz,
  duration_ms integer,
  result_counts jsonb not null default '{}'::jsonb
    check (jsonb_typeof(result_counts) = 'object'),
  error_summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.event_observations (
  id uuid primary key default gen_random_uuid(),
  ingest_run_id uuid not null references public.event_ingest_runs(id) on delete restrict,
  first_ingest_run_id uuid not null references public.event_ingest_runs(id) on delete restrict,
  source_family text not null,
  source_id text references public.sources(id) on delete restrict,
  source_type text not null,
  publisher_key text,
  upstream_event_id text not null,
  source_url text,
  source_artifact_id uuid references public.source_artifacts(id) on delete set null,
  observed_at timestamptz not null,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  content_fingerprint text not null,
  identity_fingerprint text not null,
  extraction_method text not null,
  extraction_confidence text not null
    check (extraction_confidence in ('low', 'medium', 'high', 'exact')),
  organizer_type text check (organizer_type is null or organizer_type in ('venue', 'community')),
  organizer_id text,
  organizer_name text,
  venue_id text references public.venues(id) on delete restrict,
  physical_location_text text,
  venue_match_method text,
  venue_match_confidence text,
  attribution_state text not null
    check (attribution_state in ('official_venue_programming', 'community_organized', 'unknown')),
  title text not null,
  normalized_title_key text not null,
  format text,
  event_type text,
  occurrence_date date not null,
  start_time time,
  end_time time,
  source_timezone text,
  series_hint_key text,
  template_hint_key text,
  source_status text,
  fee_amount numeric check (fee_amount is null or fee_amount >= 0),
  fee_currency text,
  capacity integer check (capacity is null or capacity > 0),
  team_size integer check (team_size is null or team_size > 0),
  registration_url text,
  registration_status text,
  bracket text,
  proxy_policy text check (proxy_policy is null or proxy_policy in ('allowed', 'prohibited', 'unspecified')),
  rules_enforcement_level text,
  product_or_set_id text,
  source_description text,
  field_presence jsonb not null default '{}'::jsonb
    check (jsonb_typeof(field_presence) = 'object'),
  source_native_payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(source_native_payload) = 'object'),
  promotion_eligibility text not null,
  reconcile_state text not null default 'pending'
    check (reconcile_state in ('pending', 'bound', 'held', 'ignored')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (source_family, upstream_event_id)
);

create table public.event_source_bindings (
  id uuid primary key default gen_random_uuid(),
  source_family text not null,
  upstream_event_id text not null,
  observation_id uuid not null references public.event_observations(id) on delete cascade,
  series_id text references public.event_series(id) on delete cascade,
  occurrence_id text references public.event_occurrences(id) on delete cascade,
  match_method text not null,
  match_confidence text not null check (match_confidence in ('exact', 'high', 'medium', 'low')),
  first_bound_at timestamptz not null default timezone('utc', now()),
  last_verified_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (source_family, upstream_event_id),
  check (series_id is not null or occurrence_id is not null)
);

create index event_observations_run_idx on public.event_observations(ingest_run_id);
create index event_observations_venue_schedule_idx
  on public.event_observations(venue_id, occurrence_date, start_time);
create index event_observations_series_hint_idx on public.event_observations(series_hint_key);
create index event_source_bindings_series_idx on public.event_source_bindings(series_id);
create index event_source_bindings_occurrence_idx on public.event_source_bindings(occurrence_id);

create trigger event_ingest_runs_set_updated_at before update on public.event_ingest_runs
for each row execute function public.set_updated_at();
create trigger event_observations_set_updated_at before update on public.event_observations
for each row execute function public.set_updated_at();
create trigger event_source_bindings_set_updated_at before update on public.event_source_bindings
for each row execute function public.set_updated_at();

alter table public.event_ingest_runs enable row level security;
alter table public.event_observations enable row level security;
alter table public.event_source_bindings enable row level security;

revoke all on table public.event_ingest_runs from public, anon, authenticated;
revoke all on table public.event_observations from public, anon, authenticated;
revoke all on table public.event_source_bindings from public, anon, authenticated;
grant all on table public.event_ingest_runs to service_role;
grant all on table public.event_observations to service_role;
grant all on table public.event_source_bindings to service_role;

comment on table public.event_ingest_runs is
  'Service-only compact operational ledger for source-neutral event ingest attempts.';
comment on table public.event_observations is
  'Service-only normalized source observations awaiting or supporting canonical event reconciliation.';
comment on table public.event_source_bindings is
  'Service-only durable bindings from stable upstream event identities to canonical series/occurrences.';

create or replace function public.normalize_event_identity_text(p_value text)
returns text
language sql
immutable
parallel safe
set search_path = public, pg_temp
as $$
  select trim(regexp_replace(lower(coalesce(p_value, '')), '[^a-z0-9]+', ' ', 'g'))
$$;

revoke all on function public.normalize_event_identity_text(text) from public, anon, authenticated;
grant execute on function public.normalize_event_identity_text(text) to service_role;

create or replace function public.stage_wpn_event_observations(
  p_cache_id text,
  p_idempotency_key text,
  p_run_mode text default 'validation'
)
returns table(
  ingest_run_id uuid,
  outcome text,
  inserted_count integer,
  refreshed_count integer,
  eligible_count integer,
  held_count integer
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_cache public.wpn_snapshot_cache%rowtype;
  v_run public.event_ingest_runs%rowtype;
  v_started timestamptz := clock_timestamp();
  v_inserted integer := 0;
  v_refreshed integer := 0;
  v_eligible integer := 0;
  v_held integer := 0;
begin
  if p_run_mode not in ('validation', 'live') then
    raise exception 'unsupported run mode: %', p_run_mode;
  end if;

  select * into v_cache from public.wpn_snapshot_cache where id = p_cache_id;
  if not found then
    raise exception 'unknown WPN cache: %', p_cache_id;
  end if;

  select * into v_run from public.event_ingest_runs where idempotency_key = p_idempotency_key;
  if found then
    return query select v_run.id, 'replayed'::text,
      coalesce((v_run.result_counts->>'inserted')::integer, 0),
      coalesce((v_run.result_counts->>'refreshed')::integer, 0),
      coalesce((v_run.result_counts->>'eligible')::integer, 0),
      coalesce((v_run.result_counts->>'held')::integer, 0);
    return;
  end if;

  insert into public.event_ingest_runs (
    idempotency_key, source_family, adapter_version, input_fingerprint, run_mode
  ) values (
    p_idempotency_key, 'wpn', 3, v_cache.content_sha256, p_run_mode
  ) returning * into v_run;

  with prepared as (
    select
      e,
      e->>'sourceEventId' as upstream_event_id,
      nullif(e->>'canonicalVenueId', '') as venue_id,
      nullif(e->>'sourceOrganizationId', '') as organization_id,
      ('src-wpn-' || (e->>'sourceOrganizationId')) as source_id,
      (e->>'localStartDate')::date as occurrence_date,
      nullif(e->>'localStartTime', '')::time as start_time,
      case
        when coalesce((e->'rulesFlags'->>'explicitNoProxy')::boolean, false) then 'prohibited'
        when coalesce((e->'rulesFlags'->>'explicitProxyAllowed')::boolean, false) then 'allowed'
        else 'unspecified'
      end as proxy_policy
    from jsonb_array_elements(v_cache.enriched_events) e
    where nullif(e->>'sourceEventId', '') is not null
      and nullif(e->>'localStartDate', '') is not null
      and nullif(e->>'canonicalVenueId', '') is not null
  ), upserted as (
    insert into public.event_observations (
      ingest_run_id, first_ingest_run_id, source_family, source_id, source_type,
      publisher_key, upstream_event_id, source_url, observed_at, first_seen_at,
      last_seen_at, content_fingerprint, identity_fingerprint, extraction_method,
      extraction_confidence, organizer_type, organizer_id, organizer_name,
      venue_id, physical_location_text, venue_match_method,
      venue_match_confidence, attribution_state, title, normalized_title_key,
      format, event_type, occurrence_date, start_time, source_timezone,
      series_hint_key, template_hint_key, source_status, fee_amount, fee_currency,
      capacity, team_size, bracket, proxy_policy, rules_enforcement_level,
      product_or_set_id, source_description, field_presence,
      source_native_payload, promotion_eligibility
    )
    select
      v_run.id, v_run.id, 'wpn', p.source_id, 'wpn',
      'wpn:' || p.organization_id, p.upstream_event_id,
      nullif(p.e->>'sourceEventUrl', ''), v_cache.retrieved_at,
      v_cache.retrieved_at, v_cache.retrieved_at,
      p.e->>'eventContentFingerprint', p.e->>'eventIdentityFingerprint',
      'wpn_adapter_v3', 'exact', 'venue', p.venue_id,
      p.e->'organization'->>'name', p.venue_id,
      p.e->'organization'->>'postalAddress', p.e->>'venueMatchMethod',
      p.e->>'venueMatchConfidence', 'official_venue_programming',
      p.e->>'title', p.e->>'normalizedTitleKey',
      p.e->'eventFormat'->>'name',
      case
        when coalesce((p.e->>'isPrerelease')::boolean, false) then 'prerelease'
        when coalesce((p.e->>'isDraft')::boolean, false) then 'draft'
        when coalesce((p.e->>'isCommander')::boolean, false) then 'commander'
        else null
      end,
      p.occurrence_date, p.start_time, p.e->>'timeZone',
      nullif(p.e->>'sourceSeriesHintKey', ''),
      nullif(p.e->>'sourceTemplateHintKey', ''), p.e->>'status',
      nullif(p.e->>'entryFeeValue', '')::numeric,
      nullif(p.e->>'entryFeeCurrency', ''),
      nullif(p.e->>'capacity', '')::integer,
      nullif(p.e->>'requiredTeamSize', '')::integer,
      null, p.proxy_policy, nullif(p.e->>'rulesEnforcementLevel', ''),
      nullif(p.e->'cardSet'->>'id', ''), nullif(p.e->>'description', ''),
      coalesce(p.e->'fieldPresence', '{}'::jsonb), p.e,
      coalesce(nullif(p.e->>'promotionEligibility', ''), 'unknown')
    from prepared p
    join public.venues v on v.id = p.venue_id
    left join public.sources s on s.id = p.source_id
    where s.id is not null
    on conflict (source_family, upstream_event_id) do update set
      ingest_run_id = excluded.ingest_run_id,
      source_id = excluded.source_id,
      source_url = excluded.source_url,
      observed_at = excluded.observed_at,
      last_seen_at = excluded.last_seen_at,
      content_fingerprint = excluded.content_fingerprint,
      identity_fingerprint = excluded.identity_fingerprint,
      venue_id = excluded.venue_id,
      physical_location_text = excluded.physical_location_text,
      venue_match_method = excluded.venue_match_method,
      venue_match_confidence = excluded.venue_match_confidence,
      title = excluded.title,
      normalized_title_key = excluded.normalized_title_key,
      format = excluded.format,
      event_type = excluded.event_type,
      occurrence_date = excluded.occurrence_date,
      start_time = excluded.start_time,
      source_timezone = excluded.source_timezone,
      series_hint_key = excluded.series_hint_key,
      template_hint_key = excluded.template_hint_key,
      source_status = excluded.source_status,
      fee_amount = excluded.fee_amount,
      fee_currency = excluded.fee_currency,
      capacity = excluded.capacity,
      team_size = excluded.team_size,
      proxy_policy = excluded.proxy_policy,
      rules_enforcement_level = excluded.rules_enforcement_level,
      product_or_set_id = excluded.product_or_set_id,
      source_description = excluded.source_description,
      field_presence = excluded.field_presence,
      source_native_payload = excluded.source_native_payload,
      promotion_eligibility = excluded.promotion_eligibility
    returning (xmax = 0) as inserted
  )
  select count(*) filter (where inserted), count(*) filter (where not inserted)
  into v_inserted, v_refreshed from upserted;

  select
    count(*) filter (where promotion_eligibility = 'eligible'),
    count(*) filter (where promotion_eligibility <> 'eligible')
  into v_eligible, v_held
  from public.event_observations o where o.ingest_run_id = v_run.id;

  update public.event_ingest_runs set
    run_status = 'staged', finished_at = clock_timestamp(),
    duration_ms = (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer,
    result_counts = jsonb_build_object(
      'inserted', v_inserted, 'refreshed', v_refreshed,
      'eligible', v_eligible, 'held', v_held
    )
  where id = v_run.id;

  return query select v_run.id, 'staged'::text,
    v_inserted, v_refreshed, v_eligible, v_held;
exception when others then
  if v_run.id is not null then
    update public.event_ingest_runs set
      run_status = 'failed', finished_at = clock_timestamp(),
      duration_ms = (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer,
      error_summary = left(sqlerrm, 500)
    where id = v_run.id;
  end if;
  raise;
end;
$$;

revoke all on function public.stage_wpn_event_observations(text, text, text)
  from public, anon, authenticated;
grant execute on function public.stage_wpn_event_observations(text, text, text)
  to service_role;

create or replace function public.preview_event_ingest_reconciliation(p_ingest_run_id uuid)
returns table(
  canonical_action text,
  observation_count bigint,
  family_count bigint,
  hidden_by_rule_count bigint
)
language sql
security invoker
set search_path = public, pg_temp
as $$
  with candidates as (
    select
      o.*,
      b.id as binding_id,
      (
        select count(*)
        from public.event_occurrences eo
        join public.event_series es on es.id = eo.series_id
        where es.venue_id = o.venue_id
          and eo.occurrence_date = o.occurrence_date
          and eo.start_time is not distinct from o.start_time
          and public.normalize_event_identity_text(es.title) = o.normalized_title_key
      ) as exact_occurrence_count,
      (
        select count(*)
        from public.event_series es
        where es.venue_id = o.venue_id
          and es.recurrence->>'frequency' = 'weekly'
          and (es.recurrence->>'dayOfWeek')::integer = extract(dow from o.occurrence_date)::integer
          and es.default_start_time is not distinct from o.start_time
          and public.normalize_event_identity_text(es.title) = o.normalized_title_key
          and (es.start_date is null or es.start_date <= o.occurrence_date)
          and (es.end_date is null or es.end_date >= o.occurrence_date)
      ) as exact_recurring_count,
      (
        select count(*)
        from public.event_series es
        where es.venue_id = o.venue_id
          and (
            es.recurrence is null
            or es.recurrence->>'dayOfWeek' is null
            or coalesce(es.default_start_time::text, es.recurrence->>'startTime') is null
          )
          and public.normalize_event_identity_text(es.title) = o.normalized_title_key
          and (es.start_date is null or es.start_date <= o.occurrence_date)
          and (es.end_date is null or es.end_date >= o.occurrence_date)
      ) as exact_finite_count,
      exists (
        select 1 from public.event_series es
        where es.venue_id = o.venue_id
          and public.normalize_event_identity_text(es.title) = o.normalized_title_key
      ) as known_title,
      (
        select count(*)
        from (
          select es.id
          from public.event_occurrences eo
          join public.event_series es on es.id = eo.series_id
          where es.venue_id = o.venue_id
            and eo.occurrence_date = o.occurrence_date
            and eo.start_time is not distinct from o.start_time
          union
          select es.id
          from public.event_series es
          where es.venue_id = o.venue_id
            and es.recurrence->>'frequency' = 'weekly'
            and (es.recurrence->>'dayOfWeek')::integer = extract(dow from o.occurrence_date)::integer
            and es.default_start_time is not distinct from o.start_time
        ) slot_matches
      ) as same_slot_or_lane_count,
      exists (
        select 1 from public.entity_preferences ep
        where ep.entity_type = 'venue' and ep.entity_id = o.venue_id
          and ep.visibility_preference = 'deprioritize'
      ) or o.proxy_policy = 'prohibited' as hidden_by_rule
    from public.event_observations o
    left join public.event_source_bindings b
      on b.source_family = o.source_family
     and b.upstream_event_id = o.upstream_event_id
    where o.ingest_run_id = p_ingest_run_id
  ), classified as (
    select *, case
      when promotion_eligibility <> 'eligible' then 'hold_ineligible'
      when binding_id is not null then 'existing_binding'
      when exact_occurrence_count > 1 or exact_recurring_count > 1 or exact_finite_count > 1
        then 'hold_ambiguous_exact_match'
      when exact_occurrence_count = 1 then 'bind_exact_occurrence'
      when exact_recurring_count = 1 then 'add_occurrence_to_recurring_series'
      when exact_finite_count = 1 then 'add_occurrence_to_finite_series'
      when known_title then 'known_title_other_schedule'
      when same_slot_or_lane_count > 0 then 'safe_split_same_slot_title'
      else 'create_series_and_occurrence'
    end as action
    from candidates
  )
  select action, count(*), count(distinct coalesce(template_hint_key, series_hint_key, identity_fingerprint)),
    count(*) filter (where hidden_by_rule)
  from classified
  group by action
  order by action
$$;

revoke all on function public.preview_event_ingest_reconciliation(uuid)
  from public, anon, authenticated;
grant execute on function public.preview_event_ingest_reconciliation(uuid)
  to service_role;
