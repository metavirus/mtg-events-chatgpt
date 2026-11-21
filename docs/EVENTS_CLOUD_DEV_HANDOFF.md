# MTG Events Cloud developer handoff

**Cutover: November 21, 2026.** Codex Cloud is the sole routine developer for
MTG Events. The Windows chat is not a parallel coding lane. A developer handoff
does not move hosting, databases, recurring jobs, or private browser sessions.

## Start here

1. Select Cloud, GitHub repo `metavirus/mtg-events-chatgpt`, and the published
   private `mtg-events-chatgpt` environment. Start from current `origin/main`,
   not the migration pilot. Check the repo root, remote, branch, and dirty
   state before editing. The cutover baseline was `09ba51d` on `main`;
   [PR #18](https://github.com/metavirus/mtg-events-chatgpt/pull/18) and
   [PR #19](https://github.com/metavirus/mtg-events-chatgpt/pull/19) landed the
   verifier and setup instructions. Neither PR needs to be redone.
2. Read [AGENTS.md](../AGENTS.md) and
   [Environment readiness](ENVIRONMENT_READINESS.md), then use
   [README](../README.md), [Project context](PROJECT_CONTEXT.md),
   [Session bootstrap](SESSION_BOOTSTRAP.md), [Current frontier](../CURRENT_FRONTIER.md),
   and [Work backlog](WORK_BACKLOG.md). Search the backlog by active lane;
   it includes historical sections. If the docs disagree, verify against
   implementation and the latest relevant evidence before reopening work.
3. Run the offline gate from the repo root. The published environment provides
   Node 24, Python 3.12, Playwright 1.54.2, and system Chromium:

   ```bash
   CODEX_NODE_MODULES="$PWD/work/cloud-dev/node_modules" UI_VERIFY_BROWSER=/usr/bin/chromium node scripts/verify_app_ui.mjs --scenario offline-app-smoke
   python3 scripts/validate_text_integrity.py --full-repo
   ```

   Blocked external requests are expected. This is an app-shell and toolchain
   proof, not proof of a live account, production data, or every user flow.
   If the environment differs, follow the quick start and retest the exact
   capability before calling it blocked.

## What runs where

| Component | Owner and boundary |
| --- | --- |
| Development | Codex Cloud checkout, targeted tests and isolated fixtures. No production secrets are required for routine development. |
| Hosted app | [GitHub Pages](https://metavirus.github.io/mtg-events-chatgpt/). A static app: `index.html`, `app.js`, `styles.css`, `assets/`. No frontend build server is needed. `deploy-pages.yml` copies the static site and stamps the commit into `index.html`. |
| Data and account | Supabase owns canonical venues, communities, sources, events and assessments; signed-in preferences, notes and read state; and the private coordination queue. `supabase/migrations/` records schema history. Generated JSON and `?data=json` are recovery/export only. |
| Scheduled surveyors | GitHub-hosted Actions run WPN/social and Discord independently of Codex, Windows and the mini PC. Workflow secrets and authenticated browser state stay in their authorized stores. |
| Live operational recovery | Use the existing authorized runner or operational lane until Cloud proves its equivalent. Keep the trusted interactive browser available for Discord/Meta reauthentication if needed; that's an operator task, not a second developer seat. |

Do not copy Windows profiles, DB URLs, tokens, personal records, or raw social
logs into a Cloud checkout or chat. A working GitHub connection is not proof
of Pages admin scope or PostgreSQL connectivity. Before moving an operational
lane, qualify access on the actual Cloud client, use bounded read-only checks
first, prove the existing guarded path, and follow the authorization and
readback rules in the [operational write workflow](SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md).
The Windows live gate can refresh the WPN cache and write to Supabase; do not
run it as a substitute for the offline Cloud gate. Ordinary ChatGPT intake
goes through the [Supabase coordination queue](CHATGPT_CODEX_COORDINATION_CAPABILITY_PROOF.md),
not file mailbox gymnastics. Git carries code and project documentation.

## Product judgment to preserve

- **Today answers “what can I play today?”** Nearby and saved options matter
  first; casual Commander is usually the strongest fit, with sealed/prerelease
  and draft useful alternatives. Show a store logo, distance, event time,
  today's store hours, and directions without making the user dig. Event end
  and store closing are distinct; don't infer one from the other. Best fit
  groups Commander and other formats and folds away 20+ mile results; explicit
  sorts remain flat. Search, favorites, radius, format and sort are already
  implemented. Events remains the full catalog; Week is a day-grouped agenda
  on mobile and a grid on desktop.
- **Places is the quick reference for favorites, directions and weekly hours.**
  A verified change for specific days shouldn't erase the rest of the week.
  Promote clear official changes through the controlled workflow. For real
  conflicts, show the disputed days/times and links to the original sources
  beside the yes/no decision; don't show an unexplained proposed schedule.
  Present local Pacific times in 12-hour format. For logos, compare candidates,
  center the mark at actual avatar size, avoid inner black/white tiles and
  lettering remnants, and only vectorize if the full-color result faithfully
  matches the source. See [Logo SOP](LOGO_SOURCING_SOP.md).
- **Briefing is not the Activity log.** Make current opportunities, meaningful
  changes and decisions easy to scan. Favor saved stores/events; link useful
  community finds directly to the event or original source. Keep stale starts,
  empty monitoring panels, raw scan results and internal jargon off the home
  surfaces. Avoid repeating venue, time or source text.
- **Preferences change behavior.** Thumbed-down items leave normal planning
  views and search and remain recoverable in a hidden/low-fit area; don't fix
  one card while leaving another route leaky. Favorites should affect ordering,
  not just color a heart. For authorized preference analysis, inspect actual
  signed-in Supabase notes and reactions first, not local browser guesses.
  Firsthand attendance and notes can be enough to move a fit assessment;
  don't hold a useful store forever for perfect Commander corroboration.
  Keep personal judgment separate from source facts. The daily session-start
  note-to-action workflow is a backlog item, not a promised automation.

## Regression checks and publishing

- For changes in Today and mobile Week, start with the relevant
  `scripts/test_today_*.mjs` test and the Playwright scenarios `today-curation`
  and `today-controls-week`. For cross-view preferences, inspect the
  `event-dislike-suppression` and `place-dislike-suppression` scenarios.
  Some existing scenarios default to the **published site**; inspect their
  target and network access before use. `--local-assets` alone does not block
  Supabase. For Cloud-only work, explicitly isolate fixture data and outbound
  requests. Verify the real interaction at desktop and phone widths.
- For live event changes, use the source-neutral promoter and
  `scripts/audit_event_integrity.py --fail-on-critical` through the authorized
  lane. Don't make a second WPN/social promoter or hand-edit the JSON exports.
- Follow [Change control](CHANGE_CONTROL.md): checkpoint accepted behavior,
  keep changes bounded, validate, commit, publish and confirm the deployed
  build when a release is authorized. This is a one-user app; don't add a
  staging cycle or make the user ask again for routine publication. During
  explicit no-deploy work, don't merge to `main` casually: even docs and tests
  can trigger Pages. Inspect the current workflow before pushing to another
  branch. Confirm the live build stamp and workflow result for releases rather
  than treating a Git push as proof of deployment.

## Settled work and useful next checks

- **Discord:** The [November 18 scheduled run](https://github.com/metavirus/mtg-events-chatgpt/actions/runs/44406280437)
  verified 26/26 reads and 26 watchlist writes, but dispatched about 7 hours
  40 minutes late. Cadence is `14:15 UTC`; WPN/social is `13:37 UTC`.
  This is evidence of one good full run, not proof of punctual morning
  delivery. Check recent run status when it matters; do not add duplicate
  schedules. Check safe per-route outcomes and write counts, not just
  `completedRouteCount`, which can include blocked attempts.
- **Discord preparation is closed.** JJ's stale route was replaced with
  `#magic-general`; `#magic-announcements` remains active. Magic & Monsters
  `#mtg-schedule` stays paused with cursor retained; `#shop-schedule` is active.
  Reopen only for material access/route changes or a genuinely new source.
  On auth failure, preserve the prior session, refresh the dedicated session
  through the trusted browser, and use a one-route dry run with watchlist
  writes off. Never loosen the Discord write guard. The public workflow
  publishes counts only; historical excerpt artifacts/logs were cleaned up.
  Don't restore raw transcripts, excerpts, or runner dumps to public logs.
- **Don't reopen catalog cleanup by default.** The ten WPN time mismatches
  were corrected and scoped integrity verification passed. The broad hours
  sweep and preparatory community survey are done. Latest documented bounded
  exceptions: LVLUP GAMING TCG, The Bullpen 2.0 and the unresolved Game Chest
  Irvine hours conflict. LAGS owns its events; Precinct DTLA is the host
  location, not the organizer. A rejected lead stays out of the normal queue
  unless genuinely new evidence changes the decision.
- **Pick one visible friction when asked what to improve.** Good candidates to
  verify are expired community invites, closed stores leaking into drop-in
  choices, and informational items overusing Needs attention. Reproduce
  before fixing; these are frontier leads, not confirmed current bugs.
  Do not redo the Today filters, mobile week, compact Briefing, or global
  suppression unless there is a concrete regression.
