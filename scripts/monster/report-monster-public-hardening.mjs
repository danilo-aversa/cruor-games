import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  ALL_MONSTER_GRAFTS,
  MONSTER_CONTENT_PACK_FEED_SUMMARY,
  MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT,
} from "../../features/monster-composer/data/monster-content-pack-feed.js";
import {
  isMonsterGraftV2,
  validateMonsterGraftV2,
} from "../../features/monster-composer/model/monster-graft-v2.schema.js";
import { runMonsterBatchQa } from "../../features/monster-composer/qa/monster-batch-qa.js";
import {
  buildMonsterPerGraftQaCompactReport,
  runMonsterPerGraftCoverageQa,
} from "../../features/monster-composer/qa/monster-per-graft-qa.js";
import { runMonsterQaSuite } from "../../features/monster-composer/qa/monster-qa-suite.js";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "../..");
const OUTPUT_DIR = path.join(REPO_ROOT, "docs/terrifying-monsters/phase7");
const OUTPUT_JSON = path.join(OUTPUT_DIR, "public-hardening.generated.json");
const OUTPUT_MD = path.join(OUTPUT_DIR, "public-hardening.generated.md");
const CHECK_MODE = process.argv.includes("--check");
const STRICT_MODE = process.argv.includes("--strict");
const AUDIT_VERSION = "monster-public-hardening-v1.2-twist-reviewed";
const CR_CHECKPOINTS = Object.freeze([1, 2, 5, 8, 10, 15, 20]);

const SOURCE_PROFILES = Object.freeze([
  Object.freeze({ sourceId: "decomposition", typeId: "undead", category: "Zombie" }),
  Object.freeze({ sourceId: "jikininki", typeId: "undead", category: "Spirit" }),
  Object.freeze({ sourceId: "wolf-spiders", typeId: "beast", category: "Spider" }),
  Object.freeze({ sourceId: "wax-death-masks", typeId: "undead", category: "Spirit" }),
]);

const FRAME_PROFILES = Object.freeze([
  Object.freeze({
    id: "standard",
    roleId: "standard",
    tacticalRoleId: "brute",
    monsterTierId: "normal",
    tempoProfileId: "standard",
    dangerId: "standard",
  }),
  Object.freeze({
    id: "elite-ambusher",
    roleId: "standard",
    tacticalRoleId: "lurker",
    monsterTierId: "elite",
    tempoProfileId: "ambusher",
    dangerId: "hard",
  }),
  Object.freeze({
    id: "boss-controller",
    roleId: "boss",
    tacticalRoleId: "controller",
    monsterTierId: "boss",
    tempoProfileId: "fast",
    dangerId: "horror",
  }),
]);

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function buildPublicMatrixFrames() {
  const frames = [];
  SOURCE_PROFILES.forEach((source) => {
    CR_CHECKPOINTS.forEach((targetCr) => {
      FRAME_PROFILES.forEach((profile) => {
        frames.push({
          id: `phase7-${source.sourceId}-cr-${targetCr}-${profile.id}`,
          ...source,
          ...profile,
          targetCr,
          seed: `phase7-public-matrix:${source.sourceId}:${targetCr}:${profile.id}`,
          qaMode: "realistic",
        });
      });
    });
  });
  return frames;
}

function getDamageEntries(rules = {}) {
  const damage = rules.damage || null;
  if (!damage || damage.mode === "none") return [];
  if (Array.isArray(damage.parts) && damage.parts.length) return damage.parts.filter(Boolean);
  return [damage];
}

function hasScalableCompatibilityRoot(graft = {}) {
  const rules = graft.rules || {};
  if (String(rules.actionEconomy || graft.section || "").toLowerCase() !== "action") {
    return false;
  }
  if (rules.multiattack?.enabled) return true;
  return getDamageEntries(rules).some((damage) => {
    const mode = String(damage.mode || "").toLowerCase();
    const role = String(damage.budgetRole || "").toLowerCase();
    const scale = String(damage.scale || "standard").toLowerCase();
    const share = Number(damage.budgetShare || 0);
    if (!["mainattack", "attack", "primary"].includes(role)) return false;
    if (!["computed", "budget", "parts"].includes(mode)) return false;
    if (share >= 0.65) return true;
    return !["minor", "light"].includes(scale);
  });
}

function addCheck(checks, id, label, actual, expected, pass) {
  checks.push({ id, label, actual, expected, pass: Boolean(pass) });
}

function buildAudit() {
  const catalogReports = ALL_MONSTER_GRAFTS.map((graft) => ({
    id: graft.id,
    slot: graft.slot,
    source: graft.source,
    v2: isMonsterGraftV2(graft),
    validation: validateMonsterGraftV2(graft),
  }));
  const catalogErrors = catalogReports.flatMap((report) =>
    asArray(report.validation?.issues)
      .filter((issue) => issue.severity === "error")
      .map((issue) => ({
        id: report.id,
        code: issue.code,
        path: issue.path,
        message: issue.message,
      })),
  );
  const attackPatterns = ALL_MONSTER_GRAFTS.filter((graft) => graft.slot === "attack");
  const nonScalableCompatibilityRoots = attackPatterns
    .filter((graft) => !hasScalableCompatibilityRoot(graft))
    .map((graft) => graft.id);

  const coreReport = runMonsterQaSuite();
  const perGraftReport = buildMonsterPerGraftQaCompactReport(
    runMonsterPerGraftCoverageQa({
      seed: "phase7-public-per-graft",
      validateDebugExport: false,
      includeFullPayloads: false,
      includeReviewPayloads: false,
    }),
  );
  const matrixFrames = buildPublicMatrixFrames();
  const batchReport = runMonsterBatchQa({
    frames: matrixFrames,
    seed: "phase7-public-matrix",
    qaMode: "realistic",
    includeOptionalSlots: true,
    includeFullPayloads: false,
  });
  const batchSuite = asArray(batchReport.suites).find(
    (suite) => suite.id === "monster-batch-generation",
  );
  const batchAnalytics = batchSuite?.metrics?.analytics || {};
  const perGraftAnalytics = perGraftReport.analytics || {};
  const sourceAudit = MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT || {};
  const sourceMismatchCount = asArray(sourceAudit.sourceMismatches).length;
  const canonicalFallbackCount = asArray(sourceAudit.canonicalFallbacks).length;
  const shadowCoverageGapCount = asArray(sourceAudit.shadowCoverageGaps).length;
  const checks = [];

  addCheck(checks, "catalog-total", "Catalog contains the expected 93 grafts.", ALL_MONSTER_GRAFTS.length, 93, ALL_MONSTER_GRAFTS.length === 93);
  addCheck(checks, "catalog-v2", "Every catalog entry uses Graft v2.", catalogReports.filter((report) => report.v2).length, 93, catalogReports.every((report) => report.v2));
  addCheck(checks, "catalog-schema", "Every Graft v2 entry passes schema validation.", catalogErrors.length, 0, catalogErrors.length === 0);
  addCheck(checks, "attack-compatibility-roots", "All Attack Patterns expose a scalable compatibility root to legacy runtime gates.", nonScalableCompatibilityRoots.length, 0, nonScalableCompatibilityRoots.length === 0);

  addCheck(checks, "core-errors", "Core Monster QA has no errors.", coreReport.summary?.error || 0, 0, (coreReport.summary?.error || 0) === 0);
  addCheck(checks, "core-warnings", "Core Monster QA has no warnings.", coreReport.summary?.warning || 0, 0, (coreReport.summary?.warning || 0) === 0);

  addCheck(checks, "per-graft-total", "Forced coverage exercises every graft.", perGraftAnalytics.totalGrafts || 0, 93, perGraftAnalytics.totalGrafts === 93);
  addCheck(checks, "per-graft-passed", "Every forced graft case passes.", perGraftAnalytics.passed || 0, 93, perGraftAnalytics.passed === 93);
  addCheck(checks, "per-graft-review", "Forced graft coverage has no review-only cases.", perGraftAnalytics.review || 0, 0, (perGraftAnalytics.review || 0) === 0);
  addCheck(checks, "per-graft-failed", "Forced graft coverage has no failed cases.", perGraftAnalytics.failed || 0, 0, (perGraftAnalytics.failed || 0) === 0);
  addCheck(checks, "per-graft-rendered", "Every forced graft renders a stat-block item.", perGraftAnalytics.forcedRendered || 0, 93, perGraftAnalytics.forcedRendered === 93);
  addCheck(checks, "per-graft-parser", "Every forced graft passes the rendered stat-block parser.", perGraftAnalytics.parserPassed || 0, 93, perGraftAnalytics.parserPassed === 93);
  addCheck(checks, "per-graft-publish", "Every forced graft case is publish-ready.", perGraftAnalytics.publishReady || 0, 93, perGraftAnalytics.publishReady === 93);
  addCheck(checks, "per-graft-issues", "Forced coverage emits no issues.", perGraftReport.summary?.total || 0, 0, (perGraftReport.summary?.total || 0) === 0);

  addCheck(checks, "matrix-frames", "The public matrix covers all 84 source/CR/frame combinations.", batchAnalytics.generated || 0, matrixFrames.length, batchAnalytics.generated === matrixFrames.length);
  addCheck(checks, "matrix-complete", "Every matrix frame produces a complete build.", batchAnalytics.completeGenerated || 0, matrixFrames.length, batchAnalytics.completeGenerated === matrixFrames.length);
  addCheck(checks, "matrix-errors", "The matrix emits no errors.", batchReport.summary?.error || 0, 0, (batchReport.summary?.error || 0) === 0);
  addCheck(checks, "matrix-warnings", "The matrix emits no warnings.", batchReport.summary?.warning || 0, 0, (batchReport.summary?.warning || 0) === 0);
  addCheck(checks, "matrix-publish-ready", "Every matrix build is publish-ready.", batchAnalytics.publishReady || 0, matrixFrames.length, batchAnalytics.publishReady === matrixFrames.length);
  addCheck(checks, "matrix-blocked", "No matrix build is publish-blocked.", batchAnalytics.publishBlocked || 0, 0, (batchAnalytics.publishBlocked || 0) === 0);
  addCheck(checks, "matrix-parser", "Every matrix stat block passes parser validation.", batchAnalytics.statBlockParserPassed || 0, matrixFrames.length, batchAnalytics.statBlockParserPassed === matrixFrames.length);
  addCheck(checks, "matrix-public-payload", "Every public JSON payload is valid.", batchAnalytics.publicPayloads || 0, matrixFrames.length, batchAnalytics.publicPayloads === matrixFrames.length);
  addCheck(checks, "matrix-debug-payload", "Every debug JSON payload is valid.", batchAnalytics.debugPayloads || 0, matrixFrames.length, batchAnalytics.debugPayloads === matrixFrames.length);
  addCheck(checks, "matrix-public-debug-fields", "Public payloads contain no debug-only fields.", batchAnalytics.publicPayloadsWithDebugFields || 0, 0, (batchAnalytics.publicPayloadsWithDebugFields || 0) === 0);
  addCheck(checks, "matrix-public-legacy-text", "Public payloads contain no legacy placeholder text.", batchAnalytics.publicPayloadsWithLegacyText || 0, 0, (batchAnalytics.publicPayloadsWithLegacyText || 0) === 0);
  addCheck(checks, "matrix-debug-internals", "Debug payloads retain all required internal fields.", batchAnalytics.debugPayloadsMissingInternals || 0, 0, (batchAnalytics.debugPayloadsMissingInternals || 0) === 0);
  addCheck(checks, "matrix-scalable-fallback", "No high-CR build needs a synthetic fallback action.", batchAnalytics.scalableMainActionFallbackAdded || 0, 0, (batchAnalytics.scalableMainActionFallbackAdded || 0) === 0);
  addCheck(checks, "matrix-missing-scalable", "No high-CR build lacks a scalable main action.", batchAnalytics.missingScalableMainAction || 0, 0, (batchAnalytics.missingScalableMainAction || 0) === 0);
  addCheck(checks, "matrix-cr-high-outliers", "No matrix build finishes two or more CR above target.", batchAnalytics.aboveTargetBy2 || 0, 0, (batchAnalytics.aboveTargetBy2 || 0) === 0);
  addCheck(checks, "matrix-cr-low-outliers", "No matrix build finishes two or more CR below target.", batchAnalytics.belowTargetBy2 || 0, 0, (batchAnalytics.belowTargetBy2 || 0) === 0);
  addCheck(checks, "matrix-average-cr", "Average absolute CR drift remains within one CR.", batchAnalytics.averageCrDelta ?? null, "<= 1", Number(batchAnalytics.averageCrDelta || 0) <= 1);

  addCheck(checks, "source-count", "Source boundary exposes all 93 native and registry grafts.", `${sourceAudit.nativeGrafts || 0}/${sourceAudit.registryGrafts || 0}`, "93/93", sourceAudit.nativeGrafts === 93 && sourceAudit.registryGrafts === 93);
  addCheck(checks, "source-mismatch", "Source boundary has no source mismatches.", sourceMismatchCount, 0, sourceMismatchCount === 0);
  addCheck(checks, "source-fallback", "Source boundary uses no fallback representations.", sourceAudit.fallbacks || 0, 0, (sourceAudit.fallbacks || 0) === 0);
  addCheck(checks, "source-equivalence", "Native and registry-shadow representations are equivalent.", sourceAudit.equivalentRepresentations || 0, 93, sourceAudit.equivalentRepresentations === 93 && sourceAudit.divergentRepresentations === 0);
  addCheck(checks, "source-canonical-fallback", "No canonical source fallback is pending.", canonicalFallbackCount, 0, canonicalFallbackCount === 0);
  addCheck(checks, "source-shadow-gaps", "No registry-shadow coverage gap remains.", shadowCoverageGapCount, 0, shadowCoverageGapCount === 0);

  const failures = checks.filter((check) => !check.pass);
  return {
    version: AUDIT_VERSION,
    pass: failures.length === 0,
    summary: {
      checks: checks.length,
      passed: checks.length - failures.length,
      failed: failures.length,
      catalogGrafts: ALL_MONSTER_GRAFTS.length,
      coreQa: coreReport.summary,
      forcedGrafts: perGraftAnalytics.totalGrafts || 0,
      forcedPassed: perGraftAnalytics.passed || 0,
      matrixFrames: matrixFrames.length,
      matrixPublishReady: batchAnalytics.publishReady || 0,
      matrixNonBlockingReviews: batchAnalytics.publishReview || 0,
      averageCrDelta: batchAnalytics.averageCrDelta ?? null,
      sourceEquivalentRepresentations: sourceAudit.equivalentRepresentations || 0,
    },
    coverage: {
      crCheckpoints: [...CR_CHECKPOINTS],
      sources: SOURCE_PROFILES.map((profile) => profile.sourceId),
      frameProfiles: FRAME_PROFILES.map((profile) => profile.id),
      bySource: batchAnalytics.bySource || [],
      bySlot: perGraftAnalytics.bySlot || [],
    },
    catalog: {
      total: ALL_MONSTER_GRAFTS.length,
      v2: catalogReports.filter((report) => report.v2).length,
      attackPatterns: attackPatterns.length,
      schemaErrors: catalogErrors,
      nonScalableCompatibilityRoots,
    },
    coreQa: {
      summary: coreReport.summary,
    },
    perGraft: {
      summary: perGraftReport.summary,
      analytics: perGraftAnalytics,
    },
    matrix: {
      summary: batchReport.summary,
      analytics: batchAnalytics,
    },
    sourceBoundary: {
      feed: MONSTER_CONTENT_PACK_FEED_SUMMARY,
      audit: {
        nativeGrafts: sourceAudit.nativeGrafts,
        registryGrafts: sourceAudit.registryGrafts,
        totalGrafts: sourceAudit.totalGrafts,
        selectedNative: sourceAudit.selectedNative,
        selectedRegistry: sourceAudit.selectedRegistry,
        sourceMismatches: sourceMismatchCount,
        fallbacks: sourceAudit.fallbacks,
        equivalentRepresentations: sourceAudit.equivalentRepresentations,
        divergentRepresentations: sourceAudit.divergentRepresentations,
        canonicalFallbacks: canonicalFallbackCount,
        shadowCoverageGaps: shadowCoverageGapCount,
        byAuthorityMode: sourceAudit.byAuthorityMode,
      },
    },
    checks,
    failures,
  };
}

function renderCheckRows(checks = []) {
  return checks
    .map((check) => `| ${check.pass ? "PASS" : "FAIL"} | ${check.label} | ${String(check.actual)} | ${String(check.expected)} |`)
    .join("\n");
}

function renderCountRows(values = []) {
  return asArray(values)
    .map((entry) => `| ${entry.id} | ${entry.count} |`)
    .join("\n");
}

function renderMarkdown(audit) {
  return `# Terrifying Monsters — Phase 7 Public Hardening Audit

**Generated by:** \`scripts/monster/report-monster-public-hardening.mjs\`  
**Audit version:** \`${audit.version}\`

## Release gate

| Metric | Value |
|---|---:|
| Gate | ${audit.pass ? "PASS" : "FAIL"} |
| Checks passed | ${audit.summary.passed}/${audit.summary.checks} |
| Graft v2 catalog | ${audit.catalog.v2}/${audit.catalog.total} |
| Forced per-graft cases | ${audit.summary.forcedPassed}/${audit.summary.forcedGrafts} |
| Public matrix builds | ${audit.summary.matrixPublishReady}/${audit.summary.matrixFrames} publish-ready |
| Non-blocking matrix reviews | ${audit.summary.matrixNonBlockingReviews} |
| Average CR delta | ${audit.summary.averageCrDelta} |
| Native/registry equivalents | ${audit.summary.sourceEquivalentRepresentations}/93 |

## Coverage matrix

The deterministic matrix crosses four production Source Anchors, seven CR checkpoints, and three encounter profiles.

- CR checkpoints: ${audit.coverage.crCheckpoints.join(", ")}
- Sources: ${audit.coverage.sources.join(", ")}
- Profiles: ${audit.coverage.frameProfiles.join(", ")}

### Matrix builds by source

| Source | Builds |
|---|---:|
${renderCountRows(audit.coverage.bySource)}

### Forced coverage by slot

| Slot | Grafts |
|---|---:|
${renderCountRows(audit.coverage.bySlot)}

## Public-output guarantees

- All matrix public and debug payloads parse successfully.
- Public payloads contain no debug-only fields or legacy placeholder text.
- Debug payloads preserve the required internal evaluation data.
- Every rendered stat block passes parser validation.
- No high-CR build receives the synthetic fallback Strike.
- No final build lies two or more CR above or below its requested target.

## Source boundary

The current authority mode remains \`native-legacy\` as defined in Phase 1. That label describes which representation wins; it does not mean the graft payload is legacy. The production catalog itself is 93/93 Graft v2.

| Metric | Value |
|---|---:|
| Native grafts | ${audit.sourceBoundary.audit.nativeGrafts} |
| Registry-shadow grafts | ${audit.sourceBoundary.audit.registryGrafts} |
| Equivalent representations | ${audit.sourceBoundary.audit.equivalentRepresentations} |
| Divergent representations | ${audit.sourceBoundary.audit.divergentRepresentations} |
| Source mismatches | ${audit.sourceBoundary.audit.sourceMismatches} |
| Fallbacks | ${audit.sourceBoundary.audit.fallbacks} |

## Checks

| Status | Check | Actual | Expected |
|---|---|---:|---:|
${renderCheckRows(audit.checks)}

## Gate rule

The release gate fails if any production graft is not valid Graft v2, any forced graft cannot render and publish, any deterministic matrix build crashes or is blocked, any public/debug payload violates its boundary, any high-CR fallback is injected, CR drift exceeds the accepted tolerance, or native and registry-shadow representations diverge.
`;
}

function writeOrCheck(filePath, content) {
  if (CHECK_MODE) {
    const actual = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
    if (actual !== content) {
      console.error(`Stale or missing generated report: ${path.relative(REPO_ROOT, filePath)}`);
      return false;
    }
    return true;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Wrote ${path.relative(REPO_ROOT, filePath)}`);
  return true;
}

const audit = buildAudit();
const jsonOk = writeOrCheck(OUTPUT_JSON, stableJson(audit));
const mdOk = writeOrCheck(OUTPUT_MD, renderMarkdown(audit));
console.log(
  `Public hardening: ${audit.summary.passed}/${audit.summary.checks} checks; ` +
    `forced grafts ${audit.summary.forcedPassed}/${audit.summary.forcedGrafts}; ` +
    `matrix ${audit.summary.matrixPublishReady}/${audit.summary.matrixFrames}; ` +
    `source equivalents ${audit.summary.sourceEquivalentRepresentations}/93.`,
);
if (!jsonOk || !mdOk || (STRICT_MODE && !audit.pass)) process.exitCode = 1;
