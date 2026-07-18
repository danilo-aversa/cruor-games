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
approved Decomposition revision 2, The Mist candidate 1, and Wolf Spiders
Candidate 2 on 2026-07-17. Wolf Spiders Candidate 1 remains recorded as
withdrawn; Candidate 2 is the fourth approved canonical v2 catalog entry.
Towers of Silence v2 is now the fifth canonical v2 catalog entry and
remains `in-review`.
Decomposition is the second complete canonical v2 catalog entry. Its semantic
pack owns Archive + Dark Places content; the existing 26 modern Monster grafts
remain externally owned and are verified by source-anchor parity. Editorial revision 2 adds a published biological source
dossier, non-linear human-donor caution, fantasy-facing terminology, distinct
exploration and combat cadence, a Stage 4 counterplay window, while leaving Monster rules outside this migration. All 27 legacy location/region
components remain accounted for, and all 26 modern Monster grafts are verified
externally by source-anchor parity without being copied into the semantic pack.
The Mist is the third complete canonical v2 catalog entry and an A + D
migration. Its White Refuge identity, Orientation Drift procedure, four
progressive recurring signs, and session guide preserve real map topology,
expose discrepancies, keep an anchored retreat, and announce the final breach.
All 24 legacy location and region components remain accounted for, and the
transformative-use review and repeatable local QA are complete. All four approved modules remain blocked from image publication until creator,
license, source URL, and final alt text are verified or the local assets are
replaced.
Wolf Spiders Candidate 1 was withdrawn on 2026-07-17 because it copied or
bridged already-modern Monster Composer data into a second semantic owner.
Candidate 2 reuses the evidence-bounded biological dossier and Dark Places draft but
owns only Archive + Dark Places. It contains zero Monster components; its 32
Monster grafts remain solely in the modern Monster catalog and are verified by
external source-anchor parity. Human biological-source review and repeatable
local sample QA are complete; image provenance remains the independent gate.
Towers of Silence v2 owns Archive + Dark Places only. It converts a
bounded Zoroastrian funerary and architectural source dossier into the Open
Reliquary, Sky Measure, four recurring signs, and a session guide without
creating Monster placeholders or requiring ritual imitation. Its cultural-source
review, repeatable local QA, human signoff, and image provenance remain open.
The active production Archive registry is preserved. Recovery A–D uses the fresh
local `main` input at `6e458a4089d96eda1153ba64b9bb1e0d890bdace`
(`22.0.0a`). The Sedlec v2 pack is editorially approved and available in the
separate semantic migration catalog, but it is not published into the active
production registry.
The live Composer and Final Output now use `cruor-location-document-v2`
directly. Live-integration Phase 7 removes the legacy compile-preview and v1
document-writer path while retaining explicit historical import compatibility.
Live-integration Phase 8 closes the migration with one repeatable final gate,
live deterministic compilation for all 14 Inspirations, complete seven-slot
picker coverage, state-transition and override QA, and direct v2 output/export.

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
- [Live integration Phase 7 cleanup and ownership](./live-phase7-cleanup.md)
- [Live integration Phase 8 final QA and closure](./live-phase8-final-qa.md)
- [Phase 8 batch 1 Sedlec editorial review](./phase8-batch1-sedlec-editorial-review.md)
- [Phase 8 batch 2 Decomposition editorial review](./phase8-batch2-decomposition-editorial-review.md)
- [Phase 8 batch 3 The Mist editorial review](./phase8-batch3-the-mist-editorial-review.md)
- [Phase 8 batch 4 Wolf Spiders editorial review](./phase8-batch4-wolf-spiders-editorial-review.md)
- [Phase 8 batch 5 Towers of Silence editorial review](./phase8-batch5-towers-of-silence-editorial-review.md)
- [Phase 8 batch 8 Endocannibalism editorial review](./phase8-batch8-endocannibalism-editorial-review.md)
- [Phase 8 batch 9 Genetic Mutations editorial review](./phase8-batch9-genetic-mutations-editorial-review.md)
- [Phase 8 batch 7 Mustard Gas editorial review](./phase8-batch7-mustard-gas-editorial-review.md)
- [Phase 8 batch 6 Mortuary Totems editorial review](./phase8-batch6-mortuary-totems-editorial-review.md)
- [Recovery E repository map and CI gates](./recovery-e-repository-map-ci.md)

The deterministic Sedlec fixtures are stored under
`tests/fixtures/dark-places-semantic-v2/sedlec-ossuary/`. Phase-specific tests
validate the current semantic compiler directly. Historical snapshot scripts
remain migration records and are no longer active package gates; the retired
Phase 0 compile-preview snapshot has been removed.

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
npm run qa:dark-places:semantic-contracts
npm run qa:dark-places:semantic-compiler
npm run qa:dark-places:semantic-phase3
npm run qa:dark-places:semantic-phase4
npm run qa:dark-places:semantic-phase5
npm run qa:dark-places:semantic-phase6
npm run qa:dark-places:semantic-phase7
npm run qa:dark-places:semantic-phase8
npm run qa:dark-places:live-phase8
npm run qa:dark-places:phase8-final
npm run qa:dark-places:semantic-phase8-batch2
npm run qa:dark-places:semantic-phase8-batch3
npm run qa:dark-places:semantic-phase8-batch4
npm run qa:dark-places:semantic-phase8-batch5
```

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
canonical Sedlec, Decomposition, The Mist, Wolf Spiders, and Towers of Silence
bytes without writing, validates the v2 catalog, requires full Studio semantic coverage,
compiles warning-free deterministic samples, and protects the unchanged active Archive registry.
`qa:dark-places:live-phase8` covers the production registry and picker, all
seven slot assignments, room assignment, granular override lifecycle, compiler,
map handoff, manual override preservation, v2/v1 output boundaries, draft
recovery, Final Output, and deterministic live compilation for all 14 modules.
`qa:dark-places:phase8-final` combines the editorial and live gates with static
content validation and is the closure command for this migration.
`qa:dark-places:semantic-phase8-batch2` isolates the Decomposition migration,
including the absence of owned Monster components, parity against the external
modern Monster catalog, revised clock cadence, source framing, and Archive + Dark
Places Studio round-trip coverage.
`qa:dark-places:semantic-phase8-batch3` isolates The Mist, verifies exact
24-component provenance coverage, the literary and copyright boundary, fair
Orientation Drift cadence, stated discrepancies, stable topology, recurring-sign
progression, Studio round trip, and warning-free deterministic samples.
`qa:dark-places:semantic-phase8-batch4` isolates the approved Wolf Spiders Candidate 2, verifies its A + D ownership, 17-id legacy coverage, 32-graft external Monster parity, biological boundary, and warning-free deterministic samples.
`qa:dark-places:semantic-phase8-batch5` isolates Towers of Silence v2, verifies its 24-id legacy mapping, cultural source/fiction boundary, A + D ownership, zero Monster linkage, semantic coverage, and warning-free deterministic samples.

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

Mortuary Totems Candidate 1 is approved as canonical v2 with Archive + Dark Places ownership only, zero Monster linkage, 11 legacy ids mapped exactly once, and independent human/source/QA/image publication gates.

Mustard Gas Candidate 1 is approved as canonical v2 with Archive + Dark Places ownership only, zero Monster linkage, 15 legacy ids mapped exactly once, and independent human/source/QA/image publication gates.

Endocannibalism Candidate 1 is approved as canonical v2 with Archive + Dark Places ownership only, zero Monster linkage, 11 legacy ids mapped exactly once, and independent human/source/QA/image publication gates.

### Phase 8 approvals recorded — 2026-07-17

Mortuary Totems Candidate 1, Mustard Gas Candidate 1, and Endocannibalism Candidate 1 were approved by Danilo after local zero-diagnostic QA. Their only remaining publication blocker is image provenance.

Genetic Mutations Candidate 1 is included as canonical v2 with Archive + Dark Places ownership only, zero Monster linkage, 15 legacy ids mapped exactly once, and independent human/source/QA/image publication gates.

- [Phase 8 batch 10 Crucifixion editorial review](./phase8-batch10-crucifixion-editorial-review.md)

Crucifixion Candidate 1 is included as canonical v2 with Archive + Dark Places ownership only, zero Monster linkage, 9 legacy ids mapped exactly once, and independent human/source/QA/image publication gates.

- [Phase 8 batch 11 Impalement editorial review](./phase8-batch11-impalement-editorial-review.md)

Impalement Candidate 1 is included as canonical v2 with Archive + Dark Places ownership only, zero Monster linkage, 6 legacy ids mapped exactly once, and independent human/source/QA/image publication gates.


### Phase 8 approvals recorded — batches 9–11 — 2026-07-17

Genetic Mutations Candidate 1, Crucifixion Candidate 1, and Impalement Candidate 1 were approved by Danilo after local zero-diagnostic QA. Each owns Inspiration Archive + Dark Places only, contains zero Monster payload, and retains only `image-provenance-required` as a publication blocker.

- [Phase 8 batch 12 Wax Death Masks editorial review](./phase8-batch12-wax-death-masks-editorial-review.md)

Wax Death Masks Candidate 1 is approved as canonical v2 with Archive + Dark Places ownership only and external parity to 7 native Monster grafts. Its deterministic sample QA passes with zero diagnostics; only image provenance remains open.

- [Phase 8 batch 13 Anthropodermic Bibliopegy editorial review](./phase8-batch13-anthropodermic-bibliopegy-editorial-review.md)

Anthropodermic Bibliopegy Candidate 1 is approved as canonical v2 with Archive + Dark Places ownership only and zero Monster capability. Its deterministic sample QA passes with zero diagnostics; only image provenance remains open.

- [Phase 8 batch 14 Jikininki editorial review](./phase8-batch14-jikininki-editorial-review.md)

Jikininki Candidate 1 is approved as canonical v2 with Archive + Dark Places ownership only and external parity to 25 native Monster grafts. Its deterministic sample QA passes with zero diagnostics; only image provenance remains open.


### Phase 8 final editorial approvals — 2026-07-17

All 14 Inspirations are represented by canonical v2 modules, have an explicit approval from Danilo, and pass deterministic sample QA with zero diagnostics. Phase 8 is technically complete. Production behavior remains unchanged; Wax Death Masks and Jikininki verify their native Monster catalogs externally rather than copying grafts into Dark Places packs.


### Phase 8 technical closure — 2026-07-18

The closing rerun passed the batch 8–14 checks and the aggregate Phase 8 suite. All 14 canonical v2 modules report complete semantic coverage; every deterministic sample completed with zero errors, zero warnings, and zero determinism failures. The aggregate Vitest run passed 118 tests across 16 files. `sample-qa-local-verification-required` is closed for Wax Death Masks, Anthropodermic Bibliopegy, and Jikininki. Only `image-provenance-required` remains open for publication.
