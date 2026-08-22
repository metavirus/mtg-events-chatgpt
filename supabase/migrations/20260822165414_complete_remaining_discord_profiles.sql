update public.discord_access_profiles
set preparatory_survey_completed_at = timestamptz '2026-08-22 16:54:14+00',
    safe_access_mode = case when source_id = 'src-legendary-creature-club-discord-2026-07-22' then safe_access_mode else 'ui_native_navigation_verified' end,
    last_successful_access_method = case when source_id = 'src-legendary-creature-club-discord-2026-07-22' then last_successful_access_method else 'guarded UI-native bounded channel reads' end,
    last_checked = date '2026-08-22',
    notes = concat_ws(' ', nullif(notes, ''), '[2026-08-22] Preparatory survey complete. Do not repeat preparatory surveying unless a new material route or access change appears.'),
    updated_at = now()
where preparatory_survey_completed_at is null;

update public.discord_channel_watchlist set
  channel_url = 'https://discord.com/channels/1226327240233586698/1423375364000059534', monitoring_status = 'active', cadence = 'occasional',
  safe_access_mode = 'ui_native_navigation_verified', access_status = 'accessible', latest_run_result = 'quiet',
  notes = concat_ws(' ', nullif(notes, ''), '[2026-08-22] Exact route recovered and guarded bounded content read passed.'), updated_at = now()
where id = 'discord-watch-hobbyoverflow-magic-announcements';

update public.discord_channel_watchlist set
  channel_url = 'https://discord.com/channels/1226327240233586698/1400583476155125942', monitoring_status = 'paused', cadence = 'paused',
  safe_access_mode = 'blocked_unsafe_method', access_status = 'blocked', latest_run_result = 'access_blocked',
  notes = concat_ws(' ', nullif(notes, ''), '[2026-08-22] Exact route recovered, but Discord acknowledgement prevents content render. Preparatory survey is terminal; route remains known and paused.'), updated_at = now()
where id = 'discord-watch-hobbyoverflow-tournament-schedule';

update public.discord_channel_watchlist set
  monitoring_status = 'active', safe_access_mode = 'ui_native_navigation_verified', access_status = 'accessible',
  notes = concat_ws(' ', nullif(notes, ''), '[2026-08-22] Guarded UI-native route and bounded content read verified.'), updated_at = now()
where id in ('discord-watch-paper-heros-hb-magic','discord-watch-magicandmonsters-shop-schedule','discord-watch-magicandmonsters-mtg-schedule','discord-watch-projectccg-mtg-announcements','discord-watch-projectccg-oc-announcements','discord-watch-projectccg-mtg-discussion','discord-watch-projectccg-oc-events');
