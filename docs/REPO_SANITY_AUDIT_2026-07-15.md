# Repo Sanity Audit - 2026-07-15

## Purpose

Audit two risks before proceeding:

1. whether earlier failed-AI materials still silently govern the project;
2. whether active repo text/integrity issues could compound into future errors.

## Governance finding

The earlier imported materials do not appear to be active governing authority.
Their remaining role is limited to explicit deprecation/history references in:

- `docs/LEGACY_MATERIALS.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/DIRECTION_AUDIT_2026-07-15.md`
- brief reminder lines in `README.md` and `AGENTS.md`

That is acceptable so long as those files continue to describe the old materials
as historical archive only, not as operative specification.

The active project authority remains:

1. user decisions made during this project;
2. repo-native current docs, normalized data, and research artifacts;
3. raw source evidence gathered in this repo.

## Cleanup performed

- Removed the top-of-file imported-artifact inventory block from
  `docs/PROJECT_CONTEXT.md` so the current context file no longer foregrounds
  the failed earlier handoff.
- Added a standing instruction to `AGENTS.md` to surface structural risks early
  rather than letting them compound silently.

## Text-integrity finding

The measurable remaining full-repo integrity issue is not broken JSON or clear
live schema corruption. It is line-ending drift in a small set of important
files:

- `app.js`
- `changes.json`
- `events.json`
- `sources.json`
- `stores.json`
- `research/wizards-reconciliation-2026-07-14.json`

These files currently trip the explicit full-repo integrity audit because they
still contain CRLF line endings.

## Important interpretation

This means:

- the repo is now protected against new encoding/text-integrity mistakes by the
  release guardrails added in the text-integrity pass;
- but a deliberate normalization pass is still required to bring the older core
  files into full compliance with the new standard.

## Recommended next step

Do a separate, deliberate normalization pass for the remaining CRLF files with:

1. checkpointed diff review;
2. full-repo text-integrity audit before and after;
3. no unrelated research or UI edits mixed into the same change set.

## Completion update

That normalization pass has now been executed in the working tree, and the
explicit full-repo audit now passes:

`powershell -ExecutionPolicy Bypass -File scripts/validate_text_integrity.ps1 -FullRepo`

Important caveat: some normalized files were already carrying unrelated
research/data edits. Treat the normalization line in the sand as achieved from
an integrity perspective, while keeping publication/commit scope deliberate so
those unrelated edits are not bundled accidentally.
