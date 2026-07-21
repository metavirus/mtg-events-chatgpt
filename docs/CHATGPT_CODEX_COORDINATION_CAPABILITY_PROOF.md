# ChatGPT-Codex Coordination Capability Proof

Status: direct connector read proof passed; lean coordination queue deployed;
ChatGPT submission and Codex disposition remain to complete the round trip.

## Capability finding

Both Codex and the user's ordinary ChatGPT session have an installed,
authenticated Supabase management connector. The ChatGPT connector exposes
arbitrary SQL, migrations, branch operations, project management, and Edge
Function deployment. A live read-only test proved that ChatGPT can query the
temporary coordination table directly.

The connector's underlying credential type is not visible. Its current tool
surface has no visible table, schema, RPC, operation, or read-only restriction.
It is therefore capable of coordination reads and writes, but it does not
satisfy the project's structural rule that routine ChatGPT intake must be
unable to mutate canonical research truth.

For this one-user hobby project, the user accepted a proportionate governance
boundary instead of introducing another connector and authentication path:

- ChatGPT may read the coordination queue.
- ChatGPT may submit only through `public.submit_coordination_item` and may
  write only non-canonical coordination records.
- ChatGPT is never instructed to revise canonical research truth.
- Codex reviews queue submissions and separately promotes accepted material
  through the controlled canonical-write workflow.
- The installed connector remains technically broad; the table-only limit is
  an operating rule rather than a connector-enforced permission boundary.

Supabase's hosted MCP supports stricter project/read-only configuration if this
project later needs hardening. That additional machinery is intentionally
deferred as disproportionate here.

Current product references:

- [Developer mode, apps, and full MCP connectors in ChatGPT](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta)
- [Configuring actions in GPTs](https://help.openai.com/en/articles/9442513)
- [Creating and editing GPTs](https://help.openai.com/en/articles/8554397-creating-a-gpt/)
- [Supabase MCP Server configuration and security guidance](https://supabase.com/docs/guides/ai-tools/mcp)

## Temporary proof surface

The capability proof deliberately does not create the final coordination
schema yet.

It contains:

- one temporary append-only table, `coordination_capability_probes`;
- one Edge Function, `coordination-capability`;
- one private OpenAPI Action definition in
  `docs/chatgpt-coordination-capability-action.yaml`;
- one private bearer credential stored only in the ignored local `work/`
  directory and in the private GPT Action configuration.

The proof table accepts only four phases: assignment, finding, follow-up, and
disposition. It is sufficient to prove the requested round trip without
prematurely building `coordination_items`, `coordination_sources`, and
`coordination_activity`.

The live proof currently contains one assignment targeted to ChatGPT:
`e5b038cf-ef90-45c0-953d-2a45a36c0152`. Its bounded request is to return one
structured finding with one exact source URL already known to the project,
without broad research or canonical writes.

ChatGPT successfully read this row through its installed Supabase connector,
without a branch, PR, mailbox path, or repository file location. No ChatGPT
write has been authorized or performed yet.

## Lean coordination queue

The accepted operational model is now deployed:

- `coordination_items`: assignments, findings, questions, proposals, status,
  entity context, confidence, recommended action, and disposition;
- `coordination_sources`: exact source URLs and what each inspected or
  discovered source supports;
- `coordination_activity`: append-only lifecycle and conversation history;
- `submit_coordination_item(...)`: one validated helper that creates an item,
  its initial activity row, and up to 20 attached sources atomically.

The helper rejects unknown source fields, invalid enums, malformed JSON,
oversized payloads, and duplicate deduplication keys. Browser roles have no
table privileges. Queue rows remain non-canonical until Codex promotes them.

The first real assignment is ready at
`e2a17098-e5da-462e-b823-40ac73213ee7`.

## Security boundary

- The bearer credential is not a Supabase publishable, secret, anon, or
  service-role key.
- The Edge Function compares only the credential hash.
- The endpoint has fixed routes, fixed fields, fixed enums, payload limits,
  and a fixed table name.
- The endpoint exposes no SQL, table-name, RPC, delete, update, or arbitrary
  query parameter.
- The proof table has RLS enabled and no `anon` or `authenticated` grants.
- Having no client RLS policy is intentional: the table is not a browser data
  surface. Supabase's database advisor reports this as an informational
  `rls_enabled_no_policy` item, while the privilege audit confirms that both
  client roles lack read and write privileges.
- Only the Edge Function's server-side secret can read or append proof rows.
- The Edge Function contains no canonical venue, event, source, evaluation,
  research-change, Signal, or personal-state write path.
- Duplicate keys are rejected, and malformed or oversized payloads fail
  closed.

Possessing the private GPT Action credential therefore does not grant direct
Supabase Data API access and cannot be used to write canonical research tables.

## Deployed proof validation

- The Edge Function is active as `coordination-capability`, version 2.
- An invalid bearer credential returns `401`.
- The valid private credential can read and append proof rows.
- Duplicate deduplication keys return `409`.
- Unknown request fields return `400`; this was explicitly repaired after a
  boundary test showed that version 1 ignored them.
- Unknown routes return `404`, including canonical-looking route names.
- The live privilege audit reports RLS enabled, no `anon` or `authenticated`
  select/insert privileges, and only `service_role` select/insert privileges.
- The proof table contains only the one bounded assignment described above.

These checks prove the infrastructure boundary. They do not substitute for the
ordinary ChatGPT round trip required below.

## Setup requirement

No additional ChatGPT setup is required. Both sides use their existing
authenticated Supabase connectors. The private Action and temporary Edge
Function are no longer the recommended operating path and should be retired
after the direct-connector round trip is accepted.

## Round-trip acceptance test

After setup:

1. Codex appends one bounded assignment targeted to ChatGPT. Complete in the
   final queue.
2. ChatGPT reads it without a branch, PR, or repository file location.
   Pending for the final-queue assignment; direct connector access was already
   proven against the temporary proof row.
3. ChatGPT appends a structured finding with at least one exact source URL in
   its payload.
4. Codex reads the finding and appends one follow-up or disposition.
5. ChatGPT reads that response directly from the same thread.
6. Codex verifies that direct browser/anon/authenticated access to the proof
   table is denied and that the Action exposes no canonical write operation.

Only after this succeeds should the final three-table coordination schema be
built and the legacy mailbox/sideload procedure be marked historical.

## Current stop condition

Do not mark the old coordination mechanism legacy yet. The schema and first
assignment are ready, but ChatGPT must submit the finding and observe Codex's
disposition before the temporary proof surface and old coordination mechanism
are retired.
