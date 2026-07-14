import {
  LEVEL_VIEW_ALL,
  createEmptyLevelOverrides,
  normalizeCorridorType,
  normalizeManualOverrides,
  normalizeStairTransition,
} from "./map-generator.state.js";
import { getAvailableMapLevels, getRegionLevel, normalizeLevelView } from "./map-generator.layout.js";
import { getCorridorPlanarLevel } from "./map-generator.corridors.js";

const SECRET_PLAYER_EXPORT_SELECTOR = [
  ".secret-door-opening",
  ".door-symbol--secret",
  ".secret-door-panel",
  ".corridor-type-secret",
  ".corridor-type-secret__veil",
  ".corridor-type-secret__trace",
  '[data-corridor-type="secret"]',
].join(", ");

const MAP_EXPORT_LAYER_SELECTORS = Object.freeze({
  grid: ".map-grid, .floor-grid",
  texture: ".paper-texture",
  props: ".props",
  roomNumbers: ".room-number-badge, .room-number, .room-level-marker",
  roomNames: ".room-name",
  hatching: ".external-hatching, .external-hatching-underlay",
  stairArrows: ".stair-mark__arrow",
  transient: ".editor-overlays, .room-preview-hotspots, .debug-cell-coordinates",
});

function removeSvgMatches(root, selector) {
  if (!selector) return;
  root.querySelectorAll(selector).forEach((node) => node.remove());
}


function appendSvgPrintPalette(clone) {
  const namespace = "http://www.w3.org/2000/svg";
  const defs = clone.querySelector("defs") || clone.insertBefore(clone.ownerDocument.createElementNS(namespace, "defs"), clone.firstChild);
  const style = clone.ownerDocument.createElementNS(namespace, "style");
  style.setAttribute("data-export-print-palette", "true");
  style.textContent = `
    .paper{fill:#fff!important}.paper-texture{display:none!important}
    .floor-fill,.room-floor-accent,.corridor-floor-accent{fill:#fff!important}
    .wall-shadow{display:none!important}
    .wall-main path,.door-symbols .door-wall-line,.corridor-junctions .junction-wall-line,.map-accesses .map-access-line,.map-accesses .map-access-head-line{stroke:#111!important}
    .wall-sketch path,.door-symbols .door-wall-sketch,.corridor-junctions .junction-wall-sketch{stroke:#555!important}
    .door-cuts .door-opening,.door-cuts .secret-door-opening{stroke:#fff!important}
    .external-hatching path{stroke:#666!important}
    .props rect,.props circle,.props path,.props line,.props polygon,.props ellipse{stroke:#111!important}
    .labels .room-number-badge{fill:#fff!important;stroke:#111!important}.labels text{fill:#111!important}
  `;
  defs.appendChild(style);
}

function applySvgBackgroundMode(clone, mode) {
  const backgroundMode = ["style", "white", "transparent"].includes(mode)
    ? mode
    : "style";
  clone.setAttribute("data-export-background", backgroundMode);
  const paper = clone.querySelector(".paper");
  if (!paper) return;
  if (backgroundMode === "transparent") {
    paper.remove();
    removeSvgMatches(clone, MAP_EXPORT_LAYER_SELECTORS.texture);
    return;
  }
  if (backgroundMode === "white") {
    paper.setAttribute("fill", "#ffffff");
    paper.setAttribute("style", "fill:#ffffff");
  }
}

export function serializeSvg(svgElement, options = {}) {
  if (!svgElement) return "";
  const clone = svgElement.cloneNode(true);
  const exportMode = String(options.mode || "current");
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("data-export-mode", exportMode);
  clone.setAttribute(
    "data-export-player-safe",
    options.hideSecretDoors || options.hideSecretCorridorHints ? "true" : "false",
  );
  if (options.viewBox) clone.setAttribute("viewBox", String(options.viewBox));
  clone.removeAttribute("tabindex");
  removeSvgMatches(clone, MAP_EXPORT_LAYER_SELECTORS.transient);

  const removeGrid = options.removeGrid || options.printSafe;
  const removeTexture = options.removeTexture || options.printSafe;
  if (removeGrid) removeSvgMatches(clone, MAP_EXPORT_LAYER_SELECTORS.grid);
  if (removeTexture) removeSvgMatches(clone, MAP_EXPORT_LAYER_SELECTORS.texture);
  if (options.removeProps) removeSvgMatches(clone, MAP_EXPORT_LAYER_SELECTORS.props);
  if (options.removeHatching) removeSvgMatches(clone, MAP_EXPORT_LAYER_SELECTORS.hatching);
  if (options.removeStairArrows) removeSvgMatches(clone, MAP_EXPORT_LAYER_SELECTORS.stairArrows);

  if (options.removeLabels) {
    removeSvgMatches(clone, ".labels");
  } else {
    if (options.removeRoomNumbers) removeSvgMatches(clone, MAP_EXPORT_LAYER_SELECTORS.roomNumbers);
    if (options.removeRoomNames) removeSvgMatches(clone, MAP_EXPORT_LAYER_SELECTORS.roomNames);
  }

  if (options.hideSecretDoors || options.hideSecretCorridorHints) {
    removeSvgMatches(clone, SECRET_PLAYER_EXPORT_SELECTOR);
  }
  applySvgBackgroundMode(clone, options.backgroundMode || (options.printSafe ? "white" : "style"));
  if (exportMode === "print" || options.printSafe || options.printPalette) appendSvgPrintPalette(clone);
  return new XMLSerializer().serializeToString(clone);
}

export function downloadBlobFile(filename, blob) {
  if (!blob || typeof document === "undefined" || typeof URL === "undefined") return false;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export function createSvgBlob(svgText) {
  const text = String(svgText || "");
  return text.trim() ? new Blob([text], { type: "image/svg+xml;charset=utf-8" }) : null;
}

export async function rasterizeSvgToPngBlob(svgText, options = {}) {
  const text = String(svgText || "");
  if (!text.trim() || typeof document === "undefined" || typeof Image === "undefined") return null;
  const viewBoxMatch = text.match(/viewBox=["']\s*([^"']+)["']/i);
  const values = viewBoxMatch?.[1]?.trim().split(/[\s,]+/).map(Number) || [];
  const width = Math.max(1, Number(options.width || values[2] || 1000));
  const height = Math.max(1, Number(options.height || values[3] || 640));
  const scale = [1, 2, 4].includes(Number(options.scale)) ? Number(options.scale) : 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) return null;

  const image = new Image();
  const svgBlob = createSvgBlob(text);
  if (!svgBlob) return null;
  const url = URL.createObjectURL(svgBlob);
  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("Unable to rasterize SVG"));
      image.src = url;
    });
    context.setTransform(scale, 0, 0, scale, 0, 0);
    if (options.background && options.background !== "transparent") {
      context.fillStyle = options.background;
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(image, 0, 0, width, height);
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadSvgExport(mode = "current") {
  const svg = document.querySelector("#cruor-map-svg");
  const exportOptions =
    {
      current: { mode: "current" },
      gm: { mode: "gm" },
      player: { mode: "player", hideSecretDoors: true, hideSecretCorridorHints: true, removeLabels: true },
      print: { mode: "print", printSafe: true },
    }[mode] || {};
  const data = serializeSvg(svg, exportOptions);
  if (!data) return;
  const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const suffix = mode === "current" ? "mvp" : mode;
  link.href = url;
  link.download = `cruor-map-${suffix}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadSvg() {
  downloadSvgExport("current");
}

export function downloadGmSvg() {
  downloadSvgExport("gm");
}

export function downloadPlayerSvg() {
  downloadSvgExport("player");
}

export function downloadPrintSvg() {
  downloadSvgExport("print");
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function createDerivedLevelSnapshot(generatedMap) {
  if (!generatedMap) return createEmptyLevelOverrides();
  const regions = Object.fromEntries(
    (generatedMap.regions || []).map((region) => [
      region.id,
      {
        level: getRegionLevel(region),
      },
    ]),
  );
  const corridors = Object.fromEntries(
    (generatedMap.corridors || []).map((corridor) => [
      corridor.id,
      {
        level: getCorridorPlanarLevel(corridor),
        fromLevel: Number.isFinite(corridor.fromLevel) ? corridor.fromLevel : 0,
        toLevel: Number.isFinite(corridor.toLevel) ? corridor.toLevel : 0,
        levelDelta: Number.isFinite(corridor.levelDelta)
          ? corridor.levelDelta
          : 0,
        stairEndpoint: corridor.stairEndpoint || null,
        stairTransition: normalizeStairTransition(
          corridor.stairTransition,
          "none",
        ),
        verticalTransition: Boolean(corridor.verticalTransition),
      },
    ]),
  );
  return { regions, corridors, stairs: {} };
}

function countObjectEntries(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? Object.keys(value).length
    : 0;
}

function countArrayEntries(value) {
  return Array.isArray(value) ? value.length : 0;
}

function createStairMarkerOverrideCounts(stairMarkers = {}) {
  const source =
    stairMarkers &&
    typeof stairMarkers === "object" &&
    !Array.isArray(stairMarkers)
      ? stairMarkers
      : {};
  const overrides = Object.values(source);
  const removed = overrides.filter(
    (override) => override?.removed === true,
  ).length;
  return {
    total: overrides.length,
    positioned: overrides.length - removed,
    removed,
  };
}

function createCorridorTypeHistogram(corridors = []) {
  return (corridors || []).reduce((histogram, corridor) => {
    const type = normalizeCorridorType(
      corridor?.corridorRenderProfile?.type || corridor?.corridorType,
      "normal",
    );
    histogram[type] = (histogram[type] || 0) + 1;
    return histogram;
  }, {});
}

export function normalizeMapUiState(uiState = {}, generatedMap = null) {
  const source = uiState && typeof uiState === "object" ? uiState : {};
  const availableLevels = getAvailableMapLevels(generatedMap);
  const normalized = { ...source };
  normalized.levelView = normalizeLevelView(source.levelView, availableLevels);
  if (typeof source.fadeOtherLevels === "undefined") {
    normalized.fadeOtherLevels = true;
  } else {
    normalized.fadeOtherLevels = Boolean(source.fadeOtherLevels);
  }
  normalized.showStairArrows = source.showStairArrows === true;
  return normalized;
}

export function createMapStateExportManifest(
  config = {},
  manualOverrides = {},
  generatedMap = null,
  uiState = {},
) {
  const normalizedOverrides = normalizeManualOverrides(manualOverrides);
  const normalizedUiState = normalizeMapUiState(uiState, generatedMap);
  const regions = generatedMap?.regions || [];
  const corridors = generatedMap?.corridors || [];
  const crossLevelCorridors = corridors.filter((corridor) => corridor.crossLevel);
  const derivedStairCorridors = corridors.filter(
    (corridor) => corridor.levelTransition?.derivedFromRoomLevels,
  );
  const availableLevels = getAvailableMapLevels(generatedMap);
  const stairMarkerCounts = createStairMarkerOverrideCounts(
    normalizedOverrides.stairMarkers,
  );

  return {
    schema: "cruor-map-generator-export-manifest",
    version: 1,
    stateModel: "explicit-levels",
    manualOverrideSchemaVersion: normalizedOverrides.schemaVersion,
    seed: String(config.seed ?? generatedMap?.seed ?? ""),
    levelView: normalizedUiState.levelView,
    fadeOtherLevels: normalizedUiState.fadeOtherLevels,
    levels: {
      available: availableLevels,
      min: availableLevels.length ? Math.min(...availableLevels) : 0,
      max: availableLevels.length ? Math.max(...availableLevels) : 0,
    },
    counts: {
      generatedRegions: regions.length,
      generatedCorridors: corridors.length,
      manualRoomPositions: countObjectEntries(normalizedOverrides.roomPositions),
      manualDoorAnchors: countObjectEntries(normalizedOverrides.doorAnchors),
      manualCorridorTypes: countObjectEntries(normalizedOverrides.corridorTypes),
      manualRoomLevels: countObjectEntries(normalizedOverrides.levels.regions),
      manualCorridorLevels: countObjectEntries(normalizedOverrides.levels.corridors),
      manualStairTransitions: countObjectEntries(normalizedOverrides.levels.stairs),
      manualStairMarkers: stairMarkerCounts.total,
      manualPositionedStairMarkers: stairMarkerCounts.positioned,
      manualRemovedStairMarkers: stairMarkerCounts.removed,
      manualCustomConnections: countArrayEntries(normalizedOverrides.customConnections),
      manualDeletedConnections: countArrayEntries(normalizedOverrides.deletedConnections),
      crossLevelCorridors: crossLevelCorridors.length,
      derivedStairCorridors: derivedStairCorridors.length,
    },
    corridorTypes: createCorridorTypeHistogram(corridors),
  };
}

export function buildExplicitLevelOverrides(
  manualOverrides,
  generatedMap = null,
) {
  const normalized = normalizeManualOverrides(manualOverrides);
  const derived = createDerivedLevelSnapshot(generatedMap);
  return {
    ...normalized,
    levels: {
      regions: {
        ...derived.regions,
        ...(normalized.levels.regions || {}),
      },
      corridors: {
        ...derived.corridors,
        ...(normalized.levels.corridors || {}),
      },
      stairs: {
        ...normalized.levels.stairs,
      },
    },
    stairTransitions: {
      ...normalized.levels.stairs,
    },
  };
}

export function buildMapStatePayload(
  config,
  manualOverrides,
  uiState = {},
  generatedMap = null,
) {
  const normalizedUiState = normalizeMapUiState(uiState, generatedMap);
  const explicitManualOverrides = buildExplicitLevelOverrides(
    manualOverrides,
    generatedMap,
  );
  return {
    schema: "cruor-map-generator-state",
    version: 3,
    stateModel: "explicit-levels",
    savedAt: new Date().toISOString(),
    config: {
      seed: config.seed,
      context: config.context,
      biome: config.biome,
      horror: config.horror || [],
      sourceAnchors: config.sourceAnchors || [],
      roomCount: config.roomCount,
      gridSize: config.gridSize,
      mapWidth: config.mapWidth,
      mapHeight: config.mapHeight,
      showGrid: Boolean(config.showGrid),
      mode: config.mode,
      visualStyle: config.visualStyle,
      regions: config.regions || [],
      connections: config.connections || [],
    },
    manualOverrides: explicitManualOverrides,
    uiState: normalizedUiState,
    exportManifest: createMapStateExportManifest(
      config,
      manualOverrides,
      generatedMap,
      normalizedUiState,
    ),
  };
}

export function parseMapStatePayload(text) {
  const payload = JSON.parse(text);
  if (!payload || typeof payload !== "object")
    throw new Error("Invalid state file");
  if (payload.schema !== "cruor-map-generator-state")
    throw new Error("Unsupported state schema");
  return {
    ...payload,
    version: Number(payload.version || 1),
    manualOverrides: normalizeManualOverrides(payload.manualOverrides || {}),
    uiState: normalizeMapUiState(payload.uiState || {}),
    exportManifest:
      payload.exportManifest && typeof payload.exportManifest === "object"
        ? payload.exportManifest
        : null,
  };
}

export function downloadMapState(
  config,
  manualOverrides,
  uiState = {},
  generatedMap = null,
) {
  const safeSeed =
    String(config.seed || "cruor-map")
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "cruor-map";
  downloadJson(
    `${safeSeed}-state.json`,
    buildMapStatePayload(config, manualOverrides, uiState, generatedMap),
  );
}
