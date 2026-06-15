import assert from "node:assert/strict";
import {
  STATIC_CONTENT_PACK,
  STATIC_CONTENT_PACKS,
  STATIC_CONTENT_PACK_ISSUES,
  STATIC_CONTENT_REGISTRY_DATA,
} from "../shared/content/static-registry.js";
import { validateContentPack } from "../shared/content/content-pack-schema.js";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function idOf(entry) {
  return String(entry?.id || entry?.slug || "").trim();
}

function pushIssue(issues, { severity = "error", packId = "static", path = "content", id = "", message }) {
  issues.push({ severity, packId, path, id, message });
}

function findDuplicates(entries = []) {
  const seen = new Set();
  const duplicates = new Set();
  asArray(entries).forEach((entry) => {
    const id = idOf(entry);
    if (!id) return;
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  });
  return [...duplicates];
}

function buildGlobalSets(registryData = {}) {
  return {
    sourceAnchors: new Set(asArray(registryData.sourceAnchors).map(idOf).filter(Boolean)),
    workflows: new Set(asArray(registryData.workflows).map(idOf).filter(Boolean)),
    slots: new Set(asArray(registryData.slots).map(idOf).filter(Boolean)),
    components: new Set(asArray(registryData.components).map(idOf).filter(Boolean)),
    inspirations: new Set(asArray(registryData.inspirations).map(idOf).filter(Boolean)),
  };
}

function validatePackReferences(pack = {}, globalSets) {
  const packId = pack.id || "unknown-pack";
  const issues = [];
  const collections = pack.collections || {};

  ["workflows", "slots", "components", "sourceAnchors", "inspirations", "taxonomies"].forEach((collectionName) => {
    findDuplicates(collections[collectionName]).forEach((id) => {
      pushIssue(issues, {
        severity: "error",
        packId,
        path: `collections.${collectionName}`,
        id,
        message: `Duplicate ${collectionName} id: ${id}`,
      });
    });
  });

  asArray(collections.components).forEach((component, index) => {
    const id = idOf(component) || `component-${index}`;
    asArray(component.sourceAnchors).forEach((sourceAnchorId) => {
      if (!globalSets.sourceAnchors.has(sourceAnchorId)) {
        pushIssue(issues, {
          severity: "error",
          packId,
          path: `collections.components[${index}].sourceAnchors`,
          id,
          message: `Component references unknown Source Anchor: ${sourceAnchorId}`,
        });
      }
    });
    asArray(component.workflows).forEach((workflowId) => {
      if (!globalSets.workflows.has(workflowId)) {
        pushIssue(issues, {
          severity: "error",
          packId,
          path: `collections.components[${index}].workflows`,
          id,
          message: `Component references unknown workflow: ${workflowId}`,
        });
      }
    });
    asArray(component.slots).forEach((slotId) => {
      if (!globalSets.slots.has(slotId)) {
        pushIssue(issues, {
          severity: "error",
          packId,
          path: `collections.components[${index}].slots`,
          id,
          message: `Component references unknown slot: ${slotId}`,
        });
      }
    });
    if (component.contentType === "monster-graft") {
      const monsterSlot = component.monster?.slot;
      if (monsterSlot && !asArray(component.slots).includes(monsterSlot)) {
        pushIssue(issues, {
          severity: "warning",
          packId,
          path: `collections.components[${index}].monster.slot`,
          id,
          message: `monster.slot (${monsterSlot}) is not included in component slots.`,
        });
      }
    }
  });

  asArray(collections.inspirations).forEach((inspiration, index) => {
    const id = idOf(inspiration) || `inspiration-${index}`;
    asArray(inspiration.sourceAnchors).forEach((sourceAnchorId) => {
      if (!globalSets.sourceAnchors.has(sourceAnchorId)) {
        pushIssue(issues, {
          severity: "error",
          packId,
          path: `collections.inspirations[${index}].sourceAnchors`,
          id,
          message: `Inspiration references unknown Source Anchor: ${sourceAnchorId}`,
        });
      }
    });
  });

  return issues;
}

const globalSets = buildGlobalSets(STATIC_CONTENT_REGISTRY_DATA);
const issues = [
  ...STATIC_CONTENT_PACK_ISSUES.map((issue) => ({ ...issue, source: "static-registry" })),
  ...STATIC_CONTENT_PACKS.flatMap((pack) => validatePackReferences(pack, globalSets)),
  ...validatePackReferences(STATIC_CONTENT_PACK, globalSets),
  ...validateContentPack(STATIC_CONTENT_PACK, { strict: true }).map((issue) => ({ ...issue, packId: STATIC_CONTENT_PACK.id })),
];

const summary = issues.reduce((acc, issue) => {
  const severity = issue.severity || "warning";
  acc.total += 1;
  acc[severity] = (acc[severity] || 0) + 1;
  return acc;
}, { total: 0, error: 0, warning: 0, info: 0 });

const errors = issues.filter((issue) => issue.severity === "error");
if (errors.length) {
  console.error("Content cross-link errors:");
  errors.slice(0, 25).forEach((issue) => {
    console.error(`- [${issue.packId || "static"}] ${issue.path || "content"}: ${issue.message} (${issue.id || "no id"})`);
  });
}

assert.equal(errors.length, 0, `${errors.length} blocking content cross-link errors found.`);
console.log(`Content cross-links OK — ${summary.total} issues inspected (${summary.warning} warnings, ${summary.info} info).`);
