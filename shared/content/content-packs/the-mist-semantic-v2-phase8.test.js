import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildStudioSemanticCoverage } from "../../../features/inspiration-studio/model/studio-semantic-coverage.js";
import { buildModuleExport } from "../../../features/inspiration-studio/model/studio-export.js";
import { normalizeModuleForDraft } from "../../../features/inspiration-studio/model/studio-draft.js";
import { runDarkPlacesSemanticSampleQa } from "../../../features/inspiration-studio/qa/dark-places-semantic-sample-qa.js";
import { validateContentPackV0_2 } from "../contracts/semantic/index.js";
import { THE_MIST_INSPIRATION_MODULE } from "../inspiration-modules/the-mist.js";
import { CRUOR_INSPIRATION_MODULES } from "../inspiration-modules.js";
import { STATIC_CONTENT_REGISTRY } from "../static-registry.js";
import {
  THE_MIST_SEMANTIC_V2_MODULE,
  THE_MIST_SEMANTIC_V2_PACK,
} from "./the-mist-semantic-v2-pack.js";

function componentsOfType(type) {
  return THE_MIST_SEMANTIC_V2_MODULE.components.filter(
    (component) => component.semanticType === type,
  );
}

function semanticOfType(type) {
  return componentsOfType(type)[0]?.semantic;
}

describe("Phase 8 batch 3 — The Mist", () => {
  it("has no runtime dependency on legacy, feature, UI, React, or SVG sources", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "shared/content/content-packs/the-mist-semantic-v2-pack.js",
      ),
      "utf8",
    );

    expect(source).not.toMatch(/inspiration-modules\/the-mist/);
    expect(source).not.toMatch(/features\//);
    expect(source).not.toMatch(/(?:from|import\s*)["'][^"']*(?:react|svg)/i);
  });

  it("uses the canonical A + D candidate in the Studio module catalog", () => {
    const module = CRUOR_INSPIRATION_MODULES.find(
      (entry) => entry.id === "the-mist",
    );

    expect(module).toBe(THE_MIST_SEMANTIC_V2_MODULE);
    expect(module.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(module.status).toBe("in-review");
    expect(module.inspiration.status).toBe("approved");
    expect(module.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
    ]);
    expect(
      module.components.filter(
        (component) => component.semanticType === "monster-graft",
      ),
    ).toEqual([]);
    expect(validateContentPackV0_2(THE_MIST_SEMANTIC_V2_PACK)).toEqual([]);
    expect(THE_MIST_SEMANTIC_V2_PACK).toMatchObject({
      version: "0.2.0-phase8-approved1",
      metadata: {
        registryRole: "semantic-v2-editorial-approved",
        humanApprovalRequired: false,
        editorialStatus: "approved",
        publicationBlockers: ["image-provenance-required"],
        retainedLegacyPublicBehavior: true,
      },
    });
    expect(module.metadata).toMatchObject({
      revision: 1,
      reviewedAt: "2026-07-17",
    });
  });

  it("carries explicit editorial provenance without compatibility normalization", () => {
    const records = [
      THE_MIST_SEMANTIC_V2_MODULE,
      THE_MIST_SEMANTIC_V2_MODULE.inspiration,
      ...THE_MIST_SEMANTIC_V2_MODULE.components,
    ];

    records.forEach((record) => {
      expect(record.provenance.migration).toMatchObject({
        method: "editorially-migrated",
        editorialDecision: "approved",
        reviewVersion: "phase8-the-mist-editorial-candidate-v1",
      });
      expect(record.provenance.migration.method).not.toBe(
        "compatibility-normalized",
      );
    });
  });

  it("records a primary literary source and an explicit transformative-use boundary", () => {
    const { sourceAnchor, inspiration } = THE_MIST_SEMANTIC_V2_MODULE;
    const notes = sourceAnchor.editorialNotes.join(" ");

    expect(sourceAnchor).toMatchObject({
      kind: "text",
      reliability: "primary",
      citation: {
        url: "https://stephenking.com/works/novella/mist.html",
      },
    });
    expect(sourceAnchor.citation.label).toContain("Stephen King");
    expect(notes).toContain("Transformative use");
    expect(notes).toContain("Copyright boundary");
    expect(notes).toContain("preserve real map topology");
    expect(inspiration.editorial.cautions.join(" ")).toContain(
      "Do not retell the novella",
    );
    expect(inspiration.media.imageAlt).toContain("requires visual review");
    expect(inspiration.media.imageCredit).toContain("keep the asset unpublished");

    const authoredGameText = JSON.stringify({
      components: THE_MIST_SEMANTIC_V2_MODULE.components,
      editorial: inspiration.editorial,
    });
    expect(authoredGameText).not.toMatch(
      /David Drayton|Billy Drayton|Mrs\. Carmody|Bridgton|Federal Store|Ollie Weeks/i,
    );
  });

  it("semantically accounts for every legacy Dark Places and region component", () => {
    const legacyLocationIds = THE_MIST_INSPIRATION_MODULE.components
      .filter((component) => component.contentType !== "monster-graft")
      .map((component) => component.id)
      .sort();
    const mappedLegacyIds = THE_MIST_SEMANTIC_V2_MODULE.components
      .flatMap((component) => component.provenance.legacyIds)
      .sort();

    expect(THE_MIST_INSPIRATION_MODULE.components).toHaveLength(24);
    expect(legacyLocationIds).toHaveLength(24);
    expect(new Set(mappedLegacyIds).size).toBe(mappedLegacyIds.length);
    expect(mappedLegacyIds).toEqual(legacyLocationIds);
  });

  it("keeps spatial uncertainty fair, visible, and cadence-bound", () => {
    const rule = semanticOfType("global-rule");
    const finalEscalation = rule.escalation.at(-1).effect;
    expect(rule.id).toBe("orientation-drift");
    expect(rule.trigger.frequencyLimit).toContain("combat round");
    expect(rule.trigger.frequencyLimit).toContain("exploration turn");
    expect(rule.resolution.timing).toContain("ten-minute exploration turn");
    expect(rule.resolution.effect.additionalText).toContain(
      "never silently changes the map's real topology",
    );
    expect(rule.counterplay).toHaveLength(3);
    expect(rule.counterplay.map((entry) => entry.id)).toEqual([
      "name-and-mark-the-route",
      "paired-observation",
      "seal-the-breach",
    ]);
    expect(finalEscalation).toContain("one-step countdown");
    expect(finalEscalation).toContain(
      "end of the next combat round or ten-minute exploration turn",
    );
    expect(finalEscalation).toContain("anchored route");
    expect(rule.gmSummary).toContain("stated discrepancy");
    expect(rule.gmSummary).toContain("anchored retreat");
  });

  it("uses recurrence to reveal information rather than repeat identical scares", () => {
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

  it("round-trips the canonical A + D payload through Studio v2-only export", () => {
    const exported = buildModuleExport(
      normalizeModuleForDraft(THE_MIST_SEMANTIC_V2_MODULE),
    );

    expect(exported.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(exported.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
    ]);
    const before = THE_MIST_SEMANTIC_V2_MODULE.components.map(
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

  it("meets the Dark Places semantic coverage and editorial depth targets", () => {
    const identity = semanticOfType("place-identity");
    const atmosphere = semanticOfType("site-atmosphere");
    const sensory = semanticOfType("sensory-profile");
    const readAloud = semanticOfType("read-aloud-profile");
    const sessionGuide = semanticOfType("session-guide");
    const rules = componentsOfType("global-rule");
    const signs = componentsOfType("recurring-sign");
    const sensoryVariants = Object.values(sensory.variants).flat();
    const representedSenses = Object.values(sensory.variants).filter(
      (variants) => variants.length > 0,
    );
    const representedIntensityTiers = Object.values(
      sensory.intensityTiers,
    ).filter((variants) => variants.length > 0);

    expect(identity.playerEntryPoints.length).toBeGreaterThanOrEqual(2);
    expect(identity.stakes.length).toBeGreaterThanOrEqual(2);
    expect(atmosphere.manifestations.length).toBeGreaterThanOrEqual(3);
    expect(rules).toHaveLength(1);
    expect(signs).toHaveLength(4);
    expect(sensoryVariants.length).toBeGreaterThanOrEqual(18);
    expect(representedSenses.length).toBeGreaterThanOrEqual(6);
    expect(representedIntensityTiers.length).toBeGreaterThanOrEqual(3);
    expect(readAloud.fragments.spatialAnchors.length).toBeGreaterThanOrEqual(8);
    expect(readAloud.fragments.sensoryBeats.length).toBeGreaterThanOrEqual(4);
    expect(readAloud.fragments.visibleFeatures.length).toBeGreaterThanOrEqual(4);
    expect(readAloud.fragments.unsettlingDetails.length).toBeGreaterThanOrEqual(4);
    expect(sessionGuide.stallMoves.length).toBeGreaterThanOrEqual(3);
    expect(sessionGuide.clueFlow.requiredRevelations).toEqual([
      "stable-route-revelation",
      "borrowed-memory-revelation",
      "route-protocol-revelation",
    ]);

    const coverage = buildStudioSemanticCoverage(
      THE_MIST_SEMANTIC_V2_MODULE,
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
      pack: THE_MIST_SEMANTIC_V2_PACK,
      module: THE_MIST_SEMANTIC_V2_MODULE,
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

  it("preserves the active legacy public registry", () => {
    expect(
      STATIC_CONTENT_REGISTRY.getInspirations({
        workflow: "inspiration-archive",
      }),
    ).toHaveLength(14);
    expect(
      STATIC_CONTENT_REGISTRY.getInspirations({
        sourceAnchor: "the-mist",
      }),
    ).toHaveLength(1);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({
        sourceAnchor: "the-mist",
      }),
    ).toHaveLength(24);
  });
});
