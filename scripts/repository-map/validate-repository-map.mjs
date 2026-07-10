#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const mapPath = "docs/repository-map/repository-map.json";
const schemaPath = "docs/repository-map/repository-map.schema.json";
const selfHashExemptPath = mapPath;

function runGit(args, { nullSeparated = false } = {}) {
  const output = execFileSync("git", args, {
    cwd: rootDir,
    encoding: nullSeparated ? "buffer" : "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (nullSeparated) {
    return output
      .toString("utf8")
      .split("\0")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return String(output).trim();
}

function absolutePath(relativePath) {
  return path.join(rootDir, relativePath);
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function hashFile(relativePath) {
  return createHash("sha256").update(readFileSync(absolutePath(relativePath))).digest("hex");
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(absolutePath(relativePath), "utf8"));
}

function addIssue(list, severity, message, data = {}) {
  list.push({ severity, message, ...data });
}

function hasRequiredField(record, field) {
  return Object.prototype.hasOwnProperty.call(record, field) && record[field] !== undefined && record[field] !== null;
}

function validateSchemaShape(map, schema, issues) {
  if (!schema || schema.type !== "object") {
    addIssue(issues.errors, "error", "Schema file is missing or does not describe a root object.", { file: schemaPath });
    return;
  }
  if (!Array.isArray(schema.required) || !schema.required.includes("files")) {
    addIssue(issues.errors, "error", "Schema must require the files array.", { file: schemaPath });
  }
  if (!map.metadata || typeof map.metadata !== "object") {
    addIssue(issues.errors, "error", "repository-map.json is missing metadata.");
  }
  if (!Array.isArray(map.files)) {
    addIssue(issues.errors, "error", "repository-map.json files field must be an array.");
  }
}

function collectMarkdownFiles(startRelativePath) {
  const start = absolutePath(startRelativePath);
  if (!existsSync(start)) return [];
  const files = [];
  function walk(current) {
    for (const entry of readdirSync(current)) {
      const fullPath = path.join(current, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith(".md")) {
        files.push(toPosix(path.relative(rootDir, fullPath)));
      }
    }
  }
  walk(start);
  return files;
}

function extractReferencedRepoFiles(markdown, markdownFile) {
  const candidates = new Set();
  let match;
  const inlinePathPattern = /`((?:app|components|data|dev|docs|features|public|reports|scripts|shared|tests|test-results|\.github)\/[^`]+?\.[A-Za-z0-9]+)`/g;
  while ((match = inlinePathPattern.exec(markdown))) {
    const candidate = match[1].trim();
    if (!candidate.includes("*")) candidates.add(candidate);
  }
  const linkPattern = /\]\(([^)#]+?\.[A-Za-z0-9]+)(?:#[^)]+)?\)/g;
  while ((match = linkPattern.exec(markdown))) {
    const raw = match[1].trim();
    if (raw.includes("://") || raw.includes("*")) continue;
    const resolved = toPosix(path.normalize(path.join(path.dirname(markdownFile), raw)));
    candidates.add(resolved.replace(/^\/+/, ""));
  }
  return [...candidates];
}

function validateAreaDocumentReferences(issues) {
  const markdownFiles = collectMarkdownFiles("docs/repository-map");
  markdownFiles.forEach((file) => {
    const content = readFileSync(absolutePath(file), "utf8");
    extractReferencedRepoFiles(content, file).forEach((reference) => {
      if (!existsSync(absolutePath(reference))) {
        addIssue(issues.errors, "error", "Area document references a missing file.", {
          file,
          reference,
        });
      }
    });
  });
}

function validate() {
  const issues = { errors: [], warnings: [] };

  if (!existsSync(absolutePath(mapPath))) {
    addIssue(issues.errors, "error", "repository-map.json does not exist.", { file: mapPath });
    return issues;
  }
  if (!existsSync(absolutePath(schemaPath))) {
    addIssue(issues.errors, "error", "repository-map.schema.json does not exist.", { file: schemaPath });
    return issues;
  }

  const map = readJson(mapPath);
  const schema = readJson(schemaPath);
  validateSchemaShape(map, schema, issues);
  if (!Array.isArray(map.files)) return issues;

  const trackedFiles = runGit(["ls-files", "-z"], { nullSeparated: true });
  const trackedSet = new Set(trackedFiles);
  const recordsByPath = new Map();
  const requiredFields = [
    "path",
    "name",
    "extension",
    "language",
    "category",
    "area",
    "status",
    "role",
    "responsibilities",
    "architecturalLayer",
    "entryPoint",
    "publicApi",
    "imports",
    "importedBy",
    "dataConsumed",
    "dataProduced",
    "sideEffects",
    "browserApis",
    "stateOwnership",
    "runtimeFlows",
    "relatedFiles",
    "tests",
    "changeRisk",
    "generated",
    "referenceOnly",
    "legacy",
    "confidence",
    "generatedFields",
  ];

  map.files.forEach((record, index) => {
    if (!record?.path) {
      addIssue(issues.errors, "error", "File record is missing path.", { index });
      return;
    }
    if (recordsByPath.has(record.path)) {
      addIssue(issues.errors, "error", "Duplicate file record.", { path: record.path });
    }
    recordsByPath.set(record.path, record);

    requiredFields.forEach((field) => {
      if (!hasRequiredField(record, field)) {
        addIssue(issues.errors, "error", `Record is missing required field: ${field}.`, {
          path: record.path,
        });
      }
    });

    if (!existsSync(absolutePath(record.path))) {
      addIssue(issues.errors, "error", "Repository map references a deleted file.", {
        path: record.path,
      });
      return;
    }

    if (record.generated && !record.generatedInfo?.generator) {
      addIssue(issues.errors, "error", "Generated record has no documented generator.", {
        path: record.path,
      });
    }

    if (record.path !== selfHashExemptPath && record.generatedFields?.hash) {
      const actualHash = hashFile(record.path);
      if (actualHash !== record.generatedFields.hash) {
        addIssue(issues.errors, "error", "Generated structural data is stale relative to file hash.", {
          path: record.path,
        });
      }
    }

    if (Array.isArray(record.imports)) {
      record.imports.forEach((importRecord) => {
        if (importRecord.external) return;
        if (importRecord.kind === "dynamic" && !importRecord.resolvedPath) {
          addIssue(issues.warnings, "warning", "Unresolved dynamic import.", {
            path: record.path,
            source: importRecord.source,
          });
          return;
        }
        if (!importRecord.resolvedPath) {
          const inactiveRecord =
            record.referenceOnly ||
            record.legacy ||
            record.status === "reference-only" ||
            record.status === "legacy";
          addIssue(inactiveRecord ? issues.warnings : issues.errors, inactiveRecord ? "warning" : "error", "Local import target cannot be resolved.", {
            path: record.path,
            source: importRecord.source,
          });
          return;
        }
        if (!existsSync(absolutePath(importRecord.resolvedPath))) {
          addIssue(issues.errors, "error", "Local import resolves to a missing file.", {
            path: record.path,
            source: importRecord.source,
            resolvedPath: importRecord.resolvedPath,
          });
        }
      });
    }

    if (record.confidence === "low") {
      addIssue(issues.warnings, "warning", "Low-confidence repository-map record.", {
        path: record.path,
      });
    }

    if (!Array.isArray(record.tests) || record.tests.length === 0) {
      if (record.category === "source" && !record.path.includes(".test.")) {
        addIssue(issues.warnings, "warning", "Source file has no direct test/QA link in the map.", {
          path: record.path,
        });
      }
    }
  });

  trackedFiles.forEach((file) => {
    if (!recordsByPath.has(file)) {
      addIssue(issues.errors, "error", "Git-tracked file is missing from repository map.", {
        path: file,
      });
    }
  });

  recordsByPath.forEach((record) => {
    if (record.generatedFields?.tracked && !trackedSet.has(record.path)) {
      addIssue(issues.errors, "error", "Record is marked tracked but Git does not track it.", {
        path: record.path,
      });
    }
  });

  const currentCommit = runGit(["rev-parse", "HEAD"]);
  if (map.metadata?.inspectedCommit !== currentCommit) {
    addIssue(issues.errors, "error", "Repository map was produced from a different commit.", {
      expected: currentCommit,
      actual: map.metadata?.inspectedCommit,
    });
  }

  if (Array.isArray(map.dependencyGraph?.cycles) && map.dependencyGraph.cycles.length) {
    addIssue(issues.warnings, "warning", "Circular dependency candidates detected.", {
      count: map.dependencyGraph.cycles.length,
    });
  }

  validateAreaDocumentReferences(issues);
  return issues;
}

const issues = validate();

if (issues.errors.length) {
  console.error(`Repository map validation failed: ${issues.errors.length} error(s), ${issues.warnings.length} warning(s).`);
  issues.errors.slice(0, 50).forEach((issue) => {
    console.error(`[error] ${issue.message}${issue.path ? ` (${issue.path})` : ""}${issue.reference ? ` -> ${issue.reference}` : ""}`);
  });
  if (issues.errors.length > 50) console.error(`... ${issues.errors.length - 50} more error(s).`);
  process.exitCode = 1;
} else {
  console.log(`Repository map validation passed with ${issues.warnings.length} warning(s).`);
  issues.warnings.slice(0, 25).forEach((issue) => {
    console.log(`[warning] ${issue.message}${issue.path ? ` (${issue.path})` : ""}${issue.count ? ` (${issue.count})` : ""}`);
  });
  if (issues.warnings.length > 25) console.log(`... ${issues.warnings.length - 25} more warning(s).`);
}
