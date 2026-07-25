import { useCallback, useEffect, useRef, useState } from "react";
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

const TRANSIENT_NAVIGATION_FADE_MS = 180;

export default function AppShell({
  activeSection = "home",
  activeUiMode = "simple",
  activeCrucibleGenerator = "darken",
  activeLocale = "en",
  onLocaleChange,
  onSectionChange,
  onUiModeChange,
  onOpenCrucibleTool,
  authSession = null,
  canAccessStudio = false,
  canUseDebug = false,
  onLoginRequest,
  onLogout,
  homeContent,
  crucibleContent,
  inspirationsContent,
  creatorStudioContent,
  loginContent,
}) {
  const [accessibilitySettings, setAccessibilitySettings] = useState(readAccessibilitySettings);
  const [isTransientNavigationOpen, setIsTransientNavigationOpen] = useState(false);
  const [isTransientNavigationPresent, setIsTransientNavigationPresent] = useState(false);
  const transientNavigationCloseTimerRef = useRef(null);
  const isCreatorShell = activeSection === "creator-studio";

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

  const handleTransientNavigationChange = useCallback((isOpen) => {
    const nextIsOpen = Boolean(isOpen);

    if (transientNavigationCloseTimerRef.current) {
      window.clearTimeout(transientNavigationCloseTimerRef.current);
      transientNavigationCloseTimerRef.current = null;
    }

    setIsTransientNavigationOpen(nextIsOpen);

    if (nextIsOpen) {
      setIsTransientNavigationPresent(true);
      return;
    }

    transientNavigationCloseTimerRef.current = window.setTimeout(() => {
      setIsTransientNavigationPresent(false);
      transientNavigationCloseTimerRef.current = null;
    }, TRANSIENT_NAVIGATION_FADE_MS);
  }, []);

  useEffect(() => {
    if (!isCreatorShell) return;

    if (transientNavigationCloseTimerRef.current) {
      window.clearTimeout(transientNavigationCloseTimerRef.current);
      transientNavigationCloseTimerRef.current = null;
    }

    setIsTransientNavigationOpen(false);
    setIsTransientNavigationPresent(false);
  }, [isCreatorShell]);

  useEffect(() => {
    return () => {
      if (transientNavigationCloseTimerRef.current) {
        window.clearTimeout(transientNavigationCloseTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="app-shell"
      data-ui-mode={activeUiMode}
      data-active-section={activeSection}
      data-authenticated={authSession ? "true" : "false"}
      data-shell-mode={isCreatorShell ? "creator" : "site"}
      data-locale={activeLocale}
      data-a11y-theme={accessibilitySettings.theme}
      data-a11y-contrast={accessibilitySettings.contrast}
      data-a11y-motion={accessibilitySettings.motion}
      data-a11y-text={accessibilitySettings.text}
      data-a11y-focus={accessibilitySettings.focus}
      data-a11y-tooltips={accessibilitySettings.tooltips}
      data-transient-navigation-open={!isCreatorShell && isTransientNavigationPresent ? "true" : "false"}
    >
      {!isCreatorShell ? (
        <SiteTopbar
          activeSection={activeSection}
          activeUiMode={activeUiMode}
          activeCrucibleGenerator={activeCrucibleGenerator}
          activeLocale={activeLocale}
          onLocaleChange={onLocaleChange}
          onSectionChange={onSectionChange}
          onUiModeChange={onUiModeChange}
          onOpenCrucibleTool={onOpenCrucibleTool}
          authSession={authSession}
          canAccessStudio={canAccessStudio}
          canUseDebug={canUseDebug}
          onLoginRequest={onLoginRequest}
          onLogout={onLogout}
          accessibilitySettings={accessibilitySettings}
          onAccessibilitySettingChange={handleAccessibilitySettingChange}
          onAccessibilitySettingsReset={handleAccessibilitySettingsReset}
          onTransientNavigationChange={handleTransientNavigationChange}
        />
      ) : null}

      <main className="app-shell__workspace">
        {activeSection === "home" ? <section aria-label={t("app.aria.home", {}, activeLocale)}>{homeContent}</section> : null}

        {activeSection === "crucible" ? (
          <section aria-label={t("app.aria.crucibleWorkspace", {}, activeLocale)}>{crucibleContent}</section>
        ) : null}

        {activeSection === "inspirations" ? (
          <section aria-label={t("app.aria.inspirations", {}, activeLocale)}>{inspirationsContent}</section>
        ) : null}

        {activeSection === "creator-studio" ? (
          <section aria-label={t("app.aria.creatorStudio", {}, activeLocale)}>{creatorStudioContent}</section>
        ) : null}

        {activeSection === "login" ? (
          <section aria-label={t("app.aria.login", {}, activeLocale)}>{loginContent}</section>
        ) : null}
      </main>

      {!isCreatorShell ? (
        <div
          className={`app-shell__navigation-overlay${isTransientNavigationOpen ? " is-visible" : ""}`}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
