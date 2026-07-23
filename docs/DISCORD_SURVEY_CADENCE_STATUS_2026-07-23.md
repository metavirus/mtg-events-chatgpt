# Discord survey cadence/status checkpoint

Date: 2026-07-23  
Status: operational checkpoint for small manual/agent-assisted surveys  
Scope: repeatable survey method only; no automation, no live data write

## Purpose

This checkpoint makes future Discord survey runs repeatable without rethinking
the method each time.

The accepted baseline is:

- use verified routes only during routine surveys;
- include mapped Discord Events surfaces;
- do not broaden into route discovery during a survey run;
- keep cold direct links blocked except as identity metadata;
- use guarded UI-native navigation from Discord `@me`;
- use independent monitoring cursors rather than Discord unread state;
- preserve quiet/stale results without reducing long-term route value;
- do not create live Signals, events, source notes, Places updates, or research
  writes without a separate proposal/approval gate.

## Route status

### Ready for routine survey

These surfaces have enough proven safe access to be used in small bounded
routine surveys.

| Route / surface | Ready surface | Suggested cadence | Why monitor |
| --- | --- | --- | --- |
| Collectors Lounge - Cypress | `#mtg-announcements-and-events` | Weekly, plus before a Friday/Saturday visit | Strong nearby candidate; schedule graphics and weekly lineup can confirm Commander, draft/specials, and displacement risk. |
| JJ's Collectibles | `#magic-announcements` | Weekly, plus before a visit | High-value nearby route with current Magic schedule images and specials. Orange mentions remain branch-identity TBD. |
| ProjectCCG Online Community | `#mtg-announcements` | Weekly | Useful for MTG announcements, cancellations, and cross-branch source-health checks. |
| Magic & Monsters | `#shop-schedule` | Occasional / before relying on old calendar rows | Useful for source-health contradictions; last strong result said regular MTG left the schedule while drop-in Commander remains possible. |
| Krazy Nick's Games | `#weekly-event-schedule` | Occasional | Route is safely mapped, but current visible content was stale in the latest pass. Useful mainly for source-health checks unless new posts appear. |
| Legendary Creature Club | Discord Events surface | Weekly, and same-day when planning | Proven high-signal surface for one-off community play opportunities such as `GOOD Magic`; short-lived Signals should expire quickly. |

### Route-discovery candidates

These are known/high-value routes or channels, but the specific surface still
needs a bounded route-discovery or channel-graduation pass before routine survey.

| Route / surface | Candidate surface | Why it matters | Next safe step |
| --- | --- | --- | --- |
| Collectors Lounge - Cypress | `#event-rules` | Could clarify rules, proxy/power texture, and event expectations. | Route-discover or graduate channel path if needed; inspect only if it can be reached under guard. |
| JJ's Collectibles | `#commander-night` | Standing Commander guidance, pod formation, and bracket norms. | Graduate the channel path before including in routine surveys. |
| ProjectCCG Online Community | `#oc-announcements`, `#oc-events`, `#mtg-discussion` | Operational closures/reopenings, event changes, and LFG/Commander texture. | Graduate each high-value channel separately; do not rely on prior manual/run-note memory alone. |
| Magic & Monsters | `#mtg-schedule` | Useful stale/current-status comparison against `#shop-schedule`. | Graduate channel path before routine rechecks. |
| Krazy Nick's Games | `#commander` | Could answer current Commander turnout / LFG / power texture. | Route-discover the channel; if newest content remains stale, mark quiet/stale for the run only. |
| Kingslayer Games Discord | `#mtg-announcements`, `#commander` | High-value store/community route for Fountain Valley events and Commander texture. | Run bounded route discovery from `@me`; no broad server survey. |

### Blocked/TBD

| Item | Status | Rule |
| --- | --- | --- |
| Cold direct Discord channel URLs | Blocked as access method | Keep as identity metadata only unless a future separately approved method proves safe. |
| Any server requiring join, invite acceptance, onboarding, roles, verification, or settings | Blocked/TBD | Stop; do not click through. User action or future strategy required. |
| Unknown mutation request | Fatal blocker | Block, log safely, stop the run. Do not infer route value from the blocker. |
| JJ's `Orange` schedule findings | Branch-identity TBD | Do not merge into Garden Grove. Do not create event rows or a JJ's Orange Place until the Orange venue relationship is corroborated. Hidden Collectibles 2 / `jjscardemporium.com` is a separate lead to investigate later. |

## Cadence rules

Use cadence as a planning default, not a rigid automation schedule.

- **Weekly:** high-value announcement, event, Events-tab, and operational
  surfaces for nearby/promising stores and communities.
- **Same-day / before visit:** favorites, likely-attendance candidates, stores
  with known cancellation/displacement risk, and same-day Discord Events.
- **Occasional:** stale but potentially useful source-health channels; lower
  personal-fit stores; channels that mostly repost old schedules.
- **Deep replay only:** channels whose useful question is broader texture,
  history, or identity resolution rather than immediate planning.

Quiet runs do not automatically change cadence. Lower cadence only after
repeated quiet checks plus low personal/venue relevance.

## What counts as a useful signal

Promote or propose only sparse, planning-useful findings:

- happening-now, tonight, this-week, or upcoming Discord Events;
- cancellations, closures, reopenings, changed hours, parking/access warnings;
- new prerelease, sealed, draft, Commander Party, Commander special, FNM, or
  notable one-off opportunities;
- LFG or meetup posts such as "anyone want to play tonight?";
- turnout, pod formation, proxy, bracket/power-level, newcomer, or solo-arrival
  texture that changes fit/confidence;
- source-health contradictions, such as Discord being current while a calendar
  is stale;
- identity or branch clues that determine where an event belongs.

## What to ignore

Do not promote:

- routine chatter;
- product-only posts;
- old/stale announcements unless they explain source health;
- unchanged weekly schedules already represented in the app;
- negative-fit reminders that merely confirm already-known poor fit;
- duplicate reposts unless they correct date/time/fee/location/source status;
- ambiguous snippets that cannot support a concrete action or named TBD.

## Recording quiet, stale, and blocked results

Each routine survey should leave a concise result per checked surface:

- `quiet`: checked; no useful signal this run.
- `stale`: newest bounded visible material is old or already handled.
- `useful`: found a potential Signal, event/source proposal, Places/community
  note, or identity clue.
- `blocked_for_this_run`: access failed safely; route value unchanged.
- `identity_tbd`: finding may be useful, but entity/location/branch cannot be
  safely resolved.

Record:

- route/surface checked;
- access mode used;
- bounded message/event window;
- last-seen message/time marker when safely available;
- useful/quiet/stale/blocked classification;
- whether any external Discord state changed; expected answer should be no.

Never use Discord unread/read state as the canonical survey cursor.

## Identity-blocked findings

Use JJ's Orange as the model.

If a finding is current but branch/entity unsafe:

1. Do not write event rows.
2. Do not attach the finding to the closest existing venue.
3. Do not create a new Place unless an accepted source proves identity.
4. Record the exact TBD and what would resolve it.
5. Preserve the finding as source lead / proposal only.

For JJ's Orange specifically:

- Garden Grove remains the only canonical JJ's Place.
- Orange schedule findings must not become Garden Grove events.
- Hidden Collectibles 2 / `jjscardemporium.com` is a separate lead, not a proven
  JJ's branch.

## Same-day / happening-now Signal expiry

Discord Events and "happening now" posts are valuable precisely because they are
fresh, but they should not linger.

Default handling:

- same-night / happening-now Signal: expire that night;
- this-week Signal: expire at the end of the relevant event date;
- current but unverified schedule lead: expire quickly or keep as proposal/TBD,
  not as a landing-page card;
- expired proof of method: keep in run note, not live Signals.

If approval happens after the window passes, do not apply the Signal. Preserve it
as evidence that the surface is worth monitoring.

## Approval gates

A routine Discord survey may produce a reviewable proposal, but must not apply
live writes without approval.

Require approval before:

- inserting or updating Signals;
- creating or changing event series or occurrences;
- creating or changing Places, Communities, Sources, or relationships;
- changing route access modes or cadences in live Supabase;
- promoting a branch-identity TBD into canonical data.

Lean approval is enough for:

- monitoring cursor/result updates;
- short-lived Signal inserts;
- no-write/TBD dispositions.

Standard approval is required for:

- event rows;
- identity/location/branch records;
- source relationship changes that affect canonical Places or Events.

## Next recommended survey shape

Small routine survey:

1. Legendary Creature Club Discord Events.
2. Collectors Lounge `#mtg-announcements-and-events`.
3. JJ's `#magic-announcements`, with Orange branch TBD recognized upfront.
4. ProjectCCG `#mtg-announcements`.
5. One optional high-value route-discovery candidate, if the user explicitly
   wants to expand the proven route set.

Stop after the batch. Report useful findings, quiet/stale results, blocked/TBDs,
and any reviewable proposal.
