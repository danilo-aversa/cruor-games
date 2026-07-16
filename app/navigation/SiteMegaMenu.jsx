import "./site-mega-menu.css";
import { t } from "../../shared/i18n/index.js";
import SiteLink from "./SiteLink.jsx";

const RENDER_ENGINE_FEATURES_PANEL = false;

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function focusMenuItem(menuElement, nextIndex) {
  const items = Array.from(
    menuElement.querySelectorAll(
      '[data-site-mega-item]:not([aria-disabled="true"])',
    ),
  );
  if (!items.length) return;

  const clampedIndex = (nextIndex + items.length) % items.length;
  items[clampedIndex]?.focus();
}

export default function SiteMegaMenu({
  menu,
  activeItemId,
  selectedItemId,
  menuRef,
  style,
  locale = "en",
  transitionState = "open",
  onMouseEnter,
  onMouseLeave,
  onPreviewChange,
  onAction,
  onRequestClose,
}) {
  if (!menu?.items?.length) return null;

  const activeItem =
    menu.items.find((item) => item.id === activeItemId) ||
    menu.items.find((item) => !item.disabled) ||
    menu.items[0];

  function handleMenuKeyDown(event) {
    const itemButtons = Array.from(
      event.currentTarget.querySelectorAll(
        '[data-site-mega-item]:not([aria-disabled="true"])',
      ),
    );
    const currentIndex = itemButtons.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusMenuItem(event.currentTarget, currentIndex + 1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusMenuItem(event.currentTarget, currentIndex - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusMenuItem(event.currentTarget, 0);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusMenuItem(event.currentTarget, itemButtons.length - 1);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onRequestClose?.();
    }
  }

  function handleAction(item) {
    if (item.disabled) return;
    onAction?.(item.action);
  }

  return (
    <div
      ref={menuRef}
      className="site-mega-menu"
      id={`siteMegaMenu-${menu.id}`}
      role="menu"
      aria-label={t(
        "navigation.crucibleMenu.aria.tools",
        { label: menu.label },
        locale,
      )}
      aria-hidden={transitionState !== "open"}
      data-transition-state={transitionState}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={handleMenuKeyDown}
    >
      <div className="site-mega-menu__grid">
        <div
          className="site-mega-menu__list"
          aria-label={t(
            "navigation.crucibleMenu.aria.options",
            { label: menu.label },
            locale,
          )}
        >
          {menu.items.map((item) => {
            const isSelected = selectedItemId === item.id;

            return (
              <SiteLink
                key={item.id}
                className={cx(
                  "site-mega-menu__item",
                  isSelected && "is-selected",
                  item.disabled && "is-disabled",
                )}
                href={item.href || item.action?.href}
                role="menuitem"
                disabled={item.disabled}
                aria-current={isSelected ? "page" : undefined}
                data-site-mega-item
                data-site-mega-item-id={item.id}
                onMouseEnter={() => onPreviewChange?.(item.id)}
                onFocus={() => onPreviewChange?.(item.id)}
                onNavigate={() => handleAction(item)}
              >
                <span className="site-mega-menu__item-icon" aria-hidden="true">
                  <i className={item.icon || "fa-solid fa-diamond"} />
                </span>

                <span className="site-mega-menu__item-copy">
                  <strong>{item.label}</strong>
                  <span>
                    {item.catchPhrase || item.previewText || item.description}
                  </span>
                </span>
              </SiteLink>
            );
          })}
        </div>

        {activeItem ? (
          <div className="site-mega-menu__preview-column" aria-live="polite">
            <aside
              className="site-mega-menu__preview"
              aria-label={t(
                "navigation.crucibleMenu.aria.preview",
                { label: activeItem.label },
                locale,
              )}
            >
              <div
                className={cx(
                  "site-mega-menu__preview-art",
                  activeItem.previewImage &&
                    "site-mega-menu__preview-art--has-image",
                  `site-mega-menu__preview-art--${activeItem.previewVariant || activeItem.id}`,
                )}
                aria-hidden="true"
              >
                {activeItem.previewImage ? (
                  <img
                    className="site-mega-menu__preview-image"
                    src={activeItem.previewImage}
                    alt={activeItem.previewImageAlt || ""}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <>
                    <span className="site-mega-menu__preview-sigil">
                      <i className={activeItem.icon || "fa-solid fa-diamond"} />
                    </span>
                    <span className="site-mega-menu__preview-grid" />
                    <span className="site-mega-menu__preview-orbit site-mega-menu__preview-orbit--one" />
                    <span className="site-mega-menu__preview-orbit site-mega-menu__preview-orbit--two" />
                  </>
                )}
              </div>
            </aside>

            {RENDER_ENGINE_FEATURES_PANEL ? (
              <div className="site-mega-menu__preview-features-panel">
                <ul
                  className="site-mega-menu__preview-features"
                  aria-label={t(
                    "navigation.crucibleMenu.aria.engineFeatures",
                    { label: activeItem.label },
                    locale,
                  )}
                >
                  {(activeItem.engineFeatures || []).map((feature) => (
                    <li key={`${activeItem.id}-feature-${feature}`}>{feature}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
