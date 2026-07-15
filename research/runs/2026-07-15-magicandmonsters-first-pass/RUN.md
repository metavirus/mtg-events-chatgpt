# Research Run: Magic and Monsters First Pass

Date: 2026-07-15

## Objective

Run the first real cross-source pass on Magic and Monsters and determine whether
it should remain a generic Wizards-discovery lead or be promoted into a
meaningful partial record.

## Sources consulted

- Magic and Monsters official website
- Magic and Monsters official events page
- Magic and Monsters Instagram profile
- Magic and Monsters Facebook page
- Wizards Store & Event Locator listing / existing normalized event record
- Prior community-anecdote baseline already saved in repo

## Findings

- This is clearly a real, active, Magic-forward specialty store. The official
  storefront strongly foregrounds Magic: The Gathering in both singles and
  sealed inventory.
- The official events page is real and live, and its underlying wiring shows a
  structured event-calendar system rather than a dead placeholder page, even
  though this bounded pass did not fully resolve the embedded store-calendar
  feed.
- Social surfaces are real and operational. Public reads showed official
  Instagram and Facebook presence plus hints of Discord routing.
- Wizards already provides a recurring `Commander Free Play` anchor on Friday at
  6 PM.
- A prior saved community anecdote is worth keeping in view cautiously: a
  newcomer described friendly treatment, many Bracket 2 players, and a separate
  competitive night believed to be Thursday. This remains anecdotal and needs
  store-controlled corroboration before being treated as firm.

## Analytical read

- Promote Magic and Monsters into a real partial record now.
- Current best read is stronger than a generic Wizards-only store because the
  official site, live event infrastructure, and real social surfaces all point
  to a functioning Magic-focused operation.
- This store still needs a deeper branch of work later if we want cleaner
  normalization of its full event stream, but it already looks meaningfully more
  promising than many discovery-tier stores.

## Follow-up candidates

- Resolve the embedded event-calendar feed more cleanly if a future refresh
  needs full official event normalization.
- Verify whether the anecdotal Bracket 2 / separate competitive-night split is
  reflected in official or current social sources.

## Repo updates intended

- Promote Magic and Monsters from `wizards-discovery` to `partial`
- Add official site, events page, and social sources
- Strengthen the store note using the official Magic-forward signals
