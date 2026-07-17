# Supabase setup and migration

Supabase is the intended operational data layer for MTG Events. The public app
continues to use the checked-in JSON snapshot until this migration passes every
acceptance check.

## Files

- `migrations/0001_initial_schema.sql` creates the research, personal, and
  agent-request tables, indexes, triggers, grants, and row-level security.
- `seed/0001_current_snapshot.sql` is generated from the current canonical JSON
  by `scripts/generate_supabase_seed.py`.
- `scripts/verify_supabase_parity.py` compares the imported row IDs with the
  current JSON files through the public read API.
- `scripts/supabase_research_workflow.py` validates reviewable research update
  proposals, generates dry-run SQL plans, and exports deterministic JSON
  recovery snapshots from Supabase.

Never put a Supabase service-role key in this repository or in browser code.
The publishable key is designed for browser use, but row-level security must
remain enabled.

`project-config.json` contains only the browser-safe project URL and publishable
key. The parity script reads this file automatically; environment variables can
still override it.

## One-time project setup

1. In the Supabase project, open **SQL Editor**.
2. Run `migrations/0001_initial_schema.sql`.
3. Run `seed/0001_current_snapshot.sql`.
4. In **Authentication → URL Configuration**, add the production GitHub Pages
   URL and the local preview URL as allowed redirect URLs.
5. Create or invite the single project user through Supabase Authentication.
6. Run the parity check from a UTF-8-capable shell:

```powershell
python.exe scripts/verify_supabase_parity.py
```

The expected initial result is:

- 55 venue IDs
- 3 community IDs
- 145 source IDs
- 97 event-series IDs
- 10 dated occurrence IDs
- 34 research-change IDs

## Research-write safety gate

Before broad research resumes, use the controlled workflow documented in
`docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md`.

Generated JSON exports are recovery/export artifacts and must not be manually
edited. Future research updates should be proposed as field-specific Supabase
operations, validated, reviewed, backed up/exported, applied only when
authorized, and verified after write.

## Cutover gates

Do not switch the app to Supabase until all of these are true:

- controlled research writes and deterministic JSON export/recovery are
  accepted;
- schema and seed SQL complete without error;
- parity check passes for every table;
- anonymous users can read research tables but cannot write them;
- the authenticated user can read and write only their own preferences, notes,
  activity, state, and agent requests;
- localStorage preferences have a tested one-time import path;
- the file-backed adapter remains available for immediate rollback;
- Today, Events, Places, Communities, Updates, and Research pass a browser
  smoke test using Supabase data.

## Regenerating the snapshot

After canonical JSON changes and before cutover:

```powershell
python.exe scripts/generate_supabase_seed.py
powershell -ExecutionPolicy Bypass -File scripts/validate_text_integrity.ps1
```

The generated seed is deliberately repeatable: it upserts by stable existing
IDs rather than inventing new venue, event, source, or change identities.
