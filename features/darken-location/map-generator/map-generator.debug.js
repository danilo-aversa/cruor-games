import { normalizeInput } from "./map-generator.input.js";
import { generateMap } from "./map-generator.pipeline.js";
import {
  MANUAL_OVERRIDE_SCHEMA_VERSION,
  createEmptyManualOverrides,
  normalizeStairTransition,
} from "./map-generator.state.js";
import { getContextKey } from "./map-generator.profile.js";
import { parseRegionLink } from "./map-generator.graph.js";
import {
  formatMapLevel,
  getAvailableMapLevels,
} from "./map-generator.layout.js";
import { cellKey, doorKey, parseCellKey } from "./map-generator.mask.js";
import {
  getBoundaryCells,
  getCorridorConfiguredLevelDelta,
  getCorridorEndpointCell,
  getCorridorIntersectionCells,
  getCorridorPlanarLevel,
  getCrossLevelCorridorIntersectionCells,
  getPhysicalFloorConnectivityReport,
  isOrganicCorridor,
} from "./map-generator.corridors.js";
import { getMapSurface, getRegionSurface } from "./map-generator.render.jsx";

export function createMapSignature(generatedMap) {
  const regions = generatedMap.regions
    .map(
      (region) =>
        `${region.id}:${region.cellRect.x},${region.cellRect.y},${region.cellRect.w},${region.cellRect.h}`,
    )
    .sort()
    .join("|");
  const corridors = generatedMap.corridors
    .map(
      (corridor) =>
        `${corridor.id}:${corridor.floorCells.map((cell) => cellKey(cell.x, cell.y)).join(";")}`,
    )
    .sort()
    .join("|");
  const doors = generatedMap.dungeonMask.doorSegments
    .map(doorKey)
    .sort()
    .join("|");
  return `${regions}::${corridors}::${doors}`;
}

export function countSolidCorridorBlocks(corridorFloorCells) {
  const cells = new Set(
    corridorFloorCells.map((cell) => cellKey(cell.x, cell.y)),
  );
  let count = 0;
  cells.forEach((key) => {
    const cell = parseCellKey(key);
    if (
      cells.has(cellKey(cell.x + 1, cell.y)) &&
      cells.has(cellKey(cell.x, cell.y + 1)) &&
      cells.has(cellKey(cell.x + 1, cell.y + 1))
    ) {
      count += 1;
    }
  });
  return count;
}

function getOrganicCorridorCellKeys(generatedMap) {
  const organicCells = new Set();
  (generatedMap.corridors || [])
    .filter(isOrganicCorridor)
    .forEach((corridor) => {
      (corridor.floorCells || []).forEach((cell) =>
        organicCells.add(cellKey(cell.x, cell.y)),
      );
    });
  return organicCells;
}

export function countUnwantedSolidCorridorBlocks(generatedMap) {
  const organicCells = getOrganicCorridorCellKeys(generatedMap);
  const structuredCells = (
    generatedMap.dungeonMask.corridorFloorCells || []
  ).filter((cell) => !organicCells.has(cellKey(cell.x, cell.y)));
  return countSolidCorridorBlocks(structuredCells);
}

export function getRoomRectFillRatio(region) {
  const area = Math.max(1, region.cellRect.w * region.cellRect.h);
  return (region.floorCells?.length || 0) / area;
}

export function hasCaveMaskIrregularity(region) {
  if (region.shape !== "cave") return true;
  const area = Math.max(1, region.cellRect.w * region.cellRect.h);
  const missingCells = area - (region.floorCells?.length || 0);
  const boundaryCount = getBoundaryCells(region).length;
  return (
    missingCells >= Math.max(2, Math.floor(area * 0.08)) &&
    boundaryCount >= Math.floor(Math.sqrt(area) * 4.2)
  );
}

export function getRoomCellOwnerMap(regions) {
  const owners = new Map();
  regions.forEach((region) => {
    region.floorCells.forEach((cell) => {
      const key = cellKey(cell.x, cell.y);
      if (!owners.has(key)) owners.set(key, []);
      owners.get(key).push(region.id);
    });
  });
  return owners;
}

export function isAnchorOnRegionBoundary(region, anchor) {
  if (!anchor) return false;
  return getBoundaryCells(region).some(
    (candidate) =>
      candidate.side === anchor.side &&
      candidate.cell.x === anchor.cell.x &&
      candidate.cell.y === anchor.cell.y &&
      candidate.outsideCell.x === anchor.outsideCell.x &&
      candidate.outsideCell.y === anchor.outsideCell.y,
  );
}

export function corridorContainsCell(corridor, cell) {
  return corridor.floorCells.some(
    (corridorCell) => corridorCell.x === cell.x && corridorCell.y === cell.y,
  );
}

export function getExpectedLevelDeltaForStair(endpoint, stairTransition) {
  const transition = normalizeStairTransition(stairTransition, "none");
  if (transition === "none") return 0;
  if (endpoint === "to") return transition === "up" ? -1 : 1;
  return transition === "up" ? 1 : -1;
}

export function parseStairTransitionOverrideKey(key) {
  const [corridorId, endpoint = "shared"] = String(key || "").split(":");
  return { corridorId, endpoint };
}

export function getConfiguredStairOverrideEntries(generatedMap) {
  return Object.entries(generatedMap.config.manualStairTransitions || {})
    .map(([key, value]) => ({
      ...parseStairTransitionOverrideKey(key),
      type: normalizeStairTransition(value, "none"),
      key,
    }))
    .filter((entry) => entry.type !== "none");
}

export function getRenderedStairDoorEntries(generatedMap) {
  const corridorById = new Map(
    generatedMap.corridors.map((corridor) => [corridor.id, corridor]),
  );
  return (generatedMap.dungeonMask.doorSegments || [])
    .map((door) => ({
      door,
      corridor: corridorById.get(door.corridorId),
      type: normalizeStairTransition(door.stairTransition, "none"),
      endpoint: door.endpoint || "shared",
    }))
    .filter((entry) => entry.type !== "none");
}

export function cellsMatch(a, b) {
  return Boolean(a && b) && a.x === b.x && a.y === b.y;
}

export function validateLevelSystem(generatedMap) {
  const corridorById = new Map(
    generatedMap.corridors.map((corridor) => [corridor.id, corridor]),
  );
  const renderedStairs = getRenderedStairDoorEntries(generatedMap);
  const configuredStairs = getConfiguredStairOverrideEntries(generatedMap);
  const staleStairOverrides = configuredStairs.filter(
    (entry) => !corridorById.has(entry.corridorId),
  );
  const missingRenderedStairs = configuredStairs.filter((entry) => {
    const corridor = corridorById.get(entry.corridorId);
    if (!corridor) return false;
    return !renderedStairs.some(
      (rendered) =>
        rendered.door.corridorId === entry.corridorId &&
        rendered.endpoint === entry.endpoint &&
        rendered.type === entry.type,
    );
  });

  const invalidStairCorridors = renderedStairs.filter(
    ({ corridor, door, endpoint }) => {
      if (!corridor || corridor.isRoomLink) return true;
      if (
        !door.outsideCell ||
        !Array.isArray(corridor.floorCells) ||
        corridor.floorCells.length < 2
      )
        return true;
      return (
        !corridorContainsCell(corridor, door.outsideCell) ||
        !["from", "to"].includes(endpoint)
      );
    },
  );

  const stairsWithoutLevelDelta = renderedStairs.filter(
    ({ corridor, type, endpoint }) => {
      if (!corridor) return true;
      const expectedDelta = getExpectedLevelDeltaForStair(endpoint, type);
      return (
        corridor.toLevel - corridor.fromLevel !== expectedDelta ||
        Math.abs(corridor.toLevel - corridor.fromLevel) !== 1
      );
    },
  );

  const stairPlacementErrors = renderedStairs.filter(
    ({ corridor, door, endpoint }) => {
      if (!corridor || !door.outsideCell || corridor.isRoomLink) return true;
      const endpointCell = getCorridorEndpointCell(corridor, endpoint);
      return !cellsMatch(endpointCell, door.outsideCell);
    },
  );

  const inconsistentLevelConstraints = generatedMap.corridors.filter(
    (corridor) => {
      if (
        !Number.isFinite(corridor.fromLevel) ||
        !Number.isFinite(corridor.toLevel)
      )
        return true;
      const expectedDelta = getCorridorConfiguredLevelDelta(
        generatedMap.config,
        corridor,
      );
      return corridor.toLevel - corridor.fromLevel !== expectedDelta;
    },
  );

  const crossLevelJunctions = getCorridorIntersectionCells(
    generatedMap.corridors,
  ).filter((junction) => {
    const levels = new Set(
      junction.corridors.map((corridor) => getCorridorPlanarLevel(corridor)),
    );
    return levels.size > 1;
  });

  return {
    configuredStairs,
    renderedStairs,
    staleStairOverrides,
    missingRenderedStairs,
    invalidStairCorridors,
    stairsWithoutLevelDelta,
    stairPlacementErrors,
    inconsistentLevelConstraints,
    crossLevelJunctions,
    crossLevelCrossings: getCrossLevelCorridorIntersectionCells(
      generatedMap.corridors,
    ),
  };
}

export function validateExportSvgString(svgText) {
  const forbidden = [
    "editor-overlays",
    "room-drag-handle",
    "endpoint-handle",
    "waypoint-handle",
    "is-dragging",
  ];
  return {
    passed:
      Boolean(svgText) && forbidden.every((token) => !svgText.includes(token)),
    missingSvg: !svgText,
    leakedTokens: forbidden.filter((token) => svgText?.includes(token)),
  };
}

export function makeTestResult(id, label, passed, details = "") {
  return { id, label, passed: Boolean(passed), details };
}

export function validateGeneratedMap(
  generatedMap,
  sourceConfig = generatedMap.config,
) {
  const tests = [];
  const errors = [];
  const warnings = [];
  const normalizedSource = normalizeInput(sourceConfig);
  const expectedRegionIds = new Set(
    normalizedSource.regions.map((region) => region.id),
  );
  const generatedRegionIds = new Set(
    generatedMap.regions.map((region) => region.id),
  );
  const regionById = new Map(
    generatedMap.regions.map((region) => [region.id, region]),
  );
  const corridorById = new Map(
    generatedMap.corridors.map((corridor) => [corridor.id, corridor]),
  );
  const roomOwners = getRoomCellOwnerMap(generatedMap.regions);
  const floorCells = new Set(
    generatedMap.dungeonMask.floorCells.map((cell) => cellKey(cell.x, cell.y)),
  );

  const missingRegions = [...expectedRegionIds].filter(
    (id) => !generatedRegionIds.has(id),
  );
  const extraRegions = [...generatedRegionIds].filter(
    (id) => !expectedRegionIds.has(id),
  );
  tests.push(
    makeTestResult(
      "regions-exist",
      "Every requested region exists",
      missingRegions.length === 0 &&
        extraRegions.length === 0 &&
        generatedMap.regions.length === generatedMap.config.roomCount,
      missingRegions.length > 0
        ? `Missing: ${missingRegions.join(", ")}`
        : extraRegions.length > 0
          ? `Unexpected: ${extraRegions.join(", ")}`
          : `${generatedMap.regions.length} region(s)`,
    ),
  );

  const missingEdges = generatedMap.graph.filter(
    (edge) => !corridorById.has(edge.id),
  );
  tests.push(
    makeTestResult(
      "edges-have-corridors",
      "Every graph edge has a corridor",
      missingEdges.length === 0,
      missingEdges.length > 0
        ? `Missing corridor(s): ${missingEdges.map((edge) => edge.id).join(", ")}`
        : `${generatedMap.corridors.length} corridor(s)`,
    ),
  );

  const criticalEdges = generatedMap.graph.filter(
    (edge) => edge.kind === "critical",
  );
  tests.push(
    makeTestResult(
      "critical-path-exists",
      "Graph has an intentional critical path",
      generatedMap.regions.length <= 1 || criticalEdges.length >= 1,
      criticalEdges.length > 0
        ? `${criticalEdges.length} critical edge(s)`
        : "no critical edge",
    ),
  );

  const finalRegions = generatedMap.regions.filter(
    (region) => region.graphRole === "final",
  );
  const deepestNonSecretDepth = Math.max(
    0,
    ...generatedMap.regions
      .filter((region) => region.graphRole !== "secret")
      .map((region) => region.graphDepth || 0),
  );
  const finalDepthOk =
    finalRegions.length === 0 ||
    finalRegions.some(
      (region) => (region.graphDepth || 0) >= deepestNonSecretDepth - 1,
    );
  tests.push(
    makeTestResult(
      "final-room-is-deep",
      "Final/climax room is placed deep in the graph",
      finalDepthOk,
      finalRegions.length > 0
        ? finalRegions
            .map((region) => `${region.name}: depth ${region.graphDepth}`)
            .join("; ")
        : "no explicit final region",
    ),
  );

  const secretRegions = generatedMap.regions.filter(
    (region) => region.graphRole === "secret",
  );
  const secretRegionIds = new Set(secretRegions.map((region) => region.id));
  const secretEdges = generatedMap.graph.filter(
    (edge) => edge.secret || edge.kind === "secret",
  );
  const connectedSecrets = new Set(
    secretEdges
      .flatMap((edge) => [edge.from, edge.to])
      .filter((id) => secretRegionIds.has(id)),
  );
  tests.push(
    makeTestResult(
      "secret-branches",
      "Secret regions are connected through secret branches",
      secretRegions.every((region) => connectedSecrets.has(region.id)),
      secretRegions.length > 0
        ? `${connectedSecrets.size}/${secretRegions.length} secret region(s) connected`
        : "no secret regions",
    ),
  );

  const expectedLinks = normalizedSource.regions
    .flatMap((region) =>
      (region.links || []).map((rawLink, index) => ({
        region,
        link: parseRegionLink(rawLink),
        index,
      })),
    )
    .filter((item) => item.link?.to && expectedRegionIds.has(item.link.to));
  const missingLinks = expectedLinks.filter(
    (item) =>
      !generatedMap.graph.some(
        (edge) =>
          (edge.from === item.region.id && edge.to === item.link.to) ||
          (edge.from === item.link.to && edge.to === item.region.id),
      ),
  );
  tests.push(
    makeTestResult(
      "region-links-honored",
      "Explicit region.links are honored",
      missingLinks.length === 0,
      missingLinks.length > 0
        ? `Missing: ${missingLinks.map((item) => `${item.region.id}->${item.link.to}`).join(", ")}`
        : `${expectedLinks.length} link(s)`,
    ),
  );

  const uniqueRoomShapes = new Set(
    generatedMap.regions.map((region) => region.shape || "rect"),
  );
  tests.push(
    makeTestResult(
      "room-shape-diversity",
      "Room shape library is producing varied room masks",
      generatedMap.regions.length <= 2 || uniqueRoomShapes.size > 1,
      `${Array.from(uniqueRoomShapes).join(", ")}`,
    ),
  );

  const regionSurfaces = generatedMap.regions.map((region) =>
    getRegionSurface(region, generatedMap, generatedMap.config.gridSize),
  );
  const mapSurface = getMapSurface(generatedMap);
  const contextKey = getContextKey(
    generatedMap.config.context || generatedMap.config.biome,
  );
  const caveRegions = generatedMap.regions.filter(
    (region) => region.shape === "cave",
  );
  const caveMapSurface =
    contextKey === "cave" ? getMapSurface(generatedMap) : null;
  tests.push(
    makeTestResult(
      "region-surfaces-exist",
      "Every region exposes a renderable surface abstraction",
      regionSurfaces.length === generatedMap.regions.length &&
        regionSurfaces.every(
          (surface) =>
            surface.regionId &&
            surface.visualFloorPath &&
            Array.isArray(surface.floorCells) &&
            Array.isArray(surface.wallSegments),
        ),
      `${regionSurfaces.length} region surface(s)`,
    ),
  );

  tests.push(
    makeTestResult(
      "map-surface-exists",
      "Unified map surface exposes floor, walls, doors, and clipping paths",
      Boolean(mapSurface.visualFloorPath) &&
        Array.isArray(mapSurface.floorCells) &&
        Array.isArray(mapSurface.wallSegments) &&
        Array.isArray(mapSurface.doorSegments),
      `${mapSurface.surfaceKind} · ${mapSurface.floorCells.length} floor cell(s)`,
    ),
  );

  tests.push(
    makeTestResult(
      "cave-context-uses-hex-map-surface",
      "Cave context renders through a unified hex-based cave surface",
      contextKey !== "cave" ||
        Boolean(
          caveMapSurface?.visualFloorPath &&
          caveMapSurface.geometryKind === "hex-cave-map",
        ),
      contextKey === "cave" && caveMapSurface
        ? `${caveMapSurface.geometryKind} · ${caveMapSurface.floorCells.length} floor cell(s)`
        : "not cave context",
    ),
  );

  tests.push(
    makeTestResult(
      "cave-editor-model-is-preserved",
      "Cave context preserves rooms, corridors, doors, and map accesses for editing",
      contextKey !== "cave" ||
        (generatedMap.regions.length > 0 &&
          (generatedMap.regions.length <= 1 ||
            generatedMap.corridors.length > 0) &&
          Array.isArray(caveMapSurface?.doorSegments)),
      contextKey === "cave" && caveMapSurface
        ? `${generatedMap.corridors.length} corridor(s), ${caveMapSurface.doorSegments.length} door segment(s)`
        : "not cave context",
    ),
  );

  tests.push(
    makeTestResult(
      "cave-context-uses-cave-rooms",
      "Cave context still tags regions as cave rooms for content semantics",
      contextKey !== "cave" || caveRegions.length > 0,
      contextKey === "cave"
        ? `${caveRegions.length} cave room(s)`
        : "not cave context",
    ),
  );

  tests.push(
    makeTestResult(
      "cave-masks-are-irregular",
      "Fallback cave room masks remain non-rectangular for editor semantics",
      caveRegions.every(hasCaveMaskIrregularity),
      caveRegions.length > 0
        ? caveRegions
            .map(
              (region) =>
                `${region.name}: ${(getRoomRectFillRatio(region) * 100).toFixed(0)}% fill`,
            )
            .join("; ")
        : "no cave rooms",
    ),
  );

  const overlappingRoomCells = [];
  roomOwners.forEach((owners, key) => {
    if (owners.length > 1)
      overlappingRoomCells.push(`${key}->${owners.join("/")}`);
  });
  tests.push(
    makeTestResult(
      "no-room-overlap",
      "Rooms do not overlap each other",
      overlappingRoomCells.length === 0,
      overlappingRoomCells.slice(0, 4).join("; "),
    ),
  );

  const corridorRoomIntrusions = [];
  generatedMap.corridors.forEach((corridor) => {
    corridor.floorCells.forEach((cell) => {
      const owners = roomOwners.get(cellKey(cell.x, cell.y));
      if (owners?.length)
        corridorRoomIntrusions.push(
          `${corridor.id}@${cell.x},${cell.y}->${owners.join("/")}`,
        );
    });
  });
  tests.push(
    makeTestResult(
      "corridors-outside-rooms",
      "No corridor passes through room cells",
      corridorRoomIntrusions.length === 0,
      corridorRoomIntrusions.slice(0, 3).join("; "),
    ),
  );

  const invalidAnchors = [];
  generatedMap.corridors.forEach((corridor) => {
    const fromRegion = regionById.get(corridor.from);
    const toRegion = regionById.get(corridor.to);
    if (
      !fromRegion ||
      !isAnchorOnRegionBoundary(fromRegion, corridor.fromAnchor)
    )
      invalidAnchors.push(`${corridor.id}:from`);
    if (!toRegion || !isAnchorOnRegionBoundary(toRegion, corridor.toAnchor))
      invalidAnchors.push(`${corridor.id}:to`);
  });
  tests.push(
    makeTestResult(
      "doors-on-boundaries",
      "Every door is on a room boundary",
      invalidAnchors.length === 0,
      invalidAnchors.slice(0, 4).join(", "),
    ),
  );

  const doorsNotTouchingCorridors = [];
  generatedMap.corridors.forEach((corridor) => {
    if (
      !corridor.isRoomLink &&
      corridor.fromAnchor &&
      !corridorContainsCell(corridor, corridor.fromAnchor.outsideCell)
    )
      doorsNotTouchingCorridors.push(`${corridor.id}:from`);
    if (
      !corridor.isRoomLink &&
      corridor.toAnchor &&
      !corridorContainsCell(corridor, corridor.toAnchor.outsideCell)
    )
      doorsNotTouchingCorridors.push(`${corridor.id}:to`);
  });
  tests.push(
    makeTestResult(
      "doors-touch-corridors",
      "Every door touches its corridor",
      doorsNotTouchingCorridors.length === 0,
      doorsNotTouchingCorridors.slice(0, 4).join(", "),
    ),
  );

  const invalidFloorCells = [];
  generatedMap.corridors.forEach((corridor) => {
    corridor.floorCells.forEach((cell) => {
      if (!floorCells.has(cellKey(cell.x, cell.y)))
        invalidFloorCells.push(`${corridor.id}@${cell.x},${cell.y}`);
    });
  });
  tests.push(
    makeTestResult(
      "corridor-cells-in-mask",
      "Every corridor cell exists in the dungeon mask",
      invalidFloorCells.length === 0,
      invalidFloorCells.slice(0, 4).join(", "),
    ),
  );

  const physicalFloorConnectivity =
    generatedMap.integrity?.physicalFloorConnectivity ||
    getPhysicalFloorConnectivityReport(
      generatedMap.regions || [],
      generatedMap.corridors || [],
    );
  tests.push(
    makeTestResult(
      "physical-floor-connectivity",
      "All rooms share one physical floor/corridor network",
      physicalFloorConnectivity.connected,
      physicalFloorConnectivity.connected
        ? `${physicalFloorConnectivity.roomCount} room(s) in one physical network`
        : [
            physicalFloorConnectivity.disconnectedRoomIds.length > 0
              ? `Disconnected room(s): ${physicalFloorConnectivity.disconnectedRoomIds.join(", ")}`
              : "",
            physicalFloorConnectivity.emptyRoomIds.length > 0
              ? `Empty room mask(s): ${physicalFloorConnectivity.emptyRoomIds.join(", ")}`
              : "",
            physicalFloorConnectivity.corridorOnlyComponentCount > 0
              ? `${physicalFloorConnectivity.corridorOnlyComponentCount} orphan corridor component(s)`
              : "",
            physicalFloorConnectivity.invalidCorridorConnectionCount > 0
              ? `${physicalFloorConnectivity.invalidCorridorConnectionCount} invalid corridor connection(s)`
              : "",
          ]
            .filter(Boolean)
            .join("; "),
    ),
  );

  const solidCorridorBlocks = countUnwantedSolidCorridorBlocks(generatedMap);
  tests.push(
    makeTestResult(
      "no-solid-corridor-blocks",
      "No unwanted 2x2 structured corridor blocks",
      solidCorridorBlocks === 0,
      solidCorridorBlocks > 0 ? `${solidCorridorBlocks} block(s)` : "0 blocks",
    ),
  );

  const explicitLevelModel = generatedMap.config.manualLevels || {};
  const explicitStairs = explicitLevelModel.stairs || {};
  const legacyStairs = generatedMap.config.manualStairTransitions || {};
  const stairMirrorKeys = Array.from(
    new Set([...Object.keys(explicitStairs), ...Object.keys(legacyStairs)]),
  );
  const staleStairMirror = stairMirrorKeys.filter(
    (key) => explicitStairs[key] !== legacyStairs[key],
  );
  tests.push(
    makeTestResult(
      "state-v2-explicit-level-model",
      "State v2 exposes explicit level containers",
      Boolean(
        explicitLevelModel.regions &&
        explicitLevelModel.corridors &&
        explicitLevelModel.stairs,
      ) && staleStairMirror.length === 0,
      staleStairMirror.length > 0
        ? `Stale stair key(s): ${staleStairMirror.join(", ")}`
        : "levels.regions / levels.corridors / levels.stairs",
    ),
  );

  const levelValidation = validateLevelSystem(generatedMap);
  tests.push(
    makeTestResult(
      "stair-overrides-render",
      "Every configured stair is attached to a rendered door",
      levelValidation.staleStairOverrides.length === 0 &&
        levelValidation.missingRenderedStairs.length === 0,
      levelValidation.staleStairOverrides.length > 0
        ? `Stale: ${levelValidation.staleStairOverrides.map((entry) => entry.key).join(", ")}`
        : levelValidation.missingRenderedStairs.length > 0
          ? `Not rendered: ${levelValidation.missingRenderedStairs.map((entry) => entry.key).join(", ")}`
          : `${levelValidation.renderedStairs.length} stair door(s)`,
    ),
  );

  tests.push(
    makeTestResult(
      "stair-doors-have-corridors",
      "Every stair door belongs to a real corridor endpoint",
      levelValidation.invalidStairCorridors.length === 0,
      levelValidation.invalidStairCorridors.length > 0
        ? levelValidation.invalidStairCorridors
            .map(
              (entry) =>
                `${entry.door.corridorId || "missing"}:${entry.endpoint}`,
            )
            .join(", ")
        : `${levelValidation.renderedStairs.length} stair door(s) valid`,
    ),
  );

  tests.push(
    makeTestResult(
      "stairs-create-level-delta",
      "Every stair transition creates a matching level difference",
      levelValidation.stairsWithoutLevelDelta.length === 0,
      levelValidation.stairsWithoutLevelDelta.length > 0
        ? levelValidation.stairsWithoutLevelDelta
            .map(
              (entry) =>
                `${entry.door.corridorId}:${entry.endpoint} ${entry.type} -> Δ${entry.corridor ? entry.corridor.toLevel - entry.corridor.fromLevel : "?"}`,
            )
            .join(", ")
        : `${levelValidation.renderedStairs.length} transition(s)`,
    ),
  );

  tests.push(
    makeTestResult(
      "stair-symbol-first-corridor-cell",
      "Stair symbols are anchored to the first corridor square after the door",
      levelValidation.stairPlacementErrors.length === 0,
      levelValidation.stairPlacementErrors.length > 0
        ? levelValidation.stairPlacementErrors
            .map((entry) => `${entry.door.corridorId}:${entry.endpoint}`)
            .join(", ")
        : `${levelValidation.renderedStairs.length} symbol anchor(s)`,
    ),
  );

  tests.push(
    makeTestResult(
      "level-constraints-consistent",
      "Rooms do not receive contradictory level constraints",
      levelValidation.inconsistentLevelConstraints.length === 0,
      levelValidation.inconsistentLevelConstraints.length > 0
        ? levelValidation.inconsistentLevelConstraints
            .map(
              (corridor) =>
                `${corridor.id}: ${corridor.fromLevel}->${corridor.toLevel}, expected Δ${getCorridorConfiguredLevelDelta(generatedMap.config, corridor)}`,
            )
            .join(", ")
        : `${getAvailableMapLevels(generatedMap).map(formatMapLevel).join(", ") || "0"}`,
    ),
  );

  tests.push(
    makeTestResult(
      "cross-level-corridors-not-junctions",
      "Cross-level corridor crossings are not treated as same-level junctions",
      levelValidation.crossLevelJunctions.length === 0,
      levelValidation.crossLevelJunctions.length > 0
        ? levelValidation.crossLevelJunctions
            .map((junction) => junction.key)
            .join(", ")
        : `${levelValidation.crossLevelCrossings.length} cross-level crossing(s)`,
    ),
  );

  tests.forEach((test) => {
    if (!test.passed) errors.push(`${test.label}: ${test.details}`);
  });

  const roomArchetypeResolutions = (generatedMap.regions || [])
    .map((region) => region.roomArchetypeResolution)
    .filter(Boolean);
  const mapInfluencedRoomArchetypes = roomArchetypeResolutions.filter(
    (resolution) => resolution.resolvedRoomArchetypeSource === "map-influence",
  );
  const forcedRoomArchetypes = roomArchetypeResolutions.filter(
    (resolution) => resolution.hasForce,
  );
  const forbiddenArchetypeConflicts = roomArchetypeResolutions.filter(
    (resolution) => resolution.hasForbiddenConflict,
  );

  const expectedDoorCount = generatedMap.corridors.reduce(
    (sum, corridor) => sum + (corridor.isRoomLink ? 1 : 2),
    0,
  );
  if (generatedMap.dungeonMask.doorSegments.length < expectedDoorCount) {
    warnings.push(
      `Expected up to ${expectedDoorCount} door cuts, found ${generatedMap.dungeonMask.doorSegments.length}. Some shared or overlapping doors may have been deduplicated.`,
    );
  }

  return {
    passed: errors.length === 0,
    tests,
    errors,
    warnings,
    metrics: {
      regions: generatedMap.regions.length,
      corridors: generatedMap.corridors.length,
      graphEdges: generatedMap.graph.length,
      doors: generatedMap.dungeonMask.doorSegments.length,
      stairs: levelValidation.renderedStairs.length,
      stateVersion: MANUAL_OVERRIDE_SCHEMA_VERSION,
      levels: getAvailableMapLevels(generatedMap).length,
      crossLevelCrossings: levelValidation.crossLevelCrossings.length,
      floorCells: generatedMap.dungeonMask.floorCells.length,
      solidCorridorBlocks,
      physicalFloorConnected: physicalFloorConnectivity.connected,
      physicalFloorComponents: physicalFloorConnectivity.componentCount,
      disconnectedRooms: physicalFloorConnectivity.disconnectedRoomIds.length,
      orphanCorridorComponents:
        physicalFloorConnectivity.corridorOnlyComponentCount,
      invalidCorridorConnections:
        physicalFloorConnectivity.invalidCorridorConnectionCount,
      roomArchetypeRooms: generatedMap.regions.filter((region) => region.roomArchetype).length,
      roomArchetypeResolutionCount: roomArchetypeResolutions.length,
      mapInfluencedRoomArchetypes: mapInfluencedRoomArchetypes.length,
      forcedRoomArchetypes: forcedRoomArchetypes.length,
      forbiddenArchetypeConflicts: forbiddenArchetypeConflicts.length,
    },
  };
}

export function runGoldenSeedChecks(
  baseConfig,
  manualOverrides = createEmptyManualOverrides(),
) {
  const sameA = generateMap(
    { ...baseConfig, seed: "golden-ossuary", roomCount: 7 },
    manualOverrides,
  );
  const sameB = generateMap(
    { ...baseConfig, seed: "golden-ossuary", roomCount: 7 },
    manualOverrides,
  );
  const differentSeed = generateMap(
    { ...baseConfig, seed: "golden-ossuary-alt", roomCount: 7 },
    manualOverrides,
  );
  const differentCount = generateMap(
    { ...baseConfig, seed: "golden-ossuary", roomCount: 5 },
    manualOverrides,
  );
  const differentContext = generateMap(
    {
      ...baseConfig,
      seed: "golden-ossuary",
      roomCount: 7,
      context: baseConfig.context === "Crypt" ? "Cave" : "Crypt",
    },
    manualOverrides,
  );
  const signatureA = createMapSignature(sameA);
  const tests = [
    makeTestResult(
      "same-seed",
      "Same config + same seed = same output",
      signatureA === createMapSignature(sameB),
    ),
    makeTestResult(
      "different-seed",
      "Different seed = different output",
      signatureA !== createMapSignature(differentSeed),
    ),
    makeTestResult(
      "different-room-count",
      "Different room count = different topology",
      signatureA !== createMapSignature(differentCount),
    ),
    makeTestResult(
      "different-context",
      "Different context = different spatial composition",
      signatureA !== createMapSignature(differentContext),
    ),
  ];
  return {
    passed: tests.every((test) => test.passed),
    tests,
    deterministic: tests[0].passed,
    seedVariation: tests[1].passed,
    roomCountVariation: tests[2].passed,
    contextVariation: tests[3].passed,
  };
}

export function buildFullStructuralTestSuite(
  generatedMap,
  config,
  exportValidation,
) {
  const structural = validateGeneratedMap(generatedMap, config);
  const golden = runGoldenSeedChecks(config, createEmptyManualOverrides());
  const exportTest = makeTestResult(
    "export-clean",
    "Export SVG does not include editor overlays",
    exportValidation.passed,
    exportValidation.missingSvg
      ? "SVG not available yet"
      : exportValidation.leakedTokens.length > 0
        ? `Leaked: ${exportValidation.leakedTokens.join(", ")}`
        : "clean export",
  );
  const tests = [...golden.tests, ...structural.tests, exportTest];
  return {
    passed: tests.every((test) => test.passed),
    tests,
    structural,
    golden,
    exportValidation,
  };
}
