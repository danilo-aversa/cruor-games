import { useMemo, useState } from "react";
import { StudioIcon } from "../components/StudioIcon.jsx";
import { GraftLedgerAnalytics, GraftLedgerMatrix } from "./GraftLedgerAnalytics.jsx";
import { GraftLedgerGapPanel } from "./GraftLedgerGapPanel.jsx";
import { GraftLedgerGrid, GraftLedgerTable } from "./GraftLedgerInventory.jsx";
import { GraftLedgerToolbar } from "./GraftLedgerToolbar.jsx";
import { downloadGraftLedgerReport } from "./graft-ledger.report.js";
import { buildGraftLedgerReport, getGraftLedgerFilteredItems } from "./graft-ledger.model.js";

function PanelTitle({ eyebrow, title, icon, help, children }) {
  return (
    <div className="studio-panel__heading">
      <div className="studio-panel__title">
        <span>
          {icon ? <StudioIcon name={icon} /> : null}
          {eyebrow}
        </span>
        <h3>{title}</h3>
      </div>
      <div className="studio-panel__actions">
        {help ? <span className="studio-ledger-panel-help">{help}</span> : null}
        {children}
      </div>
    </div>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <span className="studio-stat-pill">
      <StudioIcon name={icon} />
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  );
}

export function GraftLedgerWorkspace({ libraryGrafts = [], draftGrafts = [] }) {
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [issueFilter, setIssueFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const report = useMemo(() => buildGraftLedgerReport(libraryGrafts, draftGrafts), [libraryGrafts, draftGrafts]);
  const filteredItems = useMemo(() => getGraftLedgerFilteredItems(report.items, {
    search: ledgerSearch,
    slot: slotFilter,
    action: actionFilter,
    source: sourceFilter,
    issueState: issueFilter,
  }), [actionFilter, issueFilter, ledgerSearch, report.items, slotFilter, sourceFilter]);

  function handleDownloadLedgerReport() {
    downloadGraftLedgerReport(report, {
      search: ledgerSearch,
      slot: slotFilter,
      action: actionFilter,
      source: sourceFilter,
      issueState: issueFilter,
      viewMode,
      visibleCount: filteredItems.length,
      visibleItemIds: filteredItems.map((item) => item.id),
    });
  }

  return (
    <div className="inspiration-studio__workspace inspiration-studio__workspace--graft-ledger">
      <section className="studio-panel studio-panel--graft-ledger-overview" aria-label="Monster graft ledger overview">
        <PanelTitle eyebrow="Monster Grafts" icon="fa-table-list" title="Graft Ledger" help="Global editorial inventory for Monster Composer grafts.">
          <GraftLedgerToolbar
            actionFilter={actionFilter}
            issueFilter={issueFilter}
            ledgerSearch={ledgerSearch}
            onActionFilterChange={setActionFilter}
            onDownloadReport={handleDownloadLedgerReport}
            onIssueFilterChange={setIssueFilter}
            onLedgerSearchChange={setLedgerSearch}
            onSourceFilterChange={setSourceFilter}
            onSlotFilterChange={setSlotFilter}
            onViewModeChange={setViewMode}
            report={report}
            slotFilter={slotFilter}
            sourceFilter={sourceFilter}
            viewMode={viewMode}
          />
        </PanelTitle>

        <div className="studio-ledger-summary" aria-label="Graft ledger summary">
          <StatPill icon="fa-skull" label="Total Grafts" value={report.summary.total} />
          <StatPill icon="fa-code-branch" label="Structured" value={`${report.summary.structuredRules}/${report.summary.total}`} />
          <StatPill icon="fa-shield-halved" label="Counterplay" value={`${report.summary.counterplayCoverage}/${report.summary.total}`} />
          <StatPill icon="fa-dna" label="Anatomy Fit" value={`${report.summary.anatomyCoverage}/${report.summary.total}`} />
          <StatPill icon="fa-scale-balanced" label="Avg Cost" value={report.summary.averageCost.toFixed(1)} />
          <StatPill icon="fa-gauge-high" label="Avg Complexity" value={report.summary.averageComplexity.toFixed(1)} />
        </div>
      </section>

      <section className="studio-panel studio-panel--graft-ledger-analytics" aria-label="Monster graft analytics">
        <PanelTitle eyebrow="Analytics" icon="fa-chart-simple" title="Coverage Snapshot" help="Counts are generated from the normalized graft feed plus the current draft module." />
        <GraftLedgerAnalytics report={report} />
      </section>

      <section className="studio-panel studio-panel--graft-ledger-matrix" aria-label="Slot and action economy coverage matrix">
        <PanelTitle eyebrow="Coverage Matrix" icon="fa-table-cells" title="Slot × Action Economy" help="Highlights which slot/economy combinations have content and which are still empty." />
        <GraftLedgerMatrix rows={report.matrix} />
      </section>

      <section className="studio-panel studio-panel--graft-ledger-gaps" aria-label="Graft ledger editorial gaps">
        <PanelTitle eyebrow="Editorial Gaps" icon="fa-triangle-exclamation" title="Suggested Content Targets" help="Automatic gap detection for underfilled slots, missing economies, narrow source anchors, dominant damage types, and incomplete metadata." />
        <GraftLedgerGapPanel gaps={report.gaps} />
      </section>

      <section className="studio-panel studio-panel--graft-ledger-list" aria-label="Filtered monster graft inventory">
        <PanelTitle eyebrow="Inventory" icon={viewMode === "grid" ? "fa-border-all" : "fa-list"} title={`${filteredItems.length} Visible Grafts`} help="Filtered inventory of every graft, including slot, rules, source, pack, creature bias, cost, complexity, and editorial issue state." />
        {viewMode === "grid" ? <GraftLedgerGrid items={filteredItems} /> : <GraftLedgerTable items={filteredItems} />}
      </section>
    </div>
  );
}
