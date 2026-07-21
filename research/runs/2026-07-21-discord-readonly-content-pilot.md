# Discord read-only content pilot

- Date: 2026-07-21
- Pass type: tiny guarded content-read pilot
- Real Discord accessed: yes
- Target route: Paper Hero's Games mapped Magic channel
- Target URL:
  `https://discord.com/channels/451625704723841024/1323064182660399184`
- Discord message content inspected: no
- Discord research performed: no
- Signals/events/source updates created: no
- Supabase writes performed: no
- Route promoted to `direct_navigation_verified`: no

## Purpose

This was the first post-shell-safety content-read pilot. The goal was to prove
whether the dedicated isolated profile and read-only guard can safely extract a
small bounded set of visible messages from one mapped Discord channel without
typing, pasting, clicking mutating controls, reacting, replying, uploading,
joining, changing roles/settings, or broadening to other servers.

## Method

The pilot used `scripts/discord_readonly_content_pilot.mjs`, which:

- opens one exact Discord channel URL by direct navigation;
- uses the ignored dedicated profile workspace under `work/discord-readonly/`;
- loads the read-only guard before navigation;
- keeps Discord mutation request blocking active;
- verifies shell route identity before content extraction;
- verifies no editable focus, no enabled mutating controls, no login/invite
  gate, and a present guard heartbeat;
- extracts only a small bounded set of visible message rows if all guards pass.

## Result

Final result: failed closed.

### Attempt 1: before isolated-profile setup

The browser was redirected to:
`https://discord.com/login?redirect_to=%2Fchannels%2F451625704723841024%2F1323064182660399184`

Failure reason:

- login gate detected in the dedicated isolated profile.

Safety results:

- guard heartbeat was present;
- no editable element had focus;
- no enabled composer or mutating controls were detected;
- no message content was extracted;
- no research artifacts were created;
- no external Discord state changed;
- route/channel identity was not preserved because the final URL was the login
  redirect rather than the mapped channel URL.

Network guard result:

- four Discord telemetry-style `science` POST requests were blocked/logged.
- no message, reply, reaction, upload, join, role, or settings mutation was sent.

### Attempt 2: after user completed isolated-profile setup

The guarded pilot reached the intended Discord route shell:
`https://discord.com/channels/451625704723841024/1323064182660399184`

Shell identity evidence:

- page title identified Discord, the Paper Hero's Games server, and the mapped
  Magic channel;
- expected guild ID `451625704723841024` matched the actual route;
- expected channel ID `1323064182660399184` matched the actual route;
- app, guild, channel, main shell, and document-ready markers were present;
- guard heartbeat was present;
- no editable element had focus;
- no enabled composer or mutating controls were detected.

Failure reason:

- the guard detected a gated/invite-style state and blocked a Discord
  membership/lurker request:
  `PUT /api/v9/guilds/451625704723841024/members/@me?lurker=true`.
- two telemetry-style `science` POST requests were also blocked/logged.

Safety result:

- no message content was extracted;
- no research findings were produced;
- no Signals, events, source notes, or route promotions were created;
- no external Discord state changed.

## Findings

Research classification: `blocked`.

No event, cancellation, prerelease, draft, Commander, turnout, proxy,
power-level, LFG, or community-texture finding was produced because no channel
message content was safely visible.

No Supabase proposal is warranted from this pilot.

## Decision

The content-read mechanism correctly failed closed twice:

- first when the isolated profile was not authenticated for the mapped channel;
- second when the profile could prove the intended Paper Hero route shell but
  Discord attempted a guarded membership/lurker mutation before content could
  be safely read.

The next safe step is not a broader survey. It is a narrow safety-design decision
about how to handle Discord route shells that are visible but trigger
membership/lurker or invite-style requests before message extraction.

Options to consider before any retry:

1. require the user to complete any server/member visibility setup manually in
   the isolated profile, then rerun the same single-channel pilot;
2. keep this Paper Hero route as `blocked_unsafe_method` until a safer
   non-mutating read path is designed;
3. test a different already-joined route only if it can be selected without
   broadening into a survey.

Do not promote any route or resume broad Discord surveying from these failed
closed pilots.

## Follow-up: approved one-retry rule and mapped-route proof attempts

After the Paper Hero failure, the safety protocol was refined to handle the
known ephemeral Discord membership/lurker interstitial without clicking through
or allowing the request:

1. block and log the `members/@me?lurker=true` request;
2. close the isolated read context;
3. reopen the exact same mapped channel URL once by direct navigation;
4. continue only if the route opens cleanly under guard;
5. if the same gate recurs, mark the channel `blocked_for_this_run` without
   downgrading the route's durable long-term value.

The harness was updated to implement that one-retry rule and then tested
against three exact mapped channels that were expected to be good candidates for
a tiny content-read proof:

| Route | Mapped channel URL | Outcome | Content read? | External Discord state changed? |
| --- | --- | --- | --- | --- |
| JJ's Collectibles `#magic-announcements` | `https://discord.com/channels/1055756955043495946/1354561517160239296` | Route identity proved on both attempts; membership/lurker request recurred after retry; marked `blocked_for_this_run`. | No | No |
| Magic & Monsters `#shop-schedule` | `https://discord.com/channels/690253341330374772/928555906017398785` | Route identity proved on both attempts; membership/lurker request recurred after retry; marked `blocked_for_this_run`. | No | No |
| Collectors Lounge Cypress `#mtg-announcements-and-events` | `https://discord.com/channels/1128125427257454672/1128125617683050597` | Route identity proved on both attempts; membership/lurker request recurred after retry; marked `blocked_for_this_run`. | No | No |

Across all three follow-up attempts:

- the dedicated isolated Discord-read profile was used;
- navigation used only exact mapped channel URLs;
- no typing or pasting into Discord occurred;
- the guard heartbeat was present;
- no editable element had focus;
- no enabled composer/send/reply/react/upload/join/settings controls were
  detected;
- the route IDs matched the target guild/channel IDs;
- Discord telemetry-style `science` POSTs and the membership/lurker request were
  blocked/logged;
- no message content was extracted;
- no Signals, event rows, source notes, route promotions, or research findings
  were created;
- no external Discord state changed.

### Current blocker

The blocker is no longer route recovery or shell identity. The guarded browser
can reach the intended Discord shells and prove the target route, but Discord
attempts a membership/lurker-style request before message content becomes safely
readable. Under the accepted safety rules, that request is not allowed
automatically.

That means the lane is safe but not yet content-useful. Before a tiny 3-5
channel survey can run, one of these must happen:

1. the isolated profile must be manually made a full member/visible participant
   for the target servers so the same direct-channel URLs open without the
   `members/@me?lurker=true` request; or
2. the project must make a deliberate safety decision that the specific
   Discord membership/lurker request is acceptable to allow in a narrowly
   guarded context; or
3. a different non-mutating read path must be designed.

Until one of those is accepted, the monitoring map remains useful for exact
targets, but guarded content-read surveying remains blocked before message
inspection.
