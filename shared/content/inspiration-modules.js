import { SHARED_INSPIRATIONS } from "./inspirations.js";
import { SHARED_MONSTER_COMPONENTS } from "./monster-components.js";
import { SHARED_SOURCE_ANCHORS, normalizeSourceAnchorIds } from "./source-anchors.js";
import { SHARED_DARKEN_LOCATION_COMPONENTS } from "./adapters/darken-components.js";
import { SHARED_LOCATION_REGION_COMPONENTS } from "./adapters/location-regions.js";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function uniqueById(items = []) {
  const seen = new Set();
  return asArray(items).filter((item) => {
    const id = item?.id || item?.slug || item?.legacyId;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function entryReferencesSourceAnchor(entry, sourceAnchorId) {
  return normalizeSourceAnchorIds(entry?.sourceAnchors).includes(sourceAnchorId);
}

function getPrimaryInspirationForSourceAnchor(sourceAnchorId, inspirations = SHARED_INSPIRATIONS) {
  return asArray(inspirations).find((inspiration) => entryReferencesSourceAnchor(inspiration, sourceAnchorId)) || null;
}

export function defineInspirationModule(module = {}) {
  const sourceAnchor = module.sourceAnchor || null;
  const sourceAnchorId = sourceAnchor?.id || module.id || module.sourceAnchorId || "";
  const inspiration = module.inspiration || null;
  const components = uniqueById(module.components || []);

  return Object.freeze({
    id: module.id || sourceAnchorId || inspiration?.id || "inspiration-module",
    title: module.title || sourceAnchor?.label || inspiration?.title || sourceAnchorId,
    status: module.status || sourceAnchor?.status || inspiration?.status || "draft",
    packId: module.packId || module.contentPackId || "core-cruor",
    sourceAnchor,
    inspiration,
    components,
    monsterGrafts: components.filter((component) => component.contentType === "monster-graft"),
    locationComponents: components.filter((component) => component.contentType === "location-component"),
    locationRegions: components.filter((component) => component.contentType === "location-region"),
    metadata: Object.freeze({ ...(module.metadata || {}) }),
  });
}

export function buildInspirationModules({
  sourceAnchors = SHARED_SOURCE_ANCHORS,
  inspirations = SHARED_INSPIRATIONS,
  components = [
    ...SHARED_MONSTER_COMPONENTS,
    ...SHARED_DARKEN_LOCATION_COMPONENTS,
    ...SHARED_LOCATION_REGION_COMPONENTS,
  ],
  packId = "core-cruor",
} = {}) {
  return asArray(sourceAnchors).map((sourceAnchor) =>
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
  return buildInspirationModules({
    sourceAnchors: registry.sourceAnchors || [],
    inspirations: registry.inspirations || [],
    components: registry.components || [],
    packId,
  });
}

export function flattenInspirationModuleCollection(modules = [], collectionName) {
  const values = asArray(modules).flatMap((module) => {
    switch (collectionName) {
      case "sourceAnchors":
        return module.sourceAnchor ? [module.sourceAnchor] : [];
      case "inspirations":
        return module.inspiration ? [module.inspiration] : [];
      case "components":
        return module.components || [];
      default:
        return [];
    }
  });

  return uniqueById(values);
}

export function modulesToRegistryCollections(modules = []) {
  return {
    sourceAnchors: flattenInspirationModuleCollection(modules, "sourceAnchors"),
    inspirations: flattenInspirationModuleCollection(modules, "inspirations"),
    components: flattenInspirationModuleCollection(modules, "components"),
  };
}

export const CRUOR_INSPIRATION_MODULES = buildInspirationModules();
