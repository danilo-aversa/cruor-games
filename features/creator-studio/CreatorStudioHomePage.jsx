import {
  StudioButton,
  StudioIcon,
  StudioPanelTitle,
  StudioStatusBadge,
} from "../inspiration-studio/ui/index.js";

const CALENDAR_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function buildCalendarDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return [
    ...CALENDAR_LABELS.map((label) => ({ label, type: "label" })),
    ...Array.from({ length: firstWeekday }, () => ({ label: "", type: "blank" })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      label: String(index + 1),
      type: "day",
    })),
  ];
}


const CURRENT_WORK = [
  {
    icon: "fa-tower-observation",
    title: "Towers of Silence",
    detail: "Inspiration dossier · editorial pass",
    status: "In Review",
  },
  {
    icon: "fa-flask-vial",
    title: "Decomposition",
    detail: "Dark Places components · ready",
    status: "Ready",
  },
  {
    icon: "fa-skull",
    title: "Mortuary Totems",
    detail: "Monster grafts · draft",
    status: "Draft",
  },
];

function CreatorWorkItem({ detail, icon, status, title }) {
  return (
    <article className="creator-studio-home__work-item cruor-ui-card-surface">
      <span className="creator-studio-home__work-icon" aria-hidden="true">
        <StudioIcon name={icon} />
      </span>
      <span className="creator-studio-home__work-copy">
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      <StudioStatusBadge status="neutral">{status}</StudioStatusBadge>
    </article>
  );
}

export default function CreatorStudioHomePage({
  onOpenContentStudio,
  onOpenOperations,
  onOpenPublishing,
}) {
  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);
  const monthLabel = new Intl.DateTimeFormat("en", { month: "long" }).format(today);
  const calendarDays = buildCalendarDays(today);
  const nextReleaseDate = new Date(today);
  nextReleaseDate.setDate(today.getDate() + 3);
  const nextReleaseLabel = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(nextReleaseDate);
  const eventDays = new Set([
    nextReleaseDate.getMonth() === today.getMonth()
      ? nextReleaseDate.getDate()
      : null,
    Math.min(today.getDate() + 6, new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()),
  ]);

  return (
    <section
      className="creator-studio-home inspiration-studio"
      aria-label="Creator Studio overview"
      data-creator-studio-home="true"
    >
      <div className="creator-studio-home__grid">
        <section className="studio-panel cruor-ui-panel-surface creator-studio-home__primary">
          <StudioPanelTitle
            eyebrow="Editorial Production"
            help="Open the existing authoring environment for Inspirations, Monster grafts, Dark Places components, validation, previews, and publishing readiness."
            icon="fa-pen-ruler"
            title="Content Studio"
          >
            <StudioStatusBadge status="success">Available</StudioStatusBadge>
          </StudioPanelTitle>

          <div className="creator-studio-home__primary-body">
            <div className="creator-studio-home__primary-copy">
              <p>
                Create and maintain the source-inspired content that powers Cruor.
                The current Content Studio remains the canonical editorial surface.
              </p>

              <div className="creator-studio-home__capabilities" aria-label="Content Studio capabilities">
                <StudioStatusBadge status="neutral" icon="fa-book-skull">
                  Inspirations
                </StudioStatusBadge>
                <StudioStatusBadge status="neutral" icon="fa-skull">
                  Monster Grafts
                </StudioStatusBadge>
                <StudioStatusBadge status="neutral" icon="fa-location-dot">
                  Dark Places
                </StudioStatusBadge>
                <StudioStatusBadge status="neutral" icon="fa-circle-check">
                  Validation
                </StudioStatusBadge>
              </div>

              <StudioButton
                className="creator-studio-home__primary-action"
                icon="fa-arrow-right"
                onClick={onOpenContentStudio}
              >
                Open Content Studio
              </StudioButton>
            </div>

            <div className="creator-studio-home__manuscript" aria-hidden="true">
              <span className="creator-studio-home__manuscript-bar" />
              <span className="creator-studio-home__manuscript-sigil">
                <StudioIcon name="fa-pen-ruler" />
              </span>
              <span className="creator-studio-home__manuscript-lines">
                <i />
                <i />
                <i />
                <i />
              </span>
              <strong>Editorial Draft</strong>
            </div>
          </div>
        </section>

        <section className="studio-panel cruor-ui-panel-surface creator-studio-home__calendar-panel">
          <StudioPanelTitle
            eyebrow="Publishing"
            help="Plan editorial seasons, adapt releases for Instagram and Facebook, inspect the feed, and complete the publication decision flow."
            icon="fa-calendar-days"
            title="Publishing"
          >
            <StudioStatusBadge status="success">Available</StudioStatusBadge>
            <StudioButton compact icon="fa-arrow-right" onClick={onOpenPublishing}>
              Open Publishing
            </StudioButton>
          </StudioPanelTitle>

          <div className="creator-studio-home__calendar-heading">
            <span>{monthLabel} <strong>{today.getFullYear()}</strong></span>
            <span className="creator-studio-home__date" aria-label={`Today, ${dateLabel}`}>
              <small>Today</small>
              <strong>{dateLabel}</strong>
            </span>
          </div>
          <div className="creator-studio-home__calendar" aria-label={`${monthLabel} ${today.getFullYear()} publication calendar preview`}>
            {calendarDays.map((day, index) => {
              const dayNumber = day.type === "day" ? Number(day.label) : null;
              const isCurrent = dayNumber === today.getDate();
              const isEvent = dayNumber !== null && eventDays.has(dayNumber);
              return (
                <span
                  className={[
                    day.type === "label" ? "is-label" : "",
                    isCurrent ? "is-current" : "",
                    isEvent ? "is-event" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={`${day.type}-${day.label || "blank"}-${index}`}
                >
                  {day.label}
                </span>
              );
            })}
          </div>
          <div className="creator-studio-home__next-release">
            <span>{nextReleaseLabel}</span>
            <div>
              <strong>Towers of Silence — Post 01</strong>
              <small>Instagram carousel · content review</small>
            </div>
          </div>
        </section>

        <section className="studio-panel cruor-ui-panel-surface creator-studio-home__work-panel">
          <StudioPanelTitle
            eyebrow="Editorial Queue"
            help="A compact view of the content currently moving through the authoring and review workflow."
            icon="fa-list-check"
            title="Current Work"
          />
          <div className="creator-studio-home__work-list">
            {CURRENT_WORK.map((item) => (
              <CreatorWorkItem key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section className="studio-panel cruor-ui-panel-surface creator-studio-home__insights-panel">
          <StudioPanelTitle
            eyebrow="Performance"
            help="Insights will combine publishing performance, content engagement, conversion signals, and channel comparisons."
            icon="fa-chart-line"
            title="Insights"
          >
            <StudioStatusBadge status="neutral">Preview</StudioStatusBadge>
          </StudioPanelTitle>
          <div className="creator-studio-home__insight-grid">
            <article className="cruor-ui-card-surface">
              <strong>12.8k</strong>
              <span>Reach</span>
            </article>
            <article className="cruor-ui-card-surface">
              <strong>7.4%</strong>
              <span>Engagement</span>
            </article>
            <article className="cruor-ui-card-surface">
              <strong>+18%</strong>
              <span>Growth</span>
            </article>
          </div>
          <div className="creator-studio-home__chart" aria-hidden="true">
            <svg viewBox="0 0 360 96" preserveAspectRatio="none">
              <path d="M0 80 C50 74 55 54 102 59 S164 37 205 45 S275 18 360 22" />
            </svg>
          </div>
        </section>

        <section className="studio-panel cruor-ui-panel-surface creator-studio-home__tools-panel">
          <StudioPanelTitle
            eyebrow="Suite"
            help="Global content health, coverage, ledgers, QA suites and audit exports live in the Operations workspace."
            icon="fa-toolbox"
            title="Workspace Tools"
          >
            <StudioButton icon="fa-arrow-right" onClick={onOpenOperations}>Open Operations</StudioButton>
          </StudioPanelTitle>
          <div className="creator-studio-home__tool-list">
            <div className="cruor-ui-card-surface">
              <StudioIcon name="fa-photo-film" />
              <span>
                <strong>Asset Library</strong>
                <small>Images, credits, exports</small>
              </span>
              <StudioStatusBadge status="neutral">Planned</StudioStatusBadge>
            </div>
            <div className="cruor-ui-card-surface">
              <StudioIcon name="fa-bullhorn" />
              <span>
                <strong>Channel Integrations</strong>
                <small>Connected accounts and direct scheduling</small>
              </span>
              <StudioStatusBadge status="neutral">Planned</StudioStatusBadge>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
