import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildStudioSemanticCoverage } from "../../../features/inspiration-studio/model/studio-semantic-coverage.js";
import { runDarkPlacesSemanticSampleQa } from "../../../features/inspiration-studio/qa/dark-places-semantic-sample-qa.js";
import { MONSTER_GRAFTS } from "../../../features/monster-composer/data/monster-grafts.js";
import { validateContentPackV0_2 } from "../contracts/semantic/index.js";
import {
  WAX_DEATH_MASKS_LOCATION_COMPONENTS,
  WAX_DEATH_MASKS_LOCATION_REGION_COMPONENTS,
} from "../inspiration-modules/wax-death-masks.js";
import { CRUOR_INSPIRATION_MODULES } from "../inspiration-modules.js";
import { getInspirationV2MigrationRecord } from "../migrations/inspiration-v2-migration-registry.js";
import { STATIC_CONTENT_REGISTRY } from "../static-registry.js";
import { WAX_DEATH_MASKS_SEMANTIC_V2_MODULE, WAX_DEATH_MASKS_SEMANTIC_V2_PACK } from "./wax-death-masks-semantic-v2-pack.js";

function referencesSource(graft = {}) {
  return (graft.sourceAnchors?.length ? graft.sourceAnchors : [graft.source])
    .filter(Boolean)
    .includes("wax-death-masks");
}

describe("Phase 8 batch 12 — Wax Death Masks Candidate 1", () => {
  it("owns only Archive and Dark Places while Monster parity remains external", () => {
    const source = readFileSync(
      resolve(process.cwd(), "shared/content/content-packs/wax-death-masks-semantic-v2-pack.js"),
      "utf8",
    );
    expect(source).not.toMatch(/MONSTER_GRAFTS/);
    expect(source).not.toMatch(/semanticType:\s*"monster-graft"/);
    expect(WAX_DEATH_MASKS_SEMANTIC_V2_MODULE.capabilities).toEqual(["dark-places", "inspiration-archive"]);
    expect(WAX_DEATH_MASKS_SEMANTIC_V2_MODULE.components.filter((entry) => entry.semanticType === "monster-graft")).toEqual([]);
    expect(MONSTER_GRAFTS.filter(referencesSource)).toHaveLength(7);
  });

  it("adds Candidate 1 to the semantic catalog without changing production", () => {
    const module = CRUOR_INSPIRATION_MODULES.find((entry) => entry.id === "wax-death-masks");
    expect(module).toBe(WAX_DEATH_MASKS_SEMANTIC_V2_MODULE);
    expect(module.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(module.status).toBe("in-review");
    expect(validateContentPackV0_2(WAX_DEATH_MASKS_SEMANTIC_V2_PACK)).toEqual([]);
    expect(STATIC_CONTENT_REGISTRY.getInspirations({ workflow: "inspiration-archive" })).toHaveLength(14);
    expect(STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "wax-death-masks" })).toHaveLength(20);
  });

  it("records candidate provenance and explicit review gates", () => {
    const records = [
      WAX_DEATH_MASKS_SEMANTIC_V2_MODULE,
      WAX_DEATH_MASKS_SEMANTIC_V2_MODULE.inspiration,
      ...WAX_DEATH_MASKS_SEMANTIC_V2_MODULE.components,
    ];
    records.forEach((record) =>
      expect(record.provenance.migration).toMatchObject({
        method: "editorially-migrated",
        editorialDecision: "needs-revision",
        reviewVersion: "phase8-wax-death-masks-editorial-candidate-v1",
      }),
    );
    expect(getInspirationV2MigrationRecord("wax-death-masks")).toMatchObject({
      migrationStatus: "candidate-ready",
      editorialStatus: "awaiting-human-signoff",
      semanticCoverageStatus: "complete",
      sampleQaStatus: "pending-local-verification",
      ownedSemanticCapabilities: ["inspiration-archive", "dark-places"],
      modernCapabilityLinks: [
        expect.objectContaining({ sourceAnchorId: "wax-death-masks", expectedEntries: 7, ownership: "external-modern-source" }),
      ],
      blockingIssues: [
        "human-editorial-signoff-required",
        "museum-ethics-review-required",
        "sample-qa-local-verification-required",
        "image-provenance-required",
      ],
      candidate: {
        reviewVersion: "phase8-wax-death-masks-editorial-candidate-v1",
        ownershipModel: "archive-dark-places-with-external-monster-parity",
      },
    });
  });

  it("keeps the source boundary explicit", () => {
    const notes = WAX_DEATH_MASKS_SEMANTIC_V2_MODULE.sourceAnchor.editorialNotes.join(" ");
    const cautions = WAX_DEATH_MASKS_SEMANTIC_V2_MODULE.inspiration.editorial.cautions.join(" ");
    expect(notes.toLowerCase()).toContain("museum");
    expect(notes).toContain("Cruor fiction");
    expect(cautions.length).toBeGreaterThan(120);
  });

  it("accounts for every Archive and Dark Places legacy id exactly once", () => {
    const legacyIds = [
      ...WAX_DEATH_MASKS_LOCATION_COMPONENTS,
      ...WAX_DEATH_MASKS_LOCATION_REGION_COMPONENTS,
    ].map((component) => component.id);
    const migratedIds = WAX_DEATH_MASKS_SEMANTIC_V2_MODULE.components.flatMap(
      (component) => component.provenance.legacyIds,
    );
    expect(legacyIds.length).toBeGreaterThan(0);
    expect(new Set(legacyIds).size).toBe(legacyIds.length);
    expect(migratedIds).toHaveLength(legacyIds.length);
    expect(new Set(migratedIds).size).toBe(legacyIds.length);
    expect([...migratedIds].sort()).toEqual([...legacyIds].sort());
  });

  it("provides complete Dark Places semantic coverage", () => {
    const coverage = buildStudioSemanticCoverage(WAX_DEATH_MASKS_SEMANTIC_V2_MODULE);
    expect(coverage.ready).toBe(true);
    expect(coverage.summary).toMatchObject({ required: 7, covered: 7, partial: 0, missing: 0 });
  });

  it("compiles deterministic samples with zero diagnostics", () => {
    const report = runDarkPlacesSemanticSampleQa({
      pack: WAX_DEATH_MASKS_SEMANTIC_V2_PACK,
      module: WAX_DEATH_MASKS_SEMANTIC_V2_MODULE,
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
