import { useEffect } from "react";
import SiteTopbar from "./navigation/SiteTopbar.jsx";
import { startTooltipRuntime } from "../shared/tooltips/tooltip.runtime.js";
import { t } from "../shared/i18n/index.js";
import "../shared/styles/tooltips.css";

export default function AppShell({
  activeSection = "home",
  activeUiMode = "simple",
  activeCrucibleGenerator = "darken",
  activeLocale = "en",
  onLocaleChange,
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
    <div className="app-shell" data-ui-mode={activeUiMode} data-active-section={activeSection} data-locale={activeLocale}>
      <SiteTopbar
        activeSection={activeSection}
        activeUiMode={activeUiMode}
        activeCrucibleGenerator={activeCrucibleGenerator}
        activeLocale={activeLocale}
        onLocaleChange={onLocaleChange}
        onSectionChange={onSectionChange}
        onUiModeChange={onUiModeChange}
        onOpenCrucibleTool={onOpenCrucibleTool}
      />

      <main className="app-shell__workspace">
        {activeSection === "home" ? <section aria-label={t("app.aria.home", {}, activeLocale)}>{homeContent}</section> : null}

        {activeSection === "crucible" ? (
          <section aria-label={t("app.aria.crucibleWorkspace", {}, activeLocale)}>{crucibleContent}</section>
        ) : null}

        {activeSection === "inspirations" ? (
          <section aria-label={t("app.aria.inspirations", {}, activeLocale)}>{inspirationsContent}</section>
        ) : null}

        {activeSection === "inspiration-studio" ? (
          <section aria-label={t("app.aria.inspirationStudio", {}, activeLocale)}>{inspirationStudioContent}</section>
        ) : null}
      </main>
    </div>
  );
}
