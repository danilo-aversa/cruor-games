import { describe, expect, it } from "vitest";

import {
  evaluateMonsterFrameFit,
  inferMonsterFrameFit,
  normalizeMonsterFrameFit,
  validateMonsterFrameFit,
} from "./monster-frame-fit.js";

describe("Monster Frame Fit", () => {
  it("hard-blocks explicit forbidden encounter footprints", () => {
    const feature = {
      id: "boss-only-graft",
      title: "Boss Only Graft",
      fit: {
        encounterRoles: {
          forbidden: ["minion"],
        },
      },
    };

    const result = evaluateMonsterFrameFit(feature, {
      roleId: "minion",
      tacticalRoleId: "brute",
      monsterTierId: "normal",
      tempoProfileId: "standard",
      dangerId: "standard",
      targetCr: 2,
    });

    expect(result.kind).toBe("incompatible");
    expect(result.hardBlock).toBe(true);
  });

  it("uses recommended values as ranking hints rather than hard blocks", () => {
    const feature = {
      id: "controller-graft",
      title: "Controller Graft",
      fit: {
        tacticalRoles: {
          recommended: ["controller"],
        },
      },
    };

    const bruteResult = evaluateMonsterFrameFit(feature, {
      roleId: "standard",
      tacticalRoleId: "brute",
      monsterTierId: "normal",
      tempoProfileId: "standard",
      dangerId: "hard",
      targetCr: 5,
    });

    const controllerResult = evaluateMonsterFrameFit(feature, {
      roleId: "standard",
      tacticalRoleId: "controller",
      monsterTierId: "normal",
      tempoProfileId: "standard",
      dangerId: "hard",
      targetCr: 5,
    });

    expect(bruteResult.kind).toBe("discouraged");
    expect(bruteResult.hardBlock).toBe(false);
    expect(controllerResult.kind).toBe("recommended");
    expect(controllerResult.rankModifier).toBeLessThan(bruteResult.rankModifier);
  });

  it("infers soft fit from structured pressure and control", () => {
    const inferred = inferMonsterFrameFit({
      id: "web-maze",
      title: "Web Maze",
      slot: "lair",
      cost: 6,
      complexity: 4,
      stats: { control: 3 },
      rules: {
        actionEconomy: "lairAction",
        targeting: { type: "area" },
        condition: { names: ["restrained"], severity: "major" },
      },
    });

    expect(inferred.tacticalRoles.recommended).toContain("controller");
    expect(inferred.tiers.recommended).toContain("boss");
    expect(inferred.cr.recommendedMin).toBeGreaterThanOrEqual(5);
  });

  it("validates unknown explicit values", () => {
    const report = validateMonsterFrameFit({
      tacticalRoles: {
        allowed: ["sniper"],
      },
    });

    expect(report.issues.some((issue) => issue.severity === "error")).toBe(true);
  });

  it("normalizes aliases used by Content Studio and migration scripts", () => {
    const normalized = normalizeMonsterFrameFit({
      footprint: {
        allowed: ["standard"],
      },
      targetCr: {
        min: 5,
      },
      tempoProfiles: {
        recommended: ["ambusher"],
      },
    });

    expect(normalized.encounterRoles.allowed).toEqual(["standard"]);
    expect(normalized.cr.min).toBe(5);
    expect(normalized.tempo.recommended).toEqual(["ambusher"]);
  });
});
