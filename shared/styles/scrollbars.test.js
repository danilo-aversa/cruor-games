import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const scrollbarCss = read("shared/styles/scrollbars.css");
const appEntry = read("app/main.jsx");
const homeCss = read("app/home-page.css");
const homePage = read("app/HomePage.jsx");
const monsterCss = read("features/monster-composer/monster-composer.styles.css");
const inspirationsCss = read("features/inspirations/inspirations.styles.css");

function importIndex(source, path) {
  return source.indexOf(`import "${path}";`);
}

describe("shared native scrollbar contract", () => {
  test("loads after accessibility styles so the preference contract wins", () => {
    const accessibilityIndex = importIndex(appEntry, "../shared/styles/accessibility.css");
    const scrollbarIndex = importIndex(appEntry, "../shared/styles/scrollbars.css");

    expect(accessibilityIndex).toBeGreaterThanOrEqual(0);
    expect(scrollbarIndex).toBeGreaterThan(accessibilityIndex);
  });

  test("uses the Inspirations 6px gradient treatment in Chromium/WebKit", () => {
    expect(scrollbarCss).toContain("@supports selector(::-webkit-scrollbar)");
    expect(scrollbarCss).toContain("scrollbar-width: auto !important");
    expect(scrollbarCss).toContain("scrollbar-color: auto !important");
    expect(scrollbarCss).toContain("--cruor-scrollbar-size: 6px");
    expect(scrollbarCss).toContain("background: var(--cruor-scrollbar-thumb) !important");
    expect(scrollbarCss).toContain(
      "--cruor-scrollbar-thumb: var(--cruor-gradient-linear-005-2d835da9)"
    );
    expect(scrollbarCss).toContain("border-radius: 0 !important");
    expect(scrollbarCss).toContain("display: none !important");
    expect(scrollbarCss).toContain("background: var(--cruor-scrollbar-track) !important");
  });

  test("preserves the Home diamond spy-scroll and hides only its document scrollbar", () => {
    expect(homePage).toContain("cruor-home__scroll-progress");
    expect(homePage).toContain("cruor-home__scroll-progress-dot");
    expect(homeCss).toContain(':root[data-a11y-scrollbar="custom"]:has(.cruor-home)');
    expect(scrollbarCss).toContain(
      ':root[data-a11y-scrollbar="custom"]:has(.cruor-home)::-webkit-scrollbar'
    );
    expect(scrollbarCss).toContain(
      ':root[data-a11y-scrollbar="custom"] body:has(.cruor-home)::-webkit-scrollbar'
    );
    expect(scrollbarCss).toContain("width: 0 !important");
    expect(scrollbarCss).toContain("height: 0 !important");

    const genericScrollbarIndex = scrollbarCss.indexOf(
      ':root[data-a11y-scrollbar="custom"] *::-webkit-scrollbar'
    );
    const homeScrollbarIndex = scrollbarCss.indexOf(
      ':root[data-a11y-scrollbar="custom"]:has(.cruor-home)::-webkit-scrollbar'
    );
    expect(genericScrollbarIndex).toBeGreaterThanOrEqual(0);
    expect(homeScrollbarIndex).toBeGreaterThan(genericScrollbarIndex);
  });

  test("keeps overflow ownership local while removing Monster and Inspirations visual duplicates", () => {
    expect(monsterCss).toMatch(
      /\.monster-shell \.anatomy-stage__grid--frame \.anatomy-stage__column \{[\s\S]*?overflow-y: auto;/
    );
    expect(monsterCss).not.toContain(
      ".anatomy-stage__grid--frame .anatomy-stage__column::-webkit-scrollbar"
    );
    expect(inspirationsCss).not.toContain(".inspirations-page ::-webkit-scrollbar");
  });

  test("Browser is the only native-rendering opt-out", () => {
    expect(scrollbarCss).toContain(':root[data-a11y-scrollbar="browser"]');
    expect(scrollbarCss).toContain("all: revert !important");
  });
});
