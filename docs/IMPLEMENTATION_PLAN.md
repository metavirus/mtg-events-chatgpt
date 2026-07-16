# Implementation Plan

## Governing direction

Build the first complete private version from the user decisions, research,
normalized evidence, and repo-native product synthesis created in this project.
Imported artifacts from earlier AI attempts are deprecated and excluded from
ordinary project work. The existing static interface is also a disposable proof
of data loading and basic calendar rendering, not a visual or architectural
specification.

The product covers the local Magic: The Gathering landscape. Commander is the
user's primary format and receives the strongest personal-fit analysis, but the
system must also model and surface prerelease, sealed, draft, and other notable
Magic opportunities. Store MTG-focus and Commander fit remain separate concepts.

## V1 product foundation

V1 should establish the durable interface structure so core features do not have
to be stapled onto an incompatible shell later. It includes:

- a calendar-first application with scrolling upcoming, week, and month views;
- a useful Home/Highlights surface for new, changed, best-fit, special, and
  at-risk opportunities;
- venue and community destinations with master-detail navigation;
- event-series and dated-occurrence details with recurring, confirmed,
  projected, cancelled, and at-risk states kept distinct;
- source links, source health, freshness, confidence, conflicts, and plain-language
  explanations of how conclusions were reached;
- favorites, ratings, timestamped notes, visit history, planning states, and a
  quiet activity log;
- deep links, browser history, visible filters, search, directions, Google
  Calendar export, and accessible drawers/popovers;
- responsive behavior that preserves rich desktop research while supporting
  practical mobile lookup and actions.

Less-vetted records remain available. They should eventually receive explicit,
separate labels for:

- **research status:** `discovery`, `reviewed`, or `deepened`
- **fit grade:** overall practical-quality grade
- **confidence:** support level for the current interpretation
- **event evidence state:** `corroborated`, `single source`, `projected`, or
  `needs confirmation`

Weakness changes presentation and ranking; it does not erase the record.

## Build sequence

### Current mega-revision boundary

The current build pass should improve the user-facing decision experience while
leaving the newly seeded Supabase database in a safe read-first posture.

Include in this pass:

- Today event curation and ranking so the best options are easier to see first;
- practical format filters for Commander, prerelease/sealed, draft, and other
  Magic opportunities;
- search that covers event title, store/venue name, format, tags, and useful
  description text;
- an Events catalog that is easier to sort and scan while still retaining the
  complete event universe;
- a Fresh Signals / For You rail that remains accessible when the viewport gets
  narrower;
- clearer venue scoring display for research status, fit grade, numeric score,
  confidence, and rationale;
- Updates polish for naming, readability, direct links, and useful categories;
- obvious responsive, clickability, terminology, and empty-state fixes.

Defer from this pass:

- authenticated Supabase write paths for favorites, thumbs-down, personal notes,
  ratings, or `Ask Codex` requests;
- daily/weekly automation and Discord/Wizards monitoring agents;
- broad research backfill or store re-audits beyond records needed to validate
  the UX;
- making Supabase the default source;
- publishing until local behavior has passed a deliberate sanity check.

### 1. Freeze the current research contract

- Document the fields the first app build can reliably consume from the current
  JSON while preserving links to richer run notes and sources.
- Add validation for duplicate IDs, broken references, invalid dates/enums, and
  accidental private-location data.
- Add explicit dataset-coverage metadata. The current event seed is heavily
  Commander-weighted and must not be presented as a complete local Magic calendar.
- Define adapters so the current `store`-based records can feed a venue-oriented
  UI without destructive ID changes.

### 2. Build the application shell and navigation

- Establish Home, Calendar, Events, Venues, Communities, New & Changed, and
  Research destinations.
- Preserve selected date, filters, entity, and scroll context through URLs and
  browser navigation.
- Implement the shared visual system, responsive layout, focus behavior, and
  reusable cards, chips, drawers, tabs, and source-status components.

### 3. Build the calendar and intelligence surfaces

- Make the chronological upcoming view the default working surface.
- Add complete week and month views, including compact titles and overflow
  drilldowns rather than hiding events.
- Add Friday-Sunday emphasis without suppressing weekday opportunities.
- Add the Highlights rail/panel for new discoveries, prereleases/specials,
  best fits, material changes, and verification/displacement warnings.
- Keep all relevant Magic formats filterable and visually legible.

### 4. Build entity and event drilldowns

- Implement venue and community master-detail views without merging the two
  entity types.
- Implement event-series and occurrence details with raw wording, normalized
  interpretation, evidence, freshness, and unresolved questions.
- Add source-health timelines, maps/directions, registration/source actions,
  Google Calendar export, and `Why?` explanations.
- Surface MTG-focus, player-pool/scale clues, social accessibility, schedule
  reliability, and personal fit as separate evidence-aware dimensions.

### 5. Add the Supabase continuity layer

- Apply and validate the database schema described in
  `docs/SUPABASE_ARCHITECTURE.md`.
- Import and compare the current research dataset without switching the live
  application until parity checks pass.
- Add favorites for venues, communities, and event series.
- Add interested/attended/skipped states for occurrences.
- Add one-to-five ratings plus timestamped notes at venue, community, series,
  occurrence, and visit scope where appropriate.
- Add the compact personal/research/system activity log.
- Add entity-specific `Ask Codex` requests with durable queued, in-progress,
  waiting-for-user, and completed states.
- Keep personal workflow state namespaced from canonical research data while
  using stable entity IDs to combine them in ranking and display.
- Retain GitHub research notes and reproducible snapshots with explicit
  attribution.

### 6. Integrate, validate, and seed

- Load the strongest researched venue and event records first.
- Include partially vetted and discovery records with conspicuous coverage and
  confidence labels rather than silently omitting them.
- Test calendar boundaries, recurrence display, source links, state persistence,
  keyboard/touch behavior, mobile layout, and empty/unknown/conflicting states.
- Perform a visual and content QA pass using the user's priorities before hosting.

## Deferred until after the usable V1

These are important but do not need to block the first complete interface:

- autonomous daily/weekly/biweekly collection agents;
- production reconciliation pipelines and immutable claim extraction;
- automated upstream Wizards/WPN vocabulary monitoring;
- sophisticated learned ranking or inference;
- exhaustive backfill of every discovery lead;
- deep historical analytics.

The V1 data and UI contracts must leave clean places for these capabilities, but
the build should not spend the remaining near-term effort implementing them
before the user has a rich, usable application.

## Acceptance checkpoint

V1 is ready when the user can open the private web app on desktop or mobile,
understand the actual coverage and freshness of the data, browse upcoming/week/
month Magic opportunities, investigate venues and communities, see why records
are promising or uncertain, follow sources and directions, save personal state,
and add durable notes without relying on the chat history.
