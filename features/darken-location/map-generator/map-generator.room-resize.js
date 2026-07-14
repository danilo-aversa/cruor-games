import { getRoomShapeDefinition } from "./map-generator.room-design.js";

const DEFAULT_GRID_MARGIN = 1;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizePositiveNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function getGridExtent(pixelExtent, gridSize) {
  return Math.max(
    4,
    Math.floor(normalizePositiveNumber(pixelExtent, gridSize * 4) / gridSize),
  );
}

function isRoundResizeShape(shape = "") {
  return shape === "circle" || shape === "shaft";
}

export function canResizeRoomFromCorner(region = null) {
  if (!region?.cellRect) return false;
  const shape = String(region.shape || "rect").toLowerCase();
  const definition = getRoomShapeDefinition(shape);
  return Boolean(
    definition &&
    definition.support === "supported" &&
    definition.supportsCustomSize !== false &&
    definition.editorSelectable !== false,
  );
}

export function getRoomCornerResizeHandleGeometry(region, gridSize) {
  if (!canResizeRoomFromCorner(region)) return null;

  const safeGridSize = normalizePositiveNumber(gridSize, 20);
  const cornerX = (region.cellRect.x + region.cellRect.w) * safeGridSize;
  const cornerY = region.cellRect.y * safeGridSize;
  const arm = Math.max(14, Math.min(24, safeGridSize * 0.9));
  const outsideOffset = Math.max(4, Math.min(8, safeGridSize * 0.26));
  const hitPadding = Math.max(9, Math.min(14, safeGridSize * 0.5));
  const glyphBounds = {
    left: cornerX - arm,
    top: cornerY - outsideOffset,
    right: cornerX + outsideOffset,
    bottom: cornerY + arm,
  };

  return {
    cornerX,
    cornerY,
    arm,
    outsideOffset,
    path: [
      `M ${glyphBounds.left} ${glyphBounds.top}`,
      `L ${glyphBounds.right} ${glyphBounds.top}`,
      `L ${glyphBounds.right} ${glyphBounds.bottom}`,
    ].join(" "),
    hitRect: {
      x: glyphBounds.left - hitPadding,
      y: glyphBounds.top - hitPadding,
      width: glyphBounds.right - glyphBounds.left + hitPadding * 2,
      height: glyphBounds.bottom - glyphBounds.top + hitPadding * 2,
    },
  };
}

export function createRoomCornerResizeDraft({
  region,
  pointer,
  gridSize,
  mapWidth,
  mapHeight,
  margin = DEFAULT_GRID_MARGIN,
}) {
  if (!canResizeRoomFromCorner(region) || !pointer) return null;

  const safeGridSize = normalizePositiveNumber(gridSize, 20);
  const shape = String(region.shape || "rect").toLowerCase();
  const definition = getRoomShapeDefinition(shape);
  const rect = region.cellRect;
  const gridWidth = getGridExtent(mapWidth, safeGridSize);
  const gridHeight = getGridExtent(mapHeight, safeGridSize);
  const safeMargin = Math.max(0, Math.round(Number(margin) || 0));
  const anchorCell = {
    x: Math.round(rect.x),
    y: Math.round(rect.y + rect.h),
  };
  const pointerCell = {
    x: Math.round(Number(pointer.x) / safeGridSize),
    y: Math.round(Number(pointer.y) / safeGridSize),
  };
  const minWidth = Math.max(
    2,
    Math.round(Number(definition?.minWidthCells) || 2),
  );
  const minHeight = Math.max(
    2,
    Math.round(Number(definition?.minHeightCells) || 2),
  );
  const maxWidth = Math.max(minWidth, gridWidth - safeMargin - anchorCell.x);
  const maxHeight = Math.max(minHeight, anchorCell.y - safeMargin);

  let width = clamp(pointerCell.x - anchorCell.x, minWidth, maxWidth);
  let height = clamp(anchorCell.y - pointerCell.y, minHeight, maxHeight);

  if (definition?.forceSquare) {
    const minDiameter = Math.max(minWidth, minHeight);
    const maxDiameter = Math.max(minDiameter, Math.min(maxWidth, maxHeight));
    const diameter = clamp(Math.max(width, height), minDiameter, maxDiameter);
    width = diameter;
    height = diameter;
  }

  const cellRect = {
    x: anchorCell.x,
    y: anchorCell.y - height,
    w: width,
    h: height,
  };
  const customSize = isRoundResizeShape(shape)
    ? {
        radiusCells: width / 2,
        layoutAnchor: "top-left",
      }
    : {
        widthCells: width,
        heightCells: height,
        layoutAnchor: "top-left",
      };

  return {
    regionId: region.id,
    shape,
    pointerCell,
    anchorCell,
    dragAnchorCorner: "bottom-left",
    cellRect,
    position: { x: cellRect.x, y: cellRect.y },
    widthCells: width,
    heightCells: height,
    patch: {
      sizePreset: "Custom",
      customSize,
    },
    label: `${width}\u00D7${height}`,
  };
}

export function applyRoomCornerResizeToManualOverrides(
  overrides = {},
  regionId,
  draft = null,
) {
  if (!regionId || !draft?.patch || !draft?.position) return overrides;
  return {
    ...overrides,
    roomPositions: {
      ...(overrides.roomPositions || {}),
      [regionId]: {
        x: Math.round(draft.position.x),
        y: Math.round(draft.position.y),
      },
    },
    roomStyles: {
      ...(overrides.roomStyles || {}),
      [regionId]: {
        ...(overrides.roomStyles?.[regionId] || {}),
        ...draft.patch,
      },
    },
  };
}
