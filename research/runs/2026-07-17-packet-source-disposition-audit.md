# Packet source disposition audit

Date checked: 2026-07-17

Steward: Codex Project Steward

Scope:

- Tilted Gaming
- Buddies Collectibles
- Grails Gone Wild
- B.Y.O.GAMES LLC

Mode: direct steward audit; no workers/subagents; no canonical JSON edits; no
event-record changes proposed.

## Purpose

This audit corrects a process drift: packet-derived source signals must not be
used as background reasoning while remaining invisible. Any packet-derived
source signal used in reasoning now receives one of these dispositions:

- captured as Evidence;
- already captured;
- not accessible / no-use;
- not material;
- TBD for deeper replay.

## Summary

The recent status-conflict / thin-assessment batches were mostly well-covered,
but three source-disposition gaps were found:

1. Tilted Gaming review evidence from the packet was used to understand the
   store-quality/status picture, but only Wizards and the official events page
   were visible as Evidence.
2. Buddies Collectibles has a direct Yelp page with materially better review
   evidence than the secondary review mirrors already captured. Because review
   quality influenced the Places read, the direct Yelp page should be visible
   Evidence rather than left to mirrors.
3. B.Y.O.GAMES local-journalism evidence from the packet materially supports
   the nontraditional third-place/community assessment, but the journalism
   source itself was not attached as Evidence.

Grails is otherwise adequately sourced for the current Places assessment, with
notes below.

## Tilted Gaming

Packet-derived source signals considered:

- KeepUp Google-derived review mirror:
  https://www.keepupcards.com/shop/tilted-gaming-cerritos-ca
- Yahoo Local Yelp-derived reviews:
  https://local.yahoo.com/info-238771589-tilted-gaming-cerritos/
- MapQuest / Yelp-derived listing:
  https://www.mapquest.com/us/california/tilted-gaming-777729997
- Wizards locator:
  https://locator.wizards.com/store/18067

Disposition:

- Wizards locator: already captured.
- KeepUp: needs Evidence backfill. It provides the 4.9 / 83 review signal,
  current hours, address/phone, store website routing, and review snippets that
  mention a clean store, friendly/kid-friendly environment, and visible card
  tables / possible Magic play.
- MapQuest: needs Evidence backfill. It provides Yelp-derived rating/review
  snippets, confirms the address/phone/website, describes TCG/Magic support,
  and no longer appears to be a pure closed-flag source in the checked page.
- Yahoo Local: not accessible / no-use for this lean backfill. The packet's
  Yelp-derived review point is covered by MapQuest in an accessible form.

Assessment adequacy:

- Not fully adequate before backfill. The grade/confidence can remain the same,
  but the user-visible Evidence trail is incomplete without KeepUp and
  MapQuest.

Backfill needed:

- Yes. Add KeepUp and MapQuest as visible Evidence and lightly update Tilted's
  venue/evaluation text to show that review evidence supports store quality and
  physical operation while still leaving Commander texture unresolved.

## Buddies Collectibles

Packet-derived source signals considered:

- Official site / terms / weekly tournament infrastructure.
- Linktree / source routing.
- Google-derived review mirrors including Card Shop Hub / KeepUp.
- Direct Yelp page:
  https://www.yelp.com/biz/buddies-collectibles-gardena
- Yelp-derived / map mirrors, including a MapQuest closed-flag contradiction
  from packet triage.

Disposition:

- Official site: already captured.
- Weekly tournament page: already captured.
- Linktree: already captured.
- Card Shop Hub: already captured.
- KeepUp: already captured.
- Direct Yelp page: needs Evidence backfill. It is claimed, mainstream, and
  stronger than the mirrors for the exact review job: current hours, photos,
  address, accessibility notes, rating/review count, and review texture about
  selection, staff helpfulness, TCG variety, hangout/chill vibe, and tournament
  mentions.
- MapQuest / Yahoo Yelp-derived mirrors: not material as primary Evidence once
  the direct Yelp page is captured. Keep these as fallback/secondary access or
  future source-cleanup signals if a status conflict reappears.

Assessment adequacy:

- Directionally sourced, but incomplete without the direct Yelp page because
  review quality and solo-arrival/store-comfort signals are part of the user
  value proposition.

Backfill needed:

- Yes. Add the direct Yelp page as visible Evidence. No fit-grade or event
  change is required from this alone.

## Grails Gone Wild

Packet-derived source signals considered:

- Wizards locator.
- TCGplayer seller profile.
- Physical-business / directory evidence.
- Map/directory closure or physical-status conflict.

Disposition:

- Wizards locator: already captured.
- TCGplayer: already captured.
- BBB physical-business profile: already captured.
- MapQuest status-conflict signal: already captured.
- FindYourLGS secondary directory signal: already captured.

Assessment adequacy:

- Adequately sourced. The app should show both the event lead and the caution
  that Grails is not a reliable trip target without same-day status
  verification.

Backfill needed:

- No.

## B.Y.O.GAMES LLC

Packet-derived source signals considered:

- LAist / Boyle Heights Beat local-journalism article:
  https://laist.com/news/los-angeles-activities/bring-your-own-games-byo-games-east-la-los-angeles
- Boyle Heights Beat / The LA Local version:
  https://boyleheightsbeat.com/byo-games-east-los-angeles-gaming-community/
- MapQuest / Yelp-derived listing:
  https://www.mapquest.com/us/california/byo-games-456993249
- Wizards locator:
  https://locator.wizards.com/store/21934
- Historical / organizer surfaces such as SoCal Gaming Expo and Challonge.

Disposition:

- Wizards locator: already captured.
- MapQuest: already captured.
- SoCal Gaming Expo: already captured.
- Challonge: already captured as stale/historical.
- LAist / Boyle Heights Beat: needs Evidence backfill. This is the source that
  most clearly supports the third-place/community-lounge analysis, including
  Magic play imagery, community/hangout value, and financial/status caution.
- Boyle Heights Beat / The LA Local duplicate: not material as a separate source
  for the lean write if the LAist republication is captured; both route to the
  same underlying reporting by Alex Medina / Boyle Heights Beat.

Assessment adequacy:

- Partially adequate before backfill. The assessment is directionally right, but
  the most important community-journalism source should be visible Evidence.

Backfill needed:

- Yes. Add LAist / Boyle Heights Beat as Evidence and lightly update BYO's
  venue/evaluation text so the third-place/community and status-caution claims
  visibly trace back to the article.

## Proposed lean backfill

Prepare a controlled Supabase proposal that:

- adds Tilted KeepUp and MapQuest evidence;
- adds Buddies direct Yelp evidence;
- adds BYO LAist / Boyle Heights Beat evidence;
- optionally updates Tilted and BYO assessment/evaluation text only enough to
  align the visible evidence trail with the existing reasoning;
- adds one research-change marker;
- does not add or change event records;
- does not change schema, auth, RLS, app code, or canonical JSON manually.
