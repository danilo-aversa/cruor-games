import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildStudioSemanticCoverage } from "../../../features/inspiration-studio/model/studio-semantic-coverage.js";
import { buildModuleExport } from "../../../features/inspiration-studio/model/studio-export.js";
import { normalizeModuleForDraft } from "../../../features/inspiration-studio/model/studio-draft.js";
import { runDarkPlacesSemanticSampleQa } from "../../../features/inspiration-studio/qa/dark-places-semantic-sample-qa.js";
import { validateContentPackV0_2 } from "../contracts/semantic/index.js";
import { WOLF_SPIDERS_INSPIRATION_MODULE } from "../inspiration-modules/wolf-spiders.js";
import { CRUOR_INSPIRATION_MODULES } from "../inspiration-modules.js";
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

function comparableMonster(component) {
  return {
    id: component.id,
    title: component.title,
    slot: component.monster?.slot || component.slots?.[0] || "",
    summary: component.summary || component.semantic?.summary || "",
    mechanics:
      component.mechanics ||
      component.tableText ||
      component.semantic?.tableText ||
      "",
    counterplay:
      component.counterplay || component.semantic?.details?.counterplay || "",
    monster: component.monster || component.semantic?.details?.monster || null,
  };
}

describe("Phase 8 batch 4 — Wolf Spiders", () => {
  it("keeps the semantic pack independent while documenting the exact Monster bridge", () => {
    const packSource = readFileSync(
      resolve(
        process.cwd(),
        "shared/content/content-packs/wolf-spiders-semantic-v2-pack.js",
      ),
      "utf8",
    );
    const bridgeSource = readFileSync(
      resolve(
        process.cwd(),
        "shared/content/content-packs/wolf-spiders-monster-grafts-v2.js",
      ),
      "utf8",
    );

    expect(packSource).not.toMatch(/inspiration-modules\/wolf-spiders/);
    expect(packSource).not.toMatch(/features\//);
    expect(packSource).not.toMatch(/(?:from|import\s*)["'][^"']*(?:react|svg)/i);
    expect(bridgeSource).toContain('../monster-components.js');
    expect(WOLF_SPIDERS_MONSTER_GRAFT_V2_SOURCE_MODE).toBe(
      "legacy-shared-component-bridge",
    );
    expect(WOLF_SPIDERS_SEMANTIC_V2_PACK.metadata.monsterGraftSourceMode).toBe(
      WOLF_SPIDERS_MONSTER_GRAFT_V2_SOURCE_MODE,
    );
  });

  it("uses the canonical A + D + M candidate in the Studio module catalog", () => {
    const module = CRUOR_INSPIRATION_MODULES.find(
      (entry) => entry.id === "wolf-spiders",
    );

    expect(module).toBe(WOLF_SPIDERS_SEMANTIC_V2_MODULE);
    expect(module.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(module.status).toBe("in-review");
    expect(module.inspiration.status).toBe("in-review");
    expect(module.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
      "monster-composer",
    ]);
    expect(validateContentPackV0_2(WOLF_SPIDERS_SEMANTIC_V2_PACK)).toEqual([]);
    expect(WOLF_SPIDERS_SEMANTIC_V2_PACK).toMatchObject({
      version: "0.2.0-phase8-candidate1",
      metadata: {
        registryRole: "semantic-v2-editorial-candidate",
        humanApprovalRequired: true,
        retainedLegacyPublicBehavior: true,
        monsterGraftSourceMode: "legacy-shared-component-bridge",
      },
    });
    expect(module.metadata.revision).toBe(1);
  });

  it("carries explicit editorial provenance without compatibility normalization", () => {
    const records = [
      WOLF_SPIDERS_SEMANTIC_V2_MODULE,
      WOLF_SPIDERS_SEMANTIC_V2_MODULE.inspiration,
      ...WOLF_SPIDERS_SEMANTIC_V2_MODULE.components,
    ];

    records.forEach((record) => {
      expect(record.provenance.migration).toMatchObject({
        method: "editorially-migrated",
        editorialDecision: "needs-revision",
        reviewVersion: "phase8-wolf-spiders-editorial-candidate-v1",
      });
      expect(record.provenance.migration.method).not.toBe(
        "compatibility-normalized",
      );
    });
  });

  it("records a biological source and separates observed behavior from fantasy", () => {
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
    expect(inspiration.editorial.cautions.join(" ")).toContain(
      "social pack hunters",
    );
    expect(inspiration.editorial.cautions.join(" ")).toContain(
      "elaborate prey-capture webs",
    );
    expect(inspiration.media.imageAlt).toContain("requires visual review");
    expect(inspiration.media.imageCredit).toContain("keep the asset unpublished");
  });

  it("semantically accounts for every legacy Dark Places and region component", () => {
    const legacyLocationIds = WOLF_SPIDERS_INSPIRATION_MODULE.components
      .filter((component) => component.contentType !== "monster-graft")
      .map((component) => component.id)
      .sort();
    const mappedLegacyIds = WOLF_SPIDERS_SEMANTIC_V2_MODULE.components
      .filter((component) => component.semanticType !== "monster-graft")
      .flatMap((component) => component.provenance.legacyIds)
      .sort();

    expect(WOLF_SPIDERS_INSPIRATION_MODULE.components).toHaveLength(49);
    expect(legacyLocationIds).toHaveLength(17);
    expect(new Set(mappedLegacyIds).size).toBe(mappedLegacyIds.length);
    expect(mappedLegacyIds).toEqual(legacyLocationIds);
  });

  it("preserves all 32 structured Monster grafts and their exact table behavior", () => {
    const legacyMonster = WOLF_SPIDERS_INSPIRATION_MODULE.components
      .filter((component) => component.contentType === "monster-graft")
      .map(comparableMonster)
      .sort((left, right) => left.id.localeCompare(right.id));
    const definitions = WOLF_SPIDERS_MONSTER_GRAFT_V2_DEFINITIONS
      .map(comparableMonster)
      .sort((left, right) => left.id.localeCompare(right.id));
    const canonicalMonster = componentsOfType("monster-graft")
      .map(comparableMonster)
      .sort((left, right) => left.id.localeCompare(right.id));

    expect(legacyMonster).toHaveLength(32);
    expect(definitions).toHaveLength(32);
    expect(canonicalMonster).toHaveLength(32);
    expect(definitions).toEqual(legacyMonster);
    expect(canonicalMonster).toEqual(legacyMonster);
    canonicalMonster.forEach((component) => {
      expect(component.monster?.rules?.schemaVersion).toBe(
        "monster-graft-rules-v1.12",
      );
    });
  });

  it("keeps vibration pressure fair, visible, and cadence-bound", () => {
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
    expect(rule.counterplay).toHaveLength(3);
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

  it("uses recurring signs to reveal ecology and counterplay", () => {
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

  it("round-trips the canonical A + D + M payload through Studio v2-only export", () => {
    const exported = buildModuleExport(
      normalizeModuleForDraft(WOLF_SPIDERS_SEMANTIC_V2_MODULE),
    );

    expect(exported.schemaVersion).toBe("cruor-inspiration-module-v2");
    expect(exported.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
      "monster-composer",
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

  it("meets Dark Places semantic coverage and editorial depth targets", () => {
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

  it("preserves the active legacy public registry", () => {
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
