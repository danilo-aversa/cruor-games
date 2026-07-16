function cleanKeyPart(value) {
  return String(value ?? "").trim();
}

export function hashLocationCompilerKey(value) {
  let hash = 2166136261;
  for (const character of String(value ?? "")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createLocationCompilerKey(seed, ...parts) {
  return [cleanKeyPart(seed), ...parts.map(cleanKeyPart)].join(":");
}

export function scoreLocationCompilerChoice(seed, scope, ...parts) {
  return hashLocationCompilerKey(
    createLocationCompilerKey(seed, scope, ...parts),
  );
}

export function rankLocationCompilerChoices(
  values = [],
  { seed = "", scope = "choice", getId = (value) => value?.id || value } = {},
) {
  return [...values].sort((left, right) => {
    const leftId = cleanKeyPart(getId(left));
    const rightId = cleanKeyPart(getId(right));
    const scoreDelta =
      scoreLocationCompilerChoice(seed, scope, rightId) -
      scoreLocationCompilerChoice(seed, scope, leftId);
    return scoreDelta || leftId.localeCompare(rightId);
  });
}
