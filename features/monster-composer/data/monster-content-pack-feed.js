import {
  getStaticContentPackProvenance,
  getStaticContentRegistry,
} from "../../../shared/content/content.index.js";
import { MONSTER_GRAFTS } from "./monster-grafts.js";
import { MONSTER_SOURCES } from "./monster-sources.js";

const DEFAULT_PACK_TITLE = "Content Pack";
const DEFAULT_GRAFT_SECTION = "trait";
const MONSTER_WORKFLOW_ID = "monster-composer";
const MONSTER_GRAFT_CONTENT_TYPE = "monster-graft";

export const CORE_MONSTER_FEED_META = {
  id: "core-cruor",
  title: "Core Monster Composer",
};

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeStringArray(value) {
  return asArray(value)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function uniqueArray(values) {
  return [...new Set(normalizeStringArray(values))];
}

function getPrimarySlot(component) {
  return component?.monster?.slot || component?.slots?.[0] || "";
}

function getPrimarySourceAnchor(component) {
  return component?.sourceAnchors?.[0] || "";
}

function getContentPackMeta(contentPack = {}) {
  return {
    id: contentPack.id || contentPack.packId || "content-pack",
    title: contentPack.title || contentPack.label || DEFAULT_PACK_TITLE,
  };
}

function getRegistryPackMeta(collectionName, entry) {
  const provenance = getStaticContentPackProvenance();
  return getContentPackMeta(provenance.getPrimaryPackForEntry(collectionName, entry) || {});
}

export function sharedComponentToMonsterGraft(component, contentPack = {}) {
  const pack = getContentPackMeta(contentPack);
  const monster = component?.monster || {};
  const sourceAnchors = normalizeStringArray(component?.sourceAnchors);
  const slot = monster.slot || getPrimarySlot(component);

  return {
    id: monster.graftId || component.id,
    title: component.title || component.label || monster.graftId || component.id,
    slot,
    section: monster.section || DEFAULT_GRAFT_SECTION,
    source: sourceAnchors[0] || getPrimarySourceAnchor(component),
    sourceAnchors,
    sourceTypes: normalizeStringArray(component.sourceTypes),
    themes: normalizeStringArray(component.themes),
    motifs: normalizeStringArray(component.motifs),
    contexts: normalizeStringArray(component.contexts),
    horror: normalizeStringArray(component.horror),
    typeBias: normalizeStringArray(monster.typeBias),
    roleBias: normalizeStringArray(monster.roleBias),
    cost: Number(monster.cost || 0),
    complexity: Number(monster.complexity || 0),
    stats: { ...(monster.stats || {}) },
    rules: monster.rules || component.rules || null,
    constraints: monster.constraints || component.anatomyConstraints || component.constraints || null,
    summary: component.summary || "",
    mechanics: component.mechanics || component.tableText || "",
    counterplay: component.counterplay || "",
    contentPack: pack,
    registry: {
      componentId: component.id,
      contentType: component.contentType || MONSTER_GRAFT_CONTENT_TYPE,
    },
  };
}

export function sourceAnchorToMonsterSource(sourceAnchor, contentPack = {}) {
  const pack = getContentPackMeta(contentPack);
  const tags = uniqueArray([
    ...(sourceAnchor.sourceTypes || []),
    ...(sourceAnchor.horror || []),
    ...(sourceAnchor.themes || []),
  ]).slice(0, 6);

  return {
    id: sourceAnchor.id,
    label: sourceAnchor.label || sourceAnchor.title || sourceAnchor.id,
    tags,
    summary: sourceAnchor.summary || "",
    contentPack: pack,
    registry: {
      sourceAnchorId: sourceAnchor.id,
      contentType: "source-anchor",
    },
  };
}

export function buildMonsterGraftsFromSharedComponents(components = [], contentPack = {}) {
  return asArray(components)
    .filter((component) => component?.contentType === MONSTER_GRAFT_CONTENT_TYPE)
    .map((component) => sharedComponentToMonsterGraft(component, contentPack))
    .filter((graft) => graft.id && graft.slot && graft.source);
}

export function buildMonsterSourcesFromSourceAnchors(sourceAnchors = [], contentPack = {}) {
  return asArray(sourceAnchors)
    .map((sourceAnchor) => sourceAnchorToMonsterSource(sourceAnchor, contentPack))
    .filter((source) => source.id && source.label);
}

function withContentPackMeta(entry, contentPack = CORE_MONSTER_FEED_META) {
  if (!entry) return entry;
  if (entry.contentPack?.id) return entry;
  return { ...entry, contentPack };
}

export function mergeMonsterSources(baseSources = [], contentPackSources = []) {
  const seen = new Set();
  return [...baseSources, ...contentPackSources].filter((source) => {
    if (!source?.id || seen.has(source.id)) return false;
    seen.add(source.id);
    return true;
  });
}

export function mergeMonsterGrafts(baseGrafts = [], contentPackGrafts = []) {
  const seen = new Set();
  return [...baseGrafts, ...contentPackGrafts].filter((graft) => {
    if (!graft?.id || seen.has(graft.id)) return false;
    seen.add(graft.id);
    return true;
  });
}

function getRegistryMonsterComponents() {
  return getStaticContentRegistry().getComponents({
    workflow: MONSTER_WORKFLOW_ID,
    contentType: MONSTER_GRAFT_CONTENT_TYPE,
  });
}

function getRegistryMonsterSourceAnchors(monsterComponents = getRegistryMonsterComponents()) {
  const sourceAnchorIds = new Set(
    monsterComponents.flatMap((component) => normalizeStringArray(component.sourceAnchors)),
  );

  return getStaticContentRegistry()
    .getSourceAnchors({ workflow: MONSTER_WORKFLOW_ID })
    .filter((sourceAnchor) => sourceAnchorIds.has(sourceAnchor.id));
}

export const CORE_MONSTER_SOURCES = MONSTER_SOURCES.map((source) =>
  withContentPackMeta(source, CORE_MONSTER_FEED_META),
);

export const CORE_MONSTER_GRAFTS = MONSTER_GRAFTS.map((graft) =>
  withContentPackMeta(graft, CORE_MONSTER_FEED_META),
);

export const CONTENT_PACK_MONSTER_COMPONENTS = getRegistryMonsterComponents();

export const CONTENT_PACK_MONSTER_SOURCES = getRegistryMonsterSourceAnchors(
  CONTENT_PACK_MONSTER_COMPONENTS,
).map((sourceAnchor) => sourceAnchorToMonsterSource(sourceAnchor, getRegistryPackMeta("sourceAnchors", sourceAnchor)));

export const CONTENT_PACK_MONSTER_GRAFTS = CONTENT_PACK_MONSTER_COMPONENTS.map((component) =>
  sharedComponentToMonsterGraft(component, getRegistryPackMeta("components", component)),
).filter((graft) => graft.id && graft.slot && graft.source);

export const ALL_MONSTER_SOURCES = mergeMonsterSources(
  CONTENT_PACK_MONSTER_SOURCES,
  CORE_MONSTER_SOURCES,
);

export const ALL_MONSTER_GRAFTS = mergeMonsterGrafts(
  CONTENT_PACK_MONSTER_GRAFTS,
  CORE_MONSTER_GRAFTS,
);

export const MONSTER_CONTENT_PACK_FEED_SUMMARY = Object.freeze({
  coreSources: CORE_MONSTER_SOURCES.length,
  coreGrafts: CORE_MONSTER_GRAFTS.length,
  contentPackSources: CONTENT_PACK_MONSTER_SOURCES.length,
  contentPackGrafts: CONTENT_PACK_MONSTER_GRAFTS.length,
  totalSources: ALL_MONSTER_SOURCES.length,
  totalGrafts: ALL_MONSTER_GRAFTS.length,
});
