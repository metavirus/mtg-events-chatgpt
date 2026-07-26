# Efficiency SOP

This document captures standing project-wide instructions for avoiding wasteful
cycles without degrading reliability.

The goal is not "move fast no matter what."
The goal is:

- preserve reliability
- preserve rollback safety
- preserve durable notes
- avoid repeating known low-value failure patterns

This is a one-person hobby app. Temporary app or display breakage is acceptable
when it is reversible and obvious. The expensive failure mode is burning large
amounts of time preserving redundant fallback/process layers that do not
materially improve trust.

If a task deviates from this SOP, the run note or handoff should say why.

## Core principle

Use the cheapest reliable path that answers the current question.

That means:

- use Supabase as the canonical operational research source
- use source-specific SOPs before improvising
- use bounded first-pass work before deepening
- checkpoint before risky edits
- stop once the question has been answered

Platform readiness is a hard gate, not a background inconvenience. When a
runtime, connector, browser, network, authentication, or CLI failure is
identified as an environment problem, the current tranche becomes capability
repair only. Do not keep researching, redesigning workflow, expanding proposals,
or inventing workaround-heavy ordinary operation while the platform is half
ready. Resume useful work only when the exact capability is `READY`, or stop
with one exact external dependency named.

Generated JSON/export files are recovery/debug artifacts, not a normal research
surface. Do not compare against, refresh, or reason from JSON during ordinary
batches unless the task is explicitly about fallback/export behavior or the
latest suitable Supabase export is the chosen validation basis.

Event existence and venue recommendation are separate judgments. A current
WPN/EventLink event with a safe venue-name/address match should ordinarily be
cataloged. Venue messiness, low confidence, bad fit, no-proxy, or high power
belongs in metadata, ranking, cautions, and default visibility—not silent
omission. `research/SOURCE_SOP.md` is the canonical rule.

## Manual bounded batches and future automation compatibility

Manual bounded batches are for canonical promotion and judgment, not broad
survey forever. When a pass finds useful but not-yet-canonical material,
preserve it as a structured observation, candidate Signal, named TBD, or
coordination item instead of leaving it only in chat memory.

Close a batch once the material planning conclusion is clear. Do not keep
harvesting blocked social/source surfaces just because they exist; disposition
them honestly and move on. If a future automated agent provides observations,
the reviewing task's job should be to review, promote, or disposition them through the
controlled workflow, not redo discovery from scratch.

Simple user-decision questions should eventually live in the app or the
coordination queue as bounded prompts, so Kavi is asked crisp questions rather
than having to babysit an open-ended task.

## Project-wide anti-waste rules

## Runtime lane contract

Future research/runtime work must fit one explicit lane. If a run begins in one
lane and starts doing the work of another, stop and either close it or
reclassify it explicitly before continuing.

### 0. Allowed lane shapes

- `baseline pass`: one decision-grade first pass for an `unreviewed` venue.
- `identity-resolution pass`: one bounded attribution/status pass for an
  `identity_blocked` venue or a named branch/location ambiguity.
- `steady-state monitoring pass`: one exact-surface delta check for a
  `steady_state` venue.

Do not invent a fourth "light research" shape that quietly behaves like a full
main pass.

### 1. Baseline pass contract

Allowed work:

- select only from `venue_baseline_candidates`;
- reuse the current WPN cache when it is within policy;
- check the standard decision-grade surfaces or record their disposition:
  official/storefront, WPN/EventLink, event/calendar page, discoverable
  store-controlled social, known/discoverable Discord/community route status,
  and review texture when useful;
- determine whether current attributable event rows should be captured, deferred,
  caveated, or rejected;
- produce one decision-grade venue read: try soon, worth watching, backup, low
  priority, avoid/poor fit, or identity/status unresolved.

Hard stop conditions:

- once identity is safe enough, material event lanes are checked/dispositioned,
  and the planning conclusion is clear;
- once remaining missing surfaces are thin, blocked, quiet, or non-material;
- once the work would mainly be re-trying fetches, chasing extra texture, or
  reopening already dispositioned surfaces.

Failure condition:

- if the run starts reconstructing broad source maps from scratch after the core
  surfaces are already checked/dispositioned, or keeps digging because a social
  surface is imperfect, the lane has failed and should stop.

Expected budget:

- target: 5 to 8 minutes per venue;
- soft ceiling: 10 minutes;
- beyond 10 minutes means the pass should either close with named uncertainty or
  be explicitly escalated as identity-resolution/high-risk work.

### 2. Identity-resolution pass contract

Allowed work:

- select only from `venue_identity_resolution_candidates` or a named active
  identity blocker;
- answer one bounded question such as branch relationship, current operating
  identity, location continuity, or safe event attribution boundary;
- use non-Discord public identity sources first unless a safely mapped Discord
  route is already the accepted evidence path;
- capture attributable WPN/EventLink events when identity is safe enough for
  this app, even if the venue remains low-confidence or poor fit.

Hard stop conditions:

- once the venue is safe enough to treat as attributable, or once the exact
  blocker is named precisely enough that future work will not rediscover it;
- once continued work would be broad venue research rather than identity
  clarification.

Failure condition:

- if the pass drifts into a full venue refresh without first settling the
  identity boundary, it has failed its lane.

Expected budget:

- target: 5 to 10 minutes total;
- soft ceiling: 12 minutes;
- beyond 12 minutes requires an explicit pause and restatement of the unresolved
  identity question.

### 3. Steady-state monitoring pass contract

Allowed work:

- select only from `venue_surface_monitoring_candidates` or an exact mapped
  surface with a due retry/monitoring condition;
- reuse existing venue context instead of reconstructing the full source map;
- inspect only the one or two highest-value changed surfaces;
- record quiet/thin/blocked/current/useful outcomes through
  `record_entity_surface_check(...)`;
- escalate only if a real delta appears: new event candidate, event retirement,
  source-health contradiction, meaningful assessment change, or Signal-worthy
  planning intelligence.

Hard stop conditions:

- once the due mapped surface is checked and recorded;
- once no material delta is present;
- once a material delta is found and the work must escalate into reviewed event
  or assessment mutation.

Failure condition:

- if a monitoring run reopens a whole-store pass, reconstructs the source map,
  or rechecks adjacent blocked surfaces "while we're here," it has failed.

Expected budget:

- target: under 2 minutes per venue;
- soft ceiling: 3 minutes;
- any 5+ minute steady-state check is a workflow failure, not an acceptable
  normal run.

### 1. Reuse before recollect

Before doing fresh collection, check whether the answer already exists in:

- Supabase canonical records or a recent explicit Supabase export used only as
  a validation basis
- raw source snapshots
- prior run notes
- source-routing notes
- methodology/SOP files

Do not rediscover information already durable in the repo unless:

- freshness is materially important
- the prior record is suspicious
- or the task explicitly requires a new live check

### 2. Source-specific SOPs win over improvisation

If a source has a dedicated SOP, use it.

Current dedicated SOPs:

- [research/WIZARDS_LOCATOR_SOP.md](C:/Users/kavig/Documents/Codex/mtg-events-chatgpt/research/WIZARDS_LOCATOR_SOP.md)
- [research/INSTAGRAM_SOP.md](C:/Users/kavig/Documents/Codex/mtg-events-chatgpt/research/INSTAGRAM_SOP.md)
- [research/DISCORD_SWEEP_SOP.md](C:/Users/kavig/Documents/Codex/mtg-events-chatgpt/research/DISCORD_SWEEP_SOP.md)
- [research/SOURCE_SOP.md](C:/Users/kavig/Documents/Codex/mtg-events-chatgpt/research/SOURCE_SOP.md)

Do not spend cycles re-learning a source in an ordinary pass.

### 3. First pass is bounded by default

A normal first pass should answer:

- is this real?
- is MTG real here?
- is Commander real here?
- what are the best source routes?
- what are the strongest near-term actionable MTG events?
- does this stay discovery, move to partial, or deserve deeper follow-up?

If those are answered, stop.

Do not deepen during first pass unless the place is clearly promoted.

Decision-grade is the target, not exhaustive. Leaner process must not lower the
research quality bar. A corrected main pass should still deliberately consider
the obvious planning surfaces:

- official site/storefront
- Wizards/EventLink
- store event/calendar page
- Instagram/Facebook or store-controlled social routes when discoverable
- Discord/community route status when known or discoverable
- Google/Yelp/review texture when useful
- Commander, draft, prerelease/sealed, FNM, and special events
- Places implications and Evidence visibility

The leaner rule changes how absent, blocked, thin, quiet, or unreliable surfaces
are handled: record a clear disposition and move on once the rest of the
evidence supports a decision-grade read. It does not permit skipping major
surfaces just because they are annoying.

A corrected main pass should usually classify a store as one of:

- try soon
- worth watching
- backup
- low priority
- avoid / poor fit
- identity or status unresolved

Missing Instagram, Facebook, Discord, review texture, or another optional
surface is not automatically an open research gap. It affects confidence,
priority, and named TBDs. Use precise dispositions such as route not found,
route found / content not inspected, gated or blocked, content thin / no useful
current signal, or specific later TBD if it could materially change the store
read. Once the material planning conclusion is clear, record the source
disposition and close the batch.

Important nuance: "bounded" does not mean "too shallow to be useful."
The first pass should usually be strong enough that the user could seriously
consider the store as a candidate and potentially add one of the surfaced
events to their calendar.

### 4. Close once, then monitor exact surfaces

The database lifecycle is finite:

- `unreviewed`: no decision-grade baseline yet;
- `baseline`: one bounded decision-grade pass is active;
- `targeted_closure`: one specific second pass is active;
- `steady_state`: holistic research is finished;
- `identity_blocked`: attribution is unsafe pending a named identity trigger.

Database constraints cap ordinary holistic passes at two. A third pass is an
exception that must be linked to an active coordination item for a material
identity/status change or an explicit user request.

After `steady_state`, monitoring selects exact mapped surfaces, never the venue
as a whole. Each surface carries its own cadence, cursor/fingerprint, retry
state, and latest result. Discovery of new venues/surfaces is a separate weekly
lane.

Retries are finite. One automatic retry is the norm. Repeated
`unavailable`, `not_publicly_readable`, `access_gated`, or
`no_useful_content` results become terminal and reopen only when the access or
source condition changes or the user explicitly requests it. Do not reconstruct
the venue source map to service a surface retry.

Use the lifecycle-specific candidate views. Do not recreate a single mixed
"research candidates" queue.

Selector rule:

- ordinary holistic work may only start from `venue_baseline_candidates`;
- identity work may only start from `venue_identity_resolution_candidates` or a
  named active blocker;
- monitoring may only start from `venue_surface_monitoring_candidates` or a
  directly named mapped surface.

If a `steady_state` venue appears in ordinary holistic selection, treat that as
an operational bug and stop to correct selection rather than researching it.

### 5. Promote before deepening

### 6. Match research validation overhead to batch risk

Classify each research/data batch before applying it:

- Routine surface check: source availability, thin/blocked/quiet disposition,
  or no-action confirmation with no event/evaluation/Signal/identity change.
  Record directly through `record_entity_surface_check`; no proposal, repo
  artifact, text check, or commit.
- Routine Refresh / Lean: source/evaluation wording changes or other bounded
  canonical updates that exceed a surface check but have no new/retired events,
  identity conflict, Signals, schema, or app changes. Use affected-row readback
  and no broad app preview. Temporary connector SQL is execution material, not
  durable evidence.
- Standard Main Pass: new event rows, event retirements, meaningful Places or
  evaluation changes, source-health contradictions, Signals, or
  Discord/community content that materially changes planning. Use the normal
  proposal, review, apply, verify, and ledger pattern.
- High-Risk: identity merges or splits, branch/location corrections, schema,
  auth/RLS, Discord safety/access changes, bulk writes, or anything that can
  corrupt trust. Full ceremony is justified.

The point is lower overhead, not weaker research. Discord/community surfaces
still need an explicit disposition in main-store work: inspect them when safely
mapped and material; otherwise mark route/TBD, gate, not found, or deferred.

Do not run local preview/deploy checks for data-only changes unless rendering
risk is plausible or the user asked for a product check. Targeted Supabase
readback is usually enough.

Deeper work should happen only after explicit promotion due to:

- strong initial signals
- favorite status
- user priority
- contradiction/correction need
- exceptional fit potential

This protects budget from low-value rabbit holes.

### 5. Manual UI is usually exception path

For finicky systems, prefer stable collection paths over browser poking.

Current example:

- Wizards locator should be treated as API-first, UI-last.

When a source has a reliable structured path, use that by default.

### 6. Preserve ambiguity instead of over-resolving

If a fact is not cleanly knowable in the current pass:

- record uncertainty
- preserve the gap
- move on

Do not burn cycles trying to turn every ambiguity into certainty.

If a source fetch path is blocked, record the blocked/TBD state and move on
unless that exact source is necessary for the current decision. Do not keep
chasing Instagram/Facebook/social fetch workarounds once the planning conclusion
is already clear.

### 7. Proposal-heavy drift is a failure mode

Ordinary runtime work should not drift into proposal-heavy ceremony unless the
actual mutation risk requires it.

- surface-only outcomes: RPC path only;
- routine monitoring with no material delta: no proposal, no repo ceremony;
- reviewed event/evaluation changes: proposal only once a real delta exists;
- high-risk identity/schema/auth work: full reviewed path.

If a run is spending most of its time on package generation, manual ferrying,
or re-narrating low-risk no-delta work, treat that as a workflow failure to be
fixed separately rather than a normal cost of research.

## UI/build efficiency rules

### 0. Default to direct bounded execution

Do not delegate ordinary implementation merely because the work is called
implementation.

Perform low-effort work directly in the current task.

Also perform straightforward Medium-effort UI, documentation, validation, and
narrow debugging directly when the scope is exact and the relevant files are
known.

In the user's current workflow, this chat often acts as the orchestrator and
may also execute small bounded changes directly. A separate steward chat should
be used only when it is expected to reduce total context load or protect this
chat from compaction risk. Do not spend tokens designing a solution here and
then ask the steward to rediscover it. If a steward handoff is needed, send one
authoritative instruction with the target, current commit, allowed actions,
forbidden actions, validation, and stop condition.

Use a worker only when it provides a concrete advantage, such as:

- a specialized capability unavailable in the current task;
- large research collection;
- bulk or repetitive processing;
- isolated context that materially protects task continuity;
- work expected to generate substantial tool output;
- independent verification justified by risk.

Before delegating, ask:

- Can this be completed safely in one bounded direct pass?
- Does a worker have a capability or efficiency advantage?
- Would delegation avoid more context than it creates?
- Is the likely worker output worth the orchestration overhead?

If those answers do not support delegation, execute directly.

Steward handoff packet, when delegation is justified:

- current branch and commit;
- one-sentence objective;
- exact files, tables, or Supabase functions in scope;
- allowed actions and explicitly forbidden actions;
- validation commands or readbacks required;
- hard stop condition and reporting format.

When a worker is used:

- do not poll repeatedly;
- inspect once after a reasonable bounded interval;
- distinguish quiet progress from an actual stalled state;
- interrupt only when there is no active operation, no artifact or diff, and no
  meaningful progress signal;
- preserve any worker changes before taking over;
- do not restart the same work in another worker.

Keep direct implementation bounded:

- one coherent outcome;
- targeted inspection;
- proportionate validation;
- one commit/push;
- concise final report;
- no unrelated continuation.

If direct implementation begins accumulating broad context, tool-heavy research,
or multiple workstreams, stop and delegate the next bounded unit rather than
allowing the current task to become another giant implementation task.

### 1. Checkpoint before non-trivial edits

Before non-trivial UI, styling, or data-shape changes:

1. create a checkpoint
2. make the smallest scoped change possible
3. validate only the target behavior
4. stop before optional polish

This rule already exists in
[docs/CHANGE_CONTROL.md](C:/Users/kavig/Documents/Codex/mtg-events-chatgpt/docs/CHANGE_CONTROL.md)
and is restated here because it is also an efficiency rule, not only a safety rule.

### 2. Do not mix targeted fix and polish

If the task is:

- fix one bug
- change one label
- repair one interaction

then do only that.

Do not add opportunistic cleanup in the same uninterrupted work stretch.

### 3. "User says it looks great" is a hard checkpoint moment

When the user indicates that the build is working well, treat that as:

- checkpoint now
- no speculative cleanup
- no broad polish pass without a fresh protection point

This is now a standing rule because we already paid for violating it.

### 4. Encoding / formatting / broad text rewrite caution

The prior interface regression burned significant budget and is now a permanent
warning category.

Treat these as high-risk changes even when they look small:

- encoding normalization
- global string cleanup
- typography/base-font refactors
- wide search/replace on UI text
- "quick polish" after approval

For any of the above:

1. checkpoint first
2. isolate the smallest file set possible
3. validate visible text immediately
4. stop if odd characters, icon drift, spacing drift, or font drift appears

Do not keep piling fixes onto a corrupted state.

Generated JSON recovery/export files are not edited as research data. If an
explicit export/debug task regenerates them, use the controlled exporter and run
the ordinary text-integrity check; do not create a parallel JSON editing SOP.

### 5. Roll back early, not late

If a change introduces regressions:

- stop adding more edits
- compare to the last accepted state
- restore or reapply narrowly

Do not attempt an improvised forward-only rescue when rollback is cheaper and safer.

## Research efficiency rules

### 1. Durable note first, perfect interpretation second

When a meaningful result appears, get it into the repo.

Do not hold too much value only in chat context.

If the work uncovers structural correction risk affecting records beyond the
current target, surface that immediately in the user update and in the durable
note before resuming ordinary research. Do not silently fold cross-entity repair
work into a routine pass summary.

### 2. Record source failures once

If a source is:

- blocked
- stale
- low yield
- noisy
- login-gated

record that result and move on.

Do not repeatedly retest the same dead end in the same tranche unless something changed.

### 3. Separate collection from synthesis

Do not alternate endlessly between:

- collecting one small fact
- rewriting the whole interpretation
- collecting one more small fact

Collect a bounded tranche, then synthesize.

But do not synthesize from memory when a high-value source is visibly richer
than your current notes. Re-open the source and perform one explicit extraction
check for the user's highest-interest event classes before finalizing.

If an important source seems blocked, use the one bounded recovery cycle in the
Capability and Compaction Checklist below. Distinguish source-side failure from
tool-path or session failure, use the approved fallback, and preserve
uncertainty only after that bounded cycle is exhausted.

### 4. Use promotion tiers

Think in tiers:

- discovery
- partial
- promoted deep-dive
- favorites / high-frequency monitoring

Not every place deserves the same amount of effort.

### 5. Preserve "good enough for now"

Some findings are sufficient for operational use without being exhaustive.

This does not apply to clearly visible high-priority event classes already named
in project context, especially Commander, draft, sealed, and prerelease. When
those appear in an official source, "good enough" includes explicitly deciding
whether they were normalized or intentionally deferred.

The same principle applies across operational social surfaces. If Instagram,
Discord, or another official channel visibly carries those event classes, "good
enough" still requires an explicit normalize-or-defer decision.

Examples:

- Wizards confirms recurring Commander exists
- Instagram confirms current MTG activity
- Discord confirms the server is real but sparse

That may be enough for a first-pass classification.

But if obvious near-term playable MTG events are visible on standard sources,
first-pass efficiency still requires surfacing them. It is wasteful to save a
few minutes during the pass only to force the user to do the obvious QA and ask
for the same source sweep again.

## Conversation efficiency rules

### 1. Pause at clean handoff points

Checkpoint at predictable moments:

- a tranche completed
- a source pass completed
- a stable interpretation reached
- before changing workstreams
- before risky operations
- after a material architecture or scope decision
- when substantial work has accumulated without a durable checkpoint

A checkpoint preserves durable state. Stop and yield to the user only at an
appropriate user-facing handoff, when requested, when blocked, or before an
action requiring new authority. Otherwise, checkpoint and continue when the
current authorized task still has safe work remaining.

### 1a. Capability and compaction checklist

When a capability appears unavailable:

1. identify the failed layer precisely;
2. inspect available tools, skills, plugins, runtimes, and approved alternate
   paths;
3. consult official documentation when setup or authorization is uncertain;
4. perform one bounded recovery cycle;
5. retest the exact operation with a minimal safe probe;
6. do not repeat the same failed path without new evidence.

When compaction occurs:

1. continue directly if the exact target, file, and next step remain clear;
2. inspect branch, diff, and authoritative state only if continuity is
   uncertain;
3. avoid broad rereads, project reconstruction, and repeated re-anchoring;
4. finish one exact authorized unit; for changes, edit, validate, and
   checkpoint; for read-only work, complete the evidence-backed analysis; then
   report concisely;
5. treat marker count alone as insufficient; act on repeated or clustered
   markers only when accompanied by lost target, repeated re-anchoring, failure
   to close the batch, repeated user status checks, or broad reconstruction;
6. if those continuity failures persist, preserve the exact diff, branch and
   commit state, validation state, remaining target, and required capabilities,
   then retire the unhealthy task;
7. before assigning implementation to a successor, inventory or minimally
   probe its required capability and keep its first operation bounded.

Do not require an unhealthy task to produce a comprehensive history. A fresh
documentary task can reconstruct a handoff from durable repository evidence and
the old transcript without waking it.

Compaction does not prove implementation failure. Recovery and persistence do
not broaden authority, scope, publication rights, credential access, or
permission for destructive actions.

### 2. Name the operating mode

When useful, explicitly frame the current mode:

- strict first pass
- promoted deepening
- targeted fix
- checkpoint
- polish

This reduces drift.

### 3. Do not hide uncertainty

It is cheaper to say:

- "this is enough to classify as partial"
- "this remains ambiguous"
- "this needs later verification"

than to spend extra cycles pretending every answer must be complete now.

## Required self-check before continuing a long stretch

Ask:

1. Am I recollecting something already durable?
2. Am I using the source's best-known path?
3. Am I still in first-pass scope, or have I drifted into deepening?
4. If this is build work, do I have a checkpoint?
5. If a regression just appeared, is rollback cheaper than repair?
6. Have I already answered the user's actual question?
7. If I were the user, would I feel this store is genuinely "checked" or only
   half-looked-at?

If the answers show drift, pause and correct course before continuing.

## Specific standing lessons from this project

These are now permanent standing instructions:

- Treat accepted UI states as sacred until checkpointed.
- Do not do speculative polish after the user has approved a working state.
- Encoding/text cleanup can be deceptively high risk.
- Wizards should be queried through the stable structured path, not rediscovered through the website UI.
- Instagram and Discord should be handled through bounded SOPs, not free-form browsing.
- Research depth should be earned through promotion, not assumed by default.

## Bottom line

Efficiency in this project means:

- fewer repeated mistakes
- fewer re-learned source paths
- fewer speculative edits after success
- more checkpoint discipline
- more bounded passes
- more durable notes

That is the standard from here forward.
