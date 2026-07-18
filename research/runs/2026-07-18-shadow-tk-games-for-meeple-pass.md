# Shadow Realm / TK / Games For Meeple corrected source pass

Date: 2026-07-18  
Pass type: main-store correction pass  
Validation level proposed: standard, because event-series rows are proposed.

## Scope

- Shadow Realm Collectibles
- TK Collectibles
- Games For Meeple

This pass corrected a process miss: Wizards/EventLink is a critical event
source, so the local crawler dependency issue was fixed instead of treating the
fresh Wizards check as optional.

## Tooling correction

The Wizards crawler failed because the active Python environment did not have
the repo-declared `requests` dependency installed. A project-local `.venv` was
created and `requirements.txt` was installed there. The crawler then completed a
fresh pull for 2026-07-18 through 2026-09-30 within 35 miles of the Los Alamitos
public centroid:

- 1,667 total events
- 920 Commander candidates
- 105 organizations

The temporary raw output was used for this pass and is not intended as a
versioned artifact.

## Findings by store

### Shadow Realm Collectibles

Event implication: write now.

Fresh Wizards/EventLink results showed:

- Monday 5:00 PM Commander Night, already represented in Supabase.
- Wednesday 5:00 PM Shadow Realm Standard Showdown, missing from the app.
- Thursday 5:00 PM Two-Headed Giant Commander variant, missing from the app.

Places implication: update assessment language. Shadow has broader Magic event
coverage than the current Places text implies, but the added rows reinforce the
same personal-fit caution: paid entry, prize-pool/top-placement language, and a
more structured/tournament flavor than the user's ideal relaxed Commander
environment.

Source coverage:

- Official site / social route: existing Linktree evidence already captured.
- Instagram: route captured through official/WPN surfaces; content replay not
  completed in this pass.
- Facebook/social: Linktree route captured; content replay not completed.
- Discord/community route: not found in this bounded pass.
- Wizards/EventLink: fresh 2026-07-18 pull inspected and supports the three
  Magic rows above.
- Reviews: existing KeepUp/Apple evidence already captured.
- Other useful sources: existing Yu-Gi-Oh locator evidence supports
  event-hosting capability.

### TK Collectibles

Event implication: write now, but narrowly.

Fresh Wizards/EventLink results showed:

- Saturday noon Casual Commander, already represented in Supabase.
- Sunday July 19, 2026 noon Casual Commander, not represented by the existing
  Saturday recurring row.

Because the Sunday entry appears only once in the checked Wizards window, the
proposal treats it as a dated one-off row rather than inventing a weekly Sunday
series.

Places implication: modest source-route clarification. TK remains a real but
lower-priority Magic candidate: Wizards supports active Commander, while public
texture remains stronger for general TCG/Pokemon/collectibles than for Magic
community depth.

Source coverage:

- Official site: already captured; generic/coming-soon retail support.
- Instagram: better route identified through Ravensburger/Apple surfaces:
  `https://www.instagram.com/_tkcollectibles/`; content replay not completed in
  this pass.
- Facebook/social: not materially resolved in this pass.
- Discord/community route: not found in this bounded pass.
- Wizards/EventLink: fresh 2026-07-18 pull inspected and supports the Saturday
  row plus one Sunday dated row.
- Reviews: existing MapQuest/Atly evidence already captured; Apple Maps was
  checked as a useful direct map/review route but not necessary for a separate
  write in this proposal.
- Other useful sources: existing Ravensburger/Lorcana and Riftbound locator
  evidence support event-hosting capability and the better Instagram route.

### Games For Meeple

Event implication: no new event write.

Fresh Wizards/EventLink results showed:

- Friday 5:30 PM Friday Night Magic Commander Night, already represented.
- Sunday 1:00 PM GFM Sunday Casual Play Commander Fun, already represented.

Places implication: no urgent assessment write. The existing assessment already
captures Games For Meeple as a credible multi-TCG Diamond Bar candidate with
Friday/Sunday Commander coverage and unresolved social/community texture.

Source coverage:

- Official site: inspected; currently in website/POS transition and routes
  questions through Discord, Instagram, or email.
- Instagram: route implied by official site and TCDB; content replay not
  completed in this pass.
- Facebook/social: TCDB lists social routes; content replay not completed.
- Discord/community route: official site says Discord is a contact route, but
  no invite/content was inspected in this pass.
- Wizards/EventLink: fresh 2026-07-18 pull inspected and shows existing
  Friday/Sunday Commander coverage.
- Reviews: existing Card Shop Hub/Yahoo/Trustpilot evidence already captured;
  Loc8NearMe was checked as a useful review mirror but did not require a
  separate write for this focused correction.
- Other useful sources: TCDB, Pokemon League, Flesh and Blood, and Riftbound
  locator surfaces support active multi-TCG/store identity and event-hosting
  capability, but no new MTG event row beyond Wizards was identified.

## Proposal

Prepared and applied proposal:

- `supabase/proposals/shadow-tk-games-for-meeple-event-correction-2026-07-18.json`

The proposal was applied to live Supabase on 2026-07-18. It did not edit
canonical JSON, app code, schema/auth/RLS, or personal preference data.

Applied live Supabase changes:

- update relevant WPN source freshness;
- insert Shadow Realm Standard Showdown series;
- insert Shadow Realm Two-Headed Giant Commander variant series;
- insert TK Sunday July 19, 2026 Casual Commander dated event row;
- attach WPN evidence to the new event rows;
- modestly update Shadow/TK Places assessment language;
- add one research-change marker.

## Post-write verification

Standard validation completed:

- Proposal validation passed before write.
- Live Supabase write applied through the controlled workflow.
- New event rows verified:
  - `shadow-realm-collectibles-shadow-realms-standard-showdown-3-17-00`
  - `shadow-realm-collectibles-two-headed-giant-4-17-00`
  - `tk-collectibles-casual-commander-2026-07-19`
- Event-source provenance verified for all three new rows.
- WPN source freshness verified for Shadow Realm, TK Collectibles, and Games
  For Meeple.
- Shadow/TK venue and evaluation updates verified.
- Relevant duplicate active event-series check for the three venues returned no
  duplicate rows.
- Local/browser preview was not run because this is a routine event/source
  write and Supabase record verification was the lower-overhead validation path.

## Deferred

- Shadow social/Instagram content replay remains TBD.
- TK Instagram content replay remains TBD.
- Games For Meeple Discord/Instagram content replay remains TBD.
- No Discord/community content should be used to support fit until actually
  inspected.
