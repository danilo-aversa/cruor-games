import {
  CONTENT_PACK_STATUS,
  contentPackToRegistryData,
  createRegistryFromContentPack,
  mergeContentPacks,
  summarizeContentPack,
  validateContentPack,
} from "./content-pack-schema.js";
import {
  annotateRegistryDataWithContentPackProvenance,
  buildContentPackProvenance,
} from "./content-pack-provenance.js";
import { CORE_CRUOR_CONTENT_PACK } from "./content-packs/core-cruor-pack.js";
import { DECOMPOSITION_INSPIRATION_MODULE_CONTENT_PACK } from "./content-packs/decomposition-inspiration-module-pack.js";
import { EXISTING_INSPIRATIONS_CONTENT_PACK } from "./content-packs/existing-inspirations-pack.js";
import { DARK_PLACES_CANONICAL_EXPANSION_CONTENT_PACK } from "./content-packs/dark-places-canonical-expansion-pack.js";
import { SEDLEC_OSSUARY_INSPIRATION_MODULE_CONTENT_PACK } from "./content-packs/sedlec-ossuary-inspiration-module-pack.js";
import { THE_MIST_INSPIRATION_MODULE_CONTENT_PACK } from "./content-packs/the-mist-inspiration-module-pack.js";
import { WOLF_SPIDERS_INSPIRATION_MODULE_CONTENT_PACK } from "./content-packs/wolf-spiders-inspiration-module-pack.js";
import { LEGACY_DARKEN_LOCATION_CONTENT_PACK } from "./content-packs/legacy-darken-location-pack.js";

export const STATIC_CONTENT_PACKS = Object.freeze([
  DECOMPOSITION_INSPIRATION_MODULE_CONTENT_PACK,
  SEDLEC_OSSUARY_INSPIRATION_MODULE_CONTENT_PACK,
  THE_MIST_INSPIRATION_MODULE_CONTENT_PACK,
  WOLF_SPIDERS_INSPIRATION_MODULE_CONTENT_PACK,
  EXISTING_INSPIRATIONS_CONTENT_PACK,
  DARK_PLACES_CANONICAL_EXPANSION_CONTENT_PACK,
  CORE_CRUOR_CONTENT_PACK,
]);

export const STATIC_RETIRED_CONTENT_PACKS = Object.freeze([
  LEGACY_DARKEN_LOCATION_CONTENT_PACK,
]);

export const STATIC_CONTENT_PACK_PROVENANCE =
  buildContentPackProvenance(STATIC_CONTENT_PACKS);
const STATIC_CONTENT_MIGRATION_AUDIT_PROVENANCE = buildContentPackProvenance([
  ...STATIC_CONTENT_PACKS,
  ...STATIC_RETIRED_CONTENT_PACKS,
]);

export const STATIC_CONTENT_COLLISION_REPORT =
  STATIC_CONTENT_PACK_PROVENANCE.getCollisionReport();
export const STATIC_LEGACY_MIGRATION_REPORT =
  STATIC_CONTENT_MIGRATION_AUDIT_PROVENANCE.getLegacyMigrationReport();

export const STATIC_CONTENT_PACK = mergeContentPacks(STATIC_CONTENT_PACKS, {
  id: "static-cruor-registry",
  title: "Static Cruor Registry",
  summary: "Merged static Cruor registry assembled from bundled content packs.",
  version: "0.1.0",
  status: CONTENT_PACK_STATUS.PUBLISHED,
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: ["static", "registry", "merged"],
  metadata: {
    bundled: true,
    registryRole: "static-registry",
  },
});

export const STATIC_CONTENT_PACK_SUMMARY =
  summarizeContentPack(STATIC_CONTENT_PACK);

const STATIC_CONTENT_MIGRATION_ISSUES = [
  ...(STATIC_LEGACY_MIGRATION_REPORT.summary.activeEntries
    ? [
        {
          severity: "warning",
          path: "legacyMigration.activeEntries",
          id: "legacy-content",
          message: `${STATIC_LEGACY_MIGRATION_REPORT.summary.activeEntries} legacy fallback entries remain active.`,
        },
      ]
    : []),
  ...(STATIC_LEGACY_MIGRATION_REPORT.summary.reviewRequiredEntries
    ? [
        {
          severity: "error",
          path: "legacyMigration.reviewRequiredEntries",
          id: "legacy-content",
          message: `${STATIC_LEGACY_MIGRATION_REPORT.summary.reviewRequiredEntries} migrated entries require manual review.`,
        },
      ]
    : []),
];

export const STATIC_CONTENT_PACK_ISSUES = [
  ...STATIC_CONTENT_PACKS.flatMap((pack) =>
    validateContentPack(pack).map((issue) => ({ ...issue, packId: pack.id })),
  ),
  ...validateContentPack(STATIC_CONTENT_PACK).map((issue) => ({
    ...issue,
    packId: STATIC_CONTENT_PACK.id,
  })),
  ...STATIC_CONTENT_MIGRATION_ISSUES,
];

const STATIC_CONTENT_REGISTRY_DATA_RAW =
  contentPackToRegistryData(STATIC_CONTENT_PACK);

export const STATIC_CONTENT_REGISTRY_DATA =
  annotateRegistryDataWithContentPackProvenance(
    STATIC_CONTENT_REGISTRY_DATA_RAW,
    STATIC_CONTENT_PACK_PROVENANCE,
  );
export const STATIC_CONTENT_REGISTRY = createRegistryFromContentPack({
  ...STATIC_CONTENT_PACK,
  collections: STATIC_CONTENT_REGISTRY_DATA,
});
