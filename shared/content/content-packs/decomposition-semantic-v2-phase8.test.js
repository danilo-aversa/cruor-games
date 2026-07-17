import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildStudioSemanticCoverage } from "../../../features/inspiration-studio/model/studio-semantic-coverage.js";
import { buildModuleExport } from "../../../features/inspiration-studio/model/studio-export.js";
import { normalizeModuleForDraft } from "../../../features/inspiration-studio/model/studio-draft.js";
import { runDarkPlacesSemanticSampleQa } from "../../../features/inspiration-studio/qa/dark-places-semantic-sample-qa.js";
import { validateContentPackV0_2 } from "../contracts/semantic/index.js";
import {
  DECOMPOSITION_INSPIRATION_MODULE,
  DECOMPOSITION_MONSTER_GRAFT_COMPONENTS,
} from "../inspiration-modules/decomposition.js";
import { CRUOR_INSPIRATION_MODULES } from "../inspiration-modules.js";
import { STATIC_CONTENT_REGISTRY } from "../static-registry.js";
import {
  DECOMPOSITION_SEMANTIC_V2_MODULE,
  DECOMPOSITION_SEMANTIC_V2_PACK,
} from "./decomposition-semantic-v2-pack.js";

function componentsOfType(type) {
  return DECOMPOSITION_SEMANTIC_V2_MODULE.components.filter(
    (component) => component.semanticType === type,
  );
}

function semanticOfType(type) {
  return componentsOfType(type)[0]?.semantic;
}

describe("Phase 8 batch 2 — Decomposition", () => {
  it("has no runtime dependency on legacy, feature, UI, React, or SVG sources", () => {
    const sources = [
      readFileSync(
        resolve(
          process.cwd(),
          "shared/content/content-packs/decomposition-semantic-v2-pack.js",
        ),
        "utf8",
      ),
      readFileSync(
        resolve(
          process.cwd(),
          "shared/content/content-packs/decomposition-monster-grafts-v2.js",
        ),
        "utf8",
      ),
    ].join("\n");

    expect(sources).not.toMatch(/inspiration-modules\/decomposition/);
    expect(sources).not.toMatch(/features\/monster-composer/);
    expect(sources).not.toMatch(/(?:from|import\s*)["'][^"']*(?:react|svg)/i);
  });

  it("uses the canonical revised A + D + M candidate in the Studio module catalog", () => {
    const module = CRUOR_INSPIRATION_MODULES.find(
      (entry) => entry.id === "decomposition",
    );

    expect(module).toBe(DECOMPOSITION_SEMANTIC_V2_MODULE);
    expect(module.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(module.status).toBe("in-review");
    expect(module.inspiration.status).toBe("in-review");
    expect(module.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
      "monster-composer",
    ]);
    expect(validateContentPackV0_2(DECOMPOSITION_SEMANTIC_V2_PACK)).toEqual([]);
    expect(DECOMPOSITION_SEMANTIC_V2_PACK).toMatchObject({
      version: "0.2.0-phase8-revision2",
      metadata: {
        registryRole: "semantic-v2-editorial-revision",
        humanApprovalRequired: true,
        retainedLegacyPublicBehavior: true,
      },
    });
    expect(module.metadata.revision).toBe(2);
  });

  it("carries explicit editorial provenance without compatibility normalization", () => {
    const records = [
      DECOMPOSITION_SEMANTIC_V2_MODULE,
      DECOMPOSITION_SEMANTIC_V2_MODULE.inspiration,
      ...DECOMPOSITION_SEMANTIC_V2_MODULE.components,
    ];

    records.forEach((record) => {
      expect(record.provenance.migration).toMatchObject({
        method: "editorially-migrated",
        editorialDecision: "needs-revision",
        reviewVersion: "phase8-decomposition-editorial-revision-v2",
      });
      expect(record.provenance.migration.method).not.toBe(
        "compatibility-normalized",
      );
    });
  });

  it("records the revised biological evidence boundary and image publication gate", () => {
    const { sourceAnchor, inspiration } = DECOMPOSITION_SEMANTIC_V2_MODULE;

    expect(sourceAnchor).toMatchObject({
      kind: "other",
      reliability: "secondary",
      citation: {
        url: "https://pubmed.ncbi.nlm.nih.gov/30124880/",
      },
    });
    expect(sourceAnchor.citation.label).toContain("doi:10.1093/jme/tjy136");
    expect(sourceAnchor.editorialNotes.join(" ")).toContain(
      "doi:10.3390/insects13100879",
    );
    expect(sourceAnchor.editorialNotes.join(" ")).toContain(
      "not general death-burst or called-shot rules",
    );
    expect(inspiration.media.imageAlt).toContain("requires visual review");
    expect(inspiration.media.imageCredit).toContain("keep the asset unpublished");
  });

  it("semantically accounts for every legacy Dark Places and region component", () => {
    const legacyLocationIds = DECOMPOSITION_INSPIRATION_MODULE.components
      .filter((component) => component.contentType !== "monster-graft")
      .map((component) => component.id)
      .sort();
    const mappedLegacyIds = DECOMPOSITION_SEMANTIC_V2_MODULE.components
      .filter((component) => component.semanticType !== "monster-graft")
      .flatMap((component) => component.provenance.legacyIds)
      .sort();

    expect(legacyLocationIds).toHaveLength(27);
    expect(new Set(mappedLegacyIds).size).toBe(mappedLegacyIds.length);
    expect(mappedLegacyIds).toEqual(legacyLocationIds);
  });

  it("preserves all 26 structured Monster grafts and their table behavior", () => {
    const candidateGrafts = componentsOfType("monster-graft");
    const candidateById = new Map(
      candidateGrafts.map((component) => [component.id, component]),
    );

    expect(candidateGrafts).toHaveLength(26);
    expect(candidateGrafts.map((component) => component.id).sort()).toEqual(
      DECOMPOSITION_MONSTER_GRAFT_COMPONENTS.map(
        (component) => component.id,
      ).sort(),
    );

    DECOMPOSITION_MONSTER_GRAFT_COMPONENTS.forEach((legacy) => {
      const candidate = candidateById.get(legacy.id);
      expect(candidate, legacy.id).toBeDefined();
      expect(candidate.slots, legacy.id).toEqual(legacy.slots);
      expect(candidate.semantic.summary, legacy.id).toBe(legacy.summary);
      expect(candidate.semantic.tableText, legacy.id).toBe(legacy.mechanics);
      expect(candidate.semantic.mechanics.text, legacy.id).toBe(
        legacy.mechanics,
      );
      expect(candidate.semantic.details.counterplay, legacy.id).toBe(
        legacy.counterplay,
      );
      expect(candidate.semantic.details.monster, legacy.id).toEqual(
        legacy.monster,
      );
    });

    const dangerouslyUnstable = candidateById.get("dangerously-unstable");
    const headWeakSpot = candidateById.get("head-weak-spot");
    expect(dangerouslyUnstable.provenance.sources[0]).toMatchObject({
      relation: "editorial-constraint",
    });
    expect(dangerouslyUnstable.provenance.sources[0].note).toContain(
      "Cruor-specific setpiece convention",
    );
    expect(headWeakSpot.provenance.sources[0].note).toContain(
      "Cruor-specific called-shot exception",
    );
  });

  it("round-trips the canonical Monster payload through Studio v2-only export", () => {
    const exported = buildModuleExport(
      normalizeModuleForDraft(DECOMPOSITION_SEMANTIC_V2_MODULE),
    );
    const before = componentsOfType("monster-graft").map((component) => ({
      id: component.id,
      monster: component.semantic.details.monster,
      counterplay: component.semantic.details.counterplay,
    }));
    const after = exported.components
      .filter((component) => component.semanticType === "monster-graft")
      .map((component) => ({
        id: component.id,
        monster: component.semantic.details.monster,
        counterplay: component.semantic.details.counterplay,
      }));

    expect(after).toEqual(before);
    expect(exported.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(exported.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
      "monster-composer",
    ]);
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
    expect(rules[0].semantic.counterplay.length).toBeGreaterThan(0);
    expect(rules[0].semantic.trigger.frequencyLimit).toContain(
      "combat round",
    );
    expect(rules[0].semantic.trigger.frequencyLimit).toContain(
      "exploration turn",
    );
    expect(rules[0].semantic.resolution.timing).toContain(
      "ten-minute exploration turn",
    );
    expect(rules[0].semantic.reset.condition).toContain(
      "cannot fully reset",
    );
    expect(rules[0].semantic.escalation.at(-1).effect).toContain(
      "one-step countdown",
    );
    expect(rules[0].semantic.escalation.at(-1).effect).toContain(
      "end of the next combat round or ten-minute exploration turn",
    );
    expect(signs).toHaveLength(4);
    expect(sensoryVariants.length).toBeGreaterThanOrEqual(12);
    expect(representedSenses.length).toBeGreaterThanOrEqual(3);
    expect(representedIntensityTiers.length).toBeGreaterThanOrEqual(2);
    expect(readAloud.fragments.spatialAnchors.length).toBeGreaterThanOrEqual(7);
    expect(readAloud.fragments.sensoryBeats.length).toBeGreaterThanOrEqual(4);
    expect(readAloud.fragments.visibleFeatures.length).toBeGreaterThanOrEqual(
      4,
    );
    expect(readAloud.fragments.unsettlingDetails.length).toBeGreaterThanOrEqual(
      4,
    );
    expect(sessionGuide.stallMoves.length).toBeGreaterThanOrEqual(3);
    expect(
      JSON.stringify({ identity, atmosphere, readAloud, sessionGuide }),
    ).not.toMatch(
      /mortuary station|case number|forensic examiners|mass-fatality emergency|controlled-decay program/i,
    );

    const coverage = buildStudioSemanticCoverage(
      DECOMPOSITION_SEMANTIC_V2_MODULE,
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
      pack: DECOMPOSITION_SEMANTIC_V2_PACK,
      module: DECOMPOSITION_SEMANTIC_V2_MODULE,
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
    expect(fingerprints).not.toEqual(["9e8c4247", "70983abe", "4eb0bda7"]);
  });

  it("preserves the active legacy public registry", () => {
    expect(
      STATIC_CONTENT_REGISTRY.getInspirations({
        workflow: "inspiration-archive",
      }),
    ).toHaveLength(14);
    expect(
      STATIC_CONTENT_REGISTRY.getInspirations({
        sourceAnchor: "decomposition",
      }),
    ).toHaveLength(1);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({
        sourceAnchor: "decomposition",
      }),
    ).toHaveLength(53);
  });
});
