import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildStudioSemanticCoverage } from "../../../features/inspiration-studio/model/studio-semantic-coverage.js";
import { runDarkPlacesSemanticSampleQa } from "../../../features/inspiration-studio/qa/dark-places-semantic-sample-qa.js";
import { MONSTER_GRAFTS } from "../../../features/monster-composer/data/monster-grafts.js";
import { validateContentPackV0_2 } from "../contracts/semantic/index.js";
import { MORTUARY_TOTEMS_INSPIRATION_MODULE } from "../inspiration-modules/mortuary-totems.js";
import { CRUOR_INSPIRATION_MODULES } from "../inspiration-modules.js";
import { getInspirationV2MigrationRecord } from "../migrations/inspiration-v2-migration-registry.js";
import { STATIC_CONTENT_REGISTRY } from "../static-registry.js";
import { MORTUARY_TOTEMS_SEMANTIC_V2_MODULE, MORTUARY_TOTEMS_SEMANTIC_V2_PACK } from "./mortuary-totems-semantic-v2-pack.js";

function referencesSource(graft = {}) {
  return (graft.sourceAnchors?.length ? graft.sourceAnchors : [graft.source]).filter(Boolean).includes("mortuary-totems");
}

describe("Phase 8 batch 6 — Mortuary Totems approved Candidate 1", () => {
  it("owns only Archive and Dark Places with no Monster bridge or payload", () => {
    const source = readFileSync(resolve(process.cwd(), "shared/content/content-packs/mortuary-totems-semantic-v2-pack.js"), "utf8");
    expect(source).not.toMatch(/MONSTER_GRAFTS/);
    expect(source).not.toMatch(/semanticType:\s*"monster-graft"/);
    expect(MORTUARY_TOTEMS_SEMANTIC_V2_MODULE.capabilities).toEqual(["dark-places", "inspiration-archive"]);
    expect(MORTUARY_TOTEMS_SEMANTIC_V2_MODULE.components.filter((entry) => entry.semanticType === "monster-graft")).toEqual([]);
    expect(MONSTER_GRAFTS.filter(referencesSource)).toEqual([]);
  });

  it("adds approved Candidate 1 to the semantic catalog without changing production", () => {
    const module = CRUOR_INSPIRATION_MODULES.find((entry) => entry.id === "mortuary-totems");
    expect(module).toBe(MORTUARY_TOTEMS_SEMANTIC_V2_MODULE);
    expect(module.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(module.status).toBe("in-review");
    expect(validateContentPackV0_2(MORTUARY_TOTEMS_SEMANTIC_V2_PACK)).toEqual([]);
    expect(STATIC_CONTENT_REGISTRY.getInspirations({ workflow: "inspiration-archive" })).toHaveLength(14);
    expect(STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "mortuary-totems" })).toHaveLength(11);
  });

  it("records approval provenance and the remaining image gate", () => {
    const records = [MORTUARY_TOTEMS_SEMANTIC_V2_MODULE, MORTUARY_TOTEMS_SEMANTIC_V2_MODULE.inspiration, ...MORTUARY_TOTEMS_SEMANTIC_V2_MODULE.components];
    records.forEach((record) => expect(record.provenance.migration).toMatchObject({
      method: "editorially-migrated", editorialDecision: "approved", reviewVersion: "phase8-mortuary-totems-editorial-approved-v1",
    }));
    expect(getInspirationV2MigrationRecord("mortuary-totems")).toMatchObject({
      migrationStatus: "complete", editorialStatus: "approved", semanticCoverageStatus: "complete", sampleQaStatus: "passed-zero-diagnostics",
      ownedSemanticCapabilities: ["inspiration-archive", "dark-places"], modernCapabilityLinks: [],
      blockingIssues: ["image-provenance-required"],
      candidate: { reviewVersion: "phase8-mortuary-totems-editorial-approved-v1", ownershipModel: "archive-dark-places-only" },
    });
  });

  it("keeps the source boundary explicit", () => {
    const notes = MORTUARY_TOTEMS_SEMANTIC_V2_MODULE.sourceAnchor.editorialNotes.join(" ");
    const cautions = MORTUARY_TOTEMS_SEMANTIC_V2_MODULE.inspiration.editorial.cautions.join(" ");
    expect(notes).toContain("Tlingit");
    expect(notes).toContain("Cruor fiction");
    expect(cautions.length).toBeGreaterThan(120);
  });

  it("accounts for all 11 legacy location and region ids exactly once", () => {
    const legacyIds = MORTUARY_TOTEMS_INSPIRATION_MODULE.components.map((component) => component.id);
    const migratedIds = MORTUARY_TOTEMS_SEMANTIC_V2_MODULE.components.flatMap((component) => component.provenance.legacyIds);
    expect(legacyIds).toHaveLength(11);
    expect(new Set(legacyIds).size).toBe(11);
    expect(migratedIds).toHaveLength(11);
    expect(new Set(migratedIds).size).toBe(11);
    expect([...migratedIds].sort()).toEqual([...legacyIds].sort());
  });

  it("provides complete Dark Places semantic coverage", () => {
    const coverage = buildStudioSemanticCoverage(MORTUARY_TOTEMS_SEMANTIC_V2_MODULE);
    expect(coverage.ready).toBe(true);
    expect(coverage.summary).toMatchObject({ required: 7, covered: 7, partial: 0, missing: 0 });
  });

  it("compiles deterministic samples with zero diagnostics", () => {
    const report = runDarkPlacesSemanticSampleQa({ pack: MORTUARY_TOTEMS_SEMANTIC_V2_PACK, module: MORTUARY_TOTEMS_SEMANTIC_V2_MODULE });
    expect(report.passed).toBe(true);
    expect(report.summary).toMatchObject({ total: 3, passed: 3, failed: 0, error: 0, warning: 0, determinismFailures: 0 });
  }, 15000);
});
