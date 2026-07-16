# Top-store evaluation calibration — 2026-07-15

## Scope

Calibrate the new separate research-status, fit, and confidence model on two
strong nearby candidates before applying it more broadly: Finch and Sparrow and
Collectors Lounge — Cypress.

## Findings

### Finch and Sparrow

- Promoted candidate: **A- / 4.3 / high confidence**.
- Strong nearby WPN Premium venue with multiple distinct Commander lanes and
  unusually useful attributed user visit evidence.
- The official site currently promotes Birdcage VII on July 25: an 11:00 AM,
  $60, full-proxy-friendly, 64-player cEDH tournament. It is normalized for
  landscape completeness but does not improve the casual-fit score.

### Collectors Lounge — Cypress

- Promoted candidate: **B+ / 4.1 / medium confidence**.
- Extremely close, current weekly social scheduling, explicit Friday casual
  Commander, and a separately labeled Saturday Optimized lane.
- Official Instagram adds July 17 God of Mischief Commander and a July 19 Marvel
  Super Heroes three-pack draft; both are normalized as dated events.
- Medium confidence reflects limited evidence about the lived Friday crowd, not
  the absence of published solo-arrival instructions. Routine silence is neutral.

## Method correction

Explicit welcoming, pairing, proxy, or power-matching language earns a positive.
Explicit restrictive or hostile language earns a negative. Most stores omit
these details, and omission must not block a grade, lower fit, or keep a reviewed
store in research purgatory.

## Normalization decisions

- Added all three meaningful dated specials to `events.json`.
- Added source records for the fresh official Finch and Collectors Lounge checks.
- Added inspectable evaluation objects only to the two calibrated stores.
- Preserved the legacy top-level research status for current filter compatibility.
- Corrected the application occurrence builder so nonrecurring records using the
  canonical `startDate` field actually appear as confirmed dated events; added
  structured start times for the three newly captured specials.
- Added clickable evaluation tiles and a rationale drawer showing the grade,
  score, confidence, pluses, cautions, and open questions.
