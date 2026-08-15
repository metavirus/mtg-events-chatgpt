# Current Frontier

Updated: 2026-08-14

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

## Compaction safety

This file is the first recovery read after compaction. Keep it short. Do not
raw-read `docs/WORK_BACKLOG.md` or broad source trees just to reacclimate; use
targeted searches and small snippets. If a task compacts repeatedly before a
bounded result is reached, stop substantive work, update this file/backlog with
the exact durable state and next action, then hand off from that checkpoint.

## Where we are now

- The fuzzy community-discovery checkpoint is pinned in
  `docs/WORK_BACKLOG.md`. Canonical promotion is complete: MTG OC has its Meetup
  source, and LAGS, GayMTG, and Sanctuary MTG now exist with their verified
  routes. Do not repeat discovery or recreate them. LAGS, GayMTG, and Sanctuary
  MTG have completed bounded main passes. GayMTG's Meetup showed active recent
  2026 history but no future dated event and no additional verified official
  route, so it is closed to weekly Meetup monitoring. Sanctuary's authenticated Instagram review
  confirmed active recent gatherings but yielded no concrete future dated event,
  so none was invented. MTG OC source reconciliation is complete. The LAGS
  August 18 Magic The GAYthering item has since been promoted as a
  community-owned event hosted at Precinct DTLA, not as official Precinct
  programming. The final repaired state is: event/update ownership belongs to
  Los Angeles Gayming Society, Precinct is location text only, the Signal links
  to the event occurrence, and the database `promotion_target` remains
  `event_proposal` because that is the allowed event-action enum even though
  the app opens the event. Do not re-run this discovery batch or re-promote
  these records; only fix exact app/display/readback defects if the live UI
  disagrees. Lower-confidence community possibilities are now parked in
  `public.community_discovery_candidates`, a view over `coordination_items`.
  It currently holds five unresolved fuzzy leads. Do not main-pass them until
  one bounded corroboration search promotes them. The remaining discovery
  product follow-up is the compact Home possibilities lane for corroborated but
  uncertain groups.

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
- Supabase app reads paginate past PostgREST's 1,000-row response limit. Event
  drawers show when an event entered the catalog, and event-source links may
  carry the exact source record URL (including the individual WPN event page)
  instead of falling back to a generic venue source.
- The follow-up integrity audit also made pagination deterministic, lets dated
  occurrences inherit valid series-level evidence, and keeps weekly series in
  projection after their last explicitly dated confirmation. Confirmed dates
  supersede same-day projections, so this does not duplicate the calendar.
- Store research uses Supabase as operational state. Ordinary source/surface
  checks land through `record_entity_surface_check`; proposals and ledgers are
  reserved for event/evaluation changes, higher-level queueing, and unresolved
  work.
- The guarded Discord UI-native method is proven for a bounded set of mapped
  routes. The live Discord surface inventory and next recurring-agent sequence
  are pinned in `research/DISCORD_SURFACE_FRONTIER.md`. Small verified-route
  surveys are supported; broad daily automation is not yet approved.
- MTG OC is modeled as an independent Orange County regional community with
  nine mapped Discord channels. The proof distinguishes community-organized
  meetups from host-venue programming: its confirmed August 2 team-sealed
  meetup is an MTG OC event hosted at Card Addiction, while its tentative
  Collector's Lounge prerelease meetup remains a follow-up Signal only.
- The first Communities-profile redesign slice is implemented locally in
  `app.js` and `styles.css`. Community cards now distinguish new activity,
  quiet-but-monitored, uncertain coverage, and not-yet-assessed states while
  retaining upcoming-event, personal-connection, and known-host context. The
  detail drawer now has Overview, Events & plans, Your connections, Activity,
  and Sources tabs. Live local proof passed for MTG OC, Legendary Creature
  Club, and LAGS; LAGS renders as organizer of Magic The GAYthering with
  Precinct DTLA retained as host-location text. The next bounded product/data
  closure captured the August 8 MTG OC post-meetup acknowledgment/photo as
  supported personal social evidence without broadening Discord scope. The
  resulting MTG OC connection signal is canonical and should render in the
  community profile's Your connections tab.
- LAGS Gaymer Night at WERK Long Beach is now a canonical LAGS-owned community
  event for Thursday, August 20, 2026 at 8 PM. WERK is host-location text only.
  The exact official LAGS Instagram post, confirmed occurrence, free entry,
  event-opportunity Signal, live LAGS drawer, Events search result, and
  idempotent adapter replay all passed on August 14. Do not rediscover or
  re-promote this event.
- Legendary Creature Club bounded Discord survey completed on August 14. The
  safe UI-native path read `#events`, `#lfg`, and `#meet-ups`; current `#events`
  and `#lfg` were quiet, `#meet-ups` contained stale-but-real same-night meetup
  coordination, and the guild Events surface is now an exact
  `needs_deeper_replay` repair item because no unique Events control was
  observed. No current Signal/Event was created.
- Collectors Lounge bounded Discord survey completed on August 15. The safe
  UI-native path read `#announcements`, `#mtg-announcements-and-events`,
  `#general`, and `#event-rules`; announcements were quiet, event/rules context
  was useful, and current Commander/prerelease chatter was observed. No external
  Discord state changed.
- The Discord automation path is now a phased micro-sweep ladder, not broad
  crawler work. Phase 1 first-batch bounded proofs are complete for MTG OC,
  eligible LCC channel rows, and Collectors Lounge. Phase 2 local runner
  `scripts/run_discord_daily_survey.mjs` exists and has passed plan-only,
  one-row guarded dry run, Collectors scoped dry run, and one-row
  write-watchlist proof with Signal/Event writes disabled. The runner now has a
  lock to prevent overlapping Chrome-profile use. Phase 3 full local v1
  write-watchlist proof passed on August 15 in about 4m53s: 16 selected,
  16 guarded reads, 16 watchlist writes, 0 failed rows, 5 quiet coverage,
  6 event candidates, 4 stale useful contexts, and 1 accepted-signal-class
  finding. Signal/Event writes remained disabled. The old LCC guild Events row
  remains excluded as `needs_deeper_replay`; eligible LCC channel rows are now
  proven. The next execution step is Phase 4 GitHub Actions automation.
- The Supabase coordination queue is the active ChatGPT-to-Codex intake lane.
  ChatGPT submissions remain non-canonical until reviewed and promoted.
- Private source-image evidence is operational for uncommon cases where the
  useful source fact lives in a flyer, social graphic, or screenshot. Affected
  Events and Place Evidence views show one compact on-demand link; unaffected
  records consume no interface space.
- Event preference controls now distinguish three personal meanings: favorite
  or follow the series, hide the series from normal views with the closed-eye
  control, and record an active thumbs-down/not-for-me signal. The closed eye is
  visibility, not dislike; thumbs-down is dislike, not deletion.
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
- The ordinary daily surveyor now runs in the cloud through
  `.github/workflows/daily-surveyor.yml`, not on the user's desktop. The action
  uses `SUPABASE_DB_URL`, refreshes only when the rich WPN cache is stale unless
  forced, stages observations, optionally promotes eligible WPN deltas, and runs
  the integrity audit without committing generated JSON. It also has optional
  Instagram/Facebook social lanes. Those lanes use saved storage-state secrets
  (`SOCIAL_INSTAGRAM_STORAGE_STATE_JSON`,
  `SOCIAL_FACEBOOK_STORAGE_STATE_JSON`) to do bounded profile checks, record
  surface state, retain source artifacts only for clear dated MTG event facts
  or dated operational notices, promote clear date/time/title social event
  facts through the shared source-neutral promoter, and create sparse
  app-visible Signals only for urgent operational findings such as closures,
  cancellations, no-event notices, or hours changes, plus dated MTG
  promo/opportunity findings such as a Commander night raffle. Retained
  artifact ids are passed through to event promotion so app drawers can show
  incidental visual evidence. Thin profile/chrome text and vague "may have
  event" social findings stay quiet; they should not create visible watchlist
  sludge. Discord is explicitly bracketed out of this lane.
  The first GitHub Actions WPN proof
  completed successfully on 2026-08-09 after the `SUPABASE_DB_URL` repository
  secret was installed and the parser/log-cap issues were fixed.
- Broad store hydration/source-completeness cleanup is closed. The fast audit
  tool `scripts/audit_store_source_completeness.py` is the continuing selector
  for source-thin venues; current deliberate follow-up is narrow, not a new
  main-pass sweep. The only standing source-thin store follow-ups from the
  latest audit are LVLUP GAMING TCG and The Bullpen 2.0, and both are specific
  continuity/source-confidence checks rather than reasons to reopen the full
  venue list.
- WPN adapter contract v4 is now live in code. It adds conservative
  title keys, promoter eligibility/exclusion reasons, structured fact and field
  presence metadata, explicit proxy-rule flags, strict venue/title/weekday/time
  series hints that preserve format/team/proxy variants, and separate
  non-authoritative WPN template hints. On the
  current snapshot, 1,079 eligible exact-known-venue observations compress to
  374 strict hints (133 repeated, 241 one-off); 149 template hints provide a
  second lens for finite specials, with 44 spanning multiple session lanes.
  Contract v4 also exposes a leading title time and exact structured-schedule
  conflict flag without overriding WPN's structured date/time. The live v3
  cache write took about 11 seconds, and an unchanged replay exited
  without a Supabase write in about 6.2 seconds.
- The next event-agent boundary is now explicit in
  `docs/CANONICAL_EVENT_INGEST_AGENT_DESIGN.md`: WPN remains a source-specific
  cache/adapter, while one source-neutral observation and reconciliation layer
  promotes attributable events from WPN and later official calendars, Discord,
  Instagram/Facebook, registration platforms, and source artifacts. The WPN
  adapter plus service-only normalized observations, run ledger, durable
  binding table, set-based WPN staging, and read-only reconciliation preview
  are deployed in migration `20260801184712_add_canonical_event_ingest_core.sql`.
  The one-command staging helper is
  `scripts/stage_wpn_event_observations.py`. Its first run staged 1,081 unique
  observations (1,079 eligible, 2 held) in about 0.3 seconds of database work;
  replay created no duplicates. The first allowlisted live reconciliation is
  now deployed through migration
  `20260801191243_add_controlled_event_reconciler.sql`. It proved three exact
  cases: binding an existing Next-Gen occurrence, adding one dated Comic Book
  Hideout occurrence to an exact recurring series, and adding a SoCalMagic
  no-proxy occurrence while returning `hidden_by_rule = true`. All three have
  durable upstream bindings and exact WPN source links; replay returned
  `wrote = false`, and each canonical date/time slot remains unique. No Update
  or Signal was created.
- The exact reconciler is now expanded set-wise through migration
  `20260801200438_expand_safe_event_reconciler.sql`. On the same 1,081-row
  staged run it safely reconciled 647 observations: 57 exact existing-
  occurrence bindings, 573 dated occurrences on exact recurring series, 14
  dated occurrences on exact bounded finite series, and 3 prior bindings
  replayed. Of those, 42 inherited a hidden result from venue preference or a
  no-proxy rule without suppressing canonical event truth. The remaining 434
  observations stayed pending and 2 stayed held. An adversarial audit tightened
  finite identity to an explicit series date/window, preventing a later
  similarly named event from attaching to an old one-day series. Duplicate-slot
  readback returned zero, and a full 647-row replay wrote nothing.
- Deterministic new-series creation is now deployed through migration
  `20260801205442_add_deterministic_event_series_creation.sql`. It promoted 238
  collision-free observations into 85 canonical series: 19 bounded weekly
  series covering 140 observations and 66 finite/single series covering 98.
  A final exact attachment brought the August 1 proof run to 886 bound and 195
  intentionally unsupported rows, then the August 12 closure pass retired the
  safe leftovers without relaxing identity checks. The promoter now allows
  distinct parallel WPN series in the same venue/date/time slot when the event
  identity differs, skips invalid explicit recurring targets instead of
  aborting the run, deduplicates new-series occurrence inserts, and applies
  bounded safe-lane repairs for stale recurring times, same-lane Commander title
  aliases, finite prerelease title variants, and one-day finite-series
  extensions. Current production readback shows zero future eligible WPN
  observations left pending.
  `scripts/close_wpn_backlog.py` is now the required first operator response
  when WPN pending rows appear: dry-run previews the full future eligible WPN
  pending universe, `--live` applies the known safe closure lanes, and only its
  compact unresolved buckets should trigger manual review.
  Replay returned no-write results and duplicate-slot readback remains zero.
  Migration `20260801221500_normalize_ingested_series_metadata.sql` preserves
  structured occurrence times when an upstream title disagrees, removes
  misleading leading-time series labels, and maps exact Premodern titles out
  of WPN's generic `Other` format.
- Production verification on 2026-08-01 confirmed that the bootstrap promotion
  is live in the app: 85 newly created series and 828 occurrence rows contribute
  to 1,172 upcoming displayed occurrences across 49 venues. The Events catalog,
  exact provenance, inherited source links, and recurring projections load
  correctly. The shared source-neutral finalizer is now deployed through
  `promote_event_ingest_run(...)`: it runs the deterministic reconciliation
  shapes, marks a run complete, keeps bootstrap/backfill quiet, groups future
  visible deltas into the existing Updates feed, and creates Signals only from
  explicit adapter attention annotations. It never guesses attention from an
  event title. All four existing WPN runs are explicitly `bootstrap / quiet`;
  replay writes nothing. A rolled-back future-delta proof produced one event,
  one grouped Update, and one explicit Signal, then replayed with no writes.
  Unknown proxy policy is normalized to `unspecified`, preventing null logic
  from hiding a valid event. The complete WPN operator path is
  `scripts/stage_wpn_event_observations.py --promote`; `--bootstrap` is reserved
  for deliberately quiet initial inventory.
- WPN attention policy is now adapter-owned and intentionally sparse. The WPN
  adapter may annotate favorite-venue prereleases, favorite-venue Commander
  specials, and Commanderfest-style events for Signals; ordinary WPN arrivals
  stay as venue-grouped Updates. Multi-session weekends are collapsed to one
  attention marker per venue/event family to prevent Signal flood.
- Existing-event lifecycle handling is now part of the shared promoter through
  `reconcile_existing_event_lifecycle(...)`. It refreshes only safe same-
  schedule bound observations with null-safe optional facts, and queues review
  for changed upstream status/date/time/title/venue or WPN events missing from
  two consecutive snapshots. It does not silently cancel, delete, hide, or
  overwrite canonical Events when a source changes or gets sparse.
- Post-ingest event integrity is now a reusable executable checkpoint:
  `scripts/audit_event_integrity.py --fail-on-critical`. It checks canonical
  orphans, duplicate future slots, broken source/source-artifact links, broken
  observation bindings, WPN date/time/venue mismatches, and source-trail gaps.
  The 2026-08-02 checkpoint passed with zero critical issues. Review buckets
  remain intentionally presentation-aware: 5 date-only future listings, 33
  future occurrences inheriting series-level evidence, 41 no-proxy future
  events, 51 future events at personally deprioritized/low-fit venues, 42
  legacy WPN-backed future events with store-level WPN URLs only, and 11 benign
  title-key differences. The legacy WPN URL backfill is not deterministic yet:
  exact current observation/source matches returned zero, so do not fabricate
  event-level WPN URLs.
- A read-only reconciliation against the 2026-08-01 cache is captured in
  `docs/WPN_CANONICAL_RECONCILIATION_EXERCISE_2026-08-01.md`. It found 1,081
  exact-known-venue future WPN observations versus 118 canonical future dated
  occurrences: 640 strong exact title/schedule matches, 255 no-lane candidates
  compressing to 116 schedule clusters, 182 same-slot/lane title differences,
  and 4 multi-lane ambiguities. It also identifies deterministic enrichment to
  push back into the WPN adapter so the promoter stays fast. No data was written.
- Forward and reverse adversarial novelty audits are now built into
  `scripts/audit_wpn_novelty.py`. Against the July 23 snapshot, 209 strict
  clusters initially appeared novel, but only 101 were wholly new to WPN; 69
  new/no-analogue strict clusters compressed to 35 event families. Today's
  enriched observation state is a bootstrap baseline and must produce zero
  user-facing `NEW` badges. Separately, 650 observations classified as already
  represented produced zero detected suppression risks after normalized
  format, status, date-bound, team-size, and proxy-policy checks. This does not
  discard the 35 clear new/no-analogue families or same-lane specials: they
  remain promoter candidates, while source arrival, canonical action, and
  presentation novelty stay separate.

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

0. Continue the source-neutral event-ingest slice of
   `docs/CANONICAL_EVENT_INGEST_AGENT_DESIGN.md` from the proven deterministic
   creator. Exact attachment and collision-free new-series creation are complete
   and idempotent. Grouped Updates and explicit-attention Signals are complete.
   The first non-WPN adapter is now proven: clean confirmed standalone/finite
   official listings stage through `stage_official_event_observation(...)` and
   finish through the same promoter. Dry run wrote nothing; a fully rolled-back
   live proof returned canonical series/occurrence IDs, one grouped Update, and
   an idempotent replay. Official dated occurrences targeting an existing
   recurring series now also stage as normalized observations, retain the exact
   requested series ID, reconcile through the source-neutral targeted lane, and
   finish through the same promoter. The old direct recurring-occurrence writer
   is retired. The remaining direct WPN and official-event writers are retired,
   and targeted recurring reconciliation plus existing-event lifecycle review now
   run inside the promoter rather than in helper-side choreography. The
   post-ingest integrity audit is now available and should pass after future
   promoter changes. Do not build separate WPN/social canonical promoters.

## Immediate next work

1. Finish the bounded Discord surface-classification pass for already
   discovered, already approved communities only. The active target is
   channel/source mapping quality, not broad new discovery. Record HOT/WATCH,
   MAYBE, and IGNORE routes so future recurring review can read only the
   right channels instead of rescanning whole servers.
2. Treat LAGS as closed on ownership semantics: Los Angeles Gayming Society
   owns its community events; Precinct DTLA is host-location text only. Do not
   reopen that ownership question. Future work there is limited to display,
   routing, or evidence-link defects if the live UI disagrees.
3. Keep Community/Home/Event presentation work narrow and friction-driven:
   event-linked community Signals should open the event cleanly, grouped
   Updates should expose clickable event lists, and new community-owned events
   should not disappear behind unhelpful "promising" or venue-owned framing.
4. Use the lifecycle-specific Supabase selectors:
   `venue_baseline_candidates`, `venue_surface_retry_candidates`,
   `venue_surface_monitoring_candidates`, `venue_discovery_candidates`, and
   `venue_identity_resolution_candidates`. Markdown ledgers are context, not
   operational selectors. For queues shaped around the user's personal app
   preferences, use `venue_candidates_for_user(...)` so venues marked
   `deprioritize` or `hide` do not re-enter ordinary discovery, retry, or
   monitoring work.
5. Keep every runtime research task inside one explicit lane:
   `baseline pass`, `identity-resolution pass`, or
   `steady-state monitoring pass`. Time budgets and hard stop conditions live
   in `docs/EFFICIENCY_SOP.md`; a 5+ minute no-delta monitoring run or a 10+
   minute ordinary baseline run is a workflow failure, not a normal cost.

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
