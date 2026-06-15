import { MONSTER_GRAFTS } from "../features/monster-composer/data/monster-grafts.js";
import {
  buildGraftLedgerDownloadReport,
  buildGraftLedgerReport,
} from "../features/inspiration-studio/ledger/graft-ledger.model.js";

const report = buildGraftLedgerReport(MONSTER_GRAFTS, []);
const downloadReport = buildGraftLedgerDownloadReport(report, { viewMode: "list" });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(report.summary.total === MONSTER_GRAFTS.length, "Ledger total does not match core monster graft count.");
assert(Array.isArray(report.items), "Ledger report items must be an array.");
assert(Array.isArray(report.matrix), "Ledger report matrix must be an array.");
assert(report.buckets && Array.isArray(report.buckets.bySlot), "Ledger report must include slot buckets.");
assert(downloadReport.reportType === "cruor-monster-graft-ledger-report", "Download report type mismatch.");
assert(downloadReport.inventory.length === report.items.length, "Download inventory count mismatch.");
assert(downloadReport.inventory.every((item) => item.rawGraft), "Every downloaded inventory item must include raw graft data.");

console.log(`Graft Ledger report OK: ${report.summary.total} grafts, ${report.gaps.length} gaps.`);
