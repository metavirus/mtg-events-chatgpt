# Yelp Review Pass — 26 Discovery Stores — 2026-07-16

Outcome type: documentary-edit
Entity: 26 user-requested Southern California stores and venues
Modality path used: Yelp-specific exact-name search -> indexed Yelp mirrors/search snippets -> recent-review extraction -> conflict preservation
Promotion status: No canonical promotion attempted
Files changed: `research/runs/2026-07-16-yelp-store-review-pass.md`, `docs/chatgpt-changelog.md`
Branch / PR: `chatgpt-data-update/2026-07-16-discovery-store-tranche`; PR #15
Codex review needed: Use these review signals as corroboration and prioritization evidence, not as canonical event proof.

## Method and limitation

Direct automated access to Yelp returned a non-retryable robots exclusion. The pass therefore used search-indexed Yelp result pages and mirrors that expose Yelp rating/review counts and recent Yelp excerpts, primarily Yahoo Local, MapQuest, Roadtrippers, Apple Maps, and Giftly. Counts vary by crawl date and should be treated as snapshots. Review excerpts are user observations, not verified facts. No store or event record was edited.

## Store-by-store Yelp findings

### Tweedy Cards and Gaming
- Yelp snapshot: approximately 3.5–4.0 stars, 9–11 reviews depending on mirror/crawl.
- Recent themes: friendly/welcoming staff and helpful owner; repeated price complaints, including above-MSRP or above-market sealed product; limited Pokémon inventory in one review. Older review evidence says weekend tournaments and small play tables, with MTG described as a small part of inventory.
- Store details: 4367 Tweedy Blvd, South Gate; `(323) 219-2369`; short weekday hours and longer weekend hours appear consistently.
- Assessment: mixed retail reputation; friendliness positive, price/inventory concerns material; Yelp does not establish a current MTG cadence.
- Sources: https://local.yahoo.com/info-227816410-tweedy-cards-and-gaming-south-gate/ ; https://maps.apple.com/place?place-id=IEBB5A45F32D3C332

### Grails Gone Wild
- No reliable current Yelp rating/recent-review surface was exposed in this pass.
- Existing business evidence instead shows an active high-volume online seller while the former Torrance physical location may be closed.
- Assessment: Yelp status unresolved; do not infer current walk-in play or retail operations.

### TK Collectibles
- Yelp snapshot: 4.5 stars, roughly 28–30 reviews.
- Recent themes: friendly service, modern and vintage selection, binders/singles, fair trade-in experience, clean accessible shop; product emphasis is heavily Pokémon and One Piece, with some sports and MTG.
- Store details: 3723 Birch St #8A, Newport Beach; `(714) 943-0812`; long daily hours.
- Assessment: strong collector-retail signal and positive service reputation; limited direct evidence of recurring MTG play despite business description claiming multi-TCG tournaments.
- Sources: https://local.yahoo.com/info-238268842-tktcg-newport-beach/ ; https://www.mapquest.com/us/california/tk-collectibles-772453150

### The Game Chest — Promenade on the Peninsula
- No branch-specific Yelp rating or recent Yelp excerpts were reliably surfaced.
- Official routing confirms a dedicated Palos Verdes Facebook page and Discord.
- Assessment: branch review evidence unresolved; prioritize branch social/Discord rather than borrowing reviews from other Game Chest locations.

### B.Y.O.GAMES LLC
- No reliable current Yelp result was surfaced through indexed mirrors.
- Existing sources conflict on whether the venue remains open.
- Assessment: operational status requires direct verification; no Yelp-based conclusion recorded.

### LVLUP GAMING TCG
- Yelp snapshot: 3.5 stars, 11 reviews; another mirror showed 4.0 with 10 reviews.
- Recent themes are polarized: positive comments about welcoming service and fair prices; negative comments about rude/inattentive staff, small inventory, low trade-in offers, and prices allegedly exceeding market. A February 2026 review says 50% trade-in offers and poor service.
- Store details: 1356 E 41st St, Los Angeles; `(213) 755-0284`; listings still show active hours despite other status/schedule conflicts.
- Assessment: substantial customer-service and pricing risk; review count is small and does not settle operating status.
- Sources: https://local.yahoo.com/info-230117484-lvlup-gaming-tcg-los-angeles/ ; https://www.mapquest.com/us/california/lvlup-gaming-tcg-431702117

### The Crimson Guild — South El Monte
- Yelp snapshot: 5.0 stars, 27–32 reviews.
- Recent themes: spacious, clean, modern play area; friendly staff; fair pricing; solid TCG selection. One recent indexed Yelp excerpt explicitly states `commander every Friday`; another praises welcoming judge support at a Riftbound event.
- Store details: 9663 Garvey Ave #114, South El Monte; `(626) 420-8468`; closed Monday, afternoon/evening hours otherwise.
- Assessment: one of the strongest review-backed candidate stores. Friday Commander is actionable but still requires official/Wizards verification before normalization.
- Sources: https://local.yahoo.com/info-239400545-the-crimson-guild-south-el-monte/ ; https://maps.apple.com/place?place-id=I51DEE7FF583245F2

### Games For Meeple
- Yelp snapshot: 4.5 stars, 31 reviews.
- Recent themes: wide card selection including Magic; friendly service; competitive pricing; tournaments with players willing to help newcomers. A March 2026 review reports dismissive treatment by one employee, so sentiment is not uniformly positive.
- Store details: 21308 Pathfinder Rd, Diamond Bar; `(626) 219-2889`.
- Assessment: generally strong community/event signal with one recent service warning; Yelp supports a multi-TCG tournament identity but not a specific Commander cadence.
- Source: https://local.yahoo.com/info-235339994-games-for-meeple-diamond-bar/

### The Comic Bug
- Culver City Yelp snapshot: approximately 4.8–5.0 stars, 72–73 reviews.
- Recent themes: knowledgeable and friendly staff, strong comic selection, reasonable prices, local-community loyalty.
- Manhattan Beach listing: approximately 4.5 stars, 171–172 reviews, but third-party mirrors mark that branch permanently closed despite recent-looking review excerpts. Treat location identity carefully.
- Assessment: strong retail/community reputation at Culver City; Yelp excerpts are comic-centric and do not materially establish current MTG play.
- Sources: https://www.mapquest.com/us/california/the-comic-bug-613418113 ; https://maps.apple.com/place?place-id=I1BC703EFA0E6305F ; https://www.mapquest.com/us/california/the-comic-bug-10887578

### Aki Collectibles
- Yelp snapshot: 4.5 stars, approximately 26–28 reviews.
- Recent themes: clean/tidy shop, friendly and knowledgeable staff, fair comps and discounts, strong Pokémon and One Piece singles/sealed/slab selection, Japanese product.
- Store details: 432 E Valley Blvd Suite A, San Gabriel; daily noon–8 PM shown on one mirror.
- Assessment: positive collector-shop signal; reviews do not establish organized MTG play.
- Sources: https://www.mapquest.com/us/california/aki-collectibles-790513668 ; https://maps.apple.com/place?place-id=I5E8934945106A0B7

### The Game Chest — Irvine
- Yelp-derived snapshot for the Alton Square address: one Giftly mirror reports 3.1 stars and 60 reviews; other non-Yelp aggregators show materially higher ratings, so source identity/counts conflict.
- Recent Yelp excerpts: broad game/toy selection and clean store are positives; recurring negatives include higher prices, unhelpful or insufficiently knowledgeable staff, and poor customer respect. A positive review highlights the branch for trading cards/collectibles.
- Important identity conflict: indexed sources also surface a separate Irvine Spectrum address. Keep Alton Square and Spectrum records separate.
- Assessment: mixed-to-negative Yelp retail signal for the Alton Square listing; branch identity must be resolved before applying review attributes.
- Sources: https://www.mapquest.com/us/california/the-game-chest-421383072 ; https://www.giftly.com/gift-card/the-game-chest-irvine

### Otaku Vault
- Yelp snapshot exposed only one rating through Apple Maps, effectively insufficient for sentiment analysis.
- Store details: 330 E 2nd St Unit 201, Little Tokyo; `(213) 816-1585`; noon–8 PM daily shown.
- Assessment: Yelp evidence too sparse. Do not infer community quality from a single rating.
- Source: https://maps.apple.com/place?place-id=IAC61649846952019

### Alamo Drafthouse Cinema Downtown Los Angeles
- Yelp snapshot: approximately 3.8–4.0 stars, 610–666 reviews.
- Recent themes: distinctive dine-in theater experience, food/drink service, intimate rooms, decor and film programming; complaints include service failures, strict late-admission enforcement, seat condition, and inconsistent food/bar service.
- Store details: 700 W 7th St Unit U240, Los Angeles.
- Assessment: confirms an active event-capable venue but provides no MTG signal. Keep as a venue lead only.
- Sources: https://www.yelp.com/search?find_desc=Best+Movie+Theater&find_loc=Los+Angeles%2C+CA ; https://www.mapquest.com/us/california/alamo-drafthouse-cinema-downtown-los-angeles-423526263

### The Game Cellar
- Yelp snapshot: 4.3 stars, 7 reviews.
- Recent themes: welcoming to players of different backgrounds, active schedule communication through Instagram/Discord, newcomer support across D&D and Magic, friendly/knowledgeable staff, good sealed/singles pricing, and a good place to play Magic. One review reports the shop closed during listed business hours and lacking voicemail.
- Store details: 261 S San Gabriel Blvd, San Gabriel; `(626) 406-4182`.
- Assessment: strong positive community and Magic signal with a small review base; operating-hours reliability deserves monitoring.
- Sources: https://local.yahoo.com/info-238210773-the-game-cellar-san-gabriel/ ; https://www.mapquest.com/us/california/the-game-cellar-766202822

### GXGAMERS
- No reliable local Yelp rating/recent-review listing surfaced. Search instead returned the store's TCGplayer seller feedback.
- Assessment: Yelp pass unresolved; retain prior official/event-source findings and do not substitute online order feedback for in-store community evidence.

### The Bullpen 2.0
- No reliable current Yelp listing surfaced for the possibly relocated/closed store.
- Assessment: Yelp cannot resolve current status; treat as historical/relocation research.

### Turn Zero Games
- Yelp snapshot: approximately 4.3–4.5 stars, 98–99 reviews.
- Recent themes: ample free play space, strong MTG/Warhammer/Flesh and Blood stock, active tables, welcoming staff, beginner instruction, and explicit praise as one of LA's best Magic play locations. Negative reviews allege rude/aggressive or dismissive counter interactions.
- Store details: 3959 Wilshire Blvd Unit A-9, Los Angeles; `(213) 384-3466`; daily 11 AM–10 PM shown.
- Assessment: very strong MTG/community signal with a recurring customer-service downside from a minority of reviews.
- Sources: https://local.yahoo.com/info-191868450-turn-zero-games-los-angeles/ ; https://maps.roadtrippers.com/us/los-angeles-ca/shopping/turn-zero-games ; https://maps.apple.com/place?place-id=IB3AD229ADB39CAA9

### CoreTCG
- Yelp snapshot: approximately 4.0–4.1 stars, 215–237 reviews depending on crawl.
- Recent themes: broad TCG selection and some attentive, knowledgeable service; negative themes include slow or inconsistent counter help, pricing/negotiation concerns, alleged product-condition/authenticity worries later addressed by staff, and online-order dispute handling.
- Store details: 770 S Arroyo Pkwy #110, Pasadena; `(626) 577-6699`; daily 11 AM–8 PM.
- Assessment: major active retailer with mixed service reputation. Yelp is more useful for retail risk than for Commander/community fit.
- Sources: https://local.yahoo.com/info-177946771-coretcg-pasadena/ ; https://maps.roadtrippers.com/us/pasadena-ca/shopping/coretcg ; https://maps.apple.com/place?place-id=I3342F4ED19A76968

### DXN Provisions
- Yelp snapshot: 4.5 stars, 41 reviews.
- Recent themes: wide card selection including MTG, Pokémon, Digimon and One Piece; tournaments; many tables/chairs; good turnout for card events. One March 2026 review alleges an employee yelled at a longtime customer during event stress.
- Store details: 215 S 1st Ave, Arcadia.
- Assessment: credible organized-play and physical-space signal, with one recent customer-service warning.
- Source: https://local.yahoo.com/info-209862517-dxn-provisions-arcadia/

### Revenge Of
- Yelp snapshot: approximately 4.5 stars, 104–112 reviews.
- Recent themes: distinctive comic shop, indie books, pinball/arcade, café-like experience, fun all-ages atmosphere; isolated complaints about poor customer service.
- Store details: 3420 Eagle Rock Blvd, Los Angeles; `(323) 561-3017`.
- Assessment: strong community venue/experience signal, but Yelp excerpts are comic/pinball-centric and do not establish MTG activity.
- Sources: https://maps.roadtrippers.com/us/los-angeles-ca/shopping/revenge-of ; https://www.mapquest.com/us/california/revenge-of-448866408

### Next-Gen Games
- Yelp snapshot: approximately 4.4–4.5 stars, 116–120 reviews.
- Recent themes: strong Magic presence, open play rooms, broad card selection, helpful and patient staff for new players, regular events and wargaming terrain. Recent 2026 negative reviews complain about phone interactions and a bulk-card pricing dispute.
- Store details: 5450 W Pico Blvd #103, Los Angeles; `(323) 938-3400`.
- Assessment: one of the strongest MTG/community candidates; recent service complaints should be retained but do not outweigh the broad positive event/play evidence.
- Sources: https://local.yahoo.com/info-198933692-nextgen-games-los-angeles ; https://maps.roadtrippers.com/us/los-angeles-ca/places/next-gen-games-los-angeles ; https://www.mapquest.com/us/california/next-gen-games-346077037

### Odyssey Games — Pasadena
- Yelp snapshot: 3.9 stars, 90 reviews.
- Recent themes: broad board-game/TCG selection, free on-site play, spacious tables, friendly and knowledgeable staff. A separate older Google-derived review complains that the MTG community can feel cliquish and that unaffiliated visitors may struggle to join a table.
- Store details: 1795 E Colorado Blvd, Pasadena; `(626) 817-9522`; daily 10 AM–11 PM shown.
- Assessment: substantial play infrastructure but mixed solo-arrival signal. The cliquishness report is not Yelp and should remain separately attributed.
- Source: https://maps.apple.com/place?place-id=IAF4FE6E971BCF9EA

### Crown City Games
- Yelp snapshot: 5.0 stars, 8 reviews.
- Recent themes: very large space, fair pricing, strong atmosphere, diverse games, friendly and knowledgeable staff, welcoming first-visit experience.
- Store details: 42 E Colorado Blvd, Pasadena; `(626) 298-6994`.
- Assessment: promising physical/community venue, but Yelp sample is very small and excerpts do not establish MTG depth.
- Source: https://www.mapquest.com/us/california/crown-city-games-791937706

### Comic Quest
- Yelp snapshot: approximately 4.0–4.1 stars, 147–151 reviews.
- Recent themes: knowledgeable/helpful staff, broad comics/dice/model/game selection, durable local-shop reputation. Significant negatives include an event reportedly restricted to locals despite an earlier invitation, accusations of rude treatment/scalper assumptions, and price concerns.
- Store details: 23811 Bridger Rd #111, Lake Forest; `(949) 951-9668`; game room available outside scheduled events.
- Assessment: meaningful organized-play infrastructure, but the `locals only` report is directly relevant to the user's solo-arrival goals and deserves follow-up.
- Sources: https://local.yahoo.com/info-21020665-comic-quest-lake-forest/ ; https://www.mapquest.com/us/california/comic-quest-11420535 ; https://maps.apple.com/place?place-id=I59D06C9626B61B09

### It's GameTime!
- Yelp snapshot: 4.1 stars, 61 reviews.
- Recent themes: well-stocked CCG boosters/precons/singles, helpful and knowledgeable staff, reasonable kid-friendly low-cost card boxes, but limited play space. Recent January 2026 excerpts include serious negative complaints about staff behavior, store smell/stock conditions, and local-shop pricing.
- Store details: 3301 Motor Ave, Los Angeles; `(424) 603-4325`.
- Assessment: real MTG store and event host, but Yelp shows a sharper recent customer-experience risk than older general ratings suggest. Preserve both the official Commander schedule and the review concerns.
- Sources: https://local.yahoo.com/info-168922240-it-s-gametime-los-angeles/ ; https://www.giftly.com/gift-card/its-gametime-los-angeles

### A & N Collectibles
- Yelp snapshot: approximately 4.0 stars, 90–97 reviews.
- Recent themes: weekly Magic tournaments, draft and Commander praise, staff able to assemble deck lists, broad inventory, tournament room, and busy play environment. Negative-rating share is material in the aggregate, though the most recent surfaced excerpts were strongly positive.
- Store details: 105 W Arrow Hwy #7, San Dimas; `(909) 394-2375`; long weekday evening hours.
- Assessment: strong MTG/Commander and event-space signal; one of the clearest Yelp-supported organized-play candidates.
- Sources: https://local.yahoo.com/info-20766590-a-n-sports-cards-san-dimas ; https://maps.roadtrippers.com/us/san-dimas-ca/entertainment/a-n-collectibles ; https://www.mapquest.com/us/california/a-n-collectibles-273309068

## Yelp-priority conclusions

Strongest positive Yelp-supported MTG/community candidates:
1. Turn Zero Games
2. Next-Gen Games
3. The Game Cellar
4. The Crimson Guild
5. A & N Collectibles
6. Games For Meeple
7. DXN Provisions

Operational or experience risks requiring follow-up:
- LVLUP Gaming TCG: polarized service/pricing reviews plus status conflict.
- Comic Quest: `locals only` event report is directly relevant to solo-arrival usability.
- It's GameTime!: official MTG cadence is useful, but recent negative customer-experience excerpts warrant caution.
- CoreTCG: large retailer with mixed service/pricing/order-handling reputation.
- The Game Chest Irvine: branch/address/review conflation risk and mixed-to-negative Yelp signal.
- Tweedy: friendly but price/inventory concerns and weak MTG depth.

Yelp unresolved or too sparse:
- Grails Gone Wild
- The Game Chest Promenade
- BYO Games
- Otaku Vault
- GXGAMERS
- The Bullpen 2.0

## Validation unavailable

- Direct Yelp page reading was blocked by robots exclusion.
- Yelp sort/filter controls and full recent-review chronology were unavailable.
- Review text was limited to indexed excerpts; no private or login-gated material was accessed.
- Ratings and review counts should be refreshed through a browser-backed Yelp pass before any permanent scoring field is populated.
