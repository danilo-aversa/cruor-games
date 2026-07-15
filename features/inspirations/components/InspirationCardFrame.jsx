export const INSPIRATION_CARD_FRAME_VIEWBOX = "-8 -8 556 697";
export const INSPIRATION_CARD_FRAME_PATH =
  "M509.5.5v20h20v-10h-10v20h20v620h-20v20h10v-10h-20v20H30.5v-20H10.5v10h10v-20H.5V30.5h20V10.5h-10v10h20V.5H509.5Z";

export default function InspirationCardFrame({ className = "" } = {}) {
  return (
    <svg
      className={`inspiration-card__frame ${className}`.trim()}
      viewBox={INSPIRATION_CARD_FRAME_VIEWBOX}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={INSPIRATION_CARD_FRAME_PATH} />
    </svg>
  );
}
