# ChatGPT Sideload Changelog

Purpose: This file records repository and data changes made from ordinary
ChatGPT sessions so Codex can audit them later. Entries remain pending until a
Codex audit explicitly changes their status.

## Unreviewed ChatGPT Changes

### 2026-07-15 — Queue instruction-cache proposal

Outcome type: intake-only
Entity: ChatGPT sideload coordination workflow
Modality path used: repeated GitHub instruction reads -> user process proposal
Promotion status: Candidate queued for Codex review
Files changed: `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`
Branch / PR: `chatgpt-data-update/2026-07-15-instruction-cache-intake`; pending PR
Codex review needed: Decide whether and how to implement a safe cache keyed by repository, ref, and blob SHA.

- Request: Log the user's proposal for a formal instruction-file cache that avoids re-reading unchanged SOP and coordination files before every substantive ChatGPT sideload task.
- Files changed: `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`
- Summary of changes: Added `INTAKE-20260715-005`, proposing a cache or manifest keyed by repository, branch/ref, path, and Git blob SHA. The proposal requires selective re-read of changed files and explicit invalidation for ref changes, missing files, modality changes, new dependencies, or conflicts with remembered instructions.
- Source support: User process proposal in the ChatGPT project conversation on 2026-07-15.
- Validation performed: Read the current intake and changelog from `codex/reconcile-wizards`; preserved the existing formats; limited the edit to two documentary files.
- Validation not performed: The required local text-integrity script, local checkout, application tests, browser smoke test, and deployment checks were unavailable and unnecessary for this intake-only change.
- Known risks: A poorly designed cache could preserve stale governance or create a duplicate instruction authority. The repository must remain authoritative, and cache reuse must require matching repository, ref, path, and blob SHA.
- Codex audit requested: Evaluate implementation options, determine whether the cache belongs in tool/session state or a generated manifest, and add an approved approach to the durable process backlog or SOP.
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
