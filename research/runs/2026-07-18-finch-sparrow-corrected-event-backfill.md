# Research run: Finch and Sparrow corrected event backfill

Date: 2026-07-18  
Pass type: targeted main-pass correction / micro-backfill  
Validation level proposed for any write: standard, because event-series rows would be added.

## Scope

Finch and Sparrow Games only.

This pass was run to close the known Finch gap after the corrected methodology change:

- do not stop after Commander if other Magic formats are plainly visible;
- distinguish Commander/casual fit from competitive/cEDH/store-character signals;
- inspect first-party event surfaces rather than treating source routes as a future task;
- keep user field notes and research truth separate from personal preference.

## Current Supabase state reviewed

Supabase already contains:

- `Commander Nite!!` weekly Thursday at 7:00 PM;
- `Commanderfest!` weekly Saturday at 2:30 PM;
- `cEDH Workshop` weekly Monday;
- `Birdcage VII: 2FAST2FINCH cEDH` on 2026-07-25;
- Finch venue/evaluation notes explaining that Finch is a serious nearby candidate with multiple Commander lanes, but that Sunday open play and the best casual arrival lane remained unresolved.

## Sources checked

- Official site: inspected. Supports current operation, WPN Premium positioning, Magic inventory, play/events language, address, hours, and Birdcage VII promotion.
- Official TCGplayer Pro event calendar: inspected in browser. Supports additional current recurring July/August 2026 Magic event lanes beyond the existing Commander/cEDH rows.
- Instagram: already captured and previously sampled; not deeply replayed in this micro-pass. Prior notes say it is strongest for current specials/promotional tone.
- Facebook: checked through available static route and blocked/inaccessible; no content claim made.
- Discord/community route: prior Discord baseline inspected Finch's server and found it low-usefulness for current Commander intelligence. No new Discord content replay was performed in this pass.
- Wizards/EventLink: already captured for existing Commander/cEDH anchors; not independently re-run here because the store-controlled event calendar supplied the missing source route.
- Direct Google/Yelp reviews: searched in this pass but no direct review surface was captured as material. Review texture remains optional future polish, not a blocker for the event backfill.
- Secondary directories/locators: Boardoro was noted as a secondary WPN/play-space/tournament directory signal, but direct official/WPN/store sources remain stronger and no new source row is recommended for it.

## Findings

The official event calendar currently lists repeated Finch events through at least early August 2026:

- Sunday: `Finch and Sparrow Casual Play`
- Monday: `CEDH Mondays` and `MTG Standard Constructed`
- Tuesday: `Modern Kombat`
- Wednesday: `Booster Draft - Standard Sets`
- Thursday: `Commander Nites`
- Friday: `FNM at Finch and Sparrow`
- Saturday: `Finch and Sparrow Commanderfest`

The app already has the Monday cEDH, Thursday Commander, Saturday Commanderfest, and Birdcage VII records. It does not yet have the Sunday casual/open-play, Wednesday draft, Friday FNM, Monday Standard, or Tuesday Modern lanes.

## Event classification

| Signal | Classification | Recommendation |
| --- | --- | --- |
| Sunday `Finch and Sparrow Casual Play` | write now, but not Commander-specific | Add as weekly casual/open-play Magic signal using Finch's 12:00 PM store opening time as a planning proxy, with details preserving that the calendar did not source a specific event start and Commander density/arrival timing is still unknown. |
| Wednesday `Booster Draft - Standard Sets` at 7:00 PM | write now | Add as weekly draft series. |
| Friday `FNM at Finch and Sparrow` at 7:00 PM | write now | Add as weekly FNM/special Magic series; do not infer format beyond FNM. |
| Monday `MTG Standard Constructed` at 7:00 PM | write now | Add as weekly constructed series; likely lower personal priority but useful calendar completeness. |
| Tuesday `Modern Kombat` at 7:00 PM | write now | Add as weekly constructed series; likely lower personal priority but useful calendar completeness. |
| Birdcage VII | already captured | No new write. |
| Thursday Commander / Saturday Commanderfest / Monday cEDH | already captured | Refresh source provenance only through the official event calendar. |
| Prerelease/sealed | event TBD | No current Finch prerelease/sealed signal was found in this micro-pass. |

## Places assessment implications

Finch looks slightly more complete than before, not fundamentally different.

The meaningful change is that Sunday open/casual play and weekly draft are no longer just soft impressions or open questions; they are visible on Finch's own current event calendar. The Sunday item has no displayed time, so the proposal uses Finch's 12:00 PM opening time as a planning proxy and says so explicitly. That improves planning usefulness because the store now reads as a broad, close Magic hub rather than only a Commander/cEDH split.

Recommended assessment direction:

- Fit: move from B / 3.8 to B+ / 4.0.
- Confidence: move from medium to high, because there is now strong cross-source support from official site, official event calendar, Wizards/EventLink-derived records, prior Instagram sampling, and direct user field notes.
- Keep caution: Sunday casual play is not proven to be Commander-specific, and 12:00 PM is an opening-time proxy rather than a sourced start time.
- Keep open question: best casual solo arrival lane still needs lived texture, especially Thursday versus Sunday versus Saturday.

## Proposed write

Prepared proposal:

- `supabase/proposals/finch-sparrow-corrected-event-backfill-2026-07-18.json`

It proposes:

- updating `src-finch-events` as current;
- adding event-source provenance from the official event calendar to existing Finch event rows;
- inserting five missing recurring event series;
- updating Finch venue/evaluation language conservatively;
- adding a research-change marker.

No live Supabase write has been performed.

## What remains TBD

- Whether Sunday casual/open play is reliably Commander-heavy enough to model as a Commander series.
- Best actual arrival window for Sunday casual play beyond the 12:00 PM opening-time proxy.
- Current Thursday table texture and bracket/proxy expectations.
- Whether Finch has a current prerelease/sealed lane not visible in this pass.
- Optional review-surface enrichment if Finch needs a future store-fit texture pass.
