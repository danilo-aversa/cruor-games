import { StudioIcon } from "../components/StudioIcon.jsx";
import { GRAFT_LEDGER_ACTION_ORDER, getLedgerTopBuckets } from "./graft-ledger.model.js";

export function GraftLedgerToolbar({
  actionFilter,
  issueFilter,
  ledgerSearch,
  onActionFilterChange,
  onDownloadReport,
  onIssueFilterChange,
  onLedgerSearchChange,
  onSourceFilterChange,
  onSlotFilterChange,
  onViewModeChange,
  report,
  slotFilter,
  sourceFilter,
  viewMode,
}) {
  const slotOptions = report.buckets.bySlot.filter((row) => row.count > 0 || row.id !== "unassigned");
  const actionOptions = report.buckets.byAction.filter((row) => row.count > 0 || GRAFT_LEDGER_ACTION_ORDER.includes(row.id));
  const sourceOptions = getLedgerTopBuckets(report.buckets.bySource, 40);

  return (
    <>
      <div className="studio-ledger-actions">
        <button className="studio-ledger-download-report" type="button" onClick={onDownloadReport}>
          <StudioIcon name="fa-file-arrow-down" /> Download Report
        </button>
        <div className="studio-ledger-view-toggle" role="tablist" aria-label="Graft ledger view mode">
          <button type="button" aria-pressed={viewMode === "list"} onClick={() => onViewModeChange("list")}><StudioIcon name="fa-list" /> List</button>
          <button type="button" aria-pressed={viewMode === "grid"} onClick={() => onViewModeChange("grid")}><StudioIcon name="fa-border-all" /> Grid</button>
        </div>
      </div>

      <div className="studio-ledger-filters" aria-label="Graft ledger filters">
        <label className="studio-search-field studio-search-field--ledger">
          <StudioIcon name="fa-magnifying-glass" />
          <input value={ledgerSearch} onChange={(event) => onLedgerSearchChange(event.target.value)} placeholder="Search grafts, sources, rules, tags…" />
        </label>
        <label>
          <span>Slot</span>
          <select value={slotFilter} onChange={(event) => onSlotFilterChange(event.target.value)}>
            <option value="all">All Slots</option>
            {slotOptions.map((row) => <option key={row.id} value={row.id}>{row.label} ({row.count})</option>)}
          </select>
        </label>
        <label>
          <span>Economy</span>
          <select value={actionFilter} onChange={(event) => onActionFilterChange(event.target.value)}>
            <option value="all">All Economies</option>
            {actionOptions.map((row) => <option key={row.id} value={row.id}>{row.label} ({row.count})</option>)}
          </select>
        </label>
        <label>
          <span>Source</span>
          <select value={sourceFilter} onChange={(event) => onSourceFilterChange(event.target.value)}>
            <option value="all">All Sources</option>
            {sourceOptions.map((row) => <option key={row.id} value={row.id}>{row.label} ({row.count})</option>)}
          </select>
        </label>
        <label>
          <span>Issues</span>
          <select value={issueFilter} onChange={(event) => onIssueFilterChange(event.target.value)}>
            <option value="all">All States</option>
            <option value="clean">Clean ({report.summary.clean})</option>
            <option value="warning">Warnings ({report.summary.warning})</option>
            <option value="error">Errors ({report.summary.error})</option>
          </select>
        </label>
      </div>
    </>
  );
}
