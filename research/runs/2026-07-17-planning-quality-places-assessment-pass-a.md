# Planning-quality Places assessment pass A

Date: 2026-07-17

Steward: Codex Project Steward

Scope:

- A & N Collectibles
- Crown City Games
- Odyssey Games - Pasadena
- The Game Chest - Promenade on the Peninsula

Mode: direct steward pass; no workers/subagents; no canonical JSON edits; no live Supabase writes during research.

## Purpose

This pass ties off four ChatGPT-packet / current-backlog stores under the newer
research model: every meaningful store replay should capture both event
implications and Places-page assessment implications.

The goal was not to exhaust the internet. The goal was to decide whether each
store now has enough evidence to improve the user's planning surface:

- event write recommendation;
- assessment change recommendation;
- fit grade / score / confidence direction;
- positives;
- cautions;
- open questions;
- source/provenance updates;
- whether the result changes how the user should think about trying the place.

## Batch result

No new event rows are recommended in this pass. All four stores already have
current Wizards/EventLink Commander coverage in the app. The useful ingest is
assessment/evidence enrichment for Places.

Recommended write path:

- add materially useful review, official, directory, event-platform, and
  source-routing pages as venue Evidence;
- update venue assessment notes and research status where the pass reached
  candidate-grade usefulness;
- add/update evaluation fields so the Places page shows positives, cautions,
  open questions, fit, and confidence;
- add a research-change marker explaining that this was an assessment/evidence
  enrichment, not new event ingestion.

## A & N Collectibles

### What was reviewed

- Existing repository/Wizards record: three current Commander rows already
  exist for Monday, Wednesday, and Friday.
- Yahoo Local / Yelp-derived listing for A & N Collectibles:
  https://local.yahoo.com/info-20766590-a-n-sports-cards-san-dimas
- Loc8NearMe review/directory mirror:
  https://www.loc8nearme.com/california/san-dimas/a-and-n-collectibles/7794315/
- Card Shop Hub review mirror:
  https://cardshophub.com/states/ca/san-dimas/a-n-collectibles/
- Card Shops Near Me review/editorial mirror:
  https://cardshopsnearme.com/california/a-n-collectibles/

### What it says

A & N is not just a sports-card shell. The reviewed sources converge on an
active trading-card store with MTG inventory, staff help, Commander references,
draft/prerelease mentions, weekly Magic tournament language, and some play-space
signals. The strongest event facts remain the existing Wizards rows; the review
mirrors should support venue evaluation and confidence, not create event rows by
themselves.

There is one useful tension: some mirror/editorial language frames the shop as
more sports-card oriented and not ideal for in-store play, while other review
evidence explicitly mentions Commander, draft, prerelease, Magic inventory, and
people playing. That should be preserved as a caution rather than averaged away.

### Recommended disposition

- Event write recommendation: no new event rows now.
- Assessment recommendation: update Places assessment and Evidence.
- Fit direction: improve from thin/placeholder to B- / planning candidate.
- Confidence direction: raise to high enough for a supported store read, because
  Wizards rows plus multiple review mirrors support the same basic picture.
- Positives:
  - three current Commander anchors already in the app;
  - review-derived support for Commander, draft, prerelease, staff help, and MTG
    inventory;
  - open seven days and plausibly usable as a repeat card-store stop.
- Cautions:
  - far from Los Alamitos;
  - mixed sports-card / TCG identity may affect community focus;
  - play-space and solo-arrival experience are not yet described by an official
    source.
- Open questions:
  - which of the Monday/Wednesday/Friday Commander nights is best for a first
    solo visit?
  - does the store have a current Discord, Facebook group, or other coordination
    surface?
  - is the review-mirror “not ideal for in-store play” caution stale, narrow, or
    a real issue?
- How this changes planning: A & N should no longer be treated as “what is this
  thing?” It is a real MTG/Commander candidate, probably worth trying only if
  the distance is acceptable or if a specific Commander night looks strong.

## Crown City Games

### What was reviewed

- Existing repository/Wizards record: Monday cEDH, Wednesday Friendly Commander,
  and Friday FNM Friendly Commander rows already exist.
- Frontline Gaming spotlight:
  https://frontlinegaming.org/2026/02/16/champions-of-tabletop-crown-city-games/
- TopDeck competitive EDH event listing at Crown City Games:
  https://topdeck.gg/event/take-the-crown-02-bff
- Corner place profile:
  https://www.corner.inc/place/pmoShXQnuT4P
- Board Game Cafe Finder profile:
  https://boardgamecafefinder.com/cafe/crown-city-games

### What it says

Crown City has unusually strong third-party texture for a store that was still
thin in the app. The Frontline spotlight describes a community/accessibility
angle, open gaming, and a broad tabletop ecosystem. Corner describes free play
tables, community depth, Discord, weekly game nights, and card tournaments.
TopDeck shows that Crown City is also a serious competitive/cEDH host; that is
useful evidence about the ecosystem but should not be ingested as a normal
upcoming event unless separately checked as current and actionable.

### Recommended disposition

- Event write recommendation: no new event rows now.
- Assessment recommendation: update Places assessment and Evidence.
- Fit direction: improve from thin/placeholder to B / strong watch-list
  candidate.
- Confidence direction: raise to high for venue quality/source-routing read;
  keep Commander social fit bounded by distance and power-level mix.
- Positives:
  - existing Wizards Commander cadence includes friendly Commander and cEDH;
  - strong open-gaming/community-place evidence;
  - public evidence supports newcomer-friendly and broad tabletop community
    positioning.
- Cautions:
  - Pasadena distance makes it a deliberate trip;
  - cEDH/competitive ecosystem may or may not match the user's preferred casual
    Commander lane;
  - Discord/community details still need a bounded check before calling it a
    solo-arrival fit.
- Open questions:
  - is the Wednesday/Friday Friendly Commander lane socially easy for a solo
    arrival?
  - does the Discord support LFG or table formation?
  - how separated are friendly Commander and competitive/cEDH players in
    practice?
- How this changes planning: Crown City becomes a credible higher-upside option
  rather than a generic distant Wizards listing. It is probably worth watching
  and possibly trying if the user is already willing to travel toward Pasadena.

## Odyssey Games - Pasadena

### What was reviewed

- Existing repository/Wizards record: Monday and Friday Casual Commander rows
  already exist.
- Official Odyssey Games About page:
  https://odysseygamesco.com/about
- Official Odyssey Games bulletin board:
  https://odysseygamesco.com/bulletin-board
- Wanderlog review/directory mirror:
  https://wanderlog.com/place/details/6658627/odyssey-games-pasadena

### What it says

Odyssey has one of the strongest physical-infrastructure profiles in this
batch: a very large store, open tables, a broad Magic community, and official
language that specifically spans casual Commander through competitive events.
Wanderlog/review evidence reinforces the large play-space and active community
read.

The caution is not whether the store is real or whether Magic exists. It is
whether the social experience is good for the user's solo-arrival goal. The
preserved packet included a cautionary review about the MTG community feeling
cliquish or difficult for unaffiliated players. That is exactly the sort of
signal that belongs in the Places assessment as a caution/open question rather
than being discarded.

The official bulletin board was less useful for current Magic facts: the visible
page contained stale/placeholder event text. That should be treated as a source
health caution, not as evidence against the store.

### Recommended disposition

- Event write recommendation: no new event rows now.
- Assessment recommendation: update Places assessment and Evidence.
- Fit direction: improve from thin/placeholder to B- / strong infrastructure
  with solo-arrival caveat.
- Confidence direction: high for infrastructure and Magic activity; bounded for
  personal social fit until Discord or firsthand/user evidence exists.
- Positives:
  - large established play space;
  - official language supports Magic, casual Commander, competitive play, and a
    broad player community;
  - existing Wizards rows give usable Monday/Friday Commander anchors.
- Cautions:
  - Pasadena distance;
  - current official bulletin board is not a clean schedule surface;
  - preserved review evidence raises a solo-arrival/community integration
    caution.
- Open questions:
  - does Discord or staff help newcomers find pods?
  - are Monday/Friday Casual Commander nights actually casual in practice?
  - is the cliquishness signal isolated, stale, or representative?
- How this changes planning: Odyssey is clearly a real, substantial Magic store,
  but the next question is social fit rather than event existence.

## The Game Chest - Promenade on the Peninsula

### What was reviewed

- Existing repository/Wizards record: Tuesday Casual Commander row already
  exists.
- Game Chest Linktree:
  https://linktr.ee/TheGameChest
- Branch Facebook:
  https://www.facebook.com/GameChestPromenade
- Palos Verdes Pulse branch/venue context:
  https://www.palosverdespulse.com/blog/meetgeannaculbertson
- Existing Wizards/EventLink branch record.

### What it says

The Game Chest Promenade is a credible distinct branch, and the Linktree is a
useful source router because it separates branch-specific social/Discord paths.
That solves a real identity/source-routing problem.

The pass did not find enough branch-specific Magic/social texture to promote it
as a strong personal candidate beyond the existing Wizards Commander row. The
right disposition is not “bad store”; it is “real branch, real listed Commander
slot, assessment still thin until branch-specific Facebook/Discord/source replay
is done.”

### Recommended disposition

- Event write recommendation: no new event rows now.
- Assessment recommendation: update Places assessment and Evidence, but keep
  fit modest and confidence medium.
- Fit direction: C+ / plausible but not yet decision-changing.
- Confidence direction: medium for branch identity and listed event; lower for
  community texture.
- Positives:
  - distinct branch routing is now clearer;
  - Wizards has an actionable Tuesday Casual Commander row;
  - Linktree points to branch-specific social/community channels.
- Cautions:
  - little branch-specific MTG culture evidence captured in this pass;
  - multi-branch Game Chest search results can conflate stores;
  - Tuesday-only Commander is less aligned with the user's Friday-Sunday
    discovery pattern.
- Open questions:
  - what does the Palos Verdes/Promenade Discord show about Commander turnout?
  - does the branch Facebook show current Magic schedule graphics?
  - is Tuesday Casual Commander enough to justify the drive?
- How this changes planning: The store should stay in the candidate universe,
  but it is not a high-priority try-unless-nearby lead until branch-specific
  community evidence improves.

## Durable TBDs

- A & N: check for current Discord or equivalent community coordination surface;
  identify which Commander night is best for a first solo visit.
- Crown City: bounded Discord/community check; separate Friendly Commander from
  competitive/cEDH social expectations.
- Odyssey: bounded Discord/social check focused on solo-arrival friendliness and
  whether the cliquishness caution is stale or representative.
- Game Chest Promenade: branch-specific Facebook/Discord replay; confirm whether
  Tuesday Commander has enough turnout to matter.

## Proposed ingest summary

Create a controlled Supabase proposal that:

- adds the reviewed sources as venue Evidence where they materially affected
  assessment;
- updates venue assessment notes for all four stores;
- adds/updates evaluation rows with fit/confidence/positives/cautions/open
  questions;
- adds a research-change marker;
- does not add event rows;
- does not change schema, auth, RLS, app code, or canonical JSON manually.

## Applied status

Applied live after user approval.

- Proposal:
  `supabase/proposals/planning-quality-places-assessment-pass-a-2026-07-17.json`
- Pre-write export:
  `supabase/exports/prewrite-planning-quality-places-assessment-pass-a-2026-07-17`
- Post-write export:
  `supabase/exports/postwrite-planning-quality-places-assessment-pass-a-2026-07-17`
- Applied operations: 37
- Supabase post-write counts:
  - venues: 55
  - sources: 221
  - entity_sources: 225
  - evaluations: 23
  - event_series: 98
  - event_occurrences: 11
  - research_changes: 47
- Verification:
  - all four venues have `reviewed` status, `2026-07-17` verification date,
    and assessment notes;
  - all four venues have evaluation rows with fit, confidence, positives,
    cautions, and open questions;
  - 14 new sources and 14 venue evidence links were present;
  - no duplicate event occurrences were found;
  - deterministic post-write export verified;
  - repository text integrity passed.
- Event ingest result: no event rows were added or changed.
