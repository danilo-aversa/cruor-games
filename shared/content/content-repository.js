import { CRUOR_INSPIRATION_MODULES, buildInspirationModulesFromRegistry } from "./inspiration-modules.js";
import {
  STATIC_CONTENT_PACK_PROVENANCE,
  STATIC_CONTENT_PACKS,
  STATIC_CONTENT_PACK_ISSUES,
  STATIC_CONTENT_PACK_SUMMARY,
  STATIC_CONTENT_REGISTRY,
} from "./static-registry.js";

export function getStaticContentRegistry() {
  return STATIC_CONTENT_REGISTRY;
}

export function getStaticContentPackProvenance() {
  return STATIC_CONTENT_PACK_PROVENANCE;
}

export function getStaticContentPackSummaries() {
  return STATIC_CONTENT_PACKS.map((pack) => ({
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

export function getStaticInspirationModules({ includeRegistryFallback = true } = {}) {
  if (!includeRegistryFallback) return CRUOR_INSPIRATION_MODULES;

  return buildInspirationModulesFromRegistry(getStaticContentRegistry(), {
    packId: "static-cruor-registry",
  });
}

export function getStaticContentPackIssues() {
  return STATIC_CONTENT_PACK_ISSUES;
}

export function getStaticContentPackSummary() {
  return STATIC_CONTENT_PACK_SUMMARY;
}

export async function loadContentRegistry() {
  return getStaticContentRegistry();
}

export async function loadContentPackProvenance() {
  return getStaticContentPackProvenance();
}

export async function loadContentPackSummaries() {
  return getStaticContentPackSummaries();
}

export async function loadInspirationModules() {
  return getStaticInspirationModules();
}
