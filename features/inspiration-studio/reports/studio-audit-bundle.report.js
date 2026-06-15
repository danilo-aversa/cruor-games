import { downloadJsonFile } from "../model/studio-export.js";
import { slugify } from "../model/studio-component-normalizers.js";
import { buildStudioAuditBundle } from "./studio-audit-bundle.model.js";

export function getStudioAuditBundleFilename(draft = {}, date = new Date()) {
  const slug = slugify(draft?.title || draft?.id || "cruor-studio");
  return `${slug}-studio-audit-bundle-${date.toISOString().slice(0, 10)}.json`;
}

export function downloadStudioAuditBundle(options = {}) {
  const bundle = buildStudioAuditBundle(options);
  downloadJsonFile(getStudioAuditBundleFilename(options.draft), bundle);
  return bundle;
}
