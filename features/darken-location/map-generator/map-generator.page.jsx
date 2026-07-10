import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { registerTooltipProvider } from "../../../shared/tooltips/tooltip.registry.js";
import {
  DEFAULT_CONFIG,
  MAP_VISUAL_STYLES,
  createConfigFromNormalizedMapRequest,
  normalizeMapDimension,
  normalizeRoomCount,
  normalizeVisualStyle,
} from "./map-generator.input.js";
import {
  LEVEL_VIEW_ALL,
  MANUAL_OVERRIDE_SCHEMA_VERSION,
  GRID_STYLE_OPTIONS,
  GRID_WEIGHT_OPTIONS,
  GRID_COLOR_OPTIONS,
  DOOR_TYPE_OPTIONS,
  CORRIDOR_TYPE_OPTIONS,
  STAIR_TRANSITION_OPTIONS,
  JUNCTION_TYPE_OPTIONS,
  cloneManualOverrides,
  areManualOverridesEqual,
  createEmptyManualOverrides,
  createEmptyLevelOverrides,
  normalizeManualOverrides,
  resetManualOverrides,
  normalizeGridColor,
  normalizeGridStyle,
  normalizeGridWeight,
  doorTypeKey,
  normalizeDoorType,
  corridorTypeKey,
  normalizeCorridorType,
  getManualCorridorType,
  normalizeLevelNumber,
  stairTransitionKey,
  getManualStairTransition,
  createEditorStairLevelOverrides,
  resolveStairTransition,
  getManualJunctionOverride,
  normalizeJunctionType,
  getManualJunctionType,
  getManualJunctionSideIndex,
  getManualDoorType,
  resolveDoorType,
} from "./map-generator.state.js";
import {
  regionDepthScore,
  roleDepth,
  getRegionText,
  classifyRegion,
  getContextKey,
  getPlacementProfile,
  getPlacementRole,
  getRegionSemanticFlags,
  getMapAccessIntent,
  getFallbackMapAccessIntent,
} from "./map-generator.profile.js";
import {
  getRegionGraphScore,
  createGraphEdge,
  addGraphEdge,
  selectRegionByFlags,
  getFinalRegionPriority,
  selectFinalRegion,
  buildCriticalPathRegions,
  chooseSideAnchor,
  chooseSecretAnchor,
  parseRegionLink,
  buildRegionGraph,
  buildChapelPhysicalGraph,
  adaptGraphForContext,
  computeGraphDepths,
  getGraphAdjacency,
  findGraphEdgeBetween,
  getEdgeEndpointForRegion,
} from "./map-generator.graph.js";
import {
  resolveRoomSize,
  chooseRoomShape,
  getPlacementLane,
  getPlacementDepth,
  getPlacedNeighborCentroid,
  getContextualTarget,
  scorePlacementCandidate,
  createPlacedRegion,
  resolveStructuredRoomSize,
  rectsOverlapAny,
  createChapelSideSlots,
  placeRegionInFirstAvailableSlot,
  placeChapelRegions,
  placeNobleHouseRegions,
  resolveCaveRoomSize,
  getRectGap,
  getRectIntersectionArea,
  createAdjacentCaveCandidate,
  isAcceptableCavePlacement,
  scoreCavePlacementCandidate,
  chooseCaveAnchorRegion,
  chooseCavePlacement,
  placeCaveRegions,
  resizeRoomAroundCenter,
  formatMapLevel,
  getRegionLevel,
  getAvailableMapLevels,
  normalizeLevelView,
  hasRenderableGeometry,
} from "./map-generator.layout.js";
import {
  ORTHOGONAL_DIRECTIONS,
  cellKey,
  parseCellKey,
  getCellNeighbors,
  getCircleExtensionCellKeys,
  pointKey,
  doorKey,
  dedupePoints,
  dedupeDoorSegments,
  computeBoundarySegments,
  mergeCollinearWallSegments,
  segmentKey,
  getSharedEdgeSegment,
  getCellBoundarySegmentsForCell,
  getNeighborForCellSide,
  getRegionSurfaceKind,
  getCircleGeometryFromRegion,
  buildDungeonMask,
  applyCircleDoorRoomExtensions,
} from "./map-generator.mask.js";
import {
  createCircleConnectionAnchorCandidates,
  createCircleConnectionAnchorFromOutsideCell,
  createCircleDragAnchor,
} from "./map-generator.circle-anchors.js";
import {
  getRoomCellSet,
  getBoundaryCells,
  getDoorBoundaryCells,
  getAnchorCenterOffset,
  getAnchorHandlePoint,
  getClosestBoundaryAnchorToPoint,
  getClosestSharedRoomConnectionToPoint,
  corridorEndpointKey,
  serializeManualAnchor,
  normalizeManualWaypoint,
  isValidPoint,
  isOrganicCorridor,
  getCorridorTopologyCells,
  createDoorFromAnchor,
  getPrimaryCorridorLevelTransition,
  getCorridorConfiguredLevelDelta,
  isCorridorVisibleOnLevel,
  getCorridorPlanarLevel,
  getCorridorIntersectionCells,
  getCrossLevelCorridorIntersectionCells,
  getCorridorCellDirection,
  inferCorridorJunctionOrientation,
  getCorridorJunctionGeometry,
  getCorridorCrossingOrientation,
  getCorridorLocalWallSegmentsForCell,
  getCorridorEndpointCell,
  getWallSegmentAdjacentCells,
  routeCorridors,
  applyLevelMetadata,
} from "./map-generator.corridors.js";
import {
  normalizeMapAccessType,
  getMapAccessLabelForType,
  anchorsShareSideAndCell,
  anchorsShareFinalGeometry,
  createCaveAccessBoundaryAnchor,
  getCaveAccessBounds,
  resolveMapAccessAnchor,
  serializeMapAccessAnchor,
  getClosestExternalBoundaryAnchorToPoint,
} from "./map-generator.details.js";
import { MapSvg, createLevelFilteredMap, getCorridorStairMarkerVirtualDoors, getStairMarkerId, getMapSurface, getRegionSurface, isPureCaveMap } from "./map-generator.render.jsx";
import {
  serializeSvg,
  downloadSvg,
  downloadGmSvg,
  downloadPlayerSvg,
  downloadPrintSvg,
  downloadMapState,
  parseMapStatePayload,
} from "./map-generator.export.js";
import { generateMap } from "./map-generator.pipeline.js";
import {
  buildFullStructuralTestSuite,
  validateExportSvgString,
  validateGeneratedMap,
} from "./map-generator.debug.js";
import {
  createDefaultMapDebugCategories,
  getEditorMapDebugCategories,
  getEditorMapQaScenarios,
  getMapDebugCategory,
} from "./map-generator.debug-options.js";

const SIZE_PRESETS = {
  Tiny: { minW: 3, maxW: 4, minH: 3, maxH: 4 },
  Small: { minW: 4, maxW: 6, minH: 3, maxH: 5 },
  Medium: { minW: 5, maxW: 8, minH: 4, maxH: 6 },
  Large: { minW: 7, maxW: 11, minH: 5, maxH: 8 },
  Huge: { minW: 10, maxW: 14, minH: 7, maxH: 10 },
};

const ROOM_SIZE_MENU_PRESETS = {
  Tiny: { w: 3, h: 3, circleD: 3 },
  Small: { w: 5, h: 4, circleD: 5 },
  Medium: { w: 7, h: 5, circleD: 7 },
  Large: { w: 9, h: 7, circleD: 9 },
  Huge: { w: 12, h: 9, circleD: 12 },
};

const ROOM_LEVEL_MENU_OPTIONS = [-3, -2, -1, 0, 1, 2, 3];
const EDITOR_DISABLED_CORRIDOR_TYPES = new Set(["collapsed", "gallery"]);

const MAP_DEBUG_CATEGORY_OPTIONS = getEditorMapDebugCategories();
const MAP_DEBUG_SCENARIO_OPTIONS = getEditorMapQaScenarios();

const MAP_DEBUG_SPEED_OPTIONS = [
  { id: "fast", label: "Fast" },
  { id: "normal", label: "Normal" },
  { id: "slow", label: "Slow" },
];

const DEFAULT_MAP_DEBUG_CATEGORIES = createDefaultMapDebugCategories(MAP_DEBUG_CATEGORY_OPTIONS);

function cloneMapDebugPayload(value) {
  const seen = new WeakSet();
  try {
    return JSON.parse(
      JSON.stringify(value, (key, nestedValue) => {
        if (typeof nestedValue === "function")
          return `[Function ${nestedValue.name || "anonymous"}]`;
        if (nestedValue instanceof Error) {
          return {
            name: nestedValue.name,
            message: nestedValue.message,
            stack: nestedValue.stack,
          };
        }
        if (typeof nestedValue === "object" && nestedValue !== null) {
          if (seen.has(nestedValue)) return "[Circular]";
          seen.add(nestedValue);
        }
        return nestedValue;
      })
    );
  } catch (error) {
    return {
      unserializable: true,
      error: error instanceof Error ? error.message : String(error),
      value: String(value),
    };
  }
}

function getGlobalMapDebugRecorder() {
  if (typeof window === "undefined") return null;
  const recorder = window.__cruorMapDebugRecorder;
  if (!recorder || typeof recorder !== "object") return null;
  return recorder;
}

function downloadMapDebugBlob(filename, content, type = "application/json") {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function createMapDebugExportPayload({
  categories,
  entries,
  generatedMap,
  manualOverrides,
  recording,
}) {
  return {
    schema: "cruor-map-debug-recorder/v1",
    exportedAt: new Date().toISOString(),
    recording: Boolean(recording),
    categories,
    counts: {
      entries: entries.length,
      corridors: Array.isArray(generatedMap?.corridors) ? generatedMap.corridors.length : 0,
      regions: Array.isArray(generatedMap?.regions) ? generatedMap.regions.length : 0,
      manualDoorAnchors: Object.keys(manualOverrides?.doorAnchors || {}).length,
      manualWaypoints: Object.keys(manualOverrides?.corridorWaypoints || {}).length,
    },
    entries,
  };
}

function formatMapDebugEntryText(entry) {
  return [
    `[${entry.index}] ${entry.timestamp} · ${entry.category} · ${entry.label}`,
    JSON.stringify(entry.payload, null, 2),
  ].join("\n");
}

function MapDebugRecorderPanel({
  categories,
  entries,
  onClear,
  onCopyDebugSvg,
  onDownloadDebugSvg,
  onDownloadJson,
  onDownloadTxt,
  onQaSettingsChange,
  onRecordingChange,
  onRunQaScenario,
  onStopQaScenario,
  onToggleCategory,
  onToggleDebugCoordinates,
  qaRunnerState = null,
  qaSettings = { speed: "normal", stopOnError: true },
  recording,
  showDebugCoordinates = true,
}) {
  const enabledCount = MAP_DEBUG_CATEGORY_OPTIONS.filter(
    (category) => categories[category.id]
  ).length;
  const latestEntries = entries.slice(-6).reverse();
  const speed = qaSettings?.speed || "normal";
  const stopOnError = qaSettings?.stopOnError !== false;
  const qaRunning = qaRunnerState?.state === "running";
  const icon = (name) => <i className={`fa-solid fa-${name} debug-icon`} aria-hidden="true" />;
  const iconButtonClass = (active = false) =>
    active
      ? "mvp-button cruor-button map-debug-recorder__icon-toggle is-active"
      : "mvp-button cruor-button map-debug-recorder__icon-toggle";
  const categoryButtonClass = (active = false) =>
    active
      ? "mvp-button cruor-button map-debug-recorder__icon-toggle map-debug-recorder__category is-active"
      : "mvp-button cruor-button map-debug-recorder__icon-toggle map-debug-recorder__category";
  const setQaSetting = (patch) => {
    onQaSettingsChange?.({
      speed,
      stopOnError,
      ...patch,
    });
  };

  return (
    <section
      className="map-debug-recorder location-frame-info-card"
      data-debug-recorder-tools="coordinates-svg-v3"
      aria-label="Dark Places debug recorder"
    >
      <div className="map-debug-recorder__header">
        <span>Debug Recorder</span>
        <strong>{recording ? "Recording" : "Idle"}</strong>
      </div>
      <p className="map-debug-recorder__summary">
        {entries.length} event{entries.length === 1 ? "" : "s"} · {enabledCount} listener
        {enabledCount === 1 ? "" : "s"} active
        {qaRunnerState?.state ? ` · QA ${qaRunnerState.state}` : ""}
      </p>

      <div
        className="map-debug-recorder__actions map-debug-recorder__icon-toggle-grid"
      >
        <button
          type="button"
          className={iconButtonClass(recording)}
          aria-label={recording ? "Stop recording" : "Start recording"}
          {...getGenericTooltipAttrs(recording ? "Stop Recording" : "Start Recording")}
          onClick={() => onRecordingChange(!recording)}
        >
          {icon(recording ? "stop" : "circle")}
        </button>
        <button
          type="button"
          className={iconButtonClass(showDebugCoordinates)}
          aria-label={showDebugCoordinates ? "Hide map coordinates" : "Show map coordinates"}
          aria-pressed={Boolean(showDebugCoordinates)}
          {...getGenericTooltipAttrs(
            showDebugCoordinates ? "Hide Coordinates" : "Show Coordinates",
            "Toggle debug coordinate labels on the rendered map."
          )}
          onClick={() => onToggleDebugCoordinates?.(!showDebugCoordinates)}
        >
          {icon("table-cells")}
        </button>
        <button
          type="button"
          className={`${iconButtonClass(false)} map-debug-recorder__svg-action map-debug-recorder__svg-copy`}
          aria-label="Copy debug SVG with coordinates"
          title="Copy Debug SVG with coordinates"
          {...getGenericTooltipAttrs(
            "Copy Debug SVG",
            "Copy the current rendered SVG with coordinate labels included."
          )}
          onClick={onCopyDebugSvg}
        >
          {icon("copy")}
        </button>
        <button
          type="button"
          className={`${iconButtonClass(false)} map-debug-recorder__svg-action map-debug-recorder__svg-download`}
          aria-label="Download debug SVG with coordinates"
          title="Download Debug SVG with coordinates"
          {...getGenericTooltipAttrs(
            "Download Debug SVG",
            "Download the current rendered SVG with coordinate labels included."
          )}
          onClick={onDownloadDebugSvg}
        >
          {icon("file-arrow-down")}
        </button>
        <button
          type="button"
          className={iconButtonClass(false)}
          aria-label="Clear debug events"
          {...getGenericTooltipAttrs("Clear Events")}
          onClick={onClear}
          disabled={!entries.length}
        >
          {icon("trash-can")}
        </button>
        <button
          type="button"
          className={iconButtonClass(false)}
          aria-label="Download debug JSON"
          {...getGenericTooltipAttrs("Download JSON")}
          onClick={onDownloadJson}
          disabled={!entries.length}
        >
          {icon("file-code")}
        </button>
        <button
          type="button"
          className={iconButtonClass(false)}
          aria-label="Download debug TXT"
          {...getGenericTooltipAttrs("Download TXT")}
          onClick={onDownloadTxt}
          disabled={!entries.length}
        >
          {icon("file-lines")}
        </button>
      </div>

      <div
        className="map-debug-recorder__actions map-debug-recorder__scenario-actions"
      >
        <select
          className="map-debug-recorder__speed-select"
          data-debug-control="qa-speed"
          aria-label="QA runner speed"
          title="QA runner speed"
          value={speed}
          onChange={(event) => setQaSetting({ speed: event.target.value })}
        >
          {MAP_DEBUG_SPEED_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`${iconButtonClass(stopOnError)} map-debug-recorder__stop-toggle`}
          aria-label={stopOnError ? "Stop on error enabled" : "Stop on error disabled"}
          aria-pressed={Boolean(stopOnError)}
          {...getGenericTooltipAttrs(
            "Stop on Error",
            stopOnError ? "QA runner stops after the first failure." : "QA runner records failures and continues when possible."
          )}
          onClick={() => setQaSetting({ stopOnError: !stopOnError })}
        >
          {icon(stopOnError ? "octagon-exclamation" : "triangle-exclamation")}
        </button>
        {MAP_DEBUG_SCENARIO_OPTIONS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className={iconButtonClass(qaRunning && qaRunnerState?.scenarioId === scenario.id)}
            aria-label={scenario.label}
            {...getGenericTooltipAttrs(scenario.label)}
            onClick={() => onRunQaScenario?.(scenario.id, { speed, stopOnError })}
            disabled={qaRunning}
          >
            {icon(scenario.icon)}
          </button>
        ))}
        <button
          type="button"
          className={iconButtonClass(false)}
          aria-label="Stop QA runner"
          {...getGenericTooltipAttrs("Stop QA Runner")}
          onClick={onStopQaScenario}
          disabled={!qaRunning}
        >
          {icon("square")}
        </button>
      </div>

      <div
        className="map-debug-recorder__categories map-debug-recorder__icon-toggle-grid"
        role="group"
        aria-label="Debug listener categories"
      >
        {MAP_DEBUG_CATEGORY_OPTIONS.map((category) => (
          <button
            key={category.id}
            type="button"
            className={categoryButtonClass(Boolean(categories[category.id]))}
            aria-label={category.label}
            aria-pressed={Boolean(categories[category.id])}
            {...getGenericTooltipAttrs(category.label)}
            onClick={() => onToggleCategory(category.id)}
          >
            {icon(category.icon || (categories[category.id] ? "toggle-on" : "toggle-off"))}
          </button>
        ))}
      </div>
      <div className="map-debug-recorder__feed" aria-live="polite">
        {latestEntries.length ? (
          latestEntries.map((entry) => (
            <article className="map-debug-recorder__entry" key={entry.id}>
              <small>
                {entry.category} · #{entry.index}
              </small>
              <strong>{entry.label}</strong>
            </article>
          ))
        ) : (
          <p>No events recorded yet.</p>
        )}
      </div>
    </section>
  );
}

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
  let state = typeof seed === "number" ? seed >>> 0 : hashStringToSeed(String(seed));
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

function pickOne(rng, values) {
  return values[Math.floor(rng() * values.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getFixedContextMenuPosition(event, width = 250, height = 280) {
  const margin = 8;
  const viewportWidth = typeof window === "undefined" ? width + margin * 2 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? height + margin * 2 : window.innerHeight;
  return {
    x: clamp(event.clientX, margin, Math.max(margin, viewportWidth - width - margin)),
    y: clamp(event.clientY, margin, Math.max(margin, viewportHeight - height - margin)),
  };
}

function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function rectsOverlapWithMargin(a, b, margin = 2) {
  return !(
    a.x + a.w + margin <= b.x ||
    b.x + b.w + margin <= a.x ||
    a.y + a.h + margin <= b.y ||
    b.y + b.h + margin <= a.y
  );
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const MAP_WALL_STYLE_PROFILES = Object.freeze({
  cruor: Object.freeze({ main: 3.8, shadow: 7.6, sketch: 1.05, break: 1.35 }),
  ink: Object.freeze({ main: 4.05, shadow: 7.2, sketch: 1.15, break: 1.45 }),
  cartographic: Object.freeze({ main: 2.2, shadow: 3.2, sketch: 0.01, break: 1 }),
  blood: Object.freeze({ main: 5.15, shadow: 9.2, sketch: 1.45, break: 1.7 }),
  bone: Object.freeze({ main: 3.15, shadow: 6.2, sketch: 1.05, break: 1.2 }),
  print: Object.freeze({ main: 2.8, shadow: 0.01, sketch: 0.01, break: 1 }),
});

function getMapWallStyleProfile(visualStyle) {
  return (
    MAP_WALL_STYLE_PROFILES[normalizeVisualStyle(visualStyle)] || MAP_WALL_STYLE_PROFILES.cruor
  );
}

const WALL_DRAWING_STYLE_OPTIONS = Object.freeze([
  Object.freeze({ value: "drawn", label: "Drawn", icon: "pen-nib" }),
  Object.freeze({ value: "precise", label: "Precise", icon: "ruler-combined" }),
]);

const HATCH_SHADOW_COLOR_OPTIONS = Object.freeze([
  Object.freeze({ value: "default", label: "Default", icon: "circle-half-stroke" }),
  Object.freeze({ value: "black", label: "Black", icon: "circle" }),
  Object.freeze({ value: "blood", label: "Blood", icon: "droplet" }),
  Object.freeze({ value: "bone", label: "Bone", icon: "bone" }),
  Object.freeze({ value: "none", label: "None", icon: "ban" }),
]);

function normalizeWallDrawingStyle(value) {
  return value === "precise" ? "precise" : "drawn";
}

function normalizeHatchShadowColor(value) {
  return HATCH_SHADOW_COLOR_OPTIONS.some((option) => option.value === value) ? value : "default";
}

function getOptionLabel(options, value, fallback = "") {
  return options.find((option) => option.value === value)?.label || fallback || value || "";
}

function stableSerializeForMemo(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerializeForMemo(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerializeForMemo(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function createLockedGenerationManualSnapshot(manualOverrides) {
  const normalized = normalizeManualOverrides(manualOverrides);
  return {
    doorAnchors: normalized.doorAnchors || {},
    doorTypes: normalized.doorTypes || {},
    levels: normalized.levels || {},
    mapAccesses: normalized.mapAccesses || {},
    corridorJunctions: normalized.corridorJunctions || {},
    corridorWaypoints: normalized.corridorWaypoints || {},
    corridorTypes: normalized.corridorTypes || {},
    customConnections: normalized.customConnections || [],
    deletedConnections: normalized.deletedConnections || [],
    roomStyles: normalized.roomStyles || {},
  };
}

function createLockedRawGenerationManualOverrides(snapshot = {}) {
  return {
    roomPositions: {},
    doorAnchors: {},
    doorTypes: snapshot.doorTypes || {},
    levels: snapshot.levels || {},
    mapAccesses: snapshot.mapAccesses || {},
    corridorJunctions: {},
    corridorWaypoints: {},
    corridorTypes: snapshot.corridorTypes || {},
    customConnections: [],
    deletedConnections: [],
    roomStyles: snapshot.roomStyles || {},
  };
}

function getPreviewAnchorIdentity(anchor) {
  if (!anchor) return "none";
  const cell =
    anchor.snapCell || anchor.routingOutsideCell || anchor.outsideCell || anchor.cell || null;
  const point = anchor.point || anchor.displayPoint || null;
  return [
    anchor.side || "",
    cell ? cell.x : "",
    cell ? cell.y : "",
    point && Number.isFinite(point.x) ? Math.round(point.x * 10) / 10 : "",
    point && Number.isFinite(point.y) ? Math.round(point.y * 10) / 10 : "",
  ].join(":");
}

function getRoomDragRoutedPreviewKey(roomDragPreview) {
  if (!roomDragPreview || roomDragPreview.phase === "committing") return "";
  return [
    "room",
    roomDragPreview.regionId || "",
    roomDragPreview.x ?? "",
    roomDragPreview.y ?? "",
  ].join(":");
}

function getConnectionDraftRoutedPreviewKey(connectionDraft) {
  if (!connectionDraft || connectionDraft.invalid) return "";
  if (!connectionDraft.fromRegionId || !connectionDraft.toRegionId) return "";
  return [
    "connection",
    connectionDraft.fromRegionId,
    getPreviewAnchorIdentity(connectionDraft.fromAnchor),
    connectionDraft.toRegionId,
    getPreviewAnchorIdentity(connectionDraft.toAnchor || connectionDraft.target?.anchor),
  ].join("|");
}

export function MapViewport({
  generatedMap,
  showGrid,
  gridStyle = DEFAULT_CONFIG.gridStyle,
  gridOpacity = 0.72,
  gridColor = DEFAULT_CONFIG.gridColor,
  gridWeight = DEFAULT_CONFIG.gridWeight,
  crosshatchStyle = "classic",
  crosshatchOpacity = 0.72,
  wallDrawingStyle = "drawn",
  hatchShadowColor = "default",
  selectedRegionId = "",
  onSelectedRegionChange = null,
  onRegionHoverChange = null,
  onRegionContextMenu = null,
  enablePreviewRegionHotspots = false,
  previewRegionMarkers = {},
  showEditor,
  showNames,
  showRoomBadges = true,
  showProps,
  showAccessDots = false,
  levelView = LEVEL_VIEW_ALL,
  fadeOtherLevels = true,
  availableLevels = [],
  manualOverrides,
  onRoomMove,
  onDoorMove,
  onDoorTypeChange,
  onDoorStairChange,
  onCorridorTypeChange,
  onMapAccessMove,
  onMapAccessSet,
  onMapAccessRemove,
  onJunctionTypeChange,
  onWaypointMove,
  onWaypointInsert,
  onWaypointDelete,
  onConnectionDelete,
  onCreateConnection,
  onRoomStyleChange,
  onRoomStyleReset,
  onRoomLevelChange,
  onRoomLevelReset,
  onEditStart,
  onEditCommit,
  onUndo,
  onRedo,
  onNewSeed,
  onToggleGrid,
  onGridStyleChange,
  onToggleEditor,
  onToggleNames,
  onToggleProps,
  onToggleAccessDots,
  onLevelViewChange,
  onToggleFadeOtherLevels,
  onResetEdits,
  onExportSvg,
  onExportGmSvg,
  onExportPlayerSvg,
  onExportPrintSvg,
  onExportState,
  onImportState,
  viewResetKey,
  embeddedPreview = false,
  allowEmbeddedInteractions = false,
  showViewportChrome = true,
  enableViewportInteractions = true,
  viewportMode = embeddedPreview ? "composer-preview" : "workspace",
  viewportClassName = "",
  onViewportMetricsChange = null,
  onViewportControlsChange = null,
  onCreateRoomDragPreviewMap = null,
  onCreateConnectionDraftPreviewMap = null,
  onDebugRecord = null,
  showDebugCellCoordinates = false,
}) {
  const viewportRef = useRef(null);
  const panRef = useRef(null);
  const panMoveFrameRef = useRef(null);
  const pendingPanViewRef = useRef(null);
  const roomDragRef = useRef(null);
  const roomMoveFrameRef = useRef(null);
  const pendingRoomMoveRef = useRef(null);
  const roomDragPreviewRef = useRef(null);
  const corridorDragRef = useRef(null);
  const corridorMoveFrameRef = useRef(null);
  const pendingCorridorMoveRef = useRef(null);
  const corridorDragPreviewRef = useRef(null);
  const accessDragRef = useRef(null);
  const accessMoveFrameRef = useRef(null);
  const pendingAccessMoveRef = useRef(null);
  const connectionDragRef = useRef(null);
  const connectionDraftRef = useRef(null);
  const roomRoutedPreviewTimerRef = useRef(null);
  const connectionRoutedPreviewTimerRef = useRef(null);
  const routedPreviewCacheRef = useRef(new Map());
  const roomDragPreviewMapCallbackRef = useRef(onCreateRoomDragPreviewMap);
  const connectionDraftPreviewMapCallbackRef = useRef(onCreateConnectionDraftPreviewMap);
  const contentBoundsRef = useRef(generatedMap.contentBounds);
  const lastViewResetKeyRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingRegionId, setDraggingRegionId] = useState(null);
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [roomDragPreview, setRoomDragPreview] = useState(null);
  const [draggingCorridorHandle, setDraggingCorridorHandle] = useState(null);
  const [corridorDragPreview, setCorridorDragPreview] = useState(null);
  const [draggingMapAccessId, setDraggingMapAccessId] = useState(null);
  const [mapAccessDragPreview, setMapAccessDragPreview] = useState(null);
  const [hoverWallHandle, setHoverWallHandle] = useState(null);
  const [hoverCorridorHandle, setHoverCorridorHandle] = useState(null);
  const [hoveredCorridorId, setHoveredCorridorId] = useState(null);
  const [selectedStairMarker, setSelectedStairMarker] = useState(null);
  const selectedStairMarkerId = selectedStairMarker?.id || "";
  const selectedStairCorridorId = selectedStairMarker?.corridorId || "";
  const selectedStairIndex = selectedStairMarker?.markerIndex ?? null;
  const [connectionDraft, setConnectionDraft] = useState(null);
  const [roomDragRoutedPreviewState, setRoomDragRoutedPreviewState] = useState(null);
  const [connectionDraftRoutedPreviewState, setConnectionDraftRoutedPreviewState] = useState(null);
  roomDragPreviewMapCallbackRef.current = onCreateRoomDragPreviewMap;
  connectionDraftPreviewMapCallbackRef.current = onCreateConnectionDraftPreviewMap;
  const roomDragPreviewKey = getRoomDragRoutedPreviewKey(roomDragPreview);
  const connectionDraftPreviewKey = getConnectionDraftRoutedPreviewKey(connectionDraft);
  const roomDragRoutedPreview =
    roomDragRoutedPreviewState?.key === roomDragPreviewKey
      ? roomDragRoutedPreviewState.value
      : null;
  const connectionDraftRoutedPreview =
    connectionDraftRoutedPreviewState?.key === connectionDraftPreviewKey
      ? connectionDraftRoutedPreviewState.value
      : null;
  const [roomContextMenu, setRoomContextMenu] = useState(null);
  const [doorContextMenu, setDoorContextMenu] = useState(null);
  const [junctionContextMenu, setJunctionContextMenu] = useState(null);
  const [waypointContextMenu, setWaypointContextMenu] = useState(null);
  const [addWaypointContextMenu, setAddWaypointContextMenu] = useState(null);
  const [wallAccessContextMenu, setWallAccessContextMenu] = useState(null);
  const pureCaveEditor = isPureCaveMap(generatedMap);
  const [mapContextMenu, setMapContextMenu] = useState(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [viewportSize, setViewportSize] = useState({
    width: generatedMap.config.mapWidth,
    height: generatedMap.config.mapHeight,
  });
  const viewportInteractive =
    enableViewportInteractions && (!embeddedPreview || allowEmbeddedInteractions);
  const shouldShowViewportChrome = showViewportChrome && !embeddedPreview;
  const wallStrokeScale = clamp(view.scale / 0.85, 0.62, 1);
  const wallStyleProfile = getMapWallStyleProfile(generatedMap.config.visualStyle);
  const wallStrokeVariables = {
    "--cruor-map-wall-main-width": String(roundTo(wallStyleProfile.main * wallStrokeScale, 2)),
    "--cruor-map-wall-shadow-width": String(roundTo(wallStyleProfile.shadow * wallStrokeScale, 2)),
    "--cruor-map-wall-sketch-width": String(roundTo(wallStyleProfile.sketch * wallStrokeScale, 2)),
    "--cruor-map-wall-break-width": String(roundTo(wallStyleProfile.break * wallStrokeScale, 2)),
  };

  contentBoundsRef.current = generatedMap.contentBounds;

  function setConnectionDraftState(nextDraft) {
    connectionDraftRef.current = nextDraft;
    setConnectionDraft(nextDraft);
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateSize = () => {
      const rect = viewport.getBoundingClientRect();
      setViewportSize({
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const stage = viewport.closest?.(".location-map-stage");
    if (!stage) return undefined;

    let frame = 0;
    const syncStageGrid = () => {
      frame = 0;
      const viewportRect = viewport.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const gridVisible = Boolean(showGrid);
      const gridSize = Math.max(1, generatedMap.config.gridSize || 20);
      const scaledGridSize = Math.max(1, gridSize * view.scale);
      const gridOriginX = viewportRect.left - stageRect.left + view.x;
      const gridOriginY = viewportRect.top - stageRect.top + view.y;

      stage.dataset.mapGridVisible = gridVisible ? "true" : "false";
      stage.dataset.mapGridStyle = "solid";
      stage.style.setProperty("--location-map-stage-grid-size", `${scaledGridSize}px`);
      stage.style.setProperty("--location-map-stage-grid-x", `${gridOriginX}px`);
      stage.style.setProperty("--location-map-stage-grid-y", `${gridOriginY}px`);
    };

    const requestSync = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncStageGrid);
    };

    requestSync();
    const observer = new ResizeObserver(requestSync);
    observer.observe(viewport);
    observer.observe(stage);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      delete stage.dataset.mapGridVisible;
      delete stage.dataset.mapGridStyle;
      stage.style.removeProperty("--location-map-stage-grid-size");
      stage.style.removeProperty("--location-map-stage-grid-x");
      stage.style.removeProperty("--location-map-stage-grid-y");
    };
  }, [
    generatedMap.config.gridSize,
    showGrid,
    view.x,
    view.y,
    view.scale,
    viewportSize.width,
    viewportSize.height,
  ]);

  const constrainView = useCallback(
    (candidate) => {
      const viewport = viewportRef.current;
      if (!viewport) return candidate;
      const rect = viewport.getBoundingClientRect();
      const scaledWidth = generatedMap.config.mapWidth * candidate.scale;
      const scaledHeight = generatedMap.config.mapHeight * candidate.scale;
      const minX = Math.min(0, rect.width - scaledWidth);
      const minY = Math.min(0, rect.height - scaledHeight);
      return {
        ...candidate,
        x: scaledWidth <= rect.width ? (rect.width - scaledWidth) / 2 : clamp(candidate.x, minX, 0),
        y:
          scaledHeight <= rect.height
            ? (rect.height - scaledHeight) / 2
            : clamp(candidate.y, minY, 0),
      };
    },
    [generatedMap.config.mapWidth, generatedMap.config.mapHeight]
  );

  const fitView = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const bounds = contentBoundsRef.current;
    const margin = 64;
    const availableWidth = Math.max(120, rect.width - margin * 2);
    const availableHeight = Math.max(120, rect.height - margin * 2);
    const nextScale = clamp(
      Math.min(availableWidth / bounds.width, availableHeight / bounds.height),
      0.35,
      1.45
    );
    setView(
      constrainView({
        scale: nextScale,
        x: (rect.width - bounds.width * nextScale) / 2 - bounds.x * nextScale,
        y: (rect.height - bounds.height * nextScale) / 2 - bounds.y * nextScale,
      })
    );
  }, [constrainView]);

  useEffect(() => {
    if (lastViewResetKeyRef.current === viewResetKey) return;
    if (roomDragRef.current) return;
    lastViewResetKeyRef.current = viewResetKey;
    const frame = window.requestAnimationFrame(fitView);
    return () => window.cancelAnimationFrame(frame);
  }, [fitView, viewResetKey]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    let frame = 0;
    const refitAfterResize = () => {
      if (
        roomDragRef.current ||
        corridorDragRef.current ||
        accessDragRef.current ||
        connectionDragRef.current
      )
        return;

      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(fitView);
    };

    const observer = new ResizeObserver(refitAfterResize);
    observer.observe(viewport);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [fitView]);

  const zoomAtPoint = useCallback(
    (clientX, clientY, factor) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      setView((current) => {
        const nextScale = clamp(current.scale * factor, 0.35, 4);
        const mapX = (px - current.x) / current.scale;
        const mapY = (py - current.y) / current.scale;
        return constrainView({
          scale: nextScale,
          x: px - mapX * nextScale,
          y: py - mapY * nextScale,
        });
      });
    },
    [constrainView]
  );

  const zoomAtCenter = useCallback(
    (factor) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
    },
    [zoomAtPoint]
  );

  const viewportControls = useMemo(
    () => ({
      zoomIn: () => zoomAtCenter(1.15),
      zoomOut: () => zoomAtCenter(0.85),
      resetZoom: fitView,
      scale: view.scale,
    }),
    [fitView, view.scale, zoomAtCenter]
  );

  useEffect(() => {
    if (typeof onViewportControlsChange !== "function") return;
    onViewportControlsChange(viewportControls);
  }, [onViewportControlsChange, viewportControls]);

  useEffect(
    () => () => {
      if (typeof onViewportControlsChange === "function") {
        onViewportControlsChange(null);
      }
    },
    [onViewportControlsChange]
  );

  function clientToMapPoint(event) {
    const viewport = viewportRef.current;
    if (!viewport) return null;
    const rect = viewport.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - view.x) / view.scale,
      y: (event.clientY - rect.top - view.y) / view.scale,
    };
  }

  function isViewportMapEditorDebugEnabled() {
    return typeof onDebugRecord === "function";
  }

  function roundViewportDebugNumber(value) {
    return Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) / 100 : value;
  }

  function roundViewportDebugPoint(point) {
    if (!point || typeof point !== "object") return point || null;
    return {
      x: roundViewportDebugNumber(point.x),
      y: roundViewportDebugNumber(point.y),
    };
  }

  function getViewportDebugPointCell(point) {
    if (!point) return null;
    const gridSize = generatedMap?.config?.gridSize || 20;
    return {
      x: Math.floor(point.x / gridSize),
      y: Math.floor(point.y / gridSize),
    };
  }

  function summarizeViewportDebugCell(cell) {
    if (!cell) return null;
    return { x: cell.x, y: cell.y };
  }

  function summarizeViewportDebugAnchor(anchor) {
    if (!anchor) return null;
    return {
      side: anchor.side || null,
      cell: summarizeViewportDebugCell(anchor.cell),
      outsideCell: summarizeViewportDebugCell(anchor.outsideCell),
      portalRoomCell: summarizeViewportDebugCell(anchor.portalRoomCell),
      routingOutsideCell: summarizeViewportDebugCell(anchor.routingOutsideCell),
      raccordoCell: summarizeViewportDebugCell(anchor.raccordoCell),
      raccordoCells: Array.isArray(anchor.raccordoCells)
        ? anchor.raccordoCells.map(summarizeViewportDebugCell).filter(Boolean)
        : [],
      corridorStartCell: summarizeViewportDebugCell(anchor.corridorStartCell),
      snapCell: summarizeViewportDebugCell(anchor.snapCell),
      finalGeometry: Boolean(anchor.finalGeometry),
      expandedCircleDoor: Boolean(anchor.expandedCircleDoor),
      circleBoundaryAnchor: Boolean(anchor.circleBoundaryAnchor),
    };
  }

  function summarizeViewportDebugCorridor(corridor) {
    if (!corridor) return null;
    return {
      id: corridor.id,
      from: corridor.from,
      to: corridor.to,
      cells: Array.isArray(corridor.cells) ? corridor.cells.length : 0,
      doors: Array.isArray(corridor.doors)
        ? corridor.doors.map((door) => ({
            endpoint: door.endpoint || null,
            regionId: door.regionId || null,
            cell: summarizeViewportDebugCell(door.cell),
            side: door.side || null,
          }))
        : [],
      waypointCount: Array.isArray(corridor.manualWaypoints)
        ? corridor.manualWaypoints.length
        : Array.isArray(corridor.waypoints)
          ? corridor.waypoints.length
          : 0,
      isRoomLink: Boolean(corridor.isRoomLink),
      recovered: Boolean(corridor.recovered),
    };
  }

  function summarizeViewportDebugManualOverrides(overrides) {
    const normalized = normalizeManualOverrides(overrides || {});
    return {
      doorAnchorKeys: Object.keys(normalized.doorAnchors || {}).sort(),
      corridorWaypointKeys: Object.keys(normalized.corridorWaypoints || {}).sort(),
      customConnectionIds: (normalized.customConnections || [])
        .map((connection) => connection.id)
        .sort(),
      deletedConnections: [...(normalized.deletedConnections || [])].sort(),
      mapAccessKeys: Object.keys(normalized.mapAccesses || {}).sort(),
      roomPositionKeys: Object.keys(normalized.roomPositions || {}).sort(),
      roomStyleKeys: Object.keys(normalized.roomStyles || {}).sort(),
    };
  }

  function summarizeViewportDebugMap(map) {
    if (!map) return null;
    return {
      corridorCount: Array.isArray(map.corridors) ? map.corridors.length : 0,
      corridorIds: (map.corridors || []).map((corridor) => corridor.id).sort(),
      regionCount: Array.isArray(map.regions) ? map.regions.length : 0,
      mapAccesses: (map.dungeonMask?.mapAccesses || map.mapAccesses || []).map((access) => ({
        id: access.id || null,
        regionId: access.regionId || null,
        type: access.type || null,
        cell: summarizeViewportDebugCell(access.cell),
        side: access.side || null,
      })),
    };
  }

  function viewportDebugEvent(label, payload = {}) {
    if (!isViewportMapEditorDebugEnabled()) return;
    onDebugRecord?.(label, payload, { source: "viewport" });
  }

  function setRoomDragPreviewState(nextPreview) {
    roomDragPreviewRef.current = nextPreview;
    setRoomDragPreview(nextPreview);
  }

  function setCorridorDragPreviewState(nextPreview) {
    corridorDragPreviewRef.current = nextPreview;
    setCorridorDragPreview(nextPreview);
  }

  useEffect(() => {
    routedPreviewCacheRef.current.clear();
    setRoomDragRoutedPreviewState(null);
    setConnectionDraftRoutedPreviewState(null);
    setSelectedStairMarker((current) => {
      if (!current) return current;
      const corridor = generatedMap.corridors?.find(
        (candidate) => candidate.id === current.corridorId,
      );
      if (!corridor) return null;
      const stillExists = getCorridorStairMarkerVirtualDoors(corridor, generatedMap).some(
        (marker) => getStairMarkerId(marker) === current.id,
      );
      return stillExists ? current : null;
    });
  }, [generatedMap]);

  useEffect(() => {
    if (!showEditor) setSelectedStairMarker(null);
  }, [showEditor]);

  useEffect(() => {
    const key = getRoomDragRoutedPreviewKey(roomDragPreview);
    if (roomRoutedPreviewTimerRef.current) {
      window.clearTimeout(roomRoutedPreviewTimerRef.current);
      roomRoutedPreviewTimerRef.current = null;
    }
    if (!key || typeof roomDragPreviewMapCallbackRef.current !== "function") {
      setRoomDragRoutedPreviewState(null);
      return undefined;
    }
    const cached = routedPreviewCacheRef.current.get(key);
    if (cached) {
      setRoomDragRoutedPreviewState({ key, value: cached });
      return undefined;
    }
    roomRoutedPreviewTimerRef.current = window.setTimeout(() => {
      roomRoutedPreviewTimerRef.current = null;
      const active = roomDragPreviewRef.current;
      if (getRoomDragRoutedPreviewKey(active) !== key) return;
      try {
        const result = roomDragPreviewMapCallbackRef.current?.(active.regionId, {
          x: active.x,
          y: active.y,
        });
        if (!result) return;
        routedPreviewCacheRef.current.set(key, result);
        if (routedPreviewCacheRef.current.size > 48) {
          const firstKey = routedPreviewCacheRef.current.keys().next().value;
          routedPreviewCacheRef.current.delete(firstKey);
        }
        if (getRoomDragRoutedPreviewKey(roomDragPreviewRef.current) === key) {
          setRoomDragRoutedPreviewState({ key, value: result });
        }
      } catch (error) {
        viewportDebugEvent("room drag routed preview failed", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, 220);
    return () => {
      if (roomRoutedPreviewTimerRef.current) {
        window.clearTimeout(roomRoutedPreviewTimerRef.current);
        roomRoutedPreviewTimerRef.current = null;
      }
    };
  }, [roomDragPreview]);

  useEffect(() => {
    const key = getConnectionDraftRoutedPreviewKey(connectionDraft);
    if (connectionRoutedPreviewTimerRef.current) {
      window.clearTimeout(connectionRoutedPreviewTimerRef.current);
      connectionRoutedPreviewTimerRef.current = null;
    }
    if (!key || typeof connectionDraftPreviewMapCallbackRef.current !== "function") {
      setConnectionDraftRoutedPreviewState(null);
      return undefined;
    }
    const cached = routedPreviewCacheRef.current.get(key);
    if (cached) {
      setConnectionDraftRoutedPreviewState({ key, value: cached });
      return undefined;
    }
    connectionRoutedPreviewTimerRef.current = window.setTimeout(() => {
      connectionRoutedPreviewTimerRef.current = null;
      const active = connectionDraftRef.current;
      if (getConnectionDraftRoutedPreviewKey(active) !== key) return;
      try {
        const result = connectionDraftPreviewMapCallbackRef.current?.({
          fromRegionId: active.fromRegionId,
          fromAnchor: active.fromAnchor,
          toRegionId: active.toRegionId,
          toAnchor: active.toAnchor || active.target?.anchor || null,
        });
        if (!result) return;
        routedPreviewCacheRef.current.set(key, result);
        if (routedPreviewCacheRef.current.size > 48) {
          const firstKey = routedPreviewCacheRef.current.keys().next().value;
          routedPreviewCacheRef.current.delete(firstKey);
        }
        if (getConnectionDraftRoutedPreviewKey(connectionDraftRef.current) === key) {
          setConnectionDraftRoutedPreviewState({ key, value: result });
        }
      } catch (error) {
        viewportDebugEvent("connection routed preview failed", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, 260);
    return () => {
      if (connectionRoutedPreviewTimerRef.current) {
        window.clearTimeout(connectionRoutedPreviewTimerRef.current);
        connectionRoutedPreviewTimerRef.current = null;
      }
    };
  }, [connectionDraft]);

  useEffect(() => {
    const roomPreview = roomDragPreviewRef.current;
    const corridorPreview = corridorDragPreviewRef.current;
    if (roomPreview?.phase !== "committing" && corridorPreview?.phase !== "committing")
      return undefined;

    const frame = window.requestAnimationFrame(() => {
      if (roomDragPreviewRef.current?.phase === "committing") {
        setRoomDragPreviewState(null);
      }
      if (corridorDragPreviewRef.current?.phase === "committing") {
        setCorridorDragPreviewState(null);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [generatedMap]);

  function setPreviewHoveredRegion(regionId) {
    const normalizedRegionId = regionId || null;
    setHoveredRegionId(normalizedRegionId);
    onRegionHoverChange?.(normalizedRegionId || "");
  }

  const viewportViewBox = useMemo(
    () => ({
      x: -view.x / view.scale,
      y: -view.y / view.scale,
      width: viewportSize.width / view.scale,
      height: viewportSize.height / view.scale,
    }),
    [view.x, view.y, view.scale, viewportSize.width, viewportSize.height]
  );

  function getViewportViewBox() {
    return `${viewportViewBox.x} ${viewportViewBox.y} ${viewportViewBox.width} ${viewportViewBox.height}`;
  }

  useEffect(() => {
    if (typeof onViewportMetricsChange !== "function") return;
    onViewportMetricsChange({
      viewBox: viewportViewBox,
      scale: view.scale,
      viewportSize,
    });
  }, [
    onViewportMetricsChange,
    view.scale,
    viewportSize.width,
    viewportSize.height,
    viewportViewBox,
  ]);

  const handleWheel = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (
        roomDragRef.current ||
        corridorDragRef.current ||
        accessDragRef.current ||
        connectionDragRef.current
      )
        return;
      zoomAtPoint(event.clientX, event.clientY, event.deltaY > 0 ? 0.9 : 1.1);
    },
    [zoomAtPoint]
  );

  useEffect(() => {
    if (!viewportInteractive) return undefined;
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [handleWheel, viewportInteractive]);

  useEffect(
    () => () => {
      if (roomMoveFrameRef.current) window.cancelAnimationFrame(roomMoveFrameRef.current);
      if (corridorMoveFrameRef.current) window.cancelAnimationFrame(corridorMoveFrameRef.current);
      if (accessMoveFrameRef.current) window.cancelAnimationFrame(accessMoveFrameRef.current);
      if (panMoveFrameRef.current) window.cancelAnimationFrame(panMoveFrameRef.current);
    },
    []
  );

  function openMapContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    setRoomContextMenu(null);
    setDoorContextMenu(null);
    setJunctionContextMenu(null);
    setWaypointContextMenu(null);
    setAddWaypointContextMenu(null);
    setMapContextMenu({
      ...getFixedContextMenuPosition(event, 270, 420),
    });
  }

  function handleRoomContextMenu(event, region) {
    if (!showEditor) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    setMapContextMenu(null);
    setDoorContextMenu(null);
    setJunctionContextMenu(null);
    setWaypointContextMenu(null);
    setAddWaypointContextMenu(null);
    setRoomContextMenu({
      regionId: region.id,
      ...getFixedContextMenuPosition(event, 520, 420),
    });
  }

  function handleRoomPointerEnter(event, region) {
    if (
      !showEditor ||
      roomDragRef.current ||
      corridorDragRef.current ||
      accessDragRef.current ||
      connectionDragRef.current
    )
      return;
    event.stopPropagation();
    setHoverWallHandle(null);
    setHoverCorridorHandle(null);
    setHoveredCorridorId(null);
    setHoveredRegionId(region.id);
    onRegionHoverChange?.(region.id);
  }

  function handleRoomPointerLeave(event, region) {
    if (!showEditor || roomDragRef.current) return;
    event.stopPropagation();
    setHoveredRegionId((current) => (current === region.id ? null : current));
    onRegionHoverChange?.("");
  }

  function handleRoomPointerDown(event, region) {
    if (!showEditor) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    setHoveredRegionId(region.id);
    onRegionHoverChange?.(region.id);
    onEditStart?.();
    const point = clientToMapPoint(event);
    if (!point) return;
    roomDragRef.current = {
      pointerId: event.pointerId,
      regionId: region.id,
      startX: point.x,
      startY: point.y,
      originX: region.cellRect.x,
      originY: region.cellRect.y,
      lastX: region.cellRect.x,
      lastY: region.cellRect.y,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
    setDraggingRegionId(region.id);
  }

  function getPureCaveWallAnchorFromEvent(event, zone) {
    if (!pureCaveEditor || !zone?.anchor?.finalGeometry || !zone.anchor.segment)
      return zone?.anchor || null;
    const point = clientToMapPoint(event) || zone.point || zone.anchor.point;
    const segments = generatedMap.finalGeometry?.caveSurface?.boundarySegments || [];
    const bounds = zone.anchor.caveBounds || getCaveAccessBounds(segments, generatedMap);
    return (
      createCaveAccessBoundaryAnchor(
        zone.anchor.segment,
        generatedMap,
        zone.anchor.finalBoundaryIndex,
        bounds,
        point
      ) || zone.anchor
    );
  }

  function anchorsMatchEditorLocation(a, b) {
    if (!a || !b) return false;
    if (anchorsShareFinalGeometry(a, b)) {
      const ax = a.point?.x;
      const ay = a.point?.y;
      const bx = b.point?.x;
      const by = b.point?.y;
      if (![ax, ay, bx, by].every(Number.isFinite)) return true;
      return Math.abs(ax - bx) < 0.5 && Math.abs(ay - by) < 0.5;
    }
    return anchorsShareSideAndCell(a, b);
  }

  function handleWallZonePointerMove(event, zone) {
    if (
      !showEditor ||
      roomDragRef.current ||
      corridorDragRef.current ||
      accessDragRef.current ||
      connectionDragRef.current
    )
      return;
    event.stopPropagation();
    const anchor = getPureCaveWallAnchorFromEvent(event, zone) || zone.anchor;
    const point = anchor ? getAnchorHandlePoint(anchor, generatedMap.config.gridSize) : zone.point;
    setHoveredRegionId(zone.regionId);
    setHoverCorridorHandle((current) => (current ? null : current));
    setHoveredCorridorId((current) => (current ? null : current));
    setHoverWallHandle((current) => {
      if (
        current?.regionId === zone.regionId &&
        anchorsMatchEditorLocation(current?.anchor, anchor)
      )
        return current;
      return {
        regionId: zone.regionId,
        adjacentRegionId: zone.adjacentRegionId,
        adjacentAnchor: zone.adjacentAnchor,
        anchor,
        point,
      };
    });
  }

  function eventRelatedTargetHasClass(event, className) {
    const target = event?.relatedTarget;
    if (!target || typeof target !== "object") return false;
    if (target.classList?.contains?.(className)) return true;
    return Boolean(target.closest?.(`.${className}`));
  }

  function isSameWallHoverHandle(current, zoneOrHandle) {
    return Boolean(
      current &&
      zoneOrHandle &&
      current.regionId === zoneOrHandle.regionId &&
      anchorsMatchEditorLocation(current.anchor, zoneOrHandle.anchor)
    );
  }

  function handleWallZonePointerLeave(event, zone) {
    if (
      !showEditor ||
      roomDragRef.current ||
      corridorDragRef.current ||
      accessDragRef.current ||
      connectionDragRef.current
    )
      return;
    event.stopPropagation();
    if (eventRelatedTargetHasClass(event, "wall-connect-handle")) return;
    setHoverWallHandle((current) => (isSameWallHoverHandle(current, zone) ? null : current));
    setHoveredRegionId((current) => (current === zone.regionId ? null : current));
  }

  function handleWallHandlePointerLeave(event, handle) {
    if (
      !showEditor ||
      roomDragRef.current ||
      corridorDragRef.current ||
      accessDragRef.current ||
      connectionDragRef.current
    )
      return;
    event.stopPropagation();
    if (eventRelatedTargetHasClass(event, "wall-hover-zone")) return;
    setHoverWallHandle((current) => (isSameWallHoverHandle(current, handle) ? null : current));
    setHoveredRegionId((current) => (current === handle.regionId ? null : current));
  }

  function isExternalMapBoundaryZone(zone) {
    if (!zone?.anchor) return false;
    if (pureCaveEditor && zone.anchor.finalGeometry && zone.anchor.caveAccessBoundary) return true;
    const floorSet = new Set(
      generatedMap.dungeonMask.floorCells.map((cell) => cellKey(cell.x, cell.y))
    );
    return !floorSet.has(cellKey(zone.anchor.outsideCell.x, zone.anchor.outsideCell.y));
  }

  function getMapAccessForRegion(regionId) {
    return (
      (generatedMap.dungeonMask.mapAccesses || generatedMap.mapAccesses || []).find(
        (access) => access.regionId === regionId
      ) || null
    );
  }

  function mapAccessMatchesAnchor(access, anchor) {
    const accessAnchor = access?.displayAnchor || access;
    return (
      Boolean(accessAnchor && anchor) &&
      (anchorsShareFinalGeometry(accessAnchor, anchor) ||
        anchorsShareSideAndCell(accessAnchor, anchor))
    );
  }

  function openWallAccessContextMenu(event, zone) {
    if (!showEditor || !isExternalMapBoundaryZone(zone)) return false;
    event.preventDefault();
    event.stopPropagation();
    const anchor = getPureCaveWallAnchorFromEvent(event, zone) || zone.anchor;
    const regionAccess = getMapAccessForRegion(zone.regionId);
    setSelectedStairMarker(null);
    setRoomContextMenu(null);
    setDoorContextMenu(null);
    setJunctionContextMenu(null);
    setWaypointContextMenu(null);
    setAddWaypointContextMenu(null);
    setMapContextMenu(null);
    setWallAccessContextMenu({
      regionId: zone.regionId,
      anchor: serializeMapAccessAnchor(anchor),
      hasRegionAccess: Boolean(regionAccess),
      hasAccessAtAnchor: mapAccessMatchesAnchor(regionAccess, anchor),
      accessType: regionAccess?.type || "passage",
      ...getFixedContextMenuPosition(event, 270, 390),
    });
    return true;
  }

  function handleWallZoneContextMenu(event, zone) {
    if (openWallAccessContextMenu(event, zone)) return;
  }

  function handleMapAccessContextMenu(event, handle) {
    if (!showEditor || !handle?.access) return;
    event.preventDefault();
    event.stopPropagation();
    const region = generatedMap.regions.find((item) => item.id === handle.regionId);
    if (!region) return;
    const anchor = resolveMapAccessAnchor(
      region,
      handle.access.displayAnchor || handle.access,
      generatedMap
    );
    if (!anchor) return;
    const zone = { regionId: region.id, anchor };
    openWallAccessContextMenu(event, zone);
  }

  function handleMapAccessPointerDown(event, handle) {
    if (!showEditor || event.button !== 0 || !handle?.access) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    onEditStart?.();
    accessDragRef.current = {
      pointerId: event.pointerId,
      id: handle.id,
      regionId: handle.regionId,
      accessType: handle.access.type,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
    setDraggingMapAccessId(handle.id);
  }

  function flushPendingMapAccessMove() {
    if (accessMoveFrameRef.current) {
      window.cancelAnimationFrame(accessMoveFrameRef.current);
      accessMoveFrameRef.current = null;
    }
    const pending = pendingAccessMoveRef.current;
    pendingAccessMoveRef.current = null;
    if (pending) onMapAccessMove?.(pending.regionId, pending.anchor, pending.accessType);
  }

  function scheduleMapAccessMove(regionId, anchor, accessType) {
    pendingAccessMoveRef.current = { regionId, anchor, accessType };
    if (accessMoveFrameRef.current) return;
    accessMoveFrameRef.current = window.requestAnimationFrame(() => {
      accessMoveFrameRef.current = null;
      const pending = pendingAccessMoveRef.current;
      pendingAccessMoveRef.current = null;
      if (!pending) return;
      onMapAccessMove?.(pending.regionId, pending.anchor, pending.accessType);
    });
  }

  function scheduleMapAccessPreview(regionId, accessId, anchor, accessType) {
    pendingAccessMoveRef.current = { regionId, anchor, accessType };
    if (accessMoveFrameRef.current) return;
    accessMoveFrameRef.current = window.requestAnimationFrame(() => {
      accessMoveFrameRef.current = null;
      const pending = pendingAccessMoveRef.current;
      if (!pending) return;
      const point = getAnchorHandlePoint(pending.anchor, generatedMap.config.gridSize);
      setMapAccessDragPreview({
        id: accessId,
        regionId: pending.regionId,
        accessType: pending.accessType,
        anchor: pending.anchor,
        x: point.x,
        y: point.y,
      });
    });
  }

  function handleMapAccessPointerMove(event) {
    const drag = accessDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return false;
    event.preventDefault();
    event.stopPropagation();
    const point = clientToMapPoint(event);
    if (!point) return true;
    const region = generatedMap.regions.find((item) => item.id === drag.regionId);
    if (!region) return true;
    const anchor = getClosestExternalBoundaryAnchorToPoint(region, point, generatedMap);
    if (!anchor) return true;
    scheduleMapAccessPreview(drag.regionId, drag.id, anchor, drag.accessType);
    return true;
  }

  function endMapAccessDrag(event) {
    const drag = accessDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return false;
    event.preventDefault();
    event.stopPropagation();
    const pending = pendingAccessMoveRef.current;
    if (accessMoveFrameRef.current) {
      window.cancelAnimationFrame(accessMoveFrameRef.current);
      accessMoveFrameRef.current = null;
    }
    pendingAccessMoveRef.current = null;
    if (pending) onMapAccessMove?.(pending.regionId, pending.anchor, pending.accessType);
    accessDragRef.current = null;
    setDraggingMapAccessId(null);
    setMapAccessDragPreview(null);
    onEditCommit?.();
    return true;
  }

  function createDirectSharedRoomDoor(zone) {
    if (!zone?.adjacentRegionId || !zone?.adjacentAnchor) return false;
    onCreateConnection?.({
      fromRegionId: zone.regionId,
      fromAnchor: zone.anchor,
      toRegionId: zone.adjacentRegionId,
      toAnchor: zone.adjacentAnchor,
    });
    setHoverWallHandle(null);
    setHoverCorridorHandle(null);
    setConnectionDraftState(null);
    return true;
  }

  function handleWallZonePointerDown(event, zone) {
    if (!showEditor) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    if (createDirectSharedRoomDoor(zone)) return;
    connectionDragRef.current = {
      pointerId: event.pointerId,
      fromRegionId: zone.regionId,
      fromAnchor: zone.anchor,
      start: zone.point,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
    setConnectionDraftState({
      start: zone.point,
      current: zone.point,
      fromAnchor: zone.anchor,
      fromRegionId: zone.regionId,
    });
  }

  function handleCorridorZonePointerMove(event, zone) {
    if (
      !showEditor ||
      roomDragRef.current ||
      corridorDragRef.current ||
      accessDragRef.current ||
      connectionDragRef.current
    )
      return;
    event.stopPropagation();
    setHoveredRegionId(null);
    setHoverWallHandle(null);
    setHoverCorridorHandle(zone);
    setHoveredCorridorId(zone.corridor.id);
  }

  function isSameCorridorHoverHandle(current, zoneOrHandle) {
    return Boolean(current && zoneOrHandle && current.id === zoneOrHandle.id);
  }

  function handleCorridorZonePointerLeave(event, zone) {
    if (
      !showEditor ||
      roomDragRef.current ||
      corridorDragRef.current ||
      accessDragRef.current ||
      connectionDragRef.current
    )
      return;
    event.stopPropagation();
    if (eventRelatedTargetHasClass(event, "corridor-add-handle")) return;
    setHoverCorridorHandle((current) =>
      isSameCorridorHoverHandle(current, zone) ? null : current
    );
    setHoveredCorridorId((current) => (current === zone.corridor.id ? null : current));
  }

  function handleCorridorAddPointerLeave(event, handle) {
    if (
      !showEditor ||
      roomDragRef.current ||
      corridorDragRef.current ||
      accessDragRef.current ||
      connectionDragRef.current
    )
      return;
    event.stopPropagation();
    if (eventRelatedTargetHasClass(event, "corridor-hover-zone")) return;
    setHoverCorridorHandle((current) =>
      isSameCorridorHoverHandle(current, handle) ? null : current
    );
    setHoveredCorridorId((current) => (current === handle.corridor.id ? null : current));
  }

  function handleCorridorHandlePointerEnter(event, handle) {
    if (!showEditor || roomDragRef.current || accessDragRef.current || connectionDragRef.current)
      return;
    event.stopPropagation();
    setHoveredCorridorId(handle.corridor.id);
  }

  function handleCorridorHandlePointerLeave(event, handle) {
    if (!showEditor || corridorDragRef.current) return;
    event.stopPropagation();
    setHoveredCorridorId((current) => (current === handle.corridor.id ? null : current));
  }

  function createRoomDragPreview(drag, position, phase = "dragging") {
    if (!drag || !position) return null;
    return {
      phase,
      regionId: drag.regionId,
      originX: drag.originX,
      originY: drag.originY,
      x: position.x,
      y: position.y,
    };
  }

  function scheduleRoomDragPreview(drag, position) {
    pendingRoomMoveRef.current = {
      regionId: drag.regionId,
      position,
    };
    if (roomMoveFrameRef.current) return;
    roomMoveFrameRef.current = window.requestAnimationFrame(() => {
      roomMoveFrameRef.current = null;
      const pending = pendingRoomMoveRef.current;
      if (!pending) return;
      setRoomDragPreviewState(createRoomDragPreview(drag, pending.position));
    });
  }

  function handleRoomPointerMove(event) {
    const drag = roomDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    const point = clientToMapPoint(event);
    if (!point) return;
    const dx = Math.round((point.x - drag.startX) / generatedMap.config.gridSize);
    const dy = Math.round((point.y - drag.startY) / generatedMap.config.gridSize);
    const nextPosition = { x: drag.originX + dx, y: drag.originY + dy };
    if (drag.lastX === nextPosition.x && drag.lastY === nextPosition.y) return;
    drag.lastX = nextPosition.x;
    drag.lastY = nextPosition.y;
    scheduleRoomDragPreview(drag, nextPosition);
  }

  function endRoomDrag(event) {
    const drag = roomDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return false;
    event.preventDefault();
    event.stopPropagation();
    if (roomMoveFrameRef.current) {
      window.cancelAnimationFrame(roomMoveFrameRef.current);
      roomMoveFrameRef.current = null;
    }
    const pending =
      pendingRoomMoveRef.current ||
      (drag.lastX !== drag.originX || drag.lastY !== drag.originY
        ? { regionId: drag.regionId, position: { x: drag.lastX, y: drag.lastY } }
        : null);
    pendingRoomMoveRef.current = null;
    if (pending) {
      setRoomDragPreviewState(createRoomDragPreview(drag, pending.position, "committing"));
      viewportDebugEvent("drag:end room result", {
        regionId: pending.regionId,
        position: pending.position,
      });
      onRoomMove?.(pending.regionId, pending.position);
    } else {
      setRoomDragPreviewState(null);
    }
    roomDragRef.current = null;
    setDraggingRegionId(null);
    setHoveredRegionId(null);
    onEditCommit?.();
    return true;
  }

  function handleWallHandlePointerDown(event, handle) {
    if (!showEditor) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    if (createDirectSharedRoomDoor(handle)) return;
    connectionDragRef.current = {
      pointerId: event.pointerId,
      fromRegionId: handle.regionId,
      fromAnchor: handle.anchor,
      start: handle.point,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
    setConnectionDraftState({
      start: handle.point,
      current: handle.point,
      fromAnchor: handle.anchor,
      fromRegionId: handle.regionId,
    });
  }

  function getAnchorOutwardNormal(anchor) {
    if (anchor?.normal && Number.isFinite(anchor.normal.x) && Number.isFinite(anchor.normal.y)) {
      const length = Math.hypot(anchor.normal.x, anchor.normal.y) || 1;
      return { x: anchor.normal.x / length, y: anchor.normal.y / length };
    }
    if (anchor?.side === "west") return { x: -1, y: 0 };
    if (anchor?.side === "east") return { x: 1, y: 0 };
    if (anchor?.side === "north") return { x: 0, y: -1 };
    if (anchor?.side === "south") return { x: 0, y: 1 };
    return null;
  }

  function getAnchorConnectionFacingPenalty(anchor, anchorPoint, drag) {
    if (!anchor || !anchorPoint || !drag?.start) return 0;
    const normal = getAnchorOutwardNormal(anchor);
    if (!normal) return 0;
    const vx = drag.start.x - anchorPoint.x;
    const vy = drag.start.y - anchorPoint.y;
    const length = Math.hypot(vx, vy);
    if (!length) return 0;
    const dot = (normal.x * vx + normal.y * vy) / length;
    const gridSize = generatedMap.config.gridSize || 20;
    if (dot >= 0.3) return -gridSize * 0.55;
    if (dot >= 0) return 0;
    return Math.abs(dot) * gridSize * 4.5;
  }

  function dedupeEditorBoundaryAnchors(anchors, gridSize) {
    const seen = new Set();
    const output = [];
    (anchors || []).forEach((anchor) => {
      if (!anchor) return;
      const handlePoint = getAnchorHandlePoint(anchor, gridSize);
      if (!handlePoint) return;
      const snapCell = anchor.snapCell || anchor.outsideCell || anchor.cell || {};
      const key = [
        anchor.side || "",
        snapCell.x ?? "",
        snapCell.y ?? "",
        Math.round(handlePoint.x * 10) / 10,
        Math.round(handlePoint.y * 10) / 10,
      ].join(":");
      if (seen.has(key)) return;
      seen.add(key);
      output.push(anchor);
    });
    return output;
  }

  function getCircleCandidateCellRing(point, gridSize, radius = 1) {
    if (!point || !Number.isFinite(gridSize) || gridSize <= 0) return [];
    const baseCell = {
      x: Math.floor(point.x / gridSize),
      y: Math.floor(point.y / gridSize),
    };
    const cells = [];
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        cells.push({ x: baseCell.x + dx, y: baseCell.y + dy });
      }
    }
    return cells;
  }

  function getDistanceFromPointToCellCenter(point, cell, gridSize) {
    if (!point || !cell) return Number.POSITIVE_INFINITY;
    const cx = (cell.x + 0.5) * gridSize;
    const cy = (cell.y + 0.5) * gridSize;
    return Math.hypot(point.x - cx, point.y - cy);
  }

  function getCircleAnchorEditorPoint(anchor, gridSize) {
    if (
      anchor?.displayPoint &&
      Number.isFinite(anchor.displayPoint.x) &&
      Number.isFinite(anchor.displayPoint.y)
    ) {
      return { x: anchor.displayPoint.x, y: anchor.displayPoint.y };
    }
    return getAnchorHandlePoint(anchor, gridSize);
  }

  function getStrictCircleDoorDragAnchor(region, point, gridSize, options = {}) {
    if (region?.shape !== "circle" || !point) return null;
    const circle = getCircleGeometryFromRegion(region, gridSize);
    if (!circle || !Number.isFinite(circle.r) || circle.r <= 0) return null;
    const radius = Number.isFinite(options.searchRadius) ? options.searchRadius : 1;
    const maxHandleDistance = Number.isFinite(options.maxHandleDistance)
      ? options.maxHandleDistance
      : gridSize * 1.15;
    const pointerCell = {
      x: Math.floor(point.x / gridSize),
      y: Math.floor(point.y / gridSize),
    };
    const pointerAnchor = createCircleConnectionAnchorFromOutsideCell(
      region,
      circle,
      pointerCell,
      gridSize
    );
    if (pointerAnchor) return pointerAnchor;

    const seen = new Set();
    const candidates = [];

    getCircleCandidateCellRing(point, gridSize, radius).forEach((cell) => {
      const key = cellKey(cell.x, cell.y);
      if (seen.has(key)) return;
      seen.add(key);
      const anchor = createCircleConnectionAnchorFromOutsideCell(region, circle, cell, gridSize);
      if (!anchor) return;
      const handlePoint = getCircleAnchorEditorPoint(anchor, gridSize) || anchor.point;
      if (!handlePoint) return;
      const handleDistance = Math.hypot(handlePoint.x - point.x, handlePoint.y - point.y);
      const snapDistance = getDistanceFromPointToCellCenter(
        point,
        anchor.snapCell || cell,
        gridSize
      );
      if (handleDistance > maxHandleDistance && snapDistance > gridSize * 1.35) return;
      candidates.push({
        anchor,
        score: handleDistance + snapDistance * 0.18,
      });
    });

    return candidates.sort((a, b) => a.score - b.score)[0]?.anchor || null;
  }

  function isPointNearCircleBoundary(region, point, gridSize) {
    if (region?.shape !== "circle" || !point) return false;
    const circle = getCircleGeometryFromRegion(region, gridSize);
    if (!circle || !Number.isFinite(circle.r) || circle.r <= 0) return false;
    const distance = Math.hypot(point.x - circle.cx, point.y - circle.cy);
    return Math.abs(distance - circle.r) <= gridSize * 1.9;
  }

  function findClosestInvalidCircleAnchorTarget(regions, point, gridSize, excludeRegionId = null) {
    let best = null;
    (regions || []).forEach((region) => {
      if (!region || region.id === excludeRegionId || region.shape !== "circle") return;
      if (!isPointNearCircleBoundary(region, point, gridSize)) return;
      const circle = getCircleGeometryFromRegion(region, gridSize);
      const boundaryDistance = Math.abs(
        Math.hypot(point.x - circle.cx, point.y - circle.cy) - circle.r
      );
      if (!best || boundaryDistance < best.distance) {
        best = {
          region,
          point,
          distance: boundaryDistance,
          invalid: true,
          reason: "circle-anchor-unreachable",
        };
      }
    });
    return best;
  }

  function getEditorBoundaryAnchorCandidatesForRegion(region, point, gridSize) {
    if (!region || !point) return [];
    if (region.shape === "circle") {
      const strictPointerAnchor = getStrictCircleDoorDragAnchor(region, point, gridSize, {
        searchRadius: 1,
      });
      if (strictPointerAnchor) return [strictPointerAnchor];
      const circle = getCircleGeometryFromRegion(region, gridSize);
      const circleCandidates = circle
        ? createCircleConnectionAnchorCandidates(region, circle, gridSize)
        : [];
      return dedupeEditorBoundaryAnchors(circleCandidates, gridSize);
    }
    const finalBoundary = getDoorBoundaryCells(region, generatedMap);
    const rawBoundary = getBoundaryCells(region);
    const boundary = finalBoundary.length > 0 ? finalBoundary : rawBoundary;
    return dedupeEditorBoundaryAnchors(boundary, gridSize);
  }

  function getEditorBoundaryAnchorForRegion(region, point, gridSize) {
    const candidates = getEditorBoundaryAnchorCandidatesForRegion(region, point, gridSize);
    if (candidates.length === 0) return null;
    return (
      candidates
        .map((anchor) => {
          const handlePoint = region.shape === "circle"
            ? getCircleAnchorEditorPoint(anchor, gridSize)
            : getAnchorHandlePoint(anchor, gridSize);
          const dx = handlePoint.x - point.x;
          const dy = handlePoint.y - point.y;
          return { anchor, score: dx * dx + dy * dy };
        })
        .sort((a, b) => a.score - b.score)[0]?.anchor || null
    );
  }

  function findClosestEditorBoundaryAnchorAcrossRegions(
    regions,
    point,
    gridSize,
    excludeRegionId = null,
    maxDistance = gridSize * 1.35,
    drag = null
  ) {
    let best = null;
    (regions || []).forEach((region) => {
      if (!region || region.id === excludeRegionId) return;
      const circleAnchor =
        region.shape === "circle"
          ? getStrictCircleDoorDragAnchor(region, point, gridSize, { searchRadius: 1 })
          : null;
      const candidates =
        region.shape === "circle"
          ? circleAnchor
            ? [circleAnchor]
            : []
          : getEditorBoundaryAnchorCandidatesForRegion(region, point, gridSize);
      candidates.forEach((anchor) => {
        const handlePoint = region.shape === "circle"
          ? getCircleAnchorEditorPoint(anchor, gridSize)
          : getAnchorHandlePoint(anchor, gridSize);
        if (!handlePoint) return;
        const dx = handlePoint.x - point.x;
        const dy = handlePoint.y - point.y;
        const distance = Math.hypot(dx, dy);
        const isPointerResolvedCircleAnchor =
          region.shape === "circle" &&
          anchor.snapGridQuantized &&
          anchor.snapCell &&
          Math.floor(point.x / gridSize) === anchor.snapCell.x &&
          Math.floor(point.y / gridSize) === anchor.snapCell.y;
        if (!isPointerResolvedCircleAnchor && distance > maxDistance) return;
        const facingPenalty = getAnchorConnectionFacingPenalty(anchor, handlePoint, drag);
        const score = distance + facingPenalty;
        if (!best || score < best.score)
          best = { region, anchor, point: handlePoint, distance, score };
      });
    });
    return best;
  }

  function createConnectionDraftState(drag, point, target = null) {
    const invalid = Boolean(target?.invalid);
    const current = target && !invalid ? target.point : point;
    return {
      start: drag.start,
      current,
      fromAnchor: drag.fromAnchor,
      target,
      toAnchor: invalid ? null : target?.anchor || null,
      fromRegionId: drag.fromRegionId,
      toRegionId: invalid ? null : target?.region?.id || null,
      invalid,
      invalidRegionId: invalid ? target?.region?.id || null : null,
      invalidReason: invalid ? target?.reason || "invalid-anchor" : null,
    };
  }

  function handleConnectionPointerMove(event) {
    const drag = connectionDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return false;
    event.preventDefault();
    event.stopPropagation();
    const point = clientToMapPoint(event);
    if (!point) return true;
    const target = findClosestEditorBoundaryAnchorAcrossRegions(
      generatedMap.regions,
      point,
      generatedMap.config.gridSize,
      drag.fromRegionId,
      generatedMap.config.gridSize * 1.8,
      drag
    );
    const resolvedTarget =
      target ||
      findClosestInvalidCircleAnchorTarget(
        generatedMap.regions,
        point,
        generatedMap.config.gridSize,
        drag.fromRegionId
      );
    setConnectionDraftState(createConnectionDraftState(drag, point, resolvedTarget));
    return true;
  }

  function endConnectionDrag(event) {
    const drag = connectionDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return false;
    event.preventDefault();
    event.stopPropagation();
    const point = clientToMapPoint(event);
    const draftTarget = connectionDraftRef.current?.target || null;
    const target =
      draftTarget ||
      (point
        ? findClosestEditorBoundaryAnchorAcrossRegions(
            generatedMap.regions,
            point,
            generatedMap.config.gridSize,
            drag.fromRegionId,
            generatedMap.config.gridSize * 1.8,
            drag
          )
        : null);
    viewportDebugEvent("anchor trace: release", {
      kind: "new-corridor",
      fromRegionId: drag.fromRegionId,
      pointer: {
        point: roundViewportDebugPoint(point),
        cell: getViewportDebugPointCell(point),
      },
      target: target
        ? {
            invalid: Boolean(target.invalid),
            regionId: target.region?.id || null,
            point: roundViewportDebugPoint(target.point),
            cell: getViewportDebugPointCell(target.point),
            distance: roundViewportDebugNumber(target.distance),
            score: roundViewportDebugNumber(target.score),
            reason: target.reason || null,
            anchor: summarizeViewportDebugAnchor(target.anchor),
          }
        : null,
      fromAnchor: summarizeViewportDebugAnchor(drag.fromAnchor),
    });
    if (target && !target.invalid) {
      onCreateConnection?.({
        fromRegionId: drag.fromRegionId,
        fromAnchor: drag.fromAnchor,
        toRegionId: target.region.id,
        toAnchor: target.anchor,
        debugTrace: {
          releasePoint: point,
          releaseCell: getViewportDebugPointCell(point),
          targetPoint: target.point,
          targetCell: getViewportDebugPointCell(target.point),
          targetDistance: target.distance,
          targetScore: target.score,
        },
      });
    }
    connectionDragRef.current = null;
    setConnectionDraftState(null);
    setHoverWallHandle(null);
    return true;
  }

  function selectStairMarker(event, handle) {
    if (!showEditor || !handle?.id) return;
    event.preventDefault();
    event.stopPropagation();
    setRoomContextMenu(null);
    setMapContextMenu(null);
    setDoorContextMenu(null);
    setJunctionContextMenu(null);
    setWaypointContextMenu(null);
    setAddWaypointContextMenu(null);
    setWallAccessContextMenu(null);
    setHoverWallHandle(null);
    setHoverCorridorHandle(null);
    setHoveredCorridorId(null);
    setHoveredRegionId(null);
    onRegionHoverChange?.("");
    onSelectedRegionChange?.("");
    setSelectedStairMarker({
      id: handle.id,
      corridorId: handle.corridorId,
      markerIndex: handle.markerIndex,
    });
    viewportDebugEvent("select stair marker", {
      stairMarkerId: handle.id,
      corridorId: handle.corridorId,
      markerIndex: handle.markerIndex,
      markerCount: handle.markerCount,
      transition: handle.transition,
    });
  }

  function handleStairMarkerPointerDown(event, handle) {
    if (event.button !== 0) return;
    selectStairMarker(event, handle);
  }

  function handleStairMarkerKeyDown(event, handle) {
    if (event.key !== "Enter" && event.key !== " ") return;
    selectStairMarker(event, handle);
  }

  function handleDoorContextMenu(event, handle) {
    if (!showEditor) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    setRoomContextMenu(null);
    setMapContextMenu(null);
    setJunctionContextMenu(null);
    setWaypointContextMenu(null);
    setAddWaypointContextMenu(null);
    setDoorContextMenu({
      corridorId: handle.corridor.id,
      endpoint: handle.endpoint,
      fallbackType: handle.corridor.secret ? "secret" : "default",
      fallbackCorridorType: handle.corridor.corridorType || "normal",
      ...getFixedContextMenuPosition(event, 270, 340),
    });
    setHoverCorridorHandle(null);
    setHoverWallHandle(null);
  }

  function handleJunctionContextMenu(event, junction) {
    if (!showEditor || !junction) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    setRoomContextMenu(null);
    setDoorContextMenu(null);
    setMapContextMenu(null);
    setWaypointContextMenu(null);
    setAddWaypointContextMenu(null);
    setJunctionContextMenu({
      key: junction.key,
      cell: junction.cell,
      corridorIds: junction.corridors.map((corridor) => corridor.id),
      ...getFixedContextMenuPosition(event, 250, 250),
    });
    setHoverCorridorHandle(null);
    setHoverWallHandle(null);
  }

  function handleCorridorAddContextMenu(event, handle) {
    if (!showEditor || !handle) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    setRoomContextMenu(null);
    setDoorContextMenu(null);
    setJunctionContextMenu(null);
    setWaypointContextMenu(null);
    setMapContextMenu(null);
    const junction = getCorridorIntersectionCells(generatedMap.corridors).find(
      (item) => item.key === cellKey(handle.cell.x, handle.cell.y)
    );
    setAddWaypointContextMenu({
      corridorId: handle.corridor.id,
      fallbackCorridorType: handle.corridor.corridorType || "normal",
      insertIndex: handle.insertIndex,
      point: handle.point,
      cell: handle.cell,
      junctionKey: junction?.key || null,
      junctionCorridorIds: junction?.corridors?.map((corridor) => corridor.id) || [],
      ...getFixedContextMenuPosition(event, 270, 390),
    });
    setHoveredCorridorId(handle.corridor.id);
  }

  function handleWaypointContextMenu(event, handle) {
    if (!showEditor) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    const cell = {
      x: Math.floor(handle.x / generatedMap.config.gridSize),
      y: Math.floor(handle.y / generatedMap.config.gridSize),
    };
    const junction = getCorridorIntersectionCells(generatedMap.corridors).find(
      (item) => item.key === cellKey(cell.x, cell.y)
    );
    setRoomContextMenu(null);
    setDoorContextMenu(null);
    setJunctionContextMenu(null);
    setMapContextMenu(null);
    setAddWaypointContextMenu(null);
    setWaypointContextMenu({
      corridorId: handle.corridor.id,
      fallbackCorridorType: handle.corridor.corridorType || "normal",
      waypointIndex: handle.index,
      source: handle.source,
      cell,
      junctionKey: junction?.key || null,
      junctionCorridorIds: junction?.corridors?.map((corridor) => corridor.id) || [],
      ...getFixedContextMenuPosition(event, 270, 420),
    });
    setHoverCorridorHandle(null);
    setHoveredCorridorId(handle.corridor.id);
  }

  function getDoorDragManualAnchor(region, point, gridSize, options = {}) {
    if (!region || !point) return null;
    if (region.shape === "circle") {
      const strictCircleAnchor = getStrictCircleDoorDragAnchor(region, point, gridSize, {
        searchRadius: options.searchRadius ?? 1,
      });
      if (strictCircleAnchor) return strictCircleAnchor;
      return options.allowLooseCircleFallback
        ? createCircleDragAnchor(region, point, gridSize)
        : null;
    }
    const finalBoundary = getDoorBoundaryCells(region, generatedMap);
    const rawBoundary = getBoundaryCells(region);
    const boundary = finalBoundary.length > 0 ? finalBoundary : rawBoundary;
    if (boundary.length === 0) return null;
    return (
      boundary
        .map((anchor) => ({
          anchor,
          score: scoreDoorDragManualAnchor(anchor, point, gridSize),
        }))
        .sort((a, b) => a.score - b.score)[0]?.anchor || null
    );
  }

  function scoreDoorDragManualAnchor(anchor, point, gridSize) {
    if (!anchor || !point) return Number.POSITIVE_INFINITY;
    const handlePoint = getCircleAnchorEditorPoint(anchor, gridSize);
    if (!handlePoint) return Number.POSITIVE_INFINITY;
    const dx = handlePoint.x - point.x;
    const dy = handlePoint.y - point.y;
    const sideBias = anchor.finalGeometry || anchor.caveAccessBoundary ? -gridSize * 0.45 : 0;
    return Math.hypot(dx, dy) + sideBias;
  }

  function getManualDoorDragAnchor(region, point, gridSize) {
    return getDoorDragManualAnchor(region, point, gridSize);
  }

  function getDoorDragSnapTarget(drag, point) {
    if (!drag || drag.type !== "door" || !point) return null;
    const corridor = generatedMap.corridors.find((item) => item.id === drag.corridorId);
    if (!corridor) return null;
    if (corridor.isRoomLink || drag.endpoint === "shared") {
      const fromRegion = generatedMap.regions.find((item) => item.id === corridor.from);
      const toRegion = generatedMap.regions.find((item) => item.id === corridor.to);
      const sharedConnection =
        fromRegion && toRegion
          ? getClosestSharedRoomConnectionToPoint(
              fromRegion,
              toRegion,
              point,
              generatedMap.config.gridSize
            )
          : null;
      return sharedConnection?.point
        ? { point: sharedConnection.point, anchor: sharedConnection.fromAnchor || null }
        : null;
    }
    const regionId = drag.endpoint === "from" ? corridor.from : corridor.to;
    const region = generatedMap.regions.find((item) => item.id === regionId);
    if (!region) return null;
    const gridSize = generatedMap.config.gridSize;
    const anchor =
      region.shape === "circle"
        ? getStrictCircleDoorDragAnchor(region, point, gridSize, {
            searchRadius: 1,
            maxHandleDistance: gridSize * 1.35,
          })
        : getDoorDragManualAnchor(region, point, gridSize);
    if (!anchor) return null;
    const handlePoint = region.shape === "circle"
      ? getCircleAnchorEditorPoint(anchor, gridSize)
      : getAnchorHandlePoint(anchor, gridSize);
    return handlePoint ? { point: handlePoint, anchor } : null;
  }

  function isInvalidCircleDoorDragTarget(drag, point) {
    if (!drag || drag.type !== "door" || !point) return false;
    const corridor = generatedMap.corridors.find((item) => item.id === drag.corridorId);
    if (!corridor || corridor.isRoomLink || drag.endpoint === "shared") return false;
    const regionId = drag.endpoint === "from" ? corridor.from : corridor.to;
    const region = generatedMap.regions.find((item) => item.id === regionId);
    if (region?.shape !== "circle") return false;
    return isPointNearCircleBoundary(region, point, generatedMap.config.gridSize);
  }

  function createCorridorDragPreview(drag, point, phase = "dragging") {
    if (!drag || !point) return null;
    const snapTarget = getDoorDragSnapTarget(drag, point);
    const invalid =
      drag.type === "door" && !snapTarget && isInvalidCircleDoorDragTarget(drag, point);
    const previewPoint = snapTarget?.point || point;
    return {
      phase,
      type: drag.type,
      id: drag.id,
      corridorId: drag.corridorId,
      endpoint: drag.endpoint,
      waypointIndex: drag.waypointIndex,
      insertIndex: drag.insertIndex,
      source: drag.source,
      point: previewPoint,
      rawPoint: point,
      snapPoint: snapTarget?.point || null,
      snapAnchor: snapTarget?.anchor || null,
      invalid,
      invalidReason: invalid ? "circle-anchor-unreachable" : null,
      x: previewPoint.x,
      y: previewPoint.y,
    };
  }

  function scheduleCorridorDragPreview(drag, point) {
    pendingCorridorMoveRef.current = createCorridorDragPreview(drag, point);
    if (corridorMoveFrameRef.current) return;
    corridorMoveFrameRef.current = window.requestAnimationFrame(() => {
      corridorMoveFrameRef.current = null;
      const pending = pendingCorridorMoveRef.current;
      pendingCorridorMoveRef.current = null;
      if (!pending) return;
      setCorridorDragPreviewState(pending);
    });
  }

  function handleDoorPointerDown(event, handle) {
    if (!showEditor || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    onEditStart?.();
    const startPoint = { x: handle.x, y: handle.y };
    const drag = {
      type: "door",
      pointerId: event.pointerId,
      id: handle.id,
      corridorId: handle.corridor.id,
      endpoint: handle.endpoint,
      startPoint,
    };
    viewportDebugEvent("drag:start door endpoint", {
      drag,
      corridor: summarizeViewportDebugCorridor(handle.corridor),
      currentManualOverrides: summarizeViewportDebugManualOverrides(manualOverrides),
    });
    corridorDragRef.current = drag;
    setCorridorDragPreviewState(createCorridorDragPreview(drag, startPoint));
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
    setDraggingCorridorHandle(handle.id);
  }

  function handleCorridorAddPointerDown(event, handle) {
    if (!showEditor || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    onEditStart?.();
    const id = `new-waypoint-${handle.corridor.id}-${handle.insertIndex}`;
    const startPoint = handle.point;
    const drag = {
      type: "waypoint-insert",
      pointerId: event.pointerId,
      id,
      corridorId: handle.corridor.id,
      waypointIndex: handle.insertIndex,
      insertIndex: handle.insertIndex,
      source: "manual",
      startPoint,
    };
    viewportDebugEvent("drag:start waypoint insert", {
      drag,
      corridor: summarizeViewportDebugCorridor(handle.corridor),
      handleCell: summarizeViewportDebugCell(handle.cell),
    });
    corridorDragRef.current = drag;
    setCorridorDragPreviewState(createCorridorDragPreview(drag, startPoint));
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
    setDraggingCorridorHandle(id);
    setHoverCorridorHandle(null);
  }

  function handleWaypointPointerDown(event, handle) {
    if (!showEditor || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStairMarker(null);
    onEditStart?.();
    const startPoint = { x: handle.x, y: handle.y };
    const drag = {
      type: "waypoint",
      pointerId: event.pointerId,
      id: handle.id,
      corridorId: handle.corridor.id,
      fallbackCorridorType: handle.corridor.corridorType || "normal",
      waypointIndex: handle.index,
      source: handle.source,
      startPoint,
    };
    viewportDebugEvent("drag:start waypoint", {
      drag,
      corridor: summarizeViewportDebugCorridor(handle.corridor),
    });
    corridorDragRef.current = drag;
    setCorridorDragPreviewState(createCorridorDragPreview(drag, startPoint));
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
    setDraggingCorridorHandle(handle.id);
  }

  function handleCorridorPointerMove(event) {
    const drag = corridorDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return false;
    event.preventDefault();
    event.stopPropagation();
    const point = clientToMapPoint(event);
    if (!point) return true;
    scheduleCorridorDragPreview(drag, point);
    return true;
  }

  function endCorridorDrag(event) {
    const drag = corridorDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return false;
    event.preventDefault();
    event.stopPropagation();
    if (corridorMoveFrameRef.current) {
      window.cancelAnimationFrame(corridorMoveFrameRef.current);
      corridorMoveFrameRef.current = null;
    }
    const pending = pendingCorridorMoveRef.current || corridorDragPreviewRef.current;
    pendingCorridorMoveRef.current = null;
    const point = pending?.point || drag.startPoint;
    const rawPoint = pending?.rawPoint || point;
    const snapAnchor = pending?.snapAnchor || null;
    const moved =
      drag.type === "waypoint-insert" ||
      (rawPoint &&
        drag.startPoint &&
        Math.hypot(rawPoint.x - drag.startPoint.x, rawPoint.y - drag.startPoint.y) > 0.5);
    viewportDebugEvent("anchor trace: release", {
      kind: "existing-corridor-anchor",
      corridorId: drag.corridorId || null,
      endpoint: drag.endpoint || null,
      dragType: drag.type,
      moved,
      pointer: {
        point: roundViewportDebugPoint(rawPoint),
        cell: getViewportDebugPointCell(rawPoint),
      },
      previewSnap: {
        point: roundViewportDebugPoint(point),
        cell: getViewportDebugPointCell(point),
        anchor: summarizeViewportDebugAnchor(snapAnchor),
      },
      pendingInvalid: Boolean(pending?.invalid),
      pendingInvalidReason: pending?.invalidReason || null,
    });
    viewportDebugEvent("drag:end corridor handle", {
      drag,
      moved,
      point: roundViewportDebugPoint(point),
      rawPoint: roundViewportDebugPoint(rawPoint),
      snapAnchor: summarizeViewportDebugAnchor(snapAnchor),
      pending,
      mapBeforeCommit: summarizeViewportDebugMap(generatedMap),
      manualBeforeCommit: summarizeViewportDebugManualOverrides(manualOverrides),
    });
    let committed = false;
    if (point && moved && !pending?.invalid) {
      setCorridorDragPreviewState(createCorridorDragPreview(drag, rawPoint || point, "committing"));
      if (drag.type === "door") {
        committed =
          onDoorMove?.(drag.corridorId, drag.endpoint, point, snapAnchor, {
            releasePoint: rawPoint || point,
            releaseCell: getViewportDebugPointCell(rawPoint || point),
            snapPoint: point,
            snapCell: getViewportDebugPointCell(point),
            snapAnchor,
          }) === true;
      } else if (drag.type === "waypoint-insert") {
        committed = onWaypointInsert?.(drag.corridorId, drag.insertIndex, point) === true;
      } else {
        committed =
          onWaypointMove?.(drag.corridorId, drag.waypointIndex, point, drag.source) === true;
      }
    }
    viewportDebugEvent("drag:end corridor handle result", {
      drag,
      committed,
      moved,
      manualAfterHandler: summarizeViewportDebugManualOverrides(manualOverrides),
    });
    if (!committed) setCorridorDragPreviewState(null);
    try {
      event.currentTarget?.releasePointerCapture?.(event.pointerId);
    } catch (error) {
      void error;
    }
    corridorDragRef.current = null;
    pendingCorridorMoveRef.current = null;
    setDraggingCorridorHandle(null);
    setHoverCorridorHandle(null);
    setHoveredCorridorId(null);
    onEditCommit?.();
    return true;
  }

  function handleEditorPointerMove(event) {
    if (handleConnectionPointerMove(event)) return;
    if (handleMapAccessPointerMove(event)) return;
    if (handleCorridorPointerMove(event)) return;
    handleRoomPointerMove(event);
  }

  function endEditorDrag(event) {
    if (endConnectionDrag(event)) return;
    if (endMapAccessDrag(event)) return;
    if (endCorridorDrag(event)) return;
    endRoomDrag(event);
  }

  function handlePointerDown(event) {
    if (
      roomDragRef.current ||
      corridorDragRef.current ||
      accessDragRef.current ||
      connectionDragRef.current
    )
      return;
    if (event.button !== 0) return;
    setRoomContextMenu(null);
    setMapContextMenu(null);
    setDoorContextMenu(null);
    setJunctionContextMenu(null);
    setWaypointContextMenu(null);
    setAddWaypointContextMenu(null);
    setHoverWallHandle(null);
    setHoverCorridorHandle(null);
    setHoveredCorridorId(null);
    onRegionHoverChange?.("");
    event.currentTarget.focus();
    panRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  }

  function flushPendingPanMove() {
    if (panMoveFrameRef.current) {
      window.cancelAnimationFrame(panMoveFrameRef.current);
      panMoveFrameRef.current = null;
    }
    const pending = pendingPanViewRef.current;
    pendingPanViewRef.current = null;
    if (!pending) return;
    setView((current) => constrainView({ ...current, x: pending.x, y: pending.y }));
  }

  function schedulePanMove(nextX, nextY) {
    pendingPanViewRef.current = { x: nextX, y: nextY };
    if (panMoveFrameRef.current) return;
    panMoveFrameRef.current = window.requestAnimationFrame(() => {
      panMoveFrameRef.current = null;
      const pending = pendingPanViewRef.current;
      pendingPanViewRef.current = null;
      if (!pending) return;
      setView((current) => constrainView({ ...current, x: pending.x, y: pending.y }));
    });
  }

  function handlePointerMove(event) {
    if (handleConnectionPointerMove(event)) return;
    if (handleMapAccessPointerMove(event)) return;
    if (handleCorridorPointerMove(event)) return;
    if (roomDragRef.current) return;
    if (!panRef.current || panRef.current.pointerId !== event.pointerId) return;
    const pan = panRef.current;
    const dx = event.clientX - pan.startX;
    const dy = event.clientY - pan.startY;
    if (Math.hypot(dx, dy) > 3) pan.moved = true;
    const nextX = pan.originX + dx;
    const nextY = pan.originY + dy;
    schedulePanMove(nextX, nextY);
  }

  function endPan(event) {
    if (endConnectionDrag(event)) return;
    if (endMapAccessDrag(event)) return;
    if (endCorridorDrag(event)) return;
    if (endRoomDrag(event)) return;
    if (!panRef.current || panRef.current.pointerId !== event.pointerId) return;
    flushPendingPanMove();
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
    const wasClick = !panRef.current.moved;
    panRef.current = null;
    setIsPanning(false);
    if (wasClick) {
      setSelectedStairMarker(null);
      onSelectedRegionChange?.("");
    }
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === "z") {
      event.preventDefault();
      if (event.shiftKey) onRedo?.();
      else onUndo?.();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === "y") {
      event.preventDefault();
      onRedo?.();
      return;
    }
    const panAmount = event.shiftKey ? 90 : 45;
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomAtCenter(1.12);
      return;
    }
    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoomAtCenter(0.88);
      return;
    }
    if (event.key === "0" || event.key === "Home") {
      event.preventDefault();
      fitView();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setView((current) => constrainView({ ...current, y: current.y + panAmount }));
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setView((current) => constrainView({ ...current, y: current.y - panAmount }));
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setView((current) => constrainView({ ...current, x: current.x + panAmount }));
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setView((current) => constrainView({ ...current, x: current.x - panAmount }));
    }
  }

  return (
    <>
      <div
        ref={viewportRef}
        className={cx(
          "map-viewport",
          `map-viewport--${viewportMode}`,
          viewportInteractive && "is-pannable",
          isPanning && "is-panning",
          embeddedPreview && "is-embedded-preview",
          viewportClassName
        )}
        data-map-viewport-mode={viewportMode}
        style={wallStrokeVariables}
        tabIndex={viewportInteractive ? 0 : -1}
        aria-label={embeddedPreview ? "Embedded map preview" : "Interactive map viewport"}
        onContextMenu={viewportInteractive ? openMapContextMenu : undefined}
        onPointerDown={viewportInteractive ? handlePointerDown : undefined}
        onPointerMove={viewportInteractive ? handlePointerMove : undefined}
        onPointerUp={viewportInteractive ? endPan : undefined}
        onPointerCancel={viewportInteractive ? endPan : undefined}
        onKeyDown={viewportInteractive ? handleKeyDown : undefined}
      >
        <div
          className="map-pan-layer"
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <MapSvg
            generatedMap={generatedMap}
            showGrid={showGrid}
            gridStyle={gridStyle}
            gridOpacity={gridOpacity}
            gridColor={gridColor}
            gridWeight={gridWeight}
            crosshatchStyle={crosshatchStyle}
            crosshatchOpacity={crosshatchOpacity}
            wallDrawingStyle={wallDrawingStyle}
            hatchShadowColor={hatchShadowColor}
            showDebugCellCoordinates={showDebugCellCoordinates}
            showEditor={showEditor}
            showNames={showNames}
            showRoomBadges={showRoomBadges}
            showProps={showProps}
            showAccessDots={showAccessDots}
            levelView={levelView}
            fadeOtherLevels={fadeOtherLevels}
            viewportViewBox={getViewportViewBox()}
            previewRoomHotspots={{
              enabled: enablePreviewRegionHotspots && !showEditor,
              selectedRegionId,
              hoveredRegionId,
              regionMarkers: previewRegionMarkers,
              onSelect: (region) =>
                onSelectedRegionChange?.(
                  region?.previewTargetId ||
                    region?.sourceRegionId ||
                    region?.requestMetadata?.sourceRegionId ||
                    region?.id ||
                    ""
                ),
              onHoverChange: (region) =>
                setPreviewHoveredRegion(
                  region?.previewTargetId ||
                    region?.sourceRegionId ||
                    region?.requestMetadata?.sourceRegionId ||
                    region?.id ||
                    ""
                ),
              onContextMenu: (event, region) =>
                onRegionContextMenu?.(
                  event,
                  region?.previewTargetId ||
                    region?.sourceRegionId ||
                    region?.requestMetadata?.sourceRegionId ||
                    region?.id ||
                    ""
                ),
            }}
            editorOptions={{
              draggingRegionId,
              hoveredRegionId,
              roomDragPreview,
              draggingCorridorHandle,
              corridorDragPreview,
              draggingMapAccessId,
              mapAccessDragPreview,
              hoverWallHandle,
              hoverCorridorHandle,
              hoveredCorridorId,
              connectionDraft,
              roomDragPreviewMap: roomDragRoutedPreview?.map || null,
              connectionDraftPreviewMap: connectionDraftRoutedPreview?.map || null,
              connectionDraftPreviewCorridorId: connectionDraftRoutedPreview?.corridorId || "",
              selectedRegionId,
              selectedStairMarkerId,
              selectedStairCorridorId,
              selectedStairIndex,
              showAccessDots,
              onRoomSelect: (region) => {
                setSelectedStairMarker(null);
                onSelectedRegionChange?.(region?.id || "");
              },
              onStairMarkerPointerDown: handleStairMarkerPointerDown,
              onStairMarkerKeyDown: handleStairMarkerKeyDown,
              onRoomPointerDown: handleRoomPointerDown,
              onRoomPointerEnter: handleRoomPointerEnter,
              onRoomPointerLeave: handleRoomPointerLeave,
              onRoomContextMenu: handleRoomContextMenu,
              onEditorPointerMove: handleEditorPointerMove,
              onEditorPointerUp: endEditorDrag,
              onDoorPointerDown: handleDoorPointerDown,
              onMapAccessPointerDown: handleMapAccessPointerDown,
              onMapAccessContextMenu: handleMapAccessContextMenu,
              onWaypointPointerDown: handleWaypointPointerDown,
              onWaypointContextMenu: handleWaypointContextMenu,
              onDoorContextMenu: handleDoorContextMenu,
              onCorridorZonePointerMove: handleCorridorZonePointerMove,
              onCorridorZonePointerLeave: handleCorridorZonePointerLeave,
              onJunctionContextMenu: handleJunctionContextMenu,
              onCorridorHandlePointerEnter: handleCorridorHandlePointerEnter,
              onCorridorHandlePointerLeave: handleCorridorHandlePointerLeave,
              onCorridorAddPointerDown: handleCorridorAddPointerDown,
              onCorridorAddContextMenu: handleCorridorAddContextMenu,
              onCorridorAddPointerLeave: handleCorridorAddPointerLeave,
              onWallZonePointerMove: handleWallZonePointerMove,
              onWallZonePointerLeave: handleWallZonePointerLeave,
              onWallZonePointerDown: handleWallZonePointerDown,
              onWallZoneContextMenu: handleWallZoneContextMenu,
              onWallHandlePointerDown: handleWallHandlePointerDown,
              onWallHandlePointerLeave: handleWallHandlePointerLeave,
            }}
          />
        </div>
        {viewportInteractive ? (
          <ContextMenuPortal>
            <RoomStyleContextMenu
              menu={roomContextMenu}
              generatedMap={generatedMap}
              manualOverrides={manualOverrides || createEmptyManualOverrides()}
              onChange={onRoomStyleChange}
              onReset={onRoomStyleReset}
              onLevelChange={onRoomLevelChange}
              onLevelReset={onRoomLevelReset}
              onClose={() => setRoomContextMenu(null)}
            />
            <DoorContextMenu
              menu={doorContextMenu}
              manualOverrides={manualOverrides || createEmptyManualOverrides()}
              isPureCave={pureCaveEditor}
              onTypeChange={onDoorTypeChange}
              onStairChange={onDoorStairChange}
              onCorridorTypeChange={onCorridorTypeChange}
              onDelete={onConnectionDelete}
              onClose={() => setDoorContextMenu(null)}
            />
            <CorridorJunctionContextMenu
              menu={junctionContextMenu}
              manualOverrides={manualOverrides || createEmptyManualOverrides()}
              isPureCave={pureCaveEditor}
              onChange={onJunctionTypeChange}
              onClose={() => setJunctionContextMenu(null)}
            />
            <WaypointContextMenu
              menu={waypointContextMenu}
              manualOverrides={manualOverrides || createEmptyManualOverrides()}
              isPureCave={pureCaveEditor}
              onDeleteWaypoint={onWaypointDelete}
              onDeleteConnection={onConnectionDelete}
              onJunctionChange={onJunctionTypeChange}
              onCorridorTypeChange={onCorridorTypeChange}
              onClose={() => setWaypointContextMenu(null)}
            />
            <AddWaypointContextMenu
              menu={addWaypointContextMenu}
              manualOverrides={manualOverrides || createEmptyManualOverrides()}
              isPureCave={pureCaveEditor}
              onAddWaypoint={onWaypointInsert}
              onJunctionChange={onJunctionTypeChange}
              onCorridorTypeChange={onCorridorTypeChange}
              onClose={() => setAddWaypointContextMenu(null)}
            />
            <WallAccessContextMenu
              menu={wallAccessContextMenu}
              onSet={onMapAccessSet}
              onRemove={onMapAccessRemove}
              onClose={() => setWallAccessContextMenu(null)}
            />
            <MapActionContextMenu
              menu={mapContextMenu}
              showGrid={showGrid}
              showEditor={showEditor}
              showProps={showProps}
              showAccessDots={showAccessDots}
              levelView={levelView}
              availableLevels={availableLevels}
              fadeOtherLevels={fadeOtherLevels}
              gridStyle={gridStyle}
              onNewSeed={onNewSeed}
              onToggleGrid={onToggleGrid}
              onGridStyleChange={onGridStyleChange}
              onToggleEditor={onToggleEditor}
              onToggleProps={onToggleProps}
              onToggleAccessDots={onToggleAccessDots}
              onLevelViewChange={onLevelViewChange}
              onToggleFadeOtherLevels={onToggleFadeOtherLevels}
              onExportSvg={onExportSvg}
              onExportGmSvg={onExportGmSvg}
              onExportPlayerSvg={onExportPlayerSvg}
              onExportPrintSvg={onExportPrintSvg}
              onExportState={onExportState}
              onImportState={onImportState}
              onUndo={onUndo}
              onRedo={onRedo}
              onClose={() => setMapContextMenu(null)}
            />
          </ContextMenuPortal>
        ) : null}
      </div>
      {shouldShowViewportChrome ? (
        <div className="map-canvas-bottombar cruor-ui-panel-surface">
          <div className="zoom-toolbar" aria-label="Map zoom controls">
            <button
              type="button"
              className="map-tool-button zoom-button cruor-ui-control-surface cruor-button cruor-button--sm"
              {...getGenericTooltipAttrs("Zoom In", "Increase the map zoom.", "+")}
              aria-label="Zoom In"
              onClick={() => zoomAtCenter(1.15)}
            >
              <i className="fa-solid fa-plus" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="map-tool-button zoom-button cruor-ui-control-surface cruor-button cruor-button--sm"
              {...getGenericTooltipAttrs("Zoom Out", "Decrease the map zoom.", "-")}
              aria-label="Zoom Out"
              onClick={() => zoomAtCenter(0.85)}
            >
              <i className="fa-solid fa-minus" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="map-tool-button zoom-button cruor-ui-control-surface cruor-button cruor-button--sm"
              {...getGenericTooltipAttrs("Fit Map", "Fit the whole map in view.", "0")}
              aria-label="Fit Map"
              onClick={fitView}
            >
              <i className="fa-solid fa-expand" aria-hidden="true" />
            </button>
            <span className="zoom-scale cruor-ui-chip-surface cruor-micro-chip">
              {Math.round(view.scale * 100)}%
            </span>
          </div>
          <div className="zoom-hint">
            Wheel zooms. Drag pans. Arrow keys pan. + / - zoom. 0 or Home fits.
          </div>
        </div>
      ) : null}
    </>
  );
}

function getRoomStyleMenuOptions(contextKey) {
  const shapes = [
    { value: "rect", label: "Standard" },
    { value: "hall", label: "Hall" },
    { value: "l-shape", label: "L-Shape" },
    { value: "circle", label: "Circle" },
    { value: "shaft", label: "Shaft / Oval" },
    ...(contextKey === "cave" || contextKey === "mine" ? [{ value: "cave", label: "Cave" }] : []),
  ];
  const types = [
    { value: "none", label: "None" },
    { value: "archive", label: "Archive" },
    ...(contextKey === "crypt" ? [{ value: "alcove", label: "Crypt Alcoves" }] : []),
    ...(contextKey === "chapel" ? [{ value: "apse", label: "Apse" }] : []),
    ...(contextKey === "ruins" ? [{ value: "ruined", label: "Ruined Room" }] : []),
  ];
  return {
    shapes,
    types,
    sizes: Object.keys(ROOM_SIZE_MENU_PRESETS).map((value) => ({
      value,
      label: value,
      dimensions: `${ROOM_SIZE_MENU_PRESETS[value].w}\u00D7${ROOM_SIZE_MENU_PRESETS[value].h}`,
      circleDiameter: ROOM_SIZE_MENU_PRESETS[value].circleD,
    })),
    toggles: [
      { key: "notch", label: "Notch" },
      { key: "ruined", label: "Ruined" },
    ],
  };
}

function isCircularRoomMenuShape(shape) {
  return shape === "circle";
}

function getRoomMenuPresetDimensions(size, shape) {
  if (!size) return "";
  if (isCircularRoomMenuShape(shape)) {
    const diameter =
      size.circleDiameter ||
      ROOM_SIZE_MENU_PRESETS[size.value]?.circleD ||
      Math.max(
        ROOM_SIZE_MENU_PRESETS[size.value]?.w || 0,
        ROOM_SIZE_MENU_PRESETS[size.value]?.h || 0
      );
    return `r ${diameter / 2} / \u00F8 ${diameter}`;
  }
  return size.dimensions;
}

function getCustomSizeLabel(style, region) {
  const customSize =
    style.customSize && typeof style.customSize === "object" ? style.customSize : null;
  if (style.sizePreset !== "Custom" || !customSize) return "Custom";
  if (isCircularRoomMenuShape(style.shape)) {
    const fallbackRadius = Math.max(1.5, Math.min(region.cellRect.w, region.cellRect.h) / 2);
    const radius = Number(customSize.radiusCells ?? customSize.radius);
    const safeRadius = Number.isFinite(radius) ? radius : fallbackRadius;
    return `Custom r ${safeRadius}`;
  }
  const width = Number(customSize.widthCells ?? customSize.w ?? customSize.width);
  const height = Number(customSize.heightCells ?? customSize.h ?? customSize.height);
  return `Custom ${Number.isFinite(width) ? Math.round(width) : region.cellRect.w}\u00D7${Number.isFinite(height) ? Math.round(height) : region.cellRect.h}`;
}

function normalizeCustomSizeInput(value, fallback, min, max, allowHalf = false) {
  const numeric = Number(value);
  const resolved = Number.isFinite(numeric) ? numeric : Number(fallback);
  const stepped = allowHalf ? Math.round(resolved * 2) / 2 : Math.round(resolved);
  return clamp(stepped, min, max);
}

function RoomSizeCustomControls({ region, style, onApply }) {
  const circular = isCircularRoomMenuShape(style.shape);
  const customSize =
    style.customSize && typeof style.customSize === "object" ? style.customSize : {};
  const fallbackRadius = Math.max(1.5, Math.min(region.cellRect.w, region.cellRect.h) / 2);
  const [draft, setDraft] = useState(() => ({
    radius: String(customSize.radiusCells ?? customSize.radius ?? fallbackRadius),
    width: String(customSize.widthCells ?? customSize.w ?? customSize.width ?? region.cellRect.w),
    height: String(
      customSize.heightCells ?? customSize.h ?? customSize.height ?? region.cellRect.h
    ),
  }));

  useEffect(() => {
    setDraft({
      radius: String(customSize.radiusCells ?? customSize.radius ?? fallbackRadius),
      width: String(customSize.widthCells ?? customSize.w ?? customSize.width ?? region.cellRect.w),
      height: String(
        customSize.heightCells ?? customSize.h ?? customSize.height ?? region.cellRect.h
      ),
    });
  }, [
    circular,
    customSize.heightCells,
    customSize.radius,
    customSize.radiusCells,
    customSize.h,
    customSize.w,
    customSize.widthCells,
    fallbackRadius,
    region.cellRect.h,
    region.cellRect.w,
    region.id,
  ]);

  const maxRadius = 16;
  const apply = () => {
    if (circular) {
      const radius = normalizeCustomSizeInput(draft.radius, fallbackRadius, 1.5, maxRadius, true);
      onApply?.({
        sizePreset: "Custom",
        customSize: { radiusCells: radius },
      });
      return;
    }
    const width = normalizeCustomSizeInput(draft.width, region.cellRect.w, 2, 40);
    const height = normalizeCustomSizeInput(draft.height, region.cellRect.h, 2, 40);
    onApply?.({
      sizePreset: "Custom",
      customSize: { widthCells: width, heightCells: height },
    });
  };

  return (
    <div className="room-context-custom-size">
      <div className="room-context-submenu__hint">Custom cells</div>
      {circular ? (
        <label>
          <span>Radius</span>
          <input
            type="number"
            min="1.5"
            max={maxRadius}
            step="0.5"
            value={draft.radius}
            onChange={(event) =>
              setDraft((current) => ({ ...current, radius: event.target.value }))
            }
          />
        </label>
      ) : (
        <div className="room-context-custom-size__grid">
          <label>
            <span>Width</span>
            <input
              type="number"
              min="2"
              max="40"
              step="1"
              value={draft.width}
              onChange={(event) =>
                setDraft((current) => ({ ...current, width: event.target.value }))
              }
            />
          </label>
          <label>
            <span>Height</span>
            <input
              type="number"
              min="2"
              max="40"
              step="1"
              value={draft.height}
              onChange={(event) =>
                setDraft((current) => ({ ...current, height: event.target.value }))
              }
            />
          </label>
        </div>
      )}
      <button
        type="button"
        className={style.sizePreset === "Custom" ? "is-active" : ""}
        onClick={apply}
      >
        <span>Apply Custom</span>
        <span>{style.sizePreset === "Custom" ? "Active" : ""}</span>
      </button>
    </div>
  );
}

function inferGeneratedRoomType(region) {
  if (region.roomType && region.roomType !== "none") return region.roomType;
  if (region.shape === "archive") return "archive";
  if (region.shape === "alcove") return "alcove";
  if (region.shape === "apse") return "apse";
  if (region.shape === "ruined-rect" || region.shape === "broken") return "ruined";
  return "none";
}

function inferGeneratedRoomShape(region) {
  if (["archive", "alcove", "apse", "ruined-rect", "broken"].includes(region.shape)) return "rect";
  return region.shape || "rect";
}

function getRoomStyleForMenu(region, manualOverrides) {
  const manual = manualOverrides.roomStyles?.[region.id] || {};
  return {
    surfaceKind: manual.surfaceKind || region.surfaceKind || "structure",
    shape: manual.shape || inferGeneratedRoomShape(region),
    roomType: manual.roomType || inferGeneratedRoomType(region),
    sizePreset: manual.sizePreset || region.size || "Medium",
    customSize: manual.customSize || null,
    notch: Boolean(manual.notch),
    ruined: Boolean(manual.ruined),
  };
}

function ConfirmingDeleteButton({
  label = "Delete",
  confirmLabel = "Confirm Delete",
  onConfirm,
  onClose,
}) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      className={armed ? "is-armed" : ""}
      onClick={() => {
        if (!armed) {
          setArmed(true);
          return;
        }
        onConfirm?.();
        onClose?.();
      }}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}

function ContextMenuPortal({ children }) {
  if (typeof document === "undefined") return children;
  return createPortal(children, document.body);
}

function useContextMenuDismiss(isOpen, onClose) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current?.contains?.(event.target)) return;
      onClose?.();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  return menuRef;
}

function RoomStyleContextMenu({
  menu,
  generatedMap,
  manualOverrides,
  onChange,
  onReset,
  onLevelChange,
  onLevelReset,
  onClose,
}) {
  const [activeGroup, setActiveGroup] = useState("type");
  if (!menu) return null;
  const region = generatedMap.regions.find((item) => item.id === menu.regionId);
  if (!region) return null;
  const contextKey = getContextKey(generatedMap.config.context || generatedMap.config.biome);
  const options = getRoomStyleMenuOptions(contextKey);
  const cavernSupported = contextKey === "cave" || contextKey === "mine";
  let style = getRoomStyleForMenu(region, manualOverrides);
  if (
    !cavernSupported &&
    (style.shape === "cave" || style.surfaceKind === "cave" || style.surfaceKind === "hybrid")
  ) {
    style = {
      ...style,
      shape: "rect",
      surfaceKind: "structure",
    };
  }
  const roomKind =
    style.shape === "cave" || style.surfaceKind === "cave" || style.surfaceKind === "hybrid"
      ? "cavern"
      : "building";
  const activeShape =
    options.shapes.find((shape) => shape.value === style.shape)?.label || style.shape;
  const activeType = roomKind === "cavern" ? "Cavern" : "Building";
  const activeSize =
    style.sizePreset === "Custom"
      ? getCustomSizeLabel(style, region)
      : options.sizes.find((size) => size.value === style.sizePreset)?.label || style.sizePreset;
  const activeRoomType =
    options.types.find((type) => type.value === style.roomType)?.label || style.roomType || "None";
  const manualRegionLevels = manualOverrides?.levels?.regions || {};
  const hasManualLevel = Object.prototype.hasOwnProperty.call(manualRegionLevels, region.id);
  const currentLevel = normalizeLevelNumber(
    hasManualLevel ? manualRegionLevels[region.id] : region.level,
    0,
  );
  const activeLevelLabel = `Level ${formatMapLevel(currentLevel)}`;
  const activeModifiers = [
    ...(style.roomType && style.roomType !== "none" ? [activeRoomType] : []),
    ...options.toggles.filter((toggle) => style[toggle.key]).map((toggle) => toggle.label),
  ];

  return (
    <div
      className="room-context-menu room-style-context-menu"
      style={{ left: menu.x, top: menu.y }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="room-context-menu__header">
        <strong>{region.name}</strong>
        <span>
          {region.number} {"\u00B7"} {contextKey} {"\u00B7"} {region.cellRect.w}
          {"\u00D7"}
          {region.cellRect.h}
        </span>
      </div>
      <div className="room-context-menu__body">
        <div className="room-context-menu__item" onPointerEnter={() => setActiveGroup("type")}>
          <button type="button" className="room-context-menu__trigger">
            <span>Type</span>
            <span>
              {activeType} {"\u203A"}
            </span>
          </button>
          {activeGroup === "type" && (
            <div className="room-context-submenu">
              <div className="room-context-submenu__hint">Region surface model</div>
              <button
                type="button"
                className={roomKind === "building" ? "is-active" : ""}
                onClick={() =>
                  onChange(region.id, {
                    shape: "rect",
                    surfaceKind: "structure",
                  })
                }
              >
                <span>Building</span>
                <span>{roomKind === "building" ? "Active" : ""}</span>
              </button>
              <button
                type="button"
                className={roomKind === "cavern" ? "is-active" : ""}
                disabled={!cavernSupported}
                onClick={() =>
                  onChange(region.id, {
                    shape: "cave",
                    surfaceKind: "cave",
                    roomType: "none",
                    notch: false,
                    ruined: false,
                  })
                }
              >
                <span>Cavern</span>
                <span>
                  {!cavernSupported ? "Unavailable" : roomKind === "cavern" ? "Active" : ""}
                </span>
              </button>
            </div>
          )}
        </div>
        <div className="room-context-menu__item" onPointerEnter={() => setActiveGroup("shape")}>
          <button type="button" className="room-context-menu__trigger">
            <span>Shape</span>
            <span>
              {roomKind === "cavern" ? "Not available" : activeShape} {"\u203A"}
            </span>
          </button>
          {activeGroup === "shape" && (
            <div className="room-context-submenu">
              <div className="room-context-submenu__hint">Base footprint</div>
              {roomKind === "cavern" ? (
                <button type="button" disabled>
                  <span>Not available</span>
                  <span />
                </button>
              ) : (
                options.shapes.map((shape) => (
                  <button
                    key={shape.value}
                    type="button"
                    className={style.shape === shape.value ? "is-active" : ""}
                    onClick={() => onChange(region.id, { shape: shape.value })}
                  >
                    <span>{shape.label}</span>
                    <span>{style.shape === shape.value ? "Active" : ""}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div className="room-context-menu__item" onPointerEnter={() => setActiveGroup("size")}>
          <button type="button" className="room-context-menu__trigger">
            <span>Size</span>
            <span>
              {activeSize} {"\u203A"}
            </span>
          </button>
          {activeGroup === "size" && (
            <div className="room-context-submenu">
              <div className="room-context-submenu__hint">Room bounding box</div>
              {options.sizes.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  className={style.sizePreset === size.value ? "is-active" : ""}
                  onClick={() =>
                    onChange(region.id, {
                      sizePreset: size.value,
                      customSize: null,
                    })
                  }
                >
                  <span>{size.label}</span>
                  <span>
                    {getRoomMenuPresetDimensions(size, style.shape)}
                    {style.sizePreset === size.value ? " Active" : ""}
                  </span>
                </button>
              ))}
              <RoomSizeCustomControls
                region={region}
                style={style}
                onApply={(patch) => onChange(region.id, patch)}
              />
            </div>
          )}
        </div>
        <div className="room-context-menu__item" onPointerEnter={() => setActiveGroup("level")}>
          <button type="button" className="room-context-menu__trigger">
            <span>Level</span>
            <span>
              {activeLevelLabel} {"›"}
            </span>
          </button>
          {activeGroup === "level" && (
            <div className="room-context-submenu">
              <div className="room-context-submenu__hint">Room elevation drives connected stairs</div>
              {ROOM_LEVEL_MENU_OPTIONS.map((level) => (
                <button
                  key={`room-level-${level}`}
                  type="button"
                  className={currentLevel === level ? "is-active" : ""}
                  onClick={() => onLevelChange?.(region.id, level)}
                >
                  <span>Level {formatMapLevel(level)}</span>
                  <span>{currentLevel === level ? "Active" : ""}</span>
                </button>
              ))}
              <button
                type="button"
                disabled={!hasManualLevel}
                onClick={() => onLevelReset?.(region.id)}
              >
                <span>Reset Level</span>
                <span>{hasManualLevel ? "Manual" : "Derived"}</span>
              </button>
            </div>
          )}
        </div>
        <div className="room-context-menu__item" onPointerEnter={() => setActiveGroup("modifiers")}>
          <button type="button" className="room-context-menu__trigger">
            <span>Modifiers</span>
            <span>
              {roomKind === "cavern"
                ? "Not available"
                : activeModifiers.length > 0
                  ? activeModifiers.length
                  : "None"}{" "}
              {"\u203A"}
            </span>
          </button>
          {activeGroup === "modifiers" && (
            <div className="room-context-submenu">
              <div className="room-context-submenu__hint">Room-specific structure</div>
              {roomKind === "cavern" ? (
                <button type="button" disabled>
                  <span>Not available</span>
                  <span />
                </button>
              ) : (
                <>
                  {options.types.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={style.roomType === type.value ? "is-active" : ""}
                      onClick={() => onChange(region.id, { roomType: type.value })}
                    >
                      <span>{type.label}</span>
                      <span>{style.roomType === type.value ? "Active" : ""}</span>
                    </button>
                  ))}
                  {options.toggles.map((toggle) => (
                    <button
                      key={toggle.key}
                      type="button"
                      className={style[toggle.key] ? "is-active" : ""}
                      onClick={() =>
                        onChange(region.id, {
                          [toggle.key]: !style[toggle.key],
                        })
                      }
                    >
                      <span>{toggle.label}</span>
                      <span>{style[toggle.key] ? "Active" : ""}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="room-context-menu__actions">
        <button
          type="button"
          onClick={() => {
            onReset(region.id);
            onClose?.();
          }}
        >
          Reset Room
        </button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function WallAccessContextMenu({ menu, onSet, onRemove, onClose }) {
  const menuRef = useContextMenuDismiss(Boolean(menu), onClose);
  if (!menu) return null;
  const actionLabel = menu.hasAccessAtAnchor
    ? "Remove Passage"
    : menu.hasRegionAccess
      ? "Move Passage Here"
      : "Add Passage";
  return (
    <div
      ref={menuRef}
      className="room-context-menu wall-access-context-menu"
      style={{ left: menu.x, top: menu.y }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="room-context-menu__header">
        <strong>Map Passage</strong>
        <span>
          {menu.regionId} {"\u00B7"} {menu.anchor?.side || "wall"}
        </span>
      </div>
      <div className="room-context-menu__body">
        <button
          type="button"
          className="room-context-menu__trigger"
          onClick={() => {
            if (menu.hasAccessAtAnchor) {
              onRemove?.(menu.regionId);
              onClose?.();
              return;
            }
            onSet?.(menu.regionId, menu.anchor, menu.accessType || "passage");
            onClose?.();
          }}
        >
          <span>
            <i className="fa-solid fa-route" aria-hidden="true" /> {actionLabel}
          </span>
          <span aria-hidden="true">{"\u203A"}</span>
        </button>
      </div>
      <div className="room-context-menu__actions">
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function AddWaypointContextMenu({
  menu,
  manualOverrides,
  isPureCave = false,
  onAddWaypoint,
  onJunctionChange,
  onCorridorTypeChange,
  onClose,
}) {
  if (!menu) return null;
  const hasJunction = Boolean(menu.junctionKey);
  const currentJunctionType = hasJunction
    ? getManualJunctionType(manualOverrides.corridorJunctions || {}, menu.junctionKey, "merge")
    : null;
  const junctionLabels = {
    merge: isPureCave ? "Natural Merge" : "Normal Merge",
    wall: isPureCave ? "Blocked Passage" : "Wall",
    door: isPureCave ? "Passage" : "Door",
  };
  const pointLabel = isPureCave ? "Tunnel Point" : "Corridor Point";
  const junctionPointLabel = isPureCave ? "Tunnel Junction Point" : "Corridor Junction Point";
  const addLabel = isPureCave ? "Add Tunnel Point" : "Add Waypoint";
  const junctionLabel = isPureCave ? "Connection" : "Junction";
  return (
    <div
      className="room-context-menu add-waypoint-context-menu"
      style={{ left: menu.x, top: menu.y }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="room-context-menu__header">
        <strong>{hasJunction ? junctionPointLabel : pointLabel}</strong>
        <span>
          {menu.corridorId} {"\u00B7"} Cell {menu.cell.x},{menu.cell.y}
        </span>
      </div>
      <div className="room-context-menu__body">
        <button
          type="button"
          className="room-context-menu__trigger"
          onClick={() => {
            onAddWaypoint?.(menu.corridorId, menu.insertIndex, menu.point);
            onClose?.();
          }}
        >
          <span>{addLabel}</span>
          <span aria-hidden="true">{"\u203A"}</span>
        </button>
        <CorridorTypeMenuSection
          corridorId={menu.corridorId}
          manualOverrides={manualOverrides}
          fallbackType={menu.fallbackCorridorType}
          isPureCave={isPureCave}
          onChange={onCorridorTypeChange}
        />
        {hasJunction && (
          <>
            <div className="room-context-menu__label">{junctionLabel}</div>
            {JUNCTION_TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
                className={
                  currentJunctionType === type
                    ? "room-context-menu__trigger is-active"
                    : "room-context-menu__trigger"
                }
                onClick={() => {
                  onJunctionChange?.(menu.junctionKey, type);
                }}
              >
                <span>{junctionLabels[type]}</span>
                <span>{currentJunctionType === type ? "\u2713" : ""}</span>
              </button>
            ))}
          </>
        )}
      </div>
      <div className="room-context-menu__actions">
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function WaypointContextMenu({
  menu,
  manualOverrides,
  isPureCave = false,
  onDeleteWaypoint,
  onDeleteConnection,
  onJunctionChange,
  onCorridorTypeChange,
  onClose,
}) {
  if (!menu) return null;
  const hasJunction = Boolean(menu.junctionKey);
  const currentJunctionType = hasJunction
    ? getManualJunctionType(manualOverrides.corridorJunctions || {}, menu.junctionKey, "merge")
    : null;
  const junctionLabels = {
    merge: isPureCave ? "Natural Merge" : "Normal Merge",
    wall: isPureCave ? "Blocked Passage" : "Wall",
    door: isPureCave ? "Passage" : "Door",
  };
  const waypointLabel = isPureCave ? "Tunnel Point" : "Corridor Waypoint";
  const junctionWaypointLabel = isPureCave ? "Tunnel Junction Point" : "Corridor Junction Waypoint";
  const deleteLabel = isPureCave ? "Delete Tunnel Point" : "Delete Waypoint";
  const confirmDeleteLabel = isPureCave ? "Confirm Delete Tunnel Point" : "Confirm Delete Waypoint";
  const junctionLabel = isPureCave ? "Connection" : "Junction";
  return (
    <div
      className="room-context-menu waypoint-context-menu"
      style={{ left: menu.x, top: menu.y }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="room-context-menu__header">
        <strong>{hasJunction ? junctionWaypointLabel : waypointLabel}</strong>
        <span>
          {menu.corridorId} {"\u00B7"} Cell {menu.cell.x},{menu.cell.y}
        </span>
      </div>
      <div className="room-context-menu__body">
        <ConfirmingDeleteButton
          label={deleteLabel}
          confirmLabel={confirmDeleteLabel}
          onConfirm={() => onDeleteWaypoint?.(menu.corridorId, menu.waypointIndex, menu.source)}
          onClose={onClose}
        />
        <CorridorTypeMenuSection
          corridorId={menu.corridorId}
          manualOverrides={manualOverrides}
          fallbackType={menu.fallbackCorridorType}
          isPureCave={isPureCave}
          onChange={onCorridorTypeChange}
        />
        {hasJunction && (
          <>
            <div className="room-context-menu__label">{junctionLabel}</div>
            {JUNCTION_TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
                className={
                  currentJunctionType === type
                    ? "room-context-menu__trigger is-active"
                    : "room-context-menu__trigger"
                }
                onClick={() => {
                  onJunctionChange?.(menu.junctionKey, type);
                }}
              >
                <span>{junctionLabels[type]}</span>
                <span>{currentJunctionType === type ? "\u2713" : ""}</span>
              </button>
            ))}
          </>
        )}
      </div>
      <div className="room-context-menu__actions">
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function CorridorTypeMenuSection({
  corridorId,
  manualOverrides,
  fallbackType = "normal",
  isPureCave = false,
  onChange,
}) {
  if (!corridorId) return null;
  const corridorTypes = manualOverrides?.corridorTypes || {};
  const key = corridorTypeKey(corridorId);
  const hasManualType = Object.prototype.hasOwnProperty.call(corridorTypes, key);
  const currentType = getManualCorridorType(
    corridorTypes,
    corridorId,
    normalizeCorridorType(fallbackType, "normal")
  );
  const labels = isPureCave
    ? {
        normal: "Natural",
        narrow: "Narrow",
        collapsed: "Collapsed",
        secret: "Hidden",
        gallery: "Gallery",
      }
    : {
        normal: "Normal",
        narrow: "Narrow",
        collapsed: "Collapsed",
        secret: "Secret",
        gallery: "Gallery",
      };
  return (
    <>
      <div className="room-context-menu__label">Corridor Type</div>
      {CORRIDOR_TYPE_OPTIONS.map((type) => {
        const disabled = EDITOR_DISABLED_CORRIDOR_TYPES.has(type);
        return (
          <button
            key={type}
            type="button"
            className={cx(
              "room-context-menu__trigger",
              currentType === type && "is-active",
              disabled && "is-disabled",
            )}
            disabled={disabled}
            aria-disabled={disabled}
            onClick={() => {
              if (disabled) return;
              onChange?.(corridorId, type);
            }}
          >
            <span>{labels[type]}</span>
            <span>{disabled ? "Later" : currentType === type ? "\u2713" : ""}</span>
          </button>
        );
      })}
      <button
        type="button"
        className="room-context-menu__trigger"
        disabled={!hasManualType}
        onClick={() => {
          onChange?.(corridorId, null);
        }}
      >
        <span>Reset Type</span>
        <span>{hasManualType ? "" : "Inferred"}</span>
      </button>
    </>
  );
}

function CorridorJunctionContextMenu({
  menu,
  manualOverrides,
  isPureCave = false,
  onChange,
  onClose,
}) {
  if (!menu) return null;
  const currentType = getManualJunctionType(
    manualOverrides.corridorJunctions || {},
    menu.key,
    "merge"
  );
  const labels = {
    merge: isPureCave ? "Natural Merge" : "Normal Merge",
    wall: isPureCave ? "Blocked Passage" : "Wall",
    door: isPureCave ? "Passage" : "Door",
  };
  return (
    <div
      className="room-context-menu corridor-junction-context-menu"
      style={{ left: menu.x, top: menu.y }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="room-context-menu__header">
        <strong>{isPureCave ? "Tunnel Connection" : "Corridor Junction"}</strong>
        <span>
          Cell {menu.cell.x},{menu.cell.y} {"\u00B7"} {menu.corridorIds.length}{" "}
          {isPureCave ? "passages" : "corridors"}
        </span>
      </div>
      <div className="room-context-menu__body">
        {JUNCTION_TYPE_OPTIONS.map((type) => (
          <button
            key={type}
            type="button"
            className={
              currentType === type
                ? "room-context-menu__trigger is-active"
                : "room-context-menu__trigger"
            }
            onClick={() => {
              onChange?.(menu.key, type);
            }}
          >
            <span>{labels[type]}</span>
            <span>{currentType === type ? "\u2713" : ""}</span>
          </button>
        ))}
      </div>
      <div className="room-context-menu__actions">
        <button
          type="button"
          onClick={() => {
            onChange?.(menu.key, "merge");
          }}
        >
          Reset
        </button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function DoorContextMenu({
  menu,
  manualOverrides,
  isPureCave = false,
  onTypeChange,
  onStairChange,
  onCorridorTypeChange,
  onDelete,
  onClose,
}) {
  if (!menu) return null;
  const currentType = getManualDoorType(
    manualOverrides.doorTypes || {},
    menu.corridorId,
    menu.endpoint,
    menu.fallbackType || "default"
  );
  const currentStair = getManualStairTransition(
    manualOverrides.stairTransitions || {},
    menu.corridorId,
    menu.endpoint,
    "none"
  );
  const labels = {
    default: "Default",
    secret: "Secret",
    locked: "Locked",
    open: "Open",
  };
  const stairLabels = {
    none: "No Stair",
    up: "Stairs Up (+1)",
    down: "Stairs Down (-1)",
  };
  return (
    <div
      className="room-context-menu door-context-menu"
      style={{ left: menu.x, top: menu.y }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="room-context-menu__header">
        <strong>{isPureCave ? "Passage" : "Door"}</strong>
        <span>
          {menu.corridorId} {"\u00B7"} {menu.endpoint}
        </span>
      </div>
      <div className="room-context-menu__body">
        {DOOR_TYPE_OPTIONS.map((type) => (
          <button
            key={type}
            type="button"
            className={
              currentType === type
                ? "room-context-menu__trigger is-active"
                : "room-context-menu__trigger"
            }
            onClick={() => {
              onTypeChange?.(menu.corridorId, menu.endpoint, type);
            }}
          >
            <span>{labels[type]}</span>
            <span>{currentType === type ? "\u2713" : ""}</span>
          </button>
        ))}
        <div className="room-context-menu__label">Stair</div>
        {STAIR_TRANSITION_OPTIONS.map((type) => (
          <button
            key={type}
            type="button"
            className={
              currentStair === type
                ? "room-context-menu__trigger is-active"
                : "room-context-menu__trigger"
            }
            onClick={() => {
              onStairChange?.(menu.corridorId, menu.endpoint, type);
            }}
          >
            <span>{stairLabels[type]}</span>
            <span>{currentStair === type ? "\u2713" : ""}</span>
          </button>
        ))}
        <CorridorTypeMenuSection
          corridorId={menu.corridorId}
          manualOverrides={manualOverrides}
          fallbackType={menu.fallbackCorridorType}
          isPureCave={isPureCave}
          onChange={onCorridorTypeChange}
        />
      </div>
      <div className="room-context-menu__actions">
        <ConfirmingDeleteButton
          label="Delete"
          confirmLabel="Confirm Delete"
          onConfirm={() => onDelete?.(menu.corridorId)}
          onClose={onClose}
        />
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function MapActionContextMenu({
  menu,
  showGrid,
  showEditor,
  showProps,
  showAccessDots = false,
  levelView = LEVEL_VIEW_ALL,
  availableLevels = [],
  fadeOtherLevels = true,
  gridStyle,
  onNewSeed,
  onToggleGrid,
  onGridStyleChange,
  onToggleEditor,
  onToggleProps,
  onToggleAccessDots,
  onLevelViewChange,
  onToggleFadeOtherLevels,
  onExportSvg,
  onExportGmSvg,
  onExportPlayerSvg,
  onExportPrintSvg,
  onExportState,
  onImportState,
  onUndo,
  onRedo,
  onClose,
}) {
  if (!menu) return null;
  const gridLabels = {
    solid: "Solid",
    dotted: "Dotted",
    dashed: "Dashed",
    none: "None",
  };
  const run = (action) => {
    action?.();
  };
  const runAndClose = (action) => {
    action?.();
    onClose?.();
  };
  const normalizedLevelView = normalizeLevelView(levelView, availableLevels);
  const levelLabel =
    normalizedLevelView === LEVEL_VIEW_ALL
      ? "All Levels"
      : `Level ${formatMapLevel(normalizedLevelView)}`;
  const levelIconName = (level) => (level > 0 ? "arrow-up" : level < 0 ? "arrow-down" : "minus");
  const setGridStyleOnly = (style) => {
    onGridStyleChange?.(style);
  };
  const icon = (name) => <i className={`fa-solid fa-${name}`} aria-hidden="true" />;

  return (
    <div
      className="room-context-menu map-action-menu"
      style={{ left: menu.x, top: menu.y }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="context-menu-toolbar" aria-label="Quick map actions">
        <button
          type="button"
          {...getGenericTooltipAttrs("Undo")}
          aria-label="Undo"
          onClick={() => run(onUndo)}
        >
          {icon("rotate-left")}
        </button>
        <button
          type="button"
          {...getGenericTooltipAttrs("Redo")}
          aria-label="Redo"
          onClick={() => run(onRedo)}
        >
          {icon("rotate-right")}
        </button>
        <span className="context-menu-toolbar__divider" />
        <button
          type="button"
          className={showGrid ? "is-active" : ""}
          {...getGenericTooltipAttrs("Toggle Grid")}
          aria-label="Toggle Grid"
          onClick={() => run(onToggleGrid)}
        >
          {icon("border-all")}
        </button>
        <button
          type="button"
          className={showEditor ? "is-active" : ""}
          {...getGenericTooltipAttrs("Toggle Editor View")}
          aria-label="Toggle Editor View"
          onClick={() => run(onToggleEditor)}
        >
          {icon("pen-ruler")}
        </button>
      </div>
      <div className="room-context-menu__header">
        <strong>Map Actions</strong>
        <span>Generator controls</span>
      </div>
      <div className="room-context-menu__body">
        <button
          type="button"
          className="room-context-menu__trigger"
          onClick={() => runAndClose(onNewSeed)}
        >
          <span>{icon("shuffle")} New Seed</span>
          <span aria-hidden="true">{"\u203A"}</span>
        </button>
        <div className="room-context-menu__item">
          <button type="button" className="room-context-menu__trigger">
            <span>{icon("border-all")} Grid</span>
            <span>
              {gridLabels[normalizeGridStyle(gridStyle)]} {"\u203A"}
            </span>
          </button>
          <div className="room-context-submenu">
            <div className="room-context-submenu__hint">Grid rendering</div>
            {GRID_STYLE_OPTIONS.map((style) => (
              <button
                key={style}
                type="button"
                className={normalizeGridStyle(gridStyle) === style ? "is-active" : ""}
                onClick={() => setGridStyleOnly(style)}
              >
                <span>
                  {icon(
                    style === "solid"
                      ? "table-cells"
                      : style === "dotted"
                        ? "braille"
                        : style === "dashed"
                          ? "grip-lines"
                          : "eye-slash"
                  )}{" "}
                  {gridLabels[style]}
                </span>
                <span>{normalizeGridStyle(gridStyle) === style ? "\u2713" : ""}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className={
            showProps ? "room-context-menu__trigger is-active" : "room-context-menu__trigger"
          }
          onClick={() => run(onToggleProps)}
        >
          <span>{icon("boxes-stacked")} Props</span>
          <span>{showProps ? "On" : "Off"}</span>
        </button>
        <button
          type="button"
          className={
            showAccessDots ? "room-context-menu__trigger is-active" : "room-context-menu__trigger"
          }
          onClick={() => run(onToggleAccessDots)}
        >
          <span>{icon("location-dot")} Access Dots</span>
          <span>{showAccessDots ? "On" : "Off"}</span>
        </button>
        <div className="room-context-menu__item">
          <button type="button" className="room-context-menu__trigger">
            <span>{icon("layer-group")} Levels</span>
            <span>
              {levelLabel} {"\u203A"}
            </span>
          </button>
          <div className="room-context-submenu">
            <div className="room-context-submenu__hint">Level visibility</div>
            <button
              type="button"
              className={normalizedLevelView === LEVEL_VIEW_ALL ? "is-active" : ""}
              onClick={() => onLevelViewChange?.(LEVEL_VIEW_ALL)}
            >
              <span>{icon("layer-group")} All Levels</span>
              <span>{normalizedLevelView === LEVEL_VIEW_ALL ? "\u2713" : ""}</span>
            </button>
            {availableLevels.map((level) => (
              <button
                key={`level-${level}`}
                type="button"
                className={normalizedLevelView === level ? "is-active" : ""}
                onClick={() => onLevelViewChange?.(level)}
              >
                <span>
                  {icon(levelIconName(level))} Level {formatMapLevel(level)}
                </span>
                <span>{normalizedLevelView === level ? "\u2713" : ""}</span>
              </button>
            ))}
            <button
              type="button"
              className={fadeOtherLevels ? "is-active" : ""}
              onClick={() => onToggleFadeOtherLevels?.()}
            >
              <span>{icon("circle-half-stroke")} Fade Other Levels</span>
              <span>{fadeOtherLevels ? "On" : "Off"}</span>
            </button>
          </div>
        </div>
        <div className="room-context-menu__item">
          <button type="button" className="room-context-menu__trigger">
            <span>{icon("file-export")} Export</span>
            <span aria-hidden="true">{"\u203A"}</span>
          </button>
          <div className="room-context-submenu">
            <div className="room-context-submenu__hint">Output format</div>
            <button type="button" onClick={() => run(onExportSvg)}>
              <span>{icon("vector-square")} Current SVG</span>
              <span aria-hidden="true">{"\u203A"}</span>
            </button>
            <button type="button" onClick={() => run(onExportGmSvg)}>
              <span>{icon("user-secret")} GM SVG</span>
              <span aria-hidden="true">{"\u203A"}</span>
            </button>
            <button type="button" onClick={() => run(onExportPlayerSvg)}>
              <span>{icon("users")} Player SVG</span>
              <span aria-hidden="true">{"\u203A"}</span>
            </button>
            <button type="button" onClick={() => run(onExportPrintSvg)}>
              <span>{icon("print")} Print SVG</span>
              <span aria-hidden="true">{"\u203A"}</span>
            </button>
            <button type="button" onClick={() => run(onExportState)}>
              <span>{icon("floppy-disk")} State JSON</span>
              <span aria-hidden="true">{"\u203A"}</span>
            </button>
          </div>
        </div>
        <button
          type="button"
          className="room-context-menu__trigger"
          onClick={() => run(onImportState)}
        >
          <span>{icon("file-import")} Import State</span>
          <span aria-hidden="true">{"\u203A"}</span>
        </button>
      </div>
    </div>
  );
}

function RoomKey({ generatedMap }) {
  return (
    <div className="room-key cruor-scroll-surface">
      {[...generatedMap.regions]
        .sort((a, b) => a.number - b.number)
        .map((region) => (
          <div key={region.id} className="room-key__item cruor-ui-card-surface">
            <span className="room-key__number cruor-ui-chip-surface">{region.number}</span>
            <div>
              <div className="room-key__name">{region.name}</div>
              <div className="room-key__meta">
                {region.role} {"\u00B7"} {region.graphRole || "region"} {"\u00B7"} level{" "}
                {region.level ?? 0} {"\u00B7"} depth {region.graphDepth ?? "\u2014"} {"\u00B7"}{" "}
                {region.placementProfile || "layout"} {"\u00B7"} surface{" "}
                {getRegionSurfaceKind(region, generatedMap)} {"\u00B7"} {region.shape || "rect"}{" "}
                {"\u00B7"} {region.roomType || region.shapeOptions?.roomType || "none"} {"\u00B7"}{" "}
                {region.cellRect.w}
                {"\u00D7"}
                {region.cellRect.h}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

function formatTooltipList(values) {
  if (!Array.isArray(values) || values.length === 0) return "";
  return values.filter(Boolean).join(", ");
}

function getRegionMetadata(region) {
  return region?.metadata && typeof region.metadata === "object" ? region.metadata : {};
}

function getImportedRegionForTooltip(region, importedRegions) {
  if (!region || !Array.isArray(importedRegions)) return null;
  return (
    importedRegions.find(
      (item) =>
        item.id === region.id ||
        item.sourceRegionId === region.id ||
        item.id === region.sourceRegionId ||
        item.sourceRegionId === region.sourceRegionId ||
        item.label === region.name
    ) || null
  );
}

function getImportedRegionValue(importedRegion, key) {
  if (!importedRegion) return "";
  const metadata = getRegionMetadata(importedRegion);
  return importedRegion[key] || metadata[key] || "";
}

function getTooltipReadAloud(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.compact || value.extended || "";
}

function createRoomTooltipPayload(region, generatedMap, importedRegion = null) {
  if (!region) return null;
  const requestMetadata =
    region.requestMetadata && typeof region.requestMetadata === "object"
      ? region.requestMetadata
      : {};
  const role = importedRegion?.role || region.role || "Location Region";
  const shape =
    importedRegion?.shape ||
    region.shape ||
    region.roomType ||
    region.shapeOptions?.roomType ||
    "room";
  const size =
    importedRegion?.size ||
    region.size ||
    `${region.cellRect?.w || "?"}\u00D7${region.cellRect?.h || "?"}`;
  const generatedLinks = generatedMap.corridors.filter(
    (corridor) => corridor.from === region.id || corridor.to === region.id
  ).length;
  const importedConnectors = Number(importedRegion?.connectors);
  const linkCount = Number.isFinite(importedConnectors) ? importedConnectors : generatedLinks;
  const metaParts = [role, shape, size, `${linkCount} link${linkCount === 1 ? "" : "s"}`].filter(
    Boolean
  );
  const importedReadAloud =
    getTooltipReadAloud(getImportedRegionValue(importedRegion, "readAloud")) ||
    getImportedRegionValue(importedRegion, "read");
  const generatedReadAloud =
    getTooltipReadAloud(requestMetadata.readAloud) ||
    getTooltipReadAloud(region.readAloud) ||
    requestMetadata.read ||
    region.read ||
    "";

  return {
    type: "room",
    title: importedRegion?.label || region.name || `Region ${region.number || ""}`.trim(),
    role,
    shape,
    meta: metaParts.join(" \u00B7 "),
    readAloud: importedReadAloud || generatedReadAloud,
    feature:
      getImportedRegionValue(importedRegion, "feature") ||
      requestMetadata.feature ||
      region.feature ||
      "",
    interaction:
      getImportedRegionValue(importedRegion, "interaction") ||
      getImportedRegionValue(importedRegion, "interact") ||
      requestMetadata.interaction ||
      requestMetadata.interact ||
      region.interaction ||
      region.interact ||
      "",
    danger:
      getImportedRegionValue(importedRegion, "danger") ||
      requestMetadata.danger ||
      region.danger ||
      "",
    secret:
      getImportedRegionValue(importedRegion, "secret") ||
      requestMetadata.secret ||
      region.secret ||
      "",
  };
}

function getGenericTooltipAttrs(label, description = "", kbd = "") {
  const attrs = {
    "data-key": "tooltip-generic",
    "data-tooltip": label,
  };
  if (description) attrs["data-tooltip-description"] = description;
  if (kbd) attrs["data-tooltip-kbd"] = kbd;
  return attrs;
}

function suppressToolbarTextSelection(event) {
  event.preventDefault();
}

function isEventInsideNode(event, node) {
  if (!node) return false;
  const path = typeof event.composedPath === "function" ? event.composedPath() : [];
  return path.length > 0 ? path.includes(node) : node.contains(event.target);
}

const MAP_GRID_STYLE_LABELS = {
  solid: "Solid",
  dotted: "Dotted",
  dashed: "Dashed",
  none: "None",
};

const MAP_GRID_STYLE_ICONS = {
  solid: "table-cells",
  dotted: "braille",
  dashed: "grip-lines",
  none: "eye-slash",
};

const MAP_GRID_WEIGHT_LABELS = {
  fine: "Fine",
  normal: "Normal",
  bold: "Bold",
};

const MAP_GRID_WEIGHT_ICONS = {
  fine: "minus",
  normal: "grip-lines",
  bold: "equals",
};

const MAP_GRID_COLOR_LABELS = {
  default: "Default",
  light: "Light Grey",
  darker: "Darker",
  blood: "Blood",
  sepia: "Sepia",
  black: "Black",
};

const MAP_GRID_COLOR_ICONS = {
  default: "circle-half-stroke",
  light: "circle",
  darker: "moon",
  blood: "droplet",
  sepia: "scroll",
  black: "circle",
};

const MAP_VISUAL_STYLE_ICONS = {
  cruor: "moon",
  ink: "pen-nib",
  cartographic: "ruler-combined",
  blood: "droplet",
  bone: "scroll",
  print: "print",
};

const CROSSHATCH_STYLE_OPTIONS = [
  { value: "classic", label: "Classic", icon: "grip-lines" },
  { value: "none", label: "None", icon: "eye-slash" },
];

function MapToolButton({
  icon,
  label,
  description = "",
  kbd = "",
  active = false,
  disabled = false,
  visibility = "",
  className = "",
  onClick,
}) {
  return (
    <button
      type="button"
      className={cx(
        "map-tool-button location-map-toolbar__button location-icon-toggle-button cruor-frame-icon-toggle location-map-toolbar__button--secondary",
        active && "is-active",
        className
      )}
      data-ui-mode-advanced-only={visibility === "advanced" ? "" : undefined}
      data-ui-mode-debug-only={visibility === "debug" ? "" : undefined}
      data-map-advanced-only={visibility === "advanced" ? "" : undefined}
      data-map-debug-only={visibility === "debug" ? "" : undefined}
      {...getGenericTooltipAttrs(label, description, kbd)}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onMouseDown={suppressToolbarTextSelection}
      onClick={onClick}
    >
      <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
    </button>
  );
}

function MapToolMenuButton({
  icon,
  label,
  description = "",
  active = false,
  disabled = false,
  danger = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={cx(
        "location-map-toolbar__map-menu-action",
        active && "is-active",
        danger && "is-danger"
      )}
      {...getGenericTooltipAttrs(label, description || label)}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onMouseDown={suppressToolbarTextSelection}
      onClick={onClick}
      role="menuitem"
    >
      <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

function MapStyleOptionButton({ icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      className={cx("location-map-toolbar__style-option", active && "is-active")}
      onMouseDown={suppressToolbarTextSelection}
      onClick={onClick}
    >
      <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
      <span>{label}</span>
      <i
        className={active ? "fa-solid fa-check" : "fa-solid fa-chevron-right"}
        aria-hidden="true"
      />
    </button>
  );
}

function MapStyleSlider({ id, label, value, onChange }) {
  const normalizedValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return (
    <label className="location-map-toolbar__style-slider" htmlFor={id}>
      <span>
        {label}
        <strong>{Math.round(normalizedValue * 100)}%</strong>
      </span>
      <input
        id={id}
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={normalizedValue}
        onMouseDown={(event) => event.stopPropagation()}
        onChange={(event) => onChange?.(Number(event.target.value))}
      />
    </label>
  );
}

function MapStyleMenuSection({ icon, label, valueLabel, children }) {
  return (
    <span className="location-map-toolbar__style-section" role="none">
      <button
        type="button"
        className="location-map-toolbar__style-section-title"
        role="menuitem"
        aria-haspopup="menu"
        onMouseDown={suppressToolbarTextSelection}
        onClick={(event) => event.preventDefault()}
      >
        <span>
          <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
          {label}
        </span>
        <span className="location-map-toolbar__style-subtitle">
          {valueLabel}
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </span>
      </button>
      <span
        className="location-map-toolbar__style-panel cruor-ui-panel-surface"
        data-style-menu="flyout"
        role="menu"
        aria-label={`${label} style options`}
      >
        {children}
      </span>
    </span>
  );
}

function getStyleMenuPortalPlacement(triggerNode) {
  if (typeof window === "undefined" || !triggerNode?.getBoundingClientRect) {
    return null;
  }

  const triggerRect = triggerNode.getBoundingClientRect();
  const viewportWidth = window.innerWidth || 0;
  const viewportHeight = window.innerHeight || 0;
  const margin = 12;
  const rootWidth = 190;
  const flyoutWidth = 318;
  const gap = 6;
  const availableRight = viewportWidth - triggerRect.right - margin;
  const flyoutSide = availableRight >= flyoutWidth + gap ? "right" : "left";
  const preferredLeft = triggerRect.right - rootWidth;
  const maxLeft = Math.max(margin, viewportWidth - rootWidth - margin);
  const left = Math.max(margin, Math.min(preferredLeft, maxLeft));
  const maxTop = Math.max(margin, viewportHeight - 80);
  const top = Math.max(margin, Math.min(triggerRect.bottom + 8, maxTop));

  return {
    top,
    left,
    flyoutSide,
  };
}

function MapStyleDropdown({
  open = false,
  visualStyle,
  gridStyle = DEFAULT_CONFIG.gridStyle,
  gridOpacity = 0.72,
  gridColor = DEFAULT_CONFIG.gridColor,
  gridWeight = DEFAULT_CONFIG.gridWeight,
  crosshatchStyle = "classic",
  crosshatchOpacity = 0.72,
  wallDrawingStyle = "drawn",
  hatchShadowColor = "default",
  onToggle,
  onVisualStyleChange,
  onGridStyleChange,
  onGridColorChange,
  onGridWeightChange,
  onGridOpacityChange,
  onCrosshatchStyleChange,
  onCrosshatchOpacityChange,
  onWallDrawingStyleChange,
  onHatchShadowColorChange,
}) {
  const normalizedGridStyle = normalizeGridStyle(gridStyle);
  const normalizedGridColor = normalizeGridColor(gridColor);
  const normalizedGridWeight = normalizeGridWeight(gridWeight);
  const normalizedVisualStyle = normalizeVisualStyle(visualStyle);
  const normalizedCrosshatchStyle = crosshatchStyle === "none" ? "none" : "classic";
  const normalizedWallDrawingStyle = normalizeWallDrawingStyle(wallDrawingStyle);
  const normalizedHatchShadowColor = normalizeHatchShadowColor(hatchShadowColor);
  const triggerRef = useRef(null);
  const [portalPlacement, setPortalPlacement] = useState(null);

  useEffect(() => {
    if (!open) {
      setPortalPlacement(null);
      return undefined;
    }

    let frame = 0;
    const updatePlacement = () => {
      frame = 0;
      setPortalPlacement(getStyleMenuPortalPlacement(triggerRef.current));
    };

    updatePlacement();
    const schedulePlacement = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updatePlacement);
    };

    window.addEventListener("resize", schedulePlacement);
    window.addEventListener("scroll", schedulePlacement, true);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedulePlacement);
      window.removeEventListener("scroll", schedulePlacement, true);
    };
  }, [open]);

  const stylePanel = open ? (
    <span
      className="location-map-toolbar__style-panel cruor-ui-panel-surface"
      data-style-menu="root"
      data-style-floating="portal"
      data-flyout-side={portalPlacement?.flyoutSide || "right"}
      role="menu"
      aria-label="Map style controls"
      style={
        portalPlacement
          ? {
              position: "fixed",
              top: `${portalPlacement.top}px`,
              right: "auto",
              left: `${portalPlacement.left}px`,
            }
          : { position: "fixed", visibility: "hidden" }
      }
      onMouseDown={(event) => event.stopPropagation()}
    >
      <MapStyleMenuSection
        icon="border-all"
        label="Grid"
        valueLabel={MAP_GRID_STYLE_LABELS[normalizedGridStyle] || normalizedGridStyle}
      >
        <span className="location-map-toolbar__style-subtitle">Grid Style</span>
        <span className="location-map-toolbar__style-options">
          {GRID_STYLE_OPTIONS.map((style) => (
            <MapStyleOptionButton
              key={style}
              icon={MAP_GRID_STYLE_ICONS[style] || "border-all"}
              label={MAP_GRID_STYLE_LABELS[style] || style}
              active={normalizedGridStyle === style}
              onClick={() => onGridStyleChange?.(style)}
            />
          ))}
        </span>
        <span className="location-map-toolbar__style-subtitle">Grid Color</span>
        <span className="location-map-toolbar__style-options location-map-toolbar__style-options--compact">
          {GRID_COLOR_OPTIONS.map((color) => (
            <MapStyleOptionButton
              key={color}
              icon={MAP_GRID_COLOR_ICONS[color] || "circle"}
              label={MAP_GRID_COLOR_LABELS[color] || color}
              active={normalizedGridColor === color}
              onClick={() => onGridColorChange?.(color)}
            />
          ))}
        </span>
        <span className="location-map-toolbar__style-subtitle">Grid Weight</span>
        <span className="location-map-toolbar__style-options location-map-toolbar__style-options--compact">
          {GRID_WEIGHT_OPTIONS.map((weight) => (
            <MapStyleOptionButton
              key={weight}
              icon={MAP_GRID_WEIGHT_ICONS[weight] || "grip-lines"}
              label={MAP_GRID_WEIGHT_LABELS[weight] || weight}
              active={normalizedGridWeight === weight}
              onClick={() => onGridWeightChange?.(weight)}
            />
          ))}
        </span>
        <MapStyleSlider
          id="inline-map-grid-opacity"
          label="Grid Opacity"
          value={gridOpacity}
          onChange={onGridOpacityChange}
        />
      </MapStyleMenuSection>

      <MapStyleMenuSection
        icon="map"
        label="Map"
        valueLabel={
          MAP_VISUAL_STYLES.find((style) => style.value === normalizedVisualStyle)?.label ||
          normalizedVisualStyle
        }
      >
        <span className="location-map-toolbar__style-options">
          {MAP_VISUAL_STYLES.map((style) => (
            <MapStyleOptionButton
              key={style.value}
              icon={MAP_VISUAL_STYLE_ICONS[style.value] || "map"}
              label={style.label}
              active={normalizedVisualStyle === style.value}
              onClick={() => onVisualStyleChange?.(style.value)}
            />
          ))}
        </span>
      </MapStyleMenuSection>

      <MapStyleMenuSection
        icon="pen-nib"
        label="Walls"
        valueLabel={getOptionLabel(WALL_DRAWING_STYLE_OPTIONS, normalizedWallDrawingStyle)}
      >
        <span className="location-map-toolbar__style-options">
          {WALL_DRAWING_STYLE_OPTIONS.map((style) => (
            <MapStyleOptionButton
              key={style.value}
              icon={style.icon}
              label={style.label}
              active={normalizedWallDrawingStyle === style.value}
              onClick={() => onWallDrawingStyleChange?.(style.value)}
            />
          ))}
        </span>
      </MapStyleMenuSection>

      <MapStyleMenuSection
        icon="grip-lines"
        label="Hatching"
        valueLabel={getOptionLabel(CROSSHATCH_STYLE_OPTIONS, normalizedCrosshatchStyle)}
      >
        <span className="location-map-toolbar__style-subtitle">Hatching Style</span>
        <span className="location-map-toolbar__style-options location-map-toolbar__style-options--compact">
          {CROSSHATCH_STYLE_OPTIONS.map((style) => (
            <MapStyleOptionButton
              key={style.value}
              icon={style.icon}
              label={style.label}
              active={normalizedCrosshatchStyle === style.value}
              onClick={() => onCrosshatchStyleChange?.(style.value)}
            />
          ))}
        </span>
        <span className="location-map-toolbar__style-subtitle">Shadow Color</span>
        <span className="location-map-toolbar__style-options location-map-toolbar__style-options--compact">
          {HATCH_SHADOW_COLOR_OPTIONS.map((color) => (
            <MapStyleOptionButton
              key={color.value}
              icon={color.icon}
              label={color.label}
              active={normalizedHatchShadowColor === color.value}
              onClick={() => onHatchShadowColorChange?.(color.value)}
            />
          ))}
        </span>
        <MapStyleSlider
          id="inline-map-hatching-opacity"
          label="Hatching Opacity"
          value={crosshatchOpacity}
          onChange={onCrosshatchOpacityChange}
        />
      </MapStyleMenuSection>
    </span>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cx(
          "map-tool-button location-map-toolbar__button location-icon-toggle-button cruor-frame-icon-toggle location-map-toolbar__button--secondary location-map-toolbar__style-menu-trigger",
          open && "is-active"
        )}
        {...getGenericTooltipAttrs("Map Style", "Choose grid and map drawing styles.")}
        aria-label="Map Style"
        aria-expanded={open}
        aria-haspopup="menu"
        onMouseDown={suppressToolbarTextSelection}
        onClick={onToggle}
      >
        <i className="fa-solid fa-sliders" aria-hidden="true" />
      </button>
      {stylePanel && typeof document !== "undefined"
        ? createPortal(stylePanel, document.body)
        : null}
    </>
  );
}


function LevelViewToolbarDropdown({
  open = false,
  levelView = LEVEL_VIEW_ALL,
  availableLevels = [],
  fadeOtherLevels = true,
  onToggle,
  onLevelViewChange,
  onToggleFadeOtherLevels,
}) {
  const normalizedLevelView = normalizeLevelView(levelView, availableLevels);
  const levelLabel =
    normalizedLevelView === LEVEL_VIEW_ALL
      ? "All Levels"
      : `Level ${formatMapLevel(normalizedLevelView)}`;
  const levelOptions = [
    { value: LEVEL_VIEW_ALL, label: "All Levels", icon: "layer-group" },
    ...availableLevels.map((level) => ({
      value: level,
      label: `Level ${formatMapLevel(level)}`,
      icon: level > 0 ? "arrow-up" : level < 0 ? "arrow-down" : "minus",
    })),
  ];
  const triggerRef = useRef(null);
  const [portalPlacement, setPortalPlacement] = useState(null);

  useEffect(() => {
    if (!open) {
      setPortalPlacement(null);
      return undefined;
    }

    let frame = 0;
    const updatePlacement = () => {
      frame = 0;
      setPortalPlacement(getStyleMenuPortalPlacement(triggerRef.current));
    };

    updatePlacement();
    const schedulePlacement = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updatePlacement);
    };

    window.addEventListener("resize", schedulePlacement);
    window.addEventListener("scroll", schedulePlacement, true);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedulePlacement);
      window.removeEventListener("scroll", schedulePlacement, true);
    };
  }, [open]);

  const levelPanel = open ? (
    <span
      className="location-map-toolbar__style-panel location-map-toolbar__level-view-panel cruor-ui-panel-surface"
      data-style-menu="root"
      data-style-floating="portal"
      data-level-view-menu="toolbar"
      data-level-view-value={String(normalizedLevelView)}
      data-level-view-fade-other-levels={fadeOtherLevels ? "true" : "false"}
      role="menu"
      aria-label="Level View controls"
      style={
        portalPlacement
          ? {
              position: "fixed",
              top: `${portalPlacement.top}px`,
              right: "auto",
              left: `${portalPlacement.left}px`,
            }
          : { position: "fixed", visibility: "hidden" }
      }
      onMouseDown={(event) => event.stopPropagation()}
    >
      <span className="location-map-toolbar__style-subtitle">Visible Level</span>
      <span
        className="location-map-toolbar__style-options location-map-toolbar__style-options--compact"
        data-level-view-options="true"
      >
        {levelOptions.map((option) => (
          <MapStyleOptionButton
            key={`toolbar-level-view-${option.value}`}
            icon={option.icon}
            label={option.label}
            active={String(normalizedLevelView) === String(option.value)}
            onClick={() => onLevelViewChange?.(option.value)}
          />
        ))}
      </span>
      <span className="location-map-toolbar__style-subtitle">Other Levels</span>
      <span className="location-map-toolbar__style-options location-map-toolbar__style-options--compact">
        <MapStyleOptionButton
          icon="circle-half-stroke"
          label="Fade Others"
          active={fadeOtherLevels}
          onClick={() => {
            if (!fadeOtherLevels) onToggleFadeOtherLevels?.();
          }}
        />
        <MapStyleOptionButton
          icon="eye-slash"
          label="Solo Active"
          active={!fadeOtherLevels}
          onClick={() => {
            if (fadeOtherLevels) onToggleFadeOtherLevels?.();
          }}
        />
      </span>
    </span>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cx(
          "map-tool-button location-map-toolbar__button location-icon-toggle-button cruor-frame-icon-toggle location-map-toolbar__button--secondary location-map-toolbar__level-view-trigger",
          open && "is-active",
          normalizedLevelView !== LEVEL_VIEW_ALL && "has-active-level-view"
        )}
        data-level-view-control="toolbar"
        data-level-view-value={String(normalizedLevelView)}
        data-level-view-fade-other-levels={fadeOtherLevels ? "true" : "false"}
        {...getGenericTooltipAttrs("Level View", `Currently showing ${levelLabel}.`)}
        aria-label={`Level View: ${levelLabel}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onMouseDown={suppressToolbarTextSelection}
        onClick={onToggle}
      >
        <i className="fa-solid fa-layer-group" aria-hidden="true" />
        <span className="sr-only">{levelLabel}</span>
      </button>
      {levelPanel && typeof document !== "undefined"
        ? createPortal(levelPanel, document.body)
        : null}
    </>
  );
}

function InlineMapEditorToolbar({
  showGrid = true,
  showNames = false,
  showRoomBadges = true,
  showProps = false,
  showAccessDots = false,
  manualHistory = { past: [], future: [] },
  viewportControls = null,
  visualStyle = DEFAULT_CONFIG.visualStyle,
  gridStyle = DEFAULT_CONFIG.gridStyle,
  gridOpacity = 0.72,
  gridColor = DEFAULT_CONFIG.gridColor,
  gridWeight = DEFAULT_CONFIG.gridWeight,
  crosshatchStyle = "classic",
  crosshatchOpacity = 0.72,
  wallDrawingStyle = "drawn",
  hatchShadowColor = "default",
  levelView = LEVEL_VIEW_ALL,
  availableLevels = [],
  fadeOtherLevels = true,
  onRefreshFromComposer,
  onUndo,
  onRedo,
  onToggleGrid,
  onToggleRoomBadges,
  onToggleNames,
  onToggleProps,
  onToggleAccessDots,
  onResetEdits,
  onVisualStyleChange,
  onGridStyleChange,
  onGridColorChange,
  onGridWeightChange,
  onGridOpacityChange,
  onCrosshatchStyleChange,
  onCrosshatchOpacityChange,
  onWallDrawingStyleChange,
  onHatchShadowColorChange,
  onLevelViewChange,
  onToggleFadeOtherLevels,
}) {
  const [toolbarTarget, setToolbarTarget] = useState(null);
  const [mapMenuOpen, setMapMenuOpen] = useState(false);
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const [levelViewMenuOpen, setLevelViewMenuOpen] = useState(false);
  const toolbarToolsRef = useRef(null);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    let frame = 0;
    const resolveTarget = () => {
      frame = 0;
      const nextTarget = document.querySelector('[data-location-map-tools-host="true"]');
      setToolbarTarget((currentTarget) =>
        currentTarget === nextTarget ? currentTarget : nextTarget
      );
    };

    resolveTarget();
    frame = window.requestAnimationFrame(resolveTarget);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  });

  useEffect(() => {
    if ((!mapMenuOpen && !styleMenuOpen && !levelViewMenuOpen) || typeof document === "undefined")
      return undefined;

    const closeIfOutside = (event) => {
      if (isEventInsideNode(event, toolbarToolsRef.current)) return;
      if (event.target?.closest?.(".location-map-toolbar__style-panel[data-style-menu]")) {
        return;
      }
      setMapMenuOpen(false);
      setStyleMenuOpen(false);
      setLevelViewMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setMapMenuOpen(false);
      setStyleMenuOpen(false);
      setLevelViewMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeIfOutside, true);
    document.addEventListener("focusin", closeIfOutside, true);
    document.addEventListener("keydown", closeOnEscape, true);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside, true);
      document.removeEventListener("focusin", closeIfOutside, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [mapMenuOpen, styleMenuOpen, levelViewMenuOpen]);

  if (!toolbarTarget) return null;

  const closeMapMenu = () => setMapMenuOpen(false);

  return createPortal(
    <span
      className="location-map-toolbar__map-tools"
      aria-label="Map editing actions"
      ref={toolbarToolsRef}
    >
      <span className="location-map-toolbar__divider" aria-hidden="true" />
      <span className="location-map-toolbar__map-tools-primary">
        <MapToolButton
          icon="rotate-left"
          label="Undo"
          disabled={!manualHistory.past?.length}
          onClick={onUndo}
        />
        <MapToolButton
          icon="rotate-right"
          label="Redo"
          disabled={!manualHistory.future?.length}
          onClick={onRedo}
        />
        <span className="location-map-toolbar__divider" aria-hidden="true" />
        <MapToolButton
          icon="magnifying-glass-minus"
          label="Zoom Out"
          kbd="-"
          disabled={!viewportControls?.zoomOut}
          onClick={() => viewportControls?.zoomOut?.()}
        />
        <MapToolButton
          icon="magnifying-glass-plus"
          label="Zoom In"
          kbd="+"
          disabled={!viewportControls?.zoomIn}
          onClick={() => viewportControls?.zoomIn?.()}
        />
        <MapToolButton
          icon="expand"
          label="Reset Zoom"
          kbd="0"
          disabled={!viewportControls?.resetZoom}
          onClick={() => viewportControls?.resetZoom?.()}
        />
        <span className="location-map-toolbar__zoom-scale" aria-label="Current zoom">
          {Math.round((viewportControls?.scale || 1) * 100)}%
        </span>
        <span className="location-map-toolbar__divider" aria-hidden="true" />
        <MapToolButton
          icon="border-all"
          label="Toggle Grid"
          active={showGrid}
          onClick={onToggleGrid}
        />
        <MapToolButton
          icon="square-pen"
          label="Toggle Room Badges"
          active={showRoomBadges}
          onClick={onToggleRoomBadges}
        />
        <MapToolButton
          icon="signature"
          label="Toggle Room Names"
          active={showNames}
          onClick={onToggleNames}
        />
        <MapToolButton
          icon="location-dot"
          label="Toggle Access/Doors"
          active={showAccessDots}
          onClick={onToggleAccessDots}
        />
        <span className="location-map-toolbar__divider" aria-hidden="true" />
        <MapStyleDropdown
          open={styleMenuOpen}
          visualStyle={visualStyle}
          gridStyle={gridStyle}
          gridOpacity={gridOpacity}
          gridColor={gridColor}
          gridWeight={gridWeight}
          crosshatchStyle={crosshatchStyle}
          crosshatchOpacity={crosshatchOpacity}
          wallDrawingStyle={wallDrawingStyle}
          hatchShadowColor={hatchShadowColor}
          onToggle={() => {
            setStyleMenuOpen((open) => !open);
            setMapMenuOpen(false);
            setLevelViewMenuOpen(false);
          }}
          onVisualStyleChange={onVisualStyleChange}
          onGridStyleChange={onGridStyleChange}
          onGridColorChange={onGridColorChange}
          onGridWeightChange={onGridWeightChange}
          onGridOpacityChange={onGridOpacityChange}
          onCrosshatchStyleChange={onCrosshatchStyleChange}
          onCrosshatchOpacityChange={onCrosshatchOpacityChange}
          onWallDrawingStyleChange={onWallDrawingStyleChange}
          onHatchShadowColorChange={onHatchShadowColorChange}
        />
        <LevelViewToolbarDropdown
          open={levelViewMenuOpen}
          levelView={levelView}
          availableLevels={availableLevels}
          fadeOtherLevels={fadeOtherLevels}
          onToggle={() => {
            setLevelViewMenuOpen((open) => !open);
            setStyleMenuOpen(false);
            setMapMenuOpen(false);
          }}
          onLevelViewChange={onLevelViewChange}
          onToggleFadeOtherLevels={onToggleFadeOtherLevels}
        />
      </span>
      <button
        type="button"
        className={cx(
          "map-tool-button location-map-toolbar__button location-icon-toggle-button cruor-frame-icon-toggle location-map-toolbar__button--secondary location-map-toolbar__map-menu-trigger",
          mapMenuOpen && "is-active"
        )}
        {...getGenericTooltipAttrs("More map tools", "Show secondary map editing tools.")}
        aria-label="More map tools"
        aria-expanded={mapMenuOpen}
        aria-haspopup="menu"
        onMouseDown={suppressToolbarTextSelection}
        onClick={() => {
          setMapMenuOpen((open) => !open);
          setStyleMenuOpen(false);
          setLevelViewMenuOpen(false);
        }}
      >
        <i className="fa-solid fa-ellipsis" aria-hidden="true" />
      </button>
      {mapMenuOpen ? (
        <span
          className="location-map-toolbar__map-menu-panel cruor-ui-panel-surface"
          role="menu"
          aria-label="Secondary map tools"
          onMouseDown={suppressToolbarTextSelection}
        >
          <MapToolMenuButton
            icon="arrows-rotate"
            label="Refresh from Composer"
            description="Rebuild the map from the latest Composer regions."
            disabled={!onRefreshFromComposer}
            onClick={() => {
              onRefreshFromComposer?.();
              closeMapMenu();
            }}
          />
          <MapToolMenuButton
            icon="boxes-stacked"
            label="Props"
            active={showProps}
            onClick={() => {
              onToggleProps?.();
              closeMapMenu();
            }}
          />
          <MapToolMenuButton
            icon="eraser"
            label="Reset Edits"
            description="Clear manual map edits."
            danger
            onClick={() => {
              onResetEdits?.();
              closeMapMenu();
            }}
          />
        </span>
      ) : null}
    </span>,
    toolbarTarget
  );
}

function MapControlSelect({ id, label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const fieldRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : {
          value: option.value,
          label: option.label ?? option.value,
          description: option.description ?? "",
        }
  );
  const selectedOption =
    normalizedOptions.find((option) => String(option.value) === String(value)) ||
    normalizedOptions[0];
  const selectedLabel = selectedOption?.label || "—";

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (fieldRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return undefined;
    }

    let frameId = 0;

    function updateMenuPosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const gap = 8;
      const width = Math.min(
        300,
        Math.max(rect.width, 220),
        Math.max(220, viewportWidth - gap * 2)
      );
      const maxHeight = Math.min(320, Math.max(180, viewportHeight - gap * 2));
      const left = clamp(rect.left, gap, Math.max(gap, viewportWidth - width - gap));
      const belowTop = rect.bottom + 6;
      const top =
        belowTop + maxHeight <= viewportHeight - gap
          ? belowTop
          : Math.max(gap, rect.top - maxHeight - 6);

      setMenuStyle({
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
        width: `${Math.round(width)}px`,
        maxHeight: `${Math.round(maxHeight)}px`,
      });
    }

    function scheduleUpdate() {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateMenuPosition);
    }

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [open, value, options]);

  const menuPortalTarget =
    typeof document !== "undefined"
      ? document.querySelector(".location-map-stage") || document.body
      : null;

  return (
    <div className="control-group map-control-select-field" ref={fieldRef}>
      <label className="control-label" id={`${id}-label`}>
        {label}
      </label>
      <button
        id={id}
        className="control-select cruor-select map-control-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}`}
        ref={triggerRef}
        onClick={() => setOpen((current) => !current)}
      >
        <strong>{selectedLabel}</strong>
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </button>
      {open && menuPortalTarget
        ? createPortal(
            <div
              className="map-control-select-menu"
              role="listbox"
              aria-labelledby={`${id}-label`}
              ref={menuRef}
              style={menuStyle || undefined}
            >
              {normalizedOptions.map((option) => {
                const active = String(option.value) === String(value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={
                      active ? "map-control-select-option is-active" : "map-control-select-option"
                    }
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span>
                      <strong>{option.label}</strong>
                      {option.description ? <small>{option.description}</small> : null}
                    </span>
                    <i
                      className={active ? "fa-solid fa-check" : "fa-solid fa-chevron-right"}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>,
            menuPortalTarget
          )
        : null}
    </div>
  );
}

function MapControlSlider({ id, label, value, min = 0, max = 1, step = 0.05, onChange }) {
  const normalizedValue = Number.isFinite(Number(value)) ? Number(value) : min;
  return (
    <div className="control-group map-control-slider-field">
      <label className="control-label" htmlFor={id}>
        {label}
        <span>{Math.round(normalizedValue * 100)}%</span>
      </label>
      <input
        id={id}
        className="control-range cruor-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={normalizedValue}
        onChange={(event) => onChange?.(Number(event.target.value))}
      />
    </div>
  );
}

function MapInspectorSection({
  icon,
  title,
  eyebrow = "",
  children,
  defaultOpen = true,
  className = "",
}) {
  return (
    <details
      className={`map-inspector-section cruor-ui-card-surface ${className}`.trim()}
      defaultOpen={defaultOpen}
    >
      <summary className="map-inspector-section__summary">
        <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
        <span>
          {eyebrow ? <small>{eyebrow}</small> : null}
          <strong>{title}</strong>
        </span>
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </summary>
      <div className="map-inspector-section__body">{children}</div>
    </details>
  );
}

function getSelectedAreaMetrics(region, generatedMap) {
  if (!region) return null;
  const gridSize = Math.max(1, generatedMap.config.gridSize || 20);
  const floorSquares = Array.isArray(region.floorCells)
    ? region.floorCells.length
    : Math.max(1, (region.cellRect?.w || 0) * (region.cellRect?.h || 0));
  const rect = region.cellRect || { w: 0, h: 0 };
  return {
    label: region.name || `Region ${region.number || "—"}`,
    number: region.number || "—",
    squares: floorSquares,
    width: rect.w || Math.round((region.bounds?.width || 0) / gridSize),
    height: rect.h || Math.round((region.bounds?.height || 0) / gridSize),
    shape: region.shape || region.surfaceKind || "standard",
    role: region.role || region.type || "region",
    level: Number.isFinite(region.level) ? formatMapLevel(region.level) : "0",
  };
}

function TestReport({ testSuite }) {
  return (
    <div
      className={
        testSuite.passed
          ? "test-report cruor-ui-card-surface is-passing"
          : "test-report cruor-ui-card-surface is-failing"
      }
      data-ui-mode-debug-only=""
      data-map-debug-only=""
    >
      <div className="test-report__summary cruor-ui-chip-surface">
        {testSuite.tests.filter((test) => test.passed).length}/{testSuite.tests.length} checks
        passing
      </div>
      <div className="test-report__list cruor-scroll-surface">
        {testSuite.tests.map((test) => (
          <div
            key={test.id}
            className={
              test.passed
                ? "test-report__check cruor-ui-card-surface is-passing"
                : "test-report__check cruor-ui-card-surface is-failing"
            }
          >
            <span>{test.label}</span>
            <strong>{test.passed ? "pass" : "fail"}</strong>
            {test.details && <small>{test.details}</small>}
          </div>
        ))}
      </div>
      {testSuite.structural.warnings.length > 0 && (
        <div className="test-report__warning">{testSuite.structural.warnings[0]}</div>
      )}
      {testSuite.structural.errors.length > 0 && (
        <div className="test-report__error">{testSuite.structural.errors[0]}</div>
      )}
    </div>
  );
}

function MapTestsModal({ open, testSuite, onClose }) {
  if (!open) return null;
  return (
    <div
      className="map-tests-modal"
      data-ui-mode-debug-only=""
      data-map-debug-only=""
      role="presentation"
      onPointerDown={onClose}
    >
      <section
        className="map-tests-modal__dialog cruor-ui-panel-surface cruor-panel--modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-tests-modal-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <header className="map-tests-modal__header">
          <div>
            <p className="map-panel-eyebrow">Diagnostics</p>
            <h2 id="map-tests-modal-title">Structural Test Suite</h2>
          </div>
          <button
            type="button"
            className="map-tool-button location-map-toolbar__button location-icon-toggle-button cruor-frame-icon-toggle location-map-toolbar__button--secondary"
            {...getGenericTooltipAttrs("Close Tests", "Close the structural test suite.", "Esc")}
            aria-label="Close Tests"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>
        <TestReport testSuite={testSuite} />
      </section>
    </div>
  );
}


function readDebugUiModeFromDocument() {
  if (typeof document === "undefined") return false;
  return document.querySelector(".app-shell")?.dataset?.uiMode === "debug";
}

function useDocumentDebugUiMode() {
  const [isDebugUiMode, setIsDebugUiMode] = useState(readDebugUiModeFromDocument);

  useEffect(() => {
    if (typeof document === "undefined" || typeof MutationObserver === "undefined") return undefined;

    const readNextValue = () => setIsDebugUiMode(readDebugUiModeFromDocument());
    readNextValue();

    const appShell = document.querySelector(".app-shell");
    if (!appShell) return undefined;

    const observer = new MutationObserver(readNextValue);
    observer.observe(appShell, { attributes: true, attributeFilter: ["data-ui-mode"] });

    return () => observer.disconnect();
  }, []);

  return isDebugUiMode;
}

export default function CruorMapGeneratorMvp({
  initialRequest = null,
  initialManualOverrides = null,
  onExitWorkspace = null,
  onCommitWorkspace = null,
  onRefreshFromComposer = null,
  embeddedInComposer = false,
  inlineComposerEditor = false,
  composerSelectedRegionId = "",
  previewRegionMarkers = {},
  onComposerRegionHoverChange = null,
  onComposerSelectedRegionChange = null,
  onViewportMetricsChange = null,
  debugMode = false,
  workspaceContext = embeddedInComposer ? "composer-workspace" : "standalone-workspace",
} = {}) {
  const documentDebugUiMode = useDocumentDebugUiMode();
  const effectiveDebugMode = Boolean(debugMode || documentDebugUiMode);
  const initialConfig = useMemo(
    () => createConfigFromNormalizedMapRequest(initialRequest, DEFAULT_CONFIG),
    [initialRequest]
  );
  const stateFileInputRef = useRef(null);
  const manualEditSnapshotRef = useRef(null);
  const manualLayoutGeometryRef = useRef(null);
  const pendingInlineManualCommitRef = useRef(null);
  const [stateStatus, setStateStatus] = useState("");
  const [seed, setSeed] = useState(initialConfig.seed);
  const [manualLayoutSeed, setManualLayoutSeed] = useState("");
  const [roomCount, setRoomCount] = useState(initialConfig.roomCount);
  const [context, setContext] = useState(initialConfig.context);
  const [mapWidth, setMapWidth] = useState(initialConfig.mapWidth);
  const [mapHeight, setMapHeight] = useState(initialConfig.mapHeight);
  const [visualStyle, setVisualStyle] = useState(normalizeVisualStyle(initialConfig.visualStyle));
  const [gridStyle, setGridStyle] = useState(
    normalizeGridStyle(initialConfig.gridStyle || DEFAULT_CONFIG.gridStyle)
  );
  const [gridColor, setGridColor] = useState(
    normalizeGridColor(initialConfig.gridColor || DEFAULT_CONFIG.gridColor)
  );
  const [gridWeight, setGridWeight] = useState(
    normalizeGridWeight(initialConfig.gridWeight || DEFAULT_CONFIG.gridWeight)
  );
  const [gridOpacity, setGridOpacity] = useState(0.72);
  const [crosshatchStyle, setCrosshatchStyle] = useState("classic");
  const [crosshatchOpacity, setCrosshatchOpacity] = useState(0.72);
  const [wallDrawingStyle, setWallDrawingStyle] = useState("drawn");
  const [hatchShadowColor, setHatchShadowColor] = useState("default");
  const [selectedRegionId, setSelectedRegionId] = useState(composerSelectedRegionId || "");
  const [levelView, setLevelView] = useState(LEVEL_VIEW_ALL);
  const [fadeOtherLevels, setFadeOtherLevels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showEditor, setShowEditor] = useState(true);
  const [showNames, setShowNames] = useState(false);
  const [showRoomBadges, setShowRoomBadges] = useState(true);
  const [showProps, setShowProps] = useState(false);
  const [showAccessDots, setShowAccessDots] = useState(false);
  const [inlineViewportControls, setInlineViewportControls] = useState(null);
  const [manualOverrides, setManualOverrides] = useState(() =>
    normalizeManualOverrides(initialManualOverrides || createEmptyManualOverrides())
  );
  const manualOverridesRef = useRef(manualOverrides);
  manualOverridesRef.current = manualOverrides;
  const [manualHistory, setManualHistory] = useState({ past: [], future: [] });
  const [isManualEditActive, setIsManualEditActive] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [testsModalOpen, setTestsModalOpen] = useState(false);
  const lastTestSuiteRef = useRef(null);
  const debugPreviousMapRef = useRef(null);
  const debugPreviousManualOverridesRef = useRef(null);
  const debugSequenceRef = useRef(0);
  const debugPendingAnchorTraceRef = useRef(null);
  const debugEntriesRef = useRef([]);
  const debugRecordingRef = useRef(false);
  const debugCategoriesRef = useRef(DEFAULT_MAP_DEBUG_CATEGORIES);
  const debugModeRef = useRef(Boolean(effectiveDebugMode));
  const generatedMapRef = useRef(null);
  const qaRunnerAbortRef = useRef(null);
  const qaRunnerSequenceRef = useRef(0);
  const qaDiagnosticMapSignatureRef = useRef("");
  const [debugRecording, setDebugRecording] = useState(false);
  const [debugCategories, setDebugCategories] = useState(DEFAULT_MAP_DEBUG_CATEGORIES);
  const [debugEntries, setDebugEntries] = useState([]);
  const [showDebugCoordinates, setShowDebugCoordinates] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("cruorMapDebugCoordinates") !== "false";
  });
  const [forceDebugCoordinatesForExport, setForceDebugCoordinatesForExport] = useState(false);
  const [qaRunnerSettings, setQaRunnerSettings] = useState({
    speed: "normal",
    stopOnError: true,
  });
  const [qaRunnerOverlay, setQaRunnerOverlay] = useState(null);
  const importedRegions = Array.isArray(initialRequest?.requiredRegions)
    ? initialRequest.requiredRegions
    : [];
  const manualRoomPositionsActive = Boolean(
    manualOverrides.roomPositions && Object.keys(manualOverrides.roomPositions).length > 0
  );

  const config = useMemo(
    () => ({
      ...initialConfig,
      seed: manualRoomPositionsActive && manualLayoutSeed ? manualLayoutSeed : seed,
      context,
      roomCount,
      mapWidth,
      mapHeight,
      visualStyle,
      connections: Array.isArray(initialRequest?.connections)
        ? initialRequest.connections
        : initialConfig.connections || [],
    }),
    [
      initialConfig,
      initialRequest,
      seed,
      manualLayoutSeed,
      manualRoomPositionsActive,
      context,
      roomCount,
      mapWidth,
      mapHeight,
      visualStyle,
    ]
  );
  const lockedManualLayoutActive = manualRoomPositionsActive && Boolean(manualLayoutSeed);
  const unlockedGenerationManualOverrides = useMemo(
    () => normalizeManualOverrides(manualOverrides),
    [manualOverrides]
  );
  const lockedGenerationManualSignature = useMemo(() => {
    if (!lockedManualLayoutActive) return "";
    return stableSerializeForMemo(createLockedGenerationManualSnapshot(manualOverrides));
  }, [lockedManualLayoutActive, manualOverrides]);
  const lockedGenerationManualSnapshot = useMemo(() => {
    if (!lockedManualLayoutActive) return null;
    return createLockedGenerationManualSnapshot(manualOverrides);
  }, [lockedManualLayoutActive, lockedGenerationManualSignature]);
  const lockedGenerationManualOverrides = useMemo(
    () => createLockedRawGenerationManualOverrides(lockedGenerationManualSnapshot || {}),
    [lockedGenerationManualSnapshot]
  );
  const generationManualOverrides = lockedManualLayoutActive
    ? lockedGenerationManualOverrides
    : unlockedGenerationManualOverrides;
  const lockedGenerationConfig = useMemo(() => {
    if (!lockedGenerationManualSnapshot) return config;
    const normalized = lockedGenerationManualSnapshot;
    return {
      ...config,
      manualRoomPositions: {},
      manualDoorAnchors: normalized.doorAnchors,
      manualDoorTypes: normalized.doorTypes,
      manualStairTransitions: normalized.levels?.stairs || {},
      manualLevels: normalized.levels,
      manualMapAccesses: normalized.mapAccesses,
      manualCorridorJunctions: normalized.corridorJunctions,
      manualCorridorWaypoints: normalized.corridorWaypoints,
      manualCorridorTypes: normalized.corridorTypes,
      manualCustomConnections: normalized.customConnections,
      manualRoomStyles: normalized.roomStyles,
      manualDeletedConnections: normalized.deletedConnections,
    };
  }, [config, lockedGenerationManualSnapshot]);
  const generationConfig = lockedManualLayoutActive ? lockedGenerationConfig : config;
  const rawGeneratedMap = useMemo(
    () => generateMap(generationConfig, generationManualOverrides),
    [generationConfig, generationManualOverrides]
  );
  const generatedMap = useMemo(() => {
    if (!lockedManualLayoutActive || !manualLayoutGeometryRef.current) {
      return rawGeneratedMap;
    }
    return buildManualGeometryLockedMap(
      manualLayoutGeometryRef.current,
      rawGeneratedMap,
      manualOverrides
    );
  }, [lockedManualLayoutActive, rawGeneratedMap, manualOverrides]);
  generatedMapRef.current = generatedMap;
  useEffect(() => {
    if (!lockedManualLayoutActive && !isManualEditActive) {
      manualLayoutGeometryRef.current = cloneMapGeometry(rawGeneratedMap);
    }
  }, [lockedManualLayoutActive, isManualEditActive, rawGeneratedMap]);
  const pureCaveMap = isPureCaveMap(generatedMap);
  const selectedRegion = useMemo(() => {
    return generatedMap.regions.find((region) => region.id === selectedRegionId) || null;
  }, [generatedMap.regions, selectedRegionId]);
  const availableLevels = useMemo(() => getAvailableMapLevels(generatedMap), [generatedMap]);
  const availableLevelsKey = availableLevels.join(":");

  debugRecordingRef.current = debugRecording;
  debugCategoriesRef.current = debugCategories;
  debugModeRef.current = Boolean(effectiveDebugMode);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "cruorMapDebugCoordinates",
      showDebugCoordinates ? "true" : "false"
    );
  }, [showDebugCoordinates]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    function handleDebugCoordinatesChange(event) {
      if (!event?.detail || !("enabled" in event.detail)) return;
      setShowDebugCoordinates(Boolean(event.detail.enabled));
    }
    window.addEventListener("cruor:map-debug-coordinates-change", handleDebugCoordinatesChange);
    return () => {
      window.removeEventListener("cruor:map-debug-coordinates-change", handleDebugCoordinatesChange);
    };
  }, []);

  const recordDebugEvent = useCallback((label, payload = {}, options = {}) => {
    const category = options.category || getMapDebugCategory(label);
    const globalRecorder = getGlobalMapDebugRecorder();
    if (
      globalRecorder?.enabled &&
      globalRecorder?.recording &&
      globalRecorder?.categories?.[category] &&
      typeof globalRecorder.record === "function"
    ) {
      globalRecorder.record(label, payload, {
        ...options,
        category,
        source: options.source || "map-generator",
      });
    }

    if (!debugModeRef.current || !debugRecordingRef.current) return;
    if (!debugCategoriesRef.current?.[category]) return;
    const nextIndex = (debugSequenceRef.current || 0) + 1;
    debugSequenceRef.current = nextIndex;
    const entry = {
      id: `map-debug-${Date.now()}-${nextIndex}`,
      index: nextIndex,
      timestamp: new Date().toISOString(),
      source: options.source || "map-generator",
      category,
      label,
      payload: cloneMapDebugPayload(payload),
    };
    const nextEntries = [...debugEntriesRef.current, entry].slice(-1500);
    debugEntriesRef.current = nextEntries;
    setDebugEntries(nextEntries);
  }, []);

  function clearDebugEntries() {
    debugEntriesRef.current = [];
    setDebugEntries([]);
    debugPreviousMapRef.current = null;
    debugPreviousManualOverridesRef.current = null;
    debugPendingAnchorTraceRef.current = null;
    debugSequenceRef.current = 0;
  }

  function toggleDebugCategory(categoryId) {
    setDebugCategories((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  }

  function downloadDebugEntries(format = "json") {
    const payload = createMapDebugExportPayload({
      categories: debugCategoriesRef.current,
      entries: debugEntriesRef.current,
      generatedMap,
      manualOverrides: manualOverridesRef.current,
      recording: debugRecordingRef.current,
    });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    if (format === "txt") {
      downloadMapDebugBlob(
        `cruor-map-debug-${stamp}.txt`,
        payload.entries.map(formatMapDebugEntryText).join("\n\n---\n\n"),
        "text/plain"
      );
      return;
    }
    downloadMapDebugBlob(
      `cruor-map-debug-${stamp}.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
  }

  useEffect(() => {
    if (effectiveDebugMode) return;
    setDebugRecording(false);
  }, [effectiveDebugMode]);

  useEffect(() => {
    debugPreviousMapRef.current = null;
    debugPreviousManualOverridesRef.current = null;
    if (debugRecording) {
      recordDebugEvent(
        "debug recorder: recording started",
        {
          generatedMap: summarizeDebugMap(generatedMap),
          manualOverrides: summarizeDebugManualOverrides(manualOverridesRef.current),
        },
        { category: "performance" }
      );
    }
  }, [debugRecording, recordDebugEvent]);

  useEffect(() => {
    if (!debugRecordingRef.current) return;
    const repairs = getQaRepairCorridors(generatedMap);
    const duplicates = getQaCorridorPairDuplicates(generatedMap);
    const visualIssues = getQaCorridorVisualTopologyIssues(generatedMap);
    if (!repairs.length && !duplicates.length && !visualIssues.length) {
      qaDiagnosticMapSignatureRef.current = "";
      return;
    }
    const signature = JSON.stringify({
      repairs: repairs.map((corridor) => corridor.id),
      duplicates,
      visualIssues: visualIssues.map((issue) => issue.corridorId),
      corridorIds: (generatedMap?.corridors || []).map((corridor) => corridor.id),
    });
    if (qaDiagnosticMapSignatureRef.current === signature) return;
    qaDiagnosticMapSignatureRef.current = signature;
    recordDebugEvent(
      "qa diagnostics: generated map repair state",
      {
        repairs: repairs.map(summarizeDebugCorridor),
        duplicates,
        visualIssues,
        topology: summarizeQaCorridorTopology(generatedMap),
      },
      { category: "generated-map", source: "map-generator" }
    );
  }, [generatedMap, recordDebugEvent]);

  function isMapEditorDebugEnabled() {
    return Boolean(effectiveDebugMode && debugRecording);
  }

  function roundDebugNumber(value) {
    return Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) / 100 : value;
  }

  function roundDebugPoint(point) {
    if (!point || typeof point !== "object") return point || null;
    return {
      x: roundDebugNumber(point.x),
      y: roundDebugNumber(point.y),
    };
  }

  function getDebugPointCell(
    point,
    gridSize = generatedMap?.config?.gridSize || config?.gridSize || 20
  ) {
    if (!point || typeof point !== "object") return null;
    return {
      x: Math.floor(Number(point.x) / gridSize),
      y: Math.floor(Number(point.y) / gridSize),
    };
  }

  function summarizeDebugCell(cell) {
    if (!cell || typeof cell !== "object") return cell || null;
    return {
      x: Number.isFinite(Number(cell.x)) ? Number(cell.x) : cell.x,
      y: Number.isFinite(Number(cell.y)) ? Number(cell.y) : cell.y,
    };
  }

  function summarizeDebugAnchor(anchor) {
    if (!anchor || typeof anchor !== "object") return null;
    return {
      side: anchor.side || null,
      cell: summarizeDebugCell(anchor.cell),
      outsideCell: summarizeDebugCell(anchor.outsideCell),
      snapCell: summarizeDebugCell(anchor.snapCell),
      portalRoomCell: summarizeDebugCell(anchor.portalRoomCell),
      routingOutsideCell: summarizeDebugCell(anchor.routingOutsideCell),
      raccordoCell: summarizeDebugCell(anchor.raccordoCell),
      raccordoCells: Array.isArray(anchor.raccordoCells)
        ? anchor.raccordoCells.map(summarizeDebugCell).filter(Boolean)
        : [],
      corridorStartCell: summarizeDebugCell(anchor.corridorStartCell),
      finalGeometry: Boolean(anchor.finalGeometry),
      expandedCircleDoor: Boolean(anchor.expandedCircleDoor),
      circleBoundaryAnchor: Boolean(anchor.circleBoundaryAnchor),
      point: roundDebugPoint(anchor.point),
      segment: anchor.segment
        ? {
            x1: roundDebugNumber(anchor.segment.x1),
            y1: roundDebugNumber(anchor.segment.y1),
            x2: roundDebugNumber(anchor.segment.x2),
            y2: roundDebugNumber(anchor.segment.y2),
          }
        : null,
    };
  }

  function debugObjectKeys(value) {
    return value && typeof value === "object" ? Object.keys(value).sort() : [];
  }

  function summarizeDebugCorridor(corridor) {
    if (!corridor || typeof corridor !== "object") return null;
    const topologyCells =
      corridor.cells ||
      corridor.floorCells ||
      corridor.pathCells ||
      corridor.routeCells ||
      corridor.topologyCells ||
      [];
    const waypoints = Array.isArray(corridor.waypoints)
      ? corridor.waypoints
      : Array.isArray(corridor.manualWaypoints)
        ? corridor.manualWaypoints
        : [];
    return {
      id: corridor.id || null,
      from: corridor.from || null,
      to: corridor.to || null,
      kind: corridor.kind || null,
      isRoomLink: Boolean(corridor.isRoomLink),
      secret: Boolean(corridor.secret),
      locked: Boolean(corridor.locked),
      level: Number.isFinite(corridor.level) ? corridor.level : null,
      cellCount: Array.isArray(topologyCells) ? topologyCells.length : 0,
      waypointCount: Array.isArray(waypoints) ? waypoints.length : 0,
      fromDoor: summarizeDebugAnchor(corridor.fromDoor || corridor.fromAnchor),
      toDoor: summarizeDebugAnchor(corridor.toDoor || corridor.toAnchor),
      endpointCells: {
        from: summarizeDebugCell(getCorridorEndpointCell(corridor, "from")),
        to: summarizeDebugCell(getCorridorEndpointCell(corridor, "to")),
      },
      keys: debugObjectKeys(corridor),
    };
  }

  function getDebugCorridorAnchor(corridor, endpoint) {
    if (!corridor || !endpoint) return null;
    if (endpoint === "from") return corridor.fromDoor || corridor.fromAnchor || null;
    if (endpoint === "to") return corridor.toDoor || corridor.toAnchor || null;
    return null;
  }

  function getDebugAnchorCell(anchor) {
    return (
      anchor?.snapCell || anchor?.outsideCell || anchor?.routingOutsideCell || anchor?.cell || null
    );
  }

  function getDebugCellDelta(fromCell, toCell) {
    if (!fromCell || !toCell) return null;
    const fx = Number(fromCell.x);
    const fy = Number(fromCell.y);
    const tx = Number(toCell.x);
    const ty = Number(toCell.y);
    if (![fx, fy, tx, ty].every(Number.isFinite)) return null;
    return { dx: tx - fx, dy: ty - fy };
  }

  function summarizeDebugAnchorTraceResult(trace, map) {
    if (!trace || !map) return null;
    const corridors = Array.isArray(map.corridors) ? map.corridors : [];
    const corridorId = trace.corridorId || trace.edgeId || null;
    const actualCorridor = corridorId
      ? corridors.find((corridor) => corridor.id === corridorId) || null
      : null;
    const endpoint = trace.endpoint || "to";
    const actualAnchor = actualCorridor ? getDebugCorridorAnchor(actualCorridor, endpoint) : null;
    const requestedCell =
      trace.requestedAnchorCell ||
      getDebugAnchorCell(trace.requestedAnchor) ||
      trace.releaseCell ||
      null;
    const actualCell =
      getDebugAnchorCell(actualAnchor) || getCorridorEndpointCell(actualCorridor, endpoint) || null;
    return {
      trace,
      actualCorridor: summarizeDebugCorridor(actualCorridor),
      actualAnchor: summarizeDebugAnchor(actualAnchor),
      comparison: {
        requestedCell: summarizeDebugCell(requestedCell),
        actualCell: summarizeDebugCell(actualCell),
        deltaCells: getDebugCellDelta(requestedCell, actualCell),
      },
    };
  }

  function debugSetPendingAnchorTrace(trace) {
    debugPendingAnchorTraceRef.current = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      ...trace,
    };
    debugEvent("anchor trace: commit requested", { trace: debugPendingAnchorTraceRef.current });
  }

  function summarizeDebugRegion(region) {
    if (!region || typeof region !== "object") return null;
    return {
      id: region.id || null,
      number: region.number || null,
      shape: region.shape || null,
      surfaceKind: region.surfaceKind || null,
      cellRect: region.cellRect
        ? {
            x: region.cellRect.x,
            y: region.cellRect.y,
            w: region.cellRect.w,
            h: region.cellRect.h,
          }
        : null,
      floorCellCount: Array.isArray(region.floorCells) ? region.floorCells.length : 0,
    };
  }

  function summarizeDebugMapAccess(access) {
    if (!access || typeof access !== "object") return null;
    return {
      id: access.id || null,
      regionId: access.regionId || null,
      type: access.type || null,
      label: access.label || null,
      point: roundDebugPoint(access.point || access.displayPoint || access.start),
      anchor: summarizeDebugAnchor(access.anchor || access.displayAnchor || access),
    };
  }

  function summarizeDebugMap(map) {
    const corridors = Array.isArray(map?.corridors) ? map.corridors : [];
    const regions = Array.isArray(map?.regions) ? map.regions : [];
    const mapAccesses = map?.dungeonMask?.mapAccesses || map?.mapAccesses || [];
    return {
      lockedManualLayoutActive,
      isManualEditActive,
      manualLayoutSeed: manualLayoutSeed || "",
      seed: map?.config?.seed || seed,
      corridorCount: corridors.length,
      corridorIds: corridors
        .map((corridor) => corridor.id)
        .filter(Boolean)
        .sort(),
      corridors: corridors.map(summarizeDebugCorridor),
      regionCount: regions.length,
      regions: regions.map(summarizeDebugRegion),
      mapAccessCount: Array.isArray(mapAccesses) ? mapAccesses.length : 0,
      mapAccesses: Array.isArray(mapAccesses) ? mapAccesses.map(summarizeDebugMapAccess) : [],
    };
  }

  function summarizeDebugManualOverrides(overrides) {
    const normalized = normalizeManualOverrides(overrides || createEmptyManualOverrides());
    const doorAnchors = normalized.doorAnchors || {};
    return {
      manualConnectionSequence: normalized.manualConnectionSequence || 0,
      roomPositions: normalized.roomPositions || {},
      roomStyleKeys: debugObjectKeys(normalized.roomStyles),
      doorAnchorKeys: debugObjectKeys(doorAnchors),
      doorAnchors: Object.fromEntries(
        Object.entries(doorAnchors).map(([key, anchor]) => [key, summarizeDebugAnchor(anchor)])
      ),
      corridorWaypointKeys: debugObjectKeys(normalized.corridorWaypoints),
      corridorWaypoints: normalized.corridorWaypoints || {},
      customConnectionIds: Array.isArray(normalized.customConnections)
        ? normalized.customConnections.map((connection) => connection?.id).filter(Boolean)
        : [],
      customConnections: normalized.customConnections || [],
      deletedConnections: normalized.deletedConnections || [],
      mapAccessKeys: debugObjectKeys(normalized.mapAccesses),
      mapAccesses: normalized.mapAccesses || {},
      corridorJunctionKeys: debugObjectKeys(normalized.corridorJunctions),
      corridorTypeKeys: debugObjectKeys(normalized.corridorTypes),
      corridorTypes: normalized.corridorTypes || {},
      doorTypeKeys: debugObjectKeys(normalized.doorTypes),
    };
  }

  function debugDiffIds(previousIds = [], nextIds = []) {
    const previousSet = new Set(previousIds || []);
    const nextSet = new Set(nextIds || []);
    return {
      added: [...nextSet].filter((id) => !previousSet.has(id)).sort(),
      removed: [...previousSet].filter((id) => !nextSet.has(id)).sort(),
    };
  }

  function debugChangedCorridors(previousSummary, nextSummary) {
    const previousById = new Map(
      (previousSummary?.corridors || []).map((corridor) => [corridor.id, corridor])
    );
    return (nextSummary?.corridors || [])
      .filter((corridor) => {
        const previous = previousById.get(corridor.id);
        return previous && JSON.stringify(previous) !== JSON.stringify(corridor);
      })
      .map((corridor) => ({
        id: corridor.id,
        before: previousById.get(corridor.id),
        after: corridor,
      }));
  }

  function debugChangedRegions(previousSummary, nextSummary) {
    const previousById = new Map(
      (previousSummary?.regions || []).map((region) => [region.id, region])
    );
    return (nextSummary?.regions || [])
      .filter((region) => {
        const previous = previousById.get(region.id);
        return previous && JSON.stringify(previous) !== JSON.stringify(region);
      })
      .map((region) => ({
        id: region.id,
        before: previousById.get(region.id),
        after: region,
      }));
  }

  function debugChangedMapAccesses(previousSummary, nextSummary) {
    const getKey = (access, index) => access?.id || access?.regionId || `access-${index}`;
    const previousByKey = new Map(
      (previousSummary?.mapAccesses || []).map((access, index) => [getKey(access, index), access])
    );
    return (nextSummary?.mapAccesses || [])
      .filter((access, index) => {
        const previous = previousByKey.get(getKey(access, index));
        return previous && JSON.stringify(previous) !== JSON.stringify(access);
      })
      .map((access, index) => ({
        id: getKey(access, index),
        before: previousByKey.get(getKey(access, index)),
        after: access,
      }));
  }

  function debugEvent(label, payload = {}) {
    if (!isMapEditorDebugEnabled()) return;
    recordDebugEvent(label, {
      lockedManualLayoutActive,
      manualLayoutSeed: manualLayoutSeed || "",
      isManualEditActive,
      ...payload,
    });
  }

  function debugManualOverridesTransition(label, previous, next, extra = {}) {
    if (!isMapEditorDebugEnabled()) return;
    const before = summarizeDebugManualOverrides(previous);
    const after = summarizeDebugManualOverrides(next);
    debugEvent(label, {
      ...extra,
      changed: JSON.stringify(before) !== JSON.stringify(after),
      before,
      after,
      doorAnchorDiff: debugDiffIds(before.doorAnchorKeys, after.doorAnchorKeys),
      waypointDiff: debugDiffIds(before.corridorWaypointKeys, after.corridorWaypointKeys),
      customConnectionDiff: debugDiffIds(before.customConnectionIds, after.customConnectionIds),
      deletedConnectionDiff: debugDiffIds(before.deletedConnections, after.deletedConnections),
      mapAccessDiff: debugDiffIds(before.mapAccessKeys, after.mapAccessKeys),
    });
  }

  useEffect(() => {
    if (!isMapEditorDebugEnabled()) return;
    const nextSummary = summarizeDebugMap(generatedMap);
    const previousSummary = debugPreviousMapRef.current;
    if (!previousSummary) {
      debugEvent("generatedMap: initial snapshot", { snapshot: nextSummary });
    } else {
      const corridorIdDiff = debugDiffIds(previousSummary.corridorIds, nextSummary.corridorIds);
      const changedCorridors = debugChangedCorridors(previousSummary, nextSummary);
      const changedRegions = debugChangedRegions(previousSummary, nextSummary);
      const changedMapAccesses = debugChangedMapAccesses(previousSummary, nextSummary);
      if (
        corridorIdDiff.added.length > 0 ||
        corridorIdDiff.removed.length > 0 ||
        changedCorridors.length > 0 ||
        changedRegions.length > 0 ||
        changedMapAccesses.length > 0 ||
        previousSummary.lockedManualLayoutActive !== nextSummary.lockedManualLayoutActive ||
        previousSummary.manualLayoutSeed !== nextSummary.manualLayoutSeed
      ) {
        debugEvent("generatedMap: changed", {
          corridorIdDiff,
          changedCorridors,
          changedRegions,
          changedMapAccesses,
          beforeCounts: {
            corridors: previousSummary.corridorCount,
            regions: previousSummary.regionCount,
            mapAccesses: previousSummary.mapAccessCount,
          },
          afterCounts: {
            corridors: nextSummary.corridorCount,
            regions: nextSummary.regionCount,
            mapAccesses: nextSummary.mapAccessCount,
          },
          before: previousSummary,
          after: nextSummary,
        });
        if (debugPendingAnchorTraceRef.current) {
          const traceResult = summarizeDebugAnchorTraceResult(
            debugPendingAnchorTraceRef.current,
            generatedMap
          );
          debugEvent("anchor trace: generated result", traceResult || {});
          debugPendingAnchorTraceRef.current = null;
        }
      }
    }
    debugPreviousMapRef.current = nextSummary;
  }, [generatedMap, lockedManualLayoutActive, manualLayoutSeed, isManualEditActive]);

  useEffect(() => {
    if (!isMapEditorDebugEnabled()) return;
    const nextSummary = summarizeDebugManualOverrides(manualOverrides);
    const previousSummary = debugPreviousManualOverridesRef.current;
    if (!previousSummary) {
      debugEvent("manualOverrides: initial snapshot", { snapshot: nextSummary });
    } else if (JSON.stringify(previousSummary) !== JSON.stringify(nextSummary)) {
      debugEvent("manualOverrides: changed by React state", {
        doorAnchorDiff: debugDiffIds(previousSummary.doorAnchorKeys, nextSummary.doorAnchorKeys),
        waypointDiff: debugDiffIds(
          previousSummary.corridorWaypointKeys,
          nextSummary.corridorWaypointKeys
        ),
        customConnectionDiff: debugDiffIds(
          previousSummary.customConnectionIds,
          nextSummary.customConnectionIds
        ),
        deletedConnectionDiff: debugDiffIds(
          previousSummary.deletedConnections,
          nextSummary.deletedConnections
        ),
        mapAccessDiff: debugDiffIds(previousSummary.mapAccessKeys, nextSummary.mapAccessKeys),
        before: previousSummary,
        after: nextSummary,
      });
    }
    debugPreviousManualOverridesRef.current = nextSummary;
  }, [manualOverrides]);

  useEffect(() => {
    if (!inlineComposerEditor) return;
    const nextSelectedRegionId = composerSelectedRegionId || "";
    if (nextSelectedRegionId !== selectedRegionId) {
      setSelectedRegionId(nextSelectedRegionId);
    }
  }, [composerSelectedRegionId, inlineComposerEditor, selectedRegionId]);

  useEffect(() => {
    if (!inlineComposerEditor || isManualEditActive) return;

    setSeed((current) => (current === initialConfig.seed ? current : initialConfig.seed));
    setRoomCount((current) =>
      current === initialConfig.roomCount ? current : initialConfig.roomCount
    );
    setContext((current) => (current === initialConfig.context ? current : initialConfig.context));
    setMapWidth((current) =>
      current === initialConfig.mapWidth ? current : initialConfig.mapWidth
    );
    setMapHeight((current) =>
      current === initialConfig.mapHeight ? current : initialConfig.mapHeight
    );
    setVisualStyle((current) => {
      const next = normalizeVisualStyle(initialConfig.visualStyle);
      return current === next ? current : next;
    });
    setGridStyle((current) => {
      const next = normalizeGridStyle(initialConfig.gridStyle || DEFAULT_CONFIG.gridStyle);
      return current === next ? current : next;
    });
    setGridColor((current) => {
      const next = normalizeGridColor(initialConfig.gridColor || DEFAULT_CONFIG.gridColor);
      return current === next ? current : next;
    });
    setGridWeight((current) => {
      const next = normalizeGridWeight(initialConfig.gridWeight || DEFAULT_CONFIG.gridWeight);
      return current === next ? current : next;
    });
  }, [
    initialConfig.context,
    initialConfig.gridStyle,
    initialConfig.gridColor,
    initialConfig.gridWeight,
    initialConfig.mapHeight,
    initialConfig.mapWidth,
    initialConfig.roomCount,
    initialConfig.seed,
    initialConfig.visualStyle,
    inlineComposerEditor,
    isManualEditActive,
  ]);

  useEffect(() => {
    if (!inlineComposerEditor || isManualEditActive) return;

    const nextManualOverrides = normalizeManualOverrides(
      initialManualOverrides || createEmptyManualOverrides()
    );
    const currentManualOverrides = normalizeManualOverrides(manualOverrides);
    const pendingInlineManualCommit = pendingInlineManualCommitRef.current;

    if (
      pendingInlineManualCommit &&
      areManualOverridesEqual(currentManualOverrides, pendingInlineManualCommit) &&
      !areManualOverridesEqual(nextManualOverrides, pendingInlineManualCommit)
    ) {
      return;
    }

    pendingInlineManualCommitRef.current = null;

    if (areManualOverridesEqual(currentManualOverrides, nextManualOverrides)) return;
    setManualOverrides(nextManualOverrides);
    clearManualHistory();
  }, [initialManualOverrides, inlineComposerEditor, isManualEditActive, manualOverrides]);

  const [exportValidation, setExportValidation] = useState({
    passed: false,
    missingSvg: true,
    leakedTokens: [],
  });
  const shouldRunMapDiagnostics = !inlineComposerEditor && !isManualEditActive;

  useEffect(() => {
    setLevelView((current) => normalizeLevelView(current, availableLevels));
  }, [availableLevelsKey]);

  useEffect(() => {
    if (!shouldRunMapDiagnostics) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const svg = document.querySelector("#cruor-map-svg");
      setExportValidation(validateExportSvgString(serializeSvg(svg)));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [
    generatedMap,
    showEditor,
    showGrid,
    gridStyle,
    gridColor,
    gridWeight,
    gridOpacity,
    crosshatchStyle,
    crosshatchOpacity,
    wallDrawingStyle,
    hatchShadowColor,
    visualStyle,
    showNames,
    showRoomBadges,
    showProps,
    showAccessDots,
    shouldRunMapDiagnostics,
  ]);

  const computedTestSuite = useMemo(
    () =>
      shouldRunMapDiagnostics
        ? buildFullStructuralTestSuite(generatedMap, config, exportValidation)
        : null,
    [generatedMap, config, exportValidation, shouldRunMapDiagnostics]
  );
  if (computedTestSuite) lastTestSuiteRef.current = computedTestSuite;
  const testSuite = lastTestSuiteRef.current || {
    passed: false,
    tests: [],
    structural: { warnings: [], errors: [] },
    golden: null,
    exportValidation,
  };

  useEffect(() => {
    function handleTestsShortcut(event) {
      if (event.key !== "F2") return;
      const target = event.target;
      if (target?.closest?.("input, select, textarea, [contenteditable='true']")) return;
      event.preventDefault();
      setTestsModalOpen((value) => !value);
    }

    window.addEventListener("keydown", handleTestsShortcut);
    return () => window.removeEventListener("keydown", handleTestsShortcut);
  }, []);

  useEffect(() => {
    if (!testsModalOpen) return undefined;
    function handleModalKeyDown(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setTestsModalOpen(false);
    }

    window.addEventListener("keydown", handleModalKeyDown);
    return () => window.removeEventListener("keydown", handleModalKeyDown);
  }, [testsModalOpen]);

  useEffect(() => {
    return registerTooltipProvider("tooltip-room", (id) => {
      const region = generatedMap.regions.find(
        (item) => item.id === id || item.sourceRegionId === id
      );
      if (!region) return null;
      return createRoomTooltipPayload(
        region,
        generatedMap,
        getImportedRegionForTooltip(region, importedRegions)
      );
    });
  }, [generatedMap, importedRegions]);

  function clearManualHistory() {
    manualEditSnapshotRef.current = null;
    setManualHistory({ past: [], future: [] });
  }

  function pushManualHistorySnapshot(snapshot) {
    if (!snapshot) return;
    setManualHistory((history) => ({
      past: [...history.past.slice(-49), cloneManualOverrides(snapshot)],
      future: [],
    }));
  }

  function markPendingInlineManualCommit(nextManualOverrides) {
    if (!inlineComposerEditor || isManualEditActive) return;
    pendingInlineManualCommitRef.current = cloneManualOverrides(nextManualOverrides);
  }

  function updateManualOverridesWithHistory(
    updater,
    status = "",
    debugLabel = "updateManualOverridesWithHistory"
  ) {
    const previous = cloneManualOverrides(manualOverridesRef.current);
    const next = cloneManualOverrides(typeof updater === "function" ? updater(previous) : updater);
    if (areManualOverridesEqual(previous, next)) {
      debugManualOverridesTransition(`${debugLabel}: no-op`, previous, next, { status });
      return false;
    }
    debugManualOverridesTransition(`${debugLabel}: apply`, previous, next, { status });
    pushManualHistorySnapshot(previous);
    manualOverridesRef.current = next;
    markPendingInlineManualCommit(next);
    setManualOverrides(next);
    setStateStatus(status);
    return true;
  }

  function setManualOverridesFromCurrent(updater, debugLabel = "setManualOverridesFromCurrent") {
    const previous = cloneManualOverrides(manualOverridesRef.current);
    const next = cloneManualOverrides(typeof updater === "function" ? updater(previous) : updater);
    if (areManualOverridesEqual(previous, next)) {
      debugManualOverridesTransition(`${debugLabel}: no-op`, previous, next);
      return false;
    }
    debugManualOverridesTransition(`${debugLabel}: apply`, previous, next);
    manualOverridesRef.current = next;
    markPendingInlineManualCommit(next);
    setManualOverrides(next);
    return true;
  }

  function cloneMapGeometry(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function translateCell(cell, dx, dy) {
    if (!cell || typeof cell !== "object") return cell;
    return {
      ...cell,
      x: Number(cell.x || 0) + dx,
      y: Number(cell.y || 0) + dy,
    };
  }

  function translatePoint(point, dxPx, dyPx) {
    if (!point || typeof point !== "object") return point;
    return {
      ...point,
      x: Number(point.x || 0) + dxPx,
      y: Number(point.y || 0) + dyPx,
    };
  }

  function translateSegment(segment, dxPx, dyPx) {
    if (!segment || typeof segment !== "object") return segment;
    return {
      ...segment,
      ...(Number.isFinite(Number(segment.x1)) ? { x1: Number(segment.x1) + dxPx } : {}),
      ...(Number.isFinite(Number(segment.y1)) ? { y1: Number(segment.y1) + dyPx } : {}),
      ...(Number.isFinite(Number(segment.x2)) ? { x2: Number(segment.x2) + dxPx } : {}),
      ...(Number.isFinite(Number(segment.y2)) ? { y2: Number(segment.y2) + dyPx } : {}),
      ...(segment.start ? { start: translatePoint(segment.start, dxPx, dyPx) } : {}),
      ...(segment.end ? { end: translatePoint(segment.end, dxPx, dyPx) } : {}),
    };
  }

  function translateLineLike(line, dxPx, dyPx) {
    if (!line || typeof line !== "object") return line;
    return {
      ...line,
      ...(Number.isFinite(Number(line.x1)) ? { x1: Number(line.x1) + dxPx } : {}),
      ...(Number.isFinite(Number(line.y1)) ? { y1: Number(line.y1) + dyPx } : {}),
      ...(Number.isFinite(Number(line.x2)) ? { x2: Number(line.x2) + dxPx } : {}),
      ...(Number.isFinite(Number(line.y2)) ? { y2: Number(line.y2) + dyPx } : {}),
    };
  }

  function translateFloorExtension(extension, dxPx, dyPx) {
    if (!extension || typeof extension !== "object") return extension;
    return {
      ...extension,
      ...(extension.inner ? { inner: translatePoint(extension.inner, dxPx, dyPx) } : {}),
      ...(extension.outer ? { outer: translatePoint(extension.outer, dxPx, dyPx) } : {}),
      ...(Array.isArray(extension.points)
        ? { points: extension.points.map((point) => translatePoint(point, dxPx, dyPx)) }
        : {}),
      // Drop cached SVG path after a geometric move. Renderers can rebuild organic access
      // floors from the translated wall gap/anchor instead of reusing a stale path.
      ...(extension.path ? { path: "" } : {}),
    };
  }

  function translateAnchor(anchor, dx, dy, gridSize) {
    if (!anchor || typeof anchor !== "object") return anchor;
    const dxPx = dx * gridSize;
    const dyPx = dy * gridSize;
    return {
      ...anchor,
      ...(anchor.cell ? { cell: translateCell(anchor.cell, dx, dy) } : {}),
      ...(anchor.insideCell ? { insideCell: translateCell(anchor.insideCell, dx, dy) } : {}),
      ...(anchor.outsideCell ? { outsideCell: translateCell(anchor.outsideCell, dx, dy) } : {}),
      ...(anchor.routingOutsideCell ? { routingOutsideCell: translateCell(anchor.routingOutsideCell, dx, dy) } : {}),
      ...(anchor.portalRoomCell ? { portalRoomCell: translateCell(anchor.portalRoomCell, dx, dy) } : {}),
      ...(anchor.raccordoCell ? { raccordoCell: translateCell(anchor.raccordoCell, dx, dy) } : {}),
      ...(anchor.corridorStartCell ? { corridorStartCell: translateCell(anchor.corridorStartCell, dx, dy) } : {}),
      ...(Array.isArray(anchor.raccordoCells)
        ? { raccordoCells: anchor.raccordoCells.map((cell) => translateCell(cell, dx, dy)) }
        : {}),
      ...(anchor.boundaryCell ? { boundaryCell: translateCell(anchor.boundaryCell, dx, dy) } : {}),
      ...(anchor.floorCell ? { floorCell: translateCell(anchor.floorCell, dx, dy) } : {}),
      ...(anchor.point ? { point: translatePoint(anchor.point, dxPx, dyPx) } : {}),
      ...(anchor.displayPoint ? { displayPoint: translatePoint(anchor.displayPoint, dxPx, dyPx) } : {}),
      ...(anchor.center ? { center: translatePoint(anchor.center, dxPx, dyPx) } : {}),
      ...(anchor.segment ? { segment: translateSegment(anchor.segment, dxPx, dyPx) } : {}),
      ...(anchor.displaySegment ? { displaySegment: translateSegment(anchor.displaySegment, dxPx, dyPx) } : {}),
      ...(Number.isFinite(Number(anchor.x)) ? { x: Number(anchor.x) + dxPx } : {}),
      ...(Number.isFinite(Number(anchor.y)) ? { y: Number(anchor.y) + dyPx } : {}),
    };
  }

  function translateRegionGeometry(region, targetPosition, gridSize) {
    if (!region?.cellRect || !targetPosition) return region;
    const nextX = Math.round(Number(targetPosition.x));
    const nextY = Math.round(Number(targetPosition.y));
    const dx = nextX - Math.round(Number(region.cellRect.x));
    const dy = nextY - Math.round(Number(region.cellRect.y));
    if (dx === 0 && dy === 0) return region;
    const dxPx = dx * gridSize;
    const dyPx = dy * gridSize;
    const cellRect = {
      ...region.cellRect,
      x: Number(region.cellRect.x) + dx,
      y: Number(region.cellRect.y) + dy,
    };
    return {
      ...region,
      cellRect,
      floorCells: Array.isArray(region.floorCells)
        ? region.floorCells.map((cell) => translateCell(cell, dx, dy))
        : region.floorCells,
      circleExtensionCells: Array.isArray(region.circleExtensionCells)
        ? region.circleExtensionCells.map((cell) => translateCell(cell, dx, dy))
        : region.circleExtensionCells,
      wallSegments: Array.isArray(region.wallSegments)
        ? region.wallSegments.map((segment) => translateSegment(segment, dxPx, dyPx))
        : region.wallSegments,
      doorAnchors: Array.isArray(region.doorAnchors)
        ? region.doorAnchors.map((anchor) => translateAnchor(anchor, dx, dy, gridSize))
        : region.doorAnchors,
      labelPoint: translatePoint(region.labelPoint, dxPx, dyPx),
    };
  }

  function getRegionDeltaMap(baseRegions, movedRegions, gridSize) {
    const deltas = new Map();
    const movedById = new Map((movedRegions || []).map((region) => [region.id, region]));
    (baseRegions || []).forEach((region) => {
      const moved = movedById.get(region.id);
      if (!region?.cellRect || !moved?.cellRect) return;
      const dx = Number(moved.cellRect.x) - Number(region.cellRect.x);
      const dy = Number(moved.cellRect.y) - Number(region.cellRect.y);
      deltas.set(region.id, { dx, dy, dxPx: dx * gridSize, dyPx: dy * gridSize });
    });
    return deltas;
  }

  function translateMapAccess(access, deltas, gridSize) {
    if (!access || typeof access !== "object") return access;
    const delta = deltas.get(access.regionId) || deltas.get(access.sourceRegionId);
    if (!delta || (delta.dx === 0 && delta.dy === 0)) return access;
    return {
      ...access,
      ...(access.anchor
        ? { anchor: translateAnchor(access.anchor, delta.dx, delta.dy, gridSize) }
        : {}),
      ...(access.displayAnchor
        ? { displayAnchor: translateAnchor(access.displayAnchor, delta.dx, delta.dy, gridSize) }
        : {}),
      ...(access.cell ? { cell: translateCell(access.cell, delta.dx, delta.dy) } : {}),
      ...(access.point ? { point: translatePoint(access.point, delta.dxPx, delta.dyPx) } : {}),
      ...(access.displayPoint
        ? { displayPoint: translatePoint(access.displayPoint, delta.dxPx, delta.dyPx) }
        : {}),
      ...(access.start ? { start: translatePoint(access.start, delta.dxPx, delta.dyPx) } : {}),
      ...(access.end ? { end: translatePoint(access.end, delta.dxPx, delta.dyPx) } : {}),
      ...(access.wallGap
        ? { wallGap: translateLineLike(access.wallGap, delta.dxPx, delta.dyPx) }
        : {}),
      ...(access.displayWallGap
        ? { displayWallGap: translateLineLike(access.displayWallGap, delta.dxPx, delta.dyPx) }
        : {}),
      ...(access.floorExtension
        ? { floorExtension: translateFloorExtension(access.floorExtension, delta.dxPx, delta.dyPx) }
        : {}),
      ...(Number.isFinite(Number(access.x)) ? { x: Number(access.x) + delta.dxPx } : {}),
      ...(Number.isFinite(Number(access.y)) ? { y: Number(access.y) + delta.dyPx } : {}),
    };
  }

  function getAnchorPointForSnap(anchor, gridSize) {
    if (!anchor) return null;
    if (anchor.point) return anchor.point;
    if (anchor.center) return anchor.center;
    if (anchor.cell) {
      return {
        x: (Number(anchor.cell.x) + 0.5) * gridSize,
        y: (Number(anchor.cell.y) + 0.5) * gridSize,
      };
    }
    try {
      return getAnchorHandlePoint(anchor, gridSize);
    } catch (error) {
      void error;
      return null;
    }
  }

  function getAnchorWallSegment(anchor, gridSize) {
    if (!anchor?.cell || !anchor.side) return null;
    const x = Number(anchor.cell.x) * gridSize;
    const y = Number(anchor.cell.y) * gridSize;
    if (anchor.side === "north") {
      return { x1: x, y1: y, x2: x + gridSize, y2: y };
    }
    if (anchor.side === "south") {
      return { x1: x, y1: y + gridSize, x2: x + gridSize, y2: y + gridSize };
    }
    if (anchor.side === "west") {
      return { x1: x, y1: y, x2: x, y2: y + gridSize };
    }
    if (anchor.side === "east") {
      return { x1: x + gridSize, y1: y, x2: x + gridSize, y2: y + gridSize };
    }
    return null;
  }

  function getPointToSegmentDistanceSquared(point, segment) {
    if (!point || !segment) return Number.POSITIVE_INFINITY;
    const vx = segment.x2 - segment.x1;
    const vy = segment.y2 - segment.y1;
    const lengthSquared = vx * vx + vy * vy;
    if (lengthSquared <= 0) {
      const dx = point.x - segment.x1;
      const dy = point.y - segment.y1;
      return dx * dx + dy * dy;
    }
    const rawT = ((point.x - segment.x1) * vx + (point.y - segment.y1) * vy) / lengthSquared;
    const t = Math.max(0, Math.min(1, rawT));
    const closest = {
      x: segment.x1 + vx * t,
      y: segment.y1 + vy * t,
    };
    const dx = point.x - closest.x;
    const dy = point.y - closest.y;
    return dx * dx + dy * dy;
  }

  function scoreManualDoorAnchor(anchor, point, gridSize) {
    const segment = getAnchorWallSegment(anchor, gridSize);
    const segmentScore = getPointToSegmentDistanceSquared(point, segment);
    const handlePoint = getAnchorHandlePoint(anchor, gridSize);
    const handleDx = handlePoint.x - point.x;
    const handleDy = handlePoint.y - point.y;
    const handleScore = handleDx * handleDx + handleDy * handleDy;
    return segmentScore * 12 + handleScore * 0.08;
  }

  function getClosestManualDoorBoundaryAnchorCandidate(region, point, gridSize) {
    if (!region || !point) return null;
    const finalBoundary = getDoorBoundaryCells(region, generatedMap);
    const rawBoundary = getBoundaryCells(region);
    const boundary = finalBoundary.length > 0 ? finalBoundary : rawBoundary;
    if (boundary.length === 0) return null;
    return boundary
      .map((anchor) => ({
        anchor,
        score: scoreManualDoorAnchor(anchor, point, gridSize),
      }))
      .sort((a, b) => a.score - b.score)[0];
  }

  function getClosestRawBoundaryAnchorCandidate(region, point, gridSize) {
    if (!region || !point) return null;
    const boundary = getBoundaryCells(region);
    if (boundary.length === 0) return null;
    return boundary
      .map((anchor) => ({
        anchor,
        score: scoreManualDoorAnchor(anchor, point, gridSize),
      }))
      .sort((a, b) => a.score - b.score)[0];
  }

  function getClosestRawBoundaryAnchorToPoint(region, point, gridSize) {
    return getClosestManualDoorBoundaryAnchorCandidate(region, point, gridSize)?.anchor || null;
  }

  function getDoorDragManualAnchor(region, point, gridSize) {
    if (!region || !point) return null;
    const circleAnchor = createCircleDragAnchor(region, point, gridSize);
    if (circleAnchor) return circleAnchor;
    return getClosestManualDoorBoundaryAnchorCandidate(region, point, gridSize)?.anchor || null;
  }

  function getBoundaryAnchorWithSameSideAndCell(region, anchor) {
    if (!region || !anchor?.side || !anchor.cell) return null;
    return (
      getBoundaryCells(region).find(
        (candidate) =>
          candidate.side === anchor.side &&
          candidate.cell?.x === anchor.cell.x &&
          candidate.cell?.y === anchor.cell.y
      ) || null
    );
  }

  function getRawManualDoorDragAnchor(region, point, gridSize) {
    return getClosestRawBoundaryAnchorToPoint(region, point, gridSize);
  }

  function getGraphEdgeEndpointRegionId(edge, endpoint) {
    if (!edge || !endpoint) return null;
    return endpoint === "from" ? edge.from : edge.to;
  }

  function normalizeManualDoorAnchorsForLockedRegions(
    doorAnchors,
    graph,
    regions,
    deltas,
    gridSize
  ) {
    const normalizedAnchors = {};
    const edgeById = new Map((graph || []).map((edge) => [edge.id, edge]));
    const regionById = new Map((regions || []).map((region) => [region.id, region]));
    Object.entries(doorAnchors || {}).forEach(([key, anchor]) => {
      const separatorIndex = key.lastIndexOf(":");
      if (separatorIndex <= 0) {
        normalizedAnchors[key] = anchor;
        return;
      }
      const corridorId = key.slice(0, separatorIndex);
      const endpoint = key.slice(separatorIndex + 1);
      const edge = edgeById.get(corridorId);
      const regionId = getGraphEdgeEndpointRegionId(edge, endpoint);
      const region = regionById.get(regionId);
      if (!region || !anchor) {
        normalizedAnchors[key] = anchor;
        return;
      }
      const delta = deltas.get(region.id);
      const translatedAnchor = delta
        ? translateAnchor(anchor, delta.dx, delta.dy, gridSize)
        : anchor;
      const exactAnchor = getBoundaryAnchorWithSameSideAndCell(region, translatedAnchor);
      if (exactAnchor) {
        normalizedAnchors[key] = serializeManualAnchor(exactAnchor);
        return;
      }
      const translatedPoint = getAnchorPointForSnap(translatedAnchor, gridSize);
      const translatedCandidate = getClosestRawBoundaryAnchorCandidate(
        region,
        translatedPoint,
        gridSize
      );
      normalizedAnchors[key] = serializeManualAnchor(
        translatedCandidate?.anchor || translatedAnchor
      );
    });
    return normalizedAnchors;
  }

  function getManualOverrideCorridorId(key) {
    const text = String(key || "");
    const separatorIndex = text.lastIndexOf(":");
    return separatorIndex > 0 ? text.slice(0, separatorIndex) : text;
  }

  function getMovedRegionIdsFromDeltas(deltas) {
    const movedRegionIds = new Set();
    deltas.forEach((delta, regionId) => {
      if (Math.abs(delta?.dx || 0) > 0 || Math.abs(delta?.dy || 0) > 0) {
        movedRegionIds.add(regionId);
      }
    });
    return movedRegionIds;
  }

  function hasManualRoutingOverrides(normalized) {
    return (
      Object.keys(normalized.doorAnchors || {}).length > 0 ||
      Object.keys(normalized.corridorWaypoints || {}).length > 0 ||
      Object.keys(normalized.corridorJunctions || {}).length > 0 ||
      (Array.isArray(normalized.customConnections) && normalized.customConnections.length > 0) ||
      (Array.isArray(normalized.deletedConnections) && normalized.deletedConnections.length > 0)
    );
  }

  function getImpactedManualCorridorIds(normalized, graph, movedRegionIds) {
    const ids = new Set();
    (graph || []).forEach((edge) => {
      if (movedRegionIds.has(edge.from) || movedRegionIds.has(edge.to)) ids.add(edge.id);
    });
    Object.keys(normalized.doorAnchors || {}).forEach((key) => {
      const corridorId = getManualOverrideCorridorId(key);
      if (corridorId) ids.add(corridorId);
    });
    Object.keys(normalized.corridorWaypoints || {}).forEach((corridorId) => {
      if (corridorId) ids.add(corridorId);
    });
    return ids;
  }

  function getCorridorAutoHubGroupId(corridor) {
    if (!corridor) return "";
    if (corridor.autoHubId) return corridor.autoHubId;
    if (corridor.autoHubStem && typeof corridor.id === "string") {
      return corridor.id.endsWith("-stem") ? corridor.id.slice(0, -"-stem".length) : corridor.id;
    }
    return "";
  }

  function corridorReferencesMovedRegion(corridor, movedRegionIds) {
    if (!corridor || !movedRegionIds || movedRegionIds.size === 0) return false;
    return (
      movedRegionIds.has(corridor.from) ||
      movedRegionIds.has(corridor.to) ||
      movedRegionIds.has(corridor.autoHubSourceRegionId) ||
      movedRegionIds.has(corridor.fromAnchor?.regionId) ||
      movedRegionIds.has(corridor.toAnchor?.regionId)
    );
  }

  function expandImpactedCorridorIdsForAutoHubs(baseCorridors, impactedIds, movedRegionIds) {
    const expanded = new Set(impactedIds);
    const impactedHubIds = new Set();

    (baseCorridors || []).forEach((corridor) => {
      const hubId = getCorridorAutoHubGroupId(corridor);
      if (!hubId) return;
      if (expanded.has(corridor.id) || corridorReferencesMovedRegion(corridor, movedRegionIds)) {
        impactedHubIds.add(hubId);
      }
    });

    if (impactedHubIds.size === 0) return expanded;

    (baseCorridors || []).forEach((corridor) => {
      const hubId = getCorridorAutoHubGroupId(corridor);
      if (!hubId || !impactedHubIds.has(hubId)) return;
      if (corridor.id) expanded.add(corridor.id);
    });

    return expanded;
  }

  function shouldDropUnresolvedImpactedCorridor(corridor) {
    return Boolean(
      corridor?.autoHub ||
      corridor?.autoHubStem ||
      corridor?.autoHubId ||
      corridor?.recoveredGraphEdge ||
      corridor?.recoveredRoomTraversal
    );
  }

  function mergePartiallyRoutedCorridors(baseCorridors, routedCorridors, impactedIds) {
    const routedById = new Map((routedCorridors || []).map((corridor) => [corridor.id, corridor]));
    const merged = [];
    (baseCorridors || []).forEach((corridor) => {
      if (!impactedIds.has(corridor.id)) {
        merged.push(corridor);
        return;
      }
      const routed = routedById.get(corridor.id);
      if (routed) {
        merged.push(routed);
        return;
      }
      if (!shouldDropUnresolvedImpactedCorridor(corridor)) {
        merged.push(corridor);
      }
    });
    const mergedIds = new Set(merged.map((corridor) => corridor.id));
    (routedCorridors || []).forEach((corridor) => {
      if (!mergedIds.has(corridor.id)) merged.push(corridor);
    });
    return merged;
  }

  function buildManualGeometryLockedMap(baseMap, generatedCandidate, overrides) {
    const normalized = normalizeManualOverrides(overrides);
    const positions = normalized.roomPositions || {};
    if (!baseMap?.regions?.length || Object.keys(positions).length === 0) {
      return generatedCandidate;
    }
    const gridSize = Number(baseMap.config?.gridSize || generatedCandidate.config?.gridSize || 20);
    // Keep the locked room geometry as the source of truth. Corridor endpoint
    // drags must not let a fresh generator candidate reshape rectangular rooms;
    // only corridors should adapt around the existing room footprint.
    const sourceRegions = Array.isArray(baseMap.regions) ? baseMap.regions : [];
    const movedRegions = sourceRegions.map((region) =>
      translateRegionGeometry(region, positions[region.id], gridSize)
    );
    const deltas = getRegionDeltaMap(sourceRegions, movedRegions, gridSize);
    const routingGraph = dedupeRoutingGraphForManualDuplicatePairs(
      generatedCandidate.graph || baseMap.graph || [],
      normalized.customConnections || []
    );
    const movedRegionIds = getMovedRegionIdsFromDeltas(deltas);
    const movedRegionCorridorIds = new Set();
    (routingGraph || []).forEach((edge) => {
      if (!edge?.id) return;
      if (movedRegionIds.has(edge.from) || movedRegionIds.has(edge.to)) {
        movedRegionCorridorIds.add(edge.id);
      }
    });
    const normalizedDoorAnchors = normalizeManualDoorAnchorsForLockedRegions(
      normalized.doorAnchors || {},
      routingGraph,
      movedRegions,
      deltas,
      gridSize
    );
    const normalizedCorridorWaypoints = { ...(normalized.corridorWaypoints || {}) };
    movedRegionCorridorIds.forEach((corridorId) => {
      delete normalizedCorridorWaypoints[corridorId];
    });
    const routingConfig = {
      ...(generatedCandidate.config || baseMap.config || {}),
      manualRoomPositions: positions,
      manualDoorAnchors: normalizedDoorAnchors,
      manualDoorTypes: normalized.doorTypes || {},
      manualStairTransitions: normalized.levels?.stairs || {},
      manualLevels: normalized.levels || {},
      manualMapAccesses: normalized.mapAccesses || {},
      manualCorridorJunctions: normalized.corridorJunctions || {},
      manualCorridorWaypoints: normalizedCorridorWaypoints,
      manualCorridorTypes: normalized.corridorTypes || {},
      manualCustomConnections: normalized.customConnections || [],
      manualDeletedConnections: normalized.deletedConnections || [],
      manualRoomStyles: normalized.roomStyles || {},
    };
    const baseCorridors =
      (Array.isArray(generatedCandidate.corridors) && generatedCandidate.corridors.length > 0
        ? generatedCandidate.corridors
        : baseMap.corridors) || [];
    const initialImpactedCorridorIds = getImpactedManualCorridorIds(
      normalized,
      routingGraph,
      movedRegionIds
    );
    const impactedCorridorIds = expandImpactedCorridorIdsForAutoHubs(
      baseCorridors,
      initialImpactedCorridorIds,
      movedRegionIds
    );
    // Room moves can invalidate corridor hubs, stems, and recovered corridors
    // beyond the direct room-to-room edge list. Partial reroute may preserve
    // stale corridor floor cells, leaving detached/monco corridor fragments.
    // Since room dragging now commits only on release, correctness is more
    // important than preserving the partial reroute optimization here.
    const shouldRerouteWholeNetwork =
      hasManualRoutingOverrides(normalized) || movedRegionIds.size > 0;
    const routedGraph = shouldRerouteWholeNetwork
      ? routingGraph
      : routingGraph.filter((edge) => impactedCorridorIds.has(edge.id));
    const routedCorridors =
      routedGraph.length > 0 ? routeCorridors(routingConfig, movedRegions, routedGraph) : [];
    const mergedCorridors = shouldRerouteWholeNetwork
      ? routedCorridors
      : mergePartiallyRoutedCorridors(baseCorridors, routedCorridors, impactedCorridorIds);
    const extensionRegions = applyCircleDoorRoomExtensions(movedRegions, mergedCorridors);
    const leveledMap = applyLevelMetadata(extensionRegions, mergedCorridors, routingConfig);
    const regions = leveledMap.regions || movedRegions;
    const corridors = leveledMap.corridors || mergedCorridors;
    const rebuiltDungeonMask = buildDungeonMask(regions, corridors, gridSize);
    const lockedMapAccesses = baseMap.dungeonMask?.mapAccesses || baseMap.mapAccesses || [];
    const regeneratedMapAccesses =
      generatedCandidate.dungeonMask?.mapAccesses || generatedCandidate.mapAccesses || [];
    const manualAccessRegionIds = new Set(
      Object.entries(normalized.mapAccesses || {})
        .filter(([, override]) => override && !override.disabled)
        .map(([regionId]) => regionId)
    );
    const regeneratedAccessByRegionId = new Map(
      regeneratedMapAccesses
        .filter((access) => access?.regionId)
        .map((access) => [access.regionId, access])
    );
    const seenAccessRegionIds = new Set();
    const mapAccesses = lockedMapAccesses.map((access) => {
      if (access?.regionId) seenAccessRegionIds.add(access.regionId);
      if (access?.regionId && manualAccessRegionIds.has(access.regionId)) {
        return (
          regeneratedAccessByRegionId.get(access.regionId) ||
          translateMapAccess(access, deltas, gridSize)
        );
      }
      return translateMapAccess(access, deltas, gridSize);
    });
    manualAccessRegionIds.forEach((regionId) => {
      if (seenAccessRegionIds.has(regionId)) return;
      const regeneratedAccess = regeneratedAccessByRegionId.get(regionId);
      if (regeneratedAccess) mapAccesses.push(regeneratedAccess);
    });
    const dungeonMask = {
      ...rebuiltDungeonMask,
      mapAccesses,
    };
    return {
      ...generatedCandidate,
      config: routingConfig,
      regions,
      corridors,
      dungeonMask,
      mapAccesses,
      props: generatedCandidate.props,
      finalGeometry: generatedCandidate.finalGeometry,
    };
  }

  function lockManualLayoutSeed() {
    if (manualLayoutSeed) return;
    const activeMap = generatedMapRef.current || generatedMap;
    const candidateSeed =
      activeMap.layoutCandidate?.seed ||
      activeMap.config?.layoutCandidateSeed ||
      activeMap.config?.seed ||
      seed;
    if (candidateSeed && candidateSeed !== manualLayoutSeed) {
      setManualLayoutSeed(String(candidateSeed));
    }
  }

  function getFrozenRoomPositions(extraPositions = {}) {
    const activeMap = generatedMapRef.current || generatedMap;
    const frozenPositions = {};
    (activeMap.regions || []).forEach((region) => {
      if (!region?.id || !region.cellRect) return;
      frozenPositions[region.id] = {
        x: Math.round(region.cellRect.x),
        y: Math.round(region.cellRect.y),
      };
    });
    return {
      ...frozenPositions,
      ...extraPositions,
    };
  }

  function getFrozenRoomStyles(existingStyles = {}) {
    const activeMap = generatedMapRef.current || generatedMap;
    const frozenStyles = { ...(existingStyles || {}) };
    (activeMap.regions || []).forEach((region) => {
      if (!region?.id) return;
      const currentStyle = frozenStyles[region.id] || {};
      frozenStyles[region.id] = {
        surfaceKind: currentStyle.surfaceKind || region.surfaceKind || "structure",
        shape: currentStyle.shape || inferGeneratedRoomShape(region),
        roomType: currentStyle.roomType || inferGeneratedRoomType(region),
        notch: Boolean(currentStyle.notch),
        ruined: Boolean(currentStyle.ruined),
        ...(currentStyle.sizePreset ? { sizePreset: currentStyle.sizePreset } : {}),
        ...(currentStyle.customSize ? { customSize: currentStyle.customSize } : {}),
      };
    });
    return frozenStyles;
  }

  function getStableFrozenRoomPositions(overrides = {}, extraPositions = {}) {
    const existingPositions =
      overrides?.roomPositions && typeof overrides.roomPositions === "object"
        ? overrides.roomPositions
        : {};
    const hasExistingPositions = Object.keys(existingPositions).length > 0;
    if (!hasExistingPositions) return getFrozenRoomPositions(extraPositions);
    return {
      ...existingPositions,
      ...extraPositions,
    };
  }

  function freezeCurrentRoomLayout(overrides, extraPositions = {}) {
    return {
      ...overrides,
      roomPositions: getStableFrozenRoomPositions(overrides, extraPositions),
      roomStyles: getFrozenRoomStyles(overrides.roomStyles),
    };
  }

  function beginManualEdit() {
    debugEvent("manual edit: begin", {
      hadLockedGeometry: Boolean(manualLayoutGeometryRef.current),
      mapSnapshot: summarizeDebugMap(generatedMap),
      manualOverrides: summarizeDebugManualOverrides(manualOverridesRef.current),
    });
    if (!manualLayoutGeometryRef.current) {
      manualLayoutGeometryRef.current = cloneMapGeometry(generatedMap);
    }
    lockManualLayoutSeed();
    setIsManualEditActive(true);
    manualEditSnapshotRef.current = cloneManualOverrides(manualOverridesRef.current);
  }

  function commitManualEdit() {
    setIsManualEditActive(false);
    const snapshot = manualEditSnapshotRef.current;
    const currentManualOverrides = cloneManualOverrides(manualOverridesRef.current);
    manualEditSnapshotRef.current = null;
    debugManualOverridesTransition("manual edit: commit", snapshot, currentManualOverrides, {
      hadSnapshot: Boolean(snapshot),
    });
    if (!snapshot || areManualOverridesEqual(snapshot, currentManualOverrides)) return;
    pendingInlineManualCommitRef.current = currentManualOverrides;
    pushManualHistorySnapshot(snapshot);
    setStateStatus("");
  }

  function createWorkspaceStatePayload() {
    return {
      config,
      generatedMap,
      manualOverrides: cloneManualOverrides(manualOverrides),
      uiState: {
        showEditor,
        showNames,
        showRoomBadges,
        showProps,
        showAccessDots,
        gridStyle,
        gridColor,
        gridWeight,
        visualStyle,
        wallDrawingStyle,
        hatchShadowColor,
        levelView,
        fadeOtherLevels,
      },
    };
  }

  function createManualWorkspaceStatePayload() {
    return {
      manualOverrides: cloneManualOverrides(manualOverrides),
    };
  }

  function finishWorkspaceEditing() {
    if (isManualEditActive) commitManualEdit();
    const payload = createWorkspaceStatePayload();
    if (onCommitWorkspace) onCommitWorkspace(payload);
    if (onExitWorkspace) onExitWorkspace(payload);
  }

  function undoManualEdit() {
    setManualHistory((history) => {
      if (history.past.length === 0) return history;
      const previous = cloneManualOverrides(history.past[history.past.length - 1]);
      const current = cloneManualOverrides(manualOverrides);
      setManualOverrides(previous);
      setStateStatus("Undone.");
      return {
        past: history.past.slice(0, -1),
        future: [current, ...history.future.slice(0, 49)],
      };
    });
  }

  function redoManualEdit() {
    setManualHistory((history) => {
      if (history.future.length === 0) return history;
      const next = cloneManualOverrides(history.future[0]);
      const current = cloneManualOverrides(manualOverrides);
      setManualOverrides(next);
      setStateStatus("Redone.");
      return {
        past: [...history.past.slice(-49), current],
        future: history.future.slice(1),
      };
    });
  }

  function randomizeSeed() {
    const nextSeed = hashStringToSeed(seed, roomCount, context, "next-seed").toString(36);
    setSeed(`cruor-${nextSeed}`);
    setManualLayoutSeed("");
    manualLayoutGeometryRef.current = null;
    setManualOverrides(resetManualOverrides());
    clearManualHistory();
    setStateStatus("");
  }

  function waitForNextAnimationFrame() {
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      return Promise.resolve();
    }
    return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
  }

  async function serializeDebugSvgWithCoordinates() {
    if (typeof document === "undefined") return "";
    setForceDebugCoordinatesForExport(true);
    try {
      await waitForNextAnimationFrame();
      await waitForNextAnimationFrame();
      const svg = document.querySelector("#cruor-map-svg");
      const serialized = serializeSvg(svg);
      return serialized || "";
    } finally {
      setForceDebugCoordinatesForExport(false);
    }
  }

  function getDebugSvgFilename() {
    return `cruor-map-debug-${new Date().toISOString().replace(/[:.]/g, "-")}.svg`;
  }

  async function copyTextToClipboard(text) {
    if (!text) return false;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    if (typeof document === "undefined") return false;
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }

  async function copyDebugSvg() {
    try {
      const svg = await serializeDebugSvgWithCoordinates();
      if (!svg) {
        setStateStatus("Debug SVG unavailable.");
        return;
      }
      const copied = await copyTextToClipboard(svg);
      setStateStatus(copied ? "Debug SVG copied." : "Unable to copy Debug SVG.");
    } catch (error) {
      setStateStatus(`Unable to copy Debug SVG: ${error?.message || String(error)}`);
    }
  }

  async function downloadDebugSvg() {
    try {
      const svg = await serializeDebugSvgWithCoordinates();
      if (!svg) {
        setStateStatus("Debug SVG unavailable.");
        return;
      }
      downloadMapDebugBlob(getDebugSvgFilename(), svg, "image/svg+xml;charset=utf-8");
      setStateStatus("Debug SVG downloaded.");
    } catch (error) {
      setStateStatus(`Unable to download Debug SVG: ${error?.message || String(error)}`);
    }
  }

  function exportState() {
    downloadMapState(
      config,
      manualOverrides,
      {
        showEditor,
        showNames,
        showRoomBadges,
        showProps,
        showAccessDots,
        gridStyle,
        gridColor,
        gridWeight,
        visualStyle,
        wallDrawingStyle,
        hatchShadowColor,
        levelView,
        fadeOtherLevels,
      },
      generatedMap
    );
    setStateStatus("State exported.");
  }

  function requestImportState() {
    stateFileInputRef.current?.click();
  }

  function importStateFromFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = parseMapStatePayload(String(reader.result || ""));
        const importedConfig = payload.config || {};
        setSeed(String(importedConfig.seed || DEFAULT_CONFIG.seed));
        setManualLayoutSeed("");
        manualLayoutGeometryRef.current = null;
        setContext(String(importedConfig.context || DEFAULT_CONFIG.context));
        setMapWidth(normalizeMapDimension(importedConfig.mapWidth, DEFAULT_CONFIG.mapWidth));
        setMapHeight(normalizeMapDimension(importedConfig.mapHeight, DEFAULT_CONFIG.mapHeight));
        setVisualStyle(
          normalizeVisualStyle(importedConfig.visualStyle, DEFAULT_CONFIG.visualStyle)
        );
        setGridStyle(normalizeGridStyle(importedConfig.gridStyle || DEFAULT_CONFIG.gridStyle));
        setGridColor(normalizeGridColor(importedConfig.gridColor || DEFAULT_CONFIG.gridColor));
        setGridWeight(normalizeGridWeight(importedConfig.gridWeight || DEFAULT_CONFIG.gridWeight));
        setRoomCount(normalizeRoomCount(importedConfig.roomCount, DEFAULT_CONFIG.roomCount));
        setShowGrid(Boolean(importedConfig.showGrid));
        if (payload.uiState && typeof payload.uiState === "object") {
          if (typeof payload.uiState.showEditor === "boolean")
            setShowEditor(payload.uiState.showEditor);
          if (typeof payload.uiState.showNames === "boolean")
            setShowNames(payload.uiState.showNames);
          if (typeof payload.uiState.showRoomBadges === "boolean")
            setShowRoomBadges(payload.uiState.showRoomBadges);
          if (typeof payload.uiState.showProps === "boolean")
            setShowProps(payload.uiState.showProps);
          if (typeof payload.uiState.showAccessDots === "boolean")
            setShowAccessDots(payload.uiState.showAccessDots);
          if (typeof payload.uiState.gridStyle === "string")
            setGridStyle(normalizeGridStyle(payload.uiState.gridStyle));
          if (typeof payload.uiState.gridColor === "string")
            setGridColor(normalizeGridColor(payload.uiState.gridColor));
          if (typeof payload.uiState.gridWeight === "string")
            setGridWeight(normalizeGridWeight(payload.uiState.gridWeight));
          if (typeof payload.uiState.visualStyle === "string")
            setVisualStyle(normalizeVisualStyle(payload.uiState.visualStyle, visualStyle));
          if (typeof payload.uiState.wallDrawingStyle === "string")
            setWallDrawingStyle(normalizeWallDrawingStyle(payload.uiState.wallDrawingStyle));
          if (typeof payload.uiState.hatchShadowColor === "string")
            setHatchShadowColor(normalizeHatchShadowColor(payload.uiState.hatchShadowColor));
          if (typeof payload.uiState.fadeOtherLevels === "boolean")
            setFadeOtherLevels(payload.uiState.fadeOtherLevels);
          if (typeof payload.uiState.levelView !== "undefined")
            setLevelView(normalizeLevelView(payload.uiState.levelView));
        }
        setManualOverrides(normalizeManualOverrides(payload.manualOverrides));
        clearManualHistory();
        setStateStatus("State imported.");
      } catch (error) {
        setStateStatus(error instanceof Error ? error.message : "Could not import state.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function createRoomMoveManualOverrides(currentOverrides, regionId, position) {
    const target = generatedMap.regions.find((region) => region.id === regionId);
    if (!target) return null;
    const gridW = Math.floor(generatedMap.config.mapWidth / generatedMap.config.gridSize);
    const gridH = Math.floor(generatedMap.config.mapHeight / generatedMap.config.gridSize);
    const candidate = {
      ...target.cellRect,
      x: clamp(Math.round(position.x), 1, Math.max(1, gridW - target.cellRect.w - 1)),
      y: clamp(Math.round(position.y), 1, Math.max(1, gridH - target.cellRect.h - 1)),
    };
    const dx = candidate.x - target.cellRect.x;
    const dy = candidate.y - target.cellRect.y;
    if (dx === 0 && dy === 0) return null;
    const occupiedCells = new Set();
    generatedMap.regions.forEach((region) => {
      if (region.id === regionId) return;
      region.floorCells.forEach((cell) => occupiedCells.add(cellKey(cell.x, cell.y)));
    });
    const overlaps = target.floorCells.some((cell) =>
      occupiedCells.has(cellKey(cell.x + dx, cell.y + dy))
    );
    if (overlaps) return null;
    return freezeCurrentRoomLayout(currentOverrides, {
      [regionId]: { x: candidate.x, y: candidate.y },
    });
  }

  function moveRoom(regionId, position) {
    return setManualOverridesFromCurrent((current) => {
      const next = createRoomMoveManualOverrides(current, regionId, position);
      return next || current;
    }, `moveRoom:${regionId}`);
  }

  function roundSerializedAnchorValue(value) {
    return Number.isFinite(value) ? Math.round(value * 100) / 100 : value;
  }

  function areSerializedAnchorPointsEqual(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return (
      roundSerializedAnchorValue(a.x) === roundSerializedAnchorValue(b.x) &&
      roundSerializedAnchorValue(a.y) === roundSerializedAnchorValue(b.y)
    );
  }

  function areSerializedAnchorSegmentsEqual(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return (
      roundSerializedAnchorValue(a.x1) === roundSerializedAnchorValue(b.x1) &&
      roundSerializedAnchorValue(a.y1) === roundSerializedAnchorValue(b.y1) &&
      roundSerializedAnchorValue(a.x2) === roundSerializedAnchorValue(b.x2) &&
      roundSerializedAnchorValue(a.y2) === roundSerializedAnchorValue(b.y2)
    );
  }

  function areSerializedAnchorCellsEqual(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.x === b.x && a.y === b.y;
  }

  function areSerializedAnchorsEqual(a, b) {
    if (!a || !b) return false;
    const sameBasicCell = a.side === b.side && a.cell?.x === b.cell?.x && a.cell?.y === b.cell?.y;
    if (!(a.finalGeometry || b.finalGeometry || a.expandedCircleDoor || b.expandedCircleDoor))
      return sameBasicCell;
    return (
      sameBasicCell &&
      Boolean(a.finalGeometry) === Boolean(b.finalGeometry) &&
      Boolean(a.expandedCircleDoor) === Boolean(b.expandedCircleDoor) &&
      areSerializedAnchorCellsEqual(a.outsideCell, b.outsideCell) &&
      areSerializedAnchorCellsEqual(a.snapCell, b.snapCell) &&
      areSerializedAnchorCellsEqual(a.portalRoomCell, b.portalRoomCell) &&
      areSerializedAnchorPointsEqual(a.point, b.point) &&
      areSerializedAnchorPointsEqual(a.displayPoint, b.displayPoint) &&
      areSerializedAnchorSegmentsEqual(a.segment, b.segment) &&
      areSerializedAnchorSegmentsEqual(a.displaySegment, b.displaySegment)
    );
  }

  function moveDoor(corridorId, endpoint, point, committedAnchor = null, debugTrace = null) {
    const activeMap = generatedMapRef.current || generatedMap;
    const corridor = activeMap.corridors.find((item) => item.id === corridorId);
    if (!corridor) {
      debugEvent("moveDoor: corridor not found", {
        corridorId,
        endpoint,
        point: roundDebugPoint(point),
      });
      return false;
    }
    debugEvent("moveDoor: start", {
      corridorId,
      endpoint,
      point: roundDebugPoint(point),
      committedAnchor: summarizeDebugAnchor(committedAnchor),
      debugTrace: debugTrace
        ? {
            releasePoint: roundDebugPoint(debugTrace.releasePoint),
            releaseCell: summarizeDebugCell(debugTrace.releaseCell),
            snapPoint: roundDebugPoint(debugTrace.snapPoint),
            snapCell: summarizeDebugCell(debugTrace.snapCell),
            snapAnchor: summarizeDebugAnchor(debugTrace.snapAnchor),
          }
        : null,
      corridor: summarizeDebugCorridor(corridor),
      manualBefore: summarizeDebugManualOverrides(manualOverridesRef.current),
    });
    if (corridor.isRoomLink || endpoint === "shared") {
      const fromRegion = activeMap.regions.find((item) => item.id === corridor.from);
      const toRegion = activeMap.regions.find((item) => item.id === corridor.to);
      if (!fromRegion || !toRegion) {
        debugEvent("moveDoor: shared endpoint missing region", {
          corridorId,
          endpoint,
          fromRegionFound: Boolean(fromRegion),
          toRegionFound: Boolean(toRegion),
        });
        return false;
      }
      const sharedConnection = getClosestSharedRoomConnectionToPoint(
        fromRegion,
        toRegion,
        point,
        activeMap.config.gridSize
      );
      if (!sharedConnection) {
        debugEvent("moveDoor: shared endpoint no shared connection", {
          corridorId,
          endpoint,
          point: roundDebugPoint(point),
        });
        return false;
      }
      const nextFromAnchor = serializeManualAnchor(sharedConnection.fromAnchor);
      const nextToAnchor = serializeManualAnchor(sharedConnection.toAnchor);
      const fromKey = corridorEndpointKey(corridorId, "from");
      const toKey = corridorEndpointKey(corridorId, "to");
      const current = normalizeManualOverrides(manualOverridesRef.current);
      const hasManualWaypoints = Array.isArray(current.corridorWaypoints?.[corridorId]);
      if (
        !hasManualWaypoints &&
        areSerializedAnchorsEqual(current.doorAnchors?.[fromKey], nextFromAnchor) &&
        areSerializedAnchorsEqual(current.doorAnchors?.[toKey], nextToAnchor)
      ) {
        debugEvent("moveDoor: shared endpoint no-op", {
          corridorId,
          endpoint,
          nextFromAnchor: summarizeDebugAnchor(nextFromAnchor),
          nextToAnchor: summarizeDebugAnchor(nextToAnchor),
        });
        return false;
      }
      debugEvent("moveDoor: shared endpoint committing anchors", {
        corridorId,
        endpoint,
        fromKey,
        toKey,
        nextFromAnchor: summarizeDebugAnchor(nextFromAnchor),
        nextToAnchor: summarizeDebugAnchor(nextToAnchor),
        deletesManualWaypoints: hasManualWaypoints,
      });
      debugSetPendingAnchorTrace({
        kind: "existing-corridor-shared-anchor",
        corridorId,
        endpoint,
        releasePoint: roundDebugPoint(debugTrace?.releasePoint || point),
        releaseCell: summarizeDebugCell(
          debugTrace?.releaseCell || getDebugPointCell(debugTrace?.releasePoint || point)
        ),
        snapPoint: roundDebugPoint(debugTrace?.snapPoint || sharedConnection.point || point),
        snapCell: summarizeDebugCell(
          debugTrace?.snapCell ||
            getDebugPointCell(debugTrace?.snapPoint || sharedConnection.point || point)
        ),
        requestedAnchor: {
          from: summarizeDebugAnchor(nextFromAnchor),
          to: summarizeDebugAnchor(nextToAnchor),
        },
        requestedAnchorCell: summarizeDebugCell(
          getDebugAnchorCell(endpoint === "to" ? nextToAnchor : nextFromAnchor)
        ),
        corridorBefore: summarizeDebugCorridor(corridor),
      });
      return setManualOverridesFromCurrent((currentOverrides) => {
        const corridorWaypoints = {
          ...(currentOverrides.corridorWaypoints || {}),
        };
        delete corridorWaypoints[corridorId];
        return freezeCurrentRoomLayout({
          ...currentOverrides,
          corridorWaypoints,
          doorAnchors: {
            ...currentOverrides.doorAnchors,
            [fromKey]: nextFromAnchor,
            [toKey]: nextToAnchor,
          },
        });
      }, `moveDoor:${corridorId}:${endpoint}:shared`);
    }
    const regionId = endpoint === "from" ? corridor.from : corridor.to;
    const region = activeMap.regions.find((item) => item.id === regionId);
    if (!region) {
      debugEvent("moveDoor: endpoint region not found", { corridorId, endpoint, regionId });
      return false;
    }
    const anchor =
      committedAnchor ||
      getDoorDragManualAnchor(region, point, activeMap.config.gridSize) ||
      getClosestBoundaryAnchorToPoint(region, point, activeMap.config.gridSize, generatedMap);
    if (!anchor) {
      debugEvent("moveDoor: no anchor resolved", {
        corridorId,
        endpoint,
        regionId,
        point: roundDebugPoint(point),
      });
      return false;
    }
    const nextAnchor = serializeManualAnchor(anchor);
    const key = corridorEndpointKey(corridorId, endpoint);
    const current = normalizeManualOverrides(manualOverridesRef.current);
    const hasManualWaypoints = Array.isArray(current.corridorWaypoints?.[corridorId]);
    if (!hasManualWaypoints && areSerializedAnchorsEqual(current.doorAnchors?.[key], nextAnchor)) {
      debugEvent("moveDoor: endpoint no-op", {
        corridorId,
        endpoint,
        key,
        nextAnchor: summarizeDebugAnchor(nextAnchor),
      });
      return false;
    }
    debugEvent("moveDoor: endpoint committing anchor", {
      corridorId,
      endpoint,
      key,
      nextAnchor: summarizeDebugAnchor(nextAnchor),
      deletesManualWaypoints: hasManualWaypoints,
      currentAnchor: summarizeDebugAnchor(current.doorAnchors?.[key]),
    });
    debugSetPendingAnchorTrace({
      kind: "existing-corridor-anchor",
      corridorId,
      endpoint,
      releasePoint: roundDebugPoint(debugTrace?.releasePoint || point),
      releaseCell: summarizeDebugCell(
        debugTrace?.releaseCell || getDebugPointCell(debugTrace?.releasePoint || point)
      ),
      snapPoint: roundDebugPoint(debugTrace?.snapPoint || point),
      snapCell: summarizeDebugCell(
        debugTrace?.snapCell || getDebugPointCell(debugTrace?.snapPoint || point)
      ),
      requestedAnchor: summarizeDebugAnchor(nextAnchor),
      requestedAnchorCell: summarizeDebugCell(getDebugAnchorCell(nextAnchor)),
      previousAnchor: summarizeDebugAnchor(current.doorAnchors?.[key]),
      corridorBefore: summarizeDebugCorridor(corridor),
    });
    return setManualOverridesFromCurrent((currentOverrides) => {
      const corridorWaypoints = {
        ...(currentOverrides.corridorWaypoints || {}),
      };
      delete corridorWaypoints[corridorId];
      return freezeCurrentRoomLayout({
        ...currentOverrides,
        corridorWaypoints,
        doorAnchors: {
          ...currentOverrides.doorAnchors,
          [key]: nextAnchor,
        },
      });
    });
  }

  function moveWaypoint(corridorId, waypointIndex, point, source) {
    const corridor = generatedMap.corridors.find((item) => item.id === corridorId);
    if (!corridor) return false;
    const gridW = Math.floor(generatedMap.config.mapWidth / generatedMap.config.gridSize);
    const gridH = Math.floor(generatedMap.config.mapHeight / generatedMap.config.gridSize);
    const cell = normalizeManualWaypoint(point, generatedMap.config.gridSize, gridW, gridH);
    if (!cell) return false;
    const roomCells = getRoomCellSet(generatedMap.regions);
    if (roomCells.has(cellKey(cell.x, cell.y))) return false;
    const current = normalizeManualOverrides(manualOverridesRef.current);
    const currentWaypoints = current.corridorWaypoints || {};
    const currentManual = Array.isArray(currentWaypoints[corridorId])
      ? currentWaypoints[corridorId].filter(isValidPoint)
      : [];
    let nextWaypoints;
    if (source === "manual") {
      nextWaypoints = [...currentManual];
      const safeIndex = clamp(
        Number.isInteger(waypointIndex) ? waypointIndex : nextWaypoints.length,
        0,
        nextWaypoints.length
      );
      if (currentManual[safeIndex]?.x === cell.x && currentManual[safeIndex]?.y === cell.y)
        return false;
      nextWaypoints[safeIndex] = cell;
    } else {
      nextWaypoints = [cell];
      if (
        currentManual.length === 1 &&
        currentManual[0]?.x === cell.x &&
        currentManual[0]?.y === cell.y
      )
        return false;
    }
    debugEvent("moveWaypoint: committing", {
      corridorId,
      waypointIndex,
      source,
      cell: summarizeDebugCell(cell),
      nextWaypoints,
    });
    return setManualOverridesFromCurrent(
      (currentOverrides) =>
        freezeCurrentRoomLayout({
          ...currentOverrides,
          corridorWaypoints: {
            ...(currentOverrides.corridorWaypoints || {}),
            [corridorId]: nextWaypoints.filter(isValidPoint),
          },
        }),
      `moveWaypoint:${corridorId}`
    );
  }

  function insertWaypoint(corridorId, insertIndex, point) {
    const corridor = generatedMap.corridors.find((item) => item.id === corridorId);
    if (!corridor) return false;
    const gridW = Math.floor(generatedMap.config.mapWidth / generatedMap.config.gridSize);
    const gridH = Math.floor(generatedMap.config.mapHeight / generatedMap.config.gridSize);
    const cell = normalizeManualWaypoint(point, generatedMap.config.gridSize, gridW, gridH);
    if (!cell) return false;
    const roomCells = getRoomCellSet(generatedMap.regions);
    if (roomCells.has(cellKey(cell.x, cell.y))) return false;
    const current = normalizeManualOverrides(manualOverridesRef.current);
    const currentWaypoints = current.corridorWaypoints || {};
    const currentManual = Array.isArray(currentWaypoints[corridorId])
      ? currentWaypoints[corridorId].filter(isValidPoint)
      : [];
    const safeIndex = clamp(
      Number.isInteger(insertIndex) ? insertIndex : currentManual.length,
      0,
      currentManual.length
    );
    const nextWaypoints = [...currentManual];
    nextWaypoints.splice(safeIndex, 0, cell);
    debugEvent("insertWaypoint: committing", {
      corridorId,
      insertIndex,
      cell: summarizeDebugCell(cell),
      nextWaypoints,
    });
    return setManualOverridesFromCurrent(
      (currentOverrides) =>
        freezeCurrentRoomLayout({
          ...currentOverrides,
          corridorWaypoints: {
            ...(currentOverrides.corridorWaypoints || {}),
            [corridorId]: nextWaypoints.filter(isValidPoint),
          },
        }),
      `insertWaypoint:${corridorId}`
    );
  }

  function deleteWaypoint(corridorId, waypointIndex, source) {
    if (source !== "manual") return;
    updateManualOverridesWithHistory((current) => {
      const currentWaypoints = current.corridorWaypoints || {};
      const currentManual = Array.isArray(currentWaypoints[corridorId])
        ? currentWaypoints[corridorId].filter(isValidPoint)
        : [];
      const safeIndex = Number.isInteger(waypointIndex) ? waypointIndex : -1;
      if (safeIndex < 0 || safeIndex >= currentManual.length) return current;
      const nextWaypoints = currentManual.filter((_, index) => index !== safeIndex);
      return freezeCurrentRoomLayout({
        ...current,
        corridorWaypoints: {
          ...currentWaypoints,
          [corridorId]: nextWaypoints,
        },
      });
    });
  }

  function deleteConnection(corridorId) {
    if (!corridorId) return;
    debugEvent("deleteConnection: requested", {
      corridorId,
      corridor: summarizeDebugCorridor(
        generatedMap.corridors.find((item) => item.id === corridorId)
      ),
      manualBefore: summarizeDebugManualOverrides(manualOverridesRef.current),
    });
    updateManualOverridesWithHistory(
      (current) => {
        const normalized = normalizeManualOverrides(current);
        const deletedConnections = Array.isArray(normalized.deletedConnections)
          ? normalized.deletedConnections
          : [];
        const customConnections = Array.isArray(normalized.customConnections)
          ? normalized.customConnections.filter((connection) => connection.id !== corridorId)
          : [];
        const doorAnchors = { ...(normalized.doorAnchors || {}) };
        delete doorAnchors[corridorEndpointKey(corridorId, "from")];
        delete doorAnchors[corridorEndpointKey(corridorId, "to")];
        const doorTypes = { ...(normalized.doorTypes || {}) };
        delete doorTypes[doorTypeKey(corridorId, "from")];
        delete doorTypes[doorTypeKey(corridorId, "to")];
        delete doorTypes[doorTypeKey(corridorId, "shared")];
        const stairTransitions = { ...(normalized.levels.stairs || {}) };
        delete stairTransitions[stairTransitionKey(corridorId, "from")];
        delete stairTransitions[stairTransitionKey(corridorId, "to")];
        delete stairTransitions[stairTransitionKey(corridorId, "shared")];
        const levels = {
          ...normalized.levels,
          stairs: stairTransitions,
          corridors: { ...(normalized.levels.corridors || {}) },
        };
        delete levels.corridors[corridorId];
        const corridorWaypoints = { ...(normalized.corridorWaypoints || {}) };
        delete corridorWaypoints[corridorId];
        const corridorTypes = { ...(normalized.corridorTypes || {}) };
        delete corridorTypes[corridorTypeKey(corridorId)];
        return freezeCurrentRoomLayout({
          ...normalized,
          customConnections,
          doorAnchors,
          doorTypes,
          stairTransitions,
          levels,
          corridorWaypoints,
          corridorTypes,
          deletedConnections: deletedConnections.includes(corridorId)
            ? deletedConnections
            : [...deletedConnections, corridorId],
        });
      },
      "",
      `deleteConnection:${corridorId}`
    );
  }

  function updateDoorType(corridorId, endpoint, doorType) {
    if (!corridorId || !endpoint) return;
    updateManualOverridesWithHistory((current) => ({
      ...current,
      doorTypes: {
        ...(current.doorTypes || {}),
        [doorTypeKey(corridorId, endpoint)]: normalizeDoorType(doorType),
      },
    }));
  }

  function updateDoorStair(corridorId, endpoint, stairTransition) {
    if (!corridorId || !endpoint) return;
    updateManualOverridesWithHistory((current) => {
      const normalized = normalizeManualOverrides(current);
      const activeMap = generatedMapRef.current || generatedMap;
      const corridor = activeMap?.corridors?.find((item) => item.id === corridorId) || null;
      const stairLevelOverrides = createEditorStairLevelOverrides({
        levels: normalized.levels,
        corridor,
        endpoint,
        stairTransition,
      });
      return {
        ...normalized,
        stairTransitions: stairLevelOverrides.stairTransitions,
        levels: stairLevelOverrides.levels,
      };
    });
  }

  function updateCorridorType(corridorId, corridorType) {
    if (!corridorId) return;
    updateManualOverridesWithHistory(
      (current) => {
        const normalized = normalizeManualOverrides(current);
        const corridorTypes = { ...(normalized.corridorTypes || {}) };
        const key = corridorTypeKey(corridorId);
        if (corridorType === null || corridorType === undefined || corridorType === "reset") {
          delete corridorTypes[key];
        } else {
          const normalizedType = normalizeCorridorType(corridorType, "normal");
          if (EDITOR_DISABLED_CORRIDOR_TYPES.has(normalizedType)) return normalized;
          corridorTypes[key] = normalizedType;
        }
        return {
          ...normalized,
          corridorTypes,
        };
      },
      corridorType ? `Corridor type: ${normalizeCorridorType(corridorType, "normal")}.` : "Corridor type reset.",
      `updateCorridorType:${corridorId}`
    );
  }

  function getMapAccessAnchorForOverride(access) {
    if (!access) return null;
    if (access.displayAnchor) {
      return {
        ...access.displayAnchor,
        finalBoundaryIndex: access.finalBoundaryIndex ?? access.displayAnchor.finalBoundaryIndex,
        segment: access.segment || access.displayAnchor.segment,
        point: access.point || access.displayAnchor.point,
        normal: access.normal || access.displayAnchor.normal,
        tangent: access.tangent || access.displayAnchor.tangent,
        caveBounds: access.caveBounds || access.displayAnchor.caveBounds,
      };
    }
    return {
      side: access.side,
      cell: access.cell,
      outsideCell: access.outsideCell,
      normal: access.normal,
      tangent: access.tangent,
      finalGeometry: Boolean(access.finalGeometry),
      caveAccessBoundary: Boolean(access.caveAccessBoundary),
      finalBoundaryIndex: access.finalBoundaryIndex,
      segment: access.segment,
      point: access.displayPoint || access.point || access.start,
      caveBounds: access.caveBounds,
    };
  }

  function buildMapAccessOverride(regionId, anchor, accessType = null) {
    if (!regionId || !anchor) return null;
    const region = generatedMap.regions.find((item) => item.id === regionId);
    if (!region) return null;
    const existingAccess = (
      generatedMap.dungeonMask.mapAccesses ||
      generatedMap.mapAccesses ||
      []
    ).find((access) => access.regionId === regionId);
    const fallbackIntent = getFallbackMapAccessIntent(region, generatedMap);
    const type = normalizeMapAccessType(
      accessType || existingAccess?.type || fallbackIntent.type,
      fallbackIntent.type || "passage"
    );
    const serializedAnchor = serializeMapAccessAnchor(anchor);
    if (!serializedAnchor) return null;
    return {
      disabled: false,
      manual: true,
      id: existingAccess?.id || null,
      type,
      label: getMapAccessLabelForType(type),
      anchor: serializedAnchor,
    };
  }

  function mapAccessOverrideEquals(previous, nextOverride) {
    return (
      Boolean(previous && !previous.disabled && nextOverride) &&
      previous.type === nextOverride.type &&
      JSON.stringify(previous.anchor || null) === JSON.stringify(nextOverride.anchor || null)
    );
  }

  function preservePureCaveAccessOverrides(mapAccesses, targetRegionId) {
    if (!pureCaveMap) return mapAccesses;
    (generatedMap.dungeonMask.mapAccesses || generatedMap.mapAccesses || []).forEach((access) => {
      if (
        !access?.regionId ||
        access.regionId === targetRegionId ||
        mapAccesses[access.regionId]?.disabled
      )
        return;
      const anchor = getMapAccessAnchorForOverride(access);
      const frozenOverride = buildMapAccessOverride(access.regionId, anchor, access.type);
      if (frozenOverride) mapAccesses[access.regionId] = frozenOverride;
    });
    return mapAccesses;
  }

  function setMapAccess(regionId, anchor, accessType = null) {
    const nextOverride = buildMapAccessOverride(regionId, anchor, accessType);
    if (!nextOverride) return;
    debugEvent("setMapAccess: requested", {
      regionId,
      accessType,
      anchor: summarizeDebugAnchor(anchor),
      nextOverride,
    });
    setManualOverrides((current) => {
      const mapAccesses = { ...(current.mapAccesses || {}) };
      const previous = mapAccesses[regionId];
      if (mapAccessOverrideEquals(previous, nextOverride)) {
        debugEvent("setMapAccess: no-op", { regionId, previous, nextOverride });
        return current;
      }
      preservePureCaveAccessOverrides(mapAccesses, regionId);
      mapAccesses[regionId] = nextOverride;
      const next = {
        ...current,
        mapAccesses,
      };
      debugManualOverridesTransition("setMapAccess: apply", current, next, {
        regionId,
        previous,
        nextOverride,
      });
      return next;
    });
  }

  function setMapAccessWithHistory(regionId, anchor, accessType = null) {
    const nextOverride = buildMapAccessOverride(regionId, anchor, accessType);
    if (!nextOverride) return;
    updateManualOverridesWithHistory(
      (current) => {
        const mapAccesses = { ...(current.mapAccesses || {}) };
        const previous = mapAccesses[regionId];
        if (mapAccessOverrideEquals(previous, nextOverride)) return current;
        preservePureCaveAccessOverrides(mapAccesses, regionId);
        mapAccesses[regionId] = nextOverride;
        return {
          ...current,
          mapAccesses,
        };
      },
      "",
      `setMapAccessWithHistory:${regionId}`
    );
  }

  function removeMapAccess(regionId) {
    if (!regionId) return;
    updateManualOverridesWithHistory(
      (current) => ({
        ...current,
        mapAccesses: {
          ...(current.mapAccesses || {}),
          [regionId]: { disabled: true },
        },
      }),
      "",
      `removeMapAccess:${regionId}`
    );
  }

  function updateJunctionType(junctionKey, junctionType) {
    if (!junctionKey) return;
    updateManualOverridesWithHistory((current) => {
      const corridorJunctions = { ...(current.corridorJunctions || {}) };
      const previous = getManualJunctionOverride(corridorJunctions, junctionKey, "merge");
      const nextType = normalizeJunctionType(junctionType);
      if (nextType === "merge") delete corridorJunctions[junctionKey];
      else {
        const nextSideIndex =
          previous.type === nextType ? (previous.sideIndex + 1) % 4 : previous.sideIndex;
        corridorJunctions[junctionKey] = {
          type: nextType,
          sideIndex: nextSideIndex,
        };
      }
      return {
        ...current,
        corridorJunctions,
      };
    });
  }

  function buildPreviewMapFromManualOverrides(nextOverrides) {
    const normalized = normalizeManualOverrides(nextOverrides);
    const snapshot = createLockedGenerationManualSnapshot(normalized);
    const previewGenerationConfig = {
      ...config,
      manualRoomPositions: {},
      manualDoorAnchors: snapshot.doorAnchors,
      manualDoorTypes: snapshot.doorTypes,
      manualStairTransitions: snapshot.levels?.stairs || {},
      manualLevels: snapshot.levels,
      manualMapAccesses: snapshot.mapAccesses,
      manualCorridorJunctions: snapshot.corridorJunctions,
      manualCorridorWaypoints: snapshot.corridorWaypoints,
      manualCorridorTypes: snapshot.corridorTypes,
      manualCustomConnections: snapshot.customConnections,
      manualDeletedConnections: snapshot.deletedConnections,
      manualRoomStyles: snapshot.roomStyles,
    };
    const previewRawOverrides = createLockedRawGenerationManualOverrides(snapshot);
    const previewRawMap = generateMap(previewGenerationConfig, previewRawOverrides);
    const baseGeometry = manualLayoutGeometryRef.current || cloneMapGeometry(generatedMap);
    return buildManualGeometryLockedMap(baseGeometry, previewRawMap, normalized);
  }

  function createRoomDragPreviewMap(regionId, position) {
    const nextOverrides = createRoomMoveManualOverrides(
      manualOverridesRef.current,
      regionId,
      position
    );
    if (!nextOverrides) return null;
    return { map: buildPreviewMapFromManualOverrides(nextOverrides) };
  }

  function getManualConnectionPairKey(fromRegionId, toRegionId) {
    if (!fromRegionId || !toRegionId) return "";
    return [String(fromRegionId), String(toRegionId)].sort().join("::");
  }

  function getConnectionLikePairKey(connection) {
    return getManualConnectionPairKey(connection?.from, connection?.to);
  }

  function isManualConnectionId(id) {
    return String(id || "").startsWith("manual-edge-");
  }

  function isManualConnectionLike(connection) {
    return (
      isManualConnectionId(connection?.id) ||
      connection?.kind === "manual" ||
      String(connection?.reason || "") === "manual-editor-connection"
    );
  }

  function createManualConnectionEdgeId(fromRegionId, toRegionId, sequence) {
    return `manual-edge-${fromRegionId}-${toRegionId}-${sequence.toString(36)}`;
  }

  function dedupeRoutingGraphForManualDuplicatePairs(graph, customConnections = []) {
    if (!Array.isArray(graph) || graph.length <= 1) return graph || [];
    const customIds = new Set(
      (customConnections || []).map((connection) => connection?.id).filter(Boolean)
    );
    const seenGeneratedPairs = new Set();
    const seenIds = new Set();
    const kept = [];
    graph.forEach((edge) => {
      if (!edge?.id || seenIds.has(edge.id)) return;
      const pairKey = getConnectionLikePairKey(edge);
      const manual = customIds.has(edge.id) || isManualConnectionLike(edge);
      if (manual) {
        seenIds.add(edge.id);
        kept.push(edge);
        return;
      }
      if (pairKey) {
        if (seenGeneratedPairs.has(pairKey)) return;
        seenGeneratedPairs.add(pairKey);
      }
      seenIds.add(edge.id);
      kept.push(edge);
    });
    return kept;
  }

  function createConnectionManualOverrides(currentOverrides, connection) {
    if (
      !connection?.fromRegionId ||
      !connection?.toRegionId ||
      connection.fromRegionId === connection.toRegionId
    )
      return null;
    const fromAnchor = serializeManualAnchor(connection.fromAnchor);
    const toAnchor = serializeManualAnchor(connection.toAnchor);
    if (!fromAnchor || !toAnchor) return null;
    const normalized = normalizeManualOverrides(currentOverrides);
    const customConnections = Array.isArray(normalized.customConnections)
      ? normalized.customConnections
      : [];
    const nextSequence = normalized.manualConnectionSequence + 1;
    const edgeId = createManualConnectionEdgeId(
      connection.fromRegionId,
      connection.toRegionId,
      nextSequence,
    );
    const fromEndpoint = "from";
    const toEndpoint = "to";
    const nextCustomConnections = [
      ...customConnections,
      {
        id: edgeId,
        from: connection.fromRegionId,
        to: connection.toRegionId,
        kind: "manual",
        locked: true,
      },
    ];
    const deletedConnections = Array.isArray(normalized.deletedConnections)
      ? normalized.deletedConnections.filter((id) => id !== edgeId)
      : [];
    return {
      edgeId,
      fromEndpoint,
      toEndpoint,
      reusedExistingConnection: false,
      overrides: freezeCurrentRoomLayout({
        ...currentOverrides,
        deletedConnections,
        manualConnectionSequence: nextSequence,
        customConnections: nextCustomConnections,
        doorAnchors: {
          ...normalized.doorAnchors,
          [corridorEndpointKey(edgeId, fromEndpoint)]: fromAnchor,
          [corridorEndpointKey(edgeId, toEndpoint)]: toAnchor,
        },
      }),
    };
  }

  function createConnectionDraftPreviewMap(connection) {
    const result = createConnectionManualOverrides(manualOverridesRef.current, connection);
    if (!result?.overrides) return null;
    return {
      corridorId: result.edgeId,
      map: buildPreviewMapFromManualOverrides(result.overrides),
    };
  }

  function createConnectionFromWallDrag(connection) {
    debugEvent("createConnectionFromWallDrag: requested", {
      connection: {
        ...connection,
        debugTrace: connection?.debugTrace
          ? {
              releasePoint: roundDebugPoint(connection.debugTrace.releasePoint),
              releaseCell: summarizeDebugCell(connection.debugTrace.releaseCell),
              targetPoint: roundDebugPoint(connection.debugTrace.targetPoint),
              targetCell: summarizeDebugCell(connection.debugTrace.targetCell),
              targetDistance: roundDebugNumber(connection.debugTrace.targetDistance),
              targetScore: roundDebugNumber(connection.debugTrace.targetScore),
            }
          : null,
        fromAnchor: summarizeDebugAnchor(connection?.fromAnchor),
        toAnchor: summarizeDebugAnchor(connection?.toAnchor),
      },
      manualBefore: summarizeDebugManualOverrides(manualOverridesRef.current),
    });
    updateManualOverridesWithHistory(
      (current) => {
        const result = createConnectionManualOverrides(current, connection);
        if (result?.overrides) {
          debugSetPendingAnchorTrace({
            kind: "new-corridor",
            edgeId: result.edgeId,
            corridorId: result.edgeId,
            endpoint: result.toEndpoint || "to",
            reusedExistingConnection: Boolean(result.reusedExistingConnection),
            fromRegionId: connection?.fromRegionId || null,
            toRegionId: connection?.toRegionId || null,
            releasePoint: roundDebugPoint(connection?.debugTrace?.releasePoint),
            releaseCell: summarizeDebugCell(connection?.debugTrace?.releaseCell),
            targetPoint: roundDebugPoint(connection?.debugTrace?.targetPoint),
            targetCell: summarizeDebugCell(connection?.debugTrace?.targetCell),
            targetDistance: roundDebugNumber(connection?.debugTrace?.targetDistance),
            targetScore: roundDebugNumber(connection?.debugTrace?.targetScore),
            requestedAnchor: summarizeDebugAnchor(serializeManualAnchor(connection?.toAnchor)),
            requestedAnchorCell: summarizeDebugCell(
              getDebugAnchorCell(serializeManualAnchor(connection?.toAnchor))
            ),
            fromAnchor: summarizeDebugAnchor(serializeManualAnchor(connection?.fromAnchor)),
            manualBefore: summarizeDebugManualOverrides(current),
          });
        }
        return result?.overrides || current;
      },
      "",
      `createConnectionFromWallDrag:${connection?.fromRegionId || "?"}->${connection?.toRegionId || "?"}`
    );
  }

  function releaseManualGeometryLockForRoomStyleEdit() {
    debugEvent("room style edit: release manual geometry lock", {
      hadManualLayoutGeometry: Boolean(manualLayoutGeometryRef.current),
      manualLayoutSeed: manualLayoutSeed || "",
    });
    // Corridor and endpoint edits intentionally lock the current geometry so
    // rerouting cannot reshape rooms implicitly. Explicit room edits are the
    // opposite case: Shape, Size, type, and modifier controls must be allowed
    // to rebuild the edited room geometry from manualRoomStyles.
    manualLayoutGeometryRef.current = null;
    setManualLayoutSeed("");
  }

  function updateRoomStyle(regionId, patch) {
    releaseManualGeometryLockForRoomStyleEdit();
    updateManualOverridesWithHistory(
      (current) => {
        const currentStyle = current.roomStyles?.[regionId] || {};
        const region = generatedMap.regions.find((item) => item.id === regionId);
        const shouldFreezeVisibleSize =
          patch &&
          typeof patch === "object" &&
          !("sizePreset" in patch) &&
          !("customSize" in patch) &&
          ("shape" in patch || "surfaceKind" in patch || "roomType" in patch) &&
          !currentStyle.sizePreset;
        return {
          ...current,
          roomStyles: {
            ...current.roomStyles,
            [regionId]: {
              ...currentStyle,
              ...(shouldFreezeVisibleSize
                ? { sizePreset: region?.size || "Medium", customSize: null }
                : {}),
              ...patch,
            },
          },
        };
      },
      "",
      `updateRoomStyle:${regionId}`
    );
  }

  function resetRoomStyle(regionId) {
    releaseManualGeometryLockForRoomStyleEdit();
    updateManualOverridesWithHistory(
      (current) => {
        const nextStyles = { ...(current.roomStyles || {}) };
        delete nextStyles[regionId];
        return {
          ...current,
          roomStyles: nextStyles,
        };
      },
      "",
      `resetRoomStyle:${regionId}`
    );
  }

  function isEditorStairLevelOverrideValue(value, corridorId = null) {
    return Boolean(
      value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        value.source === "editor-stair" &&
        (!corridorId || !value.corridorId || value.corridorId === corridorId)
    );
  }

  function getConnectedCorridorIdsForRegion(regionId) {
    const map = generatedMapRef.current || generatedMap;
    return new Set(
      (map?.corridors || [])
        .filter((corridor) => corridor?.from === regionId || corridor?.to === regionId)
        .map((corridor) => corridor.id)
        .filter(Boolean),
    );
  }

  function removeEditorStairOverridesForRoomLevelChange(levels, regionId) {
    const connectedCorridorIds = getConnectedCorridorIdsForRegion(regionId);
    if (connectedCorridorIds.size === 0) return levels;
    const nextLevels = {
      ...levels,
      regions: { ...(levels.regions || {}) },
      corridors: { ...(levels.corridors || {}) },
      stairs: { ...(levels.stairs || {}) },
    };
    connectedCorridorIds.forEach((corridorId) => {
      if (isEditorStairLevelOverrideValue(nextLevels.corridors[corridorId], corridorId)) {
        delete nextLevels.corridors[corridorId];
      }
      ["from", "to", "shared"].forEach((endpoint) => {
        const key = stairTransitionKey(corridorId, endpoint);
        if (isEditorStairLevelOverrideValue(nextLevels.stairs[key], corridorId)) {
          delete nextLevels.stairs[key];
        }
      });
    });
    return nextLevels;
  }

  function updateRoomLevel(regionId, level) {
    if (!regionId) return;
    updateManualOverridesWithHistory(
      (current) => {
        const normalized = normalizeManualOverrides(current);
        const levels = removeEditorStairOverridesForRoomLevelChange(
          {
            ...normalized.levels,
            regions: { ...(normalized.levels?.regions || {}) },
            corridors: { ...(normalized.levels?.corridors || {}) },
            stairs: { ...(normalized.levels?.stairs || {}) },
          },
          regionId,
        );
        levels.regions[regionId] = normalizeLevelNumber(level, 0);
        return {
          ...normalized,
          levels,
          stairTransitions: levels.stairs,
        };
      },
      "",
      `updateRoomLevel:${regionId}`
    );
  }

  function resetRoomLevel(regionId) {
    if (!regionId) return;
    updateManualOverridesWithHistory(
      (current) => {
        const normalized = normalizeManualOverrides(current);
        const levels = removeEditorStairOverridesForRoomLevelChange(
          {
            ...normalized.levels,
            regions: { ...(normalized.levels?.regions || {}) },
            corridors: { ...(normalized.levels?.corridors || {}) },
            stairs: { ...(normalized.levels?.stairs || {}) },
          },
          regionId,
        );
        delete levels.regions[regionId];
        return {
          ...normalized,
          levels,
          stairTransitions: levels.stairs,
        };
      },
      "",
      `resetRoomLevel:${regionId}`
    );
  }

  function setGridRenderingStyle(value) {
    setGridStyle(normalizeGridStyle(value || "solid"));
  }

  function setGridRenderingColor(value) {
    setGridColor(normalizeGridColor(value || "default"));
  }

  function setGridRenderingWeight(value) {
    setGridWeight(normalizeGridWeight(value || "normal"));
  }

  function toggleGridVisibility() {
    setShowGrid((current) => {
      const next = !current;
      return next;
    });
  }

  function selectMapRegion(regionId) {
    const nextRegionId = regionId || "";
    if (nextRegionId === selectedRegionId) return;
    setSelectedRegionId(nextRegionId);
    onComposerSelectedRegionChange?.(nextRegionId);
  }

  function getQaRunnerDelay(settings = {}) {
    if (settings.speed === "slow") return 720;
    if (settings.speed === "fast") return 80;
    return 260;
  }

  function sleepQaRunner(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new Error("Scenario stopped."));
        return;
      }
      const timeout = window.setTimeout(resolve, ms);
      const abort = () => {
        window.clearTimeout(timeout);
        signal?.removeEventListener?.("abort", abort);
        reject(new Error("Scenario stopped."));
      };
      signal?.addEventListener?.("abort", abort, { once: true });
    });
  }

  function dispatchQaRunnerStatus(detail = {}) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("cruor:map-qa-runner-status", {
        detail,
      })
    );
  }

  function recordQaRunnerEvent(label, payload = {}, category = "performance") {
    recordDebugEvent(label, payload, {
      category,
      source: "map-qa-runner",
    });
  }

  function getQaRunnerScenarioLabel(scenarioId, fallback = "Map QA Scenario") {
    if (scenarioId === "circle-anchor-sweep") return "Circle Anchor Test";
    if (scenarioId === "corridor-create") return "Corridor Creation Test";
    if (scenarioId === "level-stairs") return "Room Level → Stairs Test";
    if (scenarioId === "level-view") return "Level View Test";
    if (scenarioId === "room-move-reroute") return "Room Move + Reroute";
    if (scenarioId === "smoke") return "Smoke Test";
    return fallback || "Map QA Scenario";
  }

  function setQaRunnerStep(runId, detail = {}) {
    if (qaRunnerSequenceRef.current !== runId) return;
    const nextDetail = {
      state: "running",
      ...detail,
    };
    setQaRunnerOverlay(nextDetail);
    dispatchQaRunnerStatus(nextDetail);
    recordQaRunnerEvent(
      `qa runner: ${detail.stepLabel || detail.message || "step"}`,
      nextDetail,
      detail.category || "performance"
    );
  }

  function finishQaRunner(runId, detail = {}) {
    if (qaRunnerSequenceRef.current !== runId) return;
    const nextDetail = {
      state: detail.state || "passed",
      stepLabel: detail.stepLabel || detail.message || "Complete.",
      message: detail.message || detail.stepLabel || "Complete.",
      ...detail,
    };
    setQaRunnerOverlay(nextDetail);
    dispatchQaRunnerStatus(nextDetail);
    recordQaRunnerEvent(
      `qa runner: ${nextDetail.state}`,
      nextDetail,
      nextDetail.state === "failed" ? "performance" : "generated-map"
    );
  }

  function getQaGeneratedMap() {
    return generatedMapRef.current || generatedMap;
  }

  function getQaCellCenterPoint(cell, gridSize) {
    return {
      x: (Number(cell.x) + 0.5) * gridSize,
      y: (Number(cell.y) + 0.5) * gridSize,
    };
  }

  function getQaRegionCenterPoint(region, gridSize) {
    const rect = region?.cellRect || {};
    return {
      x: (Number(rect.x || 0) + Number(rect.w || 1) / 2) * gridSize,
      y: (Number(rect.y || 0) + Number(rect.h || 1) / 2) * gridSize,
    };
  }

  function getQaRegionCenterCell(region) {
    const rect = region?.cellRect || {};
    return {
      x: Math.floor(Number(rect.x || 0) + Number(rect.w || 1) / 2),
      y: Math.floor(Number(rect.y || 0) + Number(rect.h || 1) / 2),
    };
  }

  function getQaLargestRegion(map = getQaGeneratedMap()) {
    return (
      [...(map?.regions || [])].sort((a, b) => {
        const areaA = Number(a?.cellRect?.w || 0) * Number(a?.cellRect?.h || 0);
        const areaB = Number(b?.cellRect?.w || 0) * Number(b?.cellRect?.h || 0);
        return areaB - areaA;
      })[0] || null
    );
  }

  function getQaScenarioIterationBudget(settings = {}, fallback = 12) {
    if (settings.speed === "fast") return Math.max(6, Math.floor(fallback * 0.55));
    if (settings.speed === "slow") return Math.max(fallback, Math.floor(fallback * 1.45));
    return fallback;
  }

  function getQaCircleSmokeRegionLimit(settings = {}) {
    if (settings.speed === "fast") return 2;
    if (settings.speed === "slow") return 5;
    return 4;
  }

  function getQaCircleSmokeAnchorSteps(settings = {}) {
    if (settings.speed === "fast") return 2;
    if (settings.speed === "slow") return 4;
    return 3;
  }

  function getQaCircleSweepAnchorSteps(settings = {}) {
    if (settings.speed === "fast") return 6;
    if (settings.speed === "slow") return 14;
    return 10;
  }

  function getQaEvenlySpacedItems(items = [], count = items.length) {
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    if (safeItems.length <= count) return safeItems;
    const selected = [];
    const seen = new Set();
    for (let index = 0; index < count; index += 1) {
      const itemIndex = Math.min(
        safeItems.length - 1,
        Math.floor((index * safeItems.length) / count),
      );
      if (seen.has(itemIndex)) continue;
      seen.add(itemIndex);
      selected.push(safeItems[itemIndex]);
    }
    return selected.length > 0 ? selected : safeItems.slice(0, count);
  }

  function getQaCellManhattanDistance(a, b) {
    if (!a || !b) return Number.POSITIVE_INFINITY;
    return Math.abs(Number(a.x || 0) - Number(b.x || 0)) +
      Math.abs(Number(a.y || 0) - Number(b.y || 0));
  }

  function getQaCellSquaredDistance(a, b) {
    if (!a || !b) return Number.POSITIVE_INFINITY;
    const dx = Number(a.x || 0) - Number(b.x || 0);
    const dy = Number(a.y || 0) - Number(b.y || 0);
    return dx * dx + dy * dy;
  }

  function getQaRealisticRoomMoveOffsets(settings = {}) {
    const offsets = [
      { x: 1, y: 0, label: "right-1" },
      { x: 0, y: 1, label: "down-1" },
      { x: -1, y: 0, label: "left-1" },
      { x: 0, y: -1, label: "up-1" },
      { x: 1, y: 1, label: "down-right-1" },
    ];
    if (settings.speed === "fast") return offsets.slice(0, 2);
    if (settings.speed === "slow") return offsets;
    return offsets.slice(0, 3);
  }


  function getQaRegionRect(region) {
    const rect = region?.cellRect || {};
    return {
      x: Number(rect.x || 0),
      y: Number(rect.y || 0),
      w: Math.max(1, Number(rect.w || 1)),
      h: Math.max(1, Number(rect.h || 1)),
    };
  }

  function getQaConnectedRegions(regionId, map = getQaGeneratedMap()) {
    if (!regionId) return [];
    const regionsById = new Map((map?.regions || []).map((region) => [region.id, region]));
    return (map?.corridors || [])
      .map((corridor) => {
        if (corridor?.from === regionId) return regionsById.get(corridor.to) || null;
        if (corridor?.to === regionId) return regionsById.get(corridor.from) || null;
        return null;
      })
      .filter(Boolean);
  }

  function getQaClusterBounds(regions = []) {
    const rects = regions.map(getQaRegionRect).filter((rect) => rect.w > 0 && rect.h > 0);
    if (!rects.length) return null;
    const minX = Math.min(...rects.map((rect) => rect.x));
    const minY = Math.min(...rects.map((rect) => rect.y));
    const maxX = Math.max(...rects.map((rect) => rect.x + rect.w));
    const maxY = Math.max(...rects.map((rect) => rect.y + rect.h));
    return {
      minX,
      minY,
      maxX,
      maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };
  }

  function getQaClampRoomTarget(target, region, map = getQaGeneratedMap()) {
    const rect = getQaRegionRect(region);
    const gridWidth = Number(map?.config?.gridWidth || map?.config?.columns || 80);
    const gridHeight = Number(map?.config?.gridHeight || map?.config?.rows || 50);
    const margin = 1;
    return {
      x: Math.max(margin, Math.min(gridWidth - rect.w - margin, Math.round(Number(target.x || 0)))),
      y: Math.max(margin, Math.min(gridHeight - rect.h - margin, Math.round(Number(target.y || 0)))),
    };
  }

  function getQaRectCenterCellFromRect(rect) {
    return {
      x: Number(rect.x || 0) + Number(rect.w || 1) / 2,
      y: Number(rect.y || 0) + Number(rect.h || 1) / 2,
    };
  }

  function getQaCompactRoomTargets(region, map = getQaGeneratedMap(), settings = {}) {
    const rect = getQaRegionRect(region);
    const connectedRegions = getQaConnectedRegions(region?.id, map);
    const allOtherRegions = (map?.regions || []).filter((item) => item?.id && item.id !== region?.id);
    const neighbors = allOtherRegions.length ? allOtherRegions : connectedRegions;
    const cluster = getQaClusterBounds(neighbors);
    const connectedCluster = getQaClusterBounds(connectedRegions);
    if (!cluster) return [];

    const gap = settings.speed === "fast" ? 1 : 2;
    const looseGap = settings.speed === "slow" ? 4 : 3;
    const yNearCluster = Math.round(cluster.centerY - rect.h / 2);
    const xNearCluster = Math.round(cluster.centerX - rect.w / 2);
    const rawTargets = [
      { x: cluster.maxX + gap, y: yNearCluster, label: "right-of-cluster" },
      { x: cluster.maxX + gap, y: cluster.maxY - rect.h, label: "right-lower-overlap" },
      { x: cluster.maxX + gap, y: cluster.minY, label: "right-upper-overlap" },
      { x: cluster.maxX + looseGap, y: yNearCluster, label: "right-of-cluster-loose" },
      { x: xNearCluster, y: cluster.maxY + gap, label: "below-cluster" },
      { x: xNearCluster, y: cluster.minY - rect.h - gap, label: "above-cluster" },
      { x: cluster.minX - rect.w - gap, y: yNearCluster, label: "left-of-cluster" },
    ];

    const current = { x: rect.x, y: rect.y };
    const clusterCenter = { x: cluster.centerX, y: cluster.centerY };
    const connectedCenter = connectedCluster
      ? { x: connectedCluster.centerX, y: connectedCluster.centerY }
      : clusterCenter;
    const seen = new Set();
    return rawTargets
      .map((target) => ({
        ...getQaClampRoomTarget(target, region, map),
        label: target.label,
      }))
      .filter((target) => {
        const key = `${target.x}:${target.y}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return target.x !== current.x || target.y !== current.y;
      })
      .map((target) => {
        const targetCenter = {
          x: target.x + rect.w / 2,
          y: target.y + rect.h / 2,
        };
        const clusterDistance = getQaCellSquaredDistance(targetCenter, clusterCenter);
        const connectedDistance = getQaCellSquaredDistance(targetCenter, connectedCenter);
        const currentDistance = getQaCellSquaredDistance(target, current);
        const detachedPenalty = target.x > cluster.maxX + looseGap || target.y < cluster.minY - rect.h - looseGap
          ? 24
          : 0;
        return {
          ...target,
          score: clusterDistance + connectedDistance * 0.35 + currentDistance * 0.08 + detachedPenalty,
          connectedRegionIds: connectedRegions.map((item) => item.id),
          neighborRegionIds: neighbors.map((item) => item.id),
        };
      })
      .sort((a, b) => a.score - b.score);
  }


  function getQaClosestConnectedRegionDistance(region, map = getQaGeneratedMap()) {
    const rect = getQaRegionRect(region);
    const regionCenter = getQaRectCenterCellFromRect(rect);
    const connectedRegions = getQaConnectedRegions(region?.id, map);
    if (!connectedRegions.length) return null;
    return connectedRegions
      .map((connectedRegion) => {
        const connectedRect = getQaRegionRect(connectedRegion);
        const connectedCenter = getQaRectCenterCellFromRect(connectedRect);
        return {
          regionId: connectedRegion.id,
          distance: Math.abs(regionCenter.x - connectedCenter.x) + Math.abs(regionCenter.y - connectedCenter.y),
          region: summarizeDebugRegion(connectedRegion),
        };
      })
      .sort((a, b) => a.distance - b.distance)[0] || null;
  }

  function assertQaRegionNearConnectedCluster(region, map = getQaGeneratedMap(), settings = {}, context = {}) {
    const nearest = getQaClosestConnectedRegionDistance(region, map);
    if (!nearest) return;
    const maxDistance = settings.speed === "slow" ? 30 : settings.speed === "fast" ? 22 : 24;
    if (nearest.distance > maxDistance) {
      recordQaDiagnostic("smoke layout became too sparse", {
        context,
        maxDistance,
        nearest,
        region: summarizeDebugRegion(region),
        topology: summarizeQaCorridorTopology(map),
      }, "room-move");
    }
    assertQa(
      nearest.distance <= maxDistance,
      "Smoke Test produced an unrealistically sparse layout.",
      {
        context,
        maxDistance,
        nearest,
        region: summarizeDebugRegion(region),
        topology: summarizeQaCorridorTopology(map),
      }
    );
  }

  function getQaCircleAnchorPhysicalSortCell(anchor) {
    return (
      anchor?.corridorStartCell ||
      anchor?.routingOutsideCell ||
      anchor?.outsideCell ||
      anchor?.raccordoCell ||
      anchor?.cell ||
      anchor?.portalRoomCell ||
      null
    );
  }

  function getQaRealisticNearbyCircleAnchors(
    region,
    corridor,
    endpoint,
    map = getQaGeneratedMap(),
    settings = {},
    preferredSideOverride = null,
  ) {
    const currentAnchor = getDebugCorridorAnchor(corridor, endpoint) || getQaCorridorDoor(corridor, endpoint);
    const preferredSide = preferredSideOverride || currentAnchor?.side || null;
    const candidates = getQaCircleAnchorSweepAnchors(region, map, preferredSide);
    if (!candidates.length) return [];
    const maxDistance = settings.speed === "slow" ? 3 : 2;
    const candidateEntries = candidates
      .map((anchor) => ({ anchor, cell: getQaCircleAnchorSortCell(anchor) }))
      .filter((entry) => entry.cell);
    const identityCell = getQaCircleAnchorSortCell(currentAnchor);
    const physicalCell = getQaCircleAnchorPhysicalSortCell(currentAnchor);
    const hasNearbyIdentityCandidate =
      identityCell &&
      candidateEntries.some(
        (entry) =>
          getQaCellManhattanDistance(entry.cell, identityCell) > 0 &&
          getQaCellManhattanDistance(entry.cell, identityCell) <= maxDistance,
      );
    const currentCell = hasNearbyIdentityCandidate ? identityCell : physicalCell || identityCell;
    if (!currentCell) return [];
    const otherRegionId = endpoint === "from" ? corridor?.to : corridor?.from;
    const otherRegion = (map?.regions || []).find((item) => item?.id === otherRegionId) || null;
    const otherCenter = otherRegion ? getQaRectCenterCellFromRect(getQaRegionRect(otherRegion)) : null;
    const scoreNearbyAnchor = (entry, allowSideFallback = false) => {
      const sideMismatch = preferredSide && entry.anchor?.side !== preferredSide;
      const sameSidePenalty = sideMismatch ? (allowSideFallback ? 180 : 1000) : 0;
      const currentDistance = getQaCellSquaredDistance(entry.cell, currentCell);
      const otherDistance = otherCenter ? getQaCellSquaredDistance(entry.cell, otherCenter) : 0;
      const verticalUpPenalty = (preferredSide === "west" || preferredSide === "east") && entry.cell.y < currentCell.y
        ? 8
        : 0;
      const horizontalAwayPenalty = preferredSide === "north" || preferredSide === "south"
        ? Math.max(0, Math.abs(entry.cell.x - currentCell.x) - 1) * 3
        : 0;
      const staleIdentityPenalty = !hasNearbyIdentityCandidate && identityCell
        ? getQaCellSquaredDistance(entry.cell, identityCell) * 0.03
        : 0;
      return (
        sameSidePenalty +
        currentDistance +
        otherDistance * 0.08 +
        verticalUpPenalty +
        horizontalAwayPenalty +
        staleIdentityPenalty
      );
    };
    const movableEntries = candidateEntries
      .filter((entry) => getQaCellManhattanDistance(entry.cell, currentCell) > 0);
    const ranked = movableEntries
      .filter((entry) => getQaCellManhattanDistance(entry.cell, currentCell) <= maxDistance)
      .filter((entry) => !preferredSide || entry.anchor?.side === preferredSide)
      .sort((a, b) => {
        const scoreA = scoreNearbyAnchor(a);
        const scoreB = scoreNearbyAnchor(b);
        if (scoreA !== scoreB) return scoreA - scoreB;
        if (a.cell.y !== b.cell.y) return b.cell.y - a.cell.y;
        return Math.abs(a.cell.x - currentCell.x) - Math.abs(b.cell.x - currentCell.x);
      });
    const fallbackRanked = ranked.length >= 2
      ? ranked
      : movableEntries
          .filter((entry) => getQaCellManhattanDistance(entry.cell, currentCell) <= maxDistance)
          .sort((a, b) => scoreNearbyAnchor(a, true) - scoreNearbyAnchor(b, true));
    const recoveryRanked = fallbackRanked.length > 0
      ? fallbackRanked
      : movableEntries.sort((a, b) => scoreNearbyAnchor(a, true) - scoreNearbyAnchor(b, true));
    const selected = [];
    const seen = new Set();
    for (const entry of recoveryRanked) {
      const anchor = entry.anchor;
      const cell = entry.cell;
      const key = `${anchor?.side || "side"}:${cell?.x}:${cell?.y}`;
      if (!cell || seen.has(key)) continue;
      seen.add(key);
      selected.push(anchor);
      if (selected.length >= getQaCircleSmokeAnchorSteps(settings)) break;
    }
    return selected;
  }

  function getQaCircleSmokeCandidateRegions(map = getQaGeneratedMap(), settings = {}) {
    const regions = [...(map?.regions || [])]
      .filter((region) => region && getQaCorridorForRegion(region.id, map))
      .sort((a, b) => {
        const areaA = Number(a?.cellRect?.w || 0) * Number(a?.cellRect?.h || 0);
        const areaB = Number(b?.cellRect?.w || 0) * Number(b?.cellRect?.h || 0);
        if (areaA !== areaB) return areaB - areaA;
        return String(a?.id || "").localeCompare(String(b?.id || ""));
      });
    return regions.slice(0, getQaCircleSmokeRegionLimit(settings));
  }

  function getQaCircleMoveOffsets(settings = {}) {
    const baseOffsets = [
      { x: 1, y: 0, label: "right-1" },
      { x: -1, y: 0, label: "left-1" },
      { x: 0, y: 1, label: "down-1" },
      { x: 0, y: 3, label: "down-3" },
      { x: 1, y: 4, label: "down-right-4" },
      { x: -1, y: 4, label: "down-left-4" },
      { x: 0, y: 6, label: "deep-down" },
      { x: 0, y: -1, label: "up-1" },
      { x: 0, y: -3, label: "up-3" },
      { x: 2, y: 2, label: "down-right-2" },
      { x: -2, y: 2, label: "down-left-2" },
      { x: 2, y: -2, label: "up-right-2" },
      { x: -2, y: -2, label: "up-left-2" },
    ];
    return getQaEvenlySpacedItems(
      baseOffsets,
      getQaScenarioIterationBudget(settings, settings.speed === "fast" ? 7 : 13),
    );
  }

  function assertQaMapValidationPasses(map = getQaGeneratedMap(), context = {}) {
    const validation = validateGeneratedMap(map, map?.config || config);
    const failedTests = (validation?.tests || []).filter((test) => !test?.passed);
    if (failedTests.length > 0 || validation?.errors?.length > 0) {
      recordQaDiagnostic("structural validation failed", {
        context,
        failedTests: failedTests.map((test) => ({
          id: test.id,
          label: test.label,
          details: test.details,
        })),
        errors: validation?.errors || [],
        warnings: validation?.warnings || [],
        metrics: validation?.metrics || null,
        ...summarizeQaCorridorTopology(map),
      });
    }
    assertQa(
      failedTests.length === 0 && (validation?.errors || []).length === 0,
      "Scenario Runner structural validation failed.",
      {
        context,
        failedTests: failedTests.map((test) => ({
          id: test.id,
          label: test.label,
          details: test.details,
        })),
        errors: validation?.errors || [],
        warnings: validation?.warnings || [],
        metrics: validation?.metrics || null,
        ...summarizeQaCorridorTopology(map),
      },
    );
  }

  function getQaCorridorForRegion(regionId, map = getQaGeneratedMap()) {
    return (
      (map?.corridors || []).find(
        (corridor) => corridor?.from === regionId || corridor?.to === regionId
      ) || null
    );
  }

  function getQaCorridorForPair(fromRegionId, toRegionId, map = getQaGeneratedMap()) {
    const pair = [fromRegionId, toRegionId].sort().join("::");
    return (
      (map?.corridors || []).find(
        (corridor) => [corridor?.from, corridor?.to].sort().join("::") === pair
      ) || null
    );
  }

  function getQaEndpointForRegion(corridor, regionId) {
    if (!corridor || !regionId) return "from";
    return corridor.from === regionId ? "from" : "to";
  }

  function getQaCorridorDoor(corridor, endpoint) {
    return (corridor?.doors || []).find((door) => door?.endpoint === endpoint) || null;
  }

  function getQaCircleAnchorForOutsideCell(region, outsideCell, map = getQaGeneratedMap()) {
    if (!region || region.shape !== "circle" || !outsideCell) return null;
    const gridSize = map?.config?.gridSize || config.gridSize || 20;
    const circle = getCircleGeometryFromRegion(region, gridSize);
    return createCircleConnectionAnchorFromOutsideCell(region, circle, outsideCell, gridSize);
  }

  function getQaCircleAnchorSortCell(anchor) {
    return (
      anchor?.snapCell ||
      anchor?.originalCell ||
      anchor?.cell ||
      anchor?.portalRoomCell ||
      anchor?.routingOutsideCell ||
      anchor?.outsideCell ||
      null
    );
  }

  function summarizeQaCircleAnchorCandidate(anchor) {
    const cell = getQaCircleAnchorSortCell(anchor);
    return {
      side: anchor?.side || null,
      sortCell: summarizeDebugCell(cell),
      anchor: summarizeDebugAnchor(anchor),
    };
  }

  function getQaCircleAnchorSweepAnchors(region, map = getQaGeneratedMap(), preferredSide = null) {
    if (!region || region.shape !== "circle") return [];
    const gridSize = map?.config?.gridSize || config.gridSize || 20;
    const circle = getCircleGeometryFromRegion(region, gridSize);
    if (!circle) return [];
    const candidates = createCircleConnectionAnchorCandidates(region, circle, gridSize);
    const unique = [];
    const seen = new Set();
    candidates.forEach((anchor) => {
      const cell = getQaCircleAnchorSortCell(anchor);
      if (!cell) return;
      const key = `${anchor.side || "side"}:${cell.x}:${cell.y}`;
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(anchor);
    });
    const sideFiltered = preferredSide
      ? unique.filter((anchor) => anchor.side === preferredSide)
      : [];
    const pool = sideFiltered.length >= 2 ? sideFiltered : unique;
    return [...pool].sort((a, b) => {
      const cellA = getQaCircleAnchorSortCell(a) || { x: 0, y: 0 };
      const cellB = getQaCircleAnchorSortCell(b) || { x: 0, y: 0 };
      if ((a.side || "") !== (b.side || "")) return String(a.side || "").localeCompare(String(b.side || ""));
      if (cellA.y !== cellB.y) return cellA.y - cellB.y;
      if (cellA.x !== cellB.x) return cellA.x - cellB.x;
      return (a.finalBoundaryIndex || 0) - (b.finalBoundaryIndex || 0);
    });
  }

  function summarizeQaCircleAnchorAvailability(region, map = getQaGeneratedMap(), preferredSide = null) {
    const gridSize = map?.config?.gridSize || config.gridSize || 20;
    const circle = region ? getCircleGeometryFromRegion(region, gridSize) : null;
    const candidates = region?.shape === "circle" && circle
      ? createCircleConnectionAnchorCandidates(region, circle, gridSize)
      : [];
    const bySide = candidates.reduce((acc, anchor) => {
      const side = anchor?.side || "unknown";
      acc[side] = (acc[side] || 0) + 1;
      return acc;
    }, {});
    const sweepAnchors = getQaCircleAnchorSweepAnchors(region, map, preferredSide);
    return {
      region: summarizeDebugRegion(region),
      circle: circle
        ? {
            cx: roundDebugNumber(circle.cx),
            cy: roundDebugNumber(circle.cy),
            r: roundDebugNumber(circle.r),
            cxCells: roundDebugNumber(circle.cxCells),
            cyCells: roundDebugNumber(circle.cyCells),
            rCells: roundDebugNumber(circle.rCells),
          }
        : null,
      candidateCount: candidates.length,
      bySide,
      preferredSide: preferredSide || null,
      sweepCount: sweepAnchors.length,
      sample: sweepAnchors.slice(0, 12).map(summarizeQaCircleAnchorCandidate),
    };
  }

  async function waitForQaRender(signal, settings = {}) {
    await sleepQaRunner(getQaRunnerDelay(settings), signal);
    await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
  }

  function assertQa(condition, message, payload = {}) {
    if (condition) return;
    const error = new Error(message);
    error.payload = payload;
    throw error;
  }

  function getQaCorridorPairDuplicates(map = getQaGeneratedMap()) {
    const seen = new Map();
    (map?.corridors || []).forEach((corridor) => {
      const pair = [corridor.from, corridor.to].filter(Boolean).sort().join("::");
      if (!pair) return;
      const current = seen.get(pair) || [];
      current.push(corridor);
      seen.set(pair, current);
    });
    return [...seen.entries()]
      .map(([pair, corridors]) => {
        const generatedCorridors = corridors.filter((corridor) => !isManualConnectionLike(corridor));
        return [pair, generatedCorridors];
      })
      .filter(([, corridors]) => corridors.length > 1)
      .map(([pair, corridors]) => [pair, corridors.map((corridor) => corridor.id)]);
  }

  function getQaRepairCorridors(map = getQaGeneratedMap()) {
    return (map?.corridors || []).filter((corridor) =>
      String(corridor?.id || "").startsWith("physical-repair-") ||
      String(corridor?.id || "").startsWith("physical-force-repair-") ||
      String(corridor?.reason || "").includes("physical-connectivity")
    );
  }

  function getQaCorridorCellSet(corridor) {
    return new Set(
      (Array.isArray(corridor?.floorCells) ? corridor.floorCells : [])
        .filter((cell) => Number.isFinite(cell?.x) && Number.isFinite(cell?.y))
        .map((cell) => cellKey(cell.x, cell.y)),
    );
  }

  function getQaCorridorCellDegree(cell, cellSet) {
    return getCellNeighbors(cell).filter((neighbor) =>
      cellSet.has(cellKey(neighbor.x, neighbor.y)),
    ).length;
  }

  function getQaCorridorPathContinuityIssues(corridor) {
    const cells = Array.isArray(corridor?.pathCells) && corridor.pathCells.length > 0
      ? corridor.pathCells
      : corridor?.floorCells || [];
    const issues = [];
    for (let index = 1; index < cells.length; index += 1) {
      const previous = cells[index - 1];
      const current = cells[index];
      if (!previous || !current) continue;
      const distance = Math.abs(previous.x - current.x) + Math.abs(previous.y - current.y);
      if (distance <= 1) continue;
      issues.push({
        type: "discontinuous-corridor-path",
        index,
        previous: summarizeDebugCell(previous),
        current: summarizeDebugCell(current),
        distance,
      });
    }
    return issues;
  }

  function getQaCorridorBranchIssues(corridor) {
    if (
      corridor?.isRoomLink ||
      corridor?.roomTraversal ||
      corridor?.surfaceKind === "cave" ||
      corridor?.corridorStyle === "natural-tunnel"
    )
      return [];
    const cellSet = getQaCorridorCellSet(corridor);
    if (cellSet.size <= 2) return [];
    const cells = [...cellSet].map(parseCellKey);
    const branchCells = cells
      .map((cell) => ({
        cell,
        degree: getQaCorridorCellDegree(cell, cellSet),
      }))
      .filter((entry) => entry.degree > 2);
    return branchCells.map((entry) => ({
      type: "branched-corridor-floor",
      cell: summarizeDebugCell(entry.cell),
      degree: entry.degree,
    }));
  }

  function getQaCorridorVisualTopologyIssues(map = getQaGeneratedMap()) {
    return (map?.corridors || []).flatMap((corridor) => {
      const issues = [
        ...getQaCorridorPathContinuityIssues(corridor),
        ...getQaCorridorBranchIssues(corridor),
      ];
      if (issues.length === 0) return [];
      return [{
        corridorId: corridor.id,
        from: corridor.from,
        to: corridor.to,
        issues,
        corridor: summarizeDebugCorridor(corridor),
      }];
    });
  }

  function assertQaNoVisualCorridorTopologyIssues(map = getQaGeneratedMap(), context = {}) {
    const visualIssues = getQaCorridorVisualTopologyIssues(map);
    if (visualIssues.length) {
      recordQaDiagnostic("visual corridor topology issues detected", {
        visualIssues,
        context,
        ...summarizeQaCorridorTopology(map),
      });
    }
    assertQa(!visualIssues.length, "Visual corridor topology is invalid.", {
      visualIssues,
      context,
      ...summarizeQaCorridorTopology(map),
    });
  }

  function summarizeQaCorridorTopology(map = getQaGeneratedMap()) {
    return {
      corridorCount: map?.corridors?.length || 0,
      corridors: (map?.corridors || []).map(summarizeDebugCorridor),
      repairCorridors: getQaRepairCorridors(map).map(summarizeDebugCorridor),
      visualIssues: getQaCorridorVisualTopologyIssues(map),
      manualOverrides: summarizeDebugManualOverrides(manualOverridesRef.current),
    };
  }

  function recordQaDiagnostic(label, payload = {}, category = "generated-map") {
    recordQaRunnerEvent(`qa diagnostics: ${label}`, payload, category);
  }

  function assertQaNoDuplicateCorridors(map = getQaGeneratedMap(), context = {}) {
    const duplicates = getQaCorridorPairDuplicates(map);
    if (duplicates.length) {
      recordQaDiagnostic("duplicate corridors detected", {
        duplicates,
        context,
        ...summarizeQaCorridorTopology(map),
      });
    }
    assertQa(!duplicates.length, "Duplicate corridors between the same room pair.", {
      duplicates,
      context,
      ...summarizeQaCorridorTopology(map),
    });
  }

  async function runQaCircleAnchorSweep(
    runId,
    signal,
    settings = {},
    scenarioLabel = "Circle Anchor Test",
    options = {},
  ) {
    let map = getQaGeneratedMap();
    let region = options.regionId
      ? map?.regions?.find((item) => item.id === options.regionId)
      : null;
    if (!region) region = getQaLargestRegion(map);
    if (region && !getQaCorridorForRegion(region.id, map)) {
      region = getQaCircleSmokeCandidateRegions(map, settings)[0] || region;
    }
    assertQa(region, "No region available for circle anchor test.");

    setQaRunnerStep(runId, {
      scenarioLabel,
      stepLabel: `Prepare ${region.label || region.id} as a circle`,
      targetRegionId: region.id,
      category: "room-style",
    });
    if (options.prepare !== false || region.shape !== "circle") {
      updateRoomStyle(region.id, {
        shape: "circle",
        sizePreset: options.sizePreset || "Large",
        customSize: null,
      });
      await waitForQaRender(signal, settings);
    }

    map = getQaGeneratedMap();
    region = map.regions.find((item) => item.id === region.id) || region;
    assertQa(region?.shape === "circle", "Target room did not become circular.", {
      region: summarizeDebugRegion(region),
    });
    assertQaMapValidationPasses(map, {
      scenarioLabel,
      phase: "circle-prepared",
      region: summarizeDebugRegion(region),
    });

    const corridor = getQaCorridorForRegion(region.id, map);
    assertQa(corridor, "No corridor connected to the circular test room.", { regionId: region.id });
    const initialEndpoint = getQaEndpointForRegion(corridor, region.id);
    const initialDoor = getQaCorridorDoor(corridor, initialEndpoint);
    const preferredSide = Object.prototype.hasOwnProperty.call(options, "preferredSide")
      ? options.preferredSide
      : initialDoor?.side || null;
    const anchorStrategy = options.anchorStrategy || "distributed";
    const fixedNearbyPreferredSide = anchorStrategy === "nearby" ? preferredSide : null;
    const initialAnchors = anchorStrategy === "nearby"
      ? getQaRealisticNearbyCircleAnchors(
          region,
          corridor,
          initialEndpoint,
          map,
          settings,
          fixedNearbyPreferredSide,
        )
      : getQaCircleAnchorSweepAnchors(region, map, preferredSide);
    const requestedStepCount = options.stepCount || (anchorStrategy === "nearby"
      ? getQaCircleSmokeAnchorSteps(settings)
      : getQaCircleSweepAnchorSteps(settings));
    const stepCount = Math.min(initialAnchors.length, requestedStepCount);
    recordQaDiagnostic("circle anchor availability", {
      phase: "before-sweep",
      corridor: summarizeDebugCorridor(corridor),
      endpoint: initialEndpoint,
      preferredSide,
      anchorStrategy,
      requestedStepCount,
      stepCount,
      availability: summarizeQaCircleAnchorAvailability(region, map, preferredSide),
    }, "anchor-trace");
    assertQa(stepCount >= 2, "Not enough reachable circle anchors for sweep.", {
      preferredSide,
      availability: summarizeQaCircleAnchorAvailability(region, map, preferredSide),
    });

    for (let index = 0; index < stepCount; index += 1) {
      map = getQaGeneratedMap();
      region = map.regions.find((item) => item.id === region.id) || region;
      const currentCorridor =
        map.corridors.find((item) => item.id === corridor.id) ||
        getQaCorridorForPair(corridor.from, corridor.to, map) ||
        corridor;
      const endpoint = getQaEndpointForRegion(currentCorridor, region.id);
      const anchors = anchorStrategy === "nearby"
        ? getQaRealisticNearbyCircleAnchors(
            region,
            currentCorridor,
            endpoint,
            map,
            settings,
            fixedNearbyPreferredSide,
          )
        : getQaCircleAnchorSweepAnchors(region, map, preferredSide);
      const anchorIndex = anchorStrategy === "nearby"
        ? 0
        : Math.min(
            Math.max(0, anchors.length - 1),
            Math.floor((index * Math.max(1, anchors.length)) / Math.max(1, stepCount)),
          );
      const anchor = anchors[anchorIndex] || null;
      const cell = getQaCircleAnchorSortCell(anchor);
      if (!anchor) {
        recordQaDiagnostic("circle anchor build failed", {
          stepIndex: index,
          preferredSide,
          availability: summarizeQaCircleAnchorAvailability(region, map, preferredSide),
          corridor: summarizeDebugCorridor(currentCorridor),
          topology: summarizeQaCorridorTopology(map),
        }, "anchor-trace");
      }
      assertQa(anchor, "Could not build circle anchor for target cell.", {
        preferredSide,
        availability: summarizeQaCircleAnchorAvailability(region, map, preferredSide),
        corridor: summarizeDebugCorridor(currentCorridor),
      });
      const point =
        anchor.point ||
        getAnchorHandlePoint(anchor, map.config.gridSize) ||
        getQaCellCenterPoint(cell, map.config.gridSize);
      setQaRunnerStep(runId, {
        scenarioLabel,
        stepLabel: `Move anchor ${index + 1}/${stepCount} to cell ${cell.x},${cell.y}`,
        targetRegionId: region.id,
        targetCorridorId: currentCorridor.id,
        targetCell: cell,
        targetPoint: roundDebugPoint(point),
        category: "anchor-trace",
      });
      recordQaDiagnostic("before anchor move", {
        stepIndex: index,
        corridorId: currentCorridor.id,
        endpoint,
        targetCell: summarizeDebugCell(cell),
        targetAnchor: summarizeDebugAnchor(anchor),
        corridor: summarizeDebugCorridor(currentCorridor),
        topology: summarizeQaCorridorTopology(map),
      }, "anchor-trace");
      const committed = moveDoor(currentCorridor.id, endpoint, point, anchor, {
        releasePoint: point,
        releaseCell: cell,
        snapPoint: point,
        snapCell: anchor.snapCell || cell,
        snapAnchor: anchor,
      });
      assertQa(committed, "moveDoor did not commit a new anchor.", {
        corridorId: currentCorridor.id,
        endpoint,
        cell,
        anchor: summarizeDebugAnchor(anchor),
        topology: summarizeQaCorridorTopology(map),
      });
      await waitForQaRender(signal, settings);
      map = getQaGeneratedMap();
      const updatedCorridor =
        map.corridors.find((item) => item.id === currentCorridor.id) ||
        getQaCorridorForPair(currentCorridor.from, currentCorridor.to, map);
      const updatedEndpoint = getQaEndpointForRegion(updatedCorridor, region.id);
      const updatedDoor = getQaCorridorDoor(updatedCorridor, updatedEndpoint);
      const updatedEndpointAnchor = getDebugCorridorAnchor(updatedCorridor, updatedEndpoint);
      const renderedLogicalAnchor = updatedEndpointAnchor || updatedDoor;
      recordQaDiagnostic("after anchor move", {
        stepIndex: index,
        corridorId: updatedCorridor?.id || currentCorridor.id,
        endpoint: updatedEndpoint,
        requestedAnchor: summarizeDebugAnchor(anchor),
        renderedEndpointAnchor: summarizeDebugAnchor(updatedEndpointAnchor),
        renderedDoor: summarizeDebugAnchor(updatedDoor),
        renderedCorridor: summarizeDebugCorridor(updatedCorridor),
        topology: summarizeQaCorridorTopology(map),
        duplicates: getQaCorridorPairDuplicates(map),
      }, "anchor-trace");
      const requestedIdentityCell = getQaCircleAnchorSortCell(anchor);
      const renderedIdentityCell = getQaCircleAnchorSortCell(renderedLogicalAnchor);
      const logicalSnapRetained =
        renderedIdentityCell?.x === requestedIdentityCell?.x &&
        renderedIdentityCell?.y === requestedIdentityCell?.y;
      const physicalSideChanged =
        Boolean(anchor?.side && renderedLogicalAnchor?.side && renderedLogicalAnchor.side !== anchor.side);
      if (logicalSnapRetained && physicalSideChanged) {
        recordQaDiagnostic("circle anchor physical side adjusted", {
          corridorId: updatedCorridor?.id || currentCorridor.id,
          endpoint: updatedEndpoint,
          requestedSide: anchor?.side || null,
          renderedSide: renderedLogicalAnchor?.side || null,
          requestedAnchor: summarizeDebugAnchor(anchor),
          renderedEndpointAnchor: summarizeDebugAnchor(updatedEndpointAnchor),
          renderedDoor: summarizeDebugAnchor(updatedDoor),
        }, "anchor-trace");
      }
      assertQa(
        logicalSnapRetained,
        "Rendered corridor endpoint did not retain the requested logical circle anchor snap cell.",
        {
          corridorId: updatedCorridor?.id || currentCorridor.id,
          endpoint: updatedEndpoint,
          requestedAnchor: summarizeDebugAnchor(anchor),
          requestedIdentityCell: summarizeDebugCell(requestedIdentityCell),
          renderedEndpointAnchor: updatedEndpointAnchor,
          renderedDoor: updatedDoor,
          renderedIdentityCell: summarizeDebugCell(renderedIdentityCell),
          renderedCorridor: summarizeDebugCorridor(updatedCorridor),
          topology: summarizeQaCorridorTopology(map),
        }
      );
      const checkContext = {
        stepIndex: index,
        scenarioLabel,
        targetCell: summarizeDebugCell(cell),
        targetAnchor: summarizeDebugAnchor(anchor),
      };
      assertQaNoDuplicateCorridors(map, checkContext);
      assertQaNoVisualCorridorTopologyIssues(map, checkContext);
      assertQaMapValidationPasses(map, checkContext);
    }
  }

  async function runQaCircleRoomMoveMatrix(
    runId,
    signal,
    settings = {},
    scenarioLabel = "Circle Room Move Matrix",
    regionId = "",
  ) {
    let map = getQaGeneratedMap();
    let region = map?.regions?.find((item) => item.id === regionId) || null;
    assertQa(region, "No circular region available for move matrix.", { regionId });
    if (region.shape !== "circle") {
      updateRoomStyle(region.id, { shape: "circle", sizePreset: "Large", customSize: null });
      await waitForQaRender(signal, settings);
      map = getQaGeneratedMap();
      region = map?.regions?.find((item) => item.id === region.id) || region;
    }

    const base = { x: region.cellRect.x, y: region.cellRect.y };
    const attempts = [];
    let successfulMoves = 0;
    let successfulDownMoves = 0;

    for (const offset of getQaCircleMoveOffsets(settings)) {
      map = getQaGeneratedMap();
      region = map?.regions?.find((item) => item.id === region.id) || region;
      const target = {
        x: base.x + offset.x,
        y: base.y + offset.y,
      };
      setQaRunnerStep(runId, {
        scenarioLabel,
        stepLabel: `Move circular room ${region.label || region.id}: ${offset.label}`,
        targetRegionId: region.id,
        targetCell: target,
        category: "room-move",
      });
      const moved = moveRoom(region.id, target);
      attempts.push({ label: offset.label, target, moved: moved !== null });
      if (moved === null) {
        recordQaDiagnostic("circle room move skipped", {
          region: summarizeDebugRegion(region),
          offset,
          target,
          reason: "moveRoom returned null",
          attempts,
        }, "room-move");
        continue;
      }
      successfulMoves += 1;
      if (offset.y > 0) successfulDownMoves += 1;
      await waitForQaRender(signal, settings);
      map = getQaGeneratedMap();
      const checkContext = {
        scenarioLabel,
        phase: "circle-room-move",
        regionId: region.id,
        offset,
        target,
        attempts,
      };
      assertQaNoDuplicateCorridors(map, checkContext);
      assertQaNoVisualCorridorTopologyIssues(map, checkContext);
      assertQaMapValidationPasses(map, checkContext);
    }

    assertQa(successfulMoves > 0, "Circle room move matrix could not move the room at all.", {
      regionId: region.id,
      attempts,
    });
    assertQa(successfulDownMoves > 0, "Circle room move matrix did not execute any downward move.", {
      regionId: region.id,
      attempts,
    });
  }

  async function runQaRealisticRoomStyleStep(
    runId,
    signal,
    settings = {},
    scenarioLabel = "Smoke Test",
    regionId = "",
    patch = {},
    label = "Update room style",
  ) {
    let map = getQaGeneratedMap();
    let region = map?.regions?.find((item) => item.id === regionId) || null;
    assertQa(region, "No room available for realistic style step.", { regionId, patch });
    setQaRunnerStep(runId, {
      scenarioLabel,
      stepLabel: `${label}: ${region.label || region.id}`,
      targetRegionId: region.id,
      category: "room-style",
    });
    updateRoomStyle(region.id, patch);
    await waitForQaRender(signal, settings);
    map = getQaGeneratedMap();
    region = map?.regions?.find((item) => item.id === regionId) || region;
    const checkContext = {
      scenarioLabel,
      phase: "realistic-room-style",
      regionId,
      patch,
      region: summarizeDebugRegion(region),
    };
    recordQaDiagnostic("realistic room style step", checkContext, "room-style");
    assertQaNoDuplicateCorridors(map, checkContext);
    assertQaNoVisualCorridorTopologyIssues(map, checkContext);
    assertQaMapValidationPasses(map, checkContext);
    return region;
  }

  async function runQaRealisticRoomMoveStep(
    runId,
    signal,
    settings = {},
    scenarioLabel = "Smoke Test",
    regionId = "",
    offset = { x: 1, y: 0, label: "right-1" },
  ) {
    let map = getQaGeneratedMap();
    const region = map?.regions?.find((item) => item.id === regionId) || null;
    assertQa(region, "No room available for realistic move step.", { regionId, offset });
    const target = {
      x: Number(region.cellRect?.x || 0) + Number(offset.x || 0),
      y: Number(region.cellRect?.y || 0) + Number(offset.y || 0),
    };
    setQaRunnerStep(runId, {
      scenarioLabel,
      stepLabel: `Move ${region.label || region.id}: ${offset.label || `${offset.x},${offset.y}`}`,
      targetRegionId: region.id,
      targetCell: target,
      category: "room-move",
    });
    const moved = moveRoom(region.id, target);
    if (moved === null) {
      recordQaDiagnostic("realistic room move skipped", {
        region: summarizeDebugRegion(region),
        offset,
        target,
        reason: "moveRoom returned null",
      }, "room-move");
      return false;
    }
    await waitForQaRender(signal, settings);
    map = getQaGeneratedMap();
    const checkContext = {
      scenarioLabel,
      phase: "realistic-room-move",
      regionId: region.id,
      offset,
      target,
    };
    assertQaNoDuplicateCorridors(map, checkContext);
    assertQaNoVisualCorridorTopologyIssues(map, checkContext);
    assertQaMapValidationPasses(map, checkContext);
    return true;
  }


  async function runQaCompactRoomNearClusterStep(
    runId,
    signal,
    settings = {},
    scenarioLabel = "Smoke Test",
    regionId = "",
    label = "Keep room near connected cluster",
  ) {
    let map = getQaGeneratedMap();
    let region = map?.regions?.find((item) => item.id === regionId) || null;
    assertQa(region, "No room available for compact layout step.", { regionId });
    const targets = getQaCompactRoomTargets(region, map, settings);
    if (!targets.length) {
      recordQaDiagnostic("compact room move skipped", {
        region: summarizeDebugRegion(region),
        reason: "no compact targets",
        topology: summarizeQaCorridorTopology(map),
      }, "room-move");
      return false;
    }

    const attempts = [];
    for (const target of targets) {
      setQaRunnerStep(runId, {
        scenarioLabel,
        stepLabel: `${label}: ${region.label || region.id} → ${target.label}`,
        targetRegionId: region.id,
        targetCell: { x: target.x, y: target.y },
        category: "room-move",
      });
      const moved = moveRoom(region.id, { x: target.x, y: target.y });
      attempts.push({
        label: target.label,
        target: { x: target.x, y: target.y },
        moved: moved !== null,
        score: roundDebugNumber(target.score),
        connectedRegionIds: target.connectedRegionIds || [],
      });
      if (moved === null) continue;

      await waitForQaRender(signal, settings);
      map = getQaGeneratedMap();
      region = map?.regions?.find((item) => item.id === regionId) || region;
      const checkContext = {
        scenarioLabel,
        phase: "compact-room-near-cluster",
        regionId: region.id,
        target: { x: target.x, y: target.y },
        label: target.label,
        attempts,
        region: summarizeDebugRegion(region),
      };
      recordQaDiagnostic("compact room move committed", checkContext, "room-move");
      assertQaNoDuplicateCorridors(map, checkContext);
      assertQaNoVisualCorridorTopologyIssues(map, checkContext);
      assertQaMapValidationPasses(map, checkContext);
      return true;
    }

    recordQaDiagnostic("compact room move skipped", {
      region: summarizeDebugRegion(region),
      reason: "all compact targets rejected by moveRoom",
      attempts,
      topology: summarizeQaCorridorTopology(map),
    }, "room-move");
    return false;
  }

  async function runQaSmokeScenario(
    runId,
    signal,
    settings = {},
    scenarioLabel = "Smoke Test"
  ) {
    let map = getQaGeneratedMap();
    assertQaMapValidationPasses(map, { scenarioLabel, phase: "initial" });
    const candidateRegions = getQaCircleSmokeCandidateRegions(map, settings);
    assertQa(candidateRegions.length > 0, "No connected room available for realistic smoke scenario.", {
      regionCount: map?.regions?.length || 0,
      corridors: (map?.corridors || []).map(summarizeDebugCorridor),
    });

    let circleRegion = candidateRegions[0];
    await runQaRealisticRoomStyleStep(
      runId,
      signal,
      settings,
      scenarioLabel,
      circleRegion.id,
      { shape: "circle", sizePreset: "Medium", customSize: null },
      "Make room circular medium",
    );
    await runQaCompactRoomNearClusterStep(
      runId,
      signal,
      settings,
      scenarioLabel,
      circleRegion.id,
      "Keep circular room near connected rooms",
    );

    if (settings.speed !== "fast") {
      await runQaRealisticRoomStyleStep(
        runId,
        signal,
        settings,
        scenarioLabel,
        circleRegion.id,
        { shape: "circle", sizePreset: "Large", customSize: null },
        "Resize circular room",
      );
      await runQaCompactRoomNearClusterStep(
        runId,
        signal,
        settings,
        scenarioLabel,
        circleRegion.id,
        "Recompact resized circular room",
      );
    }

    map = getQaGeneratedMap();
    circleRegion = map?.regions?.find((region) => region.id === circleRegion.id) || circleRegion;
    assertQaRegionNearConnectedCluster(circleRegion, map, settings, {
      scenarioLabel,
      phase: "after-circle-style-and-compact",
    });

    await runQaCircleAnchorSweep(runId, signal, settings, scenarioLabel, {
      regionId: circleRegion.id,
      preferredSide: null,
      stepCount: getQaCircleSmokeAnchorSteps(settings),
      prepare: false,
      anchorStrategy: "nearby",
    });

    await runQaCompactRoomNearClusterStep(
      runId,
      signal,
      settings,
      scenarioLabel,
      circleRegion.id,
      "Recompact after nearby anchor edits",
    );

    map = getQaGeneratedMap();
    circleRegion = map?.regions?.find((region) => region.id === circleRegion.id) || circleRegion;
    assertQaRegionNearConnectedCluster(circleRegion, map, settings, {
      scenarioLabel,
      phase: "after-nearby-circle-anchor-moves",
    });

    const realisticOffsets = getQaRealisticRoomMoveOffsets(settings);
    await runQaRealisticRoomMoveStep(
      runId,
      signal,
      settings,
      scenarioLabel,
      circleRegion.id,
      realisticOffsets[1] || { x: 0, y: 1, label: "down-1" },
    );
    await runQaCompactRoomNearClusterStep(
      runId,
      signal,
      settings,
      scenarioLabel,
      circleRegion.id,
      "Recompact after user room nudge",
    );

    map = getQaGeneratedMap();
    const secondaryRegion = (map?.regions || []).find(
      (region) => region?.id && region.id !== circleRegion.id,
    );
    if (secondaryRegion) {
      await runQaRealisticRoomStyleStep(
        runId,
        signal,
        settings,
        scenarioLabel,
        secondaryRegion.id,
        { shape: "hall", sizePreset: "Small", customSize: null },
        "Change adjacent room type",
      );
      if (settings.speed !== "fast") {
        await runQaRealisticRoomMoveStep(
          runId,
          signal,
          settings,
          scenarioLabel,
          secondaryRegion.id,
          realisticOffsets[2] || { x: -1, y: 0, label: "left-1" },
        );
        await runQaCompactRoomNearClusterStep(
          runId,
          signal,
          settings,
          scenarioLabel,
          circleRegion.id,
          "Keep circular room near moved neighbor",
        );
      }
    }

    if (!signal?.aborted) await runQaCorridorCreation(runId, signal, settings, scenarioLabel);
    if (!signal?.aborted) {
      await runQaCompactRoomNearClusterStep(
        runId,
        signal,
        settings,
        scenarioLabel,
        circleRegion.id,
        "Final compactness pass",
      );
    }

    map = getQaGeneratedMap();
    circleRegion = map?.regions?.find((region) => region.id === circleRegion.id) || circleRegion;
    assertQaRegionNearConnectedCluster(circleRegion, map, settings, {
      scenarioLabel,
      phase: "final-smoke-layout",
    });
  }

  async function runQaRoomLevelStairs(
    runId,
    signal,
    settings = {},
    scenarioLabel = "Room Level → Stairs Test"
  ) {
    const originalOverrides = cloneManualOverrides(manualOverridesRef.current);
    const map = getQaGeneratedMap();
    const corridor = (map?.corridors || []).find(
      (candidate) =>
        candidate?.id &&
        !candidate.isRoomLink &&
        candidate.from &&
        candidate.to &&
        (map.regions || []).some((region) => region.id === candidate.from) &&
        (map.regions || []).some((region) => region.id === candidate.to),
    );
    assertQa(corridor, "Need a room-to-room corridor for the level/stair test.", {
      corridorCount: map?.corridors?.length || 0,
    });
    const fromRegion = map.regions.find((region) => region.id === corridor.from);
    const toRegion = map.regions.find((region) => region.id === corridor.to);
    const fromLevel = 0;
    const toLevel = -3;
    setQaRunnerStep(runId, {
      scenarioLabel,
      stepLabel: `Set ${fromRegion.name || fromRegion.id} to Level ${formatMapLevel(fromLevel)} and ${toRegion.name || toRegion.id} to Level ${formatMapLevel(toLevel)}`,
      targetRegionId: toRegion.id,
      category: "levels",
    });
    setManualOverridesFromCurrent((current) => {
      const normalized = normalizeManualOverrides(current);
      let levels = {
        ...normalized.levels,
        regions: { ...(normalized.levels?.regions || {}) },
        corridors: { ...(normalized.levels?.corridors || {}) },
        stairs: { ...(normalized.levels?.stairs || {}) },
      };
      levels = removeEditorStairOverridesForRoomLevelChange(levels, fromRegion.id);
      levels = removeEditorStairOverridesForRoomLevelChange(levels, toRegion.id);
      levels.regions[fromRegion.id] = fromLevel;
      levels.regions[toRegion.id] = toLevel;
      return {
        ...normalized,
        levels,
        stairTransitions: levels.stairs,
      };
    }, "qaRoomLevelStairs:setLevels");
    await waitForQaRender(signal, settings);
    const nextMap = getQaGeneratedMap();
    const nextCorridor =
      nextMap.corridors.find((candidate) => candidate.id === corridor.id) ||
      getQaCorridorForPair(fromRegion.id, toRegion.id, nextMap);
    assertQa(nextCorridor, "Level/stair test corridor disappeared after setting room levels.", {
      corridorId: corridor.id,
      fromRegionId: fromRegion.id,
      toRegionId: toRegion.id,
    });
    const nextFromRegion = nextMap.regions.find((region) => region.id === fromRegion.id);
    const nextToRegion = nextMap.regions.find((region) => region.id === toRegion.id);
    assertQa(nextFromRegion?.level === fromLevel, "Source room level was not preserved.", {
      region: nextFromRegion,
      expected: fromLevel,
    });
    assertQa(nextToRegion?.level === toLevel, "Target room level was not scoped to the edited room.", {
      region: nextToRegion,
      expected: toLevel,
    });
    assertQa(nextCorridor.fromLevel === fromLevel, "Room level scope should not mutate corridor fromLevel before stair placement is enabled.", {
      corridor: summarizeDebugCorridor(nextCorridor),
      expected: fromLevel,
    });
    assertQa(nextCorridor.toLevel === fromLevel, "Room level scope should not turn the corridor into a cross-level route yet.", {
      corridor: summarizeDebugCorridor(nextCorridor),
      expected: fromLevel,
    });
    assertQa(nextCorridor.levelDelta === 0, "Room level scope should keep the corridor levelDelta neutral before stair placement is enabled.", {
      corridor: summarizeDebugCorridor(nextCorridor),
      expected: 0,
    });
    assertQa(!nextCorridor.crossLevel && !nextCorridor.verticalTransition, "Room level scope should not create a vertical corridor transition yet.", {
      corridor: summarizeDebugCorridor(nextCorridor),
    });
    assertQa(nextCorridor.stairTransition === "none", "Room level scope should not derive stair direction until stair placement is enabled.", {
      corridor: summarizeDebugCorridor(nextCorridor),
    });
    assertQa(nextCorridor.stairCount === 0, "Room level scope should not derive stair marker metadata until stair placement is enabled.", {
      corridor: summarizeDebugCorridor(nextCorridor),
      expected: 0,
    });
    assertQa(nextCorridor.levelTransition?.derivedFromRoomLevels !== true, "Room level scope should not enable room-derived stair metadata yet.", {
      corridor: summarizeDebugCorridor(nextCorridor),
    });
    const renderOnlyStairMarkers = getCorridorStairMarkerVirtualDoors(nextCorridor, nextMap);
    assertQa(renderOnlyStairMarkers.length === Math.min(Math.abs(toLevel - fromLevel), 8), "Room level scope should render visual stair markers without mutating corridor metadata.", {
      corridor: summarizeDebugCorridor(nextCorridor),
      expected: Math.min(Math.abs(toLevel - fromLevel), 8),
      actual: renderOnlyStairMarkers.length,
    });
    assertQa(renderOnlyStairMarkers.every((marker) => marker.renderOnlyRoomLevelStair === true), "Room-level visual stair markers must be render-only.", {
      markers: renderOnlyStairMarkers,
    });
    assertQaMapValidationPasses(nextMap, {
      scenarioLabel,
      phase: "room-level-derived-stairs",
      fromRegionId: fromRegion.id,
      toRegionId: toRegion.id,
      corridorId: nextCorridor.id,
    });
    recordQaDiagnostic("room levels scoped with render-only stair markers", {
      scenarioLabel,
      fromRegionId: fromRegion.id,
      toRegionId: toRegion.id,
      corridorId: nextCorridor.id,
      fromLevel,
      toLevel,
      corridorLevelDelta: nextCorridor.levelDelta,
      stairCount: nextCorridor.stairCount,
      renderedStairCount: renderOnlyStairMarkers.length,
      direction: nextCorridor.stairTransition,
    }, "levels");
    setQaRunnerStep(runId, {
      scenarioLabel,
      stepLabel: "Restore previous room levels",
      targetRegionId: toRegion.id,
      category: "levels",
    });
    setManualOverridesFromCurrent(originalOverrides, "qaRoomLevelStairs:restore");
    await waitForQaRender(signal, settings);
  }

  async function runQaLevelView(
    runId,
    signal,
    settings = {},
    scenarioLabel = "Level View Test"
  ) {
    const originalOverrides = cloneManualOverrides(manualOverridesRef.current);
    const originalLevelView = levelView;
    const originalFadeOtherLevels = fadeOtherLevels;
    const map = getQaGeneratedMap();
    const corridor = (map?.corridors || []).find(
      (candidate) =>
        candidate?.id &&
        !candidate.isRoomLink &&
        candidate.from &&
        candidate.to &&
        (map.regions || []).some((region) => region.id === candidate.from) &&
        (map.regions || []).some((region) => region.id === candidate.to),
    );
    assertQa(corridor, "Need a room-to-room corridor for the level view test.", {
      corridorCount: map?.corridors?.length || 0,
    });
    const fromRegion = map.regions.find((region) => region.id === corridor.from);
    const toRegion = map.regions.find((region) => region.id === corridor.to);
    const fromLevel = 0;
    const toLevel = -2;

    setQaRunnerStep(runId, {
      scenarioLabel,
      stepLabel: `Assign levels and switch to Level ${formatMapLevel(toLevel)}`,
      targetRegionId: toRegion.id,
      category: "levels",
    });
    setManualOverridesFromCurrent((current) => {
      const normalized = normalizeManualOverrides(current);
      let levels = {
        ...normalized.levels,
        regions: { ...(normalized.levels?.regions || {}) },
        corridors: { ...(normalized.levels?.corridors || {}) },
        stairs: { ...(normalized.levels?.stairs || {}) },
      };
      levels = removeEditorStairOverridesForRoomLevelChange(levels, fromRegion.id);
      levels = removeEditorStairOverridesForRoomLevelChange(levels, toRegion.id);
      levels.regions[fromRegion.id] = fromLevel;
      levels.regions[toRegion.id] = toLevel;
      return {
        ...normalized,
        levels,
        stairTransitions: levels.stairs,
      };
    }, "qaLevelView:setLevels");
    setLevelView(toLevel);
    setFadeOtherLevels(true);
    await waitForQaRender(signal, settings);

    const nextMap = getQaGeneratedMap();
    const available = getAvailableMapLevels(nextMap);
    const normalizedView = normalizeLevelView(toLevel, available);
    const activeMap = createLevelFilteredMap(nextMap, normalizedView, "active");
    const inactiveMap = createLevelFilteredMap(nextMap, normalizedView, "inactive");
    const activeRegionIds = new Set((activeMap.regions || []).map((region) => region.id));
    const inactiveRegionIds = new Set((inactiveMap.regions || []).map((region) => region.id));
    const visibleCorridor = (activeMap.corridors || []).find(
      (candidate) => candidate.id === corridor.id || (candidate.from === fromRegion.id && candidate.to === toRegion.id),
    );

    assertQa(normalizedView === toLevel, "Level View did not normalize to the requested target level.", {
      requested: toLevel,
      availableLevels: available,
      normalizedView,
    });
    assertQa(activeRegionIds.has(toRegion.id), "Active Level View does not include the target-level room.", {
      targetRegionId: toRegion.id,
      activeRegionIds: Array.from(activeRegionIds),
    });
    assertQa(!activeRegionIds.has(fromRegion.id), "Active Level View includes a room from another level.", {
      fromRegionId: fromRegion.id,
      activeRegionIds: Array.from(activeRegionIds),
    });
    assertQa(inactiveRegionIds.has(fromRegion.id), "Faded Level View does not include the other-level room.", {
      fromRegionId: fromRegion.id,
      inactiveRegionIds: Array.from(inactiveRegionIds),
    });
    assertQa(visibleCorridor?.crossLevel, "Cross-level corridor should stay visible as a stair connector on the active level.", {
      corridor: summarizeDebugCorridor(visibleCorridor),
      normalizedView,
    });
    assertQa(visibleCorridor?.stairCount === Math.abs(toLevel - fromLevel), "Level View stair connector has the wrong stair marker count.", {
      corridor: summarizeDebugCorridor(visibleCorridor),
      expected: Math.abs(toLevel - fromLevel),
    });
    recordQaDiagnostic("level view isolates active room level", {
      scenarioLabel,
      fromRegionId: fromRegion.id,
      toRegionId: toRegion.id,
      levelView: normalizedView,
      activeRegionIds: Array.from(activeRegionIds),
      inactiveRegionIds: Array.from(inactiveRegionIds),
      corridorId: visibleCorridor?.id || corridor.id,
      stairCount: visibleCorridor?.stairCount || 0,
    }, "levels");

    setQaRunnerStep(runId, {
      scenarioLabel,
      stepLabel: "Restore previous Level View and room levels",
      targetRegionId: toRegion.id,
      category: "levels",
    });
    setLevelView(originalLevelView);
    setFadeOtherLevels(originalFadeOtherLevels);
    setManualOverridesFromCurrent(originalOverrides, "qaLevelView:restore");
    await waitForQaRender(signal, settings);
  }

  async function runQaCorridorCreation(
    runId,
    signal,
    settings = {},
    scenarioLabel = "Corridor Creation Test"
  ) {
    const map = getQaGeneratedMap();
    assertQa((map?.regions || []).length >= 2, "Need at least two rooms to create a corridor.");
    const [fromRegion, toRegion] = [...map.regions]
      .sort((a, b) => (b.cellRect?.w || 0) - (a.cellRect?.w || 0))
      .slice(0, 2);
    const gridSize = map.config.gridSize || config.gridSize || 20;
    const fromPoint = getQaRegionCenterPoint(fromRegion, gridSize);
    const toPoint = getQaRegionCenterPoint(toRegion, gridSize);
    const fromAnchor =
      getDoorDragManualAnchor(fromRegion, fromPoint, gridSize) ||
      getClosestBoundaryAnchorToPoint(fromRegion, toPoint, gridSize, map);
    const toAnchor =
      getDoorDragManualAnchor(toRegion, toPoint, gridSize) ||
      getClosestBoundaryAnchorToPoint(toRegion, fromPoint, gridSize, map);
    assertQa(fromAnchor && toAnchor, "Could not resolve connection anchors.", {
      fromRegion: fromRegion.id,
      toRegion: toRegion.id,
    });
    const beforeCount = map.corridors.length;
    setQaRunnerStep(runId, {
      scenarioLabel,
      stepLabel: `Create manual corridor ${fromRegion.id} → ${toRegion.id}`,
      targetRegionId: fromRegion.id,
      targetCell: toAnchor.outsideCell || toAnchor.cell,
      category: "corridor-create",
    });
    const connectionPayload = {
      fromRegionId: fromRegion.id,
      toRegionId: toRegion.id,
      fromAnchor,
      toAnchor,
      debugTrace: {
        releasePoint: getAnchorHandlePoint(toAnchor, gridSize) || toPoint,
        releaseCell: toAnchor.outsideCell || toAnchor.cell,
        targetPoint: getAnchorHandlePoint(toAnchor, gridSize) || toPoint,
        targetCell: toAnchor.outsideCell || toAnchor.cell,
        targetDistance: 0,
        targetScore: 0,
      },
    };
    const preview = createConnectionDraftPreviewMap(connectionPayload);
    const previewCorridor = preview?.map?.corridors?.find((item) => item.id === preview.corridorId);
    const previewCells = previewCorridor ? getCorridorTopologyCells(previewCorridor) : [];
    assertQa(preview?.map && previewCorridor && previewCells.length >= 2, "Corridor creation routed preview is unavailable.", {
      phase: "corridor-create-preview",
      fromRegionId: fromRegion.id,
      toRegionId: toRegion.id,
      previewCorridorId: preview?.corridorId || null,
      previewCells: previewCells.map(summarizeDebugCell),
    });
    assertQaNoVisualCorridorTopologyIssues(preview.map, {
      scenarioLabel,
      phase: "corridor-create-preview",
      fromRegionId: fromRegion.id,
      toRegionId: toRegion.id,
    });
    recordQaDiagnostic("corridor create routed preview built", {
      scenarioLabel,
      phase: "corridor-create-preview",
      fromRegionId: fromRegion.id,
      toRegionId: toRegion.id,
      previewCorridorId: preview.corridorId,
      previewCellCount: previewCells.length,
    }, "corridor-create");
    createConnectionFromWallDrag(connectionPayload);
    await waitForQaRender(signal, settings);
    const nextMap = getQaGeneratedMap();
    assertQaNoDuplicateCorridors(nextMap);
    assertQaNoVisualCorridorTopologyIssues(nextMap);
    assertQaMapValidationPasses(nextMap, {
      scenarioLabel,
      phase: "corridor-create",
      fromRegionId: fromRegion.id,
      toRegionId: toRegion.id,
    });
    const afterCount = nextMap.corridors.length;
    assertQa(afterCount <= beforeCount + 1, "Corridor creation added too many corridors.", {
      beforeCount,
      afterCount,
      corridors: nextMap.corridors.map((item) => item.id),
    });
  }

  async function runQaRoomMoveReroute(
    runId,
    signal,
    settings = {},
    scenarioLabel = "Room Move + Reroute"
  ) {
    let map = getQaGeneratedMap();
    const region = getQaLargestRegion(map);
    assertQa(region, "No region available for room move test.");
    const start = { x: region.cellRect.x, y: region.cellRect.y };
    const target = { x: start.x + 1, y: start.y };
    setQaRunnerStep(runId, {
      scenarioLabel,
      stepLabel: `Move ${region.label || region.id} by one cell`,
      targetRegionId: region.id,
      targetCell: target,
      category: "room-move",
    });
    const moved = moveRoom(region.id, target);
    assertQa(moved !== null, "Room move returned an invalid result.", {
      regionId: region.id,
      target,
    });
    await waitForQaRender(signal, settings);
    map = getQaGeneratedMap();
    assertQaNoDuplicateCorridors(map);
    assertQaNoVisualCorridorTopologyIssues(map);
    assertQaMapValidationPasses(map, {
      scenarioLabel,
      phase: "room-move-reroute",
      regionId: region.id,
      target,
    });
  }

  async function runMapQaScenario(eventDetail = {}) {
    if (typeof window === "undefined") return;
    const runId = (qaRunnerSequenceRef.current || 0) + 1;
    qaRunnerSequenceRef.current = runId;
    qaRunnerAbortRef.current?.abort?.();
    const abortController = new AbortController();
    qaRunnerAbortRef.current = abortController;
    const scenarioId = eventDetail.scenarioId || "smoke";
    const settings = {
      speed: eventDetail.settings?.speed || "normal",
      stopOnError: eventDetail.settings?.stopOnError !== false,
    };
    const scenarioLabel = getQaRunnerScenarioLabel(scenarioId, eventDetail.scenarioLabel);

    setDebugRecording(true);
    setQaRunnerStep(runId, {
      state: "running",
      scenarioId,
      scenarioLabel,
      settings,
      stepLabel: "Starting scenario…",
      message: "Starting scenario…",
      category: "performance",
    });

    try {
      if (scenarioId === "circle-anchor-sweep") {
        await runQaCircleAnchorSweep(runId, abortController.signal, settings, scenarioLabel);
      } else if (scenarioId === "corridor-create") {
        await runQaCorridorCreation(runId, abortController.signal, settings, scenarioLabel);
      } else if (scenarioId === "level-stairs") {
        await runQaRoomLevelStairs(runId, abortController.signal, settings, scenarioLabel);
      } else if (scenarioId === "level-view") {
        await runQaLevelView(runId, abortController.signal, settings, scenarioLabel);
      } else if (scenarioId === "room-move-reroute") {
        await runQaRoomMoveReroute(runId, abortController.signal, settings, scenarioLabel);
      } else {
        await runQaSmokeScenario(runId, abortController.signal, settings, scenarioLabel);
      }
      finishQaRunner(runId, {
        state: "passed",
        scenarioId,
        scenarioLabel,
        settings,
        stepLabel: "Scenario passed.",
        message: "Scenario passed.",
      });
    } catch (error) {
      const stopped = abortController.signal.aborted;
      const payload = {
        state: stopped ? "stopped" : "failed",
        scenarioId,
        scenarioLabel,
        settings,
        stepLabel: stopped ? "Scenario stopped." : "Scenario failed.",
        message: stopped ? "Scenario stopped." : error?.message || String(error),
        error: stopped ? "" : error?.message || String(error),
        payload: cloneMapDebugPayload(error?.payload || {}),
      };
      finishQaRunner(runId, payload);
      if (!stopped && settings.stopOnError === false) {
        recordQaRunnerEvent("qa runner: continued after error", payload, "performance");
      }
    }
  }

  function stopMapQaScenario() {
    qaRunnerAbortRef.current?.abort?.();
    dispatchQaRunnerStatus({
      state: "stopped",
      stepLabel: "Scenario stopped.",
      message: "Scenario stopped.",
    });
    setQaRunnerOverlay((current) => ({
      ...(current || {}),
      state: "stopped",
      stepLabel: "Scenario stopped.",
      message: "Scenario stopped.",
    }));
  }

  useEffect(() => {
    function handleRun(event) {
      runMapQaScenario(event?.detail || {});
    }

    function handleStop() {
      stopMapQaScenario();
    }

    window.addEventListener("cruor:map-qa-runner-run", handleRun);
    window.addEventListener("cruor:map-qa-runner-stop", handleStop);
    return () => {
      window.removeEventListener("cruor:map-qa-runner-run", handleRun);
      window.removeEventListener("cruor:map-qa-runner-stop", handleStop);
      qaRunnerAbortRef.current?.abort?.();
    };
  }, [recordDebugEvent]);

  useEffect(() => {
    if (!inlineComposerEditor || typeof onCommitWorkspace !== "function" || isManualEditActive)
      return;
    onCommitWorkspace(createManualWorkspaceStatePayload());
  }, [inlineComposerEditor, onCommitWorkspace, manualOverrides, isManualEditActive]);

  const mapViewport = (
    <MapViewport
      generatedMap={generatedMap}
      showGrid={showGrid}
      gridStyle={gridStyle}
      gridOpacity={gridOpacity}
      gridColor={gridColor}
      gridWeight={gridWeight}
      crosshatchStyle={crosshatchStyle}
      crosshatchOpacity={crosshatchOpacity}
      wallDrawingStyle={wallDrawingStyle}
      hatchShadowColor={hatchShadowColor}
      selectedRegionId={selectedRegionId}
      onSelectedRegionChange={selectMapRegion}
      onRegionHoverChange={onComposerRegionHoverChange}
      previewRegionMarkers={previewRegionMarkers}
      showEditor={showEditor}
      showNames={showNames}
      showRoomBadges={showRoomBadges}
      showProps={showProps}
      showAccessDots={showAccessDots}
      levelView={levelView}
      fadeOtherLevels={fadeOtherLevels}
      availableLevels={availableLevels}
      onRoomMove={moveRoom}
      onDoorMove={moveDoor}
      onDoorTypeChange={updateDoorType}
      onDoorStairChange={updateDoorStair}
      onCorridorTypeChange={updateCorridorType}
      onMapAccessMove={setMapAccess}
      onMapAccessSet={setMapAccessWithHistory}
      onMapAccessRemove={removeMapAccess}
      onJunctionTypeChange={updateJunctionType}
      onWaypointMove={moveWaypoint}
      onWaypointInsert={insertWaypoint}
      onWaypointDelete={deleteWaypoint}
      onConnectionDelete={deleteConnection}
      onCreateConnection={createConnectionFromWallDrag}
      manualOverrides={manualOverrides}
      onRoomStyleChange={updateRoomStyle}
      onRoomStyleReset={resetRoomStyle}
      onRoomLevelChange={updateRoomLevel}
      onRoomLevelReset={resetRoomLevel}
      onEditStart={beginManualEdit}
      onEditCommit={commitManualEdit}
      onUndo={undoManualEdit}
      onRedo={redoManualEdit}
      onNewSeed={randomizeSeed}
      onToggleGrid={toggleGridVisibility}
      onGridStyleChange={setGridRenderingStyle}
      onToggleEditor={() => setShowEditor((value) => !value)}
      onToggleNames={() => setShowNames((value) => !value)}
      onToggleProps={() => setShowProps((value) => !value)}
      onToggleAccessDots={() => setShowAccessDots((value) => !value)}
      onLevelViewChange={(value) => setLevelView(normalizeLevelView(value, availableLevels))}
      onToggleFadeOtherLevels={() => setFadeOtherLevels((value) => !value)}
      onResetEdits={() => {
        setManualLayoutSeed("");
        manualLayoutGeometryRef.current = null;
        updateManualOverridesWithHistory(resetManualOverrides(), "Edits reset.");
      }}
      onExportSvg={downloadSvg}
      onExportGmSvg={downloadGmSvg}
      onExportPlayerSvg={downloadPlayerSvg}
      onExportPrintSvg={downloadPrintSvg}
      onExportState={exportState}
      onImportState={requestImportState}
      viewResetKey={`${seed}:${roomCount}:${context}:${mapWidth}:${mapHeight}`}
      embeddedPreview={inlineComposerEditor}
      allowEmbeddedInteractions={inlineComposerEditor}
      showViewportChrome={!embeddedInComposer && !inlineComposerEditor}
      enableViewportInteractions={true}
      viewportMode={inlineComposerEditor ? "composer-inline-editor" : workspaceContext}
      viewportClassName={inlineComposerEditor ? "location-map-inline-editor-viewport" : ""}
      onViewportMetricsChange={onViewportMetricsChange}
      onViewportControlsChange={inlineComposerEditor ? setInlineViewportControls : null}
      onCreateRoomDragPreviewMap={createRoomDragPreviewMap}
      onCreateConnectionDraftPreviewMap={createConnectionDraftPreviewMap}
      onDebugRecord={recordDebugEvent}
      showDebugCellCoordinates={
        effectiveDebugMode && (showDebugCoordinates || forceDebugCoordinatesForExport)
      }
    />
  );

  if (inlineComposerEditor) {
    return (
      <div
        className="cruor-map-inline-editor"
        data-map-context="composer-inline-editor"
        data-map-inspector-collapsed="true"
        onContextMenu={(event) => event.preventDefault()}
      >
        <InlineMapEditorToolbar
          showGrid={showGrid}
          showNames={showNames}
          showRoomBadges={showRoomBadges}
          showProps={showProps}
          showAccessDots={showAccessDots}
          manualHistory={manualHistory}
          viewportControls={inlineViewportControls}
          visualStyle={visualStyle}
          gridStyle={gridStyle}
          gridOpacity={gridOpacity}
          gridColor={gridColor}
          gridWeight={gridWeight}
          crosshatchStyle={crosshatchStyle}
          crosshatchOpacity={crosshatchOpacity}
          wallDrawingStyle={wallDrawingStyle}
          hatchShadowColor={hatchShadowColor}
          levelView={levelView}
          availableLevels={availableLevels}
          fadeOtherLevels={fadeOtherLevels}
          onRefreshFromComposer={onRefreshFromComposer}
          onUndo={undoManualEdit}
          onRedo={redoManualEdit}
          onToggleGrid={toggleGridVisibility}
          onToggleRoomBadges={() => setShowRoomBadges((value) => !value)}
          onToggleNames={() => setShowNames((value) => !value)}
          onToggleProps={() => setShowProps((value) => !value)}
          onToggleAccessDots={() => setShowAccessDots((value) => !value)}
          onVisualStyleChange={(value) => setVisualStyle(normalizeVisualStyle(value))}
          onGridStyleChange={setGridRenderingStyle}
          onGridColorChange={setGridRenderingColor}
          onGridWeightChange={setGridRenderingWeight}
          onGridOpacityChange={setGridOpacity}
          onCrosshatchStyleChange={(value) =>
            setCrosshatchStyle(value === "none" ? "none" : "classic")
          }
          onCrosshatchOpacityChange={setCrosshatchOpacity}
          onWallDrawingStyleChange={(value) =>
            setWallDrawingStyle(normalizeWallDrawingStyle(value))
          }
          onHatchShadowColorChange={(value) =>
            setHatchShadowColor(normalizeHatchShadowColor(value))
          }
          onLevelViewChange={(value) => setLevelView(normalizeLevelView(value, availableLevels))}
          onToggleFadeOtherLevels={() => setFadeOtherLevels((value) => !value)}
          onResetEdits={() => {
            setManualLayoutSeed("");
            manualLayoutGeometryRef.current = null;
            updateManualOverridesWithHistory(resetManualOverrides(), "Edits reset.");
          }}
        />
        {mapViewport}
        <MapTestsModal
          open={testsModalOpen}
          testSuite={testSuite}
          onClose={() => setTestsModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={cx(
        "cruor-map-mvp",
        "cruor-map-workspace",
        `cruor-map-workspace--${workspaceContext}`,
        embeddedInComposer && "is-embedded-in-composer"
      )}
      data-map-context={workspaceContext}
      data-map-inspector-collapsed={inspectorCollapsed ? "true" : undefined}
      onContextMenu={(event) => event.preventDefault()}
    >
      {qaRunnerOverlay ? (
        <div
          className={`map-qa-runner-overlay is-${qaRunnerOverlay.state || "idle"}`}
          aria-live="polite"
        >
          <div className="map-qa-runner-overlay__header">
            <span>Map QA Runner</span>
            <strong>{qaRunnerOverlay.state || "idle"}</strong>
          </div>
          <p>{qaRunnerOverlay.scenarioLabel || "Scenario"}</p>
          <em>{qaRunnerOverlay.stepLabel || qaRunnerOverlay.message || "Running…"}</em>
          {qaRunnerOverlay.error ? <code>{qaRunnerOverlay.error}</code> : null}
        </div>
      ) : null}
      <div
        className={
          inspectorCollapsed ? "map-workspace-shell is-inspector-collapsed" : "map-workspace-shell"
        }
      >
        <aside
          className="map-tool-rail map-tool-rail--left cruor-ui-panel-surface cruor-side-panel"
          aria-label="Map actions"
        >
          {onExitWorkspace ? (
            <MapToolButton
              icon="check"
              label="Done Editing"
              description="Return to the Location Composer."
              onClick={finishWorkspaceEditing}
            />
          ) : null}
          {onExitWorkspace ? <span className="map-tool-rail__divider" aria-hidden="true" /> : null}
          <MapToolButton
            icon="arrows-rotate"
            label="Refresh from Composer"
            description="Rebuild the map from the latest Composer regions."
            disabled={!onRefreshFromComposer}
            onClick={onRefreshFromComposer}
          />
          <MapToolButton
            icon="shuffle"
            label="New Seed"
            description="Generate a new seed and rebuild the current map."
            onClick={randomizeSeed}
          />
          <span className="map-tool-rail__divider" aria-hidden="true" />
          <MapToolButton
            icon="rotate-left"
            label="Undo"
            disabled={manualHistory.past.length === 0}
            onClick={undoManualEdit}
          />
          <MapToolButton
            icon="rotate-right"
            label="Redo"
            disabled={manualHistory.future.length === 0}
            onClick={redoManualEdit}
          />
          <MapToolButton
            icon="border-all"
            label="Toggle Grid"
            active={showGrid}
            onClick={toggleGridVisibility}
          />
          <MapToolButton
            icon="square-pen"
            label="Toggle Room Badges"
            active={showRoomBadges}
            onClick={() => setShowRoomBadges((value) => !value)}
          />
          <MapToolButton
            icon="pen-ruler"
            label="Toggle Editor"
            visibility="advanced"
            active={showEditor}
            onClick={() => setShowEditor((value) => !value)}
          />
          <MapToolButton
            icon="signature"
            label="Toggle Names"
            active={showNames}
            onClick={() => setShowNames((value) => !value)}
          />
          <MapToolButton
            icon="boxes-stacked"
            label="Toggle Props"
            visibility="advanced"
            active={showProps}
            onClick={() => setShowProps((value) => !value)}
          />
          <MapToolButton
            icon="eraser"
            label="Reset Edits"
            visibility="advanced"
            onClick={() => {
              setManualLayoutSeed("");
              manualLayoutGeometryRef.current = null;
              updateManualOverridesWithHistory(resetManualOverrides(), "Edits reset.");
            }}
          />
          <MapToolButton
            icon="clipboard-check"
            label="Structural Tests"
            visibility="debug"
            description="Open the structural test suite."
            kbd="F2"
            active={testsModalOpen}
            onClick={() => setTestsModalOpen(true)}
          />
          <input
            ref={stateFileInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={importStateFromFile}
          />
        </aside>

        <main className="map-canvas-area">
          <div className="map-canvas-topbar cruor-ui-panel-surface">
            <div>
              <p className="map-panel-eyebrow">Map Workspace</p>
              <div className="map-toolbar__title">
                {context} {"\u00B7"}{" "}
                {normalizeLevelView(levelView, availableLevels) === LEVEL_VIEW_ALL
                  ? "all levels"
                  : `level ${formatMapLevel(normalizeLevelView(levelView, availableLevels))}`}{" "}
                {"\u00B7"} {String(generatedMap.seed).slice(0, 20)}
              </div>
            </div>
            <div className="map-canvas-topbar__meta">
              {importedRegions.length > 0 ? (
                <span>{importedRegions.length} imported regions</span>
              ) : (
                <span>{generatedMap.regions.length} regions</span>
              )}
              <span>{generatedMap.corridors.length} connections</span>
              <label
                className="map-canvas-topbar__level-view"
                data-level-view-control="topbar"
                data-level-view-value={String(normalizeLevelView(levelView, availableLevels))}
              >
                <span className="sr-only">Level View</span>
                <i className="fa-solid fa-layer-group" aria-hidden="true" />
                <select
                  className="control-select cruor-select"
                  aria-label="Level View"
                  value={String(normalizeLevelView(levelView, availableLevels))}
                  onChange={(event) =>
                    setLevelView(normalizeLevelView(event.target.value, availableLevels))
                  }
                >
                  <option value={LEVEL_VIEW_ALL}>All Levels</option>
                  {availableLevels.map((level) => (
                    <option key={`topbar-level-${level}`} value={String(level)}>
                      Level {formatMapLevel(level)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className={cx(
                  "map-tool-button map-canvas-topbar__level-fade cruor-ui-control-surface cruor-button cruor-button--icon",
                  fadeOtherLevels && "is-active"
                )}
                data-level-view-fade-toggle="topbar"
                data-level-view-fade-other-levels={fadeOtherLevels ? "true" : "false"}
                {...getGenericTooltipAttrs(
                  fadeOtherLevels ? "Fade Other Levels" : "Solo Active Level",
                  "Choose whether inactive levels stay visible as a faded context layer."
                )}
                aria-label={fadeOtherLevels ? "Fade other levels" : "Solo active level"}
                aria-pressed={Boolean(fadeOtherLevels)}
                onClick={() => setFadeOtherLevels((value) => !value)}
              >
                <i
                  className={fadeOtherLevels ? "fa-solid fa-circle-half-stroke" : "fa-solid fa-eye-slash"}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className="map-tool-button map-inspector-toggle cruor-ui-control-surface cruor-button cruor-button--icon"
                {...getGenericTooltipAttrs(
                  inspectorCollapsed ? "Open Inspector" : "Collapse Inspector"
                )}
                aria-label={inspectorCollapsed ? "Open Inspector" : "Collapse Inspector"}
                onClick={() => setInspectorCollapsed((value) => !value)}
              >
                <i
                  className={
                    inspectorCollapsed ? "fa-solid fa-angles-left" : "fa-solid fa-angles-right"
                  }
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {embeddedInComposer ? (
            mapViewport
          ) : (
            <div className="map-viewport-frame">{mapViewport}</div>
          )}
        </main>

        <aside
          className="map-inspector-panel cruor-ui-panel-surface cruor-side-panel"
          aria-label="Map inspector"
          aria-hidden={inspectorCollapsed}
        >
          <div className="map-inspector-panel__scroll cruor-scroll-surface">
            {effectiveDebugMode ? (
              <MapDebugRecorderPanel
                categories={debugCategories}
                entries={debugEntries}
                recording={debugRecording}
                showDebugCoordinates={showDebugCoordinates}
                qaSettings={qaRunnerSettings}
                qaRunnerState={qaRunnerOverlay}
                onRecordingChange={setDebugRecording}
                onToggleCategory={toggleDebugCategory}
                onToggleDebugCoordinates={setShowDebugCoordinates}
                onQaSettingsChange={setQaRunnerSettings}
                onRunQaScenario={(scenarioId, settings) =>
                  runMapQaScenario({ scenarioId, settings, scenarioLabel: getQaRunnerScenarioLabel(scenarioId) })
                }
                onStopQaScenario={stopMapQaScenario}
                onClear={clearDebugEntries}
                onDownloadJson={() => downloadDebugEntries("json")}
                onDownloadTxt={() => downloadDebugEntries("txt")}
                onCopyDebugSvg={copyDebugSvg}
                onDownloadDebugSvg={downloadDebugSvg}
              />
            ) : null}

            <MapInspectorSection icon="vector-square" title="Selected Area" eyebrow="Selection">
              {(() => {
                const metrics = getSelectedAreaMetrics(selectedRegion, generatedMap);
                if (!metrics) {
                  return <p className="map-inspector-empty">Select a room or region on the map.</p>;
                }
                return (
                  <div className="map-selected-area-card">
                    <strong>{metrics.label}</strong>
                    <div className="location-frame-info-grid">
                      <div className="location-frame-info-row">
                        <small>Room</small>
                        <strong>{metrics.number}</strong>
                      </div>
                      <div className="location-frame-info-row">
                        <small>Squares</small>
                        <strong>{metrics.squares}</strong>
                      </div>
                      <div className="location-frame-info-row">
                        <small>Size</small>
                        <strong>
                          {metrics.width} × {metrics.height}
                        </strong>
                      </div>
                      <div className="location-frame-info-row">
                        <small>Type</small>
                        <strong>{metrics.shape}</strong>
                      </div>
                      <div className="location-frame-info-row">
                        <small>Role</small>
                        <strong>{metrics.role}</strong>
                      </div>
                      <div className="location-frame-info-row">
                        <small>Level</small>
                        <strong>{metrics.level}</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </MapInspectorSection>

            <MapInspectorSection icon="sliders" title="Styles" eyebrow="Map Look">
              <MapControlSelect
                id="visual-style"
                label="Drawing Style"
                value={visualStyle}
                options={MAP_VISUAL_STYLES.map((style) => ({
                  value: style.value,
                  label: style.label,
                }))}
                onChange={(value) => setVisualStyle(normalizeVisualStyle(value))}
              />
              <MapControlSelect
                id="wall-drawing-style"
                label="Wall Drawing"
                value={wallDrawingStyle}
                options={WALL_DRAWING_STYLE_OPTIONS.map((style) => ({
                  value: style.value,
                  label: style.label,
                }))}
                onChange={(value) => setWallDrawingStyle(normalizeWallDrawingStyle(value))}
              />
              <MapControlSelect
                id="grid-style"
                label="Grid Style"
                value={gridStyle}
                options={[
                  { value: "solid", label: "Solid" },
                  { value: "dotted", label: "Dotted" },
                  { value: "dashed", label: "Dashed" },
                  { value: "none", label: "None" },
                ]}
                onChange={setGridRenderingStyle}
              />
              <MapControlSelect
                id="grid-color"
                label="Grid Color"
                value={gridColor}
                options={GRID_COLOR_OPTIONS.map((color) => ({
                  value: color,
                  label: MAP_GRID_COLOR_LABELS[color] || color,
                }))}
                onChange={setGridRenderingColor}
              />
              <MapControlSelect
                id="grid-weight"
                label="Grid Weight"
                value={gridWeight}
                options={GRID_WEIGHT_OPTIONS.map((weight) => ({
                  value: weight,
                  label: MAP_GRID_WEIGHT_LABELS[weight] || weight,
                }))}
                onChange={setGridRenderingWeight}
              />
              <MapControlSlider
                id="grid-opacity"
                label="Grid Opacity"
                value={gridOpacity}
                onChange={setGridOpacity}
              />
              <MapControlSelect
                id="crosshatch-style"
                label="Crosshatch Style"
                value={crosshatchStyle}
                options={[
                  { value: "classic", label: "Classic" },
                  { value: "none", label: "None" },
                ]}
                onChange={(value) => setCrosshatchStyle(value === "none" ? "none" : "classic")}
              />
              <MapControlSelect
                id="hatch-shadow-color"
                label="Hatch Shadow"
                value={hatchShadowColor}
                options={HATCH_SHADOW_COLOR_OPTIONS.map((color) => ({
                  value: color.value,
                  label: color.label,
                }))}
                onChange={(value) => setHatchShadowColor(normalizeHatchShadowColor(value))}
              />
              <MapControlSlider
                id="crosshatch-opacity"
                label="Crosshatch Opacity"
                value={crosshatchOpacity}
                onChange={setCrosshatchOpacity}
              />
              <MapControlSelect
                id="level-view"
                label="Level View"
                value={String(normalizeLevelView(levelView, availableLevels))}
                options={[
                  { value: LEVEL_VIEW_ALL, label: "All Levels" },
                  ...availableLevels.map((level) => ({
                    value: String(level),
                    label: `Level ${formatMapLevel(level)}`,
                  })),
                ]}
                onChange={(value) => setLevelView(normalizeLevelView(value, availableLevels))}
              />
              <div className="control-group">
                <button
                  type="button"
                  className="mvp-button cruor-ui-control-surface cruor-button"
                  onClick={() => setFadeOtherLevels((value) => !value)}
                >
                  {fadeOtherLevels ? "Fade Other Levels" : "Solo Active Level"}
                </button>
              </div>
            </MapInspectorSection>

            <MapInspectorSection
              icon="gear"
              title="Map Setup"
              eyebrow="Advanced"
              className="is-advanced-section"
            >
              <div className="control-group">
                <label className="control-label" htmlFor="seed">
                  Seed
                </label>
                <input
                  id="seed"
                  className="control-input cruor-input"
                  value={seed}
                  onChange={(event) => {
                    setSeed(event.target.value);
                    setManualLayoutSeed("");
                    manualLayoutGeometryRef.current = null;
                    setManualOverrides(resetManualOverrides());
                    clearManualHistory();
                  }}
                />
              </div>
              <div className="control-group">
                <label className="control-label" htmlFor="room-count">
                  Room / Region Count
                </label>
                <input
                  id="room-count"
                  className="control-input cruor-input"
                  type="number"
                  min="1"
                  max="16"
                  value={roomCount}
                  onChange={(event) => {
                    setRoomCount(normalizeRoomCount(event.target.value, roomCount));
                    setManualLayoutSeed("");
                    manualLayoutGeometryRef.current = null;
                    setManualOverrides(resetManualOverrides());
                    clearManualHistory();
                  }}
                />
              </div>
              <div className="control-grid control-grid--two">
                <div className="control-group">
                  <label className="control-label" htmlFor="map-width">
                    Canvas Width
                  </label>
                  <input
                    id="map-width"
                    className="control-input cruor-input"
                    type="number"
                    min="400"
                    max="3200"
                    step="20"
                    value={mapWidth}
                    onChange={(event) =>
                      setMapWidth(normalizeMapDimension(event.target.value, mapWidth))
                    }
                  />
                </div>
                <div className="control-group">
                  <label className="control-label" htmlFor="map-height">
                    Canvas Height
                  </label>
                  <input
                    id="map-height"
                    className="control-input cruor-input"
                    type="number"
                    min="400"
                    max="3200"
                    step="20"
                    value={mapHeight}
                    onChange={(event) =>
                      setMapHeight(normalizeMapDimension(event.target.value, mapHeight))
                    }
                  />
                </div>
              </div>
              <MapControlSelect
                id="context"
                label="Context"
                value={context}
                options={["Crypt", "Chapel", "Cave", "Mine", "Noble House", "Ruins"]}
                onChange={(value) => {
                  setContext(value);
                  setManualLayoutSeed("");
                  manualLayoutGeometryRef.current = null;
                  setManualOverrides(resetManualOverrides());
                  clearManualHistory();
                }}
              />
            </MapInspectorSection>

            {initialRequest?.source === "darken-location" && (
              <section
                className="map-inspector-section imported-map-request cruor-ui-card-surface"
                aria-label="Imported Darken a Location regions"
              >
                <strong>
                  Imported from Darken a Location: {importedRegions.length} region
                  {importedRegions.length === 1 ? "" : "s"}
                </strong>
                {importedRegions.length > 0 && (
                  <span>
                    {importedRegions
                      .slice(0, 5)
                      .map((region) => region.label || region.id)
                      .join(", ")}
                    {importedRegions.length > 5 ? `, +${importedRegions.length - 5} more` : ""}
                  </span>
                )}
              </section>
            )}

            <MapInspectorSection
              icon="chart-simple"
              title="Stats"
              eyebrow="Diagnostics"
              defaultOpen={false}
            >
              <div className="stats">
                <div className="stat cruor-ui-chip-surface cruor-stat">
                  <div className="stat__value">{generatedMap.regions.length}</div>
                  <div className="stat__label">Regions</div>
                </div>
                <div className="stat cruor-ui-chip-surface cruor-stat">
                  <div className="stat__value">{generatedMap.corridors.length}</div>
                  <div className="stat__label">Connections</div>
                </div>
                <div className="stat cruor-ui-chip-surface cruor-stat">
                  <div className="stat__value">{generatedMap.dungeonMask.floorCells.length}</div>
                  <div className="stat__label">Floor Cells</div>
                </div>
                <div className="stat cruor-ui-chip-surface cruor-stat">
                  <div className="stat__value">{generatedMap.dungeonMask.doorSegments.length}</div>
                  <div className="stat__label">Doors</div>
                </div>
                <div className="stat cruor-ui-chip-surface cruor-stat">
                  <div className="stat__value">
                    {generatedMap.dungeonMask.mapAccesses?.length || 0}
                  </div>
                  <div className="stat__label">Map Accesses</div>
                </div>
                <div className="stat cruor-ui-chip-surface cruor-stat">
                  <div className="stat__value">{availableLevels.length}</div>
                  <div className="stat__label">Levels</div>
                </div>
              </div>
            </MapInspectorSection>

            {stateStatus && <div className="state-status cruor-ui-card-surface">{stateStatus}</div>}

            <MapInspectorSection
              icon="list-ol"
              title="Room Key"
              eyebrow="Reference"
              defaultOpen={false}
            >
              <RoomKey generatedMap={generatedMap} />
            </MapInspectorSection>
          </div>
        </aside>
      </div>

      <MapTestsModal
        open={testsModalOpen}
        testSuite={testSuite}
        onClose={() => setTestsModalOpen(false)}
      />
    </div>
  );
}

export { CruorMapGeneratorMvp };
