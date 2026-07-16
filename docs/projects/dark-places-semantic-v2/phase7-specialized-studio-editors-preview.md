# Phase 7 — Specialized Studio editors and compiled preview

## Outcome

Inspiration Studio now provides normal, schema-driven authoring for every Dark
Places semantic component. Place Identity, Site Atmosphere, Global Rule,
Recurring Sign, Sensory Profile, Read-Aloud Profile, and Session Guide use
specialized controls; authors do not need a raw JSON editor. The Phase 6
canonical import/export boundary is unchanged: Studio may read v1
transitionally, but every write is v2.

The Preview section compiles the current draft through the real pure Dark Places
compiler. Seed, context, intrusion, room count, selected room role, output tab,
provenance, and diagnostics are explicit controls. Regeneration changes only the
seed, and equal controls plus equal content produce the same fingerprint and
document.

This phase does not approve or publish Sedlec, migrate the remaining
Inspirations, switch the production Composer registry, or delete legacy data.

## Schema-driven editor registry

`schema/studio-semantic-editor-registry.js` is the feature-local presentation
registry keyed by the shared `ComponentV2.semanticType` discriminant. Each
definition supplies a label, navigation group, shared normalizer and validator,
default value, coverage targets, and a preview renderer. It imports no React,
SVG, Map Generator UI, browser state, or compiler code.

| Semantic type        | Normal authoring surface                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `place-identity`     | purpose, users, historical change, horror truth, present function, conflict, entry points, stakes, tone                    |
| `site-atmosphere`    | signature, manifestations, exclusions, escalation links                                                                    |
| `global-rule`        | trigger, bounded state, save/check/attack, effects, duration, range, action economy, counterplay checks, reset, escalation |
| `recurring-sign`     | placement bounds, allowed/forbidden roles, preferred features, variations, interaction, revelation link                    |
| `sensory-profile`    | signature, sensory pools, intensity tiers, room/geometry bias, exclusions, repetition policy                               |
| `read-aloud-profile` | fragment pools, spoiler constraints, word ranges, sentence limits, grammar                                                 |
| `session-guide`      | opening beat, objectives, rule references, pressure track, clue flow, stall moves, pacing                                  |

Every control publishes its exact semantic path as a stable field anchor.
Validation and warning models convert component-index paths back to those
anchors, so a diagnostic opens the field that must be fixed.

## Compiled Dark Places preview

`model/studio-dark-places-preview.js` builds canonical preview inputs without
mutating the draft. It uses the compatibility session builder only for the
temporary current-document seed, then invokes the canonical semantic compiler.
The preview UI renders Overview, At the Table, and Rooms from Location Document
v2, with optional provenance and diagnostics. No alternate preview compiler or
browser-random selection exists.

The deterministic semantic sample QA runs three contexts and roles twice each.
It compares canonical outputs and fingerprints, while keeping the report
downloadable from the existing Studio Tests menu beside Monster and Map QA.

## Health, Coverage, Readiness, and Warnings

- Health distinguishes v1 compatibility drafts from v2 modules and reports
  fallback metadata, missing capability declarations, unapproved Inspirations,
  incomplete global mechanics, semantic gaps, and unreachable components.
- Coverage exposes `Inspiration × Capability × Semantic Type × Coverage Status`
  and promotes missing or partial required semantics into actionable gaps.
- Readiness includes semantic coverage and a distinct legacy-review state.
- Warnings retain exact `fieldPath` and `fieldId` links, including compatibility
  warnings that cannot be mistaken for editorial approval.

## QA

```powershell
npm run qa:dark-places:semantic-phase7
npm run qa:dark-places:semantic-phase6
npm run qa:dark-places:semantic-phase5
npm run qa:dark-places:semantic-contracts
npm run qa:dark-places:semantic-compiler
npm run content:validate
npm run test:run
npm run qa:dark-places:acceptance
npm run lint
npm run build
npm run docs:repo-map:check
git diff --check
```

The focused Phase 7 suite verifies registry completeness, semantic coverage,
exact field links, specialized server rendering, full Global Rule mechanics,
real compiler invocation, deterministic fingerprints, semantic sample QA, and
the expanded Health report.

## Acceptance status

| Criterion                                                        | Status                   |
| ---------------------------------------------------------------- | ------------------------ |
| No raw JSON required for normal semantic authoring               | Complete                 |
| Structured global mechanics are fully authorable                 | Complete                 |
| Placement, sensory, Read-Aloud, and Session Guide editors        | Complete                 |
| Preview uses the real deterministic compiler                     | Complete                 |
| Validation and warnings link exact fields                        | Complete                 |
| Health, Coverage, Readiness, and Warnings expose migration state | Complete                 |
| Semantic sample QA is available beside Monster and Map QA        | Complete                 |
| Sedlec human editorial approval and publication                  | Open publication gate    |
| Full Inspiration migration and legacy removal                    | Deferred to later phases |
