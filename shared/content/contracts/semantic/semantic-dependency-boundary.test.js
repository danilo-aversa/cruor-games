import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import * as publicContentApi from "../../content.index.js";
import * as semanticApi from "./index.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

describe("semantic contract dependency boundary", () => {
  it("contains no feature, React, SVG, DOM, storage, network, clock, or random imports", () => {
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
      /from\s+["'][^"']*features\//,
      /from\s+["']react(?:\/|["'])/,
      /\.jsx["']/,
      /map-generator/i,
      /inspiration-studio/i,
      /\bwindow\s*[.[]/,
      /\bdocument\.(?:querySelector|createElement|addEventListener|body|cookie)/,
      /\blocalStorage\s*[.[]/,
      /\bsessionStorage\s*[.[]/,
      /\bfetch\s*\(/,
      /\bDate\s*\(/,
      /Math\.random\s*\(/,
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

  it("exposes the same contracts to Studio and Dark Places through shared content", () => {
    expect(publicContentApi.normalizeSemanticContent).toBe(
      semanticApi.normalizeSemanticContent,
    );
    expect(publicContentApi.validateInspirationModuleV2).toBe(
      semanticApi.validateInspirationModuleV2,
    );
    expect(publicContentApi.resolveMechanicalScaling).toBe(
      semanticApi.resolveMechanicalScaling,
    );
  });
});
