import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
  getStaticContentRegistry,
  normalizeDarkPlacesHybridOverride,
  validateLocationDocumentV2,
} from "../../../shared/content/content.index.js";
import {
  applyDarkPlacesHybridOverrides,
  compileDarkPlacesSemanticLocation,
  createSessionStateFromLocationDocumentV1,
} from "./index.js";

const LEGACY_DOCUMENT_PATH =
  "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary/location-document-v1.json";

function createBaseline() {
  const legacyDocument = JSON.parse(
    readFileSync(LEGACY_DOCUMENT_PATH, "utf8"),
  );
  const pack = SEDLEC_OSSUARY_SEMANTIC_V2_PACK;
  const module = pack.modules[0];
  const session = createSessionStateFromLocationDocumentV1(legacyDocument, {
    id: "sedlec-ossuary-live-hybrid-overrides",
    seed: "phase4-hybrid-override-seed",
    moduleId: module.id,
    selectedComponentIds: module.components.map((component) => component.id),
    preserveLegacySemanticOverview: false,
  });
  return compileDarkPlacesSemanticLocation({ pack, module, session });
}

function createEntry(strategy, overrides = {}) {
  const component = getStaticContentRegistry().getComponent(
    overrides.componentId || "bone-chapel-counts-the-dead",
  );
  return {
    override: normalizeDarkPlacesHybridOverride({
      componentId: component.id,
      slotId: overrides.slotId || component.slots[0],
      strategy,
      regionId: overrides.regionId,
      targetComponentIds:
        overrides.targetComponentIds || ["ossuary-litany"],
    }),
    component,
  };
}

function apply(entries) {
  return applyDarkPlacesHybridOverrides({
    compileResult: createBaseline(),
    overridePlan: { all: entries },
  });
}

describe("Dark Places hybrid override compiler", () => {
  it.each([
    ["append", "stakesAndConsequences", "added"],
    ["replace", "globalRules", "replaced"],
    ["suppress", "globalRules", "removed"],
    ["force", "stakesAndConsequences", "forced"],
    ["lock", "globalRules", "locked"],
    ["prefer", "stakesAndConsequences", "preferred"],
    ["exclude", "globalRules", "removed"],
  ])("applies the explicit %s strategy without text concatenation", (
    strategy,
    field,
    expectation,
  ) => {
    const baseline = createBaseline();
    const result = apply([createEntry(strategy)]);
    const blocks = result.document.siteWide[field];

    expect(result.valid).toBe(true);
    expect(validateLocationDocumentV2(result.document)).toEqual([]);
    expect(result.operations[0].strategy).toBe(strategy);
    if (expectation === "removed") {
      expect(blocks).toEqual([]);
      return;
    }
    const granular = blocks.find(
      (block) => block.sourceComponentId === "bone-chapel-counts-the-dead",
    );
    const litany = blocks.find(
      (block) => block.sourceComponentId === "ossuary-litany",
    );
    if (expectation === "locked") {
      expect(litany.metadata.hybridOverride.locked).toBe(true);
      return;
    }
    expect(granular).toBeTruthy();
    expect(granular.text).toBe(
      "The bones are not decorations. They are arranged like a ledger, and the empty spaces seem measured for bodies that have not died yet.",
    );
    expect(granular.text).not.toContain(
      baseline.document.siteWide.globalRules[0].text,
    );
    if (expectation === "forced") {
      expect(granular.metadata.hybridOverride.forced).toBe(true);
    }
    if (expectation === "preferred") {
      expect(granular.metadata.hybridOverride.preferred).toBe(true);
    }
    if (expectation === "replaced") {
      expect(litany).toBeUndefined();
    }
  });

  it("preserves locked content against later suppress operations", () => {
    const result = apply([
      createEntry("suppress"),
      createEntry("lock"),
    ]);

    expect(result.document.siteWide.globalRules).toHaveLength(1);
    expect(
      result.document.siteWide.globalRules[0].metadata.hybridOverride.locked,
    ).toBe(true);
    expect(result.operations.map((operation) => operation.strategy)).toEqual([
      "lock",
      "suppress",
    ]);
  });

  it("keeps a region-scoped clue inside its assigned room", () => {
    const registry = getStaticContentRegistry();
    const clue = registry
      .getComponents({
        workflow: "darken-location",
        contentType: "location-component",
        slot: "clue",
      })
      .find((component) => component.sourceAnchors.includes("sedlec-ossuary"));
    const baseline = createBaseline();
    const result = applyDarkPlacesHybridOverrides({
      compileResult: baseline,
      overridePlan: { all: [
      createEntry("append", {
        componentId: clue.id,
        slotId: "clue",
        regionId: "location-region-2",
        targetComponentIds: [],
      }),
      ] },
    });

    expect(result.mapScoped).toEqual([]);
    expect(Object.keys(result.regionScoped)).toEqual(["location-region-2"]);
    result.document.rooms.forEach((room) => {
      const baselineRoom = baseline.document.rooms.find(
        (candidate) => candidate.id === room.id,
      );
      if (room.id === "location-region-2") {
        expect(room.clues).toHaveLength(baselineRoom.clues.length + 1);
        expect(room.clues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              sourceComponentId: clue.id,
              facets: [],
            }),
          ]),
        );
      } else {
        expect(room.clues).toEqual(baselineRoom.clues);
      }
    });
  });

  it("is deterministic and does not mutate the baseline compile result", () => {
    const baseline = createBaseline();
    const before = JSON.stringify(baseline);
    const plan = {
      all: [createEntry("append"), createEntry("force")].reverse(),
    };
    const first = applyDarkPlacesHybridOverrides({
      compileResult: baseline,
      overridePlan: plan,
    });
    const second = applyDarkPlacesHybridOverrides({
      compileResult: baseline,
      overridePlan: { all: [...plan.all].reverse() },
    });

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(JSON.stringify(baseline)).toBe(before);
    expect(Object.isFrozen(first)).toBe(true);
  });
});
