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

### INTAKE-20260715-002 — Add collapsible sidebar control

Outcome type: intake-only
Entity: Mana Radar sidebar navigation
Modality path used: user-supplied application screenshot -> explicit UX request
Promotion status: Candidate queued for Codex review
Files changed: `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`
Branch / PR: `chatgpt-data-update/2026-07-15-sidebar-collapse-intake`; pending PR
Codex review needed: Design and implement the bounded sidebar toggle under normal app change control.

- Submitted by: User
- Date: 2026-07-15
- Type: product-idea
- Status: new
- Risk: codex-required
- Related entity: Mana Radar sidebar navigation
- Request / observation: Add a sidebar control that collapses and reopens the left navigation. The sidebar should remain open by default. The user supplied a screenshot of the current desktop layout showing the full open sidebar and requested this as a design-backlog item.
- Source support: User request and user-supplied screenshot in the ChatGPT project conversation on 2026-07-15.
- Desired outcome: A clear, discoverable icon control toggles between the full sidebar and a compact or hidden state without changing the default-open behavior.
- Suggested next step: Codex should inspect the current responsive navigation implementation, define the collapsed desktop state, preserve accessibility and keyboard operation, make the smallest targeted UI change, and validate open/collapsed/reopened behavior at relevant viewport widths. Confirm whether the collapsed state should persist across navigation or reloads; absent a user decision, default to open on each new session.
- User decision needed: no; implementation may ask only if persistence or compact-state details materially affect the design.
- Related mailbox/changelog/PR: Changelog entry `2026-07-15 — Queue collapsible sidebar design request`; PR pending.

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
