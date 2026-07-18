# Corrected source coverage batch E - Grails, Buddies, Tilted

Date: 2026-07-17  
Pass type: mixed corrective pass; Tilted escalated to corrected main-pass
acceptance test

Status: applied to live Supabase and accepted as the Batch E correction checkpoint.

## Why the original Batch E conclusion failed

The original pass said Tilted's event record already existed and narrowed the
remaining question to Evidence and Places-page clarity. That conclusion was
wrong for two linked reasons:

1. Commander presence was mistaken for event-format completeness. Once one
   supported Friday Commander series was found, the pass did not continue
   through draft, prerelease/sealed, FNM, and special Magic signals.
2. Source attachment and source-route discovery were mistaken for source-content
   reconciliation. Tilted's official events page and Wizards locator were in
   Evidence, but their material event contents were not compared against the
   series and occurrences actually present in Supabase.

The correction also requires reading the useful context around official event
surfaces, including contact and community buttons. Discord/community routes are
first-class research surfaces for this project because they can answer store-fit
and event-reliability questions that official calendars often omit: turnout,
casual versus competitive texture, proxy friendliness, draft firing reliability,
solo/new-player friendliness, prerelease attendance, and community tone. The
direct Discord route under Tilted's calendar was operationally relevant and
should not have remained implicit inside a generic events-page source.

The sentence `No new event row is recommended` is withdrawn. Tilted is now
classified as `corrected main pass required`, not `pass stands` or an Evidence
micro-backfill.

## Tilted Gaming - complete source-to-event reconciliation

### Sources inspected

- Official homepage and weekly spotlight:
  https://tiltedgamingtcg.com/
- Official event-calendar page and embedded Google Calendar:
  https://tiltedgamingtcg.com/pages/events
- Direct Discord invite displayed under the public events calendar:
  https://discord.com/invite/V8rxm8wPcA
- Live Wizards/EventLink API results for organization `18067`, checked
  2026-07-17 using the repository's API-first Wizards method.
- Live Supabase event series, dated occurrences, venue sources, and event-source
  relationships for `tilted-gaming`.

### Important source contradiction

Tilted's official homepage weekly spotlight visibly lists:

- Friday, July 17: `Friday Night Magic`, $5, 32 seats;
- Sunday, July 19: `Tilted Magic Draft!`, $22, 16 seats.

The official events page describes an automatically updated monthly calendar,
but its embedded Google Calendar rendered July 2026 as empty during this check.
The empty embed is therefore a source-health contradiction, not proof that no
events exist. The live Wizards feed independently returns current Tilted Magic
events and supplies the usable planning facts below.

The events-page section also places a direct Discord button beside the store's
phone contact. That makes Discord a material event/community-support route for
questions, coordination, player texture, turnout, proxy practice, draft firing
reliability, solo-arrival support, and a possible later community replay, not
merely a generic social link or calendar-adjacent context. It is not currently a
distinct Supabase Evidence record. The revised proposal captures the invite;
Discord content was not entered or read in this correction, so its disposition
is `Discord route captured / content replay TBD`.

### Current live Wizards inventory

| Local date/time | Wizards ID | Event | Material facts |
| --- | --- | --- | --- |
| Sun Jul 19, 3:00 PM | `11181552` | Tilted Draft | Casual booster draft; $22; 16 max; packs per win; four-player minimum; players vote between a three-set chaotic draft and one-set draft; in-store first-come signup. |
| Fri Jul 24, 6:00 PM | `11152862` | Friday Night Magic Casual Tilted Commanders | Casual Commander/FNM; $5; 32 seats; raffles/promos; in-store seat requirement. |
| Sun Jul 26, 3:00 PM | `11181553` | Tilted Draft | Same explicitly weekly Sunday draft structure as July 19. |
| Fri Jul 31, 6:00 PM | `11353827` | Marvel Super Heroes Commander Party | Casual Commander Party plus regular Commander; $5; stated 32 max; hourly raffles and attendance-based store-credit/pack rewards. |
| Fri Aug 7, 6:00 PM | `11270972` | The Hobbit Prerelease | Casual sealed prerelease; $40; 32 max; in-store first-come signup. |

All UTC timestamps were converted using the source's
`America/Los_Angeles` time zone.

### Supabase and app state before the proposed correction

Supabase contains:

- one active weekly Friday 6:00 PM `Friday Night Magic Casual Tilted
  Commanders` series;
- one inactive duplicate/superseded Friday Commander series;
- no Tilted dated occurrences;
- no Tilted draft series;
- no Tilted Commander Party series/occurrence;
- no Tilted Hobbit prerelease series/occurrence.

Because the app reads this Supabase state, it can project the recurring Friday
Commander row but cannot show the missing Sunday draft or the two dated special
events. The inactive duplicate remains historical cleanup context and should
not be reactivated.

### Signal-by-signal disposition

| Signal | Classification | Proposed treatment |
| --- | --- | --- |
| Friday casual Commander/FNM | Already represented accurately | Keep the detailed active series; refresh verification/confidence and attach official-homepage corroboration. Do not create a duplicate series. |
| Older `Tilted Commanders` row | Duplicate presentation | Keep inactive as the accepted superseded snapshot. |
| Sunday `Tilted Draft` | Missing recurring series and missing dated occurrences | Add one weekly Sunday 3:00 PM Draft series plus confirmed July 19 and July 26 occurrences. Recurrence is supported by the source text `Every Sunday` and two visible Wizards dates. |
| Marvel Super Heroes Commander Party | Missing dated occurrence | Add a one-time special Commander series and confirmed July 31 occurrence. Do not manufacture recurrence. |
| The Hobbit prerelease | Missing dated occurrence | Add a one-time sealed prerelease series and confirmed August 7 occurrence. Do not manufacture recurrence. |
| Empty official Google Calendar embed | Ambiguous/source-health issue | Preserve as a caution in the closure record; do not use it to negate the homepage or live Wizards listings. |

### Format coverage closure

- Commander: **found** - existing Friday casual Commander/FNM series is
  represented; July 31 Commander Party is missing and proposed.
- Draft: **found** - weekly Sunday draft and two confirmed dates are missing and
  proposed.
- Prerelease/sealed: **found** - August 7 Hobbit prerelease is missing and
  proposed.
- Other Magic/FNM/specials: **found** - Friday FNM is already represented
  through the Commander series; Commander Party is proposed. No separate
  non-Commander FNM series is justified by the inspected source contents.

### Places assessment correction

Tilted's planning value is materially stronger than the prior Commander-only
read: it is close to Los Alamitos and currently exposes Commander, recurring
draft, a Commander Party, and a high-priority prerelease. The same sources also
show structured in-store signup, limited seats, prize support, and competitive
multi-TCG positioning.

Proposed direction:

- research status: `reviewed` -> `discovery` in the current schema, with the
  explicit closure label `corrected main pass required`;
- fit: `B / 3.7` -> `B+ / 4.0` because the current format breadth adds real
  personal planning value;
- confidence: remain `high` for operation and event facts, while explicitly
  preserving uncertainty about casual/proxy/solo-arrival culture;
- do not call the store fully reviewed until the remaining ordinary
  social/community portion of the main pass is closed.

### Corrected closure record

```text
Store: Tilted Gaming
Pass type: corrected main-pass acceptance test; full main pass still required

Official site: inspected/captured - homepage supports current FNM and Sunday Draft; event page supports operation, signup, hours, Discord routing, and an empty-embed contradiction
Instagram: official route identified; content replay remains part of the bounded main-pass completion
Facebook: official route identified; not material to this event correction
Discord/community: captured-TBD - direct invite inspected on the events page and proposed as event/community-support Evidence; content replay TBD and not represented as inspected
Wizards/EventLink: inspected/captured - five current listings reconciled individually
Reviews: prior direct/mirror evidence remains captured; not reopened in this event correction
Other material sources: official Linktree remains proposed as source-routing Evidence

Places synthesis: nearby multi-TCG store with stronger Magic format breadth than the prior Commander-only assessment showed; good planning value but structured/competitive posture
Supabase event comparison: Friday Commander represented; Sunday Draft, Commander Party, and Hobbit prerelease missing
Commander: found - existing Friday series plus missing July 31 Commander Party
Draft: found - missing weekly Sunday series and July 19/26 occurrences
Prerelease/sealed: found - missing August 7 Hobbit prerelease
Other Magic/FNM/specials: found - Friday FNM represented by the Commander/FNM series; no unsupported extra recurrence created
Remaining decision-changing TBD: social/Discord content, proxy norms, Commander power mix, pod formation, solo-arrival experience, and the empty official calendar embed
Final planning disposition: corrected main pass required; revised event proposal applied 2026-07-17 with standard validation
```

## Grails Gone Wild

The prior targeted source correction remains partial/discovery and is not
reopened here. No new Grails write is included in the revised proposal. Its
bounded main-store completion pass remains separately queued.

## Buddies Collectibles

The original micro-backfill conclusion remains valid. The revised proposal
still adds the already-reviewed Whatnot commerce/community-scale Evidence and
clarifies the Places assessment without treating marketplace activity as event
proof. No new Buddies event signal was found or manufactured in this correction.

## Revised proposal and validation gate

Applied proposal:

- `supabase/proposals/corrected-source-coverage-batch-e-2026-07-17.json`

Validation level: **standard**, because event series and occurrences changed.

Pre-write validation:

- proposal validated against live Supabase: PASS, 32 operations;
- generated SQL plan reviewed:
  `supabase/plans/corrected-source-coverage-batch-e-2026-07-17.sql`;
- no schema/auth/RLS/app-code/manual canonical JSON operations were present.

Live write:

- applied only the validated 32-operation proposal.

Post-write validation:

- verified affected Buddies and Tilted venue/evaluation rows;
- verified Tilted source links, event-source links, five Tilted event-series
  rows, and four new dated occurrences;
- verified no duplicate event occurrence keys for
  `(series_id, occurrence_date, start_time)`;
- local Supabase-default app check passed for Events, Today, and Places:
  Events/Today showed Tilted Draft, Marvel Super Heroes Commander Party, and
  The Hobbit Prerelease; Places showed Tilted as `Discovery-level - B+ - high
  confidence`;
- browser console check showed no runtime errors during the targeted app check;
- deterministic recovery export verified at
  `supabase/exports/postwrite-batch-e-2026-07-17`.

No canonical JSON hand edit, schema/auth/RLS change, or app-code change occurred
during this correction. Generated JSON remains recovery/export output.
