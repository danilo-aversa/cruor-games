import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
  serializeCanonicalSemanticContent,
} from "../../../shared/content/content.index.js";
import {
  adaptLocationDocumentV2ToV1,
  compileDarkPlacesSemanticLocation,
  createSessionStateFromLocationDocumentV1,
  serializeCompiledLocationDocument,
} from "./index.js";

const LEGACY_DOCUMENT_PATH =
  "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary/location-document-v1.json";

function createInput() {
  const legacyDocument = JSON.parse(readFileSync(LEGACY_DOCUMENT_PATH, "utf8"));
  const pack = SEDLEC_OSSUARY_SEMANTIC_V2_PACK;
  const module = pack.modules[0];
  const session = createSessionStateFromLocationDocumentV1(legacyDocument, {
    id: "sedlec-ossuary-phase5",
    seed: "semantic-v2-sedlec-phase4-001",
    moduleId: module.id,
    selectedComponentIds: module.components.map((component) => component.id),
    preserveLegacySemanticOverview: false,
  });
  return { pack, module, session, legacyDocument };
}

function compile(input = createInput()) {
  return compileDarkPlacesSemanticLocation(input);
}

describe("Dark Places semantic compiler Phase 5 Sedlec vertical slice", () => {
  it("builds an actionable Session Guide instead of component counts", () => {
    const result = compile();
    const guide = result.document.sessionGuide;

    expect(result.valid).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.stages).toContain("build-clue-graph-and-session-guide");
    expect(guide.openingBeat).toMatchObject({
      entranceRoomId: "location-region-1",
      situation: expect.stringContaining("custodian"),
      immediateSignal: expect.stringContaining("Four dry clicks"),
      playerDecision: expect.stringContaining("Enter quietly"),
    });
    expect(guide.objectives).toHaveLength(3);
    expect(guide.stallMoves).toHaveLength(3);
    expect(JSON.stringify(guide)).not.toMatch(
      /componentCount|clueCount|hazardCount|filledSlots/i,
    );
  });

  it("compiles the Litany as both an interactive track and quick reference", () => {
    const guide = compile().document.sessionGuide;
    const track = guide.pressureTracks.find(
      (candidate) => candidate.id === "ossuary-litany",
    );

    expect(track.metadata.dashboard).toMatchObject({
      label: "Litany",
      minimum: 0,
      maximum: 4,
      initial: 0,
      thresholds: [
        { at: 2, effect: expect.stringContaining("Skulls turn") },
        { at: 4, effect: expect.stringContaining("empty niche") },
      ],
    });
    expect(guide.alwaysOnRules.map((rule) => rule.id)).toEqual([
      "ossuary-litany",
    ]);
    expect(track.counterplay).toContain("reduce Litany by 1");
  });

  it("builds a traversable clue graph with room evidence for every required revelation", () => {
    const clueFlow = compile().document.sessionGuide.clueFlow;
    const nodesById = new Map(clueFlow.nodes.map((node) => [node.id, node]));

    expect(clueFlow.requiredRevelations).toEqual([
      "named-bone-revelation",
      "litany-count-revelation",
      "recent-collection-revelation",
    ]);
    clueFlow.requiredRevelations.forEach((id) => {
      expect(nodesById.get(id)).toMatchObject({
        required: true,
        available: true,
      });
      expect(nodesById.get(id).roomIds.length).toBeGreaterThan(0);
      expect(nodesById.get(id).evidence.length).toBeGreaterThan(0);
    });
    clueFlow.links.forEach((link) => {
      expect(nodesById.has(link.from)).toBe(true);
      expect(nodesById.has(link.to)).toBe(true);
      expect(link.condition).toBeTruthy();
    });
    expect(clueFlow.fallbackClues).toHaveLength(2);
  });

  it("orders room shortcuts by authored pacing and marks escalation rooms", () => {
    const shortcuts = compile().document.sessionGuide.roomShortcuts;

    expect(shortcuts.map((shortcut) => shortcut.roomId)).toEqual([
      "location-region-1",
      "location-region-3",
      "location-region-4",
      "location-region-2",
      "location-region-5",
    ]);
    expect(
      shortcuts
        .filter((shortcut) => shortcut.escalation)
        .map((shortcut) => shortcut.roomId),
    ).toEqual(["location-region-2", "location-region-5"]);
    expect(shortcuts.at(-1).guidance).toContain("Litany 4");
  });

  it("projects the structured guide into the temporary output view without runtime state", () => {
    const document = compile().document;
    const output = adaptLocationDocumentV2ToV1(document);

    expect(output.sessionGuide).toEqual(document.sessionGuide);
    expect(output.source).toMatchObject({
      documentId: document.id,
      documentSchemaVersion: document.schemaVersion,
    });
    expect(JSON.stringify(output.sessionGuide)).not.toMatch(
      /pressureValues|discoveredClueIds|localStorage/i,
    );
  });

  it("is deterministic, immutable, and leaves the source build untouched", () => {
    const input = createInput();
    const inputBefore = JSON.stringify(input);
    const legacyBefore = readFileSync(LEGACY_DOCUMENT_PATH, "utf8");
    const first = compile(input);
    const second = compile(input);
    const bytes = serializeCompiledLocationDocument(first.document);

    expect(serializeCompiledLocationDocument(second.document)).toBe(bytes);
    expect(bytes).toBe(serializeCanonicalSemanticContent(first.document));
    expect(JSON.stringify(input)).toBe(inputBefore);
    expect(readFileSync(LEGACY_DOCUMENT_PATH, "utf8")).toBe(legacyBefore);
    expect(Object.isFrozen(first.document.sessionGuide)).toBe(true);
    expect(Object.isFrozen(first.document.sessionGuide.clueFlow.nodes[0])).toBe(
      true,
    );
  });
});
