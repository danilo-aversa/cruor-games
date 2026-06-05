import { FEATURE_COMPATIBILITY_OVERRIDES } from "../data/monster-grafts.js";
import { asArray, getSelectedIdsForSlot, hasSelectedSlot, uniqueArray } from "./monster-composer.selection.js";

function defaultTitleCase(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function hasFeatureCompatibilityOverride(featureOrId) {
  const id = typeof featureOrId === "string" ? featureOrId : featureOrId?.id;
  return Boolean(id && FEATURE_COMPATIBILITY_OVERRIDES[id]);
}

export function getFeatureCompatibility(feature) {
  const override = FEATURE_COMPATIBILITY_OVERRIDES[feature.id] || {};
  return {
    grants: uniqueArray([...asArray(feature.grants), ...asArray(override.grants)]),
    requires: uniqueArray([...asArray(feature.requires), ...asArray(override.requires)]),
    softRequires: uniqueArray([
      ...asArray(feature.softRequires),
      ...asArray(override.softRequires),
    ]),
    incompatibleWith: uniqueArray([
      ...asArray(feature.incompatibleWith),
      ...asArray(override.incompatibleWith),
    ]),
    avoidWith: uniqueArray([...asArray(feature.avoidWith), ...asArray(override.avoidWith)]),
  };
}

export function formatToken(token) {
  return String(token || "")
    .replace(/^type:/, "")
    .replace(/^category:/, "")
    .replace(/[_.-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getBaseTokens(typeId, category) {
  const normalizedCategory = String(category || "")
    .toLowerCase()
    .trim()
    .split(" ")
    .filter(Boolean)
    .join("_");
  const tokens = [`type:${typeId}`, `${typeId}_body`];

  if (typeId === "undead") tokens.push("undead_body", "corpse_body", "corpse_presence");
  if (typeId === "beast") tokens.push("beast_body");
  if (typeId === "aberration") tokens.push("aberration_body");
  if (normalizedCategory) tokens.push(`category:${normalizedCategory}`);
  if (normalizedCategory.includes("spider"))
    tokens.push("spider_body", "climber", "web_maker", "web_terrain");
  if (normalizedCategory.includes("wraith")) tokens.push("spirit_body");
  if (normalizedCategory.includes("flesh_mass")) tokens.push("corpse_body", "bloated_body");

  return uniqueArray(tokens);
}

export function getGrantedTokens(features, typeId, category) {
  return uniqueArray([
    ...getBaseTokens(typeId, category),
    ...features.flatMap((feature) => getFeatureCompatibility(feature).grants),
  ]);
}

export function tokenOverlap(left, right) {
  const rightSet = new Set(right);
  return left.filter((token) => rightSet.has(token));
}

export function getCompatibilityStatus(
  feature,
  selectedFeatures = [],
  typeId = "undead",
  category = "Zombie"
) {
  const compatibility = getFeatureCompatibility(feature);
  const grantedTokens = getGrantedTokens(selectedFeatures, typeId, category);
  const selectedBlocks = uniqueArray(
    selectedFeatures.flatMap((item) => getFeatureCompatibility(item).incompatibleWith)
  );
  const missingRequires = compatibility.requires.filter((token) => !grantedTokens.includes(token));
  const blockingTokens = tokenOverlap(compatibility.incompatibleWith, grantedTokens);
  const blockedBySelected = tokenOverlap(selectedBlocks, compatibility.grants);
  const missingSoftRequires = compatibility.softRequires.filter(
    (token) => !grantedTokens.includes(token)
  );
  const avoidTokens = tokenOverlap(compatibility.avoidWith, grantedTokens);

  if (blockingTokens.length || blockedBySelected.length) {
    const tokens = uniqueArray([...blockingTokens, ...blockedBySelected]);
    return {
      kind: "incompatible",
      label: "Incompatible",
      tokens,
      message: `Incompatible with ${tokens.map(formatToken).join(", ")}.`,
    };
  }

  if (missingRequires.length) {
    return {
      kind: "missing",
      label: "Missing Requirement",
      tokens: missingRequires,
      message: `Requires ${missingRequires.map(formatToken).join(", ")}.`,
    };
  }

  if (missingSoftRequires.length) {
    return {
      kind: "soft",
      label: "Soft Warning",
      tokens: missingSoftRequires,
      message: `Works best with ${missingSoftRequires.map(formatToken).join(", ")}.`,
    };
  }

  if (avoidTokens.length) {
    return {
      kind: "avoid",
      label: "Needs Justification",
      tokens: avoidTokens,
      message: `Avoid with ${avoidTokens.map(formatToken).join(", ")} unless this is intentional.`,
    };
  }

  return {
    kind: "compatible",
    label: "Compatible",
    tokens: [],
    message: "All requirements satisfied.",
  };
}

export function getComposerMode(advancedMode, customMode) {
  if (customMode) return "custom";
  if (advancedMode) return "advanced";
  return "guided";
}

export function canShowFeatureForMode(status, mode) {
  if (mode === "custom") return true;
  if (mode === "advanced") return status.kind !== "incompatible";
  return status.kind !== "missing" && status.kind !== "incompatible";
}

export function getCompatibilityRank(status) {
  const rank = { compatible: 0, soft: 1, avoid: 2, missing: 3, incompatible: 4 };
  return rank[status.kind] ?? 5;
}

export function buildFeatureDecisionProfile(feature, context = {}) {
  const status = context.status || {
    kind: "compatible",
    label: "Compatible",
    message: "All requirements satisfied.",
  };
  const selected = context.selected || {};
  const selectedFeatures = context.selectedFeatures || [];
  const typeId = context.typeId || "undead";
  const category = context.category || "Zombie";
  const roleId = context.roleId || "standard";
  const tacticalRoleId = context.tacticalRoleId || "brute";
  const currentSlot = context.currentSlot || "all";
  const getFeatureSection = context.getFeatureSection || ((item) => item.section || "trait");
  const getFeatureMechanicProfile =
    context.getFeatureMechanicProfile || (() => ({ complexityTags: [] }));
  const getFeatureCounterplayProfile = context.getFeatureCounterplayProfile || (() => ({}));
  const titleCase = context.titleCase || defaultTitleCase;
  const section = getFeatureSection(feature);
  const mechanicProfile = getFeatureMechanicProfile(feature);
  const counterplayProfile = getFeatureCounterplayProfile(feature);
  const compatibility = getFeatureCompatibility(feature);
  const grantedTokens = getGrantedTokens(selectedFeatures, typeId, category);
  const synergyTokens = uniqueArray(
    [...compatibility.requires, ...compatibility.softRequires].filter((token) =>
      grantedTokens.includes(token)
    )
  );
  const complexityTags = mechanicProfile.complexityTags || [];
  const currentSlotMatch = currentSlot !== "all" && feature.slot === currentSlot;
  const slotEmpty = !hasSelectedSlot(selected, feature.slot);
  const simple =
    feature.complexity <= 1 &&
    Math.max(0, feature.cost) <= 3 &&
    !complexityTags.some((tag) =>
      [
        "reaction_trigger",
        "ongoing_tracking",
        "summon_tracking",
        "round_tracking",
        "delayed_tracking",
      ].includes(tag)
    );
  const highPressure =
    feature.cost >= 5 ||
    (feature.stats?.dpr || 0) >= 6 ||
    (feature.stats?.control || 0) >= 3 ||
    counterplayProfile.burst ||
    counterplayProfile.hardControl;
  const needsTell =
    highPressure && !hasSelectedSlot(selected, "weakness") && feature.slot !== "weakness";
  const bossOnly =
    (asArray(feature.roleBias).length > 0 &&
      asArray(feature.roleBias).every((role) => role === "boss")) ||
    section === "lairAction" ||
    section === "legendaryAction";
  const risky =
    ["soft", "avoid", "missing", "incompatible"].includes(status.kind) ||
    needsTell ||
    (highPressure && feature.complexity >= 3);
  const blocked = ["missing", "incompatible"].includes(status.kind);
  const recommended =
    !blocked &&
    !risky &&
    !context.selectedInSlot &&
    (currentSlotMatch || (currentSlot === "all" && slotEmpty)) &&
    (simple || synergyTokens.length > 0 || Math.max(0, feature.cost) <= 4 || roleId === "boss");

  const bestForParts = [];
  if (feature.slot === "body") bestForParts.push("Foundation");
  if (feature.slot === "weakness") bestForParts.push("Counterplay");
  if (["death", "lair", "twist"].includes(feature.slot)) bestForParts.push("Setpiece");
  if ((feature.stats?.control || 0) >= 2) bestForParts.push("Controller");
  if ((feature.stats?.mobility || 0) >= 2)
    bestForParts.push(tacticalRoleId === "lurker" ? "Lurker" : "Skirmisher");
  if ((feature.stats?.dpr || 0) >= 5)
    bestForParts.push(tacticalRoleId === "artillery" ? "Artillery" : "Damage");
  if (asArray(feature.roleBias).includes("boss")) bestForParts.push("Boss");
  if (!bestForParts.length) bestForParts.push(titleCase(feature.slot));

  const badges = uniqueArray([
    recommended ? "Recommended" : null,
    simple ? "Simple" : null,
    highPressure ? "High Pressure" : null,
    needsTell ? "Needs Tell" : null,
    bossOnly ? "Boss Only" : null,
    synergyTokens.length ? "Synergy" : null,
    risky && !blocked ? "Risky" : null,
    blocked ? "Blocked" : null,
  ]);

  let riskLabel = "Low";
  if (blocked) riskLabel = status.label;
  else if (needsTell) riskLabel = "Needs Tell";
  else if (["soft", "avoid"].includes(status.kind)) riskLabel = status.label;
  else if (counterplayProfile.hardControl) riskLabel = "Hard Control";
  else if (highPressure) riskLabel = "High Pressure";
  else if (complexityTags.length >= 3) riskLabel = "Tracking";

  const tier = blocked
    ? "blocked"
    : risky
      ? "risky"
      : recommended
        ? "recommended"
        : simple
          ? "simple"
          : "standard";
  const rank =
    (recommended ? 0 : simple ? 10 : risky ? 35 : 20) +
    getCompatibilityRank(status) * 10 +
    Math.max(0, feature.cost) +
    feature.complexity * 1.5 -
    synergyTokens.length * 4 -
    (currentSlotMatch ? 6 : 0);

  return {
    tier,
    rank,
    recommended,
    simple,
    highPressure,
    needsTell,
    bossOnly,
    risky,
    blocked,
    badges,
    bestFor: uniqueArray(bestForParts).slice(0, 2).join(" / "),
    riskLabel,
    synergyTokens,
  };
}

export function getFeatureDecisionRank(profile) {
  return Number(profile?.rank ?? 99);
}

export function formatFeatureImpact(feature) {
  const pressure = feature.cost > 0 ? `+${feature.cost}` : String(feature.cost);
  return `Pressure ${pressure} · Complexity ${feature.complexity}`;
}

export function getFeatureSpiceScore(feature, profile, helpers = {}) {
  const getFeatureSection = helpers.getFeatureSection || ((item) => item.section || "trait");
  const getFeatureCounterplayProfile = helpers.getFeatureCounterplayProfile || (() => ({}));
  const section = getFeatureSection(feature);
  const counterplayProfile = getFeatureCounterplayProfile(feature);
  const setpieceWeight =
    ["horror", "twist", "death", "lair"].includes(feature.slot) ||
    ["reaction", "death", "lairAction", "legendaryAction"].includes(section)
      ? 8
      : 0;
  return (
    Math.max(0, feature.cost) * 2 +
    feature.complexity * 2 +
    Math.max(0, feature.stats?.dpr || 0) +
    Math.max(0, feature.stats?.control || 0) * 2 +
    setpieceWeight +
    (profile?.highPressure ? 5 : 0) +
    (counterplayProfile.burst ? 4 : 0) +
    (counterplayProfile.hardControl ? 4 : 0) -
    (profile?.blocked ? 100 : 0)
  );
}

export function getFeatureSafetyScore(feature, profile, helpers = {}) {
  const getFeatureMechanicProfile = helpers.getFeatureMechanicProfile || (() => ({ complexityTags: [] }));
  const getFeatureCounterplayProfile = helpers.getFeatureCounterplayProfile || (() => ({}));
  const mechanicProfile = getFeatureMechanicProfile(feature);
  const counterplayProfile = getFeatureCounterplayProfile(feature);
  const trackingPenalty =
    mechanicProfile.complexityTags.filter((tag) =>
      [
        "reaction_trigger",
        "ongoing_tracking",
        "summon_tracking",
        "round_tracking",
        "delayed_tracking",
        "object_tracking",
      ].includes(tag)
    ).length * 4;
  return (
    60 -
    Math.max(0, feature.cost) * 4 -
    feature.complexity * 6 -
    trackingPenalty -
    (counterplayProfile.hardControl ? 10 : 0) -
    (counterplayProfile.burst ? 8 : 0) -
    (profile?.risky ? 8 : 0) +
    Math.max(0, feature.stats?.fairness || 0) * 7 +
    (feature.slot === "weakness" ? 12 : 0) +
    (profile?.simple ? 8 : 0)
  );
}

export function buildSmartSlotPicks({
  slotId,
  candidates,
  selected,
  selectedFeatures,
  typeId,
  category,
  roleId,
  tacticalRoleId,
  monsterTierId,
  getFeatureDecisionProfile: buildDecisionProfile = buildFeatureDecisionProfile,
  getFeatureSafetyScore: buildSafetyScore = getFeatureSafetyScore,
  getFeatureSpiceScore: buildSpiceScore = getFeatureSpiceScore,
}) {
  if (!slotId || slotId === "all") return [];
  const slotCandidates = candidates
    .filter(
      (feature) =>
        feature.slot === slotId &&
        !getSelectedIdsForSlot(selected, feature.slot).includes(feature.id)
    )
    .map((feature) => {
      const status = getCompatibilityStatus(feature, selectedFeatures, typeId, category);
      const profile = buildDecisionProfile(feature, {
        status,
        selected,
        selectedFeatures,
        typeId,
        category,
        roleId,
        tacticalRoleId,
        monsterTierId,
        currentSlot: slotId,
      });
      return { feature, status, profile };
    })
    .filter((item) => !item.profile.blocked);

  const used = new Set();
  const take = (id, label, reason, items) => {
    const item = items.find((candidate) => !used.has(candidate.feature.id));
    if (!item) return null;
    used.add(item.feature.id);
    return { id, label, reason, feature: item.feature, profile: item.profile, status: item.status };
  };

  const recommended = take(
    "recommended",
    "Recommended",
    "Best fit for the current frame.",
    [...slotCandidates].sort(
      (a, b) =>
        getFeatureDecisionRank(a.profile) - getFeatureDecisionRank(b.profile) ||
        a.feature.title.localeCompare(b.feature.title)
    )
  );

  const safe = take(
    "safe",
    "Safe",
    "Low tracking and easy to run.",
    [...slotCandidates]
      .filter(
        ({ feature, profile }) =>
          feature.complexity <= 2 && Math.max(0, feature.cost) <= 4 && !profile.blocked
      )
      .sort(
        (a, b) =>
          buildSafetyScore(b.feature, b.profile) -
            buildSafetyScore(a.feature, a.profile) ||
          getFeatureDecisionRank(a.profile) - getFeatureDecisionRank(b.profile)
      )
  );

  const spicy = take(
    "spicy",
    "Spicy",
    "More memorable, heavier at the table.",
    [...slotCandidates]
      .filter(({ profile }) => !profile.blocked)
      .sort(
        (a, b) =>
          buildSpiceScore(b.feature, b.profile) - buildSpiceScore(a.feature, a.profile) ||
          b.feature.cost - a.feature.cost
      )
  );

  return [recommended, safe, spicy].filter(Boolean);
}

export function buildFeatureImpactPreview({
  feature,
  selected,
  selectedFeatures,
  typeId,
  category,
  computed,
  getFeatureMechanicProfile,
  summarizeMechanicProfiles,
  buildPressureProfile,
  buildComplexityProfile,
  getFeatureCounterplayProfile,
}) {
  const alreadySelected = getSelectedIdsForSlot(selected, feature.slot).includes(feature.id);
  if (alreadySelected) {
    return {
      pressureDelta: 0,
      complexityDelta: 0,
      hpDelta: 0,
      acDelta: 0,
      dprDelta: 0,
      counterplay: "Installed",
      warningsAdded: 0,
      warningsCleared: 0,
    };
  }

  const nextFeatures = [...selectedFeatures, feature];
  const statMods = nextFeatures.reduce(
    (acc, item) => {
      Object.entries(item.stats || {}).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value;
      });
      return acc;
    },
    { hp: 0, dpr: 0, ac: 0, control: 0, mobility: 0, fairness: 0 }
  );
  const featureMechanics = nextFeatures.map((item) => ({
    id: item.id,
    title: item.title,
    ...getFeatureMechanicProfile(item),
  }));
  const mechanicsSummary = summarizeMechanicProfiles(featureMechanics);
  const cost = nextFeatures.reduce((sum, item) => sum + item.cost, 0);
  const rawComplexity = nextFeatures.reduce((sum, item) => sum + item.complexity, 0);
  const nextPressureProfile = buildPressureProfile({
    cost,
    monsterTier: computed.monsterTier,
    tempoProfile: computed.tempoProfile,
    statMods,
    mechanicsSummary,
    budget: computed.budget,
  });
  const nextComplexityProfile = buildComplexityProfile({
    complexity: rawComplexity,
    mechanicsSummary,
    featureMechanics,
    limit: computed.complexityCap,
  });
  const compatibility = getCompatibilityStatus(feature, selectedFeatures, typeId, category);
  const counterplayProfile = getFeatureCounterplayProfile(feature);
  const currentHasWeakness = hasSelectedSlot(selected, "weakness");
  const clearsWeaknessWarning = feature.slot === "weakness" && !currentHasWeakness ? 1 : 0;
  const pressureCrossesLimit =
    computed.pressure <= computed.budget && nextPressureProfile.score > computed.budget ? 1 : 0;
  const complexityCrossesLimit =
    computed.complexity <= computed.complexityCap &&
    nextComplexityProfile.score > computed.complexityCap
      ? 1
      : 0;
  const compatibilityWarning = ["missing", "incompatible"].includes(compatibility.kind) ? 1 : 0;
  const highPressureNeedsTell =
    !currentHasWeakness &&
    feature.slot !== "weakness" &&
    (feature.cost >= 5 || counterplayProfile.hardControl || counterplayProfile.burst)
      ? 1
      : 0;

  let counterplay = "Neutral";
  if (
    feature.slot === "weakness" ||
    counterplayProfile.hasNonDamageAnswer ||
    counterplayProfile.hasBreakCondition
  )
    counterplay = "Improves";
  if (counterplayProfile.hardControl || counterplayProfile.burst)
    counterplay = currentHasWeakness ? "Needs Tell" : "Worsens";

  return {
    pressureDelta: nextPressureProfile.score - computed.pressure,
    complexityDelta: nextComplexityProfile.score - computed.complexity,
    hpDelta: feature.stats?.hp || 0,
    acDelta: feature.stats?.ac || 0,
    dprDelta: feature.stats?.dpr || 0,
    counterplay,
    warningsAdded:
      pressureCrossesLimit + complexityCrossesLimit + compatibilityWarning + highPressureNeedsTell,
    warningsCleared: clearsWeaknessWarning,
  };
}

function signedDelta(value) {
  return value > 0 ? `+${value}` : String(value);
}

export function formatFeatureImpactPreview(impact) {
  const parts = [
    `Pressure ${signedDelta(impact.pressureDelta)}`,
    `Complexity ${signedDelta(impact.complexityDelta)}`,
  ];
  if (impact.dprDelta) parts.push(`DPR ${signedDelta(impact.dprDelta)}`);
  if (impact.hpDelta) parts.push(`HP ${signedDelta(impact.hpDelta)}`);
  if (impact.acDelta) parts.push(`AC ${signedDelta(impact.acDelta)}`);
  if (impact.counterplay && impact.counterplay !== "Neutral")
    parts.push(`Counterplay ${impact.counterplay}`);
  if (impact.warningsCleared) parts.push(`Clears ${impact.warningsCleared}`);
  if (impact.warningsAdded)
    parts.push(`Adds ${impact.warningsAdded} warning${impact.warningsAdded === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

export function buildCompatibilityWarning(feature, status) {
  if (!status || status.kind === "compatible") return null;
  return `Compatibility: ${feature.title} — ${status.message}`;
}
