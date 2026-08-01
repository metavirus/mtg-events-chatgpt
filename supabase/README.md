# Supabase operational notes

Supabase is the canonical operational data layer for MTG Events. Generated
JSON and the original seed remain emergency/debug/recovery artifacts; they are
not the ordinary research editing or validation surface.

## Current layout

- `migrations/` contains the ordered schema history. Use the Supabase CLI and
  `docs/ENVIRONMENT_READINESS.md`; do not replay migration files manually in
  the dashboard.
- `seed/0001_current_snapshot.sql` is the historical initial import generated
  from the pre-cutover JSON snapshot. It is not regenerated during ordinary
  operation.
- `scripts/supabase_research_workflow.py` remains the reviewed proposal path for
  mutations that do not fit an accepted typed routine-write lane.
- `public.wpn_snapshot_cache` is the service-only rich WPN source cache.
- `public.coordination_items` is the non-canonical review inbox used by
  ChatGPT/Codex handoffs and, after the pending ingest migration, exceptional
  machine findings.

Never put a database URL, database password, service-role key, or Supabase
secret key in this repository or browser code. Browser-safe project settings
remain in `project-config.json`; privileged local values belong only in the
ignored `.codex-secrets/` path described by the readiness documentation.

## Current WPN ingest

Migration `20260801170000_enrich_wpn_ingest_cache.sql` is deployed. The cache
stores enriched WPN events/organizations, compact cross-snapshot event
observation state, upstream field inventory, and delta summaries. The first
live write and immediate no-delta replay were verified on 2026-08-01; ordinary
unchanged refreshes create no coordination-inbox noise.

## Operational rules

- Run the mandatory readiness gate before data work.
- Supabase writes use proportional validation and the accepted typed/helper
  paths in `docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md`.
- Routine cache or surface state does not require proposal ceremony.
- Canonical venue/event/evaluation changes still require the appropriate
  reviewed write lane.
- `?data=json` is an explicit recovery/debug mode, not a parallel product or
  research path.
- RLS stays enabled on exposed-schema tables, and privileged operational tables
  remain unavailable to browser roles unless a bounded product requirement
  explicitly changes that boundary.

## Historical setup artifacts

The initial seed, parity checker, and early cutover notes are retained for
recovery and history. They do not define the current operating workflow. See
`docs/SUPABASE_MIGRATION_STATUS.md` for the short migration checkpoint and
`docs/archive/` for older chronology.
