# Current-state audit

## Audit identity

| Item                | Audited value                                                                   |
| ------------------- | ------------------------------------------------------------------------------- |
| Repository          | `danilo-aversa/cruor-games`                                                     |
| Branch              | `main`                                                                          |
| Commit              | `c02465815b68db3651a90c809d81a90b1d03189c`                                      |
| Commit message      | `v20.0.0a • 2026-07-16 12:02`                                                   |
| Application version | `20.0.0a`                                                                       |
| Audit mode          | Read-only GitHub baseline, followed by local Phase 0 documentation and fixtures |

The supplied minimal archive contains 90 repository files. Its manifest names
the same branch and commit. All 90 files match the GitHub baseline after line-end
normalization. Thirteen raw SHA differences are CRLF/LF-only; there are no
semantic differences.

## Repository-map currency

The repository map was not current at the audited commit.

| Evidence                                     | Value                                      |
| -------------------------------------------- | ------------------------------------------ |
| Current commit                               | `c02465815b68db3651a90c809d81a90b1d03189c` |
| Markdown index baseline                      | `2155e52e...`                              |
| JSON map baseline                            | `9f95cc78...`                              |
| JSON tracked-file count                      | 701                                        |
| Current tracked-file count                   | 726                                        |
| Distance from map baseline                   | 4 commits, 71 changed paths                |
| `npm run docs:repo-map:check` at audit start | Failed: 179 errors, 155 warnings           |

The relevant map sections correctly describe the historical boundaries for Dark
Places, Inspiration Studio, Inspirations, Shared Content, and Content Packs, but
their hashes and inventory cannot be used as evidence for the current commit.
Phase 0 therefore regenerates the map after its read-only comparison.

## Static content state

`npm run content:validate` passes with zero issues on the audited baseline.

| Registry item       | Count |
| ------------------- | ----: |
| Workflows           |     4 |
| Slots               |    17 |
| Components          |   309 |
| Source anchors      |    14 |
| Inspirations        |    14 |
| Taxonomies          |     3 |
| Monster components  |    90 |
| Location components |   194 |
| Location regions    |    25 |

Schema distribution is mixed by design: 90 monster components use
`monster-graft-rules-v1.12`, 136 location components use
`location-component-v0.2`, 16 regions use `location-region-v0.2`, and 67 entries
have no specialized component or region schema.

All 14 Inspiration modules are produced through the converted-Inspiration
factory and declare the metadata role `converted-inspiration`. The fallback path
in `shared/content/inspiration-modules.js` remains executable, but the current
registry does not create additional fallback modules. No module declares a v2
schema or a semantic capability profile.

Four modules are `published` and ten are `draft`. The four published modules are
Decomposition and Decay, Wax Museums, Wolves in Folklore, and Jikininki.

## Content-pack state

| Pack                            | Role                       | Finding                                                                                          |
| ------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| `static-cruor-registry`         | Static registry            | Canonical aggregate used by the repository adapter                                               |
| `existing-inspirations`         | Converted modules          | Owns the general converted-Inspiration collection                                                |
| Dark Places canonical expansion | Canonical location content | Adds v0.2 components and regions while preserving legacy entries                                 |
| Sedlec Ossuary module pack      | Dedicated module pack      | Published pack exists, but the generated Sedlec module still defaults to `existing-inspirations` |

The legacy-pack report finds 0 active fallback entries, 62 shadowed entries, and
67 migrated entries. Its technical report describes the old pack as removable.
That is not authorization to remove it: the v2 project explicitly keeps all
legacy content until the complete producer/consumer migration and editorial
review gates have passed.

## Current Inspiration shape

The source cards are converted at import time into an unversioned module shape.
The public Inspiration object combines archive presentation, editorial prose,
runtime selection metadata, media, and provenance. Its current fields include:

- identity and taxonomy: `id`, `legacyId`, `title`, `label`, `type`,
  `contentType`, `status`, `contexts`, `themes`, `motifs`, `tags`;
- prose aliases: `summary`, `caption`, `narrative`;
- presentation: nested `card`, nested `media`, icon and image metadata;
- source linkage: `sourceAnchorIds`, `sourceAnchors`, and factory metadata;
- runtime ownership: module `packId`, `workflows`, components, and metadata.

The shape has no single canonical semantic model. Consumers compensate through
fallback reads such as `id || slug || legacyId` and `summary || narrative`.

## Studio state

Inspiration Studio normalizes and edits the current v1-like module shape. The
draft model defaults `packId`, carries nested `inspiration`, and exposes legacy
prose and media fields in the UI. Export writes the current content-pack schema
and current module fields. Validation explicitly checks legacy fields such as
`inspiration.contentType`, `summary`, and `narrative`.

Consequently, Studio is currently both a consumer and a producer of the legacy
shape. The v2 constraint means its write boundary must move directly to shared
v2 contracts; adding a second v1 export would violate the no-dual-write rule.

## Dark Places compiler and output state

The current end-to-end path is:

1. module and component selection in the composer;
2. composer snapshot and slot assignments;
3. dungeon-brief generation and region expansion;
4. map-request normalization and seeded map generation;
5. compile-preview construction;
6. `createLocationDocument` adaptation;
7. JSON, room-key Markdown, table text, and map export.

This path already contains deterministic seeded map behavior, but it is not one
pure semantic compiler. Compiler responsibilities are distributed across
composer models, dungeon helpers, map request generation, preview formatting,
and the document adapter. The current document is
`dark-places-document-v1`; preview and export shapes retain compatibility
fallbacks and presentation-ready strings.

The v2 compiler must take canonical semantic content plus immutable session
state and return a canonical document without reading clocks, browser state,
storage, network, React, SVG, or Map Generator UI state. Renderers and map
adapters consume the compiler result after that boundary.

## Sedlec Ossuary baseline

| Item                       | Current value |
| -------------------------- | ------------: |
| Module status              |       `draft` |
| Components                 |            28 |
| Monster components         |             0 |
| Location components        |            25 |
| Location regions           |             3 |
| Legacy location components |            12 |
| `location-component-v0.2`  |            13 |
| Legacy regions             |             1 |
| `location-region-v0.2`     |             2 |

Sedlec has enough location material for an Archive plus Dark Places vertical
slice, but no monster material and therefore no Monster Crucible capability.
The Phase 0 fixture selects 11 distinct components across five rooms and creates
20 explicit slot assignments. Current region expansion produces 28 placements,
and all five rooms compile as ready.

## Differences between code and the v2 project

| Project requirement                 | Audited code                                                            | Required change                                                            |
| ----------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Shared versioned semantic contracts | Current schemas are split and modules are unversioned                   | Add dependency-free contracts under `shared/content/contracts/semantic/`   |
| Studio writes v2 only               | Studio writes current legacy-compatible shape                           | Replace its export boundary with v2 validation and serialization           |
| Dual-read, never dual-write         | Fallback reads are distributed; writes are v1                           | Centralize reads in one normalizer and emit v2 only                        |
| Pure deterministic compiler         | Logic is distributed through composer, map, preview, and output helpers | Introduce a pure semantic compiler before render/map adapters              |
| Immutable authored content          | Current shapes mix authored, derived, UI, and runtime fields            | Separate content contracts from `SessionState` and derived documents       |
| Capability-aware modules            | Metadata only says `converted-inspiration`                              | Declare Archive, Dark Places, and optional Monster capability profiles     |
| Editorial migration                 | Modules are factory conversions of source cards and existing components | Review and author semantic content for every Inspiration                   |
| Stable semantic provenance          | Source anchors and pack claims use several shapes                       | Use one normalized provenance contract with source and editorial decisions |
| No early legacy deletion            | Technical report labels the shadowed pack removable                     | Keep legacy producers/data until all removal gates pass                    |

## Audit conclusion

The repository is healthy enough to start the migration, but it does not yet
implement the v2 semantic boundary. Sedlec is the correct first slice because it
exercises archive data, location composition, seeded map generation, all current
outputs, and mixed legacy/v0.2 location content without introducing Monster
Crucible scope. The checked-in Phase 0 fixtures make that behavior measurable
before contract and compiler changes begin.
