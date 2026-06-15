import { useEffect } from "react";
import { StudioIcon } from "./StudioIcon.jsx";

export function StudioToolModalShell({
  actions = null,
  children,
  className = "",
  icon = "fa-screwdriver-wrench",
  id,
  isOpen,
  onClose,
  subtitle = "",
  title,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const titleId = `${id || "studio-tool-modal"}-title`;

  return (
    <div className={`studio-global-modal-backdrop ${className ? `${className}-backdrop` : ""}`.trim()} role="presentation">
      <section
        id={id}
        className={`studio-global-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="studio-global-modal__header">
          <div>
            <span><StudioIcon name={icon} /> Studio Tool</span>
            <h2 id={titleId}>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <div className="studio-global-modal__header-actions">
            {actions}
            <button
              className="studio-global-modal__close"
              type="button"
              aria-label={`Close ${title}`}
              title={`Close ${title}`}
              onClick={onClose}
            >
              <StudioIcon name="fa-xmark" />
            </button>
          </div>
        </header>
        <div className="studio-global-modal__body">
          {children}
        </div>
      </section>
    </div>
  );
}
