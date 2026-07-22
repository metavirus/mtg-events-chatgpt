# Current Frontier

Last updated: 2026-07-21

## ChatGPT-Codex coordination checkpoint

The ordinary ChatGPT-to-Codex coordination proof is accepted. Future
ChatGPT-originated intake should use the Supabase coordination queue:
`coordination_items`, `coordination_sources`, `coordination_activity`, and
`public.submit_coordination_item(...)`.

The accepted governance boundary is proportionate to this one-user hobby
project: ChatGPT's connector is technically write-capable, but routine
coordination instructions limit it to non-canonical queue submissions. Codex
reviews queue items and promotes accepted material separately through the
controlled canonical-write workflow. The old PR/mailbox/file sideload path is
historical fallback only.

## Discord monitoring-map checkpoint

Current accepted Discord safety checkpoint:
`docs/DISCORD_READONLY_SAFETY_CHECKPOINT_2026-07-21.md`.

Cold-deep-link Discord content-read remains blocked/TBD at accepted boundary
`5e055e8`, and `members/@me?lurker=true` remains unallowlisted. A later
protocol test proved one safer UI-native modality on Collectors Lounge:
`Discord @me -> Stores/Local -> exact guild ID -> exact channel ID`. Its shell
and separate bounded five-message read both passed under the isolated-profile
guard without a lurker request or external state change. Only that mapped route
is `ui_native_navigation_verified`; other routes retain their prior safety
modes, and broad surveying/automation remain unapproved. See
`research/runs/2026-07-21-discord-ui-native-navigation-safety-test.md` and
`research/runs/2026-07-21-discord-lurker-blocker-diagnosis.md`.

The first structured Discord/community monitoring map is now live in Supabase.
Migration `20260721025750_add_discord_monitoring_map.sql` adds service-only
`discord_access_profiles` and `discord_channel_watchlist` tables without
granting browser clients operational-monitoring access.

The monitoring map now covers 8 already accepted Discord routes and 17 channel
watch targets. It began with Magic & Monsters, ProjectCCG Online Community, and
JJ's Collectibles, then expanded to Collectors Lounge - Cypress, Hobby Overflow,
Krazy Nick's Games, Kingslayer Games, and Paper Hero's Games after the accepted
pass-2 Discord/community work. It preserves the last working signed-in browser
access, joined/access state, observed gates, route value, cadence, high-value
channels, expected signal types, noise level, last checked date, and last useful
result. No new Discord research was performed for the expansion; it encoded
already accepted findings.

Known map gap narrowed: Paper Hero's Huntington Beach Magic channel already had
a direct channel URL; the follow-up direct-target recovery pass added direct
URLs for Collectors Lounge - Cypress, Krazy Nick's Games, and Kingslayer Games
watched channels. Hobby Overflow remains medium route value but is currently
invite-gated/blocked for channel-level monitoring until the user accepts the
invite in the relevant browser session or supplies a direct channel URL.

This is a receiving and continuity layer, not automation. Scheduled surveys,
browser-login persistence, broad Discord coverage, and structured survey
history remain deferred. Future Discord passes should start from this map and
write only sparse attention-worthy findings into `signals`. See
`research/runs/2026-07-20-discord-monitoring-map-pilot.md`,
`research/runs/2026-07-20-discord-monitoring-map-validation.md`, and
`research/runs/2026-07-20-discord-community-pass-2.md`. The direct-target
maintenance pass is recorded in
`research/runs/2026-07-20-discord-direct-target-recovery.md`.

Discord browser surveying is currently paused pending the read-only
social-surface safety protocol. A 2026-07-20 attempt to navigate inside a live
Discord tab accidentally posted channel references into Krazy Nick's
`#commander` from the user's account; the user deleted the accidental messages.
No conclusions from that attempted survey should be used. Future Discord passes
must use true direct URL navigation or another mechanically read-only method;
keyboard typing/paste/navigation inside Discord message views is forbidden. See
`research/runs/2026-07-20-discord-browser-safety-incident.md` and
`research/DISCORD_SWEEP_SOP.md`.

Additional hard guardrails are now live in the monitoring map: both
`discord_access_profiles` and `discord_channel_watchlist` have explicit
`safe_access_mode` fields. Collectors Lounge now has the first
`ui_native_navigation_verified` profile/channel; existing unproven accessible
routes remain `manual_open_required`, and gated rows remain
`join_or_role_gate`. Cold deep links are not certified by the UI-native result.

That manual workflow is explicitly temporary. The durable target is autonomous
read-only surveying through a dedicated isolated Discord profile with a narrow
navigation/extraction-only capability, page-level input suppression, and
network-level mutation blocking. The options, failure-closed contract, and
local-fixture-first proof plan are recorded in
`docs/DISCORD_AUTONOMOUS_READ_ONLY_ACCESS_DESIGN.md`. Guarded shell tests have
since been authorized and completed; one Collectors route has now passed a
bounded content-read proof, but broad autonomous surveying remains unapproved.

The first local-only proof tranche is now complete. A Discord-like fixture and
capability-limited extraction harness passed 8/8 automated checks: route/message
extraction worked; interaction methods were absent from the survey API; composer
input and mutating controls were disabled; mutation requests were blocked and
logged; and missing guards, editable focus, unexpected layout, and gated state
all failed closed. No Discord page or session was accessed. See
`research/runs/2026-07-20-discord-readonly-local-fixture-proof.md`. This proves
the local guard contract, not Discord compatibility, and does not promote any
route to `direct_navigation_verified`.

Production-form safety hardening now exists.
The reusable guard module in `scripts/discord_readonly_guard.mjs` provides
direct-channel shell navigation only, page-level composer/mutating-control
suppression, editable-focus checks, and Discord mutation request blocking/logging.
The ignored dedicated local workspace under `work/discord-readonly/` was created
by `scripts/discord_readonly_profile_setup.mjs`; no profile session, cookies, or
Discord content are committed. The production guard passed a local fixture proof
in `scripts/discord_readonly_production_guard_proof.mjs`. The real-Discord shell
test plan is recorded in `docs/DISCORD_REAL_SHELL_TEST_PLAN.md`; shell-only
tests have since run under explicit approval. Real Discord surveying remains
paused.

The first real-Discord shell test initially failed closed because the checker
did not detect enough Discord server/channel/main shell markers. The follow-up
shell-identity iteration now passes the same Paper Hero route using non-message
evidence: final URL route IDs match the mapped guild/channel IDs and the Discord
app shell mounts, while the guard heartbeat remains present, editable focus is
absent, enabled mutating controls are absent, and a Discord-shaped message POST
is blocked/logged. No message content was inspected, no research artifacts were
created, no external Discord state changed, no Signals/events/sources were
created, and no route was promoted. This makes a later content-read pilot
technically plausible, but it still requires separate approval and must remain
bounded to read-only extraction. See
`research/runs/2026-07-20-discord-real-shell-safety-test.md`.

The first tiny content-read pilot was attempted after shell-safety acceptance.
It failed closed at login, then failed closed again after isolated-profile setup.
Follow-up guarded attempts on JJ's, Magic & Monsters, Collectors Lounge, and
Krazy Nick's proved exact authenticated shells but encountered the same blocked
membership/lurker request before content extraction. A one-time manual channel
open did not prevent recurrence on Collectors. No message content was read, no
research finding was produced, no Signals/events/sources were created, and no
external Discord state changed. See
`research/runs/2026-07-21-discord-readonly-content-pilot.md` and
`docs/DISCORD_READONLY_SAFETY_CHECKPOINT_2026-07-21.md`. The bounded diagnosis
keeps the request blocked and does not recommend an allowlist without stronger
evidence; see
`research/runs/2026-07-21-discord-lurker-blocker-diagnosis.md`.

Separate app issue resolved: the reported app freeze/click failure was traced
to malformed weekly recurrence data, not card rendering volume. Paper Hero's
Friday draft and Saturday Pauper rows used legacy `weekday` strings without
numeric `dayOfWeek`, which could hang Supabase occurrence construction before
render limits applied. The two rows were corrected in Supabase and the app now
guards weekly recurrence projection against malformed recurrence data.

## Signals foundation checkpoint

Broad research is paused while the accepted Signals and Communities product
direction is built in bounded tranches. The design contract lives in
`docs/SIGNALS_AND_COMMUNITIES_DESIGN_CHECKPOINT.md`.

The minimal Supabase `signals` receiving model is now live and checked in. It
stores source-linked, expiring, deduplicable observations with explicit
priority, lifecycle, confidence, related-entity context, suggested action, and
promotion intent. Signals remain separate from canonical events, research
truth, Updates, and personal state. Browser clients have read-only access; no
automation, seeded records, or Signals UI has been added yet.

The Signals UI and bounded Communities surfaces have since been implemented.
Do not add filler Signals; future monitoring findings should remain sparse,
current, and planning-useful.

## Current research/data checkpoint

Card Addiction in Anaheim was added to live Supabase after a user-supplied lead
exposed a WPN/EventLink-first discovery gap. The addition is documented in
`research/runs/2026-07-21-card-addiction-main-pass-and-missed-store-sweep.md`
and applied through
`supabase/proposals/card-addiction-main-pass-2026-07-21.json`. The store is
captured as a real TCG storefront with official, social-route, organized-play,
review, directory, hours, and evaluation evidence. No event rows were added
because no current store-controlled/Wizards/EventLink/Discord MTG calendar
source was found in the bounded pass.

The same run note now preserves a small missed-store candidate list for later
landscape-confidence work rather than keeping those names in chat memory.

## Personal-state checkpoint

The clean product baseline immediately before authenticated personal-state work
is commit `72689dd` on `codex/reconcile-wizards`. The branch was clean, pushed,
and synchronized before this checkpoint was recorded.

Authenticated personal preference persistence is now implemented and live. The
accepted implementation uses simple Supabase email magic-link authentication
and keeps the scope personal-use sized:

- one personal email-auth account and minimal sign-in/sign-out UI;
- durable venue favorite and deprioritize preferences;
- durable event-series and, where specifically appropriate, dated-occurrence
  favorite and deprioritize preferences;
- one private personal note field per venue, event series, or dated occurrence;
- existing browser-local state retained only as an immediate signed-out/failure
  fallback and one-time import source;
- Supabase `entity_preferences` as the signed-in durable store, protected by
  user-scoped RLS;
- research truth remaining public/read-only and structurally separate from all
  personal preferences and notes.

Validation on 2026-07-19 confirmed that the hosted app can sign in and write
user-scoped venue/event-series preferences and notes into Supabase. Observed
rows included Finch and Sparrow venue notes, Finch event-series notes, and
favorite preferences. The app still keeps browser-local state as the signed-out
or write-failure fallback.

If auth email sends temporarily fail, check Supabase Auth logs first. The built
in Supabase sender can rate-limit magic-link emails during testing; the app now
surfaces that state instead of a generic failure.

## Permanent rollback checkpoint: personal-use deployment

The personal-use deployed baseline is commit `dd44e20` on
`codex/reconcile-wizards`, tagged
`checkpoint/personal-use-deployed-supabase-default-2026-07-17`.

If a future task loses continuity, corrupts direction, or needs a known-good
rollback anchor, come back to this checkpoint first. It is the accepted
inflection point where:

- the already-approved UX work is complete enough to leave polish mode;
- controlled Supabase research-write and deterministic JSON export/recovery are
  in place;
- Supabase is the default application read source;
- `?data=json` remains the explicit file-backed fallback;
- the static GitHub Pages deployment is live for personal use;
- research has resumed through controlled Supabase writes in small direct
  batches.

Do not reopen this checkpoint by default. Future work should move forward from
it unless the user explicitly asks to roll back or audit it.

## Accepted UX and deployment state

Accepted UX work now includes:

- Today decision-surface improvements, including weekend/week usability,
  Friday-start week views, today highlighting, and a non-blocking Signals
  treatment;
- Events scanability improvements, including denser catalog cards, cleaner
  list/week/month layouts, Friday-start weeks, today highlighting, and
  navigation for Events week/month views;
- Places assessment visibility, including separate research status, personal
  fit, confidence, rationale, evidence access, and compact preference controls;
- Updates/Communities usefulness improvements, including compact Updates
  filtering and clearer activity surfaces;
- responsive/layout fixes sufficient for the current local UX checkpoint.

Known UX follow-ups are future polish, not completion blockers, unless the user
explicitly promotes them. The main parked item is exploring whether Signals /
Fresh Signals should regain a more prominent default surface without restoring a
fixed right-side pane that consumes calendar width.

The next product stage is **research resumption through the controlled Supabase
write workflow**, not direct JSON editing. This sequencing is intentional. A
major earlier failure mode was unsafe or low-quality canonical JSON writing.
Do not resume broad research collection directly into JSON as the main path.

The controlled write workflow has now passed a minimal live pilot:

- proposal `supabase/proposals/workflow-pilot-2026-07-17.json`;
- one documentary `research_changes` insert only;
- affected venue: `collectors-lounge-cypress`;
- no venue, source, event, evaluation, schema, auth, RLS, or browser-write facts
  changed;
- prewrite and postwrite deterministic exports verified;
- hosted Supabase-default app and `?data=json` fallback still render.

Batch A identity/status clarifications have also been applied through the
controlled Supabase workflow:

- proposal `supabase/proposals/identity-status-batch-a-2026-07-17.json`;
- affected scope: Krazy Nick's / Honey Pot, Game Chest Irvine, ProjectCCG,
  Kingslayer, and Shuffle and Cut / The Realm;
- no event records, canonical JSON, app code, schema, auth, RLS, or browser-write
  behavior changed;
- postwrite export changed only `stores.json`, `sources.json`,
  `entity_sources.json`, `changes.json`, and `manifest.json`;
- `events.json` and `event_occurrences.json` were unchanged.

High-value event candidate replay A has been completed directly by the Project
Steward and its lean source/provenance refresh has been applied live:

- run note `research/runs/2026-07-17-high-value-event-candidate-replay-a.md`;
- proposal
  `supabase/proposals/event-candidate-replay-a-source-refresh-2026-07-17.json`;
- scope: Finch Birdcage VII, The Game Cellar, Next-Gen Games, It's GameTime!,
  and The Crimson Guild;
- conclusion: all five already had useful event coverage, so no duplicate event
  ingestion was needed;
- live write added/refreshed source provenance only: 6 source rows checked, 5
  venue-source links, 1 event-source link, and 1 research-change marker;
- no event facts, canonical JSON, app code, schema, auth, RLS, or browser-write
  behavior changed.

The default worker model is retired for this project. Future research batches
should default to direct Project Steward execution in small bounded tranches.
Do not launch workers/subagents unless the user explicitly approves a specific
exceptional worker. If a batch feels too large, split it into a smaller direct
batch instead.

The source-routing rules from the ChatGPT source-map packet are now durable in
`research/SOURCE_SOP.md`: review mirrors support fit/confidence/warnings,
marketplaces support activity and MTG inventory depth, non-MTG organized-play
locators support operation/branch identity, and official/store-controlled
event sources remain preferred for exact event facts.

Immediate next tranche:

1. Do not resume research inside the personal-state closeout; all remaining research
   stays durable in `docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md` and the other
   existing trackers.
2. After acceptance, return to the ledger rather than reconstructing research
   priorities from task memory.

Execution model:

- default to direct Project Steward execution for bounded low/medium work;
- do not use workers/subagents by default; use one only with an explicit
  user-approved exceptional reason;
- keep each tranche to one coherent outcome, proportionate validation, one
  commit/push, and a concise report.

## Supabase migration checkpoint

Supabase is now the accepted default read source for the hosted personal-use
app, with JSON retained as an explicit fallback.

Current status is documented in `docs/SUPABASE_MIGRATION_STATUS.md`:

- initial schema migration exists;
- current seed snapshot has been loaded into Supabase;
- row counts have been verified;
- security advisor was clean after migration;
- the missing `entity_sources.source_id` performance index was fixed and added
  to the migration;
- representative raw-data and read-adapter parity are accepted at repair commit
  `813c0f2`;
- the controlled research-write/export workflow is in place;
- the read-cutover checkpoint is accepted at `dd44e20` and deployed to GitHub
  Pages for personal use.

The safe read-adapter seam exists in `app.js`. Supabase is now the default app
source; `?data=json` remains the explicit recovery path. Initial validation at
`7e42202` found a status-vocabulary mismatch and dated-event duplication.
Repair commit `813c0f2` fixed both, and independent representative verification
accepted 97 semantic events with matching Today, Events, and Commander results
across JSON and Supabase. Use 5.6 before changing auth/RLS/write policy or
turning on authenticated personal/workflow writes.

## Completed local UX revision scope

The accepted local UX revision was a focused usability pass, not a full
Supabase write/auth build and not a renewed research expansion. The scope was
pinned in `docs/UX_MEGA_REVISION_SCOPE.md` and is now complete enough to move
forward. In short, it covered:

- make Today a decision-quality surface rather than a flat event dump;
- improve event filtering and search, especially Commander, prerelease/sealed,
  draft, favorites, confidence, and distance;
- make the Events catalog easier to scan while preserving the full retained
  universe;
- keep Fresh Signals / For You available on narrower layouts through a
  collapsible rail or drawer;
- present venue fit grade, numeric score, confidence, and research status
  consistently, with clickable rationale where records have calibrated
  evaluations;
- polish Updates labeling, typography, linking, and filtering enough that it
  works as an activity surface;
- fix obvious clickability, responsive, and terminology issues before publish.

This same pass may also complete foundation-only continuity work when it is
needed to protect the product direction or unblock the next UI step,
specifically:

- documenting the accepted split between research data, personal data, and
  workflow/request data;
- preserving the current read-adapter seam and parity-check discipline;
- locking in the durable server-side target for favorites, thumbs-down,
  ratings, notes, update-read state, and in-app `Ask Codex` requests;
- preparing the cutover sequence so browser-local personal state can later be
  replaced cleanly without redesigning the interaction model.

Still deferred from this local UX tranche:

- authenticated Supabase writes for favorites, thumbs-down, notes, and Ask Codex
  requests;
- autonomous daily/weekly agents;
- deep community automation;
- broad store re-research;
- making Supabase the default data source, which was completed after this local
  UX tranche;
- publishing until the Supabase/data-source and final acceptance gates are
  complete.

In short: this revision shaped the app around the durable hosted
personal/workflow model, but it does not ship the full signed-in write path.

## ChatGPT sideload handoff

When Codex quota is constrained, ordinary ChatGPT may assist only through the
guarded lane defined in `docs/chatgpt-sideload-sop.md`. Current cross-agent
messages live in `docs/agent-mailbox.md`; candidate discoveries, feature ideas,
and follow-ups enter through `docs/ASYNC_INTAKE.md`; ChatGPT-originated edits are
recorded in `docs/chatgpt-changelog.md` for later Codex audit.

New stores, venues, groups, events, and event series are candidate-only in this
lane. Ordinary ChatGPT must not create canonical entities.

## Research tranche state

Research is no longer paused for Supabase readiness. Supabase is the
operational/default research source, controlled Supabase research writes are
accepted, and manual canonical JSON research edits are forbidden.

The active research unit is now a small direct Project Steward batch. Each
ordinary store pass must inspect the baseline source suite enough to synthesize
both Places assessment and Events/calendar implications. The finite venue queue
and today's methodology-closure audit live in
`docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md`.

## Research rule when research resumes

Do not move on to the next store simply because a bounded discovery pass exists.
The active requirement is now a stronger candidate-grade first pass:

- enough source coverage from the standard suite to trust the read;
- enough actionable upcoming MTG event detail to make the store practically useful;
- enough synthesis to answer whether the store is a real candidate worth trying.

Working interpretation change:

- `discovery` = still too thin to act on comfortably
- `partial` in the current schema should be treated as the nearest current
  equivalent to a fully **reviewed** first pass
- future model direction is to separate research status, fit grade, and
  confidence rather than overloading one label

Tweedy Cards and Gaming already served as a test case for this refined standard
and was raised out of the earlier conservative Wizards-only bucket. Do not treat
older notes saying "repair Tweedy first" as current next work.

## Recently completed

- Discord baseline and completion pass for selected store and regional servers
- Cross-source top-venue public-site reconciliation
- Social baseline for the same top-venue tranche
- Comparable cross-source public pass for Collector Legion in Lawndale
- Persistence-checkpoint workflow added to project methodology and context docs
- Architecture refinement for personal visit logs and routine-event displacement risk
- Policy refinement: user field notes may be stored in repo-backed evidence as
  clearly attributed sources rather than only in private hosted state

## Current source status for this tranche

- Discord: substantial first pass complete
- Wizards/EventLink: substantial first pass complete
- Official websites / event-commerce pages: first pass complete for top venues
- Instagram / Facebook: baseline accessibility and profile-value pass complete
- Deep post-level social mining: partially complete and now required during store
  passes unless the source is actually blocked
- Additional nearby WPN-led stores are now being promoted in light-touch form
  when the listing text itself carries meaningful fit signals even before full
  social/website vetting.

## Strongest confirmed findings so far

- The Guild House has official public-calendar confirmation for Tuesday Commander
  from 6:00 PM to 9:00 PM.
- Kingslayer Fountain Valley has official Wednesday and Friday Commander event
  pages with explicit pod-pairing language and house rules.
- Finch and Sparrow has a much stronger public social/event footprint than its
  sparse Discord suggests.
- Collector Legion has a clean Tuesday Commander anchor, but its official site
  is strongly weighted toward Saturday special events, so weekend Commander
  should carry an explicit displacement-risk flag until more direct Saturday
  confirmation appears.
- The Guild House social pass is now complete and shows a currently active,
  operationally useful social footprint including recent Tuesday casual
  Commander and Friday special-Commander posts.
- The Guild House refinement pass clarifies that reservations help an already
  arranged group but do not by themselves solve solo arrival.
- Kingslayer Fountain Valley social pass is now complete and confirms that the
  brand's socials are active but too multi-location to outrank official branch
  event pages for weekly Commander specifics.
- Kingslayer Fountain Valley refinement now clarifies that `Slay Pass` should be
  read as Kingslayer house terminology for a paid, structured Commander entry,
  not as a separate Magic format.
- Methodology refinement: store-specific jargon should be translated into plain
  player language in normalized data, and multi-location brand wording should
  not be assumed branch-specific without clean linkage.
- User preference nuance: within Kingslayer branches, Fountain Valley remains
  the primary weighted location; Lake Forest is still worth watching as a
  secondary branch; Oceanside is effectively out of scope.
- Collectors Lounge now has a stronger normalized source map: the official site
  and online store are weak for weekly event ingestion, while Discord,
  Instagram, and Wizards form the canonical weekly monitoring trio.
- Collectors Lounge remains one of the strongest fit candidates, but its public
  website is weak for weekly schedule extraction; Discord plus Wizards remain the
  primary weekly pair there.
- Collectors Lounge refinement now clarifies that Friday casual Commander is a
  strong rules-level fit with Bracket 3/proxy-friendly signals. The absence of
  explicit staff-pairing or LFG language is neutral and does not block its
  promoted B+ / 4.1 judgment; medium confidence instead reflects that the lived
  size and social mix of Friday turnout have not yet been observed.
- Honey Pot Meadery stands out as a more newcomer-friendly nontraditional venue
  lead because the Wizards listing explicitly describes free-entry casual open
  play with drop-in pacing and loaner supplies.
- Honey Pot Meadery has now been strengthened by official-site and social
  review: the venue's own events page confirms recurring Wednesday casual
  Commander plus richer Magic programming like league/special-event/prerelease
  layers, making it one of the stronger secondary leads despite the longer
  drive.
- Honey Pot event normalization has now started in earnest: `God of Mischief`,
  structured Mead & Mana Commander League items, and a Hobbit prerelease have
  been promoted beyond store-level notes into first-class event records.
- Honey Pot signal-deepening pass now frames it more precisely as a
  medium/high-MTG-focus, fairly broad-opportunity venue: lively, real, and
  promising, but still not the same thing as a Magic-dedicated store ecosystem.
- Honey Pot has also become a methodology-significant source case: its official
  events calendar appears actively maintained with new Magic formats and variants,
  which is a strong positive signal for event curation and community-building
  seriousness. That calendar should be treated as a daily-refresh source, not
  only a weekly reference surface.
- Hobby Overflow now has much better source routing than before: active
  Instagram, an official website, and a Linktree that exposes a Discord path.
  The remaining unknown is not whether the store is active, but what its casual
  Commander tables actually feel like.
- Hobby Overflow's Discord-routing pass now adds a useful scale signal: the
  invite surface showed a real nontrivial server rather than a dead invite,
  which strengthens the case that the shop has meaningful player-pool breadth
  even before Commander-specific channel interpretation is complete. Under the
  corrected MTG-focus concept, Hobby Overflow also reads a bit more strongly as
  a Magic-substantial store overall rather than just a generic mixed-TCG lead.
- Hobby Overflow now also has a better physical/reputation signal set: Google
  Maps surfaced a 4.9 rating from 52 reviews plus owner/user photos showing a
  visible storefront play setup and a longer room with seated players, which
  materially strengthens confidence that it is a real organized-play venue and
  not only an active retail shell.
- Hobby Overflow's bounded Discord survey is now materially complete at first-pass
  level: the server is real at roughly 780 members / 185 online, has meaningful
  official/store-news structure plus a dedicated `Magic the Gathering` section,
  and shows some real MTG chatter. What it still does not yet show is dense
  Commander meetup/LFG behavior or a sharp read on Thursday Commander texture.
- Joyful Toad now has clearly active Facebook and Instagram surfaces, but the
  visible social emphasis is broader TCG promotion rather than Commander
  specificity, so `Chill Commander Night` remains promising but still less
  corroborated than stores with stronger Commander-facing socials.
- Joyful Toad's fuller pass now sharpens the newer signal dimensions too: it
  looks like a reasonably broad and active late-night TCG store with real scale
  signals, but still not especially Commander-centered in the currently visible
  content mix.
- Requiem's dedicated pass now clarifies that it is socially alive and worth
  watching, but in a venue-style way: Commander looks real, yet the weekly
  series is explicitly vulnerable to collaborations, special events, and room
  resets.
- Requiem's refresh pass now rounds out the first-pass story with bounded
  physical-space evidence from its official photos page. The venue looks more
  materially real as an in-person space than a text-only read would suggest,
  but no obvious public Discord route surfaced from the official site.
- Comic Book Hideout has now been promoted sharply upward from discovery status:
  the previous cautionary note appears to have inherited SoCalMagic's `No proxy`
  signal in error, while the real first-pass evidence shows free Sunday
  Commander, beginner-friendly Friday Night Magic, a `Thursdays are for Magic`
  social cadence, and explicit newcomer-friendly language.
- SoCalMagic now reads as a more important overall-map venue than its earlier
  placeholder note suggested: the `No proxy` Commander caution still matters,
  but the broader public evidence points to a serious Magic-dedicated shop with
  real MTG depth, helpful-staff signals, and larger-event capacity.
- The Cardboard Games research pass supports later promotion into a real partial
  record: strong official site, real official calendar, repeated Friday free-play
  Commander and Monday draft anchors in Wizards, explicit June 20-21 Marvel
  Super Heroes prerelease Sealed evidence on the official calendar, and now
  normalized upcoming August 8-9 Hobbit prerelease Sealed events, plus
  encouraging recent community recommendations. The normalization repair is now
  complete. The calendar is useful for specials but has category-tagging errors,
  Instagram is only a secondary operational source, and no official Discord
  route surfaced.
- Tweedy Cards and Gaming no longer belongs in the earlier conservative
  Wizards-only bucket. The repaired pass now clears the candidate-grade bar:
  Wizards plus Instagram corroborate real Friday Commander, Sunday Standard
  Showdown, and the July 17 God of Mischief Commander special, which is enough
  to treat Tweedy as a real reviewed candidate with modest rather than strong
  fit.
- Guildhall - Whittier has now been promoted into a real partial record too, but
  with a different lesson: it looks more like a lively nerd-bar/community venue
  than a clearly Magic-centered store, and current visible promotion gives much
  more space to the venue/bar identity than to MTG itself.
- Shuffle and Cut Games - La Habra has also jumped upward quickly: the official
  site strongly foregrounds Magic overall and visibly sells/promotes MTG
  prerelease/event entries, making it one of the strongest discovery-tier
  Magic-overall signals even though its obvious event-calendar route currently
  dead-ends.
- Alakazam Comics has also moved up: despite an SSL/certificate issue on the
  main site, alternate public routing revealed one of the stronger multi-format
  Magic signals in the tranche, including a dedicated MTG Facebook page and
  visible evidence for Pauper, Commander Party, and draft events.
- Lost Planet has also now been promoted into the promising-nearby bucket: the
  public source stack is unusually rich, with Facebook framing a
  community-driven hobby shop, Instagram routing directly to a monthly public
  calendar, and that calendar exposing unusually informative MTG event wording
  like `Tuesday Night Pods`, `Two Headed Giant Commander Night`, and `Bracket
  lvl2 Commander Party`.
- Lucky Seven Games has also now been promoted out of bare discovery status:
  the official storefront is current, clearly TCG-first, and explicitly says
  the location holds daily events and tournaments, while Wizards provides two
  recurring free-entry Commander anchors on Sunday and Monday evenings. The
  present limitation is not store reality but thin public community texture:
  the Instagram surface is real but still modest, so this currently looks more
  proven as a functioning MTG retail/event store than as a richly social
  pre-coordination hub.
- The Game Chest - Del Amo Fashion Center received the intentionally lighter
  treatment the user suggested. The result did not overturn the intuition:
  public evidence confirms a real location and Wizards-backed organized play,
  but nothing in the bounded pass surfaced stronger MTG-community texture or a
  compelling reason to prioritize this mall-location store over the stronger
  nearby candidates.
- Kingslayer Games - Lake Forest has now been promoted into a branch-aware
  partial record, but the key result is ambiguity rather than enthusiasm: it is
  clearly a real Kingslayer branch, yet the current Commander event wording
  appears to inherit Fountain Valley language inside the Lake Forest listing.
  That makes Lake Forest worth keeping in the watch set, but with lower
  schedule-confidence and lower interpretive clarity than Fountain Valley.
- Magic and Monsters has now emerged as the strongest candidate in this mini
  tranche so far. Official site and events-page evidence show a real,
  Magic-forward store with live event infrastructure rather than a stale or thin
  placeholder presence, and the public social surfaces are real too. It still
  needs later refinement if we want the full official event stream normalized,
  but it already reads as a meaningfully better candidate than a generic
  Wizards-only lead.
- SoCalMagic now carries a clearer caution flag: `Commander all day / No proxy`
  should be treated as a real negative-fit signal rather than a generic unknown.
- User field note: Finch Saturday structured casual Commander was a reasonable
  experience with random four-player pod assignment and loose 50-minute rounds.
- User field note: Finch Sunday casual/open-play Commander had no structure but
  a generally decent vibe.
- Finch refinement now clarifies that the store has multiple Commander tracks:
  routine Thursday Commander Nite, structured Saturday Commanderfest, and a
  separate louder Birdcage / Fish Bowl / cEDH special-event layer that should
  not be blended into routine casual Commander.
- Modeling refinement: explicit Commander `open play` should be treated as its
  own event type, not merely as underspecified generic Commander.
- Product requirement: recurring Commander should remain visible even when a
  larger same-day event may crowd it out; the app needs an explicit at-risk or
  displacement signal.
- Displacement-risk refinement: a prominently advertised same-day major event
  such as an RCQ is itself a strong enough warning signal to mark routine
  Commander as plausibly at risk, even without an explicit cancellation post.
- New operating-model refinement: official WPN/Wizards news should be treated as
  an upstream vocabulary and alert source so temporary event branding such as
  `Magic Presents: God of Mischief` can be translated before it appears in local
  store listings.
- New product-direction refinement: the app should not only synthesize a
  research view, but also support a daily landscape/dashboard mode driven by a
  lighter signal sweep across news feeds, socials, and urgent operational
  changes.
- New monitoring refinement: user-favorited stores, groups, venues, and event
  series should automatically be pulled into the daily monitoring tier rather
  than waiting for the normal weekly cadence.
- New analytical refinement: it is useful to score not just schedule reliability
  but also relative MTG-focus, so a Magic-centered venue can be distinguished
  from a broader mixed-fandom venue that happens to host Commander. This is a
  Magic-overall lens, not a Commander-dominance lens.
- Live calibration note: as MTG-focus, player-pool breadth, and venue-scale are
  backfilled onto already-reviewed stores, watch for weird or unhelpful outputs.
  If the model starts producing bad intuition, revisit it instead of forcing it.
- Workflow refinement: review/prominence and photo/play-space signals should get
  a bounded best-efforts pass during routine store research, not an unlimited
  extraction hunt. Deeper visual work should be reserved for top leads,
  favorites, or targeted backfill.
- Workflow refinement: if a store has an accessible Discord, a bounded Discord
  survey should be part of that store's main first pass rather than a deferred
  optional extra; capture events, announcement patterns, meetup/LFG signals, and
  overall source usefulness without trying to read the whole server.

## Highest-value unresolved questions

- Finch and Sparrow: clearer current read on the average Thursday table and
  how best to promote Finch Sunday open play into a normalized recurring series
- Collector Legion: stronger Saturday Commander confirmation versus tournament
  crowd-out
- Collectors Lounge: solo-arrival practice still needs in-practice confirmation,
  but the source-routing and rules-fit questions are now much clearer
- Requiem still needs a deeper first-class venue/community pass to move beyond
  promising-but-lightly-vetted status only in the narrower sense of turnout and
  practical pod behavior; its source-routing and schedule-flexibility story are
  now much clearer
- Hobby Overflow and Joyful Toad have now moved beyond bare discovery, but each
  still needs one sharper unresolved answered:
  - Hobby Overflow: what actual Commander pod formation and power expectations
    look like once Discord/community signals are interpreted
  - Joyful Toad: whether Commander is actively promoted anywhere more directly
    than the current Wizards listing
- The Guild House: actual solo-arrival behavior in practice remains important,
  but the current public-source ambiguity is now narrower and better defined
- Kingslayer Fountain Valley: how free play interacts with Slay Pass seating,
  and whether the prize/support package is confirmed branch-specifically for
  Fountain Valley

## Recommended next step

Return to product/research work that improves usefulness without depending on
Discord automation. The best next lanes are either:

- dense Events usability polish using current data; or
- a small corrected main-store research batch using non-Discord sources plus
  existing Discord route metadata only.

For research, resume from `docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md`. Do not
launch workers/subagents unless the user explicitly approves a specific
exceptional worker.

## After that

- complete the bounded research universe through controlled Supabase writes
- run final research coverage and data-integrity assurance
- run final end-to-end acceptance
- make the personal tool accessible through the existing deployment path
  after authorization
- later, continue turning promising nearby partials into sharper comparable records
- keep `docs/WORK_BACKLOG.md` current as the explicit repo-backed future-work log
- later, add an upstream-signal layer from official Wizards news for notable
  new-set, prerelease, Commander-product, and program-change awareness
- later, operationalize a daily light-signal sweep that can power a dashboard or
  alert rail without requiring a full deep research pass every day
- later, ensure favorites drive monitoring cadence and alert priority
- later, backfill MTG-focus / player-pool breadth / venue-scale carefully and
  treat the first results as a test of the framework, not final truth

## Temporary audit workflow

When helpful during methodology calibration, it is acceptable to publish a newly
committed store pass so the user can audit it in the live app immediately. This
is a temporary trust-building workflow, not yet a permanent requirement for
every ordinary store update.

## Caution flags

- Kingslayer social channels are multi-location and require branch-aware interpretation
- sparse Discord should not lower a store automatically; it is often a source-routing result
- recurring event listings are not guarantees; large same-day events may suppress
  a weekly Commander series without every source being updated in sync
