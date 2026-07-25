import { useEffect, useMemo, useState } from "react";
import { StudioToolModalShell } from "../components/StudioToolModalShell.jsx";
import { StudioIcon } from "../components/StudioIcon.jsx";
import { STUDIO_TEST_IDS } from "./studio-test-presets.js";
import {
  MONSTER_BATCH_QA_VERSION,
  buildMonsterBatchQaMarkdown,
  downloadMonsterBatchQaReport,
  getMonsterBatchQaCostWarning,
  runMonsterBatchQa,
} from "../../monster-composer/qa/monster-batch-qa.js";

const DEFAULT_COUNT = 100;
const DEFAULT_CR_MIN = 1;
const DEFAULT_CR_MAX = 10;
const QA_MODES = Object.freeze([
  { id: "realistic", label: "Realistic QA", help: "Only test source/type frames with enough core graft coverage." },
  { id: "stress", label: "Stress QA", help: "Allow unlikely combinations to expose content coverage gaps." },
]);

const EXPORT_MODES = Object.freeze([
  { id: "compact", label: "Compact ZIP", help: "Small aggregate report. Best for quick pattern checks." },
  { id: "debug", label: "Debug ZIP", help: "Compact report plus full payloads for failed/outlier monsters. Best default for analysis." },
  { id: "full", label: "Full ZIP", help: "Largest export. Includes every payload kept by the browser run." },
]);

const TEST_ID = STUDIO_TEST_IDS.monsterBatch;

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function formatNumber(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("en-US") : "0";
}

function clampCount(value) {
  const numeric = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(numeric)) return DEFAULT_COUNT;
  return Math.max(1, Math.min(1000, numeric));
}

function getQaResultTone(report, summary = {}, analytics = {}, runState = "idle") {
  if (runState === "error") return "error";
  if (!report) return "idle";

  const errorCount =
    Number(summary.error || 0) +
    Number(analytics.failed || 0) +
    Number(analytics.publishBlocked || 0) +
    Number(analytics.statBlockParserFailed || 0) +
    Number(analytics.exportFailed || 0);

  if (errorCount > 0) return "error";

  const warningCount =
    Number(summary.warning || 0) +
    Number(analytics.review || 0) +
    Number(analytics.statBlockParserWarnings || 0) +
    Number(analytics.parserWarnings || 0);

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
        <span>No issues found in this run.</span>
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

function OutlierTable({ generated = [], statusTone = "idle" }) {
  const outliers = asArray(generated)
    .filter((item) => item.balanceStatus === "analyzed" && (Number(item.crDelta || 0) >= 2 || Number(item.issueCount || 0) > 0 || item.publishStatus === "blocked" || item.publishStatus === "review" || item.statBlockParserStatus === "error" || item.statBlockParserStatus === "warning"))
    .slice(0, 24);

  if (!outliers.length) {
    return (
      <div className={getQaToneClass("studio-qa-empty", statusTone)}>
        <StudioIcon name="fa-shield-check" />
        <span>No generated monster outliers.</span>
      </div>
    );
  }

  return (
    <div className="studio-qa-table-scroll">
      <table className="studio-qa-table">
        <thead>
          <tr>
            <th>Monster</th>
            <th>Frame</th>
            <th>CR</th>
            <th>DPR</th>
            <th>Pressure</th>
            <th>Status</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {outliers.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name || item.id}</strong>
                <span>{item.id}</span>
              </td>
              <td>{item.frame?.sourceId || "—"} · {item.frame?.category || "—"}</td>
              <td>{item.targetCr} → {item.estimatedCr} <span>Δ {item.crDelta}</span></td>
              <td>{item.dpr || "—"} / {item.baselineDpr || "—"}<span>Burst {item.burstDpr || 0}</span></td>
              <td>{item.pressureLabel || "—"}<span>{item.pressure ?? "—"}</span></td>
              <td>{item.publishStatus || item.forgeStatus || "—"}<span>{item.balanceStatus || "—"}</span></td>
              <td>{item.issueCount || 0}<span>{item.infoCount || 0} info</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizePresetParams(params = {}) {
  const crMin = Number.isFinite(Number(params.crMin)) ? Number(params.crMin) : DEFAULT_CR_MIN;
  const crMax = Number.isFinite(Number(params.crMax)) ? Number(params.crMax) : DEFAULT_CR_MAX;
  const normalizedCrMin = Math.max(0, Math.min(30, crMin));
  const normalizedCrMax = Math.max(0, Math.min(30, crMax));
  const qaMode = QA_MODES.some((mode) => mode.id === params.qaMode) ? params.qaMode : "realistic";
  const exportMode = EXPORT_MODES.some((mode) => mode.id === params.exportMode) ? params.exportMode : "debug";

  return {
    count: clampCount(params.count ?? DEFAULT_COUNT),
    crMin: Math.min(normalizedCrMin, normalizedCrMax),
    crMax: Math.max(normalizedCrMin, normalizedCrMax),
    seed: String(params.seed || "cruor-studio-qa"),
    qaMode,
    includeOptionalSlots: params.includeOptionalSlots !== false,
    includeFullPayloads: Boolean(params.includeFullPayloads),
    exportMode,
  };
}

function getDefaultPresetName(params = {}) {
  return `Monster Batch QA · ${params.count || DEFAULT_COUNT} · CR ${params.crMin ?? DEFAULT_CR_MIN}–${params.crMax ?? DEFAULT_CR_MAX}`;
}

export function MonsterBatchQaModal({ isOpen, mode = "modal", onClose, presetRun = null, onPresetRunConsumed, onSavePreset }) {
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [crMin, setCrMin] = useState(DEFAULT_CR_MIN);
  const [crMax, setCrMax] = useState(DEFAULT_CR_MAX);
  const [seed, setSeed] = useState("cruor-studio-qa");
  const [qaMode, setQaMode] = useState("realistic");
  const [includeOptionalSlots, setIncludeOptionalSlots] = useState(true);
  const [includeFullPayloads, setIncludeFullPayloads] = useState(false);
  const [exportMode, setExportMode] = useState("debug");
  const [runState, setRunState] = useState("idle");
  const [copyState, setCopyState] = useState("idle");
  const [exportState, setExportState] = useState("idle");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const isRunning = runState === "running";

  function handleClose() {
    if (isRunning) return;
    onClose?.();
  }

  function getCurrentPresetParams() {
    return normalizePresetParams({
      count,
      crMin,
      crMax,
      seed,
      qaMode,
      includeOptionalSlots,
      includeFullPayloads,
      exportMode,
    });
  }

  function applyPresetParams(params = {}) {
    const normalized = normalizePresetParams(params);
    setCount(normalized.count);
    setCrMin(normalized.crMin);
    setCrMax(normalized.crMax);
    setSeed(normalized.seed);
    setQaMode(normalized.qaMode);
    setIncludeOptionalSlots(normalized.includeOptionalSlots);
    setIncludeFullPayloads(normalized.includeFullPayloads);
    setExportMode(normalized.exportMode);
    return normalized;
  }

  function savePreset() {
    const params = getCurrentPresetParams();
    const name = window.prompt("Preset name", getDefaultPresetName(params));
    if (!name?.trim()) return;

    onSavePreset?.({
      testId: TEST_ID,
      name: name.trim(),
      version: MONSTER_BATCH_QA_VERSION,
      params,
    });
  }

  const costWarning = useMemo(() => getMonsterBatchQaCostWarning(count), [count]);
  const suite = report?.suites?.find((item) => item.id === "monster-batch-generation") || report?.suites?.[0];
  const generated = suite?.metrics?.generated || [];
  const analytics = suite?.metrics?.analytics || {};
  const summary = report?.summary || { total: 0, error: 0, warning: 0, info: 0 };
  const qaResultTone = getQaResultTone(report, summary, analytics, runState);

  function runQa(paramsOverride = null, { autoDownload = false } = {}) {
    const params = normalizePresetParams(paramsOverride || getCurrentPresetParams());
    setRunState("running");
    setError("");
    setCopyState("idle");
    setExportState(autoDownload ? "exporting" : "idle");

    window.requestAnimationFrame(() => {
      window.setTimeout(async () => {
        try {
          const result = runMonsterBatchQa({
            count: params.count,
            crMin: params.crMin,
            crMax: params.crMax,
            seed: params.seed,
            qaMode: params.qaMode,
            includeOptionalSlots: params.includeOptionalSlots,
            includeFullPayloads: params.includeFullPayloads,
          });
          setReport(result);
          setRunState("complete");

          if (autoDownload) {
            try {
              await downloadMonsterBatchQaReport(result, { format: "zip", exportMode: params.exportMode });
              setExportState("complete");
            } catch (exportError) {
              setExportState("failed");
              setError(exportError?.message || String(exportError));
            }
          }
        } catch (runError) {
          setError(runError?.message || String(runError));
          setRunState("error");
          setExportState("idle");
        }
      }, 40);
    });
  }

  useEffect(() => {
    if (!isOpen || !presetRun || presetRun.testId !== TEST_ID) return;
    const params = applyPresetParams(presetRun.params);
    runQa(params, { autoDownload: true });
    onPresetRunConsumed?.(presetRun.runToken || presetRun.id);
  }, [isOpen, presetRun?.runToken]);

  async function copyMarkdown() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(buildMonsterBatchQaMarkdown(report));
      setCopyState("copied");
    } catch (copyError) {
      setCopyState("failed");
    }
  }


  async function exportZip() {
    if (!report || exportState === "exporting" || exportState === "complete") return;
    setExportState("exporting");
    try {
      await downloadMonsterBatchQaReport(report, { format: "zip", exportMode });
      setExportState("complete");
    } catch (exportError) {
      setExportState("failed");
      setError(exportError?.message || String(exportError));
    }
  }

  const actions = (
    <>
      <button
        className={getExportButtonClass(exportState)}
        type="button"
        disabled={isRunning || !report || exportState === "exporting" || exportState === "complete"}
        onClick={exportZip}
      >
        <StudioIcon name={getExportButtonIcon(exportState, "fa-file-zipper")} /> {getExportButtonLabel(exportState, `Export ${EXPORT_MODES.find((mode) => mode.id === exportMode)?.label || "ZIP"}`)}
      </button>
    </>
  );

  return (
    <>
    <StudioToolModalShell
      actions={actions}
      className="studio-monster-batch-qa-modal"
      icon="fa-vial-circle-check"
      id="studio-monster-batch-qa-modal"
      isOpen={isOpen}
      mode={mode}
      onClose={handleClose}
      subtitle="Generate many Monster Composer frames, validate grafts, DPR, CR, pressure, exports, and compatibility in one browser-side run."
      title="Monster Batch QA"
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
              <span>Monster Count</span>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(event) => setCount(clampCount(event.target.value))}
              />
            </label>
            <label>
              <span>Min CR</span>
              <input
                type="number"
                min="0"
                max="30"
                value={crMin}
                onChange={(event) => setCrMin(Number(event.target.value))}
              />
            </label>
            <label>
              <span>Max CR</span>
              <input
                type="number"
                min="0"
                max="30"
                value={crMax}
                onChange={(event) => setCrMax(Number(event.target.value))}
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
              <span>Export Mode</span>
              <select value={exportMode} onChange={(event) => setExportMode(event.target.value)}>
                {EXPORT_MODES.map((mode) => (
                  <option value={mode.id} key={mode.id}>{mode.label}</option>
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
                checked={includeOptionalSlots}
                onChange={(event) => setIncludeOptionalSlots(event.target.checked)}
              />
              <span className="studio-qa-checkbox" aria-hidden="true" />
              <span className="studio-qa-option-copy">Include optional slots such as Mind, Movement, Twist, Death, and Lair when available.</span>
            </label>
            <label className="studio-qa-check-option">
              <input
                type="checkbox"
                checked={includeFullPayloads}
                onChange={(event) => setIncludeFullPayloads(event.target.checked)}
              />
              <span className="studio-qa-checkbox" aria-hidden="true" />
              <span className="studio-qa-option-copy">Keep full payloads for every generated monster. Use only when you plan to export Full ZIP.</span>
            </label>
          </div>
          <p className="studio-qa-mode-note">
            <StudioIcon name={qaMode === "stress" ? "fa-bolt" : "fa-filter-circle-check"} />
            {QA_MODES.find((mode) => mode.id === qaMode)?.help}
          </p>
          <p className="studio-qa-mode-note">
            <StudioIcon name={exportMode === "full" ? "fa-box-archive" : exportMode === "debug" ? "fa-bug" : "fa-file-zipper"} />
            {EXPORT_MODES.find((mode) => mode.id === exportMode)?.help}
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
            <button className="studio-button studio-button--primary studio-qa-run-button" type="button" disabled={isRunning} onClick={() => runQa()}>
              <StudioIcon name={runState === "running" ? "fa-spinner" : "fa-play"} />
              {runState === "running" ? "Running…" : "Run Monster Batch QA"}
            </button>
            <button className="studio-button studio-qa-run-button" type="button" disabled={isRunning || !report} onClick={copyMarkdown}>
              <StudioIcon name="fa-copy" />
              {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy Failed" : "Copy Markdown"}
            </button>
            <button className="studio-button studio-qa-run-button" type="button" disabled={isRunning} onClick={savePreset}>
              <StudioIcon name="fa-bookmark" />
              Save Preset
            </button>
          </div>
        </section>

        <section className={`studio-panel ${getQaToneClass("studio-panel--qa-results", qaResultTone)}`.trim()}>
          <header className="studio-panel__header">
            <div>
              <span><StudioIcon name="fa-chart-simple" /> Results</span>
              <h3>{report ? `${formatNumber(generated.length)} Monsters Tested` : "No Run Yet"}</h3>
            </div>
          </header>
          <div className="studio-qa-summary-grid">
            <SummaryTile icon="fa-list-check" label="Issues" value={formatNumber(summary.total)} tone={summary.total ? "warning" : "clean"} />
            <SummaryTile icon="fa-circle-xmark" label="Errors" value={formatNumber(summary.error)} tone={summary.error ? "error" : "clean"} />
            <SummaryTile icon="fa-triangle-exclamation" label="Warnings" value={formatNumber(summary.warning)} tone={summary.warning ? "warning" : "clean"} />
            <SummaryTile icon="fa-circle-info" label="Info" value={formatNumber(summary.info)} tone="default" />
            <SummaryTile icon="fa-shield-heart" label="Publish Ready" value={formatNumber(analytics.publishReady)} tone={analytics.publishBlocked ? "warning" : "clean"} />
            <SummaryTile icon="fa-lock" label="Publish Blocked" value={formatNumber(analytics.publishBlocked)} tone={analytics.publishBlocked ? "error" : "clean"} />
            <SummaryTile icon="fa-scroll" label="Parser Passed" value={formatNumber(analytics.statBlockParserPassed)} tone={analytics.statBlockParserFailed ? "warning" : "clean"} />
            <SummaryTile icon="fa-triangle-exclamation" label="Parser Review" value={formatNumber(analytics.statBlockParserReview)} tone={analytics.statBlockParserReview ? "warning" : "clean"} />
            <SummaryTile icon="fa-shield-check" label="Complete Forge" value={formatNumber(analytics.completeGenerated)} tone={analytics.forgeIncomplete ? "warning" : "clean"} />
            <SummaryTile icon="fa-hammer" label="Forge Gaps" value={formatNumber(analytics.forgeIncomplete)} tone={analytics.forgeIncomplete ? "error" : "clean"} />
            <SummaryTile icon="fa-scale-balanced" label="Balance Runs" value={formatNumber(analytics.balanceAnalyzed)} tone="default" />
            <SummaryTile icon="fa-arrow-trend-up" label="Avg CR Δ" value={analytics.averageCrDelta ?? "—"} tone={Number(analytics.averageCrDelta || 0) > 1 ? "warning" : "default"} />
            <SummaryTile icon="fa-fire-flame-curved" label="CR +2" value={formatNumber(analytics.aboveTargetBy2)} tone={analytics.aboveTargetBy2 ? "warning" : "clean"} />
            <SummaryTile icon="fa-arrow-trend-down" label="CR -2" value={formatNumber(analytics.belowTargetBy2)} tone={analytics.belowTargetBy2 ? "warning" : "clean"} />
            <SummaryTile icon="fa-gauge-high" label="Pressure Mismatch" value={formatNumber(analytics.lowPressureMismatch)} tone={analytics.lowPressureMismatch ? "error" : "clean"} />
          </div>
          <IssueGroupList groups={report?.groupedIssues || []} statusTone={qaResultTone} />
        </section>

        <section className="studio-panel studio-panel--qa-outliers">
          <header className="studio-panel__header">
            <div>
              <span><StudioIcon name="fa-magnifying-glass-chart" /> Outliers</span>
              <h3>Generated Monsters to Review</h3>
            </div>
          </header>
          <OutlierTable generated={generated} statusTone={qaResultTone} />
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
          <span className="studio-qa-running-eyebrow">Monster Batch QA</span>
          <strong>Test running</strong>
          <p>Do not close or reload this page. Test results will be lost if the process is interrupted.</p>
          <small>{formatNumber(clampCount(count))} monsters · {QA_MODES.find((mode) => mode.id === qaMode)?.label || "QA"} · seed {seed || "—"}</small>
        </div>
      </div>
    ) : null}
    </>
  );
}
