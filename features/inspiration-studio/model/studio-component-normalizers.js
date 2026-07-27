import {
  MONSTER_FAMILY_PROFILE_OPTIONS,
  evaluateMonsterAnatomyConstraints,
  getEffectiveMonsterAnatomyProfile,
  normalizeMonsterAnatomyConstraints,
  normalizeMonsterAnatomyGrants,
  summarizeMonsterAnatomyConstraints,
  summarizeMonsterAnatomyGrants,
} from "../../monster-composer/model/anatomy.js";
import {
  summarizeMonsterFrameFit,
} from "../../monster-composer/model/monster-frame-fit.js";
import {
  isMonsterGraftV2,
  validateMonsterGraftV2,
} from "../../monster-composer/model/monster-graft-v2.schema.js";


export const MONSTER_GRAFT_V2_PAYLOAD_FIELDS = Object.freeze([
  "graftSchemaVersion",
  "schemaVersion",
  "kind",
  "identity",
  "abilities",
  "routine",
  "progression",
  "modifiers",
  "compatibility",
  "hooks",
  "migration",
  "balanceProfile",
  "pressureProfile",
  "complexityProfile",
  "counterplayProfile",
  "spikeRiskProfile",
  "authoring",
]);

function copyDefinedFields(source = {}, fields = []) {
  return fields.reduce((output, field) => {
    if (source?.[field] !== undefined && source?.[field] !== null) {
      output[field] = clone(source[field]);
    }
    return output;
  }, {});
}

export function getStudioMonsterPayload(component = {}) {
  const semanticMonster = component.semantic?.details?.monster;
  const generationMonster = component.generation?.monster;
  const directMonster = component.monster;
  const legacyFields = copyDefinedFields(component, MONSTER_GRAFT_V2_PAYLOAD_FIELDS);
  if (component.schemaVersion !== "monster-graft-v2.0") {
    delete legacyFields.schemaVersion;
  }
  const merged = isPlainObject(directMonster)
    ? clone(directMonster)
    : {
        ...legacyFields,
        ...(isPlainObject(generationMonster) ? clone(generationMonster) : {}),
        ...(isPlainObject(semanticMonster) ? clone(semanticMonster) : {}),
      };

  const graftId = merged.graftId || component.id || component.legacyId || "";
  const slot = merged.slot || component.slot || asArray(component.slots)[0] || "";
  const section = merged.section || component.section || merged.rules?.section || "";

  return {
    ...merged,
    ...(graftId ? { graftId } : {}),
    ...(slot ? { slot } : {}),
    ...(section ? { section } : {}),
  };
}

export function isStudioMonsterGraftV2(component = {}) {
  return isMonsterGraftV2(buildMonsterRulesFeature(component, getExplicitMonsterRules(component)));
}

export function getStudioMonsterGraftValidation(component = {}) {
  const feature = buildMonsterRulesFeature(component, getExplicitMonsterRules(component));
  return validateMonsterGraftV2(feature);
}

export const COMPONENT_TYPE_LABELS = Object.freeze({
  "monster-graft": "Monster Graft",
  "location-component": "Location Component",
  "location-region": "Location Region",
  "semantic-location-component": "Semantic Location Component",
  "semantic-component": "Semantic Component",
});

export const COMPONENT_TYPE_ICONS = Object.freeze({
  "monster-graft": "fa-skull",
  "location-component": "fa-map-location-dot",
  "location-region": "fa-dungeon",
});

export const STATUS_OPTIONS = Object.freeze([
  {
    id: "draft",
    label: "Draft",
    icon: "fa-pen-ruler",
    description: "Use while the module is being structured, reviewed, or playtested.",
  },
  {
    id: "pending-review",
    label: "Pending Review",
    icon: "fa-clock-rotate-left",
    description:
      "Use while the card remains visible in the public archive but its Dossier has not yet been editorially reviewed.",
  },
  {
    id: "in-review",
    label: "In Review",
    icon: "fa-magnifying-glass",
    description: "Use while the v2 module is undergoing editorial and semantic review.",
  },
  {
    id: "published",
    label: "Published",
    icon: "fa-circle-check",
    description: "Use when the module is approved for the public archive and live generators.",
  },
  {
    id: "retired",
    label: "Retired",
    icon: "fa-box-archive",
    description: "Use when the module should remain available for reference but no longer be treated as active content.",
  },
]);

export function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

export function splitList(value) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinList(value) {
  return asArray(value).join(", ");
}

export function getEntryId(entry) {
  return String(entry?.id || entry?.slug || "").trim();
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

export function countById(items = []) {
  return asArray(items).reduce((counts, item) => {
    const id = getEntryId(item);
    if (!id) return counts;
    counts.set(id, (counts.get(id) || 0) + 1);
    return counts;
  }, new Map());
}

export function getDuplicateIds(items = []) {
  return [...countById(items)].filter(([, count]) => count > 1).map(([id]) => id);
}

export function normalizeStatus(value) {
  const normalizedValue = value === "archived" ? "retired" : value;
  return STATUS_OPTIONS.some((option) => option.id === normalizedValue)
    ? normalizedValue
    : "draft";
}

export function formatPlainLabel(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function hasText(value) {
  return String(value || "").trim().length > 0;
}

export function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "new-inspiration";
}

export function getMonsterConstraintSource(component = {}) {
  const monster = getStudioMonsterPayload(component);
  return monster.constraints || component.anatomyConstraints || component.constraints || null;
}

export function getMonsterConstraintSummary(component = {}) {
  return summarizeMonsterAnatomyConstraints(getMonsterConstraintSource(component));
}

export function getMonsterGrantSource(component = {}) {
  const monster = getStudioMonsterPayload(component);
  return monster.anatomyGrants || monster.grants || component.anatomyGrants || null;
}

export function getMonsterGrantSummary(component = {}) {
  return summarizeMonsterAnatomyGrants(getMonsterGrantSource(component));
}

export function getMonsterFrameFitSource(component = {}) {
  const monster = getStudioMonsterPayload(component);
  return monster.fit || component.fit || component.frameFit || null;
}

export function getMonsterFrameFitSummary(component = {}) {
  return summarizeMonsterFrameFit(getMonsterFrameFitSource(component));
}

export function getExplicitMonsterRules(component = {}) {
  const monsterRules = getStudioMonsterPayload(component).rules;
  if (isPlainObject(monsterRules) && Object.keys(monsterRules).length) return monsterRules;
  if (isPlainObject(component.rules) && Object.keys(component.rules).length) return component.rules;
  return null;
}

export function buildMonsterRulesFeature(component = {}, explicitRules = null) {
  const monster = getStudioMonsterPayload(component);
  const graftSchemaVersion = monster.graftSchemaVersion || monster.schemaVersion || "";
  const feature = {
    ...copyDefinedFields(monster, MONSTER_GRAFT_V2_PAYLOAD_FIELDS),
    ...(graftSchemaVersion ? {
      schemaVersion: graftSchemaVersion,
      graftSchemaVersion,
    } : {}),
    id: monster.graftId || component.id,
    title: component.title || component.label || monster.graftId || component.id,
    slot: monster.slot || asArray(component.slots)[0],
    section: monster.section || explicitRules?.section || "trait",
    source: asArray(component.sourceAnchors)[0],
    sourceAnchors: asArray(component.sourceAnchors),
    typeBias: asArray(monster.typeBias),
    roleBias: asArray(monster.roleBias),
    cost: Number(monster.cost || 0),
    complexity: Number(monster.complexity || 0),
    stats: monster.stats || {},
    balanceProfile: monster.balanceProfile || monster.balance || null,
    summary: component.summary || "",
    mechanics: component.mechanics || component.tableText || "",
    counterplay: component.counterplay || "",
    constraints: getMonsterConstraintSource(component),
    anatomyGrants: getMonsterGrantSource(component),
    fit: getMonsterFrameFitSource(component),
  };
  if (explicitRules) feature.rules = explicitRules;
  return feature;
}

export function buildStudioCompatibilityMatrix(component = {}) {
  if (component.contentType !== "monster-graft") return [];
  const feature = buildMonsterRulesFeature(component, getExplicitMonsterRules(component));
  return MONSTER_FAMILY_PROFILE_OPTIONS.map((profileOption) => {
    const category = asArray(profileOption.categories)[0] || profileOption.label;
    const profile = getEffectiveMonsterAnatomyProfile(profileOption.typeId, category, null, []);
    const status = evaluateMonsterAnatomyConstraints(feature, {
      typeId: profileOption.typeId,
      category,
      profile,
    });
    return {
      id: profileOption.id,
      label: profileOption.label,
      typeId: profileOption.typeId,
      status,
    };
  });
}

export function normalizeMonsterConstraintData(component = {}) {
  return normalizeMonsterAnatomyConstraints(getMonsterConstraintSource(component));
}

export function normalizeMonsterGrantData(component = {}) {
  return normalizeMonsterAnatomyGrants(getMonsterGrantSource(component));
}
