alter table public.signals
  add column proposed_change jsonb
    check (proposed_change is null or jsonb_typeof(proposed_change) = 'object');

alter table public.signals
  drop constraint if exists signals_promotion_target_check;

alter table public.signals
  add constraint signals_promotion_target_check
  check (promotion_target is null or promotion_target in (
    'event_proposal',
    'update',
    'places_assessment',
    'community_note',
    'personal_reminder',
    'venue_hours',
    'no_action'
  ));

create or replace function public.promote_venue_hours_signal(p_signal_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_signal public.signals%rowtype;
  v_weekly jsonb;
  v_existing_weekly jsonb;
  v_effective_date date;
  v_change_id text;
begin
  select * into v_signal
  from public.signals
  where id = p_signal_id
  for update;

  if not found then
    raise exception 'unknown signal: %', p_signal_id;
  end if;

  if v_signal.status = 'promoted' then
    return jsonb_build_object('signal_id', p_signal_id, 'status', 'promoted', 'outcome', 'already_promoted');
  end if;

  if v_signal.category <> 'operational'
     or v_signal.related_entity_type <> 'venue'
     or v_signal.promotion_target <> 'venue_hours'
     or coalesce(v_signal.proposed_change->>'type', '') <> 'venue_hours' then
    raise exception 'signal is not a venue-hours proposal: %', p_signal_id;
  end if;

  v_weekly := v_signal.proposed_change->'weekly_hours';
  if v_weekly is null
     or jsonb_typeof(v_weekly) <> 'object'
     or v_weekly = '{}'::jsonb
     or exists (
       select 1
       from jsonb_each(v_weekly) day_entry
       where day_entry.key !~ '^[0-6]$'
          or jsonb_typeof(day_entry.value) <> 'array'
          or jsonb_array_length(day_entry.value) = 0
          or exists (
            select 1
            from jsonb_array_elements(day_entry.value) slot
            where coalesce(slot->>'open', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
               or coalesce(slot->>'close', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
          )
     ) then
    raise exception 'invalid weekly-hours proposal on signal: %', p_signal_id;
  end if;

  if not exists (select 1 from public.venues where id = v_signal.related_entity_id) then
    raise exception 'unknown venue on signal: %', v_signal.related_entity_id;
  end if;

  if v_signal.source_id is null
     or not exists (
       select 1
       from public.entity_sources es
       where es.entity_type = 'venue'
         and es.entity_id = v_signal.related_entity_id
         and es.source_id = v_signal.source_id
     ) then
    raise exception 'signal source is not linked to venue: %', p_signal_id;
  end if;

  begin
    v_effective_date := nullif(v_signal.proposed_change->>'effective_date', '')::date;
  exception when invalid_text_representation or datetime_field_overflow then
    raise exception 'invalid effective date on signal: %', p_signal_id;
  end;

  select weekly_hours into v_existing_weekly
  from public.venue_hours
  where venue_id = v_signal.related_entity_id;

  insert into public.venue_hours (
    venue_id, status, weekly_hours, temporary_updates, source_id, last_verified, notes
  ) values (
    v_signal.related_entity_id,
    'verified',
    coalesce(v_existing_weekly, '{}'::jsonb) || v_weekly,
    '[]'::jsonb,
    v_signal.source_id,
    coalesce(v_effective_date, current_date),
    coalesce(nullif(v_signal.proposed_change->>'note', ''), 'Official source published a permanent hours change.')
  )
  on conflict (venue_id) do update
  set status = 'verified',
      weekly_hours = public.venue_hours.weekly_hours || excluded.weekly_hours,
      source_id = excluded.source_id,
      last_verified = excluded.last_verified,
      notes = excluded.notes,
      updated_at = timezone('utc', now());

  v_change_id := 'venue-hours:' || p_signal_id;
  insert into public.research_changes (
    id, detected_at, change_type, entity_type, entity_id, summary, review_status
  ) values (
    v_change_id,
    timezone('utc', now()),
    'hours_update',
    'venue',
    v_signal.related_entity_id,
    v_signal.summary,
    'accepted'
  ) on conflict (id) do nothing;

  update public.signals
  set status = 'promoted',
      confidence = 'high',
      suggested_action = 'Hours updated from the linked official source.'
  where id = p_signal_id;

  return jsonb_build_object(
    'signal_id', p_signal_id,
    'venue_id', v_signal.related_entity_id,
    'status', 'promoted',
    'outcome', 'hours_updated'
  );
end;
$$;

revoke all on function public.promote_venue_hours_signal(text) from public, anon, authenticated;
grant execute on function public.promote_venue_hours_signal(text) to service_role;

create or replace function public.review_venue_hours_signal(
  p_signal_id text,
  p_accept boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_accept then
    v_result := public.promote_venue_hours_signal(p_signal_id);
  else
    update public.signals
    set status = 'dismissed',
        suggested_action = 'The proposed hours change was rejected in the app.'
    where id = p_signal_id
      and category = 'operational'
      and promotion_target = 'venue_hours'
      and status in ('new', 'needs_followup');

    if not found then
      raise exception 'reviewable venue-hours signal not found: %', p_signal_id;
    end if;
    v_result := jsonb_build_object('signal_id', p_signal_id, 'status', 'dismissed', 'outcome', 'rejected');
  end if;

  insert into public.signal_user_states (user_id, signal_id, read_at)
  values (v_user_id, p_signal_id, timezone('utc', now()))
  on conflict (user_id, signal_id) do update
  set read_at = excluded.read_at,
      updated_at = timezone('utc', now());

  insert into public.user_activity (user_id, action_type, entity_type, entity_id, details)
  select
    v_user_id,
    case when p_accept then 'accepted_hours_change' else 'rejected_hours_change' end,
    'venue',
    related_entity_id,
    jsonb_build_object('signal_id', p_signal_id)
  from public.signals
  where id = p_signal_id;

  return v_result;
end;
$$;

revoke all on function public.review_venue_hours_signal(text, boolean) from public, anon;
grant execute on function public.review_venue_hours_signal(text, boolean) to authenticated;

comment on column public.signals.proposed_change is
  'Structured canonical change proposed by a surveyor. Ambiguous proposals are rendered as explicit app decisions.';

comment on function public.promote_venue_hours_signal(text) is
  'Service-only promotion of a validated official-source weekly-hours proposal into canonical venue_hours.';

comment on function public.review_venue_hours_signal(text, boolean) is
  'Authenticated one-person app decision path for accepting or rejecting a structured venue-hours Signal.';

update public.signals
set status = 'needs_followup',
    summary = 'Collectors Lounge - Cypress posted changed store hours.',
    confidence = 'medium',
    suggested_action = 'Confirm or reject the proposed hours shown in the app.',
    promotion_target = 'venue_hours',
    proposed_change = jsonb_build_object(
      'type', 'venue_hours',
      'change_kind', 'permanent_weekly',
      'weekly_hours', jsonb_build_object(
        '6', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00')),
        '0', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00'))
      ),
      'effective_date', '2026-08-29',
      'display', 'Saturday & Sunday · 12:00–22:00',
      'note', 'Official Instagram announced permanent weekend hours effective August 29, 2026. OCR supports noon–10 PM but was duplicated, so the app requested confirmation.',
      'auto_promote', false,
      'extraction', 'review'
    )
where id = 'social:instagram:src-social-collectors-instagram-2026-07-14:operational:acc39461a41f'
  and status not in ('promoted', 'dismissed');
