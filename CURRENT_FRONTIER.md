# Current Frontier

Updated: 2026-07-28

This file is the short operational handoff: where the project is now, what may
come next, and which boundaries remain active. Detailed methods live in the
canonical SOPs. Historical frontier checkpoints are preserved in
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
- WPN/EventLink is normally sufficient to capture a current event when the
  venue name/address match is identity-safe enough. Venue messiness or poor
  personal fit becomes confidence, ranking, and caution metadata rather than
  silent event omission.
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

0. Immediate next product/research lane: run one small MTG OC Discord scanner
   proof, not a broad Discord sweep and not Supabase readiness repair. Use the
   known success cases to verify the scanner can surface high-signal community
   chatter: meetup coordination involving `Metavirus`, direct questions or
   requests mentioning the user, and event-adjacent planning such as date,
   attendance, venue, store, bar, or format discussion. Preserve exact Discord
   message/channel links where possible, distinguish community-organized
   meetups from official venue programming, and return either a high-signal
   item, a lower-key community finding, or a quiet/no-useful-chatter record.
1. Use the lifecycle-specific Supabase selectors:
   `venue_baseline_candidates`, `venue_surface_retry_candidates`,
   `venue_surface_monitoring_candidates`, `venue_discovery_candidates`, and
   `venue_identity_resolution_candidates`. Markdown ledgers are context, not
   operational selectors. For queues shaped around the user's personal app
   preferences, use `venue_candidates_for_user(...)` so venues marked
   `deprioritize` or `hide` do not re-enter ordinary discovery, retry, or
   monitoring work.
2. Keep every runtime research task inside one explicit lane:
   `baseline pass`, `identity-resolution pass`, or
   `steady-state monitoring pass`. Time budgets and hard stop conditions now
   live in `docs/EFFICIENCY_SOP.md`; treat a 5+ minute no-delta monitoring run
   or a 10+ minute ordinary baseline run as a workflow failure condition, not a
   normal cost.
3. Address specific real-use app friction when observed; do not start another
   broad product tranche by default.
4. Consider the next overhead reduction only as a separate approved tooling
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
