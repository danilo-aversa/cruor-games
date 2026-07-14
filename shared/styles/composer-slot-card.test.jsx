import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ComposerSlotCard } from "../../components/ui/composer-slot-card.jsx";

function TestIcon(props) {
  return <svg {...props} data-testid="slot-icon" />;
}

describe("ComposerSlotCard", () => {
  it("renders the canonical slot-card structure and forwards feature hooks", () => {
    const html = renderToStaticMarkup(
      <ComposerSlotCard
        icon={TestIcon}
        label="Environmental Hazard"
        value="—"
        contentTitle="Empty Slot"
        description="A mechanical danger tied to the place."
        active
        className="is-missing is-suggested"
        data-testid="dark-places-room-slot"
        data-room-slot-id="hazard"
      />,
    );

    expect(html).toContain(
      'class="cruor-composer-slot-card is-empty is-active is-missing is-suggested"',
    );
    expect(html).toContain('class="cruor-composer-slot-card__head"');
    expect(html).toContain('class="cruor-composer-slot-card__body"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('data-room-slot-id="hazard"');
    expect(html).toContain("Environmental Hazard");
    expect(html).toContain("A mechanical danger tied to the place.");
  });

  it("uses the filled state without requiring feature-specific visual classes", () => {
    const html = renderToStaticMarkup(
      <ComposerSlotCard
        label="Body"
        value="2"
        contentTitle="Corpse Vessel"
        description="What the creature physically is."
        filled
      />,
    );

    expect(html).toContain('class="cruor-composer-slot-card is-filled"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain("monster-silhouette-slot-card");
    expect(html).not.toContain("location-room-inspector-slot");
  });
});
