# GXGAMERS / Otaku Vault / LVLUP event completion pass

Date: 2026-07-18  
Pass type: event-focused main-store correction pass  
Validation level proposed: standard, because event-series rows are proposed.

## Scope

- GXGAMERS
- Otaku Vault
- LVLUP GAMING TCG

## Summary

The corrected Wizards/EventLink crawler was used for a fresh 2026-07-18 through
2026-09-30 pull. All three stores still have current Magic activity. Existing
Supabase rows already covered each store's routine Commander anchor, but the
fresh pull exposed several missing current/non-past events that should appear in
the calendar.

## Findings by store

### GXGAMERS

Event recommendation: write now.

Already covered:

- Monday 7:00 PM Commander
- Thursday 7:00 PM Commander
- Saturday 7:00 PM Commander

Missing from calendar:

- Wednesday 7:00 PM Standard Showdown, recurring, $10.
- Friday August 7, 2026 6:00 PM The Hobbit prerelease, $45.

Assessment implication: GX has broader Magic coverage than the old Commander-only
event set implied, but the personal-fit caution remains because both Commander
and Standard rows are structured, paid, prize-supported, and the Commander text
still includes no-proxy language.

Coverage line:

- Official site: checked / existing Magic category evidence.
- Instagram: routed through Linktree / content replay TBD.
- Facebook/X: routed through Linktree / content replay TBD.
- Discord/community route: Linktree exposes Discord / route should be captured
  as evidence if not already present; content replay TBD.
- Wizards/EventLink: fresh pull inspected / event writes proposed.
- Reviews: Loc8NearMe existing evidence remains useful for store quality and
  community texture.
- Other locators: existing non-MTG organized-play evidence supports event
  capability.

### Otaku Vault

Event recommendation: write now.

Already covered:

- Friday 6:00 PM Friday Night Magic Commander.

Missing from calendar:

- Friday August 7, 2026 1:30 PM The Hobbit prerelease, $35.
- Friday August 7, 2026 7:00 PM The Hobbit prerelease, $35.
- Friday August 21, 2026 7:00 PM The Hobbit Commander Party, $10.
- Friday August 28, 2026 7:00 PM Two-Headed Giant Commander, $5.

Assessment implication: Otaku is more Magic-relevant than a single Friday
Commander row suggests. The special-event schedule improves event confidence,
but community texture still needs Discord/Instagram content replay before
promoting it as a personal fit.

Coverage line:

- Official site: checked / already captured; also exposes Discord and Instagram
  routes.
- Instagram: route visible / content replay TBD.
- Discord/community route: route visible / capture if not already present;
  content replay TBD.
- Wizards/EventLink: fresh pull inspected / event writes proposed.
- Reviews: sparse existing review evidence remains insufficient for solo-arrival
  fit.
- Marketplace: TCGplayer/Whatnot already captured as commerce/community-scale
  support, not event proof.

### LVLUP GAMING TCG

Event recommendation: write now, with caution.

Already covered:

- Tuesday 7:30 PM Commander.
- Friday 7:00 PM Commander.

Missing from calendar:

- Friday August 7, 2026 7:30 PM The Hobbit prerelease, $35.
- Friday August 14, 2026 7:30 PM An Unexpected Crafting Party, free.
- Tuesday August 18, 2026 7:30 PM Two-Headed Giant Commander The Hobbit, $25.
- Tuesday August 25, 2026 7:30 PM The Hobbit Commander Party, $10.
- Tuesday September 8, 2026 7:30 PM Magic Presents: Heart of the Mountain, $10.

Assessment implication: LVLUP has stronger special-event/current-Magic coverage
than the older reliability-cautioned note implied, but the prior same-day
reliability warning should remain. Special events should be visible; a first
visit still needs current confirmation.

Coverage line:

- Official site: checked previously; no stronger current schedule route found
  in this quick pass.
- Instagram: route visible from source mirrors / content replay TBD.
- Discord/community route: not found in this bounded pass.
- Wizards/EventLink: fresh pull inspected / event writes proposed.
- Reviews: Card Shop Finder and Yelp-derived mirrors already captured; positive
  community-space signals conflict with the prior reliability caution.
- Other locators: existing Flesh and Blood/Yu-Gi-Oh evidence supports physical
  operation and event capability.

## Proposal

Prepared and applied proposal:

- `supabase/proposals/gx-otaku-lvlup-event-completion-2026-07-18.json`

The proposal was applied to live Supabase on 2026-07-18. No canonical JSON, app
code, schema/auth/RLS, or personal preference data was changed.

## Post-write verification

Standard validation completed:

- Proposal validation passed before write.
- Live Supabase write applied through the controlled workflow.
- 11 new event rows verified:
  - GXGAMERS Wednesday Standard Showdown
  - GXGAMERS The Hobbit prerelease
  - Otaku Vault two The Hobbit prerelease times
  - Otaku Vault The Hobbit Commander Party
  - Otaku Vault Two-Headed Giant Commander
  - LVLUP The Hobbit prerelease
  - LVLUP An Unexpected Crafting Party
  - LVLUP Two-Headed Giant Commander The Hobbit
  - LVLUP The Hobbit Commander Party
  - LVLUP Magic Presents: Heart of the Mountain
- All 11 new event rows have WPN event-source provenance.
- GXGAMERS and Otaku Vault community-route evidence verified as route-captured
  / content-replay TBD.
- WPN source freshness verified for GXGAMERS, Otaku Vault, and LVLUP.
- Relevant duplicate active event-series check for the three venues returned no
  duplicate rows.
- Local/browser preview was not run because Supabase record verification was
  the lower-overhead validation path for this routine event write.

## Deferred

- Discord/content replay for GX and Otaku.
- Instagram content replay for all three.
- Same-day reliability confirmation for LVLUP before treating it as a low-risk
  personal visit.
