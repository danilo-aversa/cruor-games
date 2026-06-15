import {
  getDamageExpectedTargets,
  getDamageParts,
  getDamageRoundWeight,
} from "../../model/monster-graft-rules.schema.js";
import { buildMonsterAbilitiesFromFeatures } from "../../model/monster-ability-model.js";
import { getLegalDamageRollForRules } from "./monster-rules-engine.js";

export const MONSTER_DPR_SIMULATOR_VERSION = "three-round-dpr-v0.2-ability-model";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(Number(value || 0));
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function normalizeRoundWeights(weights) {
  const values = Array.isArray(weights) ? weights.map(Number).filter(Number.isFinite) : [];
  return [0, 1, 2].map((index) => Math.max(0, values[index] ?? values[values.length - 1] ?? 1));
}

function sumRoundArray(values = []) {
  return values.reduce((sum, value) => sum + Number(value || 0), 0);
}

function multiplyRounds(rounds, multiplier) {
  return normalizeRoundWeights(rounds).map((value) => value * Math.max(0, Number(multiplier || 0)));
}

function addRounds(target, source) {
  normalizeRoundWeights(source).forEach((value, index) => {
    target[index] = Number(target[index] || 0) + Number(value || 0);
  });
}

function getActionEconomy(rules = {}, section = "trait") {
  return rules.actionEconomy || section;
}

function getDamageActionMultiplier(rules = {}) {
  const multiattack = rules.multiattack;
  if (!multiattack?.enabled || rules.actionEconomy !== "action") return 1;
  const count = Number(
    multiattack.count ||
      (Array.isArray(multiattack.attacks)
        ? multiattack.attacks.reduce((sum, attack) => sum + Number(attack.count || 0), 0)
        : 0) ||
      1,
  );
  return clamp(count, 1, 12);
}

function getExpectedTargets(damage, rules) {
  const explicit = Number(damage?.expectedTargets);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  if (rules?.areaEffect?.enabled) {
    if (["cone", "sphere", "cube", "line", "radius", "emanation"].includes(rules.areaEffect.shape)) return 2;
    return 1.5;
  }
  if (rules?.targeting?.type === "area") return 2;
  return getDamageExpectedTargets(damage, rules) || 1;
}

function getRoundWeights(damage, rules) {
  const weights = getDamageRoundWeight(damage, rules);
  if (Array.isArray(weights) && weights.length) return normalizeRoundWeights(weights);

  if (rules?.usage?.type === "recharge") return [1, 0.35, 0.35];
  if (rules?.actionEconomy === "reaction") return [0.65, 0.65, 0.65];
  if (rules?.actionEconomy === "legendaryAction") return [1, 1, 1];
  if (rules?.actionEconomy === "lairAction") return [1, 1, 1];
  if (rules?.actionEconomy === "deathTrigger") return [0, 0, 0.35];
  if (rules?.ongoing?.enabled) return [0, 0.65, 0.65];
  return [1, 1, 1];
}

function isDamageRelevant(damage = {}) {
  if (!damage || damage.mode === "none") return false;
  if (damage.mode === "parts") return getDamageParts(damage).length > 0;
  if (damage.mode === "fixed") return Boolean(damage.average || damage.dice);
  return true;
}

function collectAbilityDamageEntries(ability = {}) {
  if (Array.isArray(ability.damage?.entries) && ability.damage.entries.length) {
    return ability.damage.entries.map((entry) => ({
      kind: entry.source || "damage",
      damage: entry.damage || entry,
      parentDamage: ability.rules?.damage || null,
      abilityEntry: entry,
    }));
  }

  const entries = [];
  const rules = ability.rules || {};
  const damage = rules.damage;
  if (isDamageRelevant(damage)) {
    const parts = getDamageParts(damage);
    if (parts.length) {
      parts.forEach((part) => entries.push({ damage: part, parentDamage: damage, kind: "damage_part" }));
    } else {
      entries.push({ damage, parentDamage: damage, kind: "damage" });
    }
  }

  if (rules.ongoing?.enabled && rules.ongoing.damage) {
    entries.push({ kind: "ongoing", damage: rules.ongoing.damage, parentDamage: damage });
  }

  if (rules.procedure?.ongoingDamage?.enabled && rules.procedure.ongoingDamage.damage) {
    entries.push({ kind: "procedure_ongoing", damage: rules.procedure.ongoingDamage.damage, parentDamage: damage });
  }

  return entries;
}

function buildDamageSource({ ability, entry, computed }) {
  const rules = ability.rules || {};
  const damage = entry.damage;
  const roll = getLegalDamageRollForRules({ damage, rules, computed });
  const average = Number(roll.average || 0);
  if (!Number.isFinite(average) || average <= 0) return null;

  const targets = getExpectedTargets(damage, rules);
  const actionMultiplier = getDamageActionMultiplier(rules);
  const weights = getRoundWeights(damage, rules);
  const perUseAverage = average * Math.max(0, targets) * Math.max(1, actionMultiplier);
  const rounds = multiplyRounds(weights, perUseAverage);

  return {
    featureId: ability.sourceGraftId || ability.id,
    abilityId: ability.id,
    title: ability.title,
    section: ability.section || rules.section || "trait",
    actionEconomy: getActionEconomy(rules, ability.section),
    usageType: ability.usage?.type || rules.usage?.type || "atWill",
    usageValue: ability.usage?.value || rules.usage?.value || null,
    kind: entry.kind,
    damageMode: damage.mode || "budget",
    budgetRole: damage.budgetRole || "none",
    damageTypes: asArray(damage.types || damage.type),
    roll,
    averagePerTarget: round(average),
    expectedTargets: Number(targets.toFixed ? targets.toFixed(2) : targets),
    actionMultiplier,
    roundWeights: weights,
    rounds: rounds.map((value) => round(value)),
    totalThreeRound: round(sumRoundArray(rounds)),
    averageDpr: round(sumRoundArray(rounds) / 3),
  };
}

function buildFallbackSource({ computed, label = "Legal fallback attack" }) {
  const targetDpr = Math.max(1, round(computed?.dpr || computed?.targetDpr || 1));
  const roll = getLegalDamageRollForRules({
    damage: {
      mode: "computed",
      budgetRole: "mainAttack",
      modifierPolicy: "sameAsAttack",
      types: ["bludgeoning"],
    },
    rules: { section: "action", actionEconomy: "action", resolution: { type: "attackRoll" } },
    computed: { ...computed, dpr: targetDpr },
  });
  const average = Number(roll.average || targetDpr);
  const rounds = [average, average, average];
  return {
    featureId: "fallback-strike",
    title: label,
    section: "action",
    actionEconomy: "action",
    usageType: "atWill",
    usageValue: null,
    kind: "fallback",
    damageMode: "computed",
    budgetRole: "mainAttack",
    damageTypes: ["bludgeoning"],
    roll,
    averagePerTarget: round(average),
    expectedTargets: 1,
    actionMultiplier: 1,
    roundWeights: [1, 1, 1],
    rounds: rounds.map(round),
    totalThreeRound: round(sumRoundArray(rounds)),
    averageDpr: round(sumRoundArray(rounds) / 3),
  };
}

function collectAbilitySources({ abilities = [], computed }) {
  return abilities.flatMap((ability) => {
    if (!ability?.rules) return [];
    return collectAbilityDamageEntries(ability)
      .map((entry) => buildDamageSource({ ability, entry, computed }))
      .filter(Boolean);
  });
}

function getRoundDetail(sources, roundIndex) {
  return sources
    .map((source) => ({
      featureId: source.featureId,
      title: source.title,
      value: source.rounds[roundIndex] || 0,
    }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value || a.title.localeCompare(b.title));
}

function getAssumptions({ fallbackUsed, sources }) {
  const assumptions = [
    "Damage is averaged over rounds 1–3.",
    "Attack damage assumes hits; attack bonus is applied later by the CR validator.",
    "Saving throw damage assumes failed saves; save DC is applied later by the CR validator.",
    "Area damage defaults to 2 expected targets unless the graft specifies expectedTargets.",
    "Recharge damage is weighted as round 1 plus expected later use.",
  ];
  if (fallbackUsed) assumptions.push("No structured damaging graft was found, so the legal fallback Strike is used.");
  if (sources.some((source) => source.actionEconomy === "reaction")) {
    assumptions.push("Reaction damage uses an expected trigger rate rather than guaranteed use.");
  }
  if (sources.some((source) => source.actionEconomy === "deathTrigger")) {
    assumptions.push("Death-trigger damage is discounted and separated from normal sustained DPR.");
  }
  return assumptions;
}

export function buildThreeRoundDprProfile({
  selectedFeatures = [],
  abilities = null,
  computed = {},
  targetDpr = computed?.dpr,
  includeFallback = true,
} = {}) {
  const scopedComputed = {
    ...computed,
    dpr: Math.max(1, round(targetDpr || computed?.dpr || 1)),
  };
  const abilityList = Array.isArray(abilities)
    ? abilities
    : buildMonsterAbilitiesFromFeatures(selectedFeatures).abilities;
  let sources = collectAbilitySources({ abilities: abilityList, computed: scopedComputed });
  const fallbackUsed = includeFallback && sources.length === 0;
  if (fallbackUsed) sources = [buildFallbackSource({ computed: scopedComputed })];

  const rounds = [0, 0, 0];
  sources.forEach((source) => addRounds(rounds, source.rounds));
  const roundedRounds = rounds.map(round);
  const total = sumRoundArray(roundedRounds);
  const averageDpr = round(total / 3);
  const burstDpr = Math.max(...roundedRounds, averageDpr);
  const sustainedDpr = round((roundedRounds[1] + roundedRounds[2]) / 2);
  const openingBurstDelta = round(roundedRounds[0] - averageDpr);

  return {
    version: MONSTER_DPR_SIMULATOR_VERSION,
    rounds: {
      round1: roundedRounds[0],
      round2: roundedRounds[1],
      round3: roundedRounds[2],
    },
    roundDetails: {
      round1: getRoundDetail(sources, 0),
      round2: getRoundDetail(sources, 1),
      round3: getRoundDetail(sources, 2),
    },
    totalThreeRoundDamage: round(total),
    averageDpr,
    effectiveDpr3Round: averageDpr,
    burstDpr,
    sustainedDpr,
    openingBurstDelta,
    sourceCount: sources.length,
    abilityCount: abilityList.length,
    fallbackUsed,
    sources,
    assumptions: getAssumptions({ fallbackUsed, sources }),
  };
}
