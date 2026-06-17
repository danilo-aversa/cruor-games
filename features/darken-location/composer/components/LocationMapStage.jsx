import { useMemo, useState } from "react";
import { LocationRoomRecapCard } from "./LocationRoomRecapCard.jsx";
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

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LocationMapPreview({ generatedMap, error, viewResetKey, isMapEditing = false }) {
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
      <div className="location-map-preview location-map-preview--fallback" aria-label="Map preview fallback">
        <div className="location-map-preview__fallback-card">
          <strong>{error ? "Preview unavailable" : "Preview"}</strong>
        </div>
      </div>
    );
  }

  return (
    <div
      className="location-map-preview location-map-preview--live"
      aria-label="Generated map preview"
      onContextMenuCapture={(event) => {
        if (isMapEditing) return;
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
        viewResetKey={viewResetKey}
        embeddedPreview={true}
        showViewportChrome={false}
        enableViewportInteractions={isMapEditing}
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
}) {
  const isSimpleMode = uiMode === "simple";
  const showStageDetails = !isSimpleMode;
  const showInteractiveOverlay = !isMapEditing;
  const regions = state.locationRegions || [];
  const selectedSources = toArray(state.sourceAnchors);
  const selectedHorrors = toArray(state.horrors);
  const [hoveredRegionId, setHoveredRegionId] = useState("");
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

  function selectWholeMapTarget(event) {
    if (isMapEditing) return;
    const target = event.target;
    if (target?.closest?.(
      ".location-region-node, .location-room-recap-anchor, .location-stage-navigator-overlay, .location-advanced-output, button, a, input, select, textarea",
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

  return (
    <main className="cruor-composer-stage location-composer__stage" aria-label="Location map stage">
      <section
        className={cx(
          "location-map-stage",
          generatedMapPreview && "has-live-preview",
          isSimpleMode && "is-simple-surface",
          `is-map-${mapSyncStatus.mode}`,
        )}
      >
        {workspacePanel ? (
          workspacePanel
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

          <LocationMapPreview
            generatedMap={generatedMapPreview}
            error={previewError}
            viewResetKey={previewResetKey}
            isMapEditing={isMapEditing}
          />

          {showInteractiveOverlay && hoveredRegion ? (
            <div
              className="location-room-recap-anchor location-room-recap-anchor--hover"
              style={getGeneratedRoomPositionStyle(
                generatedMapPreview,
                hoveredGeneratedRoom,
                hoveredRegionIndex,
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

          {showStageDetails ? (
            <div className="location-map-stage__head location-map-stage__head--compact">
              <p className="location-kicker">Map</p>
              <h2>{state.title || "Cursed Location"}</h2>
              <p>{state.context} · {selectedHorrors[0] || "Horror"} · {selectedSources[0] || "Source"}</p>
            </div>
          ) : null}

          {showInteractiveOverlay ? (
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
                    style={getGeneratedRoomPositionStyle(generatedMapPreview, generatedRoom, index)}
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
                      setState((current) => ({
                        ...current,
                        activeRegionId: region.id,
                        activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
                        activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_REGION)
                          ? current.activeSlot
                          : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_REGION),
                      }));
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
          </>
        )}
      </section>
    </main>
  );
}
