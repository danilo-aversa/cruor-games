export const MONSTER_GRAFT_RULES_SCHEMA_VERSION = "monster-graft-rules-v1.1";

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
  "automatic",
  "check",
]);

export const DAMAGE_MODES = Object.freeze(["none", "fixed", "budget", "computed", "custom"]);

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

export const TEXT_MODES = Object.freeze(["generated", "manual"]);

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
  if (!damageTypes.length && !feature.stats?.dpr) return null;
  return {
    mode: feature.stats?.dpr ? "budget" : "custom",
    scale: feature.stats?.dpr >= 8 ? "high" : feature.stats?.dpr >= 4 ? "standard" : "minor",
    budgetRole: feature.stats?.dpr ? "mainAttack" : "none",
    types: damageTypes.length ? damageTypes : ["variable"],
  };
}

function inferCondition(text) {
  const lower = lowerClean(text);
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
  return {
    names,
    severity,
    duration: lower.includes("until") ? "defined in text" : "unspecified",
    special: lower.includes("cannot regain hit points") ? ["healing-denial"] : [],
  };
}

function inferTrigger(text, section) {
  const source = cleanString(text);
  const triggerMatch = source.match(/Trigger:\s*([^\.]+\.)/i);
  if (triggerMatch) return triggerMatch[1].trim();
  if (section === "reaction") return "Unspecified reaction trigger.";
  if (section === "death") return "The creature dies or drops to 0 hit points.";
  const whenMatch = source.match(/When\s+([^\.]+\.)/);
  return whenMatch?.[0] || null;
}

function inferRulesFromLegacy(feature = {}) {
  const text = `${feature.mechanics || ""} ${feature.counterplay || ""}`;
  const section = getRulesFallbackSection(feature);
  const recharge = inferRecharge(text);
  const attackResolution = inferAttackResolution(text);
  const saveResolution = inferSaveResolution(text);
  const resolution = attackResolution || saveResolution || { type: section === "trait" ? "none" : "automatic" };

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
    targeting: inferTargeting(feature.mechanics),
    damage: inferDamage(feature.mechanics, feature),
    condition: inferCondition(feature.mechanics),
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
    text: {},
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
  return {
    ...resolution,
    type,
    attackType,
    ability: type === "savingThrow" ? normalizeSaveAbility(resolution.ability) : resolution.ability,
    abilityBasis:
      type === "attackRoll"
        ? normalizeAttackAbilityBasis(resolution.abilityBasis, inferAttackAbilityBasis(attackType))
        : resolution.abilityBasis,
    dc: resolution.dc || (type === "savingThrow" ? "monster" : resolution.dc),
    bonus: resolution.bonus || (type === "attackRoll" ? "monster" : resolution.bonus),
  };
}

function normalizeDamage(damage, rules = {}) {
  if (!isPlainObject(damage)) return null;
  const mode = normalizeEnum(damage.mode, DAMAGE_MODES, "custom");
  const budgetRole = normalizeDamageBudgetRole(
    damage.budgetRole,
    mode === "budget" ? getDefaultDamageBudgetRole(rules) : "none",
  );
  return {
    ...damage,
    mode,
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
  };
}

function normalizeCondition(condition) {
  if (!isPlainObject(condition)) return null;
  return {
    ...condition,
    names: uniqueArray(condition.names || condition.name),
    severity: normalizeEnum(condition.severity, CONDITION_SEVERITY, "moderate"),
    special: uniqueArray(condition.special),
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
    damage: normalizeDamage(explicit.damage, { ...inferred, ...explicit, section, actionEconomy: getRulesFallbackActionEconomy(section), resolution }) || inferred.damage,
    condition: normalizeCondition(explicit.condition) || inferred.condition,
    counterplay: {
      ...(inferred.counterplay || {}),
      ...(explicit.counterplay || {}),
    },
    text: {
      ...(inferred.text || {}),
      ...(explicit.text || {}),
      mode: normalizeEnum(explicit.text?.mode, TEXT_MODES, explicit.text?.manual ? "manual" : "generated"),
      manual: explicit.text?.manual ? cleanString(explicit.text.manual) : explicit.text?.manual,
    },
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

  if (rules.text?.mode === "manual" && !rules.text?.manual) {
    pushIssue(issues, "warning", "manual-text-empty", "Manual text mode is enabled but no manual stat block text is defined.");
  }

  if (resolutionType === "attackRoll") {
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

  if (resolutionType === "savingThrow") {
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

  if (rules.damage?.mode === "budget") {
    if (!rules.damage.budgetRole || rules.damage.budgetRole === "none") {
      pushIssue(issues, "warning", "damage-missing-budget-role", "Budget damage should define a role such as mainAttack, rechargeBurst, reactionPunish, or deathBurst.");
    }
    const budgetShare = getDamageBudgetShare(rules.damage, rules);
    if (budgetShare <= 0) {
      pushIssue(issues, "warning", "damage-missing-budget-share", "Budget damage should resolve to a positive budget share.");
    }
    if (budgetShare > 1.5 && rules.usage?.type !== "recharge" && rules.actionEconomy !== "deathTrigger") {
      pushIssue(issues, "warning", "damage-share-high", "Damage budget shares above 150% should normally be reserved for recharge or death burst abilities.");
    }
  }

  if (["major", "severe"].includes(rules.condition?.severity)) {
    if (!rules.condition.duration || rules.condition.duration === "unspecified") {
      pushIssue(issues, "warning", "condition-missing-duration", "Major or severe conditions should define a duration.");
    }
    if (!rules.counterplay?.breakCondition && !rules.counterplay?.nonDamageAnswer) {
      pushIssue(issues, "warning", "condition-missing-counterplay", "Major or severe conditions should define break or non-damage counterplay.");
    }
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
