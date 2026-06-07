import { SHARED_DARKEN_LOCATION_COMPONENTS } from "./adapters/darken-components.js";
import { SHARED_LOCATION_REGION_COMPONENTS } from "./adapters/location-regions.js";
import {
  defineInspirationModule,
  flattenInspirationModuleCollection,
  modulesToRegistryCollections,
  uniqueById,
} from "./inspiration-module-schema.js";
import {
  CORE_INSPIRATION_MODULES,
} from "./inspiration-modules/core-inspiration-modules.js";
import { DECOMPOSITION_INSPIRATION_MODULE, DECOMPOSITION_SOURCE_ANCHOR_ID } from "./inspiration-modules/decomposition.js";
import {
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/sedlec-ossuary.js";
import { SHARED_INSPIRATIONS } from "./inspirations.js";
import { SHARED_MONSTER_COMPONENTS } from "./monster-components.js";
import { normalizeSourceAnchorIds, SHARED_SOURCE_ANCHORS } from "./source-anchors.js";

function asArray(value) {
  if (!value) return [];
  if (value instanceof Set) return [...value].filter(Boolean);
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function entryReferencesSourceAnchor(entry, sourceAnchorId) {
  return normalizeSourceAnchorIds(entry?.sourceAnchors).includes(sourceAnchorId);
}

function getPrimaryInspirationForSourceAnchor(sourceAnchorId, inspirations = SHARED_INSPIRATIONS) {
  return asArray(inspirations).find((inspiration) => entryReferencesSourceAnchor(inspiration, sourceAnchorId)) || null;
}

export const EXPLICIT_INSPIRATION_MODULES = Object.freeze([
  DECOMPOSITION_INSPIRATION_MODULE,
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
].filter(Boolean));

export const EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS = Object.freeze([
  DECOMPOSITION_SOURCE_ANCHOR_ID,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
]);

export const EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET = new Set(
  EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS,
);

export const CONVERTED_CORE_INSPIRATION_MODULES = Object.freeze(
  CORE_INSPIRATION_MODULES.filter((module) => !EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET.has(module.id)),
);

/**
 * Canonical static Inspiration Module collection.
 *
 * This is the source consumed by Inspiration Studio. It keeps the explicit/standalone
 * modules first, then appends the converted archive modules. Registry-based module
 * generation remains available below only as a compatibility fallback for source
 * anchors that do not yet have an authored module.
 */
export const CRUOR_INSPIRATION_MODULES = Object.freeze(
  uniqueById([
    ...EXPLICIT_INSPIRATION_MODULES,
    ...CONVERTED_CORE_INSPIRATION_MODULES,
  ]),
);

export const CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS = Object.freeze(
  CRUOR_INSPIRATION_MODULES.map((module) => module.id).filter(Boolean),
);

export const CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET = new Set(
  CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS,
);

export function buildInspirationModules({
  sourceAnchors = SHARED_SOURCE_ANCHORS,
  inspirations = SHARED_INSPIRATIONS,
  components = [
    ...SHARED_MONSTER_COMPONENTS,
    ...SHARED_DARKEN_LOCATION_COMPONENTS,
    ...SHARED_LOCATION_REGION_COMPONENTS,
  ],
  packId = "core-cruor",
  excludedSourceAnchorIds = CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET,
} = {}) {
  const excludedIds = new Set(asArray(excludedSourceAnchorIds));

  return asArray(sourceAnchors)
    .filter((sourceAnchor) => sourceAnchor?.id && !excludedIds.has(sourceAnchor.id))
    .map((sourceAnchor) =>
      defineInspirationModule({
        id: sourceAnchor.id,
        title: sourceAnchor.label,
        status: sourceAnchor.status,
        packId,
        sourceAnchor,
        inspiration: getPrimaryInspirationForSourceAnchor(sourceAnchor.id, inspirations),
        components: asArray(components).filter((component) => entryReferencesSourceAnchor(component, sourceAnchor.id)),
        metadata: {
          generatedFrom: "static-content-registry-fallback",
        },
      }),
    );
}

export function buildInspirationModulesFromRegistry(registry, { packId = "static-registry" } = {}) {
  if (!registry) return CRUOR_INSPIRATION_MODULES;

  const generatedFallbackModules = buildInspirationModules({
    sourceAnchors: registry.sourceAnchors || [],
    inspirations: registry.inspirations || [],
    components: registry.components || [],
    packId,
    excludedSourceAnchorIds: CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET,
  });

  return uniqueById([
    ...CRUOR_INSPIRATION_MODULES,
    ...generatedFallbackModules,
  ]);
}

export {
  defineInspirationModule,
  flattenInspirationModuleCollection,
  modulesToRegistryCollections,
  uniqueById,
};

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
} from "./inspiration-modules/decomposition.js";

export {
  SEDLEC_OSSUARY_INSPIRATION,
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
  SEDLEC_OSSUARY_INSPIRATION_MODULE_PACK_ID,
  SEDLEC_OSSUARY_LOCATION_COMPONENTS,
  SEDLEC_OSSUARY_LOCATION_REGION_COMPONENTS,
  SEDLEC_OSSUARY_MONSTER_GRAFT_COMPONENTS,
  SEDLEC_OSSUARY_REFERENCED_SOURCE_ANCHORS,
  SEDLEC_OSSUARY_SOURCE_ANCHOR,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/sedlec-ossuary.js";
