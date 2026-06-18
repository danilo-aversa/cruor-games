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

export const MAP_BATCH_QA_VERSION = "map-batch-qa-v0.6-label-version-cleanup";

export const DEFAULT_MAP_BATCH_COUNT = 50;
export const MAX_SAFE_BROWSER_MAP_BATCH_COUNT = 160;
export const MAX_HARD_BROWSER_MAP_BATCH_COUNT = 500;
export const MAP_BATCH_QA_MODES = Object.freeze(["realistic", "stress"]);
export const MAP_BATCH_EXPORT_MODES = Object.freeze(["compact", "debug", "full"]);
export const DEFAULT_MAP_DEBUG_EXPORT_LIMIT = 80;

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


function getCellBounds(cells = []) {
  const list = asArray(cells).filter((cell) => Number.isFinite(cell?.x) && Number.isFinite(cell?.y));
  if (!list.length) return null;
  const xs = list.map((cell) => cell.x);
  const ys = list.map((cell) => cell.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function getRegionCentroid(region) {
  const cells = asArray(region?.floorCells).filter((cell) => Number.isFinite(cell?.x) && Number.isFinite(cell?.y));
  if (!cells.length && region?.cellRect) {
    return {
      x: Number(region.cellRect.x || 0) + Number(region.cellRect.w || 0) / 2,
      y: Number(region.cellRect.y || 0) + Number(region.cellRect.h || 0) / 2,
    };
  }
  if (!cells.length) return { x: 0, y: 0 };
  return {
    x: cells.reduce((sum, cell) => sum + cell.x, 0) / cells.length,
    y: cells.reduce((sum, cell) => sum + cell.y, 0) / cells.length,
  };
}

function getManhattanDistance(a, b) {
  if (!a || !b) return 0;
  return Math.abs(Number(a.x || 0) - Number(b.x || 0)) + Math.abs(Number(a.y || 0) - Number(b.y || 0));
}

function buildRoomCellOwners(regions = []) {
  const owners = new Map();
  asArray(regions).forEach((region) => {
    asArray(region.floorCells).forEach((cell) => {
      const key = cellKey(cell);
      const existing = owners.get(key) || [];
      existing.push(region.id);
      owners.set(key, existing);
    });
  });
  return owners;
}

function getMaxStraightRun(cells = []) {
  const list = asArray(cells).filter((cell) => Number.isFinite(cell?.x) && Number.isFinite(cell?.y));
  if (list.length < 2) return list.length;
  let maxRun = 1;
  let currentRun = 1;
  let previousDirection = null;

  for (let index = 1; index < list.length; index += 1) {
    const previous = list[index - 1];
    const current = list[index];
    const dx = Math.sign(current.x - previous.x);
    const dy = Math.sign(current.y - previous.y);
    const direction = Math.abs(dx) + Math.abs(dy) === 1 ? `${dx},${dy}` : "break";
    if (direction !== "break" && direction === previousDirection) {
      currentRun += 1;
    } else {
      currentRun = direction === "break" ? 1 : 2;
    }
    previousDirection = direction;
    maxRun = Math.max(maxRun, currentRun);
  }

  return maxRun;
}

function getCorridorRouteMetrics(corridor, regionsById) {
  const cells = asArray(corridor?.floorCells);
  const bounds = getCellBounds(cells);
  const fromCentroid = getRegionCentroid(regionsById.get(corridor?.from));
  const toCentroid = getRegionCentroid(regionsById.get(corridor?.to));
  const directDistance = Math.max(1, getManhattanDistance(fromCentroid, toCentroid));
  const length = cells.length;
  return {
    id: corridor?.id,
    from: corridor?.from,
    to: corridor?.to,
    length,
    bounds,
    spanX: bounds?.width || 0,
    spanY: bounds?.height || 0,
    maxSpan: Math.max(bounds?.width || 0, bounds?.height || 0),
    maxStraightRun: getMaxStraightRun(cells),
    directDistance: Number(directDistance.toFixed(2)),
    detourRatio: Number((length / directDistance).toFixed(2)),
  };
}

function getCorridorRoomTunnels(corridors, roomCellOwners) {
  return asArray(corridors).flatMap((corridor) => {
    if (!corridor || corridor.isRoomLink) return [];
    const endpointIds = new Set([corridor.from, corridor.to].filter(Boolean));
    const hits = [];
    asArray(corridor.floorCells).forEach((cell, index) => {
      const owners = asArray(roomCellOwners.get(cellKey(cell))).filter((regionId) => !endpointIds.has(regionId));
      if (!owners.length) return;
      hits.push({
        corridorId: corridor.id,
        from: corridor.from,
        to: corridor.to,
        index,
        cell: { x: cell.x, y: cell.y },
        regionIds: owners,
      });
    });
    return hits;
  });
}

function getRoomDistributionMetrics(regions = []) {
  const centroids = asArray(regions).map((region) => ({
    id: region.id,
    ...getRegionCentroid(region),
  }));
  if (centroids.length < 2) {
    return {
      centroidCount: centroids.length,
      averageNearestDistance: 0,
      maxNearestDistance: 0,
      maxCentroidDistance: 0,
    };
  }
  const nearestDistances = centroids.map((centroid) => {
    const distances = centroids
      .filter((other) => other.id !== centroid.id)
      .map((other) => getManhattanDistance(centroid, other));
    return Math.min(...distances);
  });
  let maxCentroidDistance = 0;
  for (let a = 0; a < centroids.length; a += 1) {
    for (let b = a + 1; b < centroids.length; b += 1) {
      maxCentroidDistance = Math.max(maxCentroidDistance, getManhattanDistance(centroids[a], centroids[b]));
    }
  }
  return {
    centroidCount: centroids.length,
    averageNearestDistance: Number((nearestDistances.reduce((sum, value) => sum + value, 0) / nearestDistances.length).toFixed(2)),
    maxNearestDistance: Number(Math.max(...nearestDistances).toFixed(2)),
    maxCentroidDistance: Number(maxCentroidDistance.toFixed(2)),
  };
}

function getLayoutQualityMetrics(generatedMap, qaCase) {
  const floorBounds = getCellBounds(generatedMap?.dungeonMask?.floorCells);
  const roomBounds = getCellBounds(asArray(generatedMap?.regions).flatMap((region) => asArray(region.floorCells)));
  const gridSize = Number(generatedMap?.config?.gridSize || qaCase?.config?.gridSize || DEFAULT_CONFIG.gridSize || 20);
  const mapWidth = Number(generatedMap?.config?.mapWidth || qaCase?.config?.mapWidth || DEFAULT_CONFIG.mapWidth || 1600);
  const mapHeight = Number(generatedMap?.config?.mapHeight || qaCase?.config?.mapHeight || DEFAULT_CONFIG.mapHeight || 1000);
  const canvasColumns = Math.max(1, Math.round(mapWidth / gridSize));
  const canvasRows = Math.max(1, Math.round(mapHeight / gridSize));
  const contentArea = (floorBounds?.width || 0) * (floorBounds?.height || 0);
  const canvasArea = canvasColumns * canvasRows;
  const aspectRatio = floorBounds?.height ? floorBounds.width / floorBounds.height : 0;
  const roomDistribution = getRoomDistributionMetrics(generatedMap?.regions);
  return {
    floorBounds,
    roomBounds,
    gridSize,
    canvasColumns,
    canvasRows,
    aspectRatio: Number(aspectRatio.toFixed(2)),
    canvasUsage: Number((contentArea / Math.max(1, canvasArea)).toFixed(3)),
    floorWidthRatio: Number(((floorBounds?.width || 0) / canvasColumns).toFixed(3)),
    floorHeightRatio: Number(((floorBounds?.height || 0) / canvasRows).toFixed(3)),
    roomDistribution,
  };
}


function clampScore(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return clamp(Math.round(numeric), 0, 100);
}

function calculateMapQualityScores({ issueSummary = {}, metrics = {}, status = "passed" } = {}) {
  const layoutQuality = metrics.layoutQuality || {};
  const layoutWarnings = [
    layoutQuality.aspectRatio > 2.85 || (layoutQuality.aspectRatio > 0 && layoutQuality.aspectRatio < 0.35),
    Number(layoutQuality.roomDistribution?.averageNearestDistance || 0) > 0 && Number(layoutQuality.roomDistribution?.averageNearestDistance || 0) > 18,
    Number(layoutQuality.canvasUsage || 0) > 0 && Number(layoutQuality.canvasUsage || 0) < 0.08,
  ].filter(Boolean).length;
  const layoutPenalty =
    layoutWarnings * 16 +
    Math.max(0, Number(layoutQuality.aspectRatio || 1) - 2.85) * 12 +
    Math.max(0, 0.35 - Number(layoutQuality.aspectRatio || 0)) * 18;

  const routingPenalty =
    Number(metrics.corridorTunnelCount || 0) * 38 +
    Number(metrics.excessiveSpanCorridors || 0) * 14 +
    Number(metrics.longStraightCorridors || 0) * 12 +
    Number(metrics.highDetourCorridors || 0) * 10 +
    Math.max(0, Number(metrics.maxDetourRatio || 0) - 3.25) * 8;

  const structuralPenalty =
    Number(issueSummary.error || 0) * 28 +
    Number(metrics.overlapCount || 0) * 40 +
    Number(metrics.unreachableCount || 0) * 40 +
    (metrics.deterministic === false ? 45 : 0);

  const readabilityPenalty =
    Number(issueSummary.warning || 0) * 6 +
    (Number(metrics.maxStraightRun || 0) > 36 ? 12 : 0) +
    (Number(metrics.maxCorridorSpan || 0) > 42 ? 10 : 0);

  const layoutScore = clampScore(100 - layoutPenalty);
  const routingScore = clampScore(100 - routingPenalty);
  const structureScore = clampScore(100 - structuralPenalty);
  const readabilityScore = clampScore(100 - readabilityPenalty);
  const overallQaScore = clampScore(
    structureScore * 0.36 + routingScore * 0.30 + layoutScore * 0.22 + readabilityScore * 0.12 - (status === "failed" ? 8 : 0),
  );

  return {
    overallQaScore,
    structureScore,
    routingScore,
    layoutScore,
    readabilityScore,
  };
}

function getMapQualityBand(score) {
  const numeric = Number(score || 0);
  if (numeric >= 88) return "score-excellent";
  if (numeric >= 72) return "score-good";
  if (numeric >= 56) return "score-review";
  if (numeric >= 40) return "score-poor";
  return "score-broken";
}

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildQaDebugSvg(generatedMap, qaCase, validation = {}) {
  const gridSize = Number(generatedMap?.config?.gridSize || qaCase?.config?.gridSize || DEFAULT_CONFIG.gridSize || 20);
  const floorBounds = validation.metrics?.layoutQuality?.floorBounds || getCellBounds(generatedMap?.dungeonMask?.floorCells);
  const width = Number(generatedMap?.bounds?.width || generatedMap?.config?.mapWidth || qaCase?.config?.mapWidth || DEFAULT_CONFIG.mapWidth || 1600);
  const height = Number(generatedMap?.bounds?.height || generatedMap?.config?.mapHeight || qaCase?.config?.mapHeight || DEFAULT_CONFIG.mapHeight || 1000);
  const padding = gridSize * 2;
  const minX = Math.max(0, (floorBounds?.minX || 0) * gridSize - padding);
  const minY = Math.max(0, (floorBounds?.minY || 0) * gridSize - padding);
  const viewWidth = Math.min(width, ((floorBounds?.width || Math.round(width / gridSize)) * gridSize) + padding * 2);
  const viewHeight = Math.min(height, ((floorBounds?.height || Math.round(height / gridSize)) * gridSize) + padding * 2);
  const roomRects = asArray(generatedMap?.regions).flatMap((region) =>
    asArray(region.floorCells).map((cell) =>
      `<rect class="room-cell" data-region="${escapeXml(region.id)}" x="${cell.x * gridSize}" y="${cell.y * gridSize}" width="${gridSize}" height="${gridSize}" fill="rgba(214,184,98,.30)" stroke="rgba(29,25,21,.28)"/>`,
    )
  );
  const corridorRects = asArray(generatedMap?.corridors).flatMap((corridor) =>
    asArray(corridor.floorCells).map((cell) =>
      `<rect class="corridor-cell" data-corridor="${escapeXml(corridor.id)}" x="${cell.x * gridSize}" y="${cell.y * gridSize}" width="${gridSize}" height="${gridSize}" fill="rgba(122,67,36,.42)" stroke="rgba(29,25,21,.22)"/>`,
    )
  );
  const labels = asArray(generatedMap?.regions).map((region, index) => {
    const centroid = getRegionCentroid(region);
    return `<text x="${(centroid.x + 0.5) * gridSize}" y="${(centroid.y + 0.55) * gridSize}" text-anchor="middle" font-size="12" font-family="Inter, Arial, sans-serif" font-weight="800" fill="#1d1915">${index + 1}</text>`;
  });
  const corridorLabels = asArray(generatedMap?.corridors).map((corridor) => {
    const cells = asArray(corridor.floorCells);
    const mid = cells[Math.floor(cells.length / 2)];
    if (!mid) return "";
    return `<text x="${(mid.x + 0.5) * gridSize}" y="${(mid.y + 0.48) * gridSize}" text-anchor="middle" font-size="8" font-family="Inter, Arial, sans-serif" fill="#33030c">${escapeXml(corridor.id || "corridor")}</text>`;
  });
  const issueNotes = asArray(validation.issues).map((issue, index) =>
    `<text x="${minX + 10}" y="${minY + 18 + index * 14}" font-size="11" font-family="Inter, Arial, sans-serif" fill="#33030c">${escapeXml(`${issue.severity.toUpperCase()} ${issue.area}/${issue.check}`)}</text>`,
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${viewWidth} ${viewHeight}" role="img" aria-label="Map QA debug SVG for ${escapeXml(qaCase?.id || "map")}">
  <rect x="${minX}" y="${minY}" width="${viewWidth}" height="${viewHeight}" fill="#efe4ca"/>
  <g class="corridors">${corridorRects.join("\n")}</g>
  <g class="rooms">${roomRects.join("\n")}</g>
  <g class="room-labels">${labels.join("\n")}</g>
  <g class="corridor-labels">${corridorLabels.join("\n")}</g>
  <g class="qa-issues">${issueNotes.join("\n")}</g>
</svg>`;
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
    includeFailingSvg: Boolean(options.includeFailingSvg),
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
  const roomCellOwners = buildRoomCellOwners(regions);
  const layoutQuality = getLayoutQualityMetrics(generatedMap, qaCase);
  const corridorRouteMetrics = corridors.map((corridor) => getCorridorRouteMetrics(corridor, regionsById));
  const corridorTunnelHits = getCorridorRoomTunnels(corridors, roomCellOwners);
  const maxCorridorSpan = Math.max(0, ...corridorRouteMetrics.map((metric) => metric.maxSpan || 0));
  const maxStraightRun = Math.max(0, ...corridorRouteMetrics.map((metric) => metric.maxStraightRun || 0));
  const maxDetourRatio = Math.max(0, ...corridorRouteMetrics.map((metric) => metric.detourRatio || 0));
  const longSpanThreshold = Math.max(24, Math.round(qaCase.roomCount * 3.4));
  const straightRunThreshold = Math.max(18, Math.round(qaCase.roomCount * 2.4));
  const detourRatioThreshold = 3.25;
  const averageNearestThreshold = Math.max(13, Math.round(qaCase.roomCount * 1.55));

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


  if (corridorTunnelHits.length) {
    issues.push(makeMapQaIssue({
      severity: "error",
      area: "routing",
      check: "corridor-room-tunneling",
      id,
      title,
      path: "generatedMap.corridors.floorCells",
      message: `${corridorTunnelHits.length} corridor cell(s) pass through non-endpoint room floor.` ,
      recommendation: "Re-route corridors so they touch endpoint rooms only at valid anchors/doors and never tunnel below unrelated room floors.",
      details: {
        hitCount: corridorTunnelHits.length,
        examples: corridorTunnelHits.slice(0, 24),
      },
    }));
  }

  const excessiveSpanCorridors = corridorRouteMetrics.filter((metric) => metric.maxSpan > longSpanThreshold && metric.length > longSpanThreshold);
  if (excessiveSpanCorridors.length) {
    issues.push(makeMapQaIssue({
      severity: "warning",
      area: "routing",
      check: "corridor-excessive-span",
      id,
      title,
      path: "generatedMap.corridors.floorCells",
      message: `${excessiveSpanCorridors.length} corridor(s) span an unusually large portion of the map.` ,
      recommendation: "Prefer more compact placement, intermediate junctions, or graph/layout scoring that penalizes map-wide connector corridors.",
      details: {
        thresholdCells: longSpanThreshold,
        maxCorridorSpan,
        corridors: excessiveSpanCorridors.slice(0, 12),
      },
    }));
  }

  const longStraightCorridors = corridorRouteMetrics.filter((metric) => metric.maxStraightRun > straightRunThreshold);
  if (longStraightCorridors.length) {
    issues.push(makeMapQaIssue({
      severity: "warning",
      area: "routing",
      check: "corridor-long-straight-run",
      id,
      title,
      path: "generatedMap.corridors.floorCells",
      message: `${longStraightCorridors.length} corridor(s) contain an unusually long straight run.` ,
      recommendation: "Penalize very long rectilinear runs or insert junction/turn constraints so generated maps do not become strip-like.",
      details: {
        thresholdCells: straightRunThreshold,
        maxStraightRun,
        corridors: longStraightCorridors.slice(0, 12),
      },
    }));
  }

  const highDetourCorridors = corridorRouteMetrics.filter((metric) => metric.length > 12 && metric.detourRatio > detourRatioThreshold);
  if (highDetourCorridors.length) {
    issues.push(makeMapQaIssue({
      severity: "warning",
      area: "routing",
      check: "route-detour-ratio",
      id,
      title,
      path: "generatedMap.corridors.floorCells",
      message: `${highDetourCorridors.length} corridor route(s) are much longer than their endpoint distance.` ,
      recommendation: "Use route scoring to avoid pathfinding detours that imply hidden tunneling, doubled-back corridors, or excessive canvas-wide routing.",
      details: {
        threshold: detourRatioThreshold,
        maxDetourRatio,
        corridors: highDetourCorridors.slice(0, 12),
      },
    }));
  }

  if (layoutQuality.aspectRatio > 2.85 || (layoutQuality.aspectRatio > 0 && layoutQuality.aspectRatio < 0.35)) {
    issues.push(makeMapQaIssue({
      severity: "warning",
      area: "layout",
      check: "layout-aspect-ratio-outlier",
      id,
      title,
      path: "generatedMap.dungeonMask.floorCells",
      message: `Map content is unusually oblong (aspect ratio ${layoutQuality.aspectRatio}).`,
      recommendation: "Improve placement scoring so rooms occupy a compact composition instead of a long strip.",
      details: layoutQuality,
    }));
  }

  if (layoutQuality.roomDistribution.averageNearestDistance > averageNearestThreshold) {
    issues.push(makeMapQaIssue({
      severity: "warning",
      area: "layout",
      check: "layout-room-distribution-outlier",
      id,
      title,
      path: "generatedMap.regions.floorCells",
      message: `Rooms are unusually sparse; average nearest-room distance is ${layoutQuality.roomDistribution.averageNearestDistance} cells.`,
      recommendation: "Compact the placement graph or penalize isolated clusters when generating layout candidates.",
      details: {
        thresholdCells: averageNearestThreshold,
        ...layoutQuality.roomDistribution,
        floorBounds: layoutQuality.floorBounds,
      },
    }));
  }

  if (layoutQuality.canvasUsage > 0 && layoutQuality.canvasUsage < 0.08 && (layoutQuality.floorWidthRatio < 0.32 || layoutQuality.floorHeightRatio < 0.32)) {
    issues.push(makeMapQaIssue({
      severity: "warning",
      area: "layout",
      check: "layout-unused-canvas-waste",
      id,
      title,
      path: "generatedMap.dungeonMask.floorCells",
      message: `Map uses only ${(layoutQuality.canvasUsage * 100).toFixed(1)}% of the available canvas envelope.` ,
      recommendation: "Center and scale layout candidates or reject candidates that waste most of the available canvas.",
      details: layoutQuality,
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
      corridorTunnelCount: corridorTunnelHits.length,
      excessiveSpanCorridors: excessiveSpanCorridors.length,
      longStraightCorridors: longStraightCorridors.length,
      highDetourCorridors: highDetourCorridors.length,
      maxCorridorSpan,
      maxStraightRun,
      maxDetourRatio,
      layoutQuality,
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
    const status = issueSummary.error ? "failed" : issueSummary.warning ? "review" : "passed";
    const quality = calculateMapQualityScores({ issueSummary, metrics: validation.metrics, status });
    const debugSvg = normalized.includeFailingSvg && issueSummary.total
      ? buildQaDebugSvg(generatedMap, qaCase, validation)
      : "";

    return {
      id: qaCase.id,
      status,
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
      quality,
      qualityBand: getMapQualityBand(quality.overallQaScore),
      metrics: {
        ...validation.metrics,
        quality,
        qualityBand: getMapQualityBand(quality.overallQaScore),
      },
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
            debugSvg: debugSvg || undefined,
            debugSvgNote: debugSvg ? "QA structural SVG: room/corridor cell reconstruction for failed or review maps." : undefined,
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
      quality: { overallQaScore: 0, structureScore: 0, routingScore: 0, layoutScore: 0, readabilityScore: 0 },
      qualityBand: "broken",
      metrics: { quality: { overallQaScore: 0, structureScore: 0, routingScore: 0, layoutScore: 0, readabilityScore: 0 }, qualityBand: "broken" },
      issues: [issue],
      debugPayload: { qaCase, issue },
    };
  }
}


function createEmptyBreakdownEntry(key, label = key) {
  return {
    key,
    label,
    generated: 0,
    passed: 0,
    review: 0,
    failed: 0,
    errors: 0,
    warnings: 0,
    scoreTotal: 0,
    averageScore: 0,
  };
}

function addMapToBreakdown(map, entry) {
  entry.generated += 1;
  entry.passed += map.status === "passed" ? 1 : 0;
  entry.review += map.status === "review" ? 1 : 0;
  entry.failed += map.status === "failed" ? 1 : 0;
  entry.errors += Number(map.errorCount || 0);
  entry.warnings += Number(map.warningCount || 0);
  entry.scoreTotal += Number(map.quality?.overallQaScore ?? map.metrics?.quality?.overallQaScore ?? 0);
  entry.averageScore = entry.generated ? Number((entry.scoreTotal / entry.generated).toFixed(1)) : 0;
  return entry;
}

function buildMapBreakdown(maps = [], keyGetter, labelGetter = keyGetter) {
  const entries = new Map();
  asArray(maps).forEach((map) => {
    const key = cleanString(keyGetter(map), "unknown");
    const label = cleanString(labelGetter(map), key);
    const entry = entries.get(key) || createEmptyBreakdownEntry(key, label);
    addMapToBreakdown(map, entry);
    entries.set(key, entry);
  });
  return [...entries.values()]
    .map(({ scoreTotal, ...entry }) => entry)
    .sort((a, b) => b.failed - a.failed || b.warnings - a.warnings || a.averageScore - b.averageScore || a.label.localeCompare(b.label));
}

function getRoomCountBucket(map = {}) {
  const count = Number(map.roomCount || map.metrics?.regions || 0);
  if (count <= 4) return "1–4";
  if (count <= 8) return "5–8";
  if (count <= 12) return "9–12";
  return "13–16";
}

function buildWorstCaseIndex(report = {}, limit = 30) {
  const candidates = getMapDebugExportCandidates(report, limit);
  return candidates
    .map((item, index) => ({
      rank: index + 1,
      id: item.id,
      status: item.status,
      qualityBand: item.qualityBand || item.metrics?.qualityBand,
      quality: item.quality || item.metrics?.quality,
      themeId: item.themeId,
      themeName: item.themeName,
      context: item.context,
      roomCount: item.roomCount,
      scale: item.scale,
      complexity: item.complexity,
      visualStyle: item.visualStyle,
      seed: item.seed,
      issueCount: item.issueCount,
      errorCount: item.errorCount,
      warningCount: item.warningCount,
      issueSummary: asArray(item.issues).slice(0, 8).map((issue) => ({
        severity: issue.severity,
        area: issue.area,
        check: issue.check,
        message: issue.message,
      })),
      routing: {
        corridorTunnelCount: item.metrics?.corridorTunnelCount || 0,
        maxCorridorSpan: item.metrics?.maxCorridorSpan || 0,
        maxStraightRun: item.metrics?.maxStraightRun || 0,
        maxDetourRatio: item.metrics?.maxDetourRatio || 0,
      },
      layout: {
        aspectRatio: item.metrics?.layoutQuality?.aspectRatio,
        canvasUsage: item.metrics?.layoutQuality?.canvasUsage,
        averageNearestDistance: item.metrics?.layoutQuality?.roomDistribution?.averageNearestDistance,
      },
      debugJsonFilename: `debug/maps/${getMapDebugBaseName(item)}.json`,
      debugSvgFilename: item.debugPayload?.debugSvg ? `debug/svg/${getMapDebugBaseName(item)}.svg` : null,
    }));
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
      summary.corridorTunnelFailures += Number(item.metrics?.corridorTunnelCount || 0) > 0 ? 1 : 0;
      summary.longCorridorWarnings += (Number(item.metrics?.excessiveSpanCorridors || 0) > 0 || Number(item.metrics?.longStraightCorridors || 0) > 0) ? 1 : 0;
      summary.routingDetourWarnings += Number(item.metrics?.highDetourCorridors || 0) > 0 ? 1 : 0;
      summary.layoutOutliers += asArray(item.issues).some((issue) => issue.area === "layout") ? 1 : 0;
      summary.svgDebugPayloads += item.debugPayload?.debugSvg ? 1 : 0;
      summary.debugCandidatesAvailable += isRequiredMapDebugCandidate(item) || isOptionalMapDebugCandidate(item) ? 1 : 0;
      const score = Number(item.quality?.overallQaScore ?? item.metrics?.quality?.overallQaScore ?? 0);
      summary.totalOverallQaScore += score;
      summary.totalLayoutScore += Number(item.quality?.layoutScore ?? item.metrics?.quality?.layoutScore ?? 0);
      summary.totalRoutingScore += Number(item.quality?.routingScore ?? item.metrics?.quality?.routingScore ?? 0);
      summary.totalStructureScore += Number(item.quality?.structureScore ?? item.metrics?.quality?.structureScore ?? 0);
      summary.totalReadabilityScore += Number(item.quality?.readabilityScore ?? item.metrics?.quality?.readabilityScore ?? 0);
      const band = item.qualityBand || item.metrics?.qualityBand || getMapQualityBand(score);
      summary.qualityBands[band] = (summary.qualityBands[band] || 0) + 1;
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
      corridorTunnelFailures: 0,
      longCorridorWarnings: 0,
      routingDetourWarnings: 0,
      layoutOutliers: 0,
      debugCandidatesAvailable: 0,
      svgDebugPayloads: 0,
      totalOverallQaScore: 0,
      totalLayoutScore: 0,
      totalRoutingScore: 0,
      totalStructureScore: 0,
      totalReadabilityScore: 0,
      qualityBands: {},
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
    averageOverallQaScore: Number((totals.totalOverallQaScore / count).toFixed(1)),
    averageLayoutScore: Number((totals.totalLayoutScore / count).toFixed(1)),
    averageRoutingScore: Number((totals.totalRoutingScore / count).toFixed(1)),
    averageStructureScore: Number((totals.totalStructureScore / count).toFixed(1)),
    averageReadabilityScore: Number((totals.totalReadabilityScore / count).toFixed(1)),
    breakdowns: {
      byContext: buildMapBreakdown(maps, (item) => item.context),
      byTheme: buildMapBreakdown(maps, (item) => item.themeId, (item) => item.themeName || item.themeId),
      byRoomCount: buildMapBreakdown(maps, (item) => String(item.roomCount), (item) => `${item.roomCount} rooms`),
      byRoomCountBucket: buildMapBreakdown(maps, getRoomCountBucket, (item) => `${getRoomCountBucket(item)} rooms`),
    },
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

export function buildMapBatchQaMarkdown(report = {}, { debugExportStats = null } = {}) {
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
  lines.push(`- Corridor Tunneling Failures: ${analytics.corridorTunnelFailures ?? 0}`);
  lines.push(`- Long Corridor Warnings: ${analytics.longCorridorWarnings ?? 0}`);
  lines.push(`- Routing Detour Warnings: ${analytics.routingDetourWarnings ?? 0}`);
  lines.push(`- Layout Outliers: ${analytics.layoutOutliers ?? 0}`);
  lines.push(`- Debug Candidates Available: ${analytics.debugCandidatesAvailable ?? analytics.svgDebugPayloads ?? 0}`);
  if (debugExportStats) {
    lines.push(`- Debug Files Written: ${debugExportStats.debugMapCount ?? 0} maps / ${debugExportStats.debugSvgCount ?? 0} SVG`);
    lines.push(`- Failed Maps Missing Debug Payload: ${debugExportStats.failedMissingDebugPayload ?? 0}`);
  }
  lines.push(`- Avg QA Score: ${analytics.averageOverallQaScore ?? 0}/100`);
  lines.push(`- Avg Structure Score: ${analytics.averageStructureScore ?? 0}/100`);
  lines.push(`- Avg Routing Score: ${analytics.averageRoutingScore ?? 0}/100`);
  lines.push(`- Avg Layout Score: ${analytics.averageLayoutScore ?? 0}/100`);
  lines.push(`- Avg Readability Score: ${analytics.averageReadabilityScore ?? 0}/100`);
  lines.push(`- Score Bands: ${Object.entries(analytics.qualityBands || {}).map(([key, value]) => `${key} ${value}`).join(", ") || "none"}`);
  lines.push(`- Avg Rooms: ${analytics.averageRooms ?? 0}`);
  lines.push(`- Avg Corridors: ${analytics.averageCorridors ?? 0}`);
  lines.push(`- Avg Doors: ${analytics.averageDoors ?? 0}`);
  lines.push(`- Avg Runtime: ${analytics.averageElapsedMs ?? 0}ms`);
  lines.push("");
  lines.push("## Breakdown");
  const breakdowns = analytics.breakdowns || {};
  const renderBreakdown = (label, entries = []) => {
    lines.push(`### ${label}`);
    if (!entries.length) {
      lines.push("No entries.");
      return;
    }
    entries.slice(0, 18).forEach((entry) => {
      lines.push(`- ${entry.label}: ${entry.generated} maps · ${entry.failed} failed · ${entry.review} review · ${entry.passed} passed · avg score ${entry.averageScore}/100`);
    });
    lines.push("");
  };
  renderBreakdown("By Context", breakdowns.byContext || []);
  renderBreakdown("By Room Count Bucket", breakdowns.byRoomCountBucket || []);
  renderBreakdown("By Theme", breakdowns.byTheme || []);
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
  lines.push("## Worst Cases");
  const worstCases = buildWorstCaseIndex(report, debugExportStats?.worstCaseLimit || 20);
  if (!worstCases.length) {
    lines.push("No worst-case candidates.");
  } else {
    worstCases.forEach((item) => {
      lines.push(`- #${item.rank} ${item.id} · ${item.status} · score ${item.quality?.overallQaScore ?? "?"}/100 · ${item.themeName} · ${item.context} · ${item.roomCount} rooms`);
      lines.push(`  - Issues: ${item.errorCount} error(s), ${item.warningCount} warning(s); routing tunnel ${item.routing.corridorTunnelCount}, max straight ${item.routing.maxStraightRun}, aspect ${item.layout.aspectRatio ?? "?"}`);
      lines.push(`  - Files: ${item.debugJsonFilename}${item.debugSvgFilename ? ` · ${item.debugSvgFilename}` : ""}`);
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
      lines.push(`  - Score: ${item.quality?.overallQaScore ?? item.metrics?.quality?.overallQaScore ?? "?"}/100 (${item.qualityBand || item.metrics?.qualityBand || "unknown"})`);
      lines.push(`  - Metrics: ${item.metrics?.regions ?? "?"} regions, ${item.metrics?.corridors ?? "?"} corridors, ${item.metrics?.doors ?? "?"} doors, ${item.metrics?.floorCells ?? "?"} floor cells`);
      lines.push(`  - Routing: ${item.metrics?.corridorTunnelCount ?? 0} tunnel cells, max span ${item.metrics?.maxCorridorSpan ?? 0}, max straight ${item.metrics?.maxStraightRun ?? 0}, max detour ${item.metrics?.maxDetourRatio ?? 0}`);
      lines.push(`  - Layout: aspect ${item.metrics?.layoutQuality?.aspectRatio ?? "?"}, avg nearest room ${item.metrics?.layoutQuality?.roomDistribution?.averageNearestDistance ?? "?"}`);
      lines.push(`  - Seed: ${item.seed}`);
    });
  }
  lines.push("");

  return lines.join("\n");
}

function sanitizeQaFilenamePart(value, fallback = "map") {
  const text = cleanString(value, fallback).toLowerCase();
  return text.replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
}

function getMapDebugBaseName(item = {}) {
  return sanitizeQaFilenamePart(item.id || item.seed || "map");
}

function buildMapBatchQaCompactReport(report = {}, { inlineDebugSvg = false, debugCandidateIds = null, debugExportStats = null } = {}) {
  const includeDebugReference = (item) => debugCandidateIds == null || debugCandidateIds.has(item.id);
  const compactReport = {
    ...report,
    exportProfile: {
      kind: "compact-browser-map-qa-report",
      note: inlineDebugSvg
        ? "Debug SVG is embedded inline because this report was exported as standalone JSON. Prefer ZIP export for large runs."
        : "Heavy debug SVG payloads are omitted from compact JSON. ZIP debug/full exports store SVG in separate files.",
      debugExportStats: debugExportStats || undefined,
    },
    suites: asArray(report.suites).map((suite) => ({
      ...suite,
      metrics: {
        ...suite.metrics,
        generated: asArray(suite.metrics?.generated).map((item) => {
          const hasDebugSvg = Boolean(item.debugPayload?.debugSvg);
          const shouldReferenceDebug = hasDebugSvg && includeDebugReference(item);
          return {
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
            quality: item.quality || item.metrics?.quality,
            qualityBand: item.qualityBand || item.metrics?.qualityBand,
            metrics: item.metrics,
            debugPayload: hasDebugSvg && inlineDebugSvg
              ? {
                  debugSvg: item.debugPayload.debugSvg,
                  debugSvgNote: item.debugPayload.debugSvgNote,
                }
              : shouldReferenceDebug
                ? {
                    debugSvgFilename: `debug/svg/${getMapDebugBaseName(item)}.svg`,
                    debugJsonFilename: `debug/maps/${getMapDebugBaseName(item)}.json`,
                    debugSvgNote: item.debugPayload.debugSvgNote,
                  }
                : undefined,
          };
        }),
      },
    })),
  };
  return compactReport;
}

function createCrc32Table() {
  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

const CRC32_TABLE = createCrc32Table();
const ZIP_REVOKE_DELAY_MS = 60_000;
const LONG_MAP_EXPORT_STRING_LIMIT = 8_000;
const MAX_MAP_EXPORT_DEPTH = 8;
const MAP_HEAVY_EXPORT_KEYS = new Set(["debugSvg", "svg", "html", "markup", "renderedHtml"]);

function calculateCrc32(bytes) {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = CRC32_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function pushUint16(bytes, value) {
  bytes.push(value & 0xff, (value >>> 8) & 0xff);
}

function pushUint32(bytes, value) {
  bytes.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function concatUint8Arrays(parts) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function getExportTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function stripMapQaDebugPayload(value, depth = 0) {
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length <= LONG_MAP_EXPORT_STRING_LIMIT) return value;
    return `${value.slice(0, LONG_MAP_EXPORT_STRING_LIMIT)}… [truncated ${value.length - LONG_MAP_EXPORT_STRING_LIMIT} chars]`;
  }
  if (typeof value !== "object") return value;
  if (depth >= MAX_MAP_EXPORT_DEPTH) return "[truncated: depth limit]";
  if (Array.isArray(value)) return value.map((item) => stripMapQaDebugPayload(item, depth + 1));

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !MAP_HEAVY_EXPORT_KEYS.has(key))
      .map(([key, entry]) => [key, stripMapQaDebugPayload(entry, depth + 1)]),
  );
}

function isRequiredMapDebugCandidate(item = {}) {
  return item?.status === "failed" || Number(item?.errorCount || 0) > 0;
}

function isOptionalMapDebugCandidate(item = {}) {
  const score = Number(item?.quality?.overallQaScore ?? item?.metrics?.quality?.overallQaScore ?? 100);
  return Boolean(item?.debugPayload)
    || Number(item?.issueCount || 0) > 0
    || item?.status === "review"
    || score < 72;
}

function sortMapDebugCandidates(maps = []) {
  return [...asArray(maps)].sort((a, b) => scoreMapDebugExportCandidate(b) - scoreMapDebugExportCandidate(a));
}

function getMapDebugExportStats(report = {}, candidates = [], { worstCaseLimit = DEFAULT_MAP_DEBUG_EXPORT_LIMIT } = {}) {
  const allMaps = getGeneratedMaps(report);
  const candidateIds = new Set(asArray(candidates).map((item) => item.id));
  const failedMaps = allMaps.filter(isRequiredMapDebugCandidate);
  const failedMissingDebugPayloadIds = failedMaps
    .filter((item) => !candidateIds.has(item.id) || !item.debugPayload)
    .map((item) => item.id);
  return {
    debugMapCount: candidates.length,
    debugSvgCount: candidates.filter((item) => item.debugPayload?.debugSvg).length,
    failedMapCount: failedMaps.length,
    failedMissingDebugPayload: failedMissingDebugPayloadIds.length,
    failedMissingDebugPayloadIds,
    worstCaseLimit,
  };
}

function scoreMapDebugExportCandidate(item = {}) {
  return (
    Number(item.errorCount || 0) * 140 +
    Number(item.warningCount || 0) * 45 +
    Number(item.issueCount || 0) * 65 +
    Number(item.metrics?.corridorTunnelCount || 0) * 110 +
    Number(item.metrics?.excessiveSpanCorridors || 0) * 55 +
    Number(item.metrics?.longStraightCorridors || 0) * 50 +
    Number(item.metrics?.highDetourCorridors || 0) * 35 +
    (item.status === "failed" ? 160 : 0) +
    (item.status === "review" ? 50 : 0)
  );
}

function getMapDebugExportCandidates(report = {}, limit = DEFAULT_MAP_DEBUG_EXPORT_LIMIT) {
  const normalizedLimit = normalizeInteger(limit, DEFAULT_MAP_DEBUG_EXPORT_LIMIT, 1, 500);
  const maps = getGeneratedMaps(report);
  const required = sortMapDebugCandidates(maps.filter(isRequiredMapDebugCandidate));
  const requiredIds = new Set(required.map((item) => item.id));
  const optional = sortMapDebugCandidates(
    maps.filter((item) => !requiredIds.has(item.id) && isOptionalMapDebugCandidate(item)),
  ).slice(0, Math.max(0, normalizedLimit - required.length));
  return [...required, ...optional];
}

function getSafeMapDebugPayload(item = {}) {
  return stripMapQaDebugPayload({
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
    issues: item.issues,
    debugPayload: item.debugPayload,
  });
}

function buildMapBatchQaDebugIndex(report = {}, candidates = [], debugExportStats = null) {
  const suite = getBatchSuite(report);
  return {
    exportProfile: {
      kind: "debug-browser-map-qa-report",
      note: "Compact report plus separate debug JSON/SVG files for failed, warning, or outlier maps.",
      debugPayloadCount: debugExportStats?.debugMapCount ?? candidates.length,
      svgPayloadCount: debugExportStats?.debugSvgCount ?? candidates.filter((item) => item.debugPayload?.debugSvg).length,
      failedMapCount: debugExportStats?.failedMapCount,
      failedMissingDebugPayload: debugExportStats?.failedMissingDebugPayload,
      failedMissingDebugPayloadIds: debugExportStats?.failedMissingDebugPayloadIds,
    },
    generatedAt: report.generatedAt,
    metadata: report.metadata,
    summary: report.summary,
    analytics: suite.metrics?.analytics,
    worstCasesFilename: "debug/worst-cases.json",
    candidates: candidates.map((item) => ({
      id: item.id,
      status: item.status,
      themeId: item.themeId,
      themeName: item.themeName,
      context: item.context,
      roomCount: item.roomCount,
      issueCount: item.issueCount,
      errorCount: item.errorCount,
      warningCount: item.warningCount,
      quality: item.quality || item.metrics?.quality,
      qualityBand: item.qualityBand || item.metrics?.qualityBand,
      metrics: item.metrics,
      debugJsonFilename: `debug/maps/${getMapDebugBaseName(item)}.json`,
      debugSvgFilename: item.debugPayload?.debugSvg ? `debug/svg/${getMapDebugBaseName(item)}.svg` : null,
    })),
  };
}

function buildMapBatchQaReadme({ exportMode, debugCount, svgCount, failedMissingDebugPayload = 0, timestamp }) {
  const mode = normalizeExportMode(exportMode);
  const lines = [
    "Cruor Map Batch QA Export",
    "",
    `Export Mode: ${mode}`,
    `Timestamp: ${timestamp}`,
    "",
  ];

  if (mode === "compact") {
    lines.push("This ZIP contains a compact JSON report and Markdown summary for aggregate analysis.");
    lines.push("Debug SVG and heavy generated payloads are omitted.");
  } else if (mode === "debug") {
    lines.push("This ZIP contains a compact JSON report, Markdown summary, worst-case index, and separate debug files for failed/warning/outlier maps.");
    lines.push("It intentionally does not include the giant full.json payload. Use Full ZIP only when you need that.");
    lines.push(`Debug JSON files: ${debugCount}`);
    lines.push(`Debug SVG files: ${svgCount}`);
    lines.push(`Failed maps missing debug payload: ${failedMissingDebugPayload}`);
    lines.push("Use debug/debug-index.json and debug/worst-cases.json to match map IDs to debug files.");
  } else {
    lines.push("This ZIP contains the compact report, Markdown summary, debug index/files, and the full in-browser QA report object.");
    lines.push("Use only when you intentionally need the complete payload.");
  }

  return `${lines.join("\n")}\n`;
}

async function deflateRawBytes(bytes) {
  if (typeof CompressionStream === "undefined") return null;
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch (error) {
    return null;
  }
}

async function buildZipBlob(files = [], { compress = true } = {}) {
  const encoder = new TextEncoder();
  const now = new Date();
  const dos = getDosDateTime(now);
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
    const compressedBytes = compress ? await deflateRawBytes(contentBytes) : null;
    const shouldUseCompression = compressedBytes && compressedBytes.length > 0 && compressedBytes.length < contentBytes.length;
    const payloadBytes = shouldUseCompression ? compressedBytes : contentBytes;
    const compressionMethod = shouldUseCompression ? 8 : 0;
    const crc = calculateCrc32(contentBytes);
    const compressedSize = payloadBytes.length;
    const uncompressedSize = contentBytes.length;

    const localHeader = [];
    pushUint32(localHeader, 0x04034b50);
    pushUint16(localHeader, 20);
    pushUint16(localHeader, 0x0800);
    pushUint16(localHeader, compressionMethod);
    pushUint16(localHeader, dos.time);
    pushUint16(localHeader, dos.date);
    pushUint32(localHeader, crc);
    pushUint32(localHeader, compressedSize);
    pushUint32(localHeader, uncompressedSize);
    pushUint16(localHeader, nameBytes.length);
    pushUint16(localHeader, 0);

    const localPart = concatUint8Arrays([new Uint8Array(localHeader), nameBytes, payloadBytes]);
    localParts.push(localPart);

    const centralHeader = [];
    pushUint32(centralHeader, 0x02014b50);
    pushUint16(centralHeader, 20);
    pushUint16(centralHeader, 20);
    pushUint16(centralHeader, 0x0800);
    pushUint16(centralHeader, compressionMethod);
    pushUint16(centralHeader, dos.time);
    pushUint16(centralHeader, dos.date);
    pushUint32(centralHeader, crc);
    pushUint32(centralHeader, compressedSize);
    pushUint32(centralHeader, uncompressedSize);
    pushUint16(centralHeader, nameBytes.length);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint32(centralHeader, 0);
    pushUint32(centralHeader, offset);

    centralParts.push(concatUint8Arrays([new Uint8Array(centralHeader), nameBytes]));
    offset += localPart.length;
  }

  const centralDirectory = concatUint8Arrays(centralParts);
  const centralOffset = offset;
  const endRecord = [];
  pushUint32(endRecord, 0x06054b50);
  pushUint16(endRecord, 0);
  pushUint16(endRecord, 0);
  pushUint16(endRecord, files.length);
  pushUint16(endRecord, files.length);
  pushUint32(endRecord, centralDirectory.length);
  pushUint32(endRecord, centralOffset);
  pushUint16(endRecord, 0);

  return new Blob([concatUint8Arrays([...localParts, centralDirectory, new Uint8Array(endRecord)])], { type: "application/zip" });
}

export async function buildMapBatchQaZipBlob(report = {}, {
  filenamePrefix = "cruor-map-batch-qa",
  timestamp = getExportTimestamp(),
  exportMode = "debug",
  debugLimit = DEFAULT_MAP_DEBUG_EXPORT_LIMIT,
} = {}) {
  const mode = normalizeExportMode(exportMode);
  const debugCandidates = mode === "debug" || mode === "full" ? getMapDebugExportCandidates(report, debugLimit) : [];
  const debugExportStats = mode === "debug" || mode === "full"
    ? getMapDebugExportStats(report, debugCandidates, { worstCaseLimit: debugLimit })
    : null;
  const debugCandidateIds = new Set(debugCandidates.map((item) => item.id));
  const compactReport = buildMapBatchQaCompactReport(report, { inlineDebugSvg: false, debugCandidateIds, debugExportStats });
  const files = [
    {
      name: `${filenamePrefix}-${timestamp}.compact.json`,
      content: JSON.stringify(compactReport, null, 2),
    },
    {
      name: `${filenamePrefix}-${timestamp}.md`,
      content: buildMapBatchQaMarkdown(report, { debugExportStats }),
    },
  ];

  if (mode === "debug" || mode === "full") {
    files.push({
      name: "debug/debug-index.json",
      content: JSON.stringify(buildMapBatchQaDebugIndex(report, debugCandidates, debugExportStats), null, 2),
    });
    files.push({
      name: "debug/worst-cases.json",
      content: JSON.stringify(buildWorstCaseIndex(report, debugLimit), null, 2),
    });

    debugCandidates.forEach((item) => {
      const baseName = getMapDebugBaseName(item);
      files.push({
        name: `debug/maps/${baseName}.json`,
        content: JSON.stringify(getSafeMapDebugPayload(item), null, 2),
      });
      if (item.debugPayload?.debugSvg) {
        files.push({
          name: `debug/svg/${baseName}.svg`,
          content: item.debugPayload.debugSvg,
        });
      }
    });
  }

  if (mode === "full") {
    files.push({
      name: `${filenamePrefix}-${timestamp}.full.json`,
      content: JSON.stringify(report, null, 2),
    });
  }

  files.push({
    name: "README.txt",
    content: buildMapBatchQaReadme({
      exportMode: mode,
      debugCount: debugExportStats?.debugMapCount ?? debugCandidates.length,
      svgCount: debugExportStats?.debugSvgCount ?? debugCandidates.filter((item) => item.debugPayload?.debugSvg).length,
      failedMissingDebugPayload: debugExportStats?.failedMissingDebugPayload ?? 0,
      timestamp,
    }),
  });

  return buildZipBlob(files, { compress: true });
}

function downloadBlobFile({ blob, filename }) {
  if (typeof document === "undefined") return;
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
  }, ZIP_REVOKE_DELAY_MS);
}

export async function downloadMapBatchQaReport(report = {}, {
  format = "zip",
  filenamePrefix = "cruor-map-batch-qa",
  exportMode = "debug",
  debugLimit = DEFAULT_MAP_DEBUG_EXPORT_LIMIT,
} = {}) {
  const timestamp = getExportTimestamp();
  const mode = normalizeExportMode(exportMode);
  const isMarkdown = format === "markdown";
  const isZip = format === "zip";
  const blob = isZip
    ? await buildMapBatchQaZipBlob(report, { filenamePrefix, timestamp, exportMode: mode, debugLimit })
    : new Blob([
        isMarkdown
          ? buildMapBatchQaMarkdown(report)
          : JSON.stringify(buildMapBatchQaCompactReport(report, { inlineDebugSvg: true }), null, 2),
      ], { type: isMarkdown ? "text/markdown;charset=utf-8" : "application/json;charset=utf-8" });

  downloadBlobFile({
    blob,
    filename: `${filenamePrefix}-${timestamp}${isZip ? `-${mode}` : ""}.${isZip ? "zip" : isMarkdown ? "md" : "json"}`,
  });
}

export {
  DEFAULT_SEED,
  normalizeExportMode,
};
