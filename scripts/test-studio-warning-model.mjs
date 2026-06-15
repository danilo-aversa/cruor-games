import assert from "node:assert/strict";
import {
  assertValidStudioWarningShape,
  buildStudioWarningsFromValidation,
  getStudioWarningState,
  groupStudioWarningsByComponent,
  summarizeStudioWarnings,
} from "../features/inspiration-studio/model/studio-warning-model.js";
import { EMPTY_DRAFT, buildComponentTemplate, normalizeModuleForDraft } from "../features/inspiration-studio/model/studio-draft.js";

const component = buildComponentTemplate("monster-reaction", {
  ...EMPTY_DRAFT,
  id: "warning-source",
  title: "Warning Source",
  sourceAnchor: { ...EMPTY_DRAFT.sourceAnchor, id: "warning-source" },
  components: [],
});
const draft = normalizeModuleForDraft({
  ...EMPTY_DRAFT,
  id: "warning-source",
  title: "Warning Source",
  sourceAnchor: { ...EMPTY_DRAFT.sourceAnchor, id: "warning-source" },
  components: [component],
});

const validationReport = {
  issues: [
    {
      severity: "error",
      id: component.id,
      path: "components[0].monster.rules.trigger",
      message: "Reaction has no trigger.",
    },
    {
      severity: "warning",
      id: component.id,
      path: "components[0].counterplay",
      message: "Monster graft has no explicit counterplay text.",
    },
    {
      severity: "info",
      path: "sourceAnchor.taxonomy",
      message: "Consider adding a secondary motif.",
    },
  ],
};

const warnings = buildStudioWarningsFromValidation(validationReport, draft);
assert.equal(warnings.length, 3, "Expected one Studio warning per validation issue.");
assert.equal(getStudioWarningState(warnings), "blocking", "Error-level issue should become blocking state.");

for (const warning of warnings) {
  const result = assertValidStudioWarningShape(warning);
  assert.equal(result.valid, true, result.reason);
}

const summary = summarizeStudioWarnings(warnings);
assert.deepEqual(summary, { total: 3, blocking: 1, editorial: 1, suggestion: 1 });

const groups = groupStudioWarningsByComponent(warnings, draft);
assert.ok(groups.length >= 2, "Expected component and draft-level warning groups.");
assert.equal(groups[0].summary.blocking, 1, "Blocking group should sort first.");

console.log(`Studio warning model test passed: ${warnings.length} warnings.`);
