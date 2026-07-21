-- Add explicit Discord safety modes to the monitoring map.
--
-- Important: this migration does not certify any Discord route for
-- agent-driven browser navigation. Existing accessible routes are deliberately
-- set to manual_open_required until a protocol-only direct-navigation safety
-- test proves a mechanically safe method.

alter table public.discord_access_profiles
  add column if not exists safe_access_mode text not null default 'manual_open_required',
  add column if not exists safe_access_notes text;

alter table public.discord_channel_watchlist
  add column if not exists safe_access_mode text not null default 'manual_open_required',
  add column if not exists safe_access_notes text;

alter table public.discord_access_profiles
  drop constraint if exists discord_access_profiles_safe_access_mode_check;

alter table public.discord_access_profiles
  add constraint discord_access_profiles_safe_access_mode_check
  check (safe_access_mode in (
    'manual_open_required',
    'direct_navigation_verified',
    'route_only_tbd',
    'join_or_role_gate',
    'blocked_unsafe_method'
  ));

alter table public.discord_channel_watchlist
  drop constraint if exists discord_channel_watchlist_safe_access_mode_check;

alter table public.discord_channel_watchlist
  add constraint discord_channel_watchlist_safe_access_mode_check
  check (safe_access_mode in (
    'manual_open_required',
    'direct_navigation_verified',
    'route_only_tbd',
    'join_or_role_gate',
    'blocked_unsafe_method'
  ));

update public.discord_access_profiles
set
  safe_access_mode = case
    when user_action_required
      or access_state in ('invite_gated', 'join_required', 'role_gated', 'permission_gated', 'blocked')
      or content_access in ('blocked', 'role_gated', 'permission_gated')
      then 'join_or_role_gate'
    when server_id is null
      then 'route_only_tbd'
    else 'manual_open_required'
  end,
  safe_access_notes = case
    when user_action_required
      or access_state in ('invite_gated', 'join_required', 'role_gated', 'permission_gated', 'blocked')
      or content_access in ('blocked', 'role_gated', 'permission_gated')
      then 'Requires user action or gate resolution; Codex must stop rather than join, request roles, or improvise navigation.'
    when server_id is null
      then 'Route exists but stable safe direct access is not recovered; treat as TBD until the user supplies/opens the exact target or a protocol-only safe navigation test proves access.'
    else 'Known route may be useful, but agent-driven direct navigation is not yet safely demonstrated; user must manually open the exact channel/message or provide screenshot/paste.'
  end
where source_id like '%discord%';

update public.discord_channel_watchlist
set
  safe_access_mode = case
    when access_status in ('blocked', 'role_gated', 'permission_gated')
      or monitoring_status in ('blocked', 'blocked_tbd')
      then 'join_or_role_gate'
    when channel_url is null or channel_id is null
      then 'route_only_tbd'
    else 'manual_open_required'
  end,
  safe_access_notes = case
    when access_status in ('blocked', 'role_gated', 'permission_gated')
      or monitoring_status in ('blocked', 'blocked_tbd')
      then 'Channel requires gate resolution or is blocked; Codex must stop and request user action rather than interact.'
    when channel_url is null or channel_id is null
      then 'Channel target is not sufficiently recovered for safe access; preserve as route-only/TBD.'
    else 'Direct channel URL is recorded, but safe agent-driven direct navigation is not yet demonstrated; user must manually open this channel/message or supply screenshot/paste.'
  end
where profile_source_id like '%discord%';
