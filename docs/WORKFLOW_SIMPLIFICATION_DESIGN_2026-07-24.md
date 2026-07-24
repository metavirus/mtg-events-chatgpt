# Workflow Simplification Design

Date: 2026-07-24  
Status: Revised Phase 1 design checkpoint; no implementation authorized

## Decision

Simplify the research workflow by reusing the existing Supabase model wherever
possible and adding only the missing operational structure. The prior Phase 2
shape is not approved because it risks replacing file ceremony with database
ceremony.

The minimum new system is:

- one entity/store surface-coverage table, unless schema inspection proves an
  existing table can already express it cleanly;
- no duplicate store-treatment, format-coverage, follow-up, activity, or WPN
  metadata tables unless existing tables demonstrably cannot carry the required
  fields;
- the least write machinery that removes proposal files, SQL packages, and
  manual connector ferrying from routine accepted work.

Research quality stays the same: material surfaces are checked or
dispositioned, source-supported events are captured when identity is good
enough, and uncertainty is expressed through confidence, caveats, ranking,
follow-ups, or review items instead of suppressing useful data.

## Reuse Map

| Proposed state | Default owner | New table? | Reasoning |
| --- | --- | --- | --- |
| Store treatment / planning disposition | `venues` plus latest `evaluations` | No | Venue status, fit, confidence, cautions, and planning interpretation already belong with the venue and evaluation record. Add a small enum/field only if the current schema lacks a way to say baseline complete, targeted follow-up only, low priority, or unresolved identity. |
| Surface coverage | New `entity_surface_coverage` table | Yes, likely | This is the genuinely missing state: official site, WPN, calendar, Instagram/Facebook, Discord, reviews, and other surfaces need durable per-entity dispositions without reopening whole main passes. |
| Format coverage | Derived from `event_series`, `event_occurrences`, source links, and verification timestamps | No | Commander, draft, prerelease/sealed, FNM, and specials coverage should be computed from current event data and source recency. Persist only a compact note on the surface row if a format-specific blocker cannot be derived. |
| Targeted follow-ups / Needs your input | `coordination_items` or `agent_requests` | No new queue | These already express bounded questions, review items, and assignments. Extend minimally only if a required status/type is missing. |
| Research activity / run result | `research_changes` and `coordination_activity` | No by default | Routine writes can record one compact change/activity row. Add `research_runs` only if current records cannot store operation type, actor, idempotency key, affected IDs, and outcome. |
| WPN snapshot metadata | `dataset_metadata`, plus one current artifact pointer if needed | No by default | Start with one replaceable 30-mile WPN snapshot and minimal metadata. Extend `dataset_metadata` before creating a new cache table. |
| Proposal/review state | Existing proposal path for high-risk only; `coordination_items` for lightweight review | No | Routine accepted writes should not create proposal files. High-risk review remains explicit. |

## Routine Operation Allowlist

Automatic routine writes may include only:

- source freshness and source disposition updates;
- surface coverage disposition updates;
- safe evidence linkage to existing entities;
- exact WPN-backed event upserts when venue name/address identity is branch-safe;
- verification refreshes for existing event rows;
- small evaluation wording/confidence updates that do not change candidate class
  or operating status materially;
- targeted follow-up creation or closure through the existing coordination
  queue.

Reviewed path remains required for:

- identity, name, address, branch, merge, or split changes;
- deletes and ambiguous retirements;
- operating-status changes;
- major venue rating/candidate-status changes;
- Signals unless the user explicitly approves routine Signal creation later;
- unresolved branch attribution;
- schema, auth, RLS, storage, or Edge Function changes;
- large batches or bulk corrections;
- anything that could silently corrupt trust if wrong.

## Write Mechanism Options

### Option A: durable local or server-side database credential

Configure one steward-only execution path so the existing runner can open a
transaction directly against Supabase. The Python validator remains the single
application contract. This is the simplest model if a DB URL, CLI link, or
connector-backed execution credential can be configured without exposing it to
the browser or committing secrets.

Pros: least duplicate logic, no generic JSONB mutation language, easy local
transaction tests.  
Cons: requires credential handling and a clear local secret location.

### Option B: small typed RPCs

Create a few narrow Postgres functions such as:

- `record_surface_check(...)`;
- `upsert_wpn_event_occurrence(...)`;
- `refresh_source_disposition(...)`;
- `record_targeted_followup(...)`.

Pros: small server-side surface, typed parameters, narrow grants, easier audit.  
Cons: more functions to maintain, may still leave multi-operation batches
needing orchestration.

### Option C: generic routine-refresh RPC

Create a generic `apply_research_refresh(payload jsonb, ...)` RPC.

Pros: one transaction call for many routine operations.  
Cons: likely duplicates the Python validator and becomes a second mutation
language.

Recommendation: start with **Option A** if a steward-only credential can be
configured cleanly. If not, use **Option B** with one or two typed RPCs for the
highest-friction routine writes. Do not build the generic JSONB RPC unless Phase
2 proves it is smaller than both alternatives.

## Security Model

For any write function or credential, Phase 2 must specify and prove:

- schema: prefer a non-exposed schema such as `steward`, or use public only when
  there is a strong reason;
- function mode: prefer `SECURITY INVOKER`; use `SECURITY DEFINER` only with a
  documented need, fixed `search_path`, and explicit guards;
- grants: revoke execute from `PUBLIC`, `anon`, and `authenticated`;
- permitted role: a single steward service role or dedicated database role, not
  browser `anon` or ordinary `authenticated`;
- credential location: local environment/secret store only, never committed and
  never shipped in browser code;
- proof: browser clients cannot call the write path through REST/RPC, and RLS or
  grants prevent accidental public execution.

If a `SECURITY DEFINER` function is used, it must set a fixed `search_path`,
avoid dynamic SQL, write only allowed tables, validate expected entity IDs, and
return concise affected-row summaries.

## Idempotency and Conflicts

Routine writes must be safe to retry:

- every write request uses a caller-stable idempotency key;
- idempotency keys are unique in the activity/change owner table;
- replaying the identical request returns the original result without duplicate
  rows or duplicate activity;
- WPN-backed events use stable external event IDs when available and stable
  fallback keys otherwise;
- updates include an expected `updated_at`, version, or previous value when
  overwriting mutable fields;
- stale writes return a conflict response rather than overwriting newer human or
  agent changes;
- retries must not create duplicate source links, evidence rows, follow-ups, or
  activity entries.

## WPN Cache

Start with one replaceable current WPN snapshot:

- default scope: 30-mile local snapshot;
- fields: `retrieved_at`, `expires_at`, source/crawler version, stable artifact
  location, and covered Wizards organization IDs;
- default reuse window: 24 hours;
- bypass only when same-day freshness matters, the store is outside the current
  snapshot, or another source contradicts the snapshot;
- distinguish "recent WPN snapshot reused" from "fresh WPN pull" in any run
  result.

Do not build generalized query-footprint caching until ordinary use proves one
current local snapshot is insufficient. WPN snapshots remain source artifacts,
not canonical app JSON.

## Surface Coverage

The one likely new table should answer: has this material surface been checked
or dispositioned, and what should happen next?

Likely fields:

- entity kind and ID;
- surface type: official site, WPN/EventLink, event page, Instagram, Facebook,
  Discord/community, review texture, other;
- route/source ID or URL when known;
- disposition: inspected_current, inspected_thin, route_found_content_not_inspected,
  blocked_gated, unsafe_tbd, not_found, stale, contradiction, not_material;
- last checked at;
- last useful at;
- materiality: high, normal, low;
- latest result summary;
- follow-up coordination item ID, if a later targeted check is needed.

This table should not duplicate event format coverage or venue evaluation. It
should prevent rediscovery of blocked/thin surfaces and make a baseline pass
closeable once each material surface is considered.

## Routine Acceptance Criteria

An ordinary database refresh should land with:

- zero repo file changes;
- zero Git commit;
- one state/cache read;
- one transactional write call;
- returned affected rows sufficient for confirmation;
- no proposal JSON;
- no SQL package;
- no export;
- no ledger edit;
- no separate run note;
- landing overhead under three minutes, excluding genuine source inspection.

High-risk work can still use proposals, migrations, fuller readbacks, and Git
checkpoints.

## Smaller Phase 2 Tranche

Implement nothing broad. Phase 2 should prove the minimum viable operating
change:

1. Inspect the live schema once and produce the final reuse map against actual
   tables and columns.
2. Add only the surface-coverage structure, unless schema inspection proves even
   that can be represented cleanly by an existing table.
3. Reuse or minimally extend `coordination_items` or `agent_requests` for
   targeted follow-ups. Do not create another queue.
4. Choose the least write mechanism:
   - first try a durable steward DB execution credential for direct
     transactions from the existing runner;
   - if that is not available, add one narrow typed RPC for surface checks;
   - do not add a generic JSONB refresh RPC in this tranche.
5. Define exact grants, credential storage, and browser non-access proof before
   any live write path is accepted.
6. Prove only:
   - validation/no-write;
   - one prohibited operation rejected;
   - one tiny legitimate routine refresh;
   - the identical request replayed with no duplicate effect;
   - one activity/change result recorded through existing activity/change
     structures;
   - browser roles cannot execute the path.
7. Do not seed 4-6 stores. Use one tiny proof target only.
8. Do not change app UI, resume research, build automation, migrate ledgers, or
   delete legacy scripts.
9. Stop and report measured overhead.

## Mandatory Retirement Phase

After three successful routine runs using the new path, do a separate retirement
tranche:

- remove active references to routine proposal/package/ledger workflow;
- archive historical material out of active steering docs;
- delete obsolete commands that are not needed by the single recovery exporter;
- keep only the high-risk/recovery path and the routine direct path active.

Do not leave two routine workflows alive indefinitely.
