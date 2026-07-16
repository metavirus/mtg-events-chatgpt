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

### INTAKE-20260715-006 — Explore database-backed application storage

Outcome type: intake-only
Entity: application data-storage architecture
Modality path used: user design/backlog request -> architecture intake
Promotion status: Candidate queued for Codex review
Files changed: `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`
Branch / PR: `chatgpt-data-update/2026-07-15-database-storage-intake`; pending PR
Codex review needed: Evaluate whether and when the app should migrate from JSON files to a database-backed store.

- Submitted by: User
- Date: 2026-07-15
- Type: product-idea
- Status: new
- Risk: codex-required
- Related entity: application architecture
- Request / observation: Add a design-backlog item for Codex to explore replacing or augmenting the current JSON-file data store with a database.
- Source support: User request in the ChatGPT project conversation on 2026-07-15.
- Desired outcome: A documented architecture assessment covering whether a database would materially improve updates, querying, concurrency, history, personal state, deployment, validation, and future automation compared with the current static JSON model.
- Suggested next step: Codex should assess requirements and tradeoffs before implementation, including candidate database types, migration strategy, hosting/deployment implications, offline/static-site compatibility, source-of-truth rules, backups, schema evolution, Git auditability, and whether JSON should remain an export or generated artifact. Do not begin a migration as part of this intake item.
- User decision needed: no
- Related mailbox/changelog/PR: changelog entry `2026-07-15 — Queue database-storage architecture exploration`; PR pending

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
