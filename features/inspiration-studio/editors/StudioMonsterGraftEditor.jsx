import { useEffect, useMemo, useState } from "react";

import {
  ACTION_ECONOMY_TYPES,
  ATTACK_ABILITY_BASIS,
  CONDITION_SEVERITY,
  DAMAGE_BUDGET_ROLES,
  DAMAGE_MODES,
  MONSTER_GRAFT_RULES_SCHEMA_VERSION,
  RESOLUTION_TYPES,
  RULES_SECTIONS,
  USAGE_TYPES,
} from "../../monster-composer/model/monster-graft-rules.schema.js";
import {
  MONSTER_GRAFT_V2_KIND_SLOT_CONTRACT,
  MONSTER_GRAFT_V2_KINDS,
  MONSTER_GRAFT_V2_MULTIATTACK_MODES,
  MONSTER_GRAFT_V2_ROUTINE_MODES,
} from "../../monster-composer/model/monster-graft-v2.schema.js";
import {
  buildStudioGraftOutputPreview,
  createStudioGraftBand,
  createStudioGraftProgression,
  createUniqueStudioGraftAbility,
  ensureStudioGraftPayload,
  removeStudioGraftAbilityReferences,
  renameStudioGraftAbilityReferences,
  studioMonsterGraftAuthoringInternals,
  validateStudioGraftPayload,
} from "../model/studio-monster-graft-authoring.js";
import {
  StudioAdvancedDetails,
  StudioButton,
  StudioCheckbox,
  StudioCollapsibleSection,
  StudioField as BaseStudioField,
  StudioHelp,
  StudioIcon,
  StudioIconButton,
  StudioInput,
  StudioSelect,
  StudioStatusBadge,
  StudioTextarea,
} from "../ui/index.js";

const {
  asArray,
  cleanString,
  cloneJson,
  isPlainObject,
  slugify,
  uniqueId,
} = studioMonsterGraftAuthoringInternals;

const SECTION_OPTIONS = RULES_SECTIONS.map((value) => [value, labelFor(value)]);
const ACTION_ECONOMY_OPTIONS = ACTION_ECONOMY_TYPES.map((value) => [value, labelFor(value)]);
const USAGE_OPTIONS = USAGE_TYPES.map((value) => [value, labelFor(value)]);
const RESOLUTION_OPTIONS = RESOLUTION_TYPES.map((value) => [value, labelFor(value)]);
const DAMAGE_MODE_OPTIONS = DAMAGE_MODES.map((value) => [value, labelFor(value)]);
const DAMAGE_BUDGET_OPTIONS = DAMAGE_BUDGET_ROLES.map((value) => [value, labelFor(value)]);
const ABILITY_BASIS_OPTIONS = ATTACK_ABILITY_BASIS.map((value) => [value, labelFor(value)]);
const CONDITION_SEVERITY_OPTIONS = CONDITION_SEVERITY.map((value) => [value, labelFor(value)]);
const GRAFT_TYPE_OPTIONS = MONSTER_GRAFT_V2_KINDS.map((value) => [value, labelFor(value)]);
const ROUTINE_MODE_OPTIONS = MONSTER_GRAFT_V2_ROUTINE_MODES.map((value) => [value, labelFor(value)]);
const MULTIATTACK_MODE_OPTIONS = MONSTER_GRAFT_V2_MULTIATTACK_MODES.map((value) => [value, labelFor(value)]);


const GRAFT_FIELD_HELP = Object.freeze({
  Type: "Defines what kind of Graft this is, such as an Attack Pattern, Movement Pattern, Weakness, Death Effect, or composite package. For most Types, this automatically determines where the Graft appears in the Monster Composer.",
  Slot: "Chooses where the Graft appears in the Monster Composer when the selected Type supports more than one valid location, such as Body or Mind for a Trait Bundle.",
  Fantasy: "The core fictional promise of the Graft: what the monster feels like and what recognizable horror idea the mechanics express.",
  "Tactical Role": "The battlefield job performed by the Graft, such as pressure, control, pursuit, disruption, defense, or burst damage.",
  Signature: "The single most recognizable behavior or image that should make this Graft identifiable during play.",
  "Recognition Tags": "Short searchable concepts used to classify, compare, and retrieve Grafts with similar identities.",
  "Ability ID": "Stable local identifier used by routines, Multiattack entries, replacements, and CR progression bands. Changing it updates those references.",
  Title: "The player-facing name printed for this ability in the final stat block.",
  "Routine Role": "How this ability participates in the Graft's turn pattern: primary action, optional choice, replacement, additional ability, or excluded from the routine.",
  Availability: "Controls whether the routine may always use this ability or only use it when its usage, recharge, trigger, or CR availability permits it.",
  "Maximum Uses per Routine": "Maximum number of times this ability may appear in one compiled routine or Multiattack sequence.",
  "Ability Tags": "Short descriptors used for authoring, filtering, QA, and future compatibility rules.",
  Summary: "Concise human-readable description of what the ability contributes.",
  "Mechanics Note": "Design note for creators. It explains intent but does not replace the structured rules consumed by the engine.",
  "Counterplay Note": "Explains how players can anticipate, avoid, interrupt, or mitigate this specific ability.",
  "Stat Block Section": "The section in which this ability is printed, such as Traits, Actions, Bonus Actions, Reactions, Death Effects, Legendary Actions, or Lair Actions.",
  "Action Economy": "The action cost or timing used by the monster: passive, Action, Bonus Action, Reaction, death trigger, legendary action, or lair action.",
  Usage: "How often the ability can be used, including at will, Recharge, limited uses, triggered use, death, lair, or legendary cadence.",
  "Usage Value": "The numeric or textual usage limit, such as 5–6, 1/Day, 3 uses, or initiative count 20.",
  Trigger: "The event that permits or forces the ability to occur. Required for reactions, death effects, and other conditional abilities.",
  "Resolution Type": "The mechanical method used to resolve the ability: attack roll, saving throw, both, automatic effect, ability check, or no roll.",
  "Attack Type": "Whether the attack is melee, ranged, or usable as either.",
  "Attack Ability": "The monster ability score used to calculate the attack modifier and related scaling.",
  "Attack Bonus": "Use 'monster' to calculate the bonus from the generated creature, or enter a fixed modifier when the rule requires one.",
  Reach: "Maximum melee distance for the attack, normally written in feet.",
  Range: "Normal and long range for a ranged attack, for example 60/120 ft.",
  "Save Ability": "The ability score targeted by the saving throw.",
  "Save DC": "Use 'monster' to calculate the DC from the generated creature, or enter a fixed DC.",
  "Targeting Type": "Whether the ability targets the monster itself, one target, an area, or a custom target definition.",
  Targets: "Human-readable target clause used in generated rules text, such as one creature or each creature in the area.",
  Shape: "Geometric form of an area effect, such as a cone, radius, line, cube, sphere, cylinder, emanation, or whole scene.",
  Size: "Numeric measurement of the selected area shape.",
  Unit: "Measurement unit used by the area or distance, normally feet.",
  Origin: "Where the area begins, such as the monster, a selected point, or the target.",
  "Damage Mode": "Determines whether damage is absent, allocated from the CR budget, or authored as a fixed dice expression.",
  "Budget Role": "Identifies how this damage participates in the turn's total damage budget, such as primary, secondary, replacement, rider, or none.",
  Scale: "Relative damage intensity used by the CR budget allocator for this ability.",
  "Damage Scale": "CR-band override for the relative damage intensity of this ability.",
  "Budget Share": "Explicit fraction of the routine damage budget assigned to this damage entry. Leave empty to let the compiler allocate it.",
  "Expected Targets": "Expected average number of creatures damaged when estimating DPR for an area or multi-target effect.",
  "Damage Types": "Damage types dealt by the ability. Enter one or more values separated by commas or new lines.",
  Average: "Fixed average damage used when Damage Mode is Fixed.",
  Dice: "Fixed damage dice expression, such as 2d8 + 4.",
  Conditions: "Conditions imposed by the ability, such as grappled, restrained, frightened, or poisoned.",
  Severity: "Relative control severity used by balance, complexity, and spike-risk evaluation.",
  Duration: "How long the condition or outcome lasts and how it ends.",
  "Effect / Hit Text": "Generated outcome applied on a hit or automatic effect. Formula tokens are resolved by the monster compiler.",
  Failure: "Outcome applied when a target fails the saving throw.",
  Success: "Outcome applied when a target succeeds on the saving throw.",
  "Manual Override": "Complete author-written rules text for this ability. Use only when structured generation cannot express the mechanic.",
  "Structured Rules": "Canonical machine-readable rules for the selected ability. Normal authoring should use the visual controls.",
  "Routine Mode": "Defines how the engine interprets the turn plan: no routine, authored plan, single action, alternating sequence, or multi-step procedure.",
  "Intentional Repetition": "Marks repeated uses of the same ability as deliberate design rather than an accidental duplicate in the routine.",
  "Default Plan": "Plain-language description of the monster's normal turn priorities.",
  "Target Selection": "Plain-language rule for choosing targets during the default routine.",
  "Default Sequence": "Ordered ability IDs used by the normal routine at the current CR.",
  Opener: "Ability IDs preferred at the start of combat or the first time the routine becomes available.",
  "Repetition Reason": "Explains why repeating the same attack is important to the identity or balance of the pattern.",
  "No-Multiattack Reason": "Explains why an Attack Graft intentionally remains a single-action routine.",
  Enabled: "Turns the associated authored behavior on or off.",
  Mode: "Selects how the associated routine or Multiattack structure is assembled.",
  "Attack Count": "Total number of attacks made by the generated Multiattack at this level of the routine.",
  Count: "Number of times the referenced attack is used.",
  "Choice Ability IDs": "Ability IDs from which the engine may choose when compiling a choice-based Multiattack.",
  Ability: "Ability used by this replacement or routine entry.",
  Replace: "Defines how many ordinary attacks may be exchanged for the replacement ability.",
  Label: "Optional creator-facing label used to identify this replacement rule.",
  ID: "Stable local identifier for this alternative routine.",
  Sequence: "Ordered ability IDs used by this alternative routine.",
  When: "Visible tactical condition that activates this alternative instead of the default routine.",
  Purpose: "Tactical reason for the alternative, such as pursuit, escape, crowd control, or finishing a vulnerable target.",
  "Scaling Basis": "Value used to choose a progression band. The current engine projects these bands from the target Challenge Rating.",
  Bands: "Number of authored Challenge Rating ranges in this progression.",
  "Band ID": "Stable identifier for this Challenge Rating band.",
  "Minimum CR": "Lowest Challenge Rating included in this band.",
  "Maximum CR": "Highest Challenge Rating included in this band.",
  "Maximum Uses": "CR-band override for the maximum number of routine uses of this ability.",
  "Area Size": "CR-band override for the numeric size of the ability's area.",
  "Override Multiattack": "Enable this only when the selected CR band needs a different Multiattack cadence from the base routine.",
  "Ability Patches": "Advanced CR-band patches keyed by ability ID. Use for mechanical fields not exposed by the common overrides.",
  "Graft Patch": "Advanced patch applied to the complete Graft only while this CR band is active.",
  "Canonical Graft Payload": "Complete machine-readable Graft document exported to the content pack and consumed by the engine.",
  Telegraphs: "Readable signs that warn players what the Graft is about to do.",
  "Positioning Answers": "Spatial responses that let players avoid or reduce the Graft's pressure.",
  "Break Conditions": "Actions or state changes that interrupt, disable, or end the Graft's effect.",
  "Non-Damage Answers": "Useful responses other than dealing damage, such as movement, interaction, cleansing, control, or protecting another creature.",
  "Decision Load": "Number and difficulty of meaningful choices the GM must make when running the Graft.",
  Sequencing: "Complexity created by ordering abilities, tracking openers, or following a multi-step routine.",
  "Conditional Branches": "Complexity created by alternative behaviors and conditional rules.",
  Tracking: "Ongoing state, counters, durations, targets, or resources the GM must remember.",
  "Opening Burst": "Risk that the Graft deals disproportionate damage or control before players can respond.",
  "Control Spike": "Risk that the Graft creates a sudden, severe loss of player agency.",
  Repeatability: "How easily the strongest outcome can be repeated across consecutive rounds.",
  "Preview CR": "Challenge Rating used to project progression bands and compile the previewed repertoire.",
});

function GraftField({ hint = "", label, ...props }) {
  return (
    <BaseStudioField
      {...props}
      label={label}
      hint={hint || GRAFT_FIELD_HELP[label] || "Controls the structured value consumed by the Graft compiler."}
    />
  );
}

function GraftInlineHeading({ help, title }) {
  return (
    <span className="studio-graft-inline-heading">
      <strong>{title}</strong>
      <StudioHelp title={title} text={help} />
    </span>
  );
}

const ABILITY_ROLE_OPTIONS = [
  ["primary", "Primary"],
  ["choice", "Choice"],
  ["replacement", "Replacement"],
  ["additionalAbility", "Additional Ability"],
  ["excluded", "Excluded from Routine"],
];

const AVAILABILITY_OPTIONS = [
  ["always", "Always"],
  ["ifAvailable", "If Available"],
];

const TARGETING_TYPE_OPTIONS = [
  ["self", "Self"],
  ["single", "Single Target"],
  ["area", "Area"],
  ["custom", "Custom"],
];

const TARGETING_SHAPE_OPTIONS = [
  ["", "No Shape"],
  ["radius", "Radius"],
  ["cone", "Cone"],
  ["sphere", "Sphere"],
  ["cube", "Cube"],
  ["line", "Line"],
  ["cylinder", "Cylinder"],
  ["emanation", "Emanation"],
  ["scene", "Scene / Lair"],
];

const ATTACK_TYPE_OPTIONS = [
  ["melee", "Melee"],
  ["ranged", "Ranged"],
  ["meleeOrRanged", "Melee or Ranged"],
];

const SAVE_ABILITY_OPTIONS = [
  ["strength", "Strength"],
  ["dexterity", "Dexterity"],
  ["constitution", "Constitution"],
  ["intelligence", "Intelligence"],
  ["wisdom", "Wisdom"],
  ["charisma", "Charisma"],
];

const DAMAGE_SCALE_OPTIONS = [
  ["minor", "Minor"],
  ["light", "Light"],
  ["medium", "Medium"],
  ["standard", "Standard"],
  ["high", "High"],
  ["heavy", "Heavy"],
];

function labelFor(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function joinLines(value) {
  return asArray(value).join("\n");
}

function splitLines(value) {
  return String(value || "")
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function setObjectPath(target, path, value) {
  let cursor = target;
  for (const key of path.slice(0, -1)) {
    if (!isPlainObject(cursor[key]) && !Array.isArray(cursor[key])) cursor[key] = {};
    cursor = cursor[key];
  }
  const key = path[path.length - 1];
  if (value === undefined) delete cursor[key];
  else cursor[key] = value;
}

function getStatusMeta(validation) {
  const errors = asArray(validation?.issues).filter((issue) => issue.severity === "error");
  const warnings = asArray(validation?.issues).filter((issue) => issue.severity !== "error");
  if (errors.length) return { status: "error", label: `${errors.length} errors`, icon: "fa-circle-xmark" };
  if (warnings.length) return { status: "warning", label: `${warnings.length} warnings`, icon: "fa-triangle-exclamation" };
  return { status: "success", label: "Valid", icon: "fa-circle-check" };
}

function ListTextarea({ label, hint = "", icon = "fa-list", value, onChange, rows = 3, placeholder = "" }) {
  return (
    <GraftField label={label} icon={icon} hint={hint}>
      <StudioTextarea
        rows={rows}
        value={joinLines(value)}
        onChange={(next) => onChange(splitLines(next))}
        placeholder={placeholder}
      />
    </GraftField>
  );
}

function JsonObjectEditor({ label, hint, value, onApply, rows = 10 }) {
  const serialized = JSON.stringify(value ?? {}, null, 2);
  const [draft, setDraft] = useState(serialized);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(serialized);
    setError("");
  }, [serialized]);

  function apply() {
    try {
      const parsed = JSON.parse(draft);
      if (!isPlainObject(parsed)) throw new Error("Expected a JSON object.");
      onApply(parsed);
      setError("");
    } catch (nextError) {
      setError(nextError.message || "Invalid JSON object.");
    }
  }

  return (
    <div className="studio-graft-json-editor">
      <GraftField label={label} icon="fa-code" hint={hint}>
        <StudioTextarea className="studio-raw-json-preview" rows={rows} value={draft} onChange={setDraft} />
      </GraftField>
      <div className="studio-editable-textbox__actions">
        <StudioButton icon="fa-check" onClick={apply}>Apply JSON</StudioButton>
      </div>
      {error ? <div className="studio-graft-inline-error"><StudioIcon name="fa-triangle-exclamation" /> {error}</div> : null}
    </div>
  );
}

function AbilityRulesEditor({ ability, onChange }) {
  const rules = ability.rules || {};
  const resolution = rules.resolution || {};
  const targeting = rules.targeting || {};
  const damage = rules.damage || {};
  const condition = rules.condition || {};
  const text = rules.text || {};
  const usage = rules.usage || {};
  const hasAttack = ["attackRoll", "attackRollSavingThrow"].includes(resolution.type);
  const hasSave = ["savingThrow", "attackRollSavingThrow"].includes(resolution.type);
  const hasDamage = damage.mode && damage.mode !== "none";

  function setRule(path, value) {
    onChange((nextAbility) => {
      nextAbility.rules = nextAbility.rules || {};
      setObjectPath(nextAbility.rules, path, value);
      nextAbility.section = nextAbility.rules.section || nextAbility.section;
    });
  }

  function setResolutionType(type) {
    onChange((nextAbility) => {
      nextAbility.rules = nextAbility.rules || {};
      nextAbility.rules.resolution = {
        ...(nextAbility.rules.resolution || {}),
        type,
      };
      if (["attackRoll", "attackRollSavingThrow"].includes(type)) {
        nextAbility.rules.resolution.attackType ||= "melee";
        nextAbility.rules.resolution.abilityBasis ||= "strength";
        nextAbility.rules.resolution.bonus ||= "monster";
      }
      if (["savingThrow", "attackRollSavingThrow"].includes(type)) {
        nextAbility.rules.resolution.ability ||= "constitution";
        nextAbility.rules.resolution.dc ||= "monster";
      }
    });
  }

  return (
    <div className="studio-graft-ability-rules">
      <StudioCollapsibleSection icon="fa-bolt" title="Use and Placement" help="These fields belong to this ability, not to the Graft as a whole.">
        <div className="studio-form-grid studio-form-grid--compact">
          <GraftField label="Stat Block Section" icon="fa-file-lines" hint="Where this ability is printed in the final stat block.">
            <StudioSelect value={rules.section || ability.section || "action"} options={SECTION_OPTIONS} onChange={(value) => {
              setRule(["section"], value);
              setRule(["actionEconomy"], value === "trait" ? "passive" : value === "death" ? "deathTrigger" : value);
              onChange((nextAbility) => { nextAbility.section = value; });
            }} />
          </GraftField>
          <GraftField label="Action Economy" icon="fa-bolt" hint="How the monster spends this ability: Action, Bonus Action, Reaction, passive trait, and so on.">
            <StudioSelect value={rules.actionEconomy || "action"} options={ACTION_ECONOMY_OPTIONS} onChange={(value) => setRule(["actionEconomy"], value)} />
          </GraftField>
          <GraftField label="Usage" icon="fa-repeat" hint="At will, Recharge, limited uses, triggered, death, lair, or legendary use.">
            <StudioSelect value={usage.type || "atWill"} options={USAGE_OPTIONS} onChange={(value) => setRule(["usage", "type"], value)} />
          </GraftField>
          <GraftField label="Usage Value" icon="fa-dice-six" hint="Examples: 5–6, 1/Day, 3 uses, initiative count 20.">
            <StudioInput value={usage.value || usage.recharge || ""} onChange={(value) => {
              setRule(["usage", "value"], value);
              if (usage.type === "recharge") setRule(["usage", "recharge"], value);
            }} placeholder="5-6" />
          </GraftField>
        </div>
        <GraftField label="Trigger" icon="fa-bell" hint="Required for reactions, death effects, and conditional abilities.">
          <StudioTextarea rows={2} value={rules.trigger || ""} onChange={(value) => setRule(["trigger"], value || null)} />
        </GraftField>
      </StudioCollapsibleSection>

      <StudioCollapsibleSection icon="fa-dice-d20" title="Resolution" help="Choose the roll or automatic resolution used by this ability.">
        <div className="studio-form-grid studio-form-grid--compact">
          <GraftField label="Resolution Type" icon="fa-dice-d20" hint="Attack roll, saving throw, both, automatic, check, or none.">
            <StudioSelect value={resolution.type || "none"} options={RESOLUTION_OPTIONS} onChange={setResolutionType} />
          </GraftField>
          {hasAttack ? (
            <>
              <GraftField label="Attack Type" icon="fa-crosshairs">
                <StudioSelect value={resolution.attackType || "melee"} options={ATTACK_TYPE_OPTIONS} onChange={(value) => setRule(["resolution", "attackType"], value)} />
              </GraftField>
              <GraftField label="Attack Ability" icon="fa-fist-raised">
                <StudioSelect value={resolution.abilityBasis || "strength"} options={ABILITY_BASIS_OPTIONS} onChange={(value) => setRule(["resolution", "abilityBasis"], value)} />
              </GraftField>
              <GraftField label="Attack Bonus" icon="fa-plus-minus" hint="Use monster for the calculated attack bonus, or enter a fixed value.">
                <StudioInput value={resolution.bonus ?? "monster"} onChange={(value) => setRule(["resolution", "bonus"], value)} />
              </GraftField>
              <GraftField label="Reach" icon="fa-ruler-horizontal">
                <StudioInput value={resolution.reach || ""} onChange={(value) => setRule(["resolution", "reach"], value || null)} placeholder="5 ft." />
              </GraftField>
              <GraftField label="Range" icon="fa-bullseye">
                <StudioInput value={resolution.range || ""} onChange={(value) => setRule(["resolution", "range"], value || null)} placeholder="60/120 ft." />
              </GraftField>
            </>
          ) : null}
          {hasSave ? (
            <>
              <GraftField label="Save Ability" icon="fa-shield-halved">
                <StudioSelect value={resolution.ability || "constitution"} options={SAVE_ABILITY_OPTIONS} onChange={(value) => setRule(["resolution", "ability"], value)} />
              </GraftField>
              <GraftField label="Save DC" icon="fa-gauge" hint="Use monster for the calculated DC, or enter a fixed number.">
                <StudioInput value={resolution.dc ?? "monster"} onChange={(value) => setRule(["resolution", "dc"], value)} />
              </GraftField>
            </>
          ) : null}
        </div>
      </StudioCollapsibleSection>

      <StudioCollapsibleSection icon="fa-crosshairs" title="Targeting" help="Target, range, area shape, area size, and origin for this ability.">
        <div className="studio-form-grid studio-form-grid--compact">
          <GraftField label="Targeting Type" icon="fa-crosshairs">
            <StudioSelect value={targeting.type || "single"} options={TARGETING_TYPE_OPTIONS} onChange={(value) => setRule(["targeting", "type"], value)} />
          </GraftField>
          <GraftField label="Targets" icon="fa-users">
            <StudioInput value={targeting.targets || ""} onChange={(value) => setRule(["targeting", "targets"], value)} placeholder="one target" />
          </GraftField>
          <GraftField label="Shape" icon="fa-draw-polygon">
            <StudioSelect value={targeting.shape || ""} options={TARGETING_SHAPE_OPTIONS} onChange={(value) => setRule(["targeting", "shape"], value || undefined)} />
          </GraftField>
          <GraftField label="Size" icon="fa-up-right-and-down-left-from-center">
            <input type="number" min="0" value={targeting.size ?? ""} onChange={(event) => setRule(["targeting", "size"], event.target.value === "" ? undefined : Number(event.target.value))} />
          </GraftField>
          <GraftField label="Unit" icon="fa-ruler">
            <StudioInput value={targeting.unit || "ft"} onChange={(value) => setRule(["targeting", "unit"], value)} />
          </GraftField>
          <GraftField label="Origin" icon="fa-location-dot">
            <StudioInput value={targeting.origin || ""} onChange={(value) => setRule(["targeting", "origin"], value || undefined)} placeholder="self, point, target" />
          </GraftField>
        </div>
      </StudioCollapsibleSection>

      <StudioCollapsibleSection icon="fa-burst" title="Damage" help="Damage is allocated from the monster's CR budget; multiple actions divide the routine budget rather than multiplying it.">
        <div className="studio-form-grid studio-form-grid--compact">
          <GraftField label="Damage Mode" icon="fa-burst">
            <StudioSelect value={damage.mode || "none"} options={DAMAGE_MODE_OPTIONS} onChange={(value) => setRule(["damage", "mode"], value)} />
          </GraftField>
          {hasDamage ? (
            <>
              <GraftField label="Budget Role" icon="fa-chart-pie">
                <StudioSelect value={damage.budgetRole || "none"} options={DAMAGE_BUDGET_OPTIONS} onChange={(value) => setRule(["damage", "budgetRole"], value)} />
              </GraftField>
              <GraftField label="Scale" icon="fa-gauge-high">
                <StudioSelect value={damage.scale || "standard"} options={DAMAGE_SCALE_OPTIONS} onChange={(value) => setRule(["damage", "scale"], value)} />
              </GraftField>
              <GraftField label="Budget Share" icon="fa-percent">
                <input type="number" min="0" step="0.05" value={damage.budgetShare ?? ""} onChange={(event) => setRule(["damage", "budgetShare"], event.target.value === "" ? null : Number(event.target.value))} />
              </GraftField>
              <GraftField label="Expected Targets" icon="fa-users">
                <input type="number" min="0" step="0.25" value={damage.expectedTargets ?? ""} onChange={(event) => setRule(["damage", "expectedTargets"], event.target.value === "" ? null : Number(event.target.value))} />
              </GraftField>
              <ListTextarea label="Damage Types" icon="fa-fire" value={damage.types} onChange={(value) => setRule(["damage", "types"], value)} rows={2} placeholder="bludgeoning, acid" />
              {damage.mode === "fixed" ? (
                <>
                  <GraftField label="Average" icon="fa-calculator">
                    <input type="number" min="0" value={damage.average ?? ""} onChange={(event) => setRule(["damage", "average"], event.target.value === "" ? undefined : Number(event.target.value))} />
                  </GraftField>
                  <GraftField label="Dice" icon="fa-dice">
                    <StudioInput value={damage.dice || ""} onChange={(value) => setRule(["damage", "dice"], value || undefined)} placeholder="2d8 + 4" />
                  </GraftField>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </StudioCollapsibleSection>

      <StudioCollapsibleSection icon="fa-person-rays" title="Conditions and Outcomes" help="Conditions and generated outcome text for this ability.">
        <div className="studio-form-grid studio-form-grid--compact">
          <ListTextarea label="Conditions" icon="fa-person-rays" value={condition.names} onChange={(value) => setRule(["condition"], value.length ? { ...condition, names: value } : null)} rows={2} placeholder="grappled, restrained" />
          {asArray(condition.names).length ? (
            <>
              <GraftField label="Severity" icon="fa-triangle-exclamation">
                <StudioSelect value={condition.severity || "moderate"} options={CONDITION_SEVERITY_OPTIONS} onChange={(value) => setRule(["condition", "severity"], value)} />
              </GraftField>
              <GraftField label="Duration" icon="fa-clock">
                <StudioInput value={condition.duration || ""} onChange={(value) => setRule(["condition", "duration"], value)} placeholder="until the end of its next turn" />
              </GraftField>
            </>
          ) : null}
        </div>
        <div className="studio-form-grid">
          <GraftField label="Effect / Hit Text" icon="fa-pen-nib" hint="Main generated outcome. Formula tokens are allowed.">
            <StudioTextarea rows={3} value={text.hit || text.effect || ""} onChange={(value) => {
              if (hasAttack) setRule(["text", "hit"], value);
              else setRule(["text", "effect"], value);
            }} />
          </GraftField>
          {hasSave ? (
            <>
              <GraftField label="Failure" icon="fa-circle-xmark">
                <StudioTextarea rows={3} value={text.failure || ""} onChange={(value) => setRule(["text", "failure"], value)} />
              </GraftField>
              <GraftField label="Success" icon="fa-circle-check">
                <StudioTextarea rows={3} value={text.success || ""} onChange={(value) => setRule(["text", "success"], value)} />
              </GraftField>
            </>
          ) : null}
          <GraftField label="Manual Override" icon="fa-pen-to-square" hint="Leave empty to use generated output. A manual override applies only to this ability.">
            <StudioTextarea rows={4} value={text.manual || ""} onChange={(value) => {
              setRule(["text", "manual"], value || undefined);
              setRule(["text", "source"], value ? "manual" : "generated");
            }} />
          </GraftField>
        </div>
      </StudioCollapsibleSection>

      <StudioAdvancedDetails label="Advanced Ability Rules JSON" icon="fa-code">
        <JsonObjectEditor
          label="Structured Rules"
          hint="Use this only for advanced blocks not yet exposed above, such as summon, procedure, defense, ongoing effects, damage parts, references, and simulation effects."
          rows={18}
          value={rules}
          onApply={(nextRules) => onChange((nextAbility) => {
            nextAbility.rules = {
              schemaVersion: MONSTER_GRAFT_RULES_SCHEMA_VERSION,
              ...nextRules,
            };
            nextAbility.section = nextAbility.rules.section || nextAbility.section;
          })}
        />
      </StudioAdvancedDetails>
    </div>
  );
}

function AbilityEditor({ ability, abilityIds, index, onAbilityChange, onDuplicate, onMove, onRemove, onRename }) {
  const preview = useMemo(() => {
    try {
      return buildStudioGraftOutputPreview({
        id: "preview-graft",
        title: "Preview Graft",
        slots: ["attack"],
        sourceAnchors: ["preview"],
        monster: {
          graftSchemaVersion: "monster-graft-v2.0",
          schemaVersion: "monster-graft-v2.0",
          kind: "composite",
          slot: "attack",
          identity: {
            fantasy: "Preview",
            tacticalRole: "Preview",
            signature: "Preview",
            recognitionTags: ["preview", "ability", "studio"],
          },
          abilities: [ability],
          routine: { mode: "none", defaultSequence: [], opener: [], alternatives: [], multiattack: { enabled: false, mode: "fixed", count: 0, attacks: [], choices: [], replacements: [] } },
          balanceProfile: {},
          complexityProfile: {},
          counterplayProfile: { telegraphs: ["Preview"], positioningAnswers: [], breakConditions: ["Preview"], nonDamageAnswers: [] },
          spikeRiskProfile: {},
          migration: { status: "preview" },
        },
      }, 1).abilities.find((entry) => !entry.synthetic)?.text || "";
    } catch {
      return "Preview unavailable until the ability rules are valid.";
    }
  }, [ability]);

  return (
    <div className="studio-graft-ability-editor">
      <div className="studio-graft-editor-toolbar">
        <span><StudioIcon name="fa-dice-d20" /> Ability {index + 1}</span>
        <div>
          <StudioIconButton icon="fa-arrow-up" label="Move ability up" disabled={index === 0} onClick={() => onMove(-1)} />
          <StudioIconButton icon="fa-arrow-down" label="Move ability down" disabled={index === abilityIds.length - 1} onClick={() => onMove(1)} />
          <StudioIconButton icon="fa-copy" label="Duplicate ability" onClick={onDuplicate} />
          <StudioIconButton danger icon="fa-trash" label="Remove ability" onClick={onRemove} />
        </div>
      </div>

      <StudioCollapsibleSection icon="fa-id-card" title="Ability Identity" help="Local ID, title, role in the routine, and authoring notes for this emitted ability.">
        <div className="studio-form-grid studio-form-grid--compact">
          <GraftField label="Ability ID" icon="fa-fingerprint" hint="Local stable ID. Routine and CR progression references are updated when this changes.">
            <StudioInput value={ability.id || ""} onChange={(value) => onRename(slugify(value, "ability"))} />
          </GraftField>
          <GraftField label="Title" icon="fa-heading">
            <StudioInput value={ability.title || ""} onChange={(value) => onAbilityChange((next) => { next.title = value; })} />
          </GraftField>
          <GraftField label="Routine Role" icon="fa-diagram-project">
            <StudioSelect value={ability.role || "primary"} options={ABILITY_ROLE_OPTIONS} onChange={(value) => onAbilityChange((next) => { next.role = value; })} />
          </GraftField>
          <GraftField label="Availability" icon="fa-clock">
            <StudioSelect value={ability.availability || "always"} options={AVAILABILITY_OPTIONS} onChange={(value) => onAbilityChange((next) => { next.availability = value; })} />
          </GraftField>
          <GraftField label="Maximum Uses per Routine" icon="fa-hashtag">
            <input type="number" min="0" max="12" value={ability.maxUses ?? ""} onChange={(event) => onAbilityChange((next) => { next.maxUses = event.target.value === "" ? undefined : Number(event.target.value); })} />
          </GraftField>
          <ListTextarea label="Ability Tags" icon="fa-tags" value={ability.tags} onChange={(value) => onAbilityChange((next) => { next.tags = value; })} rows={2} />
        </div>
        <GraftField label="Summary" icon="fa-align-left">
          <StudioTextarea rows={2} value={ability.summary || ""} onChange={(value) => onAbilityChange((next) => { next.summary = value; })} />
        </GraftField>
        <div className="studio-form-grid">
          <GraftField label="Mechanics Note" icon="fa-gears" hint="Human-readable design note. Structured rules below remain authoritative.">
            <StudioTextarea rows={3} value={ability.mechanics || ""} onChange={(value) => onAbilityChange((next) => { next.mechanics = value; })} />
          </GraftField>
          <GraftField label="Counterplay Note" icon="fa-shield-halved">
            <StudioTextarea rows={3} value={ability.counterplay || ""} onChange={(value) => onAbilityChange((next) => { next.counterplay = value; })} />
          </GraftField>
        </div>
      </StudioCollapsibleSection>

      <AbilityRulesEditor ability={ability} onChange={onAbilityChange} />

      <StudioCollapsibleSection icon="fa-eye" title="Ability Output" help="Generated output for this ability alone. The Output tab shows the complete Graft at a selected CR.">
        <StudioTextarea className="studio-generated-preview" readOnly rows={6} value={preview || "No generated output yet."} />
      </StudioCollapsibleSection>
    </div>
  );
}

function RoutineEditor({ payload, updatePayload }) {
  const routine = payload.routine || {};
  const multiattack = routine.multiattack || {};
  const abilityIds = asArray(payload.abilities).map((ability) => ability.id);

  function updateRoutine(mutator) {
    updatePayload((next) => {
      next.routine = next.routine || {};
      mutator(next.routine);
    });
  }

  function addAttack() {
    updateRoutine((next) => {
      next.multiattack = next.multiattack || {};
      next.multiattack.attacks = asArray(next.multiattack.attacks);
      next.multiattack.attacks.push({ ref: abilityIds[0] || "ability", count: 1 });
    });
  }

  function addReplacement() {
    updateRoutine((next) => {
      next.multiattack = next.multiattack || {};
      next.multiattack.replacements = asArray(next.multiattack.replacements);
      next.multiattack.replacements.push({
        id: uniqueId("replacement", next.multiattack.replacements.map((entry) => entry.id)),
        with: abilityIds[0] || "ability",
        replace: "oneAttack",
        label: "",
        availability: "ifAvailable",
      });
    });
  }

  function addAlternative() {
    updateRoutine((next) => {
      next.alternatives = asArray(next.alternatives);
      next.alternatives.push({
        id: uniqueId("alternative", next.alternatives.map((entry) => entry.id)),
        when: "",
        purpose: "",
        targetSelection: "",
        sequence: abilityIds.slice(0, 1),
      });
    });
  }

  return (
    <div className="studio-graft-routine-editor">
      <StudioCollapsibleSection icon="fa-diagram-project" title="Turn Routine" help="The routine defines how the engine combines this Graft's abilities into a recognizable turn pattern.">
        <div className="studio-form-grid studio-form-grid--compact studio-graft-routine-mode-grid">
          <GraftField label="Routine Mode" icon="fa-diagram-project">
            <StudioSelect value={routine.mode || "none"} options={ROUTINE_MODE_OPTIONS} onChange={(value) => updateRoutine((next) => { next.mode = value; })} />
          </GraftField>
          <GraftField className="studio-graft-field--span-two studio-graft-field--inline-checkbox" label="Intentional Repetition" icon="fa-repeat" hint="Enable when the same ability is deliberately repeated in the default sequence.">
            <label className="studio-graft-checkbox-label"><StudioCheckbox checked={Boolean(routine.intentionalRepetition)} onChange={(value) => updateRoutine((next) => { next.intentionalRepetition = value; })} /> <span>Repeated attacks are intentional</span></label>
          </GraftField>
        </div>
        <div className="studio-form-grid">
          <GraftField label="Default Plan" icon="fa-list-check">
            <StudioTextarea rows={3} value={routine.defaultPlan || ""} onChange={(value) => updateRoutine((next) => { next.defaultPlan = value; })} />
          </GraftField>
          <GraftField label="Target Selection" icon="fa-crosshairs">
            <StudioTextarea rows={3} value={routine.targetSelection || ""} onChange={(value) => updateRoutine((next) => { next.targetSelection = value; })} />
          </GraftField>
        </div>
        <div className="studio-form-grid studio-form-grid--compact">
          <ListTextarea label="Default Sequence" icon="fa-arrow-right" value={routine.defaultSequence} onChange={(value) => updateRoutine((next) => { next.defaultSequence = value; })} placeholder={abilityIds.join(", ")} />
          <ListTextarea label="Opener" icon="fa-door-open" value={routine.opener} onChange={(value) => updateRoutine((next) => { next.opener = value; })} />
        </div>
        {routine.intentionalRepetition ? (
          <GraftField label="Repetition Reason" icon="fa-quote-left">
            <StudioTextarea rows={2} value={routine.repetitionReason || ""} onChange={(value) => updateRoutine((next) => { next.repetitionReason = value; })} />
          </GraftField>
        ) : null}
        {!multiattack.enabled ? (
          <GraftField label="No-Multiattack Reason" icon="fa-circle-info" hint="Required for an Attack Pattern that intentionally remains a single action.">
            <StudioTextarea rows={2} value={routine.nonMultiattackReason || ""} onChange={(value) => updateRoutine((next) => { next.nonMultiattackReason = value; })} />
          </GraftField>
        ) : null}
      </StudioCollapsibleSection>

      <StudioCollapsibleSection icon="fa-clone" title="Multiattack" help="Author the full routine cadence. CR bands can override enabled state and attack count.">
        <div className="studio-form-grid studio-form-grid--compact">
          <GraftField label="Enabled" icon="fa-toggle-on">
            <label className="studio-graft-checkbox-label"><StudioCheckbox checked={Boolean(multiattack.enabled)} onChange={(value) => updateRoutine((next) => {
              next.multiattack = next.multiattack || {};
              next.multiattack.enabled = value;
              next.multiattack.count = value ? Math.max(2, Number(next.multiattack.count || 2)) : 0;
            })} /> <span>Generate Multiattack</span></label>
          </GraftField>
          <GraftField label="Mode" icon="fa-code-branch">
            <StudioSelect value={multiattack.mode || "fixed"} options={MULTIATTACK_MODE_OPTIONS} onChange={(value) => updateRoutine((next) => { next.multiattack = next.multiattack || {}; next.multiattack.mode = value; })} />
          </GraftField>
          <GraftField label="Attack Count" icon="fa-hashtag">
            <input type="number" min="0" max="12" value={multiattack.count ?? 0} onChange={(event) => updateRoutine((next) => { next.multiattack = next.multiattack || {}; next.multiattack.count = Number(event.target.value || 0); })} />
          </GraftField>
          {multiattack.mode === "choice" ? (
            <ListTextarea label="Choice Ability IDs" icon="fa-list" value={multiattack.choices} onChange={(value) => updateRoutine((next) => { next.multiattack = next.multiattack || {}; next.multiattack.choices = value; })} />
          ) : null}
        </div>

        {multiattack.mode !== "choice" ? (
          <div className="studio-graft-array-editor">
            <div className="studio-graft-array-editor__head"><GraftInlineHeading title="Fixed Attacks" help="Exact ability references and repetition counts used by a fixed Multiattack." /><StudioButton compact icon="fa-plus" onClick={addAttack}>Add Attack</StudioButton></div>
            {asArray(multiattack.attacks).map((attack, index) => (
              <div className="studio-graft-array-row" key={`${attack.ref}-${index}`}>
                <StudioSelect value={attack.ref || abilityIds[0] || ""} options={abilityIds.map((id) => [id, id])} onChange={(value) => updateRoutine((next) => { next.multiattack.attacks[index].ref = value; })} />
                <input type="number" min="1" max="12" value={attack.count ?? 1} onChange={(event) => updateRoutine((next) => { next.multiattack.attacks[index].count = Number(event.target.value || 1); })} />
                <StudioIconButton danger icon="fa-trash" label="Remove attack" onClick={() => updateRoutine((next) => { next.multiattack.attacks.splice(index, 1); })} />
              </div>
            ))}
          </div>
        ) : null}

        <div className="studio-graft-array-editor">
          <div className="studio-graft-array-editor__head"><GraftInlineHeading title="Replacements" help="Abilities that may replace one or more ordinary attacks when their availability permits it." /><StudioButton compact icon="fa-plus" onClick={addReplacement}>Add Replacement</StudioButton></div>
          {asArray(multiattack.replacements).map((replacement, index) => (
            <div className="studio-graft-array-card" key={replacement.id || index}>
              <div className="studio-graft-array-card__head"><strong>{replacement.label || `Replacement ${index + 1}`}</strong><StudioIconButton danger icon="fa-trash" label="Remove replacement" onClick={() => updateRoutine((next) => { next.multiattack.replacements.splice(index, 1); })} /></div>
              <div className="studio-form-grid studio-form-grid--compact">
                <GraftField label="Ability"><StudioSelect value={replacement.with || ""} options={abilityIds.map((id) => [id, id])} onChange={(value) => updateRoutine((next) => { next.multiattack.replacements[index].with = value; })} /></GraftField>
                <GraftField label="Replace"><StudioSelect value={replacement.replace || "oneAttack"} options={[["oneAttack", "One Attack"], ["anyAttack", "Any Attack"], ["oneOrMoreAttacks", "One or More Attacks"]]} onChange={(value) => updateRoutine((next) => { next.multiattack.replacements[index].replace = value; })} /></GraftField>
                <GraftField label="Availability"><StudioSelect value={replacement.availability || "ifAvailable"} options={AVAILABILITY_OPTIONS} onChange={(value) => updateRoutine((next) => { next.multiattack.replacements[index].availability = value; })} /></GraftField>
                <GraftField label="Label"><StudioInput value={replacement.label || ""} onChange={(value) => updateRoutine((next) => { next.multiattack.replacements[index].label = value; })} /></GraftField>
              </div>
            </div>
          ))}
        </div>
      </StudioCollapsibleSection>

      <StudioCollapsibleSection icon="fa-shuffle" title="Routine Alternatives" help="Alternative sequences used when a visible tactical condition changes the normal plan.">
        <div className="studio-graft-array-editor">
          <div className="studio-graft-array-editor__head"><GraftInlineHeading title="Alternatives" help="Conditional turn sequences used instead of the default routine." /><StudioButton compact icon="fa-plus" onClick={addAlternative}>Add Alternative</StudioButton></div>
          {asArray(routine.alternatives).map((alternative, index) => (
            <div className="studio-graft-array-card" key={alternative.id || index}>
              <div className="studio-graft-array-card__head"><strong>{alternative.id || `Alternative ${index + 1}`}</strong><StudioIconButton danger icon="fa-trash" label="Remove alternative" onClick={() => updateRoutine((next) => { next.alternatives.splice(index, 1); })} /></div>
              <div className="studio-form-grid studio-form-grid--compact">
                <GraftField label="ID"><StudioInput value={alternative.id || ""} onChange={(value) => updateRoutine((next) => { next.alternatives[index].id = slugify(value, `alternative-${index + 1}`); })} /></GraftField>
                <ListTextarea label="Sequence" value={alternative.sequence} onChange={(value) => updateRoutine((next) => { next.alternatives[index].sequence = value; })} />
              </div>
              <div className="studio-form-grid">
                <GraftField label="When"><StudioTextarea rows={2} value={alternative.when || ""} onChange={(value) => updateRoutine((next) => { next.alternatives[index].when = value; })} /></GraftField>
                <GraftField label="Purpose"><StudioTextarea rows={2} value={alternative.purpose || ""} onChange={(value) => updateRoutine((next) => { next.alternatives[index].purpose = value; })} /></GraftField>
              </div>
            </div>
          ))}
        </div>
      </StudioCollapsibleSection>
    </div>
  );
}

function ProgressionEditor({ payload, updatePayload }) {
  const progression = payload.progression;
  const abilities = asArray(payload.abilities);
  const abilityIds = abilities.map((ability) => ability.id);

  function enableProgression() {
    updatePayload((next) => {
      next.progression = createStudioGraftProgression(abilityIds, { kind: next.kind }) || {
        schemaVersion: "monster-attack-pattern-progression-v1.0",
        basis: "targetCr",
        bands: [createStudioGraftBand(next)],
      };
    });
  }

  function updateBand(index, mutator) {
    updatePayload((next) => {
      next.progression = next.progression || { basis: "targetCr", bands: [] };
      next.progression.bands = asArray(next.progression.bands);
      mutator(next.progression.bands[index]);
    });
  }

  function toggleAbility(index, abilityId, enabled) {
    updateBand(index, (band) => {
      const ids = new Set(asArray(band.abilityIds));
      if (enabled) ids.add(abilityId);
      else ids.delete(abilityId);
      band.abilityIds = [...ids];
      band.defaultSequence = asArray(band.defaultSequence).filter((id) => ids.has(id));
      band.opener = asArray(band.opener).filter((id) => ids.has(id));
    });
  }

  function updateAbilityPatch(index, abilityId, mutator) {
    updateBand(index, (band) => {
      band.abilityPatches = isPlainObject(band.abilityPatches)
        ? band.abilityPatches
        : {};
      const patch = isPlainObject(band.abilityPatches[abilityId])
        ? cloneJson(band.abilityPatches[abilityId], {})
        : {};
      mutator(patch);
      if (Object.keys(patch).length) band.abilityPatches[abilityId] = patch;
      else delete band.abilityPatches[abilityId];
    });
  }

  function setAbilityPatchPath(index, abilityId, path, value) {
    updateAbilityPatch(index, abilityId, (patch) => {
      setObjectPath(patch, path, value);
    });
  }

  if (!progression) {
    return (
      <StudioCollapsibleSection icon="fa-chart-line" title="CR Progression" help="No CR progression is currently authored. Without it, all abilities are available at every CR.">
        <div className="studio-empty-state studio-empty-state--inline">All abilities are currently emitted at every CR.</div>
        <StudioButton icon="fa-plus" onClick={enableProgression}>Create CR Progression</StudioButton>
      </StudioCollapsibleSection>
    );
  }

  return (
    <StudioCollapsibleSection icon="fa-chart-line" title="CR Progression" help="Each band selects the active repertoire and can override the routine cadence for that CR range." actions={<StudioButton compact danger icon="fa-trash" onClick={() => updatePayload((next) => { next.progression = null; })}>Remove Progression</StudioButton>}>
      <div className="studio-form-grid studio-form-grid--compact">
        <GraftField label="Scaling Basis" icon="fa-gauge-high"><StudioInput value={progression.basis || "targetCr"} onChange={(value) => updatePayload((next) => { next.progression.basis = value; })} /></GraftField>
        <GraftField label="Bands" icon="fa-layer-group"><input readOnly value={asArray(progression.bands).length} /></GraftField>
      </div>
      <div className="studio-graft-array-editor">
        <div className="studio-graft-array-editor__head"><GraftInlineHeading title="CR Bands" help="Non-overlapping Challenge Rating ranges that select abilities and cadence for the compiled Graft." /><StudioButton compact icon="fa-plus" onClick={() => updatePayload((next) => { next.progression.bands.push(createStudioGraftBand(next)); })}>Add Band</StudioButton></div>
        {asArray(progression.bands).map((band, index) => {
          const overrideCadence = isPlainObject(band.multiattack);
          return (
            <div className="studio-graft-progression-band" key={band.id || index}>
              <div className="studio-graft-array-card__head">
                <strong>{band.id || `Band ${index + 1}`} · CR {band.minCr ?? 0}–{band.maxCr ?? 30}</strong>
                <span>
                  <StudioIconButton icon="fa-arrow-up" label="Move band up" disabled={index === 0} onClick={() => updatePayload((next) => { const [item] = next.progression.bands.splice(index, 1); next.progression.bands.splice(index - 1, 0, item); })} />
                  <StudioIconButton icon="fa-arrow-down" label="Move band down" disabled={index === progression.bands.length - 1} onClick={() => updatePayload((next) => { const [item] = next.progression.bands.splice(index, 1); next.progression.bands.splice(index + 1, 0, item); })} />
                  <StudioIconButton danger icon="fa-trash" label="Remove band" onClick={() => updatePayload((next) => { next.progression.bands.splice(index, 1); })} />
                </span>
              </div>
              <div className="studio-form-grid studio-form-grid--compact">
                <GraftField label="Band ID"><StudioInput value={band.id || ""} onChange={(value) => updateBand(index, (nextBand) => { nextBand.id = slugify(value, `band-${index + 1}`); })} /></GraftField>
                <GraftField label="Minimum CR"><input type="number" min="0" max="30" value={band.minCr ?? 0} onChange={(event) => updateBand(index, (nextBand) => { nextBand.minCr = Number(event.target.value || 0); })} /></GraftField>
                <GraftField label="Maximum CR"><input type="number" min="0" max="30" value={band.maxCr ?? 30} onChange={(event) => updateBand(index, (nextBand) => { nextBand.maxCr = Number(event.target.value || 0); })} /></GraftField>
              </div>
              <div className="studio-graft-ability-checklist" aria-label={`Abilities active in ${band.id}`}>
                {abilities.map((ability) => (
                  <label className="studio-graft-check-option" key={ability.id}><StudioCheckbox checked={asArray(band.abilityIds).includes(ability.id)} onChange={(checked) => toggleAbility(index, ability.id, checked)} /><span className="studio-graft-check-option__copy"><strong>{ability.title}</strong><small>{ability.id}</small></span></label>
                ))}
              </div>
              <StudioAdvancedDetails label="Common Ability Overrides" icon="fa-sliders">
                <div className="studio-graft-array-editor">
                  {abilities
                    .filter((ability) => asArray(band.abilityIds).includes(ability.id))
                    .map((ability) => {
                      const patch = band.abilityPatches?.[ability.id] || {};
                      const rulesPatch = patch.rules || {};
                      return (
                        <div className="studio-graft-array-card" key={`${band.id}-${ability.id}-overrides`}>
                          <div className="studio-graft-array-card__head">
                            <strong>{ability.title}</strong>
                            <StudioButton
                              compact
                              danger
                              icon="fa-rotate-left"
                              onClick={() => updateAbilityPatch(index, ability.id, (nextPatch) => {
                                Object.keys(nextPatch).forEach((key) => delete nextPatch[key]);
                              })}
                            >
                              Clear Overrides
                            </StudioButton>
                          </div>
                          <div className="studio-form-grid studio-form-grid--compact">
                            <GraftField label="Maximum Uses"><input type="number" min="0" max="12" value={patch.maxUses ?? ""} onChange={(event) => setAbilityPatchPath(index, ability.id, ["maxUses"], event.target.value === "" ? undefined : Number(event.target.value))} /></GraftField>
                            <GraftField label="Availability"><StudioSelect value={patch.availability || ""} options={[["", "Inherit"], ...AVAILABILITY_OPTIONS]} onChange={(value) => setAbilityPatchPath(index, ability.id, ["availability"], value || undefined)} /></GraftField>
                            <GraftField label="Damage Scale"><StudioSelect value={rulesPatch.damage?.scale || ""} options={[["", "Inherit"], ...DAMAGE_SCALE_OPTIONS]} onChange={(value) => setAbilityPatchPath(index, ability.id, ["rules", "damage", "scale"], value || undefined)} /></GraftField>
                            <GraftField label="Expected Targets"><input type="number" min="0" step="0.25" value={rulesPatch.damage?.expectedTargets ?? ""} onChange={(event) => setAbilityPatchPath(index, ability.id, ["rules", "damage", "expectedTargets"], event.target.value === "" ? undefined : Number(event.target.value))} /></GraftField>
                            <GraftField label="Area Size"><input type="number" min="0" value={rulesPatch.targeting?.size ?? ""} onChange={(event) => setAbilityPatchPath(index, ability.id, ["rules", "targeting", "size"], event.target.value === "" ? undefined : Number(event.target.value))} /></GraftField>
                            <GraftField label="Usage Value"><StudioInput value={rulesPatch.usage?.value || rulesPatch.usage?.recharge || ""} onChange={(value) => {
                              setAbilityPatchPath(index, ability.id, ["rules", "usage", "value"], value || undefined);
                              if (ability.rules?.usage?.type === "recharge") setAbilityPatchPath(index, ability.id, ["rules", "usage", "recharge"], value || undefined);
                            }} placeholder="5-6, 1/Day, 3 uses" /></GraftField>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </StudioAdvancedDetails>
              <div className="studio-form-grid studio-form-grid--compact">
                <ListTextarea label="Default Sequence" value={band.defaultSequence} onChange={(value) => updateBand(index, (nextBand) => { nextBand.defaultSequence = value; })} />
                <ListTextarea label="Opener" value={band.opener} onChange={(value) => updateBand(index, (nextBand) => { nextBand.opener = value; })} />
              </div>
              <GraftField className="studio-graft-field--inline-checkbox" label="Override Multiattack" icon="fa-clone" hint="Leave disabled to inherit the authored routine. Enable to change cadence in this CR band.">
                <label className="studio-graft-checkbox-label"><StudioCheckbox checked={overrideCadence} onChange={(checked) => updateBand(index, (nextBand) => { nextBand.multiattack = checked ? { enabled: false, mode: "fixed", count: 0 } : null; })} /><span>Override cadence for this band</span></label>
              </GraftField>
              {overrideCadence ? (
                <div className="studio-form-grid studio-form-grid--compact">
                  <GraftField label="Enabled"><label className="studio-graft-checkbox-label"><StudioCheckbox checked={Boolean(band.multiattack?.enabled)} onChange={(checked) => updateBand(index, (nextBand) => { nextBand.multiattack.enabled = checked; nextBand.multiattack.count = checked ? Math.max(2, Number(nextBand.multiattack.count || 2)) : 0; })} /><span>Use Multiattack</span></label></GraftField>
                  <GraftField label="Mode"><StudioSelect value={band.multiattack?.mode || "fixed"} options={MULTIATTACK_MODE_OPTIONS} onChange={(value) => updateBand(index, (nextBand) => { nextBand.multiattack.mode = value; })} /></GraftField>
                  <GraftField label="Count"><input type="number" min="0" max="12" value={band.multiattack?.count ?? 0} onChange={(event) => updateBand(index, (nextBand) => { nextBand.multiattack.count = Number(event.target.value || 0); })} /></GraftField>
                </div>
              ) : null}
              <StudioAdvancedDetails label="Advanced Band Patches" icon="fa-code">
                <JsonObjectEditor label="Ability Patches" hint="Optional deep patches keyed by local ability ID. Use this for CR-scaled area size, targets, uses, or other mechanical fields." value={band.abilityPatches || {}} onApply={(value) => updateBand(index, (nextBand) => { nextBand.abilityPatches = value; })} />
                <JsonObjectEditor label="Graft Patch" hint="Optional patch applied to the whole Graft in this band." value={band.graftPatch || {}} onApply={(value) => updateBand(index, (nextBand) => { nextBand.graftPatch = Object.keys(value).length ? value : null; })} />
              </StudioAdvancedDetails>
            </div>
          );
        })}
      </div>
    </StudioCollapsibleSection>
  );
}

function GraftIdentityEditor({ payload, updatePayload }) {
  const identity = payload.identity || {};
  const counterplay = payload.counterplayProfile || {};
  const complexity = payload.complexityProfile || {};
  const spike = payload.spikeRiskProfile || {};
  const allowedSlots = MONSTER_GRAFT_V2_KIND_SLOT_CONTRACT[payload.kind] || MONSTER_GRAFT_V2_KIND_SLOT_CONTRACT.composite;
  const slotOptions = allowedSlots.map((value) => [value, labelFor(value)]);

  function setType(value) {
    updatePayload((next) => {
      next.kind = value;
      const nextAllowedSlots = MONSTER_GRAFT_V2_KIND_SLOT_CONTRACT[value] || MONSTER_GRAFT_V2_KIND_SLOT_CONTRACT.composite;
      if (!nextAllowedSlots.includes(next.slot)) next.slot = nextAllowedSlots[0];
    });
  }

  return (
    <>
      <StudioCollapsibleSection icon="fa-signature" title="Graft Identity" help="Defines what the complete Graft is, independently from the individual abilities it emits.">
        <div className="studio-form-grid studio-form-grid--compact">
          <GraftField label="Type" icon="fa-code-branch"><StudioSelect value={payload.kind || "composite"} options={GRAFT_TYPE_OPTIONS} onChange={setType} /></GraftField>
          {slotOptions.length > 1 ? (
            <GraftField label="Slot" icon="fa-table-cells-large"><StudioSelect value={payload.slot || allowedSlots[0] || "attack"} options={slotOptions} onChange={(value) => updatePayload((next) => { next.slot = value; })} /></GraftField>
          ) : null}
          <GraftField label="Fantasy" icon="fa-book-skull"><StudioInput value={identity.fantasy || ""} onChange={(value) => updatePayload((next) => { next.identity.fantasy = value; })} /></GraftField>
          <GraftField label="Tactical Role" icon="fa-chess"><StudioInput value={identity.tacticalRole || ""} onChange={(value) => updatePayload((next) => { next.identity.tacticalRole = value; })} /></GraftField>
          <GraftField label="Signature" icon="fa-fingerprint"><StudioInput value={identity.signature || ""} onChange={(value) => updatePayload((next) => { next.identity.signature = value; })} /></GraftField>
          <ListTextarea label="Recognition Tags" icon="fa-tags" value={identity.recognitionTags} onChange={(value) => updatePayload((next) => { next.identity.recognitionTags = value; })} rows={2} />
        </div>
      </StudioCollapsibleSection>

      <StudioCollapsibleSection icon="fa-shield-halved" title="Counterplay Profile" help="At least two independent channels are required for Attack Patterns.">
        <div className="studio-form-grid">
          <ListTextarea label="Telegraphs" icon="fa-eye" value={counterplay.telegraphs} onChange={(value) => updatePayload((next) => { next.counterplayProfile.telegraphs = value; })} />
          <ListTextarea label="Positioning Answers" icon="fa-arrows-left-right" value={counterplay.positioningAnswers} onChange={(value) => updatePayload((next) => { next.counterplayProfile.positioningAnswers = value; })} />
          <ListTextarea label="Break Conditions" icon="fa-link-slash" value={counterplay.breakConditions} onChange={(value) => updatePayload((next) => { next.counterplayProfile.breakConditions = value; })} />
          <ListTextarea label="Non-Damage Answers" icon="fa-hand" value={counterplay.nonDamageAnswers} onChange={(value) => updatePayload((next) => { next.counterplayProfile.nonDamageAnswers = value; })} />
        </div>
      </StudioCollapsibleSection>

      <StudioCollapsibleSection icon="fa-gauge-high" title="Evaluation Profiles" help="Authored inputs for Complexity and Spike Risk. Pressure and final balance remain calculated from the compiled monster.">
        <div className="studio-form-grid studio-form-grid--compact">
          {["decisionLoad", "sequencing", "conditionalBranches", "tracking"].map((field) => (
            <GraftField label={labelFor(field)} icon="fa-layer-group" key={field}><input type="number" min="0" max="10" value={complexity[field] ?? 0} onChange={(event) => updatePayload((next) => { next.complexityProfile[field] = Number(event.target.value || 0); })} /></GraftField>
          ))}
          {["openingBurst", "controlSpike", "repeatability"].map((field) => (
            <GraftField label={labelFor(field)} icon="fa-burst" key={field}><input type="number" min="0" max="10" value={spike[field] ?? 0} onChange={(event) => updatePayload((next) => { next.spikeRiskProfile[field] = Number(event.target.value || 0); })} /></GraftField>
          ))}
        </div>
      </StudioCollapsibleSection>
    </>
  );
}

export function StudioMonsterGraftEditor({ component, onChange }) {
  const payload = ensureStudioGraftPayload(component);
  const abilityIds = asArray(payload.abilities).map((ability) => ability.id);
  const [selectedAbilityId, setSelectedAbilityId] = useState(abilityIds[0] || "");
  const validation = validateStudioGraftPayload(component);
  const statusMeta = getStatusMeta(validation);

  useEffect(() => {
    const nextIds = asArray(ensureStudioGraftPayload(component).abilities).map((ability) => ability.id);
    if (!nextIds.includes(selectedAbilityId)) setSelectedAbilityId(nextIds[0] || "");
  }, [component.id, component.monster, selectedAbilityId]);

  function updatePayload(mutator) {
    onChange((nextComponent) => {
      const nextPayload = ensureStudioGraftPayload(nextComponent);
      nextPayload.identity ||= { fantasy: "", tacticalRole: "", signature: "", recognitionTags: [] };
      nextPayload.abilities = asArray(nextPayload.abilities);
      nextPayload.routine ||= { mode: "none", defaultSequence: [], opener: [], alternatives: [], multiattack: { enabled: false, mode: "fixed", count: 0, attacks: [], choices: [], replacements: [] } };
      nextPayload.routine.multiattack ||= { enabled: false, mode: "fixed", count: 0, attacks: [], choices: [], replacements: [] };
      nextPayload.complexityProfile ||= {};
      nextPayload.counterplayProfile ||= { telegraphs: [], positioningAnswers: [], breakConditions: [], nonDamageAnswers: [] };
      nextPayload.spikeRiskProfile ||= {};
      mutator(nextPayload, nextComponent);
      nextComponent.monster = nextPayload;
      if (nextPayload.slot) nextComponent.slots = [nextPayload.slot];
    });
  }

  function updateAbility(abilityId, mutator) {
    updatePayload((next) => {
      const ability = next.abilities.find((entry) => entry.id === abilityId);
      if (ability) mutator(ability);
    });
  }

  function addAbilityToHighestCrBand(next, abilityId) {
    const bands = asArray(next.progression?.bands);
    if (!bands.length) return;
    const highestMaxCr = Math.max(...bands.map((band) => Number(band.maxCr ?? 30)));
    bands.forEach((band) => {
      if (Number(band.maxCr ?? 30) !== highestMaxCr) return;
      band.abilityIds = [...new Set([...asArray(band.abilityIds), abilityId])];
    });
  }

  function addAbility() {
    let nextId = "";
    updatePayload((next) => {
      const ability = createUniqueStudioGraftAbility(next, {
        id: `ability-${next.abilities.length + 1}`,
        title: `New Ability ${next.abilities.length + 1}`,
        section: next.kind === "attackPattern" ? "action" : "trait",
        role: next.abilities.length ? "replacement" : "primary",
      });
      next.abilities.push(ability);
      nextId = ability.id;
      addAbilityToHighestCrBand(next, ability.id);
    });
    if (nextId) setSelectedAbilityId(nextId);
  }

  function duplicateAbility(abilityId) {
    let nextId = "";
    updatePayload((next) => {
      const source = next.abilities.find((entry) => entry.id === abilityId);
      if (!source) return;
      const duplicate = cloneJson(source, {});
      duplicate.id = uniqueId(`${source.id}-copy`, next.abilities.map((entry) => entry.id));
      duplicate.title = `${source.title} Copy`;
      next.abilities.splice(next.abilities.indexOf(source) + 1, 0, duplicate);
      asArray(next.progression?.bands).forEach((band) => {
        if (!asArray(band.abilityIds).includes(source.id)) return;
        band.abilityIds = [...new Set([...asArray(band.abilityIds), duplicate.id])];
      });
      nextId = duplicate.id;
    });
    if (nextId) setSelectedAbilityId(nextId);
  }

  function removeAbility(abilityId) {
    updatePayload((next) => {
      next.abilities = next.abilities.filter((entry) => entry.id !== abilityId);
      removeStudioGraftAbilityReferences(next, abilityId);
    });
  }

  function moveAbility(abilityId, offset) {
    updatePayload((next) => {
      const index = next.abilities.findIndex((entry) => entry.id === abilityId);
      const destination = index + offset;
      if (index < 0 || destination < 0 || destination >= next.abilities.length) return;
      const [ability] = next.abilities.splice(index, 1);
      next.abilities.splice(destination, 0, ability);
    });
  }

  function renameAbility(abilityId, requestedId) {
    const existing = abilityIds.filter((id) => id !== abilityId);
    const nextId = uniqueId(requestedId || "ability", existing);
    if (nextId === abilityId) return;
    updatePayload((next) => {
      const ability = next.abilities.find((entry) => entry.id === abilityId);
      if (!ability) return;
      ability.id = nextId;
      renameStudioGraftAbilityReferences(next, abilityId, nextId);
    });
    setSelectedAbilityId(nextId);
  }

  const selectedAbility = asArray(payload.abilities).find((ability) => ability.id === selectedAbilityId) || asArray(payload.abilities)[0] || null;

  return (
    <div className="studio-component-zone studio-graft-authoring" data-editor-zone="graft">
      <div className="studio-graft-authoring__statusbar">
        <div><StudioIcon name="fa-code-branch" /><span><strong>Graft</strong> · {payload.kind || "missing kind"}</span></div>
        <StudioStatusBadge status={statusMeta.status} icon={statusMeta.icon}>{statusMeta.label}</StudioStatusBadge>
      </div>

      <GraftIdentityEditor payload={payload} updatePayload={updatePayload} />

      <StudioCollapsibleSection icon="fa-list" title="Abilities" help="One Graft can emit multiple Actions, Bonus Actions, Reactions, Traits, Death Effects, Legendary Actions, or Lair Actions." actions={<StudioButton compact icon="fa-plus" onClick={addAbility}>Add Ability</StudioButton>}>
        <div className="studio-graft-abilities-layout">
          <div className="studio-graft-ability-list" role="tablist" aria-label="Graft abilities">
            {asArray(payload.abilities).map((ability) => (
              <button key={ability.id} type="button" role="tab" aria-selected={ability.id === selectedAbility?.id} onClick={() => setSelectedAbilityId(ability.id)}>
                <span><StudioIcon name={ability.rules?.actionEconomy === "reaction" ? "fa-reply" : ability.rules?.actionEconomy === "bonusAction" ? "fa-bolt" : "fa-dice-d20"} /><strong>{ability.title || ability.id}</strong></span>
                <small>{labelFor(ability.rules?.actionEconomy || ability.section || "trait")} · {ability.id}</small>
              </button>
            ))}
            {!payload.abilities.length ? <div className="studio-empty-state studio-empty-state--inline">No abilities. Add the first ability to define what this Graft emits.</div> : null}
          </div>
          <div className="studio-graft-ability-workspace">
            {selectedAbility ? (
              <AbilityEditor
                ability={selectedAbility}
                abilityIds={abilityIds}
                index={payload.abilities.indexOf(selectedAbility)}
                onAbilityChange={(mutator) => updateAbility(selectedAbility.id, mutator)}
                onDuplicate={() => duplicateAbility(selectedAbility.id)}
                onMove={(offset) => moveAbility(selectedAbility.id, offset)}
                onRemove={() => removeAbility(selectedAbility.id)}
                onRename={(nextId) => renameAbility(selectedAbility.id, nextId)}
              />
            ) : null}
          </div>
        </div>
      </StudioCollapsibleSection>

      <RoutineEditor payload={payload} updatePayload={updatePayload} />
      <ProgressionEditor payload={payload} updatePayload={updatePayload} />

      <StudioCollapsibleSection icon="fa-shield-halved" title="Graft Validation" help="Uses the same schema and ability-level rules validation consumed by the Monster Composer runtime.">
        <div className="studio-constraint-summary">
          <span><strong>Abilities:</strong> {payload.abilities.length}</span>
          <span><strong>CR Bands:</strong> {asArray(payload.progression?.bands).length}</span>
          <span><strong>Routine:</strong> {payload.routine?.mode || "none"}</span>
          <span><strong>Status:</strong> {statusMeta.label}</span>
        </div>
        {asArray(validation.issues).length ? (
          <div className="studio-rail-issues studio-rail-issues--grouped">
            {validation.issues.map((issue, index) => (
              <span className={`studio-rail-issue-group studio-rail-issue-group--${issue.severity || "warning"}`} key={`${issue.code}-${issue.path}-${index}`}>
                <em>{issue.severity || "warning"}</em>
                <strong>{issue.message}</strong>
                <small>{issue.path || "monster"}</small>
              </span>
            ))}
          </div>
        ) : <div className="studio-empty-state studio-empty-state--inline">The Graft passes schema validation.</div>}
      </StudioCollapsibleSection>

      <StudioAdvancedDetails label="Advanced Graft JSON" icon="fa-code">
        <JsonObjectEditor
          label="Canonical Graft Payload"
          hint="Diagnostic escape hatch. Normal authoring should use the visual controls above."
          rows={28}
          value={payload}
          onApply={(nextPayload) => updatePayload((next, nextComponent) => {
            nextComponent.monster = nextPayload;
            if (nextPayload.slot) nextComponent.slots = [nextPayload.slot];
            Object.keys(next).forEach((key) => delete next[key]);
            Object.assign(next, nextPayload);
          })}
        />
      </StudioAdvancedDetails>
    </div>
  );
}

export function StudioMonsterGraftOutputPreview({ component }) {
  const [targetCr, setTargetCr] = useState(5);
  const preview = useMemo(() => {
    try {
      return buildStudioGraftOutputPreview(component, targetCr);
    } catch (error) {
      return { error: error.message || "Unable to compile Graft output.", abilities: [], bundle: null, projection: null };
    }
  }, [component, targetCr]);
  const grouped = asArray(preview.abilities).reduce((groups, ability) => {
    const section = ability.section || "trait";
    groups[section] ||= [];
    groups[section].push(ability);
    return groups;
  }, {});

  return (
    <div className="studio-component-zone studio-graft-output" data-editor-zone="output">
      <StudioCollapsibleSection icon="fa-gauge-high" title="Compiled Graft Output" help="Preview the exact repertoire, Multiattack, sections, and generated rules text emitted at a selected CR.">
        <div className="studio-graft-output__controls">
          <GraftField label="Preview CR" icon="fa-gauge-high" hint="Changing CR projects the authored progression before compiling the ability bundle.">
            <input type="number" min="0" max="30" value={targetCr} onChange={(event) => setTargetCr(Number(event.target.value || 0))} />
          </GraftField>
          <div className="studio-constraint-summary">
            <span><strong>Band:</strong> {preview.projection?.bandId || "No progression"}</span>
            <span><strong>Abilities:</strong> {asArray(preview.abilities).filter((ability) => !ability.synthetic).length}</span>
            <span><strong>Multiattack:</strong> {preview.bundle?.routine?.multiattack?.enabled ? preview.bundle.routine.multiattack.count : "Disabled"}</span>
            <span><strong>Compiler:</strong> {preview.bundle?.validation?.status || "Unavailable"}</span>
          </div>
        </div>
        {preview.error ? <div className="studio-graft-inline-error"><StudioIcon name="fa-triangle-exclamation" /> {preview.error}</div> : null}
      </StudioCollapsibleSection>

      {Object.entries(grouped).map(([section, abilities]) => (
        <StudioCollapsibleSection key={section} icon="fa-scroll" title={labelFor(section)} help={`Abilities emitted into the ${labelFor(section)} section at CR ${targetCr}.`}>
          <div className="studio-graft-output__abilities">
            {abilities.map((ability) => (
              <article className="studio-graft-output-card" key={ability.id} data-synthetic={ability.synthetic ? "true" : "false"}>
                <header>
                  <div><strong>{ability.title}</strong><span>{ability.actionEconomy} · {ability.localAbilityId || ability.id}</span></div>
                  {ability.synthetic ? <StudioStatusBadge status="neutral" icon="fa-wand-magic-sparkles">Generated</StudioStatusBadge> : null}
                </header>
                <p>{ability.text}</p>
                {ability.validation?.issues?.length ? (
                  <small>{ability.validation.issues.length} rules issue{ability.validation.issues.length === 1 ? "" : "s"}</small>
                ) : null}
              </article>
            ))}
          </div>
        </StudioCollapsibleSection>
      ))}
      {!Object.keys(grouped).length && !preview.error ? <div className="studio-empty-state">This Graft emits no abilities at CR {targetCr}.</div> : null}
    </div>
  );
}
