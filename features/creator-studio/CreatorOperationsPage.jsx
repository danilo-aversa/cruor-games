import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  loadInspirationModules,
} from "../../shared/content/content.index.js";
import {
  STATIC_CONTENT_PACKS,
  STATIC_CONTENT_PACK_ISSUES,
  STATIC_CONTENT_REGISTRY_DATA,
} from "../../shared/content/static-registry.js";
import { ALL_MONSTER_GRAFTS } from "../monster-composer/data/monster-content-pack-feed.js";
import {
  getModuleComponentGroups,
  normalizeModuleForDraft,
} from "../inspiration-studio/model/studio-draft.js";
import {
  buildContentPackExport,
  buildModuleExport,
} from "../inspiration-studio/model/studio-export.js";
import { buildContentHealthReport } from "../inspiration-studio/health/content-health.model.js";
import { buildContentCoverageReport } from "../inspiration-studio/coverage/content-coverage.model.js";
import {
  STUDIO_TEST_IDS,
  deleteStudioTestPreset,
  getStudioTestIcon,
  getStudioTestLabel,
  readStudioTestPresets,
  saveStudioTestPreset,
} from "../inspiration-studio/qa/studio-test-presets.js";
import { downloadStudioAuditBundle } from "../inspiration-studio/reports/studio-audit-bundle.report.js";
import { buildGraftLedgerReport } from "../inspiration-studio/ledger/graft-ledger.model.js";
import {
  StudioButton,
  StudioField,
  StudioIcon,
  StudioPanelTitle,
  StudioSelect,
  StudioStatusBadge,
} from "../inspiration-studio/ui/index.js";

const ContentHealthWorkspace = lazy(() =>
  import("../inspiration-studio/health/ContentHealthModal.jsx").then((module) => ({
    default: module.ContentHealthModal,
  })),
);
const CoverageMatrixWorkspace = lazy(() =>
  import("../inspiration-studio/coverage/CoverageMatrixModal.jsx").then((module) => ({
    default: module.CoverageMatrixModal,
  })),
);
const GraftLedgerWorkspace = lazy(() =>
  import("../inspiration-studio/ledger/GraftLedgerModal.jsx").then((module) => ({
    default: module.GraftLedgerModal,
  })),
);
const MonsterBatchQaWorkspace = lazy(() =>
  import("../inspiration-studio/qa/MonsterBatchQaModal.jsx").then((module) => ({
    default: module.MonsterBatchQaModal,
  })),
);
const MonsterPerGraftQaWorkspace = lazy(() =>
  import("../inspiration-studio/qa/MonsterPerGraftQaModal.jsx").then((module) => ({
    default: module.MonsterPerGraftQaModal,
  })),
);
const MapBatchQaWorkspace = lazy(() =>
  import("../inspiration-studio/qa/MapBatchQaModal.jsx").then((module) => ({
    default: module.MapBatchQaModal,
  })),
);
const DarkPlacesSemanticQaWorkspace = lazy(() =>
  import("../inspiration-studio/qa/DarkPlacesSemanticQaModal.jsx").then((module) => ({
    default: module.DarkPlacesSemanticQaModal,
  })),
);

const OPERATIONS_SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    description: "System status",
    icon: "fa-gauge-high",
  },
  {
    id: "health",
    label: "Content Health",
    description: "Issues and readiness",
    icon: "fa-heart-pulse",
  },
  {
    id: "coverage",
    label: "Coverage Matrix",
    description: "Distribution and gaps",
    icon: "fa-table-cells-large",
  },
  {
    id: "ledger",
    label: "Graft Ledger",
    description: "Inventory and analytics",
    icon: "fa-table-list",
  },
  {
    id: "semantic-qa",
    label: "Semantic QA",
    description: "Dark Places samples",
    icon: "fa-wand-magic-sparkles",
  },
  {
    id: "monster-batch",
    label: "Monster Batch QA",
    description: "Generated monster suite",
    icon: "fa-dragon",
  },
  {
    id: "monster-per-graft",
    label: "Per-Graft QA",
    description: "Every graft through export",
    icon: "fa-vials",
  },
  {
    id: "map-batch",
    label: "Map Batch QA",
    description: "Generated map suite",
    icon: "fa-map-location-dot",
  },
];

const TOOL_ID_BY_TEST_ID = Object.freeze({
  [STUDIO_TEST_IDS.monsterBatch]: "monster-batch",
  [STUDIO_TEST_IDS.monsterPerGraft]: "monster-per-graft",
  [STUDIO_TEST_IDS.mapBatch]: "map-batch",
});

const OPERATIONS_INDEX_SIZE_KEY = "cruor-operations-tool-index-size";
const OPERATIONS_INDEX_MIN_SIZE = 240;
const OPERATIONS_INDEX_MAX_SIZE = 420;

function clampOperationsIndexSize(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return OPERATIONS_INDEX_MIN_SIZE;
  return Math.max(
    OPERATIONS_INDEX_MIN_SIZE,
    Math.min(OPERATIONS_INDEX_MAX_SIZE, Math.round(numericValue)),
  );
}

function readStoredOperationsIndexSize() {
  if (typeof window === "undefined") return 280;
  const storedValue = window.localStorage?.getItem(OPERATIONS_INDEX_SIZE_KEY);
  return storedValue ? clampOperationsIndexSize(storedValue) : 280;
}

function writeStoredOperationsIndexSize(value) {
  if (typeof window === "undefined") return;
  window.localStorage?.setItem(
    OPERATIONS_INDEX_SIZE_KEY,
    String(clampOperationsIndexSize(value)),
  );
}

function getOperationsIssueStatus(severity = "warning") {
  if (severity === "error") return "danger";
  if (severity === "info") return "info";
  return "warning";
}

function getOperationsIssueIcon(severity = "warning") {
  if (severity === "error") return "fa-circle-xmark";
  if (severity === "info") return "fa-circle-info";
  return "fa-triangle-exclamation";
}

function OperationsLoading({ label = "Loading Operations" }) {
  return (
    <section className="studio-panel cruor-ui-panel-surface creator-operations__loading" role="status" aria-live="polite">
      <StudioPanelTitle eyebrow="Creator Operations" icon="fa-screwdriver-wrench" title={label} />
      <div className="creator-studio__loading-bar" aria-hidden="true"><span /></div>
    </section>
  );
}

function OperationsNav({
  activeTool,
  collapsed,
  onCollapse,
  onExpand,
  onResizeStart,
  onSelect,
}) {
  return (
    <aside
      className={`studio-library-panel ${collapsed ? "is-collapsed" : ""}`.trim()}
      aria-label="Operations tool index"
      aria-expanded={!collapsed}
      role={collapsed ? "button" : undefined}
      tabIndex={collapsed ? 0 : undefined}
      onClick={collapsed ? onExpand : undefined}
      onKeyDown={collapsed ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onExpand();
        }
      } : undefined}
    >
      <div className="studio-library-panel__topline">
        <span className="studio-library-panel__title">
          <StudioIcon name="fa-screwdriver-wrench" />
          <span>Tool Index</span>
        </span>
        {!collapsed ? (
          <button
            className="studio-library-panel__collapse"
            type="button"
            aria-label="Collapse Operations tool index"
            title="Collapse Operations tool index"
            onClick={onCollapse}
          >
            <StudioIcon name="fa-chevron-left" />
          </button>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="studio-library-list" role="list" aria-label="Operations tools">
          {OPERATIONS_SECTIONS.map((section) => (
            <button
              className={activeTool === section.id ? "is-active" : ""}
              key={section.id}
              type="button"
              aria-current={activeTool === section.id ? "page" : undefined}
              onClick={() => onSelect(section.id)}
            >
              <span className="studio-list-button__topline">
                <strong>{section.label}</strong>
                <em aria-hidden="true"><StudioIcon name={section.icon} /></em>
              </span>
              <span>{section.description}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="studio-library-panel__collapsed" aria-hidden="true">
          <StudioIcon name="fa-screwdriver-wrench" />
          <span>{OPERATIONS_SECTIONS.length}</span>
        </div>
      )}

      {collapsed ? (
        <span className="studio-collapsed-rail-label" aria-hidden="true">Tool Index</span>
      ) : null}

      {!collapsed ? (
        <button
          type="button"
          className="studio-sidebar-resize-handle studio-sidebar-resize-handle--library"
          aria-label="Resize Operations tool index"
          title="Resize Operations tool index"
          onMouseDown={onResizeStart}
        />
      ) : null}
    </aside>
  );
}

function OperationsDashboard({
  coverageReport,
  graftCount,
  healthReport,
  modules,
  onDeletePreset,
  onDownloadAudit,
  onRunPreset,
  presets,
}) {
  const issues = healthReport?.summary?.issues || {};
  const gaps = coverageReport?.gaps || [];
  const attentionItems = [
    ...(healthReport?.issues || []).slice(0, 4),
    ...gaps.slice(0, 3).map((gap) => ({
      ...gap,
      message: gap.detail,
      suggestedFix: "Open Coverage Matrix to inspect the affected dimension.",
    })),
  ].slice(0, 6);
  const status = Number(issues.error || 0) > 0
    ? "danger"
    : Number(issues.warning || 0) > 0
      ? "warning"
      : "success";

  return (
    <div className="creator-operations__dashboard">
      <section className="studio-panel cruor-ui-panel-surface">
        <StudioPanelTitle
          eyebrow="Operations Overview"
          help="Global health, coverage, inventory, QA and audit status for the complete Cruor content system."
          icon="fa-gauge-high"
          title="Content System Status"
        >
          <StudioStatusBadge status={status}>
            {Number(issues.error || 0) > 0 ? `${issues.error} errors` : "Operational"}
          </StudioStatusBadge>
        </StudioPanelTitle>
        <section className="creator-studio-home__insight-grid" aria-label="Operations summary">
          <article className="cruor-ui-card-surface">
            <strong>{modules.length}</strong><span>Modules</span>
          </article>
          <article className="cruor-ui-card-surface">
            <strong>{healthReport?.summary?.components || 0}</strong><span>Components</span>
          </article>
          <article className="cruor-ui-card-surface">
            <strong>{graftCount}</strong><span>Monster Grafts</span>
          </article>
          <article className="cruor-ui-card-surface">
            <strong>{issues.error || 0}</strong><span>Errors</span>
          </article>
          <article className="cruor-ui-card-surface">
            <strong>{issues.warning || 0}</strong><span>Warnings</span>
          </article>
          <article className="cruor-ui-card-surface">
            <strong>{gaps.length}</strong><span>Coverage Gaps</span>
          </article>
        </section>
      </section>

      <section className="studio-panel cruor-ui-panel-surface">
        <StudioPanelTitle eyebrow="Priority" icon="fa-triangle-exclamation" title="Attention Required">
          <StudioButton icon="fa-file-arrow-down" onClick={onDownloadAudit}>Download Audit Bundle</StudioButton>
        </StudioPanelTitle>
        <div className="creator-studio-home__work-list">
          {attentionItems.length ? attentionItems.map((issue, index) => {
            const severity = issue.severity || "warning";
            const message = issue.message || issue.detail || "Review this content issue.";
            return (
              <article
                className={`creator-studio-home__work-item cruor-ui-card-surface is-${severity}`}
                key={`${issue.id || issue.title}-${index}`}
              >
                <span className="creator-studio-home__work-icon" aria-hidden="true">
                  <StudioIcon name={getOperationsIssueIcon(severity)} />
                </span>
                <span className="creator-studio-home__work-copy">
                  <strong>{issue.title || issue.id || "Content issue"}</strong>
                  <small>{issue.area || "Content"} · {message}</small>
                </span>
                <StudioStatusBadge status={getOperationsIssueStatus(severity)}>
                  {severity}
                </StudioStatusBadge>
              </article>
            );
          }) : <p className="studio-tool-empty">No global issues require attention.</p>}
        </div>
      </section>

      <section className="studio-panel cruor-ui-panel-surface">
        <StudioPanelTitle eyebrow="QA Presets" icon="fa-bookmark" title="Saved Test Runs">
          <StudioStatusBadge status="neutral">{presets.length}</StudioStatusBadge>
        </StudioPanelTitle>
        {presets.length ? (
          <div className="studio-tool-grid studio-tool-grid--two">
            {presets.map((preset) => (
              <article className="creator-operations__preset-card cruor-ui-card-surface" key={preset.id}>
                <button
                  className="creator-operations__preset-run"
                  type="button"
                  aria-label={`Run preset ${preset.name}`}
                  onClick={() => onRunPreset(preset)}
                >
                  <span className="creator-studio-home__work-icon" aria-hidden="true">
                    <StudioIcon name={getStudioTestIcon(preset.testId)} />
                  </span>
                  <span className="creator-studio-home__work-copy">
                    <strong>{preset.name}</strong>
                    <small>{getStudioTestLabel(preset.testId)}</small>
                  </span>
                  {preset.locked ? (
                    <StudioStatusBadge status="neutral" icon="fa-lock">Official</StudioStatusBadge>
                  ) : null}
                </button>
                {!preset.locked ? (
                  <button
                    className="cruor-square-icon-button"
                    type="button"
                    aria-label={`Delete preset ${preset.name}`}
                    title={`Delete preset ${preset.name}`}
                    onClick={() => onDeletePreset(preset.id)}
                  >
                    <StudioIcon name="fa-trash-can" />
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        ) : <p className="studio-tool-empty">No saved QA presets.</p>}
      </section>
    </div>
  );
}

export default function CreatorOperationsPage() {
  const [modules, setModules] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTool, setActiveTool] = useState("overview");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [testPresets, setTestPresets] = useState(() => readStudioTestPresets());
  const [pendingTestPresetRun, setPendingTestPresetRun] = useState(null);
  const [toolIndexCollapsed, setToolIndexCollapsed] = useState(false);
  const [toolIndexSize, setToolIndexSize] = useState(readStoredOperationsIndexSize);

  useEffect(() => {
    let cancelled = false;

    async function loadOperationsData() {
      try {
        const loadedModules = await loadInspirationModules();
        if (cancelled) return;
        const normalizedModules = (Array.isArray(loadedModules) ? loadedModules : [])
          .map(normalizeModuleForDraft);
        setModules(normalizedModules);
        setSelectedModuleId(normalizedModules[0]?.id || "");
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : String(error));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOperationsData();
    return () => { cancelled = true; };
  }, []);

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedModuleId) || modules[0] || null,
    [modules, selectedModuleId],
  );
  const selectedModuleExport = useMemo(
    () => selectedModule ? buildModuleExport(selectedModule) : null,
    [selectedModule],
  );
  const selectedPackExport = useMemo(
    () => selectedModule ? buildContentPackExport(selectedModule) : null,
    [selectedModule],
  );
  const draftGrafts = useMemo(
    () => modules.flatMap((module) => getModuleComponentGroups(module)["monster-graft"] || []),
    [modules],
  );
  const graftReport = useMemo(
    () => buildGraftLedgerReport(ALL_MONSTER_GRAFTS, draftGrafts),
    [draftGrafts],
  );
  const healthReport = useMemo(
    () => buildContentHealthReport({
      contentPacks: STATIC_CONTENT_PACKS,
      registryData: STATIC_CONTENT_REGISTRY_DATA,
      staticIssues: STATIC_CONTENT_PACK_ISSUES,
      modules,
    }),
    [modules],
  );
  const coverageReport = useMemo(
    () => buildContentCoverageReport({
      registryData: STATIC_CONTENT_REGISTRY_DATA,
      modules,
      nativeMonsterGrafts: ALL_MONSTER_GRAFTS,
    }),
    [modules],
  );

  function handleSaveTestPreset(presetDefinition) {
    const savedPreset = saveStudioTestPreset(presetDefinition);
    setTestPresets(readStudioTestPresets());
    return savedPreset;
  }

  function handleDeleteTestPreset(presetId) {
    deleteStudioTestPreset(presetId);
    setTestPresets(readStudioTestPresets());
  }

  function handleRunTestPreset(preset) {
    const toolId = TOOL_ID_BY_TEST_ID[preset?.testId];
    if (!toolId) return;
    setPendingTestPresetRun({ ...preset, runToken: `${preset.id}:${Date.now()}` });
    setActiveTool(toolId);
  }

  function downloadAuditBundle() {
    if (!selectedModule) return;
    downloadStudioAuditBundle({
      draft: selectedModule,
      imagePreviewUrl: "",
      modules,
      libraryGrafts: ALL_MONSTER_GRAFTS,
    });
  }

  function beginToolIndexResize(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startSize = toolIndexSize;

    function handlePointerMove(moveEvent) {
      const nextSize = clampOperationsIndexSize(
        startSize + moveEvent.clientX - startX,
      );
      setToolIndexSize(nextSize);
      writeStoredOperationsIndexSize(nextSize);
    }

    function handlePointerUp() {
      document.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("mouseup", handlePointerUp);
      document.body.classList.remove("is-resizing-studio-rail");
    }

    document.body.classList.add("is-resizing-studio-rail");
    document.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("mouseup", handlePointerUp);
  }

  const moduleOptions = modules.map((module) => [module.id, module.title || module.id]);
  const toolFallback = <OperationsLoading label="Loading Operation" />;

  function renderActiveTool() {
    if (activeTool === "health") {
      return <ContentHealthWorkspace isOpen mode="workspace" modules={modules} />;
    }
    if (activeTool === "coverage") {
      return <CoverageMatrixWorkspace isOpen mode="workspace" modules={modules} />;
    }
    if (activeTool === "ledger") {
      return <GraftLedgerWorkspace isOpen mode="workspace" draftGrafts={draftGrafts} libraryGrafts={ALL_MONSTER_GRAFTS} />;
    }
    if (activeTool === "semantic-qa") {
      return (
        <div className="creator-operations__semantic-workspace">
          <section className="studio-panel cruor-ui-panel-surface">
            <StudioField label="Inspiration Module" icon="fa-book-skull" hint="Choose the module compiled by the deterministic Dark Places semantic QA suite.">
              <StudioSelect options={moduleOptions} value={selectedModule?.id || ""} onChange={setSelectedModuleId} />
            </StudioField>
          </section>
          {selectedModuleExport && selectedPackExport ? (
            <DarkPlacesSemanticQaWorkspace isOpen mode="workspace" module={selectedModuleExport} pack={selectedPackExport} />
          ) : null}
        </div>
      );
    }
    if (activeTool === "monster-batch") {
      return <MonsterBatchQaWorkspace isOpen mode="workspace" presetRun={pendingTestPresetRun} onPresetRunConsumed={() => setPendingTestPresetRun(null)} onSavePreset={handleSaveTestPreset} />;
    }
    if (activeTool === "monster-per-graft") {
      return <MonsterPerGraftQaWorkspace isOpen mode="workspace" presetRun={pendingTestPresetRun} onPresetRunConsumed={() => setPendingTestPresetRun(null)} onSavePreset={handleSaveTestPreset} />;
    }
    if (activeTool === "map-batch") {
      return <MapBatchQaWorkspace isOpen mode="workspace" presetRun={pendingTestPresetRun} onPresetRunConsumed={() => setPendingTestPresetRun(null)} onSavePreset={handleSaveTestPreset} />;
    }
    return (
      <OperationsDashboard
        coverageReport={coverageReport}
        graftCount={graftReport.summary.total}
        healthReport={healthReport}
        modules={modules}
        onDeletePreset={handleDeleteTestPreset}
        onDownloadAudit={downloadAuditBundle}
        onRunPreset={handleRunTestPreset}
        presets={testPresets}
      />
    );
  }

  if (isLoading) {
    return <div className="creator-operations inspiration-studio"><OperationsLoading /></div>;
  }

  if (loadError) {
    return (
      <div className="creator-operations inspiration-studio">
        <section className="studio-panel cruor-ui-panel-surface creator-operations__loading" role="alert">
          <StudioPanelTitle eyebrow="Creator Operations" icon="fa-circle-xmark" title="Operations Could Not Load" />
          <p className="studio-tool-empty">{loadError}</p>
        </section>
      </div>
    );
  }

  return (
    <section className="creator-operations inspiration-studio" aria-label="Creator Studio Operations" data-creator-operations-ready="true">
      <div
        className={[
          "creator-operations__layout",
          "inspiration-studio__layout",
          toolIndexCollapsed ? "is-library-collapsed" : "",
        ].filter(Boolean).join(" ")}
        style={{ "--studio-expanded-library-column": `${toolIndexSize}px` }}
      >
        <OperationsNav
          activeTool={activeTool}
          collapsed={toolIndexCollapsed}
          onCollapse={() => setToolIndexCollapsed(true)}
          onExpand={() => setToolIndexCollapsed(false)}
          onResizeStart={beginToolIndexResize}
          onSelect={setActiveTool}
        />
        <main className="creator-operations__main">
          <Suspense fallback={toolFallback}>
            <div className="creator-operations__tool">{renderActiveTool()}</div>
          </Suspense>
        </main>
      </div>
    </section>
  );
}
