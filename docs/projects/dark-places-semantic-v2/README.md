# Dark Places Semantic Content Pipeline v2

Phase 0 freezes the current behavior and defines the migration boundary for the
semantic content pipeline. Phase 1 implements the shared, dependency-free
semantic contracts and the single content v1/v2 read boundary. Phase 2 adds the
pure staged compiler skeleton, Location Document v2, Session State v1, semantic
map intent, and the temporary v2-to-v1 renderer view. Phase 3 adds the
then-`in-review` Sedlec semantic pack, structured Place Identity, scaled site-wide
rules, deterministic Recurring Sign placement, and the separated Overview.
Phase 4 adds deterministic sensory allocation, room-compatible Read-Aloud
composition, spoiler filtering, and standard-variant output projection. Phase
5 adds the compiled clue graph and operational Session Guide, separate mutable
session state, and the interactive At the Table dashboard. Phase 6 moves
Inspiration Studio to v2-aware drafts, transitional v1 import, an editor
registry, and canonical v2-only module/pack export while preserving Monster
graft editing. Phase 7 adds specialized schema-driven semantic editors, exact
field-linked diagnostics, compiled deterministic Dark Places preview, and
semantic Health/Coverage/Readiness tooling. Phase 8 uses one independently
reviewable batch per Inspiration. Danilo approved Sedlec on 2026-07-16, then
approved Decomposition revision 2 and The Mist candidate 1 on 2026-07-17. Wolf Spiders is the fourth canonical candidate.
Decomposition is the second complete canonical v2 catalog entry and the first
A + D + M migration. Editorial revision 2 adds a published biological source
dossier, non-linear human-donor caution, fantasy-facing terminology, distinct
exploration and combat cadence, a Stage 4 counterplay window, and scoped notes
for two exceptional Monster rules. All 27 legacy location/region components and
all 26 structured Monster grafts remain accounted for.
The Mist is the third complete canonical v2 catalog entry and an A + D
migration. Its White Refuge identity, Orientation Drift procedure, four
progressive recurring signs, and session guide preserve real map topology,
expose discrepancies, keep an anchored retreat, and announce the final breach.
All 24 legacy location and region components remain accounted for, and the
transformative-use review and repeatable local QA are complete. Both modules
remain blocked from image publication until creator, license, source URL, and
final alt text are verified or the local assets are replaced.
Wolf Spiders corrects the stale “Wolves in Folklore” matrix label and supplies the
second A + D + M candidate. Its Broodward identity, Tremor Pressure, four
progressive ecological signs, and session guide distinguish active ground
hunting, eye shine, egg-sac and spiderling transport from supernatural Cruor
content. All 17 Dark Places/region components and 32 Monster grafts remain
accounted for. Monster parity currently uses an explicit shared-component bridge;
a standalone frozen snapshot remains required before legacy removal.
The active legacy Archive registry is preserved. The
audited GitHub
baseline is `main` at `952430351033b7db385cf0ef6958a9e54f50107e`
(`21.0.0a`). The Sedlec v2 pack is editorially approved and published in the
separate semantic catalog, but it is not added to the active legacy registry.
The active Composer export continues to use its current v1 document.

## Deliverables

- [Project specification](../../../dark-places-semantic-content-pipeline-v2-project.md)
- [Current-state audit](./current-state-audit.md)
- [Legacy-field inventory](./legacy-field-inventory.md)
- [Inspiration migration matrix](./inspiration-migration-matrix.md)
- [Definitive v2 contracts](./contracts-v2.md)
- [Sedlec Ossuary vertical slice](./sedlec-ossuary-vertical-slice.md)
- [Phase 2 compiler and Location Document](./phase2-location-document-compiler.md)
- [Phase 3 Place Identity and site-wide systems](./phase3-place-identity-site-wide.md)
- [Phase 4 sensory allocation and Read-Aloud](./phase4-sensory-read-aloud.md)
- [Phase 5 Session Guide and At the Table dashboard](./phase5-session-guide-at-the-table.md)
- [Phase 6 Inspiration Studio v2 foundation](./phase6-studio-v2-foundation.md)
- [Phase 7 specialized Studio editors and compiled preview](./phase7-specialized-studio-editors-preview.md)
- [Phase 8 batch 1 Sedlec editorial review](./phase8-batch1-sedlec-editorial-review.md)
- [Phase 8 batch 2 Decomposition editorial review](./phase8-batch2-decomposition-editorial-review.md)
- [Phase 8 batch 3 The Mist editorial review](./phase8-batch3-the-mist-editorial-review.md)
- [Phase 8 batch 4 Wolf Spiders editorial review](./phase8-batch4-wolf-spiders-editorial-review.md)

The deterministic Sedlec baseline is stored under
`tests/fixtures/dark-places-semantic-v2/sedlec-ossuary/`. The snapshot utility
invokes the real v1 module, content pack, composer, dungeon brief, map pipeline,
compile preview, and location-document adapter.

## Frozen migration rules

1. Shared contracts are the only schema authority for runtime and Studio.
2. Shared contracts have no React, SVG, or Map Generator UI dependencies.
3. Studio writes v2 only.
4. A single compatibility boundary may read v1 and v2; it never writes v1.
5. The compiler is pure, deterministic, and free of clock, DOM, network, and
   storage access.
6. Legacy content remains present until every producer and consumer has passed
   the removal gates.
7. Every Inspiration requires an editorial review; mechanical conversion alone
   cannot mark a module migrated.
8. Each migration phase is delivered in one ZIP with file inventory, SHA-256,
   executed tests, and repeatable QA commands.

## Baseline commands

```powershell
npm run content:snapshot:dark-places-v2
npm run qa:dark-places:semantic-baseline
npm run qa:dark-places:semantic-contracts
npm run qa:dark-places:semantic-compiler
npm run qa:dark-places:semantic-phase3
npm run qa:dark-places:semantic-phase4
npm run qa:dark-places:semantic-phase5
npm run qa:dark-places:semantic-phase6
npm run qa:dark-places:semantic-phase7
npm run qa:dark-places:semantic-phase8
npm run qa:dark-places:semantic-phase8-batch2
npm run qa:dark-places:semantic-phase8-batch3
```

`content:snapshot:dark-places-v2` deliberately rewrites the checked-in baseline
and is an explicit maintainer action. `qa:dark-places:semantic-baseline` performs
two independent in-memory builds, proves byte-for-byte determinism, and compares
the result with every checked-in fixture and its SHA-256 manifest.
`qa:dark-places:semantic-contracts` runs the Phase 1 valid, invalid, edge-case,
compatibility, canonicalization, and dependency-boundary tests.
`qa:dark-places:semantic-compiler` runs the Phase 2 document/session contracts,
real Sedlec v1-to-v2 compilation, order independence, immutability, provenance,
map-intent, renderer compatibility, and dependency-boundary tests.
`qa:dark-places:semantic-phase3` verifies the canonical editorial candidate,
two independent fixture builds, premise coverage, centralized scaling,
Recurring Sign bounds, separated Overview rendering, and v1 preservation.
`qa:dark-places:semantic-phase4` verifies exact-unique room impressions,
geometry/role/content matching, isolated room changes, Read-Aloud word ranges,
spoiler filtering, standard export projection, multiple roles/shapes, and two
independent Phase 4 fixture builds.
`qa:dark-places:semantic-phase5` verifies the opening beat, objectives,
pressure controls, rule references, room-backed clue graph, stall moves,
shortcuts, isolated operational state, optional persistence, accessibility,
source immutability, and two independent Phase 5 fixture builds.
`qa:dark-places:semantic-phase6` verifies canonical v2 module/pack round trips,
transitional v1 import, v2-only serialization, editor-registry coverage, stable
invalid-input diagnostics, and lossless Monster graft editing.
`qa:dark-places:semantic-phase7` verifies specialized semantic authoring,
coverage and exact field links, the real deterministic compiler preview,
semantic sample QA, and migration-aware Health reporting.
`qa:dark-places:semantic-phase8` audits all 14 migration records, verifies the
canonical Sedlec, Decomposition, The Mist, and Wolf Spiders bytes without
writing, validates the v2 catalog, requires full Studio semantic coverage,
compiles warning-free
deterministic samples, and protects the unchanged active Archive registry.
`qa:dark-places:semantic-phase8-batch2` isolates the Decomposition migration,
including exact Monster graft parity, scoped rule-convention notes, revised
clock cadence, source framing, and Studio round-trip coverage.
`qa:dark-places:semantic-phase8-batch3` isolates The Mist, verifies exact
24-component provenance coverage, the literary and copyright boundary, fair
Orientation Drift cadence, stated discrepancies, stable topology, recurring-sign
progression, Studio round trip, and warning-free deterministic samples.
`qa:dark-places:semantic-phase8-batch4` isolates Wolf Spiders, verifies the
correct animal-behavior source boundary, exact 49-component coverage, exact 32
Monster-graft parity through the declared bridge, fair Tremor Pressure cadence,
progressive ecological signs, Studio round trip, and warning-free deterministic
samples. Phase 8 remains open until each Inspiration receives its own editorial
batch and human sign-off; the Wolf Spiders bridge must also become an independent
snapshot before legacy removal.

## Required QA before a phase ZIP

```powershell
npm run content:validate
npm run qa:dark-places:semantic-baseline
npm run test:run
npm run qa:dark-places:acceptance
npm run lint
npm run build
npm run docs:repo-map:check
git diff --check
```

Run `npm run docs:repo-map` before the final map check whenever tracked
architecture changes. A phase ZIP is not complete until its manifest records the
base commit, exact file list, per-file SHA-256 values, test results, and these QA
commands.

## Complete minimal PowerShell audit-input ZIP command

Run this from the repository root. It uses an explicit allowlist, copies no
assets, build output, dependencies, screenshots, or unrelated project sources,
and writes the ZIP next to the repository. The specification must already be in
the repository root, as it is after this Phase 0 patch.

```powershell
$ErrorActionPreference = "Stop"

$repo = (Resolve-Path ".").Path
$commit = (& git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($commit)) {
    throw "Impossibile identificare il commit corrente. Esegui il comando dalla root del repository."
}

$branch = (& git branch --show-current).Trim()
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$stage = Join-Path ([System.IO.Path]::GetTempPath()) "cruor-games-dark-places-v2-phase0-$timestamp"
$zip = Join-Path (Split-Path $repo -Parent) "cruor-games-dark-places-v2-phase0-minimal-$timestamp.zip"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$files = @(
    "AGENTS.md",
    "package.json",
    "dark-places-semantic-content-pipeline-v2-project.md",
    "docs/content-packs/content-pack-authoring.md",
    "docs/repository-map/architecture.md",
    "docs/repository-map/index.md",
    "docs/repository-map/legacy-and-transitional-systems.md",
    "docs/repository-map/runtime-flows.md",
    "docs/repository-map/areas/content-packs.md",
    "docs/repository-map/areas/darken-location.md",
    "docs/repository-map/areas/inspiration-studio.md",
    "docs/repository-map/areas/inspirations.md",
    "docs/repository-map/areas/map-generator.md",
    "docs/repository-map/areas/output-and-export.md",
    "docs/repository-map/areas/shared-content.md",
    "features/crucible/crucible.components-data.js",
    "features/crucible/crucible.location-regions.js",
    "features/crucible/crucible.sources-data.js",
    "features/darken-location/darken-location.map-request.js",
    "features/darken-location/composer/model/location-composer-output.js",
    "features/darken-location/composer/model/location-composer-output.test.js",
    "features/darken-location/composer/model/location-composer-selectors.js",
    "features/darken-location/dungeon/dungeon-brief-generator.js",
    "features/darken-location/dungeon/dungeon-brief.js",
    "features/darken-location/dungeon/dungeon-room-constraints.js",
    "features/darken-location/map-generator/map-generator.input.js",
    "features/darken-location/output/LocationOutputWorkspace.jsx",
    "features/darken-location/output/components/LocationRoomOutput.jsx",
    "features/darken-location/output/model/location-document.js",
    "features/darken-location/output/model/location-document.test.js",
    "features/inspiration-studio/InspirationStudioPage.jsx",
    "features/inspiration-studio/model/studio-component-normalizers.js",
    "features/inspiration-studio/model/studio-component-templates.js",
    "features/inspiration-studio/model/studio-draft.js",
    "features/inspiration-studio/model/studio-export.js",
    "features/inspiration-studio/model/studio-validation.js",
    "features/inspirations/inspirations.card-config.js",
    "features/inspirations/inspirations.page.jsx",
    "features/inspirations/components/InspirationDossierModal.jsx",
    "features/monster-composer/data/monster-grafts.js",
    "features/monster-composer/model/monster-graft-balance-profile.js",
    "features/monster-composer/model/monster-graft-rules.schema.js",
    "scripts/export-content-registry.mjs",
    "scripts/run-dark-places-acceptance-qa.mjs",
    "scripts/validate-content-registry.mjs",
    "scripts/repository-map/generate-repository-map.mjs",
    "scripts/repository-map/validate-repository-map.mjs",
    "shared/content/content-pack-provenance.js",
    "shared/content/content-pack-schema.js",
    "shared/content/content-repository.adapter.js",
    "shared/content/content-repository.js",
    "shared/content/content-validation.js",
    "shared/content/content.index.js",
    "shared/content/inspiration-module-schema.js",
    "shared/content/inspiration-modules.js",
    "shared/content/inspirations.js",
    "shared/content/legacy-content-migration.js",
    "shared/content/monster-components.js",
    "shared/content/registry.js",
    "shared/content/source-anchors.js",
    "shared/content/static-registry.js",
    "shared/content/taxonomies.js",
    "shared/content/workflows.js",
    "shared/content/adapters/darken-components.js",
    "shared/content/adapters/location-regions.js",
    "shared/content/content-packs/core-cruor-pack.js",
    "shared/content/content-packs/dark-places-canonical-expansion-pack.js",
    "shared/content/content-packs/decomposition-inspiration-module-pack.js",
    "shared/content/content-packs/existing-inspirations-pack.js",
    "shared/content/content-packs/legacy-darken-location-pack.js",
    "shared/content/content-packs/sedlec-ossuary-inspiration-module-pack.js",
    "shared/content/contracts/location-component-effect.js",
    "shared/content/inspiration-modules/anthropodermic-bibliopegy.js",
    "shared/content/inspiration-modules/core-inspiration-modules.js",
    "shared/content/inspiration-modules/crucifixion.js",
    "shared/content/inspiration-modules/decomposition.js",
    "shared/content/inspiration-modules/endocannibalism.js",
    "shared/content/inspiration-modules/genetic-mutations.js",
    "shared/content/inspiration-modules/impalement.js",
    "shared/content/inspiration-modules/inspiration-module.factory.js",
    "shared/content/inspiration-modules/jikininki.js",
    "shared/content/inspiration-modules/mortuary-totems.js",
    "shared/content/inspiration-modules/mustard-gas.js",
    "shared/content/inspiration-modules/sedlec-ossuary.js",
    "shared/content/inspiration-modules/the-mist.js",
    "shared/content/inspiration-modules/towers-of-silence.js",
    "shared/content/inspiration-modules/wax-death-masks.js",
    "shared/content/inspiration-modules/wolf-spiders.js",
    "tests/e2e/dark-places-pipeline.spec.js",
    "tests/e2e/dark-places.helpers.js",
    "tests/unit/inspiration-modules.spec.js"
)

try {
    New-Item -ItemType Directory -Path $stage -Force | Out-Null

    foreach ($relative in $files) {
        $source = Join-Path $repo $relative
        if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
            throw "File necessario mancante: $relative"
        }

        $destination = Join-Path $stage $relative
        New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $source -Destination $destination -Force
    }

    $manifestDirectory = Join-Path $stage "_manifest"
    New-Item -ItemType Directory -Path $manifestDirectory -Force | Out-Null

    $hashLines = foreach ($relative in $files) {
        $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $stage $relative)).Hash.ToLowerInvariant()
        "$hash  $($relative.Replace('\', '/'))"
    }
    [System.IO.File]::WriteAllText(
        (Join-Path $manifestDirectory "files.sha256"),
        (($hashLines -join "`n") + "`n"),
        $utf8NoBom
    )

    $manifest = [ordered]@{
        repository = "danilo-aversa/cruor-games"
        branch = $branch
        commit = $commit
        purpose = "dark-places-semantic-v2-phase0-minimal-audit-input"
        fileCount = $files.Count
        generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    } | ConvertTo-Json -Depth 4
    [System.IO.File]::WriteAllText(
        (Join-Path $manifestDirectory "manifest.json"),
        ($manifest + "`n"),
        $utf8NoBom
    )

    if (Test-Path -LiteralPath $zip) {
        Remove-Item -LiteralPath $zip -Force
    }
    Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip -CompressionLevel Optimal

    $zipHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $zip).Hash.ToLowerInvariant()
    Write-Host "ZIP: $zip"
    Write-Host "SHA-256: $zipHash"
    Write-Host "Repository files: $($files.Count)"
}
finally {
    if (Test-Path -LiteralPath $stage) {
        Remove-Item -LiteralPath $stage -Recurse -Force
    }
}
```
