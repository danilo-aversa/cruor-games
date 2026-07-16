import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

describe("Dark Places semantic compiler dependency boundary", () => {
  it("has no UI, renderer, global random, clock, DOM, storage, or network dependency", () => {
    const sources = readdirSync(currentDirectory)
      .filter(
        (filename) =>
          filename.endsWith(".js") && !filename.endsWith(".test.js"),
      )
      .map((filename) => ({
        filename,
        source: readFileSync(path.join(currentDirectory, filename), "utf8"),
      }));
    const forbidden = [
      /from\s+["']react(?:\/|["'])/,
      /from\s+["'][^"']*\.jsx["']/,
      /from\s+["'][^"']*map-generator/,
      /from\s+["'][^"']*\/output\//,
      /from\s+["'][^"']*\/composer\//,
      /\bwindow\s*[.[]/,
      /\bdocument\.(?:querySelector|createElement|addEventListener|body|cookie)/,
      /\blocalStorage\s*[.[]/,
      /\bsessionStorage\s*[.[]/,
      /\bfetch\s*\(/,
      /\bDate\s*\(/,
      /Math\.random\s*\(/,
      /XMLSerializer/,
      /\.svg["']/i,
    ];

    sources.forEach(({ filename, source }) => {
      forbidden.forEach((pattern) => {
        expect(source, `${filename} must not match ${pattern}`).not.toMatch(
          pattern,
        );
      });
    });
  });
});
