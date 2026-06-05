import {
  getFeatureComplexityWeight,
  getFeatureMechanicProfile,
  getFeaturePressureWeight,
  getFeatureSection,
  getTopFeatureByWeight,
} from "./monster-composer.balance.js";
import { getSectionLabel, normalizeRulesText } from "./monster-composer.export.js";

function titleCase(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function modText(value) {
  return value >= 0 ? `+${value}` : `−${Math.abs(value)}`;
}

function compactRunText(text, computed = null, maxLength = 180) {
  const normalized = normalizeRulesText(text, computed).replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}…`;
}

function getRunFeatureTrigger(feature, computed = null) {
  const section = getFeatureSection(feature);
  const mechanics = normalizeRulesText(feature.mechanics || "", computed);
  const triggerMatch = mechanics.match(/Trigger:\s*([^.]+)\./i);
  const rechargeMatch = mechanics.match(/Recharge\s*([0-9–-]+)/i);

  if (triggerMatch?.[1]) return triggerMatch[1].trim();
  if (rechargeMatch?.[1]) return `Recharge ${rechargeMatch[1]}`;
  if (/bloodied/i.test(mechanics)) return "When bloodied";
  if (/drops to 0 hit points|on death|when it dies/i.test(mechanics)) return "On death";
  if (/initiative count 20/i.test(mechanics) || section === "lairAction")
    return "Initiative count 20";
  if (section === "reaction") return "Reaction trigger";
  if (section === "bonusAction") return "Bonus action";
  if (section === "action") return "Action";
  return getSectionLabel(section);
}

function getRunFeatureResponse(feature, computed = null) {
  const mechanics = normalizeRulesText(feature.mechanics || feature.summary || "", computed);
  const responseMatch = mechanics.match(/Response:\s*(.+)$/i);
  if (responseMatch?.[1]) return compactRunText(responseMatch[1], computed, 170);
  return compactRunText(mechanics, computed, 170);
}

function isRunTriggerFeature(feature) {
  const section = getFeatureSection(feature);
  return (
    ["reaction", "bonusAction", "lairAction", "death"].includes(section) ||
    /recharge|bloodied|drops to 0 hit points|on death|initiative count 20|trigger:/i.test(
      feature.mechanics || ""
    )
  );
}

function uniqueFeatures(features) {
  const seen = new Set();
  return features.filter((feature) => {
    if (!feature || seen.has(feature.id)) return false;
    seen.add(feature.id);
    return true;
  });
}

function buildRunTriggerItems({
  selectedFeatures,
  bonusActions,
  reactions,
  lairActions,
  deathEffects,
  computed,
}) {
  const triggerPool = uniqueFeatures([
    ...reactions,
    ...lairActions,
    ...deathEffects,
    ...bonusActions,
    ...selectedFeatures.filter(isRunTriggerFeature),
  ]);

  return triggerPool
    .map((feature) => ({
      id: feature.id,
      title: feature.title,
      trigger: getRunFeatureTrigger(feature, computed),
      response: getRunFeatureResponse(feature, computed),
      section: getSectionLabel(getFeatureSection(feature)),
      slot: titleCase(feature.slot),
    }))
    .sort((a, b) => {
      const order = {
        "Lair Actions": 0,
        Reactions: 1,
        "Bonus Actions": 2,
        "Death Effects": 3,
        Traits: 4,
        Actions: 5,
      };
      return (order[a.section] ?? 9) - (order[b.section] ?? 9) || a.title.localeCompare(b.title);
    });
}

function buildRunTrackingItems({
  computed,
  selectedFeatures,
  bonusActions,
  reactions,
  lairActions,
  deathEffects,
}) {
  const rechargeItems = uniqueFeatures(
    selectedFeatures.filter((feature) => /recharge/i.test(feature.mechanics || ""))
  );
  const conditionItems = selectedFeatures
    .map((feature) => ({ feature, profile: getFeatureMechanicProfile(feature) }))
    .filter((item) => item.profile.conditionProfile);
  const objectItems = selectedFeatures.filter((feature) => {
    const profile = getFeatureMechanicProfile(feature);
    return (
      profile.mechanicTags.some((tag) =>
        ["destroyable_anchor", "corpse_requirement", "egg_requirement"].includes(tag)
      ) ||
      profile.complexityTags.some((tag) =>
        [
          "object_hp",
          "object_tracking",
          "corpse_anchor",
          "corpse_tracking",
          "terrain_anchor",
          "summon_tracking",
        ].includes(tag)
      )
    );
  });

  const tracking = [
    {
      label: "HP State",
      value: `HP ${computed.hp}; watch bloodied at ${Math.floor(computed.hp / 2)}.`,
    },
    {
      label: "Recharge",
      value: rechargeItems.length
        ? rechargeItems.map((feature) => feature.title).join(", ")
        : "None.",
    },
    {
      label: "Conditions",
      value: conditionItems.length
        ? conditionItems
            .map(
              ({ feature, profile }) => `${feature.title}: ${profile.conditionProfile.condition}`
            )
            .join("; ")
        : "None.",
    },
    {
      label: "Objects / Terrain",
      value: objectItems.length ? objectItems.map((feature) => feature.title).join(", ") : "None.",
    },
    {
      label: "Off-Turn Rules",
      value:
        reactions.length || lairActions.length
          ? `${reactions.length} reaction${reactions.length === 1 ? "" : "s"}; ${lairActions.length} lair action${lairActions.length === 1 ? "" : "s"}.`
          : "None.",
    },
    {
      label: "Death",
      value: deathEffects.length
        ? deathEffects.map((feature) => feature.title).join(", ")
        : "No death trigger.",
    },
  ];

  return tracking.filter((item) => item.value);
}

export function buildRunModeSheet({
  name,
  creatureType,
  category,
  role,
  danger,
  computed,
  selectedFeatures,
  actions,
  bonusActions,
  reactions,
  lairActions,
  deathEffects,
}) {
  const mainAction =
    actions.find((feature) => feature.slot === "attack") ||
    actions[0] ||
    selectedFeatures.find((feature) => feature.slot === "attack");
  const opener =
    actions.find(
      (feature) => getFeatureMechanicProfile(feature).usageProfile?.frequency === "encounter_opener"
    ) ||
    selectedFeatures.find((feature) => feature.slot === "horror") ||
    mainAction;
  const movement = selectedFeatures.find((feature) => feature.slot === "movement");
  const twist = selectedFeatures.find((feature) => feature.slot === "twist");
  const weaknessFeatures = selectedFeatures.filter((feature) => feature.slot === "weakness");
  const death = deathEffects[0];
  const topPressureFeature = getTopFeatureByWeight(selectedFeatures, getFeaturePressureWeight);
  const topComplexityFeature = getTopFeatureByWeight(selectedFeatures, getFeatureComplexityWeight);
  const actionFallback = {
    id: "fallback-strike",
    title: "Strike",
    summary: "Use the baseline attack when no action graft is installed.",
    mechanics: `Melee Attack Roll: ${modText(computed.attack)}, reach 5 ft. Hit: ${computed.damageText} damage.`,
  };
  const defaultAction = mainAction || actionFallback;

  return {
    name,
    frame: `${creatureType.label} (${category}) · CR ${computed.targetCr} · ${role.label} · ${computed.tacticalRole.label} · ${computed.monsterTier.label} · ${danger.label}`,
    quickStats: [
      { label: "AC", value: computed.ac },
      { label: "HP", value: computed.hp },
      { label: "Speed", value: creatureType.defaults.speed },
      { label: "Init", value: modText(computed.printedStats.initiativeMod) },
      { label: "Attack", value: modText(computed.attack) },
      { label: "DC", value: computed.dc },
    ],
    turnLoop: [
      {
        label: "Open",
        value: opener
          ? `${opener.title}. ${compactRunText(opener.summary || opener.mechanics, computed, 150)}`
          : "Reveal the threat and establish its strongest visible tell.",
      },
      {
        label: "Default Turn",
        value: `${defaultAction.title}. ${compactRunText(defaultAction.mechanics || defaultAction.summary, computed, 160)}`,
      },
      {
        label: "Move",
        value: movement
          ? `${movement.title}. ${compactRunText(movement.summary || movement.mechanics, computed, 150)}`
          : "Advance directly, hold a threatening lane, or force the party to reposition.",
      },
      {
        label: "When Pressed",
        value: twist
          ? `${twist.title}. ${compactRunText(twist.summary || twist.mechanics, computed, 150)}`
          : topPressureFeature
            ? `Protect the table from ${topPressureFeature.title}: telegraph before it resolves.`
            : "Use the clearest installed graft, not every rule at once.",
      },
      {
        label: "End Beat",
        value: death
          ? `${death.title}. ${compactRunText(death.summary || death.mechanics, computed, 150)}`
          : "Let the death reveal a clue, consequence, or safe ending.",
      },
    ],
    triggers: buildRunTriggerItems({
      selectedFeatures,
      bonusActions,
      reactions,
      lairActions,
      deathEffects,
      computed,
    }),
    tracking: buildRunTrackingItems({
      computed,
      selectedFeatures,
      bonusActions,
      reactions,
      lairActions,
      deathEffects,
    }),
    playerAnswers: weaknessFeatures.length
      ? weaknessFeatures.map((feature) => ({
          id: feature.id,
          title: feature.title,
          value: compactRunText(
            feature.counterplay || feature.mechanics || feature.summary,
            computed,
            170
          ),
        }))
      : computed.counterplayAudit.recommendations.map((value, index) => ({
          id: `counterplay-${index}`,
          title: "Needed Answer",
          value,
        })),
    watch: [
      topPressureFeature
        ? {
            label: "Pressure",
            value: `${topPressureFeature.title}: ${compactRunText(topPressureFeature.summary || topPressureFeature.mechanics, computed, 150)}`,
          }
        : null,
      topComplexityFeature
        ? {
            label: "Tracking",
            value: `${topComplexityFeature.title}: keep its rule visible while running.`,
          }
        : null,
      computed.warnings[0] ? { label: "Warning", value: computed.warnings[0] } : null,
    ].filter(Boolean),
  };
}
