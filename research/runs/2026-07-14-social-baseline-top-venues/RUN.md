# Research Run: Social Baseline Top Venues

## Run metadata

- Run ID: `2026-07-14-social-baseline-top-venues`
- Started: 2026-07-14 13:05:00 -07:00
- Completed: 2026-07-14 13:18:00 -07:00
- Researcher/agent: Codex
- Public geographic origin: Los Alamitos, CA public centroid
- Collection radius/partitions: same top-venue tranche as the cross-source public-site pass
- Tools and collector versions: in-app browser skill, browser runtime bundled with Codex desktop
- Related prior run or checkpoint: `research/runs/2026-07-14-cross-source-top-venues/`, `research/discord-baseline-2026-07-14.md`

## Objective

Establish a first-class social-source baseline for the current top venue tranche so
Instagram and Facebook are recorded as substantive sources rather than just linked
identities.

## Methodology

Visited the official Instagram and Facebook pages already linked from venue sites or
prior research for:

- Collectors Lounge Cypress
- The Guild House
- Kingslayer Games
- Finch and Sparrow Games

For each source, captured:

- whether the page was publicly readable without login;
- profile identity, category, and rough community scale if exposed;
- any venue or operating details surfaced directly in profile metadata/body text;
- whether the accessible page state looked strong enough for later post-level mining.

This run intentionally prioritized breadth across socials over deep transcription of
recent posts. The goal was to classify social usefulness and remove uncertainty about
whether these sources are actually accessible.

## Coverage summary

- Stores/organizations considered: 4
- Sources attempted: 8
- Sources successfully inspected: 8
- Sources blocked/inaccessible: 0 hard blocks, though some Instagram profiles were partially sparse in rendered body text
- Raw artifacts preserved: none beyond written transcriptions in this run
- New findings: 8 social-source records with accessibility and profile-scale signals
- Material changes: Instagram/Facebook are now confirmed as viable recurring sources for all four top venues

## Sources trawled

- Collectors Lounge Cypress
  - Instagram: `https://www.instagram.com/collectors.lounge/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: public profile exposed follower/post counts, address language, daily-hours language, and explicit tournament-every-day branding.
  - Freshness/authority: official social profile, strong for identity and current brand signals

- Collectors Lounge Cypress
  - Facebook: `https://www.facebook.com/110508608781459`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: public profile exposed page category, address, phone, email, website, open-now state, and engagement counts.
  - Freshness/authority: official social profile, strong for identity and medium for event follow-up

- The Guild House
  - Instagram: `https://www.instagram.com/theguildhousegames/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: public metadata exposed follower/post counts and the community-oriented profile statement.
  - Freshness/authority: official social profile, medium/strong

- The Guild House
  - Facebook: `https://www.facebook.com/theguildhouse5`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: public profile exposed community statement, address, phone, website, follower scale, recommendation percentage, and open-now state.
  - Freshness/authority: official social profile, strong

- Kingslayer Games
  - Instagram: `https://www.instagram.com/kingslayergames`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: public metadata exposed very large follower base and clearly multi-location branding including Fountain Valley, Oceanside, and Lake Forest contact numbers.
  - Freshness/authority: official social profile, strong

- Kingslayer Games
  - Facebook: `https://www.facebook.com/kingslayergames`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: public profile exposed Magic-focused store description, follower scale, website, and category.
  - Freshness/authority: official social profile, strong

- Finch and Sparrow Games
  - Instagram: `https://www.instagram.com/finch_and_sparrow_games/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: public profile exposed large follower/post counts and explicit Wizards Premium / MTG-specialist identity.
  - Freshness/authority: official social profile, strong

- Finch and Sparrow Games
  - Facebook: `https://www.facebook.com/FinchandSparrowGames/`
  - Checked 2026-07-14
  - Access result: success
  - Useful finding: public profile exposed page category, address, phone, website, follower scale, and recommendation percentage.
  - Freshness/authority: official social profile, strong

## Findings and insights

### Cross-cutting conclusion

Instagram and Facebook are viable sources for all four stores in this tranche. None
of these socials were hidden behind a full login block during this pass. That means
socials should be treated as live weekly-check surfaces, not just passive identity
links.

### Collectors Lounge Cypress

- Instagram is especially strong as a profile-level source.
- Public profile text confirms:
  - Cypress identity
  - 10 AM to 10 PM every day language
  - daily tournament branding
- Instagram scale is substantial for a local store:
  - about 5.4K followers
  - over 4.4K posts
- Facebook is smaller but still useful as a contact and local-engagement source.
- Interpretation:
  - This is a socially active store with enough posting scale that Instagram should
    be part of the weekly event search, not an occasional fallback.

### The Guild House

- Instagram is publicly available but the rendered body text was thin in this pass;
  metadata still confirms roughly 1.6K followers and more than 1.1K posts.
- Facebook is stronger in immediately readable public text and confirms:
  - community-forward branding
  - Bellflower address
  - contact details
  - roughly 2K followers
  - strong recommendation signal
- Interpretation:
  - For The Guild House, Facebook may be the easier social source for direct weekly
    checks, while Instagram remains an important secondary surface.

### Kingslayer Games

- Instagram is the largest profile in this tranche by a wide margin:
  - about 14K followers
  - nearly 1.5K posts
- The profile description is explicitly multi-location, so Instagram findings will
  need branch-level normalization.
- Facebook also confirms a sizeable public audience and explicit MTG focus.
- Interpretation:
  - Kingslayer socials are clearly operationally important, but because the brand is
    multi-location, post-level mining must be careful not to mis-attribute Lake
    Forest or Oceanside information to Fountain Valley.

### Finch and Sparrow Games

- Instagram is very strong:
  - about 9.8K followers
  - about 4K posts
  - explicit Wizards Premium / MTG specialist positioning
- Facebook is smaller but still active enough to matter and confirms the Signal Hill
  identity and contact information.
- Interpretation:
  - Finch should receive a serious social pass. Its Discord may be sparse, but its
    public social footprint is large and likely operationally meaningful.

## Reconciliation decisions

- All eight social pages are retained as official source records for recurring venue
  research.
- Collectors Lounge and Finch Instagram should be treated as high-priority weekly
  sources because their scale and MTG-specific branding imply ongoing schedule and
  promotion usage.
- The Guild House Facebook appears stronger than its Instagram for easily readable
  public information in this pass.
- Kingslayer social findings must be normalized at the branch level because the
  profiles represent a multi-location brand.

## Data changes

- Added this run folder and its written findings.
- No normalized app-data files were edited in this run.

## Validation

- Privacy check: no messages, DMs, reactions, comments, or account interactions.
- Source check: all inspected pages were official social profiles linked from prior
  authoritative sources.
- Accessibility check: every targeted social profile returned enough public data to
  justify future weekly monitoring.

## Failures and limitations

- This was not a post-by-post mining pass.
- Instagram body text was sparse on some profiles even when metadata was available.
- No recent flyer or reel transcription was attempted in this run.
- Facebook public profile text is useful, but feed chronology and event-post
  extraction still need a deeper venue-by-venue pass.

## Unresolved questions

- Which of these venues use Instagram/Facebook mainly for branding versus actual
  event publishing?
- Which stores post one-off prereleases and specials primarily on socials rather
  than on their websites or Wizards pages?
- For Kingslayer, how often do social posts name the exact branch versus using the
  brand globally?

## Recommended next actions

1. Do a deeper post-level social pass for Finch and Collectors Lounge first, since
   they appear to have the strongest and most MTG-specific Instagram footprints.
2. Do a branch-aware Kingslayer social pass focused specifically on Fountain Valley.
3. Use The Guild House Facebook as the first social checkpoint when looking for
   specials, cancellations, or non-calendar announcements.
4. After those deeper passes, promote any recurring or special-event findings into
   the normalized dataset with explicit source authority and freshness.
