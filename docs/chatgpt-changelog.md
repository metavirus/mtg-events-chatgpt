# ChatGPT Sideload Changelog

Purpose: This file records repository and data changes made from ordinary
ChatGPT sessions so Codex can audit them later. Entries remain pending until a
Codex audit explicitly changes their status.

## Unreviewed ChatGPT Changes

### 2026-07-15 — Queue site data freshness indicator request

Outcome type: intake-only
Entity: Mana Radar bottom-right research snapshot indicator
Modality path used: user-supplied application screenshot -> explicit UX/data-status request
Promotion status: Candidate queued for Codex review
Files changed: `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`
Branch / PR: `chatgpt-data-update/2026-07-15-data-freshness-indicator`; pending PR
Codex review needed: Audit the current indicator purpose and implement an authoritative, accessible data-refresh status.

- Request: Add a design-backlog item to determine what the bottom-right green-light icon currently means and make it reflect the last successful update of the site's underlying data.
- Files changed: `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`.
- Summary of changes: Added `INTAKE-20260715-003` with the user's proposed freshness model: green within 48 hours, yellow from 48 to 72 hours, and red or amber after 72 hours or when a refresh problem is detected. The intake asks Codex to identify the authoritative refresh timestamp, distinguish stale data from an actual failed refresh if appropriate, and include non-color status text or a tooltip.
- Source support: User-supplied screenshot and explicit design request in the ChatGPT project conversation on 2026-07-15.
- Validation performed: Read the current intake format and relevant project/change-control guidance; preserved the request as a documentary product item without editing application code or canonical data.
- Validation not performed: The required local text-integrity script, local checkout, implementation inspection, browser smoke test, accessibility test, data-pipeline verification, threshold-boundary test, and deployment check were unavailable in this GitHub-only session.
- Known risks: The screenshot alone does not establish the indicator's current implementation semantics. A single timestamp may also conflate content freshness, deployment time, and source-by-source freshness; Codex must select the intended authoritative signal before implementation.
- Codex audit requested: Promote the request into the durable app backlog, inspect the current indicator and refresh pipeline, and implement it under normal UI change control.
- Status: pending Codex review

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
