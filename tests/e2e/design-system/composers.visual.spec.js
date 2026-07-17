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
    const infoRail = page.locator(".monster-frame-info");
    await expect(infoRail.locator(".cruor-composer-rail-card").first()).toBeVisible();
    await expect(infoRail.locator(".cruor-composer-collapsible-section")).toHaveCount(0);
    const bodySlot = page.getByRole("button", { name: /open body slot/i });
    await expect(bodySlot).toBeVisible();
    await bodySlot.click();
    await page.getByRole("button", { name: /focus body/i }).first().click();
    await expect(page.getByLabel("Graft navigator drawer")).toBeVisible();
    await expectPageScreenshot(page, "monster-composer-navigator.png", { fullPage: false });
  });
  test("Monster Export centers the stat block and anchors the shared summary rail", async ({ page }) => {
    await gotoStable(page, "/terrifyingmonsters", ".monster-shell");
    const scratch = page.getByRole("button", { name: /build from scratch/i });
    await expect(scratch).toBeVisible({ timeout: 15_000 });
    await scratch.click();

    const exportButton = page.getByRole("button", { name: /^export$/i }).last();
    await expect(exportButton).toBeVisible();
    await exportButton.click();

    const workbench = page.locator(".export-workbench");
    const preview = page.locator(".export-stat-preview");
    const rail = page.getByLabel("Monster export summary");

    await expect(workbench).toBeVisible();
    await expect(preview).toBeVisible();
    await expect(rail).toBeVisible();
    await expect(rail).toHaveClass(/cruor-composer-rail--right/);
    await expect(rail).toHaveClass(/cruor-composer-rail--info/);
    await expect(rail).toHaveClass(/cruor-composer-rail--scroll/);
    const exportSections = rail.locator(".cruor-composer-collapsible-section");
    await expect(exportSections).toHaveCount(4);
    await expect(rail.locator(".cruor-composer-rail-card")).toHaveCount(0);
    await expect(rail.locator(".cruor-composer-fact-row").first()).toBeVisible();

    const statBlockSection = rail.getByRole("button", { name: "Stat Block", exact: true });
    const readinessSection = rail.getByRole("button", { name: "Export Readiness", exact: true });
    const runSheetSection = rail.getByRole("button", { name: "DM Run Sheet", exact: true });
    const rawExportSection = rail.getByRole("button", { name: "Raw Export", exact: true });

    await expect(statBlockSection).toHaveAttribute("aria-expanded", "true");
    await expect(readinessSection).toHaveAttribute("aria-expanded", "false");
    await expect(runSheetSection).toHaveAttribute("aria-expanded", "false");
    await expect(rawExportSection).toHaveAttribute("aria-expanded", "false");
    await statBlockSection.click();
    await expect(statBlockSection).toHaveAttribute("aria-expanded", "false");
    await statBlockSection.click();
    await expect(statBlockSection).toHaveAttribute("aria-expanded", "true");

    const [shellBox, previewBox, railBox] = await Promise.all([
      page.locator(".monster-shell").boundingBox(),
      preview.boundingBox(),
      rail.boundingBox(),
    ]);

    expect(shellBox).not.toBeNull();
    expect(previewBox).not.toBeNull();
    expect(railBox).not.toBeNull();

    const shellCenter = shellBox.x + shellBox.width / 2;
    const previewCenter = previewBox.x + previewBox.width / 2;
    const shellRight = shellBox.x + shellBox.width;
    const railRight = railBox.x + railBox.width;

    expect(Math.abs(previewCenter - shellCenter)).toBeLessThanOrEqual(2);
    expect(Math.abs(shellRight - railRight)).toBeLessThanOrEqual(20);
  });

});
