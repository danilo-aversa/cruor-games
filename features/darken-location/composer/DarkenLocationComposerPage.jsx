import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComposerRail } from "../../../components/ui/composer-rail.jsx";
import "../map-generator/map-generator.styles.css";
import {
  addScratchLocationRoom,
  createInitialLocationComposerState,
  createLocationComposerSnapshot,
  createLocationMapSeed,
  LOCATION_SLOT_SCOPE_MAP,
  LOCATION_SLOT_SCOPE_REGION,
  normalizeLocationSlotScope,
  regenerateScratchLocationRoom,
  removeScratchLocationRoom,
  setScratchLocationRoomCount,
  toArray,
  updateScratchLocationRoom,
} from "./model/location-composer-state.js";
import {
  getAssignedComponentsForRegion,
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
  applyLocationComponentAssignmentTransaction,
  LOCATION_COMPONENT_TRANSACTION_OPERATIONS,
  recomputeLocationRoomConstraintState,
} from "./model/location-room-assignment-transaction.js";
import {
  createLocationAssignmentHistorySnapshot,
  restoreLocationAssignmentHistorySnapshot,
} from "./model/location-room-constraint-state.js";
import {
  createLocationPreviewModel,
} from "./model/location-composer-preview.js";
import { getGeneratedRoomForRegion } from "./model/location-composer-map-preview.js";
import {
  areManualOverridesEqual,
  normalizeManualOverrides,
} from "../map-generator/map-generator.state.js";
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
import { getNextMissingRoomSlot, getRoomProgramEntries, getSelectedRoomProgramEntry } from "./model/location-room-program.js";
import {
  createLocationRegionsFromDungeonBrief,
  createThemeDungeonBriefCandidatesFromDarkenLocationSnapshot,
  createThemeDungeonBriefFromDarkenLocationSnapshot,
} from "../dungeon/dungeon.index.js";

function LocationFrameInfoRow({ label, value }) {
  return (
    <span className="cruor-composer-fact-row location-frame-info-row">
      <small className="cruor-composer-fact-label">{label}</small>
      <strong className="cruor-composer-fact-value">{value}</strong>
    </span>
  );
}

function getSourceLabel(state) {
  return toArray(state.sourceAnchors).filter((source) => source !== "Any Source")[0] || "Any Source";
}

function getHorrorLabel(state) {
  return toArray(state.horrors)[0] || state.horror || "Horror";
}

function createMapInfluenceSourceKey(mapInfluence = null) {
  if (!mapInfluence || typeof mapInfluence !== "object") return "";
  return [
    mapInfluence.roomArchetype || mapInfluence.roomArchetypeId || "",
    mapInfluence.forcedRoomArchetype || mapInfluence.forcedRoomArchetypeId || "",
    Array.isArray(mapInfluence.preferredRoomArchetypes) ? mapInfluence.preferredRoomArchetypes.join(",") : "",
    Array.isArray(mapInfluence.forbiddenRoomArchetypes) ? mapInfluence.forbiddenRoomArchetypes.join(",") : "",
    mapInfluence.forceRoomArchetype ? "force" : "soft",
    mapInfluence.weight ?? "",
  ].join("~");
}

function createRoomConstraintSourceKey(region = null) {
  if (!region || typeof region !== "object") return "";
  const metadata = region.metadata || {};
  const design = region.effectiveRoomDesign
    || metadata.effectiveRoomDesign
    || region.roomDesign
    || metadata.roomDesign
    || null;
  const resolution = region.roomConstraintResolution
    || metadata.roomConstraintResolution
    || null;
  const assignedComponentIds = (metadata.assignedComponents || [])
    .map((component) => component?.id || component?.componentId || "")
    .filter(Boolean)
    .sort();

  return JSON.stringify({
    assignedComponentIds,
    design,
    resolution: resolution
      ? {
          conflicts: (resolution.conflicts || []).map((conflict) => ({
            code: conflict.code,
            field: conflict.field,
            sources: conflict.sources || [],
          })),
          schemaVersion: resolution.schemaVersion || "",
          status: resolution.status || "",
        }
      : null,
  });
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
          region?.roomArchetype || "",
          region?.roomArchetypeSource || "",
          createMapInfluenceSourceKey(region?.mapInfluence || region?.metadata?.mapInfluence),
          createRoomConstraintSourceKey(region),
          Array.isArray(region?.metadata?.assignedSlotIds) ? region.metadata.assignedSlotIds.join(",") : "",
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
    <ComposerRail
      side="right"
      variant="info"
      surface
      scrollable
      className="location-composer__rail location-composer__rail--right location-map-recap-rail location-frame-info"
      aria-label="Current Location Frame"
    >
      <section className="cruor-composer-rail-card cruor-composer-rail-card--hero location-frame-info-card location-frame-info-card--hero">
        <span className="cruor-composer-rail-card__eyebrow">Current Location</span>
        <label className="cruor-composer-rail-card__name-editor location-frame-name-editor">
          <span className="sr-only">Location name</span>
          <input
            className="cruor-composer-rail-card__name-input"
            type="text"
            aria-label="Location name"
            value={state.title || ""}
            onChange={(event) => onRenameLocation(event.target.value)}
          />
        </label>
        <em className="cruor-composer-rail-card__meta">{state.context || "Context"} · {horrorLabel} · {regions || 0} {regionWord}</em>
      </section>


      <section className="cruor-composer-rail-card location-frame-info-card">
        <div className="cruor-composer-fact-grid location-frame-info-grid">
          <LocationFrameInfoRow label="Context" value={state.context || "Context"} />
          <LocationFrameInfoRow label="Horror" value={horrorLabel} />
          <LocationFrameInfoRow label="Source" value={sourceLabel} />
          <LocationFrameInfoRow label="Regions" value={String(regions || 0)} />
        </div>
      </section>


      <section className="cruor-composer-rail-card location-frame-info-card">
        <div className="cruor-composer-fact-grid location-frame-info-grid">
          <LocationFrameInfoRow label="Target" value={targetLabel} />
          <LocationFrameInfoRow label="Slot" value={slotLabel} />
        </div>
      </section>


      <section className="cruor-composer-rail-card location-frame-info-card location-location-action-card location-location-action-card--secondary" aria-label="Secondary location actions">
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
    </ComposerRail>
  );

}

function LocationExportToolsPanel({ onSelectFrame, onSelectScratch }) {
  return (
    <ComposerRail
      side="left"
      variant="controls"
      surface
      scrollable
      className="location-composer__rail location-composer__rail--left location-map-frame-rail location-frame-info"
      aria-label="Location export tools"
    >
      <section className="cruor-composer-rail-card cruor-composer-rail-card--hero location-frame-info-card location-frame-info-card--hero">
        <span>Export</span>
        <strong>Location Insert</strong>
        <em>Copy the session insert, table text, rooms, or map SVG.</em>
      </section>
      <section className="cruor-composer-rail-card location-frame-info-card location-location-action-card location-location-action-card--secondary" aria-label="Export navigation">
        <button className="cruor-composer-control location-primary-action" type="button" onClick={onSelectFrame}>
          Back to Frame
        </button>
        <button className="cruor-composer-control location-primary-action" type="button" onClick={onSelectScratch}>
          Rooms
        </button>
      </section>
    </ComposerRail>
  );
}

function LocationExportPanel({ digest, generatedMapPreview, mapRequest, state, uiMode }) {
  return (
    <ComposerRail
      side="right"
      variant="export"
      surface
      scrollable
      className="location-composer__rail location-composer__rail--right location-map-recap-rail location-frame-info"
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
    </ComposerRail>
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

export default function DarkenLocationComposerPage({ debugMode = false, onOpenMapGenerator, onSnapshotProviderReady, uiMode = "simple" } = {}) {
  const [state, setState] = useState(() => createInitialLocationComposerState(getInitialLocationRegionTemplates()));
  const [draftStatus, setDraftStatus] = useState("");
  const [draftSummary, setDraftSummary] = useState(() => getStoredDraftSummary());
  const [draftStorageStatus, setDraftStorageStatus] = useState(() => getLocalDraftStorageStatus());
  const [savedDraftFingerprint, setSavedDraftFingerprint] = useState("");
  const [builderMode, setBuilderMode] = useState("theme");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [exportCopyStatus, setExportCopyStatus] = useState("");
  const draftStatusTimeoutRef = useRef(null);
  const exportCopyStatusTimeoutRef = useRef(null);
  const assignmentHistoryRef = useRef({ past: [], future: [] });
  const [assignmentHistoryStatus, setAssignmentHistoryStatus] = useState({
    canRedo: false,
    canUndo: false,
  });

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
  const mapSourceKey = useMemo(() => createLocationMapSourceKey(mapRequest), [mapRequest]);
  const previousMapSourceKeyRef = useRef(mapSourceKey);
  const stableMapSourceKeyRef = useRef(mapSourceKey);
  const stableMapRequestRef = useRef(mapRequest);
  if (stableMapSourceKeyRef.current !== mapSourceKey) {
    stableMapSourceKeyRef.current = mapSourceKey;
    stableMapRequestRef.current = mapRequest;
  }
  const stableMapRequest = stableMapRequestRef.current;

  const setTransientDraftStatus = useCallback((message) => {
    setDraftStatus(message);
    window.clearTimeout(draftStatusTimeoutRef.current);
    draftStatusTimeoutRef.current = window.setTimeout(() => setDraftStatus(""), 2200);
  }, []);

  const syncAssignmentHistoryStatus = useCallback(() => {
    const history = assignmentHistoryRef.current;
    setAssignmentHistoryStatus({
      canRedo: history.future.length > 0,
      canUndo: history.past.length > 0,
    });
  }, []);

  const clearAssignmentHistory = useCallback(() => {
    assignmentHistoryRef.current = { past: [], future: [] };
    setAssignmentHistoryStatus({ canRedo: false, canUndo: false });
  }, []);

  const pushAssignmentHistory = useCallback((previousState) => {
    const history = assignmentHistoryRef.current;
    history.past = [
      ...history.past,
      createLocationAssignmentHistorySnapshot(previousState),
    ].slice(-50);
    history.future = [];
    syncAssignmentHistoryStatus();
  }, [syncAssignmentHistoryStatus]);

  const undoAssignmentTransaction = useCallback(() => {
    const history = assignmentHistoryRef.current;
    const previous = history.past.pop();
    if (!previous) return;
    history.future.push(createLocationAssignmentHistorySnapshot(state));
    setState((current) => restoreLocationAssignmentHistorySnapshot(current, previous));
    syncAssignmentHistoryStatus();
    setTransientDraftStatus("Assignment undone");
  }, [setTransientDraftStatus, state, syncAssignmentHistoryStatus]);

  const redoAssignmentTransaction = useCallback(() => {
    const history = assignmentHistoryRef.current;
    const next = history.future.pop();
    if (!next) return;
    history.past.push(createLocationAssignmentHistorySnapshot(state));
    setState((current) => restoreLocationAssignmentHistorySnapshot(current, next));
    syncAssignmentHistoryStatus();
    setTransientDraftStatus("Assignment redone");
  }, [setTransientDraftStatus, state, syncAssignmentHistoryStatus]);

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
    clearAssignmentHistory();
    setSavedDraftFingerprint(createDraftFingerprint(restoredState));
    setDraftSummary(getStoredDraftSummary());
    setTransientDraftStatus("Draft loaded");
  }, [clearAssignmentHistory, hasUnsavedChanges, setTransientDraftStatus]);

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
        roomConstraintStateByRegion: {},
      };
    });
    clearAssignmentHistory();
    setBuilderMode("theme");
    setDrawerOpen(false);
    setTransientDraftStatus("Place generated");
  }, [clearAssignmentHistory, setTransientDraftStatus]);

  const setScratchRoomCount = useCallback((roomCount) => {
    setState((current) => ({
      ...setScratchLocationRoomCount(current, roomCount),
      themeProgramCandidates: [],
      activeThemeProgramCandidateId: "",
      mapManualOverrides: null,
    }));
    clearAssignmentHistory();
    setDrawerOpen(false);
  }, [clearAssignmentHistory]);

  const addScratchRoom = useCallback(() => {
    setState((current) => ({
      ...addScratchLocationRoom(current),
      themeProgramCandidates: [],
      activeThemeProgramCandidateId: "",
      mapManualOverrides: null,
    }));
    clearAssignmentHistory();
    setBuilderMode("scratch");
    setDrawerOpen(false);
    setTransientDraftStatus("Room added");
  }, [clearAssignmentHistory, setTransientDraftStatus]);

  const removeScratchRoom = useCallback((regionId) => {
    setState((current) => ({
      ...removeScratchLocationRoom(current, regionId),
      themeProgramCandidates: [],
      activeThemeProgramCandidateId: "",
      mapManualOverrides: null,
    }));
    clearAssignmentHistory();
    setBuilderMode("scratch");
    setDrawerOpen(false);
    setTransientDraftStatus("Room removed");
  }, [clearAssignmentHistory, setTransientDraftStatus]);

  const regenerateScratchRoom = useCallback((regionId) => {
    setState((current) => ({
      ...regenerateScratchLocationRoom(current, regionId),
      themeProgramCandidates: [],
      activeThemeProgramCandidateId: "",
      mapManualOverrides: null,
    }));
    clearAssignmentHistory();
    setBuilderMode("scratch");
    setDrawerOpen(false);
    setTransientDraftStatus("Room regenerated");
  }, [clearAssignmentHistory, setTransientDraftStatus]);

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
  }, []);

  const selectRoomTarget = useCallback((regionId) => {
    const nextRegionId = String(regionId || "").trim();

    setState((current) => {
      if (!nextRegionId) {
        return {
          ...current,
          activeRegionId: "",
          activeSlotScope: LOCATION_SLOT_SCOPE_MAP,
          activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_MAP)
            ? current.activeSlot
            : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_MAP),
        };
      }

      return {
        ...current,
        activeRegionId: nextRegionId,
        activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
        activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_REGION)
          ? current.activeSlot
          : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_REGION),
      };
    });
    setDrawerOpen(false);
  }, []);

  const updateScratchRoom = useCallback((regionId, updates) => {
    setState((current) => ({
      ...updateScratchLocationRoom(current, regionId, updates),
      themeProgramCandidates: [],
      activeThemeProgramCandidateId: "",
      mapManualOverrides: null,
    }));
    clearAssignmentHistory();
  }, [clearAssignmentHistory]);

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
    clearAssignmentHistory();
    setBuilderMode("scratch");
    setDrawerOpen(false);
    setTransientDraftStatus("Map generated");
  }, [clearAssignmentHistory, setTransientDraftStatus]);


  const resetComposer = useCallback(() => {
    const confirmed = window.confirm("Reset current composer?");
    if (!confirmed) return;

    const resetState = createInitialLocationComposerState(getInitialLocationRegionTemplates());
    setState(resetState);
    clearAssignmentHistory();
    setSavedDraftFingerprint(createDraftFingerprint(resetState));
    setBuilderMode("theme");
    setDrawerOpen(false);
    setTransientDraftStatus("Composer reset");
  }, [clearAssignmentHistory, setTransientDraftStatus]);

  const toggleImmersiveMode = useCallback(() => {
    const nextImmersiveMode = !immersiveMode;
    if (nextImmersiveMode) setDrawerOpen(false);
    setImmersiveMode(nextImmersiveMode);
  }, [immersiveMode]);

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
    const handleAssignmentHistoryKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      const target = event.target;
      if (
        target instanceof HTMLElement
        && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      event.preventDefault();
      if (event.shiftKey) redoAssignmentTransaction();
      else undoAssignmentTransaction();
    };

    window.addEventListener("keydown", handleAssignmentHistoryKeyDown);
    return () => window.removeEventListener("keydown", handleAssignmentHistoryKeyDown);
  }, [redoAssignmentTransaction, undoAssignmentTransaction]);

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
    setState((current) => {
      if (!current.mapManualOverrides) return current;
      const nextState = {
        ...current,
        mapManualOverrides: null,
      };
      return recomputeLocationRoomConstraintState({
        state: nextState,
        componentCatalog: getSelectedComponents(nextState),
        manualOverrides: null,
      });
    });
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
  const assignedComponentsForActiveRoom = useMemo(
    () => activeSlotScope === LOCATION_SLOT_SCOPE_REGION
      ? getAssignedComponentsForRegion(state, state.activeRegionId)
      : [],
    [activeSlotScope, state],
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


  const refreshInlineMapWorkspace = useCallback(() => {
    setState((current) => {
      if (!current.mapManualOverrides) return current;
      const nextState = {
        ...current,
        mapManualOverrides: null,
      };
      return recomputeLocationRoomConstraintState({
        state: nextState,
        componentCatalog: getSelectedComponents(nextState),
        manualOverrides: null,
      });
    });
    setTransientDraftStatus("Map refreshed from Composer");
  }, [setTransientDraftStatus]);

  const syncInlineMapWorkspace = useCallback((workspaceState) => {
    const nextManualOverrides = normalizeManualOverrides(workspaceState?.manualOverrides || {});
    setState((current) => {
      const currentManualOverrides = normalizeManualOverrides(current.mapManualOverrides || {});
      if (areManualOverridesEqual(currentManualOverrides, nextManualOverrides)) return current;
      const nextState = {
        ...current,
        mapManualOverrides: nextManualOverrides,
      };
      return recomputeLocationRoomConstraintState({
        state: nextState,
        componentCatalog: getSelectedComponents(nextState),
        manualOverrides: nextManualOverrides,
      });
    });
  }, []);

  const closeComponentNavigator = useCallback(() => {
    setDrawerOpen(false);
  }, []);

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

  const applyActiveSlotComponentTransaction = useCallback(({
    component = null,
    componentId = "",
    operation,
    replacementComponentIds = [],
  }) => {
    if (!activeSlot) return null;
    const result = applyLocationComponentAssignmentTransaction({
      state,
      operation,
      component,
      componentId,
      componentCatalog: selectedComponents,
      slot: activeSlot,
      target: {
        scope: activeSlotScope,
        regionId: state.activeRegionId,
      },
      replacementComponentIds,
      manualOverrides: mapManualOverrides,
    });

    if (!result.ok) {
      setTransientDraftStatus(result.reason || "Assignment blocked");
      return result;
    }

    pushAssignmentHistory(state);
    setState(result.state);
    return result;
  }, [
    activeSlot,
    activeSlotScope,
    mapManualOverrides,
    pushAssignmentHistory,
    selectedComponents,
    setTransientDraftStatus,
    state,
  ]);

  const addComponentToActiveSlot = useCallback((component) => {
    const result = applyActiveSlotComponentTransaction({
      component,
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
    });
    if (!result?.ok) return;

    const closesAfterRoomAssignment = activeSlotScope === LOCATION_SLOT_SCOPE_REGION;
    setDrawerOpen(false);
    setBuilderMode(activeSlotScope === LOCATION_SLOT_SCOPE_REGION ? "scratch" : builderMode);
    setTransientDraftStatus(
      closesAfterRoomAssignment
        ? `${activeSlot?.label || "Room slot"} assigned`
        : `${activeSlot?.label || "Map slot"} assigned`,
    );
  }, [
    activeSlot?.label,
    activeSlotScope,
    applyActiveSlotComponentTransaction,
    builderMode,
    setTransientDraftStatus,
  ]);

  const replaceComponentInActiveSlot = useCallback((component, replacementComponentIds = []) => {
    const result = applyActiveSlotComponentTransaction({
      component,
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.REPLACE,
      replacementComponentIds,
    });
    if (!result?.ok) return;

    setDrawerOpen(false);
    setBuilderMode(activeSlotScope === LOCATION_SLOT_SCOPE_REGION ? "scratch" : builderMode);
    setTransientDraftStatus(
      `${activeSlot?.label || (activeSlotScope === LOCATION_SLOT_SCOPE_REGION ? "Room slot" : "Map slot")} replaced`,
    );
  }, [
    activeSlot?.label,
    activeSlotScope,
    applyActiveSlotComponentTransaction,
    builderMode,
    setTransientDraftStatus,
  ]);

  const removeComponentFromActiveSlot = useCallback((componentId) => {
    const result = applyActiveSlotComponentTransaction({
      componentId,
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.REMOVE,
    });
    if (result?.ok) setTransientDraftStatus("Component removed");
  }, [applyActiveSlotComponentTransaction, setTransientDraftStatus]);

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
  const roomToolbarEntries = useMemo(
    () => getRoomProgramEntries(state, generatedMapPreview),
    [generatedMapPreview, state],
  );
  const nextMissingRoomSlot = useMemo(
    () => activeRoomProgramEntry ? getNextMissingRoomSlot(state, activeRoomProgramEntry.id) : null,
    [activeRoomProgramEntry, state],
  );


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

  const activateRoomWorkFromMap = useCallback((regionId = "") => {
    const nextRegionId = String(regionId || "").trim();
    setBuilderMode("scratch");
    setDrawerOpen(false);

    if (!nextRegionId) {
      setState((current) => ({
        ...current,
        activeRegionId: "",
        activeSlotScope: LOCATION_SLOT_SCOPE_MAP,
        activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_MAP)
          ? current.activeSlot
          : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_MAP),
      }));
    }
  }, []);

  const leftPanel = builderMode === "theme" ? (
    <LocationBriefPanel
      state={state}
      setState={setState}
      mapRequest={mapRequest}
      mapPlanDetails={(
        <LocationMapWideDetailsBlock
          activeSlot={activeSlot}
          activeSlotScope={activeSlotScope}
          pickerOpen={drawerOpen && activeSlotScope === LOCATION_SLOT_SCOPE_MAP}
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
            canRedo={assignmentHistoryStatus.canRedo}
            canUndo={assignmentHistoryStatus.canUndo}
            draftStorageStatus={draftStorageStatus}
            draftSummary={draftSummary}
            draftStatus={draftStatus}
            hasUnsavedChanges={hasUnsavedChanges}
            uiMode={uiMode}
            onClearDraft={clearSavedDraft}
            onLoadDraft={loadDraft}
            onRedo={redoAssignmentTransaction}
            onResetComposer={resetComposer}
            onSaveDraft={saveDraft}
            onUndo={undoAssignmentTransaction}
          />
        )
      }
    />
) : builderMode === "scratch" ? (
    <LocationRoomInspector
      activeSlot={activeSlot}
      generatedMapPreview={generatedMapPreview}
      pickerOpen={drawerOpen && activeSlotScope === LOCATION_SLOT_SCOPE_REGION}
      state={state}
      onFocusSlot={focusSlot}
      onSelectRoom={selectRoomTarget}
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
      manualOverrides={mapManualOverrides}
      open={drawerOpen}
      regions={state.locationRegions || []}
      roomAssignedComponents={assignedComponentsForActiveRoom}
      selectedComponents={selectedComponents}
      slot={activeSlot}
      slotScope={activeSlotScope}
      state={state}
      onAddComponent={addComponentToActiveSlot}
      onClose={closeComponentNavigator}
      onRemoveComponent={removeComponentFromActiveSlot}
      onReplaceComponent={replaceComponentInActiveSlot}
      onSelectRegion={(regionId) => setState((current) => ({ ...current, activeRegionId: regionId }))}
    />
  ) : null;

  const rightPanel = (
    <LocationMapDetailsPanel
      debugMode={debugMode || uiMode === "debug"}
      generatedMapPreview={generatedMapPreview}
      mapRequest={mapRequest}
      side="right"
      state={state}
      uiMode={uiMode}
      onRenameLocation={renameLocation}
    />
  );


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


  const centerToolbarPanel = (
    <LocationMapToolbar
      activeRegion={activeScratchRegion}
      builderMode={builderMode}
      canGoNextRoom={activeRegionIndex >= 0 && activeRegionIndex < (state.locationRegions?.length || 0) - 1}
      canGoPreviousRoom={activeRegionIndex > 0}
      generatedMapPreview={generatedMapPreview}
      hasRooms={Boolean(state.locationRegions?.length)}
      roomEntries={roomToolbarEntries}
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
      onSelectRoom={selectRoomTarget}
      onSelectRooms={() => activateBuilderMode("scratch")}
      immersiveMode={immersiveMode}
      onToggleImmersiveMode={toggleImmersiveMode}
    />
  );

  return (
    <div
      className="cruor-composer-shell location-composer"
      data-cruor-ui-mode={uiMode}
      data-location-builder-mode={builderMode}
      data-location-immersive={immersiveMode ? "true" : "false"}
      data-location-map-editing="inline"
      data-location-composer-ready="true"
      data-testid="dark-places-composer"
    >
      <div className="cruor-composer-workspace location-composer__workspace">
        <LocationMapStage
          state={state}
          setState={setState}
          mapRequest={stableMapRequest}
          digest={digest}
          generatedMapPreview={generatedMapPreview}
          previewError={previewResult.error}
          uiMode={uiMode}
          mapManualOverrides={mapManualOverrides}
          onManualWorkspaceChange={syncInlineMapWorkspace}
          onRefreshMapWorkspace={refreshInlineMapWorkspace}
          modeControls={null}
          leftPanel={immersiveMode ? null : leftPanel}
          rightPanel={immersiveMode ? null : rightPanel}
          navigatorPanel={immersiveMode ? null : navigatorPanel}
          contextPanel={immersiveMode ? null : exportContextPanel}
          toolbarPanel={centerToolbarPanel}
          onCloseNavigator={closeComponentNavigator}
          bottomDockPanel={immersiveMode ? null : (
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
          )}
          onComposerRegionSelect={activateRoomWorkFromMap}
        />
      </div>
    </div>
  );
}
