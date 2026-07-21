# Discord real-shell safety test

- Date: 2026-07-20
- Pass type: protocol-only shell safety test
- Real Discord accessed: yes, shell only
- Discord message content inspected: no
- Discord research performed: no
- Signals/events/source updates created: no
- Monitoring-map access modes changed: no
- Route promoted to `direct_navigation_verified`: no

## Target

- Route: Paper Hero's Games Discord mapped channel
- URL: `https://discord.com/channels/451625704723841024/1323064182660399184`
- Selection basis: existing monitoring-map direct channel URL; not browser
  history and not the incident channel.

## Method

The test used the ignored dedicated profile workspace:
`work/discord-readonly/profile`.

The runner:

- opened one exact Discord channel URL by direct navigation;
- loaded the read-only page guard before navigation;
- installed Discord mutation request blocking before navigation;
- read only shell/safety metadata: URL, host, title, guard heartbeat, enabled
  mutator count, editable-focus state, gate booleans, and shell-marker booleans;
- did not extract, copy, summarize, or store message content;
- issued one blocked proof request to a Discord-shaped message endpoint so the
  network guard could prove mutation blocking without reaching Discord.

## Result

Initial authoritative result: failed closed.

Safety checks that passed:

- dedicated profile path was used;
- direct navigation opened the target URL;
- read-only guard heartbeat was present;
- no editable element had focus;
- no enabled composer or mutating controls were detected;
- one Discord-shaped message POST was blocked and logged;
- no external Discord state changed;
- no message content was inspected.

Failed condition:

- expected Discord shell markers were not detected. The page reached
  `discord.com` with title `Discord`, but the checker did not see enough
  server/channel/main shell structure to prove that the expected channel shell
  had rendered safely.

## Correction made during the test

The first implementation of the real-shell runner treated host/title plus guard
success as enough. That was too loose for the shell-test plan. The runner was
corrected so missing Discord shell markers fail closed.

## Decision

This test proves that the dedicated profile plus guard can open Discord without
reading message content and can block a Discord-shaped mutation request.

It does not yet prove that the expected channel shell is reachable in a usable
way. A later content-read pilot is not justified yet.

The next safe step, if the user wants to continue this lane, is a second
protocol-only shell iteration that improves shell identity detection without
reading message text. It should still avoid Signals, events, research notes,
source updates, and route promotion until accepted.

## 2026-07-21 shell-identity rerun

The shell-identity checker was revised to use non-message evidence:

- final URL route IDs must match the selected mapped guild/channel IDs;
- Discord's app shell mount must be present;
- guard heartbeat, no editable focus, no enabled mutators, no login/invite gate,
  and mutation blocking must still pass.

The same Paper Hero route was rerun:
`https://discord.com/channels/451625704723841024/1323064182660399184`.

Rerun result: passed shell safety.

What was proven:

- the dedicated isolated profile opened;
- direct navigation preserved the exact expected guild ID
  `451625704723841024` and channel ID `1323064182660399184`;
- the Discord app shell mounted;
- the read-only guard heartbeat was present;
- no editable element had focus;
- no enabled composer or mutating controls were detected;
- one Discord-shaped message POST was blocked and logged;
- no external Discord state changed.

What was still not done:

- no Discord message content was read, extracted, summarized, stored, or used;
- no research findings were created;
- no Signals, events, sources, or monitoring-map access modes were changed;
- no route was promoted to `direct_navigation_verified`.

Decision after rerun: a later content-read pilot is now technically plausible,
but still requires separate approval and should remain bounded to non-mutating
read/extraction behavior.
