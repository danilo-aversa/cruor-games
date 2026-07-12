import { expect, test } from "@playwright/test";
import { gotoStable, openSettings, seedAccessibility } from "./helpers/visual.js";

async function storedScrollbar(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("cruor.accessibility"))?.scrollbar);
}

async function scrollbarStyles(locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const webkit = getComputedStyle(element, "::-webkit-scrollbar");
    const thumb = getComputedStyle(element, "::-webkit-scrollbar-thumb");
    return {
      width: style.scrollbarWidth,
      color: style.scrollbarColor,
      webkitWidth: webkit.width,
      thumbBackground: thumb.backgroundColor,
    };
  });
}

test.describe("scrollbar preference contract", () => {
  for (const mode of ["custom", "browser"]) {
    test(`${mode} persists across route navigation and reload`, async ({ page }) => {
      await seedAccessibility(page, mode);
      await gotoStable(page, "/", ".cruor-home");
      await expect(page.locator("html")).toHaveAttribute("data-a11y-scrollbar", mode);
      expect(await storedScrollbar(page)).toBe(mode);

      await page.goto("/darkplaces");
      await expect(page.locator("html")).toHaveAttribute("data-a11y-scrollbar", mode);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-a11y-scrollbar", mode);
      expect(await storedScrollbar(page)).toBe(mode);
    });
  }

  test("scrollbar setting is keyboard reachable and updates application state", async ({ page }) => {
    await seedAccessibility(page, "custom");
    await gotoStable(page, "/", ".cruor-home");
    const { menu } = await openSettings(page);
    const browserMode = menu.getByRole("button", { name: /^Scrollbar: Browser\./i });
    await browserMode.focus();
    await expect(browserMode).toBeFocused();
    await browserMode.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-a11y-scrollbar", "browser");
    expect(await storedScrollbar(page)).toBe("browser");
  });

  test("Custom styles the Home document in Firefox", async ({ page, browserName }) => {
    test.skip(browserName !== "firefox", "Firefox computed-style contract.");
    await seedAccessibility(page, "custom");
    await gotoStable(page, "/", ".cruor-home");
    const styles = await scrollbarStyles(page.locator("html"));
    expect(styles.width).toBe("none");
  });

  test("Custom styles the Home document in Chromium", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium pseudo-element contract.");
    await seedAccessibility(page, "custom");
    await gotoStable(page, "/", ".cruor-home");
    const styles = await scrollbarStyles(page.locator("html"));
    expect(styles.webkitWidth).toBe("0px");
  });

  test.fixme("Browser restores native Chromium document scrollbars", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium");
    await seedAccessibility(page, "browser");
    await gotoStable(page, "/inspirations", ".inspirations-page");
    const styles = await scrollbarStyles(page.locator("html"));
    expect(styles.thumbBackground).toBe("rgba(0, 0, 0, 0)");
  });

  test.fixme("Browser disables feature-local styling on nested surfaces", async ({ page }) => {
    await seedAccessibility(page, "browser");
    await gotoStable(page, "/inspiration-studio", ".inspiration-studio");
    const libraryToggle = page.getByRole("button", { name: "Inspiration library" });
    if (await libraryToggle.isVisible()) await libraryToggle.click();
    const surface = page.getByRole("list", { name: "Available inspirations" });
    const styles = await scrollbarStyles(surface);
    expect(styles.width).toBe("auto");
    expect(styles.color).toBe("auto");
    expect(styles.thumbBackground).toBe("rgba(0, 0, 0, 0)");
  });

  test.fixme("Custom applies to representative nested surfaces across routes", async ({ page }) => {
    await seedAccessibility(page, "custom");
    const surfaces = [
      ["/darkplaces", ".location-map-wide-details-block"],
      ["/terrifyingmonsters", ".monster-anatomy__navigator-list"],
      ["/darkplaces/map", ".map-room-key"],
      ["/inspiration-studio", "[role='list'][aria-label='Available inspirations']"],
    ];
    for (const [url, selector] of surfaces) {
      await gotoStable(page, url);
      const styles = await scrollbarStyles(page.locator(selector).first());
      expect(styles.width === "thin" || styles.webkitWidth !== "auto").toBe(true);
    }
  });
});
