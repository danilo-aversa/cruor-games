import { describe, expect, it } from "vitest";
import { ALL_MONSTER_GRAFTS as MONSTER_GRAFTS } from "../data/monster-content-pack-feed.js";
import { getCompatibilityStatus, getGrantedTokens } from "./monster-composer.compatibility.js";

function graft(id) {
  const feature = MONSTER_GRAFTS.find((item) => item.id === id);
  if (!feature) throw new Error(`Missing graft fixture: ${id}`);
  return feature;
}

describe("Monster Composer effective anatomy compatibility", () => {
  it("allows web grafts on spider anatomy and blocks them on a normal zombie", () => {
    const web = graft("web-recharge");

    expect(getCompatibilityStatus(web, [], "beast", "Spider").kind).toBe("compatible");
    expect(getCompatibilityStatus(web, [], "undead", "Zombie").kind).toBe("incompatible");
  });

  it("derives legacy build tokens from the anatomy profile rather than category-only string matching", () => {
    const spiderTokens = getGrantedTokens([], "beast", "Spider");
    const zombieTokens = getGrantedTokens([], "undead", "Zombie");

    expect(spiderTokens).toContain("web_maker");
    expect(spiderTokens).toContain("web_terrain");
    expect(zombieTokens).not.toContain("web_maker");
    expect(zombieTokens).toContain("corpse_body");
  });

  it("lets body grafts grant anatomy tokens needed by follow-up grafts", () => {
    const web = graft("web-recharge");
    const bodyGrant = {
      id: "test-spider-infested-body",
      slot: "body",
      title: "Spider-Infested Body",
      source: "wolf-spiders",
      anatomyGrants: {
        grantsBodyPlans: ["arachnid"],
        grantsAnatomy: ["web_glands", "spinnerets"],
        grantsTags: ["web_bearing"],
        grantsTokens: ["web_maker", "web_terrain"],
      },
    };

    expect(getCompatibilityStatus(web, [bodyGrant], "undead", "Zombie").kind).toBe("compatible");
  });
});
