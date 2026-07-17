# Research run: high-value event candidate replay A

Date checked: 2026-07-17

Scope:

- Finch Birdcage VII
- The Game Cellar
- Next-Gen Games
- It's GameTime!
- The Crimson Guild

Boundary:

- Steward-led direct replay only.
- No canonical JSON edits.
- No live Supabase writes.
- No event ingestion.
- ChatGPT packet material treated as queued evidence, not canonical truth.

## Summary

This pass found that the five requested high-value candidates are not an obvious new-ingestion batch. All five already have useful canonical event coverage in the current repository:

- Finch Birdcage VII is already modeled as a dated cEDH special event.
- The Game Cellar already has recurring Commander in the Cellar records across operating days.
- Next-Gen Games already has a Wednesday Commander Night record.
- It's GameTime! already has a Sunday Casual Commander Day record.
- The Crimson Guild already has a Friday Commander Night record.

The best next action is therefore a narrow source/provenance-refresh proposal, not a broad event import. If accepted, it should update source freshness and selected venue/event notes where current source replay adds useful support, while avoiding duplicate event records.

## Candidate findings

### Finch Birdcage VII

Classification: duplicate / already covered.

Current replay:

- Official Finch site still exposes `THE BIRDCAGE VII: 2FAST2FINCH cEDH - 7/25/26 11:00AM`.
- The visible listing confirms full-proxy-friendly language, 11:00 AM start, 10:00 AM doors, guaranteed tiered prizing, 64-player cap, and $60 entry.

Repository coverage:

- Existing event: `finch-sparrow-birdcage-vii-2026-07-25`.
- Existing source: `src-finch-birdcage-2026-07-15`.

Dated event vs recurring/projection:

- Dated event, not recurring.
- Competitive/cEDH special, not routine casual Commander.

Uncertainty:

- No material uncertainty for existence/date/time from the current official listing.
- User-fit remains low/deprioritized because this is cEDH/special-event programming, not casual open-play Commander.

Recommendation:

- No new event write.
- Optional proposal item: refresh source `lastChecked` / provenance note to 2026-07-17 if the controlled workflow supports source freshness updates.

Sources checked:

- https://finchandsparrowgames.com/

### The Game Cellar

Classification: confirmed, already substantially covered.

Current replay:

- Official Game Cellar site confirms WPN Premium status, San Gabriel identity, Magic support, weekly events, Commander, draft, prerelease, and explicit community/pod language.
- Site language supports both casual and competitive Magic and describes newcomer-friendly staff/community positioning.

Repository coverage:

- Existing store: `the-game-cellar`.
- Existing source: `src-wpn-13567`.
- Existing events:
  - `the-game-cellar-commander-in-the-cellar-0-12-00`
  - `the-game-cellar-commander-in-the-cellar-2-14-00`
  - `the-game-cellar-commander-in-the-cellar-3-14-00`
  - `the-game-cellar-commander-in-the-cellar-4-14-00`
  - `the-game-cellar-commander-in-the-cellar-5-14-00`
  - `the-game-cellar-commander-in-the-cellar-6-12-00`

Dated event vs recurring/projection:

- Current useful signal is recurring/open-play style Commander support.
- No new specific dated event was confirmed in this pass.

Uncertainty:

- Exact daily Commander schedule still comes from Wizards/EventLink records already in the repo; the official website supports the venue/program qualitatively but does not expose the full structured day/time grid in text.
- No new dated event should be inferred from the general official-site language.

Recommendation:

- No new event write.
- Prepare a narrow proposal only if useful to add/refresh official-site provenance for venue evaluation and source support.

Sources checked:

- https://www.thegamecellarla.com/

### Next-Gen Games

Classification: confirmed, already partially covered.

Current replay:

- Official Next-Gen About page confirms current Pico/Hauser identity, WPN Premium status, tournaments every day, weekly-updated event listings, Commander/EDH support, and community/Discord routing.
- Official contact/FAQ page says weekly and special events live on the store calendar with relevant information and preregistration links for larger premium events.

Repository coverage:

- Existing store: `next-gen-games`.
- Existing source: `src-wpn-9747`.
- Existing event: `next-gen-games-commander-night-3-18-00`.

Dated event vs recurring/projection:

- Current useful signal is recurring Commander/EDH and general organized-play infrastructure.
- No new specific dated event was confirmed in this pass.

Uncertainty:

- The official site confirms Commander/EDH support but the current text replay did not expose the store-calendar's full structured Commander schedule beyond the existing Wizards/EventLink record.
- Do not infer additional event records from broad "tournaments every day" language.

Recommendation:

- No new event write.
- Optional proposal item: add official Next-Gen site/about/contact sources to support venue evaluation and confidence, if not already present in Supabase.

Sources checked:

- https://www.nextgengames.la/service/about/
- https://www.nextgengames.la/service/

### It's GameTime!

Classification: confirmed, already covered.

Current replay:

- Official It's GameTime site gives a clear MTG schedule:
  - Friday Night Magic at 8 PM.
  - EDH / Commander on Sundays at 1 PM.
- Address and phone are visible on the official site.

Repository coverage:

- Existing store: `it-s-gametime`.
- Existing source: `src-wpn-9054`.
- Existing event: `it-s-gametime-casual-commander-day-0-13-00`.

Dated event vs recurring/projection:

- Recurring weekly Commander.
- Not a dated one-off special.

Uncertainty:

- Existing canonical event title/details came from Wizards/EventLink. The official site corroborates the Sunday 1 PM Commander cadence, but does not add bracket/proxy/pod details.
- Friday Night Magic is confirmed as a Magic schedule item, but this pass did not confirm its format; do not normalize it as Commander.

Recommendation:

- No new Commander event write.
- Optional proposal item: attach official-site source support to the existing Sunday Commander event and possibly add a source/evidence note that Friday Night Magic exists but format is unspecified.

Sources checked:

- https://www.itsgametimela.com/

### The Crimson Guild

Classification: confirmed, already covered but still source-thin.

Current replay:

- Official Crimson Guild site is active and confirms retail/Discord presence, but does not expose a clear Commander schedule in indexed text.
- Third-party/Yahoo/Yelp-derived page confirms store activity, Magic products, weekly tournaments/events positioning, address/phone, and strong review signal.
- Repo already has Wizards/EventLink Friday Commander Night coverage.

Repository coverage:

- Existing store: `the-crimson-guild-south-el-monte`.
- Existing source: `src-wpn-18899`.
- Existing event: `the-crimson-guild-south-el-monte-the-crimson-guild-commander-night-5-18-00`.

Dated event vs recurring/projection:

- Recurring weekly Friday Commander Night from Wizards/EventLink.
- No new dated one-off event confirmed in this pass.

Uncertainty:

- Store-controlled public site does not yet corroborate the Friday Commander cadence in text.
- Address appears as both 9661 and 9663 Garvey Ave #114 in third-party materials; current repo uses 9661. This should not be changed in this event replay batch.
- Keep confidence tied primarily to Wizards/EventLink for event schedule until official social/Discord or another store-controlled event source confirms it.

Recommendation:

- No new event write.
- Optional proposal item: source/provenance note that Crimson remains confirmed through Wizards/EventLink with useful but schedule-thin store/social/third-party support.

Sources checked:

- https://thecrimsonguild.com/
- https://local.yahoo.com/info-239400545-the-crimson-guild-south-el-monte/

## Write/no-write recommendation

Do not prepare a broad event-ingestion proposal from this batch.

Recommended narrow proposal, if the user approves:

1. Refresh source/provenance support for the five existing candidates where current official-source replay materially supports the existing records.
2. Avoid duplicate event records for all five candidates.
3. Keep confirmed dated-event handling limited to Finch Birdcage VII, which is already represented.
4. Keep recurring/projection language separate:
   - The Game Cellar, Next-Gen, It's GameTime, and Crimson Guild are recurring-program candidates, not newly discovered dated specials in this pass.
5. Do not normalize It's GameTime Friday Night Magic as Commander without a format-specific source.
6. Do not change Crimson Guild address/identity from this batch.

Risk level for a follow-up proposal: low to medium.

Suggested validation level for any follow-up write: lean, because the likely changes are source/provenance refreshes and research-change notes. Use standard validation only if event rows are touched.

