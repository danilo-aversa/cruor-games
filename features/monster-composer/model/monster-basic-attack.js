import { MONSTER_GRAFT_RULES_SCHEMA_VERSION } from "./monster-graft-rules.schema.js";

export const MONSTER_BASIC_ATTACK_VERSION = "monster-basic-attack-v1.0";
export const MONSTER_BASIC_ATTACK_GENERATOR = "basic-attack-fallback-v1";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

export function isMonsterBasicAttackFeature(feature = {}) {
  return Boolean(
    feature.baselineAbility === true ||
      feature.generatedBy === MONSTER_BASIC_ATTACK_GENERATOR ||
      cleanString(feature.id).startsWith("frame-basic-strike-") ||
      feature.rules?.migration?.convertedFrom === MONSTER_BASIC_ATTACK_GENERATOR,
  );
}

export function hasAuthoredAttackPattern(features = []) {
  return asArray(features).some(
    (feature) =>
      feature.slot === "attack" &&
      feature.synthetic !== true &&
      !isMonsterBasicAttackFeature(feature),
  );
}

function getBasicAttackIdentity({ category = "Monster", typeId = "monster" } = {}) {
  const noun = cleanString(category) || "Monster";
  const normalizedType = cleanString(typeId).toLowerCase();

  if (normalizedType === "undead" && /skeleton/i.test(noun)) {
    return { title: `${noun} Strike`, damageType: "slashing", abilityBasis: "dex" };
  }
  if (normalizedType === "undead" && /spirit|ghost|specter|wraith/i.test(noun)) {
    return { title: `${noun} Touch`, damageType: "necrotic", abilityBasis: "cha" };
  }
  if (/beast|spider|wolf|crawler/i.test(`${normalizedType} ${noun}`)) {
    return { title: `${noun} Bite`, damageType: "piercing", abilityBasis: "str" };
  }
  return { title: `${noun} Strike`, damageType: "bludgeoning", abilityBasis: "str" };
}

export function buildMonsterBasicAttackFeature({
  category = "Monster",
  typeId = "monster",
  sourceId = "frame",
  targetCr = 0,
} = {}) {
  const identity = getBasicAttackIdentity({ category, typeId });
  return {
    id: `frame-basic-strike-${cleanString(typeId) || "monster"}-${Number(targetCr || 0)}`,
    title: identity.title,
    slot: "attack",
    section: "action",
    source: sourceId || "frame",
    typeBias: [],
    roleBias: [],
    cost: 0,
    complexity: 0,
    baselineAbility: true,
    synthetic: true,
    generatedBy: MONSTER_BASIC_ATTACK_GENERATOR,
    stats: { dpr: 0 },
    rules: {
      schemaVersion: MONSTER_GRAFT_RULES_SCHEMA_VERSION,
      section: "action",
      actionEconomy: "action",
      usage: { type: "atWill" },
      resolution: {
        type: "attackRoll",
        attackType: "melee",
        abilityBasis: identity.abilityBasis,
        bonus: "monster",
        reach: "5 ft.",
      },
      targeting: { type: "single", targets: "one target" },
      damage: {
        mode: "computed",
        budgetRole: "mainAttack",
        modifierPolicy: "sameAsAttack",
        types: [identity.damageType],
        scale: "standard",
        expectedTargets: 1,
        parts: [],
      },
      condition: null,
      counterplay: {
        telegraph: false,
        breakCondition: false,
        positioningAnswer: true,
        nonDamageAnswer: false,
      },
      text: { hit: "{damage} {damage-type}." },
      migration: {
        source: "frame-generated-basic-attack",
        isStructured: true,
        convertedFrom: MONSTER_BASIC_ATTACK_GENERATOR,
      },
    },
    summary:
      "Baseline attack automatically compiled when no Attack Pattern graft is selected.",
    mechanics: "Melee Attack Roll. Hit: {damage} {damage-type}.",
    counterplay: "Standard melee positioning and Armor Class counterplay apply.",
  };
}

export function ensureMonsterBasicAttackFeature(
  features = [],
  { category, typeId, sourceId, targetCr } = {},
) {
  const authoredFeatures = asArray(features);
  const existingFallback = authoredFeatures.find(isMonsterBasicAttackFeature) || null;
  const authoredAttackPattern = hasAuthoredAttackPattern(authoredFeatures);

  if (authoredAttackPattern) {
    return {
      version: MONSTER_BASIC_ATTACK_VERSION,
      features: authoredFeatures.filter((feature) => !isMonsterBasicAttackFeature(feature)),
      fallbackFeature: null,
      profile: {
        status: "authored-attack-pattern",
        attackPatternCount: authoredFeatures.filter(
          (feature) =>
            feature.slot === "attack" &&
            feature.synthetic !== true &&
            !isMonsterBasicAttackFeature(feature),
        ).length,
        fallbackAdded: false,
      },
    };
  }

  const fallbackFeature =
    existingFallback ||
    buildMonsterBasicAttackFeature({ category, typeId, sourceId, targetCr });
  return {
    version: MONSTER_BASIC_ATTACK_VERSION,
    features: [
      ...authoredFeatures.filter((feature) => !isMonsterBasicAttackFeature(feature)),
      fallbackFeature,
    ],
    fallbackFeature,
    profile: {
      status: existingFallback ? "fallback-present" : "fallback-added",
      attackPatternCount: 0,
      fallbackAdded: !existingFallback,
      fallbackFeature: { id: fallbackFeature.id, title: fallbackFeature.title },
    },
  };
}
