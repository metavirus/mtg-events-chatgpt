# Southern California Magic Intelligence

MTG Events helps a player near Los Alamitos find a game, compare stores and
communities, and decide where to return. Today shows same-day options, Events
covers upcoming games, and Places holds store details.

## Developing MTG Events

Codex owns routine development in the published `mtg-events-chatgpt` Cloud
environment. A new developer chat can pick up the work with the Windows PC off.

| To do this | Start here |
| --- | --- |
| Start a new change | Select the published environment and base the change on current `origin/main`. Run the [offline Chromium smoke and text checks](docs/ENVIRONMENT_READINESS.md#published-environment-quick-start) before editing. |
| Resume an existing change | Recover the pushed branch, PR, checks, and next action using [Session Bootstrap](docs/SESSION_BOOTSTRAP.md#resume-after-context-loss). |
| Understand product decisions and priorities | Read [Project Context](docs/PROJECT_CONTEXT.md), then [Current Frontier](CURRENT_FRONTIER.md) and the relevant [backlog entry](docs/WORK_BACKLOG.md). |
| Correct live store or event data | Use the authorized operational runner and the [controlled write workflow](docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md). Verify the affected records there. A documentation change alone leaves the live listing in place. |
| Investigate a scheduled refresh | Check the corresponding GitHub Actions run. The [runtime map](docs/SESSION_BOOTSTRAP.md#where-the-work-runs) also identifies the app host, database, and browser recovery path. |

The researched visual and interaction direction is documented in
[`docs/UX_RESEARCH.md`](docs/UX_RESEARCH.md).

The logo/avatar sourcing and composition rules for Places and Communities are
documented in [`docs/LOGO_SOURCING_SOP.md`](docs/LOGO_SOURCING_SOP.md).

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

Former Windows development instructions are preserved in the
[pre-Cloud bootstrap](docs/archive/SESSION_BOOTSTRAP_PRE_CLOUD_CUTOVER.md).
See [Legacy Materials](docs/LEGACY_MATERIALS.md) for earlier design references.

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

For Cloud development, run `python3 scripts/validate_text_integrity.py --full-repo`.

For the Windows operational checkout, use the local release check:

    powershell -ExecutionPolicy Bypass -File scripts/validate_text_integrity.ps1

Full-repo audit in the Windows checkout:

    powershell -ExecutionPolicy Bypass -File scripts/validate_text_integrity.ps1 -FullRepo

Optional local hook setup if you use `pre-commit`:

    pre-commit install

## Wizards locator refresh

For an authorized manual refresh on the Windows operational runner, first
complete the [operational gate](docs/ENVIRONMENT_READINESS.md#operational-gate).
Install the crawler dependencies there if needed:

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

Discord has a separate guarded daily workflow:
`.github/workflows/daily-discord-survey.yml`. It runs the bounded Discord
watchlist survey with Signal/Event writes disabled and uploads JSON logs as an
Actions artifact. It requires `SUPABASE_DB_URL` plus
deployable authenticated Discord session state. The workflow now supports
`DISCORD_READONLY_STORAGE_STATE_JSON` for small states, or the expected
large-secret lane: committed encrypted
`.github/secrets/discord-readonly-storage-state.json.enc` plus repository secret
`DISCORD_READONLY_STORAGE_STATE_PASSPHRASE`. The first full-profile zip attempt
was about 215 MB and is dead; the August 15 storage-state proof read LCC
`#events` from a fresh empty profile using only a roughly 216 KB state file.
Missing or expired Discord state is a deployment configuration failure, not
permission to loosen the guarded browser route.

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

When investigating stale WPN data, check the latest daily surveyor run in
GitHub Actions before considering an authorized manual refresh. The Supabase row is the operational rich cache; the
tracked `output/wizards` files are historical/recovery/debug source snapshots
only. Use `scripts/refresh_wpn_cache.py --tracked-recovery-snapshot` only when
the task explicitly calls for refreshing that recovery snapshot.

## Current status

Today is the landing page: same-day choices with store logos, opening/closing
hours, time until close, and directions on the event cards. Briefing contains
community/event changes and favorite-store shortcuts. Events covers future browsing;
Places is the store reference. Hidden or thumbed-down items remain recoverable
and are excluded from ordinary recommendations. Current next work is recorded
in `CURRENT_FRONTIER.md` and `docs/WORK_BACKLOG.md`.

This is a deployed personal-use research app backed by Supabase as the default
read source. Controlled Supabase research writes are operational, and JSON is
only an on-demand generated recovery/debug fallback. The cloud daily surveyor is
the default WPN/Instagram/Facebook intake path, broad venue hydration is closed,
and remaining source-thin store checks are tracked as specific follow-ups rather
than a standing full-list research queue.
