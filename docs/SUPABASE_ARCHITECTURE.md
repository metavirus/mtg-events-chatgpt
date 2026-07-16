# Supabase Architecture

## Decision

Supabase is the operational source of truth for the hosted MTG Events app.
GitHub remains the versioned home for schema migrations, research methodology,
run notes, validation code, and reproducible data exports.

The existing JSON files remain the active application source until the initial
database import has been compared and accepted. They must not be removed or
silently replaced during migration.

## Why this change

The current proof-of-concept mixes several responsibilities:

- live research records are stored in large JSON files;
- communities are embedded in application code;
- recurring series and dated occurrences are partly blended;
- favorites, ratings, and notes exist only in browser local storage;
- every durable data correction requires a text-file rewrite and redeployment.

Moving operational records into PostgreSQL makes individual updates atomic,
enforces relationships, provides Unicode-safe storage, supports cross-device
personal state, and creates a durable queue for user-to-agent requests.

This does not eliminate the need for validation. It moves validation to better
boundaries: database constraints, row-level security, controlled import/export,
and small transactional updates.

## Data areas

### Research

Public, source-supported operational records:

- venues and communities;
- sources and entity-source relationships;
- event series and dated occurrences;
- event-source relationships;
- evaluations and inspectable rationale;
- research changes and evidence.

The public site may read these records. Browser clients may not create, update,
or delete them.

### Personal

Authenticated per-user records:

- favorites;
- deprioritized or hidden entities;
- ratings;
- interested, attended, or skipped planning state;
- private notes;
- update-read state;
- personal activity.

These records influence presentation and ranking but never overwrite research
truth.

### Workflow

Authenticated requests from the user to future Codex/agent runs:

- general requests;
- entity-specific research follow-up;
- data corrections;
- product or interface issues;
- watch instructions.

Requests move through `queued`, `in_progress`, `waiting_for_user`, `completed`,
or `declined`. Agent administrative access will use a server-side secret that
is never shipped to the browser.

## Identity and relationships

Existing stable string IDs are preserved during migration. The database does
not replace them with opaque generated IDs for canonical entities.

Event series and occurrences are distinct:

- a recurring event becomes an event-series row;
- a dated one-off becomes an event-series row plus an occurrence row;
- projected weekly appearances remain projections derived from the series;
- confirmed, cancelled, moved, or at-risk dated instances become occurrences.

Communities are first-class entities rather than constants embedded in
`app.js`.

## Security model

- The Supabase publishable key may be present in the browser application.
- Row Level Security is mandatory on every exposed table.
- Anonymous and authenticated clients may select public research tables.
- No browser policy permits writes to canonical research tables.
- Authenticated users may access only their own personal and workflow rows.
- Administrative and agent writes require a server-side secret.
- A `service_role` key must never be committed, pasted into client code, or
  stored in a public GitHub Pages build.

## Application contract

The app will use a data-adapter boundary:

1. load research data from the accepted source;
2. load authenticated personal/workflow state when signed in;
3. merge preferences into ranking and presentation without mutating research;
4. retain a read-only JSON fallback during migration;
5. switch the default source only after parity checks pass.

This keeps the UI independent of raw database table details and gives migration
and rollback a stable seam.

## Migration sequence

1. Checkpoint the accepted file-backed application.
2. Apply the initial database migration.
3. Import current stores, events, sources, changes, and community seed records.
4. Compare counts, IDs, references, and representative records.
5. Add authenticated personal-state loading and one-time local-storage import.
6. Add favorites, negative preferences, notes, and request capture.
7. Switch research reads to Supabase behind the adapter.
8. Retain an export/snapshot path back to GitHub.
9. Remove routine hand-editing of canonical JSON only after an accepted release.

## Acceptance gates

The app must not switch to Supabase until:

- every current entity ID is accounted for;
- duplicate and broken references are zero;
- recurring series and dated occurrences render equivalently;
- current source/evidence links remain reachable;
- anonymous clients cannot write research data;
- one authenticated user cannot read another user's private records;
- favorites and negative preferences persist across browsers;
- rollback to the file-backed checkpoint is documented and tested.

