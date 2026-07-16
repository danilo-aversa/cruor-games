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

function toSentence(value) {
  const text = cleanText(value);
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function uniqueStrings(values = []) {
  return [...new Set(values.map(cleanText).filter(Boolean))];
}

function getPrimaryIdentity(components = []) {
  return (
    components.find((component) => component.generation?.primary === true) ||
    components[0] ||
    null
  );
}

function getFirstAuthoredValue(components, field) {
  return cleanText(
    components.find((component) => cleanText(component.semantic?.[field]))
      ?.semantic?.[field],
  );
}

function getFirstAuthoredList(components, field) {
  return uniqueStrings(
    components.flatMap((component) => component.semantic?.[field] || []),
  );
}

export function compileLocationIdentity({
  seedIdentity = {},
  components = [],
  fallbackProvenance = {},
} = {}) {
  const identities = [...components].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const primary = getPrimaryIdentity(identities);
  const ordered = primary
    ? [primary, ...identities.filter((component) => component !== primary)]
    : identities;

  const historyParagraph =
    cleanText(seedIdentity.historyParagraph) ||
    [
      getFirstAuthoredValue(ordered, "originalPurpose"),
      getFirstAuthoredValue(ordered, "historicalChange"),
    ]
      .map(toSentence)
      .filter(Boolean)
      .join(" ");
  const currentSituationParagraph =
    cleanText(seedIdentity.currentSituationParagraph) ||
    [
      getFirstAuthoredValue(ordered, "horrorTruth"),
      getFirstAuthoredValue(ordered, "currentFunction"),
      getFirstAuthoredValue(ordered, "currentConflict"),
    ]
      .map(toSentence)
      .filter(Boolean)
      .join(" ");
  const playerEntryPoint =
    cleanText(seedIdentity.playerEntryPoint) ||
    getFirstAuthoredList(ordered, "playerEntryPoints")[0] ||
    "";
  const stakes = seedIdentity.stakes?.length
    ? uniqueStrings(seedIdentity.stakes)
    : getFirstAuthoredList(ordered, "stakes");

  return deepFreeze({
    historyParagraph,
    currentSituationParagraph,
    playerEntryPoint,
    stakes,
    provenance:
      primary?.semantic?.provenance ||
      primary?.provenance ||
      seedIdentity.provenance ||
      fallbackProvenance,
  });
}

export function getCompiledIdentityCoverage(identity = {}) {
  return deepFreeze({
    hasOriginAndChange: Boolean(cleanText(identity.historyParagraph)),
    hasTruthAndCurrentConflict: Boolean(
      cleanText(identity.currentSituationParagraph),
    ),
    hasEntryPoint: Boolean(cleanText(identity.playerEntryPoint)),
    hasStakes: Array.isArray(identity.stakes) && identity.stakes.length > 0,
  });
}
