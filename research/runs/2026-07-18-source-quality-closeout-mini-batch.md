# Source-quality closeout mini-batch

Date: 2026-07-18  
Pass type: main-store source-quality / event-implication pass  
Validation level proposed for live write: standard, because one event series would be added.

## Scope

- Grails Gone Wild / GGW Cards N Collects
- Buddies Collectibles
- B.Y.O.GAMES LLC

This pass was prompted by the methodology correction that a reasonable first pass should inspect accessible community routes, especially Discord, rather than pinning every community route as generic TBD.

## Buddies Collectibles

### Source coverage

- Official site: already captured. It supports current commerce, Magic product category, weekly tournament infrastructure, and live-stream commerce orientation.
- Official Linktree: already captured. It exposes Instagram, Twitch, Whatnot, YouTube, TikTok, Twitter, and a Discord invite.
- Discord/community route: inspected. The official Linktree Discord invite opens the SoCalBuddies Discord, which is accessible in the browser session. The server has a real community structure and Linktree reports 1,828 members. Channel structure is broad and commerce/community-heavy: events, meet-ups, gaming, buying/selling, watch party, general chat, Pokemon/anime/Weiss channels. The events channel is sparse and mostly older/stream-related; meet-ups shows 2025 card show / trade night coordination. This supports community scale and some in-person/social activity, but it does not currently prove Friday or Saturday Commander turnout, proxy norms, or solo-arrival comfort.
- Wizards/EventLink: checked. Friday casual Commander is already captured. A Saturday 10:30 PM casual Commander row is current in the local Wizards export and is missing from Supabase.
- Reviews: already captured, including direct Yelp. Yelp and review mirrors support generally positive store-quality signals but also commerce/pricing cautions.
- Other useful sources: Whatnot already captured as commerce/community scale, not event proof.

### Event implication

- Write now: Saturday casual Commander night at 10:30 PM, $10 entry, 12-player capacity, from Wizards/EventLink.
- Already captured: Friday casual Commander night at 6:30 PM.

### Assessment implication

Buddies should remain a useful but commerce-heavy Gardena TCG lead. The new Discord first-pass does not make it a proven relaxed Commander community, but it reduces the unknown slightly: there is an active official community server, just not one whose first-pass public/visible structure establishes Commander texture. The Saturday late-night Commander row materially broadens the calendar read.

## B.Y.O.GAMES LLC

### Source coverage

- Official site: route exists but did not produce useful static content in this pass.
- Wizards/EventLink: checked. Tuesday and Wednesday Commander rows are already captured and remain current in the local Wizards export.
- Reviews: Roadtrippers/Yelp-derived listing was inspected and is materially useful: it shows current-looking 2026 hours/status, 20 Yelp reviews, and review excerpts describing welcoming staff plus a November 2025 Magic player report that BYO has huge space and runs video-game and trading-card-game tournaments.
- Journalism/community: LAist/Boyle Heights Beat profile already captured and materially supports the community/third-place read, Magic play, and challenges keeping the venue open.
- Discord/community route: no store-specific Discord route found in the quick baseline sweep.
- Other useful sources: SoCal Gaming Expo organizer evidence already captured as historical/organizer signal, not current event proof.

### Event implication

- Already captured: Tuesday and Wednesday Commander Night (Casual), including Bracket 3-4, no infinites, Rule Zero, four-player pod minimum, and warm-up/free-play language.
- No new event write now.

### Assessment implication

BYO looks more promising than a pure discovery/conflict read suggests, but distance and current-operation confidence still matter. Roadtrippers/Yelp-derived 2026 review/status and LAist’s Magic/community article support real community value and actual MTG presence, while Wizards provides the exact Commander rows. The fit remains conditional because no-proxy/no-infinites/Bracket 3-4 language may or may not match Kavi’s preferred casual experience.

## Grails Gone Wild / GGW Cards N Collects

### Source coverage

- Official/storefront route: already captured as GGW Cards N Collects official storefront.
- Instagram: already captured and previously inspected. It supports store-controlled identity and stale/historical TCG/MTG activity through September 2025, not July 2026 weekly Commander.
- Wizards/EventLink: checked. Sunday Casual Commander is current in the local Wizards export through August 30, 2026 and is already captured in Supabase.
- Direct reviews/status: MapQuest/Yelp-derived closure conflict already captured; it is outweighed but not erased by current WPN/directory/storefront signals.
- Secondary directories/locators: Trading Card Database was inspected and supports the GGW Cards N Collects alias at 2140 Artesia Blvd #A with the same phone and a card-shop status route. This is useful identity/status support and should be captured as Evidence.
- Discord/community route: no obvious store-specific Discord route found in the quick baseline sweep.

### Event implication

- Already captured: Sunday Casual Commander at 1:30 PM, $8 entry, 20-player capacity.
- No new event write now.

### Assessment implication

The current Wizards/EventLink export reduces the earlier uncertainty about whether Sunday Commander is still operational. Grails is still not a top personal fit because the broader public picture remains commerce/directory-heavy and the social evidence is stale, but it should no longer read as merely "maybe closed." It is a likely active TCG storefront with a current source-backed Sunday Commander lead and lingering community-texture questions.

## Proposal

Proposal file: `supabase/proposals/source-quality-closeout-mini-batch-2026-07-18.json`

The proposal has not been applied. It captures missing material Evidence, adds Buddies Saturday Commander, refreshes affected WPN source checks, and recalibrates Places assessments without changing schema/auth/RLS/app code or canonical JSON.
