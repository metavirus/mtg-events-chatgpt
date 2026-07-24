# A & N / Next-Gen / Crimson Guild / Comic Quest corrected main pass

Date: 2026-07-24  
Pass type: corrected main-store pass, proposal-only

## Scope

Stores:

- A & N Collectibles
- Next-Gen Games
- The Crimson Guild — South El Monte
- Comic Quest

Goal: improve planning confidence around first-visit usefulness, current event
coverage, source reliability, and remaining community/social TBDs.

## Shared source baseline

- Wizards/EventLink: refreshed with a 2026-07-24 30-mile WPN pull. The wider
  radius was necessary because A & N is about 25.7 miles from Los Alamitos and
  is missed by the default 25-mile crawler output.
- Discord/community: live monitoring-map metadata was checked only. No Discord
  browser/content survey was run.
- Public social: A & N Instagram/Facebook routes remain known, but public fetch
  did not yield inspectable content in this pass; proposal marks them blocked /
  replay TBD rather than using them as content support.
- Official/storefront pages: existing accepted official-source evidence was
  preserved. Local fetch paths were unreliable for several public sites, so this
  pass does not overclaim fresh official-site content where it was not readable.

## Store findings

### A & N Collectibles

Event result:

- Current WPN confirms Monday, Wednesday, and Friday free Commander at 5 PM.
- Current WPN also confirms three Hobbit prerelease sessions:
  - 2026-08-07 7 PM, $40, capacity 28;
  - 2026-08-08 2 PM, $40;
  - 2026-08-09 2 PM, $40.

Places result:

- Stronger than a stale Commander-only lead: WPN now supports both routine
  Commander and prerelease activity.
- Still a deliberate-trip candidate because of distance and unresolved social /
  in-store-play texture.
- Best current first-visit read: Friday FNM Commander is the cleanest weekly
  Commander lane, while prerelease weekend is the more structured trial.

Discord/community:

- No mapped safe Discord route found.
- Disposition: not found / not yet identified.

Signals:

- None proposed. A & N prerelease is useful calendar inventory, but distance and
  lack of additional personal-fit signal keep it below the attention-layer bar.

### Next-Gen Games

Event result:

- Current WPN confirms existing Commander, Saturday Draft, Friday Modern,
  Monday Standard, Thursday Legacy, Two-Headed Giant Commander, and Marvel
  Commander Party rows.
- Proposal adds missing current event breadth:
  - Tuesday Draft Night;
  - Tuesday Modern;
  - five Hobbit prerelease sessions across 2026-08-07 to 2026-08-09;
  - Hobbit Commander Party on 2026-08-23 and 2026-09-20;
  - Magic Presents: Heart of the Mountain on 2026-09-06.

Places result:

- Reads as a broad WPN Premium Magic hub, not merely a Commander candidate.
- Still not a proven casual Commander home-base because pod, proxy, power, and
  LFG texture remain unresolved.
- Best current first-visit read: structured draft/prerelease/special events may
  be a better trial than cold Commander.

Discord/community:

- Official Discord route is already captured as source evidence.
- No safe mapped content route was available in this pass.
- Disposition: route captured / content replay TBD.

Signals:

- One Signal proposed: Next-Gen’s newly reconciled Hobbit prerelease weekend and
  follow-on Commander Party / Heart of the Mountain specials are attention-worthy
  because they create a structured first-visit opportunity at a high-capability
  Magic hub. The Signal expires after prerelease weekend.

### The Crimson Guild — South El Monte

Event result:

- Current WPN reconfirms:
  - Friday free Commander at 6 PM;
  - Friday Pauper FNM at 7 PM;
  - Wednesday Draft at 7 PM;
  - Sunday Standard Showdown at 4 PM;
  - July 31 Marvel Commander Party, collapsed to one app event despite duplicate
    WPN rows.

Places result:

- More complete than the prior Friday-Commander-only read.
- Best current first-visit Commander lane is Friday 6 PM Commander.
- Still needs social/community texture for turnout, power, proxy, and solo
  arrival.

Discord/community:

- No known mapped safe Discord/community route found.
- Disposition: not found / not yet identified.

Signals:

- None proposed. The findings are useful event/Places support but not a sparse
  attention item.

### Comic Quest

Event result:

- Current WPN reconfirms:
  - Friday FNM Commander;
  - short-run FNM Standard Showdown through 2026-07-31;
  - Marvel Commander Party;
  - Hobbit prerelease sessions;
  - Hobbit Commander Parties;
  - Heart of the Mountain.
- No current WPN support surfaced for God of Mischief; preserve that as stale /
  unconfirmed rather than active calendar truth.

Places result:

- Remains useful but cautious: official newcomer/open-play language is a strong
  solo-arrival positive, but the existing locals-only review-derived caution
  remains planning-relevant.
- Best current first-visit read: FNM Commander or prerelease, but verify walk-in
  openness before treating it as a reliable personal target.

Discord/community:

- No mapped safe Discord/community route found.
- Disposition: not found / not yet identified.

Signals:

- None proposed. The current additions/refreshes are useful Events/Places
  inventory; none are unusually near-term or personally compelling enough to
  demand landing-page attention.

## Proposal

Reviewable proposal:

- `supabase/proposals/aandn-nextgen-crimson-comicquest-main-pass-2026-07-24.json`

Validation:

- `validate-proposal`: passed.
- `apply-approved` dry run: passed at standard risk.
- Operations: 72.
- Tables touched: `sources`, `event_series`, `event_occurrences`,
  `event_sources`, `venues`, `evaluations`, `signals`, `research_changes`.
- No live Supabase write performed.

## Named TBDs

- A & N: current social content and any Discord/community route; best first
  solo Commander night; whether older in-store-play caution remains meaningful.
- Next-Gen: Discord/LFG and casual Commander texture; whether structured
  prerelease/draft is the best first-visit path.
- Crimson Guild: store-controlled event/social corroboration beyond WPN; turnout,
  power/proxy norms, and solo-arrival support.
- Comic Quest: whether FNM Commander is open to non-regular walk-ins; whether
  the locals-only report is isolated or culturally meaningful; any current
  Discord/community route.
