# Discord real-shell safety test plan

Last updated: 2026-07-20

Status: protocol-only plan. Do not run without explicit user approval.

## Purpose

The local fixture proof showed that the read-only guard architecture can prevent
posting-style failures in a controlled page. The next possible test is a narrow
real-Discord shell test that proves only whether the production guard can open a
known Discord channel shell safely.

This test must not inspect message content, summarize research findings, create
Signals, update events, or promote routes to `direct_navigation_verified` until
the shell safety result is separately accepted.

## Preconditions

- Discord research and surveying remain paused.
- The dedicated local workspace exists under `work/discord-readonly/`.
- The read-only guard layer is loaded before any page script.
- Mutation request blocking is active before navigation.
- The exact target channel URL is selected from the monitoring map.
- The user has explicitly approved this shell test.

## Allowed test actions

- Start the dedicated isolated profile.
- Open one exact Discord channel URL through direct URL navigation only.
- Verify the page host and shell identity.
- Verify the read-only guard heartbeat.
- Verify no editable element is focused.
- Verify composers and mutating controls are disabled.
- Verify mutation requests would be blocked and logged if attempted.
- Stop and close the browser context.

## Forbidden test actions

- Do not read, summarize, OCR, copy, or extract message content.
- Do not click inside message views.
- Do not type, paste, press Enter, or use keyboard navigation in Discord.
- Do not click send, reply, react, upload, join, role, invite, settings, or
  notification controls.
- Do not join servers, accept invites, change roles, change settings, or send
  any request that can mutate Discord state.
- Do not create Signals, event rows, source rows, or research conclusions from
  the shell test.

## Pass conditions

- The dedicated profile is used.
- The exact direct URL opens without page-body interaction.
- The expected Discord shell is reachable.
- The read-only guard heartbeat is present and versioned.
- No enabled composer, textbox, upload, reply, react, send, join, role, invite,
  or settings control is detected.
- No editable element has focus.
- No mutation request is sent.
- No external Discord state is changed.

## Fail-closed conditions

Stop immediately and record the failure if:

- the target URL is absent or ambiguous;
- the wrong browser profile opens;
- the guard heartbeat is missing or mismatched;
- Discord shows login, invite, role, verification, CAPTCHA, or consent gates;
- any composer or mutating control remains enabled;
- focus is on an editable element;
- any mutation request is attempted, even if blocked;
- the page layout is too unexpected to verify safely.

## Output

The shell-test run note must record:

- target route/channel;
- access mode used;
- whether the dedicated profile was used;
- whether Codex performed any Discord navigation;
- whether message content was intentionally not inspected;
- pass/fail result for each guard;
- blocked mutation log count;
- confirmation that no external Discord state was changed;
- whether a later content-free rerun, route promotion, or production survey
  remains blocked.
