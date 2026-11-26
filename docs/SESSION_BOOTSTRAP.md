# Session Bootstrap

Codex in the published `mtg-events-chatgpt` Cloud environment is the sole
routine developer for MTG Events. This ownership carries across chats.
The Windows development handoff is reference material. The live operations
and browser-session recovery paths are listed below.

## Routine development in Codex Cloud

1. Select the published `mtg-events-chatgpt` environment and the
   `metavirus/mtg-events-chatgpt` repository. Inspect the remote, branch, and
   `git status --short`. Base new work on current `origin/main`; preserve
   existing work in the checkout.
2. Run both checks in [Environment Readiness](ENVIRONMENT_READINESS.md#published-environment-quick-start)
   before editing. Record the commit, browser used, and outcome of each check.
   If a check fails, diagnose the missing prerequisite and rerun that check
   before relying on it.
3. Read [Project Context](PROJECT_CONTEXT.md) and [Current Frontier](../CURRENT_FRONTIER.md).
   Search [Work Backlog](WORK_BACKLOG.md) for the active task. Verify old
   backlog claims against current code or the latest relevant evidence
   before reopening completed work.
4. Reproduce the specific issue using isolated fixtures and targeted checks.
   The offline smoke proves the app shell and toolchain work. Some other
   browser scenarios default to the hosted app. Check the target and make
   sure outbound traffic is blocked before using them for offline work.
5. Follow [Change Control](CHANGE_CONTROL.md) before pushing. The current
   Pages workflow triggers on pushes to `main` and `codex/reconcile-wizards`,
   including docs-only pushes.

## Resume after context loss

1. Recover the latest user objective and constraints from the current chat or
   its durable task record. Inspect the checkout before switching branches:
   use `git status --short --branch`, `git log -5 --oneline`, and inspect both
   `git diff` and `git diff --cached`. Preserve uncommitted work and check any
   linked PR's actual head, base, and checks.
2. Read the recovery section at the top of [Current Frontier](../CURRENT_FRONTIER.md#compaction-safety)
   and the relevant backlog entry. Compare those notes with the branch, diff,
   and validation evidence. Resume the first unfinished step. If the active
   task cannot be recovered, report what you found and wait for the user to
   identify the task before starting unrelated work.
3. Rerun the Cloud readiness checks if the checkout or environment changed
   or there is no current result. Use the same environment and current
   `origin/main` for new work. The pilot and developer handoff branches are
   references.
4. For work that must survive a new checkout, put the checkpoint on the task's
   authorized branch or PR. Record the objective, branch and commit, tests
   already run, and next unfinished step. Here, "local" means the current Cloud checkout. A new checkout
   can recover committed work from a pushed GitHub branch. Before handing off,
   verify the remote branch head matches the intended commit and link the
   branch or PR in the handoff. For migration coordination between chats,
   record the decision and next action on the shared
   [Events Cloud Migration Handoff Page](https://chatgpt.com/space/page_8f96cb7ae9d88191895c5640a343072f).

## Where the work runs

| Work | Current home |
| --- | --- |
| Routine coding and fixture tests | Codex Cloud, based on `origin/main`. |
| Static app hosting | GitHub Pages. The deploy workflow stamps the published commit into the HTML. |
| Canonical Events data and signed-in preferences | Supabase. Generated JSON is for export and recovery. |
| Scheduled WPN, social, and Discord surveyors | GitHub Actions. Check the latest actual run when investigating delivery. |
| Live operations and browser-session recovery | The existing authorized runner. Use the trusted interactive browser for reauthentication when needed. |

For authorized live data, research, or crawler work, use the
[operational readiness gate](ENVIRONMENT_READINESS.md#operational-gate) and
the relevant operational SOP. That gate can refresh the WPN cache and write
to Supabase. Checking the coordination inbox is live data work.

[Pre-Cloud Session Bootstrap](archive/SESSION_BOOTSTRAP_PRE_CLOUD_CUTOVER.md)
preserves the former Windows-first development instructions and milestones.
