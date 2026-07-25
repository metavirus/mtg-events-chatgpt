create or replace function public.upsert_official_occurrence_on_recurring_series(
  p_idempotency_key text,
  p_venue_id text,
  p_series_id text,
  p_occurrence_id text,
  p_occurrence_date date,
  p_start_time time,
  p_source_id text,
  p_source_label text,
  p_source_url text,
  p_summary text,
  p_source_type text default 'eventPlatform',
  p_entry_fee numeric default null,
  p_details text default null,
  p_end_time time default null,
  p_confidence text default 'medium',
  p_evidence_state text default 'single_source',
  p_occurrence_status text default 'confirmed',
  p_last_verified date default current_date,
  p_dry_run boolean default false
)
returns table (
  series_id text,
  occurrence_id text,
  source_id text,
  outcome text,
  wrote boolean,
  research_change_id text
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_change_id text;
  v_existing_change public.research_changes%rowtype;
  v_series public.event_series%rowtype;
  v_occurrence_existed boolean;
begin
  if p_idempotency_key is null
     or length(btrim(p_idempotency_key)) not between 1 and 180 then
    raise exception 'invalid idempotency_key';
  end if;

  if p_venue_id is null
     or not exists (select 1 from public.venues where id = p_venue_id) then
    raise exception 'unknown venue: %', p_venue_id;
  end if;

  if p_series_id is null or length(btrim(p_series_id)) not between 1 and 180 then
    raise exception 'series_id is required';
  end if;

  if p_occurrence_id is null or length(btrim(p_occurrence_id)) not between 1 and 180 then
    raise exception 'occurrence_id is required';
  end if;

  if p_occurrence_date is null then
    raise exception 'occurrence_date is required';
  end if;

  if p_source_id is null or length(btrim(p_source_id)) not between 1 and 180 then
    raise exception 'source_id is required';
  end if;

  if p_source_label is null or length(btrim(p_source_label)) not between 1 and 240 then
    raise exception 'source_label must contain 1 to 240 trimmed characters';
  end if;

  if p_source_url is null or length(btrim(p_source_url)) not between 1 and 4000 then
    raise exception 'source_url must contain 1 to 4000 trimmed characters';
  end if;

  if p_summary is null or length(btrim(p_summary)) not between 1 and 2000 then
    raise exception 'summary must contain 1 to 2000 trimmed characters';
  end if;

  if p_source_type not in (
    'official',
    'officialWebsite',
    'eventsPage',
    'eventPlatform',
    'calendar'
  ) then
    raise exception 'unsupported official source_type: %', p_source_type;
  end if;

  if p_confidence not in ('low', 'medium', 'high') then
    raise exception 'unsupported confidence: %', p_confidence;
  end if;

  if p_evidence_state not in (
    'corroborated',
    'single_source',
    'projected',
    'needs_confirmation'
  ) then
    raise exception 'unsupported evidence_state: %', p_evidence_state;
  end if;

  if p_occurrence_status not in (
    'confirmed',
    'projected',
    'cancelled',
    'moved',
    'at_risk'
  ) then
    raise exception 'unsupported occurrence_status: %', p_occurrence_status;
  end if;

  select *
  into v_series
  from public.event_series
  where id = p_series_id;

  if not found then
    raise exception 'unknown event_series: %', p_series_id;
  end if;

  if v_series.venue_id is distinct from p_venue_id then
    raise exception 'series % does not belong to venue %', p_series_id, p_venue_id;
  end if;

  if v_series.recurrence is null then
    raise exception 'series % is not recurring', p_series_id;
  end if;

  v_change_id := 'routine-official-recurring-occurrence:' || p_idempotency_key;

  select *
  into v_existing_change
  from public.research_changes
  where id = v_change_id;

  if found then
    return query
      select
        p_series_id,
        p_occurrence_id,
        p_source_id,
        'replayed'::text,
        false,
        v_change_id;
    return;
  end if;

  if p_dry_run then
    return query
      select
        p_series_id,
        p_occurrence_id,
        p_source_id,
        'validated'::text,
        false,
        null::text;
    return;
  end if;

  v_occurrence_existed := exists (
    select 1
    from public.event_occurrences
    where id = p_occurrence_id
  );

  insert into public.sources (
    id,
    label,
    url,
    source_type,
    health_status,
    last_checked
  )
  values (
    p_source_id,
    btrim(p_source_label),
    btrim(p_source_url),
    p_source_type,
    'current',
    p_last_verified
  )
  on conflict (id) do update
  set label = excluded.label,
      url = excluded.url,
      source_type = excluded.source_type,
      health_status = excluded.health_status,
      last_checked = excluded.last_checked,
      updated_at = timezone('utc', now());

  insert into public.entity_sources (
    entity_type,
    entity_id,
    source_id,
    relationship
  )
  values (
    'venue',
    p_venue_id,
    p_source_id,
    'official_event_listing'
  )
  on conflict on constraint entity_sources_pkey do update
  set relationship = excluded.relationship;

  insert into public.event_occurrences (
    id,
    series_id,
    occurrence_date,
    start_time,
    end_time,
    evidence_state,
    occurrence_status,
    entry_fee,
    details
  )
  values (
    p_occurrence_id,
    p_series_id,
    p_occurrence_date,
    p_start_time,
    p_end_time,
    p_evidence_state,
    p_occurrence_status,
    p_entry_fee,
    nullif(btrim(coalesce(p_details, '')), '')
  )
  on conflict (id) do update
  set series_id = excluded.series_id,
      occurrence_date = excluded.occurrence_date,
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      evidence_state = excluded.evidence_state,
      occurrence_status = excluded.occurrence_status,
      entry_fee = excluded.entry_fee,
      details = excluded.details,
      updated_at = timezone('utc', now());

  if not exists (
    select 1
    from public.event_sources es
    where es.source_id = p_source_id
      and es.series_id = p_series_id
      and es.occurrence_id is null
  ) then
    insert into public.event_sources (
      source_id,
      series_id,
      relationship
    )
    values (
      p_source_id,
      p_series_id,
      'official_event_listing'
    );
  end if;

  if not exists (
    select 1
    from public.event_sources es
    where es.source_id = p_source_id
      and es.occurrence_id = p_occurrence_id
      and es.series_id is null
  ) then
    insert into public.event_sources (
      source_id,
      occurrence_id,
      relationship
    )
    values (
      p_source_id,
      p_occurrence_id,
      'official_event_listing'
    );
  end if;

  update public.event_series
  set last_verified = greatest(coalesce(last_verified, p_last_verified), p_last_verified),
      updated_at = timezone('utc', now())
  where id = p_series_id;

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
    timezone('utc', now()),
    case
      when v_occurrence_existed then 'event_update'
      else 'new_event'
    end,
    'event_occurrence',
    p_occurrence_id,
    btrim(p_summary),
    'accepted'
  );

  return query
    select
      p_series_id,
      p_occurrence_id,
      p_source_id,
      case
        when v_occurrence_existed then 'updated'
        else 'inserted'
      end,
      true,
      v_change_id;
end;
$$;

comment on function public.upsert_official_occurrence_on_recurring_series(
  text,
  text,
  text,
  text,
  date,
  time,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  time,
  text,
  text,
  text,
  date,
  boolean
) is
  'Typed steward-only routine path for attaching one official dated occurrence to an existing recurring event series without mutating the recurring series shape.';

revoke all on function public.upsert_official_occurrence_on_recurring_series(
  text,
  text,
  text,
  text,
  date,
  time,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  time,
  text,
  text,
  text,
  date,
  boolean
) from public;

revoke all on function public.upsert_official_occurrence_on_recurring_series(
  text,
  text,
  text,
  text,
  date,
  time,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  time,
  text,
  text,
  text,
  date,
  boolean
) from anon;

revoke all on function public.upsert_official_occurrence_on_recurring_series(
  text,
  text,
  text,
  text,
  date,
  time,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  time,
  text,
  text,
  text,
  date,
  boolean
) from authenticated;

grant execute on function public.upsert_official_occurrence_on_recurring_series(
  text,
  text,
  text,
  text,
  date,
  time,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  time,
  text,
  text,
  text,
  date,
  boolean
) to service_role;
