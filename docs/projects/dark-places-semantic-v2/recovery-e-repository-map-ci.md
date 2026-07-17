# Recovery E — Repository Map and CI Gates

## Outcome

Recovery E repairs the repository-map freshness model and establishes explicit CI gates before general regression repair.

No Inspiration content, Monster graft data, Dark Places compiler behavior, Map Generator behavior, or production UI is changed in this recovery.

## Repository Map Contract

The previous validator required `metadata.inspectedCommit` to equal `HEAD`. Committing the regenerated map changed `HEAD`, so the map could invalidate itself immediately.

The repaired contract:

- inventories tracked and non-ignored untracked working-tree files;
- omits `docs/repository-map/repository-map.json` from its own records;
- computes `sha256-path-content-v1` from sorted file paths and content hashes;
- ignores branch, commit, staging, and tracked/untracked state in the fingerprint;
- keeps inspected commit and branch as informational audit metadata;
- rejects added, removed, renamed, unignored, or content-changed files;
- verifies the fingerprint implementation with an independent self-check.

Local ZIP transfer archives are ignored and cannot pollute the inventory.

## CI Contract

The Full QA workflow now runs on:

- pushes to `main`;
- pull requests targeting `main`;
- manual dispatch.

Blocking architecture gates:

1. repository fingerprint self-check;
2. repository-map freshness validation;
3. shared content validation;
4. Recovery A–D semantic ownership QA.

Blocking quality gates:

1. ESLint;
2. Monster QA;
3. Vitest;
4. production build.

Playwright remains visible but non-blocking until Recovery F resolves the existing browser and regression backlog.

## Commands

After applying Recovery E:

```powershell
npm run docs:repo-map
npm run qa:recovery-e
```

Recovery F then addresses every remaining blocking quality failure without weakening these gates.
