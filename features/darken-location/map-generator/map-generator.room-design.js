import { normalizeRoomArchetypeId } from "../../../shared/content/contracts/room-archetypes.js";
import {
  getRoomShapeDefinition,
  getRoomShapeSupport,
  getSupportedRoomModifiersByShape,
  getSupportedRoomShapeKinds,
} from "../../../shared/content/contracts/room-shapes.js";
import {
  ROOM_DESIGN_SCHEMA_VERSION,
  compileRoomArchetypeToRoomDesign,
  mergeRoomDesigns,
  normalizeRoomDesign,
  normalizeRoomDesignModifier,
  normalizeRoomDesignModifiers,
  normalizeRoomDesignProp,
  normalizeRoomDesignShapeKind,
} from "../../../shared/content/contracts/room-design.js";

export {
  ROOM_DESIGN_MODIFIER_OPTIONS,
  ROOM_DESIGN_SCHEMA_VERSION,
  ROOM_DESIGN_SHAPE_KIND_OPTIONS,
  compileRoomArchetypeToRoomDesign,
  mergeRoomDesigns,
  normalizeRoomDesign,
  normalizeRoomDesignPropKind,
  normalizeRoomDesignShapeKind,
} from "../../../shared/content/contracts/room-design.js";
export {
  ROOM_SHAPE_CAPABILITIES_SCHEMA_VERSION,
  ROOM_SHAPE_DEFINITIONS,
  ROOM_SHAPE_DEFINITIONS_BY_ID,
  ROOM_SHAPE_KIND_OPTIONS,
  ROOM_SHAPE_SUPPORT_STATUSES,
  getRoomShapeDefinition,
  getRoomShapeSupport,
  getSupportedRoomModifiersByShape,
  getSupportedRoomShapeDefinitions,
  getSupportedRoomShapeKinds,
} from "../../../shared/content/contracts/room-shapes.js";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

export function getEngineShapeFromRoomDesignKind(kind = "") {
  const normalized = normalizeRoomDesignShapeKind(kind);
  const support = getRoomShapeSupport(normalized);
  return support.status === "supported" ? normalized : "";
}

export function getRoomShapeEngineSupport(kind = "") {
  const normalized = normalizeRoomDesignShapeKind(kind);
  return getRoomShapeSupport(normalized || kind);
}

export function getDarkPlacesRoomEngineShapeCapabilities() {
  return {
    supportedShapes: getSupportedRoomShapeKinds(),
    supportedModifiersByShape: getSupportedRoomModifiersByShape(),
  };
}

function getRoomDesignSources(region = {}) {
  return [
    region.roomDesign,
    region.location?.roomDesign,
    region.locationRegion?.roomDesign,
    region.map?.roomDesign,
    region.metadata?.roomDesign,
    region.requestMetadata?.roomDesign,
    region.metadata?.dungeonRoomBrief?.roomDesign,
    region.requestMetadata?.dungeonRoomBrief?.roomDesign,
  ]
    .map(normalizeRoomDesign)
    .filter(Boolean);
}

export function resolveRoomDesign(
  region = {},
  contextKey = "crypt",
  { archetype = null } = {},
) {
  const directArchetypeId =
    archetype?.id ||
    normalizeRoomArchetypeId(
      region.roomArchetype ||
        region.roomArchetypeId ||
        region.locationRegion?.roomArchetype ||
        region.locationRegion?.roomArchetypeId ||
        region.map?.roomArchetype ||
        region.map?.roomArchetypeId ||
        region.metadata?.roomArchetype ||
        region.metadata?.roomArchetypeId ||
        region.requestMetadata?.roomArchetype ||
        region.requestMetadata?.roomArchetypeId ||
        "",
    );
  const explicitDesigns = getRoomDesignSources(region);
  const explicitPresetId = explicitDesigns
    .map((design) => design.presetId)
    .find(Boolean);
  const archetypeDesign = compileRoomArchetypeToRoomDesign(
    explicitDesigns.length ? explicitPresetId : archetype || directArchetypeId,
  );
  const merged = mergeRoomDesigns([archetypeDesign, ...explicitDesigns]);
  if (!merged) return null;
  return {
    ...merged,
    context: contextKey,
    source: explicitDesigns.length ? "room-design" : merged.source,
  };
}

export function getRoomDesignShape(roomDesign = null) {
  return getEngineShapeFromRoomDesignKind(roomDesign?.shape?.kind || "");
}

export function getRoomDesignRequiredProps(roomDesign = null) {
  return asArray(roomDesign?.props?.required)
    .map(normalizeRoomDesignProp)
    .filter(Boolean);
}

export function getRoomDesignRequiredPropCount(regionOrDesign = null) {
  const roomDesign = regionOrDesign?.roomDesign || regionOrDesign;
  return getRoomDesignRequiredProps(roomDesign).length;
}

export function getRoomDesignModifiers(roomDesign = null) {
  return normalizeRoomDesignModifiers([
    ...asArray(roomDesign?.modifiers),
    ...asArray(roomDesign?.shape?.modifiers),
  ]);
}

export function hasRoomDesignModifier(roomDesign = null, modifier = "") {
  const normalized = normalizeRoomDesignModifier(modifier);
  return Boolean(
    normalized && getRoomDesignModifiers(roomDesign).includes(normalized),
  );
}

export function getRoomDesignShapeOptions(roomDesign = null) {
  if (!roomDesign) return null;
  const modifiers = getRoomDesignModifiers(roomDesign);
  const shapeModifiers = new Set(modifiers);
  return {
    roomDesign,
    roomDesignSchemaVersion: ROOM_DESIGN_SCHEMA_VERSION,
    roomDesignPresetId: roomDesign.presetId || "",
    ...(modifiers.length ? { roomDesignModifiers: modifiers } : {}),
    ...(roomDesign.maskProfile ? { maskProfile: roomDesign.maskProfile } : {}),
    ...(roomDesign.detailProfile
      ? { detailProfile: roomDesign.detailProfile }
      : {}),
    ...(shapeModifiers.has("notch") ? { notch: true } : {}),
    ...(shapeModifiers.has("ruined") || shapeModifiers.has("collapsed-edge")
      ? { ruined: true }
      : {}),
  };
}

export function applyRoomDesignSizeConstraints(size = {}, roomDesign = null) {
  const constraints = roomDesign?.size || {};
  const shapeDefinition = getRoomShapeDefinition(roomDesign?.shape?.kind || "");
  let w = Math.round(size.w || 4);
  let h = Math.round(size.h || 4);
  if (Number.isFinite(shapeDefinition?.minWidthCells))
    w = Math.max(w, shapeDefinition.minWidthCells);
  if (Number.isFinite(shapeDefinition?.minHeightCells))
    h = Math.max(h, shapeDefinition.minHeightCells);
  const minDiameter = constraints.minDiameterCells;
  if (Number.isFinite(minDiameter)) {
    w = Math.max(w, minDiameter);
    h = Math.max(h, minDiameter);
  }
  if (Number.isFinite(constraints.minWidthCells))
    w = Math.max(w, constraints.minWidthCells);
  if (Number.isFinite(constraints.minHeightCells))
    h = Math.max(h, constraints.minHeightCells);
  if (Number.isFinite(constraints.maxWidthCells))
    w = Math.min(w, constraints.maxWidthCells);
  if (Number.isFinite(constraints.maxHeightCells))
    h = Math.min(h, constraints.maxHeightCells);

  if (
    constraints.aspectRatio === "square" ||
    shapeDefinition?.forceSquare ||
    roomDesign?.shape?.kind === "square"
  ) {
    const d = Math.max(w, h);
    w = d;
    h = d;
  }
  if (
    ["wide", "horizontal", "long"].includes(constraints.aspectRatio) ||
    shapeDefinition?.preferredAspectRatio === "long"
  ) {
    w = Math.max(w, h + 2);
  }
  if (["tall", "vertical"].includes(constraints.aspectRatio)) {
    h = Math.max(h, w + 2);
  }
  if (Number.isFinite(constraints.minAreaCells)) {
    let guard = 0;
    while (w * h < constraints.minAreaCells && guard < 24) {
      if (w <= h) w += 1;
      else h += 1;
      guard += 1;
    }
  }
  if (Number.isFinite(constraints.maxAreaCells)) {
    let guard = 0;
    while (
      w * h > constraints.maxAreaCells &&
      Math.max(w, h) > 3 &&
      guard < 24
    ) {
      if (w >= h) w -= 1;
      else h -= 1;
      guard += 1;
    }
  }
  if (
    constraints.aspectRatio === "square" ||
    shapeDefinition?.forceSquare ||
    roomDesign?.shape?.kind === "square"
  ) {
    let diameter = Math.max(w, h, 3);
    if (Number.isFinite(constraints.maxWidthCells))
      diameter = Math.min(diameter, constraints.maxWidthCells);
    if (Number.isFinite(constraints.maxHeightCells))
      diameter = Math.min(diameter, constraints.maxHeightCells);
    w = diameter;
    h = diameter;
  }
  return { w: Math.max(3, w), h: Math.max(3, h) };
}
