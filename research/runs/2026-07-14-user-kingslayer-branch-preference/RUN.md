# Research Run: User Kingslayer Branch Preference Note

## Run metadata

- Run ID: `2026-07-14-user-kingslayer-branch-preference`
- Started: 2026-07-14 23:18:00 -07:00
- Completed: 2026-07-14 23:20:00 -07:00
- Researcher/agent: Codex
- Related prior run or checkpoint: `research/runs/2026-07-14-kingslayer-refinement/`

## Objective

Preserve a user-supplied ranking nuance about the relative importance of
Kingslayer branches so later venue weighting stays aligned with the user's
actual travel preferences.

## Finding

- Fountain Valley should remain the primary weighted Kingslayer branch.
- Lake Forest is not too far away and should remain in the watch set as a
  secondary branch for potentially interesting events.
- Oceanside is too far away and should be treated as effectively out of scope.

## Reconciliation decision

This is user preference context, not an official/public store fact. It should be
stored as an attributed user field note and used to inform ranking and research
scope rather than masquerading as store-operated evidence.

## Data changes

- Added `src-user-kingslayer-branch-preference-2026-07-14`
- Linked the note to Kingslayer Fountain Valley and Kingslayer Lake Forest
- Updated frontier context so the weighting nuance is visible to future sessions

## Validation

- JSON validation required after edits.
