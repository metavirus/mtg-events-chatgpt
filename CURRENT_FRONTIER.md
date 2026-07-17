# Current Frontier

Last updated: 2026-07-17

## Checkpoint: UX accepted, Supabase continuity is next

The local UX pass is accepted through commit `470b63b` on
`codex/reconcile-wizards`. Do not keep polishing the interface unless a true
blocker appears.

Accepted UX work now includes:

- Today decision-surface improvements, including weekend/week usability,
  Friday-start week views, today highlighting, and a non-blocking Signals
  treatment;
- Events scanability improvements, including denser catalog cards, cleaner
  list/week/month layouts, Friday-start weeks, today highlighting, and
  navigation for Events week/month views;
- Places assessment visibility, including separate research status, personal
  fit, confidence, rationale, evidence access, and compact preference controls;
- Updates/Communities usefulness improvements, including compact Updates
  filtering and clearer activity surfaces;
- responsive/layout fixes sufficient for the current local UX checkpoint.

Known UX follow-ups are future polish, not completion blockers, unless the user
explicitly promotes them. The main parked item is exploring whether Signals /
Fresh Signals should regain a more prominent default surface without restoring a
fixed right-side pane that consumes calendar width.

The next product stage is **Supabase continuity / operational-source readiness
before additional research expansion**. This sequencing is intentional. A major
earlier failure mode was unsafe or low-quality canonical JSON writing; do not
resume broad research collection directly into JSON as the main path. Use the
Supabase continuity work to make the data-writing and operational-source path
safer before the final research pass.

Immediate next tranche:

1. Use `docs/SUPABASE_MIGRATION_STATUS.md`,
   `docs/SUPABASE_CONTINUITY_MODEL.md`, and the existing migrations/seeds as the
   baseline; do not rediscover the Supabase state from scratch.
2. Verify the current migration files match the accepted remote/read-adapter
   state.
3. Define and validate the next safe cutover step toward Supabase as operational
   source while retaining JSON recovery/export.
4. Do not perform new venue/event research, canonical data expansion, deployment,
   or broad UX polish during that tranche.

Execution model:

- default to direct Project Steward execution for bounded low/medium work;
- use a worker only when it has a concrete advantage under
  `docs/EFFICIENCY_SOP.md`;
- keep each tranche to one coherent outcome, proportionate validation, one
  commit/push, and a concise report.

## Supabase migration checkpoint

Supabase is now the accepted direction for durable operational data, but the
hosted app has not switched away from the file-backed source yet.

Current status is documented in `docs/SUPABASE_MIGRATION_STATUS.md`:

- initial schema migration exists;
- current seed snapshot has been loaded into Supabase;
- row counts have been verified;
- security advisor was clean after migration;
- the missing `entity_sources.source_id` performance index was fixed and added
  to the migration;
- representative raw-data and read-adapter parity are accepted at repair commit
  `813c0f2`; JSON remains the active app source pending a separate deliberate
  cutover gate.

The safe read-adapter seam now exists in `app.js` and is opt-in only via
`?data=supabase`; JSON remains the default app source. Initial validation at
`7e42202` found a status-vocabulary mismatch and dated-event duplication.
Repair commit `813c0f2` fixed both, and independent representative verification
accepted 97 semantic events with matching Today, Events, and Commander results
across JSON and Supabase. This acceptance is not a default-cutover decision.
Use 5.6 before changing auth/RLS/write policy, making Supabase the default, or
publishing a Supabase-backed release.

## Completed local UX revision scope

The accepted local UX revision was a focused usability pass, not a full
Supabase write/auth build and not a renewed research expansion. The scope was
pinned in `docs/UX_MEGA_REVISION_SCOPE.md` and is now complete enough to move
forward. In short, it covered:

- make Today a decision-quality surface rather than a flat event dump;
- improve event filtering and search, especially Commander, prerelease/sealed,
  draft, favorites, confidence, and distance;
- make the Events catalog easier to scan while preserving the full retained
  universe;
- keep Fresh Signals / For You available on narrower layouts through a
  collapsible rail or drawer;
- present venue fit grade, numeric score, confidence, and research status
  consistently, with clickable rationale where records have calibrated
  evaluations;
- polish Updates labeling, typography, linking, and filtering enough that it
  works as an activity surface;
- fix obvious clickability, responsive, and terminology issues before publish.

This same pass may also complete foundation-only continuity work when it is
needed to protect the product direction or unblock the next UI step,
specifically:

- documenting the accepted split between research data, personal data, and
  workflow/request data;
- preserving the current read-adapter seam and parity-check discipline;
- locking in the durable server-side target for favorites, thumbs-down,
  ratings, notes, update-read state, and in-app `Ask Codex` requests;
- preparing the cutover sequence so browser-local personal state can later be
  replaced cleanly without redesigning the interaction model.

Still deferred from this local UX tranche:

- authenticated Supabase writes for favorites, thumbs-down, notes, and Ask Codex
  requests;
- autonomous daily/weekly agents;
- deep community automation;
- broad store re-research;
- making Supabase the default data source;
- publishing until the Supabase/data-source and final acceptance gates are
  complete.

In short: this revision shaped the app around the durable hosted
personal/workflow model, but it does not ship the full signed-in write path.

## ChatGPT sideload handoff

When Codex quota is constrained, ordinary ChatGPT may assist only through the
guarded lane defined in `docs/chatgpt-sideload-sop.md`. Current cross-agent
messages live in `docs/agent-mailbox.md`; candidate discoveries, feature ideas,
and follow-ups enter through `docs/ASYNC_INTAKE.md`; ChatGPT-originated edits are
recorded in `docs/chatgpt-changelog.md` for later Codex audit.

New stores, venues, groups, events, and event series are candidate-only in this
lane. Ordinary ChatGPT must not create canonical entities.

## Research tranche (paused)

Top-venue tranche near Los Alamitos, focused on:

- Collectors Lounge - Cypress
- The Guild House
- Kingslayer Games - Fountain Valley
- Finch and Sparrow Games
- related regional/community context already captured through the Discord baseline

Broad research is intentionally paused while the Supabase operational-source
path is made safe. The research queue remains open and should resume from
`docs/WORK_BACKLOG.md` only after the Supabase continuity/readiness stage is
accepted.

## Research rule when research resumes

Do not move on to the next store simply because a bounded discovery pass exists.
The active requirement is now a stronger candidate-grade first pass:

- enough source coverage from the standard suite to trust the read;
- enough actionable upcoming MTG event detail to make the store practically useful;
- enough synthesis to answer whether the store is a real candidate worth trying.

Working interpretation change:

- `discovery` = still too thin to act on comfortably
- `partial` in the current schema should be treated as the nearest current
  equivalent to a fully **reviewed** first pass
- future model direction is to separate research status, fit grade, and
  confidence rather than overloading one label

Tweedy Cards and Gaming already served as a test case for this refined standard
and was raised out of the earlier conservative Wizards-only bucket. Do not treat
older notes saying "repair Tweedy first" as current next work.

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
  strong rules-level fit with Bracket 3/proxy-friendly signals. The absence of
  explicit staff-pairing or LFG language is neutral and does not block its
  promoted B+ / 4.1 judgment; medium confidence instead reflects that the lived
  size and social mix of Friday turnout have not yet been observed.
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
- Tweedy Cards and Gaming no longer belongs in the earlier conservative
  Wizards-only bucket. The repaired pass now clears the candidate-grade bar:
  Wizards plus Instagram corroborate real Friday Commander, Sunday Standard
  Showdown, and the July 17 God of Mischief Commander special, which is enough
  to treat Tweedy as a real reviewed candidate with modest rather than strong
  fit.
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

Run the next bounded Supabase continuity tranche. The goal is not deployment or
new research. The goal is to make the accepted Supabase path safe enough to
become the operational data source later, while retaining JSON as
recovery/export and avoiding the prior bad-JSON-writing failure mode.

## After that

- finish the Supabase operational-source cutover plan and acceptance checks
- then complete the bounded research universe using the safer data path
- then run final data-integrity and coverage assurance
- then make Supabase the default operational source while retaining JSON
  recovery/export
- then run final end-to-end acceptance
- then make the personal tool accessible through the existing deployment path
  after authorization
- later, continue turning promising nearby partials into sharper comparable records
- keep `docs/WORK_BACKLOG.md` current as the explicit repo-backed future-work log
- later, add an upstream-signal layer from official Wizards news for notable
  new-set, prerelease, Commander-product, and program-change awareness
- later, operationalize a daily light-signal sweep that can power a dashboard or
  alert rail without requiring a full deep research pass every day
- later, ensure favorites drive monitoring cadence and alert priority
- later, backfill MTG-focus / player-pool breadth / venue-scale carefully and
  treat the first results as a test of the framework, not final truth

## Temporary audit workflow

When helpful during methodology calibration, it is acceptable to publish a newly
committed store pass so the user can audit it in the live app immediately. This
is a temporary trust-building workflow, not yet a permanent requirement for
every ordinary store update.

## Caution flags

- Kingslayer social channels are multi-location and require branch-aware interpretation
- sparse Discord should not lower a store automatically; it is often a source-routing result
- recurring event listings are not guarantees; large same-day events may suppress
  a weekly Commander series without every source being updated in sync
