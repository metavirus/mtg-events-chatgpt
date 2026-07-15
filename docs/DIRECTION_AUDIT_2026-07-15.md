# Product Direction and Legacy-Contamination Audit

Date: 2026-07-15

## Purpose

Triple-check the active task, repo-backed user decisions, research artifacts,
normalized data, backlog, and current app scaffold before beginning the new v1.
The specific risk reviewed was whether imported materials from earlier failed AI
attempts were still silently determining product or implementation choices.

## Governing conclusion

The active product is a private Southern California Magic: The Gathering
intelligence application centered on Los Alamitos. Commander is the user's primary
format and deserves deep fit analysis, but it is not the product boundary. The app
also catalogs and highlights prerelease, sealed, draft, and other notable Magic
opportunities.

Current authority order is:

1. user goals, clarifications, and decisions made during this project;
2. repo-backed research, normalized evidence, and current repo-native product docs;
3. raw snapshots and traceable source evidence gathered in this project;
4. imported artifacts from earlier AI attempts, affirmatively deprecated and
   excluded from ordinary project work.

The imported materials must not govern UX, architecture, ranking, research scope,
or implementation sequencing by inertia. Historical inspection is allowed only
when explicitly useful; any adopted idea must be independently evaluated and
written into a current repo-native source of truth first.

## Problems found and resolved

- The implementation plan still preserved the old handoff as an active phase and
  placed research automation before the usable app.
- Structural v1 features such as favorites, notes, source health, fit explanations,
  and displacement warnings had been postponed into later phases despite the
  user's explicit concern about bolt-on architecture.
- The README and automated locator workflow still described a 26-mile buffer / a
  30-mile census instead of the agreed 25-mile routine Wizards search parameter.
- Product titles still implied a Commander-only system.
- The existing static app could be misread as the visual/architectural foundation;
  it is now explicitly classified as a disposable functional prototype.
- The current event seed is 88 Commander records and one Sealed record. This is a
  research-sequence bias, not evidence that the local Magic landscape is almost
  entirely Commander. The v1 must disclose the incomplete format coverage.
- One Finch and Sparrow store source reference pointed to a missing normalized
  source record; the official Instagram source was restored.
- Alakazam's completed first pass had not been reflected in its research status;
  it is now marked `partial`.
- Cardboard Games has the opposite problem: its run note recommends promotion,
  but its refined sources and assessment were not fully normalized. It remains an
  explicit data-repair item instead of being silently treated as complete.
- The active backlog/frontier still told a future agent to continue broad research
  even though the user had deliberately pivoted to building a usable v1. Both now
  record that research is paused, not completed.

## Validated state after corrections

- 55 venue records: 27 `partial`, 28 `wizards-discovery`.
- 89 event records: 88 Commander, 1 Sealed.
- 132 normalized source records.
- 29 change records.
- Zero duplicate venue, event, or source IDs.
- Zero event-to-venue, event-to-source, or venue-to-source broken references.
- JSON parsing succeeds for all four normalized data files.

## V1 direction confirmed

The first complete private version includes the structural shell now, including:

- Home/Highlights plus calendar-first upcoming, week, and month views;
- Events, Venues, Communities, New & Changed, and Research destinations;
- master-detail and drilldown behavior with working deep links;
- series versus occurrence modeling and visible confirmed/projected/at-risk states;
- confidence, freshness, source health, conflicts, and evidence explanations;
- favorites, ratings, timestamped notes, visit/planning states, and activity log;
- directions, source/registration links, Google Calendar export, and responsive use;
- visible reviewed/partial/discovery and coverage labels so weak evidence remains
  useful without pretending to be fully vetted.

Automation agents, exhaustive research backfill, and sophisticated inference can
follow the usable v1. The interface and data contracts should anticipate those
capabilities without implementing them first.

## Remaining cautions

- `stores.json`, `events.json`, `sources.json`, and `changes.json` are useful seed
  files, not the final evidence architecture described in `DATA_ARCHITECTURE.md`.
- The current app files prove basic JSON loading and calendar rendering only. Their
  tabs, light visual style, field assumptions, and interaction model are not design
  requirements.
- Research notes are historically truthful even when they describe an earlier
  frontier. Active work should follow `IMPLEMENTATION_PLAN.md` and `WORK_BACKLOG.md`.
- The Cardboard Games normalization repair should be completed later from its run
  evidence rather than guessed during the build pivot.
