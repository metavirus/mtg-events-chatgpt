# Research Run: Social Cleanup for Missing Stores

## Run metadata

- Run ID: `2026-07-14-social-cleanup-missing-stores`
- Started: 2026-07-14 21:20:00 -07:00
- Completed: 2026-07-14 22:05:00 -07:00
- Researcher/agent: Codex
- Public geographic origin: Los Alamitos, CA public centroid
- Collection radius/partitions: deferred social-content cleanup for stores previously touched without a fuller social pass
- Tools and collector versions: live public fetches and in-app browser inspection
- Related prior run or checkpoint: `research/runs/2026-07-14-social-baseline-top-venues/`, `research/runs/2026-07-14-social-content-finch-collectors/`, `research/runs/2026-07-14-collector-legion-full-pass/`

## Objective

Close the social-pass gaps left by earlier work so stores already researched do
not carry an inconsistent standard where some received deeper social-content
treatment and others only received profile-level confirmation.

## Methodology

For The Guild House, Kingslayer Games, and Collector Legion:

- rechecked public Instagram and Facebook profiles;
- captured profile-level scale/identity;
- used in-app browser inspection to read visible recent post text where possible;
- distinguished between operationally useful social content and generic or
  branch-mixed brand content;
- promoted only the reliable source-routing and event-interpretation outcomes.

## Coverage summary

- Stores/organizations considered: 3
- Sources attempted: 6
- Sources successfully inspected: 6
- Sources blocked/inaccessible: 0 hard blocks, though Kingslayer and Collector Legion remained noisier than Guild House for precise Commander-specific social extraction
- Raw artifacts preserved: none beyond written transcriptions
- New findings: The Guild House socials are genuinely operational and current; Kingslayer socials are active but branch-mixed; Collector Legion socials are active and readable enough to count as completed, though still only moderately strong for recurring Commander guidance
- Material changes: the deferred social-cleanup set is now documented and promoted into normalized data

## Sources trawled

- The Guild House
  - Instagram: `https://www.instagram.com/theguildhousegames/`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: recent visible posts included Tuesday casual Commander, a Friday special Commander/Loki event, and a same-day Standard Showdown reminder.
  - Freshness/authority: official social, high

- The Guild House
  - Facebook: `https://www.facebook.com/theguildhouse5`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: visible current page excerpt mirrored the Standard Showdown reminder and confirmed Bellflower identity, community-forward positioning, and active post recency.
  - Freshness/authority: official social, high

- Kingslayer Games
  - Instagram: `https://www.instagram.com/kingslayergames`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: profile and sampled visible content clearly showed multi-location behavior; Fountain Valley was prominent in profile text, but post-level signal remained brand-level rather than weekly Commander-specific.
  - Freshness/authority: official social, medium/high

- Kingslayer Games
  - Facebook: `https://www.facebook.com/kingslayergames`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: current visible post was Fountain Valley-specific, but about Pokemon release inventory rather than Commander; this supports the brand's operational activity without improving weekly Commander specifics.
  - Freshness/authority: official social, medium/high

- Collector Legion
  - Instagram: `https://www.instagram.com/collectorlegion/`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: profile text was readable when logged in and visible recent posts included current MTG x Star Trek product/news and a May event-schedule post saying `Our updated event schedule! Come on in to play in-store in our weekly tournaments!`
  - Freshness/authority: official social, medium/high

- Collector Legion
  - Facebook: `https://www.facebook.com/collectorlegion/`
  - Checked: 2026-07-14
  - Access result: success
  - Useful finding: visible current feed included a closure reminder and a current MTG x Star Trek welcome-decks post.
  - Freshness/authority: official social, medium/high

## Findings and insights

### The Guild House

- Exact evidence:
  - Instagram recent post: `Every Tuesday night we have casual commander at 6pm. Entry is $2 or the purchase of a booster pack. Play a couple games with our welcoming community.`
  - Instagram recent post: Friday special event with Loki/Marvel Commander structure, 7 PM start, $10 entry, Hellcat promo and Marvel booster pack.
  - Facebook recent visible post mirrored the current Standard Showdown reminder.
- Normalized facts:
  - Guild House uses socials as real operational event surfaces, not just branding.
  - Tuesday Commander is not only present on the calendar; it is currently being actively promoted in socials.
  - Facebook is especially useful for quick timely checks.
- Interpretation:
  - This is one of the healthier social footprints for the project because it directly reinforces routine Commander rather than only special-event noise.

### Kingslayer Games - Fountain Valley

- Exact evidence:
  - Instagram profile text names Fountain Valley, Oceanside, and Lake Forest together.
  - Facebook current visible post was Fountain Valley-specific but about Pokemon: `Catch Pokémon: Pitch Black early!`
  - Prior official Commander event pages remain more precise than current social surfaces for weekly Commander specifics.
- Normalized facts:
  - Kingslayer socials are active and operational.
  - Social content is too multi-location and multi-game to outrank official Fountain Valley event pages for weekly Commander specifics.
  - Socials are still useful for store activity, branch identity, and occasional branch-specific signals.
- Interpretation:
  - Kingslayer is a clear case where social completion matters, but the completed answer is still that official branch event pages are better.

### Collector Legion

- Exact evidence:
  - Instagram recent post: `A new set of Welcome Decks are coming for MTG x Star Trek later this year!`
  - Instagram older post: `Our updated event schedule! Come on in to play in-store in our weekly tournaments!`
  - Facebook visible post stream included both a closure reminder and the same MTG x Star Trek welcome-decks topic.
- Normalized facts:
  - Collector Legion socials are active and MTG-relevant.
  - Both Instagram and Facebook are now readable enough to count as completed review surfaces.
  - The sampled visible content leaned more toward general MTG/store operations than direct recurring Commander guidance.
- Interpretation:
  - Collector Legion's social pass is complete, but it still leaves a meaningful Saturday Commander ambiguity because the readable content did not directly settle that question.

## Reconciliation decisions

- Treated The Guild House social pass as materially strengthening routine Commander confidence.
- Treated Kingslayer social pass as a source-routing clarification, not as a reason to replace official branch event pages.
- Treated Collector Legion social pass as completed, with Saturday Commander still unresolved on the merits rather than because of a missing social check.

## Data changes

- Added missing social source records for The Guild House, Kingslayer, and Collector Legion.
- Added social-content synthesis source records for all three stores.
- Updated store-level assessment notes to reflect completed social interpretation.
- Updated Guild House Tuesday Commander details to include the recent social corroboration.

## Validation

- JSON validation required after promotion edits.
- All review was read-only.
- No messages, follows, likes, comments, or posts were performed.

## Failures and limitations

- Kingslayer's current visible social sample still did not yield a strong Commander-specific post.
- Collector Legion's current social sample improved materially after login, but still did not directly resolve Saturday Commander.
- This remained a bounded recent-content pass, not a full historical archive.

## Unresolved questions

- Collector Legion: can we directly confirm Saturday routine Commander from a future social or official update?
- Kingslayer: do socials ever publish Fountain Valley Commander-specific posts often enough to matter operationally?
- The Guild House: do the welcoming social signals reliably match the in-person solo-arrival experience?

## Recommended next actions

1. Treat the missing-social cleanup set as completed.
2. Keep Collector Legion as a Saturday-clarity item, not as an unreviewed social gap.
3. Continue with remaining venue work under the stricter rule that socials belong inside each store pass.
