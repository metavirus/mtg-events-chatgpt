-- Add the two resume markers proven necessary by the first map-driven survey.
-- Keep the original date fields for coarse queue compatibility.

alter table public.discord_channel_watchlist
  add column last_checked_at timestamptz,
  add column last_seen_message_at timestamptz;

comment on column public.discord_channel_watchlist.last_checked_at is
  'Timestamp of the most recent completed inspection; unlike last_checked, distinguishes multiple runs on one date.';

comment on column public.discord_channel_watchlist.last_seen_message_at is
  'Newest message timestamp observed during inspection; a lightweight resume cursor, not a claim that the message was useful.';

update public.discord_channel_watchlist
set
  channel_id = '1101627452893171792',
  channel_url = 'https://discord.com/channels/690253341330374772/1101627452893171792'
where id = 'discord-watch-magicandmonsters-mtg-schedule';

update public.discord_channel_watchlist
set
  channel_id = '1459296900367777913',
  channel_url = 'https://discord.com/channels/1436522338572046501/1459296900367777913'
where id = 'discord-watch-projectccg-oc-events';

update public.discord_channel_watchlist
set
  channel_id = '1463649071485948049',
  channel_url = 'https://discord.com/channels/1436522338572046501/1463649071485948049'
where id = 'discord-watch-projectccg-mtg-announcements';

update public.discord_channel_watchlist
set
  channel_id = '1459297227028693278',
  channel_url = 'https://discord.com/channels/1436522338572046501/1459297227028693278'
where id = 'discord-watch-projectccg-mtg-discussion';

update public.discord_access_profiles
set
  role_gate = 'present',
  notes = notes || ' The inspected ProjectCCG channels display as limited/locked channels, but the existing joined account has access; no further user action was required.'
where source_id = 'src-projectccg-discord-route-2026-07-18';

update public.discord_channel_watchlist
set
  last_checked = date '2026-07-20',
  last_checked_at = timezone('utc', now()),
  last_seen_message_at = case id
    when 'discord-watch-jjs-magic-announcements' then timestamptz '2026-07-21 00:57:00+00'
    when 'discord-watch-jjs-commander-night' then timestamptz '2025-05-31 18:12:00+00'
    when 'discord-watch-magicandmonsters-shop-schedule' then timestamptz '2026-06-01 17:13:00+00'
    when 'discord-watch-magicandmonsters-mtg-schedule' then timestamptz '2025-02-11 19:44:00+00'
    when 'discord-watch-projectccg-oc-announcements' then timestamptz '2026-07-19 19:03:00+00'
    when 'discord-watch-projectccg-oc-events' then timestamptz '2026-07-10 19:31:00+00'
    when 'discord-watch-projectccg-mtg-announcements' then timestamptz '2026-06-29 16:38:00+00'
    when 'discord-watch-projectccg-mtg-discussion' then timestamptz '2026-07-21 01:56:00+00'
    else last_seen_message_at
  end
where monitoring_status = 'active';

update public.discord_channel_watchlist
set last_useful_signal_at = date '2026-07-20'
where id in (
  'discord-watch-jjs-magic-announcements',
  'discord-watch-projectccg-mtg-discussion'
);

update public.discord_access_profiles
set
  last_checked = date '2026-07-20',
  last_useful_signal_at = case
    when source_id in (
      'src-jjs-discord-magic-announcements-2026-07-18',
      'src-projectccg-discord-route-2026-07-18'
    ) then date '2026-07-20'
    else last_useful_signal_at
  end;

create index discord_channel_watchlist_resume_idx
  on public.discord_channel_watchlist(
    monitoring_status, priority, cadence, last_checked_at
  );
