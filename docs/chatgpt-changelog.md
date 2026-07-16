# ChatGPT Sideload Changelog

Purpose: This file records repository and data changes made from ordinary
ChatGPT sessions so Codex can audit them later. Entries remain pending until a
Codex audit explicitly changes their status.

## Unreviewed ChatGPT Changes

### 2026-07-15 — Finch website event check

- Request: Check Finch and Sparrow Games' website for new posts or events as a
  test of the restored sideload workflow.
- Files changed: `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`.
- Summary of changes: Reviewed Finch and Sparrow Games' official homepage,
  in-store-events page, MTG blog, general-news blog, and linked event surface.
  Added `INTAKE-20260715-001` for the dated `THE BIRDCAGE VII: 2FAST2FINCH
  cEDH` event on July 25, 2026. No canonical event was created. No newer MTG or
  general-news blog post was found; the latest visible MTG blog post remains
  dated November 11, 2024, and the general-news blog remains dated April 18,
  2024.
- Source support: Finch and Sparrow Games official website and official event
  links reviewed on 2026-07-15; existing `stores.json` and `events.json` records
  for store ID `finch-sparrow` on `codex/reconcile-wizards`.
- Validation performed: Compared the website finding against the existing Finch
  store record and all three current Finch canonical Commander event records;
  confirmed the dated Birdcage VII event was not represented among those
  records. Preserved the candidate-only boundary by writing intake rather than
  canonical data.
- Validation not performed: The dynamic TCGplayerPro event page returned no
  readable event content through the web retrieval tool. Instagram, EventLink,
  local JSON parsing, browser rendering, and application smoke testing were not
  performed.
- Known risks: The homepage promotion may duplicate a direct product page,
  social post, or event-platform listing not yet reviewed. Event details should
  be cross-checked before canonical promotion. The website does not expose a
  reliable publication timestamp for when the homepage promotion first
  appeared, so `new` means absent from current canonical event records, not
  necessarily first published after the prior July 14 review.
- Codex audit requested: Verify and deduplicate `INTAKE-20260715-001`, then decide
  whether to promote the dated Birdcage VII event and supporting source metadata
  into canonical data.
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
