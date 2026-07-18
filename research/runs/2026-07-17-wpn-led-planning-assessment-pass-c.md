# WPN-led planning assessment pass C

Date checked: 2026-07-17

Steward: Codex Project Steward

Scope:

- Hobby Overflow
- Joyful Toad TCG
- Honey Pot Meadery
- Requiem: Coffee, Tea, and Fantasy
- SoCalMagic

Mode: direct steward pass; no workers/subagents; no canonical JSON edits; no
live Supabase write during research.

## Summary

These five venues already have active event rows and reviewed venue notes in
Supabase, but they do not yet have Places-page evaluation rows. This pass should
therefore be treated as assessment/evidence fill-in, not event ingestion.

No new event rows are recommended from this pass. Existing rows already cover
the current event implications:

- Hobby Overflow: casual Commander listing from Wizards/EventLink.
- Joyful Toad TCG: Commander Night listing from Wizards/EventLink.
- Honey Pot Meadery: Wednesday casual Commander plus league/special/prerelease
  records already ingested.
- Requiem: Commander Mondays already listed.
- SoCalMagic: multiple Commander all-day / No proxy listings already listed.

## Hobby Overflow

Sources reviewed:

- Official website: https://hobbyoverflow.com/
- KeepUp review/directory mirror:
  https://www.keepupcards.com/shop/hobby-overflow-cypress-ca
- Existing Wizards/EventLink row in Supabase.

Finding:

Hobby Overflow remains one of the most practically relevant nearby leads. The
official site confirms a Cypress TCG store with regular tournaments, leagues,
community events, MTG category routing, long evening hours, and DM/social
routing. KeepUp gives unusually strong family/new-player/community language,
though the specific review examples are more Pokemon/Lorcana/general-TCG than
Commander-specific.

Event write recommendation: no new event rows.

Assessment recommendation: add evaluation row and attach KeepUp as review/fit
evidence.

Fit/confidence direction: B / 3.8 / high. The place is close, active, and
friendly-looking, but Commander culture still needs a Discord/social check.

Planning impact: Hobby Overflow should be a serious nearby candidate to keep in
the try/watch set, not merely a raw Wizards listing.

TBD: bounded Discord/social check focused on whether casual Commander is a real
social lane and whether solo arrivals can find pods.

## Joyful Toad TCG

Sources reviewed:

- Official site: https://joyfultoadtcg.com/
- Trading Card Database profile:
  https://www.tcdb.com/CardShops.cfm?MODE=VIEW&ShopID=2625
- KeepUp review/directory mirror:
  https://www.keepupcards.com/shop/joyful-toad-tcg-anaheim-ca
- Existing Wizards/EventLink row in Supabase.

Finding:

Joyful Toad is clearly active and has official store infrastructure: a site,
Magic singles, store hours, Facebook, Instagram, Discord, Twitch, and a current
Anaheim address. KeepUp adds spacious-store and friendly-staff signals. The
weakness is still Commander-specific corroboration: public evidence supports a
good TCG store, but does not yet prove the Commander night is socially rich or
solo-arrival friendly.

Event write recommendation: no new event rows.

Assessment recommendation: add evaluation row and attach official/TCDB/KeepUp
evidence.

Fit/confidence direction: C+ / 3.2 / medium. Real store, plausible Commander
anchor, but not yet enough Commander/social texture to promote.

Planning impact: keep visible, but do not prioritize over stronger nearby
Commander/community reads until Discord or social evidence improves.

TBD: check public Discord/social surfaces for Commander turnout and LFG.

## Honey Pot Meadery

Sources reviewed:

- Existing Honey Pot event/source records in Supabase.
- Official Honey Pot Wednesday Commander source already captured in
  `src-honeypot-wednesday-commander-2026-07-17`.
- Existing league/special/prerelease event rows in Supabase.

Finding:

Honey Pot is one of the clearest non-store opportunity leads. The key assessment
point is that it is not just a generic venue with one Magic listing: the current
data already contains weekly casual Commander language plus league/special
records. The open-play wording is unusually good for the user's solo-arrival
goals: drop-in, meet the community, relaxed multiplayer Commander, newer and
returning players welcome, and loaner supplies.

Event write recommendation: no new event rows.

Assessment recommendation: add evaluation row. No new source needed in this
pass because the strongest source is already in Supabase.

Fit/confidence direction: B+ / 4.1 / high. It is a strong practical lead even
though actual turnout/community feel remains unvisited.

Planning impact: Honey Pot should be near the top of non-store/social options
because it directly answers several solo-arrival concerns that most stores leave
unstated.

TBD: actual turnout, whether league nights distort the casual-open-play vibe,
and whether regulars are as welcoming in practice as the event copy suggests.

## Requiem: Coffee, Tea, and Fantasy

Sources reviewed:

- Official weekly events page: https://www.requiemcafe.com/weeklyevents
- Corner profile:
  https://www.corner.inc/place/prMcHbA8dPV3?listId=352915de-ccdb-460a-b718-da83a5d642b0
- Wizard Gaming Society Meetup:
  https://www.meetup.com/wizard-gaming-society/
- Existing Wizards/EventLink row in Supabase.

Finding:

Requiem is a real Magic/fandom venue, but not a clean LGS-style Commander
surface. The official weekly page confirms Magic the Gathering tournaments and
says weekly events can change around collaborations and special events. Requiem
has a strong social/fantasy-cafe environment, LGBTQ+/inclusive/community
signals, and broader board-game/community activity. The main caveat is
operational reliability: collaborations, reservations, crowding, and venue
events may matter more here than at a normal store.

Event write recommendation: no new event rows.

Assessment recommendation: add evaluation row and attach weekly-events,
Corner, and Meetup/community evidence.

Fit/confidence direction: B- / 3.6 / medium. High social-space potential, but
Commander-specific turnout and pod formation need confirmation.

Planning impact: worth watching as a social/fandom venue and possible lower
pressure outing, but check current socials before relying on a given Monday.

TBD: actual Commander turnout, pod formation, whether special collaborations
displace routine Magic, and whether reservations/crowding affect solo arrival.

## SoCalMagic

Sources reviewed:

- Loc8NearMe review/directory mirror:
  https://www.loc8nearme.com/california/orange/socal-magic/7352712/
- Existing Facebook / Google / Wizards records in Supabase.
- Existing Wizards/EventLink rows with repeated `Commander all day / No proxy`
  language.

Finding:

SoCalMagic is a real, Magic-dedicated store with strong community/inventory
signals. Review mirrors describe friendly owners, Magic focus, events, drafts,
competitive Commander, and a mom-and-pop atmosphere. However, the existing event
language repeatedly says `No proxy`. For this user, if that signal is stable,
it is not a minor caution; it is essentially disqualifying for personal
Commander fit. The correct model is: real store, possibly strong Magic
community, probably poor Kavi fit unless the no-proxy context is narrower or
mitigated.

Event write recommendation: no new event rows.

Assessment recommendation: add evaluation row and attach Loc8NearMe as
review/fit evidence; update assessment notes to make the no-proxy exclusion
plain.

Fit/confidence direction: C / 2.7 / high. Confidence is high because the store
read is clear; fit is low because the stable no-proxy signal is probably a hard
personal mismatch.

Planning impact: keep cataloged, but deprioritize for personal use unless a
future source shows proxy-friendly casual tables or the user decides no-proxy is
acceptable.

TBD: verify whether `No proxy` applies to all Commander play or only the
Wizards-listed all-day events; check Facebook for any mitigating casual-table
language.

## Proposed ingest

Prepare a controlled Supabase proposal that:

- adds a small number of materially useful source/evidence rows;
- adds one evaluation row for each of the five venues;
- updates venue notes/verification where the pass materially refined the read;
- adds one research-change marker;
- does not add event rows;
- does not change schema, auth, RLS, app code, or canonical JSON manually.

