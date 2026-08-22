# Discord Surface Frontier

Updated: 2026-08-22

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
- Current normalized map: 12 access profiles and 38 channel watchlist rows.
- Channel status summary from the latest audit:
  - 27 active watchlist rows.
  - 7 paused watchlist rows.
  - 4 blocked/TBD watchlist rows.
  - 21 high-priority watchlist rows.
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
| MTG OC | Joined, accessible, high-value regional community | `#events_activities` daily hot; `#monthly-meetings` daily hot; `#announcements` weekly watch; `#share_feedback_promos` weekly watch; `#welcome` weekly sample/watch | Proven source of meetup coordination. Mentions of `Metavirus`, direct questions, and concrete meetup planning are highest signal. `#questions_comments_suggestions` and `#random` are now intentionally demoted out of daily emphasis as low-yield general lanes. |
| Los Angeles Gayming Society / LAGS | Joined, accessible, high-value LGBTQ+ regional community; included in the cloud runner | `#meet-up` and `#announcements` as hot; `#general` as watch/sample; `#lfg-channel` retained but paused | The August 22 guarded run proved the three active routes after mapping Discord's UI label `LAGaymingSociety` without changing the canonical community name. `#lfg-channel` failed two bounded unique-anchor attempts and is paused rather than poisoning daily health. Community events belong to LAGS; bars, parks, and stores remain host-location context. |
| Legendary Creature Club | Joined/accessible proof exists; daily-style candidate except the separate Events control repair | `#events`, `#lfg`, `#meet-ups`; sample `#mtg` only when needed | Proven source of regional event health, LFG, meetup, and pod-formation chatter. The separate Server Events / Discord Events surface is paused as an exact repair item, not an active daily route. |
| Collectors Lounge | Joined and useful; announcements can carry operational alerts | `#announcements` daily; `#mtg-announcements-and-events` weekly; `#general` weekly; `#event-rules` occasional | Store closures, no-event notices, weekly lineups, Commander rules, and event-adjacent chatter. |
| ProjectCCG community | Joined/access mapped; still needs careful route proof because prior isolated-profile pass hit server-selection/read-state issues | `#oc-announcements`, `#mtg-announcements`, `#oc-events`, `#mtg-discussion` | Branch/community announcements and event chatter, especially Orange County context. |
| JJ's Collectibles | Preparatory survey complete 2026-08-22; recurring monitoring approved | `#magic-announcements`, `#commander-night` weekly | Both guarded routes passed and produced useful event-candidate findings. Preserve Orange/Garden Grove identity boundaries. Do not repeat preparatory surveying without a new material route or access change. |
| Kingslayer Games | Preparatory survey complete 2026-08-22; recurring monitoring approved | `#commander`, `#mtg-announcements` weekly | Both guarded routes passed and produced useful event-candidate findings. Do not repeat preparatory surveying without a new material route or access change. |
| Magic & Monsters | Joined/access mapped, occasional/source-health posture | `#shop-schedule`, `#mtg-schedule` | Useful mostly for schedule-health and "MTG no longer routine" checks. |
| Krazy Nick's | Preparatory survey complete 2026-08-22; occasional monitoring approved | `#commander` occasional; `#weekly-event-schedule` paused | Commander produced real play/promo coordination. The schedule channel is stale since 2024 and remains known but paused. Do not repeat preparatory surveying without a new material route or access change. |

## Preparatory-survey completion rule

`discord_access_profiles.preparatory_survey_completed_at` is the durable stop
marker. Once populated, the server must not return to preparatory surveying
because time passed or a future agent reacclimated. Completed profiles receive
routine monitoring only. Reopen preparation only for a genuinely new material
route, changed access state, or explicit user request. Channel-level active,
paused, and blocked dispositions remain canonical in
`discord_channel_watchlist`.

## Discord review audit ledger

This table is the machine-checkable completeness record for Discord routes that
have been called reviewed or agent-ready. A channel is not complete unless the
row records scheduled Events, recent chatter, pins/media/images, direct
mentions, and owner-vs-location attribution.

<!-- discord-frontier-audit:start -->
| server | channel | disposition | scheduled_events | recent_messages | pins_media | metavirus_mentions | owner_location_rule |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LAGaymingSociety | #meet-up | hot_signal_source | Discord Event `1537178990249513072`: Magic The GAYthering at Precinct DTLA, Tue Aug 18 2026 6 PM | Checked current/recent meetup thread around the event card and reactions | Event image/card checked; source image evidence attached to LAGS-owned event/signal | Checked; no direct `Metavirus` participation shown in this LAGS event proof | LAGS/community-owned event; Precinct DTLA is host location text/context, not promoted as store owner |
| LAGaymingSociety | #announcements | hot_signal_source | Discord Event observed: Gaymer Night at WERK Long Beach, Thu Aug 20 2026 8 PM | Checked recent announcement activity | Announcement/event card media checked | Checked; no direct `Metavirus` mention observed | LAGS/community-owned event; WERK Long Beach is host location context unless separately promoted |
| LAGaymingSociety | #general | watch | No current scheduled Discord Event promoted from this channel | Checked bounded current chatter sample; found MTG-adjacent Witch's Cottage Tuesday discussion | No event-card media promoted from this sample | Checked; no direct `Metavirus` mention observed | Chatter-only route; do not promote host bars/places without a concrete event source |
| MTG OC | #events_activities | hot_signal_source | Server Events surface checked; no upcoming Discord Events shown on Aug 14 2026 | Checked Aug 1-9 current meetup/prerelease chatter: six-person planning, Collectors Lounge prerelease question, and post-event follow-up | Pinned post checked: channel is for events, activities, Meetup page items, LGS visits, food, and casual plans; image/media affordance present but no event image promoted | Checked; direct `Metavirus` participation observed Aug 2, Aug 8, and Aug 9 | MTG OC/community-owned planning route; store names such as Collectors Lounge are host/location context unless separately promoted |
| MTG OC | #monthly-meetings | watch | Server Events surface checked; no upcoming Discord Events shown on Aug 14 2026 | Checked May-July planning/LFG sample: Magic & Monsters, Shuffle & Cut, Collectors Lounge, Comic Quest, Paper Hero's, Joyful Toad, Commander brackets, and team-prerelease planning | Pinned post checked; channel carries recurring meetup coordination and standing community orientation, with no event-card media promoted from this sample | Checked; direct `Metavirus` participation observed in July team-prerelease planning | MTG OC/community-owned coordination route; mentioned stores are locations/source texture, not event owners without independent store source |
| MTG OC | #announcements | watch | Server Events surface checked; no upcoming Discord Events shown on Aug 14 2026; older Meetup link observed for TMNT Prerelease at Collector's Lounge on Feb 27 2026 | Checked announcement sample: Feb 2026 event announcements and June 2026 Facebook group launch; no current Aug hot item visible | Pinned Facebook-group announcement checked; Meetup card/link media observed for older prerelease announcement | Checked; no direct `Metavirus` mention observed in sampled announcements | MTG OC owns community announcements; Collector's Lounge and other stores are host/location context unless a separate store-controlled source owns the event |
| Legendary Creature Club | #events | hot_signal_source | Guild Events surface attempted separately on Aug 14 2026 and failed closed because no unique Events control was observed | Checked five visible messages from Aug 13 2026; no current event-health, cancellation, attendance, or community-activity finding | No event-card media promoted from this bounded sample | Checked; no direct `Metavirus` mention observed in sampled messages | LCC/community route; quiet current window does not lower durable route value |
| Legendary Creature Club | #lfg | hot_signal_source | No scheduled Discord Event promoted from this channel | Checked bounded current window on Aug 14 2026; zero extractable visible messages | No event-card media promoted from this bounded sample | Checked; no direct `Metavirus` mention observed | LCC/community LFG route; quiet current window does not lower durable route value |
| Legendary Creature Club | #meet-ups | hot_signal_source | No scheduled Discord Event promoted from this channel | Checked five visible messages from Jul 24-Aug 5 2026; found real same-night meetup/location coordination from Jul 24, stale by Aug 14 | No event-card media promoted from this bounded sample | Checked; no direct `Metavirus` mention observed | LCC/community meetup route; stale host/location chatter proves channel value but creates no current Signal/Event |
| Legendary Creature Club | Discord Events | hot_signal_source | Events-mode check failed closed on Aug 14 2026: Discord Events control was not uniquely reachable / not observed | No event detail read; safe guild navigation succeeded before the blocked Events-surface step | No event-card media promoted | Checked; no direct `Metavirus` mention observed | Exact repair item before automation depends on this surface; do not infer no events from failed Events-control visibility |
<!-- discord-frontier-audit:end -->

## Blocked or finite-repair surfaces

These should not be put into the daily agent until the exact blocker is
resolved. A blocked route is not a reason to reopen full store research.

| Surface | Current issue | Next bounded step |
| --- | --- | --- |
| Legendary Creature Club Server Events / Discord Events | Guarded proof failed closed on Aug 14 2026 because no unique Events control was reachable. | Keep the row out of routine daily automation until one exact Events-surface repair proof succeeds. |
| Hobby Overflow Discord | Invite-gated / blocked-TBD profile. | One finite invite/session repair attempt if the user cares about this store's Discord texture. Otherwise leave as known route, blocked content. |
| Paper Hero's Huntington Beach Magic channel | Watchlist row is blocked/TBD despite a manual-session proof. | One exact channel-access repair proof before any recurring monitoring. |
| ProjectCCG and Magic & Monsters isolated-profile reruns | Prior guarded runs hit Discord acknowledgement/server-selection state before content extraction. | Do not allowlist Discord write-like acknowledgement traffic just to make a read pass. First diagnose route hydration without reading messages. |

## 2026-08-16 classification tighten-up

- Repaired live source-to-entity linkage for the Los Angeles Gayming Society
  Discord profile plus channel source rows, so future surface checks aggregate
  cleanly onto the canonical LAGS community instead of depending on fallback
  matching.
- Demoted MTG OC `#welcome` from daily-hot posture to weekly sample/watch.
- Demoted MTG OC `#questions_comments_suggestions` and `#random` to low-priority
  occasional sample lanes. They remain valid route evidence, but they are not
  worth daily recurring-agent attention.
- Kept MTG OC `#share_feedback_promos` as a useful non-core weekly watch lane
  rather than a primary daily planning surface.
- Paused the separate Legendary Creature Club Server Events / Discord Events row
  as `blocked_tbd` until the exact Events-control repair is proven. The text
  channels remain approved recurring routes.

## Route-captured but not agent-ready

LAGS `#lfg-channel` is not an active repair obligation. Its known route is
preserved in paused state after the bounded August 22 proof; reopen it only if
new channel activity or a changed Discord anchor justifies another attempt.

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

The next Discord automation step is not "discover Discord again." It is the
daily-sweep ladder below. Do not skip ahead to broad automation.

### Daily Discord automation ladder

Phase 0 is complete for the recurring allowlist: bounded manual/guarded proofs
over exact mapped watchlist rows cover MTG OC, Legendary Creature Club channel
rows, Collectors Lounge, and the three proven LAGS routes. LCC's guild Events
surface and LAGS `#lfg-channel` remain excluded.

Phase 1 first-batch proof is complete as of August 15, 2026. Collectors Lounge
was surveyed through guarded UI-native reads of `#announcements`,
`#mtg-announcements-and-events`, `#general`, and `#event-rules`; the watchlist
rows and aggregate surface coverage are updated in Supabase. Outcomes were
quiet coverage for `#announcements`, current useful event-adjacent findings in
`#mtg-announcements-and-events` and `#general`, and stale useful policy context
in `#event-rules`.

Phase 2 is complete enough for local proof: the local micro-sweep script
`scripts/run_discord_daily_survey.mjs` exists. It reads active
`discord_channel_watchlist` rows, applies the v1 allowlist, preflights
`safe_access_mode`, runs the existing guarded UI-native reader, classifies the
bounded window, can update watchlist state, and emits a JSON log. V1 includes
only MTG OC, LCC channel rows that are not `needs_deeper_replay`, and
Collectors Lounge. It supports `--dry-run`, `--plan-only`, `--limit`,
`--surface`, `--write-watchlist`, `--no-signal-writes`, and `--json-log`.
Plan-only, one-row guarded dry-run proof, Collectors scoped dry-run
classification, one-row write-watchlist proof, and overlapping-run lock check
passed on August 15.

Phase 3 full local proof is complete. One-row write-watchlist proof passed on
Collectors `#announcements` with Signal/Event writes disabled. A 12-row MTG OC
+ Collectors write-watchlist proof excluding LCC passed on August 15 in about
3m37s with 0 failed rows. Then eligible LCC channel routes were repaired by
using the documented `Stores/Local` folder hint, and the full v1 allowlist
passed on August 15 in about 4m53s: 16 selected, 16 guarded reads, 16 watchlist
writes, 0 failed rows, 5 quiet coverage, 6 event candidates, 4 stale useful
contexts, and 1 accepted-signal-class finding. Signal/Event writes remained
disabled. The old LCC guild Events row remains excluded as `needs_deeper_replay`.

Phase 4 is GitHub Actions. Only after Phase 3 passes, add
`.github/workflows/daily-discord-survey.yml` with a strict timeout, daily
morning PT schedule, manual dispatch, JSON-log artifact upload, and no commits
of generated logs.

Phase 5 measured expansion began on August 22 with LAGS. A full local pass
proved the prior three-profile set, then a scoped LAGS rerun proved
`#announcements`, `#meet-up`, and `#general` after adding the exact Discord UI
label alias. The final recurring plan contains 16 proven active routes. Add
JJ's, Kingslayer, and Krazy Nick's then completed their one-time preparatory
surveys: five useful routes entered the recurring set and one stale schedule
route was paused. The final recurring plan contains 21 proven routes. Add other
store/community channels only after one bounded proof; do not convert route
visibility alone into recurring monitoring.

### V1 outcome contract

Every automated surface run emits exactly one outcome:

- `accepted_signal`
- `event_candidate`
- `quiet_coverage`
- `blocked_repair`
- `stale_useful_context`

Only current, actionable findings create app-visible Signals or event proposals:
direct `Metavirus` mentions/questions, current/tomorrow meetup coordination,
closures/no-event/cancellation/moved-location notices, concrete dated event
facts, or material access/source-health problems. Quiet, noisy, stale, or
blocked runs update monitoring state only.
