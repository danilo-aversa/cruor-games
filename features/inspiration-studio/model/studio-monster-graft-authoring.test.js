import { describe, expect, it } from "vitest";

import { MONSTER_GRAFTS } from "../../monster-composer/data/monster-grafts.js";
import { buildStudioComponentsFromTemplate } from "./studio-component-templates.js";
import {
  buildStudioGraftOutputPreview,
  createStudioGraftBand,
  createStudioGraftProgression,
  createUniqueStudioGraftAbility,
  ensureStudioGraftPayload,
  removeStudioGraftAbilityReferences,
  renameStudioGraftAbilityReferences,
  validateStudioGraftPayload,
} from "./studio-monster-graft-authoring.js";

function asStudioComponent(graft) {
  return {
    id: graft.id,
    title: graft.title,
    summary: graft.summary,
    counterplay: graft.counterplay,
    slots: [graft.slot],
    sourceAnchors: graft.sourceAnchors || [graft.source],
    monster: { ...graft, graftId: graft.id },
  };
}

describe("Content Studio Graft authoring", () => {
  it("creates native Graft templates without a legacy root rules block", () => {
    const templateIds = [
      "monster-trait",
      "monster-action",
      "monster-bonus-action",
      "monster-reaction",
      "monster-weakness",
      "monster-death-effect",
      "monster-lair-effect",
    ];

    templateIds.forEach((templateId) => {
      const [component] = buildStudioComponentsFromTemplate(templateId, {
        id: "studio-test",
        sourceAnchors: ["decomposition"],
      });
      const validation = validateStudioGraftPayload(component);

      expect(component.monster.graftSchemaVersion).toBe("monster-graft-v2.0");
      expect(component.monster.abilities).toHaveLength(1);
      expect(component.monster).not.toHaveProperty("rules");
      expect(validation.errors).toEqual([]);
    });
  });

  it("updates routine and CR-band references when an ability ID changes or is removed", () => {
    const [component] = buildStudioComponentsFromTemplate("monster-action", {
      id: "studio-test",
      sourceAnchors: ["decomposition"],
    });
    const payload = ensureStudioGraftPayload(component);
    const second = createUniqueStudioGraftAbility(payload, {
      id: "acid-vomit",
      title: "Acid Vomit",
      slot: "attack",
      section: "action",
      role: "replacement",
    });
    payload.abilities.push(second);
    payload.routine.defaultSequence = [payload.abilities[0].id, second.id];
    payload.routine.multiattack.replacements = [{ with: second.id, replace: "oneAttack" }];
    payload.progression = createStudioGraftProgression(payload.abilities.map((ability) => ability.id));

    renameStudioGraftAbilityReferences(payload, second.id, "corrosive-vomit");
    expect(payload.routine.defaultSequence).toContain("corrosive-vomit");
    expect(payload.routine.multiattack.replacements[0].with).toBe("corrosive-vomit");
    expect(payload.progression.bands.at(-1).abilityIds).toContain("corrosive-vomit");

    removeStudioGraftAbilityReferences(payload, "corrosive-vomit");
    expect(payload.routine.defaultSequence).not.toContain("corrosive-vomit");
    expect(payload.routine.multiattack.replacements).toEqual([]);
    expect(payload.progression.bands.flatMap((band) => band.abilityIds)).not.toContain("corrosive-vomit");
  });

  it("creates a generic support progression without enabling Multiattack", () => {
    const progression = createStudioGraftProgression(["shadow-step"], {
      kind: "movementPattern",
    });
    expect(progression.schemaVersion).toBe("monster-graft-progression-v1.0");
    expect(progression.bands).toHaveLength(1);
    expect(progression.bands[0]).toMatchObject({
      abilityIds: ["shadow-step"],
      multiattack: { enabled: false, count: 0 },
    });
  });

  it("preserves an empty native Graft so the editor can report and repair it", () => {
    const component = {
      id: "empty-graft",
      title: "Empty Graft",
      slots: ["attack"],
      monster: {
        graftSchemaVersion: "monster-graft-v2.0",
        schemaVersion: "monster-graft-v2.0",
        kind: "attackPattern",
        slot: "attack",
        abilities: [],
      },
    };

    expect(ensureStudioGraftPayload(component).abilities).toEqual([]);
  });

  it("previews Acid Vomit as a complete CR-scaled pattern instead of reusing Heavy Slam text", () => {
    const acidVomit = MONSTER_GRAFTS.find((graft) => graft.id === "acid-vomit");
    const low = buildStudioGraftOutputPreview(asStudioComponent(acidVomit), 1);
    const mid = buildStudioGraftOutputPreview(asStudioComponent(acidVomit), 5);

    expect(low.abilities.map((ability) => ability.title)).toEqual(["Heavy Slam"]);
    expect(mid.abilities.map((ability) => ability.title)).toEqual([
      "Multiattack",
      "Heavy Slam",
      "Acid Vomit",
    ]);
    const acidOutput = mid.abilities.find((ability) => ability.title === "Acid Vomit");
    expect(acidOutput.text).toContain("Acid damage");
    expect(acidOutput.text).toContain("Recharge 5-6");
    expect(acidOutput.text).not.toContain("moved at least 10 feet straight");
  });

  it("creates additional bands with all current abilities selected", () => {
    const payload = {
      abilities: [{ id: "slam" }, { id: "vomit" }],
      progression: { bands: [{ id: "low" }] },
    };
    expect(createStudioGraftBand(payload)).toMatchObject({
      abilityIds: ["slam", "vomit"],
      minCr: 0,
      maxCr: 30,
    });
  });
});
