# Discord direct-target recovery pass

- Date: 2026-07-20
- Mode: map-maintenance only
- Scope: active Discord monitoring-map watch rows missing direct server/channel
  URLs or stable IDs
- Live writes: applied as migration
  `20260721042613_recover_discord_channel_direct_targets.sql`
- Browser interaction: read-only channel confirmation only; no messages,
  reactions, joins, settings changes, or social interaction

## Purpose

This pass followed the accepted monitoring-map validation rule: before a broader
Discord survey, recover direct server/channel URLs for route-only watchlist
entries so future checks can start from stable targets instead of rediscovering
servers and channels.

This was not a content survey. Visible Discord message fragments may appear in
the browser DOM while confirming channels, but no new message-content
conclusions, Signals, event rows, source facts, Places assessments, or research
interpretations were created from this pass.

## Recovered direct targets

### Collectors Lounge - Cypress Discord

- Server ID recovered: `1128125427257454672`
- `#mtg-announcements-and-events`:
  `https://discord.com/channels/1128125427257454672/1128125617683050597`
- `#event-rules`:
  `https://discord.com/channels/1128125427257454672/1409363339049439275`
- Access result: joined/accessible in the signed-in browser session.

### Krazy Nick's Games Discord

- Server ID recovered: `587151201091452949`
- `#commander`:
  `https://discord.com/channels/587151201091452949/589879336455372804`
- `#weekly-event-schedule`:
  `https://discord.com/channels/587151201091452949/1250855113699098685`
- Access result: joined/accessible in the signed-in browser session.

### Kingslayer Games Discord

- Server ID already known: `692870371157999626`
- `#commander`:
  `https://discord.com/channels/692870371157999626/981247624273346580`
- `#mtg-announcements`:
  `https://discord.com/channels/692870371157999626/958918000235397180`
- Access result: joined/accessible in the signed-in browser session.

## Not recovered

### Hobby Overflow Discord

- Saved route: `https://discord.gg/Sf4QFYdSBA`
- Current result: the saved invite opened to an `Accept Invite` gate in the
  signed-in browser.
- Disposition: route value remains medium, but channel-level monitoring is
  blocked/TBD until the user accepts the invite in the relevant browser session
  or supplies a direct channel URL.
- No join was performed during this pass.

## Validation

- Supabase readback confirmed 6 recovered direct channel URLs.
- Supabase readback confirmed Hobby Overflow remains preserved as a route with
  medium route value but blocked/TBD channel access.
- No Signals, event rows, source facts, app code, or canonical JSON were changed.
