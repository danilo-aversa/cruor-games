# Legacy-field inventory

This inventory defines the compatibility surface that must remain readable while
v2 content is introduced. A field being listed here does not mean it should be
copied into v2. Canonical v2 writes use the contracts in `contracts-v2.md`.

## Inspiration and module fields

| Legacy field or pattern                              | Current meaning                       | v2 destination                                           | Migration rule                                                       |
| ---------------------------------------------------- | ------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| `module.id` / `slug`                                 | Module identity aliases               | `InspirationModuleV2.id`                                 | Normalize once to a stable id                                        |
| `module.packId` / `contentPackId`                    | Ownership aliases                     | `InspirationModuleV2.packId`                             | Require exact pack ownership in v2                                   |
| absent module schema                                 | Implicit current module version       | `schemaVersion`                                          | v2 writers must always emit it                                       |
| `metadata.moduleRole: converted-inspiration`         | Factory provenance                    | `provenance.migration`                                   | Record source version and editorial decision                         |
| `inspiration.id` / `slug` / `legacyId`               | Identity and lookup aliases           | `InspirationV2.id`, `provenance.legacyIds`               | `id` is canonical; old ids are lookup-only                           |
| `type` / `contentType`                               | Mixed archive/runtime discriminator   | v2 schema identity and capability profiles               | Do not use presentation types as runtime dispatch                    |
| `title` / `label`                                    | Display aliases                       | `archive.title`                                          | One authored title; derived labels belong to renderers               |
| `summary` / `caption` / `narrative`                  | Overlapping editorial prose           | `archive.abstract`, `editorial.context`, semantic models | Editorially split; never choose by blind precedence during authoring |
| `status`                                             | Publication status                    | `editorial.status`                                       | Preserve draft/published intent                                      |
| `contexts`, `themes`, `motifs`, `tags`               | Taxonomy-like arrays                  | `editorial.taxonomy`                                     | Normalize ids and review every assignment                            |
| `card.*`                                             | Archive card metadata                 | `archive` plus renderer policy                           | Store content, not React/card layout state                           |
| `media.icon`                                         | Font/UI icon                          | renderer-owned mapping                                   | Excluded from shared semantic contracts                              |
| `media.imageKey`                                     | Asset lookup key                      | `archive.media[].assetId`                                | Stable asset id, no computed URL                                     |
| `media.imageNote`                                    | Image note/alt-like prose             | `archive.media[].alt` and `editorialNote`                | Accessibility text is required and reviewed                          |
| `imageProvider`, `imageUrl`                          | Derived delivery metadata             | asset resolver output                                    | Never authored into semantic content                                 |
| `sourceAnchorId`, `sourceAnchorIds`, `sourceAnchors` | Several source-reference shapes       | `provenance.sources[]`                                   | Resolve to canonical `SourceAnchorV1` ids                            |
| `workflows`                                          | Eligible workflows                    | `capabilities`                                           | Explicit profile per supported product                               |
| `components[]`                                       | Mixed monster/location/region entries | typed `ComponentV2[]` references                         | Normalize through the compatibility boundary                         |

## Inspiration producers

The following files create, assemble, normalize, or export the current shape:

| Producer                                                                 | Responsibility                                                                                             |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `shared/content/inspirations.js`                                         | Source Inspiration cards used by the converted-module factory                                              |
| `shared/content/inspiration-modules/inspiration-module.factory.js`       | Primary legacy-to-module conversion, archive/card/media assembly, source anchors, and component attachment |
| `shared/content/inspiration-modules/*.js`                                | Fourteen named module exports and their pack metadata                                                      |
| `shared/content/inspiration-modules/core-inspiration-modules.js`         | Module collection assembly                                                                                 |
| `shared/content/inspiration-modules.js`                                  | Registry conversion and fallback module construction                                                       |
| `shared/content/content-packs/existing-inspirations-pack.js`             | Aggregate converted-Inspiration pack                                                                       |
| `shared/content/content-packs/decomposition-inspiration-module-pack.js`  | Dedicated Decomposition ownership                                                                          |
| `shared/content/content-packs/sedlec-ossuary-inspiration-module-pack.js` | Dedicated Sedlec ownership                                                                                 |
| `features/inspiration-studio/model/studio-draft.js`                      | Creates and normalizes editable legacy drafts                                                              |
| `features/inspiration-studio/model/studio-export.js`                     | Serializes module and pack exports in the current schema                                                   |
| `features/inspiration-studio/InspirationStudioPage.jsx`                  | Mutates nested Inspiration, media, taxonomy, and component fields                                          |

Under v2, the source files may remain during migration, but Studio export is the
only interactive writer and must emit v2 exclusively.

## Inspiration consumers

| Consumer                                                                                                         | Legacy reads that matter                                            |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `shared/content/inspiration-module-schema.js`                                                                    | Id aliases, pack aliases, component and source-anchor normalization |
| `shared/content/content-repository.adapter.js`                                                                   | Pack/module/component aggregation for runtime repositories          |
| `shared/content/content-pack-provenance.js`                                                                      | Id aliases, pack collision claims, and legacy migration reporting   |
| `features/inspirations/inspirations.page.jsx` and `features/inspirations/components/InspirationDossierModal.jsx` | Public card prose, media, status, taxonomy, and routing             |
| `features/inspiration-studio/InspirationStudioPage.jsx`                                                          | Full draft readback and editing                                     |
| `features/inspiration-studio/model/studio-validation.js`                                                         | Legacy content type, prose aliases, pack, and source validation     |
| `features/inspiration-studio/model/studio-readiness.js`                                                          | Publication readiness from the current normalized module            |
| `features/inspiration-studio/health/content-health.model.js`                                                     | Fallback identity/prose and coverage checks                         |
| `features/inspiration-studio/coverage/content-coverage.model.js`                                                 | Workflow, source, and component coverage                            |
| `features/inspiration-studio/ledger/graft-ledger.model.js`                                                       | Component rule/schema coverage                                      |
| `features/darken-location/composer/DarkenLocationComposerPage.jsx`                                               | Module and component selection                                      |
| `features/darken-location/composer/model/location-composer-*.js`                                                 | Current module, slot, region, and component projections             |
| `features/darken-location/dungeon/dungeon-brief-generator.js`                                                    | Expands selected modules/components into room briefs                |

The archive, Studio, and Dark Places must all read through the same v2 normalizer
during migration. Direct fallback chains outside that boundary are removal debt.

## Component legacy fields

| Field or shape                                           | Producer                 | Current consumers                        | v2 treatment                                                        |
| -------------------------------------------------------- | ------------------------ | ---------------------------------------- | ------------------------------------------------------------------- |
| `id` / `slug` / `legacyId`                               | registry adapters        | repository, Studio, composer, provenance | canonical id plus `provenance.legacyIds`                            |
| `type` / `contentType`                                   | registry and adapters    | filtering and dispatch                   | replace with `semanticType` and capability profiles                 |
| `label` / `title` / `summary` / `description`            | registry and factory     | Studio cards, composer, output           | one authored title and purpose-specific semantic prose              |
| `sourceAnchorId(s)` / `sourceAnchors`                    | adapters/factory         | repository, composer, document           | normalized provenance sources                                       |
| `workflows`, `slotIds`, `slotId`                         | registry/adapters        | composer slot matching                   | typed capability contribution and placement constraints             |
| `location` / `registry` at `location-component-v0.2`     | canonical expansion pack | composer, dungeon brief, map details     | adapt to `ComponentV2.payload` during transition                    |
| `locationRegion` / `map` at `location-region-v0.2`       | canonical expansion pack | region selection and map request         | adapt to a v2 place/region contribution                             |
| absent specialized schema                                | legacy location packs    | all compatibility consumers              | readable only through v1 adapter; never written by v2               |
| `monster.rules` / `rules` at `monster-graft-rules-v1.12` | monster registry adapter | Studio and Monster Crucible              | retain behind Monster capability; out of Sedlec scope               |
| presentation fields such as icon/image/visual cue        | source cards/adapters    | Studio and UI                            | keep semantic cue text only; renderer assets stay outside contracts |

Primary component producers are
`shared/content/adapters/darken-components.js`,
`shared/content/adapters/location-regions.js`,
`shared/content/monster-components.js`, the legacy Dark Places pack, and the
canonical expansion pack. Primary component consumers are the shared repository,
Studio normalizers/templates/validation, Dark Places composer selectors and slot
matching, dungeon-brief generation, map request/profile/detail builders, compile
preview, and location-document output.

## Document and compiler transitional fields

| Current shape                                       | Location                                                     | v2 decision                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `dark-places-document-v1`                           | `features/darken-location/output/model/location-document.js` | Dual-read at import only; canonical compiler returns `cruor-location-document-v2`        |
| `dark-places-export-v1`                             | `location-composer-output.js`                                | Renderer/export envelope, not a shared authored contract                                 |
| `dark-places-export-bundle-v1`                      | `location-composer-output.js`                                | May wrap the v2 document during UI migration                                             |
| `dungeon-brief-v1` and map request                  | dungeon and map helpers                                      | Compiler adapter inputs/outputs, not Inspiration storage                                 |
| `compilePreview.*Text`                              | composer output                                              | Deterministic render projection derived from v2 document                                 |
| `createdAt`, `updatedAt`, or clock-derived metadata | output/session concerns                                      | Forbidden in compiler output; allowed only in mutable `SessionStateV1` supplied as input |
| map SVG/render state                                | map renderer                                                 | Explicitly outside shared semantic contracts                                             |

## Removal gates

No legacy field, producer, adapter, or pack may be deleted until all of these are
true:

1. all 14 modules are editorially approved in v2;
2. archive, Studio, Dark Places, and every declared Monster capability consume
   the shared contracts;
3. Studio has written v2 only for at least one complete release cycle;
4. repository-wide searches find no v1 writer and no fallback read outside the
   single compatibility module;
5. v1 and v2 fixture imports produce approved semantic equivalence for migrated
   modules;
6. the content collision/migration report shows no active fallback dependency;
7. full tests, acceptance QA, build, content validation, and repository-map check
   pass;
8. a dedicated removal ZIP is reviewed independently of content migration ZIPs.
