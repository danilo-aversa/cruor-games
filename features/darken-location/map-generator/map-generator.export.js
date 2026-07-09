import {
  createEmptyLevelOverrides,
  normalizeManualOverrides,
  normalizeStairTransition,
} from "./map-generator.state.js";
import { getRegionLevel } from "./map-generator.layout.js";
import { getCorridorPlanarLevel } from "./map-generator.corridors.js";

export function serializeSvg(svgElement, options = {}) {
  if (!svgElement) return "";
  const clone = svgElement.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.querySelectorAll(".editor-overlays").forEach((node) => node.remove());
  if (options.removeLabels)
    clone.querySelectorAll(".labels").forEach((node) => node.remove());
  if (options.hideSecretDoors) {
    clone
      .querySelectorAll(".secret-door-opening, .door-symbol--secret")
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
      current: {},
      gm: {},
      player: { hideSecretDoors: true, removeLabels: true },
      print: { printSafe: true },
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
  return {
    schema: "cruor-map-generator-state",
    version: 2,
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
    manualOverrides: buildExplicitLevelOverrides(manualOverrides, generatedMap),
    uiState,
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
