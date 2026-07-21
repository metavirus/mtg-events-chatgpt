# Discord Sweep SOP

This SOP sits beside `research/DISCORD_METHODOLOGY.md`.

The methodology file explains how to reason about Discord evidence.
This file explains how to use Discord efficiently during recurring work.

## Core principle

Discord is high value but expensive.

Do not treat it as a place to browse freely.
Treat it as a targeted signal surface.

## Read-only social-surface safety protocol

Discord is also a live social surface. A mistaken browser action can post,
react, upload, reply, or otherwise change external state from the user's
account. That risk is higher than ordinary website browsing and must be treated
as a hard safety boundary.

Until a pass explicitly satisfies this protocol, **all Discord browser
surveying is paused**.

Manual opening and screenshot/paste review are temporary emergency fallbacks,
not the intended long-term product workflow. The autonomous target is recorded
in `docs/DISCORD_AUTONOMOUS_READ_ONLY_ACCESS_DESIGN.md`: a dedicated isolated
profile, a narrow navigation/extraction-only capability, page-level input
suppression, and network-level mutation blocking. None is certified yet.

### Discord access modes

Every Discord route or channel in the monitoring map must carry an explicit
safe access mode. "Read-only intent" is not an access mode.

Use these values:

- `manual_open_required`
  - The current safe default for accessible Discord content. The user must open
    the exact channel or message, or provide a screenshot/paste. Codex may only
    read visible content and analyze it.
- `direct_navigation_verified`
  - Codex may open the exact direct URL only through a protocol-tested safe
    navigation API that does not synthesize typing, pasting, or keyboard input
    into Discord. No current route should be promoted to this mode until a
    protocol-only safety test proves the method.
- `route_only_tbd`
  - A route exists, but the exact stable channel/message target or safe access
    path is not recovered.
- `join_or_role_gate`
  - The route requires user action such as joining, accepting an invite,
    selecting roles, or requesting access. Codex must stop.
- `blocked_unsafe_method`
  - The route is known, but current tooling cannot reach it without unsafe
    interaction.

Default uncertain Discord routes to `manual_open_required`,
`route_only_tbd`, or `blocked_unsafe_method`; never default them to "try the
browser."

### Hard prohibitions

Do not:

- type Discord URLs into any focused Discord tab where the message composer
  might be active;
- use paste, typing, keyboard shortcuts, or page-body interaction as a Discord
  navigation method;
- send text, upload files, react, reply, mark messages, join voice, change
  settings, join servers, accept invites, or perform any other social action;
- continue after focus, navigation, or access state becomes uncertain.

If the only available way to reach a channel is typing or pasting into the
Discord page, stop and mark the route blocked/TBD.

### Required safe navigation method

Open Discord channel URLs only through a navigation method that cannot submit
text into the Discord page body, such as:

- a browser-control API that directly opens a URL or new tab; or
- a page/navigation API that directly sets the document location without
  synthesizing keystrokes into the page.

Address-bar keyboard simulation is not sufficient unless the tool can prove the
browser chrome address field, not the Discord document, has focus. If that
cannot be verified, do not use it.

If the active browser-control surface does not expose a true direct-navigation
API for the selected Discord tab, Discord inspection is blocked for that pass.

Direct navigation alone does not certify autonomous surveying. Promotion to
`direct_navigation_verified` also requires the accepted proof sequence in
`docs/DISCORD_AUTONOMOUS_READ_ONLY_ACCESS_DESIGN.md`.

### Preflight checklist

Before any Discord pass, confirm and record:

- Discord survey is read-only.
- The exact route/channel target was selected from the monitoring map.
- The target's `safe_access_mode` was checked.
- The stop condition is named before beginning.
- No message composer is focused.
- No typed or pasted text will be sent into the Discord page body.
- No keyboard navigation will be used inside Discord message views.
- No Discord controls will be clicked that can post, react, reply, upload, join,
  change roles, change settings, or otherwise expose the user's account.
- If `manual_open_required`, the user has manually opened the exact
  channel/message or supplied a screenshot/paste.
- If `direct_navigation_verified`, every channel will be opened only by the
  previously verified direct-navigation method.
- If direct navigation fails, the route will be marked blocked/TBD instead of
  improvising.
- Any route requiring interaction that could write or expose the user's account
  will stop for explicit user approval.

### Focus check

Before reading a Discord channel, verify that the current focus is not a message
composer. Acceptable checks include a direct DOM focus check that confirms the
active element is not a textbox/editor/composer, or a tool-level guarantee that
the navigation/read operation does not depend on page focus.

If focus cannot be verified, stop. Do not attempt to "carefully" type, paste,
press Enter, or use shortcut navigation.

### Post-pass proof fields

Every Discord run note must state:

- route/channel inspected;
- access mode used;
- whether the user manually opened it;
- whether Codex performed any Discord navigation;
- useful findings, quiet result, blocked result, or gated result;
- whether an unsafe/gated condition was encountered;
- confirmation that no external Discord state was changed.

Quiet channels should be recorded as quiet for that run only. Do not downgrade a
route's durable value merely because a single bounded inspection found no
useful signal.

### Incident response

If any accidental external mutation happens:

1. stop the pass immediately;
2. do not continue research from the contaminated run;
3. tell the user exactly what happened;
4. do not attempt cleanup unless the user explicitly authorizes it;
5. record a repo-backed incident note and prevention rule before any future
   Discord browser work.

## When Discord should be checked

Check Discord during a first pass only when:

- the store/community has an accessible server
- the server appears relevant to MTG
- or another source routes to Discord as an important operational channel

Check Discord during daily/weekly monitoring only when:

- the server was previously classified as useful
- it belongs to a favorite
- or it has a history of carrying meaningful corrections, LFG, or event graphics

## Discord source roles

Classify each server as one of:

- **official announcements source**
- **schedule graphic source**
- **community/LFG source**
- **mixed official + community source**
- **low-value / sparse source**

Once classified, do not rediscover this from scratch every time.

## Discord/community status ladder

Track Discord/community status separately from the store's overall research
status. A venue may be well assessed while its Discord remains thin, private, or
not worth regular checking; conversely, a Discord may be important enough to
monitor even when the store page does not need a deep research pass.

Use these statuses in run notes, source relationships, assessment notes, or
future structured fields when the source is material:

- `not found`
  - No Discord or comparable community route was found during the baseline
    sweep.
- `route found / not inspected`
  - A Discord, Linktree, Facebook group, or similar community route was found
    and captured when material, but content was not meaningfully reviewed.
- `first-pass weak`
  - A bounded first pass found little usable MTG, event-reliability, LFG,
    newcomer, proxy, turnout, or community-fit signal, or the route appears
    inactive, sparse, inaccessible, off-topic, or not branch-specific.
- `first-pass useful`
  - A bounded first pass found useful planning signals such as current activity,
    MTG discussion, event reminders, LFG, turnout clues, proxy/casual/competitive
    texture, prerelease chatter, or staff/community coordination.
- `deep-reviewed`
  - The route has been reviewed enough to materially support confidence, fit,
    event reliability, cautions, open questions, or recurring monitoring
    priority.
- `monitor regularly`
  - The route is important enough for future daily or weekly checks because it
    may reveal current events, schedule changes, cancellations, turnout,
    prerelease details, or this-week planning signals.

Do not promote everything to `monitor regularly`. Reserve that status for routes
that have already shown ongoing planning value, belong to a favorite or strong
candidate, or are the best known operational source for a store/community.

## First-pass bounded survey order

Use this order every time:

1. server identity and rough scale
2. scheduled events, if present
3. announcements
4. weekly lineup / schedule channel
5. MTG/Commander/EDH section
6. LFG / meetup surfaces

Stop after the server's role is clear.

For promoted or correction-driven passes, also perform one explicit MTG event
check on the most relevant visible surfaces:

- scheduled events
- announcement graphics
- weekly lineup posts
- MTG / Commander announcement lanes

The goal is not free browsing. The goal is to determine whether Discord carries:

- future MTG events not yet captured elsewhere
- clarifications or corrections to website / Wizards / Instagram event reads
- practical meetup signals that materially change the interpretation of an event

## Daily light sweep

For useful servers, daily sweep should check only:

- scheduled events
- announcements
- one MTG / Commander announcement lane
- one LFG / meetup lane, if the server is community-useful

Look only for:

- cancellations
- correction posts
- new event graphics
- same-week meetup/LFG signals
- especially notable new compatibility signals

Do not scroll broad history.

## Weekly sweep

Weekly sweep may go slightly deeper:

- recheck announcements
- recheck weekly lineup graphics
- recheck MTG/Commander lanes
- recheck LFG if the server is known to be useful for meetup coordination

Still stay bounded.

## Promotion rules

Promote a Discord server into higher-priority recurring review when it shows:

- regular MTG event graphics
- real MTG/Commander corrections not visible elsewhere
- active LFG / meetup planning
- clear solo-arrival usefulness
- strong corroboration value for specific stores or communities

## Anti-rabbit-hole rules

- Do not read deep chat history on routine sweeps.
- Do not inspect unrelated channels.
- Do not inspect DMs.
- Do not chase member identity details.
- Do not treat chatter alone as official fact.

## Required output from any Discord check

Every Discord check should leave behind:

- server role classification
- what surfaces were checked
- whether anything materially changed
- whether the server deserves promotion, maintenance, or de-prioritization
- whether Discord surfaced any MTG events or corrections that should affect
  normalization or analysis

If those are captured, the Discord pass is done.
