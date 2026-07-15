# Research Methodology

## Objective

Find and synthesize the broadest practical set of public evidence about Magic:
The Gathering venues, Commander play, limited events, prereleases, community
accessibility, and communication channels relevant to Los Alamitos.

Venues include game stores and nontraditional hosts such as cafés, breweries,
libraries, clubs, and convention/community spaces.

## Standard store trawl

A store pass is not complete until social surfaces have been checked in the same
pass unless they are genuinely blocked. Do not defer Instagram/Facebook/social
review to a later optional sweep just because other sources already produced
useful event facts. For this project, socials are often first-class operational
sources, not decorative extras.

1. Establish canonical store identity, branch, public address, aliases, operating
   status, and Wizards organization ID.
2. Check Wizards/EventLink for organizations, all Magic events, event descriptions,
   dates, capacity, fees, tags, and recurring patterns.
3. Find the official website and inspect event, calendar, community, contact, and
   social-link pages, including stale pages that may describe routine schedules.
4. Find registration/commerce platforms and capture precise operational details.
5. Find official Instagram, Facebook, Discord, and other active social channels.
6. Inspect recent social content deeply enough to determine whether the store uses
   socials for weekly schedules, specials, prereleases, cancellations, community
   tone, or only light branding. Capture profile-level evidence plus the most
   operationally useful recent post-level evidence available.
7. If the store has an accessible Discord, run a bounded first-pass Discord
   survey during the main store pass rather than deferring it by default:
   inspect server identity, member/online counts if visible, relevant channels,
   event/announcement surfaces, and obvious Commander/EDH/LFG/meetup signals
   without attempting to read exhaustive history.
8. Search across all gathered sources for recent schedule graphics, specials,
   prereleases, Commander Parties, Commander/EDH, bracket/power terms, explicit
   proxy restrictions or permissions when stated, pod formation, pairings, timed
   rounds, fees, prizes, capacity, and
   solo-arrival guidance.
9. Check community discussions and reviews for explicitly anecdotal evidence about
   attendance, accessibility, competitiveness, regulars, and physical space.
10. Record every source attempted, including failures and no-result checks.
11. Reconcile claims at field level; retain conflicts and unknowns.
12. Write an analytical store/event summary, personal-fit assessment, confidence,
    open questions, and next-check recommendation.
13. When the evidence is reasonably available in the same pass, also capture the
    newer secondary analytical signals:
    - MTG-focus level
    - player-pool breadth / venue-scale clues
    - review/prominence signals
    - representative play-space image evidence when clearly available and useful

Do this during the main store pass rather than saving it for a separate later
enhancement sweep, unless the signal is weak enough that forcing it would add
noise instead of insight.

For review/prominence and play-space-image signals, use a bounded best-efforts
rule rather than an open-ended hunt. Give the signal a quick pass using the
already-open official/social/map surfaces; if one or two useful clues appear,
capture them and stop. If the evidence is noisy, blocked, or requires multiple
extra hops to extract cleanly, record that no strong signal was found in this
pass and move on. Reserve deeper visual digging for favorites, top candidates,
or later targeted backfill passes.

If a social surface is deferred despite being publicly accessible, the run must
explicitly say why. "We already had enough evidence" is not a sufficient reason
for deferral in this project.

## Cadence

- **Daily light sweep:** review high-signal change surfaces for material updates,
  especially official store socials, key group/community announcement surfaces,
  official Wizards/WPN news feeds, and obvious operational warnings such as
  cancellations, postponements, special-hours notices, store closures, same-day
  displacement events, or emergency/event-called-off posts.
- **Weekly:** refresh Wizards/EventLink and recheck most known operational event,
  registration, website, and social sources, prioritizing favorites and promising venues.
- **Every two weeks:** run broader discovery for newly opened stores, new venues,
  new social/registration channels, and previously unknown event hosts.
- **Immediate/priority review:** process prereleases, cancellations, broken favorite
  sources, major schedule changes, and newly discovered high-fit events.

Cadence is a target, not permission to invent freshness. Every displayed claim
retains its actual checked and observed timestamps.

Authenticated community sources such as Discord are best-effort enrichment, not
run-completion dependencies. If access is unavailable, preserve the last successful
observation, record `login required` or the specific failure, reduce freshness as
appropriate, and continue with public sources. Never store personal session tokens
or credentials in the repository.

The daily sweep is intentionally lighter than the weekly reconciliation pass. Its
job is not to fully re-research the landscape each day, but to catch meaningful
signals early enough to trigger alerts, highlight newly relevant events, or
redirect the next deeper pass.

Favorites are a first-class monitoring priority. Any store, venue, group, or
event series explicitly favorited by the user should automatically enter the
daily light-sweep set unless the user later removes it. Favorites are not just a
display preference; they change monitoring cadence and alert priority.

Suggested monitoring tiers:

- **Tier 1 - Favorites:** daily light sweep plus highest alert priority.
- **Tier 2 - high-fit active leads:** frequent review, typically daily or near-daily
  when signal volume is high.
- **Tier 3 - broader viable catalog:** normal weekly reconciliation cadence.
- **Tier 4 - weak-fit, distant, or low-yield leads:** biweekly or opportunistic review.

## Upstream signal monitoring

Official Wizards and WPN communication should be treated as a first-class
upstream signal layer, not merely as background reading.

Primary upstream feeds include:

- `https://magic.wizards.com/en/news`
- `https://wpn.wizards.com/en/news`
- official Wizards/WPN event-program pages when a named promotion, branded event,
  or temporary play variant appears

Use these feeds for three distinct jobs:

1. **Vocabulary translation**
   - When Wizards or WPN introduces a named event variant or branded program such
     as Commander Party or Magic Presents: God of Mischief, capture its plain
     meaning, dates, format implications, and any relevant player-fit context.
   - Preserve the original branded term, but store a normalized interpretation so
     later store/event sightings are immediately legible.

2. **Expected-local-impact monitoring**
   - Watch for upstream announcements that are likely to create local store-visible
     effects: prereleases, new sets, Commander product launches, special weekend
     programs, promo-driven event series, or program/rules changes.

3. **Alert and triage routing**
   - If a new upstream term or program is likely to surface in local EventLink,
     store websites, or socials, mark it as a watch item for the daily and weekly
     research loops.

Do not treat an upstream announcement alone as proof that a local venue is
running that event. Upstream feeds define meaning and expected windows; local
sources still determine whether a specific store, venue, or group is actually
participating.

## Persistence checkpoints

Long exploratory work must pause periodically so the durable research record stays
ahead of chat-window loss. Do not rely on conversation memory as the only place a
meaningful result exists.

Pause and write a repository-backed update before continuing when any of these are true:

- a tranche-level source pass has finished, such as Discord, Wizards, websites,
  registration pages, socials, or community discovery;
- a meaningful batch of new findings, source-routing lessons, or reconciliation
  decisions has accumulated;
- the work is about to move from one store/group tranche to the next;
- the working conversation is becoming long enough that context compaction or loss
  is plausible.

At each checkpoint, reduce at least the following into Git-backed files:

- sources attempted, including failures and low-yield results;
- normalized findings and unresolved questions;
- source-authority or source-priority lessons that should influence later tranches;
- any reconciliation decisions already made;
- the recommended next step.

If a pass is still in progress, write an interim run note rather than waiting for
perfect completion. An incomplete but durable handoff is better than a fully formed
idea that only lives in chat.

## Discord and regional-community research

Discord may contain unusually rich operational evidence. When a store or venue
has an accessible Discord, a bounded Discord survey should normally be part of
that store's main first pass rather than a separate optional phase. It is still
not a weekly completion dependency, and the review should remain targeted rather
than exhaustive. With the user's interactive authenticated access, perform
bounded, targeted reviews of selected servers rather than attempting to copy or
indiscriminately scrape entire histories.

For each selected server:

1. Record server identity, operator/community type, geographic scope, associated
   venues, invite/source provenance, and access state.
2. Inventory relevant accessible channels: server events, announcements, event
   calendars, Commander/EDH, looking-for-game, regional meetup, store news,
   prerelease/limited, forum, pins, and rules/resources.
3. Inspect scheduled Discord events and recent announcement posts.
4. Run targeted searches across an agreed recent window for Commander, EDH, cEDH,
   bracket, proxies, prerelease, sealed, draft, meetup/LFG, relevant weekdays,
   neighborhoods, and known venue names.
5. Review conversation threads only when they contain operational evidence such as
   a meetup plan, recurrence pattern, cancellation, venue recommendation, power
   expectation, or solo-player coordination practice.
6. Normalize events and community/venue relationships while preserving the source
   type, timestamp, message link where durable, and confidence.
7. Record source coverage, inaccessible channels, uncertainty, and the next useful check.

Bounded first-pass Discord survey means:

- identify whether the server appears operationally useful at all;
- check at least one routine schedule surface, one announcement/special-event
  surface, and one MTG/Commander/LFG surface when they exist;
- transcribe plainly visible MTG-relevant schedule/event graphics rather than
  only noting that the channels exist;
- capture a few high-value recent signals rather than reading deep history;
- stop once the server's practical value and source role are legible.

If the first-pass Discord survey shows strong value signals — such as active
MTG/Commander channels, useful schedule graphics, real meetup/LFG behavior,
welcoming coordination, or high correction value — promote that store/community
into a deeper follow-up tier rather than treating Discord as "done."

After the main first pass for a store, run an internal self-review using the
user's stated priorities before asking the user to validate the findings. In
that self-review, explicitly pressure-test the store from the user's point of
view: overall Magic fit, casual Commander fit, solo-arrival comfort,
pre-arrangement usefulness, community warmth, event reliability,
distance/value tradeoff, and whether the signals justify deeper follow-up. Bring
the user back in mainly for meaningful ambiguities, tradeoffs, or fresh
personal data points rather than routine sanity checks.

Also run an explicit completeness check in the user's voice: "If I were him,
would this first-pass analysis feel complete, or am I still missing something
we said should be part of the first pass?" Use that question to catch skipped
steps such as Discord schedule graphics, announcement/event surfaces, obvious
social/event corroboration, or other promised first-pass evidence before moving
on to the next store.

Do not collapse `Magic fit` into `Commander fit`. Magic: The Gathering should be
tracked as a multi-format ecosystem that can include Commander, prerelease,
sealed, draft, Standard, Modern, or other formats. Commander remains the user's
primary preference, but a store's broader Magic activity level is itself a
meaningful signal and should be assessed separately from whether Commander is
the dominant visible format.

Use the Discord audit template in `research/templates/DISCORD_AUDIT_TEMPLATE.md`.
Follow the dedicated extraction and cross-source workflow in
`research/DISCORD_METHODOLOGY.md`.
Assess the server as a source separately from assessing its operator community or
venue. Do not create a venue merely because a Discord has a server identity.

Capture approximate member/online counts when visible, but treat them as secondary
indicators. Prefer recent relevant activity, event specificity, advance coordination,
and newcomer usability when judging usefulness. A large inactive server may be less
useful than a small group that reliably organizes compatible local meetups.

For each event or meetup, separately record:

- organizer or organizing community;
- physical venue, rotating venue, online location, or unresolved location;
- announcing source and the source's authority for that claim;
- whether the post is an official event, member-organized meetup, conversation lead,
  or unverified suggestion.

Distinguish source authority:

- store-operated server announcements may be authoritative for that store's operations;
- organizer posts may be authoritative for a community meetup;
- member conversation is anecdotal evidence unless corroborated;
- chatter can reveal patterns and leads but should not silently become event fact.

Privacy rules:

- do not inspect direct messages unless the user separately requests a specific task;
- do not post, react, join servers, RSVP, or message anyone;
- do not store credentials, cookies, session tokens, or private-channel exports;
- minimize personal data and omit member identities unless essential and explicitly approved;
- summarize conversation evidence rather than copying large message histories;
- retain only the text or snippet needed to support the operational claim.
- do not retain ordinary-member rosters, presence histories, phone numbers, email
  addresses, or other personal contact details merely because they are visible;
- report member/online totals only as aggregate timestamped observations.

Regional Magic communities are first-class research targets, not merely sources
attached to one store. Current leads include Legendary Creature Club for the South
Bay/Long Beach area and infiniteloopmtg for Los Angeles/northern coverage. Discovery
should search for additional geographically relevant Commander, Magic, LFG, league,
and meetup groups across Discord, Facebook, Meetup, Reddit, store cross-links, and
community referrals.

## Claim reconciliation

For each claim—occurrence, time, recurrence, fee, format, bracket/power, proxy
policy when explicitly stated,
pairings, prizes, capacity, or cancellation—evaluate:

- source authority for that specific claim;
- recency and whether the source is routinely maintained;
- specificity;
- corroboration or contradiction;
- whether wording is explicit or inferred;
- whether the finding applies to a series, occurrence, store, or community.

Never convert silence into a negative fact. Preserve the source wording, then
store normalized value and interpretation separately.

When a store or organizer uses unfamiliar local jargon, branded labels, or
house terminology, preserve the original wording in the evidence but translate
it into plain player language in normalized records whenever the meaning is
clear enough.

Treat `structured paid pod-filling Commander` and `open-play Commander` as
meaningfully different experience types even when both are casual Commander.

When a source explicitly identifies a Commander `open play` day or time, treat
that as a real event type rather than as an absence of information. It may be
sparse on specifics, but it still represents a distinct social/operational mode
that should be modeled separately from structured pod-assignment or tournament
style Commander.

When a local source uses unfamiliar branded event language that matches an
official Wizards or WPN upstream program, normalize the local occurrence through
that upstream definition rather than leaving it as unresolved jargon.

For multi-location brands, do not automatically promote brand-level wording,
reward/support language, or policy text into a specific branch record unless
the branch linkage is clean.

For recurring-event displacement risk, do not require exhaustive proof that a
routine event was canceled or suppressed. A prominent same-day major event
signal such as an RCQ, championship, prerelease, large capped tournament, or
store-wide special can be enough to mark the routine series as `at risk` for
that date when the event would plausibly consume substantial space, staffing, or
player attention.

## Analytical synthesis

Assess at minimum:

- Bracket 2/3 personal fit and evidence;
- MTG-focus level: whether the venue is primarily a Magic space, a broader TCG
  store, or a mixed-use venue/community space where Magic is only one program
  among many;
- competitive/high-power warning signals;
- explicit proxy restrictions or permissions when stated;
- solo-arrival accessibility and pod-formation method;
- advance coordination channels;
- schedule reliability;
- community continuity and repeat-player potential;
- physical space and likely attendance range;
- distance in miles from the public Los Alamitos origin;
- special-event and prerelease interest;
- unresolved questions and verify-before-leaving risk.

All conclusions require a reason and confidence. Personal-fit analysis is not an
official fact and must be labeled accordingly.

For MTG-focus, prefer relative interpretation rather than false precision:

- **High MTG focus:** Magic is a primary identity driver or one of the main
  reasons the venue exists, even if Commander is only one of several Magic
  lanes.
- **Medium MTG focus:** Magic is clearly supported and recurring, but shares the
  spotlight with many other TCGs or gaming lines.
- **Low MTG focus:** Magic is real but only one smaller thread inside a much
  broader fandom, cafe, hobby, or event program.

This dimension is analytically separate from schedule reliability. A venue can be
high MTG-focus but still have weak schedule maintenance, or low MTG-focus but
still run a real recurring Commander night.

This dimension is also separate from Commander fit. A venue may be strongly
Magic-oriented overall while still supporting Commander in a way that is too
competitive, too sparse, or otherwise not a strong personal fit. Conversely, a
mixed-use venue can have only medium MTG-focus overall but still host an
excellent casual Commander pocket.

When newer analytical dimensions are added mid-project, treat the first
backfilling passes as calibration, not dogma. If MTG-focus, player-pool breadth,
venue-scale, or related secondary signals start producing weird rankings,
confusing conclusions, or obvious mismatch with lived player goals, pause and
revisit the framework rather than forcing every store to fit it.

## Research-run completion

A run is complete only when it records:

- scope and methodology;
- source-attempt ledger;
- raw evidence/artifact references;
- findings and conflicts;
- identity/reconciliation decisions;
- changes made to normalized data;
- validation performed;
- unanswered questions and next actions.
