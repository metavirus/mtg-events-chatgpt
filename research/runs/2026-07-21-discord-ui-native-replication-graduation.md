# Discord UI-native replication and graduation test

Date: 2026-07-21

Mode: bounded guarded protocol test with a five-message read only after a
separate shell pass succeeded.

## Objective

Test whether the accepted Collectors Lounge access pattern is reproducible:

`Discord @me -> structurally proven server -> structurally proven channel`

The test used the dedicated isolated Discord-read profile. The guard was
installed before Discord interaction. No typing, pasting, keyboard navigation,
Discord search, coordinate guessing, message-area interaction, or mutating
control was used.

## Routes tested

| Server | Mapped channel | Result | Content read | Lurker/interstitial | External state changed |
| --- | --- | --- | --- | --- | --- |
| JJ's Collectibles | `#magic-announcements` (`1055756955043495946` / `1354561517160239296`) | Shell and bounded content read passed. Exact IDs and visible shell labels matched. | Five recent visible messages | None | No |
| ProjectCCG Online Community | `#mtg-announcements` (`1436522338572046501` / `1463649071485948049`) | Failed closed during server selection. Discord attempted an acknowledgement POST for another channel before the mapped target channel was opened. | No | None | No; request blocked |
| Magic & Monsters | `#shop-schedule` (`690253341330374772` / `928555906017398785`) | Failed closed during server selection. Discord attempted an acknowledgement POST for the mapped channel before shell acceptance. | No | None | No; request blocked |

All stages retained guard heartbeat, no editable focus, and zero enabled
mutating controls. Discord telemetry POSTs were blocked throughout. No
prohibited mutation request received a successful response.

## JJ's bounded finding

The five-message window ran from `2026-07-21T23:19:35.617Z` through
`2026-07-22T02:49:52.281Z`. A current store announcement supplied additional
details for the already-cataloged July 31 `Jumpin' with Jumpstart` event:

- $25 entry;
- 6:30 PM check-in;
- 7:00 PM start;
- casual Marvel Jumpstart play using two packs per participant;
- prizing based on attendance;
- registration code `DWJD483`.

This is not a new event. A reviewable proposal updates the existing series and
occurrence rather than creating a duplicate.

## Graduation decision

Guarded UI-native navigation did **not** graduate to a universal Discord survey
method because only one of the three replication routes passed. The result is
more precise:

- Collectors Lounge and JJ's have independently proven mapped UI-native paths.
- ProjectCCG and Magic & Monsters remain route-specific autonomous-access
  blockers because ordinary server selection can trigger message-acknowledgement
  writes even without message interaction.
- The earlier cold-link `members/@me?lurker=true` condition did not occur in any
  replication route, supporting—but not universally proving—the cold-link
  diagnosis.
- Quiet or blocked results did not lower route value.

The monitoring map now records exact start route, guild/channel IDs, latest
access result, last successful or failed method, and the JJ's resume marker.

## Deferred

- No daily or broad Discord automation.
- No allowlist for message acknowledgements or membership/lurker requests.
- No ProjectCCG or Magic & Monsters content read.
- No live research, Event, Source, Places, Community, or Signal write from this
  run.
- The JJ's event-detail proposal requires separate approval.

