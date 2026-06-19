import { normalizeInput } from "./map-generator.input.js";
import { applyManualOverridesToConfig } from "./map-generator.state.js";
import {
  buildCorridorGraph,
  adaptGeneratedGraphForContext,
  annotateRegionsWithGraphMetadata,
  applyManualConnectionsToGraph,
} from "./map-generator.graph.js";
import {
  placeRegions,
  centerAutoPlacedRegions,
  applyManualRoomPositions,
  applyRoomSizeOverrides,
  applyRoomStyleOverrides,
} from "./map-generator.layout.js";
import {
  buildAllRoomMasks,
  applyCircleDoorRoomExtensions,
  buildDungeonMask,
} from "./map-generator.mask.js";
import {
  routeCorridors,
  applyLevelMetadata,
  getRoomCellOwnershipMap,
  getNonEndpointRoomTunnelHits,
} from "./map-generator.corridors.js";
import {
  createMapAccesses,
  createProps,
  reconcileMapAccessesWithFinalGeometry,
} from "./map-generator.details.js";
import {
  computeContentBounds,
  finalizeCaveGeometry,
  finalizeHybridGeometry,
  reconcileHybridCorridorAnchors,
} from "./map-generator.geometry.js";

function hashStringToSeed(...parts) {
  const text = parts.join("::");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRng(seed) {
  let state =
    typeof seed === "number" ? seed >>> 0 : hashStringToSeed(String(seed));
  return function rng() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


function hasObjectEntries(value) {
  return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
}

function hasArrayEntries(value) {
  return Array.isArray(value) && value.length > 0;
}

function hasManualLayoutOverrides(manualOverrides = {}) {
  return (
    hasObjectEntries(manualOverrides.roomPositions) ||
    hasObjectEntries(manualOverrides.manualRoomPositions) ||
    hasObjectEntries(manualOverrides.doorAnchors) ||
    hasObjectEntries(manualOverrides.manualDoorAnchors) ||
    hasObjectEntries(manualOverrides.corridorWaypoints) ||
    hasObjectEntries(manualOverrides.manualCorridorWaypoints) ||
    hasObjectEntries(manualOverrides.corridorJunctions) ||
    hasObjectEntries(manualOverrides.manualCorridorJunctions) ||
    hasArrayEntries(manualOverrides.customConnections) ||
    hasArrayEntries(manualOverrides.manualCustomConnections) ||
    hasArrayEntries(manualOverrides.deletedConnections) ||
    hasArrayEntries(manualOverrides.manualDeletedConnections)
  );
}

function getCellList(corridor) {
  if (!corridor || typeof corridor !== "object") return [];
  if (Array.isArray(corridor.pathCells) && corridor.pathCells.length > 0)
    return corridor.pathCells;
  if (Array.isArray(corridor.floorCells) && corridor.floorCells.length > 0)
    return corridor.floorCells;
  if (Array.isArray(corridor.cells) && corridor.cells.length > 0)
    return corridor.cells;
  return [];
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
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
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
  const dx = Number(a.x) - Number(b.x);
  const dy = Number(a.y) - Number(b.y);
  return Math.sqrt(dx * dx + dy * dy);
}

function getRoomBounds(regions) {
  const rects = (Array.isArray(regions) ? regions : [])
    .map((region) => region.cellRect)
    .filter(Boolean);
  if (rects.length === 0) return { width: 0, height: 0, area: 0 };
  const minX = Math.min(...rects.map((rect) => rect.x));
  const minY = Math.min(...rects.map((rect) => rect.y));
  const maxX = Math.max(...rects.map((rect) => rect.x + rect.w));
  const maxY = Math.max(...rects.map((rect) => rect.y + rect.h));
  const width = Math.max(0, maxX - minX);
  const height = Math.max(0, maxY - minY);
  return { minX, minY, maxX, maxY, width, height, area: width * height };
}

function getAverageNearestRoomDistance(regions) {
  const centers = (Array.isArray(regions) ? regions : [])
    .map(getRegionCenter)
    .filter(Boolean);
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

function getCorridorQualityMetrics(map) {
  const regionById = new Map((map.regions || []).map((region) => [region.id, region]));
  let maxSpan = 0;
  let maxStraightRun = 0;
  let maxDetourRatio = 0;
  let longStraightCount = 0;
  let excessiveSpanCount = 0;
  let highDetourCount = 0;

  (map.corridors || []).forEach((corridor) => {
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
    if (straightRun > 18) longStraightCount += 1;
    if (span > 24) excessiveSpanCount += 1;
    if (detourRatio > 2.2) highDetourCount += 1;
  });

  return {
    maxSpan,
    maxStraightRun,
    maxDetourRatio,
    longStraightCount,
    excessiveSpanCount,
    highDetourCount,
  };
}


function getCorridorRoomTunnelHitCount(map) {
  const corridors = Array.isArray(map?.corridors) ? map.corridors : [];
  const regions = Array.isArray(map?.regions) ? map.regions : [];
  if (corridors.length === 0 || regions.length === 0) return 0;
  const roomOwnership = getRoomCellOwnershipMap(regions);
  return corridors.reduce(
    (total, corridor) =>
      total + getNonEndpointRoomTunnelHits(corridor, roomOwnership).length,
    0,
  );
}

function getLayoutQualityMetrics(map) {
  const bounds = getRoomBounds(map.regions || []);
  const aspectRatio =
    bounds.width > 0 && bounds.height > 0
      ? Math.max(bounds.width / bounds.height, bounds.height / bounds.width)
      : 1;
  const gridW = Math.max(1, Math.floor(map.config.mapWidth / map.config.gridSize));
  const gridH = Math.max(1, Math.floor(map.config.mapHeight / map.config.gridSize));
  const canvasUsage = bounds.area / Math.max(1, gridW * gridH);
  return {
    bounds,
    aspectRatio,
    canvasUsage,
    averageNearestDistance: getAverageNearestRoomDistance(map.regions || []),
  };
}

function scoreGeneratedMapCandidate(map, candidateIndex = 0) {
  const routing = getCorridorQualityMetrics(map);
  const layout = getLayoutQualityMetrics(map);
  const expectedEdges = Array.isArray(map.graph) ? map.graph.length : 0;
  const corridorCount = Array.isArray(map.corridors) ? map.corridors.length : 0;
  const missingCorridorPenalty = Math.max(0, expectedEdges - corridorCount) * 100000;
  const corridorTunnelPenalty = getCorridorRoomTunnelHitCount(map) * 1000000;
  const roomCount = Math.max(1, map.regions?.length || 1);
  const targetNearest = roomCount <= 4 ? 10 : roomCount <= 8 ? 12 : 14;
  const targetSpan = roomCount <= 4 ? 18 : roomCount <= 8 ? 22 : 26;
  const targetStraight = roomCount <= 4 ? 14 : 18;
  const maxUsefulAspect = 2.55;
  const minUsefulCanvas = roomCount <= 4 ? 0.08 : 0.12;

  const spanOverflow = Math.max(0, routing.maxSpan - targetSpan);
  const straightOverflow = Math.max(0, routing.maxStraightRun - targetStraight);
  const distributionOverflow = Math.max(
    0,
    layout.averageNearestDistance - targetNearest,
  );
  const aspectOverflow = Math.max(0, layout.aspectRatio - maxUsefulAspect);
  const wasteOverflow = Math.max(0, minUsefulCanvas - layout.canvasUsage);

  return (
    missingCorridorPenalty +
    corridorTunnelPenalty +
    routing.excessiveSpanCount * 2600 +
    routing.longStraightCount * 2200 +
    routing.highDetourCount * 1800 +
    spanOverflow * spanOverflow * 42 +
    straightOverflow * straightOverflow * 36 +
    distributionOverflow * distributionOverflow * 58 +
    aspectOverflow * aspectOverflow * 1400 +
    wasteOverflow * wasteOverflow * 20000 +
    routing.maxDetourRatio * 12 +
    candidateIndex * 0.01
  );
}

function getLayoutCandidateCount(config, manualOverrides = {}) {
  const roomCount = Number(config.roomCount || config.regions?.length || 1);
  if (roomCount <= 1) return 1;
  const context = String(config.context || config.biome || "").toLowerCase();
  const hasManualLayout = hasManualLayoutOverrides(manualOverrides);
  if (hasManualLayout) return 3;
  if (context === "cave" && roomCount <= 3) return 3;
  if (roomCount <= 4) return 8;
  if (roomCount <= 8) return 7;
  return 6;
}

function getCandidateSeed(baseSeed, candidateIndex) {
  if (candidateIndex === 0) return String(baseSeed || "cruor-map");
  return `${baseSeed || "cruor-map"}:layout-candidate-${candidateIndex}`;
}

function restorePublicSeed(map, publicSeed, candidateSeed, candidateIndex, score) {
  if (!map || typeof map !== "object") return map;
  return {
    ...map,
    seed: publicSeed,
    layoutCandidate: {
      index: candidateIndex,
      seed: candidateSeed,
      score,
    },
    config: {
      ...map.config,
      seed: publicSeed,
      layoutCandidateSeed: candidateSeed,
      layoutCandidateIndex: candidateIndex,
    },
  };
}

function generateMapSingle(config) {
  const rng = createSeededRng(
    hashStringToSeed(
      config.seed,
      config.roomCount,
      config.context,
      config.biome,
    ),
  );
  const generatedGraph = adaptGeneratedGraphForContext(
    config,
    buildCorridorGraph(config, rng),
  );
  const graphConfig = {
    ...config,
    regions: annotateRegionsWithGraphMetadata(config.regions, generatedGraph),
  };
  const placedRegions = placeRegions(graphConfig, generatedGraph, rng);
  const centeredRegions = centerAutoPlacedRegions(placedRegions, graphConfig);
  const positionedRegions = applyManualRoomPositions(
    centeredRegions,
    graphConfig,
  );
  const sizedRegions = applyRoomSizeOverrides(positionedRegions, graphConfig);
  const styledRegions = applyRoomStyleOverrides(sizedRegions, graphConfig);
  const shapedRegions = buildAllRoomMasks(
    styledRegions,
    graphConfig.seed,
    graphConfig.gridSize,
  );
  const routingGraph = applyManualConnectionsToGraph(
    graphConfig,
    generatedGraph,
  );
  const routedCorridors = routeCorridors(
    graphConfig,
    shapedRegions,
    routingGraph,
  );
  const extensionRegions = applyCircleDoorRoomExtensions(
    shapedRegions,
    routedCorridors,
  );
  const leveledMap = applyLevelMetadata(
    extensionRegions,
    routedCorridors,
    graphConfig,
  );
  const routedRegions = leveledMap.regions;
  const corridors = leveledMap.corridors;
  const baseDungeonMask = buildDungeonMask(
    routedRegions,
    corridors,
    graphConfig.gridSize,
  );
  const contentBounds = computeContentBounds(
    baseDungeonMask.floorCells,
    graphConfig.gridSize,
    { x: 0, y: 0, width: graphConfig.mapWidth, height: graphConfig.mapHeight },
  );
  const baseMap = {
    seed: graphConfig.seed,
    config: graphConfig,
    graph: routingGraph,
    placementGraph: generatedGraph,
    bounds: { x: 0, y: 0, width: config.mapWidth, height: config.mapHeight },
    contentBounds,
    regions: routedRegions,
    corridors,
    dungeonMask: baseDungeonMask,
  };
  const anchorGeometry = finalizeCaveGeometry(baseMap);
  const accessAnchorMap = anchorGeometry
    ? { ...baseMap, finalGeometry: anchorGeometry }
    : baseMap;
  const mapAccesses = createMapAccesses(accessAnchorMap);
  const dungeonMask = { ...baseDungeonMask, mapAccesses };
  const geometryMap = { ...baseMap, dungeonMask, mapAccesses };
  const finalGeometry =
    finalizeCaveGeometry(geometryMap) || finalizeHybridGeometry(geometryMap);
  const finalCorridors =
    finalGeometry?.surfaceKind === "hybrid"
      ? reconcileHybridCorridorAnchors(geometryMap, finalGeometry)
      : corridors;
  const finalMapAccesses = finalGeometry
    ? reconcileMapAccessesWithFinalGeometry({
        ...geometryMap,
        corridors: finalCorridors,
        finalGeometry,
      })
    : mapAccesses;
  const structureMaskRegions =
    finalGeometry?.surfaceKind === "hybrid"
      ? routedRegions.filter((region) => region.surfaceKind === "structure")
      : routedRegions;
  const finalDungeonMask =
    finalGeometry?.surfaceKind === "hybrid"
      ? {
          ...buildDungeonMask(
            structureMaskRegions,
            finalCorridors,
            graphConfig.gridSize,
          ),
          mapAccesses: finalMapAccesses,
        }
      : { ...baseDungeonMask, mapAccesses: finalMapAccesses };
  const provisionalMap = finalGeometry
    ? {
        ...geometryMap,
        corridors: finalCorridors,
        dungeonMask: finalDungeonMask,
        mapAccesses: finalMapAccesses,
        finalGeometry,
      }
    : {
        ...geometryMap,
        corridors: finalCorridors,
        dungeonMask: finalDungeonMask,
        mapAccesses: finalMapAccesses,
      };
  const props = createProps({
    config: graphConfig,
    regions: routedRegions,
    corridors: finalCorridors,
    dungeonMask: finalDungeonMask,
  });
  return {
    ...provisionalMap,
    dungeonMask: finalDungeonMask,
    mapAccesses: finalMapAccesses,
    props,
  };
}

export function generateMap(rawConfig, manualOverrides = {}) {
  const config = normalizeInput(
    applyManualOverridesToConfig(rawConfig, manualOverrides),
  );
  const publicSeed = config.seed;
  const candidateCount = getLayoutCandidateCount(config, manualOverrides);

  let bestMap = null;
  let bestScore = Number.POSITIVE_INFINITY;
  let bestCandidateSeed = publicSeed;
  let bestCandidateIndex = 0;

  for (let candidateIndex = 0; candidateIndex < candidateCount; candidateIndex += 1) {
    const candidateSeed = getCandidateSeed(publicSeed, candidateIndex);
    const candidateMap = generateMapSingle({ ...config, seed: candidateSeed });
    const candidateScore = scoreGeneratedMapCandidate(candidateMap, candidateIndex);
    if (candidateScore < bestScore) {
      bestMap = candidateMap;
      bestScore = candidateScore;
      bestCandidateSeed = candidateSeed;
      bestCandidateIndex = candidateIndex;
    }
  }

  return restorePublicSeed(
    bestMap,
    publicSeed,
    bestCandidateSeed,
    bestCandidateIndex,
    bestScore,
  );
}
