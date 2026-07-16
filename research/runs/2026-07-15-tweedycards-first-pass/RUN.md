# Research Run: Tweedy Cards and Gaming First Pass

## Run metadata

- Run ID: `2026-07-15-tweedycards-first-pass`
- Started: 2026-07-15 17:10:00 -07:00
- Completed: 2026-07-15 17:30:00 -07:00
- Researcher/agent: Codex

## Objective

Run the next bounded discovery pass on Tweedy Cards and Gaming after its record
was restored from borrowed Cardboard/Aki fields, and determine whether it earns
promotion beyond Wizards-only discovery status.

## Sources reviewed

- normalized Tweedy store record
- local Wizards reconciliation snapshot for organization `17882`
- current normalized event record tied to `src-wpn-17882`
- bounded public search for official site and social corroboration

## Key findings

- Tweedy remains a real Wizards-backed store lead rather than a mistaken or
  duplicate entity.
- The Wizards snapshot supports one meaningful recurring Magic signal:
  `Friday Night Magic Casual Commander`, Fridays at 5:00 PM, $10 entry,
  capacity 16, with description text `Join us for Commander Friday Night
  Magic.`
- The current normalized event record tied to Tweedy is consistent with that
  Wizards evidence.
- The current public website field still routes only to the generic WPN shell,
  not to a store-controlled site.
- A bounded public search did not surface a clear official website, official
  Instagram, or other obvious store-controlled public footprint strong enough to
  upgrade the store into a real partial record yet.
- Because the corroborating public footprint is still thin, the present evidence
  supports store reality and a recurring Commander listing, but not yet a
  higher-confidence read on MTG-focus, player-pool breadth, solo-arrival feel,
  or schedule reliability beyond Wizards itself.

## Reconciliation decisions

- Keep Tweedy in `wizards-discovery` status for now.
- Preserve the existing recurring Wizards-backed Commander event rather than
  forcing a stronger store-level promotion from thin evidence.
- Treat the restored generic discovery note as correct until a later pass finds
  real store-controlled or community-controlled corroboration.

## Data changes

- No canonical JSON changes made in this pass.
- No source records added in this pass.

## Remaining unresolveds

- Determine whether Tweedy has any real official public surface beyond Wizards.
- Look for Instagram, Facebook, Linktree, Discord, or event-commerce routing in
  a later deeper pass if Tweedy is promoted again.
- Determine whether the Friday Commander event is actively operational or mainly
  a Wizards-listed recurring slot.

## Validation

- No canonical JSON edits were made.
- Repository text-integrity remains the standing checkpoint for any later data
  edits.
