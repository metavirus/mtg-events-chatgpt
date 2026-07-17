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

## Batch 2 disposition — completed structurally

Batch 2 scope:

- The Bullpen 2.0
- DXN Provisions
- Revenge Of
- Odyssey Games - Pasadena

### The Bullpen 2.0

- Packet source: `01-requested-26-venues.md` item 16.
- Existing ID: `the-bullpen-2-0`.
- Current packet decision: `conflict/status TBD` plus `stale / historical`.
- Event decision: no new event write from packet triage.
- Reason: Supabase already has a Weekly Commander row from Wizards/EventLink,
  but the packet does not provide current operation support. Packet evidence is
  historical: older industry features support a real prior Magic/tournament
  store, while map evidence flags the historical location closed and the current
  repo address/status remain unresolved.
- Durable TBD: resolve current operation, address continuity, and whether the
  Wizards record is current before treating Bullpen as actionable.
- Do not chase now: relocation/status archaeology or fresh Wizards replay.

### DXN Provisions

- Packet source: `01-requested-26-venues.md` item 19.
- Existing ID: `dxn-provisions`.
- Current packet decision: `no-write / no-action` plus `source/evidence-only`.
- Event decision: no new event write from packet triage.
- Reason: Supabase already has a Dxn Casual Commander Night row from
  Wizards/EventLink. The packet adds only a mixed-hobby/source-routing read:
  official identity historically emphasizes Mini 4WD, while TCGplayer and some
  reviews support a broader TCG footprint. It does not supply a new credible
  event or a strong reason to prioritize DXN for personal planning.
- Durable TBD: only revisit if current Wizards/social evidence emerges or the
  venue becomes geographically/planning relevant.
- Do not chase now: broad review or current social replay.

### Revenge Of

- Packet source: `01-requested-26-venues.md` item 20.
- Existing ID: `revenge-of`.
- Current packet decision: `no-write / no-action` plus `source/evidence-only`.
- Event decision: no new event write from packet triage.
- Reason: Supabase already has a Casual Commander row from Wizards/EventLink.
  Packet evidence shows a comic/pop-culture/pinball venue with MTG products,
  but official current events are not Magic-focused and no actionable Magic
  event is supplied by the packet.
- Durable TBD: keep the Wizards-vs-low-visible-Magic-emphasis tension as a
  deprioritization/context note; only replay if a current official/social Magic
  signal appears.
- Do not chase now: current events-page monitoring or Magic emphasis research.

### Odyssey Games - Pasadena

- Packet source: `01-requested-26-venues.md` item 22.
- Existing ID: `odyssey-games-pasadena`.
- Current packet decision: `deeper-research TBD` plus `source/evidence-only`.
- Event decision: no new event write from packet triage.
- Reason: Supabase already has Monday and Friday Casual Commander rows from
  Wizards/EventLink. The packet supports Odyssey as a large established gaming
  store with general Magic activity and a large positive review corpus, but it
  also preserves a solo-arrival/community-fit caution: one review described the
  MTG community as cliquish or difficult for unaffiliated players. The packet
  does not provide enough current calendar/community detail to write additional
  event rows.
- Durable TBD: later review calendar/community signals if Odyssey becomes a
  serious candidate; specifically test whether the solo-arrival caution is
  representative.
- Do not chase now: full calendar, Discord, or review replay.

## Batch 3 disposition - completed structurally

### Crown City Games

- Packet source: `01-requested-26-venues.md` item 23.
- Existing ID: `crown-city-games`.
- Current packet decision: `superseded by later Codex pass` plus
  `source/evidence-only`.
- Event decision: no new event write from packet triage.
- Reason: the packet treated Crown City as a promising physical/community venue
  with no current actionable Magic cadence yet confirmed. The current data has
  already moved beyond that packet state with Wizards/EventLink-backed event
  rows for cEDH, Friendly Commander, and Friday Night Magic Friendly Commander.
  The packet's Old Pasadena district profile and TCGList notes remain useful
  as venue-quality/source-routing evidence, but they do not require a new
  event write.
- Durable TBD: later Places-assessment pass can use the district/profile
  evidence to clarify newcomer friendliness, broad TCG environment, and
  physical play-space confidence.
- Do not chase now: official social/calendar replay or community-fit review
  work.

### A & N Collectibles

- Packet source: `01-requested-26-venues.md` item 26.
- Existing ID: `a-and-n-collectibles`.
- Current packet decision: `source/evidence-only` plus `deeper-research TBD`.
- Event decision: no new event write from packet triage.
- Reason: the packet gives useful venue-assessment evidence: mixed
  sports-card/TCG identity, strong review volume, review mentions of drafts,
  Commander, weekly Magic tournaments, a tournament room, and deck-building
  help. Current repository data already has A & N at `partial` with Wizards,
  Facebook, Instagram, and Google/search source coverage. The packet does not
  provide a store-controlled current event schedule, so its event implications
  should remain assessment/evidence support rather than new event rows.
- Durable TBD: later Places-assessment pass should decide whether A & N's fit
  score/description should improve from the review-supported Magic signals,
  while keeping confidence bounded until an official current calendar or social
  event stream is replayed.
- Do not chase now: direct Yelp/review replay, fees, turnout, or official
  calendar extraction.

### Alamo Drafthouse Cinema Downtown Los Angeles

- Packet source: `01-requested-26-venues.md` item 13.
- Existing ID: `alamo-drafthouse-cinema-downtown-los-angeles`.
- Current packet decision: `superseded by later Codex pass` plus
  `conflict/status TBD`.
- Event decision: no new event write from packet triage.
- Reason: the packet found an active cinema venue, a Wizards organization
  record, and no ordinary ongoing public Magic identity. Current repository
  data already contains a Wizards/EventLink-backed Casual Commander Nights row,
  so the packet should not be used to add anything new. The useful unresolved
  question is not "create event now"; it is whether Alamo should remain a
  venue-only/special-case planning record, and how much confidence to assign to
  a cinema-hosted Magic listing compared with ordinary LGS/community stores.
- Durable TBD: later review/venue pass should verify whether the Magic listing
  is recurring and practical for personal attendance, and whether the venue
  should be deprioritized despite the event row.
- Do not chase now: organizer provenance, The Bloc address variants, or
  cinema-review replay.

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
| Alamo Drafthouse Cinema Downtown Los Angeles | superseded by later Codex pass / conflict-status TBD | Batch 3 disposed structurally; later venue-only/practicality check only. |
| The Game Cellar | applied / superseded | Event replay A handled. |
| GXGAMERS | applied | Already evaluated. |
| The Bullpen 2.0 | conflict/status TBD / stale-historical | Batch 2 disposed structurally; current operation/address continuity later. |
| Turn Zero Games | applied / Replay B tied off | Source/evaluation implications already in Supabase. |
| CoreTCG | applied / Replay B tied off | Source/evaluation implications already in Supabase. |
| DXN Provisions | no-write / no-action plus source-evidence-only | Batch 2 disposed structurally; revisit only if current Magic signal emerges. |
| Revenge Of | no-write / no-action plus source-evidence-only | Batch 2 disposed structurally; low visible Magic emphasis preserved. |
| Next-Gen Games | applied / superseded | Event replay A handled. |
| Odyssey Games - Pasadena | deeper-research TBD / source-evidence-only | Batch 2 disposed structurally; calendar/community fit later if prioritized. |
| Crown City Games | superseded by later Codex pass / source-evidence-only | Batch 3 disposed structurally; later assessment/source replay only if prioritized. |
| Comic Quest | applied / Replay B tied off | Source/evaluation implications already in Supabase; God of Mischief remains deeper TBD unless stronger source confirms it. |
| It's GameTime! | applied / superseded | Event replay A handled. |
| A & N Collectibles | source-evidence-only / deeper-research TBD | Batch 3 disposed structurally; later assessment pass should use review-supported Magic signals. |

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

### Batch 4 — remaining conflict/status sweep

- Tilted Gaming
- Buddies Collectibles if closure contradiction remains material
- Kingslayer Games - Lake Forest contamination warning
- any status/history item left open after Batches 2 and 3

Goal: durable conflict/status TBDs or no-write decisions, not deep archaeology.
