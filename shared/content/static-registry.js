import {
  CONTENT_PACK_STATUS,
  contentPackToRegistryData,
  createRegistryFromContentPack,
  mergeContentPacks,
  summarizeContentPack,
  validateContentPack,
} from "./content-pack-schema.js";
import { buildContentPackProvenance } from "./content-pack-provenance.js";
import { CORE_CRUOR_CONTENT_PACK } from "./content-packs/core-cruor-pack.js";
import { DECOMPOSITION_INSPIRATION_MODULE_CONTENT_PACK } from "./content-packs/decomposition-inspiration-module-pack.js";
import { EXISTING_INSPIRATIONS_CONTENT_PACK } from "./content-packs/existing-inspirations-pack.js";
import { JACK_THE_RIPPER_CONTENT_PACK } from "./content-packs/jack-the-ripper-pack.js";
import { SEDLEC_OSSUARY_INSPIRATION_MODULE_CONTENT_PACK } from "./content-packs/sedlec-ossuary-inspiration-module-pack.js";
import { LEGACY_DARKEN_LOCATION_CONTENT_PACK } from "./content-packs/legacy-darken-location-pack.js";

export const STATIC_CONTENT_PACKS = Object.freeze([
  DECOMPOSITION_INSPIRATION_MODULE_CONTENT_PACK,
  SEDLEC_OSSUARY_INSPIRATION_MODULE_CONTENT_PACK,
  CORE_CRUOR_CONTENT_PACK,
  EXISTING_INSPIRATIONS_CONTENT_PACK,
  JACK_THE_RIPPER_CONTENT_PACK,
  LEGACY_DARKEN_LOCATION_CONTENT_PACK,
]);

export const STATIC_CONTENT_PACK_PROVENANCE = buildContentPackProvenance(STATIC_CONTENT_PACKS);

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

export const STATIC_CONTENT_PACK_SUMMARY = summarizeContentPack(STATIC_CONTENT_PACK);
export const STATIC_CONTENT_PACK_ISSUES = [
  ...STATIC_CONTENT_PACKS.flatMap((pack) =>
    validateContentPack(pack).map((issue) => ({ ...issue, packId: pack.id }))
  ),
  ...validateContentPack(STATIC_CONTENT_PACK).map((issue) => ({
    ...issue,
    packId: STATIC_CONTENT_PACK.id,
  })),
];

export const STATIC_CONTENT_REGISTRY_DATA = contentPackToRegistryData(STATIC_CONTENT_PACK);
export const STATIC_CONTENT_REGISTRY = createRegistryFromContentPack(STATIC_CONTENT_PACK);
