import {
  resolveDoorType,
  resolveStairTransition,
} from "./map-generator.state.js";
import { DEFAULT_CONFIG } from "./map-generator.input.js";
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
  getNeighborForCellSide,
  dedupePoints,
  dedupeDoorSegments,
} from "./map-generator.mask.js";
import { createCircleConnectionAnchorCandidates } from "./map-generator.circle-anchors.js";

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

function doesCellBoxIntersectCircle(x, y, circle, padding = 0) {
  if (!circle) return false;
  const closestX = clamp(circle.cxCells, x, x + 1);
  const closestY = clamp(circle.cyCells, y, y + 1);
  const dx = closestX - circle.cxCells;
  const dy = closestY - circle.cyCells;
  const radius = Math.max(0, circle.rCells + padding);
  return dx * dx + dy * dy <= radius * radius;
}

function getRegionBlockingCellKeys(region) {
  const keys = new Set();
  (Array.isArray(region?.floorCells) ? region.floorCells : []).forEach((cell) =>
    keys.add(cellKey(cell.x, cell.y)),
  );

  if (region?.shape === "circle" && region.cellRect) {
    const circle = getCircleGeometryFromRegion(region, 1);
    const minX = Math.floor(circle.cxCells - circle.rCells - 1);
    const maxX = Math.ceil(circle.cxCells + circle.rCells + 1);
    const minY = Math.floor(circle.cyCells - circle.rCells - 1);
    const maxY = Math.ceil(circle.cyCells + circle.rCells + 1);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (doesCellBoxIntersectCircle(x, y, circle, 0.035)) {
          keys.add(cellKey(x, y));
        }
      }
    }
  }

  (Array.isArray(region?.circleExtensionCells)
    ? region.circleExtensionCells
    : []
  ).forEach((cell) => keys.add(cellKey(cell.x, cell.y)));

  return keys;
}

export function getRoomCellSet(regions) {
  const set = new Set();
  regions.forEach((region) => {
    getRegionBlockingCellKeys(region).forEach((key) => set.add(key));
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

function getAxialNormalForSide(side) {
  if (side === "east") return { x: 1, y: 0 };
  if (side === "west") return { x: -1, y: 0 };
  if (side === "south") return { x: 0, y: 1 };
  return { x: 0, y: -1 };
}

function getDominantSideFromNormal(normal, fallback = "north") {
  if (!normal || (!Number.isFinite(normal.x) && !Number.isFinite(normal.y)))
    return fallback;
  const x = Number.isFinite(normal.x) ? normal.x : 0;
  const y = Number.isFinite(normal.y) ? normal.y : 0;
  if (Math.abs(x) > Math.abs(y)) return x >= 0 ? "east" : "west";
  if (Math.abs(y) > 0) return y >= 0 ? "south" : "north";
  return fallback;
}

function inferFinalSegmentSide(segment, region, generatedMap, gridSize) {
  if (!segment) return "north";
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
  return getDominantSideFromNormal(normal);
}

function getFinalAnchorReferencePoint(anchor, segment, gridSize) {
  if (
    anchor?.point &&
    Number.isFinite(anchor.point.x) &&
    Number.isFinite(anchor.point.y)
  )
    return { x: anchor.point.x, y: anchor.point.y };
  if (segment)
    return {
      x: (segment.x1 + segment.x2) / 2,
      y: (segment.y1 + segment.y2) / 2,
    };
  if (anchor?.cell)
    return {
      x: (anchor.cell.x + 0.5) * gridSize,
      y: (anchor.cell.y + 0.5) * gridSize,
    };
  return null;
}


function getCircleConnectionAnchors(generatedMap, region) {
  if (!generatedMap || region?.shape !== "circle") return [];
  const gridSize = generatedMap.config?.gridSize || 1;
  const circle = getCircleGeometryFromRegion(region, gridSize);
  return createCircleConnectionAnchorCandidates(region, circle, gridSize);
}

function findNearestRegionBoundaryAnchor(region, side, point, gridSize) {
  if (!region || !point || !Array.isArray(region.floorCells)) return null;
  const boundary = getBoundaryCells(region);
  if (boundary.length === 0) return null;
  const scored = boundary.map((anchor) => {
    const handlePoint = getAnchorHandlePoint(anchor, gridSize);
    const sidePenalty = anchor.side === side ? 0 : gridSize * 6;
    const dx = handlePoint.x - point.x;
    const dy = handlePoint.y - point.y;
    return {
      anchor,
      score: dx * dx + dy * dy + sidePenalty * sidePenalty,
    };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored[0]?.anchor || null;
}

function isFinalAnchorPhysicallyValid(anchor, region) {
  if (!anchor?.cell || !anchor?.outsideCell) return false;
  const roomCells = new Set(
    Array.isArray(region?.floorCells)
      ? region.floorCells.map((cell) => cellKey(cell.x, cell.y))
      : [],
  );
  if (!roomCells.has(cellKey(anchor.cell.x, anchor.cell.y))) return false;
  return getCellManhattanDistance(anchor.cell, anchor.outsideCell) === 1;
}

function getSnappedBoundarySegment(anchor, gridSize) {
  if (!anchor?.cell || !anchor.side) return null;
  return (
    getCellBoundarySegmentsForCell(anchor.cell, gridSize).find(
      (segment) => segment.side === anchor.side,
    ) || null
  );
}

function normalizeFinalConnectionAnchor(anchor, region, generatedMap, index = 0) {
  if (!anchor) return null;
  const gridSize = generatedMap?.config?.gridSize || 1;
  const segment = anchor.segment
    ? {
        x1: anchor.segment.x1,
        y1: anchor.segment.y1,
        x2: anchor.segment.x2,
        y2: anchor.segment.y2,
      }
    : null;
  const fallbackSide = segment
    ? inferFinalSegmentSide(segment, region, generatedMap, gridSize)
    : getDominantSideFromNormal(anchor.normal, anchor.side || "north");
  const requestedSide = anchor.side || fallbackSide;
  const referencePoint = getFinalAnchorReferencePoint(anchor, segment, gridSize);
  const snapped = findNearestRegionBoundaryAnchor(
    region,
    requestedSide,
    referencePoint,
    gridSize,
  );
  const side = snapped?.side || requestedSide;
  const normal = snapped?.normal || getAxialNormalForSide(side);
  const cell =
    snapped?.cell ||
    (anchor.cell ? { x: anchor.cell.x, y: anchor.cell.y } : null);
  const outsideCell =
    snapped?.outsideCell ||
    (cell
      ? {
          x: cell.x + normal.x,
          y: cell.y + normal.y,
        }
      : anchor.outsideCell
        ? { x: anchor.outsideCell.x, y: anchor.outsideCell.y }
        : null);
  const shouldSnapSegment =
    snapped && !isFinalAnchorPhysicallyValid(anchor, region);
  const snappedSegment = shouldSnapSegment
    ? getSnappedBoundarySegment(snapped, gridSize)
    : null;
  const normalizedSegment = snappedSegment
    ? {
        x1: snappedSegment.x1,
        y1: snappedSegment.y1,
        x2: snappedSegment.x2,
        y2: snappedSegment.y2,
      }
    : segment;
  const normalizedPoint = normalizedSegment
    ? {
        x: (normalizedSegment.x1 + normalizedSegment.x2) / 2,
        y: (normalizedSegment.y1 + normalizedSegment.y2) / 2,
      }
    : referencePoint;
  return {
    ...anchor,
    regionId: region.id,
    regionShape: region.shape,
    side,
    cell,
    outsideCell,
    normal,
    finalGeometry: true,
    finalBoundaryIndex: anchor.finalBoundaryIndex ?? index,
    ...(normalizedSegment ? { segment: normalizedSegment } : {}),
    ...(normalizedPoint ? { point: normalizedPoint } : {}),
  };
}

export function createFinalAnchorFromSegment(
  segment,
  region,
  generatedMap,
  index = 0,
) {
  const side = inferFinalSegmentSide(
    segment,
    region,
    generatedMap,
    generatedMap?.config?.gridSize || 1,
  );
  return normalizeFinalConnectionAnchor(
    {
      side,
      segment: { x1: segment.x1, y1: segment.y1, x2: segment.x2, y2: segment.y2 },
      point: {
        x: (segment.x1 + segment.x2) / 2,
        y: (segment.y1 + segment.y2) / 2,
      },
      finalBoundaryIndex: index,
    },
    region,
    generatedMap,
    index,
  );
}

export function getFinalConnectionAnchors(generatedMap, region) {
  if (region?.shape === "circle") return getCircleConnectionAnchors(generatedMap, region);
  const regionGeometry = getFinalRegionGeometry(generatedMap, region);
  if (
    Array.isArray(regionGeometry?.connectionAnchors) &&
    regionGeometry.connectionAnchors.length > 0
  )
    return regionGeometry.connectionAnchors
      .map((anchor, index) =>
        normalizeFinalConnectionAnchor(anchor, region, generatedMap, index),
      )
      .filter(Boolean);
  return getFinalBoundarySegments(generatedMap, region)
    .map((segment, index) =>
      createFinalAnchorFromSegment(segment, region, generatedMap, index),
    )
    .filter(Boolean);
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


export function buildSharedRoomTraversalGraph(regions, gridSize) {
  const adjacency = new Map(regions.map((region) => [region.id, []]));
  for (let a = 0; a < regions.length; a += 1) {
    for (let b = a + 1; b < regions.length; b += 1) {
      const from = regions[a];
      const to = regions[b];
      if (getSharedBoundaryConnections(from, to, gridSize).length === 0)
        continue;
      adjacency.get(from.id).push(to.id);
      adjacency.get(to.id).push(from.id);
    }
  }
  return adjacency;
}

export function findSharedRoomTraversalPath(fromId, toId, adjacency) {
  if (!fromId || !toId || !adjacency?.has(fromId) || !adjacency?.has(toId))
    return [];
  if (fromId === toId) return [fromId];
  const queue = [fromId];
  const visited = new Set([fromId]);
  const cameFrom = new Map();

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === toId) break;
    (adjacency.get(current) || []).forEach((next) => {
      if (visited.has(next)) return;
      visited.add(next);
      cameFrom.set(next, current);
      queue.push(next);
    });
  }

  if (!visited.has(toId)) return [];
  const path = [];
  let current = toId;
  while (current) {
    path.push(current);
    current = cameFrom.get(current);
  }
  return path.reverse();
}

export function getCorridorEndpointRegionIds(corridor) {
  return new Set(
    [
      corridor?.from,
      corridor?.to,
      corridor?.fromAnchor?.regionId,
      corridor?.toAnchor?.regionId,
    ].filter(Boolean),
  );
}

export function getRoomCellOwnershipMap(regions) {
  const ownership = new Map();
  regions.forEach((region) => {
    getRegionBlockingCellKeys(region).forEach((key) => {
      if (!ownership.has(key)) ownership.set(key, []);
      ownership.get(key).push(region.id);
    });
  });
  return ownership;
}

export function isRoomCellOwnedOnlyByEndpointRegions(
  key,
  endpointRegionIds,
  roomOwnership,
) {
  const owners = roomOwnership.get(key) || [];
  return (
    owners.length === 0 ||
    owners.every((regionId) => endpointRegionIds.has(regionId))
  );
}

export function getNonEndpointRoomTunnelHits(corridor, roomOwnership) {
  if (
    corridor?.isRoomLink ||
    !Array.isArray(corridor?.floorCells) ||
    corridor.floorCells.length === 0
  ) {
    return [];
  }
  const endpointRegionIds = getCorridorEndpointRegionIds(corridor);
  const hits = [];
  corridor.floorCells.forEach((cell, index) => {
    const key = cellKey(cell.x, cell.y);
    const regionIds = (roomOwnership.get(key) || []).filter(
      (regionId) => !endpointRegionIds.has(regionId),
    );
    if (regionIds.length > 0)
      hits.push({ index, cell: { x: cell.x, y: cell.y }, regionIds });
  });
  return hits;
}

export function createSharedRoomTraversalCorridor(
  corridor,
  config,
  gridSize,
  rng,
  profile,
  regionById,
  sharedRoomTraversalGraph,
) {
  const from = regionById.get(corridor.from || corridor.fromAnchor?.regionId);
  const to = regionById.get(corridor.to || corridor.toAnchor?.regionId);
  if (!from || !to) return null;

  const traversalRegionIds = findSharedRoomTraversalPath(
    from.id,
    to.id,
    sharedRoomTraversalGraph,
  );
  if (traversalRegionIds.length < 2) return null;

  const pureCaveContext = getContextKey(config.context || config.biome) === "cave";
  const corridorSurfaceKind =
    corridor.surfaceKind || getCorridorSurfaceProfile(config, from, to, corridor);
  const naturalCaveConnection =
    pureCaveContext && shouldUseOrganicTunnel(config, from, to);
  const doors = [];
  const traversalPoints = [];

  for (let index = 0; index < traversalRegionIds.length - 1; index += 1) {
    const roomA = regionById.get(traversalRegionIds[index]);
    const roomB = regionById.get(traversalRegionIds[index + 1]);
    if (!roomA || !roomB) return null;
    const connection = getSharedRoomConnection(
      roomA,
      roomB,
      gridSize,
      rng,
      null,
      null,
      profile,
    );
    if (!connection) return null;
    traversalPoints.push(connection.point);
    if (!naturalCaveConnection) {
      const sharedBreachRegion = roomA.surfaceKind === "structure" ? roomB : roomA;
      doors.push(
        markMineBreachOpening(
          decorateDoorSegment(
            connection.door,
            config,
            corridor,
            `traversal-${index}`,
          ),
          config,
          corridorSurfaceKind,
          sharedBreachRegion,
        ),
      );
    }
  }

  return {
    ...corridor,
    isRoomLink: true,
    roomTraversal: true,
    recoveredRoomTraversal: Boolean(corridor.recoveredGraphEdge),
    surfaceKind: corridorSurfaceKind,
    corridorStyle: naturalCaveConnection
      ? "natural-tunnel"
      : corridor.corridorStyle || "structured-corridor",
    fromAnchor: null,
    toAnchor: null,
    floorCells: [],
    pathCells: [],
    centerline: [],
    manualWaypoints: [],
    waypoints: [],
    traversalRegionIds,
    throughRegionIds: traversalRegionIds.slice(1, -1),
    traversalPoints,
    doors: dedupeDoorSegments(doors),
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
  const serialized = {
    side: anchor.side,
    cell: { x: anchor.cell.x, y: anchor.cell.y },
  };
  if (anchor.outsideCell) {
    serialized.outsideCell = { x: anchor.outsideCell.x, y: anchor.outsideCell.y };
  }
  if (anchor.snapCell) {
    serialized.snapCell = { x: anchor.snapCell.x, y: anchor.snapCell.y };
  }
  if (anchor.routingOutsideCell) {
    serialized.routingOutsideCell = {
      x: anchor.routingOutsideCell.x,
      y: anchor.routingOutsideCell.y,
    };
  }
  if (anchor.normal) {
    serialized.normal = { x: anchor.normal.x, y: anchor.normal.y };
  }
  if (anchor.point) {
    serialized.point = { x: anchor.point.x, y: anchor.point.y };
  }
  if (anchor.segment) {
    serialized.segment = {
      x1: anchor.segment.x1,
      y1: anchor.segment.y1,
      x2: anchor.segment.x2,
      y2: anchor.segment.y2,
    };
  }
  if (anchor.circleBoundaryAnchor) serialized.circleBoundaryAnchor = true;
  if (anchor.finalGeometry) {
    serialized.finalGeometry = true;
    serialized.finalBoundaryIndex = anchor.finalBoundaryIndex;
  }
  if (anchor.expandedCircleDoor && anchor.portalRoomCell) {
    serialized.expandedCircleDoor = true;
    serialized.portalRoomCell = {
      x: anchor.portalRoomCell.x,
      y: anchor.portalRoomCell.y,
    };
    serialized.originalCell = anchor.originalCell
      ? { x: anchor.originalCell.x, y: anchor.originalCell.y }
      : null;
    serialized.originalOutsideCell = anchor.originalOutsideCell
      ? {
          x: anchor.originalOutsideCell.x,
          y: anchor.originalOutsideCell.y,
        }
      : null;
  }
  return serialized;
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

function getCellCopy(cell) {
  return cell && Number.isFinite(cell.x) && Number.isFinite(cell.y)
    ? { x: cell.x, y: cell.y }
    : null;
}

function inferAnchorSideFromCells(cell, outsideCell, fallbackSide = null) {
  if (!cell || !outsideCell) return fallbackSide;
  const dx = outsideCell.x - cell.x;
  const dy = outsideCell.y - cell.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx > 0) return "east";
    if (dx < 0) return "west";
  }
  if (dy > 0) return "south";
  if (dy < 0) return "north";
  return fallbackSide;
}

function inferAnchorNormalFromCells(cell, outsideCell, fallbackNormal = null) {
  if (fallbackNormal) return { x: fallbackNormal.x, y: fallbackNormal.y };
  if (!cell || !outsideCell) return null;
  const dx = outsideCell.x - cell.x;
  const dy = outsideCell.y - cell.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx > 0) return { x: 1, y: 0 };
    if (dx < 0) return { x: -1, y: 0 };
  }
  if (dy > 0) return { x: 0, y: 1 };
  if (dy < 0) return { x: 0, y: -1 };
  return null;
}

function getManualAnchorWithExactOutsideCell(region, manualAnchor, gridSize) {
  const cell = getCellCopy(manualAnchor?.cell);
  const outsideCell = getCellCopy(manualAnchor?.outsideCell);
  if (!cell || !outsideCell) return null;
  const side = inferAnchorSideFromCells(cell, outsideCell, manualAnchor.side);
  if (!side) return null;
  const snapCell = getCellCopy(manualAnchor.snapCell);
  const routingOutsideCell = getCellCopy(manualAnchor.routingOutsideCell);
  const normal = inferAnchorNormalFromCells(cell, outsideCell, manualAnchor.normal);
  const point = manualAnchor.point
    ? { x: manualAnchor.point.x, y: manualAnchor.point.y }
    : getAnchorHandlePoint({ side, cell, outsideCell, point: null }, gridSize);
  return {
    regionId: region.id,
    regionShape: region.shape,
    side,
    cell,
    outsideCell,
    snapCell,
    routingOutsideCell,
    normal,
    circular: manualAnchor.circular || null,
    finalGeometry: Boolean(manualAnchor.finalGeometry),
    circleBoundaryAnchor: Boolean(
      manualAnchor.circleBoundaryAnchor ||
      region?.shape === "circle" ||
      snapCell ||
      routingOutsideCell,
    ),
    finalBoundaryIndex: manualAnchor.finalBoundaryIndex,
    segment: manualAnchor.segment
      ? {
          x1: manualAnchor.segment.x1,
          y1: manualAnchor.segment.y1,
          x2: manualAnchor.segment.x2,
          y2: manualAnchor.segment.y2,
        }
      : null,
    point,
  };
}

export function resolveManualDoorAnchor(
  region,
  manualAnchor,
  gridSize = DEFAULT_CONFIG.gridSize,
) {
  if (!manualAnchor) return null;
  if (
    manualAnchor.finalGeometry &&
    manualAnchor.segment &&
    manualAnchor.cell &&
    manualAnchor.outsideCell &&
    manualAnchor.normal
  ) {
    const point = manualAnchor.point
      ? { x: manualAnchor.point.x, y: manualAnchor.point.y }
      : {
          x: (manualAnchor.segment.x1 + manualAnchor.segment.x2) / 2,
          y: (manualAnchor.segment.y1 + manualAnchor.segment.y2) / 2,
        };
    const circle = region?.shape === "circle"
      ? getCircleGeometryFromRegion(region, 1)
      : null;
    const pixelCircle = region?.shape === "circle"
      ? getCircleGeometryFromRegion(region, gridSize || DEFAULT_CONFIG.gridSize)
      : null;
    const radial = circle && pixelCircle && point
      ? (() => {
          const dx = point.x - pixelCircle.cx;
          const dy = point.y - pixelCircle.cy;
          const length = Math.hypot(dx, dy) || 1;
          return { x: dx / length, y: dy / length };
        })()
      : null;
    return {
      regionId: region.id,
      regionShape: region.shape,
      side: manualAnchor.side,
      cell: { x: manualAnchor.cell.x, y: manualAnchor.cell.y },
      outsideCell: {
        x: manualAnchor.outsideCell.x,
        y: manualAnchor.outsideCell.y,
      },
      snapCell: manualAnchor.snapCell
        ? {
            x: manualAnchor.snapCell.x,
            y: manualAnchor.snapCell.y,
          }
        : null,
      routingOutsideCell: manualAnchor.routingOutsideCell
        ? {
            x: manualAnchor.routingOutsideCell.x,
            y: manualAnchor.routingOutsideCell.y,
          }
        : null,
      normal: { x: manualAnchor.normal.x, y: manualAnchor.normal.y },
      circular: radial && circle
        ? { cx: circle.cxCells, cy: circle.cyCells, r: circle.rCells, normal: radial }
        : null,
      finalGeometry: true,
      circleBoundaryAnchor: Boolean(manualAnchor.circleBoundaryAnchor || region?.shape === "circle"),
      finalBoundaryIndex: manualAnchor.finalBoundaryIndex,
      segment: {
        x1: manualAnchor.segment.x1,
        y1: manualAnchor.segment.y1,
        x2: manualAnchor.segment.x2,
        y2: manualAnchor.segment.y2,
      },
      point,
    };
  }
  const exactOutsideAnchor = getManualAnchorWithExactOutsideCell(
    region,
    manualAnchor,
    gridSize,
  );
  if (exactOutsideAnchor) return exactOutsideAnchor;

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


function cloneCell(cell) {
  return cell && Number.isFinite(cell.x) && Number.isFinite(cell.y)
    ? { x: cell.x, y: cell.y }
    : null;
}

function getCellManhattanDistance(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  return Math.abs(Number(a.x) - Number(b.x)) + Math.abs(Number(a.y) - Number(b.y));
}

function getAnchorBridgeCell(anchor, roomCells = null) {
  if (!anchor?.finalGeometry || !anchor.cell || !anchor.outsideCell) return null;
  if (areSameCell(anchor.cell, anchor.outsideCell)) return null;
  if (getCellManhattanDistance(anchor.cell, anchor.outsideCell) !== 1) return null;
  const key = cellKey(anchor.cell.x, anchor.cell.y);
  if (roomCells?.has?.(key)) return null;
  return cloneCell(anchor.cell);
}

function mergeEndpointBridgeCells(pathCells, fromBridgeCell = null, toBridgeCell = null) {
  const cells = Array.isArray(pathCells)
    ? pathCells.map(cloneCell).filter(Boolean)
    : [];
  const hasCell = (candidate) =>
    candidate && cells.some((cell) => areSameCell(cell, candidate));
  const first = cells[0] || null;
  const last = cells[cells.length - 1] || null;
  if (fromBridgeCell && first && !hasCell(fromBridgeCell) && getCellManhattanDistance(fromBridgeCell, first) === 1) {
    cells.unshift(cloneCell(fromBridgeCell));
  }
  if (toBridgeCell && last && !hasCell(toBridgeCell) && getCellManhattanDistance(toBridgeCell, last) === 1) {
    cells.push(cloneCell(toBridgeCell));
  }
  return cells;
}

function applyAnchorBridgeCells(pathCells, fromAnchor, toAnchor, roomCells = null) {
  const fromAnchorBridgeCell = getAnchorBridgeCell(fromAnchor, roomCells);
  const toAnchorBridgeCell = getAnchorBridgeCell(toAnchor, roomCells);
  return {
    pathCells: mergeEndpointBridgeCells(pathCells, fromAnchorBridgeCell, toAnchorBridgeCell),
    fromAnchorBridgeCell,
    toAnchorBridgeCell,
  };
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
      const reusesExistingCorridor =
        existingCorridors.has(nextKey) &&
        nextKey !== goalKey &&
        nextKey !== startKey;
      const corridorOverlapPenalty = reusesExistingCorridor
        ? (routingProfile.corridorOverlapPenalty ?? 0)
        : 0;
      const corridorReuseBonus = reusesExistingCorridor
        ? clamp(
            Number(routingProfile.corridorReuseBonus ?? 0.62),
            0,
            0.82,
          )
        : 0;
      const parallelCorridorPenalty =
        adjacentToExistingCorridors.has(nextKey) &&
        !existingCorridors.has(nextKey)
          ? (routingProfile.adjacentCorridorPenalty ?? 0.25)
          : 0;
      const stepCost = Math.max(
        0.18,
        1 +
          turnCost +
          wallPenalty +
          parallelCorridorPenalty +
          corridorOverlapPenalty -
          corridorReuseBonus,
      );
      const g = current.g + stepCost;
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
  const bridgedPath = mergeEndpointBridgeCells(
    path,
    corridor.fromAnchorBridgeCell,
    corridor.toAnchorBridgeCell,
  );
  const centerline = bridgedPath.map((cell) => ({
    x: (cell.x + 0.5) * gridSize,
    y: (cell.y + 0.5) * gridSize,
  }));
  return {
    ...corridor,
    floorCells: bridgedPath.map((cell) => ({ x: cell.x, y: cell.y })),
    pathCells: bridgedPath.map((cell) => ({ x: cell.x, y: cell.y })),
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
  if (isUsableCorridorPath(path, start, goal)) return path;
  const directPath = linePathBetweenCells(start, goal);
  const invalidCell = directPath.some((cell) => {
    const key = cellKey(cell.x, cell.y);
    return (
      cell.x <= 0 ||
      cell.y <= 0 ||
      cell.x >= options.gridW - 1 ||
      cell.y >= options.gridH - 1 ||
      (options.blocked.has(key) &&
        !areSameCell(cell, start) &&
        !areSameCell(cell, goal))
    );
  });
  return invalidCell ? [] : directPath;
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


const AUTO_CORRIDOR_HUB_DEFAULT_MIN_EDGES = 3;

function getAutoCorridorHubMinEdges(config = {}) {
  const raw = Number(
    config.autoCorridorHubMinEdges ??
      config.dungeonBrief?.autoCorridorHubMinEdges ??
      config.normalizedMapRequest?.autoCorridorHubMinEdges ??
      config.normalizedMapRequest?.metadata?.autoCorridorHubMinEdges,
  );
  return clamp(
    Number.isFinite(raw) ? Math.round(raw) : AUTO_CORRIDOR_HUB_DEFAULT_MIN_EDGES,
    3,
    8,
  );
}

function shouldUseAutoCorridorHubs(config = {}) {
  const raw =
    config.autoCorridorHubs ??
    config.dungeonBrief?.autoCorridorHubs ??
    config.normalizedMapRequest?.autoCorridorHubs ??
    config.normalizedMapRequest?.metadata?.autoCorridorHubs;
  if (raw === false) return false;
  if (typeof raw === "string") {
    const value = raw.trim().toLowerCase();
    if (["off", "false", "0", "disabled", "none"].includes(value)) return false;
  }
  return true;
}

function shouldReuseAutoCorridorDoors(config = {}) {
  const raw =
    config.autoCorridorDoorReuse ??
    config.dungeonBrief?.autoCorridorDoorReuse ??
    config.normalizedMapRequest?.autoCorridorDoorReuse ??
    config.normalizedMapRequest?.metadata?.autoCorridorDoorReuse;
  if (raw === false) return false;
  if (typeof raw === "string") {
    const value = raw.trim().toLowerCase();
    if (["off", "false", "0", "disabled", "none"].includes(value)) return false;
  }
  return true;
}

function getAutoCorridorDoorReuseRadius(config = {}) {
  const raw = Number(
    config.autoCorridorDoorReuseRadius ??
      config.dungeonBrief?.autoCorridorDoorReuseRadius ??
      config.normalizedMapRequest?.autoCorridorDoorReuseRadius ??
      config.normalizedMapRequest?.metadata?.autoCorridorDoorReuseRadius,
  );
  return clamp(Number.isFinite(raw) ? Math.round(raw) : 2, 1, 4);
}

function getAutoCorridorDoorSpacingRadius(config = {}) {
  const raw = Number(
    config.autoCorridorDoorSpacingRadius ??
      config.dungeonBrief?.autoCorridorDoorSpacingRadius ??
      config.normalizedMapRequest?.autoCorridorDoorSpacingRadius ??
      config.normalizedMapRequest?.metadata?.autoCorridorDoorSpacingRadius,
  );
  return clamp(Number.isFinite(raw) ? Math.round(raw) : 1, 0, 3);
}

function getDoorOccupancyKey(door, gridSize = 1) {
  if (door?.outsideCell)
    return cellKey(door.outsideCell.x, door.outsideCell.y);
  if (door?.cell) return cellKey(door.cell.x, door.cell.y);
  if (
    Number.isFinite(door?.x1) &&
    Number.isFinite(door?.y1) &&
    Number.isFinite(door?.x2) &&
    Number.isFinite(door?.y2) &&
    gridSize > 0
  ) {
    const centerX = (door.x1 + door.x2) / 2;
    const centerY = (door.y1 + door.y2) / 2;
    return cellKey(
      Math.floor(centerX / gridSize),
      Math.floor(centerY / gridSize),
    );
  }
  return null;
}

function isManualDoorSegment(config = {}, door = {}) {
  if (!door?.corridorId || !door?.endpoint) return false;
  return Boolean(
    config.manualDoorAnchors?.[corridorEndpointKey(door.corridorId, door.endpoint)],
  );
}

function getGeneratedDoorPriority(door = {}, corridor = {}) {
  let score = 0;
  if (door.stairTransition && door.stairTransition !== "none") score += 100;
  if (door.doorType === "locked") score += 30;
  if (door.doorType === "secret" || door.secret) score += 20;
  if (corridor.autoHubStem) score += 8;
  if (corridor.autoHub) score += 4;
  if (corridor.recoveredGraphEdge) score -= 6;
  return score;
}

function normalizeGeneratedDoorOccupancy(corridors, config = {}, gridSize = 1) {
  // Do not remove doors from corridor data here. A duplicate door square can
  // still be the semantic endpoint that keeps a corridor attached to its room,
  // especially after room drags or recovery routing. Visible/cut door
  // de-duplication is handled later by buildDungeonMask via dedupeDoorSegments,
  // where the corridor topology remains intact.
  if (!Array.isArray(corridors) || corridors.length === 0) return corridors;
  return corridors.map((corridor) => {
    if (!Array.isArray(corridor?.doors)) return corridor;
    return {
      ...corridor,
      doors: dedupeDoorSegments(corridor.doors),
    };
  });
}

function getRegionCenterInCells(region) {
  const rect = region?.cellRect;
  if (!rect) return null;
  return {
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h / 2,
  };
}

function getSideFromRegionToRegion(source, target) {
  const sourceCenter = getRegionCenterInCells(source);
  const targetCenter = getRegionCenterInCells(target);
  const sourceRect = source?.cellRect;
  const targetRect = target?.cellRect;
  if (!sourceCenter || !targetCenter || !sourceRect || !targetRect) return "east";

  if (targetCenter.x >= sourceRect.x + sourceRect.w) return "east";
  if (targetCenter.x <= sourceRect.x) return "west";
  if (targetCenter.y >= sourceRect.y + sourceRect.h) return "south";
  if (targetCenter.y <= sourceRect.y) return "north";

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "east" : "west";
  return dy >= 0 ? "south" : "north";
}

function getNormalForSide(side) {
  if (side === "north") return { x: 0, y: -1 };
  if (side === "south") return { x: 0, y: 1 };
  if (side === "west") return { x: -1, y: 0 };
  return { x: 1, y: 0 };
}

function getTangentForNormal(normal) {
  return Math.abs(normal.x) > Math.abs(normal.y)
    ? { x: 0, y: 1 }
    : { x: 1, y: 0 };
}

function getEdgeEndpointForRegion(edge, regionId) {
  if (edge?.from === regionId) return "from";
  if (edge?.to === regionId) return "to";
  return null;
}

function getOtherRegionIdForEdge(edge, regionId) {
  if (edge?.from === regionId) return edge.to;
  if (edge?.to === regionId) return edge.from;
  return null;
}

function hasManualDoorAnchorForEndpoint(config, edge, endpoint) {
  return Boolean(
    endpoint &&
      edge?.id &&
      config.manualDoorAnchors?.[corridorEndpointKey(edge.id, endpoint)],
  );
}

function isAutoHubEligibleEdge(config, edge, regionId) {
  const endpoint = getEdgeEndpointForRegion(edge, regionId);
  const otherEndpoint = endpoint === "from" ? "to" : endpoint === "to" ? "from" : null;
  if (!endpoint || !otherEndpoint) return false;
  if (!edge?.id || edge.secret || edge.locked || edge.explicit) return false;
  if (edge.kind === "manual" || edge.reason === "manual-editor-connection") return false;
  if (Array.isArray(edge.manualWaypoints) && edge.manualWaypoints.length > 0)
    return false;
  if (hasManualDoorAnchorForEndpoint(config, edge, endpoint)) return false;
  if (hasManualDoorAnchorForEndpoint(config, edge, otherEndpoint)) return false;
  return true;
}

function buildAutoCorridorHubGroups(config, regions, graph) {
  if (!shouldUseAutoCorridorHubs(config)) return [];
  const minEdges = getAutoCorridorHubMinEdges(config);
  const regionById = new Map(regions.map((region) => [region.id, region]));
  const buckets = new Map();

  graph.forEach((edge) => {
    [edge.from, edge.to].forEach((regionId) => {
      const region = regionById.get(regionId);
      const other = regionById.get(getOtherRegionIdForEdge(edge, regionId));
      if (!region || !other || !isAutoHubEligibleEdge(config, edge, regionId))
        return;
      const side = getSideFromRegionToRegion(region, other);
      const key = `${regionId}:${side}`;
      if (!buckets.has(key)) {
        buckets.set(key, { region, side, entries: [] });
      }
      buckets.get(key).entries.push({ edge, target: other });
    });
  });

  const claimedEdgeIds = new Set();
  return Array.from(buckets.values())
    .map((bucket) => ({
      ...bucket,
      entries: bucket.entries.filter((entry) => !claimedEdgeIds.has(entry.edge.id)),
    }))
    .filter((bucket) => bucket.entries.length >= minEdges)
    .sort(
      (a, b) =>
        b.entries.length - a.entries.length ||
        getRegionGraphSortKey(a.region, config.seed) -
          getRegionGraphSortKey(b.region, config.seed),
    )
    .map((bucket, index) => {
      const entries = bucket.entries.filter((entry) => !claimedEdgeIds.has(entry.edge.id));
      if (entries.length < minEdges) return null;
      entries.forEach((entry) => claimedEdgeIds.add(entry.edge.id));
      return {
        id: `auto-hub-${bucket.region.id}-${bucket.side}-${index}`,
        region: bucket.region,
        side: bucket.side,
        entries,
      };
    })
    .filter(Boolean);
}

function getRegionGraphSortKey(region, seed) {
  return hashStringToSeed(seed, region?.id || "region", "auto-hub-order");
}

function getTargetCentroid(entries) {
  const centers = entries
    .map((entry) => getRegionCenterInCells(entry.target))
    .filter(Boolean);
  if (centers.length === 0) return null;
  return {
    x: centers.reduce((sum, center) => sum + center.x, 0) / centers.length,
    y: centers.reduce((sum, center) => sum + center.y, 0) / centers.length,
  };
}

function chooseHubAnchorForRegionSide(
  region,
  side,
  targetCentroid,
  rng,
  forbiddenOutsideCells,
  profile,
  generatedMap = null,
) {
  const boundary = getDoorBoundaryCells(region, generatedMap).filter(
    (anchor) =>
      anchor.side === side &&
      isDoorOrientationCompatibleWithLocalWall(anchor) &&
      !forbiddenOutsideCells?.has(cellKey(anchor.outsideCell.x, anchor.outsideCell.y)),
  );
  const candidates = boundary.length > 0
    ? boundary
    : getDoorBoundaryCells(region, generatedMap).filter(
        (anchor) =>
          !forbiddenOutsideCells?.has(
            cellKey(anchor.outsideCell.x, anchor.outsideCell.y),
          ),
      );
  if (candidates.length === 0) return null;
  const centerBias = getDoorArchitectureBias(region, profile);
  const ranked = candidates
    .map((anchor) => {
      const edgeCenter = getAnchorDoorEdgeCenterInCells(anchor);
      const dx = targetCentroid ? edgeCenter.x - targetCentroid.x : 0;
      const dy = targetCentroid ? edgeCenter.y - targetCentroid.y : 0;
      const sidePenalty = anchor.side === side ? 0 : 80;
      const centerPenalty = Math.pow(getAnchorCenterOffset(anchor, region), 2) * centerBias;
      return {
        anchor,
        score: dx * dx + dy * dy + sidePenalty + centerPenalty + rng() * 0.35,
      };
    })
    .sort((a, b) => a.score - b.score);
  return ranked[0].anchor;
}

function isCellInsideGrid(cell, gridW, gridH) {
  return Boolean(
    cell && cell.x > 0 && cell.y > 0 && cell.x < gridW - 1 && cell.y < gridH - 1,
  );
}

function findAutoHubCell(anchor, gridW, gridH, blockedRoomCells, existingCorridors, usedDoorOutsideCells) {
  if (!anchor?.outsideCell) return null;
  const normal = anchor.normal || getNormalForSide(anchor.side);
  const tangent = getTangentForNormal(normal);
  const candidates = [];
  [2, 3, 4, 5, 1, 6].forEach((distance) => {
    [0, -1, 1, -2, 2].forEach((offset) => {
      candidates.push({
        x: anchor.outsideCell.x + normal.x * distance + tangent.x * offset,
        y: anchor.outsideCell.y + normal.y * distance + tangent.y * offset,
      });
    });
  });
  const ranked = candidates
    .filter((cell) => isCellInsideGrid(cell, gridW, gridH))
    .map((cell) => {
      const key = cellKey(cell.x, cell.y);
      if (blockedRoomCells.has(key) || usedDoorOutsideCells.has(key)) return null;
      const corridorPenalty = existingCorridors.has(key) ? 4 : 0;
      const dx = cell.x - anchor.outsideCell.x;
      const dy = cell.y - anchor.outsideCell.y;
      return { cell, score: dx * dx + dy * dy + corridorPenalty };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score);
  return ranked[0]?.cell || null;
}

function createVirtualHubAnchor(hubCell, side, gridSize, hubId) {
  const normal = getNormalForSide(side);
  return {
    regionId: hubId,
    regionShape: "corridor-hub",
    side,
    cell: { x: hubCell.x, y: hubCell.y },
    outsideCell: { x: hubCell.x, y: hubCell.y },
    normal,
    finalGeometry: true,
    virtualJunction: true,
    hubId,
    point: {
      x: (hubCell.x + 0.5) * gridSize,
      y: (hubCell.y + 0.5) * gridSize,
    },
  };
}

function getAnchorOutsideKey(anchor) {
  return anchor?.outsideCell
    ? cellKey(anchor.outsideCell.x, anchor.outsideCell.y)
    : null;
}

function getAnchorDistance(a, b) {
  if (!a?.outsideCell || !b?.outsideCell) return Number.POSITIVE_INFINITY;
  return (
    Math.abs(a.outsideCell.x - b.outsideCell.x) +
    Math.abs(a.outsideCell.y - b.outsideCell.y)
  );
}

function isCorridorDoorReuseEligible(edge = {}, endpoint = null) {
  if (!endpoint || !edge?.id) return false;
  if (edge.secret || edge.locked || edge.explicit) return false;
  if (edge.kind === "manual" || edge.reason === "manual-editor-connection")
    return false;
  if (Array.isArray(edge.manualWaypoints) && edge.manualWaypoints.length > 0)
    return false;
  return true;
}

function cloneReusableAnchor(anchor) {
  if (!anchor) return null;
  return {
    ...anchor,
    cell: anchor.cell ? { x: anchor.cell.x, y: anchor.cell.y } : anchor.cell,
    outsideCell: anchor.outsideCell
      ? { x: anchor.outsideCell.x, y: anchor.outsideCell.y }
      : anchor.outsideCell,
    normal: anchor.normal ? { x: anchor.normal.x, y: anchor.normal.y } : anchor.normal,
    point: anchor.point ? { x: anchor.point.x, y: anchor.point.y } : anchor.point,
    segment: anchor.segment ? { ...anchor.segment } : anchor.segment,
  };
}

function findReusableDoorAnchor(
  doorAnchorsByRegion,
  config,
  region,
  targetRegion,
  idealAnchor,
  edge,
  endpoint,
  profile,
) {
  if (!shouldReuseAutoCorridorDoors(config)) return null;
  if (!region || !targetRegion || !isCorridorDoorReuseEligible(edge, endpoint))
    return null;
  const candidates = doorAnchorsByRegion.get(region.id) || [];
  if (candidates.length === 0) return null;
  const desiredSide = idealAnchor?.side || getSideFromRegionToRegion(region, targetRegion);
  const radius = getAutoCorridorDoorReuseRadius(config);
  const ranked = candidates
    .map((entry) => {
      const anchor = entry?.anchor;
      if (!anchor?.outsideCell || anchor.virtualJunction) return null;
      if (entry.secret || entry.locked) return null;
      if (anchor.side !== desiredSide) return null;
      if (!isDoorOrientationCompatibleWithLocalWall(anchor)) return null;
      const distance = idealAnchor ? getAnchorDistance(anchor, idealAnchor) : 0;
      if (distance > radius) return null;
      return {
        anchor,
        score:
          distance * 6 +
          getDirectionalDoorScore(anchor, region, targetRegion) +
          Math.pow(getAnchorCenterOffset(anchor, region), 2) *
            getDoorArchitectureBias(region, profile) *
            0.5 +
          (entry.corridorId === edge.id ? 20 : 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score);
  return cloneReusableAnchor(ranked[0]?.anchor || null);
}

function getDoorSpacingCellsForRegion(usedDoorOutsideCellsByRegion, regionId, radius) {
  if (!regionId || radius <= 0) return [];
  const cells = usedDoorOutsideCellsByRegion.get(regionId);
  if (!cells || cells.size === 0) return [];
  const output = [];
  cells.forEach((key) => {
    const cell = parseCellKey(key);
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (Math.abs(dx) + Math.abs(dy) > radius) continue;
        output.push({ x: cell.x + dx, y: cell.y + dy });
      }
    }
  });
  return output;
}

function cellsToCenterline(cells, gridSize) {
  return cells.map((cell) => ({
    x: (cell.x + 0.5) * gridSize,
    y: (cell.y + 0.5) * gridSize,
  }));
}


function collectPhysicalFloorComponents(regions, corridors) {
  const cellSources = new Map();
  const regionIds = new Set((regions || []).map((region) => region?.id).filter(Boolean));
  const addSource = (cell, source) => {
    if (!cell || !Number.isFinite(cell.x) || !Number.isFinite(cell.y)) return;
    const key = cellKey(cell.x, cell.y);
    if (!cellSources.has(key)) {
      cellSources.set(key, {
        cell: { x: cell.x, y: cell.y },
        roomIds: new Set(),
        corridorIds: new Set(),
      });
    }
    const entry = cellSources.get(key);
    if (source.roomId) entry.roomIds.add(source.roomId);
    if (source.corridorId) entry.corridorIds.add(source.corridorId);
  };
  const addExpandedCircleDoorPortal = (anchor) => {
    if (
      !anchor?.expandedCircleDoor ||
      !anchor?.portalRoomCell ||
      !anchor?.regionId ||
      !regionIds.has(anchor.regionId)
    )
      return;
    addSource(anchor.portalRoomCell, { roomId: anchor.regionId });
  };

  (regions || []).forEach((region) => {
    (region.floorCells || []).forEach((cell) =>
      addSource(cell, { roomId: region.id }),
    );
  });
  (corridors || []).forEach((corridor) => {
    if (corridor?.isRoomLink) return;
    addExpandedCircleDoorPortal(corridor.fromAnchor);
    addExpandedCircleDoorPortal(corridor.toAnchor);
    (corridor.floorCells || []).forEach((cell) =>
      addSource(cell, { corridorId: corridor.id }),
    );
  });

  const visited = new Set();
  const components = [];
  cellSources.forEach((entry, startKey) => {
    if (visited.has(startKey)) return;
    const queue = [startKey];
    visited.add(startKey);
    const component = {
      cellKeys: new Set(),
      roomIds: new Set(),
      corridorIds: new Set(),
    };
    while (queue.length > 0) {
      const key = queue.shift();
      const source = cellSources.get(key);
      if (!source) continue;
      component.cellKeys.add(key);
      source.roomIds.forEach((roomId) => component.roomIds.add(roomId));
      source.corridorIds.forEach((corridorId) =>
        component.corridorIds.add(corridorId),
      );
      getCellNeighbors(source.cell).forEach((neighbor) => {
        const neighborKey = cellKey(neighbor.x, neighbor.y);
        if (!cellSources.has(neighborKey) || visited.has(neighborKey)) return;
        visited.add(neighborKey);
        queue.push(neighborKey);
      });
    }
    components.push(component);
  });
  return components;
}

function summarizePhysicalFloorComponent(component, index = 0) {
  return {
    index,
    cellCount: component?.cellKeys?.size || 0,
    roomIds: Array.from(component?.roomIds || []).sort(),
    corridorIds: Array.from(component?.corridorIds || []).sort(),
  };
}

function getRegionFloorCellKeys(region) {
  return new Set(
    (Array.isArray(region?.floorCells) ? region.floorCells : []).map((cell) =>
      cellKey(cell.x, cell.y),
    ),
  );
}

function getCorridorFloorCellKeys(corridor) {
  return new Set(
    (Array.isArray(corridor?.floorCells) ? corridor.floorCells : []).map((cell) =>
      cellKey(cell.x, cell.y),
    ),
  );
}

function isAnchorAttachedToRegion(region, anchor) {
  if (!region?.id || !anchor?.cell || !anchor?.outsideCell) return false;
  const regionFloorKeys = getRegionFloorCellKeys(region);
  const attachedCellKey = cellKey(anchor.cell.x, anchor.cell.y);
  const expandedPortalKey = anchor?.expandedCircleDoor && anchor.portalRoomCell
    ? cellKey(anchor.portalRoomCell.x, anchor.portalRoomCell.y)
    : null;
  return (
    (regionFloorKeys.has(attachedCellKey) ||
      (anchor.regionId === region.id && expandedPortalKey === attachedCellKey)) &&
    getCellManhattanDistance(anchor.cell, anchor.outsideCell) === 1
  );
}

function isCorridorEndpointInFloor(corridor, anchor) {
  if (!anchor?.outsideCell) return false;
  return getCorridorFloorCellKeys(corridor).has(
    cellKey(anchor.outsideCell.x, anchor.outsideCell.y),
  );
}

function isCorridorEndpointPathConnected(corridor) {
  if (corridor?.isRoomLink || corridor?.roomTraversal) return true;
  if (!corridor?.fromAnchor?.outsideCell || !corridor?.toAnchor?.outsideCell)
    return false;
  const corridorFloorKeys = getCorridorFloorCellKeys(corridor);
  if (corridorFloorKeys.size === 0) return false;
  if (
    !corridorFloorKeys.has(
      cellKey(corridor.fromAnchor.outsideCell.x, corridor.fromAnchor.outsideCell.y),
    ) ||
    !corridorFloorKeys.has(
      cellKey(corridor.toAnchor.outsideCell.x, corridor.toAnchor.outsideCell.y),
    )
  )
    return false;
  return (
    findPathInCellSet(
      corridorFloorKeys,
      corridor.fromAnchor.outsideCell,
      corridor.toAnchor.outsideCell,
    ).length >= 2
  );
}

function getRoomTraversalConnectionIds(corridor, roomIds) {
  const traversalIds = Array.isArray(corridor?.traversalRegionIds)
    ? corridor.traversalRegionIds.filter((regionId) => roomIds.has(regionId))
    : [];
  if (traversalIds.length >= 2) return traversalIds;
  return [corridor?.from, corridor?.to].filter((regionId) => roomIds.has(regionId));
}

function isVirtualCorridorAnchor(anchor) {
  return Boolean(
    anchor?.virtualHub ||
      anchor?.virtualJunction ||
      String(anchor?.regionId || "").startsWith("auto-hub-")
  );
}

function getDoorConnectedRegionChains(corridor, roomIds) {
  return (Array.isArray(corridor?.doors) ? corridor.doors : [])
    .map((door) =>
      Array.isArray(door?.connectedRegionIds)
        ? door.connectedRegionIds.filter((regionId) => roomIds.has(regionId))
        : [],
    )
    .filter((ids) => ids.length >= 2);
}

function hasDirectSharedRoomBoundaryConnection(fromRegion, toRegion, fromAnchor, toAnchor) {
  if (!fromRegion || !toRegion || !fromAnchor || !toAnchor) return false;
  if (
    !isAnchorAttachedToRegion(fromRegion, fromAnchor) ||
    !isAnchorAttachedToRegion(toRegion, toAnchor)
  )
    return false;
  const fromRoomCells = getRegionFloorCellKeys(fromRegion);
  const toRoomCells = getRegionFloorCellKeys(toRegion);
  return (
    toRoomCells.has(cellKey(fromAnchor.outsideCell.x, fromAnchor.outsideCell.y)) &&
    fromRoomCells.has(cellKey(toAnchor.outsideCell.x, toAnchor.outsideCell.y))
  );
}

function collectRoomConnectivityGraph(regions, corridors) {
  const roomIds = new Set(regions.map((region) => region.id).filter(Boolean));
  const regionById = new Map(regions.map((region) => [region.id, region]));
  const adjacency = new Map(
    Array.from(roomIds).map((roomId) => [roomId, new Set()]),
  );
  const invalidCorridorConnections = [];

  const connectRooms = (fromId, toId) => {
    if (!roomIds.has(fromId) || !roomIds.has(toId) || fromId === toId) return;
    adjacency.get(fromId).add(toId);
    adjacency.get(toId).add(fromId);
  };

  corridors.forEach((corridor) => {
    if (!corridor?.id) return;
    const doorConnectionChains = getDoorConnectedRegionChains(corridor, roomIds);
    if (corridor.isRoomLink || corridor.roomTraversal || doorConnectionChains.length > 0) {
      const traversalChains = doorConnectionChains.length > 0
        ? doorConnectionChains
        : [getRoomTraversalConnectionIds(corridor, roomIds)];
      let connectedAnyChain = false;
      traversalChains.forEach((ids) => {
        if (ids.length < 2) return;
        connectedAnyChain = true;
        for (let index = 0; index < ids.length - 1; index += 1) {
          connectRooms(ids[index], ids[index + 1]);
        }
      });
      if (!connectedAnyChain) {
        invalidCorridorConnections.push({
          id: corridor.id,
          reason: "room-link-without-region-chain",
          endpoints: traversalChains.flat(),
        });
      }
      return;
    }

    const fromRegion = regionById.get(corridor.from || corridor.fromAnchor?.regionId);
    const toRegion = regionById.get(corridor.to || corridor.toAnchor?.regionId);
    const fromAttached = isAnchorAttachedToRegion(fromRegion, corridor.fromAnchor);
    const toAttached = isAnchorAttachedToRegion(toRegion, corridor.toAnchor);
    const fromEndpointInFloor = isCorridorEndpointInFloor(corridor, corridor.fromAnchor);
    const toEndpointInFloor = isCorridorEndpointInFloor(corridor, corridor.toAnchor);
    const endpointPathConnected = isCorridorEndpointPathConnected(corridor);
    const hasVirtualEndpoint =
      isVirtualCorridorAnchor(corridor.fromAnchor) ||
      isVirtualCorridorAnchor(corridor.toAnchor);

    if (corridor.autoHubStem && fromAttached && endpointPathConnected) return;

    if (
      fromRegion &&
      toRegion &&
      hasDirectSharedRoomBoundaryConnection(
        fromRegion,
        toRegion,
        corridor.fromAnchor,
        corridor.toAnchor,
      )
    ) {
      connectRooms(fromRegion.id, toRegion.id);
      return;
    }

    if (
      corridor.autoHub &&
      fromRegion &&
      toRegion &&
      hasVirtualEndpoint &&
      (fromAttached || toAttached) &&
      endpointPathConnected
    ) {
      connectRooms(fromRegion.id, toRegion.id);
      return;
    }

    if (
      fromRegion &&
      toRegion &&
      fromAttached &&
      toAttached &&
      fromEndpointInFloor &&
      toEndpointInFloor &&
      endpointPathConnected
    ) {
      connectRooms(fromRegion.id, toRegion.id);
      return;
    }

    invalidCorridorConnections.push({
      id: corridor.id,
      from: corridor.from || corridor.fromAnchor?.regionId,
      to: corridor.to || corridor.toAnchor?.regionId,
      fromAttached,
      toAttached,
      fromEndpointInFloor,
      toEndpointInFloor,
      endpointPathConnected,
      reason: "corridor-endpoints-not-physically-linked",
    });
  });

  const startRoomId = Array.from(roomIds)[0] || null;
  const reachableRoomIds = new Set();
  if (startRoomId) {
    const queue = [startRoomId];
    reachableRoomIds.add(startRoomId);
    while (queue.length > 0) {
      const current = queue.shift();
      (adjacency.get(current) || []).forEach((next) => {
        if (reachableRoomIds.has(next)) return;
        reachableRoomIds.add(next);
        queue.push(next);
      });
    }
  }

  return {
    adjacency,
    reachableRoomIds,
    disconnectedRoomIds: Array.from(roomIds)
      .filter((roomId) => !reachableRoomIds.has(roomId))
      .sort(),
    invalidCorridorConnections,
  };
}

export function getPhysicalFloorConnectivityReport(regions = [], corridors = []) {
  const safeRegions = Array.isArray(regions) ? regions.filter(Boolean) : [];
  const safeCorridors = Array.isArray(corridors) ? corridors.filter(Boolean) : [];
  const roomIds = new Set(
    safeRegions.map((region) => region.id).filter(Boolean),
  );
  const emptyRoomIds = safeRegions
    .filter(
      (region) =>
        region?.id &&
        (!Array.isArray(region.floorCells) || region.floorCells.length === 0),
    )
    .map((region) => region.id)
    .sort();
  const components = collectPhysicalFloorComponents(safeRegions, safeCorridors);
  const roomComponents = components.filter((component) => component.roomIds.size > 0);
  const corridorOnlyComponents = components.filter(
    (component) => component.roomIds.size === 0 && component.corridorIds.size > 0,
  );
  const mainComponent = getLargestRoomPhysicalComponent(components);
  const mainRoomIds = mainComponent?.roomIds || new Set();
  const floorDisconnectedRoomIds = Array.from(roomIds)
    .filter((roomId) => !mainRoomIds.has(roomId))
    .sort();
  const roomGraph = collectRoomConnectivityGraph(safeRegions, safeCorridors);
  const floorConnected =
    emptyRoomIds.length === 0 &&
    corridorOnlyComponents.length === 0 &&
    (roomIds.size <= 1 || floorDisconnectedRoomIds.length === 0);
  const semanticDisconnectedRoomIds = Array.from(
    new Set([...floorDisconnectedRoomIds, ...roomGraph.disconnectedRoomIds]),
  ).sort();
  const semanticConnected =
    floorConnected &&
    roomGraph.invalidCorridorConnections.length === 0 &&
    semanticDisconnectedRoomIds.length === 0;

  return {
    connected: floorConnected,
    semanticConnected,
    componentCount: components.length,
    roomComponentCount: roomComponents.length,
    corridorOnlyComponentCount: corridorOnlyComponents.length,
    invalidCorridorConnectionCount: roomGraph.invalidCorridorConnections.length,
    roomCount: roomIds.size,
    mainRoomCount: mainRoomIds.size,
    disconnectedRoomIds: floorDisconnectedRoomIds,
    floorDisconnectedRoomIds,
    graphDisconnectedRoomIds: roomGraph.disconnectedRoomIds,
    semanticDisconnectedRoomIds,
    emptyRoomIds,
    invalidCorridorConnections: roomGraph.invalidCorridorConnections,
    components: components.map(summarizePhysicalFloorComponent),
    mainComponent: mainComponent
      ? summarizePhysicalFloorComponent(mainComponent, components.indexOf(mainComponent))
      : null,
    corridorOnlyComponents: corridorOnlyComponents.map((component) =>
      summarizePhysicalFloorComponent(component, components.indexOf(component)),
    ),
  };
}

function getLargestRoomPhysicalComponent(components) {
  return [...components]
    .filter((component) => component.roomIds.size > 0)
    .sort((a, b) => {
      if (b.roomIds.size !== a.roomIds.size) return b.roomIds.size - a.roomIds.size;
      return b.cellKeys.size - a.cellKeys.size;
    })[0] || null;
}

function rebuildCorridorWithFilteredCells(corridor, allowedCellKeys, gridSize) {
  if (corridor?.isRoomLink || !Array.isArray(corridor?.floorCells)) return corridor;
  const floorCells = corridor.floorCells.filter((cell) =>
    allowedCellKeys.has(cellKey(cell.x, cell.y)),
  );
  if (floorCells.length === 0) return null;
  if (floorCells.length === corridor.floorCells.length) return corridor;
  const floorKeys = new Set(floorCells.map((cell) => cellKey(cell.x, cell.y)));
  const pathCells = (Array.isArray(corridor.pathCells) && corridor.pathCells.length > 0
    ? corridor.pathCells
    : corridor.floorCells
  ).filter((cell) => floorKeys.has(cellKey(cell.x, cell.y)));
  const routedCells = pathCells.length > 0 ? pathCells : floorCells;
  const centerline = cellsToCenterline(routedCells, gridSize);
  return {
    ...corridor,
    floorCells: floorCells.map(cloneCell).filter(Boolean),
    pathCells: routedCells.map(cloneCell).filter(Boolean),
    centerline,
    waypoints: dedupePoints(extractWaypoints(centerline)),
  };
}

function removeCorridorOnlyPhysicalComponents(corridors, components, gridSize) {
  const orphanCellKeys = new Set();
  components.forEach((component) => {
    if (component.roomIds.size > 0) return;
    component.cellKeys.forEach((key) => orphanCellKeys.add(key));
  });
  if (orphanCellKeys.size === 0) return corridors;
  const allowedCellKeys = new Set();
  (corridors || []).forEach((corridor) => {
    (corridor.floorCells || []).forEach((cell) => {
      const key = cellKey(cell.x, cell.y);
      if (!orphanCellKeys.has(key)) allowedCellKeys.add(key);
    });
  });
  return (corridors || [])
    .map((corridor) => rebuildCorridorWithFilteredCells(corridor, allowedCellKeys, gridSize))
    .filter(Boolean);
}

function scorePhysicalComponentAnchorPair(fromAnchor, toAnchor) {
  if (!fromAnchor?.outsideCell || !toAnchor?.outsideCell)
    return Number.POSITIVE_INFINITY;
  return getCellManhattanDistance(fromAnchor.outsideCell, toAnchor.outsideCell);
}

export function routeCorridors(config, regions, graph) {
  const routingProfile = getPlacementProfile(config);
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const regionById = new Map(regions.map((region) => [region.id, region]));
  const allRoomCells = getRoomCellSet(regions);
  const roomOwnership = getRoomCellOwnershipMap(regions);
  const getCircleDoorReservedCells = (regionId) => {
    const reserved = new Set(allRoomCells);
    roomOwnership.forEach((owners, key) => {
      if (
        owners.length > 0 &&
        owners.every((ownerId) => ownerId === regionId)
      ) {
        reserved.delete(key);
      }
    });
    return reserved;
  };
  const dynamicRoomCells = new Set(allRoomCells);
  const existingCorridors = new Set();
  const usedDoorOutsideCells = new Set();
  const usedDoorOutsideCellsByRegion = new Map();
  const doorAnchorsByRegion = new Map();
  const markDoorOutsideCellUsed = (regionId, anchor) => {
    const key = getAnchorOutsideKey(anchor);
    if (!regionId || !key) return;
    usedDoorOutsideCells.add(key);
    if (!usedDoorOutsideCellsByRegion.has(regionId))
      usedDoorOutsideCellsByRegion.set(regionId, new Set());
    usedDoorOutsideCellsByRegion.get(regionId).add(key);
  };
  const registerReusableDoorAnchor = (region, anchor, door, corridorId, endpoint) => {
    if (!region?.id || !anchor?.outsideCell || !door) return;
    markDoorOutsideCellUsed(region.id, anchor);
    if (door.secret || door.locked || door.doorType === "secret") return;
    if (!doorAnchorsByRegion.has(region.id))
      doorAnchorsByRegion.set(region.id, []);
    const key = getAnchorOutsideKey(anchor);
    const entries = doorAnchorsByRegion.get(region.id);
    if (entries.some((entry) => getAnchorOutsideKey(entry.anchor) === key)) return;
    entries.push({
      anchor: cloneReusableAnchor(anchor),
      corridorId,
      endpoint,
      secret: Boolean(door.secret),
      locked: Boolean(door.locked),
    });
  };
  const createDoorForbiddenOutsideCells = (regionId, includeSpacing = false) => {
    const forbidden = new Set([...dynamicRoomCells, ...usedDoorOutsideCells]);
    if (includeSpacing) {
      getDoorSpacingCellsForRegion(
        usedDoorOutsideCellsByRegion,
        regionId,
        getAutoCorridorDoorSpacingRadius(config),
      ).forEach((cell) => forbidden.add(cellKey(cell.x, cell.y)));
    }
    return forbidden;
  };
  const selectDoorAnchorForEndpoint = (
    region,
    targetRegion,
    rng,
    edge,
    endpoint,
    manualAnchor = null,
  ) => {
    if (manualAnchor) return manualAnchor;
    const exactForbidden = createDoorForbiddenOutsideCells(region?.id, false);
    const idealAnchor = chooseDoorAnchorForRegion(
      region,
      targetRegion,
      rng,
      exactForbidden,
      routingProfile,
    );
    const reusableAnchor = findReusableDoorAnchor(
      doorAnchorsByRegion,
      config,
      region,
      targetRegion,
      idealAnchor,
      edge,
      endpoint,
      routingProfile,
    );
    if (reusableAnchor) return reusableAnchor;
    const spacedForbidden = createDoorForbiddenOutsideCells(region?.id, true);
    return (
      chooseDoorAnchorForRegion(
        region,
        targetRegion,
        rng,
        spacedForbidden,
        routingProfile,
      ) || idealAnchor
    );
  };
  const canUnblockForEndpointRegions = (cell, endpointRegionIds) =>
    isRoomCellOwnedOnlyByEndpointRegions(
      cellKey(cell.x, cell.y),
      endpointRegionIds,
      roomOwnership,
    );
  const unblockApproachCells = (blocked, cells, endpointRegionIds) => {
    cells.forEach((cell) => {
      if (canUnblockForEndpointRegions(cell, endpointRegionIds))
        blocked.delete(cellKey(cell.x, cell.y));
    });
  };
  const unblockExistingCorridorCells = (blocked) => {
    existingCorridors.forEach((key) => {
      if (!roomOwnership.has(key)) blocked.delete(key);
    });
  };

  const buildRoutingOptions = (
    allowedApproachCells,
    endpointRegionIds,
    extraBlockedDeletes = [],
  ) => {
    const blocked = new Set(dynamicRoomCells);
    unblockApproachCells(blocked, allowedApproachCells, endpointRegionIds);
    unblockExistingCorridorCells(blocked);
    extraBlockedDeletes.forEach((cell) => {
      if (cell) blocked.delete(cellKey(cell.x, cell.y));
    });
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

  const routeCellsBetweenPoints = (
    points,
    allowedApproachCells,
    endpointRegionIds,
    fallbackStart,
    fallbackGoal,
    extraBlockedDeletes = [],
  ) => {
    const routingOptions = buildRoutingOptions(
      allowedApproachCells,
      endpointRegionIds,
      extraBlockedDeletes,
    );
    let path = routePathThroughCells(points, routingOptions);
    if (!isUsableCorridorPath(path, fallbackStart, fallbackGoal)) {
      path = routeDirectFallback(fallbackStart, fallbackGoal, routingOptions);
    }
    return isUsableCorridorPath(path, fallbackStart, fallbackGoal) ? path : [];
  };


  const syncExistingCorridorCells = (corridors) => {
    existingCorridors.clear();
    (corridors || []).forEach((corridor) => {
      if (corridor?.isRoomLink) return;
      (corridor.floorCells || []).forEach((cell) =>
        existingCorridors.add(cellKey(cell.x, cell.y)),
      );
    });
  };

  const createPhysicalRepairCorridor = (
    fromRegion,
    toRegion,
    repairIndex,
  ) => {
    if (!fromRegion || !toRegion || fromRegion.id === toRegion.id) return null;
    const edge = {
      id: `physical-repair-${repairIndex}-${fromRegion.id}-${toRegion.id}`,
      from: fromRegion.id,
      to: toRegion.id,
      reason: "physical-connectivity-repair",
      recoveredGraphEdge: true,
    };
    const repairRng = createSeededRng(
      hashStringToSeed(config.seed, edge.id, "physical-repair"),
    );
    const fromRawAnchor = chooseDoorAnchorForRegion(
      fromRegion,
      toRegion,
      repairRng,
      createDoorForbiddenOutsideCells(fromRegion.id, false),
      routingProfile,
    );
    const toRawAnchor = chooseDoorAnchorForRegion(
      toRegion,
      fromRegion,
      repairRng,
      createDoorForbiddenOutsideCells(toRegion.id, false),
      routingProfile,
    );
    if (!fromRawAnchor || !toRawAnchor) return null;

    const fromAnchor = createCircleDoorRoomExtensionAnchor(
      fromRegion,
      fromRawAnchor,
      gridW,
      gridH,
      getCircleDoorReservedCells(fromRegion.id),
      config.gridSize,
    );
    const toAnchor = createCircleDoorRoomExtensionAnchor(
      toRegion,
      toRawAnchor,
      gridW,
      gridH,
      getCircleDoorReservedCells(toRegion.id),
      config.gridSize,
    );
    addCircleDoorRoomExtensionCellToSet(fromAnchor, dynamicRoomCells);
    addCircleDoorRoomExtensionCellToSet(toAnchor, dynamicRoomCells);

    const allowedApproachCells = [
      ...getAnchorApproachCells(fromAnchor),
      ...getAnchorApproachCells(toAnchor),
    ];
    const routePoints = [fromAnchor.outsideCell, toAnchor.outsideCell];
    const path = routeCellsBetweenPoints(
      routePoints,
      allowedApproachCells,
      new Set([fromRegion.id, toRegion.id]),
      fromAnchor.outsideCell,
      toAnchor.outsideCell,
    );
    if (!isUsableCorridorPath(path, fromAnchor.outsideCell, toAnchor.outsideCell)) {
      return null;
    }

    const pathBridge = applyAnchorBridgeCells(
      path.map((cell) => ({ x: cell.x, y: cell.y })),
      fromAnchor,
      toAnchor,
      dynamicRoomCells,
    );
    const pathCells = pathBridge.pathCells;
    const floorCells = pathCells.map((cell) => ({ x: cell.x, y: cell.y }));
    floorCells.forEach((cell) => existingCorridors.add(cellKey(cell.x, cell.y)));
    const centerline = cellsToCenterline(pathCells, config.gridSize);
    const corridorSurfaceKind = getCorridorSurfaceProfile(
      config,
      fromRegion,
      toRegion,
      edge,
    );
    const fromDoor = markMineBreachOpening(
      decorateDoorSegment(
        createDoorFromAnchor(fromAnchor, config.gridSize, false),
        config,
        edge,
        "from",
      ),
      config,
      corridorSurfaceKind,
      fromRegion,
    );
    const toDoor = markMineBreachOpening(
      decorateDoorSegment(
        createDoorFromAnchor(toAnchor, config.gridSize, false),
        config,
        edge,
        "to",
      ),
      config,
      corridorSurfaceKind,
      toRegion,
    );
    registerReusableDoorAnchor(fromRegion, fromAnchor, fromDoor, edge.id, "from");
    registerReusableDoorAnchor(toRegion, toAnchor, toDoor, edge.id, "to");

    return {
      ...edge,
      physicalConnectivityRepair: true,
      surfaceKind: corridorSurfaceKind,
      corridorStyle: "structured-corridor",
      fromAnchor,
      toAnchor,
      fromAnchorBridgeCell: pathBridge.fromAnchorBridgeCell,
      toAnchorBridgeCell: pathBridge.toAnchorBridgeCell,
      floorCells,
      pathCells,
      centerline,
      manualWaypoints: [],
      waypoints: dedupePoints(extractWaypoints(centerline)),
      doors: dedupeDoorSegments([fromDoor, toDoor]),
    };
  };

  const findPhysicalRepairCandidate = (
    sourceComponent,
    targetComponent,
    repairIndex,
  ) => {
    const sourceRegions = [...sourceComponent.roomIds]
      .map((regionId) => regionById.get(regionId))
      .filter(Boolean);
    const targetRegions = [...targetComponent.roomIds]
      .map((regionId) => regionById.get(regionId))
      .filter(Boolean);
    let best = null;
    sourceRegions.forEach((fromRegion) => {
      targetRegions.forEach((toRegion) => {
        const corridor = createPhysicalRepairCorridor(
          fromRegion,
          toRegion,
          repairIndex,
        );
        if (!corridor) return;
        const score =
          corridor.floorCells.length * 1.5 +
          scorePhysicalComponentAnchorPair(
            corridor.fromAnchor,
            corridor.toAnchor,
          );
        if (!best || score < best.score) best = { corridor, score };
      });
    });
    return best?.corridor || null;
  };

  const getComponentRoomBoundaryCells = (component) => {
    const output = [];
    if (!component?.roomIds || component.roomIds.size === 0) return output;
    component.roomIds.forEach((regionId) => {
      const region = regionById.get(regionId);
      if (!region || !Array.isArray(region.floorCells)) return;
      const regionCellKeys = new Set(
        region.floorCells.map((cell) => cellKey(cell.x, cell.y)),
      );
      region.floorCells.forEach((cell) => {
        const key = cellKey(cell.x, cell.y);
        if (!component.cellKeys.has(key)) return;
        const isBoundary = getCellNeighbors(cell).some(
          (neighbor) => !regionCellKeys.has(cellKey(neighbor.x, neighbor.y)),
        );
        if (!isBoundary) return;
        output.push({ region, cell: cloneCell(cell) });
      });
    });
    return output;
  };

  const getBoundedBridgePath = (start, goal, allowBlockedRoomKeys = new Set()) => {
    if (!start || !goal) return [];
    const blocked = new Set(allRoomCells);
    blocked.delete(cellKey(start.x, start.y));
    blocked.delete(cellKey(goal.x, goal.y));
    allowBlockedRoomKeys.forEach((key) => blocked.delete(key));
    const path = findPath(start, goal, {
      gridW,
      gridH,
      blocked,
      softBlocked: new Set(),
      existingCorridors,
      adjacentToExistingCorridors: new Set(),
      routingProfile: {
        ...routingProfile,
        adjacentCorridorPenalty: 0,
        corridorOverlapPenalty: 0,
        corridorReuseBonus: Math.max(
          0.72,
          Number(routingProfile.corridorReuseBonus ?? 0),
        ),
        turnCost: Math.min(1.2, Number(routingProfile.turnCost ?? 1.2)),
      },
    });
    if (isUsableCorridorPath(path, start, goal)) return path;
    return linePathBetweenCells(start, goal).filter(
      (cell) => cell.x > 0 && cell.y > 0 && cell.x < gridW - 1 && cell.y < gridH - 1,
    );
  };

  const createForcedPhysicalAnchor = (region, roomCell, outsideCell) => {
    if (!region || !roomCell || !outsideCell) return null;
    const normal = {
      x: Math.sign(outsideCell.x - roomCell.x),
      y: Math.sign(outsideCell.y - roomCell.y),
    };
    if (Math.abs(normal.x) + Math.abs(normal.y) !== 1) return null;
    return {
      side: getDominantSideFromNormal(normal, "east"),
      cell: cloneCell(roomCell),
      outsideCell: cloneCell(outsideCell),
      normal,
      regionId: region.id,
      regionShape: region.shape,
      forcedPhysicalRepairAnchor: true,
    };
  };

  const createForcedPhysicalRepairCorridor = (
    sourceComponent,
    targetComponent,
    repairIndex,
  ) => {
    const sourceAnchors = getComponentRoomBoundaryCells(sourceComponent);
    const targetAnchors = getComponentRoomBoundaryCells(targetComponent);
    if (sourceAnchors.length === 0 || targetAnchors.length === 0) return null;

    const pairs = [];
    sourceAnchors.forEach((source) => {
      targetAnchors.forEach((target) => {
        pairs.push({
          source,
          target,
          score: getCellManhattanDistance(source.cell, target.cell),
        });
      });
    });
    pairs.sort((a, b) => a.score - b.score);

    for (const pair of pairs.slice(0, 96)) {
      const path = getBoundedBridgePath(pair.source.cell, pair.target.cell);
      if (!Array.isArray(path) || path.length < 3) continue;
      const fromOutsideCell = path[1];
      const toOutsideCell = path[path.length - 2];
      const fromAnchor = createForcedPhysicalAnchor(
        pair.source.region,
        pair.source.cell,
        fromOutsideCell,
      );
      const toAnchor = createForcedPhysicalAnchor(
        pair.target.region,
        pair.target.cell,
        toOutsideCell,
      );
      if (!fromAnchor || !toAnchor) continue;
      const corridorPath = path.slice(1, -1).map(cloneCell).filter(Boolean);
      if (corridorPath.length === 0) continue;
      const edge = {
        id: `physical-force-repair-${repairIndex}-${pair.source.region.id}-${pair.target.region.id}`,
        from: pair.source.region.id,
        to: pair.target.region.id,
        reason: "physical-connectivity-force-repair",
        recoveredGraphEdge: true,
      };
      const centerline = cellsToCenterline(corridorPath, config.gridSize);
      const corridorSurfaceKind = getCorridorSurfaceProfile(
        config,
        pair.source.region,
        pair.target.region,
        edge,
      );
      const fromDoor = markMineBreachOpening(
        decorateDoorSegment(
          createDoorFromAnchor(fromAnchor, config.gridSize, false),
          config,
          edge,
          "from",
        ),
        config,
        corridorSurfaceKind,
        pair.source.region,
      );
      const toDoor = markMineBreachOpening(
        decorateDoorSegment(
          createDoorFromAnchor(toAnchor, config.gridSize, false),
          config,
          edge,
          "to",
        ),
        config,
        corridorSurfaceKind,
        pair.target.region,
      );
      corridorPath.forEach((cell) => existingCorridors.add(cellKey(cell.x, cell.y)));
      registerReusableDoorAnchor(
        pair.source.region,
        fromAnchor,
        fromDoor,
        edge.id,
        "from",
      );
      registerReusableDoorAnchor(
        pair.target.region,
        toAnchor,
        toDoor,
        edge.id,
        "to",
      );
      return {
        ...edge,
        physicalConnectivityRepair: true,
        forcedPhysicalConnectivityRepair: true,
        surfaceKind: corridorSurfaceKind,
        corridorStyle: "structured-corridor",
        fromAnchor,
        toAnchor,
        floorCells: corridorPath.map(cloneCell).filter(Boolean),
        pathCells: corridorPath.map(cloneCell).filter(Boolean),
        centerline,
        manualWaypoints: [],
        waypoints: dedupePoints(extractWaypoints(centerline)),
        doors: dedupeDoorSegments([fromDoor, toDoor]),
      };
    }

    return null;
  };

  const findForcedPhysicalRepairCandidate = (
    sourceComponent,
    targetComponent,
    repairIndex,
  ) => createForcedPhysicalRepairCorridor(
    sourceComponent,
    targetComponent,
    repairIndex,
  );

  const forcePhysicalConnectivityClosure = (inputCorridors, startRepairIndex = 0) => {
    let closedCorridors = Array.isArray(inputCorridors)
      ? inputCorridors.filter(Boolean)
      : [];
    let repairIndex = startRepairIndex;
    let components = collectPhysicalFloorComponents(regions, closedCorridors);

    while (repairIndex < startRepairIndex + Math.max(2, regions.length * 2 + 4)) {
      const mainComponent = getLargestRoomPhysicalComponent(components);
      if (!mainComponent) return closedCorridors;
      const disconnectedComponents = components.filter(
        (component) =>
          component.roomIds.size > 0 && component !== mainComponent,
      );
      if (disconnectedComponents.length === 0) break;
      syncExistingCorridorCells(closedCorridors);
      let bestRepair = null;
      disconnectedComponents.forEach((component) => {
        const candidate = findForcedPhysicalRepairCandidate(
          component,
          mainComponent,
          repairIndex,
        );
        if (!candidate) return;
        const score = candidate.floorCells.length;
        if (!bestRepair || score < bestRepair.score) {
          bestRepair = { corridor: candidate, score };
        }
      });
      if (!bestRepair?.corridor) break;
      const previousDisconnectedCount = disconnectedComponents.length;
      closedCorridors = [...closedCorridors, bestRepair.corridor];
      components = collectPhysicalFloorComponents(regions, closedCorridors);
      const nextMainComponent = getLargestRoomPhysicalComponent(components);
      const nextDisconnectedCount = nextMainComponent
        ? components.filter(
            (component) =>
              component.roomIds.size > 0 && component !== nextMainComponent,
          ).length
        : previousDisconnectedCount;
      repairIndex += 1;
      if (nextDisconnectedCount >= previousDisconnectedCount) break;
    }
    return closedCorridors;
  };

  const repairPhysicalCorridorNetwork = (inputCorridors) => {
    let repairedCorridors = Array.isArray(inputCorridors)
      ? inputCorridors.filter(Boolean)
      : [];
    let components = collectPhysicalFloorComponents(regions, repairedCorridors);
    repairedCorridors = removeCorridorOnlyPhysicalComponents(
      repairedCorridors,
      components,
      config.gridSize,
    );
    components = collectPhysicalFloorComponents(regions, repairedCorridors);

    let repairIndex = 0;
    while (repairIndex < Math.max(1, regions.length + 2)) {
      const mainComponent = getLargestRoomPhysicalComponent(components);
      if (!mainComponent) return repairedCorridors;
      const disconnectedComponents = components.filter(
        (component) =>
          component.roomIds.size > 0 && component !== mainComponent,
      );
      if (disconnectedComponents.length === 0) break;
      syncExistingCorridorCells(repairedCorridors);
      let bestRepair = null;
      disconnectedComponents.forEach((component) => {
        const candidate = findPhysicalRepairCandidate(
          component,
          mainComponent,
          repairIndex,
        );
        if (!candidate) return;
        const score = candidate.floorCells.length;
        if (!bestRepair || score < bestRepair.score) {
          bestRepair = { corridor: candidate, score };
        }
      });
      if (!bestRepair?.corridor) break;
      repairedCorridors = [...repairedCorridors, bestRepair.corridor];
      components = collectPhysicalFloorComponents(regions, repairedCorridors);
      repairIndex += 1;
    }

    const cleanedCorridors = removeCorridorOnlyPhysicalComponents(
      repairedCorridors,
      collectPhysicalFloorComponents(regions, repairedCorridors),
      config.gridSize,
    );
    const closedCorridors = forcePhysicalConnectivityClosure(
      cleanedCorridors,
      repairIndex,
    );
    return removeCorridorOnlyPhysicalComponents(
      closedCorridors,
      collectPhysicalFloorComponents(regions, closedCorridors),
      config.gridSize,
    );
  };

  const routeAutoHubGroup = (group) => {
    const source = group.region;
    if (!source || !Array.isArray(group.entries) || group.entries.length === 0)
      return null;

    const hubRng = createSeededRng(
      hashStringToSeed(config.seed, group.id, "auto-corridor-hub"),
    );
    const sourceRawAnchor = chooseHubAnchorForRegionSide(
      source,
      group.side,
      getTargetCentroid(group.entries),
      hubRng,
      createDoorForbiddenOutsideCells(source.id, true),
      routingProfile,
    );
    if (!sourceRawAnchor) return null;

    const sourceAnchor = createCircleDoorRoomExtensionAnchor(
      source,
      sourceRawAnchor,
      gridW,
      gridH,
      getCircleDoorReservedCells(source.id),
      config.gridSize,
    );
    const hubCell = findAutoHubCell(
      sourceAnchor,
      gridW,
      gridH,
      dynamicRoomCells,
      existingCorridors,
      usedDoorOutsideCells,
    );
    if (!hubCell) return null;

    const hubAnchor = createVirtualHubAnchor(
      hubCell,
      group.side,
      config.gridSize,
      group.id,
    );
    const sourceApproachCells = [
      ...getAnchorApproachCells(sourceAnchor),
      hubCell,
    ];
    const sourcePath = routeCellsBetweenPoints(
      [sourceAnchor.outsideCell, hubCell],
      sourceApproachCells,
      new Set([source.id]),
      sourceAnchor.outsideCell,
      hubCell,
      [sourceAnchor.outsideCell, hubCell],
    );
    if (!isUsableCorridorPath(sourcePath, sourceAnchor.outsideCell, hubCell))
      return null;

    const sourcePathBridge = applyAnchorBridgeCells(
      sourcePath.map((cell) => ({ x: cell.x, y: cell.y })),
      sourceAnchor,
      hubAnchor,
      dynamicRoomCells,
    );
    const sourcePathCells = sourcePathBridge.pathCells;
    const hubStemId = `${group.id}-stem`;
    const hubStemEdge = {
      id: hubStemId,
      from: source.id,
      to: group.id,
      kind: "junction-stem",
      reason: "auto-corridor-hub-stem",
    };
    const stemSurfaceKind = getCorridorSurfaceProfile(
      config,
      source,
      group.entries[0]?.target || source,
      hubStemEdge,
    );
    const stemCenterline = cellsToCenterline(sourcePathCells, config.gridSize);
    const sourceDoor = markMineBreachOpening(
      decorateDoorSegment(
        createDoorFromAnchor(sourceAnchor, config.gridSize, false),
        config,
        hubStemEdge,
        "from",
      ),
      config,
      stemSurfaceKind,
      source,
    );
    const plannedCorridors = [
      {
        ...hubStemEdge,
        autoHub: true,
        autoHubStem: true,
        surfaceKind: stemSurfaceKind,
        corridorStyle: "structured-corridor",
        fromAnchor: sourceAnchor,
        toAnchor: hubAnchor,
        fromAnchorBridgeCell: sourcePathBridge.fromAnchorBridgeCell,
        toAnchorBridgeCell: sourcePathBridge.toAnchorBridgeCell,
        floorCells: sourcePathCells,
        pathCells: sourcePathCells,
        centerline: stemCenterline,
        manualWaypoints: [],
        waypoints: dedupePoints(extractWaypoints(stemCenterline)),
        doors: [sourceDoor],
      },
    ];

    const plannedCells = new Set(
      sourcePathCells.map((cell) => cellKey(cell.x, cell.y)),
    );
    const plannedDoorCells = new Set([
      cellKey(sourceAnchor.outsideCell.x, sourceAnchor.outsideCell.y),
    ]);
    const plannedExtensionAnchors = [];
    const plannedDoorRegistrations = [
      { region: source, anchor: sourceAnchor, door: sourceDoor, corridorId: hubStemId, endpoint: "from" },
    ];

    for (const entry of group.entries) {
      const edge = entry.edge;
      const target = entry.target;
      if (!edge || !target) return null;
      const sourceEndpoint = getEdgeEndpointForRegion(edge, source.id);
      const targetEndpoint = sourceEndpoint === "from" ? "to" : "from";
      const edgeRng = createSeededRng(
        hashStringToSeed(config.seed, edge.id, "corridor-hub-branch"),
      );
      const targetRawAnchor =
        findReusableDoorAnchor(
          doorAnchorsByRegion,
          config,
          target,
          source,
          getClosestBoundaryAnchorToPoint(target, hubAnchor.point, config.gridSize),
          edge,
          targetEndpoint,
          routingProfile,
        ) ||
        getClosestBoundaryAnchorToPoint(
          target,
          hubAnchor.point,
          config.gridSize,
        ) ||
        chooseDoorAnchorForRegion(
          target,
          source,
          edgeRng,
          createDoorForbiddenOutsideCells(target.id, true),
          routingProfile,
        );
      if (!targetRawAnchor) return null;
      const targetAnchor = createCircleDoorRoomExtensionAnchor(
        target,
        targetRawAnchor,
        gridW,
        gridH,
        getCircleDoorReservedCells(target.id),
        config.gridSize,
      );
      const startAnchor = sourceEndpoint === "from" ? hubAnchor : targetAnchor;
      const goalAnchor = sourceEndpoint === "from" ? targetAnchor : hubAnchor;
      const allowedApproachCells = [
        hubCell,
        ...getAnchorApproachCells(targetAnchor),
      ];
      const routePoints = [startAnchor.outsideCell, goalAnchor.outsideCell];
      const branchPath = routeCellsBetweenPoints(
        routePoints,
        allowedApproachCells,
        new Set([target.id]),
        startAnchor.outsideCell,
        goalAnchor.outsideCell,
        [hubCell, targetAnchor.outsideCell],
      );
      if (
        !isUsableCorridorPath(
          branchPath,
          startAnchor.outsideCell,
          goalAnchor.outsideCell,
        )
      )
        return null;

      const branchPathBridge = applyAnchorBridgeCells(
        branchPath.map((cell) => ({ x: cell.x, y: cell.y })),
        startAnchor,
        goalAnchor,
        dynamicRoomCells,
      );
      const organicTunnel = shouldUseOrganicTunnel(config, source, target);
      const pathCells = branchPathBridge.pathCells;
      const floorCells = organicTunnel
        ? buildOrganicTunnelFloorCells(
            pathCells,
            config,
            edgeRng,
            dynamicRoomCells,
            edge.id,
          )
        : pathCells;
      const centerline = cellsToCenterline(pathCells, config.gridSize);
      const corridorSurfaceKind = getCorridorSurfaceProfile(
        config,
        source,
        target,
        edge,
      );
      const targetDoor = markMineBreachOpening(
        decorateDoorSegment(
          createDoorFromAnchor(targetAnchor, config.gridSize, edge.secret),
          config,
          edge,
          targetEndpoint,
        ),
        config,
        corridorSurfaceKind,
        target,
      );

      plannedCorridors.push({
        ...edge,
        autoHub: true,
        autoHubId: group.id,
        autoHubSourceRegionId: source.id,
        surfaceKind: corridorSurfaceKind,
        corridorStyle: organicTunnel ? "natural-tunnel" : "structured-corridor",
        fromAnchor: sourceEndpoint === "from" ? hubAnchor : targetAnchor,
        toAnchor: sourceEndpoint === "from" ? targetAnchor : hubAnchor,
        fromAnchorBridgeCell: branchPathBridge.fromAnchorBridgeCell,
        toAnchorBridgeCell: branchPathBridge.toAnchorBridgeCell,
        floorCells,
        pathCells,
        centerline,
        manualWaypoints: [],
        waypoints: dedupePoints(extractWaypoints(centerline)),
        doors:
          getContextKey(config.context || config.biome) === "cave" && organicTunnel
            ? []
            : [targetDoor],
      });

      floorCells.forEach((cell) => plannedCells.add(cellKey(cell.x, cell.y)));
      plannedDoorCells.add(cellKey(targetAnchor.outsideCell.x, targetAnchor.outsideCell.y));
      plannedExtensionAnchors.push(targetAnchor);
      plannedDoorRegistrations.push({
        region: target,
        anchor: targetAnchor,
        door: targetDoor,
        corridorId: edge.id,
        endpoint: targetEndpoint,
      });
    }

    plannedCells.forEach((key) => existingCorridors.add(key));
    plannedDoorRegistrations.forEach((entry) =>
      registerReusableDoorAnchor(
        entry.region,
        entry.anchor,
        entry.door,
        entry.corridorId,
        entry.endpoint,
      ),
    );
    addCircleDoorRoomExtensionCellToSet(sourceAnchor, dynamicRoomCells);
    plannedExtensionAnchors.forEach((anchor) =>
      addCircleDoorRoomExtensionCellToSet(anchor, dynamicRoomCells),
    );
    return plannedCorridors;
  };

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
      config.gridSize,
    );
    const manualToAnchor = resolveManualDoorAnchor(
      to,
      manualDoorAnchors[corridorEndpointKey(edge.id, "to")],
      config.gridSize,
    );
    const roomBlockedCells = new Set(dynamicRoomCells);
    const selectRecoveryAnchor = (region, targetRegion, manualAnchor, endpoint) => {
      if (manualAnchor) return manualAnchor;
      return (
        selectDoorAnchorForEndpoint(
          region,
          targetRegion,
          edgeRng,
          edge,
          endpoint,
          null,
        ) ||
        chooseDoorAnchorForRegion(
          region,
          targetRegion,
          edgeRng,
          new Set(dynamicRoomCells),
          routingProfile,
        ) ||
        getClosestBoundaryAnchorToPoint(
          region,
          targetRegion.labelPoint,
          config.gridSize,
        )
      );
    };

    const rawFromAnchor = selectRecoveryAnchor(from, to, manualFromAnchor, "from");
    const rawToAnchor = selectRecoveryAnchor(to, from, manualToAnchor, "to");
    if (!rawFromAnchor || !rawToAnchor) return null;

    const fromAnchor = createCircleDoorRoomExtensionAnchor(
      from,
      rawFromAnchor,
      gridW,
      gridH,
      getCircleDoorReservedCells(from.id),
      config.gridSize,
    );
    const toAnchor = createCircleDoorRoomExtensionAnchor(
      to,
      rawToAnchor,
      gridW,
      gridH,
      getCircleDoorReservedCells(to.id),
      config.gridSize,
    );

    const allowedApproachCells = [
      ...getAnchorApproachCells(fromAnchor),
      ...getAnchorApproachCells(toAnchor),
    ];
    const buildRoutingOptions = (extraRelaxed = false) => {
      const blocked = new Set(roomBlockedCells);
      unblockApproachCells(
        blocked,
        allowedApproachCells,
        new Set([from.id, to.id]),
      );
      unblockExistingCorridorCells(blocked);
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

    addCircleDoorRoomExtensionCellToSet(fromAnchor, dynamicRoomCells);
    addCircleDoorRoomExtensionCellToSet(toAnchor, dynamicRoomCells);

    const pathBridge = applyAnchorBridgeCells(
      path.map((cell) => ({ x: cell.x, y: cell.y })),
      fromAnchor,
      toAnchor,
      dynamicRoomCells,
    );
    const organicTunnel = shouldUseOrganicTunnel(config, from, to);
    const pathCells = pathBridge.pathCells;
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

    registerReusableDoorAnchor(from, fromAnchor, fromDoor, edge.id, "from");
    registerReusableDoorAnchor(to, toAnchor, toDoor, edge.id, "to");

    return {
      ...edge,
      recoveredGraphEdge: true,
      surfaceKind: corridorSurfaceKind,
      corridorStyle: organicTunnel ? "natural-tunnel" : "structured-corridor",
      fromAnchor,
      toAnchor,
      fromAnchorBridgeCell: pathBridge.fromAnchorBridgeCell,
      toAnchorBridgeCell: pathBridge.toAnchorBridgeCell,
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

  const autoHubHandledEdgeIds = new Set();
  const autoHubCorridors = [];
  buildAutoCorridorHubGroups(config, regions, graph).forEach((group) => {
    const routedGroup = routeAutoHubGroup(group);
    if (!Array.isArray(routedGroup) || routedGroup.length === 0) return;
    routedGroup.forEach((corridor) => autoHubCorridors.push(corridor));
    group.entries.forEach((entry) => autoHubHandledEdgeIds.add(entry.edge.id));
  });

  const routedCorridors = graph
    .filter((edge) => !autoHubHandledEdgeIds.has(edge.id))
    .flatMap((edge) => {
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
      config.gridSize,
    );
    const manualToAnchor = resolveManualDoorAnchor(
      to,
      manualDoorAnchors[corridorEndpointKey(edge.id, "to")],
      config.gridSize,
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
    const rawFromAnchor = selectDoorAnchorForEndpoint(
      from,
      to,
      edgeRng,
      edge,
      "from",
      manualFromAnchor,
    );
    const rawToAnchor = selectDoorAnchorForEndpoint(
      to,
      from,
      edgeRng,
      edge,
      "to",
      manualToAnchor,
    );
    if (!rawFromAnchor || !rawToAnchor) return [];
    const fromAnchor = createCircleDoorRoomExtensionAnchor(
      from,
      rawFromAnchor,
      gridW,
      gridH,
      getCircleDoorReservedCells(from.id),
      config.gridSize,
    );
    const toAnchor = createCircleDoorRoomExtensionAnchor(
      to,
      rawToAnchor,
      gridW,
      gridH,
      getCircleDoorReservedCells(to.id),
      config.gridSize,
    );
    addCircleDoorRoomExtensionCellToSet(fromAnchor, dynamicRoomCells);
    addCircleDoorRoomExtensionCellToSet(toAnchor, dynamicRoomCells);
    const blocked = new Set(dynamicRoomCells);
    const allowedApproachCells = [
      ...getAnchorApproachCells(fromAnchor),
      ...getAnchorApproachCells(toAnchor),
    ];
    unblockApproachCells(
      blocked,
      allowedApproachCells,
      new Set([from.id, to.id]),
    );
    unblockExistingCorridorCells(blocked);
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
    const pathBridge = applyAnchorBridgeCells(
      path.map((cell) => ({ x: cell.x, y: cell.y })),
      fromAnchor,
      toAnchor,
      dynamicRoomCells,
    );
    const organicTunnel = shouldUseOrganicTunnel(config, from, to);
    const pathCells = pathBridge.pathCells;
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

    registerReusableDoorAnchor(from, fromAnchor, fromDoor, edge.id, "from");
    registerReusableDoorAnchor(to, toAnchor, toDoor, edge.id, "to");

    return [
      {
        ...edge,
        surfaceKind: corridorSurfaceKind,
        corridorStyle: organicTunnel ? "natural-tunnel" : "structured-corridor",
        fromAnchor,
        toAnchor,
        fromAnchorBridgeCell: pathBridge.fromAnchorBridgeCell,
        toAnchorBridgeCell: pathBridge.toAnchorBridgeCell,
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

  const primaryCorridors = [...autoHubCorridors, ...routedCorridors];
  const corridorIds = new Set(primaryCorridors.map((corridor) => corridor.id));
  const recoveredGraphEdges = graph
    .filter((edge) => !corridorIds.has(edge.id))
    .map(routeRecoveredGraphEdge)
    .filter(Boolean);

  const sharedRoomTraversalGraph = buildSharedRoomTraversalGraph(
    regions,
    config.gridSize,
  );
  const routedAndRecovered = normalizeGeneratedDoorOccupancy(
    [...primaryCorridors, ...recoveredGraphEdges],
    config,
    config.gridSize,
  );
  const routedAndRecoveredIds = new Set(
    routedAndRecovered.map((corridor) => corridor.id),
  );
  const roomTraversalRecoveries = graph
    .filter((edge) => !routedAndRecoveredIds.has(edge.id))
    .map((edge) =>
      createSharedRoomTraversalCorridor(
        edge,
        config,
        config.gridSize,
        createSeededRng(hashStringToSeed(config.seed, edge.id, "room-traversal-recovery")),
        routingProfile,
        regionById,
        sharedRoomTraversalGraph,
      ),
    )
    .filter(Boolean);

  const sanitizedCorridors = normalizeCorridorNetwork(
    normalizeGeneratedDoorOccupancy(
      [...routedAndRecovered, ...roomTraversalRecoveries],
      config,
      config.gridSize,
    ),
    config.gridSize,
  ).map((corridor) => {
    const tunnelHits = getNonEndpointRoomTunnelHits(corridor, roomOwnership);
    if (tunnelHits.length === 0) return corridor;
    return (
      createSharedRoomTraversalCorridor(
        corridor,
        config,
        config.gridSize,
        createSeededRng(hashStringToSeed(config.seed, corridor.id, "room-traversal")),
        routingProfile,
        regionById,
        sharedRoomTraversalGraph,
      ) || corridor
    );
  });

  return repairPhysicalCorridorNetwork(sanitizedCorridors);
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

function createDoorFromExpandedCircleAnchor(anchor, gridSize, secret = false) {
  if (!anchor?.expandedCircleDoor || !anchor?.portalRoomCell) return null;
  const cell = anchor.portalRoomCell || anchor.cell;
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
    expandedCircleDoor: true,
    portalRoomCell: { x: cell.x, y: cell.y },
    originalCell: anchor.originalCell
      ? { x: anchor.originalCell.x, y: anchor.originalCell.y }
      : null,
    originalOutsideCell: anchor.originalOutsideCell
      ? { x: anchor.originalOutsideCell.x, y: anchor.originalOutsideCell.y }
      : null,
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

export function createDoorFromAnchor(anchor, gridSize, secret = false) {
  const expandedCircleDoor = createDoorFromExpandedCircleAnchor(
    anchor,
    gridSize,
    secret,
  );
  if (expandedCircleDoor) return expandedCircleDoor;
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
  const manualDoorAnchor = Boolean(
    config.manualDoorAnchors?.[corridorEndpointKey(edge.id, endpoint)],
  );
  const doorOccupancyPriority =
    (stairTransition !== "none" ? 100 : 0) +
    (doorType === "locked" ? 30 : 0) +
    (doorType === "secret" ? 20 : 0) +
    (edge.reason === "auto-corridor-hub-stem" ? 8 : 0) +
    (edge.recoveredGraphEdge ? -6 : 0);
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
    manualDoorAnchor,
    generatedDoor: !manualDoorAnchor,
    doorOccupancyPriority,
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
