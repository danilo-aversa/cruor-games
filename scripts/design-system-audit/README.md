# Design-system audit inventories

`generate-inventories.mjs` is a deterministic, dependency-free static-analysis tool for the design-system audit. It reads Git-tracked source and writes only these documentation artifacts:

- `docs/design-system/audit/css-inventory.json`
- `docs/design-system/audit/token-inventory.json`
- `docs/design-system/audit/token-inventory.md`

It does not rewrite CSS, imports, markup, or runtime code.

For reproducibility while the shared worktree is active, this audit version reads the exact starting commit `be61f98fd2537d367c757bf9796b11735bc7d193`. A later audit should update the `SOURCE_COMMIT` and `SOURCE_BRANCH` constants intentionally before regenerating new baselines.

Run from the repository root:

```text
node scripts/design-system-audit/generate-inventories.mjs
```

Check that committed outputs match a fresh scan without writing files:

```text
node scripts/design-system-audit/generate-inventories.mjs --check
```

The embedded JSON schema notes define record keys, ordering, path format, fact-versus-heuristic handling, and classification vocabularies. Static imports, definitions, usages, and source locations are facts. Runtime-unused conclusions, semantic categories, raw-value dispositions, ownership, and migration targets are explicitly labeled heuristics.
