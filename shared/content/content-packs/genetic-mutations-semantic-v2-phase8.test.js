import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildStudioSemanticCoverage } from "../../../features/inspiration-studio/model/studio-semantic-coverage.js";
import { runDarkPlacesSemanticSampleQa } from "../../../features/inspiration-studio/qa/dark-places-semantic-sample-qa.js";
import { MONSTER_GRAFTS } from "../../../features/monster-composer/data/monster-grafts.js";
import { validateContentPackV0_2 } from "../contracts/semantic/index.js";
import { GENETIC_MUTATIONS_INSPIRATION_MODULE } from "../inspiration-modules/genetic-mutations.js";
import { CRUOR_INSPIRATION_MODULES } from "../inspiration-modules.js";
import { getInspirationV2MigrationRecord } from "../migrations/inspiration-v2-migration-registry.js";
import { STATIC_CONTENT_REGISTRY } from "../static-registry.js";
import { GENETIC_MUTATIONS_SEMANTIC_V2_MODULE, GENETIC_MUTATIONS_SEMANTIC_V2_PACK } from "./genetic-mutations-semantic-v2-pack.js";

function referencesSource(graft = {}) {
  return (graft.sourceAnchors?.length ? graft.sourceAnchors : [graft.source]).filter(Boolean).includes("genetic-mutations");
}

describe("Phase 8 batch 9 — Genetic Mutations approved", () => {
  it("owns only Archive and Dark Places with no Monster bridge or payload", () => {
    const source = readFileSync(resolve(process.cwd(), "shared/content/content-packs/genetic-mutations-semantic-v2-pack.js"), "utf8");
    expect(source).not.toMatch(/MONSTER_GRAFTS/);
    expect(source).not.toMatch(/semanticType:\s*"monster-graft"/);
    expect(GENETIC_MUTATIONS_SEMANTIC_V2_MODULE.capabilities).toEqual(["dark-places", "inspiration-archive"]);
    expect(GENETIC_MUTATIONS_SEMANTIC_V2_MODULE.components.filter((entry) => entry.semanticType === "monster-graft")).toEqual([]);
    expect(MONSTER_GRAFTS.filter(referencesSource)).toEqual([]);
  });

  it("keeps the approved module in the semantic catalog without changing production", () => {
    const module = CRUOR_INSPIRATION_MODULES.find((entry) => entry.id === "genetic-mutations");
    expect(module).toBe(GENETIC_MUTATIONS_SEMANTIC_V2_MODULE);
    expect(module.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(module.status).toBe("in-review");
    expect(validateContentPackV0_2(GENETIC_MUTATIONS_SEMANTIC_V2_PACK)).toEqual([]);
    expect(STATIC_CONTENT_REGISTRY.getInspirations({ workflow: "inspiration-archive" })).toHaveLength(14);
    expect(STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "genetic-mutations" })).toHaveLength(15);
  });

  it("records approved provenance and the remaining publication gate", () => {
    const records = [GENETIC_MUTATIONS_SEMANTIC_V2_MODULE, GENETIC_MUTATIONS_SEMANTIC_V2_MODULE.inspiration, ...GENETIC_MUTATIONS_SEMANTIC_V2_MODULE.components];
    records.forEach((record) => expect(record.provenance.migration).toMatchObject({
      method: "editorially-migrated", editorialDecision: "approved", reviewVersion: "phase8-genetic-mutations-editorial-approved-v1",
    }));
    expect(getInspirationV2MigrationRecord("genetic-mutations")).toMatchObject({
      migrationStatus: "complete", editorialStatus: "approved", semanticCoverageStatus: "complete", sampleQaStatus: "passed-zero-diagnostics", reviewer: "Danilo", reviewedAt: "2026-07-17",
      ownedSemanticCapabilities: ["inspiration-archive", "dark-places"], modernCapabilityLinks: [],
      blockingIssues: ["image-provenance-required"],
      candidate: { reviewVersion: "phase8-genetic-mutations-editorial-approved-v1", ownershipModel: "archive-dark-places-only" },
    });
  });

  it("keeps the source boundary explicit", () => {
    const notes = GENETIC_MUTATIONS_SEMANTIC_V2_MODULE.sourceAnchor.editorialNotes.join(" ");
    const cautions = GENETIC_MUTATIONS_SEMANTIC_V2_MODULE.inspiration.editorial.cautions.join(" ");
    expect(notes.toLowerCase()).toContain("variation");
    expect(notes).toContain("Cruor fiction");
    expect(cautions.length).toBeGreaterThan(120);
  });

  it("accounts for all 15 legacy location and region ids exactly once", () => {
    const legacyIds = GENETIC_MUTATIONS_INSPIRATION_MODULE.components.map((component) => component.id);
    const migratedIds = GENETIC_MUTATIONS_SEMANTIC_V2_MODULE.components.flatMap((component) => component.provenance.legacyIds);
    expect(legacyIds).toHaveLength(15);
    expect(new Set(legacyIds).size).toBe(15);
    expect(migratedIds).toHaveLength(15);
    expect(new Set(migratedIds).size).toBe(15);
    expect([...migratedIds].sort()).toEqual([...legacyIds].sort());
  });

  it("provides complete Dark Places semantic coverage", () => {
    const coverage = buildStudioSemanticCoverage(GENETIC_MUTATIONS_SEMANTIC_V2_MODULE);
    expect(coverage.ready).toBe(true);
    expect(coverage.summary).toMatchObject({ required: 7, covered: 7, partial: 0, missing: 0 });
  });

  it("compiles deterministic samples with zero diagnostics", () => {
    const report = runDarkPlacesSemanticSampleQa({ pack: GENETIC_MUTATIONS_SEMANTIC_V2_PACK, module: GENETIC_MUTATIONS_SEMANTIC_V2_MODULE });
    expect(report.passed).toBe(true);
    expect(report.summary).toMatchObject({ total: 3, passed: 3, failed: 0, error: 0, warning: 0, determinismFailures: 0 });
  }, 15000);
});
