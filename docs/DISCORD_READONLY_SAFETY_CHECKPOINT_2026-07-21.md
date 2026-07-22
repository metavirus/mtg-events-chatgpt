# Discord read-only safety checkpoint

Date: 2026-07-21

Status: Browser-driven Discord content-read is blocked/TBD at accepted boundary
`5e055e8`. This checkpoint records the current accepted safety baseline so
future work does not reconstruct it from chat memory or keep trying to route
around the same blocker.

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
3. a future separately approved access strategy is designed and accepted.

The following guarded-browser method exists and remains useful infrastructure,
but it is not currently approved for content reads because the Discord client
attempts an undocumented `members/@me?lurker=true` request before extraction:

1. use the dedicated isolated Discord-read profile;
2. open exactly one mapped channel URL by direct navigation;
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

Current decision: keep content-read automation blocked/TBD. The one-retry rule
is already implemented, and merely opening a channel once has not cleared the
request. Do not allowlist `members/@me?lurker=true` without separate approval
and stronger evidence that its exact effect is acceptable. The diagnosis is
recorded in
`research/runs/2026-07-21-discord-lurker-blocker-diagnosis.md`.

Do not run additional Discord surveys, route recovery, or content-read pilots
under the current browser-driven approach. Near-term product and research work
should proceed without depending on Discord automation. Carry forward the route
map, priorities, expected signal types, isolated profile concept, read-only
guard/harness, blocker diagnosis, and the rule that quiet/blocked runs do not
reduce long-term route value.

Future Discord work should be one of:

- manual screenshot/paste or user-opened visible-content analysis;
- a separately approved non-browser or otherwise mechanically safer access
  strategy;
- a separate decision to evaluate a narrowly scoped allowlist, with stronger
  evidence than currently exists.

## Separate active issue

The user reported after this checkpoint that the app does not work. Treat that
as a separate app triage lane, not as a Discord research finding.
