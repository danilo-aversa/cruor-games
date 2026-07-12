import { expect, test } from "@playwright/test";
import {
  VIEWPORTS,
  expectPageScreenshot,
  gotoStable,
  openSettings,
  seedAccessibility,
} from "./helpers/visual.js";

const ROUTES = [
  { id: "home", url: "/", ready: ".cruor-home" },
  { id: "crucible-compat", url: "/?section=crucible", ready: ".app-shell[data-active-section='crucible']" },
  { id: "dark-places", url: "/darkplaces", ready: "[data-testid='dark-places-composer']" },
  { id: "dark-places-map", url: "/darkplaces/map", ready: "#darkenMapGeneratorPanel" },
  { id: "terrifying-monsters", url: "/terrifyingmonsters", ready: ".monster-shell" },
  { id: "inspirations", url: "/inspirations", ready: ".inspirations-page" },
  { id: "inspiration-studio", url: "/inspiration-studio", ready: ".inspiration-studio[data-studio-ready='true']" },
];

test.describe("@visual major route baselines", () => {
  test.beforeEach(async ({ page }) => seedAccessibility(page));

  for (const route of ROUTES) {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      test(`${route.id} ${viewportName}`, async ({ page }) => {
        test.setTimeout(60_000);
        await page.setViewportSize(viewport);
        await gotoStable(page, route.url, route.ready);
        await expect(page.locator("html")).toHaveAttribute("data-a11y-scrollbar", "custom");
        await expectPageScreenshot(page, `${route.id}-${viewportName}.png`, {
          mask: route.id === "home" ? [page.locator("video")] : [],
        });
      });
    }
  }
});

test.describe("@visual shared shell states", () => {
  test.beforeEach(async ({ page }) => {
    await seedAccessibility(page);
    await page.setViewportSize(VIEWPORTS.wide);
    await gotoStable(page, "/", ".cruor-home");
  });

  test("topbar settings open, focus-visible, disabled and selected states", async ({ page }) => {
    const { menu, trigger } = await openSettings(page);
    await expect(menu.getByRole("menuitemradio", { checked: true }).first()).toBeVisible();
    await expect(menu.locator("button[disabled]").first()).toBeDisabled();
    await expectPageScreenshot(page, "shell-settings-open.png", { fullPage: false });
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("hover and tooltip portal", async ({ page }) => {
    await gotoStable(page, "/darkplaces", "[data-testid='dark-places-composer']");
    const target = page.locator("[data-tooltip]:visible").first();
    await target.hover();
    const portal = page.locator("#cruorTooltipPortal");
    await expect(portal).toBeAttached();
    await expect(portal).toContainText(/.+/);
    await expectPageScreenshot(page, "shell-tooltip-portal.png", { fullPage: false });
  });
});
