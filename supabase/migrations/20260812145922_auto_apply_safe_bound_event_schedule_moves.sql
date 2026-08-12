create or replace function public.apply_safe_bound_event_schedule_move(
  p_observation_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_observation public.event_observations%rowtype;
  v_binding public.event_source_bindings%rowtype;
  v_occurrence public.event_occurrences%rowtype;
  v_series public.event_series%rowtype;
begin
  select * into v_observation
  from public.event_observations
  where id = p_observation_id;

  if not found
    or coalesce(v_observation.source_status, '') <> 'SCHEDULED'
    or v_observation.occurrence_date is null
  then
    return false;
  end if;

  select * into v_binding
  from public.event_source_bindings
  where source_family = v_observation.source_family
    and upstream_event_id = v_observation.upstream_event_id;

  if not found or v_binding.occurrence_id is null then
    return false;
  end if;

  select * into v_occurrence
  from public.event_occurrences
  where id = v_binding.occurrence_id;

  if not found or v_occurrence.occurrence_status not in ('confirmed', 'projected', 'at_risk') then
    return false;
  end if;

  select * into v_series
  from public.event_series
  where id = v_occurrence.series_id;

  if not found
    or v_series.venue_id is distinct from v_observation.venue_id
    or public.normalize_event_identity_text(v_series.title) is distinct from v_observation.normalized_title_key
  then
    return false;
  end if;

  if v_occurrence.occurrence_date = v_observation.occurrence_date
    and v_occurrence.start_time is not distinct from v_observation.start_time
  then
    return false;
  end if;

  if exists (
    select 1
    from public.event_occurrences target
    where target.series_id = v_occurrence.series_id
      and target.occurrence_date = v_observation.occurrence_date
      and target.start_time is not distinct from v_observation.start_time
      and target.id <> v_occurrence.id
  ) then
    return false;
  end if;

  update public.event_occurrences
  set occurrence_date = v_observation.occurrence_date,
      start_time = v_observation.start_time,
      end_time = coalesce(v_observation.end_time, end_time),
      updated_at = timezone('utc', now())
  where id = v_occurrence.id;

  update public.event_source_bindings
  set observation_id = v_observation.id,
      last_verified_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = v_binding.id;

  update public.coordination_items
  set status = 'completed',
      disposition = 'completed',
      disposition_at = timezone('utc', now()),
      completed_at = timezone('utc', now()),
      disposition_reason = 'Automatically applied after stable source identity and an unoccupied target schedule slot were verified.',
      updated_at = timezone('utc', now())
  where deduplication_key = 'event-lifecycle:' || v_observation.source_family || ':' || v_observation.upstream_event_id || ':schedule_changed_review'
    and status not in ('completed', 'rejected', 'superseded');

  return true;
end;
$$;

revoke all on function public.apply_safe_bound_event_schedule_move(uuid)
  from public, anon, authenticated;
grant execute on function public.apply_safe_bound_event_schedule_move(uuid)
  to service_role;

comment on function public.apply_safe_bound_event_schedule_move(uuid) is
  'Applies an exact date/time move for an already-bound event only when source identity, venue, and normalized title remain stable and the target series slot is unoccupied.';

create or replace function public.apply_safe_bound_event_schedule_move_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.apply_safe_bound_event_schedule_move(new.id);
  return new;
end;
$$;

revoke all on function public.apply_safe_bound_event_schedule_move_trigger()
  from public, anon, authenticated;

drop trigger if exists event_observations_safe_schedule_move
  on public.event_observations;
create trigger event_observations_safe_schedule_move
after insert or update of occurrence_date, start_time, source_status, venue_id, normalized_title_key
on public.event_observations
for each row
execute function public.apply_safe_bound_event_schedule_move_trigger();

do $$
declare
  v_observation_id uuid;
begin
  for v_observation_id in
    select distinct on (o.source_family, o.upstream_event_id) o.id
    from public.event_observations o
    join public.event_source_bindings b
      on b.source_family = o.source_family
     and b.upstream_event_id = o.upstream_event_id
    join public.event_occurrences eo on eo.id = b.occurrence_id
    join public.event_series es on es.id = eo.series_id
    where coalesce(o.source_status, '') = 'SCHEDULED'
      and o.occurrence_date is not null
      and eo.occurrence_status in ('confirmed', 'projected', 'at_risk')
      and es.venue_id = o.venue_id
      and public.normalize_event_identity_text(es.title) = o.normalized_title_key
      and (
        eo.occurrence_date is distinct from o.occurrence_date
        or eo.start_time is distinct from o.start_time
      )
    order by o.source_family, o.upstream_event_id, o.observed_at desc, o.created_at desc
  loop
    perform public.apply_safe_bound_event_schedule_move(v_observation_id);
  end loop;
end;
$$;
