create or replace function public.upsert_attributable_wpn_event(
  p_idempotency_key text,
  p_venue_id text,
  p_series_id text,
  p_occurrence_id text,
  p_title text,
  p_format text,
  p_event_type text,
  p_occurrence_date date,
  p_start_time time,
  p_source_id text,
  p_source_label text,
  p_source_url text,
  p_summary text,
  p_bracket text default null,
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
  v_series_existed boolean;
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

  if p_title is null or length(btrim(p_title)) not between 1 and 240 then
    raise exception 'title must contain 1 to 240 trimmed characters';
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

  v_change_id := 'routine-wpn-event:' || p_idempotency_key;

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

  v_series_existed := exists (
    select 1 from public.event_series where id = p_series_id
  );

  v_occurrence_existed := exists (
    select 1 from public.event_occurrences where id = p_occurrence_id
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
    'wpn',
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
    'wpn_eventlink'
  )
  on conflict (entity_type, entity_id, source_id) do update
  set relationship = excluded.relationship;

  insert into public.event_series (
    id,
    venue_id,
    title,
    format,
    event_type,
    bracket,
    recurrence,
    default_start_time,
    start_date,
    entry_fee,
    details,
    confidence,
    event_status,
    last_verified
  )
  values (
    p_series_id,
    p_venue_id,
    btrim(p_title),
    p_format,
    p_event_type,
    p_bracket,
    null,
    p_start_time,
    p_occurrence_date,
    p_entry_fee,
    nullif(btrim(coalesce(p_details, '')), ''),
    p_confidence,
    'active',
    p_last_verified
  )
  on conflict (id) do update
  set venue_id = excluded.venue_id,
      title = excluded.title,
      format = excluded.format,
      event_type = excluded.event_type,
      bracket = excluded.bracket,
      recurrence = excluded.recurrence,
      default_start_time = excluded.default_start_time,
      start_date = excluded.start_date,
      entry_fee = excluded.entry_fee,
      details = excluded.details,
      confidence = excluded.confidence,
      event_status = excluded.event_status,
      last_verified = excluded.last_verified,
      updated_at = timezone('utc', now());

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
    from public.event_sources
    where source_id = p_source_id
      and series_id = p_series_id
      and occurrence_id is null
  ) then
    insert into public.event_sources (
      source_id,
      series_id,
      relationship
    )
    values (
      p_source_id,
      p_series_id,
      'wpn_eventlink'
    );
  end if;

  if not exists (
    select 1
    from public.event_sources
    where source_id = p_source_id
      and occurrence_id = p_occurrence_id
      and series_id is null
  ) then
    insert into public.event_sources (
      source_id,
      occurrence_id,
      relationship
    )
    values (
      p_source_id,
      p_occurrence_id,
      'wpn_eventlink'
    );
  end if;

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
      when v_series_existed or v_occurrence_existed then 'event_update'
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
        when v_series_existed or v_occurrence_existed then 'updated'
        else 'inserted'
      end,
      true,
      v_change_id;
end;
$$;

comment on function public.upsert_attributable_wpn_event(
  text,
  text,
  text,
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
  'Typed steward-only routine path for one attributable WPN/EventLink dated event, source link, and research change.';

revoke all on function public.upsert_attributable_wpn_event(
  text,
  text,
  text,
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

revoke all on function public.upsert_attributable_wpn_event(
  text,
  text,
  text,
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

revoke all on function public.upsert_attributable_wpn_event(
  text,
  text,
  text,
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

grant execute on function public.upsert_attributable_wpn_event(
  text,
  text,
  text,
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

create or replace function public.refresh_venue_planning_assessment(
  p_idempotency_key text,
  p_venue_id text,
  p_summary text,
  p_research_status text default null,
  p_candidate_status text default null,
  p_fit_grade text default null,
  p_fit_score numeric default null,
  p_confidence text default null,
  p_positives text[] default null,
  p_cautions text[] default null,
  p_open_questions text[] default null,
  p_assessment_notes text default null,
  p_research_mode text default null,
  p_next_research_due_at timestamptz default null,
  p_research_mode_reason text default null,
  p_dry_run boolean default false
)
returns table (
  evaluation_id uuid,
  venue_id text,
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
  v_evaluation_id uuid;
  v_existing_change public.research_changes%rowtype;
  v_research_status text;
  v_candidate_status text;
  v_confidence text;
begin
  if p_idempotency_key is null
     or length(btrim(p_idempotency_key)) not between 1 and 180 then
    raise exception 'invalid idempotency_key';
  end if;

  if p_venue_id is null
     or not exists (select 1 from public.venues where id = p_venue_id) then
    raise exception 'unknown venue: %', p_venue_id;
  end if;

  if p_summary is null or length(btrim(p_summary)) not between 1 and 2000 then
    raise exception 'summary must contain 1 to 2000 trimmed characters';
  end if;

  if p_research_status is not null
     and p_research_status not in ('discovery', 'reviewed', 'deepened') then
    raise exception 'unsupported research_status: %', p_research_status;
  end if;

  if p_candidate_status is not null
     and p_candidate_status not in ('promoted', 'neutral', 'deprioritized') then
    raise exception 'unsupported candidate_status: %', p_candidate_status;
  end if;

  if p_fit_grade is not null
     and p_fit_grade !~ '^[A-F][+-]?$' then
    raise exception 'unsupported fit_grade: %', p_fit_grade;
  end if;

  if p_fit_score is not null
     and (p_fit_score < 1 or p_fit_score > 5) then
    raise exception 'fit_score must be between 1 and 5';
  end if;

  if p_confidence is not null
     and p_confidence not in ('low', 'medium', 'high') then
    raise exception 'unsupported confidence: %', p_confidence;
  end if;

  if p_research_mode is not null
     and p_research_mode not in (
       'incomplete',
       'maintenance',
       'targeted_followup',
       'identity_unresolved'
     ) then
    raise exception 'unsupported research_mode: %', p_research_mode;
  end if;

  v_change_id := 'routine-assessment:' || p_idempotency_key;

  select *
  into v_existing_change
  from public.research_changes
  where id = v_change_id;

  if found then
    select id
    into v_evaluation_id
    from public.evaluations
    where entity_type = 'venue'
      and entity_id = p_venue_id
    order by updated_at desc
    limit 1;

    return query
      select
        v_evaluation_id,
        p_venue_id,
        'replayed'::text,
        false,
        v_change_id;
    return;
  end if;

  select id
  into v_evaluation_id
  from public.evaluations
  where entity_type = 'venue'
    and entity_id = p_venue_id
  order by updated_at desc
  limit 1;

  select
    coalesce(p_research_status, e.research_status, v.research_status, 'discovery'),
    coalesce(p_candidate_status, e.candidate_status, 'neutral'),
    coalesce(p_confidence, e.confidence, 'low')
  into v_research_status, v_candidate_status, v_confidence
  from public.venues v
  left join public.evaluations e on e.id = v_evaluation_id
  where v.id = p_venue_id;

  if p_dry_run then
    return query
      select
        v_evaluation_id,
        p_venue_id,
        'validated'::text,
        false,
        null::text;
    return;
  end if;

  if v_evaluation_id is null then
    insert into public.evaluations (
      entity_type,
      entity_id,
      research_status,
      candidate_status,
      fit_grade,
      fit_score,
      confidence,
      positives,
      cautions,
      open_questions
    )
    values (
      'venue',
      p_venue_id,
      v_research_status,
      v_candidate_status,
      p_fit_grade,
      p_fit_score,
      v_confidence,
      coalesce(p_positives, '{}'::text[]),
      coalesce(p_cautions, '{}'::text[]),
      coalesce(p_open_questions, '{}'::text[])
    )
    returning id into v_evaluation_id;
  else
    update public.evaluations
    set research_status = v_research_status,
        candidate_status = v_candidate_status,
        fit_grade = coalesce(p_fit_grade, fit_grade),
        fit_score = coalesce(p_fit_score, fit_score),
        confidence = v_confidence,
        positives = coalesce(p_positives, positives),
        cautions = coalesce(p_cautions, cautions),
        open_questions = coalesce(p_open_questions, open_questions),
        updated_at = timezone('utc', now())
    where id = v_evaluation_id;
  end if;

  update public.venues
  set research_status = coalesce(p_research_status, research_status),
      assessment_notes = coalesce(nullif(btrim(coalesce(p_assessment_notes, '')), ''), assessment_notes),
      research_mode = coalesce(p_research_mode, research_mode),
      next_research_due_at = coalesce(p_next_research_due_at, next_research_due_at),
      research_mode_reason = coalesce(
        nullif(btrim(coalesce(p_research_mode_reason, '')), ''),
        research_mode_reason
      ),
      last_verified = current_date,
      updated_at = timezone('utc', now())
  where id = p_venue_id;

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
    'evaluation_update',
    'venue',
    p_venue_id,
    btrim(p_summary),
    'accepted'
  );

  return query
    select
      v_evaluation_id,
      p_venue_id,
      'updated'::text,
      true,
      v_change_id;
end;
$$;

comment on function public.refresh_venue_planning_assessment(
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  text[],
  text[],
  text[],
  text,
  text,
  timestamptz,
  text,
  boolean
) is
  'Typed steward-only routine path for one modest venue planning assessment refresh and research change.';

revoke all on function public.refresh_venue_planning_assessment(
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  text[],
  text[],
  text[],
  text,
  text,
  timestamptz,
  text,
  boolean
) from public;

revoke all on function public.refresh_venue_planning_assessment(
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  text[],
  text[],
  text[],
  text,
  text,
  timestamptz,
  text,
  boolean
) from anon;

revoke all on function public.refresh_venue_planning_assessment(
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  text[],
  text[],
  text[],
  text,
  text,
  timestamptz,
  text,
  boolean
) from authenticated;

grant execute on function public.refresh_venue_planning_assessment(
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  text[],
  text[],
  text[],
  text,
  text,
  timestamptz,
  text,
  boolean
) to service_role;
