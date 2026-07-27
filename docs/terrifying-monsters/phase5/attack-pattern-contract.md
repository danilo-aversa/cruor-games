# Terrifying Monsters — CR-Scaled Attack Pattern v2 Contract

## Purpose

An Attack Pattern is the offensive operating doctrine of a monster, not a fixed list of actions. One selected Attack graft owns a recognizable fantasy, a complete authored repertoire, an authored turn routine, conditional deviations, and player-facing counterplay. The compiler projects that authored pattern to the target CR before simulation or rendering.

The public graft ID and the single Attack-slot selection remain stable. What changes with CR is the projected content of the bundle.

## Two independent progressions

### Repertoire progression

`progression.bands[].abilityIds` determines which authored actions exist in the final stat block at a given CR.

A pattern may therefore compile as:

```text
CR 1:  primary action
CR 5:  primary action + tactical alternative
CR 10: primary action + tactical alternative + limited/recharge deviation
```

Actions that are outside the active CR band are absent from the Ability Model, DPR simulator, stat block, Run Sheet, debug export, Pressure evaluation, and Complexity evaluation.

### Cadence progression

`progression.bands[].multiattack` independently determines whether Multiattack exists and how many attacks it makes.

```text
CR 1:  no Multiattack
CR 5:  two attacks
CR 10: three attacks
```

Repertoire size and cadence need not unlock at the same CR. A controller can gain options without gaining a third attack; a rapid predator can gain Multiattack early while retaining a narrow repertoire.

## Required progression structure

Each CR-scaled Attack Pattern declares contiguous, non-overlapping bands covering CR 0–30:

```js
progression: {
  schemaVersion: "monster-attack-pattern-progression-v1.0",
  basis: "targetCr",
  bands: [
    {
      id: "cr-0-1-nascent",
      minCr: 0,
      maxCr: 1,
      abilityIds: ["primary"],
      multiattack: { enabled: false, count: 0 },
    },
    {
      id: "cr-2-4-developed",
      minCr: 2,
      maxCr: 4,
      abilityIds: ["primary", "secondary"],
      multiattack: { enabled: true, mode: "fixed", count: 2 },
    },
  ],
}
```

Every referenced ability must exist in the authored bundle. Ability count and attack count may stay flat or increase as CR rises, but must not regress.

## Bestiary calibration

The progression is calibrated against 503 monsters in `Bestiary.csv`:

| CR band | Mean offensive options | Multiattack prevalence | Median attacks when present |
|---|---:|---:|---:|
| 0–1 | 1.33 | 13.71% | 2 |
| 2–4 | 1.72 | 70.08% | 2 |
| 5–8 | 1.91 | 93.88% | 2 |
| 9–12 | 1.98 | 97.87% | 3 |
| 13–16 | 2.96 | 96.15% | 3 |
| 17+ | 2.67 | 100% | 3 |

Calibration is distributional, not a rule that every graft follows the same thresholds. High-CR monsters may also gain offensive actions from Twist, Lair, Legendary, or other slots, so the Attack Pattern supplies the core repertoire rather than the entire stat block in isolation.

## DPR rule

Unlocking more attacks does not multiply the target DPR. The target-CR damage budget is redistributed across the active routine. Multiattack controls cadence and expression; the rules engine controls total expected damage.

## Compilation order

The required order is:

```text
selected grafts
→ CR projection
→ Ability Model
→ authored Attack Routine
→ DPR simulation / CR fitting
→ final evaluation
→ stat block / export / Run Sheet
```

No downstream consumer may reintroduce abilities removed by the CR projection.

## Runtime IDs

Stable runtime IDs remain:

```text
<graft-id>:<ability-id>
<graft-id>:multiattack
```

The same authored ability keeps its ID at every CR where it is available. Multiattack references exact runtime IDs after projection.

## QA gate

The Phase 5.1 gate fails when:

- progression bands overlap or leave a CR gap;
- a band references a missing ability;
- repertoire or cadence decreases at a higher CR;
- the apex band does not expose the authored repertoire;
- a projected bundle fails schema, routine, or reference resolution;
- aggregate progression falls outside the Bestiary-derived tolerance;
- the synthetic Multiattack retains a stale count or unavailable reference;
- an excluded action reaches simulation, final evaluation, rendering, or export.

## UI and Creator Studio boundary

This phase changes model, compiler, ruleset adapter, QA, and export behavior only. It does not modify JSX, CSS, the component navigator, or Creator/Content Studio. Any later authoring-surface change requires fresh files from the current repository.
