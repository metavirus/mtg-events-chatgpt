# Change Control

See also `docs/EFFICIENCY_SOP.md` for the broader standing anti-waste
operating rules that now sit alongside change control.

This project uses a simple protection rule for app work.

## Text integrity guardrail

Before any UI, data, or coordination-file change is treated as final:

1. keep repo text files in UTF-8 with LF line endings;
2. avoid introducing smart quotes or decorative punctuation unless the file
   already uses them intentionally;
3. run `powershell -ExecutionPolicy Bypass -File
   scripts/validate_text_integrity.ps1` if text files changed;
4. treat any mojibake hit or non-UTF-8 decode failure as a release blocker;
5. separate style/layout edits from encoding fixes so a visual regression is
   not misdiagnosed as text corruption.

Generated JSON recovery/export files are not canonical research inputs and
should not be hand-edited. If an explicit export/debug task regenerates them,
use the controlled exporter and validate the resulting text normally.

The validator defaults to the staged release scope (then untracked files, then
full repo) so legacy text drift elsewhere does not hide or block the current
edit. Run a deliberate full-repo normalization pass separately rather than
mixing it into unrelated work.

For an explicit house-cleaning audit, run:
`powershell -ExecutionPolicy Bypass -File scripts/validate_text_integrity.ps1 -FullRepo`

## Core rule

Before any non-trivial UI, UX, styling, or data-shape change:

1. create a Git checkpoint from the last accepted working state;
2. make the smallest scoped change possible;
3. validate only the targeted behavior;
4. stop for review before doing any extra polish pass.

## Working modes

Use these modes explicitly in practice:

- `checkpoint`: accepted working state, safe to return to
- `targeted fix`: one bounded change tied to a specific issue
- `polish`: optional refinement only after a fresh checkpoint exists

Do not combine `targeted fix` and `polish` in one uninterrupted stretch.

## Rollback rule

If a change introduces regressions:

1. stop adding new edits;
2. compare against the last checkpoint;
3. restore to the checkpoint or reapply only the known-good subset;
4. create a new checkpoint once stability is restored.

## Practical standard for this repo

- Keep accepted UI states checkpointed in Git.
- Treat "looks great now" as the moment to checkpoint.
- Do not start speculative cleanup when the user has already approved the current build.
- If the next step is exploratory, checkpoint first.

## Scope boundary

This document governs app/code changes. Data-only Supabase writes follow
`docs/SUPABASE_OPERATIONAL_WRITE_WORKFLOW.md`; do not import app-preview or
release ceremony into routine data refreshes.
