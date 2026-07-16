import { describe, expect, it } from "vitest";

import {
  SEMANTIC_SCHEMA_VERSIONS,
  serializeCanonicalSemanticContent,
} from "../../../shared/content/contracts/semantic/index.js";
import { loadInspirationModules } from "../../../shared/content/content.index.js";
import {
  SEDLEC_OSSUARY_SEMANTIC_V2_MODULE,
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
} from "../../../shared/content/content-packs/sedlec-ossuary-semantic-v2-pack.js";
import { normalizeModuleForDraft } from "./studio-draft.js";
import { buildContentPackExport, buildModuleExport } from "./studio-export.js";
import { importStudioSemanticContent } from "./studio-v2-io.js";

const LEGACY_MONSTER_MODULE = {
  id: "legacy-bone-graft",
  title: "Legacy Bone Graft",
  packId: "legacy-monsters",
  status: "published",
  sourceAnchor: {
    id: "legacy-bone-graft",
    label: "Legacy Bone Graft",
    type: "Material Culture",
    status: "published",
    sourceTypes: ["Material Culture"],
    themes: ["bone"],
    summary: "A legacy source retained for transitional Studio reading.",
  },
  inspiration: {
    id: "inspiration-legacy-bone-graft",
    title: "Legacy Bone Graft",
    status: "published",
    contentType: "source-inspiration-card",
    workflows: ["inspiration-archive"],
    sourceAnchors: ["legacy-bone-graft"],
    summary: "A bone graft used to verify the v1 boundary.",
    narrative: "The graft replaces living joints with devotional hinges.",
  },
  components: [
    {
      id: "legacy-hinged-bones",
      title: "Hinged Bones",
      contentType: "monster-graft",
      status: "published",
      workflows: ["monster-composer"],
      slots: ["body"],
      sourceAnchors: ["legacy-bone-graft"],
      summary: "The creature folds along impossible joints.",
      counterplay:
        "Blunt impacts jam one hinge until the end of the next turn.",
      monster: {
        graftId: "legacy-hinged-bones",
        slot: "body",
        section: "trait",
        cost: 2,
        complexity: 1,
        rules: {
          section: "trait",
          actionEconomy: "passive",
          usage: { type: "passive" },
          resolution: { type: "none" },
          targeting: { type: "self", targets: "the creature" },
          damage: { mode: "none", types: [] },
          counterplay: { text: "A critical hit jams a hinge." },
        },
      },
    },
  ],
  metadata: { author: "Cruor Games" },
};

describe("Inspiration Studio semantic v2 import boundary", () => {
  it("round-trips a canonical v2 module and pack without changing bytes", () => {
    const imported = importStudioSemanticContent(
      serializeCanonicalSemanticContent(SEDLEC_OSSUARY_SEMANTIC_V2_PACK),
    );
    const draft = normalizeModuleForDraft(imported.selectedModule, {
      importResult: imported,
    });

    expect(imported).toMatchObject({
      ok: true,
      kind: "content-pack",
      mode: "v2",
      sourceSchema: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
    });
    expect(serializeCanonicalSemanticContent(buildModuleExport(draft))).toBe(
      serializeCanonicalSemanticContent(SEDLEC_OSSUARY_SEMANTIC_V2_MODULE),
    );
    expect(
      serializeCanonicalSemanticContent(buildContentPackExport(draft)),
    ).toBe(serializeCanonicalSemanticContent(SEDLEC_OSSUARY_SEMANTIC_V2_PACK));
  });

  it("loads a v1 module transitionally and preserves editable Monster graft rules", () => {
    const imported = importStudioSemanticContent(LEGACY_MONSTER_MODULE);
    const draft = normalizeModuleForDraft(imported.selectedModule, {
      importResult: imported,
    });

    expect(imported).toMatchObject({
      ok: true,
      kind: "inspiration-module",
      mode: "v1-compatibility",
      targetSchema: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    });
    expect(imported.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "compatibility.legacy-module-normalized",
          severity: "warning",
        }),
      ]),
    );
    expect(draft.components[0].monster.rules).toEqual(
      LEGACY_MONSTER_MODULE.components[0].monster.rules,
    );

    draft.components[0].monster.rules.resolution = {
      type: "savingThrow",
      ability: "Strength",
    };
    const exported = buildModuleExport(draft);
    const exportedGraft = exported.components[0];

    expect(exported.schemaVersion).toBe(
      SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    );
    expect(exportedGraft).toMatchObject({
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
      semanticType: "monster-graft",
      semantic: {
        details: {
          monster: {
            rules: {
              resolution: { type: "savingThrow", ability: "Strength" },
            },
          },
        },
      },
    });
    expect(exportedGraft).not.toHaveProperty("monster");
    expect(exported.sourceAnchor).not.toHaveProperty("label");
    expect(exported.inspiration).not.toHaveProperty("contentType");
  });

  it("returns a path-addressed error instead of throwing on invalid JSON", () => {
    const imported = importStudioSemanticContent("{not-json");

    expect(imported.ok).toBe(false);
    expect(imported.selectedModule).toBeNull();
    expect(imported.diagnostics).toEqual([
      expect.objectContaining({
        code: "studio.import-invalid-json",
        severity: "error",
        path: "input",
      }),
    ]);
  });

  it("loads the current Studio library without dropping existing Monster grafts", async () => {
    const modules = await loadInspirationModules();
    const sourceGrafts = modules.flatMap((module) =>
      (module.components || []).filter(
        (component) => component.contentType === "monster-graft",
      ),
    );
    const drafts = modules.map((module) => normalizeModuleForDraft(module));
    const draftGrafts = drafts.flatMap((draft) => draft.monsterGrafts);

    expect(modules.length).toBeGreaterThan(0);
    expect(sourceGrafts.length).toBeGreaterThan(0);
    expect(draftGrafts).toHaveLength(sourceGrafts.length);
    sourceGrafts.forEach((sourceGraft) => {
      const draftGraft = draftGrafts.find(
        (component) => component.id === sourceGraft.id,
      );
      expect(draftGraft, sourceGraft.id).toBeDefined();
      if (sourceGraft.monster?.rules) {
        expect(draftGraft.monster.rules, sourceGraft.id).toEqual(
          sourceGraft.monster.rules,
        );
      }
    });
  });
});
