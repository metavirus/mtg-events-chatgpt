# Project Context — Pre-Supabase History

> Historical archive extracted from `docs/PROJECT_CONTEXT.md` on 2026-07-24.
> This material explains provenance and is not active operating guidance.

## Repository checkpoint — 2026-07-17

Completed:

- A working static calendar/store/change interface deployed for personal use on
  GitHub Pages at checkpoint commit `dd44e20`, tagged
  `checkpoint/personal-use-deployed-supabase-default-2026-07-17`.
- Supabase as the default application read source, with `?data=json` retained as
  the explicit file-backed fallback.
- Controlled Supabase research-write and deterministic JSON export/recovery
  workflows for future research updates.
- An accepted local UX pass that makes Today, Events, Places, Updates, and
  Communities usable enough to move out of polish mode.
- A repeatable Wizards GraphQL collector using a public Los Alamitos centroid.
- A successful 26-mile buffered snapshot containing 1,231 Magic events, 669
  Commander candidates, and 77 organizations.
- A Monday GitHub Actions raw snapshot refresh.
- First-pass reconciliation of repeated explicit nearby Commander listings.
- Second-pass reconciliation of repeated explicit listings in the available
  26-mile snapshot; distance is descriptive rather than an exclusion rule.

At that checkpoint, the normalized data was useful but intentionally
provisional and heavily shaped by Commander-first research. The app needed to
disclose that limitation rather than imply comprehensive format coverage.

The 2026-07-17 cutover established controlled Supabase research writes as the
forward path. Generated JSON became recovery/export output rather than a manual
canonical editing surface.

## Deprecated historical inventory

The v0.4 workbook contained 15 qualitative store audits, six event/recurring-play
records, and 33 sources. Its fields included priority tier, evidence confidence,
research status, ranking reason, assessment notes, primary communication
channel, communication notes, current Commander evidence, open questions,
radius status, and last-verified date.

This inventory is recorded only to explain project history. It is not a research
source for ordinary work. See `docs/LEGACY_MATERIALS.md` for the narrow
historical-comparison exception and the rule for independently adopting any old
idea.

## Historical pre-Supabase model gaps

The generated JSON model then lacked several layers:

- immutable observations with timestamps, hashes, raw payload paths, and parser
  versions;
- claim-level provenance and conflicts;
- field-level confidence;
- event series versus dated occurrence separation;
- store aliases and historical identity/location data;
- communication profiles and channel maintenance patterns;
- radius status and explicit edge review;
- ranking reasons tied to evidence;
- research backlog and open questions;
- before/after change values and supporting observation IDs.

## Legacy-material status

Imported early materials are deprecated as active inputs. Current work uses
repo-native sources of truth. Historical files may remain preserved, but they
must not shape the product by inertia.
