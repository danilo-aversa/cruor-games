import { STATIC_CONTENT_REPOSITORY } from "./content-repository.adapter.js";

export function getStaticContentRegistry(options = {}) {
  return STATIC_CONTENT_REPOSITORY.getRegistry(options);
}

export function getStaticContentPackProvenance() {
  return STATIC_CONTENT_REPOSITORY.getPackProvenance();
}


export function getStaticContentCollisionReport() {
  return STATIC_CONTENT_REPOSITORY.getCollisionReport();
}

export function getStaticLegacyMigrationReport() {
  return STATIC_CONTENT_REPOSITORY.getLegacyMigrationReport();
}

export function getStaticContentPackSummaries() {
  return STATIC_CONTENT_REPOSITORY.getPackSummaries();
}

export function getStaticInspirationModules(options = {}) {
  return STATIC_CONTENT_REPOSITORY.getInspirationModules(options);
}

export function getStaticContentPackIssues() {
  return STATIC_CONTENT_REPOSITORY.getPackIssues();
}

export function getStaticContentPackSummary() {
  return STATIC_CONTENT_REPOSITORY.getPackSummary();
}

export function getDarkPlacesSemanticModuleReference(selection = {}) {
  return STATIC_CONTENT_REPOSITORY.getDarkPlacesSemanticModuleReference(
    selection,
  );
}

export function resolveDarkPlacesRuntimeContent(input = {}) {
  return STATIC_CONTENT_REPOSITORY.resolveDarkPlacesRuntimeContent(input);
}

export async function loadContentRegistry(options = {}) {
  return STATIC_CONTENT_REPOSITORY.loadRegistry(options);
}

export async function loadContentPackProvenance() {
  return STATIC_CONTENT_REPOSITORY.loadPackProvenance();
}


export async function loadContentCollisionReport() {
  return STATIC_CONTENT_REPOSITORY.loadCollisionReport();
}

export async function loadLegacyMigrationReport() {
  return STATIC_CONTENT_REPOSITORY.loadLegacyMigrationReport();
}

export async function loadContentPackSummaries() {
  return STATIC_CONTENT_REPOSITORY.loadPackSummaries();
}

export async function loadInspirationModules(options = {}) {
  return STATIC_CONTENT_REPOSITORY.loadInspirationModules(options);
}
