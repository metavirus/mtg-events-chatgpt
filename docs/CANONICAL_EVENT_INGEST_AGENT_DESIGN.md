# Canonical Event Ingest Agent Design

Status: design checkpoint; implementation not yet started  
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

## Layer 1: source-specific collection and adapters

Collectors preserve source-native material and cursor/fingerprint state.
Adapters translate only what the source actually establishes.

Examples:

- **WPN adapter:** reads `wpn_snapshot_cache.enriched_events`; uses WPN event ID,
  exact WPN organization-to-venue match, EventLink URL, schedule, fee, capacity,
  format, tags, and description.
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

Do not add a parallel event catalog, duplicate Signals queue, duplicate Updates
table, or a generic public JSONB mutation RPC. Continue using existing canonical
event, source, preference, Signal, research-change, coordination, and artifact
tables.

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

## WPN-first implementation slice

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
