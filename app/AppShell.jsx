import { useCallback, useEffect, useState } from "react";
import SiteTopbar from "./navigation/SiteTopbar.jsx";
import { startTooltipRuntime } from "../shared/tooltips/tooltip.runtime.js";
import { t } from "../shared/i18n/index.js";
import "../shared/styles/tooltips.css";
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  applyAccessibilitySettingsToDocument,
  readAccessibilitySettings,
  saveAccessibilitySettings,
  updateAccessibilitySetting,
} from "../shared/accessibility/accessibility.settings.js";

export default function AppShell({
  activeSection = "home",
  activeUiMode = "simple",
  activeCrucibleGenerator = "darken",
  activeLocale = "en",
  onLocaleChange,
  debugModeActive = false,
  onDebugModeChange,
  onSectionChange,
  onUiModeChange,
  onOpenCrucibleTool,
  homeContent,
  crucibleContent,
  inspirationsContent,
  inspirationStudioContent,
}) {
  const [accessibilitySettings, setAccessibilitySettings] = useState(readAccessibilitySettings);

  useEffect(() => {
    return startTooltipRuntime();
  }, []);

  useEffect(() => {
    applyAccessibilitySettingsToDocument(accessibilitySettings);
  }, [accessibilitySettings]);

  const handleAccessibilitySettingChange = useCallback((key, value) => {
    setAccessibilitySettings((currentSettings) => {
      const nextSettings = updateAccessibilitySetting(currentSettings, key, value);
      saveAccessibilitySettings(nextSettings);
      return nextSettings;
    });
  }, []);

  const handleAccessibilitySettingsReset = useCallback(() => {
    const nextSettings = saveAccessibilitySettings(DEFAULT_ACCESSIBILITY_SETTINGS);
    setAccessibilitySettings(nextSettings);
  }, []);

  return (
    <div
      className="app-shell"
      data-ui-mode={activeUiMode}
      data-active-section={activeSection}
      data-locale={activeLocale}
      data-a11y-theme={accessibilitySettings.theme}
      data-a11y-contrast={accessibilitySettings.contrast}
      data-a11y-motion={accessibilitySettings.motion}
      data-a11y-text={accessibilitySettings.text}
      data-a11y-focus={accessibilitySettings.focus}
      data-a11y-tooltips={accessibilitySettings.tooltips}
    >
      <SiteTopbar
        activeSection={activeSection}
        activeUiMode={activeUiMode}
        activeCrucibleGenerator={activeCrucibleGenerator}
        activeLocale={activeLocale}
        onLocaleChange={onLocaleChange}
        debugModeActive={debugModeActive}
        onDebugModeChange={onDebugModeChange}
        onSectionChange={onSectionChange}
        onUiModeChange={onUiModeChange}
        onOpenCrucibleTool={onOpenCrucibleTool}
        accessibilitySettings={accessibilitySettings}
        onAccessibilitySettingChange={handleAccessibilitySettingChange}
        onAccessibilitySettingsReset={handleAccessibilitySettingsReset}
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
