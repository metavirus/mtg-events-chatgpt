# Discord pilot: Communities Inspect Next

- Date: 2026-07-20
- Mode: bounded manual Discord pilot
- Scope: top high-value Communities routes only
- Live writes: approved subset applied after user acceptance
- Browser interaction: read-only; no messages, reactions, voice, settings, or social interaction

## Purpose

This pilot tested whether the new Communities "Inspect next" queue can produce planning-useful Signals, Places implications, or event/source-health findings without becoming a broad Discord research wave.

The pilot inspected three routes:

1. Magic & Monsters Discord
2. ProjectCCG Online Community Discord
3. JJ's Collectibles Discord

That was enough to test three important route types:

- a store where Discord contradicted/stabilized stale calendar assumptions;
- a store/community server with operational alerts and cancellations;
- a nearby high-fit store with active Magic announcements and Commander-channel guidance.

## Route results

### Magic & Monsters Discord

- Linked venue: `magic-and-monsters`
- Channels inspected:
  - `#shop-schedule`
  - `#mtg-schedule`
- Content accessible: yes
- Last useful date observed: 2026-05-31 in `#shop-schedule`; older MTG schedule message last edited 2025-02-11 in `#mtg-schedule`
- Monitoring recommendation: check selectively when planning a visit or reconciling Magic & Monsters event rows; not a daily high-priority route unless it starts showing current MTG announcements again

Findings:

- `#shop-schedule` contains a May 31, 2026 Summer 2026 schedule post.
- That post says the store is now open at 10 AM daily.
- It also says "Magic: The Gathering is no longer on the regular schedule."
- The same post says the store is still hosting MTG players daily through play space and that players may drop in anytime to play Commander.
- The same post says the EDH community is thriving and that prerelease, promotional, or cEDH tournaments may still happen in the future.
- `#mtg-schedule` still shows an older July 2024 / February 2025-edited MTG weekly schedule and did not show a current 2026 MTG routine in the sampled visible slice.

Interpretation:

- This is a strong source-health signal.
- Magic & Monsters should not be treated as having a reliable current scheduled weekly MTG calendar solely from older Discord MTG schedule text.
- Existing WPN/EventLink or app rows may still be real, but the store-controlled Discord says MTG is no longer on the regular schedule, so current event rows should be reconciled carefully.
- Commander remains a real play-space/community possibility, but more as drop-in Commander than a clean posted routine.

Suggested signal:

- Category: `source_health`
- Priority: `high`
- Confidence: `high`
- Suggested action: reconcile Magic & Monsters calendar rows and Places assessment language against the current Discord schedule post before treating any routine MTG listing as planning-reliable.

Remaining unknowns:

- Whether Wizards/EventLink still has a current, store-maintained Friday Commander row.
- Whether the current drop-in Commander community has predictable turnout, proxy expectations, or solo-arrival support.
- Whether future prerelease/promotional/cEDH posts appear in Discord or on another store-controlled route.

### ProjectCCG Online Community Discord

- Linked venues:
  - `projectccg-santa-ana`
  - `projectccg-alhambra`
- Channels inspected:
  - `#oc-events`
  - `#mtg-announcements`
  - `#oc-announcements`
  - `#mtg-discussion`
- Content accessible: yes
- Last useful date observed: 2026-07-19 in `#oc-announcements`; 2026-07-18 in `#mtg-discussion`; 2026-07-10 in `#oc-events`
- Monitoring recommendation: check regularly for ProjectCCG Santa Ana/OC, especially before same-day visits or when source-health/cancellation risk matters

Findings:

- `#oc-announcements` is highly operationally useful:
  - 2026-07-17: parking-lot repaving caused adjusted hours of 12-4:30 PM and "All events tonight are canceled."
  - 2026-07-18: store was closed again.
  - 2026-07-19: store reopened and parking lot was open to the public.
- `#oc-events` shows the broader OC tournament schedule, but the latest visible schedule update in the sample emphasized non-MTG additions and changes.
- `#mtg-announcements` shows MTG-specific announcements and corrections:
  - Tuesday and Friday Standard at 6:30 PM as of late May 2026.
  - Prior June MTG specials, prerelease, Pride Night, and cancellation notes.
  - A June 6, 2026 note canceled draft and Commander that week due to a One Piece prerelease.
- `#mtg-discussion` showed active, recent MTG conversation and an 2026-07-18 "Anyone down to get a commander pod going" message.

Interpretation:

- Discord is materially useful for ProjectCCG because it catches current operational changes that a static calendar may miss.
- It also supplies useful community texture: there is visible MTG discussion and at least one current Commander pod inquiry.
- The July 17-19 closure/reopen sequence is now historical/resolved, so it should not become a prominent active Signals card unless the app intentionally preserves resolved signals.
- The route should be marked as worth monitoring because it can answer cancellation, access, and turnout/LFG questions.

Suggested signal/source update:

- Category: `operational`
- Priority: `low` or `normal` because the specific July 17-19 issue is resolved
- Status: `stale` or `reviewed`, not a prominent "Act first" signal
- Confidence: `high`
- Suggested action: keep ProjectCCG OC Discord in the regular check queue for same-day access/cancellation and MTG community texture.

Remaining unknowns:

- Whether the visible "commander pod" discussion reflects a reliable Commander meetup pattern or only ad hoc chatter.
- How often draft or Commander is displaced by other major TCG events.
- Whether ProjectCCG Alhambra has separate channel behavior or whether the shared server should be handled as one community route with branch tags.

### JJ's Collectibles Discord

- Linked venue: `jjs-collectibles`
- Channels inspected:
  - `#magic-announcements`
  - `#commander-night`
- Content accessible: yes
- Last useful date observed: 2026-07-19 in `#magic-announcements`; pinned/standing Commander guidance from 2025 in `#commander-night`
- Monitoring recommendation: check regularly; this is a high-value nearby route

Findings:

- `#magic-announcements` is active and current:
  - 2026-07-19: Monday Night Magic at Orange, free entry, Bracket 2/3, 7 PM.
  - 2026-07-18: 60-Card Sundays at Garden Grove with Standard at 3 PM and Pauper at 6:30 PM.
  - 2026-07-17: Casual Saturday Commander nights at both locations; Garden Grove $5 Bracket 2-4, Orange free Bracket 2/3.
  - 2026-07-13: Garden Grove weekly post included Tuesday Commander, Bracket Two Commander, Friday Lorwyn draft, Saturday Commander, Standard, and Pauper.
  - 2026-07-17: a promo image announced future events including Precon Commander Night, Jumpstart, Marvel Super Heroes Commander Party, and Hobbit prerelease dates.
- `#commander-night` preserves standing Commander guidance:
  - pod formation is random;
  - Commander nights run Friday 6 PM, Thursday 7 PM, and Saturday 7 PM according to the pinned/standing text;
  - bracket/power-level links and clarification are provided.

Interpretation:

- JJ's remains one of the strongest nearby Discord routes for this project.
- This inspection strengthens, but does not materially change, the already accepted JJ's record: the future promo-image events and Commander-channel guidance were already captured in the earlier accepted JJ's cleanup.
- No new write is needed solely from this pilot unless the app wants a current monitoring-status signal.

Suggested signal:

- No new active Signal is needed just to make the page look fuller.
- If a monitoring signal is desired later, it should be a quiet "check regularly" community-route signal, not an urgent action card.

Remaining unknowns:

- Which JJ's recurring Commander lane is best for a first solo visit.
- Whether the Orange and Garden Grove location split should be made more explicit in future event records.
- Current proxy norms beyond bracket preferences.

## Method lessons

1. Discord can be far more than a route inventory.
   - ProjectCCG produced same-week cancellation/reopening information and practical access notes.
   - Magic & Monsters produced a source-health correction that changes how current MTG schedule claims should be read.
   - JJ's produced event and Commander texture, including image-based promo information.

2. The "Inspect next" queue should prioritize routes likely to answer one of these questions:
   - Is anything canceled, closed, rescheduled, capacity-limited, or parking/access-constrained?
   - Is a store calendar stale compared with Discord?
   - Are there near-term MTG opportunities missing from the app?
   - Is there LFG, pod, turnout, proxy, bracket, or newcomer/solo-arrival texture?

3. Signals should stay sparse.
   - Resolved historical closures belong in a run note or stale/reviewed signal, not prominent Signals real estate.
   - Routine known negatives should continue to downrank or annotate, not become top cards.
   - Source-health contradictions and near-term actionable opportunities are the better fit for Signals.

## Proposed write/no-write decision

Prepare one reviewable Supabase proposal:

- Add one active Magic & Monsters source-health Signal.
- Add one low-pressure, resolved ProjectCCG operational Signal or source/community note so the useful cancellation/reopen pattern is preserved without crowding the Signals landing page.
- Do not add JJ's rows from this pilot because the relevant JJ's event/evidence/assessment material was already accepted and applied.

## Applied subset

After user acceptance, the useful subset was applied through a lean Supabase
write:

- applied one Magic & Monsters source-health Signal;
- updated the Magic & Monsters Discord entity-source relationship to record the
  inspected Summer 2026 source-health finding;
- updated the ProjectCCG Santa Ana Discord entity-source relationship to record
  that the route has inspected operational, cancellation/reopening, MTG
  announcement, and community-texture value;
- did not insert the ProjectCCG July 17-19 closure/reopen item as a Signal,
  because it was resolved and should not occupy landing-page attention;
- did not write JJ's changes, because the relevant JJ's Discord/event/evidence
  material was already captured in the accepted JJ's cleanup.

Readback confirmed only the Magic & Monsters pilot Signal was inserted.
