# Discord Monitoring Map Validation

Date: 2026-07-20

## Purpose

Test whether a fresh bounded survey can begin from the live monitoring map,
reach only the due seeded channels, and preserve useful, quiet, and access
results without reconstructing the route plan from browser history or narrative
research notes.

## Map-first execution

The pass began by reading the 3 live `discord_access_profiles` rows and 8
active `discord_channel_watchlist` rows. The recorded in-app browser session,
server IDs, direct channel links, priorities, cadences, expected signal types,
and monitoring reasons were used as the inspection plan.

No global Discord inbox, DMs, general discovery, unrelated server history,
message writing, reactions, settings changes, automation, or persistent-login
work was performed.

## Results by route

### JJ's Collectibles

- `#magic-announcements`: reached directly; **useful this run**. A July 20
  schedule post supplied current Garden Grove facts for Tuesday Commander,
  July 23 Precon Commander, July 24 Marvel draft, July 25 Commander, and July
  26 Standard/Pauper. The current post also lists a distinct Orange schedule;
  that branch identity remains a named TBD rather than being folded into the
  Garden Grove venue.
- `#commander-night`: reached directly; **quiet this run**. The newest useful
  standing guidance remains older bracket/random-pod context. Route value stays
  high.

### Magic & Monsters

- `#shop-schedule`: reached directly; **quiet this run**. No post newer than the
  already captured regular-MTG-removal/source-health finding was observed.
- `#mtg-schedule`: reached after the map-guided server route exposed its stable
  channel ID; **quiet/stale this run**. The newest observed schedule material
  remains old. Occasional monitoring remains appropriate because special MTG
  opportunities may still appear intermittently.

### ProjectCCG Online Community

- `#oc-announcements`: reached directly; **quiet this run**. The latest observed
  item remains the already known July 19 reopening after the resolved closure.
- `#oc-events`: reached after recovering its stable channel ID; **quiet this
  run**.
- `#mtg-announcements`: reached after recovering its stable channel ID; **quiet
  this run**.
- `#mtg-discussion`: reached after recovering its stable channel ID; **useful
  community texture this run**. Current July 20 discussion referenced Tuesday
  Standard attendance/logistics, while the earlier July 18 Commander pod request
  remains the clearest LFG signal. Existing calendar coverage already represents
  the relevant events, so no new Signal or event write is proposed.

ProjectCCG channels display as limited/locked channels in the Discord UI, but
the existing joined account could read them without further user action. The
access profile should therefore preserve that a gate is present and already
satisfied, rather than claiming no gate exists.

## What the operational test proved

1. **Direct reach:** 4 watch rows already had complete direct links. The other
   4 were reachable from the mapped server and yielded stable IDs/URLs that are
   now suitable for direct future use.
2. **Access mechanics:** all three profiles correctly identified the working
   signed-in in-app browser session. ProjectCCG needed a gate clarification,
   not a new access flow.
3. **Inspection guidance:** priority, cadence, monitoring reason, expected
   signal types, and noise level were sufficient to inspect the right content
   without rereading irrelevant general-chat history.
4. **Quiet-run handling:** quiet results are recorded here as observations from
   this run. No route value or cadence was lowered merely because it was quiet.
5. **Resume history:** the date-only `last_checked` field could not distinguish
   this run from the earlier pilot on the same date, and it did not preserve the
   newest message boundary. Timestamped check and last-seen-message markers are
   therefore justified.
6. **Access failure:** no access failure occurred. No speculative failure table
   or failure-reason fields are justified yet.

## Smallest justified map corrections

- Add `last_checked_at` to distinguish same-day inspections.
- Add `last_seen_message_at` as a lightweight resume cursor independent of
  whether the newest message produced a useful signal.
- Fill the four recovered channel IDs and direct URLs.
- Mark ProjectCCG's role/channel gate as present but already satisfied by the
  current joined account.
- Keep route value separate from per-run yield; the existing model plus this
  run note already does that.

Not added: a survey-observation table, derived `next_due_at`, persistent-login
machinery, broad access-failure fields, or new automation schema. Cadence can
still determine the next queue, and this run did not prove those additions
necessary.

## Useful research disposition

- JJ's current Garden Grove schedule facts are preserved in the reviewable
  proposal `supabase/proposals/jjs-discord-map-validation-events-2026-07-20.json`.
- The proposal is not a live write. It keeps branch-ambiguous Orange facts as a
  TBD and proposes only source-supported Garden Grove corrections/additions.
- ProjectCCG and Magic & Monsters produced no new actionable landing-page
  Signal. Quiet or already-captured evidence was not promoted merely to fill
  Signals.

## Readiness

The map is ready to expand to the next few Discords after these small corrections.
A future pass can open every seeded channel directly, know why it is being
checked, resume from a recorded message boundary, and preserve quiet results
without downgrading long-term route value.
