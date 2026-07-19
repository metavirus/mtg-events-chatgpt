# Turn Zero / ProjectCCG main-pass correction

Date: 2026-07-18  
Pass type: main-store correction after WPN-first event pass  
Validation level proposed: lean if assessment/evidence-only; standard if the Turn Zero Canadian Highlander event is later normalized into calendar rows  
Status: proposal prepared; not applied

## Why this correction exists

The prior Turn Zero/CoreTCG/Aki/ProjectCCG pass successfully filled WPN-backed event rows, but it explicitly was **not** a full main-store pass. Kavi asked to follow through with the corrected methodology: source routes, especially Discord/community routes, should be inspected when reasonably accessible and should feed both Events and Places conclusions.

This correction focuses on the stores where the new main-pass review changed the planning read:

- ProjectCCG - Santa Ana / OC
- ProjectCCG - Alhambra
- Turn Zero Games

CoreTCG and Aki were checked against the current live evidence state, but this pass did not find a clean new change that should be proposed for them right now. CoreTCG already has Discord route captured but not inspected because joining would be an account-side effect. Aki remains supported mostly by WPN, TCGplayer, review mirrors, and Instagram route evidence; no store-specific Discord route was found in the quick sweep.

## ProjectCCG - Santa Ana / OC

### Source coverage

Official site: inspected/captured earlier; official ProjectCCG site supports the primary Alhambra storefront and ProjectCCG brand, but it is not by itself the strongest Santa Ana source.  
Instagram/Facebook: not deep-replayed in this correction.  
Discord/community: inspected. ProjectCCG Online Community is a real ProjectCCG two-store Discord with branch-specific OC channels and MTG channels. Visible first-pass surfaces included `oc-announcements`, `oc-events`, `mtg-announcements`, and `mtg-discussion`.  
Wizards/EventLink: already checked/captured in the preceding event pass; supports Tuesday/Friday/Sunday Commander, Sunday Draft, and Tuesday/Friday Standard Showdown.  
Reviews: not newly replayed.  
Other material sources: Yu-Gi-Oh organized-play branch listing already supports Alhambra and Santa Ana as distinct branches.

### What Discord actually showed

- Server identity is ProjectCCG-specific and branch-aware.
- OC channels exist separately from broader MTG channels.
- OC staff post operational updates, closures, schedule changes, and event-related notes.
- `oc-events` included OC tournament schedule posts and a late-June MTG Standard/free-event note.
- `mtg-announcements` included MTG Commander Party, draft firing, Tuesday/Friday Standard locals at 6:30 PM, MTG Store Champs, MTG Pride Night, and Marvel Super Heroes prerelease signals from May-June 2026.
- `mtg-discussion` was active on July 17-18, 2026, including Standard locals chatter and a July 18 message asking whether anyone wanted to get a Commander pod going.

### Places synthesis

This materially improves ProjectCCG Santa Ana. It is not just a WPN branch with thin metadata; it has a live operational community route, branch-specific staff announcements, visible MTG activity, and useful event-reliability signals.

Personal fit improves because:

- Santa Ana is relatively close.
- Multiple Magic lanes exist.
- Discord appears likely useful for checking whether events are firing or whether people are looking for pods.

Confidence remains medium rather than high because the first pass still did not resolve proxy policy, pod matching, solo-arrival friendliness, or casual-vs-competitive Commander texture.

### Event disposition

Commander: represented in Supabase; Discord supports real community chatter but no new formal Commander row.  
Draft: represented in Supabase by Sunday Draft.  
Prerelease/sealed: Discord showed historical/recent prerelease signals; no new future write from this pass.  
Other Magic/FNM/specials: Standard Showdown represented in Supabase; Discord corroborates Standard locals.  
Event write now: no.  
Event TBD: yes, if future Discord images/posts expose specific dated MTG specials not already in WPN.

## ProjectCCG - Alhambra

### Source coverage

Official site: inspected/captured; supports 39 S Garfield Ave Alhambra as ProjectCCG's main storefront.  
Discord/community: inspected as a two-store route, but the bounded read was more OC-specific than Alhambra-specific.  
Wizards/EventLink: captured; supports free Wednesday 5 PM Magic Commander Night at Alhambra.  
Reviews/social: not sufficiently replayed in this correction.

### Places synthesis

Alhambra is real and Magic-relevant, but this correction should not call it fully reviewed. The official site and WPN record are solid, and the two-store Discord is material. Still, the useful Discord content found in this pass was mostly OC-lane content, not Alhambra-lane content.

Keep Alhambra as a real but lower-priority discovery/review candidate until a branch-specific source pass checks Alhambra social/review/Discord texture.

### Event disposition

Commander: represented by Wednesday 5 PM WPN row.  
Draft: unresolved.  
Prerelease/sealed: unresolved.  
Other Magic/FNM/specials: unresolved.  
Event write now: no new event rows beyond the already-applied WPN row.  
Event TBD: Alhambra branch-specific event replay.

## Turn Zero Games

### Source coverage

Official site / Linktree: inspected. Linktree supports website, Discord, current schedule, and card-selling intake. The current schedule link points to a Discord CDN image route that appears stale/dead in this pass.  
Discord/community: route found through Linktree; not inspected because the content was not already accessible without joining/side effect in this pass.  
Wizards/EventLink: already checked/captured in the preceding event pass; supports Commander, FNM Modern, and future prerelease coverage.  
Reviews: already captured from prior pass.  
Other material sources: Canlandex inspected; supports Turn Zero Canadian Highlander.

### What changed

Canlandex lists Turn Zero Games as a California Canadian Highlander venue:

- every other Saturday
- 1:00 PM
- Discord route
- proxy-friendly competitive-casual relevance by format/source context

This is a strong Magic/community signal and is especially relevant because proxy-friendly competitive-casual play is part of Kavi's preference profile. It is not Commander, and it should not be over-weighted as direct Commander fit.

### Event disposition

Commander: represented by WPN Wednesday Commander.  
Modern/FNM: represented by WPN Friday Modern.  
Prerelease/sealed: represented by WPN Hobbit and Reality Fracture prerelease rows.  
Canadian Highlander: material event/community signal, but not written now because the current app recurrence model projects weekly recurrence cleanly and would overstate an every-other-Saturday event unless dated occurrences or a biweekly-safe rule are added.  
Event write now: no.  
Event TBD: decide whether to add dated future Canadian Highlander occurrences once cadence can be safely anchored.

## Proposal

Prepared:

- `supabase/proposals/turnzero-projectccg-main-pass-correction-2026-07-18.json`

Proposal summary:

- Captures inspected ProjectCCG Discord as visible Evidence for Santa Ana and Alhambra.
- Adds a substantive Santa Ana Places evaluation.
- Keeps Alhambra conservative instead of prematurely marking it fully reviewed.
- Captures Canlandex as Turn Zero evidence and marks Canadian Highlander as event/community TBD rather than a calendar write.
- Refreshes Turn Zero assessment notes around the stale schedule image and Discord/source-routing reality.

## Remaining TBDs

- ProjectCCG Santa Ana: deeper Discord/player texture for proxy policy, pod formation, solo arrival, and Commander casual/competitive mix.
- ProjectCCG Alhambra: branch-specific main pass for social/reviews/Discord/event breadth.
- Turn Zero: inspect Discord content if joined/approved; decide whether Canadian Highlander can be represented safely as dated future occurrences.
- CoreTCG: Discord content remains route captured / not inspected unless Kavi joins or approves the join side effect.
- Aki: Instagram content and Saturday/Friday Commander turnout remain unresolved; no Discord route found in quick sweep.
