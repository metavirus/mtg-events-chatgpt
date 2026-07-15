# Research Run: Cross-Source Top Venues

## Run metadata

- Run ID: `2026-07-14-cross-source-top-venues`
- Started: 2026-07-14 12:15:00 -07:00
- Completed: 2026-07-14 12:56:41 -07:00
- Researcher/agent: Codex
- Public geographic origin: Los Alamitos, CA public centroid
- Collection radius/partitions: local priority venues within roughly 11 miles, selected from the 2026-07-14 Wizards and Discord passes
- Tools and collector versions: in-app browser skill, browser runtime bundled with Codex desktop, existing `research/wizards-reconciliation-2026-07-14.json`
- Related prior run or checkpoint: `research/wizards-reconciliation-2026-07-14.json`, `research/discord-baseline-2026-07-14.md`

## Objective

Correlate the strongest Discord leads with public official sources so that high-fit
stores have cleaner event records, clearer authority separation, and fewer
ambiguous Commander claims.

## Methodology

Started from the Discord baseline and selected four high-value venues where a
public-site pass was likely to sharpen the record:

- Collectors Lounge Cypress
- The Guild House
- Kingslayer Games - Fountain Valley
- Finch and Sparrow Games

Priority order for each venue was:

1. official website or store-hosted event calendar;
2. official registration/event-commerce pages;
3. public embedded calendars or source-linked social pages;
4. comparison against the existing Wizards reconciliation checkpoint;
5. comparison against the Discord baseline.

This run focused on field-level confirmation of recurrence, time, structure,
power/casual signals, and solo-arrival implications. It did not attempt a fresh
broad-discovery crawl.

## Coverage summary

- Stores/organizations considered: 4
- Sources attempted: 8
- Sources successfully inspected: 8
- Sources blocked/inaccessible: 0
- Raw artifacts preserved: none beyond written transcriptions in this run
- New findings: 4 venue-level source reconciliations, 3 materially improved Commander series interpretations
- Material changes: The Guild House and Kingslayer Fountain Valley now have stronger public-source confirmation than the Discord baseline alone provided

## Sources trawled

- Collectors Lounge Cypress
  - `http://collectorslounge.us/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: official website confirms Cypress address, Discord invite, Instagram/Facebook links, and that tournaments are a core offering, but it does not expose a text-usable MTG schedule in the visible page state.
  - Freshness/authority: official site, current for store identity but weak for event specifics

- The Guild House
  - `https://www.theguildhousegames.com/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: official site exposes a dedicated `Hours & Events` page with Discord, Facebook, Instagram links and an embedded Google Calendar.
  - Freshness/authority: official site, strong

- The Guild House
  - `https://www.theguildhousegames.com/hours-events/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: page embeds a public Google Calendar rather than listing events directly in page text.
  - Freshness/authority: official site, strong

- The Guild House
  - Embedded Google Calendar from the `Hours & Events` page, opened in schedule view
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: confirms recurring `Commander Night` Tuesdays 6:00-9:00 PM, plus `MTG Booster Draft` on Fridays 7:00-11:00 PM.
  - Freshness/authority: official operational calendar, very strong

- Kingslayer Games - Fountain Valley
  - `https://www.kingslayergames.com/events/fountain-valley/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: official event-commerce category lists dated Fountain Valley events and exposes dated Commander event product pages.
  - Freshness/authority: official registration/commerce source, very strong

- Kingslayer Games - Fountain Valley
  - `https://www.kingslayergames.com/7-15-26-fountain-valley-wednesday-mtg-commander-sl.html`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: confirms Wednesday Commander Slay Pass at 7:00 PM with 6:00 PM check-in, $13 fee, pod-pairing policy, and house rules.
  - Freshness/authority: official event detail page, very strong

- Kingslayer Games - Fountain Valley
  - `https://www.kingslayergames.com/7-24-26-fountain-valley-mtg-fnm-commander-slay-pas.html`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: confirms Friday FNM Commander Slay Pass at 7:00 PM with materially identical structure to the Wednesday paid Commander track.
  - Freshness/authority: official event detail page, very strong

- Finch and Sparrow Games
  - `https://www.finchandsparrowgames.com/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: homepage prominently features `THE BIRDCAGE VII: 2FAST2FINCH cEDH - 7/25/26 11:00AM`, described as full proxy friendly, 64-player cap, prize-heavy, and clearly competitive.
  - Freshness/authority: official site, strong

- Finch and Sparrow Games
  - `https://www.finchandsparrowgames.com/pages/finch-and-sparrow-games-events`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: official monthly calendar UI rendered, but event titles were not exposed in the captured visible page state. The page is therefore useful as a live visual calendar surface but weak for automated text extraction in this run.
  - Freshness/authority: official site, medium for machine-readable extraction

## Findings and insights

### The Guild House

- Exact evidence:
  - The public embedded Google Calendar lists `Commander Night` every Tuesday from 6:00 PM to 9:00 PM on both 2026-07-14 and 2026-07-21.
  - The same calendar lists `MTG Booster Draft` Friday 2026-07-17 from 7:00 PM to 11:00 PM.
- Normalized facts:
  - Tuesday Commander is now confirmed by an official public calendar, not only by Discord announcement text.
  - Friday draft is a separate recurring/dated Magic series and should sit beside Commander in calendar views.
- Interpretation:
  - This materially upgrades confidence in The Guild House as a reliable weekly Commander option.
  - The calendar confirms recurrence and time, but does not answer proxies, bracket, or pod matching.
- Personal-fit assessment:
  - Promising and more trustworthy than before because the store has a public authoritative event surface.
- Confidence:
  - High for Tuesday Commander timing and recurrence.
  - Medium for player-experience fit.

### Kingslayer Games - Fountain Valley

- Exact evidence:
  - Official event pages confirm both Wednesday and Friday Commander Slay Pass tracks at 7:00 PM with 6:00 PM check-in and $13 entry.
  - Event text states seat priority goes to Slay Pass participants, the store will try to form four-player pods, and partial groups of 1-3 will be filled to four.
  - Event text explicitly encourages table discussion of power level and lists house rules: no infinites, no Thassa's Oracle win conditions, and only one extra turn per turn cycle.
- Normalized facts:
  - Wednesday and Friday are official Commander nights, not just member-reported patterns.
  - Kingslayer has a structured but still open-play-oriented pod seating model that helps solo arrivals.
  - House rules point away from pure cEDH, though the fee and prize packs still imply a more organized and potentially sharper environment than totally free casual play.
- Interpretation:
  - This store now has one of the clearest public solo-arrival/pairing explanations in the project.
  - The combination of paid entry, prize packs, and house restrictions suggests a managed mid-power environment rather than pure freeform casual tables.
  - No proxy policy was found on the official event pages inspected here.
- Personal-fit assessment:
  - Stronger than the Discord baseline suggested because the pairing workflow is explicit.
  - Still slightly more structured and higher-pressure than a pure free Commander night.
- Confidence:
  - High for schedule, fee, pod formation, and house rules.
  - Medium for bracket translation because the site does not use the Wizards bracket vocabulary directly.

### Finch and Sparrow Games

- Exact evidence:
  - The homepage hero product is a large cEDH event, `THE BIRDCAGE VII: 2FAST2FINCH cEDH - 7/25/26 11:00AM`, described as full proxy friendly with substantial prizing and a 64-player cap.
  - The official event calendar page rendered but did not surface event titles in the captured text state.
- Normalized facts:
  - Finch is actively promoting at least one high-profile cEDH event on the public site.
  - The official site, not Discord, is the correct primary research route for this venue.
  - Full proxy friendliness is confirmed for the Birdcage cEDH event, but that does not automatically prove policy for ordinary casual Commander nights.
- Interpretation:
  - Finch's public identity is currently much more event-commercial and tournament-forward than its Discord suggests.
  - This does not contradict the Wizards `Commander Nite!!` and `Commanderfest!` listings, but it does reinforce that the store supports multiple Commander subcultures, including explicitly competitive ones.
- Personal-fit assessment:
  - Routine Thursday/Saturday Commander should stay in scope, but large cEDH specials should be visibly separated and deprioritized.
- Confidence:
  - High that Finch has active public MTG event infrastructure.
  - Medium for routine casual-night social fit.

### Collectors Lounge Cypress

- Exact evidence:
  - The official site confirms address, social channels, Discord link, and a general tournament identity.
  - The visible page state does not expose a reliable text event schedule.
- Normalized facts:
  - The Discord weekly graphic and Wizards records remain the best available authoritative sources for current MTG schedule details.
  - The website is useful for canonical identity and outbound links, not for weekly MTG normalization.
- Interpretation:
  - This is a source-routing result: weekly monitoring should continue to prefer Discord plus Wizards over the public website for event specifics.
- Personal-fit assessment:
  - No change to the venue-fit conclusion; it remains one of the strongest casual Commander candidates.
- Confidence:
  - High for source-routing conclusion.

## Reconciliation decisions

- The Guild House Discord Tuesday Commander finding is upgraded from `probable_same_event` to `confirmed_same_event` against the public embedded Google Calendar.
- The Guild House Friday MTG draft mention belongs as a distinct recurring Magic series and should not be conflated with Commander programming.
- Kingslayer Fountain Valley Discord member reports about Wednesday/Friday Commander are upgraded from anecdotal pattern to `confirmed_same_event` against official event-commerce pages.
- Kingslayer pod-formation guidance should be attributed to the official event page, not the Discord chatter.
- Finch and Sparrow remains a split-source venue:
  - Wizards and the official website are primary for event facts.
  - Discord remains low-value for weekly monitoring.
- Collectors Lounge website should be retained as an identity and social-link source, but not promoted as a schedule authority.

## Data changes

- Added this run folder and its written findings.
- No normalized app-data files were edited in this run.

## Validation

- Privacy check: no private messages, credentials, cookies, or user-private browser data recorded.
- Source authority check: official calendars and event-commerce pages were separated from Discord/member evidence.
- Cross-source check: each promoted conclusion was compared against the 2026-07-14 Wizards and Discord checkpoints before inclusion.

## Failures and limitations

- Finch's official event calendar did not expose event titles in a text-friendly way during this pass.
- Collectors Lounge's site did not expose a current MTG schedule in visible text.
- This run did not inspect Instagram/Facebook posts in depth once stronger official site/calendar sources were found.
- Proxy policy remains unresolved for Kingslayer routine Commander despite strong event-page detail.

## Unresolved questions

- The Guild House: proxy policy, pairing method in practice, and whether the welcoming Discord language reflects consistent solo-arrival experience.
- Kingslayer Fountain Valley: explicit proxy policy and whether non-paid free-play tables form alongside Slay Pass without friction.
- Finch and Sparrow: whether the official calendar page can be made more extractable through another route, and whether routine Commander nights are socially closer to casual open play or to structured prize-supported events.
- Collectors Lounge Cypress: whether any registration or commerce page exists beyond Discord/Wizards for cleaner week-to-week event ingestion.

## Recommended next actions

1. Promote The Guild House Tuesday Commander recurrence into the next normalized dataset refresh with the public Google Calendar as a first-class source.
2. Promote Kingslayer Fountain Valley Wednesday and Friday Commander series with the official event-page structure fields, especially pod formation and house rules.
3. Run a focused Finch and Sparrow source pass on Instagram plus the official event calendar surface to separate routine casual Commander from the Birdcage cEDH special-event track.
4. Search for a registration or commerce layer for Collectors Lounge Cypress; if none exists, treat Discord plus Wizards as the canonical weekly pair.
