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
  clone.querySelectorAll(".editor-overlays").forEach((node) => node.remove());
  if (options.removeLabels)
    clone.querySelectorAll(".labels").forEach((node) => node.remove());
  if (options.hideSecretDoors || options.hideSecretCorridorHints) {
    clone
      .querySelectorAll(SECRET_PLAYER_EXPORT_SELECTOR)
      .forEach((node) => node.remove());
  }
  if (options.printSafe) {
    clone.querySelectorAll(".paper-texture").forEach((node) => node.remove());
    clone.querySelectorAll(".map-grid").forEach((node) => node.remove());
  }
  return new XMLSerializer().serializeToString(clone);
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

  return {
    schema: "cruor-map-generator-export-manifest",
    version: 1,
    stateModel: "explicit-levels",
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
