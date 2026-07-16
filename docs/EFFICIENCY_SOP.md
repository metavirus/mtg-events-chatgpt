# Efficiency SOP

This document captures standing project-wide instructions for avoiding wasteful
cycles without degrading reliability.

The goal is not "move fast no matter what."
The goal is:

- preserve reliability
- preserve rollback safety
- preserve durable notes
- avoid repeating known low-value failure patterns

If a task deviates from this SOP, the run note or handoff should say why.

## Core principle

Use the cheapest reliable path that answers the current question.

That means:

- reuse existing normalized data before recollecting
- use source-specific SOPs before improvising
- use bounded first-pass work before deepening
- checkpoint before risky edits
- stop once the question has been answered

## Project-wide anti-waste rules

### 1. Reuse before recollect

Before doing fresh collection, check whether the answer already exists in:

- normalized app data
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

Important nuance: "bounded" does not mean "too shallow to be useful."
The first pass should usually be strong enough that the user could seriously
consider the store as a candidate and potentially add one of the surfaced
events to their calendar.

### 4. Promote before deepening

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

## UI/build efficiency rules

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

For canonical JSON specifically (`stores.json`, `events.json`, `sources.json`,
`changes.json`):

1. make the smallest edit batch possible
2. run the text-integrity check immediately
3. if it fails, stop and repair before any further substantive work

Do not stack additional research, synthesis, or reconciliation work on top of a
canonical JSON file that has not yet passed the immediate post-edit check.

### 4a. Prefer safer canonical JSON edit paths

When choosing how to touch canonical JSON:

- prefer tight file patches or other minimal-diff edits
- prefer UTF-8-preserving write paths
- avoid broad PowerShell content-rewrite flows unless there is a clear reason
- when a structured rewrite is needed, prefer `python.exe` over the `py`
  launcher in this workspace
- if a broad rewrite is unavoidable, treat it as a high-risk operation and
  validate immediately

The goal is to catch encoding drift at the earliest choke point rather than pay
for diagnosis and repair later.

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

If an important source seems blocked, spend one bounded recovery cycle before
accepting the blocker:

- verify whether the failure is source-side or tool-path-specific
- switch to the approved fallback path
- refresh stale browser/session state when applicable

Only preserve uncertainty after that bounded recovery cycle is exhausted.

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

Good pause points:

- a tranche completed
- a source pass completed
- a stable interpretation reached
- before risky edits

At a pause point, summarize clearly and stop.

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
