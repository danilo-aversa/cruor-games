import { MONSTER_GRAFTS } from "../../features/monster-composer/data/monster-grafts.js";
import { normalizeSourceAnchorIds } from "./source-anchors.js";

const MONSTER_COMPONENT_WORKFLOW_ID = "monster-composer";
const MONSTER_COMPONENT_TYPE = "Monster Component";
const MONSTER_GRAFT_CONTENT_TYPE = "monster-graft";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeStringArray(value) {
  return asArray(value)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function normalizeMonsterGraftSourceAnchors(graft) {
  return normalizeSourceAnchorIds(graft.sourceAnchors?.length ? graft.sourceAnchors : graft.source);
}

function buildMonsterComponentTags(graft) {
  return [
    ...normalizeStringArray(graft.tags),
    ...normalizeStringArray(graft.typeBias).map((typeId) => `type:${typeId}`),
    ...normalizeStringArray(graft.roleBias).map((roleId) => `role:${roleId}`),
    graft.section ? `section:${graft.section}` : null,
    graft.slot ? `slot:${graft.slot}` : null,
  ].filter(Boolean);
}

export function monsterGraftToSharedComponent(graft) {
  const sourceAnchors = normalizeMonsterGraftSourceAnchors(graft);

  return {
    id: graft.id,
    legacyId: graft.id,
    title: graft.title,
    label: graft.title,
    type: MONSTER_COMPONENT_TYPE,
    contentType: MONSTER_GRAFT_CONTENT_TYPE,
    status: graft.status || "published",
    workflows: [MONSTER_COMPONENT_WORKFLOW_ID],
    slots: normalizeStringArray(graft.slot),
    sourceAnchors,
    sourceTypes: normalizeStringArray(graft.sourceTypes),
    themes: normalizeStringArray(graft.themes),
    motifs: normalizeStringArray(graft.motifs),
    contexts: normalizeStringArray(graft.contexts),
    horror: normalizeStringArray(graft.horror),
    summary: graft.summary || "",
    tableText: graft.mechanics || "",
    mechanics: graft.mechanics || "",
    counterplay: graft.counterplay || "",
    monster: {
      graftId: graft.id,
      slot: graft.slot,
      section: graft.section || "trait",
      typeBias: normalizeStringArray(graft.typeBias),
      roleBias: normalizeStringArray(graft.roleBias),
      cost: Number(graft.cost || 0),
      complexity: Number(graft.complexity || 0),
      stats: graft.stats || {},
      rules: graft.rules || null,
    },
    rules: graft.rules || null,
    tags: buildMonsterComponentTags(graft),
  };
}

export function buildSharedMonsterComponents(grafts = MONSTER_GRAFTS) {
  return grafts.map(monsterGraftToSharedComponent);
}

export const SHARED_MONSTER_COMPONENTS = buildSharedMonsterComponents();
