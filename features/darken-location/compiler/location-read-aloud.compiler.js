import { scoreLocationCompilerChoice } from "./location-compiler-rng.js";

const HARD_SPOILER_TAGS = Object.freeze([
  "secret",
  "solution",
  "hidden-creature",
  "hidden-threat",
  "gm-only",
  "gm-only-consequence",
  "future-reveal",
  "true-name",
]);

const ROLE_ALIASES = Object.freeze({
  clue: ["clue", "threshold"],
  final: ["final", "climax"],
});

const GEOMETRY_ALIASES = Object.freeze({
  circle: ["circle", "circular"],
  circular: ["circle", "circular"],
  rotunda: ["circle", "circular"],
  corridor: ["corridor", "narrow"],
  passage: ["passage", "narrow"],
  gallery: ["gallery", "large"],
  hall: ["hall", "large"],
  shaft: ["shaft", "vertical"],
  stair: ["stair", "vertical"],
  stairs: ["stairs", "vertical"],
  ruin: ["ruin", "ruined"],
  ruined: ["ruin", "ruined"],
});

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function normalizeToken(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueStrings(values = []) {
  return [...new Set(values.map(cleanText).filter(Boolean))].sort();
}

function ensureSentence(value) {
  const text = cleanText(value);
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function countWords(value) {
  return cleanText(value).split(/\s+/).filter(Boolean).length;
}

function countSentences(value) {
  return Math.max(
    0,
    (cleanText(value).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).filter(
      (sentence) => cleanText(sentence),
    ).length,
  );
}

function isEditoriallyAuthored(component = {}) {
  return component.provenance?.migration?.method !== "compatibility-normalized";
}

function getRoomIntensity(room = {}) {
  return (
    room.immediateImpressions?.find(
      (block) =>
        block.metadata?.compilerStage === "allocate-sensory-impressions",
    )?.metadata?.intensity || "medium"
  );
}

function getRoomRoleTokens(room = {}) {
  const role = normalizeToken(room.role);
  return new Set([role, ...(ROLE_ALIASES[role] || [])].filter(Boolean));
}

function getRoomGeometryTokens(room = {}) {
  const values = [room.shape, room.role, room.name].map(normalizeToken);
  const tokens = new Set(values.filter(Boolean));
  values.forEach((value) => {
    Object.entries(GEOMETRY_ALIASES).forEach(([key, aliases]) => {
      if (value === key || value.includes(key))
        aliases.forEach((alias) => tokens.add(alias));
    });
  });
  return tokens;
}

function getRoomFeatureText(room = {}) {
  return [
    room.name,
    room.role,
    room.shape,
    ...(room.sourceComponentIds || []),
    ...(room.visibleFeatures || []).flatMap((block) => [
      block.id,
      block.title,
      block.text,
      block.summary,
      block.sourceComponentId,
    ]),
    ...(room.recurringSigns || []).flatMap((block) => [
      block.id,
      block.title,
      block.text,
      block.summary,
      block.sourceComponentId,
    ]),
  ]
    .map(normalizeToken)
    .filter(Boolean)
    .join(" ");
}

function getFragmentCompatibility(fragment, room, intensity) {
  const roleTokens = getRoomRoleTokens(room);
  const geometryTokens = getRoomGeometryTokens(room);
  const featureText = getRoomFeatureText(room);
  const roomRoles = new Set((fragment.roomRoles || []).map(normalizeToken));
  const geometries = new Set((fragment.geometry || []).map(normalizeToken));
  const visibleFeatures = (fragment.visibleFeatures || []).map(normalizeToken);
  const fragmentIntensity = normalizeToken(fragment.intensity);
  const roleMatch =
    !roomRoles.size || [...roomRoles].some((role) => roleTokens.has(role));
  const geometryMatch =
    !geometries.size ||
    [...geometries].some((geometry) => geometryTokens.has(geometry));
  const featureMatch =
    !visibleFeatures.length ||
    visibleFeatures.some((feature) => featureText.includes(feature));
  const intensityMatch = !fragmentIntensity || fragmentIntensity === intensity;
  return {
    compatible: roleMatch && geometryMatch && featureMatch && intensityMatch,
    score:
      (roomRoles.size && roleMatch ? 8 : 0) +
      (geometries.size && geometryMatch ? 6 : 0) +
      (visibleFeatures.length && featureMatch ? 5 : 0) +
      (fragmentIntensity && intensityMatch ? 3 : 0),
  };
}

function hasSpoilerTag(fragment, forbiddenTags) {
  const tags = new Set((fragment.tags || []).map(normalizeToken));
  return [...forbiddenTags].some((tag) => tags.has(tag));
}

function collectProfileFragments(components = []) {
  return components.flatMap((component) =>
    Object.entries(component.semantic?.fragments || {}).flatMap(
      ([group, fragments]) =>
        (fragments || []).map((fragment) => ({
          ...fragment,
          group,
          sourceComponentId: fragment.sourceComponentId || component.id,
          sourceAnchorIds: [...(component.sourceAnchors || [])],
          provenance:
            fragment.provenance ||
            component.semantic?.provenance ||
            component.provenance,
        })),
    ),
  );
}

function rankFragments(candidates, room, intensity, seed, group) {
  const compatible = candidates
    .map((candidate) => ({
      candidate,
      compatibility: getFragmentCompatibility(candidate, room, intensity),
    }))
    .filter((entry) => entry.compatibility.compatible);
  const source = compatible.length
    ? compatible
    : candidates
        .filter(
          (candidate) =>
            !(candidate.roomRoles || []).length &&
            !(candidate.geometry || []).length &&
            !(candidate.visibleFeatures || []).length &&
            !candidate.intensity,
        )
        .map((candidate) => ({
          candidate,
          compatibility: { compatible: true, score: 0 },
        }));
  return source
    .sort((left, right) => {
      const compatibilityDelta =
        right.compatibility.score - left.compatibility.score;
      if (compatibilityDelta) return compatibilityDelta;
      const scoreDelta =
        scoreLocationCompilerChoice(
          seed,
          `read-aloud-${group}`,
          room.id,
          right.candidate.id,
        ) -
        scoreLocationCompilerChoice(
          seed,
          `read-aloud-${group}`,
          room.id,
          left.candidate.id,
        );
      return scoreDelta || left.candidate.id.localeCompare(right.candidate.id);
    })
    .slice(0, 4)
    .map((entry, rank) => ({
      ...entry.candidate,
      selectionRank: rank,
      compatibilityScore: entry.compatibility.score,
    }));
}

function createSensoryCandidates(room = {}) {
  return (room.immediateImpressions || [])
    .filter((block) => block.audience !== "gm" && cleanText(block.text))
    .map((block, index) => ({
      id: block.metadata?.sourceFragmentId || block.id,
      text: block.text,
      group: "sensoryBeats",
      roomRoles: [],
      geometry: [],
      visibleFeatures: [],
      intensity: block.metadata?.intensity || "",
      tags: [],
      sourceComponentId: block.sourceComponentId,
      sourceAnchorIds: [...(block.sourceAnchorIds || [])],
      provenance: block.provenance,
      selectionRank: index,
      compatibilityScore: 0,
    }));
}

function createFallbackFragment(group, room, component, diagnostics) {
  const roomName = cleanText(room.name).replace(/^\d+\s+/, "") || "room";
  const shape = cleanText(room.shape) || "enclosed";
  const texts = {
    spatialAnchors: `The ${shape} ${roomName} gathers its details around a single visible route forward.`,
    sensoryBeats: `The air changes at the center of the ${roomName}, making each breath briefly distinct.`,
    visibleFeatures: `One deliberate arrangement draws the eye away from the room's edges.`,
    unsettlingDetails: `A small inconsistency makes the otherwise careful arrangement feel newly altered.`,
    motionOrChange: `As the room falls quiet, one part of the arrangement settles out of sequence.`,
    exitsAndDepth: `The clearest exit carries the room's sounds farther into the site.`,
  };
  diagnostics.push({
    code: "read-aloud.fragment-fallback",
    severity: "warning",
    path: `rooms.${room.id}.readAloud`,
    message: `${room.name} has no compatible ${group} fragment; a visible room-specific draft fallback was used.`,
  });
  return {
    id: `fallback-${group}-${room.id}`,
    text: texts[group],
    group,
    roomRoles: [],
    geometry: [],
    visibleFeatures: [],
    intensity: "",
    tags: ["draft-fallback"],
    sourceComponentId: component.id,
    sourceAnchorIds: [...(component.sourceAnchors || [])],
    provenance: component.semantic?.provenance || component.provenance,
    selectionRank: 99,
    compatibilityScore: 0,
  };
}

function product(groups, index = 0, prefix = [], results = []) {
  if (index >= groups.length) {
    results.push(prefix);
    return results;
  }
  groups[index].forEach((value) =>
    product(groups, index + 1, [...prefix, value], results),
  );
  return results;
}

function evaluateCombination(
  combination,
  { seed, roomId, variant, range, sentenceLimit },
) {
  const text = combination
    .map((fragment) => ensureSentence(fragment.text))
    .join(" ");
  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);
  const distance =
    wordCount < range[0]
      ? range[0] - wordCount
      : wordCount > range[1]
        ? wordCount - range[1]
        : 0;
  const sentenceOverflow = Math.max(0, sentenceCount - sentenceLimit);
  const rankPenalty = combination.reduce(
    (total, fragment) => total + Number(fragment.selectionRank || 0),
    0,
  );
  const compatibility = combination.reduce(
    (total, fragment) => total + Number(fragment.compatibilityScore || 0),
    0,
  );
  return {
    combination,
    text,
    wordCount,
    sentenceCount,
    score:
      distance * 100000000 +
      sentenceOverflow * 1000000000 +
      rankPenalty * 10000 -
      compatibility * 100 +
      (scoreLocationCompilerChoice(
        seed,
        `read-aloud-combination-${variant}`,
        roomId,
        combination.map((fragment) => fragment.id).join("|"),
      ) %
        97),
  };
}

function composeVariant({
  variant,
  groupNames,
  candidatesByGroup,
  constraints,
  seed,
  room,
  diagnostics,
}) {
  const sentenceLimit = constraints.maximumSentences[variant];
  const selectedGroups = groupNames.slice(0, sentenceLimit);
  const combinations = product(
    selectedGroups.map((group) => candidatesByGroup[group]),
  ).map((combination) =>
    evaluateCombination(combination, {
      seed,
      roomId: room.id,
      variant,
      range: constraints.wordRanges[variant],
      sentenceLimit,
    }),
  );
  const selected = combinations.sort(
    (left, right) =>
      left.score - right.score || left.text.localeCompare(right.text),
  )[0];
  if (!selected) {
    diagnostics.push({
      code: "read-aloud.composition-empty",
      severity: "error",
      path: `rooms.${room.id}.readAloud.${variant}`,
      message: `No ${variant} Read-Aloud composition could be created for ${room.name}.`,
    });
    return { text: "", fragments: [], wordCount: 0, sentenceCount: 0 };
  }
  const [minimum, maximum] = constraints.wordRanges[variant];
  if (selected.wordCount < minimum || selected.wordCount > maximum) {
    diagnostics.push({
      code: "read-aloud.word-range",
      severity: "warning",
      path: `rooms.${room.id}.readAloud.${variant}`,
      message: `${room.name} ${variant} Read-Aloud has ${selected.wordCount} words; target is ${minimum}-${maximum}.`,
    });
  }
  return {
    text: selected.text,
    fragments: selected.combination,
    wordCount: selected.wordCount,
    sentenceCount: selected.sentenceCount,
  };
}

function createFragmentBlocks(room, variants) {
  const uses = new Map();
  Object.entries(variants).forEach(([variant, result]) => {
    result.fragments.forEach((fragment, order) => {
      const key = `${fragment.group}:${fragment.id}`;
      if (!uses.has(key)) uses.set(key, { fragment, usedIn: [] });
      uses.get(key).usedIn.push({ variant, order });
    });
  });
  return [...uses.values()].map(({ fragment, usedIn }) => ({
    id: `read-aloud-${room.id}-${normalizeToken(fragment.group)}-${normalizeToken(fragment.id)}`,
    kind: "read-aloud",
    subtype: fragment.group,
    title: "",
    text: ensureSentence(fragment.text),
    summary: "",
    audience: "both",
    facets: [],
    sourceComponentId: fragment.sourceComponentId,
    sourceAnchorIds: [...fragment.sourceAnchorIds],
    mechanics: null,
    counterplay: "",
    narrative: "",
    provenance: fragment.provenance,
    metadata: {
      compilerStage: "compose-read-aloud",
      sourceFragmentId: fragment.id,
      fragmentGroup: fragment.group,
      tags: [...(fragment.tags || [])],
      usedIn: usedIn.sort((left, right) =>
        `${left.variant}:${left.order}`.localeCompare(
          `${right.variant}:${right.order}`,
        ),
      ),
    },
  }));
}

export function composeRoomReadAloud({
  rooms = [],
  components = [],
  seed = "",
} = {}) {
  const authoredComponents = [...components]
    .filter(isEditoriallyAuthored)
    .sort((left, right) => left.id.localeCompare(right.id));
  if (!authoredComponents.length) {
    return deepFreeze({ rooms: [...rooms], diagnostics: [], compositions: {} });
  }

  const primary = authoredComponents[0];
  const constraints = primary.semantic.constraints;
  const forbiddenTags = new Set([
    ...HARD_SPOILER_TAGS,
    ...(constraints.forbiddenSpoilerTags || []).map(normalizeToken),
  ]);
  const allFragments = collectProfileFragments(authoredComponents);
  const safeFragments = allFragments.filter(
    (fragment) => !hasSpoilerTag(fragment, forbiddenTags),
  );
  const diagnostics = [];
  const compositions = {};

  const compiledRooms = [...rooms]
    .sort(
      (left, right) =>
        Number(left.number || 0) - Number(right.number || 0) ||
        left.id.localeCompare(right.id),
    )
    .map((room) => {
      const intensity = getRoomIntensity(room);
      const candidatesByGroup = {};
      [
        "spatialAnchors",
        "visibleFeatures",
        "unsettlingDetails",
        "motionOrChange",
        "exitsAndDepth",
      ].forEach((group) => {
        const ranked = rankFragments(
          safeFragments.filter((fragment) => fragment.group === group),
          room,
          intensity,
          seed,
          group,
        );
        candidatesByGroup[group] = ranked.length
          ? ranked
          : [createFallbackFragment(group, room, primary, diagnostics)];
      });
      const sensory = createSensoryCandidates(room);
      candidatesByGroup.sensoryBeats = sensory.length
        ? sensory
        : [createFallbackFragment("sensoryBeats", room, primary, diagnostics)];

      const variants = {
        compact: composeVariant({
          variant: "compact",
          groupNames: ["spatialAnchors", "sensoryBeats"],
          candidatesByGroup,
          constraints,
          seed,
          room,
          diagnostics,
        }),
        standard: composeVariant({
          variant: "standard",
          groupNames: [
            "spatialAnchors",
            "sensoryBeats",
            "visibleFeatures",
            "unsettlingDetails",
          ],
          candidatesByGroup,
          constraints,
          seed,
          room,
          diagnostics,
        }),
        extended: composeVariant({
          variant: "extended",
          groupNames: [
            "spatialAnchors",
            "sensoryBeats",
            "visibleFeatures",
            "unsettlingDetails",
            "motionOrChange",
            "exitsAndDepth",
          ],
          candidatesByGroup,
          constraints,
          seed,
          room,
          diagnostics,
        }),
      };
      const fragments = createFragmentBlocks(room, variants);
      const leakedFragments = fragments.filter((block) =>
        (block.metadata.tags || []).some((tag) =>
          forbiddenTags.has(normalizeToken(tag)),
        ),
      );
      if (leakedFragments.length) {
        diagnostics.push({
          code: "read-aloud.spoiler-leak",
          severity: "error",
          path: `rooms.${room.id}.readAloud`,
          message: `${room.name} includes forbidden player-facing fragments: ${leakedFragments.map((block) => block.metadata.sourceFragmentId).join(", ")}.`,
        });
      }
      compositions[room.id] = Object.fromEntries(
        Object.entries(variants).map(([variant, result]) => [
          variant,
          {
            wordCount: result.wordCount,
            sentenceCount: result.sentenceCount,
            sourceFragmentIds: result.fragments.map((fragment) => fragment.id),
          },
        ]),
      );
      return {
        ...room,
        readAloud: {
          compact: variants.compact.text,
          standard: variants.standard.text,
          extended: variants.extended.text,
          fragments,
          provenance: primary.semantic?.provenance || primary.provenance,
        },
        sourceComponentIds: uniqueStrings([
          ...(room.sourceComponentIds || []),
          ...fragments.map((block) => block.sourceComponentId),
        ]),
      };
    });

  return deepFreeze({ rooms: compiledRooms, diagnostics, compositions });
}
