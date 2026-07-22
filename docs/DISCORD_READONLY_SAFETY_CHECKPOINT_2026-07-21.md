# Discord read-only safety checkpoint

Date: 2026-07-21

Status: Cold-deep-link Discord content-read remains blocked/TBD at accepted
boundary `5e055e8`. Guarded UI-native access is independently proven for
Collectors Lounge and JJ's, but it did not graduate to a universal survey
method because ProjectCCG and Magic & Monsters triggered blocked message
acknowledgement requests during server selection.
This checkpoint records the current safety baseline so future work does not
reconstruct it from chat memory or keep trying the blocked path.

## Accepted baseline

- `006edfc`: autonomous read-only Discord access design recorded.
- `9d6610d`: local Discord-like fixture proof passed without accessing Discord.
- `7a8121d`: production-form read-only guard and isolated profile workspace
  created.
- `6a93c0a`: first real shell test failed closed; mutation guard blocked a
  Discord-shaped POST and no external state changed.
- `164ee0d`: shell identity check passed for Paper Hero using non-message route
  evidence only.
- `28e3b7b`: first content-read pilot failed closed at login; no content read.
- `cc974af`: retry after isolated-profile setup reached the Paper Hero shell but
  blocked a `members/@me?lurker=true` request before content extraction.
- `0fd3b93`: ephemeral Discord interstitial handling clarified.
- `1ac0f99`: the approved one-retry rule was implemented and failed closed on
  JJ's, Magic & Monsters, and Collectors without reading content or changing
  Discord state.

## Current safety rule

Discord remains a high-risk external-state surface. A read-only intention is not
enough; the method must be mechanically constrained.

Near-term allowed workflows:

1. the user supplies a screenshot or paste;
2. the user manually opens an exact Discord channel/message and asks Codex to
   read only the visible content;
3. the mapped Collectors and JJ's routes may use their proven guarded UI-native paths
   during a separately approved bounded pass;
4. another route may use guarded UI-native navigation only after its folder,
   guild, and channel identity are independently proven under the same protocol.

Cold direct-channel navigation is not approved for content reads because the
Discord client attempts an undocumented `members/@me?lurker=true` request
before extraction. The proven Collectors exception instead uses:

1. use the dedicated isolated Discord-read profile;
2. open Discord `@me` and use structurally proven folder, guild, and channel
   navigation only;
3. keep page-level composer/mutating-control disabling active;
4. keep network mutation blocking/logging active;
5. verify guard heartbeat, expected route identity, no editable focus, and no
   enabled mutating controls before extraction;
6. extract only bounded visible content if all guards pass.

Forbidden:

- typing or pasting into Discord;
- clicking through Discord gates/interstitials;
- allowing membership/lurker, join, role, reaction, reply, upload, send,
  settings, or other mutating requests automatically;
- spending more implementation time trying to route around
  `members/@me?lurker=true` under the current browser-driven approach;
- broad Discord surveying;
- treating quiet or blocked run results as long-term route-value downgrades.

## Ephemeral interstitial rule

Discord sometimes shows or triggers a transient visibility/interstitial state.
That is a safety/navigation condition, not research evidence.

If the correct route shell is reached but Discord attempts a
`members/@me?lurker=true`-style request before content can be read:

1. block and log the request;
2. close the isolated Discord-read context;
3. reopen the exact same mapped channel URL once by direct navigation;
4. continue only if it opens cleanly with no gate, mutating request, editable
   focus, or enabled mutating control.

If the condition recurs, mark the channel blocked for that run only and preserve
the route's durable long-term value unless repeated safe checks justify a later
priority change.

## Current operational state

### Guarded UI-native exception proven on Collectors Lounge

The 2026-07-21 protocol test proved one narrower, safe access modality that
avoids the cold-deep-link lurker behavior:

`Discord @me -> Stores/Local -> exact guild ID -> exact channel ID`

For Collectors Lounge Cypress `#mtg-announcements-and-events`, both the
shell-only test and a separate bounded five-message read passed with the guard
active, no editable focus, zero enabled mutating controls, no lurker request,
no prohibited successful request, and no external Discord state change. The
five-message window was quiet and did not produce research or app-data writes.

Only that mapped profile/channel is recorded as
`ui_native_navigation_verified`. Cold direct-channel navigation remains
blocked, and other routes remain at their prior safety modes until independently
proven. Broad surveying and automation remain unapproved. See
`research/runs/2026-07-21-discord-ui-native-navigation-safety-test.md`.

### Replication result

The bounded replication pass independently proved JJ's `#magic-announcements`
through `@me -> Stores/Local -> exact guild -> exact channel`, including a safe
five-message read. ProjectCCG and Magic & Monsters failed closed during server
selection when Discord attempted message acknowledgement POSTs. Those writes
were blocked, their target content was not read, and their route values were not
lowered.

Therefore UI-native navigation remains a per-route verified capability, not a
globally graduated survey method. Do not allowlist message acknowledgements to
make blocked routes pass. See
`research/runs/2026-07-21-discord-ui-native-replication-graduation.md`.

- The same blocked membership/lurker request has now appeared across Paper
  Hero, JJ's, Magic & Monsters, Collectors Lounge, and Krazy Nick's.
- Every tested route proved the expected authenticated server/channel shell
  before message extraction.
- A manual one-time open did not resolve Collectors Lounge's later direct-URL
  behavior. JJ's was already joined by the user, and the account previously had
  posting access in Krazy Nick's, so a simple missing-login or never-joined
  explanation is not sufficient.
- No Discord message content was read by Codex in these guarded pilots.
- No Signals, events, source notes, or research conclusions were created from
  the guarded pilots.
- No external Discord state changed.

## Next safe options

Current decision: keep cold-deep-link content reads blocked/TBD and do not
allowlist `members/@me?lurker=true` or message acknowledgement writes. Guarded
UI-native paths are proven only for Collectors and JJ's. The blocker diagnosis remains
recorded in `research/runs/2026-07-21-discord-lurker-blocker-diagnosis.md`.

Do not treat this one-route proof as authorization for broad Discord surveys.
Carry forward the route map, priorities, expected signal types, isolated
profile, read-only guard/harness, blocker diagnosis, and the rule that
quiet/blocked runs do not reduce long-term route value.

Future Discord work should be one of:

- manual screenshot/paste or user-opened visible-content analysis;
- a separately approved tiny UI-native pilot using independently proven mapped
  routes and the same fail-closed guard;
- a separately approved non-browser or otherwise mechanically safer access
  strategy;
- a separate decision to evaluate a narrowly scoped allowlist, with stronger
  evidence than currently exists.

## Separate active issue

The user reported after this checkpoint that the app does not work. Treat that
as a separate app triage lane, not as a Discord research finding.
