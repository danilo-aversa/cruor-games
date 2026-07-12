import { expect, test } from "@playwright/test";
import { VIEWPORTS, expectPageScreenshot, gotoStable, seedAccessibility } from "./helpers/visual.js";

test.describe("@visual portal and overlay ancestry", () => {
  test.setTimeout(60_000);
  test.beforeEach(async ({ page }) => {
    await seedAccessibility(page);
    await page.setViewportSize(VIEWPORTS.wide);
  });

  test("site mega menu is rendered under document.body and dismisses with Escape", async ({ page }) => {
    await gotoStable(page, "/", ".cruor-home");
    const crucible = page.getByRole("button", { name: /^crucible$/i });
    await crucible.hover();
    const portal = page.locator("body > .site-mega-menu, body > [data-site-mega-menu]").first();
    await expect(portal).toBeVisible();
    await expectPageScreenshot(page, "body-mega-menu.png", { fullPage: false });
    await page.keyboard.press("Escape");
    await expect(portal).toBeHidden();
  });

  test("Home contact dialog locks and restores document scrolling", async ({ page }) => {
    await gotoStable(page, "/", ".cruor-home");
    const opener = page.getByRole("button", { name: /contact/i }).last();
    await opener.scrollIntoViewIfNeeded();
    await opener.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await expectPageScreenshot(page, "home-contact-dialog.png", { fullPage: false });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
});
