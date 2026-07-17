export {
  createContentRegistry,
  defineContentRegistryData,
  summarizeContentRegistry,
  validateContentRegistry,
} from "./registry.js";
export {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  LOCALIZED_CONTENT_FIELDS,
  LOCALE_DICTIONARIES,
  SUPPORTED_LOCALES,
  getCurrentLocale,
  getLocaleDictionary,
  getLocalizedField,
  getLocalizedRecord,
  hasLocalizedContent,
  normalizeLocale,
  resolveLocalizedContentEntry,
  resolveLocalizedContentList,
  setCurrentLocale,
  t,
  translate,
} from "../i18n/index.js";
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
  CONTENT_ENTRY_PROVENANCE_SCHEMA_VERSION,
  CONTENT_PACK_COLLISION_REPORT_SCHEMA_VERSION,
  CONTENT_PACK_MERGE_POLICY,
  LEGACY_CONTENT_MIGRATION_REPORT_SCHEMA_VERSION,
  annotateRegistryDataWithContentPackProvenance,
  buildContentPackProvenance,
  getContentEntryId,
} from "./content-pack-provenance.js";
export {
  LEGACY_CONTENT_MIGRATION_SCHEMA_VERSION,
  createLegacyContentMigration,
  resolveLegacyFieldCandidates,
  resolveLegacyObjectField,
} from "./legacy-content-migration.js";
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
export { DECOMPOSITION_INSPIRATION_MODULE_CONTENT_PACK } from "./content-packs/decomposition-inspiration-module-pack.js";
export { SEDLEC_OSSUARY_INSPIRATION_MODULE_CONTENT_PACK } from "./content-packs/sedlec-ossuary-inspiration-module-pack.js";
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
  DARK_PLACES_CANONICAL_EXPANSION_COMPONENTS,
  DARK_PLACES_CANONICAL_EXPANSION_CONTENT_PACK,
  DARK_PLACES_CANONICAL_EXPANSION_PACK_ID,
  DARK_PLACES_CANONICAL_LOCATION_COMPONENTS,
  DARK_PLACES_CANONICAL_LOCATION_REGION_COMPONENTS,
  DARK_PLACES_CANONICAL_SLOT_IDS,
  DARK_PLACES_CANONICAL_SOURCE_ANCHOR_IDS,
  DARK_PLACES_LOCATION_COMPONENT_BLUEPRINTS,
  DARK_PLACES_LOCATION_REGION_BLUEPRINTS,
  LOCATION_COMPONENT_SCHEMA_VERSION,
  LOCATION_REGION_SCHEMA_VERSION,
} from "./content-packs/dark-places-canonical-expansion-pack.js";
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
export {
  SHARED_DARKEN_LOCATION_SLOTS,
  SHARED_MONSTER_SLOTS,
  SHARED_WORKFLOWS,
} from "./workflows.js";

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
  STATIC_CONTENT_COLLISION_REPORT,
  STATIC_CONTENT_PACK,
  STATIC_CONTENT_PACKS,
  STATIC_CONTENT_PACK_PROVENANCE,
  STATIC_CONTENT_PACK_ISSUES,
  STATIC_CONTENT_PACK_SUMMARY,
  STATIC_CONTENT_REGISTRY,
  STATIC_CONTENT_REGISTRY_DATA,
  STATIC_LEGACY_MIGRATION_REPORT,
  STATIC_RETIRED_CONTENT_PACKS,
} from "./static-registry.js";

export {
  getStaticContentCollisionReport,
  getStaticContentPackIssues,
  getStaticInspirationModules,
  getStaticLegacyMigrationReport,
  getStaticContentPackProvenance,
  getStaticContentPackSummaries,
  getStaticContentPackSummary,
  getStaticContentRegistry,
  loadContentCollisionReport,
  loadContentPackProvenance,
  loadContentPackSummaries,
  loadLegacyMigrationReport,
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

export {
  CRYPT_ROOM_ARCHETYPES,
  ROOM_ARCHETYPES_BY_ID,
  ROOM_ARCHETYPE_OPTIONS,
  ROOM_ARCHETYPE_SCHEMA_VERSION,
  getRoomArchetypeDefinition,
  normalizeRoomArchetypeId,
} from "./contracts/room-archetypes.js";
export {
  ROOM_DESIGN_MODIFIER_OPTIONS,
  ROOM_DESIGN_SCHEMA_VERSION,
  ROOM_DESIGN_SHAPE_KIND_OPTIONS,
  compileRoomArchetypeToRoomDesign,
  mergeRoomDesigns,
  normalizeRoomDesign,
  normalizeRoomDesignPropKind,
  normalizeRoomDesignShapeKind,
} from "./contracts/room-design.js";
export {
  ROOM_SHAPE_CAPABILITIES_SCHEMA_VERSION,
  ROOM_SHAPE_DEFINITIONS,
  ROOM_SHAPE_DEFINITIONS_BY_ID,
  ROOM_SHAPE_KIND_OPTIONS,
  ROOM_SHAPE_SUPPORT_STATUSES,
  getRoomShapeDefinition,
  getRoomShapeSupport,
  getSupportedRoomModifiersByShape,
  getSupportedRoomShapeDefinitions,
  getSupportedRoomShapeKinds,
} from "./contracts/room-shapes.js";
export {
  ROOM_CAPABILITIES_SCHEMA_VERSION,
  createRoomCapabilitySet,
  hasRoomCapability,
  normalizeRoomCapabilityId,
  normalizeRoomCapabilityIds,
} from "./contracts/room-capabilities.js";
export {
  ROOM_COMPATIBILITY_CONFLICT_POLICIES,
  ROOM_COMPATIBILITY_SCHEMA_VERSION,
  ROOM_COMPATIBILITY_STATUSES,
  ROOM_CONFLICT_REASON_CODES,
  normalizeRoomCompatibility,
  normalizeRoomConflictPolicy,
} from "./contracts/room-compatibility.js";
export {
  LOCATION_COMPONENT_EFFECT_PLACEMENT_STRATEGIES,
  LOCATION_COMPONENT_EFFECT_SCHEMA_VERSION,
  LOCATION_COMPONENT_EFFECT_SCOPES,
  LOCATION_COMPONENT_EFFECT_UNSUPPORTED_POLICIES,
  normalizeLocationComponentEffect,
} from "./contracts/location-component-effect.js";
export * from "./contracts/semantic/index.js";
export {
  DECOMPOSITION_SEMANTIC_V2_MODULE,
  DECOMPOSITION_SEMANTIC_V2_MODULE_ID,
  DECOMPOSITION_SEMANTIC_V2_PACK,
  DECOMPOSITION_SEMANTIC_V2_PACK_ID,
  DECOMPOSITION_SEMANTIC_V2_SOURCE_ANCHOR_ID,
} from "./content-packs/decomposition-semantic-v2-pack.js";
export {
  SEDLEC_OSSUARY_SEMANTIC_V2_MODULE,
  SEDLEC_OSSUARY_SEMANTIC_V2_MODULE_ID,
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK_ID,
} from "./content-packs/sedlec-ossuary-semantic-v2-pack.js";
export {
  THE_MIST_SEMANTIC_V2_MODULE,
  THE_MIST_SEMANTIC_V2_MODULE_ID,
  THE_MIST_SEMANTIC_V2_PACK,
  THE_MIST_SEMANTIC_V2_PACK_ID,
  THE_MIST_SEMANTIC_V2_SOURCE_ANCHOR_ID,
} from "./content-packs/the-mist-semantic-v2-pack.js";
export {
  WOLF_SPIDERS_SEMANTIC_V2_MODULE,
  WOLF_SPIDERS_SEMANTIC_V2_MODULE_ID,
  WOLF_SPIDERS_SEMANTIC_V2_PACK,
  WOLF_SPIDERS_SEMANTIC_V2_PACK_ID,
  WOLF_SPIDERS_SEMANTIC_V2_SOURCE_ANCHOR_ID,
} from "./content-packs/wolf-spiders-semantic-v2-pack.js";
export {
  WOLF_SPIDERS_MONSTER_GRAFT_V2_DEFINITIONS,
  WOLF_SPIDERS_MONSTER_GRAFT_V2_SOURCE_MODE,
} from "./content-packs/wolf-spiders-monster-grafts-v2.js";
export { STATIC_SEMANTIC_CONTENT_PACKS } from "./static-semantic-content-packs.js";
export {
  INSPIRATION_V2_MIGRATION_ORDER,
  INSPIRATION_V2_MIGRATION_RECORDS,
  buildInspirationV2MigrationAudit,
  getInspirationV2MigrationRecord,
  isInspirationV2EditoriallyApproved,
  listInspirationV2MigrationRecords,
} from "./migrations/inspiration-v2-migration-registry.js";
export {
  ROOM_CONSTRAINT_RESOLVER_SCHEMA_VERSION,
  ROOM_CONTRIBUTION_SCHEMA_VERSION,
  ROOM_SIZE_SCALE_OPTIONS,
  collectRoomContributions,
  evaluateRoomComponentCandidate,
  formatRoomConflictReason,
  normalizeRoomContribution,
  resolveEffectiveRoomProgram,
  resolveRoomConstraints,
} from "./contracts/room-constraint-resolver.js";
