# Supabase Read Cutover Checkpoint

Date: 2026-07-17

## Result

The local app now uses Supabase as the default research read source, with
`?data=json` retained as the explicit file-backed recovery path.

This checkpoint verifies the default-read cutover after:

- controlled Supabase research-write workflow was implemented;
- deterministic Supabase-to-JSON export/recovery was implemented;
- a minimal live write/rollback pilot succeeded;
- JSON remained available as recovery/export rather than a manual canonical edit
  surface.

## Browser validation

Validated against local app routes:

- `#today`
- `#events`
- `#places`
- `#changes`
- `#communities`

For each route:

- normal URL reported `body[data-data-source="supabase"]`;
- `?data=json` reported `body[data-data-source="json"]`;
- visible route content loaded without the local-server error;
- Supabase-default and JSON-recovery visible text matched at the route-summary
  level;
- browser console showed no errors.

Key visible parity signals:

- Events showed `641 upcoming occurrences`, `55 places represented`, and
  `21 special / limited signals` on both Supabase and JSON paths.
- Updates showed `34 / 34` visible updates on both Supabase and JSON paths.
- Places showed the same leading reviewed venue list on both paths.
- Communities showed the same `2 partial / 1 discovery` coverage summary on
  both paths.

## Data and advisor checks

Supabase table counts:

| Table | Rows |
| --- | ---: |
| `dataset_metadata` | 1 |
| `venues` | 55 |
| `communities` | 3 |
| `sources` | 145 |
| `entity_sources` | 149 |
| `event_series` | 97 |
| `event_occurrences` | 10 |
| `event_sources` | 97 |
| `evaluations` | 2 |
| `research_changes` | 34 |

Security advisor:

- clean; no security lints returned.

Performance advisor:

- only unused-index informational notices returned, expected at this stage before
  heavier app/database traffic.

Supabase deterministic export:

- export verification passed with 55 venues, 3 communities, 145 sources, 97 event
  series, 10 occurrences, and 34 changes.

Known local caveat:

- `scripts/verify_supabase_parity.py` still hits the documented local Python TLS
  certificate issue in this Windows environment. The read-only export workflow
  was used with the explicit local-dev TLS workaround, and Supabase MCP checks
  provided the table/advisor evidence.

## Repository validation

- JavaScript syntax check passed.
- Full repo text-integrity check passed.
- Diff whitespace check passed.

## Acceptance boundary

This checkpoint does not:

- add new research;
- mutate live Supabase;
- change auth, RLS, credentials, or browser-write permissions;
- deploy the app.

## Next gate

If the user accepts this checkpoint, broad research may resume only through the
controlled Supabase research-write workflow in
`docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md`.

JSON remains recovery/export. Generated JSON exports are not manually edited.
