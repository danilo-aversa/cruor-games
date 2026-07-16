import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { normalizeSemanticContent } from "../../../shared/content/content.index.js";
import { createSessionStateFromLocationDocumentV1 } from "./dark-places-v1-compatibility.adapter.js";
import {
  DARK_PLACES_MAP_INTENT_SCHEMA_VERSION,
  DARK_PLACES_SEMANTIC_MAP_REQUEST_SCHEMA_VERSION,
  adaptDarkPlacesMapIntentToMapRequest,
  createDarkPlacesMapIntent,
  serializeDarkPlacesMapIntent,
} from "./dark-places-map-intent.adapter.js";

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

function createInput() {
  const pack = normalizeSemanticContent(
    readFixture("current-content-pack-v1.json"),
  ).value;
  const module = pack.modules[0];
  const session = createSessionStateFromLocationDocumentV1(
    readFixture("location-document-v1.json"),
    {
      id: "sedlec-map-intent-phase2",
      seed: "semantic-v2-sedlec-baseline-001",
      moduleId: module.id,
    },
  );
  return { module, session };
}

describe("Dark Places semantic map-intent adapter", () => {
  it("creates one stable semantic intent and current map-request boundary", () => {
    const input = createInput();
    const intent = createDarkPlacesMapIntent(input);
    const request = adaptDarkPlacesMapIntentToMapRequest(intent);

    expect(intent.schemaVersion).toBe(DARK_PLACES_MAP_INTENT_SCHEMA_VERSION);
    expect(intent.rooms).toHaveLength(5);
    expect(intent.components).toHaveLength(11);
    expect(intent.provenance.schemaVersion).toBe(
      "cruor-semantic-provenance-v1",
    );
    expect(request.schemaVersion).toBe(
      DARK_PLACES_SEMANTIC_MAP_REQUEST_SCHEMA_VERSION,
    );
    expect(request.source).toBe("semantic-map-intent");
    expect(request.requiredRegions).toHaveLength(5);
    expect(request.connections.length).toBeGreaterThan(0);
  });

  it("is byte-deterministic and strips renderer geometry", () => {
    const input = createInput();
    const first = createDarkPlacesMapIntent(input);
    const second = createDarkPlacesMapIntent(input);
    const bytes = serializeDarkPlacesMapIntent(first);

    expect(serializeDarkPlacesMapIntent(second)).toBe(bytes);
    expect(bytes).not.toMatch(
      /cellRect|labelPoint|contentBounds|renderPath|svg|createdAt|updatedAt/i,
    );
    expect(Object.isFrozen(first.rooms[0])).toBe(true);
  });

  it("rejects non-canonical module and session inputs", () => {
    const input = createInput();
    expect(() =>
      createDarkPlacesMapIntent({
        module: { ...input.module, schemaVersion: "legacy-module-v1" },
        session: input.session,
      }),
    ).toThrow(/canonical Inspiration Module v2/);
  });
});
