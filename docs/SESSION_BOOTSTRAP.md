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

## First checks in a fresh task

Before deeper work:

1. verify Python visibility:
   - `py --version`
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

Python is confirmed to work on the user's machine in normal PowerShell through
the `py` launcher. Earlier Codex sessions failed to see `python` / `py`, which
appeared to be a stale-session environment issue rather than a broken install.

Interpretation:

- if `py --version` works in a fresh task, use Python normally;
- if it fails in an older task, do not assume Python is uninstalled;
- prefer a fresh task before spending effort debugging environment visibility.

## What is still intentionally open

The repository is stabilized, not finished.

Still open:

- broad research backlog;
- design/app backlog items;
- branch-hygiene pass to move off `codex/reconcile-wizards` deliberately;
- future data-architecture evolution beyond the current seed JSON layer;
- continued store/community research using the SOPs.

## What not to re-litigate

- do not treat imported earlier-AI materials as operative spec;
- do not casually relax the text-integrity guardrails;
- do not silently let structural risks ride if they could compound;
- do not assume the current dataset is a complete local Magic census.
