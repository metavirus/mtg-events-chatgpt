# Wizards Locator SOP

This is the mandatory operating procedure for querying Wizards Store & Event
Locator in this project.

The key rule:

- **Use the API-backed crawler workflow as the default interface.**
- **Do not treat the public website UI as the primary query surface.**

The website is useful for spot-checking or user-facing browsing. It is not the
reliable research collection path.

## Why this SOP exists

The Wizards locator is critical, but the visible web interface is finicky:

- browser blocks and inconsistent page behavior can waste time
- manual browsing encourages re-learning the tool each pass
- search UI friction is bad for daily/weekly automation
- public page behavior is weaker than the underlying GraphQL event service

We already have a working low-friction path in the repo:

- [crawler/wizards_locator.py](C:/Users/kavig/Documents/Codex/mtg-events-chatgpt/crawler/wizards_locator.py)

That path should be the default collection interface from now on.

## Canonical collection path

### Endpoint

The stable collection endpoint currently used by the repo crawler is:

- `https://api.tabletop.wizards.com/silverbeak-griffin-service/graphql`

### Operation

Use the `queryEvents` GraphQL operation via `searchEvents`.

### Required query variables

The repo’s proven base query shape is:

- `latitude`
- `longitude`
- `maxMeters`
- `tags`
- `sort`
- `sortDirection`
- `orgs`
- `startDate`
- `endDate`
- `page`
- `pageSize`

### Proven default values

For routine collection, use:

- public origin: Los Alamitos centroid
  - latitude `33.8031`
  - longitude `-118.0726`
- routine radius: `25` miles
- `maxMeters = radiusMiles * 1609.344`
- `tags = ["magic:_the_gathering"]`
- `sort = "date"`
- `sortDirection = "Asc"`
- `orgs = []`
- `page = 0...n`
- `pageSize = 200`

These are the current known-good defaults for broad local collection.

## Proven request contract

The current crawler uses this request posture successfully:

- method: `POST`
- content type: `application/json`
- origin: `https://locator.wizards.com`
- referer: `https://locator.wizards.com/`
- JSON payload includes:
  - `operationName`
  - `variables`
  - `query`

### Current headers used by the crawler

The working collection path currently includes:

- `accept: application/json`
- `content-type: application/json`
- `origin: https://locator.wizards.com`
- `referer: https://locator.wizards.com/`
- a browser-like `user-agent`
- `x-wotc-client: client:locator version:research platform:github-actions`

Do not casually change these unless there is a demonstrated reason.

## What to collect from Wizards

Wizards is best used for:

- branch identity
- organization ID
- event existence
- recurring cadence
- event title wording
- event descriptions
- entry fee
- capacity
- premium status
- official branded program names

The current crawler already extracts:

- event `id`
- `capacity`
- `description`
- `distance`
- `title`
- `scheduledStartTime`
- `status`
- `tags`
- `timeZone`
- `entryFee`
- `organization` object
- `eventFormat`
- `cardSet`

That is the right baseline payload. Do not reduce it unless we have a strong
reason.

## Pagination SOP

Use paginated collection, not repeated manual searches.

### Proven paging approach

- start at `page = 0`
- `pageSize = 200`
- continue until either:
  - returned batch is empty, or
  - accumulated events >= `pageInfo.totalResults`

This is already implemented in the crawler and should remain the standard.

## Retry / failure SOP

The crawler already uses the right basic failure posture:

- retry on request / JSON / GraphQL errors
- exponential backoff
- fail only after bounded retries

### Current retry pattern

- 4 attempts
- delays of `1, 2, 4, ...` style exponential backoff

For routine agents, prefer:

1. one normal run
2. automatic bounded retry
3. if still failing, preserve failure note and stop

Do not repeatedly poke the UI after crawler failure unless the failure itself
needs diagnosis.

## Routine operating modes

### Mode A: weekly broad snapshot

Use:

`python crawler/wizards_locator.py --radius-miles 25 --output output/wizards`

Purpose:

- refresh the full local Magic snapshot
- update:
  - `output/wizards/metadata.json`
  - `output/wizards/events-all.json`
  - `output/wizards/events-commander.json`
  - `output/wizards/organizations.json`

This should be the standard weekly collection method.

### Mode B: bounded validation for a specific store

Default approach:

1. check if the store already exists in:
   - Supabase canonical venue/event rows, or a recent explicit Supabase export
     used only as a validation basis
   - `output/wizards/organizations.json`
   - `output/wizards/events-all.json`
2. if yes, use the local record first
3. only run a fresh live query if:
   - the local snapshot is stale for the task
   - a claimed event seems suspicious
   - a special branded event needs confirmation

For most first-pass venue work, local Wizards data should be enough to avoid
re-querying live.

### Mode C: daily light refresh

Daily agent behavior should not do a full manual rediscovery.

Preferred pattern:

1. use the latest committed Wizards snapshot as baseline
2. run only the scheduled automated refresh when needed
3. compare newly returned events against normalized records
4. surface:
   - new events
   - changed wording
   - changed fees
   - changed cadence
   - cancellations or disappearances if detectable

Daily agent should almost never browse the Wizards UI manually.

## Radius policy

Routine Wizards search radius is:

- **25 miles**

## Snapshot reuse rule

Reuse the latest suitable `output/wizards` snapshot when it is less than 24
hours old and covers the stores in scope.

Refresh WPN/EventLink only when:

- the latest suitable snapshot is stale;
- the store is outside the snapshot radius;
- same-day freshness materially affects the planning question; or
- another source contradicts the snapshot.

If a wider-radius pull is needed, save it as a clearly named source artifact
such as `output/wizards-radius30-YYYY-MM-DD/` and explain why it was needed in
the run note. Distinguish "recent WPN snapshot reused" from "fresh WPN pull" in
run notes. WPN snapshots are source artifacts only; they are not canonical app
JSON.

Important nuance:

- this is a collection parameter, not a hard product cutoff
- nearby discovery logic may still preserve credible events/stores slightly
  beyond 25 miles when they appear incidentally or are otherwise important

The repo already reflects this thinking:

- normal routine radius = 25
- historical reconciliation explored the 15–26 mile ring as a review tranche

## How to interpret Wizards output

### What Wizards can prove well

- Magic exists at the branch
- the event title/description existed at collection time
- recurring cadence can be inferred from repeated listings
- official branded terms are meaningful

### What Wizards cannot prove by itself

- community warmth
- actual attendance
- whether Commander is casual vs sweaty unless wording strongly signals it
- whether Magic is the store’s dominant identity
- whether a store’s website/socials are more operationally important than Wizards

That interpretation must come from cross-source synthesis.

## Reconciliation rules

Use the repo’s existing posture:

- broad snapshot first
- then curated promotion

The current promotion helper already encodes this separation:

- [crawler/promote_wizards_recurring.py](C:/Users/kavig/Documents/Codex/mtg-events-chatgpt/crawler/promote_wizards_recurring.py)

### Current reconciliation logic worth preserving

- repeated explicit Commander/EDH/cEDH listings are meaningful
- one-offs should not be automatically promoted
- first-pass and outer-ring reconciliation are separate review decisions

This is exactly the right architecture:

- raw snapshot
- review/reconciliation layer
- curated normalized app data

## Manual UI usage rules

The web UI is now exception-path only.

Allowed uses:

- quick human spot-check
- user-facing inspection
- confirming a specific event/store page visually
- diagnosing crawler breakage

Not allowed as the normal collection path:

- repeated manual search by store
- repeated location/radius poking
- broad discovery trawls
- routine daily/weekly collection

## Failure ladder

When Wizards work is needed, use this order:

1. existing local normalized data
2. existing raw Wizards snapshot in `output/wizards`
3. rerun the crawler
4. use manual UI/browser only if needed for diagnosis or spot-checking
5. record uncertainty and move on

This order is mandatory.

## Anti-waste rules

- Never start with the browser UI if the repo snapshot is already present.
- Never repeat multiple UI attempts to answer a question the crawler already can.
- Never use the browser UI for broad weekly collection.
- Never burn a full pass reacquainting with locator mechanics.

## Operational checklist for future agents

Before touching Wizards, ask:

1. Do I already have the answer in Supabase or `output/wizards`?
2. Is this a broad snapshot task or a store-specific validation task?
3. Can I answer this with the crawler outputs instead of the UI?
4. If I need live data, can I rerun the crawler instead of manually browsing?
5. If I’m reaching for the UI, is it truly for spot-checking or diagnosis?

If the answer to #5 is no, stop and use the crawler path instead.

## Project-level rule

For this project, the Wizards locator should be thought of as:

- **API-first**
- **snapshot-then-reconcile**
- **UI-last**

That is the stable modality that should power weekly and daily automation.
