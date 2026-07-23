# Discord operational signal survey

Date: 2026-07-22  
Mode: bounded routine survey  
Access method: guarded UI-native navigation from Discord `@me` using the isolated
Discord-read profile

## Purpose

Run one small practical Discord signal survey using only already verified safe
surfaces. This was not route discovery, broad Discord research, daily automation,
or app work.

The survey looked for sparse, planning-useful findings:

- happening-now / tonight / this-week events;
- Discord Events tab items;
- cancellations, reopenings, or operational changes;
- prerelease, draft, sealed, Commander specials;
- LFG / meetup signals;
- turnout, proxy, power-level, newcomer, or solo-arrival texture;
- contradictions with the app calendar.

Routine chatter, stale announcements, unchanged weekly schedules, product-only
posts, and known negative-fit material were not promoted.

## Safety result

All inspected surfaces used the existing guarded method:

- started from Discord `@me`;
- used exact mapped guild/channel or guild Events identity;
- used no typing, paste, search, keyboard navigation, coordinate guessing, post,
  reply, reaction, upload, RSVP, join, role, or settings action;
- kept guard heartbeat present;
- kept editable focus absent;
- kept mutating controls disabled;
- blocked Discord telemetry and expected client state or acknowledgement attempts
  where they appeared;
- observed no successful prohibited mutation responses;
- preserved unchanged unread/mention indicators where observable.

No external Discord state changed.

## Surfaces checked

| Surface | Result | Bounded window | Disposition |
| --- | --- | --- | --- |
| Legendary Creature Club `Discord Events` | Safe summary read. Visible summary still showed `Happening Now / GOOD Magic / Good Time`. | Guild-level Events summary only | Useful but extremely short-lived. Prepare optional time-boxed Signal only if still actionable; otherwise preserve as proof/no-action. |
| Collectors Lounge `#mtg-announcements-and-events` | Safe five-message read. | 2026-07-21 18:19 PT to 2026-07-21 19:41 PT | Quiet. No new current planning signal. |
| JJ's Collectibles `#magic-announcements` | Safe five-message read. | 2026-07-21 19:49 PT to 2026-07-21 22:06 PT | Useful branch-risky Orange schedule lead. Do not attach to Garden Grove or apply live until Orange identity is resolved. |
| ProjectCCG `#mtg-announcements` | Safe five-message read. | 2026-06-17 to 2026-06-29 | Stale / already-covered style material. No current write. |
| Magic & Monsters `#shop-schedule` | Safe five-message read. | 2026-06-01 | Quiet/stale. No new current planning signal. |
| Krazy Nick's `#weekly-event-schedule` | Safe five-message read. | 2024-06-19 to 2024-11-08 | Stale source-health result. No current event or Signal. |

## Useful findings

### Legendary Creature Club

The Discord Events surface again showed:

- state: `Happening Now`;
- title: `GOOD Magic`;
- location label: `Good Time`;
- hosting community: Legendary Creature Club.

This is a real high-signal surface result. It is also same-day and short-lived.
The event should not linger in live Signals after its window passes. If applied
at all, it should expire quickly and use only the verified summary fields unless
a later safe detail read confirms more.

### JJ's Collectibles

The visible window included a forwarded current-week Orange schedule:

- Wednesday Night Commander, free entry, open play, Bracket 2/3 encouraged,
  check-in 6:30 PM, start 7:00 PM;
- Friday Night Magic, free entry, open play, Bracket 3/4 encouraged,
  check-in 6:30 PM, start 7:00 PM;
- Casual Saturday Night Commander, free entry, Bracket 2-4, check-in 6:30 PM,
  start time visible but truncated in the bounded extraction.

This is potentially useful for the landscape, but it remains branch-risky. It
must not be merged into JJ's Garden Grove or written as canonical event truth
without resolving the Orange branch/entity question.

## No-write results

- Collectors Lounge: quiet this run.
- ProjectCCG: stale/currently non-actionable in the inspected window.
- Magic & Monsters: quiet/stale this run.
- Krazy Nick's: stale source-health result; newest visible channel content from
  2024-11-08.

Quiet and stale run results do not lower durable route value by themselves.

## Proposal disposition

Prepared proposal:

`supabase/proposals/discord-operational-survey-cursor-and-signal-review-2026-07-22.json`

The proposal is review-only and has not been applied. It contains:

- monitoring-map cursor/result updates for the inspected surfaces;
- a time-boxed Legendary Creature Club Signal candidate that should be applied
  only if still current enough to be useful;
- an explicit no-write/TBD disposition for the JJ's Orange schedule until branch
  identity is resolved.

No live Supabase write was performed.
