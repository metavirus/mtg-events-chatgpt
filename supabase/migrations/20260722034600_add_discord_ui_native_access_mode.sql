-- Distinguish a proven guarded Discord UI-native route from cold deep-link
-- navigation. This does not approve broad surveying; it records one safe
-- access modality proven by the protocol-only Collectors Lounge test.

alter table public.discord_access_profiles
  drop constraint if exists discord_access_profiles_safe_access_mode_check;

alter table public.discord_access_profiles
  add constraint discord_access_profiles_safe_access_mode_check
  check (safe_access_mode in (
    'manual_open_required',
    'direct_navigation_verified',
    'ui_native_navigation_verified',
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
    'ui_native_navigation_verified',
    'route_only_tbd',
    'join_or_role_gate',
    'blocked_unsafe_method'
  ));

