-- Operational Discord monitoring map.
-- Existing sources/entity_sources remain the canonical surface registry.
-- These tables preserve access mechanics and a bounded channel watch plan.
-- Browser clients receive no privileges; controlled Steward/database tooling
-- is the only write path for this operational metadata.

create table public.discord_access_profiles (
  source_id text primary key references public.sources(id) on delete cascade,
  server_id text,
  server_name text not null,
  access_state text not null default 'unknown'
    check (access_state in (
      'joined', 'invite_gated', 'public_only', 'blocked', 'unknown'
    )),
  content_access text not null default 'not_inspected'
    check (content_access in (
      'accessible', 'partial', 'blocked', 'not_inspected'
    )),
  role_gate text not null default 'unknown'
    check (role_gate in ('none_observed', 'present', 'unknown')),
  preferred_access_surface text not null default 'manual_unknown'
    check (preferred_access_surface in (
      'in_app_browser', 'chrome', 'public_page', 'invite_link', 'manual_unknown'
    )),
  user_action_required boolean not null default false,
  known_internal_target text,
  last_successful_access_method text,
  last_failed_access_method text,
  automation_suitability text not null default 'manual_session'
    check (automation_suitability in (
      'manual_session', 'public_metadata_only', 'future_candidate', 'blocked_tbd'
    )),
  route_value text not null default 'unknown'
    check (route_value in ('high', 'medium', 'low', 'unknown')),
  monitoring_cadence text not null default 'occasional'
    check (monitoring_cadence in (
      'daily', 'weekly', 'occasional', 'manual_only', 'paused', 'blocked_tbd'
    )),
  monitoring_reason text not null check (length(btrim(monitoring_reason)) > 0),
  last_checked date,
  last_useful_signal_at date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index discord_access_profiles_cadence_idx
  on public.discord_access_profiles(monitoring_cadence, route_value);

create trigger discord_access_profiles_set_updated_at
before update on public.discord_access_profiles
for each row execute function public.set_updated_at();

alter table public.discord_access_profiles enable row level security;

revoke all on table public.discord_access_profiles from anon, authenticated;
grant select, insert, update, delete
  on table public.discord_access_profiles to service_role;

create table public.discord_channel_watchlist (
  id text primary key,
  profile_source_id text not null
    references public.discord_access_profiles(source_id) on delete cascade,
  channel_source_id text references public.sources(id) on delete set null,
  channel_id text,
  channel_name text not null check (length(btrim(channel_name)) > 0),
  channel_url text,
  channel_type text not null
    check (channel_type in (
      'announcements', 'events', 'schedule', 'lfg', 'format', 'general',
      'operational', 'other'
    )),
  priority text not null default 'medium'
    check (priority in ('high', 'medium', 'low')),
  cadence text not null default 'occasional'
    check (cadence in (
      'daily', 'weekly', 'occasional', 'manual_only', 'paused', 'blocked_tbd'
    )),
  reason_to_monitor text not null
    check (length(btrim(reason_to_monitor)) > 0),
  expected_signal_types text[] not null default '{}',
  access_status text not null default 'tbd'
    check (access_status in ('accessible', 'partial', 'blocked', 'tbd')),
  noise_level text not null default 'unknown'
    check (noise_level in ('low', 'medium', 'high', 'unknown')),
  last_checked date,
  last_useful_signal_at date,
  monitoring_status text not null default 'active'
    check (monitoring_status in ('active', 'paused', 'blocked_tbd')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (profile_source_id, channel_name)
);

create index discord_channel_watchlist_queue_idx
  on public.discord_channel_watchlist(
    monitoring_status, priority, cadence, last_checked
  );

create index discord_channel_watchlist_profile_idx
  on public.discord_channel_watchlist(profile_source_id);

create index discord_channel_watchlist_source_idx
  on public.discord_channel_watchlist(channel_source_id)
  where channel_source_id is not null;

create trigger discord_channel_watchlist_set_updated_at
before update on public.discord_channel_watchlist
for each row execute function public.set_updated_at();

alter table public.discord_channel_watchlist enable row level security;

revoke all on table public.discord_channel_watchlist from anon, authenticated;
grant select, insert, update, delete
  on table public.discord_channel_watchlist to service_role;

insert into public.discord_access_profiles (
  source_id,
  server_id,
  server_name,
  access_state,
  content_access,
  role_gate,
  preferred_access_surface,
  user_action_required,
  known_internal_target,
  last_successful_access_method,
  automation_suitability,
  route_value,
  monitoring_cadence,
  monitoring_reason,
  last_checked,
  last_useful_signal_at,
  notes
) values
  (
    'src-magicandmonsters-discord-route-2026-07-18',
    '690253341330374772',
    'Magic & Monsters',
    'joined',
    'accessible',
    'none_observed',
    'in_app_browser',
    false,
    '#shop-schedule and #mtg-schedule',
    'Existing signed-in in-app browser Discord session',
    'manual_session',
    'medium',
    'occasional',
    'Useful for source-health changes, drop-in Commander context, and future special MTG announcements.',
    '2026-07-20',
    '2026-05-31',
    'Current pilot found a useful source-health contradiction. Quiet future checks should remain run-level observations unless a new actionable signal appears.'
  ),
  (
    'src-projectccg-discord-route-2026-07-18',
    '1436522338572046501',
    'ProjectCCG Online Community',
    'joined',
    'accessible',
    'none_observed',
    'in_app_browser',
    false,
    '#oc-announcements, #oc-events, #mtg-announcements, and #mtg-discussion',
    'Existing signed-in in-app browser Discord session',
    'manual_session',
    'high',
    'weekly',
    'High-value route for same-day closures, parking/access, cancellations, event displacement, MTG announcements, and Commander/LFG texture.',
    '2026-07-20',
    '2026-07-19',
    'Shared two-store community route. Santa Ana/OC findings must remain branch-aware; Alhambra-specific content still needs targeted replay.'
  ),
  (
    'src-jjs-discord-magic-announcements-2026-07-18',
    '1055756955043495946',
    'JJ''s Collectibles',
    'joined',
    'accessible',
    'none_observed',
    'in_app_browser',
    false,
    '#magic-announcements and #commander-night',
    'Existing signed-in in-app browser Discord session',
    'manual_session',
    'high',
    'weekly',
    'Nearby high-fit route for current Magic announcements, image-based specials, Commander guidance, bracket texture, and pod formation.',
    '2026-07-20',
    '2026-07-19',
    'Anchored to the Magic announcements source; the Commander channel remains a separate first-class Evidence source and watchlist link.'
  );

insert into public.discord_channel_watchlist (
  id,
  profile_source_id,
  channel_source_id,
  channel_id,
  channel_name,
  channel_url,
  channel_type,
  priority,
  cadence,
  reason_to_monitor,
  expected_signal_types,
  access_status,
  noise_level,
  last_checked,
  last_useful_signal_at,
  monitoring_status,
  notes
) values
  (
    'discord-watch-magicandmonsters-shop-schedule',
    'src-magicandmonsters-discord-route-2026-07-18',
    null,
    '928555906017398785',
    '#shop-schedule',
    'https://discord.com/channels/690253341330374772/928555906017398785',
    'schedule',
    'high',
    'occasional',
    'Detect current operating-hour, regular-schedule, and source-health changes that may override older MTG assumptions.',
    array['operational', 'source_health', 'event_opportunity'],
    'accessible',
    'low',
    '2026-07-20',
    '2026-05-31',
    'active',
    'Summer 2026 post supplied the pilot source-health correction.'
  ),
  (
    'discord-watch-magicandmonsters-mtg-schedule',
    'src-magicandmonsters-discord-route-2026-07-18',
    null,
    null,
    '#mtg-schedule',
    null,
    'schedule',
    'medium',
    'occasional',
    'Check whether the currently stale-looking MTG schedule receives new prerelease, promotion, Commander, or tournament posts.',
    array['event_opportunity', 'source_health'],
    'accessible',
    'low',
    '2026-07-20',
    '2025-02-11',
    'active',
    'No current 2026 routine appeared in the sampled pilot slice.'
  ),
  (
    'discord-watch-projectccg-oc-announcements',
    'src-projectccg-discord-route-2026-07-18',
    null,
    '1459295590902136954',
    '#oc-announcements',
    'https://discord.com/channels/1436522338572046501/1459295590902136954',
    'operational',
    'high',
    'weekly',
    'Catch closures, altered hours, parking/access constraints, cancellations, and reopening notices before a visit.',
    array['operational', 'source_health'],
    'accessible',
    'low',
    '2026-07-20',
    '2026-07-19',
    'active',
    'The July 17-19 closure/reopen sequence was resolved; it proves route value but is not an active landing-page Signal.'
  ),
  (
    'discord-watch-projectccg-oc-events',
    'src-projectccg-discord-route-2026-07-18',
    null,
    null,
    '#oc-events',
    null,
    'events',
    'medium',
    'weekly',
    'Identify branch-specific specials and displacement risk across the Santa Ana/OC tournament schedule.',
    array['event_opportunity', 'registration', 'source_health'],
    'accessible',
    'medium',
    '2026-07-20',
    '2026-07-10',
    'active',
    'Keep branch identity separate from Alhambra and from MTG OC shorthand.'
  ),
  (
    'discord-watch-projectccg-mtg-announcements',
    'src-projectccg-discord-route-2026-07-18',
    null,
    null,
    '#mtg-announcements',
    null,
    'announcements',
    'high',
    'weekly',
    'Capture current MTG schedule changes, specials, cancellations, draft/Commander displacement, and prerelease details.',
    array['event_opportunity', 'operational', 'registration', 'source_health'],
    'accessible',
    'low',
    '2026-07-20',
    '2026-06-06',
    'active',
    'Pilot found useful Standard and prior cancellation/special-event evidence.'
  ),
  (
    'discord-watch-projectccg-mtg-discussion',
    'src-projectccg-discord-route-2026-07-18',
    null,
    null,
    '#mtg-discussion',
    null,
    'lfg',
    'medium',
    'occasional',
    'Sample Commander/LFG activity, turnout, power/proxy texture, and whether ad hoc pod requests receive useful responses.',
    array['community_activity', 'venue_fit'],
    'accessible',
    'medium',
    '2026-07-20',
    '2026-07-18',
    'active',
    'One recent Commander pod inquiry is useful texture, not yet a reliable meetup pattern.'
  ),
  (
    'discord-watch-jjs-magic-announcements',
    'src-jjs-discord-magic-announcements-2026-07-18',
    'src-jjs-discord-magic-announcements-2026-07-18',
    '1354561517160239296',
    '#magic-announcements',
    'https://discord.com/channels/1055756955043495946/1354561517160239296',
    'announcements',
    'high',
    'weekly',
    'Capture nearby current Magic schedules, image-based special events, prerelease details, registration timing, and branch-specific changes.',
    array['event_opportunity', 'registration', 'operational'],
    'accessible',
    'low',
    '2026-07-20',
    '2026-07-19',
    'active',
    'Images are material event evidence and must be inspected, not treated as decorative attachments.'
  ),
  (
    'discord-watch-jjs-commander-night',
    'src-jjs-discord-magic-announcements-2026-07-18',
    'src-jjs-discord-commander-channel-2026-07-18',
    '1354561796203085976',
    '#commander-night',
    'https://discord.com/channels/1055756955043495946/1354561796203085976',
    'format',
    'high',
    'weekly',
    'Track Commander schedule guidance, random-pod mechanics, bracket/power texture, proxy norms, turnout, and solo-arrival usefulness.',
    array['community_activity', 'venue_fit', 'event_opportunity'],
    'accessible',
    'medium',
    '2026-07-20',
    '2026-07-19',
    'active',
    'Standing guidance is useful; repeated checks should distinguish quiet runs from permanent route value.'
  );
