# ChatGPT-Codex Supabase Coordination Checkpoint

Status: accepted and operational as of 2026-07-21.

## Accepted result

The final read-only round-trip check succeeded.

Ordinary ChatGPT can:

- read a Codex assignment from the shared Supabase coordination queue;
- submit a bounded finding with attached source evidence through
  `public.submit_coordination_item`;
- later read Codex's acceptance and disposition from the same queue;
- complete the exchange without a Git branch, pull request, mailbox-file edit,
  or separate handoff document.

The successful round trip used:

- assignment: `e2a17098-e5da-462e-b823-40ac73213ee7`;
- finding: `f88c6e72-65dd-4569-be76-e7930a00c52c`;
- source: `cedf648a-91c0-4d48-b4ae-18e595895ea8`.

Codex accepted the finding as a coordination proof and explicitly recorded
`canonical_promotion = no_action`. No canonical research table was promoted or
changed for the proof.

## Operational coordination model

The active coordination surface is Supabase:

- `coordination_items`: assignments, findings, questions, proposals, status,
  entity context, confidence, recommended action, and disposition;
- `coordination_sources`: exact source URLs and what each inspected or
  discovered source supports;
- `coordination_activity`: append-only lifecycle and conversation history;
- `submit_coordination_item(...)`: one validated helper that creates an item,
  its initial activity row, and up to 20 attached sources atomically.

The queue is an intake and coordination plane. It is not canonical research
truth. Queue rows become canonical only if Codex separately promotes accepted
material through the controlled Supabase research-write workflow.

## Proportionate governance boundary

Both Codex and the user's ordinary ChatGPT session have authenticated Supabase
connector access. The ChatGPT connector is technically broad enough to execute
SQL and migrations. For this one-user hobby project, the accepted boundary is
governance rather than a separate hardened connector:

- ChatGPT may read the coordination queue.
- ChatGPT may submit only non-canonical coordination findings, questions, and
  source leads through `public.submit_coordination_item`.
- ChatGPT must not revise canonical venues, events, sources, evaluations,
  Signals, personal state, schema, auth, RLS, branches, or Edge Functions unless
  the user gives a separate explicit bounded instruction.
- Codex remains the reviewer and promotion steward for canonical research
  changes.

This is intentionally lightweight. If the project later needs stronger
technical isolation, Supabase MCP/project configuration or a narrower custom
connector can be revisited.

## Temporary proof surface

The earlier private GPT Action / Edge Function proof path is retired.

It consisted of:

- `coordination_capability_probes`;
- the `coordination-capability` Edge Function;
- `docs/chatgpt-coordination-capability-action.yaml`;
- a private bearer token stored outside version control.

The final direct-connector queue made that path unnecessary. The repository no
longer treats it as an active operating route.

The temporary proof table has been dropped. The Edge Function source and
private Action definition have been removed from the repository. If the hosted
Supabase Edge Function still appears in the project dashboard, it should be
deleted as housekeeping; without the proof table it is no longer a usable
coordination surface.

## Legacy file channels

The old ChatGPT sideload files remain historical archive and recovery context:

- `docs/chatgpt-sideload-sop.md`
- `docs/agent-mailbox.md`
- `docs/ASYNC_INTAKE.md`
- `docs/chatgpt-changelog.md`

New ordinary ChatGPT-to-Codex intake should use the Supabase coordination queue
instead of branch/PR/mailbox choreography. The legacy files should not be used
as the default handoff channel unless Supabase coordination is unavailable and
the user explicitly chooses a fallback.

## Minimal ChatGPT submission rule

For future routine intake, ChatGPT should submit:

- one `coordination_items` record with a clear type, title, summary, priority,
  confidence, and recommended action;
- exact `coordination_sources` rows for any material source;
- explicit caveats distinguishing source discovery, inspected content,
  stale/historical material, identity ambiguity, and canonical promotion status.

ChatGPT should use `submit_coordination_item(...)` rather than direct table
inserts for ordinary coordination items because the function enforces field
shape, source-field validation, duplicate-key rejection, and atomic item/source
creation.
