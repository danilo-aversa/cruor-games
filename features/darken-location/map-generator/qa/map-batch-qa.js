import { createConfigFromNormalizedMapRequest, DEFAULT_CONFIG, normalizeRoomCount } from "../map-generator.input.js";
import { generateMap } from "../map-generator.pipeline.js";
import {
  createDungeonBrief,
  createMapRequestFromDungeonBrief,
  createThemeRoomBriefs,
  getDungeonThemes,
  getFallbackDungeonTheme,
} from "../../dungeon/dungeon.index.js";
import {
  asArray,
  buildMapQaReport,
  groupMapQaIssues,
  makeMapQaIssue,
  summarizeMapQaIssues,
} from "./map-qa-report.js";

export const MAP_BATCH_QA_VERSION = "map-batch-qa-v0.1-dungeon-brief-structural";

export const DEFAULT_MAP_BATCH_COUNT = 50;
export const MAX_SAFE_BROWSER_MAP_BATCH_COUNT = 160;
export const MAX_HARD_BROWSER_MAP_BATCH_COUNT = 500;
export const MAP_BATCH_QA_MODES = Object.freeze(["realistic", "stress"]);
export const MAP_BATCH_EXPORT_MODES = Object.freeze(["compact", "debug", "full"]);

const DEFAULT_SEED = "cruor-map-studio-qa";
const CONTEXT_POOL = Object.freeze(["Crypt", "Chapel", "Cave", "Mine", "Noble House", "Ruins"]);
const SCALE_POOL = Object.freeze(["small", "medium", "large"]);
const COMPLEXITY_POOL = Object.freeze(["simple", "standard", "complex"]);
const VISUAL_STYLE_POOL = Object.freeze(["cruor", "cartographic", "bone", "blood", "midnight", "print"]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cleanString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeInteger(value, fallback, min, max) {
  const numeric = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(numeric)) return fallback;
  return clamp(numeric, min, max);
}

function hashSeed(value) {
  const text = cleanString(value) || DEFAULT_SEED;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed = DEFAULT_SEED) {
  let state = hashSeed(seed) || 1;
  return function rng() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 1000000) / 1000000;
  };
}

function pick(values, rng, fallback = null) {
  const list = asArray(values);
  if (!list.length) return fallback;
  return list[Math.floor(rng() * list.length)] ?? fallback;
}

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function corridorKey(corridor) {
  return asArray(corridor.floorCells).map(cellKey).join(";");
}

function doorKey(door) {
  return [door.x, door.y, door.side, door.fromRegionId, door.toRegionId, door.corridorId].filter(Boolean).join(":");
}

function createMapSignature(generatedMap) {
  const regions = asArray(generatedMap.regions)
    .map((region) => `${region.id}:${region.cellRect?.x},${region.cellRect?.y},${region.cellRect?.w},${region.cellRect?.h}:${region.shape || "rect"}`)
    .sort()
    .join("|");
  const corridors = asArray(generatedMap.corridors)
    .map((corridor) => `${corridor.id}:${corridorKey(corridor)}`)
    .sort()
    .join("|");
  const doors = asArray(generatedMap.dungeonMask?.doorSegments).map(doorKey).sort().join("|");
  return `${regions}::${corridors}::${doors}`;
}

function normalizeOptionsMode(value) {
  const mode = cleanString(value || "realistic").toLowerCase();
  return MAP_BATCH_QA_MODES.includes(mode) ? mode : "realistic";
}

function normalizeExportMode(value) {
  const mode = cleanString(value || "debug").toLowerCase();
  return MAP_BATCH_EXPORT_MODES.includes(mode) ? mode : "debug";
}

export function normalizeMapBatchQaOptions(options = {}) {
  const minRooms = normalizeInteger(options.roomCountMin ?? options.minRooms, 4, 1, 16);
  const maxRooms = normalizeInteger(options.roomCountMax ?? options.maxRooms, 12, 1, 16);
  const requestedThemeId = cleanString(options.themeId || options.theme || "mixed").toLowerCase();
  const requestedContext = cleanString(options.context || "mixed");
  return {
    count: normalizeInteger(options.count, DEFAULT_MAP_BATCH_COUNT, 1, MAX_HARD_BROWSER_MAP_BATCH_COUNT),
    seed: cleanString(options.seed) || DEFAULT_SEED,
    qaMode: normalizeOptionsMode(options.qaMode || options.mode),
    themeId: requestedThemeId || "mixed",
    context: requestedContext || "mixed",
    roomCountMin: Math.min(minRooms, maxRooms),
    roomCountMax: Math.max(minRooms, maxRooms),
    includeFullPayloads: Boolean(options.includeFullPayloads),
  };
}

export function getMapBatchQaCostWarning(count = DEFAULT_MAP_BATCH_COUNT) {
  const normalizedCount = normalizeInteger(count, DEFAULT_MAP_BATCH_COUNT, 1, MAX_HARD_BROWSER_MAP_BATCH_COUNT);
  if (normalizedCount > 300) {
    return {
      severity: "danger",
      message: "This map batch is heavy and may freeze the browser tab. Prefer CLI or smaller debug runs.",
    };
  }
  if (normalizedCount > MAX_SAFE_BROWSER_MAP_BATCH_COUNT) {
    return {
      severity: "warning",
      message: "This map batch may take noticeable time in the browser because each case generates full topology.",
    };
  }
  return null;
}

function getThemePool(themeId) {
  const themes = getDungeonThemes();
  if (!themeId || themeId === "mixed" || themeId === "all") return themes;
  const match = themes.find((theme) => theme.id === themeId || theme.name?.toLowerCase() === themeId);
  return match ? [match] : [getFallbackDungeonTheme()];
}

function getContextPool(theme, normalized, rng) {
  if (normalized.context && normalized.context !== "mixed" && normalized.context !== "all") {
    return [normalized.context];
  }
  if (normalized.qaMode === "realistic") {
    return asArray(theme?.mapTypeBias).length ? asArray(theme.mapTypeBias) : CONTEXT_POOL;
  }
  return CONTEXT_POOL;
}

function getRoomCountForCase({ index, normalized, rng }) {
  const range = normalized.roomCountMax - normalized.roomCountMin + 1;
  if (range <= 1) return normalizeRoomCount(normalized.roomCountMin, normalized.roomCountMin);
  return normalizeRoomCount(normalized.roomCountMin + Math.floor(rng() * range), normalized.roomCountMin);
}

function createMapQaCase({ index, normalized, rng, themes }) {
  const theme = pick(themes, rng, getFallbackDungeonTheme());
  const scale = pick(SCALE_POOL, rng, "medium");
  const complexity = pick(COMPLEXITY_POOL, rng, "standard");
  const context = pick(getContextPool(theme, normalized, rng), rng, theme?.mapTypeBias?.[0] || DEFAULT_CONFIG.context);
  const visualStyle = pick(VISUAL_STYLE_POOL, rng, DEFAULT_CONFIG.visualStyle);
  const roomCount = getRoomCountForCase({ index, normalized, rng });
  const seed = `${normalized.seed}:map-${String(index + 1).padStart(4, "0")}:${theme.id}:${context}:${roomCount}`;
  const roomBriefs = createThemeRoomBriefs({ theme, roomCount, scale, complexity, context });
  const dungeonBrief = createDungeonBrief({
    id: `map-qa-${String(index + 1).padStart(4, "0")}`,
    mode: "theme",
    workflow: "darken-location",
    title: `${theme.name} Map QA ${index + 1}`,
    themeId: theme.id,
    themeName: theme.name,
    archetype: theme.defaultArchetype,
    context,
    mapType: context,
    roomCount,
    scale,
    complexity,
    visualStyle,
    seed,
    sourceAnchors: theme.sourceAnchorIds,
    horror: [],
    roomBriefs,
  });
  const mapRequest = createMapRequestFromDungeonBrief(dungeonBrief);
  const config = createConfigFromNormalizedMapRequest(
    {
      ...mapRequest,
      seed,
      visualStyle,
      mapWidth: DEFAULT_CONFIG.mapWidth,
      mapHeight: DEFAULT_CONFIG.mapHeight,
    },
    DEFAULT_CONFIG,
  );

  return {
    id: dungeonBrief.id,
    index,
    theme,
    scale,
    complexity,
    context,
    visualStyle,
    roomCount,
    seed,
    roomBriefs,
    dungeonBrief,
    mapRequest,
    config,
  };
}

function buildReachableRegionIds(generatedMap) {
  const regions = asArray(generatedMap.regions);
  if (!regions.length) return new Set();
  const adjacency = new Map(regions.map((region) => [region.id, new Set()]));
  asArray(generatedMap.graph).forEach((edge) => {
    if (!adjacency.has(edge.from) || !adjacency.has(edge.to)) return;
    adjacency.get(edge.from).add(edge.to);
    adjacency.get(edge.to).add(edge.from);
  });
  const start = regions.find((region) => region.isEntrance || region.graphRole === "entrance")?.id || regions[0].id;
  const reachable = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    adjacency.get(current)?.forEach((next) => {
      if (reachable.has(next)) return;
      reachable.add(next);
      queue.push(next);
    });
  }
  return reachable;
}

function countOverlappingRoomCells(generatedMap) {
  const owners = new Map();
  asArray(generatedMap.regions).forEach((region) => {
    asArray(region.floorCells).forEach((cell) => {
      const key = cellKey(cell);
      const existing = owners.get(key) || [];
      existing.push(region.id);
      owners.set(key, existing);
    });
  });
  return [...owners.values()].filter((ids) => ids.length > 1).length;
}

function countDuplicateIds(values = []) {
  const seen = new Set();
  let duplicates = 0;
  asArray(values).forEach((value) => {
    if (!value) return;
    if (seen.has(value)) duplicates += 1;
    seen.add(value);
  });
  return duplicates;
}

function rectsShareWall(a, b) {
  if (!a || !b) return false;
  const verticalTouch = a.x + a.w === b.x || b.x + b.w === a.x;
  const horizontalOverlap = Math.min(a.y + a.h, b.y + b.h) > Math.max(a.y, b.y);
  const horizontalTouch = a.y + a.h === b.y || b.y + b.h === a.y;
  const verticalOverlap = Math.min(a.x + a.w, b.x + b.w) > Math.max(a.x, b.x);
  return (verticalTouch && horizontalOverlap) || (horizontalTouch && verticalOverlap);
}

function doorConnectsRegions(door, fromId, toId) {
  const connected = new Set(asArray(door?.connectedRegionIds));
  if (connected.has(fromId) && connected.has(toId)) return true;
  const values = [door?.fromRegionId, door?.toRegionId, door?.regionId, door?.connectedRegionId].filter(Boolean);
  return values.includes(fromId) && values.includes(toId);
}

function getEdgeDoorSegments(edge, doors) {
  return asArray(doors).filter((door) =>
    door?.corridorId === edge.id || doorConnectsRegions(door, edge.from, edge.to),
  );
}

function getGraphEdgeFulfillment(edge, { corridors, regionsById, doors }) {
  const corridor = asArray(corridors).find((item) => item.id === edge.id);
  if (corridor) {
    return {
      fulfilled: true,
      fulfilledBy: corridor.isRoomLink ? "sharedWallDoor" : "corridor",
      corridorId: corridor.id,
      recoveredGraphEdge: Boolean(corridor.recoveredGraphEdge),
    };
  }
  const from = regionsById.get(edge.from);
  const to = regionsById.get(edge.to);
  const sharesWall = rectsShareWall(from?.cellRect, to?.cellRect);
  if (!sharesWall) {
    return {
      fulfilled: false,
      fulfilledBy: "missing",
      sharesWall: false,
    };
  }
  const doorSegments = getEdgeDoorSegments(edge, doors);
  return {
    fulfilled: doorSegments.length > 0,
    fulfilledBy: doorSegments.length > 0 ? "sharedWallDoor" : "missing",
    sharesWall,
    doorCount: doorSegments.length,
  };
}

function getExpectedDoorCountForCorridor(corridor) {
  if (!corridor) return 0;
  if (
    corridor.corridorStyle === "natural-tunnel" ||
    corridor.surfaceKind === "natural-tunnel" ||
    corridor.surfaceKind === "organic-cave" ||
    corridor.surfaceKind === "cave"
  ) {
    return asArray(corridor.doors).length;
  }
  if (corridor.isRoomLink) return 1;
  return 2;
}

function collectGeneratedMapIssues({ qaCase, generatedMap, deterministicMap, alternateSeedMap }) {
  const issues = [];
  const id = qaCase.id;
  const title = `${qaCase.theme.name} · ${qaCase.context} · ${qaCase.roomCount} rooms`;
  const regions = asArray(generatedMap.regions);
  const corridors = asArray(generatedMap.corridors);
  const graph = asArray(generatedMap.graph);
  const floorCells = asArray(generatedMap.dungeonMask?.floorCells);
  const corridorFloorCells = asArray(generatedMap.dungeonMask?.corridorFloorCells);
  const doors = asArray(generatedMap.dungeonMask?.doorSegments);
  const requiredIds = new Set(asArray(qaCase.config.regions).map((region) => region.id));
  const generatedIds = new Set(regions.map((region) => region.id));
  const missingRegionIds = [...requiredIds].filter((regionId) => !generatedIds.has(regionId));
  const extraRegionIds = [...generatedIds].filter((regionId) => !requiredIds.has(regionId));
  const reachable = buildReachableRegionIds(generatedMap);
  const unreachable = regions.filter((region) => !reachable.has(region.id));
  const duplicateRegionIds = countDuplicateIds(regions.map((region) => region.id));
  const duplicateCorridorIds = countDuplicateIds(corridors.map((corridor) => corridor.id));
  const overlapCount = countOverlappingRoomCells(generatedMap);
  const regionsById = new Map(regions.map((region) => [region.id, region]));
  const graphEdgeFulfillments = graph.map((edge) => ({
    edge,
    ...getGraphEdgeFulfillment(edge, { corridors, regionsById, doors }),
  }));
  const graphEdgesWithoutCorridor = graphEdgeFulfillments.filter(
    (item) => !item.fulfilled,
  );
  const corridorEndpointsMissing = corridors.filter((corridor) => !generatedIds.has(corridor.from) || !generatedIds.has(corridor.to));
  const regionsWithoutFloor = regions.filter((region) => !asArray(region.floorCells).length);
  const expectedDoorCount = corridors.reduce(
    (sum, corridor) => sum + getExpectedDoorCountForCorridor(corridor),
    0,
  );
  const mapRequestBrief = qaCase.mapRequest?.dungeonBrief;
  const configBrief = qaCase.config?.dungeonBrief;
  const normalizedRequiredRegions = asArray(qaCase.config?.requiredRegions);
  const signature = createMapSignature(generatedMap);
  const deterministicSignature = createMapSignature(deterministicMap);
  const alternateSignature = createMapSignature(alternateSeedMap);

  if (regions.length !== qaCase.roomCount || generatedMap.config?.roomCount !== qaCase.roomCount) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "generation",
      check: "room-count-match",
      id,
      title,
      path: "generatedMap.regions",
      message: `Expected ${qaCase.roomCount} rooms, generated ${regions.length}.`,
      recommendation: "Inspect DungeonBrief → mapRequest → normalizeInput propagation before trusting layout candidates.",
      details: { expected: qaCase.roomCount, generated: regions.length, configRoomCount: generatedMap.config?.roomCount },
    }));
  }

  if (missingRegionIds.length || extraRegionIds.length) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "generation",
      check: "required-regions-match",
      id,
      title,
      path: "generatedMap.regions",
      message: "Generated map region IDs do not match the required region list.",
      recommendation: "Confirm every RoomBrief is converted into exactly one required region and one generated region.",
      details: { missingRegionIds, extraRegionIds },
    }));
  }

  if (duplicateRegionIds || duplicateCorridorIds) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "identity",
      check: "duplicate-ids",
      id,
      title,
      path: "generatedMap",
      message: `Found duplicate IDs: ${duplicateRegionIds} region duplicate(s), ${duplicateCorridorIds} corridor duplicate(s).`,
      recommendation: "Map identities must remain stable for editor selection, room sync, export, and saved overrides.",
      details: { duplicateRegionIds, duplicateCorridorIds },
    }));
  }

  if (unreachable.length) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "graph",
      check: "all-regions-reachable",
      id,
      title,
      path: "generatedMap.graph",
      message: `${unreachable.length} generated room(s) are not reachable from the entrance.` ,
      recommendation: "Fix graph construction or context adaptation so every room is connected before layout/export.",
      details: { unreachable: unreachable.map((region) => region.id), reachable: [...reachable] },
    }));
  }

  if (regions.length > 1 && !corridors.length) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "corridors",
      check: "corridors-exist",
      id,
      title,
      path: "generatedMap.corridors",
      message: "Map has multiple rooms but no generated corridors.",
      recommendation: "Inspect graph and corridor routing for this context/theme combination.",
    }));
  }

  if (graphEdgesWithoutCorridor.length) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "corridors",
      check: "graph-edges-have-corridors",
      id,
      title,
      path: "generatedMap.corridors",
      message: `${graphEdgesWithoutCorridor.length} graph edge(s) are not fulfilled by a corridor or shared-wall door.`,
      recommendation: "Route the edge or create a valid door/pass-through on the shared wall for adjacent rooms.",
      details: {
        edges: graphEdgesWithoutCorridor.map((item) => ({
          id: item.edge.id,
          from: item.edge.from,
          to: item.edge.to,
          fulfilledBy: item.fulfilledBy,
          sharesWall: item.sharesWall,
        })),
      },
    }));
  }

  if (corridorEndpointsMissing.length) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "corridors",
      check: "corridor-endpoints-exist",
      id,
      title,
      path: "generatedMap.corridors",
      message: `${corridorEndpointsMissing.length} corridor(s) reference missing rooms.`,
      recommendation: "Keep room identity and graph identity synchronized after RoomBrief conversion.",
      details: { corridors: corridorEndpointsMissing.map((corridor) => corridor.id) },
    }));
  }

  if (overlapCount) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "layout",
      check: "room-cell-overlap",
      id,
      title,
      path: "generatedMap.regions.floorCells",
      message: `${overlapCount} room floor cell(s) are owned by more than one room.`,
      recommendation: "Adjust room placement, centering, or shape masks to prevent physical room overlap.",
      details: { overlapCount },
    }));
  }

  if (!floorCells.length) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "mask",
      check: "floor-cells-exist",
      id,
      title,
      path: "generatedMap.dungeonMask.floorCells",
      message: "Generated dungeon mask has no floor cells.",
      recommendation: "Inspect room mask and dungeon mask construction for this context.",
    }));
  }

  if (regionsWithoutFloor.length) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "mask",
      check: "region-floor-cells-exist",
      id,
      title,
      path: "generatedMap.regions.floorCells",
      message: `${regionsWithoutFloor.length} room(s) have no floor cells.`,
      recommendation: "Ensure every RoomBrief can be assigned a valid room shape and mask.",
      details: { regions: regionsWithoutFloor.map((region) => region.id) },
    }));
  }

  if (expectedDoorCount > 0 && doors.length < Math.max(1, Math.floor(expectedDoorCount * 0.5))) {
    issues.push(makeMapQaIssue({
      severity: "warning",
      area: "doors",
      check: "door-count-low",
      id,
      title,
      path: "generatedMap.dungeonMask.doorSegments",
      message: `Expected roughly ${expectedDoorCount} structural door cuts, found ${doors.length}.`,
      recommendation: "Review door/pass-through generation for structured corridors and shared-wall room links. Organic cave tunnels are excluded from the expected count.",
      details: { expectedDoorCount, actualDoorCount: doors.length },
    }));
  }

  if (signature !== deterministicSignature) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "determinism",
      check: "same-seed-same-output",
      id,
      title,
      path: "config.seed",
      message: "Generating the same map config twice produced different topology.",
      recommendation: "Remove hidden randomness or unstable iteration order from map generation.",
    }));
  }

  if (regions.length > 1 && signature === alternateSignature) {
    issues.push(makeMapQaIssue({
      severity: "warning",
      area: "determinism",
      check: "seed-variation",
      id,
      title,
      path: "config.seed",
      message: "Changing the seed did not produce a different topology signature.",
      recommendation: "Confirm the seed affects graph, room placement, or shape selection for this context.",
    }));
  }

  if (!mapRequestBrief || !configBrief) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "dungeon-brief",
      check: "brief-propagation",
      id,
      title,
      path: "mapRequest.dungeonBrief",
      message: "DungeonBrief was not preserved through mapRequest/config normalization.",
      recommendation: "Keep DungeonBrief available for Theme/Scratch sync, room inspector data, exports, and future layout candidate scoring.",
      details: { hasMapRequestBrief: Boolean(mapRequestBrief), hasConfigBrief: Boolean(configBrief) },
    }));
  }

  const requiredRegionsWithRoomBriefs = normalizedRequiredRegions.filter((region) => region.metadata?.dungeonRoomBrief || region.metadata?.roomBriefId);
  if (normalizedRequiredRegions.length && requiredRegionsWithRoomBriefs.length !== normalizedRequiredRegions.length) {
    issues.push(makeMapQaIssue({
      severity: "warning",
      area: "dungeon-brief",
      check: "room-brief-region-metadata",
      id,
      title,
      path: "config.requiredRegions.metadata",
      message: `${normalizedRequiredRegions.length - requiredRegionsWithRoomBriefs.length} required region(s) lack RoomBrief metadata.`,
      recommendation: "Keep every map region traceable back to its RoomBrief for Scratch editing and export.",
    }));
  }

  const themeContextPool = asArray(qaCase.theme?.mapTypeBias);
  if (qaCase.qaMode === "realistic" && themeContextPool.length && !themeContextPool.includes(qaCase.context)) {
    issues.push(makeMapQaIssue({
      severity: "warning",
      area: "theme-fit",
      check: "context-fits-theme",
      id,
      title,
      path: "dungeonBrief.context",
      message: `${qaCase.theme.name} generated ${qaCase.context}, which is outside its preferred map type bias.`,
      recommendation: "Theme Mode should keep map archetypes coherent unless Stress QA explicitly tests unlikely combinations.",
      details: { themeContextPool, context: qaCase.context },
    }));
  }

  return {
    issues,
    metrics: {
      regions: regions.length,
      corridors: corridors.length,
      graphEdges: graph.length,
      doors: doors.length,
      floorCells: floorCells.length,
      corridorFloorCells: corridorFloorCells.length,
      overlapCount,
      unreachableCount: unreachable.length,
      expectedDoorCount,
      deterministic: signature === deterministicSignature,
      seedVaries: signature !== alternateSignature,
    },
  };
}

function getAlternateSeedConfig(config, seed) {
  return {
    ...config,
    seed: `${seed}:alt`,
  };
}

function runSingleMapCase(qaCase, normalized) {
  const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
  try {
    const generatedMap = generateMap(qaCase.config);
    const deterministicMap = generateMap(qaCase.config);
    const alternateSeedMap = generateMap(getAlternateSeedConfig(qaCase.config, qaCase.seed));
    const elapsedMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt);
    const validation = collectGeneratedMapIssues({ qaCase: { ...qaCase, qaMode: normalized.qaMode }, generatedMap, deterministicMap, alternateSeedMap });
    const issueSummary = summarizeMapQaIssues(validation.issues);

    return {
      id: qaCase.id,
      status: issueSummary.error ? "failed" : issueSummary.warning ? "review" : "passed",
      themeId: qaCase.theme.id,
      themeName: qaCase.theme.name,
      context: qaCase.context,
      roomCount: qaCase.roomCount,
      scale: qaCase.scale,
      complexity: qaCase.complexity,
      visualStyle: qaCase.visualStyle,
      seed: qaCase.seed,
      elapsedMs,
      issueCount: issueSummary.total,
      errorCount: issueSummary.error,
      warningCount: issueSummary.warning,
      infoCount: issueSummary.info,
      metrics: validation.metrics,
      signature: createMapSignature(generatedMap),
      issues: validation.issues,
      debugPayload: normalized.includeFullPayloads || issueSummary.total
        ? {
            qaCase: {
              id: qaCase.id,
              themeId: qaCase.theme.id,
              themeName: qaCase.theme.name,
              context: qaCase.context,
              roomCount: qaCase.roomCount,
              scale: qaCase.scale,
              complexity: qaCase.complexity,
              seed: qaCase.seed,
            },
            config: qaCase.config,
            mapRequest: qaCase.mapRequest,
            dungeonBrief: qaCase.dungeonBrief,
            metrics: validation.metrics,
            issues: validation.issues,
            generatedMapSummary: {
              regions: asArray(generatedMap.regions).map((region) => ({
                id: region.id,
                name: region.name,
                role: region.role,
                shape: region.shape,
                graphRole: region.graphRole,
                graphDepth: region.graphDepth,
                cellRect: region.cellRect,
                floorCellCount: asArray(region.floorCells).length,
              })),
              corridors: asArray(generatedMap.corridors).map((corridor) => ({
                id: corridor.id,
                from: corridor.from,
                to: corridor.to,
                kind: corridor.kind,
                floorCellCount: asArray(corridor.floorCells).length,
                isRoomLink: Boolean(corridor.isRoomLink),
              })),
            },
          }
        : null,
    };
  } catch (error) {
    const issue = makeMapQaIssue({
      severity: "error",
      area: "runtime",
      check: "generation-threw",
      id: qaCase.id,
      title: `${qaCase.theme.name} · ${qaCase.context}`,
      message: error?.message || String(error),
      recommendation: "Inspect this generated config and fix the throwing branch before trusting batch output.",
      details: { stack: error?.stack, config: qaCase.config },
    });
    const elapsedMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt);
    return {
      id: qaCase.id,
      status: "failed",
      themeId: qaCase.theme.id,
      themeName: qaCase.theme.name,
      context: qaCase.context,
      roomCount: qaCase.roomCount,
      scale: qaCase.scale,
      complexity: qaCase.complexity,
      visualStyle: qaCase.visualStyle,
      seed: qaCase.seed,
      elapsedMs,
      issueCount: 1,
      errorCount: 1,
      warningCount: 0,
      infoCount: 0,
      metrics: {},
      issues: [issue],
      debugPayload: { qaCase, issue },
    };
  }
}

function summarizeGeneratedMaps(generated = []) {
  const maps = asArray(generated);
  const totals = maps.reduce(
    (summary, item) => {
      summary.passed += item.status === "passed" ? 1 : 0;
      summary.review += item.status === "review" ? 1 : 0;
      summary.failed += item.status === "failed" ? 1 : 0;
      summary.errors += Number(item.errorCount || 0);
      summary.warnings += Number(item.warningCount || 0);
      summary.totalElapsedMs += Number(item.elapsedMs || 0);
      summary.totalRooms += Number(item.metrics?.regions || item.roomCount || 0);
      summary.totalCorridors += Number(item.metrics?.corridors || 0);
      summary.totalDoors += Number(item.metrics?.doors || 0);
      summary.totalFloorCells += Number(item.metrics?.floorCells || 0);
      summary.determinismFailures += item.metrics?.deterministic === false ? 1 : 0;
      summary.seedVariationWarnings += item.metrics?.seedVaries === false ? 1 : 0;
      summary.overlapFailures += Number(item.metrics?.overlapCount || 0) > 0 ? 1 : 0;
      summary.unreachableFailures += Number(item.metrics?.unreachableCount || 0) > 0 ? 1 : 0;
      return summary;
    },
    {
      passed: 0,
      review: 0,
      failed: 0,
      errors: 0,
      warnings: 0,
      totalElapsedMs: 0,
      totalRooms: 0,
      totalCorridors: 0,
      totalDoors: 0,
      totalFloorCells: 0,
      determinismFailures: 0,
      seedVariationWarnings: 0,
      overlapFailures: 0,
      unreachableFailures: 0,
    },
  );
  const count = Math.max(1, maps.length);
  return {
    ...totals,
    generated: maps.length,
    averageElapsedMs: Math.round(totals.totalElapsedMs / count),
    averageRooms: Number((totals.totalRooms / count).toFixed(1)),
    averageCorridors: Number((totals.totalCorridors / count).toFixed(1)),
    averageDoors: Number((totals.totalDoors / count).toFixed(1)),
    averageFloorCells: Math.round(totals.totalFloorCells / count),
  };
}

export function buildMapBatchQaCases(options = {}) {
  const normalized = normalizeMapBatchQaOptions(options);
  const rng = createRng(normalized.seed);
  const themes = getThemePool(normalized.themeId);
  return Array.from({ length: normalized.count }, (_, index) =>
    createMapQaCase({ index, normalized, rng, themes }),
  );
}

export function runMapBatchQa(options = {}) {
  const normalized = normalizeMapBatchQaOptions(options);
  const cases = buildMapBatchQaCases(normalized);
  const generated = cases.map((qaCase) => runSingleMapCase(qaCase, normalized));
  const issues = generated.flatMap((item) => asArray(item.issues));
  const analytics = summarizeGeneratedMaps(generated);

  return buildMapQaReport({
    metadata: {
      qaVersion: MAP_BATCH_QA_VERSION,
      options: normalized,
    },
    suites: [
      {
        id: "map-batch-generation",
        label: "Map Batch Generation",
        issues,
        metrics: {
          options: normalized,
          analytics,
          generated: generated.map((item) => normalized.includeFullPayloads ? item : { ...item, debugPayload: item.issueCount ? item.debugPayload : null }),
        },
      },
    ],
  });
}

function getBatchSuite(report = {}) {
  return asArray(report.suites).find((item) => item.id === "map-batch-generation") || asArray(report.suites)[0] || {};
}

function getGeneratedMaps(report = {}) {
  return asArray(getBatchSuite(report).metrics?.generated);
}

export function buildMapBatchQaMarkdown(report = {}) {
  const suite = getBatchSuite(report);
  const analytics = suite.metrics?.analytics || {};
  const generated = getGeneratedMaps(report);
  const grouped = groupMapQaIssues(report.issues || []);
  const summary = report.summary || summarizeMapQaIssues(report.issues || []);
  const options = suite.metrics?.options || report.metadata?.options || {};
  const lines = [];

  lines.push("# Cruor Map Batch QA Report");
  lines.push("");
  lines.push(`Generated At: ${report.generatedAt || new Date().toISOString()}`);
  lines.push(`Count: ${options.count ?? generated.length}`);
  lines.push(`Seed: ${options.seed || DEFAULT_SEED}`);
  lines.push(`QA Mode: ${options.qaMode || "realistic"}`);
  lines.push(`Theme: ${options.themeId || "mixed"}`);
  lines.push(`Context: ${options.context || "mixed"}`);
  lines.push(`Room Count Range: ${options.roomCountMin ?? "?"}–${options.roomCountMax ?? "?"}`);
  lines.push("");
  lines.push("## Summary");
  lines.push(`- Total Issues: ${summary.total || 0}`);
  lines.push(`- Errors: ${summary.error || 0}`);
  lines.push(`- Warnings: ${summary.warning || 0}`);
  lines.push(`- Info: ${summary.info || 0}`);
  lines.push(`- Passed Maps: ${analytics.passed ?? 0}`);
  lines.push(`- Review Maps: ${analytics.review ?? 0}`);
  lines.push(`- Failed Maps: ${analytics.failed ?? 0}`);
  lines.push(`- Determinism Failures: ${analytics.determinismFailures ?? 0}`);
  lines.push(`- Seed Variation Warnings: ${analytics.seedVariationWarnings ?? 0}`);
  lines.push(`- Room Overlap Failures: ${analytics.overlapFailures ?? 0}`);
  lines.push(`- Unreachable Room Failures: ${analytics.unreachableFailures ?? 0}`);
  lines.push(`- Avg Rooms: ${analytics.averageRooms ?? 0}`);
  lines.push(`- Avg Corridors: ${analytics.averageCorridors ?? 0}`);
  lines.push(`- Avg Doors: ${analytics.averageDoors ?? 0}`);
  lines.push(`- Avg Runtime: ${analytics.averageElapsedMs ?? 0}ms`);
  lines.push("");
  lines.push("## Most Common Issues");
  if (!grouped.length) {
    lines.push("No grouped issues.");
  } else {
    grouped.slice(0, 24).forEach((group) => {
      lines.push(`- ${group.severity.toUpperCase()} · ${group.area}/${group.check} · ${group.count}× — ${group.message}`);
      if (group.ids?.length) lines.push(`  - Examples: ${group.ids.join(", ")}`);
    });
  }
  lines.push("");
  lines.push("## Maps to Review");
  const reviewMaps = generated
    .filter((item) => item.status !== "passed" || Number(item.issueCount || 0) > 0)
    .slice(0, 40);
  if (!reviewMaps.length) {
    lines.push("No generated map outliers.");
  } else {
    reviewMaps.forEach((item) => {
      lines.push(`- ${item.id} · ${item.themeName} · ${item.context} · ${item.roomCount} rooms · ${item.status} · ${item.issueCount} issue(s)`);
      lines.push(`  - Metrics: ${item.metrics?.regions ?? "?"} regions, ${item.metrics?.corridors ?? "?"} corridors, ${item.metrics?.doors ?? "?"} doors, ${item.metrics?.floorCells ?? "?"} floor cells`);
      lines.push(`  - Seed: ${item.seed}`);
    });
  }
  lines.push("");

  return lines.join("\n");
}

function buildMapBatchQaCompactReport(report = {}) {
  const compactReport = {
    ...report,
    suites: asArray(report.suites).map((suite) => ({
      ...suite,
      metrics: {
        ...suite.metrics,
        generated: asArray(suite.metrics?.generated).map((item) => ({
          id: item.id,
          status: item.status,
          themeId: item.themeId,
          themeName: item.themeName,
          context: item.context,
          roomCount: item.roomCount,
          scale: item.scale,
          complexity: item.complexity,
          visualStyle: item.visualStyle,
          seed: item.seed,
          elapsedMs: item.elapsedMs,
          issueCount: item.issueCount,
          errorCount: item.errorCount,
          warningCount: item.warningCount,
          metrics: item.metrics,
        })),
      },
    })),
  };
  return compactReport;
}

function downloadTextFile({ content, filename, mimeType }) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 60_000);
}

function getExportTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function downloadMapBatchQaReport(report = {}, { format = "json", filenamePrefix = "cruor-map-batch-qa" } = {}) {
  const timestamp = getExportTimestamp();
  const isMarkdown = format === "markdown";
  const filename = `${filenamePrefix}-${timestamp}.${isMarkdown ? "md" : "json"}`;
  const content = isMarkdown
    ? buildMapBatchQaMarkdown(report)
    : JSON.stringify(buildMapBatchQaCompactReport(report), null, 2);
  downloadTextFile({
    content,
    filename,
    mimeType: isMarkdown ? "text/markdown;charset=utf-8" : "application/json;charset=utf-8",
  });
}

export {
  DEFAULT_SEED,
  normalizeExportMode,
};
