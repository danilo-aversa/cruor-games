import {
  cleanText,
  cloneJson,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  isPlainObject,
  normalizeId,
  normalizeInteger,
  normalizeStringList,
  pushIssue,
  requireArray,
  requireId,
  requirePlainObject,
  requireSchemaVersion,
  requireText,
} from "./contract-utils.js";
import { validateScalingReference } from "./mechanical-scaling.js";
import {
  normalizeSemanticProvenance,
  validateSemanticProvenance,
} from "./provenance-v1.js";
import { SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

const FIELDS = Object.freeze([
  "schemaVersion",
  "id",
  "title",
  "scope",
  "category",
  "trigger",
  "state",
  "resolution",
  "counterplay",
  "reset",
  "escalation",
  "gmSummary",
  "playerFacingSigns",
  "provenance",
]);
const TRIGGER_FIELDS = Object.freeze(["events", "timing", "frequencyLimit"]);
const STATE_FIELDS = Object.freeze(["label", "minimum", "maximum", "initial"]);
const RESOLUTION_FIELDS = Object.freeze([
  "timing",
  "threshold",
  "savingThrow",
  "check",
  "attackRoll",
  "effect",
  "duration",
  "range",
  "area",
  "frequency",
  "actionEconomy",
]);
const CHECK_FIELDS = Object.freeze(["ability", "skills", "dc", "scalingKey"]);
const ATTACK_FIELDS = Object.freeze(["bonus", "scalingKey", "target"]);
const EFFECT_FIELDS = Object.freeze([
  "damage",
  "damageType",
  "healing",
  "conditions",
  "additionalText",
]);
const COUNTERPLAY_FIELDS = Object.freeze([
  "id",
  "actionCost",
  "check",
  "success",
]);
const RESET_FIELDS = Object.freeze(["condition", "value"]);
const ESCALATION_FIELDS = Object.freeze(["at", "effect"]);

function hasNumericValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
}

function normalizeCheck(value) {
  if (!isPlainObject(value)) return null;
  return {
    ability: cleanText(value.ability),
    skills: normalizeStringList(value.skills),
    dc: hasNumericValue(value.dc)
      ? normalizeInteger(value.dc, 0, { min: 0, max: 99 })
      : null,
    scalingKey: cleanText(value.scalingKey),
  };
}

function normalizeAttackRoll(value) {
  if (!isPlainObject(value)) return null;
  return {
    bonus: hasNumericValue(value.bonus)
      ? normalizeInteger(value.bonus, 0, { min: -20, max: 30 })
      : null,
    scalingKey: cleanText(value.scalingKey),
    target: cleanText(value.target),
  };
}

function normalizeCounterplay(value = {}, index = 0) {
  return {
    id: normalizeId(value.id || `counterplay-${index + 1}`),
    actionCost: cleanText(value.actionCost),
    check: normalizeCheck(value.check),
    success: cleanText(value.success),
  };
}

export function normalizeGlobalRuleV1(value = {}) {
  const trigger = value.trigger || {};
  const state = value.state || {};
  const resolution = value.resolution || {};
  const effect = resolution.effect || {};
  const reset = value.reset || {};

  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.GLOBAL_RULE,
    id: normalizeId(value.id),
    title: cleanText(value.title),
    scope: cleanText(value.scope) || "location",
    category: cleanText(value.category),
    trigger: {
      events: normalizeStringList(trigger.events, { ids: true }),
      timing: cleanText(trigger.timing),
      frequencyLimit: cleanText(trigger.frequencyLimit),
    },
    state: {
      label: cleanText(state.label),
      minimum: normalizeInteger(state.minimum, 0, { min: 0, max: 99 }),
      maximum: normalizeInteger(state.maximum, 0, { min: 0, max: 99 }),
      initial: normalizeInteger(state.initial, 0, { min: 0, max: 99 }),
    },
    resolution: {
      timing: cleanText(resolution.timing),
      threshold: hasNumericValue(resolution.threshold)
        ? normalizeInteger(resolution.threshold, 0, { min: 0, max: 99 })
        : null,
      savingThrow: normalizeCheck(resolution.savingThrow),
      check: normalizeCheck(resolution.check),
      attackRoll: normalizeAttackRoll(resolution.attackRoll),
      effect: {
        damage: cleanText(effect.damage),
        damageType: cleanText(effect.damageType),
        healing: cleanText(effect.healing),
        conditions: normalizeStringList(effect.conditions, { ids: true }),
        additionalText: cleanText(effect.additionalText),
      },
      duration: cleanText(resolution.duration),
      range: cleanText(resolution.range),
      area: cleanText(resolution.area),
      frequency: cleanText(resolution.frequency),
      actionEconomy: cleanText(resolution.actionEconomy),
    },
    counterplay: (Array.isArray(value.counterplay)
      ? value.counterplay
      : []
    ).map(normalizeCounterplay),
    reset: {
      condition: cleanText(reset.condition),
      value: hasNumericValue(reset.value)
        ? normalizeInteger(reset.value, 0, { min: 0, max: 99 })
        : null,
    },
    escalation: (Array.isArray(value.escalation) ? value.escalation : [])
      .map((entry) => ({
        at: normalizeInteger(entry?.at, 0, { min: 0, max: 99 }),
        effect: cleanText(entry?.effect),
      }))
      .sort((left, right) => left.at - right.at),
    gmSummary: cleanText(value.gmSummary),
    playerFacingSigns: normalizeStringList(value.playerFacingSigns),
    provenance: normalizeSemanticProvenance(value.provenance),
  });
}

function validateCheck(value, path, issues) {
  if (!requirePlainObject(value, path, issues)) return;
  collectUnknownFields(value, CHECK_FIELDS, path, issues);
  requireText(value.ability, `${path}.ability`, issues);
  requireArray(value.skills, `${path}.skills`, issues);
  if (value.dc !== null && !Number.isInteger(value.dc)) {
    pushIssue(
      issues,
      "global-rule.invalid-dc",
      `${path}.dc`,
      "DC must be an integer or null.",
    );
  }
  issues.push(
    ...validateScalingReference(value.scalingKey, `${path}.scalingKey`),
  );
  if (value.dc === null && !cleanText(value.scalingKey)) {
    pushIssue(
      issues,
      "global-rule.unresolved-dc",
      path,
      "A check requires either an authored DC or a scalingKey.",
    );
  }
}

function validateAttackRoll(value, path, issues) {
  if (!requirePlainObject(value, path, issues)) return;
  collectUnknownFields(value, ATTACK_FIELDS, path, issues);
  if (value.bonus !== null && !Number.isInteger(value.bonus)) {
    pushIssue(
      issues,
      "global-rule.invalid-attack-bonus",
      `${path}.bonus`,
      "Attack bonus must be an integer or null.",
    );
  }
  issues.push(
    ...validateScalingReference(value.scalingKey, `${path}.scalingKey`),
  );
  if (value.bonus === null && !cleanText(value.scalingKey)) {
    pushIssue(
      issues,
      "global-rule.unresolved-attack",
      path,
      "An attack roll requires either an authored bonus or a scalingKey.",
    );
  }
}

function hasMechanicalStructure(value = {}) {
  const resolution = value.resolution || {};
  const effect = resolution.effect || {};
  return Boolean(
    resolution.savingThrow ||
    resolution.check ||
    resolution.attackRoll ||
    cleanText(effect.damage) ||
    cleanText(effect.healing) ||
    effect.conditions?.length ||
    cleanText(resolution.duration) ||
    cleanText(resolution.range) ||
    cleanText(resolution.area) ||
    cleanText(resolution.frequency) ||
    cleanText(resolution.actionEconomy) ||
    value.escalation?.length ||
    value.counterplay?.length,
  );
}

export function validateGlobalRuleV1(
  value = {},
  { path = "semantic", published = false } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.GLOBAL_RULE,
    `${path}.schemaVersion`,
    issues,
  );
  requireId(value.id, `${path}.id`, issues);
  requireText(value.title, `${path}.title`, issues);
  requireText(value.scope, `${path}.scope`, issues);
  requireText(value.category, `${path}.category`, issues);

  if (requirePlainObject(value.trigger, `${path}.trigger`, issues)) {
    collectUnknownFields(
      value.trigger,
      TRIGGER_FIELDS,
      `${path}.trigger`,
      issues,
    );
    requireArray(value.trigger.events, `${path}.trigger.events`, issues);
    if (published && !value.trigger.events?.length) {
      pushIssue(
        issues,
        "global-rule.trigger-required",
        `${path}.trigger.events`,
        "Published Global Rules require at least one trigger event.",
      );
    }
    requireText(value.trigger.timing, `${path}.trigger.timing`, issues);
  }

  if (requirePlainObject(value.state, `${path}.state`, issues)) {
    collectUnknownFields(value.state, STATE_FIELDS, `${path}.state`, issues);
    requireText(value.state.label, `${path}.state.label`, issues);
    ["minimum", "maximum", "initial"].forEach((field) => {
      if (!Number.isInteger(value.state[field])) {
        pushIssue(
          issues,
          "global-rule.invalid-state-value",
          `${path}.state.${field}`,
          `${field} must be an integer.`,
        );
      }
    });
    if (value.state.maximum < value.state.minimum) {
      pushIssue(
        issues,
        "global-rule.invalid-state-range",
        `${path}.state.maximum`,
        "State maximum cannot be lower than minimum.",
      );
    }
    if (
      value.state.initial < value.state.minimum ||
      value.state.initial > value.state.maximum
    ) {
      pushIssue(
        issues,
        "global-rule.invalid-initial-state",
        `${path}.state.initial`,
        "Initial state must be inside the configured range.",
      );
    }
  }

  if (requirePlainObject(value.resolution, `${path}.resolution`, issues)) {
    collectUnknownFields(
      value.resolution,
      RESOLUTION_FIELDS,
      `${path}.resolution`,
      issues,
    );
    if (value.resolution.savingThrow) {
      validateCheck(
        value.resolution.savingThrow,
        `${path}.resolution.savingThrow`,
        issues,
      );
    }
    if (value.resolution.check) {
      validateCheck(value.resolution.check, `${path}.resolution.check`, issues);
    }
    if (value.resolution.attackRoll) {
      validateAttackRoll(
        value.resolution.attackRoll,
        `${path}.resolution.attackRoll`,
        issues,
      );
    }
    if (
      requirePlainObject(
        value.resolution.effect,
        `${path}.resolution.effect`,
        issues,
      )
    ) {
      collectUnknownFields(
        value.resolution.effect,
        EFFECT_FIELDS,
        `${path}.resolution.effect`,
        issues,
      );
      requireArray(
        value.resolution.effect.conditions,
        `${path}.resolution.effect.conditions`,
        issues,
      );
    }
  }

  if (requireArray(value.counterplay, `${path}.counterplay`, issues)) {
    value.counterplay.forEach((entry, index) => {
      const entryPath = `${path}.counterplay[${index}]`;
      if (!requirePlainObject(entry, entryPath, issues)) return;
      collectUnknownFields(entry, COUNTERPLAY_FIELDS, entryPath, issues);
      requireId(entry.id, `${entryPath}.id`, issues);
      requireText(entry.actionCost, `${entryPath}.actionCost`, issues);
      if (entry.check) validateCheck(entry.check, `${entryPath}.check`, issues);
      requireText(entry.success, `${entryPath}.success`, issues);
    });
  }

  if (requirePlainObject(value.reset, `${path}.reset`, issues)) {
    collectUnknownFields(value.reset, RESET_FIELDS, `${path}.reset`, issues);
    if (value.reset.value !== null && !Number.isInteger(value.reset.value)) {
      pushIssue(
        issues,
        "global-rule.invalid-reset-value",
        `${path}.reset.value`,
        "Reset value must be an integer or null.",
      );
    }
  }

  if (requireArray(value.escalation, `${path}.escalation`, issues)) {
    value.escalation.forEach((entry, index) => {
      const entryPath = `${path}.escalation[${index}]`;
      if (!requirePlainObject(entry, entryPath, issues)) return;
      collectUnknownFields(entry, ESCALATION_FIELDS, entryPath, issues);
      if (!Number.isInteger(entry.at)) {
        pushIssue(
          issues,
          "global-rule.invalid-escalation-threshold",
          `${entryPath}.at`,
          "Escalation threshold must be an integer.",
        );
      }
      requireText(entry.effect, `${entryPath}.effect`, issues);
    });
  }

  requireArray(value.playerFacingSigns, `${path}.playerFacingSigns`, issues);
  if (published) {
    requireText(value.gmSummary, `${path}.gmSummary`, issues);
    if (!hasMechanicalStructure(value)) {
      pushIssue(
        issues,
        "global-rule.mechanics-required",
        path,
        "Published Global Rules require resolvable mechanics.",
      );
    }
    if (!value.counterplay?.length) {
      pushIssue(
        issues,
        "global-rule.counterplay-required",
        `${path}.counterplay`,
        "Published Global Rules require explicit counterplay.",
      );
    }
  }

  issues.push(
    ...validateSemanticProvenance(value.provenance, {
      path: `${path}.provenance`,
    }),
  );
  return issues;
}

export function parseGlobalRuleV1(value = {}, options = {}) {
  const normalized = normalizeGlobalRuleV1(value);
  return createParseResult(normalized, validateGlobalRuleV1(value, options));
}

export function cloneGlobalRuleV1(value = {}) {
  return cloneJson(normalizeGlobalRuleV1(value));
}
