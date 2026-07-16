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

### INTAKE-20260715-003 — Clarify and implement site data freshness indicator

Outcome type: intake-only
Entity: Mana Radar bottom-right research snapshot indicator
Modality path used: user-supplied application screenshot -> explicit UX/data-status request
Promotion status: Candidate queued for Codex review
Files changed: `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`
Branch / PR: `chatgpt-data-update/2026-07-15-data-freshness-indicator`; pending PR
Codex review needed: Determine the actual current purpose of the green indicator, define the authoritative site-data refresh timestamp, and implement accessible freshness states.

- Submitted by: User
- Date: 2026-07-15
- Type: product-idea
- Status: new
- Risk: codex-required
- Related entity: Mana Radar footer/status area
- Request / observation: The bottom-right green-light icon currently appears beside `Research snapshot` and a date, but its purpose is unclear. The indicator should represent the last time the site's underlying data was refreshed, not merely the page build date or an unexplained snapshot label.
- Source support: User-supplied screenshot of the current bottom-right indicator and the user's explicit freshness proposal in the ChatGPT project conversation.
- Desired outcome: Audit the current indicator semantics and replace or clarify them with a data-refresh status tied to the authoritative site-data update timestamp. Proposed initial thresholds: green for data refreshed within the past 48 hours; yellow for data 48–72 hours old; red or amber for data older than 72 hours or when refresh health indicates a problem.
- Suggested next step: Codex should inspect the current implementation and data pipeline, identify which timestamp reliably represents successful site-data refresh, decide whether `older than 72 hours` and `refresh failure` need distinct visual states, then implement the smallest targeted UI/data change from an accepted checkpoint. Include text or tooltip status so color is not the sole signal, and test threshold boundaries and time-zone handling.
- User decision needed: no; Codex may return for a choice if separate stale and failed states materially affect the design.
- Related mailbox/changelog/PR: Changelog entry `2026-07-15 — Queue site data freshness indicator request`; PR pending.

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
