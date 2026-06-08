import { useEffect } from "react";
import SiteTopbar from "./navigation/SiteTopbar.jsx";
import { startTooltipRuntime } from "../shared/tooltips/tooltip.runtime.js";
import "../shared/styles/tooltips.css";

export default function AppShell({
  activeSection = "home",
  activeUiMode = "simple",
  activeCrucibleGenerator = "darken",
  onSectionChange,
  onUiModeChange,
  onOpenCrucibleTool,
  homeContent,
  crucibleContent,
  inspirationsContent,
  inspirationStudioContent,
}) {
  useEffect(() => {
    return startTooltipRuntime();
  }, []);

  return (
    <div className="app-shell" data-ui-mode={activeUiMode} data-active-section={activeSection}>
      <SiteTopbar
        activeSection={activeSection}
        activeUiMode={activeUiMode}
        activeCrucibleGenerator={activeCrucibleGenerator}
        onSectionChange={onSectionChange}
        onUiModeChange={onUiModeChange}
        onOpenCrucibleTool={onOpenCrucibleTool}
      />

      <main className="app-shell__workspace">
        {activeSection === "home" ? <section aria-label="Home">{homeContent}</section> : null}

        {activeSection === "crucible" ? (
          <section aria-label="Crucible workspace">{crucibleContent}</section>
        ) : null}

        {activeSection === "inspirations" ? (
          <section aria-label="Inspirations">{inspirationsContent}</section>
        ) : null}

        {activeSection === "inspiration-studio" ? (
          <section aria-label="Inspiration Studio">{inspirationStudioContent}</section>
        ) : null}
      </main>
    </div>
  );
}
