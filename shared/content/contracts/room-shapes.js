export const ROOM_SHAPE_CAPABILITIES_SCHEMA_VERSION =
  "room-shape-capabilities-v1";

export const ROOM_SHAPE_SUPPORT_STATUSES = Object.freeze([
  "supported",
  "degraded",
  "unsupported",
]);

const ALL_IMPLEMENTED_MODIFIERS = Object.freeze([
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

function withoutModifiers(...excluded) {
  const excludedSet = new Set(excluded);
  return ALL_IMPLEMENTED_MODIFIERS.filter(
    (modifier) => !excludedSet.has(modifier),
  );
}

function defineShape(definition) {
  return Object.freeze({
    support: "supported",
    supportsCustomSize: true,
    editorSelectable: true,
    supportedModifiers: ALL_IMPLEMENTED_MODIFIERS,
    minWidthCells: 3,
    minHeightCells: 3,
    ...definition,
  });
}

export const ROOM_SHAPE_DEFINITIONS = Object.freeze([
  defineShape({
    id: "rect",
    label: "Standard",
    family: "orthogonal",
    geometry: "rectangle",
    editorGroup: "basic",
  }),
  defineShape({
    id: "square",
    label: "Square",
    family: "orthogonal",
    geometry: "square",
    editorGroup: "basic",
    forceSquare: true,
  }),
  defineShape({
    id: "hall",
    label: "Hall",
    family: "linear",
    geometry: "hall",
    editorGroup: "linear",
    minWidthCells: 5,
    minHeightCells: 3,
    preferredAspectRatio: "long",
  }),
  defineShape({
    id: "gallery",
    label: "Gallery",
    family: "linear",
    geometry: "gallery",
    editorGroup: "linear",
    minWidthCells: 7,
    minHeightCells: 3,
    preferredAspectRatio: "long",
  }),
  defineShape({
    id: "circle",
    label: "Circle",
    family: "curved",
    geometry: "circle",
    editorGroup: "curved",
    forceSquare: true,
    supportedModifiers: withoutModifiers("chamfered-corners"),
  }),
  defineShape({
    id: "oval",
    label: "Oval",
    family: "curved",
    geometry: "oval",
    editorGroup: "curved",
    minWidthCells: 5,
    minHeightCells: 4,
    supportedModifiers: withoutModifiers("chamfered-corners"),
  }),
  defineShape({
    id: "shaft",
    label: "Shaft",
    family: "curved",
    geometry: "shaft",
    editorGroup: "curved",
    forceSquare: true,
    minWidthCells: 5,
    minHeightCells: 5,
    supportedModifiers: withoutModifiers(
      "side-alcoves",
      "secret-recess",
      "chamfered-corners",
    ),
  }),
  defineShape({
    id: "l-shape",
    label: "L-Shape",
    family: "orthogonal-composite",
    geometry: "l-shape",
    editorGroup: "composite",
    minWidthCells: 5,
    minHeightCells: 5,
  }),
  defineShape({
    id: "t-shape",
    label: "T-Shape",
    family: "orthogonal-composite",
    geometry: "t-shape",
    editorGroup: "composite",
    minWidthCells: 5,
    minHeightCells: 5,
  }),
  defineShape({
    id: "cross",
    label: "Cross",
    family: "orthogonal-composite",
    geometry: "cross",
    editorGroup: "composite",
    minWidthCells: 5,
    minHeightCells: 5,
  }),
  defineShape({
    id: "alcove",
    label: "Alcove Chamber",
    family: "recessed",
    geometry: "alcove",
    editorGroup: "specialized",
    minWidthCells: 4,
    minHeightCells: 4,
  }),
  defineShape({
    id: "niche",
    label: "Niche",
    family: "recessed",
    geometry: "niche",
    editorGroup: "specialized",
    minWidthCells: 4,
    minHeightCells: 4,
    supportedModifiers: withoutModifiers(
      "side-alcoves",
      "central-void",
      "chamfered-corners",
    ),
  }),
  defineShape({
    id: "archive",
    label: "Archive",
    family: "specialized",
    geometry: "archive",
    editorGroup: "specialized",
    minWidthCells: 5,
    minHeightCells: 4,
  }),
  defineShape({
    id: "apse",
    label: "Apse",
    family: "specialized",
    geometry: "apse",
    editorGroup: "specialized",
    minWidthCells: 5,
    minHeightCells: 5,
  }),
  defineShape({
    id: "ritual",
    label: "Ritual Chamber",
    family: "radial",
    geometry: "ritual",
    editorGroup: "specialized",
    minWidthCells: 5,
    minHeightCells: 5,
    forceSquare: true,
    supportedModifiers: withoutModifiers("chamfered-corners"),
  }),
  defineShape({
    id: "irregular",
    label: "Irregular",
    family: "structured-irregular",
    geometry: "irregular",
    editorGroup: "irregular",
    minWidthCells: 5,
    minHeightCells: 5,
    supportedModifiers: withoutModifiers("chamfered-corners"),
  }),
  defineShape({
    id: "broken",
    label: "Broken Room",
    family: "damaged",
    geometry: "broken",
    editorGroup: "irregular",
    minWidthCells: 5,
    minHeightCells: 5,
  }),
  defineShape({
    id: "cave",
    label: "Cave",
    family: "organic",
    geometry: "cave",
    editorGroup: "irregular",
    editorSelectable: false,
    minWidthCells: 5,
    minHeightCells: 5,
    supportedModifiers: withoutModifiers("chamfered-corners"),
  }),
]);

export const ROOM_SHAPE_DEFINITIONS_BY_ID = Object.freeze(
  Object.fromEntries(
    ROOM_SHAPE_DEFINITIONS.map((definition) => [definition.id, definition]),
  ),
);

export const ROOM_SHAPE_KIND_OPTIONS = Object.freeze(
  ROOM_SHAPE_DEFINITIONS.map((definition) => definition.id),
);

export function getRoomShapeDefinition(kind = "") {
  return ROOM_SHAPE_DEFINITIONS_BY_ID[String(kind || "").trim()] || null;
}

export function getSupportedRoomShapeDefinitions() {
  return ROOM_SHAPE_DEFINITIONS.filter(
    (definition) => definition.support === "supported",
  );
}

export function getSupportedRoomShapeKinds() {
  return getSupportedRoomShapeDefinitions().map((definition) => definition.id);
}

export function getSupportedRoomModifiersByShape() {
  return Object.fromEntries(
    getSupportedRoomShapeDefinitions().map((definition) => [
      definition.id,
      [...definition.supportedModifiers],
    ]),
  );
}

export function getRoomShapeSupport(kind = "") {
  const definition = getRoomShapeDefinition(kind);
  if (!definition) {
    return {
      kind: String(kind || "").trim(),
      status: "unsupported",
      reason: "The room shape is not registered by the shared contract.",
    };
  }
  return {
    kind: definition.id,
    status: definition.support,
    reason: definition.degradationReason || definition.unsupportedReason || "",
    definition,
  };
}
