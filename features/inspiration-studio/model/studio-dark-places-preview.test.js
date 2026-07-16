import { describe, expect, it } from "vitest";

import { SEDLEC_OSSUARY_SEMANTIC_V2_PACK } from "../../../shared/content/content.index.js";
import {
  compileStudioDarkPlacesPreview,
  nextStudioPreviewSeed,
} from "./studio-dark-places-preview.js";
import { runDarkPlacesSemanticSampleQa } from "../qa/dark-places-semantic-sample-qa.js";

function compile(controls = {}) {
  const pack = SEDLEC_OSSUARY_SEMANTIC_V2_PACK;
  return compileStudioDarkPlacesPreview({
    pack,
    module: pack.modules[0],
    controls,
  });
}

describe("Studio Dark Places deterministic preview", () => {
  it("compiles the current Sedlec module through the production semantic compiler", () => {
    const preview = compile();
    expect(preview.status).toBe("ready");
    expect(preview.document).toMatchObject({
      schemaVersion: "cruor-location-document-v2",
      rooms: expect.arrayContaining([
        expect.objectContaining({ role: "entrance" }),
        expect.objectContaining({ role: "clue" }),
        expect.objectContaining({ role: "final" }),
      ]),
    });
    expect(preview.document.rooms).toHaveLength(5);
    expect(preview.fingerprint).toMatch(/^[0-9a-f]{8}$/);
  });

  it("is byte-identical for equal controls and changes only when controls change", () => {
    const first = compile({ seed: "phase7-preview-001", roomCount: 5 });
    const second = compile({ seed: "phase7-preview-001", roomCount: 5 });
    const changed = compile({ seed: "phase7-preview-002", roomCount: 7 });
    expect(second.bytes).toBe(first.bytes);
    expect(second.fingerprint).toBe(first.fingerprint);
    expect(changed.bytes).not.toBe(first.bytes);
    expect(changed.document.rooms).toHaveLength(7);
    expect(nextStudioPreviewSeed("phase7-preview-009")).toBe(
      "phase7-preview-010",
    );
  });

  it("runs the Dark Places semantic QA cases deterministically", () => {
    const pack = SEDLEC_OSSUARY_SEMANTIC_V2_PACK;
    const report = runDarkPlacesSemanticSampleQa({
      pack,
      module: pack.modules[0],
    });
    expect(report.passed).toBe(true);
    expect(report.summary).toMatchObject({
      total: 3,
      passed: 3,
      failed: 0,
      determinismFailures: 0,
    });
    expect(report.results.every((result) => result.fingerprint)).toBe(true);
  });

  it("does not mutate canonical Studio exports", () => {
    const before = JSON.stringify(SEDLEC_OSSUARY_SEMANTIC_V2_PACK);
    compile({ seed: "phase7-preview-immutable" });
    expect(JSON.stringify(SEDLEC_OSSUARY_SEMANTIC_V2_PACK)).toBe(before);
  });
});
