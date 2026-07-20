# Supabase Continuity Model

Last updated: 2026-07-19

## Purpose

This note is the plain-language contract for the hosted continuity layer.
It exists so product, research, and implementation work all use the same
boundary:

- what the browser may read now;
- what the eventual signed-in user state should store;
- what future Codex/agent workflow requests should store;
- what remains deliberately deferred after the accepted Supabase research-read
  and research-write gates.

## Working split

The hosted product has three distinct data planes.

### 1. Research truth

This is the public, evidence-backed project record:

- venues
- communities
- event series
- dated event occurrences
- sources
- research changes
- calibrated evaluations
- source relationships

This layer explains what we believe to be true and why.

It may be read by the browser.
It must not be writable from the browser.

### 2. Personal continuity

This is the user's signed-in cross-device state. It affects ranking,
presentation, and memory, but never overwrites research truth.

Implemented durable records:

- favorites
- thumbs-down / hidden / deprioritized items
- one-to-five ratings
- personal notes

Expected later records:

- interested / attended / skipped states
- update-read state
- lightweight personal activity history

The key product rule is simple:

- research says what the landscape appears to be;
- personal continuity says how this particular user wants that landscape shown.

### 3. Workflow / requests

This is the durable queue between the user and future Codex/agent work.

Expected durable records:

- general `Ask Codex` requests
- store-specific follow-up requests
- event-specific correction requests
- research leads
- watch instructions
- product / UX issues

Expected lifecycle:

- `queued`
- `in_progress`
- `waiting_for_user`
- `completed`
- `declined`

This is not part of the public research record. It is private operational state.

## What belonged in the accepted local UX revision

The local UX revision was allowed to do the following, and the product direction
now assumes this split:

- finalize this contract in repo docs;
- keep the Supabase read seam intact;
- make the UI clearly assume durable hosted personal/workflow state instead of
  accidental browser-only state;
- shape the event, venue, updates, and communities surfaces around favorites,
  thumbs-down, ratings, notes, and requests as real product concepts;
- define the data structures and cutover expectations for those features.

In other words, the app may continue to design for durable hosted continuity,
but the next stage is not more UX shaping. Supabase is already the operational
research source; remaining continuity work is authenticated personal/workflow
state and future agent/request handling.

## What is deliberately deferred

The accepted local UX revision and subsequent Supabase checkpoint did **not**
need to ship:

- real signed-in browser writes for personal state;
- final auth onboarding or session UX;
- final row-level security policy expansion for personal/workflow writes;
- server-side request processing or agent automation;
- removal of the JSON fallback;
- unattended recurring research automation.

The safe current rule is:

- Supabase research reads and controlled research writes are operational;
- JSON is generated recovery/export fallback, not the manual canonical editing
  surface;
- switch on authenticated personal/workflow writes only after a deliberate gate.

## Browser-local state during transition

The browser-local adapter is now the signed-out and write-failure fallback.

It is still useful because it lets us:

- preserve preference actions when the user is signed out;
- keep the app usable if Supabase personal-state reads or writes fail;
- support a one-time import into the signed-in account when remote state is
  empty.

It is no longer the intended durable storage answer for favorites,
deprioritize choices, ratings, or private notes.

## Cutover sequence

Current sequence:

1. Controlled Supabase research writes and deterministic JSON export/recovery
   are accepted for canonical research updates.
2. Supabase is the default application read source, with `?data=json` as the
   explicit recovery path.
3. Research has resumed through controlled Supabase writes in small direct
   batches.
4. Authenticated personal-state reads and writes are implemented for favorites,
   thumbs-down/deprioritize choices, ratings, private notes, and per-user
   Signals read-state.
5. Existing browser-local personal state imports once when the signed-in remote
   state is empty.
6. Hosted personal-state persistence has been validated against live Supabase
   rows.
7. Workflow/request data, durable `Updates` unread state, and richer visit history remain
   deferred.
8. Only after the corrected manual research method has completed several clean
   batches should unattended recurring research be considered.

## Product consequences

This contract implies a few design decisions:

- a favorite should change ranking and monitoring, not just paint a heart;
- a thumbs-down should hide or demote without deleting research truth;
- notes now live on the server when signed in so they are not trapped in one
  browser;
- Signals read-state is a personal overlay: marking a signal read hides it from
  the landing surface for that signed-in user without changing the signal,
  source, event, place, or research record;
- `Updates` unread state should become durable later;
- an in-app note like "check store X" should become a real queued request, not
  just an ephemeral comment in local storage;
- research evidence and personal judgment must remain visibly separate.

## Acceptance checkpoint for this phase

This phase is complete when:

- the repo clearly distinguishes research truth, personal continuity, and
  workflow/request data;
- the accepted UX work is built against that distinction;
- deferred write/auth work is explicit rather than accidental;
- future implementation can proceed without reopening the product-shape debate.
