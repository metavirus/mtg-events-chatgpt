# Session Bootstrap

## Gate zero: environment readiness

Before research, data, crawler, or app work, run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check_environment_readiness.ps1
```

If it reports `ENVIRONMENT NOT READY`, stop. Follow
[`ENVIRONMENT_READINESS.md`](ENVIRONMENT_READINESS.md); do not begin useful
work while rediscovering or repairing prerequisites.

Use this note to resume work quickly without re-discovering the current
baseline, environmental quirks, or recently settled project rules.

## Current hardened baseline

The repository has already completed these stabilization steps:

- legacy-governance audit completed;
- imported earlier-AI materials are deprecated as active authority;
- text-integrity guardrails added;
- full-repo text-integrity audit passes;
- ChatGPT-to-Codex coordination now uses the Supabase coordination queue;
  the old mailbox/intake/changelog lane is historical fallback only;
- recent research/SOP checkpoint published;
- local UX pass accepted on `codex/reconcile-wizards`;
- personal-use deployment accepted at `dd44e20`, tagged
  `checkpoint/personal-use-deployed-supabase-default-2026-07-17`;
- hosted app uses Supabase as the default read source, with `?data=json` as an
  emergency/debug fallback only;
- current operating posture is centralized in `docs/EFFICIENCY_SOP.md`,
  research rules in `research/SOURCE_SOP.md`, and write rules in
  `docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md`; `CURRENT_FRONTIER.md` is now a
  short current-state handoff, while older chronology is archived;
- Batch A identity/status clarifications have been applied through the
  controlled Supabase workflow without changing event records;
- high-value event candidate replay A has been completed and applied only as a
  source/provenance refresh, avoiding duplicate event ingestion;
- source-routing rules for review mirrors, marketplaces, non-MTG locators,
  Linktree/social routers, Discord/community surfaces, and official event truth
  are recorded in `research/SOURCE_SOP.md`;
- the corrected main-pass method is active: ordinary store passes must inspect
  or disposition material source surfaces, synthesize Places and Events
  conclusions, and leave a compact source-coverage/closure record;
- the finite research queue and 2026-07-17 closure audit are recorded in
  `docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md`;
- the default worker model is retired for this project: use direct bounded
  execution in the current task for small batches unless the user explicitly
  approves a specific exceptional worker.
- the enriched WPN ingest agent described in `CURRENT_FRONTIER.md` is deployed
  and verified; do not repeat its implementation or redeploy its migration.

See also:

- `docs/LEGACY_MATERIALS.md`
- `docs/DIRECTION_AUDIT_2026-07-15.md`
- `docs/REPO_SANITY_AUDIT_2026-07-15.md`
- `docs/CHATGPT_CODEX_COORDINATION_CAPABILITY_PROOF.md`
- `docs/SUPABASE_MIGRATION_STATUS.md`
- `docs/MODEL_USAGE_GUIDE.md`

## First checks in a fresh task

Before deeper work:

1. verify Python visibility:
   - `.\.venv\Scripts\python.exe --version`
2. read the short current-state docs first:
   - `README.md`
   - `docs/PROJECT_CONTEXT.md`
   - `CURRENT_FRONTIER.md`
   - `docs/CHANGE_CONTROL.md`
   - `docs/EFFICIENCY_SOP.md`
   Then query `docs/WORK_BACKLOG.md` with targeted searches/snippets for the
   active lane. Do not raw-read the entire backlog just to reacclimate.
3. inspect repo state:
   - current branch
   - `git status --short`
4. after the WPN ingest migration is deployed, check the quiet machine inbox:
   open `coordination_items` where `origin = 'automation'`, `target = 'codex'`,
   `details->>'inboxKind' = 'wpn_ingest_finding'`, and status is not terminal.
   Report only the count and actionable titles; do not create user-facing
   Signals/Updates or redo source analysis automatically.

## Handoff freshness rule

Do not treat a stale "next" item as proof that the work is still pending.
After reading `CURRENT_FRONTIER.md` and `docs/WORK_BACKLOG.md`, quickly
cross-check the claimed next lane against the implementation surface that would
show completion:

- app/UI work: search the relevant code and, when useful, inspect the live app;
- Supabase/data work: inspect the live table, view, function, or row state;
- Discord/community proof work: check the recorded Signals, source mappings,
  and accepted surface records before rerunning a scanner;
- platform work: run the readiness gate and trust `ENVIRONMENT READY` unless a
  concrete command fails.

If `CURRENT_FRONTIER.md`, backlog text, code, and live state disagree, pause the
work lane and repair the handoff note first. The goal is to prevent context
compression from resurrecting completed work.

## Python note

Python is confirmed on the user's machine, but the `py` launcher and arbitrary
global `python.exe` installations are not the project runtime. Use
`.\.venv\Scripts\python.exe` for repo validation, crawlers, and helpers.

Interpretation:

- if `.\.venv\Scripts\python.exe --version` works, use that runtime normally;
- if `python.exe` fails in an older task, do not assume Python is uninstalled;
- prefer a fresh task or environment refresh before spending effort debugging
  launcher visibility;
- do not use PowerShell text rewrites as a workaround for Python unless the
  change is tiny and encoding-safe.

## What is still intentionally open

The repository is stabilized, not finished.

Still open:

- bounded research backlog, continuing only through the controlled Supabase
  research-write workflow and the corrected main-pass method;
- current finite research queue and closure-audit baseline:
  `docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md`;
- design/app backlog items that are not completion blockers unless promoted;
- branch-hygiene pass to move off `codex/reconcile-wizards` deliberately;
- future authenticated personal/workflow writes and data-architecture evolution;
- continued store/community research using the SOPs.

## What not to re-litigate

- do not treat imported earlier-AI materials as operative spec;
- do not casually relax the text-integrity guardrails;
- do not silently let structural risks ride if they could compound;
- do not restart the accepted UX polish tranche by default;
- do not resume broad research directly into canonical JSON as the main path;
- do not hand-edit generated JSON exports as canonical research updates;
- do not use JSON fallback/export as a normal research, validation, or planning
  surface;
- do not assume the current dataset is a complete local Magic census.
