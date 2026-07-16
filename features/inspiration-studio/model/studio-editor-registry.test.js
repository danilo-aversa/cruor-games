import { describe, expect, it } from "vitest";

import { COMPONENT_SEMANTIC_TYPES } from "../../../shared/content/contracts/semantic/index.js";
import {
  STUDIO_EDITOR_REGISTRY,
  getStudioComponentFamily,
  getStudioEditorDefinition,
  listStudioEditorDefinitions,
} from "./studio-editor-registry.js";

describe("Inspiration Studio v2 editor registry", () => {
  it("resolves every shared semantic discriminant through one registry", () => {
    expect(Object.keys(STUDIO_EDITOR_REGISTRY).sort()).toEqual(
      [...COMPONENT_SEMANTIC_TYPES].sort(),
    );
    expect(listStudioEditorDefinitions()).toHaveLength(
      COMPONENT_SEMANTIC_TYPES.length,
    );
    COMPONENT_SEMANTIC_TYPES.forEach((semanticType) => {
      expect(getStudioEditorDefinition(semanticType)).toMatchObject({
        semanticType,
        editorId: expect.any(String),
        componentFamily: expect.stringMatching(
          /^(monster-graft|location-component|location-region)$/,
        ),
      });
    });
  });

  it("keeps the existing Monster editor active and activates Phase 7 semantic editors", () => {
    expect(getStudioEditorDefinition("monster-graft")).toMatchObject({
      editorId: "monster-graft",
      availability: "active",
      preservesLegacyWorkflow: true,
    });
    expect(
      getStudioComponentFamily({
        contentType: "monster-graft",
        semanticType: "monster-graft",
      }),
    ).toBe("monster-graft");
    expect(getStudioEditorDefinition("global-rule")).toMatchObject({
      editorId: "semantic-global-rule",
      availability: "active",
      validator: expect.any(Function),
      previewRenderer: expect.any(Function),
      evaluateCoverage: expect.any(Function),
    });
  });
});
