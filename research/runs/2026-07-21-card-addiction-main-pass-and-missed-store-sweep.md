# Card Addiction main pass and missed-store sweep

Date: 2026-07-21  
Mode: main store pass plus bounded missing-store sweep  
Status: live Supabase write applied and verified

## Why this pass happened

The user mentioned a store in Anaheim called Card Addiction that did not appear
in the app. A local repository search and a live Supabase read both confirmed
that Card Addiction was genuinely absent from the operational venue set, not
merely hidden by the UI.

Existing Anaheim records in Supabase at check time were:

- Honey Pot Meadery
- Joyful Toad TCG
- Requiem: Coffee, Tea, and Fantasy

No `Card Addiction`, `card-addiction`, or State College Boulevard venue record
was present.

## Card Addiction source coverage

Store: Card Addiction  
Address: 1538 N State College Blvd, Anaheim, CA 92806  
Phone: (714) 817-7876  
Approximate distance: about 9.8 miles from Los Alamitos  

Source coverage:

- Official site: inspected/captured. The Card-Addiction.com contact page
  confirms the store-controlled website and routes to Instagram and Facebook.
  The site itself reads more like commerce/contact infrastructure than a
  current Magic event calendar.
- Instagram: route captured from official site; content not meaningfully
  inspected in this pass. Disposition: content replay TBD.
- Facebook: route captured from official site; content not meaningfully
  inspected in this pass. Disposition: content replay TBD.
- Discord/community route: searched; no clear Discord route found in this
  bounded pass. Disposition: not found/TBD.
- Wizards/EventLink: searched by store name and likely locator terms; no
  current WPN/EventLink hit found. Disposition: no current MTG calendar proof
  from Wizards.
- Organized-play locators: Lorcana Play Network inspected/captured. It confirms
  Card Addiction as an Anaheim physical store with organized-play/retail
  capability. This supports store legitimacy and event-hosting capability, not
  MTG event facts.
- Direct review surfaces: Yelp inspected/captured. It confirms a claimed hobby
  shop/tabletop-games profile, the Anaheim address, current-looking hours, many
  reviews, and review text mentioning Magic/TCG/player-hangout signals. It also
  contains service/pricing cautions.
- Secondary review/directory surfaces: Loc8NearMe and Card Shop Hub
  inspected/captured. They support active TCG-shop identity, hours, Google
  review aggregate texture, play-space/tournament mentions, and current-looking
  customer traffic. Treat as secondary, not event-truth.

## Card Addiction synthesis

Card Addiction should be added as a real Anaheim TCG store and useful landscape
candidate. The evidence supports:

- physical-store legitimacy;
- current-looking operation;
- TCG-first inventory/activity;
- Magic being part of the store's customer/review vocabulary;
- likely play space and tournament/event capability;
- useful review texture about staff, community, play space, parking, pricing,
  and service variability.

The evidence does not yet support adding MTG event rows. No current
store-controlled, Wizards/EventLink, Discord, or event-platform MTG schedule was
found in this bounded pass.

Recommended event classification: `event TBD`, not `write now`.

Recommended Places classification: reviewed/partial candidate, neutral, around
C+/medium confidence. It may be useful because it is reasonably close and
appears real/active, but it should not outrank stronger Commander/calendar
venues until current Magic scheduling and community texture are confirmed.

## Why it was missing

Root cause: discovery bias toward Wizards/EventLink and packet-derived
candidates.

Card Addiction appears to be a real TCG store, but it did not surface in the
data paths that created the current app baseline:

- it was not present in the local JSON or live Supabase dataset;
- it was not in the accepted ChatGPT packet/tracker intake;
- it does not appear to have a current WPN/EventLink result under obvious store
  searches;
- prior research heavily prioritized WPN/EventLink, store-event calendars,
  Discord/community surfaces, and ChatGPT packet candidates.

The corrected lesson is that a landscape-confidence pass also needs a light
non-WPN local-store sweep using review directories, Google/Yelp surfaces,
non-MTG organized-play locators, and ordinary web search. Those sources should
not create event rows by themselves, but they can reveal real stores that the
WPN/EventLink-first pipeline misses.

## 25-mile missed-store sweep notes

This was a bounded sweep, not a full regional census. The goal was to identify
obvious nearby omissions that should not stay only in chat memory.

### Strong add now

- Card Addiction — Anaheim. Add now as a real TCG store with evidence and a
  conservative assessment. Applied to Supabase through
  `supabase/proposals/card-addiction-main-pass-2026-07-21.json`. Event coverage
  remains TBD.

### Candidate/TBD, not add in this pass

These appeared in nearby directory/search surfaces but need their own bounded
pass before being added as real planning candidates:

- Topspot Cards — Anaheim. Card Shop Hub lists it as another Anaheim TCG shop.
  Needs official/review/event-source replay.
- Divine Lining LLC — Anaheim. Card Shop Hub lists it as another Anaheim TCG
  shop. Needs identity and relevance replay.
- Do-We Collectibles — Anaheim area search candidate. Needs confirmation of TCG
  relevance, physical-store status, and Magic usefulness.
- The OC Dugout — Anaheim area search candidate. Likely sports-card leaning;
  needs TCG/Magic relevance check before app inclusion.
- Three J's Sportscards — Anaheim area search candidate. Likely sports-card
  leaning; needs TCG/Magic relevance check before app inclusion.
- Brookhurst Hobbies — Garden Grove/Anaheim area hobby candidate. Needs modern
  TCG/Magic relevance check before app inclusion.
- AKH Trading Card Co — Orange County TCG/search candidate. Needs location,
  physical-store, and Magic relevance replay.
- Sugoi Stuff / Sugoi Stuff! Hobbies and Collectibles — Orange County hobby/TCG
  search candidate. Needs physical-store and Magic relevance replay.

### Immediate no-write approach

Do not add the candidate/TBD list as venues until a focused pass confirms they
are physical and relevant to Magic/TCG planning. Store them as missed-store
sweep candidates in this note so the next landscape-confidence pass can work
from a durable list instead of rediscovering them.
