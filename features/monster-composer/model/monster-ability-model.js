import {
  BLOCKING_DAMAGE_ISSUE_CODES,
  MONSTER_GRAFT_RULES_SCHEMA_VERSION,
  getDamageActivationRate,
  getDamageBudgetShare,
  getDamageExpectedTargets,
  getDamageParts,
  getDamageRoundWeight,
  getMonsterRuleEffects,
  getMonsterRulesParity,
  normalizeMonsterGraftRules,
  validateMonsterGraftRules,
} from "./monster-graft-rules.schema.js";
import {
  isMonsterGraftV2,
  normalizeMonsterGraftV2,
  validateMonsterGraftV2,
} from "./monster-graft-v2.schema.js";
import {
  projectMonsterGraftForCr,
} from "./monster-attack-pattern-progression.js";

export const MONSTER_ABILITY_MODEL_VERSION = "monster-ability-model-v0.9-basic-attack-fallback";
export const MONSTER_ABILITY_BUNDLE_VERSION = "monster-ability-bundle-v1.0";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function uniqueArray(values = []) {
  return [...new Set(asArray(values).map(cleanString).filter(Boolean))];
}

function countBy(values = []) {
  return values.reduce((acc, value) => {
    const key = cleanString(value) || "none";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function isAttackResolution(resolution = {}) {
  return resolution.type === "attackRoll" || resolution.type === "attackRollSavingThrow";
}

function isSaveResolution(resolution = {}) {
  return resolution.type === "savingThrow" || resolution.type === "attackRollSavingThrow";
}

function normalizeRoundWeightForAbility(damage = {}, rules = {}) {
  const weights = getDamageRoundWeight(damage, rules);
  return Array.isArray(weights) && weights.length ? weights : [1, 1, 1];
}

function buildDamageEntry({ damage, rules, source, parentId = null, index = 0 }) {
  if (!damage || damage.mode === "none") return null;
  return {
    id: cleanString(damage.id) || `${source}-${index + 1}`,
    source,
    parentId,
    mode: damage.mode || "budget",
    budgetRole: damage.budgetRole || "none",
    budgetShare: getDamageBudgetShare(damage, rules),
    expectedTargets: getDamageExpectedTargets(damage, rules),
    roundWeight: normalizeRoundWeightForAbility(damage, rules),
    scale: damage.scale || "standard",
    types: uniqueArray(damage.types || damage.type),
    abilityBasis: cleanString(damage.abilityBasis || rules.resolution?.abilityBasis || ""),
    modifierPolicy: cleanString(damage.modifierPolicy || ""),
    activation: damage.activation || null,
    activationRate: getDamageActivationRate(damage),
    damage,
  };
}

function collectDamageEntries(rules = {}) {
  const entries = [];
  const damage = rules.damage;
  const parts = getDamageParts(damage);

  if (parts.length) {
    parts.forEach((part, index) => {
      const entry = buildDamageEntry({
        damage: part,
        rules,
        source: "damage_part",
        parentId: cleanString(damage?.id || "damage"),
        index,
      });
      if (entry) entries.push(entry);
    });
  } else if (damage && damage.mode !== "none") {
    const entry = buildDamageEntry({ damage, rules, source: "damage", index: 0 });
    if (entry) entries.push(entry);
  }

  if (rules.ongoing?.enabled && rules.ongoing.damage) {
    const entry = buildDamageEntry({
      damage: rules.ongoing.damage,
      rules: { ...rules, actionEconomy: "freeTrigger", usage: { type: "triggered" } },
      source: "ongoing",
      index: entries.length,
    });
    if (entry) entries.push(entry);
  }

  if (rules.procedure?.ongoingDamage?.enabled && rules.procedure.ongoingDamage.damage) {
    const entry = buildDamageEntry({
      damage: rules.procedure.ongoingDamage.damage,
      rules: { ...rules, actionEconomy: "freeTrigger", usage: { type: "triggered" } },
      source: "procedure_ongoing",
      index: entries.length,
    });
    if (entry) entries.push(entry);
  }

  return entries;
}

function buildResolutionProfile(rules = {}) {
  const primary = rules.resolution || { type: "none" };
  const secondary = rules.secondaryResolution || null;
  return {
    type: primary.type || "none",
    primary,
    secondary,
    attack: isAttackResolution(primary)
      ? {
          attackType: primary.attackType || "melee",
          abilityBasis: primary.abilityBasis || "monster",
          bonusSource: primary.bonus || "monster",
          reach: primary.reach || null,
          range: primary.range || null,
        }
      : null,
    save: isSaveResolution(primary)
      ? {
          ability: primary.ability || null,
          dcSource: primary.dc || "monster",
        }
      : null,
    secondarySave: secondary?.type === "savingThrow"
      ? {
          ability: secondary.ability || null,
          dcSource: secondary.dc || "monster",
        }
      : null,
  };
}


function hasBlockingDamageIssue(rulesValidation = {}) {
  const blockingCodes = new Set(BLOCKING_DAMAGE_ISSUE_CODES);
  return (rulesValidation.issues || []).some((issue) => issue.severity === "error" && blockingCodes.has(issue.code));
}

function buildConditionEntries(condition = null) {
  if (!condition?.names?.length) return [];
  return condition.names.map((name) => ({
    name,
    severity: condition.severity || "moderate",
    duration: condition.duration || "",
    sizeLimit: condition.sizeLimit || "",
    special: uniqueArray(condition.special),
    escape: condition.escape || null,
    repeatSave: condition.repeatSave || null,
  }));
}

function buildAbilityTags({ rules, damageEntries, conditions, resolution }) {
  const tags = [];
  if (damageEntries.length) tags.push("damage");
  if (resolution.attack) tags.push("attack_roll");
  if (resolution.save) tags.push("saving_throw");
  if (resolution.secondarySave) tags.push("secondary_save");
  if (conditions.length) tags.push("condition");
  conditions.forEach((condition) => {
    tags.push(`condition:${condition.name}`);
    tags.push(`condition_severity:${condition.severity}`);
  });
  if (rules.usage?.type) tags.push(`usage:${rules.usage.type}`);
  if (rules.actionEconomy) tags.push(`action_economy:${rules.actionEconomy}`);
  if (rules.multiattack?.enabled) tags.push("multiattack");
  if (rules.multiattackParticipation?.enabled) {
    tags.push("multiattack_participant");
    tags.push(`multiattack_role:${rules.multiattackParticipation.role || "primary"}`);
  }
  if (rules.spellcasting?.enabled) tags.push("spellcasting");
  if (rules.defense?.enabled) tags.push(`defense:${rules.defense.type || "custom"}`);
  if (rules.summon?.enabled) tags.push("summon");
  if (rules.procedure?.enabled) tags.push(`procedure:${rules.procedure.type || "custom"}`);
  if (rules.areaEffect?.enabled) tags.push("area_effect");
  if (rules.ongoing?.enabled) tags.push("ongoing");
  if (rules.counterplay?.telegraph) tags.push("counterplay:telegraph");
  if (rules.counterplay?.breakCondition) tags.push("counterplay:break_condition");
  if (rules.counterplay?.positioningAnswer) tags.push("counterplay:positioning");
  if (rules.counterplay?.nonDamageAnswer) tags.push("counterplay:non_damage");
  return uniqueArray(tags);
}

function getPrimarySourceAnchor(feature = {}) {
  return cleanString(feature.sourceAnchors?.[0] || feature.source);
}

function getSourceComponentId(feature = {}) {
  return cleanString(
    feature.registry?.componentId ||
      feature.contentComponentId ||
      feature.componentId,
  ) || null;
}

function buildAbilityRecord(
  feature = {},
  {
    runtimeId = "",
    sourceGraftId = "",
    localAbilityId = "",
    index = 0,
    compilation = "legacy-adapter",
    authorship = "authored",
    synthetic = false,
    graftSchemaVersion = null,
  } = {},
) {
  const rules = normalizeMonsterGraftRules(feature);
  const rulesValidation = validateMonsterGraftRules(feature);
  const damageEntries = hasBlockingDamageIssue(rulesValidation)
    ? []
    : collectDamageEntries(rules);
  const conditions = buildConditionEntries(rules.condition);
  const effects = getMonsterRuleEffects(rules);
  const parity = getMonsterRulesParity(rules);
  const resolution = buildResolutionProfile(rules);
  const tags = buildAbilityTags({ rules, damageEntries, conditions, resolution });
  effects.forEach((effect) => {
    tags.push(`effect:${effect.type || "custom"}`);
    tags.push(`effect_simulation:${effect.simulation?.policy || "unmodeled"}`);
  });
  const resolvedGraftId = cleanString(sourceGraftId || feature.sourceGraftId || feature.id);
  const resolvedLocalId = cleanString(localAbilityId || feature.localAbilityId || feature.id);
  const resolvedRuntimeId =
    cleanString(runtimeId || feature.id) || `ability-${index + 1}`;
  const sourceAnchor = getPrimarySourceAnchor(feature);
  const sourceComponentId = getSourceComponentId(feature);

  return {
    version: MONSTER_ABILITY_MODEL_VERSION,
    id: resolvedRuntimeId,
    sourceGraftId: resolvedGraftId || null,
    localAbilityId: resolvedLocalId || null,
    sourceComponentId,
    title: cleanString(feature.title) || `Ability ${index + 1}`,
    source: cleanString(feature.source || sourceAnchor),
    sourceAnchor: sourceAnchor || null,
    slot: cleanString(feature.slot),
    section: rules.section || feature.section || "trait",
    actionEconomy: rules.actionEconomy || "passive",
    usage: rules.usage || { type: "passive" },
    trigger: rules.trigger || null,
    resolution,
    targeting: rules.targeting || null,
    areaEffect: rules.areaEffect || null,
    damage: {
      hasDamage: damageEntries.length > 0,
      entries: damageEntries,
      totalBudgetShare: damageEntries.reduce(
        (sum, entry) => sum + Number(entry.budgetShare || 0),
        0,
      ),
      damageTypes: uniqueArray(damageEntries.flatMap((entry) => entry.types)),
    },
    conditions,
    effects,
    parity,
    counterplay: rules.counterplay || {},
    multiattack: rules.multiattack || null,
    multiattackParticipation: rules.multiattackParticipation || null,
    spellcasting: rules.spellcasting || null,
    defense: rules.defense || null,
    summon: rules.summon || null,
    procedure: rules.procedure || null,
    ongoing: rules.ongoing || null,
    references: rules.references || [],
    patternRole: cleanString(feature.patternRole) || null,
    patternRoutine: feature.patternRoutine || null,
    patternIdentity: feature.patternIdentity || null,
    patternCounterplay: feature.patternCounterplay || null,
    progression: feature.progression || null,
    patternProgression: feature.patternProgression || null,
    rules,
    rulesValidation,
    tags,
    synthetic: Boolean(synthetic),
    baselineAbility: Boolean(feature.baselineAbility),
    generatedBy: cleanString(feature.generatedBy) || null,
    provenance: {
      sourceGraftId: resolvedGraftId || null,
      sourceComponentId,
      sourceAnchor: sourceAnchor || null,
      localAbilityId: resolvedLocalId || null,
      migrationOrigin:
        cleanString(
          feature.migration?.origin ||
            feature.authoring?.origin ||
            rules.migration?.source,
        ) || "unknown",
      authorship,
      compilation,
      synthetic: Boolean(synthetic),
    },
    migration: {
      source: rules.migration?.source || "unknown",
      isStructured: Boolean(rules.migration?.isStructured),
      abilityModel: MONSTER_ABILITY_MODEL_VERSION,
      abilityBundle: MONSTER_ABILITY_BUNDLE_VERSION,
      graftSchemaVersion,
      compilation,
      authorship,
    },
  };
}

function buildLegacyAbility(feature = {}, { index = 0 } = {}) {
  const featureId = cleanString(feature.id) || `ability-${index + 1}`;
  const synthetic = Boolean(feature.synthetic);
  return buildAbilityRecord(feature, {
    runtimeId: featureId,
    sourceGraftId: featureId,
    localAbilityId: featureId,
    index,
    compilation: "legacy-adapter",
    authorship: synthetic ? "compiler-generated" : "legacy-authored",
    synthetic,
    graftSchemaVersion: null,
  });
}

function buildV2AbilityFeature(graft = {}, descriptor = {}, runtimeId = "", normalized = null) {
  const sourceAnchor = getPrimarySourceAnchor(graft);
  const rules = {
    schemaVersion:
      descriptor.rules?.schemaVersion || MONSTER_GRAFT_RULES_SCHEMA_VERSION,
    ...(descriptor.rules || {}),
  };
  return {
    ...graft,
    ...descriptor,
    id: runtimeId,
    sourceGraftId: graft.id,
    localAbilityId: descriptor.id,
    title: descriptor.title,
    source: sourceAnchor || graft.source,
    sourceAnchors: graft.sourceAnchors,
    slot: graft.slot,
    section: descriptor.section || rules.section || graft.section || "trait",
    mechanics: descriptor.mechanics || "",
    counterplay: descriptor.counterplay || "",
    patternRole: descriptor.patternRole || descriptor.role || null,
    patternRoutine: normalized?.kind === "attackPattern" ? normalized.routine : null,
    patternIdentity: normalized?.kind === "attackPattern" ? normalized.identity : null,
    patternCounterplay: normalized?.kind === "attackPattern" ? normalized.counterplayProfile : null,
    progression: descriptor.progression || null,
    patternProgression: normalized?.kind === "attackPattern" ? normalized.progression : null,
    rules,
  };
}

function buildRoutineMultiattackDescriptor(graft = {}, normalized = {}) {
  const multiattack = normalized.routine?.multiattack;
  if (!multiattack?.enabled) return null;
  const localIds = new Set(normalized.abilities.map((ability) => ability.id));
  const localId = localIds.has("multiattack")
    ? "routine-multiattack"
    : "multiattack";
  const titles = new Map(
    normalized.abilities.map((ability) => [ability.id, ability.title]),
  );
  const multiattackBands = (normalized.progression?.bands || []).filter(
    (band) => band.multiattack?.enabled,
  );
  const multiattackProgression = multiattackBands.length
    ? {
        schemaVersion: normalized.progression?.schemaVersion,
        basis: normalized.progression?.basis || "targetCr",
        minCr: Math.min(...multiattackBands.map((band) => Number(band.minCr || 0))),
        maxCr: Math.max(...multiattackBands.map((band) => Number(band.maxCr ?? 30))),
        bandIds: multiattackBands.map((band) => band.id),
      }
    : null;
  return {
    id: localId,
    title: "Multiattack",
    progression: multiattackProgression,
    section: "action",
    authored: false,
    synthetic: true,
    rules: {
      schemaVersion: MONSTER_GRAFT_RULES_SCHEMA_VERSION,
      section: "action",
      actionEconomy: "action",
      usage: { type: "atWill" },
      trigger: null,
      resolution: { type: "none" },
      secondaryResolution: null,
      targeting: { type: "self", targets: "the creature" },
      areaEffect: null,
      damage: {
        mode: "none",
        budgetRole: "none",
        types: [],
        parts: [],
      },
      condition: null,
      counterplay: {
        telegraph: false,
        breakCondition: false,
        positioningAnswer: false,
        nonDamageAnswer: false,
      },
      text: {},
      multiattack: {
        enabled: true,
        mode: multiattack.mode,
        count: multiattack.count,
        attacks: multiattack.attacks.map((attack) => ({
          ref: `${graft.id}:${attack.ref}`,
          label: attack.label || titles.get(attack.ref) || attack.ref,
          count: attack.count,
        })),
        replacements: multiattack.replacements.map((replacement) => ({
          replace: replacement.replace,
          with: `${graft.id}:${replacement.with}`,
          label:
            replacement.label ||
            titles.get(replacement.with) ||
            replacement.with,
          availability: replacement.availability || "always",
        })),
      },
      multiattackParticipation: null,
      spellcasting: null,
      defense: null,
      summon: null,
      procedure: null,
      references: [],
      ongoing: null,
      migration: {
        source: "monster-graft-v2-compiler",
        isStructured: true,
        convertedFrom: "graft-routine",
      },
    },
  };
}

export function buildMonsterAbilityBundleFromGraft(
  feature = {},
  { index = 0, targetCr = null } = {},
) {
  if (!isMonsterGraftV2(feature)) {
    const ability = buildLegacyAbility(feature, { index });
    return {
      version: MONSTER_ABILITY_BUNDLE_VERSION,
      schemaVersion: null,
      graftId: cleanString(feature.id) || `graft-${index + 1}`,
      sourceComponentId: getSourceComponentId(feature),
      sourceAnchor: getPrimarySourceAnchor(feature) || null,
      compilation: "legacy-adapter",
      routine: null,
      abilities: [ability],
      primaryAbility: ability,
      validation: {
        status: ability.rulesValidation.status,
        issues: ability.rulesValidation.issues,
        errors: ability.rulesValidation.issues.filter(
          (issue) => issue.severity === "error",
        ),
        warnings: ability.rulesValidation.issues.filter(
          (issue) => issue.severity === "warning",
        ),
      },
    };
  }

  const report = validateMonsterGraftV2(feature);
  const hasCrContext = targetCr !== null && targetCr !== undefined && targetCr !== "" && Number.isFinite(Number(targetCr));
  const compiledGraft = hasCrContext
    ? projectMonsterGraftForCr(feature, { targetCr: Number(targetCr) })
    : feature;
  const normalized = normalizeMonsterGraftV2(compiledGraft) || report.normalized;
  const authoredDescriptors = normalized?.abilities || [];
  const routineDescriptor = buildRoutineMultiattackDescriptor(
    compiledGraft,
    normalized || {},
  );
  const descriptors = [
    ...(routineDescriptor ? [routineDescriptor] : []),
    ...authoredDescriptors,
  ];
  const abilities = descriptors.map((descriptor, abilityIndex) => {
    const runtimeId = `${feature.id}:${descriptor.id}`;
    const compiledFeature = buildV2AbilityFeature(
      compiledGraft,
      descriptor,
      runtimeId,
      normalized,
    );
    return buildAbilityRecord(compiledFeature, {
      runtimeId,
      sourceGraftId: compiledGraft.id,
      localAbilityId: descriptor.id,
      index: abilityIndex,
      compilation: "graft-v2-bundle",
      authorship:
        descriptor.synthetic || descriptor.authored === false
          ? "compiler-generated"
          : "authored",
      synthetic: Boolean(descriptor.synthetic),
      graftSchemaVersion: normalized?.schemaVersion || null,
    });
  });
  const abilityIssues = abilities
    .filter((ability) => ability.synthetic)
    .flatMap((ability) =>
      ability.rulesValidation.issues.map((issue) => ({
        ...issue,
        abilityId: ability.id,
        localAbilityId: ability.localAbilityId,
      })),
    );
  const issues = [...report.issues, ...abilityIssues];
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const primaryAbility =
    abilities.find((ability) => !ability.synthetic) || abilities[0] || null;

  return {
    version: MONSTER_ABILITY_BUNDLE_VERSION,
    schemaVersion: normalized?.schemaVersion || null,
    graftId: normalized?.id || cleanString(feature.id) || `graft-${index + 1}`,
    sourceComponentId: getSourceComponentId(compiledGraft),
    sourceAnchor: getPrimarySourceAnchor(compiledGraft) || null,
    kind: normalized?.kind || null,
    identity: normalized?.identity || null,
    compilation: "graft-v2-bundle",
    routine: normalized?.routine || null,
    progression: normalized?.progression || null,
    projection: compiledGraft.projection || null,
    abilities,
    primaryAbility,
    validation: {
      status: errors.length ? "error" : warnings.length ? "warning" : "pass",
      issues,
      errors,
      warnings,
    },
  };
}

export function buildMonsterAbilityFromGraft(feature = {}, { index = 0, targetCr = null } = {}) {
  return buildMonsterAbilityBundleFromGraft(feature, { index, targetCr }).primaryAbility;
}

export function expandMonsterFeaturesForStatBlock(features = [], { targetCr = null } = {}) {
  return asArray(features).flatMap((feature, index) => {
    if (!isMonsterGraftV2(feature)) return [feature];
    const bundle = buildMonsterAbilityBundleFromGraft(feature, { index, targetCr });
    return bundle.abilities.length ? bundle.abilities : [feature];
  });
}

export function buildMonsterAbilitiesFromFeatures(features = [], { targetCr = null } = {}) {
  const bundles = asArray(features).map((feature, index) =>
    buildMonsterAbilityBundleFromGraft(feature, { index, targetCr }),
  );
  const abilities = bundles.flatMap((bundle) => bundle.abilities);
  const errors = bundles.flatMap((bundle) =>
    bundle.validation.errors.map((issue) => ({
      graftId: bundle.graftId,
      abilityId: issue.abilityId || null,
      title:
        abilities.find((ability) => ability.id === issue.abilityId)?.title ||
        bundle.graftId,
      ...issue,
    })),
  );
  const warnings = bundles.flatMap((bundle) =>
    bundle.validation.warnings.map((issue) => ({
      graftId: bundle.graftId,
      abilityId: issue.abilityId || null,
      title:
        abilities.find((ability) => ability.id === issue.abilityId)?.title ||
        bundle.graftId,
      ...issue,
    })),
  );

  return {
    version: MONSTER_ABILITY_MODEL_VERSION,
    bundleVersion: MONSTER_ABILITY_BUNDLE_VERSION,
    grafts: bundles.length,
    total: abilities.length,
    bundles,
    abilities,
    byGraft: Object.fromEntries(
      bundles.map((bundle) => [bundle.graftId, bundle.abilities.length]),
    ),
    legacyGrafts: bundles.filter(
      (bundle) => bundle.compilation === "legacy-adapter",
    ).length,
    v2Grafts: bundles.filter(
      (bundle) => bundle.compilation === "graft-v2-bundle",
    ).length,
    synthetic: abilities.filter((ability) => ability.synthetic).length,
    bySection: countBy(abilities.map((ability) => ability.section)),
    byActionEconomy: countBy(
      abilities.map((ability) => ability.actionEconomy),
    ),
    damaging: abilities.filter((ability) => ability.damage.hasDamage).length,
    controlling: abilities.filter((ability) => ability.conditions.length > 0)
      .length,
    structured: abilities.filter((ability) => ability.migration.isStructured)
      .length,
    inferred: abilities.filter((ability) => !ability.migration.isStructured)
      .length,
    tags: uniqueArray(abilities.flatMap((ability) => ability.tags)),
    validation: {
      status: errors.length ? "error" : warnings.length ? "warning" : "pass",
      errors,
      warnings,
    },
  };
}

export function summarizeMonsterAbilities(features = [], options = {}) {
  const model = buildMonsterAbilitiesFromFeatures(features, options);
  return {
    version: model.version,
    bundleVersion: model.bundleVersion,
    grafts: model.grafts,
    total: model.total,
    legacyGrafts: model.legacyGrafts,
    v2Grafts: model.v2Grafts,
    synthetic: model.synthetic,
    structured: model.structured,
    inferred: model.inferred,
    damaging: model.damaging,
    controlling: model.controlling,
    bySection: model.bySection,
    byActionEconomy: model.byActionEconomy,
    validationStatus: model.validation.status,
    errorCount: model.validation.errors.length,
    warningCount: model.validation.warnings.length,
  };
}
