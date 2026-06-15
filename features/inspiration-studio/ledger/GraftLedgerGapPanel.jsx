import { StudioIcon } from "../components/StudioIcon.jsx";

export function GraftLedgerGapPanel({ gaps = [] }) {
  return (
    <div className="studio-ledger-gap-list" role="list">
      {gaps.map((gap) => (
        <article className={`studio-ledger-gap studio-ledger-gap--${gap.severity}`} key={gap.id} role="listitem">
          <span><StudioIcon name={gap.severity === "error" ? "fa-circle-xmark" : gap.severity === "warning" ? "fa-triangle-exclamation" : "fa-circle-info"} /></span>
          <div>
            <strong>{gap.title}</strong>
            <p>{gap.detail}</p>
          </div>
        </article>
      ))}
      {!gaps.length ? (
        <div className="studio-validation-clean">
          <StudioIcon name="fa-circle-check" />
          <strong>No editorial gaps detected.</strong>
          <span>The current graft library has enough baseline coverage for this audit pass.</span>
        </div>
      ) : null}
    </div>
  );
}
