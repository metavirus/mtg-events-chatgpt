# WPN-to-Canonical Reconciliation Exercise — 2026-08-01

Status: read-only design evidence; no canonical writes performed

## Purpose

Compare the latest enriched 25-mile WPN cache with current canonical Events to
test the proposed source-neutral promoter design before implementation.

The comparison used only WPN observations with:

- an exact existing WPN-source-to-venue match;
- a local event date on or after 2026-08-01; and
- the current cache retrieved at 2026-08-01 09:54 Pacific.

The categories below are exploratory matching classes, not approved writes.
They intentionally use exact titles/schedules and do not perform fuzzy merging.

## Inventory difference

- Future exact-known-venue WPN observations: **1,081**
- Current canonical future dated occurrences: **118**
- Current canonical series: **234**
- Current WPN event/source links: **227**, mostly organization/store-level
  links rather than event-ID bindings
- WPN observation range: **August 1 through October 29, 2026**

The large difference is primarily structural: canonical data often stores a
weekly series without materializing every future date, while WPN supplies many
individual future event IDs. The promoter must not translate 1,081 observations
into 1,081 series.

## Exploratory match classes

| Class | Observations | Schedule clusters | Interpretation |
|---|---:|---:|---|
| Existing series, exact normalized title/time | 520 | 94 | Strong candidate to attach dated WPN occurrences to an existing series after durable binding |
| Existing exact occurrence, title/date/time | 58 | 53 | Strongest initial canonical match |
| No matching canonical lane | 254 | 115 | Genuinely new-event candidates relative to current stock; 86 venue/title groups |
| One existing lane at same weekday/time, different title | 179 | 60 | Do not merge by schedule alone; often a special, rules variant, or different format |
| One existing occurrence at exact slot, different title | 50 | 47 | Potential special overlay, renamed event, or true conflict; exact slot is not identity |
| Multiple possible existing lanes | 20 | 8 | Ambiguous; isolate for review or safe split |

The 254 no-lane observations compress to 115 venue/title/weekday/time clusters:

- 27 repeated clusters;
- 88 one-off clusters; and
- 86 distinct venue/title groups.

Examples of repeated missing inventory include Turn Zero daily Commander,
Collector Legion Wednesday Standard Showdown, The Game Chest Irvine Thursday
casual Commander, The Comic Bug Friday draft, and several current draft/
Standard/prerelease lanes.

## What the cache could add

Across the broad `new` plus same-lane/different-title candidate set, the cache
contains:

- 194 Commander observations;
- 87 prerelease/Sealed observations;
- 47 draft observations;
- 47 Standard observations;
- 22 Modern observations;
- 13 Pauper observations;
- 7 New Player events;
- 16 other-format observations; and
- 1 Legacy observation.

This supports the catalog-first rule. The result should be broad event truth
with ranking and hiding downstream, not Commander-only promotion.

## Source richness observed

All 1,081 exact-known-venue observations include:

- direct WPN event URL;
- description;
- event format;
- entry-fee structure;
- card-set ID;
- required team size; and
- rules-enforcement level.

Additional coverage:

- capacity: 749 observations;
- free events: 376;
- paid events: 705;
- team size 2: 27;
- EventLink user-save count above zero: 55;
- event template ID: 414 present, 667 blank;
- rules level: 736 casual, 288 regular, 57 competitive.

Important interpretation:

- Preserve useful structured facts, but do not expose opaque card-set IDs until
  they can be mapped to human-readable products.
- `playerSaved` is an EventLink interaction count, not attendance or turnout.
- Template ID is incomplete and not globally sufficient for canonical series
  identity.
- A field being present in WPN does not mean it is independently informative;
  adapters should normalize meaning, not dump every upstream value into UI.

## Personal presentation impact

Within the broad candidate-addition set:

- 53 observations inherit a user `hide` or `deprioritize` venue preference;
- 57 observations belong to venues whose evaluation is deprioritized; and
- 42 observations explicitly contain `no proxy` wording.

These groups overlap. The events should still be canonicalized when otherwise
valid, then hidden/deprioritized through presentation rules with a recoverable
reason.

## Existing occurrences absent from this cache

Of 118 canonical future dated occurrences:

- 103 have at least one WPN observation at the same venue/date/time;
- 58 also match normalized title; and
- 15 have no same-slot WPN observation in this routine cache.

Six absent same-slot occurrences currently carry WPN provenance. Some are
readily explained by scope differences, such as A & N sitting outside the
routine 25-mile cache; others may represent source changes or schedule
differences. The MTG OC Card Addiction meetup is correctly absent because it is
community-organized rather than WPN programming.

Therefore WPN absence must remain source-specific evidence. It must not cancel
or delete canonical events supported by another source or outside the current
query footprint.

## Design consequences

1. The first WPN run is an **occurrence materialization and provenance binding**
   exercise, not merely a new-series import.
2. Exact normalized title plus venue/time is useful for initial bootstrap, but
   a durable WPN event-ID binding must govern later replays.
3. Same schedule alone is never enough to merge. Specials, Commander Parties,
   no-proxy variants, drafts, and routine events may occupy the same lane.
4. The safe automatic set can proceed while ambiguous observations are
   isolated. One uncertain cluster must not block the batch.
5. Only upstream `SCHEDULED` events that have not already ended should enter the
   upcoming canonical inventory. Same-day `ENDED`/`ROUNDACTIVE` rows remain
   observations, not new upcoming promotions.
6. Repeated missing inventory should become one canonical series with all exact
   dated occurrences, not one series per WPN event ID.
7. Initial-run reporting must count observations, candidate series clusters,
   occurrences, matches, safe splits, hidden-by-rule items, and ambiguities
   separately.
8. Event-specific provenance and human-clickable EventLink URLs are mandatory;
   current organization-level WPN source links are insufficient for future
   deterministic reconciliation.

## Recommended first dry-run output

The implemented promoter should reproduce this analysis with stronger durable
identity rules and return:

- eligible observations;
- existing exact bindings;
- exact bootstrap matches;
- new series clusters;
- new occurrences on existing series;
- safe new/split occurrences;
- ambiguous/conflicting clusters;
- hidden/deprioritized by reason;
- ignored ended/malformed rows;
- grouped Updates candidates; and
- independently actionable Signal candidates.

No row in this exercise was promoted, changed, hidden, or deleted.

