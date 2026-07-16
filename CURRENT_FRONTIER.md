# Current Frontier

Last updated: 2026-07-15

## ChatGPT sideload handoff

When Codex quota is constrained, ordinary ChatGPT may assist only through the
guarded lane defined in `docs/chatgpt-sideload-sop.md`. Current cross-agent
messages live in `docs/agent-mailbox.md`; candidate discoveries, feature ideas,
and follow-ups enter through `docs/ASYNC_INTAKE.md`; ChatGPT-originated edits are
recorded in `docs/chatgpt-changelog.md` for later Codex audit.

New stores, venues, groups, events, and event series are candidate-only in this
lane. Ordinary ChatGPT must not create canonical entities.

## Current tranche (paused)

Top-venue tranche near Los Alamitos, focused on:

- Collectors Lounge - Cypress
- The Guild House
- Kingslayer Games - Fountain Valley
- Finch and Sparrow Games
- related regional/community context already captured through the Discord baseline

Broad research is intentionally paused while the first complete private app is
built. The research queue remains open and should resume from
`docs/WORK_BACKLOG.md` after a usable v1 exists.

## Current immediate research rule

Do not move on to the next store simply because a bounded discovery pass exists.
The active requirement is now a stronger candidate-grade first pass:

- enough source coverage from the standard suite to trust the read;
- enough actionable upcoming MTG event detail to make the store practically useful;
- enough synthesis to answer whether the store is a real candidate worth trying.

Tweedy Cards and Gaming is the current test case for this refined standard.
Do not expand to the next discovery candidate until Tweedy has either:

- been raised to a genuinely useful candidate-grade partial record; or
- been explicitly kept at discovery after the obvious standard-source event and
  corroboration checks are completed and explained.

## Recently completed

- Discord baseline and completion pass for selected store and regional servers
- Cross-source top-venue public-site reconciliation
- Social baseline for the same top-venue tranche
- Comparable cross-source public pass for Collector Legion in Lawndale
- Persistence-checkpoint workflow added to project methodology and context docs
- Architecture refinement for personal visit logs and routine-event displacement risk
- Policy refinement: user field notes may be stored in repo-backed evidence as
  clearly attributed sources rather than only in private hosted state

## Current source status for this tranche

- Discord: substantial first pass complete
- Wizards/EventLink: substantial first pass complete
- Official websites / event-commerce pages: first pass complete for top venues
- Instagram / Facebook: baseline accessibility and profile-value pass complete
- Deep post-level social mining: partially complete and now required during store
  passes unless the source is actually blocked
- Additional nearby WPN-led stores are now being promoted in light-touch form
  when the listing text itself carries meaningful fit signals even before full
  social/website vetting.

## Strongest confirmed findings so far

- The Guild House has official public-calendar confirmation for Tuesday Commander
  from 6:00 PM to 9:00 PM.
- Kingslayer Fountain Valley has official Wednesday and Friday Commander event
  pages with explicit pod-pairing language and house rules.
- Finch and Sparrow has a much stronger public social/event footprint than its
  sparse Discord suggests.
- Collector Legion has a clean Tuesday Commander anchor, but its official site
  is strongly weighted toward Saturday special events, so weekend Commander
  should carry an explicit displacement-risk flag until more direct Saturday
  confirmation appears.
- The Guild House social pass is now complete and shows a currently active,
  operationally useful social footprint including recent Tuesday casual
  Commander and Friday special-Commander posts.
- The Guild House refinement pass clarifies that reservations help an already
  arranged group but do not by themselves solve solo arrival.
- Kingslayer Fountain Valley social pass is now complete and confirms that the
  brand's socials are active but too multi-location to outrank official branch
  event pages for weekly Commander specifics.
- Kingslayer Fountain Valley refinement now clarifies that `Slay Pass` should be
  read as Kingslayer house terminology for a paid, structured Commander entry,
  not as a separate Magic format.
- Methodology refinement: store-specific jargon should be translated into plain
  player language in normalized data, and multi-location brand wording should
  not be assumed branch-specific without clean linkage.
- User preference nuance: within Kingslayer branches, Fountain Valley remains
  the primary weighted location; Lake Forest is still worth watching as a
  secondary branch; Oceanside is effectively out of scope.
- Collectors Lounge now has a stronger normalized source map: the official site
  and online store are weak for weekly event ingestion, while Discord,
  Instagram, and Wizards form the canonical weekly monitoring trio.
- Collectors Lounge remains one of the strongest fit candidates, but its public
  website is weak for weekly schedule extraction; Discord plus Wizards remain the
  primary weekly pair there.
- Collectors Lounge refinement now clarifies that Friday casual Commander is a
  strong rules-level fit with Bracket 3/proxy-friendly signals, but solo-arrival
  confidence remains only medium because current sources do not show explicit
  staff pairing or a durable LFG mechanism.
- Honey Pot Meadery stands out as a more newcomer-friendly nontraditional venue
  lead because the Wizards listing explicitly describes free-entry casual open
  play with drop-in pacing and loaner supplies.
- Honey Pot Meadery has now been strengthened by official-site and social
  review: the venue's own events page confirms recurring Wednesday casual
  Commander plus richer Magic programming like league/special-event/prerelease
  layers, making it one of the stronger secondary leads despite the longer
  drive.
- Honey Pot event normalization has now started in earnest: `God of Mischief`,
  structured Mead & Mana Commander League items, and a Hobbit prerelease have
  been promoted beyond store-level notes into first-class event records.
- Honey Pot signal-deepening pass now frames it more precisely as a
  medium/high-MTG-focus, fairly broad-opportunity venue: lively, real, and
  promising, but still not the same thing as a Magic-dedicated store ecosystem.
- Honey Pot has also become a methodology-significant source case: its official
  events calendar appears actively maintained with new Magic formats and variants,
  which is a strong positive signal for event curation and community-building
  seriousness. That calendar should be treated as a daily-refresh source, not
  only a weekly reference surface.
- Hobby Overflow now has much better source routing than before: active
  Instagram, an official website, and a Linktree that exposes a Discord path.
  The remaining unknown is not whether the store is active, but what its casual
  Commander tables actually feel like.
- Hobby Overflow's Discord-routing pass now adds a useful scale signal: the
  invite surface showed a real nontrivial server rather than a dead invite,
  which strengthens the case that the shop has meaningful player-pool breadth
  even before Commander-specific channel interpretation is complete. Under the
  corrected MTG-focus concept, Hobby Overflow also reads a bit more strongly as
  a Magic-substantial store overall rather than just a generic mixed-TCG lead.
- Hobby Overflow now also has a better physical/reputation signal set: Google
  Maps surfaced a 4.9 rating from 52 reviews plus owner/user photos showing a
  visible storefront play setup and a longer room with seated players, which
  materially strengthens confidence that it is a real organized-play venue and
  not only an active retail shell.
- Hobby Overflow's bounded Discord survey is now materially complete at first-pass
  level: the server is real at roughly 780 members / 185 online, has meaningful
  official/store-news structure plus a dedicated `Magic the Gathering` section,
  and shows some real MTG chatter. What it still does not yet show is dense
  Commander meetup/LFG behavior or a sharp read on Thursday Commander texture.
- Joyful Toad now has clearly active Facebook and Instagram surfaces, but the
  visible social emphasis is broader TCG promotion rather than Commander
  specificity, so `Chill Commander Night` remains promising but still less
  corroborated than stores with stronger Commander-facing socials.
- Joyful Toad's fuller pass now sharpens the newer signal dimensions too: it
  looks like a reasonably broad and active late-night TCG store with real scale
  signals, but still not especially Commander-centered in the currently visible
  content mix.
- Requiem's dedicated pass now clarifies that it is socially alive and worth
  watching, but in a venue-style way: Commander looks real, yet the weekly
  series is explicitly vulnerable to collaborations, special events, and room
  resets.
- Requiem's refresh pass now rounds out the first-pass story with bounded
  physical-space evidence from its official photos page. The venue looks more
  materially real as an in-person space than a text-only read would suggest,
  but no obvious public Discord route surfaced from the official site.
- Comic Book Hideout has now been promoted sharply upward from discovery status:
  the previous cautionary note appears to have inherited SoCalMagic's `No proxy`
  signal in error, while the real first-pass evidence shows free Sunday
  Commander, beginner-friendly Friday Night Magic, a `Thursdays are for Magic`
  social cadence, and explicit newcomer-friendly language.
- SoCalMagic now reads as a more important overall-map venue than its earlier
  placeholder note suggested: the `No proxy` Commander caution still matters,
  but the broader public evidence points to a serious Magic-dedicated shop with
  real MTG depth, helpful-staff signals, and larger-event capacity.
- The Cardboard Games research pass supports later promotion into a real partial
  record: strong official site, real official calendar, repeated Friday free-play
  Commander and Monday draft anchors in Wizards, explicit June 20-21 Marvel
  Super Heroes prerelease Sealed evidence on the official calendar, and now
  normalized upcoming August 8-9 Hobbit prerelease Sealed events, plus
  encouraging recent community recommendations. The normalization repair is now
  complete. The calendar is useful for specials but has category-tagging errors,
  Instagram is only a secondary operational source, and no official Discord
  route surfaced.
- Tweedy Cards and Gaming has now received its bounded identity-first discovery
  pass. The result is intentionally conservative: the Wizards-backed Friday
  Commander signal appears real, but no stronger store-controlled or social
  corroboration surfaced quickly enough to justify promotion beyond
  `wizards-discovery`.
- Guildhall - Whittier has now been promoted into a real partial record too, but
  with a different lesson: it looks more like a lively nerd-bar/community venue
  than a clearly Magic-centered store, and current visible promotion gives much
  more space to the venue/bar identity than to MTG itself.
- Shuffle and Cut Games - La Habra has also jumped upward quickly: the official
  site strongly foregrounds Magic overall and visibly sells/promotes MTG
  prerelease/event entries, making it one of the strongest discovery-tier
  Magic-overall signals even though its obvious event-calendar route currently
  dead-ends.
- Alakazam Comics has also moved up: despite an SSL/certificate issue on the
  main site, alternate public routing revealed one of the stronger multi-format
  Magic signals in the tranche, including a dedicated MTG Facebook page and
  visible evidence for Pauper, Commander Party, and draft events.
- Lost Planet has also now been promoted into the promising-nearby bucket: the
  public source stack is unusually rich, with Facebook framing a
  community-driven hobby shop, Instagram routing directly to a monthly public
  calendar, and that calendar exposing unusually informative MTG event wording
  like `Tuesday Night Pods`, `Two Headed Giant Commander Night`, and `Bracket
  lvl2 Commander Party`.
- Lucky Seven Games has also now been promoted out of bare discovery status:
  the official storefront is current, clearly TCG-first, and explicitly says
  the location holds daily events and tournaments, while Wizards provides two
  recurring free-entry Commander anchors on Sunday and Monday evenings. The
  present limitation is not store reality but thin public community texture:
  the Instagram surface is real but still modest, so this currently looks more
  proven as a functioning MTG retail/event store than as a richly social
  pre-coordination hub.
- The Game Chest - Del Amo Fashion Center received the intentionally lighter
  treatment the user suggested. The result did not overturn the intuition:
  public evidence confirms a real location and Wizards-backed organized play,
  but nothing in the bounded pass surfaced stronger MTG-community texture or a
  compelling reason to prioritize this mall-location store over the stronger
  nearby candidates.
- Kingslayer Games - Lake Forest has now been promoted into a branch-aware
  partial record, but the key result is ambiguity rather than enthusiasm: it is
  clearly a real Kingslayer branch, yet the current Commander event wording
  appears to inherit Fountain Valley language inside the Lake Forest listing.
  That makes Lake Forest worth keeping in the watch set, but with lower
  schedule-confidence and lower interpretive clarity than Fountain Valley.
- Magic and Monsters has now emerged as the strongest candidate in this mini
  tranche so far. Official site and events-page evidence show a real,
  Magic-forward store with live event infrastructure rather than a stale or thin
  placeholder presence, and the public social surfaces are real too. It still
  needs later refinement if we want the full official event stream normalized,
  but it already reads as a meaningfully better candidate than a generic
  Wizards-only lead.
- SoCalMagic now carries a clearer caution flag: `Commander all day / No proxy`
  should be treated as a real negative-fit signal rather than a generic unknown.
- User field note: Finch Saturday structured casual Commander was a reasonable
  experience with random four-player pod assignment and loose 50-minute rounds.
- User field note: Finch Sunday casual/open-play Commander had no structure but
  a generally decent vibe.
- Finch refinement now clarifies that the store has multiple Commander tracks:
  routine Thursday Commander Nite, structured Saturday Commanderfest, and a
  separate louder Birdcage / Fish Bowl / cEDH special-event layer that should
  not be blended into routine casual Commander.
- Modeling refinement: explicit Commander `open play` should be treated as its
  own event type, not merely as underspecified generic Commander.
- Product requirement: recurring Commander should remain visible even when a
  larger same-day event may crowd it out; the app needs an explicit at-risk or
  displacement signal.
- Displacement-risk refinement: a prominently advertised same-day major event
  such as an RCQ is itself a strong enough warning signal to mark routine
  Commander as plausibly at risk, even without an explicit cancellation post.
- New operating-model refinement: official WPN/Wizards news should be treated as
  an upstream vocabulary and alert source so temporary event branding such as
  `Magic Presents: God of Mischief` can be translated before it appears in local
  store listings.
- New product-direction refinement: the app should not only synthesize a
  research view, but also support a daily landscape/dashboard mode driven by a
  lighter signal sweep across news feeds, socials, and urgent operational
  changes.
- New monitoring refinement: user-favorited stores, groups, venues, and event
  series should automatically be pulled into the daily monitoring tier rather
  than waiting for the normal weekly cadence.
- New analytical refinement: it is useful to score not just schedule reliability
  but also relative MTG-focus, so a Magic-centered venue can be distinguished
  from a broader mixed-fandom venue that happens to host Commander. This is a
  Magic-overall lens, not a Commander-dominance lens.
- Live calibration note: as MTG-focus, player-pool breadth, and venue-scale are
  backfilled onto already-reviewed stores, watch for weird or unhelpful outputs.
  If the model starts producing bad intuition, revisit it instead of forcing it.
- Workflow refinement: review/prominence and photo/play-space signals should get
  a bounded best-efforts pass during routine store research, not an unlimited
  extraction hunt. Deeper visual work should be reserved for top leads,
  favorites, or targeted backfill.
- Workflow refinement: if a store has an accessible Discord, a bounded Discord
  survey should be part of that store's main first pass rather than a deferred
  optional extra; capture events, announcement patterns, meetup/LFG signals, and
  overall source usefulness without trying to read the whole server.

## Highest-value unresolved questions

- Finch and Sparrow: clearer current read on the average Thursday table and
  how best to promote Finch Sunday open play into a normalized recurring series
- Collector Legion: stronger Saturday Commander confirmation versus tournament
  crowd-out
- Collectors Lounge: solo-arrival practice still needs in-practice confirmation,
  but the source-routing and rules-fit questions are now much clearer
- Requiem still needs a deeper first-class venue/community pass to move beyond
  promising-but-lightly-vetted status only in the narrower sense of turnout and
  practical pod behavior; its source-routing and schedule-flexibility story are
  now much clearer
- Hobby Overflow and Joyful Toad have now moved beyond bare discovery, but each
  still needs one sharper unresolved answered:
  - Hobby Overflow: what actual Commander pod formation and power expectations
    look like once Discord/community signals are interpreted
  - Joyful Toad: whether Commander is actively promoted anywhere more directly
    than the current Wizards listing
- The Guild House: actual solo-arrival behavior in practice remains important,
  but the current public-source ambiguity is now narrower and better defined
- Kingslayer Fountain Valley: how free play interacts with Slay Pass seating,
  and whether the prize/support package is confirmed branch-specifically for
  Fountain Valley

## Recommended next step

Build the first complete private application using `docs/IMPLEMENTATION_PLAN.md`.
Treat the existing static interface as a disposable data-loading prototype, keep
the Commander-heavy event seed visibly labeled as incomplete Magic coverage, and
retain the research backlog for later continuation.

## After that

- continue the next store/group tranche with the refined methodology
- continue turning promising nearby partials into sharper comparable records
- decide whether to finish the full top-venue tranche first or open the next store/group tranche
- keep `docs/WORK_BACKLOG.md` current as the explicit repo-backed future-work log
- later, add an upstream-signal layer from official Wizards news for notable
  new-set, prerelease, Commander-product, and program-change awareness
- later, operationalize a daily light-signal sweep that can power a dashboard or
  alert rail without requiring a full deep research pass every day
- later, ensure favorites drive monitoring cadence and alert priority
- later, backfill MTG-focus / player-pool breadth / venue-scale carefully and
  treat the first results as a test of the framework, not final truth

## Caution flags

- Kingslayer social channels are multi-location and require branch-aware interpretation
- sparse Discord should not lower a store automatically; it is often a source-routing result
- recurring event listings are not guarantees; large same-day events may suppress
  a weekly Commander series without every source being updated in sync
