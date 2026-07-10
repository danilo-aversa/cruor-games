# Scripts And Tooling

## Scope

Scripts live under `scripts/` and include content validation/export, map QA, Monster QA, room/design QA, diagnostics, repository-map tooling, and loader/config support.

## Responsibilities

- Execute Node-side validation and QA.
- Generate reports, galleries, registry exports, and repository map data.
- Provide Vitest-specific configs and loaders for nonstandard imports.

## Side Effects

Scripts can read command-line arguments, spawn child processes, write files, create directories, and print reports. Generated outputs should be documented before being committed.

## Tests

Some scripts are themselves test entry points. Use `package.json` to determine supported commands rather than invoking individual files ad hoc.

## Findings

- Confirmed: repository-map tooling has no added dependency and uses Git inventory as requested.
- Confirmed: several QA commands are medium-cost and should be run selectively for focused changes.

