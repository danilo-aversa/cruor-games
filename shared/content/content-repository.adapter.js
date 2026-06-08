import { CRUOR_INSPIRATION_MODULES, buildInspirationModulesFromRegistry } from "./inspiration-modules.js";
import {
  STATIC_CONTENT_PACK_PROVENANCE,
  STATIC_CONTENT_PACKS,
  STATIC_CONTENT_PACK_ISSUES,
  STATIC_CONTENT_PACK_SUMMARY,
  STATIC_CONTENT_REGISTRY,
} from "./static-registry.js";

function summarizePacks(packs = []) {
  return packs.map((pack) => ({
    id: pack.id,
    title: pack.title,
    summary: pack.summary,
    status: pack.status,
    version: pack.version,
    locale: pack.locale,
    tags: pack.tags || [],
    collections: Object.fromEntries(
      Object.entries(pack.collections || {}).map(([collectionName, entries]) => [
        collectionName,
        Array.isArray(entries) ? entries.length : 0,
      ]),
    ),
  }));
}

export function createContentRepositoryAdapter({
  getRegistry,
  getPackProvenance,
  getPacks,
  getPackIssues,
  getPackSummary,
  getInspirationModules,
}) {
  return Object.freeze({
    getRegistry,
    getPackProvenance,
    getPacks,
    getPackIssues,
    getPackSummary,
    getPackSummaries: () => summarizePacks(getPacks()),
    getInspirationModules,
    loadRegistry: async () => getRegistry(),
    loadPackProvenance: async () => getPackProvenance(),
    loadPackSummaries: async () => summarizePacks(getPacks()),
    loadInspirationModules: async () => getInspirationModules(),
  });
}

export function createStaticContentRepository() {
  return createContentRepositoryAdapter({
    getRegistry: () => STATIC_CONTENT_REGISTRY,
    getPackProvenance: () => STATIC_CONTENT_PACK_PROVENANCE,
    getPacks: () => STATIC_CONTENT_PACKS,
    getPackIssues: () => STATIC_CONTENT_PACK_ISSUES,
    getPackSummary: () => STATIC_CONTENT_PACK_SUMMARY,
    getInspirationModules: ({ includeRegistryFallback = true } = {}) => {
      if (!includeRegistryFallback) return CRUOR_INSPIRATION_MODULES;
      return buildInspirationModulesFromRegistry(STATIC_CONTENT_REGISTRY, {
        packId: "static-cruor-registry",
      });
    },
  });
}

export const STATIC_CONTENT_REPOSITORY = createStaticContentRepository();
