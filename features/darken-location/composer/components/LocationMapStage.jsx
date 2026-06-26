import { useEffect, useMemo, useRef, useState } from "react";
import { LocationRoomRecapCard } from "./LocationRoomRecapCard.jsx";
import { LocationScratchRoomContextMenu } from "./LocationBriefPanel.jsx";
import { MapViewport } from "../../map-generator/map-generator.page.jsx";
import { LEVEL_VIEW_ALL } from "../../map-generator/map-generator.state.js";
import {
  LOCATION_SLOT_SCOPE_MAP,
  LOCATION_SLOT_SCOPE_REGION,
  toArray,
} from "../model/location-composer-state.js";
import {
  getAssignedComponentsForRegion,
  getDefaultSlotIdForScope,
  isSlotInScope,
} from "../model/location-composer-selectors.js";
import {
  getGeneratedRoomForRegion,
  getGeneratedRoomForRegionIndex,
  getGeneratedRoomPositionStyle,
  getGeneratedRoomSurfaceLabel,
} from "../model/location-composer-map-preview.js";
import {
  getMapSyncStatus,
  getRegionPreviewMarkers,
} from "../model/location-composer-output.js";
import { getRoomProgramEntries } from "../model/location-room-program.js";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getRoomNodeStateClasses(status = "empty") {
  if (status === "ready") return "is-ready is-filled";
  if (status === "partial") return "is-partial";
  return "is-empty";
}

function getRoomNodeSlotLabel(slotId = "") {
  if (slotId === "encounterTwist") return "Twist";
  return String(slotId || "Slot")
    .replace(/[-_]+/g, " ")
    .replace(/(^|\s)(\S)/g, (_, spacer, letter) => `${spacer}${letter.toUpperCase()}`);
}

function getRoomNodeTooltipDescription(entry) {
  if (!entry) return "Select this room.";
  const markers = Array.isArray(entry.markers) && entry.markers.length
    ? `Contains ${entry.markers.map((marker) => marker.fullLabel || marker.label || getRoomNodeSlotLabel(marker.slotId)).filter(Boolean).join(", ")}.`
    : "No assigned room features yet.";
  const missing = Array.isArray(entry.missingSlots) && entry.missingSlots.length
    ? `Missing ${entry.missingSlots.map(getRoomNodeSlotLabel).join(", ")}.`
    : "Ready room program.";
  return `${entry.roleLabel || "Room"} · ${entry.label || "Empty"}. ${markers} ${missing}`;
}

function LocationMapRoomIndicatorLayer({
  entries = [],
  generatedMapPreview = null,
  hoveredRegionId = "",
  previewViewportMetrics = null,
  selectedRegionId = "",
  onRegionContextMenu = null,
  onRegionHoverChange = null,
  onRegionSelect = null,
}) {
  if (!generatedMapPreview || !entries.length) return null;

  return (
    <div className="location-map-room-indicator-layer" aria-label="Room status indicators">
      {entries.map((entry) => {
        const active = selectedRegionId === entry.id;
        const hovered = hoveredRegionId === entry.id;
        const markers = Array.isArray(entry.markers) ? entry.markers.slice(0, 3) : [];
        const roomNumber = entry.numberLabel || String(entry.number || entry.index + 1).padStart(2, "0");
        const tooltip = `Room ${roomNumber} · ${entry.name}`;

        return (
          <button
            className={cx(
              "location-map-room-node",
              getRoomNodeStateClasses(entry.status),
              active && "is-active",
              hovered && "is-linked-hover",
              markers.length > 0 && "has-markers",
            )}
            key={entry.id}
            type="button"
            aria-label={`${tooltip}. ${entry.label || "Empty"}.`}
            aria-pressed={active}
            data-key="tooltip-generic"
            data-tooltip={tooltip}
            data-tooltip-description={getRoomNodeTooltipDescription(entry)}
            data-room-id={entry.id}
            data-room-status={entry.status || "empty"}
            style={getGeneratedRoomPositionStyle(
              generatedMapPreview,
              entry.generatedRoom,
              entry.index,
              previewViewportMetrics,
            )}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseEnter={() => onRegionHoverChange?.(entry.id)}
            onMouseLeave={() => onRegionHoverChange?.("")}
            onFocus={() => onRegionHoverChange?.(entry.id)}
            onBlur={() => onRegionHoverChange?.("")}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRegionSelect?.(entry.id);
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRegionContextMenu?.(event, entry.id);
            }}
          >
            <span className="location-map-room-node__number">{roomNumber}</span>
            {markers.length ? (
              <span className="location-map-room-node__marker-strip" aria-hidden="true">
                {markers.map((marker) => (
                  <span
                    className={`location-map-room-node__marker location-map-room-node__marker--${marker.slotId || "slot"}`}
                    key={marker.slotId || marker.label}
                  >
                    <i className={`fa-solid ${marker.icon || "fa-diamond"}`} aria-hidden="true" />
                  </span>
                ))}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function LocationMapPreview({
  generatedMap,
  error,
  viewResetKey,
  isMapEditing = false,
  selectedRegionId = "",
  onRegionSelect = null,
  onRegionHoverChange = null,
  onRegionContextMenu = null,
  onViewportMetricsChange = null,
  previewRegionMarkers = {},
}) {
  const previewManualOverrides = useMemo(
    () => ({
      rooms: {},
      corridors: {},
      props: {},
      labels: {},
    }),
    [],
  );
  if (!generatedMap) {
    return (
      <div className="location-map-preview location-map-preview-surface location-map-preview--fallback" aria-label="Map preview fallback">
        <div className="location-map-preview__fallback-card">
          <strong>{error ? "Preview unavailable" : "Preview"}</strong>
        </div>
      </div>
    );
  }

  return (
    <div
      className="location-map-preview location-map-preview-surface location-map-preview--live"
      aria-label="Generated map preview"
      onContextMenuCapture={(event) => {
        if (isMapEditing) return;
        if (event.target?.closest?.(".room-preview-hotspot")) return;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <MapViewport
        generatedMap={generatedMap}
        showGrid={true}
        gridStyle="solid"
        showEditor={isMapEditing}
        showNames={isMapEditing}
        showProps={isMapEditing}
        levelView={LEVEL_VIEW_ALL}
        fadeOtherLevels={true}
        availableLevels={[]}
        manualOverrides={previewManualOverrides}
        selectedRegionId={selectedRegionId}
        onSelectedRegionChange={onRegionSelect}
        onRegionHoverChange={onRegionHoverChange}
        onRegionContextMenu={onRegionContextMenu}
        viewResetKey={viewResetKey}
        embeddedPreview={true}
        showViewportChrome={false}
        enableViewportInteractions={isMapEditing}
        enablePreviewRegionHotspots={!isMapEditing}
        viewportMode="composer-preview"
        viewportClassName="location-map-preview-viewport"
        onViewportMetricsChange={onViewportMetricsChange}
        previewRegionMarkers={previewRegionMarkers}
      />
    </div>
  );
}

export function LocationMapStage({
  state,
  setState,
  mapRequest,
  digest,
  generatedMapPreview,
  previewError,
  previewResetKey,
  uiMode = "simple",
  isMapEditing = false,
  modeControls = null,
  leftPanel = null,
  rightPanel = null,
  navigatorPanel = null,
  workspacePanel = null,
  contextPanel = null,
  toolbarPanel = null,
  bottomDockPanel = null,
  regionSelectionScope = LOCATION_SLOT_SCOPE_REGION,
  onScratchRoomFocusSlot = null,
  onScratchRoomUpdate = null,
}) {
  const isSimpleMode = uiMode === "simple";
  const showStageDetails = !isSimpleMode;
  const showInteractiveOverlay = !isMapEditing;
  const regions = state.locationRegions || [];
  const selectedSources = toArray(state.sourceAnchors);
  const selectedHorrors = toArray(state.horrors);
  const [hoveredRegionId, setHoveredRegionId] = useState("");
  const [previewViewportMetrics, setPreviewViewportMetrics] = useState(null);
  const [scratchRoomMenu, setScratchRoomMenu] = useState(null);
  const scratchRoomMenuRef = useRef(null);
  const activeRegionComponents = getAssignedComponentsForRegion(state, state.activeRegionId);
  const activeGeneratedRoom = getGeneratedRoomForRegion(generatedMapPreview, state.activeRegionId);
  const hoveredRegionIndex = regions.findIndex((region) => region.id === hoveredRegionId);
  const hoveredRegion = hoveredRegionIndex >= 0 ? regions[hoveredRegionIndex] : null;
  const hoveredRegionComponents = hoveredRegion
    ? getAssignedComponentsForRegion(state, hoveredRegion.id)
    : [];
  const hoveredGeneratedRoom = hoveredRegion
    ? getGeneratedRoomForRegionIndex(generatedMapPreview, hoveredRegion.id, hoveredRegionIndex)
    : null;
  const hoveredSurfaceLabel = hoveredGeneratedRoom
    ? getGeneratedRoomSurfaceLabel(hoveredGeneratedRoom)
    : "";
  const mapSyncStatus = getMapSyncStatus(mapRequest, generatedMapPreview, regions);
  const showScratchRoomControls = Boolean(
    !isMapEditing &&
    state.dungeonMode === "scratch" &&
    onScratchRoomUpdate
  );
  const previewRegionMarkers = useMemo(() => (
    Object.fromEntries(
      regions.map((region) => [region.id, getRegionPreviewMarkers(state, region.id)]),
    )
  ), [regions, state]);
  const roomProgramEntries = useMemo(
    () => getRoomProgramEntries(state, generatedMapPreview).filter((entry) => entry.generatedRoom),
    [state, generatedMapPreview],
  );

  function handlePreviewViewportMetricsChange(nextMetrics) {
    setPreviewViewportMetrics((currentMetrics) => {
      const current = currentMetrics?.viewBox;
      const next = nextMetrics?.viewBox;
      if (
        current &&
        next &&
        Math.abs(current.x - next.x) < 0.01 &&
        Math.abs(current.y - next.y) < 0.01 &&
        Math.abs(current.width - next.width) < 0.01 &&
        Math.abs(current.height - next.height) < 0.01
      ) {
        return currentMetrics;
      }
      return nextMetrics;
    });
  }

  useEffect(() => {
    if (!scratchRoomMenu || typeof document === "undefined") return undefined;

    function handlePointerDown(event) {
      if (scratchRoomMenuRef.current?.contains?.(event.target)) return;
      if (event.target?.closest?.(".location-choice-menu, .location-choice-option")) return;
      setScratchRoomMenu(null);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setScratchRoomMenu(null);
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [scratchRoomMenu]);

  function selectWholeMapTarget(event) {
    if (isMapEditing) return;
    const target = event.target;
    if (target?.closest?.(
      ".room-preview-hotspot, .location-region-node, .location-room-recap-anchor, .location-stage-navigator-overlay, .location-map-stage-toolbar, .location-advanced-output, .location-scratch-room-context-menu, button, a, input, select, textarea",
    )) {
      return;
    }

    setState((current) => ({
      ...current,
      activeSlotScope: LOCATION_SLOT_SCOPE_MAP,
      activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_MAP)
        ? current.activeSlot
        : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_MAP),
    }));
  }

  function resolveComposerRegionId(regionId) {
    if (!regionId) return "";
    if (regions.some((region) => region.id === regionId)) return regionId;

    const generatedRoom = generatedMapPreview?.regions?.find((room) => (
      room?.id === regionId ||
      room?.sourceRegionId === regionId ||
      room?.requestMetadata?.sourceRegionId === regionId ||
      room?.metadata?.sourceRegionId === regionId
    ));

    return (
      generatedRoom?.sourceRegionId ||
      generatedRoom?.requestMetadata?.sourceRegionId ||
      generatedRoom?.metadata?.sourceRegionId ||
      regionId
    );
  }

  function selectRegionTarget(regionId) {
    const composerRegionId = resolveComposerRegionId(regionId);
    if (!composerRegionId || isMapEditing) return;
    setState((current) => ({
      ...current,
      activeRegionId: composerRegionId,
      activeSlotScope: regionSelectionScope,
      activeSlot: isSlotInScope(current.activeSlot, regionSelectionScope)
        ? current.activeSlot
        : getDefaultSlotIdForScope(regionSelectionScope),
    }));
  }

  function openScratchRoomMenu(event, regionId) {
    const composerRegionId = resolveComposerRegionId(regionId);
    if (!composerRegionId || isMapEditing || state.dungeonMode !== "scratch") return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    selectRegionTarget(composerRegionId);
    const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
    const viewportHeight = typeof window === "undefined" ? 720 : window.innerHeight;
    setScratchRoomMenu({
      regionId: composerRegionId,
      x: Math.min((event?.clientX || 0) + 8, viewportWidth - 320),
      y: Math.min((event?.clientY || 0) + 8, viewportHeight - 420),
    });
  }

  return (
    <main className="cruor-composer-stage location-composer__stage" aria-label="Location map stage">
      <section
        className={cx(
          "location-map-stage",
          generatedMapPreview && "has-live-preview",
          isSimpleMode && "is-simple-surface",
          `is-map-${mapSyncStatus.mode}`,
          workspacePanel ? "location-map-stage--workspace" : "location-map-stage--preview",
        )}
        data-location-map-surface={workspacePanel ? "workspace" : "preview"}
      >
        {workspacePanel ? (
          <div className="location-map-workspace-host" aria-label="Full map workspace">
            {workspacePanel}
          </div>
        ) : (
          <>
            {leftPanel}

            {navigatorPanel ? (
              <div className="location-stage-navigator-overlay" aria-label="Location component navigator drawer">
                {navigatorPanel}
              </div>
            ) : null}

            <div className="location-map-stage__center" onClick={selectWholeMapTarget}>
              {modeControls}

              {toolbarPanel ? (
                <div className="location-map-stage-toolbar" aria-label="Map stage tools">
                  {toolbarPanel}
                </div>
              ) : null}

          <LocationMapPreview
            generatedMap={generatedMapPreview}
            error={previewError}
            viewResetKey={previewResetKey}
            isMapEditing={isMapEditing}
            selectedRegionId={state.activeRegionId}
            onRegionSelect={selectRegionTarget}
            onRegionHoverChange={setHoveredRegionId}
            onRegionContextMenu={(event, regionId) => openScratchRoomMenu(event, regionId)}
            onViewportMetricsChange={handlePreviewViewportMetricsChange}
            previewRegionMarkers={previewRegionMarkers}
          />

          {showInteractiveOverlay && generatedMapPreview ? (
            <LocationMapRoomIndicatorLayer
              entries={roomProgramEntries}
              generatedMapPreview={generatedMapPreview}
              hoveredRegionId={hoveredRegionId}
              previewViewportMetrics={previewViewportMetrics}
              selectedRegionId={state.activeRegionId}
              onRegionContextMenu={(event, regionId) => openScratchRoomMenu(event, regionId)}
              onRegionHoverChange={setHoveredRegionId}
              onRegionSelect={selectRegionTarget}
            />
          ) : null}

          {showInteractiveOverlay && hoveredRegion ? (
            <div
              className="location-room-recap-anchor location-room-recap-anchor--hover"
              style={getGeneratedRoomPositionStyle(
                generatedMapPreview,
                hoveredGeneratedRoom,
                hoveredRegionIndex,
                previewViewportMetrics,
              )}
            >
              <LocationRoomRecapCard
                activeRegion={hoveredRegion}
                assignedComponents={hoveredRegionComponents}
                generatedRoom={hoveredGeneratedRoom}
                surfaceLabel={hoveredSurfaceLabel}
              />
            </div>
          ) : null}

          {contextPanel ? (
            <div className="location-map-context-panel" aria-label="Selected room controls">
              {contextPanel}
            </div>
          ) : null}

          {scratchRoomMenu && showScratchRoomControls ? (
            <LocationScratchRoomContextMenu
              ref={scratchRoomMenuRef}
              region={regions.find((region) => region.id === scratchRoomMenu.regionId)}
              x={scratchRoomMenu.x}
              y={scratchRoomMenu.y}
              onClose={() => setScratchRoomMenu(null)}
              onFocusSlot={onScratchRoomFocusSlot}
              onUpdateRoom={onScratchRoomUpdate}
            />
          ) : null}

          {showStageDetails ? (
            <div className="location-map-stage__head location-map-stage__head--compact">
              <p className="location-kicker">Map</p>
              <h2>{state.title || "Cursed Location"}</h2>
              <p>{state.context} · {selectedHorrors[0] || "Horror"} · {selectedSources[0] || "Source"}</p>
            </div>
          ) : null}

          {showInteractiveOverlay && !generatedMapPreview ? (
            <div className="location-region-board" aria-label="Generated location regions">
              {regions.map((region, index) => {
                const active = state.activeRegionId === region.id;
                const regionComponents = getAssignedComponentsForRegion(state, region.id);
                const regionMarkers = getRegionPreviewMarkers(state, region.id);
                const generatedRoom = getGeneratedRoomForRegionIndex(generatedMapPreview, region.id, index);
                return (
                  <button
                    className={cx(
                      "location-region-node",
                      active && "is-active",
                      active && "is-target-region",
                      regionComponents.length > 0 && "has-components",
                      generatedRoom && "is-synced-to-room",
                    )}
                    key={region.id}
                    type="button"
                    aria-label={`Select ${region.name} as the active region target`}
                    aria-pressed={active}
                    title={region.name}
                    style={getGeneratedRoomPositionStyle(generatedMapPreview, generatedRoom, index, previewViewportMetrics)}
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() =>
                      setHoveredRegionId((current) =>
                        current === region.id ? "" : current,
                      )
                    }
                    onFocus={() => setHoveredRegionId(region.id)}
                    onBlur={() =>
                      setHoveredRegionId((current) =>
                        current === region.id ? "" : current,
                      )
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      selectRegionTarget(region.id);
                    }}
                  >
                    <span>{generatedRoom?.number ? String(generatedRoom.number).padStart(2, "0") : String(index + 1).padStart(2, "0")}</span>
                    <strong>{region.name}</strong>
                    {regionMarkers.length ? (
                      <span className="location-region-marker-strip" aria-label="Assigned regional slots">
                        {regionMarkers.map((marker) => (
                          <span
                            className={`location-region-slot-marker location-region-slot-marker--${marker.slotId}`}
                            key={marker.slotId}
                            title={`${marker.fullLabel}: ${marker.title}`}
                            aria-label={`${marker.fullLabel}: ${marker.title}`}
                          >
                            <i className={`fa-solid ${marker.icon}`} aria-hidden="true" />
                            {marker.label}
                          </span>
                        ))}
                      </span>
                    ) : null}
                    {showStageDetails ? (
                      <em className="location-region-node__target">{active ? "Target" : generatedRoom ? "Room" : "Region"}</em>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          {showInteractiveOverlay && showStageDetails && activeRegionComponents.length ? (
            <div className="location-region-attachment-strip" aria-label="Active region attachments">
              {activeRegionComponents.slice(0, 3).map((component) => (
                <span key={`${component.assignment.slotId}-${component.id}`}>
                  <i className="fa-solid fa-diamond" aria-hidden="true" />
                  {component.title}
                </span>
              ))}
            </div>
          ) : null}

          {showStageDetails ? (
            <div className="location-stage-footer location-stage-footer--compact">
              <div><strong>{digest.filledSlots}/{digest.totalSlots}</strong></div>
              <div><strong>{mapSyncStatus.mode === "synced" ? "Synced" : mapSyncStatus.label}</strong></div>
              <div><strong>{activeGeneratedRoom ? `Room ${activeGeneratedRoom.number || "—"}` : "Region"}</strong></div>
            </div>
          ) : null}
            </div>

            {rightPanel}

            {bottomDockPanel}
          </>
        )}
      </section>
    </main>
  );
}
