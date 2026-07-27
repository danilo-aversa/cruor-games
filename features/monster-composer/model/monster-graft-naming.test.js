import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import {
  MONSTER_GRAFT_NAMING_REVIEWED_SLOTS,
  auditMonsterGraftDisplayName,
  buildMonsterGraftNamingCatalogAudit,
} from "./monster-graft-naming.js";

describe("Monster Graft published names", () => {
  it("keeps reviewed Attack, Body, Mind, Movement, Horror, and Twist names short and punctuation-free", () => {
    const audit = buildMonsterGraftNamingCatalogAudit(MONSTER_GRAFTS);
    expect(audit.reviewedSlots).toEqual([...MONSTER_GRAFT_NAMING_REVIEWED_SLOTS].sort());
    expect(audit.total).toBe(65);
    expect(audit.errors).toEqual([]);
    expect(audit.pass).toBe(true);
  });

  it("preserves canonical non-Attack names while allowing evocative Attack Pattern titles", () => {
    expect(
      auditMonsterGraftDisplayName({
        id: "cunning-action-spirit",
        slot: "movement",
        title: "Cunning Action",
      }),
    ).toMatchObject({ pass: true, canonicalBestiaryName: true });
    expect(
      auditMonsterGraftDisplayName({
        id: "stench",
        slot: "horror",
        title: "Stench",
      }),
    ).toMatchObject({ pass: true, canonicalBestiaryName: true });
    expect(
      auditMonsterGraftDisplayName({
        id: "undead-fortitude",
        slot: "twist",
        title: "Undead Fortitude",
      }),
    ).toMatchObject({ pass: true, canonicalBestiaryName: true });
    expect(
      auditMonsterGraftDisplayName({
        id: "siege-corpse",
        slot: "twist",
        title: "Siege Monster",
      }),
    ).toMatchObject({ pass: true, canonicalBestiaryName: true });
    expect(
      auditMonsterGraftDisplayName({
        id: "slam-decomposition",
        slot: "attack",
        title: "Crusher",
      }),
    ).toMatchObject({ pass: true, canonicalBestiaryName: false });
    expect(
      auditMonsterGraftDisplayName({
        id: "cold-funeral-touch",
        slot: "attack",
        title: "Cold Funeral Touch",
      }),
    ).toMatchObject({ pass: true, approvedException: true });
  });

  it("rejects noncanonical compound names and dash punctuation", () => {
    const report = auditMonsterGraftDisplayName({
      id: "bad-name",
      slot: "mind",
      title: "Corpse-Worn Mourner Delusion",
    });
    expect(report.pass).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["GRAFT_NAME_HAS_DASH", "GRAFT_NAME_TOO_COMPOUND"]),
    );
  });
});
