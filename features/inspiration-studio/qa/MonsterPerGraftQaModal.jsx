import { useEffect, useState } from "react";
import { StudioToolModalShell } from "../components/StudioToolModalShell.jsx";
import { StudioIcon } from "../components/StudioIcon.jsx";
import { STUDIO_TEST_IDS } from "./studio-test-presets.js";
import {
  MONSTER_PER_GRAFT_QA_VERSION,
  buildMonsterPerGraftQaMarkdown,
  downloadMonsterPerGraftQaReport,
  runMonsterPerGraftCoverageQa,
} from "../../monster-composer/qa/monster-per-graft-qa.js";

const DEFAULT_CR_MIN = 1;
const DEFAULT_CR_MAX = 30;
const TEST_ID = STUDIO_TEST_IDS.monsterPerGraft;

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function formatNumber(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("en-US") : "0";
}

function clampCr(value, fallback) {
  const numeric = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(30, numeric));
}

function getQaResultTone(report, summary = {}, analytics = {}, runState = "idle") {
  if (runState === "error") return "error";
  if (!report) return "idle";

  const errorCount =
    Number(summary.error || 0) +
    Number(analytics.failed || 0) +
    Number(analytics.publishBlocked || 0) +
    Number(analytics.parserFailed || 0);

  if (errorCount > 0) return "error";

  const warningCount =
    Number(summary.warning || 0) +
    Number(analytics.review || 0) +
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
  const visibleGroups = asArray(groups).slice(0, 18);
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

function PerGraftTable({ cases = [], statusTone = "idle" }) {
  const visibleCases = asArray(cases)
    .filter((item) => item.status !== "pass" || item.publishStatus !== "ready" || item.parserStatus !== "pass")
    .slice(0, 36);

  if (!visibleCases.length) {
    return (
      <div className={getQaToneClass("studio-qa-empty", statusTone)}>
        <StudioIcon name="fa-shield-check" />
        <span>All forced graft cases passed cleanly.</span>
      </div>
    );
  }

  return (
    <div className="studio-qa-table-scroll">
      <table className="studio-qa-table">
        <thead>
          <tr>
            <th>Graft</th>
            <th>Slot</th>
            <th>Frame</th>
            <th>Parser</th>
            <th>Publish</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {visibleCases.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.title || item.id}</strong>
                <span>{item.id}</span>
              </td>
              <td>{item.slot || "—"}<span>{item.section || "—"}</span></td>
              <td>{item.frame?.category || "—"}<span>CR {item.targetCr ?? item.frame?.targetCr ?? "—"} · {item.frame?.roleId || "—"}</span></td>
              <td>{item.parserStatus || "—"}<span>{item.parserWarnings || 0} warnings</span></td>
              <td>{item.publishStatus || "—"}<span>{item.publishBlockerCount || 0} blockers</span></td>
              <td>{item.issueCount || 0}<span>{item.status || "—"}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizePresetParams(params = {}) {
  const crMin = clampCr(params.crMin, DEFAULT_CR_MIN);
  const crMax = clampCr(params.crMax, DEFAULT_CR_MAX);
  return {
    crMin: Math.min(crMin, crMax),
    crMax: Math.max(crMin, crMax),
    seed: String(params.seed || "cruor-per-graft-qa"),
    includeFullPayloads: Boolean(params.includeFullPayloads),
    includeReviewPayloads: params.includeReviewPayloads !== false,
  };
}

function getDefaultPresetName(params = {}) {
  return `Monster Per-Graft QA · CR ${params.crMin ?? DEFAULT_CR_MIN}–${params.crMax ?? DEFAULT_CR_MAX}`;
}

export function MonsterPerGraftQaModal({ isOpen, onClose, presetRun = null, onPresetRunConsumed, onSavePreset }) {
  const [crMin, setCrMin] = useState(DEFAULT_CR_MIN);
  const [crMax, setCrMax] = useState(DEFAULT_CR_MAX);
  const [seed, setSeed] = useState("cruor-per-graft-qa");
  const [includeFullPayloads, setIncludeFullPayloads] = useState(false);
  const [includeReviewPayloads, setIncludeReviewPayloads] = useState(true);
  const [runState, setRunState] = useState("idle");
  const [copyState, setCopyState] = useState("idle");
  const [exportState, setExportState] = useState("idle");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const isRunning = runState === "running";
  const suite = report?.suites?.find((item) => item.id === "monster-per-graft-coverage") || report?.suites?.[0];
  const cases = suite?.metrics?.cases || [];
  const analytics = suite?.metrics?.analytics || {};
  const summary = report?.summary || { total: 0, error: 0, warning: 0, info: 0 };
  const qaResultTone = getQaResultTone(report, summary, analytics, runState);

  function handleClose() {
    if (isRunning) return;
    onClose?.();
  }

  function getCurrentPresetParams() {
    return normalizePresetParams({
      crMin,
      crMax,
      seed,
      includeFullPayloads,
      includeReviewPayloads,
    });
  }

  function applyPresetParams(params = {}) {
    const normalized = normalizePresetParams(params);
    setCrMin(normalized.crMin);
    setCrMax(normalized.crMax);
    setSeed(normalized.seed);
    setIncludeFullPayloads(normalized.includeFullPayloads);
    setIncludeReviewPayloads(normalized.includeReviewPayloads);
    return normalized;
  }

  function savePreset() {
    const params = getCurrentPresetParams();
    const name = window.prompt("Preset name", getDefaultPresetName(params));
    if (!name?.trim()) return;

    onSavePreset?.({
      testId: TEST_ID,
      name: name.trim(),
      version: MONSTER_PER_GRAFT_QA_VERSION,
      params,
    });
  }

  function runQa(paramsOverride = null, { autoDownload = false } = {}) {
    const params = normalizePresetParams(paramsOverride || getCurrentPresetParams());
    setRunState("running");
    setError("");
    setCopyState("idle");
    setExportState(autoDownload ? "exporting" : "idle");

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        try {
          const result = runMonsterPerGraftCoverageQa({
            crMin: params.crMin,
            crMax: params.crMax,
            seed: params.seed,
            includeFullPayloads: params.includeFullPayloads,
            includeReviewPayloads: params.includeReviewPayloads,
          });
          setReport(result);
          setRunState("complete");

          if (autoDownload) {
            try {
              downloadMonsterPerGraftQaReport(result, { format: "json" });
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
      await navigator.clipboard.writeText(buildMonsterPerGraftQaMarkdown(report));
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
          downloadMonsterPerGraftQaReport(report, { format: "json" });
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
      <StudioIcon name={getExportButtonIcon(exportState, "fa-file-export")} /> {getExportButtonLabel(exportState, "Export JSON")}
    </button>
  );

  return (
    <>
      <StudioToolModalShell
        actions={actions}
        className="studio-monster-batch-qa-modal"
        icon="fa-vial-circle-check"
        id="studio-monster-per-graft-qa-modal"
        isOpen={isOpen}
        onClose={handleClose}
        subtitle="Force every Monster Composer graft into a minimal compatible build, render the stat block, run the parser, and check publish-critical output."
        title="Monster Per-Graft QA"
      >
        <div className="studio-qa-workspace">
          <section className="studio-panel studio-panel--qa-controls">
            <header className="studio-panel__header">
              <div>
                <span><StudioIcon name="fa-sliders" /> Test Setup</span>
                <h3>Forced Graft Coverage</h3>
              </div>
            </header>
            <div className="studio-qa-control-grid">
              <label>
                <span>Min CR</span>
                <input type="number" min="0" max="30" value={crMin} onChange={(event) => setCrMin(clampCr(event.target.value, DEFAULT_CR_MIN))} />
              </label>
              <label>
                <span>Max CR</span>
                <input type="number" min="0" max="30" value={crMax} onChange={(event) => setCrMax(clampCr(event.target.value, DEFAULT_CR_MAX))} />
              </label>
              <label>
                <span>Seed</span>
                <input value={seed} onChange={(event) => setSeed(event.target.value)} />
              </label>
            </div>
            <div className="studio-qa-option-row">
              <label className="studio-qa-check-option">
                <input type="checkbox" checked={includeReviewPayloads} onChange={(event) => setIncludeReviewPayloads(event.target.checked)} />
                <span className="studio-qa-checkbox" aria-hidden="true" />
                <span className="studio-qa-option-copy">Keep debug payloads for review cases.</span>
              </label>
              <label className="studio-qa-check-option">
                <input type="checkbox" checked={includeFullPayloads} onChange={(event) => setIncludeFullPayloads(event.target.checked)} />
                <span className="studio-qa-checkbox" aria-hidden="true" />
                <span className="studio-qa-option-copy">Keep full payloads for every graft. Use only for deep debugging.</span>
              </label>
            </div>
            {error ? (
              <div className="studio-qa-cost-warning studio-qa-cost-warning--danger">
                <StudioIcon name="fa-circle-xmark" />
                <span>{error}</span>
              </div>
            ) : null}
            <div className="studio-qa-run-row">
              <button className="studio-button studio-button--primary studio-qa-run-button" type="button" disabled={isRunning} onClick={() => runQa()}>
                <StudioIcon name={runState === "running" ? "fa-spinner" : "fa-play"} />
                {runState === "running" ? "Running…" : "Run Per-Graft QA"}
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
                <h3>{report ? `${formatNumber(cases.length)} Grafts Tested` : "No Run Yet"}</h3>
              </div>
            </header>
            <div className="studio-qa-summary-grid">
              <SummaryTile icon="fa-list-check" label="Issues" value={formatNumber(summary.total)} tone={summary.total ? "warning" : "clean"} />
              <SummaryTile icon="fa-circle-xmark" label="Errors" value={formatNumber(summary.error)} tone={summary.error ? "error" : "clean"} />
              <SummaryTile icon="fa-triangle-exclamation" label="Warnings" value={formatNumber(summary.warning)} tone={summary.warning ? "warning" : "clean"} />
              <SummaryTile icon="fa-circle-check" label="Passed" value={formatNumber(analytics.passed)} tone={analytics.failed ? "warning" : "clean"} />
              <SummaryTile icon="fa-magnifying-glass" label="Review" value={formatNumber(analytics.review)} tone={analytics.review ? "warning" : "clean"} />
              <SummaryTile icon="fa-ban" label="Failed" value={formatNumber(analytics.failed)} tone={analytics.failed ? "error" : "clean"} />
              <SummaryTile icon="fa-scroll" label="Parser Passed" value={formatNumber(analytics.parserPassed)} tone={analytics.parserFailed ? "warning" : "clean"} />
              <SummaryTile icon="fa-lock" label="Publish Blocked" value={formatNumber(analytics.publishBlocked)} tone={analytics.publishBlocked ? "error" : "clean"} />
              <SummaryTile icon="fa-dice-d20" label="Damage" value={formatNumber(analytics.damagingGrafts)} tone="default" />
              <SummaryTile icon="fa-person-rays" label="Conditions" value={formatNumber(analytics.conditionGrafts)} tone="default" />
              <SummaryTile icon="fa-bullseye" label="Areas" value={formatNumber(analytics.areaGrafts)} tone="default" />
              <SummaryTile icon="fa-repeat" label="Recharge" value={formatNumber(analytics.rechargeGrafts)} tone="default" />
            </div>
            <IssueGroupList groups={report?.groupedIssues || []} statusTone={qaResultTone} />
          </section>

          <section className="studio-panel studio-panel--qa-outliers">
            <header className="studio-panel__header">
              <div>
                <span><StudioIcon name="fa-list-ul" /> Per-Graft Cases</span>
                <h3>Cases Requiring Review</h3>
              </div>
            </header>
            <PerGraftTable cases={cases} statusTone={qaResultTone} />
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
            <span className="studio-qa-running-eyebrow">Monster Per-Graft QA</span>
            <strong>Test running</strong>
            <p>Do not close or reload this page. Test results will be lost if the process is interrupted.</p>
            <small>Forced graft coverage · CR {crMin}–{crMax} · seed {seed || "—"}</small>
          </div>
        </div>
      ) : null}
    </>
  );
}
