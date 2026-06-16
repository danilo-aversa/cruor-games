import { useState } from "react";
import { StudioIcon } from "./StudioIcon.jsx";

export function StudioTestsMenu({ batchQaOpen = false, onOpenMonsterBatchQa }) {
  const [isOpen, setIsOpen] = useState(false);

  function runAction(action) {
    setIsOpen(false);
    action?.();
  }

  return (
    <div className="studio-tests-menu" aria-label="Global Studio QA tests">
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
        </div>
      ) : null}
    </div>
  );
}
