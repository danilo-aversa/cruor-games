import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  CRUOR_INSPIRATION_MODULES,
  PRODUCTION_CONVERTED_CORE_INSPIRATION_MODULES,
  PRODUCTION_EXPLICIT_INSPIRATION_MODULES,
  PRODUCTION_INSPIRATION_MODULES,
  SEMANTIC_MIGRATION_MODULES,
} from "./inspiration-modules.js";
import { STATIC_CONTENT_PACKS, STATIC_CONTENT_REGISTRY } from "./static-registry.js";

describe("production and semantic Inspiration catalog boundary", () => {
  it("keeps the 14-entry production catalog independent from semantic selection", () => {
    expect(PRODUCTION_INSPIRATION_MODULES).toHaveLength(14);
    expect(PRODUCTION_EXPLICIT_INSPIRATION_MODULES.map(({ id }) => id)).toEqual([
      "decomposition",
      "sedlec-ossuary",
    ]);
    expect(PRODUCTION_CONVERTED_CORE_INSPIRATION_MODULES).toHaveLength(12);
    expect(SEMANTIC_MIGRATION_MODULES.map(({ id }) => id).sort()).toEqual([
      "anthropodermic-bibliopegy",
      "crucifixion",
      "decomposition",
      "endocannibalism",
      "genetic-mutations",
      "impalement",
      "jikininki",
      "mortuary-totems",
      "mustard-gas",
      "sedlec-ossuary",
      "the-mist",
      "towers-of-silence",
      "wax-death-masks",
      "wolf-spiders"
    ]);
    expect(CRUOR_INSPIRATION_MODULES).toHaveLength(14);
  });

  it("keeps production assembly free of semantic candidate imports", () => {
    const productionSources = [
      "shared/content/production-inspiration-modules.js",
      "shared/content/content-packs/existing-inspirations-pack.js",
      "shared/content/content-packs/decomposition-inspiration-module-pack.js",
      "shared/content/content-packs/sedlec-ossuary-inspiration-module-pack.js",
      "shared/content/static-registry.js",
    ]
      .map((path) => readFileSync(resolve(process.cwd(), path), "utf8"))
      .join("\n");
    expect(productionSources).not.toMatch(/semantic-v2-pack/);
    expect(productionSources).not.toMatch(/STATIC_SEMANTIC_CONTENT_PACKS/);
  });

  it("does not require per-candidate public-registry bridges", () => {
    const packIds = STATIC_CONTENT_PACKS.map((pack) => pack.id);
    expect(packIds).not.toContain("the-mist-inspiration-module");
    expect(packIds).not.toContain("wolf-spiders-inspiration-module");
    expect(packIds).not.toContain("towers-of-silence-inspiration-module");
    expect(packIds).not.toContain("endocannibalism-inspiration-module");
    expect(packIds).not.toContain("mustard-gas-inspiration-module");
    expect(packIds).not.toContain("mortuary-totems-inspiration-module");
    expect(packIds).not.toContain("genetic-mutations-inspiration-module");
    expect(packIds).not.toContain("crucifixion-inspiration-module");
    expect(packIds).not.toContain("impalement-inspiration-module");
    expect(packIds).not.toContain("wax-death-masks-inspiration-module");
    expect(packIds).not.toContain("anthropodermic-bibliopegy-inspiration-module");
    expect(packIds).not.toContain("jikininki-inspiration-module");
    expect(
      STATIC_CONTENT_REGISTRY.getInspirations({ workflow: "inspiration-archive" }),
    ).toHaveLength(14);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "the-mist" }),
    ).toHaveLength(24);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "wolf-spiders" }),
    ).toHaveLength(49);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "towers-of-silence" }),
    ).toHaveLength(24);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "mortuary-totems" }),
    ).toHaveLength(11);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "mustard-gas" }),
    ).toHaveLength(15);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "endocannibalism" }),
    ).toHaveLength(11);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "genetic-mutations" }),
    ).toHaveLength(15);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "crucifixion" }),
    ).toHaveLength(9);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "impalement" }),
    ).toHaveLength(8);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "wax-death-masks" }),
    ).toHaveLength(20);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "anthropodermic-bibliopegy" }),
    ).toHaveLength(14);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "jikininki" }),
    ).toHaveLength(36);
  });
});
