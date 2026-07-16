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

If the answer to any of these is "no" or "not sure," the pass is not complete.

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

## Source-path failure rule

Do not treat one failed access path as equivalent to a blocked source.

Always distinguish:

- source unavailable;
- current access path unavailable;
- current tool/session/browser state unavailable;
- source available but not yet recoverably readable.

### Required recovery behavior

If an important source does not work on first try:

1. confirm whether the source itself is truly down or only the current path failed;
2. try the approved alternate modality for that source;
3. recover session/browser state if there is reason to think the page is stale,
   collapsed, lazy-loaded, login-sensitive, or fetch-limited;
4. only then preserve uncertainty and move on.

Do not move on while obvious, bounded recovery modalities remain available.

### Examples

- If the static fetch path does not expose an event but a live page likely will,
  try the live page path before declaring the source weak.
- If one website subpage is noisy or partially rendered, inspect the direct
  event page, calendar view, or alternate official route before concluding the
  event is unavailable.
- If Discord is accessible but one channel view is thin, check the most likely
  announcements/events/LFG surfaces before concluding the server has little value.

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
