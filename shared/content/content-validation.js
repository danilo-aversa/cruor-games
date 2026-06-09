const COMPONENT_RULE_REQUIRED_FIELDS = Object.freeze(["schemaVersion", "section", "actionEconomy", "usage", "resolution"]);
const MONSTER_GRAFT_CONTENT_TYPE = "monster-graft";
const LOCATION_REGION_CONTENT_TYPE = "location-region";
const MONSTER_FRAME_FIT_VALUES = Object.freeze({
  encounterRoles: ["minion", "standard", "boss"],
  tacticalRoles: ["brute", "skirmisher", "controller", "lurker", "artillery", "support"],
  tiers: ["normal", "elite", "boss", "legendary", "setpiece"],
  tempo: ["slow", "standard", "fast", "ambusher", "legendary"],
  danger: ["standard", "hard", "horror"],
});

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeId(value) {
  return String(value || "").trim();
}

function pushIssue(issues, { severity = "error", scope = "content", path = "", id = "", message }) {
  issues.push({ severity, scope, path, id, message });
}

function validateMonsterRules(component, issues, pathPrefix = "component") {
  const id = normalizeId(component?.id || component?.monster?.graftId);
  const rules = component?.monster?.rules || component?.rules;

  if (!isPlainObject(rules)) {
    pushIssue(issues, {
      severity: "error",
      scope: "monster-rules",
      path: `${pathPrefix}.monster.rules`,
      id,
      message: "Monster graft has no structured monster.rules object.",
    });
    return;
  }

  COMPONENT_RULE_REQUIRED_FIELDS.forEach((field) => {
    if (rules[field] === undefined || rules[field] === null || rules[field] === "") {
      pushIssue(issues, {
        severity: "error",
        scope: "monster-rules",
        path: `${pathPrefix}.monster.rules.${field}`,
        id,
        message: `Monster rules are missing required field: ${field}.`,
      });
    }
  });

  if (rules.migration?.isStructured !== true) {
    pushIssue(issues, {
      severity: "warning",
      scope: "monster-rules",
      path: `${pathPrefix}.monster.rules.migration`,
      id,
      message: "Monster rules are not marked as structured.",
    });
  }

  if (!isPlainObject(rules.targeting)) {
    pushIssue(issues, {
      severity: "warning",
      scope: "monster-rules",
      path: `${pathPrefix}.monster.rules.targeting`,
      id,
      message: "Structured rules have no targeting object.",
    });
  }

  if (!isPlainObject(rules.damage)) {
    pushIssue(issues, {
      severity: "warning",
      scope: "monster-rules",
      path: `${pathPrefix}.monster.rules.damage`,
      id,
      message: "Structured rules have no damage object.",
    });
  }

  if (rules.usage?.type === "recharge" && !hasText(rules.usage?.value)) {
    pushIssue(issues, {
      severity: "warning",
      scope: "monster-rules",
      path: `${pathPrefix}.monster.rules.usage.value`,
      id,
      message: "Recharge usage has no recharge value.",
    });
  }
}

function validateMonsterAnatomyObject(value, issues, { id, path, label }) {
  if (value === null || value === undefined) return;
  if (!isPlainObject(value)) {
    pushIssue(issues, {
      severity: "error",
      scope: "monster-anatomy",
      path,
      id,
      message: `${label} must be an object when present.`,
    });
    return;
  }

  Object.entries(value).forEach(([field, fieldValue]) => {
    if (field === "note") return;
    if (fieldValue !== undefined && fieldValue !== null && !Array.isArray(fieldValue)) {
      pushIssue(issues, {
        severity: "warning",
        scope: "monster-anatomy",
        path: `${path}.${field}`,
        id,
        message: `${label}.${field} should be an array.`,
      });
    }
  });
}


function validateMonsterFrameFit(component, issues, pathPrefix = "component") {
  const id = normalizeId(component?.id || component?.monster?.graftId);
  const fit = component?.monster?.fit || component?.fit || component?.frameFit;
  if (!fit) return;

  if (!isPlainObject(fit)) {
    pushIssue(issues, {
      severity: "error",
      scope: "monster-frame-fit",
      path: `${pathPrefix}.monster.fit`,
      id,
      message: "Monster Frame Fit must be an object when present.",
    });
    return;
  }

  Object.entries(MONSTER_FRAME_FIT_VALUES).forEach(([dimension, knownValues]) => {
    const dimensionValue = fit[dimension];
    if (!dimensionValue) return;
    if (!isPlainObject(dimensionValue)) {
      pushIssue(issues, {
        severity: "error",
        scope: "monster-frame-fit",
        path: `${pathPrefix}.monster.fit.${dimension}`,
        id,
        message: `Monster Frame Fit ${dimension} must be an object.`,
      });
      return;
    }

    ["allowed", "recommended", "forbidden"].forEach((field) => {
      asArray(dimensionValue[field]).forEach((entry) => {
        if (!knownValues.includes(entry)) {
          pushIssue(issues, {
            severity: "error",
            scope: "monster-frame-fit",
            path: `${pathPrefix}.monster.fit.${dimension}.${field}`,
            id,
            message: `Unknown Monster Frame Fit value: ${entry}.`,
          });
        }
      });
    });
  });

  const cr = fit.cr;
  if (cr && isPlainObject(cr) && cr.min !== undefined && cr.max !== undefined && Number(cr.min) > Number(cr.max)) {
    pushIssue(issues, {
      severity: "error",
      scope: "monster-frame-fit",
      path: `${pathPrefix}.monster.fit.cr`,
      id,
      message: "Monster Frame Fit CR min is higher than max.",
    });
  }
}

function validateLocationRegion(component, issues, pathPrefix = "component") {
  if (component.contentType !== LOCATION_REGION_CONTENT_TYPE) return;
  if (!isPlainObject(component.locationRegion)) {
    pushIssue(issues, {
      severity: "warning",
      scope: "location-region",
      path: `${pathPrefix}.locationRegion`,
      id: normalizeId(component.id),
      message: "Location region has no locationRegion metadata object.",
    });
  }
}

export function validateContentComponentStrict(component = {}, { pathPrefix = "component" } = {}) {
  const issues = [];
  const id = normalizeId(component.id || component.slug);

  if (!id) {
    pushIssue(issues, {
      severity: "error",
      scope: "component",
      path: `${pathPrefix}.id`,
      message: "Component is missing a stable id.",
    });
  }

  if (!hasText(component.title || component.label)) {
    pushIssue(issues, {
      severity: "error",
      scope: "component",
      path: `${pathPrefix}.title`,
      id,
      message: "Component is missing a title or label.",
    });
  }

  if (component.contentType === MONSTER_GRAFT_CONTENT_TYPE) {
    validateMonsterRules(component, issues, pathPrefix);
    validateMonsterAnatomyObject(component.monster?.constraints || component.anatomyConstraints, issues, {
      id,
      path: `${pathPrefix}.monster.constraints`,
      label: "Monster constraints",
    });
    validateMonsterAnatomyObject(component.monster?.anatomyGrants || component.anatomyGrants, issues, {
      id,
      path: `${pathPrefix}.monster.anatomyGrants`,
      label: "Monster anatomy grants",
    });
    validateMonsterFrameFit(component, issues, pathPrefix);
  }

  validateLocationRegion(component, issues, pathPrefix);
  return issues;
}

export function validateContentPackStrict(pack = {}) {
  const packId = normalizeId(pack.id || pack.slug);
  const components = asArray(pack.collections?.components || pack.components);

  return components.flatMap((component, index) =>
    validateContentComponentStrict(component, {
      pathPrefix: `collections.components[${index}]`,
    }).map((issue) => ({ ...issue, packId })),
  );
}

export function validateContentRegistryStrict(registry = {}) {
  const components = asArray(registry.components);
  return components.flatMap((component, index) =>
    validateContentComponentStrict(component, {
      pathPrefix: `registry.components[${index}]`,
    }),
  );
}

export function validateStaticContentRepository({ packs = [], registry = null, baseIssues = [] } = {}) {
  const packIssues = asArray(packs).flatMap((pack) => validateContentPackStrict(pack));
  const registryIssues = registry ? validateContentRegistryStrict(registry) : [];
  const issues = [...asArray(baseIssues), ...packIssues, ...registryIssues];
  const summary = issues.reduce(
    (acc, issue) => {
      acc.total += 1;
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    },
    { total: 0, error: 0, warning: 0, info: 0 },
  );

  return {
    reportType: "cruor-static-content-validation",
    generatedAt: new Date().toISOString(),
    summary,
    issues,
  };
}
