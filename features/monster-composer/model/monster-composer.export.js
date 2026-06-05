import { MONSTER_GRAFTS as FEATURES } from "../data/monster-grafts.js";
import { MONSTER_FAMILY_PRESETS } from "../data/monster-presets.js";
import { SLOTS } from "../monster-composer.workflow.js";
import { asArray, hasSelectedSlot, uniqueArray } from "./monster-composer.selection.js";
import { getFeatureCompatibility, hasFeatureCompatibilityOverride } from "./monster-composer.compatibility.js";
import {
  COMPLEXITY_LABELS,
  PRESSURE_LABELS,
  countValues,
  formatBreakdownCompact,
  formatCounterplayIssues,
  getFeatureComplexityWeight,
  getFeatureCounterplayProfile,
  getFeatureMechanicProfile,
  getFeaturePressureWeight,
  getFeatureSection,
  hasFeatureMechanicOverride,
  getTopFeatureByWeight,
} from "./monster-composer.balance.js";

const FEATURE_SCHEMA_VERSION = "monster-graft-v0.8";
const EXPORT_SCHEMA_VERSION = "monster-crucible-export-v0.8";
const DATA_MODEL_MIGRATION_STAGE = "structured-layer-with-override-fallbacks";

const STAT_BLOCK_SECTION_LABELS = {
  trait: "Traits",
  action: "Actions",
  bonusAction: "Bonus Actions",
  reaction: "Reactions",
  legendaryAction: "Legendary Actions",
  lairAction: "Lair Actions",
  death: "Death Effects",
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function modText(value) {
  return value >= 0 ? `+${value}` : `−${Math.abs(value)}`;
}

function normalizePresetSelection(preset) {
  if (!preset?.selection) return {};
  return Object.fromEntries(
    Object.entries(preset.selection)
      .map(([slotId, value]) => {
        const ids = asArray(value).filter((id) =>
          FEATURES.some((feature) => feature.id === id && feature.slot === slotId)
        );
        return [slotId, ids.length > 1 ? ids : ids[0]];
      })
      .filter(([, value]) => (Array.isArray(value) ? value.length : Boolean(value)))
  );
}

function getPresetFeatureIds(preset) {
  return Object.values(normalizePresetSelection(preset)).flatMap((value) =>
    Array.isArray(value) ? value : [value]
  );
}

function getPresetCoverage(preset) {
  const selection = normalizePresetSelection(preset);
  const slotCount = Object.keys(selection).length;
  const graftCount = getPresetFeatureIds(preset).length;
  return {
    slotCount,
    graftCount,
    percent: clamp(Math.round((slotCount / SLOTS.length) * 100), 0, 100),
  };
}

export function getSectionLabel(section) {
  return STAT_BLOCK_SECTION_LABELS[section] || titleCase(section);
}

export function groupFeaturesBySection(features) {
  return features.reduce((groups, feature) => {
    const section = getFeatureSection(feature);
    if (!groups[section]) groups[section] = [];
    groups[section].push(feature);
    return groups;
  }, {});
}

function getStatBlockBasics(creatureType, category, role, computed, abilityProfile, xp) {
  const initiative =
    (abilityProfile.physical.find((row) => row.key === "dex")?.mod || 0) +
    (computed.tempoProfile?.initiativeMod || 0);
  const initiativeTotal = 10 + initiative;
  const size = role.id === "boss" ? "Large" : role.id === "minion" ? "Small" : "Medium";
  const creatureLine = `${size} ${creatureType.label} (${category}), Unaligned`;
  const resistances =
    creatureType.id === "undead"
      ? "Necrotic; Bludgeoning, Piercing, and Slashing damage from nonmagical attacks"
      : creatureType.id === "beast"
        ? "Poison"
        : "Psychic, Necrotic";
  const immunities =
    creatureType.id === "undead"
      ? "Poison damage; Poisoned condition"
      : creatureType.id === "beast"
        ? "None"
        : "Charmed and Frightened conditions";
  const skills =
    creatureType.id === "beast"
      ? `Perception ${modText(computed.prof + 2)}, Stealth ${modText(computed.prof + 2)}`
      : creatureType.id === "aberration"
        ? `Insight ${modText(computed.prof + 2)}, Perception ${modText(computed.prof + 2)}`
        : `Perception ${modText(computed.prof)}`;
  const languages =
    creatureType.id === "beast"
      ? "None"
      : creatureType.id === "undead"
        ? "Understands the languages it knew in life but can’t speak"
        : "Deep Speech or telepathy 60 ft.";

  return {
    initiative,
    initiativeTotal,
    size,
    creatureLine,
    resistances,
    immunities,
    skills,
    languages,
    xp,
  };
}

function exportItems(items, fallback, computed) {
  return (items.length ? items : fallback)
    .map((item) => `${item.title}. ${normalizeRulesText(item.mechanics, computed)}`)
    .join(String.fromCharCode(10));
}

function abilityExportLines(abilityProfile) {
  return [...abilityProfile.physical, ...abilityProfile.mental]
    .map((row) => `${row.label} ${row.score} (${modText(row.mod)}), Save ${modText(row.save)}`)
    .join(String.fromCharCode(10));
}

function hpFormula(hitPoints, dieSize = 8) {
  const average = dieSize / 2 + 0.5;
  const dice = Math.max(1, Math.round(hitPoints / Math.max(1, average + 3)));
  const flat = Math.round(hitPoints - dice * average);
  if (flat === 0) return `${dice}d${dieSize}`;
  return `${dice}d${dieSize} ${flat > 0 ? "+" : "−"} ${Math.abs(flat)}`;
}

function replaceAllText(text, search, replacement) {
  return String(text || "")
    .split(search)
    .join(replacement);
}

function normalizeConditionWording(text) {
  let output = String(text || "");
  [
    "Blinded",
    "Charmed",
    "Deafened",
    "Frightened",
    "Grappled",
    "Incapacitated",
    "Invisible",
    "Paralyzed",
    "Petrified",
    "Poisoned",
    "Prone",
    "Restrained",
    "Stunned",
    "Unconscious",
  ].forEach((condition) => {
    output = replaceAllText(output, `is ${condition}`, `has the ${condition} condition`);
    output = replaceAllText(output, `is also ${condition}`, `also has the ${condition} condition`);
    output = replaceAllText(output, `becomes ${condition}`, `has the ${condition} condition`);
    output = replaceAllText(output, `falling ${condition}`, `having the ${condition} condition`);
    output = replaceAllText(output, `falls ${condition}`, `has the ${condition} condition`);
  });
  output = replaceAllText(output, "knocked prone", "given the Prone condition");
  output = replaceAllText(output, "knock it prone", "give it the Prone condition");
  return output;
}

function normalizeSaveWording(text, computed) {
  if (!computed) return text;
  let output = String(text || "");
  ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"].forEach(
    (ability) => {
      output = replaceAllText(
        output,
        `${ability} Saving Throw, `,
        `${ability} Saving Throw: DC ${computed.dc}, `
      );
      output = replaceAllText(output, `${ability} save`, `${ability} Saving Throw`);
    }
  );
  output = replaceAllText(
    output,
    "Strength or Dexterity save",
    "Strength or Dexterity Saving Throw"
  );
  return output;
}

function normalizeAttackWording(text, computed) {
  if (!computed) return text;
  let output = String(text || "");
  output = replaceAllText(
    output,
    "Melee Attack Roll. On hit, ",
    `Melee Attack Roll: ${modText(computed.attack)}, reach 5 ft. Hit: `
  );
  output = replaceAllText(
    output,
    "Melee Attack Roll. On hit,",
    `Melee Attack Roll: ${modText(computed.attack)}, reach 5 ft. Hit:`
  );
  output = replaceAllText(
    output,
    "Melee Attack Roll.",
    `Melee Attack Roll: ${modText(computed.attack)}, reach 5 ft. Hit:`
  );
  output = replaceAllText(output, "On a hit, ", "Hit: ");
  output = replaceAllText(output, "On hit, ", "Hit: ");
  output = replaceAllText(
    output,
    "Ranged Attack Roll, range ",
    `Ranged Attack Roll: ${modText(computed.attack)}, range `
  );
  return output;
}

export function normalizeMonsterReferences(text, computed = null) {
  const noun = computed?.rulesContext?.categoryNoun || "monster";
  const substitutions = [
    ["this spirit's", `this ${noun}'s`],
    ["This spirit's", `This ${noun}'s`],
    ["the spirit's", `the ${noun}'s`],
    ["The spirit's", `The ${noun}'s`],
    ["this spirit", `this ${noun}`],
    ["This spirit", `This ${noun}`],
    ["the spirit", `the ${noun}`],
    ["The spirit", `The ${noun}`],
    ["this spider's", `this ${noun}'s`],
    ["This spider's", `This ${noun}'s`],
    ["the spider's", `the ${noun}'s`],
    ["The spider's", `The ${noun}'s`],
    ["this spider", `this ${noun}`],
    ["This spider", `This ${noun}`],
    ["the spider", `the ${noun}`],
    ["The spider", `The ${noun}`],
  ];
  return substitutions.reduce(
    (output, [search, replacement]) => replaceAllText(output, search, replacement),
    String(text || "")
  );
}

export function normalizeRulesText(text, computed = null) {
  return normalizeMonsterReferences(
    normalizeConditionWording(
      normalizeSaveWording(normalizeAttackWording(text, computed), computed)
    ),
    computed
  )
    .split("  ")
    .join(" ")
    .trim();
}

function buildDesignerNotes({ danger, role, computed }) {
  return [
    `Encounter Use. ${danger.label} ${role.label}. ${role.actionNote}`,
    `Target Profile. CR ${computed.targetCr}; ${computed.tacticalRole.label}; ${computed.monsterTier.label}; ${computed.tempoProfile.label}.`,
    `Baseline Check. AC ${computed.ac}/${computed.baseline.ac}; HP ${computed.hp}/${computed.baseline.hp}; Printed DPR ${computed.dpr}/${computed.baseline.dpr}; Effective DPR ${computed.effectiveProfile.effectiveDpr3Round}/${computed.baseline.dpr}; Attack ${modText(computed.attack)}/${modText(computed.baseline.attackBonus)}; DC ${computed.dc}/${computed.baseline.saveDc}.`,
    `Pressure Breakdown. ${computed.pressureProfile.label}: ${formatBreakdownCompact(computed.pressureProfile, PRESSURE_LABELS)}.`,
    `Complexity Breakdown. ${computed.complexityProfile.label}: ${formatBreakdownCompact(computed.complexityProfile, COMPLEXITY_LABELS)}.`,
    `Counterplay Audit. ${computed.counterplayAudit.rating} ${computed.counterplayAudit.score}/100. ${formatCounterplayIssues(computed.counterplayAudit.issues)}`,
    ...computed.warnings.map((warning) => `Warning. ${warning}`),
  ];
}

export function buildExportReadiness({
  computed,
  selected,
  selectedFeatures,
  traits,
  actions,
  weaknessFeatures,
  deathEffects,
  lairActions,
}) {
  const checks = [
    {
      id: "core-anatomy",
      label: "Core Anatomy",
      detail: "Body + Attack + Weakness / Tell",
      ready:
        hasSelectedSlot(selected, "body") &&
        hasSelectedSlot(selected, "attack") &&
        hasSelectedSlot(selected, "weakness"),
      severity: "required",
    },
    {
      id: "main-action",
      label: "Main Action",
      detail: "At least one exported Action",
      ready: actions.length > 0,
      severity: "required",
    },
    {
      id: "weakness-tell",
      label: "Counterplay",
      detail: "Explicit player-facing answer",
      ready:
        weaknessFeatures.length > 0 &&
        ["Strong", "Playable"].includes(computed.counterplayAudit.rating),
      severity: "required",
    },
    {
      id: "pressure",
      label: "Pressure Target",
      detail: `${computed.pressure} / ${computed.budget}`,
      ready: computed.pressure <= computed.budget,
      severity: "review",
    },
    {
      id: "complexity",
      label: "Complexity Target",
      detail: `${computed.complexity} / ${computed.complexityCap}`,
      ready: computed.complexity <= computed.complexityCap,
      severity: "review",
    },
    {
      id: "warnings",
      label: "Warnings",
      detail: computed.warnings.length
        ? `${computed.warnings.length} issue${computed.warnings.length === 1 ? "" : "s"}`
        : "No active warnings",
      ready: computed.warnings.length === 0,
      severity: "review",
    },
    {
      id: "handoff-depth",
      label: "DM Handoff",
      detail:
        deathEffects.length || lairActions.length
          ? "Setpiece beats included"
          : "Core stat block only",
      ready: selectedFeatures.length >= 3,
      severity: "required",
    },
    {
      id: "structured-data",
      label: "Structured JSON",
      detail: `${selectedFeatures.length} graft${selectedFeatures.length === 1 ? "" : "s"} serialized`,
      ready: selectedFeatures.length > 0,
      severity: "required",
    },
  ];
  const blockers = checks.filter((check) => check.severity === "required" && !check.ready);
  const reviews = checks.filter((check) => check.severity === "review" && !check.ready);
  const ready = blockers.length === 0 && reviews.length === 0;
  return {
    checks,
    blockers,
    reviews,
    ready,
    label: blockers.length ? "Blocked" : reviews.length ? "Review Recommended" : "Ready",
    percent: clamp(
      Math.round((checks.filter((check) => check.ready).length / Math.max(1, checks.length)) * 100),
      0,
      100
    ),
  };
}

export function buildExportRunSheet({
  computed,
  selectedFeatures,
  traits,
  actions,
  bonusActions,
  reactions,
  deathEffects,
  lairActions,
}) {
  const topPressureFeature = getTopFeatureByWeight(selectedFeatures, getFeaturePressureWeight);
  const topComplexityFeature = getTopFeatureByWeight(selectedFeatures, getFeatureComplexityWeight);
  const weakness = selectedFeatures.find((feature) => feature.slot === "weakness");
  const movement = selectedFeatures.find((feature) => feature.slot === "movement");
  const horror = selectedFeatures.find((feature) => feature.slot === "horror");
  const mainAction = actions[0] || selectedFeatures.find((feature) => feature.slot === "attack");
  const reaction = reactions[0];
  const lair = lairActions[0];
  const death = deathEffects[0];

  return [
    {
      label: "Open With",
      value: horror
        ? horror.title
        : movement
          ? movement.title
          : mainAction
            ? mainAction.title
            : computed.name,
    },
    {
      label: "Default Turn",
      value: mainAction ? mainAction.title : "Use the fallback Strike action",
    },
    {
      label: "Watch Closely",
      value: topPressureFeature ? topPressureFeature.title : "No high-pressure graft yet",
    },
    {
      label: "Table Load",
      value: topComplexityFeature ? topComplexityFeature.title : "Low tracking load",
    },
    {
      label: "Player Answer",
      value: weakness ? weakness.title : "Add a Weakness / Tell before final use",
    },
    { label: "Off-Turn Hook", value: reaction ? reaction.title : lair ? lair.title : "None" },
    { label: "Death Beat", value: death ? death.title : "None" },
    {
      label: "Rules Sections",
      value: `${traits.length} Traits · ${actions.length} Actions · ${bonusActions.length} Bonus · ${reactions.length} Reactions · ${lairActions.length} Lair`,
    },
  ];
}

function buildNormalizedSections({
  traits,
  actions,
  bonusActions,
  reactions,
  legendaryActions,
  lairActions,
  deathEffects,
  computed,
}) {
  return {
    traits: traits.map((item) => ({
      title: item.title,
      text: normalizeRulesText(item.mechanics, computed),
    })),
    actions: actions.map((item) => ({
      title: item.title,
      text: normalizeRulesText(item.mechanics, computed),
    })),
    bonusActions: bonusActions.map((item) => ({
      title: item.title,
      text: normalizeRulesText(item.mechanics, computed),
    })),
    reactions: reactions.map((item) => ({
      title: item.title,
      text: normalizeRulesText(item.mechanics, computed),
    })),
    legendaryActions: legendaryActions.map((item) => ({
      title: item.title,
      text: normalizeRulesText(item.mechanics, computed),
    })),
    lairActions: lairActions.map((item) => ({
      title: item.title,
      text: normalizeRulesText(item.mechanics, computed),
    })),
    deathEffects: deathEffects.map((item) => ({
      title: item.title,
      text: normalizeRulesText(item.mechanics, computed),
    })),
  };
}

function buildStructuredFeature(feature, computed = null) {
  const compatibility = getFeatureCompatibility(feature);
  const mechanicProfile = getFeatureMechanicProfile(feature);
  const counterplayProfile = getFeatureCounterplayProfile(feature);
  return {
    schemaVersion: FEATURE_SCHEMA_VERSION,
    id: feature.id,
    title: feature.title,
    source: feature.source,
    slot: feature.slot,
    section: getFeatureSection(feature),
    typeBias: asArray(feature.typeBias),
    roleBias: asArray(feature.roleBias),
    cost: feature.cost,
    complexity: feature.complexity,
    stats: feature.stats || {},
    summary: feature.summary,
    rulesText: {
      mechanics: feature.mechanics,
      normalizedMechanics: normalizeRulesText(feature.mechanics, computed),
      counterplay: feature.counterplay,
      normalizedCounterplay: normalizeRulesText(feature.counterplay, computed),
    },
    tags: uniqueArray([
      ...asArray(feature.tags),
      ...mechanicProfile.mechanicTags,
      ...mechanicProfile.pressureTags,
      ...mechanicProfile.complexityTags,
      ...compatibility.grants,
    ]),
    compatibility,
    mechanicProfile,
    counterplayProfile,
    migration: {
      stage: DATA_MODEL_MIGRATION_STAGE,
      hasInlineCompatibility: Boolean(
        feature.grants ||
        feature.requires ||
        feature.softRequires ||
        feature.incompatibleWith ||
        feature.avoidWith
      ),
      hasInlineMechanics: Boolean(
        feature.mechanicTags ||
        feature.pressureTags ||
        feature.complexityTags ||
        feature.damageProfile ||
        feature.usageProfile ||
        feature.conditionProfile
      ),
      usesCompatibilityOverride: hasFeatureCompatibilityOverride(feature),
      usesMechanicOverride: hasFeatureMechanicOverride(feature),
    },
  };
}

function getStructuredFeatureCatalog(features = FEATURES) {
  return features.map((feature) => buildStructuredFeature(feature));
}

function getFeatureCatalogStats(features = FEATURES) {
  const structured = getStructuredFeatureCatalog(features);
  return {
    schemaVersion: FEATURE_SCHEMA_VERSION,
    total: structured.length,
    bySource: countValues(structured.map((feature) => feature.source)),
    bySlot: countValues(structured.map((feature) => feature.slot)),
    bySection: countValues(structured.map((feature) => feature.section)),
    usingCompatibilityOverrides: structured.filter(
      (feature) => feature.migration.usesCompatibilityOverride
    ).length,
    usingMechanicOverrides: structured.filter((feature) => feature.migration.usesMechanicOverride)
      .length,
    inlineCompatibility: structured.filter((feature) => feature.migration.hasInlineCompatibility)
      .length,
    inlineMechanics: structured.filter((feature) => feature.migration.hasInlineMechanics).length,
  };
}

function getPresetCatalogStats(presets = MONSTER_FAMILY_PRESETS) {
  return {
    total: presets.length,
    bySource: countValues(presets.map((preset) => preset.source)),
    byFamily: countValues(presets.map((preset) => preset.family)),
    averageGrafts: presets.length
      ? Math.round(
          presets.reduce((sum, preset) => sum + getPresetCoverage(preset).graftCount, 0) /
            presets.length
        )
      : 0,
  };
}

export function buildExportText({
  name,
  creatureType,
  category,
  role,
  danger,
  computed,
  abilityProfile,
  traits,
  actions,
  bonusActions,
  reactions,
  legendaryActions,
  lairActions,
  deathEffects,
  hasLegendaryActions,
  xp,
}) {
  const basics = getStatBlockBasics(creatureType, category, role, computed, abilityProfile, xp);
  const fallbackTraits = [
    {
      title: "Unfinished Horror",
      mechanics:
        "Add grafts in the Crucible to generate traits, tells, weaknesses, and horror behavior.",
    },
  ];
  const fallbackActions = [
    {
      title: "Strike",
      mechanics: `Melee Attack Roll: ${modText(computed.attack)}, reach 5 ft. Hit: ${computed.damageText} damage.`,
    },
  ];
  const sections = [
    name,
    basics.creatureLine,
    "",
    `AC ${computed.ac}  Initiative ${modText(basics.initiative)} (${basics.initiativeTotal})`,
    `HP ${computed.hp} (${hpFormula(computed.hp, role.id === "boss" ? 10 : 8)})`,
    `Speed ${creatureType.defaults.speed}`,
    "",
    abilityExportLines(abilityProfile),
    "",
    `Skills ${basics.skills}`,
    `Resistances ${basics.resistances}`,
    `Immunities ${basics.immunities}`,
    `Senses ${creatureType.defaults.senses}`,
    `Languages ${basics.languages}`,
    `CR ${computed.targetCr} (Estimated ${computed.estimatedCr}; XP ${basics.xp}; PB ${modText(computed.prof)})`,
    "",
    "Traits",
    exportItems(traits, fallbackTraits, computed),
    "",
    "Actions",
    exportItems(actions, fallbackActions, computed),
  ];

  if (bonusActions.length)
    sections.push("", "Bonus Actions", exportItems(bonusActions, [], computed));
  if (reactions.length) sections.push("", "Reactions", exportItems(reactions, [], computed));
  if (deathEffects.length)
    sections.push("", "Death Effects", exportItems(deathEffects, [], computed));
  if (lairActions.length) sections.push("", "Lair Actions", exportItems(lairActions, [], computed));
  if (legendaryActions.length)
    sections.push("", "Legendary Actions", exportItems(legendaryActions, [], computed));
  else if (hasLegendaryActions)
    sections.push(
      "",
      "Legendary Actions",
      "Legendary Action Uses: 3. Immediately after another creature’s turn, the monster can expend a use to move, attack, or trigger one selected horror graft. It regains all expended uses at the start of each of its turns.",
      "Press the Horror. The monster uses one non-lair graft that has not already been used this round."
    );
  sections.push("", "Designer Notes", ...buildDesignerNotes({ danger, role, computed }));

  return sections.join("\n");
}

function buildStatBlockItems(items, computed) {
  return items.map((item) => ({
    id: item.id || item.title,
    title: item.title,
    text: normalizeRulesText(item.mechanics, computed),
  }));
}

export function buildRenderableStatBlock({
  name,
  creatureType,
  category,
  role,
  danger,
  computed,
  abilityProfile,
  traits,
  actions,
  bonusActions,
  reactions,
  legendaryActions,
  lairActions,
  deathEffects,
  selectedFeatures,
  hasLegendaryActions,
  xp,
}) {
  const basics = getStatBlockBasics(creatureType, category, role, computed, abilityProfile, xp);
  const fallbackTraits = [
    {
      id: "unfinished-horror",
      title: "Unfinished Horror",
      mechanics:
        "Add grafts in the Crucible to generate traits, tells, weaknesses, and horror behavior.",
    },
  ];
  const fallbackActions = [
    {
      id: "fallback-strike",
      title: "Strike",
      mechanics: `Melee Attack Roll: ${modText(computed.attack)}, reach 5 ft. Hit: ${computed.damageText} damage.`,
    },
  ];
  const traitItems = traits.filter((item) => item.slot !== "weakness");
  const weaknessItems = selectedFeatures.filter((item) => item.slot === "weakness");
  const legendaryFallback =
    hasLegendaryActions && !legendaryActions.length
      ? [
          {
            id: "legendary-action-uses",
            title: "Legendary Action Uses",
            mechanics:
              "3. Immediately after another creature’s turn, the monster can expend a use to move, attack, or trigger one selected horror graft. It regains all expended uses at the start of each of its turns.",
          },
          {
            id: "press-the-horror",
            title: "Press the Horror",
            mechanics:
              "The monster uses one non-lair graft that has not already been used this round.",
          },
        ]
      : [];

  return {
    name,
    creatureLine: basics.creatureLine,
    coreStats: [
      { label: "AC", value: computed.ac },
      {
        label: "HP",
        value: `${computed.hp} (${hpFormula(computed.hp, role.id === "boss" ? 10 : 8)})`,
      },
      { label: "Speed", value: creatureType.defaults.speed },
      { label: "Initiative", value: `${modText(basics.initiative)} (${basics.initiativeTotal})` },
      { label: "CR", value: `${computed.targetCr} (${basics.xp} XP)` },
      { label: "PB", value: modText(computed.prof) },
    ],
    abilities: [...abilityProfile.physical, ...abilityProfile.mental],
    defenses: [
      { label: "Skills", value: basics.skills },
      { label: "Resistances", value: basics.resistances },
      { label: "Immunities", value: basics.immunities },
      { label: "Senses", value: creatureType.defaults.senses },
      { label: "Languages", value: basics.languages },
    ],
    sections: [
      {
        id: "traits",
        title: "Traits",
        items: buildStatBlockItems(traitItems.length ? traitItems : fallbackTraits, computed),
      },
      {
        id: "weaknesses",
        title: "Weakness / Tell",
        items: buildStatBlockItems(weaknessItems, computed),
        highlight: true,
      },
      {
        id: "actions",
        title: "Actions",
        items: buildStatBlockItems(actions.length ? actions : fallbackActions, computed),
      },
      {
        id: "bonus-actions",
        title: "Bonus Actions",
        items: buildStatBlockItems(bonusActions, computed),
      },
      { id: "reactions", title: "Reactions", items: buildStatBlockItems(reactions, computed) },
      {
        id: "death-effects",
        title: "Death Effects",
        items: buildStatBlockItems(deathEffects, computed),
      },
      {
        id: "lair-actions",
        title: "Lair Actions",
        items: buildStatBlockItems(lairActions, computed),
      },
      {
        id: "legendary-actions",
        title: "Legendary Actions",
        items: buildStatBlockItems(
          legendaryActions.length ? legendaryActions : legendaryFallback,
          computed
        ),
      },
    ],
    designerNotes: buildDesignerNotes({ danger, role, computed }),
  };
}

export function buildExportJson({
  name,
  creatureType,
  category,
  role,
  danger,
  source,
  computed,
  abilityProfile,
  traits,
  actions,
  bonusActions,
  reactions,
  legendaryActions,
  lairActions,
  deathEffects,
  selectedFeatures,
  activePreset,
  xp,
}) {
  const basics = getStatBlockBasics(creatureType, category, role, computed, abilityProfile, xp);
  const normalizedSections = buildNormalizedSections({
    traits,
    actions,
    bonusActions,
    reactions,
    legendaryActions,
    lairActions,
    deathEffects,
    computed,
  });
  return JSON.stringify(
    {
      exportMeta: {
        schemaVersion: EXPORT_SCHEMA_VERSION,
        featureSchemaVersion: FEATURE_SCHEMA_VERSION,
        migrationStage: DATA_MODEL_MIGRATION_STAGE,
        statBlockStyle: "D&D 2024-inspired",
        normalization: "rules-text-normalized-v1",
        activePreset: activePreset
          ? {
              id: activePreset.id,
              label: activePreset.label,
              family: activePreset.family,
              source: activePreset.source,
            }
          : null,
      },
      name,
      frame: {
        creatureType: creatureType.label,
        category,
        targetCr: computed.targetCr,
        encounterRole: role.label,
        tacticalRole: computed.tacticalRole.label,
        tier: computed.monsterTier.label,
        tempoProfile: computed.tempoProfile.label,
        danger: danger.label,
        source: source.label,
        size: basics.size,
        alignment: "Unaligned",
      },
      combat: {
        ac: computed.ac,
        hp: computed.hp,
        dpr: computed.dpr,
        attackBonus: modText(computed.attack),
        dc: computed.dc,
        initiative: modText(basics.initiative),
        speed: creatureType.defaults.speed,
        targetCr: computed.targetCr,
        estimatedCr: computed.estimatedCr,
        xp,
        proficiencyBonus: modText(computed.prof),
      },
      printedStats: computed.printedStats,
      effectiveProfile: computed.effectiveProfile,
      profileDeltas: computed.profileDeltas,
      pressureProfile: computed.pressureProfile,
      complexityProfile: computed.complexityProfile,
      counterplayAudit: computed.counterplayAudit,
      counterplayProfiles: computed.counterplayProfiles,
      featureMechanics: computed.featureMechanics,
      mechanicsSummary: computed.mechanicsSummary,
      abilities: {
        physical: abilityProfile.physical,
        mental: abilityProfile.mental,
      },
      defenses: {
        skills: basics.skills,
        resistances: basics.resistances,
        immunities: basics.immunities,
        senses: creatureType.defaults.senses,
        languages: basics.languages,
      },
      sections: normalizedSections,
      balance: {
        pressure: computed.pressure,
        budget: computed.budget,
        complexity: computed.complexity,
        complexityCap: computed.complexityCap,
        warnings: computed.warnings,
        baseline: computed.baseline,
        printedStats: computed.printedStats,
        effectiveProfile: computed.effectiveProfile,
        profileDeltas: computed.profileDeltas,
        pressureProfile: computed.pressureProfile,
        complexityProfile: computed.complexityProfile,
        counterplayAudit: computed.counterplayAudit,
        counterplayProfiles: computed.counterplayProfiles,
        featureMechanics: computed.featureMechanics,
        mechanicsSummary: computed.mechanicsSummary,
        baselinePower: computed.baselinePower,
        effectivePower: computed.effectivePower,
      },
      catalog: {
        features: getFeatureCatalogStats(FEATURES),
        presets: getPresetCatalogStats(MONSTER_FAMILY_PRESETS),
      },
      grafts: selectedFeatures.map((feature) => buildStructuredFeature(feature, computed)),
    },
    null,
    2
  );
}
