# Studio QA Tests v1.17 — Export ZIP + Modal UI Polish

## Scope

This pass refines the Studio QA Tests modal and export flow after the first browser QA runs.

## Changes

- QA report download now supports a single ZIP export containing both JSON and Markdown reports.
- The modal header action now exposes `Export ZIP` instead of requiring separate JSON/Markdown downloads.
- ZIP creation is browser-side and dependency-free, using a stored ZIP payload.
- `.studio-qa-summary-tile` cards were made more compact.
- Summary tile icons were moved into a low-opacity decorative background role.
- `.studio-qa-run-button` now uses inline-flex layout with a stable icon/text gap.
- `.studio-global-modal__header-actions` buttons now inherit the same compact action styling rhythm.
- The outlier table header now has a `Status` column, matching the body cell count.
- `.studio-qa-table` now uses fixed table layout and explicit column widths to keep header/body alignment stable.

## Verification

- `node --check` passed for JavaScript files under `features/inspiration-studio` and `features/monster-composer` included in this zip.
- JSX was inspected textually; full Vite build was not run because this working zip intentionally omits package/build dependencies.
