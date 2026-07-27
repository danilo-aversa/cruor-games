import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";
import { buildMonsterRulesParityReport } from "./monster-rules-parity.js";
import {
  buildMonsterSupportGraftCatalogAudit,
  isMonsterSupportGraft,
} from "./monster-support-graft.js";

const supportGrafts = MONSTER_GRAFTS.filter(isMonsterSupportGraft);

describe("Phase 6 support graft migration", () => {
  it("migrates the complete non-Attack catalog to Graft v2", () => {
    const audit = buildMonsterSupportGraftCatalogAudit(MONSTER_GRAFTS);

    expect(supportGrafts).toHaveLength(78);
    expect(audit).toMatchObject({
      total: 78,
      passing: 78,
      error: 0,
      scaled: 23,
      verifiedParity: 78,
      candidateParity: 0,
      pass: true,
    });
    expect(audit.errors).toEqual([]);
  });

  it("keeps identity, profiles, and counterplay explicit for every support graft", () => {
    supportGrafts.forEach((graft) => {
      expect(graft.identity.fantasy).toBeTruthy();
      expect(graft.identity.tacticalRole).toBeTruthy();
      expect(graft.identity.signature).toBeTruthy();
      expect(graft.identity.recognitionTags.length).toBeGreaterThanOrEqual(3);
      expect(graft.abilities.length).toBeGreaterThanOrEqual(1);
      expect(graft.balanceProfile).toBeTruthy();
      expect(graft.complexityProfile).toBeTruthy();
      expect(graft.counterplayProfile).toBeTruthy();
      expect(graft.spikeRiskProfile).toBeTruthy();

      const counterplayChannels = [
        graft.counterplayProfile.telegraphs,
        graft.counterplayProfile.positioningAnswers,
        graft.counterplayProfile.breakConditions,
        graft.counterplayProfile.nonDamageAnswers,
      ].filter((entries) => Array.isArray(entries) && entries.length);
      expect(counterplayChannels.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("preserves verified structured-rule and renderer parity", () => {
    supportGrafts.forEach((graft) => {
      graft.abilities.forEach((ability) => {
        const feature = {
          ...ability,
          id: `${graft.id}:${ability.id}`,
          source: graft.source,
          sourceAnchors: graft.sourceAnchors,
          slot: graft.slot,
        };
        const renderedText = renderStructuredRulesText(feature, {
          attack: 5,
          dc: 13,
          dpr: 12,
          targetCr: 2,
          category: "Zombie",
          categoryNoun: "zombie",
          rulesContext: { categoryNoun: "zombie" },
        });
        const report = buildMonsterRulesParityReport(feature, { renderedText });

        expect(report.applicable).toBe(true);
        expect(report.pass).toBe(true);
        expect(report.errors).toBe(0);
      });
    });
  });

  it("keeps verified parity across every declared CR progression", () => {
    supportGrafts
      .filter((graft) => graft.progression?.bands?.length)
      .forEach((graft) => {
        [1, 5, 10, 15].forEach((targetCr) => {
          const bundle = buildMonsterAbilityBundleFromGraft(graft, { targetCr });
          bundle.abilities
            .filter((ability) => !ability.synthetic)
            .forEach((ability) => {
              const renderedText = renderStructuredRulesText(ability, {
                attack: 5,
                dc: 13,
                dpr: 12,
                targetCr,
                category: "Zombie",
                categoryNoun: "zombie",
                rulesContext: { categoryNoun: "zombie" },
              });
              const report = buildMonsterRulesParityReport(ability, {
                renderedText,
              });
              expect(report.pass).toBe(true);
            });
        });
      });
  });

});
