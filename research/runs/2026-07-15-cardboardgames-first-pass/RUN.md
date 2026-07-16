# Research Run: Cardboard Games Main Pass

## Run metadata

- Run ID: `2026-07-15-cardboardgames-first-pass`
- Started: 2026-07-15 14:35:00 -07:00
- Completed: 2026-07-15 15:30:00 -07:00
- Researcher/agent: Codex

## Objective

Complete the promoted main pass for Cardboard Games, repair the earlier
normalization miss, and determine whether the store's public surfaces support
Magic / Commander as a central live offering or as one meaningful lane among
several active game lines.

## Sources reviewed

- Cardboard Games official homepage
- Cardboard Games official events page / calendar
- local Wizards snapshot for organization `17086`
- official Instagram profile and bounded recent-post sample
- official Facebook page accessibility check
- bounded Discord discovery search and prior Discord discovery ledger
- recent Orange County community discussions and light business corroboration

## Key findings

- The official site is strong and store-controlled, which makes this a
  better-quality source case than a bare Wizards shell.
- The homepage positions the store with explicit `Community First` language and
  directly names Magic: The Gathering among the store's supported TCG lines.
- The events page is robust and current, with a real calendar and event detail
  pages. In the visible current slice, however, the calendar is dominated by
  non-MTG promotion, especially Riftbound and Pokemon.
- Magic is clearly present on the official calendar through repeated sealed
  prereleases and other specials. In the visible historical slice, the store ran
  `Magic: The Gathering - Marvel Super Heroes` prerelease Sealed events on June
  20 and June 21, 2026. The forward-looking slice also includes upcoming
  `Magic: The Gathering - The Hobbit` prerelease Sealed events on August 8 and
  August 9, 2026. The current calendar also miscategorizes some Pokemon entries
  as Magic, so its taxonomy is not clean enough to normalize mechanically.
- The local Wizards snapshot provides two meaningful routine anchors:
  - `CBG Commander Night`, Fridays at 7 PM, free play, capacity 32, with promos
    and raffles;
  - `CBG Marvel Superheroes Draft`, Mondays at 7 PM, $20, capacity 32, with
    pack-per-win prizing and placement promos.
- In the currently visible official-site slice, the standing Commander night was
  not as directly surfaced as the specialty-event calendar entries.
- The official Instagram profile is branch-specific and current enough to verify
  store identity, but its bounded recent sample is low-frequency and emphasizes
  Lorcana and Riftbound rather than routine Magic. It is a secondary
  corroboration surface, not the primary Commander schedule source.
- No official Discord route surfaced from the site, Instagram, Facebook, prior
  Discord discovery, or bounded search.
- Recent community discussions recommend Cardboard Games to new or
  group-seeking players in Tustin. This is encouraging anecdotal evidence, not
  proof of Friday pod formation or Commander culture.

## Reconciliation decisions

- Cardboard Games should be promoted from discovery status into a real partial
  record because the official site and calendar are strong first-pass sources.
- The store appears operationally serious and community-minded, but the current
  public event emphasis suggests Magic may be one important lane rather than the
  dominant promotional focus.
- Preserve both truths at once:
  - Magic is definitely real here, including Commander and prerelease activity
  - visible current site promotion gives more attention to other game lines than
    to a standing Commander identity
- Wizards remains the authoritative routine Commander source; the official
  calendar is stronger for specials and prereleases.
- Instagram is classified as secondary corroboration. Discord remains no-result.
- Personal-fit read: promising enough to retain as a meaningful OC option,
  especially for free Friday Commander and limited events, but not yet proven as
  a strong solo-arrival or pre-coordination venue.

## Data changes

- Moved the Cardboard assessment from the wrong Tweedy record onto
  `cardboard-games` and restored Tweedy to cautious discovery status.
- Added official site, calendar, Instagram, phone, and community sources to the
  Cardboard record.
- Added the repeated Monday $20 Marvel Superheroes booster draft as a normalized
  recurring limited event.
- Added the upcoming August 8 and August 9 Hobbit prerelease Sealed events as
  normalized one-off active events from the official calendar.
- Tightened the Cardboard analytical note so both the historical Marvel Super
  Heroes prerelease signal and the future Hobbit prerelease signal are explicit.
- Restored unrelated fields changed by the suspect Aki/A&N checkpoint on JJ's,
  Buddies, Grails, The Game Chest - Del Amo, and Card Arena.
- Moved the Shuffle and Cut assessment from Shadow Realm onto the intended
  Shuffle and Cut record and restored Shadow Realm to discovery status.

## Remaining unresolveds

- Determine whether the Friday Commander night is socially strong in practice or
  mainly a listed recurring slot.
- Determine pod formation, power expectations, proxy policy, and whether any
  off-site community channel is used for advance coordination.
- Treat the official calendar's category tags cautiously until the visible
  Pokemon-as-Magic errors are corrected upstream.

## Validation

- Parse all four canonical JSON files.
- Check duplicate IDs and store/source/event references.
- Run the repository text-integrity validator.
- Run the local browser smoke test for the affected store record.
