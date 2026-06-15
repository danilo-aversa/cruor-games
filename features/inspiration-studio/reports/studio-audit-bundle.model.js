import { buildGraftLedgerDownloadReport, buildGraftLedgerReport } from "../ledger/graft-ledger.model.js";
import { buildContentHealthReport } from "../health/content-health.model.js";
import { buildContentCoverageReport } from "../coverage/content-coverage.model.js";
import { buildContentPackExport, buildModuleExport } from "../model/studio-export.js";
import { buildPublishReadinessReport } from "../model/studio-readiness.js";
import { validateStudioDraft } from "../model/studio-validation.js";
import { normalizeModuleForDraft } from "../model/studio-draft.js";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

export function buildStudioAuditBundle({
  draft,
  imagePreviewUrl = "",
  modules = [],
  libraryGrafts = [],
  registryData,
  contentPacks,
  staticIssues,
} = {}) {
  const normalizedDraft = normalizeModuleForDraft(draft);
  const moduleExport = buildModuleExport(normalizedDraft, imagePreviewUrl);
  const contentPackExport = buildContentPackExport(normalizedDraft, imagePreviewUrl);
  const validationReport = validateStudioDraft(normalizedDraft, contentPackExport);
  const readinessReport = buildPublishReadinessReport(normalizedDraft, validationReport, contentPackExport, moduleExport);
  const draftGrafts = asArray(normalizedDraft.components).filter((component) => component.contentType === "monster-graft");
  const ledgerReport = buildGraftLedgerReport(libraryGrafts, draftGrafts);
  const healthReport = buildContentHealthReport({ modules, registryData, contentPacks, staticIssues });
  const coverageReport = buildContentCoverageReport({ modules, registryData, nativeMonsterGrafts: libraryGrafts });

  return {
    reportType: "cruor-studio-audit-bundle",
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    intendedUse: "Upload this JSON back into ChatGPT to audit Studio readiness, global content health, coverage gaps, Monster Graft Ledger quality, and next implementation/content priorities.",
    scope: {
      currentModuleId: normalizedDraft.id,
      currentModuleTitle: normalizedDraft.title,
      modules: asArray(modules).length,
      libraryGrafts: asArray(libraryGrafts).length,
    },
    files: {
      "studio-health-report.json": healthReport,
      "coverage-report.json": coverageReport,
      "graft-ledger-report.json": buildGraftLedgerDownloadReport(ledgerReport, { viewMode: "audit-bundle" }),
      "readiness-report.json": readinessReport,
      "content-pack-export.json": contentPackExport,
      "module-export.json": moduleExport,
      "validation-issues.json": validationReport,
    },
    summary: {
      readiness: readinessReport.readiness,
      health: healthReport.summary,
      coverage: coverageReport.summary,
      ledger: ledgerReport.summary,
    },
  };
}
