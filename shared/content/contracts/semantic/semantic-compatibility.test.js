import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeSemanticContent,
  serializeCanonicalSemanticContent,
} from "./index.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const fixtureDirectory = path.resolve(
  currentDirectory,
  "../../../../tests/fixtures/dark-places-semantic-v2/sedlec-ossuary",
);

function readFixture(filename) {
  return JSON.parse(
    readFileSync(path.join(fixtureDirectory, filename), "utf8"),
  );
}

function collectObjectKeys(value, keys = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectObjectKeys(entry, keys));
    return keys;
  }
  if (!value || typeof value !== "object") return keys;
  Object.entries(value).forEach(([key, entry]) => {
    keys.add(key);
    collectObjectKeys(entry, keys);
  });
  return keys;
}

describe("semantic v1 compatibility boundary", () => {
  it("loads the real Sedlec v1 module as a valid v2 draft without mutation", () => {
    const input = readFixture("current-inspiration-module-v1.json");
    const before = JSON.stringify(input);
    const result = normalizeSemanticContent(input);

    expect(result.mode).toBe("v1-compatibility");
    expect(result.kind).toBe("inspiration-module");
    expect(result.valid).toBe(true);
    expect(result.value.schemaVersion).toBe(
      SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    );
    expect(result.value.status).toBe("draft");
    expect(result.value.components).toHaveLength(28);
    expect(result.value.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
    ]);
    expect(result.value.provenance.migration.method).toBe(
      "compatibility-normalized",
    );
    expect(result.value.provenance.migration.editorialDecision).toBe(
      "needs-revision",
    );
    expect(
      result.diagnostics.filter((issue) => issue.severity === "error"),
    ).toEqual([]);
    expect(result.diagnostics.map((issue) => issue.code)).toContain(
      "compatibility.legacy-module-normalized",
    );
    expect(JSON.stringify(input)).toBe(before);

    const keys = collectObjectKeys(result.value);
    expect(keys.has("legacyId")).toBe(false);
    expect(keys.has("imageUrl")).toBe(false);
    expect(keys.has("imageNote")).toBe(false);
    expect(keys.has("moduleRole")).toBe(false);
  });

  it("loads the real Sedlec v1 pack as one valid v2 draft module", () => {
    const input = readFixture("current-content-pack-v1.json");
    const result = normalizeSemanticContent(input);

    expect(result.mode).toBe("v1-compatibility");
    expect(result.kind).toBe("content-pack");
    expect(result.valid).toBe(true);
    expect(result.value.schemaVersion).toBe(
      SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
    );
    expect(result.value.modules).toHaveLength(1);
    expect(result.value.modules[0].id).toBe("sedlec-ossuary");
    expect(result.value.modules[0].packId).toBe(result.value.id);
    expect(result.value.modules[0].components).toHaveLength(28);
  });

  it("round-trips normalized v2 content without a v1 write", () => {
    const legacy = readFixture("current-inspiration-module-v1.json");
    const first = normalizeSemanticContent(legacy);
    const second = normalizeSemanticContent(first.value);

    expect(second.mode).toBe("v2");
    expect(second.valid).toBe(true);
    expect(serializeCanonicalSemanticContent(second.value)).toBe(
      serializeCanonicalSemanticContent(first.value),
    );
  });

  it("reports unsupported inputs instead of inventing fallback content", () => {
    const result = normalizeSemanticContent({ schemaVersion: "unknown-v9" });
    expect(result.valid).toBe(false);
    expect(result.value).toBeNull();
    expect(result.diagnostics.map((issue) => issue.code)).toEqual([
      "semantic-normalizer.unsupported-schema",
    ]);
  });
});
