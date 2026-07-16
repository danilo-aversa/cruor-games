import { describe, expect, it } from "vitest";

import { EMPTY_DRAFT, buildComponentTemplate } from "../model/studio-draft.js";
import {
  STUDIO_SPECIALIZED_SEMANTIC_TYPES,
  createStudioSemanticDefault,
  getStudioSemanticEditorDefinition,
  listStudioSemanticEditorDefinitions,
} from "./studio-semantic-editor-registry.js";

describe("Studio semantic editor registry", () => {
  it("exposes active schema-driven definitions for every Phase 7 semantic editor", () => {
    expect(listStudioSemanticEditorDefinitions()).toHaveLength(7);
    STUDIO_SPECIALIZED_SEMANTIC_TYPES.forEach((semanticType) => {
      expect(getStudioSemanticEditorDefinition(semanticType)).toMatchObject({
        semanticType,
        editorId: `semantic-${semanticType}`,
        templateId: `semantic-${semanticType}`,
        availability: "active",
        validator: expect.any(Function),
        normalizer: expect.any(Function),
        previewRenderer: expect.any(Function),
        evaluateCoverage: expect.any(Function),
      });
      expect(createStudioSemanticDefault(semanticType)).toMatchObject({
        schemaVersion: expect.stringMatching(/^cruor-/),
      });
    });
  });

  it("creates native v2 specialized components instead of generic or legacy projections", () => {
    STUDIO_SPECIALIZED_SEMANTIC_TYPES.forEach((semanticType) => {
      const component = buildComponentTemplate(
        `semantic-${semanticType}`,
        EMPTY_DRAFT,
      );
      expect(component).toMatchObject({
        schemaVersion: "cruor-component-v2",
        semanticType,
        workflows: ["darken-location"],
        semantic: {
          schemaVersion: expect.stringMatching(/^cruor-/),
          provenance: {
            schemaVersion: "cruor-semantic-provenance-v1",
          },
        },
      });
      expect(component).not.toHaveProperty("legacyId");
    });
  });
});
