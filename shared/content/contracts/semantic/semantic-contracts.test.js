import { describe, expect, it } from "vitest";

import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeComponentV2,
  normalizeContentPackV0_2,
  normalizeGlobalRuleV1,
  normalizeInspirationModuleV2,
  normalizeInspirationV2,
  normalizePlaceIdentityV1,
  normalizeReadAloudProfileV1,
  normalizeRecurringSignV1,
  normalizeSemanticProvenance,
  normalizeSensoryProfileV1,
  normalizeSessionGuideV1,
  normalizeSiteAtmosphereV1,
  normalizeSourceAnchorV1,
  resolveMechanicalScaling,
  serializeCanonicalSemanticContent,
  validateComponentV2,
  validateContentPackV0_2,
  validateGlobalRuleV1,
  validateInspirationModuleV2,
  validatePlaceIdentityV1,
  validateReadAloudProfileV1,
  validateRecurringSignV1,
  validateSensoryProfileV1,
  validateSessionGuideV1,
  validateSiteAtmosphereV1,
} from "./index.js";

function createProvenance(overrides = {}) {
  return normalizeSemanticProvenance({
    sources: [
      {
        sourceAnchorId: "test-anchor",
        relation: "direct",
        note: "Authored from the reviewed test source.",
      },
    ],
    legacyIds: [],
    migration: {
      method: "authored-v2",
      editorialDecision: "approved",
      reviewVersion: "phase1-test-v1",
      note: "Approved test fixture.",
    },
    ...overrides,
  });
}

function createGlobalRule() {
  return normalizeGlobalRuleV1({
    id: "test-pressure",
    title: "Test Pressure",
    scope: "location",
    category: "pressure-track",
    trigger: {
      events: ["disturb-remains"],
      timing: "when-event-occurs",
      frequencyLimit: "once-per-turn",
    },
    state: { label: "Pressure", minimum: 0, maximum: 3, initial: 0 },
    resolution: {
      timing: "end-of-round",
      threshold: 2,
      savingThrow: {
        ability: "Wisdom",
        skills: [],
        dc: 14,
        scalingKey: "intrusion",
      },
      check: null,
      attackRoll: null,
      effect: {
        damage: "1d6",
        damageType: "psychic",
        healing: "",
        conditions: [],
        additionalText: "The creature cannot take reactions.",
      },
      duration: "until-start-of-next-turn",
      range: "location",
      area: "all-intruders",
      frequency: "once-per-round",
      actionEconomy: "automatic",
    },
    counterplay: [
      {
        id: "quiet-the-bones",
        actionCost: "action",
        check: { ability: "Intelligence", skills: ["Religion"], dc: 14 },
        success: "Reduce Pressure by 1.",
      },
    ],
    reset: {
      condition: "The location remains silent for ten minutes.",
      value: 0,
    },
    escalation: [{ at: 3, effect: "Every threshold becomes audible." }],
    gmSummary: "Disturbance advances Pressure; silence and study reduce it.",
    playerFacingSigns: ["A dry clicking follows every loud sound."],
    provenance: createProvenance(),
  });
}

function createSourceAnchor() {
  return normalizeSourceAnchorV1({
    id: "test-anchor",
    title: "Test Anchor",
    kind: "place",
    status: "published",
    citation: { label: "Reviewed Test Source" },
    summary: "A source used exclusively by semantic contract tests.",
    reliability: "primary",
    editorialNotes: [],
    tags: ["test"],
  });
}

function createInspiration() {
  return normalizeInspirationV2({
    id: "inspiration-test-anchor",
    slug: "test-anchor",
    title: "Test Anchor",
    status: "approved",
    sourceAnchors: ["test-anchor"],
    sourceTypes: ["Test Source"],
    themes: [],
    motifs: [],
    horror: [],
    contexts: [],
    editorial: {
      deck: "A compact archive summary.",
      thesis: "The opening thesis.",
      whatItIs: "A factual description for the test fixture.",
      cruorLensThesis: "The compact Cruor reading.",
      cruorLens: "The full Cruor editorial interpretation.",
      facts: [{ label: "Place", value: "Test Place" }],
      horrorStructures: [
        {
          id: "ritual-order",
          title: "Ritual Order",
          description: "A reusable horror mechanism.",
          feeds: "Feeds ritual components.",
          keywords: ["ritual"],
          componentIds: [],
        },
      ],
      triggerWarnings: ["Human remains"],
      tableSafety: ["Discuss visual boundaries before play."],
      lowIntensityAlternative: "Replace remains with carved stone.",
      sources: [
        {
          title: "Test Source",
          url: "https://example.com/source",
          description: "A source description.",
          meta: "Official source",
        },
      ],
      furtherReading: [],
      relatedDossiers: [
        {
          sourceAnchorId: "related-source",
          title: "Related Source",
          relationship: "Shared motif",
          description: "A related dossier.",
        },
      ],
      whyItDisturbs: "",
      creativeUses: [],
      cautions: [],
    },
    media: {
      imageTitle: "Test archive image",
      imageKey: "",
      imageProvider: "local",
      imageAlt: "",
      imageCredit: "",
      icon: "",
    },
    tags: ["test"],
    provenance: createProvenance(),
  });
}

describe("semantic v2 contracts", () => {
  it("normalizes a publishable Place Identity without mutating input", () => {
    const input = {
      originalPurpose: "A memorial archive.",
      originalUsers: ["Keepers"],
      historicalChange: "The archive began answering its own records.",
      horrorTruth: "Every catalogued name is being replaced.",
      currentFunction: "It records intruders as the dead.",
      currentConflict: "The final empty entry bears a living name.",
      playerEntryPoints: ["Recover a deliberately erased record."],
      stakes: ["The archive completes the replacement."],
      toneKeywords: ["dry", "clerical"],
      provenance: createProvenance(),
    };
    const before = JSON.stringify(input);
    const normalized = normalizePlaceIdentityV1(input);

    expect(normalized.schemaVersion).toBe(
      SEMANTIC_SCHEMA_VERSIONS.PLACE_IDENTITY,
    );
    expect(validatePlaceIdentityV1(normalized, { published: true })).toEqual(
      [],
    );
    expect(Object.isFrozen(normalized)).toBe(true);
    expect(JSON.stringify(input)).toBe(before);
  });

  it("rejects unknown authored fields and incomplete published identities", () => {
    const invalid = {
      ...normalizePlaceIdentityV1({ provenance: createProvenance() }),
      genericText: "This field must not be silently retained.",
    };
    const issues = validatePlaceIdentityV1(invalid, { published: true });

    expect(issues.map((issue) => issue.code)).toContain(
      "contract.unknown-field",
    );
    expect(issues.map((issue) => issue.code)).toContain(
      "contract.text-required",
    );
    expect(issues.map((issue) => issue.code)).toContain(
      "place-identity.entry-point-required",
    );
  });

  it("centralizes intrusion scaling with authored overrides", () => {
    expect(resolveMechanicalScaling({ tier: "low" })).toMatchObject({
      profileId: "intrusion",
      tier: "low",
      dc: 12,
      damage: "1d4",
    });
    expect(resolveMechanicalScaling({ tier: "extreme", dc: 19 })).toMatchObject(
      {
        tier: "extreme",
        dc: 19,
        damage: "3d6",
      },
    );
  });

  it("accepts complete Global Rules and rejects unknown scaling profiles", () => {
    const valid = createGlobalRule();
    expect(validateGlobalRuleV1(valid, { published: true })).toEqual([]);

    const invalid = normalizeGlobalRuleV1({
      ...valid,
      resolution: {
        ...valid.resolution,
        savingThrow: {
          ...valid.resolution.savingThrow,
          dc: null,
          scalingKey: "missing",
        },
      },
    });
    expect(
      validateGlobalRuleV1(invalid, { published: true }).map(
        (issue) => issue.code,
      ),
    ).toContain("scaling.unknown-profile");
  });

  it("enforces sensory uniqueness and published coverage", () => {
    const profile = normalizeSensoryProfileV1({
      signature: "Dry dust moves against the air.",
      variants: {
        sight: [
          "Pale seams",
          "Grey motes",
          "White scratches",
          "Powdered steps",
        ],
        sound: [
          "Small clicks",
          "A dry rasp",
          "A counted knock",
          "Muted chimes",
        ],
        smell: ["Cold lime", "Old incense", "Dry stone", "Spent wax"],
      },
      intensityTiers: {
        low: ["A single seam clicks."],
        medium: ["The walls answer in sequence."],
        high: [],
      },
      roomRoleBias: { entrance: ["Dust gathers at the threshold."] },
      geometryBias: { narrow: ["The rasp follows the corridor."] },
      exclusions: [],
      repetitionPolicy: {
        exactTextCooldown: "all-rooms",
        senseCooldown: 1,
        allowSignatureRepeat: false,
      },
      provenance: createProvenance(),
    });
    expect(validateSensoryProfileV1(profile, { published: true })).toEqual([]);

    const duplicated = normalizeSensoryProfileV1({
      ...profile,
      variants: { ...profile.variants, sight: ["Repeated", "Repeated"] },
    });
    const codes = validateSensoryProfileV1(duplicated, { published: true }).map(
      (issue) => issue.code,
    );
    expect(codes).toContain("sensory-profile.duplicate-text");
    expect(codes).toContain("sensory-profile.variant-coverage");
  });

  it("rejects duplicate and spoiler-tagged read-aloud fragments", () => {
    const profile = normalizeReadAloudProfileV1({
      fragments: {
        spatialAnchors: [
          {
            id: "first",
            text: "A narrow nave sinks ahead.",
            tags: ["visible"],
          },
          {
            id: "second",
            text: "A narrow nave sinks ahead.",
            tags: ["secret"],
          },
        ],
      },
      constraints: {
        forbiddenSpoilerTags: ["secret"],
        maximumSentences: { compact: 2, standard: 4, extended: 6 },
        wordRanges: {
          compact: [20, 35],
          standard: [45, 75],
          extended: [80, 120],
        },
      },
      grammar: {
        openingOrder: ["spatial"],
        allowSecondPerson: false,
        tense: "present",
      },
      provenance: createProvenance(),
    });
    const codes = validateReadAloudProfileV1(profile).map(
      (issue) => issue.code,
    );
    expect(codes).toContain("read-aloud.duplicate-fragment-text");
    expect(codes).toContain("read-aloud.forbidden-spoiler-tag");
  });

  it("validates Site Atmosphere uniqueness and published coverage", () => {
    const atmosphere = normalizeSiteAtmosphereV1({
      signature: "Dry clicking persists beneath every other sound.",
      manifestations: [
        {
          id: "bone-dust",
          text: "Fine white dust gathers against the draft.",
          senses: ["sight", "touch"],
          intensity: "low",
          frequency: "pervasive",
        },
        {
          id: "counted-clicks",
          text: "Small clicks answer in counted groups.",
          senses: ["sound"],
          intensity: "medium",
          frequency: "recurring",
        },
        {
          id: "cold-lime",
          text: "Cold lime dries the mouth.",
          senses: ["taste", "temperature"],
          intensity: "high",
          frequency: "rare",
        },
      ],
      exclusions: [],
      escalationLinks: ["test-pressure"],
      provenance: createProvenance(),
    });
    expect(validateSiteAtmosphereV1(atmosphere, { published: true })).toEqual(
      [],
    );

    const duplicated = {
      ...atmosphere,
      manifestations: [
        atmosphere.manifestations[0],
        atmosphere.manifestations[0],
      ],
    };
    const codes = validateSiteAtmosphereV1(duplicated).map(
      (issue) => issue.code,
    );
    expect(codes).toContain("site-atmosphere.duplicate-manifestation-id");
    expect(codes).toContain("site-atmosphere.duplicate-manifestation-text");
  });

  it("validates Recurring Sign placement and editorial variation coverage", () => {
    const sign = normalizeRecurringSignV1({
      id: "prayer-mortar",
      description: "Prayer slips and pale hair fill the mortar seams.",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 3,
        allowedRoomRoles: ["threshold"],
        forbiddenRoomRoles: [],
        preferredFeatures: ["masonry"],
      },
      variations: [
        "One slip bears a fresh fingerprint.",
        "A strand of hair moves without a draft.",
        "The ink continues beneath the stone.",
      ],
      interaction: null,
      revelationLink: "mortar-revelation",
      provenance: createProvenance(),
    });
    expect(validateRecurringSignV1(sign, { published: true })).toEqual([]);

    const invalid = {
      ...sign,
      placement: { ...sign.placement, minimumRooms: 4, maximumRooms: 2 },
      variations: ["Repeated", "Repeated"],
    };
    const codes = validateRecurringSignV1(invalid, { published: true }).map(
      (issue) => issue.code,
    );
    expect(codes).toContain("recurring-sign.invalid-room-range");
    expect(codes).toContain("recurring-sign.duplicate-variation");
    expect(codes).toContain("recurring-sign.variation-coverage");
  });

  it("validates Session Guide play support without deriving it from counts", () => {
    const guide = normalizeSessionGuideV1({
      openingBeat: {
        situation: "The sealed nave has opened during a memorial service.",
        immediateSignal: "A counted clicking begins behind the walls.",
        playerDecision: "Enter now or evacuate the mourners first.",
      },
      objectives: ["Find who resumed the unfinished litany."],
      alwaysOnRuleIds: ["test-pressure"],
      pressureTrackId: "test-pressure",
      clueFlow: {
        requiredRevelations: ["mortar-revelation"],
        links: [
          {
            from: "entry-clue",
            to: "mortar-revelation",
            condition: "The prayer slips are examined.",
          },
        ],
        fallbackClues: ["A keeper recognizes the copied hand."],
      },
      stallMoves: [
        {
          id: "advance",
          trigger: "Debate stalls.",
          action: "Advance Pressure.",
        },
        {
          id: "echo",
          trigger: "The route is unclear.",
          action: "Reveal a distant answer.",
        },
        {
          id: "witness",
          trigger: "A clue is missed.",
          action: "A witness arrives.",
        },
      ],
      pacing: {
        defaultRoute: ["entry", "nave", "crypt"],
        escalationRooms: ["nave"],
        climaxGuidance: "Bring the unfinished line into the final choice.",
      },
      provenance: createProvenance(),
    });
    expect(validateSessionGuideV1(guide, { published: true })).toEqual([]);

    const invalid = { ...guide, objectives: [], stallMoves: [] };
    const codes = validateSessionGuideV1(invalid, { published: true }).map(
      (issue) => issue.code,
    );
    expect(codes).toContain("session-guide.objective-required");
    expect(codes).toContain("session-guide.stall-move-coverage");
  });

  it("validates a published archive-only module and content pack", () => {
    const module = normalizeInspirationModuleV2({
      id: "test-anchor",
      title: "Test Anchor",
      packId: "test-pack",
      status: "published",
      locale: "en",
      capabilities: ["inspiration-archive"],
      sourceAnchor: createSourceAnchor(),
      inspiration: createInspiration(),
      components: [],
      metadata: {
        author: "Cruor Games",
        revision: 1,
        reviewedAt: "review-v1",
        sourceFile: "test-fixture",
        capabilityWaivers: [],
      },
      provenance: createProvenance(),
    });
    const pack = normalizeContentPackV0_2({
      id: "test-pack",
      title: "Test Pack",
      version: "1.0.0",
      status: "published",
      locale: "en",
      author: "Cruor Games",
      license: "internal-prototype",
      tags: [],
      modules: [module],
      metadata: {},
    });

    expect(module.inspiration.media.imageTitle).toBe("Test archive image");
    expect(module.inspiration.editorial.cruorLens).toBe(
      "The full Cruor editorial interpretation.",
    );
    expect(module.inspiration.editorial.horrorStructures[0]).toMatchObject({
      id: "ritual-order",
      title: "Ritual Order",
      keywords: ["ritual"],
    });
    expect(module.inspiration.editorial.sources[0].url).toBe(
      "https://example.com/source",
    );
    expect(validateInspirationModuleV2(module)).toEqual([]);
    expect(validateContentPackV0_2(pack)).toEqual([]);
  });

  it("makes capability validation dependent on declared support", () => {
    const module = normalizeInspirationModuleV2({
      id: "test-anchor",
      title: "Test Anchor",
      packId: "test-pack",
      status: "published",
      locale: "en",
      capabilities: ["inspiration-archive", "dark-places"],
      sourceAnchor: createSourceAnchor(),
      inspiration: createInspiration(),
      components: [],
      metadata: { author: "Cruor Games", revision: 1, capabilityWaivers: [] },
      provenance: createProvenance(),
    });
    const codes = validateInspirationModuleV2(module).map(
      (issue) => issue.code,
    );
    expect(codes).toContain("module.dark-places-coverage");
    expect(codes).not.toContain("module.monster-coverage");
  });

  it("dispatches specialized component validation from semanticType", () => {
    const component = normalizeComponentV2({
      id: "test-global-rule",
      title: "Test Global Rule",
      status: "published",
      contentType: "location-component",
      semanticType: "global-rule",
      workflows: ["darken-location"],
      slots: ["global-rule"],
      sourceAnchors: ["test-anchor"],
      sourceTypes: [],
      themes: [],
      motifs: [],
      horror: [],
      contexts: [],
      compatibility: {},
      generation: {},
      semantic: createGlobalRule(),
      provenance: createProvenance(),
    });
    expect(validateComponentV2(component)).toEqual([]);

    const invalid = { ...component, semanticType: "unknown-semantic" };
    expect(validateComponentV2(invalid).map((issue) => issue.code)).toContain(
      "component.unknown-semantic-type",
    );
  });

  it("serializes semantically equal object-key orders to identical bytes", () => {
    const left = { z: 1, a: { y: 2, x: 3 }, list: [{ b: 2, a: 1 }] };
    const right = { list: [{ a: 1, b: 2 }], a: { x: 3, y: 2 }, z: 1 };
    expect(serializeCanonicalSemanticContent(left)).toBe(
      serializeCanonicalSemanticContent(right),
    );
  });
});
