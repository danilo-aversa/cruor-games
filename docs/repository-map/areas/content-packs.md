# Content Packs

## Scope

Content packs are stored under `shared/content/content-packs/` and documented partly under `docs/content-packs/`.

## Responsibilities

- Provide static authored content records.
- Use IDs and source anchors consumed by the shared content registry.
- Supply workflows, slots, components, inspirations, taxonomies, and provenance data where applicable.

## Consumers

`shared/content/static-registry.js` and `shared/content/registry.js` are the canonical consumers. Features should normally consume normalized registry output rather than raw pack files.

Semantic Content Pack v0.2 candidates use the dependency-free contracts under `shared/content/contracts/semantic/`. `shared/content/static-semantic-content-packs.js` lists these candidates separately from the active v0.1 static registry. Phase 3 adds `sedlec-ossuary-semantic-v2-pack.js`; Phase 4 enriches its sensory and Read-Aloud pools with compiler-consumable biases, stable fragment ids, compatibility tags, and explicit spoiler tags. Phase 5 consumes the already-authored Session Guide without changing or publishing the pack. At that boundary it remained draft/in-review; Danilo approved it later in Phase 8 on 2026-07-16.

Phase 6 lets Inspiration Studio import and export this canonical pack family.
Unchanged v2 packs round-trip byte-for-byte; transitional v1 reads always export
as v2 drafts. Studio does not register, publish, or overwrite active packs.

Phase 7 lets Studio author every semantic payload and compile an in-memory
preview of a candidate pack. Preview and QA never register or publish that pack,
and do not change its editorial status.

Phase 8 batch 1 expands the Sedlec sensory and Read-Aloud pools after sample QA
identified exhaustion and fallback prose. The canonical candidate now passes
three deterministic five-to-seven-room builds with zero diagnostics. Danilo
approved the pack/module on 2026-07-16; the active v0.1 registry is unchanged.

Phase 8 batch 2 adds `decomposition-semantic-v2-pack.js` and an explicit static
`decomposition-monster-grafts-v2.js` data source. The pack supplies Archive,
Dark Places, and Monster capabilities without importing the legacy module at
runtime. It remains draft/in-review pending human sign-off; the active v0.1
Decomposition pack and public registry behavior are unchanged.

## Tests

Run `npm run content:validate` after legacy pack changes. For semantic v2 packs also run `npm run qa:dark-places:semantic-contracts` and the phase-specific semantic QA. Phase 3 uses `npm run qa:dark-places:semantic-phase3`; Phase 4 uses `npm run qa:dark-places:semantic-phase4`; Phase 5 uses `npm run qa:dark-places:semantic-phase5`; Phase 6 Studio round trips use `npm run qa:dark-places:semantic-phase6`; Phase 7 editors and preview use `npm run qa:dark-places:semantic-phase7`.

The current Phase 8 catalog uses `npm run qa:dark-places:semantic-phase8`.
Decomposition's isolated batch uses
`npm run qa:dark-places:semantic-phase8-batch2`.

## Findings

- Confirmed: content packs are canonical source data, while generated registry exports are derived.
- Risk: medium to high depending on whether IDs or schema fields are changed.
