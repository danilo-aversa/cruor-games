# Shared semantic contracts v2

Phase 1 turns the project specification into the authoritative shared JavaScript
contract package at `shared/content/contracts/semantic/`. Phase 2 adds Location
Document v2 and Session State v1 to that same package. Runtime features and
Studio import the public API through `shared/content/content.index.js`.

## Phase 1 architecture decisions

The primary project specification takes precedence over shorthand shapes drafted
during Phase 0. Phase 1 therefore fixes these decisions:

1. `InspirationModuleV2` is the aggregate root and contains its Source Anchor,
   public Inspiration, and components.
2. Capabilities are the explicit array values `inspiration-archive`,
   `dark-places`, and `monster-composer` from the primary specification.
3. `ComponentV2` uses `semanticType` plus `semantic`, not an untyped generic
   contribution object.
4. `ContentPackV0_2` owns an ordered collection of complete v2 modules; it does
   not duplicate nested Inspirations and components in parallel arrays.
5. `compatibility-normalized` is an allowed provenance method, but can only carry
   `needs-revision` or `rejected`. It can never approve or publish content.
6. Canonical serialization recursively sorts object keys, preserves array order,
   uses two-space JSON, LF, UTF-8, and a final newline.

These decisions eliminate the contradictory ownership and capability shapes in
the Phase 0 proposal while retaining every migration constraint.

## Dependency boundary

Contract modules are plain JavaScript and may import only sibling semantic
contracts. They have no feature, React, JSX, DOM, SVG, CSS, Map Generator,
Studio, browser-storage, network, clock, or random dependency. A dedicated test
scans every source file for boundary violations.

Location Document v2 and Session State v1 retain the same dependency boundary.
The Phase 2 compiler lives under `features/darken-location/compiler/`, imports
the shared contracts, and has no reverse dependency from shared content.

## Schema identifiers

| Contract            | Schema identifier              | Phase |
| ------------------- | ------------------------------ | ----- |
| Content pack        | `cruor-content-pack-v0.2`      | 1     |
| Source anchor       | `cruor-source-anchor-v1`       | 1     |
| Inspiration         | `cruor-inspiration-v2`         | 1     |
| Inspiration module  | `cruor-inspiration-module-v2`  | 1     |
| Component           | `cruor-component-v2`           | 1     |
| Semantic provenance | `cruor-semantic-provenance-v1` | 1     |
| Place Identity      | `cruor-place-identity-v1`      | 1     |
| Site Atmosphere     | `cruor-site-atmosphere-v1`     | 1     |
| Global Rule         | `cruor-global-rule-v1`         | 1     |
| Recurring Sign      | `cruor-recurring-sign-v1`      | 1     |
| Sensory Profile     | `cruor-sensory-profile-v1`     | 1     |
| Read-Aloud Profile  | `cruor-read-aloud-profile-v1`  | 1     |
| Session Guide       | `cruor-session-guide-v1`       | 1     |
| Mechanical scaling  | `cruor-mechanical-scaling-v1`  | 1     |
| Location document   | `cruor-location-document-v2`   | 2     |
| Session state       | `cruor-session-state-v1`       | 2     |

## `ContentPackV0_2`

```text
{
  schemaVersion,
  id,
  title,
  version,
  status: "draft" | "published" | "retired",
  locale,
  author,
  license,
  tags: Id[],
  modules: InspirationModuleV2[],
  metadata: object
}
```

Every `module.packId` must equal `pack.id`. Module ids are unique. A published
pack requires at least one module, and every nested module must pass published
validation.

## `InspirationModuleV2`

```text
{
  schemaVersion,
  id,
  title,
  packId,
  status: "draft" | "in-review" | "published" | "retired",
  locale,
  capabilities: (
    "inspiration-archive" | "dark-places" | "monster-composer"
  )[],
  sourceAnchor: SourceAnchorV1,
  inspiration: InspirationV2,
  components: ComponentV2[],
  metadata: {
    author,
    revision,
    reviewedAt,
    sourceFile,
    capabilityWaivers: string[]
  },
  provenance: SemanticProvenanceV1
}
```

Every module declares `inspiration-archive`. Capability validation is conditional:

- `dark-places` checks for Place Identity, Site Atmosphere, Global Rule,
  Recurring Sign, Sensory Profile, Read-Aloud Profile, and Session Guide;
- `monster-composer` checks for at least one monster graft **owned by that module**;
- a Phase 8 source that already has modern Monster Composer grafts may omit that
  owned capability and record an external modern capability link in the migration
  registry instead; the grafts are parity-checked, never copied or snapshotted;
- undeclared capabilities impose no unrelated coverage requirements.

Missing coverage is a warning for compatibility/draft modules and an error for
published modules. A published module requires an approved Inspiration and may
not originate from compatibility normalization.

## `SourceAnchorV1`

```text
{
  schemaVersion,
  id,
  title,
  kind: "place" | "practice" | "object" | "event" |
        "text" | "folklore" | "other",
  status: "draft" | "in-review" | "published" | "retired",
  citation: { label, url?, accessedVersion? },
  summary,
  reliability: "primary" | "secondary" | "tertiary" | "uncertain",
  editorialNotes: string[],
  tags: Id[]
}
```

Compatibility reads never fabricate authority: missing v1 citations normalize to
the visible source label, `uncertain` reliability, and an editorial-review note.

## `InspirationV2`

```text
{
  schemaVersion,
  id,
  slug,
  title,
  status: "draft" | "in-review" | "approved" | "rejected",
  sourceAnchors: Id[],
  sourceTypes: string[],
  themes: string[],
  motifs: string[],
  horror: string[],
  contexts: string[],
  editorial: {
    deck,
    whatItIs,
    whyItDisturbs,
    creativeUses: string[],
    cautions: string[]
  },
  media: { imageKey, imageProvider, imageAlt, imageCredit, icon },
  tags: Id[],
  provenance: SemanticProvenanceV1
}
```

Approved Inspirations require factual and interpretive editorial prose, at least
one creative use, and accessible alt text whenever an image is present. Legacy
`caption`, `narrative`, card metadata, computed image URLs, and `imageNote` are
read only at the compatibility boundary and are never emitted as v2 fields.

## `ComponentV2`

```text
{
  schemaVersion,
  id,
  title,
  status,
  contentType,
  semanticType,
  workflows: Id[],
  slots: Id[],
  sourceAnchors: Id[],
  sourceTypes: string[],
  themes: string[],
  motifs: string[],
  horror: string[],
  contexts: string[],
  compatibility: object,
  generation: object,
  semantic: SpecializedSemanticPayload,
  provenance: SemanticProvenanceV1
}
```

Supported Dark Places semantic types are `place-identity`, `site-atmosphere`,
`global-rule`, `recurring-sign`, `sensory-profile`, `read-aloud-profile`,
`session-guide`, `location-stake`, `visible-feature`, `interaction`, `hazard`,
`clue`, `encounter-twist`, `secret`, `reward`, `room-design`, and
`location-region`. `monster-graft` is the Monster capability type.

The first seven types dispatch to dedicated normalizers and validators. The
remaining existing domains use a bounded transitional payload containing only
`summary`, `tableText`, `mechanics`, `narrative`, and `details`; later domain
schemas can replace that transitional payload without flattening the specialized
models.

## Specialized models

| Model              | Canonical authored structures                                                                                  | Published validation                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Place Identity     | original purpose/users, historical change, horror truth, current function/conflict, entry points, stakes, tone | required identity fields, entry point, stake                   |
| Site Atmosphere    | signature, manifestations with senses/intensity/frequency, exclusions, escalation links                        | unique manifestations; target of three                         |
| Global Rule        | trigger, state, resolution, checks/saves/attacks, effect, counterplay, reset, escalation                       | resolvable mechanics, trigger, GM summary, counterplay         |
| Recurring Sign     | description, bounded room placement, variations, optional interaction/revelation                               | valid min/max and at least three variations                    |
| Sensory Profile    | seven sense channels, intensity tiers, room/geometry biases, exclusions, repetition policy                     | 12 variants, three senses, two tiers, no duplicates            |
| Read-Aloud Profile | six typed fragment groups, compatibility tags, spoiler constraints, length/grammar policy                      | unique fragments, no forbidden spoiler tags, coverage warnings |
| Session Guide      | opening beat, objectives, rule/pressure references, clue graph, stall moves, pacing                            | complete opening, objective, unique stall moves                |

Every specialized model and fragment retains semantic provenance. Validation is
non-mutating and returns stable path-addressed issues.

## Provenance

```text
{
  schemaVersion,
  sources: [{
    sourceAnchorId,
    relation: "direct" | "derived" | "inspired-by" |
              "editorial-constraint",
    note
  }],
  legacyIds: Id[],
  migration: {
    fromSchema?,
    method: "authored-v2" | "editorially-migrated" |
            "compatibility-normalized",
    editorialDecision: "approved" | "needs-revision" | "rejected",
    reviewVersion,
    note
  }
}
```

Compatibility normalization always emits `needs-revision`; automated code has no
path to `approved`.

## Mechanical scaling

`mechanical-scaling.js` is the single Phase 1 authority for named scaling.
The initial `intrusion` profile is:

| Tier    |  DC | Damage |
| ------- | --: | -----: |
| Low     |  12 |  `1d4` |
| Medium  |  14 |  `1d6` |
| High    |  16 |  `2d6` |
| Extreme |  18 |  `3d6` |

`resolveMechanicalScaling` applies an authored DC or damage override without
changing the shared profile. Validators reject unknown scaling keys.

Phase 3 Global Rule compilation omits an override when the authored rule stores
`null`, allowing the named profile to resolve the Session State intrusion tier.
The resolved rule is retained structurally in the output block metadata; the
renderer-facing mechanics object contains human-readable trigger, state,
timing, threshold, save/check, effect, duration, frequency, reset, escalation,
and counterplay values. Source rules remain unchanged and immutable.

## Phase 3 composition policy

Place Identity compilation gives explicit Session State overrides precedence,
then selects the primary authored identity and deterministic secondary fields.
Origin/change and truth/function/conflict are composed as sentences rather than
generic joined labels.

Atmosphere, Global Rules, Recurring Signs, and stakes remain separate
`siteWide` arrays. Recurring Sign summaries are not universal effects: each is
marked `universalEffect: false`, while seeded bounded placement writes a
specific variation only to compatible `room.recurringSigns` collections.

## Phase 4 room derivation policy

Sensory allocation consumes authored Sensory Profiles only. When no authored
profile is selected, compatibility-normalized room impressions pass through
unchanged. With a profile selected, the compiler replaces repeated compatibility
sensory blocks with two exact-unique sense variants and one contextual
geometry/role/intensity variant per room. Every generated block is player-safe,
provenanced, and carries its source fragment id, resolved intensity, route depth,
and match reason in metadata.

Read-Aloud composition consumes the resulting impressions plus tagged
Read-Aloud fragments. Compatibility uses room role, geometry, visible feature
tokens, and intensity. Compact, standard, and extended variants are derived
products; authored fragments remain canonical. Fragment tags matching the
profile's forbidden list or the compiler's GM-only/hidden/future-reveal safety
set are excluded before composition.

The standard variant is the sole text projected into the temporary v1 output
view. Compact and extended variants remain on `LocationDocumentRoomV2` and in
projection metadata. This adapter is a renderer compatibility read and does not
serialize a v1 content module.

## Phase 5 Session Guide derivation policy

Session Guide compilation consumes the authored Session Guide component plus
compiled identity, Global Rules, room clues, Recurring Sign revelation links,
room semantics, and authored pacing. It never derives operational guidance from
component, hazard, clue, slot, or room counts.

Pressure tracks retain the compiled Global Rule block and add dashboard metadata
for bounds, initial state, thresholds, trigger, resolution, and reset. Always-on
rule ids resolve to immutable quick-reference blocks. Clue nodes are stable
revelation ids with explicit room evidence and directed authored links; missing
evidence for a required revelation is a compiler error. Room shortcuts retain
stable room ids and authored route order.

Mutable play state is not part of `LocationDocumentV2`. The output feature owns
`cruor-location-session-dashboard-state-v1`, containing only build id, document
version, bounded pressure values, and discovered clue ids. Persistence is
optional and keyed by build id plus document version. Resetting this state never
changes or recompiles the generated build.

## `LocationDocumentV2`

```text
{
  schemaVersion,
  id,
  seed,
  meta: { title, context, horror, sourceAnchors, intrusion },
  identity: {
    historyParagraph,
    currentSituationParagraph,
    playerEntryPoint,
    stakes,
    provenance
  },
  siteWide: {
    atmosphere,
    globalRules,
    recurringSigns,
    stakesAndConsequences,
    provenance
  },
  sessionGuide: {
    openingBeat,
    objectives,
    pressureTracks,
    alwaysOnRules,
    clueFlow,
    stallMoves,
    roomShortcuts,
    provenance
  },
  map: {
    mapType,
    counts,
    legend,
    levels,
    rooms,
    connections,
    provenance
  },
  rooms: LocationDocumentRoomV2[],
  validation: { status, issues, coverage },
  provenance
}
```

Rooms own structured Read-Aloud variants, immediate impressions, visible
features, interactions, hazards, clues, twists, secrets, rewards, recurring
signs, semantic connections, readiness, and provenance. The document stores
semantic shape and level identity but no `cellRect`, label point, SVG path,
pixel bounds, renderer state, timestamps, or export state.

Every generated section, room, Read-Aloud group, and semantic block requires
normalized provenance. Arrays that represent sets are canonicalized; room and
connection order is stable by number/id. Authored prose arrays retain their
semantic order where the contract requires it.

## `SessionStateV1`

```text
{
  schemaVersion,
  id,
  seed,
  moduleId,
  selectedComponentIds,
  locationSeed: {
    meta,
    identity,
    siteWide,
    sessionGuide,
    map,
    rooms,
    coverage
  },
  provenance
}
```

Session State is the immutable compiler input for one build. It contains no
Composer UI state, browser storage, generated SVG, current time, or random
source. The v1 document adapter can create a compatibility session, but the
compiler itself accepts only canonical Content Pack v0.2, Inspiration Module
v2, and Session State v1 values.

## Shared API

Every domain exports `normalize*`, `validate*`, and where useful `parse*`.
Normalizers return deeply frozen canonical data. Validators return structured
issues and never mutate inputs. Parsers return `{ value, issues, valid }`.

`serializeCanonicalSemanticContent` produces deterministic JSON bytes.

## Compatibility boundary

`normalizeSemanticContent(input, { sourceSchema? })` is the only dual-read entry:

```text
v2 pack/module/component/Inspiration -> validate + canonical v2
v1 module                            -> v2 draft module
v1 content pack                      -> v2 draft pack/modules
unsupported input                    -> stable error, no fallback object
```

The real Phase 0 Sedlec v1 module and pack normalize with all 28 components,
zero errors, explicit compatibility provenance, inferred capability warnings,
and no emitted `legacyId`, `imageUrl`, `imageNote`, or `moduleRole` fields.

There is no v1 serializer. Phase 6 routes Studio imports through this boundary
and writes only canonical v2 modules and packs. Compatibility-normalized Monster
graft structures are retained inside the bounded transitional `semantic.details`
payload so the existing editor remains functional without emitting legacy
top-level fields. Existing production consumers are intentionally not switched.

Document compatibility is a separate derived-output concern, not a second
content dual-read boundary. Phase 2 provides:

```text
dark-places-document-v1 -> SessionStateV1 -> LocationDocumentV2
LocationDocumentV2      -> temporary dark-places-document-v1 renderer view
```

The reverse view exists only so current Final Output renderers can consume a v2
document without an interface redesign. It does not write v1 content packs,
modules, Inspirations, or components.
