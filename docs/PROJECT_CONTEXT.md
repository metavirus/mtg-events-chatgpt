# Southern California Magic Intelligence — Project Context

This file is the durable working summary of the product direction now
synthesized inside this repository. Earlier imported artifacts are affirmatively
deprecated as active project inputs under `docs/LEGACY_MATERIALS.md`. They are
historical archive, not ordinary reference material for current work.


## Product outcome

Build a durable intelligence system for discovering, verifying, comparing, and
revisiting Magic: The Gathering opportunities near Los Alamitos, California.
Commander is the user's primary format, not the boundary of the product. The primary
goal is not maximum event volume. It is helping the user become a repeat
participant in a compatible local community and eventually form a stable
four-person home pod.

The system therefore optimizes for social integration, continuity, evidence
quality, schedule reliability, and practical solo-arrival guidance.

## Personal project brief

The user recently moved from the Bay Area to Los Alamitos. Their previous local
store had an active Discord where games could be arranged before arrival. That
advance coordination mattered because arriving alone and asking established
groups for a game is uncomfortable and unreliable.

The local landscape includes many stores using fragmented channels such as
Instagram, store websites, Wizards/EventLink, registration platforms, and
occasionally Discord. Finch and Sparrow Games and Collector Legion were two
early prominent leads, but the project must research the full local field.

The immediate job is to maintain an easy master list of stores and Commander
events. The deeper measure of success is finding compatible repeat players and
eventually forming a regular four-person group that can play at a member's home.
Store quality should therefore be assessed partly by how well its community and
operating practices help a solo player meet and reconnect with compatible
people—not just by event volume, size, inventory, or prizes.

The app should keep interface code separate from updatable research data so the
experience can be built once while store, event, source, and assessment records
continue to evolve.

## Core information problem

Local store and event information is fragmented across many independently
maintained systems. Stores are often small, low-margin, lightly staffed
businesses without the time or personnel to keep every website, calendar,
registration platform, social profile, and community channel synchronized.
Missing, stale, or contradictory information is therefore an expected property
of the source landscape—not evidence that a store or community is inactive.

The system must perform a wide trawl across the resources each store actually
uses, including:

- Wizards/EventLink and the Wizards Store & Event Locator;
- official websites and embedded calendars;
- registration and commerce platforms;
- Facebook pages, groups, and event listings;
- Instagram profiles, posts, stories, and schedule graphics where accessible;
- Discord servers and invitation links where publicly available or supplied;
- other social platforms and community calendars;
- Google business information and maps/directory leads;
- Reddit and other community discussions;
- phone, email, or in-person confirmations when recorded by the user;
- historical snapshots that help identify recurrence or change.

Source discovery is itself a key research task. For each store, the system
should find and maintain a source map showing every relevant channel, which
channel appears operationally primary, how recently it was updated, what claims
it can support, and which links are stale, inaccessible, or contradictory.

Venues are not limited to game stores. Include relevant cafés, breweries,
libraries, clubs, convention spaces, and other public/community locations when
they host useful Magic events. Requiem Coffee, Tea, and Fantasy and And Destroy
are examples of nontraditional venue leads. Venue type should be explicit so
retail-store assumptions are not applied to every location.

A broken or abandoned website is a meaningful research result. Record its URL,
last check, failure state, and any historical value, but do not present the
broken URL as the venue's current clickable primary link. Show a plain-language
source-health note such as `Official website currently unavailable` and route
users to the best functioning operational channel instead.

## Research-assistant and analyst roles

The project combines two responsibilities:

1. **Research assistant.** Discover, collect, preserve, and revisit the broadest
   practical set of public store, event, social, registration, and community
   resources. Preserve rich source text, descriptions, links, dates, images or
   transcriptions, and retrieval context rather than reducing evidence to a few
   fields too early.
2. **Research analyst.** Reconcile overlapping and conflicting observations,
   translate source-specific language into a common model, assess freshness and
   confidence, identify likely recurrence, surface meaningful changes, and
   synthesize practical conclusions about store promise, event relevance,
   communication reliability, solo-arrival accessibility, and community fit.

Analysis must add value without erasing evidence. Raw wording, normalized facts,
and analytical interpretation remain separately inspectable.

The system should not merely repeat store jargon. When stores invent local
labels for event programs, admission packages, or play styles, the app should
explain those labels in plain player language whenever the evidence supports
that translation.

## Common-calendar and interface mandate

The application is the unified working surface for this research. It should let
the user see at a glance:

- which stores and plausible play venues are around;
- which stores currently seem most promising and why;
- upcoming Commander opportunities in a common calendar framework;
- newly discovered or materially changed events;
- recurring availability versus confirmed dated occurrences;
- source freshness, confidence, conflicts, and important unknowns;
- each store's active communication and registration channels;
- the original rich descriptions, rules, fees, prizes, formats, and social notes;
- what should be checked before traveling or arriving alone.

The common model should normalize dates, time zones, recurrence, fees, format,
event structure, confidence, and status across sources while retaining all
useful source richness. Most research should be explorable directly inside the
app. Every source-backed item should also provide clear links that open the
original website, social post, registration page, locator record, or community
resource in a new browser tab when the user wants to investigate further.

The interface should favor synthesis over duplication: one coherent store or
event view may combine evidence from several sources, clearly showing where
facts agree, conflict, remain stale, or require verification.

Venue research should not collapse completion state, practical fit, and
confidence into one vague label. The working product model should distinguish:

- **Research status:** whether the entity is still a discovery lead, has
  received a reviewed first pass, or has been deepened further.
- **Fit grade:** how promising the venue or community appears for the user's
  stated goals after weighing distance, friendliness, MTG focus, solo-arrival
  access, and schedule usefulness.
- **Confidence:** how well supported that judgment is by the currently visible
  evidence.

A sparse store can still be marked reviewed if the standard first-pass source
suite was checked and the remaining uncertainty is bounded. Missing Discord,
missing e-commerce, or a thin website should not by themselves trap an entity
in endless research purgatory.

Recurring event reliability should include an `at risk` concept for dates where
a same-day large special event likely threatens the routine series even if the
store never explicitly posts a formal cancellation notice.

A meaningful user-facing distinction exists between structured paid Commander
events with staff-managed pod filling and loose open-play Commander nights.
That difference should be visible in event descriptions, ranking logic, and
later filtering.

Commander open play is itself a meaningful event type. Even when listings are
light on detail, an explicit `open play` label should be preserved and modeled
rather than collapsed into generic Commander.

## Catalog-first prioritization

The system should preserve relevant findings before deciding how prominently to
show them. Classification, ranking, filtering, and personal fit are presentation
and analysis layers—not reasons to delete evidence.

The default workflow is:

1. **Catalog:** retain the event, store, source text, links, dates, and available
   details.
2. **Classify:** identify format, event type, power/bracket signals, status,
   recurrence, confidence, and ambiguity.
3. **Prioritize:** rank according to personal interest, evidence quality,
   freshness, travel practicality, and community potential.
4. **Present:** place records in the most useful default view while keeping them
   accessible through broader views and filters.

The evidence threshold is planning-grade rather than court-grade. A current
Wizards/EventLink listing with a close venue-name and address match is normally
enough to catalog an event. Weak store-controlled source continuity should
lower confidence or add a `verify` / `check first` caveat, not silently suppress
the event. Venue recommendation remains a separate judgment: a store may be
low-confidence, deprioritized, or poor fit while its attributable current events
remain visible in the recoverable catalog.

Commander, draft, sealed, prerelease, Commander Party, and other distinctive
Magic events are useful findings and should be retained. Casual Bracket 2/3
Commander and appealing prerelease/special events belong in high-visibility
personal views. Explicit cEDH, Bracket 4/Optimized, RCQ, championship, and other
competitive events should be accurately categorized and normally deprioritized,
not discarded.

The interface should support at least these conceptual views:

- **Best fits:** events most aligned with the user's interests and practical needs;
- **Interesting events:** Commander, draft, sealed, prerelease, and notable specials;
- **Needs interpretation:** relevant but ambiguous listings requiring research or confirmation;
- **Competitive/high power:** cEDH, Optimized/Bracket 4, RCQ, championship, and similar records;
- **All events:** the complete retained catalog with flexible filters.

A record may appear in more than one view. Ambiguous listings remain visible
with explicit unknowns and research prompts. Filters must hide records only for
the current view; they must never remove them from the evidence base.

## Personal schedule and distance behavior

- Saturday and Sunday are the user's preferred attendance days.
- Friday night is also a high-value discovery and planning window because many
  stores schedule their largest events on Friday evening or Saturday.
- Weeknight events remain important because attending more of them is a personal
  goal when an opportunity is sufficiently interesting.
- Calendar design should retain a conventional week while adding a prominent
  Friday–Sunday focus panel. This highlights the most promising attendance days
  without hiding Monday–Thursday opportunities.
- Distance matters because the long-term objective is finding people who live
  close enough for recurring home games. Meeting players far beyond Los Alamitos
  may compound travel distance in opposite directions.
- Closer stores therefore receive a meaningful ranking advantage, but distance
  is not a cutoff. The user is currently willing to travel farther for a strong
  opportunity while building a local network.

## Event-interest order

1. Casual Commander, especially Bracket 3 and compatible Bracket 2 play.
2. Sealed and prerelease events, which occur infrequently and should be strongly
   highlighted in the New Events area when discovered.
3. Draft, which is occasionally appealing and something the user would like to
   try more often.

Other Magic events remain cataloged under the catalog-first rule.

## First-pass completion and practical usefulness

The ordinary store pass is not just a taxonomy step. It is also part of the
user's live planning surface.

The default target is a **candidate-grade first pass**:

- enough source coverage from the standard suite to trust the read;
- enough actionable upcoming MTG detail that the user could plausibly add
  something to their calendar now;
- enough synthesis to say whether the venue is worth trying, weak, or still too
  unresolved to recommend.

That means a normal first pass should usually end in one of these practical
states:

- **Discovery:** real lead, but still too thin to compare or act on confidently.
- **Reviewed:** standard first-pass source suite checked; enough concrete
  evidence to judge whether this is a real candidate even if the source stack is
  modest.
- **Deepened:** additional operational or community work done because the venue
  was strong enough, ambiguous enough, or risky enough to justify extra effort.

For a venue to count as reviewed, it should normally surface the strongest
near-term MTG opportunities visible right now, especially when they match the
user's priorities such as casual Commander, prerelease/sealed, or draft. If a
pass would still make the user ask obvious questions like "what could I actually
go play there soon?" then the pass is usually still discovery rather than
reviewed.

## Fees, proxies, and deck readiness

- Cost is informational rather than a meaningful attendance deterrent.
- Higher Commander entry fees can be a tertiary competitiveness signal because
  larger stakes may attract more competitive players. Fee alone never determines
  power level or fit.
- The user relies on proxies in many decks. Ordinary Commander proxy acceptance
  is expected unless a source says otherwise.
- An explicit `no proxies` rule for Commander is a strong negative fit signal and
  should materially lower event/store priority. Preserve the exact policy and
  source.
- Unknown proxy policy remains unknown; do not assume a prohibition.
- The user normally brings six to eight decks, mostly mid- to high-power within
  Bracket 3, plus a Bracket 2 deck for lower-power tables.

## Social-accessibility model

The largest practical barrier is entering a room alone and finding a compatible
pod. Research and ranking should look specifically for mechanisms that reduce
that friction:

- advance coordination through Discord or another active channel;
- visible looking-for-game systems such as table placards;
- staff introductions or staff-created pods;
- event registration followed by random pairings;
- clear open-play procedures welcoming unaffiliated players;
- recurring attendance that makes repeat relationships possible;
- store size and capacity sufficient to support multiple compatible pods.

Random pairings are acceptable and may improve solo-arrival accessibility.
Timed rounds can inhibit the desired social experience and should be recorded as
a possible negative depending on their strictness and purpose. Unstructured open
play can be excellent when the store provides a discoverable way for solo
players to signal availability; it can be difficult when established cliques
must be approached cold.

The analyst should distinguish store size from social quality. A large store may
support more structured pairings and a wider range of players, but neither size
nor attendance proves that the environment is welcoming or noncompetitive.

## Ranking priorities

Interpret the user's ranking numbers as priority tiers, with 1 highest:

1. Community compatibility; Bracket 2/3 fit.
2. Solo-arrival accessibility; physical space.
3. Event reliability; number of Commander opportunities.
4. Distance and drive time.

Ease of arranging games beforehand is highly desirable and should be surfaced,
although it may be difficult to verify or achieve. Cost has negligible ranking
weight. Rankings must remain explainable and show both the contributing evidence
and confidence.

## Alerts and freshness

The New Events area should include newly discovered events, schedule changes,
new stores, new registration pages, prereleases, and other notable special
events. A finding remains marked `new` for two weeks after first detection.

Newness is distinct from event date and source publication date. Store at least:
first detected, source published/observed when available, last checked, event
start, and last materially changed.

## Personal data and actions

- Store details should allow a private overall personal-fit rating from one to
  five stars.
- Ratings and notes should be timestamped as a history rather than overwritten.
  Clicking the current rating or notes summary should open a popover or drilldown
  showing how the user's assessment changed across visits.
- Store details should allow private notes and structured visit notes.
- Personal observations may inform future analysis but must remain visibly
  separate from official facts and public community evidence.
- User-supplied field notes that the user wants retained should be storable as
  clearly attributed research evidence in GitHub rather than only in hosted
  private storage, so important visit knowledge is not lost.
- Event details should provide an Add to Google Calendar action. Prefer a simple
  prefilled calendar link or standards-based calendar export that does not
  require broad account access.
- When research is ambiguous, show the user the ambiguity and recommended
  verification question. Do not contact stores automatically.
- Signed-in Instagram, Facebook, Discord, or other sources may be inspected with
  the user's permission when needed. Never post, react, join, message, or change
  account state without separate explicit authorization.
- Discord is useful supplementary evidence for coordination and community
  activity, but it is not mandatory for a successful research run. Missing or
  inaccessible Discord coverage should be logged and reflected in freshness or
  confidence without blocking publication of other current findings.

When accessible, Discord can be a high-value deep-research source. Selected store
servers and regional Magic communities may expose scheduled events, announcements,
looking-for-game coordination, meetup patterns, cancellations, power expectations,
and operational details absent from public websites. Research should include
targeted server/channel inventories and searches while following the privacy and
non-interaction rules in `research/METHODOLOGY.md`.

Regional player groups should be surfaced as first-class communities with their
own geographic coverage, activity, events, venue relationships, and coordination
channels. Known leads include Legendary Creature Club (South Bay/Long Beach) and
infiniteloopmtg (Los Angeles/northern focus). MTG OC is an additional Orange
County community lead. Discord servers remain source records: a server can represent
a venue, a community, both, or an unresolved operator and must not be presumed to
be a physical place.

Events distinguish their organizer from their venue. For example, a community may
organize a meetup at a store and announce it through Discord and Meetup; the
community, store, sources, and event remain linked but independently assessable.

The app and research system must keep three score layers separate: source/channel
usefulness, venue/community fit, and individual event fit. This allows a strong
venue with a sparse Discord, or a small but socially effective regional group, to
be represented accurately.

## Hosting and responsive direction

The application is a private personal tool hosted for web access on both desktop
and mobile. Favor robustness, richness, and research depth over designing around
the smallest possible screen. Mobile must remain usable for lookup and planning,
but desktop may expose denser evidence, comparisons, and analytical controls.
An unlisted/private URL is sufficient initially; account authentication is not a
current requirement.

Private ratings, favorites, planning state, and optional private-only notes must
persist in the hosted web application and be available across the user's devices.
They are not device-local browser data. Separately, user field notes intended as
durable research evidence may be committed to the research dataset if they are
clearly attributed and kept distinct from official/public claims. This still
requires a small private writable data service for the truly private workflow
layer before personal-data features are deployed.

## Interaction and drilldown mandate

Most meaningful interface elements should be clickable when a useful deeper
view exists. Evocative summaries, badges, rankings, scores, source counts,
freshness labels, event types, uncertainty indicators, communication channels,
personal ratings, and change notices should not appear interactive without
providing an action.

Clicking should commonly reveal one of:

- an event or store detail page/drawer;
- the evidence and explanation behind a classification or score;
- a filtered list of the records represented by a count or badge;
- source history and original links;
- a personal rating/visit-note timeline;
- conflict, confidence, or ambiguity details;
- a map/address preview or an external destination.

Use clear hover, focus, and touch affordances so users can distinguish clickable
elements. Drilldowns should be deep-linkable where practical, preserve browser
back behavior, and remain keyboard accessible. External sources and directions
open in a new tab; internal investigation should normally remain inside the app.

## Distance and map behavior

Use miles as the primary distance measure. Do not add routine drive-time
collection or traffic estimation because the user can interpret mileage and it
would add unnecessary operational complexity.

Capture each store's complete public address. When easy to implement, clicking
the address or map affordance should show a quick map popover or preview. Always
provide a simple action that opens Google Maps directions to the store in a new
tab. This can be generated from the public address and does not require storing
the user's home address or integrating a routing service.

## Event preferences and analytical fit

The user's primary format preference is casual Commander, especially Bracket 3
(Upgraded). Bracket 2 (Core) is also acceptable. Events oriented toward
approachable, social four-player games in that range should receive the
strongest fit signal, especially when they provide useful guidance about
brackets, deck expectations, pod formation, rules, proxies, prizes, or how solo
players join.

Competitive qualifiers, championships, RCQs, and similar tournament pathways
are generally low-interest. cEDH and strongly optimized Commander are also
usually poor personal fits because they commonly indicate highly competitive,
cutthroat play. These events should still be collected and displayed—the system
is an intelligence record, not a filter bubble—but they should not crowd out or
be recommended above relevant casual opportunities.

Store terminology varies and must be translated cautiously. Preserve the exact
source label and description, then separately normalize and analyze likely play
expectations. Terms such as `casual`, `social`, `open play`, `optimized`,
`high-power`, `bracket 3`, `bracket 4`, and `cEDH` can be useful signals, but
must not be treated as perfectly interchangeable without supporting detail.
When the source is unclear, show the likely interpretation with its confidence
and the specific question that remains unresolved.

For example, Collectors Lounge - Cypress currently advertises distinct casual
and optimized Commander offerings. The casual event appears more aligned with
the user's preferred bracket-3-style experience. Under Wizards' current
terminology, `Optimized` is the exact name of Bracket 4; cEDH is the distinct
Bracket 5. The source wording and rules must still be preserved because a store
may use these terms informally or apply additional house expectations.

## Commander bracket normalization

Use Wizards' current Commander Brackets framework as the canonical vocabulary:

- **Bracket 1 — Exhibition:** theme or idea over power, flexible legality by pod
  agreement, and games expected to allow roughly nine turns.
- **Bracket 2 — Core:** unoptimized, straightforward, low-pressure, social play
  with incremental and disruptable wins; roughly eight turns expected.
- **Bracket 3 — Upgraded:** strong synergy and card quality with meaningful
  interaction and powerful plays; roughly six turns expected.
- **Bracket 4 — Optimized:** lethal, consistent, fast decks with efficient wins,
  fast mana, tutors, and strong disruption, but not built for the cEDH metagame;
  roughly four turns expected.
- **Bracket 5 — cEDH:** decks built for the competitive Commander metagame,
  prioritizing efficient, consistent wins and advanced play; games may end on
  any turn.

The framework is a pregame-conversation aid, not an absolute rule for who may
play together. Store labels, event descriptions, pod practice, and actual deck
expectations may not align perfectly with the canonical names.

Each event should therefore support separate fields for:

- exact source power/bracket wording;
- explicitly stated bracket, when present;
- analytically inferred bracket or bracket range;
- inference confidence;
- evidence signals used for the inference;
- unresolved power-level questions;
- personal-fit assessment distinct from the bracket itself.

An event titled only `Commander` or `EDH` has an unknown bracket by default. It
must not silently become casual, Bracket 3, or any other level. Descriptions may
support a cautious bracket range—for example, language about precons, social
play, prizes, elimination, fast combos, proxies, or cEDH—but the app must label
that range as inferred and explain why.

For personal-fit purposes, a sparse unqualified Commander/EDH store event may be
treated as *likely accommodating of Bracket 2/3 decks* unless the listing or
other current evidence signals Optimized, Bracket 4, cEDH, tournament-style
competition, fast-combo expectations, or similarly high-powered play. This is a
practical attendance hypothesis, not a factual bracket assignment. The app
should show the distinction clearly:

- `Bracket: Unknown`
- `Likely fit: Bracket 2/3 decks probably accommodated`
- `Fit confidence: Low` (or higher only with supporting evidence)
- `Verify: Ask the store or players about the expected bracket/power range`

## Routine schedules and special-event signals

An old or infrequently updated store event page remains useful evidence. It may
describe the store's durable weekly rhythm even when current special events are
announced somewhere else. The system must not assume that the newest channel
replaces older sources; different channels may serve different purposes:

- a website may document regular weekly nights;
- Instagram may announce a prerelease, launch celebration, Commander Party, or
  another special event for a newly released set;
- Wizards/EventLink may provide dated occurrences and formal registration data;
- Discord or Facebook may carry operational changes and meetup coordination;
- a registration platform may contain the most precise fee, capacity, rules,
  prize, and cancellation details.

The analyst should combine these complementary signals while retaining their
individual dates and freshness. A stale page is not presented as current fact,
but it can support a historical schedule, recurrence hypothesis, or targeted
verification question.

New-set prereleases and other distinctive special events are a particular user
interest and should be highlighted prominently when discovered. Special-event
alerts should include the set/product, format, date and time, registration link,
fee, capacity, participation or prize details, source freshness, and whether the
event appears suitable for the user's casual Commander preferences. A special
event may be interesting even when it is not Commander, but its format and fit
must be immediately clear.

## Canonical source priority

1. The user's clarified goals, preferences, and decisions made during this
   project.
2. Repo-backed research, run notes, normalized data, and current design/docs
   produced through this project.
3. Raw collector snapshots and source-backed evidence gathered here.
4. Deprecated legacy materials from earlier AI attempts, excluded from ordinary
   project work and inspected only when historical comparison is explicitly needed.

Legacy materials do not govern or corroborate current product, UX, ranking,
research methodology, or architecture. A potentially useful historical idea must
first be independently evaluated and adopted into a current repo-native document.

## Locked principles

- Never commit or display the user's exact home address or private coordinates.
- Use Los Alamitos, California as the public origin label.
- Collect broadly and retain weak, stale, conflicting, and negative evidence.
- Publish and recommend cautiously; expose uncertainty rather than hiding it.
- Keep raw source wording, normalized facts, and analytical synthesis separate.
- Keep event status separate from confidence.
- Treat unknown as unknown; silence is not evidence.
- Preserve source history instead of overwriting prior observations.
- Preserve research methodology, source-trawl coverage, reasoning, findings, and
  unresolved questions in the repository; chat history is not a durable research record.
- Distinguish recurring availability, event series, and confirmed occurrences.
- Build structural v1 interface capabilities on an explicit, validated data
  contract; deeper evidence automation can continue after the usable v1 exists.

## Geographic rule

The original prompt proposed 30 miles. The user subsequently selected 25 miles
as the routine Wizards/EventLink search parameter because the tool natively
supports 10-, 25-, and 50-mile searches and 25 miles keeps recurring collection
efficient. This is not an inclusion or display cutoff. Credible stores and
events discovered at 26, 28, 30, or more miles may still be retained and shown
when useful; the system simply does not need to search those outer areas
regularly. Displayed distance must remain an approximation from the public Los
Alamitos centroid, and farther results should be easy to recognize and filter.

## Historical repository checkpoint

This section records the 2026-07-17 cutover checkpoint. It explains provenance;
it is not the current operating checklist. Use `docs/SESSION_BOOTSTRAP.md`,
`docs/EFFICIENCY_SOP.md`, and `CURRENT_FRONTIER.md` for the live posture.

Completed:

- A working static calendar/store/change interface deployed for personal use on
  GitHub Pages at checkpoint commit `dd44e20`, tagged
  `checkpoint/personal-use-deployed-supabase-default-2026-07-17`.
- Supabase as the default application read source, with `?data=json` retained as
  the explicit file-backed fallback.
- Controlled Supabase research-write and deterministic JSON export/recovery
  workflows for future research updates.
- An accepted local UX pass that makes Today, Events, Places, Updates, and
  Communities usable enough to move out of polish mode.
- A repeatable Wizards GraphQL collector using a public Los Alamitos centroid.
- A successful 26-mile buffered snapshot containing 1,231 Magic events, 669
  Commander candidates, and 77 organizations.
- A Monday GitHub Actions raw snapshot refresh.
- First-pass reconciliation of repeated explicit nearby Commander listings.
- Second-pass reconciliation of repeated explicit listings in the available
  26-mile snapshot; distance is descriptive rather than an exclusion rule.

The current normalized data is useful but intentionally provisional. It does not
yet satisfy the target evidence model, and its event coverage is heavily shaped
by the already-collected Commander-first research. The app must disclose that
coverage limitation rather than imply that other Magic formats were
comprehensively searched and found absent.

As of the 2026-07-17 personal-use deployment checkpoint, future research should
resume only through the controlled Supabase research-write workflow. Generated
JSON is recovery/export output, not the manual canonical editing surface. This
order protects against repeating the earlier failure mode of unsafe or
low-quality canonical JSON writing.

## Deprecated historical inventory

The v0.4 workbook contains 15 qualitative store audits, six event/recurring-play
records, and 33 sources. Its fields include priority tier, evidence confidence,
research status, ranking reason, assessment notes, primary communication
channel, communication notes, current Commander evidence, open questions,
radius status, and last-verified date.

This inventory is recorded only to explain project history. It is not a research
source for ordinary work. See `docs/LEGACY_MATERIALS.md` for the narrow historical-
comparison exception and the rule for independently adopting any old idea.

## Historical pre-Supabase model gaps

At the pre-Supabase checkpoint, the generated JSON model lacked several layers:

- immutable observations with timestamps, hashes, raw payload paths, and parser versions;
- claim-level provenance and conflicts;
- field-level confidence;
- event series versus dated occurrence separation;
- store aliases and historical identity/location data;
- communication profiles and channel maintenance patterns;
- radius status and explicit edge review;
- ranking reasons tied to evidence;
- research backlog and open questions;
- before/after change values and supporting observation IDs.

## Legacy-material status

The imported early materials are now fully deprecated as active inputs. Current
work must use repo-native sources of truth. Historical files may remain preserved
outside the active workspace, but they must not shape the product by inertia.

## Durable research-journal requirement

Every substantive research pass must leave a compact durable handoff record.
Another human or AI should be able to determine what was searched, what was
accessible, what evidence was found, how it was interpreted, what changed, and
what remains unresolved without relying on the originating chat window.

For a routine refresh, the proposal plus updated ledger/status is usually
enough; do not create a long bespoke run note merely for ceremony.

Use the conventions in `research/README.md` and `research/METHODOLOGY.md`.
Research notes supplement structured observations and raw snapshots; they do not
replace them. Avoid pasting secrets, login state, private coordinates, private
messages, or unnecessary copyrighted content into the repository.

The project should also use explicit persistence checkpoints during long-running
work. After each meaningful source pass or before moving to a new tranche of
stores/groups, pause and reduce the latest findings, source lessons, and unresolved
questions into repository files before continuing. This rule exists to protect the
research record from chat-context loss and to make later tranches faster and more
consistent.

## Research completeness gate

This is a dataset-level completeness test, not a store-pass closure rule. Do not
describe the whole dataset as comprehensive until:

- every Wizards organization is reconciled or explicitly excluded;
- independent regional discovery is complete;
- priority stores have current primary-channel checks;
- recurring events have current authoritative or recent corroborating evidence;
- edge-of-radius candidates are resolved or visibly labeled unresolved;
- normalized facts link back to source observations.
