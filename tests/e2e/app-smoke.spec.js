import { expect, test } from "@playwright/test";

test("home, crucible, and inspirations sections mount", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner").getByText("Cruor Games")).toBeVisible();
  await expect(page.getByRole("heading", { name: /the dark fantasy workbench for 5e/i })).toBeVisible();

  await page.getByRole("link", { name: /open dark places generator/i }).click();
  await expect(page.locator("[data-location-composer-ready='true']")).toBeVisible();
  await expect(page.getByRole("main", { name: /location map stage/i })).toBeVisible();

  await page.getByRole("link", { name: "Inspirations" }).click();
  await expect(page.getByRole("main")).toContainText(/Inspirations|Source|Anchor/i);

  await page
    .getByRole("navigation", { name: /primary sections/i })
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: /the dark fantasy workbench for 5e/i })).toBeVisible();
});

test("Darken a Location composer and map view mount", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /open dark places generator/i }).click();

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

  await page.getByRole("link", { name: /open terrifying monster generator/i }).click();
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

test("site navigation exposes real internal links", async ({ page }) => {
  await page.goto("/");

  const primaryNavigation = page.getByRole("navigation", {
    name: /primary sections/i,
  });

  await expect(
    primaryNavigation.getByRole("link", { name: "Home", exact: true }),
  ).toHaveAttribute("href", "/");
  await expect(
    primaryNavigation.getByRole("link", { name: "Inspirations", exact: true }),
  ).toHaveAttribute("href", "/inspirations");

  await primaryNavigation
    .getByRole("button", { name: /crucible/i })
    .hover();

  await expect(
    page.locator('[data-site-mega-item-id="locations"]'),
  ).toHaveAttribute("href", "/darkplaces");
  await expect(
    page.locator('[data-site-mega-item-id="monsters"]'),
  ).toHaveAttribute("href", "/terrifyingmonsters");
});

test("mega menu and utility menu share the navigation window surface", async ({ page }) => {
  await page.goto("/");

  const primaryNavigation = page.getByRole("navigation", {
    name: /primary sections/i,
  });
  await primaryNavigation.getByRole("button", { name: /crucible/i }).click();

  const megaMenu = page.locator(".site-mega-menu");
  await expect(megaMenu).toHaveAttribute("data-transition-state", "open");
  const megaSurface = await megaMenu.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderColor: style.borderColor,
      borderStyle: style.borderStyle,
      borderWidth: style.borderWidth,
    };
  });

  const preview = megaMenu.locator(".site-mega-menu__preview");
  await expect(preview).toHaveCSS("border-top-width", "0px");
  await expect(preview).toHaveCSS("border-right-width", "0px");
  await expect(preview).toHaveCSS("border-bottom-width", "0px");
  await expect(preview).toHaveCSS("border-left-width", "0px");

  await page.locator(".site-topbar__utility-button").click();

  const utilityMenu = page.locator("#siteUtilityMenu");
  await expect(utilityMenu).toHaveAttribute("data-transition-state", "open");
  const utilitySurface = await utilityMenu.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderColor: style.borderColor,
      borderStyle: style.borderStyle,
      borderWidth: style.borderWidth,
    };
  });

  expect(utilitySurface).toEqual(megaSurface);
  expect(megaSurface.borderColor).toBe("rgb(190, 64, 82)");
  expect(megaSurface.borderStyle).toBe("solid");
  expect(megaSurface.borderWidth).toBe("1px");
});
