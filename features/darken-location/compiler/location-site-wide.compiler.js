import { resolveMechanicalScaling } from "../../../shared/content/content.index.js";

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

function cloneJson(value, fallback) {
  try {
    return value === undefined ? fallback : JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function isEditoriallyAuthored(component = {}) {
  return component.provenance?.migration?.method !== "compatibility-normalized";
}

function formatToken(value) {
  return cleanText(value).replace(/-/g, " ");
}

function formatCheck(check) {
  if (!check) return "";
  const skill = check.skills?.length ? ` (${check.skills.join(" or ")})` : "";
  return `${check.ability}${skill} DC ${check.dc}`.trim();
}

function resolveCheck(check, intrusion) {
  if (!check) return null;
  const scaling = check.scalingKey
    ? resolveMechanicalScaling({
        profileId: check.scalingKey,
        tier: intrusion,
        ...(check.dc === null || check.dc === undefined
          ? {}
          : { dc: check.dc }),
      })
    : null;
  return {
    ability: cleanText(check.ability),
    skills: [...(check.skills || [])],
    dc: check.dc ?? scaling?.dc ?? null,
    scalingKey: cleanText(check.scalingKey),
    scaling,
  };
}

function formatEffect(effect = {}) {
  return [
    effect.damage
      ? `${effect.damage}${effect.damageType ? ` ${effect.damageType}` : ""} damage`
      : "",
    effect.healing ? `${effect.healing} healing` : "",
    effect.conditions?.length
      ? `Conditions: ${effect.conditions.map(formatToken).join(", ")}`
      : "",
    cleanText(effect.additionalText),
  ]
    .filter(Boolean)
    .join("; ");
}

function formatTrigger(trigger = {}) {
  const events = (trigger.events || []).map(formatToken).join(", ");
  return [
    events,
    formatToken(trigger.timing),
    formatToken(trigger.frequencyLimit),
  ]
    .filter(Boolean)
    .join("; ");
}

function formatCounterplay(entries = [], intrusion) {
  return entries
    .map((entry) => {
      const check = resolveCheck(entry.check, intrusion);
      const action = formatToken(entry.actionCost);
      const checkText = formatCheck(check);
      return `${action}${checkText ? ` with ${checkText}` : ""}: ${cleanText(
        entry.success,
      )}`;
    })
    .join(" ");
}

function createBaseBlock(component, kind, overrides = {}) {
  return {
    id: component.id,
    kind,
    subtype: component.semanticType,
    title: component.title,
    text: cleanText(component.semantic?.signature || component.title),
    summary: "",
    audience: "gm",
    facets: [],
    sourceComponentId: component.id,
    sourceAnchorIds: [...component.sourceAnchors],
    mechanics: null,
    counterplay: "",
    narrative: "",
    provenance: component.semantic?.provenance || component.provenance,
    metadata: {
      semanticType: component.semanticType,
      contentType: component.contentType,
    },
    ...overrides,
  };
}

function compileAtmosphere(component) {
  const semantic = component.semantic || {};
  return createBaseBlock(component, "atmosphere", {
    text: semantic.signature,
    narrative: (semantic.manifestations || [])
      .map((manifestation) => manifestation.text)
      .join(" "),
    metadata: {
      semanticType: component.semanticType,
      manifestations: cloneJson(semantic.manifestations, []),
      exclusions: [...(semantic.exclusions || [])],
      escalationLinks: [...(semantic.escalationLinks || [])],
    },
  });
}

export function compileGlobalRule(component, intrusion = "medium") {
  const rule = component.semantic || {};
  const savingThrow = resolveCheck(rule.resolution?.savingThrow, intrusion);
  const check = resolveCheck(rule.resolution?.check, intrusion);
  const counterplay = (rule.counterplay || []).map((entry) => ({
    ...cloneJson(entry, {}),
    check: resolveCheck(entry.check, intrusion),
  }));
  const scalingKey =
    savingThrow?.scalingKey ||
    check?.scalingKey ||
    counterplay.find((entry) => entry.check?.scalingKey)?.check?.scalingKey ||
    "";
  const scaling = scalingKey
    ? resolveMechanicalScaling({ profileId: scalingKey, tier: intrusion })
    : null;
  const effect = {
    ...cloneJson(rule.resolution?.effect, {}),
    damage: cleanText(rule.resolution?.effect?.damage) || scaling?.damage || "",
  };
  const state = rule.state || {};
  const escalation = (rule.escalation || [])
    .map(
      (entry) =>
        `${entry.at}: ${cleanText(entry.effect).replace(/[.;]+$/, "")}`,
    )
    .join(" | ");
  const resolvedRule = {
    id: rule.id,
    title: rule.title,
    scope: rule.scope,
    category: rule.category,
    trigger: cloneJson(rule.trigger, {}),
    state: cloneJson(rule.state, {}),
    resolution: {
      ...cloneJson(rule.resolution, {}),
      savingThrow,
      check,
      effect,
    },
    counterplay,
    reset: cloneJson(rule.reset, {}),
    escalation: cloneJson(rule.escalation, []),
    gmSummary: rule.gmSummary,
    playerFacingSigns: [...(rule.playerFacingSigns || [])],
    scaling,
  };

  return deepFreeze(
    createBaseBlock(component, "global-rule", {
      title: rule.title || component.title,
      text: rule.gmSummary,
      mechanics: {
        trigger: formatTrigger(rule.trigger),
        state: `${state.label} ${state.minimum}–${state.maximum}; starts at ${state.initial}`,
        timing: formatToken(rule.resolution?.timing),
        threshold:
          rule.resolution?.threshold === null
            ? ""
            : String(rule.resolution?.threshold ?? ""),
        savingThrow: formatCheck(savingThrow),
        check: formatCheck(check),
        effect: formatEffect(effect),
        duration: formatToken(rule.resolution?.duration),
        frequency: formatToken(rule.resolution?.frequency),
        reset: rule.reset?.condition
          ? `${rule.reset.condition} Set ${state.label} to ${rule.reset.value}.`
          : "",
        escalation,
      },
      counterplay: formatCounterplay(rule.counterplay, intrusion),
      narrative: (rule.playerFacingSigns || []).join(" "),
      metadata: {
        semanticType: component.semanticType,
        contentType: component.contentType,
        resolvedRule,
      },
    }),
  );
}

function compileStakeBlock(stake, index, provenance, sourceComponentId = "") {
  return {
    id: sourceComponentId || `identity-stake-${index + 1}`,
    kind: "stake",
    subtype: "location-stake",
    title: sourceComponentId ? "Location Stake" : `Stake ${index + 1}`,
    text: cleanText(stake),
    summary: "",
    audience: "gm",
    facets: [],
    sourceComponentId,
    sourceAnchorIds: (provenance?.sources || []).map(
      (source) => source.sourceAnchorId,
    ),
    mechanics: null,
    counterplay: "",
    narrative: "",
    provenance,
    metadata: { semanticType: "location-stake" },
  };
}

export function mergeLocationBlocks(values = []) {
  const byId = new Map();
  values.filter(Boolean).forEach((block) => {
    if (!byId.has(block.id)) byId.set(block.id, block);
  });
  return [...byId.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}

export function compileLocationSiteWideSystems({
  seedSiteWide = {},
  components = {},
  identity = {},
  intrusion = "medium",
  fallbackProvenance = {},
} = {}) {
  const authored = (semanticType) =>
    (components.bySemanticType?.[semanticType] || []).filter(
      isEditoriallyAuthored,
    );
  const atmosphere = authored("site-atmosphere").map(compileAtmosphere);
  const globalRules = authored("global-rule").map((component) =>
    compileGlobalRule(component, intrusion),
  );
  const authoredStakes = authored("location-stake").map((component, index) =>
    compileStakeBlock(
      component.semantic?.tableText || component.semantic?.summary,
      index,
      component.provenance,
      component.id,
    ),
  );
  const identityStakes = (identity.stakes || []).map((stake, index) =>
    compileStakeBlock(stake, index, identity.provenance || fallbackProvenance),
  );

  return deepFreeze({
    siteWide: {
      atmosphere: mergeLocationBlocks([
        ...(seedSiteWide.atmosphere || []),
        ...atmosphere,
      ]),
      globalRules: mergeLocationBlocks([
        ...(seedSiteWide.globalRules || []),
        ...globalRules,
      ]),
      recurringSigns: mergeLocationBlocks(seedSiteWide.recurringSigns || []),
      stakesAndConsequences: mergeLocationBlocks([
        ...(seedSiteWide.stakesAndConsequences || []),
        ...identityStakes,
        ...authoredStakes,
      ]),
      provenance:
        atmosphere[0]?.provenance ||
        globalRules[0]?.provenance ||
        identity.provenance ||
        seedSiteWide.provenance ||
        fallbackProvenance,
    },
    globalRuleBlocks: globalRules,
  });
}
