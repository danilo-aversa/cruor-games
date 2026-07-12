import { expect, test } from "@playwright/test";
import { VIEWPORTS, expectPageScreenshot, gotoStable, seedAccessibility } from "./helpers/visual.js";

test.describe("@visual Composer regression boundaries", () => {
  test.setTimeout(60_000);
  test.beforeEach(async ({ page }) => {
    await seedAccessibility(page);
    await page.setViewportSize(VIEWPORTS.wide);
  });

  test("Dark Places rails, collapsible section, navigator portal and immersive cleanup", async ({ page }) => {
    await gotoStable(page, "/darkplaces", "[data-testid='dark-places-composer']");
    await expect(page.locator(".location-composer__rail--left")).toBeVisible();
    await expect(page.locator(".location-composer__rail--right")).toBeVisible();

    const collapsible = page.locator(".cruor-composer-collapsible-section__trigger").first();
    await expect(collapsible).toHaveAttribute("aria-expanded", /true|false/);
    await collapsible.focus();
    await collapsible.press("Enter");
    await expectPageScreenshot(page, "dark-places-rails-collapsible.png", { fullPage: false });

    const immersive = page.getByTestId("dark-places-immersive-mode");
    await immersive.focus();
    await immersive.press("Enter");
    await expect(immersive).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await expectPageScreenshot(page, "dark-places-immersive.png", { fullPage: false });
    await immersive.press("Enter");
    await expect(immersive).toHaveAttribute("aria-pressed", "false");
    await page.goto("/inspirations");
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test("Monster Composer rails and Component Navigator", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("cruor.monsterComposer.flowDockOpen", "true"));
    await gotoStable(page, "/terrifyingmonsters", ".monster-shell");
    const scratch = page.getByRole("button", { name: /build from scratch/i });
    await expect(scratch).toBeVisible({ timeout: 15_000 });
    await scratch.click();
    await expect(page.locator(".monster-shell")).toHaveAttribute("data-composer-started", "true");
    await expect(page.locator(".cruor-composer-rail[data-composer-rail-side]").first()).toBeVisible();
    const bodySlot = page.getByRole("button", { name: /open body slot/i });
    await expect(bodySlot).toBeVisible();
    await bodySlot.click();
    await page.getByRole("button", { name: /focus body/i }).first().click();
    await expect(page.getByLabel("Graft navigator drawer")).toBeVisible();
    await expectPageScreenshot(page, "monster-composer-navigator.png", { fullPage: false });
  });
});
