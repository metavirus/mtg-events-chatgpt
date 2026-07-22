# Discord acknowledgement state-machine test

Date: 2026-07-21

Mode: bounded safety/access experiment. No survey expansion and no live
research, Event, Signal, Source, Places, or assessment write.

## Objective

Classify the two message acknowledgement requests that stopped the accepted
UI-native replication pass, keep them blocked at the network layer, and retest
only ProjectCCG `#mtg-announcements` and Magic & Monsters `#shop-schedule`.

## Acknowledgement classification

The predecessor logs prove two exact requests:

| Server | Method | Normalized endpoint | Channel ID | Message ID | Body present | Stage | Prior effect |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ProjectCCG Online Community | `POST` | `/api/v*/channels/{channel_id}/messages/{message_id}/ack` | `1449163402026024982` | `1468054340735598798` | Unknown; the predecessor logger did not record body presence | Server selection | The blocked request stopped shell acceptance before the mapped target channel was opened. |
| Magic & Monsters | `POST` | `/api/v*/channels/{channel_id}/messages/{message_id}/ack` | `928555906017398785` | `1511055000611066007` | Unknown; the predecessor logger did not record body presence | Server selection | The blocked request stopped shell acceptance. |

The endpoint shape is a message read-state acknowledgement. It is distinct
from message creation/edit/reply, reactions, uploads, membership/lurker,
invite, role, settings, presence, and telemetry endpoints. The guard still
blocks it; no acknowledgement is allowed to reach Discord.

The runner now records method, normalized endpoint, channel/message IDs,
body-presence as a Boolean, navigation stage, and block time. It never records
the request body, headers, credentials, cookies, tokens, or unrelated traffic.
An exact acknowledgement can be treated as `blocked_expected_ack` only when it
occurs during server/channel navigation or message rendering and its channel is
structurally proven inside the selected guild. Any other blocked request, route
ambiguity, gate, editable focus, enabled mutator, or missing guard remains
fatal.

## Retest results

Both retests began at Discord `@me` in the isolated profile with the guard
heartbeat present, no editable focus, zero enabled mutating controls, direct
UI-native navigation only, and mutation blocking active.

| Route | Attempts | Result | Acknowledgement observed | Content read | External state changed |
| --- | --- | --- | --- | --- | --- |
| ProjectCCG `#mtg-announcements` | Initial run plus one clean close/reopen | `blocked_for_this_run` at the home shell because Discord rendered no server/folder controls | No | No | No |
| Magic & Monsters `#shop-schedule` | One run | `blocked_for_this_run` at the same home-shell boundary | No | No | No |

The isolated client was authenticated (`Discord | Friends`) but exposed only
the system Add a Server, Discover, and Download Apps controls. It did not expose
the `Stores/Local` folder or any guild controls, so structural navigation could
not begin. This was a profile-wide shell/hydration condition rather than a
route-specific acknowledgement result.

Because the guild controls were not visible, unread/mention state for the two
target guilds was not observable. The run did not click badges or use Discord
read state as a cursor. Existing monitoring-map `last_seen_message_at` values
remain unchanged.

## Decision

- Neither route graduates. Both remain `manual_open_required` and
  `blocked_for_this_run` for this experiment.
- The acknowledgement remains blocked. The runner has a narrow, fail-closed
  `blocked_expected_ack` classification ready for a future bounded test, but
  this run did not exercise it and therefore does not globally graduate that
  behavior.
- The prior acknowledgement classification is preserved; the new failure does
  not erase it or lower long-term route value.
- No content classification was possible because no messages were read.
- No research proposal was created.

## Safety confirmation

- No typing, pasting, keyboard navigation, Discord search, coordinate guessing,
  message-area interaction, badge click, or mutating-control click occurred.
- No blocked request received a successful response.
- No Discord message content was read or stored.
- No external Discord state changed.
