# Southern California Magic Intelligence

The current source of truth is the direction synthesized inside this repository
from the user's goals, the ongoing research performed here, the normalized data,
and the repo-backed design decisions.

Imported materials from earlier AI attempts are affirmatively deprecated as
active project inputs. They are historical archive only and are not ordinary
design/build/research references. See
[`docs/LEGACY_MATERIALS.md`](docs/LEGACY_MATERIALS.md).

The durable product and research requirements are summarized in
[`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md). Read that file before
changing research logic, schemas, ranking, crawler behavior, or interface
structure.

Before substantive work, the mandatory environment gate is
[`docs/ENVIRONMENT_READINESS.md`](docs/ENVIRONMENT_READINESS.md). If the
readiness script reports `ENVIRONMENT NOT READY`, stop before research or data
work.

The researched visual and interaction direction is documented in
[`docs/UX_RESEARCH.md`](docs/UX_RESEARCH.md).

The build is governed by [`docs/DATA_ARCHITECTURE.md`](docs/DATA_ARCHITECTURE.md)
and [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md).

The pre-v1 source-of-truth review and corrections are recorded in
[`docs/DIRECTION_AUDIT_2026-07-15.md`](docs/DIRECTION_AUDIT_2026-07-15.md).

A static browser application whose interface is separated from its data.

This repository also contains a repeatable Wizards Store & Event Locator
crawler. The crawler captures public Magic event data around a public Los
Alamitos centroid, then writes raw discovery output for later reconciliation
against store websites, social pages, Discords, registration pages, and other
community sources.

## Run locally

To serve the static application locally, run a tiny local server in this folder:

    .\.venv\Scripts\python.exe -m http.server 8000

Then open:

    http://localhost:8000

## Data source

The operational research source is now Supabase. The hosted app reads Supabase
by default.

Generated JSON files are recovery artifacts, not the ordinary research editing,
validation, or planning surface:

- `stores.json`: exported venue information and assessments
- `events.json`: exported recurring and one-time events
- `sources.json`: exported provenance and last-check dates
- `changes.json`: exported audit/change feed

The application code does not need to change when records are added or revised.
Research updates should go through the controlled Supabase workflow in
[`docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md`](docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md);
ordinary surface checks can land directly through the typed Supabase
`record_entity_surface_check(...)` path. Manual canonical JSON research edits
are forbidden except for generated export/recovery work.

The `?data=json` app mode is emergency/debug recovery only. Do not use it as a
parallel product path, routine validation target, or ordinary research source.
If Supabase breaks, fix Supabase/app behavior directly rather than optimizing
around the fallback.

## Text integrity guardrails

This repository standardizes text files on UTF-8 with LF line endings through
`.editorconfig` and `.gitattributes`.

Recommended local release-gate check:

    powershell -ExecutionPolicy Bypass -File scripts/validate_text_integrity.ps1

Full-repo audit check:

    powershell -ExecutionPolicy Bypass -File scripts/validate_text_integrity.ps1 -FullRepo

Optional local hook setup if you use `pre-commit`:

    pre-commit install

## Wizards locator refresh

Install the crawler dependencies:

    python -m venv .venv
    .\.venv\Scripts\python.exe -m pip install -r requirements.txt

Refresh the public Wizards feed and its rich Supabase cache:

    .\.venv\Scripts\python.exe scripts/refresh_wpn_cache.py

Routine refreshes use the ignored crawler handoff directory
`work/wpn-cache/latest`, then upsert the enriched result into Supabase.
They should not dirty tracked JSON files.

The ordinary daily surveyor is now cloud-owned by
`.github/workflows/daily-surveyor.yml`. It runs the WPN cache refresh,
observation staging, promoter, and integrity audit from GitHub Actions using
the repository secret `SUPABASE_DB_URL`. It can also run bounded
Instagram/Facebook surface probes when the corresponding saved session-state
secrets are present. It does not require the user's desktop or Codex session to
be open, and it does not commit generated WPN JSON during routine runs.

The ignored crawler handoff stores:

- `work/wpn-cache/latest/metadata.json`: retrieval settings and counts
- `work/wpn-cache/latest/events-all.json`: every returned Magic event
- `work/wpn-cache/latest/events-commander.json`: heuristic Commander/EDH/cEDH candidates
- `work/wpn-cache/latest/organizations.json`: deduplicated Wizards organizations/stores

The enriched ingest path also derives direct Wizards event/store links, local
date/time, normalized fee fields, stable event/content/organization
fingerprints, exact canonical venue IDs when an existing `src-wpn-*`
relationship proves the match, promotion-eligibility reasons, material rules
flags, field-presence metadata, and two deliberately non-authoritative source
grouping hints: strict title/weekday/time clusters and WPN template clusters.
The strict key also preserves format, team-size, and explicit proxy-rule
variants so same-slot events with materially different rules do not collapse.
These hints prevent occurrence-heavy WPN data from being mistaken for one new
canonical series per row; the shared promoter still makes the final identity
decision. Ordinary deltas remain in the cache; only exceptional machine
findings enter the quiet Supabase coordination inbox. Replaying an unchanged
raw snapshot under the same adapter contract performs no cache write.

The default query uses the public Los Alamitos, CA centroid and the Wizards
locator's 25-mile routine search radius. It does not store a private home
address. Candidate events are intentionally broad and should be verified before
being promoted into Supabase canonical research tables.

At session start, if the WPN cache is stale, prefer checking the cloud daily
surveyor state or manually dispatching the GitHub Action instead of doing a
desktop-local refresh. The Supabase row is the operational rich cache; the
tracked `output/wizards` files are historical/recovery/debug source snapshots
only. Use `scripts/refresh_wpn_cache.py --tracked-recovery-snapshot` only when
the task explicitly calls for refreshing that recovery snapshot.

## Current status

This is a deployed personal-use research app backed by Supabase as the default
read source. Controlled Supabase research writes are operational, and JSON is
only an on-demand generated recovery/debug fallback. The cloud daily surveyor is
the default WPN/Instagram/Facebook intake path, broad venue hydration is closed,
and remaining source-thin store checks are tracked as specific follow-ups rather
than a standing full-list research queue.
