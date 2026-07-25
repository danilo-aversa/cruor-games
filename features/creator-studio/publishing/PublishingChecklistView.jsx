import { useMemo, useState } from "react";
import {
  StudioButton,
  StudioIcon,
  StudioPanelTitle,
  StudioStatusBadge,
} from "../../inspiration-studio/ui/index.js";
import { PUBLICATION_FLOW } from "./publishing.data.js";

function FlowIndex({ blocked, complete, currentIndex }) {
  return (
    <aside className="creator-publishing__flow-index studio-panel cruor-ui-panel-surface" aria-label="Publication flow">
      <div className="studio-library-panel__topline">
        <span className="studio-library-panel__title">
          <StudioIcon name="fa-route" />
          <span>Publication Flow</span>
        </span>
      </div>
      <div className="studio-library-list">
        {PUBLICATION_FLOW.map((step, index) => {
          const isComplete = complete.has(index);
          const isCurrent = index === currentIndex;
          const state = isComplete
            ? "Passed"
            : isCurrent && blocked
              ? "Action Required"
              : isCurrent
                ? "Current Decision"
                : "Pending";

          return (
            <div
              className={`creator-publishing__flow-index-item${isCurrent ? " is-active" : ""}${isComplete ? " is-complete" : ""}${isCurrent && blocked ? " is-blocked" : ""}`}
              key={step.title}
            >
              <span>{isComplete ? <StudioIcon name="fa-check" /> : index + 1}</span>
              <span><strong>{step.title}</strong><small>{state}</small></span>
            </div>
          );
        })}
        <div className={`creator-publishing__flow-index-item${currentIndex >= PUBLICATION_FLOW.length ? " is-complete" : ""}`}>
          <span><StudioIcon name="fa-paper-plane" /></span>
          <span><strong>Ready to Publish</strong><small>{currentIndex >= PUBLICATION_FLOW.length ? "Approved" : "Locked"}</small></span>
        </div>
      </div>
    </aside>
  );
}

export default function PublishingChecklistView({ onOpenView }) {
  const [flowIndex, setFlowIndex] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [complete, setComplete] = useState(() => new Set());
  const finished = flowIndex >= PUBLICATION_FLOW.length;
  const progress = Math.round((Math.min(flowIndex, PUBLICATION_FLOW.length) / PUBLICATION_FLOW.length) * 100);
  const step = PUBLICATION_FLOW[flowIndex];
  const completeCount = useMemo(() => complete.size, [complete]);

  function reset() {
    setFlowIndex(0);
    setBlocked(false);
    setComplete(new Set());
  }

  function passCurrent() {
    setComplete((current) => new Set([...current, flowIndex]));
    setFlowIndex((current) => current + 1);
    setBlocked(false);
  }

  function goBack() {
    if (flowIndex <= 0) return;
    const previous = flowIndex - 1;
    setFlowIndex(previous);
    setComplete((current) => {
      const next = new Set(current);
      next.delete(previous);
      return next;
    });
    setBlocked(false);
  }

  return (
    <section className="creator-publishing__view creator-publishing__checklist-view" aria-label="Publication decision flow">
      <section className="studio-panel cruor-ui-panel-surface">
        <StudioPanelTitle
          eyebrow="Publication Decision Flow"
          help="Review evidence, framing, assets, platform variants, mobile rendering and scheduling before approving a release."
          icon="fa-route"
          title="Can This Release Be Published?"
        >
          <StudioStatusBadge status={finished ? "success" : blocked ? "danger" : "neutral"}>
            {finished ? "Approved" : blocked ? "Blocked" : `${completeCount}/${PUBLICATION_FLOW.length} Passed`}
          </StudioStatusBadge>
        </StudioPanelTitle>
      </section>

      <div className="creator-publishing__checklist-layout">
        <FlowIndex blocked={blocked} complete={complete} currentIndex={flowIndex} />

        <main className="creator-publishing__flow-workspace">
          <div className="creator-publishing__flow-progress studio-panel cruor-ui-panel-surface">
            <span>{finished ? "Review Complete" : `Decision ${flowIndex + 1} of ${PUBLICATION_FLOW.length}`}</span>
            <span className="creator-publishing__flow-progress-bar" aria-label={`${progress}% complete`}>
              <i style={{ width: `${progress}%` }} />
            </span>
            <StudioButton compact icon="fa-rotate-left" onClick={reset}>Restart</StudioButton>
          </div>

          {finished ? (
            <section className="creator-publishing__ready-card studio-panel cruor-ui-panel-surface">
              <span><StudioIcon name="fa-paper-plane" /></span>
              <StudioStatusBadge status="success">Final Outcome</StudioStatusBadge>
              <h3>Ready to Publish</h3>
              <p>The editorial brief, evidence, cultural framing, assets, platform variants, mobile QA and publication package have all passed review.</p>
              <StudioButton icon="fa-rotate-left" onClick={reset}>Review Another Release</StudioButton>
            </section>
          ) : blocked ? (
            <section className="studio-panel cruor-ui-panel-surface creator-publishing__flow-card is-blocked">
              <StudioPanelTitle eyebrow="Troubleshooting Branch" icon="fa-triangle-exclamation" title={step.fixTitle}>
                <StudioStatusBadge status="danger">Publication Blocked</StudioStatusBadge>
              </StudioPanelTitle>
              <p>Complete these actions before answering the decision again.</p>
              <ol className="creator-publishing__rules-list">
                {step.fixes.map((fix) => <li key={fix}>{fix}</li>)}
              </ol>
              <div className="creator-publishing__flow-actions">
                <StudioButton icon="fa-check" onClick={() => setBlocked(false)} variant="primary">Resolved — Recheck</StudioButton>
                <StudioButton icon="fa-arrow-up-right-from-square" onClick={() => onOpenView(step.target)}>{step.targetLabel}</StudioButton>
                {flowIndex > 0 ? <StudioButton icon="fa-arrow-left" onClick={goBack}>Previous Decision</StudioButton> : null}
              </div>
            </section>
          ) : (
            <section className="studio-panel cruor-ui-panel-surface creator-publishing__flow-card">
              <StudioPanelTitle eyebrow={`Decision ${flowIndex + 1}`} icon="fa-circle-question" title={step.title} />
              <p className="creator-publishing__flow-question">{step.question}</p>
              <p>{step.why}</p>
              <div className="creator-publishing__flow-actions">
                <StudioButton icon="fa-check" onClick={passCurrent} variant="primary">Yes — Continue</StudioButton>
                <StudioButton icon="fa-xmark" onClick={() => setBlocked(true)}>No — Troubleshoot</StudioButton>
                {flowIndex > 0 ? <StudioButton icon="fa-arrow-left" onClick={goBack}>Previous Decision</StudioButton> : null}
              </div>
            </section>
          )}
        </main>
      </div>
    </section>
  );
}
