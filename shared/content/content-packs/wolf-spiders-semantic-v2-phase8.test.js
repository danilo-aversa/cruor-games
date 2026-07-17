import { describe, expect, it } from "vitest";

import { MONSTER_GRAFTS } from "../../../features/monster-composer/data/monster-grafts.js";
import { CRUOR_INSPIRATION_MODULES } from "../inspiration-modules.js";
import { getInspirationV2MigrationRecord } from "../migrations/inspiration-v2-migration-registry.js";
import { STATIC_SEMANTIC_CONTENT_PACKS } from "../static-semantic-content-packs.js";
import {
  WOLF_SPIDERS_MONSTER_GRAFT_V2_DEFINITIONS,
  WOLF_SPIDERS_MONSTER_GRAFT_V2_SOURCE_MODE,
} from "./wolf-spiders-monster-grafts-v2.js";
import {
  WOLF_SPIDERS_SEMANTIC_V2_CANDIDATE_STATUS,
  WOLF_SPIDERS_SEMANTIC_V2_WITHDRAWAL_REASON,
} from "./wolf-spiders-semantic-v2-pack.js";

describe("Phase 8 batch 4 withdrawal — Wolf Spiders", () => {
  it("removes Candidate 1 from the canonical semantic frontier", () => {
    const module = CRUOR_INSPIRATION_MODULES.find(
      (entry) => entry.id === "wolf-spiders",
    );

    expect(module.schemaVersion).not.toBe("cruor-inspiration-module-v2");
    expect(
      STATIC_SEMANTIC_CONTENT_PACKS.flatMap((pack) => pack.modules)
        .map(({ id }) => id),
    ).not.toContain("wolf-spiders");
    expect(WOLF_SPIDERS_SEMANTIC_V2_CANDIDATE_STATUS).toBe("withdrawn");
    expect(WOLF_SPIDERS_SEMANTIC_V2_WITHDRAWAL_REASON).toBe(
      "duplicated-modern-monster-ownership",
    );
  });

  it("keeps all 32 grafts in the existing modern Monster catalog only", () => {
    const modernGrafts = MONSTER_GRAFTS.filter((graft) =>
      (graft.sourceAnchors?.length ? graft.sourceAnchors : [graft.source])
        .filter(Boolean)
        .includes("wolf-spiders"),
    );

    expect(modernGrafts).toHaveLength(32);
    expect(WOLF_SPIDERS_MONSTER_GRAFT_V2_SOURCE_MODE).toBe(
      "retired-duplicate-bridge",
    );
    expect(WOLF_SPIDERS_MONSTER_GRAFT_V2_DEFINITIONS).toEqual([]);
  });

  it("records the withdrawn candidate while returning migration to pending", () => {
    expect(getInspirationV2MigrationRecord("wolf-spiders")).toMatchObject({
      migrationStatus: "pending",
      editorialStatus: "not-started",
      semanticCoverageStatus: "not-evaluated",
      sampleQaStatus: "not-run",
      modernCapabilityLinks: [
        {
          capability: "monster-composer",
          ownership: "external-modern-source",
          expectedEntries: 32,
        },
      ],
      withdrawnCandidate: {
        reviewVersion: "phase8-wolf-spiders-editorial-candidate-v1",
        reason: "duplicated-modern-monster-ownership",
      },
    });
  });
});
