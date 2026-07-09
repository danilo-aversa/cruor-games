export const MAP_DEBUG_CATEGORY_DEFINITIONS = Object.freeze([
  {
    id: "room-move",
    label: "Room Move",
    editorIcon: "arrows-up-down-left-right",
    composerIcon: "fa-solid fa-up-down-left-right",
    description: "Room drag, room position and room movement events.",
    match: ["moveroom", "room drag"],
  },
  {
    id: "corridor-move",
    label: "Corridor Move",
    editorIcon: "route",
    composerIcon: "fa-solid fa-route",
    description: "Existing corridor endpoint, door and waypoint movement events.",
    match: [
      "movedoor",
      "movewaypoint",
      "insertwaypoint",
      "deletewaypoint",
      "corridor handle",
      "waypoint",
    ],
  },
  {
    id: "corridor-create",
    label: "Corridor Create",
    editorIcon: "draw-polygon",
    composerIcon: "fa-solid fa-plus",
    description: "New corridor drafts, target acquisition and commit events.",
    match: ["createconnection", "connection draft", "wall drag"],
  },
  {
    id: "levels",
    label: "Levels / Stairs",
    editorIcon: "stairs",
    composerIcon: "fa-solid fa-stairs",
    description: "Room levels, level view and stair transition events.",
    match: ["level", "stair"],
  },
  {
    id: "room-style",
    label: "Shape / Size",
    editorIcon: "vector-square",
    composerIcon: "fa-solid fa-shapes",
    description: "Room shape, size and style override events.",
    match: ["room style", "updateroomstyle", "resetroomstyle", "shape", "size"],
  },
  {
    id: "manual-overrides",
    label: "Manual Overrides",
    editorIcon: "pen-to-square",
    composerIcon: "fa-solid fa-sliders",
    description: "Manual override state snapshots and mutations.",
    match: ["manualoverride", "manual edit", "setmanualoverrides"],
  },
  {
    id: "generated-map",
    label: "Generated Map",
    editorIcon: "map",
    composerIcon: "fa-solid fa-map",
    description: "Generated map snapshots, regions, corridors and accesses.",
    match: ["generatedmap", "generated map"],
  },
  {
    id: "anchor-trace",
    label: "Anchor Trace",
    editorIcon: "location-crosshairs",
    composerIcon: "fa-solid fa-location-dot",
    description: "Anchor snap, release and endpoint trace events.",
    match: ["anchor trace"],
  },
  {
    id: "performance",
    label: "Performance",
    editorIcon: "gauge-high",
    composerIcon: "fa-solid fa-gauge-high",
    description: "Runner, lifecycle, timing and diagnostic events.",
    match: ["performance", "runner", "timing"],
  },
]);

export const MAP_QA_SCENARIO_DEFINITIONS = Object.freeze([
  {
    id: "smoke",
    label: "Smoke Test",
    editorIcon: "vial-circle-check",
    composerIcon: "fa-solid fa-vial",
    description: "Run a short map-edit sanity pass.",
  },
  {
    id: "circle-anchor-sweep",
    label: "Circle Anchor Test",
    editorIcon: "circle-nodes",
    composerIcon: "fa-regular fa-circle-dot",
    description: "Move a circular-room corridor endpoint across several anchors.",
  },
  {
    id: "corridor-create",
    label: "Corridor Creation Test",
    editorIcon: "draw-polygon",
    composerIcon: "fa-solid fa-diagram-project",
    description: "Create or reuse a corridor and verify endpoint stability.",
  },
  {
    id: "level-stairs",
    label: "Room Level → Stairs Test",
    editorIcon: "stairs",
    composerIcon: "fa-solid fa-stairs",
    description: "Set connected room levels and verify derived stair metadata and marker count.",
  },
  {
    id: "level-view",
    label: "Level View Test",
    editorIcon: "layer-group",
    composerIcon: "fa-solid fa-layer-group",
    description: "Switch Level View and verify active rooms, faded rooms, and the cross-level stair connector.",
  },
  {
    id: "room-move-reroute",
    label: "Room Move + Reroute",
    editorIcon: "arrows-up-down-left-right",
    composerIcon: "fa-solid fa-arrows-to-circle",
    description: "Move a room and verify corridors are not duplicated.",
  },
]);

function projectDefinition(definition, iconKey) {
  return {
    id: definition.id,
    label: definition.label,
    icon: definition[iconKey],
    description: definition.description,
  };
}

export function getEditorMapDebugCategories() {
  return MAP_DEBUG_CATEGORY_DEFINITIONS.map((definition) => projectDefinition(definition, "editorIcon"));
}

export function getComposerMapDebugCategories() {
  return MAP_DEBUG_CATEGORY_DEFINITIONS.map((definition) => projectDefinition(definition, "composerIcon"));
}

export function getEditorMapQaScenarios() {
  return MAP_QA_SCENARIO_DEFINITIONS.map((definition) => projectDefinition(definition, "editorIcon"));
}

export function getComposerMapQaScenarios() {
  return MAP_QA_SCENARIO_DEFINITIONS.map((definition) => projectDefinition(definition, "composerIcon"));
}

export function createDefaultMapDebugCategories(categories = MAP_DEBUG_CATEGORY_DEFINITIONS) {
  return categories.reduce((next, category) => ({ ...next, [category.id]: true }), {});
}

export function getMapDebugCategory(label = "") {
  const normalized = String(label).toLowerCase();
  const matchedCategory = MAP_DEBUG_CATEGORY_DEFINITIONS.find((category) =>
    category.match.some((pattern) => normalized.includes(pattern)),
  );
  return matchedCategory?.id || "performance";
}
