# Change Control

This project uses a simple protection rule for app work.

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

## Current note

The immediate priority after this file is to create a protective checkpoint for
the current Mana Radar state so future work has a rollback anchor.
