import {
  ToolButton,
  ToolContentPanel,
  ToolFeatureBlock,
} from "../../../../components/ui/tool-content-panel.jsx";

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function formatRoomNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0
    ? String(number).padStart(2, "0")
    : "—";
}

function formatLevel(value) {
  const level = Number(value);
  if (!Number.isFinite(level) || level === 0) return "Ground";
  return level > 0 ? `Level +${level}` : `Level ${level}`;
}

function PressureTrack({ track, value, onChange }) {
  const dashboard = track.metadata?.dashboard || {};
  const minimum = Number(dashboard.minimum ?? 0);
  const maximum = Number(dashboard.maximum ?? minimum);
  const thresholds = asArray(dashboard.thresholds);
  const activeThresholds = thresholds.filter(
    (threshold) => Number(threshold.at) <= value,
  );
  const currentConsequence =
    activeThresholds.at(-1)?.effect || "No threshold consequence is active.";

  return (
    <article
      className="location-session-pressure"
      data-pressure-track-id={track.id}
      data-pressure-value={value}
    >
      <header>
        <div>
          <h4>{dashboard.label || track.title || track.id}</h4>
          <p>{track.text}</p>
        </div>
        <output
          aria-live="polite"
          aria-label={`${dashboard.label || track.title} current value`}
        >
          {value}
          <small> / {maximum}</small>
        </output>
      </header>
      <div
        className="location-session-pressure__controls"
        role="group"
        aria-label={`${dashboard.label || track.title} controls`}
      >
        <button
          className="cruor-square-icon-button"
          type="button"
          aria-label={`Decrease ${dashboard.label || track.title}`}
          disabled={value <= minimum}
          onClick={() => onChange(track.id, -1)}
        >
          <i className="fa-solid fa-minus" aria-hidden="true" />
        </button>
        <meter
          min={minimum}
          max={maximum}
          value={value}
          aria-label={`${dashboard.label || track.title}: ${value} of ${maximum}`}
        />
        <button
          className="cruor-square-icon-button"
          type="button"
          aria-label={`Increase ${dashboard.label || track.title}`}
          disabled={value >= maximum}
          onClick={() => onChange(track.id, 1)}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />
        </button>
      </div>
      <p className="location-session-pressure__consequence" aria-live="polite">
        <strong>Current consequence.</strong> {currentConsequence}
      </p>
      {thresholds.length ? (
        <ol
          className="location-session-thresholds"
          aria-label={`${dashboard.label || track.title} thresholds`}
        >
          {thresholds.map((threshold) => {
            const active = Number(threshold.at) <= value;
            return (
              <li className={active ? "is-active" : ""} key={threshold.at}>
                <b>{threshold.at}</b>
                <span>{threshold.effect}</span>
                <i
                  className={`fa-solid ${active ? "fa-circle-check" : "fa-circle"}`}
                  aria-label={active ? "Active" : "Inactive"}
                />
              </li>
            );
          })}
        </ol>
      ) : null}
      {track.counterplay ? (
        <p className="location-session-pressure__counterplay">
          <strong>Reduce or reset.</strong> {track.counterplay}
        </p>
      ) : null}
    </article>
  );
}

function AlwaysOnRules({ rules }) {
  if (!rules.length) return null;
  return (
    <ToolFeatureBlock label="Always On" className="location-session-panel">
      <div className="location-session-rule-list">
        {rules.map((rule) => (
          <article key={rule.id}>
            <h4>{rule.title}</h4>
            <p>{rule.text}</p>
            {rule.mechanics?.trigger ? (
              <p>
                <strong>Trigger.</strong> {rule.mechanics.trigger}
              </p>
            ) : null}
            {rule.mechanics?.savingThrow || rule.mechanics?.effect ? (
              <p>
                <strong>Resolution.</strong>{" "}
                {[rule.mechanics.savingThrow, rule.mechanics.effect]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </ToolFeatureBlock>
  );
}

function ClueFlow({ clueFlow, discoveredClueIds, onToggleClue }) {
  const discovered = new Set(discoveredClueIds);
  const nodes = asArray(clueFlow?.nodes);
  if (!nodes.length) return null;
  return (
    <ToolFeatureBlock label="Clue Flow" className="location-session-panel">
      <div className="location-session-clue-flow">
        {nodes.map((node) => {
          const checked = discovered.has(node.id);
          return (
            <article className={checked ? "is-discovered" : ""} key={node.id}>
              <button
                className="location-session-clue-toggle cruor-composer-control"
                type="button"
                aria-pressed={checked}
                aria-label={`${checked ? "Mark undiscovered" : "Mark discovered"}: ${node.title}`}
                onClick={() => onToggleClue(node.id)}
              >
                <i
                  className={`fa-solid ${checked ? "fa-circle-check" : "fa-circle"}`}
                  aria-hidden="true"
                />
                <span>
                  <strong>{node.title}</strong>
                  <small>{node.summary}</small>
                </span>
              </button>
              {asArray(node.evidence).length ? (
                <ul>
                  {node.evidence
                    .filter(
                      (entry, index, values) =>
                        values.findIndex(
                          (candidate) => candidate.roomId === entry.roomId,
                        ) === index,
                    )
                    .map((entry) => (
                      <li key={`${node.id}-${entry.roomId}`}>
                        {formatRoomNumber(entry.roomNumber)} · {entry.roomName}
                      </li>
                    ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
      {asArray(clueFlow.links).length ? (
        <ol
          className="location-session-clue-links"
          aria-label="Revelation dependencies"
        >
          {clueFlow.links.map((link) => (
            <li key={link.id}>
              <b>{cleanText(link.from).replace(/-revelation$/, "")}</b>
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              <b>{cleanText(link.to).replace(/-revelation$/, "")}</b>
              {link.condition ? <span>{link.condition}</span> : null}
            </li>
          ))}
        </ol>
      ) : null}
      {asArray(clueFlow.fallbackClues).length ? (
        <div className="location-session-fallback-clues">
          <strong>Fallback clues</strong>
          <ul>
            {clueFlow.fallbackClues.map((clue) => (
              <li key={clue.id}>{clue.text}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </ToolFeatureBlock>
  );
}

function StallMoves({ moves }) {
  if (!moves.length) return null;
  return (
    <ToolFeatureBlock
      label="When They Stall"
      className="location-session-panel"
    >
      <ol className="location-session-stall-moves">
        {moves.map((move) => (
          <li key={move.id}>
            <span>{move.trigger}</span>
            <strong>{move.action}</strong>
          </li>
        ))}
      </ol>
    </ToolFeatureBlock>
  );
}

function RoomShortcuts({ shortcuts, onSelectRoom }) {
  if (!shortcuts.length) return null;
  return (
    <ToolFeatureBlock
      label="Room Shortcuts"
      className="location-session-panel location-session-panel--wide"
    >
      <div className="location-session-shortcuts">
        {shortcuts.map((shortcut) => (
          <button
            className="location-session-shortcut cruor-composer-control"
            type="button"
            key={shortcut.id}
            aria-label={`Open room ${formatRoomNumber(shortcut.number)} ${shortcut.name}`}
            onClick={() => onSelectRoom(shortcut.roomId)}
          >
            <b>{formatRoomNumber(shortcut.number)}</b>
            <span>
              <strong>{shortcut.name}</strong>
              <small>
                {shortcut.role} · {formatLevel(shortcut.level)}
                {shortcut.escalation ? " · Escalation" : ""}
              </small>
              {shortcut.signal ? <em>{shortcut.signal}</em> : null}
            </span>
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        ))}
      </div>
    </ToolFeatureBlock>
  );
}

export function LocationAtTheTableDashboard({
  guide = {},
  sessionState = {},
  persistenceEnabled = false,
  onChangePressure,
  onResetSession,
  onSelectRoom,
  onToggleClue,
  onTogglePersistence,
}) {
  const opening = guide.openingBeat || {};
  const pressureTracks = asArray(guide.pressureTracks);
  const alwaysOnRules = asArray(guide.alwaysOnRules);
  const objectives = asArray(guide.objectives);

  return (
    <ToolContentPanel
      className="location-output-document-view location-session-dashboard"
      data-testid="dark-places-output-table"
      eyebrow="Final Output"
      title="At the Table"
      summary="Operational session guidance. Changes here never modify the generated location."
    >
      <ToolFeatureBlock label="Start Here" className="location-session-start">
        <div className="location-session-opening">
          <p>
            <strong>Situation.</strong> {opening.situation}
          </p>
          <p>
            <strong>Immediate signal.</strong> {opening.immediateSignal}
          </p>
          <p>
            <strong>Player decision.</strong> {opening.playerDecision}
          </p>
        </div>
        {objectives.length ? (
          <div className="location-session-objectives">
            <strong>Immediate objectives</strong>
            <ol>
              {objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ol>
          </div>
        ) : null}
      </ToolFeatureBlock>

      <div className="location-session-grid">
        {pressureTracks.length ? (
          <ToolFeatureBlock
            label="Active Pressure"
            className="location-session-panel"
          >
            <div className="location-session-pressure-list">
              {pressureTracks.map((track) => (
                <PressureTrack
                  key={track.id}
                  track={track}
                  value={Number(
                    sessionState.pressureValues?.[track.id] ??
                      track.metadata?.dashboard?.initial ??
                      0,
                  )}
                  onChange={onChangePressure}
                />
              ))}
            </div>
          </ToolFeatureBlock>
        ) : null}
        <AlwaysOnRules rules={alwaysOnRules} />
        <ClueFlow
          clueFlow={guide.clueFlow}
          discoveredClueIds={asArray(sessionState.discoveredClueIds)}
          onToggleClue={onToggleClue}
        />
        <StallMoves moves={asArray(guide.stallMoves)} />
        <RoomShortcuts
          shortcuts={asArray(guide.roomShortcuts)}
          onSelectRoom={onSelectRoom}
        />
      </div>

      <footer
        className="location-session-actions"
        aria-label="Session controls"
      >
        <label>
          <input
            type="checkbox"
            checked={persistenceEnabled}
            onChange={(event) => onTogglePersistence(event.target.checked)}
          />
          <span>Remember this session for this build</span>
        </label>
        <ToolButton
          icon="fa-rotate-left"
          iconPosition="start"
          onClick={onResetSession}
        >
          Reset Session
        </ToolButton>
      </footer>
    </ToolContentPanel>
  );
}
