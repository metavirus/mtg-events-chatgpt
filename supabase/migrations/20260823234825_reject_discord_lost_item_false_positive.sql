update public.research_changes
set review_status = 'rejected',
    details = 'Rejected 2026-08-23: lost-item chatter after a completed Commander event is not an event candidate or planning update.'
where id = 'surface-material:discord-daily-survey:discord-watch-collectors-mtg-general:src-collectors-discord-2026-07-14:1540989750310207498'
  and review_status = 'accepted';

update public.entity_surface_coverage
set disposition = 'not_material',
    is_useful = false,
    materiality = 'low',
    summary = 'Collectors Lounge Discord was checked; the newest message was lost-item chatter about a completed Commander event, with no current planning update.',
    next_eligible_check_at = checked_at + interval '1 day',
    retry_condition = 'Continue normal daily monitoring; this message is a classified non-event.',
    terminal_outcome = null,
    content_fingerprint = '{"lastSeenMessageId":"1540989750310207498","lastSeenMessageAt":"2026-08-23T07:43:06.679Z","usefulCategories":[],"outcome":"quiet_coverage"}'
where idempotency_key = 'discord-daily-survey:discord-watch-collectors-mtg-general:src-collectors-discord-2026-07-14:1540989750310207498';

update public.discord_channel_watchlist
set latest_run_result = 'quiet',
    notes = concat_ws(' ', nullif(notes, ''), '[2026-08-23] Lost-item chatter after a completed event was rejected as a false event candidate; future classification requires current scheduling value.'),
    updated_at = now()
where id = 'discord-watch-collectors-mtg-general'
  and last_seen_message_id = '1540989750310207498';
