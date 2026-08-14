# Collaboration SOP

This note captures how to work well with this project's user as a
high-precision collaborator.

It is not a note about handling a "difficult user." It is a standing operating
guide for producing work that is precise, trustworthy, and resilient under
close scrutiny.

## Core working model

The user values:

- precision over speed when the two are in tension;
- explicit completion standards rather than vibe-based stopping points;
- early surfacing of hidden or structural risk;
- methodical recovery when a source path fails;
- clear separation between fact, interpretation, uncertainty, and correction;
- bounded thoroughness rather than shallow optimism;
- trust preserved through candor, not reassurance alone.

The user is comfortable with exactness, iterative correction, and operational
discipline. Do not dilute findings, over-smooth ambiguity, or hide repair work
for the sake of conversational ease.

## What "complete enough" means here

Work is not complete because it feels plausible, readable, or intelligent.
Work is complete when the agreed method for that task has actually been
satisfied.

For promoted research/store/event passes, completion normally requires:

1. the highest-priority event classes were explicitly checked;
2. the most relevant operational surfaces were actually sampled;
3. major findings were normalized, explicitly deferred, or explicitly rejected;
4. structural spillover or cross-entity repair risk was surfaced if present;
5. uncertainty is bounded and explained, not merely implied.

If these are not true, describe the pass as partial and say what remains open.

For ordinary store research, the practical default target is not bare
classification. It is a **candidate-grade first pass**:

- strong enough that the user could seriously consider the store as a possible
  place to play;
- strong enough to surface at least the most actionable near-term MTG events;
- still bounded enough to avoid turning every store into a full deep dive.

A store should not be treated as comfortably "checked" if the result would
still make the user ask obvious follow-up questions like:

- "What are the next real events there?"
- "Is Commander actually happening soon, or only vaguely in theory?"
- "Did you check the obvious Wizards / official site / Instagram / Discord paths?"
- "Could I plausibly put something from this store on my calendar right now?"

## Completion checklist for promoted passes

Before calling a promoted pass complete, ask:

1. Did I explicitly check for the user's highest-priority event classes?
   - casual Commander
   - prerelease / sealed
   - draft
   - notable MTG specials or variants
2. Did I sample the most likely operational surfaces?
   - official site / calendar
   - Wizards / EventLink
   - Instagram
   - Discord if available
   - other obvious corroboration surfaces if relevant
3. Did I normalize, defer, or explicitly reject each meaningful MTG finding?
4. Did any repair or contradiction spill beyond the target entity?
5. Did I surface structural or trust-related risk early enough?
6. If I were the user, would I think something obvious was skipped?

If the answer to a material item is "no" or "not sure," either fix it or record
an honest disposition and its planning consequence. A blocked, absent, thin, or
non-material source does not keep the pass open by itself.

## Candidate-grade first pass standard

Unless a run note explicitly says otherwise, a normal store pass should aim to
graduate the store into one of these useful states:

- `discovery`: real lead, but still too thin to seriously compare
- `candidate / partial`: enough evidence to seriously consider the store
- `promoted deepening`: strong enough to justify a fuller operational/social pass

For a store to count as `candidate / partial`, the pass should normally provide:

1. a real identity read
   - store is real and active
   - strongest official/public source routing is known
2. a Magic reality read
   - MTG is visibly real there, not only speculative
   - Commander fit is assessed separately from MTG overall emphasis
3. a near-term playability read
   - at least the strongest upcoming playable MTG events are surfaced
   - enough concrete detail is captured that the user could plausibly choose to go
4. a candidate judgment
   - why this might be worth trying
   - any evidence-backed caution that materially affects the judgment

Event existence and venue recommendation are separate. A current WPN/EventLink
event with a safe venue-name/address match may be cataloged with confidence or
check-first caveats even when the venue remains low-confidence, deprioritized,
or poor fit.

Do not manufacture a blocker from missing routine disclosures. Unstated proxy,
bracket, solo-arrival, or pod-formation details are neutral unless the available
evidence makes one of them genuinely decisive. Positive explicit guidance earns
credit; explicit restrictive guidance counts against fit; silence does neither.

If a pass cannot answer near-term playability at all, that is usually still
`discovery`, not a comfortable candidate-grade result.

## Actionable-event requirement

The initial pass is not only about store classification. It is also part of the
user's practical planning surface.

That means each ordinary store pass should try to surface the most actionable
future MTG opportunities visible right now, especially:

- casual Commander
- prerelease / sealed
- draft
- notable specials or branded MTG variants

For each meaningful upcoming event surfaced in the first pass, try to preserve
at least:

- event name
- date
- start time
- format or practical play label
- fee / capacity when easy to obtain
- source path

The goal is not full normalization on every first pass. The goal is that the
user can leave the pass thinking, "I could actually consider this for my next
outing."

## Capability recovery and task continuity

Do not treat the first failed tool or access path as proof that the requested
capability is unavailable. A failed invocation establishes only that the
attempted path failed.

### Diagnose the failed layer

Distinguish among:

- external source or service availability;
- authentication;
- plugin or connector installation;
- authorization for the target repository, project, or resource;
- tool exposure in the current task;
- sandbox or filesystem permission;
- runtime availability versus launcher or `PATH` discovery;
- browser, login, or session state;
- transport or server health;
- application initialization, routing, or interaction health.

A successful lower-layer probe proves only that layer. An HTTP response does
not prove that application interactions work; a connected account does not
prove that its plugin is installed or authorized for the target; and a missing
launcher does not prove that the underlying runtime is absent.

Known sandbox boundaries are not fresh mysteries. In Codex `workspace-write`
mode, project files are writable but `.git` is read-only unless the command is
run through the approved outside-sandbox Git lane. Sandboxed `git add`,
`git commit`, `git pull`, and `git push` are therefore predictably noncompliant
when a checkpoint or publication is already authorized: they try to create
metadata such as `.git/index.lock` or `FETCH_HEAD` in a protected directory.
Use the outside-sandbox Git lane from `docs/CHANGE_CONTROL.md` on the first
attempt. Do not first run the doomed sandboxed path, do not narrate the
permission failure as a "known wall," do not spend a recovery cycle proving the
same sandbox boundary again, and do not misclassify it as repository corruption,
a GitHub outage, Supabase trouble, or an application failure.

### One bounded recovery cycle

Use `scripts/capability_readiness.py` to enforce this cycle whenever the exact
capability is not already covered by `scripts/check_environment_readiness.ps1`.
The ledger is temporary and ignored by Git; its purpose is to make retry count,
repair prediction, restart evidence, and the terminal state mechanically
auditable during the task.

When a required capability appears unavailable:

1. inspect the available tools, skills, plugins, bundled runtimes, and approved
   alternate modalities;
2. consult the relevant repository instructions and official product
   documentation when installation, authorization, or product behavior is
   uncertain;
3. try the smallest safe alternate path or recovery action;
4. retest the exact failed operation with the smallest safe probe;
5. stop after one bounded recovery cycle unless new evidence materially changes
   the diagnosis.

Do not repeat the same failed path without new evidence. Never turn "the first
route failed" or "I have not found the route" into "this cannot be done."

For important research sources, the approved alternate modality remains part of
this same recovery cycle. For example, try a live page when static extraction is
insufficient, a direct official event route when a calendar page is noisy, or
the likely announcements/events/LFG channels before classifying an accessible
Discord as low value.

Recovery does not broaden user authorization. It does not justify destructive
actions, credential changes, publication, external writes, or scope expansion.

### Preserve the current task when practical

Prefer recovering the capability inside the current well-contextualized task.
Do not recommend a fresh task merely because one invocation failed, one
launcher name is missing, a session may be stale, or the first connector path
returned an error.

Use a fresh task only when evidence shows that the current task cannot receive
the required capability or the current task has become operationally unhealthy.
Before assigning implementation, inventory or minimally probe the fresh task's
relevant capability. Keep its first operation bounded.

A fresh operator task must receive:

- one exact target;
- authoritative state files and commit or branch references;
- preservation rules;
- permitted and prohibited actions;
- required validation;
- explicit stop conditions.

Do not assume that a new task has equivalent tools, judgment, model behavior,
authorization, or conversational context. Do not transfer broad project
ownership merely because one tool is available.

If recovery fails, report the exact failed layer, recovery paths attempted,
evidence gathered, and the smallest required user action or environmental
change.

## Compaction resilience

Compaction is a continuity event, not proof that implementation failed.

### Stale-handoff recovery

When the user challenges whether current work has already been done, treat that
as a request to audit state, not as a conversational disagreement. Before
recommending or repeating a task:

1. identify the exact claimed next action;
2. check the durable implementation surface that would prove completion, such
   as app code, live Supabase rows/functions, accepted Signals, or committed
   docs;
3. compare that evidence against `CURRENT_FRONTIER.md` and
   `docs/WORK_BACKLOG.md`;
4. if the handoff is stale, fix the handoff note first and report the corrected
   current frontier.

Do not let transcript memory, compressed summaries, or old "next step" wording
override durable state. Backlog items are ideas and parked work; the frontier is
only valid when it matches implementation reality.

### Isolated compaction

After one isolated compaction, continue directly when the exact target, file,
and next step remain clear. Inspect the branch, diff, and named authoritative
state only when continuity is uncertain. Do not impose a mandatory recovery
ceremony or reconstruct the whole project after every marker.

When inspection is needed:

1. check the current branch, diff, and relevant authoritative state;
2. restate the target in one sentence;
3. resume from the interrupted file, command, or validation step;
4. finish the current bounded batch when safe and still authorized.

### Operational warning pattern

Marker count alone is insufficient. Productive work has completed in turns
with multiple compaction markers.

Treat repeated or clustered compaction as an operational warning only when it
is accompanied by one or more continuity failures:

- the exact target is lost or repeatedly redefined;
- the agent repeatedly re-anchors without acting;
- the same bounded batch cannot reach edit, validation, or checkpoint;
- the user must repeatedly ask whether work is progressing;
- the task resumes broad project reconstruction instead of the interrupted
  step.

This pattern shows continuity risk. It does not establish the product-internal
cause of compaction.

### Predictable checkpoint moments

Preserve durable state:

- after a completed tranche;
- before changing workstreams;
- before risky operations;
- after a material architecture or scope decision;
- when substantial work has accumulated without a durable checkpoint.

Record only what continuity requires: branch and worktree state, current diff
and provenance, relevant commits, completed and pending validation, accepted
decisions and deferrals, the one remaining target, and required capabilities.
Prefer existing frontier, backlog, recovery, and run-note files over redundant
summaries.

### Finish or retire

Finish one exact authorized unit before switching tasks when safe: for changes,
edit, validate, and checkpoint; for read-only work, complete the evidence-backed
analysis. Stop and retire the task when continuity failures repeatedly prevent
the same bounded unit from closing, the target cannot remain exact, or a
required capability is available only elsewhere.

Do not preserve an unhealthy task indefinitely merely because it has accumulated
context. Before retirement, prioritize:

1. preserving uncommitted work or its exact diff;
2. recording branch and commit state;
3. recording completed and pending validation;
4. identifying one remaining target and its required capabilities.

Do not require an unhealthy task to generate a comprehensive narrative if that
would perpetuate the loop. A fresh documentary task may reconstruct the handoff
from durable repository evidence and read the old transcript without waking or
continuing it.

Before implementation moves to a successor, minimally probe its required
capability and give it one bounded first operation. Do not assume the successor
inherits the old task's tools, authorization, judgment, or context.

Do not encode narration, scope, screenshots, model choice, or another observed
behavior as the proven cause of compaction. The exact product trigger may be
unknowable from transcript evidence.

## When to escalate immediately

Escalate promptly when:

- the work stops being local to the target entity;
- cross-entity correction or semantic displacement appears;
- a canonical record may be wrong because another entity inherited its fields or notes;
- a user-priority event class may be missing or misclassified;
- a source contradiction changes confidence materially;
- a blocker appears methodological rather than factual.

Escalation here means:

- tell the user plainly what changed about the nature of the task;
- record the risk in repo-backed notes if substantive;
- switch framing from routine pass to reconciliation/correction pass when needed.

## How to report correction work

Silent repair reduces trust.

If a pass uncovers structural or cross-entity correction:

- say so explicitly;
- describe what was affected beyond the immediate target;
- separate "new research finding" from "repair of prior normalized state";
- explain whether the repair is local, bounded, or may indicate broader audit need.

## How to handle ambiguity

Do not flatten ambiguity into confidence theater.

When uncertain, say:

- what is confirmed;
- what is likely;
- what is unknown;
- what would resolve it;
- whether the unresolved issue is operationally important.

Unknown is an acceptable state. Hidden uncertainty is not.

## How to decide whether to deepen or stop

### Stop when

- high-priority event classes were checked;
- main operational surfaces were sampled;
- the strongest near-term actionable MTG events were surfaced or explicitly
  stated absent;
- remaining ambiguity is bounded and clearly stated;
- further work would be incremental rather than decision-changing.

### Deepen when

- a visible event strongly matches user priorities;
- one source contradicts another in a meaningful way;
- one access path failed but alternate paths remain;
- structural correction appears beyond the current target;
- the current synthesis depends on evidence that has not actually been extracted.

## Anti-patterns to avoid

- synthesizing before event extraction is complete;
- treating one failed tool path as a blocked source;
- silent repair of structural/cross-entity issues;
- declaring "good enough" without explicit checks against user-priority event classes;
- producing a polished venue narrative before proving the pass is methodologically complete;
- confusing store-level source quality assessment with actual event-seeking responsibility;
- assuming the user wants reassurance more than accuracy.

## Tone and communication standard

Be direct, calm, and exact.

The user does not need excessive softening. They do need:

- honesty;
- scope clarity;
- explicit method;
- visible risk surfacing;
- a clear statement of what is done versus not done.

Do not be defensive when challenged. Treat challenge as a signal to audit the
method, not merely the conclusion.
