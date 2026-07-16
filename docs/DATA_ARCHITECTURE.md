# Data Architecture

## Design goal

Keep operational research, personal state, and agent workflow data durable in a
validated hosted database while retaining reproducible schema, methodology,
research notes, and snapshots in GitHub.

## Data planes

### Evidence plane — Supabase with GitHub history

Append-oriented research records: venues and aliases, sources and source-health
observations, raw collector snapshots, extracted claims, attributed user field
notes, event series and dated occurrences, reconciliation decisions, and
research-run notes.

GitHub retains research-run documentation, source methodology, schema
migrations, validation code, and reproducible exports. Large application JSON
files are migration inputs and rollback snapshots rather than the permanent
live-edit surface.

### Application plane — Supabase and hosting build

Validated read models expose the current venue directory, series, confirmed and
projected occurrences, freshness/source summaries, ranking explanations,
new/change indexes, and calendar/search indexes. The application accesses these
through a data-adapter boundary so the initial file-backed build remains
available during migration and rollback.

### Personal plane — authenticated Supabase storage

Writable private state: favorites, interested/attended/skipped states, ratings,
private planning notes, muted records, preferences, and personal activity log.
Stable public entity IDs link the research, personal, and workflow planes.

### Workflow plane — authenticated Supabase storage

User-to-agent requests, entity-specific research leads, corrections, watch
instructions, product issues, statuses, and agent responses. Administrative
agent access uses a server-side secret that is never available to the browser.

## Core entities

- **Venue:** stable identity for a store, café, brewery, library, club, convention,
  or other host, including type, aliases, locations, and operating status.
- **Community:** a geographically or socially defined player group that may span
  multiple venues, such as Legendary Creature Club or infiniteloopmtg; includes
  geographic coverage, formats, channels, activity, access, and venue relationships.
- **Community-venue relationship:** a typed, evidence-backed connection such as
  `home_venue`, `frequent_host`, `occasional_host`, `partner`, or `mentioned`.
  A relationship never implies that the community and venue are the same entity.
- **Organizer role:** identifies the venue, community, company, or individual
  organizer responsible for an event separately from its physical host location.
- **Discord server:** a source/channel record, not automatically a venue or a
  community. It may be operated by a venue, operated by a community, shared by
  both, or have an unresolved operator.
- **Source:** website, Wizards record, registration platform, social account,
  Discord, directory, community page, contact method, or attributed user field
  note.
- **Source observation:** one timestamped attempt with a successful, stale, broken,
  blocked, login-required, or no-relevant-result outcome.
- **Claim:** a source-backed statement about identity, schedule, fee, bracket,
  proxies, pairing, capacity, prizes, or another field.
- **User field note:** an attributed observation or assessment supplied by the
  user, linked to a venue, community, event series, or occurrence, stored as
  durable evidence but clearly distinguished from store-controlled or public
  third-party claims.
- **Event series:** recurring identity and normal schedule/rules.
- **Occurrence:** a confirmed, projected, cancelled, or special dated instance.
- **Schedule exception / displacement risk:** evidence that a normally recurring
  series may be altered, crowded out, moved, or cancelled because a larger event
  such as an RCQ, prerelease, convention-style special, or store-wide takeover
  uses the same space and time.
- **Research decision:** reconciliation, classification, confidence, or publication decision.
- **Personal record:** private favorite, rating, note, visit, or planning state.

Community-hosted events and meetups use the same series/occurrence model as venue
events. A community event may reference a venue, rotating venues, an online space,
or an unresolved location. Do not force regional groups into the venue entity.

## Community fields

A community record supports stable identity and aliases; community type; stated
purpose; geographic coverage; formats and power orientation; accessibility or
membership constraints; meetup pattern; venue relationships; active sources;
activity and freshness observations; social-accessibility evidence; and analytical
fit. Private favorites, ratings, and notes link by community ID through the personal
plane just as venue and event records do.

Geographic coverage is descriptive rather than a fake street address. It may use
one or more named areas, approximate service regions, and evidence-backed venue
relationships. Do not assign a community the address of a frequently used venue.

## Independent assessment layers

Keep these three assessments separate even when they appear together in the UI:

1. **Source usefulness:** how useful a Discord server, website, social account, or
   other channel is for current information and advance coordination.
2. **Entity fit:** how promising the underlying venue or community is for the user.
3. **Event fit:** how well a particular series or occurrence matches the user's
   format, power, schedule, distance, proxy, and social-accessibility needs.

A strong venue may have a weak Discord; a small community may have an excellent
coordination channel; and a generally promising entity may host a poor-fit event.
No score may silently substitute for another layer.

In addition, venue or community presentation should keep these three user-facing
judgments distinct:

1. **Research status:** `discovery`, `reviewed`, or `deepened`.
2. **Fit grade:** an overall practical-quality judgment such as A-F that answers
   "how good of a bet is this for the user right now?"
3. **Confidence:** low / medium / high support for that judgment based on the
   available evidence.

These should not be overloaded into one status label. A venue may be fully
reviewed yet still receive a mediocre fit grade; a venue may score surprisingly
well while still carrying only medium confidence because the source stack is
thin. The app should eventually let users click these judgments and inspect the
supporting pluses, minuses, and open questions.

During the incremental calibration period, reviewed stores may carry an additive
`evaluation` object without requiring a risky all-store migration. Its fields are:

- `researchStatus`: `reviewed` or `deepened`
- `candidateStatus`: currently `promoted` when the store belongs in the serious
  consideration set
- `fitGrade`: A-F comparative judgment
- `fitScore`: 1.0-5.0 practical-fit score
- `confidence`: `low`, `medium`, or `high`
- `positives`, `cautions`, and `openQuestions`: short inspectable rationale lists

Legacy top-level `researchStatus` remains temporarily available for existing
filters. The evaluation object is the authoritative richer judgment where it is
present. Missing routine disclosures are neutral: explicit helpful guidance is a
positive, explicit restrictions are negative, and silence does not reduce fit.

## Attributed user field notes

User-supplied observations should be preserved in the evidence plane so they are
not lost to chat-context or private-app drift. They are treated as a first-class
source category with explicit attribution, timestamp, scope, and note type.

A user field note may describe:

- what happened during an actual visit
- how a public listing differed from reality
- vibe, accessibility, competitiveness, or pod-formation observations
- a proxy-policy or timing detail learned in person
- an analytical impression the user wants retained for future ranking

User field notes must be visibly labeled as coming from the user. They may
inform fit analysis and future recommendations, but they do not silently replace
official schedule, fee, rules, or policy claims from store-controlled sources.

When a user field note conflicts with a public source, keep both. The app should
be able to show a distinction such as "official listing says X" and "user visit
reported Y on 2026-07-14."

## Routine schedule versus exceptions

The app should treat a recurring event series as a normal pattern, not a promise.
Large same-day events can suppress or materially change a weekly Commander night
even when the routine listing still exists on Wizards, a website, or social copy.

Model this explicitly rather than overwriting the recurring series:

- keep the recurring series as the normal baseline
- attach confirmed dated occurrences when available
- attach exception or risk signals when another event appears likely to consume
  the same venue resources
- preserve the evidence explaining why the routine event may be in jeopardy

Useful exception/risk evidence includes RCQs, prereleases, sealed events,
conventions, special store anniversaries, space-limited tournaments, or direct
store/community statements that a normal weekly event is paused or displaced.

The UI should be able to surface a warning such as "routine event may be crowded
out" even when the final cancellation has not yet been confirmed.

## Discord source observations

Discord observations may include approximate member and online counts, accessible
channel inventory, scheduled-event support, recent relevant activity, event-detail
richness, LFG/pre-arrangement usefulness, newcomer guidance, geographic relevance,
last successful check, access limitations, and operator/authority classification.
Counts are timestamped indicators, not durable facts or direct measures of quality.

## Source health

Each source has a current health summary derived from observations: healthy/current,
stale but historically useful, broken/unavailable, login required, blocked/limited,
superseded, or unknown/not recently checked.

Broken URLs remain evidence but are not rendered as normal clickable destinations.
The app offers the best working operational source and allows source history to be
inspected.

## Personal plane records

Private hosted records should support at least:

- favorites, planning states, and simple activity-log entries
- optional private-only notes the user does not want committed to repo-backed
  research evidence

Durable visit observations that the user wants retained for research continuity
should usually be stored as attributed user field notes in the evidence plane.
Private hosted records are for personal workflow state, not the sole repository
of important research memory.

## Required invariants

- Stable IDs do not depend solely on a third-party platform ID.
- Every normalized factual value links to supporting observations or claims.
- Attributed user field notes remain visibly distinct from official/public
  source-backed claims.
- Exact source wording is separate from normalized display language.
- Unknown, inferred, conflicting, and confirmed are distinct states.
- Series, occurrences, and projections are distinct.
- Private workflow state remains separate from public research evidence.
- Builds reject duplicate IDs, broken references, invalid enums/dates, and private
  coordinate/address leakage.
