import { useState } from "react";
import { t } from "../../../shared/i18n/index.js";
import InspirationCardFrame from "./InspirationCardFrame.jsx";

function InspirationArtwork({ inspiration, className = "" }) {
  const [failed, setFailed] = useState(false);
  const icon = inspiration?.media?.icon || "fa-book-open";
  const imageUrl = inspiration?.media?.imageUrl || "";

  return (
    <span
      className={`inspiration-card__artwork ${className}`.trim()}
      aria-hidden="true"
    >
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      )}
    </span>
  );
}

export default function InspirationCard({
  inspiration,
  meta,
  sourceType,
  isFlipped = false,
  onToggle,
  onOpenDossier,
  locale = "en",
}) {
  const title =
    inspiration?.title || inspiration?.label || "Untitled Inspiration";
  const isLongTitle = title.length > 20;
  const domainLabel = t(meta.domain.labelKey, {}, locale);
  const obscurityLabel = t(meta.obscurity.labelKey, {}, locale);
  const sideLabel = isFlipped
    ? t("inspirations.card.turnFront", { title }, locale)
    : t("inspirations.card.turnBack", { title }, locale);

  return (
    <article
      className={`inspiration-card${isFlipped ? " is-flipped" : ""}${
        isLongTitle ? " has-long-title" : ""
      }`}
      data-domain={meta.domainId}
      data-obscurity={meta.obscurityId}
      data-flipped={isFlipped ? "true" : "false"}
      aria-label={t("inspirations.card.aria", { title }, locale)}
    >
      <div className="inspiration-card__scene">
        <section
          className="inspiration-card__face inspiration-card__front"
          aria-hidden={isFlipped}
        >
          <InspirationArtwork
            inspiration={inspiration}
            className="inspiration-card__front-paper-texture"
          />

          <div className="inspiration-card__window inspiration-card__front-window">
            <InspirationArtwork inspiration={inspiration} />
            <span className="inspiration-card__front-fade inspiration-card__front-fade--bottom" />
          </div>

          <InspirationCardFrame />

          <span
            className="inspiration-card__domain-sigil"
            title={domainLabel}
            aria-hidden="true"
          >
            <span>{meta.domain.symbol}</span>
          </span>

          <span className="inspiration-card__title-box">
            <strong className="inspiration-card__title">{title}</strong>
          </span>
        </section>

        <section
          className="inspiration-card__face inspiration-card__back"
          aria-hidden={!isFlipped}
        >
          <InspirationArtwork
            inspiration={inspiration}
            className="inspiration-card__back-art"
          />

          <div className="inspiration-card__back-content">
            <header className="inspiration-card__back-head">
              <div>
                <h2>{title}</h2>
                <span>{sourceType}</span>
              </div>
              <span
                className={`inspiration-card__obscurity is-${meta.obscurityId}`}
                title={obscurityLabel}
                aria-label={obscurityLabel}
              >
                {meta.obscurity.symbol}
              </span>
            </header>

            <div className="inspiration-card__description">
              <p>{meta.description}</p>
            </div>

            <footer className="inspiration-card__footer">
              <span>{meta.collectionLabel}</span>
              <span>
                {t(
                  "inspirations.card.number",
                  { number: meta.numberLabel },
                  locale,
                )}
              </span>
            </footer>
          </div>
        </section>
      </div>

      <button
        className="inspiration-card__flip-control"
        type="button"
        aria-pressed={isFlipped}
        aria-label={sideLabel}
        title={sideLabel}
        onClick={onToggle}
      />

      {isFlipped ? (
        <button
          className="inspiration-card__dossier-button cruor-square-icon-button cruor-square-icon-button--compact"
          type="button"
          aria-label={t("inspirations.card.openDossier", {}, locale)}
          title={t("inspirations.card.openDossier", {}, locale)}
          data-key="tooltip-generic"
          data-tooltip={t("inspirations.card.openDossier", {}, locale)}
          onClick={onOpenDossier}
        >
          <i className="fa-solid fa-book-open" aria-hidden="true" />
          <span className="sr-only">
            {t("inspirations.card.openDossier", {}, locale)}
          </span>
        </button>
      ) : null}
    </article>
  );
}
