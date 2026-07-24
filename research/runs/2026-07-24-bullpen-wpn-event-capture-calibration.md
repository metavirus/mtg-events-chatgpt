# Bullpen WPN event-capture calibration

Date: 2026-07-24

## Identity decision

This was a narrow event-capture calibration, not a new main pass. Supabase and
Wizards/EventLink both identify `The Bullpen 2.0` at 6234 West 87th Street
(WPN organization `9446`). That match is identity-safe enough for this personal
planning app. The thin store-controlled source trail lowers confidence and
makes the events check-first; it does not justify suppressing attributable
current events.

## Current evidence versus Supabase

The recent WPN snapshot was reused rather than refreshed. It was retrieved
2026-07-23 at 17:07 Pacific and was the latest suitable bounded event artifact.

Supabase contains Saturday 2:00 PM Weekly Commander. Current WPN rows also
support Friday 6:30 PM FNM Booster Draft ($20, capacity 24), Wednesday 6:30 PM
Standard Showdown ($5), and The Hobbit prerelease on August 7-9 at 1:00 PM
($40, capacity 24).

## Proposed disposition

- Refresh the existing Commander series.
- Add the missing weekly draft and Standard series.
- Add one prerelease series with three dated occurrences.
- Attach `src-wpn-9446` to each new series.
- Use `medium` event confidence with visible check-first caveats.
- Keep the venue `deprioritized`, grade `C-`, confidence `low`.

No Signal is proposed. The prerelease is useful event inventory, but it is not
urgent, unusually high-fit, or preferable to better-supported nearby options.

Proposal:
`supabase/proposals/bullpen-wpn-event-capture-calibration-2026-07-24.json`

No live Supabase write was performed.
