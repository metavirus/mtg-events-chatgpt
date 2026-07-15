# Research Run: Commander Open-Play Modeling Note

## Run metadata

- Run ID: `2026-07-14-open-play-modeling-note`
- Started: 2026-07-14 23:48:00 -07:00
- Completed: 2026-07-14 23:50:00 -07:00
- Researcher/agent: Codex

## Objective

Preserve the modeling clarification that explicit Commander open-play listings
are meaningful event types even when they contain little structural detail.

## Captured clarification

- Many stores explicitly identify a Commander open-play day/time.
- For Finch, Sunday is the open-play Commander day.
- Open play usually carries fewer specifics than structured Commander, but that
  sparsity should not cause the event type itself to be erased.

## Reconciliation decision

Explicit Commander `open play` should be modeled as its own event type and kept
distinct from:

- structured pod-assignment Commander
- staff-paired or paid-entry Commander
- competitive/cEDH Commander

## Data changes

- Updated methodology and project-context documents
- Updated frontier and backlog wording
- Added a change-log entry

## Validation

- No normalized JSON schema changes were required for this note.
