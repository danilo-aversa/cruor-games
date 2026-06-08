import { describe, expect, it } from "vitest";

import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import { MONSTER_FAMILY_PRESETS } from "../data/monster-presets.js";
import { MONSTER_SOURCES } from "../data/monster-sources.js";

const ARCHIVED_PROTOTYPE_SOURCE_IDS = new Set(["gashadokuro", "jack-the-ripper"]);
const REQUIRED_TEMPLATE_SLOTS = ["body", "attack", "weakness"];

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function getPresetSelectionEntries(preset) {
  return Object.entries(preset.selection || {}).flatMap(([slotId, value]) =>
    asArray(value).map((graftId) => ({ slotId, graftId })),
  );
}

describe("Monster Composer preset integrity", () => {
  it("does not expose archived prototype sources or templates", () => {
    expect(MONSTER_SOURCES.map((source) => source.id)).not.toContain("gashadokuro");
    expect(MONSTER_FAMILY_PRESETS.map((preset) => preset.source)).not.toContain("gashadokuro");
    expect(MONSTER_FAMILY_PRESETS.map((preset) => preset.source)).not.toContain("jack-the-ripper");
  });

  it("only uses known active sources", () => {
    const activeSourceIds = new Set(MONSTER_SOURCES.map((source) => source.id));

    MONSTER_FAMILY_PRESETS.forEach((preset) => {
      expect(activeSourceIds.has(preset.source), `${preset.id} references unknown source ${preset.source}`).toBe(true);
      expect(ARCHIVED_PROTOTYPE_SOURCE_IDS.has(preset.source), `${preset.id} uses archived source ${preset.source}`).toBe(false);
    });
  });

  it("loads every selected graft into the declared slot", () => {
    const graftById = new Map(MONSTER_GRAFTS.map((graft) => [graft.id, graft]));

    MONSTER_FAMILY_PRESETS.forEach((preset) => {
      getPresetSelectionEntries(preset).forEach(({ slotId, graftId }) => {
        const graft = graftById.get(graftId);
        expect(Boolean(graft), `${preset.id} references missing graft ${graftId}`).toBe(true);
        expect(graft?.slot, `${preset.id}.${slotId} uses ${graftId} from slot ${graft?.slot}`).toBe(slotId);
      });
    });
  });

  it("starts every template with the minimum playable export core", () => {
    MONSTER_FAMILY_PRESETS.forEach((preset) => {
      REQUIRED_TEMPLATE_SLOTS.forEach((slotId) => {
        expect(Boolean(preset.selection?.[slotId]), `${preset.id} is missing required ${slotId} slot`).toBe(true);
      });
    });
  });
});
