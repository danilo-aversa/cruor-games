export const INSPIRATION_DOMAIN_ORDER = Object.freeze([
  "tale",
  "place",
  "body",
  "relic",
  "violence",
  "rite",
]);

export const INSPIRATION_DOMAINS = Object.freeze({
  tale: Object.freeze({
    id: "tale",
    symbol: "✦",
    labelKey: "inspirations.domains.tale",
  }),
  place: Object.freeze({
    id: "place",
    symbol: "◇",
    labelKey: "inspirations.domains.place",
  }),
  body: Object.freeze({
    id: "body",
    symbol: "◈",
    labelKey: "inspirations.domains.body",
  }),
  relic: Object.freeze({
    id: "relic",
    symbol: "⬢",
    labelKey: "inspirations.domains.relic",
  }),
  violence: Object.freeze({
    id: "violence",
    symbol: "✢",
    labelKey: "inspirations.domains.violence",
  }),
  rite: Object.freeze({
    id: "rite",
    symbol: "☉",
    labelKey: "inspirations.domains.rite",
  }),
});

export const INSPIRATION_OBSCURITY_ORDER = Object.freeze([
  "familiar",
  "uncommon",
  "esoteric",
]);

export const INSPIRATION_OBSCURITY = Object.freeze({
  familiar: Object.freeze({
    id: "familiar",
    symbol: "●",
    labelKey: "inspirations.obscurity.familiar",
  }),
  uncommon: Object.freeze({
    id: "uncommon",
    symbol: "◆",
    labelKey: "inspirations.obscurity.uncommon",
  }),
  esoteric: Object.freeze({
    id: "esoteric",
    symbol: "✦",
    labelKey: "inspirations.obscurity.esoteric",
  }),
});

const DOMAIN_BY_SOURCE_TYPE = Object.freeze({
  "animal behavior": "body",
  "biological process": "body",
  "funerary practice": "rite",
  "historical object": "relic",
  "historical site": "place",
  "literary inspiration": "tale",
  "medical / genetic concept": "body",
  "punitive practice": "violence",
  weapon: "violence",
  "yokai / japanese folklore": "tale",
});

function asPositiveInteger(value, fallbackValue) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? Math.trunc(parsed)
    : fallbackValue;
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function inferDomain(inspiration) {
  const sourceType = normalizeId(
    inspiration?.inspiration?.sourceType || inspiration?.sourceTypes?.[0],
  );
  return DOMAIN_BY_SOURCE_TYPE[sourceType] || "tale";
}

export function formatInspirationCardNumber(value) {
  return String(asPositiveInteger(value, 0)).padStart(3, "0");
}

export function getInspirationCardMeta(
  inspiration,
  { fallbackNumber = 1, collectionLabel = "Existing Inspirations" } = {},
) {
  const authored = inspiration?.card || {};
  const domainId = INSPIRATION_DOMAINS[normalizeId(authored.domain)]
    ? normalizeId(authored.domain)
    : inferDomain(inspiration);
  const obscurityId = INSPIRATION_OBSCURITY[normalizeId(authored.obscurity)]
    ? normalizeId(authored.obscurity)
    : "uncommon";
  const number = asPositiveInteger(authored.number, fallbackNumber);

  return Object.freeze({
    domainId,
    domain: INSPIRATION_DOMAINS[domainId],
    obscurityId,
    obscurity: INSPIRATION_OBSCURITY[obscurityId],
    collectionId: String(authored.collectionId || "existing-inspirations"),
    collectionLabel: String(authored.collectionLabel || collectionLabel),
    number,
    numberLabel: formatInspirationCardNumber(number),
    description: String(
      authored.description ||
        inspiration?.caption ||
        inspiration?.summary ||
        inspiration?.narrative ||
        "",
    ).trim(),
  });
}
