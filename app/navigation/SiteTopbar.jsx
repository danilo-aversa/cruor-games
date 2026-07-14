import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getAppModeOptions,
  getSiteNavItems,
  getCrucibleMenuItemId,
} from "./site-navigation.data.js";
import SiteMegaMenu from "./SiteMegaMenu.jsx";
import { SUPPORTED_LOCALES, getLocaleDictionary, t } from "../../shared/i18n/index.js";
import { ACCESSIBILITY_SETTING_GROUPS } from "../../shared/accessibility/accessibility.settings.js";

const TRANSIENT_MENU_FADE_MS = 180;

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function useAnimatedMenuPresence(value, duration = TRANSIENT_MENU_FADE_MS) {
  const [renderedValue, setRenderedValue] = useState(value);
  const [transitionState, setTransitionState] = useState(value ? "open" : "closed");
  const closeTimerRef = useRef(null);
  const openFrameRef = useRef(null);

  useEffect(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (openFrameRef.current) {
      window.cancelAnimationFrame(openFrameRef.current);
      openFrameRef.current = null;
    }

    if (value) {
      setRenderedValue(value);
      setTransitionState("opening");
      openFrameRef.current = window.requestAnimationFrame(() => {
        openFrameRef.current = window.requestAnimationFrame(() => {
          setTransitionState("open");
          openFrameRef.current = null;
        });
      });
    } else if (renderedValue) {
      setTransitionState("closing");
      closeTimerRef.current = window.setTimeout(() => {
        setRenderedValue(null);
        setTransitionState("closed");
        closeTimerRef.current = null;
      }, duration);
    } else {
      setTransitionState("closed");
    }

    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      if (openFrameRef.current) {
        window.cancelAnimationFrame(openFrameRef.current);
        openFrameRef.current = null;
      }
    };
  }, [duration, renderedValue, value]);

  return { renderedValue, transitionState };
}

export default function SiteTopbar({
  activeSection = "home",
  activeUiMode = "simple",
  activeCrucibleGenerator = "darken",
  onSectionChange,
  onUiModeChange,
  onOpenCrucibleTool,
  activeLocale = "en",
  onLocaleChange,
  accessibilitySettings = {},
  onAccessibilitySettingChange,
  onAccessibilitySettingsReset,
  onTransientNavigationChange,
}) {
  const topbarRef = useRef(null);
  const megaMenuRef = useRef(null);
  const megaTriggerRefs = useRef({});
  const closeMenuTimerRef = useRef(null);
  const utilityCloseTimerRef = useRef(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [megaMenuPosition, setMegaMenuPosition] = useState({ left: 0, top: 0 });
  const [activePreviewId, setActivePreviewId] = useState(() =>
    getCrucibleMenuItemId(activeCrucibleGenerator),
  );
  const [isUtilityOpen, setIsUtilityOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const megaMenuPresence = useAnimatedMenuPresence(openMenuId);
  const utilityMenuPresence = useAnimatedMenuPresence(isUtilityOpen ? "utility" : null);

  const appModeOptions = useMemo(() => getAppModeOptions(activeLocale), [activeLocale]);
  const siteNavItems = useMemo(() => getSiteNavItems(activeLocale), [activeLocale]);
  const localeOptions = useMemo(
    () =>
      SUPPORTED_LOCALES.map((locale) => ({
        id: locale,
        label: getLocaleDictionary(locale)?.meta?.languageName || locale.toUpperCase(),
      })),
    [],
  );

  const crucibleMenu = useMemo(
    () => siteNavItems.find((item) => item.id === "crucible"),
    [siteNavItems],
  );

  const activeCrucibleMenuItemId = getCrucibleMenuItemId(activeCrucibleGenerator);

  useEffect(() => {
    setActivePreviewId(activeCrucibleMenuItemId);
  }, [activeCrucibleMenuItemId]);

  useEffect(() => {
    onTransientNavigationChange?.(Boolean(openMenuId || isUtilityOpen));
  }, [isUtilityOpen, onTransientNavigationChange, openMenuId]);

  useEffect(() => {
    return () => onTransientNavigationChange?.(false);
  }, [onTransientNavigationChange]);

  useEffect(() => {
    function handleDocumentPointerDown(event) {
      const isInsideTopbar = topbarRef.current?.contains(event.target);
      const isInsideMegaMenu = megaMenuRef.current?.contains(event.target);

      if (!isInsideTopbar && !isInsideMegaMenu) {
        closeTransientNavigation();
      }
    }

    function handleDocumentKeyDown(event) {
      if (event.key === "Escape") {
        closeTransientNavigation();
      }
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      clearCloseMenuTimer();
      clearUtilityCloseTimer();
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!openMenuId) return undefined;

    updateMegaMenuPosition(openMenuId);

    function handleViewportChange() {
      updateMegaMenuPosition(openMenuId);
    }

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [openMenuId]);

  function updateMegaMenuPosition(itemId = openMenuId) {
    if (!itemId || typeof window === "undefined") return;

    const trigger = megaTriggerRefs.current[itemId];
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuWidth = Math.min(760, Math.max(0, window.innerWidth - 32));
    const minLeft = 16 + menuWidth / 2;
    const maxLeft = window.innerWidth - 16 - menuWidth / 2;
    const rawLeft = rect.left + rect.width / 2;
    const nextLeft = Math.min(Math.max(rawLeft, minLeft), maxLeft);

    setMegaMenuPosition({
      left: Math.round(nextLeft),
      top: Math.round(rect.bottom + 11),
    });
  }

  function clearCloseMenuTimer() {
    if (!closeMenuTimerRef.current) return;
    window.clearTimeout(closeMenuTimerRef.current);
    closeMenuTimerRef.current = null;
  }

  function clearUtilityCloseTimer() {
    if (!utilityCloseTimerRef.current) return;
    window.clearTimeout(utilityCloseTimerRef.current);
    utilityCloseTimerRef.current = null;
  }

  function openUtilityMenu() {
    clearUtilityCloseTimer();
    clearCloseMenuTimer();
    setIsUtilityOpen(true);
    setOpenMenuId(null);
    setIsMobileOpen(false);
  }

  function scheduleUtilityClose() {
    clearUtilityCloseTimer();
    utilityCloseTimerRef.current = window.setTimeout(() => {
      setIsUtilityOpen(false);
      utilityCloseTimerRef.current = null;
    }, 140);
  }

  function closeTransientNavigation() {
    clearCloseMenuTimer();
    clearUtilityCloseTimer();
    setOpenMenuId(null);
    setIsUtilityOpen(false);
    setIsMobileOpen(false);
  }

  function scheduleMegaMenuClose() {
    clearCloseMenuTimer();
    closeMenuTimerRef.current = window.setTimeout(() => {
      setOpenMenuId(null);
      closeMenuTimerRef.current = null;
    }, 140);
  }

  function openMegaMenu(itemId) {
    clearCloseMenuTimer();
    clearUtilityCloseTimer();
    updateMegaMenuPosition(itemId);
    setOpenMenuId(itemId);
    setIsUtilityOpen(false);
    setIsMobileOpen(false);
  }

  function handleAction(action) {
    if (!action) return;

    if (action.type === "section") {
      onSectionChange?.(action.sectionId);
      closeTransientNavigation();
      return;
    }

    if (action.type === "crucible-tool") {
      onOpenCrucibleTool?.(action.toolId, action.viewId);
      closeTransientNavigation();
    }
  }

  function handleNavItemClick(item) {
    if (item.type === "mega") {
      if (openMenuId === item.id) {
        setOpenMenuId(null);
      } else {
        openMegaMenu(item.id);
      }
      return;
    }

    handleAction({ type: "section", sectionId: item.sectionId });
  }

  function handleMegaTriggerKeyDown(event, item) {
    if (item.type !== "mega") return;

    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMegaMenu(item.id);
      window.requestAnimationFrame(() => {
        const firstMenuItem = document
          .getElementById(`siteMegaMenu-${item.id}`)
          ?.querySelector("[data-site-mega-item]");
        firstMenuItem?.focus();
      });
    }
  }

  function handleCrucibleTriggerFocus() {
    clearCloseMenuTimer();
    setActivePreviewId(activeCrucibleMenuItemId);
  }

  function renderAccessibilityControls(layout = "desktop") {
    return (
      <div className="site-topbar__accessibility-list" role="group" aria-label={t("settings.sections.accessibility", {}, activeLocale)}>
        {ACCESSIBILITY_SETTING_GROUPS.map((group) => {
          const groupLabelId = `siteTopbarA11y-${layout}-${group.id}`;
          const activeValue = accessibilitySettings[group.id];

          return (
            <div className="site-topbar__accessibility-group" key={group.id}>
              <span className="site-topbar__accessibility-label" id={groupLabelId}>
                {t(group.labelKey, {}, activeLocale)}
              </span>
              <div
                className="site-topbar__accessibility-options"
                role="group"
                aria-labelledby={groupLabelId}
                title={t(group.descriptionKey, {}, activeLocale)}
              >
                {group.options.map((option) => {
                  const isActive = activeValue === option.id;
                  const optionLabel = t(option.labelKey, {}, activeLocale);
                  const optionDescription = t(option.descriptionKey, {}, activeLocale);

                  return (
                    <button
                      className={cx("site-topbar__accessibility-option", isActive && "is-active")}
                      key={option.id}
                      type="button"
                      aria-pressed={isActive}
                      aria-label={`${t(group.labelKey, {}, activeLocale)}: ${optionLabel}. ${optionDescription}`}
                      title={optionDescription}
                      onClick={() => onAccessibilitySettingChange?.(group.id, option.id)}
                    >
                      <span>{optionLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button
          className="site-topbar__accessibility-reset"
          type="button"
          aria-label={t("settings.accessibility.reset", {}, activeLocale)}
          title={t("settings.accessibility.reset", {}, activeLocale)}
          onClick={() => onAccessibilitySettingsReset?.()}
        >
          <i className="fa-solid fa-rotate-left" aria-hidden="true" />
          <span>{t("settings.accessibility.reset", {}, activeLocale)}</span>
        </button>
      </div>
    );
  }

  function renderDesktopNavItem(item) {
    const isActive = item.type === "mega" ? activeSection === "crucible" : activeSection === item.id;
    const isOpen = openMenuId === item.id;

    if (item.type === "mega") {
      return (
        <div
          key={item.id}
          className="site-topbar__nav-popover"
          onMouseEnter={() => openMegaMenu(item.id)}
          onMouseLeave={scheduleMegaMenuClose}
        >
          <button
            ref={(node) => {
              megaTriggerRefs.current[item.id] = node;
            }}
            className={cx(
              "app-shell__nav-item site-topbar__nav-button",
              isActive && "is-active",
              isOpen && "is-open",
            )}
            type="button"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-controls={`siteMegaMenu-${item.id}`}
            aria-current={isActive ? "page" : undefined}
            onFocus={handleCrucibleTriggerFocus}
            onClick={() => handleNavItemClick(item)}
            onKeyDown={(event) => handleMegaTriggerKeyDown(event, item)}
          >
            <i className={item.icon} aria-hidden="true" />
            <span>{item.label}</span>
            <i className="fa-solid fa-chevron-down site-topbar__chevron" aria-hidden="true" />
          </button>
        </div>
      );
    }

    return (
      <button
        key={item.id}
        className={cx("app-shell__nav-item site-topbar__nav-button", isActive && "is-active")}
        type="button"
        aria-current={isActive ? "page" : undefined}
        onClick={() => handleNavItemClick(item)}
      >
        <i className={item.icon} aria-hidden="true" />
        <span>{item.label}</span>
      </button>
    );
  }

  const openMegaMenuItem =
    megaMenuPresence.renderedValue &&
    siteNavItems.find(
      (item) => item.id === megaMenuPresence.renderedValue && item.type === "mega",
    );

  return (
    <header className="app-shell__bar site-topbar" ref={topbarRef}>
      <div className="app-shell__bar-inner site-topbar__inner">
        <button
          className="app-shell__brand site-topbar__brand"
          type="button"
          aria-label={t("app.aria.goHome", {}, activeLocale)}
          onClick={() => handleAction({ type: "section", sectionId: "home" })}
        >
          <span className="app-shell__logo-mark" aria-hidden="true">
            <img className="app-shell__logo-image" src="/assets/icons/cruor-logo-small.png" alt="" />
          </span>
        </button>

        <div className="app-shell__bar-actions site-topbar__bar-actions">
          <nav className="app-shell__nav site-topbar__nav" aria-label={t("app.aria.primarySections", {}, activeLocale)}>
            {siteNavItems.map(renderDesktopNavItem)}
          </nav>

          <div className="site-topbar__right-rail">
            <button
              className="site-topbar__utility-button"
              type="button"
              aria-label={t("settings.aria.openSettings", {}, activeLocale)}
              aria-haspopup="menu"
              aria-expanded={isUtilityOpen}
              aria-controls="siteUtilityMenu"
              onMouseEnter={openUtilityMenu}
              onMouseLeave={scheduleUtilityClose}
              onFocus={openUtilityMenu}
              onClick={openUtilityMenu}
            >
              <i className="fa-solid fa-gear" aria-hidden="true" />
              <span>{t("settings.label", {}, activeLocale)}</span>
            </button>

            {utilityMenuPresence.renderedValue ? (
              <div
                className="site-topbar__utility-menu"
                id="siteUtilityMenu"
                role="menu"
                aria-label={t("settings.aria.panel", {}, activeLocale)}
                aria-hidden={utilityMenuPresence.transitionState !== "open"}
                data-transition-state={utilityMenuPresence.transitionState}
                onMouseEnter={clearUtilityCloseTimer}
                onMouseLeave={scheduleUtilityClose}
              >
                <div className="site-topbar__settings-section">
                  <span className="site-topbar__utility-label">{t("settings.sections.mode", {}, activeLocale)}</span>
                  <div className="site-topbar__mode-list" role="group" aria-label={t("app.aria.interfaceMode", {}, activeLocale)}>
                    {appModeOptions.map((mode) => (
                      <button
                        key={mode.id}
                        className={cx(
                          "site-topbar__mode-option",
                          activeUiMode === mode.id && "is-active",
                        )}
                        type="button"
                        role="menuitemradio"
                        aria-checked={activeUiMode === mode.id}
                        title={mode.description}
                        onClick={() => {
                          onUiModeChange?.(mode.id);
                        }}
                      >
                        <span>{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>


                <div className="site-topbar__settings-section">
                  <span className="site-topbar__utility-label">{t("settings.sections.language", {}, activeLocale)}</span>
                  <div className="site-topbar__language-list" role="group" aria-label={t("settings.sections.language", {}, activeLocale)}>
                    {localeOptions.map((locale) => (
                      <button
                        key={locale.id}
                        className={cx(
                          "site-topbar__language-option",
                          "is-disabled",
                          activeLocale === locale.id && "is-active",
                        )}
                        type="button"
                        role="menuitemradio"
                        aria-checked={activeLocale === locale.id}
                        aria-disabled="true"
                        disabled
                        title={t("settings.languageLocked", {}, activeLocale)}
                      >
                        <span>{locale.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="site-topbar__settings-section site-topbar__settings-section--accessibility">
                  <span className="site-topbar__utility-label">{t("settings.sections.accessibility", {}, activeLocale)}</span>
                  {renderAccessibilityControls("desktop")}
                </div>
              </div>
            ) : null}

            <button
              className="site-topbar__login-placeholder"
              type="button"
              disabled
              aria-label={t("app.labels.loginPlaceholder", {}, activeLocale)}
              title={t("app.labels.loginPlaceholder", {}, activeLocale)}
            >
              <i className="fa-solid fa-user-lock" aria-hidden="true" />
              <span>{t("app.labels.login", {}, activeLocale)}</span>
            </button>

            <button
              className="site-topbar__mobile-toggle"
              type="button"
              aria-label={isMobileOpen ? t("app.aria.closeNavigationMenu", {}, activeLocale) : t("app.aria.openNavigationMenu", {}, activeLocale)}
              aria-expanded={isMobileOpen}
              aria-controls="siteMobileMenu"
              onClick={() => {
                setIsMobileOpen((value) => !value);
                setOpenMenuId(null);
                setIsUtilityOpen(false);
              }}
            >
              <i className={isMobileOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {isMobileOpen ? (
        <nav className="site-topbar__mobile-menu" id="siteMobileMenu" aria-label={t("app.aria.mobileNavigation", {}, activeLocale)}>
          <button
            className={cx("site-topbar__mobile-link", activeSection === "home" && "is-active")}
            type="button"
            onClick={() => handleAction({ type: "section", sectionId: "home" })}
          >
            <i className="fa-solid fa-house-chimney" aria-hidden="true" />
            <span>{t("navigation.home", {}, activeLocale)}</span>
          </button>

          <div className="site-topbar__mobile-group">
            <span className="site-topbar__mobile-group-label">{t("navigation.crucible", {}, activeLocale)}</span>
            {crucibleMenu?.items?.map((item) => (
              <button
                key={item.id}
                className={cx(
                  "site-topbar__mobile-link site-topbar__mobile-link--nested",
                  activeSection === "crucible" && activeCrucibleMenuItemId === item.id && "is-active",
                )}
                type="button"
                onClick={() => handleAction(item.action)}
              >
                <i className={item.icon} aria-hidden="true" />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.mobileDescription || item.description}</small>
                </span>
              </button>
            ))}
          </div>

          <button
            className={cx(
              "site-topbar__mobile-link",
              activeSection === "inspirations" && "is-active",
            )}
            type="button"
            onClick={() => handleAction({ type: "section", sectionId: "inspirations" })}
          >
            <i className="fa-solid fa-book-skull" aria-hidden="true" />
            <span>{t("navigation.inspirations", {}, activeLocale)}</span>
          </button>

          <div className="site-topbar__mobile-mode">
            <span className="site-topbar__mobile-group-label">{t("settings.sections.mode", {}, activeLocale)}</span>
            <div className="site-topbar__mode-list">
              {appModeOptions.map((mode) => (
                <button
                  key={mode.id}
                  className={cx("site-topbar__mode-option", activeUiMode === mode.id && "is-active")}
                  type="button"
                  aria-pressed={activeUiMode === mode.id}
                  onClick={() => {
                    onUiModeChange?.(mode.id);
                  }}
                >
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="site-topbar__mobile-mode">
            <span className="site-topbar__mobile-group-label">{t("settings.sections.language", {}, activeLocale)}</span>
            <div className="site-topbar__language-list">
              {localeOptions.map((locale) => (
                <button
                  key={locale.id}
                  className={cx(
                    "site-topbar__language-option",
                    "is-disabled",
                    activeLocale === locale.id && "is-active",
                  )}
                  type="button"
                  aria-pressed={activeLocale === locale.id}
                  aria-disabled="true"
                  disabled
                  title={t("settings.languageLocked", {}, activeLocale)}
                >
                  <span>{locale.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="site-topbar__mobile-mode site-topbar__mobile-mode--accessibility">
            <span className="site-topbar__mobile-group-label">{t("settings.sections.accessibility", {}, activeLocale)}</span>
            {renderAccessibilityControls("mobile")}
          </div>
        </nav>
      ) : null}

      {openMegaMenuItem && typeof document !== "undefined"
        ? createPortal(
            <SiteMegaMenu
              menu={openMegaMenuItem}
              activeItemId={activePreviewId}
              selectedItemId={activeSection === "crucible" ? activeCrucibleMenuItemId : null}
              menuRef={megaMenuRef}
              locale={activeLocale}
              transitionState={megaMenuPresence.transitionState}
              style={{
                "--site-mega-menu-left": `${megaMenuPosition.left}px`,
                "--site-mega-menu-top": `${megaMenuPosition.top}px`,
              }}
              onMouseEnter={clearCloseMenuTimer}
              onMouseLeave={scheduleMegaMenuClose}
              onPreviewChange={setActivePreviewId}
              onAction={handleAction}
              onRequestClose={closeTransientNavigation}
            />,
            document.body,
          )
        : null}
    </header>
  );
}
