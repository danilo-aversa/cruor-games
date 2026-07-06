import { getCircleGeometryFromRegion } from "./map-generator.mask.js";

export function normalizeCircleAnchorAngle(angle) {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

export function isCircleAnchorAngleInsideIntervals(angle, intervals) {
  if (!Array.isArray(intervals) || intervals.length === 0) return true;
  const normalized = normalizeCircleAnchorAngle(angle);
  return intervals.some((interval) => {
    const start = normalizeCircleAnchorAngle(interval.start);
    const end = normalizeCircleAnchorAngle(interval.end);
    if (start <= end) return normalized >= start && normalized <= end;
    return normalized >= start || normalized <= end;
  });
}

export function getCircleAnchorSideFromNormal(normal, fallback = "east") {
  if (!normal) return fallback;
  const x = Number.isFinite(normal.x) ? normal.x : 0;
  const y = Number.isFinite(normal.y) ? normal.y : 0;
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  // On near-diagonal circular cells, prefer the vertical exit. A horizontal
  // tie makes bottom/top anchors run sideways inside the circular room before
  // leaving it, which produces the visible raccordo intrusion reported in the
  // editor.
  if (absY >= absX * 0.82 && absY > 0) return y >= 0 ? "south" : "north";
  if (absX > 0) return x >= 0 ? "east" : "west";
  return fallback;
}

export function getCircleAnchorAxialNormal(side) {
  if (side === "west") return { x: -1, y: 0 };
  if (side === "south") return { x: 0, y: 1 };
  if (side === "north") return { x: 0, y: -1 };
  return { x: 1, y: 0 };
}

export function getCircleAnchorCellCenter(cell, gridSize) {
  return {
    x: (cell.x + 0.5) * gridSize,
    y: (cell.y + 0.5) * gridSize,
  };
}

export function isPointInsideCircleGeometry(point, circle, tolerance = 0) {
  if (!point || !circle) return false;
  return Math.hypot(point.x - circle.cx, point.y - circle.cy) < circle.r - tolerance;
}

export function isCircleAnchorCellInsideVisualCircle(
  cell,
  circle,
  gridSize,
  tolerance = 0,
) {
  if (!cell || !circle) return false;
  return isPointInsideCircleGeometry(
    getCircleAnchorCellCenter(cell, gridSize),
    circle,
    tolerance,
  );
}


function getCellRectBounds(cell, gridSize) {
  return {
    minX: cell.x * gridSize,
    minY: cell.y * gridSize,
    maxX: (cell.x + 1) * gridSize,
    maxY: (cell.y + 1) * gridSize,
  };
}

function getDistanceFromPointToCellRect(point, cell, gridSize) {
  if (!point || !cell) return Number.POSITIVE_INFINITY;
  const rect = getCellRectBounds(cell, gridSize);
  const dx = Math.max(rect.minX - point.x, 0, point.x - rect.maxX);
  const dy = Math.max(rect.minY - point.y, 0, point.y - rect.maxY);
  return Math.hypot(dx, dy);
}

function getDistanceFromCircleCenterToCellRect(cell, circle, gridSize) {
  return getDistanceFromPointToCellRect(
    { x: circle.cx, y: circle.cy },
    cell,
    gridSize,
  );
}

function getMaxDistanceFromCircleCenterToCellRect(cell, circle, gridSize) {
  if (!cell || !circle) return Number.NEGATIVE_INFINITY;
  const rect = getCellRectBounds(cell, gridSize);
  return Math.max(
    Math.hypot(rect.minX - circle.cx, rect.minY - circle.cy),
    Math.hypot(rect.maxX - circle.cx, rect.minY - circle.cy),
    Math.hypot(rect.minX - circle.cx, rect.maxY - circle.cy),
    Math.hypot(rect.maxX - circle.cx, rect.maxY - circle.cy),
  );
}

export function doesCircleAnchorCellTouchVisualCircle(
  cell,
  circle,
  gridSize,
  tolerance = 0.01,
) {
  if (!cell || !circle) return false;
  const minDistance = getDistanceFromCircleCenterToCellRect(
    cell,
    circle,
    gridSize,
  );
  const maxDistance = getMaxDistanceFromCircleCenterToCellRect(
    cell,
    circle,
    gridSize,
  );
  // A valid circular portal is any grid square crossed by the circle outline.
  // The center may legitimately be inside the visual circle on diagonal/near-
  // cardinal cells, so center-based outside checks make snap points disappear.
  return minDistance < circle.r - tolerance && maxDistance >= circle.r - tolerance;
}

export function getCircleAnchorRoutingCell(anchor) {
  if (!anchor) return null;
  if (anchor.routingOutsideCell) {
    return { x: anchor.routingOutsideCell.x, y: anchor.routingOutsideCell.y };
  }
  if (anchor.expandedCircleDoor && anchor.outsideCell) {
    return { x: anchor.outsideCell.x, y: anchor.outsideCell.y };
  }
  if (anchor.circleBoundaryAnchor && anchor.outsideCell && anchor.normal) {
    return {
      x: anchor.outsideCell.x + anchor.normal.x,
      y: anchor.outsideCell.y + anchor.normal.y,
    };
  }
  return anchor.outsideCell
    ? { x: anchor.outsideCell.x, y: anchor.outsideCell.y }
    : null;
}

function getCircleAnchorTangentSegment(point, radial, gridSize) {
  if (!point || !radial) return null;
  const length = Math.hypot(radial.x, radial.y) || 1;
  const tangent = { x: -radial.y / length, y: radial.x / length };
  const half = gridSize * 0.42;
  return {
    x1: point.x - tangent.x * half,
    y1: point.y - tangent.y * half,
    x2: point.x + tangent.x * half,
    y2: point.y + tangent.y * half,
  };
}

function roundRadialComponent(value) {
  return Math.round(value * 1e12) / 1e12;
}

function getRadialFromPoint(point, circle) {
  if (!point || !circle) return null;
  const dx = point.x - circle.cx;
  const dy = point.y - circle.cy;
  const length = Math.hypot(dx, dy);
  if (!Number.isFinite(length) || length <= 0.0001) return { x: 1, y: 0 };
  return {
    x: roundRadialComponent(dx / length),
    y: roundRadialComponent(dy / length),
  };
}

function getCirclePerimeterPoint(circle, radial, outwardOffset = 0) {
  return {
    x: circle.cx + radial.x * (circle.r + outwardOffset),
    y: circle.cy + radial.y * (circle.r + outwardOffset),
  };
}

function scorePortalCellForRadial(portalCell, radial, circle, gridSize) {
  const center = getCircleAnchorCellCenter(portalCell, gridSize);
  const candidateRadial = getRadialFromPoint(center, circle);
  const projectedPoint = getCirclePerimeterPoint(circle, radial);
  const rectDistance = getDistanceFromPointToCellRect(
    projectedPoint,
    portalCell,
    gridSize,
  );
  const angularPenalty = Math.max(
    0,
    1 - (candidateRadial.x * radial.x + candidateRadial.y * radial.y),
  );
  return rectDistance * rectDistance + angularPenalty * gridSize * gridSize * 1.25;
}

function getProjectedCircleAnchorOutsideCell(circle, radial, gridSize) {
  if (!circle || !radial) return null;
  const point = getCirclePerimeterPoint(circle, radial, -gridSize * 0.01);
  return {
    x: Math.floor(point.x / gridSize),
    y: Math.floor(point.y / gridSize),
  };
}

function scoreCircleDragAnchor(anchor, radial, projectedCell, circle, gridSize) {
  if (!anchor) return Number.POSITIVE_INFINITY;
  const snapCell = anchor.snapCell || anchor.routingOutsideCell || anchor.outsideCell;
  const portalScore = scorePortalCellForRadial(
    anchor.outsideCell,
    radial,
    circle,
    gridSize,
  );
  const cellDx = projectedCell ? snapCell.x - projectedCell.x : 0;
  const cellDy = projectedCell ? snapCell.y - projectedCell.y : 0;
  const cellPenalty =
    (cellDx * cellDx + cellDy * cellDy) * gridSize * gridSize * 3.2;
  return portalScore + cellPenalty;
}

function isCirclePortalCellUsable(cell, circle, gridSize) {
  return doesCircleAnchorCellTouchVisualCircle(cell, circle, gridSize);
}

function getCircleSnapSideAndNormal(snapCell, circle, gridSize, fallbackRadial = null) {
  const center = getCircleAnchorCellCenter(snapCell, gridSize);
  const radial = getRadialFromPoint(center, circle) || fallbackRadial || { x: 1, y: 0 };
  const side = getCircleAnchorSideFromNormal(radial, "east");
  return { side, normal: getCircleAnchorAxialNormal(side), radial };
}

function getCircleAnchorCellPath(start, goal) {
  if (!start || !goal) return [];
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

function isCircleAnchorCellInsideVisualCircle(cell, circle, gridSize) {
  if (!cell || !circle) return false;
  return getMaxDistanceFromCircleCenterToCellRect(cell, circle, gridSize) < circle.r - 0.01;
}

function scoreCircleAnchorPlacement(placement, snapCell, snapRadial, circle, gridSize) {
  if (!placement?.portalCell || !placement?.routingOutsideCell)
    return Number.POSITIVE_INFINITY;
  const bridgePath = getCircleAnchorCellPath(
    placement.portalCell,
    placement.routingOutsideCell,
  );
  const intrusionCount = bridgePath
    .slice(1)
    .filter((cell) => isCircleAnchorCellInsideVisualCircle(cell, circle, gridSize))
    .length;
  const snapDistance = Math.abs(placement.routingOutsideCell.x - snapCell.x) +
    Math.abs(placement.routingOutsideCell.y - snapCell.y);
  const radialDot = Math.max(
    -1,
    Math.min(
      1,
      (snapRadial?.x || 0) * placement.normal.x +
        (snapRadial?.y || 0) * placement.normal.y,
    ),
  );
  const verticalTieBonus =
    Math.abs(Math.abs(snapRadial?.x || 0) - Math.abs(snapRadial?.y || 0)) < 0.24 &&
    placement.normal.y !== 0
      ? -1.8
      : 0;
  return (
    intrusionCount * 100 +
    Math.max(0, 1 - radialDot) * 16 +
    snapDistance * 6 +
    bridgePath.length * 1.4 +
    verticalTieBonus
  );
}

function chooseCircleAnchorPlacementForSnapCell(
  snapCell,
  circle,
  gridSize,
  snapRadial,
) {
  const sides = ["north", "south", "east", "west"];
  const candidates = sides
    .map((side) => {
      const normal = getCircleAnchorAxialNormal(side);
      const radialDot = (snapRadial?.x || 0) * normal.x + (snapRadial?.y || 0) * normal.y;
      if (radialDot < -0.12) return null;
      const portalCell = getCirclePortalCellForSnapCell(
        snapCell,
        circle,
        gridSize,
        normal,
      );
      if (!portalCell) return null;
      const routingOutsideCell = isCirclePortalCellUsable(snapCell, circle, gridSize)
        ? getCircleRoutingCellForPortalCell(portalCell, circle, gridSize, normal)
        : snapCell;
      if (!routingOutsideCell) return null;
      return {
        side,
        normal,
        portalCell,
        routingOutsideCell,
        score: scoreCircleAnchorPlacement(
          { side, normal, portalCell, routingOutsideCell },
          snapCell,
          snapRadial,
          circle,
          gridSize,
        ),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score);
  return candidates[0] || null;
}

function getCirclePortalCellForSnapCell(snapCell, circle, gridSize, normal) {
  if (!snapCell || !circle || !normal) return null;
  for (let step = 0; step <= 6; step += 1) {
    const cell = {
      x: snapCell.x - normal.x * step,
      y: snapCell.y - normal.y * step,
    };
    if (isCirclePortalCellUsable(cell, circle, gridSize)) return cell;
  }
  return null;
}

function getCircleRoutingCellForPortalCell(portalCell, circle, gridSize, normal) {
  if (!portalCell || !normal) return null;
  for (let step = 1; step <= 4; step += 1) {
    const cell = {
      x: portalCell.x + normal.x * step,
      y: portalCell.y + normal.y * step,
    };
    const minDistance = getDistanceFromCircleCenterToCellRect(
      cell,
      circle,
      gridSize,
    );
    if (minDistance >= circle.r - 0.01) return cell;
  }
  return {
    x: portalCell.x + normal.x,
    y: portalCell.y + normal.y,
  };
}

export function createCircleConnectionAnchorFromOutsideCell(
  region,
  circle,
  outsideCell,
  gridSize,
  index = 0,
) {
  if (!region || !circle || !outsideCell) return null;

  const snapCell = { x: outsideCell.x, y: outsideCell.y };
  const snapMaxDistance = getMaxDistanceFromCircleCenterToCellRect(
    snapCell,
    circle,
    gridSize,
  );
  if (snapMaxDistance < circle.r - 0.01) return null;

  const snapCenter = getCircleAnchorCellCenter(snapCell, gridSize);
  const snapDistanceFromCenter = Math.hypot(
    snapCenter.x - circle.cx,
    snapCenter.y - circle.cy,
  );
  if (snapDistanceFromCenter > circle.r + gridSize * 1.75) return null;

  const { radial: snapRadial } = getCircleSnapSideAndNormal(
    snapCell,
    circle,
    gridSize,
  );
  const placement = chooseCircleAnchorPlacementForSnapCell(
    snapCell,
    circle,
    gridSize,
    snapRadial,
  );
  if (!placement) return null;

  const { side, normal, portalCell, routingOutsideCell } = placement;
  const portalCenter = getCircleAnchorCellCenter(portalCell, gridSize);
  const radial = snapRadial || getRadialFromPoint(portalCenter, circle);
  if (!radial) return null;

  const point = getCirclePerimeterPoint(circle, radial);
  const segment = getCircleAnchorTangentSegment(point, radial, gridSize);
  const angle = normalizeCircleAnchorAngle(Math.atan2(radial.y, radial.x));

  return {
    regionId: region.id,
    regionShape: region.shape,
    side,
    cell: { x: portalCell.x, y: portalCell.y },
    snapCell: { x: snapCell.x, y: snapCell.y },
    outsideCell: { x: routingOutsideCell.x, y: routingOutsideCell.y },
    portalRoomCell: { x: portalCell.x, y: portalCell.y },
    routingOutsideCell: { x: routingOutsideCell.x, y: routingOutsideCell.y },
    normal,
    circular: {
      cx: circle.cxCells,
      cy: circle.cyCells,
      r: circle.rCells,
      normal: radial,
    },
    finalGeometry: true,
    circleBoundaryAnchor: true,
    finalBoundaryIndex: Math.round((angle / (Math.PI * 2)) * 10000) + index,
    segment,
    point,
    snapGridQuantized: true,
  };
}

export function createCircleConnectionAnchorCandidates(
  region,
  circle,
  gridSize,
  options = {},
) {
  if (!region || !circle) return [];
  const intervals = Array.isArray(options.angleIntervals)
    ? options.angleIntervals
    : [];
  const minX = Math.floor((circle.cx - circle.r - gridSize * 1.5) / gridSize);
  const maxX = Math.ceil((circle.cx + circle.r + gridSize * 1.5) / gridSize);
  const minY = Math.floor((circle.cy - circle.r - gridSize * 1.5) / gridSize);
  const maxY = Math.ceil((circle.cy + circle.r + gridSize * 1.5) / gridSize);
  const anchors = [];
  const seen = new Set();

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const outsideCell = { x, y };
      const center = getCircleAnchorCellCenter(outsideCell, gridSize);
      const angle = normalizeCircleAnchorAngle(
        Math.atan2(center.y - circle.cy, center.x - circle.cx),
      );
      if (!isCircleAnchorAngleInsideIntervals(angle, intervals)) continue;
      const anchor = createCircleConnectionAnchorFromOutsideCell(
        region,
        circle,
        outsideCell,
        gridSize,
        anchors.length,
      );
      if (!anchor) continue;
      const snapKey = anchor.snapCell || anchor.outsideCell;
      const key = `${anchor.side}:${snapKey.x}:${snapKey.y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      anchors.push(anchor);
    }
  }

  return anchors.sort((a, b) => (a.finalBoundaryIndex || 0) - (b.finalBoundaryIndex || 0));
}

export function createCircleDragAnchor(region, point, gridSize) {
  if (region?.shape !== "circle" || !point) return null;
  const circle = getCircleGeometryFromRegion(region, gridSize);
  if (!circle || !Number.isFinite(circle.r) || circle.r <= 0) return null;
  const radial = getRadialFromPoint(point, circle);
  if (!radial) return null;

  // First honor the square actually under the pointer. This makes circular
  // anchors snap like every other room handle: one reachable snap point per
  // valid grid square along the circumference. The radial fallback remains for
  // drags that happen slightly inside/outside the intended square.
  const pointerCell = {
    x: Math.floor(point.x / gridSize),
    y: Math.floor(point.y / gridSize),
  };
  const pointerAnchor = createCircleConnectionAnchorFromOutsideCell(
    region,
    circle,
    pointerCell,
    gridSize,
  );
  if (pointerAnchor) return pointerAnchor;

  const projectedCell = getProjectedCircleAnchorOutsideCell(
    circle,
    radial,
    gridSize,
  );
  const projectedAnchor = createCircleConnectionAnchorFromOutsideCell(
    region,
    circle,
    projectedCell,
    gridSize,
  );
  if (projectedAnchor) return projectedAnchor;

  const candidates = createCircleConnectionAnchorCandidates(
    region,
    circle,
    gridSize,
  );
  if (candidates.length === 0) return null;
  return (
    candidates
      .map((anchor) => ({
        anchor,
        score: scoreCircleDragAnchor(
          anchor,
          radial,
          pointerCell || projectedCell,
          circle,
          gridSize,
        ),
      }))
      .sort((a, b) => a.score - b.score)[0]?.anchor || null
  );
}
