import { DEFAULT_CONFIG } from "../map-generator.input.js";
import { generateMap } from "../map-generator.pipeline.js";
import {
  getNonEndpointRoomTunnelHits,
  getRoomCellOwnershipMap,
} from "../map-generator.corridors.js";

export const MAP_BATCH_QA_VERSION = "map-qa-v0.5.1-safe-context-adapters";
export const MAP_ADAPTER_QA_VERSION = "map-adapter-qa-v0.4.0-noble-house-baseline-repair";
export const MAP_VISUAL_QA_VERSION = "map-visual-qa-v0.6.0-gallery-index";

const DEFAULT_CONTEXTS = Object.freeze([
  "Crypt",
  "Chapel",
  "Cave",
  "Mine",
  "Noble House",
  "Ruins",
]);

export const MAP_BATCH_QA_CONTEXTS = DEFAULT_CONTEXTS;

export const MAP_BATCH_CONTEXT_OPTIONS = Object.freeze([
  Object.freeze({ value: "mixed", label: "Mixed" }),
  ...DEFAULT_CONTEXTS.map((context) => Object.freeze({ value: context, label: context })),
]);

export const MAP_BATCH_QA_MODES = Object.freeze([
  Object.freeze({ value: "realistic", label: "Realistic", description: "Balanced QA run for normal validation." }),
  Object.freeze({ value: "debug", label: "Debug", description: "Includes per-map debug payloads for inspection." }),
]);

export const MAP_BATCH_DETERMINISM_MODES = Object.freeze([
  Object.freeze({ value: "sample", label: "Sample", description: "Checks determinism on representative maps." }),
  Object.freeze({ value: "full", label: "Full", description: "Checks determinism on every generated map." }),
  Object.freeze({ value: "off", label: "Off", description: "Skips determinism checks for faster local iteration." }),
]);

export const MAP_BATCH_QA_DETERMINISM_MODES = MAP_BATCH_DETERMINISM_MODES;

export const MAP_BATCH_EXPORT_MODES = Object.freeze([
  Object.freeze({ value: "json", label: "JSON", extension: "json", mimeType: "application/json" }),
  Object.freeze({ value: "markdown", label: "Markdown", extension: "md", mimeType: "text/markdown" }),
]);

export const MAP_CONTEXT_GRAPH_ADAPTER_MODES = Object.freeze([
  Object.freeze({ value: "off", label: "Baseline", description: "Inferred graph with context adapters disabled." }),
  Object.freeze({ value: "safe", label: "Safe Adapters", description: "Promote only QA-neutral adapters: Crypt, Mine, and Ruins." }),
  Object.freeze({ value: "crypt", label: "Crypt Adapter", description: "Crypt spine with side crypt branches." }),
  Object.freeze({ value: "mine", label: "Mine Adapter", description: "Mine tunnel trunk with extraction branches." }),
  Object.freeze({ value: "ruins", label: "Ruins Adapter", description: "Ruins broken path with collapsed shortcuts." }),
  Object.freeze({ value: "noble-house", label: "Noble House Adapter", description: "QA-neutral house circulation adapter using the stable baseline topology." }),
  Object.freeze({ value: "all", label: "All Context Adapters", description: "Enable any adapter that matches the generated context." }),
]);

export const MAP_ADAPTER_QA_DEFAULT_MODES = Object.freeze(["off", "safe", "crypt", "mine", "ruins", "noble-house"]);

export const MAP_VISUAL_QA_DEFAULT_OPTIONS = Object.freeze({
  samplesPerContext: 2,
  samplesPerTheme: 2,
  context: "mixed",
  theme: "mixed",
  roomCountMin: 6,
  roomCountMax: 10,
  seed: "cruor-map-visual-qa",
  contextGraphAdapterMode: "safe",
  showGrid: true,
  showNames: true,
  showProps: true,
});

const MAP_VISUAL_CONTEXT_CUES = Object.freeze({
  Crypt: Object.freeze(["tomb cues", "bones", "pillars", "altar/statue markers"]),
  Chapel: Object.freeze(["pews", "altar", "pillars", "statue markers"]),
  Cave: Object.freeze(["stalagmites", "pooled water", "sinkholes/pits", "rough rock/rubble", "misty squeeze passages"]),
  Mine: Object.freeze(["rails", "supports", "rubble", "shafts/pits"]),
  "Noble House": Object.freeze(["tables/desks", "beds/shelves/chests", "fireplace", "courtyard cue"]),
  Ruins: Object.freeze(["broken walls", "rubble", "pillars", "statue fragments"]),
});

const MAP_VISUAL_CONTEXT_CUE_KINDS = Object.freeze({
  Crypt: Object.freeze(["altar", "bones", "pillar", "statue", "tomb"]),
  Chapel: Object.freeze(["altar", "pew", "pillar", "statue"]),
  Cave: Object.freeze(["fog", "pit", "rubble", "stalagmite", "water"]),
  Mine: Object.freeze(["mine-rail", "mine-support", "pit", "rubble", "stalagmite"]),
  "Noble House": Object.freeze(["bed", "chest", "courtyard", "desk", "fireplace", "shelf", "table"]),
  Ruins: Object.freeze(["broken-wall", "pillar", "rubble", "statue"]),
});

const MAP_VISUAL_THEME_QA_THEMES = Object.freeze([
  Object.freeze({
    key: "sedlec-ossuary",
    name: "Sedlec Ossuary",
    context: "Crypt",
    sourceAnchors: Object.freeze(["Sedlec Ossuary"]),
  }),
  Object.freeze({
    key: "decomposition",
    name: "Decomposition",
    context: "Cave",
    sourceAnchors: Object.freeze(["Decomposition"]),
  }),
  Object.freeze({
    key: "towers-of-silence",
    name: "Towers of Silence",
    context: "Ruins",
    sourceAnchors: Object.freeze(["Towers of Silence"]),
  }),
  Object.freeze({
    key: "the-mist",
    name: "The Mist",
    context: "Ruins",
    sourceAnchors: Object.freeze(["The Mist"]),
  }),
  Object.freeze({
    key: "wolf-spiders",
    name: "Wolf Spiders",
    context: "Cave",
    sourceAnchors: Object.freeze(["Wolf Spiders"]),
  }),
]);

const MAP_VISUAL_THEME_CUES = Object.freeze({
  "sedlec-ossuary": Object.freeze(["skull/bone ossuary marks", "reliquary/statue cues", "bone chapel furniture"]),
  decomposition: Object.freeze(["rot gas", "seeping wet decay", "soft collapse/rubble cues"]),
  "towers-of-silence": Object.freeze(["exposure wells", "sun-bleached bones", "ritual boundary/statue cues"]),
  "the-mist": Object.freeze(["fog banks", "wet glass/condensation", "panic clue markers"]),
  "wolf-spiders": Object.freeze(["webs", "egg sacs", "victim/bone cache cues"]),
});

const MAP_VISUAL_THEME_CUE_KINDS = Object.freeze({
  "sedlec-ossuary": Object.freeze(["altar", "bones", "pillar", "statue", "tomb"]),
  decomposition: Object.freeze(["bones", "fog", "pit", "rubble", "water"]),
  "towers-of-silence": Object.freeze(["altar", "bones", "pillar", "pit", "statue"]),
  "the-mist": Object.freeze(["clue-marker", "fog", "pit", "water"]),
  "wolf-spiders": Object.freeze(["bones", "egg-sac", "fog", "pit", "web"]),
});


const CONTEXT_GRAPH_ADAPTER_KEYS = Object.freeze(["crypt", "mine", "ruins", "noble-house"]);
const SAFE_CONTEXT_GRAPH_ADAPTER_KEYS = Object.freeze(["crypt", "mine", "ruins"]);

function normalizeAdapterContextKey(value = "") {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (normalized === "noble" || normalized === "noblehouse") return "noble-house";
  if (normalized === "noble-house") return "noble-house";
  if (normalized === "crypt" || normalized === "mine" || normalized === "ruins") return normalized;
  return normalized;
}

function getAdapterModeKeys(mode = "off") {
  const normalized = normalizeContextGraphAdapterMode(mode, "off");
  if (normalized === "safe") return SAFE_CONTEXT_GRAPH_ADAPTER_KEYS;
  if (normalized === "all" || normalized === "hard") return CONTEXT_GRAPH_ADAPTER_KEYS;
  return CONTEXT_GRAPH_ADAPTER_KEYS.includes(normalized) ? [normalized] : [];
}

function getAdapterEdgeMatch(edge, adapterKeys = []) {
  if (!edge || adapterKeys.length === 0) return null;
  const haystack = [edge.id, edge.kind, edge.reason]
    .map((part) => String(part || "").toLowerCase())
    .join(" ");
  return adapterKeys.find((key) => haystack.includes(key));
}

function getAdapterRuntimeUsage(map, mode = "off", context = "") {
  const normalizedMode = normalizeContextGraphAdapterMode(mode, "off");
  const adapterKeys = getAdapterModeKeys(normalizedMode);
  if (normalizedMode === "off" || adapterKeys.length === 0) {
    return {
      mode: normalizedMode,
      status: "baseline",
      contextKey: normalizeAdapterContextKey(context),
      applicable: false,
      used: false,
      fallback: false,
      adapterEdgeCount: 0,
      matchedAdapters: [],
      matchedReasons: [],
    };
  }

  const contextKey = normalizeAdapterContextKey(context || map?.config?.context || map?.config?.biome);
  const applicable = normalizedMode === "all" || normalizedMode === "hard"
    ? CONTEXT_GRAPH_ADAPTER_KEYS.includes(contextKey)
    : adapterKeys.includes(contextKey);
  const matchedEdges = asArray(map?.graph).filter((edge) => getAdapterEdgeMatch(edge, adapterKeys));
  const matchedAdapters = unique(matchedEdges.map((edge) => getAdapterEdgeMatch(edge, adapterKeys)).filter(Boolean));
  const matchedReasons = unique(matchedEdges.map((edge) => edge.reason || edge.id).filter(Boolean)).slice(0, 8);
  const used = matchedEdges.length > 0;

  return {
    mode: normalizedMode,
    status: !applicable ? "not-applicable" : used ? "used" : "fallback",
    contextKey,
    applicable,
    used,
    fallback: Boolean(applicable && !used),
    adapterEdgeCount: matchedEdges.length,
    matchedAdapters,
    matchedReasons,
  };
}


export const MAP_BATCH_QA_DEFAULT_OPTIONS = Object.freeze({
  count: 50,
  context: "mixed",
  qaMode: "realistic",
  mode: "realistic",
  determinism: "sample",
  determinismSampleRate: 10,
  roomCountMin: 4,
  roomCountMax: 12,
  seed: "cruor-map-npm-qa",
  exportMode: "json",
  contextGraphAdapterMode: "safe",
});

export const MAP_BATCH_DEFAULT_OPTIONS = MAP_BATCH_QA_DEFAULT_OPTIONS;

export const MAP_BATCH_QA_COUNT_OPTIONS = Object.freeze([
  Object.freeze({ value: 25, label: "25", description: "Fast smoke check." }),
  Object.freeze({ value: 50, label: "50", description: "Default local QA run." }),
  Object.freeze({ value: 100, label: "100", description: "Broader validation pass." }),
  Object.freeze({ value: 250, label: "250", description: "Full debug-sized QA pass." }),
]);

export const MAP_BATCH_COUNT_OPTIONS = MAP_BATCH_QA_COUNT_OPTIONS;

export const MAP_BATCH_QA_ROOM_COUNT_OPTIONS = Object.freeze([
  Object.freeze({ value: "4-8", label: "4–8", roomCountMin: 4, roomCountMax: 8 }),
  Object.freeze({ value: "4-12", label: "4–12", roomCountMin: 4, roomCountMax: 12 }),
  Object.freeze({ value: "6-14", label: "6–14", roomCountMin: 6, roomCountMax: 14 }),
]);

export const MAP_BATCH_ROOM_COUNT_OPTIONS = MAP_BATCH_QA_ROOM_COUNT_OPTIONS;


const QA_ROOM_BLUEPRINTS = Object.freeze([
  Object.freeze({ role: "Entrance / Threshold", shape: "small hall", size: "Small", tags: ["entrance", "threshold"], connectors: 2 }),
  Object.freeze({ role: "Connector", shape: "hall", size: "Small", tags: ["connector", "passage"], connectors: 2 }),
  Object.freeze({ role: "Clue Room", shape: "rect", size: "Medium", tags: ["clue", "investigation"], connectors: 2 }),
  Object.freeze({ role: "Hazard Room", shape: "irregular polygon", size: "Medium", tags: ["hazard", "pressure"], connectors: 3 }),
  Object.freeze({ role: "Loop / False Return", shape: "connector corridor-room", size: "Small", tags: ["loop", "connector"], connectors: 3 }),
  Object.freeze({ role: "Main Horror Hall", shape: "ritual chamber", size: "Large", tags: ["main", "setpiece"], connectors: 3 }),
  Object.freeze({ role: "Side Chamber", shape: "alcove", size: "Small", tags: ["side", "branch"], connectors: 1 }),
  Object.freeze({ role: "Secret / Lore Room", shape: "archive", size: "Medium", tags: ["secret", "lore"], connectors: 1, secret: true }),
  Object.freeze({ role: "Vertical Room", shape: "shaft", size: "Large", tags: ["vertical", "transition"], connectors: 2 }),
  Object.freeze({ role: "Outcome / Reward", shape: "rect", size: "Medium", tags: ["outcome", "reward"], connectors: 1 }),
  Object.freeze({ role: "Ambush / Nest", shape: "broken", size: "Medium", tags: ["ambush", "nest"], connectors: 2 }),
  Object.freeze({ role: "Final Chamber", shape: "ritual chamber", size: "Large", tags: ["final", "climax"], connectors: 2 }),
  Object.freeze({ role: "Service Room", shape: "rect", size: "Small", tags: ["utility", "side"], connectors: 1 }),
  Object.freeze({ role: "Archive / Evidence", shape: "archive", size: "Medium", tags: ["archive", "clue"], connectors: 2 }),
  Object.freeze({ role: "Ruin Breach", shape: "ruined-rect", size: "Medium", tags: ["ruined", "breach"], connectors: 2 }),
  Object.freeze({ role: "Hidden Exit", shape: "small hall", size: "Small", tags: ["exit", "secret"], connectors: 1, secret: true }),
]);

const ISSUE_WEIGHTS = Object.freeze({ error: 0, warning: 1, info: 2 });

function clampInteger(value, min, max, fallback = min) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function roundTo(value, decimals = 2) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const precision = 10 ** clampInteger(decimals, 0, 6, 2);
  return Math.round(parsed * precision) / precision;
}

function normalizeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function unique(values) {
  return [...new Set(asArray(values).map((value) => String(value)).filter(Boolean))];
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value);
}

function getVisualQaGalleryPreviewPath(preview = {}) {
  const rawPath = String(preview.svgPath || preview.filename || "");
  const filename = rawPath.split(/[\/]/).pop();
  return filename || "";
}

function getVisualQaGalleryStatus(preview = {}) {
  const contextStatus = preview.visualCueUsage?.status || "unknown";
  const themeStatus = preview.themeKey ? preview.themeCueUsage?.status || "unknown" : "not-supported";
  if (preview.themeKey) return themeStatus === "rendered" && contextStatus === "rendered" ? "rendered" : themeStatus;
  return contextStatus;
}


function getContextPool(context = "mixed") {
  const requested = normalizeText(context, "mixed");
  if (requested.toLowerCase() === "mixed") return DEFAULT_CONTEXTS;
  return DEFAULT_CONTEXTS.includes(requested) ? [requested] : DEFAULT_CONTEXTS;
}

function normalizeContextGraphAdapterMode(value, fallback = "off") {
  const raw = getOptionValue(value, fallback);
  const normalized = String(raw || fallback || "off").trim().toLowerCase();
  if (!normalized || normalized === "baseline") return "off";
  if (normalized === "default" || normalized === "auto" || normalized === "recommended") return "safe";
  if (normalized === "enabled" || normalized === "true" || normalized === "adapter") return "hard";
  if (normalized === "noble house") return "noble-house";
  const allowed = new Set(MAP_CONTEXT_GRAPH_ADAPTER_MODES.map((mode) => mode.value));
  if (allowed.has(normalized) || normalized === "hard") return normalized;
  return fallback || "off";
}

function normalizeAdapterQaModes(value) {
  const rawModes = Array.isArray(value)
    ? value
    : typeof value === "string" && value.trim()
      ? value.split(",")
      : MAP_ADAPTER_QA_DEFAULT_MODES;
  const modes = unique(rawModes.map((mode) => normalizeContextGraphAdapterMode(mode, "off")));
  return modes.includes("off") ? modes : ["off", ...modes];
}

function pickFrom(values, index) {
  return values[index % Math.max(1, values.length)];
}

function getQaCryptRoomArchetype(source = {}, context = "", index = 0, isLast = false) {
  if (context !== "Crypt") return "";
  const tags = asArray(source.tags).map((tag) => String(tag).toLowerCase());
  const text = `${source.role || ""} ${source.shape || ""} ${tags.join(" ")}`.toLowerCase();
  if (tags.includes("entrance") || tags.includes("connector") || text.includes("corridor") || text.includes("hall")) {
    return "processional-crypt-hall";
  }
  if (tags.includes("vertical") || text.includes("shaft") || text.includes("well")) return "bone-well";
  if (source.secret || tags.includes("secret") || tags.includes("lore")) return "hidden-reliquary";
  if (tags.includes("archive") || tags.includes("clue")) return index % 2 === 0 ? "reliquary-niche" : "hidden-reliquary";
  if (isLast || tags.includes("main") || tags.includes("hazard") || tags.includes("ambush")) return "charnel-vault";
  if (tags.includes("side") || tags.includes("branch")) return index % 2 === 0 ? "crypt-burial-cell" : "ossuary-gallery";
  return "sealed-family-tomb";
}

function createQaRegions({ roomCount, context, seed, sourceAnchors = ["Sedlec Ossuary"] }) {
  return Array.from({ length: roomCount }, (_, index) => {
    const blueprint = QA_ROOM_BLUEPRINTS[index % QA_ROOM_BLUEPRINTS.length];
    const isLast = index === roomCount - 1;
    const source = isLast && roomCount > 2 ? QA_ROOM_BLUEPRINTS[11] : blueprint;
    const tags = unique([
      ...(source.tags || []),
      context.toLowerCase(),
      index === 0 ? "entrance" : "",
      isLast ? "final" : "",
    ]);
    const roomArchetype = getQaCryptRoomArchetype(source, context, index, isLast);
    return {
      id: `qa-region-${String(index + 1).padStart(2, "0")}`,
      name: `${String(index + 1).padStart(2, "0")} ${source.role}`,
      role: source.role,
      preferredShape: source.shape,
      roomArchetype,
      size: source.size,
      connectors: source.connectors,
      tags,
      sourceAnchors,
      links: [],
      isEntrance: index === 0,
      isExit: isLast,
      secret: Boolean(source.secret || tags.includes("secret")),
      sourceRegionId: `qa-source-region-${index + 1}`,
      requestMetadata: {
        contexts: [context],
        horror: ["Religious Horror"],
        sourceAnchors,
      },
    };
  });
}

function addQaConnection(connections, from, to, options = {}) {
  if (!from?.id || !to?.id || from.id === to.id) return;
  const duplicate = connections.some(
    (connection) =>
      (connection.from === from.id && connection.to === to.id) ||
      (connection.from === to.id && connection.to === from.id),
  );
  if (duplicate) return;
  connections.push({
    id: options.id || `qa-explicit-${connections.length + 1}-${from.id}-${to.id}`,
    from: from.id,
    to: to.id,
    kind: options.kind || "main",
    secret: Boolean(options.secret),
    tags: unique(["qa", "explicit", ...(options.tags || [])]),
    reason: options.reason || "qa-explicit-connection",
  });
}

function createQaConnections(regions = [], runIndex = 0) {
  if (!Array.isArray(regions) || regions.length <= 1) return [];
  const connections = [];
  const entrance = regions[0];
  const finalRoom = regions[regions.length - 1];
  const middle = regions.slice(1, -1);
  const connector = middle.find((region) => asArray(region.tags).includes("connector"));
  const clue = middle.find((region) => asArray(region.tags).includes("clue") || asArray(region.tags).includes("archive"));
  const hazard = middle.find((region) => asArray(region.tags).includes("hazard") || asArray(region.tags).includes("ambush"));
  const mainPath = [];
  [entrance, connector, clue, hazard, finalRoom].forEach((region) => {
    if (region && !mainPath.some((item) => item.id === region.id)) mainPath.push(region);
  });
  if (mainPath.length < 2) {
    regions.slice(0, Math.min(regions.length, 4)).forEach((region) => mainPath.push(region));
  }

  for (let index = 0; index < mainPath.length - 1; index += 1) {
    addQaConnection(connections, mainPath[index], mainPath[index + 1], {
      id: `qa-explicit-main-${index + 1}`,
      kind: "main",
      tags: ["critical-path"],
      reason: "qa-explicit-compact-main-path",
    });
  }

  const mainIds = new Set(mainPath.map((region) => region.id));
  regions.forEach((region, index) => {
    if (mainIds.has(region.id)) return;
    const isSecret = Boolean(region.secret || asArray(region.tags).includes("secret"));
    const isService = asArray(region.tags).includes("utility") || asArray(region.tags).includes("side");
    const anchor = isSecret
      ? mainPath[Math.max(0, mainPath.length - 2)] || entrance
      : mainPath[Math.max(0, Math.min(mainPath.length - 1, index % Math.max(1, mainPath.length - 1)))] || entrance;
    addQaConnection(connections, anchor, region, {
      id: `qa-explicit-branch-${region.id}`,
      kind: isSecret ? "secret" : isService ? "service" : "secondary",
      secret: isSecret,
      tags: [isSecret ? "secret" : isService ? "service" : "branch"],
      reason: isSecret ? "qa-explicit-secret-branch" : "qa-explicit-side-branch",
    });
  });

  if (mainPath.length >= 4 && runIndex % 3 === 0) {
    addQaConnection(connections, mainPath[1], mainPath[Math.min(mainPath.length - 1, 3)], {
      id: "qa-explicit-secondary-loop",
      kind: "secondary",
      tags: ["loop"],
      reason: "qa-explicit-secondary-loop",
    });
  }

  return connections;
}

function createQaConfig({ seed, index, roomCount, context, contextGraphAdapterMode = "off", sourceAnchors, themeId = "", themeName = "" }) {
  const resolvedSourceAnchors = Array.isArray(sourceAnchors) ? sourceAnchors : ["Sedlec Ossuary", "Towers of Silence"];
  const regions = createQaRegions({ roomCount, context, seed, sourceAnchors: resolvedSourceAnchors });
  return {
    ...DEFAULT_CONFIG,
    seed,
    context,
    biome: context,
    roomCount,
    horror: ["Religious Horror", index % 2 === 0 ? "Gothic" : "Body Horror"],
    sourceAnchors: resolvedSourceAnchors,
    themeId,
    themeName,
    regions,
    connections: createQaConnections(regions, index),
    contextGraphAdapterMode,
  };
}

function getCellList(corridor) {
  if (!corridor || typeof corridor !== "object") return [];
  if (Array.isArray(corridor.pathCells) && corridor.pathCells.length > 0) return corridor.pathCells;
  if (Array.isArray(corridor.floorCells) && corridor.floorCells.length > 0) return corridor.floorCells;
  if (Array.isArray(corridor.cells) && corridor.cells.length > 0) return corridor.cells;
  return [];
}

function cellKey(cellOrX, y) {
  if (typeof cellOrX === "object") return `${cellOrX.x},${cellOrX.y}`;
  return `${cellOrX},${y}`;
}

function getCellBounds(cells) {
  if (!Array.isArray(cells) || cells.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  const xs = cells.map((cell) => Number(cell.x)).filter(Number.isFinite);
  const ys = cells.map((cell) => Number(cell.y)).filter(Number.isFinite);
  if (xs.length === 0 || ys.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function getLongestStraightRun(cells) {
  if (!Array.isArray(cells) || cells.length < 2) return cells?.length || 0;
  let longest = 1;
  let current = 1;
  let previousAxis = null;
  for (let index = 1; index < cells.length; index += 1) {
    const previous = cells[index - 1];
    const currentCell = cells[index];
    const dx = Math.sign(Number(currentCell.x) - Number(previous.x));
    const dy = Math.sign(Number(currentCell.y) - Number(previous.y));
    const axis = dx !== 0 ? "x" : dy !== 0 ? "y" : previousAxis;
    if (axis && axis === previousAxis) current += 1;
    else current = 2;
    previousAxis = axis;
    longest = Math.max(longest, current);
  }
  return longest;
}

function getRegionCenter(region) {
  const rect = region?.cellRect;
  if (!rect) return null;
  return {
    x: Number(rect.x) + Number(rect.w || 0) / 2,
    y: Number(rect.y) + Number(rect.h || 0) / 2,
  };
}

function getDistance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(Number(a.x) - Number(b.x), Number(a.y) - Number(b.y));
}

function getRoomBounds(regions) {
  const rects = asArray(regions).map((region) => region.cellRect).filter(Boolean);
  if (!rects.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, area: 0 };
  const minX = Math.min(...rects.map((rect) => Number(rect.x)));
  const minY = Math.min(...rects.map((rect) => Number(rect.y)));
  const maxX = Math.max(...rects.map((rect) => Number(rect.x) + Number(rect.w || 0)));
  const maxY = Math.max(...rects.map((rect) => Number(rect.y) + Number(rect.h || 0)));
  const width = Math.max(0, maxX - minX);
  const height = Math.max(0, maxY - minY);
  return { minX, minY, maxX, maxY, width, height, area: width * height };
}

function getAverageNearestRoomDistance(regions) {
  const centers = asArray(regions).map(getRegionCenter).filter(Boolean);
  if (centers.length < 2) return 0;
  const nearest = centers.map((center, index) => {
    let best = Number.POSITIVE_INFINITY;
    centers.forEach((other, otherIndex) => {
      if (index === otherIndex) return;
      best = Math.min(best, getDistance(center, other));
    });
    return best;
  });
  return nearest.reduce((sum, value) => sum + value, 0) / nearest.length;
}

function createIssue({ mapId, severity = "warning", area, check, message, data = {} }) {
  return {
    id: mapId,
    severity,
    area,
    check,
    message,
    data,
  };
}

function getPairKey(a, b) {
  return [a, b].sort().join("::");
}

function getMapSignature(map) {
  return JSON.stringify({
    regions: asArray(map.regions).map((region) => ({
      id: region.id,
      roomArchetype: region.roomArchetype || "",
      rect: region.cellRect,
      floor: asArray(region.floorCells).map(cellKey).sort(),
    })),
    corridors: asArray(map.corridors).map((corridor) => ({
      id: corridor.id,
      from: corridor.from,
      to: corridor.to,
      cells: getCellList(corridor).map(cellKey),
      roomLink: Boolean(corridor.isRoomLink || corridor.roomTraversal),
    })),
    graph: asArray(map.graph).map((edge) => ({ id: edge.id, from: edge.from, to: edge.to, kind: edge.kind })),
  });
}

function getTopologySignature(map) {
  return JSON.stringify({
    rooms: asArray(map.regions).map((region) => ({
      size: region.size,
      roomArchetype: region.roomArchetype || "",
      rect: region.cellRect ? { w: region.cellRect.w, h: region.cellRect.h } : null,
    })),
    graph: asArray(map.graph).map((edge) => getPairKey(edge.from, edge.to)).sort(),
    corridorCount: asArray(map.corridors).length,
  });
}

function getCorridorMetrics(map) {
  const regionById = new Map(asArray(map.regions).map((region) => [region.id, region]));
  const corridorDetails = [];
  let maxSpan = 0;
  let maxStraightRun = 0;
  let maxDetourRatio = 0;
  let longCorridorWarnings = 0;
  let routingDetourWarnings = 0;

  asArray(map.corridors).forEach((corridor) => {
    if (corridor.isRoomLink || corridor.roomTraversal) return;
    const cells = getCellList(corridor);
    const bounds = getCellBounds(cells);
    const span = Math.max(bounds.width, bounds.height);
    const straightRun = getLongestStraightRun(cells);
    const fromCenter = getRegionCenter(regionById.get(corridor.from));
    const toCenter = getRegionCenter(regionById.get(corridor.to));
    const directDistance = Math.max(1, getDistance(fromCenter, toCenter));
    const detourRatio = cells.length / directDistance;
    maxSpan = Math.max(maxSpan, span);
    maxStraightRun = Math.max(maxStraightRun, straightRun);
    maxDetourRatio = Math.max(maxDetourRatio, detourRatio);
    if (straightRun > 18 || span > 24) longCorridorWarnings += 1;
    if (detourRatio > 2.2) routingDetourWarnings += 1;
    corridorDetails.push({ id: corridor.id, from: corridor.from, to: corridor.to, span, straightRun, detourRatio });
  });

  return {
    maxSpan,
    maxStraightRun,
    maxDetourRatio: Number(maxDetourRatio.toFixed(2)),
    longCorridorWarnings,
    routingDetourWarnings,
    corridorDetails,
  };
}

function getLayoutMetrics(map) {
  const bounds = getRoomBounds(map.regions);
  const gridW = Math.max(1, Math.floor(Number(map.config?.mapWidth || DEFAULT_CONFIG.mapWidth) / Number(map.config?.gridSize || DEFAULT_CONFIG.gridSize)));
  const gridH = Math.max(1, Math.floor(Number(map.config?.mapHeight || DEFAULT_CONFIG.mapHeight) / Number(map.config?.gridSize || DEFAULT_CONFIG.gridSize)));
  const aspectRatio = bounds.width > 0 && bounds.height > 0 ? Math.max(bounds.width / bounds.height, bounds.height / bounds.width) : 1;
  const canvasUsage = bounds.area / Math.max(1, gridW * gridH);
  const averageNearestDistance = getAverageNearestRoomDistance(map.regions);
  const roomCount = Math.max(1, asArray(map.regions).length);
  const layoutOutliers = [
    aspectRatio > 2.75,
    canvasUsage < (roomCount <= 4 ? 0.06 : 0.1),
    averageNearestDistance > (roomCount <= 4 ? 12 : roomCount <= 8 ? 14 : 16),
  ].filter(Boolean).length;

  return {
    bounds,
    aspectRatio: Number(aspectRatio.toFixed(2)),
    canvasUsage: Number(canvasUsage.toFixed(3)),
    averageNearestDistance: Number(averageNearestDistance.toFixed(2)),
    layoutOutliers,
  };
}

function validateNoRoomOverlap(map, mapId) {
  const overlapsByPair = new Map();
  const ownerByCell = new Map();

  asArray(map.regions).forEach((region) => {
    asArray(region.floorCells).forEach((cell) => {
      const key = cellKey(cell);
      const previous = ownerByCell.get(key);
      if (previous && previous !== region.id) {
        const pairKey = getPairKey(previous, region.id);
        const existing = overlapsByPair.get(pairKey) || {
          regionA: previous,
          regionB: region.id,
          cells: [],
          overlapCount: 0,
        };
        existing.overlapCount += 1;
        if (existing.cells.length < 12) existing.cells.push(key);
        overlapsByPair.set(pairKey, existing);
      } else {
        ownerByCell.set(key, region.id);
      }
    });
  });

  return [...overlapsByPair.values()].map((overlap) => createIssue({
    mapId,
    severity: "error",
    area: "structure",
    check: "room-overlap",
    message: "Two room floor masks occupy the same cell.",
    data: overlap,
  }));
}

function validateGraphEdgesHaveCorridors(map, mapId) {
  const corridorPairs = new Set(
    asArray(map.corridors)
      .filter((corridor) => corridor.from && corridor.to)
      .map((corridor) => getPairKey(corridor.from, corridor.to)),
  );
  return asArray(map.graph)
    .filter((edge) => edge.from && edge.to && !corridorPairs.has(getPairKey(edge.from, edge.to)))
    .map((edge) => createIssue({
      mapId,
      severity: "error",
      area: "routing",
      check: "graph-edges-have-corridors",
      message: "A graph edge has no generated corridor or shared-room traversal.",
      data: { edgeId: edge.id, from: edge.from, to: edge.to, kind: edge.kind },
    }));
}

function validateReachability(map, mapId) {
  const regions = asArray(map.regions);
  if (regions.length <= 1) return [];
  const adjacency = new Map(regions.map((region) => [region.id, new Set()]));
  asArray(map.corridors).forEach((corridor) => {
    if (!adjacency.has(corridor.from) || !adjacency.has(corridor.to)) return;
    adjacency.get(corridor.from).add(corridor.to);
    adjacency.get(corridor.to).add(corridor.from);
  });
  const start = regions[0].id;
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    adjacency.get(current)?.forEach((next) => {
      if (seen.has(next)) return;
      seen.add(next);
      queue.push(next);
    });
  }
  const unreachable = regions.map((region) => region.id).filter((id) => !seen.has(id));
  if (!unreachable.length) return [];
  return [createIssue({
    mapId,
    severity: "error",
    area: "structure",
    check: "unreachable-rooms",
    message: "One or more rooms are unreachable from the entrance region.",
    data: { unreachable },
  })];
}

function validateCorridorRoomTunneling(map, mapId) {
  const roomOwnership = getRoomCellOwnershipMap(asArray(map.regions));
  const issues = [];
  asArray(map.corridors).forEach((corridor) => {
    const hits = getNonEndpointRoomTunnelHits(corridor, roomOwnership);
    if (!hits.length) return;
    issues.push(createIssue({
      mapId,
      severity: "error",
      area: "routing",
      check: "corridor-room-tunneling",
      message: "A corridor crosses room floor cells that do not belong to either endpoint room.",
      data: {
        corridorId: corridor.id,
        from: corridor.from,
        to: corridor.to,
        hits: hits.slice(0, 12),
        hitCount: hits.length,
      },
    }));
  });
  return issues;
}

function validateQualityWarnings(map, mapId, metrics) {
  const issues = [];
  if (metrics.routing.longCorridorWarnings > 0) {
    issues.push(createIssue({
      mapId,
      severity: "warning",
      area: "quality",
      check: "long-corridor",
      message: "One or more corridors exceed the preferred readability span.",
      data: { count: metrics.routing.longCorridorWarnings, maxSpan: metrics.routing.maxSpan, maxStraightRun: metrics.routing.maxStraightRun },
    }));
  }
  if (metrics.routing.routingDetourWarnings > 0) {
    issues.push(createIssue({
      mapId,
      severity: "warning",
      area: "quality",
      check: "routing-detour",
      message: "One or more corridors take a noticeably indirect route.",
      data: { count: metrics.routing.routingDetourWarnings, maxDetourRatio: metrics.routing.maxDetourRatio },
    }));
  }
  if (metrics.layout.layoutOutliers > 0) {
    issues.push(createIssue({
      mapId,
      severity: "warning",
      area: "quality",
      check: "layout-outlier",
      message: "The layout has compactness, aspect, or canvas usage outliers.",
      data: {
        count: metrics.layout.layoutOutliers,
        aspectRatio: metrics.layout.aspectRatio,
        canvasUsage: metrics.layout.canvasUsage,
        averageNearestDistance: metrics.layout.averageNearestDistance,
      },
    }));
  }
  return issues;
}

function validateGeneratedMap(map, { mapId, deterministicSignature, verifyDeterminism = false }) {
  const metrics = {
    routing: getCorridorMetrics(map),
    layout: getLayoutMetrics(map),
  };
  const issues = [
    ...validateNoRoomOverlap(map, mapId),
    ...validateGraphEdgesHaveCorridors(map, mapId),
    ...validateReachability(map, mapId),
    ...validateCorridorRoomTunneling(map, mapId),
    ...validateQualityWarnings(map, mapId, metrics),
  ];

  let determinismChecked = false;
  if (verifyDeterminism) {
    determinismChecked = true;
    const repeated = generateMap(map.config);
    const repeatSignature = getMapSignature(repeated);
    if (repeatSignature !== deterministicSignature) {
      issues.push(createIssue({
        mapId,
        severity: "error",
        area: "determinism",
        check: "seed-determinism",
        message: "Generating the same seed twice produced a different map signature.",
      }));
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  return {
    status: errorCount ? "failed" : warningCount ? "review" : "passed",
    metrics,
    issues,
    determinismChecked,
  };
}

function getScoreFromCounts({ errors = 0, longCorridors = 0, detours = 0, layoutOutliers = 0 }) {
  const score = 100 - errors * 100 - longCorridors * 2.5 - detours * 1.25 - layoutOutliers * 0.75;
  return Math.max(0, Number(score.toFixed(1)));
}

function groupIssues(issues) {
  const grouped = new Map();
  issues.forEach((issue) => {
    const key = `${issue.severity}|${issue.area}|${issue.check}|${issue.message}`;
    const existing = grouped.get(key) || { ...issue, count: 0, ids: [] };
    existing.count += 1;
    if (issue.id && !existing.ids.includes(issue.id)) existing.ids.push(issue.id);
    grouped.set(key, existing);
  });
  return [...grouped.values()].sort((a, b) => {
    const severityDelta = (ISSUE_WEIGHTS[a.severity] ?? 9) - (ISSUE_WEIGHTS[b.severity] ?? 9);
    return severityDelta || b.count - a.count || a.check.localeCompare(b.check);
  });
}

function createSummary(issues) {
  return issues.reduce(
    (summary, issue) => {
      summary.total += 1;
      summary[issue.severity] = (summary[issue.severity] || 0) + 1;
      return summary;
    },
    { total: 0, error: 0, warning: 0, info: 0 },
  );
}

function aggregateAnalytics(results, elapsedMs) {
  const generated = results.length;
  const failed = results.filter((result) => result.status === "failed").length;
  const review = results.filter((result) => result.status === "review").length;
  const passed = results.filter((result) => result.status === "passed").length;
  const errors = results.reduce((sum, result) => sum + result.issues.filter((issue) => issue.severity === "error").length, 0);
  const warnings = results.reduce((sum, result) => sum + result.issues.filter((issue) => issue.severity === "warning").length, 0);
  const longCorridorWarnings = results.reduce((sum, result) => sum + result.metrics.routing.longCorridorWarnings, 0);
  const routingDetourWarnings = results.reduce((sum, result) => sum + result.metrics.routing.routingDetourWarnings, 0);
  const layoutOutliers = results.reduce((sum, result) => sum + result.metrics.layout.layoutOutliers, 0);
  const corridorTunnelFailures = results.reduce(
    (sum, result) => sum + result.issues.filter((issue) => issue.check === "corridor-room-tunneling").length,
    0,
  );
  const overlapFailures = results.reduce(
    (sum, result) => sum + result.issues.filter((issue) => issue.check === "room-overlap").length,
    0,
  );
  const unreachableFailures = results.reduce(
    (sum, result) => sum + result.issues.filter((issue) => issue.check === "unreachable-rooms").length,
    0,
  );
  const missingGraphEdgeFailures = results.reduce(
    (sum, result) => sum + result.issues.filter((issue) => issue.check === "graph-edges-have-corridors").length,
    0,
  );
  const determinismFailures = results.reduce(
    (sum, result) => sum + result.issues.filter((issue) => issue.check === "seed-determinism").length,
    0,
  );
  const determinismChecks = results.filter((result) => result.determinismChecked).length;
  const seedVariationWarnings = results.filter((result) => result.seedVariationWarning).length;
  const adapterApplicableCount = results.filter((result) => result.adapterUsage?.applicable).length;
  const adapterUsedCount = results.filter((result) => result.adapterUsage?.used).length;
  const adapterFallbackCount = results.filter((result) => result.adapterUsage?.fallback).length;
  const adapterNotApplicableCount = results.filter((result) => result.adapterUsage?.status === "not-applicable").length;
  const adapterEdgeCount = results.reduce((sum, result) => sum + Number(result.adapterUsage?.adapterEdgeCount || 0), 0);
  const structureScore = errors ? 0 : 100;
  const averageRoutingScore = getScoreFromCounts({ errors, longCorridors: longCorridorWarnings, detours: routingDetourWarnings });
  const averageLayoutScore = getScoreFromCounts({ errors, layoutOutliers });
  const averageOverallQaScore = Number(((structureScore + averageRoutingScore + averageLayoutScore) / 3).toFixed(1));

  return {
    generated,
    passed,
    review,
    failed,
    errors,
    warnings,
    totalElapsedMs: elapsedMs,
    totalRooms: results.reduce((sum, result) => sum + result.roomCount, 0),
    totalCorridors: results.reduce((sum, result) => sum + result.corridorCount, 0),
    totalDoors: results.reduce((sum, result) => sum + result.doorCount, 0),
    determinismChecks,
    determinismFailures,
    seedVariationWarnings,
    adapterApplicableCount,
    adapterUsedCount,
    adapterFallbackCount,
    adapterNotApplicableCount,
    adapterEdgeCount,
    overlapFailures,
    unreachableFailures,
    missingGraphEdgeFailures,
    corridorTunnelFailures,
    longCorridorWarnings,
    routingDetourWarnings,
    layoutOutliers,
    structureScore,
    averageRoutingScore,
    averageLayoutScore,
    averageOverallQaScore,
  };
}

function createSeedVariationWarnings(results) {
  for (let index = 1; index < results.length; index += 1) {
    const previous = results[index - 1];
    const current = results[index];
    if (previous.context !== current.context || previous.roomCount !== current.roomCount) continue;
    if (previous.topologySignature !== current.topologySignature) continue;
    current.seedVariationWarning = true;
    current.issues.push(createIssue({
      mapId: current.id,
      severity: "warning",
      area: "quality",
      check: "seed-variation",
      message: "Adjacent QA seeds produced the same high-level topology signature.",
      data: { previousId: previous.id },
    }));
  }
}

function createDebugMapPayload(result, map) {
  return {
    id: result.id,
    seed: result.seed,
    context: result.context,
    contextGraphAdapterMode: result.contextGraphAdapterMode,
    adapterUsage: result.adapterUsage,
    roomCount: result.roomCount,
    layoutCandidate: map.layoutCandidate,
    metrics: result.metrics,
    explicitConnections: asArray(map.config?.connections).map((connection) => ({
      id: connection.id,
      from: connection.from,
      to: connection.to,
      kind: connection.kind,
      secret: Boolean(connection.secret),
      locked: Boolean(connection.locked),
    })),
    graph: asArray(map.graph).map((edge) => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      kind: edge.kind,
      reason: edge.reason,
    })),
    regions: asArray(map.regions).map((region) => ({
      id: region.id,
      name: region.name,
      role: region.role,
      size: region.size,
      roomArchetype: region.roomArchetype || "",
      roomArchetypeLabel: region.roomArchetypeLabel || "",
      shape: region.shape,
      cellRect: region.cellRect,
      floorCellCount: asArray(region.floorCells).length,
    })),
    corridors: asArray(map.corridors).map((corridor) => ({
      id: corridor.id,
      from: corridor.from,
      to: corridor.to,
      cellCount: getCellList(corridor).length,
      roomLink: Boolean(corridor.isRoomLink || corridor.roomTraversal),
    })),
    issues: result.issues,
  };
}


function slugifyVisualQaPart(value = "preview") {
  const slug = String(value || "preview")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "preview";
}

function createMapVisualQaFilename({ id, extension = "svg" }) {
  return `${slugifyVisualQaPart(id)}.${extension}`;
}

function getVisualQaCueList(context) {
  return asArray(MAP_VISUAL_CONTEXT_CUES[context]).length
    ? MAP_VISUAL_CONTEXT_CUES[context]
    : ["context-specific visual cues"];
}

function getVisualQaExpectedCueKinds(context) {
  return asArray(MAP_VISUAL_CONTEXT_CUE_KINDS[context]);
}

function normalizeVisualThemeKey(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!normalized) return "";
  if (normalized === "sedlec" || normalized === "sedlec-ossuary") return "sedlec-ossuary";
  if (normalized === "decomposition") return "decomposition";
  if (
    normalized === "tower-of-silence" ||
    normalized === "towers-of-silence" ||
    normalized === "towers-silence"
  )
    return "towers-of-silence";
  if (normalized === "mist" || normalized === "the-mist") return "the-mist";
  if (normalized === "wolf-spider" || normalized === "wolf-spiders") return "wolf-spiders";
  return MAP_VISUAL_THEME_CUE_KINDS[normalized] ? normalized : "";
}

function getThemePool(theme = "mixed") {
  const normalized = normalizeVisualThemeKey(theme);
  if (!normalized || String(theme || "").trim().toLowerCase() === "mixed") return MAP_VISUAL_THEME_QA_THEMES;
  return MAP_VISUAL_THEME_QA_THEMES.filter((item) => item.key === normalized);
}

function getVisualQaThemeCueList(themeKey) {
  return asArray(MAP_VISUAL_THEME_CUES[themeKey]).length
    ? MAP_VISUAL_THEME_CUES[themeKey]
    : [];
}

function getVisualQaExpectedThemeCueKinds(themeKey) {
  return asArray(MAP_VISUAL_THEME_CUE_KINDS[themeKey]);
}

function normalizeVisualCueKind(kind = "") {
  return String(kind || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function countUniqueVisualCueKinds(kinds = []) {
  return [...new Set(asArray(kinds).map(normalizeVisualCueKind).filter(Boolean))].sort();
}

function createVisualCueUsage({ context = "", expectedKinds = [], renderedKinds = [], renderedCount = 0 } = {}) {
  const expected = countUniqueVisualCueKinds(expectedKinds);
  const rendered = countUniqueVisualCueKinds(renderedKinds);
  const missing = expected.filter((kind) => !rendered.includes(kind));
  const unexpected = rendered.filter((kind) => !expected.includes(kind));
  const expectedCount = expected.length;
  const supported = expectedCount > 0;
  const renderedTotal = Math.max(0, Number(renderedCount) || 0);
  const renderedExpectedCount = rendered.filter((kind) => expected.includes(kind)).length;
  const coverage = expectedCount ? roundTo(renderedExpectedCount / expectedCount, 3) : null;
  const minimumRenderedCues = supported ? 2 : 0;
  const minimumRenderedExpectedKinds = expectedCount >= 4 ? 2 : Math.min(1, expectedCount);
  const hasEnoughCueDensity = renderedTotal >= minimumRenderedCues;
  const hasEnoughCueVariety = renderedExpectedCount >= minimumRenderedExpectedKinds;
  const status = !supported
    ? "not-supported"
    : renderedTotal <= 0
      ? "missing"
      : hasEnoughCueDensity && hasEnoughCueVariety
        ? "rendered"
        : "partial";

  return {
    context,
    status,
    supported,
    expectedKinds: expected,
    renderedKinds: rendered,
    missingKinds: missing,
    unexpectedKinds: unexpected,
    expectedKindCount: expectedCount,
    renderedKindCount: rendered.length,
    renderedExpectedKindCount: renderedExpectedCount,
    renderedCount: renderedTotal,
    minimumRenderedCues,
    minimumRenderedExpectedKinds,
    cueDensityOk: hasEnoughCueDensity,
    cueVarietyOk: hasEnoughCueVariety,
    coverage,
  };
}

function analyzeCueSvgByClass(svg = "", {
  className = "prop-context-cue",
  keyAttribute = "data-context-key",
  keyValue = "",
  expectedKinds = [],
} = {}) {
  const source = String(svg || "");
  const renderedKinds = [];
  const cueTagPattern = new RegExp(`<g\\b[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`, "g");
  const attributePattern = /\s(data-(?:context-key|theme-key|prop-kind))="([^"]*)"/g;
  const normalizedKeyValue = normalizeVisualCueKind(keyValue);
  let cueMatch = null;
  let renderedCount = 0;

  while ((cueMatch = cueTagPattern.exec(source))) {
    const attributes = {};
    let attributeMatch = null;
    while ((attributeMatch = attributePattern.exec(cueMatch[0]))) {
      attributes[attributeMatch[1]] = attributeMatch[2];
    }
    const cueKey = normalizeVisualCueKind(attributes[keyAttribute] || keyValue);
    if (normalizedKeyValue && cueKey && cueKey !== normalizedKeyValue) continue;
    renderedCount += 1;
    renderedKinds.push(attributes["data-prop-kind"]);
  }

  return createVisualCueUsage({
    context: keyValue,
    expectedKinds,
    renderedKinds,
    renderedCount,
  });
}

export function analyzeMapVisualCueSvg(svg = "", preview = {}) {
  return analyzeCueSvgByClass(svg, {
    className: "prop-context-cue",
    keyAttribute: "data-context-key",
    keyValue: preview.context || "",
    expectedKinds: asArray(preview.expectedCueKinds),
  });
}

export function analyzeMapThemeCueSvg(svg = "", preview = {}) {
  return analyzeCueSvgByClass(svg, {
    className: "prop-theme-cue",
    keyAttribute: "data-theme-key",
    keyValue: preview.themeKey || "",
    expectedKinds: asArray(preview.expectedThemeCueKinds),
  });
}

function createSerializableVisualPreview(preview) {
  if (!preview || typeof preview !== "object") return null;
  const { generatedMap, ...serializable } = preview;
  return serializable;
}

function summarizeVisualCueUsage(previews = [], usageKey = "visualCueUsage") {
  const rows = asArray(previews);
  return {
    rendered: rows.filter((preview) => preview[usageKey]?.status === "rendered").length,
    partial: rows.filter((preview) => preview[usageKey]?.status === "partial").length,
    missing: rows.filter((preview) => preview[usageKey]?.status === "missing").length,
    notSupported: rows.filter((preview) => preview[usageKey]?.status === "not-supported").length,
    totalRenderedCues: rows.reduce(
      (sum, preview) => sum + Number(preview[usageKey]?.renderedCount || 0),
      0,
    ),
  };
}

export function runMapVisualQa(options = {}) {
  const startedAt = Date.now();
  const samplesPerContext = clampInteger(
    options.samplesPerContext ?? options.samples ?? options.countPerContext,
    1,
    20,
    MAP_VISUAL_QA_DEFAULT_OPTIONS.samplesPerContext,
  );
  const roomCountMin = clampInteger(
    options.roomCountMin ?? options.roomMin,
    1,
    16,
    MAP_VISUAL_QA_DEFAULT_OPTIONS.roomCountMin,
  );
  const roomCountMax = clampInteger(
    options.roomCountMax ?? options.roomMax,
    roomCountMin,
    16,
    MAP_VISUAL_QA_DEFAULT_OPTIONS.roomCountMax,
  );
  const samplesPerTheme = clampInteger(
    options.samplesPerTheme ?? options.themeSamples,
    0,
    20,
    MAP_VISUAL_QA_DEFAULT_OPTIONS.samplesPerTheme,
  );
  const seed = normalizeText(options.seed, MAP_VISUAL_QA_DEFAULT_OPTIONS.seed);
  const contexts = getContextPool(options.context || MAP_VISUAL_QA_DEFAULT_OPTIONS.context);
  const themes = getThemePool(options.theme || options.themeId || MAP_VISUAL_QA_DEFAULT_OPTIONS.theme);
  const contextGraphAdapterMode = normalizeContextGraphAdapterMode(
    options.contextGraphAdapterMode ?? options.adapterMode,
    MAP_VISUAL_QA_DEFAULT_OPTIONS.contextGraphAdapterMode,
  );
  const previews = [];
  let globalIndex = 0;

  contexts.forEach((context, contextIndex) => {
    for (let sampleIndex = 0; sampleIndex < samplesPerContext; sampleIndex += 1) {
      globalIndex += 1;
      const roomSpan = roomCountMax - roomCountMin + 1;
      const roomCount = roomCountMin + ((contextIndex + sampleIndex) % Math.max(1, roomSpan));
      const visualId = `map-visual-qa-${slugifyVisualQaPart(context)}-${String(sampleIndex + 1).padStart(2, "0")}`;
      const mapSeed = `${seed}-${slugifyVisualQaPart(context)}-${String(sampleIndex + 1).padStart(2, "0")}`;
      const config = createQaConfig({
        seed: mapSeed,
        index: globalIndex - 1,
        roomCount,
        context,
        contextGraphAdapterMode,
        sourceAnchors: [],
        themeId: "generic-dark-location",
        themeName: "Generic Dark Location",
      });
      const map = generateMap(config);
      const adapterUsage = getAdapterRuntimeUsage(map, contextGraphAdapterMode, context);
      const validation = validateGeneratedMap(map, {
        mapId: visualId,
        deterministicSignature: getMapSignature(map),
        verifyDeterminism: false,
      });
      const preview = {
        id: visualId,
        previewType: "context",
        label: `${context} ${sampleIndex + 1}`,
        context,
        themeKey: "",
        themeName: "",
        seed: mapSeed,
        roomCount: asArray(map.regions).length,
        corridorCount: asArray(map.corridors).length,
        contextGraphAdapterMode,
        adapterUsage,
        expectedCues: getVisualQaCueList(context),
        expectedCueKinds: getVisualQaExpectedCueKinds(context),
        expectedThemeCues: [],
        expectedThemeCueKinds: [],
        visualCueUsage: createVisualCueUsage({
          context,
          expectedKinds: getVisualQaExpectedCueKinds(context),
        }),
        themeCueUsage: createVisualCueUsage(),
        filename: createMapVisualQaFilename({ id: visualId }),
        status: validation.status,
        issueCount: validation.issues.length,
        warningCount: validation.issues.filter((issue) => issue.severity === "warning").length,
        errorCount: validation.issues.filter((issue) => issue.severity === "error").length,
        metrics: validation.metrics,
      };
      Object.defineProperty(preview, "generatedMap", {
        value: map,
        enumerable: false,
        configurable: true,
      });
      previews.push(preview);
    }
  });


  themes.forEach((theme, themeIndex) => {
    for (let sampleIndex = 0; sampleIndex < samplesPerTheme; sampleIndex += 1) {
      globalIndex += 1;
      const roomSpan = roomCountMax - roomCountMin + 1;
      const roomCount = roomCountMin + ((themeIndex + sampleIndex) % Math.max(1, roomSpan));
      const context = theme.context || "Crypt";
      const visualId = `map-visual-qa-theme-${slugifyVisualQaPart(theme.key)}-${String(sampleIndex + 1).padStart(2, "0")}`;
      const mapSeed = `${seed}-theme-${slugifyVisualQaPart(theme.key)}-${String(sampleIndex + 1).padStart(2, "0")}`;
      const config = createQaConfig({
        seed: mapSeed,
        index: globalIndex - 1,
        roomCount,
        context,
        contextGraphAdapterMode,
        sourceAnchors: asArray(theme.sourceAnchors),
        themeId: theme.key,
        themeName: theme.name,
      });
      const map = generateMap(config);
      const adapterUsage = getAdapterRuntimeUsage(map, contextGraphAdapterMode, context);
      const validation = validateGeneratedMap(map, {
        mapId: visualId,
        deterministicSignature: getMapSignature(map),
        verifyDeterminism: false,
      });
      const preview = {
        id: visualId,
        previewType: "theme",
        label: `${theme.name} ${sampleIndex + 1}`,
        context,
        themeKey: theme.key,
        themeName: theme.name,
        seed: mapSeed,
        roomCount: asArray(map.regions).length,
        corridorCount: asArray(map.corridors).length,
        contextGraphAdapterMode,
        adapterUsage,
        expectedCues: getVisualQaCueList(context),
        expectedCueKinds: getVisualQaExpectedCueKinds(context),
        expectedThemeCues: getVisualQaThemeCueList(theme.key),
        expectedThemeCueKinds: getVisualQaExpectedThemeCueKinds(theme.key),
        visualCueUsage: createVisualCueUsage({
          context,
          expectedKinds: getVisualQaExpectedCueKinds(context),
        }),
        themeCueUsage: createVisualCueUsage({
          context: theme.key,
          expectedKinds: getVisualQaExpectedThemeCueKinds(theme.key),
        }),
        filename: createMapVisualQaFilename({ id: visualId }),
        status: validation.status,
        issueCount: validation.issues.length,
        warningCount: validation.issues.filter((issue) => issue.severity === "warning").length,
        errorCount: validation.issues.filter((issue) => issue.severity === "error").length,
        metrics: validation.metrics,
      };
      Object.defineProperty(preview, "generatedMap", {
        value: map,
        enumerable: false,
        configurable: true,
      });
      previews.push(preview);
    }
  });

  const elapsedMs = Date.now() - startedAt;
  return {
    reportType: "cruor-map-visual-qa-report",
    version: MAP_VISUAL_QA_VERSION,
    generatedAt: new Date().toISOString(),
    options: {
      samplesPerContext,
      samplesPerTheme,
      count: previews.length,
      roomCountMin,
      roomCountMax,
      seed,
      context: normalizeText(options.context, MAP_VISUAL_QA_DEFAULT_OPTIONS.context),
      contexts,
      theme: normalizeText(options.theme || options.themeId, MAP_VISUAL_QA_DEFAULT_OPTIONS.theme),
      themes: themes.map((theme) => theme.key),
      contextGraphAdapterMode,
      showGrid: options.showGrid ?? MAP_VISUAL_QA_DEFAULT_OPTIONS.showGrid,
      showNames: options.showNames ?? MAP_VISUAL_QA_DEFAULT_OPTIONS.showNames,
      showProps: options.showProps ?? MAP_VISUAL_QA_DEFAULT_OPTIONS.showProps,
    },
    summary: {
      totalPreviews: previews.length,
      contexts: contexts.length,
      elapsedMs,
      errors: previews.reduce((sum, preview) => sum + Number(preview.errorCount || 0), 0),
      warnings: previews.reduce((sum, preview) => sum + Number(preview.warningCount || 0), 0),
      visualCues: summarizeVisualCueUsage(previews),
      themeCues: summarizeVisualCueUsage(previews, "themeCueUsage"),
    },
    previews,
  };
}

function buildVisualQaPreviewTable(previews = []) {
  const rows = asArray(previews).map((preview) => {
    const usage = preview.adapterUsage || {};
    const visualCueUsage = preview.visualCueUsage || {};
    const themeCueUsage = preview.themeCueUsage || {};
    const cues = asArray(preview.expectedCues).join(", ");
    const themeCues = asArray(preview.expectedThemeCues).join(", ") || "—";
    const renderedCueKinds = asArray(visualCueUsage.renderedKinds).join(", ") || "—";
    const renderedThemeCueKinds = asArray(themeCueUsage.renderedKinds).join(", ") || "—";
    const path = preview.svgPath || preview.filename || "";
    return `| ${preview.previewType || "context"} | ${preview.context} | ${preview.themeName || "—"} | ${preview.label} | ${preview.roomCount || 0} | ${usage.status || "baseline"} | ${visualCueUsage.status || "unknown"} | ${visualCueUsage.renderedCount || 0} | ${renderedCueKinds} | ${themeCueUsage.status || "not-supported"} | ${themeCueUsage.renderedCount || 0} | ${renderedThemeCueKinds} | ${preview.warningCount || 0} | ${path} | ${cues} | ${themeCues} |`;
  });
  if (!rows.length) return "No visual previews generated.";
  return [
    "| Type | Context | Theme | Preview | Rooms | Adapter | Context Visual | Context Cue Count | Context Cue Kinds | Theme Visual | Theme Cue Count | Theme Cue Kinds | Warnings | SVG | Expected Context Cues | Expected Theme Cues |",
    "|---|---|---|---|---:|---|---|---:|---|---|---:|---|---:|---|---|---|",
    ...rows,
  ].join("\n");
}

export function buildMapVisualQaGalleryHtml(report) {
  const previews = asArray(report?.previews);
  const contexts = unique(previews.map((preview) => preview.context)).sort();
  const themes = unique(previews.map((preview) => preview.themeName).filter(Boolean)).sort();
  const statuses = unique(previews.map(getVisualQaGalleryStatus)).sort();
  const cards = previews.map((preview) => {
    const type = preview.previewType || "context";
    const context = preview.context || "Unknown";
    const theme = preview.themeName || "";
    const label = preview.label || preview.id || "Preview";
    const status = getVisualQaGalleryStatus(preview);
    const contextStatus = preview.visualCueUsage?.status || "unknown";
    const themeStatus = preview.themeKey ? preview.themeCueUsage?.status || "unknown" : "not-supported";
    const warningCount = Number(preview.warningCount || 0);
    const svgPath = getVisualQaGalleryPreviewPath(preview);
    const expectedContext = asArray(preview.expectedCues).join(", ") || "—";
    const expectedTheme = asArray(preview.expectedThemeCues).join(", ") || "—";
    const contextKinds = asArray(preview.visualCueUsage?.renderedKinds).join(", ") || "—";
    const themeKinds = asArray(preview.themeCueUsage?.renderedKinds).join(", ") || "—";
    return `
      <article class="preview-card" data-type="${escapeAttribute(type)}" data-context="${escapeAttribute(context)}" data-theme="${escapeAttribute(theme || "—")}" data-status="${escapeAttribute(status)}" data-warnings="${warningCount}">
        <a class="preview-card__image-link" href="${escapeAttribute(svgPath)}" target="_blank" rel="noreferrer">
          <img class="preview-card__image" src="${escapeAttribute(svgPath)}" alt="${escapeAttribute(label)}" loading="lazy" />
        </a>
        <div class="preview-card__body">
          <div class="preview-card__eyebrow">${escapeHtml(type)} · ${escapeHtml(context)}</div>
          <h2>${escapeHtml(label)}</h2>
          ${theme ? `<p class="preview-card__theme">${escapeHtml(theme)}</p>` : ""}
          <div class="preview-card__badges">
            <span class="badge badge--${escapeAttribute(status)}">${escapeHtml(status)}</span>
            <span class="badge">${escapeHtml(String(preview.roomCount || 0))} rooms</span>
            <span class="badge">${escapeHtml(String(warningCount))} warnings</span>
          </div>
          <dl class="preview-card__meta">
            <div><dt>Seed</dt><dd>${escapeHtml(preview.seed || "—")}</dd></div>
            <div><dt>Adapter</dt><dd>${escapeHtml(preview.adapterUsage?.status || "baseline")}</dd></div>
            <div><dt>Context Cues</dt><dd>${escapeHtml(contextStatus)} · ${escapeHtml(String(preview.visualCueUsage?.renderedCount || 0))}</dd></div>
            <div><dt>Context Kinds</dt><dd>${escapeHtml(contextKinds)}</dd></div>
            <div><dt>Theme Cues</dt><dd>${escapeHtml(themeStatus)} · ${escapeHtml(String(preview.themeCueUsage?.renderedCount || 0))}</dd></div>
            <div><dt>Theme Kinds</dt><dd>${escapeHtml(themeKinds)}</dd></div>
            <div><dt>Expected Context</dt><dd>${escapeHtml(expectedContext)}</dd></div>
            <div><dt>Expected Theme</dt><dd>${escapeHtml(expectedTheme)}</dd></div>
          </dl>
          <a class="preview-card__open" href="${escapeAttribute(svgPath)}" target="_blank" rel="noreferrer">Open SVG</a>
        </div>
      </article>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cruor Map Visual QA Gallery</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0d0b0a;
      --panel: #171311;
      --panel-2: #211b18;
      --text: #f1e8dc;
      --muted: #a79b8d;
      --border: rgba(241, 232, 220, 0.16);
      --accent: #8f1f2b;
      --ok: #8da36f;
      --warn: #c99a55;
      --bad: #bd5b55;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: radial-gradient(circle at top, #221815, var(--bg) 44rem);
      color: var(--text);
      font: 14px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 10;
      border-bottom: 1px solid var(--border);
      background: rgba(13, 11, 10, 0.92);
      backdrop-filter: blur(12px);
      padding: 18px clamp(18px, 4vw, 42px);
    }
    h1 { margin: 0 0 4px; font-size: clamp(24px, 4vw, 42px); letter-spacing: 0.02em; text-transform: uppercase; }
    .summary { color: var(--muted); display: flex; flex-wrap: wrap; gap: 12px; }
    .controls {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 10px;
      margin-top: 16px;
    }
    label { display: grid; gap: 5px; color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; }
    select, input {
      width: 100%;
      min-height: 36px;
      border: 1px solid var(--border);
      border-radius: 0;
      background: var(--panel);
      color: var(--text);
      padding: 7px 9px;
    }
    main { padding: 24px clamp(18px, 4vw, 42px) 44px; }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .preview-card {
      border: 1px solid var(--border);
      background: linear-gradient(180deg, rgba(255,255,255,0.035), transparent), var(--panel);
      min-width: 0;
    }
    .preview-card[hidden] { display: none; }
    .preview-card__image-link {
      display: block;
      background: #f2eadf;
      border-bottom: 1px solid var(--border);
      aspect-ratio: 1.35;
      overflow: hidden;
    }
    .preview-card__image {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .preview-card__body { padding: 14px; }
    .preview-card__eyebrow { color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; }
    h2 { margin: 4px 0 2px; font-size: 18px; }
    .preview-card__theme { margin: 0 0 10px; color: var(--muted); }
    .preview-card__badges { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; }
    .badge { border: 1px solid var(--border); background: var(--panel-2); padding: 2px 7px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
    .badge--rendered { border-color: color-mix(in srgb, var(--ok), white 10%); color: var(--ok); }
    .badge--partial { border-color: color-mix(in srgb, var(--warn), white 10%); color: var(--warn); }
    .badge--missing { border-color: color-mix(in srgb, var(--bad), white 10%); color: var(--bad); }
    .badge--not-supported { color: var(--muted); }
    .preview-card__meta { display: grid; gap: 7px; margin: 12px 0; }
    .preview-card__meta div { display: grid; grid-template-columns: 104px minmax(0, 1fr); gap: 10px; }
    dt { color: var(--muted); }
    dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
    .preview-card__open { color: var(--text); text-decoration: none; border-bottom: 1px solid var(--accent); }
    .empty { display: none; margin: 28px 0; color: var(--muted); }
    .empty.is-visible { display: block; }
    @media (max-width: 960px) { .controls { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 620px) { .controls { grid-template-columns: 1fr; } .gallery { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <h1>Cruor Map Visual QA Gallery</h1>
    <div class="summary">
      <span>${escapeHtml(String(previews.length))} previews</span>
      <span>${escapeHtml(report?.version || "")}</span>
      <span>${escapeHtml(report?.generatedAt || "")}</span>
    </div>
    <section class="controls" aria-label="Gallery filters">
      <label>Search<input id="filter-search" type="search" placeholder="seed, label, cue…" /></label>
      <label>Type<select id="filter-type"><option value="all">All</option><option value="context">Context</option><option value="theme">Theme</option></select></label>
      <label>Context<select id="filter-context"><option value="all">All</option>${contexts.map((item) => `<option value="${escapeAttribute(item)}">${escapeHtml(item)}</option>`).join("")}</select></label>
      <label>Theme<select id="filter-theme"><option value="all">All</option>${themes.map((item) => `<option value="${escapeAttribute(item)}">${escapeHtml(item)}</option>`).join("")}</select></label>
      <label>Status<select id="filter-status"><option value="all">All</option>${statuses.map((item) => `<option value="${escapeAttribute(item)}">${escapeHtml(item)}</option>`).join("")}</select></label>
      <label>Warnings<select id="filter-warnings"><option value="all">All</option><option value="with">With warnings</option><option value="without">No warnings</option></select></label>
    </section>
  </header>
  <main>
    <p id="gallery-count" class="summary"></p>
    <p id="gallery-empty" class="empty">No previews match the current filters.</p>
    <section class="gallery" id="gallery">${cards}
    </section>
  </main>
  <script>
    const cards = Array.from(document.querySelectorAll('.preview-card'));
    const controls = {
      search: document.getElementById('filter-search'),
      type: document.getElementById('filter-type'),
      context: document.getElementById('filter-context'),
      theme: document.getElementById('filter-theme'),
      status: document.getElementById('filter-status'),
      warnings: document.getElementById('filter-warnings'),
    };
    const count = document.getElementById('gallery-count');
    const empty = document.getElementById('gallery-empty');
    function matches(card) {
      const search = controls.search.value.trim().toLowerCase();
      const text = card.textContent.toLowerCase();
      if (search && !text.includes(search)) return false;
      if (controls.type.value !== 'all' && card.dataset.type !== controls.type.value) return false;
      if (controls.context.value !== 'all' && card.dataset.context !== controls.context.value) return false;
      if (controls.theme.value !== 'all' && card.dataset.theme !== controls.theme.value) return false;
      if (controls.status.value !== 'all' && card.dataset.status !== controls.status.value) return false;
      const warnings = Number(card.dataset.warnings || 0);
      if (controls.warnings.value === 'with' && warnings <= 0) return false;
      if (controls.warnings.value === 'without' && warnings > 0) return false;
      return true;
    }
    function applyFilters() {
      let visible = 0;
      for (const card of cards) {
        const show = matches(card);
        card.hidden = !show;
        if (show) visible += 1;
      }
      count.textContent = visible + ' / ' + cards.length + ' previews visible';
      empty.classList.toggle('is-visible', visible === 0);
    }
    Object.values(controls).forEach((control) => control.addEventListener('input', applyFilters));
    applyFilters();
  </script>
</body>
</html>`;
}

export function buildMapVisualQaMarkdown(report) {
  const summary = report.summary || {};
  return [
    "# Cruor Map Visual QA",
    "",
    `Generated: ${report.generatedAt}`,
    `Version: ${report.version}`,
    "",
    "## Options",
    "",
    `- Samples Per Context: ${report.options?.samplesPerContext}`,
    `- Samples Per Theme: ${report.options?.samplesPerTheme}`,
    `- Total Previews: ${summary.totalPreviews || 0}`,
    `- Seed: ${report.options?.seed}`,
    `- Context: ${report.options?.context}`,
    `- Contexts: ${asArray(report.options?.contexts).join(", ")}`,
    `- Themes: ${asArray(report.options?.themes).join(", ")}`,
    `- Rooms: ${report.options?.roomCountMin}–${report.options?.roomCountMax}`,
    `- Graph Adapter: ${report.options?.contextGraphAdapterMode}`,
    "",
    "## Visual Cue Summary",
    "",
    `- Rendered / Sufficient: ${summary.visualCues?.rendered || 0}`,
    `- Partial / Below Threshold: ${summary.visualCues?.partial || 0}`,
    `- Missing: ${summary.visualCues?.missing || 0}`,
    `- Not Supported: ${summary.visualCues?.notSupported || 0}`,
    `- Total Rendered Context Cues: ${summary.visualCues?.totalRenderedCues || 0}`,
    "",
    "## Theme Cue Summary",
    "",
    `- Rendered / Sufficient: ${summary.themeCues?.rendered || 0}`,
    `- Partial / Below Threshold: ${summary.themeCues?.partial || 0}`,
    `- Missing: ${summary.themeCues?.missing || 0}`,
    `- Not Supported: ${summary.themeCues?.notSupported || 0}`,
    `- Total Rendered Theme Cues: ${summary.themeCues?.totalRenderedCues || 0}`,
    "",
    "## Review Checklist",
    "",
    "- Crypt previews should read as tombs, alcoves, ossuary or burial spaces.",
    "- Mine previews should read as extraction tunnels, supports, shafts, rubble or rails.",
    "- Ruins previews should read as broken masonry, collapsed rooms, fragments or exposed remains.",
    "- Noble House previews should read as domestic/service/courtyard spaces, not generic dungeons.",
    "- Chapel previews should read as nave/altar/pews/pillars rather than arbitrary rooms.",
    "- Theme previews should show source-specific cues without erasing the base context silhouette.",
    "- Sedlec should emphasize bones/ossuary/reliquary cues.",
    "- Decomposition should emphasize rot, seepage, gas, and soft collapse cues.",
    "- Towers of Silence should emphasize exposure, bone wells, and ritual boundary cues.",
    "- The Mist should emphasize fog, visibility breaks, condensation, and panic clues.",
    "- Wolf Spiders should emphasize webs, egg sacs, and victim-cache cues.",
    "",
    "## Preview Index",
    "",
    buildVisualQaPreviewTable(report.previews || []),
    "",
  ].join("\n");
}

export function serializeMapVisualQaReport(report) {
  const previews = asArray(report?.previews).map(createSerializableVisualPreview).filter(Boolean);
  return {
    ...report,
    summary: {
      ...(report?.summary || {}),
      visualCues: summarizeVisualCueUsage(previews),
      themeCues: summarizeVisualCueUsage(previews, "themeCueUsage"),
    },
    previews,
  };
}

export function runMapBatchQa(options = {}) {
  const startedAt = Date.now();
  const count = clampInteger(options.count, 1, 1000, 50);
  const roomCountMin = clampInteger(options.roomCountMin ?? options.roomMin, 1, 16, 4);
  const roomCountMax = clampInteger(options.roomCountMax ?? options.roomMax, roomCountMin, 16, 12);
  const seed = normalizeText(options.seed, "cruor-map-npm-qa");
  const qaMode = normalizeText(options.qaMode || options.mode, "realistic");
  const contexts = getContextPool(options.context);
  const includeDebugMaps = qaMode === "debug" || Boolean(options.debug);
  const determinismMode = normalizeText(options.determinism, "sample").toLowerCase();
  const determinismSampleRate = clampInteger(options.determinismSampleRate, 1, 250, 10);
  const contextGraphAdapterMode = normalizeContextGraphAdapterMode(
    options.contextGraphAdapterMode ?? options.adapterMode,
    MAP_BATCH_QA_DEFAULT_OPTIONS.contextGraphAdapterMode,
  );
  const results = [];
  const debugMaps = [];

  for (let index = 0; index < count; index += 1) {
    const mapId = `map-qa-${String(index + 1).padStart(4, "0")}`;
    const roomSpan = roomCountMax - roomCountMin + 1;
    const roomCount = roomCountMin + (index % Math.max(1, roomSpan));
    const context = pickFrom(contexts, index);
    const mapSeed = `${seed}-${String(index + 1).padStart(4, "0")}`;
    const config = createQaConfig({ seed: mapSeed, index, roomCount, context, contextGraphAdapterMode });
    const map = generateMap(config);
    const adapterUsage = getAdapterRuntimeUsage(map, contextGraphAdapterMode, context);
    const deterministicSignature = getMapSignature(map);
    const verifyDeterminism =
      determinismMode === "full" ||
      (determinismMode !== "off" &&
        (index === 0 || index === count - 1 || index % determinismSampleRate === 0));
    const validation = validateGeneratedMap(map, {
      mapId,
      deterministicSignature,
      verifyDeterminism,
    });
    const result = {
      id: mapId,
      seed: mapSeed,
      context,
      contextGraphAdapterMode,
      adapterUsage,
      roomCount: asArray(map.regions).length,
      corridorCount: asArray(map.corridors).length,
      doorCount: asArray(map.dungeonMask?.doors || map.doors).length,
      status: validation.status,
      metrics: validation.metrics,
      issues: validation.issues,
      determinismChecked: validation.determinismChecked,
      topologySignature: getTopologySignature(map),
      layoutCandidate: map.layoutCandidate,
    };
    results.push(result);
    if (includeDebugMaps) debugMaps.push(createDebugMapPayload(result, map));
  }

  createSeedVariationWarnings(results);

  const issues = results.flatMap((result) => result.issues);
  const elapsedMs = Date.now() - startedAt;
  const summary = createSummary(issues);
  const analytics = aggregateAnalytics(results, elapsedMs);

  return {
    reportType: "cruor-map-qa-report",
    version: MAP_BATCH_QA_VERSION,
    generatedAt: new Date().toISOString(),
    options: {
      count,
      roomCountMin,
      roomCountMax,
      seed,
      qaMode,
      themeId: normalizeText(options.themeId || options.theme, "mixed"),
      context: normalizeText(options.context, "mixed"),
      contextGraphAdapterMode,
      determinism: determinismMode,
      determinismSampleRate,
    },
    summary,
    analytics,
    groupedIssues: groupIssues(issues),
    results: results.map(({ topologySignature, ...result }) => result),
    ...(includeDebugMaps ? { debugMaps } : {}),
  };
}

function formatNumber(value, digits = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return Number(number.toFixed(digits)).toString();
}

function buildIssueTable(groupedIssues) {
  if (!groupedIssues.length) return "No issues.";
  const rows = groupedIssues.slice(0, 30).map((issue) => {
    const ids = issue.ids.slice(0, 8).join(", ");
    const overflow = issue.ids.length > 8 ? ` +${issue.ids.length - 8}` : "";
    return `| ${issue.severity} | ${issue.area}/${issue.check} | ${issue.count} | ${issue.message} | ${ids}${overflow} |`;
  });
  return [
    "| Severity | Check | Count | Message | Maps |",
    "|---|---:|---:|---|---|",
    ...rows,
  ].join("\n");
}

function buildWorstMapTable(results) {
  const rows = results
    .filter((result) => result.issues.length > 0)
    .sort((a, b) => {
      const errorDelta = b.issues.filter((issue) => issue.severity === "error").length - a.issues.filter((issue) => issue.severity === "error").length;
      return errorDelta || b.issues.length - a.issues.length;
    })
    .slice(0, 20)
    .map((result) => {
      const errorCount = result.issues.filter((issue) => issue.severity === "error").length;
      const warningCount = result.issues.filter((issue) => issue.severity === "warning").length;
      return `| ${result.id} | ${result.status} | ${result.context} | ${result.roomCount} | ${errorCount} | ${warningCount} | ${result.metrics.routing.maxStraightRun} | ${result.metrics.routing.maxSpan} | ${result.metrics.layout.aspectRatio} |`;
    });
  if (!rows.length) return "No maps required review.";
  return [
    "| Map | Status | Context | Rooms | Errors | Warnings | Max Straight | Max Span | Aspect |",
    "|---|---|---|---:|---:|---:|---:|---:|---:|",
    ...rows,
  ].join("\n");
}

export function buildMapBatchQaMarkdown(report) {
  const analytics = report.analytics || {};
  const summary = report.summary || {};
  return [
    `# Cruor Map Batch QA`,
    "",
    `Generated: ${report.generatedAt}`,
    `Version: ${report.version}`,
    "",
    "## Options",
    "",
    `- Count: ${report.options?.count}`,
    `- Seed: ${report.options?.seed}`,
    `- Mode: ${report.options?.qaMode}`,
    `- Context: ${report.options?.context}`,
    `- Graph Adapter: ${report.options?.contextGraphAdapterMode || "off"}`,
    `- Rooms: ${report.options?.roomCountMin}–${report.options?.roomCountMax}`,
    `- Determinism: ${report.options?.determinism} (${analytics.determinismChecks || 0} checks)`,
    "",
    "## Summary",
    "",
    `- Issues: ${summary.total || 0}`,
    `- Errors: ${summary.error || 0}`,
    `- Warnings: ${summary.warning || 0}`,
    `- Info: ${summary.info || 0}`,
    `- Generated Maps: ${analytics.generated || 0}`,
    `- Passed: ${analytics.passed || 0}`,
    `- Review: ${analytics.review || 0}`,
    `- Failed: ${analytics.failed || 0}`,
    `- Elapsed: ${analytics.totalElapsedMs || 0} ms`,
    "",
    "## Scores",
    "",
    `- Structure Score: ${formatNumber(analytics.structureScore, 1)}`,
    `- Average Routing Score: ${formatNumber(analytics.averageRoutingScore, 1)}`,
    `- Average Layout Score: ${formatNumber(analytics.averageLayoutScore, 1)}`,
    `- Average Overall QA Score: ${formatNumber(analytics.averageOverallQaScore, 1)}`,
    "",
    "## Structural Checks",
    "",
    `- Determinism Checks: ${analytics.determinismChecks || 0}`,
    `- Determinism Failures: ${analytics.determinismFailures || 0}`,
    `- Room Overlap Failures: ${analytics.overlapFailures || 0}`,
    `- Unreachable Failures: ${analytics.unreachableFailures || 0}`,
    `- Missing Graph Edge Corridors: ${analytics.missingGraphEdgeFailures || 0}`,
    `- Corridor Tunnel Failures: ${analytics.corridorTunnelFailures || 0}`,
    "",
    "## Quality Checks",
    "",
    `- Long Corridor Warnings: ${analytics.longCorridorWarnings || 0}`,
    `- Routing Detour Warnings: ${analytics.routingDetourWarnings || 0}`,
    `- Layout Outliers: ${analytics.layoutOutliers || 0}`,
    `- Seed Variation Warnings: ${analytics.seedVariationWarnings || 0}`,
    "",
    "## Grouped Issues",
    "",
    buildIssueTable(report.groupedIssues || []),
    "",
    "## Maps Requiring Review",
    "",
    buildWorstMapTable(report.results || []),
    "",
  ].join("\n");
}


function summarizeAdapterVariant(report, mode) {
  return {
    mode,
    label: getMapContextGraphAdapterModeLabel(mode),
    summary: report.summary,
    analytics: report.analytics,
    groupedIssues: report.groupedIssues,
    adapterUsage: {
      applicable: report.analytics?.adapterApplicableCount || 0,
      used: report.analytics?.adapterUsedCount || 0,
      fallback: report.analytics?.adapterFallbackCount || 0,
      notApplicable: report.analytics?.adapterNotApplicableCount || 0,
      edgeCount: report.analytics?.adapterEdgeCount || 0,
    },
    options: report.options,
  };
}

function compareAdapterVariant(baseline, variant) {
  const baseAnalytics = baseline?.analytics || {};
  const variantAnalytics = variant?.analytics || {};
  const delta = {
    warnings: Number(variantAnalytics.warnings || 0) - Number(baseAnalytics.warnings || 0),
    errors: Number(variantAnalytics.errors || 0) - Number(baseAnalytics.errors || 0),
    longCorridorWarnings: Number(variantAnalytics.longCorridorWarnings || 0) - Number(baseAnalytics.longCorridorWarnings || 0),
    routingDetourWarnings: Number(variantAnalytics.routingDetourWarnings || 0) - Number(baseAnalytics.routingDetourWarnings || 0),
    layoutOutliers: Number(variantAnalytics.layoutOutliers || 0) - Number(baseAnalytics.layoutOutliers || 0),
    averageOverallQaScore: Number((Number(variantAnalytics.averageOverallQaScore || 0) - Number(baseAnalytics.averageOverallQaScore || 0)).toFixed(1)),
  };
  const hasErrorRegression = delta.errors > 0;
  const hasWarningRegression = delta.warnings > 0;
  const hasQualityImprovement = delta.warnings < 0 || delta.averageOverallQaScore > 0;
  const adapterUsage = variant.adapterUsage || {};
  const adapterUsed = Number(adapterUsage.used || 0);
  const adapterFallback = Number(adapterUsage.fallback || 0);
  const recommendation = hasErrorRegression
    ? "reject"
    : hasWarningRegression
      ? "keep-disabled"
      : adapterUsed === 0 && adapterFallback > 0
        ? "fallback-only"
        : hasQualityImprovement
          ? "candidate"
          : "neutral";
  return {
    mode: variant.mode,
    label: variant.label,
    delta,
    adapterUsage,
    recommendation,
  };
}

export function runMapAdapterQa(options = {}) {
  const startedAt = Date.now();
  const adapterModes = normalizeAdapterQaModes(options.adapterModes ?? options.adapters ?? options.contextGraphAdapterModes);
  const reports = adapterModes.map((mode) =>
    runMapBatchQa({
      ...options,
      contextGraphAdapterMode: mode,
      adapterMode: mode,
      determinism: options.determinism ?? "off",
    }),
  );
  const baselineReport = reports.find((report) => report.options?.contextGraphAdapterMode === "off") || reports[0];
  const variants = reports.map((report) => summarizeAdapterVariant(report, report.options?.contextGraphAdapterMode || "off"));
  const baselineVariant = variants.find((variant) => variant.mode === "off") || variants[0];
  const comparisons = variants
    .filter((variant) => variant.mode !== baselineVariant.mode)
    .map((variant) => compareAdapterVariant(baselineVariant, variant));

  return {
    reportType: "cruor-map-adapter-qa-report",
    version: MAP_ADAPTER_QA_VERSION,
    generatedAt: new Date().toISOString(),
    elapsedMs: Date.now() - startedAt,
    options: {
      count: baselineReport?.options?.count,
      roomCountMin: baselineReport?.options?.roomCountMin,
      roomCountMax: baselineReport?.options?.roomCountMax,
      seed: baselineReport?.options?.seed,
      qaMode: baselineReport?.options?.qaMode,
      context: baselineReport?.options?.context,
      determinism: baselineReport?.options?.determinism,
      adapterModes,
    },
    baseline: baselineVariant,
    variants,
    comparisons,
    ...(options.includeReports ? { reports } : {}),
  };
}

function buildAdapterComparisonTable(comparisons = []) {
  if (!comparisons.length) return "No adapter comparisons.";
  const rows = comparisons.map((comparison) => {
    const delta = comparison.delta || {};
    const usage = comparison.adapterUsage || {};
    return `| ${comparison.label} | ${comparison.recommendation} | ${usage.used || 0} | ${usage.fallback || 0} | ${usage.notApplicable || 0} | ${delta.errors || 0} | ${delta.warnings || 0} | ${delta.longCorridorWarnings || 0} | ${delta.routingDetourWarnings || 0} | ${delta.layoutOutliers || 0} | ${formatNumber(delta.averageOverallQaScore || 0, 1)} |`;
  });
  return [
    "| Adapter | Recommendation | Used | Fallback | N/A | Δ Errors | Δ Warnings | Δ Long | Δ Detour | Δ Layout | Δ Score |",
    "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...rows,
  ].join("\n");
}

function buildAdapterVariantTable(variants = []) {
  if (!variants.length) return "No adapter variants.";
  const rows = variants.map((variant) => {
    const analytics = variant.analytics || {};
    const summary = variant.summary || {};
    const usage = variant.adapterUsage || {};
    return `| ${variant.label} | ${summary.error || 0} | ${summary.warning || 0} | ${usage.used || 0} | ${usage.fallback || 0} | ${usage.notApplicable || 0} | ${analytics.longCorridorWarnings || 0} | ${analytics.routingDetourWarnings || 0} | ${analytics.layoutOutliers || 0} | ${formatNumber(analytics.averageOverallQaScore || 0, 1)} |`;
  });
  return [
    "| Variant | Errors | Warnings | Used | Fallback | N/A | Long | Detour | Layout | Score |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...rows,
  ].join("\n");
}

export function buildMapAdapterQaMarkdown(report) {
  return [
    "# Cruor Map Adapter QA",
    "",
    `Generated: ${report.generatedAt}`,
    `Version: ${report.version}`,
    "",
    "## Options",
    "",
    `- Count: ${report.options?.count}`,
    `- Seed: ${report.options?.seed}`,
    `- Context: ${report.options?.context}`,
    `- Rooms: ${report.options?.roomCountMin}–${report.options?.roomCountMax}`,
    `- Determinism: ${report.options?.determinism}`,
    `- Adapter Modes: ${asArray(report.options?.adapterModes).join(", ")}`,
    "",
    "## Variant Results",
    "",
    buildAdapterVariantTable(report.variants || []),
    "",
    "## Adapter Runtime Diagnostics",
    "",
    "Used = adapter graph actually replaced the baseline graph for a map. Fallback = adapter was applicable to that context but returned to baseline. N/A = adapter did not match that map context.",
    "",
    "## Baseline Comparison",
    "",
    buildAdapterComparisonTable(report.comparisons || []),
    "",
  ].join("\n");
}


function getOptionValue(value, fallback) {
  if (value && typeof value === "object") {
    return value.value ?? value.id ?? value.mode ?? fallback;
  }
  return value ?? fallback;
}

function getQaOptionNumber(options, key, fallback) {
  const value = getOptionValue(options?.[key], fallback);
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function getMapBatchQaCostWarning(options = {}) {
  const count = getQaOptionNumber(options, "count", MAP_BATCH_QA_DEFAULT_OPTIONS.count);
  const mode = normalizeText(getOptionValue(options.qaMode ?? options.mode, MAP_BATCH_QA_DEFAULT_OPTIONS.qaMode), MAP_BATCH_QA_DEFAULT_OPTIONS.qaMode).toLowerCase();
  const determinism = normalizeText(getOptionValue(options.determinism, MAP_BATCH_QA_DEFAULT_OPTIONS.determinism), MAP_BATCH_QA_DEFAULT_OPTIONS.determinism).toLowerCase();
  const roomCountMax = getQaOptionNumber(options, "roomCountMax", getQaOptionNumber(options, "roomMax", MAP_BATCH_QA_DEFAULT_OPTIONS.roomCountMax));

  if (count >= 250 && (mode === "debug" || determinism === "full")) {
    return "Heavy QA run: 250 maps with debug output or full determinism can take noticeably longer.";
  }

  if (count >= 500) {
    return "Large QA run: this may take a while in the browser. Prefer the npm runner for full validation.";
  }

  if (roomCountMax >= 14 && count >= 100) {
    return "High room counts increase generation cost. Use this for validation, not quick iteration.";
  }

  return "";
}

export function getMapBatchQaRunEstimate(options = {}) {
  const count = getQaOptionNumber(options, "count", MAP_BATCH_QA_DEFAULT_OPTIONS.count);
  const mode = normalizeText(getOptionValue(options.qaMode ?? options.mode, MAP_BATCH_QA_DEFAULT_OPTIONS.qaMode), MAP_BATCH_QA_DEFAULT_OPTIONS.qaMode).toLowerCase();
  const determinism = normalizeText(getOptionValue(options.determinism, MAP_BATCH_QA_DEFAULT_OPTIONS.determinism), MAP_BATCH_QA_DEFAULT_OPTIONS.determinism).toLowerCase();
  const multiplier = (mode === "debug" ? 1.25 : 1) * (determinism === "full" ? 2 : determinism === "off" ? 0.85 : 1);
  return {
    count,
    mode,
    determinism,
    weight: Math.round(count * multiplier),
    warning: getMapBatchQaCostWarning(options),
  };
}

export function getMapBatchQaOptionLabel(options, value, fallback = "") {
  const selected = getOptionValue(value, value);
  const match = asArray(options).find((option) => option?.value === selected || option?.id === selected);
  return match?.label || fallback || String(selected || "");
}

export function getMapBatchQaModeLabel(value) {
  return getMapBatchQaOptionLabel(MAP_BATCH_QA_MODES, value, "Realistic");
}

export function getMapBatchQaContextLabel(value) {
  return getMapBatchQaOptionLabel(MAP_BATCH_CONTEXT_OPTIONS, value, "Mixed");
}

export function getMapContextGraphAdapterModeLabel(value) {
  const mode = normalizeContextGraphAdapterMode(value, "off");
  return getMapBatchQaOptionLabel(MAP_CONTEXT_GRAPH_ADAPTER_MODES, mode, mode);
}

export function getMapBatchQaDeterminismLabel(value) {
  return getMapBatchQaOptionLabel(MAP_BATCH_DETERMINISM_MODES, value, "Sample");
}

export function getMapBatchQaExportModeLabel(value) {
  return getMapBatchQaOptionLabel(MAP_BATCH_EXPORT_MODES, value, "JSON");
}

export function getMapBatchQaSummary(report) {
  const summary = report?.summary || {};
  return {
    total: Number(summary.total || 0),
    error: Number(summary.error || 0),
    warning: Number(summary.warning || 0),
    info: Number(summary.info || 0),
  };
}

export function getMapBatchQaSummaryText(report) {
  const summary = getMapBatchQaSummary(report);
  return `${summary.total} issues (${summary.error} errors, ${summary.warning} warnings, ${summary.info} info)`;
}

export function getMapBatchQaStatus(report) {
  const summary = getMapBatchQaSummary(report);
  if (summary.error > 0) return "failed";
  if (summary.warning > 0) return "review";
  return "passed";
}

export function getMapBatchQaStatusLabel(report) {
  const status = getMapBatchQaStatus(report);
  if (status === "failed") return "Failed";
  if (status === "review") return "Review";
  return "Passed";
}

export function getMapBatchQaStatusTone(report) {
  const status = getMapBatchQaStatus(report);
  if (status === "failed") return "danger";
  if (status === "review") return "warning";
  return "success";
}

export function getMapBatchQaGroupedIssueRows(report) {
  return asArray(report?.groupedIssues).map((issue) => ({
    key: `${issue.severity || "unknown"}:${issue.area || "general"}:${issue.check || "unknown"}:${issue.message || ""}`,
    severity: issue.severity || "warning",
    area: issue.area || "quality",
    check: issue.check || "unknown",
    count: Number(issue.count || 0),
    message: issue.message || "QA issue.",
    ids: asArray(issue.ids),
  }));
}

export function getMapBatchQaExportOptions() {
  return MAP_BATCH_EXPORT_MODES;
}

function normalizeExportMode(exportMode = "json") {
  if (typeof exportMode === "string") return exportMode.trim().toLowerCase() || "json";
  if (exportMode && typeof exportMode === "object") {
    return String(exportMode.value || exportMode.id || exportMode.mode || "json").trim().toLowerCase() || "json";
  }
  return "json";
}

export function getMapBatchQaExportPayload(report, exportMode = "json") {
  const mode = normalizeExportMode(exportMode);
  if (mode === "markdown" || mode === "md") {
    return {
      mode: "markdown",
      extension: "md",
      mimeType: "text/markdown;charset=utf-8",
      content: report?.reportType === "cruor-map-adapter-qa-report"
        ? buildMapAdapterQaMarkdown(report)
        : buildMapBatchQaMarkdown(report),
    };
  }

  return {
    mode: "json",
    extension: "json",
    mimeType: "application/json;charset=utf-8",
    content: JSON.stringify(report, null, 2),
  };
}

export function getMapBatchQaExportFilename(report, exportMode = "json") {
  const payload = getMapBatchQaExportPayload(report, exportMode);
  const generatedAt = report?.generatedAt || new Date().toISOString();
  const stamp = String(generatedAt)
    .replace(/[:.]/g, "-")
    .replace(/[^0-9TZ-]/g, "")
    .slice(0, 24) || "latest";
  const prefix = report?.reportType === "cruor-map-adapter-qa-report"
    ? "cruor-map-adapter-qa"
    : "cruor-map-batch-qa";
  return `${prefix}-${stamp}.${payload.extension}`;
}

export function downloadMapBatchQaReport(report, exportMode = "json") {
  if (!report || typeof document === "undefined" || typeof Blob === "undefined" || typeof URL === "undefined") {
    return false;
  }

  const payload = getMapBatchQaExportPayload(report, exportMode);
  const filename = getMapBatchQaExportFilename(report, exportMode);
  const blob = new Blob([payload.content], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return true;
}

export async function copyMapBatchQaReport(report, exportMode = "markdown") {
  if (!report || typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;
  const payload = getMapBatchQaExportPayload(report, exportMode);
  await navigator.clipboard.writeText(payload.content);
  return true;
}
