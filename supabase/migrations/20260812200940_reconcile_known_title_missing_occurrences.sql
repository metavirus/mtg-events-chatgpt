create or replace function public.reconcile_known_title_missing_occurrences(
  p_ingest_run_id uuid,
  p_dry_run boolean default true
)
returns table (
  observation_id uuid,
  action text,
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
    raise exception 'p_ingest_run_id is required';
  end if;

  return query
  with candidates as (
    select
      o.*,
      es.id as matched_series_id,
      es.end_date as matched_series_end_date,
      count(es.id) over (partition by o.id) as matched_series_count
    from public.event_observations o
    join public.event_series es
      on es.venue_id = o.venue_id
     and public.normalize_event_identity_text(es.title) = o.normalized_title_key
    where o.ingest_run_id = p_ingest_run_id
      and o.promotion_eligibility = 'eligible'
      and o.reconcile_state = 'pending'
      and o.occurrence_date >= current_date
      and o.venue_id is not null
      and o.attribution_state in ('attributed', 'official_venue_programming')
  ),
  safe as (
    select c.*
    from candidates c
    where c.matched_series_count = 1
      and not exists (
        select 1
        from public.event_occurrences eo
        where eo.series_id = c.matched_series_id
          and eo.occurrence_date = c.occurrence_date
          and coalesce(eo.start_time, time '00:00') = coalesce(c.start_time, time '00:00')
      )
  ),
  dry as (
    select
      s.id as observation_id,
      'bind_known_title_missing_occurrence'::text as action,
      s.matched_series_id as series_id,
      (s.matched_series_id || '-wpn-' || s.upstream_event_id)::text as occurrence_id,
      'validated'::text as outcome,
      false as wrote
    from safe s
    where p_dry_run
  ),
  series_updates as (
    update public.event_series es
       set end_date = greatest(coalesce(es.end_date, s.occurrence_date), s.occurrence_date),
           last_verified = current_date,
           updated_at = v_now
      from safe s
     where not p_dry_run
       and es.id = s.matched_series_id
    returning es.id
  ),
  occurrence_writes as (
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
    select
      (s.matched_series_id || '-wpn-' || s.upstream_event_id)::text,
      s.matched_series_id,
      s.occurrence_date,
      s.start_time,
      s.end_time,
      'single_source',
      'confirmed',
      s.fee_amount,
      s.capacity,
      s.source_description,
      v_now,
      v_now
    from safe s
    where not p_dry_run
    on conflict (id) do update
      set occurrence_date = excluded.occurrence_date,
          start_time = excluded.start_time,
          end_time = excluded.end_time,
          evidence_state = excluded.evidence_state,
          occurrence_status = excluded.occurrence_status,
          entry_fee = excluded.entry_fee,
          capacity = excluded.capacity,
          details = excluded.details,
          updated_at = v_now
    returning event_occurrences.id, event_occurrences.series_id
  ),
  binding_writes as (
    insert into public.event_source_bindings (
      id,
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
      gen_random_uuid(),
      s.source_family,
      s.upstream_event_id,
      s.id,
      s.matched_series_id,
      (s.matched_series_id || '-wpn-' || s.upstream_event_id)::text,
      'known_title_exact_venue_missing_occurrence',
      'high',
      v_now,
      v_now,
      v_now,
      v_now
    from safe s
    where not p_dry_run
    on conflict (source_family, upstream_event_id) do update
      set observation_id = excluded.observation_id,
          series_id = excluded.series_id,
          occurrence_id = excluded.occurrence_id,
          match_method = excluded.match_method,
          match_confidence = excluded.match_confidence,
          last_verified_at = v_now,
          updated_at = v_now
    returning event_source_bindings.observation_id, event_source_bindings.series_id, event_source_bindings.occurrence_id
  ),
  observation_updates as (
    update public.event_observations o
       set reconcile_state = 'bound',
           target_series_id = s.matched_series_id,
           updated_at = v_now
      from safe s
     where not p_dry_run
       and o.id = s.id
    returning o.id
  ),
  live as (
    select
      s.id as observation_id,
      'bind_known_title_missing_occurrence'::text as action,
      s.matched_series_id as series_id,
      (s.matched_series_id || '-wpn-' || s.upstream_event_id)::text as occurrence_id,
      case when exists (select 1 from observation_updates ou where ou.id = s.id)
        then 'bound'
        else 'replayed'
      end as outcome,
      exists (select 1 from observation_updates ou where ou.id = s.id) as wrote
    from safe s
    where not p_dry_run
  )
  select * from dry
  union all
  select * from live
  order by observation_id;
end;
$$;

revoke all on function public.reconcile_known_title_missing_occurrences(uuid, boolean) from public;
grant execute on function public.reconcile_known_title_missing_occurrences(uuid, boolean) to service_role;

comment on function public.reconcile_known_title_missing_occurrences(uuid, boolean) is
  'Service-only repair/promotion path for eligible WPN observations whose venue has exactly one same-title canonical series but lacks the exact dated occurrence.';
