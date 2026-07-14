# Implementation Plan

## Phase 0 — Preserve and publish current work

- Publish the Wizards reconciliation and project/design documentation.
- Preserve the original handoff artifacts without overwriting current files.
- Verify JSON, referential integrity, privacy rules, and existing app behavior.

## Phase 1 — Evidence foundation

- Commit schemas for venue, source, observation, claim, series, occurrence,
  research decision, and generated views.
- Add validation, privacy, duplicate-ID, and referential-integrity tests.
- Generalize `store` to `venue` without losing stable existing IDs.
- Add source-health observations, including broken/stale/no-result outcomes.
- Convert the Wizards snapshot into immutable observations.
- Import v0.4 qualitative research without flattening its richer evidence.

## Phase 2 — Reconciliation and maintenance

- Reconcile all 77 Wizards organizations to venues or explicit exclusions.
- Build weekly known-source refresh and biweekly new-venue discovery runs.
- Generate eight weeks of clearly labeled projections from supported recurrence.
- Add source-coverage, freshness, conflict, and research-queue indexes.
- Produce repository-backed run notes for every substantive pass.

## Phase 3 — Core hosted app

- Implement the scrolling agenda as the default route.
- Add week/month views and Friday–Sunday focus.
- Add Highlights/New & Changed right rail.
- Implement venue master-detail pages and event drawers/details.
- Add concise generated titles while preserving raw source wording.
- Add search, visible filters, deep links, directions, source links, and calendar export.
- Apply the researched dark visual system and accessibility requirements.

## Phase 4 — Private personal layer

- Select a small hosted persistence service compatible with private/unlisted access.
- Add a lightweight access boundary.
- Add favorites, planning states, ratings, notes, visits, preferences, and activity log.
- Keep private records linked by stable public IDs and excluded from GitHub data.

## Phase 5 — Analytical refinement

- Implement explainable personal-fit and venue ranking.
- Add bracket/power inference with evidence and confidence.
- Add before-you-go cards, comparisons, source health, and verification warnings.
- Tune rankings from personal visits without rewriting official evidence.

## First build milestone

The first meaningful milestone is a validated generated calendar containing venue
records, series, confirmed occurrences, projections, source health, concise titles,
and evidence links. Build the richer interface directly on that durable contract.

