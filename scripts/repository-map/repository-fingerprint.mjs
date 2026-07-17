import { createHash } from "node:crypto";

export const REPOSITORY_FINGERPRINT_ALGORITHM = "sha256-path-content-v1";

function normalizePath(value = "") {
  return String(value).replaceAll("\\", "/").replace(/^\.\//, "");
}

export function createRepositoryFingerprint(entries = [], { excludedPaths = [] } = {}) {
  const excluded = new Set(excludedPaths.map(normalizePath));
  const canonicalLines = entries
    .map((entry) => ({
      path: normalizePath(entry?.path),
      hash: String(entry?.hash || "").toLowerCase(),
    }))
    .filter((entry) => entry.path && entry.hash && !excluded.has(entry.path))
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((entry) => `${entry.path}\0${entry.hash}`);

  return createHash("sha256").update(canonicalLines.join("\n"), "utf8").digest("hex");
}
