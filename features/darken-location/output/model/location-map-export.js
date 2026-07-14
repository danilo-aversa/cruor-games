import { LEVEL_VIEW_ALL } from "../../map-generator/map-generator.state.js";

function getRegionLevel(region) {
  return Number.isFinite(Number(region?.level)) ? Number(region.level) : 0;
}

function getAvailableMapLevels(generatedMap = null) {
  const levels = new Set();
  (generatedMap?.regions || []).forEach((region) => levels.add(getRegionLevel(region)));
  (generatedMap?.corridors || []).forEach((corridor) => {
    [corridor?.level, corridor?.fromLevel, corridor?.toLevel].forEach((value) => {
      if (Number.isFinite(Number(value))) levels.add(Number(value));
    });
  });
  return [...levels].sort((a, b) => a - b);
}

function normalizeLevelView(value, availableLevels = []) {
  if (value === LEVEL_VIEW_ALL || value === null || value === undefined) return LEVEL_VIEW_ALL;
  const level = Number(value);
  if (!Number.isFinite(level)) return LEVEL_VIEW_ALL;
  const rounded = Math.round(level);
  return availableLevels.length && !availableLevels.includes(rounded) ? LEVEL_VIEW_ALL : rounded;
}

export const LOCATION_MAP_EXPORT_SCHEMA_VERSION = "dark-places-map-export-v1";

export const LOCATION_MAP_EXPORT_PRESETS = Object.freeze([
  Object.freeze({ id: "gm", label: "GM", description: "Numbered map with authored details and secrets." }),
  Object.freeze({ id: "player", label: "Player", description: "Player-safe map without secret routes or GM markers." }),
  Object.freeze({ id: "print", label: "Print", description: "White-background map prepared for economical printing." }),
]);

export const LOCATION_MAP_EXPORT_FORMATS = Object.freeze([
  Object.freeze({ id: "svg", label: "SVG", extension: "svg", mimeType: "image/svg+xml;charset=utf-8" }),
  Object.freeze({ id: "png", label: "PNG", extension: "png", mimeType: "image/png" }),
]);

export const LOCATION_MAP_EXPORT_PNG_SCALES = Object.freeze([
  Object.freeze({ id: 1, label: "Standard · 1×" }),
  Object.freeze({ id: 2, label: "Print · 2×" }),
  Object.freeze({ id: 4, label: "High Resolution · 4×" }),
]);

export const LOCATION_MAP_EXPORT_CROPS = Object.freeze([
  Object.freeze({ id: "content", label: "Content Bounds" }),
  Object.freeze({ id: "canvas", label: "Full Canvas" }),
]);

export const LOCATION_MAP_EXPORT_PADDING = Object.freeze([
  Object.freeze({ id: 0, label: "None" }),
  Object.freeze({ id: 24, label: "Tight" }),
  Object.freeze({ id: 48, label: "Standard" }),
  Object.freeze({ id: 96, label: "Wide" }),
]);

const PRESET_SETTINGS = Object.freeze({
  gm: Object.freeze({
    preset: "gm",
    format: "svg",
    pngScale: 2,
    crop: "content",
    padding: 48,
    levelView: LEVEL_VIEW_ALL,
    showGrid: true,
    showRoomNumbers: true,
    showRoomNames: false,
    showProps: true,
    showStairArrows: true,
    showHatching: true,
    showTexture: true,
    background: "style",
    palette: "style",
    hideSecrets: false,
  }),
  player: Object.freeze({
    preset: "player",
    format: "svg",
    pngScale: 2,
    crop: "content",
    padding: 48,
    levelView: LEVEL_VIEW_ALL,
    showGrid: true,
    showRoomNumbers: false,
    showRoomNames: false,
    showProps: false,
    showStairArrows: false,
    showHatching: true,
    showTexture: true,
    background: "style",
    palette: "style",
    hideSecrets: true,
  }),
  print: Object.freeze({
    preset: "print",
    format: "png",
    pngScale: 2,
    crop: "content",
    padding: 48,
    levelView: LEVEL_VIEW_ALL,
    showGrid: false,
    showRoomNumbers: true,
    showRoomNames: false,
    showProps: true,
    showStairArrows: true,
    showHatching: true,
    showTexture: false,
    background: "white",
    palette: "print",
    hideSecrets: false,
  }),
});

function asFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeChoice(value, choices, fallback) {
  return choices.includes(value) ? value : fallback;
}

function normalizeBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function getFullMapBounds(generatedMap = null) {
  const mapWidth = Math.max(1, asFiniteNumber(generatedMap?.config?.mapWidth || generatedMap?.bounds?.width, 1000));
  const mapHeight = Math.max(1, asFiniteNumber(generatedMap?.config?.mapHeight || generatedMap?.bounds?.height, 640));
  return { x: 0, y: 0, width: mapWidth, height: mapHeight };
}

function includeCellBounds(bounds, cell, gridSize) {
  if (!cell || !Number.isFinite(Number(cell.x)) || !Number.isFinite(Number(cell.y))) return bounds;
  const x1 = Number(cell.x) * gridSize;
  const y1 = Number(cell.y) * gridSize;
  const x2 = x1 + gridSize;
  const y2 = y1 + gridSize;
  return {
    minX: Math.min(bounds.minX, x1),
    minY: Math.min(bounds.minY, y1),
    maxX: Math.max(bounds.maxX, x2),
    maxY: Math.max(bounds.maxY, y2),
  };
}

function includePointBounds(bounds, point) {
  if (!point || !Number.isFinite(Number(point.x)) || !Number.isFinite(Number(point.y))) return bounds;
  const x = Number(point.x);
  const y = Number(point.y);
  return {
    minX: Math.min(bounds.minX, x),
    minY: Math.min(bounds.minY, y),
    maxX: Math.max(bounds.maxX, x),
    maxY: Math.max(bounds.maxY, y),
  };
}

function isExplicitSecretRegion(region = {}) {
  return region.isSecretRoom === true || region.secret === true || region.metadata?.isSecretRoom === true;
}

function isExplicitSecretCorridor(corridor = {}) {
  const type = corridor.corridorRenderProfile?.type || corridor.corridorType || corridor.type || corridor.kind;
  return corridor.secret === true || type === "secret";
}

function getCorridorFromRegionId(corridor = {}) {
  return corridor.from || corridor.fromRegionId || corridor.sourceRegionId || corridor.startRegionId || "";
}

function getCorridorToRegionId(corridor = {}) {
  return corridor.to || corridor.toRegionId || corridor.targetRegionId || corridor.endRegionId || "";
}

function getLevelContentBounds(generatedMap, levelView, hideSecrets = false) {
  if (!generatedMap || (levelView === LEVEL_VIEW_ALL && !hideSecrets)) return null;
  const gridSize = Math.max(1, asFiniteNumber(generatedMap.config?.gridSize, 20));
  const visibleRegionIds = new Set(
    (generatedMap.regions || [])
      .filter((region) => !hideSecrets || !isExplicitSecretRegion(region))
      .map((region) => region.id),
  );
  let bounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };

  (generatedMap.regions || [])
    .filter((region) => !hideSecrets || !isExplicitSecretRegion(region))
    .filter((region) => levelView === LEVEL_VIEW_ALL || getRegionLevel(region) === levelView)
    .forEach((region) => {
      (region.floorCells || []).forEach((cell) => {
        bounds = includeCellBounds(bounds, cell, gridSize);
      });
      if (!region.floorCells?.length && region.cellRect) {
        bounds = includeCellBounds(bounds, { x: region.cellRect.x, y: region.cellRect.y }, gridSize);
        bounds = includeCellBounds(
          bounds,
          {
            x: Number(region.cellRect.x || 0) + Math.max(1, Number(region.cellRect.w || 1)) - 1,
            y: Number(region.cellRect.y || 0) + Math.max(1, Number(region.cellRect.h || 1)) - 1,
          },
          gridSize,
        );
      }
    });

  (generatedMap.corridors || [])
    .filter((corridor) =>
      !hideSecrets || (
        !isExplicitSecretCorridor(corridor) &&
        visibleRegionIds.has(getCorridorFromRegionId(corridor)) &&
        visibleRegionIds.has(getCorridorToRegionId(corridor))
      ),
    )
    .filter((corridor) =>
      levelView === LEVEL_VIEW_ALL ||
      Number(corridor.level) === levelView ||
      Number(corridor.fromLevel) === levelView ||
      Number(corridor.toLevel) === levelView,
    )
    .forEach((corridor) => {
      (corridor.floorCells || []).forEach((cell) => {
        bounds = includeCellBounds(bounds, cell, gridSize);
      });
      (corridor.centerline || corridor.path || []).forEach((point) => {
        bounds = includePointBounds(bounds, point);
      });
    });

  if (![bounds.minX, bounds.minY, bounds.maxX, bounds.maxY].every(Number.isFinite)) return null;
  return {
    x: bounds.minX,
    y: bounds.minY,
    width: Math.max(1, bounds.maxX - bounds.minX),
    height: Math.max(1, bounds.maxY - bounds.minY),
  };
}

function getBaseContentBounds(generatedMap, levelView, hideSecrets = false) {
  const levelBounds = getLevelContentBounds(generatedMap, levelView, hideSecrets);
  if (levelBounds) return levelBounds;
  const full = getFullMapBounds(generatedMap);
  const source = generatedMap?.contentBounds;
  if (!source) return full;
  return {
    x: asFiniteNumber(source.x, full.x),
    y: asFiniteNumber(source.y, full.y),
    width: Math.max(1, asFiniteNumber(source.width, full.width)),
    height: Math.max(1, asFiniteNumber(source.height, full.height)),
  };
}

export function getAvailableLocationMapExportLevels(generatedMap = null) {
  return getAvailableMapLevels(generatedMap);
}

export function createDefaultLocationMapExportSettings(generatedMap = null) {
  return normalizeLocationMapExportSettings(PRESET_SETTINGS.gm, generatedMap);
}

export function applyLocationMapExportPreset(currentSettings, presetId, generatedMap = null) {
  const preset = PRESET_SETTINGS[presetId] || PRESET_SETTINGS.gm;
  const preservedFormat = normalizeChoice(currentSettings?.format, ["svg", "png"], preset.format);
  const preservedScale = normalizeChoice(Number(currentSettings?.pngScale), [1, 2, 4], preset.pngScale);
  return normalizeLocationMapExportSettings(
    {
      ...preset,
      format: preservedFormat,
      pngScale: preservedScale,
    },
    generatedMap,
  );
}

export function normalizeLocationMapExportSettings(value = {}, generatedMap = null) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const fallbackPreset = PRESET_SETTINGS[source.preset] || PRESET_SETTINGS.gm;
  const availableLevels = getAvailableLocationMapExportLevels(generatedMap);
  const normalizedLevelView = normalizeLevelView(source.levelView, availableLevels);

  return Object.freeze({
    schemaVersion: LOCATION_MAP_EXPORT_SCHEMA_VERSION,
    preset: normalizeChoice(source.preset, ["gm", "player", "print", "custom"], fallbackPreset.preset),
    format: normalizeChoice(source.format, ["svg", "png"], fallbackPreset.format),
    pngScale: normalizeChoice(Number(source.pngScale), [1, 2, 4], fallbackPreset.pngScale),
    crop: normalizeChoice(source.crop, ["content", "canvas"], fallbackPreset.crop),
    padding: normalizeChoice(Number(source.padding), [0, 24, 48, 96], fallbackPreset.padding),
    levelView: normalizedLevelView,
    showGrid: normalizeBoolean(source.showGrid, fallbackPreset.showGrid),
    showRoomNumbers: normalizeBoolean(source.showRoomNumbers, fallbackPreset.showRoomNumbers),
    showRoomNames: normalizeBoolean(source.showRoomNames, fallbackPreset.showRoomNames),
    showProps: normalizeBoolean(source.showProps, fallbackPreset.showProps),
    showStairArrows: normalizeBoolean(source.showStairArrows, fallbackPreset.showStairArrows),
    showHatching: normalizeBoolean(source.showHatching, fallbackPreset.showHatching),
    showTexture: normalizeBoolean(source.showTexture, fallbackPreset.showTexture),
    background: normalizeChoice(source.background, ["style", "white", "transparent"], fallbackPreset.background),
    palette: normalizeChoice(source.palette, ["style", "print"], fallbackPreset.palette || "style"),
    hideSecrets: normalizeBoolean(source.hideSecrets, fallbackPreset.hideSecrets),
  });
}

export function updateLocationMapExportSettings(currentSettings, patch, generatedMap = null) {
  return normalizeLocationMapExportSettings(
    {
      ...currentSettings,
      ...patch,
      preset: patch?.preset || "custom",
    },
    generatedMap,
  );
}

export function getLocationMapExportViewBox(generatedMap, settings = {}) {
  const normalized = normalizeLocationMapExportSettings(settings, generatedMap);
  const full = getFullMapBounds(generatedMap);
  if (normalized.crop === "canvas") return Object.freeze(full);

  const content = getBaseContentBounds(generatedMap, normalized.levelView, normalized.hideSecrets);
  const padding = normalized.padding;
  const x = clamp(content.x - padding, full.x, full.x + full.width);
  const y = clamp(content.y - padding, full.y, full.y + full.height);
  const maxX = clamp(content.x + content.width + padding, full.x, full.x + full.width);
  const maxY = clamp(content.y + content.height + padding, full.y, full.y + full.height);
  return Object.freeze({
    x,
    y,
    width: Math.max(1, maxX - x),
    height: Math.max(1, maxY - y),
  });
}

export function formatLocationMapExportViewBox(bounds) {
  const source = bounds || { x: 0, y: 0, width: 1, height: 1 };
  return [source.x, source.y, source.width, source.height]
    .map((value) => Number(Number(value).toFixed(3)))
    .join(" ");
}

export function getLocationMapExportRenderOptions(generatedMap, settings = {}) {
  const normalized = normalizeLocationMapExportSettings(settings, generatedMap);
  const viewBoxBounds = getLocationMapExportViewBox(generatedMap, normalized);
  const config = generatedMap?.config || {};
  return Object.freeze({
    ...normalized,
    viewBoxBounds,
    viewBox: formatLocationMapExportViewBox(viewBoxBounds),
    gridStyle: config.gridStyle || "solid",
    gridOpacity: Number.isFinite(Number(config.gridOpacity)) ? Number(config.gridOpacity) : 1,
    gridColor: config.gridColor || "light",
    gridWeight: config.gridWeight || "normal",
    crosshatchStyle: config.crosshatchStyle || "classic",
    crosshatchOpacity: normalized.showHatching
      ? Number.isFinite(Number(config.crosshatchOpacity)) ? Number(config.crosshatchOpacity) : 1
      : 0,
    wallDrawingStyle: config.wallDrawingStyle || "precise",
    hatchShadowColor: config.hatchShadowColor || "default",
  });
}

export function getLocationMapSerializationOptions(generatedMap, settings = {}) {
  const renderOptions = getLocationMapExportRenderOptions(generatedMap, settings);
  return Object.freeze({
    mode: renderOptions.preset === "custom" ? "custom" : renderOptions.preset,
    viewBox: renderOptions.viewBox,
    hideSecretDoors: renderOptions.hideSecrets,
    hideSecretCorridorHints: renderOptions.hideSecrets,
    removeGrid: !renderOptions.showGrid,
    removeTexture: !renderOptions.showTexture,
    removeProps: !renderOptions.showProps,
    removeRoomNumbers: !renderOptions.showRoomNumbers,
    removeRoomNames: !renderOptions.showRoomNames,
    removeHatching: !renderOptions.showHatching,
    removeStairArrows: !renderOptions.showStairArrows,
    backgroundMode: renderOptions.background,
    printPalette: renderOptions.palette === "print",
  });
}

export function createLocationMapExportFilename(title, settings = {}) {
  const normalizedTitle = String(title || "cruor-location")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "cruor-location";
  const preset = ["gm", "player", "print"].includes(settings.preset) ? settings.preset : "custom";
  const levelSuffix = settings.levelView === LEVEL_VIEW_ALL || settings.levelView === null || settings.levelView === undefined
    ? ""
    : `-level-${Number(settings.levelView) >= 0 ? `plus-${Number(settings.levelView)}` : `minus-${Math.abs(Number(settings.levelView))}`}`;
  const extension = settings.format === "png" ? "png" : "svg";
  return `${normalizedTitle}-${preset}-map${levelSuffix}.${extension}`;
}
