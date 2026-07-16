import { describe, expect, it } from "vitest";

import {
  SEMANTIC_SCHEMA_VERSIONS,
  validateContentPackV0_2,
  validateInspirationModuleV2,
} from "../../../shared/content/contracts/semantic/index.js";
import {
  EMPTY_DRAFT,
  buildComponentTemplate,
  normalizeModuleForDraft,
} from "./studio-draft.js";
import {
  buildContentPackExport,
  buildModuleExport,
  serializeStudioExport,
} from "./studio-export.js";
import { validateStudioDraft } from "./studio-validation.js";

describe("Inspiration Studio v2-only writer", () => {
  it("creates schema-versioned v2 modules and canonical final-newline JSON", () => {
    const draft = normalizeModuleForDraft(EMPTY_DRAFT);
    const moduleExport = buildModuleExport(draft);
    const packExport = buildContentPackExport(draft);

    expect(moduleExport.schemaVersion).toBe(
      SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    );
    expect(packExport.schemaVersion).toBe(
      SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
    );
    expect(packExport).toHaveProperty("modules");
    expect(packExport).not.toHaveProperty("collections");
    expect(serializeStudioExport(moduleExport)).toMatch(/\n$/);
    expect(validateInspirationModuleV2(moduleExport)).toEqual([]);
    expect(validateContentPackV0_2(packExport)).toEqual([]);
    expect(validateStudioDraft(draft, packExport).summary.error).toBe(0);
  });

  it("creates Monster templates with v2 discriminants and preserves graft editing", () => {
    const draft = normalizeModuleForDraft(EMPTY_DRAFT);
    const graft = buildComponentTemplate("monster-action", draft);
    draft.components.push(graft);
    draft.capabilities.push("monster-composer");
    graft.monster.rules.resolution = {
      type: "savingThrow",
      ability: "Constitution",
    };

    const moduleExport = buildModuleExport(draft);
    const exportedGraft = moduleExport.components.find(
      (component) => component.id === graft.id,
    );

    expect(graft).toMatchObject({
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
      semanticType: "monster-graft",
      monster: { rules: { resolution: { ability: "Constitution" } } },
    });
    expect(exportedGraft).toMatchObject({
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
      semanticType: "monster-graft",
      semantic: {
        details: {
          monster: {
            rules: {
              resolution: { ability: "Constitution" },
            },
          },
        },
      },
    });
    expect(exportedGraft).not.toHaveProperty("monster");
  });
});
