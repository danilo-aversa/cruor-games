import {
  getContextKey,
  getFallbackMapAccessIntent,
  getMapAccessIntent,
  getPlacementRole,
  getRegionSemanticFlags,
} from "./map-generator.profile.js";
import { cellKey } from "./map-generator.mask.js";
import {
  getRoomDesignModifiers,
  getRoomDesignRequiredPropCount,
  getRoomDesignRequiredProps,
  normalizeRoomDesignPropKind,
} from "./map-generator.room-design.js";
import {
  getAnchorCenterOffset,
  getAnchorHandlePoint,
  getBoundaryCells,
  getFinalConnectionAnchors,
} from "./map-generator.corridors.js";

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

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeMapAccessType(value, fallback = "passage") {
  return ["entrance", "exit", "passage"].includes(value) ? value : fallback;
}

export function getMapAccessLabelForType(type) {
  if (type === "entrance") return "IN";
  if (type === "exit") return "OUT";
  return "PASS";
}

export function serializeMapAccessAnchor(anchor) {
  if (!anchor) return null;
  return {
    side: anchor.side,
    cell: { x: anchor.cell.x, y: anchor.cell.y },
    ...(anchor.finalGeometry
      ? {
          finalGeometry: true,
          caveAccessBoundary: Boolean(anchor.caveAccessBoundary),
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
          tangent: anchor.tangent
            ? { x: anchor.tangent.x, y: anchor.tangent.y }
            : null,
          caveBounds: anchor.caveBounds ? { ...anchor.caveBounds } : null,
        }
      : {}),
  };
}

export function anchorsShareSideAndCell(a, b) {
  return (
    Boolean(a && b) &&
    a.side === b.side &&
    a.cell?.x === b.cell?.x &&
    a.cell?.y === b.cell?.y
  );
}

export function anchorsShareFinalGeometry(a, b) {
  if (!a?.finalGeometry || !b?.finalGeometry) return false;
  if (
    Number.isInteger(a.finalBoundaryIndex) &&
    Number.isInteger(b.finalBoundaryIndex)
  ) {
    return a.finalBoundaryIndex === b.finalBoundaryIndex;
  }
  return (
    Boolean(a.segment && b.segment) &&
    Math.abs(a.segment.x1 - b.segment.x1) < 0.01 &&
    Math.abs(a.segment.y1 - b.segment.y1) < 0.01 &&
    Math.abs(a.segment.x2 - b.segment.x2) < 0.01 &&
    Math.abs(a.segment.y2 - b.segment.y2) < 0.01
  );
}

export function normalizeVector(vector, fallback = { x: 1, y: 0 }) {
  const length = Math.hypot(vector?.x || 0, vector?.y || 0);
  if (!Number.isFinite(length) || length <= 0.0001) return fallback;
  return { x: vector.x / length, y: vector.y / length };
}

export function getCardinalSideFromNormal(normal) {
  if (Math.abs(normal.x) >= Math.abs(normal.y))
    return normal.x < 0 ? "west" : "east";
  return normal.y < 0 ? "north" : "south";
}

export function getOutsideCellFromSide(cell, side) {
  if (side === "north") return { x: cell.x, y: cell.y - 1 };
  if (side === "south") return { x: cell.x, y: cell.y + 1 };
  if (side === "west") return { x: cell.x - 1, y: cell.y };
  return { x: cell.x + 1, y: cell.y };
}

export function projectPointToSegment(point, segment) {
  const ax = segment.x1;
  const ay = segment.y1;
  const bx = segment.x2;
  const by = segment.y2;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy || 1;
  const t = clamp(((point.x - ax) * dx + (point.y - ay) * dy) / lengthSq, 0, 1);
  return {
    x: ax + dx * t,
    y: ay + dy * t,
    t,
  };
}

export function isPureCaveAccessMap(generatedMap) {
  return (
    getContextKey(
      generatedMap?.config?.context || generatedMap?.config?.biome,
    ) === "cave" && generatedMap?.finalGeometry?.surfaceKind === "cave"
  );
}

export function getCaveAccessBoundarySegments(generatedMap) {
  if (!isPureCaveAccessMap(generatedMap)) return [];
  const mapSurface = generatedMap.finalGeometry?.mapSurface || null;
  const caveSurface =
    generatedMap.finalGeometry?.caveSurface || mapSurface?.caveSurface || null;
  return (
    caveSurface?.baseBoundarySegments ||
    mapSurface?.baseBoundarySegments ||
    mapSurface?.externalWallSegments ||
    caveSurface?.boundarySegments ||
    mapSurface?.wallSegments ||
    []
  );
}

export function getCaveAccessBounds(segments, generatedMap) {
  const bounds = generatedMap.contentBounds || {
    x: 0,
    y: 0,
    width: generatedMap.config.mapWidth,
    height: generatedMap.config.mapHeight,
  };
  if (!Array.isArray(segments) || segments.length === 0) return bounds;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  segments.forEach((segment) => {
    [segment.x1, segment.x2].forEach((x) => {
      if (Number.isFinite(x)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    });
    [segment.y1, segment.y2].forEach((y) => {
      if (Number.isFinite(y)) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    });
  });
  if (![minX, minY, maxX, maxY].every(Number.isFinite)) return bounds;
  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function createCaveAccessBoundaryAnchor(
  segment,
  generatedMap,
  index,
  bounds,
  pointOverride = null,
) {
  if (!segment) return null;
  const g = generatedMap.config.gridSize;
  const center = pointOverride
    ? projectPointToSegment(pointOverride, segment)
    : { x: (segment.x1 + segment.x2) / 2, y: (segment.y1 + segment.y2) / 2 };
  const tangent = normalizeVector({
    x: segment.x2 - segment.x1,
    y: segment.y2 - segment.y1,
  });
  const normalA = { x: -tangent.y, y: tangent.x };
  const radial = normalizeVector(
    {
      x: center.x - (bounds.x + bounds.width / 2),
      y: center.y - (bounds.y + bounds.height / 2),
    },
    normalA,
  );
  const normal =
    normalA.x * radial.x + normalA.y * radial.y >= 0
      ? normalA
      : { x: -normalA.x, y: -normalA.y };
  const side = getCardinalSideFromNormal(normal);
  const gridW = Math.max(1, Math.floor(generatedMap.config.mapWidth / g));
  const gridH = Math.max(1, Math.floor(generatedMap.config.mapHeight / g));
  const cell = {
    x: clamp(Math.floor(center.x / g), 0, gridW - 1),
    y: clamp(Math.floor(center.y / g), 0, gridH - 1),
  };
  return {
    side,
    cell,
    outsideCell: getOutsideCellFromSide(cell, side),
    normal,
    tangent,
    finalGeometry: true,
    caveAccessBoundary: true,
    finalBoundaryIndex: index,
    segment: { x1: segment.x1, y1: segment.y1, x2: segment.x2, y2: segment.y2 },
    point: center,
    caveBounds: bounds,
  };
}

export function createCaveAccessAnchorFromMouth(mouth, generatedMap, index) {
  if (!mouth?.segment || !mouth?.center) return null;
  const g = generatedMap.config.gridSize;
  const center = mouth.center;
  const normal = normalizeVector(mouth.normal);
  const tangent = normalizeVector(
    mouth.tangent || { x: -normal.y, y: normal.x },
    { x: -normal.y, y: normal.x },
  );
  const side = mouth.side || getCardinalSideFromNormal(normal);
  const gridW = Math.max(1, Math.floor(generatedMap.config.mapWidth / g));
  const gridH = Math.max(1, Math.floor(generatedMap.config.mapHeight / g));
  const cell = {
    x: clamp(Math.floor(center.x / g), 0, gridW - 1),
    y: clamp(Math.floor(center.y / g), 0, gridH - 1),
  };
  return {
    side,
    cell,
    outsideCell: getOutsideCellFromSide(cell, side),
    normal,
    tangent,
    finalGeometry: true,
    caveAccessBoundary: true,
    finalBoundaryIndex: Number.isInteger(mouth.edgeIndex)
      ? mouth.edgeIndex
      : index,
    segment: {
      x1: mouth.segment.x1,
      y1: mouth.segment.y1,
      x2: mouth.segment.x2,
      y2: mouth.segment.y2,
    },
    point: { x: center.x, y: center.y },
    caveBounds:
      mouth.caveBounds ||
      getCaveAccessBounds(
        getCaveAccessBoundarySegments(generatedMap),
        generatedMap,
      ),
    accessMouth: mouth,
  };
}

export function getCaveAccessMouthForAccess(generatedMap, access) {
  const mouths =
    generatedMap?.finalGeometry?.caveSurface?.accessMouths ||
    generatedMap?.finalGeometry?.mapSurface?.caveSurface?.accessMouths ||
    [];
  if (!Array.isArray(mouths) || mouths.length === 0 || !access) return null;
  return mouths.find((mouth) => mouth.id === access.id) || null;
}

export function getHybridCaveAccessMouthForAccess(generatedMap, access) {
  if (!access) return null;
  const regionSurface = generatedMap?.finalGeometry?.regions?.[access.regionId];
  const localMouths = regionSurface?.accessMouths || [];
  if (Array.isArray(localMouths) && localMouths.length > 0) {
    const mouth = localMouths.find(
      (item) => item.accessId === access.id || item.id === access.id,
    );
    if (mouth) return mouth;
  }
  const allMouths = Object.values(
    generatedMap?.finalGeometry?.regions || {},
  ).flatMap((surface) => surface?.accessMouths || []);
  return (
    allMouths.find(
      (mouth) => mouth.accessId === access.id || mouth.id === access.id,
    ) || null
  );
}

export function getPureCaveBoundaryAnchors(generatedMap) {
  const segments = getCaveAccessBoundarySegments(generatedMap);
  if (segments.length === 0) return [];
  const bounds = getCaveAccessBounds(segments, generatedMap);
  const g = generatedMap.config.gridSize;
  return segments
    .map((segment, index) => {
      const length = Math.hypot(
        segment.x2 - segment.x1,
        segment.y2 - segment.y1,
      );
      if (!Number.isFinite(length) || length < g * 0.24) return null;
      return createCaveAccessBoundaryAnchor(
        segment,
        generatedMap,
        index,
        bounds,
      );
    })
    .filter(Boolean);
}

export function getExternalBoundaryAnchors(region, generatedMap) {
  if (isPureCaveAccessMap(generatedMap)) {
    const caveAnchors = getPureCaveBoundaryAnchors(generatedMap);
    if (caveAnchors.length > 0) return caveAnchors;
  }
  const finalAnchors = getFinalConnectionAnchors(generatedMap, region);
  if (finalAnchors.length > 0) return finalAnchors;
  const floorSet = new Set(
    generatedMap.dungeonMask.floorCells.map((cell) => cellKey(cell.x, cell.y)),
  );
  return getBoundaryCells(region).filter(
    (anchor) =>
      !floorSet.has(cellKey(anchor.outsideCell.x, anchor.outsideCell.y)),
  );
}

export function resolveMapAccessAnchor(region, serializedAnchor, generatedMap) {
  const anchors = getExternalBoundaryAnchors(region, generatedMap);
  if (anchors.length === 0) return null;
  if (!serializedAnchor?.cell) return null;
  if (
    isPureCaveAccessMap(generatedMap) &&
    serializedAnchor.finalGeometry &&
    serializedAnchor.point
  ) {
    const projected = getClosestExternalBoundaryAnchorToPoint(
      region,
      serializedAnchor.point,
      generatedMap,
    );
    if (projected) return projected;
  }
  const exact = anchors.find(
    (anchor) =>
      anchorsShareFinalGeometry(anchor, serializedAnchor) ||
      anchorsShareSideAndCell(anchor, serializedAnchor),
  );
  if (exact) {
    if (exact.finalGeometry && exact.segment && serializedAnchor.point) {
      return createCaveAccessBoundaryAnchor(
        exact.segment,
        generatedMap,
        exact.finalBoundaryIndex,
        exact.caveBounds ||
          serializedAnchor.caveBounds ||
          getCaveAccessBounds(
            getCaveAccessBoundarySegments(generatedMap),
            generatedMap,
          ),
        serializedAnchor.point,
      );
    }
    return exact;
  }
  return (
    anchors
      .map((anchor) => {
        const dx = anchor.cell.x - serializedAnchor.cell.x;
        const dy = anchor.cell.y - serializedAnchor.cell.y;
        const sidePenalty = anchor.side === serializedAnchor.side ? 0 : 2;
        return { anchor, score: dx * dx + dy * dy + sidePenalty };
      })
      .sort((a, b) => a.score - b.score)[0]?.anchor || null
  );
}

export function scorePureCaveAccessAnchor(anchor, generatedMap, intent) {
  if (!anchor?.caveAccessBoundary) return 0;
  const bounds = anchor.caveBounds ||
    generatedMap.contentBounds || {
      x: 0,
      y: 0,
      width: generatedMap.config.mapWidth,
      height: generatedMap.config.mapHeight,
    };
  const point =
    anchor.point || getAnchorHandlePoint(anchor, generatedMap.config.gridSize);
  const xRatio = clamp((point.x - bounds.x) / Math.max(1, bounds.width), 0, 1);
  const yRatio = clamp((point.y - bounds.y) / Math.max(1, bounds.height), 0, 1);
  const sideBias =
    intent.type === "entrance"
      ? (anchor.side === "west"
          ? -1.25
          : anchor.side === "north"
            ? -0.35
            : 0.65) +
        xRatio * 2.2
      : intent.type === "exit"
        ? (anchor.side === "east"
            ? -1.15
            : anchor.side === "south"
              ? -0.25
              : 0.65) +
          (1 - xRatio) * 2.1
        : Math.min(Math.abs(xRatio - 0.5), Math.abs(yRatio - 0.5)) * -0.65;
  const labelRoom = generatedMap.config.gridSize * 1.8;
  const hasLabelBreathingRoom =
    point.x > bounds.x + labelRoom &&
    point.x < bounds.x + bounds.width - labelRoom &&
    point.y > bounds.y + labelRoom &&
    point.y < bounds.y + bounds.height - labelRoom;
  return sideBias + (hasLabelBreathingRoom ? 0.3 : -0.15);
}

export function scoreMapAccessAnchor(
  anchor,
  region,
  generatedMap,
  intent,
  index,
) {
  const point = getAnchorHandlePoint(anchor, generatedMap.config.gridSize);
  const bounds = generatedMap.contentBounds || {
    x: 0,
    y: 0,
    width: generatedMap.config.mapWidth,
    height: generatedMap.config.mapHeight,
  };
  const center = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
  const vx = point.x - center.x;
  const vy = point.y - center.y;
  const length = Math.hypot(vx, vy) || 1;
  const outward = { x: vx / length, y: vy / length };
  const normal = anchor.normal || outward;
  const normalAlignment = 1 - (normal.x * outward.x + normal.y * outward.y);
  const centerOffset = getAnchorCenterOffset(anchor, region);
  const roleBias =
    intent.type === "entrance" && anchor.side === "west"
      ? -0.35
      : intent.type === "exit" && anchor.side === "east"
        ? -0.25
        : 0;
  const caveAccessBias = scorePureCaveAccessAnchor(
    anchor,
    generatedMap,
    intent,
  );
  const jitter =
    (hashStringToSeed(
      generatedMap.config.seed,
      region.id,
      intent.type,
      index,
      anchor.side,
      anchor.cell.x,
      anchor.cell.y,
      "map-access",
    ) %
      100) /
    100;
  return (
    normalAlignment * 8 +
    centerOffset * 1.6 +
    roleBias +
    caveAccessBias +
    jitter * 0.5
  );
}

export function createMapAccessFloorExtension(
  center,
  tangent,
  normal,
  gridSize,
) {
  const halfWidth = gridSize * 0.52;
  const inner = {
    x: center.x - normal.x * gridSize * 0.62,
    y: center.y - normal.y * gridSize * 0.62,
  };
  const outer = {
    x: center.x + normal.x * gridSize * 1.08,
    y: center.y + normal.y * gridSize * 1.08,
  };
  const points = [
    { x: inner.x - tangent.x * halfWidth, y: inner.y - tangent.y * halfWidth },
    { x: inner.x + tangent.x * halfWidth, y: inner.y + tangent.y * halfWidth },
    { x: outer.x + tangent.x * halfWidth, y: outer.y + tangent.y * halfWidth },
    { x: outer.x - tangent.x * halfWidth, y: outer.y - tangent.y * halfWidth },
  ];
  return {
    kind: "access-floor-extension",
    points,
    path: `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y} Z`,
    inner,
    outer,
  };
}

export function createMapAccessFromAnchor(
  region,
  anchor,
  intent,
  generatedMap,
  index,
) {
  const g = generatedMap.config.gridSize;
  const center = getAnchorHandlePoint(anchor, g);
  const openingHalf = g * (anchor.finalGeometry ? 0.56 : 0.43);
  const segmentLength = anchor.segment
    ? Math.hypot(
        anchor.segment.x2 - anchor.segment.x1,
        anchor.segment.y2 - anchor.segment.y1,
      ) || 1
    : null;
  const tangent = anchor.segment
    ? {
        x: (anchor.segment.x2 - anchor.segment.x1) / segmentLength,
        y: (anchor.segment.y2 - anchor.segment.y1) / segmentLength,
      }
    : anchor.side === "north" || anchor.side === "south"
      ? { x: 1, y: 0 }
      : { x: 0, y: 1 };
  const wallGap = {
    x1: center.x - tangent.x * openingHalf,
    y1: center.y - tangent.y * openingHalf,
    x2: center.x + tangent.x * openingHalf,
    y2: center.y + tangent.y * openingHalf,
  };
  const inward = { x: -anchor.normal.x, y: -anchor.normal.y };
  const floorExtension = createMapAccessFloorExtension(
    center,
    tangent,
    anchor.normal,
    g,
  );
  const startOutside = { x: floorExtension.outer.x, y: floorExtension.outer.y };
  const endInside = {
    x: center.x + inward.x * g * 0.56,
    y: center.y + inward.y * g * 0.56,
  };
  const startInside = {
    x: center.x + inward.x * g * 0.56,
    y: center.y + inward.y * g * 0.56,
  };
  const endOutside = { x: floorExtension.outer.x, y: floorExtension.outer.y };
  const start = intent.type === "exit" ? startInside : startOutside;
  const end = intent.type === "exit" ? endOutside : endInside;

  return {
    id: intent.id || `access-${region.id}-${intent.type}-${index}`,
    regionId: region.id,
    regionName: region.name,
    type: intent.type,
    label: intent.label || getMapAccessLabelForType(intent.type),
    side: anchor.side,
    cell: { x: anchor.cell.x, y: anchor.cell.y },
    outsideCell: { x: anchor.outsideCell.x, y: anchor.outsideCell.y },
    extensionCells: [{ x: anchor.outsideCell.x, y: anchor.outsideCell.y }],
    normal: anchor.normal,
    tangent,
    finalGeometry: Boolean(anchor.finalGeometry),
    caveAccessBoundary: Boolean(anchor.caveAccessBoundary),
    finalBoundaryIndex: anchor.finalBoundaryIndex,
    segment: anchor.segment
      ? {
          x1: anchor.segment.x1,
          y1: anchor.segment.y1,
          x2: anchor.segment.x2,
          y2: anchor.segment.y2,
        }
      : null,
    point: anchor.point
      ? { x: anchor.point.x, y: anchor.point.y }
      : { x: center.x, y: center.y },
    caveBounds: anchor.caveBounds ? { ...anchor.caveBounds } : null,
    wallGap,
    floorExtension,
    start,
    end,
    doubleHeaded: intent.type === "passage",
    manual: Boolean(intent.manual),
  };
}

export function chooseMapAccessForRegion(region, generatedMap, intent, index) {
  const anchors = getExternalBoundaryAnchors(region, generatedMap);
  if (anchors.length === 0) return null;
  const ranked = anchors
    .map((anchor) => ({
      anchor,
      score: scoreMapAccessAnchor(anchor, region, generatedMap, intent, index),
    }))
    .sort((a, b) => a.score - b.score);
  return createMapAccessFromAnchor(
    region,
    ranked[0].anchor,
    intent,
    generatedMap,
    index,
  );
}

export function getClosestExternalBoundaryAnchorToPoint(
  region,
  point,
  generatedMap,
) {
  if (isPureCaveAccessMap(generatedMap)) {
    const segments = getCaveAccessBoundarySegments(generatedMap);
    if (segments.length === 0) return null;
    const bounds = getCaveAccessBounds(segments, generatedMap);
    return (
      segments
        .map((segment, index) => {
          const projected = projectPointToSegment(point, segment);
          const dx = projected.x - point.x;
          const dy = projected.y - point.y;
          return {
            anchor: createCaveAccessBoundaryAnchor(
              segment,
              generatedMap,
              index,
              bounds,
              projected,
            ),
            score: dx * dx + dy * dy,
          };
        })
        .sort((a, b) => a.score - b.score)[0]?.anchor || null
    );
  }
  const anchors = getExternalBoundaryAnchors(region, generatedMap);
  if (anchors.length === 0) return null;
  return (
    anchors
      .map((anchor) => {
        const handlePoint = getAnchorHandlePoint(
          anchor,
          generatedMap.config.gridSize,
        );
        const dx = handlePoint.x - point.x;
        const dy = handlePoint.y - point.y;
        return { anchor, score: dx * dx + dy * dy };
      })
      .sort((a, b) => a.score - b.score)[0]?.anchor || null
  );
}

export function createDisplayMapAccessFromAnchor(access, anchor, generatedMap) {
  if (!access || !anchor) return access;
  const g = generatedMap.config.gridSize;
  const accessMouth = anchor.accessMouth || null;
  const center = accessMouth?.center || getAnchorHandlePoint(anchor, g);
  const symbolCenter =
    accessMouth?.leftTip && accessMouth?.rightTip
      ? {
          x: (accessMouth.leftTip.x + accessMouth.rightTip.x) / 2,
          y: (accessMouth.leftTip.y + accessMouth.rightTip.y) / 2,
        }
      : center;
  const normal = normalizeVector(anchor.normal || access.normal);
  const tangent = normalizeVector(
    anchor.tangent || access.tangent || { x: -normal.y, y: normal.x },
    { x: -normal.y, y: normal.x },
  );
  const openingHalf = g * 0.5;
  const displayWallGap = accessMouth?.segment
    ? {
        x1: accessMouth.segment.x1,
        y1: accessMouth.segment.y1,
        x2: accessMouth.segment.x2,
        y2: accessMouth.segment.y2,
      }
    : {
        x1: center.x - tangent.x * openingHalf,
        y1: center.y - tangent.y * openingHalf,
        x2: center.x + tangent.x * openingHalf,
        y2: center.y + tangent.y * openingHalf,
      };
  const insideLength = accessMouth ? g * 0.76 : g * 0.38;
  const outsideLength = accessMouth ? g * 0.96 : g * 0.78;
  const inside = {
    x: symbolCenter.x - normal.x * insideLength,
    y: symbolCenter.y - normal.y * insideLength,
  };
  const outside = {
    x: symbolCenter.x + normal.x * outsideLength,
    y: symbolCenter.y + normal.y * outsideLength,
  };
  const displayStart = access.type === "exit" ? inside : outside;
  const displayEnd = access.type === "exit" ? outside : inside;
  const displayLabelPoint = accessMouth
    ? {
        x: symbolCenter.x + normal.x * g * 1.38,
        y: symbolCenter.y + normal.y * g * 1.38,
      }
    : {
        x: displayStart.x + normal.x * g * 0.32,
        y: displayStart.y + normal.y * g * 0.32,
      };
  return {
    ...access,
    ...(accessMouth?.openingType === "external-access"
      ? {
          floorExtension: null,
          wallGap: null,
          suppressFloorExtension: true,
          suppressAccessTunnelWalls: true,
          suppressAccessWallGap: true,
        }
      : {}),
    displayAnchor: serializeMapAccessAnchor(anchor),
    accessMouth,
    displayPoint: center,
    displayWallGap,
    displayStart,
    displayEnd,
    displayLabelPoint,
    displayNormal: normal,
    displayTangent: tangent,
    displaySymbolCenter: symbolCenter,
    debugRequestedPoint:
      accessMouth?.debugRequestedPoint || access.point || null,
    debugFinalMouthCenter: accessMouth?.debugFinalMouthCenter || center,
    debugSymbolCenter: symbolCenter,
    debugLeftAttach: accessMouth?.debugLeftAttach || null,
    debugRightAttach: accessMouth?.debugRightAttach || null,
    debugSnapDistance: accessMouth?.debugSnapDistance ?? null,
  };
}

export function reconcileMapAccessesWithFinalGeometry(generatedMap) {
  const accesses =
    generatedMap?.mapAccesses || generatedMap?.dungeonMask?.mapAccesses || [];
  if (accesses.length === 0) return accesses;
  const isPureCaveAccess = isPureCaveAccessMap(generatedMap);
  const isHybridCaveAccess =
    generatedMap?.finalGeometry?.kind === "final-hybrid-geometry" &&
    getContextKey(
      generatedMap?.config?.context || generatedMap?.config?.biome,
    ) === "mine";
  if (!isPureCaveAccess && !isHybridCaveAccess) return accesses;
  const regionsById = new Map(
    (generatedMap.regions || []).map((region) => [region.id, region]),
  );
  return accesses.map((access, index) => {
    const region =
      regionsById.get(access.regionId) || generatedMap.regions?.[0];
    const mouth = isPureCaveAccess
      ? getCaveAccessMouthForAccess(generatedMap, access)
      : getHybridCaveAccessMouthForAccess(generatedMap, access);
    const mouthAnchor = mouth
      ? createCaveAccessAnchorFromMouth(mouth, generatedMap, index)
      : null;
    if (mouthAnchor)
      return createDisplayMapAccessFromAnchor(
        access,
        mouthAnchor,
        generatedMap,
      );
    if (isHybridCaveAccess) return access;
    const target =
      access.point ||
      access.displayPoint ||
      (access.wallGap
        ? {
            x: (access.wallGap.x1 + access.wallGap.x2) / 2,
            y: (access.wallGap.y1 + access.wallGap.y2) / 2,
          }
        : null) ||
      access.start ||
      null;
    const anchor =
      target && region
        ? getClosestExternalBoundaryAnchorToPoint(region, target, generatedMap)
        : null;
    return anchor
      ? createDisplayMapAccessFromAnchor(access, anchor, generatedMap)
      : access;
  });
}

export function createManualMapAccessForRegion(
  region,
  override,
  generatedMap,
  index,
) {
  if (!override || override.disabled) return null;
  const fallbackIntent = getFallbackMapAccessIntent(region, generatedMap);
  const type = normalizeMapAccessType(override.type, fallbackIntent.type);
  const intent = {
    ...fallbackIntent,
    id: override.id || override.accessId || null,
    type,
    label: override.label || getMapAccessLabelForType(type),
    manual: true,
  };
  const anchor = resolveMapAccessAnchor(region, override.anchor, generatedMap);
  if (anchor)
    return createMapAccessFromAnchor(
      region,
      anchor,
      intent,
      generatedMap,
      `manual-${index}`,
    );
  const fallbackAccess = chooseMapAccessForRegion(
    region,
    generatedMap,
    intent,
    index,
  );
  return fallbackAccess
    ? {
        ...fallbackAccess,
        id: `access-${region.id}-${type}-manual-${index}`,
        manual: true,
      }
    : null;
}

export function areMapAccessesTooClose(a, b, gridSize) {
  const dx =
    (a.wallGap.x1 + a.wallGap.x2) / 2 - (b.wallGap.x1 + b.wallGap.x2) / 2;
  const dy =
    (a.wallGap.y1 + a.wallGap.y2) / 2 - (b.wallGap.y1 + b.wallGap.y2) / 2;
  return Math.hypot(dx, dy) < gridSize * 2.25;
}

export function createMapAccesses(generatedMap) {
  const contextKey = getContextKey(
    generatedMap.config.context || generatedMap.config.biome,
  );
  const manualAccesses = generatedMap.config.manualMapAccesses || {};
  const selected = [];
  const usedTypes = new Set();

  generatedMap.regions.forEach((region, index) => {
    const override = manualAccesses[region.id];
    if (!override || override.disabled) return;
    const access = createManualMapAccessForRegion(
      region,
      override,
      generatedMap,
      index,
    );
    if (!access) return;
    selected.push(access);
    usedTypes.add(access.type);
  });

  const candidates = generatedMap.regions
    .filter((region) => !manualAccesses[region.id])
    .map((region) => ({
      region,
      intent: getMapAccessIntent(region, contextKey),
    }))
    .filter((candidate) => candidate.intent)
    .sort(
      (a, b) =>
        a.intent.priority - b.intent.priority ||
        a.region.number - b.region.number,
    );

  candidates.forEach((candidate, index) => {
    if (
      (candidate.intent.type === "entrance" ||
        candidate.intent.type === "exit") &&
      usedTypes.has(candidate.intent.type)
    )
      return;
    if (
      candidate.intent.type === "passage" &&
      selected.filter((item) => item.type === "passage").length >= 2
    )
      return;
    const access = chooseMapAccessForRegion(
      candidate.region,
      generatedMap,
      candidate.intent,
      index,
    );
    if (!access) return;
    if (
      selected.some((item) =>
        areMapAccessesTooClose(item, access, generatedMap.config.gridSize),
      )
    )
      return;
    selected.push(access);
    usedTypes.add(candidate.intent.type);
  });

  return selected;
}

export function getPropBudget(region, flags, contextKey = "crypt") {
  const area = Math.max(
    1,
    region.floorCells?.length || region.cellRect.w * region.cellRect.h,
  );
  const longSide = Math.max(region.cellRect.w, region.cellRect.h);
  let base =
    area <= 12 ? 1 : area <= 22 ? 2 : area <= 36 ? 4 : area <= 56 ? 6 : 8;
  const role = getPlacementRole(region);

  if (contextKey === "chapel" && role === "connector")
    base = Math.max(base, Math.min(12, Math.floor(longSide * 1.15)));
  if (
    contextKey === "chapel" &&
    (role === "final" || flags.ritual || flags.outcome)
  )
    base = Math.max(base, 5);
  if (
    contextKey === "crypt" &&
    (flags.crypt || role === "final" || role === "secret")
  )
    base = Math.max(base, area >= 30 ? 8 : 3);
  if (contextKey === "mine")
    base = Math.max(
      base,
      role === "connector" ? Math.min(10, Math.floor(longSide * 0.9)) : 4,
    );
  if (contextKey === "cave") base = Math.max(base, area >= 32 ? 5 : 2);
  if (contextKey === "noble-house" && area >= 30) base = Math.max(base, 4);

  const semanticBonus = [
    flags.archive,
    flags.crypt,
    flags.hazard,
    flags.clue,
    flags.outcome,
    flags.fog,
    flags.water,
    flags.ritual,
  ].filter(Boolean).length;
  return clamp(base + Math.min(3, semanticBonus), 1, 14);
}

export function chooseContentAwarePropKind(
  region,
  flags,
  index,
  rng,
  contextKey = "crypt",
) {
  const role = getPlacementRole(region);

  if (contextKey === "chapel") {
    if ((role === "final" || flags.outcome || flags.ritual) && index === 0)
      return "altar";
    if (role === "connector" && index < 3) return "pew";
    if (role === "entrance" && index === 0) return "statue";
    if (flags.archive) return index % 2 === 0 ? "shelf" : "scroll-table";
    if (flags.crypt || role === "secret")
      return index % 2 === 0 ? "tomb" : "bones";
    return rng() > 0.55 ? "pillar" : "pew";
  }

  if (contextKey === "noble-house") {
    if (flags.archive || role === "secret")
      return index % 2 === 0 ? "shelf" : "desk";
    if (flags.clue && index === 0) return "desk";
    if (flags.kitchen) return index % 2 === 0 ? "table" : "shelf";
    if (role === "entrance") return index === 0 ? "fireplace" : "statue";
    if (role === "final") return index === 0 ? "table" : "chest";
    if (flags.hazard || flags.ruined)
      return index % 2 === 0 ? "rubble" : "crack";
    return index % 3 === 0 ? "bed" : index % 3 === 1 ? "table" : "chest";
  }

  if (contextKey === "mine") {
    if (flags.vertical && index === 0) return "pit";
    if (flags.hazard || flags.ruined)
      return index % 2 === 0 ? "rubble" : "mine-support";
    if (role === "connector" || index === 0) return "mine-rail";
    return rng() > 0.45 ? "mine-support" : "crack";
  }

  if (contextKey === "cave") {
    if (flags.water && index === 0) return "water";
    if (flags.vertical && index === 0) return "pit";
    if (flags.hazard || flags.ruined)
      return index % 2 === 0 ? "rubble" : "crack";
    return rng() > 0.42 ? "stalagmite" : "water";
  }

  if (contextKey === "ruins") {
    if (flags.hazard || flags.ruined)
      return index % 2 === 0 ? "rubble" : "broken-wall";
    if (flags.archive) return index % 2 === 0 ? "shelf" : "scroll-table";
    if (flags.ritual || flags.outcome) return index === 0 ? "altar" : "statue";
    return rng() > 0.55 ? "broken-wall" : "rubble";
  }

  if (flags.water && index === 0) return "water";
  if (flags.fog && index === 0) return "fog";
  if (flags.vertical && index === 0) return "pit";
  if (flags.outcome && index === 0) return flags.ritual ? "altar" : "statue";
  if (flags.ritual && index === 0) return "altar";
  if (flags.archive)
    return index % 3 === 0
      ? "shelf"
      : index % 3 === 1
        ? "scroll-table"
        : "crack";
  if (flags.crypt)
    return index % 3 === 0 ? "tomb" : index % 3 === 1 ? "bones" : "pillar";
  if (flags.hazard || flags.ruined) return index % 2 === 0 ? "rubble" : "crack";
  if (flags.clue) return index === 0 ? "clue-marker" : "table";
  if (flags.kitchen) return index % 2 === 0 ? "table" : "shelf";
  return rng() > 0.72 ? "pillar" : "crack";
}

export function getPropCandidateCells(region) {
  const boundary = new Set(
    getBoundaryCells(region).map((anchor) =>
      cellKey(anchor.cell.x, anchor.cell.y),
    ),
  );
  const cells = region.floorCells.filter(
    (cell) => !boundary.has(cellKey(cell.x, cell.y)),
  );
  return cells.length > 0 ? cells : region.floorCells;
}

export function getRegionFloorBounds(region) {
  if (!region.floorCells.length)
    return {
      ...region.cellRect,
      maxX: region.cellRect.x + region.cellRect.w - 1,
      maxY: region.cellRect.y + region.cellRect.h - 1,
    };
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  region.floorCells.forEach((cell) => {
    minX = Math.min(minX, cell.x);
    minY = Math.min(minY, cell.y);
    maxX = Math.max(maxX, cell.x);
    maxY = Math.max(maxY, cell.y);
  });
  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    maxX,
    maxY,
  };
}

export function getRoomAxis(region) {
  return region.cellRect.w >= region.cellRect.h ? "horizontal" : "vertical";
}

export function targetCellByRatio(region, rx, ry) {
  const bounds = getRegionFloorBounds(region);
  return {
    x: bounds.x + Math.round((bounds.w - 1) * clamp(rx, 0, 1)),
    y: bounds.y + Math.round((bounds.h - 1) * clamp(ry, 0, 1)),
  };
}

export function findClosestPropCell(region, target, reservedCells = new Set()) {
  const candidates = getPropCandidateCells(region);
  if (candidates.length === 0) return null;
  const ranked = candidates
    .map((cell) => {
      const key = cellKey(cell.x, cell.y);
      const dx = cell.x - target.x;
      const dy = cell.y - target.y;
      const reservedPenalty = reservedCells.has(key) ? 100000 : 0;
      return { cell, score: dx * dx + dy * dy + reservedPenalty };
    })
    .sort((a, b) => a.score - b.score);
  return ranked[0]?.cell || null;
}

export function reservePropCell(reservedCells, cell) {
  if (!cell) return;
  reservedCells.add(cellKey(cell.x, cell.y));
}

export function makeProp(region, kind, cell, config, index, options = {}) {
  return {
    id: `${region.id}-prop-${index}-${kind}`,
    regionId: region.id,
    kind,
    x: (cell.x + 0.5) * config.gridSize,
    y: (cell.y + 0.5) * config.gridSize,
    size: config.gridSize * (options.sizeScale || 1),
    rotation: Number.isFinite(options.rotation) ? options.rotation : 0,
    sourceAnchors: region.sourceAnchors || [],
    ...(options.archetypeCue ? { archetypeCue: options.archetypeCue } : {}),
    ...(options.detailProfile ? { detailProfile: options.detailProfile } : {}),
    ...(options.archetypeSignature || options.signature
      ? { archetypeSignature: true }
      : {}),
    ...(options.roomDesignRequired ? { roomDesignRequired: true } : {}),
    ...(options.roomDesignModifier ? { roomDesignModifier: options.roomDesignModifier } : {}),
    ...(options.roomDesignPropKind ? { roomDesignPropKind: options.roomDesignPropKind } : {}),
    ...(options.locationEffect ? { locationEffect: true } : {}),
    ...(options.locationEffectPlacementId
      ? { locationEffectPlacementId: options.locationEffectPlacementId }
      : {}),
    ...(options.locationEffectComponentId
      ? { locationEffectComponentId: options.locationEffectComponentId }
      : {}),
    ...(options.locationEffectComponentTitle
      ? { locationEffectComponentTitle: options.locationEffectComponentTitle }
      : {}),
    ...(options.locationEffectSlotId
      ? { locationEffectSlotId: options.locationEffectSlotId }
      : {}),
    ...(options.locationEffectVisualCue
      ? { locationEffectVisualCue: options.locationEffectVisualCue }
      : {}),
    ...(options.locationEffectProvenance
      ? { locationEffectProvenance: options.locationEffectProvenance }
      : {}),
  };
}

export function addPlannedProp(
  props,
  region,
  config,
  reservedCells,
  plan,
  index,
) {
  const target =
    plan.cell || targetCellByRatio(region, plan.rx ?? 0.5, plan.ry ?? 0.5);
  const cell = findClosestPropCell(region, target, reservedCells);
  if (!cell) return index;
  reservePropCell(reservedCells, cell);
  props.push(makeProp(region, plan.kind, cell, config, index, plan));
  return index + 1;
}

function placementToRatio(placement = "center", index = 0) {
  const normalized = String(placement || "center").trim().toLowerCase();
  if (normalized === "far-wall" || normalized === "north-wall") return { rx: 0.5, ry: 0.18 };
  if (normalized === "near-wall" || normalized === "south-wall") return { rx: 0.5, ry: 0.82 };
  if (normalized === "east-wall") return { rx: 0.82, ry: 0.5 };
  if (normalized === "west-wall") return { rx: 0.18, ry: 0.5 };
  if (normalized === "corner") {
    return [
      { rx: 0.22, ry: 0.22 },
      { rx: 0.78, ry: 0.22 },
      { rx: 0.22, ry: 0.78 },
      { rx: 0.78, ry: 0.78 },
    ][index % 4];
  }
  if (normalized === "near-center") return { rx: 0.5, ry: 0.58 };
  if (normalized === "random") {
    return [
      { rx: 0.36, ry: 0.36 },
      { rx: 0.64, ry: 0.36 },
      { rx: 0.36, ry: 0.64 },
      { rx: 0.64, ry: 0.64 },
    ][index % 4];
  }
  return { rx: 0.5, ry: 0.5 };
}

function normalizeLocationEffectPropKind(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === "clue-marker" || normalized === "clue") return "clue-marker";
  if (normalized === "anomaly" || normalized === "anomaly-marker" || normalized === "visible-anomaly") {
    return "clue-marker";
  }
  if (normalized === "reward" || normalized === "reward-marker") return "chest";
  return normalized;
}

function createLocationEffectPropPlan(region) {
  const placements = Array.isArray(region.componentPlacements)
    ? region.componentPlacements
    : Array.isArray(region.requestMetadata?.componentPlacements)
      ? region.requestMetadata.componentPlacements
      : [];

  return placements
    .map((placement, index) => {
      const kind = normalizeLocationEffectPropKind(
        placement.propKind ||
          placement.markerKind ||
          placement.effect?.render?.propKind ||
          placement.effect?.render?.markerKind,
      );
      if (!kind) return null;
      const ratio = placementToRatio(placement.effect?.render?.placement || "center", index);
      return {
        kind,
        rx: ratio.rx,
        ry: ratio.ry,
        rotation: 0,
        sizeScale: kind === "chest" ? 0.86 : 0.72,
        locationEffect: true,
        locationEffectPlacementId: placement.id,
        locationEffectComponentId: placement.componentId,
        locationEffectComponentTitle: placement.componentTitle,
        locationEffectSlotId: placement.slotId,
        locationEffectVisualCue: placement.visualCue,
        locationEffectProvenance: placement.provenance || {},
      };
    })
    .filter(Boolean);
}

function createRoomDesignRequiredPropPlan(region) {
  return getRoomDesignRequiredProps(region.roomDesign).map((prop, index) => {
    const ratio = placementToRatio(prop.placement, index);
    return {
      kind: normalizeRoomDesignPropKind(prop.kind),
      rx: ratio.rx,
      ry: ratio.ry,
      rotation: Number.isFinite(prop.rotation) ? prop.rotation : wallRotationForRatio(ratio.rx, ratio.ry, 0),
      sizeScale: prop.sizeScale || (prop.minRadiusCells ? Math.max(0.9, Math.min(1.8, prop.minRadiusCells / 1.5)) : 1),
      roomDesignRequired: true,
      roomDesignPropKind: prop.kind,
      signature: true,
      detailProfile: region.roomDesign?.detailProfile || region.shapeOptions?.detailProfile || "room-design",
    };
  });
}

function createRoomDesignModifierPropPlan(region) {
  const modifiers = getRoomDesignModifiers(region.roomDesign);
  const plan = [];
  const push = (modifier, item) => {
    plan.push({
      ...item,
      roomDesignModifier: modifier,
      detailProfile: region.roomDesign?.detailProfile || region.shapeOptions?.detailProfile || "room-design",
    });
  };

  if (modifiers.includes("central-void")) {
    push("central-void", { kind: "pit", rx: 0.5, ry: 0.5, rotation: 0, sizeScale: 1.08 });
  }
  if (modifiers.includes("pillared")) {
    [
      { rx: 0.24, ry: 0.24 },
      { rx: 0.76, ry: 0.24 },
      { rx: 0.24, ry: 0.76 },
      { rx: 0.76, ry: 0.76 },
    ].forEach((target) => push("pillared", { kind: "pillar", ...target, rotation: 0, sizeScale: 0.82 }));
  }
  if (modifiers.includes("partitioned")) {
    push("partitioned", { kind: "broken-wall", rx: 0.5, ry: 0.5, rotation: getRoomAxis(region) === "horizontal" ? 90 : 0, sizeScale: 0.98 });
  }
  if (modifiers.includes("side-alcoves")) {
    const axis = getRoomAxis(region);
    const rotation = axis === "horizontal" ? 0 : 90;
    push("side-alcoves", axis === "horizontal" ? { kind: "tomb", rx: 0.28, ry: 0.2, rotation } : { kind: "tomb", rx: 0.2, ry: 0.28, rotation });
    push("side-alcoves", axis === "horizontal" ? { kind: "tomb", rx: 0.72, ry: 0.8, rotation } : { kind: "tomb", rx: 0.8, ry: 0.72, rotation });
  }
  if (modifiers.includes("secret-recess")) {
    push("secret-recess", { kind: "chest", rx: 0.82, ry: 0.5, rotation: 0, sizeScale: 0.86 });
  }
  if (modifiers.includes("collapsed-edge")) {
    push("collapsed-edge", { kind: "rubble", rx: 0.28, ry: 0.28, rotation: 0, sizeScale: 1.0 });
    push("collapsed-edge", { kind: "crack", rx: 0.72, ry: 0.68, rotation: 0, sizeScale: 0.92 });
  }
  if (modifiers.includes("chamfered-corners")) {
    push("chamfered-corners", { kind: "pillar", rx: 0.5, ry: 0.5, rotation: 0, sizeScale: 0.78 });
  }

  return plan;
}

function getRoomDesignModifierPropCount(regionOrDesign = null) {
  const roomDesign = regionOrDesign?.roomDesign || regionOrDesign;
  const modifiers = getRoomDesignModifiers(roomDesign);
  let count = 0;
  if (modifiers.includes("central-void")) count += 1;
  if (modifiers.includes("pillared")) count += 4;
  if (modifiers.includes("partitioned")) count += 1;
  if (modifiers.includes("side-alcoves")) count += 2;
  if (modifiers.includes("secret-recess")) count += 1;
  if (modifiers.includes("collapsed-edge")) count += 2;
  if (modifiers.includes("chamfered-corners")) count += 1;
  return count;
}

function mergeRoomDesignRequiredProps(required = [], modifierProps = [], base = [], budget = 0) {
  const protectedItems = [...required, ...modifierProps];
  if (!protectedItems.length) return base.slice(0, budget);
  const seen = new Set(protectedItems.map((item) => `${item.kind}:${item.rx}:${item.ry}`));
  const merged = [
    ...protectedItems,
    ...base.filter((item) => !seen.has(`${item.kind}:${item.rx}:${item.ry}`)),
  ];
  return merged.slice(0, Math.max(budget, protectedItems.length));
}

export function wallRotationForRatio(rx, ry, fallback = 0) {
  if (rx <= 0.22) return 90;
  if (rx >= 0.78) return 90;
  if (ry <= 0.22) return 0;
  if (ry >= 0.78) return 0;
  return fallback;
}

export function createChapelPropPlan(region, flags, budget) {
  const role = getPlacementRole(region);
  const axis = getRoomAxis(region);
  const alongRotation = axis === "horizontal" ? 0 : 90;
  const crossRotation = axis === "horizontal" ? 90 : 0;

  if (role === "connector") {
    const longCells =
      axis === "horizontal" ? region.cellRect.w : region.cellRect.h;
    const crossCells =
      axis === "horizontal" ? region.cellRect.h : region.cellRect.w;
    const rowCount = crossCells >= 5 ? 2 : 1;
    const columns = clamp(Math.floor((longCells - 2) / 2), 2, 6);
    const plan = [];
    for (let column = 0; column < columns; column += 1) {
      const t =
        columns === 1 ? 0.5 : 0.18 + column * (0.64 / Math.max(1, columns - 1));
      const lanes = rowCount === 2 ? [0.34, 0.66] : [0.5];
      lanes.forEach((lane) => {
        plan.push(
          axis === "horizontal"
            ? {
                kind: "pew",
                rx: t,
                ry: lane,
                rotation: alongRotation,
                sizeScale: 1.08,
              }
            : {
                kind: "pew",
                rx: lane,
                ry: t,
                rotation: alongRotation,
                sizeScale: 1.08,
              },
        );
      });
    }
    return plan.slice(0, budget);
  }

  if (role === "final" || flags.outcome || flags.ritual) {
    const plan = [
      {
        kind: "altar",
        rx: axis === "horizontal" ? 0.76 : 0.5,
        ry: axis === "horizontal" ? 0.5 : 0.76,
        rotation: crossRotation,
        sizeScale: 1.12,
      },
      { kind: "pillar", rx: 0.26, ry: 0.24, rotation: 0 },
      { kind: "pillar", rx: 0.26, ry: 0.76, rotation: 0 },
      { kind: "statue", rx: 0.48, ry: 0.22, rotation: 0 },
      { kind: "statue", rx: 0.48, ry: 0.78, rotation: 0 },
      { kind: "pillar", rx: 0.68, ry: 0.24, rotation: 0 },
      { kind: "pillar", rx: 0.68, ry: 0.76, rotation: 0 },
    ];
    return plan.slice(0, budget);
  }

  if (flags.archive) {
    return [
      { kind: "shelf", rx: 0.14, ry: 0.3, rotation: 90 },
      { kind: "shelf", rx: 0.14, ry: 0.7, rotation: 90 },
      { kind: "shelf", rx: 0.86, ry: 0.3, rotation: 90 },
      { kind: "shelf", rx: 0.86, ry: 0.7, rotation: 90 },
      { kind: "scroll-table", rx: 0.5, ry: 0.5, rotation: 0 },
    ].slice(0, budget);
  }

  if (flags.crypt || role === "secret") {
    return createCryptPropPlan(
      region,
      { ...flags, crypt: true },
      budget,
      createSeededRng(hashStringToSeed(region.id, "chapel-crypt-props")),
    );
  }

  if (role === "entrance") {
    return [
      { kind: "statue", rx: 0.5, ry: 0.5, rotation: 0 },
      { kind: "pillar", rx: 0.25, ry: 0.5, rotation: 0 },
      { kind: "pillar", rx: 0.75, ry: 0.5, rotation: 0 },
    ].slice(0, budget);
  }

  return [
    { kind: "pillar", rx: 0.28, ry: 0.28, rotation: 0 },
    { kind: "pillar", rx: 0.72, ry: 0.28, rotation: 0 },
    { kind: "pillar", rx: 0.28, ry: 0.72, rotation: 0 },
    { kind: "pillar", rx: 0.72, ry: 0.72, rotation: 0 },
  ].slice(0, budget);
}

export function createNobleHousePropPlan(region, flags, budget) {
  const role = getPlacementRole(region);
  if (flags.archive || role === "secret") {
    return [
      { kind: "shelf", rx: 0.14, ry: 0.5, rotation: 90 },
      { kind: "shelf", rx: 0.86, ry: 0.5, rotation: 90 },
      { kind: "desk", rx: 0.5, ry: 0.72, rotation: 0 },
      { kind: "chest", rx: 0.82, ry: 0.18, rotation: 0 },
    ].slice(0, budget);
  }
  if (flags.kitchen) {
    return [
      { kind: "table", rx: 0.5, ry: 0.5, rotation: 0, sizeScale: 1.08 },
      { kind: "shelf", rx: 0.15, ry: 0.5, rotation: 90 },
      { kind: "shelf", rx: 0.85, ry: 0.5, rotation: 90 },
    ].slice(0, budget);
  }
  if (flags.clue) {
    return [
      { kind: "desk", rx: 0.5, ry: 0.2, rotation: 0 },
      { kind: "shelf", rx: 0.14, ry: 0.55, rotation: 90 },
      { kind: "chest", rx: 0.78, ry: 0.78, rotation: 0 },
    ].slice(0, budget);
  }
  if (role === "entrance") {
    return [
      { kind: "fireplace", rx: 0.5, ry: 0.16, rotation: 0 },
      { kind: "statue", rx: 0.18, ry: 0.72, rotation: 0 },
      { kind: "statue", rx: 0.82, ry: 0.72, rotation: 0 },
    ].slice(0, budget);
  }
  if (role === "final") {
    return [
      { kind: "table", rx: 0.5, ry: 0.5, rotation: 0, sizeScale: 1.16 },
      { kind: "fireplace", rx: 0.5, ry: 0.16, rotation: 0 },
      { kind: "chest", rx: 0.82, ry: 0.78, rotation: 0 },
    ].slice(0, budget);
  }
  if (flags.hazard || flags.ruined) {
    return [
      { kind: "rubble", rx: 0.35, ry: 0.42, rotation: 0 },
      { kind: "crack", rx: 0.68, ry: 0.62, rotation: 0 },
    ].slice(0, budget);
  }
  return [
    { kind: "bed", rx: 0.18, ry: 0.5, rotation: 0 },
    { kind: "chest", rx: 0.78, ry: 0.78, rotation: 0 },
    { kind: "table", rx: 0.58, ry: 0.42, rotation: 0 },
  ].slice(0, budget);
}

export function createMinePropPlan(region, flags, budget) {
  const axis = getRoomAxis(region);
  const alongRotation = axis === "horizontal" ? 0 : 90;
  const longCells =
    axis === "horizontal" ? region.cellRect.w : region.cellRect.h;
  const railCount = clamp(Math.floor(longCells / 2), 2, Math.min(7, budget));
  const plan = [];

  if (flags.vertical) {
    plan.push({ kind: "pit", rx: 0.5, ry: 0.5, rotation: 0, sizeScale: 1.15 });
  }

  if (!(flags.hazard || flags.ruined)) {
    for (let index = 0; index < railCount; index += 1) {
      const t =
        railCount === 1
          ? 0.5
          : 0.16 + index * (0.68 / Math.max(1, railCount - 1));
      plan.push(
        axis === "horizontal"
          ? {
              kind: "mine-rail",
              rx: t,
              ry: 0.5,
              rotation: alongRotation,
              sizeScale: 1.12,
            }
          : {
              kind: "mine-rail",
              rx: 0.5,
              ry: t,
              rotation: alongRotation,
              sizeScale: 1.12,
            },
      );
    }
  }

  const supportCount = clamp(Math.floor(longCells / 3), 2, 5);
  for (let index = 0; index < supportCount; index += 1) {
    const t =
      supportCount === 1
        ? 0.5
        : 0.2 + index * (0.6 / Math.max(1, supportCount - 1));
    if (axis === "horizontal") {
      plan.push({
        kind: "mine-support",
        rx: t,
        ry: 0.24,
        rotation: alongRotation,
      });
      if (budget > 5)
        plan.push({
          kind: "mine-support",
          rx: t,
          ry: 0.76,
          rotation: alongRotation,
        });
    } else {
      plan.push({
        kind: "mine-support",
        rx: 0.24,
        ry: t,
        rotation: alongRotation,
      });
      if (budget > 5)
        plan.push({
          kind: "mine-support",
          rx: 0.76,
          ry: t,
          rotation: alongRotation,
        });
    }
  }

  if (flags.hazard || flags.ruined) {
    plan.unshift(
      { kind: "rubble", rx: 0.5, ry: 0.5, rotation: 0, sizeScale: 1.15 },
      { kind: "crack", rx: 0.68, ry: 0.62, rotation: 0 },
    );
  }

  return plan.slice(0, budget);
}

export function createCavePropPlan(region, flags, budget, rng) {
  const base = [];
  if (flags.water)
    base.push({
      kind: "water",
      rx: 0.5,
      ry: 0.56,
      rotation: 0,
      sizeScale: 1.15,
    });
  if (flags.vertical)
    base.push({ kind: "pit", rx: 0.5, ry: 0.5, rotation: 0, sizeScale: 1.1 });
  if (flags.hazard || flags.ruined)
    base.push({ kind: "rubble", rx: 0.48, ry: 0.5, rotation: 0 });
  const organicTargets = [
    { rx: 0.32, ry: 0.34 },
    { rx: 0.68, ry: 0.36 },
    { rx: 0.42, ry: 0.72 },
    { rx: 0.72, ry: 0.68 },
    { rx: 0.24, ry: 0.62 },
  ];
  organicTargets.forEach((target, index) => {
    base.push({
      kind: rng() > 0.34 ? "stalagmite" : "water",
      ...target,
      rotation: randomInt(rng, 0, 3) * 90,
    });
  });
  return base.slice(0, budget);
}

export function createRuinsPropPlan(region, flags, budget) {
  if (flags.archive) {
    return [
      { kind: "shelf", rx: 0.18, ry: 0.5, rotation: 90 },
      { kind: "broken-wall", rx: 0.74, ry: 0.24, rotation: 0 },
      { kind: "scroll-table", rx: 0.52, ry: 0.58, rotation: 0 },
    ].slice(0, budget);
  }
  if (flags.ritual || flags.outcome) {
    return [
      { kind: "altar", rx: 0.5, ry: 0.52, rotation: 0 },
      { kind: "broken-wall", rx: 0.22, ry: 0.28, rotation: 0 },
      { kind: "rubble", rx: 0.78, ry: 0.72, rotation: 0 },
    ].slice(0, budget);
  }
  return [
    { kind: "broken-wall", rx: 0.28, ry: 0.18, rotation: 0 },
    { kind: "rubble", rx: 0.72, ry: 0.68, rotation: 0 },
    { kind: "crack", rx: 0.46, ry: 0.52, rotation: 0 },
    { kind: "broken-wall", rx: 0.78, ry: 0.28, rotation: 90 },
  ].slice(0, budget);
}


export function getRegionDetailProfile(region = {}) {
  return String(
    region.shapeOptions?.detailProfile ||
      region.shapeOptions?.archetypeId ||
      region.roomArchetype ||
      "",
  ).trim();
}

export function tagArchetypePropPlan(plan, profile) {
  return plan.map((item, index) => ({
    ...item,
    archetypeCue: profile,
    detailProfile: profile,
    archetypeSignature: index === 0 || Boolean(item.archetypeSignature),
  }));
}

export function createCryptArchetypePropPlan(region, budget, rng) {
  const profile = getRegionDetailProfile(region);
  const axis = getRoomAxis(region);
  const alongRotation = axis === "horizontal" ? 0 : 90;
  const crossRotation = axis === "horizontal" ? 90 : 0;

  if (profile === "bone-well") {
    return tagArchetypePropPlan([
      { kind: "bone-well-rim", rx: 0.5, ry: 0.5, rotation: 0, sizeScale: 1.2 },
      { kind: "bones", rx: 0.32, ry: 0.34, rotation: 0 },
      { kind: "bones", rx: 0.68, ry: 0.66, rotation: 90 },
      { kind: "pillar", rx: 0.5, ry: 0.22, rotation: 0 },
      { kind: "pillar", rx: 0.5, ry: 0.78, rotation: 0 },
    ].slice(0, budget), profile);
  }

  if (profile === "ossuary-gallery") {
    const count = clamp(budget, 1, 8);
    return tagArchetypePropPlan(Array.from({ length: count }, (_, index) => {
      const t = count === 1 ? 0.5 : 0.14 + index * (0.72 / Math.max(1, count - 1));
      const nearWall = index % 2 === 0;
      if (index === 0) {
        return axis === "horizontal"
          ? { kind: "ossuary-niche-row", rx: t, ry: nearWall ? 0.2 : 0.8, rotation: alongRotation, sizeScale: 0.94 }
          : { kind: "ossuary-niche-row", rx: nearWall ? 0.2 : 0.8, ry: t, rotation: alongRotation + 90, sizeScale: 0.94 };
      }
      return axis === "horizontal"
        ? {
            kind: index % 3 === 1 ? "tomb" : "bones",
            rx: t,
            ry: nearWall ? 0.22 : 0.78,
            rotation: alongRotation,
            sizeScale: 0.92,
          }
        : {
            kind: index % 3 === 1 ? "tomb" : "bones",
            rx: nearWall ? 0.22 : 0.78,
            ry: t,
            rotation: alongRotation,
            sizeScale: 0.92,
          };
    }), profile);
  }

  if (profile === "reliquary-niche") {
    return tagArchetypePropPlan([
      { kind: "reliquary-shrine", rx: 0.5, ry: 0.52, rotation: crossRotation, sizeScale: 0.92 },
      { kind: "statue", rx: 0.5, ry: 0.24, rotation: 0, sizeScale: 0.82 },
      { kind: "pillar", rx: 0.25, ry: 0.72, rotation: 0, sizeScale: 0.82 },
      { kind: "pillar", rx: 0.75, ry: 0.72, rotation: 0, sizeScale: 0.82 },
    ].slice(0, budget), profile);
  }

  if (profile === "hidden-reliquary") {
    return tagArchetypePropPlan([
      { kind: "hidden-relic-cache", rx: 0.58, ry: 0.52, rotation: crossRotation, sizeScale: 0.92 },
      { kind: "shelf", rx: 0.14, ry: 0.3, rotation: 90 },
      { kind: "shelf", rx: 0.14, ry: 0.7, rotation: 90 },
      { kind: "chest", rx: 0.76, ry: 0.28, rotation: 0 },
      { kind: "scroll-table", rx: 0.5, ry: 0.5, rotation: 0, sizeScale: 0.86 },
    ].slice(0, budget), profile);
  }

  if (profile === "charnel-vault") {
    return tagArchetypePropPlan([
      { kind: "charnel-heap", rx: 0.48, ry: 0.48, rotation: randomInt(rng, 0, 3) * 90, sizeScale: 1.16 },
      { kind: "bones", rx: 0.28, ry: 0.64, rotation: 0 },
      { kind: "rubble", rx: 0.68, ry: 0.34, rotation: 0 },
      { kind: "crack", rx: 0.72, ry: 0.72, rotation: 0 },
      { kind: "fog", rx: 0.36, ry: 0.28, rotation: 0, sizeScale: 0.9 },
    ].slice(0, budget), profile);
  }

  if (profile === "sealed-family-tomb") {
    return tagArchetypePropPlan([
      { kind: "sealed-tomb-slab", rx: 0.5, ry: 0.5, rotation: alongRotation, sizeScale: 1.16 },
      { kind: "statue", rx: 0.24, ry: 0.28, rotation: 0, sizeScale: 0.82 },
      { kind: "statue", rx: 0.76, ry: 0.28, rotation: 0, sizeScale: 0.82 },
      { kind: "pillar", rx: 0.24, ry: 0.76, rotation: 0, sizeScale: 0.82 },
      { kind: "pillar", rx: 0.76, ry: 0.76, rotation: 0, sizeScale: 0.82 },
    ].slice(0, budget), profile);
  }

  if (profile === "processional-crypt-hall") {
    const longCount = clamp(Math.floor((axis === "horizontal" ? region.cellRect.w : region.cellRect.h) / 3), 2, 5);
    const plan = [];
    for (let index = 0; index < longCount; index += 1) {
      const t = longCount === 1 ? 0.5 : 0.18 + index * (0.64 / Math.max(1, longCount - 1));
      if (axis === "horizontal") {
        plan.push({ kind: "pillar", rx: t, ry: 0.28, rotation: 0, sizeScale: 0.82 });
        plan.push({ kind: "pillar", rx: t, ry: 0.72, rotation: 0, sizeScale: 0.82 });
      } else {
        plan.push({ kind: "pillar", rx: 0.28, ry: t, rotation: 0, sizeScale: 0.82 });
        plan.push({ kind: "pillar", rx: 0.72, ry: t, rotation: 0, sizeScale: 0.82 });
      }
    }
    plan.unshift({ kind: "processional-axis", rx: 0.5, ry: 0.5, rotation: alongRotation, sizeScale: 1.18 });
    if (budget > plan.length) plan.push({ kind: "bones", rx: 0.5, ry: 0.5, rotation: alongRotation, sizeScale: 0.9 });
    return tagArchetypePropPlan(plan.slice(0, budget), profile);
  }

  if (profile === "burial-cell" || profile === "crypt-burial-cell") {
    return tagArchetypePropPlan([
      { kind: "burial-slab", rx: 0.5, ry: 0.5, rotation: alongRotation, sizeScale: 1.04 },
      { kind: "bones", rx: 0.28, ry: 0.5, rotation: 0, sizeScale: 0.86 },
      { kind: "pillar", rx: 0.78, ry: 0.5, rotation: 0, sizeScale: 0.8 },
    ].slice(0, budget), profile);
  }

  return null;
}

export function createCryptPropPlan(region, flags, budget, rng) {
  const role = getPlacementRole(region);
  const archetypePlan = createCryptArchetypePropPlan(region, budget, rng);
  if (archetypePlan) return archetypePlan;

  const area = Math.max(
    1,
    region.floorCells?.length || region.cellRect.w * region.cellRect.h,
  );
  const axis = getRoomAxis(region);
  const largeCryptRoom =
    area >= 28 || region.cellRect.w >= 7 || region.cellRect.h >= 6;

  if (flags.archive) {
    const plan = [
      { kind: "shelf", rx: 0.14, ry: 0.24, rotation: 90 },
      { kind: "shelf", rx: 0.14, ry: 0.5, rotation: 90 },
      { kind: "shelf", rx: 0.14, ry: 0.76, rotation: 90 },
      { kind: "shelf", rx: 0.86, ry: 0.24, rotation: 90 },
      { kind: "shelf", rx: 0.86, ry: 0.5, rotation: 90 },
      { kind: "shelf", rx: 0.86, ry: 0.76, rotation: 90 },
      { kind: "scroll-table", rx: 0.5, ry: 0.5, rotation: 0 },
    ];
    return plan.slice(0, budget);
  }

  if (flags.crypt || role === "final" || role === "secret") {
    if (!largeCryptRoom) {
      return [
        {
          kind: "tomb",
          rx: 0.5,
          ry: 0.5,
          rotation: axis === "horizontal" ? 0 : 90,
          sizeScale: 1.04,
        },
        { kind: "bones", rx: 0.28, ry: 0.5, rotation: 0 },
        { kind: "pillar", rx: 0.78, ry: 0.5, rotation: 0 },
      ].slice(0, budget);
    }

    const plan = [];
    const longCells =
      axis === "horizontal" ? region.cellRect.w : region.cellRect.h;
    const tombPairs = clamp(
      Math.floor(longCells / 2),
      2,
      Math.min(5, Math.floor(budget / 2) + 1),
    );
    for (let index = 0; index < tombPairs; index += 1) {
      const t =
        tombPairs === 1
          ? 0.5
          : 0.18 + index * (0.64 / Math.max(1, tombPairs - 1));
      if (axis === "horizontal") {
        plan.push({
          kind: "tomb",
          rx: t,
          ry: 0.22,
          rotation: 0,
          sizeScale: 0.96,
        });
        plan.push({
          kind: "tomb",
          rx: t,
          ry: 0.78,
          rotation: 0,
          sizeScale: 0.96,
        });
      } else {
        plan.push({
          kind: "tomb",
          rx: 0.22,
          ry: t,
          rotation: 90,
          sizeScale: 0.96,
        });
        plan.push({
          kind: "tomb",
          rx: 0.78,
          ry: t,
          rotation: 90,
          sizeScale: 0.96,
        });
      }
    }
    plan.push({
      kind: "bones",
      rx: 0.5,
      ry: 0.5,
      rotation: randomInt(rng, 0, 3) * 90,
    });
    if (budget > 8) {
      plan.push({ kind: "pillar", rx: 0.5, ry: 0.28, rotation: 0 });
      plan.push({ kind: "pillar", rx: 0.5, ry: 0.72, rotation: 0 });
    }
    return plan.slice(0, budget);
  }

  if (flags.vertical)
    return [
      { kind: "pit", rx: 0.5, ry: 0.5, rotation: 0, sizeScale: 1.1 },
    ].slice(0, budget);
  if (flags.fog)
    return [
      { kind: "fog", rx: 0.5, ry: 0.5, rotation: 0, sizeScale: 1.2 },
    ].slice(0, budget);
  if (flags.hazard || flags.ruined) {
    return [
      { kind: "rubble", rx: 0.44, ry: 0.52, rotation: 0 },
      { kind: "crack", rx: 0.68, ry: 0.62, rotation: 0 },
      { kind: "bones", rx: 0.25, ry: 0.42, rotation: 0 },
    ].slice(0, budget);
  }
  return Array.from({ length: budget }, (_, index) => ({
    kind: chooseContentAwarePropKind(region, flags, index, rng, "crypt"),
    rx: 0.24 + (index % 3) * 0.26,
    ry: 0.28 + Math.floor(index / 3) * 0.22,
    rotation: wallRotationForRatio(
      0.24 + (index % 3) * 0.26,
      0.28 + Math.floor(index / 3) * 0.22,
      0,
    ),
  }));
}

export function createPropLayoutPlan(region, flags, budget, rng, contextKey) {
  if (budget <= 0) return [];
  const required = createRoomDesignRequiredPropPlan(region);
  const modifierProps = createRoomDesignModifierPropPlan(region);
  let base = [];
  if (contextKey === "chapel")
    base = createChapelPropPlan(region, flags, budget, rng);
  else if (contextKey === "noble-house")
    base = createNobleHousePropPlan(region, flags, budget, rng);
  else if (contextKey === "mine")
    base = createMinePropPlan(region, flags, budget, rng);
  else if (contextKey === "cave")
    base = createCavePropPlan(region, flags, budget, rng);
  else if (contextKey === "ruins")
    base = createRuinsPropPlan(region, flags, budget, rng);
  else base = createCryptPropPlan(region, flags, budget, rng);
  return mergeRoomDesignRequiredProps(required, modifierProps, base, budget);
}

export function createProps(generatedMap) {
  const { regions, config } = generatedMap;
  const contextKey = getContextKey(config.context || config.biome);
  const props = [];
  regions.forEach((region) => {
    const flags = getRegionSemanticFlags(region);
    const rng = createSeededRng(
      hashStringToSeed(config.seed, region.id, "content-props"),
    );
    const budget = Math.max(
      getPropBudget(region, flags, contextKey),
      getRoomDesignRequiredPropCount(region) + getRoomDesignModifierPropCount(region),
    );
    const reservedCells = new Set();
    const locationEffectPlan = createLocationEffectPropPlan(region);
    const plan = [
      ...locationEffectPlan,
      ...createPropLayoutPlan(region, flags, budget, rng, contextKey),
    ];
    let index = 0;
    plan.forEach((item) => {
      index = addPlannedProp(props, region, config, reservedCells, item, index);
    });
  });
  return props;
}
