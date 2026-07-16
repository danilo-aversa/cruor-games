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
|     2 | Decomposition and Decay   | v2 candidate |         53 |      26 |       24 |       3 |    12 |     1 | A + D + M       | Technical migration complete; biological framing, sample output, and retained grafts await human sign-off |
|     3 | The Mist                  | draft        |         24 |       0 |       22 |       2 |    10 |     1 | A + D           | Visibility rules, spatial uncertainty, recurrence without repetition, and fair navigation cues            |
|     4 | Wolves in Folklore        | published    |         49 |      32 |       14 |       3 |     0 |     1 | A + D + M       | Distinguish social folklore, predation, transformation, territory, and pack behavior                      |
|     5 | Towers of Silence         | draft        |         24 |       0 |       22 |       2 |    10 |     1 | A + D           | Cultural specificity, exposure ecology, access rules, and non-exoticizing language                        |
|     6 | Mortuary Totems           | draft        |         11 |       0 |       10 |       1 |     1 |     0 | A + D           | Material vocabulary, memorial function, taboo, and site-scale recurrence                                  |
|     7 | Mustard Gas               | draft        |         15 |       0 |       13 |       2 |     1 |     1 | A + D           | Historical sensitivity, delayed harm, contamination pressure, and playable countermeasures                |
|     8 | Endocannibalism           | draft        |         11 |       0 |        9 |       2 |     0 |     1 | A + D           | Anthropological care, avoid sensationalism, social meaning, and consent/context notes                     |
|     9 | Genetic Mutations         | draft        |         15 |       0 |       14 |       1 |     5 |     0 | A + D           | Avoid disability coding, define environmental transformation, and foreground agency                       |
|    10 | Crucifixion               | draft        |          9 |       0 |        8 |       1 |     1 |     0 | A + D           | Historical/religious context, vertical composition, restraint, and purposeful symbolism                   |
|    11 | Impalement                | draft        |          6 |       0 |        5 |       1 |     1 |     0 | A + D           | Historical context, aftermath rather than spectacle, terrain logic, and calibrated intensity              |
|    12 | Wax Museums               | published    |         20 |       7 |       11 |       2 |     0 |     1 | A + D + M       | Identity, likeness, heat, preservation, and performer/effigy ambiguity                                    |
|    13 | Anthropodermic Bibliopegy | draft        |         14 |       0 |       12 |       2 |     0 |     1 | A + D           | Provenance uncertainty, museum ethics, material evidence, and non-exploitative tone                       |
|    14 | Jikininki                 | published    |         36 |      25 |       10 |       1 |    10 |     1 | A + D + M       | Cultural specificity, hunger logic, funerary obligation, and respectful source framing                    |

## Capability decisions

Sedlec and the other nine location-only modules receive Archive and Dark Places
profiles. They must not expose placeholder Monster content. Decomposition, Wax
Museums, Wolves in Folklore, and Jikininki already own monster components and
therefore require an additional Monster profile, reviewed against the same shared
semantic identity and provenance.

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

The machine-readable migration registry lives at
`shared/content/migrations/inspiration-v2-migration-registry.js`. It follows the
Phase 8 batch order in the project specification and deliberately stores review
state outside published component data.

Sedlec is the first approved canonical v2 module in the shared module catalog.
Its technical migration, coverage, and sample QA are complete, and Danilo
recorded the explicit `approved` decision on 2026-07-16. Decomposition is the
second canonical module and the first A + D + M candidate: its semantic
coverage, 26 structured Monster grafts, and three warning-free samples pass,
but its editorial status remains `awaiting-human-signoff`. The remaining 12
modules are explicitly `pending`; none has been silently normalized or
approved.

## Migration sequence

1. **Sedlec Ossuary:** reference implementation.
2. **Decomposition and Decay:** biological/process and first A + D + M reference.
3. **The Mist:** environmental reference.
4. **Wolves in Folklore:** creature/ecology reference.
5. **Towers of Silence.**
6. **Mortuary Totems.**
7. **Mustard Gas.**
8. **Endocannibalism.**
9. **Genetic Mutations.**
10. **Crucifixion.**
11. **Impalement.**
12. **Wax Museums.**
13. **Anthropodermic Bibliopegy.**
14. **Jikininki.**
15. **Legacy removal:** a separate phase after every matrix row and consumer gate
    is complete.

Each numbered migration is one independently reviewable ZIP. No ZIP combines a
content migration with legacy deletion.
