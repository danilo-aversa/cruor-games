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
      expect(markup).not.toContain("studio-raw-json-preview");
    });
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
});
