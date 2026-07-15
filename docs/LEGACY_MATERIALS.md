# Deprecated Legacy Materials

Status: **Deprecated as active project inputs**  
Effective date: 2026-07-15

## Materials covered

- `Southern_California_Commander_Intelligence_Master_Specification_v1_0.docx`
- `Southern_California_Commander_Intelligence_Master_Handoff_Package_v1_0.zip`
- any extracted documents, prototypes, schemas, recommendations, or generated
  artifacts whose authority derives from those earlier AI attempts

## Deprecation rule

These materials are retained only as historical archive. They are not part of
the active product specification, implementation plan, UX direction, research
methodology, ranking model, data architecture, or acceptance criteria.

Do not consult or import them during ordinary design, implementation, research,
or product-decision work. Do not copy their structure or terminology forward by
default. Their presence, completeness, manifest verification, or earlier label
such as `master`, `specification`, or `handoff` gives them no current authority.

If a future question specifically requires historical comparison, a legacy
artifact may be inspected as provenance. Any useful idea found there must be
independently evaluated against the user's current goals and then written into a
current repo-native source-of-truth document before it can affect the product.
The legacy artifact itself never becomes the supporting authority.

## Active sources of truth

Use these instead:

1. `docs/PROJECT_CONTEXT.md` for user goals, scope, preferences, and locked principles;
2. `docs/UX_RESEARCH.md` for the synthesized interaction and visual direction;
3. `docs/DATA_ARCHITECTURE.md` for entity and evidence boundaries;
4. `docs/IMPLEMENTATION_PLAN.md` for the current v1 build sequence;
5. `docs/WORK_BACKLOG.md` and `CURRENT_FRONTIER.md` for active and deferred work;
6. normalized data, source records, and repository-backed research runs for evidence.

The pre-v1 audit establishing this decision is recorded in
`docs/DIRECTION_AUDIT_2026-07-15.md`.

## Preservation policy

Deprecation does not require deletion. Keeping the files outside the active
workspace preserves historical provenance while preventing accidental reuse.
They should not be copied into active documentation folders or linked as required
reading. If they are ever stored in this repository, place them beneath a clearly
named archival directory with a deprecation notice at its root.
