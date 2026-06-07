import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../map-generator/map-generator.styles.css";
import {
  assignComponentToSlot,
  createInitialLocationComposerState,
  createLocationComposerSnapshot,
  createLocationMapSeed,
  normalizeLocationSlotScope,
  removeComponentFromSlot,
  toArray,
} from "./model/location-composer-state.js";
import {
  getAssignedComponentsForSlotScope,
  getComponentsForSlot,
  getComposerDigest,
  getDefaultSlotIdForScope,
  getLocationSlotsForScope,
  getSelectedComponents,
  getSlotFilledCountForScope,
  isSlotInScope,
} from "./model/location-composer-selectors.js";
import { LOCATION_REGION_TEMPLATES } from "../../crucible/crucible.location-regions.js";
import {
  createDraftFingerprint,
  deleteStoredLocationDraftWithStatus,
  getLocalDraftStorageStatus,
  getStoredDraftSummary,
  readStoredLocationDraft,
  restoreLocationDraftState,
  saveLocationDraftWithStatus,
} from "./model/location-composer-draft.js";
import {
  createLocationPreviewModel,
  getLocationPreviewResetKey,
} from "./model/location-composer-preview.js";
import { getGeneratedRoomForRegion } from "./model/location-composer-map-preview.js";
import { LocationBriefPanel } from "./components/LocationBriefPanel.jsx";
import { LocationDraftControls } from "./components/LocationDraftControls.jsx";
import { LocationComponentPickerModal } from "./components/LocationComponentPickerModal.jsx";
import { LocationMapStage } from "./components/LocationMapStage.jsx";
import { LocationSlotRail } from "./components/LocationSlotRail.jsx";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LocationFrameInfoRow({ label, value }) {
  return (
    <span className="location-frame-info-row">
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function getSourceLabel(state) {
  return toArray(state.sourceAnchors).filter((source) => source !== "Any Source")[0] || "Any Source";
}

function getHorrorLabel(state) {
  return toArray(state.horrors)[0] || state.horror || "Horror";
}

function LocationBuilderModeSwitch({ builderMode, setBuilderMode }) {
  return (
    <section className="location-map-mode-card" aria-label="Composer mode">
      <div className="location-map-mode-switch" role="group" aria-label="Composer mode">
        <button
          className={cx("location-map-mode-button", builderMode === "frame" && "is-active")}
          type="button"
          aria-pressed={builderMode === "frame"}
          onClick={() => setBuilderMode("frame")}
        >
          Frame
        </button>
        <button
          className={cx("location-map-mode-button", builderMode === "slots" && "is-active")}
          type="button"
          aria-pressed={builderMode === "slots"}
          onClick={() => setBuilderMode("slots")}
        >
          Slots
        </button>
      </div>
    </section>
  );
}

function LocationRecapPanel({
  onNewMapSeed,
  onOpenMapGenerator,
  onRenameLocation,
  snapshot,
  state,
}) {
  const rooms = Array.isArray(state.locationRegions) ? state.locationRegions.length : 0;
  const roomWord = rooms === 1 ? "Room" : "Rooms";
  const sourceLabel = getSourceLabel(state);
  const horrorLabel = getHorrorLabel(state);

  return (
    <aside
      className="anatomy-stage__column anatomy-stage__column--right cruor-composer-rail location-composer__rail location-composer__rail--right location-map-recap-rail location-frame-info monster-frame-info"
      aria-label="Current Location Frame"
    >
      <section className="location-frame-info-card location-frame-info-card--hero monster-frame-info-card monster-frame-info-card--hero">
        <span>Current Location</span>
        <label className="location-frame-name-editor monster-frame-name-editor">
          <span className="sr-only">Location name</span>
          <input
            type="text"
            aria-label="Location name"
            value={state.title || ""}
            onChange={(event) => onRenameLocation(event.target.value)}
          />
        </label>
        <em>{state.context || "Context"} · {horrorLabel} · {rooms || 0} {roomWord}</em>
      </section>


      <section className="location-frame-info-card monster-frame-info-card">
        <div className="location-frame-info-grid monster-frame-info-grid">
          <LocationFrameInfoRow label="Context" value={state.context || "Context"} />
          <LocationFrameInfoRow label="Horror" value={horrorLabel} />
          <LocationFrameInfoRow label="Source" value={sourceLabel} />
          <LocationFrameInfoRow label="Rooms" value={String(rooms || 0)} />
        </div>
      </section>


      <section className="location-frame-info-card monster-frame-info-card location-location-action-card location-location-action-card--secondary" aria-label="Secondary location actions">
        <details className="location-secondary-actions">
          <summary>More</summary>
          <button
            className="cruor-composer-control location-primary-action"
            type="button"
            onClick={onNewMapSeed}
          >
            New Map Seed
          </button>
          <button
            className="cruor-composer-control location-primary-action"
            type="button"
            onClick={() => onOpenMapGenerator?.(snapshot)}
          >
            Open Map Workspace
          </button>
        </details>
      </section>
    </aside>
  );
}

export default function DarkenLocationComposerPage({ onOpenMapGenerator, onSnapshotProviderReady, uiMode = "simple" } = {}) {
  const [state, setState] = useState(() => createInitialLocationComposerState(LOCATION_REGION_TEMPLATES));
  const [draftStatus, setDraftStatus] = useState("");
  const [draftSummary, setDraftSummary] = useState(() => getStoredDraftSummary());
  const [draftStorageStatus, setDraftStorageStatus] = useState(() => getLocalDraftStorageStatus());
  const [savedDraftFingerprint, setSavedDraftFingerprint] = useState("");
  const [builderMode, setBuilderMode] = useState("slots");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const draftStatusTimeoutRef = useRef(null);

  const selectedComponents = useMemo(() => getSelectedComponents(state), [state]);
  const snapshot = useMemo(() => createLocationComposerSnapshot(state, selectedComponents), [state, selectedComponents]);
  const previewModel = useMemo(() => createLocationPreviewModel(snapshot), [snapshot]);
  const { mapRequest, previewResult } = previewModel;
  const generatedMapPreview = previewResult.generatedMap;
  const digest = useMemo(() => getComposerDigest(state), [state]);
  const draftFingerprint = useMemo(() => createDraftFingerprint(state), [state]);
  const hasUnsavedChanges = Boolean(savedDraftFingerprint) && draftFingerprint !== savedDraftFingerprint;
  const previewResetKey = useMemo(() => getLocationPreviewResetKey(mapRequest, digest, state), [digest, mapRequest, state]);

  const setTransientDraftStatus = useCallback((message) => {
    setDraftStatus(message);
    window.clearTimeout(draftStatusTimeoutRef.current);
    draftStatusTimeoutRef.current = window.setTimeout(() => setDraftStatus(""), 2200);
  }, []);

  const saveDraft = useCallback(() => {
    const result = saveLocationDraftWithStatus(state);
    setDraftStorageStatus(getLocalDraftStorageStatus());

    if (!result.ok) {
      setTransientDraftStatus(result.reason || "Save unavailable");
      return;
    }

    setDraftSummary(getStoredDraftSummary());
    setSavedDraftFingerprint(createDraftFingerprint(state));
    setTransientDraftStatus("Draft saved");
  }, [setTransientDraftStatus, state]);

  const loadDraft = useCallback(() => {
    setDraftStorageStatus(getLocalDraftStorageStatus());
    const storedDraft = readStoredLocationDraft();
    if (!storedDraft) {
      setTransientDraftStatus("No draft found");
      return;
    }

    if (hasUnsavedChanges) {
      const confirmed = window.confirm("Load saved draft and discard current changes?");
      if (!confirmed) return;
    }

    const fallbackState = createInitialLocationComposerState(LOCATION_REGION_TEMPLATES);
    const restoredState = restoreLocationDraftState(storedDraft, fallbackState);
    setState(restoredState);
    setSavedDraftFingerprint(createDraftFingerprint(restoredState));
    setDraftSummary(getStoredDraftSummary());
    setTransientDraftStatus("Draft loaded");
  }, [hasUnsavedChanges, setTransientDraftStatus]);

  const clearSavedDraft = useCallback(() => {
    if (!draftSummary) {
      setTransientDraftStatus("No draft saved");
      return;
    }

    const confirmed = window.confirm("Clear saved draft?");
    if (!confirmed) return;

    const result = deleteStoredLocationDraftWithStatus();
    setDraftStorageStatus(getLocalDraftStorageStatus());

    if (!result.ok) {
      setTransientDraftStatus(result.reason || "Unable to clear draft");
      return;
    }

    setDraftSummary(null);
    setSavedDraftFingerprint(createDraftFingerprint(state));
    setTransientDraftStatus("Draft cleared");
  }, [draftSummary, setTransientDraftStatus, state]);

  const refreshMapSeed = useCallback(() => {
    setState((current) => ({
      ...current,
      seed: createLocationMapSeed(),
    }));
    setTransientDraftStatus("Map seed refreshed");
  }, [setTransientDraftStatus]);

  const renameLocation = useCallback((title) => {
    setState((current) => ({
      ...current,
      title,
    }));
  }, []);


  const resetComposer = useCallback(() => {
    const confirmed = window.confirm("Reset current composer?");
    if (!confirmed) return;

    const resetState = createInitialLocationComposerState(LOCATION_REGION_TEMPLATES);
    setState(resetState);
    setSavedDraftFingerprint(createDraftFingerprint(resetState));
    setBuilderMode("frame");
    setDrawerOpen(true);
    setTransientDraftStatus("Composer reset");
  }, [setTransientDraftStatus]);

  useEffect(() => {
    if (!savedDraftFingerprint) {
      setSavedDraftFingerprint(draftFingerprint);
    }
  }, [draftFingerprint, savedDraftFingerprint]);

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    return () => window.clearTimeout(draftStatusTimeoutRef.current);
  }, []);

  useEffect(() => {
    setDraftStorageStatus(getLocalDraftStorageStatus());
  }, []);

  useEffect(() => {
    if (!onSnapshotProviderReady) return undefined;
    onSnapshotProviderReady(() => snapshot);
    return () => onSnapshotProviderReady(null);
  }, [onSnapshotProviderReady, snapshot]);


  const activeSlotScope = normalizeLocationSlotScope(state.activeSlotScope);
  const locationSlots = useMemo(
    () => getLocationSlotsForScope(activeSlotScope),
    [activeSlotScope],
  );
  const activeSlotId = isSlotInScope(state.activeSlot, activeSlotScope)
    ? state.activeSlot
    : getDefaultSlotIdForScope(activeSlotScope);
  const activeSlot = useMemo(
    () => locationSlots.find((slot) => slot.id === activeSlotId) || locationSlots[0],
    [activeSlotId, locationSlots],
  );
  const compatibleComponents = useMemo(
    () => (activeSlot ? getComponentsForSlot(activeSlot.id, state) : []),
    [activeSlot, state],
  );
  const assignedComponentsForActiveSlot = useMemo(
    () =>
      activeSlot
        ? getAssignedComponentsForSlotScope(
            state,
            activeSlot.id,
            activeSlotScope,
            state.activeRegionId,
          )
        : [],
    [activeSlot, activeSlotScope, state],
  );
  const activeRegionForPicker = useMemo(
    () => state.locationRegions?.find((region) => region.id === state.activeRegionId),
    [state.activeRegionId, state.locationRegions],
  );
  const activeGeneratedRoomForPicker = useMemo(
    () => getGeneratedRoomForRegion(generatedMapPreview, state.activeRegionId),
    [generatedMapPreview, state.activeRegionId],
  );
  const activeSlotFilled = activeSlot ? getSlotFilledCountForScope(state, activeSlot.id, activeSlotScope, state.activeRegionId) : 0;
  const activeSlotIsFull = activeSlotFilled >= (activeSlot?.max || 1);

  const builderModeControls = (
    <LocationBuilderModeSwitch
      builderMode={builderMode}
      setBuilderMode={setBuilderMode}
    />
  );

  const focusSlot = useCallback((slotId, slotScope = activeSlotScope) => {
    setState((current) => ({
      ...current,
      activeSlot: slotId,
      activeSlotScope: normalizeLocationSlotScope(slotScope),
    }));
    setDrawerOpen(true);
  }, [activeSlotScope]);

  const addComponentToActiveSlot = useCallback((component) => {
    if (!activeSlot) return;
    setState((current) =>
      assignComponentToSlot(current, component, activeSlot, {
        scope: activeSlotScope,
        regionId: current.activeRegionId,
      }),
    );
    setDrawerOpen(true);
  }, [activeSlot, activeSlotScope]);

  const removeComponentFromActiveSlot = useCallback((componentId) => {
    if (!activeSlot) return;
    setState((current) => removeComponentFromSlot(current, componentId, activeSlot.id));
  }, [activeSlot]);

  return (
    <div
      className="cruor-composer-shell location-composer"
      data-cruor-ui-mode={uiMode}
      data-location-builder-mode={builderMode}
      data-location-composer-ready="true"
    >
      <div className="cruor-composer-workspace location-composer__workspace">
        <div className="cruor-composer-frame location-composer__frame location-map-workbench">
          {builderMode === "frame" ? (
            <LocationBriefPanel
              state={state}
              setState={setState}
              mapRequest={mapRequest}
              modeControls={builderModeControls}
              draftControls={
                <LocationDraftControls
                  canLoadDraft={Boolean(draftSummary)}
                  draftStorageStatus={draftStorageStatus}
                  draftSummary={draftSummary}
                  draftStatus={draftStatus}
                  hasUnsavedChanges={hasUnsavedChanges}
                  uiMode={uiMode}
                  onClearDraft={clearSavedDraft}
                  onLoadDraft={loadDraft}
                  onResetComposer={resetComposer}
                  onSaveDraft={saveDraft}
                />
              }
            />
          ) : (
            <LocationSlotRail
              state={state}
              setState={setState}
              selectedComponents={selectedComponents}
              onOpenMapGenerator={onOpenMapGenerator}
              snapshot={snapshot}
              generatedMapPreview={generatedMapPreview}
              modeControls={builderModeControls}
              onFocusSlot={focusSlot}
            />
          )}

          {builderMode === "slots" && drawerOpen && activeSlot ? (
            <div className="location-stage-navigator-overlay" aria-label="Location component navigator drawer">
              <LocationComponentPickerModal
                activeRegion={activeRegionForPicker}
                assignedComponents={assignedComponentsForActiveSlot}
                components={compatibleComponents}
                generatedRoom={activeGeneratedRoomForPicker}
                isSlotFull={activeSlotIsFull}
                open={drawerOpen}
                regions={state.locationRegions || []}
                slot={activeSlot}
                slotScope={activeSlotScope}
                onAddComponent={addComponentToActiveSlot}
                onClose={() => setDrawerOpen(false)}
                onRemoveComponent={removeComponentFromActiveSlot}
                onSelectRegion={(regionId) => setState((current) => ({ ...current, activeRegionId: regionId }))}
              />
            </div>
          ) : null}

          <LocationMapStage
            state={state}
            setState={setState}
            mapRequest={mapRequest}
            digest={digest}
            generatedMapPreview={generatedMapPreview}
            previewError={previewResult.error}
            previewResetKey={previewResetKey}
            uiMode={uiMode}
          />

          <LocationRecapPanel
            onNewMapSeed={refreshMapSeed}
            onOpenMapGenerator={onOpenMapGenerator}
            onRenameLocation={renameLocation}
            snapshot={snapshot}
            state={state}
          />
        </div>
      </div>
    </div>
  );
}
