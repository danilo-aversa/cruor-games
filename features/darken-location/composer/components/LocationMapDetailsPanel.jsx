import { useEffect, useRef, useState } from "react";
import { LOCATION_SLOT_SCOPE_MAP } from "../model/location-composer-state.js";
import {
  getAssignedComponentsForSlotScope,
  getDefaultSlotIdForScope,
  getLocationSlotsForScope,
  isSlotInScope,
} from "../model/location-composer-selectors.js";
import { getLocationPlaceFrame, getRoomProgramMetrics } from "../model/location-room-program.js";


const MAP_DEBUG_CATEGORY_OPTIONS = [
  { id: "room-move", label: "Room Move", icon: "fa-solid fa-up-down-left-right", description: "Room drag, room position and room movement events." },
  { id: "corridor-move", label: "Corridor Move", icon: "fa-solid fa-route", description: "Existing corridor endpoint, door and waypoint movement events." },
  { id: "corridor-create", label: "Corridor Create", icon: "fa-solid fa-plus", description: "New corridor drafts, target acquisition and commit events." },
  { id: "room-style", label: "Shape / Size", icon: "fa-solid fa-shapes", description: "Room shape, size and style override events." },
  { id: "manual-overrides", label: "Manual Overrides", icon: "fa-solid fa-sliders", description: "Manual override state snapshots and mutations." },
  { id: "generated-map", label: "Generated Map", icon: "fa-solid fa-map", description: "Generated map snapshots, regions, corridors and accesses." },
  { id: "anchor-trace", label: "Anchor Trace", icon: "fa-solid fa-location-dot", description: "Anchor snap, release and endpoint trace events." },
  { id: "performance", label: "Performance", icon: "fa-solid fa-gauge-high", description: "Runner, lifecycle, timing and diagnostic events." },
];

const DEFAULT_MAP_DEBUG_CATEGORIES = MAP_DEBUG_CATEGORY_OPTIONS.reduce(
  (next, category) => ({ ...next, [category.id]: true }),
  {},
);

const MAP_QA_SCENARIO_OPTIONS = [
  { id: "smoke", label: "Smoke Test", icon: "fa-solid fa-vial", description: "Run a short map-edit sanity pass." },
  { id: "circle-anchor-sweep", label: "Circle Anchor Test", icon: "fa-regular fa-circle-dot", description: "Move a circular-room corridor endpoint across several anchors." },
  { id: "corridor-create", label: "Corridor Creation Test", icon: "fa-solid fa-diagram-project", description: "Create or reuse a corridor and verify endpoint stability." },
  { id: "room-move-reroute", label: "Room Move + Reroute", icon: "fa-solid fa-arrows-to-circle", description: "Move a room and verify corridors are not duplicated." },
];


function getGenericTooltipAttrs(label, description = "") {
  const attrs = {
    "data-key": "tooltip-generic",
    "data-tooltip": label,
  };
  if (description) attrs["data-tooltip-description"] = description;
  return attrs;
}

function getIconToggleClass(active, extra = "") {
  return cx(
    "map-tool-button",
    "location-map-toolbar__button",
    "location-icon-toggle-button",
    "cruor-frame-icon-toggle",
    "location-map-toolbar__button--secondary",
    "map-debug-recorder__icon-toggle",
    active && "is-active",
    extra,
  );
}

function readStoredMapDebugMode() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage?.getItem("cruorMapDebugMode") === "1";
  } catch (error) {
    void error;
    return false;
  }
}

function getMapDebugCategory(label = "") {
  const normalized = String(label).toLowerCase();
  if (normalized.includes("anchor trace")) return "anchor-trace";
  if (normalized.includes("createconnection") || normalized.includes("connection draft") || normalized.includes("wall drag")) return "corridor-create";
  if (normalized.includes("movedoor") || normalized.includes("movewaypoint") || normalized.includes("insertwaypoint") || normalized.includes("deletewaypoint") || normalized.includes("corridor handle") || normalized.includes("waypoint")) return "corridor-move";
  if (normalized.includes("moveroom") || normalized.includes("room drag")) return "room-move";
  if (normalized.includes("room style") || normalized.includes("updateroomstyle") || normalized.includes("resetroomstyle") || normalized.includes("shape") || normalized.includes("size")) return "room-style";
  if (normalized.includes("manualoverride") || normalized.includes("manual edit") || normalized.includes("setmanualoverrides")) return "manual-overrides";
  if (normalized.includes("generatedmap") || normalized.includes("generated map")) return "generated-map";
  if (normalized.includes("performance") || normalized.includes("preview failed") || normalized.includes("violation")) return "performance";
  return "performance";
}

function cloneMapDebugPayload(value) {
  const seen = new WeakSet();
  try {
    return JSON.parse(JSON.stringify(value, (key, nestedValue) => {
      if (typeof nestedValue === "function") return `[Function ${nestedValue.name || "anonymous"}]`;
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
    }));
  } catch (error) {
    return {
      unserializable: true,
      error: error instanceof Error ? error.message : String(error),
      value: String(value),
    };
  }
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
  onQaScenarioRun,
  onQaScenarioStop,
  onQaSettingChange,
  onRecordingChange,
  onToggleCategory,
  onToggleDebugCoordinates,
  qaRunnerStatus = null,
  recording,
  showDebugCoordinates = false,
}) {
  const enabledCount = MAP_DEBUG_CATEGORY_OPTIONS.filter((category) => categories[category.id]).length;
  const latestEntries = entries.slice(-6).reverse();
  const qaRunning = qaRunnerStatus?.state === "running";
  const qaSettings = qaRunnerStatus?.settings || {};

  return (
    <section
      className="map-debug-recorder location-frame-info-card"
      data-debug-recorder-tools="composer-coordinates-svg-v1"
      aria-label="Dark Places debug recorder"
    >
      <div className="map-debug-recorder__header">
        <span>Debug Recorder</span>
        <strong>{recording ? "Recording" : "Idle"}</strong>
      </div>
      <p className="map-debug-recorder__summary">
        {entries.length} event{entries.length === 1 ? "" : "s"} · {enabledCount} listener{enabledCount === 1 ? "" : "s"} active
      </p>
      <div className="map-debug-recorder__actions map-debug-recorder__icon-toggle-grid">
        <button
          type="button"
          className={getIconToggleClass(recording)}
          aria-label={recording ? "Stop recording" : "Start recording"}
          onClick={() => onRecordingChange(!recording)}
          {...getGenericTooltipAttrs(recording ? "Stop Recording" : "Start Recording")}
        >
          <i className={recording ? "fa-solid fa-stop debug-icon" : "fa-solid fa-circle debug-icon"} aria-hidden="true" />
          <span className="sr-only">{recording ? "Stop" : "Start Recording"}</span>
        </button>
        <button
          type="button"
          className={getIconToggleClass(showDebugCoordinates)}
          aria-label={showDebugCoordinates ? "Hide map coordinates" : "Show map coordinates"}
          aria-pressed={Boolean(showDebugCoordinates)}
          onClick={() => onToggleDebugCoordinates?.(!showDebugCoordinates)}
          {...getGenericTooltipAttrs(
            showDebugCoordinates ? "Hide Coordinates" : "Show Coordinates",
            "Toggle debug coordinate labels on the rendered map.",
          )}
        >
          <i className="fa-solid fa-table-cells debug-icon" aria-hidden="true" />
          <span className="sr-only">Coordinates</span>
        </button>
        <button
          type="button"
          className={getIconToggleClass(false, "map-debug-recorder__svg-action map-debug-recorder__svg-copy")}
          aria-label="Copy debug SVG with coordinates"
          title="Copy Debug SVG with coordinates"
          onClick={onCopyDebugSvg}
          {...getGenericTooltipAttrs(
            "Copy Debug SVG",
            "Copy the current rendered SVG with coordinate labels included.",
          )}
        >
          <i className="fa-solid fa-copy debug-icon" aria-hidden="true" />
          <span className="sr-only">Copy Debug SVG</span>
        </button>
        <button
          type="button"
          className={getIconToggleClass(false, "map-debug-recorder__svg-action map-debug-recorder__svg-download")}
          aria-label="Download debug SVG with coordinates"
          title="Download Debug SVG with coordinates"
          onClick={onDownloadDebugSvg}
          {...getGenericTooltipAttrs(
            "Download Debug SVG",
            "Download the current rendered SVG with coordinate labels included.",
          )}
        >
          <i className="fa-solid fa-file-arrow-down debug-icon" aria-hidden="true" />
          <span className="sr-only">Download Debug SVG</span>
        </button>
        <button
          type="button"
          className={getIconToggleClass(false)}
          aria-label="Clear debug events"
          onClick={onClear}
          disabled={!entries.length}
          {...getGenericTooltipAttrs("Clear Events")}
        >
          <i className="fa-solid fa-trash-can debug-icon" aria-hidden="true" />
          <span className="sr-only">Clear</span>
        </button>
        <button
          type="button"
          className={getIconToggleClass(false)}
          aria-label="Download debug JSON"
          onClick={onDownloadJson}
          disabled={!entries.length}
          {...getGenericTooltipAttrs("Download JSON")}
        >
          <i className="fa-solid fa-file-code debug-icon" aria-hidden="true" />
          <span className="sr-only">Download JSON</span>
        </button>
        <button
          type="button"
          className={getIconToggleClass(false)}
          aria-label="Download debug TXT"
          onClick={onDownloadTxt}
          disabled={!entries.length}
          {...getGenericTooltipAttrs("Download TXT")}
        >
          <i className="fa-solid fa-file-lines debug-icon" aria-hidden="true" />
          <span className="sr-only">Download TXT</span>
        </button>
      </div>
      <div className="map-debug-recorder__categories map-debug-recorder__icon-toggle-grid" role="group" aria-label="Debug listener categories">
        {MAP_DEBUG_CATEGORY_OPTIONS.map((category) => {
          const active = Boolean(categories[category.id]);
          return (
            <button
              key={category.id}
              type="button"
              className={getIconToggleClass(active)}
              aria-label={`${active ? "Disable" : "Enable"} ${category.label} logging`}
              aria-pressed={active}
              onClick={() => onToggleCategory(category.id)}
              {...getGenericTooltipAttrs(category.label, category.description)}
            >
              <i className={`${category.icon} debug-icon`} aria-hidden="true" />
              <span className="sr-only">{category.label}</span>
            </button>
          );
        })}
      </div>
      <div className="map-debug-recorder__runner" aria-label="Map QA scenario runner">
        <div className="map-debug-recorder__runner-header">
          <span>Scenario Runner</span>
          <strong>{qaRunnerStatus?.state || "idle"}</strong>
        </div>
        <div className="map-debug-recorder__runner-controls">
          <label className="map-debug-recorder__runner-speed">
            <span>Speed</span>
            <select
              value={qaSettings.speed || "normal"}
              onChange={(event) => onQaSettingChange?.({ speed: event.target.value })}
              disabled={qaRunning}
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </label>
          <button
            type="button"
            className={getIconToggleClass(qaSettings.stopOnError !== false, "map-debug-recorder__stop-toggle")}
            aria-label={qaSettings.stopOnError === false ? "Enable stop on first error" : "Disable stop on first error"}
            aria-pressed={qaSettings.stopOnError !== false}
            onClick={() => onQaSettingChange?.({ stopOnError: qaSettings.stopOnError === false })}
            disabled={qaRunning}
            {...getGenericTooltipAttrs("Stop on Error", "Stop the QA scenario immediately when the first assertion fails.")}
          >
            <i className="fa-solid fa-triangle-exclamation debug-icon" aria-hidden="true" />
            <span className="sr-only">Stop on Error</span>
          </button>
        </div>
        <div className="map-debug-recorder__runner-actions">
          {MAP_QA_SCENARIO_OPTIONS.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className="map-debug-recorder__runner-button"
              onClick={() => onQaScenarioRun?.(scenario.id)}
              disabled={qaRunning}
              {...getGenericTooltipAttrs(scenario.label, scenario.description)}
            >
              <i className={`${scenario.icon} debug-icon`} aria-hidden="true" />
              <span>{scenario.label}</span>
            </button>
          ))}
          <button
            type="button"
            className="map-debug-recorder__runner-button map-debug-recorder__runner-button--stop"
            onClick={onQaScenarioStop}
            disabled={!qaRunning}
            {...getGenericTooltipAttrs("Stop Scenario", "Stop the currently running browser QA scenario.")}
          >
            <i className="fa-solid fa-stop debug-icon" aria-hidden="true" />
            <span>Stop Scenario</span>
          </button>
        </div>
        <div className="map-debug-recorder__runner-status" aria-live="polite">
          <strong>{qaRunnerStatus?.scenarioLabel || "No scenario selected"}</strong>
          <span>{qaRunnerStatus?.stepLabel || qaRunnerStatus?.message || "Ready."}</span>
          {qaRunnerStatus?.error ? <em>{qaRunnerStatus.error}</em> : null}
        </div>
      </div>
      <div className="map-debug-recorder__feed" aria-live="polite">
        {latestEntries.length ? latestEntries.map((entry) => (
          <article className="map-debug-recorder__entry" key={entry.id}>
            <small>{entry.category} · #{entry.index}</small>
            <strong>{entry.label}</strong>
          </article>
        )) : (
          <p>No events recorded yet.</p>
        )}
      </div>
    </section>
  );
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getMapSlotIconClass(slotId) {
  if (slotId === "sensoryLayer") return "fa-solid fa-eye";
  if (slotId === "visualSigns") return "fa-solid fa-signs-post";
  if (slotId === "lairEffect") return "fa-solid fa-wand-magic-sparkles";
  if (slotId === "creatureCorruption") return "fa-solid fa-skull";
  if (slotId === "hazard") return "fa-solid fa-triangle-exclamation";
  if (slotId === "clue") return "fa-solid fa-magnifying-glass";
  return "fa-solid fa-diamond";
}

function LocationFrameInfoRow({ label, value }) {
  return (
    <span className="location-frame-info-row">
      <small>{label}</small>
      <strong>{value || "—"}</strong>
    </span>
  );
}

function LocationFrameMeter({ description, label, max, value }) {
  const safeMax = Math.max(0, Number(max) || 0);
  const safeValue = Math.max(0, Math.min(Number(value) || 0, safeMax || 0));
  const percent = safeMax ? Math.round((safeValue / safeMax) * 100) : 0;

  return (
    <div className="location-meter">
      <div className="location-meter__head">
        <span>{label}</span>
        <span className="location-meter__value">
          <strong>{safeValue} / {safeMax}</strong>
          <button
            className="tooltip-btn"
            type="button"
            aria-label={`${label} explanation`}
            data-key="tooltip-generic"
            data-tooltip={label}
            data-tooltip-description={description}
          >
            ?
          </button>
        </span>
      </div>
      <div className="location-meter__track">
        <div style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function getSourceLabel(state) {
  const sources = Array.isArray(state?.sourceAnchors) ? state.sourceAnchors : [];
  return sources.find((source) => source && source !== "Any Source") || "Any Source";
}

function getHorrorLabel(state) {
  const horrors = Array.isArray(state?.horrors) ? state.horrors : [];
  return horrors[0] || state?.horror || "Horror";
}

function getMapInfluenceFrameLabel(metrics = {}) {
  const entries = Array.isArray(metrics.entries) ? metrics.entries : [];
  const influenced = entries.filter((entry) => entry.mapInfluenceCount > 0 || entry.roomArchetypeHasMapInfluence).length;
  const forced = entries.filter((entry) => entry.roomArchetypeForced).length;
  if (!entries.length) return "—";
  if (!influenced) return "0 Rooms";
  return forced ? `${influenced} Rooms · ${forced} Forced` : `${influenced} Rooms`;
}

function getAssignedMapInfluenceLabel(components = []) {
  const influenced = components.filter((component) =>
    Boolean(component?.mapInfluence || component?.location?.mapInfluence || component?.locationRegion?.mapInfluence || component?.map?.mapInfluence),
  );
  if (!influenced.length) return "";
  return `${influenced.length} map-shaping component${influenced.length === 1 ? "" : "s"}`;
}

export function LocationMapWideDetailsBlock({
  activeSlot,
  activeSlotScope,
  onFocusSlot,
  pickerOpen = false,
  state,
}) {
  const mapSlots = getLocationSlotsForScope(LOCATION_SLOT_SCOPE_MAP);
  const activeSlotId = isSlotInScope(activeSlot?.id || state.activeSlot, LOCATION_SLOT_SCOPE_MAP)
    ? activeSlot?.id || state.activeSlot
    : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_MAP);
  const mapScopeActive = pickerOpen && activeSlotScope === LOCATION_SLOT_SCOPE_MAP;

  function focusMapSlot(slotId) {
    onFocusSlot?.(slotId, LOCATION_SLOT_SCOPE_MAP, state.activeRegionId || "");
  }

  return (
    <div className="location-map-wide-details-block" aria-label="Map-wide details">
      <div className="location-map-details-slot-stack">
        {mapSlots.map((slot) => {
          const assigned = getAssignedComponentsForSlotScope(state, slot.id, LOCATION_SLOT_SCOPE_MAP);
          const active = mapScopeActive && activeSlotId === slot.id;
          return (
            <button
              className={cx("location-map-details-slot", assigned.length ? "is-filled" : "is-empty", active && "is-active")}
              key={slot.id}
              type="button"
              aria-label={`Focus ${slot.label}`}
              aria-pressed={active}
              onClick={() => focusMapSlot(slot.id)}
            >
              <span className="location-map-details-slot__head">
                <span>
                  <i className={getMapSlotIconClass(slot.id)} aria-hidden="true" />
                  {slot.label}
                </span>
                <strong>{assigned.length ? "Filled" : "—"}</strong>
              </span>
              <span className="location-map-details-slot__body">
                <strong>{assigned[0]?.title || "Empty Slot"}</strong>
                <em>{assigned[0]?.description || getAssignedMapInfluenceLabel(assigned) || slot.description || "Map-wide component"}</em>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LocationMapDetailsPanel({
  debugMode = false,
  generatedMapPreview = null,
  mapRequest = null,
  onRenameLocation,
  side = "right",
  state,
  uiMode = "simple",
}) {
  const frame = getLocationPlaceFrame(state, mapRequest);
  const metrics = getRoomProgramMetrics(state, generatedMapPreview);
  const readyRooms = metrics.ready ?? metrics.readyCount ?? 0;
  const sideClass = side === "left" ? "location-composer__rail--left" : "location-composer__rail--right";
  const sourceLabel = getSourceLabel(state);
  const horrorLabel = getHorrorLabel(state);
  const mapStatus = generatedMapPreview ? "Map Synced" : "Frame Draft";
  const [storedDebugModeActive, setStoredDebugModeActive] = useState(readStoredMapDebugMode);
  const [debugRecording, setDebugRecording] = useState(false);
  const [debugCategories, setDebugCategories] = useState(DEFAULT_MAP_DEBUG_CATEGORIES);
  const [debugEntries, setDebugEntries] = useState([]);
  const [showDebugCoordinates, setShowDebugCoordinates] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage?.getItem("cruorMapDebugCoordinates") !== "false";
    } catch (error) {
      void error;
      return true;
    }
  });
  const showDebugCoordinatesRef = useRef(showDebugCoordinates);
  const [qaRunnerStatus, setQaRunnerStatus] = useState({
    state: "idle",
    scenarioId: "",
    scenarioLabel: "",
    stepLabel: "Ready.",
    message: "Ready.",
    settings: { speed: "normal", stopOnError: true },
  });
  const qaRunnerStatusRef = useRef(qaRunnerStatus);
  const debugEntriesRef = useRef([]);
  const debugSequenceRef = useRef(0);
  const debugModeActive = Boolean(debugMode || uiMode === "debug" || storedDebugModeActive);

  useEffect(() => {
    function handleDebugModeChange(event) {
      setStoredDebugModeActive(Boolean(event?.detail?.enabled));
    }

    window.addEventListener("cruor:map-debug-mode-change", handleDebugModeChange);
    return () => window.removeEventListener("cruor:map-debug-mode-change", handleDebugModeChange);
  }, []);

  useEffect(() => {
    if (debugModeActive) return;
    setDebugRecording(false);
  }, [debugModeActive]);

  useEffect(() => {
    qaRunnerStatusRef.current = qaRunnerStatus;
  }, [qaRunnerStatus]);

  useEffect(() => {
    showDebugCoordinatesRef.current = showDebugCoordinates;
  }, [showDebugCoordinates]);

  function dispatchDebugCoordinatesChange(enabled, { persist = true } = {}) {
    const nextEnabled = Boolean(enabled);
    showDebugCoordinatesRef.current = nextEnabled;
    setShowDebugCoordinates(nextEnabled);
    if (typeof window === "undefined") return;
    try {
      if (persist) {
        window.localStorage?.setItem("cruorMapDebugCoordinates", nextEnabled ? "true" : "false");
      }
    } catch (error) {
      void error;
    }
    window.dispatchEvent(new CustomEvent("cruor:map-debug-coordinates-change", {
      detail: { enabled: nextEnabled, source: "composer-debug-recorder" },
    }));
  }

  useEffect(() => {
    if (!debugModeActive) return;
    dispatchDebugCoordinatesChange(showDebugCoordinatesRef.current, { persist: false });
  }, [debugModeActive]);

  useEffect(() => {
    function handleQaRunnerStatus(event) {
      const detail = event?.detail || {};
      setQaRunnerStatus((current) => ({
        ...current,
        ...detail,
        settings: {
          ...(current.settings || {}),
          ...(detail.settings || {}),
        },
      }));
    }

    window.addEventListener("cruor:map-qa-runner-status", handleQaRunnerStatus);
    return () => window.removeEventListener("cruor:map-qa-runner-status", handleQaRunnerStatus);
  }, []);

  useEffect(() => {
    debugEntriesRef.current = debugEntries;
  }, [debugEntries]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const recorder = {
      enabled: debugModeActive,
      recording: debugRecording,
      categories: debugCategories,
      entries: debugEntriesRef.current,
      record(label, payload = {}, options = {}) {
        const category = options.category || getMapDebugCategory(label);
        if (!debugModeActive || !debugRecording || !debugCategories?.[category]) return;
        const nextIndex = (debugSequenceRef.current || 0) + 1;
        debugSequenceRef.current = nextIndex;
        const entry = {
          id: `composer-map-debug-${Date.now()}-${nextIndex}`,
          index: nextIndex,
          timestamp: new Date().toISOString(),
          source: options.source || "composer-inline-map",
          category,
          label,
          payload: cloneMapDebugPayload(payload),
        };
        setDebugEntries((current) => {
          const nextEntries = [...current, entry].slice(-1500);
          debugEntriesRef.current = nextEntries;
          return nextEntries;
        });
      },
    };

    window.__cruorMapDebugRecorder = recorder;

    return () => {
      if (window.__cruorMapDebugRecorder === recorder) {
        delete window.__cruorMapDebugRecorder;
      }
    };
  }, [debugCategories, debugModeActive, debugRecording]);

  useEffect(() => {
    if (!debugModeActive || !debugRecording) return;
    const nextIndex = (debugSequenceRef.current || 0) + 1;
    debugSequenceRef.current = nextIndex;
    const entry = {
      id: `composer-map-debug-start-${Date.now()}-${nextIndex}`,
      index: nextIndex,
      timestamp: new Date().toISOString(),
      source: "composer-rail",
      category: "performance",
      label: "debug recorder: recording started",
      payload: {
        mapStatus,
        rooms: metrics.total || 0,
        readyRooms,
        hasGeneratedMapPreview: Boolean(generatedMapPreview),
      },
    };
    setDebugEntries((current) => {
      const nextEntries = [...current, entry].slice(-1500);
      debugEntriesRef.current = nextEntries;
      return nextEntries;
    });
  }, [debugModeActive, debugRecording]);

  function clearDebugEntries() {
    debugEntriesRef.current = [];
    debugSequenceRef.current = 0;
    setDebugEntries([]);
  }

  function toggleDebugCategory(categoryId) {
    setDebugCategories((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  }

  function updateQaRunnerSetting(patch = {}) {
    setQaRunnerStatus((current) => ({
      ...current,
      settings: {
        ...(current.settings || {}),
        ...patch,
      },
    }));
  }

  function runQaScenario(scenarioId) {
    const scenario = MAP_QA_SCENARIO_OPTIONS.find((item) => item.id === scenarioId);
    if (!scenario) return;
    setDebugRecording(true);
    const settings = qaRunnerStatusRef.current?.settings || {};
    setQaRunnerStatus((current) => ({
      ...current,
      state: "queued",
      scenarioId,
      scenarioLabel: scenario.label,
      stepLabel: "Queued.",
      message: "Queued.",
      error: "",
    }));
    window.dispatchEvent(new CustomEvent("cruor:map-qa-runner-run", {
      detail: {
        scenarioId,
        scenarioLabel: scenario.label,
        settings,
      },
    }));
  }

  function stopQaScenario() {
    window.dispatchEvent(new CustomEvent("cruor:map-qa-runner-stop", {
      detail: { source: "composer-right-rail" },
    }));
  }

  function waitForNextAnimationFrame() {
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      return Promise.resolve();
    }
    return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
  }

  function getDebugSvgElement() {
    if (typeof document === "undefined") return null;
    return (
      document.querySelector(".location-map-preview--inline-editor #cruor-map-svg") ||
      document.querySelector("#cruor-map-svg")
    );
  }

  function serializeDebugSvgElement(svgElement) {
    if (!svgElement) return "";
    const clone = svgElement.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.querySelectorAll(".editor-overlays").forEach((node) => node.remove());
    return new XMLSerializer().serializeToString(clone);
  }

  async function serializeDebugSvgWithCoordinates() {
    const previousCoordinates = showDebugCoordinatesRef.current;
    dispatchDebugCoordinatesChange(true, { persist: false });
    try {
      await waitForNextAnimationFrame();
      await waitForNextAnimationFrame();
      return serializeDebugSvgElement(getDebugSvgElement());
    } finally {
      if (!previousCoordinates) {
        dispatchDebugCoordinatesChange(false, { persist: false });
      }
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
    const svg = await serializeDebugSvgWithCoordinates();
    if (!svg) return;
    await copyTextToClipboard(svg);
  }

  async function downloadDebugSvg() {
    const svg = await serializeDebugSvgWithCoordinates();
    if (!svg) return;
    downloadMapDebugBlob(getDebugSvgFilename(), svg, "image/svg+xml;charset=utf-8");
  }

  function downloadDebugEntries(format = "json") {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const payload = {
      schema: "cruor-map-debug-recorder/v1",
      exportedAt: new Date().toISOString(),
      recording: debugRecording,
      source: "composer-right-rail",
      categories: debugCategories,
      counts: {
        entries: debugEntriesRef.current.length,
        rooms: metrics.total || 0,
        readyRooms,
        generatedMapRegions: Array.isArray(generatedMapPreview?.regions) ? generatedMapPreview.regions.length : 0,
        generatedMapCorridors: Array.isArray(generatedMapPreview?.corridors) ? generatedMapPreview.corridors.length : 0,
      },
      mapRequest: cloneMapDebugPayload(mapRequest),
      qaRunner: cloneMapDebugPayload(qaRunnerStatusRef.current),
      entries: debugEntriesRef.current,
    };

    if (format === "txt") {
      downloadMapDebugBlob(
        `cruor-map-debug-${stamp}.txt`,
        payload.entries.map(formatMapDebugEntryText).join("\n\n---\n\n"),
        "text/plain",
      );
      return;
    }

    downloadMapDebugBlob(
      `cruor-map-debug-${stamp}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );
  }

  return (
    <aside
      className={`cruor-composer-rail location-composer__rail ${sideClass} location-map-details-rail location-frame-info`}
      aria-label="Current Place Frame"
    >
      <section className="location-frame-info-card location-frame-info-card--hero">
        <span>Current Frame</span>
        <label className="location-frame-name-editor location-map-details-name-editor">
          <span className="sr-only">Location name</span>
          <input
            type="text"
            aria-label="Location name"
            value={state.title || ""}
            onChange={(event) => onRenameLocation?.(event.target.value)}
          />
        </label>
        <em>{sourceLabel} · {horrorLabel}</em>
      </section>

      <section className="location-frame-info-card" aria-label="Place frame summary">
        <div className="location-frame-info-grid">
          <LocationFrameInfoRow label="Context" value={frame.context || state.context || "Context"} />
          <LocationFrameInfoRow label="Use" value={frame.use || "Ritual reveal"} />
          <LocationFrameInfoRow label="Route" value={frame.routePressure} />
          <LocationFrameInfoRow label="Scale" value={frame.scale} />
          <LocationFrameInfoRow label="Complexity" value={frame.complexity} />
          <LocationFrameInfoRow label="Shaped Rooms" value={getMapInfluenceFrameLabel(metrics)} />
          <LocationFrameInfoRow label="Status" value={mapStatus} />
        </div>
      </section>

      <section className="location-frame-info-card" aria-label="Location readiness">
        <LocationFrameMeter
          label="Ready Rooms"
          value={readyRooms}
          max={metrics.total || 0}
          description="Ready Rooms measures how many rooms have enough table-facing content to be used in the generated location."
        />
      </section>

      {debugModeActive ? (
        <MapDebugRecorderPanel
          categories={debugCategories}
          entries={debugEntries}
          recording={debugRecording}
          onRecordingChange={setDebugRecording}
          onToggleCategory={toggleDebugCategory}
          onClear={clearDebugEntries}
          qaRunnerStatus={qaRunnerStatus}
          onQaScenarioRun={runQaScenario}
          onQaScenarioStop={stopQaScenario}
          onQaSettingChange={updateQaRunnerSetting}
          onToggleDebugCoordinates={dispatchDebugCoordinatesChange}
          showDebugCoordinates={showDebugCoordinates}
          onCopyDebugSvg={copyDebugSvg}
          onDownloadDebugSvg={downloadDebugSvg}
          onDownloadJson={() => downloadDebugEntries("json")}
          onDownloadTxt={() => downloadDebugEntries("txt")}
        />
      ) : null}
    </aside>
  );
}
