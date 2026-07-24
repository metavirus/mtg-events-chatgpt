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

Current operating posture: Supabase is canonical; generated JSON is
emergency/debug/export only; research is decision-grade rather than exhaustive;
and routine data writes use proportional validation. Treat
`docs/EFFICIENCY_SOP.md`, `research/SOURCE_SOP.md`, and
`docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md` as the canonical homes for those
rules instead of reconstructing them from historical checkpoints.

If text files change, run the repo text-integrity check before finalizing:
`powershell -ExecutionPolicy Bypass -File scripts/validate_text_integrity.ps1`.

Surface structural risks early. If you notice encoding drift, branch/worktree
ambiguity, schema mismatch, or another issue that could compound silently,
pause and raise it before continuing deeper work.

If a tool, connector, runtime, browser path, or task capability appears
unavailable, follow the Capability Recovery and Task Continuity protocol in
`docs/COLLABORATION_SOP.md` and its concise checklist in
`docs/EFFICIENCY_SOP.md`. Do not treat the first failed path as proof that the
capability is unavailable.

If repeated compaction threatens execution continuity, follow the Compaction
Resilience protocol in `docs/COLLABORATION_SOP.md`. Marker count alone is not a
warning; use the documented continuity-failure criteria. Resume directly after
an isolated compaction when the target remains clear, and retire an unhealthy
task only after preserving the exact working state and bounding its successor.

## ChatGPT-Codex Supabase Coordination

The active ordinary ChatGPT-to-Codex handoff path is the Supabase coordination
queue, not branch/PR/mailbox/file choreography.

Before handling work originating in ordinary ChatGPT, read:

- `docs/CHATGPT_CODEX_COORDINATION_CAPABILITY_PROOF.md`

Ordinary ChatGPT may read the shared queue and may submit non-canonical intake
items through `public.submit_coordination_item(...)`. Those submissions can
include source leads, research findings, questions, or proposals, but they are
not canonical research truth. Codex must review and separately promote accepted
material through the controlled Supabase research-write workflow.

ChatGPT must not revise canonical venues, events, sources, evaluations,
Signals, personal state, schema, auth, RLS, branches, Edge Functions, generated
exports, crawler/deployment code, or app behavior unless the user gives a
separate explicit bounded instruction.

Legacy file-based sideload coordination is historical fallback only. The files
`docs/chatgpt-sideload-sop.md`, `docs/chatgpt-changelog.md`,
`docs/agent-mailbox.md`, and `docs/ASYNC_INTAKE.md` remain useful archive and
recovery context, but they are no longer the default communication lane.
