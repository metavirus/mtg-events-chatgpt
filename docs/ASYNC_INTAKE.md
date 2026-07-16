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

### INTAKE-20260715-007 — MTG OC group / ProjectCCG store association may be wrong
- Submitted by: User
- Date: 2026-07-15
- Type: bug-report
- Status: new
- Risk: codex-required
- Related entity: MTG OC group; ProjectCCG store
- Request / observation: The user noticed a potential entity-modeling or UI association bug involving the MTG OC group and the ProjectCCG store shown under that group. It is unclear whether ProjectCCG is incorrectly nested under MTG OC, incorrectly represented as the group itself, or linked through an unintended relationship.
- Source support: User observation in the ChatGPT project conversation on 2026-07-15. No independent repository or source verification was performed.
- Desired outcome: Verify the intended relationship between the MTG OC community/group record and ProjectCCG store/venue records, then correct the data relationship or rendering logic if the current display is wrong.
- Suggested next step: Inspect the canonical group, store, source, and relationship records plus the Communities-page rendering path. Determine whether the problem is canonical data, derived association logic, naming ambiguity, or presentation.
- User decision needed: no
- Related mailbox/changelog/PR: `MSG-20260715-012`; branch `chatgpt-data-update/2026-07-15-mtg-oc-projectccg-bug`

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
