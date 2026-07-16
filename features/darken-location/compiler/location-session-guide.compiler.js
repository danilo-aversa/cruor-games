function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function cloneJson(value, fallback) {
  try {
    return value === undefined ? fallback : JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function uniqueStrings(values = []) {
  return [...new Set(values.map(cleanText).filter(Boolean))];
}

function sortRooms(rooms = []) {
  return [...rooms].sort(
    (left, right) =>
      Number(left.number || 0) - Number(right.number || 0) ||
      cleanText(left.id).localeCompare(cleanText(right.id)),
  );
}

function formatId(value) {
  return cleanText(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function createIssue(code, path, message, severity = "error") {
  return { code, path, message, severity };
}

function isAuthored(component = {}) {
  return component.provenance?.migration?.method !== "compatibility-normalized";
}

function findEntranceRoom(rooms = []) {
  return (
    rooms.find((room) =>
      /entrance|arrival|threshold/i.test(cleanText(room.role)),
    ) ||
    rooms[0] ||
    null
  );
}

function buildOpeningBeat(semantic = {}, identity = {}, rooms = []) {
  const authored = semantic.openingBeat || {};
  const entrance = findEntranceRoom(rooms);
  return {
    situation: cleanText(
      authored.situation,
      identity.currentSituationParagraph || identity.historyParagraph,
    ),
    immediateSignal: cleanText(
      authored.immediateSignal,
      entrance?.readAloud?.compact ||
        entrance?.immediateImpressions?.[0]?.text ||
        entrance?.readAloud?.standard,
    ),
    playerDecision: cleanText(
      authored.playerDecision,
      identity.playerEntryPoint || identity.stakes?.[0],
    ),
    entranceRoomId: cleanText(entrance?.id),
    entranceRoomNumber: Number(entrance?.number || 0),
    entranceRoomName: cleanText(entrance?.name),
  };
}

function buildObjectives(semantic = {}, identity = {}) {
  const authored = uniqueStrings(asArray(semantic.objectives));
  if (authored.length) return authored;
  return uniqueStrings([
    identity.playerEntryPoint,
    ...asArray(identity.stakes),
  ]);
}

function addDashboardMetadata(block = {}) {
  const resolvedRule = block.metadata?.resolvedRule || {};
  const state = resolvedRule.state || {};
  const thresholds = asArray(resolvedRule.escalation)
    .map((entry) => ({
      at: Number(entry.at),
      effect: cleanText(entry.effect),
    }))
    .filter((entry) => Number.isFinite(entry.at) && entry.effect)
    .sort((left, right) => left.at - right.at);
  return {
    ...cloneJson(block, {}),
    metadata: {
      ...cloneJson(block.metadata, {}),
      dashboard: {
        label: cleanText(state.label, block.title || block.id),
        minimum: Number.isFinite(Number(state.minimum))
          ? Number(state.minimum)
          : 0,
        maximum: Number.isFinite(Number(state.maximum))
          ? Number(state.maximum)
          : Math.max(1, ...thresholds.map((entry) => entry.at)),
        initial: Number.isFinite(Number(state.initial))
          ? Number(state.initial)
          : 0,
        thresholds,
        trigger: cloneJson(resolvedRule.trigger, {}),
        resolution: cloneJson(resolvedRule.resolution, {}),
        reset: cloneJson(resolvedRule.reset, {}),
      },
    },
  };
}

function buildRuleReferences(
  semantic = {},
  globalRuleBlocks = [],
  issues = [],
) {
  const byId = new Map(globalRuleBlocks.map((block) => [block.id, block]));
  const pressureIds = uniqueStrings([
    semantic.pressureTrackId,
    ...globalRuleBlocks
      .filter(
        (block) => block.metadata?.resolvedRule?.category === "pressure-track",
      )
      .map((block) => block.id),
  ]);
  const alwaysOnIds = uniqueStrings(
    asArray(semantic.alwaysOnRuleIds).length
      ? semantic.alwaysOnRuleIds
      : globalRuleBlocks
          .filter(
            (block) =>
              block.metadata?.resolvedRule?.category !== "pressure-track",
          )
          .map((block) => block.id),
  );

  pressureIds.forEach((id) => {
    if (byId.has(id)) return;
    issues.push(
      createIssue(
        "session-guide.missing-pressure-track",
        "document.sessionGuide.pressureTracks",
        `Session Guide references missing pressure track ${id}.`,
      ),
    );
  });
  alwaysOnIds.forEach((id) => {
    if (byId.has(id)) return;
    issues.push(
      createIssue(
        "session-guide.missing-always-on-rule",
        "document.sessionGuide.alwaysOnRules",
        `Session Guide references missing always-on rule ${id}.`,
      ),
    );
  });

  return {
    pressureTracks: pressureIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map(addDashboardMetadata),
    alwaysOnRules: alwaysOnIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map(addDashboardMetadata),
  };
}

function collectRevelationEvidence(rooms = []) {
  const evidenceByRevelation = new Map();
  rooms.forEach((room) => {
    asArray(room.recurringSigns).forEach((sign) => {
      const revelationId = cleanText(sign.metadata?.revelationLink);
      if (!revelationId) return;
      const evidence = evidenceByRevelation.get(revelationId) || [];
      evidence.push({
        id: sign.id,
        kind: "recurring-sign",
        title: cleanText(sign.title, "Recurring Sign"),
        text: cleanText(sign.text),
        roomId: room.id,
        roomNumber: Number(room.number || 0),
        roomName: cleanText(room.name),
        sourceComponentId: cleanText(sign.sourceComponentId),
      });
      asArray(room.clues).forEach((clue) => {
        evidence.push({
          id: clue.id,
          kind: "clue",
          title: cleanText(clue.title, "Clue"),
          text: cleanText(clue.text || clue.summary),
          roomId: room.id,
          roomNumber: Number(room.number || 0),
          roomName: cleanText(room.name),
          sourceComponentId: cleanText(clue.sourceComponentId),
        });
      });
      evidenceByRevelation.set(revelationId, evidence);
    });
  });
  return evidenceByRevelation;
}

function dedupeEvidence(values = []) {
  const byKey = new Map();
  values.forEach((entry) => {
    const key = `${entry.roomId}:${entry.id}`;
    if (!byKey.has(key)) byKey.set(key, entry);
  });
  return [...byKey.values()].sort(
    (left, right) =>
      left.roomNumber - right.roomNumber ||
      left.kind.localeCompare(right.kind) ||
      left.id.localeCompare(right.id),
  );
}

function buildClueFlow(semantic = {}, rooms = [], issues = []) {
  const source = semantic.clueFlow || {};
  const requiredIds = uniqueStrings(asArray(source.requiredRevelations));
  const evidenceByRevelation = collectRevelationEvidence(rooms);
  const linkEndpointIds = asArray(source.links).flatMap((link) => [
    cleanText(link.from),
    cleanText(link.to),
  ]);
  const nodeIds = uniqueStrings([
    ...requiredIds,
    ...linkEndpointIds,
    ...evidenceByRevelation.keys(),
  ]).sort();
  const nodes = nodeIds.map((id) => {
    const evidence = dedupeEvidence(evidenceByRevelation.get(id) || []);
    const sign = evidence.find((entry) => entry.kind === "recurring-sign");
    return {
      id,
      title: cleanText(sign?.title, formatId(id).replace(/ Revelation$/i, "")),
      summary: cleanText(sign?.text, evidence[0]?.text),
      required: requiredIds.includes(id),
      available: evidence.length > 0,
      roomIds: uniqueStrings(evidence.map((entry) => entry.roomId)),
      sourceBlockIds: uniqueStrings(evidence.map((entry) => entry.id)),
      evidence,
    };
  });
  const knownIds = new Set(nodes.map((node) => node.id));
  const links = asArray(source.links)
    .map((link) => ({
      id: `${cleanText(link.from)}--${cleanText(link.to)}`,
      from: cleanText(link.from),
      to: cleanText(link.to),
      condition: cleanText(link.condition),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));

  links.forEach((link) => {
    if (knownIds.has(link.from) && knownIds.has(link.to)) return;
    issues.push(
      createIssue(
        "session-guide.invalid-clue-link",
        "document.sessionGuide.clueFlow.links",
        `Clue link ${link.id} references an unknown revelation.`,
      ),
    );
  });
  nodes
    .filter((node) => node.required && !node.available)
    .forEach((node) => {
      issues.push(
        createIssue(
          "session-guide.impossible-required-revelation",
          `document.sessionGuide.clueFlow.nodes.${node.id}`,
          `Required revelation ${node.id} has no room evidence.`,
        ),
      );
    });

  const incomingIds = new Set(links.map((link) => link.to));
  return {
    requiredRevelations: requiredIds,
    entryNodeIds: nodes
      .filter((node) => !incomingIds.has(node.id))
      .map((node) => node.id),
    nodes,
    links,
    fallbackClues: asArray(source.fallbackClues).map((text, index) => ({
      id: `fallback-clue-${index + 1}`,
      text: cleanText(text),
      supportsRevelationId:
        requiredIds[Math.min(index, Math.max(0, requiredIds.length - 1))] || "",
    })),
  };
}

function buildStallMoves(semantic = {}, rooms = []) {
  const authored = asArray(semantic.stallMoves).map((move) => ({
    id: cleanText(move.id),
    trigger: cleanText(move.trigger),
    action: cleanText(move.action),
    source: "authored-session-guide",
  }));
  const requiredIds = new Set(
    asArray(semantic.clueFlow?.requiredRevelations).map(cleanText),
  );
  const supplemental = sortRooms(rooms)
    .flatMap((room) =>
      asArray(room.recurringSigns)
        .filter(
          (sign) => !requiredIds.has(cleanText(sign.metadata?.revelationLink)),
        )
        .map((sign) => ({ sign, room })),
    )
    .filter(
      ({ sign }, index, values) =>
        values.findIndex(
          (entry) => entry.sign.sourceComponentId === sign.sourceComponentId,
        ) === index,
    )
    .map(({ sign, room }) => ({
      id: `reveal-${cleanText(sign.sourceComponentId || sign.id)}`,
      trigger:
        "The group has no actionable lead and the current scene has gone quiet.",
      action: `${cleanText(sign.text)} Point the sign toward ${cleanText(room.name)}.`,
      source: "unused-recurring-sign",
      roomId: room.id,
      sourceBlockId: sign.id,
    }));
  return [
    ...authored,
    ...supplemental.slice(0, Math.max(0, 3 - authored.length)),
  ];
}

function buildRoomShortcuts(semantic = {}, rooms = [], clueFlow = {}) {
  const pacing = semantic.pacing || {};
  const roomById = new Map(rooms.map((room) => [room.id, room]));
  const authoredRoute = uniqueStrings(asArray(pacing.defaultRoute)).filter(
    (roomId) => roomById.has(roomId),
  );
  const orderedIds = uniqueStrings([
    ...authoredRoute,
    ...sortRooms(rooms).map((room) => room.id),
  ]);
  const escalationIds = new Set(asArray(pacing.escalationRooms).map(cleanText));

  return orderedIds.map((roomId, routeIndex) => {
    const room = roomById.get(roomId);
    const clueNodeIds = asArray(clueFlow.nodes)
      .filter((node) => asArray(node.roomIds).includes(roomId))
      .map((node) => node.id);
    return {
      id: `shortcut-${room.id}`,
      roomId: room.id,
      number: Number(room.number || 0),
      name: cleanText(room.name),
      role: cleanText(room.role),
      level: Number(room.level || 0),
      shape: cleanText(room.shape),
      routeIndex,
      escalation: escalationIds.has(roomId),
      signal: cleanText(room.immediateImpressions?.[0]?.text),
      danger: cleanText(room.hazards?.[0]?.title),
      clueNodeIds,
      guidance:
        escalationIds.has(roomId) || /final|climax/i.test(cleanText(room.role))
          ? cleanText(pacing.climaxGuidance)
          : "",
    };
  });
}

function validateGuide(guide = {}, issues = []) {
  ["situation", "immediateSignal", "playerDecision"].forEach((field) => {
    if (cleanText(guide.openingBeat?.[field])) return;
    issues.push(
      createIssue(
        "session-guide.incomplete-opening-beat",
        `document.sessionGuide.openingBeat.${field}`,
        `Session Guide opening beat requires ${field}.`,
      ),
    );
  });
  if (!guide.objectives.length) {
    issues.push(
      createIssue(
        "session-guide.objective-required",
        "document.sessionGuide.objectives",
        "Session Guide requires at least one immediate objective.",
      ),
    );
  }
  if (!guide.stallMoves.length) {
    issues.push(
      createIssue(
        "session-guide.stall-move-required",
        "document.sessionGuide.stallMoves",
        "Session Guide requires at least one actionable stall move.",
      ),
    );
  }
}

export function compileLocationSessionGuide({
  seedGuide = {},
  components = [],
  identity = {},
  globalRuleBlocks = [],
  rooms = [],
  fallbackProvenance = {},
} = {}) {
  const primary = components.find(isAuthored);
  if (!primary) {
    return deepFreeze({
      sessionGuide: cloneJson(seedGuide, {}),
      diagnostics: [],
    });
  }

  const issues = [];
  const semantic = primary.semantic || {};
  const orderedRooms = sortRooms(rooms);
  const clueFlow = buildClueFlow(semantic, orderedRooms, issues);
  const rules = buildRuleReferences(semantic, globalRuleBlocks, issues);
  const guide = {
    openingBeat: buildOpeningBeat(semantic, identity, orderedRooms),
    objectives: buildObjectives(semantic, identity),
    pressureTracks: rules.pressureTracks,
    alwaysOnRules: rules.alwaysOnRules,
    clueFlow,
    stallMoves: buildStallMoves(semantic, orderedRooms),
    roomShortcuts: buildRoomShortcuts(semantic, orderedRooms, clueFlow),
    provenance:
      primary.semantic?.provenance ||
      primary.provenance ||
      seedGuide.provenance ||
      fallbackProvenance,
  };
  validateGuide(guide, issues);
  return deepFreeze({ sessionGuide: guide, diagnostics: issues });
}
