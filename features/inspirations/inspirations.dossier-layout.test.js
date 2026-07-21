import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const stylesPath = fileURLToPath(
  new URL("./inspirations.styles.css", import.meta.url),
);
const styles = readFileSync(stylesPath, "utf8");

function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    styles.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`))?.[1] || ""
  );
}

describe("Inspirations dossier layout contract", () => {
  it("pins media and content to the same explicit desktop grid row", () => {
    expect(rule(".inspiration-dossier__panel")).toContain(
      "grid-template-rows: minmax(0, 1fr)",
    );
    expect(rule(".inspiration-dossier__stage")).toContain("height: min(880px");
    expect(rule(".inspiration-dossier__media")).toContain("grid-column: 1");
    expect(rule(".inspiration-dossier__media")).toContain("grid-row: 1");
    expect(rule(".inspiration-dossier__content")).toContain("grid-column: 2");
    expect(rule(".inspiration-dossier__content")).toContain("grid-row: 1");
  });

  it("restores portal-safe sizing and constrains the image", () => {
    expect(styles).toContain(".inspiration-dossier *::after");
    expect(styles).toContain("box-sizing: border-box");
    expect(rule(".inspiration-dossier__media-image img")).toContain(
      "max-height: 100%",
    );
    expect(rule(".inspiration-dossier__media-image img")).toContain(
      "object-fit: cover",
    );
  });
  it("keeps the close control fixed to the panel top-right corner", () => {
    const closeRule = rule(
      ".inspiration-dossier__close.cruor-square-icon-button",
    );
    expect(closeRule).toContain("position: absolute");
    expect(closeRule).toContain("inset: 12px 12px auto auto");
  });

  it("places icon tabs outside the panel without reserving an inner column", () => {
    expect(rule(".inspiration-dossier__stage")).toContain("position: relative");
    expect(rule(".inspiration-dossier__stage")).toContain(
      "width: min(1320px, calc(100% - 52px))",
    );
    expect(rule(".inspiration-dossier__content")).toContain(
      "grid-template-columns: minmax(0, 1fr)",
    );
    expect(rule(".inspiration-dossier__tabs")).toContain("position: absolute");
    expect(rule(".inspiration-dossier__tabs")).toContain(
      "top: calc(var(--dossier-tabs-top, 0px) + 18px)",
    );
    expect(rule(".inspiration-dossier__tabs")).toContain("right: 0");
    expect(rule(".inspiration-dossier__tabs")).toContain(
      "transform: translateX(100%)",
    );
    expect(rule(".inspiration-dossier__tabs button")).toContain("width: 44px");
    expect(rule(".inspiration-dossier__tabs button")).toContain("height: 44px");
  });

  it("aligns pill text and restores header bottom spacing", () => {
    expect(rule(".inspiration-dossier__header")).toContain(
      "clamp(22px, 3vw, 40px) 10px",
    );
    expect(rule(".inspiration-dossier__meta > span")).toContain(
      "align-items: baseline",
    );
    expect(rule(".inspiration-dossier__meta > span")).toContain(
      "padding: 7px 10px",
    );
    expect(rule(".inspiration-dossier__meta strong")).toContain(
      "line-height: 1",
    );
  });
  it("uses one solid body/tab surface and overlaps only the panel border", () => {
    expect(rule(".inspiration-dossier__body")).toContain(
      "background: var(--cruor-color-ink-raised-a960)",
    );
    expect(rule(".inspiration-dossier__tabs button")).toContain(
      "background: var(--cruor-color-ink-raised-a960)",
    );
    expect(rule(".inspiration-dossier__tabs button")).toContain(
      "margin-left: 0",
    );
    expect(rule(".inspiration-dossier__tabs button")).toContain(
      "border: 1px solid",
    );
    expect(rule(".inspiration-dossier__tabs button")).toContain(
      "border-left: 0",
    );
    expect(rule(".inspiration-dossier__tabs button.is-active")).toContain(
      "margin-left: -1px",
    );
    expect(rule(".inspiration-dossier__tabs button.is-active")).toContain(
      "border-left: 0",
    );
    expect(rule(".inspiration-dossier__tabs button.is-active")).not.toContain(
      "gradient",
    );
    expect(styles).not.toContain(
      ".inspiration-dossier__tabs button.is-active::after",
    );
  });

  it("uses Inter throughout the modal except for the primary dossier title", () => {
    const modalStyles = styles.slice(styles.indexOf(".inspiration-dossier {"));
    const displayFont =
      'font-family: var(--cruor-font-display, "Lovato-Black", Georgia, serif)';

    expect(
      rule(".inspiration-dossier__header h2#inspiration-dossier-title"),
    ).toContain(displayFont);
    expect(modalStyles.split(displayFont)).toHaveLength(2);
    expect(rule(".inspiration-dossier__opening-thesis")).toContain(
      "font-family: var(--cruor-font-body, Inter, sans-serif)",
    );
    expect(rule(".inspiration-dossier__article-lead")).toContain(
      "font-family: var(--cruor-font-body, Inter, sans-serif)",
    );
    expect(rule(".inspiration-dossier__lens blockquote")).toContain(
      "font-family: var(--cruor-font-body, Inter, sans-serif)",
    );
    expect(rule(".inspiration-dossier__workbench-intro h3")).toContain(
      "font-family: var(--cruor-font-body, Inter, sans-serif)",
    );
  });

  it("uses the site-wide reading scale without undersized modal text", () => {
    const modalStyles = styles.slice(styles.indexOf(".inspiration-dossier {"));

    expect(modalStyles).not.toContain("--inspiration-dossier-font-");
    expect(modalStyles).not.toContain("var(--text-size-s");
    expect(modalStyles).not.toContain("var(--text-size-m");

    expect(modalStyles).toContain(
      ".inspiration-dossier__eyebrow {\n  margin: 0;\n  color: var(--cruor-color-rose);\n  font-size: var(--text-size-l, 0.92rem);",
    );
    expect(
      rule(
        ".inspiration-dossier__section > p,\n.inspiration-dossier__section-deck",
      ),
    ).toContain("font-size: var(--text-size-2xl)");
    expect(
      rule(
        ".inspiration-dossier__article-copy p,\n.inspiration-dossier__article-copy ul",
      ),
    ).toContain("font-size: var(--text-size-2xl)");
    expect(rule(".inspiration-dossier__article-copy h4")).toContain(
      "font-size: var(--text-size-4xl)",
    );
    expect(rule(".inspiration-dossier__article-lead")).toContain(
      "font-size: var(--text-size-3xl)",
    );
    expect(rule(".inspiration-dossier__opening-thesis")).toContain(
      "font-size: var(--text-size-3xl)",
    );
    expect(rule(".inspiration-dossier__lens blockquote")).toContain(
      "font-size: var(--text-size-3xl)",
    );
    expect(rule(".inspiration-dossier__structure-item > span")).not.toContain(
      "1.45rem",
    );
  });

  it("uses an editorial article hierarchy instead of boxed At the Table cards", () => {
    expect(rule(".inspiration-dossier__tab-panel")).toContain("gap: 34px");
    expect(rule(".inspiration-dossier__section")).not.toContain("border:");
    expect(rule(".inspiration-dossier__article-copy")).toContain(
      "max-width: 78ch",
    );
    expect(rule(".inspiration-dossier__structure-grid")).toContain(
      "grid-template-columns: repeat(2, minmax(0, 1fr))",
    );
    expect(rule(".inspiration-dossier__research-grid")).toContain(
      "grid-template-columns: repeat(2, minmax(0, 1fr))",
    );
    expect(rule(".inspiration-dossier__translation-map article")).toContain(
      "grid-template-columns:",
    );
  });
});
