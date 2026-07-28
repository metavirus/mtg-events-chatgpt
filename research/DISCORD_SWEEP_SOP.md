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

Every Discord pass must explicitly satisfy this protocol. Guarded UI-native
access is operational only for routes that have passed the accepted proof;
uncertain routes must use the bounded route-discovery mode below before they
can enter routine survey. Manual opening and screenshot/paste review remain
safe fallbacks, not the intended long-term workflow.

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
- `ui_native_navigation_verified`
  - The route has passed guarded navigation from Discord `@me` through a
    structurally identified folder/server/channel path. Routine surveys may use
    only the recorded order, exact labels, guild/channel IDs, and independent
    monitoring-map cursors.
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

## Two operating modes

### Route discovery

Use route discovery once for an already-known or plausibly already-joined
server whose safe UI-native path is not yet proven. Its purpose is operational:
identify the folder/server/channel path and record it in the monitoring map.
It is not a broad content survey.

After the read-only guard passes, route discovery may use visible,
non-mutating navigation only:

- open a structurally identified Discord folder;
- hover a folder/server icon to read its tooltip;
- click a server whose visible label or destination matches the expected guild;
- click a visible channel whose label or destination matches the intended
  channel;
- click `Continue in Browser`, `Continue to Server`, or equivalent only when
  the prompt is clearly routing to an already-accessible server in the browser;
- dismiss an overlay only when it is clearly a non-mutating visibility blocker;
- read server/channel labels, timestamps, and at most a small visible message
  sample after shell identity and all safety checks pass.

Do not click anything that implies joining, accepting an invite, verifying,
agreeing, enabling, claiming, submitting, saving, changing settings, accepting
roles, or completing onboarding. Any such prompt ends the pass as
`join_or_role_gate` or `blocked_for_this_run` without lowering route value.

Route discovery must record:

- Discord `@me` as the start route;
- folder label/tooltip and navigation order;
- server label and exact guild ID when available;
- channel label and exact channel ID when available;
- whether a browser-routing prompt appeared and whether it was used;
- whether an overlay was dismissed and why it was non-mutating;
- blocked request classes and the stage where they appeared;
- unread/mention state before and after;
- whether any external Discord state changed;
- whether the route is ready for `ui_native_navigation_verified` routine use;
- any route-specific caution.
- whether the server exposes a distinct Discord Events surface, the visible
  event count when Discord shows one, and whether that surface was merely
  detected or safely inspected.

### Routine survey

Use routine survey only after the route-discovery path is recorded and proven.
Start from Discord `@me`, follow the exact mapped UI-native order, verify guild
and channel IDs, and read only the bounded window since the independent
monitoring cursor. Do not rediscover folders or channels unless the recorded
path fails. A failed or quiet run updates the latest run result without
downgrading durable route value.

Routine survey records `last_checked_at`, `last_seen_message_id`,
`last_seen_message_at`, and `latest_run_result`. Discord unread/read state is
never the resume cursor.

Before any agent-driven Discord navigation, run the route preflight helper
against every channel in the intended pass:

```powershell
.\.venv\Scripts\python.exe scripts/discord_route_preflight.py `
  --method ui_native `
  --channel-url https://discord.com/channels/.../... `
  --channel-url https://discord.com/channels/.../...
```

Use `--require-multiple` for a POC whose success depends on checking more than
one channel. A failed preflight is a hard stop unless the user manually opens
the exact channel or approves a separate route-discovery pass. Do not open a
cold Discord channel URL in the browser merely because the URL is recorded.
Recorded direct URLs are identity metadata unless the channel's
`safe_access_mode` is exactly `direct_navigation_verified`.

## Discord Events are a first-class signal surface

Discord's server Events surface is separate from ordinary channel history and
must be checked explicitly when it is safely visible. A one-off community event
can be highly actionable even when it is not a recurring store program or
listed on a store calendar.

Route discovery records whether an Events tab/control is exposed and any
visible event count. Detection alone does not authorize clicking it. Inspect
the surface only when the control is structurally identified as read-only
navigation and the guard remains healthy; never RSVP, express interest, join,
or use an event control that could change Discord state.

For each visible current or upcoming Discord Event, capture or propose only the
planning-useful fields:

- event title;
- date/time or `happening_now` state;
- location, when shown;
- hosting community/server;
- linked venue/place, only when branch-safe and reasonably inferable;
- description, format, power, and proxy clues that are actually visible;
- operator class: `store_run`, `community_run`, or `unclear`;
- disposition: `signal`, `event_proposal`, `tbd`, `stale`, or `no_action`.

Current one-off community play opportunities may justify high-priority Signals,
especially when they answer "what could I do tonight?" Do not require
recurrence or store ownership. Do require a visible current/upcoming date and
enough source identity to avoid presenting stale or mismatched activity.

## Ephemeral Discord interstitial handling

Discord sometimes shows or triggers a transient server/channel visibility state
even when the same route later opens directly. A guarded pass may see the
correct server/channel shell while Discord attempts a
`members/@me?lurker=true`-style request before message content is readable.

Do not click through that state, accept an invite, join, select roles, or allow
the membership/lurker request automatically.

Allowed narrow recovery during guarded route discovery:

1. block/log the attempted membership/lurker request;
2. close the isolated Discord-read browser context;
3. reopen Discord `@me` once and repeat only the same structurally verified
   UI-native path;
4. continue only if the route opens without a gated/interstitial state,
   unknown mutation, editable focus, or enabled mutating control.

If the same gated/interstitial condition recurs after one close-and-retry,
record the channel as blocked for that run and leave the durable route value
unchanged unless repeated safe checks show the route is not worth monitoring.

### Hard prohibitions

Do not:

- type Discord URLs into any focused Discord tab where the message composer
  might be active;
- use paste, typing, keyboard shortcuts, search, message-area interaction, or
  coordinate guessing as a Discord navigation method;
- send text, upload files, react, reply, mark messages, join voice, change
  settings, join servers, accept invites, or perform any other social action;
- continue after focus, navigation, or access state becomes uncertain.

If the only available way to reach a channel is typing or pasting into the
Discord page, stop and mark the route blocked/TBD.

### Required safe navigation methods

For route discovery, start at Discord `@me` and use only structurally verified
folder, server, channel, browser-routing, and non-mutating overlay controls.
Every navigation click must be tied to a visible label, tooltip, exact guild or
channel destination, or another independently verified shell marker.

For routine survey, use only the already recorded UI-native path. Cold direct
channel URLs remain identity metadata unless separately proven safe; they are
not the default access method.

For multi-channel Discord POCs, select the full channel set before beginning.
It is acceptable for the result to be mixed-mode: for example, one
`ui_native_navigation_verified` channel may be surveyed by the agent while a
second `manual_open_required` channel needs the user to open it or supply a
screenshot. Do not silently shrink a multi-channel proof to the one channel
that happens to be easiest to reach.

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

Direct navigation alone does not certify autonomous surveying. The accepted
operational baseline is checkpoint `dd345d2`: Collectors Lounge, JJ's,
ProjectCCG, and Magic & Monsters have proven guarded UI-native paths. Other
routes remain unproven until a bounded route-discovery pass succeeds.

### Preflight checklist

Before any Discord pass, confirm and record:

- Discord survey is read-only.
- The pass mode is `route_discovery` or `routine_survey`.
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
- If `ui_native_navigation_verified`, navigation will follow the exact recorded
  folder/server/channel path and verify both labels and IDs.
- If `route_discovery`, only the permitted structurally identified navigation
  controls may be used; any join/onboarding/role/settings action stops the pass.
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

- pass mode;
- route/channel inspected;
- access mode used;
- whether the user manually opened it;
- whether Codex performed any Discord navigation;
- useful findings, quiet result, blocked result, or gated result;
- whether an unsafe/gated condition was encountered;
- confirmation that no external Discord state was changed.

For route discovery, also record the folder/server/channel path, exact IDs,
browser-routing or overlay controls used, blocked requests, unread-state result,
and promotion decision. For routine survey, record the independent cursor and
latest run result.

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

Regional-community and store-operated Discords are both valid chatter sources.
Do not rank a store Discord below a regional group merely because it belongs to
a venue. Rank the material itself: personal involvement first, then concrete
plans, then useful event-adjacent discussion and community texture.

Event-adjacent chatter is worth preserving when it reduces Discord browsing
overhead or helps future planning even before it becomes an event or Signal.
Examples include players comparing possible bars or stores for a future
meetup, discussing likely attendance, choosing formats or sets, coordinating
transport or timing, and describing which recurring nights actually draw
people. Exclude ordinary jokes, memes, off-topic conversation, and social noise
that does not improve planning or community understanding.

Use `mention` for direct questions/invitations involving the user,
`event_opportunity` for concrete or forming plans, and `community_activity` for
useful non-personal chatter. A `community_activity` item may appear in the
Communities digest without becoming a cross-app attention Signal.

False positives are an expected cost of useful chatter filtering. Every digest
item must support a one-click personal hide/read action. Hiding removes it from
the user's active digest without deleting the underlying research record or
changing canonical event/community truth.

Channel visibility follows recent conversational value. A Discord may appear
in the Communities page's active-channel group when it recently produced a
mention, forming event, or useful `community_activity` finding. Route capture,
monitoring status, source-health bookkeeping, and "needs first read" notes do
not count as channel activity. Quiet channels remain available only in the
collapsed route inventory until a material conversation appears.

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
- useful planning chatter, including venue ideas, attendance, timing, or format
  discussion even when the user is not involved
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
