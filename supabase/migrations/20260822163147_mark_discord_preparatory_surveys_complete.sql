alter table public.discord_access_profiles
  add column if not exists preparatory_survey_completed_at timestamptz;

comment on column public.discord_access_profiles.preparatory_survey_completed_at is
  'Non-null after the bounded server/channel classification pass is complete. Completed profiles must not re-enter preparatory surveying without a new material route or access change.';

update public.discord_access_profiles
set
  preparatory_survey_completed_at = timestamptz '2026-08-22 16:30:02+00',
  safe_access_mode = 'ui_native_navigation_verified',
  last_successful_access_method = 'guarded UI-native bounded channel reads',
  last_checked = date '2026-08-22',
  notes = concat_ws(
    ' ',
    nullif(notes, ''),
    '[2026-08-22] Preparatory survey complete. Do not repeat preparatory surveying unless a new material route or access change appears.'
  ),
  updated_at = now()
where source_id in (
  'src-jjs-discord-magic-announcements-2026-07-18',
  'src-kingslayer-discord-route-2026-07-18',
  'src-kng-discord-2026-07-14'
);

update public.discord_channel_watchlist
set
  safe_access_mode = 'ui_native_navigation_verified',
  access_status = 'accessible',
  notes = concat_ws(
    ' ',
    nullif(notes, ''),
    '[2026-08-22] Guarded UI-native route and bounded content read verified.'
  ),
  updated_at = now()
where id in (
  'discord-watch-jjs-commander-night',
  'discord-watch-kingslayer-commander',
  'discord-watch-kingslayer-mtg-announcements',
  'discord-watch-krazy-commander'
);

update public.discord_channel_watchlist
set
  monitoring_status = 'paused',
  cadence = 'paused',
  latest_run_result = 'stale',
  safe_access_mode = 'ui_native_navigation_verified',
  access_status = 'accessible',
  notes = concat_ws(
    ' ',
    nullif(notes, ''),
    '[2026-08-22] Preparatory survey complete; channel is stale since 2024 and excluded from recurring monitoring.'
  ),
  updated_at = now()
where id = 'discord-watch-krazy-weekly-event-schedule';
