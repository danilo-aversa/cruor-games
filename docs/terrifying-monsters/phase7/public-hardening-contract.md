# Terrifying Monsters — Phase 7 Public Hardening Contract

## Purpose

Phase 7 closes the model/content/public-output roadmap before any optional UI refinement. The release gate treats the complete production catalogue, forced per-graft rendering, deterministic generated monsters, public/debug export boundaries, CR fitting, source authority, and registry parity as one system.

## Release gate

The phase passes only when all of the following are true:

1. The production catalogue contains 90 valid Graft v2 entries and no legacy graft payloads.
2. Every Attack Pattern exposes a scalable primary-action compatibility projection for consumers that still inspect root `rules`.
3. Core Monster QA has no errors or warnings.
4. Every graft can be forced into a minimal legal build, rendered, parsed, and marked publish-ready.
5. The deterministic public matrix covers four Source Anchors, CR 1/2/5/8/10/15/20, and standard, elite-ambusher, and boss-controller profiles.
6. Every matrix build completes and is publish-ready; no build is blocked.
7. Public payloads contain no debug-only keys or legacy placeholder text.
8. Debug payloads retain all required internal evaluation fields.
9. No high-CR build receives a synthetic fallback action and no build lacks a scalable main action.
10. Final estimated CR remains within one step of target across the matrix, with no ±2 outliers.
11. Native and registry-shadow graft representations are equivalent 90/90, including localization payloads.
12. Source authority reports no mismatch, fallback, canonical fallback, or shadow coverage gap.

## Ability identity rule

Rendered ability IDs are authoritative. A stat-block item must first resolve against its exact compiled ability ID. The parent graft ID may be used only when the graft compiles to one unambiguous ability. This prevents sibling abilities within a bundle from borrowing one another's save, condition, targeting, or damage rules.

## Structured renderer precedence

Primary mechanical structures take precedence over generic prose fallbacks:

1. Multiattack and spellcasting.
2. Summon and procedure systems.
3. Structured area effects.
4. Defense systems.
5. Reaction, attack-roll, and saving-throw resolution.
6. Passive conditions.
7. Generic `text.effect` fallback.

This preserves authored area dimensions, DCs, success/failure clauses, and counterplay in public output.

## Forced per-graft coverage

Per-graft QA must:

- understand Graft v2 ability IDs and validate the Graft v2 schema;
- evaluate only abilities actually rendered at the tested CR;
- preserve optional debug-payload validation while supporting a fast public-coverage mode;
- search multiple frame tiers;
- choose the least-complex legal supporting grafts rather than the most thematic expensive combination;
- fail on missing render output, parser errors, publish blockers, missing declared damage, missing conditions, missing area dimensions, or missing recharge title syntax.

## Source authority note

The Phase 1 authority name `native-legacy` describes representation ownership, not payload schema. The winning native catalogue is 90/90 Graft v2. Registry entries remain shadows until a later explicit canonical-authoring migration.
