# Research run: Krazy Nick's / Comic Quest / Crimson Guild event completion

Date: 2026-07-18

Status: proposed, not applied.

Pass type: bounded event-completion pass with light Places implications.

Validation level planned: standard, because event-series and event-occurrence rows are proposed.

## Scope

- Krazy Nick's Games
- Comic Quest
- The Crimson Guild - South El Monte

This tranche replaced the initially suggested Magic and Monsters / The Game Cellar follow-up after live/project checks showed those two had already been tied off in recent applied passes.

## Source sweep

Fresh Wizards/EventLink output was generated for July 18 through September 30, 2026 and filtered to the exact WPN organization IDs:

- Krazy Nick's Games: WPN org `9348`
- Comic Quest: WPN org `6809`
- The Crimson Guild - South El Monte: WPN org `18899`

No broad review/social replay was performed. This was a focused calendar-completion tranche from an authoritative event source.

## Krazy Nick's Games

Existing Supabase coverage before the proposal:

- Sunday Commander.
- Wednesday Commander.

Fresh WPN showed additional current/future Magic coverage:

- Magic Presents: God of Mischief Krazy Commander on July 19 at 1:00 PM.
- Thursday Modern at 7:00 PM.
- Friday Pauper at 7:00 PM.
- Krazy Standard Showdown on July 24 at 7:00 PM.
- The Hobbit prerelease on August 7 at 7:00 PM, August 8 at 12:00 PM, and August 8 at 4:00 PM.

Event recommendation: write now for the above, and refresh WPN provenance on the existing Commander rows.

Places implication: this strengthens Krazy Nick's as a broad active Magic store, not merely a Commander-only local option. The previously captured review/community cautions still matter, but this pass improves event-program confidence.

Coverage line:

Official/Wizards: inspected/captured  
Official site/social/reviews: not replayed in this event-completion pass  
Discord/community route: not replayed in this event-completion pass  
Events: write now  
Assessment: event-program breadth strengthened, no full reassessment

## Comic Quest

Existing Supabase coverage before the proposal:

- Friday Night Magic Commander.

Fresh WPN showed additional current/future Magic coverage:

- Friday Standard Showdown on July 24 and July 31 at 6:00 PM.
- Marvel Superheroes Commander Party #2 on July 31 at 6:00 PM.
- Hobbit prereleases on August 7 at 6:00 PM, August 8 at 12:00 PM, and August 9 at 12:00 PM.
- Hobbit Commander Parties on August 21 and September 18 at 6:00 PM.
- Magic Presents: Heart of the Mountain Commander Event on September 4 at 6:00 PM.

Event recommendation: write now for the above, and refresh WPN provenance on the existing Friday Commander row.

Places implication: Comic Quest looks more calendar-useful than the prior single-Commander-row view suggested, with special Commander and prerelease support visible in WPN. Distance still makes it less immediate than closer candidates.

Coverage line:

Official/Wizards: inspected/captured  
Official site/social/reviews: not replayed in this event-completion pass  
Discord/community route: not replayed in this event-completion pass  
Events: write now  
Assessment: event-program breadth strengthened, no full reassessment

## The Crimson Guild - South El Monte

Existing Supabase coverage before the proposal:

- Friday Commander Night.

Fresh WPN showed additional current/future Magic coverage:

- Wednesday draft at 7:00 PM.
- Friday FNM Pauper at 7:00 PM.
- Sunday Standard Showdown at 4:00 PM.
- Marvel Super Heroes Commander Party on July 31 at 7:00 PM.

The WPN pull contains two same-time Marvel Commander Party listings for July 31. The proposal collapses them to one planning event and notes the duplicate source condition.

Event recommendation: write now for the above, and refresh WPN provenance on the existing Commander row.

Places implication: Crimson Guild appears to have broader active Magic support than the existing single Commander row showed, including draft, Pauper, Standard, and Commander Party. This improves event confidence but does not replace a full store-fit/social-source assessment.

Coverage line:

Official/Wizards: inspected/captured  
Official site/social/reviews: not replayed in this event-completion pass  
Discord/community route: not replayed in this event-completion pass  
Events: write now  
Assessment: event-program breadth strengthened, no full reassessment

## Proposal

Proposal file: `supabase/proposals/krazy-comic-crimson-event-completion-2026-07-18.json`

Proposed operations:

- Refresh 3 WPN source rows.
- Refresh existing Commander rows for the three venues.
- Add missing current/future WPN-supported event series and finite occurrences.
- Attach WPN provenance.
- Add a proposed Updates marker.

No canonical JSON, app code, schema/auth/RLS, or personal preference changes are proposed.

## Proposed validation if approved

- Verify affected WPN sources show `last_checked` 2026-07-18.
- Verify new event series and occurrence rows exist with expected venue IDs, dates, times, statuses, and source links.
- Verify no duplicate active event-series rows for Krazy Nick's, Comic Quest, or Crimson Guild.
- Verify no unrelated venues changed.
- Skip local preview unless a data-path anomaly appears; this is routine event/source work.
