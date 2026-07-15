# Research Journal and Evidence Store

This directory is the durable record of Commander-store and event research. It
exists so work can be audited, reproduced, and resumed independently of any AI
chat history.

## Required record for each substantive research pass

Create a run folder:

```text
research/runs/YYYY-MM-DD-short-scope/
  RUN.md
  sources.json
  findings.json
  reconciliation.json        # when identities or records are reconciled
  artifacts/                 # permitted raw snapshots, screenshots, or transcriptions
```

`RUN.md` is the human/AI handoff narrative. Use
`research/templates/RUN_NOTES_TEMPLATE.md`.

Structured files should link to stable store, event-series, occurrence, source,
and observation IDs whenever those schemas are available. Until then, record
both canonical names and source-specific identifiers.

## Source coverage

Record every meaningful source attempted, including failures and negative
results. A source that is inaccessible, stale, empty, blocked by login, or lacks
Commander information is still part of the research result.

For each source attempt, capture:

- source URL and platform/type;
- store or research scope;
- checked timestamp and access method;
- HTTP/access outcome;
- publication/observation date when available;
- useful claims or `no relevant finding`;
- raw artifact or observation reference;
- freshness and authority assessment;
- next recommended check.

Do not record cookies, tokens, passwords, private messages, or authenticated
account details.

## Research findings

Separate:

- exact or faithfully transcribed source wording;
- normalized facts;
- analytical interpretation;
- personal-fit assessment;
- confidence and unresolved ambiguity.

Explain why one source was preferred for a claim and preserve conflicting or
superseded evidence.

## Commit discipline

- Do not rewrite committed raw evidence.
- Add a new observation or run when information changes.
- Keep collector updates, raw snapshots, reconciliation, and generated app-data
  changes distinguishable in commit history.
- Summarize the research scope and key result in the commit or pull-request body.
- Never commit the user's exact home address, private coordinates, personal
  correspondence, browser state, or notes the user wants kept private-only.

Clearly attributed user field notes intended as durable research evidence may be
committed when they are scoped, dated, and kept distinct from official/public
claims.

## Existing material

`wizards-reconciliation-2026-07-14.json` is the first reconciliation checkpoint.
Future work should use the run-folder convention above and link back to that
checkpoint when relevant.
