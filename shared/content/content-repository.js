import { STATIC_CONTENT_REPOSITORY } from "./content-repository.adapter.js";

export function getStaticContentRegistry() {
  return STATIC_CONTENT_REPOSITORY.getRegistry();
}

export function getStaticContentPackProvenance() {
  return STATIC_CONTENT_REPOSITORY.getPackProvenance();
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

export async function loadContentRegistry() {
  return STATIC_CONTENT_REPOSITORY.loadRegistry();
}

export async function loadContentPackProvenance() {
  return STATIC_CONTENT_REPOSITORY.loadPackProvenance();
}

export async function loadContentPackSummaries() {
  return STATIC_CONTENT_REPOSITORY.loadPackSummaries();
}

export async function loadInspirationModules() {
  return STATIC_CONTENT_REPOSITORY.loadInspirationModules();
}
