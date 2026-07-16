# Async Intake Queue

This queue accepts sourced discoveries, research questions, product ideas,
small corrections, and user requests from ChatGPT, Codex, or the future app.
It is triage input, not canonical data and not authorization to execute risky
changes.

## Rules

- Use one item per decision or outcome.
- New entities are always `candidate-discovery`; do not add them to canonical
  JSON until Codex deduplicates, researches, and promotes them.
- Include URLs or precise source descriptions for factual claims.
- Keep raw brainstorming separate from an asserted fact.
- Codex or a future daily agent may resolve easy safe items, research promoted
  candidates, or mark items `waiting-user` when a decision is needed.
- Significant durable work should also be represented in
  `docs/WORK_BACKLOG.md`; this file is the intake funnel, not its replacement.

## Status and type values

- Status: `new`, `triaged`, `in-progress`, `waiting-user`, `resolved`, `declined`
- Type: `candidate-discovery`, `research-follow-up`, `data-correction`,
  `product-idea`, `bug-report`, `watch-request`, `documentation`
- Risk: `safe-documentary`, `candidate-only`, `codex-required`

## New / active items

### INTAKE-20260715-008 — Do not treat omitted store details as scoring blockers
- Submitted by: User
- Date: 2026-07-15
- Type: research-follow-up
- Status: new
- Risk: codex-required
- Related entity: store scoring and research methodology
- Request / observation: Refine the statement `The decisive unresolved is solo-arrival/pod formation.` That wording is too strong and should not prevent a store score. Store information is predictably incomplete: many stores do not state Commander brackets, proxy policy, solo-player support, or pod-formation practices. Missing language should remain unknown rather than count as adverse evidence or a decisive unresolved. Affirmative positive evidence in these areas should still be captured and should improve notes, confidence, and analysis.
- Source support: Direct user methodology correction in the ChatGPT project conversation.
- Desired outcome: Update the research/scoring methodology so scores can be assigned from the available evidence without requiring explicit statements on every desired dimension. Preserve uncertainty, reward affirmative evidence, and distinguish omission from negative evidence.
- Suggested next step: Codex should locate the quoted or equivalent wording, revise the applicable methodology and scoring guidance, and review existing records for places where missing solo-arrival, bracket, or proxy information was treated as a blocker or implicit negative.
- User decision needed: no
- Related mailbox/changelog/PR: `MSG-20260715-013`; `chatgpt-data-update/2026-07-15-scoring-unknowns-methodology`; PR pending

<!-- Copy this block for each item.
### INTAKE-YYYYMMDD-NNN — Short title
- Submitted by: User / ChatGPT / Codex / app
- Date:
- Type:
- Status: new
- Risk:
- Related entity: existing ID, candidate name, page, or none
- Request / observation:
- Source support:
- Desired outcome:
- Suggested next step:
- User decision needed: no / question
- Related mailbox/changelog/PR:
-->

## Waiting for user

Items move here only when a specific decision blocks useful progress.

## Resolved / declined

Preserve the original item and add:

- Disposition:
- Resolved by/date:
- Canonical files or PR:
