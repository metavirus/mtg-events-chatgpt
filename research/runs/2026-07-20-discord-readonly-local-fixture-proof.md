# Discord read-only local fixture proof

- Date: 2026-07-20
- Pass type: protocol-only local safety proof
- Real Discord accessed: no
- Logged-in Discord session used: no
- Monitoring-map access modes changed: no

## Purpose

Test the first implementation slice of
`docs/DISCORD_AUTONOMOUS_READ_ONLY_ACCESS_DESIGN.md` against a local
Discord-like fixture before considering any real Discord shell test.

## Artifacts

- `research/fixtures/discord-readonly/fixture.html`
- `scripts/discord_readonly_fixture_proof.mjs`

## Guard layers tested

- A survey-facing capability object exposes only one operation: direct-URL
  `survey`. It exposes no click, type, paste, keypress, upload, submit, or
  arbitrary-script method.
- A document-start page guard blocks input/click/submission events, disables
  composers and mutating controls, clears editable state, and publishes a
  versioned heartbeat.
- A browser-context request guard blocks and logs POST, PUT, PATCH, and DELETE
  attempts against fixture mutation endpoints.
- A pre-extraction safety check requires the expected page signature, `ready`
  access state, current heartbeat, no editable focus, and zero enabled mutating
  controls.

## Proof matrix

| Requirement | Result | Evidence |
| --- | --- | --- |
| Extract visible message content | Pass | Two timestamped fixture messages were returned verbatim. |
| Extract server/channel metadata | Pass | Server, channel name, and stable fixture channel ID were returned. |
| No interaction methods in survey API | Pass | The frozen public surface contains only `survey`. |
| Typing/paste/Enter blocked | Pass | Adversarial events left both composers empty and created no fixture mutation log. |
| Send/reply/react/upload/join/role/settings blocked | Pass | All mock controls remained disabled; programmatic click attempts produced no control action. |
| Mutation requests blocked/logged | Pass | POST, PUT, PATCH, and DELETE were each intercepted and logged. |
| Missing guard fails closed | Pass | The unguarded context stopped on the missing heartbeat. |
| Editable focus fails closed | Pass | The safety-state validator stopped explicitly on editable focus. The normal page guard prevents acquiring that focus. |
| Unexpected page state fails closed | Pass | A changed fixture signature stopped before extraction. |
| Blocked/gated state fails closed | Pass | `join_or_role_gate` stopped before extraction. |

Automated result: 8 checks passed, 0 failed. The matrix separates some checks
that share one automated adversarial case.

## Boundaries and limitations

- This fixture proves the harness contract and layered guard behavior; it does
  not prove compatibility with Discord's current DOM or network behavior.
- The page guard is injected by the test browser context. A production proof
  still needs the dedicated isolated profile and a locally controlled extension
  or equivalent document-start mechanism.
- The network rules in this proof target mock mutation endpoints. Real Discord
  endpoint coverage must be independently enumerated, reviewed, and tested
  without reading real message content before it can be trusted.
- Browser automation internally retains powerful primitives for the private
  adversarial test. The survey-facing object deliberately does not expose them.

## Decision gate

The local proof supports designing the next protocol-only layer: a dedicated
profile/extension implementation followed by a separately approved real-Discord
shell test that reads page identity metadata only. It does not yet justify a
real content survey. The remaining limitations must be carried into that test,
and no route may become `direct_navigation_verified` from this fixture alone.
