export {
  createContentRegistry,
  defineContentRegistryData,
  summarizeContentRegistry,
  validateContentRegistry,
} from "./registry.js";
export {
  SOURCE_ANCHOR_ALIASES,
  SHARED_SOURCE_ANCHORS,
  getSourceAnchorId,
  normalizeSourceAnchorIds,
} from "./source-anchors.js";
export {
  SHARED_INSPIRATIONS,
  buildSharedInspirations,
  inspirationCardToSharedInspiration,
} from "./inspirations.js";
export {
  SHARED_MONSTER_COMPONENTS,
  buildSharedMonsterComponents,
  monsterGraftToSharedComponent,
} from "./monster-components.js";
export {
  CONTENT_PACK_COLLECTIONS,
  CONTENT_PACK_SCHEMA_VERSION,
  CONTENT_PACK_STATUS,
  contentPackToRegistryData,
  createContentPack,
  createRegistryFromContentPack,
  mergeContentPacks,
  normalizeContentPack,
  summarizeContentPack,
  validateContentPack,
} from "./content-pack-schema.js";
export {
  buildContentPackProvenance,
  getContentEntryId,
} from "./content-pack-provenance.js";
export {
  createContentRepositoryAdapter,
  createStaticContentRepository,
  STATIC_CONTENT_REPOSITORY,
} from "./content-repository.adapter.js";
export {
  validateContentComponentStrict,
  validateContentPackStrict,
  validateContentRegistryStrict,
  validateStaticContentRepository,
} from "./content-validation.js";
export {
  DECOMPOSITION_INSPIRATION_MODULE_CONTENT_PACK,
} from "./content-packs/decomposition-inspiration-module-pack.js";
export {
  SEDLEC_OSSUARY_INSPIRATION_MODULE_CONTENT_PACK,
} from "./content-packs/sedlec-ossuary-inspiration-module-pack.js";
export {
  CORE_CRUOR_CONTENT_PACK,
  CORE_CRUOR_CONTENT_PACK_ID,
} from "./content-packs/core-cruor-pack.js";
export {
  EXISTING_INSPIRATIONS_CONTENT_PACK,
  EXISTING_INSPIRATIONS_CONTENT_PACK_ID,
} from "./content-packs/existing-inspirations-pack.js";
export {
  LEGACY_DARKEN_LOCATION_CONTENT_PACK,
  LEGACY_DARKEN_LOCATION_CONTENT_PACK_ID,
} from "./content-packs/legacy-darken-location-pack.js";
export {
  CORE_INSPIRATION_CARD_DEFINITIONS,
  CORE_INSPIRATION_MODULES,
  CORE_INSPIRATION_MODULE_COMPONENTS,
  CORE_INSPIRATION_MODULE_INSPIRATIONS,
  CORE_INSPIRATION_MODULE_PACK_ID,
  CORE_INSPIRATION_MODULE_REFERENCED_SOURCE_ANCHORS,
  CORE_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET,
  CORE_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS,
  CORE_INSPIRATION_MODULE_SOURCE_ANCHORS,
  INSPIRATION_ASSET_BASE_PATH,
  INSPIRATION_ASSET_PROVIDER,
  buildCoreInspirationFromCard,
  buildInspirationAssetUrl,
  getCoreInspirationModule,
  getCoreInspirationModuleReferencedSourceAnchors,
  resolveInspirationCardAsset,
} from "./inspiration-modules/core-inspiration-modules.js";
export {
  DECOMPOSITION_INSPIRATION,
  DECOMPOSITION_INSPIRATION_MODULE,
  DECOMPOSITION_INSPIRATION_MODULE_PACK_ID,
  DECOMPOSITION_LOCATION_COMPONENTS,
  DECOMPOSITION_LOCATION_REGION_COMPONENTS,
  DECOMPOSITION_MONSTER_GRAFT_COMPONENTS,
  DECOMPOSITION_REFERENCED_SOURCE_ANCHORS,
  DECOMPOSITION_SOURCE_ANCHOR,
  DECOMPOSITION_SOURCE_ANCHOR_ID,
  SEDLEC_OSSUARY_INSPIRATION,
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
  SEDLEC_OSSUARY_INSPIRATION_MODULE_PACK_ID,
  SEDLEC_OSSUARY_LOCATION_COMPONENTS,
  SEDLEC_OSSUARY_LOCATION_REGION_COMPONENTS,
  SEDLEC_OSSUARY_MONSTER_GRAFT_COMPONENTS,
  SEDLEC_OSSUARY_REFERENCED_SOURCE_ANCHORS,
  SEDLEC_OSSUARY_SOURCE_ANCHOR,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
  CONVERTED_CORE_INSPIRATION_MODULES,
  CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET,
  CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS,
  CRUOR_INSPIRATION_MODULES,
  EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET,
  EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS,
  EXPLICIT_INSPIRATION_MODULES,
  buildInspirationModules,
  buildInspirationModulesFromRegistry,
  defineInspirationModule,
  flattenInspirationModuleCollection,
  modulesToRegistryCollections,
  uniqueById,
} from "./inspiration-modules.js";
export { defineInspirationModule as defineInspirationModuleSchema } from "./inspiration-module-schema.js";
export {
  DARKEN_LOCATION_SLOT_IDS,
  LEGACY_LOCATION_WORKFLOW_ID,
  LOCATION_COMPONENT_CONTENT_TYPE,
  SHARED_DARKEN_LOCATION_COMPONENTS,
  buildSharedDarkenLocationComponents,
  legacyDarkenComponentToSharedComponent,
} from "./adapters/darken-components.js";
export {
  LOCATION_REGION_CONTENT_TYPE,
  LOCATION_REGION_SLOT_ID,
  MAP_GENERATOR_WORKFLOW_ID,
  SHARED_LOCATION_REGION_COMPONENTS,
  buildLegacyLocationRegionTemplatesFromComponents,
  buildSharedLocationRegionComponents,
  legacyLocationRegionToSharedComponent,
  sharedLocationRegionToLegacyTemplate,
} from "./adapters/location-regions.js";
export { SHARED_TAXONOMIES } from "./taxonomies.js";
export { SHARED_DARKEN_LOCATION_SLOTS, SHARED_MONSTER_SLOTS, SHARED_WORKFLOWS } from "./workflows.js";

export {
  SPELLS_5E24,
  SPELLS_5E24_BY_ID,
  SPELLS_5E24_BY_NAME,
  SPELLS_5E24_DATASET_ID,
  SPELLS_5E24_LEVEL_OPTIONS,
  SPELLS_5E24_SCHOOL_OPTIONS,
  findSpell5e24,
  getSpell5e24Name,
  normalizeSpell5e24Ref,
} from "./spells.5e24.js";
export {
  STATIC_CONTENT_PACK,
  STATIC_CONTENT_PACKS,
  STATIC_CONTENT_PACK_PROVENANCE,
  STATIC_CONTENT_PACK_ISSUES,
  STATIC_CONTENT_PACK_SUMMARY,
  STATIC_CONTENT_REGISTRY,
  STATIC_CONTENT_REGISTRY_DATA,
} from "./static-registry.js";

export {
  getStaticContentPackIssues,
  getStaticInspirationModules,
  getStaticContentPackProvenance,
  getStaticContentPackSummaries,
  getStaticContentPackSummary,
  getStaticContentRegistry,
  loadContentPackProvenance,
  loadContentPackSummaries,
  loadContentRegistry,
  loadInspirationModules,
} from "./content-repository.js";

export {
  ANTHROPODERMIC_BIBLIOPEGY_INSPIRATION_MODULE,
  CRUCIFIXION_INSPIRATION_MODULE,
  ENDOCANNIBALISM_INSPIRATION_MODULE,
  GENETIC_MUTATIONS_INSPIRATION_MODULE,
  IMPALEMENT_INSPIRATION_MODULE,
  JIKININKI_INSPIRATION_MODULE,
  MORTUARY_TOTEMS_INSPIRATION_MODULE,
  MUSTARD_GAS_INSPIRATION_MODULE,
  THE_MIST_INSPIRATION_MODULE,
  TOWERS_OF_SILENCE_INSPIRATION_MODULE,
  WAX_DEATH_MASKS_INSPIRATION_MODULE,
  WOLF_SPIDERS_INSPIRATION_MODULE,
} from "./inspiration-modules.js";
