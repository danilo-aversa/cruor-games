# Monster Composer v1.34 — Forced Per-Graft Coverage QA

## Scope

Adds a dedicated QA pass that forces every Monster Composer graft into a minimal compatible build, renders the final stat block, runs the rendered stat block parser, checks publish gate output, and records coverage for damage, conditions, area targeting, and recharge wording.

This pass is intentionally different from the random/realistic batch QA. Batch QA proves that Forge can produce clean complete monsters. Per-Graft QA proves that every individual graft can survive selection, rendering, parser, and publish-gate checks when forced.

## Added QA Surface

- `runMonsterPerGraftCoverageQa(options)`
- `buildMonsterPerGraftQaMarkdown(report)`
- `buildMonsterPerGraftQaCompactReport(report)`
- `downloadMonsterPerGraftQaReport(report)`
- Studio Tests menu entry: **Monster Per-Graft QA**

## Coverage Checks

For each graft, the QA now records:

- forced selection status;
- minimal selected companion grafts;
- final rendered stat block presence;
- rendered stat block parser status;
- publish gate status;
- damage metadata coverage;
- condition metadata coverage;
- area targeting coverage;
- recharge title wording coverage;
- compatibility blockers and missing prerequisite providers.

## Local Smoke Result

Executed locally with browser-compatible dependency stubs for missing subset-only imports.

```text
Grafts tested: 90
Passed: 88
Review: 0
Failed: 2
Forced rendered: 90/90
Parser passed: 90
Parser failed: 0
Publish ready: 88
Publish blocked: 2
Damaging grafts: 19
Condition grafts: 18
Area grafts: 23
Recharge grafts: 3
```

## Content Issues Found By v1.34

The QA exposes two real metadata/content blockers. They are not caused by the QA module itself.

### malformed-broodling

Status: fail.

Reason: the graft requires the `brood` token, but its Frame Fit allows only Minion. Current known `brood` providers are not legal in the same minion frame, so the QA cannot build a minimal legal combination.

Likely fix: either create a minion-legal brood provider, relax the graft frame, or change the requirement model.

### venomous-spit

Status: fail.

Reason: the graft requires `venom_glands` and `mouth` while also requiring the arachnid body plan. The current Spider anatomy profile provides `venom_glands`, `fangs`, and `jaw`, but not `mouth`, so the graft is blocked by anatomy.

Likely fix: either add `mouth` to the Spider anatomy profile if editorially correct, change the graft requirement to `jaw`/`fangs`, or provide a body graft that grants `mouth` for this combination.

## Non-Goals

This pass does not modify DPR, CR, HP, fitting, frame power, graft selection logic, or publish gate thresholds.

## Recommended Next Action

Run Monster Per-Graft QA from Studio, export JSON, and use the two discovered blockers as the first targeted v1.34 content cleanup before moving to v1.35.

## r2 — Content Cleanup + Studio QA UX Fixes

**Scope.** Small follow-up after the first Studio forced per-graft report. No DPR, CR, HP, fitting, frame power, graft selection, or publish gate threshold changes.

### Confirmed QA blockers

The exported Studio report confirmed the two blockers found by the local smoke run:

- `malformed-broodling` was blocked by a hard `brood` dependency even though it is a Minion-only body graft and no legal Minion companion provider could satisfy the requirement.
- `venomous-spit` required `mouth`, but the Spider profile exposes `jaw`, `fangs`, and `venom_glands`, not `mouth`.

### Changes

- Changed `malformed-broodling` from hard `requires: ["brood"]` to `softRequires: ["brood"]`. The graft still prefers brood context but is no longer impossible to force in a legal minimal build.
- Changed `venomous-spit` anatomy constraints to require `venom_glands` and accept any of `mouth`, `jaw`, or `fangs` as the delivery anatomy.
- Translated QA running overlays from Italian to English in both Monster Batch QA and Monster Per-Graft QA modals.
- Added outside-click and Escape-key closing behavior to `StudioToolsMenu` and `StudioTestsMenu` popovers.

### Expected QA result after r2

```text
Grafts tested: 90
Parser failed: 0
Publish blocked: 0
Failed grafts: 0
```

