# Supabase Operational Write Workflow

Last updated: 2026-07-17

## Purpose

This is the safety gate that must exist before broad research resumes.

The prior failure mode was unsafe manual writing into canonical JSON. The fix is
not merely to read from Supabase by default. The fix is to give future Codex
research updates a controlled path:

1. propose exact field-level changes;
2. validate IDs, fields, relationships, and duplicates before writing;
3. review generated SQL before live mutation;
4. create a deterministic Supabase-to-JSON export/backup;
5. apply only after explicit authorization when live mutation is required;
6. verify affected records, row counts, required fields, relationships,
   provenance, and duplicate guards after the write;
7. export deterministic JSON recovery artifacts from the accepted Supabase state.

## Scope

This workflow covers canonical research tables only:

- `venues`
- `communities`
- `sources`
- `entity_sources`
- `event_series`
- `event_occurrences`
- `event_sources`
- `evaluations`
- `research_changes`

It deliberately does not cover authenticated personal/workflow writes such as
favorites, thumbs-down, notes, ratings, update-read state, or `Ask Codex`
requests. Those remain a separate gate.

It does not change auth, RLS, credentials, browser-write permissions, or the
default app data source.

## Tooling

Use:

```powershell
python.exe scripts/supabase_research_workflow.py --help
```

The script provides:

- `validate-proposal`: checks a reviewable JSON proposal without writing;
- `plan-sql`: generates reviewable SQL from a validated proposal;
- `export-json`: exports deterministic recovery JSON from Supabase;
- `verify-export`: verifies a generated export directory.

The script uses the browser-safe Supabase URL and publishable key from
`supabase/project-config.json` for read-only exports. It does not require or
store a service-role key.

## Proposal format

A research update starts as a JSON proposal, not as direct JSON edits.

Example:

```powershell
python.exe scripts/supabase_research_workflow.py validate-proposal supabase/fixtures/research_update_proposal.example.json
python.exe scripts/supabase_research_workflow.py plan-sql supabase/fixtures/research_update_proposal.example.json --output supabase/plans/example-no-live-write.sql
```

For real research work, first export the current accepted Supabase state and use
that export as the validation basis:

```powershell
python.exe scripts/supabase_research_workflow.py export-json --output-dir supabase/exports/prewrite-YYYY-MM-DD-short-name
python.exe scripts/supabase_research_workflow.py validate-proposal path/to/proposal.json --basis-dir supabase/exports/prewrite-YYYY-MM-DD-short-name
python.exe scripts/supabase_research_workflow.py plan-sql path/to/proposal.json --basis-dir supabase/exports/prewrite-YYYY-MM-DD-short-name --output supabase/plans/YYYY-MM-DD-short-name.sql
```

Each operation must specify:

- `action`: `insert`, `update`, or `upsert`;
- `table`: one of the covered research tables;
- `key`: the stable ID or composite key;
- `fields`: only known fields for that table;
- `reason`: review context for why the change exists.

Unknown fields are rejected. Invalid enum values are rejected. Missing required
fields are rejected. Invalid relationships are rejected. Duplicate stable
identities and duplicate event occurrences are rejected before SQL is produced.

## Required pre-write safety

Before any live write:

1. create a deterministic export/backup:

```powershell
python.exe scripts/supabase_research_workflow.py export-json --output-dir supabase/exports/prewrite-YYYY-MM-DD-short-name
```

If the local Windows Python environment hits the known certificate verification
problem already tracked in `docs/SUPABASE_MIGRATION_STATUS.md`, use the explicit
local-dev workaround only for this read-only export:

```powershell
python.exe scripts/supabase_research_workflow.py export-json --output-dir supabase/exports/prewrite-YYYY-MM-DD-short-name --allow-insecure-local-dev-tls
```

2. validate the proposal against that export with `--basis-dir`;
3. generate and review the SQL plan against that same export with `--basis-dir`;
4. run repository text validation after export files are created or updated:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate_text_integrity.ps1
```

Generated exports are recovery/export artifacts. They are not manually edited.

## Live-write authorization rule

Do not mutate live Supabase merely to demonstrate the workflow.

If a live write is needed, stop and ask the user first with:

- exact table and record;
- exact before/after state;
- rollback method;
- validation plan.

Dry-run, read-only, fixture, and transaction-rollback testing may proceed when
safe.

## Post-write verification

After any authorized live write, verify:

- affected IDs exist and contain the intended field values;
- row counts for affected tables are expected;
- required fields are still populated;
- foreign-key relationships resolve;
- provenance links exist through sources / entity-source / event-source tables;
- no unintended duplicate identities exist;
- no unintended duplicate event occurrences exist for
  `(series_id, occurrence_date, start_time)`;
- deterministic JSON export succeeds;
- repository text-integrity validation passes.

## Recovery procedure

If a write is wrong:

1. stop further writes;
2. use the pre-write export directory as the recovery reference;
3. generate a reverse proposal or restoration SQL from the affected records;
4. validate and review the rollback plan;
5. apply rollback only after explicit authorization;
6. export again after rollback and verify row counts, relationships, provenance,
   and duplicates.

If the safer path is unclear, do not improvise. Stop and ask for the smallest
decision needed.

## Completion gate

Research is not safe to resume merely because this workflow exists.

Research can resume only after:

1. controlled Supabase research-write safety is accepted;
2. deterministic Supabase-to-JSON export/recovery is accepted;
3. default application read cutover to Supabase is separately accepted;
4. agents no longer need to hand-edit canonical JSON for ordinary research
   updates.
