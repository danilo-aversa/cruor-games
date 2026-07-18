import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EMPTY_DRAFT, buildComponentTemplate } from "../model/studio-draft.js";
import { STUDIO_SPECIALIZED_SEMANTIC_TYPES } from "../schema/studio-semantic-editor-registry.js";
import { StudioSemanticComponentEditor } from "./StudioSemanticComponentEditor.jsx";

describe("Studio specialized semantic component editors", () => {
  it("renders normal authoring controls for every specialized semantic type without raw JSON", () => {
    STUDIO_SPECIALIZED_SEMANTIC_TYPES.forEach((semanticType) => {
      const component = buildComponentTemplate(
        `semantic-${semanticType}`,
        EMPTY_DRAFT,
      );
      const markup = renderToStaticMarkup(
        <StudioSemanticComponentEditor
          component={component}
          onChange={() => {}}
          onRemove={() => {}}
        />,
      );
      expect(markup).toContain(`data-semantic-type="${semanticType}"`);
      expect(markup).toContain("data-studio-field-path");
      expect(markup).toContain("studio-component-editor studio-editor-stack");
      expect(markup).toContain("studio-rules-group");
      expect(markup).toContain("studio-form-row");
      expect(markup).not.toContain("studio-semantic-");
      expect(markup).not.toContain("studio-raw-json-preview");
    });
  });

  it("uses compact progressive disclosure for semantic metadata, sample, and removal", () => {
    const component = buildComponentTemplate(
      "semantic-place-identity",
      EMPTY_DRAFT,
    );
    const markup = renderToStaticMarkup(
      <StudioSemanticComponentEditor
        component={component}
        onChange={() => {}}
        onRemove={() => {}}
      />,
    );

    expect(markup).toContain("studio-editor-header--compact");
    expect(markup).toContain("studio-editor-section");
    expect(markup).toContain("studio-preview-section");
    expect(markup).toContain("studio-danger-zone");
    expect(markup).toContain("Remove Component");
    expect(markup).not.toContain("studio-editor-actions");
  });

  it("renders full structured mechanics and exact field anchors for Global Rule", () => {
    const component = buildComponentTemplate(
      "semantic-global-rule",
      EMPTY_DRAFT,
    );
    const markup = renderToStaticMarkup(
      <StudioSemanticComponentEditor
        component={component}
        onChange={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(markup).toContain("semantic.trigger.events");
    expect(markup).toContain("semantic.resolution.effect.additionalText");
    expect(markup).toContain("semantic.counterplay");
    expect(markup).toContain("semantic.escalation");
  });

  it("keeps every specialized editor on the shared UI import boundary", () => {
    const editorFiles = [
      "StudioFragmentPoolEditor.jsx",
      "StudioPlacementPolicyEditor.jsx",
      "StudioSemanticComponentEditor.jsx",
      "StudioSensoryPoolEditor.jsx",
      "StudioSessionGuideEditor.jsx",
      "StudioStructuredRuleEditor.jsx",
    ];

    editorFiles.forEach((filename) => {
      const source = readFileSync(
        resolve(
          process.cwd(),
          "features/inspiration-studio/editors",
          filename,
        ),
        "utf8",
      );
      expect(source).toContain('from "../ui/index.js"');
      expect(source).not.toContain("StudioStructuredFields.jsx");
      expect(source).not.toMatch(/className=.*studio-semantic-/);
    });

    expect(
      existsSync(
        resolve(
          process.cwd(),
          "features/inspiration-studio/editors/StudioStructuredFields.jsx",
        ),
      ),
    ).toBe(false);
  });
});
