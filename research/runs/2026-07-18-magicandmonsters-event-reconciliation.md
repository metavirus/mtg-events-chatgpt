# Magic and Monsters targeted event reconciliation

Date checked: 2026-07-18

Steward: Codex Project Steward

Pass type: targeted event reconciliation

Validation level proposed for write: standard. This proposal changes one
calendar-visible event-series row and refreshes source/evidence/assessment
interpretation for the affected venue.

## Research question

Resolve whether the existing `Commander Free Play` row for Magic and Monsters
should stay as Friday 6 PM, move, or become a named uncertainty.

## Sources inspected

- Existing Supabase venue, source, evaluation, event-series, event-source, and
  event-occurrence state.
- Official events page:
  `https://www.magicandmonsters.com/pages/events`
- Official Instagram profile:
  `https://www.instagram.com/magicandmonstersshop/`
- Official Linktree:
  `https://linktr.ee/magicandmonsters`
- Store Discord invite supplied from Instagram / user:
  `https://discord.gg/PQZCKPhhg`
- Magic and Monsters Discord:
  - `#shop-schedule`
  - `#mtg-schedule`
- CardCommunity / EventLink mirror:
  `https://cardcommunity.org/event/cab1ccd5-5d4a-413c-9d76-a1e0e5a09bb0`
- Wizards Store & Event Locator store page:
  `https://locator.wizards.com/store/7807`

## Source coverage

- Official site: already captured; active TCG storefront with MTG singles and
  sealed product.
- Official calendar: inspected. Ten future pages from July 18 into September
  2026 showed Pokemon, Yu-Gi-Oh!, Star Wars, Vendetta, and empty future pages,
  but no MTG, Commander, FNM, draft, or prerelease listing in the visible
  official calendar feed.
- Instagram: inspected. Profile still says Monday `YGO-MTG`, Friday `FNM`, and
  Saturday `TCGs`; the profile links to the store website and Discord. This is
  useful source routing and broad Magic signal, but not enough by itself to
  classify Friday as current Commander.
- Discord/community route: inspected after the user confirmed they had joined
  and approved read-only review. The invite is current and resolves to Magic &
  Monsters with roughly 944 members and 136 online at check time. The server is
  organized by game, with `#shop-schedule`, `#mtg-schedule`, and other schedule
  channels.
- Discord `#shop-schedule`: inspected. A May 31, 2026 summer schedule post says
  Magic: The Gathering is no longer on the regular weekly schedule, but the
  store still hosts MTG players daily through its play space and invites players
  to drop in anytime to play Commander. The same post says prerelease,
  promotional, and cEDH events may still appear as non-regular events.
- Discord `#mtg-schedule`: inspected. The visible pinned/old MTG schedule from
  July 23, 2024 lists Monday Standard, Tuesday/Wednesday free play, Thursday
  draft, Friday FNM with Standard/Commander/1v1 Duel Commander/free play,
  Saturday free play, and Sunday free play. This is useful history, but it is
  superseded by the newer May 31, 2026 shop schedule for current planning.
- Wizards/EventLink: direct page remains JavaScript-only through simple web
  open, but the current CardCommunity mirror of Wizards/EventLink shows
  `Commander Free Play` at Magic and Monsters on Saturday, July 25, 2026 at
  6 PM, with prior July 4 and July 11 Commander Free Play occurrences.
- Reviews / marketplace: not revisited; not needed for this targeted event
  reconciliation.

## Findings

The existing Supabase row was:

- ID: `magic-and-monsters-commander-free-play-5-18-00`
- Title: `Commander Free Play`
- Recurrence: weekly Friday at 6 PM
- Status: active
- Confidence: medium
- Last verified: 2026-07-14

The fresh evidence does not support Friday 6 PM Commander as the right current
planning row.

The stronger current evidence is mixed:

- EventLink/CardCommunity supports current Saturday 6 PM `Commander Free Play`
  occurrences.
- Discord says Magic is no longer on the regular weekly schedule, but daily
  drop-in Commander/open-play support remains available through the play space.
- The official events page does not list MTG/Commander in the checked future
  pages.
- Instagram continues to advertise Friday `FNM` at the profile/highlight level,
  but does not resolve whether Friday currently means Commander, Standard,
  generic Magic free play, or stale schedule shorthand.

## Event recommendation

Event classification: write now, with caveat.

Retire the existing Commander row from the active calendar rather than creating
or moving a duplicate:

- set the current `Commander Free Play` row to inactive so it no longer
  projects into the calendar;
- keep the row as historical/source context rather than deleting it;
- update details to explain that newer Discord schedule text says MTG is no
  longer on the regular weekly schedule and Commander is available as daily
  drop-in play space;
- preserve the EventLink/CardCommunity Saturday signal as evidence, but not as
  enough to create a reliable weekly planning anchor because it conflicts with
  the store-controlled Discord schedule and the official calendar;
- link CardCommunity/EventLink mirror, official calendar, Discord, and Instagram
  as event/provenance sources with careful relationships.

Do not create a Friday FNM row yet. Friday FNM remains event TBD because
Instagram says Friday `FNM`, but the newer Discord schedule and official
calendar do not confirm a current Friday MTG event suitable for the calendar.

Do not create a fake daily Commander recurrence. The app currently projects
weekly event-series rows; daily drop-in play space is real planning context but
needs either a different event model or future product handling before it should
generate every calendar day.

## Places assessment recommendation

Magic and Monsters should move down as a personal planning candidate. The
Discord discovery improves our evidence confidence, but the content itself is
negative for fit: the store explicitly moved Magic off the regular weekly
schedule.

The assessment should improve in one respect: Discord is no longer merely
`route found / not inspected`. It is an inspected, useful source showing a
large organized server and clear store communication.

The assessment should become more cautious in another respect: Magic's current
regular schedule is materially weaker than the older Places note implied. The
best current read is that MTG is supported through daily drop-in Commander/open
play and occasional special events, while regular structured MTG events are not
currently part of the store's summer schedule and are not represented on the
official calendar.

## Proposed Supabase write

Prepare proposal:

- `supabase/proposals/magicandmonsters-event-reconciliation-2026-07-18.json`

The proposal should:

- add/update the Magic and Monsters Discord source URL to the currently supplied
  invite;
- add a CardCommunity/EventLink mirror source for Saturday Commander Free Play;
- mark the existing `Commander Free Play` event-series row inactive with
  caveated details, removing it from the active calendar without deleting the
  history;
- link relevant sources to the event row;
- update venue assessment notes and evaluation positives/cautions/open questions;
- insert one proposed research-change marker;
- not add event-occurrence rows;
- not edit canonical JSON, app code, schema, auth, or RLS.

## Applied checkpoint

Status: applied to Supabase after user approval on 2026-07-18.

Validation level used: standard. No local/hosted app preview and no full JSON
export were run, per the current graduated-overhead rule for routine event-row
corrections.

Writes performed:

- Updated Magic and Monsters Discord Evidence from route-only to inspected
  Discord server route using the current invite `https://discord.gg/PQZCKPhhg`.
- Added CardCommunity / EventLink mirror source for the Commander Free Play
  signal.
- Linked Discord, CardCommunity/EventLink, official events page, and Instagram
  as event-source provenance for the retired Commander row.
- Marked `magic-and-monsters-commander-free-play-5-18-00` inactive so it no
  longer projects into the active calendar.
- Updated Magic and Monsters Places synthesis and evaluation to C+ / 3.1 /
  medium confidence, with explicit caution that moving MTG off the regular
  schedule is a negative personal-fit signal.
- Inserted accepted research-change marker
  `magicandmonsters-event-reconciliation-2026-07-18`.

Post-write verification:

- The Commander Free Play event-series row exists and is now `inactive`.
- Magic and Monsters has 1 total event series and 0 active event series.
- Magic and Monsters evaluation is now C+ / 3.1 / medium confidence.
- Venue assessment notes explicitly say MTG is no longer on the regular weekly
  schedule and that this lowers personal fit.
- Discord venue Evidence is present and marked inspected.
- Event-source links are present for CardCommunity/EventLink, Discord, official
  calendar, Instagram, and the existing Wizards source.
- Duplicate event-occurrence check returned 0 rows.
- Research-change marker is `accepted`.

## Remaining TBDs

- Friday FNM: needs a current source-confirmed answer before being written.
- Daily drop-in Commander: real support signal, but not cleanly representable as
  a projected calendar series in the current app model.
- Discord deeper replay: useful later for actual turnout, solo-arrival texture,
  proxy norms, and LFG behavior, but not required to correct the existing
  calendar row.
