import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  DOOR_TYPE_OPTIONS,
  STAIR_TRANSITION_OPTIONS,
  JUNCTION_TYPE_OPTIONS,
  cloneManualOverrides,
  areManualOverridesEqual,
  createEmptyManualOverrides,
  createEmptyLevelOverrides,
  normalizeManualOverrides,
  resetManualOverrides,
  normalizeGridStyle,
  doorTypeKey,
  normalizeDoorType,
  stairTransitionKey,
  normalizeStairTransition,
  getManualStairTransition,
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
  getCircleGeometryFromRegion,
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
} from "./map-generator.mask.js";
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
  findClosestBoundaryAnchorAcrossRegions,
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
import {
  MapSvg,
  getMapSurface,
  getRegionSurface,
  isPureCaveMap,
} from "./map-generator.render.jsx";
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
} from "./map-generator.debug.js";

const SIZE_PRESETS = {
  Tiny: { minW: 3, maxW: 4, minH: 3, maxH: 4 },
  Small: { minW: 4, maxW: 6, minH: 3, maxH: 5 },
  Medium: { minW: 5, maxW: 8, minH: 4, maxH: 6 },
  Large: { minW: 7, maxW: 11, minH: 5, maxH: 8 },
  Huge: { minW: 10, maxW: 14, minH: 7, maxH: 10 },
};

const ROOM_SIZE_MENU_PRESETS = {
  Tiny: { w: 3, h: 3 },
  Small: { w: 5, h: 4 },
  Medium: { w: 7, h: 5 },
  Large: { w: 9, h: 7 },
  Huge: { w: 12, h: 9 },
};

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
  let state =
    typeof seed === "number" ? seed >>> 0 : hashStringToSeed(String(seed));
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
  const viewportWidth =
    typeof window === "undefined" ? width + margin * 2 : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined" ? height + margin * 2 : window.innerHeight;
  return {
    x: clamp(
      event.clientX,
      margin,
      Math.max(margin, viewportWidth - width - margin),
    ),
    y: clamp(
      event.clientY,
      margin,
      Math.max(margin, viewportHeight - height - margin),
    ),
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

export function MapViewport({
  generatedMap,
  showGrid,
  gridStyle,
  gridOpacity = 0.72,
  crosshatchStyle = "classic",
  crosshatchOpacity = 0.72,
  selectedRegionId = "",
  onSelectedRegionChange = null,
  showEditor,
  showNames,
  showRoomBadges = true,
  showProps,
  levelView = LEVEL_VIEW_ALL,
  fadeOtherLevels = true,
  availableLevels = [],
  manualOverrides,
  onRoomMove,
  onDoorMove,
  onDoorTypeChange,
  onDoorStairChange,
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
  showViewportChrome = true,
  enableViewportInteractions = true,
  viewportMode = embeddedPreview ? "composer-preview" : "workspace",
  viewportClassName = "",
}) {
  const viewportRef = useRef(null);
  const panRef = useRef(null);
  const roomDragRef = useRef(null);
  const roomMoveFrameRef = useRef(null);
  const pendingRoomMoveRef = useRef(null);
  const corridorDragRef = useRef(null);
  const accessDragRef = useRef(null);
  const accessMoveFrameRef = useRef(null);
  const pendingAccessMoveRef = useRef(null);
  const connectionDragRef = useRef(null);
  const contentBoundsRef = useRef(generatedMap.contentBounds);
  const lastViewResetKeyRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingRegionId, setDraggingRegionId] = useState(null);
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [draggingCorridorHandle, setDraggingCorridorHandle] = useState(null);
  const [draggingMapAccessId, setDraggingMapAccessId] = useState(null);
  const [mapAccessDragPreview, setMapAccessDragPreview] = useState(null);
  const [hoverWallHandle, setHoverWallHandle] = useState(null);
  const [hoverCorridorHandle, setHoverCorridorHandle] = useState(null);
  const [hoveredCorridorId, setHoveredCorridorId] = useState(null);
  const [connectionDraft, setConnectionDraft] = useState(null);
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
  const viewportInteractive = enableViewportInteractions && !embeddedPreview;
  const shouldShowViewportChrome = showViewportChrome && !embeddedPreview;

  contentBoundsRef.current = generatedMap.contentBounds;

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
      const normalizedGridStyle = normalizeGridStyle(gridStyle);
      const gridVisible = showGrid && normalizedGridStyle !== "none";
      const gridSize = Math.max(1, generatedMap.config.gridSize || 20);
      const scaledGridSize = Math.max(1, gridSize * view.scale);
      const gridOriginX = viewportRect.left - stageRect.left + view.x;
      const gridOriginY = viewportRect.top - stageRect.top + view.y;

      stage.dataset.mapGridVisible = gridVisible ? "true" : "false";
      stage.dataset.mapGridStyle = normalizedGridStyle;
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
  }, [generatedMap.config.gridSize, gridStyle, showGrid, view.x, view.y, view.scale, viewportSize.width, viewportSize.height]);

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
        x:
          scaledWidth <= rect.width
            ? (rect.width - scaledWidth) / 2
            : clamp(candidate.x, minX, 0),
        y:
          scaledHeight <= rect.height
            ? (rect.height - scaledHeight) / 2
            : clamp(candidate.y, minY, 0),
      };
    },
    [generatedMap.config.mapWidth, generatedMap.config.mapHeight],
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
      1.45,
    );
    setView(
      constrainView({
        scale: nextScale,
        x: (rect.width - bounds.width * nextScale) / 2 - bounds.x * nextScale,
        y: (rect.height - bounds.height * nextScale) / 2 - bounds.y * nextScale,
      }),
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
    [constrainView],
  );

  const zoomAtCenter = useCallback(
    (factor) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      zoomAtPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        factor,
      );
    },
    [zoomAtPoint],
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

  function getViewportViewBox() {
    return `${-view.x / view.scale} ${-view.y / view.scale} ${viewportSize.width / view.scale} ${viewportSize.height / view.scale}`;
  }

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
    [zoomAtPoint],
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
      if (roomMoveFrameRef.current)
        window.cancelAnimationFrame(roomMoveFrameRef.current);
      if (accessMoveFrameRef.current)
        window.cancelAnimationFrame(accessMoveFrameRef.current);
    },
    [],
  );

  function openMapContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    setRoomContextMenu(null);
    setDoorContextMenu(null);
    setJunctionContextMenu(null);
    setWaypointContextMenu(null);
    setAddWaypointContextMenu(null);
    setMapContextMenu({
      ...getFixedContextMenuPosition(event, 250, 280),
    });
  }

  function handleRoomContextMenu(event, region) {
    if (!showEditor) return;
    event.preventDefault();
    event.stopPropagation();
    setMapContextMenu(null);
    setDoorContextMenu(null);
    setJunctionContextMenu(null);
    setWaypointContextMenu(null);
    setAddWaypointContextMenu(null);
    setRoomContextMenu({
      regionId: region.id,
      ...getFixedContextMenuPosition(event, 250, 280),
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
  }

  function handleRoomPointerLeave(event, region) {
    if (!showEditor || roomDragRef.current) return;
    event.stopPropagation();
    setHoveredRegionId((current) => (current === region.id ? null : current));
  }

  function handleRoomPointerDown(event, region) {
    if (!showEditor) return;
    event.preventDefault();
    event.stopPropagation();
    setHoveredRegionId(region.id);
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
    const segments =
      generatedMap.finalGeometry?.caveSurface?.boundarySegments || [];
    const bounds =
      zone.anchor.caveBounds || getCaveAccessBounds(segments, generatedMap);
    return (
      createCaveAccessBoundaryAnchor(
        zone.anchor.segment,
        generatedMap,
        zone.anchor.finalBoundaryIndex,
        bounds,
        point,
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
    const point = anchor
      ? getAnchorHandlePoint(anchor, generatedMap.config.gridSize)
      : zone.point;
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
      anchorsMatchEditorLocation(current.anchor, zoneOrHandle.anchor),
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
    setHoverWallHandle((current) =>
      isSameWallHoverHandle(current, zone) ? null : current,
    );
    setHoveredRegionId((current) =>
      current === zone.regionId ? null : current,
    );
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
    setHoverWallHandle((current) =>
      isSameWallHoverHandle(current, handle) ? null : current,
    );
    setHoveredRegionId((current) =>
      current === handle.regionId ? null : current,
    );
  }

  function isExternalMapBoundaryZone(zone) {
    if (!zone?.anchor) return false;
    if (
      pureCaveEditor &&
      zone.anchor.finalGeometry &&
      zone.anchor.caveAccessBoundary
    )
      return true;
    const floorSet = new Set(
      generatedMap.dungeonMask.floorCells.map((cell) =>
        cellKey(cell.x, cell.y),
      ),
    );
    return !floorSet.has(
      cellKey(zone.anchor.outsideCell.x, zone.anchor.outsideCell.y),
    );
  }

  function getMapAccessForRegion(regionId) {
    return (
      (
        generatedMap.dungeonMask.mapAccesses ||
        generatedMap.mapAccesses ||
        []
      ).find((access) => access.regionId === regionId) || null
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
      ...getFixedContextMenuPosition(event, 250, 220),
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
    const region = generatedMap.regions.find(
      (item) => item.id === handle.regionId,
    );
    if (!region) return;
    const anchor = resolveMapAccessAnchor(
      region,
      handle.access.displayAnchor || handle.access,
      generatedMap,
    );
    if (!anchor) return;
    const zone = { regionId: region.id, anchor };
    openWallAccessContextMenu(event, zone);
  }

  function handleMapAccessPointerDown(event, handle) {
    if (!showEditor || event.button !== 0 || !handle?.access) return;
    event.preventDefault();
    event.stopPropagation();
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
    if (pending)
      onMapAccessMove?.(pending.regionId, pending.anchor, pending.accessType);
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
      const point = getAnchorHandlePoint(
        pending.anchor,
        generatedMap.config.gridSize,
      );
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
    const region = generatedMap.regions.find(
      (item) => item.id === drag.regionId,
    );
    if (!region) return true;
    const anchor = getClosestExternalBoundaryAnchorToPoint(
      region,
      point,
      generatedMap,
    );
    if (!anchor) return true;
    if (pureCaveEditor) {
      scheduleMapAccessPreview(drag.regionId, drag.id, anchor, drag.accessType);
      return true;
    }
    scheduleMapAccessMove(drag.regionId, anchor, drag.accessType);
    return true;
  }

  function endMapAccessDrag(event) {
    const drag = accessDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return false;
    event.preventDefault();
    event.stopPropagation();
    if (pureCaveEditor) {
      const pending = pendingAccessMoveRef.current;
      if (accessMoveFrameRef.current) {
        window.cancelAnimationFrame(accessMoveFrameRef.current);
        accessMoveFrameRef.current = null;
      }
      pendingAccessMoveRef.current = null;
      if (pending)
        onMapAccessMove?.(pending.regionId, pending.anchor, pending.accessType);
    } else {
      flushPendingMapAccessMove();
    }
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
    setConnectionDraft(null);
    return true;
  }

  function handleWallZonePointerDown(event, zone) {
    if (!showEditor) return;
    event.preventDefault();
    event.stopPropagation();
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
    setConnectionDraft({ start: zone.point, current: zone.point });
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
      isSameCorridorHoverHandle(current, zone) ? null : current,
    );
    setHoveredCorridorId((current) =>
      current === zone.corridor.id ? null : current,
    );
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
      isSameCorridorHoverHandle(current, handle) ? null : current,
    );
    setHoveredCorridorId((current) =>
      current === handle.corridor.id ? null : current,
    );
  }

  function handleCorridorHandlePointerEnter(event, handle) {
    if (
      !showEditor ||
      roomDragRef.current ||
      accessDragRef.current ||
      connectionDragRef.current
    )
      return;
    event.stopPropagation();
    setHoveredCorridorId(handle.corridor.id);
  }

  function handleCorridorHandlePointerLeave(event, handle) {
    if (!showEditor || corridorDragRef.current) return;
    event.stopPropagation();
    setHoveredCorridorId((current) =>
      current === handle.corridor.id ? null : current,
    );
  }

  function handleRoomPointerMove(event) {
    const drag = roomDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    const point = clientToMapPoint(event);
    if (!point) return;
    const dx = Math.round(
      (point.x - drag.startX) / generatedMap.config.gridSize,
    );
    const dy = Math.round(
      (point.y - drag.startY) / generatedMap.config.gridSize,
    );
    const nextPosition = { x: drag.originX + dx, y: drag.originY + dy };
    if (drag.lastX === nextPosition.x && drag.lastY === nextPosition.y) return;
    drag.lastX = nextPosition.x;
    drag.lastY = nextPosition.y;
    pendingRoomMoveRef.current = {
      regionId: drag.regionId,
      position: nextPosition,
    };
    if (roomMoveFrameRef.current) return;
    roomMoveFrameRef.current = window.requestAnimationFrame(() => {
      roomMoveFrameRef.current = null;
      const pending = pendingRoomMoveRef.current;
      pendingRoomMoveRef.current = null;
      if (!pending) return;
      onRoomMove?.(pending.regionId, pending.position);
    });
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
    const pending = pendingRoomMoveRef.current;
    pendingRoomMoveRef.current = null;
    if (pending) onRoomMove?.(pending.regionId, pending.position);
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
    setConnectionDraft({ start: handle.point, current: handle.point });
  }

  function handleConnectionPointerMove(event) {
    const drag = connectionDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return false;
    event.preventDefault();
    event.stopPropagation();
    const point = clientToMapPoint(event);
    if (!point) return true;
    const target = findClosestBoundaryAnchorAcrossRegions(
      generatedMap.regions,
      point,
      generatedMap.config.gridSize,
      drag.fromRegionId,
      generatedMap.config.gridSize * 1.35,
      generatedMap,
    );
    setConnectionDraft({
      start: drag.start,
      current: target ? target.point : point,
      target,
    });
    return true;
  }

  function endConnectionDrag(event) {
    const drag = connectionDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return false;
    event.preventDefault();
    event.stopPropagation();
    const point = clientToMapPoint(event);
    const target = point
      ? findClosestBoundaryAnchorAcrossRegions(
          generatedMap.regions,
          point,
          generatedMap.config.gridSize,
          drag.fromRegionId,
          generatedMap.config.gridSize * 1.35,
          generatedMap,
        )
      : null;
    if (target) {
      onCreateConnection?.({
        fromRegionId: drag.fromRegionId,
        fromAnchor: drag.fromAnchor,
        toRegionId: target.region.id,
        toAnchor: target.anchor,
      });
    }
    connectionDragRef.current = null;
    setConnectionDraft(null);
    setHoverWallHandle(null);
    return true;
  }

  function handleDoorContextMenu(event, handle) {
    if (!showEditor) return;
    event.preventDefault();
    event.stopPropagation();
    setRoomContextMenu(null);
    setMapContextMenu(null);
    setJunctionContextMenu(null);
    setWaypointContextMenu(null);
    setAddWaypointContextMenu(null);
    setDoorContextMenu({
      corridorId: handle.corridor.id,
      endpoint: handle.endpoint,
      fallbackType: handle.corridor.secret ? "secret" : "default",
      ...getFixedContextMenuPosition(event, 250, 250),
    });
    setHoverCorridorHandle(null);
    setHoverWallHandle(null);
  }

  function handleJunctionContextMenu(event, junction) {
    if (!showEditor || !junction) return;
    event.preventDefault();
    event.stopPropagation();
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
    setRoomContextMenu(null);
    setDoorContextMenu(null);
    setJunctionContextMenu(null);
    setWaypointContextMenu(null);
    setMapContextMenu(null);
    const junction = getCorridorIntersectionCells(generatedMap.corridors).find(
      (item) => item.key === cellKey(handle.cell.x, handle.cell.y),
    );
    setAddWaypointContextMenu({
      corridorId: handle.corridor.id,
      insertIndex: handle.insertIndex,
      point: handle.point,
      cell: handle.cell,
      junctionKey: junction?.key || null,
      junctionCorridorIds:
        junction?.corridors?.map((corridor) => corridor.id) || [],
      ...getFixedContextMenuPosition(event, 250, 220),
    });
    setHoveredCorridorId(handle.corridor.id);
  }

  function handleWaypointContextMenu(event, handle) {
    if (!showEditor) return;
    event.preventDefault();
    event.stopPropagation();
    const cell = {
      x: Math.floor(handle.x / generatedMap.config.gridSize),
      y: Math.floor(handle.y / generatedMap.config.gridSize),
    };
    const junction = getCorridorIntersectionCells(generatedMap.corridors).find(
      (item) => item.key === cellKey(cell.x, cell.y),
    );
    setRoomContextMenu(null);
    setDoorContextMenu(null);
    setJunctionContextMenu(null);
    setMapContextMenu(null);
    setAddWaypointContextMenu(null);
    setWaypointContextMenu({
      corridorId: handle.corridor.id,
      waypointIndex: handle.index,
      source: handle.source,
      cell,
      junctionKey: junction?.key || null,
      junctionCorridorIds:
        junction?.corridors?.map((corridor) => corridor.id) || [],
      ...getFixedContextMenuPosition(event, 250, 280),
    });
    setHoverCorridorHandle(null);
    setHoveredCorridorId(handle.corridor.id);
  }

  function handleDoorPointerDown(event, handle) {
    if (!showEditor || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    onEditStart?.();
    corridorDragRef.current = {
      type: "door",
      pointerId: event.pointerId,
      id: handle.id,
      corridorId: handle.corridor.id,
      endpoint: handle.endpoint,
    };
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
    onEditStart?.();
    onWaypointInsert?.(handle.corridor.id, handle.insertIndex, handle.point);
    corridorDragRef.current = {
      type: "waypoint",
      pointerId: event.pointerId,
      id: `new-waypoint-${handle.corridor.id}-${handle.insertIndex}`,
      corridorId: handle.corridor.id,
      waypointIndex: handle.insertIndex,
      source: "manual",
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
    setDraggingCorridorHandle(
      `new-waypoint-${handle.corridor.id}-${handle.insertIndex}`,
    );
    setHoverCorridorHandle(null);
  }

  function handleWaypointPointerDown(event, handle) {
    if (!showEditor || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    onEditStart?.();
    corridorDragRef.current = {
      type: "waypoint",
      pointerId: event.pointerId,
      id: handle.id,
      corridorId: handle.corridor.id,
      waypointIndex: handle.index,
      source: handle.source,
    };
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
    if (drag.type === "door") {
      onDoorMove?.(drag.corridorId, drag.endpoint, point);
      return true;
    }
    onWaypointMove?.(drag.corridorId, drag.waypointIndex, point, drag.source);
    return true;
  }

  function endCorridorDrag(event) {
    const drag = corridorDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return false;
    event.preventDefault();
    event.stopPropagation();
    corridorDragRef.current = null;
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
    if (showEditor) onSelectedRegionChange?.("");
    event.currentTarget.focus();
    panRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
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
    const nextX = pan.originX + dx;
    const nextY = pan.originY + dy;
    setView((current) => constrainView({ ...current, x: nextX, y: nextY }));
  }

  function endPan(event) {
    if (endConnectionDrag(event)) return;
    if (endMapAccessDrag(event)) return;
    if (endCorridorDrag(event)) return;
    if (endRoomDrag(event)) return;
    if (!panRef.current || panRef.current.pointerId !== event.pointerId) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
    panRef.current = null;
    setIsPanning(false);
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
      setView((current) =>
        constrainView({ ...current, y: current.y + panAmount }),
      );
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setView((current) =>
        constrainView({ ...current, y: current.y - panAmount }),
      );
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setView((current) =>
        constrainView({ ...current, x: current.x + panAmount }),
      );
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setView((current) =>
        constrainView({ ...current, x: current.x - panAmount }),
      );
    }
  }

  return (
    <>
      <div
        ref={viewportRef}
        className={cx(
          "map-viewport",
          `map-viewport--${viewportMode}`,
          isPanning && "is-panning",
          embeddedPreview && "is-embedded-preview",
          viewportClassName,
        )}
        data-map-viewport-mode={viewportMode}
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
            crosshatchStyle={crosshatchStyle}
            crosshatchOpacity={crosshatchOpacity}
            showEditor={showEditor}
            showNames={showNames}
            showRoomBadges={showRoomBadges}
            showProps={showProps}
            levelView={levelView}
            fadeOtherLevels={fadeOtherLevels}
            viewportViewBox={getViewportViewBox()}
            editorOptions={{
              draggingRegionId,
              hoveredRegionId,
              draggingCorridorHandle,
              draggingMapAccessId,
              mapAccessDragPreview,
              hoverWallHandle,
              hoverCorridorHandle,
              hoveredCorridorId,
              connectionDraft,
              selectedRegionId,
              onRoomSelect: (region) => onSelectedRegionChange?.(region?.id || ""),
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
            onClose={() => setRoomContextMenu(null)}
          />
          <DoorContextMenu
            menu={doorContextMenu}
            manualOverrides={manualOverrides || createEmptyManualOverrides()}
            isPureCave={pureCaveEditor}
            onTypeChange={onDoorTypeChange}
            onStairChange={onDoorStairChange}
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
            onClose={() => setWaypointContextMenu(null)}
          />
          <AddWaypointContextMenu
            menu={addWaypointContextMenu}
            manualOverrides={manualOverrides || createEmptyManualOverrides()}
            isPureCave={pureCaveEditor}
            onAddWaypoint={onWaypointInsert}
            onJunctionChange={onJunctionTypeChange}
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
            levelView={levelView}
            availableLevels={availableLevels}
            fadeOtherLevels={fadeOtherLevels}
            gridStyle={gridStyle}
            onNewSeed={onNewSeed}
            onToggleGrid={onToggleGrid}
            onGridStyleChange={onGridStyleChange}
            onToggleEditor={onToggleEditor}
            onToggleProps={onToggleProps}
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
            {...getGenericTooltipAttrs(
              "Zoom In",
              "Increase the map zoom.",
              "+",
            )}
            aria-label="Zoom In"
            onClick={() => zoomAtCenter(1.15)}
          >
            <i className="fa-solid fa-plus" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="map-tool-button zoom-button cruor-ui-control-surface cruor-button cruor-button--sm"
            {...getGenericTooltipAttrs(
              "Zoom Out",
              "Decrease the map zoom.",
              "-",
            )}
            aria-label="Zoom Out"
            onClick={() => zoomAtCenter(0.85)}
          >
            <i className="fa-solid fa-minus" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="map-tool-button zoom-button cruor-ui-control-surface cruor-button cruor-button--sm"
            {...getGenericTooltipAttrs(
              "Fit Map",
              "Fit the whole map in view.",
              "0",
            )}
            aria-label="Fit Map"
            onClick={fitView}
          >
            <i className="fa-solid fa-expand" aria-hidden="true" />
          </button>
          <span className="zoom-scale cruor-ui-chip-surface cruor-micro-chip">{Math.round(view.scale * 100)}%</span>
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
    ...(contextKey === "cave" || contextKey === "mine"
      ? [{ value: "cave", label: "Cave" }]
      : []),
  ];
  const types = [
    { value: "none", label: "None" },
    { value: "archive", label: "Archive" },
    ...(contextKey === "crypt"
      ? [{ value: "alcove", label: "Crypt Alcoves" }]
      : []),
    ...(contextKey === "chapel" ? [{ value: "apse", label: "Apse" }] : []),
    ...(contextKey === "ruins"
      ? [{ value: "ruined", label: "Ruined Room" }]
      : []),
  ];
  return {
    shapes,
    types,
    sizes: Object.keys(ROOM_SIZE_MENU_PRESETS).map((value) => ({
      value,
      label: value,
      dimensions: `${ROOM_SIZE_MENU_PRESETS[value].w}\u00D7${ROOM_SIZE_MENU_PRESETS[value].h}`,
    })),
    toggles: [
      { key: "notch", label: "Notch" },
      { key: "ruined", label: "Ruined" },
    ],
  };
}

function inferGeneratedRoomType(region) {
  if (region.roomType && region.roomType !== "none") return region.roomType;
  if (region.shape === "archive") return "archive";
  if (region.shape === "alcove") return "alcove";
  if (region.shape === "apse") return "apse";
  if (region.shape === "ruined-rect" || region.shape === "broken")
    return "ruined";
  return "none";
}

function inferGeneratedRoomShape(region) {
  if (
    ["archive", "alcove", "apse", "ruined-rect", "broken"].includes(
      region.shape,
    )
  )
    return "rect";
  return region.shape || "rect";
}

function getRoomStyleForMenu(region, manualOverrides) {
  const manual = manualOverrides.roomStyles?.[region.id] || {};
  return {
    surfaceKind: manual.surfaceKind || region.surfaceKind || "structure",
    shape: manual.shape || inferGeneratedRoomShape(region),
    roomType: manual.roomType || inferGeneratedRoomType(region),
    sizePreset: manual.sizePreset || region.size || "Medium",
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
  onClose,
}) {
  const [activeGroup, setActiveGroup] = useState("type");
  if (!menu) return null;
  const region = generatedMap.regions.find((item) => item.id === menu.regionId);
  if (!region) return null;
  const contextKey = getContextKey(
    generatedMap.config.context || generatedMap.config.biome,
  );
  const options = getRoomStyleMenuOptions(contextKey);
  const cavernSupported = contextKey === "cave" || contextKey === "mine";
  let style = getRoomStyleForMenu(region, manualOverrides);
  if (
    !cavernSupported &&
    (style.shape === "cave" ||
      style.surfaceKind === "cave" ||
      style.surfaceKind === "hybrid")
  ) {
    style = {
      ...style,
      shape: "rect",
      surfaceKind: "structure",
    };
  }
  const roomKind =
    style.shape === "cave" ||
    style.surfaceKind === "cave" ||
    style.surfaceKind === "hybrid"
      ? "cavern"
      : "building";
  const activeShape =
    options.shapes.find((shape) => shape.value === style.shape)?.label ||
    style.shape;
  const activeType = roomKind === "cavern" ? "Cavern" : "Building";
  const activeSize =
    options.sizes.find((size) => size.value === style.sizePreset)?.label ||
    style.sizePreset;
  const activeRoomType =
    options.types.find((type) => type.value === style.roomType)?.label ||
    style.roomType ||
    "None";
  const activeModifiers = [
    ...(style.roomType && style.roomType !== "none" ? [activeRoomType] : []),
    ...options.toggles
      .filter((toggle) => style[toggle.key])
      .map((toggle) => toggle.label),
  ];

  return (
    <div
      className="room-context-menu"
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
        <div
          className="room-context-menu__item"
          onPointerEnter={() => setActiveGroup("type")}
        >
          <button type="button" className="room-context-menu__trigger">
            <span>Type</span>
            <span>
              {activeType} {"\u203A"}
            </span>
          </button>
          {activeGroup === "type" && (
            <div className="room-context-submenu">
              <div className="room-context-submenu__hint">
                Region surface model
              </div>
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
                  {!cavernSupported
                    ? "Unavailable"
                    : roomKind === "cavern"
                      ? "Active"
                      : ""}
                </span>
              </button>
            </div>
          )}
        </div>
        <div
          className="room-context-menu__item"
          onPointerEnter={() => setActiveGroup("shape")}
        >
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
        <div
          className="room-context-menu__item"
          onPointerEnter={() => setActiveGroup("size")}
        >
          <button type="button" className="room-context-menu__trigger">
            <span>Size</span>
            <span>
              {activeSize} {"\u203A"}
            </span>
          </button>
          {activeGroup === "size" && (
            <div className="room-context-submenu">
              <div className="room-context-submenu__hint">
                Room bounding box
              </div>
              {options.sizes.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  className={style.sizePreset === size.value ? "is-active" : ""}
                  onClick={() =>
                    onChange(region.id, { sizePreset: size.value })
                  }
                >
                  <span>{size.label}</span>
                  <span>
                    {size.dimensions}
                    {style.sizePreset === size.value ? " Active" : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          className="room-context-menu__item"
          onPointerEnter={() => setActiveGroup("modifiers")}
        >
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
              <div className="room-context-submenu__hint">
                Room-specific structure
              </div>
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
                      className={
                        style.roomType === type.value ? "is-active" : ""
                      }
                      onClick={() =>
                        onChange(region.id, { roomType: type.value })
                      }
                    >
                      <span>{type.label}</span>
                      <span>
                        {style.roomType === type.value ? "Active" : ""}
                      </span>
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
  onClose,
}) {
  if (!menu) return null;
  const hasJunction = Boolean(menu.junctionKey);
  const currentJunctionType = hasJunction
    ? getManualJunctionType(
        manualOverrides.corridorJunctions || {},
        menu.junctionKey,
        "merge",
      )
    : null;
  const junctionLabels = {
    merge: isPureCave ? "Natural Merge" : "Normal Merge",
    wall: isPureCave ? "Blocked Passage" : "Wall",
    door: isPureCave ? "Passage" : "Door",
  };
  const pointLabel = isPureCave ? "Tunnel Point" : "Corridor Point";
  const junctionPointLabel = isPureCave
    ? "Tunnel Junction Point"
    : "Corridor Junction Point";
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
  onClose,
}) {
  if (!menu) return null;
  const hasJunction = Boolean(menu.junctionKey);
  const currentJunctionType = hasJunction
    ? getManualJunctionType(
        manualOverrides.corridorJunctions || {},
        menu.junctionKey,
        "merge",
      )
    : null;
  const junctionLabels = {
    merge: isPureCave ? "Natural Merge" : "Normal Merge",
    wall: isPureCave ? "Blocked Passage" : "Wall",
    door: isPureCave ? "Passage" : "Door",
  };
  const waypointLabel = isPureCave ? "Tunnel Point" : "Corridor Waypoint";
  const junctionWaypointLabel = isPureCave
    ? "Tunnel Junction Point"
    : "Corridor Junction Waypoint";
  const deleteLabel = isPureCave ? "Delete Tunnel Point" : "Delete Waypoint";
  const confirmDeleteLabel = isPureCave
    ? "Confirm Delete Tunnel Point"
    : "Confirm Delete Waypoint";
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
          onConfirm={() =>
            onDeleteWaypoint?.(menu.corridorId, menu.waypointIndex, menu.source)
          }
          onClose={onClose}
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
    "merge",
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
        <strong>
          {isPureCave ? "Tunnel Connection" : "Corridor Junction"}
        </strong>
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
  onDelete,
  onClose,
}) {
  if (!menu) return null;
  const currentType = getManualDoorType(
    manualOverrides.doorTypes || {},
    menu.corridorId,
    menu.endpoint,
    menu.fallbackType || "default",
  );
  const currentStair = getManualStairTransition(
    manualOverrides.stairTransitions || {},
    menu.corridorId,
    menu.endpoint,
    "none",
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
  levelView = LEVEL_VIEW_ALL,
  availableLevels = [],
  fadeOtherLevels = true,
  gridStyle,
  onNewSeed,
  onToggleGrid,
  onGridStyleChange,
  onToggleEditor,
  onToggleProps,
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
  const levelIconName = (level) =>
    level > 0 ? "arrow-up" : level < 0 ? "arrow-down" : "minus";
  const setGridStyleOnly = (style) => {
    onGridStyleChange?.(style);
  };
  const icon = (name) => (
    <i className={`fa-solid fa-${name}`} aria-hidden="true" />
  );

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
                className={
                  normalizeGridStyle(gridStyle) === style ? "is-active" : ""
                }
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
                          : "eye-slash",
                  )}{" "}
                  {gridLabels[style]}
                </span>
                <span>
                  {normalizeGridStyle(gridStyle) === style ? "\u2713" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className={
            showProps
              ? "room-context-menu__trigger is-active"
              : "room-context-menu__trigger"
          }
          onClick={() => run(onToggleProps)}
        >
          <span>{icon("boxes-stacked")} Props</span>
          <span>{showProps ? "On" : "Off"}</span>
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
              className={
                normalizedLevelView === LEVEL_VIEW_ALL ? "is-active" : ""
              }
              onClick={() => onLevelViewChange?.(LEVEL_VIEW_ALL)}
            >
              <span>{icon("layer-group")} All Levels</span>
              <span>
                {normalizedLevelView === LEVEL_VIEW_ALL ? "\u2713" : ""}
              </span>
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
                {region.role} {"\u00B7"} {region.graphRole || "region"}{" "}
                {"\u00B7"} level {region.level ?? 0} {"\u00B7"} depth{" "}
                {region.graphDepth ?? "\u2014"} {"\u00B7"}{" "}
                {region.placementProfile || "layout"} {"\u00B7"} surface{" "}
                {getRegionSurfaceKind(region, generatedMap)} {"\u00B7"}{" "}
                {region.shape || "rect"} {"\u00B7"}{" "}
                {region.roomType || region.shapeOptions?.roomType || "none"}{" "}
                {"\u00B7"} {region.cellRect.w}
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
  return region?.metadata && typeof region.metadata === "object"
    ? region.metadata
    : {};
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
        item.label === region.name,
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
    (corridor) => corridor.from === region.id || corridor.to === region.id,
  ).length;
  const importedConnectors = Number(importedRegion?.connectors);
  const linkCount = Number.isFinite(importedConnectors)
    ? importedConnectors
    : generatedLinks;
  const metaParts = [
    role,
    shape,
    size,
    `${linkCount} link${linkCount === 1 ? "" : "s"}`,
  ].filter(Boolean);
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
    title:
      importedRegion?.label ||
      region.name ||
      `Region ${region.number || ""}`.trim(),
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

function MapToolButton({
  icon,
  label,
  description = "",
  kbd = "",
  active = false,
  disabled = false,
  visibility = "",
  onClick,
}) {
  return (
    <button
      type="button"
      className={active ? "map-tool-button cruor-ui-control-surface cruor-button cruor-button--icon is-active" : "map-tool-button cruor-ui-control-surface cruor-button cruor-button--icon"}
      data-ui-mode-advanced-only={visibility === "advanced" ? "" : undefined}
      data-ui-mode-debug-only={visibility === "debug" ? "" : undefined}
      data-map-advanced-only={visibility === "advanced" ? "" : undefined}
      data-map-debug-only={visibility === "debug" ? "" : undefined}
      {...getGenericTooltipAttrs(label, description, kbd)}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onClick={onClick}
    >
      <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
    </button>
  );
}

function MapControlSelect({
  id,
  label,
  value,
  options,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const fieldRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : { value: option.value, label: option.label ?? option.value, description: option.description ?? "" },
  );
  const selectedOption =
    normalizedOptions.find((option) => String(option.value) === String(value)) || normalizedOptions[0];
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
      const width = Math.min(300, Math.max(rect.width, 220), Math.max(220, viewportWidth - gap * 2));
      const maxHeight = Math.min(320, Math.max(180, viewportHeight - gap * 2));
      const left = clamp(rect.left, gap, Math.max(gap, viewportWidth - width - gap));
      const belowTop = rect.bottom + 6;
      const top = belowTop + maxHeight <= viewportHeight - gap
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

  const menuPortalTarget = typeof document !== "undefined"
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
                    className={active ? "map-control-select-option is-active" : "map-control-select-option"}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span>
                      <strong>{option.label}</strong>
                      {option.description ? <small>{option.description}</small> : null}
                    </span>
                    <i className={active ? "fa-solid fa-check" : "fa-solid fa-chevron-right"} aria-hidden="true" />
                  </button>
                );
              })}
            </div>,
            menuPortalTarget,
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

function MapInspectorSection({ icon, title, eyebrow = "", children, defaultOpen = true, className = "" }) {
  return (
    <details className={`map-inspector-section cruor-ui-card-surface ${className}`.trim()} defaultOpen={defaultOpen}>
      <summary className="map-inspector-section__summary">
        <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
        <span>
          {eyebrow ? <small>{eyebrow}</small> : null}
          <strong>{title}</strong>
        </span>
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </summary>
      <div className="map-inspector-section__body">
        {children}
      </div>
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
        testSuite.passed ? "test-report cruor-ui-card-surface is-passing" : "test-report cruor-ui-card-surface is-failing"
      }
      data-ui-mode-debug-only=""
      data-map-debug-only=""
    >
      <div className="test-report__summary cruor-ui-chip-surface">
        {testSuite.tests.filter((test) => test.passed).length}/
        {testSuite.tests.length} checks passing
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
        <div className="test-report__warning">
          {testSuite.structural.warnings[0]}
        </div>
      )}
      {testSuite.structural.errors.length > 0 && (
        <div className="test-report__error">
          {testSuite.structural.errors[0]}
        </div>
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
            className="map-tool-button cruor-ui-control-surface cruor-button cruor-button--icon"
            {...getGenericTooltipAttrs(
              "Close Tests",
              "Close the structural test suite.",
              "Esc",
            )}
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

export default function CruorMapGeneratorMvp({
  initialRequest = null,
  initialManualOverrides = null,
  onExitWorkspace = null,
  onCommitWorkspace = null,
  onRefreshFromComposer = null,
  embeddedInComposer = false,
  workspaceContext = embeddedInComposer ? "composer-workspace" : "standalone-workspace",
} = {}) {
  const initialConfig = useMemo(
    () => createConfigFromNormalizedMapRequest(initialRequest, DEFAULT_CONFIG),
    [initialRequest],
  );
  const stateFileInputRef = useRef(null);
  const manualEditSnapshotRef = useRef(null);
  const [stateStatus, setStateStatus] = useState("");
  const [seed, setSeed] = useState(initialConfig.seed);
  const [roomCount, setRoomCount] = useState(initialConfig.roomCount);
  const [context, setContext] = useState(initialConfig.context);
  const [mapWidth, setMapWidth] = useState(initialConfig.mapWidth);
  const [mapHeight, setMapHeight] = useState(initialConfig.mapHeight);
  const [visualStyle, setVisualStyle] = useState(
    normalizeVisualStyle(initialConfig.visualStyle),
  );
  const [gridStyle, setGridStyle] = useState(normalizeGridStyle(initialConfig.gridStyle || "solid"));
  const [gridOpacity, setGridOpacity] = useState(0.72);
  const [crosshatchStyle, setCrosshatchStyle] = useState("classic");
  const [crosshatchOpacity, setCrosshatchOpacity] = useState(0.72);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [levelView, setLevelView] = useState(LEVEL_VIEW_ALL);
  const [fadeOtherLevels, setFadeOtherLevels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showEditor, setShowEditor] = useState(true);
  const [showNames, setShowNames] = useState(false);
  const [showRoomBadges, setShowRoomBadges] = useState(true);
  const [showProps, setShowProps] = useState(false);
  const [manualOverrides, setManualOverrides] = useState(() =>
    normalizeManualOverrides(initialManualOverrides || createEmptyManualOverrides()),
  );
  const [manualHistory, setManualHistory] = useState({ past: [], future: [] });
  const [isManualEditActive, setIsManualEditActive] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [testsModalOpen, setTestsModalOpen] = useState(false);
  const lastTestSuiteRef = useRef(null);
  const importedRegions = Array.isArray(initialRequest?.requiredRegions)
    ? initialRequest.requiredRegions
    : [];

  const config = useMemo(
    () => ({
      ...initialConfig,
      seed,
      context,
      roomCount,
      mapWidth,
      mapHeight,
      visualStyle,
      showGrid,
      gridStyle,
    }),
    [
      initialConfig,
      seed,
      context,
      roomCount,
      mapWidth,
      mapHeight,
      visualStyle,
      showGrid,
      gridStyle,
    ],
  );
  const generatedMap = useMemo(
    () => generateMap(config, manualOverrides),
    [config, manualOverrides],
  );
  const pureCaveMap = isPureCaveMap(generatedMap);
  const selectedRegion = useMemo(() => {
    return generatedMap.regions.find((region) => region.id === selectedRegionId) || null;
  }, [generatedMap.regions, selectedRegionId]);
  const availableLevels = useMemo(
    () => getAvailableMapLevels(generatedMap),
    [generatedMap],
  );
  const availableLevelsKey = availableLevels.join(":");
  const [exportValidation, setExportValidation] = useState({
    passed: false,
    missingSvg: true,
    leakedTokens: [],
  });

  useEffect(() => {
    setLevelView((current) => normalizeLevelView(current, availableLevels));
  }, [availableLevelsKey]);

  useEffect(() => {
    if (isManualEditActive) return undefined;
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
    visualStyle,
    showNames,
    showRoomBadges,
    showProps,
    isManualEditActive,
  ]);

  const computedTestSuite = useMemo(
    () =>
      isManualEditActive
        ? null
        : buildFullStructuralTestSuite(generatedMap, config, exportValidation),
    [generatedMap, config, exportValidation, isManualEditActive],
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
      if (
        target?.closest?.("input, select, textarea, [contenteditable='true']")
      )
        return;
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
        (item) => item.id === id || item.sourceRegionId === id,
      );
      if (!region) return null;
      return createRoomTooltipPayload(
        region,
        generatedMap,
        getImportedRegionForTooltip(region, importedRegions),
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

  function updateManualOverridesWithHistory(updater, status = "") {
    const previous = cloneManualOverrides(manualOverrides);
    const next = cloneManualOverrides(
      typeof updater === "function" ? updater(manualOverrides) : updater,
    );
    if (areManualOverridesEqual(previous, next)) return;
    pushManualHistorySnapshot(previous);
    setManualOverrides(next);
    setStateStatus(status);
  }

  function beginManualEdit() {
    setIsManualEditActive(true);
    manualEditSnapshotRef.current = cloneManualOverrides(manualOverrides);
  }

  function commitManualEdit() {
    setIsManualEditActive(false);
    const snapshot = manualEditSnapshotRef.current;
    manualEditSnapshotRef.current = null;
    if (!snapshot || areManualOverridesEqual(snapshot, manualOverrides)) return;
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
        gridStyle,
        visualStyle,
        levelView,
        fadeOtherLevels,
      },
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
      const previous = cloneManualOverrides(
        history.past[history.past.length - 1],
      );
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
    const nextSeed = hashStringToSeed(
      seed,
      roomCount,
      context,
      "next-seed",
    ).toString(36);
    setSeed(`cruor-${nextSeed}`);
    setManualOverrides(resetManualOverrides());
    clearManualHistory();
    setStateStatus("");
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
        gridStyle,
        visualStyle,
        levelView,
        fadeOtherLevels,
      },
      generatedMap,
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
        setContext(String(importedConfig.context || DEFAULT_CONFIG.context));
        setMapWidth(
          normalizeMapDimension(
            importedConfig.mapWidth,
            DEFAULT_CONFIG.mapWidth,
          ),
        );
        setMapHeight(
          normalizeMapDimension(
            importedConfig.mapHeight,
            DEFAULT_CONFIG.mapHeight,
          ),
        );
        setVisualStyle(
          normalizeVisualStyle(importedConfig.visualStyle, DEFAULT_CONFIG.visualStyle),
        );
        setRoomCount(
          normalizeRoomCount(
            importedConfig.roomCount,
            DEFAULT_CONFIG.roomCount,
          ),
        );
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
          if (typeof payload.uiState.gridStyle === "string")
            setGridStyle(normalizeGridStyle(payload.uiState.gridStyle));
          if (typeof payload.uiState.visualStyle === "string")
            setVisualStyle(
              normalizeVisualStyle(payload.uiState.visualStyle, visualStyle),
            );
          if (typeof payload.uiState.fadeOtherLevels === "boolean")
            setFadeOtherLevels(payload.uiState.fadeOtherLevels);
          if (typeof payload.uiState.levelView !== "undefined")
            setLevelView(normalizeLevelView(payload.uiState.levelView));
        }
        setManualOverrides(normalizeManualOverrides(payload.manualOverrides));
        clearManualHistory();
        setStateStatus("State imported.");
      } catch (error) {
        setStateStatus(
          error instanceof Error ? error.message : "Could not import state.",
        );
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function moveRoom(regionId, position) {
    const target = generatedMap.regions.find(
      (region) => region.id === regionId,
    );
    if (!target) return;
    const gridW = Math.floor(
      generatedMap.config.mapWidth / generatedMap.config.gridSize,
    );
    const gridH = Math.floor(
      generatedMap.config.mapHeight / generatedMap.config.gridSize,
    );
    const candidate = {
      ...target.cellRect,
      x: clamp(
        Math.round(position.x),
        1,
        Math.max(1, gridW - target.cellRect.w - 1),
      ),
      y: clamp(
        Math.round(position.y),
        1,
        Math.max(1, gridH - target.cellRect.h - 1),
      ),
    };
    const dx = candidate.x - target.cellRect.x;
    const dy = candidate.y - target.cellRect.y;
    const occupiedCells = new Set();
    generatedMap.regions.forEach((region) => {
      if (region.id === regionId) return;
      region.floorCells.forEach((cell) =>
        occupiedCells.add(cellKey(cell.x, cell.y)),
      );
    });
    const overlaps = target.floorCells.some((cell) =>
      occupiedCells.has(cellKey(cell.x + dx, cell.y + dy)),
    );
    if (overlaps) return;
    setManualOverrides((current) => ({
      ...current,
      roomPositions: {
        ...current.roomPositions,
        [regionId]: { x: candidate.x, y: candidate.y },
      },
    }));
  }

  function areSerializedAnchorsEqual(a, b) {
    return (
      Boolean(a && b) &&
      a.side === b.side &&
      a.cell?.x === b.cell?.x &&
      a.cell?.y === b.cell?.y
    );
  }

  function moveDoor(corridorId, endpoint, point) {
    const corridor = generatedMap.corridors.find(
      (item) => item.id === corridorId,
    );
    if (!corridor) return;
    if (corridor.isRoomLink || endpoint === "shared") {
      const fromRegion = generatedMap.regions.find(
        (item) => item.id === corridor.from,
      );
      const toRegion = generatedMap.regions.find(
        (item) => item.id === corridor.to,
      );
      if (!fromRegion || !toRegion) return;
      const sharedConnection = getClosestSharedRoomConnectionToPoint(
        fromRegion,
        toRegion,
        point,
        generatedMap.config.gridSize,
      );
      if (!sharedConnection) return;
      const nextFromAnchor = serializeManualAnchor(sharedConnection.fromAnchor);
      const nextToAnchor = serializeManualAnchor(sharedConnection.toAnchor);
      setManualOverrides((current) => {
        const fromKey = corridorEndpointKey(corridorId, "from");
        const toKey = corridorEndpointKey(corridorId, "to");
        if (
          areSerializedAnchorsEqual(
            current.doorAnchors?.[fromKey],
            nextFromAnchor,
          ) &&
          areSerializedAnchorsEqual(current.doorAnchors?.[toKey], nextToAnchor)
        )
          return current;
        return {
          ...current,
          doorAnchors: {
            ...current.doorAnchors,
            [fromKey]: nextFromAnchor,
            [toKey]: nextToAnchor,
          },
        };
      });
      return;
    }
    const regionId = endpoint === "from" ? corridor.from : corridor.to;
    const region = generatedMap.regions.find((item) => item.id === regionId);
    if (!region) return;
    const anchor = getClosestBoundaryAnchorToPoint(
      region,
      point,
      generatedMap.config.gridSize,
      generatedMap,
    );
    if (!anchor) return;
    const nextAnchor = serializeManualAnchor(anchor);
    setManualOverrides((current) => {
      const key = corridorEndpointKey(corridorId, endpoint);
      if (areSerializedAnchorsEqual(current.doorAnchors?.[key], nextAnchor))
        return current;
      return {
        ...current,
        doorAnchors: {
          ...current.doorAnchors,
          [key]: nextAnchor,
        },
      };
    });
  }

  function moveWaypoint(corridorId, waypointIndex, point, source) {
    const corridor = generatedMap.corridors.find(
      (item) => item.id === corridorId,
    );
    if (!corridor) return;
    const gridW = Math.floor(
      generatedMap.config.mapWidth / generatedMap.config.gridSize,
    );
    const gridH = Math.floor(
      generatedMap.config.mapHeight / generatedMap.config.gridSize,
    );
    const cell = normalizeManualWaypoint(
      point,
      generatedMap.config.gridSize,
      gridW,
      gridH,
    );
    if (!cell) return;
    const roomCells = getRoomCellSet(generatedMap.regions);
    if (roomCells.has(cellKey(cell.x, cell.y))) return;
    setManualOverrides((current) => {
      const currentWaypoints = current.corridorWaypoints || {};
      const currentManual = Array.isArray(currentWaypoints[corridorId])
        ? currentWaypoints[corridorId].filter(isValidPoint)
        : [];
      let nextWaypoints;
      if (source === "manual") {
        nextWaypoints = [...currentManual];
        const safeIndex = clamp(
          Number.isInteger(waypointIndex)
            ? waypointIndex
            : nextWaypoints.length,
          0,
          nextWaypoints.length,
        );
        nextWaypoints[safeIndex] = cell;
      } else {
        nextWaypoints = [cell];
      }
      return {
        ...current,
        corridorWaypoints: {
          ...currentWaypoints,
          [corridorId]: nextWaypoints.filter(isValidPoint),
        },
      };
    });
  }

  function insertWaypoint(corridorId, insertIndex, point) {
    const corridor = generatedMap.corridors.find(
      (item) => item.id === corridorId,
    );
    if (!corridor) return;
    const gridW = Math.floor(
      generatedMap.config.mapWidth / generatedMap.config.gridSize,
    );
    const gridH = Math.floor(
      generatedMap.config.mapHeight / generatedMap.config.gridSize,
    );
    const cell = normalizeManualWaypoint(
      point,
      generatedMap.config.gridSize,
      gridW,
      gridH,
    );
    if (!cell) return;
    const roomCells = getRoomCellSet(generatedMap.regions);
    if (roomCells.has(cellKey(cell.x, cell.y))) return;
    setManualOverrides((current) => {
      const currentWaypoints = current.corridorWaypoints || {};
      const currentManual = Array.isArray(currentWaypoints[corridorId])
        ? currentWaypoints[corridorId].filter(isValidPoint)
        : [];
      const safeIndex = clamp(
        Number.isInteger(insertIndex) ? insertIndex : currentManual.length,
        0,
        currentManual.length,
      );
      const nextWaypoints = [...currentManual];
      nextWaypoints.splice(safeIndex, 0, cell);
      return {
        ...current,
        corridorWaypoints: {
          ...currentWaypoints,
          [corridorId]: nextWaypoints.filter(isValidPoint),
        },
      };
    });
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
      const nextWaypoints = currentManual.filter(
        (_, index) => index !== safeIndex,
      );
      return {
        ...current,
        corridorWaypoints: {
          ...currentWaypoints,
          [corridorId]: nextWaypoints,
        },
      };
    });
  }

  function deleteConnection(corridorId) {
    if (!corridorId) return;
    updateManualOverridesWithHistory((current) => {
      const normalized = normalizeManualOverrides(current);
      const deletedConnections = Array.isArray(normalized.deletedConnections)
        ? normalized.deletedConnections
        : [];
      const customConnections = Array.isArray(normalized.customConnections)
        ? normalized.customConnections.filter(
            (connection) => connection.id !== corridorId,
          )
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
      return {
        ...normalized,
        customConnections,
        doorAnchors,
        doorTypes,
        stairTransitions,
        levels,
        corridorWaypoints,
        deletedConnections: deletedConnections.includes(corridorId)
          ? deletedConnections
          : [...deletedConnections, corridorId],
      };
    });
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
      const stairTransitions = { ...(normalized.levels.stairs || {}) };
      const next = normalizeStairTransition(stairTransition, "none");
      const key = stairTransitionKey(corridorId, endpoint);
      if (next === "none") delete stairTransitions[key];
      else stairTransitions[key] = next;
      return {
        ...normalized,
        stairTransitions,
        levels: {
          ...normalized.levels,
          stairs: stairTransitions,
        },
      };
    });
  }

  function getMapAccessAnchorForOverride(access) {
    if (!access) return null;
    if (access.displayAnchor) {
      return {
        ...access.displayAnchor,
        finalBoundaryIndex:
          access.finalBoundaryIndex ?? access.displayAnchor.finalBoundaryIndex,
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
      fallbackIntent.type || "passage",
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
      JSON.stringify(previous.anchor || null) ===
        JSON.stringify(nextOverride.anchor || null)
    );
  }

  function preservePureCaveAccessOverrides(mapAccesses, targetRegionId) {
    if (!pureCaveMap) return mapAccesses;
    (
      generatedMap.dungeonMask.mapAccesses ||
      generatedMap.mapAccesses ||
      []
    ).forEach((access) => {
      if (
        !access?.regionId ||
        access.regionId === targetRegionId ||
        mapAccesses[access.regionId]?.disabled
      )
        return;
      const anchor = getMapAccessAnchorForOverride(access);
      const frozenOverride = buildMapAccessOverride(
        access.regionId,
        anchor,
        access.type,
      );
      if (frozenOverride) mapAccesses[access.regionId] = frozenOverride;
    });
    return mapAccesses;
  }

  function setMapAccess(regionId, anchor, accessType = null) {
    const nextOverride = buildMapAccessOverride(regionId, anchor, accessType);
    if (!nextOverride) return;
    setManualOverrides((current) => {
      const mapAccesses = { ...(current.mapAccesses || {}) };
      const previous = mapAccesses[regionId];
      if (mapAccessOverrideEquals(previous, nextOverride)) return current;
      preservePureCaveAccessOverrides(mapAccesses, regionId);
      mapAccesses[regionId] = nextOverride;
      return {
        ...current,
        mapAccesses,
      };
    });
  }

  function setMapAccessWithHistory(regionId, anchor, accessType = null) {
    const nextOverride = buildMapAccessOverride(regionId, anchor, accessType);
    if (!nextOverride) return;
    updateManualOverridesWithHistory((current) => {
      const mapAccesses = { ...(current.mapAccesses || {}) };
      const previous = mapAccesses[regionId];
      if (mapAccessOverrideEquals(previous, nextOverride)) return current;
      preservePureCaveAccessOverrides(mapAccesses, regionId);
      mapAccesses[regionId] = nextOverride;
      return {
        ...current,
        mapAccesses,
      };
    });
  }

  function removeMapAccess(regionId) {
    if (!regionId) return;
    updateManualOverridesWithHistory((current) => ({
      ...current,
      mapAccesses: {
        ...(current.mapAccesses || {}),
        [regionId]: { disabled: true },
      },
    }));
  }

  function updateJunctionType(junctionKey, junctionType) {
    if (!junctionKey) return;
    updateManualOverridesWithHistory((current) => {
      const corridorJunctions = { ...(current.corridorJunctions || {}) };
      const previous = getManualJunctionOverride(
        corridorJunctions,
        junctionKey,
        "merge",
      );
      const nextType = normalizeJunctionType(junctionType);
      if (nextType === "merge") delete corridorJunctions[junctionKey];
      else {
        const nextSideIndex =
          previous.type === nextType
            ? (previous.sideIndex + 1) % 4
            : previous.sideIndex;
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

  function createConnectionFromWallDrag(connection) {
    if (
      !connection?.fromRegionId ||
      !connection?.toRegionId ||
      connection.fromRegionId === connection.toRegionId
    )
      return;
    const fromAnchor = serializeManualAnchor(connection.fromAnchor);
    const toAnchor = serializeManualAnchor(connection.toAnchor);
    if (!fromAnchor || !toAnchor) return;

    updateManualOverridesWithHistory((current) => {
      const normalized = normalizeManualOverrides(current);
      const customConnections = Array.isArray(normalized.customConnections)
        ? normalized.customConnections
        : [];
      const nextSequence = normalized.manualConnectionSequence + 1;
      const edgeId = `manual-edge-${connection.fromRegionId}-${connection.toRegionId}-${nextSequence.toString(36)}`;
      const deletedConnections = Array.isArray(normalized.deletedConnections)
        ? normalized.deletedConnections.filter((id) => id !== edgeId)
        : [];
      return {
        ...current,
        deletedConnections,
        manualConnectionSequence: nextSequence,
        customConnections: [
          ...customConnections,
          {
            id: edgeId,
            from: connection.fromRegionId,
            to: connection.toRegionId,
            kind: "manual",
            locked: true,
          },
        ],
        doorAnchors: {
          ...normalized.doorAnchors,
          [corridorEndpointKey(edgeId, "from")]: fromAnchor,
          [corridorEndpointKey(edgeId, "to")]: toAnchor,
        },
      };
    });
  }

  function updateRoomStyle(regionId, patch) {
    updateManualOverridesWithHistory((current) => ({
      ...current,
      roomStyles: {
        ...current.roomStyles,
        [regionId]: {
          ...(current.roomStyles?.[regionId] || {}),
          ...patch,
        },
      },
    }));
  }

  function resetRoomStyle(regionId) {
    updateManualOverridesWithHistory((current) => {
      const nextStyles = { ...(current.roomStyles || {}) };
      delete nextStyles[regionId];
      return {
        ...current,
        roomStyles: nextStyles,
      };
    });
  }

  function setGridRenderingStyle(value) {
    const nextGridStyle = normalizeGridStyle(value || "solid");
    setGridStyle(nextGridStyle);
    setShowGrid(nextGridStyle !== "none");
  }

  function toggleGridVisibility() {
    setShowGrid((current) => {
      const next = !current;
      if (next && normalizeGridStyle(gridStyle) === "none") {
        setGridStyle("solid");
      }
      return next;
    });
  }

  const mapViewport = (
    <MapViewport
      generatedMap={generatedMap}
      showGrid={showGrid}
      gridStyle={gridStyle}
      gridOpacity={gridOpacity}
      crosshatchStyle={crosshatchStyle}
      crosshatchOpacity={crosshatchOpacity}
      selectedRegionId={selectedRegionId}
      onSelectedRegionChange={setSelectedRegionId}
      showEditor={showEditor}
      showNames={showNames}
      showRoomBadges={showRoomBadges}
      showProps={showProps}
      levelView={levelView}
      fadeOtherLevels={fadeOtherLevels}
      availableLevels={availableLevels}
      onRoomMove={moveRoom}
      onDoorMove={moveDoor}
      onDoorTypeChange={updateDoorType}
      onDoorStairChange={updateDoorStair}
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
      onLevelViewChange={(value) =>
        setLevelView(normalizeLevelView(value, availableLevels))
      }
      onToggleFadeOtherLevels={() =>
        setFadeOtherLevels((value) => !value)
      }
      onResetEdits={() =>
        updateManualOverridesWithHistory(
          resetManualOverrides(),
          "Edits reset.",
        )
      }
      onExportSvg={downloadSvg}
      onExportGmSvg={downloadGmSvg}
      onExportPlayerSvg={downloadPlayerSvg}
      onExportPrintSvg={downloadPrintSvg}
      onExportState={exportState}
      onImportState={requestImportState}
      viewResetKey={`${seed}:${roomCount}:${context}:${mapWidth}:${mapHeight}`}
      embeddedPreview={false}
      showViewportChrome={!embeddedInComposer}
      enableViewportInteractions={true}
      viewportMode={workspaceContext}
    />
  );

  return (
    <div
      className={cx(
        "cruor-map-mvp",
        "cruor-map-workspace",
        `cruor-map-workspace--${workspaceContext}`,
        embeddedInComposer && "is-embedded-in-composer",
      )}
      data-map-context={workspaceContext}
      data-map-inspector-collapsed={inspectorCollapsed ? "true" : undefined}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div
        className={
          inspectorCollapsed
            ? "map-workspace-shell is-inspector-collapsed"
            : "map-workspace-shell"
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
            onClick={() =>
              updateManualOverridesWithHistory(
                resetManualOverrides(),
                "Edits reset.",
              )
            }
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
                {normalizeLevelView(levelView, availableLevels) ===
                LEVEL_VIEW_ALL
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
              <button
                type="button"
                className="map-tool-button map-inspector-toggle cruor-ui-control-surface cruor-button cruor-button--icon"
                {...getGenericTooltipAttrs(
                  inspectorCollapsed ? "Open Inspector" : "Collapse Inspector",
                )}
                aria-label={
                  inspectorCollapsed ? "Open Inspector" : "Collapse Inspector"
                }
                onClick={() => setInspectorCollapsed((value) => !value)}
              >
                <i
                  className={
                    inspectorCollapsed
                      ? "fa-solid fa-angles-left"
                      : "fa-solid fa-angles-right"
                  }
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {embeddedInComposer ? mapViewport : (
            <div className="map-viewport-frame">
              {mapViewport}
            </div>
          )}
        </main>

        <aside
          className="map-inspector-panel cruor-ui-panel-surface cruor-side-panel"
          aria-label="Map inspector"
          aria-hidden={inspectorCollapsed}
        >
          <div className="map-inspector-panel__scroll cruor-scroll-surface">
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
                      <div className="location-frame-info-row"><small>Room</small><strong>{metrics.number}</strong></div>
                      <div className="location-frame-info-row"><small>Squares</small><strong>{metrics.squares}</strong></div>
                      <div className="location-frame-info-row"><small>Size</small><strong>{metrics.width} × {metrics.height}</strong></div>
                      <div className="location-frame-info-row"><small>Type</small><strong>{metrics.shape}</strong></div>
                      <div className="location-frame-info-row"><small>Role</small><strong>{metrics.role}</strong></div>
                      <div className="location-frame-info-row"><small>Level</small><strong>{metrics.level}</strong></div>
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
                onChange={(value) =>
                  setVisualStyle(normalizeVisualStyle(value))
                }
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
                onChange={(value) =>
                  setLevelView(
                    normalizeLevelView(value, availableLevels),
                  )
                }
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
                    setRoomCount(
                      normalizeRoomCount(event.target.value, roomCount),
                    );
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
                      setMapWidth(
                        normalizeMapDimension(
                          event.target.value,
                          mapWidth,
                        ),
                      )
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
                      setMapHeight(
                        normalizeMapDimension(
                          event.target.value,
                          mapHeight,
                        ),
                      )
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
                  Imported from Darken a Location: {importedRegions.length}{" "}
                  region{importedRegions.length === 1 ? "" : "s"}
                </strong>
                {importedRegions.length > 0 && (
                  <span>
                    {importedRegions
                      .slice(0, 5)
                      .map((region) => region.label || region.id)
                      .join(", ")}
                    {importedRegions.length > 5
                      ? `, +${importedRegions.length - 5} more`
                      : ""}
                  </span>
                )}
              </section>
            )}

            <MapInspectorSection icon="chart-simple" title="Stats" eyebrow="Diagnostics" defaultOpen={false}>
              <div className="stats">
                <div className="stat cruor-ui-chip-surface cruor-stat">
                  <div className="stat__value">
                    {generatedMap.regions.length}
                  </div>
                  <div className="stat__label">Regions</div>
                </div>
                <div className="stat cruor-ui-chip-surface cruor-stat">
                  <div className="stat__value">
                    {generatedMap.corridors.length}
                  </div>
                  <div className="stat__label">Connections</div>
                </div>
                <div className="stat cruor-ui-chip-surface cruor-stat">
                  <div className="stat__value">
                    {generatedMap.dungeonMask.floorCells.length}
                  </div>
                  <div className="stat__label">Floor Cells</div>
                </div>
                <div className="stat cruor-ui-chip-surface cruor-stat">
                  <div className="stat__value">
                    {generatedMap.dungeonMask.doorSegments.length}
                  </div>
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

            <MapInspectorSection icon="list-ol" title="Room Key" eyebrow="Reference" defaultOpen={false}>
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
