import { useMemo } from "react";
import { STATIC_CONTENT_PACKS, STATIC_CONTENT_PACK_ISSUES, STATIC_CONTENT_REGISTRY_DATA } from "../../../shared/content/static-registry.js";
import { StudioToolModalShell } from "../components/StudioToolModalShell.jsx";
import { downloadJsonFile } from "../model/studio-export.js";
import { buildContentHealthReport } from "./content-health.model.js";
import { ContentHealthSummary } from "./ContentHealthSummary.jsx";
import { ContentHealthCoverage } from "./ContentHealthCoverage.jsx";
import { ContentHealthIssues } from "./ContentHealthIssues.jsx";

export function ContentHealthModal({ isOpen, onClose, modules = [] }) {
  const report = useMemo(() => buildContentHealthReport({
    contentPacks: STATIC_CONTENT_PACKS,
    registryData: STATIC_CONTENT_REGISTRY_DATA,
    staticIssues: STATIC_CONTENT_PACK_ISSUES,
    modules,
  }), [modules]);

  function downloadReport() {
    downloadJsonFile("cruor-studio-content-health-report.json", report);
  }

  return (
    <StudioToolModalShell
      id="studio-content-health-modal"
      className="studio-tool-modal--content-health"
      icon="fa-heart-pulse"
      title="Content Health"
      subtitle="Global validation, missing metadata, orphan checks, and editorial health for Studio content."
      isOpen={isOpen}
      onClose={onClose}
      actions={<button className="studio-tool-action" type="button" onClick={downloadReport}>Download Report</button>}
    >
      <div className="studio-tool-workspace">
        <ContentHealthSummary report={report} />
        <ContentHealthCoverage report={report} />
        <ContentHealthIssues issues={report.issues} />
      </div>
    </StudioToolModalShell>
  );
}
