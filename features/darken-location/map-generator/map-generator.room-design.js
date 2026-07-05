import {
  getRoomArchetypeDefinition,
  normalizeRoomArchetypeId,
} from "./map-generator.profile.js";

export const ROOM_DESIGN_SCHEMA_VERSION = "room-design-v0.1";

export const ROOM_DESIGN_SHAPE_KIND_OPTIONS = Object.freeze([
  "rect",
  "square",
  "hall",
  "gallery",
  "circle",
  "oval",
  "shaft",
  "l-shape",
  "t-shape",
  "cross",
  "alcove",
  "niche",
  "archive",
  "apse",
  "ritual",
  "irregular",
  "broken",
  "cave",
]);

export const ROOM_DESIGN_MODIFIER_OPTIONS = Object.freeze([
  "notch",
  "ruined",
  "side-alcoves",
  "central-void",
  "secret-recess",
  "symmetrical",
  "asymmetrical",
  "chamfered-corners",
  "pillared",
  "partitioned",
  "collapsed-edge",
]);

const ROOM_DESIGN_SHAPE_KINDS = new Set(ROOM_DESIGN_SHAPE_KIND_OPTIONS);
const ROOM_DESIGN_MODIFIERS = new Set(ROOM_DESIGN_MODIFIER_OPTIONS);

const ROOM_DESIGN_SHAPE_ALIASES = Object.freeze({
  rectangle: "rect",
  rectangular: "rect",
  standard: "rect",
  box: "rect",
  compact: "square",
  long: "hall",
  corridor: "hall",
  passage: "hall",
  processional: "hall",
  ossuary: "gallery",
  round: "circle",
  circular: "circle",
  cylinder: "shaft",
  well: "shaft",
  vertical: "shaft",
  l: "l-shape",
  "l-shape": "l-shape",
  "l-shapes": "l-shape",
  "l-shaped": "l-shape",
  "l shape": "l-shape",
  "t-shape": "t-shape",
  "t-shaped": "t-shape",
  "t shape": "t-shape",
  cruciform: "cross",
  niche: "niche",
  reliquary: "niche",
  library: "archive",
  ruined: "broken",
  ruin: "broken",
  notched: "broken",
  jagged: "irregular",
  organic: "irregular",
  blob: "cave",
});

const ROOM_DESIGN_MODIFIER_ALIASES = Object.freeze({
  notched: "notch",
  notch: "notch",
  broken: "ruined",
  ruin: "ruined",
  collapsed: "collapsed-edge",
  collapse: "collapsed-edge",
  "collapsed-edge": "collapsed-edge",
  "side-alcove": "side-alcoves",
  "side-alcoves": "side-alcoves",
  alcoves: "side-alcoves",
  "central-hole": "central-void",
  "central-pit": "central-void",
  "central-void": "central-void",
  void: "central-void",
  recess: "secret-recess",
  "secret-recess": "secret-recess",
  hidden: "secret-recess",
  symmetric: "symmetrical",
  symmetrical: "symmetrical",
  asymmetric: "asymmetrical",
  asymmetrical: "asymmetrical",
  chamfer: "chamfered-corners",
  chamfered: "chamfered-corners",
  "chamfered-corners": "chamfered-corners",
  pillars: "pillared",
  pillared: "pillared",
  columns: "pillared",
  partition: "partitioned",
  partitioned: "partitioned",
});

function normalizeRoomDesignModifier(value = "") {
  const normalized = normalizeToken(value);
  if (!normalized) return "";
  const aliased = ROOM_DESIGN_MODIFIER_ALIASES[normalized] || normalized;
  return ROOM_DESIGN_MODIFIERS.has(aliased) ? aliased : "";
}

function normalizeRoomDesignModifiers(values = []) {
  return unique(values).map(normalizeRoomDesignModifier).filter(Boolean);
}

const ROOM_DESIGN_ENGINE_SHAPE_BY_KIND = Object.freeze({
  rect: "rect",
  square: "rect",
  hall: "hall",
  gallery: "hall",
  circle: "circle",
  oval: "oval",
  shaft: "shaft",
  "l-shape": "l-shape",
  "t-shape": "notched",
  cross: "notched",
  alcove: "alcove",
  niche: "alcove",
  archive: "archive",
  apse: "apse",
  ritual: "ritual",
  irregular: "cave",
  broken: "broken",
  cave: "cave",
});

const ROOM_DESIGN_PROP_KIND_ALIASES = Object.freeze({
  well: "pit",
  shaft: "pit",
  pit: "pit",
  altar: "altar",
  shrine: "altar",
  reliquary: "altar",
  relic: "altar",
  sarcophagus: "tomb",
  coffin: "tomb",
  tomb: "tomb",
  slab: "tomb",
  "burial-slab": "tomb",
  pillar: "pillar",
  column: "pillar",
  statue: "statue",
  shelf: "shelf",
  shelves: "shelf",
  chest: "chest",
  bones: "bones",
  bone: "bones",
  rubble: "rubble",
  crack: "crack",
  fog: "fog",
  desk: "desk",
  table: "table",
  fireplace: "fireplace",
  bed: "bed",
  pew: "pew",
});

const ROOM_DESIGN_PROP_PLACEMENTS = new Set([
  "center",
  "near-center",
  "far-wall",
  "near-wall",
  "north-wall",
  "south-wall",
  "east-wall",
  "west-wall",
  "corner",
  "random",
]);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function unique(values = []) {
  return [...new Set(asArray(values).map((value) => String(value || "").trim()).filter(Boolean))];
}

function normalizeToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeNumber(value, fallback = null, { min = -Infinity, max = Infinity, integer = false } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const clamped = Math.max(min, Math.min(max, parsed));
  return integer ? Math.round(clamped) : clamped;
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function normalizeRoomDesignShapeKind(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (ROOM_DESIGN_SHAPE_ALIASES[lower]) return ROOM_DESIGN_SHAPE_ALIASES[lower];
  const normalized = normalizeToken(raw);
  if (ROOM_DESIGN_SHAPE_KINDS.has(normalized)) return normalized;
  return ROOM_DESIGN_SHAPE_ALIASES[normalized] || "";
}

export function getEngineShapeFromRoomDesignKind(kind = "") {
  const normalized = normalizeRoomDesignShapeKind(kind);
  return ROOM_DESIGN_ENGINE_SHAPE_BY_KIND[normalized] || "";
}

export function normalizeRoomDesignPropKind(value = "") {
  const normalized = normalizeToken(value);
  if (!normalized) return "";
  return ROOM_DESIGN_PROP_KIND_ALIASES[normalized] || normalized;
}

function normalizeRoomDesignShape(value = {}) {
  const shape = isPlainObject(value) ? value : { kind: value };
  const kind = normalizeRoomDesignShapeKind(
    shape.kind || shape.type || shape.shape || shape.value || "",
  );
  const modifiers = unique([
    ...asArray(shape.modifiers),
    ...asArray(shape.modifier),
    ...(shape.notch || shape.notched ? ["notch"] : []),
    ...(shape.ruined || shape.broken ? ["ruined"] : []),
    ...(shape.alcoves || shape.sideAlcoves ? ["side-alcoves"] : []),
    ...(shape.centralVoid ? ["central-void"] : []),
    ...(shape.secretRecess ? ["secret-recess"] : []),
  ]).map(normalizeRoomDesignModifier).filter(Boolean);
  const irregularity = normalizeNumber(shape.irregularity, null, { min: 0, max: 1 });
  const sideAlcoves = normalizeNumber(shape.sideAlcoves ?? shape.alcoves, null, { min: 0, max: 12, integer: true });
  const variant = normalizeString(shape.variant || shape.profile || "");

  if (!kind && !modifiers.length && irregularity === null && sideAlcoves === null && !variant) return null;
  return {
    ...(kind ? { kind } : {}),
    ...(variant ? { variant } : {}),
    ...(modifiers.length ? { modifiers } : {}),
    ...(irregularity !== null ? { irregularity } : {}),
    ...(sideAlcoves !== null ? { sideAlcoves } : {}),
  };
}

function normalizeRoomDesignSize(value = {}) {
  const size = isPlainObject(value) ? value : { scale: value };
  const scale = normalizeString(size.scale || size.preset || size.size || "");
  const minDiameterCells = normalizeNumber(size.minDiameterCells ?? size.minDiameter, null, { min: 1, max: 40, integer: true });
  const minWidthCells = normalizeNumber(size.minWidthCells ?? size.minW ?? size.minWidth, null, { min: 1, max: 40, integer: true });
  const minHeightCells = normalizeNumber(size.minHeightCells ?? size.minH ?? size.minHeight, null, { min: 1, max: 40, integer: true });
  const maxWidthCells = normalizeNumber(size.maxWidthCells ?? size.maxW ?? size.maxWidth, null, { min: 1, max: 40, integer: true });
  const maxHeightCells = normalizeNumber(size.maxHeightCells ?? size.maxH ?? size.maxHeight, null, { min: 1, max: 40, integer: true });
  const minAreaCells = normalizeNumber(size.minAreaCells ?? size.minArea, null, { min: 1, max: 400, integer: true });
  const maxAreaCells = normalizeNumber(size.maxAreaCells ?? size.maxArea, null, { min: 1, max: 400, integer: true });
  const aspectRatio = normalizeToken(size.aspectRatio || size.proportion || "");

  const normalized = {
    ...(scale ? { scale } : {}),
    ...(minDiameterCells !== null ? { minDiameterCells } : {}),
    ...(minWidthCells !== null ? { minWidthCells } : {}),
    ...(minHeightCells !== null ? { minHeightCells } : {}),
    ...(maxWidthCells !== null ? { maxWidthCells } : {}),
    ...(maxHeightCells !== null ? { maxHeightCells } : {}),
    ...(minAreaCells !== null ? { minAreaCells } : {}),
    ...(maxAreaCells !== null ? { maxAreaCells } : {}),
    ...(aspectRatio ? { aspectRatio } : {}),
  };
  return Object.keys(normalized).length ? normalized : null;
}

function normalizeRoomDesignProp(value = {}) {
  if (!isPlainObject(value) && typeof value !== "string") return null;
  const prop = isPlainObject(value) ? value : { kind: value };
  const kind = normalizeRoomDesignPropKind(prop.kind || prop.type || prop.prop || "");
  if (!kind) return null;
  const placementRaw = normalizeToken(prop.placement || prop.position || "center");
  const placement = ROOM_DESIGN_PROP_PLACEMENTS.has(placementRaw) ? placementRaw : "center";
  const minRadiusCells = normalizeNumber(prop.minRadiusCells ?? prop.radiusCells ?? prop.radius, null, { min: 0, max: 12 });
  const sizeScale = normalizeNumber(prop.sizeScale ?? prop.scale, null, { min: 0.25, max: 3 });
  const rotation = normalizeNumber(prop.rotation, null, { min: -360, max: 360 });
  return {
    kind,
    placement,
    ...(minRadiusCells !== null ? { minRadiusCells } : {}),
    ...(sizeScale !== null ? { sizeScale } : {}),
    ...(rotation !== null ? { rotation } : {}),
    ...(prop.source ? { source: String(prop.source) } : {}),
  };
}

function normalizeRoomDesignProps(value = {}) {
  const props = isPlainObject(value) ? value : {};
  const required = [
    ...asArray(props.required),
    ...asArray(props.requiredProps),
  ].map(normalizeRoomDesignProp).filter(Boolean);
  const optional = [
    ...asArray(props.optional),
    ...asArray(props.optionalProps),
  ].map(normalizeRoomDesignProp).filter(Boolean);
  if (!required.length && !optional.length) return null;
  return {
    ...(required.length ? { required } : {}),
    ...(optional.length ? { optional } : {}),
  };
}

function normalizeRoomDesignTopology(value = {}) {
  if (!isPlainObject(value)) return null;
  const branchBias = normalizeToken(value.branchBias || value.pathBias || "");
  const depthBias = normalizeToken(value.depthBias || "");
  const secret = value.secret === true ? true : value.secret === false ? false : null;
  const normalized = {
    ...(branchBias ? { branchBias } : {}),
    ...(depthBias ? { depthBias } : {}),
    ...(secret !== null ? { secret } : {}),
  };
  return Object.keys(normalized).length ? normalized : null;
}

function normalizeRoomDesignSource(value = {}) {
  if (!isPlainObject(value)) return null;
  const shape = normalizeRoomDesignShape(value.shape || value.geometry || value.shapeKind || value.kind || value.preferredShape);
  const size = normalizeRoomDesignSize(value.size || value.dimensions || value.constraints);
  const props = normalizeRoomDesignProps({
    ...(isPlainObject(value.props) ? value.props : {}),
    required: [
      ...asArray(value.props?.required),
      ...asArray(value.requiredProps),
    ],
    optional: [
      ...asArray(value.props?.optional),
      ...asArray(value.optionalProps),
    ],
  });
  const topology = normalizeRoomDesignTopology(value.topology || value.graph || value.pathing);
  const maskProfile = normalizeToken(value.maskProfile || value.mask || "");
  const detailProfile = normalizeToken(value.detailProfile || value.detailTheme || value.details || "");
  const modifiers = unique([
    ...asArray(value.modifiers),
    ...asArray(value.shapeModifiers),
  ]).map(normalizeRoomDesignModifier).filter(Boolean);
  const presetId = normalizeToken(value.presetId || value.preset || value.roomArchetype || "");

  const normalized = {
    schemaVersion: ROOM_DESIGN_SCHEMA_VERSION,
    ...(presetId ? { presetId } : {}),
    ...(shape ? { shape } : {}),
    ...(size ? { size } : {}),
    ...(modifiers.length ? { modifiers } : {}),
    ...(props ? { props } : {}),
    ...(topology ? { topology } : {}),
    ...(maskProfile ? { maskProfile } : {}),
    ...(detailProfile ? { detailProfile } : {}),
    ...(value.source ? { source: String(value.source) } : {}),
  };
  const hasDesign = Object.keys(normalized).some((key) => key !== "schemaVersion");
  return hasDesign ? normalized : null;
}

export function normalizeRoomDesign(value = {}) {
  return normalizeRoomDesignSource(value);
}

function sizeConstraintsFromArchetype(archetype = {}) {
  const presets = archetype.sizeByPreset || {};
  const floorPreset = presets.Tiny || presets.Small || presets.Medium || null;
  if (!floorPreset) return null;

  // Archetype-derived roomDesign should provide a minimum viable footprint,
  // not silently clamp every authored Size preset back to the archetype's
  // Medium dimensions. Explicit authored roomDesign can still declare max*
  // constraints; archetype presets must not make an initial Large room smaller
  // than the same Large selected from the editor menu.
  return normalizeRoomDesignSize({
    minWidthCells: floorPreset.minW,
    minHeightCells: floorPreset.minH,
  });
}

export function compileRoomArchetypeToRoomDesign(archetypeOrId = null) {
  const archetype = typeof archetypeOrId === "string"
    ? getRoomArchetypeDefinition(archetypeOrId)
    : archetypeOrId;
  if (!archetype?.id) return null;
  const requiredByArchetype = {
    "bone-well": [{ kind: "well", placement: "center", minRadiusCells: 1.5, sizeScale: 1.15 }],
    "reliquary-niche": [{ kind: "reliquary", placement: "center", sizeScale: 0.92 }],
    "hidden-reliquary": [{ kind: "reliquary", placement: "center", sizeScale: 0.92 }],
    "sealed-family-tomb": [{ kind: "sarcophagus", placement: "center", sizeScale: 1.1 }],
    "crypt-burial-cell": [{ kind: "sarcophagus", placement: "center", sizeScale: 1.0 }],
  };
  return normalizeRoomDesign({
    presetId: archetype.id,
    shape: {
      kind: archetype.shape,
      variant: archetype.roomType && archetype.roomType !== "none" ? archetype.roomType : "",
    },
    size: sizeConstraintsFromArchetype(archetype),
    props: {
      required: requiredByArchetype[archetype.id] || [],
    },
    maskProfile: archetype.maskProfile || archetype.id,
    detailProfile: archetype.detailProfile || archetype.id,
    source: `room-archetype:${archetype.id}`,
  });
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
  ].map(normalizeRoomDesign).filter(Boolean);
}

export function mergeRoomDesigns(designs = []) {
  const normalized = asArray(designs).map(normalizeRoomDesign).filter(Boolean);
  if (!normalized.length) return null;
  return normalized.reduce((merged, design) => {
    const next = {
      ...merged,
      ...design,
      schemaVersion: ROOM_DESIGN_SCHEMA_VERSION,
      shape: design.shape ? { ...(merged.shape || {}), ...design.shape } : merged.shape,
      size: design.size ? { ...(merged.size || {}), ...design.size } : merged.size,
      topology: design.topology ? { ...(merged.topology || {}), ...design.topology } : merged.topology,
      props: {
        required: [
          ...asArray(merged.props?.required),
          ...asArray(design.props?.required),
        ],
        optional: [
          ...asArray(merged.props?.optional),
          ...asArray(design.props?.optional),
        ],
      },
      modifiers: unique([
        ...asArray(merged.modifiers),
        ...asArray(design.modifiers),
      ]),
    };
    if (!next.props.required.length && !next.props.optional.length) delete next.props;
    if (!next.modifiers.length) delete next.modifiers;
    return next;
  }, { schemaVersion: ROOM_DESIGN_SCHEMA_VERSION });
}

export function resolveRoomDesign(region = {}, contextKey = "crypt", { archetype = null } = {}) {
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
  const explicitPresetId = explicitDesigns.map((design) => design.presetId).find(Boolean);
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
  return asArray(roomDesign?.props?.required).map(normalizeRoomDesignProp).filter(Boolean);
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
  return Boolean(normalized && getRoomDesignModifiers(roomDesign).includes(normalized));
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
    ...(roomDesign.detailProfile ? { detailProfile: roomDesign.detailProfile } : {}),
    ...(shapeModifiers.has("notch") ? { notch: true } : {}),
    ...(shapeModifiers.has("ruined") || shapeModifiers.has("collapsed-edge") ? { ruined: true } : {}),
  };
}

export function applyRoomDesignSizeConstraints(size = {}, roomDesign = null) {
  if (!roomDesign?.size) return size;
  const constraints = roomDesign.size;
  let w = Math.round(size.w || 4);
  let h = Math.round(size.h || 4);
  const minDiameter = constraints.minDiameterCells;
  if (Number.isFinite(minDiameter)) {
    w = Math.max(w, minDiameter);
    h = Math.max(h, minDiameter);
  }
  if (Number.isFinite(constraints.minWidthCells)) w = Math.max(w, constraints.minWidthCells);
  if (Number.isFinite(constraints.minHeightCells)) h = Math.max(h, constraints.minHeightCells);
  if (Number.isFinite(constraints.maxWidthCells)) w = Math.min(w, constraints.maxWidthCells);
  if (Number.isFinite(constraints.maxHeightCells)) h = Math.min(h, constraints.maxHeightCells);

  if (constraints.aspectRatio === "square" || roomDesign.shape?.kind === "square") {
    const d = Math.max(w, h);
    w = d;
    h = d;
  }
  if (["wide", "horizontal", "long"].includes(constraints.aspectRatio)) {
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
    while (w * h > constraints.maxAreaCells && Math.max(w, h) > 3 && guard < 24) {
      if (w >= h) w -= 1;
      else h -= 1;
      guard += 1;
    }
  }
  return { w: Math.max(3, w), h: Math.max(3, h) };
}
