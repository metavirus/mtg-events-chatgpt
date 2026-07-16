# UX Mega-Revision Scope

Last updated: 2026-07-16

## Purpose

This is the working execution scope for the current app design/build pass.

It turns the accumulated design backlog into one coherent product tranche so we
do not burn time rediscovering priorities, polishing disconnected pieces, or
accidentally starting the deferred Supabase/auth work.

This pass should make the app feel like a practical Magic planning dashboard:
what is worth playing, why it is promising, what has changed, and where the
evidence is thin.

## Current boundary

Build now:

- user-facing decision surfaces;
- ranking, filtering, scanability, and drilldown improvements;
- local/browser-state prototypes for interactions that will later become
  server-backed;
- documentation and UI seams that preserve the accepted Supabase continuity
  model.

Do not build now:

- authenticated Supabase writes;
- final auth/session UX;
- row-level security expansion for personal or workflow writes;
- daily/weekly automation agents;
- broad research backfill;
- Supabase as the default research source;
- final public publish before a deliberate sanity pass.

## Build tranche A: Today as the decision surface

The Today page should answer "what should I consider playing next?" rather than
showing an undifferentiated feed.

Required improvements:

- rank events by practical fit, source confidence, distance, date, and user
  preferences rather than raw date order alone;
- visually distinguish strong fit, promising, discovery-level, caution, and
  competitive/cEDH-weighted items;
- keep Commander prominent without hiding prerelease, sealed, draft, and notable
  Magic specials;
- provide obvious filters for:
  - Commander / EDH;
  - prerelease and sealed;
  - draft;
  - all interesting;
  - best fits;
  - Friday-Sunday;
  - favorites;
  - hidden/deprioritized items when needed;
- make the search box match event title, venue/store, community, format, tags,
  status chips, and useful description text;
- keep Fresh Signals and For You reachable when the right rail collapses or the
  viewport is narrow.

Acceptance check:

- typing a venue name such as Finch should show matching events from that venue
  when they exist;
- a user should be able to narrow quickly to Commander, prerelease/sealed, or
  draft without reading the entire page;
- strong near-term leads should be visually easier to notice than lower-fit
  discovery records.

## Build tranche B: Events catalog

The Events page should preserve the full universe while still being usable.

Required improvements:

- support a recommended/default sort in addition to date;
- expose useful sort/filter controls rather than a single long wall of cards;
- include clear format filters for Commander, prerelease/sealed, draft, specials,
  and all events;
- retain week and month navigation or provide clear links back to those views
  if Today remains the primary calendar surface;
- use compact event cards that still show the decision-critical facts:
  time/date, venue, distance, format, fit, confidence/source state, fee, and
  recurrence/one-off status;
- avoid "Time TBD" when a confirmed time exists in the normalized record.

Acceptance check:

- the user can find "only prerelease/sealed" or "only Commander" without opening
  a drawer mystery box;
- a high-value dated event is not buried under dozens of weaker recurring items;
- event cards remain clickable for detail drilldown.

## Build tranche C: Places and communities

Places should support comparison and drilldown without trapping the important
content off to the side.

Required improvements:

- show research status, fit grade, numeric score, and confidence consistently
  for calibrated venues;
- make score/grade/confidence areas clickable or otherwise inspectable so the
  user can see the pluses, minuses, and evidence behind the judgment;
- add favorite and thumbs-down/deprioritize affordances with clear behavioral
  meaning;
- keep research truth separate from personal preference;
- make evidence/source counts clickable where possible;
- improve empty, discovery-level, and low-confidence states so sparse stores are
  not confused with broken data.

Communities should be treated separately from stores and should surface:

- promising LFG / meetup / announcement channels where known;
- hot community finds rather than only static group profiles;
- future hooks for a bounded Discord sweep of the most valuable channels;
- a clear "ask Codex to watch/research this" interaction path.

Acceptance check:

- a user can understand why a place is B+, C, or discovery-level without reading
  chat history;
- favorite and thumbs-down controls visibly affect filtering or ranking in the
  prototype layer;
- communities do not get collapsed into stores.

## Build tranche D: Updates and signals

The Updates page should become a useful activity surface, not a noisy log wall.

Required improvements:

- use the label `Updates` instead of `New & changed`;
- treat the sidebar number as an unread-style badge that can clear after
  visiting the page, at least in the local prototype layer;
- align dates, labels, and text cleanly;
- reduce excessive bold text;
- add or prepare filters for useful update types:
  - new event;
  - source change;
  - research deepening;
  - correction;
  - user/action request;
  - hot item;
- support rich links to the related venue, event, source, or research item.

Fresh Signals / For You should not simply dump users into the full Updates
page. They need their own focused drawer or filtered view for the hottest,
lowest-noise items.

Acceptance check:

- clicking "View all" from Fresh Signals should show a focused signal view, not
  an unfiltered activity archive;
- important new event discoveries can be flagged HOT sparingly;
- updates should be useful even when there are many routine research entries.

## Build tranche E: Durable-state interaction design

This pass should design for hosted continuity without shipping the full
authenticated write path.

Prototype or shape now:

- favorite a store, community, event series, or event occurrence;
- thumbs-down / deprioritize a store, event series, or event occurrence;
- add a note or research request from a store/event/community detail view;
- add a global `Ask Codex` request;
- mark updates as read;
- record quiet local activity for prototype behavior.

Do not claim these are fully cross-device durable until Supabase writes are
implemented. The correct current framing is:

- the UI behavior is being finalized;
- browser-local storage is temporary scaffolding;
- Supabase is the accepted future durable home.

Acceptance check:

- the UI shape will survive the later move from browser-local state to Supabase;
- personal controls influence ranking/display without overwriting research
  evidence;
- in-app requests have a clear future destination in the workflow/request data
  plane.

## Global polish and safety gates

Before this tranche is considered ready for publish:

- app name should be `MTG Events`;
- primary nav should use `Updates`, not `New & changed`;
- main click targets must work after a fresh reload;
- no modal/drawer overlay should block unrelated clicks;
- responsive layouts should keep Fresh Signals / For You accessible;
- text should be readable at normal browser zoom;
- known date/time values should not display as TBD;
- JSON remains the default source unless a deliberate Supabase-default gate is
  passed;
- the text-integrity validator passes.

## Model and process guidance

Use 5.4 for scoped mechanical UI implementation once this scope is accepted.

Use 5.5 for:

- choosing between competing UX patterns;
- debugging non-obvious UI behavior;
- deciding what belongs in the current tranche versus later.

Use 5.6 for:

- Supabase auth/RLS/write-policy decisions;
- final publish sanity;
- major architecture changes;
- unresolved trust/rollback/encoding issues.

Do not run local previews or publish cycles just to check this document. Preview
only when a specific UI implementation needs verification.
