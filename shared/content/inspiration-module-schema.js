function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function getEntryId(entry) {
  return entry?.id || entry?.slug || entry?.legacyId || "";
}

export function uniqueById(items = []) {
  const seen = new Set();
  return asArray(items).filter((item) => {
    const id = getEntryId(item);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
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
