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

## Historical UX-to-continuity checkpoint

This section records the earlier design checkpoint. Personal continuity has
since shipped; the data-plane split remains the governing part:

- finalize this contract in repo docs;
- keep the Supabase read seam intact;
- make the UI clearly assume durable hosted personal/workflow state instead of
  accidental browser-only state;
- shape the event, venue, updates, and communities surfaces around favorites,
  thumbs-down, ratings, notes, and requests as real product concepts;
- define the data structures and cutover expectations for those features.

Supabase is the operational research source and signed-in personal persistence
is implemented. Remaining continuity work is limited to richer workflow/request
handling and future automation.

## What is deliberately deferred

The accepted current product still deliberately defers:

- broader account/profile management beyond the lean personal sign-in;
- workflow/request processing beyond the existing bounded coordination lane;
- server-side request processing or agent automation;
- removal of the JSON fallback;
- unattended recurring research automation.

The safe current rule is:

- Supabase research reads and controlled research writes are operational;
- JSON is generated recovery/export fallback, not the manual canonical editing
  surface;
- signed-in personal state is operational and separate from research truth.

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

1. Controlled Supabase research writes are accepted for canonical research
   updates; JSON export/recovery is on-demand.
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
8. Unattended recurring research remains a separate future decision.

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
