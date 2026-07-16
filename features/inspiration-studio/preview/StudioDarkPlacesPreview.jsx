import { useMemo, useState } from "react";
import { StudioIcon } from "../components/StudioIcon.jsx";
import {
  DEFAULT_STUDIO_PREVIEW_CONTROLS,
  STUDIO_PREVIEW_CONTEXTS,
  STUDIO_PREVIEW_INTRUSIONS,
  STUDIO_PREVIEW_OUTPUT_TABS,
  STUDIO_PREVIEW_ROOM_ROLES,
  compileStudioDarkPlacesPreview,
  nextStudioPreviewSeed,
  selectStudioPreviewRoom,
} from "../model/studio-dark-places-preview.js";

function PreviewBlockList({ blocks = [], emptyLabel }) {
  if (!blocks.length)
    return <p className="studio-preview-empty">{emptyLabel}</p>;
  return (
    <div className="studio-preview-blocks">
      {blocks.map((block) => (
        <article key={block.id}>
          <strong>
            {block.title || block.trigger || block.subtype || block.kind}
          </strong>
          <p>{block.text || block.summary || block.action || block.effect}</p>
          {block.counterplay ? (
            <small>Counterplay: {block.counterplay}</small>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function OverviewPreview({ document }) {
  return (
    <div className="studio-preview-output__grid">
      <section>
        <span>Place Identity</span>
        <h3>{document.meta.title}</h3>
        <p>{document.identity.historyParagraph}</p>
        <p>{document.identity.currentSituationParagraph}</p>
        <strong>{document.identity.playerEntryPoint}</strong>
      </section>
      <section>
        <span>Site Atmosphere</span>
        <PreviewBlockList
          blocks={document.siteWide.atmosphere}
          emptyLabel="No compiled atmosphere blocks."
        />
      </section>
      <section>
        <span>Global Rules</span>
        <PreviewBlockList
          blocks={document.siteWide.globalRules}
          emptyLabel="No compiled global rules."
        />
      </section>
      <section>
        <span>Recurring Signs</span>
        <PreviewBlockList
          blocks={document.siteWide.recurringSigns}
          emptyLabel="No compiled recurring signs."
        />
      </section>
    </div>
  );
}

function AtTheTablePreview({ document }) {
  const guide = document.sessionGuide;
  return (
    <div className="studio-preview-output__grid">
      <section>
        <span>Opening Beat</span>
        <h3>{guide.openingBeat.situation || "No opening situation."}</h3>
        <p>{guide.openingBeat.immediateSignal}</p>
        <strong>{guide.openingBeat.playerDecision}</strong>
      </section>
      <section>
        <span>Objectives</span>
        <ul>
          {guide.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </section>
      <section>
        <span>Pressure Tracks</span>
        <PreviewBlockList
          blocks={guide.pressureTracks}
          emptyLabel="No compiled pressure track."
        />
      </section>
      <section>
        <span>Stall Moves</span>
        <PreviewBlockList
          blocks={guide.stallMoves}
          emptyLabel="No compiled stall moves."
        />
      </section>
    </div>
  );
}

function RoomPreview({ document, selectedRole }) {
  const room = selectStudioPreviewRoom(document, selectedRole);
  if (!room)
    return <p className="studio-preview-empty">No room output compiled.</p>;
  return (
    <div className="studio-preview-room-layout">
      <nav aria-label="Compiled rooms">
        {document.rooms.map((entry) => (
          <span
            key={entry.id}
            data-selected={entry.id === room.id ? "true" : "false"}
          >
            {entry.number}. {entry.name}
          </span>
        ))}
      </nav>
      <article>
        <span>
          {room.role} · {room.shape}
        </span>
        <h3>
          {room.number}. {room.name}
        </h3>
        <blockquote>
          {room.readAloud.standard || "No standard Read-Aloud compiled."}
        </blockquote>
        <PreviewBlockList
          blocks={room.immediateImpressions}
          emptyLabel="No immediate impression."
        />
        <PreviewBlockList
          blocks={room.recurringSigns}
          emptyLabel="No recurring sign allocated."
        />
      </article>
    </div>
  );
}

function ProvenancePreview({ document }) {
  const sources = document.provenance?.sources || [];
  return (
    <aside className="studio-preview-provenance">
      <span>
        <StudioIcon name="fa-fingerprint" /> Compiled Provenance
      </span>
      {sources.length ? (
        <ul>
          {sources.map((source) => (
            <li key={`${source.sourceAnchorId}-${source.relation}`}>
              <strong>{source.sourceAnchorId}</strong> — {source.relation}
              {source.note ? `: ${source.note}` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p>No provenance sources.</p>
      )}
    </aside>
  );
}

export function StudioDarkPlacesPreview({ module, pack }) {
  const [controls, setControls] = useState(DEFAULT_STUDIO_PREVIEW_CONTROLS);
  const preview = useMemo(
    () => compileStudioDarkPlacesPreview({ pack, module, controls }),
    [controls, module, pack],
  );

  function setControl(field, value) {
    setControls((current) => ({ ...current, [field]: value }));
  }

  return (
    <div
      className="studio-dark-places-preview"
      data-preview-status={preview.status}
    >
      <section
        className="studio-preview-controls"
        aria-label="Dark Places preview controls"
      >
        <label>
          <span>Seed</span>
          <input
            value={controls.seed}
            onChange={(event) => setControl("seed", event.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() =>
            setControl("seed", nextStudioPreviewSeed(controls.seed))
          }
        >
          <StudioIcon name="fa-rotate" /> Regenerate Seed
        </button>
        <label>
          <span>Context</span>
          <select
            value={controls.context}
            onChange={(event) => setControl("context", event.target.value)}
          >
            {STUDIO_PREVIEW_CONTEXTS.map((context) => (
              <option key={context}>{context}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Intrusion</span>
          <select
            value={controls.intrusion}
            onChange={(event) => setControl("intrusion", event.target.value)}
          >
            {STUDIO_PREVIEW_INTRUSIONS.map((intrusion) => (
              <option key={intrusion}>{intrusion}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Room Count</span>
          <input
            type="number"
            min="1"
            max="12"
            value={controls.roomCount}
            onChange={(event) =>
              setControl("roomCount", Number(event.target.value))
            }
          />
        </label>
        <label>
          <span>Selected Room Role</span>
          <select
            value={controls.selectedRoomRole}
            onChange={(event) =>
              setControl("selectedRoomRole", event.target.value)
            }
          >
            {STUDIO_PREVIEW_ROOM_ROLES.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <label className="studio-preview-controls__toggle">
          <input
            type="checkbox"
            checked={controls.showProvenance}
            onChange={(event) =>
              setControl("showProvenance", event.target.checked)
            }
          />
          <span>Show Provenance</span>
        </label>
        <label className="studio-preview-controls__toggle">
          <input
            type="checkbox"
            checked={controls.showValidationIssues}
            onChange={(event) =>
              setControl("showValidationIssues", event.target.checked)
            }
          />
          <span>Show Validation Issues</span>
        </label>
      </section>

      <header className="studio-preview-status">
        <span>
          <StudioIcon
            name={
              preview.status === "ready" ? "fa-circle-check" : "fa-circle-xmark"
            }
          />{" "}
          {preview.status}
        </span>
        <strong>{module?.title || "Untitled Module"}</strong>
        <em>
          {preview.fingerprint
            ? `Deterministic fingerprint ${preview.fingerprint}`
            : "Compilation unavailable"}
        </em>
      </header>

      <nav
        className="studio-preview-tabs"
        role="tablist"
        aria-label="Preview output tabs"
      >
        {STUDIO_PREVIEW_OUTPUT_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={controls.outputTab === tab}
            onClick={() => setControl("outputTab", tab)}
          >
            {tab.replace(/-/g, " ")}
          </button>
        ))}
      </nav>

      {preview.document ? (
        <section className="studio-preview-output">
          {controls.outputTab === "overview" ? (
            <OverviewPreview document={preview.document} />
          ) : null}
          {controls.outputTab === "at-the-table" ? (
            <AtTheTablePreview document={preview.document} />
          ) : null}
          {controls.outputTab === "rooms" ? (
            <RoomPreview
              document={preview.document}
              selectedRole={controls.selectedRoomRole}
            />
          ) : null}
          {controls.showProvenance ? (
            <ProvenancePreview document={preview.document} />
          ) : null}
        </section>
      ) : null}

      {controls.showValidationIssues && preview.diagnostics.length ? (
        <section
          className="studio-preview-diagnostics"
          aria-label="Preview validation issues"
        >
          <h3>Compiler Diagnostics</h3>
          {preview.diagnostics.map((issue, index) => (
            <article
              key={`${issue.code}-${issue.path}-${index}`}
              data-severity={issue.severity}
            >
              <strong>{issue.message}</strong>
              <span>{issue.path}</span>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
