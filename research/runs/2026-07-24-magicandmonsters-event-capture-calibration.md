# Magic and Monsters event-capture calibration

Date: 2026-07-24  
Mode: narrow calibration / proposal-only  
Goal: prove the slimmer posture on a messy-but-useful case

## Why this store

Magic and Monsters is the right calibration case because the uncertainty is not
about which venue the event belongs to. The uncertainty is about whether a
current WPN-supported lane is reliable enough to project.

- Identity is safe enough: the WPN/EventLink venue name and Mission Viejo
  address align with the existing `magic-and-monsters` venue.
- Source texture is messy enough to matter: official calendar and inspected
  Discord schedule cut against a normal weekly Magic read.
- Under-capturing hurts planning usefulness: current WPN still shows near-term
  Friday Commander dates that a user might reasonably want to know about.

## Narrow conclusion

The older posture suppressed too much here.

This store still does not merit a clean recurring weekly Commander anchor, but
it does merit carrying the currently checked WPN-backed Friday Commander dates
as caveated inventory.

That means:

- do not reactivate the old indefinite weekly Commander series;
- do add the currently checked Friday July 24 and Friday July 31 Commander Free
  Play occurrences;
- do label them medium-confidence / verify-before-going through event details
  and venue assessment notes;
- do keep the venue itself cautious rather than promoting it as a strong
  personal recommendation.

## Identity-safe-enough rationale

Event capture is safe enough because:

- the event is attached to the same Magic and Monsters Mission Viejo venue the
  app already tracks;
- the WPN source is current within the 24-hour reuse window from the
  2026-07-23 snapshot;
- the contradiction is about scheduling reliability, not branch confusion or
  wrong-place attribution.

So the right move is not omission. The right move is dated, caveated capture.

## Proposal shape

Proposal file:

- `supabase/proposals/magicandmonsters-event-capture-calibration-2026-07-24.json`

Planned changes:

- insert one dated/finite Commander event series for the July 24 / July 31
  window only;
- insert two dated occurrences;
- attach WPN evidence;
- refresh venue notes and evaluation language so uncertainty lives in
  confidence/cautions/check-first posture rather than silent omission.

## Signals

No Signals proposed because this is better represented as caveated Events plus
Places/source-health context than as an attention-layer item.

## Ordinary next-batch recommendation after this calibration

If this calibration is accepted, the next ordinary small batch should return to
under-reviewed practical records rather than reopening already decision-grade
stores. My lean recommendation:

- Requiem: close-ish practical candidate with still-thin current texture.
- SoCalMagic: meaningful fit/identity/source-health refinement still matters for
  trust.
- Collector Legion: high-visibility planning candidate where community/solo
  texture would materially affect use.
- Requiem Coffee, Tea, and Fantasy or another similar thin-but-practical record
  from the ledger, depending on latest open gaps after approval.

The key is to keep using the slimmer rule set: current attributable events can
be captured with caveats, and missing social/Discord texture should usually
become dispositioned uncertainty rather than endless open loops.
