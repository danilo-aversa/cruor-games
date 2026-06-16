import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import { buildMonsterAbilitiesFromFeatures } from "./monster-ability-model.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";
import { parseMonsterRenderedStatBlock } from "./monster-statblock-parser.js";

const AREA_TEXT_GRAFT_IDS = [
  "pressure-agony",
  "corpse-bloom-death",
  "purge-fluid-flood",
  "choking-air",
  "corpse-pressure-room",
  "funeral-silence-lair",
  "graveyard-offerings-lair",
  "sticky-surroundings",
  "broodmother-web-lair",
  "dense-web-region",
];

const COMPUTED = {
  targetCr: 5,
  dpr: 40,
  dc: 15,
  attack: 7,
  prof: 3,
  rulesetId: "dnd-5e-2024",
  baseline: { dpr: 40, hp: 120 },
};

function graft(id) {
  const feature = MONSTER_GRAFTS.find((item) => item.id === id);
  if (!feature) throw new Error(`Missing area text graft fixture: ${id}`);
  return feature;
}

function renderedItemFor(feature, computed) {
  return {
    id: feature.id,
    title: feature.title,
    sectionId: feature.rules?.section || feature.section || "trait",
    text: renderStructuredRulesText(feature, computed) || "",
  };
}

describe("Monster Composer area/lair/death rendered text", () => {
  it("does not render bare Radius or missing area-size placeholders", () => {
    const features = AREA_TEXT_GRAFT_IDS.map(graft);
    const computed = { ...COMPUTED, abilityModel: buildMonsterAbilitiesFromFeatures(features) };
    const badPattern = /\b(?:the\s+Radius|a\s+Radius|in\s+the\s+Radius|Radius\s+from|affected\s+radius\s+area|the\s+area\s+size|area\s+size)\b/i;

    features.forEach((feature) => {
      const text = renderStructuredRulesText(feature, computed) || "";
      expect(text, `${feature.id}: ${text}`).not.toMatch(badPattern);
    });
  });

  it("does not produce area parser blockers for area/lair/death fixtures", () => {
    const features = AREA_TEXT_GRAFT_IDS.map(graft);
    const computed = { ...COMPUTED, abilityModel: buildMonsterAbilitiesFromFeatures(features) };
    const items = features.map((feature) => renderedItemFor(feature, computed));
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
    const areaIssues = parsed.issues.filter((issue) => String(issue.check || "").startsWith("area-effect-"));

    expect(areaIssues).toEqual([]);
  });
});
