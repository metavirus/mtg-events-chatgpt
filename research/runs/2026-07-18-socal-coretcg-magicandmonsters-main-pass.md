# SoCalMagic / CoreTCG / Magic and Monsters main pass

Date checked: 2026-07-18

Steward: Codex Project Steward

Pass type: main store pass, bounded 3-store tranche

Validation level proposed for write: lean. This proposal is source, Evidence,
and Places-assessment only; no event rows, schema, app code, auth, RLS, or
canonical JSON changes are proposed.

## Summary

This tranche did not surface a clean new event-series write. It did surface
material source-coverage and assessment corrections:

- SoCalMagic remains a real Magic-dedicated store with strong activity signals,
  but the repeated `Commander all day / No proxy` event language remains
  decision-changing for Kavi and should keep the venue deprioritized for
  personal Commander unless later evidence narrows or mitigates the rule.
- CoreTCG's official Linktree and Instagram schedule post should be captured as
  visible Evidence. The April 16, 2026 schedule graphic supports Friday Magic at
  4:30 PM and says the April schedule otherwise stayed the same. The Discord
  route is real and large, but content was not inspected because accepting the
  invite would join a third-party server from the user's account.
- Magic and Monsters has stronger source routing than its Places page currently
  shows: official Linktree, Discord invite, Instagram schedule/highlight
  evidence, official calendar, and review surfaces. Its official calendar is
  current but currently shows no MTG entries in the July visible page/month
  slice, while Instagram indicates Monday `YGO-MTG` and Friday `FNM`; the
  existing Wizards/EventLink Commander Free Play row should remain represented
  for now, with the cross-source mismatch recorded as an event TBD rather than
  converted into a deletion.

## SoCalMagic

### Sources reviewed

- Existing Supabase venue, evaluation, source, and event rows.
- Wizards/EventLink-derived existing event rows with repeated `Commander all day
  / No proxy` language.
- Facebook page visible slice: confirms a real but low-follower Facebook
  surface and an older tournament-oriented post; no mitigating no-proxy language
  found in the bounded visible read.
- MapQuest / Yelp-derived listing:
  `https://www.mapquest.com/us/california/socal-magic-303837307`

### Source coverage

- Official site: not found as a strong current official surface; MapQuest points
  to `socalmagicstore.com`, but this pass did not establish it as a usable
  current route.
- Instagram: no useful official route found in this bounded pass.
- Facebook: inspected; already captured; older / limited visible value; no
  no-proxy mitigation found.
- Discord/community route: not found.
- Wizards/EventLink: already captured; supports multiple `Commander all day /
  No proxy` active rows.
- Reviews: checked; MapQuest/Yelp-derived source supports friendly LGS and
  Magic-specialist identity while also including a direct Commander house-rule
  caution.
- Other useful sources: TCGList found but not material enough for this write.

### Event implications

Event classification: no new write.

Existing Supabase Commander rows already cover the current event implication.
The important event conclusion is not missing calendar volume; it is that the
known current Commander listings continue to carry a strong no-proxy caution.

### Places implications

Assessment remains broadly correct: SoCalMagic is real and Magic-dedicated but
probably a poor personal Commander fit if the no-proxy rule is universal. Direct
Yelp-derived evidence should be captured because it supports both sides of the
read: friendly owner/store/inventory positives and Commander house-rule
concerns.

Planning impact: keep cataloged, but do not prioritize for personal use unless
future evidence narrows or reverses the no-proxy rule.

## CoreTCG

### Sources reviewed

- Existing Supabase venue, evaluation, source, and event rows.
- Official site: `https://coretcg.com/`
- Official Linktree: `https://linktr.ee/coretcg`
- Official Instagram schedule post:
  `https://www.instagram.com/p/DXMuJsxke25/`
- Discord invite route: `https://discord.gg/coretcg`
- Existing review evidence already captured through MapQuest / Yelp-derived
  and BBB sources.

### Source coverage

- Official site: inspected; already captured; supports active Pasadena retail
  identity, address, hours, Magic product depth, Events/Facebook routing, and
  Discord routing.
- Instagram: inspected; proposed capture. April 16, 2026 schedule post shows
  weekly tournaments and Friday Magic at 4:30 PM; caption says only One Piece
  time changed and everything else stayed the same.
- Facebook: checked through existing official events route; no additional event
  extraction in this bounded pass.
- Discord/community route: route found / not inspected. Invite page confirms
  `Core TCG Server`, 14,447 members, and 2,601 online at time of check. Content
  was not inspected because accepting the invite would join the user's account
  to a third-party server.
- Wizards/EventLink: already captured; supports existing Friday Commander row.
- Reviews: already captured through prior MapQuest / Yelp-derived and BBB
  evidence.
- Other useful sources: Linktree proposed capture as the official source router.

### Event implications

Event classification: no new write.

The Instagram schedule graphic corroborates Friday Magic at 4:30 PM, which
matches the existing Friday 4:30 PM CoreTCG Commander event row closely enough
to avoid a duplicate write. No draft, prerelease/sealed, or MTG special event
was surfaced in the bounded current pass.

### Places implications

CoreTCG remains an infrastructure-heavy Magic/TCG store rather than a proven
comfortable casual Commander fit. The pass improves confidence that the Friday
Magic anchor and Discord route are real, but the Discord content itself remains
uninspected, so casual/LFG/solo-arrival texture is still open.

Planning impact: useful to keep in the broader event map, but probably not a
first personal target unless the user wants a larger/tournament-oriented store
or later Discord content shows casual LFG usefulness.

## Magic and Monsters

### Sources reviewed

- Existing Supabase venue, source, and event rows.
- Official site and official events page:
  `https://www.magicandmonsters.com/`
  `https://www.magicandmonsters.com/pages/events`
- Official Instagram profile:
  `https://www.instagram.com/magicandmonstersshop/`
- Official Linktree: `https://linktr.ee/magicandmonsters`
- Discord invite route: `https://discord.gg/t2uQByUBZ7`
- Yahoo / Yelp-derived review listing:
  `https://local.yahoo.com/info-94182464-magic-and-monsters-mission-viejo/`
- CardShows / Google-derived listing:
  `https://cardshows.io/shops/magic-monsters-mission-viejo`

### Source coverage

- Official site: inspected; already captured; active storefront with MTG singles
  and sealed product.
- Instagram: inspected; already captured but should be refreshed. Profile text
  says Monday `YGO-MTG`, Friday `FNM`, Saturday `TCGs`, and daily open play.
  Recent grid/highlight alt text includes a weekly schedule graphic and a Marvel
  Super Heroes prerelease/preorder post from June 2026.
- Facebook: route checked through official site/Linktree; already captured; no
  deeper content replay in this bounded pass.
- Discord/community route: route found / not inspected. Linktree exposes
  `Join Our Community Discord`; invite page confirms `Magic & Monsters`, 944
  members, and 129 online. Content was not inspected because accepting the
  invite would join a third-party Discord server from the user's account.
- Wizards/EventLink: already captured; supports existing Friday Commander Free
  Play row.
- Reviews: checked; Yahoo/Yelp-derived listing and CardShows/Google-derived
  listing support active store, strong TCG identity, review scale, and generally
  positive staff/community signals, with some pricing/trade-in cautions.
- Other useful sources: Linktree proposed capture as official source router.

### Event implications

Event classification: event TBD / no new write.

Current official calendar is live and readable. The July 2026 month grid and
the July 18-24 list show Pokemon, Yu-Gi-Oh!, Vendetta, and Star Wars events,
but no MTG/Commander entries in the visible current slice. That conflicts with
the existing Wizards/EventLink Friday Commander Free Play row and Instagram's
Friday `FNM` / Monday `YGO-MTG` signal.

Do not delete or replace the existing Commander row from this pass. The safest
read is: WPN and Instagram still support Magic play, while the official calendar
needs a targeted MTG event replay before we rely on it as complete. No new
event row is recommended until that targeted replay resolves whether Friday FNM
is Commander, broader MTG free play, or a stale/omitted calendar item.

### Places implications

Magic and Monsters deserves a visible Places evaluation row. It is farther away
than the closest stores but has a strong TCG storefront, active source routing,
large review footprint, public Discord route, and several sources indicating a
welcoming social/play environment. The main caution is schedule reconciliation:
the official calendar currently emphasizes non-MTG events while social/WPN
sources still support MTG.

Planning impact: keep watching as a plausible candidate, especially for a
planned visit or event-specific trip, but do not treat Friday Commander/FNM as
fully reconciled until one targeted event replay closes the calendar mismatch.

## Proposed Supabase write

Prepare proposal
`supabase/proposals/socal-coretcg-magicandmonsters-main-pass-2026-07-18.json`.

The proposal should:

- add direct SoCalMagic MapQuest/Yelp-derived review Evidence;
- add CoreTCG Linktree, Instagram schedule, and Discord-route Evidence;
- add Magic and Monsters Linktree, Discord-route, Yahoo/Yelp-derived review,
  and CardShows/Google-derived Evidence;
- refresh existing source check dates where inspected;
- add the missing Magic and Monsters evaluation row;
- update targeted venue/evaluation notes for the three stores;
- insert one proposed research-change marker;
- not add or change event rows.

## Remaining TBDs

- SoCalMagic: if the user ever wants to reconsider it, verify whether `No proxy`
  applies to all casual Commander or only specific formal/listed events.
- CoreTCG: accepting/joining Discord would be required for real content replay;
  until then classify Discord as `route found / not inspected`, not as
  fit-supporting content.
- Magic and Monsters: targeted MTG event replay needed to reconcile official
  calendar absence against WPN Friday Commander and Instagram Friday FNM/Monday
  YGO-MTG signals.
