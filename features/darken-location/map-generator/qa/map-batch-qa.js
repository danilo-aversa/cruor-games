import { DEFAULT_CONFIG } from "../map-generator.input.js";
import { generateMap } from "../map-generator.pipeline.js";
import {
  getNonEndpointRoomTunnelHits,
  getRoomCellOwnershipMap,
} from "../map-generator.corridors.js";

export const MAP_BATCH_QA_VERSION = "map-qa-v0.3.3-connections-metadata-only";

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

function getContextPool(context = "mixed") {
  const requested = normalizeText(context, "mixed");
  if (requested.toLowerCase() === "mixed") return DEFAULT_CONTEXTS;
  return DEFAULT_CONTEXTS.includes(requested) ? [requested] : DEFAULT_CONTEXTS;
}

function pickFrom(values, index) {
  return values[index % Math.max(1, values.length)];
}

function createQaRegions({ roomCount, context, seed }) {
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
    return {
      id: `qa-region-${String(index + 1).padStart(2, "0")}`,
      name: `${String(index + 1).padStart(2, "0")} ${source.role}`,
      role: source.role,
      preferredShape: source.shape,
      size: source.size,
      connectors: source.connectors,
      tags,
      sourceAnchors: ["Sedlec Ossuary"],
      links: [],
      isEntrance: index === 0,
      isExit: isLast,
      secret: Boolean(source.secret || tags.includes("secret")),
      sourceRegionId: `qa-source-region-${index + 1}`,
      requestMetadata: {
        contexts: [context],
        horror: ["Religious Horror"],
        sourceAnchors: ["Sedlec Ossuary"],
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

function createQaConfig({ seed, index, roomCount, context }) {
  const regions = createQaRegions({ roomCount, context, seed });
  return {
    ...DEFAULT_CONFIG,
    seed,
    context,
    biome: context,
    roomCount,
    horror: ["Religious Horror", index % 2 === 0 ? "Gothic" : "Body Horror"],
    sourceAnchors: ["Sedlec Ossuary", "Towers of Silence"],
    regions,
    connections: createQaConnections(regions, index),
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
  const results = [];
  const debugMaps = [];

  for (let index = 0; index < count; index += 1) {
    const mapId = `map-qa-${String(index + 1).padStart(4, "0")}`;
    const roomSpan = roomCountMax - roomCountMin + 1;
    const roomCount = roomCountMin + (index % Math.max(1, roomSpan));
    const context = pickFrom(contexts, index);
    const mapSeed = `${seed}-${String(index + 1).padStart(4, "0")}`;
    const config = createQaConfig({ seed: mapSeed, index, roomCount, context });
    const map = generateMap(config);
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
      content: buildMapBatchQaMarkdown(report),
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
  return `cruor-map-batch-qa-${stamp}.${payload.extension}`;
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
