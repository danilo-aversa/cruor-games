import { BookOpen, Flame, Skull, SlidersHorizontal, Sparkles } from "lucide-react";

export function MonsterComposerTopbar({
  activePreset,
  targetCr,
  tacticalRole,
  monsterTier,
  tempoProfile,
  viewMode,
  onSetViewMode,
  composerStageMode = "frame",
  onSetComposerStageMode,
}) {
  return (
    <div className="darken-workspace__topbar monster-topbar-wrap">
      <header className="darken-topbar monster-topbar">
        <div className="darken-topbar__primary">
          <h1 className="darken-topbar__title">
            <span className="darken-topbar__title-prefix">I need to</span>
            <span className="darken-topbar__need-value">Build a Monster</span>
          </h1>
          <div className="darken-topbar__control-row monster-topbar__control-row">
            <div
              className="mode-switch darken-topbar__mode-switch"
              aria-label="Choose what you need to do"
            >
              <button
                className="mode-btn"
                type="button"
                aria-label="Darken a Location"
                aria-pressed="false"
              >
                <BookOpen aria-hidden="true" />
                <span className="sr-only">Darken a Location</span>
              </button>
              <button
                className="mode-btn active"
                type="button"
                aria-label="Build a Monster"
                aria-pressed="true"
              >
                <Skull aria-hidden="true" />
                <span className="sr-only">Build a Monster</span>
              </button>
              <button
                className="mode-btn"
                type="button"
                aria-label="Inspirations"
                aria-pressed="false"
              >
                <Sparkles aria-hidden="true" />
                <span className="sr-only">Inspirations</span>
              </button>
            </div>

            <div className="monster-canvas-meta-row monster-canvas-mode-row" aria-label="Monster Builder mode">
              <button
                className={`monster-canvas-mode-btn ${composerStageMode === "frame" ? "is-active" : ""}`}
                type="button"
                aria-label="Frame mode"
                aria-pressed={composerStageMode === "frame"}
                title="Frame"
                onClick={() => onSetComposerStageMode?.("frame")}
              >
                <SlidersHorizontal aria-hidden="true" />
                <span className="sr-only">Frame</span>
              </button>
              <button
                className={`monster-canvas-mode-btn ${composerStageMode === "grafts" ? "is-active" : ""}`}
                type="button"
                aria-label="Grafts mode"
                aria-pressed={composerStageMode === "grafts"}
                title="Grafts"
                onClick={() => onSetComposerStageMode?.("grafts")}
              >
                <Flame aria-hidden="true" />
                <span className="sr-only">Grafts</span>
              </button>
            </div>
            <div className="monster-topbar__right">
              <div className="monster-topbar__summary" aria-label="Current monster frame">
                <span className="monster-current-frame">
                  {activePreset ? `${activePreset.label} · ` : ""}CR {targetCr} · {" "}
                  {tacticalRole.label} · {monsterTier.label} · {tempoProfile.label}
                </span>
              </div>
              <div
                className="darken-workspace__tabs"
                role="tablist"
                aria-label="Monster composer views"
              >
                <button
                  className={`darken-workspace__tab ${viewMode === "composer" ? "is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "composer"}
                  onClick={() => onSetViewMode("composer")}
                >
                  Composer
                </button>
                <button
                  className={`darken-workspace__tab ${viewMode === "balance" ? "is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "balance"}
                  onClick={() => onSetViewMode("balance")}
                >
                  Balance
                </button>
                <button
                  className={`darken-workspace__tab ${viewMode === "run" ? "is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "run"}
                  onClick={() => onSetViewMode("run")}
                >
                  Run
                </button>
                <button
                  className={`darken-workspace__tab ${viewMode === "export" ? "is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "export"}
                  onClick={() => onSetViewMode("export")}
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
