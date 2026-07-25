import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readProjectFile(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Creator Publishing workspace", () => {
  it("uses the Content Studio tab and panel primitives", () => {
    const source = readProjectFile(
      "features/creator-studio/publishing/CreatorPublishingPage.jsx",
    );

    expect(source).toContain('className="creator-publishing inspiration-studio"');
    expect(source).toContain('className="inspiration-studio__section-tabs"');
    expect(source).toContain('className="inspiration-studio__main creator-publishing__main"');
    expect(source).toContain("<StudioTab");
  });

  it("keeps publishing data, persistence and views separated", () => {
    const source = readProjectFile(
      "features/creator-studio/publishing/CreatorPublishingPage.jsx",
    );
    const model = readProjectFile(
      "features/creator-studio/publishing/publishing.model.js",
    );

    expect(source).toContain("PublishingCalendarView");
    expect(source).toContain("PublishingSimulatorView");
    expect(source).toContain("PublishingChecklistView");
    expect(model).toContain("persistPublishingState");
    expect(model).toContain("buildEngagementForecast");
  });

  it("does not depend on the standalone HTML runtime", () => {
    const source = readProjectFile(
      "features/creator-studio/publishing/CreatorPublishingPage.jsx",
    );

    expect(source).not.toContain("document.getElementById");
    expect(source).not.toContain("querySelector");
    expect(source).not.toContain("showModal");
  });
});
