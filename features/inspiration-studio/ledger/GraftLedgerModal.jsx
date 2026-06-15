import { StudioToolModalShell } from "../components/StudioToolModalShell.jsx";
import { GraftLedgerWorkspace } from "./GraftLedgerWorkspace.jsx";

export function GraftLedgerModal({ draftGrafts = [], isOpen = false, libraryGrafts = [], onClose }) {
  return (
    <StudioToolModalShell
      className="studio-global-modal--graft-ledger"
      icon="fa-table-list"
      id="studio-graft-ledger-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Monster Graft Ledger"
      subtitle="Global inventory, analytics, gaps, and downloadable report across the whole Studio."
    >
      <GraftLedgerWorkspace draftGrafts={draftGrafts} libraryGrafts={libraryGrafts} />
    </StudioToolModalShell>
  );
}
