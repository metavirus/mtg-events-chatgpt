# Signals and Communities Design Checkpoint

Last updated: 2026-07-20

Implementation status: the minimal Supabase Signals receiving model is now
implemented. The Signals UI, seeded records, Communities refresh, and survey
automation remain separate later tranches.

## Purpose

Signals is a new first-class product layer, not a renamed Updates page and not
another research filter.

The intended app roles are:

- Today answers: what can I play soon?
- Events answers: what is on the calendar?
- Places answers: where might I want to become a regular?
- Communities answers: where are the people and coordination surfaces?
- Updates answers: what changed in the research record?
- Signals answers: what fresh thing deserves my attention?

Signals should surface attention-worthy observations from existing and future
research sources, including Discord/community channels, WPN/EventLink, store
websites, Instagram/Facebook, review surfaces, user notes, and daily or weekly
survey runs.

The first implementation should remain small: create the receiving surface and
data shape, seed only a few honest existing signals, and defer automation.

## Data boundaries

Signals are observations and attention prompts. They are not canonical truth by
themselves.

Signals must remain separate from:

- canonical events and event occurrences;
- Places assessments and venue facts;
- Updates / research-change records;
- personal notes and preferences;
- raw source records.

Promotion paths should be explicit and reviewable. A signal may lead to:

- an event proposal;
- an Updates entry;
- a Places assessment change;
- a community note;
- a personal reminder or preference action;
- no action.

Signals must not silently create or rewrite event, venue, community, source, or
personal-preference records.

## Minimal signal model

Prefer a real minimal Supabase-backed model before building a substantial
Signals UI. Avoid a throwaway static or adapter-only page that would immediately
need to be rewritten.

The minimal `signals` table/model should support:

- `id`
- `category`
- `priority`
- `status`
- `source_id`
- `captured_at`
- `observed_at`
- `expires_at`
- `related_entity_type`
- `related_entity_id`
- `summary`
- `details`
- `evidence_url` or equivalent source link
- `confidence`
- `suggested_action`
- `promotion_target`

Expected categories include:

- closures, cancellations, changed hours, parking/access issues, or same-day
  operational notices;
- direct mentions, badge-triggering notices, and announcement-channel items;
- newly discovered prerelease, sealed, draft, Commander, FNM, or special-event
  opportunities;
- informal community activity such as LFG, meetup, or pod coordination;
- turnout, proxy, power-level, solo-arrival, newcomer-friendliness, and vibe
  signals;
- registration, capacity, deadline, or sold-out signals;
- source-health signals, such as an official calendar being stale while Discord
  or WPN is current;
- ambiguous but potentially important findings that need user judgment.

Signals priority is about attention required, not merely importance as data.
`Act first` should be reserved for actionable items: cancellations, closures,
changed hours, deadlines, capacity, strong new opportunities, direct mentions,
or user-judgment items that affect near-term planning.

Negative fit signals usually belong in ranking, filtering, Places cautions, or
event annotations rather than prominent Signals cards. A no-proxy or competitive
signal should normally suppress, downrank, hide, or annotate the affected event
according to personal preferences. It should appear in Signals only when it
changes something important or requires a decision, such as a favorite event
gaining a new disqualifier, a nearby store changing proxy policy, or a previously
proxy-friendly event becoming no-proxy. Routine known negatives should not
occupy prominent Signals real estate.

Expected lifecycle states include:

- `new`
- `reviewed`
- `promoted`
- `dismissed`
- `stale`
- `needs_followup`

The model should support deduping and expiry so Signals does not become a noisy
inbox.

## Discord and community-surface rules

Discord and community routes are first-class research surfaces. They can answer
questions that official calendars often do not:

- turnout;
- casual versus competitive texture;
- proxy friendliness;
- draft firing reliability;
- prerelease attendance;
- solo-arrival support;
- newcomer friendliness;
- community tone;
- cancellations or operational changes.

Future Discord/community survey work should prioritize high-signal,
low-noise items:

- server/channel notification badges or mention-like notices over ordinary
  unread backlog;
- announcements and event channels over general chatter unless a channel is
  explicitly being monitored;
- actionable snippets with server, channel, timestamp, link, category,
  priority, and suggested action;
- dedupe and expiry.

For now, do not build browser automation, login persistence, or scheduled
Discord survey runs. The near-term goal is only to make sure future findings can
land cleanly.

If Discord/community content is not inspected, the app and data should say so:
route captured / content replay TBD. Do not claim turnout, vibe, event
reliability, or fit support unless the content itself was actually reviewed.

## Future Discord/community monitoring model

The accepted Discord pilots show that Discord can produce high-value findings,
but they also show an access-cost problem. A future daily/weekly survey should
not rediscover basic mechanics every run: which browser session works, whether
the server is joined, whether an invite is valid, which channel is role-gated,
or which channel is actually worth checking.

Future work should therefore model Discord/community monitoring in four
separate layers.

### 1. Community surface / route

This records that a communication surface exists and is linked to a venue or
community. It does not imply content has been inspected.

Examples:

- ProjectCCG Online Community Discord exists and is linked to ProjectCCG / MTG
  OC.
- Tilted Gaming Discord route exists from the official events page.
- Paper Hero has a Huntington Beach Magic channel visible from its Discord
  server.

### 2. Access modality

This records how the route should be accessed next time, so the agent does not
repeat browser, invite, and role-discovery work.

Fields or concepts to preserve later:

- preferred access surface: in-app browser, Chrome, direct URL, invite URL,
  public discovery page, external source link, unknown;
- joined status: joined, not joined, unknown;
- invite status: valid invite, expired invite, accept-invite required, no invite
  known;
- access status: accessible, public landing only, role-gated,
  permission-gated, login required, blocked, unknown;
- user action required: none, join server, accept invite, choose roles, request
  access, use different browser/session, manual handoff;
- known internal target: server URL, channel URL, channel id/name, message URL
  if available;
- last successful access method;
- last failed access method and reason;
- last access checked time;
- suitability: automated survey, manual survey only, blocked/TBD;
- route notes such as `use in-app browser session, not Chrome`, `public
  discovery page accessible but internal content not visible`, or `joined
  server but MTG channel is role-gated`.

### 3. Channel watch plan

This records which channels inside a surface are worth monitoring.

Fields or concepts to preserve later:

- server/community surface id;
- channel name and channel id or direct URL;
- channel type: announcements, events, schedule, Commander, draft, prerelease,
  LFG, rules, general, admin, marketplace, other;
- monitor priority: urgent, high, medium, low, ignore;
- monitor cadence: daily, weekly, occasional, manual-only, paused;
- reason to monitor;
- expected signal types: cancellations, closures, hours/access, prerelease,
  draft, Commander, LFG, proxy policy, power level, turnout, solo-arrival,
  source conflict, registration/capacity, etc.;
- access status for that channel: readable, role-gated, requires channel
  selection, inaccessible, noisy, archived, unknown;
- noise level;
- last checked;
- last useful signal;
- last seen message/timestamp when available;
- active or paused state.

### 4. Survey observations and Signals

A survey observation is not the same thing as a Signal.

For each manual, daily, weekly, or targeted run, preserve:

- which routes/channels were checked;
- which were quiet;
- which were inaccessible;
- which were noisy;
- which had useful findings;
- what timestamp/window was inspected;
- whether the result should affect monitoring cadence.

Only genuinely useful observations should become Signals. Quiet Discord checks
should create run observations, not landing-page Signals. A quiet current run
does not mean the route is permanently low-value; Discord value is intermittent.
Cancellations, schedule changes, LFG posts, turnout clues, proxy/power notes,
and special-event details may appear only occasionally.

Keep these concepts distinct:

- route value: whether the route is worth monitoring at all;
- access state: whether we can inspect it and how;
- channel watch priority: which channels deserve attention;
- current run result: what this inspection found;
- signal yield history: whether useful findings have appeared over time;
- Signals: sparse attention-worthy items for the app landing page.

Possible later tables or model concepts:

- `community_surfaces` or `discord_servers`;
- `discord_access_profiles`;
- `discord_channel_watchlist`;
- `discord_survey_runs`;
- `discord_channel_observations`;
- existing `signals`, created only for attention-worthy findings.

Future daily/weekly agent behavior should:

- read the route/channel/access plan first;
- use the known working browser/session/access method first;
- inspect only active or due channels;
- prioritize badge/mention, announcement, event, schedule, Commander, draft,
  prerelease, LFG, and high-value source-health channels;
- if access fails, try one reasonable fallback, then record a clean blocked/TBD
  result instead of spiraling;
- record quiet checks as observations;
- create sparse Signals only for useful findings;
- update last checked, last seen, and last useful-signal markers;
- suggest watchlist/access-plan changes separately.

This is future design/backlog documentation only. Do not build automation,
browser-login persistence, or a broad Discord survey until explicitly selected.

## Communities direction

Communities should become the social and coordination layer of the app. It
should show where the actual people, communication routes, and meetup surfaces
live.

Communities should include more than independent formal groups while preserving
data distinctions:

- independent formal communities;
- regional communities;
- venue-linked Discords or social communities;
- informal meetup / LFG surfaces;
- communication channels associated with stores.

A store remains a Place. An event remains an Event. A Discord server, social
profile, group, channel, or Linktree is a communication/community surface linked
to one or more Places, Events, Communities, or Sources.

The Communities page should eventually make it easy to understand:

- what the surface is;
- what venue, region, or group it belongs to;
- whether it has been inspected;
- how active/useful it appears;
- what kind of coordination happens there;
- what recent Signals came from it;
- what remains unknown.

## Build sequence

1. Design checkpoint.
   - Record this product decision in the repo.
   - No schema or app changes.

2. Minimal Signals data model.
   - Add the smallest Supabase-backed `signals` model needed for real records.
   - Keep raw signals separate from canonical events, research truth, Updates,
     and personal notes.
   - Do not build automation.

3. Signals UI backed by the model.
   - Add a first-class Signals surface.
   - Seed only a few honest existing signals from current accepted data.
   - Do not use fake samples.
   - Keep grouping and actions simple: review, dismiss, promote/open related
     record, open source.

4. Communities refresh.
   - Make formal groups and venue-linked community surfaces easier to understand.
   - Preserve the distinction between Places, Events, Communities, Sources, and
     communication routes.

5. Future survey readiness.
   - Later, define or implement daily/weekly Discord, WPN, store-site, social,
     and review-surface survey runs.
   - Do not start this during the initial Signals/Communities product pass.

## Deferred work

Deferred until explicitly selected:

- broad research resumption;
- Discord automation;
- browser-session survey automation;
- scheduled daily/weekly agents;
- login persistence for third-party sites;
- automatic promotion from signal to canonical fact;
- full workflow/request system;
- large Communities data backfill.

## Acceptance intent

Signals is successful when it helps answer: what fresh thing deserves attention?

It should be small, current, source-linked, and action-oriented. It should not
become another noisy inbox, a generic unread feed, or a renamed Updates page.
