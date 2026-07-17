#!/usr/bin/env node
import assert from "node:assert/strict";

import {
  REPOSITORY_FINGERPRINT_ALGORITHM,
  createRepositoryFingerprint,
} from "./repository-fingerprint.mjs";

const baseline = [
  { path: "shared/content/a.js", hash: "a".repeat(64), tracked: true },
  { path: "features/example/b.js", hash: "b".repeat(64), supplemental: true },
  { path: "docs/repository-map/repository-map.json", hash: "c".repeat(64) },
];
const options = {
  excludedPaths: ["docs/repository-map/repository-map.json"],
};

const expected = createRepositoryFingerprint(baseline, options);
assert.match(expected, /^[0-9a-f]{64}$/);
assert.equal(REPOSITORY_FINGERPRINT_ALGORITHM, "sha256-path-content-v1");
assert.equal(
  createRepositoryFingerprint([...baseline].reverse(), options),
  expected,
  "File order must not affect the fingerprint.",
);
assert.equal(
  createRepositoryFingerprint(
    baseline.map((entry) => ({
      ...entry,
      tracked: !entry.tracked,
      supplemental: !entry.supplemental,
    })),
    options,
  ),
  expected,
  "Changing Git tracking state must not affect a content fingerprint.",
);
assert.equal(
  createRepositoryFingerprint(
    baseline.map((entry) =>
      entry.path === "docs/repository-map/repository-map.json"
        ? { ...entry, hash: "d".repeat(64) }
        : entry,
    ),
    options,
  ),
  expected,
  "The generated map must not invalidate its own fingerprint.",
);
assert.notEqual(
  createRepositoryFingerprint(
    baseline.map((entry) =>
      entry.path === "shared/content/a.js"
        ? { ...entry, hash: "e".repeat(64) }
        : entry,
    ),
    options,
  ),
  expected,
  "Changing mapped file content must invalidate the fingerprint.",
);
assert.notEqual(
  createRepositoryFingerprint(
    [...baseline, { path: "new-file.js", hash: "f".repeat(64) }],
    options,
  ),
  expected,
  "Adding a mapped file must invalidate the fingerprint.",
);

console.log(`Repository fingerprint contract passed (${REPOSITORY_FINGERPRINT_ALGORITHM}).`);
