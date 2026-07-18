import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createLocationExportBundle,
  createLocationExportFilename,
} from "./location-composer-output.js";

const LOCATION_DOCUMENT = JSON.parse(
  readFileSync(
    "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary/v2-phase5-location-document.json",
    "utf8",
  ),
);

function createBundle(generatedMapPreview = null) {
  return createLocationExportBundle({
    generatedMapPreview,
    locationDocument: {
      ...LOCATION_DOCUMENT,
      meta: { ...LOCATION_DOCUMENT.meta, title: "The Ossuary Below" },
    },
    exportedAt: "2026-07-14T16:00:00.000Z",
  });
}

describe("location export bundle", () => {
  it("creates one canonical manifest for text, markdown, JSON, and SVG exports", () => {
    const bundle = createBundle({ seed: "export-seed", regions: [], corridors: [] });

    expect(bundle.schemaVersion).toBe("cruor-dark-places-export-bundle-v2");
    expect(bundle.document.schemaVersion).toBe("cruor-location-document-v2");
    expect(bundle.document.meta.title).toBe("The Ossuary Below");
    expect(bundle.baseFilename).toBe("the-ossuary-below");
    expect(Object.keys(bundle.formats)).toEqual([
      "roomKey",
      "sessionInsert",
      "tableText",
      "markdown",
      "json",
      "svg",
    ]);
    expect(bundle.formats.roomKey.filename).toBe("the-ossuary-below-room-key.md");
    expect(bundle.formats.roomKey.text).toContain(
      "Schema: `cruor-location-document-v2`",
    );
    expect(bundle.formats.sessionInsert.text).toContain(
      "Schema: cruor-location-document-v2",
    );
    expect(bundle.formats.tableText.text).toContain("ROOMS");
    expect(bundle.formats.sessionInsert.text).toContain("START HERE");
    expect(bundle.formats.tableText.text).toContain("The Ossuary Litany");
    expect(bundle.formats.svg.available).toBe(true);
    expect(bundle.formats.svg.dynamic).toBe(true);
  });

  it("uses the same export timestamp and schema in the JSON payload", () => {
    const bundle = createBundle();
    const payload = JSON.parse(bundle.formats.json.text);

    expect(payload.schemaVersion).toBe("cruor-dark-places-export-v2");
    expect(payload.documentSchemaVersion).toBe("cruor-location-document-v2");
    expect(payload.document).toEqual(bundle.document);
    expect(payload.exportedAt).toBe(bundle.exportedAt);
    expect(payload.title).toBe("The Ossuary Below");
    expect(payload.premise).toBeUndefined();
    expect(payload.regions).toBeUndefined();
    expect(bundle.formats.svg.available).toBe(false);
  });

  it("normalizes filenames without leaking punctuation or whitespace", () => {
    expect(createLocationExportFilename("  Crypt: Blood & Bone!  ")).toBe("crypt-blood-bone");
    expect(createLocationExportFilename("***")).toBe("cruor-location");
  });

  it("fails closed instead of rebuilding a legacy document", () => {
    expect(() => createLocationExportBundle()).toThrow(
      "Unsupported Location Document schema for Final Output: unversioned.",
    );
  });
});
