import assert from "node:assert/strict";
import {
  STUDIO_COMPONENT_TEMPLATES,
  buildStudioComponentFromTemplate,
  getStudioComponentTemplateGroups,
} from "../features/inspiration-studio/model/studio-component-templates.js";
import { EMPTY_DRAFT, normalizeModuleForDraft } from "../features/inspiration-studio/model/studio-draft.js";

const draft = normalizeModuleForDraft({
  ...EMPTY_DRAFT,
  id: "test-source",
  title: "Test Source",
  sourceAnchor: {
    ...EMPTY_DRAFT.sourceAnchor,
    id: "test-source",
    sourceTypes: ["biological-process"],
    themes: ["decay"],
    motifs: ["rupture"],
    horror: ["body-horror"],
  },
  components: [],
});

const groups = getStudioComponentTemplateGroups();
assert.ok(groups.length >= 2, "Expected grouped component templates.");

for (const templateId of Object.keys(STUDIO_COMPONENT_TEMPLATES)) {
  const component = buildStudioComponentFromTemplate(templateId, draft);
  assert.ok(component.id.startsWith("test-source-"), `${templateId} should inherit source id.`);
  assert.ok(component.title, `${templateId} should create a title.`);
  assert.ok(component.contentType, `${templateId} should create a content type.`);
  assert.deepEqual(component.sourceAnchors, ["test-source"], `${templateId} should inherit source anchor.`);
  assert.ok(component.slots.length, `${templateId} should assign at least one slot.`);
  assert.ok(component.workflows.length, `${templateId} should assign at least one workflow.`);

  if (component.contentType === "monster-graft") {
    assert.equal(component.workflows[0], "monster-composer", `${templateId} should target Monster Composer.`);
    assert.ok(component.monster?.slot, `${templateId} should define monster.slot.`);
    assert.ok(component.monster?.section, `${templateId} should define monster.section.`);
    assert.ok(component.monster?.rules?.actionEconomy, `${templateId} should define action economy.`);
    assert.ok(component.monster?.rules?.usage, `${templateId} should define usage.`);
    assert.ok(component.monster?.rules?.resolution, `${templateId} should define resolution.`);
    assert.ok(component.monster?.rules?.targeting, `${templateId} should define targeting.`);
  }

  if (component.contentType === "location-region") {
    assert.equal(component.slots[0], "locationRegion", `${templateId} should target locationRegion slot.`);
    assert.ok(component.locationRegion?.role, `${templateId} should define region role.`);
  }
}

console.log(`Studio component template test passed: ${Object.keys(STUDIO_COMPONENT_TEMPLATES).length} templates.`);
