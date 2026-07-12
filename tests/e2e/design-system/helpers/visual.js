import { expect } from "@playwright/test";

export const VIEWPORTS = Object.freeze({
  wide: { width: 1440, height: 1080 },
  compact: { width: 1100, height: 800 },
  mobile: { width: 390, height: 844 },
});

export async function seedAccessibility(page, scrollbar = "custom") {
  await page.addInitScript((mode) => {
    localStorage.setItem(
      "cruor.accessibility",
      JSON.stringify({
        theme: "dark",
        contrast: "default",
        motion: "reduced",
        text: "default",
        focus: "strong",
        tooltips: "default",
        scrollbar: mode,
      }),
    );
  }, scrollbar);
}

export async function stabilizePage(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }
      html { scroll-behavior: auto !important; }
    `,
  });
  await page.locator("video").evaluateAll((videos) => {
    videos.forEach((video) => {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        // A video without loaded metadata remains paused and deterministic.
      }
    });
  });
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

export async function gotoStable(page, url, readySelector = ".app-shell") {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await expect(page.locator(readySelector).first()).toBeVisible({ timeout: 20_000 });
  await stabilizePage(page);
}

export async function expectPageScreenshot(page, name, options = {}) {
  await expect(page).toHaveScreenshot(name, {
    animations: "disabled",
    caret: "hide",
    fullPage: options.fullPage ?? true,
    maxDiffPixels: 100,
    timeout: 20_000,
    ...options,
  });
}

export async function openSettings(page) {
  const trigger = page.getByRole("button", { name: /open settings/i });
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const menu = page.locator("#siteUtilityMenu");
  await expect(menu).toBeVisible();
  return { menu, trigger };
}
