create or replace function public.reconcile_targeted_recurring_observations(
  p_ingest_run_id uuid,
  p_dry_run boolean default true
)
returns table(
  observation_id uuid,
  canonical_action text,
  series_id text,
  occurrence_id text,
  hidden_by_rule boolean,
  outcome text,
  wrote boolean
)
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not exists (
    select 1 from public.event_ingest_runs r where r.id = p_ingest_run_id
  ) then
    raise exception 'unknown ingest run: %', p_ingest_run_id;
  end if;

  drop table if exists pg_temp.targeted_reconciliation;
  create temporary table targeted_reconciliation on commit drop as
  select
    o.id as observation_id,
    case
      when o.target_series_id is null then null::text
      when es.id is null then 'invalid_target_missing_series'
      when es.venue_id is distinct from o.venue_id then 'invalid_target_wrong_venue'
      when es.recurrence is null then 'invalid_target_non_recurring_series'
      when b.id is not null then 'existing_binding'
      when eo.id is not null then 'bind_target_occurrence'
      else 'add_occurrence_to_target_series'
    end as canonical_action,
    o.target_series_id as series_id,
    coalesce(b.occurrence_id, eo.id) as occurrence_id,
    exists (
      select 1 from public.entity_preferences ep
      where ep.entity_type = 'venue' and ep.entity_id = o.venue_id
        and ep.visibility_preference in ('deprioritize', 'hide')
    ) or o.proxy_policy = 'prohibited' as hidden_by_rule,
    o.upstream_event_id,
    o.source_family,
    o.source_id,
    o.occurrence_date,
    o.start_time,
    o.end_time,
    o.fee_amount,
    o.capacity,
    o.source_description,
    (b.id is not null) as already_bound,
    (
      o.target_series_id is not null
      and (
        es.id is null
        or es.venue_id is distinct from o.venue_id
        or es.recurrence is null
      )
    ) as invalid_target
  from public.event_observations o
  left join public.event_series es on es.id = o.target_series_id
  left join public.event_source_bindings b
    on b.source_family = o.source_family
   and b.upstream_event_id = o.upstream_event_id
  left join public.event_occurrences eo
    on eo.series_id = o.target_series_id
   and eo.occurrence_date = o.occurrence_date
   and eo.start_time is not distinct from o.start_time
  where o.ingest_run_id = p_ingest_run_id
    and o.target_series_id is not null;

  if p_dry_run then
    return query
    select
      t.observation_id,
      t.canonical_action,
      t.series_id,
      t.occurrence_id,
      t.hidden_by_rule,
      case
        when t.invalid_target then 'invalid_target'
        when t.already_bound then 'replayed'
        else 'validated'
      end::text,
      false
    from targeted_reconciliation t
    order by t.observation_id;
    return;
  end if;

  insert into public.event_occurrences (
    id, series_id, occurrence_date, start_time, end_time, evidence_state,
    occurrence_status, entry_fee, capacity, details
  )
  select
    t.series_id || '-' || t.source_family || '-' || md5(t.upstream_event_id),
    t.series_id, t.occurrence_date, t.start_time, t.end_time,
    'single_source', 'confirmed', t.fee_amount, t.capacity,
    t.source_description
  from targeted_reconciliation t
  where t.canonical_action = 'add_occurrence_to_target_series'
    and not t.already_bound
    and not t.invalid_target
  on conflict on constraint event_occurrences_series_id_occurrence_date_start_time_key
  do update set
    end_time = coalesce(public.event_occurrences.end_time, excluded.end_time),
    entry_fee = coalesce(public.event_occurrences.entry_fee, excluded.entry_fee),
    capacity = coalesce(public.event_occurrences.capacity, excluded.capacity),
    details = coalesce(public.event_occurrences.details, excluded.details);

  update targeted_reconciliation t set occurrence_id = eo.id
  from public.event_occurrences eo
  where eo.series_id = t.series_id
    and eo.occurrence_date = t.occurrence_date
    and eo.start_time is not distinct from t.start_time
    and not t.invalid_target;

  insert into public.event_sources (source_id, occurrence_id, relationship)
  select t.source_id, t.occurrence_id, 'schedule'
  from targeted_reconciliation t
  where t.source_id is not null and t.occurrence_id is not null
    and not t.already_bound
    and not t.invalid_target
    and not exists (
      select 1 from public.event_sources es
      where es.source_id = t.source_id and es.occurrence_id = t.occurrence_id
    );

  insert into public.event_source_bindings (
    source_family, upstream_event_id, observation_id, series_id, occurrence_id,
    match_method, match_confidence
  )
  select t.source_family, t.upstream_event_id, t.observation_id, t.series_id,
    t.occurrence_id, t.canonical_action, 'exact'
  from targeted_reconciliation t
  where not t.already_bound
    and not t.invalid_target
  on conflict (source_family, upstream_event_id) do update set
    observation_id = excluded.observation_id,
    series_id = excluded.series_id,
    occurrence_id = excluded.occurrence_id,
    match_method = excluded.match_method,
    match_confidence = excluded.match_confidence,
    last_verified_at = timezone('utc', now());

  update public.event_observations o
  set reconcile_state = 'bound'
  from targeted_reconciliation t
  where o.id = t.observation_id
    and not t.already_bound
    and not t.invalid_target;

  return query
  select
    t.observation_id,
    t.canonical_action,
    t.series_id,
    t.occurrence_id,
    t.hidden_by_rule,
    case
      when t.invalid_target then 'invalid_target'
      when t.already_bound then 'replayed'
      else 'applied'
    end::text,
    (not t.already_bound and not t.invalid_target)
  from targeted_reconciliation t
  order by t.observation_id;
end;
$function$;
