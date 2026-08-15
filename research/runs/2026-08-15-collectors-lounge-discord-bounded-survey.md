# 2026-08-15 Collectors Lounge Discord bounded survey

Purpose: finish the first-batch Discord proof needed before building the local
daily micro-sweep script. Scope was limited to mapped Collectors Lounge
watchlist rows with `ui_native_navigation_verified` access.

## Result

All four mapped channels were reached by the guarded UI-native reader through
the safe `@me -> Stores/Local -> Collectors Lounge -> exact channel` route. No
typing, posting, reacting, keyboard navigation, coordinate guessing, or message
area interaction was used. The harness reported no external Discord state
change and no prohibited successful responses.

| Channel | Log | Window | Outcome |
| --- | --- | --- | --- |
| `#announcements` | `work/discord-readonly/logs/ui-native-content-2026-08-15T17-20-23-610Z.json` | 3 messages, July 3-July 13, 2026; last seen `1526022708767490048` at `2026-07-13T00:29:25.901Z` | Quiet coverage; no current operational finding. |
| `#mtg-announcements-and-events` | `work/discord-readonly/logs/ui-native-content-2026-08-15T17-20-48-123Z.json` | 5 messages, August 11-August 14, 2026; last seen `1537989747828588676` at `2026-08-15T01:02:10.350Z` | Useful current event signal: Casual Commander announced for August 14 at 6:30, plus draft/format Q&A. |
| `#general` | `work/discord-readonly/logs/ui-native-content-2026-08-15T17-22-29-353Z.json` | 5 messages, August 9-August 13, 2026; last seen `1537572127480217631` at `2026-08-13T21:22:41.900Z` | Useful event-adjacent chatter: Friday Commander confirmation and prerelease signup question. |
| `#event-rules` | `work/discord-readonly/logs/ui-native-content-2026-08-15T17-22-52-859Z.json` | 4 setup/rules messages, August 25-September 23, 2025; last seen `1419954354529505371` at `2025-09-23T07:51:39.596Z` | Stale useful policy context for Commander, proxy, and Two-Headed Giant guidance; not a current event. |

## Persistence

- Updated the four corresponding `discord_channel_watchlist` rows with
  `last_checked_at`, `last_seen_message_id`, `last_seen_message_at`,
  `latest_run_result`, and concise notes.
- Recorded aggregate Supabase surface coverage for
  `venue:collectors-lounge-cypress`, surface `discord`, disposition
  `inspected_current`, idempotency key
  `collectors-lounge-discord-bounded-survey-2026-08-15-v1`.

## Frontier implication

Collectors Lounge is ready for the v1 daily Discord micro-sweep allowlist. The
next step is Phase 2: build `scripts/run_discord_daily_survey.mjs` over MTG OC,
eligible LCC channel rows, and Collectors Lounge only, with Signal/Event writes
disabled by default during the local proof.
