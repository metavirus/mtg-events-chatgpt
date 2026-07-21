-- Recover direct Discord server/channel targets for the current route-only
-- monitoring-map entries. This is map maintenance only: no message-content
-- inspection conclusions, Signals, event rows, source facts, or research
-- assessments are added here.

update public.discord_access_profiles
set
  server_id = '1128125427257454672',
  notes = 'Direct server ID recovered during the 2026-07-20 map-maintenance pass. Channel confirmation only; no new message-content conclusions were drawn.'
where source_id = 'src-collectors-discord-2026-07-14';

update public.discord_access_profiles
set
  server_id = '587151201091452949',
  notes = 'Direct server ID recovered during the 2026-07-20 map-maintenance pass. Channel confirmation only; no new message-content conclusions were drawn.'
where source_id = 'src-kng-discord-2026-07-14';

update public.discord_access_profiles
set
  notes = 'Server/discovery ID was already known; direct watched-channel URLs were recovered during the 2026-07-20 map-maintenance pass. Channel confirmation only; no new message-content conclusions were drawn.'
where source_id = 'src-kingslayer-discord-route-2026-07-18';

update public.discord_access_profiles
set
  access_state = 'invite_gated',
  content_access = 'blocked',
  preferred_access_surface = 'invite_link',
  user_action_required = true,
  last_failed_access_method = 'Saved invite URL https://discord.gg/Sf4QFYdSBA opened to an Accept Invite gate in the signed-in browser during the 2026-07-20 direct-target recovery pass.',
  automation_suitability = 'blocked_tbd',
  notes = 'Prior accepted pass-2 notes reported accessible Hobby Overflow content, but the current map-maintenance pass could not recover direct channel IDs without accepting the saved invite. Preserve route value as medium; user action or a supplied direct channel URL is required before the next map-driven survey.'
where source_id = 'src-hobbyoverflow-discord-invite-2026-07-15';

update public.discord_channel_watchlist
set
  channel_id = '1128125617683050597',
  channel_url = 'https://discord.com/channels/1128125427257454672/1128125617683050597',
  notes = 'Direct channel ID/URL recovered during the 2026-07-20 map-maintenance pass; channel confirmation only.'
where id = 'discord-watch-collectors-mtg-announcements-events';

update public.discord_channel_watchlist
set
  channel_id = '1409363339049439275',
  channel_url = 'https://discord.com/channels/1128125427257454672/1409363339049439275',
  notes = 'Direct channel ID/URL recovered during the 2026-07-20 map-maintenance pass; channel confirmation only.'
where id = 'discord-watch-collectors-event-rules';

update public.discord_channel_watchlist
set
  channel_id = '589879336455372804',
  channel_url = 'https://discord.com/channels/587151201091452949/589879336455372804',
  notes = 'Direct channel ID/URL recovered during the 2026-07-20 map-maintenance pass; channel confirmation only.'
where id = 'discord-watch-krazy-commander';

update public.discord_channel_watchlist
set
  channel_id = '1250855113699098685',
  channel_url = 'https://discord.com/channels/587151201091452949/1250855113699098685',
  notes = 'Direct channel ID/URL recovered during the 2026-07-20 map-maintenance pass; channel confirmation only.'
where id = 'discord-watch-krazy-weekly-event-schedule';

update public.discord_channel_watchlist
set
  channel_id = '981247624273346580',
  channel_url = 'https://discord.com/channels/692870371157999626/981247624273346580',
  notes = 'Direct channel ID/URL recovered during the 2026-07-20 map-maintenance pass; channel confirmation only.'
where id = 'discord-watch-kingslayer-commander';

update public.discord_channel_watchlist
set
  channel_id = '958918000235397180',
  channel_url = 'https://discord.com/channels/692870371157999626/958918000235397180',
  notes = 'Direct channel ID/URL recovered during the 2026-07-20 map-maintenance pass; channel confirmation only.'
where id = 'discord-watch-kingslayer-mtg-announcements';

update public.discord_channel_watchlist
set
  access_status = 'blocked',
  monitoring_status = 'blocked_tbd',
  notes = 'Direct channel ID/URL not recovered during the 2026-07-20 map-maintenance pass because the saved Hobby Overflow invite opened to an Accept Invite gate. User action or supplied direct URL required before channel survey.'
where id in (
  'discord-watch-hobbyoverflow-tournament-schedule',
  'discord-watch-hobbyoverflow-magic-announcements'
);
