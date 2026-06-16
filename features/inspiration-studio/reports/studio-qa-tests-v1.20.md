# Studio QA Tests v1.20 — Running Overlay

## Scope

Adds a blocking visual overlay while Monster Batch QA is running.

## Changes

- Added full-page dark overlay with backdrop blur while `runState === "running"`.
- Added centered animated loading indicator and warning copy.
- Prevented modal close while a QA run is active.
- Delayed the heavy QA execution by one animation frame plus a short timeout so the overlay can render before the synchronous batch begins.
- Disabled export/copy actions while the batch is running.
- Fixed a stray closing JSX label in the QA controls grid.

## Files

- `features/inspiration-studio/qa/MonsterBatchQaModal.jsx`
- `features/inspiration-studio/inspiration-studio.styles.css`

## Verification

- `node --check` on all included `.js` files under `features/monster-composer` and `features/inspiration-studio`.
- TypeScript JSX transpile diagnostics on the edited JSX files.
