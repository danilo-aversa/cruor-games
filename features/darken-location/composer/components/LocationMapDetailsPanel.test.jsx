// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocationMapDetailsPanel } from "./LocationMapDetailsPanel.jsx";

function createSemanticPreview(overrides = {}) {
  return {
    valid: true,
    input: {
      moduleId: "sedlec-ossuary",
      moduleVersion: "0.2.0-phase8-approved1",
    },
    baseline: {
      module: { title: "Sedlec Ossuary" },
      components: Array.from({ length: 10 }, (_, index) => ({
        id: `semantic-${index + 1}`,
      })),
    },
    document: { schemaVersion: "cruor-location-document-v2" },
    mapRequest: { source: "semantic-map-intent" },
    overrides: {
      operations: [
        { scope: "map", strategy: "append" },
        { scope: "region", strategy: "replace", regionId: "room-2" },
      ],
    },
    diagnostics: [],
    provenance: {
      document: { sources: [{ sourceAnchorId: "sedlec-ossuary" }] },
    },
    ...overrides,
  };
}

function renderPanel(semanticPreview, uiMode = "debug", debugMode = false) {
  return renderToStaticMarkup(
    <LocationMapDetailsPanel
      uiMode={uiMode}
      debugMode={debugMode}
      generatedMapPreview={null}
      mapRequest={{ requiredRegions: [] }}
      semanticMapHandoff={{
        schemaVersion: "cruor-dark-places-semantic-map-handoff-v1",
        mode: "semantic",
      }}
      semanticPreview={semanticPreview}
      state={{
        title: "The Ossuary Below",
        context: "Crypt",
        horror: "Religious Horror",
        horrors: ["Religious Horror"],
        sourceAnchors: ["Sedlec Ossuary"],
        locationRegions: [],
        slotAssignments: {},
      }}
    />,
  );
}

describe("Location semantic runtime rail", () => {
  it("shows compiler validity, document, map request, baseline, and provenance", () => {
    const html = renderPanel(createSemanticPreview());

    expect(html).toContain('data-testid="dark-places-semantic-preview"');
    expect(html).toContain('data-semantic-valid="true"');
    expect(html).toContain("Semantic Runtime");
    expect(html).toContain("location-semantic-runtime__title");
    expect(html).toContain("location-semantic-runtime__status is-valid");
    expect(html).toContain("Sedlec Ossuary");
    expect(html).toContain("0.2.0-phase8-approved1");
    expect(html).toContain("10 Components");
    expect(html).toContain("2 Applied · 1 Map · 1 Region");
    expect(html).toContain("cruor-location-document-v2");
    expect(html).toContain("semantic-map-intent");
    expect(html).toContain("Semantic Handoff");
    expect(html).toContain("1 Sources");
  });

  it("hides semantic runtime outside the site Debug mode", () => {
    const simpleHtml = renderPanel(createSemanticPreview(), "simple");
    const advancedHtml = renderPanel(createSemanticPreview(), "advanced");
    const localDebugHtml = renderPanel(createSemanticPreview(), "simple", true);

    expect(simpleHtml).not.toContain('data-testid="dark-places-semantic-preview"');
    expect(advancedHtml).not.toContain('data-testid="dark-places-semantic-preview"');
    expect(localDebugHtml).not.toContain('data-testid="dark-places-semantic-preview"');
  });

  it("shows structured compiler diagnostics without hiding invalid state", () => {
    const html = renderPanel(
      createSemanticPreview({
        valid: false,
        document: null,
        diagnostics: [
          {
            code: "semantic-preview.compile-failed",
            severity: "error",
            path: "semanticPreview",
            message: "Compiler input rejected.",
          },
        ],
      }),
    );

    expect(html).toContain('data-semantic-valid="false"');
    expect(html).toContain("Needs Review");
    expect(html).toContain("location-semantic-runtime__status is-review");
    expect(html).toContain("1 Errors");
    expect(html).toContain("Compiler input rejected.");
  });
});

describe("Location map build actions", () => {
  it("arms each destructive action on the first click and confirms on the second", () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const container = document.createElement("div");
    const root = createRoot(container);
    const onRegenerateMap = vi.fn();
    const onRefreshSeed = vi.fn();

    act(() => {
      root.render(
        <LocationMapDetailsPanel
          mapRequest={{ requiredRegions: [] }}
          onRegenerateMap={onRegenerateMap}
          onRefreshSeed={onRefreshSeed}
          state={{
            title: "The Ossuary Below",
            context: "Crypt",
            horrors: ["Religious Horror"],
            sourceAnchors: ["Sedlec Ossuary"],
            locationRegions: [],
            slotAssignments: {},
          }}
        />,
      );
    });

    const regenerate = container.querySelector('[data-testid="dark-places-generate"]');
    act(() => regenerate.click());
    expect(onRegenerateMap).not.toHaveBeenCalled();
    expect(regenerate.classList.contains("is-armed")).toBe(true);
    expect(regenerate.textContent).toContain("Confirm Regenerate");

    act(() => regenerate.click());
    expect(onRegenerateMap).toHaveBeenCalledTimes(1);

    const refresh = container.querySelector('[data-testid="dark-places-new-seed"]');
    act(() => refresh.click());
    expect(onRefreshSeed).not.toHaveBeenCalled();
    expect(refresh.classList.contains("is-armed")).toBe(true);

    act(() => refresh.click());
    expect(onRefreshSeed).toHaveBeenCalledTimes(1);

    act(() => root.unmount());
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  });
});
