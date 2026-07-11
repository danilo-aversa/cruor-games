const DEFAULT_VIEWPORT_MARGIN = 8;
const DEFAULT_SUBMENU_GAP = 8;
const DEFAULT_SUBMENU_MAX_HEIGHT = 460;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizePositiveNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

export function resolveContextMenuViewportLayout({
  anchorX,
  anchorY,
  menuWidth,
  menuHeight,
  submenuWidth = 0,
  viewportWidth,
  viewportHeight,
  margin = DEFAULT_VIEWPORT_MARGIN,
  submenuGap = DEFAULT_SUBMENU_GAP,
}) {
  const safeViewportWidth = normalizePositiveNumber(viewportWidth, 1);
  const safeViewportHeight = normalizePositiveNumber(viewportHeight, 1);
  const safeMenuWidth = normalizePositiveNumber(menuWidth, 1);
  const safeMenuHeight = normalizePositiveNumber(menuHeight, 1);
  const safeSubmenuWidth = Math.max(0, Number(submenuWidth) || 0);
  const safeMargin = Math.max(0, Number(margin) || 0);
  const safeGap = Math.max(0, Number(submenuGap) || 0);
  const safeAnchorX = Number.isFinite(Number(anchorX))
    ? Number(anchorX)
    : safeMargin;
  const safeAnchorY = Number.isFinite(Number(anchorY))
    ? Number(anchorY)
    : safeMargin;
  const availableHeight = Math.max(1, safeViewportHeight - safeMargin * 2);
  const renderedHeight = Math.min(safeMenuHeight, availableHeight);
  const spaceBelow = safeViewportHeight - safeMargin - safeAnchorY;
  const spaceAbove = safeAnchorY - safeMargin;

  let top;
  let verticalPlacement;
  if (safeMenuHeight <= spaceBelow) {
    top = safeAnchorY;
    verticalPlacement = "below";
  } else if (safeMenuHeight <= spaceAbove) {
    top = safeAnchorY - safeMenuHeight;
    verticalPlacement = "above";
  } else {
    top = clamp(
      safeAnchorY - renderedHeight / 2,
      safeMargin,
      Math.max(safeMargin, safeViewportHeight - safeMargin - renderedHeight),
    );
    verticalPlacement = "constrained";
  }

  const compoundWidth =
    safeMenuWidth + (safeSubmenuWidth > 0 ? safeGap + safeSubmenuWidth : 0);
  const canOpenRight =
    safeAnchorX + compoundWidth <= safeViewportWidth - safeMargin;
  const canOpenLeft = safeAnchorX - compoundWidth >= safeMargin;
  const maxMenuLeft = Math.max(
    safeMargin,
    safeViewportWidth - safeMargin - safeMenuWidth,
  );

  let left;
  let submenuSide;
  if (canOpenRight) {
    left = safeAnchorX;
    submenuSide = "right";
  } else if (canOpenLeft) {
    left = safeAnchorX - safeMenuWidth;
    submenuSide = "left";
  } else {
    left = clamp(safeAnchorX, safeMargin, maxMenuLeft);
    const availableRight =
      safeViewportWidth - safeMargin - (left + safeMenuWidth + safeGap);
    const availableLeft = left - safeGap - safeMargin;
    submenuSide = availableRight >= availableLeft ? "right" : "left";
  }

  return {
    left: clamp(left, safeMargin, maxMenuLeft),
    top,
    maxHeight: safeMenuHeight > availableHeight ? availableHeight : null,
    overflowY: safeMenuHeight > availableHeight ? "auto" : "visible",
    verticalPlacement,
    submenuSide,
  };
}

export function resolveContextSubmenuViewportLayout({
  triggerTop,
  submenuHeight,
  viewportHeight,
  margin = DEFAULT_VIEWPORT_MARGIN,
  preferredMaxHeight = DEFAULT_SUBMENU_MAX_HEIGHT,
}) {
  const safeViewportHeight = normalizePositiveNumber(viewportHeight, 1);
  const safeSubmenuHeight = normalizePositiveNumber(submenuHeight, 1);
  const safeMargin = Math.max(0, Number(margin) || 0);
  const safeTriggerTop = Number.isFinite(Number(triggerTop))
    ? Number(triggerTop)
    : safeMargin;
  const availableHeight = Math.max(1, safeViewportHeight - safeMargin * 2);
  const heightLimit = Math.min(
    availableHeight,
    normalizePositiveNumber(preferredMaxHeight, availableHeight),
  );
  const renderedHeight = Math.min(safeSubmenuHeight, heightLimit);
  const viewportTop = clamp(
    safeTriggerTop,
    safeMargin,
    Math.max(safeMargin, safeViewportHeight - safeMargin - renderedHeight),
  );

  return {
    topOffset: viewportTop - safeTriggerTop,
    maxHeight: safeSubmenuHeight > heightLimit ? heightLimit : null,
    overflowY: safeSubmenuHeight > heightLimit ? "auto" : "visible",
  };
}
