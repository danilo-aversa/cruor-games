import {
  STATIC_CONTENT_PACKS,
  STATIC_CONTENT_REGISTRY,
  getStaticContentPackIssues,
  validateStaticContentRepository,
} from "../shared/content/content.index.js";

const report = validateStaticContentRepository({
  packs: STATIC_CONTENT_PACKS,
  registry: STATIC_CONTENT_REGISTRY,
  baseIssues: getStaticContentPackIssues(),
});

const { total, error, warning } = report.summary;
console.log(`Static content validation: ${total} issues (${error} errors, ${warning} warnings).`);

if (total) {
  const grouped = report.issues.reduce((groups, issue) => {
    const key = `${issue.severity}:${issue.message}`;
    groups[key] = groups[key] || { severity: issue.severity, message: issue.message, count: 0, ids: [] };
    groups[key].count += 1;
    if (issue.id && groups[key].ids.length < 12) groups[key].ids.push(issue.id);
    return groups;
  }, {});

  Object.values(grouped)
    .sort((a, b) => b.count - a.count || a.message.localeCompare(b.message))
    .forEach((group) => {
      const ids = group.ids.length ? ` — ${group.ids.join(", ")}` : "";
      console.log(`[${group.severity}] ${group.count}× ${group.message}${ids}`);
    });
}

if (error) {
  process.exitCode = 1;
}
