# Supabase Continuity Model

Last updated: 2026-07-17

## Purpose

This note is the plain-language contract for the hosted continuity layer.
It exists so product, research, and implementation work all use the same
boundary:

- what the browser may read now;
- what the eventual signed-in user state should store;
- what future Codex/agent workflow requests should store;
- what remains deliberately deferred until after the Supabase continuity and
  default-source cutover gates.

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

This is the user's private cross-device state. It affects ranking,
presentation, and memory, but never overwrites research truth.

Expected durable records:

- favorites
- thumbs-down / hidden / deprioritized items
- one-to-five ratings
- personal notes
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

In other words, the app may continue to design for durable hosted continuity, but
the next stage is not more UX shaping. It is Supabase continuity /
operational-source readiness.

## What is deliberately deferred

The accepted local UX revision did **not** need to ship:

- real signed-in browser writes for personal state;
- final auth onboarding or session UX;
- final row-level security policy expansion for personal/workflow writes;
- server-side request processing or agent automation;
- Supabase as the default research source;
- removal of the JSON fallback.

The safe current rule is:

- design the durable system now;
- switch on the real writes only after a deliberate gate.

## Browser-local state during transition

The current browser-local adapter is only a transitional stand-in.

It is still useful because it lets us:

- test favorite and thumbs-down behavior;
- test event/venue ranking effects;
- test notes and quiet activity-log UX;
- validate whether the interaction model is actually worth preserving.

But it should now be treated as temporary scaffolding, not a final storage
answer.

## Cutover sequence

When moving beyond the accepted local UX revision, the intended order is:

1. Keep research reads behind the adapter seam.
2. Keep JSON as the accepted default until the separate default-source cutover
   gate is signed off.
3. Add authenticated personal/workflow table reads.
4. Import or migrate existing browser-local personal state once.
5. Turn on hosted writes for favorites, thumbs-down, ratings, notes,
   update-read state, and `Ask Codex` requests.
6. Validate that hosted personal state survives refresh, browser change, and
   device change.
7. Only then consider switching the hosted app's default research source away
   from the file-backed seed.

## Product consequences

This contract implies a few design decisions:

- a favorite should change ranking and monitoring, not just paint a heart;
- a thumbs-down should hide or demote without deleting research truth;
- notes should live on the server so they are not trapped in one browser;
- `Updates` unread state should be durable;
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
