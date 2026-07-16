import { useState } from "react";
import InspirationCardFrame from "./InspirationCardFrame.jsx";
import "../inspirations.styles.css";

export function InspirationArtwork({ inspiration, className = "" }) {
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
          draggable="false"
          onError={() => setFailed(true)}
        />
      ) : (
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      )}
    </span>
  );
}

export function InspirationCardFrontFace({
  inspiration,
  meta,
  ariaHidden = false,
}) {
  const title =
    inspiration?.title || inspiration?.label || "Untitled Inspiration";

  return (
    <section
      className="inspiration-card__face inspiration-card__front"
      aria-hidden={ariaHidden}
    >
      <InspirationArtwork
        inspiration={inspiration}
        className="inspiration-card__front-paper-texture"
      />

      <div className="inspiration-card__front-visual">
        <div className="inspiration-card__window inspiration-card__front-window">
          <InspirationArtwork inspiration={inspiration} />
          <span className="inspiration-card__front-fade inspiration-card__front-fade--bottom" />
        </div>

        <InspirationCardFrame />

        <span className="inspiration-card__domain-sigil" aria-hidden="true">
          <i className={`fa-solid ${meta.domain.icon}`} aria-hidden="true" />
        </span>
      </div>

      <span className="inspiration-card__title-rail">
        <strong className="inspiration-card__title">{title}</strong>
      </span>
    </section>
  );
}

export default function InspirationCardFront({
  inspiration,
  meta,
  className = "",
  ariaHidden = false,
}) {
  const title =
    inspiration?.title || inspiration?.label || "Untitled Inspiration";
  const isLongTitle = title.length > 20;
  const classes = [
    "inspiration-card",
    "inspiration-card--front-only",
    isLongTitle ? "has-long-title" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={classes}
      data-domain={meta.domainId}
      data-obscurity={meta.obscurityId}
      data-flipped="false"
      aria-label={title}
      aria-hidden={ariaHidden || undefined}
    >
      <div className="inspiration-card__scene">
        <InspirationCardFrontFace inspiration={inspiration} meta={meta} />
      </div>
    </article>
  );
}
