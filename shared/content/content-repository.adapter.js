import { buildStudioInspirationModulesFromRegistry } from "./inspiration-modules.js";
import {
  STATIC_CONTENT_COLLISION_REPORT,
  STATIC_CONTENT_PACK_PROVENANCE,
  STATIC_CONTENT_PACKS,
  STATIC_CONTENT_PACK_ISSUES,
  STATIC_CONTENT_PACK_SUMMARY,
  STATIC_CONTENT_REGISTRY,
  STATIC_LEGACY_MIGRATION_REPORT,
} from "./static-registry.js";
import { normalizeLocale } from "../i18n/index.js";

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

function resolveRegistryLocale(registry, options = {}) {
  const locale = options?.locale ? normalizeLocale(options.locale) : null;
  if (!locale || typeof registry?.localize !== "function") return registry;
  return registry.localize(locale);
}

export function createContentRepositoryAdapter({
  getRegistry,
  getPackProvenance,
  getCollisionReport = () => null,
  getLegacyMigrationReport = () => null,
  getPacks,
  getPackIssues,
  getPackSummary,
  getInspirationModules,
}) {
  return Object.freeze({
    getRegistry: (options = {}) => resolveRegistryLocale(getRegistry(), options),
    getPackProvenance,
    getCollisionReport,
    getLegacyMigrationReport,
    getPacks,
    getPackIssues,
    getPackSummary,
    getPackSummaries: () => summarizePacks(getPacks()),
    getInspirationModules,
    loadRegistry: async (options = {}) => resolveRegistryLocale(getRegistry(), options),
    loadPackProvenance: async () => getPackProvenance(),
    loadCollisionReport: async () => getCollisionReport(),
    loadLegacyMigrationReport: async () => getLegacyMigrationReport(),
    loadPackSummaries: async () => summarizePacks(getPacks()),
    loadInspirationModules: async (options = {}) => getInspirationModules(options),
  });
}

export function createStaticContentRepository() {
  return createContentRepositoryAdapter({
    getRegistry: () => STATIC_CONTENT_REGISTRY,
    getPackProvenance: () => STATIC_CONTENT_PACK_PROVENANCE,
    getCollisionReport: () => STATIC_CONTENT_COLLISION_REPORT,
    getLegacyMigrationReport: () => STATIC_LEGACY_MIGRATION_REPORT,
    getPacks: () => STATIC_CONTENT_PACKS,
    getPackIssues: () => STATIC_CONTENT_PACK_ISSUES,
    getPackSummary: () => STATIC_CONTENT_PACK_SUMMARY,
    getInspirationModules: ({ includeRegistryFallback = true, locale } = {}) => {
      const registry = resolveRegistryLocale(STATIC_CONTENT_REGISTRY, { locale });
      return buildStudioInspirationModulesFromRegistry(registry, {
        includeRegistryFallback,
        packId: "static-cruor-registry",
      });
    },
  });
}

export const STATIC_CONTENT_REPOSITORY = createStaticContentRepository();
