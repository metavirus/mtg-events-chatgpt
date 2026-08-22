update public.discord_channel_watchlist
set monitoring_status = 'paused',
    cadence = 'paused',
    latest_run_result = 'needs_deeper_replay',
    notes = concat_ws(' ', nullif(notes, ''), '[2026-08-22] Local guarded read passed, but the headless cloud session could not prove the expected channel label. Preparatory survey remains complete; route is terminally paused from recurring cloud monitoring until a material access change.'),
    updated_at = now()
where id in (
  'discord-watch-hobbyoverflow-magic-announcements',
  'discord-watch-paper-heros-hb-magic'
);
