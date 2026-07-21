# Async Intake Queue

Historical status: superseded as the default ChatGPT-to-Codex intake channel on
2026-07-21. New ordinary ChatGPT submissions should use the Supabase
coordination queue described in
`docs/CHATGPT_CODEX_COORDINATION_CAPABILITY_PROOF.md`. This file remains
archive/recovery context for pre-Supabase packet intake.

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

### INTAKE-20260716-001 — Consolidated Supabase-ready venue research packet
- Outcome type: intake-only
- Entity: 55 researched stores, branches, community venues, events, and identity/status candidates
- Modality path used: existing repo records and run notes -> Wizards snapshot evidence -> official websites/calendars -> Instagram/social routing -> Discord evidence/public metadata -> Google/Yelp-derived mirrors -> publisher organized-play lists -> marketplaces -> local reporting/community platforms
- Promotion status: Candidate queued for Codex review
- Files changed: `research/intake/2026-07-16-supabase-ready-intake/README.md`, `research/intake/2026-07-16-supabase-ready-intake/01-requested-26-venues.md`, `research/intake/2026-07-16-supabase-ready-intake/02-existing-repo-catchup-29.md`, plus supporting run notes under `research/runs/2026-07-16-*`
- Branch / PR: PR #16 `chatgpt-data-update/2026-07-16-research-intake` at `c9435b722490286b2c41533bbeca2e4464776d95`; supporting PR #15 run notes preserved unchanged in PR #16
- Codex review needed: Deduplicate and validate the packet, resolve entity/status conflicts, replay stale event sources, and decide which corrections/events/candidates should be promoted through the controlled Supabase write workflow.
- Submitted by: User / ChatGPT
- Date: 2026-07-16
- Type: research-follow-up
- Status: triaged
- Risk: codex-required
- Related entity: 55 existing/candidate venue records; see packet index
- Request / observation: Consolidate all research already gathered into one fixed-schema, source-preserving intake packet suitable for later Supabase transformation without editing canonical JSON or writing to Supabase.
- Source support: Exact URLs and source modality labels are included per record in `research/intake/2026-07-16-supabase-ready-intake/`. Supporting detailed run notes are preserved under `research/runs/2026-07-16-*`.
- Desired outcome: Codex reviews the packet, reconciles duplicates/branches/moves/closure conflicts, validates freshness, and maps accepted facts to the controlled Supabase ingestion process.
- Suggested next step: Resolve high-priority identity/status conflicts first, then high-value actionable event candidates, then low-signal/no-action records. Do not ingest unresolved review counts or branch-conflated evidence.
- User decision needed: no
- Related mailbox/changelog/PR: `MSG-20260716-002`; consolidated changelog entry dated 2026-07-16; PR #15 and PR #16
- Preservation disposition: Documentary packet carried forward into `codex/reconcile-wizards` after Supabase write-pilot acceptance. This remains queued intake evidence, not canonical truth.

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
