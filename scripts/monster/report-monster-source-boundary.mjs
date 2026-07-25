import {
  MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT,
  MONSTER_CONTENT_PACK_FEED_SUMMARY,
} from "../../features/monster-composer/data/monster-content-pack-feed.js";
import {
  MONSTER_GRAFT_SOURCE_AUTHORITY,
  MONSTER_GRAFT_SOURCE_AUTHORITY_MODES,
} from "../../features/monster-composer/data/monster-graft-source-authority.js";

const strict = process.argv.includes("--strict");
const rows = MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.rows || [];
const canonicalFallbacks = rows.filter(
  (row) =>
    row.authorityMode ===
      MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.REGISTRY_CANONICAL &&
    (row.selectedOrigin !== "registry" || row.fallbackUsed),
);
const shadowCoverageGaps = rows.filter(
  (row) =>
    row.authorityMode ===
      MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.REGISTRY_SHADOW &&
    !row.registryAvailable,
);
const sourceMismatches = rows.filter((row) => row.sourceMismatch);

const report = {
  schemaVersion: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.schemaVersion,
  manifest: Object.values(MONSTER_GRAFT_SOURCE_AUTHORITY),
  feed: MONSTER_CONTENT_PACK_FEED_SUMMARY,
  audit: {
    nativeGrafts: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.nativeGrafts,
    registryGrafts: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.registryGrafts,
    totalGrafts: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.totalGrafts,
    selectedNative: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.selectedNative,
    selectedRegistry: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.selectedRegistry,
    canonicalRegistryEntries:
      MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.canonicalRegistryEntries,
    sourceMismatches: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.sourceMismatches,
    fallbacks: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.fallbacks,
    nativeOnly: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.nativeOnly,
    registryOnly: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.registryOnly,
    equivalentRepresentations:
      MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.equivalentRepresentations,
    divergentRepresentations:
      MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.divergentRepresentations,
    byAuthorityMode: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.byAuthorityMode,
    canonicalFallbacks,
    shadowCoverageGaps,
    sourceMismatches,
  },
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

if (
  strict &&
  (canonicalFallbacks.length ||
    shadowCoverageGaps.length ||
    sourceMismatches.length)
) {
  process.exitCode = 1;
}
