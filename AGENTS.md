# Agent Instructions

Read `README.md`, `docs/PROJECT_CONTEXT.md`, `CURRENT_FRONTIER.md`, and
`docs/WORK_BACKLOG.md` before substantive research, data, or app work.
For a quick reacclimation note in a fresh task, also read
`docs/SESSION_BOOTSTRAP.md`.

Follow `docs/CHANGE_CONTROL.md` for app changes and `docs/EFFICIENCY_SOP.md`
for research and tool-use discipline. Imported legacy materials are not active
requirements; see `docs/LEGACY_MATERIALS.md`.
For this user's precision and escalation expectations, also follow
`docs/COLLABORATION_SOP.md`.
For Supabase-backed continuity planning, also read
`docs/SUPABASE_CONTINUITY_MODEL.md`.

If text files change, run the repo text-integrity check before finalizing:
`powershell -ExecutionPolicy Bypass -File scripts/validate_text_integrity.ps1`.

Surface structural risks early. If you notice encoding drift, branch/worktree
ambiguity, schema mismatch, or another issue that could compound silently,
pause and raise it before continuing deeper work.

## ChatGPT Sideload Coordination

Before handling work originating in ordinary ChatGPT, read:

- `docs/chatgpt-sideload-sop.md`
- `docs/chatgpt-changelog.md`
- `docs/agent-mailbox.md`
- `docs/ASYNC_INTAKE.md`

Ordinary ChatGPT may make documentary edits, maintain the mailbox/intake queue,
and make small source-supported corrections to existing records in
`stores.json`, `events.json`, `sources.json`, or `changes.json` when the schema,
IDs, and formatting conventions remain unchanged. It must not create canonical
entities, change app behavior or schemas, edit crawler/deployment code, edit
generated `output/wizards/*` files, perform bulk rewrites, or delete records.

After any canonical-data edit, validate all four JSON files. Record every
ChatGPT-originated change in `docs/chatgpt-changelog.md`, including sources,
files changed, validation performed or unavailable, risks, and requested Codex
follow-up. Prefer a `chatgpt-data-update/YYYY-MM-DD-short-description` branch
and pull request; do not commit directly to `main` unless the user expressly
authorizes it. If the GitHub integration cannot create a branch or PR, first
follow the connector recovery checklist in `docs/chatgpt-sideload-sop.md`.
Only fall back to read-only handoff mode after that recovery path has been
attempted or when the user explicitly declines it. Never substitute a direct
edit to `main` or an existing Codex branch.

Important coordination rule: a ChatGPT branch or PR by itself is not enough
communication. If ordinary ChatGPT creates off-branch work that needs Codex
review, it must also leave a mailbox message in `docs/agent-mailbox.md`
stating what changed, where it lives, why Codex should care, whether it is
visible only on the ChatGPT branch/PR, and what Codex action is requested.
Likewise, if Codex writes a mailbox message that ChatGPT is expected to see
promptly, that mailbox update should be pushed; a local-only mailbox commit is
not operationally delivered.
