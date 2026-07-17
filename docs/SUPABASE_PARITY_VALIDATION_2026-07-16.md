# Supabase Parity Validation - 2026-07-16

## Scope and baseline

This was a read-only representative verification on
`codex/reconcile-wizards` at accepted checkpoint `758d796`. The worktree was
clean before testing. No app, schema, migration, canonical JSON, hosted data,
credential, deployment, branch, or remote state was changed.

Capability inventory found a connected Supabase MCP path, the public Data API
used by `app.js`, the local static app preview, and repository seed/migration
evidence. The connected MCP project URL was
`https://pyvftzsodzwfqncjbmbc.supabase.co`, confirming project ref
`pyvftzsodzwfqncjbmbc`. The earlier certificate-troubled Python parity path was
not retried. A local Node executable was not available for an additional
in-memory fallback harness; the existing repository code and prior
deterministic fallback verification were used instead.

## Result

**Migration gate: reject for default cutover; keep the gate open for repair and
reverification.**

The live seed has complete count and identifier parity, and representative raw
values match. The opt-in adapter is not behaviorally equivalent to JSON,
however:

1. Supabase maps venue research states to `reviewed` / `deepened`, while the
   active event filters accept JSON-era `partial` / `wizards-discovery`.
   Consequently, both Today and Events showed zero main results under
   `?data=supabase`, despite populated live data.
2. The adapter maps all 97 `event_series` rows and then appends all 10
   `event_occurrences`. Each dated JSON event exists as both a non-recurring
   series and a derived occurrence, so the Supabase adapter creates 107 event
   objects from 97 JSON events and gives the 10 dated events two renderable
   representations. The first defect currently masks these duplicates in the
   filtered main views.

## Verification matrix

| Class | JSON / expected identifier and value | Live Supabase identifier and value | Adapter or display result | Status |
| --- | --- | --- | --- | --- |
| Venues | 55 IDs; `collectors-lounge-cypress`, name `Collectors Lounge - Cypress`, distance `2.21`, JSON research status `partial`, evaluation `B+` / `4.1` | 55 IDs; same identity and core values; venue research status `deepened`; linked evaluation retains `B+` / `4.1` | `mapVenue` preserves identity/evaluation but emits `deepened`; Today and Events filters reject it | **Fail (adapter/browser)** |
| Communities | 3 expected IDs; `legendary-creature-club`, status `partial`, channel `Discord` | 3 IDs; same name/region/channel/content; research status `reviewed` | `mapCommunity` emits `reviewed`; raw semantic normalization is intentional but not JSON-shape parity | Pass raw; adapter difference noted |
| Event series with time | `a-and-n-collectibles-commander-night-1-17-00`; weekly Monday; `17:00` | Same ID; recurrence start `17:00`; `default_start_time=17:00:00` | Mapping normalizes both to `17:00`; raw and adapter time agree | **Pass** |
| Recurring series without default time | No JSON example; count 0 | Count 0 (`recurrence is not null` and `default_start_time is null`) | No genuine live representative exists | **Blocked by dataset** |
| Dated occurrence with known time | `tweedy-cards-and-gaming-magic-presents-god-of-mischief-commander-2026-07-17`; `2026-07-17`, `17:00`, source `src-wpn-17882` | Matching series plus `--occurrence`; both carry `17:00:00`; occurrence source link matches | Highlights rendered `5 PM`; adapter also creates both series and occurrence objects | Pass time; **fail duplication** |
| Occurrence-time fallback | JSON series mapping supplies `default_start_time`; adapter code uses `item.start_time || series.default_start_time` | 0 live occurrences have null occurrence time with a non-null series default | Fallback logic remains deterministically covered by the accepted earlier check, but no live row exercises it | Pass code-level; live case blocked |
| Genuinely unknown time | `cardboard-games-the-hobbit-prerelease-2026-08-08`; no `startTime` | Matching series and `--occurrence`; both times null; 3 live occurrence/series pairs are genuinely unknown | Adapter preserves null and `formatTime` yields `Time TBD`; filtered main views prevented a live display observation | Pass raw/adapter; browser display blocked |
| Sources | 145 IDs; representative `src-wpn-20379` | 145 same IDs; representative URL, label, type, and date match | `mapSource` preserves the app shape | **Pass** |
| Provenance relationships | 149 expected venue/community-source tuples; Collectors Lounge has 8 named source IDs | 149 same tuples; all 8 representative links match | Entity source grouping preserves IDs | **Pass** |
| Event provenance | 97 expected event/source tuples; dated Tweedy event uses `src-wpn-17882` | 97 same semantic tuples; dated links target the derived occurrence | Adapter groups the link onto the occurrence, leaving the parallel series object without a source | Raw pass; **adapter duplication/source asymmetry fail** |
| Evaluations | 2 expected venue keys; Collectors Lounge `deepened`, `promoted`, `B+`, `4.1`, `medium` | Same 2 keys and representative values/arrays | `mapEvaluation` preserves values | **Pass** |
| Research changes / Updates | 34 IDs; `initial-seed`, accepted, timestamp `2026-07-13T21:45:00-07:00` | 34 IDs; same instant stored as `2026-07-14T04:45:00+00:00`, same summary/status | Adapter preserves the ISO instant; browser showed Updates count 34 | **Pass** |
| Default source selection | Normal URL has no `data=supabase` parameter | Supabase is requested only by `?data=supabase` | Normal local preview rendered the JSON-backed Today surface | **Pass** |
| Failed-read JSON fallback | JSON snapshot counts are 55 / 97 / 145 / 34 | `load()` catches a failed Supabase read, warns, then calls `loadFromJson()` | Code path is explicit and prior deterministic fallback verification is accepted; a fresh forced-failure browser run was not available in this tranche | Pass code-level; browser not retested |

## Full identifier checks

Sorted identifier/relationship tuples were joined with LF and compared by MD5.
Every expected hash matched live Supabase:

| Set | Count | Matching MD5 |
| --- | ---: | --- |
| Venue IDs | 55 | `3e5a439f3ee70b0fa7f0d49bb5d4a96b` |
| Community IDs | 3 | `319013497d9ba35f13da11ac8070d059` |
| Event-series IDs | 97 | `4a7916903ec2c58ab0e1b573869946f6` |
| Derived occurrence IDs | 10 | `57383eed5c0b7b227b3c8fdc70737061` |
| Source IDs | 145 | `1fe1fa5d69a3194d7c3c087c09bbce83` |
| Entity-source tuples | 149 | `77c2f9daafe779c751665aaa45e4c0e2` |
| Event-source semantic tuples | 97 | `c74a08f798ec03b569ac0ff81ada7399` |
| Evaluation entity keys | 2 | `c085b6951125fbfae27e970b05aa4852` |
| Research-change IDs | 34 | `914af1f3b2d924ec9590697678cacb1f` |

## Evidence and commands

- Verified branch, commit, and initial cleanliness with `git status`,
  `git rev-parse HEAD`, and `git log -1`.
- Read the canonical JSON files and computed counts, representative values,
  derived occurrence IDs, relationship tuples, and sorted-set hashes.
- Used connected Supabase read-only table inventory and SQL queries for live
  counts, rows, timing categories, relationships, and hashes.
- Ran the static app locally and inspected both the normal JSON URL and
  `?data=supabase` in a browser. JSON rendered normal results. Supabase rendered
  populated highlights but zero Today/Events main results.
- Inspected `load`, `loadFromSupabase`, mapping, filtering,
  `buildOccurrences`, and `formatTime` in `app.js` to attribute the observed
  behavior.

## Untested or bounded areas

- There is no live recurring series without a default start time and no live
  occurrence that must fall back from a null occurrence time to a non-null
  series default. Those two live cases cannot be demonstrated with the accepted
  dataset.
- A fresh browser-level forced Supabase failure was not performed. JSON default
  selection is freshly verified; fallback remains accepted at the explicit
  code-path and prior deterministic-test level.
- No defect was repaired. The next tranche should address only the status
  vocabulary mismatch and dated series/occurrence duplication, then repeat this
  parity matrix before any default cutover.
