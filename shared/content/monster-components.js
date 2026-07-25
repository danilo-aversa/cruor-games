import { MONSTER_GRAFTS } from "../../features/monster-composer/data/monster-grafts.js";
import { normalizeMonsterGraftRules } from "../../features/monster-composer/model/monster-graft-rules.schema.js";
import { normalizeSourceAnchorIds } from "./source-anchors.js";

const MONSTER_COMPONENT_WORKFLOW_ID = "monster-composer";
const MONSTER_COMPONENT_TYPE = "Monster Component";
const MONSTER_GRAFT_CONTENT_TYPE = "monster-graft";
const ARCHIVED_PROTOTYPE_SOURCE_ANCHOR_IDS = new Set(["gashadokuro", "jack-the-ripper"]);
const MONSTER_COMPONENT_ADAPTER_VERSION = "monster-component-adapter-v2.0";
const MONSTER_GRAFT_AUTHORING_SCHEMA_VERSION = "monster-graft-authoring-v1.0";

const GRAFT_V2_OPTIONAL_FIELDS = Object.freeze([
  "kind",
  "identity",
  "abilities",
  "routine",
  "modifiers",
  "compatibility",
  "hooks",
  "migration",
  "pressureProfile",
  "complexityProfile",
  "counterplayProfile",
  "spikeRiskProfile",
]);

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeStringArray(value) {
  return asArray(value)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function copyDefinedFields(source = {}, fields = []) {
  return fields.reduce((output, field) => {
    if (source[field] !== undefined && source[field] !== null) {
      output[field] = source[field];
    }
    return output;
  }, {});
}

function buildMonsterGraftV2Fields(graft = {}) {
  const schemaVersion = graft.schemaVersion || graft.graftSchemaVersion || "";
  return {
    ...(schemaVersion ? { graftSchemaVersion: schemaVersion } : {}),
    ...copyDefinedFields(graft, GRAFT_V2_OPTIONAL_FIELDS),
  };
}

function buildMonsterGraftAuthoring(graft = {}) {
  const configured = graft.authoring || graft.monster?.authoring || {};
  return {
    schemaVersion:
      configured.schemaVersion || MONSTER_GRAFT_AUTHORING_SCHEMA_VERSION,
    origin: configured.origin || "native-adapter",
    canonical: configured.canonical === true,
    adapterVersion: MONSTER_COMPONENT_ADAPTER_VERSION,
    sourcePath:
      configured.sourcePath ||
      "features/monster-composer/data/monster-grafts.js",
    migrationStatus: configured.migrationStatus || "legacy-native",
  };
}

function normalizeMonsterGraftSourceAnchors(graft) {
  return normalizeSourceAnchorIds(graft.sourceAnchors?.length ? graft.sourceAnchors : graft.source);
}

function referencesArchivedPrototypeSource(graft) {
  return normalizeMonsterGraftSourceAnchors(graft).some((sourceAnchorId) =>
    ARCHIVED_PROTOTYPE_SOURCE_ANCHOR_IDS.has(sourceAnchorId),
  );
}

function getStructuredMonsterRules(graft) {
  const rules = graft.rules || normalizeMonsterGraftRules(graft);
  if (!rules) return null;

  return {
    ...rules,
    migration: {
      ...(rules.migration || {}),
      source: graft.rules ? rules.migration?.source || "explicit-rules" : "legacy-mechanics-persisted",
      isStructured: true,
      generatedFrom: graft.rules ? rules.migration?.generatedFrom : "mechanics-counterplay-inference",
    },
  };
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
  const rules = getStructuredMonsterRules(graft);

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
      balanceProfile: graft.balanceProfile || graft.balance || null,
      fit: graft.fit || graft.monster?.fit || null,
      rules,
      constraints: graft.constraints || graft.anatomyConstraints || null,
      anatomyGrants: graft.anatomyGrants || null,
      authoring: buildMonsterGraftAuthoring(graft),
      ...buildMonsterGraftV2Fields(graft),
    },
    rules,
    fit: graft.fit || graft.monster?.fit || null,
    anatomyConstraints: graft.constraints || graft.anatomyConstraints || null,
    anatomyGrants: graft.anatomyGrants || null,
    tags: buildMonsterComponentTags(graft),
  };
}

export function buildSharedMonsterComponents(grafts = MONSTER_GRAFTS) {
  return grafts.filter((graft) => !referencesArchivedPrototypeSource(graft)).map(monsterGraftToSharedComponent);
}

export const SHARED_MONSTER_COMPONENTS = buildSharedMonsterComponents();
