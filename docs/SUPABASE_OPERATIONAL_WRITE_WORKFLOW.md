# Supabase Operational Write Workflow

Last updated: 2026-07-25

## Purpose

This is the lightweight write path for a one-person hobby app whose canonical
operational data lives in Supabase.

The prior failure mode was unsafe manual writing into canonical JSON. The fix is
not to preserve JSON as a parallel system. The fix is to use Supabase as the
canonical surface, keep Git/migrations for reversibility, and choose the
smallest write path that matches the risk.

Ordinary source or surface disposition lands through the typed
`record_entity_surface_check(...)` RPC into `entity_surface_coverage`. That row
is durable operational research state. Only a material planning change may also
create a targeted `research_changes` row. Quiet, thin, blocked, route-only, and
no-delta observations never create user-facing Updates.

Use proposal/package workflow only when the write changes canonical research
truth, user-visible planning data, identity/status interpretation, schema/auth,
or other trust-sensitive records.

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

It also covers the operational surface-check path:

- `entity_surface_coverage`
- `record_entity_surface_check(...)`

Surface coverage records are canonical operational research state. They record
that a material surface was checked, blocked, thin, stale, useful, or not found;
they do not by themselves revise a venue assessment, event row, Signal, or
source truth.

This workflow deliberately does not cover authenticated personal/workflow writes
such as favorites, thumbs-down, notes, ratings, update-read state, or `Ask
Codex` requests. Those remain a separate gate.

It does not change auth, RLS, credentials, browser-write permissions, or the
default app data source. Supabase is already the operational/default research
read source; JSON is the generated recovery/export fallback.

## Validation levels

Do not run full ceremony merely because Supabase is written. Choose the level
that matches the write risk, and escalate if an anomaly appears.

Operational lane reminder:

- `steady-state monitoring pass`: routine surface-check path unless a real delta
  appears;
- `baseline pass`: proposal path only when the bounded decision-grade pass finds
  actual event/evaluation mutations;
- `identity-resolution pass`: reviewed path only for the specific attribution or
  branch question being resolved.

Do not let a no-delta monitoring run or a blocked/thin surface disposition slide
into Lean/Standard proposal ceremony.

### Routine Surface Check

Use for ordinary surface results that do not change venues, events, sources,
evaluations, Signals, or schema. Examples:

- Instagram route found but content not inspected;
- Discord route unsafe/TBD under the current protocol;
- official site checked and thin;
- WPN/EventLink checked for a venue and useful/not useful result recorded;
- review surface not material for the current decision.

Required:

- call `record_entity_surface_check(...)` with stable entity, surface,
  disposition, summary, materiality, and idempotency key;
- use dry-run mode first when the target or vocabulary is uncertain;
- keep the returned RPC result as the confirmation;
- rely on `entity_surface_coverage` as the durable record;
- set `material_change` only when the observation changes user-facing planning
  truth; otherwise no `research_changes` row is created.

Do not create proposal JSON, SQL packages, exports, Markdown ledger edits, run
notes, text-integrity checks, commits, or app previews for this path unless some
separate file/schema/app change is actually made.

This is the default write path for ordinary steady-state monitoring outcomes and
for blocked/thin/no-delta surface dispositions inside a bounded baseline pass
when no venue/event/evaluation mutation is justified.

### Lean

Use for low-risk evidence, source, assessment, note, or status changes with low
identity/calendar risk that are too substantive for a Routine Surface Check.

Required:

- validate the proposal;
- apply only the approved operations;
- verify affected records and only the relationships/counts relevant to the
  touched fields;
- update a ledger or note only when the change changes higher-level queue state
  or leaves a named follow-up;
- run repository text integrity before committing changed text files;
- commit and push the small checkpoint.

Do not automatically run a full deterministic export, broad duplicate scan,
hosted app smoke test, or full export comparison.

### Standard

Use for event series or occurrences, event retirements, several connected
records, Signals, meaningful evaluation changes, or user-visible planning
changes.

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

Routine typed RPC lanes do not use this script by default.

- Use `scripts/record_surface_check.py` for ordinary surface dispositions.
- Use `scripts/record_official_event.py official-event` for one clean
  attributable official standalone or finite event occurrence.
- Use `scripts/record_official_event.py recurring-occurrence` for one official
  dated occurrence attached to an existing recurring series.

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

## Routine surface-check format

Use `scripts/record_surface_check.py` when the work is only recording source or
surface disposition. It exposes only the exact RPC fields, supports dry-run and
live modes, prints the RPC return columns, and can optionally add an
idempotent replay check. Prefer `--execute` with the configured
`SUPABASE_DB_URL` for ordinary typed writes; use `--execute-linked` only when
the direct DB URL path is unavailable or the task specifically needs the linked
project context. It does not create durable repo artifacts.

Example connector-friendly dry run:

```powershell
python.exe scripts/record_surface_check.py `
  --idempotency-key routine-proof-store-surface-YYYY-MM-DD `
  --entity-type venue `
  --entity-id example-store `
  --surface-type instagram `
  --disposition route_found_content_not_inspected `
  --source-id src-example-instagram `
  --summary "Instagram route exists but content was not inspected in this routine pass."
```

Add `--live` to prepare the live RPC call for connector execution, or add
`--execute` to run directly with `--database-url`, `DATABASE_URL`, or
`SUPABASE_DB_URL`. Use `--execute-linked` as a fallback linked-CLI path, not as
the default. Add `--replay-check` for a live idempotency check.

The call should include:

- `entity_type`: currently `venue` or `community`;
- `entity_id`: the existing canonical entity ID;
- `surface_type`: one of the accepted surface classes such as `official_site`,
  `wpn_eventlink`, `event_calendar`, `instagram`, `facebook`, `discord`,
  `review`, or `other`;
- `disposition`: the honest result, such as `inspected_current`,
  `inspected_thin`, `route_found_content_not_inspected`, `blocked_gated`,
  `unsafe_tbd`, `not_found`, `stale`, `contradiction`, or `not_material`;
- `summary`, `materiality`, `checked_at`, optional `source_id`, optional
  follow-up, and a stable idempotency key.

If the surface result creates a later task, link or create that task through the
existing coordination/request tables. Do not create a new queue.

## Routine typed event format

Use `scripts/record_official_event.py` when the work is a clean attributable
event delta that already fits a typed steward-only RPC.

Operator lanes:

- `official-event`: one attributable official standalone or finite event
  occurrence. Suitable for official events pages, calendars, or event-platform
  listings when venue identity is already safe enough.
- `recurring-occurrence`: one official dated occurrence attached to an existing
  recurring series. Suitable when the recurring series already exists and only a
  dated official occurrence needs to be attached without mutating the recurring
  series shape.

Example live linked CLI run for a recurring-series occurrence:

```powershell
python.exe scripts/record_official_event.py recurring-occurrence `
  --live `
  --execute-linked `
  --idempotency-key example-recurring-occurrence-YYYY-MM-DD `
  --venue-id example-venue `
  --series-id example-recurring-series `
  --occurrence-id example-occurrence `
  --occurrence-date 2026-08-07 `
  --start-time 18:00 `
  --source-id src-example `
  --source-label "Official events page — Example Store" `
  --source-url "https://example.com/events" `
  --summary "Official events page confirms Friday Commander on August 7, 2026."
```

For both typed event lanes:

- default to dry-run when input certainty is still being checked;
- use `--execute-linked` as the default operator path in a ready environment;
- expect the returned IDs directly from the RPC:
  `series_id`, `occurrence_id`, `source_id`, `outcome`, `wrote`,
  `research_change_id`;
- use `--replay-check` only when you need an explicit idempotency proof;
- do not add proposal JSON, SQL packages, Markdown run notes, text-integrity
  checks, or Git commits for routine database-only event writes.

Required verification is proportional:

- routine success: returned IDs plus `outcome`/`wrote`;
- optional replay: one repeated live call when idempotency needs proof;
- deeper readback only when the RPC output or source attribution is anomalous.

## Proposal format

A canonical research update starts as a JSON proposal, not as direct JSON edits.
This is no longer the default path for ordinary surface checks.

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

## Event-capture calibration

WPN/EventLink is usually enough to capture a current event when the venue name
and address are attributable to a known venue closely enough for this personal
planning app. Store-controlled website weirdness, weak venue confidence, bad
personal fit, no-proxy, high-power, or competitive posture should normally
become confidence, check-first caveats, ranking/filtering, Places cautions, or
event annotations. Do not silently omit source-supported current event rows
merely because the venue is messy or a poor recommendation.

Omit event rows only when they are stale/past, duplicate, out of scope,
genuinely unattributable, or identity-unsafe enough that they could point to the
wrong place.

## Required pre-write safety

Before any Lean, Standard, or Full live write, validate the proposal and confirm
the chosen validation level. Routine Surface Checks use the typed RPC and its own
idempotent validation path instead. For Lean and most Standard writes, a fresh
full export is not mandatory unless the proposal touches exported recovery
tables and the checkpoint is meant to refresh JSON.

For approved Lean or Standard proposals, prefer:

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
is higher than routine, create a deterministic export/backup. Do not do this for
Routine Surface Checks or ordinary source/evaluation refreshes merely from
habit:

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

Routine Surface Checks may be recorded directly when they are within the
approved research task and do not change canonical venue/event/evaluation truth.

If a Lean, Standard, or Full live write is needed, stop and ask the user first
with:

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

For Routine Surface Checks, the RPC result, idempotency behavior, and resulting
`entity_surface_coverage` row are the verification. A `research_changes` row is
expected only for an explicitly material change. No repo validation or commit
is involved unless repo files changed for another reason.

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
- next possible overhead reduction: either a narrow typed RPC for WPN-backed
  event upserts, if routine WPN event capture keeps requiring proposal packages,
  or a direct steward DB execution path, if connector ferrying remains the
  bottleneck for approved Standard writes.

## Wizards snapshot artifacts

Ordinary WPN cache state should not create recurring Git churn. Prefer reusing a
recent suitable snapshot or moving routine cache state toward Supabase or ignored
local output in a future tranche. Keep Git-tracked WPN artifacts only when they
are intentional recovery/debug/source snapshots for a specific checkpoint.
