import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildStudioSemanticCoverage } from "../../../features/inspiration-studio/model/studio-semantic-coverage.js";
import { buildModuleExport } from "../../../features/inspiration-studio/model/studio-export.js";
import { normalizeModuleForDraft } from "../../../features/inspiration-studio/model/studio-draft.js";
import { runDarkPlacesSemanticSampleQa } from "../../../features/inspiration-studio/qa/dark-places-semantic-sample-qa.js";
import { MONSTER_GRAFTS } from "../../../features/monster-composer/data/monster-grafts.js";
import { validateContentPackV0_2 } from "../contracts/semantic/index.js";
import { WOLF_SPIDERS_INSPIRATION_MODULE } from "../inspiration-modules/wolf-spiders.js";
import { CRUOR_INSPIRATION_MODULES } from "../inspiration-modules.js";
import { getInspirationV2MigrationRecord } from "../migrations/inspiration-v2-migration-registry.js";
import { STATIC_CONTENT_REGISTRY } from "../static-registry.js";
import {
  WOLF_SPIDERS_MONSTER_GRAFT_V2_DEFINITIONS,
  WOLF_SPIDERS_MONSTER_GRAFT_V2_SOURCE_MODE,
} from "./wolf-spiders-monster-grafts-v2.js";
import {
  WOLF_SPIDERS_SEMANTIC_V2_MODULE,
  WOLF_SPIDERS_SEMANTIC_V2_PACK,
} from "./wolf-spiders-semantic-v2-pack.js";

function componentsOfType(type) {
  return WOLF_SPIDERS_SEMANTIC_V2_MODULE.components.filter(
    (component) => component.semanticType === type,
  );
}

function semanticOfType(type) {
  return componentsOfType(type)[0]?.semantic;
}

function referencesWolfSpiders(graft = {}) {
  return (graft.sourceAnchors?.length ? graft.sourceAnchors : [graft.source])
    .filter(Boolean)
    .includes("wolf-spiders");
}

describe("Phase 8 batch 4 — Wolf Spiders approved Candidate 2", () => {
  it("owns only Archive and Dark Places while leaving Monster external", () => {
    const packSource = readFileSync(
      resolve(
        process.cwd(),
        "shared/content/content-packs/wolf-spiders-semantic-v2-pack.js",
      ),
      "utf8",
    );

    expect(packSource).not.toMatch(/wolf-spiders-monster-grafts-v2/);
    expect(packSource).not.toMatch(/MONSTER_GRAFTS/);
    expect(packSource).not.toMatch(/createMonsterComponent/);
    expect(packSource).not.toMatch(/semanticType:\s*"monster-graft"/);
    expect(packSource).not.toMatch(/(?:from|import\s*)["'][^"']*(?:react|svg)/i);

    expect(WOLF_SPIDERS_SEMANTIC_V2_MODULE.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
    ]);
    expect(
      WOLF_SPIDERS_SEMANTIC_V2_MODULE.components.filter(
        (component) => component.semanticType === "monster-graft",
      ),
    ).toEqual([]);
    expect(WOLF_SPIDERS_SEMANTIC_V2_MODULE.metadata.modernCapabilityLinks).toEqual([
      {
        capability: "monster-composer",
        ownership: "external-modern-source",
        sourceFile: "features/monster-composer/data/monster-grafts.js",
        sourceAnchorId: "wolf-spiders",
        expectedEntries: 32,
        verification: "source-anchor-parity",
      },
    ]);
  });

  it("uses the approved Candidate 2 in the semantic Studio catalog without publishing the image", () => {
    const module = CRUOR_INSPIRATION_MODULES.find(
      (entry) => entry.id === "wolf-spiders",
    );

    expect(module).toBe(WOLF_SPIDERS_SEMANTIC_V2_MODULE);
    expect(module.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(module.status).toBe("in-review");
    expect(module.inspiration.status).toBe("approved");
    expect(validateContentPackV0_2(WOLF_SPIDERS_SEMANTIC_V2_PACK)).toEqual([]);
    expect(WOLF_SPIDERS_SEMANTIC_V2_PACK).toMatchObject({
      version: "0.2.0-phase8-approved2",
      status: "draft",
      metadata: {
        registryRole: "semantic-v2-editorial-approved",
        humanApprovalRequired: false,
        retainedLegacyPublicBehavior: true,
        editorialStatus: "approved",
        publicationBlockers: ["image-provenance-required"],
      },
    });
    expect(module.metadata.revision).toBe(2);
    expect(module.metadata.reviewedAt).toBe("2026-07-17");
  });

  it("records approved Candidate 2 provenance and retains Candidate 1 withdrawal history", () => {
    const records = [
      WOLF_SPIDERS_SEMANTIC_V2_MODULE,
      WOLF_SPIDERS_SEMANTIC_V2_MODULE.inspiration,
      ...WOLF_SPIDERS_SEMANTIC_V2_MODULE.components,
    ];

    records.forEach((record) => {
      expect(record.provenance.migration).toMatchObject({
        method: "editorially-migrated",
        editorialDecision: "approved",
        reviewVersion: "phase8-wolf-spiders-editorial-approved-v2",
      });
      expect(record.provenance.migration.method).not.toBe(
        "compatibility-normalized",
      );
    });

    expect(getInspirationV2MigrationRecord("wolf-spiders")).toMatchObject({
      migrationStatus: "complete",
      editorialStatus: "approved",
      semanticCoverageStatus: "complete",
      sampleQaStatus: "passed-zero-diagnostics",
      ownedSemanticCapabilities: ["inspiration-archive", "dark-places"],
      modernCapabilityLinks: [
        {
          capability: "monster-composer",
          ownership: "external-modern-source",
          expectedEntries: 32,
        },
      ],
      withdrawnCandidate: {
        reviewVersion: "phase8-wolf-spiders-editorial-candidate-v1",
        reason: "duplicated-modern-monster-ownership",
      },
    });
  });

  it("records a biological source and separates observation from fantasy", () => {
    const { sourceAnchor, inspiration } = WOLF_SPIDERS_SEMANTIC_V2_MODULE;
    const notes = sourceAnchor.editorialNotes.join(" ");

    expect(sourceAnchor).toMatchObject({
      kind: "other",
      reliability: "secondary",
      citation: {
        url: "https://australian.museum/learn/animals/spiders/wolf-spiders/",
      },
    });
    expect(notes).toContain("Biological boundary");
    expect(notes).toContain("Fictional transformation");
    expect(notes).toContain("not wolves in folklore");
    expect(notes).toContain("remain solely");
    expect(inspiration.editorial.cautions.join(" ")).toContain(
      "social pack hunters",
    );
    expect(inspiration.editorial.cautions.join(" ")).toContain(
      "elaborate prey-capture webs",
    );
    expect(inspiration.media.imageAlt).toContain("requires visual review");
    expect(inspiration.media.imageCredit).toContain("keep the asset unpublished");
  });

  it("semantically accounts for all 17 legacy Dark Places and region components", () => {
    const legacyLocationIds = WOLF_SPIDERS_INSPIRATION_MODULE.components
      .filter((component) => component.contentType !== "monster-graft")
      .map((component) => component.id)
      .sort();
    const mappedLegacyIds = WOLF_SPIDERS_SEMANTIC_V2_MODULE.components
      .flatMap((component) => component.provenance.legacyIds)
      .sort();

    expect(WOLF_SPIDERS_INSPIRATION_MODULE.components).toHaveLength(49);
    expect(legacyLocationIds).toHaveLength(17);
    expect(new Set(mappedLegacyIds).size).toBe(mappedLegacyIds.length);
    expect(mappedLegacyIds).toEqual(legacyLocationIds);
  });

  it("verifies 32 modern Monster grafts externally without copying payloads", () => {
    const modernGrafts = MONSTER_GRAFTS.filter(referencesWolfSpiders);

    expect(modernGrafts).toHaveLength(32);
    modernGrafts.forEach((graft) => {
      expect(graft.rules?.schemaVersion).toBe(
        "monster-graft-rules-v1.12",
      );
    });

    expect(WOLF_SPIDERS_MONSTER_GRAFT_V2_SOURCE_MODE).toBe(
      "retired-duplicate-bridge",
    );
    expect(WOLF_SPIDERS_MONSTER_GRAFT_V2_DEFINITIONS).toEqual([]);
  });

  it("keeps Tremor Pressure visible, cadence-bound, and reversible", () => {
    const rule = semanticOfType("global-rule");
    const finalEscalation = rule.escalation.at(-1).effect;

    expect(rule.id).toBe("tremor-pressure");
    expect(rule.trigger.frequencyLimit).toContain("combat round");
    expect(rule.trigger.frequencyLimit).toContain("exploration turn");
    expect(rule.resolution.timing).toContain("ten-minute exploration turn");
    expect(rule.resolution.effect.additionalText).toContain(
      "never creates an unseen creature",
    );
    expect(rule.resolution.effect.additionalText).toContain(
      "changes real map topology",
    );
    expect(rule.counterplay.map((entry) => entry.id)).toEqual([
      "pad-and-pair-the-route",
      "redirect-the-tremor",
      "respect-the-nursery-boundary",
    ]);
    expect(finalEscalation).toContain("one-step countdown");
    expect(finalEscalation).toContain(
      "end of the next combat round or ten-minute exploration turn",
    );
    expect(finalEscalation).toContain("padded retreat");
  });

  it("uses four recurring signs to reveal ecology and counterplay", () => {
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
      normalizeModuleForDraft(WOLF_SPIDERS_SEMANTIC_V2_MODULE),
    );

    expect(exported.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(exported.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
    ]);
    const before = WOLF_SPIDERS_SEMANTIC_V2_MODULE.components.map(
      ({ id, semanticType, semantic, provenance }) => ({
        id,
        semanticType,
        semantic,
        provenance,
      }),
    );
    const after = exported.components.map(
      ({ id, semanticType, semantic, provenance }) => ({
        id,
        semanticType,
        semantic,
        provenance,
      }),
    );
    expect(after).toEqual(before);
  });

  it("meets all seven Dark Places semantic coverage targets", () => {
    const identity = semanticOfType("place-identity");
    const atmosphere = semanticOfType("site-atmosphere");
    const sensory = semanticOfType("sensory-profile");
    const readAloud = semanticOfType("read-aloud-profile");
    const sessionGuide = semanticOfType("session-guide");
    const sensoryVariants = Object.values(sensory.variants).flat();

    expect(identity.playerEntryPoints.length).toBeGreaterThanOrEqual(2);
    expect(identity.stakes.length).toBeGreaterThanOrEqual(2);
    expect(atmosphere.manifestations.length).toBeGreaterThanOrEqual(3);
    expect(componentsOfType("global-rule")).toHaveLength(1);
    expect(componentsOfType("recurring-sign")).toHaveLength(4);
    expect(sensoryVariants.length).toBeGreaterThanOrEqual(20);
    expect(
      Object.values(sensory.variants).filter((variants) => variants.length > 0),
    ).toHaveLength(7);
    expect(readAloud.fragments.spatialAnchors.length).toBeGreaterThanOrEqual(8);
    expect(readAloud.fragments.sensoryBeats.length).toBeGreaterThanOrEqual(4);
    expect(readAloud.fragments.visibleFeatures.length).toBeGreaterThanOrEqual(4);
    expect(readAloud.fragments.unsettlingDetails.length).toBeGreaterThanOrEqual(4);
    expect(sessionGuide.stallMoves).toHaveLength(3);
    expect(sessionGuide.clueFlow.requiredRevelations).toEqual([
      "hunting-lane-revelation",
      "nursery-route-revelation",
      "maternal-priority-revelation",
    ]);

    const coverage = buildStudioSemanticCoverage(
      WOLF_SPIDERS_SEMANTIC_V2_MODULE,
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
      pack: WOLF_SPIDERS_SEMANTIC_V2_PACK,
      module: WOLF_SPIDERS_SEMANTIC_V2_MODULE,
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

  it("preserves the active production Archive and legacy component registry", () => {
    expect(
      STATIC_CONTENT_REGISTRY.getInspirations({
        workflow: "inspiration-archive",
      }),
    ).toHaveLength(14);
    expect(
      STATIC_CONTENT_REGISTRY.getInspirations({
        sourceAnchor: "wolf-spiders",
      }),
    ).toHaveLength(1);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({
        sourceAnchor: "wolf-spiders",
      }),
    ).toHaveLength(49);
  });
});
