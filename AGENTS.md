# Cruor Games — Codex Instructions

## Project Type

Cruor Games is a modular web application for tabletop RPG tools and dark fantasy content. The map generator is one feature of the site, not the whole application.

## Primary Goal

Work efficiently, make safe and maintainable changes, and avoid unnecessary token/credit usage.

## Repository Map

- Treat the current code as the technical source of truth.
- Consult `docs/repository-map/index.md` before architectural work.
- Read the relevant repository-map area document before modifying a subsystem.
- Verify repository-map documentation against current code when it guides a change.
- Update the repository map when files, imports, exports, routes, state ownership, data contracts, runtime flows, or QA coverage change.
- Run `npm run docs:repo-map` and `npm run docs:repo-map:check` after repository-map-relevant changes.
- Do not manually edit generated structural fields in `docs/repository-map/repository-map.json`.
- Explicitly report when repository-map documentation appears stale.

## Core Rules

- Keep features modular.
- Do not mix map generator logic with unrelated site features.
- Prefer small, focused changes over broad rewrites.
- Do not rename public functions, files, CSS classes, or data fields unless explicitly requested.
- Preserve existing behavior unless the task asks to change it.
- Avoid adding dependencies unless necessary.
- When changing JavaScript, check for broken references, missing imports, and duplicated helpers.
- When changing rendering logic, keep data generation separate from visual rendering.
- When a task is unclear, inspect only the relevant files needed to understand the issue before changing code.
- Do not make speculative fixes. Identify the likely root cause first.

## Credit Protection Rules

- Work only on the files explicitly mentioned by the user whenever possible.
- Do not inspect unrelated files unless strictly necessary.
- If another file is needed, explain why before reading or editing it.
- Do not perform repository-wide searches unless explicitly requested.
- Avoid opening large files unless they are directly relevant.
- Avoid reading generated files, build outputs, bundled files, minified files, lockfiles, dependency folders, cache folders, and large logs unless required.
- Do not scan the entire repository to understand a localized task.
- Prefer targeted inspection over broad exploration.
- Prefer targeted validation over full-project validation.
- Do not run expensive commands by default.
- Do not run full test suites unless requested or clearly necessary.
- Do not run broad commands such as `grep -R`, `find`, `npm test`, `npm run build`, or `npm run lint` unless the task requires it or the user asks for it.
- If a command produces large output, summarize only the relevant lines.
- Keep final explanations concise.
- Do not paste large diffs, full files, or long command outputs unless explicitly requested.

## Scope Control

Before editing:

- Identify the exact file or files that need to change.
- Read only the necessary surrounding context.
- Use existing local patterns from the target file.
- Make the smallest change that solves the requested problem.
- Do not refactor unrelated code.
- Do not clean up unrelated code.
- Do not move code between modules unless the task explicitly requires it.
- Do not change unrelated behavior while fixing a bug.

## Code Style

- Use plain JavaScript unless the project is explicitly migrated.
- Prefer readable named functions over clever abstractions.
- Keep feature code inside `features/<feature-name>/`.
- Keep shared utilities inside `shared/`.
- Do not place feature-specific logic in shared utilities.
- Preserve existing naming conventions.
- Preserve existing file organization.
- Preserve comments, version headers, exports, types, and public APIs unless the task explicitly requires changing them.

## Verification

After modifying code:

- Use the smallest useful verification step.
- Check that the app still loads when practical.
- Check browser console errors when practical.
- Check that the modified feature still works with at least one minimal input.
- Prefer targeted checks for the changed feature over full-project checks.
- If no safe targeted validation exists, explain what should be checked manually.
- Do not run `npm test`, `npm run build`, `npm run lint`, or other broad scripts unless requested or clearly necessary.

## Final Response Format

Always summarize:

- Changed files.
- What changed.
- Verification performed, if any.
- Any remaining risk or follow-up needed.

Do not include unrelated suggestions.
Do not include large code excerpts unless explicitly requested.
