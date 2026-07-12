import { expect, test } from "@playwright/test";
import { gotoStable, seedAccessibility } from "./helpers/visual.js";
import { expectVerticalScrollOwner, inspectScrollChain } from "./helpers/scroll.js";

test.describe("scroll ownership contracts", () => {
  test.beforeEach(async ({ page }) => seedAccessibility(page));

  test("Dark Places wide details owns rail scrolling without a competing rail owner", async ({ page }) => {
    await gotoStable(page, "/darkplaces", "[data-testid='dark-places-composer']");
    const details = page.locator(".location-map-wide-details-block");
    await expect(details).toBeVisible();
    await expectVerticalScrollOwner(details);
    await expect(page.locator(".location-map-frame-rail")).toHaveCSS("overflow-y", "hidden");
  });

  test("Monster and Studio expose intentional named scroll owners", async ({ page }) => {
    await gotoStable(page, "/terrifyingmonsters", ".monster-shell");
    const monsterList = page.locator(".monster-anatomy__navigator-list").first();
    if (await monsterList.isVisible()) {
      const chain = await inspectScrollChain(monsterList);
      expect(["auto", "scroll"]).toContain(chain[0].overflowY);
    }

    await gotoStable(page, "/inspiration-studio", ".inspiration-studio");
    const libraryToggle = page.getByRole("button", { name: "Inspiration library" });
    if (await libraryToggle.isVisible()) await libraryToggle.click();
    const studioList = page.getByRole("list", { name: "Available inspirations" });
    const chain = await inspectScrollChain(studioList);
    expect(["auto", "scroll"]).toContain(chain[0].overflowY);
  });

  test("route viewport locks clean up after navigation", async ({ page }) => {
    await gotoStable(page, "/inspiration-studio", ".inspiration-studio");
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await page.goto("/inspirations");
    await expect(page.locator(".inspirations-page")).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    expect(await page.evaluate(() => document.scrollingElement.scrollHeight >= document.scrollingElement.clientHeight)).toBe(true);
  });

  test.fixme("Component Navigator has one vertical scroll owner", async ({ page }) => {
    await gotoStable(page, "/darkplaces", "[data-testid='dark-places-composer']");
    const navigator = page.getByTestId("dark-places-room-navigator");
    await expectVerticalScrollOwner(navigator);
  });

  test.fixme("map UI does not create competing body and panel scrollbars", async ({ page }) => {
    await gotoStable(page, "/darkplaces/map", "#darkenMapGeneratorPanel");
    const panel = page.locator("#darkenMapGeneratorPanel");
    const chain = await inspectScrollChain(panel);
    expect(chain.filter((item) => item.scrollable && ["auto", "scroll"].includes(item.overflowY))).toHaveLength(1);
  });
});
