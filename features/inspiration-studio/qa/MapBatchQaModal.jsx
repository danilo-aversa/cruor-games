import { useMemo, useState } from "react";
import { StudioToolModalShell } from "../components/StudioToolModalShell.jsx";
import { StudioIcon } from "../components/StudioIcon.jsx";
import { getDungeonThemes } from "../../darken-location/dungeon/dungeon.index.js";
import {
  buildMapBatchQaMarkdown,
  downloadMapBatchQaReport,
  getMapBatchQaCostWarning,
  runMapBatchQa,
} from "../../darken-location/map-generator/qa/map-batch-qa.js";

const DEFAULT_COUNT = 50;
const DEFAULT_ROOM_MIN = 4;
const DEFAULT_ROOM_MAX = 12;
const QA_MODES = Object.freeze([
  { id: "realistic", label: "Realistic QA", help: "Keep each theme close to its preferred context/map type bias." },
  { id: "stress", label: "Stress QA", help: "Allow unlikely theme/context combinations to expose generator edge cases." },
]);
const CONTEXT_OPTIONS = Object.freeze([
  { id: "mixed", label: "Mixed Contexts" },
  { id: "Crypt", label: "Crypt" },
  { id: "Chapel", label: "Chapel" },
  { id: "Cave", label: "Cave" },
  { id: "Mine", label: "Mine" },
  { id: "Noble House", label: "Noble House" },
  { id: "Ruins", label: "Ruins" },
]);

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function formatNumber(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("en-US") : "0";
}

function clampInteger(value, fallback, min, max) {
  const numeric = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, numeric));
}

function getQaResultTone(report, summary = {}, analytics = {}, runState = "idle") {
  if (runState === "error") return "error";
  if (!report) return "idle";

  const errorCount =
    Number(summary.error || 0) +
    Number(analytics.failed || 0) +
    Number(analytics.overlapFailures || 0) +
    Number(analytics.unreachableFailures || 0) +
    Number(analytics.determinismFailures || 0);

  if (errorCount > 0) return "error";

  const warningCount =
    Number(summary.warning || 0) +
    Number(analytics.review || 0) +
    Number(analytics.seedVariationWarnings || 0);

  if (warningCount > 0) return "warning";
  return "clean";
}

function getQaToneClass(baseClass, tone) {
  return tone && tone !== "idle" ? `${baseClass} ${baseClass}--${tone}` : baseClass;
}

function getExportButtonClass(exportState) {
  return `studio-tool-action studio-qa-run-button ${exportState === "exporting" ? "studio-qa-run-button--exporting" : ""} ${exportState === "complete" ? "studio-qa-run-button--downloaded" : ""}`.trim();
}

function getExportButtonIcon(exportState, fallbackIcon) {
  if (exportState === "exporting") return "fa-spinner";
  if (exportState === "complete") return "fa-circle-check";
  return fallbackIcon;
}

function getExportButtonLabel(exportState, fallbackLabel) {
  if (exportState === "exporting") return "Exporting...";
  if (exportState === "complete") return "Downloaded";
  return fallbackLabel;
}

function SummaryTile({ icon = "fa-chart-simple", label, value, tone = "default" }) {
  return (
    <div className={`studio-qa-summary-tile studio-qa-summary-tile--${tone}`.trim()}>
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function IssueGroupList({ groups = [], statusTone = "idle" }) {
  const visibleGroups = asArray(groups).slice(0, 16);
  if (!visibleGroups.length) {
    return (
      <div className={getQaToneClass("studio-qa-empty", statusTone)}>
        <StudioIcon name="fa-circle-check" />
        <span>No map issues found in this run.</span>
      </div>
    );
  }

  return (
    <div className="studio-qa-issue-groups">
      {visibleGroups.map((group) => (
        <article className={`studio-qa-issue-group studio-qa-issue-group--${group.severity}`.trim()} key={group.key}>
          <header>
            <span>{group.severity}</span>
            <strong>{group.area} / {group.check}</strong>
            <em>{group.count}×</em>
          </header>
          <p>{group.message}</p>
          {group.ids?.length ? <small>Examples: {group.ids.join(", ")}</small> : null}
        </article>
      ))}
    </div>
  );
}

function MapOutlierTable({ generated = [], statusTone = "idle" }) {
  const outliers = asArray(generated)
    .filter((item) => item.status !== "passed" || Number(item.issueCount || 0) > 0)
    .slice(0, 32);

  if (!outliers.length) {
    return (
      <div className={getQaToneClass("studio-qa-empty", statusTone)}>
        <StudioIcon name="fa-map-location-dot" />
        <span>No generated map outliers.</span>
      </div>
    );
  }

  return (
    <div className="studio-qa-table-scroll">
      <table className="studio-qa-table">
        <thead>
          <tr>
            <th>Map</th>
            <th>Theme</th>
            <th>Context</th>
            <th>Rooms</th>
            <th>Structure</th>
            <th>Status</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {outliers.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.id}</strong>
                <span>{item.seed}</span>
              </td>
              <td>{item.themeName || item.themeId}<span>{item.scale} · {item.complexity}</span></td>
              <td>{item.context}<span>{item.visualStyle}</span></td>
              <td>{item.metrics?.regions ?? item.roomCount}<span>target {item.roomCount}</span></td>
              <td>{item.metrics?.corridors ?? 0} corridors<span>{item.metrics?.doors ?? 0} doors</span></td>
              <td>{item.status}<span>{item.elapsedMs || 0}ms</span></td>
              <td>{item.issueCount || 0}<span>{item.errorCount || 0} errors</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MapBatchQaModal({ isOpen, onClose }) {
  const themeOptions = useMemo(() => [{ id: "mixed", name: "Mixed Themes" }, ...getDungeonThemes()], []);
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [roomCountMin, setRoomCountMin] = useState(DEFAULT_ROOM_MIN);
  const [roomCountMax, setRoomCountMax] = useState(DEFAULT_ROOM_MAX);
  const [seed, setSeed] = useState("cruor-map-studio-qa");
  const [qaMode, setQaMode] = useState("realistic");
  const [themeId, setThemeId] = useState("mixed");
  const [context, setContext] = useState("mixed");
  const [includeFullPayloads, setIncludeFullPayloads] = useState(false);
  const [runState, setRunState] = useState("idle");
  const [copyState, setCopyState] = useState("idle");
  const [exportState, setExportState] = useState("idle");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const isRunning = runState === "running";
  const costWarning = useMemo(() => getMapBatchQaCostWarning(count), [count]);
  const suite = report?.suites?.find((item) => item.id === "map-batch-generation") || report?.suites?.[0];
  const generated = suite?.metrics?.generated || [];
  const analytics = suite?.metrics?.analytics || {};
  const summary = report?.summary || { total: 0, error: 0, warning: 0, info: 0 };
  const qaResultTone = getQaResultTone(report, summary, analytics, runState);

  function handleClose() {
    if (isRunning) return;
    onClose?.();
  }

  function runQa() {
    setRunState("running");
    setError("");
    setCopyState("idle");
    setExportState("idle");

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        try {
          const minRooms = clampInteger(roomCountMin, DEFAULT_ROOM_MIN, 1, 16);
          const maxRooms = clampInteger(roomCountMax, DEFAULT_ROOM_MAX, 1, 16);
          const result = runMapBatchQa({
            count: clampInteger(count, DEFAULT_COUNT, 1, 500),
            roomCountMin: Math.min(minRooms, maxRooms),
            roomCountMax: Math.max(minRooms, maxRooms),
            seed,
            qaMode,
            themeId,
            context,
            includeFullPayloads,
          });
          setReport(result);
          setRunState("complete");
        } catch (runError) {
          setError(runError?.message || String(runError));
          setRunState("error");
        }
      }, 40);
    });
  }

  async function copyMarkdown() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(buildMapBatchQaMarkdown(report));
      setCopyState("copied");
    } catch (copyError) {
      setCopyState("failed");
    }
  }

  function exportJson() {
    if (!report || exportState === "exporting" || exportState === "complete") return;
    setExportState("exporting");

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        try {
          downloadMapBatchQaReport(report, { format: "json" });
          setExportState("complete");
        } catch (exportError) {
          setExportState("failed");
          setError(exportError?.message || String(exportError));
        }
      }, 120);
    });
  }

  const actions = (
    <button
      className={getExportButtonClass(exportState)}
      type="button"
      disabled={isRunning || !report || exportState === "exporting" || exportState === "complete"}
      onClick={exportJson}
    >
      <StudioIcon name={getExportButtonIcon(exportState, "fa-file-arrow-down")} /> {getExportButtonLabel(exportState, "Export JSON")}
    </button>
  );

  return (
    <>
      <StudioToolModalShell
        actions={actions}
        className="studio-map-batch-qa-modal"
        icon="fa-map-location-dot"
        id="studio-map-batch-qa-modal"
        isOpen={isOpen}
        onClose={handleClose}
        subtitle="Generate many dungeon maps from DungeonTheme and DungeonBrief inputs, then validate topology, reachability, determinism, room count, and RoomBrief propagation."
        title="Map Batch QA"
      >
        <div className="studio-qa-workspace">
          <section className="studio-panel studio-panel--qa-controls">
            <header className="studio-panel__header">
              <div>
                <span><StudioIcon name="fa-sliders" /> Test Setup</span>
                <h3>Batch Parameters</h3>
              </div>
            </header>
            <div className="studio-qa-control-grid">
              <label>
                <span>Map Count</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={count}
                  onChange={(event) => setCount(clampInteger(event.target.value, DEFAULT_COUNT, 1, 500))}
                />
              </label>
              <label>
                <span>Min Rooms</span>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={roomCountMin}
                  onChange={(event) => setRoomCountMin(clampInteger(event.target.value, DEFAULT_ROOM_MIN, 1, 16))}
                />
              </label>
              <label>
                <span>Max Rooms</span>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={roomCountMax}
                  onChange={(event) => setRoomCountMax(clampInteger(event.target.value, DEFAULT_ROOM_MAX, 1, 16))}
                />
              </label>
              <label>
                <span>QA Mode</span>
                <select value={qaMode} onChange={(event) => setQaMode(event.target.value)}>
                  {QA_MODES.map((mode) => (
                    <option value={mode.id} key={mode.id}>{mode.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Theme</span>
                <select value={themeId} onChange={(event) => setThemeId(event.target.value)}>
                  {themeOptions.map((theme) => (
                    <option value={theme.id} key={theme.id}>{theme.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Context</span>
                <select value={context} onChange={(event) => setContext(event.target.value)}>
                  {CONTEXT_OPTIONS.map((option) => (
                    <option value={option.id} key={option.id}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Seed</span>
                <input value={seed} onChange={(event) => setSeed(event.target.value)} />
              </label>
            </div>
            <div className="studio-qa-option-row">
              <label className="studio-qa-check-option">
                <input
                  type="checkbox"
                  checked={includeFullPayloads}
                  onChange={(event) => setIncludeFullPayloads(event.target.checked)}
                />
                <span className="studio-qa-checkbox" aria-hidden="true" />
                <span className="studio-qa-option-copy">Keep full debug payloads for every generated map. Use only for smaller runs.</span>
              </label>
            </div>
            <p className="studio-qa-mode-note">
              <StudioIcon name={qaMode === "stress" ? "fa-bolt" : "fa-filter-circle-check"} />
              {QA_MODES.find((mode) => mode.id === qaMode)?.help}
            </p>
            {costWarning ? (
              <div className={`studio-qa-cost-warning studio-qa-cost-warning--${costWarning.severity}`.trim()}>
                <StudioIcon name="fa-triangle-exclamation" />
                <span>{costWarning.message}</span>
              </div>
            ) : null}
            {error ? (
              <div className="studio-qa-cost-warning studio-qa-cost-warning--danger">
                <StudioIcon name="fa-circle-xmark" />
                <span>{error}</span>
              </div>
            ) : null}
            <div className="studio-qa-run-row">
              <button className="studio-button studio-button--primary studio-qa-run-button" type="button" disabled={isRunning} onClick={runQa}>
                <StudioIcon name={runState === "running" ? "fa-spinner" : "fa-play"} />
                {runState === "running" ? "Running…" : "Run Map Batch QA"}
              </button>
              <button className="studio-button studio-qa-run-button" type="button" disabled={isRunning || !report} onClick={copyMarkdown}>
                <StudioIcon name="fa-copy" />
                {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy Failed" : "Copy Markdown"}
              </button>
            </div>
          </section>

          <section className={`studio-panel ${getQaToneClass("studio-panel--qa-results", qaResultTone)}`.trim()}>
            <header className="studio-panel__header">
              <div>
                <span><StudioIcon name="fa-chart-simple" /> Results</span>
                <h3>{report ? `${formatNumber(generated.length)} Maps Tested` : "No Run Yet"}</h3>
              </div>
            </header>
            <div className="studio-qa-summary-grid">
              <SummaryTile icon="fa-list-check" label="Issues" value={formatNumber(summary.total)} tone={summary.total ? "warning" : "clean"} />
              <SummaryTile icon="fa-circle-xmark" label="Errors" value={formatNumber(summary.error)} tone={summary.error ? "error" : "clean"} />
              <SummaryTile icon="fa-triangle-exclamation" label="Warnings" value={formatNumber(summary.warning)} tone={summary.warning ? "warning" : "clean"} />
              <SummaryTile icon="fa-circle-info" label="Info" value={formatNumber(summary.info)} tone="default" />
              <SummaryTile icon="fa-map-location-dot" label="Passed" value={formatNumber(analytics.passed)} tone={analytics.failed ? "warning" : "clean"} />
              <SummaryTile icon="fa-bug" label="Failed" value={formatNumber(analytics.failed)} tone={analytics.failed ? "error" : "clean"} />
              <SummaryTile icon="fa-route" label="Unreachable" value={formatNumber(analytics.unreachableFailures)} tone={analytics.unreachableFailures ? "error" : "clean"} />
              <SummaryTile icon="fa-layer-group" label="Overlaps" value={formatNumber(analytics.overlapFailures)} tone={analytics.overlapFailures ? "error" : "clean"} />
              <SummaryTile icon="fa-fingerprint" label="Determinism" value={formatNumber(analytics.determinismFailures)} tone={analytics.determinismFailures ? "error" : "clean"} />
              <SummaryTile icon="fa-shuffle" label="Seed Warnings" value={formatNumber(analytics.seedVariationWarnings)} tone={analytics.seedVariationWarnings ? "warning" : "clean"} />
              <SummaryTile icon="fa-door-open" label="Avg Doors" value={analytics.averageDoors ?? "—"} tone="default" />
              <SummaryTile icon="fa-stopwatch" label="Avg Runtime" value={`${analytics.averageElapsedMs ?? 0}ms`} tone="default" />
            </div>
            <IssueGroupList groups={report?.groupedIssues || []} statusTone={qaResultTone} />
          </section>

          <section className="studio-panel studio-panel--qa-outliers">
            <header className="studio-panel__header">
              <div>
                <span><StudioIcon name="fa-magnifying-glass-chart" /> Outliers</span>
                <h3>Generated Maps to Review</h3>
              </div>
            </header>
            <MapOutlierTable generated={generated} statusTone={qaResultTone} />
          </section>
        </div>
      </StudioToolModalShell>
      {isRunning ? (
        <div className="studio-qa-running-overlay" role="alert" aria-live="assertive" aria-busy="true">
          <div className="studio-qa-running-card">
            <div className="studio-qa-running-spinner" aria-hidden="true">
              <span />
              <span />
            </div>
            <span className="studio-qa-running-eyebrow">Map Batch QA</span>
            <strong>Test running</strong>
            <p>Do not close or reload this page. Test results will be lost if the process is interrupted.</p>
            <small>{formatNumber(clampInteger(count, DEFAULT_COUNT, 1, 500))} maps · {QA_MODES.find((mode) => mode.id === qaMode)?.label || "QA"} · seed {seed || "—"}</small>
          </div>
        </div>
      ) : null}
    </>
  );
}
