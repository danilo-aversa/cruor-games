import { expect, test } from "@playwright/test";

test("home, crucible, and inspirations sections mount", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner").getByText("Cruor Games")).toBeVisible();
  await expect(page.getByRole("heading", { name: /build horror for your 5e sessions/i })).toBeVisible();

  await page.getByRole("button", { name: /open the workbench/i }).click();
  await expect(page.locator("[data-location-composer-ready='true']")).toBeVisible();
  await expect(page.getByRole("main", { name: /location map stage/i })).toBeVisible();

  await page.getByRole("button", { name: "Inspirations" }).click();
  await expect(page.getByRole("main")).toContainText(/Inspirations|Source|Anchor/i);

  await page
    .getByRole("navigation", { name: /primary sections/i })
    .getByRole("button", { name: "Home", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: /build horror for your 5e sessions/i })).toBeVisible();
});

test("Darken a Location composer and map view mount", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /open the workbench/i }).click();

  await expect(page.locator("[data-location-composer-ready='true']")).toBeVisible();
  await expect(page.getByRole("main", { name: /location map stage/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /generated cruor location map/i })).toBeVisible();

  await page.locator("details.location-secondary-actions > summary").click();
  await page.getByRole("button", { name: /open map workspace/i }).click();

  await expect(page.locator("#darkenMapGeneratorPanel")).toBeVisible();
  await expect(page.locator("#darkenMapGeneratorPanel svg").first()).toBeVisible();
});

test("Build a Monster can start from scratch and open the graft navigator", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("cruor.monsterComposer.flowDockOpen", "true");
  });

  await page.goto("/");

  await page.getByRole("button", { name: /explore the monster generator/i }).click();
  await expect(page.locator(".monster-shell")).toBeVisible();

  await page.getByRole("button", { name: /build from scratch/i }).click();
  await expect(page.locator(".monster-shell")).toHaveAttribute("data-composer-started", "true");

  await page.getByRole("button", { name: /open body slot/i }).click();

  const graftNavigator = page.getByRole("region", { name: /choose body graft/i });
  await expect(graftNavigator).toBeAttached();

  const firstAddButton = graftNavigator.getByRole("button", { name: /^Add / }).first();
  await expect(firstAddButton).toBeVisible();
  await expect(firstAddButton).toBeEnabled();

  await firstAddButton.click();

  await expect(page.getByLabel("Selected graft inspector")).toContainText(/Installed/i);
});
