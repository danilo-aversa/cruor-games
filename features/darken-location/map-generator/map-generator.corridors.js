import {
  resolveDoorType,
  resolveStairTransition,
} from "./map-generator.state.js";
import {
  classifyRegion,
  getContextKey,
  getCorridorSurfaceProfile,
  getPlacementProfile,
  getPlacementRole,
  getRegionSemanticFlags,
} from "./map-generator.profile.js";
import {
  cellKey,
  parseCellKey,
  getCellNeighbors,
  getLargestConnectedCellSet,
  getCircleGeometryFromRegion,
  getCircularAnchorData,
  createCircleDoorRoomExtensionAnchor,
  addCircleDoorRoomExtensionCellToSet,
  getCircleExtensionCellKeys,
  getSharedEdgeSegment,
  getCellBoundarySegmentsForCell,
  dedupePoints,
  dedupeDoorSegments,
} from "./map-generator.mask.js";

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

function pickOne(rng, values) {
  return values[Math.floor(rng() * values.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function inferGeneratedRoomType(region) {
  if (region.roomType && region.roomType !== "none") return region.roomType;
  if (region.shape === "archive") return "archive";
  if (region.shape === "alcove") return "alcove";
  if (region.shape === "apse") return "apse";
  if (region.shape === "ruined-rect" || region.shape === "broken")
    return "ruined";
  return "none";
}

export function getRoomCellSet(regions) {
  const set = new Set();
  regions.forEach((region) => {
    region.floorCells.forEach((cell) => set.add(cellKey(cell.x, cell.y)));
  });
  return set;
}

export function getRoomHaloCells(roomCells) {
  const halo = new Set();
  roomCells.forEach((key) => {
    const cell = parseCellKey(key);
    [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 },
    ].forEach((neighbor) => {
      const neighborKey = cellKey(neighbor.x, neighbor.y);
      if (!roomCells.has(neighborKey)) halo.add(neighborKey);
    });
  });
  return halo;
}

export function getAnchorApproachCells(anchor) {
  if (!anchor) return [];
  return [
    anchor.outsideCell,
    {
      x: anchor.outsideCell.x + anchor.normal.x,
      y: anchor.outsideCell.y + anchor.normal.y,
    },
    {
      x: anchor.outsideCell.x + anchor.normal.x * 2,
      y: anchor.outsideCell.y + anchor.normal.y * 2,
    },
  ];
}

export function getBoundaryCells(region) {
  const cells = new Set(
    region.floorCells.map((cell) => cellKey(cell.x, cell.y)),
  );
  const boundary = [];
  region.floorCells.forEach((cell) => {
    [
      { side: "north", x: cell.x, y: cell.y - 1, normal: { x: 0, y: -1 } },
      { side: "east", x: cell.x + 1, y: cell.y, normal: { x: 1, y: 0 } },
      { side: "south", x: cell.x, y: cell.y + 1, normal: { x: 0, y: 1 } },
      { side: "west", x: cell.x - 1, y: cell.y, normal: { x: -1, y: 0 } },
    ].forEach((neighbor) => {
      if (!cells.has(cellKey(neighbor.x, neighbor.y))) {
        boundary.push({
          regionId: region.id,
          regionShape: region.shape,
          side: neighbor.side,
          cell: { x: cell.x, y: cell.y },
          outsideCell: { x: neighbor.x, y: neighbor.y },
          normal: neighbor.normal,
          circular: getCircularAnchorData(region, cell, neighbor.normal),
        });
      }
    });
  });
  return boundary;
}

export function getFinalRegionGeometry(generatedMap, region) {
  if (!generatedMap?.finalGeometry || !region?.id) return null;
  return generatedMap.finalGeometry.regions?.[region.id] || null;
}

export function getFinalBoundarySegments(generatedMap, region) {
  const regionGeometry = getFinalRegionGeometry(generatedMap, region);
  if (!regionGeometry?.finalGeometry) return [];
  const segments = regionGeometry.boundarySegments || [];
  return Array.isArray(segments)
    ? segments.filter(
        (segment) =>
          Number.isFinite(segment.x1) &&
          Number.isFinite(segment.y1) &&
          Number.isFinite(segment.x2) &&
          Number.isFinite(segment.y2),
      )
    : [];
}

export function createFinalAnchorFromSegment(
  segment,
  region,
  generatedMap,
  index = 0,
) {
  const gridSize = generatedMap?.config?.gridSize || 1;
  const mid = {
    x: (segment.x1 + segment.x2) / 2,
    y: (segment.y1 + segment.y2) / 2,
  };
  const center = generatedMap?.contentBounds
    ? {
        x: generatedMap.contentBounds.x + generatedMap.contentBounds.width / 2,
        y: generatedMap.contentBounds.y + generatedMap.contentBounds.height / 2,
      }
    : region?.labelPoint || {
        x: (region.cellRect.x + region.cellRect.w / 2) * gridSize,
        y: (region.cellRect.y + region.cellRect.h / 2) * gridSize,
      };
  const tangent = {
    x: segment.x2 - segment.x1,
    y: segment.y2 - segment.y1,
  };
  const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
  const candidateA = {
    x: tangent.y / tangentLength,
    y: -tangent.x / tangentLength,
  };
  const candidateB = { x: -candidateA.x, y: -candidateA.y };
  const outwardVector = { x: mid.x - center.x, y: mid.y - center.y };
  const normal =
    candidateA.x * outwardVector.x + candidateA.y * outwardVector.y >=
    candidateB.x * outwardVector.x + candidateB.y * outwardVector.y
      ? candidateA
      : candidateB;
  const side =
    Math.abs(normal.x) > Math.abs(normal.y)
      ? normal.x >= 0
        ? "east"
        : "west"
      : normal.y >= 0
        ? "south"
        : "north";
  const cell = {
    x: clamp(
      Math.floor(mid.x / gridSize),
      0,
      Math.max(
        0,
        Math.floor(
          (generatedMap?.config?.mapWidth || mid.x + gridSize) / gridSize,
        ) - 1,
      ),
    ),
    y: clamp(
      Math.floor(mid.y / gridSize),
      0,
      Math.max(
        0,
        Math.floor(
          (generatedMap?.config?.mapHeight || mid.y + gridSize) / gridSize,
        ) - 1,
      ),
    ),
  };
  const outsideCell = {
    x: clamp(
      Math.floor((mid.x + normal.x * gridSize * 0.75) / gridSize),
      0,
      Math.max(
        0,
        Math.floor(
          (generatedMap?.config?.mapWidth || mid.x + gridSize) / gridSize,
        ) - 1,
      ),
    ),
    y: clamp(
      Math.floor((mid.y + normal.y * gridSize * 0.75) / gridSize),
      0,
      Math.max(
        0,
        Math.floor(
          (generatedMap?.config?.mapHeight || mid.y + gridSize) / gridSize,
        ) - 1,
      ),
    ),
  };
  return {
    regionId: region.id,
    regionShape: region.shape,
    side,
    cell,
    outsideCell,
    normal,
    finalGeometry: true,
    finalBoundaryIndex: index,
    segment: { x1: segment.x1, y1: segment.y1, x2: segment.x2, y2: segment.y2 },
    point: mid,
  };
}

export function getFinalConnectionAnchors(generatedMap, region) {
  const regionGeometry = getFinalRegionGeometry(generatedMap, region);
  if (
    Array.isArray(regionGeometry?.connectionAnchors) &&
    regionGeometry.connectionAnchors.length > 0
  )
    return regionGeometry.connectionAnchors;
  return getFinalBoundarySegments(generatedMap, region).map((segment, index) =>
    createFinalAnchorFromSegment(segment, region, generatedMap, index),
  );
}

export function getDoorBoundaryCells(region, generatedMap = null) {
  const finalAnchors = getFinalConnectionAnchors(generatedMap, region);
  if (finalAnchors.length > 0) return finalAnchors;
  if (
    region.shape !== "circle" ||
    !Array.isArray(region.circleExtensionCells) ||
    region.circleExtensionCells.length === 0
  )
    return getBoundaryCells(region);
  const extensionCells = getCircleExtensionCellKeys(region);
  const baseFloorCells = region.floorCells.filter(
    (cell) => !extensionCells.has(cellKey(cell.x, cell.y)),
  );
  return getBoundaryCells({ ...region, floorCells: baseFloorCells });
}

export function getAnchorCenterOffset(anchor, region) {
  const rect = region.cellRect;
  if (anchor.side === "north" || anchor.side === "south") {
    const sideCenter = rect.x + rect.w / 2;
    const anchorPosition = anchor.cell.x + 0.5;
    const halfSpan = Math.max(1, rect.w / 2);
    return Math.abs(anchorPosition - sideCenter) / halfSpan;
  }
  const sideCenter = rect.y + rect.h / 2;
  const anchorPosition = anchor.cell.y + 0.5;
  const halfSpan = Math.max(1, rect.h / 2);
  return Math.abs(anchorPosition - sideCenter) / halfSpan;
}

export function getDoorArchitectureBias(region, profile = {}) {
  const flags = getRegionSemanticFlags(region);
  const role = getPlacementRole(region);
  const shape = region.shape || "rect";
  const roomType =
    region.shapeOptions?.roomType ||
    region.roomType ||
    inferGeneratedRoomType(region);
  const text =
    `${region.role || ""} ${(region.tags || []).join(" ")} ${(region.sourceAnchors || []).join(" ")} ${region.name || ""} ${shape} ${roomType}`.toLowerCase();
  let bias = profile.doorCenterBias ?? 2;

  if (["rect", "hall"].includes(shape)) bias += 1.15;
  if (shape === "circle") bias += 0.65;
  if (["archive", "apse", "ritual"].includes(shape)) bias += 1.8;
  if (["archive", "apse"].includes(roomType)) bias += 1.8;
  if (
    flags.archive ||
    flags.ritual ||
    text.includes("temple") ||
    text.includes("chapel") ||
    text.includes("church") ||
    text.includes("sanctuary")
  )
    bias += 2.2;
  if (role === "connector" && shape === "hall") bias += 0.9;
  if (role === "final" && !["cave", "broken", "ruined-rect"].includes(shape))
    bias += 0.75;

  if (["cave", "irregular", "shaft"].includes(shape)) bias *= 0.38;
  if (["broken", "ruined-rect", "notched", "l-shape"].includes(shape))
    bias *= 0.62;
  if (flags.ruined || flags.hazard) bias *= 0.72;

  return clamp(bias, 0.25, 7.5);
}

export function getDirectionalDoorScore(anchor, region, targetRegion) {
  const sourceCenter = {
    x: region.cellRect.x + region.cellRect.w / 2,
    y: region.cellRect.y + region.cellRect.h / 2,
  };
  const targetCenter = {
    x: targetRegion.cellRect.x + targetRegion.cellRect.w / 2,
    y: targetRegion.cellRect.y + targetRegion.cellRect.h / 2,
  };
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  const length = Math.hypot(dx, dy) || 1;
  const desired = { x: dx / length, y: dy / length };
  const dot = anchor.normal.x * desired.x + anchor.normal.y * desired.y;
  return (1 - dot) * 3.25;
}

export function getAnchorDoorEdgeCenterInCells(anchor) {
  if (!anchor) return null;
  if (anchor.side === "north")
    return { x: anchor.cell.x + 0.5, y: anchor.cell.y };
  if (anchor.side === "south")
    return { x: anchor.cell.x + 0.5, y: anchor.cell.y + 1 };
  if (anchor.side === "west")
    return { x: anchor.cell.x, y: anchor.cell.y + 0.5 };
  return { x: anchor.cell.x + 1, y: anchor.cell.y + 0.5 };
}

export function getCirclePerimeterDoorScore(anchor, region, targetRegion) {
  if (region.shape !== "circle" || !anchor?.circular) return 0;
  const circle = anchor.circular;
  const targetCenter = {
    x: targetRegion.cellRect.x + targetRegion.cellRect.w / 2,
    y: targetRegion.cellRect.y + targetRegion.cellRect.h / 2,
  };
  const dx = targetCenter.x - circle.cx;
  const dy = targetCenter.y - circle.cy;
  const length = Math.hypot(dx, dy) || 1;
  const desired = { x: dx / length, y: dy / length };
  const ideal = {
    x: circle.cx + desired.x * circle.r,
    y: circle.cy + desired.y * circle.r,
  };
  const edgeCenter = getAnchorDoorEdgeCenterInCells(anchor);
  if (!edgeCenter) return 0;
  const sideAlignment = Math.max(
    0,
    1 - (anchor.normal.x * desired.x + anchor.normal.y * desired.y),
  );
  const edgeDx = edgeCenter.x - ideal.x;
  const edgeDy = edgeCenter.y - ideal.y;
  return (edgeDx * edgeDx + edgeDy * edgeDy) * 8.5 + sideAlignment * 5.5;
}

export function getDoorSegmentOrientationFromSide(side) {
  return side === "north" || side === "south" ? "horizontal" : "vertical";
}

export function getCircularWallTangentOrientation(anchor) {
  if (!anchor?.circular) return null;
  const circle = anchor.circular;
  const edgeCenter = getAnchorDoorEdgeCenterInCells(anchor);
  if (!edgeCenter) return null;
  const radialX = edgeCenter.x - circle.cx;
  const radialY = edgeCenter.y - circle.cy;
  const tangentX = -radialY;
  const tangentY = radialX;
  const absX = Math.abs(tangentX);
  const absY = Math.abs(tangentY);
  const dominance = 1.16;
  if (absX >= absY * dominance) return "horizontal";
  if (absY >= absX * dominance) return "vertical";
  return "diagonal";
}

export function isDoorOrientationCompatibleWithLocalWall(anchor) {
  if (!anchor?.circular) return true;
  const tangentOrientation = getCircularWallTangentOrientation(anchor);
  if (!tangentOrientation || tangentOrientation === "diagonal") return true;
  return getDoorSegmentOrientationFromSide(anchor.side) === tangentOrientation;
}

export function chooseDoorAnchorForRegion(
  region,
  targetRegion,
  rng,
  forbiddenOutsideCells = null,
  profile = {},
  generatedMap = null,
) {
  const rawBoundary = getDoorBoundaryCells(region, generatedMap).filter(
    (anchor) =>
      !forbiddenOutsideCells?.has(
        cellKey(anchor.outsideCell.x, anchor.outsideCell.y),
      ),
  );
  const compatibleBoundary = rawBoundary.filter(
    isDoorOrientationCompatibleWithLocalWall,
  );
  const boundary =
    compatibleBoundary.length > 0 ? compatibleBoundary : rawBoundary;
  if (boundary.length === 0) return null;
  const targetCenter = {
    x: targetRegion.cellRect.x + targetRegion.cellRect.w / 2,
    y: targetRegion.cellRect.y + targetRegion.cellRect.h / 2,
  };
  const centerBias = getDoorArchitectureBias(region, profile);
  const ranked = boundary
    .map((anchor) => {
      const dx = anchor.outsideCell.x - targetCenter.x;
      const dy = anchor.outsideCell.y - targetCenter.y;
      const alignment = Math.abs(dx) + Math.abs(dy);
      const centerOffset = getAnchorCenterOffset(anchor, region);
      const circlePerimeterPenalty = getCirclePerimeterDoorScore(
        anchor,
        region,
        targetRegion,
      );
      const centerPenalty =
        region.shape === "circle"
          ? centerOffset * centerOffset * centerBias * 0.18
          : centerOffset * centerOffset * centerBias;
      const directionalPenalty = getDirectionalDoorScore(
        anchor,
        region,
        targetRegion,
      );
      return {
        anchor,
        score:
          alignment +
          directionalPenalty +
          centerPenalty +
          circlePerimeterPenalty +
          rng() * 0.35,
      };
    })
    .sort((a, b) => a.score - b.score);
  return ranked[0].anchor;
}

export function getSharedBoundaryConnections(from, to, gridSize) {
  const toCells = new Set(to.floorCells.map((cell) => cellKey(cell.x, cell.y)));
  return getBoundaryCells(from)
    .filter((anchor) =>
      toCells.has(cellKey(anchor.outsideCell.x, anchor.outsideCell.y)),
    )
    .map((fromAnchor) => {
      const toAnchor = {
        regionId: to.id,
        side:
          fromAnchor.side === "north"
            ? "south"
            : fromAnchor.side === "south"
              ? "north"
              : fromAnchor.side === "east"
                ? "west"
                : "east",
        cell: fromAnchor.outsideCell,
        outsideCell: fromAnchor.cell,
        normal: { x: -fromAnchor.normal.x, y: -fromAnchor.normal.y },
      };
      const doorAnchor = fromAnchor.circular
        ? fromAnchor
        : toAnchor.circular
          ? toAnchor
          : fromAnchor;
      const door = {
        ...createDoorFromAnchor(doorAnchor, gridSize, false),
        connectedRegionIds: [from.id, to.id],
      };
      return {
        fromAnchor,
        toAnchor,
        door,
        point: {
          x: (door.x1 + door.x2) / 2,
          y: (door.y1 + door.y2) / 2,
        },
      };
    });
}

export function anchorsMatch(a, b) {
  if (!a || !b) return false;
  if (
    a.finalGeometry &&
    b.finalGeometry &&
    Number.isInteger(a.finalBoundaryIndex) &&
    Number.isInteger(b.finalBoundaryIndex)
  ) {
    return a.finalBoundaryIndex === b.finalBoundaryIndex;
  }
  return a.side === b.side && a.cell.x === b.cell.x && a.cell.y === b.cell.y;
}

export function getClosestSharedRoomConnectionToPoint(
  from,
  to,
  point,
  gridSize,
) {
  const connections = getSharedBoundaryConnections(from, to, gridSize);
  if (connections.length === 0) return null;
  return connections
    .map((connection) => {
      const dx = connection.point.x - point.x;
      const dy = connection.point.y - point.y;
      return { connection, score: dx * dx + dy * dy };
    })
    .sort((a, b) => a.score - b.score)[0].connection;
}

export function getSharedRoomConnection(
  from,
  to,
  gridSize,
  rng,
  manualFromAnchor = null,
  manualToAnchor = null,
  profile = {},
) {
  const connections = getSharedBoundaryConnections(from, to, gridSize);
  if (connections.length === 0) return null;
  const manualMatch = connections.find(
    (connection) =>
      anchorsMatch(connection.fromAnchor, manualFromAnchor) ||
      anchorsMatch(connection.toAnchor, manualToAnchor),
  );
  if (manualMatch) return manualMatch;
  const fromBias = getDoorArchitectureBias(from, profile);
  const toBias = getDoorArchitectureBias(to, profile);
  const ranked = connections
    .map((connection) => {
      const x = (connection.fromAnchor.cell.x + 0.5) * gridSize;
      const y = (connection.fromAnchor.cell.y + 0.5) * gridSize;
      const cx = (from.labelPoint.x + to.labelPoint.x) / 2;
      const cy = (from.labelPoint.y + to.labelPoint.y) / 2;
      const dx = x - cx;
      const dy = y - cy;
      const fromCenterPenalty =
        Math.pow(
          getAnchorCenterOffset(connection.fromAnchor, from) * gridSize,
          2,
        ) * fromBias;
      const toCenterPenalty =
        Math.pow(getAnchorCenterOffset(connection.toAnchor, to) * gridSize, 2) *
        toBias;
      return {
        connection,
        score:
          dx * dx + dy * dy + fromCenterPenalty + toCenterPenalty + rng() * 0.2,
      };
    })
    .sort((a, b) => a.score - b.score);
  return ranked[0].connection;
}

export function createSharedRoomLinkCorridor(
  edge,
  from,
  to,
  config,
  gridSize,
  rng,
  profile,
  manualFromAnchor = null,
  manualToAnchor = null,
) {
  const pureCaveContext = getContextKey(config.context || config.biome) === "cave";
  const corridorSurfaceKind = getCorridorSurfaceProfile(config, from, to, edge);
  const sharedConnection = getSharedRoomConnection(
    from,
    to,
    gridSize,
    rng,
    manualFromAnchor,
    manualToAnchor,
    profile,
  );
  if (!sharedConnection) return null;

  const naturalCaveConnection =
    pureCaveContext && shouldUseOrganicTunnel(config, from, to);
  const sharedBreachRegion = from.surfaceKind === "structure" ? to : from;
  const sharedDoor = markMineBreachOpening(
    decorateDoorSegment(sharedConnection.door, config, edge, "shared"),
    config,
    corridorSurfaceKind,
    sharedBreachRegion,
  );

  return {
    ...edge,
    isRoomLink: true,
    surfaceKind: corridorSurfaceKind,
    corridorStyle: naturalCaveConnection
      ? "natural-tunnel"
      : "structured-corridor",
    fromAnchor: sharedConnection.fromAnchor,
    toAnchor: sharedConnection.toAnchor,
    floorCells: [],
    centerline: [],
    manualWaypoints: [],
    waypoints: [],
    doors: naturalCaveConnection ? [] : [sharedDoor],
  };
}

export function corridorEndpointKey(corridorId, endpoint) {
  return `${corridorId}:${endpoint}`;
}

export function getClosestBoundaryAnchorToPoint(
  region,
  point,
  gridSize,
  generatedMap = null,
) {
  const rawBoundary = getDoorBoundaryCells(region, generatedMap);
  const compatibleBoundary = rawBoundary.filter(
    isDoorOrientationCompatibleWithLocalWall,
  );
  const boundary =
    compatibleBoundary.length > 0 ? compatibleBoundary : rawBoundary;
  if (boundary.length === 0) return null;
  return boundary
    .map((anchor) => {
      const handlePoint = getAnchorHandlePoint(anchor, gridSize);
      const dx = handlePoint.x - point.x;
      const dy = handlePoint.y - point.y;
      return { anchor, score: dx * dx + dy * dy };
    })
    .sort((a, b) => a.score - b.score)[0].anchor;
}

export function getAnchorHandlePoint(anchor, gridSize) {
  if (anchor?.point) return { x: anchor.point.x, y: anchor.point.y };
  if (anchor?.segment) {
    return {
      x: (anchor.segment.x1 + anchor.segment.x2) / 2,
      y: (anchor.segment.y1 + anchor.segment.y2) / 2,
    };
  }
  const door = createDoorFromAnchor(anchor, gridSize, false);
  return {
    x: (door.x1 + door.x2) / 2,
    y: (door.y1 + door.y2) / 2,
  };
}

export function serializeManualAnchor(anchor) {
  if (!anchor) return null;
  return {
    side: anchor.side,
    cell: { x: anchor.cell.x, y: anchor.cell.y },
    ...(anchor.finalGeometry
      ? {
          finalGeometry: true,
          finalBoundaryIndex: anchor.finalBoundaryIndex,
          segment: anchor.segment
            ? {
                x1: anchor.segment.x1,
                y1: anchor.segment.y1,
                x2: anchor.segment.x2,
                y2: anchor.segment.y2,
              }
            : null,
          point: anchor.point ? { x: anchor.point.x, y: anchor.point.y } : null,
          outsideCell: anchor.outsideCell
            ? { x: anchor.outsideCell.x, y: anchor.outsideCell.y }
            : null,
          normal: anchor.normal
            ? { x: anchor.normal.x, y: anchor.normal.y }
            : null,
        }
      : {}),
    ...(anchor.expandedCircleDoor && anchor.portalRoomCell
      ? {
          expandedCircleDoor: true,
          portalRoomCell: {
            x: anchor.portalRoomCell.x,
            y: anchor.portalRoomCell.y,
          },
          originalCell: anchor.originalCell
            ? { x: anchor.originalCell.x, y: anchor.originalCell.y }
            : null,
          originalOutsideCell: anchor.originalOutsideCell
            ? {
                x: anchor.originalOutsideCell.x,
                y: anchor.originalOutsideCell.y,
              }
            : null,
        }
      : {}),
  };
}

export function findClosestBoundaryAnchorAcrossRegions(
  regions,
  point,
  gridSize,
  excludeRegionId = null,
  maxDistance = gridSize * 1.35,
  generatedMap = null,
) {
  let best = null;
  regions.forEach((region) => {
    if (region.id === excludeRegionId) return;
    const rawBoundary = getFinalConnectionAnchors(generatedMap, region);
    const cellBoundary =
      rawBoundary.length > 0 ? rawBoundary : getBoundaryCells(region);
    const compatibleBoundary = cellBoundary.filter(
      isDoorOrientationCompatibleWithLocalWall,
    );
    const boundary =
      compatibleBoundary.length > 0 ? compatibleBoundary : cellBoundary;
    boundary.forEach((anchor) => {
      const handlePoint = getAnchorHandlePoint(anchor, gridSize);
      const dx = handlePoint.x - point.x;
      const dy = handlePoint.y - point.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > maxDistance) return;
      if (!best || distance < best.distance)
        best = { region, anchor, point: handlePoint, distance };
    });
  });
  return best;
}

export function resolveManualDoorAnchor(region, manualAnchor) {
  if (!manualAnchor) return null;
  if (
    manualAnchor.finalGeometry &&
    manualAnchor.segment &&
    manualAnchor.cell &&
    manualAnchor.outsideCell &&
    manualAnchor.normal
  ) {
    return {
      regionId: region.id,
      regionShape: region.shape,
      side: manualAnchor.side,
      cell: { x: manualAnchor.cell.x, y: manualAnchor.cell.y },
      outsideCell: {
        x: manualAnchor.outsideCell.x,
        y: manualAnchor.outsideCell.y,
      },
      normal: { x: manualAnchor.normal.x, y: manualAnchor.normal.y },
      finalGeometry: true,
      finalBoundaryIndex: manualAnchor.finalBoundaryIndex,
      segment: {
        x1: manualAnchor.segment.x1,
        y1: manualAnchor.segment.y1,
        x2: manualAnchor.segment.x2,
        y2: manualAnchor.segment.y2,
      },
      point: manualAnchor.point
        ? { x: manualAnchor.point.x, y: manualAnchor.point.y }
        : {
            x: (manualAnchor.segment.x1 + manualAnchor.segment.x2) / 2,
            y: (manualAnchor.segment.y1 + manualAnchor.segment.y2) / 2,
          },
    };
  }
  const boundary = getDoorBoundaryCells(region);
  const requestedCell =
    manualAnchor.expandedCircleDoor && manualAnchor.originalCell
      ? manualAnchor.originalCell
      : manualAnchor.cell;
  const exact = boundary.find(
    (anchor) =>
      anchor.side === manualAnchor.side &&
      anchor.cell.x === requestedCell?.x &&
      anchor.cell.y === requestedCell?.y,
  );
  if (exact) return exact;
  if (!requestedCell) return null;
  return (
    boundary
      .map((anchor) => {
        const dx = anchor.cell.x - requestedCell.x;
        const dy = anchor.cell.y - requestedCell.y;
        return { anchor, score: dx * dx + dy * dy };
      })
      .sort((a, b) => a.score - b.score)[0]?.anchor || null
  );
}

export function mapPointToCell(point, gridSize) {
  return {
    x: Math.floor(point.x / gridSize),
    y: Math.floor(point.y / gridSize),
  };
}

export function isValidPoint(point) {
  return Boolean(point) && Number.isFinite(point.x) && Number.isFinite(point.y);
}

export function normalizeManualWaypoint(point, gridSize, gridW, gridH) {
  if (!isValidPoint(point)) return null;
  const cell =
    Number.isInteger(point.x) && Number.isInteger(point.y)
      ? point
      : mapPointToCell(point, gridSize);
  return {
    x: clamp(Math.round(cell.x), 1, gridW - 2),
    y: clamp(Math.round(cell.y), 1, gridH - 2),
  };
}

export function linePathBetweenCells(start, goal) {
  const path = [{ x: start.x, y: start.y }];
  let x = start.x;
  let y = start.y;
  while (x !== goal.x) {
    x += Math.sign(goal.x - x);
    path.push({ x, y });
  }
  while (y !== goal.y) {
    y += Math.sign(goal.y - y);
    path.push({ x, y });
  }
  return path;
}

export function areSameCell(a, b) {
  return Boolean(a && b && a.x === b.x && a.y === b.y);
}

export function isUsableCorridorPath(path, start, goal) {
  if (Array.isArray(path) && path.length >= 2) return true;
  return Array.isArray(path) && path.length === 1 && areSameCell(start, goal);
}

export function appendPathSegment(fullPath, segment) {
  const cells = Array.isArray(segment) ? segment : [];
  if (cells.length === 0) return fullPath;
  if (fullPath.length === 0) {
    fullPath.push(...cells);
    return fullPath;
  }
  const last = fullPath[fullPath.length - 1];
  const nextCells = areSameCell(last, cells[0]) ? cells.slice(1) : cells;
  fullPath.push(...nextCells);
  return fullPath;
}

export function findPath(start, goal, options) {
  const {
    gridW,
    gridH,
    blocked,
    softBlocked,
    existingCorridors,
    adjacentToExistingCorridors,
    routingProfile = {},
  } = options;
  const startKey = cellKey(start.x, start.y);
  const goalKey = cellKey(goal.x, goal.y);
  const open = [
    { x: start.x, y: start.y, key: startKey, g: 0, f: 0, dir: null },
  ];
  const cameFrom = new Map();
  const bestCost = new Map([[startKey, 0]]);
  const closed = new Set();
  const directions = [
    { x: 1, y: 0, name: "E" },
    { x: -1, y: 0, name: "W" },
    { x: 0, y: 1, name: "S" },
    { x: 0, y: -1, name: "N" },
  ];
  const heuristic = (cell) =>
    Math.abs(cell.x - goal.x) + Math.abs(cell.y - goal.y);

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    if (closed.has(current.key)) continue;
    closed.add(current.key);

    if (current.key === goalKey) {
      const path = [];
      let key = current.key;
      while (key) {
        path.push(parseCellKey(key));
        key = cameFrom.get(key);
      }
      return path.reverse();
    }

    directions.forEach((direction) => {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      const nextKey = cellKey(next.x, next.y);
      if (
        next.x < 1 ||
        next.y < 1 ||
        next.x >= gridW - 1 ||
        next.y >= gridH - 1
      )
        return;
      if (closed.has(nextKey)) return;
      if (blocked.has(nextKey) && nextKey !== goalKey && nextKey !== startKey)
        return;
      const turnCost =
        current.dir && current.dir !== direction.name
          ? (routingProfile.turnCost ?? 2.5)
          : 0;
      const wallPenalty = softBlocked.has(nextKey)
        ? (routingProfile.wallPenalty ?? 1.5)
        : 0;
      const corridorOverlapPenalty =
        existingCorridors.has(nextKey) &&
        nextKey !== goalKey &&
        nextKey !== startKey
          ? (routingProfile.corridorOverlapPenalty ?? 0)
          : 0;
      const parallelCorridorPenalty =
        adjacentToExistingCorridors.has(nextKey) &&
        !existingCorridors.has(nextKey)
          ? (routingProfile.adjacentCorridorPenalty ?? 0.25)
          : 0;
      const g =
        current.g +
        1 +
        turnCost +
        wallPenalty +
        parallelCorridorPenalty +
        corridorOverlapPenalty;
      if (!bestCost.has(nextKey) || g < bestCost.get(nextKey)) {
        bestCost.set(nextKey, g);
        cameFrom.set(nextKey, current.key);
        open.push({
          x: next.x,
          y: next.y,
          key: nextKey,
          g,
          f: g + heuristic(next),
          dir: direction.name,
        });
      }
    });
  }

  return [];
}

export function getAdjacentCells(cells) {
  const adjacent = new Set();
  cells.forEach((key) => {
    const cell = parseCellKey(key);
    adjacent.add(cellKey(cell.x + 1, cell.y));
    adjacent.add(cellKey(cell.x - 1, cell.y));
    adjacent.add(cellKey(cell.x, cell.y + 1));
    adjacent.add(cellKey(cell.x, cell.y - 1));
  });
  return adjacent;
}

export function isPartOfSolidCorridorBlock(key, cells) {
  const cell = parseCellKey(key);
  const origins = [
    { x: cell.x, y: cell.y },
    { x: cell.x - 1, y: cell.y },
    { x: cell.x, y: cell.y - 1 },
    { x: cell.x - 1, y: cell.y - 1 },
  ];
  return origins.some(
    (origin) =>
      cells.has(cellKey(origin.x, origin.y)) &&
      cells.has(cellKey(origin.x + 1, origin.y)) &&
      cells.has(cellKey(origin.x, origin.y + 1)) &&
      cells.has(cellKey(origin.x + 1, origin.y + 1)),
  );
}

export function findPathInCellSet(cells, start, goal) {
  const startKey = cellKey(start.x, start.y);
  const goalKey = cellKey(goal.x, goal.y);
  if (!cells.has(startKey) || !cells.has(goalKey)) return [];
  const queue = [startKey];
  const visited = new Set([startKey]);
  const cameFrom = new Map();

  while (queue.length > 0) {
    const currentKey = queue.shift();
    if (currentKey === goalKey) break;
    const current = parseCellKey(currentKey);
    getCellNeighbors(current).forEach((neighbor) => {
      const neighborKey = cellKey(neighbor.x, neighbor.y);
      if (!cells.has(neighborKey) || visited.has(neighborKey)) return;
      visited.add(neighborKey);
      cameFrom.set(neighborKey, currentKey);
      queue.push(neighborKey);
    });
  }

  if (!visited.has(goalKey)) return [];
  const path = [];
  let key = goalKey;
  while (key) {
    path.push(parseCellKey(key));
    key = cameFrom.get(key);
  }
  return path.reverse();
}

export function areCorridorLinksPreserved(cells, corridors) {
  return corridors.every((corridor) => {
    if (
      corridor.isRoomLink ||
      !Array.isArray(corridor.floorCells) ||
      corridor.floorCells.length === 0
    ) {
      return true;
    }

    const start = corridor.fromAnchor?.outsideCell;
    const goal = corridor.toAnchor?.outsideCell;
    if (!start || !goal) return true;

    const routePoints = [
      start,
      ...(corridor.manualWaypoints || []),
      goal,
    ].filter(Boolean);

    return (
      findPathThroughCellSet(cells, routePoints).length >= routePoints.length
    );
  });
}

export function normalizeCorridorCells(cells, corridors) {
  const protectedCells = new Set();
  corridors.forEach((corridor) => {
    [
      corridor.fromAnchor?.outsideCell,
      corridor.toAnchor?.outsideCell,
      ...(corridor.manualWaypoints || []),
    ]
      .filter(Boolean)
      .forEach((cell) => protectedCells.add(cellKey(cell.x, cell.y)));
  });

  const normalized = new Set(cells);
  let changed = true;
  let passes = 0;

  while (changed && passes < 120) {
    changed = false;
    passes += 1;
    const candidates = Array.from(normalized)
      .filter(
        (key) =>
          !protectedCells.has(key) &&
          isPartOfSolidCorridorBlock(key, normalized),
      )
      .sort((a, b) => {
        const degreeA = getCellNeighbors(parseCellKey(a)).filter((neighbor) =>
          normalized.has(cellKey(neighbor.x, neighbor.y)),
        ).length;
        const degreeB = getCellNeighbors(parseCellKey(b)).filter((neighbor) =>
          normalized.has(cellKey(neighbor.x, neighbor.y)),
        ).length;
        return degreeB - degreeA;
      });

    for (const candidate of candidates) {
      const test = new Set(normalized);
      test.delete(candidate);
      if (!areCorridorLinksPreserved(test, corridors)) continue;
      normalized.delete(candidate);
      changed = true;
      break;
    }
  }

  return normalized;
}

export function findPathThroughCellSet(cells, points) {
  if (points.length < 2) return [];
  const fullPath = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const goal = points[index + 1];
    const segment = findPathInCellSet(cells, start, goal);
    if (!isUsableCorridorPath(segment, start, goal)) return [];
    appendPathSegment(fullPath, segment);
  }
  return fullPath;
}

export function rebuildCorridorOnNetwork(corridor, normalizedCells, gridSize) {
  const start = corridor.fromAnchor?.outsideCell;
  const goal = corridor.toAnchor?.outsideCell;
  const routePoints = [start, ...(corridor.manualWaypoints || []), goal].filter(
    Boolean,
  );
  const path = findPathThroughCellSet(normalizedCells, routePoints);
  if (path.length < 2) return corridor;
  const centerline = path.map((cell) => ({
    x: (cell.x + 0.5) * gridSize,
    y: (cell.y + 0.5) * gridSize,
  }));
  return {
    ...corridor,
    floorCells: path.map((cell) => ({ x: cell.x, y: cell.y })),
    pathCells: path.map((cell) => ({ x: cell.x, y: cell.y })),
    centerline,
    waypoints: dedupePoints(extractWaypoints(centerline)),
  };
}

export function normalizeCorridorNetwork(corridors, gridSize) {
  const organicCorridors = corridors.filter(isOrganicCorridor);
  const structuredCorridors = corridors.filter(
    (corridor) =>
      !isOrganicCorridor(corridor) &&
      !corridor.isRoomLink &&
      Array.isArray(corridor.floorCells) &&
      corridor.floorCells.length > 0,
  );
  if (structuredCorridors.length === 0) return corridors;

  const cells = new Set();
  structuredCorridors.forEach((corridor) =>
    corridor.floorCells.forEach((cell) => cells.add(cellKey(cell.x, cell.y))),
  );
  const normalizedCells = normalizeCorridorCells(cells, structuredCorridors);
  const rebuiltStructured = new Map(
    structuredCorridors.map((corridor) => {
      const rebuilt = rebuildCorridorOnNetwork(
        corridor,
        normalizedCells,
        gridSize,
      );
      return [
        corridor.id,
        {
          ...rebuilt,
          pathCells: rebuilt.floorCells.map((cell) => ({
            x: cell.x,
            y: cell.y,
          })),
        },
      ];
    }),
  );

  return corridors.map(
    (corridor) =>
      rebuiltStructured.get(corridor.id) ||
      organicCorridors.find((item) => item.id === corridor.id) ||
      corridor,
  );
}

export function routePathThroughCells(points, options) {
  const validPoints = points.filter(isValidPoint);
  if (validPoints.length < 2) return [];
  const fullPath = [];
  for (let index = 0; index < validPoints.length - 1; index += 1) {
    const start = validPoints[index];
    const goal = validPoints[index + 1];
    const segment = findPath(start, goal, options);
    if (!isUsableCorridorPath(segment, start, goal)) return [];
    appendPathSegment(fullPath, segment);
  }
  return fullPath;
}

export function routeDirectFallback(start, goal, options) {
  const path = findPath(start, goal, options);
  if (path.length >= 2) return path;
  return linePathBetweenCells(start, goal).filter(
    (cell) =>
      cell.x > 0 &&
      cell.y > 0 &&
      cell.x < options.gridW - 1 &&
      cell.y < options.gridH - 1 &&
      !options.blocked.has(cellKey(cell.x, cell.y)),
  );
}

export function isCaveLikeRegion(region, config = null) {
  if (!region) return false;
  const contextKey = getContextKey(
    config?.context || config?.biome || region.placementProfile,
  );
  if (contextKey === "cave") {
    return (
      region.shape === "cave" ||
      region.surfaceKind === "cave" ||
      region.placementProfile === "cave"
    );
  }
  if (contextKey === "mine") {
    return region.surfaceKind === "cave" || region.surfaceKind === "hybrid";
  }
  return false;
}

export function shouldUseOrganicTunnel(config, from, to) {
  const contextKey = getContextKey(config?.context || config?.biome);
  return (
    contextKey === "cave" &&
    (isCaveLikeRegion(from, config) || isCaveLikeRegion(to, config))
  );
}

export function isOrganicCorridor(corridor) {
  return (
    ["natural-tunnel", "collapsed-transition"].includes(
      corridor?.surfaceKind,
    ) || corridor?.corridorStyle === "natural-tunnel"
  );
}

export function shouldUseMineBreachOpening(
  config,
  corridorSurfaceKind,
  region,
  door,
) {
  if (getContextKey(config?.context || config?.biome) !== "mine") return false;
  if (corridorSurfaceKind !== "mine-tunnel") return false;
  if (region?.surfaceKind === "structure") return false;
  if (!door || door.hasStairs || door.secret || door.locked) return false;
  return (
    door.doorType === "default" || door.doorType === "open" || !door.doorType
  );
}

export function markMineBreachOpening(
  door,
  config,
  corridorSurfaceKind,
  region,
) {
  if (!shouldUseMineBreachOpening(config, corridorSurfaceKind, region, door))
    return door;
  return {
    ...door,
    breach: true,
    openingKind: "mine-breach",
  };
}

export function getCorridorTopologyCells(corridor) {
  return Array.isArray(corridor?.pathCells) && corridor.pathCells.length > 0
    ? corridor.pathCells
    : Array.isArray(corridor?.floorCells)
      ? corridor.floorCells
      : [];
}

export function getTunnelExpansionDirections(path, index) {
  const current = path[index];
  const previous = path[index - 1] || null;
  const next = path[index + 1] || null;
  const vectors = [
    previous ? { x: current.x - previous.x, y: current.y - previous.y } : null,
    next ? { x: next.x - current.x, y: next.y - current.y } : null,
  ].filter(Boolean);
  const horizontal = vectors.some((vector) => vector.x !== 0);
  const vertical = vectors.some((vector) => vector.y !== 0);
  if (horizontal && !vertical)
    return [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ];
  if (vertical && !horizontal)
    return [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];
  return [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];
}

export function buildOrganicTunnelFloorCells(
  path,
  config,
  rng,
  blockedRoomCells = new Set(),
  corridorId = "organic-corridor",
) {
  const contextKey = getContextKey(config.context || config.biome);
  const caveContext = contextKey === "cave";
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const cells = new Set();
  const pathKeys = new Set(path.map((cell) => cellKey(cell.x, cell.y)));
  const canAdd = (cell, protectedCell = false) => {
    if (
      !cell ||
      cell.x < 1 ||
      cell.y < 1 ||
      cell.x >= gridW - 1 ||
      cell.y >= gridH - 1
    )
      return false;
    const key = cellKey(cell.x, cell.y);
    if (!protectedCell && blockedRoomCells.has(key)) return false;
    return true;
  };
  const add = (cell, protectedCell = false) => {
    if (!canAdd(cell, protectedCell)) return;
    cells.add(cellKey(cell.x, cell.y));
  };

  path.forEach((cell, index) => {
    add(cell, true);
    const endpoint = index === 0 || index === path.length - 1;
    const turn =
      index > 0 &&
      index < path.length - 1 &&
      (Math.sign(path[index].x - path[index - 1].x) !==
        Math.sign(path[index + 1].x - path[index].x) ||
        Math.sign(path[index].y - path[index - 1].y) !==
          Math.sign(path[index + 1].y - path[index].y));
    const localSeed = hashStringToSeed(
      config.seed,
      corridorId,
      cell.x,
      cell.y,
      index,
      "organic-tunnel-width",
    );
    const directions = getTunnelExpansionDirections(path, index);
    const widthChance = caveContext
      ? endpoint
        ? 48
        : turn
          ? 96
          : 82
      : endpoint
        ? 22
        : turn
          ? 86
          : 54;
    directions.forEach((direction, directionIndex) => {
      const chance = hashStringToSeed(localSeed, directionIndex, "side") % 100;
      if (chance < widthChance)
        add({ x: cell.x + direction.x, y: cell.y + direction.y });
      if (caveContext && !endpoint && chance < 24)
        add({ x: cell.x + direction.x * 2, y: cell.y + direction.y * 2 });
    });
    const diagonalChance = caveContext ? 42 : 18;
    if (!endpoint && localSeed % 100 < diagonalChance) {
      const diagonal = pickOne(rng, [
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 },
        { x: 1, y: 1 },
      ]);
      const adjacentA = cellKey(cell.x + diagonal.x, cell.y);
      const adjacentB = cellKey(cell.x, cell.y + diagonal.y);
      if (
        cells.has(adjacentA) ||
        cells.has(adjacentB) ||
        pathKeys.has(adjacentA) ||
        pathKeys.has(adjacentB)
      ) {
        add({ x: cell.x + diagonal.x, y: cell.y + diagonal.y });
      }
    }
  });

  if (caveContext) {
    const protectedCells = new Set(pathKeys);
    let smoothed = new Set(cells);
    for (let pass = 0; pass < 2; pass += 1) {
      const candidates = new Set(smoothed);
      smoothed.forEach((key) => {
        const cell = parseCellKey(key);
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const candidate = { x: cell.x + dx, y: cell.y + dy };
            if (canAdd(candidate, false))
              candidates.add(cellKey(candidate.x, candidate.y));
          }
        }
      });
      const next = new Set(smoothed);
      candidates.forEach((key) => {
        const cell = parseCellKey(key);
        let neighbors8 = 0;
        let neighbors4 = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const neighborKey = cellKey(cell.x + dx, cell.y + dy);
            if (!smoothed.has(neighborKey)) continue;
            neighbors8 += 1;
            if (Math.abs(dx) + Math.abs(dy) === 1) neighbors4 += 1;
          }
        }
        if (!smoothed.has(key) && (neighbors8 >= 5 || neighbors4 >= 3))
          next.add(key);
        if (
          smoothed.has(key) &&
          !protectedCells.has(key) &&
          neighbors4 <= 1 &&
          neighbors8 <= 2
        )
          next.delete(key);
      });
      smoothed = next;
    }
    path.forEach((cell) => smoothed.add(cellKey(cell.x, cell.y)));
    return Array.from(smoothed).map(parseCellKey);
  }

  const cleaned = getLargestConnectedCellSet(cells);
  path.forEach((cell) => cleaned.add(cellKey(cell.x, cell.y)));
  return Array.from(cleaned).map(parseCellKey);
}

export function routeCorridors(config, regions, graph) {
  const routingProfile = getPlacementProfile(config);
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const regionById = new Map(regions.map((region) => [region.id, region]));
  const allRoomCells = getRoomCellSet(regions);
  const dynamicRoomCells = new Set(allRoomCells);
  const existingCorridors = new Set();
  const usedDoorOutsideCells = new Set();

  const routeRecoveredGraphEdge = (edge) => {
    const from = regionById.get(edge.from);
    const to = regionById.get(edge.to);
    if (!from || !to) return null;

    const edgeRng = createSeededRng(
      hashStringToSeed(config.seed, edge.id, "corridor-recovery"),
    );
    const sharedRoomLink = createSharedRoomLinkCorridor(
      edge,
      from,
      to,
      config,
      config.gridSize,
      edgeRng,
      routingProfile,
    );
    if (sharedRoomLink) return sharedRoomLink;

    const pureCaveContext =
      getContextKey(config.context || config.biome) === "cave";
    const corridorSurfaceKind = getCorridorSurfaceProfile(
      config,
      from,
      to,
      edge,
    );
    const manualDoorAnchors = config.manualDoorAnchors || {};
    const manualFromAnchor = resolveManualDoorAnchor(
      from,
      manualDoorAnchors[corridorEndpointKey(edge.id, "from")],
    );
    const manualToAnchor = resolveManualDoorAnchor(
      to,
      manualDoorAnchors[corridorEndpointKey(edge.id, "to")],
    );
    const roomBlockedCells = new Set(dynamicRoomCells);
    const strictForbiddenOutsideCells = new Set([
      ...dynamicRoomCells,
      ...usedDoorOutsideCells,
    ]);
    const relaxedForbiddenOutsideCells = new Set(dynamicRoomCells);
    const selectRecoveryAnchor = (region, targetRegion, manualAnchor) => {
      if (manualAnchor) return manualAnchor;
      return (
        chooseDoorAnchorForRegion(
          region,
          targetRegion,
          edgeRng,
          strictForbiddenOutsideCells,
          routingProfile,
        ) ||
        chooseDoorAnchorForRegion(
          region,
          targetRegion,
          edgeRng,
          relaxedForbiddenOutsideCells,
          routingProfile,
        ) ||
        getClosestBoundaryAnchorToPoint(
          region,
          targetRegion.labelPoint,
          config.gridSize,
        )
      );
    };

    const rawFromAnchor = selectRecoveryAnchor(from, to, manualFromAnchor);
    const rawToAnchor = selectRecoveryAnchor(to, from, manualToAnchor);
    if (!rawFromAnchor || !rawToAnchor) return null;

    const fromAnchor = createCircleDoorRoomExtensionAnchor(
      from,
      rawFromAnchor,
      gridW,
      gridH,
      dynamicRoomCells,
    );
    const toAnchor = createCircleDoorRoomExtensionAnchor(
      to,
      rawToAnchor,
      gridW,
      gridH,
      dynamicRoomCells,
    );

    const allowedApproachCells = [
      ...getAnchorApproachCells(fromAnchor),
      ...getAnchorApproachCells(toAnchor),
    ];
    const buildRoutingOptions = (extraRelaxed = false) => {
      const blocked = new Set(roomBlockedCells);
      allowedApproachCells.forEach((cell) =>
        blocked.delete(cellKey(cell.x, cell.y)),
      );
      existingCorridors.forEach((key) => blocked.delete(key));
      if (extraRelaxed) {
        blocked.delete(
          cellKey(fromAnchor.outsideCell.x, fromAnchor.outsideCell.y),
        );
        blocked.delete(
          cellKey(toAnchor.outsideCell.x, toAnchor.outsideCell.y),
        );
      }
      const adjacentToExistingCorridors = getAdjacentCells(existingCorridors);
      allowedApproachCells.forEach((cell) =>
        adjacentToExistingCorridors.delete(cellKey(cell.x, cell.y)),
      );
      return {
        gridW,
        gridH,
        blocked,
        softBlocked: new Set(),
        existingCorridors,
        adjacentToExistingCorridors,
        routingProfile,
      };
    };

    let routingOptions = buildRoutingOptions(false);
    let path = routePathThroughCells(
      [fromAnchor.outsideCell, toAnchor.outsideCell],
      routingOptions,
    );
    if (
      !isUsableCorridorPath(
        path,
        fromAnchor.outsideCell,
        toAnchor.outsideCell,
      )
    )
      path = routeDirectFallback(
        fromAnchor.outsideCell,
        toAnchor.outsideCell,
        routingOptions,
      );
    if (
      !isUsableCorridorPath(
        path,
        fromAnchor.outsideCell,
        toAnchor.outsideCell,
      )
    ) {
      routingOptions = buildRoutingOptions(true);
      path = routePathThroughCells(
        [fromAnchor.outsideCell, toAnchor.outsideCell],
        routingOptions,
      );
    }
    if (
      !isUsableCorridorPath(
        path,
        fromAnchor.outsideCell,
        toAnchor.outsideCell,
      )
    )
      path = routeDirectFallback(
        fromAnchor.outsideCell,
        toAnchor.outsideCell,
        routingOptions,
      );
    if (
      !isUsableCorridorPath(
        path,
        fromAnchor.outsideCell,
        toAnchor.outsideCell,
      )
    )
      return null;

    usedDoorOutsideCells.add(
      cellKey(fromAnchor.outsideCell.x, fromAnchor.outsideCell.y),
    );
    usedDoorOutsideCells.add(
      cellKey(toAnchor.outsideCell.x, toAnchor.outsideCell.y),
    );
    addCircleDoorRoomExtensionCellToSet(fromAnchor, dynamicRoomCells);
    addCircleDoorRoomExtensionCellToSet(toAnchor, dynamicRoomCells);

    const organicTunnel = shouldUseOrganicTunnel(config, from, to);
    const pathCells = path.map((cell) => ({ x: cell.x, y: cell.y }));
    const floorCells = organicTunnel
      ? buildOrganicTunnelFloorCells(
          pathCells,
          config,
          edgeRng,
          dynamicRoomCells,
          edge.id,
        )
      : pathCells;
    floorCells.forEach((cell) =>
      existingCorridors.add(cellKey(cell.x, cell.y)),
    );
    const centerline = pathCells.map((cell) => ({
      x: (cell.x + 0.5) * config.gridSize,
      y: (cell.y + 0.5) * config.gridSize,
    }));

    const fromDoor = markMineBreachOpening(
      decorateDoorSegment(
        createDoorFromAnchor(fromAnchor, config.gridSize, edge.secret),
        config,
        edge,
        "from",
      ),
      config,
      corridorSurfaceKind,
      from,
    );
    const toDoor = markMineBreachOpening(
      decorateDoorSegment(
        createDoorFromAnchor(toAnchor, config.gridSize, edge.secret),
        config,
        edge,
        "to",
      ),
      config,
      corridorSurfaceKind,
      to,
    );

    return {
      ...edge,
      recoveredGraphEdge: true,
      surfaceKind: corridorSurfaceKind,
      corridorStyle: organicTunnel ? "natural-tunnel" : "structured-corridor",
      fromAnchor,
      toAnchor,
      floorCells,
      pathCells,
      centerline,
      manualWaypoints: [],
      waypoints: dedupePoints(extractWaypoints(centerline)),
      doors:
        pureCaveContext && organicTunnel
          ? []
          : dedupeDoorSegments([fromDoor, toDoor]),
    };
  };

  const routedCorridors = graph.flatMap((edge) => {
    const from = regionById.get(edge.from);
    const to = regionById.get(edge.to);
    if (!from || !to) return [];
    const edgeRng = createSeededRng(
      hashStringToSeed(config.seed, edge.id, "corridor"),
    );
    const manualDoorAnchors = config.manualDoorAnchors || {};
    const manualFromAnchor = resolveManualDoorAnchor(
      from,
      manualDoorAnchors[corridorEndpointKey(edge.id, "from")],
    );
    const manualToAnchor = resolveManualDoorAnchor(
      to,
      manualDoorAnchors[corridorEndpointKey(edge.id, "to")],
    );
    const pureCaveContext =
      getContextKey(config.context || config.biome) === "cave";
    const corridorSurfaceKind = getCorridorSurfaceProfile(
      config,
      from,
      to,
      edge,
    );
    const sharedRoomLink = createSharedRoomLinkCorridor(
      edge,
      from,
      to,
      config,
      config.gridSize,
      edgeRng,
      routingProfile,
      manualFromAnchor,
      manualToAnchor,
    );
    if (sharedRoomLink) return [sharedRoomLink];
    const forbiddenOutsideCells = new Set([
      ...dynamicRoomCells,
      ...usedDoorOutsideCells,
    ]);
    const rawFromAnchor =
      manualFromAnchor ||
      chooseDoorAnchorForRegion(
        from,
        to,
        edgeRng,
        forbiddenOutsideCells,
        routingProfile,
      );
    const rawToAnchor =
      manualToAnchor ||
      chooseDoorAnchorForRegion(
        to,
        from,
        edgeRng,
        forbiddenOutsideCells,
        routingProfile,
      );
    if (!rawFromAnchor || !rawToAnchor) return [];
    const fromAnchor = createCircleDoorRoomExtensionAnchor(
      from,
      rawFromAnchor,
      gridW,
      gridH,
      dynamicRoomCells,
    );
    const toAnchor = createCircleDoorRoomExtensionAnchor(
      to,
      rawToAnchor,
      gridW,
      gridH,
      dynamicRoomCells,
    );
    usedDoorOutsideCells.add(
      cellKey(fromAnchor.outsideCell.x, fromAnchor.outsideCell.y),
    );
    usedDoorOutsideCells.add(
      cellKey(toAnchor.outsideCell.x, toAnchor.outsideCell.y),
    );
    addCircleDoorRoomExtensionCellToSet(fromAnchor, dynamicRoomCells);
    addCircleDoorRoomExtensionCellToSet(toAnchor, dynamicRoomCells);
    const blocked = new Set(dynamicRoomCells);
    const allowedApproachCells = [
      ...getAnchorApproachCells(fromAnchor),
      ...getAnchorApproachCells(toAnchor),
    ];
    allowedApproachCells.forEach((cell) =>
      blocked.delete(cellKey(cell.x, cell.y)),
    );
    existingCorridors.forEach((key) => blocked.delete(key));
    const softBlocked = new Set();

    const adjacentToExistingCorridors = getAdjacentCells(existingCorridors);
    allowedApproachCells.forEach((cell) =>
      adjacentToExistingCorridors.delete(cellKey(cell.x, cell.y)),
    );
    const manualWaypoints = Array.isArray(edge.manualWaypoints)
      ? edge.manualWaypoints
          .map((point) =>
            normalizeManualWaypoint(point, config.gridSize, gridW, gridH),
          )
          .filter(
            (cell) => cell && !dynamicRoomCells.has(cellKey(cell.x, cell.y)),
          )
      : [];
    manualWaypoints.forEach((cell) => blocked.delete(cellKey(cell.x, cell.y)));
    const routingOptions = {
      gridW,
      gridH,
      blocked,
      softBlocked,
      existingCorridors,
      adjacentToExistingCorridors,
      routingProfile,
    };
    const routePoints = [
      fromAnchor.outsideCell,
      ...manualWaypoints,
      toAnchor.outsideCell,
    ];
    let path = routePathThroughCells(routePoints, routingOptions);
    if (
      !isUsableCorridorPath(
        path,
        fromAnchor.outsideCell,
        toAnchor.outsideCell,
      ) && manualWaypoints.length > 0
    ) {
      path = routePathThroughCells(
        [fromAnchor.outsideCell, toAnchor.outsideCell],
        routingOptions,
      );
    }
    if (
      !isUsableCorridorPath(
        path,
        fromAnchor.outsideCell,
        toAnchor.outsideCell,
      )
    ) {
      path = routeDirectFallback(
        fromAnchor.outsideCell,
        toAnchor.outsideCell,
        routingOptions,
      );
    }
    if (
      !isUsableCorridorPath(
        path,
        fromAnchor.outsideCell,
        toAnchor.outsideCell,
      )
    )
      return [];
    const organicTunnel = shouldUseOrganicTunnel(config, from, to);
    const pathCells = path.map((cell) => ({ x: cell.x, y: cell.y }));
    const floorCells = organicTunnel
      ? buildOrganicTunnelFloorCells(
          pathCells,
          config,
          edgeRng,
          dynamicRoomCells,
          edge.id,
        )
      : pathCells;
    floorCells.forEach((cell) =>
      existingCorridors.add(cellKey(cell.x, cell.y)),
    );
    const centerline = pathCells.map((cell) => ({
      x: (cell.x + 0.5) * config.gridSize,
      y: (cell.y + 0.5) * config.gridSize,
    }));

    const fromDoor = markMineBreachOpening(
      decorateDoorSegment(
        createDoorFromAnchor(fromAnchor, config.gridSize, edge.secret),
        config,
        edge,
        "from",
      ),
      config,
      corridorSurfaceKind,
      from,
    );
    const toDoor = markMineBreachOpening(
      decorateDoorSegment(
        createDoorFromAnchor(toAnchor, config.gridSize, edge.secret),
        config,
        edge,
        "to",
      ),
      config,
      corridorSurfaceKind,
      to,
    );

    return [
      {
        ...edge,
        surfaceKind: corridorSurfaceKind,
        corridorStyle: organicTunnel ? "natural-tunnel" : "structured-corridor",
        fromAnchor,
        toAnchor,
        floorCells,
        pathCells,
        centerline,
        manualWaypoints,
        waypoints: dedupePoints(extractWaypoints(centerline)),
        doors:
          pureCaveContext && organicTunnel
            ? []
            : dedupeDoorSegments([fromDoor, toDoor]),
      },
    ];
  });

  const corridorIds = new Set(routedCorridors.map((corridor) => corridor.id));
  const recoveredGraphEdges = graph
    .filter((edge) => !corridorIds.has(edge.id))
    .map(routeRecoveredGraphEdge)
    .filter(Boolean);

  return normalizeCorridorNetwork(
    [...routedCorridors, ...recoveredGraphEdges],
    config.gridSize,
  );
}

export function extractWaypoints(centerline) {
  if (centerline.length < 3) return [];
  const waypoints = [];
  for (let i = 1; i < centerline.length - 1; i += 1) {
    const prev = centerline[i - 1];
    const current = centerline[i];
    const next = centerline[i + 1];
    const dx1 = Math.sign(current.x - prev.x);
    const dy1 = Math.sign(current.y - prev.y);
    const dx2 = Math.sign(next.x - current.x);
    const dy2 = Math.sign(next.y - current.y);
    if (dx1 !== dx2 || dy1 !== dy2)
      waypoints.push({ x: current.x, y: current.y });
  }
  return waypoints;
}

export function getSnappedCirclePortalCellFromAnchor(anchor) {
  return anchor?.cell || null;
}

export function createDoorFromAnchor(anchor, gridSize, secret = false) {
  if (anchor?.segment) {
    const length =
      Math.hypot(
        anchor.segment.x2 - anchor.segment.x1,
        anchor.segment.y2 - anchor.segment.y1,
      ) || 1;
    const ux = (anchor.segment.x2 - anchor.segment.x1) / length;
    const uy = (anchor.segment.y2 - anchor.segment.y1) / length;
    const half = Math.min(gridSize * 0.43, length / 2);
    const center = getAnchorHandlePoint(anchor, gridSize);
    return {
      x1: center.x - ux * half,
      y1: center.y - uy * half,
      x2: center.x + ux * half,
      y2: center.y + uy * half,
      side: anchor.side,
      secret,
      regionId: anchor.regionId,
      regionShape: anchor.regionShape,
      cell: anchor.cell ? { x: anchor.cell.x, y: anchor.cell.y } : null,
      outsideCell: anchor.outsideCell
        ? { x: anchor.outsideCell.x, y: anchor.outsideCell.y }
        : null,
      normal: anchor.normal ? { x: anchor.normal.x, y: anchor.normal.y } : null,
      finalGeometry: true,
      finalBoundaryIndex: anchor.finalBoundaryIndex,
    };
  }
  const snappedCircleCell = getSnappedCirclePortalCellFromAnchor(anchor);
  const cell = snappedCircleCell || anchor.cell;
  const x = cell.x * gridSize;
  const y = cell.y * gridSize;
  const midX = x + gridSize / 2;
  const midY = y + gridSize / 2;
  const half = gridSize * 0.34;
  const anchorMeta = {
    side: anchor.side,
    secret,
    regionId: anchor.regionId,
    regionShape: anchor.regionShape,
    cell: anchor.cell ? { x: anchor.cell.x, y: anchor.cell.y } : null,
    outsideCell: anchor.outsideCell
      ? { x: anchor.outsideCell.x, y: anchor.outsideCell.y }
      : null,
    normal: anchor.normal ? { x: anchor.normal.x, y: anchor.normal.y } : null,
  };
  if (anchor.side === "north")
    return { x1: midX - half, y1: y, x2: midX + half, y2: y, ...anchorMeta };
  if (anchor.side === "south")
    return {
      x1: midX - half,
      y1: y + gridSize,
      x2: midX + half,
      y2: y + gridSize,
      ...anchorMeta,
    };
  if (anchor.side === "west")
    return { x1: x, y1: midY - half, x2: x, y2: midY + half, ...anchorMeta };
  return {
    x1: x + gridSize,
    y1: midY - half,
    x2: x + gridSize,
    y2: midY + half,
    ...anchorMeta,
  };
}

export function decorateDoorSegment(door, config, edge, endpoint) {
  const doorType = resolveDoorType(
    config,
    edge.id,
    endpoint,
    Boolean(edge.secret),
  );
  const stairTransition = resolveStairTransition(
    config,
    edge.id,
    endpoint,
    "none",
  );
  return {
    ...door,
    corridorId: edge.id,
    endpoint,
    doorType,
    stairTransition,
    hasStairs: stairTransition !== "none",
    secret: doorType === "secret",
    locked: doorType === "locked",
    open: doorType === "open",
  };
}

export function getPrimaryCorridorLevelTransition(config, corridor) {
  const from = resolveStairTransition(config, corridor.id, "from", "none");
  const to = resolveStairTransition(config, corridor.id, "to", "none");
  const shared = resolveStairTransition(config, corridor.id, "shared", "none");
  if (from !== "none") return { endpoint: "from", type: from };
  if (to !== "none") return { endpoint: "to", type: to };
  if (shared !== "none") return { endpoint: "shared", type: shared };
  return { endpoint: null, type: "none" };
}

export function getCorridorConfiguredLevelDelta(config, corridor) {
  const transition = getPrimaryCorridorLevelTransition(config, corridor);
  if (transition.type === "none") return 0;
  if (transition.endpoint === "from" || transition.endpoint === "shared")
    return transition.type === "up" ? 1 : -1;
  return transition.type === "up" ? -1 : 1;
}

export function computeRegionLevels(regions, corridors, config) {
  const regionIds = new Set(regions.map((region) => region.id));
  const adjacency = new Map(regions.map((region) => [region.id, []]));
  corridors.forEach((corridor) => {
    if (!regionIds.has(corridor.from) || !regionIds.has(corridor.to)) return;
    const delta = getCorridorConfiguredLevelDelta(config, corridor);
    adjacency.get(corridor.from)?.push({ id: corridor.to, delta });
    adjacency.get(corridor.to)?.push({ id: corridor.from, delta: -delta });
  });

  const levels = new Map();
  const starts = [
    regions.find((region) => classifyRegion(region).entrance) || regions[0],
    ...regions,
  ].filter(Boolean);
  starts.forEach((start) => {
    if (levels.has(start.id)) return;
    levels.set(start.id, 0);
    const queue = [start.id];
    while (queue.length > 0) {
      const current = queue.shift();
      const currentLevel = levels.get(current) || 0;
      (adjacency.get(current) || []).forEach((neighbor) => {
        const nextLevel = currentLevel + neighbor.delta;
        if (levels.has(neighbor.id)) return;
        levels.set(neighbor.id, nextLevel);
        queue.push(neighbor.id);
      });
    }
  });
  return levels;
}

export function resolveCorridorDrawLevel(
  corridor,
  fromLevel,
  toLevel,
  transition,
) {
  if (transition.endpoint === "from") return toLevel;
  if (transition.endpoint === "to") return fromLevel;
  if (transition.endpoint === "shared") return Math.max(fromLevel, toLevel);
  return fromLevel;
}

export function applyLevelMetadata(regions, corridors, config) {
  const levelMap = computeRegionLevels(regions, corridors, config);
  const leveledRegions = regions.map((region) => ({
    ...region,
    level: levelMap.get(region.id) ?? 0,
  }));
  const regionById = new Map(
    leveledRegions.map((region) => [region.id, region]),
  );
  const leveledCorridors = corridors.map((corridor) => {
    const fromLevel = regionById.get(corridor.from)?.level ?? 0;
    const toLevel = regionById.get(corridor.to)?.level ?? fromLevel;
    const transition = getPrimaryCorridorLevelTransition(config, corridor);
    return {
      ...corridor,
      fromLevel,
      toLevel,
      level: resolveCorridorDrawLevel(corridor, fromLevel, toLevel, transition),
      levelDelta: toLevel - fromLevel,
      stairEndpoint: transition.endpoint,
      stairTransition: transition.type,
      verticalTransition: fromLevel !== toLevel,
    };
  });
  return { regions: leveledRegions, corridors: leveledCorridors };
}

export function isCorridorVisibleOnLevel(corridor, level) {
  const corridorLevel = getCorridorPlanarLevel(corridor);
  if (corridorLevel === level) return true;
  return Boolean(
    corridor.verticalTransition &&
    (corridor.fromLevel === level || corridor.toLevel === level),
  );
}

export function getWallSegmentAdjacentCells(segment, gridSize) {
  const epsilon = 0.01;
  const horizontal = Math.abs(segment.y1 - segment.y2) < epsilon;
  const vertical = Math.abs(segment.x1 - segment.x2) < epsilon;
  if (!horizontal && !vertical) return null;

  if (horizontal) {
    const x = Math.floor(Math.min(segment.x1, segment.x2) / gridSize);
    const y = Math.round(segment.y1 / gridSize);
    return {
      a: { x, y: y - 1 },
      b: { x, y },
    };
  }

  const x = Math.round(segment.x1 / gridSize);
  const y = Math.floor(Math.min(segment.y1, segment.y2) / gridSize);
  return {
    a: { x: x - 1, y },
    b: { x, y },
  };
}

export function getCorridorPlanarLevel(corridor) {
  return Number.isFinite(corridor?.level) ? corridor.level : 0;
}

export function getCorridorIntersectionCells(corridors) {
  const byCellAndLevel = new Map();
  corridors.forEach((corridor) => {
    const localSeen = new Set();
    const level = getCorridorPlanarLevel(corridor);
    getCorridorTopologyCells(corridor).forEach((cell, index) => {
      const baseKey = cellKey(cell.x, cell.y);
      if (localSeen.has(baseKey)) return;
      localSeen.add(baseKey);
      const key = `${baseKey}:L${level}`;
      if (!byCellAndLevel.has(key)) {
        byCellAndLevel.set(key, {
          key: baseKey,
          cell: { x: cell.x, y: cell.y },
          level,
          corridors: [],
          pathIndexes: [],
        });
      }
      byCellAndLevel.get(key).corridors.push(corridor);
      byCellAndLevel
        .get(key)
        .pathIndexes.push({ corridorId: corridor.id, index });
    });
  });
  return Array.from(byCellAndLevel.values()).filter(
    (junction) => junction.corridors.length >= 2,
  );
}

export function getCrossLevelCorridorIntersectionCells(corridors) {
  const byCell = new Map();
  corridors.forEach((corridor) => {
    const localSeen = new Set();
    const level = getCorridorPlanarLevel(corridor);
    getCorridorTopologyCells(corridor).forEach((cell, index) => {
      const key = cellKey(cell.x, cell.y);
      if (localSeen.has(key)) return;
      localSeen.add(key);
      if (!byCell.has(key)) {
        byCell.set(key, {
          key,
          cell: { x: cell.x, y: cell.y },
          levels: new Set(),
          corridors: [],
          pathIndexes: [],
        });
      }
      const entry = byCell.get(key);
      entry.levels.add(level);
      entry.corridors.push(corridor);
      entry.pathIndexes.push({ corridorId: corridor.id, index, level });
    });
  });
  return Array.from(byCell.values())
    .filter((crossing) => crossing.levels.size >= 2)
    .map((crossing) => ({
      ...crossing,
      levels: Array.from(crossing.levels).sort((a, b) => a - b),
    }));
}

export function getCorridorCellDirection(corridor, cell) {
  const topologyCells = getCorridorTopologyCells(corridor);
  const index = topologyCells.findIndex(
    (candidate) => candidate.x === cell.x && candidate.y === cell.y,
  );
  const previous = index > 0 ? topologyCells[index - 1] : null;
  const next =
    index >= 0 && index < topologyCells.length - 1
      ? topologyCells[index + 1]
      : null;
  const neighbors = [previous, next].filter(Boolean);
  return {
    horizontal: neighbors.some(
      (neighbor) => neighbor.y === cell.y && neighbor.x !== cell.x,
    ),
    vertical: neighbors.some(
      (neighbor) => neighbor.x === cell.x && neighbor.y !== cell.y,
    ),
  };
}

export function inferCorridorJunctionOrientation(junction, seed = "") {
  let horizontal = 0;
  let vertical = 0;
  junction.corridors.forEach((corridor) => {
    const direction = getCorridorCellDirection(corridor, junction.cell);
    if (direction.horizontal) horizontal += 1;
    if (direction.vertical) vertical += 1;
  });
  if (horizontal > vertical) return "vertical";
  if (vertical > horizontal) return "horizontal";
  return hashStringToSeed(seed, junction.key, "junction-orientation") % 2 === 0
    ? "horizontal"
    : "vertical";
}

export function getCorridorJunctionGeometry(junction, config, sideIndex = 0) {
  const g = config.gridSize;
  const x = junction.cell.x * g;
  const y = junction.cell.y * g;
  const cx = x + g / 2;
  const cy = y + g / 2;
  const lineLength = g * 0.92;
  const panelLength = g * 0.6;
  const panelThickness = g * 0.22;
  const side = ((sideIndex % 4) + 4) % 4;

  if (side === 0) {
    return {
      side: "north",
      orientation: "horizontal",
      line: { x1: cx - lineLength / 2, y1: y, x2: cx + lineLength / 2, y2: y },
      panel: {
        x: cx - panelLength / 2,
        y: y - panelThickness / 2,
        width: panelLength,
        height: panelThickness,
      },
    };
  }
  if (side === 1) {
    return {
      side: "east",
      orientation: "vertical",
      line: {
        x1: x + g,
        y1: cy - lineLength / 2,
        x2: x + g,
        y2: cy + lineLength / 2,
      },
      panel: {
        x: x + g - panelThickness / 2,
        y: cy - panelLength / 2,
        width: panelThickness,
        height: panelLength,
      },
    };
  }
  if (side === 2) {
    return {
      side: "south",
      orientation: "horizontal",
      line: {
        x1: cx - lineLength / 2,
        y1: y + g,
        x2: cx + lineLength / 2,
        y2: y + g,
      },
      panel: {
        x: cx - panelLength / 2,
        y: y + g - panelThickness / 2,
        width: panelLength,
        height: panelThickness,
      },
    };
  }
  return {
    side: "west",
    orientation: "vertical",
    line: { x1: x, y1: cy - lineLength / 2, x2: x, y2: cy + lineLength / 2 },
    panel: {
      x: x - panelThickness / 2,
      y: cy - panelLength / 2,
      width: panelThickness,
      height: panelLength,
    },
  };
}

export function getCorridorCrossingOrientation(
  corridor,
  cell,
  fallback = "horizontal",
) {
  const direction = getCorridorCellDirection(corridor, cell);
  if (direction.horizontal && !direction.vertical) return "horizontal";
  if (direction.vertical && !direction.horizontal) return "vertical";
  return fallback;
}

export function getCorridorLocalWallSegmentsForCell(corridor, cell, gridSize) {
  if (!corridor || !cell) return [];
  const corridorCells = new Set(
    (corridor.floorCells || []).map((item) => cellKey(item.x, item.y)),
  );
  return getCellBoundarySegmentsForCell(cell, gridSize).filter((edge) => {
    const neighbor = getNeighborForCellSide(cell, edge.side);
    return !corridorCells.has(cellKey(neighbor.x, neighbor.y));
  });
}

export function getCorridorEndpointCell(corridor, endpoint) {
  const topologyCells = getCorridorTopologyCells(corridor);
  if (!corridor || topologyCells.length === 0) return null;
  if (endpoint === "to") return topologyCells[topologyCells.length - 1];
  return topologyCells[0];
}
