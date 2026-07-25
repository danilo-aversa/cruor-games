# Terrifying Monsters — Phase 0 Findings

## Baseline

- Repository branch: `main`
- Commit: `3f70b1e83a6c4d072a53b900840971a792d0eab1`
- Package version: `31.1.0a`
- Runtime files modified: none
- UI files inspected in this phase: none required for implementation
- UI files modified: none

## Catalogue inventory

The current catalogue contains:

| Source | Grafts |
|---|---:|
| Decomposition | 26 |
| Jikininki | 25 |
| Wolf Spiders | 32 |
| Wax Death Masks | 7 |
| **Total** | **90** |

By slot:

| Slot | Grafts |
|---|---:|
| Body | 12 |
| Mind | 11 |
| Movement | 11 |
| Attack | 15 |
| Twist | 12 |
| Weakness | 13 |
| Death | 8 |
| Lair | 7 |
| Horror | 1 |

## Attack Pattern finding

All 15 Attack-slot grafts currently compile as one ability each.

Current authored routine coverage:

| Capability | Count |
|---|---:|
| Ability bundles | 0 |
| Authored routines | 0 |
| Explicit Multiattack | 0 |
| Multiattack participation metadata | 0 |

This confirms that the current Attack Pattern slot is semantically a single-action slot. The attack routine planner may repeat that one action to satisfy DPR packet sizing, but the resulting routine is not an authored monster behavior.

## Structured migration finding

All 90 grafts contain a structured `rules` object, but the migration metadata shows:

| Origin | Count |
|---|---:|
| Converted from legacy mechanics | 84 |
| Existing structured rules | 5 |
| Template-readiness gap | 1 |

All embedded graft rules currently declare `monster-graft-rules-v1.12`, while the active schema source declares a newer schema version. Normalization may keep runtime behavior valid, but the authored catalogue remains behind the current schema boundary.

## Balance metadata finding

All 90 grafts still rely on legacy `stats`.

| Balance source | Count |
|---|---:|
| `legacyStats` | 90 |
| explicit `balanceProfile` | 0 |

This means the current balance adapter is still a compatibility layer rather than a completed canonical balance model.

## Text/rules parity review

The generated heuristic audit identifies 45 grafts requiring manual parity review.

This number is deliberately conservative in meaning: it is not a count of confirmed defects. A flag means that legacy prose contains a mechanical signal not obviously represented by an equivalent structured field.

Highest-frequency review signals include:

- advantage or disadvantage clauses;
- movement or speed state changes;
- resistance, immunity or vulnerability language;
- healing or temporary-hit-point effects;
- AC state changes;
- proficiency-bonus scaling;
- conditional extra damage;
- forced movement;
- summon or spawn behavior.

Known confirmed examples from the audit:

### `slam-decomposition`

The prose adds one extra damage die after a straight 10-foot approach. The structured damage model contains one standard `mainAttack` budget block with no conditional damage part.

### `skin-slippage`

The prose grants advantage on checks and saves made to escape a grapple and also penalizes a grappler. The structured rule models the grappler's Constitution save and attack disadvantage, but not the creature's own grapple-escape advantage.

### `fresh-bloat-hide`

The prose defines an AC state above half HP and a speed increase when bloodied. The rule object has no explicit defense or state-transition structure for those clauses; their power is partially represented through legacy stats.

### `volatile-immobile-mass`

The prose sets speed to 0, increases reach and halves forced movement. Those clauses need an explicit structural model before text, simulator and effective profile can be guaranteed to agree.

## Side-override finding

`monster-grafts.js` also contains separate metadata maps:

| Map | Entries |
|---|---:|
| Frame fit | 90 |
| Compatibility | 56 |
| Anatomy constraints | 46 |
| Anatomy grants | 9 |
| Mechanic metadata | 17 |

Two maps still reference `bone-reassembly`, which is not present in the current 90-graft catalogue:

- compatibility override;
- anatomy constraint override.

This must be resolved as an archived legacy ID, restored graft, or stale override during source-of-truth migration.

## Source-of-truth finding

The current content path is circular:

```text
native monster graft
→ shared monster component
→ static registry/content pack
→ runtime monster graft
→ merge with native monster graft
```

The target canonical direction is:

```text
Inspiration Module / Content Pack
→ canonical shared Graft v2 component
→ runtime adapter
→ Monster Composer
```

The transition must remain source-by-source and adapter-backed. A global cutover would create unnecessary regression risk.

## Phase 0 decisions

1. The existing engine remains in place.
2. A graft may compile into multiple abilities.
3. Attack Pattern becomes a coherent behavior and routine, not a stat-block row.
4. Existing ability rules remain the per-ability mechanical language.
5. Structured rules become authoritative over manual mechanics prose.
6. Build Budget, Pressure, Complexity, Counterplay and Spike Risk become separate concepts.
7. Pressure and Complexity v2 are calculated only after the final ability set and routine exist.
8. Shared content packs and Inspiration Modules become the target authoring source.
9. Migration occurs source by source with legacy adapters.
10. No UI work occurs before explicit authorization in the final refinement phase.

## Commands

Generate the inventory:

```bash
npm run monster:audit:grafts
```

Verify that committed reports are current:

```bash
npm run monster:audit:grafts:check
```
