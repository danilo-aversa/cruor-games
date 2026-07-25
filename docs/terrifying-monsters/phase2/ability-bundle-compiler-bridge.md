# Terrifying Monsters — Phase 2 Ability Bundle Compiler Bridge

**Status:** implemented compatibility bridge  
**Runtime scope:** Monster Composer model, content transport, QA, debug export  
**Public UI scope:** unchanged

## Purpose

Phase 2 removes the architectural assumption that one selected graft must compile into exactly one stat-block ability.

The new boundary is:

```text
one selected graft
  -> one ability bundle
  -> zero, one, or multiple compiled abilities
  -> existing routine planner, DPR simulator, CR fitter, effective profile, export
```

The user still selects one graft in one existing slot. No new control, panel, label, layout, or interaction is required.

## Compatibility rule

Every current legacy graft is compiled through a legacy adapter:

```text
legacy graft id
  -> one ability
  -> identical runtime id
  -> identical normalized rules
```

The current production catalogue therefore remains:

```text
90 grafts -> 90 abilities
```

No current source has been switched to Graft v2 and no Source Anchor authority mode has changed.

## Graft v2 contract

A Graft v2 record declares:

```js
{
  schemaVersion: "monster-graft-v2.0",
  id,
  title,
  kind,
  slot,
  sourceAnchors,
  identity,
  abilities,
  routine,
  modifiers,
  compatibility,
  balanceProfile,
  complexityProfile,
  counterplayProfile,
  spikeRiskProfile,
  migration
}
```

### Ability identity

Authored ability ids are local to the graft. The compiler creates globally stable runtime ids:

```text
<graft-id>:<local-ability-id>
```

Every compiled ability retains:

- `sourceGraftId`;
- `localAbilityId`;
- `sourceComponentId` when available;
- `sourceAnchor`;
- authored or compiler-generated status;
- compilation and migration provenance.

### Zero-ability grafts

A non-Attack Pattern graft may emit no standalone abilities when it exists only to modify another bundle through an explicit modifier contract.

An Attack Pattern must emit at least one offensive ability and must declare:

- fantasy identity;
- tactical role;
- signature behavior;
- a routine other than `none`.

## Authored routine bridge

An Attack Pattern can declare a Multiattack routine at graft level. The compiler creates a synthetic structured Multiattack ability before the authored abilities.

Example:

```text
pressure-collapse
  -> pressure-collapse:multiattack
  -> pressure-collapse:slam
  -> pressure-collapse:grab
```

The synthetic ability is not new authored content. It is the stat-block projection of the authored routine.

## Allocation identity

Before Phase 2, attack-routine allocations used `sourceGraftId` as their key. That was safe only while one graft produced one ability.

Phase 2 keys allocations by the unique compiled `ability.id` and preserves `sourceGraftId` as separate provenance. Consequently, two actions emitted by the same graft no longer overwrite one another.

Legacy behavior is unchanged because a legacy ability keeps:

```text
ability.id === sourceGraftId === graft.id
```

## Content transport

The native-to-registry and registry-to-runtime adapters now preserve the complete Graft v2 authoring payload, including:

- abilities and routine;
- modifiers;
- compatibility;
- migration metadata;
- balance, complexity, counterplay, and spike-risk profiles;
- authoring provenance.

The Phase 1 authority manifest still decides which representation is authoritative per Source Anchor.

## QA boundary

Monster content QA now branches by schema:

- legacy grafts must retain one explicit structured `rules` object;
- Graft v2 records are validated as bundles and every emitted ability must contain explicit structured rules;
- routine references must resolve to local ability ids;
- duplicate local ability ids are errors;
- Attack Pattern identity and routine are required.

The catalogue audit checks that the current 90-graft production set preserves count, order, ids, normalized rules, and core runtime fields.

## Deliberately deferred

Phase 2 does not:

- migrate a production graft;
- rewrite an Attack Pattern;
- change Pressure or Complexity;
- change public stat-block rendering;
- change the DPR model or effective-profile model;
- solve legacy text-versus-rules discrepancies;
- change any UI component or stylesheet.

Those belong respectively to the later source migration, Phase 3 parity hardening, Phase 4 metric redesign, and the final explicitly approved UI refinement.
