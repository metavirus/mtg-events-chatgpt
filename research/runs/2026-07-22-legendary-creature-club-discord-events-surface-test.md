# Legendary Creature Club Discord Events surface test

Date: 2026-07-22  
Pass type: guarded Discord Events-surface test  
Scope: Legendary Creature Club only

## Purpose

Test whether Discord's server-level Events surface can be reached and read as a
distinct high-signal surface without running a channel survey or changing any
Discord state.

## Safe access path

- Started from Discord `@me` in the persistent isolated read profile.
- Used guarded UI-native navigation through the `Stores/Local` folder to guild
  `1113847610525093991` (`Legendary Creature Club`).
- The server exposed a scheduled-event indicator and one uniquely identified
  `Event Details` navigation control.
- No cold deep link, typing, paste, keyboard navigation, search, coordinate
  guessing, RSVP, join, reaction, post, upload, role, or settings action was
  used.
- Guard heartbeat, exact guild identity, no editable focus, disabled mutating
  controls, and mutation-request blocking remained active.

## Verified visible result

The bounded server Events summary showed one current item:

- State: `Happening Now`
- Title: `GOOD Magic`
- Visible location label: `Good Time`
- Host: `Legendary Creature Club`

The existing accepted July 14 manual extraction records this as a community
Magic meetup at Good Time in Long Beach on Wednesday, July 22 at 6:00 PM. This
run independently reconfirmed only the current `Happening Now` state, title,
and short location label; it did not independently re-read the full event
description, exact time, format, proxy policy, or power level.

No other current or upcoming event was visible in the bounded Events summary.

## Guard and extraction result

Opening the uniquely identified `Event Details` control caused no external
Discord state change. No unread/mention indicator changed, no prohibited
request succeeded, and only non-mutating telemetry was observed.

The first detail-panel reader selected the channel behind the event panel
instead of a bounded event-detail root. That output is rejected and must not be
used as event evidence. The harness was tightened to reject app-wide roots and
to distinguish a safely verified summary read from a fully isolated detail
read. The accepted evidence from this run is therefore the bounded Events
summary above, not the rejected background-channel extraction.

## Planning disposition

- The finding is genuinely high-value as a missed same-night community play
  opportunity and demonstrates why Discord Events deserve explicit monitoring.
- A reviewable, time-bounded Signal is proposed; no live write was made.
- No calendar Event write is proposed. The item was already happening during
  the run, its format/details remain incomplete, and the project's calendar is
  for future planning rather than retroactive event capture.
- After expiry, the proposal should become `stale / no action` rather than be
  applied late.

## Monitoring-model conclusion

No new schema is justified. The current `discord_channel_watchlist` model can
represent the server Events surface with:

- `channel_type = events`;
- a stable name such as `Discord Events`;
- no channel ID, because this is a guild-level surface;
- the guild route/access path in the URL or notes;
- its own cadence, priority, last check, latest result, and resume note.

The table name is slightly channel-centric, but that is tolerable for this
first proven non-channel surface. Add a separate `surface_type` field only if
additional non-channel surfaces make the distinction operationally necessary.

## Outcome

- Events surface safely reachable: **yes**.
- Bounded Events summary safely readable: **yes**.
- Fully isolated event-detail extraction: **not yet proven**.
- Useful current finding: **yes — GOOD Magic, happening now at Good Time**.
- External Discord state changed: **no**.
- Live Supabase writes: **none**.

## Accepted monitoring-map follow-through

The user accepted the result as method proof and explicitly declined a late
GOOD Magic Signal if the same-day opportunity was no longer useful. The
bounded monitoring-map write added:

- the Legendary Creature Club Discord as a Community-linked Source;
- its proven guarded UI-native access profile; and
- one high-priority guild-level `events` watch surface whose latest run result
  is `useful` (the schema-equivalent value for `useful_signal_found`).

The live readback confirmed one Source, one Community-to-Source relationship,
one access profile, and one active high-priority Events watch surface with
`latest_run_result = useful`. No Signal, Event, occurrence, app, or schema write
was part of that follow-through.
