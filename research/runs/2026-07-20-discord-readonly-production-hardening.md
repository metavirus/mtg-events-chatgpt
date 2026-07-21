# Discord read-only production-form hardening

- Date: 2026-07-20
- Pass type: safety infrastructure
- Real Discord accessed: no
- Logged-in Discord session used: no
- Discord message content inspected: no
- Monitoring-map access modes changed: no

## Purpose

Move from a local proof fixture toward production-form safety infrastructure
without opening Discord. This tranche creates the reusable guard layer, creates
an ignored dedicated local profile workspace, and records the tiny real-Discord
shell test plan that still requires separate user approval.

## Artifacts

- `scripts/discord_readonly_guard.mjs`
- `scripts/discord_readonly_profile_setup.mjs`
- `scripts/discord_readonly_production_guard_proof.mjs`
- `docs/DISCORD_REAL_SHELL_TEST_PLAN.md`
- local ignored workspace: `work/discord-readonly/`

## Guard layer now available

The production-form guard module provides:

- direct Discord channel URL shell navigation only;
- no survey-facing typing, paste, keypress, click, upload, submit, or arbitrary
  script capability;
- document-start composer and mutating-control disabling;
- editable-focus detection;
- mutation request blocking/logging for Discord API paths involving messages,
  typing, interactions, attachments, invites, joins, roles, settings, and
  related user/guild/channel mutation surfaces;
- fail-closed checks for missing guard heartbeat, enabled mutating controls,
  editable focus, login/invite/role/verification gates, unexpected host, or
  absent exact channel URL.

## Profile workspace

`scripts/discord_readonly_profile_setup.mjs` creates an ignored local workspace
under `work/discord-readonly/`:

- `profile/` for a future isolated browser profile;
- `logs/` for future safety-test logs;
- `profile-manifest.json` documenting that live Discord access is not yet
  authorized.

No cookies, sessions, screenshots, or personal state are committed.

## Production-guard proof

`scripts/discord_readonly_production_guard_proof.mjs` ran against the existing
local Discord-like fixture only. It did not open Discord.

Automated result: all production-guard checks passed.

Checks performed:

- production guard heartbeat installed and mutating controls disabled;
- survey-facing surface exposes only `openShell`;
- non-Discord targets are rejected before navigation;
- Discord-shaped mutation requests are blocked and logged;
- missing guard fails closed;
- editable focus fails closed;
- gated state fails closed.

Automated result detail: 7 checks passed, 0 failed.

Two implementation issues were caught and fixed during this local proof:

- the network guard now routes only Discord hosts rather than all traffic, so it
  does not stall unrelated local fixture navigation;
- the page guard is idempotent, so its MutationObserver does not loop by
  repeatedly writing the same disabled attributes.

## Real-Discord shell test plan

The shell test is recorded in `docs/DISCORD_REAL_SHELL_TEST_PLAN.md` but was
not run.

If later approved, that test must inspect only shell/identity safety metadata:

- whether the dedicated profile opens Discord;
- whether one exact mapped channel URL reaches the expected shell;
- whether guard heartbeat, disabled mutators, focus checks, gate checks, and
  mutation blocking pass.

It must not read messages, summarize content, create Signals, update research,
or promote routes to `direct_navigation_verified` until separately accepted.

## Limitations

- The production guard is proven against the local fixture, not Discord's live
  DOM or API behavior.
- A future real-shell test still needs a dedicated profile launch path and
  explicit user approval.
- Real Discord surveying remains paused.
