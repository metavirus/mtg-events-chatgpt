# Supabase Migration Status

Last updated: 2026-07-17

This file is the quick checkpoint for the Supabase migration. Use it before
touching the data layer so future tasks do not rediscover the same state.

## Current locked state

- Supabase project ref: `pyvftzsodzwfqncjbmbc`
- Public project URL: `https://pyvftzsodzwfqncjbmbc.supabase.co`
- Schema migration: `supabase/migrations/0001_initial_schema.sql`
- Seed snapshot: `supabase/seed/0001_current_snapshot.sql`
- The initial remote schema has been applied.
- The current seed snapshot has been loaded into Supabase.
- The existing JSON files remain the default app source until a separate
  deliberate cutover gate.
- A Supabase read-adapter seam now exists in `app.js`. It is opt-in only via
  `?data=supabase`; if Supabase loading fails, the app falls back to the JSON
  files and logs a warning.
- Representative raw-data and read-adapter parity are accepted at repair commit
  `813c0f2`; that acceptance is not a default-source cutover decision.

## Imported snapshot counts

These counts were verified after the seed load:

| Table | Rows |
| --- | ---: |
| `communities` | 3 |
| `event_occurrences` | 10 |
| `event_series` | 97 |
| `research_changes` | 34 |
| `sources` | 145 |
| `venues` | 55 |

Additional seeded relationship/detail tables:

| Table | Rows |
| --- | ---: |
| `dataset_metadata` | 1 |
| `entity_sources` | 149 |
| `event_sources` | 97 |
| `evaluations` | 2 |

## Security and performance status

- Row Level Security is enabled on exposed public tables.
- Public research tables are readable by the app but not writable by browser
  clients.
- Personal and workflow tables are scoped to the authenticated user.
- The browser may use the publishable key.
- A `service_role` key must never be committed or shipped to the browser.
- The Supabase security advisor was clean after the initial migration.
- The performance advisor found a missing foreign-key index on
  `entity_sources.source_id`; that index was added to the live database and is
  now present in the migration.
- Some unused-index notices are expected until the app actually reads from the
  database.

## Migration refinement status

The local migration includes additional index and permission refinements:

- relationship lookup indexes for entity sources, event sources, evaluations,
  and user notes;
- narrower grants for user-writable tables, especially `agent_requests`, so a
  normal user can provide a response without updating agent/admin fields.

Before further Supabase feature work, confirm the repository migration and seed
still match the accepted remote direction rather than rediscovering the whole
state from scratch.

## Known caveats

- The earlier local Python parity script hit a local certificate verification
  problem. Do not burn time on that unless the Python environment itself is the
  active task; use Supabase MCP, Supabase dashboard, or `psql` for DB checks.
- Do not switch the hosted app to Supabase by default merely because
  representative parity was accepted. The default-source cutover remains a
  separate deliberate gate.
- Do not resume broad research directly into canonical JSON as the main path.
  The next stage is Supabase operational-write readiness because earlier project
  risk included bad JSON writing. Making Supabase the default read source is a
  separate later gate.

## Next safe steps

1. Verify the repository migration, seed snapshot, and read-adapter seam still
   match the accepted Supabase state.
2. Establish controlled Supabase research writes and deterministic JSON
   export/recovery as documented in
   `docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md`.
3. Keep JSON as the default application source until a separate read-cutover
   gate is accepted.
4. Defer or separately gate authenticated favorites, thumbs-down, notes, and
   in-app requests if they are not required for the operational-source cutover.
5. Use a higher-reasoning model before changing RLS/auth/write policies or
   publishing a Supabase-backed release.
