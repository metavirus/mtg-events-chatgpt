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

- Neither route graduates. The run result for both was
  `server_rail_not_detected` / `blocked_for_this_run`; that transient result
  does not itself establish or change a durable access mode.
- The `manual_open_required` values already present in the monitoring map
  reflect the earlier proven signed-in in-app-browser access path. They were
  not newly justified by this failed run and must not be read as route
  downgrades.
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

## Diagnostic control rerun (2026-07-22)

The exact persistent isolated profile was confirmed as
`work/discord-readonly/profile`. It was created on July 20 and was reused by
the successful Collectors Lounge and JJ's runs; this diagnostic did not inspect
cookies, credentials, tokens, or other private session data. The runner used a
fixed 1440 x 900 viewport and proved an authenticated Discord account shell.

Collectors Lounge was then used as the required control. After a bounded shell
hydration wait of about 1.35 seconds, the server rail exposed 24 guild/folder
items, including the exact Collectors guild ID. A rail-only screenshot
confirmed that the Stores/Local folder and server icons were visibly present.
This establishes that the earlier ProjectCCG/Magic & Monsters "no controls"
result was a hydration/detection failure, not evidence that those routes had
lost access.

The Collectors control did not complete, so the two target routes were not
retried. During exact channel selection Discord attempted:

`PATCH /api/v9/users/@me/settings-proto/2`

The guard blocked it. The request is now classified as a client-settings
mutation, remains fatal, and was not allowlisted. No message content was read,
the observable guild indicator stayed unchanged, and no external Discord state
changed.

Exact failure layer: authenticated profile and server-rail detection passed;
guarded channel navigation stopped on a newly observed Discord client-settings
write. This is a control/harness boundary, not a ProjectCCG or Magic & Monsters
route result. Their long-term access modes and route values remain unchanged.

## Blocked-client-state continuation test (2026-07-22)

The guard now distinguishes three relevant mutation classes:

- `blocked_expected_ack` for the exact message-acknowledgement endpoint;
- `blocked_expected_client_setting` only for `PATCH` to the exact normalized
  endpoint `/api/v9/users/@me/settings-proto/2` during channel selection; and
- `blocked_unknown_or_prohibited_mutation` for other state-changing requests.

Both recognized classes remain blocked before transmission. They may be
nonfatal only after exact route identity and all page-safety checks pass. The
runner records method, normalized endpoint, body-presence Boolean, body byte
length, stage, and block time; it does not record the opaque body, headers,
cookies, credentials, or tokens.

| Route | Shell/content result | Blocked acknowledgement | Blocked client setting | Latest run result | Unread state | External state |
| --- | --- | --- | --- | --- | --- | --- |
| Collectors Lounge `#mtg-announcements-and-events` | Exact shell plus five-message bounded read succeeded | None | None attempted | `quiet` | Unchanged | Unchanged |
| ProjectCCG `#mtg-announcements` | Exact shell plus five-message bounded read succeeded | One, blocked before transmission | None attempted | `useful_finding` (not promoted or written) | Unchanged | Unchanged |
| Magic & Monsters `#shop-schedule` | Exact shell plus five-message bounded read succeeded | One, blocked before transmission | None attempted | `quiet` | Unchanged | Unchanged |

Only telemetry plus the two recognized acknowledgement attempts occurred. No
unknown/prohibited mutation was attempted. The exact settings PATCH did not
recur in any of these runs, so its runtime nonfatal-continuation path is
implemented and deterministically classified but is not claimed as exercised
against a live recurrence. The earlier diagnostic remains proof that the PATCH
was blocked. These later runs separately prove all three intended channels can
render and support bounded reads when Discord does not make that attempt; they
do not prove same-attempt rendering after the blocked PATCH.

No research, Signal, Event, Source, Places, monitoring-map, or canonical data
write was made. The ProjectCCG useful classification remains only in the local
ignored safety log pending a separately authorized research review.
