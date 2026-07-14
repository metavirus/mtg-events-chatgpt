# Data Architecture

## Design goal

Keep public research evidence durable and reproducible in GitHub while allowing
private personal state to persist in the hosted web app across devices.

## Data planes

### Evidence plane — GitHub

Append-oriented research records: venues and aliases, sources and source-health
observations, raw collector snapshots, extracted claims, event series and dated
occurrences, reconciliation decisions, and research-run notes.

### Generated application plane — GitHub and hosting build

Validated read-optimized JSON: current venue directory, series, confirmed and
projected occurrences, freshness/source summaries, ranking explanations, new/change
indexes, and calendar/search indexes. This is replaceable output, not the sole truth.

### Personal plane — private hosted storage

Writable private state: favorites, interested/attended/skipped states, ratings,
notes, visits, muted records, preferences, and personal activity log. Personal data
never enters public research JSON. Stable public entity IDs link the two planes.

## Core entities

- **Venue:** stable identity for a store, café, brewery, library, club, convention,
  or other host, including type, aliases, locations, and operating status.
- **Source:** website, Wizards record, registration platform, social account,
  Discord, directory, community page, or contact method.
- **Source observation:** one timestamped attempt with a successful, stale, broken,
  blocked, login-required, or no-relevant-result outcome.
- **Claim:** a source-backed statement about identity, schedule, fee, bracket,
  proxies, pairing, capacity, prizes, or another field.
- **Event series:** recurring identity and normal schedule/rules.
- **Occurrence:** a confirmed, projected, cancelled, or special dated instance.
- **Research decision:** reconciliation, classification, confidence, or publication decision.
- **Personal record:** private favorite, rating, note, visit, or planning state.

## Source health

Each source has a current health summary derived from observations: healthy/current,
stale but historically useful, broken/unavailable, login required, blocked/limited,
superseded, or unknown/not recently checked.

Broken URLs remain evidence but are not rendered as normal clickable destinations.
The app offers the best working operational source and allows source history to be
inspected.

## Required invariants

- Stable IDs do not depend solely on a third-party platform ID.
- Every normalized factual value links to supporting observations or claims.
- Exact source wording is separate from normalized display language.
- Unknown, inferred, conflicting, and confirmed are distinct states.
- Series, occurrences, and projections are distinct.
- Personal data is private and separate from public research.
- Builds reject duplicate IDs, broken references, invalid enums/dates, and private
  coordinate/address leakage.

