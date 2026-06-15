import { buildGraftLedgerDownloadReport } from "./graft-ledger.model.js";

export function getGraftLedgerReportFilename(date = new Date()) {
  return `cruor-monster-graft-ledger-${date.toISOString().slice(0, 10)}.json`;
}

export function buildGraftLedgerReportPayload(report, filters = {}) {
  return buildGraftLedgerDownloadReport(report, filters);
}

export function downloadGraftLedgerReport(report, filters = {}) {
  const payload = buildGraftLedgerReportPayload(report, filters);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getGraftLedgerReportFilename();
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
