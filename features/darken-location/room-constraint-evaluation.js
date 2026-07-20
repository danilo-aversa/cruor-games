import {
  ROOM_DESIGN_MODIFIER_OPTIONS,
  normalizeRoomDesignModifier,
  normalizeRoomDesignShapeKind,
} from "../../shared/content/contracts/room-design.js";
import {
  getSupportedRoomModifiersByShape,
  getSupportedRoomShapeKinds,
} from "../../shared/content/contracts/room-shapes.js";
import {
  evaluateRoomComponentCandidate,
  normalizeRoomContribution,
  resolveRoomConstraints,
} from "../../shared/content/contracts/room-constraint-resolver.js";

const ROOM_SIZE_ORDER = Object.freeze(["Small", "Medium", "Large"]);
const BLOCKING_STATUSES = new Set(["incompatible", "unsupported"]);
const SUPPORTED_ROOM_SHAPES = Object.freeze(getSupportedRoomShapeKinds());
const SUPPORTED_MODIFIERS_BY_SHAPE = Object.freeze(
  getSupportedRoomModifiersByShape(),
);
const ENGINE_CAPABILITY_IDS = Object.freeze([
  "supports-alcoves",
  "supports-asymmetrical",
  "supports-central-void",
  "supports-chamfered-corners",
  "supports-collapsed-edge",
  "supports-notch",
  "supports-notched-rooms",
  "supports-partition",
  "supports-partitioned",
  "supports-pillars",
  "supports-ruined",
  "supports-ruined-rooms",
  "supports-secret-recess",
  "supports-side-alcoves",
  "supports-symmetrical",
  ...SUPPORTED_ROOM_SHAPES.map((shape) => `supports-shape-${shape}`),
]);

export const DARK_PLACES_ROOM_ENGINE_CAPABILITIES = Object.freeze({
  capabilities: ENGINE_CAPABILITY_IDS,
  supportedShapes: SUPPORTED_ROOM_SHAPES,
  supportedModifiers: ROOM_DESIGN_MODIFIER_OPTIONS,
  supportedModifiersByShape: SUPPORTED_MODIFIERS_BY_SHAPE,
});

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function clonePlainObject(value) {
  return isPlainObject(value) ? JSON.parse(JSON.stringify(value)) : null;
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function titleCase(value = "") {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /(^|\s)(\S)/g,
      (_, spacer, letter) => `${spacer}${letter.toUpperCase()}`,
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

function getNestedValue(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function normalizeScale(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return (
    ROOM_SIZE_ORDER.find((item) => item.toLowerCase() === normalized) || ""
  );
}

function normalizeEngineShape(value = "") {
  const normalized = normalizeRoomDesignShapeKind(value);
  if (normalized) return normalized;
  const aliases = {
    notched: "rect",
    notch: "rect",
    cutout: "rect",
    "ruined-rect": "broken",
    ellipse: "oval",
  };
  return (
    aliases[
      String(value || "")
        .trim()
        .toLowerCase()
    ] || ""
  );
}

function getRoomDesignSource(source = {}) {
  if (!isPlainObject(source)) return null;
  return (
    source.effectiveRoomDesign ||
    source.roomDesign ||
    source.location?.roomDesign ||
    source.locationRegion?.roomDesign ||
    source.map?.roomDesign ||
    source.metadata?.effectiveRoomDesign ||
    source.metadata?.roomDesign ||
    source.requestMetadata?.effectiveRoomDesign ||
    source.requestMetadata?.roomDesign ||
    source.requestMetadata?.dungeonRoomBrief?.effectiveRoomDesign ||
    source.requestMetadata?.dungeonRoomBrief?.roomDesign ||
    null
  );
}

function getRegionId(activeRegion = null, generatedRoom = null) {
  return String(
    activeRegion?.id ||
      generatedRoom?.sourceRegionId ||
      generatedRoom?.requestMetadata?.sourceRegionId ||
      generatedRoom?.id ||
      "room",
  );
}

export function createDarkPlacesRoomBaseRegion({
  activeRegion = null,
  generatedRoom = null,
} = {}) {
  const authored = isPlainObject(activeRegion) ? activeRegion : {};
  const generated = isPlainObject(generatedRoom) ? generatedRoom : {};
  const explicitDesign =
    clonePlainObject(
      getRoomDesignSource(generated) || getRoomDesignSource(authored),
    ) || {};
  const rawShape =
    generated.shape ||
    generated.preferredShape ||
    authored.shape ||
    authored.preferredShape;
  const shape = normalizeEngineShape(rawShape);
  const legacyNotchedShape = ["notched", "notch", "cutout"].includes(
    String(rawShape || "").trim().toLowerCase(),
  );
  const scale = normalizeScale(generated.size || authored.size);
  const existingShape = isPlainObject(explicitDesign.shape)
    ? explicitDesign.shape
    : {};
  const shapeModifiers = unique([
    ...asArray(existingShape.modifiers),
    ...asArray(generated.shapeOptions?.roomDesignModifiers),
    ...(generated.shapeOptions?.notch === true || legacyNotchedShape
      ? ["notch"]
      : []),
    ...(generated.shapeOptions?.ruined === true ? ["ruined"] : []),
  ])
    .map(normalizeRoomDesignModifier)
    .filter(Boolean);
  const existingSize = isPlainObject(explicitDesign.size)
    ? explicitDesign.size
    : {};
  const roomDesign = {
    ...explicitDesign,
    ...(shape || Object.keys(existingShape).length
      ? {
          shape: {
            ...existingShape,
            ...(shape ? { kind: shape } : {}),
            ...(shapeModifiers.length ? { modifiers: shapeModifiers } : {}),
          },
        }
      : {}),
    ...(scale || Object.keys(existingSize).length
      ? {
          size: {
            ...existingSize,
            ...(scale ? { scale } : {}),
          },
        }
      : {}),
    source: explicitDesign.source || "dark-places-current-room",
  };

  return {
    ...authored,
    ...generated,
    id: getRegionId(activeRegion, generatedRoom),
    name: authored.name || generated.name || generated.label || "Selected room",
    roomDesign,
  };
}

function getRoomStyleSource(manualOverrides = null, regionId = "") {
  if (!manualOverrides || typeof manualOverrides !== "object") return null;
  if (manualOverrides.roomStyles || manualOverrides.manualRoomStyles) {
    return (
      manualOverrides.roomStyles?.[regionId] ||
      manualOverrides.manualRoomStyles?.[regionId] ||
      null
    );
  }
  return manualOverrides;
}

function omitMapInfluence(source = null) {
  if (!isPlainObject(source)) return source;
  const next = { ...source, mapInfluence: null };
  ["location", "locationRegion", "map", "metadata", "requestMetadata"].forEach(
    (key) => {
      if (!isPlainObject(source[key])) return;
      next[key] = { ...source[key], mapInfluence: null };
    },
  );
  return next;
}

function getManualShape(style = {}) {
  const explicitShape = normalizeEngineShape(style.shape);
  const roomTypeShape = normalizeEngineShape(
    style.roomType && style.roomType !== "none" ? style.roomType : "",
  );
  return explicitShape || roomTypeShape;
}

function getManualModifiers(style = {}) {
  return unique([
    style.notch ? "notch" : "",
    style.ruined ? "ruined" : "",
    ...asArray(style.modifiers),
  ])
    .map(normalizeRoomDesignModifier)
    .filter(Boolean);
}

export function createDarkPlacesManualOverrideContribution(
  manualOverrides = null,
  regionId = "",
  patch = null,
) {
  const current = getRoomStyleSource(manualOverrides, regionId) || {};
  const style = {
    ...current,
    ...(isPlainObject(patch) ? patch : {}),
  };
  if (!Object.keys(style).length) return null;

  const shape = getManualShape(style);
  const modifiers = getManualModifiers(style);
  const scale = normalizeScale(style.sizePreset || style.size);
  const customSize = isPlainObject(style.customSize) ? style.customSize : {};
  const radius = Number(customSize.radiusCells ?? customSize.radius);
  const width = Number(
    customSize.widthCells ?? customSize.width ?? customSize.w,
  );
  const height = Number(
    customSize.heightCells ?? customSize.height ?? customSize.h,
  );
  const size = {
    ...(scale ? { scale } : {}),
    ...(Number.isFinite(radius)
      ? {
          minDiameterCells: Math.max(1, Math.round(radius * 2)),
          minWidthCells: Math.max(1, Math.round(radius * 2)),
          maxWidthCells: Math.max(1, Math.round(radius * 2)),
          minHeightCells: Math.max(1, Math.round(radius * 2)),
          maxHeightCells: Math.max(1, Math.round(radius * 2)),
        }
      : {}),
    ...(Number.isFinite(width)
      ? {
          minWidthCells: Math.max(1, Math.round(width)),
          maxWidthCells: Math.max(1, Math.round(width)),
        }
      : {}),
    ...(Number.isFinite(height)
      ? {
          minHeightCells: Math.max(1, Math.round(height)),
          maxHeightCells: Math.max(1, Math.round(height)),
        }
      : {}),
  };

  if (!shape && !modifiers.length && !Object.keys(size).length) return null;

  return {
    id: `manual-room-style:${regionId || "room"}`,
    title: "Manual room style",
    roomDesign: {
      strength: "preferred",
      ...(shape
        ? { shape: { kind: shape, ...(modifiers.length ? { modifiers } : {}) } }
        : {}),
      ...(!shape && modifiers.length ? { modifiers } : {}),
      ...(Object.keys(size).length ? { size } : {}),
      source: "manual-room-style",
    },
  };
}

export function getDarkPlacesRoomAssignedComponents(region = null) {
  if (!isPlainObject(region)) return [];
  return asArray(
    region.assignedComponents ||
      region.metadata?.assignedComponents ||
      region.requestMetadata?.assignedComponents ||
      region.metadata?.dungeonRoomBrief?.assignedComponents ||
      region.requestMetadata?.dungeonRoomBrief?.assignedComponents,
  );
}

function getConflictKey(conflict = {}) {
  return stableStringify({
    code: conflict.code,
    field: conflict.field,
    sources: asArray(conflict.sources).slice().sort(),
    requested: conflict.requested,
    requiredTag: conflict.requiredTag,
    forbiddenTag: conflict.forbiddenTag,
    capability: conflict.capability,
    exclusiveGroup: conflict.exclusiveGroup,
  });
}

function getNewDiagnostics(current = [], candidate = [], candidateId = "") {
  const existing = new Set(current.map(getConflictKey));
  return candidate.filter(
    (item) =>
      asArray(item.sources).includes(candidateId) ||
      !existing.has(getConflictKey(item)),
  );
}

function compareRoomDesigns(current = null, next = null) {
  const before = current || {};
  const after = next || {};
  const changes = [];
  const scalarFields = [
    ["presetId", "Archetype"],
    ["shape.kind", "Shape"],
    ["size.scale", "Size"],
    ["size.minWidthCells", "Minimum width"],
    ["size.maxWidthCells", "Maximum width"],
    ["size.minHeightCells", "Minimum height"],
    ["size.maxHeightCells", "Maximum height"],
    ["size.minAreaCells", "Minimum area"],
    ["size.maxAreaCells", "Maximum area"],
    ["size.minDiameterCells", "Minimum diameter"],
    ["maskProfile", "Mask profile"],
    ["detailProfile", "Detail profile"],
  ];

  scalarFields.forEach(([field, label]) => {
    const from = getNestedValue(before, field);
    const to = getNestedValue(after, field);
    if (to === undefined || stableStringify(from) === stableStringify(to))
      return;
    changes.push({ field, label, from: from ?? null, to });
  });

  const beforeModifiers = new Set(
    asArray(before.shape?.modifiers || before.modifiers),
  );
  const afterModifiers = new Set(
    asArray(after.shape?.modifiers || after.modifiers),
  );
  [...afterModifiers]
    .filter((modifier) => !beforeModifiers.has(modifier))
    .sort()
    .forEach((modifier) =>
      changes.push({
        field: `modifiers.${modifier}`,
        label: "Modifier",
        from: null,
        to: modifier,
        operation: "add",
      }),
    );
  [...beforeModifiers]
    .filter((modifier) => !afterModifiers.has(modifier))
    .sort()
    .forEach((modifier) =>
      changes.push({
        field: `modifiers.${modifier}`,
        label: "Modifier",
        from: modifier,
        to: null,
        operation: "remove",
      }),
    );

  return changes;
}

function getSourceMap(values = []) {
  return new Map(
    asArray(values).map((source, index) => {
      const id = String(
        source?.id ||
          source?.componentId ||
          source?.sourceId ||
          `source-${index}`,
      );
      return [id, source];
    }),
  );
}

function describeContributionRule(source = null, field = "") {
  if (!source) return "";
  const contribution = normalizeRoomContribution(source, {
    sourceType: "component",
    sourceId: source.id || source.componentId || source.sourceId,
  });
  if (!contribution) return "";
  if (field === "shape.kind") {
    const values = unique([
      ...contribution.shape.required,
      ...contribution.shape.allowed,
      ...contribution.shape.forbidden.map((value) => `not ${value}`),
    ]);
    return values.map(titleCase).join(" / ");
  }
  if (field === "size.scale") {
    const values = unique([
      contribution.size.minScale
        ? `at least ${contribution.size.minScale}`
        : "",
      contribution.size.maxScale ? `at most ${contribution.size.maxScale}` : "",
    ]);
    return values.join(" and ");
  }
  if (field.startsWith("modifiers.")) {
    return titleCase(field.split(".").slice(1).join(" "));
  }
  if (field === "presetId") {
    return unique([
      ...contribution.archetype.required,
      ...contribution.archetype.forbidden.map((value) => `not ${value}`),
    ])
      .map(titleCase)
      .join(" / ");
  }
  return "";
}

export function formatDarkPlacesRoomConflict(conflict = null, sources = []) {
  if (!conflict) return "";
  const sourceMap = getSourceMap(sources);
  const descriptors = asArray(conflict.sources).map((sourceId) => {
    const source = sourceMap.get(sourceId);
    const label = source?.title || source?.name || source?.label || sourceId;
    const rule = describeContributionRule(source, conflict.field);
    return rule ? `${label} (${rule})` : label;
  });
  const joinedSources = descriptors.join("; ");

  switch (conflict.code) {
    case "ROOM_SHAPE_REQUIRED_CONFLICT":
      return `Required room shapes conflict${joinedSources ? `: ${joinedSources}` : ""}.`;
    case "ROOM_SHAPE_FORBIDDEN":
      return `Every allowed room shape is forbidden${joinedSources ? ` by ${joinedSources}` : ""}.`;
    case "ROOM_SIZE_RANGE_EMPTY":
      return `Room size requirements do not overlap${joinedSources ? `: ${joinedSources}` : ""}.`;
    case "ROOM_AREA_RANGE_EMPTY":
      return `Room area requirements do not overlap${joinedSources ? `: ${joinedSources}` : ""}.`;
    case "ROOM_MODIFIER_CONFLICT":
      return `Room modifiers conflict${joinedSources ? `: ${joinedSources}` : ""}.`;
    case "ROOM_TOPOLOGY_CONFLICT":
      return `Room topology requirements conflict${joinedSources ? `: ${joinedSources}` : ""}.`;
    case "ROOM_EXCLUSIVE_GROUP_CONFLICT":
      return `Only one component in “${titleCase(conflict.exclusiveGroup)}” can be assigned${joinedSources ? `: ${joinedSources}` : ""}.`;
    case "ROOM_REQUIRED_CAPABILITY_MISSING":
      return `The map engine does not support ${titleCase(conflict.capability || conflict.modifier || conflict.shape)}${joinedSources ? `, required by ${joinedSources}` : ""}.`;
    case "ROOM_FORBIDDEN_CAPABILITY_PRESENT":
      return `${joinedSources || "This component"} forbids ${titleCase(conflict.capability)}.`;
    case "ROOM_REQUIRED_COMPONENT_TAG_MISSING":
      return `${joinedSources || "This component"} requires another component tagged ${titleCase(conflict.requiredTag)}.`;
    case "ROOM_FORBIDDEN_COMPONENT_TAG_PRESENT":
      return `${joinedSources || "This component"} cannot be combined with tag ${titleCase(conflict.forbiddenTag)}.`;
    case "ROOM_ARCHETYPE_CONFLICT":
      return `Forced room archetypes conflict${joinedSources ? `: ${joinedSources}` : ""}.`;
    case "ROOM_MANUAL_OVERRIDE_CONFLICT":
      return `The manual ${titleCase(conflict.field)} override conflicts with content requirements${joinedSources ? `: ${joinedSources}` : ""}.`;
    default:
      return `${conflict.message || conflict.code}${joinedSources ? ` Sources: ${joinedSources}.` : ""}`;
  }
}

export function formatDarkPlacesRoomChange(change = {}) {
  const from =
    change.from === null || change.from === undefined
      ? "Auto"
      : titleCase(change.from);
  const to =
    change.to === null || change.to === undefined
      ? "Auto"
      : titleCase(change.to);
  if (change.operation === "add") return `Adds ${titleCase(change.to)}`;
  if (change.operation === "remove") return `Removes ${titleCase(change.from)}`;
  return `${change.label}: ${from} → ${to}`;
}

function getReplacementComponentIds(conflicts = []) {
  const blocking = conflicts.filter((conflict) => conflict.blocking !== false);
  if (!blocking.length) return [];
  if (!blocking.every((conflict) => conflict.conflictPolicy === "replace"))
    return [];
  return unique(
    blocking.flatMap((conflict) => asArray(conflict.replacementSources)),
  ).sort();
}

export function resolveDarkPlacesRoomConstraints({
  activeRegion = null,
  generatedRoom = null,
  assignedComponents = [],
  manualOverrides = null,
  engineCapabilities = DARK_PLACES_ROOM_ENGINE_CAPABILITIES,
} = {}) {
  const baseRegion = createDarkPlacesRoomBaseRegion({
    activeRegion,
    generatedRoom,
  });
  const regionId = getRegionId(activeRegion, generatedRoom);
  const manualContribution = createDarkPlacesManualOverrideContribution(
    manualOverrides,
    regionId,
  );

  return resolveRoomConstraints({
    baseRegion,
    assignedComponents,
    manualOverrides: manualContribution,
    engineCapabilities,
  });
}

export function evaluateDarkPlacesRoomCandidate({
  activeRegion = null,
  generatedRoom = null,
  assignedComponents = [],
  candidateComponent = null,
  manualOverrides = null,
  engineCapabilities = DARK_PLACES_ROOM_ENGINE_CAPABILITIES,
} = {}) {
  const baseRegion = createDarkPlacesRoomBaseRegion({
    activeRegion,
    generatedRoom,
  });
  const regionId = getRegionId(activeRegion, generatedRoom);
  const manualContribution = createDarkPlacesManualOverrideContribution(
    manualOverrides,
    regionId,
  );
  const currentInput = {
    baseRegion,
    assignedComponents,
    manualOverrides: manualContribution,
    engineCapabilities,
  };
  const currentResolution = resolveRoomConstraints(currentInput);
  const candidateResolution = evaluateRoomComponentCandidate({
    ...currentInput,
    candidateComponent,
  });
  const candidateId = String(
    candidateComponent?.id || candidateComponent?.componentId || "candidate",
  );
  const candidateContribution = normalizeRoomContribution(
    candidateComponent || {},
    {
      sourceType: "candidate-component",
      sourceId: candidateId,
    },
  );
  const conflicts = candidateContribution
    ? getNewDiagnostics(
        currentResolution.conflicts,
        candidateResolution.conflicts,
        candidateId,
      )
    : [];
  const warnings = candidateContribution
    ? getNewDiagnostics(
        currentResolution.warnings,
        candidateResolution.warnings,
        candidateId,
      )
    : [];
  const changes = candidateContribution
    ? compareRoomDesigns(
        currentResolution.effectiveRoomDesign,
        candidateResolution.effectiveRoomDesign,
      )
    : [];
  const replacementComponentIds = getReplacementComponentIds(conflicts);
  const hasUnsupported = conflicts.some((conflict) => conflict.unsupported);
  const hasBlocking = conflicts.some((conflict) => conflict.blocking !== false);
  const status = hasUnsupported
    ? "unsupported"
    : hasBlocking
      ? "incompatible"
      : warnings.length
        ? "warning"
        : changes.length
          ? "transforms-room"
          : "compatible";

  const allSources = [candidateComponent, ...assignedComponents].filter(
    Boolean,
  );
  const reason = formatDarkPlacesRoomConflict(
    conflicts[0] || warnings[0] || null,
    allSources,
  );

  return {
    status,
    blocking:
      BLOCKING_STATUSES.has(status) && replacementComponentIds.length === 0,
    replaceable: replacementComponentIds.length > 0,
    replacementComponentIds,
    conflicts,
    warnings,
    changes,
    changeSummaries: changes.map(formatDarkPlacesRoomChange),
    reason,
    currentResolution,
    resolution: candidateResolution,
    effectiveRoomDesign: candidateResolution.effectiveRoomDesign,
  };
}

export function evaluateDarkPlacesRoomManualOverride({
  region = null,
  generatedRoom = null,
  assignedComponents = null,
  manualOverrides = null,
  proposedPatch = null,
  engineCapabilities = DARK_PLACES_ROOM_ENGINE_CAPABILITIES,
} = {}) {
  const activeRegion = region;
  const baseRegion = omitMapInfluence(
    createDarkPlacesRoomBaseRegion({
      activeRegion,
      generatedRoom: generatedRoom || region,
    }),
  );
  const regionId = getRegionId(activeRegion, generatedRoom || region);
  const roomComponents =
    assignedComponents || getDarkPlacesRoomAssignedComponents(region);
  const currentManual = createDarkPlacesManualOverrideContribution(
    manualOverrides,
    regionId,
  );
  const proposedManual = createDarkPlacesManualOverrideContribution(
    manualOverrides,
    regionId,
    proposedPatch,
  );
  const currentResolution = resolveRoomConstraints({
    baseRegion,
    assignedComponents: roomComponents,
    manualOverrides: currentManual,
    engineCapabilities,
  });
  const resolution = resolveRoomConstraints({
    baseRegion,
    assignedComponents: roomComponents,
    manualOverrides: proposedManual,
    engineCapabilities,
  });
  const manualConflicts = resolution.warnings.filter(
    (warning) => warning.code === "ROOM_MANUAL_OVERRIDE_CONFLICT",
  );
  const blockingConflicts = getNewDiagnostics(
    currentResolution.conflicts,
    resolution.conflicts,
    proposedManual?.id || "",
  ).filter((conflict) => conflict.blocking !== false);
  const conflicts = [...blockingConflicts, ...manualConflicts];
  const reason = formatDarkPlacesRoomConflict(
    conflicts[0] || null,
    [proposedManual, ...roomComponents].filter(Boolean),
  );

  return {
    allowed: conflicts.length === 0,
    blocking: conflicts.length > 0,
    reason,
    conflicts,
    resolution,
    changes: compareRoomDesigns(
      currentResolution.effectiveRoomDesign,
      resolution.effectiveRoomDesign,
    ),
  };
}

export function getDarkPlacesRoomRequirementSummary(region = null) {
  const resolution =
    region?.roomConstraintResolution ||
    region?.metadata?.roomConstraintResolution ||
    region?.requestMetadata?.roomConstraintResolution ||
    region?.requestMetadata?.dungeonRoomBrief?.roomConstraintResolution ||
    null;
  const design = resolution?.effectiveRoomDesign || getRoomDesignSource(region);
  if (!design) return "";
  const parts = unique([
    design.shape?.kind ? titleCase(design.shape.kind) : "",
    design.size?.scale ? titleCase(design.size.scale) : "",
    ...asArray(design.shape?.modifiers || design.modifiers).map(titleCase),
  ]);
  return parts.join(" · ");
}
