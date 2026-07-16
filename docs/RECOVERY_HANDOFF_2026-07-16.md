# Recovery Handoff - UX Mega Revision

Date: 2026-07-16

## Purpose

This document combines durable repository evidence with the recovered old-task
handoff. It is a recovery checkpoint, not an implementation-completion claim.
Where the two evidence classes differ, repository evidence controls repository
state and the transcript is preserved only as a report of prior task activity.

## Repository and branch state

- **Verified by repository evidence.** The active branch is
  `codex/reconcile-wizards`, tracking `origin/codex/reconcile-wizards`.
- **Verified by repository evidence.** Before this document was created, the
  worktree was clean and the branch tip was
  `9a2bdc7fbb59054126c1c745f510c0531c638a01`, `Fix series default start time
  mapping`, committed 2026-07-16 at 15:09:35 PDT.
- **Verified by repository evidence.** The branch began as a Wizards
  reconciliation branch but now contains research, interface, coordination,
  deployment, integrity, and Supabase work.
- **Reasonable inference.** The inherited branch name no longer describes the
  full scope. Existing backlog guidance calls for a later deliberate branch
  hygiene transition, not an opportunistic rename during recovery.

## Objective and expansion

- **Verified by repository evidence.** The original branch objective was to
  reconcile a Wizards Store & Event Locator snapshot into reviewable evidence
  and provisional normalized store and recurring Commander records.
- **Verified by repository evidence.** The active objective later became a
  defined UX mega revision: make the research-heavy app a practical daily Magic
  decision tool while retaining the complete event catalog and preserving the
  JSON-to-Supabase migration boundary.
- **Reported by the old-task transcript.** Compaction interrupted reliable
  completion of the larger interface tranche. Repeated narrative descriptions
  of UI patching must not be treated as proof of implemented or accepted code.
- **Unverified or still requiring acceptance.** The broader UX mega revision is
  not recorded as complete. Its authoritative backlog remains
  `docs/UX_MEGA_REVISION_SCOPE.md` together with the current implementation,
  frontier, and migration documents.

## Completed and committed foundation

- **Verified by repository evidence.** The repository contains an initial
  Supabase schema, seed snapshot, migration checkpoint, and an opt-in read
  adapter in `app.js`.
- **Verified by repository evidence.** JSON remains the default source.
  `?data=supabase` enables Supabase research reads, and a failed Supabase read
  falls back to JSON.
- **Verified by repository evidence.** The migration checkpoint records verified
  imported counts of 55 venues, 3 communities, 97 event series, 10 dated event
  occurrences, 145 sources, and 34 research changes, plus relationship and
  evaluation tables.
- **Verified by repository evidence.** The repository documents separate data
  planes for research truth, private personal continuity, and private workflow
  requests.
- **Verified by repository evidence.** The intended eventual hosted home for
  favorites, dislikes, ratings, notes, attendance state, unread state, and
  `Ask Codex` requests is documented without claiming that authenticated writes
  have shipped.
- **Verified by repository evidence.** Current code already contains recurrence
  normalization, JSON fallback, browser-local personal-state scaffolding,
  favorite and rating interactions, score explanations, and a signals drawer
  for narrower layouts.
- **Unverified or still requiring acceptance.** The presence of these pieces
  does not establish that the complete Today, Events, Places, Updates, or
  Communities acceptance criteria have been met.

## Final false `Time TBD` defect

- **Reported by the old-task transcript.** In the Supabase path, Today and
  Events could display `Time TBD` for a dated series even though
  `event_series.default_start_time` held a usable value.
- **Verified by repository evidence.** Before the final commit,
  `mapEventSeries()` mapped `start_date` and passed `default_start_time` into
  recurrence normalization, but did not expose a top-level `startTime` on the
  UI event model. Occurrence mapping already used an occurrence time with a
  series-default fallback.
- **Reasonable inference.** The defect was an adapter-shape mismatch rather than
  missing Supabase time data or an absent recurrence mechanism.
- **Verified by repository evidence.** Commit `9a2bdc7` added exactly:

  ```js
  startTime: normalizeTime(item.default_start_time),
  ```

- **Reported by the old-task transcript.** Legitimate `Time TBD` behavior was
  intended to remain when no usable occurrence, recurrence, or default start
  time exists.
- **Unverified or still requiring acceptance.** No durable browser smoke-test
  record or representative Supabase/JSON behavioral parity result was found for
  this final fix.

## Validation evidence

- **Verified by repository evidence.** The July 15 direction audit records
  successful parsing of the four normalized JSON files, no duplicate venue,
  event, or source IDs, and no broken normalized venue/source/event references
  at that checkpoint.
- **Verified by repository evidence.** The repository sanity audit records a
  passing full-repository text-integrity validation after its normalization
  pass.
- **Verified by repository evidence.** The Supabase migration status records
  verified seed counts, a clean security-advisor result, and correction of the
  missing `entity_sources.source_id` index.
- **Reported by the old-task transcript.** After `9a2bdc7`, JavaScript syntax
  checking, full-repository text-integrity validation, and `git diff --check`
  reportedly passed.
- **Unverified or still requiring acceptance.** Those post-fix syntax and diff
  results were not found as durable test artifacts tied to the commit. No
  durable browser smoke test or representative Supabase/JSON parity result was
  found.

## Accepted but unfinished UX work

- **Verified by repository evidence.** Today must become a ranked decision
  surface with best-bet hierarchy, useful explanations, broad search, and quick
  Commander, prerelease/sealed, draft, favorite, weekend, and broader-interest
  controls without deleting the retained catalog.
- **Verified by repository evidence.** Events must remain the full catalog while
  gaining useful sorting, format filtering, scanability, week/month access, and
  clear distinctions for fit, evidence quality, specials, and deprioritized
  competitive events.
- **Verified by repository evidence.** Fresh Signals and For You must stay
  reachable at narrow widths through an obvious drawer or equivalent control.
- **Verified by repository evidence.** Places must present research status, fit
  grade, numeric score, confidence, and inspectable rationale consistently;
  personal preferences must affect ranking or visibility without changing
  research facts.
- **Verified by repository evidence.** Updates must use the intended label,
  provide meaningful unread behavior, improve typography and alignment, support
  useful categories, and link to affected records.
- **Verified by repository evidence.** Communities must surface actionable LFG,
  meetup, coordination, geography, activity, linked-venue, and next-action
  signals while remaining distinct from stores.
- **Verified by repository evidence.** The current pass may prototype personal
  and workflow interactions locally, but must describe browser storage as
  transitional rather than cross-device persistence.
- **Unverified or still requiring acceptance.** None of the preceding backlog
  items should be presented as completed until current code and focused
  behavioral validation satisfy the documented acceptance checks.

## Architectural boundaries and deferrals

- **Verified by repository evidence.** Research truth is browser-readable but
  must not be browser-writable. Personal continuity and workflow requests are
  private planes linked by stable entity IDs.
- **Verified by repository evidence.** Preferences may change ranking,
  filtering, and presentation but must not overwrite research evidence.
- **Verified by repository evidence.** Authenticated Supabase writes, final
  login/session UX, final RLS expansion, default Supabase cutover, removal of
  JSON fallback, autonomous agents, broad store re-research, deep Discord
  automation, and production publishing before local sanity review are deferred.
- **Unverified or still requiring acceptance.** Supabase must not become the
  default research source until representative parity and rollback behavior are
  explicitly accepted.

## Remaining risks and next closed loop

- **Verified by repository evidence.** Representative JSON/Supabase parity is
  still an explicit migration gate.
- **Unverified or still requiring acceptance.** The recurring-series time fix
  has code-level evidence but lacks a durable behavioral verification record.
- **Reasonable inference.** Resuming broad UX implementation before closing that
  small adapter loop would make later display failures harder to attribute.
- **Recommended next closed loop.** Perform a narrow behavioral verification of
  the recurring-event time fix using representative Supabase series with and
  without `default_start_time`; compare the corresponding JSON behavior; verify
  that known times render and genuinely unknown times remain `Time TBD`; record
  the result durably. After that, resume one bounded Today/Events discovery
  tranche and validate it against the existing acceptance criteria before
  claiming completion.

## Short chronology

- **Verified by repository evidence.** 2026-07-14 08:01 PDT: the parent commit
  established the initial app and Wizards crawler.
- **Verified by repository evidence.** 2026-07-14 09:15 PDT: the first Wizards
  Commander reconciliation promoted 18 stores and 32 recurring events while
  retaining unresolved organizations for review.
- **Verified by repository evidence.** 2026-07-14 11:31 PDT: reconciliation was
  expanded and the promotion utility and initial architecture documents were
  added.
- **Verified by repository evidence.** July 14-15: the branch accumulated
  cross-source research, UI checkpoints, governance corrections, deployment,
  coordination, and integrity guardrails.
- **Verified by repository evidence.** 2026-07-16 09:06-12:20 PDT: the current
  UI was checkpointed; the Supabase schema, seed, migration record, and opt-in
  read adapter were established.
- **Verified by repository evidence.** 2026-07-16 12:36-14:16 PDT: the UX mega
  revision and continuity boundaries were documented.
- **Verified by repository evidence.** 2026-07-16 15:09 PDT: `9a2bdc7` added the
  missing series `startTime` mapping.
- **Reported by the old-task transcript.** Syntax, text-integrity, and diff
  checks passed after that fix, but the larger UX tranche did not reach a
  reliable closed-loop completion before compaction.

## Evidence basis

This recovery note is based on the current branch history and diffs; current
`app.js`; `docs/UX_MEGA_REVISION_SCOPE.md`; `docs/IMPLEMENTATION_PLAN.md`;
`CURRENT_FRONTIER.md`; `docs/WORK_BACKLOG.md`;
`docs/SUPABASE_CONTINUITY_MODEL.md`; `docs/SUPABASE_MIGRATION_STATUS.md`;
existing audit and handoff records; and the old-task handoff supplied on
2026-07-16. The old-task handoff is transcript evidence, not a substitute for
repository state or durable validation artifacts.
