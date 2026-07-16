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

### INTAKE-20260715-001 — Finch Birdcage VII cEDH event

- Submitted by: ChatGPT
- Date: 2026-07-15
- Type: candidate-discovery
- Status: new
- Risk: candidate-only
- Related entity: `finch-sparrow`
- Request / observation: Finch and Sparrow Games currently promotes `THE
  BIRDCAGE VII: 2FAST2FINCH cEDH` for July 25, 2026 at 11:00 AM. The listing
  describes the event as full-proxy-friendly, $60 entry, 64-player capacity,
  doors at 10:00 AM, and guaranteed tiered prizing. The current canonical event
  file contains Finch's recurring cEDH Workshop, Thursday Commander Nite, and
  Saturday Commanderfest, but not this dated special event.
- Source support: Finch and Sparrow Games official homepage/product promotion,
  https://finchandsparrowgames.com/ (reviewed 2026-07-15); existing
  `events.json` records for store ID `finch-sparrow` on
  `codex/reconcile-wizards`.
- Desired outcome: Determine whether this dated cEDH event should be promoted to
  canonical event data and whether its source should be retained as a distinct
  event-registration or homepage source.
- Suggested next step: Codex should verify the event details against the direct
  product page and any EventLink, TCGplayerPro, or official social listing,
  deduplicate against existing Birdcage research, then promote or decline under
  the canonical event schema.
- User decision needed: no
- Related mailbox/changelog/PR: Changelog entry `2026-07-15 — Finch website
  event check`; PR pending.

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
