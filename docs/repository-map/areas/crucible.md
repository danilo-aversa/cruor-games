# Crucible

## Scope

Crucible files live under `features/crucible/`. The router can open Crucible through query parameters such as `section=crucible`, `tool`, and `generator`.

## Responsibilities

- Provide a container for tool or generator views that are not direct top-level routes.
- Coordinate internal Crucible generator selection through router state.

## Dependencies

Crucible depends on app routing and shared UI/style infrastructure. It should not become a dumping ground for unrelated feature logic.

## Tests

Coverage is primarily through build/lint unless a specific Crucible tool has its own tests.

## Findings

- Confirmed: Crucible is route-selectable through router query compatibility.
- Risk: medium when changing router integration; otherwise depends on specific child tool.

