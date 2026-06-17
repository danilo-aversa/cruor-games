# v1.36 r2 — Payload Audit + High-CR Routine Guard

## Scope

This follow-up keeps the v1.36 public/debug payload separation and adds two targeted protections:

- lightweight Batch QA audit counters for public/debug payload separation;
- a high-CR action routine guard for frames that rely on a single scalable attack and remain below target after fitting.

This pass does not change DPR baselines, CR baselines, HP baselines, frame power budgets, static graft data, graft selection rules, or publish gate thresholds.

## Payload Audit

Batch QA now records lightweight payload diagnostics without embedding the heavy payloads in the report:

```text
publicPayloads
debugPayloads
publicPayloadsWithDebugFields
publicPayloadsWithLegacyText
debugPayloadsMissingInternals
```

The public payload is checked for internal/debug keys such as `abilityModel`, `rulesText`, `featureMechanics`, `rulesProfile`, `crValidation`, and `debugExportJson`.

The public payload is also checked for legacy table-facing wording patterns such as:

```text
Hit: the target takes
Failure: the target takes
Recharge 5-6
N-foot Radius
```

The debug payload is checked for debug/internal metadata and required internal sections.

## High-CR Routine Guard

The CR 16–20 Batch QA range exposed three build failures where the frame had only one scalable main action. The CR fitter raised the target DPR, but the single attack could not scale far enough because the damage roll remained capped by the legal main-attack dice budget.

When a CR 16+ realistic frame has no multiattack routine and only one scalable action, the builder now adds a synthetic `Multiattack` routine that references that action:

```text
Multiattack. The monster makes two [Action] attacks.
```

For CR 16–20 the routine uses two attacks; for CR 21+ it can use three attacks. The referenced action still carries the actual attack roll, damage, save, and rider text. The stat-block parser treats this routine as a valid multiattack line rather than requiring it to include a separate attack roll or damage amount.

## Verification

Local syntax checks:

```text
node --check features/monster-composer/qa/monster-frame-builders.js
node --check features/monster-composer/qa/monster-batch-qa.js
node --check features/monster-composer/model/monster-statblock-parser.js
```

Existing smoke tests:

```text
monster-graft-balance-profile smoke test passed
monster-passive-weakness-renderer-smoke: ok
```

Per-Graft QA:

```text
Total grafts: 90
Passed: 90
Failed: 0
Parser passed: 90
Parser failed: 0
Publish ready: 90
Publish blocked: 0
Publish review: 0
```

Batch QA smoke, 50 realistic cases, CR 1–20:

```text
Errors: 0
Warnings: 0
Parser passed: 50
Publish ready: 50
Publish blocked: 0
Public payloads: 50
Debug payloads: 50
Public payloads with debug fields: 0
Public payloads with legacy text: 0
Debug payloads missing internals: 0
CR -2 or lower: 0
CR +2 or more: 0
```

Post-cleanup payload audit smoke, 20 realistic cases, CR 1–20:

```text
Errors: 0
Warnings: 0
Parser passed: 20
Publish ready: 20
Publish blocked: 0
Public payloads with debug fields: 0
Public payloads with legacy text: 0
Debug payloads missing internals: 0
```

Deterministic 200-frame Batch QA was run in sandbox as 20 separate 10-case chunks over the same generated frame set because the single-process 200-case command exceeded sandbox runtime limits. Aggregate result:

```text
Errors: 0
Warnings: 0
Parser passed: 200
Parser failed: 0
Publish ready: 200
Publish blocked: 0
Publish review: 1
Public payloads: 200
Debug payloads: 200
Public payloads with debug fields: 0
Public payloads with legacy text: 0
Debug payloads missing internals: 0
CR -2 or lower: 0
CR +2 or more: 0
```

Targeted previous blockers:

```text
batch-0027: publish ready, parser passed, CR delta 0
batch-0048: publish ready, parser passed, CR delta +1
batch-0101: publish ready, parser passed, CR delta 0
```

## Notes

The remaining single publish review in the deterministic aggregate is non-blocking and unrelated to public/debug payload separation. The previous high-CR blockers are resolved by the high-CR routine guard.
