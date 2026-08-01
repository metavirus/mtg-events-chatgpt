# Current Frontier

Updated: 2026-08-01

This file is the short operational handoff: where the project is now, what may
come next, and which boundaries remain active. It must describe unfinished
current work only. When a proof, product tranche, research batch, or platform
repair completes, remove it from "next" language immediately or mark it as
done/verify/parked. If this file conflicts with app code, Supabase live state,
or a more recent backlog entry, treat the conflict as documentation drift:
verify against the durable implementation state, update this file, and do not
repeat completed work. Detailed methods live in the canonical SOPs. Historical
frontier checkpoints are preserved in
`docs/archive/CURRENT_FRONTIER_HISTORY_THROUGH_2026-07-24.md`.

## Where we are now

- The personal-use app reads canonical operational data from Supabase.
- Signed-in favorites, deprioritization, and private notes persist through
  Supabase; signed-out use retains a local fallback.
- Signals, Events, Places, Communities, Updates, and Research are usable
  first-class surfaces. Product work should now respond to observed friction,
  not speculative polish.
- Recent accepted Places work added a mobile bottom-sheet picker, compact
  sort/filter controls, favorites-first default behavior, and a closed low-fit
  group for deprioritized venues. Keep iterating from real-use friction rather
  than reopening the whole page.
- Updates now uses an unread-style badge for accepted changes and marks them
  read when the Updates page is opened.
- Store research uses Supabase as operational state. Ordinary source/surface
  checks land through `record_entity_surface_check`; proposals and ledgers are
  reserved for event/evaluation changes, higher-level queueing, and unresolved
  work.
- The guarded Discord UI-native method is proven for a bounded set of mapped
  routes. Small verified-route surveys are supported; broad daily automation is
  not yet approved.
- MTG OC is modeled as an independent Orange County regional community with
  nine mapped Discord channels. The proof distinguishes community-organized
  meetups from host-venue programming: its confirmed August 2 team-sealed
  meetup is an MTG OC event hosted at Card Addiction, while its tentative
  Collector's Lounge prerelease meetup remains a follow-up Signal only.
- The Supabase coordination queue is the active ChatGPT-to-Codex intake lane.
  ChatGPT submissions remain non-canonical until reviewed and promoted.
- Private source-image evidence is operational for uncommon cases where the
  useful source fact lives in a flyer, social graphic, or screenshot. Affected
  Events and Place Evidence views show one compact on-demand link; unaffected
  records consume no interface space.
- The rich 25-mile WPN cache is live in `wpn_snapshot_cache` and refreshes when
  at least 24 hours old. The enriched ingest revision is deployed: it adds
  direct Wizards links, normalized
  schedule/fee fields, exact canonical venue association, event/content/store
  fingerprints, delta comparison, two-snapshot disappearance handling, and a
  quiet deduplicated Codex findings inbox. Migration
  `20260801170000_enrich_wpn_ingest_cache.sql` was deployed on 2026-08-01. A
  forced no-write benchmark
  2026-08-01 fetched and enriched 1,267 events and 78 organizations in 8.64
  seconds, with 51 exact venue matches, 27 unmatched organizations, and zero
  findings. The first live write established the enriched baseline in 9.16
  seconds; an immediate 9.40-second replay returned 1,267 unchanged events,
  zero findings, and zero coordination-inbox noise.
- The next event-agent boundary is now explicit in
  `docs/CANONICAL_EVENT_INGEST_AGENT_DESIGN.md`: WPN remains a source-specific
  cache/adapter, while one source-neutral observation and reconciliation layer
  promotes attributable events from WPN and later official calendars, Discord,
  Instagram/Facebook, registration platforms, and source artifacts. The design
  is complete; implementation has not started.
- A read-only reconciliation against the 2026-08-01 cache is captured in
  `docs/WPN_CANONICAL_RECONCILIATION_EXERCISE_2026-08-01.md`. It found 1,081
  exact-known-venue future WPN observations versus 118 canonical future dated
  occurrences: 578 strong exact title/schedule matches, 254 no-lane candidates
  compressing to 115 schedule clusters, and 249 same-slot/lane or multi-lane
  cases that must not be merged by schedule alone. No data was written.

## Active data and research posture

- Supabase is canonical. Generated JSON is emergency/debug/export output only.
- `entity_surface_coverage` is canonical operational research state for
  surface checks. It is not venue/event truth, but it is durable without a
  run note or ledger edit.
- Venue research has a finite lifecycle: `unreviewed` ->
  `baseline_in_progress` -> `steady_state`, with at most one ordinary
  `targeted_closure`. A third
  holistic pass requires an active material identity/status exception or an
  explicit user request. Missing or blocked social texture lowers confidence;
  it does not keep a venue open indefinitely.
- WPN/EventLink, official site/calendar, Discord, Instagram/Facebook, and other
  store/community-controlled sources are peer evidence surfaces, not a source
  hierarchy. WPN is useful because it is broad and structured, not because it is
  the standard every other source must prove itself against. Capture each source
  according to what it can actually establish, with clear attribution.
- Events may be broad but caveated and ranked. Signals remain sparse and
  attention-worthy.
- Routine database-only surface checks use the typed Supabase RPC and require no
  proposal JSON, SQL package, export, Markdown ledger edit, text-integrity run,
  or Git commit. Standard or high-risk ceremony is reserved for event changes,
  meaningful assessments, identity corrections, schema/auth work, or other
  trust-sensitive changes.

Canonical operating details:

- research/tool discipline: `docs/EFFICIENCY_SOP.md`
- source treatment: `research/SOURCE_SOP.md`
- operational writes: `docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md`
- collaboration and escalation: `docs/COLLABORATION_SOP.md`
- app changes: `docs/CHANGE_CONTROL.md`
- current work queue: `docs/WORK_BACKLOG.md`

## Next safe lanes

0. Implement the WPN-first slice of
   `docs/CANONICAL_EVENT_INGEST_AGENT_DESIGN.md`: a typed normalized observation
   contract, durable source-record bindings, and one set-based source-neutral
   canonical reconciler. Prove exact WPN replay first, then one bounded non-WPN
   adapter. Do not build separate WPN/social canonical promoters.

1. The small MTG OC Discord scanner proof is complete. Do not repeat it as the
   next default step. Current Communities work should be driven only by
   observed product friction: verify click-through/source attribution in the
   live app, keep relevant chatter compact and hideable, and distinguish
   community-organized meetups from official venue programming. If the Card
   Addiction team-sealed meetup or Collector's Lounge prerelease invitation
   appears to imply official store programming, fix the display/attribution
   bug directly; otherwise leave the proof alone.
2. Collector's Lounge/Cypress multi-channel Discord POC is complete. Both
   `#mtg-announcements-and-events` and `#event-rules` are now
   `ui_native_navigation_verified` in the live map. Lessons: store Discords can
   be useful chatter/schedule surfaces, not just official announcements; the
   announcements channel carried current schedule/sign-up chatter and the rules
   channel carried high-value Commander fit evidence. Keep community/store
   Discord findings clearly attributed as Discord/community evidence, and do not
   measure them against WPN as though WPN were the authoritative baseline.
3. Use the lifecycle-specific Supabase selectors:
   `venue_baseline_candidates`, `venue_surface_retry_candidates`,
   `venue_surface_monitoring_candidates`, `venue_discovery_candidates`, and
   `venue_identity_resolution_candidates`. Markdown ledgers are context, not
   operational selectors. For queues shaped around the user's personal app
   preferences, use `venue_candidates_for_user(...)` so venues marked
   `deprioritize` or `hide` do not re-enter ordinary discovery, retry, or
   monitoring work.
4. Keep every runtime research task inside one explicit lane:
   `baseline pass`, `identity-resolution pass`, or
   `steady-state monitoring pass`. Time budgets and hard stop conditions now
   live in `docs/EFFICIENCY_SOP.md`; treat a 5+ minute no-delta monitoring run
   or a 10+ minute ordinary baseline run as a workflow failure condition, not a
   normal cost.
5. Address specific real-use app friction when observed; do not start another
   broad product tranche by default.
6. Consider the next overhead reduction only as a separate approved tooling
   tranche: either a narrow typed helper/RPC for the remaining routine write
   shapes or further simplification around linked-CLI typed writes.

## Active boundaries

- Do not live-write an unapproved research proposal.
- Do not edit canonical JSON; there is no active JSON research lane.
- Do not create repo text artifacts just to record an ordinary surface check.
- Do not select a `steady_state` venue for another holistic pass. Monitor exact
  mapped surfaces and event deltas instead.
- Do not let `identity_blocked` venues leak back into ordinary baseline work.
  Resolve the named identity question first or leave them out of the batch.
- Respect finite surface retries. One automatic retry is the norm; terminal
  outcomes reopen only for a recorded access/source condition change or an
  explicit user request.
- Quiet, thin, blocked, route-only, and no-delta checks live in
  `entity_surface_coverage`; they do not create Updates entries.
- Do not broaden a bounded store pass once its planning conclusion is clear.
- Discord work uses only the documented guarded modes and mapped routes. Do not
  improvise around gates or resume safety engineering unless a new blocker
  requires it.
- Do not build broad automation, schema, or app changes inside a research apply.
- Once a live write begins, land it: apply the prepared operations, run the
  scoped readback, checkpoint, and report.

## Resume checklist

Read `README.md`, `docs/SESSION_BOOTSTRAP.md`, `docs/PROJECT_CONTEXT.md`, this
file, and `docs/WORK_BACKLOG.md`. Then open only the canonical SOP needed for the
approved lane.
