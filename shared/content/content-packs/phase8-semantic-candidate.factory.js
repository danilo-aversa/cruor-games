import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeContentPackV0_2,
  normalizeSemanticProvenance,
} from "../contracts/semantic/index.js";

function distributeLegacyIds(ids = [], bucketCount = 10) {
  const buckets = Array.from({ length: bucketCount }, () => []);
  ids.forEach((id, index) => buckets[index % bucketCount].push(id));
  return buckets;
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function requireSessionOpeningBeat(openingBeat, slug) {
  const fields = ["situation", "immediateSignal", "playerDecision"];
  const valid =
    openingBeat &&
    typeof openingBeat === "object" &&
    !Array.isArray(openingBeat) &&
    fields.every((field) => String(openingBeat[field] || "").trim());

  if (!valid) {
    throw new TypeError(
      `Phase 8 candidate ${slug || "unknown"} requires session.openingBeat with authored situation, immediateSignal, and playerDecision fields.`,
    );
  }

  return Object.fromEntries(
    fields.map((field) => [field, String(openingBeat[field]).trim()]),
  );
}

function countWords(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function ensureSentence(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

const READ_ALOUD_GROUP_EXPANSIONS = Object.freeze({
  spatialAnchors:
    "The marked retreat remains visible behind it, preserving a clear and reversible route for the group.",
  sensoryBeats:
    "The change stays localized to documented evidence, allowing the group to compare it against safer material.",
  visibleFeatures:
    "Nearby damage and repair marks make the feature testable without revealing the location's final answer.",
  unsettlingDetails:
    "The alteration follows a named trigger and leaves enough evidence for the group to verify what changed.",
  motionOrChange:
    "The movement advances only after visible pressure rises and never closes the previously announced withdrawal route.",
  exitsAndDepth:
    "The route remains legible from the current room and carries a warning before the deeper threshold resolves.",
});

function expandReadAloudText(text, group, minimumWords = 15) {
  const sentence = ensureSentence(text);
  const currentWords = countWords(sentence);
  if (currentWords >= minimumWords) return sentence;
  const suffix = String(READ_ALOUD_GROUP_EXPANSIONS[group] || "")
    .replace(/[.!?]+$/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, minimumWords - currentWords)
    .join(" ");
  return ensureSentence(
    `${sentence.replace(/[.!?]+$/, "")}; ${suffix}`.trim(),
  );
}

function makeSensoryVariants(config) {
  const [a, b, c, d] = config.sensoryMotifs;
  return {
    sight: [
      `${a} appears at the edge of the room.`,
      `${b} repeats in a visible pattern.`,
      `${c} marks the announced route.`,
      `${d} remains visible beside the safest documented retreat.`,
    ],
    sound: [
      `${a} answers with a dry echo.`,
      `${b} produces a delayed scrape.`,
      `${d} sounds closer after each trigger.`,
      `${c} answers from the route identified by the latest evidence.`,
    ],
    smell: [
      `The air carries ${config.smellLow}.`,
      `A stronger trace of ${config.smellMedium} gathers near evidence.`,
      `${config.smellHigh} announces the climax route.`,
      `${config.smellMedium} remains strongest beside the documented counterplay materials.`,
    ],
    touch: [
      `Surfaces feel ${config.touchLow}.`,
      `Handled evidence becomes ${config.touchMedium}.`,
      `The announced threshold turns ${config.touchHigh}.`,
      `${config.touchLow} contact changes only along the marked and reversible route.`,
    ],
    taste: [],
    temperature: [],
    proprioception: [],
  };
}

function makeReadAloudFragments(config, componentId) {
  const groups = {
    spatialAnchors: [
      `${config.anchorA} defines the entrance.`,
      `${config.anchorB} divides the central route.`,
      `${config.safeAnchor} remains visibly reachable.`,
    ],
    sensoryBeats: [
      `${config.smellLow} hangs in the first room.`,
      `${config.touchMedium} follows contact with the evidence.`,
      `${config.soundBeat} repeats from the announced direction.`,
    ],
    visibleFeatures: [
      `${config.visibleA} repeats across several rooms.`,
      `${config.visibleB} identifies the damaged system.`,
      `${config.visibleC} marks the counterplay route.`,
    ],
    unsettlingDetails: [
      `${config.detailA} changes only after a named trigger.`,
      `${config.detailB} preserves evidence of an earlier use.`,
      `${config.detailC} points toward the conflict without solving it.`,
    ],
    motionOrChange: [
      `${config.motionA} shifts one step after pressure rises.`,
      `${config.motionB} stops when the material counterplay succeeds.`,
      `${config.motionC} never closes the visible withdrawal route.`,
    ],
    exitsAndDepth: [
      `${config.exitA} leads toward the primary evidence.`,
      `${config.exitB} returns to a documented safe position.`,
      `${config.exitC} reaches the climax only after its warning.`,
    ],
  };
  return Object.fromEntries(
    Object.entries(groups).map(([group, texts]) => [
      group,
      texts.map((text, index) => ({
        id: `${config.slug}-${group}-${index + 1}`,
        text: expandReadAloudText(text, group),
        sourceComponentId: componentId,
      })),
    ]),
  );
}

export function createPhase8SemanticCandidate(config) {
  const approval = config.approval || null;
  const approved = Boolean(approval?.reviewer && approval?.reviewedAt);
  const legacyComponents = config.legacyComponents || config.legacyModule.components;
  const legacyIds = unique(legacyComponents.map((component) => component.id));
  const legacyBuckets = distributeLegacyIds(legacyIds, 10);
  const reviewVersion = approved
    ? `phase8-${config.slug}-editorial-approved-v1`
    : `phase8-${config.slug}-editorial-candidate-v1`;

  function provenance(legacyBucket = [], relation = "derived", note = config.provenanceNote) {
    return normalizeSemanticProvenance({
      sources: [{ sourceAnchorId: config.slug, relation, note }],
      legacyIds: legacyBucket,
      migration: {
        fromSchema: "legacy-inspiration-module-v1",
        method: "editorially-migrated",
        editorialDecision: approved ? "approved" : "needs-revision",
        reviewVersion,
        note: config.migrationNote,
      },
    });
  }

  const moduleProvenance = provenance(
    [config.slug, `inspiration-${config.slug}`, config.title],
    "editorial-constraint",
    config.sourceBoundary,
  );

  function component({ id, title, semanticType, semantic, bucket, motifs = [], generation = {} }) {
    const componentProvenance = provenance(legacyBuckets[bucket]);
    return {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
      id,
      title,
      status: "in-review",
      contentType: "semantic-location-component",
      semanticType,
      workflows: ["darken-location"],
      slots: [],
      sourceAnchors: [config.slug],
      sourceTypes: config.sourceTypes,
      themes: config.themes,
      motifs,
      horror: config.horror,
      contexts: config.contexts,
      compatibility: {
        capabilities: ["dark-places"],
        excludedCapabilities: ["monster-composer"],
      },
      generation: { phase: 8, ...generation },
      semantic: { ...semantic, provenance: componentProvenance },
      provenance: componentProvenance,
    };
  }

  const identityId = `${config.slug}-place-identity`;
  const atmosphereId = `${config.slug}-site-atmosphere`;
  const ruleId = config.rule.id;
  const readAloudId = `${config.slug}-read-aloud-profile`;

  const components = [
    component({
      id: identityId,
      title: config.identity.title,
      semanticType: "place-identity",
      bucket: 0,
      motifs: config.identity.motifs,
      generation: { primary: true },
      semantic: {
        originalPurpose: config.identity.originalPurpose,
        originalUsers: config.identity.originalUsers,
        historicalChange: config.identity.historicalChange,
        horrorTruth: config.identity.horrorTruth,
        currentFunction: config.identity.currentFunction,
        currentConflict: config.identity.currentConflict,
        playerEntryPoints: config.identity.playerEntryPoints,
        stakes: config.identity.stakes,
        toneKeywords: config.identity.toneKeywords,
      },
    }),
    component({
      id: atmosphereId,
      title: config.atmosphere.title,
      semanticType: "site-atmosphere",
      bucket: 1,
      motifs: config.atmosphere.motifs,
      semantic: {
        signature: config.atmosphere.signature,
        manifestations: config.atmosphere.manifestations,
        exclusions: config.atmosphere.exclusions,
        escalationLinks: [ruleId],
      },
    }),
    component({
      id: ruleId,
      title: config.rule.title,
      semanticType: "global-rule",
      bucket: 2,
      motifs: config.rule.motifs,
      semantic: {
        id: ruleId,
        title: config.rule.title,
        scope: "location",
        category: "pressure-track",
        trigger: {
          events: config.rule.events,
          timing: "Immediately after a listed event; outside combat, also check the track at the end of each ten-minute exploration turn in an affected region.",
          frequencyLimit: "Once per combat round, or once per ten-minute exploration turn.",
        },
        state: { label: config.rule.stateLabel, minimum: 0, maximum: 4, initial: 0 },
        resolution: {
          timing: "At the end of each combat round; outside combat, at the end of each ten-minute exploration turn.",
          threshold: 2,
          savingThrow: null,
          check: { ability: config.rule.ability, skills: config.rule.skills, dc: null, scalingKey: "intrusion" },
          attackRoll: null,
          effect: {
            damage: "",
            damageType: "",
            healing: "",
            conditions: [],
            additionalText: config.rule.effect,
          },
          duration: "Until countered or until the next track check.",
          range: "location",
          area: "one announced route, room, evidence group, or threshold",
          frequency: "cadence-bound",
          actionEconomy: "environmental procedure",
        },
        counterplay: config.rule.counterplay,
        reset: { condition: config.rule.reset, value: 0 },
        escalation: [
          { at: 1, effect: config.rule.escalation[0] },
          { at: 2, effect: config.rule.escalation[1] },
          { at: 3, effect: config.rule.escalation[2] },
          { at: 4, effect: config.rule.escalation[3] },
        ],
        gmSummary: config.rule.gmSummary,
        playerFacingSigns: config.rule.playerFacingSigns,
      },
    }),
    ...config.signs.map((sign, signIndex) =>
      component({
        id: `${config.slug}-sign-${sign.id}`,
        title: sign.title,
        semanticType: "recurring-sign",
        bucket: 3 + signIndex,
        motifs: sign.motifs,
        semantic: {
          id: `${config.slug}-sign-${sign.id}`,
          description: sign.description,
          placement: {
            frequency: "recurring",
            minimumRooms: 1,
            maximumRooms: 3,
            allowedRoomRoles: ["entrance", "threshold", "clue", "ritual", "connector"],
            forbiddenRoomRoles: [],
            preferredFeatures: [],
          },
          variations: sign.variations,
          interaction: sign.interaction,
          revelationLink: sign.revelationLink,
        },
      }),
    ),
    component({
      id: `${config.slug}-sensory-profile`,
      title: config.sensoryTitle,
      semanticType: "sensory-profile",
      bucket: 7,
      motifs: config.sensoryMotifs,
      semantic: {
        signature: config.sensorySignature,
        variants: makeSensoryVariants(config),
        intensityTiers: {
          low: [`A faint trace of ${config.smellLow} marks the first clue.`, `${config.touchLow} contact confirms the system is active.`],
          medium: [`${config.soundBeat} repeats after the second trigger.`, `${config.visibleB} becomes impossible to overlook.`],
          high: [`${config.smellHigh} fills the announced route.`, `${config.touchHigh} pressure identifies the climax threshold.`],
        },
        roomRoleBias: {
          entrance: [config.anchorA], threshold: [config.visibleC], ritual: [config.anchorB], secret: [config.detailB], climax: [config.visibleB], connector: [config.exitB],
        },
        geometryBias: { circular: [], narrow: [config.exitA], large: [config.anchorB], vertical: [config.visibleA], ruined: [config.detailC] },
        exclusions: config.sensoryExclusions,
        repetitionPolicy: { exactTextCooldown: "all-rooms", senseCooldown: 1, allowSignatureRepeat: false },
      },
    }),
    component({
      id: readAloudId,
      title: config.readAloudTitle,
      semanticType: "read-aloud-profile",
      bucket: 8,
      motifs: config.sensoryMotifs,
      semantic: {
        fragments: makeReadAloudFragments(config, readAloudId),
        constraints: {
          forbiddenSpoilerTags: ["secret", "solution", "true-identity"],
          maximumSentences: { compact: 2, standard: 4, extended: 6 },
          wordRanges: { compact: [20, 35], standard: [45, 75], extended: [80, 120] },
        },
        grammar: { openingOrder: ["spatial-anchors", "sensory-beats"], allowSecondPerson: false, tense: "present" },
      },
    }),
    component({
      id: `${config.slug}-session-guide`,
      title: config.session.title,
      semanticType: "session-guide",
      bucket: 9,
      motifs: config.session.motifs,
      semantic: {
        openingBeat: requireSessionOpeningBeat(
          config.session.openingBeat,
          config.slug,
        ),
        objectives: config.session.objectives,
        alwaysOnRuleIds: [ruleId],
        pressureTrackId: ruleId,
        clueFlow: {
          requiredRevelations: config.session.revelations,
          links: [
            { from: config.session.revelations[0], to: config.session.revelations[1], condition: config.session.linkConditions[0] },
            { from: config.session.revelations[1], to: config.session.revelations[2], condition: config.session.linkConditions[1] },
          ],
          fallbackClues: config.session.fallbackClues,
        },
        stallMoves: config.session.stallMoves,
        pacing: {
          defaultRoute: ["location-region-1", "location-region-2", "location-region-3", "location-region-4", "location-region-5"],
          escalationRooms: ["location-region-3", "location-region-5"],
          climaxGuidance: config.session.climaxGuidance,
        },
      },
    }),
  ];

  const pack = normalizeContentPackV0_2({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
    id: `${config.slug}-semantic-v2`,
    title: `${config.title} Semantic Content Pack`,
    version: approved ? "0.2.0-phase8-approved1" : "0.2.0-phase8-candidate1",
    status: "draft",
    locale: "en",
    author: "Cruor Games",
    license: "internal-prototype",
    tags: ["dark-places", "inspiration-archive", config.slug, "phase8"],
    modules: [{
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
      id: config.slug,
      title: config.title,
      packId: `${config.slug}-semantic-v2`,
      status: "in-review",
      locale: "en",
      capabilities: ["inspiration-archive", "dark-places"],
      sourceAnchor: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
        id: config.slug,
        title: config.title,
        kind: config.sourceKind,
        status: "in-review",
        citation: { label: config.citation.label, url: config.citation.url, accessedVersion: `Accessed 2026-07-17; ${reviewVersion}` },
        summary: config.sourceSummary,
        reliability: config.citation.reliability,
        editorialNotes: config.editorialNotes,
        tags: config.sourceTags,
      },
      inspiration: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
        id: `inspiration-${config.slug}-v2`,
        slug: config.slug,
        title: config.title,
        status: approved ? "approved" : "in-review",
        sourceAnchors: [config.slug],
        sourceTypes: config.sourceTypes,
        themes: config.themes,
        motifs: config.motifs,
        horror: config.horror,
        contexts: config.contexts,
        editorial: config.editorial,
        media: config.media,
        tags: [`source:${config.slug}`, "capability:dark-places", config.reviewTag],
        provenance: moduleProvenance,
      },
      components,
      metadata: {
        author: "Cruor Games",
        revision: 1,
        reviewedAt: approval?.reviewedAt || "",
        sourceFile: `shared/content/content-packs/${config.slug}-semantic-v2-pack.js`,
        capabilityWaivers: [],
        modernCapabilityLinks: config.modernCapabilityLinks || [],
      },
      provenance: moduleProvenance,
    }],
    metadata: {
      bundled: true,
      registryRole: approved ? "semantic-v2-approved" : "semantic-v2-editorial-candidate",
      humanApprovalRequired: !approved,
      retainedLegacyPublicBehavior: true,
      editorialStatus: approved ? "approved" : "awaiting-human-signoff",
      publicationBlockers: approved
        ? approval.publicationBlockers || ["image-provenance-required"]
        : config.publicationBlockers,
      culturalSourceBoundary: config.sourceBoundary,
      modernCapabilityLinks: config.modernCapabilityLinks || [],
    },
  });

  return {
    pack,
    module: pack.modules[0],
    legacyIds: Object.freeze(legacyIds),
    reviewVersion,
  };
}
