import { describe, expect, it } from "vitest";

import {
  CRUOR_INSPIRATION_MODULES,
  PRODUCTION_CONVERTED_CORE_INSPIRATION_MODULES,
  PRODUCTION_EXPLICIT_INSPIRATION_MODULES,
  PRODUCTION_INSPIRATION_MODULES,
  SEMANTIC_MIGRATION_MODULES,
} from "./inspiration-modules.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
      "decomposition",
      "sedlec-ossuary",
      "the-mist",
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
    expect(
      STATIC_CONTENT_REGISTRY.getInspirations({
        workflow: "inspiration-archive",
      }),
    ).toHaveLength(14);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "the-mist" }),
    ).toHaveLength(24);
    expect(
      STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "wolf-spiders" }),
    ).toHaveLength(49);
  });
});
