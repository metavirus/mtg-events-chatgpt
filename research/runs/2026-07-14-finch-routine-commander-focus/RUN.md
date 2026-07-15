# Research Run: Finch Routine Commander Focus

## Run metadata

- Run ID: `2026-07-14-finch-routine-commander-focus`
- Started: 2026-07-14 13:40:00 -07:00
- Completed: 2026-07-14 14:05:00 -07:00
- Researcher/agent: Codex
- Public geographic origin: Los Alamitos, CA public centroid
- Collection radius/partitions: focused single-venue follow-up within the top-venue tranche
- Tools and collector versions: in-app browser skill, browser runtime bundled with Codex desktop
- Related prior run or checkpoint: `research/runs/2026-07-14-social-content-finch-collectors/`, `research/runs/2026-07-14-cross-source-top-venues/`, `research/wizards-reconciliation-2026-07-14.json`

## Objective

Separate Finch and Sparrow's routine Commander programming from its louder cEDH
and special-event signals.

## Methodology

Focused on Finch-owned sources likely to expose routine Commander:

- official event calendar page;
- official site search results;
- commander-related site content surfaced by search;
- recent Instagram/Facebook content already sampled in the prior social-content run;
- comparison against the Wizards recurring-event checkpoint.

This run prioritized routine recurring facts, their authority, and the source path
most likely to remain useful weekly.

## Coverage summary

- Stores/organizations considered: 1
- Sources attempted: 5
- Sources successfully inspected: 5
- Sources blocked/inaccessible: 0 hard blocks
- Raw artifacts preserved: none beyond written transcriptions in this run
- New findings: official blog text cleanly corroborates routine Thursday and Saturday Commander structure; current recent socials emphasize cEDH/specials more than routine casual Commander
- Material changes: Finch routine Commander is now better separated from Finch competitive-brand visibility

## Sources trawled

- Finch and Sparrow Games
  - `https://www.finchandsparrowgames.com/pages/finch-and-sparrow-games-events`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: visual month calendar still rendered without text-exposed event names, but hidden page code confirms a third-party event calendar backend exists.
  - Freshness/authority: official event page, medium for human reading, low for text extraction in this pass

- Finch and Sparrow Games
  - `https://www.finchandsparrowgames.com/search?q=Commander`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: site search itself does not surface current Commander event products cleanly, but exposes commander-related blog content.
  - Freshness/authority: official site, medium

- Finch and Sparrow Games
  - `https://finchandsparrowgames.com/blogs/magic-the-gathering-news-1/living-your-best-life`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: official 2024 blog post explicitly states routine Commander-nite every Thursday at 7:00 PM for $5 and Commander-fest every Saturday at 2:30 PM for $8, with raffle positioning; also states Instagram is where the store announces things first.
  - Freshness/authority: official site, stale for date but high-value for routine-program description

- Finch and Sparrow Games
  - Recent Instagram sample from the prior social-content run
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: recent content emphasizes Birdcage/Fish Bowl cEDH and non-Commander specials more than routine Thursday/Saturday casual Commander.
  - Freshness/authority: official social profile, high

- Finch and Sparrow Games
  - `research/wizards-reconciliation-2026-07-14.json`
  - Checked 2026-07-14
  - Access result: existing local checkpoint
  - Useful finding: repeated Wizards recurring listings for `Commander Nite!!` Thursdays at 7:00 PM and `Commanderfest!` Saturdays at 2:30 PM remain current.
  - Freshness/authority: Wizards/EventLink-derived checkpoint, high

## Findings and insights

### Routine Commander structure

- Exact evidence:
  - Wizards recurring records show:
    - `Commander Nite!!` on Thursdays at 7:00 PM, $5
    - `Commanderfest!` on Saturdays at 2:30 PM, $8
  - An official Finch blog post from 2024 explicitly says:
    - `Commander-nite` every Thursday starting at 7 pm, event entry $5, raffle at the end of the night
    - `Commander-fest` on Saturdays starting at 2:30 pm, event entry $8, with a booster-box raffle prize
- Normalized facts:
  - Finch's routine Commander program is not merely inferred from Wizards; it is corroborated by store-authored site content using the same naming, times, and fee structure.
  - Thursday and Saturday appear to be the durable routine Commander anchors.
- Interpretation:
  - The 2024 blog post is not a current dated event record, but its exact alignment with the 2026 Wizards recurring data strongly suggests schedule continuity rather than a stale dead page.
  - Finch uses routine Commander as a stable store program and overlays louder cEDH/special-event branding on top of it.

### Competitive visibility versus routine play

- Exact evidence:
  - Recent Instagram samples were dominated by Fish Bowl recap reels, cEDH-tagged content, and Birdcage promotion.
  - The homepage hero currently highlights the Birdcage cEDH event.
- Normalized facts:
  - Finch's current public-facing marketing emphasis is more competitive and spectacle-driven than the underlying routine Commander program alone would suggest.
  - That does not erase the routine Thursday/Saturday casual-ish program; it means the store supports multiple Commander strata and markets them unevenly.
- Interpretation:
  - In the app, Finch should present at least two distinct Commander tracks:
    - routine `Commander Nite!!` / `Commanderfest!`
    - competitive special-event track such as Birdcage / cEDH content
  - This is exactly the kind of store where ranking and filtering matter because source volume alone would otherwise overstate competitive visibility.

### Source-priority lesson

- Exact evidence:
  - The official event page rendered a calendar but did not expose event titles cleanly in text.
  - The blog explicitly says Instagram is where the store announces things first.
  - Current socials carry recent specials and cEDH promotion.
- Normalized facts:
  - Finch's best current source combination is:
    - Wizards for recurring routine event structure
    - Instagram for current specials and current promotional emphasis
    - website/blog for durable routine-program explanations and identity
    - Discord as low-priority supplementary source
- Interpretation:
  - Finch is a good example of why one source rarely tells the whole story. Routine truth and current promotional energy live in different places.

## Reconciliation decisions

- Finch Thursday `Commander Nite!!` and Saturday `Commanderfest!` are treated as confirmed routine event-series records, supported by both repeated Wizards data and store-authored site language.
- Birdcage/cEDH content remains a separate competitive/special-event layer and must not be merged into routine casual Commander programming.
- Recent Finch socials are classified as `strong for specials and current tone`, not `best for routine weekly schedule structure`.

## Data changes

- Added this run folder and its written findings.
- No normalized app-data files were edited in this run.

## Validation

- Cross-source check: official blog routine-program language aligned with the repeated 2026 Wizards recurring records.
- Scope check: this run stayed on the single question of routine Finch Commander rather than reopening general Finch research.
- Privacy check: no account interactions or private surfaces used.

## Failures and limitations

- The hidden third-party calendar backend on Finch's event page was identified in page code but not directly extracted into structured event payloads during this pass.
- Recent public socials still did not surface a fresh routine Thursday/Saturday Commander promo inside the sampled recent posts.
- The corroborating blog text is from 2024 and therefore supportive rather than sufficient alone; the strength comes from its alignment with current Wizards recurrence.

## Unresolved questions

- Can the hidden event-calendar backend be extracted cleanly in a future technical pass?
- Are there current 2026 social posts specifically advertising routine Thursday/Saturday Commander, or are those events now mostly maintained through Wizards plus the on-site calendar widget?
- What do current routine Finch tables actually feel like in terms of bracket/power split compared with the louder cEDH brand presence?

## Recommended next actions

1. Promote Finch routine Thursday and Saturday Commander series into the normalized data layer with a clear separation from Birdcage/cEDH specials.
2. Mark Finch Instagram as a primary source for specials and promotional tone, but not as the sole source of weekly routine Commander structure.
3. When we do a technical cleanup pass later, revisit Finch's hidden calendar backend as a possible structured collector target.
