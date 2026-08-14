# Discord Surface Frontier

Updated: 2026-08-14

Purpose: this is the compact operating map for Discord survey work. It records
what has already been discovered, which surfaces are ripe for a recurring agent,
which are merely route-captured, and which are blocked. Do not repeat broad
Discord discovery before using this map.

## Current inventory

- Canonical Discord surface data exists in Supabase, split across:
  - `sources`: route/source records, including raw invite or server evidence.
  - `discord_access_profiles`: server-level access and usefulness posture.
  - `discord_channel_watchlist`: exact channel/button targets for recurring
    survey.
- Current normalized map: 11 access profiles and 34 channel watchlist rows.
- Channel status summary from the latest audit:
  - 31 active watchlist rows.
  - 3 blocked/TBD watchlist rows.
  - 20 high-priority watchlist rows.
- A source row by itself is not agent-ready. A Discord route becomes recurring
  survey material only after it has an access profile plus exact mapped channel
  or server-event targets.

## Channel disposition model

Do not create a parallel Discord "hot / ignore" table. The canonical model is
the existing `discord_access_profiles` + `discord_channel_watchlist` map:

- `hot_signal_source`: exact channels/server-event targets that should be
  checked first because they can create urgent or high-value findings. Examples:
  announcements with closure/hour changes, event channels, LFG/meetup channels,
  and any channel with proven `Metavirus` mentions or concrete planning talk.
- `watch`: useful recurring channels that may produce event-adjacent chatter but
  do not need to be treated as urgent every run.
- `sample`: ambiguous or chaotic channels such as `general`, `main`, or
  `lounge`. They get a bounded activity sample before promotion to `hot`/`watch`
  or demotion to quiet handling. Never skip these by name alone.
- `ignore`: channels that should stay out of recurring scan work after a tiny
  confirmation sample, such as memes, bot logs, pure trading, onboarding spam,
  or stale push-only channels with no planning value. Keep the route evidence if
  useful, but do not let it create daily agent work.
- `blocked_repair`: channels with access, role, permission, or read-state
  blockers. These are finite repair items, not recurring scan targets.

Until a dedicated enum exists, encode this disposition through the existing
watchlist fields: priority/cadence, `access_status`, `noise_level`,
`scan_notes`/description, and the cursor fields. The preflight helper already
enforces the important rule: the agent may only inspect exact channels present
in `discord_channel_watchlist`.

## Ripe recurring-agent surfaces

These are the first Discord surfaces to use once the Discord survey agent is
approved. Start here; do not begin with route-only invites.

| Surface | Current posture | First recurring targets | Why it matters |
| --- | --- | --- | --- |
| MTG OC | Joined, accessible, high-value regional community | `#events_activities`, `#monthly-meetings`, `#welcome`; secondarily `#announcements`, `#random`, `#share_feedback_promos` | Proven source of meetup coordination. Mentions of `Metavirus`, direct questions, and concrete meetup planning are highest signal. |
| Legendary Creature Club | Joined/accessible proof exists; daily-style candidate | Server Events button / Discord events, `#events`, `#lfg`, `#meet-ups`; sample `#mtg` only when needed | Proven source of regional event health, LFG, meetup, and pod-formation chatter. |
| Collectors Lounge | Joined and useful; announcements can carry operational alerts | `#announcements` daily; `#mtg-announcements-and-events` weekly; `#general` weekly; `#event-rules` occasional | Store closures, no-event notices, weekly lineups, Commander rules, and event-adjacent chatter. |
| ProjectCCG community | Joined/access mapped; still needs careful route proof because prior isolated-profile pass hit server-selection/read-state issues | `#oc-announcements`, `#mtg-announcements`, `#oc-events`, `#mtg-discussion` | Branch/community announcements and event chatter, especially Orange County context. |
| JJ's Collectibles | Joined/access mapped | `#magic-announcements`, `#commander-night` | Store-level Magic announcements and Commander-night coordination. Preserve Orange/Garden Grove identity boundaries. |
| Kingslayer Games | Joined/access mapped, manual-session posture | `#commander`, `#mtg-announcements` | Commander and branch/event chatter. |
| Magic & Monsters | Joined/access mapped, occasional/source-health posture | `#shop-schedule`, `#mtg-schedule` | Useful mostly for schedule-health and "MTG no longer routine" checks. |
| Krazy Nick's | Joined/access mapped, occasional candidate | `#commander`, `#weekly-event-schedule` | Lower-frequency but potentially useful Commander/schedule route. |

## Blocked or finite-repair surfaces

These should not be put into the daily agent until the exact blocker is
resolved. A blocked route is not a reason to reopen full store research.

| Surface | Current issue | Next bounded step |
| --- | --- | --- |
| Hobby Overflow Discord | Invite-gated / blocked-TBD profile. | One finite invite/session repair attempt if the user cares about this store's Discord texture. Otherwise leave as known route, blocked content. |
| Paper Hero's Huntington Beach Magic channel | Watchlist row is blocked/TBD despite a manual-session proof. | One exact channel-access repair proof before any recurring monitoring. |
| ProjectCCG and Magic & Monsters isolated-profile reruns | Prior guarded runs hit Discord acknowledgement/server-selection state before content extraction. | Do not allowlist Discord write-like acknowledgement traffic just to make a read pass. First diagnose route hydration without reading messages. |

## Route-captured but not agent-ready

These have Discord/source-route evidence but are not yet normalized into a
recurring survey surface. Treat them as finite replay candidates, not daily
watch targets.

- Buddies Collectibles.
- CoreTCG tournament Discord.
- GXGAMERS Linktree Discord route.
- Next-Gen Games Discord route.
- Otaku Vault Discord route.
- Tilted Gaming invite route.
- Turn Zero Discord route.
- Collector Legion route/baseline evidence, separate from the Collectors
  Lounge mapped server.
- Spellhold and Guild House older baseline evidence with unclear current source
  health.

## Community/source modeling rules

- Groups stay separate from stores and host venues. A meetup can happen at a
  store, bar, house, park, or spaceship without becoming official programming
  of that location.
- Community-organized events should be owned by the community/group and carry
  the host location as location text or linked host context.
- All sources are first-class evidence. Discord, Instagram, Facebook, WPN, a
  website, or a flyer can be authoritative for the fact it actually supports.
  Do not measure Discord against WPN as if WPN were the gold standard.
- General or main channels may be valuable when active. Do not classify a
  channel as useless by name alone. Inspect activity and purpose.

## Signal classes worth surfacing

High-signal Discord findings:

- Direct mentions or questions involving `Metavirus`.
- Concrete meetup coordination: who is going, where, day/time, capacity, format,
  ride/parking/logistics, or "anyone want to play tonight?"
- Operational notices: closure, changed hours, no events, cancellation,
  postponement, moved location, sold out, or special schedule.
- Event announcements or meaningful event-adjacent chatter, including tentative
  plans when the uncertainty is useful.
- Community pulse that changes practical planning: attendance is poor, a league
  is on hiatus, a channel/server is active again, or a route is stale.

Quiet outcomes:

- Memes, generic card trading, commerce-only chatter, bot noise, and social
  chatter with no Magic/community planning value.
- No-delta checks, blocked content, stale push-only channels, and route-only
  findings should land as quiet surface coverage, not public Signals.

## Next implementation checkpoint

The next Discord automation step is not "discover Discord again." It is:

1. Build/read from the existing `discord_channel_watchlist` map.
2. Run a small proof over the first ripe set: MTG OC, Legendary Creature Club,
   and Collectors Lounge `#announcements`.
3. Emit only one of four outcomes per surface: accepted Signal, accepted event
   candidate/promotion, quiet coverage/no useful chatter, or exact blocked
   repair item.
4. Link accepted findings to the Discord source/channel/message where possible,
   and to the community or canonical event when promoted.
5. Stop and report timing/cost before expanding to the rest of the map.
