import {
  getDamageBudgetShare,
  normalizeMonsterGraftRules,
} from "./monster-graft-rules.schema.js";

const DAMAGE_SCALE_MULTIPLIERS = Object.freeze({
  minor: 0.45,
  light: 0.65,
  medium: 0.85,
  standard: 1,
  high: 1.25,
  heavy: 1.45,
});

const DAMAGE_DICE_TABLE = Object.freeze([
  [4, "1d4 + 2"],
  [6, "1d6 + 3"],
  [8, "1d8 + 4"],
  [12, "2d8 + 3"],
  [16, "3d8 + 3"],
  [22, "4d8 + 4"],
  [28, "5d8 + 6"],
  [36, "6d10 + 3"],
  [48, "8d10 + 4"],
  [64, "10d10 + 9"],
  [82, "12d12 + 4"],
  [102, "16d12"],
]);

function parseDiceFormula(formula) {
  const match = String(formula || "").match(/^(\d+)d(\d+)(?:\s*([+−-])\s*(\d+))?$/);
  if (!match) return null;
  const count = Number(match[1]);
  const die = Number(match[2]);
  const sign = match[3] === "−" || match[3] === "-" ? -1 : 1;
  const flat = match[4] ? Number(match[4]) * sign : 0;
  return { count, die, flat, average: Math.round(count * ((die + 1) / 2) + flat) };
}

function formatDiceFormula(count, die, flat = 0) {
  if (!flat) return `${count}d${die}`;
  return `${count}d${die} ${flat > 0 ? "+" : "−"} ${Math.abs(flat)}`;
}

function buildDamageRoll(targetAverage) {
  const average = Math.max(1, Math.round(Number(targetAverage || 1)));
  const diceFormula = DAMAGE_DICE_TABLE.find(([limit]) => average <= limit)?.[1] || "18d12";
  const parsed = parseDiceFormula(diceFormula);
  if (!parsed) return { average, dice: diceFormula, text: `${average} (${diceFormula})` };

  const delta = average - parsed.average;
  const dice = delta ? formatDiceFormula(parsed.count, parsed.die, parsed.flat + delta) : diceFormula;
  return { average, dice, text: `${average} (${dice})` };
}

function cleanString(value) {
  return String(value || "").trim();
}

function titleCase(value) {
  return String(value || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function modText(value) {
  return value >= 0 ? `+${value}` : `−${Math.abs(value)}`;
}

function getComputedDamageAverage(computed) {
  return Math.max(1, Number(computed?.dpr || computed?.baseline?.dpr || 6));
}

function damageRollText(value) {
  return buildDamageRoll(value).text;
}

function damageDiceText(value) {
  return buildDamageRoll(value).dice;
}

function damageAverageText(value) {
  return String(buildDamageRoll(value).average);
}

function cloneDamageWithScale(damage, scale) {
  return {
    ...(damage || {}),
    mode: damage?.mode && damage.mode !== "none" ? damage.mode : "budget",
    scale: scale || damage?.scale || "standard",
    budgetShare: undefined,
  };
}

function parseToken(token) {
  const raw = cleanString(token);
  const [name, ...rest] = raw.split(":");
  return {
    raw,
    name: cleanString(name),
    arg: cleanString(rest.join(":")),
  };
}

function tokenText(token) {
  return `{${token}}`;
}

function resolveTokenValue(token, { feature, rules, computed, tokenized = false }) {
  const { raw, name, arg } = parseToken(token);
  if (tokenized) return tokenText(raw);

  switch (name) {
    case "attack":
    case "attack-bonus":
    case "monster-baseline":
      return modText(computed?.attack || 0);
    case "dc":
    case "save-dc":
      return String(computed?.dc || "monster DC");
    case "pb":
    case "proficiency-bonus":
      return String(computed?.prof || "the monster's Proficiency Bonus");
    case "damage":
      return formatDamage(arg ? cloneDamageWithScale(rules.damage, arg) : rules.damage, computed, rules);
    case "damage-scale":
    case "damage-dice":
      return formatDamageDice(arg ? cloneDamageWithScale(rules.damage, arg) : rules.damage, computed, rules);
    case "damageDice":
      return formatDamageDice(rules.damage, computed, rules);
    case "average-damage":
    case "damage-average":
      return formatDamageAverage(arg ? cloneDamageWithScale(rules.damage, arg) : rules.damage, computed, rules);
    case "damageAverage":
      return formatDamageAverage(rules.damage, computed, rules);
    case "budget-share":
    case "budgetShare":
      return `${Math.round(getDamageBudgetShare(rules.damage, rules) * 100)}%`;
    case "ability-basis":
    case "abilityBasis":
      return titleCase(rules.resolution?.abilityBasis || rules.damage?.abilityBasis || "monster");
    case "save":
      return formatSavePrefix(rules.resolution, rules.targeting, computed, { tokenized });
    case "targeting":
      return formatTargeting(rules.targeting);
    case "damage-type":
    case "damageType":
      return formatDamageType(rules.damage);
    case "title":
      return feature?.title || "Ability";
    default:
      return tokenText(raw);
  }
}

function applyTokens(text, context) {
  return cleanString(text).replace(/\{([^{}]+)\}/g, (_match, token) =>
    resolveTokenValue(token, context),
  );
}

function formatDamageType(damage) {
  const types = damage?.types?.length ? damage.types : [];
  if (!types.length) return "damage";
  if (types.length === 1) return `${titleCase(types[0])} damage`;
  return `${types.map(titleCase).join(" or ")} damage`;
}

function getDamageBudgetAverage(damage, rules, computed) {
  const base = getComputedDamageAverage(computed);
  const budgetShare = getDamageBudgetShare(damage, rules);
  if (budgetShare > 0) return Math.max(1, Math.round(base * budgetShare));
  const multiplier = DAMAGE_SCALE_MULTIPLIERS[damage?.scale] || DAMAGE_SCALE_MULTIPLIERS.standard;
  return Math.max(1, Math.round(base * multiplier));
}

function formatDamage(damage, computed, rules = {}, options = {}) {
  if (!damage || damage.mode === "none") return "";
  if (options.tokenized) return "{damage}";
  if (damage.mode === "fixed" && damage.average && damage.dice) {
    return `${damage.average} (${damage.dice})`;
  }
  if (damage.mode === "fixed" && damage.average) return String(damage.average);
  if (damage.mode === "fixed" && damage.dice) return String(damage.dice);
  if (damage.mode === "custom" && damage.text) return String(damage.text);
  if (damage.mode === "computed" && computed?.damageText) return computed.damageText;

  return damageRollText(getDamageBudgetAverage(damage, rules, computed));
}

function formatDamageDice(damage, computed, rules = {}, options = {}) {
  if (!damage || damage.mode === "none") return "";
  if (options.tokenized) return `{damage-scale:${damage.scale || "standard"}}`;
  if (damage.mode === "fixed" && damage.dice) return String(damage.dice);
  if (damage.mode === "custom" && damage.text) return String(damage.text);
  if (damage.mode === "computed" && computed?.damageText) return computed.damageText;
  return damageDiceText(getDamageBudgetAverage(damage, rules, computed));
}

function formatDamageAverage(damage, computed, rules = {}, options = {}) {
  if (!damage || damage.mode === "none") return "";
  if (options.tokenized) return "{average-damage}";
  if (damage.mode === "fixed" && damage.average) return String(damage.average);
  if (damage.mode === "computed" && computed?.dpr) return String(Math.round(computed.dpr));
  return damageAverageText(getDamageBudgetAverage(damage, rules, computed));
}

function formatAttackPrefix(rules, computed, options = {}) {
  const resolution = rules.resolution || {};
  const attackType = resolution.attackType === "ranged" ? "Ranged" : resolution.attackType === "meleeOrRanged" ? "Melee or Ranged" : "Melee";
  const bonus = options.tokenized
    ? "{attack-bonus}"
    : resolution.bonus === "monster" || !resolution.bonus
      ? modText(computed?.attack || 0)
      : resolution.bonus;
  const reachValue = cleanString(resolution.reach).replace(/[.]+$/, "");
  const rangeValue = cleanString(resolution.range).replace(/[.]+$/, "");
  const reach = reachValue ? `, reach ${reachValue}` : "";
  const range = rangeValue ? `, range ${rangeValue}` : "";
  return `${attackType} Attack Roll: ${bonus}${reach}${range}. Hit:`;
}

function formatSavePrefix(resolution, targeting, computed, options = {}) {
  const ability = titleCase(resolution?.ability || "ability");
  const dc = options.tokenized
    ? "{save-dc}"
    : resolution?.dc === "monster" || !resolution?.dc
      ? computed?.dc || "monster DC"
      : resolution.dc;
  const target = targeting?.text || formatTargeting(targeting);
  return `${ability} Saving Throw: DC ${dc}${target ? `, ${target}` : ""}.`;
}

function formatTargeting(targeting) {
  if (!targeting) return "";
  if (targeting.text) return targeting.text;
  if (targeting.type === "area") {
    const size = targeting.size ? `${targeting.size}-${targeting.unit === "ft" ? "foot" : targeting.unit || "ft"}` : "";
    const shape = targeting.shape ? titleCase(targeting.shape) : "area";
    const targets = targeting.targets || "creatures in the area";
    return `${targets} in a ${size} ${shape}`.replace(/\s+/g, " ").trim();
  }
  return targeting.targets || "";
}

function formatUsagePrefix(rules) {
  if (rules.usage?.type === "recharge" && rules.usage.value) return `Recharge ${rules.usage.value}.`;
  if (rules.usage?.type === "limited" && rules.usage.value) return `${rules.usage.value}.`;
  return "";
}

function joinSentences(parts) {
  return parts
    .map(cleanString)
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function defaultDamageText(rules, computed, options = {}) {
  if (!rules.damage || rules.damage.mode === "none") return "";
  if (options.tokenized) {
    return `${formatDamageAverage(rules.damage, computed, rules, options)} (${formatDamageDice(rules.damage, computed, rules, options)}) ${formatDamageType(rules.damage)}.`;
  }
  return `${formatDamage(rules.damage, computed, rules, options)} ${formatDamageType(rules.damage)}.`;
}

function renderAttackRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed, tokenized: options.tokenized };
  const hitText = rules.text?.hit
    ? applyTokens(rules.text.hit, context)
    : rules.damage
      ? defaultDamageText(rules, computed, options)
      : applyTokens(feature.mechanics || "", context);
  const secondary = rules.secondaryResolution?.type === "savingThrow"
    ? joinSentences([
        formatSavePrefix(rules.secondaryResolution, null, computed, options),
        rules.text?.failure ? `Failure: ${applyTokens(rules.text.failure, context)}` : "",
        rules.text?.success ? `Success: ${applyTokens(rules.text.success, context)}` : "",
      ])
    : "";

  return joinSentences([
    formatUsagePrefix(rules),
    formatAttackPrefix(rules, computed, options),
    hitText,
    secondary,
    rules.text?.effect ? applyTokens(rules.text.effect, context) : "",
  ]);
}

function renderSaveRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed, tokenized: options.tokenized };
  const failure = rules.text?.failure
    ? applyTokens(rules.text.failure, context)
    : rules.damage
      ? defaultDamageText(rules, computed, options)
      : applyTokens(feature.mechanics || "", context);
  const success = rules.text?.success ? applyTokens(rules.text.success, context) : rules.damage ? "Half damage only." : "No effect.";

  return joinSentences([
    formatUsagePrefix(rules),
    formatSavePrefix(rules.resolution, rules.targeting, computed, options),
    `Failure: ${failure}`,
    `Success: ${success}`,
    rules.text?.effect ? applyTokens(rules.text.effect, context) : "",
  ]);
}

function renderReactionRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed, tokenized: options.tokenized };
  const trigger = rules.text?.trigger || rules.trigger;
  const response = rules.text?.response || rules.text?.effect;
  if (response) {
    return joinSentences([
      trigger ? `Trigger: ${applyTokens(trigger, context)}` : "",
      `Response: ${applyTokens(response, context)}`,
    ]);
  }
  if (rules.resolution?.type === "savingThrow") return renderSaveRules(feature, rules, computed, options);
  return applyTokens(feature.mechanics || "", context);
}

function renderRules(feature, computed = null, options = {}) {
  const rules = normalizeMonsterGraftRules(feature);
  if (!rules.migration?.isStructured) return null;

  if (rules.text?.mode === "manual" && rules.text?.manual) {
    return applyTokens(rules.text.manual, { feature, rules, computed, tokenized: options.tokenized });
  }
  if (rules.actionEconomy === "reaction") return renderReactionRules(feature, rules, computed, options);
  if (rules.text?.effect && ["trait", "death"].includes(rules.section)) {
    return applyTokens(rules.text.effect, { feature, rules, computed, tokenized: options.tokenized });
  }
  if (rules.resolution?.type === "attackRoll") return renderAttackRules(feature, rules, computed, options);
  if (rules.resolution?.type === "savingThrow") return renderSaveRules(feature, rules, computed, options);
  if (rules.text?.effect) return applyTokens(rules.text.effect, { feature, rules, computed, tokenized: options.tokenized });
  return null;
}

export function renderStructuredRulesText(feature, computed = null) {
  return renderRules(feature, computed, { tokenized: false });
}

export function renderStructuredRulesTemplate(feature) {
  return renderRules(feature, null, { tokenized: true });
}
