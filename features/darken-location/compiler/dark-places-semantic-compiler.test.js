import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  normalizeSemanticContent,
  serializeCanonicalSemanticContent,
  validateLocationDocumentV2,
} from "../../../shared/content/content.index.js";
import {
  adaptLocationDocumentV2ToV1,
  compareLocationDocumentsV1V2,
  createSessionStateFromLocationDocumentV1,
} from "./dark-places-v1-compatibility.adapter.js";
import {
  DARK_PLACES_SEMANTIC_COMPILER_STAGES,
  compileDarkPlacesSemanticLocation,
  serializeCompiledLocationDocument,
} from "./dark-places-semantic-compiler.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const fixtureDirectory = path.resolve(
  currentDirectory,
  "../../../tests/fixtures/dark-places-semantic-v2/sedlec-ossuary",
);

function readFixture(filename) {
  return JSON.parse(
    readFileSync(path.join(fixtureDirectory, filename), "utf8"),
  );
}

function createCompilerInput() {
  const legacyPack = readFixture("current-content-pack-v1.json");
  const legacyDocument = readFixture("location-document-v1.json");
  const packResult = normalizeSemanticContent(legacyPack);
  const pack = packResult.value;
  const module = pack.modules.find((entry) => entry.id === "sedlec-ossuary");
  const session = createSessionStateFromLocationDocumentV1(legacyDocument, {
    id: "sedlec-ossuary-phase2",
    seed: "semantic-v2-sedlec-baseline-001",
    moduleId: module.id,
  });
  return { legacyPack, legacyDocument, pack, module, session };
}

function expectProvenance(value) {
  expect(value?.schemaVersion).toBe("cruor-semantic-provenance-v1");
  expect(value?.sources?.length).toBeGreaterThan(0);
}

function reverseCompilerInput({ pack, module, session }) {
  const reversedModule = {
    ...module,
    components: [...module.components].reverse(),
  };
  const reverseBlocks = (room) => ({
    ...room,
    immediateImpressions: [...room.immediateImpressions].reverse(),
    visibleFeatures: [...room.visibleFeatures].reverse(),
    interactions: [...room.interactions].reverse(),
    hazards: [...room.hazards].reverse(),
    clues: [...room.clues].reverse(),
    encounterTwists: [...room.encounterTwists].reverse(),
    secrets: [...room.secrets].reverse(),
    rewards: [...room.rewards].reverse(),
    recurringSigns: [...room.recurringSigns].reverse(),
    connections: [...room.connections].reverse(),
  });
  const reversedSession = {
    ...session,
    selectedComponentIds: [...session.selectedComponentIds].reverse(),
    locationSeed: {
      ...session.locationSeed,
      siteWide: {
        ...session.locationSeed.siteWide,
        atmosphere: [...session.locationSeed.siteWide.atmosphere].reverse(),
        globalRules: [...session.locationSeed.siteWide.globalRules].reverse(),
        recurringSigns: [
          ...session.locationSeed.siteWide.recurringSigns,
        ].reverse(),
        stakesAndConsequences: [
          ...session.locationSeed.siteWide.stakesAndConsequences,
        ].reverse(),
      },
      map: {
        ...session.locationSeed.map,
        rooms: [...session.locationSeed.map.rooms].reverse(),
        connections: [...session.locationSeed.map.connections].reverse(),
      },
      rooms: [...session.locationSeed.rooms].reverse().map(reverseBlocks),
    },
  };
  return {
    pack: { ...pack, modules: [reversedModule] },
    module: reversedModule,
    session: reversedSession,
  };
}

describe("Dark Places semantic compiler Phase 2", () => {
  it("compiles the real Sedlec v1 output into a valid comparable v2 document", () => {
    const input = createCompilerInput();
    const result = compileDarkPlacesSemanticLocation(input);
    const comparison = compareLocationDocumentsV1V2(
      input.legacyDocument,
      result.document,
    );

    expect(result.valid).toBe(true);
    expect(input.session.selectedComponentIds).toHaveLength(11);
    expect(result.stages).toEqual([...DARK_PLACES_SEMANTIC_COMPILER_STAGES]);
    expect(result.document.schemaVersion).toBe("cruor-location-document-v2");
    expect(result.document.validation.status).toBe("valid");
    expect(result.document.rooms).toHaveLength(5);
    expect(result.mapIntent.rooms).toHaveLength(5);
    expect(result.mapRequest.requiredRegions).toHaveLength(5);
    expect(validateLocationDocumentV2(result.document)).toEqual([]);
    expect(comparison).toMatchObject({
      equal: true,
      differences: [],
      coverage: { legacyRooms: 5, semanticRooms: 5 },
    });
    expect(adaptLocationDocumentV2ToV1(result.document).rooms).toHaveLength(5);
  });

  it("produces byte-identical documents across repeated and reordered runs", () => {
    const input = createCompilerInput();
    const first = compileDarkPlacesSemanticLocation(input);
    const second = compileDarkPlacesSemanticLocation(input);
    const reordered = compileDarkPlacesSemanticLocation(
      reverseCompilerInput(input),
    );
    const firstBytes = serializeCompiledLocationDocument(first.document);

    expect(serializeCompiledLocationDocument(second.document)).toBe(firstBytes);
    expect(serializeCompiledLocationDocument(reordered.document)).toBe(
      firstBytes,
    );
    expect(firstBytes).toBe(serializeCanonicalSemanticContent(first.document));
  });

  it("does not mutate legacy or canonical compiler inputs", () => {
    const input = createCompilerInput();
    const before = {
      legacyPack: JSON.stringify(input.legacyPack),
      legacyDocument: JSON.stringify(input.legacyDocument),
      pack: JSON.stringify(input.pack),
      module: JSON.stringify(input.module),
      session: JSON.stringify(input.session),
    };

    compileDarkPlacesSemanticLocation(input);

    expect(JSON.stringify(input.legacyPack)).toBe(before.legacyPack);
    expect(JSON.stringify(input.legacyDocument)).toBe(before.legacyDocument);
    expect(JSON.stringify(input.pack)).toBe(before.pack);
    expect(JSON.stringify(input.module)).toBe(before.module);
    expect(JSON.stringify(input.session)).toBe(before.session);
  });

  it("attaches provenance to every generated section and semantic block", () => {
    const result = compileDarkPlacesSemanticLocation(createCompilerInput());
    expectProvenance(result.document.provenance);
    expectProvenance(result.document.identity.provenance);
    expectProvenance(result.document.siteWide.provenance);
    expectProvenance(result.document.sessionGuide.provenance);
    expectProvenance(result.document.map.provenance);

    result.document.rooms.forEach((room) => {
      expectProvenance(room.provenance);
      expectProvenance(room.readAloud.provenance);
      [
        ...room.readAloud.fragments,
        ...room.immediateImpressions,
        ...room.visibleFeatures,
        ...room.interactions,
        ...room.hazards,
        ...room.clues,
        ...room.encounterTwists,
        ...room.secrets,
        ...room.rewards,
        ...room.recurringSigns,
      ].forEach((block) => expectProvenance(block.provenance));
    });
  });

  it("emits no timestamps or renderer-specific geometry and rejects v1 input", () => {
    const input = createCompilerInput();
    const result = compileDarkPlacesSemanticLocation(input);
    const serialized = JSON.stringify(result.document);

    expect(serialized).not.toMatch(
      /createdAt|updatedAt|exportedAt|cellRect|labelPoint|contentBounds|renderPath|svg/i,
    );
    expect(() =>
      compileDarkPlacesSemanticLocation({
        pack: input.legacyPack,
        module: input.module,
        session: input.session,
      }),
    ).toThrow(/canonical|cruor-content-pack-v0\.2/i);
  });
});
