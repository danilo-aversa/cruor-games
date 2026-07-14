import { mkdir, writeFile } from "node:fs/promises";
import {
  CRUOR_INSPIRATION_MODULES,
  STATIC_CONTENT_COLLISION_REPORT,
  STATIC_CONTENT_PACKS,
  STATIC_CONTENT_REGISTRY,
  STATIC_CONTENT_REGISTRY_DATA,
  STATIC_LEGACY_MIGRATION_REPORT,
  getStaticContentPackIssues,
  getStaticContentPackSummaries,
  validateStaticContentRepository,
} from "../shared/content/content.index.js";

const OUTPUT_DIR = new URL("../dist/content/", import.meta.url);

function serializeRegistry(registry) {
  return {
    workflows: registry.workflows || [],
    slots: registry.slots || [],
    components: registry.components || [],
    sourceAnchors: registry.sourceAnchors || [],
    inspirations: registry.inspirations || [],
    taxonomies: registry.taxonomies || [],
  };
}

function buildExportManifest(validationReport) {
  return {
    manifestType: "cruor-content-export-manifest",
    generatedAt: new Date().toISOString(),
    files: [
      "cruor-content-registry.json",
      "cruor-content-registry-data.json",
      "cruor-inspiration-modules.json",
      "cruor-content-pack-summaries.json",
      "cruor-content-collision-report.json",
      "cruor-legacy-migration-report.json",
      "cruor-content-validation-report.json",
    ],
    validation: validationReport.summary,
  };
}

async function writeJson(name, value) {
  await writeFile(new URL(name, OUTPUT_DIR), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const validationReport = validateStaticContentRepository({
    packs: STATIC_CONTENT_PACKS,
    registry: STATIC_CONTENT_REGISTRY,
    baseIssues: getStaticContentPackIssues(),
  });

  await writeJson("cruor-content-registry.json", serializeRegistry(STATIC_CONTENT_REGISTRY));
  await writeJson("cruor-content-registry-data.json", STATIC_CONTENT_REGISTRY_DATA);
  await writeJson("cruor-inspiration-modules.json", CRUOR_INSPIRATION_MODULES);
  await writeJson("cruor-content-pack-summaries.json", getStaticContentPackSummaries());
  await writeJson("cruor-content-collision-report.json", STATIC_CONTENT_COLLISION_REPORT);
  await writeJson("cruor-legacy-migration-report.json", STATIC_LEGACY_MIGRATION_REPORT);
  await writeJson("cruor-content-validation-report.json", validationReport);
  await writeJson("cruor-content-export-manifest.json", buildExportManifest(validationReport));

  const { total, error, warning } = validationReport.summary;
  console.log(`Content export complete: ${total} validation issues (${error} errors, ${warning} warnings).`);
  console.log(
    `Content provenance: ${STATIC_CONTENT_COLLISION_REPORT.summary.total} collisions, ` +
      `${STATIC_LEGACY_MIGRATION_REPORT.summary.activeEntries} active legacy fallback entries.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
