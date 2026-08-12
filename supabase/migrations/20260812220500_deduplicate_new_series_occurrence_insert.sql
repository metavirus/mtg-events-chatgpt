do $$
declare
  v_function text;
begin
  select pg_get_functiondef('public.reconcile_new_event_series(uuid, boolean)'::regprocedure)
    into v_function;

  if v_function is null then
    raise exception 'public.reconcile_new_event_series(uuid, boolean) is missing';
  end if;

  v_function := replace(
    v_function,
    $needle$insert into public.event_occurrences (
    id, series_id, occurrence_date, start_time, end_time, evidence_state,
    occurrence_status, entry_fee, capacity, details
  )
  select
    c.series_id || '-' || c.source_family || '-' || c.upstream_event_id,
    c.series_id,
    c.occurrence_date,
    c.start_time,
    c.end_time,
    'single_source',
    'confirmed',
    c.fee_amount,
    c.capacity,
    c.source_description
  from new_series_candidates c
  where not c.already_bound
  on conflict on constraint event_occurrences_series_id_occurrence_date_start_time_key
  do update set
    end_time = coalesce(public.event_occurrences.end_time, excluded.end_time),
    entry_fee = coalesce(public.event_occurrences.entry_fee, excluded.entry_fee),
    capacity = coalesce(public.event_occurrences.capacity, excluded.capacity),
    details = coalesce(public.event_occurrences.details, excluded.details);$needle$,
    $replacement$insert into public.event_occurrences (
    id, series_id, occurrence_date, start_time, end_time, evidence_state,
    occurrence_status, entry_fee, capacity, details
  )
  select distinct on (c.series_id, c.occurrence_date, c.start_time)
    c.series_id || '-' || c.source_family || '-' || c.upstream_event_id,
    c.series_id,
    c.occurrence_date,
    c.start_time,
    c.end_time,
    'single_source',
    'confirmed',
    c.fee_amount,
    c.capacity,
    c.source_description
  from new_series_candidates c
  where not c.already_bound
  order by c.series_id, c.occurrence_date, c.start_time, c.observation_id
  on conflict on constraint event_occurrences_series_id_occurrence_date_start_time_key
  do update set
    end_time = coalesce(public.event_occurrences.end_time, excluded.end_time),
    entry_fee = coalesce(public.event_occurrences.entry_fee, excluded.entry_fee),
    capacity = coalesce(public.event_occurrences.capacity, excluded.capacity),
    details = coalesce(public.event_occurrences.details, excluded.details);$replacement$
  );

  execute v_function;
end;
$$;

comment on function public.reconcile_new_event_series(uuid, boolean) is
  'Service-only deterministic creator for safe WPN series families. Exact duplicate protections remain; multi-observation batches create one canonical occurrence per series/date/time and bind all sources to it.';
