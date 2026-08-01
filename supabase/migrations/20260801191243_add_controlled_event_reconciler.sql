create or replace function public.reconcile_event_ingest_run(
  p_ingest_run_id uuid,
  p_observation_ids uuid[],
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
security invoker
set search_path = public, pg_temp
as $$
declare
  v_requested integer;
  v_selected integer;
  v_unsupported integer;
  v_written integer := 0;
begin
  if p_observation_ids is null or cardinality(p_observation_ids) = 0 then
    raise exception 'at least one observation ID is required';
  end if;

  if not exists (select 1 from public.event_ingest_runs r where r.id = p_ingest_run_id) then
    raise exception 'unknown ingest run: %', p_ingest_run_id;
  end if;

  select count(distinct value) into v_requested from unnest(p_observation_ids) value;

  drop table if exists pg_temp.selected_reconciliation;
  create temporary table selected_reconciliation on commit drop as
  with selected as (
    select o.*,
      exists (
        select 1 from public.entity_preferences ep
        where ep.entity_type = 'venue' and ep.entity_id = o.venue_id
          and ep.visibility_preference in ('deprioritize', 'hide')
      ) or o.proxy_policy = 'prohibited' as inherited_hidden
    from public.event_observations o
    where o.ingest_run_id = p_ingest_run_id
      and o.id = any(p_observation_ids)
  ), matched as (
    select s.*,
      exact.occurrence_ids,
      recurring.series_ids
    from selected s
    left join lateral (
      select array_agg(eo.id order by eo.id) occurrence_ids
      from public.event_occurrences eo
      join public.event_series es on es.id = eo.series_id
      where es.venue_id = s.venue_id
        and eo.occurrence_date = s.occurrence_date
        and eo.start_time is not distinct from s.start_time
        and public.normalize_event_identity_text(es.title) = s.normalized_title_key
    ) exact on true
    left join lateral (
      select array_agg(es.id order by es.id) series_ids
      from public.event_series es
      where es.venue_id = s.venue_id
        and es.recurrence->>'frequency' = 'weekly'
        and (es.recurrence->>'dayOfWeek')::integer = extract(dow from s.occurrence_date)::integer
        and es.default_start_time is not distinct from s.start_time
        and public.normalize_event_identity_text(es.title) = s.normalized_title_key
        and (es.start_date is null or es.start_date <= s.occurrence_date)
        and (es.end_date is null or es.end_date >= s.occurrence_date)
    ) recurring on true
  )
  select
    m.id as observation_id,
    case
      when m.promotion_eligibility <> 'eligible' then 'hold_ineligible'
      when cardinality(m.occurrence_ids) > 1 or cardinality(m.series_ids) > 1
        then 'hold_ambiguous_exact_match'
      when cardinality(m.occurrence_ids) = 1 then 'bind_exact_occurrence'
      when cardinality(m.series_ids) = 1 then 'add_occurrence_to_recurring_series'
      else 'unsupported_for_controlled_run'
    end as canonical_action,
    case
      when cardinality(m.occurrence_ids) = 1 then (
        select eo.series_id from public.event_occurrences eo
        where eo.id = m.occurrence_ids[1]
      )
      when cardinality(m.series_ids) = 1 then m.series_ids[1]
      else null
    end as series_id,
    case when cardinality(m.occurrence_ids) = 1 then m.occurrence_ids[1] else null end
      as occurrence_id,
    m.inherited_hidden as hidden_by_rule,
    m.upstream_event_id,
    m.source_family,
    m.source_id,
    m.occurrence_date,
    m.start_time,
    m.end_time,
    m.fee_amount,
    m.capacity,
    m.source_description,
    false::boolean as already_bound
  from matched m;

  update selected_reconciliation s set already_bound = exists (
    select 1
    from public.event_source_bindings b
    where b.source_family = s.source_family
      and b.upstream_event_id = s.upstream_event_id
      and b.series_id = s.series_id
      and (s.occurrence_id is null or b.occurrence_id = s.occurrence_id)
  );

  select count(*) into v_selected from selected_reconciliation;
  if v_selected <> v_requested then
    raise exception 'requested % observations but % belong to run %',
      v_requested, v_selected, p_ingest_run_id;
  end if;

  select count(*) into v_unsupported
  from selected_reconciliation s
  where s.canonical_action not in (
    'bind_exact_occurrence', 'add_occurrence_to_recurring_series'
  );
  if v_unsupported > 0 then
    raise exception '% selected observations are not supported by the controlled reconciler',
      v_unsupported;
  end if;

  if p_dry_run then
    return query
    select s.observation_id, s.canonical_action, s.series_id, s.occurrence_id,
      s.hidden_by_rule, 'validated'::text, false
    from selected_reconciliation s order by s.observation_id;
    return;
  end if;

  insert into public.event_occurrences (
    id, series_id, occurrence_date, start_time, end_time, evidence_state,
    occurrence_status, entry_fee, capacity, details
  )
  select
    s.series_id || '-wpn-' || s.upstream_event_id,
    s.series_id, s.occurrence_date, s.start_time, s.end_time,
    'single_source', 'confirmed', s.fee_amount, s.capacity, s.source_description
  from selected_reconciliation s
  where s.canonical_action = 'add_occurrence_to_recurring_series'
    and not s.already_bound
  on conflict on constraint event_occurrences_series_id_occurrence_date_start_time_key
  do update set
    end_time = coalesce(public.event_occurrences.end_time, excluded.end_time),
    entry_fee = coalesce(public.event_occurrences.entry_fee, excluded.entry_fee),
    capacity = coalesce(public.event_occurrences.capacity, excluded.capacity),
    details = coalesce(public.event_occurrences.details, excluded.details);

  update selected_reconciliation s set occurrence_id = eo.id
  from public.event_occurrences eo
  where eo.series_id = s.series_id
    and eo.occurrence_date = s.occurrence_date
    and eo.start_time is not distinct from s.start_time;

  insert into public.event_sources (source_id, occurrence_id, relationship)
  select s.source_id, s.occurrence_id, 'schedule'
  from selected_reconciliation s
  where s.source_id is not null and s.occurrence_id is not null
    and not s.already_bound
    and not exists (
      select 1 from public.event_sources es
      where es.source_id = s.source_id and es.occurrence_id = s.occurrence_id
    );

  insert into public.event_source_bindings (
    source_family, upstream_event_id, observation_id, series_id, occurrence_id,
    match_method, match_confidence
  )
  select s.source_family, s.upstream_event_id, s.observation_id, s.series_id,
    s.occurrence_id, s.canonical_action, 'exact'
  from selected_reconciliation s
  where not s.already_bound
  on conflict (source_family, upstream_event_id) do update set
    observation_id = excluded.observation_id,
    series_id = excluded.series_id,
    occurrence_id = excluded.occurrence_id,
    match_method = excluded.match_method,
    match_confidence = excluded.match_confidence,
    last_verified_at = timezone('utc', now());

  update public.event_observations o set reconcile_state = 'bound'
  from selected_reconciliation s
  where o.id = s.observation_id and not s.already_bound;

  get diagnostics v_written = row_count;
  update public.event_ingest_runs r set
    result_counts = r.result_counts || jsonb_build_object(
      'controlled_reconciled', v_written,
      'controlled_hidden_by_rule', (
        select count(*) from selected_reconciliation sr where sr.hidden_by_rule
      )
    )
  where r.id = p_ingest_run_id;

  return query
  select s.observation_id, s.canonical_action, s.series_id, s.occurrence_id,
    s.hidden_by_rule,
    case when s.already_bound then 'replayed' else 'applied' end::text,
    not s.already_bound
  from selected_reconciliation s order by s.observation_id;
end;
$$;

revoke all on function public.reconcile_event_ingest_run(uuid, uuid[], boolean)
  from public, anon, authenticated;
grant execute on function public.reconcile_event_ingest_run(uuid, uuid[], boolean)
  to service_role;

comment on function public.reconcile_event_ingest_run(uuid, uuid[], boolean) is
  'Service-only allowlisted reconciler. Initial proof supports exact occurrence binding and dated materialization on one exact recurring series; unsupported shapes fail closed.';
