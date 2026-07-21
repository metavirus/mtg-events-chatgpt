# ChatGPT-Codex Coordination Capability Proof

Status: proof infrastructure deployed; ordinary ChatGPT round trip awaits the
one-time private GPT Action setup.

## Capability finding

Codex has a direct authenticated Supabase connector. Ordinary personal ChatGPT
does not inherit that connector merely because Codex has it.

For a personal ChatGPT Pro account, a custom MCP app is currently limited to
read/search actions. It therefore cannot be the coordination write path.

The smallest viable personal-account path is a private custom GPT Action that
calls one narrow authenticated Supabase Edge Function. GPT Actions can call an
external OpenAPI-described endpoint using an API key, although the custom GPT
must use a non-Pro model that supports Actions.

This is a one-time setup surface, not a return to branch, PR, or mailbox
coordination. On ChatGPT web, the private GPT can also be invoked from an
ordinary conversation with `@`, allowing the active conversation to hand a
structured result to the queue.

Current product references:

- [Developer mode, apps, and full MCP connectors in ChatGPT](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta)
- [Configuring actions in GPTs](https://help.openai.com/en/articles/9442513)
- [Creating and editing GPTs](https://help.openai.com/en/articles/8554397-creating-a-gpt/)

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

## Required one-time ChatGPT setup

1. Create a private custom GPT on ChatGPT web.
2. In its Actions configuration, import
   `docs/chatgpt-coordination-capability-action.yaml`.
3. Select API-key authentication using Bearer auth.
4. Copy the proof credential from the ignored local file
   `work/coordination-capability/action-bearer-token.txt` into the private
   Action configuration. Do not paste it into chat or commit it.
5. Use a non-Pro model that supports Actions; Actions are not available in Pro
   mode.
6. Keep the GPT private for this proof.

## Round-trip acceptance test

After setup:

1. Codex appends one bounded assignment targeted to ChatGPT.
2. ChatGPT reads it through `listCoordinationProofItems` without a branch, PR,
   or repository file location.
3. ChatGPT appends a structured finding with at least one exact source URL in
   its payload.
4. Codex reads the finding and appends one follow-up or disposition.
5. ChatGPT reads that response directly from the same thread.
6. Codex verifies that direct browser/anon/authenticated access to the proof
   table is denied and that the Action exposes no canonical write operation.

Only after this succeeds should the final three-table coordination schema be
built and the legacy mailbox/sideload procedure be marked historical.

## Current stop condition

Do not mark the old coordination mechanism legacy yet. The access path is
viable in design, but the ordinary ChatGPT Action round trip still requires the
one-time private GPT setup and live acceptance test.
