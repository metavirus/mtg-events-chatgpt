# Next tranche proposal: high-value event candidate replay B

Date prepared: 2026-07-17

Status: proposed only. Do not start until the user approves.

## Recommended batch

High-value event candidate replay B.

Direct Project Steward execution; no worker/subagent.

Scope: four records.

- Turn Zero Games
- CoreTCG
- Comic Quest
- Collector Legion

## Why this is next

Batch A showed that several apparent ingestion candidates were already covered
well enough and only needed source/provenance cleanup. The next useful step is
to repeat that lean replay pattern on another small set of high-value,
source-rich candidates before creating new Supabase event writes.

These four are good next candidates because they are likely to affect personal
planning if their current Commander, draft, prerelease, or special-event
surfaces are clarified:

- Turn Zero and CoreTCG have strong Magic-store identities and known routing
  surfaces, but need current event-source replay before any proposal work.
- Comic Quest has strong official open-play / FNM / newcomer signals and may be
  useful beyond Commander if limited/prerelease activity is current.
- Collector Legion was an early prominent lead and remains important enough to
  keep Saturday/routine Commander and special-event displacement cleanly
  separated.

## Work to perform

For each record:

1. replay current official/store-controlled/event-platform sources first;
2. use review mirrors, marketplace sources, and non-MTG locators only for
   identity, activity, fit, confidence, and warnings;
3. classify the candidate as:
   - confirmed;
   - stale;
   - duplicate / already covered;
   - not enough evidence;
4. separate confirmed dated events from recurring/projection language;
5. record source links, checked date, exact event facts, contradictions,
   uncertainty, and confidence;
6. decide whether the result should become:
   - no write;
   - source/provenance refresh only;
   - event/source relationship update;
   - new event proposal.

## Boundaries

- Do not edit canonical JSON.
- Do not perform live Supabase writes.
- Do not ingest ChatGPT packet facts without replay/verification.
- Do not start another batch afterward.
- Do not launch a worker.
- Keep the result in a durable run note before any proposal.

## Validation level

Standard for replay; lean for any follow-up write proposal unless event rows are
actually touched.

Expected checks:

- local repo search for existing store/event/source coverage;
- current source replay;
- run note written under `research/runs/`;
- text-integrity check if docs change;
- one commit/push for the durable run note;
- stop and report write/no-write recommendation.

## Done means

- all four records are classified;
- no duplicate ingestion is proposed;
- confirmed dated events are separated from recurring/program evidence;
- unresolved conflicts are named rather than normalized away;
- the user receives a concise recommendation for whether to prepare a
  controlled Supabase proposal.

