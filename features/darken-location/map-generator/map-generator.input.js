function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const DEFAULT_CONFIG = {
  seed: "ossuary-042",
  context: "Crypt",
  biome: "Ossuary",
  horror: ["Religious Horror", "Gothic"],
  sourceAnchors: ["Sedlec Ossuary", "Towers of Silence"],
  roomCount: 7,
  gridSize: 20,
  mapWidth: 1600,
  mapHeight: 1000,
  showGrid: true,
  mode: "editor",
  visualStyle: "cruor",
  gridStyle: "solid",
  regions: [
    {
      id: "region-1",
      name: "Bone-Lit Vestibule",
      role: "Entrance / Threshold",
      preferredShape: "small hall",
      size: "Small",
      connectors: 2,
      tags: ["entrance", "threshold"],
      sourceAnchors: ["Sedlec Ossuary"],
      isEntrance: true,
    },
    {
      id: "region-2",
      name: "Soft-Floored Tunnel",
      role: "Connector",
      preferredShape: "hall",
      size: "Small",
      connectors: 2,
      tags: ["connector", "passage"],
      sourceAnchors: ["Decomposition"],
    },
    {
      id: "region-3",
      name: "Skyless Ossuary Well",
      role: "Setpiece / Vertical Room",
      preferredShape: "shaft",
      size: "Large",
      connectors: 3,
      tags: ["vertical", "setpiece", "hazard"],
      sourceAnchors: ["Towers of Silence"],
    },
    {
      id: "region-4",
      name: "Fog-Return Corridor",
      role: "Loop / False Return",
      preferredShape: "connector corridor-room",
      size: "Small",
      connectors: 3,
      tags: ["loop", "mist", "connector"],
      sourceAnchors: ["The Mist"],
    },
    {
      id: "region-5",
      name: "Mourning Kitchen",
      role: "Clue Room",
      preferredShape: "rect",
      size: "Medium",
      connectors: 1,
      tags: ["clue", "social"],
      sourceAnchors: ["Wax Death Masks"],
    },
    {
      id: "region-6",
      name: "Ribcage Underhall",
      role: "Main Horror Hall",
      preferredShape: "irregular polygon",
      size: "Large",
      connectors: 3,
      tags: ["main", "body horror"],
      sourceAnchors: ["Gashadokuro"],
    },
    {
      id: "region-7",
      name: "Skin-Bound Archive",
      role: "Secret / Lore Room",
      preferredShape: "library/archive-like rectangle",
      size: "Medium",
      connectors: 1,
      tags: ["secret", "lore", "archive"],
      sourceAnchors: ["Anthropodermic Bibliopegy"],
      secret: true,
    },
  ],
};

export const GENERATED_REGION_TEMPLATES = [
  {
    role: "Hazard Room",
    preferredShape: "rect",
    size: "Medium",
    tags: ["hazard"],
    sourceAnchors: ["Decomposition"],
  },
  {
    role: "Connector",
    preferredShape: "hall",
    size: "Small",
    tags: ["connector"],
    sourceAnchors: ["The Mist"],
  },
  {
    role: "Ambush / Nest",
    preferredShape: "irregular polygon",
    size: "Medium",
    tags: ["ambush", "nest"],
    sourceAnchors: ["Wolf Spiders"],
  },
  {
    role: "Outcome / Reward",
    preferredShape: "ritual chamber",
    size: "Medium",
    tags: ["outcome", "reward"],
    sourceAnchors: ["Sedlec Ossuary"],
  },
  {
    role: "Clue Room",
    preferredShape: "rect",
    size: "Small",
    tags: ["clue"],
    sourceAnchors: ["Wax Death Masks"],
  },
];


export const MAP_VISUAL_STYLES = Object.freeze([
  Object.freeze({ value: "cruor", label: "Cruor" }),
  Object.freeze({ value: "cartographic", label: "Cartographic" }),
  Object.freeze({ value: "blood", label: "Blood Ink" }),
  Object.freeze({ value: "bone", label: "Bone" }),
  Object.freeze({ value: "midnight", label: "Midnight" }),
  Object.freeze({ value: "print", label: "Print" }),
]);

const SUPPORTED_VISUAL_STYLES = new Set(
  MAP_VISUAL_STYLES.map((style) => style.value),
);

export function normalizeVisualStyle(value, fallback = DEFAULT_CONFIG.visualStyle) {
  const text = String(value || "").trim();
  if (text === "one-page-dungeon") return "cartographic";
  return SUPPORTED_VISUAL_STYLES.has(text) ? text : fallback;
}

export function normalizeMapDimension(value, fallback, { min = 400, max = 3200 } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(Math.round(parsed), min, max);
}

const SUPPORTED_CONTEXTS = new Set([
  "Crypt",
  "Chapel",
  "Cave",
  "Mine",
  "Noble House",
  "Ruins",
]);

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeRequestRegion(region, index) {
  if (!region || typeof region !== "object") return null;
  const metadata =
    region.metadata && typeof region.metadata === "object"
      ? region.metadata
      : {};
  const tags = [
    region.role,
    region.density,
    ...normalizeArray(metadata.contexts),
    ...normalizeArray(metadata.horror),
  ]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase());
  return {
    id: region.id || `region-${index + 1}`,
    name: region.label || region.name || `Location Region ${index + 1}`,
    role: region.role || "Location Region",
    preferredShape: region.shape || region.preferredShape || "rect",
    size: region.size || "Medium",
    connectors: Number(region.connectors || (index === 0 ? 2 : 1)),
    tags,
    sourceAnchors: normalizeArray(
      metadata.sourceAnchors || region.sourceAnchors,
    ),
    links: normalizeArray(region.links),
    isEntrance:
      index === 0 ||
      tags.some((tag) => tag.includes("entrance") || tag.includes("threshold")),
    isExit: tags.some((tag) => tag.includes("exit") || tag.includes("outcome")),
    secret:
      tags.some((tag) => tag.includes("secret")) || Boolean(metadata.secret),
    sourceRegionId: region.sourceRegionId,
    requestMetadata: metadata,
  };
}

export function createConfigFromNormalizedMapRequest(
  initialRequest,
  baseConfig = DEFAULT_CONFIG,
) {
  if (!initialRequest || typeof initialRequest !== "object") return baseConfig;
  const requiredRegions = normalizeArray(initialRequest.requiredRegions);
  const regions = requiredRegions
    .map((region, index) => normalizeRequestRegion(region, index))
    .filter(Boolean);
  const requestedContext = initialRequest.mapType || initialRequest.context;
  const context = SUPPORTED_CONTEXTS.has(requestedContext)
    ? requestedContext
    : baseConfig.context;
  const roomCount =
    regions.length ||
    normalizeRoomCount(initialRequest.roomCount, baseConfig.roomCount);
  return {
    ...baseConfig,
    seed: initialRequest.seed || baseConfig.seed,
    context,
    biome: context,
    roomCount,
    mapWidth: normalizeMapDimension(initialRequest.mapWidth, baseConfig.mapWidth),
    mapHeight: normalizeMapDimension(initialRequest.mapHeight, baseConfig.mapHeight),
    visualStyle: normalizeVisualStyle(initialRequest.visualStyle, baseConfig.visualStyle),
    horror: normalizeArray(initialRequest.metadata?.horror).length
      ? normalizeArray(initialRequest.metadata.horror)
      : baseConfig.horror,
    sourceAnchors: normalizeArray(initialRequest.metadata?.sourceAnchors).length
      ? normalizeArray(initialRequest.metadata.sourceAnchors)
      : baseConfig.sourceAnchors,
    regions: regions.length ? regions : baseConfig.regions,
    requiredRegions,
    dungeonBrief: initialRequest.dungeonBrief || initialRequest.metadata?.dungeonBrief || null,
    normalizedMapRequest: initialRequest,
  };
}

export function normalizeRoomCount(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(Math.round(parsed), 1, 16);
}

export function normalizeInput(config) {
  const roomCount = normalizeRoomCount(
    config.roomCount,
    config.regions?.length || 1,
  );
  const baseRegions = Array.isArray(config.regions) ? config.regions : [];
  const regions = Array.from({ length: roomCount }, (_, index) => {
    const template =
      GENERATED_REGION_TEMPLATES[index % GENERATED_REGION_TEMPLATES.length];
    const source = baseRegions[index] || template || {};
    const tags = Array.isArray(source.tags) ? source.tags : [];
    return {
      id: source.id || `region-${index + 1}`,
      name: source.name || `Generated Region ${index + 1}`,
      role:
        source.role ||
        (index === 0 ? "Entrance / Threshold" : "Location Region"),
      preferredShape: source.preferredShape || source.shape || "rect",
      size: source.size || "Medium",
      connectors: Number(source.connectors || (index === 0 ? 2 : 1)),
      tags,
      sourceAnchors: Array.isArray(source.sourceAnchors)
        ? source.sourceAnchors
        : [],
      links: Array.isArray(source.links) ? source.links : [],
      isEntrance: Boolean(source.isEntrance || index === 0),
      isExit: Boolean(source.isExit),
      secret: Boolean(source.secret || tags.includes("secret")),
      sourceRegionId: source.sourceRegionId,
      requestMetadata: source.requestMetadata,
    };
  });

  return {
    ...config,
    seed: config.seed || "cruor-map",
    roomCount,
    gridSize: Number(config.gridSize || 20),
    mapWidth: normalizeMapDimension(config.mapWidth, DEFAULT_CONFIG.mapWidth),
    mapHeight: normalizeMapDimension(config.mapHeight, DEFAULT_CONFIG.mapHeight),
    visualStyle: normalizeVisualStyle(config.visualStyle),
    regions,
    connections: Array.isArray(config.connections) ? config.connections : [],
  };
}
