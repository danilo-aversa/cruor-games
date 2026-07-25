import { useEffect } from "react";
import { StudioIcon } from "./StudioIcon.jsx";

export function StudioToolModalShell({
  actions = null,
  children,
  className = "",
  icon = "fa-screwdriver-wrench",
  id,
  isOpen,
  mode = "modal",
  onClose,
  subtitle = "",
  title,
}) {
  const isWorkspace = mode === "workspace";

  useEffect(() => {
    if (!isOpen || isWorkspace) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isWorkspace, onClose]);

  if (!isOpen) return null;

  const titleId = `${id || "studio-tool-modal"}-title`;

  const workspace = (
    <section
      id={id}
      className={`studio-global-modal ${className}`.trim()}
      role={isWorkspace ? "region" : "dialog"}
      aria-modal={isWorkspace ? undefined : "true"}
      aria-labelledby={titleId}
    >
      <header className="studio-global-modal__header">
        <div>
          <span><StudioIcon name={icon} /> {isWorkspace ? "Creator Operations" : "Studio Tool"}</span>
          <h2 id={titleId}>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <div className="studio-global-modal__header-actions">
          {actions}
          {!isWorkspace ? (
            <button
              className="studio-global-modal__close"
              type="button"
              aria-label={`Close ${title}`}
              title={`Close ${title}`}
              onClick={onClose}
            >
              <StudioIcon name="fa-xmark" />
            </button>
          ) : null}
        </div>
      </header>
      <div className="studio-global-modal__body">
        {children}
      </div>
    </section>
  );

  if (isWorkspace) return workspace;

  return (
    <div className={`studio-global-modal-backdrop ${className ? `${className}-backdrop` : ""}`.trim()} role="presentation">
      {workspace}
    </div>
  );
}
