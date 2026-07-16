# Research Run: Tweedy Cards and Gaming Candidate-Grade First Pass Repair

## Run metadata

- Run ID: `2026-07-15-tweedycards-candidate-pass`
- Started: 2026-07-15
- Completed: 2026-07-15
- Researcher/agent: Codex

## Why this run exists

The earlier Tweedy pass was too weak for the project's updated first-pass
standard. It correctly preserved Tweedy as a real Wizards-backed store, but it
did not surface enough obvious standard-source detail to let the user seriously
consider the store as a playable candidate.

This repair run uses the strengthened candidate-grade first-pass rule:

- standard suite checked enough to trust the read
- strongest actionable upcoming MTG events surfaced
- clear answer on whether the store remains only discovery or can be promoted

## Sources reviewed

- Wizards Store & Event Locator live store view for store `17882`
- user/browser-captured live Tweedy Instagram views showing:
  - a weekly tournaments schedule graphic
  - a July 17 `Magic Presents: God of Mischief Commander Party` style MTG promo
- existing normalized Tweedy store/event/source records

## Strongest evidence surfaced

### Wizards / EventLink

Visible current MTG events included:

- `Magic Presents: God Of Mischief Commander`
  - Friday, July 17, 2026
  - 5:00 PM
  - $10 entry
  - capacity 8 players
- `Tweedy Standard Showdown`
  - Sunday, July 19, 2026
  - 5:00 PM
  - $5 entry
  - capacity 16 players
- `Friday Night Magic Casual Commander`
  - Friday, July 24, 2026
  - 5:00 PM
  - $10 entry
  - capacity 16 players

Wizards also visibly showed the store name and phone number on the live store
sheet, but this run does not normalize the phone number yet because the current
captured presentation made the formatting ambiguous.

### Instagram

The currently visible Instagram slice materially improved the first-pass read.

Observed signals:

- a weekly-tournaments graphic that visibly includes:
  - Fridays: `Friday Night Magic (Commander) @ 5:00 PM`
  - Sundays: `MTG Standard Showdown @ 5:00 PM`
- a dedicated July 17 MTG promo tile for a `Magic Presents: God of Mischief
  Commander Party` style event at 5:00 PM

This does not yet give a full community or social-texture read, but it does
raise confidence that the visible Wizards MTG lane is actively promoted rather
than merely sitting as an old locator placeholder.

## Candidate-grade first-pass conclusion

Tweedy should no longer sit in `wizards-discovery`.

Why:

- Wizards alone already showed more than one actionable MTG event.
- Instagram materially corroborated both the Friday Commander lane and the
  Sunday Standard lane.
- The July 17 God of Mischief Commander event is a real, near-term, actionable
  MTG lead that the user could seriously consider.

At the same time, Tweedy is still a modest candidate rather than a top lead.

What remains thin:

- no store-controlled official website was surfaced
- no Discord / meetup / LFG layer was surfaced
- no strong solo-arrival or pod-filling evidence was surfaced
- no richer read on whether MTG is central to the broader store identity beyond
  the visible schedule/promotional slice

Practical summary:

- real MTG store
- real recurring Friday Commander signal
- real Sunday Standard signal
- at least one notable near-term Commander special surfaced
- enough to promote to `partial`
- not yet strong enough to rank among the best community-fit candidates

## Canonical data decisions

Promoted / strengthened:

- store `tweedy-cards-and-gaming` promoted from `wizards-discovery` to `partial`
- recurring Friday Commander event strengthened with Instagram corroboration
- new one-off `Magic Presents: God Of Mischief Commander` event added
- recurring Sunday `Tweedy Standard Showdown` event added
- Tweedy Instagram evidence captured as a source-backed social synthesis

Not promoted:

- official website: none captured yet
- Discord/community-routing layer: none captured yet
- stronger social/community-fit claims: deferred

## User-relevance summary

For this project's practical goal, the most important thing this repair added is
that Tweedy now has actionable upcoming event value, not just abstract store
existence:

- Fri Jul 17 — God of Mischief Commander — 5:00 PM — $10
- Fri Jul 24 — Friday Night Magic Casual Commander — 5:00 PM — $10
- recurring Sundays — Standard Showdown — 5:00 PM — $5

That is enough to justify keeping Tweedy in the serious candidate set, even if
it currently sits below stronger social/community-evidenced stores.
