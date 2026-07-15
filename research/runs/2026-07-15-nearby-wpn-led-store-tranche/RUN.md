# Research Run: Nearby WPN-Led Store Tranche

## Run metadata

- Run ID: `2026-07-15-nearby-wpn-led-store-tranche`
- Started: 2026-07-15 00:30:00 -07:00
- Completed: 2026-07-15 00:45:00 -07:00
- Researcher/agent: Codex
- Related prior run or checkpoint: normalized Wizards-reconciliation data already present in `stores.json` and `events.json`

## Objective

Broaden store coverage while the user is away by promoting a small tranche of
under-covered nearby stores whose Wizards listing text already carries meaningful
fit signals.

## Stores considered

- Hobby Overflow
- Joyful Toad TCG
- Requiem: Coffee, Tea, and Fantasy
- SoCalMagic
- Honey Pot Meadery

## Evidence reused

- Wizards/EventLink recurring Commander records already normalized in the dataset
- Honey Pot official website identity check confirming venue identity and address
- previously captured anecdotal community mention that Joyful Toad often has
  pods forming, treated as suggestive rather than confirmed

## Promotions made

- Honey Pot Meadery was promoted as a stronger nontraditional-venue lead because
  the Wizards text is unusually descriptive and newcomer-friendly.
- SoCalMagic was promoted as a clearer caution case because the `No proxy`
  wording is explicit rather than inferred.
- Hobby Overflow, Joyful Toad, and Requiem were kept as promising nearby leads,
  but still lightly vetted pending deeper source passes.

## Reconciliation decisions

- Meaningful Wizards wording is enough to improve the analytical notes even
  before full comparable passes are complete.
- This tranche improves prioritization without pretending these stores are fully
  vetted.

## Data changes

- Added `src-honeypot-site-2026-07-15`
- Updated store notes for Hobby Overflow, Joyful Toad, Requiem, SoCalMagic, and
  Honey Pot Meadery
- Promoted Honey Pot Meadery from `wizards-discovery` to `partial`
- Updated frontier and backlog with the new tranche status

## Remaining unresolveds

- Each of these stores still needs deeper social/community/source-routing work.
- Honey Pot and Requiem especially need venue/community interpretation beyond
  bare recurring schedule text.

## Validation

- JSON validation required after edits.
