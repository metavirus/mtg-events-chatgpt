# Discord Research and Cross-Source Synthesis Methodology

## Purpose

Discord is a high-value but irregular source. A server may contain official
announcements, image-only schedules, scheduled events, staff corrections, informal
attendance signals, member-organized meetups, or almost no useful information.
Discord findings are therefore evidence inputs and research leads, not isolated
calendar truth.

The objective is to extract useful facts and clues, preserve their authority and
uncertainty, then reconcile them at field level with Wizards Locator/EventLink,
official websites, registration systems, Instagram, Facebook, and other sources.

## Operating safeguards

- Work read-only unless the user explicitly authorizes a specific interaction.
- Do not post, react, RSVP, join, message, inspect DMs, or change roles/settings.
- Do not retain credentials, tokens, cookies, ordinary-member rosters, contact
  details, or unnecessary member identities.
- Summarize member conversation; retain only the minimum evidence needed to support
  an operational claim.
- Treat authenticated access as best-effort enrichment, not a weekly-run blocker.

## What Discord is good at

Discord is especially useful for:

- same-day changes, cancellations, and reminders;
- flyers and current weekly lineups;
- scheduled community events;
- LFG, attendance, arrival-time, and pod-formation signals;
- staff explanations of brackets, proxies, pairings, prizes, or house rules;
- identifying recurring-event clues that other sources can confirm;
- discovering communities, organizers, venues, aliases, and source links;
- measuring whether a communication channel is actually useful to a solo player.

Discord is often poor at complete, durable schedules. Sparse or ambiguous Discord
evidence should route research to better sources, not lower the venue automatically.

## Standard Discord pass

### Quick first-pass order of operations

For a store Discord, do the bounded first pass in this order so useful event
data is not missed:

1. server identity and aggregate size signal;
2. scheduled events, if present;
3. weekly lineup / `tournament-schedule` / calendar channels;
4. official `announcements` channels for special-event and correction posts;
5. MTG / Commander / EDH sections and their `announcements` or `general` lanes;
6. LFG / meetup / lobby surfaces;
7. pins or channel topics only where the above surfaces point to them.

The point is to hit the highest-value operational surfaces first, not to
wander channel-by-channel.

If this bounded pass reveals strong Discord value signals — active MTG/Commander
lanes, rich schedule graphics, useful correction posts, visible meetup/LFG
coordination, or especially newcomer-friendly behavior — promote the server into
a deeper second-pass Discord review instead of stopping at the minimum survey.

### 1. Establish identity and authority

Record the server ID and display name, operator type, associated venue/community,
geographic scope, invite provenance, access state, and whether each relevant surface
is official, organizer-controlled, or conversational.

Do not equate the server with its operator. A Discord server is a source; the venue,
community, organizer, and physical host remain separate entities.

### 2. Inventory relevant surfaces

Check, when accessible:

- Discord scheduled events;
- announcements and social-media mirrors;
- weekly schedule/event-calendar channels;
- Commander/EDH, limited, prerelease, and draft channels;
- LFG, meetup, regional, or forum channels;
- pins and channel topics;
- persistent rules or FAQ channels;
- reservation channels;
- location-specific channels in multi-location servers.

Record useful sparse, stale, inaccessible, or empty surfaces as results.

### 3. Extract text and images completely

For every relevant recent post:

- capture the post timestamp and authority class;
- preserve exact wording only where it materially supports a claim;
- open image attachments at readable size and transcribe all relevant fields;
- inspect multi-image posts and signup-code companions together;
- distinguish the date of the post from the date of the advertised event;
- identify whether a graphic is a weekly schedule, a one-off special, a historical
  flyer, or a generic promotional image;
- check pins and scheduled-event modals instead of assuming ordinary channel history
  contains everything.

When a schedule graphic or event flyer is plainly visible during the bounded
pass, transcribe the MTG-relevant fields immediately rather than only noting
that the channel exists. First-pass extraction should prioritize:

- routine Magic schedule slots, including Commander when present;
- prerelease, sealed, draft, or other special-event graphics;
- cancellations, corrections, and same-day warnings;
- wording that clarifies `casual`, `open play`, `optimized`, `cEDH`, or related
  fit signals.

An image is not considered reviewed merely because its existence or filename was
observed. If it cannot be read, record `image_not_transcribed` and keep the task open.

### 4. Create atomic claims

Split each finding into field-level claims, such as:

- event identity or possible series identity;
- occurrence date and start/end time;
- recurrence;
- format and Commander subtype;
- fee, included product, prizes, and capacity;
- bracket/power language;
- proxy policy;
- pod formation, pairing, rounds, or time limits;
- location and organizer;
- cancellation or schedule change;
- solo-arrival or advance-coordination evidence.

Each claim retains source, timestamp, authority, explicit/inferred status,
confidence, and the scope to which it applies.

## Cross-source correlation workflow

Ambiguous Discord clues are expected. For example, Discord may show only `Magic`
at a particular day and time. That clue should initiate correlation rather than be
discarded or prematurely normalized.

### Candidate matching

Search the same venue and approximate date/time across:

1. Wizards Locator/EventLink;
2. the official website or event calendar;
3. registration/commerce platforms;
4. Instagram and Facebook posts or stories;
5. other official announcements;
6. community discussion, used only as supporting evidence.

Compare:

- venue branch and address;
- calendar date, weekday, and time, allowing for announced changes;
- format or product name;
- fee and registration link/code;
- title fragments, artwork, and special-event theme;
- recurrence pattern;
- organizer and physical host.

### Correlation outcomes

Use one of these outcomes:

- `confirmed_same_event`: strong identity match; claims may be combined while each
  field keeps its own source provenance.
- `probable_same_event`: likely match with a meaningful unresolved difference;
  display cautiously and queue verification.
- `possible_match`: useful lead, insufficient to merge.
- `conflicting_sources`: likely same event but facts disagree; preserve both and
  prefer no silent resolution.
- `distinct_events`: similar timing or wording but evidence indicates separate events.
- `unmatched_clue`: retain for later research; do not invent missing details.

Two sources matching on venue and time do not make every field interchangeable.
Discord might be authoritative for a cancellation while Wizards supplies the format,
or Instagram might supply the fee while the store website supplies recurrence.
Resolve and cite each field independently.

### Time and recurrence cautions

- Do not let a stale recurring page override a recent dated correction.
- Do not infer recurrence from repeated member questions alone.
- Do not convert a one-week lineup into an indefinite weekly series without other
  recurrence evidence.
- Treat projected occurrences separately from confirmed dated occurrences.
- Preserve timezone and distinguish doors, registration, recommended arrival, and
  event start times.

## Conversation evidence

Member conversation can establish patterns and accessibility signals, but usually
cannot establish official schedule truth.

Useful examples include:

- multiple recent attendance confirmations;
- staff or regulars explaining how solo players find pods;
- repeated arrival-time coordination;
- explicit Bracket 2/3, optimized, or cEDH expectations;
- proxy acceptance or objections tied to a specific event;
- reports that an advertised event fired, filled, or failed to fire.

Classify these as anecdotal or member-organized unless an authorized organizer is
speaking within their scope. Never silently turn chatter into an official event.

## Independent assessments

Always keep separate:

1. **Discord source usefulness** — freshness, completeness, searchability,
   image dependence, correction value, and LFG usefulness.
2. **Venue/community fit** — likely compatibility, accessibility, continuity,
   geography, and repeat-player potential.
3. **Event fit** — format, bracket, proxies, time, distance, structure, and social
   accessibility for the specific series or occurrence.

A strong store can have a weak Discord. A small regional group can have an excellent
coordination server. Neither conclusion should overwrite the other.

## Freshness and cadence

For weekly passes:

- prioritize announcements, scheduled events, recent flyers, cancellations, and
  high-fit LFG/Commander surfaces;
- recheck the most recently authoritative channel rather than rereading the entire
  server history;
- use the prior audit to identify last-seen timestamps and open questions;
- record access failures and continue with public sources;
- revisit sparse pins/rules only when the channel structure changes or another
  source points to them.

Use deeper periodic reviews for new servers, new channels, reorganized roles,
previously inaccessible surfaces, or unexplained cross-source conflicts.

## Completion criteria

A Discord pass is complete only when:

- relevant accessible channels, scheduled events, pins, and recent images were
  actually reviewed;
- at least one routine schedule surface, one announcement/special-event surface,
  and one MTG/Commander/LFG surface were checked when those surfaces exist;
- obvious MTG-relevant schedule or event graphics visible in first-pass channels
  were transcribed rather than merely noticed;
- every useful image was transcribed or explicitly marked unreadable;
- ambiguous event clues were queued for cross-source correlation;
- official, organizer, member-organized, and anecdotal evidence were separated;
- source usefulness was assessed separately from venue/community/event fit;
- inaccessible or omitted areas and privacy safeguards were recorded;
- open conflicts and next checks were written to the research record.

For store-linked Discords, completion also means the pass leaves an explicit
judgment about whether the server should remain a bounded source only or be
promoted into a deeper Discord follow-up tier.

Use `research/templates/DISCORD_AUDIT_TEMPLATE.md` for each server and the general
claim-reconciliation rules in `research/METHODOLOGY.md` for publication decisions.
