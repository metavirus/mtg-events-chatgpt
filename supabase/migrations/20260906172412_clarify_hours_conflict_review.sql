insert into public.sources (
  id, label, url, source_type, health_status, last_checked
) values (
  'src-nextgen-contact-hours-2026-09-06',
  'Next-Gen Games official contact-page FAQ',
  'https://www.nextgengames.la/service/',
  'officialWebsite',
  'current',
  '2026-09-06'
)
on conflict (id) do update
set label = excluded.label,
    url = excluded.url,
    source_type = excluded.source_type,
    health_status = excluded.health_status,
    last_checked = excluded.last_checked;

insert into public.entity_sources (
  entity_type, entity_id, source_id, relationship
) values (
  'venue',
  'next-gen-games',
  'src-nextgen-contact-hours-2026-09-06',
  'Official contact-page FAQ; conflicts with the dedicated events FAQ on Saturday closing time.'
)
on conflict (entity_type, entity_id, source_id) do update
set relationship = excluded.relationship;

update public.signals
set details = 'Two current pages on Next-Gen Games'' official site disagree only on Saturday closing: the dedicated events FAQ says 9 PM; the contact-page FAQ says 6 PM.',
    suggested_action = 'Choose the Saturday closing time after comparing the two linked official pages.',
    proposed_change = proposed_change || jsonb_build_object(
      'review_reason', 'Both are current official pages. The dedicated events FAQ is recommended because it is the more specific store-hours and events reference.',
      'selected_choice', case when status = 'promoted' then 'events_faq_9pm' else proposed_change->>'selected_choice' end,
      'review_options', jsonb_build_array(
        jsonb_build_object(
          'id', 'events_faq_9pm',
          'label', 'Use 9 PM',
          'summary', 'Saturday 11 AM-9 PM',
          'source_id', 'src-nextgen-hours-faq-2026-09-06',
          'source_label', 'Dedicated events FAQ',
          'source_url', 'https://www.nextgengames.la/service/events-at-next-gen/',
          'recommended', true,
          'note', 'User selected the dedicated official events FAQ: Mon-Fri noon-10 PM, Sat 11 AM-9 PM, Sun 11 AM-6 PM.',
          'weekly_hours', jsonb_build_object(
            '0', jsonb_build_array(jsonb_build_object('open', '11:00', 'close', '18:00')),
            '1', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00')),
            '2', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00')),
            '3', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00')),
            '4', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00')),
            '5', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00')),
            '6', jsonb_build_array(jsonb_build_object('open', '11:00', 'close', '21:00'))
          )
        ),
        jsonb_build_object(
          'id', 'contact_faq_6pm',
          'label', 'Use 6 PM',
          'summary', 'Saturday 11 AM-6 PM',
          'source_id', 'src-nextgen-contact-hours-2026-09-06',
          'source_label', 'Contact-page FAQ',
          'source_url', 'https://www.nextgengames.la/service/',
          'recommended', false,
          'note', 'User selected the official contact-page FAQ: Mon-Fri noon-10 PM, Sat-Sun 11 AM-6 PM.',
          'weekly_hours', jsonb_build_object(
            '0', jsonb_build_array(jsonb_build_object('open', '11:00', 'close', '18:00')),
            '1', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00')),
            '2', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00')),
            '3', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00')),
            '4', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00')),
            '5', jsonb_build_array(jsonb_build_object('open', '12:00', 'close', '22:00')),
            '6', jsonb_build_array(jsonb_build_object('open', '11:00', 'close', '18:00'))
          )
        )
      )
    )
where id = 'hours-review-next-gen-games-2026-09-06';

create or replace function public.review_venue_hours_signal(
  p_signal_id text,
  p_choice text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_signal public.signals%rowtype;
  v_option jsonb;
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select * into v_signal
  from public.signals
  where id = p_signal_id
    and category = 'operational'
    and promotion_target = 'venue_hours'
    and status in ('new', 'needs_followup')
  for update;

  if not found then
    raise exception 'reviewable venue-hours signal not found: %', p_signal_id;
  end if;

  select option_value into v_option
  from jsonb_array_elements(coalesce(v_signal.proposed_change->'review_options', '[]'::jsonb)) option_value
  where option_value->>'id' = p_choice;

  if v_option is null
     or jsonb_typeof(v_option->'weekly_hours') <> 'object'
     or nullif(v_option->>'source_id', '') is null then
    raise exception 'unknown venue-hours review choice: %', p_choice;
  end if;

  update public.signals
  set source_id = v_option->>'source_id',
      proposed_change = proposed_change
        || jsonb_build_object(
          'weekly_hours', v_option->'weekly_hours',
          'note', coalesce(v_option->>'note', proposed_change->>'note'),
          'selected_choice', p_choice
        )
  where id = p_signal_id;

  v_result := public.promote_venue_hours_signal(p_signal_id);

  insert into public.signal_user_states (user_id, signal_id, read_at)
  values (v_user_id, p_signal_id, timezone('utc', now()))
  on conflict (user_id, signal_id) do update
  set read_at = excluded.read_at,
      updated_at = timezone('utc', now());

  insert into public.user_activity (user_id, action_type, entity_type, entity_id, details)
  values (
    v_user_id,
    'accepted_hours_change',
    'venue',
    v_signal.related_entity_id,
    jsonb_build_object('signal_id', p_signal_id, 'choice', p_choice)
  );

  return v_result || jsonb_build_object('choice', p_choice);
end;
$$;

revoke all on function public.review_venue_hours_signal(text, text) from public, anon;
grant execute on function public.review_venue_hours_signal(text, text) to authenticated;

comment on function public.review_venue_hours_signal(text, text) is
  'Authenticated one-person app decision path for selecting a named source-backed venue-hours option.';
