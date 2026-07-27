import { describe, expect, it } from "vitest";
import {
  getBestiaryWordingIssues,
  normalizeBestiaryFeatureWording,
  normalizeBestiaryRulesText,
} from "./monster-bestiary-wording.js";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import { buildMonsterAbilitiesFromFeatures } from "./monster-ability-model.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";
import { parseMonsterRenderedStatBlock } from "./monster-statblock-parser.js";

const COMPUTED = {
  targetCr: 5,
  dpr: 40,
  dc: 15,
  attack: 7,
  prof: 3,
  rulesetId: "dnd-5e-2024",
  baseline: { dpr: 40, hp: 120 },
};

const WORDING_GRAFT_IDS = [
  "purge-fluid-flood",
  "web-recharge",
  "shadow-web",
  "corpse-bloom-death",
  "broodmother-web-lair",
];

function graft(id) {
  const feature = MONSTER_GRAFTS.find((item) => item.id === id);
  if (!feature) throw new Error(`Missing wording fixture: ${id}`);
  return feature;
}

describe("Monster Composer Bestiary wording normalizer", () => {
  it("normalizes Hit and Failure damage clauses", () => {
    expect(normalizeBestiaryRulesText("Hit: the target takes 22 (4d10) Bludgeoning damage.")).toBe(
      "Hit: 22 (4d10) Bludgeoning damage.",
    );
    expect(normalizeBestiaryRulesText("Failure: the target takes 22 (4d10) Psychic damage and has the Frightened condition.")).toBe(
      "Failure: 22 (4d10) Psychic damage, and the target has the Frightened condition.",
    );
  });

  it("moves leading Recharge text into the feature title", () => {
    expect(
      normalizeBestiaryFeatureWording({
        title: "Web",
        text: "Recharge 5-6. Dexterity Saving Throw: DC 15, one creature within 60 feet. Failure: 12 (2d8 + 3) Piercing damage.",
      }),
    ).toEqual({
      title: "Web (Recharge 5–6)",
      text: "Dexterity Saving Throw: DC 15, one creature within 60 feet. Failure: 12 (2d8 + 3) Piercing damage.",
    });
  });

  it("moves single-value Recharge text into the feature title", () => {
    expect(
      normalizeBestiaryFeatureWording({
        title: "Wail",
        text: "Recharge 6. Wisdom Saving Throw: DC 15, each creature within 30 feet.",
      }),
    ).toEqual({
      title: "Wail (Recharge 6)",
      text: "Wisdom Saving Throw: DC 15, each creature within 30 feet.",
    });
  });

  it("normalizes bare area targets without inventing missing origins", () => {
    expect(
      normalizeBestiaryRulesText(
        "Dexterity Saving Throw: DC 14, creatures in a 10-foot Radius. Failure: 10 (4d4) Poison damage.",
      ),
    ).toBe("Dexterity Saving Throw: DC 14, each creature in a 10-foot Radius. Failure: 10 (4d4) Poison damage.");

    expect(
      normalizeBestiaryRulesText(
        "Dexterity Saving Throw: DC 14, each creature in a 15-foot Radius centered on the corpse. Failure: The target has the Prone condition.",
      ),
    ).toBe(
      "Dexterity Saving Throw: DC 14, each creature in a 15-foot-radius Sphere centered on the corpse. Failure: The target has the Prone condition.",
    );

    expect(
      normalizeBestiaryRulesText(
        "Dexterity Saving Throw: DC 14, each creature in a 10-foot Emanation. Failure: The target has the Restrained condition.",
      ),
    ).toBe(
      "Dexterity Saving Throw: DC 14, each creature in a 10-foot Emanation. Failure: The target has the Restrained condition.",
    );
  });

  it("renders area origins from targeting metadata", () => {
    const text = renderStructuredRulesText(
      {
        id: "targeting-origin-fixture",
        title: "Targeting Origin Fixture",
        rules: {
          section: "action",
          actionEconomy: "action",
          usage: { type: "atWill" },
          resolution: { type: "savingThrow", ability: "dexterity", dc: "monster" },
          targeting: { type: "area", shape: "emanation", size: 10, unit: "ft", targets: "creatures", origin: "corpse" },
          damage: { mode: "none" },
          text: { failure: "The target has the Restrained condition until the end of its next turn.", success: "No effect." },
        },
      },
      COMPUTED,
    );

    expect(text).toContain("Dexterity Saving Throw: DC 15, each creature in a 10-foot Emanation originating from the corpse.");
    expect(getBestiaryWordingIssues({ title: "Targeting Origin Fixture", text })).toEqual([]);
  });

  it("flags pre-normalized Bestiary wording regressions", () => {
    const issues = getBestiaryWordingIssues({
      title: "Web",
      text: "Recharge 5-6. Dexterity Saving Throw: DC 14, each creature in a 10-foot Emanation. Failure: the target takes 22 (4d10) Psychic damage and has the Frightened condition.",
    });
    expect(issues.map((issue) => issue.check)).toEqual([
      "bestiary-failure-damage-wording",
      "bestiary-recharge-dash",
      "bestiary-recharge-title",
      "bestiary-emanation-origin",
    ]);
  });

  it("renders representative grafts without Bestiary wording warnings", () => {
    const features = WORDING_GRAFT_IDS.map(graft);
    const computed = { ...COMPUTED, abilityModel: buildMonsterAbilitiesFromFeatures(features) };
    const items = features.map((feature) => {
      const normalized = normalizeBestiaryFeatureWording({
        title: feature.title,
        text: renderStructuredRulesText(feature, computed),
      });
      return {
        id: feature.id,
        title: normalized.title,
        sectionId: feature.rules?.section || feature.section || "actions",
        text: normalized.text,
      };
    });
    const statBlock = {
      sections: [
        {
          id: "actions",
          title: "Actions",
          items: [
            {
              id: "fallback-strike",
              title: "Fallback Strike",
              text: "Melee Attack Roll: +7, reach 5 ft. Hit: 10 (2d6 + 3) Slashing damage.",
            },
          ],
        },
        { id: "traits", title: "Traits", items },
      ],
    };
    const exportText = items.map((item) => `${item.title}. ${item.text}`).join("\n");
    const parsed = parseMonsterRenderedStatBlock({ exportText, statBlock, selectedFeatures: features, computed });
    const bestiaryIssues = parsed.issues.filter((issue) => String(issue.check || "").startsWith("bestiary-"));

    expect(bestiaryIssues).toEqual([]);
  });
});
