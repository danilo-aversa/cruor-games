import { StudioIcon } from "../components/StudioIcon.jsx";
import { GRAFT_LEDGER_ACTION_ORDER, getLedgerTopBuckets } from "./graft-ledger.model.js";

export function GraftLedgerAnalytics({ report }) {
  return (
    <div className="studio-ledger-analytics-grid">
      <GraftLedgerBucket title="By Slot" icon="fa-puzzle-piece" rows={report.buckets.bySlot} />
      <GraftLedgerBucket title="By Economy" icon="fa-bolt" rows={report.buckets.byAction} />
      <GraftLedgerBucket title="By Resolution" icon="fa-dice-d20" rows={report.buckets.byResolution} />
      <GraftLedgerBucket title="By Damage" icon="fa-burst" rows={report.buckets.byDamageType} emptyLabel="No damage types" />
      <GraftLedgerBucket title="By Condition" icon="fa-eye-slash" rows={report.buckets.byCondition} emptyLabel="No conditions" />
      <GraftLedgerBucket title="By Source" icon="fa-book-skull" rows={report.buckets.bySource} />
      <GraftLedgerBucket title="By Creature Type" icon="fa-skull-crossbones" rows={report.buckets.byType} emptyLabel="No explicit type bias" />
      <GraftLedgerBucket title="By Role" icon="fa-chess-rook" rows={report.buckets.byRole} emptyLabel="No role bias" />
      <GraftLedgerBucket title="By Family" icon="fa-dna" rows={report.buckets.byFamily} emptyLabel="No family constraints" />
      <GraftLedgerBucket title="By Complexity" icon="fa-gauge-high" rows={report.buckets.byComplexity} />
    </div>
  );
}

export function GraftLedgerBucket({ title, icon, rows = [], emptyLabel = "No entries" }) {
  const positiveRows = getLedgerTopBuckets(rows);
  const maxCount = Math.max(1, ...positiveRows.map((row) => row.count));

  return (
    <article className="studio-ledger-bucket">
      <header><StudioIcon name={icon} /> <strong>{title}</strong></header>
      <div className="studio-ledger-bucket__rows">
        {positiveRows.map((row) => (
          <div className="studio-ledger-bucket__row" key={row.id}>
            <span>{row.label}</span>
            <div><em style={{ width: `${Math.max(6, (row.count / maxCount) * 100)}%` }} /></div>
            <strong>{row.count}</strong>
          </div>
        ))}
        {!positiveRows.length ? <p>{emptyLabel}</p> : null}
      </div>
    </article>
  );
}

export function GraftLedgerMatrix({ rows = [] }) {
  const columns = GRAFT_LEDGER_ACTION_ORDER.map((id) => ({
    id,
    label: String(id || "")
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (match) => match.toUpperCase()),
  }));

  return (
    <div className="studio-ledger-matrix-scroll">
      <table className="studio-ledger-matrix-table">
        <thead>
          <tr>
            <th>Slot</th>
            {columns.map((column) => <th key={column.id}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th>{row.label}</th>
              {columns.map((column) => {
                const cell = row.columns.find((entry) => entry.id === column.id);
                return <td key={column.id} data-has-content={cell?.count ? "true" : "false"}>{cell?.count || "—"}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
