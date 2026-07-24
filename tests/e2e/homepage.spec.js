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

test("hero introduces the Crucible and semi-procedural content engines", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", {
    level: 1,
    name: "Forge 5E Dark Fantasy in the Crucible",
  })).toBeVisible();
  await expect(
    page.getByText(
      "Shape your own content using semi-procedural engines that turn macabre real-world inspiration into playable, table-ready material.",
    ),
  ).toBeVisible();
});


test("hero CTA scrolls smoothly to the Crucible explanation", async ({ page }) => {
  await page.addInitScript(() => {
    window.__cruorScrollCalls = [];
    Element.prototype.scrollIntoView = function scrollIntoView(options) {
      window.__cruorScrollCalls.push({ id: this.id, options });
    };
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Explore the Crucible" }).click();

  await expect.poll(() =>
    page.evaluate(() => window.__cruorScrollCalls.at(-1)),
  ).toEqual({
    id: "workbenchFlow",
    options: { behavior: "smooth", block: "start" },
  });
});

test("hero CTA avoids smooth scrolling when reduced motion is enabled", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    window.__cruorScrollCalls = [];
    Element.prototype.scrollIntoView = function scrollIntoView(options) {
      window.__cruorScrollCalls.push({ id: this.id, options });
    };
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Explore the Crucible" }).click();

  await expect.poll(() =>
    page.evaluate(() => window.__cruorScrollCalls.at(-1)),
  ).toEqual({
    id: "workbenchFlow",
    options: { behavior: "auto", block: "start" },
  });
});
