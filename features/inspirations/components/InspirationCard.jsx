import { t } from "../../../shared/i18n/index.js";
import {
  InspirationArtwork,
  InspirationCardFrontFace,
} from "./InspirationCardFront.jsx";

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
        <InspirationCardFrontFace
          inspiration={inspiration}
          meta={meta}
          ariaHidden={isFlipped}
        />

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
                aria-label={obscurityLabel}
              >
                {meta.obscurity.symbol}
              </span>
            </header>

            <div className="inspiration-card__description">
              <p>{meta.description}</p>
            </div>

            {isFlipped ? (
              <button
                className="inspiration-card__dossier-button cruor-square-icon-button"
                type="button"
                aria-label={t("inspirations.card.openDossier", {}, locale)}
                onClick={onOpenDossier}
              >
                <i className="fa-solid fa-book-open" aria-hidden="true" />
                <span className="sr-only">
                  {t("inspirations.card.openDossier", {}, locale)}
                </span>
              </button>
            ) : null}

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
        onClick={onToggle}
      />
    </article>
  );
}
