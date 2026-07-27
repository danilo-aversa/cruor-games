import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { MONSTER_GRAFTS } from "../../features/monster-composer/data/monster-grafts.js";
import { buildStudioComponentsFromTemplate } from "../../features/inspiration-studio/model/studio-component-templates.js";
import {
  buildStudioGraftOutputPreview,
  createStudioGraftProgression,
  createUniqueStudioGraftAbility,
  ensureStudioGraftPayload,
  removeStudioGraftAbilityReferences,
  renameStudioGraftAbilityReferences,
  validateStudioGraftPayload,
} from "../../features/inspiration-studio/model/studio-monster-graft-authoring.js";

const strict = process.argv.includes("--strict");
const checks = [];

const editorSource = readFileSync("features/inspiration-studio/editors/StudioMonsterGraftEditor.jsx", "utf8");
const studioCss = readFileSync("features/inspiration-studio/inspiration-studio.styles.css", "utf8");
const studioPageSource = readFileSync("features/inspiration-studio/InspirationStudioPage.jsx", "utf8");
const primitiveSource = readFileSync("features/inspiration-studio/ui/StudioField.jsx", "utf8");
const primitiveCss = readFileSync("features/inspiration-studio/ui/studio-primitives.css", "utf8");

function check(name, callback) {
  try {
    callback();
    checks.push({ name, status: "pass" });
  } catch (error) {
    checks.push({ name, status: "fail", message: error.message });
  }
}

function asStudioComponent(graft) {
  return {
    id: graft.id,
    title: graft.title,
    summary: graft.summary,
    counterplay: graft.counterplay,
    slots: [graft.slot],
    sourceAnchors: graft.sourceAnchors || [graft.source],
    monster: { ...graft, graftId: graft.id },
  };
}

const templateIds = [
  "monster-trait",
  "monster-action",
  "monster-bonus-action",
  "monster-reaction",
  "monster-weakness",
  "monster-death-effect",
  "monster-lair-effect",
];

check("new Monster templates create native Grafts", () => {
  for (const templateId of templateIds) {
    const [component] = buildStudioComponentsFromTemplate(templateId, {
      id: "studio-audit",
      sourceAnchors: ["decomposition"],
    });
    const validation = validateStudioGraftPayload(component);
    assert.equal(component.monster.graftSchemaVersion, "monster-graft-v2.0");
    assert.equal(component.monster.abilities.length, 1);
    assert.equal(Object.hasOwn(component.monster, "rules"), false);
    assert.equal(validation.errors.length, 0, `${templateId}: ${validation.errors.map((issue) => issue.message).join("; ")}`);
  }
});

check("empty native Grafts remain visible and repairable", () => {
  const component = {
    id: "empty-graft",
    title: "Empty Graft",
    slots: ["attack"],
    monster: {
      graftSchemaVersion: "monster-graft-v2.0",
      schemaVersion: "monster-graft-v2.0",
      kind: "attackPattern",
      slot: "attack",
      abilities: [],
    },
  };
  const payload = ensureStudioGraftPayload(component);
  assert.deepEqual(payload.abilities, []);
  assert.ok(validateStudioGraftPayload(component).errors.length > 0);
});

check("all production Grafts survive the Studio payload boundary", () => {
  assert.equal(MONSTER_GRAFTS.length, 93);
  for (const graft of MONSTER_GRAFTS) {
    const component = asStudioComponent(graft);
    const payload = ensureStudioGraftPayload(component);
    assert.equal(payload.graftSchemaVersion || payload.schemaVersion, "monster-graft-v2.0", graft.id);
    assert.deepEqual(payload.abilities, graft.abilities, `${graft.id}: ability payload changed`);
    assert.deepEqual(payload.routine, graft.routine, `${graft.id}: routine changed`);
    assert.deepEqual(payload.progression ?? null, graft.progression ?? null, `${graft.id}: progression changed`);
  }
});

check("production Grafts compile in the Studio Output preview", () => {
  for (const graft of MONSTER_GRAFTS) {
    const targetCr = graft.slot === "attack" ? 10 : 5;
    const preview = buildStudioGraftOutputPreview(asStudioComponent(graft), targetCr);
    assert.ok(preview.abilities.length >= 1, `${graft.id}: no compiled abilities`);
    assert.equal(preview.validation.errors.length, 0, `${graft.id}: ${preview.validation.errors.map((issue) => issue.message).join("; ")}`);
  }
});

check("Acid Vomit shows its own output at the correct CR", () => {
  const graft = MONSTER_GRAFTS.find((entry) => entry.id === "acid-vomit");
  assert.ok(graft);
  const low = buildStudioGraftOutputPreview(asStudioComponent(graft), 1);
  const mid = buildStudioGraftOutputPreview(asStudioComponent(graft), 5);
  assert.deepEqual(low.abilities.map((ability) => ability.title), ["Heavy Slam"]);
  assert.deepEqual(mid.abilities.map((ability) => ability.title), ["Multiattack", "Heavy Slam", "Acid Vomit"]);
  const acid = mid.abilities.find((ability) => ability.title === "Acid Vomit");
  assert.match(acid.text, /Acid damage/);
  assert.match(acid.text, /Recharge 5-6/);
  assert.doesNotMatch(acid.text, /moved at least 10 feet straight/);
});

check("ability reference edits update routine and CR bands", () => {
  const [component] = buildStudioComponentsFromTemplate("monster-action", {
    id: "studio-audit",
    sourceAnchors: ["decomposition"],
  });
  const payload = ensureStudioGraftPayload(component);
  const extra = createUniqueStudioGraftAbility(payload, {
    id: "acid-vomit",
    title: "Acid Vomit",
    slot: payload.slot,
    section: "action",
    role: "replacement",
  });
  payload.abilities.push(extra);
  payload.routine.defaultSequence = [payload.abilities[0].id, extra.id];
  payload.routine.multiattack.replacements = [{ with: extra.id, replace: "oneAttack" }];
  payload.progression = createStudioGraftProgression(payload.abilities.map((ability) => ability.id));

  renameStudioGraftAbilityReferences(payload, extra.id, "corrosive-vomit");
  assert.ok(payload.routine.defaultSequence.includes("corrosive-vomit"));
  assert.equal(payload.routine.multiattack.replacements[0].with, "corrosive-vomit");
  assert.ok(payload.progression.bands.at(-1).abilityIds.includes("corrosive-vomit"));

  removeStudioGraftAbilityReferences(payload, "corrosive-vomit");
  assert.ok(!payload.routine.defaultSequence.includes("corrosive-vomit"));
  assert.equal(payload.routine.multiattack.replacements.length, 0);
});

check("Graft authoring fields expose contextual help", () => {
  assert.match(editorSource, /const GRAFT_FIELD_HELP = Object\.freeze/);
  assert.match(editorSource, /function GraftField/);
  assert.ok((editorSource.match(/<GraftField\b/g) || []).length >= 60);
  for (const label of ["Type", "Slot", "Fantasy", "Tactical Role", "Routine Mode", "Budget Share", "Scaling Basis"]) {
    assert.match(editorSource, new RegExp(`\\"?${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\"?\\s*:`));
  }
});

check("Graft authoring accordions are collapsed by default", () => {
  assert.doesNotMatch(editorSource, /<StudioCollapsibleSection[^>]*\bdefaultOpen\b/);
});

check("Graft Type and Slot have clear ownership", () => {
  assert.match(editorSource, /label="Type"/);
  assert.match(editorSource, /label="Slot"/);
  assert.match(editorSource, /MONSTER_GRAFT_V2_KIND_SLOT_CONTRACT/);
  assert.doesNotMatch(editorSource, /label="Graft Kind"/);
  assert.doesNotMatch(studioPageSource, /Composer Slot/);
  assert.match(studioPageSource, /label: "Build Fit"/);
  assert.match(studioPageSource, /title=\{isGraftV2 \? "Build Cost"/);
});

check("Graft checkbox fields use native Studio control styling", () => {
  assert.match(editorSource, /studio-graft-field--span-two studio-graft-field--inline-checkbox/);
  assert.match(editorSource, /studio-graft-check-option__copy/);
  assert.match(primitiveSource, /studio-checkbox-input/);
  assert.match(primitiveCss, /\.studio-checkbox-input::before/);
  assert.match(studioCss, /studio-graft-check-option:has\(\.studio-checkbox-input:checked\)/);
  assert.match(studioCss, /font-size:\s*var\(--text-size-s-plus\)/);
});

check("Studio grids fill incomplete final rows automatically", () => {
  assert.match(primitiveCss, /grid-auto-flow:\s*row dense/);
  assert.match(primitiveCss, /last-child:nth-child\(3n \+ 2\)/);
  assert.match(primitiveCss, /grid-column:\s*span 2/);
  assert.match(primitiveCss, /last-child:nth-child\(4n \+ 1\)/);
});

const failed = checks.filter((entry) => entry.status === "fail");
console.log(`Studio Graft authoring audit: ${checks.length - failed.length}/${checks.length} checks passed.`);
for (const entry of checks) {
  console.log(`${entry.status === "pass" ? "PASS" : "FAIL"} ${entry.name}${entry.message ? ` — ${entry.message}` : ""}`);
}

if (strict && failed.length) process.exitCode = 1;
