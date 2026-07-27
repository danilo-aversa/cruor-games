# Terrifying Monsters — Phase 6 Support Graft Contract

## Scope

Phase 6 migrates every non-Attack monster graft to the Graft v2 contract without changing the existing Monster Composer or Creator Studio interface. The affected slots are Body, Mind, Movement, Horror, Twist, Weakness, Death, and Lair.

## Required contract

Every support graft must provide:

- a slot-compatible Graft v2 `kind`;
- a recognizable identity with fantasy, tactical role, signature, and recognition tags;
- at least one authored ability with stable local ID and structured rules;
- an authored routine for procedural slots;
- explicit balance, complexity, counterplay, and spike-risk profiles;
- at least two counterplay channels;
- verified equality between structured rules and renderer output;
- successful compilation at CR 1, 5, 10, and 15.

## Slot-to-kind mapping

| Slot | Graft v2 kind |
|---|---|
| Body | `traitBundle` |
| Mind | `traitBundle` |
| Movement | `movementPattern` |
| Horror | `horrorFeature` |
| Twist | `combatTwist` |
| Weakness | `weakness` |
| Death | `deathEffect` |
| Lair | `lairEffect` |

## CR scaling

CR progression is authored only where challenge rating changes the mechanic itself. It may patch targeting, area, summon count, usage, movement distance, trigger threshold, or another structured rule value. Increasing CR does not automatically multiply damage; the ruleset and CR fitter remain authoritative for numerical damage allocation.

Static support grafts retain the same rule at every CR. Scaled support grafts use `monster-graft-progression-v1.0` bands and compile the selected band before simulation, evaluation, rendering, or export.

## Compatibility

Legacy graft IDs, slots, source anchors, selection references, and preset references remain unchanged. The UI still selects one graft per slot. The runtime receives a Graft v2 ability bundle through the existing adapter boundary.

## Publication gate

A support graft is not publication-ready if its kind and slot disagree, its identity or profiles are incomplete, its counterplay has fewer than two channels, a CR band fails compilation, a declared progression does not change the compiled rule, or verified parity fails.
