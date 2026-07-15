import { describe, expect, it } from "vitest";
import { getStaticContentRegistry } from "../../shared/content/content.index.js";
import {
  INSPIRATION_DOMAIN_ORDER,
  INSPIRATION_DOMAINS,
  INSPIRATION_OBSCURITY,
  formatInspirationCardNumber,
  getInspirationCardMeta,
} from "./inspirations.card-config.js";

const INSPIRATION_WORKFLOW_ID = "inspiration-archive";

describe("Inspiration card metadata", () => {
  it("provides complete card metadata for every archive inspiration", () => {
    const inspirations = getStaticContentRegistry().getInspirations({
      workflow: INSPIRATION_WORKFLOW_ID,
    });

    expect(inspirations).toHaveLength(14);

    inspirations.forEach((inspiration, index) => {
      const meta = getInspirationCardMeta(inspiration, {
        fallbackNumber: index + 1,
      });

      expect(INSPIRATION_DOMAINS[meta.domainId]).toBeDefined();
      expect(INSPIRATION_OBSCURITY[meta.obscurityId]).toBeDefined();
      expect(meta.collectionId).toBe("existing-inspirations");
      expect(meta.collectionLabel).toBe("Existing Inspirations");
      expect(meta.description.length).toBeGreaterThan(180);
      expect(meta.number).toBeGreaterThan(0);
      expect(meta.numberLabel).toMatch(/^\d{3}$/);
    });
  });

  it("keeps the six-domain collectible-card vocabulary stable", () => {
    expect(INSPIRATION_DOMAIN_ORDER).toEqual([
      "tale",
      "place",
      "body",
      "relic",
      "violence",
      "rite",
    ]);
    expect(formatInspirationCardNumber(14)).toBe("014");
  });
});
