# Session Bootstrap

Use this note to resume work quickly without re-discovering the current
baseline, environmental quirks, or recently settled project rules.

## Current hardened baseline

The repository has already completed these stabilization steps:

- legacy-governance audit completed;
- imported earlier-AI materials are deprecated as active authority;
- text-integrity guardrails added;
- full-repo text-integrity audit passes;
- ChatGPT sideload lane established with mailbox/intake/changelog rules;
- recent research/SOP checkpoint published.

See also:

- `docs/LEGACY_MATERIALS.md`
- `docs/DIRECTION_AUDIT_2026-07-15.md`
- `docs/REPO_SANITY_AUDIT_2026-07-15.md`
- `docs/chatgpt-sideload-sop.md`
- `docs/agent-mailbox.md`
- `docs/SUPABASE_MIGRATION_STATUS.md`
- `docs/MODEL_USAGE_GUIDE.md`

## First checks in a fresh task

Before deeper work:

1. verify Python visibility:
   - `python.exe --version`
2. read:
   - `README.md`
   - `docs/PROJECT_CONTEXT.md`
   - `CURRENT_FRONTIER.md`
   - `docs/WORK_BACKLOG.md`
   - `docs/CHANGE_CONTROL.md`
   - `docs/EFFICIENCY_SOP.md`
3. inspect repo state:
   - current branch
   - `git status --short`

## Python note

Python is confirmed on the user's machine, but the `py` launcher has been
unreliable in Codex/Windows shell contexts because it can resolve through the
WindowsApps stub. Prefer `python.exe`, not `py`, for repo validation and helper
scripts.

Interpretation:

- if `python.exe --version` works, use Python normally;
- if `python.exe` fails in an older task, do not assume Python is uninstalled;
- prefer a fresh task or environment refresh before spending effort debugging
  launcher visibility;
- do not use PowerShell text rewrites as a workaround for Python unless the
  change is tiny and encoding-safe.

## What is still intentionally open

The repository is stabilized, not finished.

Still open:

- broad research backlog;
- design/app backlog items;
- branch-hygiene pass to move off `codex/reconcile-wizards` deliberately;
- future data-architecture evolution beyond the current seed JSON layer;
- Supabase read-adapter work after the migration checkpoint is accepted;
- continued store/community research using the SOPs.

## What not to re-litigate

- do not treat imported earlier-AI materials as operative spec;
- do not casually relax the text-integrity guardrails;
- do not silently let structural risks ride if they could compound;
- do not assume the current dataset is a complete local Magic census.
