import { describe, expect, it } from "vitest";

import { runDarkPlacesSemanticSampleQa } from "../../../features/inspiration-studio/qa/dark-places-semantic-sample-qa.js";
import { buildStudioSemanticCoverage } from "../../../features/inspiration-studio/model/studio-semantic-coverage.js";
import { STATIC_CONTENT_REGISTRY } from "../static-registry.js";
import { CRUOR_INSPIRATION_MODULES } from "../inspiration-modules.js";
import { validateContentPackV0_2 } from "../contracts/semantic/index.js";
import {
  SEDLEC_OSSUARY_SEMANTIC_V2_MODULE,
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
} from "./sedlec-ossuary-semantic-v2-pack.js";

function getSemantic(type) {
  return SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.components.find(
    (component) => component.semanticType === type,
  )?.semantic;
}

describe("Phase 8 batch 1 — Sedlec Ossuary", () => {
  it("uses the canonical editorial candidate in the Studio module catalog", () => {
    const module = CRUOR_INSPIRATION_MODULES.find(
      (entry) => entry.id === "sedlec-ossuary",
    );

    expect(module).toBe(SEDLEC_OSSUARY_SEMANTIC_V2_MODULE);
    expect(module.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(validateContentPackV0_2(SEDLEC_OSSUARY_SEMANTIC_V2_PACK)).toEqual(
      [],
    );
    expect(module.provenance.migration.method).not.toBe(
      "compatibility-normalized",
    );
  });

  it("meets the Dark Places publication coverage targets", () => {
    const identity = getSemantic("place-identity");
    const atmosphere = getSemantic("site-atmosphere");
    const sensory = getSemantic("sensory-profile");
    const readAloud = getSemantic("read-aloud-profile");
    const sessionGuide = getSemantic("session-guide");
    const signs = SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.components.filter(
      (component) => component.semanticType === "recurring-sign",
    );
    const rules = SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.components.filter(
      (component) => component.semanticType === "global-rule",
    );
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
    expect(signs.length).toBeGreaterThanOrEqual(4);
    expect(sensoryVariants.length).toBeGreaterThanOrEqual(12);
    expect(representedSenses.length).toBeGreaterThanOrEqual(3);
    expect(representedIntensityTiers.length).toBeGreaterThanOrEqual(2);
    expect(readAloud.fragments.spatialAnchors.length).toBeGreaterThanOrEqual(3);
    expect(readAloud.fragments.sensoryBeats.length).toBeGreaterThanOrEqual(4);
    expect(readAloud.fragments.visibleFeatures.length).toBeGreaterThanOrEqual(
      4,
    );
    expect(readAloud.fragments.unsettlingDetails.length).toBeGreaterThanOrEqual(
      4,
    );
    expect(sessionGuide.stallMoves.length).toBeGreaterThanOrEqual(3);
  });

  it("has complete specialized Studio coverage", () => {
    const report = buildStudioSemanticCoverage(
      SEDLEC_OSSUARY_SEMANTIC_V2_MODULE,
    );

    expect(report.ready).toBe(true);
    expect(report.issues).toEqual([]);
    expect(report.summary).toEqual({
      total: 7,
      required: 7,
      covered: 7,
      partial: 0,
      missing: 0,
      "not-applicable": 0,
    });
  });

  it("compiles reviewed-size deterministic samples with zero diagnostics", () => {
    const report = runDarkPlacesSemanticSampleQa({
      pack: SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
      module: SEDLEC_OSSUARY_SEMANTIC_V2_MODULE,
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
      report.results.map(({ id, roomCount, fingerprint }) => ({
        id,
        roomCount,
        fingerprint,
      })),
    ).toEqual([
      { id: "crypt-baseline", roomCount: 5, fingerprint: "aafeba2d" },
      { id: "chapel-pressure", roomCount: 7, fingerprint: "31788093" },
      {
        id: "archive-low-intrusion",
        roomCount: 6,
        fingerprint: "d67ccd51",
      },
    ]);
  });

  it("preserves the active legacy Archive and component registry", () => {
    expect(
      STATIC_CONTENT_REGISTRY.getInspirations({
        workflow: "inspiration-archive",
      }),
    ).toHaveLength(14);
    expect(
      STATIC_CONTENT_REGISTRY.getInspirations({
        sourceAnchor: "sedlec-ossuary",
      }),
    ).toHaveLength(1);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({
        sourceAnchor: "sedlec-ossuary",
      }),
    ).toHaveLength(28);
  });
});
