# Corrected main-store pass: Magic and Monsters, Lost Planet, Comic Book Hideout, Cardboard Games

Date: 2026-07-23  
Mode: corrected main-store pass, bounded / proposal-only  
Scope: Magic and Monsters, Lost Planet, Comic Book Hideout, Cardboard Games  
No live Supabase write performed in this run.

## Summary

This batch found planning-useful changes, especially for Comic Book Hideout and Lost Planet.

- Comic Book Hideout has two missing WPN-supported weekly event lanes: Thursday outdoor Commander and Friday beginner Magic nights, in addition to the already-captured Sunday Commander row.
- Lost Planet has a dense current WPN sequence of dated Friday specials and prereleases. The existing weekly Friday Level 2 Commander row appears to over-project, because WPN shows that Friday slot rotating among Commander Party, prerelease, Two-Headed Giant Commander, Magic Presents, and Level 2 Commander dates.
- Cardboard Games mostly remains current, but its two Hobbit prerelease rows already say 1:00 PM to 5:00 PM in their details while the structured time fields are blank. The proposal fixes the structured times.
- Magic and Monsters remains a source-health contradiction, not an event-reactivation candidate: fresh WPN still echoes Friday Commander Free Play, but the prior store-controlled Discord/calendar read says MTG is no longer on the regular weekly schedule. The proposal keeps the row inactive and clarifies the conflict.

No Signals write is recommended from this batch. The findings are better represented as event/source/assessment updates.

## Store dispositions

### Magic and Monsters

Event classification: stale/conflict, no active calendar write now.

Findings:

- Fresh Wizards/EventLink pull still shows Friday 6:00 PM Commander Free Play on July 24 and July 31, 2026.
- Existing accepted store-controlled evidence remains stronger for planning interpretation: official calendar absence plus inspected Discord schedule saying MTG is no longer on the regular weekly schedule.
- Keep the existing Commander Free Play row inactive; update notes so the contradiction is explicit and current.

Places read:

- Real active TCG storefront, but lower personal MTG fit because structured MTG appears deprioritized.
- Daily/drop-in Commander support may exist, but that is less useful than a reliable event for solo planning.

Named TBDs:

- Whether Friday Commander Free Play reliably fires despite the store-controlled schedule change.
- Whether Friday FNM currently means anything actionable.
- Discord/community texture remains useful but Discord automation/content-read should not be reopened in this batch.

Coverage:

- Official site/calendar: already captured; calendar absence remains material.
- WPN/EventLink: fresh checked, source-health conflict only.
- Instagram/Facebook/social: already captured; no new route write.
- Discord: already inspected from prior safe/manual pass; no new Discord access.
- Reviews/directories: already captured enough for this bounded pass.

### Lost Planet

Event classification: event writes now; one existing recurring event repair.

Findings:

- Fresh Wizards/EventLink shows a sequence of dated Friday events through September 2026, including Commander Party, Hobbit prerelease sealed pods, Two-Headed Giant Commander, Magic Presents, and two Level 2 Commander dates.
- The existing weekly Friday Level 2 Commander row appears misleading because it would project over Fridays that WPN now identifies as different specials.
- Tuesday Commander remains supported by prior accepted calendar/social evidence but was not refreshed by the fresh WPN pull; leave it active for now with an open verification question rather than retiring it.

Places read:

- Lost Planet remains a promising event-rich store because its event copy gives useful format/power/pod texture.
- It is more of a “check the current calendar before going” candidate than a frictionless default, because Friday programming rotates.

Named TBDs:

- Tuesday Commander currentness and turnout.
- Whether Friday specials displace routine Commander consistently.
- Proxy policy and solo-arrival mechanics.

Coverage:

- Official/social calendar route: already captured; prior monthly calendar remains material.
- WPN/EventLink: fresh checked; supports the proposed dated event rows.
- Instagram/Facebook: already captured; no new source row.
- Discord/community route: not safely opened in this batch.
- Reviews: not decision-changing in this bounded pass.

### Comic Book Hideout

Event classification: event writes now.

Findings:

- Fresh Wizards/EventLink confirms weekly Thursday 4:00 PM Magic Under the Stars outdoor Commander.
- Fresh Wizards/EventLink confirms weekly Friday 4:00 PM Beginner Nights, including teaching/borrow-deck beginner support.
- Existing Sunday Commander row remains supported and should be refreshed.

Places read:

- Comic Book Hideout becomes more useful than the prior app state showed: it has Sunday Commander plus Thursday Commander and beginner-friendly Friday Magic.
- This strengthens confidence that it is approachable for casual/solo/newer-player play, though exact proxy/pod norms remain unknown.

Named TBDs:

- Thursday patio turnout and weather/space reliability.
- Proxy/power expectations across Thursday/Sunday Commander.
- Whether beginner night is useful to the user or mainly useful as a community/new-player texture signal.

Coverage:

- Official website/storefront: already captured.
- WPN/EventLink: fresh checked; missing weekly event lanes found.
- Instagram/social: already captured; supports beginner/Magic teaching texture from prior pass.
- Discord/community route: route references exist from prior evidence, but no new Discord access.
- Reviews: already captured enough for current fit read.

### Cardboard Games

Event classification: source/time hygiene; no new event lanes found.

Findings:

- Fresh WPN still supports the existing Friday Commander and Monday draft rows.
- Existing official calendar evidence already supports the two August Hobbit prereleases from 1:00 PM to 5:00 PM.
- The structured app rows have null start/end times despite the details already containing the time. The proposal adds 1:00 PM / 5:00 PM structured times.

Places read:

- Cardboard remains an event-relevant multi-TCG store with current Commander, draft, and prerelease support.
- Main unknown remains Commander pod texture: solo arrival, proxy policy, and casual/competitive mix.

Named TBDs:

- Commander pod formation and proxy policy.
- Whether a community/Discord coordination route exists.
- Official calendar quality remains useful but not mechanically clean because it previously omitted routine Commander and mixed some labels.

Coverage:

- Official website/calendar: checked/captured; prerelease time supported.
- WPN/EventLink: fresh checked; current Commander/draft support.
- Instagram/social: already captured; no new decision-changing signal.
- Discord/community route: not found/uncaptured from previous bounded pass; no new Discord work.
- Reviews: already captured enough for current fit read.

## Proposal

Reviewable Supabase proposal:

- `supabase/proposals/magic-monsters-lost-comic-cardboard-main-pass-2026-07-23.json`

The proposal is intended to:

- add Comic Book Hideout Thursday Commander and Friday Beginner Nights;
- add Lost Planet dated WPN specials/prereleases through September 2026;
- retire Lost Planet's over-projecting weekly Friday Level 2 Commander row in favor of dated rows;
- fix Cardboard Hobbit prerelease structured times;
- keep Magic and Monsters Commander inactive while refreshing the WPN/store-controlled conflict note;
- refresh WPN source check dates;
- update Places/evaluation reads for the four stores;
- add one proposed research-change marker.

## No-write / stale decisions

- Magic and Monsters Commander Free Play: no reactivation; preserve as source-health contradiction.
- Lost Planet Tuesday Commander: no change; not refreshed by WPN but not contradicted enough to retire.
- Cardboard no new event lanes beyond existing Commander/draft/prerelease rows.
- No Signals writes from this batch.

## Acceptance checkpoint - 2026-07-23

The proposal was accepted and applied to Supabase on 2026-07-23 with standard validation.

Applied outcomes:

- Magic and Monsters Commander Free Play remains inactive with a refreshed WPN/store-controlled source-health conflict note.
- Comic Book Hideout received active WPN-supported Thursday `Magic Under the Stars`, Friday `Beginner Nights`, and refreshed Sunday Commander support.
- Lost Planet's over-projected weekly Friday Level 2 Commander row was retired, and nine dated WPN/EventLink Friday specials/prereleases were added through September 2026.
- Cardboard Games' August 8 and August 9 Hobbit prerelease rows now have structured 1:00 PM to 5:00 PM times.
- Venue assessment notes and evaluation rows were refreshed for all four stores.
- The update-feed marker is `accepted`.

Ledger status after application: these stores should no longer be selected as ordinary baseline corrected-main-pass targets. Their remaining work is named texture/source follow-up, especially Discord/community route usefulness, proxy/power norms, turnout, and source-health contradictions where noted.
