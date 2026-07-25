import { describe, expect, it } from "vitest";
import {
  applyReleaseCadence,
  buildEngagementForecast,
  cloneInitialReleases,
  getSeasonDateRange,
  getShortWeekday,
} from "./publishing.model.js";

describe("publishing season model", () => {
  it("applies the three-week Monday Wednesday Friday cadence deterministically", () => {
    const releases = applyReleaseCadence(
      cloneInitialReleases(),
      "2026-07-27",
    );

    expect(releases.map((release) => release.publishDate)).toEqual([
      "2026-07-27",
      "2026-07-29",
      "2026-07-31",
      "2026-08-03",
      "2026-08-05",
      "2026-08-07",
      "2026-08-10",
      "2026-08-12",
      "2026-08-14",
    ]);
    expect(getShortWeekday(releases[0].publishDate)).toBe("MON");
    expect(getSeasonDateRange(releases)).toContain("Jul 27, 2026");
  });

  it("builds stable engagement forecasts for the same release and platform", () => {
    const release = applyReleaseCadence(
      cloneInitialReleases(),
      "2026-07-27",
    )[0];

    expect(buildEngagementForecast(release, "instagram")).toEqual(
      buildEngagementForecast(release, "instagram"),
    );
    expect(buildEngagementForecast(release, "instagram").values).toHaveLength(8);
  });
});
