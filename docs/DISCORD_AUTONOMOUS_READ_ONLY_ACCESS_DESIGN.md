# Safe Autonomous Discord Access Design

Last updated: 2026-07-20

Status: design checkpoint plus proof sequence. A real Discord shell-safety test
has passed without reading message content, but no content-read survey has been
approved and no route is certified for research use.

## Product requirement

Manual opening and screenshot-assisted review are emergency fallbacks, not the
intended long-term workflow. The target is a bounded daily or weekly survey that
can revisit known Discord channels without routine user effort and without any
ability to post, react, reply, upload, join, change roles/settings, or otherwise
mutate Discord state.

The 2026-07-20 posting incident establishes an important design rule: read-only
intent and careful prompting are not sufficient. Autonomous Discord access must
be mechanically constrained and must fail closed.

No official Discord bot path is assumed to be available.

## Options considered

### 1. Ordinary browser automation with procedural restrictions

Use the existing signed-in browser, direct URL navigation, DOM focus checks,
and instructions that prohibit typing and clicking.

- Accidental-post prevention: weak. It reduces risk but still exposes write
  controls and depends on the automation honoring behavioral rules.
- User effort: low after login.
- One-time setup: sign in and join/role-select relevant servers.
- Required capability: true URL navigation plus DOM inspection.
- Stop condition: uncertain focus, unexpected page state, or failed navigation.
- Route continuity: good through the existing monitoring map.
- Recurring-survey suitability: inadequate by itself.

Conclusion: useful as one layer, but not safe enough as the complete solution.

### 2. Dedicated isolated Discord-reading browser profile

Create a browser profile used only for surveys. The user performs one-time
login, server joins, and role selection. The profile is never used for normal
Discord participation.

- Accidental-post prevention: moderate alone; strong with the controls below.
- User effort: one-time setup, then only when authentication or a gate changes.
- Required capability: select the dedicated profile and open stable URLs.
- Stop condition: wrong profile, expired session, gate, or missing guard.
- Route continuity: strong through stable IDs and monitoring-map markers.
- Recurring-survey suitability: good as the session container.

Conclusion: recommended foundation, but isolation alone does not remove writes.

### 3. Hardened read-only browser layer

Use the isolated profile with three reinforcing controls:

1. A narrow automation wrapper exposes only `open URL`, `read DOM/text`,
   `screenshot`, and `close`. It exposes no type, paste, keypress, click,
   arbitrary-script, upload, or submission operation to a survey.
2. A local browser extension/content guard loaded at document start disables or
   removes composers and mutating controls, blocks focus and input events on
   editable elements, and publishes a versioned safety heartbeat.
3. A network guard blocks known Discord mutation requests, especially message
   creation/edit/delete, reactions, replies/interactions, typing indicators,
   uploads, invite acceptance, guild joins, role changes, and settings changes.

- Accidental-post prevention: strongest realistic browser-based option. A
  mistake must cross the capability, page, and network guards.
- User effort: one-time login/join/role setup; no per-run channel opening.
- Required capability: dedicated profile support, direct navigation, a
  document-start guard, DOM extraction, and request interception/blocking.
- Stop condition: missing heartbeat, unknown page state, editable control or
  focus, absent network guard, missing target, login/gate, or attempted mutation.
- Route continuity: strong through mapped URLs, IDs, cadence, and markers.
- Recurring-survey suitability: best candidate.

CSS alone is not a safety boundary. Visual removal helps, but the capability and
network layers are required because the page can change and hidden controls or
direct requests may remain possible.

### 4. Read-only extraction from local browser/session data

Read notification databases, browser caches, or local application data without
controlling Discord.

- Accidental-post prevention: potentially excellent.
- User effort: low after setup.
- Required capability: a stable documented local data format.
- Stop condition: encrypted/locked data, unstable formats, partial content, or
  any need to extract credentials or tokens.
- Route continuity: uncertain; caches may omit messages, images, and timestamps.
- Recurring-survey suitability: possible supplement, poor primary path.

Do not inspect cookies, tokens, passwords, or session secrets. Revisit only for
a documented export/cache containing content without credential extraction.

### 5. Exports and notification surfaces

Use user-requested exports, OS/browser notifications, or email notifications.

- Accidental-post prevention: strong.
- User effort: exports are usually periodic/manual; notifications are partial.
- Required capability: a stable export or notification feed.
- Stop condition: stale, incomplete, ambiguous, or inaccessible data.
- Route continuity: partial.
- Recurring-survey suitability: useful supplement, not a complete survey.

## Recommended path

Build a dedicated **Discord Read-Only Survey Profile** using option 3 on top of
option 2.

- The user performs one-time authentication, joins, and role selection.
- The monitoring map supplies exact URLs, cadence, priority, and resume markers.
- The survey receives a read-only browser capability, not generic controls.
- A safety extension disables mutating UI and exposes a versioned heartbeat.
- A network guard blocks mutation endpoints/methods and logs blocked attempts.
- The runner verifies profile, URL, heartbeat, non-editable focus, network guard,
  and expected page structure before extraction.
- It extracts bounded visible text, timestamps, links, and image metadata/OCR
  inputs without browsing general history indefinitely.
- Any uncertainty stops the channel as `blocked_unsafe_method`; there is no
  fallback to ordinary browser interaction.

This removes routine opening work from the user while retaining a one-time and
exception-only user role.

## Failure-closed contract

An autonomous run must stop the affected channel when any of these occurs:

- dedicated profile cannot be proven;
- safety extension or network guard heartbeat is missing/version-mismatched;
- direct channel URL/ID is absent;
- page is not the expected Discord channel surface;
- an enabled composer, textbox, contenteditable element, upload, reaction,
  reply, join/invite, role, or settings control is detected;
- focus is on an editable element;
- login, invite, consent, CAPTCHA, age, or role gate appears;
- extraction requires a click, keypress, paste, or arbitrary page script;
- a mutation request is attempted, even if blocked;
- Discord changes enough that selectors or request rules are unknown.

Failure means a recorded blocked result and no improvisation.

## Small next proof-of-safety test

The first test must not open Discord or inspect real Discord content.

Create a local fixture with Discord-like safety properties: a message list,
contenteditable composer, send, upload, reaction, reply, invite/join, role, and
settings controls, plus mock mutation endpoints.

The test should prove:

1. The runner opens the fixture by direct URL and extracts allowed text/times.
2. Its API has no typing, paste, keypress, click, upload, submit, or arbitrary
   script capability.
3. The page guard disables/removes every mutating control before extraction and
   prevents editable focus.
4. Synthetic input/submission attempts from the test harness are rejected.
5. Mock POST/PUT/PATCH/DELETE mutation requests are blocked and logged.
6. Removing a heartbeat, adding an enabled composer, focusing an editable
   element, or changing the page signature fails closed before extraction.
7. Failed direct navigation records a blocked result without fallback action.

Only after acceptance should a separately approved protocol test consider the
real Discord shell. It should open one mapped channel directly, verify guards,
extract only non-message page identity metadata, and stop. Promotion to
`direct_navigation_verified` requires acceptance of that later test.

## Deferred implementation

This checkpoint does not create the profile, install guards, inspect Discord,
run a live test, certify routes, build scheduling, or change Supabase access
modes. Existing routes retain their current safe modes until the proof sequence
succeeds.

## 2026-07-20 hardening update

The first two implementation proofs are complete without opening Discord.

- Local fixture proof:
  `research/runs/2026-07-20-discord-readonly-local-fixture-proof.md`
- Production-form hardening:
  `research/runs/2026-07-20-discord-readonly-production-hardening.md`

The reusable guard lives in `scripts/discord_readonly_guard.mjs`. It provides
the narrow shell-navigation surface, document-start input suppression,
editable-focus checks, and mutation request blocking/logging.

The dedicated workspace scaffold lives under ignored `work/discord-readonly/`
and is created by `scripts/discord_readonly_profile_setup.mjs`. It is not a
live Discord session and does not authorize Discord access.

The next possible step is the separately approved shell test in
`docs/DISCORD_REAL_SHELL_TEST_PLAN.md`. That test must not inspect message
content or create research findings.

That shell test was attempted once against the mapped Paper Hero Discord route
and initially failed closed because the checker did not detect enough
server/channel/main shell markers. The follow-up shell-identity iteration now
passes using non-message evidence: the final URL route IDs match the expected
mapped guild/channel IDs and the Discord app shell mounts. The guard itself
loaded, mutating controls were not enabled, editable focus was absent, and a
Discord-shaped mutation request was blocked/logged. No message content was read
and no route was promoted.

The next iteration, if approved, should be a tiny content-read pilot that proves
bounded extraction can read only the intended channel content without exposing
any mutating capability. It should not create Signals, source updates, event
updates, or route promotions until the user accepts the safety result.
