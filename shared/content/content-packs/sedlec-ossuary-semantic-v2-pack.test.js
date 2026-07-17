import { describe, expect, it } from "vitest";

import {
  SEMANTIC_SCHEMA_VERSIONS,
  serializeCanonicalSemanticContent,
  validateContentPackV0_2,
  validateGlobalRuleV1,
  validatePlaceIdentityV1,
  validateReadAloudProfileV1,
  validateRecurringSignV1,
  validateSensoryProfileV1,
  validateSessionGuideV1,
  validateSiteAtmosphereV1,
} from "../contracts/semantic/index.js";
import {
  SEDLEC_OSSUARY_SEMANTIC_V2_MODULE,
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK_ID,
} from "./sedlec-ossuary-semantic-v2-pack.js";

const SPECIALIZED_VALIDATORS = Object.freeze({
  "place-identity": validatePlaceIdentityV1,
  "site-atmosphere": validateSiteAtmosphereV1,
  "global-rule": validateGlobalRuleV1,
  "recurring-sign": validateRecurringSignV1,
  "sensory-profile": validateSensoryProfileV1,
  "read-aloud-profile": validateReadAloudProfileV1,
  "session-guide": validateSessionGuideV1,
});

function errors(issues) {
  return issues.filter((issue) => issue.severity === "error");
}

describe("Sedlec Ossuary semantic v2 editorial pack", () => {
  it("validates the dedicated pack and its Archive + Dark Places profiles", () => {
    expect(validateContentPackV0_2(SEDLEC_OSSUARY_SEMANTIC_V2_PACK)).toEqual(
      [],
    );
    expect(SEDLEC_OSSUARY_SEMANTIC_V2_PACK).toMatchObject({
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
      id: SEDLEC_OSSUARY_SEMANTIC_V2_PACK_ID,
      status: "draft",
    });
    expect(SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.packId).toBe(
      SEDLEC_OSSUARY_SEMANTIC_V2_PACK_ID,
    );
    expect(SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.capabilities).toEqual([
      "dark-places",
      "inspiration-archive",
    ]);
    expect(SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.capabilities).not.toContain(
      "monster-composer",
    );
    expect(
      SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.components.some(
        (component) => component.semanticType === "monster-graft",
      ),
    ).toBe(false);
  });

  it("records human approval without inferring publication", () => {
    expect(SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.status).toBe("in-review");
    expect(SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.inspiration.status).toBe(
      "approved",
    );
    expect(
      SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.provenance.migration.editorialDecision,
    ).toBe("approved");
    expect(SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.metadata.reviewedAt).toBe(
      "2026-07-16",
    );
    expect(SEDLEC_OSSUARY_SEMANTIC_V2_PACK.metadata).toMatchObject({
      humanApprovalRequired: false,
      editorialStatus: "approved",
      publicationBlockers: ["image-provenance-required"],
    });
    expect(
      SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.sourceAnchor.editorialNotes.join(" "),
    ).toMatch(/historical source|fictional transformation|approved by Danilo/i);
  });

  it("carries normalized non-compatibility provenance on every semantic object", () => {
    const records = [
      SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.inspiration,
      SEDLEC_OSSUARY_SEMANTIC_V2_MODULE,
      ...SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.components,
      ...SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.components.map(
        (component) => component.semantic,
      ),
    ];

    records.forEach((record) => {
      expect(record.provenance.schemaVersion).toBe(
        SEMANTIC_SCHEMA_VERSIONS.PROVENANCE,
      );
      expect(record.provenance.sources).not.toHaveLength(0);
      expect(record.provenance.migration.method).toBe("editorially-migrated");
      expect(record.provenance.migration.method).not.toBe(
        "compatibility-normalized",
      );
    });
  });

  it("is structurally ready while publication remains separately gated", () => {
    SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.components.forEach((component) => {
      const validate = SPECIALIZED_VALIDATORS[component.semanticType];
      expect(validate, component.semanticType).toBeTypeOf("function");
      expect(
        errors(
          validate(component.semantic, {
            path: `components.${component.id}.semantic`,
            published: true,
          }),
        ),
        component.id,
      ).toEqual([]);
    });
  });

  it("has four bounded recurring signs and one detailed mechanical rule", () => {
    const signs = SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.components.filter(
      (component) => component.semanticType === "recurring-sign",
    );
    const rules = SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.components.filter(
      (component) => component.semanticType === "global-rule",
    );

    expect(signs).toHaveLength(4);
    signs.forEach((sign) => {
      expect(sign.semantic.variations).toHaveLength(3);
      expect(sign.semantic.placement.maximumRooms).toBeGreaterThanOrEqual(
        sign.semantic.placement.minimumRooms,
      );
    });
    expect(rules).toHaveLength(1);
    expect(rules[0].semantic).toMatchObject({
      id: "ossuary-litany",
      resolution: {
        timing: "end-of-round",
        savingThrow: { ability: "Wisdom", scalingKey: "intrusion" },
      },
    });
    expect(rules[0].semantic.counterplay.length).toBeGreaterThan(0);
    expect(rules[0].semantic.escalation).toHaveLength(2);
  });

  it("is deeply frozen and canonically serializable", () => {
    const first = serializeCanonicalSemanticContent(
      SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
    );
    const second = serializeCanonicalSemanticContent(
      SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
    );

    expect(Object.isFrozen(SEDLEC_OSSUARY_SEMANTIC_V2_PACK)).toBe(true);
    expect(
      Object.isFrozen(SEDLEC_OSSUARY_SEMANTIC_V2_MODULE.components[0].semantic),
    ).toBe(true);
    expect(second).toBe(first);
  });
});
