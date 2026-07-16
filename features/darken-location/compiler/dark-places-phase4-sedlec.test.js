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
    id: "sedlec-ossuary-phase4",
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

function countWords(value) {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}

describe("Dark Places semantic compiler Phase 4 Sedlec vertical slice", () => {
  it("allocates three exact-unique Immediate Impressions to all five rooms", () => {
    const result = compile();
    const impressions = result.document.rooms.flatMap((room) =>
      room.immediateImpressions.map((block) => block.text),
    );

    expect(result.valid).toBe(true);
    expect(result.document.rooms).toHaveLength(5);
    expect(new Set(impressions).size).toBe(impressions.length);
    result.document.rooms.forEach((room) => {
      expect(room.immediateImpressions).toHaveLength(3);
      expect(
        room.immediateImpressions.filter((block) => block.metadata.contextKind),
      ).toHaveLength(1);
      room.immediateImpressions.forEach((block) => {
        expect(block.metadata.sourceFragmentId).toBeTruthy();
        expect(["low", "medium", "high"]).toContain(block.metadata.intensity);
      });
    });
  });

  it("composes all Read-Aloud variants inside their authored ranges", () => {
    const result = compile();

    expect(result.diagnostics).toEqual([]);
    result.document.rooms.forEach((room) => {
      expect(countWords(room.readAloud.compact)).toBeGreaterThanOrEqual(20);
      expect(countWords(room.readAloud.compact)).toBeLessThanOrEqual(35);
      expect(countWords(room.readAloud.standard)).toBeGreaterThanOrEqual(45);
      expect(countWords(room.readAloud.standard)).toBeLessThanOrEqual(75);
      expect(countWords(room.readAloud.extended)).toBeGreaterThanOrEqual(80);
      expect(countWords(room.readAloud.extended)).toBeLessThanOrEqual(120);
      expect(room.readAloud.fragments.length).toBeGreaterThanOrEqual(6);
      room.readAloud.fragments.forEach((fragment) => {
        expect(fragment.metadata.sourceFragmentId).toBeTruthy();
        expect(fragment.provenance.sources.length).toBeGreaterThan(0);
      });
    });
  });

  it("keeps GM-only and future-reveal fragments out of player text", () => {
    const result = compile();
    const playerText = result.document.rooms
      .flatMap((room) => [
        room.readAloud.compact,
        room.readAloud.standard,
        room.readAloud.extended,
      ])
      .join("\n");
    const fragmentMetadata = result.document.rooms.flatMap((room) =>
      room.readAloud.fragments.map((fragment) => fragment.metadata),
    );

    expect(playerText).not.toMatch(/hidden initial/i);
    expect(playerText).not.toMatch(/room that has no visible door/i);
    expect(JSON.stringify(fragmentMetadata)).not.toMatch(
      /gm-only|future-reveal|secret|solution/i,
    );
  });

  it("uses the standard variant in the v1 output/export compatibility view", () => {
    const result = compile();
    const output = adaptLocationDocumentV2ToV1(result.document);

    output.rooms.forEach((room) => {
      const source = result.document.rooms.find(
        (candidate) => candidate.id === room.id,
      );
      expect(room.readAloud).toHaveLength(1);
      expect(room.readAloud[0].text).toBe(source.readAloud.standard);
      expect(room.readAloud[0].metadata.exportVariant).toBe("standard");
      expect(room.readAloud[0].metadata.variants.compact).toBe(
        source.readAloud.compact,
      );
      expect(room.readAloud[0].metadata.variants.extended).toBe(
        source.readAloud.extended,
      );
    });
  });

  it("does not rewrite unrelated room output after a local room change", () => {
    const input = createInput();
    const first = compile(input);
    const changed = compile({
      ...input,
      session: {
        ...input.session,
        locationSeed: {
          ...input.session.locationSeed,
          rooms: input.session.locationSeed.rooms.map((room) =>
            room.id === "location-region-1"
              ? {
                  ...room,
                  name: "01 Ruined Vestibule",
                }
              : room,
          ),
        },
      },
    });

    first.document.rooms
      .filter((room) => room.id !== "location-region-1")
      .forEach((room) => {
        const changedRoom = changed.document.rooms.find(
          (candidate) => candidate.id === room.id,
        );
        expect(changedRoom.immediateImpressions).toEqual(
          room.immediateImpressions,
        );
        expect(changedRoom.readAloud).toEqual(room.readAloud);
      });
    expect(
      changed.document.rooms.find((room) => room.id === "location-region-1")
        .readAloud.standard,
    ).not.toBe(
      first.document.rooms.find((room) => room.id === "location-region-1")
        .readAloud.standard,
    );
  });

  it("is deterministic, immutable, and preserves the frozen v1 fixture", () => {
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
    expect(Object.isFrozen(first.document.rooms[0].readAloud)).toBe(true);
  });
});
