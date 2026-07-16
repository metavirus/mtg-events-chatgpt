# Async Intake Queue

This queue accepts sourced discoveries, research questions, product ideas,
small corrections, and user requests from ChatGPT, Codex, or the future app.
It is triage input, not canonical data and not authorization to execute risky
changes.

## Rules

- Use one item per decision or outcome.
- New entities are always `candidate-discovery`; do not add them to canonical
  JSON until Codex deduplicates, researches, and promotes them.
- Include URLs or precise source descriptions for factual claims.
- Keep raw brainstorming separate from an asserted fact.
- Codex or a future daily agent may resolve easy safe items, research promoted
  candidates, or mark items `waiting-user` when a decision is needed.
- Significant durable work should also be represented in
  `docs/WORK_BACKLOG.md`; this file is the intake funnel, not its replacement.

## Status and type values

- Status: `new`, `triaged`, `in-progress`, `waiting-user`, `resolved`, `declined`
- Type: `candidate-discovery`, `research-follow-up`, `data-correction`,
  `product-idea`, `bug-report`, `watch-request`, `documentation`
- Risk: `safe-documentary`, `candidate-only`, `codex-required`

## New / active items

### INTAKE-20260715-004 — Formalize a bounded secondary-signal scan

Outcome type: intake-only
Entity: research methodology; Tweedy Cards and Gaming
Modality path used: user-supplied Yelp review screenshot -> embedded Discord screenshot -> research-process proposal
Promotion status: Candidate queued for Codex review
Files changed: `docs/ASYNC_INTAKE.md`, `docs/chatgpt-changelog.md`
Branch / PR: `chatgpt-data-update/2026-07-15-review-signal-backlog`; pending PR
Codex review needed: Add a formal bounded signal-scan item to `docs/WORK_BACKLOG.md` and verify the Tweedy Discord lead.

- Submitted by: User
- Date: 2026-07-15
- Type: research-follow-up
- Status: new
- Risk: codex-required
- Related entity: `tweedy-cards-and-gaming`
- Request / observation: Formalize a small secondary-signals backlog or checklist for quick review during store research. The user observed that a brief Yelp review scan can expose high-value operational leads that are absent from the obvious official source stack, such as Discord references, schedule photos, store-hours photos, social handles, registration links, or community-language clues. In the supplied Tweedy example, an April 13, 2026 Yelp review included a photo of a Discord welcome screen for `TWEEDYgaming`, showing a Tweedy Cards and Gaming community server, `role-notifications`, `resources`, and `announcements` channels. The screenshot is a user-supplied lead, not proof that the server is currently active, official, or still accessible.
- Source support: User-supplied Yelp review screenshot dated April 13, 2026 and user-supplied crop of the embedded Discord welcome image. The visible text identifies `TWEEDYgaming`, describes a Tweedy Cards and Gaming community Discord, and shows channel names including `role-notifications`, `resources`, and `announcements`.
- Desired outcome: Add a bounded `secondary signal scan` to the durable research backlog and methodology. The scan should be quick rather than exhaustive and should look at a small sample of recent/high-signal reviews and attached photos for hidden source-routing clues. Candidate signals should include Discord or other community links, event/schedule graphics, registration routes, hours changes, play-space evidence, repeated newcomer or staff-help language, and contradictions with official sources. Ratings alone should remain secondary context rather than the purpose of the pass.
- Suggested next step: Codex should add a compact backlog/process rule with a strict stopping condition, such as checking the first few recent or most useful review entries and attached photos when already on a review surface, then stopping once one or two useful signals are captured or the source proves low-yield. Separately, verify whether the Tweedy Discord still exists, whether it is store-operated, how to access it, and whether its announcement or MTG channels contain current event evidence. Do not promote the Discord into canonical sources until verified.
- User decision needed: no
- Related mailbox/changelog/PR: Changelog entry `2026-07-15 — Queue bounded review-signal research proposal`; PR pending.

<!-- Copy this block for each item.
### INTAKE-YYYYMMDD-NNN — Short title
- Submitted by: User / ChatGPT / Codex / app
- Date:
- Type:
- Status: new
- Risk:
- Related entity: existing ID, candidate name, page, or none
- Request / observation:
- Source support:
- Desired outcome:
- Suggested next step:
- User decision needed: no / question
- Related mailbox/changelog/PR:
-->

## Waiting for user

Items move here only when a specific decision blocks useful progress.

## Resolved / declined

Preserve the original item and add:

- Disposition:
- Resolved by/date:
- Canonical files or PR:
