import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createLocationOutputProjection,
  resolveCanonicalLocationOutputDocument,
  serializeLocationDocumentV2Markdown,
  serializeLocationDocumentV2SessionInsert,
  serializeLocationDocumentV2TableText,
} from "./location-document-output-v2.js";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("Location Document v2 Final Output model", () => {
  it("keeps an authored v2 document canonical across every output format", () => {
    const source = readJson(
      "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary/v2-phase5-location-document.json",
    );
    const projection = createLocationOutputProjection(source);
    const markdown = serializeLocationDocumentV2Markdown(source);
    const sessionInsert = serializeLocationDocumentV2SessionInsert(source);
    const tableText = serializeLocationDocumentV2TableText(source);

    expect(projection.document.schemaVersion).toBe("cruor-location-document-v2");
    expect(projection.document.id).toBe(source.id);
    expect(projection.rooms).toHaveLength(source.rooms.length);
    expect(projection.readiness.status).toBe(source.validation.status);
    expect(markdown).toContain("Schema: `cruor-location-document-v2`");
    expect(markdown).toContain("# Room Key");
    expect(markdown).toContain("### Exits");
    expect(sessionInsert).toContain("START HERE");
    expect(sessionInsert).toContain("WHEN THEY STALL");
    expect(sessionInsert).toContain("Advance Litany by 1");
    expect(tableText).toContain("ROOMS");
    expect(tableText).toContain(source.rooms[0].readAloud.standard);
  });

  it("uses the v1 adapter only for an explicitly legacy input", () => {
    const legacy = readJson(
      "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary/location-document-v1.json",
    );
    const document = resolveCanonicalLocationOutputDocument(legacy);

    expect(document.schemaVersion).toBe("cruor-location-document-v2");
    expect(document.meta.title).toBe(legacy.meta.title);
    expect(document.rooms).toHaveLength(legacy.rooms.length);
    expect(document.provenance.migration.fromSchema).toBe(
      "dark-places-document-v1",
    );
  });

  it("keeps serializers free from React and DOM access", () => {
    const source = readFileSync(
      "features/darken-location/output/model/location-document-output-v2.js",
      "utf8",
    );

    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/\b(?:window|globalThis)\./);
    expect(source).not.toMatch(/\bdocument\.(?:body|querySelector|getElementById)/);
  });
});
