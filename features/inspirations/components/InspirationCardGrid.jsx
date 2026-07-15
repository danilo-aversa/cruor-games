import InspirationCard from "./InspirationCard.jsx";

export default function InspirationCardGrid({
  cards,
  flippedCardId,
  onToggleCard,
  onOpenDossier,
  locale = "en",
}) {
  return (
    <div className="inspirations-page__grid">
      {cards.map((card) => (
        <InspirationCard
          key={card.inspiration.id}
          inspiration={card.inspiration}
          meta={card.meta}
          sourceType={card.sourceType}
          isFlipped={flippedCardId === card.inspiration.id}
          onToggle={() => onToggleCard(card.inspiration.id)}
          onOpenDossier={() => onOpenDossier(card.inspiration.id)}
          locale={locale}
        />
      ))}
    </div>
  );
}
