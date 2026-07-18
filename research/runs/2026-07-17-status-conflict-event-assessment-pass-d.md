# Status-conflict event and assessment pass D

Date checked: 2026-07-17

Steward: Codex Project Steward

Scope:

- Tilted Gaming
- Grails Gone Wild
- B.Y.O.GAMES LLC
- Buddies Collectibles was considered for this tranche but not reopened because
  it already has a current reviewed evaluation and visible source/evidence
  trail in Supabase.

Mode: direct steward pass; no workers/subagents; no canonical JSON edits; no
live Supabase write during research.

Validation level proposed: standard, because this pass includes one proposed
event-series cleanup plus Places assessment/evidence updates.

## Summary

This pass resolved several leftover packet/tracker ambiguities without turning
them into a broad research wave. The main result is not new event volume:
Wizards/EventLink already had the key Commander rows. The useful work is:

- actively checking whether current event signals should be written now,
  deferred, rejected, or marked historical;
- improving the Places-page read for three stores that were still thin or
  conflicted;
- preserving source/evidence links that explain why each place is or is not a
  good personal planning candidate;
- cleaning up the likely duplicate Tilted Commander event row.

## Tilted Gaming

Sources reviewed:

- Official events page: https://tiltedgamingtcg.com/pages/events
- Existing Wizards/EventLink rows in Supabase.
- Prior packet/tracker notes warning about active/closed conflict and duplicate
  Commander rows.

Finding:

Tilted appears active and very close. The official events page identifies the
Cerritos location, current store hours, Discord routing, in-store sign-up
policy, and an automatically updated monthly schedule with Magic included among
supported games. It also describes the store as a competitive TCG hub. Existing
Supabase data already has Friday Commander coverage, but it has two likely
duplicate Commander series rows for the same Friday 6:00 PM casual Commander
anchor.

Event signal disposition: `write now` for cleanup only. Do not add a new event
row. Mark the older/less useful duplicate `tilted-commanders-weekly` row
inactive and keep the more detailed Friday Night Magic Casual Tilted Commanders
row active.

Assessment recommendation: add official events-page evidence, update venue
notes, and add Places evaluation fields.

Fit/confidence direction: B / 3.7 / high. The store is close and actively
maintained, with a real Commander listing. Confidence improves because the
official events page confirms active operation and Magic as part of the schedule
ecosystem. Fit remains below the top candidates because the public positioning
leans competitive/multi-TCG and does not yet show warm casual Commander texture,
proxy norms, or solo-arrival support beyond a paid seat.

Planning impact: Tilted should be in the practical nearby watch/try set, but
with the expectation that the vibe may be more structured/competitive than
Collectors Lounge or Honey Pot.

TBD: bounded Discord/social check for actual Commander turnout, pod formation,
power expectations, and whether the official competitive-hub framing affects
casual Commander nights.

## Grails Gone Wild

Sources reviewed:

- TCGplayer seller profile: https://www.tcgplayer.com/sellers/Grails-Gone-Wild/44a32529
- BBB profile:
  https://www.bbb.org/us/ca/torrance/profile/collectibles/grails-gone-wild-toys-and-collectibles-1216-1292042
- MapQuest / Yelp-derived listing:
  https://www.mapquest.com/us/california/grails-gone-wild-651263908
- FindYourLGS Gardena-area listing: https://findyourlgs.com/us/gardena
- Existing Wizards/EventLink row in Supabase.

Finding:

Grails is the most conflicted record in this batch. Wizards/EventLink already
contains a Sunday casual Commander row with concrete casual-pod language, and
TCGplayer supports a large active online seller profile. BBB and directory
surfaces support a physical Torrance collectibles business history at the same
address. However, a Yelp-derived map surface flags the location as closed, and
the obvious public footprint is much stronger for collectibles/online commerce
than for a current in-person MTG community. This should not be promoted as a
reliable personal planning venue until status is clearer.

Event signal disposition: `event TBD` / status-conflict. Keep the existing
Wizards Commander row visible for now, but do not add anything new and do not
raise confidence until current physical operation is resolved.

Assessment recommendation: attach commerce/status/conflict evidence, update
venue notes to make the conflict clear, and add a low-confidence Places
evaluation rather than leaving it as a vague discovery lead.

Fit/confidence direction: C / 2.7 / low. The event text would be good if the
store is operating normally, but current physical status uncertainty is too
decision-changing to recommend it.

Planning impact: do not plan around Grails without a same-day status check.

TBD: verify whether the Torrance physical storefront is currently open for
public play, whether the Wizards listing is still valid, and whether Grails is
primarily online/commerce now.

## B.Y.O.GAMES LLC

Sources reviewed:

- Corner profile: https://www.corner.inc/place/pvAgsrzyDZPE
- MapQuest / Yelp-derived listing:
  https://www.mapquest.com/us/california/byo-games-456993249
- SoCal Gaming Expo tabletop page:
  https://socalgamingexpo.com/tabletop-gaming/
- Historical Challonge organizer/event page: https://challonge.com/40294snb
- Existing Wizards/EventLink rows in Supabase.

Finding:

B.Y.O. is a nontraditional but interesting venue. Existing Supabase data already
has Tuesday and Wednesday Commander rows with unusually useful event text:
free-play/warm-up language, four-player minimum pod language, Bracket 3-4,
Rule Zero encouragement, no infinites, and paid tournament details. Public
review/map surfaces describe a real gaming lounge with video games, card-game
space, tournaments, friendly staff, and strong community/hangout signals. SoCal
Gaming Expo also identifies `@byogames_ela` as a tabletop/MTG organizer for
Limited and Commander tournaments, but that June 2026 expo has passed and should
be preserved as organizer/quality context, not current calendar material. The
main caveat is status/source conflict: MapQuest says closed, while Corner and
Waze/search-style surfaces show open/recent operation. That conflict should be
visible but not fatal because multiple current-ish signals point to operation.

Event signal disposition: no new current event write. Existing Tuesday and
Wednesday Commander rows already cover the actionable current calendar
implications. SoCal Gaming Expo and Challonge are `stale/historical` or
source/evidence-only for organizer character.

Assessment recommendation: attach review/community/organizer evidence, update
venue notes, and add Places evaluation fields.

Fit/confidence direction: B- / 3.5 / medium. BYO may be socially valuable
because the evidence describes a gaming lounge/community space rather than just
a retail shop. Fit is capped by distance, status conflict, explicit no-proxy /
Bracket 4 historical signals, and the fact that the Commander experience may be
more tournament-like than relaxed open play.

Planning impact: BYO is worth watching as a community/third-place style lead,
but verify current operation and event details before driving there.

TBD: verify current operation, Discord/social schedule, whether Tuesday versus
Wednesday Commander differ, whether no-proxy applies to current store play, and
whether solo players can easily join pods.

## Proposed ingest

Prepare a controlled Supabase proposal that:

- adds materially useful source/evidence rows for Tilted, Grails, and B.Y.O.;
- adds Places-page evaluation rows for all three stores;
- updates venue assessment notes and verification dates;
- marks one likely duplicate Tilted Commander series inactive;
- adds one research-change marker;
- does not add new event rows;
- does not change schema, auth, RLS, app code, or canonical JSON manually.

## Applied checkpoint

Status: applied to Supabase after user approval on 2026-07-17.

Proposal:

- `supabase/proposals/status-conflict-event-assessment-pass-d-2026-07-17.json`

Writes performed:

- Inserted 9 source records.
- Inserted 9 venue evidence links.
- Updated 3 venue assessment/status records.
- Inserted 3 Places-page evaluation records.
- Updated 1 existing Tilted event-series row to `inactive` as a
  duplicate/superseded snapshot.
- Inserted 1 research-change marker.

Post-write verification:

- All three venues now have 2026-07-17 reviewed assessment notes.
- All three evaluation rows are present:
  - Tilted Gaming: B / 3.7 / high confidence / neutral.
  - Grails Gone Wild: C / 2.7 / low confidence / deprioritized.
  - B.Y.O.GAMES LLC: B- / 3.5 / medium confidence / neutral.
- Evidence links were attached as expected:
  - Tilted Gaming: 1 new source link.
  - Grails Gone Wild: 4 new source links.
  - B.Y.O.GAMES LLC: 4 new source links.
- Tilted now has exactly 1 active Friday 6:00 PM Commander series row.
- Event-series count remained unchanged at 98 because no new event rows were
  added.
- Duplicate event-occurrence check remained clear at 0.
- Final relevant row counts after write:
  - Venues: 55.
  - Sources: 238.
  - Entity-source links: 242.
  - Evaluations: 31.
  - Event series: 98.
  - Research changes: 49.
- Full deterministic JSON export was intentionally not run under the reduced
  overhead rule; this was a standard validation batch, not a release checkpoint.
