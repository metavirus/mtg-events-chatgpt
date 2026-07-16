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

### INTAKE-20260715-009 — Explore event-quality ratings
- Submitted by: User
- Date: 2026-07-15
- Type: product-idea
- Status: new
- Risk: codex-required
- Related entity: event ranking, research analysis, and event-list UI
- Request / observation: Summary: explore an event-level quality or fit rating so the user can quickly separate weak opportunities from high-value ones. Full user note: "we should explore adding a rating to events so we can easily separate crap from quality. for example, clear CEDH would get a low quality. general commander and prerelease would get a High, and maybe others get a Promising, or Iffy"
- Source support: Direct user design and research-backlog request in the ChatGPT project conversation.
- Desired outcome: Define a compact event classification that improves scanning, ranking, filtering, and explanations. Preserve the user's examples: explicit cEDH should normally receive a low personal-fit/quality classification; general Commander and prerelease should normally receive a high classification; less certain events may be labeled `Promising` or `Iffy`.
- Suggested next step: Codex should decide whether this is best represented as personal fit, editorial quality, recommendation tier, or a combination; define labels and evidence rules; avoid presenting subjective fit as universal event quality; determine whether ratings apply to recurring series, individual occurrences, or both; and add the accepted design to the durable research/app backlog before implementation.
- User decision needed: no
- Related mailbox/changelog/PR: `MSG-20260715-014`; `chatgpt-data-update/2026-07-15-event-quality-rating-intake`; PR pending

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