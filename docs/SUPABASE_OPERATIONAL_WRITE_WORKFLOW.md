# Supabase Operational Write Workflow

Last updated: 2026-07-17

## Purpose

This is the lightweight write path for a one-person hobby app whose canonical
operational data lives in Supabase.

The prior failure mode was unsafe manual writing into canonical JSON. The fix is
not to preserve JSON as a parallel system. The fix is to use Supabase as the
canonical surface, keep Git/migrations for reversibility, and give future Codex
research updates a controlled path:

1. propose exact field-level changes;
2. validate IDs, fields, relationships, and duplicates before writing;
3. review generated SQL before live mutation;
4. choose the appropriate validation level for the risk;
5. apply only after explicit authorization when live mutation is required;
6. verify affected records, row counts, required fields, relationships,
   provenance, and duplicate guards after the write;
7. export deterministic JSON recovery artifacts only when the risk or release
   gate calls for it.

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
default app data source. Supabase is already the operational/default research
read source; JSON is the generated recovery/export fallback.

## Validation levels

Do not run full ceremony merely because Supabase is written. Choose the level
that matches the write risk, and escalate if an anomaly appears.

### Lean

Use for low-risk evidence, source, assessment, note, or status changes with low
identity/calendar risk.

Required:

- validate the proposal;
- apply only the approved operations;
- verify affected records and only the relationships/counts relevant to the
  touched fields;
- update the concise proposal/ledger status when needed;
- run repository text integrity before committing changed text files;
- commit and push the small checkpoint.

Do not automatically run a full deterministic export, broad duplicate scan,
hosted app smoke test, or full export comparison.

### Standard

Use for event series or occurrences, several connected records, or
user-visible planning changes.

Add:

- relevant duplicate and relationship checks for the touched tables;
- an affected app/UI check only when the change plausibly affects rendering or
  behavior, not merely because event data changed;
- deterministic export only if the changed tables should refresh recovery JSON
  now or event/source/change exports are part of the accepted checkpoint.

### Full

Use for identity merge/split, branch/location correction, schema/auth/RLS or
default-source changes, broad writes, destructive edits, release/recovery
checkpoints, or anything with higher rollback risk.

Add:

- pre/post deterministic export or equivalent rollback evidence;
- broader row-count, relationship, provenance, and duplicate checks;
- export comparison when recovery JSON freshness matters;
- hosted/local smoke testing when public app behavior could be affected.

## Tooling

Use:

```powershell
python.exe scripts/supabase_research_workflow.py --help
```

The script provides:

- `validate-proposal`: checks a reviewable JSON proposal without writing;
- `plan-sql`: generates reviewable SQL from a validated proposal;
- `apply-approved`: validates, classifies risk, prepares temporary apply SQL,
  and either dry-runs or applies through an explicit database execution backend;
- `export-json`: exports deterministic recovery JSON from Supabase;
- `verify-export`: verifies a generated export directory.

The script uses the browser-safe Supabase URL and publishable key from
`supabase/project-config.json` for read-only exports. It does not require or
store a service-role key. Live `apply-approved --execute` requires an explicit
Postgres execution backend, such as `--database-url`, `DATABASE_URL`, or
`SUPABASE_DB_URL`.

When no database URL or linked CLI backend is configured, use
`apply-approved --connector-package-dir` to generate the bridge for the Codex
Supabase connector: numbered apply chunks, targeted readback SQL, and a small
manifest. This keeps connector-backed writes predictable without hand-splitting
SQL during the live apply.

## Proposal format

A research update starts as a JSON proposal, not as direct JSON edits.

Routine example:

```powershell
python.exe scripts/supabase_research_workflow.py validate-proposal supabase/fixtures/research_update_proposal.example.json
python.exe scripts/supabase_research_workflow.py apply-approved supabase/fixtures/research_update_proposal.example.json
```

Use `plan-sql` only when a persistent review artifact is specifically useful.
Ordinary connector-backed applies should use the temporary connector package.

For Full validation or an intentional recovery checkpoint only, export the
current accepted Supabase state and use that export as the validation basis:

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

### Updates targets

For future `research_changes` rows, choose the most useful safe canonical
target up front so Updates can navigate without guessing from prose.

- Use `entity_type` / `entity_id` for the primary affected venue, community,
  event series, or occurrence whenever one exists.
- If a batch has several important targets, prefer separate focused change rows
  over one broad row when that makes Updates more useful.
- Use dataset-level or broad targets only when there is no honest specific
  target.
- Mentioned records in the summary/details may still be linkified by the app,
  but that is a convenience fallback, not the primary navigation model.

## Required pre-write safety

Before any live write, validate the proposal and confirm the chosen validation
level. For Lean and most Standard writes, a fresh full export is not mandatory
unless the proposal touches exported recovery tables and the checkpoint is meant
to refresh JSON.

For approved routine or standard proposals, prefer:

```powershell
python.exe scripts/supabase_research_workflow.py apply-approved path/to/proposal.json
```

This path validates the proposal, classifies touched tables/risk, generates
apply SQL, and prepares targeted readback checks. If an explicit database
execution backend is available, the same command can apply and verify without
keeping a SQL plan file:

```powershell
python.exe scripts/supabase_research_workflow.py apply-approved path/to/proposal.json --execute --database-url "<ephemeral-postgres-url>"
```

If the Codex Supabase connector is the live execution bridge, generate a
connector package instead of hand-building chunks. The package is an execution
bridge, not durable evidence:

```powershell
python.exe scripts/supabase_research_workflow.py apply-approved path/to/proposal.json --connector-package-dir supabase/apply-packages/YYYY-MM-DD-short-name
```

Then run each generated `*.apply-NN.sql` chunk in numeric order through the
approved connector SQL tool, followed by the generated `*.readback.sql`.
Delete or ignore connector packages after the batch unless there is a concrete
debug/recovery reason to retain them.

High-risk proposals are refused unless explicitly promoted with
`--max-risk high --reviewed-high-risk`. In ordinary Codex connector-backed
writes, use the generated connector package as the single controlled
payload/checklist instead of hand-building ad hoc queries.

### Post-write landing rule

Once the first live write chunk has executed, stop exploring tooling or workflow
alternatives inside that batch. From that point, only:

1. apply the exact remaining prepared chunks, if any;
2. run the prepared readbacks and any required duplicate checks;
3. update the scoped ledger/run-note files already in scope;
4. run required repository text integrity checks;
5. commit, push, and report.

If tooling itself needs improvement, record it as a named TBD after closure or
start a separate tooling tranche before the next research batch.

For Full writes, release/recovery checkpoints, or any write where rollback risk
is higher than routine, create a deterministic export/backup. Do not do this
for ordinary source/evaluation refreshes merely from habit:

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

Generated exports are recovery/export artifacts. They are not manually edited,
not a normal research surface, and not refreshed after every small write.

## Live-write authorization rule

Do not mutate live Supabase merely to demonstrate the workflow.

If a live write is needed, stop and ask the user first with:

- the validated proposal;
- its scope/risk level;
- the targeted landing checks.

The proposal is the review artifact; do not restate every operation in a second
bespoke approval document. For Lean and Standard writes, Git history, the
approved proposal, and a reverse proposal are sufficient reversibility unless a
specific risk justifies more.

Dry-run, read-only, fixture, and transaction-rollback testing may proceed when
safe.

## Post-write verification

After any authorized live write, verify at the selected validation level.

At minimum for Lean:

- affected IDs exist and contain the intended field values;
- relevant source/evidence relationships exist when the write added them;
- repository text-integrity validation passes for changed text files.

Do not run app preview, broad table scans, deterministic export, or duplicate
checks for Lean writes unless the touched tables or observed anomaly justify
them.

For Standard and Full, add relevant checks from this list:

- affected IDs exist and contain the intended field values;
- row counts for affected tables are expected;
- required fields are still populated;
- foreign-key relationships resolve;
- provenance links exist through sources / entity-source / event-source tables;
- no unintended duplicate identities exist;
- no unintended duplicate event occurrences exist for
  `(series_id, occurrence_date, start_time)`;
- deterministic JSON export succeeds only when the accepted checkpoint calls
  for recovery/export validation;
- repository text-integrity validation passes.

## Recovery procedure

If a write is wrong:

1. stop further writes;
2. use the approved proposal, current affected-row readback, Git history, and
   any pre-write export created for a Full-risk checkpoint as the recovery
   reference;
3. generate a reverse proposal or restoration SQL from the affected records;
4. validate and review the rollback plan;
5. apply rollback only after explicit authorization;
6. export again after rollback and verify row counts, relationships, provenance,
   and duplicates.

If the safer path is unclear, do not improvise. Stop and ask for the smallest
decision needed.

## Completion gate

Research is safe to resume only through this workflow and the corrected research
method in `research/SOURCE_SOP.md`.

Accepted gates:

1. controlled Supabase research-write safety is accepted;
2. deterministic Supabase-to-JSON export/recovery exists as an emergency/debug
   path, not routine ceremony;
3. default application read cutover to Supabase is separately accepted;
4. agents no longer hand-edit or mentally model canonical JSON for ordinary
   research updates.

Still deferred:

- broader workflow/request handling;
- unattended recurring research automation.
