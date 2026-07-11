export const ROOM_ARCHETYPE_SCHEMA_VERSION = "room-archetype-v0.2";

export const CRYPT_ROOM_ARCHETYPES = Object.freeze({
  "crypt-burial-cell": Object.freeze({
    id: "crypt-burial-cell",
    label: "Burial Cell",
    family: "crypt",
    contexts: Object.freeze(["crypt"]),
    shape: "rect",
    roomType: "none",
    maskProfile: "burial-cell",
    detailProfile: "burial-cell",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 3, maxW: 4, minH: 3, maxH: 4 }),
      Small: Object.freeze({ minW: 4, maxW: 5, minH: 3, maxH: 4 }),
      Medium: Object.freeze({ minW: 5, maxW: 6, minH: 4, maxH: 5 }),
      Large: Object.freeze({ minW: 6, maxW: 7, minH: 4, maxH: 5 }),
      Huge: Object.freeze({ minW: 7, maxW: 8, minH: 5, maxH: 6 }),
    }),
    motifs: Object.freeze(["tomb", "burial", "sealed dead"]),
  }),
  "ossuary-gallery": Object.freeze({
    id: "ossuary-gallery",
    label: "Ossuary Gallery",
    family: "crypt",
    contexts: Object.freeze(["crypt", "chapel"]),
    shape: "alcove",
    roomType: "alcove",
    maskProfile: "ossuary-gallery",
    detailProfile: "ossuary-gallery",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 5, maxW: 6, minH: 3, maxH: 4 }),
      Small: Object.freeze({ minW: 6, maxW: 7, minH: 4, maxH: 4 }),
      Medium: Object.freeze({ minW: 7, maxW: 9, minH: 4, maxH: 5 }),
      Large: Object.freeze({ minW: 9, maxW: 11, minH: 5, maxH: 6 }),
      Huge: Object.freeze({ minW: 11, maxW: 13, minH: 6, maxH: 7 }),
    }),
    motifs: Object.freeze(["bones", "alcoves", "display wall"]),
  }),
  "reliquary-niche": Object.freeze({
    id: "reliquary-niche",
    label: "Reliquary Niche",
    family: "crypt",
    contexts: Object.freeze(["crypt", "chapel"]),
    shape: "alcove",
    roomType: "alcove",
    maskProfile: "reliquary-niche",
    detailProfile: "reliquary-niche",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 3, maxW: 4, minH: 3, maxH: 4 }),
      Small: Object.freeze({ minW: 4, maxW: 5, minH: 3, maxH: 4 }),
      Medium: Object.freeze({ minW: 5, maxW: 6, minH: 4, maxH: 5 }),
      Large: Object.freeze({ minW: 6, maxW: 7, minH: 5, maxH: 6 }),
      Huge: Object.freeze({ minW: 7, maxW: 8, minH: 5, maxH: 7 }),
    }),
    motifs: Object.freeze(["reliquary", "niche", "devotional object"]),
  }),
  "charnel-vault": Object.freeze({
    id: "charnel-vault",
    label: "Charnel Vault",
    family: "crypt",
    contexts: Object.freeze(["crypt"]),
    shape: "notched",
    roomType: "alcove",
    maskProfile: "charnel-vault",
    detailProfile: "charnel-vault",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 5, maxW: 6, minH: 4, maxH: 5 }),
      Small: Object.freeze({ minW: 6, maxW: 7, minH: 5, maxH: 5 }),
      Medium: Object.freeze({ minW: 7, maxW: 9, minH: 5, maxH: 6 }),
      Large: Object.freeze({ minW: 9, maxW: 11, minH: 6, maxH: 8 }),
      Huge: Object.freeze({ minW: 11, maxW: 13, minH: 7, maxH: 9 }),
    }),
    motifs: Object.freeze(["charnel", "bone heap", "mass burial"]),
  }),
  "sealed-family-tomb": Object.freeze({
    id: "sealed-family-tomb",
    label: "Sealed Family Tomb",
    family: "crypt",
    contexts: Object.freeze(["crypt", "noble-house"]),
    shape: "rect",
    roomType: "none",
    maskProfile: "sealed-family-tomb",
    detailProfile: "sealed-family-tomb",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 4, maxW: 5, minH: 3, maxH: 4 }),
      Small: Object.freeze({ minW: 5, maxW: 6, minH: 4, maxH: 5 }),
      Medium: Object.freeze({ minW: 6, maxW: 8, minH: 5, maxH: 6 }),
      Large: Object.freeze({ minW: 8, maxW: 9, minH: 5, maxH: 7 }),
      Huge: Object.freeze({ minW: 9, maxW: 11, minH: 6, maxH: 8 }),
    }),
    motifs: Object.freeze(["family tomb", "sealed door", "lineage"]),
  }),
  "processional-crypt-hall": Object.freeze({
    id: "processional-crypt-hall",
    label: "Processional Crypt Hall",
    family: "crypt",
    contexts: Object.freeze(["crypt", "chapel"]),
    shape: "hall",
    roomType: "none",
    maskProfile: "processional-crypt-hall",
    detailProfile: "processional-crypt-hall",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 6, maxW: 7, minH: 3, maxH: 3 }),
      Small: Object.freeze({ minW: 7, maxW: 9, minH: 3, maxH: 4 }),
      Medium: Object.freeze({ minW: 9, maxW: 11, minH: 4, maxH: 4 }),
      Large: Object.freeze({ minW: 11, maxW: 13, minH: 4, maxH: 5 }),
      Huge: Object.freeze({ minW: 13, maxW: 14, minH: 5, maxH: 6 }),
    }),
    motifs: Object.freeze(["procession", "threshold", "crypt passage"]),
  }),
  "bone-well": Object.freeze({
    id: "bone-well",
    label: "Bone Well",
    family: "crypt",
    contexts: Object.freeze(["crypt", "chapel"]),
    shape: "shaft",
    roomType: "none",
    maskProfile: "bone-well",
    detailProfile: "bone-well",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 4, maxW: 5, minH: 4, maxH: 5 }),
      Small: Object.freeze({ minW: 5, maxW: 6, minH: 5, maxH: 6 }),
      Medium: Object.freeze({ minW: 6, maxW: 7, minH: 6, maxH: 7 }),
      Large: Object.freeze({ minW: 7, maxW: 9, minH: 7, maxH: 9 }),
      Huge: Object.freeze({ minW: 9, maxW: 10, minH: 9, maxH: 10 }),
    }),
    motifs: Object.freeze(["well", "vertical drop", "bone shaft"]),
  }),
  "hidden-reliquary": Object.freeze({
    id: "hidden-reliquary",
    label: "Hidden Reliquary",
    family: "crypt",
    contexts: Object.freeze(["crypt", "chapel"]),
    shape: "archive",
    roomType: "archive",
    maskProfile: "hidden-reliquary",
    detailProfile: "hidden-reliquary",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 4, maxW: 5, minH: 3, maxH: 4 }),
      Small: Object.freeze({ minW: 5, maxW: 6, minH: 4, maxH: 4 }),
      Medium: Object.freeze({ minW: 6, maxW: 7, minH: 4, maxH: 5 }),
      Large: Object.freeze({ minW: 7, maxW: 9, minH: 5, maxH: 6 }),
      Huge: Object.freeze({ minW: 9, maxW: 10, minH: 6, maxH: 7 }),
    }),
    motifs: Object.freeze(["hidden relic", "archive", "sacred storage"]),
  }),
});

export const ROOM_ARCHETYPES_BY_ID = Object.freeze({
  ...CRYPT_ROOM_ARCHETYPES,
});

export const ROOM_ARCHETYPE_OPTIONS = Object.freeze(
  Object.values(ROOM_ARCHETYPES_BY_ID).map((archetype) =>
    Object.freeze({
      id: archetype.id,
      label: archetype.label,
      family: archetype.family,
      contexts: Object.freeze([...(archetype.contexts || [])]),
    }),
  ),
);

const ROOM_ARCHETYPE_ALIASES = Object.freeze({
  burial: "crypt-burial-cell",
  "burial-cell": "crypt-burial-cell",
  crypt: "crypt-burial-cell",
  ossuary: "ossuary-gallery",
  gallery: "ossuary-gallery",
  "ossuary-wall-gallery": "ossuary-gallery",
  reliquary: "reliquary-niche",
  "reliquary-room": "reliquary-niche",
  charnel: "charnel-vault",
  vault: "charnel-vault",
  tomb: "sealed-family-tomb",
  "family-tomb": "sealed-family-tomb",
  hall: "processional-crypt-hall",
  "crypt-hall": "processional-crypt-hall",
  well: "bone-well",
  shaft: "bone-well",
  archive: "hidden-reliquary",
  "secret-reliquary": "hidden-reliquary",
});

export function normalizeRoomArchetypeId(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!normalized) return "";
  return ROOM_ARCHETYPES_BY_ID[normalized]
    ? normalized
    : ROOM_ARCHETYPE_ALIASES[normalized] || "";
}

export function getRoomArchetypeDefinition(id = "") {
  const normalized = normalizeRoomArchetypeId(id);
  return normalized ? ROOM_ARCHETYPES_BY_ID[normalized] || null : null;
}
