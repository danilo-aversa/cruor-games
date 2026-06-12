import { BASE_SILHOUETTE_ANCHORS, MONSTER_ANATOMY_DECORATIONS, MONSTER_SILHOUETTES } from "../data/monster-silhouettes.js";

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
const EXTRA_KNOWN_MONSTER_ANATOMY_TAGS = Object.freeze([
  "spinnerets",
  "web_glands",
  "venom_glands",
  "climbing_limbs",
  "tendrils",
  "spectral_body",
  "wax_face",
]);

const EXTRA_KNOWN_MONSTER_CREATURE_TAGS = Object.freeze([
  "web_bearing",
  "spider_infested",
  "web_walker",
  "egg_carrier",
  "brood",
  "wax_body",
  "wax_mask",
  "physical_chitin",
  "bone_body",
  "climber",
]);

export const KNOWN_MONSTER_ANATOMY_TAGS = Object.freeze(
  [
    ...new Set([
      ...MONSTER_FAMILY_PROFILE_OPTIONS.flatMap((item) => uniqueArray(item.anatomy)),
      ...EXTRA_KNOWN_MONSTER_ANATOMY_TAGS,
    ]),
  ].sort(),
);
export const KNOWN_MONSTER_CREATURE_TAGS = Object.freeze(
  [
    ...new Set([
      ...MONSTER_FAMILY_PROFILE_OPTIONS.flatMap((item) => uniqueArray(item.tags)),
      ...EXTRA_KNOWN_MONSTER_CREATURE_TAGS,
    ]),
  ].sort(),
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

export const MONSTER_ANATOMY_GRANT_FIELDS = Object.freeze([
  "grantsBodyPlans",
  "grantsAnatomy",
  "grantsTags",
  "grantsTokens",
]);

export function getSilhouetteId(typeId, category, activePreset = null) {
  if (activePreset?.silhouetteId) return activePreset.silhouetteId;

  const categoryId = normalizeKebab(category);

  if (categoryId === "zombie") return "zombie";
  if (categoryId === "skeleton") return "skeleton";
  if (categoryId === "spirit" || categoryId === "ghost" || categoryId === "wraith") return "spirit";
  if (categoryId === "spider") return "spider";

  const familyHints = [
    category,
    activePreset?.family,
    activePreset?.category,
    activePreset?.label,
    typeId,
  ]
    .map((value) => String(value || "").toLowerCase())
    .join(" ");

  if (familyHints.includes("spider")) return "spider";
  if (familyHints.includes("skeleton") || familyHints.includes("bone")) return "skeleton";
  if (
    familyHints.includes("spirit") ||
    familyHints.includes("ghost") ||
    familyHints.includes("wraith")
  ) {
    return "spirit";
  }
  if (
    familyHints.includes("zombie") ||
    familyHints.includes("corpse") ||
    familyHints.includes("bloated") ||
    familyHints.includes("decomposition")
  ) {
    return "zombie";
  }

  return typeId;
}

export function getSilhouetteProfile(typeId, category, activePreset = null) {
  const silhouetteId = getSilhouetteId(typeId, category, activePreset);
  return MONSTER_SILHOUETTES[silhouetteId] || MONSTER_SILHOUETTES[typeId] || MONSTER_SILHOUETTES.undead;
}

export function getSilhouetteDecorations(typeId, category, activePreset = null) {
  const silhouetteId = getSilhouetteId(typeId, category, activePreset);
  return MONSTER_ANATOMY_DECORATIONS[silhouetteId] || MONSTER_ANATOMY_DECORATIONS[typeId] || [];
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

export function normalizeMonsterAnatomyGrants(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const normalized = {
    grantsBodyPlans: normalizeConstraintList(value.grantsBodyPlans || value.bodyPlans, "kebab"),
    grantsAnatomy: normalizeConstraintList(value.grantsAnatomy || value.anatomy),
    grantsTags: normalizeConstraintList(value.grantsTags || value.tags),
    grantsTokens: normalizeConstraintList(value.grantsTokens || value.tokens),
    note: String(value.note || value.rationale || "").trim(),
  };

  const hasAnyList = MONSTER_ANATOMY_GRANT_FIELDS.some((field) => normalized[field]?.length);
  return hasAnyList || normalized.note ? normalized : null;
}

export function getFeatureAnatomyGrants(feature = {}) {
  const monster = feature.monster || {};
  return normalizeMonsterAnatomyGrants(
    feature.anatomyGrants ||
      feature.grantsAnatomy ||
      monster.anatomyGrants ||
      monster.grants ||
      {
        grantsBodyPlans: feature.grantsBodyPlans || monster.grantsBodyPlans,
        grantsAnatomy: feature.grantsAnatomy || monster.grantsAnatomy,
        grantsTags: feature.grantsTags || monster.grantsTags,
        grantsTokens: feature.grantsTokens || monster.grantsTokens,
      },
  );
}

export function getSelectedMonsterAnatomyGrants(features = []) {
  return asArray(features)
    .map((feature) => getFeatureAnatomyGrants(feature))
    .filter(Boolean);
}

export function getEffectiveMonsterAnatomyProfile(
  typeId = "undead",
  category = "Zombie",
  activePreset = null,
  selectedFeatures = [],
) {
  const baseProfile = getMonsterAnatomyProfile(typeId, category, activePreset);
  const grants = getSelectedMonsterAnatomyGrants(selectedFeatures);
  const grantedBodyPlans = grants.flatMap((grant) => grant.grantsBodyPlans || []);
  const grantedAnatomy = grants.flatMap((grant) => grant.grantsAnatomy || []);
  const grantedTags = grants.flatMap((grant) => grant.grantsTags || []);
  const grantedTokens = grants.flatMap((grant) => grant.grantsTokens || []);

  return Object.freeze({
    ...baseProfile,
    bodyPlans: uniqueKebab([...baseProfile.bodyPlans, ...grantedBodyPlans]),
    anatomy: uniqueArray([...baseProfile.anatomy, ...grantedAnatomy]),
    tags: uniqueArray([...baseProfile.tags, ...grantedTags]),
    tokens: uniqueArray(grantedTokens),
    baseProfile,
    grants,
  });
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
    selectedFeatures = [],
    profile: providedProfile = null,
  } = {},
) {
  const constraints = getFeatureAnatomyConstraints(feature);
  const profile =
    providedProfile || getEffectiveMonsterAnatomyProfile(typeId, category, activePreset, selectedFeatures);
  if (!constraints) {
    return {
      kind: "compatible",
      label: "Compatible",
      tokens: [],
      message: "No anatomy constraints.",
      constraints: null,
      profile,
      issues: [],
    };
  }

  const issues = [];
  const normalizedTypeId = normalizeKebab(typeId);
  const grantedTokenSet = uniqueArray([...grantedTokens, ...(profile.tokens || [])]);

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
      "incompatible",
      "Missing Effective Anatomy",
      `Requires effective anatomy: ${missingAnatomy.map(formatAnatomyTerm).join(", ")}. Add a body/mutation graft that grants it first.`,
      missingAnatomy,
    );
  }

  if (
    constraints.requiresAnyAnatomy.length &&
    !includesAny(profile.anatomy, constraints.requiresAnyAnatomy)
  ) {
    pushIssue(
      issues,
      "incompatible",
      "Missing Effective Anatomy",
      `Requires one effective anatomy tag from: ${constraints.requiresAnyAnatomy.map(formatAnatomyTerm).join(", ")}. Add a body/mutation graft that grants it first.`,
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
      "incompatible",
      "Missing Effective Tag",
      `Requires effective creature tag: ${missingTags.map(formatAnatomyTerm).join(", ")}. Add a body/mutation graft that grants it first.`,
      missingTags,
    );
  }

  if (constraints.requiresAnyTags.length && !includesAny(profile.tags, constraints.requiresAnyTags)) {
    pushIssue(
      issues,
      "incompatible",
      "Missing Effective Tag",
      `Requires one effective creature tag from: ${constraints.requiresAnyTags.map(formatAnatomyTerm).join(", ")}. Add a body/mutation graft that grants it first.`,
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

export function summarizeMonsterAnatomyGrants(grants = null) {
  const normalized = normalizeMonsterAnatomyGrants(grants);
  if (!normalized) return [];

  const rows = [];
  const push = (label, values) => {
    if (!values?.length) return;
    rows.push({ label, values: values.map(formatAnatomyTerm) });
  };

  push("Grants Body Plan", normalized.grantsBodyPlans);
  push("Grants Anatomy", normalized.grantsAnatomy);
  push("Grants Tags", normalized.grantsTags);
  push("Grants Tokens", normalized.grantsTokens);
  if (normalized.note) rows.push({ label: "Grant Note", values: [normalized.note] });
  return rows;
}
