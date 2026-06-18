import { useEffect, useRef, useState } from "react";
import { MONSTER_BATCH_QA_VERSION } from "../../monster-composer/qa/monster-batch-qa.js";
import { MONSTER_PER_GRAFT_QA_VERSION } from "../../monster-composer/qa/monster-per-graft-qa.js";
import { MAP_BATCH_QA_VERSION } from "../../darken-location/map-generator/qa/map-batch-qa.js";
import {
  getStudioTestIcon,
  getStudioTestLabel,
} from "../qa/studio-test-presets.js";
import { StudioIcon } from "./StudioIcon.jsx";

function formatQaVersionLabel(version = "") {
  const match = String(version).match(/v\d+(?:\.\d+)?/i);
  return match ? match[0] : "v?";
}

export function StudioTestsMenu({
  batchQaOpen = false,
  perGraftQaOpen = false,
  mapBatchQaOpen = false,
  presets = [],
  onOpenMonsterBatchQa,
  onOpenMonsterPerGraftQa,
  onOpenMapBatchQa,
  onRunPreset,
  onDeletePreset,
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

  function runPreset(preset) {
    setIsOpen(false);
    onRunPreset?.(preset);
  }

  function deletePreset(event, preset) {
    event.stopPropagation();
    if (preset.locked) return;
    onDeletePreset?.(preset.id);
  }

  const officialPresetCount = presets.filter((preset) => preset.locked).length;
  const userPresetCount = presets.length - officialPresetCount;

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
          <div className="studio-tests-menu__section" role="group" aria-label="Studio tests">
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
              aria-expanded={mapBatchQaOpen}
              aria-controls="studio-map-batch-qa-modal"
              onClick={() => runAction(onOpenMapBatchQa)}
            >
              <StudioIcon name="fa-map-location-dot" />
              <span>
                <strong>Map Batch QA</strong>
                <small>Generate and validate many maps</small>
              </span>
              <em className="studio-tests-menu__version" aria-label={`Map Batch QA ${formatQaVersionLabel(MAP_BATCH_QA_VERSION)}`}>
                {formatQaVersionLabel(MAP_BATCH_QA_VERSION)}
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

          <div className="studio-tests-menu__presets" role="group" aria-label="Test presets">
            <header className="studio-tests-menu__presets-header">
              <span>Test Presets</span>
              <small>{presets.length ? `${officialPresetCount} official · ${userPresetCount} saved` : "None saved"}</small>
            </header>
            {presets.length ? (
              presets.map((preset) => (
                <div className="studio-tests-menu__preset-row" key={preset.id}>
                  <button
                    className="studio-tests-menu__preset-run"
                    type="button"
                    role="menuitem"
                    onClick={() => runPreset(preset)}
                  >
                    <StudioIcon name={getStudioTestIcon(preset.testId)} />
                    <span>
                      <strong>{preset.name}</strong>
                    </span>
                  </button>
                  {preset.locked ? (
                    <span className="studio-tests-menu__preset-lock" aria-label="Official preset">
                      <StudioIcon name="fa-lock" />
                    </span>
                  ) : (
                    <button
                      className="studio-tests-menu__preset-delete"
                      type="button"
                      aria-label={`Delete preset ${preset.name}`}
                      onClick={(event) => deletePreset(event, preset)}
                    >
                      <StudioIcon name="fa-trash-can" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="studio-tests-menu__empty-presets">Save a preset from any QA setup panel.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
