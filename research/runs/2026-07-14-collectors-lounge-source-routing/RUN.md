# Research Run: Collectors Lounge Source Routing

## Run metadata

- Run ID: `2026-07-14-collectors-lounge-source-routing`
- Started: 2026-07-14 20:40:00 -07:00
- Completed: 2026-07-14 21:10:00 -07:00
- Researcher/agent: Codex
- Public geographic origin: Los Alamitos, CA public centroid
- Collection radius/partitions: close-in top venue, focused comparable pass on source routing and possible event-commerce surfaces
- Tools and collector versions: live public web fetches plus repo reconciliation
- Related prior run or checkpoint: `research/discord-baseline-2026-07-14.md`, `research/runs/2026-07-14-social-content-finch-collectors/`, `research/runs/2026-07-14-cross-source-top-venues/`

## Objective

Resolve the open question for Collectors Lounge Cypress: whether there is a
cleaner official registration or commerce layer for weekly Magic events beyond
Discord, Instagram, and Wizards/EventLink.

## Methodology

Starting from existing Discord, Instagram, and Wizards evidence:

- re-checked the official website structure and outbound links;
- inspected the linked online-store surface specifically for event or Commander
  products;
- re-verified Instagram and Facebook as live public official sources;
- promoted only the stronger source-routing conclusions into normalized data.

## Coverage summary

- Stores/organizations considered: 1
- Sources attempted: 5
- Sources successfully inspected: 5
- Sources blocked/inaccessible: 0
- Raw artifacts preserved: none beyond written transcriptions
- New findings: the official online store does not currently function as a useful event-registration surface; Facebook remains viable; Instagram profile remains strong
- Material changes: Collectors source graph is now more complete, and weekly-source authority is clearer

## Sources trawled

- Collectors Lounge - Cypress
  - Official website: `http://collectorslounge.us/`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: site exposes identity, contact, Discord/social links, online-store link, and general tournament branding.
  - Freshness/authority: official, high

- Collectors Lounge - Cypress
  - Online store: `https://collectorslounge.us/online-store`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: page resolves but behaves like a generic retail shell; no usable current Commander or weekly-event listing surfaced in the accessible page state.
  - Freshness/authority: official, medium/high

- Collectors Lounge - Cypress
  - Instagram: `https://www.instagram.com/collectors.lounge/`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: public profile metadata currently reads 5,418 followers, 87 following, and 4,429 posts.
  - Freshness/authority: official social, high

- Collectors Lounge - Cypress
  - Facebook: `https://www.facebook.com/110508608781459`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: page title resolves cleanly as `Collectors Lounge | Cypress CA`.
  - Freshness/authority: official social, medium/high

- Collectors Lounge - Cypress
  - Prior Discord and Instagram weekly-lineup evidence reused from same-day research checkpoints
  - Checked: 2026-07-14
  - Access result: reused
  - Useful finding: weekly Magic lineup and Commander rules already confirm Friday casual/proxy-friendly lane versus Saturday optimized lane.
  - Freshness/authority: official community and official social synthesis, high

## Findings and insights

### Exact evidence

- The official site links:
  - Discord
  - Instagram
  - Facebook
  - TikTok
  - online store
- The online-store page title is simply `Online Store` and its accessible content
  did not surface Commander, MTG, God of Mischief, or Optimized Commander as a
  usable event catalog.
- Instagram public profile metadata currently reads:
  - `5,418 Followers, 87 Following, 4,429 Posts - See Instagram photos and videos from Collectors Lounge Cypress (@collectors.lounge)`
- Facebook page title resolves as:
  - `Collectors Lounge | Cypress CA`
- Prior official weekly lineup evidence states:
  - Friday: `God of Mischief Commander`, 6:30 PM, $10 entry, one pack with entry
  - Saturday: `Optimized Commander`, 5:30 PM, $10 entry, one pack with entry

### Normalized facts

- No cleaner official event-commerce source surfaced in this pass.
- The official website remains an identity and source-discovery surface.
- The online store is not currently a practical weekly-event ingestion source.
- Discord plus Instagram plus Wizards are the canonical weekly monitoring trio
  for Collectors Lounge.
- Facebook is a viable supporting source but not the primary weekly surface.

### Analytical interpretation

- Collectors Lounge is now a resolved source-routing case rather than an open
  mystery.
- This is a useful contrast with stores that do have stronger official calendar
  or event-page infrastructure: for Collectors, forcing the website to act like
  a schedule source would be misleading.
- The app should present this store with confidence in the weekly trio while
  avoiding overpromising the usefulness of the site or online-store layers.

### Personal-fit assessment

- Still one of the strongest nearby candidates for you.
- Friday remains the more promising casual lane.
- Saturday should stay visible but clearly marked as the higher-power option.

### Confidence and ambiguity

- High confidence: no better weekly event-commerce layer surfaced here.
- High confidence: Instagram is a meaningful weekly operational source.
- High confidence: Friday and Saturday Commander lanes are meaningfully distinct.
- Remaining ambiguity is now more about in-practice experience than source discovery.

## Reconciliation decisions

- Promoted the online-store page as a tracked source, but specifically as a weak
  event-ingestion surface.
- Added missing Collectors source records that were already implied by prior
  normalized references.
- Upgraded Friday and Saturday Commander confidence because the Wizards records
  are now better contextualized by corroborating weekly lineup evidence.

## Data changes

- Added source records for:
  - official online store
  - official Discord synthesis
  - official Instagram profile
  - Instagram weekly-lineup synthesis
  - official Facebook page
- Updated the Collectors Lounge store record with stronger source-routing notes
  and schedule reliability.
- Updated Friday and Saturday Commander event details and confidence.

## Validation

- JSON revalidation required after promotion edits.
- Scope stayed read-only.
- No login, posting, liking, or account mutation occurred.

## Failures and limitations

- TikTok was linked from the site but did not yield useful public profile detail
  in this pass, so it was not promoted.
- This pass did not attempt a fresh full Discord scrape because the current
  weekly-lineup evidence was already captured the same day.

## Unresolved questions

- How easy is solo arrival at Collectors in practice on Friday casual nights?
- Do proxy-friendly casual norms hold consistently week to week?
- Are there occasional special events that suppress Friday or Saturday routine
  Commander without every source updating in sync?

## Recommended next actions

1. Treat the source-routing question as largely resolved for Collectors Lounge.
2. Keep watching Discord, Instagram, and Wizards as the main weekly trio.
3. Use future passes on this store for in-practice fit questions rather than more website archaeology.
