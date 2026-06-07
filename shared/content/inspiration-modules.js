import { SHARED_DARKEN_LOCATION_COMPONENTS } from "./adapters/darken-components.js";
import { SHARED_LOCATION_REGION_COMPONENTS } from "./adapters/location-regions.js";
import {
  defineInspirationModule,
  flattenInspirationModuleCollection,
  modulesToRegistryCollections,
  uniqueById,
} from "./inspiration-module-schema.js";
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
]);

const EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS = new Set([
  DECOMPOSITION_SOURCE_ANCHOR_ID,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
]);

export function buildInspirationModules({
  sourceAnchors = SHARED_SOURCE_ANCHORS,
  inspirations = SHARED_INSPIRATIONS,
  components = [
    ...SHARED_MONSTER_COMPONENTS,
    ...SHARED_DARKEN_LOCATION_COMPONENTS,
    ...SHARED_LOCATION_REGION_COMPONENTS,
  ],
  packId = "core-cruor",
  excludedSourceAnchorIds = EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS,
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
          generatedFrom: "static-content-registry",
        },
      }),
    );
}

export function buildInspirationModulesFromRegistry(registry, { packId = "static-registry" } = {}) {
  if (!registry) return [];
  return [
    ...EXPLICIT_INSPIRATION_MODULES,
    ...buildInspirationModules({
      sourceAnchors: registry.sourceAnchors || [],
      inspirations: registry.inspirations || [],
      components: registry.components || [],
      packId,
    }),
  ];
}

export {
  defineInspirationModule,
  flattenInspirationModuleCollection,
  modulesToRegistryCollections,
  uniqueById,
};

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

export const CRUOR_INSPIRATION_MODULES = Object.freeze([
  ...EXPLICIT_INSPIRATION_MODULES,
  ...buildInspirationModules(),
]);
