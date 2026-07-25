# Terrifying Monsters — Phase 1 Source Authority Boundary

**Status:** implemented migration infrastructure  
**Repository baseline:** `main`, `3f70b1e83a6c4d072a53b900840971a792d0eab1`  
**Package baseline:** `31.1.0a`  
**Runtime content cutovers in this phase:** none  
**UI changes in this phase:** none

## 1. Objective

Phase 1 removes accidental source precedence from the Monster Composer feed.

Before this phase, the runtime catalogue was assembled by merging registry-derived grafts and native grafts in an order whose overwrite behavior implicitly made the native file authoritative. Registry provenance could survive the merge, but source authority was not represented as a domain decision.

The target architecture is now explicit:

```text
Inspiration Module / Content Pack
→ shared monster component
→ runtime adapter
→ source authority boundary
→ Monster Composer
```

The boundary allows migration one Source Anchor at a time without changing the current UI or forcing a global content cutover.

## 2. Source authority modes

The manifest lives in:

```text
features/monster-composer/data/monster-graft-source-authority.js
```

Each Source Anchor has one of three modes.

### `native-legacy`

The current native graft remains authoritative. A registry representation may exist for provenance or compatibility, but it cannot replace the native mechanics.

### `registry-shadow`

The native graft remains authoritative while a canonical registry representation is developed and compared. Missing registry coverage is reported by QA.

### `registry-canonical`

An explicitly canonical registry component becomes authoritative. A native fallback may remain temporarily, but using it is a blocking QA error.

## 3. Current production authority

All four current production sources remain deliberately native-authoritative:

| Source | Mode |
|---|---|
| Decomposition | `native-legacy` |
| Jikininki | `native-legacy` |
| Wolf Spiders | `native-legacy` |
| Wax Death Masks | `native-legacy` |

Therefore Phase 1 does not change the selected graft catalogue or public monster output.

## 4. Canonical registry requirement

A registry entry is not canonical merely because it exists in the registry.

It must explicitly declare:

```js
authoring: {
  schemaVersion: "monster-graft-authoring-v1.0",
  origin: "inspiration-module", // or content-pack / cms / registry
  canonical: true,
  migrationStatus: "canonical"
}
```

Entries generated from `monster-grafts.js` by the shared-component adapter are marked:

```js
authoring: {
  origin: "native-adapter",
  canonical: false,
  migrationStatus: "legacy-native"
}
```

This prevents the existing circular conversion from being mistaken for a completed source migration.

## 5. Runtime resolution

The feed now resolves one row per graft id through `resolveMonsterGraftCatalogue()`.

For every collision it records:

- Source Anchor;
- authority mode;
- native availability;
- registry availability;
- whether the registry entry is explicitly canonical;
- selected origin;
- fallback use and reason;
- semantic equivalence or divergence between the two representations.

The selected runtime object preserves existing Content Pack and registry provenance.

## 6. Graft v2 field preservation

The shared-component adapters now preserve, without interpreting, these future Graft v2 fields:

- `schemaVersion`;
- `kind`;
- `identity`;
- `abilities`;
- `routine`;
- `hooks`;
- `pressureProfile`;
- `complexityProfile`;
- `counterplayProfile`;
- `spikeRiskProfile`;
- `authoring`.

This is a transport boundary only. Phase 1 does not yet compile ability bundles or authored routines. That work belongs to Phase 2.

## 7. QA gates

`runMonsterContentQa()` now validates the source boundary.

Blocking conditions:

- native and registry representations assign the same graft id to different Source Anchors;
- a `registry-canonical` source resolves a graft from the native fallback;
- a `registry-canonical` source lacks an explicitly canonical registry component.

Warnings:

- a `registry-shadow` source lacks registry coverage;
- a `native-legacy` source unexpectedly contains a registry-only graft.

Focused tests and audit output are available through:

```text
npm run monster:qa:source-boundary
npm run monster:audit:source-boundary
npm run monster:audit:source-boundary:strict
```

The strict audit fails when a canonical source uses a fallback or a shadow source lacks registry coverage. The existing `monster:qa` path also receives source-boundary issues through Monster Content QA.

## 8. Source cutover procedure

A Source Anchor may advance only in this order:

```text
native-legacy
→ registry-shadow
→ registry-canonical
```

Required gates before `registry-shadow`:

1. all source graft ids exist as shared components;
2. authoring provenance points to the actual Inspiration Module or Content Pack;
3. Graft v2 fields survive adapter round trips;
4. no UI dependency is introduced.

Required gates before `registry-canonical`:

1. complete source coverage;
2. no unresolved adapter divergence;
3. rules/render/simulation parity;
4. Frame Fit and anatomy compatibility pass;
5. Attack Pattern bundles compile correctly;
6. Monster Content QA has no source-authority errors;
7. editorial approval for the migrated source.

## 9. UI boundary

No React component, stylesheet, route, control, label, layout or interaction was changed.

A Graft v2 will continue to occupy one existing slot. The ability bundle and routine remain internal model data until the final UI refinement phase is explicitly authorized.

## 10. Next phase

Phase 2 introduces the Graft v2 schema and compiler bridge:

```text
one selected graft
→ zero or more traits/actions/reactions/etc.
→ authored routine
→ existing Ability Model and CR engine
```

The first implementation should use synthetic fixtures and compatibility tests before migrating any production Attack Pattern.
