# Discord UI-native navigation safety test

Date: 2026-07-21 (America/Los_Angeles)

## Purpose

Test whether Discord's normal client navigation path can avoid the blocked
`members/@me?lurker=true` request without weakening the read-only guard:

`Discord @me -> Stores/Local -> mapped guild -> mapped channel`

This was a protocol test, not a Discord survey.

## Target

- Server: Collectors Lounge Cypress
- Guild ID: `1128125427257454672`
- Channel: `#mtg-announcements-and-events`
- Channel ID: `1128125617683050597`
- Mapped URL: `https://discord.com/channels/1128125427257454672/1128125617683050597`

## Mechanically constrained method

- Used only the dedicated isolated Discord-read Chrome profile.
- Opened only `https://discord.com/channels/@me` initially.
- Installed and verified the read-only guard before navigation.
- Used no typing, pasting, keyboard navigation, search, coordinate guessing, or
  message-area interaction.
- Hovered only structural collapsed-folder treeitems. The unique tooltip
  `Stores/Local` proved the intended folder before its single navigation click.
- Selected the server only through the unique stable treeitem ID
  `guildsnav___1128125427257454672`.
- Selected the channel only through its exact mapped channel destination.
- Kept mutation-request blocking and logging active throughout.

## Shell result

Pass.

- Exact guild/channel URL and page title were proven.
- Guard heartbeat remained active.
- Editable focus: none.
- Enabled mutating controls: zero.
- `members/@me?lurker=true`: not observed.
- Successful prohibited requests: none.
- Discord telemetry `POST /api/v9/science` attempts were blocked and logged.
- Message content was not inspected during the shell run.
- External Discord state changed: no.

Cold direct-channel navigation remains blocked. This result proves only the
guarded UI-native path through Discord home and the mapped sidebar hierarchy.

## Separately bounded content proof

Pass.

After the shell proof passed, the same guarded UI-native path was repeated in a
separate run and extracted only five recent visible messages.

- Message range: `2026-07-22T01:19:44.448Z` through
  `2026-07-22T02:41:27.137Z`.
- Raw message text was not stored in the durable run result.
- Useful high-signal finding: none in this tiny window.
- Run disposition: quiet/no action.
- Long-term route value was not reduced.
- `members/@me?lurker=true`: not observed.
- External Discord state changed: no.
- No Signal, event, source, Places, community, or research write was created.

## Durable monitoring-map result

The Collectors profile and mapped channel now use
`ui_native_navigation_verified`. Their safety notes preserve:

- entry route: Discord `@me`;
- folder: `Stores/Local`;
- exact guild and channel IDs;
- isolated Chrome profile requirement;
- cold deep-link access remains blocked;
- last checked and last-seen markers;
- quiet run result without a route-value downgrade.

No other Discord route was promoted.

## Krazy Nick's route-discovery extension (2026-07-22)

The approved first-visit `route_discovery` mode was applied to one already
joined route:

`Discord @me -> Stores/Local -> Krazy Nick's Games -> #weekly-event-schedule`

- Guild ID: `587151201091452949`.
- Channel ID: `1250855113699098685`.
- Folder identity: unique `Stores/Local` hover tooltip.
- Guard heartbeat remained active; editable focus was absent; enabled mutators
  remained zero.
- No cold deep link, typing, paste, keyboard navigation, search, coordinate
  guessing, or message-area interaction was used.
- Three visible messages were read, from 2024-06-19 through 2024-11-08.
- Current useful finding: none. This is a quiet result for this run, not a route
  downgrade.
- Discord Events surface: no distinct Events control or visible count was
  observed in the tested shell. The runner did not click or inspect an Events
  control.
- Events detection is guild-bound. A scheduled-event badge owned by Legendary
  Creature Club was visible elsewhere in the server rail during verification;
  the corrected detector rejected it instead of attributing it to Krazy Nick's.
- Blocked requests: Discord telemetry only.
- Unread/mention indicator: unchanged.
- External Discord state changed: no.

This route is eligible for `ui_native_navigation_verified` routine use through
the exact recorded path. Cold direct-channel navigation remains blocked. No
Signal, Event, Source, Places, assessment, or other research write was created.

## Boundary after this test

The safety hypothesis is proven for one mapped, already-joined route. This does
not authorize broad Discord surveying or daily automation. The next expansion,
if approved, should be a tiny map-driven pilot that applies the same UI-native
identity proof independently to each selected route and fails closed if its
folder, guild, channel, guard, or network state cannot be proven.
