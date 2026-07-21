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

- Paper Hero's mapped channel shell was proven but is blocked for guarded content
  reads until the membership/lurker/interstitial condition is resolved safely.
- Collectors Lounge's mapped channel shell also proved route identity but hit
  the same blocked membership/lurker condition during the next attempted pilot.
- No Discord message content was read by Codex in these guarded pilots.
- No Signals, events, source notes, or research conclusions were created from
  the guarded pilots.
- No external Discord state changed.

## Next safe options

Choose only one, explicitly:

1. improve the guard/harness to implement the accepted one-close-and-retry rule
   automatically, then rerun one tiny content pilot;
2. have the user manually resolve a route's visibility/interstitial state in the
   isolated profile, close the profile, then rerun one tiny content pilot;
3. pause Discord automation and work on non-Discord app/research issues.

Do not resume broad Discord surveying until a tiny content-read pilot succeeds
under guard and is separately accepted.

## Separate active issue

The user reported after this checkpoint that the app does not work. Treat that
as a separate app triage lane, not as a Discord research finding.
