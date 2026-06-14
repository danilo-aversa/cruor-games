import { getTooltipPayload } from "./tooltip.registry.js";
import { renderTooltipPayload } from "./tooltip.renderers.js";

const TOOLTIP_SELECTOR = "[data-key][data-tooltip]";
const MAP_BOUNDARY_SELECTOR =
  ".map-viewport, .map-viewport-frame, .map-canvas-area";
const OFFSET = 18;
const BOUNDARY_INSET = 12;
let runtime = null;

function getPortal() {
  let portal = document.getElementById("cruorTooltipPortal");
  if (portal) return portal;
  portal = document.createElement("div");
  portal.id = "cruorTooltipPortal";
  portal.className = "cruor-tooltip-portal";
  document.body.appendChild(portal);
  return portal;
}

function findTrigger(target) {
  if (!(target instanceof Element)) return null;
  return target.closest(TOOLTIP_SELECTOR);
}

function getTooltipMode() {
  if (typeof document === "undefined") return "default";
  return document.documentElement?.dataset?.a11yTooltips || "default";
}

function canOpenTooltip(source = "pointer") {
  const mode = getTooltipMode();
  if (mode === "off") return false;
  if (mode === "focus" && source !== "focus") return false;
  return true;
}

function clampPosition(x, y, tooltip) {
  const rect = tooltip.getBoundingClientRect();
  const margin = 10;
  return {
    x: Math.max(margin, Math.min(x, window.innerWidth - rect.width - margin)),
    y: Math.max(margin, Math.min(y, window.innerHeight - rect.height - margin)),
  };
}

function getTooltipBoundary(trigger) {
  if (!trigger) return null;
  if (trigger.getAttribute("data-tooltip-boundary") === "map") {
    return trigger.closest(MAP_BOUNDARY_SELECTOR);
  }
  return trigger.closest(MAP_BOUNDARY_SELECTOR);
}

function clampToBoundary(x, y, tooltip, boundaryRect) {
  const tooltipRect = tooltip.getBoundingClientRect();
  if (
    tooltipRect.width + BOUNDARY_INSET * 2 > boundaryRect.width ||
    tooltipRect.height + BOUNDARY_INSET * 2 > boundaryRect.height
  ) {
    return clampPosition(x, y, tooltip);
  }

  return {
    x: Math.max(
      boundaryRect.left + BOUNDARY_INSET,
      Math.min(x, boundaryRect.right - tooltipRect.width - BOUNDARY_INSET),
    ),
    y: Math.max(
      boundaryRect.top + BOUNDARY_INSET,
      Math.min(y, boundaryRect.bottom - tooltipRect.height - BOUNDARY_INSET),
    ),
  };
}

function positionTooltipTowardBoundaryCenter({
  trigger,
  pointer,
  tooltip,
  boundary,
}) {
  const boundaryRect = boundary?.getBoundingClientRect?.();
  if (!boundaryRect || boundaryRect.width <= 0 || boundaryRect.height <= 0)
    return null;

  const tooltipRect = tooltip.getBoundingClientRect();
  const triggerRect = trigger?.getBoundingClientRect?.();
  const origin = {
    x:
      pointer?.x ??
      (triggerRect
        ? triggerRect.left + triggerRect.width / 2
        : boundaryRect.left + boundaryRect.width / 2),
    y:
      pointer?.y ??
      (triggerRect
        ? triggerRect.top + triggerRect.height / 2
        : boundaryRect.top + boundaryRect.height / 2),
  };
  const center = {
    x: boundaryRect.left + boundaryRect.width / 2,
    y: boundaryRect.top + boundaryRect.height / 2,
  };
  const x =
    origin.x < center.x
      ? origin.x + OFFSET
      : origin.x - tooltipRect.width - OFFSET;
  const y =
    origin.y < center.y
      ? origin.y + OFFSET
      : origin.y - tooltipRect.height - OFFSET;
  return clampToBoundary(x, y, tooltip, boundaryRect);
}

function placeTooltip(state, options = {}) {
  if (!state.tooltip) return;
  const source = options.source || state.source;
  let x;
  let y;

  if (source === "pointer" && state.trigger) {
    const boundary = getTooltipBoundary(state.trigger);
    const point = boundary
      ? positionTooltipTowardBoundaryCenter({
          trigger: state.trigger,
          pointer: {
            x: options.clientX ?? state.pointer.x,
            y: options.clientY ?? state.pointer.y,
          },
          tooltip: state.tooltip,
          boundary,
        })
      : null;
    if (point) {
      state.portal.style.transform = `translate(${Math.round(point.x)}px, ${Math.round(point.y)}px)`;
      return;
    }
    x = (options.clientX ?? state.pointer.x) + OFFSET;
    y = (options.clientY ?? state.pointer.y) + OFFSET;
  } else if (source === "focus" && state.trigger) {
    const rect = state.trigger.getBoundingClientRect();
    x = rect.left + Math.min(rect.width / 2, 80);
    y = rect.bottom + OFFSET;
  } else {
    x = (options.clientX ?? state.pointer.x) + OFFSET;
    y = (options.clientY ?? state.pointer.y) + OFFSET;
  }

  const point = clampPosition(x, y, state.tooltip);
  state.portal.style.transform = `translate(${Math.round(point.x)}px, ${Math.round(point.y)}px)`;
}

function closeTooltip(state) {
  state.trigger = null;
  state.source = "pointer";
  state.portal.replaceChildren();
  state.portal.hidden = true;
  state.tooltip = null;
}

function openTooltip(state, trigger, options = {}) {
  const source = options.source || "pointer";
  if (!canOpenTooltip(source)) {
    closeTooltip(state);
    return;
  }

  const key = trigger.getAttribute("data-key");
  const tooltipId = trigger.getAttribute("data-tooltip");
  if (!key || !tooltipId) return;

  const payload = getTooltipPayload(key, tooltipId, trigger);
  const tooltip = renderTooltipPayload(payload);
  if (!tooltip) {
    closeTooltip(state);
    return;
  }

  state.trigger = trigger;
  state.source = source;
  state.pointer = {
    x: options.clientX ?? state.pointer.x,
    y: options.clientY ?? state.pointer.y,
  };
  state.tooltip = tooltip;
  state.portal.replaceChildren(tooltip);
  state.portal.hidden = false;
  placeTooltip(state, options);
}

export function startTooltipRuntime() {
  if (runtime || typeof document === "undefined")
    return runtime?.cleanup || (() => {});

  const state = {
    portal: getPortal(),
    trigger: null,
    tooltip: null,
    source: "pointer",
    pointer: { x: 0, y: 0 },
  };
  state.portal.hidden = true;

  function handlePointerOver(event) {
    if (!canOpenTooltip("pointer")) return;
    const trigger = findTrigger(event.target);
    if (!trigger || trigger === state.trigger) return;
    openTooltip(state, trigger, {
      source: "pointer",
      clientX: event.clientX,
      clientY: event.clientY,
    });
  }

  function handlePointerMove(event) {
    if (state.trigger) return;
    state.pointer = { x: event.clientX, y: event.clientY };
  }

  function handlePointerOut(event) {
    if (!state.trigger) return;
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && state.trigger.contains(nextTarget))
      return;
    closeTooltip(state);
  }

  function handleFocusIn(event) {
    if (!canOpenTooltip("focus")) return;
    const trigger = findTrigger(event.target);
    if (!trigger) return;
    openTooltip(state, trigger, { source: "focus" });
  }

  function handleFocusOut(event) {
    if (!state.trigger) return;
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && state.trigger.contains(nextTarget))
      return;
    closeTooltip(state);
  }

  function handleKeyDown(event) {
    if (event.key !== "Escape" || !state.trigger) return;
    closeTooltip(state);
  }

  function handleAccessibilityChange() {
    if (!canOpenTooltip(state.source)) {
      closeTooltip(state);
    }
  }

  document.addEventListener("pointerover", handlePointerOver, true);
  document.addEventListener("pointermove", handlePointerMove, true);
  document.addEventListener("pointerout", handlePointerOut, true);
  document.addEventListener("focusin", handleFocusIn, true);
  document.addEventListener("focusout", handleFocusOut, true);
  document.addEventListener("keydown", handleKeyDown, true);
  document.addEventListener("cruor:accessibility-change", handleAccessibilityChange, true);

  runtime = {
    cleanup() {
      document.removeEventListener("pointerover", handlePointerOver, true);
      document.removeEventListener("pointermove", handlePointerMove, true);
      document.removeEventListener("pointerout", handlePointerOut, true);
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("focusout", handleFocusOut, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("cruor:accessibility-change", handleAccessibilityChange, true);
      closeTooltip(state);
      runtime = null;
    },
  };

  return runtime.cleanup;
}
