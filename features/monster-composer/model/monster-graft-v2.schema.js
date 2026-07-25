import {
  MONSTER_GRAFT_RULES_SCHEMA_VERSION,
  validateMonsterGraftRules,
} from "./monster-graft-rules.schema.js";

export const MONSTER_GRAFT_V2_SCHEMA_VERSION = "monster-graft-v2.0";

export const MONSTER_GRAFT_V2_KINDS = Object.freeze([
  "traitBundle",
  "attackPattern",
  "movementPattern",
  "horrorFeature",
  "combatTwist",
  "weakness",
  "deathEffect",
  "lairEffect",
  "composite",
]);

export const MONSTER_GRAFT_V2_ROUTINE_MODES = Object.freeze([
  "none",
  "authored",
  "single",
  "alternating",
  "procedure",
]);

export const MONSTER_GRAFT_V2_MULTIATTACK_MODES = Object.freeze([
  "fixed",
  "choice",
]);

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function normalizeStringArray(value) {
  return asArray(value).map(cleanString).filter(Boolean);
}

function uniqueArray(values = []) {
  return [...new Set(normalizeStringArray(values))];
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeEnum(value, allowed, fallback) {
  const normalized = cleanString(value);
  return allowed.includes(normalized) ? normalized : fallback;
}

function normalizePositiveInteger(value, fallback = 1) {
  const numeric = Math.floor(Number(value));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function normalizeIdentity(identity = {}) {
  const normalized = isPlainObject(identity) ? identity : {};
  return {
    fantasy: cleanString(normalized.fantasy),
    tacticalRole: cleanString(normalized.tacticalRole),
    signature: cleanString(normalized.signature),
    recognitionTags: uniqueArray(normalized.recognitionTags),
  };
}

function normalizeAbility(entry = {}, index = 0) {
  const normalized = isPlainObject(entry) ? entry : {};
  const localId = cleanString(normalized.id) || `ability-${index + 1}`;
  const rules = isPlainObject(normalized.rules) ? normalized.rules : null;
  return {
    ...normalized,
    id: localId,
    title: cleanString(normalized.title) || `Ability ${index + 1}`,
    section: cleanString(normalized.section || rules?.section),
    summary: cleanString(normalized.summary),
    mechanics: cleanString(normalized.mechanics || normalized.tableText),
    counterplay: cleanString(normalized.counterplay),
    rules,
    tags: uniqueArray(normalized.tags),
    authored: normalized.authored !== false,
  };
}

function normalizeRoutineAlternative(entry = {}, index = 0) {
  const normalized = isPlainObject(entry) ? entry : {};
  return {
    ...normalized,
    id: cleanString(normalized.id) || `alternative-${index + 1}`,
    when: cleanString(normalized.when),
    sequence: normalizeStringArray(normalized.sequence),
  };
}

function normalizeRoutineReplacement(entry = {}, index = 0) {
  if (typeof entry === "string") {
    return {
      id: `replacement-${index + 1}`,
      with: cleanString(entry),
      replace: "oneAttack",
      label: "",
    };
  }
  const normalized = isPlainObject(entry) ? entry : {};
  return {
    ...normalized,
    id: cleanString(normalized.id) || `replacement-${index + 1}`,
    with: cleanString(normalized.with || normalized.ref || normalized.id),
    replace: cleanString(normalized.replace) || "oneAttack",
    label: cleanString(normalized.label),
  };
}

function countSequence(sequence = []) {
  const counts = new Map();
  normalizeStringArray(sequence).forEach((id) => {
    counts.set(id, (counts.get(id) || 0) + 1);
  });
  return [...counts.entries()].map(([ref, count]) => ({ ref, count }));
}

function normalizeMultiattack(multiattack = {}, defaultSequence = []) {
  if (!isPlainObject(multiattack)) {
    return {
      enabled: false,
      mode: "fixed",
      count: 0,
      attacks: [],
      choices: [],
      replacements: [],
    };
  }

  const choices = normalizeStringArray(multiattack.choices);
  const explicitAttacks = asArray(multiattack.attacks)
    .map((entry) => {
      if (typeof entry === "string") return { ref: cleanString(entry), count: 1 };
      if (!isPlainObject(entry)) return null;
      return {
        ...entry,
        ref: cleanString(entry.ref || entry.id || entry.label),
        count: normalizePositiveInteger(entry.count, 1),
        label: cleanString(entry.label),
      };
    })
    .filter((entry) => entry?.ref);
  const attacks = explicitAttacks.length
    ? explicitAttacks
    : choices.length
      ? choices.map((ref) => ({ ref, count: 1, label: "" }))
      : countSequence(defaultSequence);
  const enabled = Object.prototype.hasOwnProperty.call(multiattack, "enabled")
    ? Boolean(multiattack.enabled)
    : attacks.length > 0;
  const mode = normalizeEnum(
    multiattack.mode || (choices.length ? "choice" : "fixed"),
    MONSTER_GRAFT_V2_MULTIATTACK_MODES,
    choices.length ? "choice" : "fixed",
  );
  const inferredCount =
    mode === "choice"
      ? normalizePositiveInteger(multiattack.attacks, 2)
      : attacks.reduce((sum, attack) => sum + Number(attack.count || 0), 0);

  return {
    ...multiattack,
    enabled,
    mode,
    count: enabled
      ? normalizePositiveInteger(multiattack.count, Math.max(1, inferredCount || 2))
      : 0,
    attacks,
    choices,
    replacements: asArray(multiattack.replacements).map(normalizeRoutineReplacement),
  };
}

function normalizeRoutine(routine = {}) {
  const normalized = isPlainObject(routine) ? routine : {};
  const defaultSequence = normalizeStringArray(normalized.defaultSequence);
  return {
    ...normalized,
    mode: normalizeEnum(
      normalized.mode,
      MONSTER_GRAFT_V2_ROUTINE_MODES,
      defaultSequence.length ? "authored" : "none",
    ),
    defaultSequence,
    opener: normalizeStringArray(normalized.opener),
    alternatives: asArray(normalized.alternatives).map(normalizeRoutineAlternative),
    multiattack: normalizeMultiattack(normalized.multiattack, defaultSequence),
  };
}

function normalizeProfile(profile) {
  return isPlainObject(profile) ? { ...profile } : null;
}

function normalizeMigration(migration = {}) {
  const normalized = isPlainObject(migration) ? migration : {};
  return {
    ...normalized,
    legacyGraftIds: uniqueArray(normalized.legacyGraftIds),
    status: cleanString(normalized.status) || "draft",
  };
}

function createIssue(severity, code, message, path, details = null) {
  return {
    severity,
    code,
    message,
    path,
    ...(details ? { details } : {}),
  };
}

function getRoutineReferences(routine = {}) {
  return [
    ...normalizeStringArray(routine.defaultSequence),
    ...normalizeStringArray(routine.opener),
    ...asArray(routine.alternatives).flatMap((entry) =>
      normalizeStringArray(entry.sequence),
    ),
    ...asArray(routine.multiattack?.attacks).map((entry) => cleanString(entry.ref)),
    ...normalizeStringArray(routine.multiattack?.choices),
    ...asArray(routine.multiattack?.replacements).map((entry) =>
      cleanString(entry.with),
    ),
  ].filter(Boolean);
}

export function getMonsterGraftSchemaVersion(graft = {}) {
  return cleanString(graft.graftSchemaVersion || graft.schemaVersion);
}

export function isMonsterGraftV2(graft = {}) {
  return getMonsterGraftSchemaVersion(graft) === MONSTER_GRAFT_V2_SCHEMA_VERSION;
}

export function normalizeMonsterGraftV2(graft = {}) {
  if (!isMonsterGraftV2(graft)) return null;
  return {
    ...graft,
    schemaVersion: MONSTER_GRAFT_V2_SCHEMA_VERSION,
    id: cleanString(graft.id),
    title: cleanString(graft.title),
    kind: normalizeEnum(graft.kind, MONSTER_GRAFT_V2_KINDS, "composite"),
    slot: cleanString(graft.slot),
    sourceAnchors: uniqueArray(
      graft.sourceAnchors?.length ? graft.sourceAnchors : graft.source,
    ),
    identity: normalizeIdentity(graft.identity),
    abilities: asArray(graft.abilities).map(normalizeAbility),
    routine: normalizeRoutine(graft.routine),
    modifiers: asArray(graft.modifiers).filter(isPlainObject),
    compatibility: normalizeProfile(graft.compatibility),
    balanceProfile: normalizeProfile(graft.balanceProfile || graft.balance),
    complexityProfile: normalizeProfile(graft.complexityProfile),
    counterplayProfile: normalizeProfile(graft.counterplayProfile),
    spikeRiskProfile: normalizeProfile(graft.spikeRiskProfile),
    migration: normalizeMigration(graft.migration),
  };
}

export function validateMonsterGraftV2(graft = {}) {
  const applicable = isMonsterGraftV2(graft);
  if (!applicable) {
    return {
      schemaVersion: MONSTER_GRAFT_V2_SCHEMA_VERSION,
      applicable: false,
      status: "legacy",
      issues: [],
      normalized: null,
    };
  }

  const normalized = normalizeMonsterGraftV2(graft);
  const issues = [];
  const rawAbilities = asArray(graft.abilities);
  if (!MONSTER_GRAFT_V2_KINDS.includes(cleanString(graft.kind))) {
    issues.push(
      createIssue(
        "error",
        "graft-v2-kind",
        `Unknown or missing Graft v2 kind: ${cleanString(graft.kind) || "none"}.`,
        "kind",
      ),
    );
  }
  if (!normalized.id) {
    issues.push(createIssue("error", "graft-v2-id", "Graft v2 has no id.", "id"));
  }
  if (!normalized.title) {
    issues.push(
      createIssue("error", "graft-v2-title", "Graft v2 has no title.", "title"),
    );
  }
  if (!normalized.slot) {
    issues.push(
      createIssue("error", "graft-v2-slot", "Graft v2 has no slot.", "slot"),
    );
  }
  if (!normalized.sourceAnchors.length) {
    issues.push(
      createIssue(
        "error",
        "graft-v2-source-anchor",
        "Graft v2 has no Source Anchor.",
        "sourceAnchors",
      ),
    );
  }

  const localIds = normalized.abilities.map((ability) => ability.id);
  const duplicates = localIds.filter((id, index) => localIds.indexOf(id) !== index);
  uniqueArray(duplicates).forEach((id) => {
    issues.push(
      createIssue(
        "error",
        "graft-v2-duplicate-ability-id",
        `Duplicate local ability id: ${id}.`,
        "abilities",
      ),
    );
  });

  normalized.abilities.forEach((ability, index) => {
    const path = `abilities[${index}]`;
    const rawAbility = isPlainObject(rawAbilities[index]) ? rawAbilities[index] : {};
    if (!cleanString(rawAbility.id)) {
      issues.push(
        createIssue("error", "graft-v2-ability-id", "Ability has no id.", `${path}.id`),
      );
    }
    if (ability.id.includes(":")) {
      issues.push(
        createIssue(
          "error",
          "graft-v2-ability-local-id",
          "Local ability ids must not contain a colon.",
          `${path}.id`,
        ),
      );
    }
    if (!cleanString(rawAbility.title)) {
      issues.push(
        createIssue(
          "error",
          "graft-v2-ability-title",
          "Ability has no title.",
          `${path}.title`,
        ),
      );
    }
    if (!isPlainObject(rawAbility.rules)) {
      issues.push(
        createIssue(
          "error",
          "graft-v2-ability-rules",
          "Every emitted ability requires an explicit structured rules object.",
          `${path}.rules`,
        ),
      );
      return;
    }
    const report = validateMonsterGraftRules({
      id: `${normalized.id}:${ability.id}`,
      title: ability.title,
      slot: normalized.slot,
      section: ability.section || ability.rules.section,
      mechanics: ability.mechanics,
      counterplay: ability.counterplay,
      rules: {
        schemaVersion:
          ability.rules.schemaVersion || MONSTER_GRAFT_RULES_SCHEMA_VERSION,
        ...ability.rules,
      },
    });
    report.issues.forEach((issue) => {
      issues.push({
        ...issue,
        path: `${path}.${issue.path || "rules"}`,
      });
    });
  });

  if (normalized.kind === "attackPattern") {
    if (!normalized.abilities.length) {
      issues.push(
        createIssue(
          "error",
          "graft-v2-attack-pattern-empty",
          "Attack Pattern grafts must emit at least one offensive ability.",
          "abilities",
        ),
      );
    }
    ["fantasy", "tacticalRole", "signature"].forEach((field) => {
      if (!cleanString(normalized.identity?.[field])) {
        issues.push(
          createIssue(
            "error",
            "graft-v2-attack-pattern-identity",
            `Attack Pattern identity is missing ${field}.`,
            `identity.${field}`,
          ),
        );
      }
    });
    if (normalized.routine.mode === "none") {
      issues.push(
        createIssue(
          "error",
          "graft-v2-attack-pattern-routine",
          "Attack Pattern grafts require an explicit authored routine mode.",
          "routine.mode",
        ),
      );
    }
  }

  const abilityIds = new Set(localIds);
  uniqueArray(getRoutineReferences(normalized.routine)).forEach((reference) => {
    if (!abilityIds.has(reference)) {
      issues.push(
        createIssue(
          "error",
          "graft-v2-routine-reference",
          `Routine reference does not resolve to a local ability: ${reference}.`,
          "routine",
          { reference },
        ),
      );
    }
  });

  if (
    normalized.routine.multiattack.enabled &&
    normalized.routine.multiattack.attacks.length === 0
  ) {
    issues.push(
      createIssue(
        "error",
        "graft-v2-multiattack-empty",
        "Authored Multiattack is enabled but references no attacks.",
        "routine.multiattack",
      ),
    );
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    schemaVersion: MONSTER_GRAFT_V2_SCHEMA_VERSION,
    applicable: true,
    status: errors.length ? "error" : warnings.length ? "warning" : "pass",
    issues,
    errors,
    warnings,
    normalized,
  };
}

export function summarizeMonsterGraftV2(grafts = []) {
  const reports = asArray(grafts).map(validateMonsterGraftV2);
  const applicable = reports.filter((report) => report.applicable);
  return {
    schemaVersion: MONSTER_GRAFT_V2_SCHEMA_VERSION,
    total: asArray(grafts).length,
    legacy: reports.filter((report) => !report.applicable).length,
    v2: applicable.length,
    passing: applicable.filter((report) => report.status === "pass").length,
    warning: applicable.filter((report) => report.status === "warning").length,
    error: applicable.filter((report) => report.status === "error").length,
    abilities: applicable.reduce(
      (sum, report) => sum + Number(report.normalized?.abilities?.length || 0),
      0,
    ),
  };
}
