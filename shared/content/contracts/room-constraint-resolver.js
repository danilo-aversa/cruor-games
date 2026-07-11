import {
  ROOM_ARCHETYPE_OPTIONS,
  getRoomArchetypeDefinition,
  normalizeRoomArchetypeId,
} from "./room-archetypes.js";
import {
  ROOM_DESIGN_MODIFIER_OPTIONS,
  ROOM_DESIGN_SCHEMA_VERSION,
  ROOM_DESIGN_SHAPE_KIND_OPTIONS,
  compileRoomArchetypeToRoomDesign,
  normalizeRoomDesign,
  normalizeRoomDesignModifier,
  normalizeRoomDesignProp,
  normalizeRoomDesignShapeKind,
} from "./room-design.js";
import { normalizeRoomCapabilityIds } from "./room-capabilities.js";
import {
  ROOM_COMPATIBILITY_STATUSES,
  normalizeRoomCompatibility,
} from "./room-compatibility.js";

export const ROOM_CONSTRAINT_RESOLVER_SCHEMA_VERSION =
  "room-constraint-resolution-v1";
export const ROOM_CONTRIBUTION_SCHEMA_VERSION = "room-contribution-v1";

export const ROOM_SIZE_SCALE_OPTIONS = Object.freeze([
  "Tiny",
  "Small",
  "Medium",
  "Large",
  "Huge",
]);

const ROOM_SIZE_SCALE_INDEX = new Map(
  ROOM_SIZE_SCALE_OPTIONS.map((value, index) => [value.toLowerCase(), index]),
);
const ROOM_SHAPE_INDEX = new Map(
  ROOM_DESIGN_SHAPE_KIND_OPTIONS.map((value, index) => [value, index]),
);
const ROOM_MODIFIER_INDEX = new Map(
  ROOM_DESIGN_MODIFIER_OPTIONS.map((value, index) => [value, index]),
);
const ROOM_ARCHETYPE_INDEX = new Map(
  ROOM_ARCHETYPE_OPTIONS.map((value, index) => [value.id, index]),
);

const SOURCE_PRIORITY = Object.freeze({
  "base-region": 10,
  archetype: 30,
  "derived-archetype": 35,
  "room-template": 40,
  component: 50,
  "assigned-component": 50,
  "candidate-component": 50,
  "manual-override": 60,
});

const HARD_STRENGTHS = new Set(["required", "hard", "forced"]);
const SOFT_STRENGTHS = new Set(["preferred", "soft", "suggested"]);

const MODIFIER_EXCLUSIVE_GROUPS = Object.freeze([
  Object.freeze(["symmetrical", "asymmetrical"]),
]);

const MODIFIER_CAPABILITY_BY_ID = Object.freeze({
  notch: "supports-notch",
  ruined: "supports-ruined",
  "side-alcoves": "supports-side-alcoves",
  "central-void": "supports-central-void",
  "secret-recess": "supports-secret-recess",
  symmetrical: "supports-symmetrical",
  asymmetrical: "supports-asymmetrical",
  "chamfered-corners": "supports-chamfered-corners",
  pillared: "supports-pillars",
  partitioned: "supports-partitioned",
  "collapsed-edge": "supports-collapsed-edge",
});

const CONFLICT_MESSAGES = Object.freeze({
  ROOM_SHAPE_REQUIRED_CONFLICT:
    "The required room shapes do not share a valid solution.",
  ROOM_SHAPE_UNREGISTERED:
    "The requested room shape is not registered by the shared shape contract.",
  ROOM_SHAPE_FORBIDDEN:
    "Every otherwise valid room shape is forbidden by an active constraint.",
  ROOM_SIZE_RANGE_EMPTY:
    "The active room size constraints produce an empty range.",
  ROOM_AREA_RANGE_EMPTY:
    "The active room area constraints produce an empty range.",
  ROOM_MODIFIER_CONFLICT:
    "A structural modifier is both required and forbidden.",
  ROOM_SHAPE_MODIFIER_UNSUPPORTED:
    "The selected room shape does not support one or more active modifiers.",
  ROOM_PROP_CAPACITY_EXCEEDED:
    "The room cannot contain all required props within the declared capacity.",
  ROOM_TOPOLOGY_CONFLICT:
    "The active topology constraints cannot be satisfied together.",
  ROOM_EXCLUSIVE_GROUP_CONFLICT:
    "Multiple assigned components occupy the same exclusive room group.",
  ROOM_REQUIRED_CAPABILITY_MISSING:
    "The room engine does not expose a required capability.",
  ROOM_FORBIDDEN_CAPABILITY_PRESENT:
    "The room engine exposes a capability forbidden by the component.",
  ROOM_REQUIRED_COMPONENT_TAG_MISSING:
    "A component required by the room compatibility rules is missing.",
  ROOM_FORBIDDEN_COMPONENT_TAG_PRESENT:
    "An assigned component has a tag forbidden by the room compatibility rules.",
  ROOM_ARCHETYPE_CONFLICT:
    "The required room archetypes do not share a valid solution.",
  ROOM_MANUAL_OVERRIDE_CONFLICT:
    "The manual room override conflicts with a hard content constraint.",
});

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function unique(values = []) {
  const list = Array.isArray(values) ? values : [values];
  return [
    ...new Set(
      list.filter(
        (value) => value !== null && value !== undefined && value !== "",
      ),
    ),
  ];
}

function normalizeToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSourceType(value = "component") {
  const normalized = normalizeToken(value);
  return normalized || "component";
}

function normalizeStrength(value = "", fallback = "soft") {
  const normalized = normalizeToken(value);
  if (HARD_STRENGTHS.has(normalized)) return "hard";
  if (SOFT_STRENGTHS.has(normalized)) return "soft";
  return fallback === "hard" ? "hard" : "soft";
}

function normalizeWeight(value, fallback = 1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function normalizeInteger(
  value,
  fallback = null,
  min = -Infinity,
  max = Infinity,
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function normalizeNumber(
  value,
  fallback = null,
  min = -Infinity,
  max = Infinity,
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function normalizeScale(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  const index = ROOM_SIZE_SCALE_INDEX.get(normalized);
  return Number.isInteger(index) ? ROOM_SIZE_SCALE_OPTIONS[index] : "";
}

function normalizeShapeConstraintId(value = "") {
  return normalizeRoomDesignShapeKind(value) || normalizeToken(value);
}

function normalizeShapeList(values = []) {
  return unique(
    asArray(values).map(normalizeShapeConstraintId).filter(Boolean),
  ).sort(compareShapeIds);
}

function getRegisteredShapeValues(values = []) {
  return asArray(values).filter((value) => ROOM_SHAPE_INDEX.has(value));
}

function normalizeModifierList(values = []) {
  return unique(
    asArray(values).map(normalizeRoomDesignModifier).filter(Boolean),
  ).sort(compareModifierIds);
}

function normalizeArchetypeList(values = []) {
  return unique(
    asArray(values).map(normalizeRoomArchetypeId).filter(Boolean),
  ).sort(compareArchetypeIds);
}

function normalizeTagList(values = []) {
  return unique(asArray(values).map(normalizeToken).filter(Boolean)).sort();
}

function compareShapeIds(a, b) {
  return (
    (ROOM_SHAPE_INDEX.get(a) ?? Number.MAX_SAFE_INTEGER) -
      (ROOM_SHAPE_INDEX.get(b) ?? Number.MAX_SAFE_INTEGER) ||
    String(a).localeCompare(String(b))
  );
}

function compareModifierIds(a, b) {
  return (
    (ROOM_MODIFIER_INDEX.get(a) ?? Number.MAX_SAFE_INTEGER) -
      (ROOM_MODIFIER_INDEX.get(b) ?? Number.MAX_SAFE_INTEGER) ||
    String(a).localeCompare(String(b))
  );
}

function compareArchetypeIds(a, b) {
  return (
    (ROOM_ARCHETYPE_INDEX.get(a) ?? Number.MAX_SAFE_INTEGER) -
      (ROOM_ARCHETYPE_INDEX.get(b) ?? Number.MAX_SAFE_INTEGER) ||
    String(a).localeCompare(String(b))
  );
}

function compareContributions(a, b) {
  return (
    b.priority - a.priority ||
    a.sourceType.localeCompare(b.sourceType) ||
    a.sourceId.localeCompare(b.sourceId)
  );
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableValue(value[key])]),
  );
}

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function getNestedRoomDesign(source = {}) {
  if (!isPlainObject(source)) return null;
  return (
    source.roomDesign ||
    source.location?.roomDesign ||
    source.locationRegion?.roomDesign ||
    source.map?.roomDesign ||
    source.metadata?.roomDesign ||
    source.requestMetadata?.roomDesign ||
    (source.shape || source.size || source.props || source.topology
      ? source
      : null)
  );
}

function getNestedRoomCompatibility(source = {}) {
  if (!isPlainObject(source)) return null;
  return (
    source.roomCompatibility ||
    source.location?.roomCompatibility ||
    source.locationRegion?.roomCompatibility ||
    source.map?.roomCompatibility ||
    source.metadata?.roomCompatibility ||
    source.requestMetadata?.roomCompatibility ||
    null
  );
}

function getNestedMapInfluence(source = {}) {
  if (!isPlainObject(source)) return null;
  return (
    source.mapInfluence ||
    source.location?.mapInfluence ||
    source.locationRegion?.mapInfluence ||
    source.map?.mapInfluence ||
    source.metadata?.mapInfluence ||
    source.requestMetadata?.mapInfluence ||
    null
  );
}

function getSourceTags(source = {}) {
  if (!isPlainObject(source)) return [];
  return normalizeTagList([
    ...asArray(source.tags),
    ...asArray(source.componentTags),
    ...asArray(source.location?.tags),
    ...asArray(source.locationRegion?.tags),
    ...asArray(source.metadata?.tags),
  ]);
}

function getSourceId(source = {}, sourceType = "component", fallbackIndex = 0) {
  if (typeof source === "string") {
    return `${sourceType}:${normalizeToken(source) || fallbackIndex}`;
  }
  const explicit = String(
    source?.sourceId ||
      source?.id ||
      source?.componentId ||
      source?.regionId ||
      source?.templateId ||
      source?.roomDesign?.source ||
      source?.source ||
      "",
  ).trim();
  return explicit || `${sourceType}:${fallbackIndex}`;
}

function getSourceLabel(source = {}, fallback = "") {
  if (!isPlainObject(source)) return fallback;
  return String(source.title || source.name || source.label || fallback).trim();
}

function getDefaultStrength(sourceType) {
  return [
    "archetype",
    "derived-archetype",
    "room-template",
    "component",
    "assigned-component",
    "candidate-component",
  ].includes(sourceType)
    ? "hard"
    : "soft";
}

function getRawShapeRules(
  roomDesign = {},
  normalizedDesign = null,
  strength = "soft",
) {
  const rawShapeValue =
    roomDesign?.shape ||
    roomDesign?.shapeKind ||
    roomDesign?.kind ||
    roomDesign?.preferredShape ||
    "";
  const rawShape = isPlainObject(rawShapeValue)
    ? rawShapeValue
    : { kind: rawShapeValue };
  const legacyKind =
    normalizedDesign?.shape?.kind ||
    normalizeShapeConstraintId(
      rawShape.kind || rawShape.type || rawShape.shape || rawShape.value || "",
    );
  const required = normalizeShapeList([
    roomDesign.requiredShape,
    ...asArray(roomDesign.requiredShapes),
    rawShape.required,
    ...asArray(rawShape.requiredShapes),
  ]);
  const allowed = normalizeShapeList([
    ...asArray(roomDesign.allowedShapes),
    ...asArray(rawShape.allowed),
    ...asArray(rawShape.allowedShapes),
  ]);
  const preferred = normalizeShapeList([
    roomDesign.preferredShape,
    ...asArray(roomDesign.preferredShapes),
    rawShape.preferred,
    ...asArray(rawShape.preferredShapes),
    ...(legacyKind && strength === "soft" ? [legacyKind] : []),
  ]);
  const forbidden = normalizeShapeList([
    ...asArray(roomDesign.forbiddenShapes),
    ...asArray(rawShape.forbidden),
    ...asArray(rawShape.forbiddenShapes),
  ]);

  if (
    legacyKind &&
    strength === "hard" &&
    !required.length &&
    !allowed.length
  ) {
    required.push(legacyKind);
  }

  return { required, allowed, preferred, forbidden };
}

function getRawSizeRules(
  roomDesign = {},
  normalizedDesign = null,
  strength = "soft",
) {
  const rawSize = isPlainObject(roomDesign?.size) ? roomDesign.size : {};
  const normalizedSize = normalizedDesign?.size || {};
  const explicitScale = normalizeScale(
    rawSize.scale || rawSize.size || rawSize.preset || normalizedSize.scale,
  );
  const preferredScale = normalizeScale(
    rawSize.preferredScale || roomDesign.preferredScale,
  );
  let minScale = normalizeScale(rawSize.minScale || roomDesign.minScale);
  let maxScale = normalizeScale(rawSize.maxScale || roomDesign.maxScale);

  if (explicitScale && strength === "hard" && !minScale && !maxScale) {
    minScale = explicitScale;
    maxScale = explicitScale;
  }

  const numeric = {
    minDiameterCells: normalizeInteger(
      rawSize.minDiameterCells ?? normalizedSize.minDiameterCells,
      null,
      1,
      40,
    ),
    minWidthCells: normalizeInteger(
      rawSize.minWidthCells ?? rawSize.minWidth ?? normalizedSize.minWidthCells,
      null,
      1,
      40,
    ),
    minHeightCells: normalizeInteger(
      rawSize.minHeightCells ??
        rawSize.minHeight ??
        normalizedSize.minHeightCells,
      null,
      1,
      40,
    ),
    maxWidthCells: normalizeInteger(
      rawSize.maxWidthCells ?? rawSize.maxWidth ?? normalizedSize.maxWidthCells,
      null,
      1,
      40,
    ),
    maxHeightCells: normalizeInteger(
      rawSize.maxHeightCells ??
        rawSize.maxHeight ??
        normalizedSize.maxHeightCells,
      null,
      1,
      40,
    ),
    minAreaCells: normalizeInteger(
      rawSize.minAreaCells ?? rawSize.minArea ?? normalizedSize.minAreaCells,
      null,
      1,
      400,
    ),
    maxAreaCells: normalizeInteger(
      rawSize.maxAreaCells ?? rawSize.maxArea ?? normalizedSize.maxAreaCells,
      null,
      1,
      400,
    ),
  };

  const aspectRatio = normalizeToken(
    rawSize.aspectRatio ||
      rawSize.proportion ||
      normalizedSize.aspectRatio ||
      "",
  );

  return {
    minScale,
    maxScale,
    preferredScale:
      preferredScale ||
      (explicitScale && strength === "soft" ? explicitScale : ""),
    ...numeric,
    ...(aspectRatio ? { aspectRatio } : {}),
  };
}

function getRawModifierRules(
  roomDesign = {},
  normalizedDesign = null,
  strength = "soft",
) {
  const rawModifiers = roomDesign?.modifiers;
  const modifierObject = isPlainObject(rawModifiers) ? rawModifiers : {};
  const legacyModifiers = unique([
    ...asArray(normalizedDesign?.modifiers),
    ...asArray(normalizedDesign?.shape?.modifiers),
  ]);
  const required = normalizeModifierList([
    ...asArray(modifierObject.required),
    ...asArray(roomDesign.requiredModifiers),
    ...(Array.isArray(rawModifiers) && strength === "hard" ? rawModifiers : []),
    ...(strength === "hard" ? legacyModifiers : []),
  ]);
  const preferred = normalizeModifierList([
    ...asArray(modifierObject.preferred),
    ...asArray(roomDesign.preferredModifiers),
    ...(Array.isArray(rawModifiers) && strength === "soft" ? rawModifiers : []),
    ...(strength === "soft" ? legacyModifiers : []),
  ]);
  const forbidden = normalizeModifierList([
    ...asArray(modifierObject.forbidden),
    ...asArray(roomDesign.forbiddenModifiers),
  ]);
  return { required, preferred, forbidden };
}

function normalizeExtendedRoomProp(value = {}) {
  const normalized = normalizeRoomDesignProp(value);
  if (!normalized) return null;
  const source = isPlainObject(value) ? value : {};
  const count = normalizeInteger(source.count, 1, 1, 24);
  const minClearanceCells = normalizeNumber(
    source.minClearanceCells ?? source.clearanceCells,
    null,
    0,
    12,
  );
  const exclusivePlacementGroup = normalizeToken(
    source.exclusivePlacementGroup || "",
  );
  const orientation = normalizeToken(source.orientation || "");
  return {
    ...normalized,
    ...(count !== 1 ? { count } : {}),
    ...(minClearanceCells !== null ? { minClearanceCells } : {}),
    ...(exclusivePlacementGroup ? { exclusivePlacementGroup } : {}),
    ...(orientation ? { orientation } : {}),
  };
}

function getRawPropRules(roomDesign = {}, normalizedDesign = null) {
  const rawProps = isPlainObject(roomDesign?.props) ? roomDesign.props : {};
  const rawRequired = [
    ...asArray(rawProps.required),
    ...asArray(roomDesign.requiredProps),
  ];
  const rawOptional = [
    ...asArray(rawProps.optional),
    ...asArray(roomDesign.optionalProps),
  ];
  const required = [
    ...(rawRequired.length
      ? rawRequired
      : asArray(normalizedDesign?.props?.required)),
  ]
    .map(normalizeExtendedRoomProp)
    .filter(Boolean);
  const optional = [
    ...(rawOptional.length
      ? rawOptional
      : asArray(normalizedDesign?.props?.optional)),
  ]
    .map(normalizeExtendedRoomProp)
    .filter(Boolean);
  return {
    required: dedupeObjects(required),
    optional: dedupeObjects(optional),
  };
}

function getRawTopologyRules(
  roomDesign = {},
  normalizedDesign = null,
  strength = "soft",
) {
  const raw = isPlainObject(roomDesign?.topology) ? roomDesign.topology : {};
  const normalized = normalizedDesign?.topology || {};
  const connectorRange = isPlainObject(raw.connectorRange)
    ? raw.connectorRange
    : isPlainObject(raw.connectors)
      ? raw.connectors
      : {};
  const secretObject = isPlainObject(raw.secret) ? raw.secret : {};
  const secretValue =
    typeof raw.secret === "boolean"
      ? raw.secret
      : typeof normalized.secret === "boolean"
        ? normalized.secret
        : null;
  const secretRequired =
    typeof secretObject.required === "boolean"
      ? secretObject.required
      : strength === "hard"
        ? secretValue
        : null;
  const secretPreferred =
    typeof secretObject.preferred === "boolean"
      ? secretObject.preferred
      : strength === "soft"
        ? secretValue
        : null;
  const requiredBranchRole = normalizeToken(
    raw.requiredBranchRole || raw.branchRoleRequired || "",
  );
  const preferredBranchRole = normalizeToken(
    raw.preferredBranchRole ||
      raw.branchRole ||
      raw.branchBias ||
      normalized.branchBias ||
      "",
  );
  const requiredDepth = normalizeToken(raw.requiredDepth || "");
  const preferredDepth = normalizeToken(
    raw.preferredDepth || raw.depthBias || normalized.depthBias || "",
  );

  return {
    connectorMin: normalizeInteger(
      connectorRange.min ?? raw.connectorMin,
      null,
      0,
      12,
    ),
    connectorMax: normalizeInteger(
      connectorRange.max ?? raw.connectorMax,
      null,
      0,
      12,
    ),
    connectorPreferred: normalizeInteger(
      connectorRange.preferred ?? raw.preferredConnectors,
      null,
      0,
      12,
    ),
    secretRequired,
    secretPreferred,
    requiredBranchRole,
    preferredBranchRole,
    requiredDepth,
    preferredDepth,
    levelMin: normalizeInteger(raw.level?.min ?? raw.levelMin, null, -20, 20),
    levelMax: normalizeInteger(raw.level?.max ?? raw.levelMax, null, -20, 20),
    levelPreferred: normalizeInteger(
      raw.level?.preferred ?? raw.preferredLevel,
      null,
      -20,
      20,
    ),
  };
}

function getRawProfiles(roomDesign = {}, normalizedDesign = null) {
  const profile = isPlainObject(roomDesign?.profile) ? roomDesign.profile : {};
  return {
    maskProfile: normalizeToken(
      profile.maskProfile ||
        roomDesign.maskProfile ||
        normalizedDesign?.maskProfile,
    ),
    detailProfile: normalizeToken(
      profile.detailProfile ||
        roomDesign.detailProfile ||
        normalizedDesign?.detailProfile,
    ),
    function: normalizeToken(profile.function || roomDesign.function || ""),
  };
}

function getRawArchetypeRules(
  source = {},
  roomDesign = {},
  mapInfluence = null,
  strength = "soft",
) {
  const direct = normalizeArchetypeList([
    roomDesign.presetId,
    source.roomArchetype,
    source.roomArchetypeId,
    source.location?.roomArchetype,
    source.locationRegion?.roomArchetype,
  ]);
  const preferred = normalizeArchetypeList([
    mapInfluence?.preferredRoomArchetype,
    mapInfluence?.preferredRoomArchetypeId,
    ...asArray(mapInfluence?.preferredRoomArchetypes),
    ...asArray(mapInfluence?.preferredRoomArchetypeIds),
  ]);
  const forced = normalizeArchetypeList([
    mapInfluence?.forcedRoomArchetype,
    mapInfluence?.forcedRoomArchetypeId,
  ]);
  const forbidden = normalizeArchetypeList([
    mapInfluence?.forbiddenRoomArchetype,
    mapInfluence?.forbiddenRoomArchetypeId,
    ...asArray(mapInfluence?.forbiddenRoomArchetypes),
    ...asArray(mapInfluence?.forbiddenRoomArchetypeIds),
  ]);
  const mapInfluenceForced = Boolean(
    mapInfluence?.forceRoomArchetype ||
    mapInfluence?.force ||
    mapInfluence?.required ||
    forced.length,
  );

  const required = normalizeArchetypeList([
    ...forced,
    ...(mapInfluenceForced ? preferred : []),
    ...(strength === "hard" ? direct : []),
  ]);
  const soft = normalizeArchetypeList([
    ...(!mapInfluenceForced ? preferred : []),
    ...(strength === "soft" ? direct : []),
  ]);

  return { required, preferred: soft, forbidden };
}

function dedupeObjects(values = []) {
  const seen = new Set();
  return values.filter((value) => {
    const key = stableStringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function contributionHasRules(contribution) {
  return Boolean(
    contribution.shape.required.length ||
    contribution.shape.allowed.length ||
    contribution.shape.preferred.length ||
    contribution.shape.forbidden.length ||
    contribution.archetype.required.length ||
    contribution.archetype.preferred.length ||
    contribution.archetype.forbidden.length ||
    contribution.modifiers.required.length ||
    contribution.modifiers.preferred.length ||
    contribution.modifiers.forbidden.length ||
    contribution.props.required.length ||
    contribution.props.optional.length ||
    contribution.tags.length ||
    contribution.compatibility ||
    Object.values(contribution.size).some(
      (value) => value !== null && value !== "",
    ) ||
    Object.values(contribution.topology).some(
      (value) => value !== null && value !== "",
    ) ||
    Object.values(contribution.profiles).some(Boolean),
  );
}

export function normalizeRoomContribution(source = {}, options = {}) {
  const sourceType = normalizeSourceType(options.sourceType || "component");
  const priority = normalizeInteger(
    options.priority,
    SOURCE_PRIORITY[sourceType] ?? SOURCE_PRIORITY.component,
  );
  const roomDesign =
    typeof source === "string"
      ? compileRoomArchetypeToRoomDesign(source)
      : getNestedRoomDesign(source) || {};
  const rawStrength =
    options.strength ||
    roomDesign?.strength ||
    source?.roomDesignStrength ||
    source?.strength ||
    "";
  const strength = normalizeStrength(
    rawStrength,
    getDefaultStrength(sourceType),
  );
  const normalizedDesign = normalizeRoomDesign(roomDesign);
  const compatibility = normalizeRoomCompatibility(
    options.roomCompatibility || getNestedRoomCompatibility(source),
  );
  const mapInfluence = options.mapInfluence || getNestedMapInfluence(source);
  const sourceId = String(
    options.sourceId || getSourceId(source, sourceType, options.index || 0),
  );
  const label = getSourceLabel(source, sourceId);
  const weight = normalizeWeight(
    options.weight ?? roomDesign?.weight ?? mapInfluence?.weight,
    1,
  );

  const contribution = {
    schemaVersion: ROOM_CONTRIBUTION_SCHEMA_VERSION,
    sourceId,
    sourceType,
    label,
    strength,
    priority,
    weight,
    authoredPath: String(options.authoredPath || roomDesign?.source || ""),
    tags: getSourceTags(source),
    shape: getRawShapeRules(roomDesign, normalizedDesign, strength),
    size: getRawSizeRules(roomDesign, normalizedDesign, strength),
    modifiers: getRawModifierRules(roomDesign, normalizedDesign, strength),
    props: getRawPropRules(roomDesign, normalizedDesign),
    topology: getRawTopologyRules(roomDesign, normalizedDesign, strength),
    profiles: getRawProfiles(roomDesign, normalizedDesign),
    archetype: getRawArchetypeRules(
      isPlainObject(source) ? source : {},
      roomDesign,
      mapInfluence,
      strength,
    ),
    compatibility,
  };

  return contributionHasRules(contribution) ? contribution : null;
}

function collectSourceList(target, value, sourceType, options = {}) {
  asArray(value).forEach((source, index) => {
    const contribution = normalizeRoomContribution(source, {
      sourceType,
      index,
      ...options,
    });
    if (contribution) target.push(contribution);
  });
}

export function collectRoomContributions(input = {}) {
  const contributions = [];
  collectSourceList(contributions, input.baseRegion, "base-region", {
    strength: input.baseRegionStrength || "soft",
  });
  collectSourceList(contributions, input.roomTemplate, "room-template", {
    strength: input.roomTemplateStrength || "hard",
  });
  collectSourceList(
    contributions,
    input.archetypeContribution || input.roomArchetype,
    "archetype",
    { strength: input.archetypeStrength || "hard" },
  );
  collectSourceList(
    contributions,
    input.assignedComponents,
    "assigned-component",
    { strength: input.componentStrength || "hard" },
  );
  collectSourceList(
    contributions,
    input.candidateComponent,
    "candidate-component",
    { strength: input.candidateStrength || "hard" },
  );
  collectSourceList(contributions, input.manualOverrides, "manual-override", {
    strength: "soft",
  });
  collectSourceList(contributions, input.contributions, "component");
  return contributions.sort(compareContributions);
}

function createSourceDescriptor(
  contribution,
  value,
  strength = contribution.strength,
) {
  return {
    sourceId: contribution.sourceId,
    sourceType: contribution.sourceType,
    strength,
    priority: contribution.priority,
    authoredPath: contribution.authoredPath,
    ...(value !== undefined ? { value } : {}),
  };
}

function addProvenance(provenance, field, contribution, value, strength) {
  if (!field || !contribution) return;
  const entries = provenance[field] || [];
  const descriptor = createSourceDescriptor(
    contribution,
    value,
    strength || contribution.strength,
  );
  const key = stableStringify(descriptor);
  if (!entries.some((entry) => stableStringify(entry) === key)) {
    entries.push(descriptor);
    entries.sort(
      (a, b) =>
        b.priority - a.priority ||
        a.sourceType.localeCompare(b.sourceType) ||
        a.sourceId.localeCompare(b.sourceId),
    );
  }
  provenance[field] = entries;
}

function intersectSets(left, right) {
  return new Set([...left].filter((value) => right.has(value)));
}

function createConflict({
  code,
  field,
  contributions = [],
  message = "",
  blocking = true,
  severity = "error",
  details = {},
}) {
  return {
    code,
    field,
    sources: unique(contributions.map((item) => item.sourceId)).sort(),
    message: message || CONFLICT_MESSAGES[code] || code,
    blocking,
    severity,
    ...details,
  };
}

function scoreChoice(scores, value, contribution, multiplier = 1) {
  if (!value) return;
  const current = scores.get(value) || 0;
  scores.set(value, current + contribution.weight * multiplier);
}

function pickHighestScore(values, scores, compareValues) {
  return [...values].sort((a, b) => {
    const scoreDelta = (scores.get(b) || 0) - (scores.get(a) || 0);
    return scoreDelta || compareValues(a, b);
  })[0];
}

function resolveArchetype(contributions, conflicts, warnings, provenance) {
  let allowed = new Set(ROOM_ARCHETYPE_OPTIONS.map((option) => option.id));
  let hasHardRule = false;
  const requiredContributions = [];
  const forbiddenContributions = [];

  contributions.forEach((contribution) => {
    if (contribution.sourceType === "manual-override") return;
    const required = contribution.archetype.required;
    if (required.length) {
      hasHardRule = true;
      requiredContributions.push(contribution);
      allowed = intersectSets(allowed, new Set(required));
    }
    if (contribution.archetype.forbidden.length) {
      forbiddenContributions.push(contribution);
      contribution.archetype.forbidden.forEach((id) => allowed.delete(id));
    }
  });

  if (!allowed.size && requiredContributions.length) {
    conflicts.push(
      createConflict({
        code: "ROOM_ARCHETYPE_CONFLICT",
        field: "presetId",
        contributions: [...requiredContributions, ...forbiddenContributions],
      }),
    );
    return { selected: "", hard: hasHardRule };
  }

  const scores = new Map();
  contributions.forEach((contribution) => {
    contribution.archetype.preferred.forEach((id) =>
      scoreChoice(scores, id, contribution, 10),
    );
    contribution.archetype.required.forEach((id) =>
      scoreChoice(scores, id, contribution, 100),
    );
  });

  const manual = contributions.filter(
    (contribution) => contribution.sourceType === "manual-override",
  );
  manual.forEach((contribution) => {
    const requested = [
      ...contribution.archetype.required,
      ...contribution.archetype.preferred,
    ];
    requested.forEach((id) => {
      if (allowed.has(id)) {
        scoreChoice(scores, id, contribution, 1000);
      } else {
        warnings.push(
          createConflict({
            code: "ROOM_MANUAL_OVERRIDE_CONFLICT",
            field: "presetId",
            contributions: [contribution, ...requiredContributions],
            blocking: false,
            severity: "warning",
            details: { requested: id },
          }),
        );
      }
    });
  });

  if (!requiredContributions.length && !scores.size) {
    return { selected: "", hard: false };
  }

  const candidates = [...allowed];
  const selected = candidates.length
    ? pickHighestScore(candidates, scores, compareArchetypeIds)
    : "";

  if (selected) {
    contributions.forEach((contribution) => {
      if (
        contribution.archetype.required.includes(selected) ||
        contribution.archetype.preferred.includes(selected)
      ) {
        addProvenance(provenance, "presetId", contribution, selected);
      }
    });
  }

  return { selected, hard: hasHardRule };
}

function createDerivedArchetypeContribution(archetypeId, hard = false) {
  if (!archetypeId || !getRoomArchetypeDefinition(archetypeId)) return null;
  return normalizeRoomContribution(
    {
      id: `resolved-archetype:${archetypeId}`,
      title: `Resolved archetype ${archetypeId}`,
      roomDesign: compileRoomArchetypeToRoomDesign(archetypeId),
    },
    {
      sourceType: "derived-archetype",
      sourceId: `room-archetype:${archetypeId}`,
      strength: hard ? "hard" : "soft",
      priority: SOURCE_PRIORITY["derived-archetype"],
    },
  );
}

function validateRegisteredShapeRules(contributions, conflicts) {
  const unknownByShape = new Map();
  contributions.forEach((contribution) => {
    const requested = unique([
      ...contribution.shape.required,
      ...contribution.shape.allowed,
      ...contribution.shape.preferred,
    ]).filter((shape) => !ROOM_SHAPE_INDEX.has(shape));
    requested.forEach((shape) => {
      const sources = unknownByShape.get(shape) || [];
      sources.push(contribution);
      unknownByShape.set(shape, sources);
    });
  });

  unknownByShape.forEach((shapeContributions, shape) => {
    conflicts.push(
      createConflict({
        code: "ROOM_SHAPE_UNREGISTERED",
        field: "shape.kind",
        contributions: shapeContributions,
        details: {
          shape,
          capability: `supports-shape-${shape}`,
          unsupported: true,
        },
      }),
    );
  });
}

function resolveShape(contributions, conflicts, warnings, provenance) {
  let allowed = new Set(ROOM_DESIGN_SHAPE_KIND_OPTIONS);
  const hardContributions = [];
  const forbiddenContributions = [];
  let hadRequiredIntersection = false;

  contributions.forEach((contribution) => {
    if (contribution.sourceType === "manual-override") return;
    const hardSets = [
      getRegisteredShapeValues(contribution.shape.required),
      getRegisteredShapeValues(contribution.shape.allowed),
    ].filter((values) => values.length);
    hardSets.forEach((values) => {
      hadRequiredIntersection = true;
      hardContributions.push(contribution);
      allowed = intersectSets(allowed, new Set(values));
    });
  });

  if (!allowed.size) {
    conflicts.push(
      createConflict({
        code: "ROOM_SHAPE_REQUIRED_CONFLICT",
        field: "shape.kind",
        contributions: hardContributions,
      }),
    );
    return "";
  }

  contributions.forEach((contribution) => {
    if (contribution.sourceType === "manual-override") return;
    if (!contribution.shape.forbidden.length) return;
    forbiddenContributions.push(contribution);
    getRegisteredShapeValues(contribution.shape.forbidden).forEach((shape) =>
      allowed.delete(shape),
    );
  });

  if (!allowed.size) {
    conflicts.push(
      createConflict({
        code: "ROOM_SHAPE_FORBIDDEN",
        field: "shape.kind",
        contributions: [...hardContributions, ...forbiddenContributions],
      }),
    );
    return "";
  }

  const scores = new Map();
  contributions.forEach((contribution) => {
    getRegisteredShapeValues(contribution.shape.preferred).forEach((shape) =>
      scoreChoice(scores, shape, contribution, 10),
    );
    getRegisteredShapeValues(contribution.shape.required).forEach((shape) =>
      scoreChoice(scores, shape, contribution, 100),
    );
    getRegisteredShapeValues(contribution.shape.allowed).forEach((shape) =>
      scoreChoice(scores, shape, contribution, 5),
    );
  });

  contributions
    .filter((contribution) => contribution.sourceType === "manual-override")
    .forEach((contribution) => {
      const requested = getRegisteredShapeValues([
        ...contribution.shape.required,
        ...contribution.shape.allowed,
        ...contribution.shape.preferred,
      ]);
      requested.forEach((shape) => {
        if (allowed.has(shape)) {
          scoreChoice(scores, shape, contribution, 1000);
        } else {
          warnings.push(
            createConflict({
              code: "ROOM_MANUAL_OVERRIDE_CONFLICT",
              field: "shape.kind",
              contributions: [
                contribution,
                ...hardContributions,
                ...forbiddenContributions,
              ],
              blocking: false,
              severity: "warning",
              details: { requested: shape },
            }),
          );
        }
      });
    });

  if (!hadRequiredIntersection && !scores.size) return "";

  const selected = pickHighestScore(allowed, scores, compareShapeIds);
  contributions.forEach((contribution) => {
    if (
      contribution.shape.required.includes(selected) ||
      contribution.shape.allowed.includes(selected) ||
      contribution.shape.preferred.includes(selected)
    ) {
      addProvenance(provenance, "shape.kind", contribution, selected);
    }
  });
  return selected;
}

function resolveNumericRange({
  contributions,
  minField,
  maxField,
  conflictCode,
  outputMinField = minField,
  outputMaxField = maxField,
  provenance,
  conflicts,
  warnings,
}) {
  const hard = contributions.filter(
    (contribution) => contribution.sourceType !== "manual-override",
  );
  const minEntries = hard
    .filter((contribution) => Number.isFinite(contribution.size[minField]))
    .map((contribution) => ({
      value: contribution.size[minField],
      contribution,
    }));
  const maxEntries = hard
    .filter((contribution) => Number.isFinite(contribution.size[maxField]))
    .map((contribution) => ({
      value: contribution.size[maxField],
      contribution,
    }));
  let minValue = minEntries.length
    ? Math.max(...minEntries.map((entry) => entry.value))
    : null;
  let maxValue = maxEntries.length
    ? Math.min(...maxEntries.map((entry) => entry.value))
    : null;

  if (minValue !== null && maxValue !== null && minValue > maxValue) {
    conflicts.push(
      createConflict({
        code: conflictCode,
        field: `size.${outputMinField}`,
        contributions: [
          ...minEntries.map((entry) => entry.contribution),
          ...maxEntries.map((entry) => entry.contribution),
        ],
        details: { min: minValue, max: maxValue },
      }),
    );
  }

  minEntries
    .filter((entry) => entry.value === minValue)
    .forEach((entry) =>
      addProvenance(
        provenance,
        `size.${outputMinField}`,
        entry.contribution,
        minValue,
      ),
    );
  maxEntries
    .filter((entry) => entry.value === maxValue)
    .forEach((entry) =>
      addProvenance(
        provenance,
        `size.${outputMaxField}`,
        entry.contribution,
        maxValue,
      ),
    );

  contributions
    .filter((contribution) => contribution.sourceType === "manual-override")
    .forEach((contribution) => {
      const manualMin = contribution.size[minField];
      const manualMax = contribution.size[maxField];
      if (
        Number.isFinite(manualMin) &&
        maxValue !== null &&
        manualMin > maxValue
      ) {
        warnings.push(
          createConflict({
            code: "ROOM_MANUAL_OVERRIDE_CONFLICT",
            field: `size.${outputMinField}`,
            contributions: [contribution],
            blocking: false,
            severity: "warning",
            details: { requested: manualMin, maximum: maxValue },
          }),
        );
      } else if (Number.isFinite(manualMin)) {
        minValue = Math.max(minValue ?? manualMin, manualMin);
        addProvenance(
          provenance,
          `size.${outputMinField}`,
          contribution,
          minValue,
          "manual",
        );
      }
      if (
        Number.isFinite(manualMax) &&
        minValue !== null &&
        manualMax < minValue
      ) {
        warnings.push(
          createConflict({
            code: "ROOM_MANUAL_OVERRIDE_CONFLICT",
            field: `size.${outputMaxField}`,
            contributions: [contribution],
            blocking: false,
            severity: "warning",
            details: { requested: manualMax, minimum: minValue },
          }),
        );
      } else if (Number.isFinite(manualMax)) {
        maxValue = Math.min(maxValue ?? manualMax, manualMax);
        addProvenance(
          provenance,
          `size.${outputMaxField}`,
          contribution,
          maxValue,
          "manual",
        );
      }
    });

  return { minValue, maxValue };
}

function resolveSize(contributions, conflicts, warnings, provenance) {
  let minScaleIndex = 0;
  let maxScaleIndex = ROOM_SIZE_SCALE_OPTIONS.length - 1;
  let hasScaleRule = false;
  const minScaleContributions = [];
  const maxScaleContributions = [];

  contributions
    .filter((contribution) => contribution.sourceType !== "manual-override")
    .forEach((contribution) => {
      const minScale = normalizeScale(contribution.size.minScale);
      const maxScale = normalizeScale(contribution.size.maxScale);
      if (minScale) {
        hasScaleRule = true;
        minScaleContributions.push(contribution);
        minScaleIndex = Math.max(
          minScaleIndex,
          ROOM_SIZE_SCALE_INDEX.get(minScale.toLowerCase()),
        );
      }
      if (maxScale) {
        hasScaleRule = true;
        maxScaleContributions.push(contribution);
        maxScaleIndex = Math.min(
          maxScaleIndex,
          ROOM_SIZE_SCALE_INDEX.get(maxScale.toLowerCase()),
        );
      }
    });

  if (minScaleIndex > maxScaleIndex) {
    conflicts.push(
      createConflict({
        code: "ROOM_SIZE_RANGE_EMPTY",
        field: "size.scale",
        contributions: [...minScaleContributions, ...maxScaleContributions],
        details: {
          minScale: ROOM_SIZE_SCALE_OPTIONS[minScaleIndex],
          maxScale: ROOM_SIZE_SCALE_OPTIONS[maxScaleIndex],
        },
      }),
    );
  }

  const scaleScores = new Map();
  contributions.forEach((contribution) => {
    const preferred = normalizeScale(contribution.size.preferredScale);
    if (preferred) scoreChoice(scaleScores, preferred, contribution, 10);
    const minScale = normalizeScale(contribution.size.minScale);
    const maxScale = normalizeScale(contribution.size.maxScale);
    if (minScale && minScale === maxScale) {
      scoreChoice(scaleScores, minScale, contribution, 100);
    }
  });

  contributions
    .filter((contribution) => contribution.sourceType === "manual-override")
    .forEach((contribution) => {
      const requested =
        normalizeScale(contribution.size.preferredScale) ||
        normalizeScale(contribution.size.minScale);
      if (!requested) return;
      const requestedIndex = ROOM_SIZE_SCALE_INDEX.get(requested.toLowerCase());
      if (requestedIndex >= minScaleIndex && requestedIndex <= maxScaleIndex) {
        scoreChoice(scaleScores, requested, contribution, 1000);
      } else {
        warnings.push(
          createConflict({
            code: "ROOM_MANUAL_OVERRIDE_CONFLICT",
            field: "size.scale",
            contributions: [
              contribution,
              ...minScaleContributions,
              ...maxScaleContributions,
            ],
            blocking: false,
            severity: "warning",
            details: { requested },
          }),
        );
      }
    });

  const scaleCandidates = ROOM_SIZE_SCALE_OPTIONS.slice(
    Math.min(minScaleIndex, maxScaleIndex),
    Math.max(minScaleIndex, maxScaleIndex) + 1,
  );
  const selectedScale =
    hasScaleRule || scaleScores.size
      ? pickHighestScore(
          scaleCandidates,
          scaleScores,
          (a, b) =>
            ROOM_SIZE_SCALE_INDEX.get(a.toLowerCase()) -
            ROOM_SIZE_SCALE_INDEX.get(b.toLowerCase()),
        )
      : "";

  if (selectedScale) {
    contributions.forEach((contribution) => {
      if (
        contribution.size.preferredScale === selectedScale ||
        contribution.size.minScale === selectedScale ||
        contribution.size.maxScale === selectedScale
      ) {
        addProvenance(provenance, "size.scale", contribution, selectedScale);
      }
    });
  }

  const dimensions = {};
  [
    ["minWidthCells", "maxWidthCells", "ROOM_SIZE_RANGE_EMPTY"],
    ["minHeightCells", "maxHeightCells", "ROOM_SIZE_RANGE_EMPTY"],
    ["minAreaCells", "maxAreaCells", "ROOM_AREA_RANGE_EMPTY"],
  ].forEach(([minField, maxField, conflictCode]) => {
    const { minValue, maxValue } = resolveNumericRange({
      contributions,
      minField,
      maxField,
      conflictCode,
      provenance,
      conflicts,
      warnings,
    });
    if (minValue !== null) dimensions[minField] = minValue;
    if (maxValue !== null) dimensions[maxField] = maxValue;
  });

  const minDiameterEntries = contributions.filter(
    (contribution) =>
      contribution.sourceType !== "manual-override" &&
      Number.isFinite(contribution.size.minDiameterCells),
  );
  if (minDiameterEntries.length) {
    const minDiameterCells = Math.max(
      ...minDiameterEntries.map(
        (contribution) => contribution.size.minDiameterCells,
      ),
    );
    dimensions.minDiameterCells = minDiameterCells;
    minDiameterEntries
      .filter(
        (contribution) =>
          contribution.size.minDiameterCells === minDiameterCells,
      )
      .forEach((contribution) =>
        addProvenance(
          provenance,
          "size.minDiameterCells",
          contribution,
          minDiameterCells,
        ),
      );
  }

  const aspectRatioScores = new Map();
  contributions.forEach((contribution) => {
    if (contribution.size.aspectRatio) {
      scoreChoice(
        aspectRatioScores,
        contribution.size.aspectRatio,
        contribution,
        contribution.strength === "hard" ? 100 : 10,
      );
    }
  });
  const aspectRatio = aspectRatioScores.size
    ? pickHighestScore(aspectRatioScores.keys(), aspectRatioScores, (a, b) =>
        a.localeCompare(b),
      )
    : "";

  return {
    ...(selectedScale ? { scale: selectedScale } : {}),
    ...dimensions,
    ...(aspectRatio ? { aspectRatio } : {}),
  };
}

function resolveModifiers(
  contributions,
  conflicts,
  warnings,
  provenance,
  capabilityModel,
) {
  const required = new Set();
  const forbidden = new Set();
  const requiredSources = new Map();
  const forbiddenSources = new Map();
  const scores = new Map();

  contributions.forEach((contribution) => {
    if (contribution.sourceType !== "manual-override") {
      contribution.modifiers.required.forEach((modifier) => {
        required.add(modifier);
        const list = requiredSources.get(modifier) || [];
        list.push(contribution);
        requiredSources.set(modifier, list);
      });
      contribution.modifiers.forbidden.forEach((modifier) => {
        forbidden.add(modifier);
        const list = forbiddenSources.get(modifier) || [];
        list.push(contribution);
        forbiddenSources.set(modifier, list);
      });
    }
    contribution.modifiers.preferred.forEach((modifier) =>
      scoreChoice(scores, modifier, contribution, 10),
    );
    contribution.modifiers.required.forEach((modifier) =>
      scoreChoice(scores, modifier, contribution, 100),
    );
  });

  [...required]
    .filter((modifier) => forbidden.has(modifier))
    .forEach((modifier) => {
      conflicts.push(
        createConflict({
          code: "ROOM_MODIFIER_CONFLICT",
          field: `modifiers.${modifier}`,
          contributions: [
            ...(requiredSources.get(modifier) || []),
            ...(forbiddenSources.get(modifier) || []),
          ],
          details: { modifier },
        }),
      );
    });

  MODIFIER_EXCLUSIVE_GROUPS.forEach((group) => {
    const requiredInGroup = group.filter((modifier) => required.has(modifier));
    if (requiredInGroup.length > 1) {
      conflicts.push(
        createConflict({
          code: "ROOM_MODIFIER_CONFLICT",
          field: "modifiers",
          contributions: requiredInGroup.flatMap(
            (modifier) => requiredSources.get(modifier) || [],
          ),
          details: { modifiers: requiredInGroup },
        }),
      );
    }
  });

  contributions
    .filter((contribution) => contribution.sourceType === "manual-override")
    .forEach((contribution) => {
      [
        ...contribution.modifiers.required,
        ...contribution.modifiers.preferred,
      ].forEach((modifier) => {
        if (forbidden.has(modifier)) {
          warnings.push(
            createConflict({
              code: "ROOM_MANUAL_OVERRIDE_CONFLICT",
              field: `modifiers.${modifier}`,
              contributions: [
                contribution,
                ...(forbiddenSources.get(modifier) || []),
              ],
              blocking: false,
              severity: "warning",
              details: { requested: modifier },
            }),
          );
        } else {
          scoreChoice(scores, modifier, contribution, 1000);
        }
      });
    });

  const selected = new Set(
    [...required].filter((modifier) => !forbidden.has(modifier)),
  );
  const softCandidates = [...scores.keys()]
    .filter((modifier) => !forbidden.has(modifier))
    .sort((a, b) => {
      const scoreDelta = (scores.get(b) || 0) - (scores.get(a) || 0);
      return scoreDelta || compareModifierIds(a, b);
    });

  softCandidates.forEach((modifier) => {
    const exclusiveGroup = MODIFIER_EXCLUSIVE_GROUPS.find((group) =>
      group.includes(modifier),
    );
    if (
      exclusiveGroup &&
      exclusiveGroup.some((other) => other !== modifier && selected.has(other))
    ) {
      return;
    }
    selected.add(modifier);
  });

  if (capabilityModel.provided) {
    [...selected].forEach((modifier) => {
      const requiredCapability = MODIFIER_CAPABILITY_BY_ID[modifier];
      const modifierSupported =
        !capabilityModel.supportedModifiersProvided ||
        capabilityModel.supportedModifiers.has(modifier);
      const capabilitySupported =
        !requiredCapability ||
        !capabilityModel.idsProvided ||
        capabilityModel.ids.has(requiredCapability);
      if (!modifierSupported || !capabilitySupported) {
        conflicts.push(
          createConflict({
            code: "ROOM_REQUIRED_CAPABILITY_MISSING",
            field: `modifiers.${modifier}`,
            contributions: requiredSources.get(modifier) || [],
            details: {
              modifier,
              capability: requiredCapability || `supports-${modifier}`,
              unsupported: true,
            },
          }),
        );
      }
    });
  }

  const result = [...selected].sort(compareModifierIds);
  result.forEach((modifier) => {
    contributions.forEach((contribution) => {
      if (
        contribution.modifiers.required.includes(modifier) ||
        contribution.modifiers.preferred.includes(modifier)
      ) {
        addProvenance(
          provenance,
          `modifiers.${modifier}`,
          contribution,
          modifier,
        );
      }
    });
  });
  return result;
}

function resolveProps(contributions, conflicts, provenance, capabilityModel) {
  const requiredEntries = [];
  const optionalEntries = [];
  contributions.forEach((contribution) => {
    contribution.props.required.forEach((prop) =>
      requiredEntries.push({ prop, contribution }),
    );
    contribution.props.optional.forEach((prop) =>
      optionalEntries.push({ prop, contribution }),
    );
  });

  const required = dedupeObjects(requiredEntries.map((entry) => entry.prop));
  const requiredKeys = new Set(required.map(stableStringify));
  const optional = dedupeObjects(
    optionalEntries.map((entry) => entry.prop),
  ).filter((prop) => !requiredKeys.has(stableStringify(prop)));

  const requiredCount = required.reduce(
    (sum, prop) => sum + normalizeInteger(prop.count, 1, 1, 24),
    0,
  );
  const centerGroups = new Map();
  required.forEach((prop) => {
    const group = prop.exclusivePlacementGroup;
    if (!group) return;
    centerGroups.set(
      group,
      (centerGroups.get(group) || 0) + normalizeInteger(prop.count, 1, 1, 24),
    );
  });

  if (
    Number.isFinite(capabilityModel.maxRequiredProps) &&
    requiredCount > capabilityModel.maxRequiredProps
  ) {
    conflicts.push(
      createConflict({
        code: "ROOM_PROP_CAPACITY_EXCEEDED",
        field: "props.required",
        contributions: requiredEntries.map((entry) => entry.contribution),
        details: {
          requiredCount,
          capacity: capabilityModel.maxRequiredProps,
        },
      }),
    );
  }

  centerGroups.forEach((count, group) => {
    if (
      Number.isFinite(capabilityModel.maxPropsByExclusiveGroup[group]) &&
      count > capabilityModel.maxPropsByExclusiveGroup[group]
    ) {
      conflicts.push(
        createConflict({
          code: "ROOM_PROP_CAPACITY_EXCEEDED",
          field: "props.required",
          contributions: requiredEntries.map((entry) => entry.contribution),
          details: {
            exclusivePlacementGroup: group,
            requiredCount: count,
            capacity: capabilityModel.maxPropsByExclusiveGroup[group],
          },
        }),
      );
    }
  });

  if (capabilityModel.provided && capabilityModel.supportedPropsProvided) {
    required.forEach((prop) => {
      if (!capabilityModel.supportedProps.has(prop.kind)) {
        conflicts.push(
          createConflict({
            code: "ROOM_REQUIRED_CAPABILITY_MISSING",
            field: "props.required",
            contributions: requiredEntries
              .filter((entry) => entry.prop.kind === prop.kind)
              .map((entry) => entry.contribution),
            details: {
              prop: prop.kind,
              capability: `supports-prop-${prop.kind}`,
              unsupported: true,
            },
          }),
        );
      }
    });
  }

  required.forEach((prop) => {
    requiredEntries
      .filter((entry) => stableStringify(entry.prop) === stableStringify(prop))
      .forEach((entry) =>
        addProvenance(
          provenance,
          `props.required.${stableStringify(prop)}`,
          entry.contribution,
          prop,
        ),
      );
  });

  return {
    ...(required.length ? { required } : {}),
    ...(optional.length ? { optional } : {}),
  };
}

function pickTopologicalToken(
  contributions,
  requiredField,
  preferredField,
  field,
  conflicts,
  provenance,
) {
  const requiredEntries = contributions
    .filter(
      (contribution) =>
        contribution.sourceType !== "manual-override" &&
        contribution.topology[requiredField],
    )
    .map((contribution) => ({
      value: contribution.topology[requiredField],
      contribution,
    }));
  const requiredValues = unique(requiredEntries.map((entry) => entry.value));
  if (requiredValues.length > 1) {
    conflicts.push(
      createConflict({
        code: "ROOM_TOPOLOGY_CONFLICT",
        field,
        contributions: requiredEntries.map((entry) => entry.contribution),
        details: { values: requiredValues.sort() },
      }),
    );
    return "";
  }
  if (requiredValues.length === 1) {
    requiredEntries.forEach((entry) =>
      addProvenance(provenance, field, entry.contribution, entry.value),
    );
    return requiredValues[0];
  }

  const scores = new Map();
  contributions.forEach((contribution) => {
    const preferred = contribution.topology[preferredField];
    if (preferred) scoreChoice(scores, preferred, contribution, 10);
  });
  const selected = scores.size
    ? pickHighestScore(scores.keys(), scores, (a, b) => a.localeCompare(b))
    : "";
  if (selected) {
    contributions
      .filter(
        (contribution) => contribution.topology[preferredField] === selected,
      )
      .forEach((contribution) =>
        addProvenance(provenance, field, contribution, selected, "soft"),
      );
  }
  return selected;
}

function resolveTopology(contributions, conflicts, warnings, provenance) {
  const topology = {};
  const connectorMins = contributions
    .filter(
      (contribution) =>
        contribution.sourceType !== "manual-override" &&
        Number.isFinite(contribution.topology.connectorMin),
    )
    .map((contribution) => ({
      value: contribution.topology.connectorMin,
      contribution,
    }));
  const connectorMaxs = contributions
    .filter(
      (contribution) =>
        contribution.sourceType !== "manual-override" &&
        Number.isFinite(contribution.topology.connectorMax),
    )
    .map((contribution) => ({
      value: contribution.topology.connectorMax,
      contribution,
    }));
  const connectorMin = connectorMins.length
    ? Math.max(...connectorMins.map((entry) => entry.value))
    : null;
  const connectorMax = connectorMaxs.length
    ? Math.min(...connectorMaxs.map((entry) => entry.value))
    : null;
  if (
    connectorMin !== null &&
    connectorMax !== null &&
    connectorMin > connectorMax
  ) {
    conflicts.push(
      createConflict({
        code: "ROOM_TOPOLOGY_CONFLICT",
        field: "topology.connectors",
        contributions: [
          ...connectorMins.map((entry) => entry.contribution),
          ...connectorMaxs.map((entry) => entry.contribution),
        ],
        details: { min: connectorMin, max: connectorMax },
      }),
    );
  }

  const connectorScores = new Map();
  contributions.forEach((contribution) => {
    if (Number.isFinite(contribution.topology.connectorPreferred)) {
      scoreChoice(
        connectorScores,
        contribution.topology.connectorPreferred,
        contribution,
        10,
      );
    }
  });
  const connectorCandidates = [];
  if (connectorMin !== null || connectorMax !== null) {
    const start = connectorMin ?? 0;
    const end = connectorMax ?? 12;
    for (let value = start; value <= end; value += 1)
      connectorCandidates.push(value);
  }
  const connectorPreferred = connectorCandidates.length
    ? pickHighestScore(
        connectorCandidates,
        connectorScores,
        (a, b) => Number(a) - Number(b),
      )
    : connectorScores.size
      ? pickHighestScore(
          connectorScores.keys(),
          connectorScores,
          (a, b) => Number(a) - Number(b),
        )
      : null;
  if (
    connectorMin !== null ||
    connectorMax !== null ||
    connectorPreferred !== null
  ) {
    topology.connectors = {
      ...(connectorMin !== null ? { min: connectorMin } : {}),
      ...(connectorMax !== null ? { max: connectorMax } : {}),
      ...(connectorPreferred !== null ? { preferred: connectorPreferred } : {}),
    };
  }

  const secretRequiredEntries = contributions
    .filter(
      (contribution) =>
        contribution.sourceType !== "manual-override" &&
        typeof contribution.topology.secretRequired === "boolean",
    )
    .map((contribution) => ({
      value: contribution.topology.secretRequired,
      contribution,
    }));
  const secretValues = unique(
    secretRequiredEntries.map((entry) => entry.value),
  );
  if (secretValues.length > 1) {
    conflicts.push(
      createConflict({
        code: "ROOM_TOPOLOGY_CONFLICT",
        field: "topology.secret",
        contributions: secretRequiredEntries.map((entry) => entry.contribution),
        details: { values: secretValues },
      }),
    );
  } else if (secretValues.length === 1) {
    topology.secret = secretValues[0];
    secretRequiredEntries.forEach((entry) =>
      addProvenance(
        provenance,
        "topology.secret",
        entry.contribution,
        entry.value,
      ),
    );
  } else {
    const secretScores = new Map();
    contributions.forEach((contribution) => {
      if (typeof contribution.topology.secretPreferred === "boolean") {
        scoreChoice(
          secretScores,
          String(contribution.topology.secretPreferred),
          contribution,
          10,
        );
      }
    });
    if (secretScores.size) {
      topology.secret =
        pickHighestScore(secretScores.keys(), secretScores, (a, b) =>
          a.localeCompare(b),
        ) === "true";
    }
  }

  const branchRole = pickTopologicalToken(
    contributions,
    "requiredBranchRole",
    "preferredBranchRole",
    "topology.branchBias",
    conflicts,
    provenance,
  );
  if (branchRole) topology.branchBias = branchRole;
  const depth = pickTopologicalToken(
    contributions,
    "requiredDepth",
    "preferredDepth",
    "topology.depthBias",
    conflicts,
    provenance,
  );
  if (depth) topology.depthBias = depth;

  const levelMins = contributions
    .filter(
      (contribution) =>
        contribution.sourceType !== "manual-override" &&
        Number.isFinite(contribution.topology.levelMin),
    )
    .map((contribution) => ({
      value: contribution.topology.levelMin,
      contribution,
    }));
  const levelMaxs = contributions
    .filter(
      (contribution) =>
        contribution.sourceType !== "manual-override" &&
        Number.isFinite(contribution.topology.levelMax),
    )
    .map((contribution) => ({
      value: contribution.topology.levelMax,
      contribution,
    }));
  const levelMin = levelMins.length
    ? Math.max(...levelMins.map((entry) => entry.value))
    : null;
  const levelMax = levelMaxs.length
    ? Math.min(...levelMaxs.map((entry) => entry.value))
    : null;
  if (levelMin !== null && levelMax !== null && levelMin > levelMax) {
    conflicts.push(
      createConflict({
        code: "ROOM_TOPOLOGY_CONFLICT",
        field: "topology.level",
        contributions: [
          ...levelMins.map((entry) => entry.contribution),
          ...levelMaxs.map((entry) => entry.contribution),
        ],
        details: { min: levelMin, max: levelMax },
      }),
    );
  } else if (levelMin !== null || levelMax !== null) {
    topology.level = {
      ...(levelMin !== null ? { min: levelMin } : {}),
      ...(levelMax !== null ? { max: levelMax } : {}),
    };
  }

  contributions
    .filter((contribution) => contribution.sourceType === "manual-override")
    .forEach((contribution) => {
      const requestedSecret = contribution.topology.secretPreferred;
      if (
        typeof requestedSecret === "boolean" &&
        typeof topology.secret === "boolean" &&
        requestedSecret !== topology.secret
      ) {
        warnings.push(
          createConflict({
            code: "ROOM_MANUAL_OVERRIDE_CONFLICT",
            field: "topology.secret",
            contributions: [
              contribution,
              ...secretRequiredEntries.map((entry) => entry.contribution),
            ],
            blocking: false,
            severity: "warning",
            details: { requested: requestedSecret },
          }),
        );
      }
    });

  return topology;
}

function normalizeCapabilityModel(value = null) {
  const provided = Boolean(value);
  if (Array.isArray(value) || value instanceof Set) {
    return {
      provided,
      idsProvided: true,
      ids: new Set(normalizeRoomCapabilityIds([...value])),
      supportedShapesProvided: false,
      supportedShapes: new Set(),
      supportedModifiersProvided: false,
      supportedModifiers: new Set(),
      supportedModifiersByShapeProvided: false,
      supportedModifiersByShape: new Map(),
      supportedPropsProvided: false,
      supportedProps: new Set(),
      maxRequiredProps: Infinity,
      maxPropsByExclusiveGroup: {},
    };
  }
  const source = isPlainObject(value) ? value : {};
  const idsProvided =
    Object.prototype.hasOwnProperty.call(source, "capabilities") ||
    Object.prototype.hasOwnProperty.call(source, "ids");
  const ids = normalizeRoomCapabilityIds([
    ...asArray(source.capabilities),
    ...asArray(source.ids),
  ]);
  return {
    provided,
    idsProvided,
    ids: new Set(ids),
    supportedShapesProvided: Object.prototype.hasOwnProperty.call(
      source,
      "supportedShapes",
    ),
    supportedShapes: new Set(normalizeShapeList(source.supportedShapes)),
    supportedModifiersProvided: Object.prototype.hasOwnProperty.call(
      source,
      "supportedModifiers",
    ),
    supportedModifiers: new Set(
      normalizeModifierList(source.supportedModifiers),
    ),
    supportedModifiersByShapeProvided: Object.prototype.hasOwnProperty.call(
      source,
      "supportedModifiersByShape",
    ),
    supportedModifiersByShape: new Map(
      Object.entries(
        isPlainObject(source.supportedModifiersByShape)
          ? source.supportedModifiersByShape
          : {},
      )
        .map(([shape, modifiers]) => [
          normalizeRoomDesignShapeKind(shape),
          new Set(normalizeModifierList(modifiers)),
        ])
        .filter(([shape]) => Boolean(shape)),
    ),
    supportedPropsProvided: Object.prototype.hasOwnProperty.call(
      source,
      "supportedProps",
    ),
    supportedProps: new Set(
      asArray(source.supportedProps).map(normalizeToken).filter(Boolean),
    ),
    maxRequiredProps: Number.isFinite(Number(source.maxRequiredProps))
      ? Math.max(0, Number(source.maxRequiredProps))
      : Infinity,
    maxPropsByExclusiveGroup: isPlainObject(source.maxPropsByExclusiveGroup)
      ? Object.fromEntries(
          Object.entries(source.maxPropsByExclusiveGroup).map(
            ([key, count]) => [
              normalizeToken(key),
              Math.max(0, normalizeInteger(count, 0)),
            ],
          ),
        )
      : {},
  };
}

function resolveProfiles(contributions, provenance) {
  const result = {};
  ["maskProfile", "detailProfile", "function"].forEach((field) => {
    const entries = contributions
      .filter((contribution) => contribution.profiles[field])
      .sort(compareContributions);
    if (!entries.length) return;
    const selected = entries[0].profiles[field];
    result[field] = selected;
    entries
      .filter((contribution) => contribution.profiles[field] === selected)
      .forEach((contribution) =>
        addProvenance(
          provenance,
          field === "function" ? "profile.function" : field,
          contribution,
          selected,
        ),
      );
  });
  return result;
}

function applyCompatibilityRules(
  contributions,
  capabilityModel,
  conflicts,
  warnings,
) {
  const allTags = new Set(
    contributions.flatMap((contribution) => contribution.tags),
  );
  const groups = new Map();

  contributions.forEach((contribution) => {
    const compatibility = contribution.compatibility;
    if (!compatibility) return;
    compatibility.exclusiveGroups?.forEach((group) => {
      const list = groups.get(group) || [];
      list.push(contribution);
      groups.set(group, list);
    });
  });

  groups.forEach((groupContributions, group) => {
    const distinct = unique(groupContributions.map((item) => item.sourceId));
    if (distinct.length < 2) return;
    const candidate = groupContributions.find(
      (item) => item.sourceType === "candidate-component",
    );
    const conflictPolicy =
      candidate?.compatibility?.conflictPolicy ||
      (groupContributions.some(
        (item) => item.compatibility?.conflictPolicy === "replace",
      )
        ? "replace"
        : groupContributions.every(
              (item) => item.compatibility?.conflictPolicy === "warn",
            )
          ? "warn"
          : "block");
    const shouldWarn = conflictPolicy === "warn";
    const replacementSources = groupContributions
      .filter((item) => item.sourceType !== "candidate-component")
      .map((item) => item.sourceId)
      .sort();
    const conflict = createConflict({
      code: "ROOM_EXCLUSIVE_GROUP_CONFLICT",
      field: "compatibility.exclusiveGroups",
      contributions: groupContributions,
      blocking: !shouldWarn,
      severity: shouldWarn ? "warning" : "error",
      details: {
        exclusiveGroup: group,
        conflictPolicy,
        ...(replacementSources.length ? { replacementSources } : {}),
      },
    });
    (shouldWarn ? warnings : conflicts).push(conflict);
  });

  contributions.forEach((contribution) => {
    const compatibility = contribution.compatibility;
    if (!compatibility) return;
    const otherTags = new Set(
      contributions
        .filter((item) => item.sourceId !== contribution.sourceId)
        .flatMap((item) => item.tags),
    );
    const shouldWarn = compatibility.conflictPolicy === "warn";
    const target = shouldWarn ? warnings : conflicts;

    compatibility.requiresComponentTags?.forEach((tag) => {
      if (otherTags.has(tag)) return;
      target.push(
        createConflict({
          code: "ROOM_REQUIRED_COMPONENT_TAG_MISSING",
          field: "compatibility.requiresComponentTags",
          contributions: [contribution],
          blocking: !shouldWarn,
          severity: shouldWarn ? "warning" : "error",
          details: { requiredTag: tag },
        }),
      );
    });

    compatibility.forbidsComponentTags?.forEach((tag) => {
      if (!otherTags.has(tag)) return;
      target.push(
        createConflict({
          code: "ROOM_FORBIDDEN_COMPONENT_TAG_PRESENT",
          field: "compatibility.forbidsComponentTags",
          contributions: [contribution],
          blocking: !shouldWarn,
          severity: shouldWarn ? "warning" : "error",
          details: { forbiddenTag: tag },
        }),
      );
    });

    if (capabilityModel.provided && capabilityModel.idsProvided) {
      compatibility.requiresCapabilities?.forEach((capability) => {
        if (capabilityModel.ids.has(capability)) return;
        conflicts.push(
          createConflict({
            code: "ROOM_REQUIRED_CAPABILITY_MISSING",
            field: "compatibility.requiresCapabilities",
            contributions: [contribution],
            details: { capability, unsupported: true },
          }),
        );
      });
      compatibility.forbidsCapabilities?.forEach((capability) => {
        if (!capabilityModel.ids.has(capability)) return;
        target.push(
          createConflict({
            code: "ROOM_FORBIDDEN_CAPABILITY_PRESENT",
            field: "compatibility.forbidsCapabilities",
            contributions: [contribution],
            blocking: !shouldWarn,
            severity: shouldWarn ? "warning" : "error",
            details: { capability },
          }),
        );
      });
    }
  });

  return [...allTags].sort();
}

function validateSelectedShape(
  shape,
  contributions,
  capabilityModel,
  conflicts,
) {
  if (!shape || !capabilityModel.provided) return;
  if (
    capabilityModel.supportedShapesProvided &&
    !capabilityModel.supportedShapes.has(shape)
  ) {
    conflicts.push(
      createConflict({
        code: "ROOM_REQUIRED_CAPABILITY_MISSING",
        field: "shape.kind",
        contributions: contributions.filter(
          (contribution) =>
            contribution.shape.required.includes(shape) ||
            contribution.shape.preferred.includes(shape),
        ),
        details: {
          shape,
          capability: `supports-shape-${shape}`,
          unsupported: true,
        },
      }),
    );
  }
}

function validateSelectedShapeModifiers(
  shape,
  modifiers,
  contributions,
  capabilityModel,
  conflicts,
) {
  if (
    !shape ||
    !modifiers.length ||
    !capabilityModel.provided ||
    !capabilityModel.supportedModifiersByShapeProvided
  )
    return;

  const supported = capabilityModel.supportedModifiersByShape.get(shape);
  if (!supported) return;

  modifiers
    .filter((modifier) => !supported.has(modifier))
    .forEach((modifier) => {
      conflicts.push(
        createConflict({
          code: "ROOM_SHAPE_MODIFIER_UNSUPPORTED",
          field: `modifiers.${modifier}`,
          contributions: contributions.filter(
            (contribution) =>
              contribution.modifiers.required.includes(modifier) ||
              contribution.modifiers.preferred.includes(modifier) ||
              contribution.shape.required.includes(shape) ||
              contribution.shape.preferred.includes(shape),
          ),
          details: {
            shape,
            modifier,
            capability: `supports-${shape}-${modifier}`,
            unsupported: true,
          },
        }),
      );
    });
}

function getBaselineDesign(baseRegion) {
  const source = asArray(baseRegion)[0];
  if (!source) return null;
  return normalizeRoomDesign(getNestedRoomDesign(source) || source);
}

function compareValues(left, right) {
  return stableStringify(left) === stableStringify(right);
}

function createChanges(baseline, effectiveRoomDesign, provenance) {
  if (!baseline) return [];
  const changes = [];
  const fields = [
    ["shape.kind", baseline.shape?.kind, effectiveRoomDesign.shape?.kind],
    ["size.scale", baseline.size?.scale, effectiveRoomDesign.size?.scale],
    [
      "size.minWidthCells",
      baseline.size?.minWidthCells,
      effectiveRoomDesign.size?.minWidthCells,
    ],
    [
      "size.minHeightCells",
      baseline.size?.minHeightCells,
      effectiveRoomDesign.size?.minHeightCells,
    ],
    [
      "size.minAreaCells",
      baseline.size?.minAreaCells,
      effectiveRoomDesign.size?.minAreaCells,
    ],
    ["maskProfile", baseline.maskProfile, effectiveRoomDesign.maskProfile],
    [
      "detailProfile",
      baseline.detailProfile,
      effectiveRoomDesign.detailProfile,
    ],
  ];
  fields.forEach(([field, from, to]) => {
    if (to === undefined || compareValues(from, to)) return;
    changes.push({
      field,
      from: from ?? null,
      to,
      reason: "Resolved from active room constraints.",
      sourceIds: (provenance[field] || []).map((entry) => entry.sourceId),
    });
  });

  const baselineModifiers = new Set([
    ...asArray(baseline.modifiers),
    ...asArray(baseline.shape?.modifiers),
  ]);
  const effectiveModifiers = new Set([
    ...asArray(effectiveRoomDesign.modifiers),
    ...asArray(effectiveRoomDesign.shape?.modifiers),
  ]);
  [...effectiveModifiers]
    .filter((modifier) => !baselineModifiers.has(modifier))
    .sort(compareModifierIds)
    .forEach((modifier) => {
      changes.push({
        field: `modifiers.${modifier}`,
        from: false,
        to: true,
        reason: "Added by active room constraints.",
        sourceIds: (provenance[`modifiers.${modifier}`] || []).map(
          (entry) => entry.sourceId,
        ),
      });
    });
  [...baselineModifiers]
    .filter((modifier) => !effectiveModifiers.has(modifier))
    .sort(compareModifierIds)
    .forEach((modifier) => {
      changes.push({
        field: `modifiers.${modifier}`,
        from: true,
        to: false,
        reason: "Removed by active room constraints.",
        sourceIds: [],
      });
    });

  return changes.sort(
    (a, b) =>
      a.field.localeCompare(b.field) ||
      stableStringify(a).localeCompare(stableStringify(b)),
  );
}

function collectResolvedCapabilities(
  contributions,
  capabilityModel,
  shape,
  modifiers,
  props,
) {
  const capabilities = new Set(capabilityModel.ids);
  if (shape) capabilities.add(`supports-shape-${shape}`);
  modifiers.forEach((modifier) => {
    capabilities.add(
      MODIFIER_CAPABILITY_BY_ID[modifier] || `supports-${modifier}`,
    );
  });
  asArray(props?.required).forEach((prop) => {
    if (prop?.kind) capabilities.add(`supports-prop-${prop.kind}`);
  });
  contributions.forEach((contribution) => {
    contribution.compatibility?.requiresCapabilities?.forEach((capability) =>
      capabilities.add(capability),
    );
  });
  return [...capabilities].sort();
}

function getResolutionStatus(conflicts, warnings, changes) {
  const blocking = conflicts.filter((conflict) => conflict.blocking !== false);
  if (blocking.some((conflict) => conflict.unsupported)) return "unsupported";
  if (blocking.length) return "incompatible";
  if (warnings.length) return "warning";
  if (changes.length) return "transforms-room";
  return "compatible";
}

function cleanEffectiveRoomDesign(value) {
  const result = {
    schemaVersion: ROOM_DESIGN_SCHEMA_VERSION,
    ...(value.presetId ? { presetId: value.presetId } : {}),
    ...(value.shape?.kind || value.shape?.modifiers?.length
      ? { shape: value.shape }
      : {}),
    ...(Object.keys(value.size || {}).length ? { size: value.size } : {}),
    ...(value.props?.required?.length || value.props?.optional?.length
      ? { props: value.props }
      : {}),
    ...(Object.keys(value.topology || {}).length
      ? { topology: value.topology }
      : {}),
    ...(value.maskProfile ? { maskProfile: value.maskProfile } : {}),
    ...(value.detailProfile ? { detailProfile: value.detailProfile } : {}),
    ...(value.profileFunction
      ? { profile: { function: value.profileFunction } }
      : {}),
    source: "room-constraint-resolver",
  };
  return Object.keys(result).length > 2 ? result : null;
}

export function resolveRoomConstraints(input = {}) {
  const baseContributions = collectRoomContributions(input);
  const conflicts = [];
  const warnings = [];
  const provenance = {};
  const capabilityModel = normalizeCapabilityModel(
    input.engineCapabilities || input.generatorCapabilities || null,
  );

  const archetypeResolution = resolveArchetype(
    baseContributions,
    conflicts,
    warnings,
    provenance,
  );
  const derivedArchetype = createDerivedArchetypeContribution(
    archetypeResolution.selected,
    archetypeResolution.hard,
  );
  const contributions = derivedArchetype
    ? [...baseContributions, derivedArchetype].sort(compareContributions)
    : baseContributions;

  validateRegisteredShapeRules(contributions, conflicts);
  const shape = resolveShape(contributions, conflicts, warnings, provenance);
  validateSelectedShape(shape, contributions, capabilityModel, conflicts);
  const size = resolveSize(contributions, conflicts, warnings, provenance);
  const modifiers = resolveModifiers(
    contributions,
    conflicts,
    warnings,
    provenance,
    capabilityModel,
  );
  validateSelectedShapeModifiers(
    shape,
    modifiers,
    contributions,
    capabilityModel,
    conflicts,
  );
  const props = resolveProps(
    contributions,
    conflicts,
    provenance,
    capabilityModel,
  );
  const topology = resolveTopology(
    contributions,
    conflicts,
    warnings,
    provenance,
  );
  const profiles = resolveProfiles(contributions, provenance);
  const tags = applyCompatibilityRules(
    contributions,
    capabilityModel,
    conflicts,
    warnings,
  );

  const resolvedCapabilities = collectResolvedCapabilities(
    contributions,
    capabilityModel,
    shape,
    modifiers,
    props,
  );

  const effectiveRoomDesign = cleanEffectiveRoomDesign({
    presetId: archetypeResolution.selected,
    shape: {
      ...(shape ? { kind: shape } : {}),
      ...(modifiers.length ? { modifiers } : {}),
    },
    size,
    modifiers,
    props,
    topology,
    maskProfile: profiles.maskProfile,
    detailProfile: profiles.detailProfile,
    profileFunction: profiles.function,
  });
  const baseline = getBaselineDesign(input.baseRegion);
  const changes = createChanges(
    baseline,
    effectiveRoomDesign || {},
    provenance,
  );
  const sortedConflicts = conflicts.sort(
    (a, b) =>
      a.code.localeCompare(b.code) ||
      a.field.localeCompare(b.field) ||
      stableStringify(a.sources).localeCompare(stableStringify(b.sources)),
  );
  const sortedWarnings = warnings.sort(
    (a, b) =>
      a.code.localeCompare(b.code) ||
      a.field.localeCompare(b.field) ||
      stableStringify(a.sources).localeCompare(stableStringify(b.sources)),
  );
  const status = getResolutionStatus(sortedConflicts, sortedWarnings, changes);

  return {
    schemaVersion: ROOM_CONSTRAINT_RESOLVER_SCHEMA_VERSION,
    status: ROOM_COMPATIBILITY_STATUSES.includes(status)
      ? status
      : "incompatible",
    effectiveRoomDesign,
    conflicts: sortedConflicts,
    warnings: sortedWarnings,
    changes,
    provenance: stableValue(provenance),
    capabilities: resolvedCapabilities,
    diagnostics: {
      contributionCount: contributions.length,
      sourceIds: contributions.map((contribution) => contribution.sourceId),
      tags,
      selectedArchetype: archetypeResolution.selected,
    },
  };
}

export function resolveEffectiveRoomProgram(input = {}) {
  return resolveRoomConstraints(input);
}

export function evaluateRoomComponentCandidate(input = {}) {
  return resolveRoomConstraints(input);
}

export function formatRoomConflictReason(conflict = null) {
  if (!conflict) return "";
  if (conflict.message) return conflict.message;
  return CONFLICT_MESSAGES[conflict.code] || String(conflict.code || "");
}
