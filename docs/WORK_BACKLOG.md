# Work Backlog

Last updated: 2026-07-15

This is the explicit repo-backed log of work we still need to do.

Use it for:

- unfinished research work;
- deferred deep dives;
- app/product tasks not yet built;
- data-quality gaps and ambiguity we want to revisit;
- process improvements that protect continuity.

## Active next-up

- Pause broad research expansion while building the first complete private app.
- Use `docs/IMPLEMENTATION_PLAN.md` as the active build sequence.
- Preserve the remaining research queue for later resumption; do not mistake a
  paused queue for a completed regional census.
- Tweedy Cards and Gaming now has a bounded identity-first pass on file and
  remains `wizards-discovery`; do not overpromote it without new corroboration.
- Use the next discovery pass on Shadow Realm Collectibles or Buddies
  Collectibles as the next efficiency test, since both remain in the backlog
  and were part of the recent conservative repair set.

## Research backlog

### High priority

- Follow-up social refinement for Collector Legion:
  - determine whether Saturday routine Commander is ever explicitly promoted;
  - keep watching for evidence that large Saturday events crowd out routine Commander;
  - optionally look for an even cleaner Instagram extraction path if future passes need it.

- Finch and Sparrow follow-up:
  - look for clearer signals about the average Thursday table experience;
  - determine the strongest current source path for Finch Sunday open-play
    Commander so it can be modeled as its own recurring series;
  - keep watching for current specials so Birdcage / Fish Bowl / cEDH content
    remains cleanly separated from routine casual Commander.

- Collectors Lounge Cypress:
  - confirm whether Friday casual Commander has any explicit staff help for
    seating solos into pods or whether players self-organize informally;
  - keep Friday and Saturday clearly separated as casual versus optimized lanes;
  - watch for any special events that could suppress the routine Friday/Saturday
    Commander lanes without every source updating in sync.

- Newly promoted WPN-led stores:
  - Honey Pot Meadery: continue refining the newly normalized richer event stream
    (Wednesday Magic Night, league, specials, prerelease-like items) and later
    assess actual turnout/community feel
  - Requiem: Coffee, Tea, and Fantasy: determine practical turnout, pod
    formation, and whether future social/current-calendar checks regularly
    surface Commander-specific posts or mostly broader venue programming
  - Hobby Overflow: inspect Discord/community behavior now that official routing
    is clear, and determine whether casual Commander is a real social lane or
    just a listed event slot
  - Joyful Toad TCG: find Commander-specific corroboration beyond the Wizards
    listing, because current socials skew broader-TCG rather than clearly EDH
  - SoCalMagic: verify whether the explicit `No proxy` language is stable and
    whether any mitigating context exists

### Discovery queue: not-yet-full-pass stores

These stores are still in `wizards-discovery` status and should remain visible
in the backlog so the field does not look artificially complete. Priority within
this queue should be driven by distance, Magic signal quality, community-fit
potential, and whether a store appears likely to surface useful public or
Discord/social evidence.

#### Higher-priority discovery candidates

- Shadow Realm Collectibles
- Buddies Collectibles

#### Broader discovery bench

- Tweedy Cards and Gaming
- Grails Gone Wild
- TK Collectibles
- The Game Chest - Promenade on the Peninsula
- B.Y.O.GAMES LLC
- LVLUP GAMING TCG
- The Crimson Guild - South El Monte
- Games For Meeple
- The Comic Bug
- Aki Collectibles
- The Game Chest - Irvine
- Otaku Vault
- Alamo Drafthouse Cinema Downtown Los Angeles
- The Game Cellar
- GXGAMERS
- The Bullpen 2.0
- Turn Zero Games
- CoreTCG
- DXN Provisions
- Revenge Of
- Next-Gen Games
- Odyssey Games - Pasadena
- Crown City Games
- Comic Quest
- It's GameTime!
- A & N Collectibles

Keep this queue pruned and re-prioritized as stores are promoted into `partial`
status or deprioritized by early signals.

### Medium priority

- Backfill already-covered priority stores after the initial research set is
  broader:
  - apply MTG-focus consistently
  - apply player-pool breadth / venue-scale consistently
  - capture representative play-space image evidence when clearly available
  - sanity-check whether the new dimensions improve the analysis or create weird
    distortions

- The Guild House:
  - real solo-arrival behavior
  - whether Tuesday Commander has any power-level norms in practice

- Kingslayer Games - Fountain Valley:
  - how Slay Pass structure feels in practice
  - whether Wednesday and Friday differ meaningfully in competitiveness
  - whether Kingslayer's booster-pack / prize-support wording can be tied
    cleanly to Fountain Valley-specific Commander listings rather than only
    broader Kingslayer-branded evidence

- Spellhold Games:
  - pod formation behavior
  - whether the long Saturday open-play window is actually easy for solo arrival

## Group/community backlog

- Keep groups modeled separately from stores/venues.
- Deepen the regional-group pass for:
  - Legendary Creature Club
  - Infinite Loop MTG
  - ProjectCCG community surfaces
- Look for other relevant Southern California Magic groups with geographic value,
  especially groups likely to help with meetups rather than only store events.

## Upstream signal backlog

- Research official Wizards news as an upstream signal source:
  - `https://magic.wizards.com/en/news`
  - `https://wpn.wizards.com/en/news`
  - identify which categories are most likely to create local store-visible
    events, such as new sets, prereleases, Commander products, Commander Party
    style promotions, format/rules changes, or unusual play-program announcements
  - maintain a normalized glossary for temporary or branded event types that may
    later appear in local listings, such as `Commander Party` or `Magic
    Presents: God of Mischief`
  - decide whether those items should feed a notable news ticker or alert rail in
    the app
  - keep this layer separate from store-specific facts until a local event signal
    is actually observed

- Add a daily light-signal monitoring loop:
  - all user-favorited stores, venues, groups, and event series should be
    automatically included
  - official Wizards/WPN news feeds
  - favorite/high-value store socials
  - key community/group announcement surfaces
  - emergency/cancellation/displacement keywords such as closed, postponed,
    canceled, sold out, special hours, RCQ takeover, or event moved
  - use the daily sweep to drive alerts and triage, not full re-research
  - include Honey Pot Meadery's official events calendar as a daily-refresh
    source because it is actively posting new formats/variants and appears to be
    a serious event-curation surface

## App/product backlog

### Data and ranking

- Implement explicit displacement-risk / at-risk flags for recurring events.
- Preserve ambiguous events instead of discarding them, but rank/filter them
  appropriately.
- Support recurring-versus-one-off distinction clearly in the UI.
- Support freshness/staleness indicators for sources and event evidence.
- Add an MTG-focus dimension so stores/venues can be distinguished from mixed-use
  fandom or event spaces where Magic is only one slice of the programming.
- Keep MTG-focus distinct from Commander fit so we do not accidentally treat
  "not Commander-led" as "not Magic-focused."
- Add a player-pool breadth / venue-scale dimension, but treat the first
  backfill pass as calibration; if results feel distorted or unhelpful, revisit
  the model rather than hardening it prematurely.
- Capture one representative play-space image reference when clearly available
  and relevant, using it as supporting evidence rather than hard proof.

### User-facing features

- Calendar-first default view with scrolling upcoming events.
- Weekly and monthly calendar modes.
- Daily dashboard / landscape view for what is newly relevant right now.
- Store detail pane with source links, address, and event history.
- Group detail pane separate from store detail pane.
- Favorites for stores and event series.
- Favorites should change monitoring behavior, not just visual display.
- Personal notes and ratings in hosted app state.
- Click-through behavior for most surfaced content.
- Optional Google Maps / directions links from store detail views.
- "New events" area that highlights newly discovered events for about two weeks.
- Alert rail or dashboard section for sudden changes, cancellations, upstream
  Wizards/WPN event announcements, and new high-value signals from socials.
- Background activity log link for favorites, notes, and important changes.
- Google Calendar add-to-calendar action if/when we wire that in.

### Personalization and preference controls

- Revisit whether personal fields should live alongside core records in one
  unified data model, with strict namespacing between:
  - research-authored fields
  - user-authored fields
  - agent/workflow metadata
- Ensure favorites, ratings, notes, and follow-up flags have clear behavioral
  impact rather than feeling bolted on.
- Add negative preference controls, likely thumb-down actions, for stores, event
  series, and possibly individual events.
- Thumb-down actions should hide or deprioritize items in recommendation/event
  views without overwriting the underlying research truth.
- Add an explicit hidden/deprioritized bucket so avoided items are not
  mysteriously gone.
- Revisit the top-level `Favorites` control so it either has a clear global job
  or is redesigned/removed.
- Ensure the top-level favorites control produces a visible effect on all
  relevant pages and does not conflict with page-local favorite filters.
- Add saved view presets such as `My commander view`, `Weekend scan`, `All
  updates`, and `Discovery queue`.

### Today page refinement

- Add a curation/ranking layer so a day's events are not presented as a flat
  chronological dump.
- Default daily ranking should prioritize favorite stores, high-fit stores,
  Commander bracket 2/3 signals, and prerelease/sealed highlights.
- Draft should be easy to phase in as a secondary preference rather than forced
  into the default top-priority mix.
- Visually separate `best bets` from the broader full-day event catalog.
- Add `why am I seeing this?` drilldowns so ranked and highlighted items feel
  trustworthy.
- Add a collapsible right-side insights rail for `Fresh Signals` and `For You`.
- The right-side rail should be open by default on roomy desktop layouts, but
  collapsible into a slim edge tab or drawer.
- Revisit whether `Fresh Signals` / `For You` deserve their own dedicated log,
  drawer, or popout rather than routing `View all` into the noisier Updates
  stream.
- Support `HOT` editorial flags for especially notable items, used sparingly for
  truly high-value discoveries.
- Audit and fix search behavior on the Today page so keyword search matches
  event title, format, store name, venue name, and other relevant metadata.
- Improve empty-state explanations when search plus current filters eliminate
  all visible events.

### Updates and activity surfaces

- Rename `New & changed` to `Updates` in navigation and related UI so the label
  stays compact and does not wrap awkwardly.
- Treat the Updates badge count as an unread indicator rather than a static
  total.
- Opening Updates should clear or mark that count as read until new items
  arrive.
- Revisit the Updates timeline layout so date and text align more cleanly and
  the main text weight is less heavy.
- Add useful update-type filters such as:
  - new place discovered
  - store/venue profile materially updated
  - new event discovered
  - event changed/cancelled
  - research follow-up needed
  - waiting-on-user / agent question
  - app/product change completed
- Add richer embedded links so update entries can open the relevant store,
  event, community, or research view directly.
- Let Updates carry lightweight follow-ups from Codex, including small A-vs-B
  questions and waiting-on-user clarifications.
- User responses inside Updates should be able to unblock immediate execution
  rather than always waiting for the next scheduled daily run.

### Research coverage and drilldowns

- Make more dashboard summary cards and metrics clickable when they imply an
  underlying dataset.
- On the Research Coverage page, clicking `Discovery Queue` should open the
  lightly vetted places behind that count.
- Extend the same drilldown pattern to other cards, rankings, and evidence
  summaries when they represent real underlying records.

### Places page refinement

- Revisit the Places page layout and scrolling behavior so the most important
  reading surface feels naturally placed.
- Evaluate whether the current master-detail split should stay as-is or whether
  the right-side detail content should feel more central.
- Continue refining the Places page as a second-pass layout problem rather than
  treating the current version as final.

### Communities page refinement

- Add a `hot finds` / `promising threads` surface for recent meetup-seeking,
  LFG, coordination, and newcomer-friendly community signals.
- Add limited daily Discord sweeps for only the most promising community
  channels, such as LFG, meetups, events, and EDH coordination.
- Make the community detail drawer more useful with best recent signals,
  activity level, linked venues/geography, and next suggested action.
- Consider a Communities-page async request box for instructions like `watch
  this server for Saturday commander meetup chatter`.

### Async collaboration workflow

- Add in-app Codex request capture, likely a top popdown drawer or command box,
  for async instructions to future research/dev sessions.
- Support async note types for:
  - general async requests
  - research follow-up tied to a place/event/community
  - product/UI fix tied to a specific screen or record
- Let entity-specific notes be attached to stores, events, event series, venues,
  and communities for later investigation.
- Daily-agent runs should review prior backlog items, resolve easy fixes
  directly when possible, and surface in-flight or unresolved items back into
  Updates.
- If a backlog item needs discussion, the agent should be able to do preliminary
  research and then add a waiting-on-user note into Updates.
- Add page-specific `dear AI, watch for X here` capture on surfaces like
  Communities where ongoing pattern-watching is especially valuable.

### Visual system and naming

- Rename the app from `Mana Radar` to `MTG Events`.
- Revisit supporting subtitle/copy so branding stays coherent after the rename.
- Re-do typography best-practice review after the regression that left the base
  font scale smaller than intended.
- Audit base font size, text hierarchy, and readable defaults against current UI
  best practice and restore a more normal reading scale.
- Reassess whether `Import updated data` belongs in the normal user-facing UI;
  if retained, add stronger explanation and guardrails, and if not, move it to
  an admin/dev-only surface.

## Process backlog

- Enforce the new rule that each store pass includes social review in the same
  pass unless blocked; do not treat socials as an optional later extra.
- Enforce the new rule that if a store has an accessible Discord, a bounded
  Discord survey is part of the main first pass: events, announcements,
  Commander/EDH/LFG/meetup signals, and basic server usefulness, without
  exhaustive history reading.
- If a bounded Discord survey shows unusually strong community value, promote
  that store/server into a deeper Discord follow-up tier rather than treating
  the first pass as the end of Discord work.
- Enforce the new rule that forward-going main store passes should also capture
  newer secondary signals when reasonably available: MTG-focus, player-pool
  breadth / venue-scale, review/prominence clues, and play-space image evidence.
- Add a post-pass self-QA step where Codex reviews the store from the user's
  perspective before asking the user to validate routine findings.
- In that self-QA, explicitly ask whether the first pass would feel complete to
  the user based on the agreed workflow, and catch any skipped required surfaces
  before moving on.
- Keep `Magic overall` distinct from `Commander specifically` in analysis and
  self-QA. A store may actively promote Magic while still making Commander only
  a small slice of its MTG footprint, and that distinction should be visible.
- Keep secondary-signal capture bounded: give photos/reviews/space clues a quick
  best-efforts pass, but do not let them turn into open-ended rabbit holes
  during routine store research.
- Maintain this file whenever we defer or discover meaningful future work.
- Maintain `CURRENT_FRONTIER.md` for current tranche status.
- Maintain run folders for each substantive research pass.
- Keep attributed user field notes in repo-backed evidence when they are meant to
  be durable project knowledge.
- Add periodic continuity checkpoints when a work stretch gets long.
- At the next stable checkpoint, perform a deliberate branch-hygiene pass:
  review the active worktree, make an intentional checkpoint commit, create or
  rename into a broader canonical working branch for the full project, push it,
  and record the transition clearly so future work does not remain anchored to
  the legacy `codex/reconcile-wizards` name by accident.

## Done when

- The backlog is helping us remember deferred work rather than becoming a junk drawer.
- The highest-value unknowns for each promising venue are explicitly tracked.
- A fresh Codex session could resume from this file, `CURRENT_FRONTIER.md`, and
  the run folders without losing momentum.
