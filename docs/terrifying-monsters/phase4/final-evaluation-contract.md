# Terrifying Monsters — Final Monster Evaluation v2 Contract

**Status:** Phase 4 implementation contract  
**Evaluation version:** `monster-final-evaluation-v2.0`  
**Runtime UI changes:** none  
**Content Studio changes:** none

## 1. Purpose

The legacy Monster Composer uses selected graft cost, legacy stat deltas, inferred mechanic tags and a CR validation floor to produce Pressure and Complexity values. That profile is useful while assembling a creature, but it does not describe the final compiled monster reliably.

Phase 4 introduces a separate evaluation boundary after the existing pipeline has produced:

- the flattened Ability Model;
- the attack routine;
- the three-round DPR profile;
- printed statistics;
- the effective defense and condition profile;
- CR validation;
- tempo and tier context;
- the counterplay audit.

The new boundary evaluates the creature that will actually reach the table, not the price of the grafts selected to build it.

## 2. Independent measures

The output contains five independent measures.

### 2.1 Build Budget

Build Budget remains the Frame's authoring envelope.

```text
unit: build-points
limit: frame budget
used: selected graft cost
```

It answers:

> How much construction budget did the build consume?

It is not normalized to 0–10 and is not Pressure.

### 2.2 Pressure

Pressure is a 0–10 measure of expected party stress created by the finalized monster.

It reads:

- sustained DPR relative to the CR baseline;
- burst DPR and burst-to-sustained ratio;
- finalized hard-control profile;
- effective HP and defensive CR deviation;
- action-economy tempo;
- area reach and expected targets;
- persistent, recharge and death-trigger pressure.

Pressure does not read graft fairness credits and does not subtract Counterplay.

### 2.3 Complexity

Complexity is a 0–10 measure of DM-facing workload.

It reads the flattened Ability Model rather than the number of selected grafts. It includes:

- actionable ability count;
- number of stat-block sections used;
- reactions, recharge, legendary, lair and death timing;
- conditions, repeat saves, escape checks and ongoing effects;
- alternate actions, routine choices, replacements and additions;
- spellcasting, summoning and special procedures;
- unresolved or proxy-tracked effects.

Complexity is independent from CR and damage magnitude.

### 2.4 Counterplay

Counterplay is a separate 0–10 measure of player-facing answers.

The existing counterplay audit is normalized from 0–100 to 0–10. If that audit is unavailable, the evaluator uses structured counterplay declarations and the presence of a Weakness graft as a bounded fallback.

A high Counterplay score does not make a monster less pressuring. It means the pressure is more readable and answerable.

### 2.5 Spike Risk

Spike Risk is a separate 0–10 measure of volatility.

It reads:

- burst-to-sustained DPR;
- burst-to-baseline DPR;
- opening-round delta;
- recharge, reaction and death-trigger damage;
- repeated or severe hard control, weighted more strongly at low CR.

A monster can have moderate average Pressure and high Spike Risk.

## 3. Rounding and scaling

All 0–10 measures:

1. calculate unrounded component values;
2. sum the components;
3. round only the final score and displayed breakdown values;
4. clamp the result to 0–10.

This removes the legacy behavior where small components could disappear because each component was rounded before the sum.

## 4. Compatibility boundary

The current UI consumes the legacy Pressure and Complexity profiles. Phase 4 does not change that UI.

`projectFinalEvaluationToLegacyProfiles()` therefore supports two modes:

- preserve existing visible scores while attaching the v2 result;
- project a v2 score into the current budget/cap scale for a future controlled cutover.

The current runtime uses the first mode. The debug export exposes the complete final evaluation so it can be inspected before the UI refinement phase.

The legacy profile is explicitly marked as:

```text
stage: provisional-selected-grafts
```

The v2 profile is explicitly marked as:

```text
status: final-compiled-monster
```

## 5. Runtime and export behavior

`applyPressureValidationFloor()` retains the current visible legacy score and attaches the final-output Pressure v2 calculation available at that boundary.

The debug export calculates the complete evaluation from:

```text
computed.abilityModel
computed.attackRoutine
computed.dprProfile
computed.effectiveProfile
computed.crValidation
computed.mechanicsSummary
computed.counterplayAudit
selectedFeatures
```

The public export payload is unchanged.

## 6. Invariants

The implementation and deterministic audit enforce:

- every public v2 measure is within 0–10;
- burst raises Pressure and Spike Risk;
- finalized hard control raises Pressure;
- stronger Counterplay does not lower Pressure;
- flattened repertoire raises Complexity;
- changing only Build Budget does not change Pressure or Complexity;
- Complexity does not use CR or damage magnitude;
- Pressure rounds after summing components.

## 7. UI and Content Studio boundary

No React, JSX, CSS, layout, control, slot, navigator or stat-block presentation file is modified in this phase.

No file inside Inspiration Studio / Content Studio is modified. Because that system has changed substantially after the original audit, any future phase that needs to touch it must begin from fresh files supplied from the current repository state.
