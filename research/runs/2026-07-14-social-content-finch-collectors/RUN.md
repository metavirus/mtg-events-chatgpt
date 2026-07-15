# Research Run: Social Content Finch and Collectors

## Run metadata

- Run ID: `2026-07-14-social-content-finch-collectors`
- Started: 2026-07-14 13:20:00 -07:00
- Completed: 2026-07-14 13:38:00 -07:00
- Researcher/agent: Codex
- Public geographic origin: Los Alamitos, CA public centroid
- Collection radius/partitions: top-venue tranche, focused social deepening for Finch and Sparrow Games and Collectors Lounge - Cypress
- Tools and collector versions: in-app browser skill, browser runtime bundled with Codex desktop
- Related prior run or checkpoint: `research/runs/2026-07-14-social-baseline-top-venues/`, `research/runs/2026-07-14-cross-source-top-venues/`, `research/discord-baseline-2026-07-14.md`

## Objective

Mine actual recent social post content for the two top-venue stores whose social
footprints appeared most likely to carry operational event information.

## Methodology

Used publicly accessible Instagram and Facebook page states to:

- discover recent post/permalink links;
- sample recent post captions and metadata;
- identify whether the venue uses socials for routine schedules, specials, or
  general brand/community content;
- detect cross-source corroboration opportunities against Discord and Wizards.

This was still a bounded sample, not a complete historical social export.

## Coverage summary

- Stores/organizations considered: 2
- Sources attempted: 4
- Sources successfully inspected: 4
- Sources blocked/inaccessible: 0 hard blocks
- Raw artifacts preserved: none committed; one visual weekly-schedule observation was transcribed into findings
- New findings: both stores use socials for genuine current event communication; Collectors Instagram directly corroborates a weekly Magic lineup already seen in Discord
- Material changes: socials for these two venues are now upgraded from general-value sources to active event surfaces

## Sources trawled

- Finch and Sparrow Games
  - Instagram profile and six recent visible posts/reels from `https://www.instagram.com/finch_and_sparrow_games/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: recent posts include Lorcana prerelease promotion with date/time/fee and multiple cEDH/Fish Bowl recap posts, indicating the account is an active operational and community-content channel.
  - Freshness/authority: official social profile, high

- Finch and Sparrow Games
  - Facebook profile and visible recent post excerpt from `https://www.facebook.com/FinchandSparrowGames/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: visible page excerpt surfaced the same Lorcana prerelease announcement found on Instagram, confirming Facebook mirrors at least some current event posts.
  - Freshness/authority: official social page, medium/high

- Collectors Lounge - Cypress
  - Instagram profile and six recent visible posts/reels from `https://www.instagram.com/collectors.lounge/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: recent post stream includes a weekly Magic lineup post, plus other game-lineup and product/special posts.
  - Freshness/authority: official social profile, high

- Collectors Lounge - Cypress
  - Facebook profile and visible recent post excerpt from `https://www.facebook.com/110508608781459`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: visible page excerpt surfaced a current Pokemon-themed post and a direct permalink, showing Facebook is also carrying recent page posts even when not yet deeply mined.
  - Freshness/authority: official social page, medium

## Findings and insights

### Finch and Sparrow Games

- Exact evidence from recent Instagram samples:
  - 2026-07-13 post: `Attack of the VINE!` Lorcana prerelease this weekend, start 6:00 PM, entry $30.
  - Multiple July 8-12 reels/posts recap `Fish Bowl 7`, explicitly tagged `CEDH`, `mtgcommander`, and `smollcast`.
  - 2026-07-10 post: Pokemon `Pitch Black` prerelease on July 12 at 2:30 PM, entry $35.
- Facebook page excerpt surfaced the same Lorcana prerelease language.
- Normalized facts:
  - Finch uses socials for dated special-event promotion, not just branding.
  - Finch also uses socials for cEDH/community recap content, which reinforces that competitive Commander is an important visible subculture there.
  - Facebook appears to mirror at least some Instagram event posts.
- Interpretation:
  - The weak Finch Discord is not a good proxy for overall communication strength.
  - Socials are likely one of the primary ways Finch announces specials, prereleases, and branded competitive-content activity.
  - Routine casual Commander still needs deeper separation from this louder competitive/event-marketing layer.
- Personal-fit assessment:
  - High utility as a source.
  - Mixed venue-fit signal: strong communication, but frequent visible cEDH content means the app should carefully separate casual and competitive Finch opportunities.
- Confidence:
  - High for social-source usefulness.
  - Medium for what the social mix implies about average routine Commander tables.

### Collectors Lounge - Cypress

- Exact evidence from recent Instagram samples:
  - 2026-07-13 post: `This weeks gatherings of magic #mtg #magicthegathering #mtgcommander`.
  - The visible image on that post is a weekly Magic lineup graphic for `7/13-7/19`, visually matching the lineup already extracted from Discord: Friday `God of Mischief Commander`, Saturday `Optimized Commander`, Sunday `MSH 3-Pack Draft`.
  - Additional same-day posts covered One Piece, Pokemon, Gundam, and product/news content.
- Facebook page excerpt surfaced a recent `Midsummer Mons!` Pokemon post and a direct visible permalink.
- Normalized facts:
  - Collectors uses Instagram as an active weekly schedule surface for Magic.
  - The weekly Instagram lineup corroborates the Discord weekly lineup, strengthening confidence that this is a current official weekly communication pattern rather than a one-off Discord artifact.
  - The account is multi-game and posts separate lineups/content for different games.
- Interpretation:
  - This is a textbook cross-source-synthesis store: sparse website schedule, strong Discord weekly graphic, and matching Instagram weekly graphic.
  - For weekly monitoring, Instagram should join Discord and Wizards as a primary Collectors source.
- Personal-fit assessment:
  - Very strong source quality for this project.
  - Continues to support Collectors as one of the most promising nearby stores, while preserving the distinction between casual Friday Commander and optimized Saturday Commander.
- Confidence:
  - High for Instagram usefulness and for weekly-lineup corroboration.

## Reconciliation decisions

- Collectors Lounge Instagram weekly Magic post is classified as `confirmed_same_event` relative to the Discord weekly lineup for 2026-07-13 through 2026-07-19.
- Finch Lorcana prerelease post is a distinct special-event signal and should not be treated as evidence about routine Commander fit.
- Finch cEDH recap/social-content posts are meaningful venue-character evidence and should feed the store/community-fit layer, not be misfiled as ordinary local Commander event records.
- Facebook for both stores is retained as a useful supporting source, but Instagram currently appears to be the stronger event-content surface.

## Data changes

- Added this run folder and its written findings.
- No normalized app-data files were edited in this run.

## Validation

- Privacy check: read-only social inspection only; no likes, follows, messages, or logins.
- Cross-source check: Collectors Instagram weekly Magic post was compared against the Discord weekly extraction and found to align.
- Scope check: this run stayed focused on recent visible event-content signals rather than drifting into unrelated historical posts.

## Failures and limitations

- Instagram modal overlays remained present on some post views; they did not prevent reading captions and visible imagery, but they reduced visual clarity.
- This was a sampled recent-post pass, not a comprehensive social chronology.
- Facebook post-depth was limited to visible page excerpts and permalink discovery rather than full per-post extraction.

## Unresolved questions

- Finch: what do its recent Instagram/Facebook posts say about routine Thursday/Saturday Commander specifically, beyond the louder cEDH and prerelease material?
- Collectors: does Instagram regularly carry the same weekly Magic graphics every week, and if so, can it become a primary weekly collector input?
- For both stores: are there important specials, cancellations, or policy posts that appear only on socials and not on Discord/Wizards?

## Recommended next actions

1. Promote Collectors Instagram into the primary weekly-source set alongside Discord and Wizards.
2. Run one more focused Finch pass aimed specifically at routine Commander posts or calendar surfaces, so casual Commander can be separated more cleanly from Birdcage/Fish Bowl/cEDH content.
3. After that, promote the strongest confirmed top-tranche findings into the normalized data layer before opening the next tranche.
