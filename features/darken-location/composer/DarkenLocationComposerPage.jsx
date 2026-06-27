import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../map-generator/map-generator.styles.css";
import {
  addScratchLocationRoom,
  assignComponentToSlot,
  createInitialLocationComposerState,
  createLocationComposerSnapshot,
  createLocationMapSeed,
  LOCATION_SLOT_SCOPE_MAP,
  LOCATION_SLOT_SCOPE_REGION,
  normalizeLocationSlotScope,
  regenerateScratchLocationRoom,
  removeComponentFromSlot,
  removeScratchLocationRoom,
  setScratchLocationRoomCount,
  toArray,
  updateScratchLocationRoom,
} from "./model/location-composer-state.js";
import {
  getAssignedComponentsForSlotScope,
  getComponentsForSlot,
  getComposerDigest,
  getDefaultSlotIdForScope,
  getLocationSlotsForScope,
  getRegionTemplatesForState,
  getSelectedComponents,
  getSlotFilledCountForScope,
  isSlotInScope,
} from "./model/location-composer-selectors.js";
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
import { normalizeManualOverrides } from "../map-generator/map-generator.state.js";
import { LocationBriefPanel } from "./components/LocationBriefPanel.jsx";
import { LocationDraftControls } from "./components/LocationDraftControls.jsx";
import { LocationComponentPickerModal } from "./components/LocationComponentPickerModal.jsx";
import { LocationCompilePreview } from "./components/LocationCompilePreview.jsx";
import { LocationMapStage } from "./components/LocationMapStage.jsx";
import { LocationGuidedFlowPanel } from "./components/LocationGuidedFlowPanel.jsx";
import { LocationRoomInspector } from "./components/LocationRoomInspector.jsx";
import { LocationMapDetailsPanel, LocationMapWideDetailsBlock } from "./components/LocationMapDetailsPanel.jsx";
import { LocationMapToolbar } from "./components/LocationMapToolbar.jsx";
import { LocationExportRoomKeyPanel } from "./components/LocationExportRoomKeyPanel.jsx";
import {
  copyTextToClipboard,
  getClipboardStatusMessage,
  getCompilePreview,
} from "./model/location-composer-output.js";
import { getNextMissingRoomSlot, getSelectedRoomProgramEntry } from "./model/location-room-program.js";
import { CruorMapGeneratorMvp } from "../map-generator/map-generator.page.jsx";
import {
  createLocationRegionsFromDungeonBrief,
  createThemeDungeonBriefCandidatesFromDarkenLocationSnapshot,
  createThemeDungeonBriefFromDarkenLocationSnapshot,
} from "../dungeon/dungeon.index.js";

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

function createLocationMapSourceKey(mapRequest) {
  const requiredRegions = Array.isArray(mapRequest?.requiredRegions)
    ? mapRequest.requiredRegions
    : [];
  const connections = Array.isArray(mapRequest?.connections)
    ? mapRequest.connections
    : [];

  return [
    mapRequest?.seed || "no-seed",
    mapRequest?.context || "no-context",
    mapRequest?.mapType || "no-map-type",
    mapRequest?.visualStyle || "no-style",
    mapRequest?.mapWidth || "no-width",
    mapRequest?.mapHeight || "no-height",
    requiredRegions
      .map((region) =>
        [
          region?.sourceRegionId || region?.id || "region",
          region?.label || region?.name || "",
          region?.role || "",
          region?.size || "",
          region?.shape || "",
          Array.isArray(region?.links) ? region.links.join(",") : "",
        ].join("@"),
      )
      .join("|"),
    connections
      .map((connection) =>
        [
          connection?.from || "",
          connection?.to || "",
          connection?.kind || "main",
          connection?.locked ? "locked" : "open",
          connection?.secret ? "secret" : "visible",
        ].join("@"),
      )
      .sort()
      .join("|"),
  ].join("::");
}

const LOCATION_WORKFLOW_MODES = [
  { id: "theme", label: "Frame" },
  { id: "scratch", label: "Rooms" },
  { id: "export", label: "Export" },
];

function LocationRecapPanel({
  activeRegion,
  activeSlot,
  activeSlotScope,
  onNewMapSeed,
  onOpenComponents,
  onRenameLocation,
  onStartMapEditing,
  onViewExport,
  state,
}) {
  const regions = Array.isArray(state.locationRegions) ? state.locationRegions.length : 0;
  const regionWord = regions === 1 ? "Region" : "Regions";
  const sourceLabel = getSourceLabel(state);
  const horrorLabel = getHorrorLabel(state);
  const targetLabel = activeSlotScope === LOCATION_SLOT_SCOPE_REGION
    ? activeRegion?.name || "Select a region"
    : "Whole Map";
  const slotLabel = activeSlot?.label || "Component";

  return (
    <aside
      className="cruor-composer-rail location-composer__rail location-composer__rail--right location-map-recap-rail location-frame-info"
      aria-label="Current Location Frame"
    >
      <section className="location-frame-info-card location-frame-info-card--hero">
        <span>Current Location</span>
        <label className="location-frame-name-editor">
          <span className="sr-only">Location name</span>
          <input
            type="text"
            aria-label="Location name"
            value={state.title || ""}
            onChange={(event) => onRenameLocation(event.target.value)}
          />
        </label>
        <em>{state.context || "Context"} · {horrorLabel} · {regions || 0} {regionWord}</em>
      </section>


      <section className="location-frame-info-card">
        <div className="location-frame-info-grid">
          <LocationFrameInfoRow label="Context" value={state.context || "Context"} />
          <LocationFrameInfoRow label="Horror" value={horrorLabel} />
          <LocationFrameInfoRow label="Source" value={sourceLabel} />
          <LocationFrameInfoRow label="Regions" value={String(regions || 0)} />
        </div>
      </section>


      <section className="location-frame-info-card">
        <div className="location-frame-info-grid">
          <LocationFrameInfoRow label="Target" value={targetLabel} />
          <LocationFrameInfoRow label="Slot" value={slotLabel} />
        </div>
      </section>


      <section className="location-frame-info-card location-location-action-card location-location-action-card--secondary" aria-label="Secondary location actions">
        <button
          className="cruor-composer-control location-primary-action"
          type="button"
          onClick={onOpenComponents}
        >
          Components
        </button>
        <button
          className="cruor-composer-control location-primary-action"
          type="button"
          onClick={onViewExport}
        >
          Export
        </button>
        <button
          className="cruor-composer-control location-primary-action"
          type="button"
          onClick={onStartMapEditing}
        >
          Edit Map
        </button>
        <details className="location-secondary-actions">
          <summary>More</summary>
          <button
            className="cruor-composer-control location-primary-action"
            type="button"
            onClick={onNewMapSeed}
          >
            New Map Seed
          </button>
        </details>
      </section>
    </aside>
  );

}

function LocationExportToolsPanel({ onSelectFrame, onSelectScratch }) {
  return (
    <aside
      className="cruor-composer-rail location-composer__rail location-composer__rail--left location-map-frame-rail location-frame-info"
      aria-label="Location export tools"
    >
      <section className="location-frame-info-card location-frame-info-card--hero">
        <span>Export</span>
        <strong>Location Insert</strong>
        <em>Copy the session insert, table text, rooms, or map SVG.</em>
      </section>
      <section className="location-frame-info-card location-location-action-card location-location-action-card--secondary" aria-label="Export navigation">
        <button className="cruor-composer-control location-primary-action" type="button" onClick={onSelectFrame}>
          Back to Frame
        </button>
        <button className="cruor-composer-control location-primary-action" type="button" onClick={onSelectScratch}>
          Rooms
        </button>
      </section>
    </aside>
  );
}

function LocationExportPanel({ digest, generatedMapPreview, mapRequest, state, uiMode }) {
  return (
    <aside
      className="cruor-composer-rail location-composer__rail location-composer__rail--right location-map-recap-rail location-frame-info"
      aria-label="Location export"
    >
      <LocationCompilePreview
        state={state}
        digest={digest}
        mapRequest={mapRequest}
        generatedMapPreview={generatedMapPreview}
        defaultOpen={true}
        uiMode={uiMode}
      />
    </aside>
  );
}

function getThemeProgramCandidateScore(candidate = {}, index = 0) {
  const rawScore = Number(candidate?.review?.score);
  const score = Number.isFinite(rawScore) ? rawScore : 0;
  const metrics = candidate?.metrics && typeof candidate.metrics === "object" ? candidate.metrics : {};
  const hazardScore = Number(metrics.hazards || 0) * 0.3;
  const secretScore = Number(metrics.secrets || 0) * 0.2;
  const branchScore = Number(metrics.branches || 0) * 0.15;

  return score + hazardScore + secretScore + branchScore - index * 0.01;
}

function selectBestThemeProgramCandidate(candidates = []) {
  const list = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
  if (!list.length) return null;

  return list.reduce((best, candidate, index) => {
    const bestScore = getThemeProgramCandidateScore(best.candidate, best.index);
    const candidateScore = getThemeProgramCandidateScore(candidate, index);
    return candidateScore > bestScore ? { candidate, index } : best;
  }, { candidate: list[0], index: 0 }).candidate;
}

function getInitialLocationRegionTemplates() {
  return getRegionTemplatesForState({
    context: "Crypt",
    sourceAnchors: ["Sedlec Ossuary"],
    horrors: ["Religious Horror"],
  });
}

export default function DarkenLocationComposerPage({ onOpenMapGenerator, onSnapshotProviderReady, uiMode = "simple" } = {}) {
  const [state, setState] = useState(() => createInitialLocationComposerState(getInitialLocationRegionTemplates()));
  const [draftStatus, setDraftStatus] = useState("");
  const [draftSummary, setDraftSummary] = useState(() => getStoredDraftSummary());
  const [draftStorageStatus, setDraftStorageStatus] = useState(() => getLocalDraftStorageStatus());
  const [savedDraftFingerprint, setSavedDraftFingerprint] = useState("");
  const [builderMode, setBuilderMode] = useState("theme");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMapEditing, setIsMapEditing] = useState(false);
  const [mapWorkspaceRevision, setMapWorkspaceRevision] = useState(0);
  const [exportCopyStatus, setExportCopyStatus] = useState("");
  const draftStatusTimeoutRef = useRef(null);
  const exportCopyStatusTimeoutRef = useRef(null);

  const selectedComponents = useMemo(() => getSelectedComponents(state), [state]);
  const snapshot = useMemo(() => createLocationComposerSnapshot(state, selectedComponents), [state, selectedComponents]);
  const mapManualOverrides = useMemo(
    () => normalizeManualOverrides(state.mapManualOverrides || {}),
    [state.mapManualOverrides],
  );
  const previewModel = useMemo(
    () => createLocationPreviewModel(snapshot, mapManualOverrides),
    [snapshot, mapManualOverrides],
  );
  const { mapRequest, previewResult } = previewModel;
  const generatedMapPreview = previewResult.generatedMap;
  const digest = useMemo(() => getComposerDigest(state), [state]);
  const compilePreview = useMemo(
    () => getCompilePreview(state, digest, mapRequest, generatedMapPreview),
    [state, digest, mapRequest, generatedMapPreview],
  );
  const draftFingerprint = useMemo(() => createDraftFingerprint(state), [state]);
  const hasUnsavedChanges = Boolean(savedDraftFingerprint) && draftFingerprint !== savedDraftFingerprint;
  const previewResetKey = useMemo(() => getLocationPreviewResetKey(mapRequest, digest, state), [digest, mapRequest, state]);
  const mapSourceKey = useMemo(() => createLocationMapSourceKey(mapRequest), [mapRequest]);
  const previousMapSourceKeyRef = useRef(mapSourceKey);

  const setTransientDraftStatus = useCallback((message) => {
    setDraftStatus(message);
    window.clearTimeout(draftStatusTimeoutRef.current);
    draftStatusTimeoutRef.current = window.setTimeout(() => setDraftStatus(""), 2200);
  }, []);

  const copyExportText = useCallback(async (label, text) => {
    try {
      const result = await copyTextToClipboard(text);
      setExportCopyStatus(getClipboardStatusMessage(label, result));
    } catch (error) {
      setExportCopyStatus(`${label}: copy failed`);
    }

    window.clearTimeout(exportCopyStatusTimeoutRef.current);
    exportCopyStatusTimeoutRef.current = window.setTimeout(() => setExportCopyStatus(""), 2400);
  }, []);

  const copyRoomKeyMarkdown = useCallback(() => {
    copyExportText("Room Key Markdown", compilePreview.roomKeyMarkdown);
  }, [compilePreview.roomKeyMarkdown, copyExportText]);

  const copyTableReadyText = useCallback(() => {
    copyExportText("Table Text", compilePreview.tableReadyText);
  }, [compilePreview.tableReadyText, copyExportText]);

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

    const fallbackState = createInitialLocationComposerState(getInitialLocationRegionTemplates());
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

  const generateThemeRooms = useCallback(() => {
    setState((current) => {
      const currentSelectedComponents = getSelectedComponents(current);
      const currentSnapshot = createLocationComposerSnapshot(current, currentSelectedComponents);
      const requestedRoomCount = current.dungeonScale === "custom"
        ? Math.max(1, Math.min(16, Number.parseInt(current.dungeonCustomRoomCount || 8, 10) || 8))
        : undefined;
      const themeSnapshot = {
        ...currentSnapshot,
        dungeonScale: current.dungeonScale || currentSnapshot.dungeonScale,
        dungeonCustomRoomCount: requestedRoomCount,
        roomCount: requestedRoomCount,
      };
      const candidates = createThemeDungeonBriefCandidatesFromDarkenLocationSnapshot(themeSnapshot, { count: 3 });
      const selectedCandidate = selectBestThemeProgramCandidate(candidates);
      const dungeonBrief = selectedCandidate?.dungeonBrief || createThemeDungeonBriefFromDarkenLocationSnapshot(themeSnapshot);
      const locationRegions = createLocationRegionsFromDungeonBrief(dungeonBrief);

      return {
        ...current,
        dungeonMode: "theme",
        dungeonBriefId: dungeonBrief.id,
        dungeonThemeId: dungeonBrief.themeId,
        context: dungeonBrief.context || current.context,
        sourceAnchors: dungeonBrief.theme?.sourceAnchorIds?.length && dungeonBrief.themeName ? [dungeonBrief.themeName] : current.sourceAnchors,
        locationRegions,
        activeRegionId: locationRegions[0]?.id || "",
        activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
        themeProgramCandidates: [],
        activeThemeProgramCandidateId: selectedCandidate?.id || "",
        mapManualOverrides: null,
      };
    });
    setBuilderMode("theme");
    setDrawerOpen(false);
    setIsMapEditing(false);
    setTransientDraftStatus("Place generated");
  }, [setTransientDraftStatus]);

  const setScratchRoomCount = useCallback((roomCount) => {
    setState((current) => ({
      ...setScratchLocationRoomCount(current, roomCount),
      themeProgramCandidates: [],
      activeThemeProgramCandidateId: "",
      mapManualOverrides: null,
    }));
    setDrawerOpen(false);
    setIsMapEditing(false);
  }, []);

  const addScratchRoom = useCallback(() => {
    setState((current) => ({
      ...addScratchLocationRoom(current),
      themeProgramCandidates: [],
      activeThemeProgramCandidateId: "",
      mapManualOverrides: null,
    }));
    setBuilderMode("scratch");
    setDrawerOpen(false);
    setIsMapEditing(false);
    setTransientDraftStatus("Room added");
  }, [setTransientDraftStatus]);

  const removeScratchRoom = useCallback((regionId) => {
    setState((current) => ({
      ...removeScratchLocationRoom(current, regionId),
      themeProgramCandidates: [],
      activeThemeProgramCandidateId: "",
      mapManualOverrides: null,
    }));
    setBuilderMode("scratch");
    setDrawerOpen(false);
    setIsMapEditing(false);
    setTransientDraftStatus("Room removed");
  }, [setTransientDraftStatus]);

  const regenerateScratchRoom = useCallback((regionId) => {
    setState((current) => ({
      ...regenerateScratchLocationRoom(current, regionId),
      themeProgramCandidates: [],
      activeThemeProgramCandidateId: "",
      mapManualOverrides: null,
    }));
    setBuilderMode("scratch");
    setDrawerOpen(false);
    setIsMapEditing(false);
    setTransientDraftStatus("Room regenerated");
  }, [setTransientDraftStatus]);

  const selectScratchRoom = useCallback((regionId) => {
    setState((current) => ({
      ...current,
      dungeonMode: "scratch",
      activeRegionId: regionId || current.activeRegionId,
      activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
      activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_REGION)
        ? current.activeSlot
        : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_REGION),
    }));
    setDrawerOpen(false);
    setIsMapEditing(false);
  }, []);

  const selectRoomTarget = useCallback((regionId) => {
    setState((current) => ({
      ...current,
      activeRegionId: regionId || current.activeRegionId || current.locationRegions?.[0]?.id || "",
      activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
      activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_REGION)
        ? current.activeSlot
        : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_REGION),
    }));
    setDrawerOpen(false);
    setIsMapEditing(false);
  }, []);

  const updateScratchRoom = useCallback((regionId, updates) => {
    setState((current) => ({
      ...updateScratchLocationRoom(current, regionId, updates),
      themeProgramCandidates: [],
      activeThemeProgramCandidateId: "",
      mapManualOverrides: null,
    }));
  }, []);

  const generateScratchMap = useCallback(() => {
    setState((current) => {
      const hasRooms = Array.isArray(current.locationRegions) && current.locationRegions.length > 0;
      const baseState = hasRooms ? current : setScratchLocationRoomCount(current, 4);
      const locationRegions = Array.isArray(baseState.locationRegions) ? baseState.locationRegions : [];

      return {
        ...baseState,
        dungeonMode: "scratch",
        activeRegionId: baseState.activeRegionId || locationRegions[0]?.id || "",
        activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
        themeProgramCandidates: [],
        activeThemeProgramCandidateId: "",
        mapManualOverrides: null,
      };
    });
    setBuilderMode("scratch");
    setDrawerOpen(false);
    setIsMapEditing(false);
    setTransientDraftStatus("Map generated");
  }, [setTransientDraftStatus]);


  const resetComposer = useCallback(() => {
    const confirmed = window.confirm("Reset current composer?");
    if (!confirmed) return;

    const resetState = createInitialLocationComposerState(getInitialLocationRegionTemplates());
    setState(resetState);
    setSavedDraftFingerprint(createDraftFingerprint(resetState));
    setBuilderMode("theme");
    setDrawerOpen(false);
    setIsMapEditing(false);
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
    return () => {
      window.clearTimeout(draftStatusTimeoutRef.current);
      window.clearTimeout(exportCopyStatusTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setDraftStorageStatus(getLocalDraftStorageStatus());
  }, []);

  useEffect(() => {
    if (previousMapSourceKeyRef.current === mapSourceKey) return;
    previousMapSourceKeyRef.current = mapSourceKey;
    setState((current) =>
      current.mapManualOverrides
        ? {
            ...current,
            mapManualOverrides: null,
          }
        : current,
    );
  }, [mapSourceKey]);

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

  const activateBuilderMode = useCallback((mode) => {
    const requestedMode = mode === "map" ? "theme" : mode;
    const nextMode = LOCATION_WORKFLOW_MODES.some((workflowMode) => workflowMode.id === requestedMode)
      ? requestedMode
      : "theme";

    setBuilderMode(nextMode);
    setIsMapEditing(false);
    setDrawerOpen(false);

    setState((current) => {
      if (nextMode === "theme") {
        return {
          ...current,
          activeSlotScope: LOCATION_SLOT_SCOPE_MAP,
          activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_MAP)
            ? current.activeSlot
            : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_MAP),
        };
      }

      if (nextMode === "scratch") {
        return {
          ...current,
          activeRegionId: current.activeRegionId || current.locationRegions?.[0]?.id || "",
          activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
          activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_REGION)
            ? current.activeSlot
            : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_REGION),
        };
      }

      return current;
    });
  }, []);

  const startMapEditing = useCallback(() => {
    setBuilderMode("theme");
    setIsMapEditing(true);
    setDrawerOpen(false);
  }, []);

  const refreshEmbeddedMapWorkspace = useCallback(() => {
    setState((current) =>
      current.mapManualOverrides
        ? {
            ...current,
            mapManualOverrides: null,
          }
        : current,
    );
    setMapWorkspaceRevision((revision) => revision + 1);
    setTransientDraftStatus("Map workspace refreshed");
  }, [setTransientDraftStatus]);

  const commitEmbeddedMapWorkspace = useCallback((workspaceState) => {
    const nextManualOverrides = normalizeManualOverrides(workspaceState?.manualOverrides || {});
    setState((current) => ({
      ...current,
      mapManualOverrides: nextManualOverrides,
    }));
    setTransientDraftStatus("Map edits saved");
  }, [setTransientDraftStatus]);

  const focusSlot = useCallback((slotId, slotScope = activeSlotScope, regionId = "") => {
    const normalizedScope = normalizeLocationSlotScope(slotScope);
    setState((current) => ({
      ...current,
      activeSlot: slotId,
      activeSlotScope: normalizedScope,
      activeRegionId:
        normalizedScope === LOCATION_SLOT_SCOPE_REGION
          ? regionId || current.activeRegionId || current.locationRegions?.[0]?.id || ""
          : current.activeRegionId,
    }));
    setDrawerOpen(true);
  }, [activeSlotScope]);

  const selectSlotScope = useCallback((slotScope) => {
    const normalizedScope = normalizeLocationSlotScope(slotScope);
    setState((current) => ({
      ...current,
      activeSlotScope: normalizedScope,
      activeSlot: isSlotInScope(current.activeSlot, normalizedScope)
        ? current.activeSlot
        : getDefaultSlotIdForScope(normalizedScope),
      activeRegionId:
        normalizedScope === LOCATION_SLOT_SCOPE_REGION
          ? current.activeRegionId || current.locationRegions?.[0]?.id || ""
          : current.activeRegionId,
    }));
  }, []);

  const addComponentToActiveSlot = useCallback((component) => {
    if (!activeSlot) return;
    const closesAfterRoomAssignment = activeSlotScope === LOCATION_SLOT_SCOPE_REGION;
    setState((current) =>
      assignComponentToSlot(current, component, activeSlot, {
        scope: activeSlotScope,
        regionId: current.activeRegionId,
      }),
    );
    setDrawerOpen(!closesAfterRoomAssignment);
    setBuilderMode(activeSlotScope === LOCATION_SLOT_SCOPE_REGION ? "scratch" : builderMode);
    setTransientDraftStatus(
      closesAfterRoomAssignment
        ? `${activeSlot.label || "Room slot"} assigned`
        : `${activeSlot.label || "Map slot"} assigned`,
    );
  }, [activeSlot, activeSlotScope, builderMode, setTransientDraftStatus]);

  const removeComponentFromActiveSlot = useCallback((componentId) => {
    if (!activeSlot) return;
    setState((current) => removeComponentFromSlot(current, componentId, activeSlot.id));
  }, [activeSlot]);

  const activeScratchRegion = useMemo(
    () => (Array.isArray(state.locationRegions) ? state.locationRegions : []).find((region) => region.id === state.activeRegionId)
      || (Array.isArray(state.locationRegions) ? state.locationRegions[0] : null)
      || null,
    [state.activeRegionId, state.locationRegions],
  );
  const activeRoomProgramEntry = useMemo(
    () => getSelectedRoomProgramEntry(state, generatedMapPreview),
    [generatedMapPreview, state],
  );
  const nextMissingRoomSlot = useMemo(
    () => activeRoomProgramEntry ? getNextMissingRoomSlot(state, activeRoomProgramEntry.id) : null,
    [activeRoomProgramEntry, state],
  );

  const focusScratchRoomSlot = useCallback((slotId, regionId = "") => {
    if (!slotId) return;
    setState((current) => ({
      ...current,
      activeSlot: slotId,
      activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
      activeRegionId: regionId || current.activeRegionId || activeScratchRegion?.id || "",
    }));
    setDrawerOpen(true);
  }, [activeScratchRegion?.id]);

  const activeRegionIndex = useMemo(() => {
    const regions = Array.isArray(state.locationRegions) ? state.locationRegions : [];
    return regions.findIndex((region) => region.id === state.activeRegionId);
  }, [state.activeRegionId, state.locationRegions]);

  const selectRelativeRoom = useCallback((direction) => {
    const regions = Array.isArray(state.locationRegions) ? state.locationRegions : [];
    if (!regions.length) return;

    const currentIndex = activeRegionIndex >= 0 ? activeRegionIndex : 0;
    const nextIndex = Math.max(0, Math.min(regions.length - 1, currentIndex + direction));
    const nextRegion = regions[nextIndex];
    if (!nextRegion?.id) return;

    setBuilderMode("scratch");
    selectRoomTarget(nextRegion.id);
  }, [activeRegionIndex, selectRoomTarget, state.locationRegions]);

  const openRoomComponents = useCallback(() => {
    setBuilderMode("scratch");
    setDrawerOpen(true);
  }, []);

  const openNextMissingRoomSlot = useCallback(() => {
    if (!nextMissingRoomSlot?.slot?.id) {
      openRoomComponents();
      return;
    }

    focusSlot(nextMissingRoomSlot.slot.id, LOCATION_SLOT_SCOPE_REGION, activeRoomProgramEntry?.id || activeScratchRegion?.id || "");
    setBuilderMode("scratch");
  }, [activeRoomProgramEntry?.id, activeScratchRegion?.id, focusSlot, nextMissingRoomSlot, openRoomComponents]);

  const openFirstMissingExportRoom = useCallback(() => {
    const firstMissingRegionId = compilePreview.missingRoomSections?.[0]?.region?.id || state.locationRegions?.[0]?.id || "";
    if (!firstMissingRegionId) return;
    setBuilderMode("scratch");
    selectRoomTarget(firstMissingRegionId);
  }, [compilePreview.missingRoomSections, selectRoomTarget, state.locationRegions]);

  const selectExportRoom = useCallback((regionId) => {
    if (!regionId) return;
    setBuilderMode("scratch");
    selectRoomTarget(regionId);
  }, [selectRoomTarget]);

  const leftPanel = builderMode === "theme" ? (
    <LocationBriefPanel
      state={state}
      setState={setState}
      mapRequest={mapRequest}
      mapPlanDetails={(
        <LocationMapWideDetailsBlock
          activeSlot={activeSlot}
          activeSlotScope={activeSlotScope}
          state={state}
          onFocusSlot={focusSlot}
        />
      )}
      modeControls={null}
      forcedDungeonMode="theme"
      showGenerateAction={false}
      uiMode={uiMode}
      onAddScratchRoom={addScratchRoom}
      onGenerateThemeRooms={generateThemeRooms}
      onRegenerateScratchRoom={regenerateScratchRoom}
      onRemoveScratchRoom={removeScratchRoom}
      onSelectScratchRoom={selectScratchRoom}
      onSetScratchRoomCount={setScratchRoomCount}
      onUpdateScratchRoom={updateScratchRoom}
      draftControls={
        uiMode === "simple" ? null : (
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
        )
      }
    />
) : builderMode === "scratch" ? (
    <LocationRoomInspector
      activeSlot={activeSlot}
      generatedMapPreview={generatedMapPreview}
      state={state}
      onFocusSlot={focusSlot}
    />
  ) : builderMode === "export" ? (
    <LocationExportToolsPanel
      onSelectFrame={() => activateBuilderMode("theme")}
      onSelectScratch={() => activateBuilderMode("scratch")}
    />
  ) : null;

  const navigatorPanel = (builderMode === "theme" || builderMode === "scratch") && drawerOpen && activeSlot ? (
    <LocationComponentPickerModal
      activeRegion={activeRegionForPicker}
      assignedComponents={assignedComponentsForActiveSlot}
      components={compatibleComponents}
      generatedRoom={activeGeneratedRoomForPicker}
      isSlotFull={activeSlotIsFull}
      open={drawerOpen}
      regions={state.locationRegions || []}
      selectedComponents={selectedComponents}
      slot={activeSlot}
      slotScope={activeSlotScope}
      state={state}
      onAddComponent={addComponentToActiveSlot}
      onClose={() => setDrawerOpen(false)}
      onRemoveComponent={removeComponentFromActiveSlot}
      onSelectRegion={(regionId) => setState((current) => ({ ...current, activeRegionId: regionId }))}
    />
  ) : null;

  const rightPanel = (
    <LocationMapDetailsPanel
      generatedMapPreview={generatedMapPreview}
      mapRequest={mapRequest}
      side="right"
      state={state}
      onRenameLocation={renameLocation}
    />
  );

  const mapWorkspacePanel = isMapEditing ? (
    <CruorMapGeneratorMvp
      key={`location-map-workspace-${previewResetKey}-${mapWorkspaceRevision}`}
      initialRequest={mapRequest}
      initialManualOverrides={mapManualOverrides}
      embeddedInComposer={true}
      workspaceContext="composer-workspace"
      onCommitWorkspace={commitEmbeddedMapWorkspace}
      onExitWorkspace={() => setIsMapEditing(false)}
      onRefreshFromComposer={refreshEmbeddedMapWorkspace}
    />
  ) : null;

  const exportContextPanel = builderMode === "export" ? (
    <LocationExportRoomKeyPanel
      compilePreview={compilePreview}
      copyStatus={exportCopyStatus}
      onCopyMarkdown={copyRoomKeyMarkdown}
      onCopyTable={copyTableReadyText}
      onReviewMissing={openFirstMissingExportRoom}
      onSelectRoom={selectExportRoom}
    />
  ) : null;


  const centerToolbarPanel = !isMapEditing ? (
    <LocationMapToolbar
      activeRegion={activeScratchRegion}
      builderMode={builderMode}
      canGoNextRoom={activeRegionIndex >= 0 && activeRegionIndex < (state.locationRegions?.length || 0) - 1}
      canGoPreviousRoom={activeRegionIndex > 0}
      generatedMapPreview={generatedMapPreview}
      hasRooms={Boolean(state.locationRegions?.length)}
      nextRoomSlot={nextMissingRoomSlot}
      exportIncompleteCount={compilePreview.incompleteRoomCount}
      onAddMissingRoomSlot={openNextMissingRoomSlot}
      onCopyMarkdown={copyRoomKeyMarkdown}
      onGenerateThemeRooms={generateThemeRooms}
      onNewMapSeed={refreshMapSeed}
      onOpenComponents={openRoomComponents}
      onSelectExport={() => activateBuilderMode("export")}
      onSelectFrame={() => activateBuilderMode("theme")}
      onReviewMissing={openFirstMissingExportRoom}
      onSelectNextRoom={() => selectRelativeRoom(1)}
      onSelectPreviousRoom={() => selectRelativeRoom(-1)}
      onSelectRooms={() => activateBuilderMode("scratch")}
      onStartMapEditing={startMapEditing}
    />
  ) : null;

  return (
    <div
      className="cruor-composer-shell location-composer"
      data-cruor-ui-mode={uiMode}
      data-location-builder-mode={builderMode}
      data-location-map-editing={isMapEditing ? "true" : "false"}
      data-location-composer-ready="true"
    >
      <div className="cruor-composer-workspace location-composer__workspace">
        <LocationMapStage
          state={state}
          setState={setState}
          mapRequest={mapRequest}
          digest={digest}
          generatedMapPreview={generatedMapPreview}
          previewError={previewResult.error}
          previewResetKey={previewResetKey}
          uiMode={uiMode}
          isMapEditing={isMapEditing}
          modeControls={null}
          leftPanel={isMapEditing ? null : leftPanel}
          rightPanel={isMapEditing ? null : rightPanel}
          navigatorPanel={isMapEditing ? null : navigatorPanel}
          workspacePanel={mapWorkspacePanel}
          contextPanel={exportContextPanel}
          toolbarPanel={centerToolbarPanel}
          regionSelectionScope={builderMode === "theme" ? LOCATION_SLOT_SCOPE_MAP : LOCATION_SLOT_SCOPE_REGION}
          bottomDockPanel={!isMapEditing ? (
            <LocationGuidedFlowPanel
              activeRegion={activeRegionForPicker}
              activeSlot={activeSlot}
              builderMode={builderMode}
              generatedMapPreview={generatedMapPreview}
              hasMapManualOverrides={Boolean(state.mapManualOverrides)}
              regions={state.locationRegions || []}
              selectedComponents={selectedComponents}
              exportIncompleteCount={compilePreview.incompleteRoomCount}
              onCopyMarkdown={copyRoomKeyMarkdown}
              onGenerateScratchMap={generateScratchMap}
              onGenerateThemeRooms={generateThemeRooms}
              nextRoomSlot={nextMissingRoomSlot}
              onOpenComponents={() => {
                if (builderMode === "scratch" && nextMissingRoomSlot?.slot?.id) {
                  openNextMissingRoomSlot();
                  return;
                }
                setBuilderMode(builderMode === "scratch" ? "scratch" : "theme");
                setDrawerOpen(true);
              }}
              onReviewMissing={openFirstMissingExportRoom}
              onSelectMode={activateBuilderMode}
            />
          ) : null}
          onScratchRoomFocusSlot={focusScratchRoomSlot}
          onScratchRoomUpdate={updateScratchRoom}
        />
      </div>
    </div>
  );
}
