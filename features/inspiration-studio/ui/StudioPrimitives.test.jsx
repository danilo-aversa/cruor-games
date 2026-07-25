import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  StudioAdvancedDetails,
  StudioArmedDeleteButton,
  StudioCollectionEditor,
  StudioCollapsibleSection,
  StudioDangerZone,
  StudioDividerLabel,
  StudioEditorHeader,
  StudioEditorSection,
  StudioField,
  StudioInput,
  StudioPanelTitle,
  StudioPreviewSection,
  StudioSelect,
  StudioTab,
  StudioTabs,
  StudioWarningSummary,
  openStudioDisclosuresForField,
} from "./index.js";

function render(node) {
  return renderToStaticMarkup(<div className="inspiration-studio">{node}</div>);
}

describe("Content Studio UI primitives", () => {
  it("preserves stable field anchors and accessible labels", () => {
    const markup = render(
      <StudioField
        componentId="component-one"
        icon="fa-signature"
        label="Title"
        path="semantic.title"
      >
        {({ id }) => <StudioInput id={id} onChange={() => {}} value="Example" />}
      </StudioField>,
    );

    expect(markup).toContain('data-studio-field-path="semantic.title"');
    expect(markup).toContain('id="studio-field-component-one-semantic-title"');
    expect(markup).toContain('for="studio-field-component-one-semantic-title"');
  });

  it("renders shared tabs and controls without domain classes", () => {
    const markup = render(
      <StudioTabs label="Component families">
        <StudioTab active count={2} icon="fa-skull" label="Monsters" />
        <StudioTab count={3} icon="fa-map-location-dot" label="Locations" />
      </StudioTabs>,
    );

    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).not.toContain("semantic-editor");
  });

  it("renders collection items collapsed by default", () => {
    const markup = render(
      <StudioCollectionEditor
        addLabel="Add Entry"
        items={[{ id: "one", title: "First" }, { id: "two", title: "Second" }]}
        getItemLabel={(item) => item.title}
        onAdd={() => {}}
        onRemove={() => {}}
      >
        {(item) => (
          <StudioField label="Value">
            <StudioSelect options={[[item.id, item.title]]} value={item.id} />
          </StudioField>
        )}
      </StudioCollectionEditor>,
    );

    expect((markup.match(/<details/g) || []).length).toBe(2);
    expect((markup.match(/ open=""/g) || []).length).toBe(0);
    expect(markup).not.toContain("defaultOpen");
    expect(markup).toContain("Add Entry");
  });

  it("maps disclosure defaults to the native open attribute", () => {
    const markup = render(
      <>
        <StudioCollapsibleSection defaultOpen title="Primary">
          Primary content
        </StudioCollapsibleSection>
        <StudioAdvancedDetails defaultOpen>Advanced content</StudioAdvancedDetails>
        <StudioPreviewSection defaultOpen>Preview content</StudioPreviewSection>
      </>,
    );

    expect((markup.match(/<details/g) || []).length).toBe(3);
    expect((markup.match(/ open=""/g) || []).length).toBe(3);
    expect(markup).not.toContain("defaultOpen");
  });

  it("keeps semantic editor sections collapsed by default", () => {
    const markup = render(
      <StudioEditorSection title="Metadata">
        <StudioField label="Title">
          <StudioInput value="Example" />
        </StudioField>
      </StudioEditorSection>,
    );

    expect(markup).toContain("studio-editor-section");
    expect(markup).toContain("studio-rules-group--collapsible");
    expect(markup).not.toMatch(/<details[^>]* open=""/);
  });

  it("opens every nested disclosure containing an invalid field", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <details id="section">
        <div>
          <details id="item">
            <input id="studio-field-example-semantic-items-0-text" />
          </details>
        </div>
      </details>
    `;
    document.body.append(root);

    expect(
      openStudioDisclosuresForField(
        root,
        "studio-field-example-semantic-items-0-text",
      ),
    ).toBe(true);
    expect(root.querySelector("#section").open).toBe(true);
    expect(root.querySelector("#item").open).toBe(true);

    root.remove();
  });

  it("keeps warnings, preview chrome, and danger actions progressively disclosed", () => {
    const markup = render(
      <>
        <StudioEditorHeader
          coverageLabel="Needs Work"
          coverageStatus="partial"
          status="draft"
          title="Example Component"
          typeLabel="Global Rule"
        />
        <StudioWarningSummary
          warnings={[
            {
              id: "warning-one",
              severity: "editorial",
              area: "Component",
              path: "semantic.title",
              message: "Add a title.",
              suggestedFix: "Author a title.",
            },
          ]}
        />
        <StudioDangerZone>Remove action</StudioDangerZone>
      </>,
    );

    expect(markup).toContain("0 blocking · 1 editorial · 0 suggestions · 0 legacy");
    expect(markup).toContain("studio-danger-zone");
    expect(markup).not.toContain('class="studio-danger-zone" open');
  });

  it("renders the Monsters baseline compositions from the shared library", () => {
    const markup = render(
      <>
        <StudioPanelTitle
          eyebrow="Linked Components"
          help="Edit generator content."
          icon="fa-diagram-project"
          title="Generator Content"
        />
        <StudioDividerLabel
          help="Generated rules prose."
          icon="fa-scroll"
          title="Stat Block Text"
          zone="output"
        />
        <StudioArmedDeleteButton onConfirm={() => {}} />
      </>,
    );

    const titleIndex = markup.indexOf('class="studio-panel__title"');
    const helpIndex = markup.indexOf('class="studio-help"');
    const actionsIndex = markup.indexOf('class="studio-panel__actions"');

    expect(markup).toContain("studio-panel__heading");
    expect(helpIndex).toBeGreaterThan(titleIndex);
    expect(helpIndex).toBeLessThan(actionsIndex);
    expect(markup).toContain('data-editor-zone="output"');
    expect(markup).toContain("Remove Component");
    expect(markup).toContain("studio-inline-action--danger");
  });

  it("keeps collapsible help beside the title instead of in the tools rail", () => {
    const markup = render(
      <StudioCollapsibleSection help="Section guidance" title="Identity">
        Content
      </StudioCollapsibleSection>,
    );

    const titleStart = markup.indexOf('class="studio-rules-group__title"');
    const helpIndex = markup.indexOf('class="studio-help"');
    const titleEnd = markup.indexOf("</span>", titleStart);
    const toolsIndex = markup.indexOf('class="studio-rules-group__tools"');

    expect(helpIndex).toBeGreaterThan(titleStart);
    expect(helpIndex).toBeLessThan(titleEnd);
    expect(toolsIndex).toBeGreaterThan(titleEnd);
  });

  it("keeps the page migrated away from local primitive declarations", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "features/inspiration-studio/InspirationStudioPage.jsx",
      ),
      "utf8",
    );
    const removedLocalPrimitives = [
      "HelpTooltip",
      "FormRow",
      "TextInput",
      "TextArea",
      "SelectInput",
      "StudioTabButton",
      "PanelTitle",
      "DividerLabel",
      "RulesGroup",
      "ArmedDeleteButton",
      "Icon",
    ];

    expect(source).toContain('from "./ui/index.js"');
    expect(source).toContain("<StudioField");
    expect(source).toContain("<StudioCollapsibleSection");
    expect(source).toContain("<StudioSemanticComponentEditor");
    expect(source).toContain('title="Components"');
    expect(source).toContain('role={componentListCollapsed ? "button" : undefined}');
    expect(source).not.toContain("defaultOpen");
    expect(source).not.toContain("getSectionCount");
    removedLocalPrimitives.forEach((name) => {
      expect(source).not.toMatch(new RegExp(`function ${name}\\b`));
    });
  });

  it("resets disclosure state and opens warning targets per component", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "features/inspiration-studio/InspirationStudioPage.jsx",
      ),
      "utf8",
    );

    expect(source).toContain("openStudioDisclosuresForField");
    expect(source).toContain("selectionKey={`${componentMode}:");
    expect(source).toContain("key={`semantic-${selectionKey}`}");
    expect(source).toContain("key={`advanced-${selectionKey}`}");
    expect(source).toContain("key={`warnings-${selectionKey}`}");
    expect(source).toContain("<StudioWarningSummary");
    expect(source).not.toContain("studio-component-editor-warning-panel");
  });

  it("keeps primitive CSS ownership singular after cleanup", () => {
    const indexSource = readFileSync(
      resolve(process.cwd(), "features/inspiration-studio/inspiration-studio.index.js"),
      "utf8",
    );
    const pageCss = readFileSync(
      resolve(process.cwd(), "features/inspiration-studio/inspiration-studio.styles.css"),
      "utf8",
    );
    const primitiveCss = readFileSync(
      resolve(process.cwd(), "features/inspiration-studio/ui/studio-primitives.css"),
      "utf8",
    );
    const controlsSource = readFileSync(
      resolve(process.cwd(), "features/inspiration-studio/ui/StudioControls.jsx"),
      "utf8",
    );

    expect(indexSource.indexOf("studio-primitives.css")).toBeLessThan(
      indexSource.indexOf("inspiration-studio.styles.css"),
    );
    expect(pageCss).not.toMatch(/^\.studio-form-grid\s*\{/m);
    expect(pageCss).not.toMatch(/^\.studio-rules-group\s*\{/m);
    expect(pageCss).not.toMatch(/^\.studio-warning-summary\s*\{/m);
    expect(pageCss).not.toContain(".studio-tab-button.is-active");
    expect(pageCss).not.toContain('.studio-tab-button[aria-pressed="true"]');
    expect(primitiveCss).toContain('.studio-tab-button[aria-selected="true"]');
    expect(controlsSource).toContain("aria-selected={active}");
    expect(controlsSource).not.toContain('active ? "is-active"');
  });

});
