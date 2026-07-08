/**
 * Shared contract helpers for circular room raccordo anchors.
 *
 * A circular room cannot expose a regular grid wall cell the way rectangular
 * rooms do. Circular door anchors therefore use a small raccordo chain:
 *
 *   circle visual boundary -> optional support cells -> door-bearing portal
 *   cell -> corridor start/routing outside cell
 *
 * The preserved portal cell may be outside the mathematical circle. Validity is
 * defined on the whole raccordo chain, not on the portal cell alone. Keep these
 * helpers free of React and pipeline dependencies so mask, render, debug, and
 * tests can share the same data contract.
 */

export function cloneCircleRaccordoCell(cell) {
  return Number.isFinite(cell?.x) && Number.isFinite(cell?.y)
    ? { x: cell.x, y: cell.y }
    : null;
}

export function getCellManhattanDistance(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function getCircleDoorCorridorStartCellFromAnchor(anchor) {
  return cloneCircleRaccordoCell(
    anchor?.corridorStartCell ||
      anchor?.routingOutsideCell ||
      anchor?.outsideCell ||
      null,
  );
}

export function getCircleRaccordoCellsFromAnchor(anchor, fallbackPortalCell = null) {
  if (Array.isArray(anchor?.raccordoCells) && anchor.raccordoCells.length > 0) {
    return anchor.raccordoCells
      .map(cloneCircleRaccordoCell)
      .filter(Boolean);
  }

  const first = cloneCircleRaccordoCell(fallbackPortalCell || anchor?.portalRoomCell || null);
  const last = cloneCircleRaccordoCell(
    anchor?.raccordoCell ||
      (fallbackPortalCell ? first : anchor?.cell) ||
      first ||
      null,
  );
  if (first && last && (first.x !== last.x || first.y !== last.y)) {
    const dx = Math.sign(last.x - first.x);
    const dy = Math.sign(last.y - first.y);
    if ((dx === 0 || dy === 0) && (dx !== 0 || dy !== 0)) {
      const cells = [];
      let x = first.x;
      let y = first.y;
      cells.push({ x, y });
      while (x !== last.x || y !== last.y) {
        if (x !== last.x) x += dx;
        if (y !== last.y) y += dy;
        cells.push({ x, y });
      }
      return cells;
    }
  }
  return last ? [last] : [];
}

export function getCircleRaccordoPortalCell(cells = [], anchor = null) {
  return (
    cloneCircleRaccordoCell(cells[0]) ||
    cloneCircleRaccordoCell(anchor?.portalRoomCell) ||
    cloneCircleRaccordoCell(anchor?.cell) ||
    null
  );
}

export function getCircleDoorRaccordoCellFromAnchor(anchor, fallbackPortalCell = null) {
  const cells = getCircleRaccordoCellsFromAnchor(anchor, fallbackPortalCell);
  return (
    cloneCircleRaccordoCell(cells[cells.length - 1]) ||
    cloneCircleRaccordoCell(anchor?.raccordoCell) ||
    cloneCircleRaccordoCell(anchor?.portalRoomCell) ||
    cloneCircleRaccordoCell(anchor?.cell) ||
    null
  );
}

export function areCircleRaccordoCellsContiguous(cells = []) {
  if (!Array.isArray(cells) || cells.length === 0) return false;
  for (let index = 1; index < cells.length; index += 1) {
    if (getCellManhattanDistance(cells[index - 1], cells[index]) !== 1) return false;
  }
  return true;
}

export function getCircleCellRectDistanceRange(cell, circle) {
  if (!cell || !circle) {
    return {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      center: Number.POSITIVE_INFINITY,
    };
  }
  const cx = Number.isFinite(circle.cxCells) ? circle.cxCells : circle.cx;
  const cy = Number.isFinite(circle.cyCells) ? circle.cyCells : circle.cy;
  const minX = cell.x;
  const minY = cell.y;
  const maxX = cell.x + 1;
  const maxY = cell.y + 1;
  const dx = Math.max(minX - cx, 0, cx - maxX);
  const dy = Math.max(minY - cy, 0, cy - maxY);
  return {
    min: Math.hypot(dx, dy),
    max: Math.max(
      Math.hypot(minX - cx, minY - cy),
      Math.hypot(maxX - cx, minY - cy),
      Math.hypot(minX - cx, maxY - cy),
      Math.hypot(maxX - cx, maxY - cy),
    ),
    center: Math.hypot(cell.x + 0.5 - cx, cell.y + 0.5 - cy),
  };
}

export function doesCircleRaccordoCellTouchVisualCircle(cell, circle, tolerance = 0.035) {
  const range = getCircleCellRectDistanceRange(cell, circle);
  const radius = Number.isFinite(circle?.rCells) ? circle.rCells : circle?.r;
  return range.min <= radius + tolerance && range.max >= radius - tolerance;
}

export function getCircleRaccordoChainTouchCell(cells = [], circle, tolerance = 0.035) {
  return cells.find((cell) => doesCircleRaccordoCellTouchVisualCircle(cell, circle, tolerance)) || null;
}

export function isCircleDoorSharedEdgeOutsideVisualCircle(
  raccordoCell,
  corridorStartCell,
  circle,
) {
  if (!raccordoCell || !corridorStartCell || !circle) return false;
  const dx = corridorStartCell.x - raccordoCell.x;
  const dy = corridorStartCell.y - raccordoCell.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return false;

  const cx = Number.isFinite(circle.cxCells) ? circle.cxCells : circle.cx;
  const cy = Number.isFinite(circle.cyCells) ? circle.cyCells : circle.cy;
  const radius = Number.isFinite(circle.rCells) ? circle.rCells : circle.r;
  const samples = [0.12, 0.28, 0.5, 0.72, 0.88];
  const tolerance = 0.025;
  return samples.every((offset) => {
    const point =
      dx !== 0
        ? {
            x: dx > 0 ? raccordoCell.x + 1 : raccordoCell.x,
            y: raccordoCell.y + offset,
          }
        : {
            x: raccordoCell.x + offset,
            y: dy > 0 ? raccordoCell.y + 1 : raccordoCell.y,
          };
    return Math.hypot(point.x - cx, point.y - cy) >= radius - tolerance;
  });
}
