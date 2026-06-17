import { useEffect, useRef, useState } from "react";
import { StudioIcon } from "./StudioIcon.jsx";

export function StudioToolsMenu({
  coverageOpen = false,
  graftCount = 0,
  healthOpen = false,
  isGraftLedgerOpen = false,
  onDownloadAuditBundle,
  onOpenContentHealth,
  onOpenCoverageMatrix,
  onOpenGraftLedger,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleDocumentPointerDown(event) {
      if (menuRef.current?.contains(event.target)) return;
      setIsOpen(false);
    }

    function handleDocumentKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isOpen]);

  function runAction(action) {
    setIsOpen(false);
    action?.();
  }

  return (
    <div className="studio-tools-menu" aria-label="Global Studio tools" ref={menuRef}>
      <button
        className="studio-library-panel__collapse studio-tools-menu__button"
        type="button"
        aria-label="Open global Studio tools"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Studio tools"
        onClick={() => setIsOpen((value) => !value)}
      >
        <StudioIcon name="fa-screwdriver-wrench" />
      </button>
      {isOpen ? (
        <div className="studio-tools-menu__popover" role="menu">
          <button
            type="button"
            role="menuitem"
            aria-haspopup="dialog"
            aria-expanded={isGraftLedgerOpen}
            aria-controls="studio-graft-ledger-modal"
            onClick={() => runAction(onOpenGraftLedger)}
          >
            <StudioIcon name="fa-table-list" />
            <span>
              <strong>Graft Ledger</strong>
              <small>{graftCount} grafts</small>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            aria-haspopup="dialog"
            aria-expanded={healthOpen}
            aria-controls="studio-content-health-modal"
            onClick={() => runAction(onOpenContentHealth)}
          >
            <StudioIcon name="fa-heart-pulse" />
            <span>
              <strong>Content Health</strong>
              <small>Issues and readiness</small>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            aria-haspopup="dialog"
            aria-expanded={coverageOpen}
            aria-controls="studio-coverage-matrix-modal"
            onClick={() => runAction(onOpenCoverageMatrix)}
          >
            <StudioIcon name="fa-table-cells-large" />
            <span>
              <strong>Coverage Matrix</strong>
              <small>Gaps and distribution</small>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onDownloadAuditBundle)}
          >
            <StudioIcon name="fa-file-arrow-down" />
            <span>
              <strong>Download Audit Bundle</strong>
              <small>JSON for ChatGPT review</small>
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
