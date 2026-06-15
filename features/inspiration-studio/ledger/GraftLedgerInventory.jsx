import { StudioIcon } from "../components/StudioIcon.jsx";
import {
  formatLedgerValue,
  getLedgerIssueList,
  getLedgerIssueSeverity,
  normalizeLedgerArray,
} from "./graft-ledger.model.js";

function formatChipLabel(value) {
  return String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function GraftLedgerIssueBadge({ item }) {
  const severity = getLedgerIssueSeverity(item);
  const issues = getLedgerIssueList(item);
  const icon = severity === "error" ? "fa-circle-xmark" : severity === "warning" ? "fa-triangle-exclamation" : "fa-circle-check";

  return (
    <span className={`studio-ledger-issue-badge studio-ledger-issue-badge--${severity}`} title={issues.length ? issues.join(" · ") : "No editorial issues detected"}>
      <StudioIcon name={icon} /> {severity === "clean" ? "Clean" : `${issues.length} ${severity === "error" ? "Error" : "Warning"}${issues.length === 1 ? "" : "s"}`}
    </span>
  );
}

export function GraftLedgerMetaChips({ values = [], fallback = "—", limit = 4 }) {
  const cleanValues = normalizeLedgerArray(values);
  if (!cleanValues.length) return <span className="studio-ledger-muted">{fallback}</span>;
  return (
    <span className="studio-ledger-chip-row">
      {cleanValues.slice(0, limit).map((value) => <em key={value}>{formatChipLabel(value)}</em>)}
      {cleanValues.length > limit ? <em>+{cleanValues.length - limit}</em> : null}
    </span>
  );
}

export function GraftLedgerTable({ items = [] }) {
  return (
    <div className="studio-ledger-table-scroll">
      <table className="studio-ledger-table">
        <thead>
          <tr>
            <th>Graft</th>
            <th>Slot</th>
            <th>Economy</th>
            <th>Resolution</th>
            <th>Damage / Conditions</th>
            <th>Source / Pack</th>
            <th>Bias</th>
            <th>Cost</th>
            <th>QA</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const severity = getLedgerIssueSeverity(item);
            return (
            <tr className={`studio-ledger-row studio-ledger-row--${severity}`} key={item.id}>
              <td>
                <strong>{item.title}</strong>
                <span>{item.id}</span>
              </td>
              <td>{item.slotLabel}<span>{formatLedgerValue(item.section)}</span></td>
              <td>{formatLedgerValue(item.actionEconomy)}<span>{formatLedgerValue(item.usage)}</span></td>
              <td>{formatLedgerValue(item.resolutionType)}<span>{item.saveAbility ? `${formatLedgerValue(item.saveAbility)} save` : item.attackType ? formatLedgerValue(item.attackType) : item.targetingLabel}</span></td>
              <td>
                <GraftLedgerMetaChips values={item.damageTypes} fallback="No damage" />
                <GraftLedgerMetaChips values={item.conditions} fallback="No conditions" />
              </td>
              <td>
                <strong>{item.sourceLabel}</strong>
                <span>{item.contentPack?.title || "—"}</span>
              </td>
              <td>
                <GraftLedgerMetaChips values={[...item.typeBias, ...item.roleBias, ...item.families]} fallback="No explicit bias" />
              </td>
              <td>
                <strong>{item.cost}</strong>
                <span>Complexity {item.complexity}</span>
              </td>
              <td><GraftLedgerIssueBadge item={item} /></td>
            </tr>
            );
          })}
        </tbody>
      </table>
      {!items.length ? <div className="studio-empty-state">No matching grafts.</div> : null}
    </div>
  );
}

export function GraftLedgerGrid({ items = [] }) {
  return (
    <div className="studio-ledger-card-grid" role="list">
      {items.map((item) => (
        <article className={`studio-ledger-card studio-ledger-card--${getLedgerIssueSeverity(item)}`} key={item.id} role="listitem">
          <header>
            <span>{item.slotLabel} · {formatLedgerValue(item.actionEconomy)}</span>
            <GraftLedgerIssueBadge item={item} />
            <h4>{item.title}</h4>
            <em>{item.id}</em>
          </header>
          <dl>
            <div><dt>Resolution</dt><dd>{formatLedgerValue(item.resolutionType)}{item.saveAbility ? ` · ${formatLedgerValue(item.saveAbility)} save` : item.attackType ? ` · ${formatLedgerValue(item.attackType)}` : ""}</dd></div>
            <div><dt>Targeting</dt><dd>{item.targetingLabel}</dd></div>
            <div><dt>Damage</dt><dd><GraftLedgerMetaChips values={item.damageTypes} fallback="No damage" /></dd></div>
            <div><dt>Conditions</dt><dd><GraftLedgerMetaChips values={item.conditions} fallback="No conditions" /></dd></div>
            <div><dt>Source</dt><dd>{item.sourceLabel}</dd></div>
            <div><dt>Pack</dt><dd>{item.contentPack?.title || "—"}</dd></div>
            <div><dt>Bias</dt><dd><GraftLedgerMetaChips values={[...item.typeBias, ...item.roleBias, ...item.families]} fallback="No explicit bias" /></dd></div>
            <div><dt>Budget</dt><dd>Cost {item.cost} · Complexity {item.complexity}</dd></div>
          </dl>
        </article>
      ))}
      {!items.length ? <div className="studio-empty-state">No matching grafts.</div> : null}
    </div>
  );
}
