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

### INTAKE-20260715-005 — Explore instruction-file cache for ChatGPT sideload work

Outcome type: intake-only
Entity: ChatGPT sideload coordination workflow
Modality path used: repeated GitHub instruction reads -> user process proposal
Promotion status: Candidate queued for Codex review
Files changed: `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`
Branch / PR: `chatgpt-data-update/2026-07-15-instruction-cache-intake`; pending PR
Codex review needed: Decide whether and how to implement a safe cache keyed by repository, ref, and blob SHA.

- Submitted by: User
- Date: 2026-07-15
- Type: product-idea
- Status: new
- Risk: codex-required
- Related entity: ChatGPT sideload coordination workflow
- Request / observation: Repeatedly re-reading unchanged SOP and coordination files through GitHub adds latency. Explore a formal cache that first checks whether required instruction files changed and reuses previously read instruction summaries when they did not.
- Source support: User process proposal in the ChatGPT project conversation on 2026-07-15.
- Desired outcome: Reduce repeated GitHub retrieval overhead without allowing stale instructions to supersede the repository.
- Suggested next step: Design a cache or manifest keyed by repository, branch/ref, file path, and Git blob SHA. Re-read only files whose SHA changed. Invalidate the relevant cache when the ref changes, a required file is missing, a modality changes, a governing file adds dependencies, or current repo content conflicts with remembered instructions. Keep the repository authoritative and avoid a manually maintained duplicate rulebook.
- User decision needed: no
- Related mailbox/changelog/PR: Changelog entry `2026-07-15 — Queue instruction-cache proposal`; PR to be opened from the branch above.

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
