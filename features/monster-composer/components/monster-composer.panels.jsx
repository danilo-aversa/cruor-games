import { AlertTriangle, Shield } from "lucide-react";

import { formatCounterplayIssues } from "../model/monster-composer.balance.js";

function modText(value) {
  return value >= 0 ? `+${value}` : `−${Math.abs(value)}`;
}

function Meter({ label, value, max, percent }) {
  return (
    <div className="meter" aria-label={`${label}: ${value} of ${max}`}>
      <div className="meter__track">
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="meter__meta">
        <span>{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function CompiledMeta({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
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

function WarningList({ warnings }) {
  if (!warnings.length) {
    return (
      <div className="monster-ready-note">
        <Shield aria-hidden="true" />
        <span>
          The monster has a weakness/tell, stays inside the pressure budget, and should be playable
          for the selected use.
        </span>
      </div>
    );
  }

  return (
    <div className="monster-warning-list">
      {warnings.map((warning) => (
        <div key={warning} className="monster-warning">
          <AlertTriangle aria-hidden="true" />
          <span>{warning}</span>
        </div>
      ))}
    </div>
  );
}

export function BalanceWorkbench({
  computed,
  pressurePercent,
  complexityPercent,
  onRecommendationAction,
}) {
  return (
    <section className="panel balance-workbench" aria-label="Monster balance review">
      <div className="balance-hero">
        <div>
          <h2>Balance Review</h2>
        </div>
        <span className={`balance-verdict ${computed.warnings.length ? "needs-review" : "ready"}`}>
          <Shield aria-hidden="true" /> {computed.warnings.length ? "Needs Review" : "Ready"}
        </span>
      </div>
      <div className="balance-grid balance-grid--simplified">
        <article className="balance-card balance-wide-card balance-recommendations-card">
          <div className="balance-card__head">
            <span>Fix These First</span>
            <strong>{computed.balanceRecommendations.length || "Clear"}</strong>
          </div>
          <BalanceRecommendationList
            recommendations={computed.balanceRecommendations}
            onAction={onRecommendationAction}
          />
        </article>
        <article className="balance-card">
          <div className="balance-card__head">
            <span>Pressure</span>
            <strong>{computed.pressureProfile.label}</strong>
          </div>
          <Meter
            label="Pressure"
            value={computed.pressure}
            max={computed.budget}
            percent={pressurePercent}
          />
          <p className="balance-note">
            {computed.pressureProfile.sources.join(" · ") || "No pressure sources yet."}
          </p>
        </article>
        <article className="balance-card">
          <div className="balance-card__head">
            <span>Complexity</span>
            <strong>{computed.complexityProfile.label}</strong>
          </div>
          <Meter
            label="Complexity"
            value={computed.complexity}
            max={computed.complexityCap}
            percent={complexityPercent}
          />
          <p className="balance-note">
            {computed.complexityProfile.sources.join(" · ") || "No complexity sources yet."}
          </p>
        </article>
        <article className="balance-card">
          <div className="balance-card__head">
            <span>Counterplay</span>
            <strong>{computed.counterplayAudit.rating}</strong>
          </div>
          <div
            className="balance-progress-ring"
            style={{ "--progress": `${computed.counterplayAudit.score}%` }}
          >
            <span>{computed.counterplayAudit.score}</span>
          </div>
          <p className="balance-note">
            {formatCounterplayIssues(computed.counterplayAudit.issues)}
          </p>
        </article>
        <details className="balance-diagnostics balance-wide-card">
          <summary>Raw Diagnostics</summary>
          <div className="balance-diagnostics__grid">
            <article className="balance-card">
              <div className="balance-card__head">
                <span>Warnings</span>
                <strong>{computed.warnings.length}</strong>
              </div>
              <WarningList warnings={computed.warnings} />
            </article>
            <article className="balance-card">
              <div className="balance-card__head">
                <span>Baseline</span>
                <strong>CR {computed.targetCr}</strong>
              </div>
              <div className="compiled-meta-grid balance-meta-grid">
                <CompiledMeta label="Ruleset" value={computed.ruleset?.label || computed.rulesetId || "D&D 5E 2024"} />
                <CompiledMeta label="Abilities" value={`${computed.abilityModel?.total ?? 0} / ${computed.abilityModel?.damaging ?? 0} dmg`} />
                <CompiledMeta label="AC" value={`${computed.ac} / ${computed.baseline.ac}`} />
                <CompiledMeta label="HP" value={`${computed.hp} / ${computed.baseline.hp}`} />
                <CompiledMeta
                  label="DPR"
                  value={`${computed.effectiveProfile.effectiveDpr3Round} / ${computed.baseline.dpr}`}
                />
                <CompiledMeta
                  label="Attack"
                  value={`${modText(computed.attack)} / ${modText(computed.baseline.attackBonus)}`}
                />
                <CompiledMeta label="DC" value={`${computed.dc} / ${computed.baseline.saveDc}`} />
                <CompiledMeta label="Burst" value={computed.effectiveProfile.burstDpr} />
                <CompiledMeta
                  label="CR Split"
                  value={`${computed.crValidation?.defensive?.cr ?? "—"} / ${computed.crValidation?.offensive?.cr ?? "—"}`}
                />
                <CompiledMeta label="Est. CR" value={computed.crValidation?.estimatedCr ?? computed.estimatedCr} />
              </div>
            </article>
          </div>
        </details>
      </div>
    </section>
  );
}

export function RunModePanel({
  sheet,
  recommendations,
  onAction,
  onOpenComposer,
  onOpenBalance,
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
          <button type="button" onClick={onOpenBalance}>
            Balance
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
          <BalanceRecommendationList
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

function BalanceRecommendationList({ recommendations, onAction }) {
  if (!recommendations.length) {
    return (
      <div className="balance-recommendation balance-recommendation--ok">
        <Shield aria-hidden="true" />
        <div>
          <strong>No changes required</strong>
          <p>
            The monster is within the current pressure and complexity targets, and the counterplay
            audit is playable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="balance-recommendation-list">
      {recommendations.map((recommendation) => (
        <article
          key={recommendation.id}
          className={`balance-recommendation is-${recommendation.severity}`}
        >
          <AlertTriangle aria-hidden="true" />
          <div className="balance-recommendation__body">
            <span>{recommendation.severity}</span>
            <strong>{recommendation.title}</strong>
            <p>{recommendation.detail}</p>
            {recommendation.actions?.length > 0 && (
              <div className="balance-recommendation__actions">
                {recommendation.actions.map((action) => (
                  <button
                    key={`${recommendation.id}-${action.label}`}
                    type="button"
                    aria-label={action.label}
                    title={action.label}
                    onClick={() => onAction?.(action)}
                  >
                    {action.kind === "slot" ? "Go" : action.label}
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
    <details className="cruor-stat-block__designer-notes" open>
      <summary>Designer Notes</summary>
      <div>
        {notes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>
    </details>
  );
}

function StatBlockModeSwitch({ mode = "standard", onSetMode }) {
  const isCustom = mode === "custom";

  return (
    <div className="export-stat-mode-control" aria-label="Stat block mode">
      <span>Stat Block</span>
      <button
        className={`export-stat-mode-switch ${isCustom ? "is-custom" : "is-standard"}`}
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
  statBlock,
  exportReadiness,
  exportRunSheet,
  exportCopyStatus,
  statBlockMode = "standard",
  onSetStatBlockMode,
  onCopyExportPayload,
  onOpenBalance,
  viewToolbar,
  liveExportButton,
}) {
  return (
    <section className="export-workbench" aria-label="Monster export">
      <div className="export-layout">
        <section className="panel table-view export-stat-preview">
          <RenderedStatBlock statBlock={statBlock} liveExportButton={liveExportButton} />
        </section>
        <aside className="panel export-console" aria-label="Export console">
          {viewToolbar}
          <div className="export-console__head">
            <h2>Table Handoff</h2>
          </div>

          <StatBlockModeSwitch mode={statBlockMode} onSetMode={onSetStatBlockMode} />

          <ExportReadinessPanel readiness={exportReadiness} onOpenBalance={onOpenBalance} />

          <DesignerNotesPanel notes={statBlock.designerNotes} />

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

          <ExportRunSheet items={exportRunSheet} />

          <details className="export-raw-panel">
            <summary>Raw Export</summary>
            <div className="export-raw-panel__body">
              <div className="export-textarea-shell">
                <span>Stat Block Text</span>
                <textarea value={exportText} readOnly aria-label="Exported stat block text" />
              </div>
              <div className="export-textarea-shell">
                <span>Structured JSON</span>
                <textarea value={exportJson} readOnly aria-label="Exported monster JSON" />
              </div>
            </div>
          </details>
        </aside>
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

function ExportReadinessPanel({ readiness, onOpenBalance }) {
  return (
    <section
      className={`export-readiness-card ${readiness.ready ? "is-ready" : readiness.blockers.length ? "is-blocked" : "needs-review"}`}
      aria-label="Export readiness"
    >
      <div className="export-readiness-card__head">
        <div>
          <span>Export Readiness</span>
          <strong>{readiness.label}</strong>
        </div>
        <em>{readiness.percent}%</em>
      </div>
      <div className="export-readiness-meter" aria-hidden="true">
        <span style={{ width: `${readiness.percent}%` }} />
      </div>
      <div className="export-check-grid">
        {readiness.checks.map((check) => (
          <article
            key={check.id}
            className={`export-check ${check.ready ? "is-ready" : check.severity === "required" ? "is-blocked" : "needs-review"}`}
          >
            {check.ready ? <Shield aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
            <div>
              <strong>{check.label}</strong>
              <span>{check.detail}</span>
            </div>
          </article>
        ))}
      </div>
      {!readiness.ready && onOpenBalance && (
        <button className="export-review-btn" type="button" onClick={onOpenBalance}>
          Review Balance Recommendations
        </button>
      )}
    </section>
  );
}

function ExportRunSheet({ items }) {
  return (
    <section className="export-run-sheet" aria-label="DM run sheet">
      <div className="export-run-sheet__head">
        <span>DM Run Sheet</span>
        <strong>Fast Reference</strong>
      </div>
      <div className="export-run-sheet__grid">
        {items.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
