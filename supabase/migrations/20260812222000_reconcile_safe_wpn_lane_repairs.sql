create or replace function public.reconcile_safe_wpn_lane_repairs(
  p_ingest_run_id uuid,
  p_dry_run boolean default true
)
returns table (
  observation_id uuid,
  canonical_action text,
  series_id text,
  occurrence_id text,
  outcome text,
  wrote boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
begin
  if p_ingest_run_id is null then
    raise exception 'ingest run id is required';
  end if;

  create temp table if not exists pg_temp.safe_wpn_lane_repairs (
    observation_id uuid primary key,
    canonical_action text not null,
    series_id text not null,
    occurrence_id text,
    source_id text,
    source_family text not null,
    upstream_event_id text not null,
    source_url text,
    title text not null,
    format text,
    event_type text,
    occurrence_date date not null,
    start_time time,
    end_time time,
    fee_amount numeric,
    capacity integer,
    source_description text
  ) on commit drop;

  truncate table pg_temp.safe_wpn_lane_repairs;

  insert into pg_temp.safe_wpn_lane_repairs (
    observation_id,
    canonical_action,
    series_id,
    occurrence_id,
    source_id,
    source_family,
    upstream_event_id,
    source_url,
    title,
    format,
    event_type,
    occurrence_date,
    start_time,
    end_time,
    fee_amount,
    capacity,
    source_description
  )
  with base as (
    select
      eo.*
    from public.event_observations eo
    where eo.ingest_run_id = p_ingest_run_id
      and eo.source_family = 'wpn'
      and eo.promotion_eligibility = 'eligible'
      and eo.reconcile_state = 'pending'
      and eo.occurrence_date >= current_date
      and eo.venue_id is not null
      and eo.upstream_event_id is not null
  ),
  weekly_title_retime as (
    select
      b.id as observation_id,
      'exact_title_weekly_retime'::text as canonical_action,
      es.id as series_id,
      10 as action_rank
    from base b
    join public.event_series es
      on es.venue_id = b.venue_id
     and trim(regexp_replace(lower(es.title), '[^a-z0-9]+', ' ', 'g')) = b.normalized_title_key
     and es.recurrence ->> 'frequency' = 'weekly'
     and (es.recurrence ->> 'dayOfWeek')::int = extract(isodow from b.occurrence_date)::int
     and es.default_start_time is distinct from b.start_time
  ),
  weekly_commander_alias as (
    select
      b.id as observation_id,
      'same_lane_commander_alias'::text as canonical_action,
      es.id as series_id,
      20 as action_rank
    from base b
    join public.event_series es
      on es.venue_id = b.venue_id
     and es.recurrence ->> 'frequency' = 'weekly'
     and (es.recurrence ->> 'dayOfWeek')::int = extract(isodow from b.occurrence_date)::int
     and es.default_start_time is not distinct from b.start_time
    where (
        lower(coalesce(b.format, '')) = 'commander'
        or lower(coalesce(b.event_type, '')) in ('commander', 'casual')
      )
      and (
        lower(coalesce(es.format, '')) = 'commander'
        or lower(coalesce(es.event_type, '')) in ('commander', 'casual')
      )
      and b.normalized_title_key like '%commander%'
      and trim(regexp_replace(lower(es.title), '[^a-z0-9]+', ' ', 'g')) like '%commander%'
  ),
  finite_prerelease_variant as (
    select
      b.id as observation_id,
      'finite_prerelease_title_variant'::text as canonical_action,
      es.id as series_id,
      30 as action_rank
    from base b
    join public.event_series es
      on es.venue_id = b.venue_id
     and es.recurrence is null
     and lower(coalesce(es.event_type, '')) = 'prerelease'
     and b.occurrence_date between es.start_date and coalesce(es.end_date, es.start_date)
    where lower(coalesce(b.event_type, '')) = 'prerelease'
      and b.normalized_title_key like '%reality fracture%'
      and trim(regexp_replace(lower(es.title), '[^a-z0-9]+', ' ', 'g')) like '%reality fracture%'
  ),
  finite_exact_title_extension as (
    select
      b.id as observation_id,
      'finite_exact_title_extension'::text as canonical_action,
      es.id as series_id,
      25 as action_rank
    from base b
    join public.event_series es
      on es.venue_id = b.venue_id
     and es.recurrence is null
     and trim(regexp_replace(lower(es.title), '[^a-z0-9]+', ' ', 'g')) = b.normalized_title_key
     and lower(coalesce(es.event_type, '')) = lower(coalesce(b.event_type, ''))
     and lower(coalesce(es.format, '')) = lower(coalesce(nullif(replace(b.format, ' Deck', ''), ''), es.format, ''))
     and b.occurrence_date between es.start_date and (coalesce(es.end_date, es.start_date) + 1)
    where lower(coalesce(b.event_type, '')) in ('prerelease', 'draft', 'commander', 'constructed')
  ),
  candidates as (
    select * from weekly_title_retime
    union all
    select * from weekly_commander_alias
    union all
    select * from finite_exact_title_extension
    union all
    select * from finite_prerelease_variant
  ),
  single_match as (
    select
      c.*,
      count(*) over (partition by c.observation_id) as match_count
    from candidates c
  ),
  chosen as (
    select distinct on (sm.observation_id)
      sm.observation_id,
      sm.canonical_action,
      sm.series_id
    from single_match sm
    where sm.match_count = 1
    order by sm.observation_id, sm.action_rank
  )
  select
    b.id as observation_id,
    c.canonical_action,
    c.series_id,
    c.series_id || '-wpn-' || b.upstream_event_id as occurrence_id,
    b.source_id,
    b.source_family,
    b.upstream_event_id,
    b.source_url,
    b.title,
    b.format,
    b.event_type,
    b.occurrence_date,
    b.start_time,
    b.end_time,
    b.fee_amount,
    b.capacity,
    b.source_description
  from chosen c
  join base b on b.id = c.observation_id;

  if p_dry_run then
    return query
    select
      r.observation_id,
      r.canonical_action,
      r.series_id,
      r.occurrence_id,
      case
        when exists (
          select 1
          from public.event_source_bindings esb
          where esb.observation_id = r.observation_id
        ) then 'replayed'
        else 'validated'
      end as outcome,
      false as wrote
    from pg_temp.safe_wpn_lane_repairs r
    order by r.canonical_action, r.series_id, r.occurrence_date, r.start_time;
    return;
  end if;

  with rollup as (
    select
      r.series_id,
      min(r.occurrence_date) as first_date,
      max(r.occurrence_date) as last_date,
      min(r.start_time) filter (where r.canonical_action = 'exact_title_weekly_retime') as retime_start,
      bool_or(r.canonical_action = 'exact_title_weekly_retime') as should_retime
    from pg_temp.safe_wpn_lane_repairs r
    group by r.series_id
  )
  update public.event_series es
  set
    default_start_time = case
      when rollup.should_retime then rollup.retime_start
      else es.default_start_time
    end,
    recurrence = case
      when rollup.should_retime and es.recurrence is not null then
        jsonb_set(es.recurrence, '{startTime}', to_jsonb(to_char(rollup.retime_start, 'HH24:MI')), true)
      else es.recurrence
    end,
    start_date = least(coalesce(es.start_date, rollup.first_date), rollup.first_date),
    end_date = case
      when es.recurrence is null then greatest(coalesce(es.end_date, rollup.last_date), rollup.last_date)
      else es.end_date
    end,
    last_verified = current_date,
    updated_at = v_now
  from rollup
  where es.id = rollup.series_id;

  insert into public.event_occurrences (
    id,
    series_id,
    occurrence_date,
    start_time,
    end_time,
    evidence_state,
    occurrence_status,
    entry_fee,
    capacity,
    details,
    created_at,
    updated_at
  )
  select distinct on (r.series_id, r.occurrence_date, r.start_time)
    r.occurrence_id,
    r.series_id,
    r.occurrence_date,
    r.start_time,
    r.end_time,
    'single_source',
    'confirmed',
    r.fee_amount,
    r.capacity,
    r.source_description,
    v_now,
    v_now
  from pg_temp.safe_wpn_lane_repairs r
  order by r.series_id, r.occurrence_date, r.start_time, r.upstream_event_id
  on conflict on constraint event_occurrences_series_id_occurrence_date_start_time_key
  do update set
    end_time = coalesce(excluded.end_time, public.event_occurrences.end_time),
    evidence_state = excluded.evidence_state,
    occurrence_status = excluded.occurrence_status,
    entry_fee = coalesce(excluded.entry_fee, public.event_occurrences.entry_fee),
    capacity = coalesce(excluded.capacity, public.event_occurrences.capacity),
    details = coalesce(excluded.details, public.event_occurrences.details),
    updated_at = v_now;

  update pg_temp.safe_wpn_lane_repairs r
  set occurrence_id = eo.id
  from public.event_occurrences eo
  where eo.series_id = r.series_id
    and eo.occurrence_date = r.occurrence_date
    and eo.start_time is not distinct from r.start_time;

  insert into public.event_sources (
    source_id,
    occurrence_id,
    relationship,
    source_url,
    created_at
  )
  select distinct
    r.source_id,
    r.occurrence_id,
    'primary',
    r.source_url,
    v_now
  from pg_temp.safe_wpn_lane_repairs r
  where r.source_id is not null
  on conflict do nothing;

  insert into public.event_source_bindings (
    source_family,
    upstream_event_id,
    observation_id,
    series_id,
    occurrence_id,
    match_method,
    match_confidence,
    first_bound_at,
    last_verified_at,
    created_at,
    updated_at
  )
  select
    r.source_family,
    r.upstream_event_id,
    r.observation_id,
    r.series_id,
    r.occurrence_id,
    r.canonical_action,
    'high',
    v_now,
    v_now,
    v_now,
    v_now
  from pg_temp.safe_wpn_lane_repairs r
  on conflict (source_family, upstream_event_id)
  do update set
    observation_id = excluded.observation_id,
    series_id = excluded.series_id,
    occurrence_id = excluded.occurrence_id,
    match_method = excluded.match_method,
    match_confidence = excluded.match_confidence,
    last_verified_at = excluded.last_verified_at,
    updated_at = v_now;

  update public.event_observations eo
  set
    reconcile_state = 'bound',
    target_series_id = r.series_id,
    updated_at = v_now
  from pg_temp.safe_wpn_lane_repairs r
  where eo.id = r.observation_id;

  return query
  select
    r.observation_id,
    r.canonical_action,
    r.series_id,
    r.occurrence_id,
    case
      when exists (
        select 1
        from public.event_source_bindings esb
        where esb.observation_id = r.observation_id
      ) then 'applied'
      else 'validated'
    end as outcome,
    true as wrote
  from pg_temp.safe_wpn_lane_repairs r
  order by r.canonical_action, r.series_id, r.occurrence_date, r.start_time;
end;
$$;

revoke all on function public.reconcile_safe_wpn_lane_repairs(uuid, boolean) from public;
revoke all on function public.reconcile_safe_wpn_lane_repairs(uuid, boolean) from anon;
revoke all on function public.reconcile_safe_wpn_lane_repairs(uuid, boolean) from authenticated;
grant execute on function public.reconcile_safe_wpn_lane_repairs(uuid, boolean) to service_role;
