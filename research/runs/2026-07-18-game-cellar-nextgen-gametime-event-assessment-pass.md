# Game Cellar / Next-Gen / It's GameTime event-assessment pass

Date: 2026-07-18  
Pass type: main-store event replay with planning assessment implications  
Validation level proposed for live write: standard, because event series and dated occurrences would change.

## Scope

- The Game Cellar
- Next-Gen Games
- It's GameTime!

This pass used the corrected research method: each store was checked for both Places-page implications and current MTG event/calendar implications. The pass did not launch workers, did not hand-edit canonical JSON, did not perform live Supabase writes, and did not run local preview.

## Findings

### The Game Cellar

Current database state already has the recurring Commander in the Cellar rows across the store's Tuesday-Sunday operating week. The missed current planning value is finite special-event coverage.

Event recommendation:

- Write now: The Hobbit Prerelease as a finite prerelease/sealed series with eight dated Wizards/EventLink occurrences from August 7-12, 2026.
- Write now: Marvel Super Heroes Commander Party on July 31, 2026 at 7:00 PM.
- Write now: The Hobbit Commander Party with dated occurrences on August 21 and September 18, 2026 at 7:00 PM.
- No write now: The Hobbit Crafting Party; it appears in the Wizards export, but the pass did not treat it as a planning-priority MTG play event.

Assessment implication:

- The existing strong assessment remains supported.
- The new event picture strengthens the "full-service Magic hub" read because the store has visible Commander, prerelease/sealed, and Commander Party coverage.
- Confidence remains high for event breadth, but the best casual Commander day / actual solo-arrival texture remains a named open question.

Source coverage:

- Official site: already captured; supports WPN Premium, weekly events, Commander/Draft/Prerelease claims, newcomer/community language, and review excerpts.
- Wizards/EventLink: already captured; supports exact current event facts.
- Reviews: already captured through review-source backfill.
- Social/community: official site routes exist; deeper content replay remains optional/TBD unless the next planning question depends on it.

### Next-Gen Games

Current database state has Wednesday Commander Night only. Wizards/EventLink and the official site support a much broader Magic schedule.

Event recommendation:

- Write now: Saturday Draft at 12:00 PM as a weekly draft series.
- Write now: Saturday Afternoon Draft at 4:00 PM as a weekly draft series.
- Write now: Standard Showdown on Mondays at 7:30 PM.
- Write now: Legacy Thursday at 7:30 PM.
- Write now: Friday Night Magic Modern at 7:30 PM.
- Write now: All Day Sunday Commander, but with an explicit caution that the Wizards export time is 11:00 PM local while the title says all-day; the proposed row uses the store's Sunday opening time, 11:00 AM, as a planning proxy and notes the assumption.
- Write now: Two Headed Giant Commander as dated Sunday specials on July 26 and August 30, 2026.
- Write now: Marvel Super Heroes Commander Party as a dated Commander Party on August 2, 2026.
- No write now: July 19 Modern RCQ is real and current as of this pass, but it is a competitive one-off tomorrow and not a personal-priority event. It can remain a lower-priority catalog/TBD item unless the user wants competitive RCQs fully surfaced.
- No write now: Friday Night Magic Draft and Tuesday Draft Night were visible in the extracted dataset as older rows but did not have future rows in this current export window.

Assessment implication:

- Next-Gen is even more clearly a high-activity WPN Premium Magic hub than the existing Commander-only app record implies.
- The breadth cuts both ways: excellent for draft/prerelease/organized Magic discovery, possibly less targeted for relaxed Commander without Discord/community replay.
- The official Discord route should be captured as Evidence with `content replay TBD` because it is first-class support for future turnout, LFG, proxy, and solo-arrival questions.

Source coverage:

- Official site/about/FAQ: already captured; supports WPN Premium status, tournaments every day, weekly-updated calendar, Commander/EDH, broad event range, welcoming language, and official community routes.
- Wizards/EventLink: already captured; supports exact current event facts.
- Discord/community route: newly proposed as discrete Evidence; content not inspected.
- Reviews: already captured through review-source backfill.

### It's GameTime!

Current database state has Sunday Casual Commander Day, which is supported by both Wizards/EventLink and the official site.

Event recommendation:

- Already captured: Sunday EDH / Commander at 1:00 PM.
- Write now: Friday Night Magic at 8:00 PM from the store's official site as a current recurring Magic/FNM signal with medium confidence and format unspecified.
- No additional Wizards-derived writes: Wizards/EventLink currently shows only Sunday Casual Commander rows in the checked export window.

Assessment implication:

- The store has more planning value than a Sunday-only app view suggests because its own site lists Friday Night Magic.
- Confidence for Sunday Commander is high; confidence for Friday FNM is medium because the official site gives the time but not the exact format, registration, attendance, or whether it fires reliably.
- Places assessment should preserve open questions about Friday format and Sunday turnout/solo-arrival texture.

Source coverage:

- Official site: already captured; supports physical location, game tables, Friday Night Magic at 8:00 PM, Sunday EDH/Commander at 1:00 PM, hours, and products.
- Wizards/EventLink: already captured; supports Sunday Casual Commander Day.
- Reviews: already captured through review-source backfill.
- Social/community: visible social icons exist on the official site, but this pass did not inspect content; leave as optional/TBD unless needed for fit confidence.

## Proposed write

Proposal file: `supabase/proposals/game-cellar-nextgen-gametime-event-assessment-pass-2026-07-18.json`

The proposal was approved and applied on 2026-07-18. It added missing event series/occurrences, captured the Next-Gen Discord route as Evidence, updated event/source provenance, and marked the resulting research-change row accepted.

Applied SQL artifact: `supabase/proposals/game-cellar-nextgen-gametime-event-assessment-pass-2026-07-18.sql`

Post-write verification:

- The Game Cellar now has 9 event series total.
- Next-Gen Games now has 9 event series total.
- It's GameTime now has 2 event series total.
- Dated occurrence counts matched expectation: 8 Game Cellar Hobbit prerelease, 1 Game Cellar Marvel Commander Party, 2 Game Cellar Hobbit Commander Party, 2 Next-Gen Two Headed Giant Commander, and 1 Next-Gen Marvel Commander Party.
- New event-source links counted 12 for the 12 new event series.
- Duplicate occurrence groups: 0.
- Duplicate recurring same-venue/title/day/time groups: 0.
- Next-Gen Discord route captured as Evidence with content replay TBD.
- No local preview was run, per the routine data-write overhead rule.

## What remains TBD

- The Game Cellar: best Commander day, actual pod/solo-arrival texture, and whether social channels add useful current schedule texture beyond Wizards/site evidence.
- Next-Gen: Discord/community content replay for turnout, casual-vs-competitive texture, proxy friendliness, and solo arrival; whether competitive RCQs should be surfaced by default.
- It's GameTime: Friday FNM format and reliability; Sunday Commander turnout and social texture.
