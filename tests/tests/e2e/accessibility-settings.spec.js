import { expect, test } from "@playwright/test";

test("settings menu applies and persists accessibility preferences", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-a11y-theme", "dark");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-a11y-tooltips", "default");

  await page.getByRole("button", { name: /open settings/i }).click();
  const settingsMenu = page.locator("#siteUtilityMenu");
  await expect(settingsMenu).toBeVisible();

  await settingsMenu.getByRole("button", { name: /parchment/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-a11y-theme", "parchment");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-a11y-theme", "parchment");

  await settingsMenu.getByRole("button", { name: /^high/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-a11y-contrast", "high");

  await settingsMenu.getByRole("button", { name: /^reduced/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-a11y-motion", "reduced");

  await settingsMenu.getByRole("button", { name: /focus only/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-a11y-tooltips", "focus");

  const storedSettings = await page.evaluate(() => JSON.parse(window.localStorage.getItem("cruor.accessibility")));
  expect(storedSettings).toMatchObject({
    theme: "parchment",
    contrast: "high",
    motion: "reduced",
    tooltips: "focus",
  });

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-a11y-theme", "parchment");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-contrast", "high");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-motion", "reduced");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-tooltips", "focus");
});

test("accessibility settings can be reset", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "cruor.accessibility",
      JSON.stringify({
        theme: "parchment",
        contrast: "maximum",
        motion: "reduced",
        text: "extra-large",
        focus: "strong",
        tooltips: "off",
      }),
    );
  });

  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-a11y-theme", "parchment");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-tooltips", "off");

  await page.getByRole("button", { name: /open settings/i }).click();
  await page.locator("#siteUtilityMenu").getByRole("button", { name: /reset accessibility settings/i }).click();

  await expect(page.locator("html")).toHaveAttribute("data-a11y-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-contrast", "default");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-motion", "system");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-text", "default");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-focus", "default");
  await expect(page.locator("html")).toHaveAttribute("data-a11y-tooltips", "default");
});
