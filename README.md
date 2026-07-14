# Los Alamitos Commander Finder

A static browser application whose interface is separated from its data.

This repository also contains a repeatable Wizards Store & Event Locator
crawler. The crawler captures public Magic event data around a public Los
Alamitos centroid, then writes raw discovery output for later reconciliation
against store websites, social pages, Discords, registration pages, and other
community sources.

## Run locally

Because browsers restrict local JSON loading, run a tiny local server in this folder:

    python -m http.server 8000

Then open:

    http://localhost:8000

## Data files

- `stores.json`: stable store information and assessments
- `events.json`: recurring and one-time events
- `sources.json`: provenance and last-check dates
- `changes.json`: weekly audit diff log

The application code does not need to change when records are added or revised.

## Wizards locator refresh

Install the crawler dependencies:

    python -m pip install -r requirements.txt

Refresh the public Wizards snapshot:

    python crawler/wizards_locator.py --radius-miles 26 --output output/wizards

The crawler stores:

- `output/wizards/metadata.json`: retrieval settings and counts
- `output/wizards/events-all.json`: every returned Magic event
- `output/wizards/events-commander.json`: heuristic Commander/EDH/cEDH candidates
- `output/wizards/organizations.json`: deduplicated Wizards organizations/stores

The default query uses the public Los Alamitos, CA centroid and a 26-mile
discovery buffer. It does not store a private home address. Candidate events
are intentionally broad and should be verified before being promoted into the
app's curated `events.json` and `stores.json` files.

GitHub Actions refreshes the Wizards snapshot every Monday and commits changed
`output/wizards` data back to the repository.

## Current status

This is a functional version 0.1 with a deliberately limited verified seed
dataset plus a fresh Wizards locator discovery snapshot. It is not yet the
comprehensive 30-mile census.
