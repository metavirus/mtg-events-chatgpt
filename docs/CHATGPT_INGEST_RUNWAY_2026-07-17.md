# ChatGPT packet ingest runway — 2026-07-17

Status: superseded for active planning by
`docs/CHATGPT_PACKET_INGEST_TRACKER_2026-07-17.md`.

Purpose: reduce compaction risk by converting the preserved ChatGPT PR #15/#16
packet into a finite Codex intake runway. This file is not canonical research
truth; it is the strategy note for finishing packet ingestion through the
controlled Supabase workflow.

As of the structural packet-ingest checkpoint, no immediate packet-ingest
batches remain. Treat this file as historical strategy context only. For
current packet-derived leftovers, use the disposition tracker and its individual
TBD rows; do not restart the runway batches below as active work.

Current disposition tracker:

- `docs/CHATGPT_PACKET_INGEST_TRACKER_2026-07-17.md`

## Temporary operating adjustment

Until this packet is digested, prioritize preserving and triaging packet content
over deepening every record to final quality.

Default action for packet items:

1. If a credible Magic event is found, log it or propose logging it with fit,
   risk, and source quality clearly labeled.
2. If the event is real but poor personal fit, do not ignore it; capture it and
   deprioritize/hide/rank it down.
3. If a store-quality signal affects fit, confidence, cautions, or open
   questions, attach it as Evidence when useful.
4. If the item needs a deeper social/Discord/current-calendar pass, preserve it
   as a named TBD instead of chasing it immediately.
5. Do not hand-edit canonical JSON. Supabase remains the controlled write path;
   generated JSON remains export/recovery.

## Already absorbed from the packet

These packet areas have already been carried into Supabase or durable Codex
records well enough that they should not be reopened by default:

- Documentary PR #15/#16 packet files preserved on the current branch.
- Identity/status Batch A applied:
  - Krazy Nick's / Honey Pot
  - Game Chest Irvine / Spectrum context
  - ProjectCCG branches / MTG OC shorthand
  - Kingslayer Fountain Valley / Lake Forest separation
  - Shuffle and Cut / The Realm uncertainty note
- High-value event candidate replay A applied as source/provenance refresh:
  - Finch Birdcage VII
  - The Game Cellar
  - Next-Gen Games
  - It's GameTime!
  - The Crimson Guild
- Review/evaluation course correction applied:
  - event implications and Places assessment implications both required
  - Evidence links required for sources that materially affect fit/confidence
- Review-source evidence backfill model established.
- Nearby/thin Places assessment batches applied:
  - Shadow Realm Collectibles
  - Buddies Collectibles
  - TK Collectibles
  - Aki Collectibles
  - Games For Meeple
  - GXGAMERS
  - Otaku Vault
  - LVLUP GAMING TCG
- High-value event candidate replay B has a durable run note:
  - Turn Zero Games
  - CoreTCG
  - Comic Quest
  - Collector Legion
- Replay B has also been reduced into Supabase: source/evidence and evaluation
  implications exist for Turn Zero, CoreTCG, Comic Quest, and Collector Legion,
  and LEGIONMANIA III is already cataloged as an inactive historical
  competitive EDH special-event signal. Do not repeat this as the next ingest
  tranche.

## Fast-ingest remaining

These are the remaining packet items most suitable for quick controlled
proposals. They should be small Supabase proposals, not deep research projects.

### 1. Remaining event-looking packet leads

Records to sweep for event ingest or explicit no-write:

- The Comic Bug
- The Game Chest - Promenade on the Peninsula
- B.Y.O.GAMES LLC
- Grails Gone Wild
- The Bullpen 2.0
- DXN Provisions
- Revenge Of
- Odyssey Games - Pasadena
- Crown City Games
- A & N Collectibles
- Alamo Drafthouse Cinema Downtown Los Angeles

Likely action:

- For each record, decide whether the packet contains a credible Magic event,
  only stale/historical evidence, or no actionable event.
- Log real Magic events with source quality and fit labels.
- Preserve stale/historical/low-fit items as notes or TBDs rather than forcing
  final deep research.

TBD after ingest:

- Fresh official/calendar/social replay for any record that looks promising but
  not yet safe to normalize.
- Discord/community read only for records that become high-value candidates.

### 2. Remaining Places-assessment-only packet leads

Records most likely to need assessment/evidence cleanup rather than event rows:

- The Comic Bug
- B.Y.O.GAMES LLC
- The Game Chest - Promenade on the Peninsula
- Alamo Drafthouse Cinema Downtown Los Angeles
- DXN Provisions
- Revenge Of
- Odyssey Games - Pasadena
- Crown City Games
- A & N Collectibles

Likely action:

- Add source/evidence links when the packet materially affects fit, confidence,
  cautions, open questions, identity, or status.
- Add or refine Places evaluation rows if the venue is still generic/thin.
- Deprioritize or mark historical/no-action where appropriate.

TBD after ingest:

- Richer review analysis.
- Actual player-pool and solo-arrival texture.
- Discord or social deepening for only stores that remain promising.

### 3. Conflict/history cleanup still not fully retired

Records:

- The Comic Bug historical Manhattan Beach / current branch status.
- The Bullpen 2.0 historical vs later-location/current-status identity.
- Grails Gone Wild online business vs physical-store status.
- Tilted Gaming active evidence vs closure flags.
- Buddies active evidence vs closure flags: mostly improved, but keep status
  contradiction visible if not fully retired.
- Kingslayer Lake Forest event-text contamination: preserve warning until any
  event facts are replayed branch-specifically.

Likely action:

- Add status/history notes, not speculative merges.
- Treat closure/relocation/history as research truth separate from personal
  preference.
- Do not spend a full archaeology pass unless the record is likely to matter
  for planning.

TBD after ingest:

- Deep branch/history verification only if the record remains active or likely
  to affect recommendations.

## Later TBD / do not block packet ingest

These are real research needs, but they should not block completing the packet
intake digestion:

- Full Discord surveys for promising stores and communities.
- Daily or recurring social monitoring.
- Upstream Wizards/WPN news monitoring.
- Fine-grained player-pool breadth, venue scale, MTG-focus calibration for all
  reviewed stores.
- Representative play-space image evidence.
- In-practice solo-arrival verification.
- Full final data-integrity assurance.

## Definition of done for ChatGPT packet ingest

The PR #15/#16 packet is considered digested when:

- every packet record is represented in one of these states:
  - applied to Supabase;
  - explicitly no-write / no-action;
  - preserved as conflict/status TBD;
  - preserved as deeper research TBD;
  - superseded by a later Codex pass;
- every credible Magic event from the packet has either:
  - been logged/proposed with source quality and fit labels;
  - been explicitly rejected as stale, duplicate, unverified, or non-actionable;
- every material store-quality signal has either:
  - become Evidence / evaluation / caution / open question;
  - been named as a later TBD;
- no remaining packet item depends on chat memory to be understood.

## Recommended immediate next step

Prepare the next packet-ingest tranche from the remaining event-looking packet
leads:

- The Comic Bug
- The Game Chest - Promenade on the Peninsula
- B.Y.O.GAMES LLC
- Grails Gone Wild
- The Bullpen 2.0
- DXN Provisions
- Revenge Of
- Odyssey Games - Pasadena
- Crown City Games
- A & N Collectibles
- Alamo Drafthouse Cinema Downtown Los Angeles

Use quick controlled ingestion or explicit TBD capture. Do not deepen every
record unless it changes whether a Magic event or important store-status signal
should be logged.
