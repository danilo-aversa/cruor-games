import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComposerRail } from "../../../components/ui/composer-rail.jsx";
import { ComposerStartScreen, ComposerTemplatePicker, useComposerBuildGuidePreference } from "../../../components/ui/composer-command-bar.jsx";
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
  createLocationPreviewModelFromMapRequest,
} from "./model/location-composer-preview.js";
import {
  createDarkPlacesComposerSemanticPreparation,
  createDarkPlacesComposerSemanticPreviewMemoizer,
} from "./model/location-composer-semantic-preview.js";
import {
  createDarkPlacesSemanticMapHandoff,
} from "./model/location-composer-semantic-map-handoff.js";
import { getGeneratedRoomForRegion } from "./model/location-composer-map-preview.js";
import {
  areManualOverridesEqual,
  normalizeManualOverrides,
} from "../map-generator/map-generator.state.js";
import { serializeSvg } from "../map-generator/map-generator.export.js";
import { LocationBriefPanel } from "./components/LocationBriefPanel.jsx";
import { LocationDraftControls } from "./components/LocationDraftControls.jsx";
import { LocationComponentPickerModal } from "./components/LocationComponentPickerModal.jsx";
import { LocationMapStage } from "./components/LocationMapStage.jsx";
import { LocationGuidedFlowPanel } from "./components/LocationGuidedFlowPanel.jsx";
import { LocationRoomInspector } from "./components/LocationRoomInspector.jsx";
import { LocationMapDetailsPanel, LocationMapWideDetailsBlock } from "./components/LocationMapDetailsPanel.jsx";
import { LocationMapToolbar } from "./components/LocationMapToolbar.jsx";
import { LocationOutputWorkspace } from "../output/LocationOutputWorkspace.jsx";
import {
  copyTextToClipboard,
  createLocationExportBundle,
  getClipboardStatusMessage,
} from "./model/location-composer-output.js";
import { getNextMissingRoomSlot, getRoomProgramEntries, getSelectedRoomProgramEntry } from "./model/location-room-program.js";
import {
  LOCATION_MAP_SELECTION_ACTION,
  resolveLocationMapSelectionAction,
} from "./model/location-composer-map-interaction.js";
import {
  createLocationRegionsFromDungeonBrief,
  createThemeDungeonBriefCandidatesFromDarkenLocationSnapshot,
  createThemeDungeonBriefFromDarkenLocationSnapshot,
} from "../dungeon/dungeon.index.js";


const LOCATION_START_TEMPLATES = [
  {
    id: "sedlec-ossuary-crypt",
    label: "Sedlec Ossuary Crypt",
    description: "A generated ossuary room program with religious horror and a crypt frame.",
    meta: "Sedlec Ossuary · Crypt",
    frame: { dungeonThemeId: "sedlec-ossuary", sourceAnchors: new Set(["Sedlec Ossuary"]), context: "Crypt", horror: "Religious Horror", horrors: new Set(["Religious Horror"]) },
  },
  {
    id: "decomposition-crypt",
    label: "Decomposition Crypt",
    description: "A wet, collapsing crypt generated from the Decomposition semantic module.",
    meta: "Decomposition · Crypt",
    frame: { dungeonThemeId: "decomposition", sourceAnchors: new Set(["Decomposition"]), context: "Crypt" },
  },
];

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

function getCurrentComposerMapSvgText() {
  if (typeof document === "undefined" || typeof XMLSerializer === "undefined") return "";
  const svg = document.querySelector('[data-map-viewport-mode="composer-preview"] #cruor-map-svg')
    || document.querySelector("#cruor-map-svg");
  return svg ? serializeSvg(svg, { mode: "current" }) : "";
}

function downloadLocationExportFile(filename, text, mimeType = "text/plain;charset=utf-8") {
  if (
    typeof document === "undefined"
    || typeof URL === "undefined"
    || typeof Blob === "undefined"
    || !String(text || "").trim()
  ) {
    return false;
  }

  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return true;
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

export function createGeneratedThemeProgramState(current, frameUpdates = {}) {
  const requestedSeed = String(frameUpdates.seed ?? current.seed ?? "").trim();
  const clearedState = {
    ...current,
    ...frameUpdates,
    seed: requestedSeed || createLocationMapSeed(),
    selectedComponentIds: new Set(),
    slotAssignments: {},
    lockedSlots: new Set(),
  };
  const currentSnapshot = createLocationComposerSnapshot(clearedState, []);
  const requestedRoomCount = clearedState.dungeonScale === "custom"
    ? Math.max(
        1,
        Math.min(
          16,
          Number.parseInt(clearedState.dungeonCustomRoomCount || 8, 10) || 8,
        ),
      )
    : undefined;
  const themeSnapshot = {
    ...currentSnapshot,
    dungeonScale:
      clearedState.dungeonScale || currentSnapshot.dungeonScale,
    dungeonCustomRoomCount: requestedRoomCount,
    roomCount: requestedRoomCount,
  };
  const candidates = createThemeDungeonBriefCandidatesFromDarkenLocationSnapshot(
    themeSnapshot,
    { count: 3 },
  );
  const selectedCandidate = selectBestThemeProgramCandidate(candidates);
  const dungeonBrief =
    selectedCandidate?.dungeonBrief ||
    createThemeDungeonBriefFromDarkenLocationSnapshot(themeSnapshot);
  const locationRegions = createLocationRegionsFromDungeonBrief(dungeonBrief);

  return createLocationWorkflowModeState({
    ...clearedState,
    dungeonMode: "theme",
    dungeonBriefId: dungeonBrief.id,
    dungeonThemeId: dungeonBrief.themeId,
    context: dungeonBrief.context || clearedState.context,
    sourceAnchors:
      dungeonBrief.theme?.sourceAnchorIds?.length && dungeonBrief.themeName
        ? [dungeonBrief.themeName]
        : clearedState.sourceAnchors,
    locationRegions,
    themeProgramCandidates: [],
    activeThemeProgramCandidateId: selectedCandidate?.id || "",
    mapManualOverrides: null,
    roomConstraintStateByRegion: {},
  }, "theme");
}

export function createLocationWorkflowModeState(current, mode) {
  if (mode === "theme") {
    return {
      ...current,
      activeRegionId: "",
      activeSlotScope: LOCATION_SLOT_SCOPE_MAP,
      activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_MAP)
        ? current.activeSlot
        : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_MAP),
    };
  }

  if (mode === "scratch") {
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
}

function getInitialLocationRegionTemplates() {
  return getRegionTemplatesForState({
    context: "Crypt",
    sourceAnchors: ["Sedlec Ossuary"],
    horrors: ["Religious Horror"],
  });
}

export function createInitialGeneratedLocationComposerState() {
  return createGeneratedThemeProgramState(
    createInitialLocationComposerState(getInitialLocationRegionTemplates()),
  );
}

export default function DarkenLocationComposerPage({ debugMode = false, onOpenMapGenerator, onSnapshotProviderReady, uiMode = "simple" } = {}) {
  const [state, setState] = useState(createInitialGeneratedLocationComposerState);
  const [draftStatus, setDraftStatus] = useState("");
  const [draftSummary, setDraftSummary] = useState(() => getStoredDraftSummary());
  const [draftStorageStatus, setDraftStorageStatus] = useState(() => getLocalDraftStorageStatus());
  const [savedDraftFingerprint, setSavedDraftFingerprint] = useState("");
  const [builderMode, setBuilderMode] = useState("theme");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [exportCopyStatus, setExportCopyStatus] = useState("");
  const [mapRegenerationRevision, setMapRegenerationRevision] = useState(0);
  const [composerStarted, setComposerStarted] = useState(false);
  const [startMode, setStartMode] = useState("");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [activeStartTemplateId, setActiveStartTemplateId] = useState("sedlec-ossuary-crypt");
  const [showBuildGuide, setShowBuildGuide] = useComposerBuildGuidePreference(true);
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
  const structuralMapPreviewModel = useMemo(
    () => createLocationPreviewModel(snapshot),
    [snapshot],
  );
  const structuralMapRequest = structuralMapPreviewModel.mapRequest;
  const structuralGeneratedMapPreview =
    structuralMapPreviewModel.previewResult.generatedMap;
  const digest = useMemo(() => getComposerDigest(state), [state]);
  const semanticPreviewMemoizerRef = useRef(null);
  if (!semanticPreviewMemoizerRef.current) {
    semanticPreviewMemoizerRef.current =
      createDarkPlacesComposerSemanticPreviewMemoizer();
  }
  const semanticPreparation = useMemo(
    () =>
      createDarkPlacesComposerSemanticPreparation({
        state,
        digest,
        mapRequest: structuralMapRequest,
        generatedMapPreview: structuralGeneratedMapPreview,
        selectedComponents,
      }),
    [
      digest,
      selectedComponents,
      state,
      structuralGeneratedMapPreview,
      structuralMapRequest,
    ],
  );
  const semanticPreview = semanticPreviewMemoizerRef.current(
    semanticPreparation,
  );
  const semanticMapHandoff = useMemo(
    () =>
      createDarkPlacesSemanticMapHandoff({
        semanticPreview,
        fallbackMapRequest: structuralMapRequest,
        manualOverrides: mapManualOverrides,
      }),
    [mapManualOverrides, semanticPreview, structuralMapRequest],
  );
  const mapPreviewModel = useMemo(
    () =>
      createLocationPreviewModelFromMapRequest(
        semanticMapHandoff.mapRequest,
        semanticMapHandoff.manualOverrides,
      ),
    [semanticMapHandoff],
  );
  const { mapRequest, previewResult } = mapPreviewModel;
  const generatedMapPreview = previewResult.generatedMap;
  const previewModel = useMemo(
    () => ({
      ...mapPreviewModel,
      semanticRuntime: semanticPreview,
      semanticMapHandoff,
    }),
    [mapPreviewModel, semanticMapHandoff, semanticPreview],
  );
  const exportBundle = useMemo(
    () =>
      semanticPreview.document
        ? createLocationExportBundle({
            locationDocument: semanticPreview.document,
            generatedMapPreview,
          })
        : null,
    [
      generatedMapPreview,
      semanticPreview.document,
    ],
  );
  const exportIncompleteCount =
    semanticPreview.document?.validation?.coverage?.incompleteRooms?.length || 0;
  const draftFingerprint = useMemo(() => createDraftFingerprint(state), [state]);
  const hasUnsavedChanges = Boolean(savedDraftFingerprint) && draftFingerprint !== savedDraftFingerprint;
  const mapStructureKey = semanticMapHandoff.topologyFingerprint;
  // Local map edits may change topology; only explicit full regeneration actions advance this key.
  const mapTransitionKey = `full-map-regeneration-${mapRegenerationRevision}`;
  const mapSourceKey = semanticMapHandoff.requestFingerprint;
  const previousRoomConstraintKeyRef = useRef(
    semanticMapHandoff.roomConstraintFingerprint,
  );
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

  const requestFullMapTransition = useCallback(() => {
    setMapRegenerationRevision((current) => current + 1);
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

  const getExportFormatText = useCallback((formatId) => {
    const format = exportBundle?.formats?.[formatId];
    if (!format) return "";
    return format.dynamic && formatId === "svg"
      ? getCurrentComposerMapSvgText()
      : format.text;
  }, [exportBundle]);

  const copyExportFormat = useCallback((formatId) => {
    const format = exportBundle?.formats?.[formatId];
    if (!format) return;
    copyExportText(format.label, getExportFormatText(formatId));
  }, [copyExportText, exportBundle, getExportFormatText]);

  const downloadExportFormat = useCallback((formatId) => {
    const format = exportBundle?.formats?.[formatId];
    if (!format) return;
    const downloaded = downloadLocationExportFile(
      format.filename,
      getExportFormatText(formatId),
      format.mimeType,
    );
    setExportCopyStatus(downloaded ? `${format.label} downloaded` : `${format.label}: export unavailable`);
    window.clearTimeout(exportCopyStatusTimeoutRef.current);
    exportCopyStatusTimeoutRef.current = window.setTimeout(() => setExportCopyStatus(""), 2400);
  }, [exportBundle, getExportFormatText]);

  const copyRoomKeyMarkdown = useCallback(() => {
    copyExportFormat("roomKey");
  }, [copyExportFormat]);

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

    const fallbackState = createInitialGeneratedLocationComposerState();
    const restoredState = restoreLocationDraftState(storedDraft, fallbackState);
    setState(restoredState);
    requestFullMapTransition();
    clearAssignmentHistory();
    setSavedDraftFingerprint(createDraftFingerprint(restoredState));
    setDraftSummary(getStoredDraftSummary());
    setTransientDraftStatus("Draft loaded");
  }, [clearAssignmentHistory, hasUnsavedChanges, requestFullMapTransition, setTransientDraftStatus]);

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
    setState((current) => createGeneratedThemeProgramState(current, {
      seed: createLocationMapSeed(),
    }));
    requestFullMapTransition();
    clearAssignmentHistory();
    setBuilderMode("theme");
    setDrawerOpen(false);
    setTransientDraftStatus("Map seed refreshed");
  }, [clearAssignmentHistory, requestFullMapTransition, setTransientDraftStatus]);

  const changeMapSeed = useCallback(
    (seed) => {
      const normalizedSeed = String(seed || "").trim();
      if (!normalizedSeed) return;

      setState((current) => {
        if (String(current.seed || "").trim() === normalizedSeed) return current;
        return createGeneratedThemeProgramState(current, { seed: normalizedSeed });
      });
      requestFullMapTransition();
      clearAssignmentHistory();
      setBuilderMode("theme");
      setDrawerOpen(false);
      setTransientDraftStatus("Map seed applied");
    },
    [clearAssignmentHistory, requestFullMapTransition, setTransientDraftStatus],
  );

  const renameLocation = useCallback((title) => {
    setState((current) => ({
      ...current,
      title,
    }));
  }, []);

  const generateThemeRooms = useCallback(() => {
    setState((current) => createGeneratedThemeProgramState(current));
    requestFullMapTransition();
    clearAssignmentHistory();
    setBuilderMode("theme");
    setDrawerOpen(false);
    setTransientDraftStatus("Place generated");
  }, [clearAssignmentHistory, requestFullMapTransition, setTransientDraftStatus]);

  const changeThemeFrame = useCallback((frameUpdates = {}) => {
    setState((current) =>
      createGeneratedThemeProgramState(current, frameUpdates),
    );
    requestFullMapTransition();
    clearAssignmentHistory();
    setBuilderMode("theme");
    setDrawerOpen(false);
    setTransientDraftStatus("Place regenerated for the updated frame");
  }, [clearAssignmentHistory, requestFullMapTransition, setTransientDraftStatus]);

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
    requestFullMapTransition();
    clearAssignmentHistory();
    setBuilderMode("scratch");
    setDrawerOpen(false);
    setTransientDraftStatus("Map generated");
  }, [clearAssignmentHistory, requestFullMapTransition, setTransientDraftStatus]);


  const resetComposer = useCallback(() => {
    const confirmed = window.confirm("Reset current composer?");
    if (!confirmed) return;

    const resetState = createInitialGeneratedLocationComposerState();
    setState(resetState);
    requestFullMapTransition();
    clearAssignmentHistory();
    setSavedDraftFingerprint(createDraftFingerprint(resetState));
    setBuilderMode("theme");
    setDrawerOpen(false);
    setComposerStarted(false);
    setStartMode("");
    setTemplatePickerOpen(false);
    setTransientDraftStatus("Composer reset");
  }, [clearAssignmentHistory, requestFullMapTransition, setTransientDraftStatus]);

  const startFromLocationTemplate = useCallback((template) => {
    const baseState = createInitialLocationComposerState([]);
    const nextState = createGeneratedThemeProgramState(baseState, template?.frame || {});
    setState(nextState);
    requestFullMapTransition();
    clearAssignmentHistory();
    setActiveStartTemplateId(template?.id || "");
    setBuilderMode("theme");
    setDrawerOpen(false);
    setTemplatePickerOpen(false);
    setStartMode("template");
    setComposerStarted(true);
    setTransientDraftStatus("Location template loaded");
  }, [clearAssignmentHistory, requestFullMapTransition, setTransientDraftStatus]);

  const startLocationFromScratch = useCallback(() => {
    const nextState = createInitialGeneratedLocationComposerState();
    setState(nextState);
    requestFullMapTransition();
    clearAssignmentHistory();
    setBuilderMode("theme");
    setDrawerOpen(false);
    setTemplatePickerOpen(false);
    setStartMode("scratch");
    setComposerStarted(true);
    setTransientDraftStatus("Scratch location started");
  }, [clearAssignmentHistory, requestFullMapTransition, setTransientDraftStatus]);

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
    if (
      previousRoomConstraintKeyRef.current ===
      semanticMapHandoff.roomConstraintFingerprint
    ) {
      return;
    }
    previousRoomConstraintKeyRef.current =
      semanticMapHandoff.roomConstraintFingerprint;
    setState((current) => {
      return recomputeLocationRoomConstraintState({
        state: current,
        componentCatalog: getSelectedComponents(current),
        manualOverrides: current.mapManualOverrides || null,
      });
    });
  }, [semanticMapHandoff.roomConstraintFingerprint]);

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

    setState((current) => createLocationWorkflowModeState(current, nextMode));
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
    const firstMissingRegionId =
      semanticPreview.document?.validation?.coverage?.incompleteRooms?.[0]?.id ||
      state.locationRegions?.[0]?.id ||
      "";
    if (!firstMissingRegionId) return;
    setBuilderMode("scratch");
    selectRoomTarget(firstMissingRegionId);
  }, [
    semanticPreview.document?.validation?.coverage?.incompleteRooms,
    selectRoomTarget,
    state.locationRegions,
  ]);

  const selectExportRoom = useCallback((regionId) => {
    if (!regionId) return;
    setBuilderMode("scratch");
    selectRoomTarget(regionId);
  }, [selectRoomTarget]);

  const activateRoomWorkFromMap = useCallback((regionId = "") => {
    const selectionAction = resolveLocationMapSelectionAction(builderMode, regionId);

    if (selectionAction.type === LOCATION_MAP_SELECTION_ACTION.IGNORE) return;

    setDrawerOpen(false);

    if (selectionAction.type === LOCATION_MAP_SELECTION_ACTION.OPEN_ROOM) {
      setBuilderMode("scratch");
      return;
    }

    setState((current) => ({
      ...current,
      activeRegionId: "",
      activeSlotScope: LOCATION_SLOT_SCOPE_MAP,
      activeSlot: isSlotInScope(current.activeSlot, LOCATION_SLOT_SCOPE_MAP)
        ? current.activeSlot
        : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_MAP),
    }));
  }, [builderMode]);

  const locationWorkflowFooter = composerStarted ? (
    <LocationGuidedFlowPanel
      activeRegion={activeRegionForPicker}
      builderMode={builderMode}
      exportIncompleteCount={exportIncompleteCount}
      frameContext={{
        title: state.title,
        context: state.context,
        horror: getHorrorLabel(state),
        source: getSourceLabel(state),
      }}
      generatedMapPreview={generatedMapPreview}
      hasMapManualOverrides={Boolean(state.mapManualOverrides)}
      roomEntries={roomToolbarEntries}
      selectedComponents={selectedComponents}
      showBuildGuide={showBuildGuide}
      onShowBuildGuideChange={setShowBuildGuide}
      onCopyMarkdown={copyRoomKeyMarkdown}
      onGenerateScratchMap={generateScratchMap}
      onGenerateThemeRooms={generateThemeRooms}
      onOpenComponents={() => {
        if (builderMode === "scratch" && nextMissingRoomSlot?.slot?.id) {
          openNextMissingRoomSlot();
          return;
        }
        setBuilderMode(builderMode === "scratch" ? "scratch" : "theme");
        setDrawerOpen(true);
      }}
      onOpenRoomSlot={(slotId) => {
        focusSlot(slotId, LOCATION_SLOT_SCOPE_REGION, activeRoomProgramEntry?.id || activeScratchRegion?.id || "");
        setBuilderMode("scratch");
      }}
      onReviewMissing={openFirstMissingExportRoom}
      onSelectMode={activateBuilderMode}
      onSelectRoom={selectRoomTarget}
    />
  ) : null;

  if (builderMode === "export") {
    if (!exportBundle) {
      return (
        <div
          className="cruor-composer-shell location-composer location-composer--output"
          data-location-builder-mode="export"
          data-location-composer-ready="false"
          data-testid="dark-places-composer"
        >
          <div className="cruor-composer-panel location-panel">
            <h2>Final Output unavailable</h2>
            <p>The semantic compiler must produce a valid Location Document v2 before export.</p>
          </div>
        </div>
      );
    }
    return (
      <div
        className="cruor-composer-shell location-composer location-composer--output"
        data-cruor-ui-mode={uiMode}
        data-location-builder-mode="export"
        data-location-immersive="false"
        data-location-map-editing="output-readonly"
        data-location-composer-ready="true"
        data-testid="dark-places-composer"
      >
        <div className="cruor-composer-workspace location-composer__workspace location-composer__workspace--output">
          <LocationOutputWorkspace
            copyStatus={exportCopyStatus}
            documentModel={exportBundle.document}
            exportBundle={exportBundle}
            generatedMapPreview={generatedMapPreview}
            uiMode={uiMode}
            onBackToFrame={() => activateBuilderMode("theme")}
            onBackToRooms={() => activateBuilderMode("scratch")}
            onCopyFormat={copyExportFormat}
            onCopyText={copyExportText}
            onDownloadFormat={downloadExportFormat}
            onEditRoom={selectExportRoom}
            onReviewMissing={openFirstMissingExportRoom}
            workflowFooter={locationWorkflowFooter}
          />
        </div>
      </div>
    );
  }

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
      onChangeMapSeed={changeMapSeed}
      onChangeThemeFrame={changeThemeFrame}
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
      semanticMapHandoff={previewModel.semanticMapHandoff}
      semanticPreview={previewModel.semanticRuntime}
      side="right"
      state={state}
      uiMode={uiMode}
      onRegenerateMap={generateThemeRooms}
      onRefreshSeed={refreshMapSeed}
      onRenameLocation={renameLocation}
      showBuildGuide={showBuildGuide}
      onShowBuildGuideChange={setShowBuildGuide}
      workflowFooter={locationWorkflowFooter}
    />
  );


  const centerToolbarPanel = (
    <LocationMapToolbar
      activeRegion={activeScratchRegion}
      builderMode={builderMode}
      canGoNextRoom={activeRegionIndex >= 0 && activeRegionIndex < (state.locationRegions?.length || 0) - 1}
      canGoPreviousRoom={activeRegionIndex > 0}
      hasRooms={Boolean(state.locationRegions?.length)}
      roomEntries={roomToolbarEntries}
      nextRoomSlot={nextMissingRoomSlot}
      exportIncompleteCount={exportIncompleteCount}
      onAddMissingRoomSlot={openNextMissingRoomSlot}
      onCopyMarkdown={copyRoomKeyMarkdown}
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
      data-location-semantic-valid={semanticPreview.valid ? "true" : "false"}
      data-location-semantic-fingerprint={semanticPreview.compilerFingerprint}
      data-location-hybrid-override-fingerprint={
        semanticPreview.hybridOverrideFingerprint
      }
      data-location-hybrid-override-count={
        semanticPreview.overrides?.operations?.length || 0
      }
      data-location-map-handoff={semanticMapHandoff.mode}
      data-location-map-handoff-schema={semanticMapHandoff.schemaVersion}
      data-location-map-request-fingerprint={
        semanticMapHandoff.requestFingerprint
      }
      data-location-map-topology-fingerprint={mapStructureKey}
      data-location-map-regeneration-revision={mapRegenerationRevision}
      data-location-composer-ready="true"
      data-location-composer-started={composerStarted ? "true" : "false"}
      data-location-start-mode={startMode || "unselected"}
      data-testid="dark-places-composer"
    >
      {!composerStarted ? (
        <div className="location-composer-start-overlay">
          <ComposerStartScreen
            description="Load a prepared location frame or define the place structure yourself."
            onPickTemplate={() => setTemplatePickerOpen(true)}
            onBuildFromScratch={startLocationFromScratch}
            showBuildGuide={showBuildGuide}
            onShowBuildGuideChange={setShowBuildGuide}
            templateDescription="Choose a prepared semantic location frame, then customize rooms and table-facing details."
            scratchDescription="Start with an empty room program and build the location frame yourself."
          />
        </div>
      ) : null}
      <ComposerTemplatePicker
        open={templatePickerOpen}
        title="Pick a Location Template"
        templates={LOCATION_START_TEMPLATES}
        activeTemplateId={activeStartTemplateId}
        onApply={startFromLocationTemplate}
        onClose={() => setTemplatePickerOpen(false)}
      />
      <div className="cruor-composer-workspace location-composer__workspace">
        <LocationMapStage
          state={state}
          setState={setState}
          mapRequest={stableMapRequest}
          mapTransitionKey={mapTransitionKey}
          digest={digest}
          generatedMapPreview={generatedMapPreview}
          previewError={previewResult.error}
          uiMode={uiMode}
          mapManualOverrides={mapManualOverrides}
          onManualWorkspaceChange={syncInlineMapWorkspace}
          onRefreshMapWorkspace={refreshInlineMapWorkspace}
          modeControls={null}
          leftPanel={!composerStarted || immersiveMode ? null : leftPanel}
          rightPanel={immersiveMode ? null : rightPanel}
          navigatorPanel={immersiveMode ? null : navigatorPanel}
          toolbarPanel={centerToolbarPanel}
          onCloseNavigator={closeComponentNavigator}
          onComposerRegionSelect={activateRoomWorkFromMap}
          allowEmptyRegionClear={builderMode === "scratch"}
        />
      </div>
    </div>
  );
}
