# Research run: Finch / Kingslayer FV / Cardboard event completion

Date: 2026-07-18

Pass type: bounded event-completion pass with light Places implications.

Validation level planned: standard, because event-series rows are proposed.

## Scope

- Finch and Sparrow Games
- Kingslayer Games - Fountain Valley
- Cardboard Games

This was not a full main-store reassessment pass. The purpose was to use a fresh Wizards/EventLink pull to close obvious current/future event gaps while avoiding branch contamination and stale/past event writes.

## Source sweep

Fresh Wizards/EventLink output was generated for July 18 through September 30, 2026 and filtered to the exact WPN organization IDs:

- Finch and Sparrow Games: WPN org `6718`
- Kingslayer Games - Fountain Valley: WPN org `7819`
- Cardboard Games: WPN org `17086`

The fresh output also included Kingslayer Games - Lake Forest (`15689`), but those rows were intentionally excluded from this Fountain Valley tranche.

## Finch and Sparrow Games

### What the source showed

Wizards/EventLink continues to support Finch as a very active Magic store with multiple weekly lanes:

- Saturday `Commanderfest!` at 2:30 PM, $8.
- Thursday `Commander Nite!!` at 7:00 PM, $5.
- Monday `cEDH Workshop` at 6:00 PM, free.
- Wednesday `Magic: the Gathering Draft Nights!` at 7:00 PM, $28.
- Tuesday `Modern Kombat` at 7:00 PM, $15.
- Friday `Modern Kombat` at 7:00 PM, $15.
- Short-run Monday `Pauper Night!` at 7:00 PM, $10, visible July 20, July 27, and August 3.

The fresh WPN pull did not show the previously active Monday `MTG Standard Constructed` row. Because the same Monday period is now occupied by cEDH Workshop and short-run Pauper Night in current WPN evidence, the proposal retires the old Standard row as inactive pending future official replay.

### Event recommendation

Write/update now:

- Add short-run Monday `Pauper Night!`.
- Clarify the generic Friday `FNM at Finch and Sparrow` row as Friday `Modern Kombat`.
- Update fresh WPN verification and fees for supported rows.
- Mark the unsupported Monday Standard row inactive rather than leaving it as an open-ended active calendar item.

No past events are proposed.

### Places implication

This reinforces Finch as a highly active Magic venue, but also confirms that a lot of its non-Commander traffic is constructed/competitive or format-specific. It does not materially change the already-established personal-fit read for Commander, but it improves confidence in Finch's overall Magic-program depth.

### Coverage line

Official/Wizards: inspected/captured as fresh event evidence  
Official site/social/reviews: not replayed in this event-completion pass  
Discord/community route: not replayed in this event-completion pass  
Event status: current WPN rows support writes/updates above  
Assessment status: no full reassessment; event-program depth strengthened

## Kingslayer Games - Fountain Valley

### What the source showed

Fresh Wizards/EventLink confirms Kingslayer Fountain Valley has current Magic programming beyond the already-captured Commander Slay Pass rows:

- Sunday Standard at 12:00 PM, $10, visible July 19 and July 26.
- Tuesday Pauper at 6:30 PM, $10, visible July 21 and July 28.
- Friday FNM Modern at 6:30 PM, $10, visible July 24 and July 31.
- Friday booster drafts at 6:30 PM:
  - July 24 Outlaws of Thunder Junction draft, $25.
  - July 31 Tarkir: Dragonstorm draft, $20.
- Wednesday and Friday Commander Slay Pass rows remain current and branch-specific.

This directly corrects the earlier too-narrow tendency to stop after Commander existed. Current non-Commander Magic signals should still be logged when they are clear and source-supported.

### Event recommendation

Write now:

- Add short-run Sunday Standard.
- Add short-run Tuesday Pauper.
- Add short-run Friday FNM Modern.
- Add dated July 24 and July 31 booster drafts.
- Refresh the WPN source and attach fresh WPN evidence to the existing Commander rows.

No Lake Forest rows are included.

### Places implication

Kingslayer Fountain Valley remains a strong operational Magic branch. The additional constructed/draft calendar support improves confidence that it is not merely a Commander-only destination, though Commander Slay Pass remains the most personally relevant lane.

### Coverage line

Official/Wizards: inspected/captured as fresh branch-specific event evidence  
Official site/events: previously inspected; not fully replayed here  
Discord/community route: previously captured as route/content replay TBD; not replayed here  
Reviews/social: not replayed in this event-completion pass  
Event status: current WPN rows support writes above  
Assessment status: no full reassessment; event-program breadth strengthened

## Cardboard Games

### What the source showed

Fresh Wizards/EventLink continues to support Cardboard's existing weekly rows:

- Friday `CBG Commander Night` at 7:00 PM, free.
- Monday `CBG Marvel Superheroes Draft` at 7:00 PM, $20.

The fresh WPN pull did not surface the already-cataloged August 8 and August 9 Hobbit prerelease rows, which came from Cardboard's official calendar. Because those rows already have official-calendar support and future dates, this tranche does not change them.

### Event recommendation

No new Cardboard event rows. Refresh the WPN source and the two WPN-backed weekly rows only.

### Places implication

Cardboard remains a real active Magic venue with Commander and draft lanes, but this was not a full reassessment pass.

### Coverage line

Official/Wizards: inspected/captured as fresh event evidence  
Official calendar: previously captured for Hobbit prereleases; not changed here  
Official social/reviews/Discord: not replayed in this event-completion pass  
Event status: current WPN rows support existing weekly Commander/draft rows  
Assessment status: no full reassessment

## Proposed durable outcome

Create a controlled Supabase proposal with event/source updates only. Do not hand-edit canonical JSON. Do not perform live writes until approved.

## Pre-write validation note

The legacy proposal validator currently checks against the repository JSON snapshot. Because Supabase is now the live operational research source and JSON is only a checkpointed export/recovery fallback, that validator falsely reported live Supabase rows such as `finch-sparrow-booster-draft-standard-sets` as missing. This is not a live-data failure; it is a post-cutover validator/source-of-truth mismatch.

For this proposal, pre-write validation was therefore performed against live Supabase read-only checks:

- Proposed new event-series IDs do not already exist.
- Existing update targets exist in Supabase with the expected venue IDs.
- Kingslayer Lake Forest was excluded; only `kingslayer-games-fountain-valley` is targeted.
- Current duplicate active event-series check for Finch, Kingslayer Fountain Valley, and Cardboard returned no duplicates before this proposed write.

Future workflow improvement: proposal validation should be taught to validate against live Supabase state, or the team should avoid treating the JSON-snapshot validator as authoritative after the Supabase cutover.

## Rollback and validation plan

Rollback:

- For inserted event series, event-source links, and the research-change marker, delete the inserted IDs listed in the proposal.
- For updated source and existing event-series rows, restore previous fields from the pre-write Supabase state.
- No canonical JSON or app code changes are part of this proposal.

Post-write validation if approved:

- Verify affected WPN source IDs show `last_checked` 2026-07-18.
- Verify new Finch/Kingslayer event rows exist with expected venue IDs, dates, times, active/inactive status, confidence, and WPN provenance.
- Verify Finch Monday Standard is inactive and no longer projects as an active planning event.
- Verify no Kingslayer Lake Forest rows changed.
- Run a relevant duplicate active event-series check for Finch, Kingslayer Fountain Valley, and Cardboard.
- Skip local preview unless a data-path anomaly appears; this is a routine event/source write.
