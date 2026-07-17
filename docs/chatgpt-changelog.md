# ChatGPT Sideload Changelog

Purpose: This file records repository and data changes made from ordinary
ChatGPT sessions so Codex can audit them later. Entries remain pending until a
Codex audit explicitly changes their status.

## Unreviewed ChatGPT Changes

### 2026-07-16 — Consolidated Supabase-ready research intake packet

- Outcome type: intake-only
- Entity: 55 researched stores, branches, community venues, event candidates, and identity/status candidates
- Modality path used: existing repo records and run notes -> Wizards snapshot evidence -> official websites/calendars -> Instagram/social routing -> Discord evidence/public metadata -> Google/Yelp-derived review mirrors -> publisher organized-play lists -> marketplaces -> local reporting/community platforms
- Promotion status: Candidate queued for Codex review
- Files changed: `research/intake/2026-07-16-supabase-ready-intake/README.md`, `research/intake/2026-07-16-supabase-ready-intake/01-requested-26-venues.md`, `research/intake/2026-07-16-supabase-ready-intake/02-existing-repo-catchup-29.md`, `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`, `docs/agent-mailbox.md`
- Branch / PR: `chatgpt-data-update/2026-07-16-research-intake`; PR pending
- Request: Consolidate all previously gathered venue/community/event research into one reviewable, fixed-schema intake packet suitable for later Supabase transformation, without changing canonical JSON or writing to Supabase.
- Summary of changes: Added one packet directory containing an intake contract and 55 structured entity records. Each record separates confirmed source facts, analyst interpretation, candidate proposal, unresolved conflict, upcoming event details, format-specific findings, freshness, duplicate risk, disposition, and Codex decision. Added one async intake item and a mandatory mailbox review signal.
- Source support: Exact source URLs and modality labels are preserved per record. Supporting detailed evidence remains in the four dated research-run notes already on the branch.
- Validation performed: Compared the recent 26-store tranche against the current store roster; included the 29 remaining records; preserved existing canonical IDs where unambiguous; used `candidate` for unresolved Honey Pot/identity reconciliation; kept Google, Yelp, official, Wizards, Discord, marketplace, publisher and community evidence separate; flagged duplicates, moves, closure and branch conflicts.
- Validation not performed: No authenticated Google Maps/Yelp browsing; no new authenticated Discord channel inspection; no live Wizards crawler refresh for every store; no local PowerShell text-integrity check; no Supabase write/schema validation. Canonical JSON validation was not required because canonical JSON was not edited.
- Known risks: Some ratings/counts and recurring events are stale snapshots; event dates described as recurring require live replay; several branch/predecessor/closure conflicts must be resolved before ingestion; the packet is structured for transformation but does not assume or establish a Supabase schema.
- Codex audit requested: Review the intake packet, reconcile duplicates and identity/status conflicts, validate actionable events and freshness, and decide what—if anything—should be promoted or corrected through the canonical/Supabase migration workflow.
- Codex review needed: yes
- Status: pending Codex review

### 2026-07-16 — Google reviews and fuzzy resource pass for 26 stores

- Outcome type: documentary-edit
- Entity: 26 user-requested Southern California stores and venues
- Modality path used: exact-name Google-oriented search -> Google Maps or Google-derived mirrors -> official/social routing -> fuzzy discovery across specialist directories, marketplaces, organized-play platforms, local reporting, and community surfaces
- Promotion status: No canonical promotion attempted
- Files changed: `research/runs/2026-07-16-google-reviews-fuzzy-resources.md`, `docs/chatgpt-changelog.md`, `docs/agent-mailbox.md`
- Branch / PR: `chatgpt-data-update/2026-07-16-discovery-store-tranche`; PR #15
- Request: Capture Google-review ratings, recent review themes, store details, and additional useful online resources for all 26 stores, with exact links for Codex and validators.
- Summary of changes: Added a separate store-by-store Google/fuzzy-source report preserving exact URLs, rating/count variants, branch identity, review themes, operational conflicts, additional source classes, and priority conclusions. Direct Google Maps access was inconsistent, so Google-derived mirrors are explicitly labeled and kept separate from Yelp evidence.
- Source support: Direct indexed Google Maps where available; Birdeye; Wanderlog; Chamber of Commerce; Card Shop Hub; Card Shops Finder; CardShows.io; KeepUp; specialist card-shop directories; TCGplayer; Whatnot; official Linktree/social routing; official organized-play listings; local reporting. Exact URLs are preserved in the run note.
- Validation performed: Exact-name and address-aware searches for all 26 entities; branch/location conflicts retained; Google, Yelp, and mixed-platform counts not merged; exact links recorded for validator replay.
- Validation not performed: Authenticated Google Maps review browsing, authenticated social/Discord inspection, canonical data validation, or live event normalization.
- Known risks: Review mirrors can lag Google, counts drift, and some directories synthesize summaries. Branch ambiguity remains material for The Game Chest Irvine; operating status remains unresolved for several stores.
- Codex audit requested: Review the report, replay high-value sources, resolve branch/status conflicts, and use the findings to prioritize deeper Wizards/social/Discord passes.
- Codex review needed: yes
- Status: pending Codex review

### 2026-07-16 — Research 26 discovery-tier stores

- Outcome type: documentary-edit
- Entity: 26 user-requested Southern California stores and venues
- Modality path used: repo context -> exact-name/variant search -> official sites and calendars -> organized-play locators -> business/review corroboration -> social/Discord routing leads
- Promotion status: No canonical promotion attempted
- Files changed: `research/runs/2026-07-16-discovery-store-tranche.md`, `docs/agent-mailbox.md`, `docs/chatgpt-changelog.md`
- Branch / PR: `chatgpt-data-update/2026-07-16-discovery-store-tranche`; PR pending
- Request: Perform a broad source sweep for the 26 stores while Codex was occupied, preserve the evidence, and deliver it for Codex review.
- Summary of changes: Added a store-by-store first-pass research run covering identity, MTG/Commander signals, event/community evidence, source routing, conflicts, recommended priority, and unresolved status questions. No canonical records were edited.
- Source support: Official store websites and calendars where available; official or platform locators; Linktree/social routing; TCGplayer; business profiles; review aggregations; LAist/Boyle Heights Beat reporting; all URLs are preserved in the run note.
- Validation performed: Exact-name and common-variant searches for all 26 entities; cross-source conflicts retained; no ordinary source silence treated as negative evidence.
- Validation not performed: Local text-integrity script, authenticated social/Discord inspection, store-by-store live Wizards extraction, browser-rendered Google Maps review/photo pass, canonical JSON inspection or validation.
- Known risks: Event schedules and operating status can change quickly. Third-party summaries may be stale or synthetic. Codex should verify high-value event claims through official/Wizards/social sources before canonical promotion.
- Codex audit requested: Triage the run, prioritize the strongest stores, resolve status conflicts, and decide which existing records should be promoted or corrected.
- Codex review needed: yes
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
