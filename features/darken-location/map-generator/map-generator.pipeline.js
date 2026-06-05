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

export function generateMap(rawConfig, manualOverrides = {}) {
  const config = normalizeInput(
    applyManualOverridesToConfig(rawConfig, manualOverrides),
  );
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
