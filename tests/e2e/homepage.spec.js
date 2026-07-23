import { expect, test } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});

test("tool cards omit eyebrows and use compact uppercase overview titles", async ({
  page,
}) => {
  await page.goto("/");

  const overviewTitles = page.locator(
    ".cruor-home__tool-content-inner--overview .cruor-home__tool-copy h3",
  );

  await expect(overviewTitles).toHaveCount(2);
  await expect(overviewTitles.nth(0)).toHaveText("Dark Places");
  await expect(overviewTitles.nth(1)).toHaveText("Terrifying Monsters");

  await expect(page.getByText("01 / Location & Map Generator")).toHaveCount(0);
  await expect(page.getByText("02 / Monster & Stat Block Generator")).toHaveCount(0);

  await expect(overviewTitles.nth(0)).toHaveCSS("text-transform", "uppercase");
  await expect(overviewTitles.nth(0)).toHaveCSS("font-weight", "850");
});
