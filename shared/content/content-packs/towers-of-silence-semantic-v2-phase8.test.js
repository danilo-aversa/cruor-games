import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildStudioSemanticCoverage } from "../../../features/inspiration-studio/model/studio-semantic-coverage.js";
import { buildModuleExport } from "../../../features/inspiration-studio/model/studio-export.js";
import { normalizeModuleForDraft } from "../../../features/inspiration-studio/model/studio-draft.js";
import { runDarkPlacesSemanticSampleQa } from "../../../features/inspiration-studio/qa/dark-places-semantic-sample-qa.js";
import { MONSTER_GRAFTS } from "../../../features/monster-composer/data/monster-grafts.js";
import { validateContentPackV0_2 } from "../contracts/semantic/index.js";
import { TOWERS_OF_SILENCE_INSPIRATION_MODULE } from "../inspiration-modules/towers-of-silence.js";
import { CRUOR_INSPIRATION_MODULES } from "../inspiration-modules.js";
import { getInspirationV2MigrationRecord } from "../migrations/inspiration-v2-migration-registry.js";
import { STATIC_CONTENT_REGISTRY } from "../static-registry.js";
import {
  TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE,
  TOWERS_OF_SILENCE_SEMANTIC_V2_PACK,
} from "./towers-of-silence-semantic-v2-pack.js";

function componentsOfType(type) {
  return TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE.components.filter(
    (component) => component.semanticType === type,
  );
}

function semanticOfType(type) {
  return componentsOfType(type)[0]?.semantic;
}

function referencesTowersOfSilence(graft = {}) {
  return (graft.sourceAnchors?.length ? graft.sourceAnchors : [graft.source])
    .filter(Boolean)
    .includes("towers-of-silence");
}

describe("Phase 8 batch 5 — Towers of Silence editorial approval", () => {
  it("owns only Archive and Dark Places with no Monster bridge or payload", () => {
    const packSource = readFileSync(
      resolve(
        process.cwd(),
        "shared/content/content-packs/towers-of-silence-semantic-v2-pack.js",
      ),
      "utf8",
    );

    expect(packSource).not.toMatch(/MONSTER_GRAFTS/);
    expect(packSource).not.toMatch(/createMonsterComponent/);
    expect(packSource).not.toMatch(/semanticType:\s*"monster-graft"/);
    expect(packSource).not.toMatch(/(?:from|import\s*)["'][^"']*(?:react|svg)/i);
    expect(TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
    ]);
    expect(
      TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE.components.filter(
        (component) => component.semanticType === "monster-graft",
      ),
    ).toEqual([]);
    expect(
      TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE.metadata.modernCapabilityLinks ?? [],
    ).toEqual([]);
    expect(MONSTER_GRAFTS.filter(referencesTowersOfSilence)).toEqual([]);
  });

  it("keeps the approved module in the semantic catalog without changing production", () => {
    const module = CRUOR_INSPIRATION_MODULES.find(
      (entry) => entry.id === "towers-of-silence",
    );

    expect(module).toBe(TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE);
    expect(module.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(module.status).toBe("in-review");
    expect(module.inspiration.status).toBe("approved");
    expect(validateContentPackV0_2(TOWERS_OF_SILENCE_SEMANTIC_V2_PACK)).toEqual(
      [],
    );
    expect(TOWERS_OF_SILENCE_SEMANTIC_V2_PACK).toMatchObject({
      version: "0.2.0-phase8-approved1",
      status: "draft",
      metadata: {
        registryRole: "semantic-v2-editorial-approved",
        humanApprovalRequired: false,
        retainedLegacyPublicBehavior: true,
        editorialStatus: "approved",
        publicationBlockers: ["image-provenance-required"],
        modernCapabilityLinks: [],
      },
    });
    expect(
      STATIC_CONTENT_REGISTRY.getInspirations({
        workflow: "inspiration-archive",
      }),
    ).toHaveLength(14);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({
        sourceAnchor: "towers-of-silence",
      }),
    ).toHaveLength(24);
  });

  it("records approved provenance and retains only the image publication gate", () => {
    const records = [
      TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE,
      TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE.inspiration,
      ...TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE.components,
    ];

    records.forEach((record) => {
      expect(record.provenance.migration).toMatchObject({
        method: "editorially-migrated",
        editorialDecision: "approved",
        reviewVersion: "phase8-towers-of-silence-editorial-approved-v1",
      });
    });

    expect(getInspirationV2MigrationRecord("towers-of-silence")).toMatchObject({
      migrationStatus: "complete",
      editorialStatus: "approved",
      semanticCoverageStatus: "complete",
      sampleQaStatus: "passed-zero-diagnostics",
      ownedSemanticCapabilities: ["inspiration-archive", "dark-places"],
      modernCapabilityLinks: [],
      blockingIssues: ["image-provenance-required"],
      reviewer: "Danilo",
      reviewedAt: "2026-07-17",
      candidate: {
        reviewVersion: "phase8-towers-of-silence-editorial-approved-v1",
        ownershipModel: "archive-dark-places-only",
      },
    });
  });

  it("separates historical practice from supernatural Cruor fiction", () => {
    const { sourceAnchor, inspiration } =
      TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE;
    const notes = sourceAnchor.editorialNotes.join(" ");
    const cautions = inspiration.editorial.cautions.join(" ");

    expect(sourceAnchor).toMatchObject({
      kind: "practice",
      reliability: "secondary",
      citation: {
        url: "https://www.iranicaonline.org/articles/burial-iii/",
      },
    });
    expect(notes).toContain("Zoroastrian funerary practice");
    expect(notes).toContain("historical");
    expect(notes).toContain("Cruor fantasy");
    expect(notes).toContain("not decorative spectacle");
    expect(cautions).toContain("not claim that carrion birds");
    expect(cautions).toContain("game solution");
    expect(inspiration.media.imageCredit).toContain("keep the asset unpublished");
  });

  it("accounts for all 24 legacy location and region ids exactly once", () => {
    const legacyIds = TOWERS_OF_SILENCE_INSPIRATION_MODULE.components.map(
      (component) => component.id,
    );
    const migratedIds =
      TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE.components.flatMap(
        (component) => component.provenance.legacyIds,
      );

    expect(legacyIds).toHaveLength(24);
    expect(new Set(legacyIds).size).toBe(24);
    expect(migratedIds).toHaveLength(24);
    expect(new Set(migratedIds).size).toBe(24);
    expect([...migratedIds].sort()).toEqual([...legacyIds].sort());
  });

  it("keeps Sky Measure visible, cadence-bound, reversible, and non-ritualized", () => {
    const rule = semanticOfType("global-rule");
    const finalEscalation = rule.escalation.at(-1).effect;

    expect(rule.id).toBe("sky-measure");
    expect(rule.trigger.frequencyLimit).toContain("combat round");
    expect(rule.trigger.frequencyLimit).toContain("exploration turn");
    expect(rule.resolution.effect.additionalText).toContain(
      "never creates an unseen creature",
    );
    expect(rule.resolution.effect.additionalText).toContain(
      "rewrites real map topology",
    );
    expect(rule.resolution.effect.additionalText).toContain(
      "historical rite",
    );
    expect(rule.counterplay.map((entry) => entry.id)).toEqual([
      "restore-the-visible-boundary",
      "open-the-drainage-path",
      "follow-the-scratch-path",
    ]);
    expect(finalEscalation).toContain("one-step countdown");
    expect(finalEscalation).toContain("sheltered retreat");
  });

  it("uses four recurring signs for route, history, and counterplay", () => {
    const signs = componentsOfType("recurring-sign");
    const revelationLinks = signs.map(
      (component) => component.semantic.revelationLink,
    );

    expect(signs).toHaveLength(4);
    signs.forEach((component) => {
      expect(component.semantic.variations.length).toBeGreaterThanOrEqual(3);
      expect(component.semantic.interaction.trigger).toBeTruthy();
      expect(component.semantic.interaction.effect).toBeTruthy();
      expect(component.semantic.interaction.counterplay).toBeTruthy();
    });
    expect(new Set(revelationLinks).size).toBe(4);
  });

  it("round-trips the complete A + D payload through Studio v2 export", () => {
    const exported = buildModuleExport(
      normalizeModuleForDraft(TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE),
    );

    expect(exported.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(exported.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
    ]);
    expect(
      exported.components.map(({ id, semanticType, semantic, provenance }) => ({
        id,
        semanticType,
        semantic,
        provenance,
      })),
    ).toEqual(
      TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE.components.map(
        ({ id, semanticType, semantic, provenance }) => ({
          id,
          semanticType,
          semantic,
          provenance,
        }),
      ),
    );
  });

  it("covers all seven Dark Places semantic targets", () => {
    const coverage = buildStudioSemanticCoverage(
      TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE,
    );

    expect(coverage.ready).toBe(true);
    expect(coverage.issues).toEqual([]);
    expect(coverage.summary).toEqual({
      total: 7,
      required: 7,
      covered: 7,
      partial: 0,
      missing: 0,
      "not-applicable": 0,
    });
  });

  it("compiles deterministic samples with zero diagnostics", () => {
    const report = runDarkPlacesSemanticSampleQa({
      pack: TOWERS_OF_SILENCE_SEMANTIC_V2_PACK,
      module: TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE,
    });

    expect(report.passed).toBe(true);
    expect(report.summary).toEqual({
      total: 3,
      passed: 3,
      failed: 0,
      error: 0,
      warning: 0,
      determinismFailures: 0,
    });
    expect(
      report.results.map(({ id, roomCount }) => ({ id, roomCount })),
    ).toEqual([
      { id: "crypt-baseline", roomCount: 5 },
      { id: "chapel-pressure", roomCount: 7 },
      { id: "archive-low-intrusion", roomCount: 6 },
    ]);
    const fingerprints = report.results.map(({ fingerprint }) => fingerprint);
    fingerprints.forEach((fingerprint) => {
      expect(fingerprint).toMatch(/^[0-9a-f]{8}$/);
    });
    expect(new Set(fingerprints).size).toBe(fingerprints.length);
  });
});
