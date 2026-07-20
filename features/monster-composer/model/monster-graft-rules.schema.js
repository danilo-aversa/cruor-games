import { getFeatureBalanceStat } from "./monster-graft-balance-profile.js";
export const MONSTER_GRAFT_RULES_SCHEMA_VERSION = "monster-graft-rules-v1.15";

export const RULES_SECTIONS = Object.freeze([
  "trait",
  "action",
  "bonusAction",
  "reaction",
  "legendaryAction",
  "lairAction",
  "death",
]);

export const ACTION_ECONOMY_TYPES = Object.freeze([
  "passive",
  "action",
  "bonusAction",
  "reaction",
  "legendaryAction",
  "lairAction",
  "deathTrigger",
  "freeTrigger",
]);

export const USAGE_TYPES = Object.freeze([
  "passive",
  "atWill",
  "recharge",
  "limited",
  "triggered",
  "lair",
  "legendary",
  "death",
]);

export const RESOLUTION_TYPES = Object.freeze([
  "none",
  "attackRoll",
  "savingThrow",
  "attackRollSavingThrow",
  "automatic",
  "check",
]);

export const DAMAGE_MODES = Object.freeze(["none", "fixed", "budget", "computed", "custom", "parts"]);

export const ATTACK_ABILITY_BASIS = Object.freeze([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
  "spellcasting",
  "monster",
  "custom",
]);

export const DAMAGE_BUDGET_ROLES = Object.freeze([
  "none",
  "mainAttack",
  "secondaryAttack",
  "minorAttack",
  "bonusAction",
  "reactionPunish",
  "rechargeBurst",
  "rechargeControl",
  "deathBurst",
  "lairPulse",
  "legendaryStrike",
  "ongoing",
]);

export const DAMAGE_BUDGET_ROLE_DEFAULTS = Object.freeze({
  none: { share: 0, roundWeight: [0, 0, 0], expectedTargets: 1 },
  mainAttack: { share: 0.85, roundWeight: [1, 1, 1], expectedTargets: 1 },
  secondaryAttack: { share: 0.5, roundWeight: [1, 1, 1], expectedTargets: 1 },
  minorAttack: { share: 0.35, roundWeight: [1, 1, 1], expectedTargets: 1 },
  bonusAction: { share: 0.3, roundWeight: [1, 1, 1], expectedTargets: 1 },
  reactionPunish: { share: 0.45, roundWeight: [0.65, 0.65, 0.65], expectedTargets: 1 },
  rechargeBurst: { share: 1.25, roundWeight: [1, 0.35, 0.35], expectedTargets: 1.5 },
  rechargeControl: { share: 0.85, roundWeight: [1, 0.35, 0.35], expectedTargets: 1.5 },
  deathBurst: { share: 1.35, roundWeight: [0, 0, 0.35], expectedTargets: 1.75 },
  lairPulse: { share: 0.45, roundWeight: [1, 1, 1], expectedTargets: 1.5 },
  legendaryStrike: { share: 0.35, roundWeight: [1, 1, 1], expectedTargets: 1 },
  ongoing: { share: 0.2, roundWeight: [0, 0.65, 0.65], expectedTargets: 1 },
});

export const CONDITION_SEVERITY = Object.freeze(["minor", "moderate", "major", "severe"]);

export const CONDITION_DIRECTIONS = Object.freeze([
  "enemy",
  "self",
  "playerApplied",
  "weakness",
  "referenceOnly",
]);

export const CONDITION_ESCAPE_DC_SOURCES = Object.freeze(["monster", "fixed", "custom"]);

export const CONDITION_REPEAT_SAVE_TIMINGS = Object.freeze([
  "startOfTurn",
  "endOfTurn",
  "endOfEachTurn",
  "whenDamaged",
  "whenTriggered",
]);

export const ONGOING_TIMINGS = Object.freeze([
  "startOfTargetTurn",
  "endOfTargetTurn",
  "startOfMonsterTurn",
  "endOfMonsterTurn",
  "onEnterArea",
  "whileInArea",
  "whenTriggered",
]);

export const AREA_EFFECT_TYPES = Object.freeze([
  "aura",
  "emanation",
  "hazard",
  "zone",
  "regional",
  "custom",
]);

export const AREA_EFFECT_ORIGINS = Object.freeze([
  "self",
  "point",
  "target",
  "location",
  "custom",
]);

export const AREA_EFFECT_TIMINGS = Object.freeze([
  "passive",
  "startsTurnInArea",
  "endsTurnInArea",
  "entersArea",
  "whileInArea",
  "leavesArea",
  "initiativeCount20",
  "lairAction",
  "regional",
  "custom",
]);

export const MULTIATTACK_MODES = Object.freeze([
  "fixed",
  "choice",
  "attackPlusAbility",
  "replaceOne",
  "replaceAny",
  "custom",
]);

export const MULTIATTACK_REPLACEMENT_SCOPES = Object.freeze([
  "none",
  "oneAttack",
  "anyAttack",
  "oneOrMoreAttacks",
]);

export const MULTIATTACK_PARTICIPATION_ROLES = Object.freeze([
  "primary",
  "choice",
  "replacement",
  "additionalAbility",
  "excluded",
]);

export const MULTIATTACK_PARTICIPATION_TIMINGS = Object.freeze([
  "beforeAttacks",
  "afterAttacks",
]);

export const MULTIATTACK_PARTICIPATION_AVAILABILITY = Object.freeze([
  "always",
  "ifAvailable",
]);

export const SPELLCASTING_ABILITY_OPTIONS = Object.freeze([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
]);

export const SPELLCASTING_DC_SOURCES = Object.freeze(["monster", "fixed", "custom", "none"]);

export const SPELLCASTING_ATTACK_BONUS_SOURCES = Object.freeze(["monster", "fixed", "custom", "none"]);

export const SPELLCASTING_LIST_USAGES = Object.freeze([
  "atWill",
  "daily1",
  "daily2",
  "daily3",
  "recharge",
  "limited",
  "custom",
]);

export const DEFENSE_FEATURE_TYPES = Object.freeze([
  "legendaryResistance",
  "magicResistance",
  "regeneration",
  "parry",
  "damageReduction",
  "evasion",
  "avoidance",
  "turnResistance",
  "defensiveReaction",
  "custom",
]);

export const DEFENSE_TIMINGS = Object.freeze([
  "passive",
  "onFailedSave",
  "startOfTurn",
  "whenHit",
  "whenDamaged",
  "onSavingThrow",
  "reaction",
  "custom",
]);

export const SUMMON_TYPES = Object.freeze([
  "summon",
  "create",
  "animate",
  "transform",
  "spawn",
  "custom",
]);

export const SUMMON_INITIATIVES = Object.freeze([
  "immediatelyAfterSummoner",
  "rollInitiative",
  "sameInitiative",
  "startOfNextRound",
  "custom",
]);

export const SUMMON_CONTROLS = Object.freeze([
  "underSummonerControl",
  "hostileToAll",
  "alliedToSummoner",
  "uncontrolled",
  "custom",
]);

export const PROCEDURE_TYPES = Object.freeze([
  "swallow",
  "engulf",
  "possession",
  "shapechange",
  "objectAnimation",
  "corpseDetonation",
  "burrowReturn",
  "gazeLock",
  "custom",
]);

export const PROCEDURE_ONGOING_TIMINGS = Object.freeze([
  "startOfTargetTurn",
  "endOfTargetTurn",
  "startOfMonsterTurn",
  "endOfMonsterTurn",
  "whenTriggered",
  "whileContained",
  "custom",
]);

export const ABILITY_REFERENCE_TYPES = Object.freeze([
  "action",
  "attack",
  "spellcasting",
  "bonusAction",
  "reaction",
  "legendaryAction",
  "lairAction",
  "procedure",
  "feature",
  "custom",
]);

export const ABILITY_REFERENCE_RELATIONSHIPS = Object.freeze([
  "uses",
  "makes",
  "requires",
  "replaceOneAttack",
  "replaceAnyAttack",
  "replaceOneOrMoreAttacks",
  "adds",
  "triggers",
  "follows",
  "custom",
]);

const SLOT_SECTION_FALLBACK = Object.freeze({
  body: "trait",
  mind: "trait",
  movement: "trait",
  attack: "action",
  horror: "trait",
  twist: "trait",
  weakness: "trait",
  death: "death",
  lair: "lairAction",
});

const SECTION_ACTION_ECONOMY = Object.freeze({
  trait: "passive",
  action: "action",
  bonusAction: "bonusAction",
  reaction: "reaction",
  legendaryAction: "legendaryAction",
  lairAction: "lairAction",
  death: "deathTrigger",
});

const SECTION_USAGE = Object.freeze({
  trait: "passive",
  action: "atWill",
  bonusAction: "atWill",
  reaction: "triggered",
  legendaryAction: "legendary",
  lairAction: "lair",
  death: "death",
});

const SAVE_ABILITIES = Object.freeze([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
]);

const CONDITION_NAMES = Object.freeze([
  "blinded",
  "charmed",
  "deafened",
  "frightened",
  "grappled",
  "incapacitated",
  "invisible",
  "paralyzed",
  "petrified",
  "poisoned",
  "prone",
  "restrained",
  "stunned",
  "unconscious",
]);

const DAMAGE_TYPES = Object.freeze([
  "acid",
  "bludgeoning",
  "cold",
  "fire",
  "force",
  "lightning",
  "necrotic",
  "piercing",
  "poison",
  "psychic",
  "radiant",
  "slashing",
  "thunder",
]);

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function lowerClean(value) {
  return cleanString(value).toLowerCase();
}

function uniqueArray(values) {
  return [...new Set(asArray(values).map(cleanString).filter(Boolean))];
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeEnum(value, allowed, fallback) {
  const normalized = cleanString(value);
  return allowed.includes(normalized) ? normalized : fallback;
}

function normalizeSaveAbility(value) {
  const normalized = lowerClean(value);
  return SAVE_ABILITIES.includes(normalized) ? normalized : null;
}

function normalizeAttackAbilityBasis(value, fallback = "monster") {
  const normalized = lowerClean(value);
  return ATTACK_ABILITY_BASIS.includes(normalized) ? normalized : fallback;
}

function normalizeDamageBudgetRole(value, fallback = "none") {
  return normalizeEnum(value, DAMAGE_BUDGET_ROLES, fallback);
}

function normalizePositiveNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function inferAttackAbilityBasis(attackType) {
  if (attackType === "ranged") return "dexterity";
  if (attackType === "melee") return "strength";
  if (attackType === "meleeOrRanged") return "strength";
  return "monster";
}

function titleCase(value) {
  return String(value || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getRulesFallbackSection(feature = {}) {
  return feature.section || SLOT_SECTION_FALLBACK[feature.slot] || "trait";
}

export function getRulesFallbackActionEconomy(section = "trait") {
  return SECTION_ACTION_ECONOMY[section] || "passive";
}

export function getRulesFallbackUsage(section = "trait") {
  return SECTION_USAGE[section] || "atWill";
}

export function getDefaultDamageBudgetRole(rules = {}) {
  if (rules.usage?.type === "recharge") {
    return rules.condition?.severity && ["major", "severe"].includes(rules.condition.severity)
      ? "rechargeControl"
      : "rechargeBurst";
  }
  if (rules.actionEconomy === "bonusAction") return "bonusAction";
  if (rules.actionEconomy === "reaction") return "reactionPunish";
  if (rules.actionEconomy === "legendaryAction") return "legendaryStrike";
  if (rules.actionEconomy === "lairAction") return "lairPulse";
  if (rules.actionEconomy === "deathTrigger") return "deathBurst";
  if (rules.resolution?.type === "attackRoll" || rules.resolution?.type === "savingThrow") return "mainAttack";
  return "none";
}

export function getDamageBudgetDefaults(role = "none") {
  return DAMAGE_BUDGET_ROLE_DEFAULTS[role] || DAMAGE_BUDGET_ROLE_DEFAULTS.none;
}

export function getDamageBudgetShare(damage = {}, rules = {}) {
  if (!damage || damage.mode === "none") return 0;
  const role = damage.budgetRole || getDefaultDamageBudgetRole(rules);
  return normalizePositiveNumber(damage.budgetShare, getDamageBudgetDefaults(role).share);
}

export function getDamageRoundWeight(damage = {}, rules = {}) {
  const role = damage?.budgetRole || getDefaultDamageBudgetRole(rules);
  const explicit = Array.isArray(damage?.roundWeight) ? damage.roundWeight.map(Number).filter(Number.isFinite) : null;
  return explicit?.length ? explicit : getDamageBudgetDefaults(role).roundWeight;
}

export function getDamageExpectedTargets(damage = {}, rules = {}) {
  const role = damage?.budgetRole || getDefaultDamageBudgetRole(rules);
  const fallback = rules.targeting?.type === "area" ? getDamageBudgetDefaults(role).expectedTargets : 1;
  return normalizePositiveNumber(damage?.expectedTargets, fallback);
}

export function getDamageParts(damage = {}) {
  return Array.isArray(damage?.parts) ? damage.parts.filter(Boolean) : [];
}

export function getDamagePartById(damage = {}, id = "") {
  const normalized = cleanString(id);
  return getDamageParts(damage).find((part) => cleanString(part.id) === normalized) || null;
}

export function getDamageTotalBudgetShare(damage = {}, rules = {}) {
  const parts = getDamageParts(damage);
  if (parts.length) {
    return parts.reduce((sum, part) => sum + getDamageBudgetShare(part, rules), 0);
  }
  return getDamageBudgetShare(damage, rules);
}

function normalizeMultiattackAttack(entry, index = 0) {
  if (!isPlainObject(entry)) return null;
  return {
    ...entry,
    ref: cleanString(entry.ref) || `attack-${index + 1}`,
    label: cleanString(entry.label || entry.name || entry.ref) || `Attack ${index + 1}`,
    count: normalizePositiveNumber(entry.count, 1),
  };
}

function normalizeMultiattackReplacement(entry, index = 0) {
  if (!isPlainObject(entry)) return null;
  return {
    ...entry,
    replace: normalizeEnum(entry.replace, MULTIATTACK_REPLACEMENT_SCOPES, index === 0 ? "oneAttack" : "none"),
    with: cleanString(entry.with || entry.ref || entry.label),
    label: cleanString(entry.label || entry.with || entry.ref),
  };
}

function normalizeMultiattackParticipation(participation) {
  if (!isPlainObject(participation)) return null;
  const hasExplicitEnabled = Object.prototype.hasOwnProperty.call(participation, "enabled");
  return {
    ...participation,
    enabled: hasExplicitEnabled ? Boolean(participation.enabled) : true,
    role: normalizeEnum(participation.role, MULTIATTACK_PARTICIPATION_ROLES, "primary"),
    maxUses: normalizePositiveNumber(participation.maxUses, 4),
    replacementScope: normalizeEnum(
      participation.replacementScope,
      MULTIATTACK_REPLACEMENT_SCOPES,
      "oneAttack",
    ),
    timing: normalizeEnum(participation.timing, MULTIATTACK_PARTICIPATION_TIMINGS, "beforeAttacks"),
    availability: normalizeEnum(
      participation.availability,
      MULTIATTACK_PARTICIPATION_AVAILABILITY,
      "always",
    ),
    group: cleanString(participation.group) || "primary",
  };
}

function normalizeAbilityReference(entry, index = 0) {
  if (!isPlainObject(entry)) return null;
  const type = normalizeEnum(entry.type, ABILITY_REFERENCE_TYPES, "action");
  const relationship = normalizeEnum(entry.relationship, ABILITY_REFERENCE_RELATIONSHIPS, "uses");
  const ref = cleanString(entry.ref || entry.id || entry.label || `reference-${index + 1}`);
  const label = cleanString(entry.label || entry.name || entry.ref || ref) || `Reference ${index + 1}`;
  return {
    ...entry,
    id: cleanString(entry.id) || ref,
    type,
    ref,
    label,
    relationship,
    count: normalizePositiveNumber(entry.count, entry.count === 0 ? 0 : undefined),
    note: cleanString(entry.note),
    text: cleanString(entry.text),
  };
}

function normalizeAbilityReferences(references) {
  if (!Array.isArray(references)) return [];
  return references.map((entry, index) => normalizeAbilityReference(entry, index)).filter(Boolean);
}

function normalizeMultiattack(multiattack) {
  if (!isPlainObject(multiattack)) return null;
  const attacks = Array.isArray(multiattack.attacks)
    ? multiattack.attacks.map((entry, index) => normalizeMultiattackAttack(entry, index)).filter(Boolean)
    : [];
  const replacements = Array.isArray(multiattack.replacements)
    ? multiattack.replacements.map((entry, index) => normalizeMultiattackReplacement(entry, index)).filter(Boolean)
    : [];
  const hasExplicitEnabled = Object.prototype.hasOwnProperty.call(multiattack, "enabled");
  return {
    ...multiattack,
    enabled: hasExplicitEnabled
      ? Boolean(multiattack.enabled)
      : Boolean(attacks.length || cleanString(multiattack.template)),
    mode: normalizeEnum(multiattack.mode, MULTIATTACK_MODES, "fixed"),
    count: normalizePositiveNumber(multiattack.count, attacks.reduce((sum, entry) => sum + Number(entry.count || 0), 0) || 2),
    attacks,
    replacements,
    template: cleanString(multiattack.template),
  };
}

function inferRecharge(text) {
  const match = String(text || "").match(/recharge\s+(\d\s*[-–—]\s*\d)/i);
  if (!match) return null;
  return match[1].replace(/\s+/g, "").replace(/[–—]/g, "-");
}

function inferAttackResolution(text) {
  const lower = lowerClean(text);
  if (!lower.includes("attack roll")) return null;
  const attackType = lower.includes("ranged attack roll")
    ? "ranged"
    : lower.includes("melee or ranged attack roll")
      ? "meleeOrRanged"
      : "melee";
  return {
    type: "attackRoll",
    attackType,
    bonus: "monster",
    abilityBasis: inferAttackAbilityBasis(attackType),
    reach: attackType === "ranged" ? null : "5 ft.",
    range: attackType === "melee" ? null : "30/120 ft.",
  };
}

function inferSaveResolution(text) {
  const lower = lowerClean(text);
  const ability = SAVE_ABILITIES.find(
    (item) => lower.includes(`${item} save`) || lower.includes(`${item} saving throw`),
  );
  if (!ability) return null;
  return {
    type: "savingThrow",
    ability,
    dc: "monster",
  };
}

function inferTargeting(text) {
  const lower = lowerClean(text);
  const cone = lower.match(/(\d+)\s*-?foot cone/);
  if (cone) {
    return {
      type: "area",
      shape: "cone",
      size: Number(cone[1]),
      unit: "ft",
      targets: "creatures",
    };
  }
  const sphere = lower.match(/(\d+)\s*-?foot sphere/);
  if (sphere) {
    return {
      type: "area",
      shape: "sphere",
      size: Number(sphere[1]),
      unit: "ft",
      targets: "creatures",
    };
  }
  const radius = lower.match(/within\s+(\d+)\s+feet/);
  if (radius) {
    return {
      type: "area",
      shape: "radius",
      size: Number(radius[1]),
      unit: "ft",
      targets: "creatures",
    };
  }
  if (lower.includes("one creature") || lower.includes("one target")) {
    return {
      type: "single",
      targets: "one creature",
    };
  }
  return null;
}

function inferDamage(text, feature = {}) {
  const lower = lowerClean(text);
  const damageTypes = DAMAGE_TYPES.filter((type) => lower.includes(`${type} damage`));
  if (!damageTypes.length && !lower.includes("damage")) return null;
  return {
    mode: getFeatureBalanceStat(feature, "dpr") ? "budget" : "custom",
    scale: getFeatureBalanceStat(feature, "dpr") >= 8 ? "high" : getFeatureBalanceStat(feature, "dpr") >= 4 ? "standard" : "minor",
    budgetRole: getFeatureBalanceStat(feature, "dpr") ? "mainAttack" : "none",
    types: damageTypes.length ? damageTypes : ["variable"],
  };
}

function inferCondition(text) {
  const source = String(text || "");
  const lower = lowerClean(source);
  const names = CONDITION_NAMES.filter(
    (condition) => lower.includes(condition) || lower.includes(`${titleCase(condition)} condition`),
  );
  if (!names.length && !lower.includes("cannot regain hit points")) return null;
  const severity = names.some((name) => ["paralyzed", "stunned", "unconscious"].includes(name))
    ? "severe"
    : names.some((name) => ["restrained", "frightened", "grappled"].includes(name)) ||
        lower.includes("cannot regain hit points")
      ? "major"
      : "moderate";
  const durationMatch = source.match(/until\s+(?:the\s+)?end\s+of\s+[^.]+?turn|until\s+[^.]+/i);
  return {
    names,
    severity,
    duration: durationMatch ? durationMatch[0].trim() : lower.includes("until") ? "defined in text" : "unspecified",
    special: lower.includes("cannot regain hit points") ? ["healing-denial"] : [],
  };
}

function inferTrigger(text, section) {
  const source = cleanString(text);
  const triggerMatch = source.match(/Trigger:\s*([^.]+\.)/i);
  if (triggerMatch) return triggerMatch[1].trim();
  if (section === "reaction") return "Unspecified reaction trigger.";
  if (section === "death") return "The creature dies or drops to 0 hit points.";
  const whenClauseMatch = source.match(/When\s+([^,.]+)(?:,|\.)/);
  if (whenClauseMatch) return `When ${whenClauseMatch[1].trim()}.`;
  const whenMatch = source.match(/When\s+([^.]+\.)/);
  return whenMatch?.[0] || null;
}

function ensureSentenceEnd(value) {
  const text = cleanString(value);
  if (!text) return text;
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function inferOutcomeText(text, { resolution, damage, condition, ongoing } = {}) {
  const source = cleanString(text);
  if (!source || resolution?.type !== "savingThrow") return {};

  const explicitFailure = source.match(/Failure:\s*([^]+?)(?:\s+Success:|$)/i)?.[1]?.trim();
  const explicitSuccess = source.match(/Success:\s*([^]+)$/i)?.[1]?.trim();
  const onFailure = source.match(/On a failure,?\s*([^.]+(?:\.[^.]+)?)/i)?.[1]?.trim();
  const failure = explicitFailure || (onFailure ? onFailure.replace(/^the target/i, "The target") : null);

  if (failure) {
    return {
      failure: ensureSentenceEnd(failure),
      success: explicitSuccess ? ensureSentenceEnd(explicitSuccess) : (damage ? "Half damage only." : "No effect."),
    };
  }

  if (condition?.names?.length || ongoing?.enabled) {
    return {
      failure: condition?.names?.length
        ? `The target has the {condition-list}.${condition.duration ? ` The condition lasts ${condition.duration}.` : ""}`.trim()
        : "",
      success: explicitSuccess || (damage ? "Half damage only." : "No effect."),
    };
  }

  return explicitSuccess ? { success: explicitSuccess } : {};
}


function inferAbilityReferences(text) {
  const source = cleanString(text);
  if (!source) return [];
  const refs = [];
  const seen = new Set();
  const addRef = (entry) => {
    const label = cleanString(entry.label || entry.ref);
    if (!label) return;
    const key = `${entry.relationship || "uses"}:${label.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    refs.push({
      type: entry.type || "action",
      ref: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      label,
      relationship: entry.relationship || "uses",
      count: entry.count,
    });
  };

  const makeRegexes = [
    /makes?\s+(one|two|three|four|\d+)\s+([A-Z][A-Za-z’' -]+?)\s+attacks?\b/g,
    /makes?\s+(?:a|an)\s+([A-Z][A-Za-z’' -]+?)\s+attack\b/g,
  ];
  makeRegexes.forEach((regex) => {
    let match;
    while ((match = regex.exec(source))) {
      if (match.length === 3) {
        addRef({ type: "attack", label: match[2], relationship: "makes", count: match[1] });
      } else {
        addRef({ type: "attack", label: match[1], relationship: "makes", count: 1 });
      }
    }
  });

  const replaceRegex = /replace\s+(one|any|one or more)\s+attacks?\s+with\s+([A-Z][A-Za-z’' -]+)\b/gi;
  let replaceMatch;
  while ((replaceMatch = replaceRegex.exec(source))) {
    const scope = replaceMatch[1].toLowerCase();
    addRef({
      type: /spellcasting/i.test(replaceMatch[2]) ? "spellcasting" : "action",
      label: replaceMatch[2],
      relationship: scope === "any" ? "replaceAnyAttack" : scope === "one or more" ? "replaceOneOrMoreAttacks" : "replaceOneAttack",
    });
  }

  return refs;
}

function inferAreaEffect(text) {
  const lower = lowerClean(text);
  if (!/(aura|emanation|area|starts? its turn|enters? the area|while in the area|initiative count 20|regional effect)/i.test(text || "")) return null;
  const sizeMatch = lower.match(/(\d+)\s*-?foot\s+(emanation|radius|sphere|aura)/);
  const shape = sizeMatch?.[2] === "aura" ? "emanation" : sizeMatch?.[2] || (lower.includes("emanation") ? "emanation" : "radius");
  const timing = lower.includes("starts its turn") || lower.includes("start of its turn")
    ? "startsTurnInArea"
    : lower.includes("ends its turn") || lower.includes("end of its turn")
      ? "endsTurnInArea"
      : lower.includes("enters the area") || lower.includes("enters this area")
        ? "entersArea"
        : lower.includes("while in the area") || lower.includes("while it remains")
          ? "whileInArea"
          : lower.includes("initiative count 20")
            ? "initiativeCount20"
            : lower.includes("regional effect")
              ? "regional"
              : "passive";
  return {
    enabled: true,
    type: lower.includes("regional effect") ? "regional" : lower.includes("hazard") ? "hazard" : "aura",
    shape,
    size: sizeMatch ? Number(sizeMatch[1]) : null,
    unit: "ft",
    origin: lower.includes("within") || lower.includes("emanation") || lower.includes("aura") ? "self" : "point",
    timing,
    targets: lower.includes("enemy") ? "enemies" : "creatures",
  };
}

function inferRulesFromLegacy(feature = {}) {
  const text = `${feature.mechanics || ""} ${feature.counterplay || ""}`;
  const section = getRulesFallbackSection(feature);
  const recharge = inferRecharge(text);
  const attackResolution = inferAttackResolution(text);
  const saveResolution = inferSaveResolution(text);
  const resolution = attackResolution || saveResolution || { type: section === "trait" ? "none" : "automatic" };
  const targeting = inferTargeting(feature.mechanics);
  const damage = inferDamage(feature.mechanics, feature);
  const condition = inferCondition(feature.mechanics);
  const ongoing = null;
  const areaEffect = inferAreaEffect(feature.mechanics);
  const outcomeText = inferOutcomeText(feature.mechanics, { resolution, damage, condition, ongoing });

  return {
    schemaVersion: MONSTER_GRAFT_RULES_SCHEMA_VERSION,
    section,
    actionEconomy: getRulesFallbackActionEconomy(section),
    usage: recharge
      ? { type: "recharge", value: recharge }
      : { type: getRulesFallbackUsage(section) },
    trigger: inferTrigger(feature.mechanics, section),
    resolution,
    secondaryResolution: attackResolution && saveResolution ? saveResolution : null,
    targeting,
    areaEffect,
    damage,
    condition,
    counterplay: {
      telegraph: /before|obvious|visible|readable|leaks|distends|shines|audible|warning/i.test(
        `${feature.summary || ""} ${feature.counterplay || ""}`,
      ),
      breakCondition: /escape|clean|action|save|radiant|critical|destroy|until|bypass/i.test(
        `${feature.mechanics || ""} ${feature.counterplay || ""}`,
      ),
      positioningAnswer: /range|distance|position|lane|path|wall|terrain|spacing/i.test(
        `${feature.mechanics || ""} ${feature.counterplay || ""}`,
      ),
      nonDamageAnswer: /clean|radiant|critical|distance|forced movement|bypass|avoid|medicine/i.test(
        `${feature.mechanics || ""} ${feature.counterplay || ""}`,
      ),
    },
    text: outcomeText,
    multiattack: null,
    multiattackParticipation: null,
    spellcasting: null,
    defense: null,
    summon: null,
    procedure: null,
    references: inferAbilityReferences(feature.mechanics),
    ongoing,
    migration: {
      source: "legacy-inference",
      isStructured: false,
    },
  };
}

function normalizeUsage(usage, section) {
  if (!isPlainObject(usage)) return { type: getRulesFallbackUsage(section) };
  return {
    ...usage,
    type: normalizeEnum(usage.type, USAGE_TYPES, getRulesFallbackUsage(section)),
    value: usage.value ? cleanString(usage.value) : usage.value,
  };
}

function normalizeResolution(resolution, fallback = { type: "none" }) {
  if (!isPlainObject(resolution)) return fallback;
  const type = normalizeEnum(resolution.type, RESOLUTION_TYPES, fallback.type || "none");
  const attackType = resolution.attackType || fallback.attackType;
  const isAttack = type === "attackRoll" || type === "attackRollSavingThrow";
  const isSave = type === "savingThrow" || type === "attackRollSavingThrow";
  return {
    ...resolution,
    type,
    attackType,
    ability: isSave ? normalizeSaveAbility(resolution.ability) : resolution.ability,
    abilityBasis: isAttack
      ? normalizeAttackAbilityBasis(resolution.abilityBasis, inferAttackAbilityBasis(attackType))
      : resolution.abilityBasis,
    dc: resolution.dc || (isSave ? "monster" : resolution.dc),
    bonus: resolution.bonus || (isAttack ? "monster" : resolution.bonus),
    reach: resolution.reach,
    range: resolution.range,
  };
}

function normalizeDamagePart(part, rules = {}, index = 0) {
  if (!isPlainObject(part)) return null;
  const mode = normalizeEnum(part.mode || "budget", DAMAGE_MODES, "budget");
  const budgetRole = normalizeDamageBudgetRole(
    part.budgetRole,
    mode === "budget" ? getDefaultDamageBudgetRole(rules) : "none",
  );
  return {
    ...part,
    id: cleanString(part.id) || `part-${index + 1}`,
    label: cleanString(part.label),
    mode,
    scale: part.scale || "standard",
    budgetRole,
    budgetShare: normalizePositiveNumber(part.budgetShare, undefined),
    expectedTargets: normalizePositiveNumber(part.expectedTargets, undefined),
    roundWeight: Array.isArray(part.roundWeight)
      ? part.roundWeight.map(Number).filter(Number.isFinite)
      : part.roundWeight,
    abilityBasis: part.abilityBasis ? normalizeAttackAbilityBasis(part.abilityBasis, "monster") : part.abilityBasis,
    types: uniqueArray(part.types || part.type),
  };
}


function normalizeDamage(damage, rules = {}) {
  if (!isPlainObject(damage)) return null;
  const parts = Array.isArray(damage.parts)
    ? damage.parts.map((part, index) => normalizeDamagePart(part, rules, index)).filter(Boolean)
    : [];
  const mode = normalizeEnum(damage.mode, DAMAGE_MODES, parts.length ? "parts" : "custom");
  const budgetRole = normalizeDamageBudgetRole(
    damage.budgetRole,
    mode === "budget" ? getDefaultDamageBudgetRole(rules) : "none",
  );
  return {
    ...damage,
    mode: parts.length ? mode === "none" ? "parts" : mode : mode,
    scale: damage.scale || "standard",
    budgetRole,
    budgetShare: normalizePositiveNumber(damage.budgetShare, undefined),
    expectedTargets: normalizePositiveNumber(damage.expectedTargets, undefined),
    roundWeight: Array.isArray(damage.roundWeight)
      ? damage.roundWeight.map(Number).filter(Number.isFinite)
      : damage.roundWeight,
    abilityBasis: damage.abilityBasis
      ? normalizeAttackAbilityBasis(damage.abilityBasis, "monster")
      : damage.abilityBasis,
    types: uniqueArray(damage.types || damage.type),
    parts,
  };
}


function normalizeConditionEscape(escape) {
  if (!isPlainObject(escape)) return null;
  const hasExplicitEnabled = Object.prototype.hasOwnProperty.call(escape, "enabled");
  const enabled = hasExplicitEnabled
    ? Boolean(escape.enabled)
    : Boolean(escape.dc || escape.ability || escape.text);
  return {
    ...escape,
    enabled,
    dc: escape.dc || (enabled ? "monster" : escape.dc),
    dcSource: normalizeEnum(escape.dcSource, CONDITION_ESCAPE_DC_SOURCES, escape.dc && escape.dc !== "monster" ? "fixed" : "monster"),
    ability: normalizeSaveAbility(escape.ability) || (enabled ? "strength" : null),
    text: cleanString(escape.text),
  };
}

function normalizeRepeatSave(repeatSave) {
  if (!isPlainObject(repeatSave)) return null;
  const hasExplicitEnabled = Object.prototype.hasOwnProperty.call(repeatSave, "enabled");
  const enabled = hasExplicitEnabled
    ? Boolean(repeatSave.enabled)
    : Boolean(repeatSave.ability || repeatSave.timing || repeatSave.text);
  return {
    ...repeatSave,
    enabled,
    ability: normalizeSaveAbility(repeatSave.ability) || (enabled ? "constitution" : null),
    timing: normalizeEnum(repeatSave.timing, CONDITION_REPEAT_SAVE_TIMINGS, "endOfTurn"),
    endsOnSuccess: repeatSave.endsOnSuccess === undefined ? true : Boolean(repeatSave.endsOnSuccess),
    text: cleanString(repeatSave.text),
  };
}

function normalizeCondition(condition) {
  if (!isPlainObject(condition)) return null;
  const escape = normalizeConditionEscape(condition.escape);
  const repeatSave = normalizeRepeatSave(condition.repeatSave);
  return {
    ...condition,
    names: uniqueArray(condition.names || condition.name),
    severity: normalizeEnum(condition.severity, CONDITION_SEVERITY, "moderate"),
    direction: normalizeEnum(condition.direction, CONDITION_DIRECTIONS, "enemy"),
    duration: cleanString(condition.duration),
    sizeLimit: cleanString(condition.sizeLimit),
    special: uniqueArray(condition.special),
    escape,
    repeatSave,
  };
}

function normalizeSpellList(list, index = 0) {
  if (!isPlainObject(list)) return null;
  const spellRefs = uniqueArray(list.spellRefs || list.refs || list.ids);
  const spells = uniqueArray(list.spells || list.names || list.manualSpells);
  const labelFallback = index === 0 ? "At will" : "1/day each";
  return {
    ...list,
    id: cleanString(list.id) || cleanString(list.usage) || `spell-list-${index + 1}`,
    usage: normalizeEnum(list.usage, SPELLCASTING_LIST_USAGES, index === 0 ? "atWill" : "daily1"),
    label: cleanString(list.label) || labelFallback,
    spellRefs,
    spells,
  };
}

function normalizeSpellcasting(spellcasting) {
  if (!isPlainObject(spellcasting)) return null;
  const lists = Array.isArray(spellcasting.lists)
    ? spellcasting.lists.map((list, index) => normalizeSpellList(list, index)).filter(Boolean)
    : [];
  const hasExplicitEnabled = Object.prototype.hasOwnProperty.call(spellcasting, "enabled");
  const enabled = hasExplicitEnabled
    ? Boolean(spellcasting.enabled)
    : Boolean(lists.length || spellcasting.text || spellcasting.ability);
  return {
    ...spellcasting,
    enabled,
    ability: normalizeEnum(spellcasting.ability, SPELLCASTING_ABILITY_OPTIONS, "wisdom"),
    saveDc: normalizeEnum(spellcasting.saveDc, SPELLCASTING_DC_SOURCES, "monster"),
    attackBonus: normalizeEnum(spellcasting.attackBonus, SPELLCASTING_ATTACK_BONUS_SOURCES, "monster"),
    requiresMaterialComponents: Boolean(spellcasting.requiresMaterialComponents),
    lists,
    text: cleanString(spellcasting.text),
  };
}

function normalizeDefense(defense) {
  if (!isPlainObject(defense)) return null;
  const hasExplicitEnabled = Object.prototype.hasOwnProperty.call(defense, "enabled");
  const enabled = hasExplicitEnabled
    ? Boolean(defense.enabled)
    : Boolean(defense.type || defense.uses || defense.value || defense.timing || defense.text || defense.breakCondition);
  return {
    ...defense,
    enabled,
    type: normalizeEnum(defense.type, DEFENSE_FEATURE_TYPES, "custom"),
    uses: normalizePositiveNumber(defense.uses, null),
    value: normalizePositiveNumber(defense.value, null),
    timing: normalizeEnum(defense.timing, DEFENSE_TIMINGS, "passive"),
    damageTypes: uniqueArray(defense.damageTypes || defense.damageType),
    breakCondition: cleanString(defense.breakCondition),
    text: cleanString(defense.text),
  };
}

function normalizeOngoing(ongoing, rules = {}) {
  if (!isPlainObject(ongoing)) return null;
  const hasExplicitEnabled = Object.prototype.hasOwnProperty.call(ongoing, "enabled");
  const damageRules = { ...rules, actionEconomy: rules.actionEconomy || "freeTrigger", usage: rules.usage || { type: "triggered" } };
  const damage = normalizeDamage(ongoing.damage, damageRules);
  const enabled = hasExplicitEnabled
    ? Boolean(ongoing.enabled)
    : Boolean(ongoing.timing || ongoing.text || ongoing.endCondition || damage);
  return {
    ...ongoing,
    enabled,
    timing: normalizeEnum(ongoing.timing, ONGOING_TIMINGS, "startOfTargetTurn"),
    damage,
    endCondition: cleanString(ongoing.endCondition),
    text: cleanString(ongoing.text),
  };
}

function normalizeAreaEffect(areaEffect) {
  if (!isPlainObject(areaEffect)) return null;
  const hasExplicitEnabled = Object.prototype.hasOwnProperty.call(areaEffect, "enabled");
  const enabled = hasExplicitEnabled
    ? Boolean(areaEffect.enabled)
    : Boolean(areaEffect.type || areaEffect.shape || areaEffect.size || areaEffect.timing || areaEffect.text);
  return {
    ...areaEffect,
    enabled,
    type: normalizeEnum(areaEffect.type, AREA_EFFECT_TYPES, "aura"),
    shape: cleanString(areaEffect.shape || "emanation"),
    size: normalizePositiveNumber(areaEffect.size, null),
    unit: cleanString(areaEffect.unit) || "ft",
    origin: normalizeEnum(areaEffect.origin, AREA_EFFECT_ORIGINS, "self"),
    timing: normalizeEnum(areaEffect.timing, AREA_EFFECT_TIMINGS, "passive"),
    targets: cleanString(areaEffect.targets || "creatures"),
    excludes: uniqueArray(areaEffect.excludes),
    repeatTiming: normalizeEnum(areaEffect.repeatTiming, AREA_EFFECT_TIMINGS, areaEffect.timing || "passive"),
    text: cleanString(areaEffect.text),
  };
}

function normalizeSummon(summon) {
  if (!isPlainObject(summon)) return null;
  const hasExplicitEnabled = Object.prototype.hasOwnProperty.call(summon, "enabled");
  const enabled = hasExplicitEnabled
    ? Boolean(summon.enabled)
    : Boolean(
        summon.type ||
        summon.creatureRef ||
        summon.creatureName ||
        summon.count ||
        summon.placement ||
        summon.duration ||
        summon.initiative ||
        summon.control ||
        summon.text
      );
  return {
    ...summon,
    enabled,
    type: normalizeEnum(summon.type, SUMMON_TYPES, "summon"),
    creatureRef: cleanString(summon.creatureRef),
    creatureName: cleanString(summon.creatureName || summon.name || summon.creatureRef),
    count: cleanString(summon.count || "1"),
    placement: cleanString(summon.placement),
    duration: cleanString(summon.duration),
    initiative: normalizeEnum(summon.initiative, SUMMON_INITIATIVES, "immediatelyAfterSummoner"),
    control: normalizeEnum(summon.control, SUMMON_CONTROLS, "underSummonerControl"),
    limit: cleanString(summon.limit),
    trigger: cleanString(summon.trigger),
    text: cleanString(summon.text),
  };
}

function normalizeProcedureOngoingDamage(ongoingDamage, rules = {}) {
  if (!isPlainObject(ongoingDamage)) return null;
  const hasExplicitEnabled = Object.prototype.hasOwnProperty.call(ongoingDamage, "enabled");
  const damageRules = { ...rules, actionEconomy: rules.actionEconomy || "freeTrigger", usage: rules.usage || { type: "triggered" } };
  const damage = normalizeDamage(ongoingDamage.damage, damageRules);
  const enabled = hasExplicitEnabled
    ? Boolean(ongoingDamage.enabled)
    : Boolean(ongoingDamage.timing || ongoingDamage.text || ongoingDamage.endCondition || damage);
  return {
    ...ongoingDamage,
    enabled,
    timing: normalizeEnum(ongoingDamage.timing, PROCEDURE_ONGOING_TIMINGS, "startOfMonsterTurn"),
    damage,
    endCondition: cleanString(ongoingDamage.endCondition),
    text: cleanString(ongoingDamage.text),
  };
}

function normalizeProcedure(procedure, rules = {}) {
  if (!isPlainObject(procedure)) return null;
  const ongoingDamage = normalizeProcedureOngoingDamage(procedure.ongoingDamage, rules);
  const hasExplicitEnabled = Object.prototype.hasOwnProperty.call(procedure, "enabled");
  const enabled = hasExplicitEnabled
    ? Boolean(procedure.enabled)
    : Boolean(
        procedure.type ||
        procedure.targetLimit ||
        procedure.prerequisite ||
        procedure.entryEffect ||
        procedure.internalState ||
        procedure.escapeCondition ||
        procedure.releaseCondition ||
        procedure.text ||
        ongoingDamage
      );
  return {
    ...procedure,
    enabled,
    type: normalizeEnum(procedure.type, PROCEDURE_TYPES, "custom"),
    targetLimit: cleanString(procedure.targetLimit),
    prerequisite: cleanString(procedure.prerequisite),
    entryEffect: cleanString(procedure.entryEffect),
    internalState: cleanString(procedure.internalState),
    ongoingDamage,
    escapeCondition: cleanString(procedure.escapeCondition),
    releaseCondition: cleanString(procedure.releaseCondition),
    text: cleanString(procedure.text),
  };
}

function mergeExplicitRules(feature = {}) {
  const inferred = inferRulesFromLegacy(feature);
  const explicit = feature.rules || {};
  const section = normalizeEnum(explicit.section || feature.section, RULES_SECTIONS, inferred.section);
  const resolution = normalizeResolution(explicit.resolution, inferred.resolution);

  return {
    ...inferred,
    ...explicit,
    schemaVersion: explicit.schemaVersion || MONSTER_GRAFT_RULES_SCHEMA_VERSION,
    section,
    actionEconomy: normalizeEnum(
      explicit.actionEconomy,
      ACTION_ECONOMY_TYPES,
      getRulesFallbackActionEconomy(section),
    ),
    usage: normalizeUsage(explicit.usage || inferred.usage, section),
    trigger: explicit.trigger ?? inferred.trigger,
    resolution,
    secondaryResolution: explicit.secondaryResolution
      ? normalizeResolution(explicit.secondaryResolution, { type: "none" })
      : inferred.secondaryResolution,
    targeting: explicit.targeting || inferred.targeting,
    areaEffect: normalizeAreaEffect(explicit.areaEffect) || inferred.areaEffect || null,
    damage: normalizeDamage(explicit.damage, { ...inferred, ...explicit, section, actionEconomy: getRulesFallbackActionEconomy(section), resolution }) || inferred.damage,
    condition: normalizeCondition(explicit.condition) || inferred.condition,
    ongoing: normalizeOngoing(explicit.ongoing, { ...inferred, ...explicit, section, actionEconomy: getRulesFallbackActionEconomy(section), resolution }) || inferred.ongoing || null,
    counterplay: {
      ...(inferred.counterplay || {}),
      ...(explicit.counterplay || {}),
    },
    text: {
      ...(inferred.text || {}),
      ...(explicit.text || {}),
    },
    multiattack: normalizeMultiattack(explicit.multiattack) || inferred.multiattack || null,
    multiattackParticipation: normalizeMultiattackParticipation(explicit.multiattackParticipation) || inferred.multiattackParticipation || null,
    spellcasting: normalizeSpellcasting(explicit.spellcasting) || inferred.spellcasting || null,
    defense: normalizeDefense(explicit.defense) || inferred.defense || null,
    summon: normalizeSummon(explicit.summon) || inferred.summon || null,
    procedure: normalizeProcedure(explicit.procedure, { ...inferred, ...explicit, section, actionEconomy: getRulesFallbackActionEconomy(section), resolution }) || inferred.procedure || null,
    references: normalizeAbilityReferences(explicit.references).length ? normalizeAbilityReferences(explicit.references) : inferred.references || [],
    migration: {
      source: "explicit-rules",
      isStructured: true,
      ...(explicit.migration || {}),
    },
  };
}

export function normalizeMonsterGraftRules(feature = {}) {
  return feature.rules ? mergeExplicitRules(feature) : inferRulesFromLegacy(feature);
}



export const BLOCKING_DAMAGE_ISSUE_CODES = Object.freeze([
  "damage-missing-explicit-amount",
  "damage-half-success-without-failure-amount",
  "damage-budget-role-mismatch",
  "damage-missing-budget-role",
]);

function normalizeTextForValidation(value) {
  return cleanString(value).toLowerCase();
}

function textMentionsOutgoingDamage(value = "") {
  const text = normalizeTextForValidation(value);
  if (!text) return false;
  if (/\b(resistance|immunity|vulnerability|resistant|immune|vulnerable)\b[^.]*\bdamage\b/.test(text)) return false;
  if (/\b(takes?|deals?|taking|dealing|suffers?|extra|bonus|half)\b[^.]*\bdamage\b/.test(text)) return true;
  if (/\bhalf damage\b/.test(text)) return true;
  return false;
}

function textHasExplicitDamageAmount(value = "") {
  const text = cleanString(value);
  if (!text) return false;
  return /\{damage(?:[-A-Za-z0-9_:]*)?\}|\{damage-part:[^}]+\}|\{pb\}|proficiency bonus|\b\d+\s*\([^)]*\d+d\d+[^)]*\)|\b\d+d\d+\b/i.test(text);
}

function getRulesDamageTextFragments(rules = {}) {
  const text = rules.text || {};
  return [text.hit, text.failure, text.success, text.response, text.effect, text.hitOrMiss, text.failureOrSuccess].filter(Boolean);
}

function getExpectedDamageBudgetRoles(rules = {}) {
  if (rules.actionEconomy === "deathTrigger") return ["deathBurst"];
  if (rules.actionEconomy === "reaction") return ["reactionPunish", "deathBurst"];
  if (rules.actionEconomy === "bonusAction") return ["bonusAction"];
  if (rules.actionEconomy === "legendaryAction") return ["legendaryStrike"];
  if (rules.actionEconomy === "lairAction") return ["lairPulse"];
  if (rules.usage?.type === "recharge") return ["rechargeBurst", "rechargeControl", "ongoing"];
  return [];
}

function pushIssue(issues, severity, code, message, path = "rules") {
  issues.push({ severity, code, message, path });
}

export function validateMonsterGraftRules(feature = {}) {
  const rules = normalizeMonsterGraftRules(feature);
  const issues = [];
  const structured = Boolean(feature.rules);
  const resolutionType = rules.resolution?.type || "none";

  if (!structured) {
    pushIssue(
      issues,
      "warning",
      "legacy-rules-inference",
      "This graft still relies on inferred rules. Add an explicit rules object before final migration.",
    );
  }

  if (rules.actionEconomy === "reaction" && !rules.trigger) {
    pushIssue(issues, "error", "reaction-missing-trigger", "Reaction grafts must define a trigger.");
  }

  if (rules.usage?.type === "recharge" && !rules.usage.value) {
    pushIssue(issues, "error", "recharge-missing-value", "Recharge abilities must define a recharge value, such as 5-6.");
  }

  if (resolutionType === "attackRoll" || resolutionType === "attackRollSavingThrow") {
    if (!rules.resolution.attackType) {
      pushIssue(issues, "error", "attack-missing-type", "Attack Roll abilities must define melee, ranged, or meleeOrRanged.");
    }
    if (!rules.resolution.abilityBasis) {
      pushIssue(issues, "warning", "attack-missing-ability-basis", "Attack Roll abilities should declare whether their attack basis is Strength, Dexterity, spellcasting, monster, or custom.");
    }
    if (!rules.damage || rules.damage.mode === "none") {
      pushIssue(issues, "warning", "attack-missing-damage", "Attack Roll abilities should define structured damage.");
    }
  }

  if (resolutionType === "savingThrow" || resolutionType === "attackRollSavingThrow") {
    if (!rules.resolution.ability) {
      pushIssue(issues, "error", "save-missing-ability", "Saving Throw abilities must define the save ability.");
    }
    if (!rules.resolution.dc) {
      pushIssue(issues, "error", "save-missing-dc", "Saving Throw abilities must define a DC source.");
    }
    if (!rules.text?.failure && !rules.text?.response && !rules.text?.effect && structured) {
      pushIssue(issues, "warning", "save-missing-failure", "Structured Saving Throw abilities should define Failure text or a structured response/effect.");
    }
  }

  if (rules.secondaryResolution?.type === "savingThrow") {
    if (!rules.secondaryResolution.ability) {
      pushIssue(issues, "error", "secondary-save-missing-ability", "Secondary Saving Throw must define the save ability.");
    }
    if (!rules.secondaryResolution.dc) {
      pushIssue(issues, "error", "secondary-save-missing-dc", "Secondary Saving Throw must define a DC source.");
    }
  }

  const damageParts = getDamageParts(rules.damage);
  const budgetDamageEntries = damageParts.length ? damageParts : rules.damage?.mode === "budget" ? [rules.damage] : [];
  const expectedBudgetRoles = getExpectedDamageBudgetRoles(rules);
  const explicitDamageTexts = getRulesDamageTextFragments(rules);
  const textMentionsDamage = explicitDamageTexts.some(textMentionsOutgoingDamage);
  const textHasAmount = explicitDamageTexts.some(textHasExplicitDamageAmount);
  const successMentionsHalfDamage = textMentionsOutgoingDamage(rules.text?.success || "") && /half/i.test(cleanString(rules.text?.success || ""));

  budgetDamageEntries.forEach((damageEntry, index) => {
    const label = damageParts.length ? `Damage part ${damageEntry.id || index + 1}` : "Budget damage";
    const path = damageParts.length ? `rules.damage.parts.${index}` : "rules.damage";
    if (!damageEntry.budgetRole || damageEntry.budgetRole === "none") {
      pushIssue(issues, "error", "damage-missing-budget-role", `${label} must define a role such as mainAttack, rechargeBurst, reactionPunish, or deathBurst.`, path);
    }
    if (expectedBudgetRoles.length && !expectedBudgetRoles.includes(damageEntry.budgetRole)) {
      pushIssue(issues, "error", "damage-budget-role-mismatch", `${label} uses ${damageEntry.budgetRole || "none"}, but ${rules.actionEconomy || rules.usage?.type} abilities should use ${expectedBudgetRoles.join(" or ")}.`, path);
    }
    if (damageEntry.budgetShare == null) {
      pushIssue(issues, "warning", "damage-missing-explicit-budget-share", `${label} should define an explicit budgetShare instead of relying on defaults.`, path);
    }
    const budgetShare = getDamageBudgetShare(damageEntry, rules);
    if (budgetShare <= 0) {
      pushIssue(issues, "warning", "damage-missing-budget-share", `${label} should resolve to a positive budget share.`, path);
    }
    if (budgetShare > 1.5 && rules.usage?.type !== "recharge" && rules.actionEconomy !== "deathTrigger") {
      pushIssue(issues, "warning", "damage-share-high", `${label} shares above 150% should normally be reserved for recharge or death burst abilities.`, path);
    }
  });

  if (budgetDamageEntries.length && textMentionsDamage && !textHasAmount) {
    pushIssue(issues, "error", "damage-missing-explicit-amount", "Damage text must include {damage}, {damage-part:id}, {pb}, a Proficiency Bonus amount, or explicit dice/average damage.", "rules.text");
  }

  if (budgetDamageEntries.length && successMentionsHalfDamage && !textHasAmount) {
    pushIssue(issues, "error", "damage-half-success-without-failure-amount", "Success text says half damage, but the failure/hit/response text has no explicit damage amount.", "rules.text.success");
  }

  if (rules.multiattackParticipation?.enabled) {
    const participation = rules.multiattackParticipation;
    if (participation.role !== "excluded" && rules.actionEconomy !== "action") {
      pushIssue(issues, "warning", "multiattack-participation-non-action", "Automatic Multiattack participation should normally be limited to Actions.", "rules.multiattackParticipation");
    }
    if (["primary", "choice"].includes(participation.role) && !["attackRoll", "attackRollSavingThrow"].includes(resolutionType)) {
      pushIssue(issues, "warning", "multiattack-participation-non-attack", "Primary and choice Multiattack entries should resolve as attack rolls.", "rules.multiattackParticipation.role");
    }
    if (["primary", "choice"].includes(participation.role) && rules.usage?.type !== "atWill") {
      pushIssue(issues, "warning", "multiattack-participation-limited-use", "Recharge and limited-use actions should normally be replacements or additional abilities, not repeatable Multiattack attacks.", "rules.multiattackParticipation.role");
    }
  }

  if (rules.multiattack?.enabled) {
    if (rules.section !== "action" && rules.actionEconomy !== "action") {
      pushIssue(issues, "warning", "multiattack-non-action", "Multiattack should normally be printed as an Action.", "rules.multiattack");
    }
    if (!rules.multiattack.template && !rules.multiattack.attacks?.length) {
      pushIssue(issues, "error", "multiattack-missing-attacks", "Multiattack must define attacks or a custom template.", "rules.multiattack");
    }
    const totalAttacks = (rules.multiattack.attacks || []).reduce((sum, attack) => sum + Number(attack.count || 0), 0);
    if (!rules.multiattack.template && totalAttacks <= 0) {
      pushIssue(issues, "error", "multiattack-invalid-count", "Multiattack must resolve to at least one attack.", "rules.multiattack.attacks");
    }
    if ((rules.multiattack.replacements || []).some((replacement) => replacement.replace !== "none" && !replacement.label && !replacement.with)) {
      pushIssue(issues, "warning", "multiattack-replacement-missing-label", "Multiattack replacements should define the replacing ability label.", "rules.multiattack.replacements");
    }
  }

  if (rules.spellcasting?.enabled) {
    if (!rules.spellcasting.ability) {
      pushIssue(issues, "error", "spellcasting-missing-ability", "Spellcasting must define a spellcasting ability.", "rules.spellcasting");
    }
    if (!rules.spellcasting.lists?.length && !rules.spellcasting.text) {
      pushIssue(issues, "warning", "spellcasting-missing-spells", "Spellcasting should define at least one spell list or custom spellcasting text.", "rules.spellcasting.lists");
    }
    const emptyLists = (rules.spellcasting.lists || []).filter((list) => !list.spellRefs?.length && !list.spells?.length);
    if (emptyLists.length) {
      pushIssue(issues, "warning", "spellcasting-empty-list", "Spellcasting lists should include spell references or manual spell names.", "rules.spellcasting.lists");
    }
  }

  if (rules.defense?.enabled) {
    if (!rules.defense.type) {
      pushIssue(issues, "error", "defense-missing-type", "Defense features must define a defense type.", "rules.defense");
    }
    if (rules.defense.type === "legendaryResistance" && !rules.defense.uses) {
      pushIssue(issues, "warning", "legendary-resistance-missing-uses", "Legendary Resistance should define how many uses it has.", "rules.defense.uses");
    }
    if (rules.defense.type === "regeneration" && !rules.defense.value) {
      pushIssue(issues, "warning", "regeneration-missing-value", "Regeneration should define how many Hit Points are regained.", "rules.defense.value");
    }
    if (rules.defense.type === "regeneration" && !rules.defense.breakCondition) {
      pushIssue(issues, "warning", "regeneration-missing-break-condition", "Regeneration should define a damage type or condition that stops it.", "rules.defense.breakCondition");
    }
    if (["parry", "damageReduction"].includes(rules.defense.type) && !rules.defense.value) {
      pushIssue(issues, "warning", "defense-missing-value", "Parry and damage reduction should define the numeric defensive value.", "rules.defense.value");
    }
  }

  if (rules.summon?.enabled) {
    if (!rules.summon.type) {
      pushIssue(issues, "error", "summon-missing-type", "Summon features must define summon, create, animate, transform, spawn, or custom type.", "rules.summon.type");
    }
    if (!rules.summon.creatureName && !rules.summon.creatureRef) {
      pushIssue(issues, "warning", "summon-missing-creature", "Summon features should define the creature or entity being created.", "rules.summon.creatureName");
    }
    if (!rules.summon.count) {
      pushIssue(issues, "warning", "summon-missing-count", "Summon features should define how many creatures or entities appear.", "rules.summon.count");
    }
    if (!rules.summon.duration) {
      pushIssue(issues, "warning", "summon-missing-duration", "Summon features should define how long the summoned creatures remain.", "rules.summon.duration");
    }
  }


  if (rules.procedure?.enabled) {
    if (!rules.procedure.type) {
      pushIssue(issues, "error", "procedure-missing-type", "Special procedures must define a procedure type.", "rules.procedure.type");
    }
    if (!rules.procedure.entryEffect && !rules.procedure.text) {
      pushIssue(issues, "warning", "procedure-missing-entry-effect", "Special procedures should define what happens when the procedure starts, or provide custom procedure text.", "rules.procedure.entryEffect");
    }
    if (["swallow", "engulf", "possession"].includes(rules.procedure.type) && !rules.procedure.releaseCondition && !rules.procedure.text) {
      pushIssue(issues, "warning", "procedure-missing-release-condition", "Containment or control procedures should define how the target is released or the effect ends.", "rules.procedure.releaseCondition");
    }
    if (rules.procedure.ongoingDamage?.enabled && !rules.procedure.ongoingDamage.damage) {
      pushIssue(issues, "warning", "procedure-ongoing-missing-damage", "Procedure ongoing damage should define a damage block.", "rules.procedure.ongoingDamage.damage");
    }
  }

  if (["major", "severe"].includes(rules.condition?.severity)) {
    if (!rules.condition.duration || rules.condition.duration === "unspecified") {
      pushIssue(issues, "warning", "condition-missing-duration", "Major or severe conditions should define a duration.");
    }
    if (!rules.counterplay?.breakCondition && !rules.counterplay?.nonDamageAnswer && !rules.condition?.repeatSave?.enabled && !rules.condition?.escape?.enabled) {
      pushIssue(issues, "warning", "condition-missing-counterplay", "Major or severe conditions should define break, repeat save, escape, or non-damage counterplay.");
    }
  }

  if (rules.condition?.escape?.enabled) {
    if (!rules.condition.escape.dc) {
      pushIssue(issues, "error", "escape-missing-dc", "Escape conditions must define an escape DC source.", "rules.condition.escape");
    }
    if (!rules.condition.escape.ability) {
      pushIssue(issues, "warning", "escape-missing-ability", "Escape conditions should define an ability basis, usually Strength.", "rules.condition.escape");
    }
    if (!rules.condition.names?.some((name) => ["grappled", "restrained"].includes(name))) {
      pushIssue(issues, "warning", "escape-without-grapple", "Escape DC is usually paired with the Grappled or Restrained condition.", "rules.condition.escape");
    }
  }

  if (rules.condition?.repeatSave?.enabled) {
    if (!rules.condition.repeatSave.ability) {
      pushIssue(issues, "error", "repeat-save-missing-ability", "Repeat saves must define a save ability.", "rules.condition.repeatSave");
    }
    if (!rules.condition.repeatSave.timing) {
      pushIssue(issues, "error", "repeat-save-missing-timing", "Repeat saves must define when the save happens.", "rules.condition.repeatSave");
    }
  }

  if (rules.ongoing?.enabled) {
    if (!rules.ongoing.timing) {
      pushIssue(issues, "error", "ongoing-missing-timing", "Ongoing effects must define their timing.", "rules.ongoing");
    }
    if (!rules.ongoing.damage && !rules.ongoing.text) {
      pushIssue(issues, "warning", "ongoing-missing-effect", "Ongoing effects should define structured damage or explicit ongoing text.", "rules.ongoing");
    }
    if (rules.ongoing.damage?.mode === "budget" && getDamageBudgetShare(rules.ongoing.damage, rules) <= 0) {
      pushIssue(issues, "warning", "ongoing-missing-budget-share", "Ongoing budget damage should resolve to a positive budget share.", "rules.ongoing.damage");
    }
  }

  if (rules.areaEffect?.enabled) {
    if (!rules.areaEffect.timing) {
      pushIssue(issues, "error", "area-effect-missing-timing", "Area effects must define when creatures are affected.", "rules.areaEffect.timing");
    }
    if (!rules.areaEffect.text && !rules.damage && !rules.condition && !rules.ongoing?.enabled) {
      pushIssue(issues, "warning", "area-effect-missing-effect", "Area effects should define text, damage, condition, or ongoing effect.", "rules.areaEffect");
    }
  }

  if (rules.references?.length) {
    rules.references.forEach((reference, index) => {
      if (!reference.label && !reference.ref) {
        pushIssue(issues, "warning", "reference-missing-label", "Ability references should define a readable label or ref.", `rules.references.${index}`);
      }
      if (["replaceOneAttack", "replaceAnyAttack", "replaceOneOrMoreAttacks"].includes(reference.relationship) && !["action", "attack", "spellcasting", "feature"].includes(reference.type)) {
        pushIssue(issues, "warning", "reference-replacement-type", "Attack replacement references should point to an action, attack, spellcasting, or feature.", `rules.references.${index}`);
      }
    });
  }

  if (rules.targeting?.type === "area" && rules.damage && rules.condition?.severity === "severe") {
    pushIssue(
      issues,
      "warning",
      "severe-area-control",
      "Area damage plus severe control should be reviewed against Pressure and counterplay.",
    );
  }

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
    rules,
  };
}

export function summarizeMonsterGraftRules(features = []) {
  const validations = asArray(features).map((feature) => ({
    id: feature.id,
    title: feature.title,
    ...validateMonsterGraftRules(feature),
  }));
  return {
    total: validations.length,
    structured: validations.filter((entry) => entry.rules.migration?.isStructured).length,
    inferred: validations.filter((entry) => !entry.rules.migration?.isStructured).length,
    errors: validations.flatMap((entry) =>
      entry.issues
        .filter((issue) => issue.severity === "error")
        .map((issue) => ({ id: entry.id, title: entry.title, ...issue })),
    ),
    warnings: validations.flatMap((entry) =>
      entry.issues
        .filter((issue) => issue.severity === "warning")
        .map((issue) => ({ id: entry.id, title: entry.title, ...issue })),
    ),
  };
}
