alter table public.event_observations
  add column target_series_id text
    references public.event_series(id) on delete restrict;

create index event_observations_target_series_idx
  on public.event_observations(target_series_id)
  where target_series_id is not null;

comment on column public.event_observations.target_series_id is
  'Optional exact canonical series target supplied by a typed adapter. The targeted reconciler validates venue and recurring-series compatibility before writing.';

create or replace function public.stage_official_recurring_occurrence_observation(
  p_run_key text,
  p_upstream_event_id text,
  p_venue_id text,
  p_target_series_id text,
  p_occurrence_date date,
  p_start_time time,
  p_source_id text,
  p_source_label text,
  p_source_url text,
  p_summary text,
  p_source_type text default 'eventsPage',
  p_end_time time default null,
  p_entry_fee numeric default null,
  p_details text default null,
  p_proxy_policy text default 'unspecified',
  p_attention_category text default null,
  p_attention_priority text default null,
  p_attention_summary text default null,
  p_suggested_action text default null,
  p_dry_run boolean default true
)
returns table(
  ingest_run_id uuid,
  observation_id uuid,
  outcome text,
  wrote boolean
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_series public.event_series%rowtype;
  v_staged record;
  v_updated integer;
begin
  select * into v_series
  from public.event_series es
  where es.id = p_target_series_id;

  if not found then
    raise exception 'unknown target event series: %', p_target_series_id;
  end if;
  if v_series.venue_id is distinct from p_venue_id then
    raise exception 'target series % does not belong to venue %',
      p_target_series_id, p_venue_id;
  end if;
  if v_series.recurrence is null then
    raise exception 'target series % is not recurring', p_target_series_id;
  end if;
  if nullif(btrim(p_summary), '') is null then
    raise exception 'summary is required';
  end if;

  select * into v_staged
  from public.stage_official_event_observation(
    p_run_key := p_run_key,
    p_upstream_event_id := p_upstream_event_id,
    p_venue_id := p_venue_id,
    p_title := v_series.title,
    p_format := coalesce(v_series.format, 'Unknown'),
    p_event_type := coalesce(v_series.event_type, 'other'),
    p_occurrence_date := p_occurrence_date,
    p_start_time := p_start_time,
    p_source_id := p_source_id,
    p_source_label := p_source_label,
    p_source_url := p_source_url,
    p_source_type := p_source_type,
    p_end_time := p_end_time,
    p_entry_fee := p_entry_fee,
    p_details := coalesce(nullif(btrim(p_details), ''), btrim(p_summary)),
    p_bracket := v_series.bracket,
    p_proxy_policy := p_proxy_policy,
    p_attention_category := p_attention_category,
    p_attention_priority := p_attention_priority,
    p_attention_summary := p_attention_summary,
    p_suggested_action := p_suggested_action,
    p_dry_run := p_dry_run
  );

  if p_dry_run then
    return query select v_staged.ingest_run_id, v_staged.observation_id,
      v_staged.outcome, v_staged.wrote;
    return;
  end if;

  update public.event_observations o
  set target_series_id = p_target_series_id,
      updated_at = timezone('utc', now())
  where o.id = v_staged.observation_id
    and (o.target_series_id is null or o.target_series_id = p_target_series_id);
  get diagnostics v_updated = row_count;

  if v_updated <> 1 then
    raise exception 'observation % already targets a different canonical series',
      v_staged.observation_id;
  end if;

  return query select v_staged.ingest_run_id, v_staged.observation_id,
    v_staged.outcome, v_staged.wrote;
end;
$$;

revoke all on function public.stage_official_recurring_occurrence_observation(
  text, text, text, text, date, time, text, text, text, text, text,
  time, numeric, text, text, text, text, text, text, boolean
) from public, anon, authenticated;
grant execute on function public.stage_official_recurring_occurrence_observation(
  text, text, text, text, date, time, text, text, text, text, text,
  time, numeric, text, text, text, text, text, text, boolean
) to service_role;

comment on function public.stage_official_recurring_occurrence_observation(
  text, text, text, text, date, time, text, text, text, text, text,
  time, numeric, text, text, text, text, text, text, boolean
) is
  'Service-only typed adapter for one official dated occurrence with an explicit existing recurring-series target.';

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
security invoker
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.event_ingest_runs r where r.id = p_ingest_run_id
  ) then
    raise exception 'unknown ingest run: %', p_ingest_run_id;
  end if;

  if exists (
    select 1
    from public.event_observations o
    left join public.event_series es on es.id = o.target_series_id
    where o.ingest_run_id = p_ingest_run_id
      and o.target_series_id is not null
      and (
        es.id is null
        or es.venue_id is distinct from o.venue_id
        or es.recurrence is null
      )
  ) then
    raise exception 'run % contains an invalid explicit recurring-series target',
      p_ingest_run_id;
  end if;

  drop table if exists pg_temp.targeted_reconciliation;
  create temporary table targeted_reconciliation on commit drop as
  select
    o.id as observation_id,
    case
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
    (b.id is not null) as already_bound
  from public.event_observations o
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
    select t.observation_id, t.canonical_action, t.series_id, t.occurrence_id,
      t.hidden_by_rule,
      case when t.already_bound then 'replayed' else 'validated' end::text,
      false
    from targeted_reconciliation t order by t.observation_id;
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
    and eo.start_time is not distinct from t.start_time;

  insert into public.event_sources (source_id, occurrence_id, relationship)
  select t.source_id, t.occurrence_id, 'schedule'
  from targeted_reconciliation t
  where t.source_id is not null and t.occurrence_id is not null
    and not t.already_bound
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
  where o.id = t.observation_id and not t.already_bound;

  return query
  select t.observation_id, t.canonical_action, t.series_id, t.occurrence_id,
    t.hidden_by_rule,
    case when t.already_bound then 'replayed' else 'applied' end::text,
    not t.already_bound
  from targeted_reconciliation t order by t.observation_id;
end;
$$;

revoke all on function public.reconcile_targeted_recurring_observations(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.reconcile_targeted_recurring_observations(uuid, boolean)
  to service_role;

comment on function public.reconcile_targeted_recurring_observations(uuid, boolean) is
  'Service-only exact reconciler for normalized observations carrying an explicit existing recurring-series target.';

-- The normalized adapter + targeted reconciler + shared presentation promoter
-- replace this ordinary direct writer. Retain migration history, but remove the
-- live service-role path so callers cannot drift back to it.
revoke execute on function public.upsert_official_occurrence_on_recurring_series(
  text, text, text, text, date, time, text, text, text, text, text,
  numeric, text, time, text, text, text, date, boolean
) from service_role;

comment on function public.upsert_official_occurrence_on_recurring_series(
  text, text, text, text, date, time, text, text, text, text, text,
  numeric, text, time, text, text, text, date, boolean
) is
  'Retired compatibility writer. Use stage_official_recurring_occurrence_observation, reconcile_targeted_recurring_observations, and promote_event_ingest_run.';
