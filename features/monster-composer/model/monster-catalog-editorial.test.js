import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import { buildMonsterCatalogEditorialAudit } from "./monster-catalog-editorial.js";

describe("Terrifying Monsters cross-catalog editorial gate", () => {
  const audit = buildMonsterCatalogEditorialAudit(MONSTER_GRAFTS);

  it("keeps the complete published catalog", () => {
    expect(audit.total).toBe(93);
  });

  it("has no mechanically duplicate Attack Patterns at representative CRs", () => {
    expect(audit.crossReview.duplicatePatternGroups).toEqual([]);
  });

  it("keeps declared complexity aligned with authored procedures", () => {
    expect(audit.crossReview.complexityMismatches).toEqual([]);
  });

  it("keeps every rendered ability within the hard Monster Manual style limit", () => {
    expect(audit.styleReview.hardOutliers).toEqual([]);
    expect(audit.styleReview.unreviewedLongForm).toEqual([]);
  });

  it("compiles every graft at all sampled CR checkpoints", () => {
    expect(audit.playabilityReview.validationFailures).toEqual([]);
  });

  it("passes the complete three-pass gate", () => {
    expect(audit.pass).toBe(true);
  });
});
