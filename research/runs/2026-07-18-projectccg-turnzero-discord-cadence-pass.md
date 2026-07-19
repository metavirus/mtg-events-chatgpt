# ProjectCCG / Turn Zero Discord and cadence pass

Date: 2026-07-18  
Pass type: targeted deep replay / ledger-based follow-up  
Validation level proposed: lean, because the recommended write is assessment and
Evidence only. Use standard validation only if future event rows are later
added.

Status: proposal prepared; no live Supabase write applied yet.

## Scope

- ProjectCCG - Santa Ana / OC
- Turn Zero Games

This pass came directly from `docs/STORE_TREATMENT_LEDGER_2026-07-18.md`.
It was not a broad main-store pass. The question was whether the named Discord
and cadence TBDs could be moved into a more durable state without redoing WPN,
identity, or already-accepted event work.

## ProjectCCG - Santa Ana / OC

### Sources checked

- Existing live Supabase venue, Evidence, evaluation, and event rows.
- ProjectCCG Discord, already captured as Evidence:
  `https://discord.com/channels/1436522338572046501/@home`
- Discord channels inspected or attempted:
  - `oc-announcements`
  - `oc-events`
  - `oc-questions`
  - `mtg-announcements`
  - `mtg-discussion`

### What the Discord pass supported

`oc-announcements` is a useful operational reliability channel. The visible
bounded read showed store/staff updates such as closure, early close, power
outage, and operational-change announcements. That supports the idea that the
Discord is worth checking before traveling.

`oc-questions` was active in the current week and showed staff/customer
interaction, but the visible recent content was mostly product, trade-in, and
inventory support rather than Commander texture. It supports live staff presence
and customer traffic; it does not prove pod formation, proxy policy, or
solo-arrival comfort.

`oc-events` and `mtg-announcements` were visible as relevant channels, but the
bounded browser read did not expose useful message content in this pass.
`mtg-discussion` was also visible, but this pass did not successfully extract a
fresh, reliable MTG discussion sample beyond the prior accepted read. A browser
scroll retry timed out, so this pass deliberately stopped rather than turning
Discord access into a tooling side quest.

### Event implication

No new ProjectCCG event write is recommended from this pass.

The existing Supabase rows already cover the WPN-backed Santa Ana lanes:

- Tuesday Commander
- Friday Commander
- Sunday Commander
- Sunday Draft
- Tuesday Standard Showdown
- Friday Standard Showdown

This pass did not find a new source-supported future dated special or recurring
series that should be added to the calendar.

### Places implication

ProjectCCG Santa Ana remains a strong nearby planning candidate, but this pass
should slightly narrow what the Discord supports:

- Stronger: operational reliability, staff updates, active customer/support
  traffic, branch-specific OC routing.
- Still unresolved: proxy policy, pod formation, casual-versus-competitive
  Commander texture, and solo-arrival friendliness.

Recommended durable status:

- Discord/community status: `first-pass useful`, not `deep-reviewed`.
- Monitoring: worth checking before a visit, but not yet enough to mark
  `monitor regularly` as a standing daily source.
- Fit grade/score: no change proposed.
- Confidence: no change proposed.

## Turn Zero Games

### Sources checked

- Existing live Supabase venue, Evidence, evaluation, and event rows.
- Turn Zero official Linktree:
  `https://linktr.ee/turn0games`
- Turn Zero direct Discord invite from the official route:
  `https://discord.gg/anRuFcAhFS`
- Canlandex events page:
  `https://canlandex.com/events`

### What the sources supported

The official Linktree still functions as the best source-routing surface. It
routes to the Turn Zero website, Discord, and card-selling/intake surfaces. Its
`Current Event Schedule` link still behaves like a stale or dead Discord-CDN
image route, so it should not be used as a current schedule source.

The direct Discord invite resolves to `Turn Zero Games` and exposes public invite
metadata: about 1,922 members and 350 online at the time of this check. That is
a useful community-scale signal, but it is not content inspection. The proposal
therefore captures the Discord route as Evidence with `content replay TBD`.

Canlandex still supports Turn Zero as a Canadian Highlander venue with
every-other-Saturday 1:00 PM play and a Discord route. This is a meaningful
proxy-friendly competitive-casual Magic signal. It is not Commander, and the
available source did not provide a safe future-date anchor for normalized
occurrences.

### Event implication

No new Turn Zero event write is recommended from this pass.

Already represented in Supabase:

- Wednesday Commander
- Friday Modern/FNM
- Hobbit prerelease occurrences
- Reality Fracture prerelease occurrences

Canadian Highlander remains `event TBD`, not `write now`, because:

- it is every other Saturday rather than weekly;
- the current app recurrence model is safest with weekly recurrence or dated
  occurrences;
- this pass did not establish the next future Saturday anchor date;
- it is not Commander, though it is a relevant fit/community signal.

### Places implication

Turn Zero remains a strong Magic-store watch candidate. The direct Discord invite
metadata improves confidence that there is a sizable community route, but it
does not yet answer the decision-changing questions about Commander pods,
proxy/casual norms, solo arrival, or whether Canadian Highlander should be
represented as future dated occurrences.

Recommended durable status:

- Discord/community status: `route found / not inspected`.
- Canadian Highlander: `cadence TBD`.
- Fit grade/score: no change proposed.
- Confidence: no change proposed.

## Proposal

Prepared proposal:

- `supabase/proposals/projectccg-turnzero-discord-cadence-pass-2026-07-18.json`

The proposal recommends:

- adding Turn Zero's direct Discord invite as visible Evidence;
- updating Turn Zero assessment notes/evaluation to distinguish invite metadata
  from inspected content;
- updating ProjectCCG Santa Ana assessment notes/evaluation to preserve the
  useful OC operational Discord read while avoiding overclaiming MTG-channel
  content from this pass;
- adding a proposed Updates marker;
- making no event-series, event-occurrence, schema/auth/RLS, app-code, or
  canonical JSON changes.

## Remaining TBDs

ProjectCCG Santa Ana:

- deeper MTG-channel replay when Discord content is easier to inspect;
- proxy policy;
- pod formation;
- solo-arrival comfort;
- whether the Discord should become a regular monitoring source.

Turn Zero:

- inspect Discord content only if joined/approved and useful;
- determine whether Canadian Highlander has a safe future-date anchor;
- decide whether Canadian Highlander should become dated occurrences if the
  cadence can be represented safely.

