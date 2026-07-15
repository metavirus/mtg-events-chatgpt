# Research Run: Honey Pot Event Normalization

## Run metadata

- Run ID: `2026-07-15-honeypot-event-normalization`
- Started: 2026-07-15 02:50:00 -07:00
- Completed: 2026-07-15 03:10:00 -07:00
- Researcher/agent: Codex
- Related prior run or checkpoint:
  - `research/runs/2026-07-15-nearby-wpn-led-store-tranche/RUN.md`
  - `research/runs/2026-07-15-honeypot-hobbyoverflow-joyfultoad-social-pass/RUN.md`

## Objective

Promote Honey Pot Meadery's richer official event stream into normalized event
records so the project preserves more than just the weekly casual Commander note.

## Sources reviewed

- Honey Pot official events index
- Honey Pot event detail page for weekly Magic Night at the Meadery
- Honey Pot event detail page for Side Quest Society: God of Mischief
- Honey Pot event detail pages for Mead & Mana Commander League items
- Honey Pot event detail page for MTG: The Hobbit Prerelease

## Key findings

- Honey Pot's official site now supports a broader event model than the Wizards
  weekly listing alone suggests.
- Weekly Wednesday casual Commander remains the core recurring open-play anchor.
- A branded special event, `Magic Presents: God of Mischief`, clearly appears as
  a one-off Commander variant and should be normalized as such rather than left
  as unresolved jargon.
- Mead & Mana Commander League items show a more structured, paid, limited-seat
  Bracket-3-or-lower Commander lane distinct from the free Wednesday open-play
  series.
- Honey Pot also runs prerelease-style Magic events in a socially welcoming tone,
  which strengthens its relevance beyond casual weekly Commander.

## Reconciliation decisions

- Preserve Honey Pot as a venue with multiple Commander-related lanes:
  - free recurring open-play Commander
  - occasional branded/special Commander variants
  - structured paid Commander-league/tournament items
- Treat the official Honey Pot event pages as first-class event evidence, not
  merely as store-level color.

## Data changes

- Added Honey Pot official events-page source
- Added normalized one-off event records for:
  - Side Quest Society: God of Mischief
  - Mead & Mana Commander League: Season 3
  - Mead & Mana Commander League: Season 3 Tournament
  - MTG: The Hobbit Prerelease
- Updated backlog/frontier to reflect that Honey Pot event normalization has
  begun rather than remaining fully deferred

## Remaining unresolveds

- Decide later whether Honey Pot league items should be represented as one-off
  occurrences only or also linked to a higher-level recurring/seasonal series model.
- Continue watching for future branded WPN/Wizards variants that surface locally
  through Honey Pot before they appear elsewhere.

## Validation

- JSON validation required after edits.
