import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readProjectFile(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Creator Studio workspace integration", () => {
  it("keeps the breadcrumb as the only page-level heading chrome", () => {
    const homeSource = readProjectFile(
      "features/creator-studio/CreatorStudioHomePage.jsx",
    );
    const contentSource = readProjectFile(
      "features/inspiration-studio/InspirationStudioPage.jsx",
    );

    expect(homeSource).not.toContain("inspiration-studio__header");
    expect(homeSource).not.toContain("Creator Workspace");
    expect(contentSource).not.toContain("Admin Content Studio");
    expect(contentSource).not.toContain("inspiration-studio__header--editing");
  });

  it("loads the Content Studio lazily behind a visible progress fallback", () => {
    const source = readProjectFile(
      "features/creator-studio/CreatorStudioPage.jsx",
    );

    expect(source).toContain("const InspirationStudioPage = lazy(");
    expect(source).toContain("<Suspense fallback={null}>");
    expect(source).toContain("creator-studio__loading-bar");
    expect(source).toContain("requestAnimationFrame");
    expect(source).toContain("CONTENT_STUDIO_LOADING_BUFFER_MS = 2000");
    expect(source).toContain("onReady={handleContentReady}");
  });

  it("routes global tools through the dedicated Operations workspace", () => {
    const creatorSource = readProjectFile(
      "features/creator-studio/CreatorStudioPage.jsx",
    );
    const contentSource = readProjectFile(
      "features/inspiration-studio/InspirationStudioPage.jsx",
    );

    expect(creatorSource).toContain('id: "operations"');
    expect(creatorSource).toContain('href: "/creator-studio/operations"');
    expect(creatorSource).toContain("<CreatorOperationsPage />");
    expect(creatorSource).toContain('id: "publishing"');
    expect(creatorSource).toContain('href: "/creator-studio/publishing"');
    expect(creatorSource).toContain("<CreatorPublishingPage />");
    expect(contentSource).not.toContain("<StudioToolsMenu");
    expect(contentSource).not.toContain("<StudioTestsMenu");
    expect(contentSource).not.toContain("<GraftLedgerModal");
    expect(contentSource).not.toContain("<MonsterBatchQaModal");
  });
});
