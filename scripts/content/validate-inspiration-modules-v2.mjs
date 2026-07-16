import {
  getInspirationV2MigrationRecord,
  validateContentPackV0_2,
} from "../../shared/content/content.index.js";
import { getSemanticModuleCatalog } from "./inspiration-v2-script-utils.mjs";

const catalog = getSemanticModuleCatalog();
const issues = [];

for (const { pack, module } of catalog) {
  validateContentPackV0_2(pack).forEach((issue) =>
    issues.push({ ...issue, packId: pack.id }),
  );
  if (!getInspirationV2MigrationRecord(module.id)) {
    issues.push({
      severity: "error",
      path: `${module.id}.migrationRecord`,
      message: "Canonical module has no Phase 8 migration record.",
    });
  }
  if (
    module.provenance?.migration?.method === "compatibility-normalized" ||
    module.components.some(
      (component) =>
        component.provenance?.migration?.method === "compatibility-normalized",
    )
  ) {
    issues.push({
      severity: "error",
      path: `${module.id}.provenance`,
      message:
        "Canonical candidates cannot retain compatibility-normalized provenance.",
    });
  }
  const componentIds = new Set(
    module.components.map((component) => component.id),
  );
  module.components.forEach((component) => {
    if (!component.sourceAnchors.includes(module.sourceAnchor.id)) {
      issues.push({
        severity: "error",
        path: `${module.id}.components.${component.id}.sourceAnchors`,
        message: "Component does not link its owning Source Anchor.",
      });
    }
  });
  module.components
    .filter((component) => component.semanticType === "session-guide")
    .flatMap((component) => component.semantic.alwaysOnRuleIds)
    .forEach((ruleId) => {
      if (!componentIds.has(ruleId)) {
        issues.push({
          severity: "error",
          path: `${module.id}.sessionGuide.alwaysOnRuleIds`,
          message: `Session Guide references unknown rule: ${ruleId}.`,
        });
      }
    });
}

if (issues.length) {
  issues.forEach((issue) =>
    console.error(`[${issue.severity}] ${issue.path}: ${issue.message}`),
  );
  process.exitCode = 1;
} else {
  console.log(
    `Canonical Inspiration v2 validation passed: ${catalog.length} module(s), 0 issues.`,
  );
}
