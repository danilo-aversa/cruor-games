import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readProjectFile(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Creator Studio shell", () => {
  it("does not mount public navigation chrome in creator mode", () => {
    const source = readProjectFile("app/AppShell.jsx");

    expect(source).toContain('const isCreatorShell = activeSection === "creator-studio"');
    expect(source).toContain('data-shell-mode={isCreatorShell ? "creator" : "site"}');
    expect(source).toMatch(/\{!isCreatorShell \? \(\s*<SiteTopbar/);
    expect(source).toMatch(/\{!isCreatorShell \? \(\s*<div\s+className=\{`app-shell__navigation-overlay/);
    expect(source).toContain('data-transient-navigation-open={!isCreatorShell && isTransientNavigationPresent ? "true" : "false"}');
  });

  it("clears transient navigation when entering creator mode", () => {
    const source = readProjectFile("app/AppShell.jsx");

    expect(source).toMatch(/if \(!isCreatorShell\) return;[\s\S]*setIsTransientNavigationOpen\(false\);[\s\S]*setIsTransientNavigationPresent\(false\);/);
    expect(source).toContain("}, [isCreatorShell]);");
  });

  it("assigns full viewport ownership to the creator suite", () => {
    const shellCss = readProjectFile("app/app-shell.css");
    const creatorCss = readProjectFile("features/creator-studio/creator-studio.styles.css");
    const studioCss = readProjectFile("features/inspiration-studio/inspiration-studio.styles.css");

    expect(shellCss).toContain('.app-shell[data-shell-mode="creator"]');
    expect(shellCss).toMatch(/\.app-shell\[data-shell-mode="creator"\] \.app-shell__workspace \{[\s\S]*height: 100dvh;/);
    expect(creatorCss).toContain("height: 100dvh;");
    expect(studioCss).not.toContain("--app-shell-bar-height");
    expect(studioCss).not.toContain('.app-shell[data-active-section="creator-studio"]');
    expect(studioCss).not.toContain(".app-shell__bar");
  });
});
