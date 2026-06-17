import { getFeatureBalanceStat } from "../../model/monster-graft-balance-profile.js";
export const MONSTER_RULES_ENGINE_VERSION = "dnd-legal-rules-v0.1";

const ABILITY_KEYS = Object.freeze(["str", "dex", "con", "int", "wis", "cha"]);

const ABILITY_LABELS = Object.freeze({
  str: "Str",
  dex: "Dex",
  con: "Con",
  int: "Int",
  wis: "Wis",
  cha: "Cha",
});

const ABILITY_NAMES = Object.freeze({
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
  strength: "Strength",
  dexterity: "Dexterity",
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
});

const LONG_TO_SHORT_ABILITY = Object.freeze({
  strength: "str",
  dexterity: "dex",
  constitution: "con",
  intelligence: "int",
  wisdom: "wis",
  charisma: "cha",
  str: "str",
  dex: "dex",
  con: "con",
  int: "int",
  wis: "wis",
  cha: "cha",
});

const SIZE_HIT_DICE = Object.freeze({
  Tiny: 4,
  Small: 6,
  Medium: 8,
  Large: 10,
  Huge: 12,
  Gargantuan: 20,
});

const DEFAULT_DICE_BY_SIZE = Object.freeze({
  Tiny: [4, 6],
  Small: [4, 6, 8],
  Medium: [4, 6, 8, 10],
  Large: [6, 8, 10, 12],
  Huge: [8, 10, 12],
  Gargantuan: [10, 12],
});

const DAMAGE_SCALE_MULTIPLIERS = Object.freeze({
  minor: 0.45,
  light: 0.65,
  medium: 0.85,
  standard: 1,
  high: 1.25,
  heavy: 1.45,
});

const DAMAGE_BUDGET_ROLE_HINTS = Object.freeze({
  mainAttack: { divisor: 1, maxDice: 16 },
  secondaryAttack: { divisor: 1.65, maxDice: 12 },
  minorAttack: { divisor: 2.35, maxDice: 8 },
  bonusAction: { divisor: 2.75, maxDice: 8 },
  reactionPunish: { divisor: 2.2, maxDice: 10 },
  rechargeBurst: { divisor: 0.75, maxDice: 18 },
  rechargeControl: { divisor: 1.15, maxDice: 14 },
  deathBurst: { divisor: 0.7, maxDice: 18 },
  lairPulse: { divisor: 2.25, maxDice: 10 },
  legendaryStrike: { divisor: 2.45, maxDice: 8 },
  ongoing: { divisor: 3.25, maxDice: 6 },
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(Number(value || 0));
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function abilityMod(score) {
  return Math.floor((Number(score || 10) - 10) / 2);
}

export function scoreForAbilityMod(modifier) {
  return clamp(10 + Number(modifier || 0) * 2, 1, 30);
}

export function normalizeAbilityKey(value, fallback = "str") {
  const key = LONG_TO_SHORT_ABILITY[String(value || "").trim().toLowerCase()];
  return key || fallback;
}

export function abilityLabel(key) {
  return ABILITY_LABELS[normalizeAbilityKey(key)] || "Str";
}

export function abilityName(key) {
  const normalized = normalizeAbilityKey(key, key);
  return ABILITY_NAMES[normalized] || ABILITY_NAMES[String(key || "").toLowerCase()] || "Strength";
}

export function modText(value) {
  const number = Number(value || 0);
  return number >= 0 ? `+${number}` : `−${Math.abs(number)}`;
}

export function getProficiencyBonusForCr(cr) {
  const value = Number(cr || 0);
  if (value <= 4) return 2;
  if (value <= 8) return 3;
  if (value <= 12) return 4;
  if (value <= 16) return 5;
  if (value <= 20) return 6;
  if (value <= 24) return 7;
  if (value <= 28) return 8;
  return 9;
}

export function getStatBlockSize(roleId, explicitSize = null) {
  if (explicitSize && SIZE_HIT_DICE[explicitSize]) return explicitSize;
  if (roleId === "boss") return "Large";
  if (roleId === "minion") return "Small";
  return "Medium";
}

export function getHitDieForSize(size) {
  return SIZE_HIT_DICE[size] || SIZE_HIT_DICE.Medium;
}

function getBaseAbilityScores(typeId) {
  const bases = {
    undead: { str: 14, dex: 8, con: 16, int: 5, wis: 10, cha: 8 },
    beast: { str: 12, dex: 16, con: 12, int: 3, wis: 14, cha: 6 },
    aberration: { str: 14, dex: 12, con: 14, int: 12, wis: 14, cha: 10 },
  };
  return { ...(bases[typeId] || bases.undead) };
}

function applyCategoryAbilityAdjustments(scores, category) {
  const categoryAdjustments = {
    Zombie: { dex: -2, con: 2 },
    Skeleton: { dex: 2, con: -2 },
    Spirit: { str: -2, dex: 4, cha: 2 },
    Spider: { str: -2, dex: 2 },
    Wolf: { str: 2, wis: 1 },
    Bird: { dex: 3, wis: 1 },
    "Flesh Mass": { dex: -2, con: 4 },
    "Eye Horror": { dex: 1, int: 2, wis: 2 },
    Parasite: { dex: 3, con: -1 },
    "Psychic Predator": { int: 3, wis: 2, cha: 2 },
  };

  Object.entries(categoryAdjustments[category] || {}).forEach(([ability, value]) => {
    scores[ability] = Number(scores[ability] || 10) + value;
  });
}

function applyRoleAbilityAdjustments(scores, roleId) {
  if (roleId === "boss") {
    scores.str += 2;
    scores.con += 2;
    scores.wis += 2;
  }

  if (roleId === "minion") {
    scores.con -= 2;
  }
}

function applyFeatureAbilityAdjustments(scores, selectedFeatures = []) {
  selectedFeatures.forEach((feature) => {
    if ((getFeatureBalanceStat(feature, "hp")) >= 12) scores.con += 1;
    if ((getFeatureBalanceStat(feature, "mobility")) >= 1) scores.dex += 1;
    if ((getFeatureBalanceStat(feature, "control")) >= 2) scores.wis += 1;
  });
}

function getFeatureRules(feature) {
  return isPlainObject(feature?.rules) ? feature.rules : null;
}

function countRuleAbilities(selectedFeatures = [], path) {
  const counts = new Map();
  selectedFeatures.forEach((feature) => {
    const rules = getFeatureRules(feature);
    const value = path(rules);
    if (!value) return;
    const ability = normalizeAbilityKey(value, null);
    if (!ability) return;
    counts.set(ability, (counts.get(ability) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function inferPrimaryAttackAbility({ typeId, category, selectedFeatures = [] }) {
  const declared = countRuleAbilities(selectedFeatures, (rules) => rules?.resolution?.abilityBasis);
  if (declared && !["monster", "custom", "spellcasting"].includes(declared)) return declared;
  if (/spirit|ghost|wraith/i.test(String(category || ""))) return "dex";
  if (typeId === "beast") return "dex";
  return "str";
}

function inferPrimarySaveAbility({ typeId, category, selectedFeatures = [] }) {
  const declared = countRuleAbilities(selectedFeatures, (rules) => rules?.resolution?.ability);
  if (declared) return declared;
  if (/psychic|eye/i.test(String(category || ""))) return "wis";
  if (/spirit|ghost|wraith/i.test(String(category || ""))) return "cha";
  if (typeId === "aberration") return "wis";
  return "con";
}

function inferSpellcastingAbility({ typeId, category, selectedFeatures = [] }) {
  const declared = countRuleAbilities(selectedFeatures, (rules) => rules?.spellcasting?.ability);
  if (declared) return declared;
  if (/psychic|eye/i.test(String(category || ""))) return "int";
  if (/spirit|ghost|wraith/i.test(String(category || ""))) return "cha";
  if (typeId === "aberration") return "wis";
  return "wis";
}

function buildSavingThrowProficiencies({ typeId, roleId }) {
  const proficientSaves = new Set(["con", "wis"]);
  if (typeId === "beast") proficientSaves.add("dex");
  if (typeId === "aberration") proficientSaves.add("int");
  if (roleId === "boss") {
    proficientSaves.add("str");
    proficientSaves.add("dex");
  }
  return proficientSaves;
}

export function buildAbilityRows(scores, proficiencyBonus, proficientSaves = new Set()) {
  function row(key) {
    const score = clamp(round(scores[key] || 10), 1, 30);
    const mod = abilityMod(score);
    const save = mod + (proficientSaves.has(key) ? proficiencyBonus : 0);
    return { key, label: ABILITY_LABELS[key], score, mod, save };
  }

  return {
    physical: [row("str"), row("dex"), row("con")],
    mental: [row("int"), row("wis"), row("cha")],
  };
}

function enforceAbilityMod(scores, ability, requiredMod) {
  const key = normalizeAbilityKey(ability, null);
  if (!key) return;
  const targetScore = scoreForAbilityMod(requiredMod);
  scores[key] = Math.max(Number(scores[key] || 10), targetScore);
}

export function buildLegalAbilityProfile({
  typeId,
  category,
  roleId,
  selectedFeatures = [],
  targetAttackBonus,
  targetSaveDc,
  proficiencyBonus,
}) {
  const pb = Number(proficiencyBonus || 2);
  const primaryAttackAbility = inferPrimaryAttackAbility({ typeId, category, selectedFeatures });
  const primarySaveAbility = inferPrimarySaveAbility({ typeId, category, selectedFeatures });
  const spellcastingAbility = inferSpellcastingAbility({ typeId, category, selectedFeatures });
  const scores = getBaseAbilityScores(typeId);

  applyCategoryAbilityAdjustments(scores, category);
  applyRoleAbilityAdjustments(scores, roleId);
  applyFeatureAbilityAdjustments(scores, selectedFeatures);

  const requiredMods = {};
  const addRequiredMod = (ability, modifier) => {
    const key = normalizeAbilityKey(ability, null);
    if (!key) return;
    requiredMods[key] = Math.max(requiredMods[key] ?? -99, Number(modifier || 0));
  };
  addRequiredMod(primaryAttackAbility, Number(targetAttackBonus || pb + 2) - pb);
  addRequiredMod(primarySaveAbility, Number(targetSaveDc || 10 + pb) - 8 - pb);

  ABILITY_KEYS.forEach((key) => {
    scores[key] = Object.prototype.hasOwnProperty.call(requiredMods, key)
      ? scoreForAbilityMod(requiredMods[key])
      : clamp(round(scores[key] || 10), 1, 30);
  });

  const proficientSaves = buildSavingThrowProficiencies({ typeId, roleId });
  const rows = buildAbilityRows(scores, pb, proficientSaves);
  const attackModifier = abilityMod(scores[primaryAttackAbility]);
  const saveModifier = abilityMod(scores[primarySaveAbility]);
  const spellcastingModifier = abilityMod(scores[spellcastingAbility]);

  return {
    version: MONSTER_RULES_ENGINE_VERSION,
    abilityScores: scores,
    rows,
    primaryAttackAbility,
    primaryAttackAbilityName: abilityName(primaryAttackAbility),
    primarySaveAbility,
    primarySaveAbilityName: abilityName(primarySaveAbility),
    spellcastingAbility,
    spellcastingAbilityName: abilityName(spellcastingAbility),
    proficientSaves: [...proficientSaves],
    attackModifier,
    saveModifier,
    spellcastingModifier,
    attackBonus: pb + attackModifier,
    saveDc: 8 + pb + saveModifier,
    spellAttackBonus: pb + spellcastingModifier,
    spellSaveDc: 8 + pb + spellcastingModifier,
  };
}

export function legalizeHitPoints({ targetHp, size = "Medium", constitutionModifier = 0 }) {
  const dieSize = getHitDieForSize(size);
  const averagePerDie = (dieSize + 1) / 2 + Number(constitutionModifier || 0);
  const safeAverage = Math.max(1, averagePerDie);
  const hitDice = clamp(round(Number(targetHp || 1) / safeAverage), 1, 80);
  const flat = hitDice * Number(constitutionModifier || 0);
  const average = Math.max(1, round(hitDice * ((dieSize + 1) / 2) + flat));
  const formula = `${hitDice}d${dieSize}${flat ? ` ${flat > 0 ? "+" : "−"} ${Math.abs(flat)}` : ""}`;
  return {
    size,
    dieSize,
    hitDice,
    constitutionModifier: Number(constitutionModifier || 0),
    average,
    formula,
    target: round(targetHp),
    delta: average - round(targetHp),
    legal: true,
  };
}

function getAllowedDiceForSize(size, extraDice = []) {
  const base = DEFAULT_DICE_BY_SIZE[size] || DEFAULT_DICE_BY_SIZE.Medium;
  return [...new Set([...base, ...extraDice].filter(Boolean))].sort((a, b) => a - b);
}

function damageAverage(count, die, flat = 0) {
  return count * ((die + 1) / 2) + flat;
}

function getDamageKind(damage = {}, rules = {}) {
  const explicit = damage.modifierPolicy || damage.kind || damage.damageKind;
  if (explicit) return explicit;
  const types = Array.isArray(damage.types) ? damage.types : [];
  const hasPhysical = types.some((type) => ["bludgeoning", "piercing", "slashing"].includes(String(type).toLowerCase()));
  if (hasPhysical && rules?.resolution?.type?.includes("attackRoll")) return "weaponLike";
  return "magicalOrEnergy";
}

function shouldApplyAbilityModifier(damage = {}, rules = {}) {
  const policy = damage.modifierPolicy || damage.modifier || damage.flatModifier;
  if (["none", "zero", 0].includes(policy)) return false;
  if (["sameAsAttack", "same_as_attack", "ability", "attackAbility"].includes(policy)) return true;
  return getDamageKind(damage, rules) === "weaponLike";
}

function getDamageBudgetRoleHint(damage = {}) {
  return DAMAGE_BUDGET_ROLE_HINTS[damage.budgetRole] || DAMAGE_BUDGET_ROLE_HINTS.mainAttack;
}

export function buildLegalDamageRoll(targetAverage, {
  abilityModifier = 0,
  damage = {},
  rules = {},
  size = "Medium",
  extraDice = [],
  maxDice = null,
  allowAbilityModifier = null,
} = {}) {
  const target = Math.max(1, round(targetAverage));
  const includeModifier = allowAbilityModifier === null
    ? shouldApplyAbilityModifier(damage, rules)
    : Boolean(allowAbilityModifier);
  const flat = includeModifier ? Number(abilityModifier || 0) : 0;
  const roleHint = getDamageBudgetRoleHint(damage);
  const diceLimit = clamp(Number(maxDice || roleHint.maxDice || 14), 1, 30);
  const dice = getAllowedDiceForSize(size, extraDice);
  let best = null;

  dice.forEach((die) => {
    for (let count = 1; count <= diceLimit; count += 1) {
      const average = round(damageAverage(count, die, flat));
      const delta = average - target;
      const score = Math.abs(delta) + count * 0.08 + (die === 12 ? 0.1 : 0);
      if (!best || score < best.score) {
        best = { count, die, flat, average, delta, score };
      }
    }
  });

  const formula = `${best.count}d${best.die}${best.flat ? ` ${best.flat > 0 ? "+" : "−"} ${Math.abs(best.flat)}` : ""}`;
  return {
    ...best,
    formula,
    text: `${best.average} (${formula})`,
    target,
    legal: true,
    modifierSource: includeModifier ? "same_as_attack_ability" : "none",
  };
}

function getDamageBudgetAverage({ damage, computedDpr, rules }) {
  const base = Math.max(1, Number(computedDpr || 6));
  const roleHint = getDamageBudgetRoleHint(damage || {});
  if (damage?.mode === "fixed" && damage.average) return Number(damage.average);
  if (damage?.mode === "computed" && computedDpr) return Number(computedDpr);
  if (damage?.mode === "custom") return Math.max(1, round(base / roleHint.divisor));
  const multiplier = DAMAGE_SCALE_MULTIPLIERS[damage?.scale] || DAMAGE_SCALE_MULTIPLIERS.standard;
  const share = Number(damage?.budgetShare || damage?.share || 0);
  const shareAdjusted = share > 0 ? base * share : (base * multiplier) / roleHint.divisor;
  return Math.max(1, round(shareAdjusted));
}

export function resolveDamageAbilityModifier({ damage = {}, rules = {}, rulesProfile = {} }) {
  const basis = normalizeAbilityKey(
    damage.abilityBasis || rules?.resolution?.abilityBasis || rulesProfile.primaryAttackAbility,
    rulesProfile.primaryAttackAbility || "str",
  );
  const scores = rulesProfile.abilityScores || {};
  return abilityMod(scores[basis] || 10);
}

export function getLegalDamageRollForRules({ damage = {}, rules = {}, computed = null }) {
  if (damage.mode === "fixed" && damage.average && damage.dice) {
    return {
      average: Number(damage.average),
      formula: String(damage.dice),
      text: `${damage.average} (${damage.dice})`,
      legal: true,
      fixed: true,
    };
  }

  if (damage.mode === "fixed" && damage.dice) {
    return {
      average: null,
      formula: String(damage.dice),
      text: String(damage.dice),
      legal: true,
      fixed: true,
    };
  }

  const rulesProfile = computed?.rulesProfile || computed?.rulesEngine || {};
  const abilityModifier = resolveDamageAbilityModifier({ damage, rules, rulesProfile });
  const targetAverage = getDamageBudgetAverage({ damage, computedDpr: computed?.dpr, rules });
  return buildLegalDamageRoll(targetAverage, {
    abilityModifier,
    damage,
    rules,
    size: rulesProfile.size || "Medium",
  });
}

export function buildRulesValidation({ rulesProfile, printedStats, baseline }) {
  const issues = [];
  const add = (severity, code, message, detail = "") => issues.push({ severity, code, message, detail });
  const expectedAttack = rulesProfile.attackBonus;
  const expectedDc = rulesProfile.saveDc;

  if (printedStats.attackBonus !== expectedAttack) {
    add(
      "error",
      "attack-bonus-not-derived",
      "Printed attack bonus must be derived from Proficiency Bonus + attack ability modifier.",
      `${modText(printedStats.attackBonus)} printed; ${modText(expectedAttack)} from PB ${modText(rulesProfile.proficiencyBonus)} + ${rulesProfile.primaryAttackAbilityName} ${modText(rulesProfile.attackModifier)}.`,
    );
  }

  if (printedStats.saveDc !== expectedDc) {
    add(
      "error",
      "save-dc-not-derived",
      "Printed save DC must be derived from 8 + Proficiency Bonus + save ability modifier.",
      `${printedStats.saveDc} printed; ${expectedDc} from 8 + PB ${modText(rulesProfile.proficiencyBonus)} + ${rulesProfile.primarySaveAbilityName} ${modText(rulesProfile.saveModifier)}.`,
    );
  }

  if (baseline?.attackBonus && Math.abs(printedStats.attackBonus - baseline.attackBonus) > 2) {
    add("warning", "attack-bonus-outside-baseline", "Legal attack bonus is more than 2 points away from the CR baseline.", `${modText(printedStats.attackBonus)} vs ${modText(baseline.attackBonus)}.`);
  }

  if (baseline?.saveDc && Math.abs(printedStats.saveDc - baseline.saveDc) > 2) {
    add("warning", "save-dc-outside-baseline", "Legal save DC is more than 2 points away from the CR baseline.", `${printedStats.saveDc} vs ${baseline.saveDc}.`);
  }

  if (rulesProfile.hp?.legal !== true) {
    add("error", "hp-formula-not-legal", "HP formula must be derived from size Hit Dice and Constitution modifier.");
  }

  return {
    version: MONSTER_RULES_ENGINE_VERSION,
    status: issues.some((issue) => issue.severity === "error") ? "error" : issues.length ? "warning" : "pass",
    issues,
  };
}

export function buildDndCompliantMonsterStats({
  targetCr,
  typeId,
  category,
  roleId,
  selectedFeatures = [],
  baseline,
  targetHp,
  targetAc,
  targetDpr,
  targetAttackBonus,
  targetSaveDc,
  tempoProfile,
  explicitSize = null,
}) {
  const proficiencyBonus = getProficiencyBonusForCr(targetCr);
  const size = getStatBlockSize(roleId, explicitSize);
  const abilityProfile = buildLegalAbilityProfile({
    typeId,
    category,
    roleId,
    selectedFeatures,
    targetAttackBonus,
    targetSaveDc,
    proficiencyBonus,
  });
  const hp = legalizeHitPoints({
    targetHp,
    size,
    constitutionModifier: abilityMod(abilityProfile.abilityScores.con),
  });
  const attackBonus = abilityProfile.attackBonus;
  const saveDc = abilityProfile.saveDc;
  const printedStats = {
    ac: clamp(round(targetAc), 10, 30),
    hp: hp.average,
    dpr: Math.max(1, round(targetDpr)),
    attackBonus,
    saveDc,
    initiativeMod: Number(tempoProfile?.initiativeMod || 0),
  };
  const rulesProfile = {
    version: MONSTER_RULES_ENGINE_VERSION,
    proficiencyBonus,
    size,
    hitDie: hp.dieSize,
    hp,
    abilityScores: abilityProfile.abilityScores,
    abilityProfile: abilityProfile.rows,
    primaryAttackAbility: abilityProfile.primaryAttackAbility,
    primaryAttackAbilityName: abilityProfile.primaryAttackAbilityName,
    primarySaveAbility: abilityProfile.primarySaveAbility,
    primarySaveAbilityName: abilityProfile.primarySaveAbilityName,
    spellcastingAbility: abilityProfile.spellcastingAbility,
    spellcastingAbilityName: abilityProfile.spellcastingAbilityName,
    attackModifier: abilityProfile.attackModifier,
    saveModifier: abilityProfile.saveModifier,
    spellcastingModifier: abilityProfile.spellcastingModifier,
    attackBonus,
    saveDc,
    spellAttackBonus: abilityProfile.spellAttackBonus,
    spellSaveDc: abilityProfile.spellSaveDc,
    proficientSaves: abilityProfile.proficientSaves,
  };
  const validation = buildRulesValidation({ rulesProfile, printedStats, baseline });

  return {
    version: MONSTER_RULES_ENGINE_VERSION,
    proficiencyBonus,
    printedStats,
    rulesProfile,
    abilityProfile: abilityProfile.rows,
    validation,
    damage: {
      defaultAttack: buildLegalDamageRoll(Math.max(1, round(targetDpr)), {
        abilityModifier: abilityProfile.attackModifier,
        damage: { types: ["bludgeoning"], budgetRole: "mainAttack", modifierPolicy: "sameAsAttack" },
        rules: { resolution: { type: "attackRoll", abilityBasis: abilityProfile.primaryAttackAbility } },
        size,
      }),
    },
  };
}
