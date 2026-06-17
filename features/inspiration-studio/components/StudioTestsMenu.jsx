import { useEffect, useRef, useState } from "react";
import { MONSTER_BATCH_QA_VERSION } from "../../monster-composer/qa/monster-batch-qa.js";
import { MONSTER_PER_GRAFT_QA_VERSION } from "../../monster-composer/qa/monster-per-graft-qa.js";
import { StudioIcon } from "./StudioIcon.jsx";

function formatQaVersionLabel(version = "") {
  const match = String(version).match(/v\d+(?:\.\d+)?/i);
  return match ? match[0] : "v?";
}

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
            <em className="studio-tests-menu__version" aria-label={`Monster Batch QA ${formatQaVersionLabel(MONSTER_BATCH_QA_VERSION)}`}>
              {formatQaVersionLabel(MONSTER_BATCH_QA_VERSION)}
            </em>
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
            <em className="studio-tests-menu__version" aria-label={`Monster Per-Graft QA ${formatQaVersionLabel(MONSTER_PER_GRAFT_QA_VERSION)}`}>
              {formatQaVersionLabel(MONSTER_PER_GRAFT_QA_VERSION)}
            </em>
          </button>
        </div>
      ) : null}
    </div>
  );
}
