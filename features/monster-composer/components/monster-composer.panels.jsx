import { AlertTriangle, Shield } from "lucide-react";

import {
  ComposerCollapsibleSection,
  ComposerFactRow,
  ComposerRail,
} from "../../../components/ui/composer-rail.jsx";

function modText(value) {
  return value >= 0 ? `+${value}` : `−${Math.abs(value)}`;
}

const ABILITY_ROWS = [
  { id: "physical", keys: ["str", "dex", "con"] },
  { id: "mental", keys: ["int", "wis", "cha"] },
];

function formatCoreStatValue(value) {
  return String(value ?? "")
    .replace(/(\d+)\s*D\s*(\d+)/gi, "$1d$2")
    .replace(/\bft\./gi, "ft.");
}

const RULE_INLINE_LABEL_PATTERN =
  /(Melee or Ranged Attack Roll:|Melee Attack Roll:|Ranged Attack Roll:|Melee Spell Roll:|Ranged Spell Roll:|Hit or Miss:|Hit:|Miss:|Trigger:|Response:|Strength Saving Throw:|Dexterity Saving Throw:|Constitution Saving Throw:|Intelligence Saving Throw:|Wisdom Saving Throw:|Charisma Saving Throw:|Success:|Failure:)/g;

function renderRulesText(text) {
  return String(text || "")
    .split(RULE_INLINE_LABEL_PATTERN)
    .filter(Boolean)
    .map((part, index) => {
      const isRulesLabel = /^(?:Melee or Ranged Attack Roll:|Melee Attack Roll:|Ranged Attack Roll:|Melee Spell Roll:|Ranged Spell Roll:|Hit or Miss:|Hit:|Miss:|Trigger:|Response:|Strength Saving Throw:|Dexterity Saving Throw:|Constitution Saving Throw:|Intelligence Saving Throw:|Wisdom Saving Throw:|Charisma Saving Throw:|Success:|Failure:)$/.test(part);
      return isRulesLabel ? (
        <em key={`rules-label-${index}`}>{part}</em>
      ) : (
        <span key={`rules-text-${index}`}>{part}</span>
      );
    });
}

function StatBlockCoreCard({ item }) {
  return (
    <article className={`cruor-stat-core-card cruor-stat-core-card--${item.id || "default"}`}>
      <span>{item.label}</span>
      <strong>{formatCoreStatValue(item.value)}</strong>
    </article>
  );
}

function AbilityGrid({ abilities }) {
  const byKey = Object.fromEntries(abilities.map((ability) => [ability.key, ability]));

  return (
    <div className="cruor-ability-grid" role="table" aria-label="Ability scores, modifiers, and saves">
      <div className="cruor-ability-header-row" role="row" aria-hidden="true">
        {ABILITY_ROWS[0].keys.map((key) => (
          <div key={`ability-header-${key}`} className="cruor-ability-header-group">
            <span />
            <span />
            <span>MOD</span>
            <span>SAVE</span>
          </div>
        ))}
      </div>
      {ABILITY_ROWS.map((row) => (
        <div
          key={row.id}
          className={`cruor-ability-row cruor-ability-row--${row.id}`}
          role="row"
        >
          {row.keys.map((key) => {
            const ability = byKey[key];
            if (!ability) return null;
            return (
              <div
                key={ability.key}
                className={`cruor-ability-group cruor-ability-group--${row.id}`}
                role="group"
                aria-label={`${ability.label} ${ability.score}, modifier ${modText(ability.mod)}, save ${modText(ability.save)}`}
              >
                <div className="cruor-ability-cell cruor-ability-cell--label" role="cell">
                  {ability.label}
                </div>
                <div className="cruor-ability-cell cruor-ability-cell--score" role="cell">
                  {ability.score}
                </div>
                <div className="cruor-ability-cell cruor-ability-cell--mod" role="cell">
                  {modText(ability.mod)}
                </div>
                <div className="cruor-ability-cell cruor-ability-cell--save" role="cell">
                  {modText(ability.save)}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function StatBlockChallengeLine({ challenge }) {
  if (!challenge) return null;
  const lairText = challenge.lairXp ? `, or ${challenge.lairXp} in lair` : "";

  return (
    <p className="cruor-stat-block__challenge">
      <strong>CR</strong> {challenge.cr} (XP {challenge.xp}{lairText}; PB {challenge.pb})
    </p>
  );
}

export function RunModePanel({
  sheet,
  recommendations,
  onAction,
  onOpenComposer,
  onOpenExport,
}) {
  return (
    <section className="run-mode-workbench" aria-label="Run mode">
      <div className="run-mode-hero">
        <div>
          <h2>{sheet.name}</h2>
          <p>{sheet.frame}</p>
        </div>
        <div className="run-mode-actions" aria-label="Run mode actions">
          <button type="button" onClick={onOpenComposer}>
            Composer
          </button>
          <button type="button" onClick={onOpenExport}>
            Export
          </button>
        </div>
      </div>

      <div className="run-stat-strip" aria-label="Table statistics">
        {sheet.quickStats.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>

      <div className="run-mode-grid">
        <RunModeSection title="Turn Loop" items={sheet.turnLoop} wide />
        <RunModeTriggerSection items={sheet.triggers} />
        <RunModeSection title="Track During Play" items={sheet.tracking} />
        <RunModeSection title="Player Answers" items={sheet.playerAnswers} />
        <RunModeSection title="Watch Closely" items={sheet.watch} />
        <section className="run-panel">
          <div className="run-panel__head">
            <h3>Fix Before Table</h3>
            <strong>{recommendations.length || "Clear"}</strong>
          </div>
          <MonsterGuidanceList
            recommendations={recommendations.slice(0, 3)}
            onAction={onAction}
          />
        </section>
      </div>
    </section>
  );
}

function RunModeSection({ title, items, wide = false }) {
  return (
    <section className={`run-panel ${wide ? "run-panel--wide" : ""}`}>
      <div className="run-panel__head">
        <h3>{title}</h3>
        <strong>{items.length || "—"}</strong>
      </div>
      {items.length ? (
        <div className="run-list">
          {items.map((item) => (
            <article key={`${title}-${item.id || item.label}`}>
              <strong>{item.label || item.title}</strong>
              <p>{item.value}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="run-empty">Nothing to track.</p>
      )}
    </section>
  );
}

function RunModeTriggerSection({ items }) {
  return (
    <section className="run-panel run-panel--wide">
      <div className="run-panel__head">
        <h3>Live Triggers</h3>
        <strong>{items.length || "—"}</strong>
      </div>
      {items.length ? (
        <div className="run-trigger-list">
          {items.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.trigger}</span>
              </div>
              <p>{item.response}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="run-empty">
          No reactions, lair actions, recharge hooks, or death triggers installed.
        </p>
      )}
    </section>
  );
}

export function MonsterGuidanceList({ recommendations, onAction, compact = false }) {
  if (!recommendations.length) {
    return (
      <div className={`monster-guidance monster-guidance--ok ${compact ? "is-compact" : ""}`.trim()}>
        <Shield aria-hidden="true" />
        <div>
          <strong>No changes required</strong>
          <p>
            {compact
              ? "No active warnings. Pressure, Complexity, and counterplay update continuously."
              : "The monster is within the current pressure and complexity targets, and the counterplay audit is playable."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`monster-guidance-list ${compact ? "is-compact" : ""}`.trim()}>
      {recommendations.map((recommendation) => (
        <article
          key={recommendation.id}
          className={`monster-guidance is-${recommendation.severity} ${compact ? "is-compact" : ""}`.trim()}
        >
          <AlertTriangle aria-hidden="true" />
          <div className="monster-guidance__body">
            <span>{recommendation.severity}</span>
            <strong>{recommendation.title}</strong>
            <p>{recommendation.detail}</p>
            {recommendation.actions?.length > 0 && (
              <div className="monster-guidance__actions">
                {recommendation.actions.map((action) => (
                  <button
                    key={`${recommendation.id}-${action.label}`}
                    type="button"
                    aria-label={action.label}
                    title={action.label}
                    onClick={() => onAction?.(action)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function DesignerNotesPanel({ notes }) {
  if (!notes?.length) return null;

  return (
    <ComposerCollapsibleSection
      title="Designer Notes"
      defaultExpanded={false}
      className="monster-export-section monster-export-designer-notes"
      bodyClassName="monster-export-section__body"
    >
      <div className="monster-export-designer-notes__body">
        {notes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>
    </ComposerCollapsibleSection>
  );
}

function StatBlockModeSwitch({ mode = "standard", onSetMode }) {
  const isCustom = mode === "custom";

  return (
    <div className="export-stat-mode-control" aria-label="Stat block mode">
      <span>Stat Block</span>
      <button
        className={`cruor-composer-control export-stat-mode-switch ${isCustom ? "is-custom" : "is-standard"}`}
        type="button"
        role="switch"
        aria-checked={isCustom}
        onClick={() => onSetMode?.(isCustom ? "standard" : "custom")}
      >
        <span className={!isCustom ? "is-active" : ""}>Standard</span>
        <span className={isCustom ? "is-active" : ""}>Custom</span>
        <i aria-hidden="true" />
      </button>
    </div>
  );
}

export function ExportWorkbench({
  exportText,
  exportJson,
  debugExportJson,
  statBlock,
  exportReadiness,
  exportRunSheet,
  exportCopyStatus,
  statBlockMode = "standard",
  uiMode = "simple",
  onSetStatBlockMode,
  onCopyExportPayload,
  onResolveReadiness,
  viewToolbar,
  liveExportButton,
  workflowFooter = null,
}) {
  return (
    <section className="export-workbench" aria-label="Monster export">
      <div className="export-layout">
        <section className="panel table-view export-stat-preview">
          <RenderedStatBlock statBlock={statBlock} liveExportButton={liveExportButton} />
        </section>

        <ComposerRail
          side="right"
          variant="info"
          scrollable
          className="monster-export-details-rail"
          aria-label="Monster export summary"
          footer={workflowFooter}
        >
          {viewToolbar}


          <ComposerCollapsibleSection
            title="Stat Block"
            defaultExpanded
            className="monster-export-section monster-export-actions-section"
            bodyClassName="monster-export-section__body"
            aria-label="Stat block export controls"
          >
            <StatBlockModeSwitch mode={statBlockMode} onSetMode={onSetStatBlockMode} />
            <div className="export-action-grid" aria-label="Export actions">
              <button
                className={`export-copy-btn ${exportCopyStatus === "text-copied" ? "copied" : exportCopyStatus === "text-failed" ? "failed" : ""}`}
                type="button"
                onClick={() => onCopyExportPayload("text", exportText)}
              >
                {exportCopyStatus === "text-copied"
                  ? "Copied Stat Block"
                  : exportCopyStatus === "text-failed"
                    ? "Copy Failed"
                    : "Copy Stat Block"}
              </button>
              <button
                className={`export-copy-btn ${exportCopyStatus === "json-copied" ? "copied" : exportCopyStatus === "json-failed" ? "failed" : ""}`}
                type="button"
                onClick={() => onCopyExportPayload("json", exportJson)}
              >
                {exportCopyStatus === "json-copied"
                  ? "Copied JSON"
                  : exportCopyStatus === "json-failed"
                    ? "Copy Failed"
                    : "Copy JSON"}
              </button>
            </div>
          </ComposerCollapsibleSection>

          <ExportReadinessPanel readiness={exportReadiness} onResolveReadiness={onResolveReadiness} />

          <ExportRunSheet items={exportRunSheet} />

          {uiMode === "debug" && <DesignerNotesPanel notes={statBlock.debug?.designerNotes} />}

          <ComposerCollapsibleSection
            title="Raw Export"
            defaultExpanded={false}
            className="monster-export-section monster-export-raw-section"
            bodyClassName="monster-export-section__body"
          >
            <div className="export-raw-panel__body">
              <div className="export-textarea-shell">
                <span>Stat Block Text</span>
                <textarea value={exportText} readOnly aria-label="Exported stat block text" />
              </div>
              <div className="export-textarea-shell">
                <span>Public JSON</span>
                <textarea value={exportJson} readOnly aria-label="Exported public monster JSON" />
              </div>
              {uiMode === "debug" && (
                <div className="export-textarea-shell">
                  <span>Debug JSON</span>
                  <textarea value={debugExportJson || ""} readOnly aria-label="Exported debug monster JSON" />
                </div>
              )}
            </div>
          </ComposerCollapsibleSection>
        </ComposerRail>
      </div>
    </section>
  );
}

export function RenderedStatBlock({ statBlock, liveExportButton }) {
  const visibleSections = statBlock.sections.filter((section) => section.items.length > 0);

  return (
    <article
      className="cruor-stat-block rendered-stat-block"
      aria-label={`${statBlock.name} rendered stat block`}
    >
      {liveExportButton}
      <header className="cruor-stat-block__head">
        <h3>{statBlock.name}</h3>
        <p>{statBlock.creatureLine}</p>
      </header>

      <section className="cruor-stat-block__core" aria-label="Core combat statistics">
        {statBlock.coreStats.map((item) => (
          <StatBlockCoreCard key={item.id || item.label} item={item} />
        ))}
      </section>

      <section className="cruor-stat-block__abilities" aria-label="Ability scores">
        <AbilityGrid abilities={statBlock.abilities} />
      </section>

      <section className="cruor-stat-block__facts" aria-label="Defenses and senses">
        {statBlock.defenses.map((item) => (
          <p key={item.label}>
            <strong>{item.label}</strong> {item.value}
          </p>
        ))}
        <StatBlockChallengeLine challenge={statBlock.challenge} />
      </section>

      {visibleSections.map((section) => (
        <RenderedStatBlockSection
          key={section.id}
          title={section.title}
          items={section.items}
          highlight={section.highlight}
        />
      ))}

    </article>
  );
}

function RenderedStatBlockSection({ title, items, highlight }) {
  if (!items.length) return null;

  return (
    <section className={`cruor-stat-block__section ${highlight ? "is-weakness" : ""}`}>
      <h2>{title}</h2>
      {items.map((item) => (
        <p key={item.id}>
          <strong>
            <em>{item.title}.</em>
          </strong>{" "}
          {renderRulesText(item.text)}
        </p>
      ))}
    </section>
  );
}

function ExportReadinessPanel({ readiness, onResolveReadiness }) {
  const passedChecks = readiness.checks.filter((check) => check.ready).length;

  return (
    <ComposerCollapsibleSection
      title="Export Readiness"
      defaultExpanded={false}
      className={`monster-export-section monster-export-readiness-section ${readiness.ready ? "is-ready" : readiness.blockers.length ? "is-blocked" : "needs-review"}`}
      bodyClassName="monster-export-section__body"
      aria-label="Export readiness"
    >
      <div className="cruor-composer-meter">
        <div className="cruor-composer-meter__head">
          <span className="cruor-composer-meter__label">{readiness.label}</span>
          <span className="cruor-composer-meter__value">
            <strong>{readiness.percent}%</strong>
          </span>
        </div>
        <div className="cruor-composer-meter__track" aria-hidden="true">
          <div
            className="cruor-composer-meter__fill"
            style={{ width: `${readiness.percent}%` }}
          />
        </div>
      </div>

      <div className="cruor-composer-fact-grid monster-export-check-grid">
        <ComposerFactRow
          label="Checks Passed"
          value={`${passedChecks} / ${readiness.checks.length}`}
        />
        {readiness.checks.map((check) => (
          <ComposerFactRow
            key={check.id}
            className={`monster-export-check-row ${check.ready ? "is-ready" : check.severity === "required" ? "is-blocked" : "needs-review"}`}
            label={check.label}
            value={check.detail}
          />
        ))}
      </div>

      {!readiness.ready && onResolveReadiness && (
        <button className="export-resolve-btn" type="button" onClick={onResolveReadiness}>
          Resolve in Grafts
        </button>
      )}
    </ComposerCollapsibleSection>
  );
}

function ExportRunSheet({ items }) {
  return (
    <ComposerCollapsibleSection
      title="DM Run Sheet"
      defaultExpanded={false}
      className="monster-export-section monster-export-run-sheet"
      bodyClassName="monster-export-section__body"
      aria-label="DM run sheet"
    >
      <div className="cruor-composer-fact-grid monster-export-run-sheet__grid">
        {items.map((item) => (
          <ComposerFactRow key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </ComposerCollapsibleSection>
  );
}
