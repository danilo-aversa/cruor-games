import {
  StudioIcon,
  StudioPanelTitle,
  StudioSection,
} from "../../inspiration-studio/ui/index.js";

function RulesList({ items }) {
  return (
    <ol className="creator-publishing__rules-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ol>
  );
}

export default function PublishingGuidelinesView({ mode, rules }) {
  const isEditorial = mode === "editorial";

  return (
    <section
      className="creator-publishing__view creator-publishing__guidelines-view"
      aria-label={isEditorial ? "Editorial contract" : "Publishing system"}
    >
      <section className="studio-panel cruor-ui-panel-surface">
        <StudioPanelTitle
          eyebrow={isEditorial ? "Writing Rules" : "Operating Rules"}
          help={
            isEditorial
              ? "Rules for research framing, platform adaptation, tone, structure and visual authorship."
              : "Scheduling, cadence, cross-platform coordination and workload rules for one social season."
          }
          icon={isEditorial ? "fa-pen-ruler" : "fa-clock"}
          title={isEditorial ? "Editorial Contract" : "Publishing System"}
        />

        {rules.sequence ? (
          <div className="creator-publishing__teach-sequence">
            {rules.sequence.map((step, index) => (
              <article className="creator-studio-home__work-item cruor-ui-card-surface" key={step.title}>
                <span className="creator-studio-home__work-icon" aria-hidden="true">
                  <strong>{index + 1}</strong>
                </span>
                <span className="creator-studio-home__work-copy">
                  <strong>{step.title.replace(/^\d+\.\s*/, "")}</strong>
                  <small>{step.text}</small>
                </span>
              </article>
            ))}
          </div>
        ) : null}

        {rules.summary ? (
          <div className="creator-studio-home__insight-grid creator-publishing__rule-summary">
            {rules.summary.map((item) => (
              <article className="cruor-ui-card-surface" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
                <small>{item.detail}</small>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <div className="studio-form-grid creator-publishing__rules-grid">
        {rules.sections.map((section) => (
          <StudioSection
            icon={section.icon}
            key={section.title}
            title={section.title}
          >
            <RulesList items={section.items} />
          </StudioSection>
        ))}
      </div>

      <section className="studio-panel cruor-ui-panel-surface creator-publishing__source-note">
        <StudioIcon name="fa-circle-info" />
        <p>
          These rules were transposed from the Publishing MVP and remain local operational guidance. They do not publish content or connect social accounts yet.
        </p>
      </section>
    </section>
  );
}
