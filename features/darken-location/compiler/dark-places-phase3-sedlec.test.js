import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
  serializeCanonicalSemanticContent,
} from "../../../shared/content/content.index.js";
import {
  compileDarkPlacesSemanticLocation,
  createSessionStateFromLocationDocumentV1,
  serializeCompiledLocationDocument,
} from "./index.js";

const LEGACY_DOCUMENT_PATH =
  "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary/location-document-v1.json";

function readLegacyDocument() {
  return JSON.parse(readFileSync(LEGACY_DOCUMENT_PATH, "utf8"));
}

function createPhase3Input({ intrusion = "Medium" } = {}) {
  const pack = SEDLEC_OSSUARY_SEMANTIC_V2_PACK;
  const module = pack.modules[0];
  const legacyDocument = readLegacyDocument();
  const baseSession = createSessionStateFromLocationDocumentV1(legacyDocument, {
    id: "sedlec-ossuary-phase3",
    seed: "semantic-v2-sedlec-phase3-001",
    moduleId: module.id,
    selectedComponentIds: module.components.map((component) => component.id),
    preserveLegacySemanticOverview: false,
  });
  const session = {
    ...baseSession,
    locationSeed: {
      ...baseSession.locationSeed,
      meta: { ...baseSession.locationSeed.meta, intrusion },
    },
  };
  return { pack, module, session, legacyDocument };
}

function compile(options) {
  const input = createPhase3Input(options);
  return { input, result: compileDarkPlacesSemanticLocation(input) };
}

function countWords(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

describe("Dark Places semantic compiler Phase 3 Sedlec vertical slice", () => {
  it("builds a structured 80–160 word premise covering the required identity", () => {
    const { result } = compile();
    const identity = result.document.identity;
    const premise = `${identity.historyParagraph} ${identity.currentSituationParagraph}`;

    expect(result.valid).toBe(true);
    expect(countWords(premise)).toBeGreaterThanOrEqual(80);
    expect(countWords(premise)).toBeLessThanOrEqual(160);
    expect(identity.historyParagraph).toMatch(/built|memorial/i);
    expect(identity.historyParagraph).toMatch(
      /stopped|rebuilt|removing names/i,
    );
    expect(identity.currentSituationParagraph).toMatch(
      /count each living visitor/i,
    );
    expect(identity.currentSituationParagraph).toMatch(
      /recently placed named bone/i,
    );
    expect(identity.playerEntryPoint).toMatch(/recover the named bone/i);
    expect(identity.stakes).toHaveLength(2);
    expect(premise).not.toContain(" · ");
  });

  it("renders a scaled detailed Global Rule and pressure quick reference", () => {
    const medium = compile({ intrusion: "Medium" }).result;
    const high = compile({ intrusion: "High" }).result;
    const mediumRule = medium.document.siteWide.globalRules[0];
    const highRule = high.document.siteWide.globalRules[0];

    expect(mediumRule).toMatchObject({
      id: "ossuary-litany",
      mechanics: {
        timing: "end of round",
        threshold: "2",
        savingThrow: "Wisdom DC 14",
      },
    });
    expect(mediumRule.mechanics.trigger).toMatch(/disturb remains/i);
    expect(mediumRule.mechanics.effect).toMatch(/1d6 psychic damage/i);
    expect(mediumRule.counterplay).toMatch(/reduce Litany by 1/i);
    expect(mediumRule.mechanics.escalation).toMatch(/2:|4:/);
    expect(highRule.mechanics.savingThrow).toBe("Wisdom DC 16");
    expect(highRule.mechanics.effect).toMatch(/2d6 psychic damage/i);
    expect(medium.document.sessionGuide.pressureTracks).toHaveLength(1);
    expect(medium.document.sessionGuide.pressureTracks[0].id).toBe(
      "ossuary-litany",
    );
  });

  it("keeps atmosphere, rules, signs, and stakes in separate structures", () => {
    const { result } = compile();

    expect(result.document.siteWide.atmosphere).toHaveLength(1);
    expect(result.document.siteWide.globalRules).toHaveLength(1);
    expect(result.document.siteWide.recurringSigns).toHaveLength(4);
    expect(result.document.siteWide.stakesAndConsequences).toHaveLength(2);
    result.document.siteWide.recurringSigns.forEach((sign) => {
      expect(sign.metadata.universalEffect).toBe(false);
    });
    expect(
      result.document.siteWide.atmosphere.some((block) =>
        block.text.includes("fresh rib"),
      ),
    ).toBe(false);
  });

  it("allocates every Recurring Sign within authored room bounds", () => {
    const { input, result } = compile();
    const rooms = result.document.rooms;

    input.module.components
      .filter((component) => component.semanticType === "recurring-sign")
      .forEach((component) => {
        const placed = rooms.filter((room) =>
          room.recurringSigns.some(
            (sign) => sign.sourceComponentId === component.id,
          ),
        );
        expect(placed.length, component.id).toBeGreaterThanOrEqual(
          component.semantic.placement.minimumRooms,
        );
        expect(placed.length, component.id).toBeLessThanOrEqual(
          component.semantic.placement.maximumRooms,
        );
        placed.forEach((room) => {
          expect(
            component.semantic.placement.forbiddenRoomRoles,
            `${component.id} in ${room.id}`,
          ).not.toContain(room.role);
        });
      });
    expect(rooms.some((room) => room.recurringSigns.length > 0)).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it("is byte-identical across repeated and independently reordered runs", () => {
    const { input, result: first } = compile();
    const second = compileDarkPlacesSemanticLocation(input);
    const reversedModule = {
      ...input.module,
      components: [...input.module.components].reverse(),
    };
    const reversedInput = {
      pack: { ...input.pack, modules: [reversedModule] },
      module: reversedModule,
      session: {
        ...input.session,
        selectedComponentIds: [...input.session.selectedComponentIds].reverse(),
        locationSeed: {
          ...input.session.locationSeed,
          rooms: [...input.session.locationSeed.rooms].reverse(),
        },
      },
    };
    const reordered = compileDarkPlacesSemanticLocation(reversedInput);
    const bytes = serializeCompiledLocationDocument(first.document);

    expect(serializeCompiledLocationDocument(second.document)).toBe(bytes);
    expect(serializeCompiledLocationDocument(reordered.document)).toBe(bytes);
    expect(bytes).toBe(serializeCanonicalSemanticContent(first.document));
  });

  it("does not mutate canonical input or rewrite the frozen v1 Sedlec fixture", () => {
    const input = createPhase3Input();
    const inputBefore = JSON.stringify(input);
    const legacyBytesBefore = readFileSync(LEGACY_DOCUMENT_PATH, "utf8");

    compileDarkPlacesSemanticLocation(input);

    expect(JSON.stringify(input)).toBe(inputBefore);
    expect(readFileSync(LEGACY_DOCUMENT_PATH, "utf8")).toBe(legacyBytesBefore);
  });
});
