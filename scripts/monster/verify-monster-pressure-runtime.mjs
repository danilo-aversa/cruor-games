import fs from "node:fs";
import process from "node:process";
import { buildMonsterFramePowerProfile } from "../../features/monster-composer/model/monster-frame-power.js";
import { resolveMonsterGuidanceLimits } from "../../features/monster-composer/model/monster-pressure-complexity.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const commonFrame = {
  role: { id: "standard" },
  tacticalRole: { id: "brute" },
  monsterTier: { id: "normal" },
  tempoProfile: { id: "standard" },
  danger: { id: "hard" },
};

const cr4Frame = buildMonsterFramePowerProfile({ ...commonFrame, targetCr: 4 });
const limits = resolveMonsterGuidanceLimits({
  framePowerProfile: cr4Frame,
  advancedMode: true,
  customPressureLimit: 14,
  customComplexityCap: 10,
});

assert(cr4Frame.buildBudget === 14, `Expected CR 4 Build Budget 14, got ${cr4Frame.buildBudget}.`);
assert(limits.pressureLimit === 6, `Expected CR 4 Pressure Limit 6, got ${limits.pressureLimit}.`);
assert(limits.complexityCap === 6, `Expected CR 4 Complexity Cap 6, got ${limits.complexityCap}.`);

const pagePath = new URL("../../features/monster-composer/monster-composer.page.jsx", import.meta.url);
const anatomyPath = new URL("../../features/monster-composer/components/monster-composer.anatomy.jsx", import.meta.url);
const pageSource = fs.readFileSync(pagePath, "utf8");
const anatomySource = fs.readFileSync(anatomyPath, "utf8");

assert(pageSource.includes("resolveMonsterGuidanceLimits"), "Composer page is not using the canonical guidance resolver.");
assert(!pageSource.includes("customPressureLimit"), "Composer page still contains a custom Pressure override.");
assert(!pageSource.includes("customComplexityCap"), "Composer page still contains a custom Complexity override.");
assert(anatomySource.includes("max={computed.pressureLimit}"), "Pressure meter is not bound to computed.pressureLimit.");
assert(!anatomySource.includes('max={computed.budget}'), "Pressure meter is still bound to computed.budget.");

console.log("Pressure / Complexity runtime wiring: PASS");
console.log(JSON.stringify({
  targetCr: 4,
  buildBudget: cr4Frame.buildBudget,
  pressureLimit: limits.pressureLimit,
  complexityCap: limits.complexityCap,
}, null, 2));

process.exit(0);
