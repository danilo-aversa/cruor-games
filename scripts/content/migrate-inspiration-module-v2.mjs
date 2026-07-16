import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  serializeCanonicalSemanticContent,
  validateInspirationModuleV2,
} from "../../shared/content/contracts/semantic/index.js";
import {
  createSha256,
  parseCliOptions,
  selectSemanticModules,
} from "./inspiration-v2-script-utils.mjs";

const options = parseCliOptions();
const moduleId = String(options.module || "sedlec-ossuary");
const selected = selectSemanticModules(moduleId);

if (selected.length !== 1) {
  console.error(
    `[error] Expected one canonical v2 candidate for ${moduleId}; found ${selected.length}.`,
  );
  process.exitCode = 1;
} else {
  const [{ module }] = selected;
  const issues = validateInspirationModuleV2(module);
  if (issues.length) {
    issues.forEach((issue) =>
      console.error(`[${issue.severity}] ${issue.path}: ${issue.message}`),
    );
    process.exitCode = 1;
  } else {
    const bytes = serializeCanonicalSemanticContent(module);
    const digest = createSha256(bytes);
    const output = options.output ? resolve(String(options.output)) : "";

    if (!output || options.check) {
      console.log(
        `Canonical v2 candidate verified: ${module.id}; ${bytes.length} bytes; SHA-256 ${digest}.`,
      );
    } else if (existsSync(output)) {
      const existing = readFileSync(output, "utf8");
      if (existing === bytes) {
        console.log(`Canonical v2 output unchanged: ${output}`);
      } else if (!options.force) {
        console.error(
          `[error] Refusing to overwrite a different existing module without --force: ${output}`,
        );
        process.exitCode = 1;
      } else {
        writeFileSync(output, bytes);
        console.log(`Canonical v2 output replaced explicitly: ${output}`);
      }
    } else {
      mkdirSync(dirname(output), { recursive: true });
      writeFileSync(output, bytes);
      console.log(`Canonical v2 output written: ${output}`);
    }
  }
}
