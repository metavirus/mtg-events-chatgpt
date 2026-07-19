# Turn Zero / CoreTCG / Aki / ProjectCCG event-completion proposal

Date: 2026-07-18  
Pass type: WPN-first event completion, proposal only  
Validation level proposed for apply: standard, because event-series and event-occurrence rows would change

## Scope

- Turn Zero Games
- CoreTCG
- Aki Collectibles
- ProjectCCG - Santa Ana

ProjectCCG was substituted for Spellhold at Kavi's request. The pass stayed branch-safe: ProjectCCG - Santa Ana / OC was treated separately from plain `ProjectCCG`.

Kavi then clarified that ProjectCCG's official website presents Alhambra as the primary/main location, and that it is fair to treat plain `ProjectCCG` WPN rows as Alhambra while Santa Ana/OC rows remain the second OC store. I verified that WPN store `15983` is plain `ProjectCCG` at 39 S Garfield Ave, Alhambra, and revised the proposal accordingly.

## Sources checked

- Fresh Wizards/EventLink pull, 35-mile Los Alamitos-centered window, 2026-07-18 through 2026-09-30.
- Existing Supabase event rows for the four target venues.
- Existing WPN source records and existing event-source links.
- ProjectCCG official site / existing official-source evidence for the Alhambra main-branch identity.

Not checked in this tranche:

- Discord/community content was not entered or read for Turn Zero, Aki, or ProjectCCG.
- CoreTCG's Discord route was already captured in a recent main-pass note, but its content was not replayed here.
- This tranche should therefore be treated as WPN/event completion plus a ProjectCCG identity correction, not a full main-store pass.

## Findings by store

### Turn Zero Games

Already captured:

- Wednesday 11:00 AM Commander Free Play is already in Supabase and still supported by WPN.

Write recommendation:

- Add recurring Friday 7:15 PM FNM Modern, $5 entry.
- Add Turn Zero Hobbit prerelease dated occurrences on August 7-9, 2026.
- Add Turn Zero Reality Fracture prerelease dated occurrences on September 25-27, 2026.

No-write / signal only:

- Canadian Highlander on July 18, 2026 was found, but it was already same-day/past by the time of this pass, so it should not be added as an active calendar item. It remains a store-activity signal only.

Places implication:

- Reinforces Turn Zero as a broad active Magic store, not just Commander. No assessment recalibration is proposed in this narrow event-completion tranche.

### CoreTCG

Already captured:

- Friday 4:30 PM CoreTCG Commander is already in Supabase and still supported by WPN.

Write recommendation:

- Add one CoreTCG Hobbit prerelease occurrence on Friday, August 7, 2026 at 5:00 PM, $50 entry.

Places implication:

- Reinforces CoreTCG's operational seriousness and prerelease capability. No assessment recalibration is proposed here because the recent CoreTCG main pass already captured the broader fit caveats.

### Aki Collectibles

Already captured:

- Saturday 5:00 PM Commander Night is already in Supabase and still supported by WPN.

Write recommendation:

- Add recurring Friday 5:00 PM Friday Night Magic / Commander, described by WPN as drop-in Commander games.

Places implication:

- Improves Aki from a one-night Commander option to a two-night Commander/FNM option. No assessment recalibration is proposed until a future social/review/content pass clarifies turnout and solo-arrival texture.

### ProjectCCG - Santa Ana

Already captured:

- Sunday 4:00 PM Commander Nights.
- Tuesday and Friday Commander Nights, but their stored times were older 7:00 PM values.

Write recommendation:

- Refresh Tuesday Commander to 6:30 PM from current WPN.
- Refresh Friday Commander to 6:30 PM from current WPN.
- Add Sunday 4:00 PM Draft Nights, $25 entry.
- Add Tuesday 6:30 PM Standard Showdown, $10 entry.
- Add Friday 6:30 PM Standard Showdown, $10 entry.

Identity-safe boundary:

- A separate WPN organization named plain `ProjectCCG` has Wednesday 5:00 PM Commander rows. That is not included in this proposal because it is not safely tied to the Santa Ana branch. It should remain a branch/identity TBD instead of being merged into the calendar.

Places implication:

- Reinforces ProjectCCG Santa Ana as a high-activity branch with Commander, Draft, and Standard support. No fit-score change is proposed here because branch/community fit still needs a proper corrected main pass.

### ProjectCCG - Alhambra

New branch/venue recommendation:

- Create `ProjectCCG - Alhambra` as a separate venue for the 39 S Garfield Ave main store.
- Attach existing official ProjectCCG site evidence and new WPN store 15983 evidence.
- Add a conservative discovery-level Places evaluation so the new venue is not just an opaque event host.

Write recommendation:

- Add recurring Wednesday 5:00 PM `Magic Commander Night`, free entry, promo on entry, under ProjectCCG - Alhambra.

Identity note:

- This replaces the earlier proposal boundary that left plain `ProjectCCG` as identity TBD. The corrected rule is: plain `ProjectCCG` at WPN store 15983 means Alhambra/main branch; `ProjectCCG - Santa Ana` / `OC` means Santa Ana branch.

Places implication:

- Alhambra should enter the app as a real but not fully researched Magic venue. It has WPN Commander support and official identity evidence, but needs a future main pass for social/Discord/review/event breadth and solo-arrival fit.

## Proposal

Created:

- `supabase/proposals/turnzero-core-aki-projectccg-event-completion-2026-07-18.json`

Proposal summary:

- 46 operations.
- Refreshes WPN source checked dates for the four venue WPN sources.
- Adds ProjectCCG - Alhambra as a separate venue with WPN/official-source evidence and a conservative evaluation.
- Refreshes existing Commander verification where WPN still supports the row.
- Adds missing future event series and dated prerelease occurrences.
- Adds one Updates marker with `review_status: proposed`.

## Validation performed before live write

- Controlled workflow proposal validation before Alhambra correction: passed, 38 operations.
- Controlled workflow proposal validation after Alhambra correction: passed, 46 operations.
- Live Supabase precheck: none of the proposed new Alhambra venue/source/event IDs or proposed new event-series IDs already exist.
- No live Supabase write performed.
- No canonical JSON edited.
- No app code changed.
- No local or hosted app smoke test, because this is proposal-only.

## Apply-time validation plan

Use standard validation:

- Revalidate the proposal immediately before applying.
- Apply only this proposal.
- Verify affected sources, event series, event occurrences, and event-source links.
- Verify no duplicate event occurrences for the touched series.
- Verify no unrelated venue/event rows changed.
- Skip local preview unless an anomaly appears; live/app behavior can be checked after commit/deploy if needed.

## Remaining TBDs

- ProjectCCG branch identity: corrected. Plain ProjectCCG / WPN store 15983 is treated as Alhambra; Santa Ana/OC remains separate.
- ProjectCCG Alhambra main-store pass: still TBD after this proposal; social/Discord/review/content coverage remains incomplete.
- Turn Zero Canadian Highlander: historical/same-day signal only from this pass; do not add as an active calendar event.
- Aki social/community texture: future main pass can clarify turnout, Discord/community routes, and solo-arrival usefulness.
