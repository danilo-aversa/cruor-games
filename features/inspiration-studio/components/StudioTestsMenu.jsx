import { useEffect, useRef, useState } from "react";
import { StudioIcon } from "./StudioIcon.jsx";

export function StudioTestsMenu({ batchQaOpen = false, perGraftQaOpen = false, onOpenMonsterBatchQa, onOpenMonsterPerGraftQa }) {
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
    <div className="studio-tests-menu" aria-label="Global Studio QA tests" ref={menuRef}>
      <button
        className="studio-library-panel__collapse studio-tests-menu__button"
        type="button"
        aria-label="Open Studio QA tests"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Studio QA tests"
        onClick={() => setIsOpen((value) => !value)}
      >
        <StudioIcon name="fa-vial-circle-check" />
      </button>
      {isOpen ? (
        <div className="studio-tests-menu__popover" role="menu">
          <button
            type="button"
            role="menuitem"
            aria-haspopup="dialog"
            aria-expanded={batchQaOpen}
            aria-controls="studio-monster-batch-qa-modal"
            onClick={() => runAction(onOpenMonsterBatchQa)}
          >
            <StudioIcon name="fa-dragon" />
            <span>
              <strong>Monster Batch QA</strong>
              <small>Generate and validate many monsters</small>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            aria-haspopup="dialog"
            aria-expanded={perGraftQaOpen}
            aria-controls="studio-monster-per-graft-qa-modal"
            onClick={() => runAction(onOpenMonsterPerGraftQa)}
          >
            <StudioIcon name="fa-vials" />
            <span>
              <strong>Monster Per-Graft QA</strong>
              <small>Force every graft through export/parser</small>
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
