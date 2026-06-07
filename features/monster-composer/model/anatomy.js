import { BASE_SILHOUETTE_ANCHORS, MONSTER_SILHOUETTES } from "../data/monster-silhouettes.js";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeToken(value) {
  return slugify(value).replace(/-/g, "_");
}

function normalizeKebab(value) {
  return slugify(value);
}

function uniqueArray(values) {
  return [...new Set(asArray(values).map(normalizeToken).filter(Boolean))];
}

function uniqueKebab(values) {
  return [...new Set(asArray(values).map(normalizeKebab).filter(Boolean))];
}

export const MONSTER_BODY_PLAN_OPTIONS = Object.freeze([
  {
    id: "humanoid",
    label: "Humanoid",
    summary: "Two arms, two legs, torso, head, and usually hands.",
  },
  {
    id: "quadruped",
    label: "Quadruped",
    summary: "Four-legged animal body without manipulative hands.",
  },
  {
    id: "arachnid",
    label: "Arachnid",
    summary: "Spider-like body with many legs, fangs, carapace, and optional web organs.",
  },
  {
    id: "avian",
    label: "Avian",
    summary: "Winged bird-like body with beak, talons, and flight anatomy.",
  },
  {
    id: "incorporeal",
    label: "Incorporeal",
    summary: "Spectral body without ordinary flesh, bones, organs, or limbs.",
  },
  {
    id: "amorphous",
    label: "Amorphous",
    summary: "Mass, ooze, swarm, or flesh pile without a stable limb plan.",
  },
  {
    id: "ocular",
    label: "Ocular",
    summary: "Eye-dominant horror anatomy built around sight organs and gaze pressure.",
  },
  {
    id: "parasite",
    label: "Parasite",
    summary: "Small attaching, burrowing, or host-dependent body plan.",
  },
]);

export const MONSTER_FAMILY_PROFILE_OPTIONS = Object.freeze([
  {
    id: "zombie",
    label: "Zombie",
    typeId: "undead",
    categories: ["Zombie"],
    bodyPlans: ["humanoid"],
    anatomy: [
      "head",
      "face",
      "torso",
      "arms",
      "hands",
      "legs",
      "feet",
      "jaw",
      "mouth",
      "flesh",
      "blood",
      "corpse",
      "organs",
      "grasping_limbs",
      "slam_capable",
    ],
    tags: [
      "corpse",
      "rotting",
      "undead",
      "physical",
      "organic",
      "biped",
      "humanoid",
      "can_grab",
      "can_be_bloated",
    ],
  },
  {
    id: "skeleton",
    label: "Skeleton",
    typeId: "undead",
    categories: ["Skeleton"],
    bodyPlans: ["humanoid"],
    anatomy: ["skull", "bones", "ribcage", "arms", "hands", "legs", "jaw", "weapon_hands"],
    tags: ["undead", "physical", "biped", "humanoid", "no_flesh", "no_blood", "bone_body"],
  },
  {
    id: "spirit",
    label: "Spirit",
    typeId: "undead",
    categories: ["Spirit", "Wraith", "Ghost"],
    bodyPlans: ["incorporeal", "humanoid"],
    anatomy: ["spectral_body", "touch", "voice", "face", "mouth", "jaw", "aura"],
    tags: ["undead", "spirit", "incorporeal", "floating", "no_flesh", "no_bones", "no_organs"],
  },
  {
    id: "spider",
    label: "Spider",
    typeId: "beast",
    categories: ["Spider"],
    bodyPlans: ["arachnid"],
    anatomy: [
      "fangs",
      "jaw",
      "legs",
      "many_legs",
      "climbing_limbs",
      "web_glands",
      "spinnerets",
      "abdomen",
      "venom_glands",
      "carapace",
      "multiple_eyes",
    ],
    tags: [
      "beast",
      "animal",
      "physical",
      "crawler",
      "eight_legged",
      "venomous",
      "web_bearing",
      "climber",
      "no_hands",
      "no_arms",
    ],
  },
  {
    id: "wolf",
    label: "Wolf",
    typeId: "beast",
    categories: ["Wolf"],
    bodyPlans: ["quadruped"],
    anatomy: ["head", "muzzle", "jaw", "fangs", "legs", "paws", "fur", "claws"],
    tags: ["beast", "animal", "physical", "quadruped", "pack_hunter", "no_hands", "no_arms"],
  },
  {
    id: "bird",
    label: "Bird",
    typeId: "beast",
    categories: ["Bird"],
    bodyPlans: ["avian"],
    anatomy: ["head", "beak", "wings", "talons", "feathers", "legs"],
    tags: ["beast", "animal", "physical", "flying", "no_hands", "no_arms"],
  },
  {
    id: "flesh-mass",
    label: "Flesh Mass",
    typeId: "aberration",
    categories: ["Flesh Mass"],
    bodyPlans: ["amorphous"],
    anatomy: ["flesh", "blood", "organs", "many_mouths", "tendrils", "mass"],
    tags: ["aberration", "physical", "organic", "amorphous", "corpse", "no_stable_limbs"],
  },
  {
    id: "eye-horror",
    label: "Eye Horror",
    typeId: "aberration",
    categories: ["Eye Horror"],
    bodyPlans: ["ocular", "amorphous"],
    anatomy: ["eyes", "central_eye", "gaze", "flesh", "tendrils"],
    tags: ["aberration", "physical", "ocular", "gaze_creature"],
  },
  {
    id: "parasite",
    label: "Parasite",
    typeId: "aberration",
    categories: ["Parasite"],
    bodyPlans: ["parasite"],
    anatomy: ["mandibles", "clinging_limbs", "burrowing_parts", "stinger"],
    tags: ["aberration", "physical", "parasite", "host_dependent", "small_body"],
  },
  {
    id: "psychic-predator",
    label: "Psychic Predator",
    typeId: "aberration",
    categories: ["Psychic Predator"],
    bodyPlans: ["humanoid", "amorphous"],
    anatomy: ["head", "brain", "eyes", "hands", "psychic_organs"],
    tags: ["aberration", "physical", "psychic", "predator"],
  },
]);

const BODY_PLAN_IDS = new Set(MONSTER_BODY_PLAN_OPTIONS.map((item) => item.id));
const FAMILY_PROFILE_BY_ID = new Map(MONSTER_FAMILY_PROFILE_OPTIONS.map((item) => [item.id, item]));
const FAMILY_PROFILE_BY_CATEGORY = new Map(
  MONSTER_FAMILY_PROFILE_OPTIONS.flatMap((profile) =>
    asArray(profile.categories).map((category) => [normalizeKebab(category), profile]),
  ),
);

export const KNOWN_MONSTER_BODY_PLAN_IDS = Object.freeze([...BODY_PLAN_IDS]);
export const KNOWN_MONSTER_FAMILY_IDS = Object.freeze(MONSTER_FAMILY_PROFILE_OPTIONS.map((item) => item.id));
export const KNOWN_MONSTER_ANATOMY_TAGS = Object.freeze(
  [...new Set(MONSTER_FAMILY_PROFILE_OPTIONS.flatMap((item) => uniqueArray(item.anatomy)))].sort(),
);
export const KNOWN_MONSTER_CREATURE_TAGS = Object.freeze(
  [...new Set(MONSTER_FAMILY_PROFILE_OPTIONS.flatMap((item) => uniqueArray(item.tags)))].sort(),
);

export const MONSTER_ANATOMY_CONSTRAINT_FIELDS = Object.freeze([
  "allowedCreatureTypes",
  "forbiddenCreatureTypes",
  "exclusiveToFamilies",
  "allowedFamilies",
  "forbiddenFamilies",
  "allowedBodyPlans",
  "forbiddenBodyPlans",
  "requiredAnatomy",
  "requiresAnyAnatomy",
  "forbiddenAnatomy",
  "requiredTags",
  "requiresAnyTags",
  "forbiddenTags",
  "requiredTokens",
  "requiresAnyTokens",
  "forbiddenTokens",
]);

export function getSilhouetteId(typeId, category, activePreset = null) {
  if (activePreset?.silhouetteId) return activePreset.silhouetteId;

  const normalizedCategory = String(category || "").toLowerCase();
  if (normalizedCategory.includes("spider")) return "spider";
  if (normalizedCategory.includes("skeleton") || normalizedCategory.includes("bone")) return "skeleton";

  return typeId;
}

export function getSilhouetteProfile(typeId, category, activePreset = null) {
  const silhouetteId = getSilhouetteId(typeId, category, activePreset);
  return MONSTER_SILHOUETTES[silhouetteId] || MONSTER_SILHOUETTES[typeId] || MONSTER_SILHOUETTES.undead;
}

export function getSilhouetteAnchor(profile, slotId) {
  return profile?.anchors?.[slotId] || BASE_SILHOUETTE_ANCHORS[slotId] || { x: 0.5, y: 0.5 };
}

function getPresetFamilyId(activePreset) {
  return normalizeKebab(activePreset?.family || activePreset?.category || activePreset?.label || "");
}

export function getMonsterAnatomyProfile(typeId = "undead", category = "Zombie", activePreset = null) {
  const presetFamilyId = getPresetFamilyId(activePreset);
  const categoryId = normalizeKebab(category);
  const baseProfile =
    (presetFamilyId && FAMILY_PROFILE_BY_ID.get(presetFamilyId)) ||
    FAMILY_PROFILE_BY_CATEGORY.get(categoryId) ||
    MONSTER_FAMILY_PROFILE_OPTIONS.find((profile) => profile.typeId === typeId) ||
    FAMILY_PROFILE_BY_ID.get("zombie");

  const familyAliases = uniqueKebab([
    baseProfile.id,
    category,
    activePreset?.family,
    activePreset?.id,
    activePreset?.label,
    typeId,
  ]);

  return Object.freeze({
    id: baseProfile.id,
    family: baseProfile.id,
    familyIds: familyAliases,
    label: baseProfile.label,
    typeId,
    category,
    bodyPlans: uniqueKebab(baseProfile.bodyPlans),
    anatomy: uniqueArray(baseProfile.anatomy),
    tags: uniqueArray([...(baseProfile.tags || []), typeId, categoryId]),
  });
}

function normalizeCreatureTypeList(value) {
  return uniqueKebab(value);
}

function normalizeConstraintList(value, mode = "token") {
  if (mode === "kebab") return uniqueKebab(value);
  return uniqueArray(value);
}

export function normalizeMonsterAnatomyConstraints(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const normalized = {
    allowedCreatureTypes: normalizeCreatureTypeList(value.allowedCreatureTypes || value.creatureTypes),
    forbiddenCreatureTypes: normalizeCreatureTypeList(value.forbiddenCreatureTypes),
    exclusiveToFamilies: normalizeConstraintList(value.exclusiveToFamilies || value.requiresFamily, "kebab"),
    allowedFamilies: normalizeConstraintList(value.allowedFamilies || value.families, "kebab"),
    forbiddenFamilies: normalizeConstraintList(value.forbiddenFamilies, "kebab"),
    allowedBodyPlans: normalizeConstraintList(value.allowedBodyPlans || value.bodyPlans, "kebab"),
    forbiddenBodyPlans: normalizeConstraintList(value.forbiddenBodyPlans, "kebab"),
    requiredAnatomy: normalizeConstraintList(value.requiredAnatomy || value.requiresAnatomy),
    requiresAnyAnatomy: normalizeConstraintList(value.requiresAnyAnatomy),
    forbiddenAnatomy: normalizeConstraintList(value.forbiddenAnatomy),
    requiredTags: normalizeConstraintList(value.requiredTags || value.requiresTags),
    requiresAnyTags: normalizeConstraintList(value.requiresAnyTags),
    forbiddenTags: normalizeConstraintList(value.forbiddenTags),
    requiredTokens: normalizeConstraintList(value.requiredTokens || value.requiresTokens),
    requiresAnyTokens: normalizeConstraintList(value.requiresAnyTokens),
    forbiddenTokens: normalizeConstraintList(value.forbiddenTokens),
    note: String(value.note || value.rationale || "").trim(),
  };

  const hasAnyList = MONSTER_ANATOMY_CONSTRAINT_FIELDS.some((field) => normalized[field]?.length);
  return hasAnyList || normalized.note ? normalized : null;
}

export function getFeatureAnatomyConstraints(feature = {}) {
  return normalizeMonsterAnatomyConstraints(
    feature.constraints ||
      feature.anatomyConstraints ||
      feature.monster?.constraints ||
      feature.monster?.anatomyConstraints ||
      null,
  );
}

function includesAny(source = [], wanted = []) {
  const sourceSet = new Set(source);
  return wanted.some((token) => sourceSet.has(token));
}

function missingEvery(source = [], wanted = []) {
  const sourceSet = new Set(source);
  return wanted.filter((token) => !sourceSet.has(token));
}

function pushIssue(issues, kind, label, message, tokens = []) {
  issues.push({ kind, label, message, tokens });
}

export function evaluateMonsterAnatomyConstraints(
  feature = {},
  {
    typeId = "undead",
    category = "Zombie",
    activePreset = null,
    grantedTokens = [],
  } = {},
) {
  const constraints = getFeatureAnatomyConstraints(feature);
  if (!constraints) {
    return {
      kind: "compatible",
      label: "Compatible",
      tokens: [],
      message: "No anatomy constraints.",
      constraints: null,
      profile: getMonsterAnatomyProfile(typeId, category, activePreset),
      issues: [],
    };
  }

  const profile = getMonsterAnatomyProfile(typeId, category, activePreset);
  const issues = [];
  const normalizedTypeId = normalizeKebab(typeId);
  const grantedTokenSet = uniqueArray(grantedTokens);

  if (
    constraints.allowedCreatureTypes.length &&
    !constraints.allowedCreatureTypes.includes(normalizedTypeId)
  ) {
    pushIssue(
      issues,
      "incompatible",
      "Creature Type Mismatch",
      `Allowed creature types: ${constraints.allowedCreatureTypes.map(formatAnatomyTerm).join(", ")}.`,
      constraints.allowedCreatureTypes,
    );
  }

  if (constraints.forbiddenCreatureTypes.includes(normalizedTypeId)) {
    pushIssue(
      issues,
      "incompatible",
      "Forbidden Creature Type",
      `Forbidden for ${formatAnatomyTerm(normalizedTypeId)} creatures.`,
      [normalizedTypeId],
    );
  }

  const allowedFamilies = uniqueKebab([
    ...constraints.exclusiveToFamilies,
    ...constraints.allowedFamilies,
  ]);
  if (allowedFamilies.length && !includesAny(profile.familyIds, allowedFamilies)) {
    pushIssue(
      issues,
      "incompatible",
      "Family Mismatch",
      `Requires ${allowedFamilies.map(formatAnatomyTerm).join(" or ")}.`,
      allowedFamilies,
    );
  }

  const forbiddenFamilies = profile.familyIds.filter((familyId) =>
    constraints.forbiddenFamilies.includes(familyId),
  );
  if (forbiddenFamilies.length) {
    pushIssue(
      issues,
      "incompatible",
      "Forbidden Family",
      `Forbidden for ${forbiddenFamilies.map(formatAnatomyTerm).join(", ")}.`,
      forbiddenFamilies,
    );
  }

  if (
    constraints.allowedBodyPlans.length &&
    !includesAny(profile.bodyPlans, constraints.allowedBodyPlans)
  ) {
    pushIssue(
      issues,
      "incompatible",
      "Body Plan Mismatch",
      `Requires a ${constraints.allowedBodyPlans.map(formatAnatomyTerm).join(" or ")} body plan.`,
      constraints.allowedBodyPlans,
    );
  }

  const forbiddenBodyPlans = profile.bodyPlans.filter((bodyPlan) =>
    constraints.forbiddenBodyPlans.includes(bodyPlan),
  );
  if (forbiddenBodyPlans.length) {
    pushIssue(
      issues,
      "incompatible",
      "Forbidden Body Plan",
      `Forbidden for ${forbiddenBodyPlans.map(formatAnatomyTerm).join(", ")} body plans.`,
      forbiddenBodyPlans,
    );
  }

  const missingAnatomy = missingEvery(profile.anatomy, constraints.requiredAnatomy);
  if (missingAnatomy.length) {
    pushIssue(
      issues,
      "missing",
      "Missing Anatomy",
      `Requires ${missingAnatomy.map(formatAnatomyTerm).join(", ")}.`,
      missingAnatomy,
    );
  }

  if (
    constraints.requiresAnyAnatomy.length &&
    !includesAny(profile.anatomy, constraints.requiresAnyAnatomy)
  ) {
    pushIssue(
      issues,
      "missing",
      "Missing Anatomy",
      `Requires one of ${constraints.requiresAnyAnatomy.map(formatAnatomyTerm).join(", ")}.`,
      constraints.requiresAnyAnatomy,
    );
  }

  const forbiddenAnatomy = profile.anatomy.filter((token) => constraints.forbiddenAnatomy.includes(token));
  if (forbiddenAnatomy.length) {
    pushIssue(
      issues,
      "incompatible",
      "Forbidden Anatomy",
      `Forbidden with ${forbiddenAnatomy.map(formatAnatomyTerm).join(", ")}.`,
      forbiddenAnatomy,
    );
  }

  const missingTags = missingEvery(profile.tags, constraints.requiredTags);
  if (missingTags.length) {
    pushIssue(
      issues,
      "missing",
      "Missing Creature Tag",
      `Requires ${missingTags.map(formatAnatomyTerm).join(", ")}.`,
      missingTags,
    );
  }

  if (constraints.requiresAnyTags.length && !includesAny(profile.tags, constraints.requiresAnyTags)) {
    pushIssue(
      issues,
      "missing",
      "Missing Creature Tag",
      `Requires one of ${constraints.requiresAnyTags.map(formatAnatomyTerm).join(", ")}.`,
      constraints.requiresAnyTags,
    );
  }

  const forbiddenTags = profile.tags.filter((tag) => constraints.forbiddenTags.includes(tag));
  if (forbiddenTags.length) {
    pushIssue(
      issues,
      "incompatible",
      "Forbidden Creature Tag",
      `Forbidden with ${forbiddenTags.map(formatAnatomyTerm).join(", ")}.`,
      forbiddenTags,
    );
  }

  const missingTokens = missingEvery(grantedTokenSet, constraints.requiredTokens);
  if (missingTokens.length) {
    pushIssue(
      issues,
      "missing",
      "Missing Build Token",
      `Requires ${missingTokens.map(formatAnatomyTerm).join(", ")}.`,
      missingTokens,
    );
  }

  if (constraints.requiresAnyTokens.length && !includesAny(grantedTokenSet, constraints.requiresAnyTokens)) {
    pushIssue(
      issues,
      "missing",
      "Missing Build Token",
      `Requires one of ${constraints.requiresAnyTokens.map(formatAnatomyTerm).join(", ")}.`,
      constraints.requiresAnyTokens,
    );
  }

  const forbiddenTokens = grantedTokenSet.filter((token) => constraints.forbiddenTokens.includes(token));
  if (forbiddenTokens.length) {
    pushIssue(
      issues,
      "incompatible",
      "Forbidden Build Token",
      `Forbidden with ${forbiddenTokens.map(formatAnatomyTerm).join(", ")}.`,
      forbiddenTokens,
    );
  }

  const hardIssue = issues.find((issue) => issue.kind === "incompatible") || issues[0];
  if (hardIssue) {
    return {
      ...hardIssue,
      tokens: hardIssue.tokens || [],
      constraints,
      profile,
      issues,
    };
  }

  return {
    kind: "compatible",
    label: "Anatomy Match",
    tokens: [],
    message: constraints.note || `Fits ${profile.label} anatomy.`,
    constraints,
    profile,
    issues,
  };
}

export function formatAnatomyTerm(value) {
  return String(value || "")
    .replace(/^anatomy:/, "")
    .replace(/^tag:/, "")
    .replace(/[_.-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function summarizeMonsterAnatomyConstraints(constraints = null) {
  const normalized = normalizeMonsterAnatomyConstraints(constraints);
  if (!normalized) return [];

  const rows = [];
  const push = (label, values) => {
    if (!values?.length) return;
    rows.push({ label, values: values.map(formatAnatomyTerm) });
  };

  push("Creature Type", normalized.allowedCreatureTypes);
  push("Family", uniqueKebab([...normalized.exclusiveToFamilies, ...normalized.allowedFamilies]));
  push("Not Family", normalized.forbiddenFamilies);
  push("Body Plan", normalized.allowedBodyPlans);
  push("Not Body Plan", normalized.forbiddenBodyPlans);
  push("Requires Anatomy", normalized.requiredAnatomy);
  push("Requires Any Anatomy", normalized.requiresAnyAnatomy);
  push("Forbids Anatomy", normalized.forbiddenAnatomy);
  push("Requires Tags", normalized.requiredTags);
  push("Requires Any Tags", normalized.requiresAnyTags);
  push("Forbids Tags", normalized.forbiddenTags);
  push("Requires Tokens", normalized.requiredTokens);
  push("Requires Any Tokens", normalized.requiresAnyTokens);
  push("Forbids Tokens", normalized.forbiddenTokens);

  if (normalized.note) rows.push({ label: "Note", values: [normalized.note] });
  return rows;
}
