import { useEffect, useMemo, useRef } from "react";
import { t } from "../../../shared/i18n/index.js";
import InspirationCardFrame from "./InspirationCardFrame.jsx";

const SLOT_LABELS = Object.freeze({
  body: "Body",
  mind: "Mind",
  movement: "Movement",
  attack: "Attack",
  horror: "Horror",
  twist: "Twist",
  weakness: "Weakness / Tell",
  death: "Death",
  lair: "Lair / Scene",
});

function getFocusableElements(container) {
  if (!container) return [];
  return [
    ...container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter(
    (element) =>
      !element.hasAttribute("hidden") &&
      element.getAttribute("aria-hidden") !== "true",
  );
}

function groupComponentsBySlot(components) {
  return components.reduce((groups, component) => {
    const slotId = component.monster?.slot || component.slots?.[0] || "other";
    if (!groups[slotId]) groups[slotId] = [];
    groups[slotId].push(component);
    return groups;
  }, {});
}

function formatComponentMeta(component) {
  const cost = Number(component.monster?.cost || 0);
  const costLabel = cost > 0 ? `+${cost}` : String(cost);
  return `Pressure ${costLabel} · Complexity ${component.monster?.complexity ?? 0}`;
}

export default function InspirationDossierModal({
  card,
  linkedComponents = [],
  canOpenMonsterComposer = false,
  onUseMonsterComposer,
  onClose,
  locale = "en",
}) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const groupedComponents = useMemo(
    () => groupComponentsBySlot(linkedComponents),
    [linkedComponents],
  );

  useEffect(() => {
    previousActiveElementRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(modalRef.current);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElementRef.current?.focus?.();
    };
  }, [onClose]);

  if (!card) return null;

  const { inspiration, meta, sourceType, sourceAnchor, horror } = card;
  const title = inspiration.title || inspiration.label;
  const domainLabel = t(meta.domain.labelKey, {}, locale);
  const obscurityLabel = t(meta.obscurity.labelKey, {}, locale);
  const imageUrl = inspiration.media?.imageUrl || "";

  return (
    <div
      className="inspiration-dossier"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={modalRef}
        className="inspiration-dossier__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspiration-dossier-title"
      >
        <button
          ref={closeButtonRef}
          className="inspiration-dossier__close"
          type="button"
          aria-label={t("inspirations.dossier.close", {}, locale)}
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        <div className="inspiration-dossier__visual" aria-hidden="true">
          <div className="inspiration-dossier__visual-window">
            {imageUrl ? (
              <img src={imageUrl} alt="" decoding="async" />
            ) : (
              <i
                className={`fa-solid ${inspiration.media?.icon || "fa-book-open"}`}
              />
            )}
            <span />
          </div>
          <InspirationCardFrame className="inspiration-dossier__frame" />
          <span className="inspiration-dossier__domain-sigil">
            <i className={`fa-solid ${meta.domain.icon}`} aria-hidden="true" />
          </span>
          <span className="inspiration-dossier__visual-title">{title}</span>
        </div>

        <div className="inspiration-dossier__content">
          <header className="inspiration-dossier__header">
            <p>{t("inspirations.dossier.eyebrow", {}, locale)}</p>
            <h2 id="inspiration-dossier-title">{title}</h2>
            <div className="inspiration-dossier__meta">
              <span>
                <strong>{t("inspirations.dossier.domain", {}, locale)}</strong>
                <i
                  className={`fa-solid ${meta.domain.icon}`}
                  aria-hidden="true"
                />
                {domainLabel}
              </span>
              <span>
                <strong>
                  {t("inspirations.dossier.sourceType", {}, locale)}
                </strong>
                {sourceType}
              </span>
              <span>
                <strong>
                  {t("inspirations.dossier.obscurity", {}, locale)}
                </strong>
                {meta.obscurity.symbol} {obscurityLabel}
              </span>
              <span>
                <strong>
                  {t("inspirations.dossier.collection", {}, locale)}
                </strong>
                {meta.collectionLabel} · {meta.numberLabel}
              </span>
            </div>
          </header>

          <div className="inspiration-dossier__body">
            <section className="inspiration-dossier__section inspiration-dossier__section--lead">
              <h3>{t("inspirations.dossier.whatItIs", {}, locale)}</h3>
              <p>{meta.description}</p>
            </section>

            <section className="inspiration-dossier__section">
              <h3>{t("inspirations.dossier.whyItDisturbs", {}, locale)}</h3>
              <p>
                {inspiration.inspiration?.logic ||
                  inspiration.narrative ||
                  sourceAnchor?.summary ||
                  inspiration.caption}
              </p>
            </section>

            {horror.length ? (
              <section className="inspiration-dossier__section">
                <h3>{t("inspirations.dossier.horrorTexture", {}, locale)}</h3>
                <div className="inspiration-dossier__chips">
                  {horror.map((texture) => (
                    <span key={texture}>{texture}</span>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="inspiration-dossier__section">
              <div className="inspiration-dossier__section-head">
                <h3>
                  {t("inspirations.dossier.linkedComponents", {}, locale)}
                </h3>
                <span>{linkedComponents.length}</span>
              </div>

              {linkedComponents.length ? (
                <div className="inspiration-dossier__component-groups">
                  {Object.entries(groupedComponents).map(
                    ([slotId, components]) => (
                      <article
                        key={slotId}
                        className="inspiration-dossier__component-group"
                      >
                        <header>
                          <strong>{SLOT_LABELS[slotId] || slotId}</strong>
                          <span>{components.length}</span>
                        </header>
                        <div>
                          {components.map((component) => (
                            <span key={component.id} title={component.summary}>
                              <strong>{component.title}</strong>
                              <small>{formatComponentMeta(component)}</small>
                            </span>
                          ))}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              ) : (
                <p>
                  {t("inspirations.dossier.noLinkedComponents", {}, locale)}
                </p>
              )}
            </section>
          </div>

          <footer className="inspiration-dossier__actions">
            <span>
              {t("inspirations.dossier.sourceAnchor", {}, locale)} ·{" "}
              {sourceAnchor?.label || title}
            </span>
            {canOpenMonsterComposer ? (
              <button type="button" onClick={onUseMonsterComposer}>
                <i className="fa-solid fa-skull" aria-hidden="true" />
                <span>
                  {t("inspirations.dossier.useMonsterComposer", {}, locale)}
                </span>
              </button>
            ) : null}
          </footer>
        </div>
      </section>
    </div>
  );
}
