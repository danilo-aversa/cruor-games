import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readProjectFile(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Creator Operations workspace", () => {
  it("provides a global dashboard and dedicated QA tool views", () => {
    const source = readProjectFile(
      "features/creator-studio/CreatorOperationsPage.jsx",
    );

    expect(source).toContain('title="Content System Status"');
    expect(source).toContain('id: "health"');
    expect(source).toContain('id: "coverage"');
    expect(source).toContain('id: "ledger"');
    expect(source).toContain('id: "monster-batch"');
    expect(source).toContain('id: "map-batch"');
    expect(source).toContain('mode="workspace"');
    expect(source).toContain('className={`studio-library-panel ${collapsed ? "is-collapsed" : ""}`.trim()}');
    expect(source).toContain('className="studio-sidebar-resize-handle studio-sidebar-resize-handle--library"');
    expect(source).toContain('className="creator-operations__preset-card cruor-ui-card-surface"');
    expect(source).toContain('aria-label={`Run preset ${preset.name}`}');
    expect(source).toContain('<StudioStatusBadge status="neutral" icon="fa-lock">Official</StudioStatusBadge>');
    expect(source).toContain('className="creator-studio-home__work-list"');
    expect(source).not.toContain('creator-operations__dashboard-grid');
  });

  it("keeps the global tool shell embeddable without modal semantics", () => {
    const source = readProjectFile(
      "features/inspiration-studio/components/StudioToolModalShell.jsx",
    );

    expect(source).toContain('mode = "modal"');
    expect(source).toContain('const isWorkspace = mode === "workspace"');
    expect(source).toContain('role={isWorkspace ? "region" : "dialog"}');
    expect(source).toContain("if (isWorkspace) return workspace;");
  });
});
