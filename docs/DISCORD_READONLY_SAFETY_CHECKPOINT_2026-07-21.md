# Discord read-only safety checkpoint

Date: 2026-07-21

Status: Discord content surveying remains paused except for explicitly approved
guarded pilots. This checkpoint records the current accepted safety baseline so
future work does not reconstruct it from chat memory.

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

Allowed only in an approved guarded pilot:

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

Do not resume broad Discord surveying until a tiny content-read pilot succeeds
under guard and is separately accepted.

## Separate active issue

The user reported after this checkpoint that the app does not work. Treat that
as a separate app triage lane, not as a Discord research finding.
