# Research Run: Hobby Overflow Discord Bounded Survey

## Run metadata

- Run ID: `2026-07-15-hobbyoverflow-discord-bounded-survey`
- Started: 2026-07-15 11:45:00 -07:00
- Completed: 2026-07-15 11:55:00 -07:00
- Researcher/agent: Codex
- Related prior run or checkpoint:
  - `research/runs/2026-07-15-hobbyoverflow-discord-routing-pass/RUN.md`

## Objective

Apply the updated workflow by performing the bounded first-pass Discord survey
for Hobby Overflow during the main store pass standard: determine whether the
server appears operationally useful, capture visible event/community signals if
accessible, and stop without exhaustive digging.

## Sources reviewed

- Hobby Overflow Discord invite landing
- Discord browser-access redirect/login flow

## Key findings

- The invite remains valid and resolves cleanly to `Hobby Overflow Store`.
- Visible invite-landing signals again showed roughly 185 online and 780 members
  at the time checked.
- Channel structure is operationally meaningful rather than token. The visible
  categories include:
  - `Server News` with `announcements` and `tournament-schedule`
  - `Overflow Announcements` with `open-for-pre-orders` and `pre-order-policy`
  - `Hobby Overflow Lobby` with `lobby-hangout`, `in-store-purchase-inquiry`,
    and `store-links`
  - a dedicated `Magic the Gathering` section with `general` and `announcements`
- The server appears read-optimized rather than fully open chat in many places:
  multiple channels are labeled `Text (Limited)`, and the inspected channels did
  not permit message sending from the current account in that context.
- The `Magic the Gathering` section is real, but currently modest in visible
  volume rather than bustling. In `general`, visible late-June conversation
  included:
  - a member asking `Is today the day`
  - a brief `lf` post
  - a direct stock question: `Is there commander pre cons for marvel in stock?`
- The server is also visibly used for real Magic event promotion, not only chat.
  In `announcements`, a June 19, 2026 post by `Grandpa Garp - Hobby Overflow`
  promoted a Marvel `Super Heroes` prerelease set of offerings, including:
  - Event #1: sealed prerelease on Saturday, June 20, 2026 at 5:30 PM
  - Event #2: draft on demand across June 19-25, 2026
  - Event #3: prerelease at-home option across June 19-25, 2026
- In `tournament-schedule`, the visible routine schedule graphic also exposed the
  standing Thursday Magic slot as `casual commander` from 5:30 PM to 9:00 PM.
- The visible Magic-channel sample supports the read that the server is useful
  for store-adjacent MTG chatter and stock/event awareness, but in the currently
  surfaced slice it does not yet show rich pre-arranged Commander meetup traffic
  or dense LFG coordination.

## Reconciliation decisions

- Preserve the Discord server as a meaningful source route and community-scale
  signal for Hobby Overflow.
- Upgrade the server from merely routed to actually surveyed at first-pass level:
  we now have a real lay-of-the-land read on its categories and MTG section.
- Upgrade the server's evidence value further: it is not just structurally
  relevant, but visibly carries both routine schedule graphics and special Magic
  event graphics that are directly useful for normalization and cross-source
  corroboration.
- Do not overstate the community function: the current bounded sample suggests a
  useful official/store-adjacent Discord with real Magic presence, but not yet a
  strongly evidenced Commander meetup engine.

## Data changes

- Refined the durable record of Hobby Overflow's Discord from routing-only to a
  real bounded first-pass survey.

## Remaining unresolveds

- Revisit the server later for:
  - clearer recent `tournament-schedule` content if a schedule graphic or event
    post appears in view
  - whether MTG `announcements` carries stronger Commander/event specifics than
    the bounded sample surfaced here
  - whether meetup chatter and actual pre-game coordination appear in different
    time windows than the currently visible slice

## Validation

- No schema changes required.
