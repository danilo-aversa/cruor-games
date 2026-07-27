import {
  MONSTER_GRAFT_RULES_SCHEMA_VERSION,
  normalizeMonsterGraftRules,
} from "../../monster-composer/model/monster-graft-rules.schema.js";
import {
  MONSTER_GRAFT_V2_SCHEMA_VERSION,
  normalizeMonsterGraftV2,
  validateMonsterGraftV2,
} from "../../monster-composer/model/monster-graft-v2.schema.js";
import { buildMonsterAbilityBundleFromGraft } from "../../monster-composer/model/monster-ability-model.js";
import { renderStructuredRulesTemplate } from "../../monster-composer/model/monster-graft-rules.render.js";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function cloneJson(value, fallback = null) {
  if (value === undefined || value === null) return fallback;
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function slugify(value, fallback = "ability") {
  return (
    cleanString(value)
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

function uniqueId(baseId, existingIds = []) {
  const existing = new Set(asArray(existingIds).map(cleanString));
  const base = slugify(baseId);
  if (!existing.has(base)) return base;
  let index = 2;
  while (existing.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

function titleFromId(value) {
  return cleanString(value)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const STUDIO_GRAFT_KIND_BY_SLOT = Object.freeze({
  body: "traitBundle",
  mind: "traitBundle",
  movement: "movementPattern",
  attack: "attackPattern",
  horror: "horrorFeature",
  twist: "combatTwist",
  weakness: "weakness",
  death: "deathEffect",
  lair: "lairEffect",
});

export const STUDIO_GRAFT_SECTION_BY_SLOT = Object.freeze({
  body: "trait",
  mind: "trait",
  movement: "bonusAction",
  attack: "action",
  horror: "trait",
  twist: "reaction",
  weakness: "trait",
  death: "death",
  lair: "lairAction",
});

export const STUDIO_GRAFT_ACTION_ECONOMY_BY_SECTION = Object.freeze({
  trait: "passive",
  action: "action",
  bonusAction: "bonusAction",
  reaction: "reaction",
  legendaryAction: "legendaryAction",
  lairAction: "lairAction",
  death: "deathTrigger",
});

function getDefaultUsage(section) {
  if (section === "trait") return { type: "passive" };
  if (section === "death") return { type: "death" };
  if (section === "lairAction") return { type: "lair" };
  return { type: "atWill" };
}

function getDefaultTargeting(section) {
  if (["trait", "bonusAction"].includes(section)) {
    return { type: "self", targets: "the monster" };
  }
  if (section === "lairAction") {
    return { type: "area", shape: "scene", targets: "creatures in the lair" };
  }
  if (section === "death") {
    return {
      type: "area",
      shape: "radius",
      size: 10,
      unit: "ft",
      targets: "creatures in the area",
    };
  }
  return { type: "single", targets: "one target" };
}

function getDefaultResolution(section) {
  if (section === "action") {
    return {
      type: "attackRoll",
      attackType: "melee",
      bonus: "monster",
      abilityBasis: "strength",
      reach: "5 ft.",
    };
  }
  if (["death", "lairAction"].includes(section)) {
    return { type: "savingThrow", ability: "constitution", dc: "monster" };
  }
  return { type: "none" };
}

function getDefaultDamage(section) {
  if (section === "action") {
    return {
      mode: "budget",
      budgetRole: "mainAttack",
      scale: "standard",
      types: ["bludgeoning"],
      budgetShare: null,
      expectedTargets: null,
      parts: [],
    };
  }
  if (section === "death") {
    return {
      mode: "budget",
      budgetRole: "deathBurst",
      scale: "standard",
      types: ["necrotic"],
      budgetShare: null,
      expectedTargets: 1.75,
      parts: [],
    };
  }
  return {
    mode: "none",
    budgetRole: "none",
    scale: "standard",
    types: [],
    budgetShare: null,
    expectedTargets: null,
    parts: [],
  };
}

export function createStudioGraftAbility({
  id = "ability",
  title = "New Ability",
  slot = "attack",
  section = "action",
  role = "primary",
  summary = "",
  mechanics = "",
  counterplay = "",
  rules = null,
} = {}) {
  const resolvedSection = cleanString(section) || "action";
  return {
    id: slugify(id || title),
    title: cleanString(title) || titleFromId(id) || "New Ability",
    section: resolvedSection,
    role,
    availability: "always",
    maxUses: role === "primary" ? 2 : 1,
    summary: cleanString(summary),
    mechanics: cleanString(mechanics),
    counterplay: cleanString(counterplay),
    tags: [],
    authored: true,
    rules: normalizeMonsterGraftRules({
      id: slugify(id || title),
      title: cleanString(title) || "New Ability",
      slot: cleanString(slot) || "attack",
      section: resolvedSection,
      mechanics,
      counterplay,
      rules: {
        schemaVersion: MONSTER_GRAFT_RULES_SCHEMA_VERSION,
        section: resolvedSection,
        actionEconomy:
          STUDIO_GRAFT_ACTION_ECONOMY_BY_SECTION[resolvedSection] || "passive",
        usage: getDefaultUsage(resolvedSection),
        trigger:
          resolvedSection === "death"
            ? "When the monster is reduced to 0 Hit Points."
            : null,
        resolution: getDefaultResolution(resolvedSection),
        secondaryResolution: null,
        targeting: getDefaultTargeting(resolvedSection),
        areaEffect: null,
        damage: getDefaultDamage(resolvedSection),
        condition: null,
        counterplay: {
          telegraph: true,
          breakCondition: true,
          positioningAnswer: false,
          nonDamageAnswer: false,
        },
        text: {},
        multiattack: null,
        multiattackParticipation: null,
        spellcasting: null,
        defense: null,
        summon: null,
        procedure: null,
        references: [],
        ongoing: null,
        effects: [],
        parity: {
          status: "unreviewed",
          notes: "Authored in Content Studio.",
        },
        migration: {
          source: "content-studio-graft-authoring",
          isStructured: true,
        },
        ...(isPlainObject(rules) ? cloneJson(rules, {}) : {}),
      },
    }),
  };
}

export function createStudioGraftProgression(abilityIds = [], { kind = "attackPattern" } = {}) {
  const ids = asArray(abilityIds).map(cleanString).filter(Boolean);
  if (!ids.length) return null;
  const primary = ids[0];
  if (kind !== "attackPattern") {
    return {
      schemaVersion: "monster-graft-progression-v1.0",
      basis: "targetCr",
      bands: [
        {
          id: "cr-0-30",
          minCr: 0,
          maxCr: 30,
          abilityIds: ids,
          defaultSequence: ids.slice(0, 1),
          opener: [],
          abilityPatches: {},
          graftPatch: null,
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
      ],
    };
  }
  return {
    schemaVersion: "monster-attack-pattern-progression-v1.0",
    basis: "targetCr",
    bands: [
      {
        id: "cr-0-1",
        minCr: 0,
        maxCr: 1,
        abilityIds: [primary],
        defaultSequence: [primary],
        opener: [],
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      },
      {
        id: "cr-2-4",
        minCr: 2,
        maxCr: 4,
        abilityIds: ids,
        defaultSequence: [primary, primary],
        opener: [],
        multiattack: { enabled: true, mode: "fixed", count: 2 },
      },
      {
        id: "cr-5-8",
        minCr: 5,
        maxCr: 8,
        abilityIds: ids,
        defaultSequence: [primary, primary],
        opener: [],
        multiattack: { enabled: true, mode: "fixed", count: 2 },
      },
      {
        id: "cr-9-30",
        minCr: 9,
        maxCr: 30,
        abilityIds: ids,
        defaultSequence: [primary, primary, primary],
        opener: [],
        multiattack: { enabled: true, mode: "fixed", count: 3 },
      },
    ],
  };
}

function getDefaultIdentity(title, summary, slot) {
  const resolvedTitle = cleanString(title) || "New Graft";
  const resolvedSummary = cleanString(summary);
  return {
    fantasy:
      resolvedSummary ||
      `${resolvedTitle} gives the monster a recognizable table-facing behavior.`,
    tacticalRole:
      slot === "attack"
        ? "authored attack pattern"
        : `${titleFromId(slot || "monster")} contribution`,
    signature: resolvedTitle,
    recognitionTags: [
      slugify(resolvedTitle),
      `${slot || "monster"}-graft`,
      "content-studio-authored",
    ],
  };
}

export function buildStudioGraftPayloadFromTemplate(template = {}) {
  const slot = cleanString(template.slot) || "body";
  const section =
    cleanString(template.section) || STUDIO_GRAFT_SECTION_BY_SLOT[slot] || "trait";
  const kind = STUDIO_GRAFT_KIND_BY_SLOT[slot] || "composite";
  const title = cleanString(template.title) || "New Monster Graft";
  const abilityId = slugify(title.replace(/^new\s+/i, ""), "ability");
  const templateDamage = isPlainObject(template.damage)
    ? {
        ...cloneJson(template.damage, {}),
        mode: template.damage.mode === "budgeted" ? "budget" : template.damage.mode,
      }
    : null;
  const templateResolution = isPlainObject(template.resolution)
    ? {
        ...cloneJson(template.resolution, {}),
        abilityBasis:
          template.resolution.abilityBasis ||
          (template.resolution.basis === "monsterAttack" ? "monster" : template.resolution.basis),
      }
    : null;
  if (templateResolution) delete templateResolution.basis;
  const ability = createStudioGraftAbility({
    id: abilityId,
    title: title.replace(/^New\s+/i, ""),
    slot,
    section,
    role: "primary",
    summary: template.summary,
    mechanics: template.mechanics,
    counterplay: template.counterplay,
    rules: {
      section,
      actionEconomy:
        cleanString(template.actionEconomy) ||
        STUDIO_GRAFT_ACTION_ECONOMY_BY_SECTION[section] ||
        "passive",
      usage: isPlainObject(template.usage) ? cloneJson(template.usage, {}) : getDefaultUsage(section),
      trigger: cleanString(template.trigger) || null,
      resolution: templateResolution || getDefaultResolution(section),
      targeting: isPlainObject(template.targeting)
        ? cloneJson(template.targeting, {})
        : getDefaultTargeting(section),
      damage: templateDamage || getDefaultDamage(section),
    },
  });
  const attackPattern = kind === "attackPattern";
  const authoredRoutine = new Set([
    "movementPattern",
    "horrorFeature",
    "combatTwist",
    "deathEffect",
    "lairEffect",
  ]).has(kind);

  return {
    graftSchemaVersion: MONSTER_GRAFT_V2_SCHEMA_VERSION,
    schemaVersion: MONSTER_GRAFT_V2_SCHEMA_VERSION,
    kind,
    slot,
    typeBias: [],
    roleBias: [],
    cost: Number(template.cost ?? 1),
    complexity: Number(template.complexity ?? 1),
    stats: {},
    identity: getDefaultIdentity(title, template.summary, slot),
    abilities: [ability],
    routine: attackPattern
      ? {
          mode: "authored",
          defaultPlan:
            cleanString(template.summary) ||
            `Use ${ability.title} as the pattern's default action.`,
          targetSelection: "Choose the target that best matches the ability's range and counterplay.",
          defaultSequence: [ability.id],
          opener: [],
          intentionalRepetition: true,
          repetitionReason: "This draft begins with one authored offensive ability.",
          nonMultiattackReason: "Multiattack is disabled at the lowest CR band.",
          alternatives: [],
          multiattack: {
            enabled: false,
            mode: "fixed",
            count: 0,
            attacks: [{ ref: ability.id, count: 1 }],
            choices: [],
            replacements: [],
          },
        }
      : {
          mode: authoredRoutine ? "single" : "none",
          defaultPlan: authoredRoutine
            ? cleanString(template.summary) || `Use ${ability.title} when its trigger or timing applies.`
            : "",
          targetSelection: authoredRoutine
            ? "Use the targeting and trigger authored for the emitted ability."
            : "",
          defaultSequence: authoredRoutine ? [ability.id] : [],
          opener: [],
          intentionalRepetition: false,
          repetitionReason: "",
          nonMultiattackReason: "",
          alternatives: [],
          multiattack: {
            enabled: false,
            mode: "fixed",
            count: 0,
            attacks: [],
            choices: [],
            replacements: [],
          },
        },
    progression: attackPattern
      ? createStudioGraftProgression([ability.id], { kind })
      : null,
    modifiers: null,
    compatibility: null,
    hooks: null,
    balanceProfile: {
      schemaVersion: "monster-graft-balance-v2.0",
      stats: {},
      authoredIntent: {},
    },
    pressureProfile: { baseline: Math.max(0, Number(template.cost || 1)) },
    complexityProfile: {
      decisionLoad: Math.max(0, Number(template.complexity || 1)),
      sequencing: attackPattern ? 1 : 0,
      conditionalBranches: 0,
      tracking: 0,
    },
    counterplayProfile: {
      telegraphs: [
        cleanString(template.counterplay) ||
          "The graft has a visible tell before its main effect matters.",
      ],
      positioningAnswers: attackPattern
        ? ["Use positioning to deny the pattern's preferred target or approach."]
        : [],
      breakConditions: ["Disrupt the setup or exploit the graft's stated limitation."],
      nonDamageAnswers: [],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 0,
      repeatability: attackPattern ? 1 : 0,
    },
    migration: {
      legacyGraftIds: [],
      status: "studio-authored",
      phase: "content-studio-graft-authoring",
    },
    authoring: {
      origin: "content-studio",
      canonical: true,
      migrationStatus: "studio-authored",
    },
  };
}

export function ensureStudioGraftPayload(component = {}) {
  const direct = isPlainObject(component.monster) ? cloneJson(component.monster, {}) : {};
  const schemaVersion = direct.graftSchemaVersion || direct.schemaVersion;
  if (schemaVersion === MONSTER_GRAFT_V2_SCHEMA_VERSION) {
    return direct;
  }

  const slot = direct.slot || asArray(component.slots)[0] || "body";
  const legacyRules = isPlainObject(direct.rules) ? cloneJson(direct.rules, {}) : null;
  const template = {
    slot,
    section: direct.section || legacyRules?.section || STUDIO_GRAFT_SECTION_BY_SLOT[slot],
    title: component.title || component.label || direct.graftId || component.id,
    summary: component.summary || "",
    mechanics: component.mechanics || component.tableText || "",
    counterplay: component.counterplay || "",
    cost: direct.cost,
    complexity: direct.complexity,
  };
  const payload = buildStudioGraftPayloadFromTemplate(template);
  payload.graftId = direct.graftId || component.id;
  payload.typeBias = asArray(direct.typeBias);
  payload.roleBias = asArray(direct.roleBias);
  payload.stats = cloneJson(direct.stats, {});
  payload.fit = cloneJson(direct.fit || component.fit || component.frameFit, null);
  payload.constraints = cloneJson(
    direct.constraints || component.anatomyConstraints || component.constraints,
    null,
  );
  payload.anatomyGrants = cloneJson(
    direct.anatomyGrants || component.anatomyGrants,
    null,
  );
  if (legacyRules) {
    payload.abilities[0].rules = normalizeMonsterGraftRules({
      id: payload.abilities[0].id,
      title: payload.abilities[0].title,
      slot,
      section: legacyRules.section,
      mechanics: template.mechanics,
      counterplay: template.counterplay,
      rules: legacyRules,
    });
  }
  return payload;
}

export function createUniqueStudioGraftAbility(payload = {}, seed = {}) {
  const existingIds = asArray(payload.abilities).map((ability) => ability.id);
  const id = uniqueId(seed.id || seed.title || "ability", existingIds);
  return createStudioGraftAbility({
    ...seed,
    slot: seed.slot || payload.slot || "attack",
    id,
    title: cleanString(seed.title) || titleFromId(id),
  });
}

function replaceIdInArray(values, oldId, newId) {
  return asArray(values).map((value) => (value === oldId ? newId : value));
}

export function renameStudioGraftAbilityReferences(payload = {}, oldId, newId) {
  const previous = cleanString(oldId);
  const next = cleanString(newId);
  if (!previous || !next || previous === next) return payload;

  const routine = payload.routine || {};
  routine.defaultSequence = replaceIdInArray(routine.defaultSequence, previous, next);
  routine.opener = replaceIdInArray(routine.opener, previous, next);
  routine.alternatives = asArray(routine.alternatives).map((alternative) => ({
    ...alternative,
    sequence: replaceIdInArray(alternative.sequence, previous, next),
  }));
  const multiattack = routine.multiattack || {};
  multiattack.attacks = asArray(multiattack.attacks).map((attack) => ({
    ...attack,
    ref: attack.ref === previous ? next : attack.ref,
  }));
  multiattack.choices = replaceIdInArray(multiattack.choices, previous, next);
  multiattack.replacements = asArray(multiattack.replacements).map((replacement) => ({
    ...replacement,
    with: replacement.with === previous ? next : replacement.with,
  }));
  routine.multiattack = multiattack;
  payload.routine = routine;

  if (payload.progression?.bands) {
    payload.progression.bands = asArray(payload.progression.bands).map((band) => {
      const abilityPatches = isPlainObject(band.abilityPatches)
        ? { ...band.abilityPatches }
        : {};
      if (Object.prototype.hasOwnProperty.call(abilityPatches, previous)) {
        abilityPatches[next] = abilityPatches[previous];
        delete abilityPatches[previous];
      }
      return {
        ...band,
        abilityIds: replaceIdInArray(band.abilityIds, previous, next),
        defaultSequence: replaceIdInArray(band.defaultSequence, previous, next),
        opener: replaceIdInArray(band.opener, previous, next),
        abilityPatches,
      };
    });
  }
  return payload;
}

export function removeStudioGraftAbilityReferences(payload = {}, abilityId) {
  const removed = cleanString(abilityId);
  if (!removed) return payload;
  const keep = (value) => value !== removed;
  const routine = payload.routine || {};
  routine.defaultSequence = asArray(routine.defaultSequence).filter(keep);
  routine.opener = asArray(routine.opener).filter(keep);
  routine.alternatives = asArray(routine.alternatives)
    .map((alternative) => ({
      ...alternative,
      sequence: asArray(alternative.sequence).filter(keep),
    }))
    .filter((alternative) => alternative.sequence.length);
  const multiattack = routine.multiattack || {};
  multiattack.attacks = asArray(multiattack.attacks).filter(
    (attack) => attack.ref !== removed,
  );
  multiattack.choices = asArray(multiattack.choices).filter(keep);
  multiattack.replacements = asArray(multiattack.replacements).filter(
    (replacement) => replacement.with !== removed,
  );
  routine.multiattack = multiattack;
  payload.routine = routine;

  if (payload.progression?.bands) {
    payload.progression.bands = asArray(payload.progression.bands).map((band) => {
      const abilityPatches = isPlainObject(band.abilityPatches)
        ? { ...band.abilityPatches }
        : {};
      delete abilityPatches[removed];
      return {
        ...band,
        abilityIds: asArray(band.abilityIds).filter(keep),
        defaultSequence: asArray(band.defaultSequence).filter(keep),
        opener: asArray(band.opener).filter(keep),
        abilityPatches,
      };
    });
  }
  return payload;
}

export function createStudioGraftBand(payload = {}) {
  const bands = asArray(payload.progression?.bands);
  const abilityIds = asArray(payload.abilities).map((ability) => ability.id);
  const id = uniqueId(`band-${bands.length + 1}`, bands.map((band) => band.id));
  return {
    id,
    minCr: 0,
    maxCr: 30,
    abilityIds,
    abilityPatches: {},
    graftPatch: null,
    defaultSequence: abilityIds.slice(0, 1),
    opener: [],
    multiattack: null,
  };
}

function buildFeature(component = {}, payload = {}) {
  return {
    ...cloneJson(payload, {}),
    id: payload.graftId || component.id,
    title: component.title || component.label || payload.graftId || component.id,
    slot: payload.slot || asArray(component.slots)[0],
    source: asArray(component.sourceAnchors)[0],
    sourceAnchors: asArray(component.sourceAnchors),
    summary: component.summary || "",
    mechanics: component.mechanics || component.tableText || "",
    counterplay: component.counterplay || "",
  };
}

export function buildStudioGraftOutputPreview(component = {}, targetCr = 1) {
  const payload = ensureStudioGraftPayload(component);
  const feature = buildFeature(component, payload);
  const bundle = buildMonsterAbilityBundleFromGraft(feature, {
    targetCr: Number(targetCr || 0),
  });
  const abilities = asArray(bundle.abilities).map((ability) => {
    const renderFeature = {
      id: ability.id,
      title: ability.title,
      slot: feature.slot,
      section: ability.section || ability.rules?.section,
      mechanics: ability.mechanics || "",
      counterplay: ability.counterplay || "",
      rules: ability.rules,
    };
    return {
      id: ability.id,
      localAbilityId: ability.localAbilityId,
      title: ability.title,
      section: ability.section || ability.rules?.section || "trait",
      actionEconomy: ability.rules?.actionEconomy || "passive",
      synthetic: Boolean(ability.synthetic),
      text:
        renderStructuredRulesTemplate(renderFeature) ||
        ability.mechanics ||
        "No generated output yet.",
      validation: ability.rulesValidation,
    };
  });
  return {
    targetCr: Number(targetCr || 0),
    payload,
    feature,
    bundle,
    abilities,
    validation: validateMonsterGraftV2(feature),
    normalized: normalizeMonsterGraftV2(feature),
    projection: bundle.projection || null,
  };
}

export function validateStudioGraftPayload(component = {}) {
  const payload = ensureStudioGraftPayload(component);
  return validateMonsterGraftV2(buildFeature(component, payload));
}

export const studioMonsterGraftAuthoringInternals = Object.freeze({
  asArray,
  cleanString,
  cloneJson,
  isPlainObject,
  slugify,
  uniqueId,
});
