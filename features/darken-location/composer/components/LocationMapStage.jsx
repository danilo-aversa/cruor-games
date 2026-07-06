import { useMemo, useState } from "react";
import { LocationRoomRecapCard } from "./LocationRoomRecapCard.jsx";
import { CruorMapGeneratorMvp } from "../../map-generator/map-generator.page.jsx";
import {
  LOCATION_SLOT_SCOPE_MAP,
  LOCATION_SLOT_SCOPE_REGION,
} from "../model/location-composer-state.js";
import {
  getAssignedComponentsForRegion,
  getDefaultSlotIdForScope,
  isSlotInScope,
} from "../model/location-composer-selectors.js";
import {
  getGeneratedRoomForRegionIndex,
  getGeneratedRoomPositionStyle,
  getGeneratedRoomSurfaceLabel,
} from "../model/location-composer-map-preview.js";
import {
  getMapSyncStatus,
  getRegionPreviewMarkers,
} from "../model/location-composer-output.js";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LocationMapPreview({
  error,
  initialManualOverrides = null,
  mapRequest,
  previewRegionMarkers = {},
  onManualWorkspaceChange = null,
  onRefreshFromComposer = null,
  onViewportMetricsChange = null,
  selectedRegionId = "",
  onRegionHoverChange = null,
  onRegionSelect = null,
}) {
  if (!mapRequest) {
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
      className="location-map-preview location-map-preview-surface location-map-preview--live location-map-preview--inline-editor"
      aria-label="Editable generated map"
    >
      <CruorMapGeneratorMvp
        initialRequest={mapRequest}
        initialManualOverrides={initialManualOverrides}
        embeddedInComposer={true}
        inlineComposerEditor={true}
        workspaceContext="composer-inline-editor"
        composerSelectedRegionId={selectedRegionId}
        previewRegionMarkers={previewRegionMarkers}
        onComposerRegionHoverChange={onRegionHoverChange}
        onComposerSelectedRegionChange={onRegionSelect}
        onCommitWorkspace={onManualWorkspaceChange}
        onRefreshFromComposer={onRefreshFromComposer}
        onViewportMetricsChange={onViewportMetricsChange}
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
  uiMode = "simple",
  mapManualOverrides = null,
  onManualWorkspaceChange = null,
  onRefreshMapWorkspace = null,
  modeControls = null,
  leftPanel = null,
  rightPanel = null,
  navigatorPanel = null,
  workspacePanel = null,
  contextPanel = null,
  toolbarPanel = null,
  bottomDockPanel = null,
  onCloseNavigator = null,
  onComposerRegionSelect = null,
}) {
  const isSimpleMode = uiMode === "simple";
  const showStageDetails = !isSimpleMode;
  const showInteractiveOverlay = true;
  const regions = state.locationRegions || [];
  const [hoveredRegionId, setHoveredRegionId] = useState("");
  const [previewViewportMetrics, setPreviewViewportMetrics] = useState(null);
  const activeRegionComponents = getAssignedComponentsForRegion(state, state.activeRegionId);
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
  const previewRegionMarkers = useMemo(() => (
    Object.fromEntries(
      regions.map((region) => [region.id, getRegionPreviewMarkers(state, region.id)]),
    )
  ), [regions, state]);

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


  function clearRegionTarget() {
    onCloseNavigator?.();
    setState((current) => ({
      ...current,
      activeRegionId: "",
      activeSlotScope: LOCATION_SLOT_SCOPE_MAP,
      activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_MAP)
        ? current.activeSlot
        : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_MAP),
    }));
    onComposerRegionSelect?.("");
  }

  function selectWholeMapTarget(event) {
    const target = event.target;
    if (target?.closest?.(
      ".cruor-map-inline-editor, .map-viewport, .map-pan-layer, svg, .editor-overlays, .labels, .room-preview-hotspot, .location-region-node, .location-room-recap-anchor, .location-stage__navigator-column, .location-map-stage-toolbar, .location-advanced-output, .location-scratch-room-context-menu, button, a, input, select, textarea",
    )) {
      return;
    }

    clearRegionTarget();
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

    if (!composerRegionId) {
      clearRegionTarget();
      return;
    }

    const currentRegionSlotIsValid = isSlotInScope(state.activeSlot, LOCATION_SLOT_SCOPE_REGION);
    const alreadySelected =
      state.activeRegionId === composerRegionId &&
      state.activeSlotScope === LOCATION_SLOT_SCOPE_REGION &&
      currentRegionSlotIsValid;
    if (!alreadySelected) {
      setState((current) => ({
        ...current,
        activeRegionId: composerRegionId,
        activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
        activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_REGION)
          ? current.activeSlot
          : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_REGION),
      }));
    }
    onComposerRegionSelect?.(composerRegionId);
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
        data-testid="dark-places-map-stage"
      >
        {workspacePanel ? (
          <div className="location-map-workspace-host" aria-label="Full map workspace">
            {workspacePanel}
          </div>
        ) : (
          <>
            {navigatorPanel ? (
              <div
                className="location-stage__navigator-focus-overlay"
                aria-hidden="true"
                onClick={() => onCloseNavigator?.()}
              />
            ) : null}

            {leftPanel}

            {navigatorPanel ? (
              <div className="location-stage__navigator-column" aria-label="Location component navigator drawer">
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
            error={previewError}
            mapRequest={mapRequest}
            initialManualOverrides={mapManualOverrides}
            selectedRegionId={state.activeRegionId}
            previewRegionMarkers={previewRegionMarkers}
            onRegionHoverChange={setHoveredRegionId}
            onRegionSelect={selectRegionTarget}
            onManualWorkspaceChange={onManualWorkspaceChange}
            onRefreshFromComposer={onRefreshMapWorkspace}
            onViewportMetricsChange={handlePreviewViewportMetricsChange}
          />

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

            </div>

            {rightPanel}

            {bottomDockPanel}
          </>
        )}
      </section>
    </main>
  );
}
