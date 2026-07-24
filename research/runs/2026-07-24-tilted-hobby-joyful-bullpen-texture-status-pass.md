# Tilted / Hobby Overflow / Joyful Toad / Bullpen texture-status pass

Date: 2026-07-24

Scope: mixed texture/status corrected pass for Tilted Gaming, Hobby Overflow,
Joyful Toad TCG, and The Bullpen 2.0. This was not a broad event-ingestion
batch. The pass focused on practical visit confidence, source/community
disposition, and status safety.

## Shared method

- Reused the 2026-07-24 30-mile Wizards/EventLink snapshot rather than pulling
  WPN again.
- Checked current Supabase venue/source/evaluation state and Discord monitoring
  metadata.
- Did not open Discord, restart Discord safety work, or use unsafe social
  navigation.
- Treated Instagram/Facebook routes as content-replay TBD when not safely
  inspectable through the public fetch path.
- Did not edit canonical app JSON.

## Store outcomes

### Tilted Gaming — Cerritos

Planning read: close and planning-useful, with strong event breadth already
covered. Tilted now has enough event/source confidence to stop being an
ordinary corrected-main-pass target, but community texture is still partial.

Evidence/useful facts:

- Current WPN snapshot reconfirms Friday casual Commander/FNM, Sunday draft,
  Commander Party, Hobbit prerelease, and later Reality Fracture prerelease
  style support.
- Existing first-party events/homepage and WPN reconciliation already support
  capacity, fees, first-come signup, check-in/start details, and limited seats.
- Discord route from the official events page is captured but not content
  inspected.

Planning interpretation:

- Worth keeping as a close, high-event-breadth candidate.
- Best first try likely Friday Commander or Sunday draft depending on desired
  format.
- Check before going for seat availability and casual/proxy expectations.

Remaining TBD:

- Discord content replay.
- Instagram/Facebook texture.
- Commander turnout, solo-arrival comfort, proxy norms, and power mix.

### Hobby Overflow — Cypress

Planning read: very close and still promising, but Commander texture remains
blocked behind community/social surfaces.

Evidence/useful facts:

- Current WPN snapshot reconfirms Thursday late-night casual Commander at 10 PM.
- Existing official/site/review evidence supports a welcoming TCG store with
  community/event infrastructure.
- Existing Discord route is mapped, but invite/role gated; safe access mode is
  `join_or_role_gate`, so it was not inspected.

Planning interpretation:

- Strong nearby candidate by distance and broad community texture.
- Actual first-visit usefulness depends on whether Thursday 10 PM Commander is
  practical and reliably social.
- Do not treat the Discord quiet/blocked state as negative venue evidence.

Remaining TBD:

- User action or future safe access for Discord/community route.
- Commander turnout, power/proxy norms, and solo-arrival comfort.
- Whether Thursday 10 PM is genuinely useful for the user.

### Joyful Toad TCG — Anaheim

Planning read: legitimate, close-ish, and stable, but still more of a
medium-confidence lead than a high-priority home-base candidate.

Evidence/useful facts:

- Current WPN snapshot reconfirms Monday 7 PM Commander Night.
- Existing official site/review evidence supports an active store, long hours,
  Magic singles, and broad TCG support.
- Social/Discord route exists in prior source mapping, but no safe mapped
  Discord content access was available for this pass.

Planning interpretation:

- Plausible backup Commander option.
- Lower priority than closer/better-textured candidates until social/community
  evidence improves.

Remaining TBD:

- Discord/community route mapping and safe content replay.
- Commander turnout, proxy/power norms, and solo-arrival feel.
- Whether social posts show MTG schedule detail beyond WPN.

### The Bullpen 2.0 — Los Angeles

Planning read: WPN currently shows substantial event activity, but operational
identity and store-controlled source continuity are not safe enough to promote
the full calendar as normal planning truth yet.

Evidence/useful facts:

- Current WPN snapshot lists Friday FNM Booster Draft, Saturday Weekly
  Commander, Wednesday Standard Showdown, and Hobbit prerelease sessions at
  6234 W 87th St.
- The app already has a Saturday Commander row.
- Store-controlled web/source routing remains weak or unresolved. A suspected
  Bullpen Sports Cards LA domain did not resolve from this environment.

Planning interpretation:

- Do not retire the store: WPN evidence is current and event-rich.
- Do not promote the full WPN event breadth without a status/source follow-up.
- Treat as check-first / lower-priority because it is far and source identity
  is not clean.

Remaining TBD:

- Current official/store-controlled website or social route.
- Confirmation that The Bullpen 2.0 at 6234 W 87th St is the correct current
  operational identity for these WPN events.
- Whether the broader WPN event stream should be promoted into active Events.

## Discord/community disposition

- Tilted: Discord route captured from official events page; not safely content
  inspected; content replay TBD.
- Hobby Overflow: Discord route mapped but invite/role gated; not inspected.
- Joyful Toad: no safely readable mapped route in the monitoring map; route TBD.
- Bullpen: no known Discord/community route in current evidence; not found/TBD.

## Signals decision

Signals proposed: 0.

Reason: the findings are useful for Places/Evidence/TBD cleanup, but none is a
fresh attention-layer item. Tilted's special events are already in Events, Hobby
and Joyful are routine Commander texture gaps, and Bullpen's identity/status
blocker is important but not currently useful enough as a landing-page Signal
until a concrete event promotion or contradiction decision is ready.

## Proposal

Reviewable proposal:
`supabase/proposals/tilted-hobby-joyful-bullpen-texture-status-2026-07-24.json`
