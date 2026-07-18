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

Because browsers restrict local JSON loading, run a tiny local server in this folder:

    python -m http.server 8000

Then open:

    http://localhost:8000

## Data source

The operational research source is now Supabase. The hosted app reads Supabase
by default, while `?data=json` remains the explicit recovery/export fallback.

Generated JSON files are recovery artifacts, not the ordinary research editing
surface:

- `stores.json`: exported venue information and assessments
- `events.json`: exported recurring and one-time events
- `sources.json`: exported provenance and last-check dates
- `changes.json`: exported audit/change feed

The application code does not need to change when records are added or revised.
Research updates should go through the controlled Supabase workflow in
[`docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md`](docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md);
manual canonical JSON research edits are forbidden except for generated
export/recovery work.

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

    python -m pip install -r requirements.txt

Refresh the public Wizards snapshot:

    python crawler/wizards_locator.py --radius-miles 25 --output output/wizards

The crawler stores:

- `output/wizards/metadata.json`: retrieval settings and counts
- `output/wizards/events-all.json`: every returned Magic event
- `output/wizards/events-commander.json`: heuristic Commander/EDH/cEDH candidates
- `output/wizards/organizations.json`: deduplicated Wizards organizations/stores

The default query uses the public Los Alamitos, CA centroid and the Wizards
locator's 25-mile routine search radius. It does not store a private home address. Candidate events
are intentionally broad and should be verified before being promoted into the
app's curated `events.json` and `stores.json` files.

GitHub Actions refreshes the Wizards snapshot every Monday and commits changed
`output/wizards` data back to the repository.

## Current status

This is a deployed personal-use research app backed by Supabase as the default
read source. Controlled Supabase research writes are operational, JSON remains
available as a generated fallback, and research has resumed in small direct
Project Steward batches. The dataset is useful but still not a complete local
Magic calendar; the finite venue queue is tracked in
[`docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md`](docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md).
