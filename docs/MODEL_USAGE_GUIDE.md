# Model Usage Guide

Last updated: 2026-07-16

Use the cheapest model that still preserves judgment and safety.

## Default choices

### Use 5.4 for bounded mechanical work

Good fits:

- small CSS/layout tweaks after the design decision is already made;
- text-only doc updates;
- running validation;
- local preview checks;
- committing an already-reviewed patch;
- applying a narrow known bug fix.

Avoid 5.4 when the work needs architecture judgment, ambiguous research
analysis, schema/RLS decisions, or final publish confidence.

### Use 5.5 for normal build and research execution

Good fits:

- implementing an agreed UI tranche;
- routine source-supported store research using established SOPs;
- data-adapter work after the architecture is decided;
- Supabase read-only integration work with no new auth/RLS decisions;
- issue triage where the correct path is mostly known.

This is the normal working model when we want quality without burning the
largest quota.

### Use 5.6 for judgment-heavy gates

Use 5.6 when the question is not just "can we edit this?" but "what is the
right shape of the system?"

Examples:

- schema, RLS, auth, or durable user-data architecture decisions;
- final sanity review before publishing;
- diagnosing data corruption, encoding drift, or structural mismatch;
- major UX architecture or prioritization decisions;
- deciding whether a research pass is complete enough to promote/demote a
  store;
- writing or revising standing SOPs after a failure.

## Current recommendation

- Stay on 5.5 for the Supabase checkpoint, read-adapter groundwork, and agreed
  UI tranche implementation.
- Move up to 5.6 before choosing the authenticated write model, changing RLS, or
  doing a final pre-publish review.
- Drop to 5.4 only after there is a concrete, bounded patch list.

