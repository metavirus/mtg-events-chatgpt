# Research Run: Collector Legion Full Comparable Pass

## Run metadata

- Run ID: `2026-07-14-collector-legion-full-pass`
- Started: 2026-07-14 19:55:00 -07:00
- Completed: 2026-07-14 20:35:00 -07:00
- Researcher/agent: Codex
- Public geographic origin: Los Alamitos, CA public centroid
- Collection radius/partitions: outer-ring but still relevant Commander venue, comparable pass for Collector Legion in Lawndale
- Tools and collector versions: web retrieval, live public page fetches, repo reconciliation
- Related prior run or checkpoint: `research/wizards-reconciliation-2026-07-14.json`, `research/discord-baseline-2026-07-14.md`, `CURRENT_FRONTIER.md`

## Objective

Bring Collector Legion up to a more comparable evidence standard versus the
stronger top-venue profiles by checking its official site, public event-commerce
surface, and linked socials, then promoting only the claims that survive
cross-source scrutiny.

## Methodology

Started from the existing Wizards/EventLink and Discord-backed provisional
record, then:

- re-checked the official website homepage for store identity, hours, contact,
  and outbound social links;
- inspected the public special-events catalog to understand whether the website
  reflects recurring Commander or instead foregrounds tournament/prerelease
  inventory;
- checked directly linked Instagram and X profile pages for public profile-level
  viability;
- recorded Facebook as an attempted but temporarily blocked source;
- kept Saturday Commander unofficial because no current official public source in
  this pass named a routine Saturday Commander series directly.

## Coverage summary

- Stores/organizations considered: 1
- Sources attempted: 6
- Sources successfully inspected: 5
- Sources blocked/inaccessible: 1 temporary block
- Raw artifacts preserved: none committed; public page text was transcribed into structured findings
- New findings: official site is a better identity/social directory than weekly Magic schedule source; special-events catalog is heavily Saturday oriented; Instagram profile is active and sizable
- Material changes: normalized Collector Legion record now reflects source routing, Instagram/X presence, and explicit Saturday displacement-risk interpretation

## Sources trawled

- Collector Legion
  - Website homepage: `https://www.collectorlegion.com/`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: homepage shows store information, outbound links to Facebook, X, YouTube, and Instagram, plus featured special events; it does not expose a clean weekly Magic schedule in the accessible text.
  - Freshness/authority: official, high

- Collector Legion
  - Special-events catalog: `https://www.collectorlegion.com/catalog/events-special_events/3693`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: visible listings are dominated by dated special events, especially Saturday tournaments and prereleases such as Chaos Origins Case Tournament, Standard RCQs, and The Hobbit prerelease sessions.
  - Freshness/authority: official event-commerce surface, high

- Collector Legion
  - Wizards Store & Event Locator record: `https://locator.wizards.com/store/11405`
  - Checked: 2026-07-14 via existing reconciliation snapshot
  - Access result: already captured and reused
  - Useful finding: repeated Tuesday `Commander Tuesday Free Raffle` series at 7:00 PM with free raffles at 7, 8, and 9 PM.
  - Freshness/authority: official organized-play source, high

- Collector Legion
  - Instagram profile: `https://www.instagram.com/collectorlegion/`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: public profile metadata shows 5,027 followers, 151 following, and 3,078 posts, indicating an active and established social surface worth deeper mining later.
  - Freshness/authority: official social profile, high

- Collector Legion
  - X profile: `https://twitter.com/CollectorLegion`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: public profile resolves and is explicitly linked from the official website, so it should remain in the source map even if not yet deeply mined.
  - Freshness/authority: official social profile, medium

- Collector Legion
  - Facebook page: `https://www.facebook.com/collectorlegion/`
  - Checked: 2026-07-14
  - Access result: temporary block
  - Useful finding: no content extracted in this pass; this is a meaningful negative result rather than a silent omission.
  - Freshness/authority: official social page if accessible, currently unusable in this collection path

## Findings and insights

### Exact evidence

- The homepage prominently displayed dated special-event items such as:
  - `Chaos Origins Case Tournament - SATURDAY July 18th @ 2:00pm`
  - `Vendetta Pre-Rift Event - SATURDAY July 25th @ 1:00pm`
  - `3v3 OP-16 Case Tournament - SATURDAY August 1st @ 12:00pm`
- The special-events catalog also surfaced:
  - `Standard 2 Slot RCQ - SATURDAY August 22nd @ 12:00pm`
  - `Standard 2 Slot RCQ - SATURDAY August 29th @ 12:00pm`
  - `The Hobbit Prerelease` sessions on Friday, Saturday, and Sunday, including two Saturday sessions.
- Instagram profile metadata read:
  - `5,027 Followers, 151 Following, 3,078 Posts - See Instagram photos and videos from Collector Legion (@collectorlegion)`
- Existing Wizards reconciliation for organization `11405` carries:
  - `Commander Tuesday Free Raffle`
  - weekly Tuesday at 7:00 PM
  - description: `Free raffles at 7pm 8pm and 9pm!`

### Normalized facts

- Tuesday Commander is strongly confirmed from Wizards/EventLink.
- The official website is not presently a clean weekly Commander schedule source.
- The official site is, however, a strong identity and source-discovery surface.
- The current public event-commerce catalog is saturated with Saturday special
  events and tournaments.
- Instagram is an active official source and should stay in the primary source
  map for future deeper mining.
- Facebook was attempted and yielded a temporary block, which should be treated
  as an access limitation rather than absence of a page.

### Analytical interpretation

- Collector Legion is a good example of why source routing matters: Wizards is
  presently better for recurring Tuesday Commander, while the store website is
  better for special-event load and displacement risk.
- The Saturday-heavy special-event catalog does not prove Saturday Commander is
  absent every week, but it materially increases the chance that a routine
  weekend Commander plan could be crowded out by higher-priority tournaments or
  prereleases.
- The store appears operationally robust and socially visible, but the current
  public-source mix still leaves weekend Commander more ambiguous than Tuesday.

### Personal-fit assessment

- Positive signals:
  - substantial organized-play presence
  - strong Commander activity signal
  - enough social/community surface to justify deeper monitoring
- Caution signals:
  - solo arrival may still be hit or miss
  - Saturday plans deserve an at-risk flag because major events visibly cluster there

### Confidence and ambiguity

- High confidence: Tuesday Commander exists and is a real routine anchor.
- High confidence: official site currently foregrounds Saturday special events.
- Medium confidence: Instagram will be operationally useful once mined at the post level.
- Medium/low confidence: Saturday Commander reliability, because Discord implies it but this pass did not find current official public confirmation.

## Reconciliation decisions

- Kept the canonical store identity as `collector-legion`.
- Retained only the Tuesday recurring Commander event as fully confirmed in the
  normalized event layer.
- Promoted official website, event-catalog, Instagram, and X profile sources
  into the normalized source graph.
- Preserved Facebook as an attempted source with a blocked result rather than
  overstating its usefulness.
- Promoted displacement risk as a store-level interpretation rather than as a
  false event cancellation claim.

## Data changes

- Added source records:
  - `src-collector-homepage-2026-07-14`
  - `src-collector-events-catalog-2026-07-14`
  - `src-social-collector-instagram-2026-07-14`
  - `src-social-collector-x-2026-07-14`
- Updated `stores.json` for `collector-legion` with Instagram URL, stronger
  assessment notes, and expanded source linkage.
- Updated `events.json` details for the Tuesday Commander series to better
  explain why it is the clearest recurring anchor.
- Added a new dataset change-log entry for this full comparable pass.

## Validation

- JSON files were revalidated after edits.
- Scope check: no messaging, posting, liking, or authenticated actions were taken.
- Source check: preserved both successful and blocked source attempts.

## Failures and limitations

- Facebook was temporarily blocked in this collection path.
- This pass confirmed Instagram profile-level viability, not post-level event extraction.
- No current official public source in this run explicitly named a Saturday
  Commander series, so Saturday remains suggestive rather than fully confirmed.

## Unresolved questions

- Does Collector Legion’s Instagram carry weekly Magic or Commander graphics
  that can directly confirm Saturday routine play?
- When a major Saturday tournament lands, does it partially crowd out Commander
  tables or fully suppress them on the floor?
- Does the venue have stronger solo-arrival support in practice than the mixed
  Discord anecdotes suggest?

## Recommended next actions

1. Leave Tuesday Commander high-confidence and weekend Commander provisional in the app.
2. Run a later deep-social pass on Collector Legion Instagram once we are in a post-mining tranche.
3. Continue the next venue with the same comparable method so cross-store quality stays even.
