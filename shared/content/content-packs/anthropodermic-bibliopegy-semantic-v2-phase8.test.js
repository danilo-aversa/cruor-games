import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildStudioSemanticCoverage } from "../../../features/inspiration-studio/model/studio-semantic-coverage.js";
import { runDarkPlacesSemanticSampleQa } from "../../../features/inspiration-studio/qa/dark-places-semantic-sample-qa.js";
import { MONSTER_GRAFTS } from "../../../features/monster-composer/data/monster-grafts.js";
import { validateContentPackV0_2 } from "../contracts/semantic/index.js";
import {
  ANTHROPODERMIC_BIBLIOPEGY_LOCATION_COMPONENTS,
  ANTHROPODERMIC_BIBLIOPEGY_LOCATION_REGION_COMPONENTS,
} from "../inspiration-modules/anthropodermic-bibliopegy.js";
import { CRUOR_INSPIRATION_MODULES } from "../inspiration-modules.js";
import { getInspirationV2MigrationRecord } from "../migrations/inspiration-v2-migration-registry.js";
import { STATIC_CONTENT_REGISTRY } from "../static-registry.js";
import { ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE, ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_PACK } from "./anthropodermic-bibliopegy-semantic-v2-pack.js";

function referencesSource(graft = {}) {
  return (graft.sourceAnchors?.length ? graft.sourceAnchors : [graft.source])
    .filter(Boolean)
    .includes("anthropodermic-bibliopegy");
}

describe("Phase 8 batch 13 — Anthropodermic Bibliopegy approved Candidate 1", () => {
  it("owns only Archive and Dark Places while Monster parity remains external", () => {
    const source = readFileSync(
      resolve(process.cwd(), "shared/content/content-packs/anthropodermic-bibliopegy-semantic-v2-pack.js"),
      "utf8",
    );
    expect(source).not.toMatch(/MONSTER_GRAFTS/);
    expect(source).not.toMatch(/semanticType:\s*"monster-graft"/);
    expect(ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE.capabilities).toEqual(["dark-places", "inspiration-archive"]);
    expect(ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE.components.filter((entry) => entry.semanticType === "monster-graft")).toEqual([]);
    expect(MONSTER_GRAFTS.filter(referencesSource)).toHaveLength(0);
  });

  it("keeps approved Candidate 1 in the semantic catalog without changing production", () => {
    const module = CRUOR_INSPIRATION_MODULES.find((entry) => entry.id === "anthropodermic-bibliopegy");
    expect(module).toBe(ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE);
    expect(module.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(module.status).toBe("in-review");
    expect(validateContentPackV0_2(ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_PACK)).toEqual([]);
    expect(STATIC_CONTENT_REGISTRY.getInspirations({ workflow: "inspiration-archive" })).toHaveLength(14);
    expect(STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "anthropodermic-bibliopegy" })).toHaveLength(14);
  });

  it("records editorial approval and zero-diagnostic sample QA", () => {
    const records = [
      ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE,
      ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE.inspiration,
      ...ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE.components,
    ];
    records.forEach((record) =>
      expect(record.provenance.migration).toMatchObject({
        method: "editorially-migrated",
        editorialDecision: "approved",
        reviewVersion: "phase8-anthropodermic-bibliopegy-editorial-approved-v1",
      }),
    );
    expect(getInspirationV2MigrationRecord("anthropodermic-bibliopegy")).toMatchObject({
      migrationStatus: "complete",
      editorialStatus: "approved",
      semanticCoverageStatus: "complete",
      sampleQaStatus: "passed-zero-diagnostics",
      ownedSemanticCapabilities: ["inspiration-archive", "dark-places"],
      modernCapabilityLinks: [],
      blockingIssues: ["image-provenance-required"],
      candidate: {
        reviewVersion: "phase8-anthropodermic-bibliopegy-editorial-approved-v1",
        ownershipModel: "archive-dark-places-only",
      },
    });
  });

  it("keeps the source boundary explicit", () => {
    const notes = ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE.sourceAnchor.editorialNotes.join(" ");
    const cautions = ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE.inspiration.editorial.cautions.join(" ");
    expect(notes.toLowerCase()).toContain("consent");
    expect(notes).toContain("Cruor fiction");
    expect(cautions.length).toBeGreaterThan(120);
  });

  it("accounts for every Archive and Dark Places legacy id exactly once", () => {
    const legacyIds = [
      ...ANTHROPODERMIC_BIBLIOPEGY_LOCATION_COMPONENTS,
      ...ANTHROPODERMIC_BIBLIOPEGY_LOCATION_REGION_COMPONENTS,
    ].map((component) => component.id);
    const migratedIds = ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE.components.flatMap(
      (component) => component.provenance.legacyIds,
    );
    expect(legacyIds.length).toBeGreaterThan(0);
    expect(new Set(legacyIds).size).toBe(legacyIds.length);
    expect(migratedIds).toHaveLength(legacyIds.length);
    expect(new Set(migratedIds).size).toBe(legacyIds.length);
    expect([...migratedIds].sort()).toEqual([...legacyIds].sort());
  });

  it("provides complete Dark Places semantic coverage", () => {
    const coverage = buildStudioSemanticCoverage(ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE);
    expect(coverage.ready).toBe(true);
    expect(coverage.summary).toMatchObject({ required: 7, covered: 7, partial: 0, missing: 0 });
  });

  it("compiles deterministic samples with zero diagnostics", () => {
    const report = runDarkPlacesSemanticSampleQa({
      pack: ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_PACK,
      module: ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE,
    });
    expect(report.passed).toBe(true);
    expect(report.summary).toMatchObject({
      total: 3,
      passed: 3,
      failed: 0,
      error: 0,
      warning: 0,
      determinismFailures: 0,
    });
  }, 15000);
});
