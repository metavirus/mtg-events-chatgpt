-- Operationalize the four Discord routes proven safe for guarded UI-native
-- bounded reads, and add only the missing independent resume/result fields.

alter table public.discord_channel_watchlist
  add column last_seen_message_id text,
  add column latest_run_result text;

alter table public.discord_channel_watchlist
  add constraint discord_channel_watchlist_latest_run_result_check
  check (latest_run_result is null or latest_run_result in (
    'useful', 'quiet', 'stale', 'access_blocked', 'needs_deeper_replay'
  ));

comment on column public.discord_channel_watchlist.last_seen_message_id is
  'Newest Discord message ID observed during the bounded read; independent from whether that message produced a useful finding.';

comment on column public.discord_channel_watchlist.latest_run_result is
  'Per-run result only. Quiet, stale, or blocked outcomes do not change durable route value.';

update public.discord_access_profiles
set
  safe_access_mode = 'ui_native_navigation_verified',
  preferred_access_surface = 'chrome',
  access_state = 'joined',
  content_access = 'accessible',
  user_action_required = false,
  automation_suitability = 'future_candidate',
  last_successful_access_method = 'Isolated Discord-read Chrome profile: Discord @me -> Stores/Local -> exact guild ID -> exact mapped channel ID; guard verified and bounded content read passed.',
  last_failed_access_method = 'Cold direct-channel navigation remains blocked/unverified because it previously triggered Discord membership/interstitial behavior.',
  last_checked = date '2026-07-22',
  safe_access_notes = 'Operational guarded path: start at Discord @me; verify guard heartbeat and inactive composer; identify Stores/Local by unique hover tooltip; select exact guild ID; select exact mapped channel ID; verify shell identity before a bounded read. Message acknowledgements remain blocked nonfatally when route identity and safety checks pass. The exact settings-proto/2 PATCH remains blocked and is conditionally nonfatal only when navigation succeeds independently. Cold direct navigation remains blocked.'
where source_id in (
  'src-collectors-discord-2026-07-14',
  'src-jjs-discord-magic-announcements-2026-07-18',
  'src-projectccg-discord-route-2026-07-18',
  'src-magicandmonsters-discord-route-2026-07-18'
);

update public.discord_channel_watchlist
set
  safe_access_mode = 'ui_native_navigation_verified',
  access_status = 'accessible',
  monitoring_status = 'active',
  last_checked = date '2026-07-22',
  last_checked_at = case id
    when 'discord-watch-collectors-mtg-announcements-events' then timestamptz '2026-07-23 00:52:33.774+00'
    when 'discord-watch-jjs-magic-announcements' then timestamptz '2026-07-23 00:53:38.943+00'
    when 'discord-watch-projectccg-mtg-announcements' then timestamptz '2026-07-23 00:53:55.092+00'
    when 'discord-watch-magicandmonsters-shop-schedule' then timestamptz '2026-07-23 00:54:11.595+00'
    else last_checked_at
  end,
  last_seen_message_at = case id
    when 'discord-watch-collectors-mtg-announcements-events' then timestamptz '2026-07-22 02:41:27.137+00'
    when 'discord-watch-jjs-magic-announcements' then timestamptz '2026-07-22 05:06:52.759+00'
    when 'discord-watch-projectccg-mtg-announcements' then timestamptz '2026-06-29 16:38:35.786+00'
    when 'discord-watch-magicandmonsters-shop-schedule' then timestamptz '2026-06-01 17:13:06.190+00'
    else last_seen_message_at
  end,
  last_seen_message_id = case id
    when 'discord-watch-collectors-mtg-announcements-events' then '1529317423629602847'
    when 'discord-watch-jjs-magic-announcements' then '1529354021540728934'
    when 'discord-watch-projectccg-mtg-announcements' then '1521193176944345181'
    when 'discord-watch-magicandmonsters-shop-schedule' then '1511055000611066007'
    else last_seen_message_id
  end,
  latest_run_result = case id
    when 'discord-watch-collectors-mtg-announcements-events' then 'quiet'
    when 'discord-watch-jjs-magic-announcements' then 'useful'
    when 'discord-watch-projectccg-mtg-announcements' then 'stale'
    when 'discord-watch-magicandmonsters-shop-schedule' then 'stale'
    else latest_run_result
  end,
  safe_access_notes = 'Verified operational path: Discord @me -> Stores/Local -> exact guild ID -> exact mapped channel ID. Exact labels and IDs are both required; cold direct URL remains blocked. Acknowledgements remain blocked nonfatally under the accepted guard contract; unread indicators must remain unchanged.'
where id in (
  'discord-watch-collectors-mtg-announcements-events',
  'discord-watch-jjs-magic-announcements',
  'discord-watch-projectccg-mtg-announcements',
  'discord-watch-magicandmonsters-shop-schedule'
);

update public.discord_access_profiles
set last_useful_signal_at = date '2026-07-22'
where source_id = 'src-jjs-discord-magic-announcements-2026-07-18';

update public.discord_channel_watchlist
set last_useful_signal_at = date '2026-07-22'
where id = 'discord-watch-jjs-magic-announcements';

