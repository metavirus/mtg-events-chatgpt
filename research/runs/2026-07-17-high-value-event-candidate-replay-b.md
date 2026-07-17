# Research run: high-value event candidate replay B

Date checked: 2026-07-17

Scope:

- Turn Zero Games
- CoreTCG
- Comic Quest
- Collector Legion

Boundary:

- Steward-led direct replay only.
- No canonical JSON edits.
- No live Supabase writes.
- No event ingestion.
- ChatGPT packet material treated as queued evidence, not canonical truth.

## Summary

All four records are confirmed active/current enough for planning, and all four
already have at least one Commander event record in the current repository.

The batch should not become a broad duplicate ingestion pass. The useful
follow-up is a narrow controlled Supabase proposal for source/provenance refresh
and, if desired, one or two specific event-source/event-special additions where
current replay surfaced stronger event facts than the existing records.

## Candidate findings

### Turn Zero Games

Classification: confirmed / already covered.

Current replay:

- Official Linktree identifies Turn Zero as an independent Los Angeles LGS.
- Linktree routes to website, current event schedule, Discord, and card-selling
  intake.
- Linktree copy describes the store as a premier Magic store in Los Angeles
  that buys/sells/trades singles and hosts a wide variety of tournaments.
- Discord public metadata shows a large community surface, around 1,866 members
  at time of replay.

Repository coverage:

- Existing store: `turn-zero-games`.
- Existing source: `src-wpn-8425`.
- Existing event: `turn-zero-games-turn-zero-games-commander-night-3-11-00`.

Dated event vs recurring/projection:

- Current useful signal is routing and recurring-program support.
- No new confirmed dated event was extracted in this pass.

Uncertainty:

- The current event schedule is linked from Linktree but was not fully extracted
  into structured event rows during this quick replay.
- Existing Commander record remains supported by Wizards/EventLink; Linktree is
  best treated as routing/source-map support, not a replacement for event facts.

Recommendation:

- No new event write from this pass.
- Optional proposal item: add/refresh Turn Zero Linktree as official
  source-routing support and preserve the Discord/event-schedule routing.

Sources checked:

- https://linktr.ee/turn0games

### CoreTCG

Classification: confirmed / already covered.

Current replay:

- Official CoreTCG site confirms active Pasadena retail identity, address,
  phone, hours, Magic product depth, and social/Discord routing.
- Site navigation includes Magic, current/recent Magic set product categories,
  Events, Discord, and buylist infrastructure.

Repository coverage:

- Existing store: `coretcg`.
- Existing source: `src-wpn-11989`.
- Existing event: `coretcg-coretcg-commander-5-16-30`.

Dated event vs recurring/projection:

- Current useful signal is recurring Commander coverage already present through
  Wizards/EventLink plus official activity/source routing.
- No new dated event was confirmed in this pass.

Uncertainty:

- Official website proves active commerce and source routing, but the visible
  replay did not expose a structured current Magic event calendar.
- Do not infer additional event records from broad product depth or Discord
  presence.

Recommendation:

- No new event write from this pass.
- Optional proposal item: add/refresh CoreTCG official site/source-routing
  support for the venue record.

Sources checked:

- https://coretcg.com/

### Comic Quest

Classification: confirmed / already covered, with possible special-event
follow-up.

Current replay:

- Official Comic Quest venue calendar confirms Friday Night Magic on July 17,
  2026, 6:00 PM to 10:00 PM.
- Official home page says Friday Night Magic is part of the store's regular
  weekly activity, and explicitly says, "New here? Pull up a chair. Our crowd
  is friendly and used to teaching."
- Official home page also confirms address, phone, hours, and social routing.
- Third-party CardCommunity/WPN-style mirror surfaced additional current Magic
  events at Comic Quest, including FNM Commander, Standard Showdown, and Magic
  Presents: God of Mischief on July 18, 2026. Treat this as useful lead evidence
  unless confirmed through Wizards/EventLink or store-controlled source.

Repository coverage:

- Existing store: `comic-quest`.
- Existing source: `src-wpn-6809`.
- Existing event: `comic-quest-friday-night-magic-fnm-commander-5-18-00`.

Dated event vs recurring/projection:

- Recurring FNM Commander is already present.
- Possible dated special: Magic Presents: God of Mischief on July 18, 2026, but
  current replay source is a mirror rather than primary/store-controlled text.

Uncertainty:

- The official Comic Quest calendar visible in this pass names Friday Night
  Magic but does not specify Commander on the official page excerpt.
- The mirror names Commander-specific and God of Mischief events; verify via
  Wizards/EventLink or store-controlled event page before adding a dated special.

Recommendation:

- No duplicate recurring Commander write.
- Optional proposal item: add official Comic Quest calendar/homepage source
  support to the venue and existing FNM record.
- Defer God of Mischief event ingestion until confirmed by official/EventLink
  evidence.

Sources checked:

- https://comicquest.org/venue/comic-quest/
- https://comicquest.org/
- https://cardcommunity.org/store/comic-quest

### Collector Legion

Classification: confirmed / already covered, with one strong special-event lead.

Current replay:

- Existing repo already has a full comparable pass and a Tuesday Commander
  event record.
- TopDeck currently lists `LEGIONMANIA III` as a Magic: The Gathering EDH event
  at 4451 Redondo Beach Blvd, Lawndale, CA 90260.
- TopDeck page says the event is Saturday, January 31, start 12:00 PM, doors
  11:00 AM, $60 entry, full-proxy friendly, 32-player cap, 4 Swiss rounds, cut
  structure, and competitive-REL-like multiplayer handling.
- TopDeck explicitly says payment through the Collector Legion website is the
  valid registration path, with TopDeck sign-ups not sufficient by themselves.

Repository coverage:

- Existing store: `collector-legion`.
- Existing sources include homepage, special-events catalog, Discord synthesis,
  social profiles, and `src-wpn-11405`.
- Existing event: `collector-legion-commander-tuesday-free-raffle-2-19-00`.

Dated event vs recurring/projection:

- Existing routine event: Tuesday Commander Free Raffle.
- New actionable special lead: LEGIONMANIA III on Saturday, January 31. This is
  a dated cEDH/EDH tournament-style special, not casual weekly Commander.

Uncertainty:

- TopDeck provides detailed event facts, but the linked Collector Legion product
  page could not be safely opened through this quick replay path.
- The event title/path references a `December 2 Dismember` product URL while
  the TopDeck page title is LEGIONMANIA III and date is January 31; preserve
  that odd registration-link mismatch as uncertainty until the store page is
  directly checked.
- This event is likely low personal fit because it is paid, capped,
  tournament-structured, and competitive-REL-like despite being proxy friendly.

Recommendation:

- Do not change the existing recurring Tuesday Commander event.
- Prepare a controlled Supabase proposal only if the user wants this special in
  the catalog:
  - add TopDeck as an event-platform source;
  - optionally add a dated event/occurrence for LEGIONMANIA III with cEDH /
    competitive-special classification and low personal-fit/deprioritized
    presentation;
  - preserve the registration-link mismatch as an uncertainty note.

Sources checked:

- https://topdeck.gg/event/legionmania-iii

## Write/no-write recommendation

Do not prepare a broad recurring-event ingestion proposal.

Recommended narrow proposal, if the user approves:

1. Add/refresh source-routing support for Turn Zero, CoreTCG, and Comic Quest.
2. Attach official Comic Quest calendar/homepage support to the existing Comic
   Quest FNM / Commander evidence without duplicating the recurring record.
3. Add TopDeck source support for Collector Legion LEGIONMANIA III.
4. Optionally add LEGIONMANIA III as a dated competitive/proxy-friendly EDH
   special, clearly deprioritized for the user's casual Commander goals.
5. Do not ingest Comic Quest God of Mischief until primary/store-controlled or
   EventLink evidence confirms it.

Risk level for follow-up proposal: medium if adding LEGIONMANIA III event facts;
low if only adding source/provenance links.

Suggested validation level:

- lean for source/provenance refresh;
- standard if a dated event row/occurrence is added for LEGIONMANIA III.

