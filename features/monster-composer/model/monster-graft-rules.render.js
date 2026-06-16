import { findSpell5e24, getSpell5e24Name } from "../../../shared/content/spells.5e24.js";
import { getMonsterRuleset } from "../rulesets/index.js";
import {
  getDamageBudgetShare,
  getDamagePartById,
  getDamageTotalBudgetShare,
  getDamageParts,
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

function buildDamageRoll(targetAverage, { damage = {}, rules = {}, computed = null } = {}) {
  const scopedComputed = computed
    ? { ...computed, dpr: Number(targetAverage || computed.dpr || 1) }
    : { dpr: Number(targetAverage || 1) };
  const ruleset = getMonsterRuleset(scopedComputed.rulesetId);
  return ruleset.getLegalDamageRollForRules({
    damage: { ...damage, mode: damage.mode || "budget" },
    rules,
    computed: scopedComputed,
  });
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

function formatPlainList(values = []) {
  const entries = values.map(titleCase).filter(Boolean);
  if (!entries.length) return "";
  if (entries.length === 1) return entries[0];
  if (entries.length === 2) return `${entries[0]} and ${entries[1]}`;
  return `${entries.slice(0, -1).join(", ")}, and ${entries[entries.length - 1]}`;
}

function sentenceCase(value) {
  const text = cleanString(value);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function formatTiming(timing) {
  const map = {
    startOfTurn: "at the start of each of its turns",
    endOfTurn: "at the end of each of its turns",
    endOfEachTurn: "at the end of each of its turns",
    whenDamaged: "when it takes damage",
    whenTriggered: "when the triggering event occurs",
    startOfTargetTurn: "at the start of each of the target's turns",
    endOfTargetTurn: "at the end of each of the target's turns",
    startOfMonsterTurn: "at the start of each of the monster's turns",
    endOfMonsterTurn: "at the end of each of the monster's turns",
    onEnterArea: "when it enters the area",
    whileInArea: "while it remains in the area",
  };
  return map[timing] || cleanString(timing);
}

function getComputedDamageAverage(computed) {
  return Math.max(1, Number(computed?.dpr || computed?.baseline?.dpr || 6));
}

function damageRollText(value, damage = {}, computed = null, rules = {}) {
  return buildDamageRoll(value, { damage, computed, rules }).text;
}

function damageDiceText(value, damage = {}, computed = null, rules = {}) {
  return buildDamageRoll(value, { damage, computed, rules }).formula;
}

function damageAverageText(value, damage = {}, computed = null, rules = {}) {
  return String(buildDamageRoll(value, { damage, computed, rules }).average);
}

function token(name) {
  return `{${name}}`;
}

function formatScaleToken(scale = "standard") {
  return token(`damage-scale:${scale || "standard"}`);
}

function formatDamagePartToken(part) {
  return token(`damage-part:${part?.id || "part"}`);
}

function getDamageBudgetAverage(damage, rules, computed) {
  const base = getComputedDamageAverage(computed);
  const budgetShare = getDamageBudgetShare(damage, rules);
  if (budgetShare > 0) return Math.max(1, Math.round(base * budgetShare));
  const multiplier = DAMAGE_SCALE_MULTIPLIERS[damage?.scale] || DAMAGE_SCALE_MULTIPLIERS.standard;
  return Math.max(1, Math.round(base * multiplier));
}

function formatSingleDamage(damage, computed, rules = {}, options = {}) {
  if (!damage || damage.mode === "none") return "";
  if (options.template) return formatScaleToken(damage.scale || "standard");
  if (damage.mode === "fixed" && damage.average && damage.dice) return `${damage.average} (${damage.dice})`;
  if (damage.mode === "fixed" && damage.dice) return String(damage.dice);
  if (damage.mode === "custom" && damage.text) return String(damage.text);
  if (damage.mode === "computed" && computed?.damageText) return computed.damageText;
  return damageRollText(getDamageBudgetAverage(damage, rules, computed), damage, computed, rules);
}

function formatDamageParts(damage, computed, rules = {}, options = {}) {
  const parts = getDamageParts(damage);
  if (!parts.length) return "";
  return parts
    .map((part, index) => {
      const amount = options.template ? formatDamagePartToken(part) : formatSingleDamage(part, computed, rules, options);
      const type = formatDamageType(part);
      return `${index > 0 ? "plus " : ""}${amount} ${type}`.trim();
    })
    .join(" ");
}

function formatDamage(damage, computed, rules = {}, options = {}) {
  if (damage?.mode === "parts" || getDamageParts(damage).length) {
    return formatDamageParts(damage, computed, rules, options);
  }
  return formatSingleDamage(damage, computed, rules, options);
}

function formatDamageDice(damage, computed, rules = {}, options = {}) {
  if (!damage || damage.mode === "none") return "";
  if (options.template) return token("damage-dice");
  if (damage.mode === "fixed" && damage.dice) return String(damage.dice);
  if (damage.mode === "custom" && damage.text) return String(damage.text);
  if (damage.mode === "computed" && computed?.damageText) return computed.damageText;
  return damageDiceText(getDamageBudgetAverage(damage, rules, computed), damage, computed, rules);
}

function formatDamageAverage(damage, computed, rules = {}, options = {}) {
  if (!damage || damage.mode === "none") return "";
  if (options.template) return token("average-damage");
  if (damage.mode === "fixed" && damage.average) return String(damage.average);
  if (damage.mode === "computed" && computed?.dpr) return String(Math.round(computed.dpr));
  return damageAverageText(getDamageBudgetAverage(damage, rules, computed), damage, computed, rules);
}

function formatDamageType(damage) {
  const types = damage?.types?.length ? damage.types : [];
  if (!types.length) return "damage";
  if (types.length === 1) return `${titleCase(types[0])} damage`;
  return `${types.map(titleCase).join(" or ")} damage`;
}

function formatDamageClause(damage, computed, rules = {}, options = {}) {
  const amount = formatDamage(damage, computed, rules, options);
  if (!amount) return "";
  if (damage?.mode === "parts" || getDamageParts(damage).length) return `${amount}.`;
  return `${amount} ${formatDamageType(damage)}.`;
}

function formatDamageAmountWithType(damage, computed, rules = {}, options = {}) {
  const amount = formatDamage(damage, computed, rules, options);
  if (!amount) return "";
  if (damage?.mode === "parts" || getDamageParts(damage).length) return amount;
  return `${amount} ${formatDamageType(damage)}`;
}

function formatEscapeDc(rules, computed, options = {}) {
  const escape = rules.condition?.escape;
  if (!escape?.enabled) return "";
  if (escape.text) return options.template ? escape.text : resolveMonsterRulesTemplate(escape.text, { feature: null, rules, computed });
  if (options.template) return token("escape-dc");
  if (escape.dc === "monster" || !escape.dc) return String(computed?.dc || "monster DC");
  return String(escape.dc);
}

function formatConditionList(rules) {
  const names = rules.condition?.names || [];
  if (!names.length) return "";
  const noun = names.length === 1 ? "condition" : "conditions";
  return `${formatPlainList(names)} ${noun}`;
}

function formatConditionClause(rules, computed, options = {}) {
  const condition = rules.condition;
  if (!condition?.names?.length) return "";
  const list = options.template ? token("condition-list") : formatConditionList(rules);
  const sizeLimit = cleanString(condition.sizeLimit);
  const subject = sizeLimit ? `A target that is ${sizeLimit}` : "The target";
  const escape = condition.escape?.enabled ? ` (${options.template ? token("escape-dc") : `escape DC ${formatEscapeDc(rules, computed, options)}`})` : "";
  const duration = condition.duration ? ` The condition lasts ${applyTokens(condition.duration, { feature: null, rules, computed }, options)}.` : "";
  return `${subject} has the ${list}${escape}.${duration}`.replace(/\.\s*\./g, ".").trim();
}

function formatRepeatSave(rules, computed, options = {}) {
  const repeatSave = rules.condition?.repeatSave;
  if (!repeatSave?.enabled) return "";
  if (repeatSave.text) return applyTokens(repeatSave.text, { feature: null, rules, computed }, options);
  if (options.template) return token("repeat-save");
  const ability = titleCase(repeatSave.ability || rules.resolution?.ability || "ability");
  const timing = formatTiming(repeatSave.timing || "endOfTurn");
  const ending = repeatSave.endsOnSuccess ? ", ending the effect on itself on a success" : "";
  return `The target repeats the ${ability} Saving Throw ${timing}${ending}.`;
}

function formatOngoingEffect(rules, computed, options = {}) {
  const ongoing = rules.ongoing;
  if (!ongoing?.enabled) return "";
  if (ongoing.text) return applyTokens(ongoing.text, { feature: null, rules, computed }, options);
  if (options.template) return token("ongoing-effect");
  const amount = formatDamageAmountWithType(ongoing.damage, computed, rules, options);
  if (!amount) return "";
  const timing = sentenceCase(formatTiming(ongoing.timing || "startOfTargetTurn"));
  const endCondition = ongoing.endCondition ? ` This continues ${ongoing.endCondition}.` : "";
  return `${timing}, the target takes ${amount}.${endCondition}`.replace(/\.\s*\./g, ".").trim();
}


function getAbilityReferences(rules = {}) {
  return Array.isArray(rules.references) ? rules.references.filter(Boolean) : [];
}

function formatReferenceLabel(reference = {}) {
  return cleanString(reference.label || reference.ref || reference.id || "Ability");
}

function formatReferenceCount(reference = {}) {
  const value = reference.count;
  if (value === undefined || value === null || value === "") return "one";
  if (typeof value === "number") return numberWord(value);
  return cleanString(value);
}

function formatAbilityReference(reference = {}) {
  if (reference.text) return cleanString(reference.text);
  const label = formatReferenceLabel(reference);
  const count = formatReferenceCount(reference);
  switch (reference.relationship) {
    case "makes":
      return `The monster makes ${count} ${label} ${String(count).toLowerCase() === "one" || count === "1" ? "attack" : "attacks"}.`;
    case "replaceOneAttack":
      return `The monster can replace one attack with ${label}.`;
    case "replaceAnyAttack":
      return `The monster can replace any attack with ${label}.`;
    case "replaceOneOrMoreAttacks":
      return `The monster can replace one or more attacks with ${label}.`;
    case "requires":
      return `This ability requires ${label}.`;
    case "adds":
      return `This ability adds ${label}.`;
    case "triggers":
      return `This ability triggers ${label}.`;
    case "follows":
      return `This ability follows ${label}.`;
    case "custom":
      return label;
    case "uses":
    default:
      return `The monster uses ${label}.`;
  }
}

function formatReferenceList(rules = {}) {
  return getAbilityReferences(rules).map(formatReferenceLabel).filter(Boolean).join(", ");
}

function findAbilityReference(rules = {}, id = "") {
  const normalized = cleanString(id).toLowerCase();
  if (!normalized) return null;
  return getAbilityReferences(rules).find((reference) =>
    [reference.id, reference.ref, reference.label].some((value) => cleanString(value).toLowerCase() === normalized),
  ) || null;
}

function renderAbilityReferencesRules(feature, rules, computed, options = {}) {
  const references = getAbilityReferences(rules);
  if (!references.length) return "";
  if (options.template) return token("reference-list");
  return joinSentences(references.map(formatAbilityReference));
}

function resolveTokenValue(rawToken, { feature, rules, computed }) {
  const [name, ...args] = String(rawToken || "").split(":");
  const argument = args.join(":");

  switch (name) {
    case "attack":
      return argument ? titleCase(argument) : modText(computed?.attack || 0);
    case "attack-bonus":
    case "monster-baseline":
      return modText(computed?.attack || 0);
    case "dc":
    case "save-dc":
      return String(computed?.dc || "monster DC");
    case "pb":
      return String(computed?.prof || "the monster's Proficiency Bonus");
    case "damage":
      if (argument) {
        return formatSingleDamage({ ...(rules.damage || {}), mode: "budget", scale: argument }, computed, rules);
      }
      return formatDamage(rules.damage, computed, rules);
    case "damage-scale":
      return formatSingleDamage({ ...(rules.damage || {}), mode: "budget", scale: argument || "standard" }, computed, rules);
    case "damage-part": {
      const part = getDamagePartById(rules.damage, argument);
      return part ? formatSingleDamage(part, computed, rules) : `{${rawToken}}`;
    }
    case "damageDice":
    case "damage-dice":
      return formatDamageDice(rules.damage, computed, rules);
    case "damageAverage":
    case "average-damage":
      return formatDamageAverage(rules.damage, computed, rules);
    case "budgetShare":
    case "budget-share":
      return `${Math.round(getDamageTotalBudgetShare(rules.damage, rules) * 100)}%`;
    case "abilityBasis":
    case "ability-basis":
      return titleCase(rules.resolution?.abilityBasis || rules.damage?.abilityBasis || "monster");
    case "save":
      return formatSavePrefix(rules.resolution, rules.targeting, computed);
    case "targeting":
      return formatTargeting(rules.targeting);
    case "area-effect":
      return renderAreaEffectRules(feature, rules, computed, false);
    case "area-size":
      return rules.areaEffect?.size ? String(rules.areaEffect.size) : "the area size";
    case "area-shape":
      return titleCase(rules.areaEffect?.shape || "area");
    case "area-origin":
      return formatAreaOrigin(rules.areaEffect);
    case "area-timing":
      return formatAreaEffectTiming(rules.areaEffect);
    case "area-targets":
      return formatAreaEffectTargets(rules.areaEffect);
    case "damageType":
    case "damage-type":
      return formatDamageType(rules.damage);
    case "escape-dc": {
      const value = formatEscapeDc(rules, computed, false);
      return value ? `escape DC ${value}` : "escape DC";
    }
    case "condition-list":
      return formatConditionList(rules);
    case "condition-duration":
      return rules.condition?.duration || "the listed duration";
    case "repeat-save":
      return formatRepeatSave(rules, computed, false);
    case "ongoing-damage":
      return formatDamageAmountWithType(rules.ongoing?.damage, computed, rules, false);
    case "ongoing-effect":
      return formatOngoingEffect(rules, computed, false);
    case "ongoing-timing":
      return formatTiming(rules.ongoing?.timing);
    case "defense-uses":
      return formatDefenseUses(rules.defense, false);
    case "defense-value":
      return formatDefenseValue(rules.defense, false);
    case "defense-damage-types":
      return formatDefenseDamageTypes(rules.defense);
    case "defense-break-condition":
      return formatDefenseBreakCondition(rules.defense, false);
    case "summon-count":
      return cleanString(rules.summon?.count || "1");
    case "summon-creature":
      return formatSummonCreature(rules.summon);
    case "summon-placement":
      return cleanString(rules.summon?.placement || "in unoccupied spaces the monster can see");
    case "summon-duration":
      return cleanString(rules.summon?.duration || "until destroyed");
    case "summon-initiative":
      return formatSummonInitiative(rules.summon);
    case "summon-control":
      return formatSummonControl(rules.summon);
    case "summon-limit":
      return cleanString(rules.summon?.limit);
    case "procedure-type":
      return formatProcedureType(rules.procedure?.type);
    case "procedure-target-limit":
      return cleanString(rules.procedure?.targetLimit);
    case "procedure-prerequisite":
      return cleanString(rules.procedure?.prerequisite);
    case "procedure-entry-effect":
      return cleanString(rules.procedure?.entryEffect);
    case "procedure-internal-state":
      return cleanString(rules.procedure?.internalState);
    case "procedure-ongoing-damage":
      return formatProcedureOngoingDamage(rules, computed, false);
    case "procedure-escape-condition":
      return cleanString(rules.procedure?.escapeCondition);
    case "procedure-release-condition":
      return cleanString(rules.procedure?.releaseCondition);
    case "procedure":
      return renderProcedureRules(feature, rules, computed, false);
    case "spellcasting-ability":
      return titleCase(rules.spellcasting?.ability || "wisdom");
    case "spell-save-dc":
      return rules.spellcasting?.saveDc === "none" ? "" : String(computed?.dc || "monster DC");
    case "spell-attack-bonus":
      return rules.spellcasting?.attackBonus === "none" ? "" : modText(computed?.attack || 0);
    case "spell-list":
      return formatSpellListById(rules.spellcasting, argument);
    case "multiattack-count":
      return numberWord(rules.multiattack?.count || 0);
    case "multiattack-count-number":
      return String(rules.multiattack?.count || 0);
    case "reference": {
      const reference = findAbilityReference(rules, argument);
      return reference ? formatAbilityReference(reference) : `{${rawToken}}`;
    }
    case "reference-label": {
      const reference = findAbilityReference(rules, argument);
      return reference ? formatReferenceLabel(reference) : `{${rawToken}}`;
    }
    case "reference-list":
      return formatReferenceList(rules);
    case "references":
      return renderAbilityReferencesRules(feature, rules, computed, false);
    case "title":
      return feature?.title || "Ability";
    default:
      return `{${rawToken}}`;
  }
}

export function resolveMonsterRulesTemplate(text, { feature, rules, computed }) {
  return cleanString(text).replace(/\{([^{}]+)\}/g, (_match, rawToken) =>
    resolveTokenValue(rawToken, { feature, rules, computed }),
  );
}

function applyTokens(text, context, options = {}) {
  const cleaned = cleanString(text);
  return options.template ? cleaned : resolveMonsterRulesTemplate(cleaned, context);
}

function formatAttackPrefix(rules, computed, options = {}) {
  const resolution = rules.resolution || {};
  const attackType = resolution.attackType === "ranged" ? "Ranged" : resolution.attackType === "meleeOrRanged" ? "Melee or Ranged" : "Melee";
  const bonus = options.template
    ? token("attack-bonus")
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
  const dc = options.template
    ? token("save-dc")
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

function areaEffectToTargeting(areaEffect) {
  if (!areaEffect?.enabled) return null;
  return {
    type: "area",
    shape: areaEffect.shape || "emanation",
    size: areaEffect.size,
    unit: areaEffect.unit || "ft",
    targets: areaEffect.targets || "creatures",
    text: areaEffect.targetingText,
  };
}

function formatAreaOrigin(areaEffect) {
  const origin = areaEffect?.origin || "self";
  if (origin === "self") return "from the monster";
  if (origin === "target") return "from the target";
  if (origin === "point") return "from a point the monster can see";
  if (origin === "location") return "in the location";
  return cleanString(areaEffect?.origin) || "from the monster";
}

function formatAreaEffectArea(areaEffect) {
  if (!areaEffect?.enabled) return "";
  const size = areaEffect.size ? `${areaEffect.size}-${areaEffect.unit === "ft" ? "foot" : areaEffect.unit || "ft"}` : "";
  const shape = titleCase(areaEffect.shape || "emanation");
  const origin = formatAreaOrigin(areaEffect);
  return `${size ? `${size} ` : ""}${shape} ${origin}`.replace(/\s+/g, " ").trim();
}

function formatAreaEffectTiming(areaEffect) {
  const map = {
    passive: "while in the area",
    startsTurnInArea: "when a creature starts its turn in the area",
    endsTurnInArea: "when a creature ends its turn in the area",
    entersArea: "when a creature enters the area for the first time on a turn",
    whileInArea: "while a creature remains in the area",
    leavesArea: "when a creature leaves the area",
    initiativeCount20: "on initiative count 20",
    lairAction: "when the monster uses this lair action",
    regional: "as a regional effect",
  };
  return map[areaEffect?.timing] || cleanString(areaEffect?.timing) || "while in the area";
}

function formatAreaEffectTargets(areaEffect) {
  const targets = cleanString(areaEffect?.targets) || "creatures";
  const excludes = Array.isArray(areaEffect?.excludes) && areaEffect.excludes.length
    ? ` except ${formatPlainList(areaEffect.excludes)}`
    : "";
  return `${targets}${excludes}`.trim();
}

function renderAreaEffectRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed };
  const areaEffect = rules.areaEffect || {};
  if (!areaEffect.enabled) return "";
  if (areaEffect.text) return applyTokens(areaEffect.text, context, options);
  if (options.template) return token("area-effect");

  const area = formatAreaEffectArea(areaEffect);
  const timing = sentenceCase(formatAreaEffectTiming(areaEffect));
  const targets = formatAreaEffectTargets(areaEffect);
  const damageAmount = formatDamageAmountWithType(rules.damage, computed, rules, options);
  const effectParts = [
    damageAmount ? `The target takes ${damageAmount}.` : "",
    rules.condition?.names?.length ? formatConditionClause(rules, computed, options) : "",
    rules.ongoing?.enabled ? formatOngoingEffect(rules, computed, options) : "",
    rules.text?.effect ? applyTokens(rules.text.effect, context, options) : "",
  ].filter(Boolean);
  const base = `${timing}, ${targets} in the ${area} are affected.`;
  const effect = effectParts.length ? effectParts.join(" ") : "";
  return joinSentences([base, effect]).replace(/\.\s*\./g, ".").replace(/\s+/g, " ").trim();
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

function hasAttackResolution(rules) {
  return rules.resolution?.type === "attackRoll" || rules.resolution?.type === "attackRollSavingThrow";
}

function hasSaveResolution(rules) {
  return rules.resolution?.type === "savingThrow" || rules.resolution?.type === "attackRollSavingThrow";
}

function renderOutcomeText(label, value, context, options) {
  return value ? `${label}: ${applyTokens(value, context, options)}` : "";
}

function hasDamageAmountText(value) {
  const text = cleanString(value);
  return /\b\d+\s*\([^)]*d\d+[^)]*\)/i.test(text) || /\b\d+d\d+\b/i.test(text);
}

function renderAttackHitText(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed };
  if (!rules.text?.hit) {
    return rules.damage
      ? formatDamageClause(rules.damage, computed, rules, options)
      : applyTokens(feature.mechanics || "", context, options);
  }

  const hitText = applyTokens(rules.text.hit, context, options);
  if (options.template || !rules.damage || hasDamageAmountText(hitText)) return hitText;

  const referencesDamage = /\bdamage\b/i.test(hitText) || /\{damage/i.test(rules.text.hit);
  if (!referencesDamage) return hitText;

  const damageText = formatDamageClause(rules.damage, computed, rules, options);
  if (!damageText) return hitText;

  return damageText;
}

function renderAttackRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed };
  const hitText = renderAttackHitText(feature, rules, computed, options);
  const secondary = rules.secondaryResolution?.type === "savingThrow" || rules.resolution?.type === "attackRollSavingThrow"
    ? joinSentences([
        formatSavePrefix(rules.secondaryResolution || rules.resolution, null, computed, options),
        renderOutcomeText("Failure", rules.text?.failure, context, options),
        renderOutcomeText("Success", rules.text?.success, context, options),
        renderOutcomeText("Failure or Success", rules.text?.failureOrSuccess, context, options),
      ])
    : "";

  return joinSentences([
    formatUsagePrefix(rules),
    formatAttackPrefix(rules, computed, options),
    hitText,
    formatConditionClause(rules, computed, options),
    formatOngoingEffect(rules, computed, options),
    formatRepeatSave(rules, computed, options),
    renderOutcomeText("Miss", rules.text?.miss, context, options),
    renderOutcomeText("Hit or Miss", rules.text?.hitOrMiss, context, options),
    secondary,
    rules.text?.effect ? applyTokens(rules.text.effect, context, options) : "",
  ]);
}

function renderSaveRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed };
  const isLegacyInference = rules.migration?.source === "legacy-inference" || rules.migration?.source === "studio-hydrated-legacy";
  const hasExplicitFailure = Boolean(rules.text?.failure);
  const failureCore = hasExplicitFailure
    ? applyTokens(rules.text.failure, context, options)
    : rules.damage
      ? formatDamageClause(rules.damage, computed, rules, options)
      : isLegacyInference && (rules.condition || rules.ongoing)
        ? ""
        : applyTokens(feature.mechanics || "", context, options);
  const failure = joinSentences([
    failureCore,
    hasExplicitFailure ? "" : formatConditionClause(rules, computed, options),
    hasExplicitFailure ? "" : formatOngoingEffect(rules, computed, options),
    hasExplicitFailure ? "" : formatRepeatSave(rules, computed, options),
  ]);
  const success = rules.text?.success
    ? applyTokens(rules.text.success, context, options)
    : rules.damage
      ? "Half damage only."
      : "No effect.";

  const triggerPrefix = rules.trigger && ["passive", "freeTrigger", "deathTrigger"].includes(rules.actionEconomy)
    ? applyTokens(rules.trigger, context, options)
    : "";

  return joinSentences([
    formatUsagePrefix(rules),
    triggerPrefix,
    formatSavePrefix(rules.resolution, rules.areaEffect?.enabled ? areaEffectToTargeting(rules.areaEffect) : rules.targeting, computed, options),
    `Failure: ${failure}`,
    `Success: ${success}`,
    renderOutcomeText("Failure or Success", rules.text?.failureOrSuccess, context, options),
    rules.text?.effect ? applyTokens(rules.text.effect, context, options) : "",
  ]);
}

function renderReactionRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed };
  const trigger = rules.text?.trigger || rules.trigger;
  const response = rules.text?.response || rules.text?.effect;
  if (response) {
    return joinSentences([
      trigger ? `Trigger: ${applyTokens(trigger, context, options)}` : "",
      `Response: ${applyTokens(response, context, options)}`,
      formatConditionClause(rules, computed, options),
      formatOngoingEffect(rules, computed, options),
      formatRepeatSave(rules, computed, options),
    ]);
  }
  if (hasSaveResolution(rules)) return renderSaveRules(feature, rules, computed, options);
  return applyTokens(feature.mechanics || "", context, options);
}

function numberWord(value) {
  const words = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
  };
  const count = Number(value || 0);
  return words[count] || String(count);
}

function attackPhrase(label, count) {
  const clean = cleanString(label) || "attack";
  const numericCount = Number(count || 1);
  if (/attack$/i.test(clean)) return `${numberWord(numericCount)} ${numericCount === 1 ? clean : `${clean}s`}`;
  return `${numberWord(numericCount)} ${clean} ${numericCount === 1 ? "attack" : "attacks"}`;
}

function formatAttackList(attacks = []) {
  const labels = attacks.map((attack) => cleanString(attack.label || attack.ref)).filter(Boolean);
  if (labels.length <= 1) return labels[0] || "attacks";
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, or ${labels[labels.length - 1]}`;
}

function formatReplacementText(replacement) {
  if (!replacement || replacement.replace === "none") return "";
  const label = cleanString(replacement.label || replacement.with);
  if (!label) return "";
  const scope = replacement.replace === "anyAttack"
    ? "any attack"
    : replacement.replace === "oneOrMoreAttacks"
      ? "one or more attacks"
      : "one attack";
  return `It can replace ${scope} with ${label}.`;
}

function renderMultiattackRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed };
  const multiattack = rules.multiattack || {};
  if (!multiattack.enabled) return "";
  if (multiattack.template) return applyTokens(multiattack.template, context, options);

  const attacks = Array.isArray(multiattack.attacks) ? multiattack.attacks : [];
  const total = Number(multiattack.count || attacks.reduce((sum, attack) => sum + Number(attack.count || 0), 0) || 2);
  const firstAttack = attacks[0] || {};
  let base = "";

  if (multiattack.mode === "choice" && attacks.length > 1) {
    base = `The monster makes ${numberWord(total)} attacks, using ${formatAttackList(attacks)} in any combination.`;
  } else if (multiattack.mode === "attackPlusAbility") {
    const ability = cleanString(multiattack.abilityLabel || multiattack.extraAbility || multiattack.label);
    const attackLabel = cleanString(firstAttack.label || firstAttack.ref || "attack");
    const attackCount = Number(firstAttack.count || total || 1);
    base = ability
      ? `The monster uses ${ability} and makes ${attackPhrase(attackLabel, attackCount)}.`
      : `The monster makes ${numberWord(total)} attacks.`;
  } else if ((multiattack.mode === "replaceOne" || multiattack.mode === "replaceAny") && attacks.length) {
    const attackLabel = cleanString(firstAttack.label || firstAttack.ref || "attack");
    const attackCount = Number(firstAttack.count || total || 1);
    base = `The monster makes ${attackPhrase(attackLabel, attackCount)}.`;
  } else if (attacks.length === 1) {
    const attackLabel = cleanString(firstAttack.label || firstAttack.ref || "attack");
    const attackCount = Number(firstAttack.count || total || 1);
    base = `The monster makes ${attackPhrase(attackLabel, attackCount)}.`;
  } else if (attacks.length > 1) {
    const clauses = attacks.map((attack) => {
      const count = Number(attack.count || 1);
      const label = cleanString(attack.label || attack.ref || "attack");
      return attackPhrase(label, count);
    });
    base = `The monster makes ${clauses.join(" and ")}.`;
  } else {
    base = `The monster makes ${numberWord(total)} attacks.`;
  }

  const replacements = (multiattack.replacements || [])
    .map(formatReplacementText)
    .filter(Boolean)
    .join(" ");
  return joinSentences([base, replacements]);
}

function formatSpellListById(spellcasting, id) {
  const list = (spellcasting?.lists || []).find((entry) => entry.id === id || entry.usage === id || entry.label === id);
  return list ? formatSpellNames(list) : "";
}

function formatSpellNames(list) {
  const refs = Array.isArray(list?.spellRefs) ? list.spellRefs : [];
  const manual = Array.isArray(list?.spells) ? list.spells : [];
  return [...refs.map(getSpell5e24Name), ...manual.map(cleanString)].filter(Boolean).join(", ");
}

function formatSpellcastingDc(spellcasting, computed, options = {}) {
  if (spellcasting?.saveDc === "none") return "";
  if (options.template) return token("spell-save-dc");
  if (spellcasting?.saveDc === "fixed" || spellcasting?.saveDc === "custom") return cleanString(spellcasting.dc || spellcasting.saveDcValue) || String(computed?.dc || "monster DC");
  return String(computed?.dc || "monster DC");
}

function formatSpellAttackBonus(spellcasting, computed, options = {}) {
  if (spellcasting?.attackBonus === "none") return "";
  if (options.template) return token("spell-attack-bonus");
  if (spellcasting?.attackBonus === "fixed" || spellcasting?.attackBonus === "custom") return cleanString(spellcasting.attackBonusValue) || modText(computed?.attack || 0);
  return modText(computed?.attack || 0);
}

function formatSpellcastingIntro(spellcasting, computed, options = {}) {
  const ability = options.template ? token("spellcasting-ability") : titleCase(spellcasting.ability || "wisdom");
  const materialClause = spellcasting.requiresMaterialComponents ? "" : ", requiring no Material components";
  const dc = formatSpellcastingDc(spellcasting, computed, options);
  const attack = formatSpellAttackBonus(spellcasting, computed, options);
  const parenthetical = [dc ? `spell save DC ${dc}` : "", attack ? `${attack} to hit with spell attacks` : ""]
    .filter(Boolean)
    .join(", ");
  const parentheticalText = parenthetical ? ` (${parenthetical})` : "";
  return `The monster casts one of the following spells${materialClause} and using ${ability} as the spellcasting ability${parentheticalText}:`;
}

function formatSpellListLine(list, options = {}) {
  const label = cleanString(list.label) || "Spells";
  const names = options.template ? token(`spell-list:${list.id || list.usage || label}`) : formatSpellNames(list);
  return names ? `${label}: ${names}.` : "";
}

function formatDefenseDamageTypes(defense) {
  const types = defense?.damageTypes || [];
  return types.length ? `${formatPlainList(types)} damage` : "damage";
}

function formatDefenseUses(defense, options = {}) {
  if (options.template) return token("defense-uses");
  return defense?.uses ? String(defense.uses) : "3";
}

function formatDefenseValue(defense, options = {}) {
  if (options.template) return token("defense-value");
  return defense?.value ? String(defense.value) : "3";
}

function formatDefenseBreakCondition(defense, options = {}) {
  if (options.template) return token("defense-break-condition");
  return cleanString(defense?.breakCondition);
}

function renderDefenseRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed };
  const defense = rules.defense || {};
  if (!defense.enabled) return "";
  if (defense.text) return applyTokens(defense.text, context, options);

  switch (defense.type) {
    case "legendaryResistance":
      return `If the monster fails a saving throw, it can choose to succeed instead. ${formatDefenseUses(defense, options)}/Day.`;
    case "magicResistance":
      return "The monster has Advantage on saving throws against spells and other magical effects.";
    case "regeneration": {
      const value = formatDefenseValue(defense, options);
      const breakCondition = formatDefenseBreakCondition(defense, options);
      const breakText = breakCondition
        ? ` If the monster ${breakCondition}, this trait doesn't function at the start of its next turn.`
        : "";
      return `The monster regains ${value} Hit Points at the start of each of its turns.${breakText}`;
    }
    case "parry":
      return `The monster adds ${formatDefenseValue(defense, options)} to its AC against one melee attack that would hit it. To do so, the monster must see the attacker.`;
    case "damageReduction": {
      const damageTypes = options.template ? token("defense-damage-types") : formatDefenseDamageTypes(defense);
      return `The monster reduces ${damageTypes} it takes by ${formatDefenseValue(defense, options)}.`;
    }
    case "evasion":
      return "If the monster is subjected to an effect that allows it to make a Dexterity Saving Throw to take only half damage, it instead takes no damage on a success and only half damage on a failure.";
    case "avoidance":
      return "If the monster is subjected to an effect that allows it to make a Saving Throw to take only half damage, it instead takes no damage on a success and only half damage on a failure.";
    case "turnResistance":
      return "The monster has Advantage on saving throws against effects that turn undead.";
    case "defensiveReaction": {
      const trigger = rules.text?.trigger || rules.trigger;
      const response = rules.text?.response || rules.text?.effect || "The monster uses its defensive response.";
      return joinSentences([
        trigger ? `Trigger: ${applyTokens(trigger, context, options)}` : "",
        `Response: ${applyTokens(response, context, options)}`,
      ]);
    }
    default:
      return rules.text?.effect ? applyTokens(rules.text.effect, context, options) : "";
  }
}

function formatSummonCreature(summon = {}) {
  const name = cleanString(summon.creatureName || summon.creatureRef || "creature");
  const count = cleanString(summon.count || "1");
  const plural = count === "1" || /^one$/i.test(count) ? name : /s$/i.test(name) ? name : `${name}s`;
  return `${count} ${plural}`.trim();
}

function formatSummonVerb(type) {
  const map = {
    summon: "summons",
    create: "creates",
    animate: "animates",
    transform: "transforms the target into",
    spawn: "spawns",
  };
  return map[type] || "creates";
}

function formatSummonInitiative(summon = {}) {
  const map = {
    immediatelyAfterSummoner: "The summoned creatures act immediately after the monster.",
    rollInitiative: "The summoned creatures roll initiative.",
    sameInitiative: "The summoned creatures act on the monster's initiative.",
    startOfNextRound: "The summoned creatures act at the start of the next round.",
  };
  return map[summon.initiative] || cleanString(summon.initiative);
}

function formatSummonControl(summon = {}) {
  const map = {
    underSummonerControl: "They obey the monster's commands.",
    hostileToAll: "They are hostile to all creatures.",
    alliedToSummoner: "They are allied with the monster.",
    uncontrolled: "They act without the monster's control.",
  };
  return map[summon.control] || cleanString(summon.control);
}

function renderSummonRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed };
  const summon = rules.summon || {};
  if (!summon.enabled) return "";
  if (summon.text) return applyTokens(summon.text, context, options);

  const trigger = summon.trigger || rules.trigger;
  const usagePrefix = formatUsagePrefix(rules);
  const rawLimit = summon.limit ? applyTokens(summon.limit, context, options) : "";
  const limit = rawLimit && rawLimit.replace(/[.]+$/, "") !== usagePrefix.replace(/[.]+$/, "") ? `${rawLimit}.` : "";
  const creature = options.template ? token("summon-creature") : formatSummonCreature(summon);
  const placement = summon.placement
    ? ` in ${options.template ? token("summon-placement") : applyTokens(summon.placement, context, options)}`
    : "";
  const duration = summon.duration
    ? ` They remain ${options.template ? token("summon-duration") : applyTokens(summon.duration, context, options)}.`
    : "";
  const initiative = options.template ? token("summon-initiative") : formatSummonInitiative(summon);
  const control = options.template ? token("summon-control") : formatSummonControl(summon);

  return joinSentences([
    usagePrefix,
    trigger ? applyTokens(trigger, context, options) : "",
    limit,
    `The monster ${formatSummonVerb(summon.type)} ${creature}${placement}.`,
    initiative,
    control,
    duration,
    rules.text?.effect ? applyTokens(rules.text.effect, context, options) : "",
  ]);
}

function formatProcedureType(type = "custom") {
  const map = {
    swallow: "Swallow",
    engulf: "Engulf",
    possession: "Possession",
    shapechange: "Shapechange",
    objectAnimation: "Object Animation",
    corpseDetonation: "Corpse Detonation",
    burrowReturn: "Burrow and Return",
    gazeLock: "Gaze Lock",
    custom: "Special Procedure",
  };
  return map[type] || titleCase(type);
}

function formatProcedureOngoingTiming(timing) {
  const map = {
    startOfTargetTurn: "at the start of each of the target's turns",
    endOfTargetTurn: "at the end of each of the target's turns",
    startOfMonsterTurn: "at the start of each of the monster's turns",
    endOfMonsterTurn: "at the end of each of the monster's turns",
    whenTriggered: "when the triggering event occurs",
    whileContained: "while the target is contained",
  };
  return map[timing] || cleanString(timing);
}

function formatProcedureOngoingDamage(rules, computed, options = {}) {
  const ongoing = rules.procedure?.ongoingDamage;
  if (!ongoing?.enabled) return "";
  if (ongoing.text) return applyTokens(ongoing.text, { feature: null, rules, computed }, options);
  if (options.template) return token("procedure-ongoing-damage");
  const amount = formatDamageAmountWithType(ongoing.damage, computed, rules, options);
  if (!amount) return "";
  const timing = sentenceCase(formatProcedureOngoingTiming(ongoing.timing || "startOfMonsterTurn"));
  const endCondition = ongoing.endCondition ? ` This continues ${ongoing.endCondition}.` : "";
  return `${timing}, the target takes ${amount}.${endCondition}`.replace(/\.\s*\./g, ".").trim();
}

function renderProcedureRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed };
  const procedure = rules.procedure || {};
  if (!procedure.enabled) return "";
  if (procedure.text) return applyTokens(procedure.text, context, options);

  const procedureTitle = formatProcedureType(procedure.type);
  const targetLimit = procedure.targetLimit
    ? `Target Limit: ${options.template ? token("procedure-target-limit") : applyTokens(procedure.targetLimit, context, options)}.`
    : "";
  const prerequisite = procedure.prerequisite
    ? `Prerequisite: ${options.template ? token("procedure-prerequisite") : applyTokens(procedure.prerequisite, context, options)}`
    : "";
  const entryEffect = procedure.entryEffect
    ? (options.template ? token("procedure-entry-effect") : applyTokens(procedure.entryEffect, context, options))
    : "";
  const internalState = procedure.internalState
    ? (options.template ? token("procedure-internal-state") : applyTokens(procedure.internalState, context, options))
    : "";
  const escapeCondition = procedure.escapeCondition
    ? `Escape: ${options.template ? token("procedure-escape-condition") : applyTokens(procedure.escapeCondition, context, options)}`
    : "";
  const releaseCondition = procedure.releaseCondition
    ? `Release: ${options.template ? token("procedure-release-condition") : applyTokens(procedure.releaseCondition, context, options)}`
    : "";

  return joinSentences([
    formatUsagePrefix(rules),
    rules.trigger ? applyTokens(rules.trigger, context, options) : "",
    `${procedureTitle}.`,
    targetLimit,
    prerequisite,
    entryEffect,
    internalState,
    formatProcedureOngoingDamage(rules, computed, options),
    escapeCondition,
    releaseCondition,
    rules.text?.effect ? applyTokens(rules.text.effect, context, options) : "",
  ]);
}

function renderSpellcastingRules(feature, rules, computed, options = {}) {
  const context = { feature, rules, computed };
  const spellcasting = rules.spellcasting || {};
  if (!spellcasting.enabled) return "";
  if (spellcasting.text) return applyTokens(spellcasting.text, context, options);
  const intro = formatSpellcastingIntro(spellcasting, computed, options);
  const lists = (spellcasting.lists || []).map((list) => formatSpellListLine(list, options));
  return joinSentences([
    formatUsagePrefix(rules),
    intro,
    ...lists,
    rules.text?.effect ? applyTokens(rules.text.effect, context, options) : "",
  ]);
}

function renderStructuredRules(feature, computed = null, options = {}) {
  const rules = normalizeMonsterGraftRules(feature);
  if (!rules.migration?.isStructured) return null;

  const manualText = rules.text?.manual || rules.text?.override;
  if (!options.ignoreManual && rules.text?.source === "manual" && manualText) {
    return applyTokens(manualText, { feature, rules, computed }, options);
  }

  if (rules.multiattack?.enabled) return renderMultiattackRules(feature, rules, computed, options);
  if (rules.spellcasting?.enabled) return renderSpellcastingRules(feature, rules, computed, options);
  if (rules.summon?.enabled) return renderSummonRules(feature, rules, computed, options);
  if (rules.procedure?.enabled) return renderProcedureRules(feature, rules, computed, options);
  if (rules.defense?.enabled) return renderDefenseRules(feature, rules, computed, options);
  if (rules.areaEffect?.enabled && !hasAttackResolution(rules) && !hasSaveResolution(rules)) return renderAreaEffectRules(feature, rules, computed, options);
  if (rules.references?.length && !hasAttackResolution(rules) && !hasSaveResolution(rules) && !rules.text?.effect) return renderAbilityReferencesRules(feature, rules, computed, options);
  if (rules.actionEconomy === "reaction") return renderReactionRules(feature, rules, computed, options);
  if (rules.text?.effect && ["trait", "death"].includes(rules.section)) {
    return applyTokens(rules.text.effect, { feature, rules, computed }, options);
  }
  if (hasAttackResolution(rules)) return renderAttackRules(feature, rules, computed, options);
  if (hasSaveResolution(rules)) return renderSaveRules(feature, rules, computed, options);
  if (rules.text?.effect) return applyTokens(rules.text.effect, { feature, rules, computed }, options);
  return null;
}

export function renderStructuredRulesText(feature, computed = null) {
  return renderStructuredRules(feature, computed, { template: false });
}

export function renderStructuredRulesTemplate(feature) {
  return renderStructuredRules(feature, null, { template: true, ignoreManual: true });
}
