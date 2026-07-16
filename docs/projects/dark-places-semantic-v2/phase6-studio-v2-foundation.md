# Phase 6 — Inspiration Studio v2 foundation

## Outcome

Phase 6 moves Inspiration Studio's persistence boundary to the shared semantic
contracts. Studio can open canonical Content Pack v0.2 and Inspiration Module v2
documents, can read a legacy v1 module as a compatibility draft, and always
copies or downloads canonical v2 JSON. There is no v1 serializer and no
dual-write path.

The current Monster graft editor remains active. Its editor-facing projection is
kept inside the transient Studio draft, while structured graft data is persisted
inside the allowed v2 `ComponentV2.semantic.details.monster` payload. Imported
rules, anatomy constraints, anatomy grants, frame fit, cost, complexity, and
counterplay therefore survive editing and re-import without appearing as legacy
top-level component fields.

This phase does not add the specialized semantic editors or compiled Dark Places
preview owned by Phase 7. It does not migrate the active Composer, publish
Sedlec, change the production registry, or delete legacy content.

## Studio draft boundary

`studio-draft.js` now creates schema-versioned Inspiration Module v2 drafts. A
draft contains canonical module, Source Anchor, Inspiration, component,
capability, metadata, and provenance structures. The private `__studio` block
stores only transient import context, diagnostics, and the containing pack needed
for a lossless pack round trip. `buildModuleExport()` and
`buildContentPackExport()` construct fresh contract objects and the shared
normalizers discard this private view state.

Existing component editors still need convenient mutable fields such as
`component.monster`, `component.location`, and `component.locationRegion`.
Those are editor projections, not a second persisted schema. Export translates
the projection once into `semantic` and `generation`; it never emits both forms.

New Studio drafts use `authored-v2` provenance with `needs-revision`. Creating or
editing a draft cannot infer human approval.

## Import boundary

`studio-v2-io.js` delegates schema recognition and compatibility conversion to
the shared `normalizeSemanticContent()` boundary:

```text
Content Pack v0.2       -> canonical pack and selectable v2 modules
Inspiration Module v2   -> canonical v2 module
legacy v1 module        -> compatibility-normalized v2 draft
invalid/unknown JSON    -> stable path-addressed error
```

For a legacy Monster component, the Studio adapter enriches the shared
compatibility result with the structured graft payload that the existing editor
requires. The resulting module stays `draft`, retains
`compatibility-normalized` provenance, and carries an explicit warning. This is
read compatibility only; the next export is v2.

Importing a v2 pack retains its pack metadata and non-selected modules. Exporting
without edits produces byte-identical canonical JSON. The UI exposes one JSON
file input in Review and reports whether the input was canonical v2 or a
transitional v1 read.

## v2-only writer

Studio module output has schema `cruor-inspiration-module-v2`. Pack output has
schema `cruor-content-pack-v0.2`. Both use
`serializeCanonicalSemanticContent()`, including recursive object-key ordering,
two-space indentation, LF, UTF-8, and a final newline.

The writer does not emit legacy pack `collections`, Source Anchor `label`,
Inspiration `contentType`, `summary`, `narrative`, `caption`, `imageUrl`, or
`imageNote`, or top-level component `monster`, `location`, and
`locationRegion` fields.

The public card form now edits the canonical Inspiration v2 editorial and media
fields. Preview image object URLs remain browser-only and never enter the draft
or export.

## Editor registry

`studio-editor-registry.js` is a dependency-light registry keyed by every shared
`ComponentV2.semanticType`. It resolves an editor id, label, component family,
availability, and legacy-workflow flag. Monster graft, generic location, and
location-region editors remain active. Place Identity, Site Atmosphere, Global
Rule, Recurring Sign, Sensory Profile, Read-Aloud Profile, and Session Guide
entries reserve explicit Phase 7 editor ids without importing React or placing
domain logic in `InspirationStudioPage.jsx`.

The page consumes the registry for grouping, filtering, template routing, and
the selected editor identity. Schema detection, v1 migration, v2 construction,
canonical serialization, and pack round-trip behavior remain in model modules.

## QA

```powershell
npm run qa:dark-places:semantic-phase6
npm run qa:dark-places:semantic-phase5
npm run qa:dark-places:semantic-contracts
npm run monster:qa
npm run content:validate
npm run build
```

The Phase 6 suite verifies:

- byte-identical Sedlec module and pack v2 round trips;
- transitional v1 module import and explicit diagnostics;
- lossless Monster rules through import, edit, export, and rehydration;
- absence of legacy top-level fields in Studio output;
- v2-only schema discriminants and canonical final-newline serialization;
- registry coverage for every shared semantic type;
- active Monster and reserved Phase 7 editor resolution;
- stable invalid-JSON failures.

## Acceptance status

| Criterion                                                                      | Status                |
| ------------------------------------------------------------------------------ | --------------------- |
| Studio loads a v1 module transitionally                                        | Complete              |
| Studio writes only Content Pack v0.2 / Inspiration Module v2                   | Complete              |
| v2 module and pack round trips are byte-identical                              | Complete              |
| Existing Monster graft editing retains structured rules                        | Complete              |
| Editor registry covers every shared semantic discriminant                      | Complete              |
| `InspirationStudioPage.jsx` remains orchestration rather than schema authority | Complete              |
| Specialized semantic editors and compiled preview                              | Delivered in Phase 7  |
| Sedlec human editorial approval                                                | Open publication gate |

## Deferred work

Phase 7 implements the specialized semantic editors, placement controls,
compiled Dark Places preview, and semantic Health/Coverage/Readiness tooling.
Phase 8 performs the editorial migration of every Inspiration. Legacy producers,
registry assembly, consumers, and deletion remain unchanged until their later
gates are complete.
