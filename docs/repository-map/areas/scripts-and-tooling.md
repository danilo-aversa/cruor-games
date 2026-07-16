# Scripts And Tooling

## Scope

Scripts live under `scripts/` and include content validation/export, map QA, Monster QA, room/design QA, diagnostics, repository-map tooling, and loader/config support.

## Responsibilities

- Execute Node-side validation and QA.
- Generate reports, galleries, registry exports, and repository map data.
- Provide Vitest-specific configs and loaders for nonstandard imports.
- Audit legacy Inspiration modules, validate canonical v2 candidates, report
  semantic coverage, and run deterministic Dark Places sample QA.

## Side Effects

Scripts can read command-line arguments, spawn child processes, write files, create directories, and print reports. Generated outputs should be documented before being committed.

The Phase 8 audit, validation, coverage, and sample-report scripts are read-only.
`migrate-inspiration-module-v2.mjs` is also read-only with `--check`; when given
an output path it writes canonical bytes idempotently and refuses to overwrite
different bytes unless `--force` is explicit.

## Tests

Some scripts are themselves test entry points. Use `package.json` to determine supported commands rather than invoking individual files ad hoc.

## Findings

- Confirmed: repository-map tooling has no added dependency and uses Git inventory as requested.
- Confirmed: several QA commands are medium-cost and should be run selectively for focused changes.
- Confirmed: Phase 8 batch QA is exposed as
  `npm run qa:dark-places:semantic-phase8`.
