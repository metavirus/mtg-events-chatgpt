# Supabase-ready research intake packet — 2026-07-16

Outcome type: intake-only
Entity: 55 researched Southern California stores, branches, community venues, and identity/status candidates
Modality path used: existing canonical records and run notes -> Wizards snapshot evidence -> official websites/calendars -> Instagram/social routing -> Discord evidence/public metadata -> Google/Yelp-derived review mirrors -> publisher organized-play lists -> marketplaces -> local reporting/community platforms
Promotion status: Candidate queued for Codex review
Files changed: this packet plus `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`, and `docs/agent-mailbox.md`
Branch / PR: `chatgpt-data-update/2026-07-16-research-intake`; PR pending
Codex review needed: Review, deduplicate, validate freshness, and decide whether any proposed corrections/events should be promoted through the canonical workflow.

## Status

This directory is an intake and evidence-synthesis packet only. It is visible only on the ChatGPT branch/PR and must not be treated as canonical data. No canonical JSON, Supabase table, schema, application code, crawler, workflow, or deployment file was changed.

## Files

- `01-requested-26-venues.md` — the 26 venues in the user-requested discovery tranche.
- `02-existing-repo-catchup-29.md` — the 29 remaining existing repo records or identity candidates reviewed in the catch-up pass.
- Existing detailed source-run notes remain supporting evidence:
  - `research/runs/2026-07-16-discovery-store-tranche.md`
  - `research/runs/2026-07-16-yelp-store-review-pass.md`
  - `research/runs/2026-07-16-google-reviews-fuzzy-resources.md`
  - `research/runs/2026-07-16-wide-source-and-repo-catchup.md`

## Record contract

Each record uses the same labels so it can later be mapped to Supabase tables without assuming or changing the future schema:

- `Entity or candidate name`
- `Existing canonical ID` or `candidate`
- `Entity type`
- `Date checked`
- `Source evidence` with exact URL, source type/modality, and source publication/event date when available
- `Confirmed source facts`
- `Analyst interpretation`
- `Candidate proposal`
- `Upcoming actionable events` with title/date/time/format/fee/capacity/registration link
- `Commander findings`
- `Prerelease/sealed findings`
- `Draft findings`
- `Notable-special findings`
- `Unresolved conflict / contradictions`
- `Unknowns`
- `Freshness concerns`
- `Possible duplicate identity`
- `Suggested disposition`
- `Codex decision required`

`Confirmed source facts` are source-supported statements. `Analyst interpretation` is synthesis using existing project concepts. `Candidate proposal` is not a canonical promotion. `Unresolved conflict` preserves incompatible evidence without choosing a winner.

## Disposition values used

- existing-entity correction
- research follow-up
- candidate discovery
- possible event
- no actionable finding

## Global validation limits

Completed:

- Compared the recent 26-store tranche with the current `stores.json` roster.
- Covered the 29 remaining existing records.
- Preserved exact source URLs and source roles.
- Kept Google, Yelp, marketplace, publisher-organized-play, official, user-observation, and community evidence distinct.
- Flagged branch, predecessor, relocation, closure, and same-name risks.
- Did not treat source silence as proof of inactivity.

Not completed:

- No authenticated Google Maps or Yelp browsing.
- No exhaustive recent-review reading for every venue.
- No new authenticated Discord channel pass.
- No live Wizards crawler refresh for every venue.
- No local PowerShell text-integrity execution.
- No canonical JSON validation was required because canonical JSON was not edited.
- No Supabase write or schema validation was performed.
