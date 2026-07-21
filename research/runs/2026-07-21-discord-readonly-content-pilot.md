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
