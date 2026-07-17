# Inspiration migration matrix

Capabilities use these abbreviations:

- **A** — Inspiration Archive;
- **D** — Dark Places;
- **M** — Monster Crucible.

Counts were computed from the 14 modules at the audited commit. `L-loc` and
`L-reg` are location components and regions that do not yet carry the canonical
v0.2 specialized schema. Counts are evidence for planning, not an editorial
completion score.

| Order | Inspiration               | Status       | Components | Monster | Location | Regions | L-loc | L-reg | v2 capabilities | Required editorial focus                                                                                  |
| ----: | ------------------------- | ------------ | ---------: | ------: | -------: | ------: | ----: | ----: | --------------- | --------------------------------------------------------------------------------------------------------- |
|     1 | Sedlec Ossuary            | v2 approved  |         28 |       0 |       25 |       3 |    12 |     1 | A + D           | Approved by Danilo on 2026-07-16; semantic catalog only during staged migration                           |
|     2 | Decomposition and Decay   | v2 approved  |         53 |      26 |       24 |       3 |    12 |     1 | A + D + M       | Archive + Dark Places revision 2 approved by Danilo on 2026-07-17; 26 Monster grafts remain in the existing modern Monster catalog and are parity-checked, not copied; image publication remains blocked |
|     3 | The Mist                  | v2 approved  |         24 |       0 |       22 |       2 |    10 |     1 | A + D           | Candidate 1 and its transformative-use boundary approved by Danilo on 2026-07-17; local image publication remains blocked pending provenance and final alt text |
|     4 | Wolf Spiders              | v2 approved  |         49 |      32 |       14 |       3 |     0 |     1 | A + D; M ext.   | Candidate 2 approved 2026-07-17; Archive + Dark Places owned, 32 native Monster grafts externally parity-checked; image provenance remains open |
|     5 | Towers of Silence         | v2 approved  |         24 |       0 |       22 |       2 |    10 |     1 | A + D           | Approved: bounded Zoroastrian source context, Open Reliquary, Sky Measure, zero Monster content; image provenance remains open |
|     6 | Mortuary Totems           | v2 approved |         11 |       0 |       11 |       0 |    10 |     1 | A + D           | Approved Candidate 1: bounded source context, fair semantic system, zero Monster content; image provenance remains open |
|     7 | Mustard Gas               | v2 approved |         15 |       0 |       15 |       0 |    10 |     1 | A + D           | Approved Candidate 1: bounded source context, fair semantic system, zero Monster content; image provenance remains open |
|     8 | Endocannibalism           | v2 approved |         12 |       0 |       12 |       0 |    10 |     1 | A + D           | Approved Candidate 1: bounded source context, fair semantic system, zero Monster content; image provenance remains open |
|     9 | Genetic Mutations         | v2 approved  |         15 |       0 |       14 |       1 |     5 |     0 | A + D           | Approved Candidate 1: bounded source context, fair semantic system, zero Monster content; image provenance remains open |
|    10 | Crucifixion               | v2 approved  |          9 |       0 |        8 |       1 |     1 |     0 | A + D           | Approved Candidate 1: bounded source context, fair semantic system, zero Monster content; image provenance remains open |
|    11 | Impalement                | v2 approved  |          6 |       0 |        5 |       1 |     1 |     0 | A + D           | Approved Candidate 1: bounded source context, fair semantic system, zero Monster content; image provenance remains open |
|    12 | Wax Death Masks           | v2 candidate |         20 |       7 |       11 |       2 |     0 |     1 | A + D; M ext.   | Candidate 1: museum-object boundary, contested likeness, external parity to 7 native Monster grafts; review, local QA, and image provenance open |
|    13 | Anthropodermic Bibliopegy | v2 candidate |         14 |       0 |       12 |       2 |     0 |     1 | A + D           | Candidate 1: consent, human-remains stewardship, provenance, and respectful disposition; review, local QA, and image provenance open |
|    14 | Jikininki                 | v2 candidate |         36 |      25 |       10 |       1 |    10 |     1 | A + D; M ext.   | Candidate 1: bounded Hearn 1904 literary source, funerary duty, external parity to 25 native Monster grafts; review, local QA, and image provenance open |

## Capability decisions

Sedlec and the other nine location-only modules receive Archive and Dark Places
profiles. They must not expose placeholder Monster content. Decomposition, Wax Museums, Wolf Spiders, and Jikininki are linked to modern
Monster Composer grafts. Phase 8 verifies those source-anchor links and payload
counts but does not copy, snapshot, or re-own the grafts inside Dark Places
semantic packs. Module capabilities describe content owned by that module; an
external modern capability link is tracked separately in the migration registry.

A capability profile is explicit and independently valid. Archive readiness does
not imply Dark Places readiness, and Dark Places readiness does not imply Monster
readiness. A missing profile means unsupported, not incomplete.

## Editorial completion gate

Every row requires a human editorial decision record containing:

1. source-anchor review and uncertainty notes;
2. revised archive abstract and context, not a copied caption;
3. capability decision with rationale;
4. authored semantic models appropriate to each capability;
5. harm, cultural-context, and accessibility review where applicable;
6. provenance links from every semantic element to sources and editorial choices;
7. fixture review against the previous runtime behavior;
8. explicit `approved`, `needs-revision`, or `rejected` status with reviewer and
   review version.

Automated normalization may propose ids and move values, but it cannot set the
editorial decision to `approved`.

## Phase 8 live status

The machine-readable registry now exposes all 14 Inspirations as canonical v2 modules. Eleven have an explicit human `approved` decision and three final candidates await sign-off:

- Wax Death Masks Candidate 1;
- Anthropodermic Bibliopegy Candidate 1;
- Jikininki Candidate 1.

Production registry behavior remains unchanged. Decomposition, Wolf Spiders, Wax Death Masks, and Jikininki keep Monster Composer data in the existing modern Monster catalog; semantic packs verify source-anchor parity but do not copy, snapshot, or re-own those grafts. Every current module owns only Inspiration Archive and Dark Places semantic content. Image provenance remains an independent publication blocker for every approved or candidate module.

## Migration sequence

1. **Sedlec Ossuary:** reference implementation.
2. **Decomposition and Decay:** biological/process A + D reference with external modern Monster parity.
3. **The Mist:** environmental reference.
4. **Wolf Spiders:** approved Candidate 2 A + D migration with external modern Monster parity.
5. **Towers of Silence:** Candidate 1 A + D migration; approved; image provenance remains open.
6. **Mortuary Totems.**
7. **Mustard Gas.**
8. **Endocannibalism.**
9. **Genetic Mutations.**
10. **Crucifixion.**
11. **Impalement.**
12. **Wax Death Masks:** Candidate 1 A + D migration with external modern Monster parity.
13. **Anthropodermic Bibliopegy:** Candidate 1 A + D migration with no Monster capability.
14. **Jikininki:** Candidate 1 A + D migration with external modern Monster parity.
15. **Legacy removal:** a separate phase after every matrix row and consumer gate
    is complete.

Each numbered migration is one independently reviewable ZIP. No ZIP combines a
content migration with legacy deletion.


### Approval checkpoint after batch 11

Genetic Mutations, Crucifixion, and Impalement were approved by Danilo on 2026-07-17 after local zero-diagnostic QA. Eleven modules are now canonical v2 and approved; Wax Death Masks, Anthropodermic Bibliopegy, and Jikininki remain pending until their final candidate patches are applied and reviewed.


### Final-candidate checkpoint after batch 12

12 of 14 modules are canonical v2. Eleven are approved and 1 final candidate(s) await sign-off. Production registry behavior remains unchanged, while Monster data for Wax Death Masks and Jikininki remains externally owned and parity-checked.


### Final-candidate checkpoint after batch 13

13 of 14 modules are canonical v2. Eleven are approved and 2 final candidate(s) await sign-off. Production registry behavior remains unchanged, while Monster data for Wax Death Masks and Jikininki remains externally owned and parity-checked.


### Final-candidate checkpoint after batch 14

14 of 14 modules are canonical v2. Eleven are approved and 3 final candidate(s) await sign-off. Production registry behavior remains unchanged, while Monster data for Wax Death Masks and Jikininki remains externally owned and parity-checked.
