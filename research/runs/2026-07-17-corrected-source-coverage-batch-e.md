# Corrected source coverage batch E - Grails, Buddies, Tilted

Date: 2026-07-17  
Pass type: mixed corrective pass

- Grails Gone Wild: targeted correction audit after the Instagram/source-sweep
  methodology change. This is not a completed main store pass.
- Buddies Collectibles: micro-backfill / source-disposition audit.
- Tilted Gaming: micro-backfill / source-disposition audit.

Validation level planned for any write: **lean**. The expected durable changes
are source/evidence and Places-assessment support only. No event rows, schema,
auth, RLS, app code, or canonical JSON edits are proposed.

## Standing correction applied in this pass

Every source that materially affects fit, confidence, status, cautions, open
questions, source routing, or event conclusions must be either captured as
Evidence, already captured, or explicitly dispositioned. A store pass cannot
use packet-derived or obvious-search evidence as private background reasoning
while leaving the user-visible Evidence tab thin.

## Grails Gone Wild / GGW Cards N Collects

Current disposition: **targeted correction stands; main pass still required**.

What was reviewed:

- Existing Supabase evidence already includes the corrected Grails source set:
  official GGW Cards N Collects storefront, Instagram, KeepUp, Card Shop Hub,
  Ravensburger/Lorcana, TCGplayer, BBB, MapQuest/Yelp-derived status conflict,
  FindYourLGS, and Wizards/EventLink.
- The Instagram correction already applied at commit `6025220` supports the
  Grails/GGW identity and visible TCG/MTG activity through September 2025,
  including a stale July 2025 Magic prerelease signal.
- Current/current-looking non-Instagram sources support the narrower conclusion
  that Grails is likely an active TCG storefront, not that July 2026 weekly
  Commander is independently confirmed by store social content.

Event implications:

- Existing Sunday casual Commander remains an active source-backed lead because
  it is already in the app from Wizards/EventLink-derived data.
- No new event write is recommended from this audit.
- Event conclusion remains **event TBD for reliability**, not no-event: replay
  current Wizards/EventLink or store-controlled current social evidence before
  recommending Grails as a reliable trip.

Places assessment implications:

- The conservative C+ / medium-confidence discovery read remains appropriate.
- Do not promote Grails to fully reviewed from this targeted correction alone.
- The useful user-facing synthesis is: likely active TCG storefront; old closed
  flag weakened; Magic/Commander currentness still unresolved.

Source coverage:

- Official site: already captured; supports GGW storefront/alias route, but
  not detailed current MTG calendar truth.
- Instagram: already captured; inspected; supports identity and stale MTG/TCG
  activity through September 2025, not July 2026 Commander.
- Facebook: checked/disposition remains not material or not readily useful in
  this targeted correction.
- Discord/community route: no reliable current Grails Discord route captured;
  deeper replay TBD only if Grails is promoted.
- Wizards/EventLink: already captured; supports the existing Commander lead.
- Reviews: already captured through direct/mirror/status-conflict sources.
- Other useful sources: already captured through TCGplayer, BBB, directories,
  Card Shop Hub, KeepUp, and Ravensburger.

## Buddies Collectibles

Current disposition: **micro-backfill useful; event record already present**.

What was reviewed:

- Official site and terms pages support current store identity, in-store/online
  operation, Gardena address, and a strong commerce/live-stream posture.
- The official site includes Magic among English TCG products and has weekly
  tournament infrastructure, but the public product page does not by itself
  describe the Friday Commander details.
- Direct Yelp evidence is already captured in Supabase as
  `src-buddies-yelp-2026-07-17`. It is material: 4.5-star / review-scale
  evidence, current hours/status texture, and visible review themes around
  friendly/helpful staff, selection, atmosphere, tables, and tournaments being
  welcoming/fun.
- Google/Yelp-derived mirrors are already captured through KeepUp and Card Shop
  Hub. They are useful secondary support, not replacements for direct Yelp.
- Whatnot is a material commerce/community-scale source: the public profile
  shows substantial live-selling footprint and many upcoming shows, mostly
  non-MTG. It supports commerce scale and live-break emphasis, not organized
  in-person Magic proof.

Event implications:

- Existing Friday casual Commander event remains the write-now event already in
  the app.
- No new event row is recommended from this audit.
- Tournament/live-commerce sources do not prove additional MTG calendar events.

Places assessment implications:

- The existing B- / medium-confidence read remains directionally right.
- The direct Yelp signal makes the store-quality side better supported than the
  Evidence tab previously made obvious.
- The main caution remains that the store looks commerce/live-break heavy, so
  Friday Commander may be useful but the lived in-store Commander culture still
  needs Discord or field texture before promotion.

Source coverage:

- Official site: already captured; supports current identity, TCG/MTG product
  depth, and live-commerce orientation.
- Instagram: route likely exists through Linktree/social routing; content
  replay not needed for this micro-backfill unless Buddies is promoted.
- Facebook: not material in this pass.
- Discord/community route: Linktree already captured; Discord survey remains
  TBD for community texture.
- Wizards/EventLink: already captured; supports the Friday Commander event.
- Reviews: direct Yelp already captured; KeepUp/Card Shop Hub already captured.
- Other useful sources: Whatnot should be captured as Evidence because it
  supports commerce scale and live-break orientation.

## Tilted Gaming

Current disposition: **micro-backfill useful; event record already present**.

What was reviewed:

- Official events page is already captured and remains the strongest source for
  current operation, address/hours, store-controlled event infrastructure,
  Discord routing, in-store signup requirement, and a competitive multi-TCG
  identity including MTG.
- Existing Wizards/EventLink records already support the active Friday casual
  Commander event and the inactive duplicate cleanup.
- Review mirrors are already captured through KeepUp and MapQuest/Yelp-derived
  sources. Public Apple/Yahoo-style review surfaces also support current
  identity, hours, high review sentiment, customer-service strength, and broad
  TCG activity.
- Linktree is a material missing source-router: it cleanly confirms the
  store-controlled social, Discord, Instagram, Facebook, app, review, and
  website routes, and states Tilted is a Cerritos cards/collectibles shop with
  MTG among its weekly-event TCGs.

Event implications:

- Existing Friday casual Commander remains the active write-now event already
  in the app.
- No new event row is recommended from this audit.
- Public source routing reinforces that Discord/social replay could help with
  turnout, power level, and solo-arrival texture, but that is a future targeted
  deep replay rather than a prerequisite to retaining the current event.

Places assessment implications:

- The existing B / high-confidence read remains supported.
- Confidence is high because several independent source families agree on
  operation, branch identity, MTG activity, store infrastructure, and review
  quality.
- Do not overstate solo-arrival or casual/proxy comfort: the official framing
  still says competitive TCG hub, in-store signup, and seats can fill.

Source coverage:

- Official site/events page: already captured; supports operation, events,
  address, hours, Discord, and in-store signup.
- Instagram: route found through Linktree; content replay TBD only if promoted.
- Facebook: route found through Linktree; not inspected in this micro-backfill.
- Discord/community route: route found through official events page and
  Linktree; Discord survey remains targeted-deep-replay TBD.
- Wizards/EventLink: already captured; supports active Friday Commander.
- Reviews: already captured through review mirrors; Apple/Yahoo-style public
  review surfaces support the same positive store-quality read.
- Other useful sources: Linktree should be captured as Evidence because it is a
  high-value official source-routing record.

## Proposed durable action

Prepare a lean Supabase proposal:

- add Buddies Whatnot as venue Evidence;
- add Tilted Linktree as venue Evidence;
- update Buddies and Tilted evaluation/assessment text only enough to make the
  already-used review/source-router reasoning visible;
- add a research-change marker for this corrected source-coverage batch.

Do not add or change event rows in this batch. Do not apply live writes until
the user approves the proposal.
