# Work Backlog

Last updated: 2026-07-21

This is the explicit repo-backed log of work we still need to do.

Use it for:

- unfinished research work;
- deferred deep dives;
- app/product tasks not yet built;
- data-quality gaps and ambiguity we want to revisit;
- process improvements that protect continuity.

## Active next-up

- JJ's Orange branch/entity resolution: future JJ's Discord survey findings
  that mention `Orange` must not be merged into Garden Grove. A 2026-07-23
  non-Discord identity check found Garden Grove-only public JJ's identity and a
  separate Orange-area Hidden Collectibles 2 / `jjscardemporium.com` lead, but
  no clean official bridge. Resolve the Orange venue name/address/relationship
  before any Signal or event proposal.

- Discord survey cadence/status checkpoint:
  `docs/DISCORD_SURVEY_CADENCE_STATUS_2026-07-23.md` is now the lean operating
  map for small verified-route surveys. It separates ready routine routes,
  route-discovery candidates, blocked/TBD items, cadence, useful-signal criteria,
  quiet/stale handling, same-day Signal expiry, and write approval gates.

- ChatGPT-to-Codex coordination has moved to Supabase. New ordinary ChatGPT
  source leads, findings, questions, and proposals should be submitted as
  non-canonical coordination queue records, preferably through
  `public.submit_coordination_item(...)`. The legacy PR/mailbox/intake files
  remain historical fallback only.

- Coordination cleanup TBD: when a Supabase CLI/session with Edge Function
  delete access is available, cleanly remove or disable the obsolete hosted
  `coordination-capability` temporary proof function. Its repo source and
  backing table are already gone; do not treat it as an active coordination
  path.

- Source-image/artifact evidence TBD: later investigate a minimal way to
  preserve original Discord/Instagram/flyer-derived event artifacts or
  screenshots when the app summarizes image-only source material. This is a
  future trust/re-verification design problem involving provenance, retention,
  privacy, copyright, and a tiny proof of concept. Do not implement it during
  ordinary research batches.

- Cold-deep-link Discord content-read is blocked/TBD at accepted boundary
  `5e055e8`. The current accepted safety baseline is recorded in
  `docs/DISCORD_READONLY_SAFETY_CHECKPOINT_2026-07-21.md`. The local fixture
  proof passed, the production guard exists, shell identity can be proven without
  reading messages, and the first content-read pilots failed closed without
  reading content or changing external Discord state. Paper Hero, JJ's, Magic &
  Monsters, Collectors, and Krazy Nick's all proved shell identity but triggered
  blocked `members/@me?lurker=true` behavior before content extraction. The
  approved one-retry rule did not clear it, and a manual one-time open did not
  prevent recurrence on Collectors. Do not allowlist the undocumented
  state-changing-looking request without separate approval and stronger
  evidence. Guarded UI-native paths have since passed shell and bounded-content
  proof for Collectors Lounge and JJ's: `@me -> Stores/Local -> exact guild ->
  exact channel`. The replication pass failed closed for ProjectCCG and Magic &
  Monsters because Discord attempted message acknowledgement POSTs during
  server selection. Do not allowlist those writes merely to make the routes
  pass. No broad Discord survey is authorized. Preserve the route map,
  priorities, expected signal types, isolated profile, read-only guard, and
  quiet/blocked-run semantics. If separately approved, the next Discord step is
  a tiny pilot that independently proves the same path per selected route.
  The acknowledgement state-machine experiment now distinguishes an exact
  blocked read-state acknowledgement from reply/reaction/upload and other
  mutations, but the ProjectCCG and Magic & Monsters reruns failed earlier
  because the isolated `@me` shell exposed no server/folder controls. Do not
  graduate acknowledgement handling yet. A later bounded safety test may first
  diagnose that isolated-profile guild-list hydration boundary without reading
  messages or reducing route value.

- Recent app blocker resolved: the Events/Today freeze was traced to two
  malformed active weekly Paper Hero series with legacy `weekday` recurrence
  values and no numeric `dayOfWeek`. The Supabase rows were corrected and the
  app now fails closed on malformed weekly recurrence data instead of hanging.

- Card Addiction has been added as a real Anaheim TCG store through
  `supabase/proposals/card-addiction-main-pass-2026-07-21.json`. The
  supporting main-pass/root-cause/missed-store sweep is durable in
  `research/runs/2026-07-21-card-addiction-main-pass-and-missed-store-sweep.md`.
  No event rows were added; Card Addiction's current MTG calendar remains a
  named event/source TBD.

- Authenticated personal preference persistence is implemented and live. The
  hosted app uses Supabase email magic links, user-scoped venue/event-series
  preferences, and one private personal note per target, with browser-local
  state retained as a signed-out or failure fallback.
- 2026-07-19 validation confirmed signed-in Supabase rows for venue notes,
  event-series notes, and favorites. Research facts remain unchanged by
  personal actions.
- Remaining research is already durable in
  `docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md` and the existing packet/TBD
  trackers. Resume from those records only after the personal-state checkpoint
  is accepted.

- The permanent personal-use deployment baseline is commit `dd44e20`, tagged
  `checkpoint/personal-use-deployed-supabase-default-2026-07-17`. If future work
  blows up, return to that checkpoint before reconstructing state from chat.
- Supabase operational-write readiness and the default-read cutover are now in
  place. The hosted app uses Supabase by default and keeps `?data=json` as the
  explicit fallback.
- The minimal live Supabase write pilot passed using
  `supabase/proposals/workflow-pilot-2026-07-17.json`: one documentary
  `research_changes` insert only, with prewrite/postwrite exports verified.
- Batch A identity/status clarifications were applied through
  `supabase/proposals/identity-status-batch-a-2026-07-17.json`. The write
  clarified Krazy Nick's / Honey Pot, Game Chest Irvine, ProjectCCG,
  Kingslayer, and Shuffle and Cut / The Realm without changing event records.
- High-value event candidate replay A was completed and applied only as a lean
  source/provenance refresh:
  `supabase/proposals/event-candidate-replay-a-source-refresh-2026-07-17.json`.
  It confirmed Finch Birdcage VII, The Game Cellar, Next-Gen Games, It's
  GameTime!, and The Crimson Guild are already event-covered enough to avoid
  duplicate ingestion.
- The local UX pass is accepted; do not resume Today/Events/Places/Updates
  polish as the default next step unless a true blocker appears.
- Default research execution is now direct Project Steward work in small
  batches. Do not launch workers/subagents unless the user explicitly approves a
  specific exceptional worker.
- The active finite research queue and closure-audit baseline is
  `docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md`.
- The ChatGPT PR #15/#16 packet is preserved and structurally disposed in
  `docs/CHATGPT_PACKET_INGEST_TRACKER_2026-07-17.md`; use only the tracker rows
  when a specific packet-derived item is selected.
- Tiny Updates housekeeping: applied Supabase `research_changes` rows can still
  display as `PROPOSED`, and midnight UTC timestamps render as the prior evening
  in Pacific time. This is not blocking; later clean up applied statuses and use
  local-safe timestamps for user-visible update entries.
- Migrate canonical research and personal continuity in explicit reversible
  stages. Async request/workflow data remains deferred.
- Treat `docs/UX_MEGA_REVISION_SCOPE.md` as the accepted local UX scope that has
  now been substantially completed, not as the default current execution queue.
- Use `docs/SUPABASE_CONTINUITY_MODEL.md` as the plain-language contract for
  what belongs in research truth, personal continuity, and workflow/request
  state during this transition period.
- Resume broad research only through the controlled Supabase research-write
  workflow, with generated JSON treated as export/recovery output rather than a
  manual canonical editing surface.
- Use the source-routing rules in `research/SOURCE_SOP.md`: review mirrors and
  marketplaces inform fit/confidence/activity, while exact event facts should
  come from official/store-controlled/EventLink/event-platform evidence where
  possible.
- Use `docs/IMPLEMENTATION_PLAN.md` as the active build sequence.
- Preserve the remaining research queue; do not mistake an evaluated subset for
  a completed regional census.
- Tighten the ordinary-store-pass SOP so "checked" means candidate-grade useful,
  not just lightly classified.
- Tweedy Cards and Gaming has already served as the current test case for that
  improved first-pass standard; older "repair Tweedy first" instructions are no
  longer active next-work.
- Continue migrating repo/app language away from overloaded `partial` semantics
  toward an explicit model of:
  - research status
  - fit grade
  - confidence

## Research backlog

- **Bullpen matched-WPN event follow-up:** review
  `bullpen-wpn-event-capture-calibration-2026-07-24`. It proposes caveated
  Friday draft, Wednesday Standard, and August 7-9 prerelease inventory while
  preserving low-confidence/deprioritized venue treatment. No live write yet.

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

### Research coverage queue

Use `docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md` as the current finite venue
queue. It replaces the older discovery-list view, which mixed untouched leads,
already-evaluated records, structural packet dispositions, and promoted stores.

Current queue shape:

- mandatory corrected main-pass/status queue: 22 venues;
- micro-backfill queue from the 2026-07-17 closure audit: 7 venues;
- optional/deeper queue: promoted or mostly complete venues with named
  decision-changing TBDs.

Recommended first post-checkpoint batch:

- Grails Gone Wild;
- Buddies Collectibles;
- Tilted Gaming.

Reason: this small batch directly addresses the recent methodology correction:
obvious-source capture, source-content inspection, and conservative event/status
claims without reopening the whole packet.

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
- Pilot complete on Finch and Collectors Lounge; continue calibrated rollout of
  the separate user-facing layers for:
  - research status (`discovery`, `reviewed`, `deepened`)
  - fit grade (A-F or equivalent)
  - confidence (low/medium/high)
- Clickable fit/confidence rationale is implemented for calibrated stores;
  extend it as additional stores receive explicit evaluations.
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

- Signals foundation is implemented as a minimal read-only Supabase model.
  Remaining selected work is a small first-class Signals UI, followed by a
  Communities refresh; seed only honest existing findings and keep survey
  automation deferred.
- Calendar-first default view with scrolling upcoming events.
- Weekly and monthly calendar modes.
- Parked design question: whether Events should gain a separate "Top picks this
  week" surface above the calendar. The user deliberately deferred this while
  Week/Month grouping and scanability are evaluated; do not add it by default.
- Store-hours interface support now exists on Places, backed by the
  `venue_hours` Supabase table when available and an optional exported fallback
  shape. Remaining work is a small source-backed data population pass for
  high-interest stores.
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
- During the current calibration phase only, allow selective publish-after-store-pass
  when needed so the user can audit the updated record in the live app quickly.

### Personalization and preference controls

- Implement the accepted Supabase model with one operational database and
  strict namespacing between:
  - research-authored fields
  - user-authored fields
  - agent/workflow metadata
- Replace browser-only local storage with authenticated cross-device records,
  including a one-time migration of existing browser preferences.
- Ensure favorites, ratings, notes, and follow-up flags have clear behavioral
  impact rather than feeling bolted on.
- Negative preference controls now exist for stores and event series. Continue
  monitoring whether individual dated occurrences need separate per-date
  thumbs-down later.
- Thumb-down actions should keep hiding or deprioritizing items in
  recommendation/event views without overwriting the underlying research truth.
- The event calendar now has an explicit hidden / poor-fit bucket so avoided or
  no-proxy items are retained without competing for prominent planning slots.
- Revisit the top-level `Favorites` control so it either has a clear global job
  or is redesigned/removed.
- Ensure the top-level favorites control produces a visible effect on all
  relevant pages and does not conflict with page-local favorite filters.
- Add saved view presets such as `My commander view`, `Weekend scan`, `All
  updates`, and `Discovery queue`.

### Today page refinement

- Accepted local UX work now gives Today a stronger decision surface. Keep the
  following items as future polish/calibration rather than immediate blockers.
- Further tune the curation/ranking layer so a day's events are not presented as
  a flat chronological dump.
- Continue calibrating default daily ranking around favorite stores, high-fit
  stores, Commander bracket 2/3 signals, and prerelease/sealed highlights.
- Draft should be easy to phase in as a secondary preference rather than forced
  into the default top-priority mix.
- Continue improving `why am I seeing this?` drilldowns so ranked and
  highlighted items feel trustworthy.
- Explore how to keep `Fresh Signals` and `For You` prominent after the fixed
  Today side rail was removed from the default layout.
- Do not restore a permanent right-side pane that consumes calendar width by
  default; consider a compact inline summary, slim edge affordance, drawer, or
  other non-blocking treatment instead.
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

- The `Updates` label and basic filter-chip behavior have been improved in the
  accepted local UX pass. Remaining items below are future activity-surface
  work, not current blockers.
- Treat the Updates badge count as an unread indicator rather than a static
  total.
- Opening Updates should clear or mark that count as read until new items
  arrive.
- Continue refining the Updates timeline layout if it becomes a blocker during
  final acceptance; otherwise treat alignment/weight as polish.
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

- Places now exposes research status, fit, confidence, rationale, evidence, and
  compact preference controls. Remaining layout work is future polish unless a
  final-acceptance blocker appears.
- Revisit the Places page layout and scrolling behavior later if the most
  important reading surface still feels awkward in real use.
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

- Governing process rules live in `docs/EFFICIENCY_SOP.md`,
  `research/SOURCE_SOP.md`, and
  `docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md`. Do not duplicate their
  checklists here.
- **Non-urgent documentation pruning:** `docs/PROJECT_CONTEXT.md` and
  `research/SOURCE_SOP.md` remain substantial because they hold product
  semantics and source/closure rules. Consider a further split only if fresh
  task onboarding still proves slow; do not create another overlapping manual.
- Generated JSON and connector apply packages are temporary recovery/execution
  artifacts, not backlog deliverables.
- Maintain this file whenever we defer or discover meaningful future work.
- Use `CURRENT_FRONTIER.md` as the concise current handoff. Historical
  checkpoints live under `docs/archive/`.
- Use a concise proposal/ledger checkpoint for routine refreshes; reserve
  dedicated run notes for substantive findings, incidents, or method changes.
- Keep attributed user field notes in repo-backed evidence when they are meant to
  be durable project knowledge.
- At the next stable checkpoint, perform a deliberate branch-hygiene pass:
  review the active worktree, make an intentional checkpoint commit, create or
  rename into a broader canonical working branch for the full project, push it,
  and record the transition clearly so future work does not remain anchored to
  the legacy `codex/reconcile-wizards` name by accident.
- Backlog note from the accepted UX pass: explore whether Signals / Fresh
  Signals should regain a more prominent default surface without restoring the
  fixed right-side pane that consumed calendar width. This is not a current
  blocker.
- Discord monitoring status and deferred automation live in
  `docs/DISCORD_SURVEY_CADENCE_STATUS_2026-07-23.md` and the monitoring map;
  do not restate the evolving safety frontier here.

## Done when

- The backlog is helping us remember deferred work rather than becoming a junk drawer.
- The highest-value unknowns for each promising venue are explicitly tracked.
- A fresh Codex session could resume from this file, `CURRENT_FRONTIER.md`, and
  the run folders without losing momentum.
