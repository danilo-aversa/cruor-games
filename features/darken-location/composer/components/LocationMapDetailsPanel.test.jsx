// @vitest-environment jsdom

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
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

function renderPanel(semanticPreview) {
  return renderToStaticMarkup(
    <LocationMapDetailsPanel
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
    expect(html).toContain("Sedlec Ossuary");
    expect(html).toContain("0.2.0-phase8-approved1");
    expect(html).toContain("10 Components");
    expect(html).toContain("2 Applied · 1 Map · 1 Region");
    expect(html).toContain("cruor-location-document-v2");
    expect(html).toContain("semantic-map-intent");
    expect(html).toContain("Semantic Handoff");
    expect(html).toContain("1 Sources");
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
    expect(html).toContain("1 Errors");
    expect(html).toContain("Compiler input rejected.");
  });
});
