# ChatGPT packet ingest tracker — 2026-07-17

Purpose: durable source-of-truth tracker for dispositioning the preserved
ChatGPT PR #15/#16 packet. This file records packet-ingest status only. It is
not a replacement for Supabase research truth, the app, or the long-term work
backlog.

Disposition values:

- `applied`: already reduced to Supabase or durable accepted Codex record.
- `no-write / no-action`: packet item does not warrant a Supabase write now.
- `stale / historical`: preserve as history; do not present as current planning
  without fresh evidence.
- `source/evidence-only`: preserve evidence or source-routing, but no event row.
- `conflict/status TBD`: packet identifies a conflict that needs later bounded
  status or identity resolution.
- `deeper-research TBD`: useful but requires real source replay, Discord, social,
  or calendar review later.
- `superseded`: later Codex pass has overtaken the packet item.

## Current batch policy

This phase is structural packet disposition, not full research. If a record
requires real source replay to decide, mark it as TBD instead of chasing it.

If a credible Magic event is already supported well enough, it should be logged
or proposed even if it is low personal fit; poor-fit events should be labeled,
deprioritized, hidden, or ranked down rather than ignored.

## Batch 1 disposition — completed structurally

Batch 1 scope:

- The Comic Bug
- The Game Chest - Promenade on the Peninsula
- B.Y.O.GAMES LLC
- Grails Gone Wild

### The Comic Bug

- Packet source: `01-requested-26-venues.md` item 9.
- Existing ID: `the-comic-bug`.
- Current packet decision: `conflict/status TBD` plus `source/evidence-only`.
- Event decision: no new event write from packet triage.
- Reason: Supabase already has a Commander Night record from Wizards/EventLink,
  but the packet does not provide a fresh, branch-safe event confirmation. The
  packet's main value is the historical/current branch-status warning: old
  Manhattan Beach/Game Hub history and current brand activity can be conflated.
- Durable TBD: resolve historical Manhattan Beach / current branch status before
  attaching branch-specific reviews or promoting additional events.
- Do not chase now: full current Comic Bug branch/social/event replay.

### The Game Chest - Promenade on the Peninsula

- Packet source: `01-requested-26-venues.md` item 4.
- Existing ID: `the-game-chest-promenade-on-the-peninsula`.
- Current packet decision: `deeper-research TBD`.
- Event decision: no new event write from packet triage.
- Reason: Supabase already has a Casual Commander record from Wizards/EventLink.
  The packet confirms branch routing exists through official Game Chest Linktree,
  branch Facebook, and branch Discord paths, but it does not provide enough
  branch-specific Magic schedule/community evidence to write anything new.
- Durable TBD: review Promenade branch Facebook/Discord or other branch-specific
  official source later if this branch becomes relevant.
- Do not chase now: generic Game Chest sources, because they conflate branches.

### B.Y.O.GAMES LLC

- Packet source: `01-requested-26-venues.md` item 5.
- Existing ID: `b-y-o-games-llc`.
- Current packet decision: `conflict/status TBD`.
- Event decision: no new event write from packet triage.
- Reason: Supabase already has Tuesday and Wednesday casual Commander records
  from Wizards/EventLink. The packet's added value is not a new event; it is the
  operation-status warning. Local reporting supports BYO as a community gaming
  hub with Magic history, but also documents instability/closure risk, and
  current directories conflict on open status.
- Durable TBD: verify current operation before treating BYO as an actionable
  current planning venue.
- Do not chase now: live operational status, organizer continuity, or schedule
  replay.

### Grails Gone Wild

- Packet source: `01-requested-26-venues.md` item 2.
- Existing ID: `grails-gone-wild`.
- Current packet decision: `conflict/status TBD` plus `stale / historical`
  caution.
- Event decision: no new event write from packet triage.
- Reason: Supabase already has a Casual Commander record from Wizards/EventLink.
  The packet does not confirm current in-person play. Its core signal is the
  conflict between active online commerce/TCGplayer seller evidence and
  closed/unclear physical-location evidence.
- Durable TBD: resolve whether Grails is online-only, relocated, stale, or still
  public-facing before relying on any in-person Commander record.
- Do not chase now: physical status or Wizards validity replay.

## Remaining packet items

### Requested 26 venues packet

| Packet item | Current disposition | Next packet-ingest action |
|---|---|---|
| Tweedy Cards and Gaming | applied / superseded | Already repaired by later Codex pass; keep any Discord details as deeper TBD only. |
| Grails Gone Wild | conflict/status TBD | Batch 1 disposed structurally; later status check only. |
| TK Collectibles / TKTCG | applied / source-evidence-only | Already evaluated in nearby thin-store batch; no default reopen. |
| The Game Chest - Promenade on the Peninsula | deeper-research TBD | Batch 1 disposed structurally; branch-specific source replay only if prioritized. |
| B.Y.O.GAMES LLC | conflict/status TBD | Batch 1 disposed structurally; current operation check later. |
| LVLUP GAMING TCG | applied | Already evaluated; reliability caution captured. |
| The Crimson Guild - South El Monte | applied / superseded | Event candidate replay A handled; no default reopen. |
| Games For Meeple | applied | Already evaluated. |
| The Comic Bug | conflict/status TBD / source-evidence-only | Batch 1 disposed structurally; branch/history cleanup later. |
| Aki Collectibles | applied | Already evaluated. |
| The Game Chest - Irvine | applied / conflict resolved enough | Batch A clarified Alton/Spectrum context. |
| Otaku Vault | applied | Already evaluated. |
| Alamo Drafthouse Cinema Downtown Los Angeles | remaining event-looking / likely stale or venue-only TBD | Batch 3 packet triage. |
| The Game Cellar | applied / superseded | Event replay A handled. |
| GXGAMERS | applied | Already evaluated. |
| The Bullpen 2.0 | remaining conflict/status TBD | Batch 2 packet triage. |
| Turn Zero Games | applied / Replay B tied off | Source/evaluation implications already in Supabase. |
| CoreTCG | applied / Replay B tied off | Source/evaluation implications already in Supabase. |
| DXN Provisions | remaining no-write or source/evidence-only candidate | Batch 2 packet triage. |
| Revenge Of | remaining no-write or source/evidence-only candidate | Batch 2 packet triage. |
| Next-Gen Games | applied / superseded | Event replay A handled. |
| Odyssey Games - Pasadena | remaining source/evidence-only or deeper TBD | Batch 2 packet triage. |
| Crown City Games | remaining source/evidence-only or deeper TBD | Batch 3 packet triage. |
| Comic Quest | applied / Replay B tied off | Source/evaluation implications already in Supabase; God of Mischief remains deeper TBD unless stronger source confirms it. |
| It's GameTime! | applied / superseded | Event replay A handled. |
| A & N Collectibles | remaining source/evidence-only or deeper TBD | Batch 3 packet triage. |

### Existing repo catch-up 29 packet

| Packet item | Current disposition | Next packet-ingest action |
|---|---|---|
| Collectors Lounge - Cypress | applied / superseded | Already deepened; retain solo-arrival/turnout as later TBD. |
| Hobby Overflow | deeper-research TBD | Not packet-ingest blocker; Discord/community texture later. |
| JJ's Collectibles | deeper-research TBD | Preserve session-specific recommendations; not in immediate packet-ingest batch. |
| Joyful Toad TCG | deeper-research TBD | Commander corroboration later. |
| Finch and Sparrow Games | applied / superseded | Multiple later Codex passes supersede packet. |
| Krazy Nick's Games / Honey Pot Meadery relationship | applied | Batch A identity/status resolved enough; Honey Pot later deepening separate. |
| Tilted Gaming | conflict/status TBD | Later status check; not Batch 1. |
| Requiem: Coffee, Tea, and Fantasy | deeper-research TBD | Later venue/community pass; not packet-ingest blocker. |
| Comic Book Hideout | applied / superseded | Later Codex pass promoted/corrected. |
| Kingslayer Games - Fountain Valley | applied / superseded | Existing candidate; branch-specific refinements later. |
| SoCalMagic | applied / superseded | No-proxy caution already captured. |
| Guildhall - Whittier | applied / superseded | Later Codex pass promoted with Magic-prominence caution. |
| Shadow Realm Collectibles | applied | Nearby thin-store batch handled. |
| Shuffle and Cut Games - Brea / former La Habra identity | applied / conflict-status note | Batch A preserved uncertainty. |
| ProjectCCG - Santa Ana | applied / conflict-status note | Batch A preserved branch/community separation. |
| Spellhold Games | deeper-research TBD | Current Saturday details later if prioritized. |
| Buddies Collectibles | applied / possible status TBD | Already evaluated; only reopen if closure contradiction matters. |
| Alakazam Comics | deeper-research TBD | Current schedule extraction later. |
| Cardboard Games | applied / superseded | Later Codex pass normalized/updated. |
| Lost Planet Games | applied / superseded | Later Codex pass promoted; current calendar refresh later. |
| Honey Pot Meadery | applied / superseded | Batch A plus later Honey Pot normalization handled. |
| The Game Chest - Del Amo Fashion Center | no-write / no-action | Later light treatment did not raise priority. |
| Card Arena | deeper-research TBD | Exact-address/source discovery later. |
| Collector Legion | applied / Replay B tied off | LEGIONMANIA III logged as inactive historical competitive special; Saturday clarity later. |
| Kingslayer Games - Lake Forest | conflict/status TBD | Event-text contamination warning remains until branch-specific replay. |
| Magic and Monsters | applied / superseded | Later Codex pass promoted; further event-stream refinement later. |
| Paper Hero's Games - Huntington Beach | deeper-research TBD | Determine actionable Commander nights later. |
| The Guild House | applied / superseded | Strong candidate; solo-arrival operations later. |
| Consolidated identity/status conflict record | partially applied / remaining conflict-status TBD | Batch A resolved key conflicts; remaining conflict items are tracked above. |

## Remaining immediate packet-ingest batches

### Batch 2 — event-looking triage B

- The Bullpen 2.0
- DXN Provisions
- Revenge Of
- Odyssey Games - Pasadena

Goal: no deep research; decide event write now, source/evidence-only, no-write,
stale/historical, conflict/status TBD, or deeper-research TBD.

### Batch 3 — event-looking triage C

- Crown City Games
- A & N Collectibles
- Alamo Drafthouse Cinema Downtown Los Angeles

Goal: same structural disposition as Batch 2.

### Batch 4 — remaining conflict/status sweep

- Tilted Gaming
- Buddies Collectibles if closure contradiction remains material
- Kingslayer Games - Lake Forest contamination warning
- any status/history item left open after Batches 2 and 3

Goal: durable conflict/status TBDs or no-write decisions, not deep archaeology.
