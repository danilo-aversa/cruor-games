import { describe, expect, it } from "vitest";
import { monsterGraftToSharedComponent } from "../../../shared/content/monster-components.js";
import { sharedComponentToMonsterGraft } from "./monster-content-pack-feed.js";

const canonicalAttackPattern = Object.freeze({
  schemaVersion: "monster-graft-v2.0",
  id: "pressure-collapse",
  title: "Pressure Collapse",
  kind: "attackPattern",
  slot: "attack",
  section: "action",
  source: "decomposition",
  sourceAnchors: ["decomposition"],
  typeBias: ["undead"],
  roleBias: ["standard", "boss"],
  cost: 4,
  complexity: 2,
  stats: { dpr: 4, control: 1 },
  balanceProfile: {
    schemaVersion: "monster-graft-balance-v1.0",
    stats: { dpr: 4, control: 1 },
  },
  identity: {
    fantasy: "A swollen corpse collapses into its victim.",
    tacticalRole: "single-target displacement",
    signature: "impact and rupture",
  },
  abilities: [
    {
      id: "heavy-slam",
      title: "Heavy Slam",
      rules: {
        schemaVersion: "monster-graft-rules-v1.15",
        section: "action",
        actionEconomy: "action",
        usage: { type: "atWill" },
        resolution: { type: "attackRoll" },
        targeting: { type: "single" },
        damage: { mode: "budget", budgetRole: "mainAttack" },
        references: [],
      },
    },
  ],
  routine: {
    mode: "authored",
    defaultSequence: ["heavy-slam"],
  },
  modifiers: [{ target: "body", operation: "append" }],
  compatibility: {
    requires: [],
    softRequires: ["bloated-body"],
    grants: ["impact-pattern"],
    incompatibleWith: [],
  },
  hooks: {
    grants: ["impact-attack"],
  },
  authoring: {
    schemaVersion: "monster-graft-authoring-v1.0",
    origin: "inspiration-module",
    canonical: true,
    migrationStatus: "canonical",
    sourcePath: "shared/content/inspiration-modules/decomposition.js",
  },
  migration: {
    legacyGraftIds: ["slam-decomposition"],
    status: "canonical",
  },
  summary: "A complete offensive pattern.",
  mechanics: "The creature uses its authored routine.",
  counterplay: "Keep distance and deny a straight approach.",
  fit: {
    encounterFootprint: { allowed: ["standard"], recommended: ["standard"] },
  },
});

describe("monster shared-component boundary", () => {
  it("round-trips Graft v2 fields without flattening the ability bundle", () => {
    const component = monsterGraftToSharedComponent(canonicalAttackPattern);
    const roundTripped = sharedComponentToMonsterGraft(component, {
      id: "decomposition-pack",
      title: "Decomposition",
    });

    expect(component.monster.graftSchemaVersion).toBe("monster-graft-v2.0");
    expect(component.monster.kind).toBe("attackPattern");
    expect(component.monster.abilities).toEqual(canonicalAttackPattern.abilities);
    expect(component.monster.routine).toEqual(canonicalAttackPattern.routine);
    expect(component.monster.modifiers).toEqual(canonicalAttackPattern.modifiers);
    expect(component.monster.compatibility).toEqual(canonicalAttackPattern.compatibility);
    expect(component.monster.migration).toEqual(canonicalAttackPattern.migration);
    expect(component.monster.authoring.canonical).toBe(true);

    expect(roundTripped.schemaVersion).toBe("monster-graft-v2.0");
    expect(roundTripped.kind).toBe("attackPattern");
    expect(roundTripped.abilities).toEqual(canonicalAttackPattern.abilities);
    expect(roundTripped.routine).toEqual(canonicalAttackPattern.routine);
    expect(roundTripped.modifiers).toEqual(canonicalAttackPattern.modifiers);
    expect(roundTripped.compatibility).toEqual(canonicalAttackPattern.compatibility);
    expect(roundTripped.hooks).toEqual(canonicalAttackPattern.hooks);
    expect(roundTripped.migration).toEqual(canonicalAttackPattern.migration);
    expect(roundTripped.authoring.origin).toBe("inspiration-module");
    expect(roundTripped.authoring.canonical).toBe(true);
  });
});
