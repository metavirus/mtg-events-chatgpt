# Canonical Event Ingest Agent Design

Status: normalized ingest core and WPN staging/preview implemented; canonical mutation remains
Updated: 2026-08-01

## Decision

Build one source-neutral canonical event promotion layer. WPN is its first
adapter, not its organizing abstraction.

Each collection surface keeps a small source-specific adapter because WPN,
Discord, Instagram, official calendars, registration platforms, and preserved
images expose different raw structures. Every adapter emits the same normalized
event-observation contract. One shared reconciler then decides whether and how
that observation maps to canonical `event_series`, `event_occurrences`,
`sources`, and `event_sources`.

This avoids both bad extremes:

- one WPN-specific promoter later copied for every source; and
- one giant crawler that pretends every source behaves like every other source.

The boundary is:

```text
source collector -> source adapter -> normalized event observation
                 -> shared canonical reconciler -> presentation consequences
```

## Implemented promoter foundation (2026-08-01)

Migration `20260801184712_add_canonical_event_ingest_core.sql` now provides the
service-only operational foundation described below:

- `event_ingest_runs` for one compact row per attempted cache/run;
- `event_observations` for typed, source-neutral observations plus bounded
  source-native evidence;
- `event_source_bindings` for durable upstream-to-canonical identity;
- `stage_wpn_event_observations(...)` for one set-based WPN adapter load; and
- `preview_event_ingest_reconciliation(...)` for read-only exact-match,
  safe-create/split, inherited-hide, ineligible, and ambiguity classification.

`scripts/stage_wpn_event_observations.py` is the one-command operator path. The
first live staging pass wrote 1,081 unique observations in roughly 0.3 seconds
of database work (1,079 eligible, 2 held); an identical replay returned the
same run and created no duplicates. The preview classified exactly 650 eligible
observations as already represented, matching the prior adversarial audit while
separating three observations with multiple exact canonical matches for review.
It performed zero canonical Event, Update, or Signal writes.

The next implementation boundary is the live source-neutral reconciler: bind
the exact represented rows, materialize safe missing occurrences/series,
preserve optional facts and conflicts, and return grouped presentation deltas.
Do not reopen adapter design or add another source crawler before that path is
proven and replayed.

## Core principles

1. **Peer evidence.** WPN, store calendars, Discord, Instagram, Facebook,
   registration pages, and user-supplied evidence may each independently prove
   an event. WPN is broad and structured, not inherently more authoritative.
2. **Catalog before rank.** A valid attributable event at a known venue enters
   canonical Events even when the venue or event is personally poor fit.
3. **Organizer is not location.** The event owner, source publisher, community,
   and physical venue are distinct. An MTG OC meetup at Card Addiction is an
   MTG OC event hosted at Card Addiction, not official Card Addiction
   programming.
4. **Exact identity before fuzzy convenience.** Stable upstream IDs and learned
   bindings are authoritative. A safe split is better than a mistaken merge.
5. **Facts stay attributed.** Null or thin new observations do not erase richer
   facts. Conflicts remain inspectable rather than silently choosing a winner.
6. **Personal presentation is downstream.** Venue dislike, event hide, proxy
   rules, format preference, and distance affect visibility/ranking, not event
   existence.
7. **Set-based and quiet.** Daily reconciliation operates on database deltas,
   not one language-model pass or one RPC call per cached event.
8. **Novelty has three clocks.** Keep source arrival, canonical mutation, and
   user-facing presentation novelty separate. A row can be newly seen by WPN,
   newly added to canonical Events, both, or neither; those states are not one
   universal `NEW` flag.

## Layer 1: source-specific collection and adapters

Collectors preserve source-native material and cursor/fingerprint state.
Adapters translate only what the source actually establishes.

Examples:

- **WPN adapter:** reads `wpn_snapshot_cache.enriched_events`; uses WPN event ID,
  exact WPN organization-to-venue match, EventLink URL, schedule, fee, capacity,
  format, tags, description, deterministic title key/series hints, source-status
  eligibility, field-presence flags, and explicit rules phrases. These are
  prepared source facts and hints, not canonical matching decisions.
- **Official calendar adapter:** uses the calendar/event record ID or canonical
  URL, publisher identity, exact schedule, registration link, and stated rules.
- **Instagram/Facebook adapter:** uses post ID/URL, publisher account, extracted
  text/image facts, publication time, and linked source artifact.
- **Discord adapter:** uses guild/channel/message identity, message permalink,
  author/publisher context, discussion status, organizer/community, location,
  schedule certainty, and linked screenshots when retained.
- **Registration adapter:** uses platform event ID, organizer, venue, registration
  status, capacity, price, and exact event URL.

An adapter must not decide whether an event is personally interesting or create
a Signal merely because it found an event.

## Normalized event-observation contract

The shared contract should be typed for common fields while retaining a bounded
source-native payload reference. At minimum it needs:

### Observation identity and provenance

- observation ID and ingest-run ID;
- source ID, source type, publisher/route identity, and observed timestamp;
- stable upstream event/message/post ID when available;
- exact source URL or message permalink;
- source-artifact ID when image/PDF evidence exists;
- raw-record reference and content fingerprint;
- extraction method and confidence.

### Attribution and location

- organizer owner type and ID when canonical (`venue` or `community`);
- organizer display name when not yet canonical;
- physical venue ID when exactly matched;
- physical location text when not matched;
- venue-match method and confidence;
- explicit `official_venue_programming`, `community_organized`, or `unknown`
  attribution state.

### Event facts

- title and source description;
- format and event type;
- occurrence start/end with source timezone;
- series start/end and recurrence claim when explicitly supported;
- fee/currency, capacity, team size, registration status/URL;
- bracket/power/rules fields, including explicit proxy policy;
- upstream status such as scheduled, cancelled, moved, or sold out;
- field-level presence so omitted values are distinguishable from explicit
  values.

The raw cache remains source inventory. A normalized observation is evidence
ready for reconciliation. Neither is canonical app event truth by itself.

## Sparse structured richness

The common event model is a shared vocabulary, not a requirement that every
source fill every field. Optional facts should be nullable and typed. WPN may
populate most of them; an Instagram graphic may establish only title, date,
time, venue, and a linked image. Both are complete observations relative to what
their source actually says.

Use three layers so richness is preserved without turning the event into a text
blob:

1. **Canonical core:** identity and planning fields used almost everywhere:
   organizer, host venue, title, format/type, date, time, recurrence, status,
   fee, capacity, confidence, and concise summary.
2. **Structured optional facts:** normalized nullable fields for useful details
   such as registration URL/status/deadline, check-in time, set/product, team
   size, bracket/power, proxy policy, rules-enforcement level, decklist
   requirement, event structure, prize summary, and eligibility restrictions.
3. **Source evidence:** the complete source observation, original wording,
   source-native payload reference, and linked image/PDF. This preserves detail
   and provenance without making raw source fields the application schema.

Do not create placeholder text such as `unknown` merely to fill a card. A null
means the source did not establish the fact. An explicit source statement such
as `proxies prohibited` or `capacity 24` is a real typed value. This distinction
must survive reconciliation.

The optional-fact layer should be implemented as a focused one-to-one details
record for the applicable series or occurrence, or as carefully chosen columns
on the existing canonical tables. Do not use a generic key/value EAV table for
ordinary app facts, and do not make a JSON/text blob the only normalized
representation. A bounded JSON source-native payload remains appropriate only
for lossless evidence and forward compatibility.

When peer sources differ, keep each observation's claim and provenance. The
canonical projection may select the best current value only through explicit
field rules; it must not erase the conflicting claim. A later sparse source
must never blank a richer established fact merely because that source omitted
it.

### Presentation rule

Render useful facts progressively:

- event cards show only the few planning facts that exist and matter at a
  glance;
- event details show compact labeled facts such as fee, capacity, proxy rule,
  set, registration, team size, and structure;
- source wording and artifacts remain available through evidence/source links;
- absent facts render nothing—no empty panels, `N/A` grids, or confidence
  theater; and
- facts that materially affect fit, such as `no proxies`, remain visible even
  when the event is hidden or deprioritized.

## Layer 2: source-neutral canonical reconciliation

The reconciler processes an ingest run in one bounded transaction:

1. **Eligibility:** require a stable source observation, exact known organizer
   or venue attribution sufficient for the claimed event, and usable schedule.
2. **Identity:** resolve by durable source binding first; otherwise allow only a
   unique deterministic canonical match.
3. **Canonical mapping:** create or update the correct series and occurrence;
   keep organizer/community and host venue distinct.
4. **Provenance:** attach the observation/source/artifact to the canonical record
   with its exact upstream URL.
5. **Fact merge:** add source-supported facts; never overwrite a non-null richer
   fact with an omission. Preserve conflicts for review.
6. **Source state:** track first/last seen and misses per source observation.
   One source disappearance does not cancel an event still supported elsewhere.
7. **Presentation projection:** calculate inherited hide/deprioritize reasons
   separately from canonical status.
8. **Delta output:** return bounded counts and IDs for new, changed, unchanged,
   hidden-by-rule, ambiguous, conflicted, disappeared, grouped Updates, and
   actionable Signals.

### Identity order

Use this order and stop at the first safe match:

1. existing `(source_id, upstream_event_id)` binding;
2. exact source URL/permalink binding;
3. existing learned source-record-to-occurrence binding;
4. unique exact venue/organizer + local date + start time + normalized event
   identity match;
5. create a new series/occurrence when attribution is safe but no exact match
   exists;
6. route ambiguous identity to the quiet review inbox.

Do not merge merely because titles are similar, a WPN template ID repeats, or
two events share a venue and day. WPN template IDs may support classification
but are not globally unique canonical series IDs.

## Minimal durable additions

The implementation should add only what the existing schema cannot express:

1. **Normalized event observations.** A service-only operational table holding
   typed cross-source observations and their source-native fingerprint/payload
   reference.
2. **Durable source bindings.** A service-only mapping from a source record
   identity to canonical series/occurrence IDs. This makes replay and future
   source refreshes deterministic.
3. **One set-based reconciler.** An internal/service-only database function or
   bounded agent command that promotes all eligible observations from one run
   transactionally and returns a compact result.
4. **Tiny ingest-run ledger.** One service-only row per attempted run containing
   adapter/source family, input snapshot/fingerprint, validation/live mode,
   started/finished timestamps, duration, outcome, compact result counts, code
   or contract version, and a short error summary when applicable.

Do not add a parallel event catalog, duplicate Signals queue, duplicate Updates
table, or a generic public JSONB mutation RPC. Continue using existing canonical
event, source, preference, Signal, research-change, coordination, and artifact
tables.

The run ledger is operational troubleshooting state, not a user-facing activity
feed. It creates no Update or Signal and needs no Markdown run note. Do not copy
every event into a second log table: observations and durable source bindings
already provide row-level traceability. A future investigation should be able to
start from a run ID, inspect its compact counts, and then follow only the
affected observations/bindings when needed.

## Presentation consequences

The reconciler must not flood the user merely because it processed many rows:

- **Events:** retain every valid canonical occurrence.
- **Updates:** one grouped change per useful series/venue/run, not one per row;
  no visible Update for unchanged verification.
- **Signals:** only an independently actionable decision, deadline, cancellation,
  personal mention/invitation, or unusually valuable opportunity. Several
  occurrences supporting one decision strengthen one Signal.
- **Hidden:** a thumbs-downed/hidden venue or explicit no-proxy event is still
  ingested and then hidden by default. An explicit event-level favorite,
  interested, or show choice can override inherited hiding.
- **Large deltas:** return a digest with expandable groups; never truncate
  canonical ingestion.

### Novelty and bootstrap rules

`NEW` is a presentation claim, not a synonym for "missing from canonical
Events." The promoter must calculate three independent outcomes:

- `source_arrival`: whether the stable upstream record first appeared after a
  trusted prior snapshot;
- `canonical_action`: no change, bind evidence, add occurrence, add series,
  update facts, split safely, or hold for review; and
- `presentation_novelty`: whether the user should see a newly announced event,
  a quieter schedule addition, grouped backfill, conflict/correction, or no
  visible notice.

The first observation-state load is a bootstrap baseline. It may populate or
bind canonical inventory, but it produces **zero user-facing `NEW` badges**.
Likewise, an old source record promoted later is catalog backfill, not a newly
announced event. A newly arrived source ID that exactly extends a known
recurring lane is a new dated occurrence, not a new series. Same-slot or
same-lane/different-title records are never auto-merged; they are usually
specials, overlays, or conflicts. Multi-session weekends and repeated programs
must be grouped into event families before Updates are calculated.

Before the first live promoter run, `scripts/audit_wpn_novelty.py` must pass as
a read-only adversarial check against the latest trusted prior WPN snapshot.
Its purpose is to expose false novelty caused by missing bindings, canonical
series compression, title variants, same-lane specials, and multi-session
fragmentation.

## WPN-first implementation slice

### Implemented adapter boundary

The WPN cache adapter now performs the deterministic source-only preparation
needed by the shared promoter. Contract version 3 stores normalized title keys,
local schedule components, exact EventLink/store URLs, promotion eligibility
and exclusion reasons, field-presence metadata, typed source facts, explicit
proxy-rule flags, and two independent grouping hints:

- a strict organization + normalized title + weekday + local-time + format +
  team-size + explicit proxy-rule hint, which groups repeated dated
  observations without merging same-slot events with different titles or
  materially different structured variants; and
- an organization + WPN template hint, which can relate multi-session specials
  across times while remaining explicitly non-authoritative because template
  IDs are incomplete and can change between similarly named programs.

The current 1,267-row snapshot yields 1,079 eligible exact-known-venue
observations, 374 strict source-series hints (133 repeated and 241 one-off), and
149 template hints, of which 44 span multiple strict session lanes. The adapter
stores all observations but excludes unmatched venues and non-scheduled rows
from promoter eligibility. A same-snapshot replay under the same contract is a
no-write fast exit.

An adversarial comparison against the July 23 snapshot found why the promoter
cannot infer novelty from canonical absence: 209 strict clusters initially
looked novel, but only 101 were wholly new to WPN; five of those merely extended
exact existing recurring lanes. The 69 wholly new/no-analogue strict clusters
compressed to 35 template-or-title event families. The initial cache baseline
therefore warrants no `NEW` presentation at all, even when it later supplies
legitimate canonical backfill.

The reverse audit also guards against overcorrection. Among 650 observations
classified as exact existing occurrences, recurring lanes, or finite series,
it found no unresolved suppression risk after checking canonical activity,
series date bounds, duplicate exact matches, normalized format, team-size
variants, and explicit proxy-policy variants. This does not discard the 35
clear newly arrived/no-analogue families or same-lane specials; those remain
promotion candidates. It establishes only that the `already represented`
bucket is not currently hiding a detectable materially different event.

This completes deterministic WPN source preparation only. It does not create
normalized cross-source observations, canonical series/occurrences, Signals,
Updates, personal visibility decisions, or durable canonical bindings.

The first build should prove the shared core with WPN without implementing any
new social crawler:

1. adapt only exact-known-venue rows from the current rich WPN cache into the
   normalized observation contract;
2. reconcile all eligible future observations set-wise;
3. create exact event-specific provenance and durable WPN bindings;
4. preserve existing canonical rows and avoid fuzzy merges;
5. inherit personal/venue/no-proxy hiding without suppressing ingestion;
6. group presentation deltas and keep no-delta runs quiet;
7. replay the same cache with zero duplicate effect;
8. benchmark database work and return compact counts rather than row dumps.

Unmatched WPN organizations remain in the discovery inbox. They are not a
reason to block promotion for the exact-matched majority.

The read-only comparison in
`docs/WPN_CANONICAL_RECONCILIATION_EXERCISE_2026-08-01.md` is the measured basis
for the first implementation. It confirms that the main first-run job is
  materializing dated occurrences and durable event-ID provenance for existing
  series while adding a smaller number of missing series/specials. The refined
  bootstrap found 640 exact title/schedule matches (58 existing occurrences and
  582 existing title/weekday/time lanes), 255 no-lane observations, 182
  same-slot/lane title differences, and 4 multi-lane ambiguities. Same schedule
  without exact title or a learned binding is not a canonical identity match.

## Second adapter proof

After WPN succeeds, prove source neutrality with one already-known, reliable
non-WPN record—not a broad social crawl. A good proof is an official calendar,
Discord event/message, or analyzed Instagram graphic with:

- stable source identity or permalink;
- known organizer and/or host venue;
- usable date/time;
- an exact source link or preserved artifact; and
- no need for fuzzy identity.

Success means it passes through the same observation and reconciliation core,
with only the adapter differing. A community-organized event must retain its
community ownership even when hosted at a known store.

## Failure and review boundaries

The agent should stop or queue only the affected observation when it finds:

- unresolved venue/organizer identity;
- contradictory date/time/status from current peer sources;
- a possible duplicate with no unique deterministic match;
- malformed or novel upstream fields that affect interpretation;
- a cancellation/disappearance not yet confirmed under source-specific policy;
- an unsupported recurrence inference; or
- an unusually large delta suggesting an upstream/query failure.

One anomalous observation must not block safe events in the same run.

## Acceptance targets

- A no-delta WPN promotion run performs no canonical writes and creates no
  visible Updates or Signals.
- Replaying a run produces no duplicates.
- Every promoted occurrence has exact source provenance and an upstream link
  when the source provides one.
- A rich WPN observation retains its useful structured fee, capacity, format,
  registration, product/set, and rules facts, while a sparse Instagram
  observation can promote with only the facts it actually establishes.
- Replaying a sparse observation never clears richer established facts.
- The app renders no empty fact containers for unavailable optional data.
- The first dry run reports observations, series clusters, occurrences, exact
  matches, safe splits, inherited hiding, and ambiguity separately; it never
  presents the raw observation count as the number of new canonical series.
- A valid event at a hidden venue is present canonically but absent from default
  planning surfaces.
- An explicit no-proxy event is present canonically and hidden by rule.
- An event-level override restores visibility without changing source truth.
- A community meetup hosted at a store is not mislabeled as official store
  programming.
- A large batch remains complete but produces grouped presentation deltas.
- One ambiguous row is isolated while safe rows still land.
- The second non-WPN adapter uses the same reconciler without source-specific
  branching in canonical promotion logic.
- Every validation or live attempt leaves one lightweight run-ledger row, while
  ordinary successful runs produce no repository artifact or user-facing noise.
