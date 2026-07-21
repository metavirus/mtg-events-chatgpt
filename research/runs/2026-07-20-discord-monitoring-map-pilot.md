# Discord Monitoring Map Pilot

Date: 2026-07-20

## Purpose

Create the first structured access and channel-watch records for already
accepted Discord work. This is monitoring memory, not Discord automation and
not a new content-research pass.

## Model added

- `discord_access_profiles` records how a known Discord route is reached,
  whether the server/content is accessible, any observed gate, the last working
  access method, route value, cadence, and the next useful internal target.
- `discord_channel_watchlist` records the channels worth checking, their
  purpose, priority, cadence, expected signal types, access/noise state, and
  last useful result.
- Existing `sources` and `entity_sources` remain the route and entity-link
  registry. Existing `signals` remains the destination for sparse,
  attention-worthy findings.
- No survey-history table was added. Accepted run notes remain sufficient until
  recurring surveys create a demonstrated need for structured observations.

## Pilot records

Three previously inspected, joined, accessible routes were mapped:

1. **Magic & Monsters Discord**
   - Working access: signed-in in-app browser session.
   - Watch targets: `#shop-schedule` and `#mtg-schedule`.
   - Cadence: occasional.
   - Why: operational direction, source health, and any renewed Magic schedule.

2. **ProjectCCG Online Community Discord**
   - Working access: signed-in in-app browser session.
   - Watch targets: `#oc-announcements`, `#oc-events`, `#mtg-announcements`,
     and `#mtg-discussion`.
   - Cadence: weekly.
   - Why: branch-aware closures/cancellations, event opportunities, and MTG
     coordination/community texture.

3. **JJ's Collectibles Discord**
   - Working access: signed-in in-app browser session.
   - Watch targets: `#magic-announcements` and `#commander-night`.
   - Cadence: weekly.
   - Why: prerelease/special-event announcements and Commander coordination.

This produced 3 access-profile rows and 8 channel-watch rows. No new Discord
servers or channels were inspected to create the pilot.

## Safety boundary

- Both monitoring tables have RLS enabled.
- `anon` and `authenticated` have no privileges on either table.
- Only `service_role` has table CRUD privileges.
- The hosted browser app did not gain operational-monitoring read or write
  access.
- No app code, canonical events, Places assessments, Signals, auth settings, or
  JSON recovery exports changed.

## Validation

- The migration compiled in a transaction-rollback probe before the live apply.
- Live readback: 3 profiles and 8 watch rows.
- Broken source/profile/channel relationships: 0.
- Browser select/write privilege checks: false for both roles and both tables.
- RLS enabled on both tables.
- Supabase security advisor reported only the expected informational
  `RLS enabled with no policy` notices for these deliberately service-only
  tables. The unrelated project-level leaked-password warning remains outside
  this tranche.
- Performance advisor found no new missing foreign-key index for these tables.

## Still manual or TBD

- Monitoring still uses the user's existing signed-in browser session.
- No scheduled surveys, browser-login persistence, or automated Discord access
  was added.
- Alhambra-specific ProjectCCG channel replay remains a named future check.
- Some watch targets retain names without stable channel IDs until a future
  bounded inspection confirms them.
- Signal-yield history and survey observations remain in run notes for now.

## Result

Future bounded Discord passes can now read the access profile and watchlist
first, open the last known working surface, inspect only the due/high-value
channels, and preserve a quiet run without downgrading the route itself.
