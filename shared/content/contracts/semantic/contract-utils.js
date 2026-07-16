const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function asArray(value) {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
}

export function cleanText(value = "") {
  return String(value ?? "").trim();
}

export function normalizeId(value = "") {
  return cleanText(value).toLowerCase();
}

export function slugifyLegacyId(value = "") {
  return cleanText(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidId(value) {
  return ID_PATTERN.test(cleanText(value));
}

export function normalizeStringList(value, { ids = false } = {}) {
  return asArray(value)
    .map((entry) => (ids ? slugifyLegacyId(entry) : cleanText(entry)))
    .filter(Boolean);
}

export function normalizeStringSet(value, { ids = false } = {}) {
  return [...new Set(normalizeStringList(value, { ids }))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export function normalizeInteger(value, fallback = 0, { min, max } = {}) {
  const number = Number(value);
  const normalized = Number.isFinite(number) ? Math.trunc(number) : fallback;
  return Math.min(max ?? normalized, Math.max(min ?? normalized, normalized));
}

export function normalizeEnum(value, allowed, fallback) {
  const normalized = cleanText(value).toLowerCase();
  return allowed.includes(normalized) ? normalized : fallback;
}

export function cloneJson(value, fallback = {}) {
  if (value === undefined) return fallback;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

export function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value))
    return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

export function createIssue({
  code,
  path,
  message,
  severity = "error",
  details,
}) {
  return deepFreeze({
    code,
    severity,
    path,
    message,
    ...(details === undefined ? {} : { details: cloneJson(details, null) }),
  });
}

export function pushIssue(
  issues,
  code,
  path,
  message,
  severity = "error",
  details,
) {
  issues.push(createIssue({ code, path, message, severity, details }));
}

export function collectUnknownFields(
  value,
  allowedFields,
  path,
  issues,
  { severity = "error" } = {},
) {
  if (!isPlainObject(value)) return;
  const allowed = new Set(allowedFields);
  Object.keys(value)
    .filter((field) => !allowed.has(field))
    .sort()
    .forEach((field) => {
      pushIssue(
        issues,
        "contract.unknown-field",
        path ? `${path}.${field}` : field,
        `Unknown contract field: ${field}.`,
        severity,
      );
    });
}

export function requirePlainObject(value, path, issues) {
  if (isPlainObject(value)) return true;
  pushIssue(issues, "contract.object-required", path, "Expected an object.");
  return false;
}

export function requireArray(value, path, issues) {
  if (Array.isArray(value)) return true;
  pushIssue(issues, "contract.array-required", path, "Expected an array.");
  return false;
}

export function requireText(value, path, issues) {
  if (cleanText(value)) return true;
  pushIssue(issues, "contract.text-required", path, "Expected non-empty text.");
  return false;
}

export function requireId(value, path, issues) {
  if (isValidId(value)) return true;
  pushIssue(
    issues,
    "contract.invalid-id",
    path,
    "Expected a lower-case kebab-case id.",
  );
  return false;
}

export function requireSchemaVersion(value, expected, path, issues) {
  if (value === expected) return true;
  pushIssue(
    issues,
    "contract.schema-version",
    path,
    `Expected ${expected}, received ${cleanText(value) || "no schema version"}.`,
  );
  return false;
}

export function hasErrors(issues = []) {
  return issues.some((issue) => issue.severity === "error");
}

export function createParseResult(value, issues = []) {
  return deepFreeze({
    value,
    issues: [...issues],
    valid: !hasErrors(issues),
  });
}

export function canonicalizeJsonValue(value) {
  if (Array.isArray(value)) return value.map(canonicalizeJsonValue);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalizeJsonValue(value[key])]),
  );
}

export function serializeCanonicalSemanticContent(value) {
  return `${JSON.stringify(canonicalizeJsonValue(value), null, 2)}\n`;
}

export function countWords(value) {
  const text = cleanText(value);
  return text ? text.split(/\s+/u).length : 0;
}

export function findDuplicates(values = [], selector = (value) => value) {
  const seen = new Set();
  const duplicates = new Set();
  values.forEach((value) => {
    const key = cleanText(selector(value)).toLowerCase();
    if (!key) return;
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  });
  return [...duplicates].sort();
}
