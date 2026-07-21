# ChatGPT Sideload Changelog

Historical status: superseded as the default coordination ledger on 2026-07-21.
New ordinary ChatGPT-to-Codex coordination should use the Supabase queue
described in `docs/CHATGPT_CODEX_COORDINATION_CAPABILITY_PROOF.md`. Preserve
this file as archive/recovery context for the earlier sideload era.

Purpose: This file records repository and data changes made from ordinary
ChatGPT sessions so Codex can audit them later. Entries remain pending until a
Codex audit explicitly changes their status.

## Unreviewed ChatGPT Changes

### 2026-07-16 — Consolidated Supabase-ready research intake packet

- Outcome type: intake-only
- Entity: 55 researched stores, branches, community venues, event candidates, and identity/status candidates
- Modality path used: existing repo records and run notes -> Wizards snapshot evidence -> official websites/calendars -> Instagram/social routing -> Discord evidence/public metadata -> Google/Yelp-derived review mirrors -> publisher organized-play lists -> marketplaces -> local reporting/community platforms
- Promotion status: Candidate queued for Codex review
- Files changed: `research/intake/2026-07-16-supabase-ready-intake/README.md`, `research/intake/2026-07-16-supabase-ready-intake/01-requested-26-venues.md`, `research/intake/2026-07-16-supabase-ready-intake/02-existing-repo-catchup-29.md`, `research/runs/2026-07-16-discovery-store-tranche.md`, `research/runs/2026-07-16-yelp-store-review-pass.md`, `research/runs/2026-07-16-google-reviews-fuzzy-resources.md`, `research/runs/2026-07-16-wide-source-and-repo-catchup.md`, `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`, `docs/agent-mailbox.md`
- Branch / PR: PR #16 `chatgpt-data-update/2026-07-16-research-intake` at `c9435b722490286b2c41533bbeca2e4464776d95`; supporting PR #15 run notes preserved unchanged in PR #16
- Request: Consolidate all previously gathered venue/community/event research into one reviewable, fixed-schema intake packet suitable for later Supabase transformation, without changing canonical JSON or writing to Supabase.
- Summary of changes: Added one packet directory containing an intake contract and 55 structured entity records. Each record separates confirmed source facts, analyst interpretation, candidate proposal, unresolved conflict, upcoming event details, format-specific findings, freshness, duplicate risk, disposition, and Codex decision. Carried forward the four detailed supporting run notes from PR #15 / PR #16. Added one async intake item and mailbox review signals.
- Source support: Exact source URLs and modality labels are preserved per record. Supporting detailed evidence remains in the four dated research-run notes.
- Validation performed: Codex inspected PR #15 and PR #16 refs directly; verified PR #16 is the superset for the intake directory and that PR #15's four supporting run notes are preserved unchanged in PR #16; carried forward only documentary intake files and coordination entries; did not apply stale app, canonical JSON, script, Supabase, UX, or deployment diffs from the sideload PRs.
- Validation not performed: No authenticated Google Maps/Yelp browsing; no new authenticated Discord channel inspection; no live Wizards crawler refresh for every store; no Supabase write/schema validation. Canonical JSON validation was not required because canonical JSON was not edited.
- Known risks: Some ratings/counts and recurring events are stale snapshots; event dates described as recurring require live replay; several branch/predecessor/closure conflicts must be resolved before ingestion; the packet is structured for transformation but remains intake evidence rather than canonical truth.
- Codex audit requested: Review the intake packet, reconcile duplicates and identity/status conflicts, validate actionable events and freshness, and decide what should be promoted or corrected through the controlled Supabase workflow.
- Codex review needed: yes
- Status: preserved as documentary intake; pending controlled research review

### 2026-07-15 — Read-only sideload acknowledgment attempt

- Request: Acknowledge Codex message `MSG-20260715-001` and confirm the
  ordinary-ChatGPT sideload guardrails.
- Files changed: None by ChatGPT. Codex later recorded the acknowledgment in
  the coordination documentation.
- Summary of changes: ChatGPT inspected the required coordination files and
  proposed a mailbox acknowledgment, but stopped before editing because branch
  creation returned `403 Resource not accessible by integration`.
- Source support: `AGENTS.md`, `docs/chatgpt-sideload-sop.md`,
  `docs/agent-mailbox.md`, `docs/ASYNC_INTAKE.md`,
  `docs/chatgpt-changelog.md`, `CURRENT_FRONTIER.md`, and
  `docs/WORK_BACKLOG.md`.
- Validation performed: Read-only inspection of coordination files.
- Validation not performed: No local JSON validation, browser smoke test,
  crawler refresh, deployment check, commit, or PR creation.
- Known risks: This entry reflects the pre-install state before the connector
  was fully installed on the repository. It should not be treated as current
  evidence that the write lane is unavailable.
- Codex audit requested: Completed for this acknowledgment; no canonical app
  or research data was changed.
- Status: reviewed; no data changes to approve

### 2026-07-15 - GitHub connector write access re-established

- Request: Restore ordinary-ChatGPT branch and PR capability for safe sideload
  work.
- Files changed: None by ChatGPT in this entry; this records the integration
  state change and successful retest.
- Summary of changes: The user completed the missing ChatGPT Codex Connector
  installation flow on GitHub. The repository now shows the connector
  installed, configured with read and write access to code, pull requests,
  issues, actions, and workflows. A post-install guarded branch creation test
  succeeded, confirming that the earlier `403 Resource not accessible by
  integration` problem is resolved for this repository.
- Source support: GitHub installation/configuration screens reviewed by the
  user and reported back to Codex; successful branch creation confirmed from
  the ChatGPT sideload session.
- Validation performed: Permission screens reviewed; minimal safe branch-create
  probe succeeded.
- Validation not performed: No file edit, PR creation, or local app validation
  was needed for this recovery check.
- Known risks: Future plugin reconnects may repeat the partial "authorized but
  not installed" state. ChatGPT should use the SOP recovery checklist before
  assuming permanent read-only mode.
- Codex audit requested: Update coordination docs so future ChatGPT sessions
  recover from connector setup drift instead of stalling.
- Status: reviewed; write lane restored

### 2026-07-15 — Sideload safety and handoff system created

- Request: Establish guarded ordinary-ChatGPT coordination for low-risk work.
- Origin: Created by Codex as the baseline coordination system; this entry is
  retained here so future ChatGPT sessions and Codex audits share one starting
  point.
- Files changed: `AGENTS.md`, `docs/chatgpt-sideload-sop.md`,
  `docs/chatgpt-changelog.md`, `docs/agent-mailbox.md`,
  `docs/ASYNC_INTAKE.md`, `CURRENT_FRONTIER.md`
- Summary of changes: Added safe/prohibited scopes, validation and audit rules,
  a structured intake queue, and a shared Codex/ChatGPT mailbox.
- Source support: Repository architecture and workflow files inspected locally.
- Validation performed: Documentation structure and referenced paths checked by
  Codex; no canonical app data changed for this system.
- Validation not performed: No browser test required for documentation-only
  changes.
- Known risks: GitHub-only ChatGPT sessions may not be able to run local checks;
  branch and PR discipline remains necessary.
- Codex audit requested: Confirm the ordinary-ChatGPT kickoff run follows the
  safe lane and does not create canonical entities.
- Status: pending Codex review

<!-- Copy this block for each future ChatGPT change.
### YYYY-MM-DD — Short title
- Request:
- Files changed:
- Summary of changes:
- Source support:
- Validation performed:
- Validation not performed:
- Known risks:
- Codex audit requested:
- Status: pending Codex review
-->

## Codex Audit Log

<!-- Copy this block for each audit.
### YYYY-MM-DD — Audit of [change title]
- Reviewed by: Codex
- Findings:
- Fixes applied:
- Status: approved / fixed / needs follow-up
-->
