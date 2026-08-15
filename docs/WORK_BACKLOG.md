# Work Backlog

Last updated: 2026-08-14

This is the explicit repo-backed log of work we still need to do.

Use it for:

- unfinished research work;
- deferred deep dives;
- app/product tasks not yet built;
- data-quality gaps and ambiguity we want to revisit;
- process improvements that protect continuity.

## Recently closed / operational baseline

- Compaction-resilient handoff posture: `CURRENT_FRONTIER.md` is the first
  recovery read and must remain compact. Fresh tasks should use targeted
  backlog searches/snippets instead of raw-reading this file. If a task
  compacts repeatedly before reaching a bounded result, stop the active lane,
  update `CURRENT_FRONTIER.md`/this backlog with the exact state and next
  action, and resume from that checkpoint rather than continuing into context
  churn.

- Cloud daily surveyor: the WPN daily lane now runs in
  `.github/workflows/daily-surveyor.yml` through GitHub Actions without the
  user's desktop or Codex session. Repository secret `SUPABASE_DB_URL` is the
  canonical execution credential for this lane. The first cloud proof completed
  successfully on 2026-08-09 and promoted WPN deltas through the shared event
  promoter. The same workflow now has optional Instagram/Facebook social lanes
  that run bounded profile probes when saved session-state secrets are present:
  `SOCIAL_INSTAGRAM_STORAGE_STATE_JSON` and
  `SOCIAL_FACEBOOK_STORAGE_STATE_JSON`. These lanes record surface checks,
  retain source artifacts only for clear dated MTG event facts or dated
  operational notices, promote clear date/time/title social event facts through
  the shared event promoter, and create sparse Signals only for urgent
  operational findings or dated MTG promo/opportunity findings. Retained
  artifact ids are passed into event promotion so app drawers can show the
  visual evidence without taking over the UI. Fuzzy profile/chrome/social text
  must remain quiet, not a "may have event" Signal.
  Keep Discord bracketed from the cloud job for now. This is operational
  baseline, not greenfield next work.

- Store source-completeness audit: use
  `.\.venv\Scripts\python.exe scripts\audit_store_source_completeness.py --limit 20`
  as the fast operator check for venues that still look WPN-only,
  directory-only, or otherwise source-thin. This is not a research pass by
  itself; it is the selector for deciding whether a store deserves a real main
  pass instead of another manual source-count spelunk. The broad hydration
  closeout is done; the current specific source-thin follow-ups are LVLUP
  GAMING TCG and The Bullpen 2.0 only.

## Active next-up

- **Community fuzzy-discovery checkpoint (canonical promotion/main passes
  completed 2026-08-13; remaining work is presentation and lower-confidence
  possibilities only):** the prior store/source discovery method was too
  literal and missed community-led Magic groups discoverable through ordinary
  fuzzy web searches. The evidence gathered on 2026-08-13 is pinned here for
  future monitoring and product presentation; do not re-run the completed
  promotions as research:
  1. `MTG OC`: completed. The existing canonical community now includes
     `https://www.meetup.com/magic-the-gathering-oc-casual/` as another source;
     its organizer/Discord identity matches the existing group. Do not create a
     duplicate community.
  2. `Los Angeles Gayming Society (LAGS)`: canonical discovery community now
     created. It is a distinct LGBTQ+ gaming community,
     not GayMTG. Known routes are `https://lagaymingsociety.org/`,
     `https://www.instagram.com/lagaymers/`, and Discord invite
     `https://discord.gg/gkf6Jwj`. AKBAR corroborates recurring LAGS Gaymer
     Night activity. The August 18 Magic The GAYthering item was later
     recovered and promoted through the community-event adapter as a
     LAGS/Magic The GAYthering community event using Precinct DTLA as the host
     location. It is not an official Precinct venue event. Signals, Updates,
     and event listings should route to the promoted event or source, not only
     to a descriptive popup. Final repaired state: the event/update owner is
     Los Angeles Gayming Society, Precinct is only location text, the Signal is
     linked to the event occurrence, and DB-backed Signals still use
     `promotion_target = event_proposal` because that is the allowed event-
     action enum.
     Discord channel classification follow-up completed August 14:
     `#meet-up` and `#announcements` are hot/watch sources; `#general` is a
     watch/sample source. `#meet-up` surfaced the Discord event card for Magic
     The GAYthering at Precinct DTLA on August 18, 2026 at 6 PM; that evidence
     is attached to the existing LAGS-owned event and Signal. `#announcements`
     revealed a new LAGS Discord event, Gaymer Night at WERK Long Beach on
     August 20, 2026 at 8 PM, with a Discord event link and Instagram cross-post.
     Continuity repair completed August 14: the event is now canonically
     promoted through the community-event adapter from the exact official LAGS
     Instagram post. LAGS owns the event; WERK Long Beach remains host-location
     text. The confirmed Aug 20 8 PM occurrence, exact source link, free entry,
     and event-opportunity Signal all passed live readback and idempotent replay.
     `#general` revealed a lower-confidence lead for Tuesday MTG at Witch's
     Cottage in North Hollywood. Promote these only via the community-event
     adapter: the group owns the event, and the bar/location is host-location
     context unless separately promoted as a store/community. Do not re-promote
     the WERK event.
  3. `GayMTG`: completed. The canonical reviewed LGBTQ+/allies Magic community
     has a full bounded main pass. Its verified route is
     `https://www.meetup.com/gaymtg/`; the current page showed 128 members,
     13 past events, and recent 2026 Commander/prerelease activity, but no
     future dated gathering. A bounded fuzzy hydration search found no other
     reliable official social or Discord route. Weekly Meetup monitoring is the
     steady-state path; do not reopen holistic research without a new lead.
  4. `Sanctuary MTG`: canonical reviewed community now created as its own active
     social Magic community. Known
     routes are `https://www.instagram.com/sanctuarymtg/` and
     `https://www.reddit.com/r/LosAngelesSocialClub/comments/1qe7s66/magic_the_gathering_social_club/`;
     evidence describes weekly Commander gatherings rotating among venues such
     as Frogtown Brewery and Lawless Brewing. Main pass completed August 13:
     both known routes and one bounded fuzzy search were inspected. After the
     Instagram login was refreshed, an authenticated slice of 18 recent posts
     was inspected. It confirmed active gatherings and past dated events at
     Frogtown Brewery and Belle's Bagels; the newest post said Sanctuary was
     changing its usual schedule and that a future flyer was still forthcoming.
     No concrete future dated event was therefore invented or promoted. The
     pass is closed; weekly monitoring may capture the promised later listing.
  5. Lower-confidence Home discovery possibilities, not canonical communities
     yet: Magic The Gathering LGBT Commander Meetup (Orange County), Here
     Clubhouse queer MTG, Topdeck Lethal, Lotus Guild, and Geeks OUT L.A.
     Corroborate each through a second fuzzy source search. Stale/2025-only
     groups should remain clearly labeled questionable possibilities rather
     than disappearing or becoming full Signals.
     These five leads are now loaded into `public.community_discovery_candidates`
     as unresolved `source_lead` coordination items. That queue is the source
     of truth for fuzzy community leads: promote only after a bounded
     corroboration search, then run a real main pass; otherwise mark the item
     deferred or rejected instead of letting it re-enter broad discovery.
  Canonical source attachment readback: MTG OC has 11 mapped sources, LAGS 3,
  GayMTG 1, and Sanctuary MTG 2. The later LAGS event promotion supersedes the
  earlier source-only note; no other community event was guessed. Remaining
  product follow-up: add a compact Home
  discovery/possibilities lane distinct
  from canonical Signals. A promoted community pass must inspect all known
  sources, perform one bounded fuzzy hydration search, and ingest any concrete
  attributable event facts found; it is not merely a source-identification
  exercise. User-fit rule: LGBTQ+/gay-inclusive groups are relevant; a
  women-only group is not a personal-fit recommendation for this user.

- Discord survey completion lane: finish classification for the already
  discovered/approved community Discords only. The goal is a durable
  HOT/WATCH, MAYBE, and IGNORE map that future recurring review can use
  without rescanning entire servers. This lane is not permission to resume
  broad community discovery or reopen the settled LAGS/Precinct ownership fix.

- Source-thin specific follow-up only: LVLUP GAMING TCG and The Bullpen 2.0
  remain worth a narrow continuity/source-confidence check if a future source
  pass is already in scope. Do not reopen the whole venue list or rerun broad
  "which stores are light?" sweeps without a new audit finding.

- WPN attention policy: WPN promotion now has a sparse adapter-owned attention
  annotation layer. It should create Signals only for explicit high-value
  classes such as favorite-venue prereleases, favorite-venue Commander specials,
  and Commanderfest-style events, while grouping multi-session weekends to one
  attention candidate per venue/event family. Keep ordinary newly listed WPN
  events as grouped Updates, not Signal spam. Continue tuning only from observed
  false positives/false negatives, not from abstract category expansion. Local
  proof on 2026-08-09 against the fresh WPN cache annotated 7 sparse attention
  candidates but created 0 Signals/Updates because there were no newly visible
  deltas to present; this is the intended no-spam replay behavior. The first
  cloud proof initially exposed a duplicate-session annotation edge case, then
  the policy was tightened to rank across the full venue/event family before
  pruning non-winners. Readback now shows one attention annotation per
  venue/event family.

- Canonical event ingest agent: implement the accepted source-neutral design in
  `docs/CANONICAL_EVENT_INGEST_AGENT_DESIGN.md`. WPN is the first adapter, not a
  separate canonical pipeline. WPN adapter contract v4 is complete: it emits
  deterministic eligibility, sparse typed facts, exact URLs, field/rule flags,
  and strict plus template grouping hints without making canonical merge
  decisions. The normalized observation table, compact run ledger, durable
  binding table, set-based WPN staging function, reconciliation preview, and
  one-command helper are now deployed. A service-only allowlisted reconciler
  now reconciles exact existing occurrences, exact recurring-series occurrences,
  and exact bounded finite-series occurrences set-wise. The first full safe-set
  run bound 647 observations (644 new, 3 replayed), inherited hiding for 42,
  produced zero duplicate slots, and fully replayed without writes.
  Deterministic new-series creation is also complete: 238 collision-free
  observations became 85 series, the original proof reached 886 bound rows, and
  replay remained no-write with zero duplicate slots. The August 12 closure pass
  then retired the safe WPN leftovers that had been too conservatively parked:
  distinct same-slot series can now promote when their identity is different,
  invalid explicit recurring targets are skipped rather than aborting the run,
  new-series occurrence inserts are deduplicated, and bounded safe-lane repairs
  handle stale recurring times, same-lane Commander aliases, finite prerelease
  title variants, and one-day finite-series extensions. Current production
  readback shows zero future eligible WPN observations left pending; remaining
  WPN work is ordinary future monitoring, not a store-hydration backlog. The
  shared finalizer is
  now deployed: bootstrap/backfill stays quiet, later source arrivals create
  venue-grouped Updates through existing `research_changes`, and only explicit
  adapter attention annotations can create Signals. Replay/no-delta runs remain
  silent. The first non-WPN adapter is now proven for clean confirmed official
  standalone/finite listings. The explicit existing-recurring-series occurrence
  lane is also complete: it preserves an exact target on the normalized
  observation, validates venue/recurrence compatibility, uses the shared
  presentation promoter, replays without writes, and has retired its former
  direct writer. The remaining direct WPN and official-event compatibility
  writers are now retired as well, and the promoter itself owns targeted
  recurring reconciliation. Safe existing-event lifecycle handling is now
  deployed through `reconcile_existing_event_lifecycle(...)` inside the shared
  promoter: same-schedule bound observations may enrich empty optional fields,
  while changed status/date/time/title/venue and two-snapshot WPN disappearance
  cases queue review instead of silently mutating, hiding, deleting, or
  cancelling Events. Post-ingest integrity is now covered by
  `scripts/audit_event_integrity.py --fail-on-critical`; the 2026-08-02
  checkpoint passed with zero critical issues across event/source/binding/
  artifact/duplicate-slot checks. Review-only buckets remain: date-only
  listings, series-source inheritance, no-proxy/low-fit presentation hiding,
  legacy WPN store-level URL provenance, and benign title-key normalizer
  differences. Do not "clean" the legacy WPN URL bucket unless exact current
  observation/source matches exist. Next continue sparse structured optional
  facts without blob-only normalization. A sparse later source must not clear
  richer facts established by another source. Do not add verbose per-event
  logging, a duplicate feed/catalog, or new Instagram/Discord crawlers in the
  first tranche.

- GitHub Actions/Supabase execution hygiene: use `SUPABASE_DB_URL` and the
  direct database helper path for cloud and local routine database work. The
  Supabase CLI can still emit a misleading PostHog shutdown timeout after
  returning valid rows; readiness treats that as nonfatal only when the expected
  result payload is present. For ad-hoc Codex SQL, prefer
  `python.exe scripts/supabase_query.py --sql "..."` or `--file ...` so valid
  payloads do not surface as scary PostHog failures. Do not re-open broad CLI
  authentication or Norton debugging unless the actual DB smoke test fails.

- Venue selection now comes from lifecycle-specific Supabase views, not old
  ledger TBD wording: `venue_baseline_candidates`,
  `venue_surface_retry_candidates`, `venue_surface_monitoring_candidates`,
  `venue_discovery_candidates`, and
  `venue_identity_resolution_candidates`. `venues.lifecycle_state` is the
  durable lifecycle authority. `steady_state` venues do not return to holistic
  batches for residual texture curiosity. For user-shaped queue work, use
  `venue_candidates_for_user(...)` so personally deprioritized or hidden venues
  stay out of ordinary discovery, retry, and monitoring selections.

- Runtime lane contract is now explicit:
  - `baseline pass`: only for `venue_baseline_candidates`; finite
    decision-grade first pass; target 5-8 minutes per venue, soft ceiling 10.
  - `identity-resolution pass`: only for named identity blockers or
    `venue_identity_resolution_candidates`; target 5-10 minutes total, soft
    ceiling 12.
  - `steady-state monitoring pass`: only for exact mapped surfaces from
    `venue_surface_monitoring_candidates`; target under 2 minutes per venue,
    soft ceiling 3, and a 5+ minute no-delta run is a workflow failure.
  Use `docs/EFFICIENCY_SOP.md` as the canonical contract and stop conditions.

- JJ's Orange is a known targeted identity boundary, not an ordinary store
  batch candidate. Future Discord findings that mention `Orange` must not be
  merged into Garden Grove. Revisit only when a new branch-identity source or
  explicit user request can resolve the separate Hidden Collectibles 2 /
  `jjscardemporium.com` lead.

- Discord survey cadence/status checkpoint:
  `docs/DISCORD_SURVEY_CADENCE_STATUS_2026-07-23.md` is now the lean operating
  map for small verified-route surveys. It separates ready routine routes,
  route-discovery candidates, blocked/TBD items, cadence, useful-signal criteria,
  quiet/stale handling, same-day Signal expiry, and write approval gates. The
  current Supabase-audited frontier is pinned in
  `research/DISCORD_SURFACE_FRONTIER.md`: 11 access profiles, 34 channel
  watchlist rows, 31 active rows, 3 blocked/TBD rows, and 20 high-priority rows.
  Agent-ready surfaces are MTG OC, Legendary Creature Club, Collectors Lounge,
  ProjectCCG, JJ's, Kingslayer, Magic & Monsters, and Krazy Nick's. Hobby
  Overflow and Paper Hero's remain blocked/finite-repair items; Buddies,
  CoreTCG, GXGAMERS, Next-Gen, Otaku Vault, Tilted, Turn Zero, Collector
  Legion, Spellhold, and Guild House are route-captured but not recurring-agent
  ready.

- ChatGPT-to-Codex coordination has moved to Supabase. New ordinary ChatGPT
  source leads, findings, questions, and proposals should be submitted as
  non-canonical coordination queue records, preferably through
  `public.submit_coordination_item(...)`. The legacy PR/mailbox/intake files
  remain historical fallback only.

- ChatGPT-enabled low-ceremony work lane TBD: build a better integrated path so
  ordinary ChatGPT can still help productively when Codex usage is exhausted or
  unavailable. The goal is not a quarantined hazmat workflow; it is a normal
  bounded contribution lane for structured research refreshes, source leads,
  surface checks, candidate signals, and possibly narrowly scoped canonical
  updates where the write shape is already typed and guarded. Design this around
  direct Supabase-backed intake/promotion rather than file dumps, branch
  rituals, or manual cleanup archaeology.

- Token-efficiency operating model review TBD: compare the actual three-channel
  workflow: this chat as orchestrator/direct executor, the separate steward
  chat as bounded canonical worker, and ordinary ChatGPT as an occasional scout
  when Codex usage is exhausted. Measure token burn, elapsed time, duplicated
  context loading, compaction risk, research quality, and whether any steward
  lane still earns its orchestration cost. The default should avoid designing
  here and then making the steward rediscover the same problem.

- Coordination cleanup TBD: when a Supabase CLI/session with Edge Function
  delete access is available, cleanly remove or disable the obsolete hosted
  `coordination-capability` temporary proof function. Its repo source and
  backing table are already gone; do not treat it as an active coordination
  path.

- Supabase execution environment is ready. Routine typed writes now prefer
  direct `psql` through `SUPABASE_DB_URL`; linked Supabase CLI remains a
  fallback/admin path. If a genuine CLI admin capability fails, repair it as a
  platform issue immediately, but do not route ordinary data work through CLI
  just to rediscover telemetry or profile-state noise.

- Discord review audit guardrail is active: future Discord sweeps must maintain
  the `research/DISCORD_SURFACE_FRONTIER.md` audit ledger and pass
  `scripts/validate_discord_frontier.py` before claiming a hot/watch/sample
  channel is reviewed or agent-ready.

- Durable source-image evidence in Supabase Storage: Phase 1 and the incidental
  app presentation are complete
  (`coordination_items.id = 1ff603bd-b5c1-4878-ab75-c2f284430088`,
  status `ready_for_review`): the private bucket, provenance/analysis/link
  tables, typed RPCs, content-addressed cache, and narrow ingest/analyze/link
  helper now exist. Two supplied Discord screenshots were ingested, analyzed,
  linked, and retained privately. Signed-in users see a compact clickable row
  only in an affected Event, Signal, or Place Evidence view; the private image
  and its extracted facts load on demand. A Signal should target its canonical
  event when one exists, while keeping source and image evidence separately
  clickable. No image UI is rendered when no artifact exists. Do not expand
  into automated screenshot capture, OCR infrastructure, Updates-feed
  presentation, or broad backfill until real usage demonstrates need.

- Instagram/Facebook assisted-session POC: login-gated Meta surfaces should use
  the ignored `work/social-auth/` persistent profile plus the ignored
  `storage-state.json` restore file before being declared blocked. The
  storage-state shim is intentionally belt-and-suspenders: it preserves cookies
  and local storage for the next probe when a Playwright persistent-context
  relaunch drops a session cookie. Once auth is healthy, run the tiny
  personal-use loop: inspect a bounded recent-post slice, ingest at most one or
  two MTG-relevant artifacts, classify app relevance, and stop. Meta surfaces
  are hostile and terms-restricted, so this is an assisted source-review path,
  not a broad scraper.

- Phase 2 workflow simplification proof is complete. Ordinary source/surface
  checks land through `record_entity_surface_check(...)` into
  `entity_surface_coverage`. Material changes may also create a targeted
  `research_changes` row; quiet, thin, blocked, route-only, and no-delta checks
  do not. The coverage row is durable without proposal JSON, SQL package,
  export, Markdown ledger edit, text-integrity run, or Git commit.

- Collector Legion's July 25, 2026 monitoring delta has been handled: the
  August 7-9, 2026 Hobbit prerelease sessions are now represented through the
  reviewed/typed event-write path. Do not resurrect it as a pending event
  action; only revisit Collector Legion for a fresh material source delta,
  explicit user request, or the separate social-texture follow-up below.

- Cold-deep-link Discord content-read is blocked/TBD at accepted boundary
  `5e055e8`. The current accepted safety baseline is recorded in
  `docs/DISCORD_READONLY_SAFETY_CHECKPOINT_2026-07-21.md`. The local fixture
  proof passed, the production guard exists, shell identity can be proven without
  reading messages, and the first content-read pilots failed closed without
  reading content or changing external Discord state. Paper Hero, JJ's, Magic &
  Monsters, Collectors, and Krazy Nick's all proved shell identity but triggered
  blocked `members/@me?lurker=true` behavior before content extraction. The
  approved one-retry rule did not clear it, and a manual one-time open did not
  prevent recurrence on Collectors. Do not allowlist the undocumented
  state-changing-looking request without separate approval and stronger
  evidence. Guarded UI-native paths have since passed shell and bounded-content
  proof for Collectors Lounge and JJ's: `@me -> Stores/Local -> exact guild ->
  exact channel`. The replication pass failed closed for ProjectCCG and Magic &
  Monsters because Discord attempted message acknowledgement POSTs during
  server selection. Do not allowlist those writes merely to make the routes
  pass. No broad Discord survey is authorized. Preserve the route map,
  priorities, expected signal types, isolated profile, read-only guard, and
  quiet/blocked-run semantics. If separately approved, the next Discord step is
  a tiny pilot that independently proves the same path per selected route.
  The acknowledgement state-machine experiment now distinguishes an exact
  blocked read-state acknowledgement from reply/reaction/upload and other
  mutations, but the ProjectCCG and Magic & Monsters reruns failed earlier
  because the isolated `@me` shell exposed no server/folder controls. Do not
  graduate acknowledgement handling yet. A later bounded safety test may first
  diagnose that isolated-profile guild-list hydration boundary without reading
  messages or reducing route value.

- Recent app blocker resolved: the Events/Today freeze was traced to two
  malformed active weekly Paper Hero series with legacy `weekday` recurrence
  values and no numeric `dayOfWeek`. The Supabase rows were corrected and the
  app now fails closed on malformed weekly recurrence data instead of hanging.

- Card Addiction has been added as a real Anaheim TCG store through
  `supabase/proposals/card-addiction-main-pass-2026-07-21.json`. The
  supporting main-pass/root-cause/missed-store sweep is durable in
  `research/runs/2026-07-21-card-addiction-main-pass-and-missed-store-sweep.md`.
  No event rows were added; Card Addiction's current MTG calendar remains a
  named event/source TBD.

- Authenticated personal preference persistence is implemented and live. The
  hosted app uses Supabase email magic links, user-scoped venue/event-series
  preferences, and one private personal note per target, with browser-local
  state retained as a signed-out or failure fallback.
- 2026-07-25 auth persistence tweak is implemented and pushed: the client now
  uses implicit magic-link flow instead of PKCE so sign-in should survive the
  user's normal browser/app/email-link context better. Marked done subject to
  user verification after the temporary Supabase email rate-limit clears.
- 2026-07-28 auth root-cause fix is implemented: startup hash routing was
  consuming implicit magic-link `#access_token=...` callbacks before Supabase
  Auth could persist the session. The app now detects auth callbacks before
  app-route hash handling. Pending user verification on the hosted app.
- 2026-07-19 validation confirmed signed-in Supabase rows for venue notes,
  event-series notes, and favorites. Research facts remain unchanged by
  personal actions.
- Remaining research is already durable in
  `docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md` and the existing packet/TBD
  trackers. Resume from those records only after the personal-state checkpoint
  is accepted.

- The permanent personal-use deployment baseline is commit `dd44e20`, tagged
  `checkpoint/personal-use-deployed-supabase-default-2026-07-17`. If future work
  blows up, return to that checkpoint before reconstructing state from chat.
- Supabase operational-write readiness and the default-read cutover are now in
  place. The hosted app uses Supabase by default and keeps `?data=json` as the
  explicit fallback.
- The minimal live Supabase write pilot passed using
  `supabase/proposals/workflow-pilot-2026-07-17.json`: one documentary
  `research_changes` insert only, with prewrite/postwrite exports verified.
- Batch A identity/status clarifications were applied through
  `supabase/proposals/identity-status-batch-a-2026-07-17.json`. The write
  clarified Krazy Nick's / Honey Pot, Game Chest Irvine, ProjectCCG,
  Kingslayer, and Shuffle and Cut / The Realm without changing event records.
- High-value event candidate replay A was completed and applied only as a lean
  source/provenance refresh:
  `supabase/proposals/event-candidate-replay-a-source-refresh-2026-07-17.json`.
  It confirmed Finch Birdcage VII, The Game Cellar, Next-Gen Games, It's
  GameTime!, and The Crimson Guild are already event-covered enough to avoid
  duplicate ingestion.
- The local UX pass is accepted; do not resume Today/Events/Places/Updates
  polish as the default next step unless a true blocker appears.
- Default research execution is now direct Project Steward work in small
  batches. Do not launch workers/subagents unless the user explicitly approves a
  specific exceptional worker.
- The active finite research queue and closure-audit baseline is
  `docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md`.
- The ChatGPT PR #15/#16 packet is preserved and structurally disposed in
  `docs/CHATGPT_PACKET_INGEST_TRACKER_2026-07-17.md`; use only the tracker rows
  when a specific packet-derived item is selected.
- Tiny Updates housekeeping: applied Supabase `research_changes` rows can still
  display as `PROPOSED`, and midnight UTC timestamps render as the prior evening
  in Pacific time. This is not blocking; later clean up applied statuses and use
  local-safe timestamps for user-visible update entries.
- Migrate canonical research and personal continuity in explicit reversible
  stages. Async request/workflow data remains deferred.
- Treat `docs/UX_MEGA_REVISION_SCOPE.md` as the accepted local UX scope that has
  now been substantially completed, not as the default current execution queue.
- Use `docs/SUPABASE_CONTINUITY_MODEL.md` as the plain-language contract for
  what belongs in research truth, personal continuity, and workflow/request
  state during this transition period.
- Resume broad research only through the controlled Supabase research-write
  workflow, with generated JSON treated as export/recovery output rather than a
  manual canonical editing surface.
- Use the source-routing rules in `research/SOURCE_SOP.md`: review mirrors and
  marketplaces inform fit/confidence/activity, while exact event facts should
  come from official/store-controlled/EventLink/event-platform evidence where
  possible.
- Use `docs/IMPLEMENTATION_PLAN.md` as the active build sequence.
- Preserve the remaining research queue; do not mistake an evaluated subset for
  a completed regional census.
- Tighten the ordinary-store-pass SOP so "checked" means candidate-grade useful,
  not just lightly classified.
- Tweedy Cards and Gaming has already served as the current test case for that
  improved first-pass standard; older "repair Tweedy first" instructions are no
  longer active next-work.
- Continue migrating repo/app language away from overloaded `partial` semantics
  toward an explicit model of:
  - research status
  - fit grade
  - confidence

## Research backlog

- **Bullpen specific follow-up only:** the
  `bullpen-wpn-event-capture-calibration-2026-07-24` proposal has been applied.
  Friday draft, Wednesday Standard, and August 7-9 prerelease inventory are now
  represented as caveated WPN-backed events while the venue remains
  low-confidence/deprioritized. Revisit only for store-controlled identity/source
  continuity, event firing reliability, community texture, or a new contradiction.

### High priority

- Collector Legion social-texture follow-up only:
  - determine whether Saturday routine Commander is ever explicitly promoted;
  - keep watching for evidence that large Saturday events crowd out routine Commander;
  - optionally look for an even cleaner Instagram extraction path if future passes need it.

- Finch and Sparrow follow-up:
  - look for clearer signals about the average Thursday table experience;
  - determine the strongest current source path for Finch Sunday open-play
    Commander so it can be modeled as its own recurring series;
  - keep watching for current specials so Birdcage / Fish Bowl / cEDH content
    remains cleanly separated from routine casual Commander.

- Collectors Lounge Cypress:
  - confirm whether Friday casual Commander has any explicit staff help for
    seating solos into pods or whether players self-organize informally;
  - keep Friday and Saturday clearly separated as casual versus optimized lanes;
  - watch for any special events that could suppress the routine Friday/Saturday
    Commander lanes without every source updating in sync.

- Newly promoted WPN-led stores:
  - Honey Pot Meadery: continue refining the newly normalized richer event stream
    (Wednesday Magic Night, league, specials, prerelease-like items) and later
    assess actual turnout/community feel
  - Requiem: Coffee, Tea, and Fantasy: determine practical turnout, pod
    formation, and whether future social/current-calendar checks regularly
    surface Commander-specific posts or mostly broader venue programming
  - Hobby Overflow: inspect Discord/community behavior now that official routing
    is clear, and determine whether casual Commander is a real social lane or
    just a listed event slot
  - Joyful Toad TCG: find Commander-specific corroboration beyond the Wizards
    listing, because current socials skew broader-TCG rather than clearly EDH
  - SoCalMagic: verify whether the explicit `No proxy` language is stable and
    whether any mitigating context exists

### Research coverage queue

Use `docs/RESEARCH_COVERAGE_LEDGER_2026-07-17.md` as the current finite venue
queue. It replaces the older discovery-list view, which mixed untouched leads,
already-evaluated records, structural packet dispositions, and promoted stores.

Current queue shape:

- mandatory corrected main-pass/status queue: 22 venues;
- micro-backfill queue from the 2026-07-17 closure audit: 7 venues;
- optional/deeper queue: promoted or mostly complete venues with named
  decision-changing TBDs.

Recommended first post-checkpoint batch:

- Grails Gone Wild;
- Buddies Collectibles;
- Tilted Gaming.

Reason: this small batch directly addresses the recent methodology correction:
obvious-source capture, source-content inspection, and conservative event/status
claims without reopening the whole packet.

### Medium priority

- Backfill already-covered priority stores after the initial research set is
  broader:
  - apply MTG-focus consistently
  - apply player-pool breadth / venue-scale consistently
  - capture representative play-space image evidence when clearly available
  - sanity-check whether the new dimensions improve the analysis or create weird
    distortions

- The Guild House:
  - real solo-arrival behavior
  - whether Tuesday Commander has any power-level norms in practice

- Kingslayer Games - Fountain Valley:
  - how Slay Pass structure feels in practice
  - whether Wednesday and Friday differ meaningfully in competitiveness
  - whether Kingslayer's booster-pack / prize-support wording can be tied
    cleanly to Fountain Valley-specific Commander listings rather than only
    broader Kingslayer-branded evidence

- Spellhold Games:
  - pod formation behavior
  - whether the long Saturday open-play window is actually easy for solo arrival

## Group/community backlog

- Keep groups modeled separately from stores/venues.
- Discord surface status is centralized in
  `research/DISCORD_SURFACE_FRONTIER.md`; use that before reopening broad
  Discord discovery.
- MTG OC guarded Discord proof is operational across nine mapped channels.
  Preserve its canonical attention ordering: meetup coordination involving
  `Metavirus` is highest signal; direct questions/requests mentioning the user
  are next; other meaningful mentions can surface when actionable. Community
  meetups may use known venues, bars, or changing locations without becoming
  official venue programming.
- Deepen the regional-group pass for:
  - Legendary Creature Club
  - Infinite Loop MTG
  - ProjectCCG community surfaces
- Look for other relevant Southern California Magic groups with geographic value,
  especially groups likely to help with meetups rather than only store events.

## Upstream signal backlog

- Research official Wizards news as an upstream signal source:
  - `https://magic.wizards.com/en/news`
  - `https://wpn.wizards.com/en/news`
  - identify which categories are most likely to create local store-visible
    events, such as new sets, prereleases, Commander products, Commander Party
    style promotions, format/rules changes, or unusual play-program announcements
  - maintain a normalized glossary for temporary or branded event types that may
    later appear in local listings, such as `Commander Party` or `Magic
    Presents: God of Mischief`
  - decide whether those items should feed a notable news ticker or alert rail in
    the app
  - keep this layer separate from store-specific facts until a local event signal
    is actually observed

- Add a daily light-signal monitoring loop:
  - all user-favorited stores, venues, groups, and event series should be
    automatically included
  - official Wizards/WPN news feeds
  - favorite/high-value store socials
  - key community/group announcement surfaces
  - emergency/cancellation/displacement keywords such as closed, postponed,
    canceled, sold out, special hours, RCQ takeover, or event moved
  - use the daily sweep to drive alerts and triage, not full re-research
  - include Honey Pot Meadery's official events calendar as a daily-refresh
    source because it is actively posting new formats/variants and appears to be
    a serious event-curation surface

## App/product backlog

### Data and ranking

- Implement explicit displacement-risk / at-risk flags for recurring events.
- Preserve ambiguous events instead of discarding them, but rank/filter them
  appropriately.
- Pilot complete on Finch and Collectors Lounge; continue calibrated rollout of
  the separate user-facing layers for:
  - research status (`discovery`, `reviewed`, `deepened`)
  - fit grade (A-F or equivalent)
  - confidence (low/medium/high)
- Clickable fit/confidence rationale is implemented for calibrated stores;
  extend it as additional stores receive explicit evaluations.
- Support recurring-versus-one-off distinction clearly in the UI.
- Support freshness/staleness indicators for sources and event evidence.
- Add an MTG-focus dimension so stores/venues can be distinguished from mixed-use
  fandom or event spaces where Magic is only one slice of the programming.
- Keep MTG-focus distinct from Commander fit so we do not accidentally treat
  "not Commander-led" as "not Magic-focused."
- Add a player-pool breadth / venue-scale dimension, but treat the first
  backfill pass as calibration; if results feel distorted or unhelpful, revisit
  the model rather than hardening it prematurely.
- Capture one representative play-space image reference when clearly available
  and relevant, using it as supporting evidence rather than hard proof.

### UI changes needed to address ingest and presentation of new items

- Completed: event drawers now show an `Added to catalog` date, app reads
  paginate beyond Supabase's 1,000-row REST limit, and promoted WPN occurrences
  retain exact clickable event URLs in their source trail.

- Completed: event cards and event detail now separate favorite/follow, neutral
  closed-eye `hide for now`, and thumbs-down/not-for-me controls. The eye writes
  the event-series visibility preference without changing canonical event
  status, venue assessment, source truth, or the thumbs-down rating signal.
- Completed: hidden events show `Hidden by you` and remain recoverable through
  the hidden/poor-fit bucket rather than disappearing from the catalog.
- Calibration TODO: hiding currently applies to the event series preference key,
  so future occurrences in that series stay out of normal views. Add a separate
  occurrence-only hide later only if real use shows that the series-level scope
  is too broad.
- Add a compact `New since your last visit` entry point with counts by venue and
  event kind. Opening it should reveal all newly presented events, grouped
  rather than promoted individually.
- Group multiple sessions/occurrences into one event-series presentation while
  keeping every canonical occurrence accessible and individually linked to its
  source where available.
- Group Updates from one ingest by series and venue, with an expandable event
  count. Routine verification and unchanged metadata should create no visible
  Update.
- Keep Signals selective and deduplicated by user decision/action. Additional
  occurrences or sources should strengthen one Signal rather than create
  duplicates. Retain `Act first`, `Worth knowing`, and collapsed handled/expired
  presentation tiers without imposing a data-loss cap.
- When an ingest produces a large delta, switch automatically to digest
  presentation: all events remain available, while the default UI shows venue/
  series groups and only independently actionable Signals.
- Show temporary `New` markers and concise changed-field summaries on affected
  event groups instead of repeating the entire event description.
- Ensure hidden events stay out of default Today, Events, Signals,
  recommendations, and periodic review surveys, while remaining recoverable
  through the collapsed hidden group or an explicit include-hidden control.

### User-facing features

- Signals foundation and first-class UI are implemented. Continue tuning only
  from observed use: sparse signal criteria, click-through quality, read/unread
  behavior, and whether Signals / Fresh Signals deserve a stronger default
  surface without becoming an inbox.
- Calendar-first default view with scrolling upcoming events.
- Weekly and monthly calendar modes.
- Parked design question: whether Events should gain a separate "Top picks this
  week" surface above the calendar. The user deliberately deferred this while
  Week/Month grouping and scanability are evaluated; do not add it by default.
- Store-hours interface support now exists on Places, backed by the
  `venue_hours` Supabase table when available and an optional exported fallback
  shape. Remaining work is a small source-backed data population pass for
  high-interest stores.
- Daily dashboard / landscape view for what is newly relevant right now.
- Store detail pane with source links, address, and event history.
- Group detail pane separate from store detail pane.
- Favorites exist for stores, event series, communities, and relevant personal
  views. The global Favorites toggle now has visible state/count feedback;
  remaining work is behavioral calibration, especially how favorites should
  affect monitoring cadence and default ranking.
- Personal notes and ratings in hosted app state.
- Click-through behavior exists for most surfaced content, including recent
  Signal and Communities pulse details. Continue tightening any remaining
  non-clickable cards or metrics only when real use exposes friction.
- Optional Google Maps / directions links from store detail views.
- Background activity log link for favorites, notes, and important changes.
- Google Calendar add-to-calendar action if/when we wire that in.
- During the current calibration phase only, allow selective publish-after-store-pass
  when needed so the user can audit the updated record in the live app quickly.

### Personalization and preference controls

- Implement the accepted Supabase model with one operational database and
  strict namespacing between:
  - research-authored fields
  - user-authored fields
  - agent/workflow metadata
- Authenticated cross-device personal state is implemented with browser-local
  fallback. The 2026-07-28 magic-link callback fix prevents app hash-routing
  from consuming auth tokens before session persistence. Pending user
  verification on the hosted app.
- Continue calibrating behavioral impact for favorites, ratings, notes, and
  follow-up flags so they shape ranking, monitoring, and reminders without
  feeling bolted on.
- Revisit the event-level `Interested` action after the Discord community-event
  proof. Keep series favorite/follow available on quick event cards, but make
  dated `Interested` / `Going` state visibly affect Today, reminders, and
  planning surfaces instead of behaving like a quiet detail-drawer toggle.
- Negative preference controls now exist for stores and event series. For
  events, the closed-eye control handles neutral hiding from normal views, while
  thumbs-down records an active not-for-me/dislike signal. Continue monitoring
  whether individual dated occurrences need separate per-date hide or
  thumbs-down behavior later.
- The event calendar has an explicit hidden / poor-fit bucket so avoided or
  no-proxy items are retained without competing for prominent planning slots;
  the neutral hide/unhide behavior is tracked in the common ingest/presentation
  UI section above.
- Places now also tucks explicit/very-low-fit venues into a closed `Hidden /
  low-fit` group and removes those venues and their events from ordinary
  recommendation, highlight, and visible research-count surfaces. Underlying
  venue/event records remain recoverable.
- Reassess the top-level `Favorites` control only after real use. It currently
  acts as a visible global favorite-mode toggle where pages support it; future
  work should decide whether it becomes a stronger `My stuff` mode or remains a
  lightweight filter.
- Add saved view presets such as `My commander view`, `Weekend scan`, `All
  updates`, and `Discovery queue`.

### Today page refinement

- Accepted local UX work now gives Today a stronger decision surface. Keep the
  following items as future polish/calibration rather than immediate blockers.
- Further tune the curation/ranking layer so a day's events are not presented as
  a flat chronological dump.
- Continue calibrating default daily ranking around favorite stores, high-fit
  stores, Commander bracket 2/3 signals, and prerelease/sealed highlights.
- Draft should be easy to phase in as a secondary preference rather than forced
  into the default top-priority mix.
- Do not add a broad `Limited` super-filter unless a real third limited subtype
  becomes useful. For this app, keep the practical filters separate:
  Prerelease/sealed as a high-signal planning class, and Draft as an interesting
  but lower-default-priority class that should stay easy to reveal without
  competing with Commander or prerelease/sealed.
- Continue improving `why am I seeing this?` drilldowns so ranked and
  highlighted items feel trustworthy.
- Explore how to keep `Fresh Signals` and `For You` prominent after the fixed
  Today side rail was removed from the default layout.
- Do not restore a permanent right-side pane that consumes calendar width by
  default; consider a compact inline summary, slim edge affordance, drawer, or
  other non-blocking treatment instead.
- Revisit whether `Fresh Signals` / `For You` deserve their own dedicated log,
  drawer, or popout rather than routing `View all` into the noisier Updates
  stream.
- Support `HOT` editorial flags for especially notable items, used sparingly for
  truly high-value discoveries.
- Audit and fix search behavior on the Today page so keyword search matches
  event title, format, store name, venue name, and other relevant metadata.
- Improve empty-state explanations when search plus current filters eliminate
  all visible events.

### Updates and activity surfaces

- The `Updates` label and basic filter-chip behavior have been improved in the
  accepted local UX pass. The nav badge now behaves as an unread indicator for
  accepted updates and opening Updates marks that count read until new accepted
  items arrive. Remaining items below are future activity-surface work, not
  current blockers.
- Continue refining the Updates timeline layout if it becomes a blocker during
  final acceptance; otherwise treat alignment/weight as polish.
- Add useful update-type filters such as:
  - new place discovered
  - store/venue profile materially updated
  - new event discovered
  - event changed/cancelled
  - research follow-up needed
  - waiting-on-user / agent question
  - app/product change completed
- Add richer embedded links so update entries can open the relevant store,
  event, community, or research view directly.
- Define and implement a common app-visible ingest framework across the three
  daily survey agents: WPN, Instagram/Facebook, and Discord. Each surface should
  emit normalized findings into the same user-facing model instead of burying
  useful discoveries in agent chat or per-surface logs:
  - routine/no-delta checks update monitoring state and may appear only as quiet
    coverage in source/activity drilldowns;
  - meaningful discoveries, changed schedules, source-health changes,
    reclassifications, new community activity, and useful stale context become
    Updates/Activity entries with direct links to the affected event, place,
    community, source, or evidence;
  - only high-action, time-sensitive, or personally relevant findings become
    sparse Signals;
  - every surfaced item keeps source family, source record, confidence,
    ownership semantics, and whether the finding was automated, assisted, or
    manually reviewed.
  This should be designed before the Discord daily agent becomes cloud
  automation so the user can inspect surfaced ingest in the app rather than
  needing to ask Codex what happened.
- Let Updates carry lightweight follow-ups from Codex, including small A-vs-B
  questions and waiting-on-user clarifications.
- User responses inside Updates should be able to unblock immediate execution
  rather than always waiting for the next scheduled daily run.

### Research coverage and drilldowns

- Make more dashboard summary cards and metrics clickable when they imply an
  underlying dataset.
- On the Research Coverage page, clicking `Discovery Queue` should open the
  lightly vetted places behind that count.
- Extend the same drilldown pattern to other cards, rankings, and evidence
  summaries when they represent real underlying records.

### Places page refinement

- Places now exposes research status, fit, confidence, rationale, evidence, and
  compact preference controls. Recent accepted work added the mobile
  bottom-sheet place picker, compact sort/filter row, favorites-first default,
  and a closed `Hidden / low-fit` group for deprioritized venues. Remaining
  layout work is future polish unless a final-acceptance blocker appears.
- Revisit the Places page layout and scrolling behavior later if the most
  important reading surface still feels awkward in real use.
- Evaluate whether the current master-detail split should stay as-is or whether
  the right-side detail content should feel more central.
- Continue refining the Places page as a second-pass layout problem rather than
  treating the current version as final.

### Communities page refinement

- `Relevant chatter` now leads the page with recent meetup coordination,
  invitations, direct questions involving the user, and useful event-adjacent
  planning chatter. Personal involvement ranks first, but venue ideas,
  attendance, timing, and format discussion may appear without becoming a
  cross-app Signal. It preserves Discord thread context and links to the
  related plan, place, community, and source.
- The three formal regional communities remain first-class visible hubs.
  Store Discords remain equally valid chatter sources but appear as compact
  communication routes rather than being misrepresented as separate formal
  communities.
- Chatter cards have a one-click personal Hide action. False positives are
  acceptable; dismissal must be easy, reversible through read history, and
  non-destructive to canonical research.
- Communities now separates recently useful channels from the full route
  inventory. A channel earns the visible activity group only through recent
  conversational findings; route-status metadata does not qualify, and quiet
  channels naturally remain in the collapsed directory.
- Discord/community scanner classification should be purpose-first, cadence
  second. Preserve channel purpose labels such as `operational`,
  `structured_events`, `meetup_coordination`, `lfg_pod_formation`,
  `event_adjacent_chatter`, `community_pulse`, `format_rules_texture`,
  `commerce_trading`, `noise_social_only`, and `stale_dormant` in
  `expected_signal_types`, notes, or a future first-class field. Cadence can be
  derived later from purpose, recency, and observed signal quality.
- **Deferred pending recurring-agent efficiency proof:** richer Discord chatter
  enrichment and limited recurring sweeps. Before expanding beyond the proven
  high-signal paths, measure the real recurring-agent time/token cost and
  reliability. If viable, prioritize operational, structured events, meetups,
  LFG/pod formation, and active event-adjacent chatter; do not make every active
  channel daily by default.
- Daily Discord automation ladder is accepted as the path to v1:
  1. first-batch bounded proofs are complete for MTG OC, eligible LCC rows, and
     Collectors Lounge as of August 15;
  2. local micro-sweep script `scripts/run_discord_daily_survey.mjs` is built
     over MTG OC, eligible LCC rows, and Collectors Lounge only; it supports
     `--dry-run`, `--plan-only`, `--limit`, `--surface`, `--write-watchlist`,
     `--no-signal-writes`, and `--json-log`, and has passed plan-only plus a
     one-row guarded dry run;
  3. local pressure testing has also passed Collectors scoped dry-run
     classification, one-row write-watchlist proof, clean psql command-tag
     parsing, an overlapping-run lock check, and a 12-row MTG OC + Collectors
     write-watchlist proof with LCC explicitly excluded. That proof ran August
     15 in about 3m37s with 3 quiet coverage, 4 event candidates, 4 stale useful
     contexts, 1 accepted-signal-class finding, 0 failed rows, and 12 watchlist
     writes;
  4. full local v1 write-watchlist proof including eligible LCC rows passed on
     August 15 in about 4m53s with 16 selected, 16 guarded reads, 16 watchlist
     writes, 0 failed rows, 5 quiet coverage, 6 event candidates, 4 stale useful
     contexts, and 1 accepted-signal-class finding. Signal/Event writes remained
     disabled. GitHub Actions workflow is now added as
     `.github/workflows/daily-discord-survey.yml` with strict timeout, manual
     dispatch, morning PT schedule, storage-state auth hydration, and artifact
     logging;
  5. first full-profile cloud-secret attempt found the local dedicated Chrome
     profile archive is about 215 MB and the local `gh` API credential returned
     `401 Bad credentials` while setting the secret. Do not retry the
     giant-profile-secret lane;
  6. August 15 storage-state proof exported
     `work/discord-readonly/storage-state.json` at about 216 KB, then read LCC
     `#events` successfully from a fresh empty disposable profile using only
     that state. Because direct GitHub secrets are limited to 48 KB, the next
     cloud proof should use the encrypted-file/passphrase-secret lane:
     `.github/secrets/discord-readonly-storage-state.json.enc` plus
     `DISCORD_READONLY_STORAGE_STATE_PASSPHRASE`;
  7. first GitHub-hosted cloud smoke `31906774728` passed with
     `write_watchlist=false`, `surface=lcc`, and `limit=1`: storage state
     decrypted, LCC `#events` read safely, outcome `quiet_coverage`, 5 messages,
     no external Discord state changed, and no prohibited successful responses;
  8. MTG OC cloud smoke `31906955049` passed with `write_watchlist=false`,
     `surface=mtg-oc`, and `limit=2`: `#events_activities` and
     `#monthly-meetings` both read safely, both produced event-candidate
     outcomes, and no external Discord state changed;
  9. full cloud dry run `31907388569` passed on August 15 after the read-only
     guard was narrowed to tolerate blocked Discord `settings-proto/{version}`
     preference sync. It selected 16 rows, read 16/16 safely, produced 0
     blocked/unsafe rows, and kept watchlist writes off;
  10. full cloud write-watchlist run `31907685212` passed on August 15 in about
      5m15s. It selected 16 rows, read 16/16 safely, wrote all 16 watchlist
      states, produced 5 quiet coverage, 6 event candidates, 4 stale useful
      contexts, and 1 accepted-signal-class finding, and direct Supabase
      readback confirmed `last_checked_at=2026-08-15 20:53:36.595+00` on the
      written rows. Signal/Event writes remain disabled;
  11. next implementation frontier is durable app-facing surfacing of daily
      Discord/Instagram-Facebook/WPN activity updates and only then bounded
      Signal/Event promotion from accepted Discord findings.
  The v1 outcome contract is `accepted_signal`, `event_candidate`,
  `quiet_coverage`, `blocked_repair`, or `stale_useful_context`. Quiet/noisy
  runs update monitoring state only; they do not create visible Signals.
- The v1 runner logs duplicate channel-URL ambiguity warnings. Current known
  ambiguity: LCC `#mtg` shares a URL with an older `Discord Events` row whose
  latest result is `needs_deeper_replay`; keep it visible in run logs and do
  not promote the guild Events surface into automation until repaired.
- LCC route repair completed for eligible channel rows by applying the same
  documented `Stores/Local` folder hint used in the successful August 14 LCC
  proof. `#events`, `#lfg`, `#meet-ups`, and `#mtg` now pass guarded UI-native
  reads in the daily runner. The older LCC guild Events / duplicate-channel row
  remains a separate `needs_deeper_replay` item and is still excluded.
- MTG OC route stability was improved by using its documented `Stores/Local`
  folder hint and one bounded retry for the exact non-mutating
  `mapped channel anchor is not uniquely visible after guild selection` failure.
  This is a retry of the same guarded route only, not a looser click/search
  fallback.
- Extend the relevant-chatter proof when a direct non-meetup question such as
  the Finch and Sparrow mention is captured canonically; it should rank below
  meetup coordination but remain visible and clickable.
- Community cards and the detail drawer now expose useful activity, monitoring
  state, upcoming community-owned events, personal connections, known host
  locations, curated activity, and mapped sources. Quiet-but-monitored is an
  explicit healthy state; last successful check stays separate from last
  meaningful activity.
- Community event rows explicitly separate `Organized by` from `Hosted at`.
  A park, bar, game store, home, or unpromoted location-text host never becomes
  event owner merely because the community gathers there. The local LAGS proof
  renders Magic The GAYthering as LAGS-owned and Precinct DTLA as location text.
- Complete the richer Discord audit layer after the bounded UI proof: expose
  safe access mode, expected signal types, last-seen cursor, latest run result,
  cadence, and scanner treatment when those fields are available to the app.
  Current Sources content already shows mapped routes, last checks, and the
  existing inspected/needs-context treatment without inventing unavailable
  scanner fields.
- Legendary Creature Club bounded Discord survey completed on 2026-08-14:
  `#events` and `#lfg` were quiet for current planning, `#meet-ups` proved a
  stale but real same-night meetup/location coordination thread, and the guild
  Events surface failed closed because no unique Events control was observed.
  Watchlist state and community surface coverage were updated; no current
  Signal/Event was created.
- Completed: captured the August 8 MTG OC post-meetup acknowledgment/photo as a
  source-grounded personal connection in live Supabase. It links MTG OC,
  the August 8 Collectors Lounge gathering context, and the Discord
  `#events_activities` source without facial identification or inferred
  relationships, and remains useful through later quiet periods.
- Consider a Communities-page async request box for instructions like `watch
  this server for Saturday commander meetup chatter`.

### Async collaboration workflow

- Add in-app Codex request capture, likely a top popdown drawer or command box,
  for async instructions to future research/dev sessions.
- Support async note types for:
  - general async requests
  - research follow-up tied to a place/event/community
  - product/UI fix tied to a specific screen or record
- Let entity-specific notes be attached to stores, events, event series, venues,
  and communities for later investigation.
- Daily-agent runs should review prior backlog items, resolve easy fixes
  directly when possible, and surface in-flight or unresolved items back into
  Updates.
- If a backlog item needs discussion, the agent should be able to do preliminary
  research and then add a waiting-on-user note into Updates.
- Add page-specific `dear AI, watch for X here` capture on surfaces like
  Communities where ongoing pattern-watching is especially valuable.

### Visual system and naming

- Rename the app from `Mana Radar` to `MTG Events`.
- Revisit supporting subtitle/copy so branding stays coherent after the rename.
- Re-do typography best-practice review after the regression that left the base
  font scale smaller than intended.
- Audit base font size, text hierarchy, and readable defaults against current UI
  best practice and restore a more normal reading scale.
- Reassess whether `Import updated data` belongs in the normal user-facing UI;
  if retained, add stronger explanation and guardrails, and if not, move it to
  an admin/dev-only surface.

## Process backlog

- Governing process rules live in `docs/EFFICIENCY_SOP.md`,
  `research/SOURCE_SOP.md`, and
  `docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md`. Do not duplicate their
  checklists here.
- Routine database-only surface checks land through
  `record_entity_surface_check(...)`. Ledgers/backlog entries are for queueing,
  named unresolved work, and higher-level state, not mandatory paperwork for
  every ordinary source disposition.
- **Non-urgent documentation pruning:** `docs/PROJECT_CONTEXT.md` and
  `research/SOURCE_SOP.md` remain substantial because they hold product
  semantics and source/closure rules. Consider a further split only if fresh
  task onboarding still proves slow; do not create another overlapping manual.
- Generated JSON and connector apply packages are temporary recovery/execution
  artifacts, not backlog deliverables.
- Maintain this file whenever we defer or discover meaningful future work.
- Use `CURRENT_FRONTIER.md` as the concise current handoff. Historical
  checkpoints live under `docs/archive/`.
- Use proposals for Lean/Standard/Full data changes. Use dedicated run notes only
  for substantive findings, incidents, or method changes.
- Keep attributed user field notes in repo-backed evidence when they are meant to
  be durable project knowledge.
- Next possible overhead reduction, not current work: add a narrow typed RPC for
  WPN-backed event upserts if WPN event capture remains too proposal-heavy, or
  establish a direct steward DB execution path if approved Standard writes still
  spend too much time in connector ferrying.
- At the next stable checkpoint, perform a deliberate branch-hygiene pass:
  review the active worktree, make an intentional checkpoint commit, create or
  rename into a broader canonical working branch for the full project, push it,
  and record the transition clearly so future work does not remain anchored to
  the legacy `codex/reconcile-wizards` name by accident.
- Backlog note from the accepted UX pass: explore whether Signals / Fresh
  Signals should regain a more prominent default surface without restoring the
  fixed right-side pane that consumed calendar width. This is not a current
  blocker.
- Discord monitoring status and deferred automation live in
  `docs/DISCORD_SURVEY_CADENCE_STATUS_2026-07-23.md` and the monitoring map;
  do not restate the evolving safety frontier here.

## Done when

- The backlog is helping us remember deferred work rather than becoming a junk drawer.
- The highest-value unknowns for each promising venue are explicitly tracked.
- A fresh Codex session could resume from this file, `CURRENT_FRONTIER.md`, and
  the run folders without losing momentum.
