import { CONTENT_PACK_STATUS, createContentPack } from "../content-pack-schema.js";
import { normalizeLocationComponentEffect } from "../contracts/location-component-effect.js";
import { SHARED_SOURCE_ANCHORS } from "../source-anchors.js";
import { SHARED_DARKEN_LOCATION_SLOTS, SHARED_WORKFLOWS } from "../workflows.js";

export const DARK_PLACES_CANONICAL_EXPANSION_PACK_ID = "dark-places-canonical-expansion";
export const LOCATION_COMPONENT_SCHEMA_VERSION = "location-component-v0.2";
export const LOCATION_REGION_SCHEMA_VERSION = "location-region-v0.2";
export const DARK_PLACES_CANONICAL_SOURCE_ANCHOR_IDS = Object.freeze([
  "anthropodermic-bibliopegy",
  "crucifixion",
  "decomposition",
  "endocannibalism",
  "genetic-mutations",
  "impalement",
  "mortuary-totems",
  "mustard-gas",
  "sedlec-ossuary",
  "the-mist",
  "towers-of-silence",
  "wax-death-masks",
  "wolf-spiders"
]);
export const DARK_PLACES_CANONICAL_SLOT_IDS = Object.freeze([
  "clue",
  "encounterTwist",
  "hazard",
  "horrorPremise",
  "locationRegion",
  "reward",
  "sensoryLayer",
  "visibleAnomaly"
]);

const LOCATION_COMPONENT_CONTENT_TYPE = "location-component";
const LOCATION_REGION_CONTENT_TYPE = "location-region";
const DARKEN_LOCATION_WORKFLOW_ID = "darken-location";
const MAP_GENERATOR_WORKFLOW_ID = "map-generator";

const OUTPUT_SECTION_BY_SLOT = Object.freeze({
  horrorPremise: "Location Premise",
  sensoryLayer: "Sensory Layer",
  visibleAnomaly: "Visible Anomaly",
  hazard: "Environmental Hazard",
  clue: "Disturbing Clue",
  encounterTwist: "Encounter Twist",
  reward: "Reward / Consequence",
});

const COMPONENT_TYPE_BY_SLOT = Object.freeze({
  horrorPremise: "Location Premise",
  sensoryLayer: "Sensory Layer",
  visibleAnomaly: "Visible Anomaly",
  hazard: "Environmental Hazard",
  clue: "Disturbing Clue",
  encounterTwist: "Encounter Twist",
  reward: "Reward / Consequence",
});

const REGION_SCOPED_SLOT_IDS = new Set(["hazard", "clue", "encounterTwist"]);


const LOCATION_COMPONENT_MAP_INFLUENCE_BY_ID = Object.freeze({
  "places-hazard-weight-sermon-slab": {
    preferredRoomArchetypes: ["processional-crypt-hall"],
    weight: 2,
  },
  "places-hazard-reliquary-tripwire": {
    preferredRoomArchetypes: ["reliquary-niche"],
    weight: 3,
  },
  "places-hazard-lime-pocket-collapse": {
    preferredRoomArchetypes: ["charnel-vault", "bone-well"],
    forbiddenRoomArchetypes: ["reliquary-niche"],
    weight: 2,
  },
  "places-hazard-gas-bloat-vent": {
    preferredRoomArchetypes: ["bone-well", "charnel-vault"],
    forbiddenRoomArchetypes: ["processional-crypt-hall"],
    weight: 2,
  },
  "places-clue-miscounted-skull-row": {
    preferredRoomArchetypes: ["ossuary-gallery"],
    weight: 3,
  },
  "places-clue-bone-chandelier-map": {
    preferredRoomArchetypes: ["processional-crypt-hall", "hidden-reliquary"],
    weight: 2,
  },
  "places-clue-insect-free-corpse": {
    preferredRoomArchetypes: ["crypt-burial-cell", "charnel-vault"],
    weight: 2,
  },
  "places-clue-rot-timeline-wall": {
    preferredRoomArchetypes: ["sealed-family-tomb", "hidden-reliquary"],
    weight: 2,
  },
});

const LOCATION_REGION_ROOM_ARCHETYPE_BY_ID = Object.freeze({
  "reliquary-threshold-ossuary": "reliquary-niche",
  "bone-chandelier-nave": "processional-crypt-hall",
  "grave-wax-sump": "bone-well",
  "rot-ledger-archive": "hidden-reliquary",
});

const LOCATION_REGION_MAP_INFLUENCE_BY_ID = Object.freeze({
  "reliquary-threshold-ossuary": {
    preferredRoomArchetypes: ["reliquary-niche", "processional-crypt-hall"],
    forceRoomArchetype: true,
    weight: 4,
  },
  "bone-chandelier-nave": {
    preferredRoomArchetypes: ["processional-crypt-hall", "ossuary-gallery"],
    forceRoomArchetype: true,
    weight: 4,
  },
  "grave-wax-sump": {
    preferredRoomArchetypes: ["bone-well", "charnel-vault"],
    forceRoomArchetype: true,
    weight: 4,
  },
  "rot-ledger-archive": {
    preferredRoomArchetypes: ["hidden-reliquary", "sealed-family-tomb"],
    forceRoomArchetype: true,
    weight: 4,
  },
});

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function uniqueArray(values = []) {
  return [...new Set(asArray(values).map((value) => String(value).trim()).filter(Boolean))];
}

function cloneOptionalPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? JSON.parse(JSON.stringify(value))
    : undefined;
}

function normalizeMapInfluenceDefinition(value, { source = "", title = "" } = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const preferredRoomArchetypes = uniqueArray([
    value.preferredRoomArchetype,
    value.preferredRoomArchetypeId,
    ...asArray(value.preferredRoomArchetypes),
    ...asArray(value.preferredRoomArchetypeIds),
  ]);
  const forbiddenRoomArchetypes = uniqueArray([
    value.forbiddenRoomArchetype,
    value.forbiddenRoomArchetypeId,
    ...asArray(value.forbiddenRoomArchetypes),
    ...asArray(value.forbiddenRoomArchetypeIds),
  ]);
  const directRoomArchetype = String(value.roomArchetype || value.roomArchetypeId || "").trim();
  const forcedRoomArchetype = String(value.forcedRoomArchetype || value.forcedRoomArchetypeId || "").trim();
  const weight = Number(value.weight ?? value.priority ?? 1);
  const sources = uniqueArray([
    ...asArray(value.sources),
    value.source,
    source,
    title,
  ]);
  const hasInfluence = Boolean(
    directRoomArchetype ||
      forcedRoomArchetype ||
      preferredRoomArchetypes.length ||
      forbiddenRoomArchetypes.length ||
      value.forceRoomArchetype ||
      value.force ||
      value.required,
  );
  if (!hasInfluence) return undefined;
  return Object.freeze({
    ...(directRoomArchetype ? { roomArchetype: directRoomArchetype } : {}),
    ...(forcedRoomArchetype ? { forcedRoomArchetype } : {}),
    ...(preferredRoomArchetypes.length ? { preferredRoomArchetypes } : {}),
    ...(forbiddenRoomArchetypes.length ? { forbiddenRoomArchetypes } : {}),
    forceRoomArchetype: Boolean(value.forceRoomArchetype || value.force || value.required || forcedRoomArchetype),
    weight: Number.isFinite(weight) ? weight : 1,
    source: sources[0] || source,
    sources,
  });
}

function getLocationComponentMapInfluence(blueprint) {
  return normalizeMapInfluenceDefinition(LOCATION_COMPONENT_MAP_INFLUENCE_BY_ID[blueprint.id] || blueprint.mapInfluence, {
    source: blueprint.id,
    title: blueprint.title,
  });
}

function getLocationRegionRoomArchetype(blueprint) {
  return String(
    blueprint.roomArchetype ||
      blueprint.roomArchetypeId ||
      LOCATION_REGION_ROOM_ARCHETYPE_BY_ID[blueprint.id] ||
      "",
  ).trim();
}

function getLocationRegionMapInfluence(blueprint) {
  const roomArchetype = getLocationRegionRoomArchetype(blueprint);
  const influence = LOCATION_REGION_MAP_INFLUENCE_BY_ID[blueprint.id] || blueprint.mapInfluence || null;
  return normalizeMapInfluenceDefinition(
    influence || (roomArchetype ? { preferredRoomArchetypes: [roomArchetype], forceRoomArchetype: true, weight: 3 } : null),
    {
      source: `location-region:${blueprint.id}`,
      title: blueprint.title,
    },
  );
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SOURCE_ANCHOR_BY_ID = new Map(SHARED_SOURCE_ANCHORS.map((sourceAnchor) => [sourceAnchor.id, sourceAnchor]));

function getSourceMetadata(sourceAnchorId) {
  const sourceAnchor = SOURCE_ANCHOR_BY_ID.get(sourceAnchorId);
  return {
    sourceTypes: uniqueArray(sourceAnchor?.sourceTypes || sourceAnchor?.type || []),
    themes: uniqueArray(sourceAnchor?.themes || []),
    motifs: uniqueArray(sourceAnchor?.motifs || []),
    horror: uniqueArray(sourceAnchor?.horror || []),
  };
}

function buildTags({ slot, sourceAnchors = [], contexts = [], horror = [], motifs = [], intrusion = "" }) {
  return uniqueArray([
    slot ? `slot:${slot}` : null,
    ...sourceAnchors.map((sourceAnchorId) => `source:${sourceAnchorId}`),
    ...contexts.map((context) => `context:${slugify(context)}`),
    ...horror.map((horrorType) => `horror:${slugify(horrorType)}`),
    ...motifs.map((motif) => `motif:${slugify(motif)}`),
    intrusion ? `intrusion:${slugify(intrusion)}` : null,
    "authored",
    "canonical",
  ]);
}

export const DARK_PLACES_LOCATION_COMPONENT_BLUEPRINTS = Object.freeze([
  {
    "id": "places-premise-ossuary-litany-engine",
    "title": "Litany Engine Ossuary",
    "slot": "horrorPremise",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel",
      "Ruins"
    ],
    "horror": [
      "Religious Horror",
      "Gothic"
    ],
    "intrusion": "Medium",
    "summary": "The location behaves like a devotional machine built from arranged remains.",
    "tableText": "Every chamber seems arranged to continue a prayer that no living voice remembers.",
    "mechanics": "",
    "narrative": "Use this as the main premise when bone ornament, worship, and architecture should feel like one system.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [
      "devotional architecture",
      "ritual display"
    ],
    "motifs": [
      "bonework",
      "forgotten litany",
      "chapel pressure"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-premise-breathing-burial",
    "title": "Breathing Burial",
    "slot": "horrorPremise",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Corpse",
      "Mine"
    ],
    "horror": [
      "Body Horror",
      "Disease Horror"
    ],
    "intrusion": "Medium",
    "summary": "The buried dead are not awake, but the structure imitates their failing bodies.",
    "tableText": "The place seems to breathe in slow, damp cycles, drawing air down through cracks and giving it back warm.",
    "mechanics": "",
    "narrative": "Use this to make the map feel organic without requiring a creature explanation.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [
      "corpse transformation",
      "organic architecture"
    ],
    "motifs": [
      "warm drafts",
      "grave pressure",
      "soft stone"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-premise-sun-judgment-court",
    "title": "Sun-Judgment Court",
    "slot": "horrorPremise",
    "source": "towers-of-silence",
    "contexts": [
      "Chapel",
      "Ruins",
      "Boss Fight"
    ],
    "horror": [
      "Religious Horror",
      "Folk Horror"
    ],
    "intrusion": "High",
    "summary": "Exposure, height, and ritual purity turn the site into a place of judgment.",
    "tableText": "No shadow in the site feels private; every open surface seems prepared for witnesses above.",
    "mechanics": "",
    "narrative": "Use this when outdoor or vertical rooms should feel ceremonial and unsafe.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [
      "ritual purity",
      "exposure"
    ],
    "motifs": [
      "circling birds",
      "open stone",
      "sun glare"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-premise-skinbound-archive",
    "title": "Skinbound Archive",
    "slot": "horrorPremise",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Noble House",
      "Secret"
    ],
    "horror": [
      "Body Horror",
      "Occult Horror"
    ],
    "intrusion": "Medium",
    "summary": "The location preserves people as records, bindings, indexes, and ownership marks.",
    "tableText": "Every record in the room feels less written than harvested.",
    "mechanics": "",
    "narrative": "Use this for libraries, studies, archives, and noble houses with body-as-document themes.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [
      "skin as archive",
      "forbidden preservation"
    ],
    "motifs": [
      "pores",
      "warm pages",
      "ownership marks"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-premise-poisoned-airline",
    "title": "Poisoned Air-Line",
    "slot": "horrorPremise",
    "source": "mustard-gas",
    "contexts": [
      "Mine",
      "Ruins",
      "Village"
    ],
    "horror": [
      "War Horror",
      "Disease Horror"
    ],
    "intrusion": "High",
    "summary": "The map is organized around invisible contaminated air and delayed harm.",
    "tableText": "Doors, vents, and low corridors matter because the air itself has become an enemy.",
    "mechanics": "",
    "narrative": "Use this when traversal choices should feel tactical and claustrophobic.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [
      "weaponized air",
      "delayed injury"
    ],
    "motifs": [
      "yellow vapor",
      "tainted mask",
      "sealed door"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-premise-white-wall-siege",
    "title": "White-Wall Siege",
    "slot": "horrorPremise",
    "source": "the-mist",
    "contexts": [
      "Village",
      "Noble House",
      "Ruins"
    ],
    "horror": [
      "Cosmic Horror",
      "Survival Horror"
    ],
    "intrusion": "Medium",
    "summary": "The location is safe only by comparison with what the mist hides outside.",
    "tableText": "Beyond every threshold waits a white blankness full of movement.",
    "mechanics": "",
    "narrative": "Use this when rooms should feel like pockets of temporary shelter.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [
      "threshold breach",
      "unknown ecosystem"
    ],
    "motifs": [
      "white wall",
      "shapes in fog",
      "indoor panic"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-premise-ancestor-boundary",
    "title": "Ancestor Boundary",
    "slot": "horrorPremise",
    "source": "mortuary-totems",
    "contexts": [
      "Forest",
      "Village",
      "Chapel"
    ],
    "horror": [
      "Folk Horror",
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "The location is patrolled by memorial objects that treat trespass as a family offense.",
    "tableText": "Carved faces turn the path into a family line the characters were never invited to cross.",
    "mechanics": "",
    "narrative": "Use this for taboo borders, villages, forest shrines, and guardian sites.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [
      "ancestral memory",
      "taboo boundary"
    ],
    "motifs": [
      "carved faces",
      "watchful wood",
      "borrowed eyes"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-premise-communion-of-ash",
    "title": "Communion of Ash",
    "slot": "horrorPremise",
    "source": "endocannibalism",
    "contexts": [
      "Chapel",
      "Noble House",
      "Village"
    ],
    "horror": [
      "Folk Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "Grief, family memory, and hunger are fused into the customs of the place.",
    "tableText": "The rooms treat remembrance as something that must be tasted, swallowed, and carried.",
    "mechanics": "",
    "narrative": "Use this for family cults, feast halls, and funeral sites.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [
      "ancestral incorporation",
      "grief made physical"
    ],
    "motifs": [
      "ash on tongue",
      "ancestor meal",
      "taboo communion"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-premise-bloodline-correction",
    "title": "Bloodline Correction House",
    "slot": "horrorPremise",
    "source": "genetic-mutations",
    "contexts": [
      "Noble House",
      "Village",
      "Secret"
    ],
    "horror": [
      "Body Horror",
      "Psychological Horror"
    ],
    "intrusion": "Medium",
    "summary": "The location exists to hide, repeat, or correct a family defect.",
    "tableText": "Portraits, cradles, ledgers, and locked rooms all point toward the same inherited mistake.",
    "mechanics": "",
    "narrative": "Use this when the map should reveal family horror room by room.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [
      "heritable corruption",
      "bloodline instability"
    ],
    "motifs": [
      "family portraits",
      "extra fingers",
      "corrected genealogy"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-premise-witnessed-shame",
    "title": "Witnessed Shame Chapel",
    "slot": "horrorPremise",
    "source": "crucifixion",
    "contexts": [
      "Chapel",
      "Village",
      "Boss Fight"
    ],
    "horror": [
      "Religious Horror",
      "Gothic"
    ],
    "intrusion": "Medium",
    "summary": "The site turns pain into public proof and expects every visitor to become a witness.",
    "tableText": "The architecture seems built not for prayer, but for looking.",
    "mechanics": "",
    "narrative": "Use this for chapels, courts, punishment yards, and martyr shrines.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [
      "public martyrdom",
      "witnessed punishment"
    ],
    "motifs": [
      "raised beams",
      "witness benches",
      "splintered wood"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-premise-border-of-stakes",
    "title": "Border of Stakes",
    "slot": "horrorPremise",
    "source": "impalement",
    "contexts": [
      "Forest",
      "Ruins",
      "Village"
    ],
    "horror": [
      "Gothic",
      "War Horror"
    ],
    "intrusion": "High",
    "summary": "The map is a warning landscape where authority turns bodies and poles into directions.",
    "tableText": "Every path is marked by an upright warning, whether occupied or waiting.",
    "mechanics": "",
    "narrative": "Use this when navigation should feel political, cruel, and exposed.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [
      "border terror",
      "warning display"
    ],
    "motifs": [
      "stakes",
      "empty poles",
      "crows"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-premise-mask-memory-house",
    "title": "Mask Memory House",
    "slot": "horrorPremise",
    "source": "wax-death-masks",
    "contexts": [
      "Noble House",
      "Chapel",
      "Archive"
    ],
    "horror": [
      "Gothic",
      "Psychological Horror"
    ],
    "intrusion": "Medium",
    "summary": "The site preserves likeness so completely that identity becomes transferable.",
    "tableText": "Faces watch from shelves, walls, and velvet boxes, each one too calm to be only wax.",
    "mechanics": "",
    "narrative": "Use this for mansions, galleries, chapels, and inheritance plots.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [
      "post-mortem likeness",
      "identity residue"
    ],
    "motifs": [
      "wax face",
      "borrowed likeness",
      "sunken eyes"
    ],
    "sourceTypes": [],
    "tableRole": null
  },
  {
    "id": "places-sense-bone-dust-breath",
    "title": "Bone-Dust Breath",
    "slot": "sensoryLayer",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror",
      "Gothic"
    ],
    "intrusion": "Medium",
    "summary": "The air carries a dry mineral taste of powdered bone.",
    "tableText": "The room tastes dry and mineral, as if each breath scrapes through old bone dust.",
    "mechanics": "",
    "narrative": "Use as a low-pressure read-aloud layer for ossuary rooms.",
    "sensoryKind": "smell",
    "prep": "None",
    "themes": [],
    "motifs": [
      "chapel dust",
      "powdered relics"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-clicking-skull-seams",
    "title": "Clicking Skull Seams",
    "slot": "sensoryLayer",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "Tiny clicks move through the walls whenever the room goes quiet.",
    "tableText": "Small clicks travel through the bonework, like teeth settling after speech.",
    "mechanics": "",
    "narrative": "Use to make silence feel responsive.",
    "sensoryKind": "sound",
    "prep": "None",
    "themes": [],
    "motifs": [
      "skull garlands",
      "settling bone"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-sweet-wet-lime",
    "title": "Sweet Wet Lime",
    "slot": "sensoryLayer",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Corpse",
      "Mine"
    ],
    "horror": [
      "Body Horror",
      "Disease Horror"
    ],
    "intrusion": "Medium",
    "summary": "Old lime and sweet rot mingle under the stone.",
    "tableText": "A wet sweetness rises from the joints in the floor, half limewash and half opened grave.",
    "mechanics": "",
    "narrative": "Use when decay should be present before it is visible.",
    "sensoryKind": "smell",
    "prep": "None",
    "themes": [],
    "motifs": [
      "lime",
      "sweet rot"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-warm-wall-pulse",
    "title": "Warm Wall Pulse",
    "slot": "sensoryLayer",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Mine",
      "Ruins"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "The walls warm and cool in a slow rhythm.",
    "tableText": "The stone is warm under the hand, then cold, then warm again.",
    "mechanics": "",
    "narrative": "Use to make masonry feel organic.",
    "sensoryKind": "touch",
    "prep": "None",
    "themes": [],
    "motifs": [
      "warm stone",
      "corpse rhythm"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-high-carrion-shadow",
    "title": "High Carrion Shadow",
    "slot": "sensoryLayer",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Chapel",
      "Forest"
    ],
    "horror": [
      "Religious Horror",
      "Folk Horror"
    ],
    "intrusion": "Medium",
    "summary": "Bird shadows cross the floor though no birds are visible below.",
    "tableText": "Long bird-shadows sweep across the floor, but the sky above the opening is empty.",
    "mechanics": "",
    "narrative": "Use in exposed spaces or high chambers.",
    "sensoryKind": "sight",
    "prep": "None",
    "themes": [],
    "motifs": [
      "circling birds",
      "open sky"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-sun-baked-stone",
    "title": "Sun-Baked Stone Reek",
    "slot": "sensoryLayer",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "Heated stone gives off a faint oily funerary smell.",
    "tableText": "The stone smells sun-baked and oily, like heat drawing old rites back out of it.",
    "mechanics": "",
    "narrative": "Use for towers, courts, terraces, and exposed shrines.",
    "sensoryKind": "smell",
    "prep": "None",
    "themes": [],
    "motifs": [
      "sun glare",
      "funerary stone"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-warm-paper-skin",
    "title": "Warm Paper Skin",
    "slot": "sensoryLayer",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Noble House",
      "Secret"
    ],
    "horror": [
      "Body Horror",
      "Occult Horror"
    ],
    "intrusion": "Medium",
    "summary": "Pages feel slightly warm and resilient under the fingers.",
    "tableText": "The pages flex with a warmth paper should not keep.",
    "mechanics": "",
    "narrative": "Use when books or documents must feel physically wrong.",
    "sensoryKind": "touch",
    "prep": "None",
    "themes": [],
    "motifs": [
      "skin binding",
      "warm pages"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-page-breath-whisper",
    "title": "Page-Breath Whisper",
    "slot": "sensoryLayer",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Noble House"
    ],
    "horror": [
      "Occult Horror"
    ],
    "intrusion": "Low",
    "summary": "Shelved books whisper as if exhaling through closed covers.",
    "tableText": "A shelf of closed books gives a soft breath, page after page.",
    "mechanics": "",
    "narrative": "Use as ambient pressure in archives.",
    "sensoryKind": "sound",
    "prep": "None",
    "themes": [],
    "motifs": [
      "closed books",
      "borrowed breath"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-yellow-metal-air",
    "title": "Yellow Metal Air",
    "slot": "sensoryLayer",
    "source": "mustard-gas",
    "contexts": [
      "Mine",
      "Ruins",
      "Village"
    ],
    "horror": [
      "War Horror",
      "Disease Horror"
    ],
    "intrusion": "High",
    "summary": "A bitter yellow-metal tang clings to the low air.",
    "tableText": "The air tastes yellow and metallic, strongest near the floor.",
    "mechanics": "",
    "narrative": "Use as a warning that air movement matters.",
    "sensoryKind": "smell",
    "prep": "None",
    "themes": [],
    "motifs": [
      "yellow vapor",
      "chemical air"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-delayed-eye-sting",
    "title": "Delayed Eye Sting",
    "slot": "sensoryLayer",
    "source": "mustard-gas",
    "contexts": [
      "Mine",
      "Ruins",
      "Village"
    ],
    "horror": [
      "Disease Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "Eyes begin to sting only after the characters have crossed the room.",
    "tableText": "Nothing hurts at first; then the eyes begin to water behind the last few steps.",
    "mechanics": "",
    "narrative": "Use to imply delayed contamination without immediate damage.",
    "sensoryKind": "touch",
    "prep": "None",
    "themes": [],
    "motifs": [
      "delayed injury",
      "burning eyes"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-distant-glass-tap",
    "title": "Distant Glass Tap",
    "slot": "sensoryLayer",
    "source": "the-mist",
    "contexts": [
      "Village",
      "Noble House",
      "Ruins"
    ],
    "horror": [
      "Survival Horror",
      "Cosmic Horror"
    ],
    "intrusion": "Medium",
    "summary": "Something taps glass or shutters far beyond the visible room.",
    "tableText": "Somewhere beyond the white haze, something taps a pane in a patient rhythm.",
    "mechanics": "",
    "narrative": "Use when the outside should press on the inside.",
    "sensoryKind": "sound",
    "prep": "None",
    "themes": [],
    "motifs": [
      "creatures beyond glass",
      "white haze"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-white-cotton-silence",
    "title": "White Cotton Silence",
    "slot": "sensoryLayer",
    "source": "the-mist",
    "contexts": [
      "Village",
      "Ruins",
      "Forest"
    ],
    "horror": [
      "Cosmic Horror"
    ],
    "intrusion": "Medium",
    "summary": "The mist absorbs echoes and makes distance feel false.",
    "tableText": "Sound falls flat in the white air, as if the room has been packed with cotton.",
    "mechanics": "",
    "narrative": "Use to disorient travel and room exits.",
    "sensoryKind": "sound",
    "prep": "None",
    "themes": [],
    "motifs": [
      "white wall",
      "lost distance"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-old-wood-listening",
    "title": "Old Wood Listening",
    "slot": "sensoryLayer",
    "source": "mortuary-totems",
    "contexts": [
      "Forest",
      "Village",
      "Chapel"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Medium",
    "summary": "Old carved wood creaks only when a character lies.",
    "tableText": "The carved wood stays silent until someone lies; then it gives a single tired creak.",
    "mechanics": "",
    "narrative": "Use as a subtle lie detector or ancestral pressure.",
    "sensoryKind": "sound",
    "prep": "None",
    "themes": [],
    "motifs": [
      "watchful wood",
      "carved faces"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-resin-and-ash",
    "title": "Resin and Ancestor Ash",
    "slot": "sensoryLayer",
    "source": "mortuary-totems",
    "contexts": [
      "Forest",
      "Village"
    ],
    "horror": [
      "Folk Horror",
      "Religious Horror"
    ],
    "intrusion": "Low",
    "summary": "Resin, ash, and old smoke linger around carved memorials.",
    "tableText": "The air smells of resin, old smoke, and ash rubbed into wood grain.",
    "mechanics": "",
    "narrative": "Use for shrine thresholds and taboo boundaries.",
    "sensoryKind": "smell",
    "prep": "None",
    "themes": [],
    "motifs": [
      "ancestor poles",
      "ash"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-ash-on-tongue",
    "title": "Ash on the Tongue",
    "slot": "sensoryLayer",
    "source": "endocannibalism",
    "contexts": [
      "Chapel",
      "Noble House",
      "Village"
    ],
    "horror": [
      "Folk Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "Speech leaves a dry ash taste in the mouth.",
    "tableText": "Every word leaves a faint ash taste on the tongue.",
    "mechanics": "",
    "narrative": "Use when family memory or taboo communion is near.",
    "sensoryKind": "taste",
    "prep": "None",
    "themes": [],
    "motifs": [
      "ash on tongue",
      "taboo communion"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-feast-room-warmth",
    "title": "Feast-Room Warmth",
    "slot": "sensoryLayer",
    "source": "endocannibalism",
    "contexts": [
      "Noble House",
      "Village",
      "Chapel"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Medium",
    "summary": "The room is warm like a kitchen, though no fire burns.",
    "tableText": "The room keeps the warmth of a kitchen after a meal, but no hearth is lit.",
    "mechanics": "",
    "narrative": "Use to make funeral spaces feel domestic and wrong.",
    "sensoryKind": "temperature",
    "prep": "None",
    "themes": [],
    "motifs": [
      "ancestor meal",
      "grief warmth"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-portrait-eye-strain",
    "title": "Portrait Eye Strain",
    "slot": "sensoryLayer",
    "source": "genetic-mutations",
    "contexts": [
      "Noble House",
      "Archive"
    ],
    "horror": [
      "Psychological Horror"
    ],
    "intrusion": "Medium",
    "summary": "Looking at family portraits causes a faint eye strain.",
    "tableText": "The portraits are almost different people, until the shared flaw pulls them into one face.",
    "mechanics": "",
    "narrative": "Use for bloodline clue rooms.",
    "sensoryKind": "sight",
    "prep": "None",
    "themes": [],
    "motifs": [
      "family portraits",
      "repeated traits"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-nursery-antiseptic",
    "title": "Nursery Antiseptic",
    "slot": "sensoryLayer",
    "source": "genetic-mutations",
    "contexts": [
      "Noble House",
      "Village",
      "Secret"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "A nursery-clean antiseptic scent covers older organic smells.",
    "tableText": "A sharp nursery-clean scent tries and fails to hide something older beneath it.",
    "mechanics": "",
    "narrative": "Use around experiments, hidden children, or inheritance rooms.",
    "sensoryKind": "smell",
    "prep": "None",
    "themes": [],
    "motifs": [
      "corrected genealogy",
      "beautiful defect"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-splintered-prayer",
    "title": "Splintered Prayer Smell",
    "slot": "sensoryLayer",
    "source": "crucifixion",
    "contexts": [
      "Chapel",
      "Village"
    ],
    "horror": [
      "Religious Horror",
      "Gothic"
    ],
    "intrusion": "Medium",
    "summary": "Fresh-split wood and old incense combine in the air.",
    "tableText": "The room smells of split wood, old incense, and iron warmed by hands.",
    "mechanics": "",
    "narrative": "Use for punishment chapels and martyr displays.",
    "sensoryKind": "smell",
    "prep": "None",
    "themes": [],
    "motifs": [
      "splintered wood",
      "warm iron"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sense-crow-air",
    "title": "Crow-Air Draft",
    "slot": "sensoryLayer",
    "source": "impalement",
    "contexts": [
      "Forest",
      "Ruins",
      "Village"
    ],
    "horror": [
      "Gothic",
      "War Horror"
    ],
    "intrusion": "Medium",
    "summary": "A draft carries distant crow calls from the wrong direction.",
    "tableText": "Crow calls arrive on a draft from below, though every opening is above.",
    "mechanics": "",
    "narrative": "Use around borders, towers, and warning halls.",
    "sensoryKind": "sound",
    "prep": "None",
    "themes": [],
    "motifs": [
      "crows",
      "empty poles"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-prayer-slip-mortar",
    "title": "Prayer-Slip Mortar",
    "slot": "visibleAnomaly",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "The mortar is packed with folded prayer slips and pale hair.",
    "tableText": "The mortar between the stones has been packed with hair, ash, and old prayer slips.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "prayer slips",
      "hair mortar"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-skull-garland-gap",
    "title": "Garland Gap",
    "slot": "visibleAnomaly",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror",
      "Gothic"
    ],
    "intrusion": "Low",
    "summary": "One skull is missing from a perfect garland, leaving an obvious mouth-shaped gap.",
    "tableText": "A skull garland runs flawlessly around the room except for one mouth-shaped gap.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "skull garland",
      "missing skull"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-grave-wax-bloom",
    "title": "Grave-Wax Bloom",
    "slot": "visibleAnomaly",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Corpse"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "Pale waxy blooms spread from cracks in the stone.",
    "tableText": "Pale wax has flowered from the floor cracks in thumb-sized petals.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "grave wax",
      "waxy bloom"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-softened-relief",
    "title": "Softened Relief",
    "slot": "visibleAnomaly",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Ruins"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "A carved wall relief has sagged like wet skin.",
    "tableText": "A stone relief droops from the wall as if the figure has softened under its own weight.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "skin slippage",
      "soft stone"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-sun-ring-outline",
    "title": "Sun-Ring Outline",
    "slot": "visibleAnomaly",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "A bleached ring marks where something was exposed to the sky.",
    "tableText": "A sun-bleached ring stains the floor around an empty center.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "sun-bleached ring",
      "exposure"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-birdless-feathers",
    "title": "Birdless Feathers",
    "slot": "visibleAnomaly",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Forest"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Low",
    "summary": "Black feathers fall indoors without a bird or opening above.",
    "tableText": "Black feathers lie under the ceiling in a place no bird could enter.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "black feathers",
      "ritual boundary"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-porous-book-spine",
    "title": "Porous Book Spine",
    "slot": "visibleAnomaly",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Noble House"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "A book spine shows faint pores where gilding has worn away.",
    "tableText": "The book spine has pores beneath the rubbed gold title.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "pores",
      "skin binding"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-indexed-scars",
    "title": "Indexed Scars",
    "slot": "visibleAnomaly",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Secret"
    ],
    "horror": [
      "Occult Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "Scar-like raised lines on a binding form an index.",
    "tableText": "Raised scars on the cover form a neat alphabetical index.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "scar index",
      "human cover"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-mask-filter-reliquary",
    "title": "Mask-Filter Reliquary",
    "slot": "visibleAnomaly",
    "source": "mustard-gas",
    "contexts": [
      "Mine",
      "Ruins",
      "Chapel"
    ],
    "horror": [
      "War Horror",
      "Disease Horror"
    ],
    "intrusion": "Medium",
    "summary": "A cracked filter mask has been placed in a reliquary niche.",
    "tableText": "A cracked filter mask rests in a reliquary niche where a saint fragment should be.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "tainted mask",
      "reliquary"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-low-yellow-line",
    "title": "Low Yellow Line",
    "slot": "visibleAnomaly",
    "source": "mustard-gas",
    "contexts": [
      "Mine",
      "Ruins"
    ],
    "horror": [
      "War Horror"
    ],
    "intrusion": "High",
    "summary": "A yellow stain runs around the walls at ankle height.",
    "tableText": "A yellow line stains every wall at ankle height, marking where the bad air settled.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "yellow line",
      "low air"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-handprint-in-mist",
    "title": "Handprint in the Mist",
    "slot": "visibleAnomaly",
    "source": "the-mist",
    "contexts": [
      "Village",
      "Noble House"
    ],
    "horror": [
      "Survival Horror",
      "Cosmic Horror"
    ],
    "intrusion": "Medium",
    "summary": "A wet handprint appears on the inside of a sealed window.",
    "tableText": "A wet handprint spreads on the inside of the sealed glass.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "handprint",
      "sealed glass"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-door-to-white",
    "title": "Door to White",
    "slot": "visibleAnomaly",
    "source": "the-mist",
    "contexts": [
      "Ruins",
      "Village"
    ],
    "horror": [
      "Cosmic Horror"
    ],
    "intrusion": "Medium",
    "summary": "An interior door opens onto featureless mist instead of the next room.",
    "tableText": "The door opens onto a flat wall of white air where the next room should be.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "white wall",
      "wrong door"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-reversed-totem-face",
    "title": "Reversed Totem Face",
    "slot": "visibleAnomaly",
    "source": "mortuary-totems",
    "contexts": [
      "Forest",
      "Village"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Medium",
    "summary": "A carved face has been turned inward toward the wall.",
    "tableText": "One ancestor face has been turned into the wood, hiding its expression from the room.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "carved face",
      "hidden expression"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-fresh-eye-in-wood",
    "title": "Fresh Eye in Old Wood",
    "slot": "visibleAnomaly",
    "source": "mortuary-totems",
    "contexts": [
      "Forest",
      "Chapel"
    ],
    "horror": [
      "Folk Horror",
      "Religious Horror"
    ],
    "intrusion": "High",
    "summary": "One carved eye is wet and newly alive.",
    "tableText": "One eye in the carved pole is wet, pink at the edge, and far too recent.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "borrowed eyes",
      "watchful wood"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-communion-bowl-residue",
    "title": "Communion Bowl Residue",
    "slot": "visibleAnomaly",
    "source": "endocannibalism",
    "contexts": [
      "Chapel",
      "Noble House"
    ],
    "horror": [
      "Folk Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "A ceremonial bowl is ringed with gray residue like ash mixed with broth.",
    "tableText": "Gray residue clings to the inside of a polished bowl in a line left by many meals.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "ancestor meal",
      "gray residue"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-family-tooth-row",
    "title": "Family Tooth Row",
    "slot": "visibleAnomaly",
    "source": "endocannibalism",
    "contexts": [
      "Noble House",
      "Village"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Medium",
    "summary": "Teeth from different people are arranged by family rank.",
    "tableText": "A row of teeth is sorted by family rank, each tiny label written in a careful hand.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "family teeth",
      "taboo genealogy"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-corrected-portrait-hand",
    "title": "Corrected Portrait Hand",
    "slot": "visibleAnomaly",
    "source": "genetic-mutations",
    "contexts": [
      "Noble House",
      "Archive"
    ],
    "horror": [
      "Psychological Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "A portrait hand has been repainted to remove an extra finger.",
    "tableText": "The hand in the portrait has been painted over so many times the correction is thicker than the face.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "extra fingers",
      "corrected portrait"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-cradle-with-restraints",
    "title": "Cradle with Restraints",
    "slot": "visibleAnomaly",
    "source": "genetic-mutations",
    "contexts": [
      "Noble House",
      "Secret"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "High",
    "summary": "A child’s cradle has careful velvet restraints.",
    "tableText": "The cradle is polished, padded, and fitted with velvet restraints too small for an adult.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "nursery restraint",
      "bloodline secret"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-empty-cross-shadow",
    "title": "Empty Cross Shadow",
    "slot": "visibleAnomaly",
    "source": "crucifixion",
    "contexts": [
      "Chapel",
      "Village"
    ],
    "horror": [
      "Religious Horror",
      "Gothic"
    ],
    "intrusion": "Medium",
    "summary": "A cross-shaped shadow remains where no object casts it.",
    "tableText": "A cross-shaped shadow lies on the floor, though nothing above could cast it.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "cross shadow",
      "witness guilt"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-clean-empty-stake",
    "title": "Clean Empty Stake",
    "slot": "visibleAnomaly",
    "source": "impalement",
    "contexts": [
      "Forest",
      "Ruins",
      "Village"
    ],
    "horror": [
      "Gothic",
      "War Horror"
    ],
    "intrusion": "Medium",
    "summary": "One stake is clean, sharpened, and waiting among weathered ones.",
    "tableText": "Among old blackened stakes, one is clean, pale, sharpened, and unused.",
    "mechanics": "",
    "narrative": "Use as an immediate visible sign that points to the source theme.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "empty stake",
      "warning landscape"
    ],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-hazard-weight-sermon-slab",
    "title": "Weight-Sermon Slab",
    "slot": "hazard",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "A pressure slab releases hanging bonework when crossed carelessly.",
    "tableText": "A sermon text is carved into a floor slab polished by knees and footsteps.",
    "mechanics": "A creature that crosses the slab without moving carefully triggers a fall of bonework; it must make a Dexterity saving throw or take bludgeoning damage and be knocked Prone.",
    "narrative": "Telegraph with dustless edges, hanging cords, and a carved warning about kneeling.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "pressure slab",
      "falling bonework"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-reliquary-tripwire",
    "title": "Reliquary Tripwire",
    "slot": "hazard",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "A thread of rosary beads pulls open a reliquary of sharp fragments.",
    "tableText": "A strand of beads runs ankle-high between two reliquary niches.",
    "mechanics": "A creature that breaks the bead-line scatters sharp relic fragments in a short line; the area becomes difficult terrain until cleared.",
    "narrative": "This is a trap that feels devotional rather than mechanical.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "rosary tripwire",
      "relic fragments"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-lime-pocket-collapse",
    "title": "Lime Pocket Collapse",
    "slot": "hazard",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Mine"
    ],
    "horror": [
      "Disease Horror",
      "Body Horror"
    ],
    "intrusion": "High",
    "summary": "A pocket of caustic burial lime collapses under weight.",
    "tableText": "The floor has a pale crust that sounds hollow beneath the heel.",
    "mechanics": "A creature that breaks the crust must make a Dexterity saving throw or fall into caustic lime, taking acid damage and emerging coated in irritant dust.",
    "narrative": "Use near collapsed graves or hurried plague burials.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "burial lime",
      "hollow crust"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-gas-bloat-vent",
    "title": "Bloat-Gas Vent",
    "slot": "hazard",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Corpse",
      "Mine"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "Gas trapped below the room vents when disturbed.",
    "tableText": "A swollen seam in the floor trembles when heavy steps pass nearby.",
    "mechanics": "Disturbing the seam releases foul gas; creatures in the area must succeed on a Constitution saving throw or have the Poisoned condition until the end of their next turn.",
    "narrative": "Warn with smell, swelling seams, and insects avoiding the area.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "gas",
      "swollen seam"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-exposure-edge",
    "title": "Exposure Edge",
    "slot": "hazard",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "High",
    "summary": "A ritual ledge gives way toward an open drop.",
    "tableText": "The outer ledge is white, cracked, and perfectly exposed to the sky.",
    "mechanics": "A creature shoved or moving quickly on the ledge must make a Dexterity saving throw or slide toward the drop.",
    "narrative": "Use forced movement and visibility as part of the room.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "ritual ledge",
      "open drop"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-carrion-drop",
    "title": "Carrion Drop",
    "slot": "hazard",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Forest"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Medium",
    "summary": "A ceiling hatch drops old carrion bait to draw scavengers.",
    "tableText": "A square seam in the ceiling is stained by old runoff.",
    "mechanics": "Opening the wrong hatch drops rotten bait and attracts scavengers or swarm pressure after a short delay.",
    "narrative": "This is a timer hazard, not only immediate damage.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "carrion bait",
      "ceiling hatch"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-skin-page-snap",
    "title": "Skin-Page Snap",
    "slot": "hazard",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Secret"
    ],
    "horror": [
      "Body Horror",
      "Occult Horror"
    ],
    "intrusion": "Medium",
    "summary": "A tense skin-bound page snaps around the reader’s hand.",
    "tableText": "The page lies stretched too tight, as if it has been dried over a frame.",
    "mechanics": "A creature that reads without releasing the clasp must make a Dexterity saving throw or be Restrained by tightening bindings until it uses an action to cut or unfasten them.",
    "narrative": "Make the book look valuable enough to tempt interaction.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "tight binding",
      "restraining page"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-index-needle-rack",
    "title": "Index Needle Rack",
    "slot": "hazard",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Noble House"
    ],
    "horror": [
      "Occult Horror"
    ],
    "intrusion": "Medium",
    "summary": "An index cabinet fires thin catalog needles when opened out of order.",
    "tableText": "Each drawer has a name, a date, and a tiny red pinhole.",
    "mechanics": "Opening an unverified drawer triggers a spray of fine needles; the creature must make a Dexterity saving throw or take piercing damage and be marked by a bleeding letter.",
    "narrative": "Useful for archives where procedure matters.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "catalog needles",
      "bleeding letter"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-low-gas-sump",
    "title": "Low Gas Sump",
    "slot": "hazard",
    "source": "mustard-gas",
    "contexts": [
      "Mine",
      "Ruins"
    ],
    "horror": [
      "War Horror",
      "Disease Horror"
    ],
    "intrusion": "High",
    "summary": "Poisoned air collects in a low section of corridor.",
    "tableText": "The tunnel dips into a yellowish hollow where insects lie curled on their backs.",
    "mechanics": "A creature that ends its turn in the sump must make a Constitution saving throw or have the Poisoned condition until it leaves and spends a turn breathing clean air.",
    "narrative": "Telegraph with dead insects and low yellow staining.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "low gas",
      "dead insects"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-cracked-phial-shelf",
    "title": "Cracked Phial Shelf",
    "slot": "hazard",
    "source": "mustard-gas",
    "contexts": [
      "Ruins",
      "Archive"
    ],
    "horror": [
      "War Horror"
    ],
    "intrusion": "Medium",
    "summary": "Old chemical phials fall if the shelf is searched roughly.",
    "tableText": "Glass phials line the shelf, several already sweating yellow crystals.",
    "mechanics": "A rough search breaks phials; nearby creatures must move away or make a Constitution saving throw against choking vapors.",
    "narrative": "Good for resource rooms and laboratories.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "chemical phials",
      "yellow crystals"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-white-out-step",
    "title": "White-Out Step",
    "slot": "hazard",
    "source": "the-mist",
    "contexts": [
      "Ruins",
      "Village"
    ],
    "horror": [
      "Cosmic Horror",
      "Survival Horror"
    ],
    "intrusion": "Medium",
    "summary": "A patch of mist hides a missing floor section.",
    "tableText": "The mist lies on the floor like spilled milk, hiding where the stones stop.",
    "mechanics": "A creature that moves through the patch without probing must make a Dexterity saving throw or fall into the concealed gap.",
    "narrative": "Use when visibility, not violence, is the danger.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "concealed gap",
      "floor mist"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-inside-window-break",
    "title": "Inside Window Break",
    "slot": "hazard",
    "source": "the-mist",
    "contexts": [
      "Noble House",
      "Village"
    ],
    "horror": [
      "Survival Horror"
    ],
    "intrusion": "High",
    "summary": "A sealed window breaks inward from the wrong side.",
    "tableText": "The sealed window bows inward as if something is leaning on it from inside the glass.",
    "mechanics": "If ignored, the window breaks and fills the room with mist, reducing visibility and allowing an encounter to reposition.",
    "narrative": "Make it a pressure clock during exploration.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "sealed window",
      "inward break"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-ancestor-snare",
    "title": "Ancestor Snare",
    "slot": "hazard",
    "source": "mortuary-totems",
    "contexts": [
      "Forest",
      "Village"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Medium",
    "summary": "A memorial cord snare tightens when a taboo name is spoken.",
    "tableText": "Braided cords hang from the totem like necklaces for absent throats.",
    "mechanics": "Speaking the marked family name tightens a cord around the nearest trespasser; the target must make a Dexterity saving throw or be Restrained.",
    "narrative": "Telegraph with repeated names carved into wood.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "memorial cord",
      "taboo name"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-feast-bench-lock",
    "title": "Feast-Bench Lock",
    "slot": "hazard",
    "source": "endocannibalism",
    "contexts": [
      "Noble House",
      "Chapel"
    ],
    "horror": [
      "Folk Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "A feast bench locks occupants in place when the wrong course is refused.",
    "tableText": "The bench has hidden clamps polished by many wrists.",
    "mechanics": "A seated creature that refuses the offered course may be clamped in place until it breaks free or another creature releases the underside latch.",
    "narrative": "Use social discomfort before mechanical danger.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "feast bench",
      "hidden clamps"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-corrective-nursery-wire",
    "title": "Corrective Nursery Wire",
    "slot": "hazard",
    "source": "genetic-mutations",
    "contexts": [
      "Noble House",
      "Secret"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "Fine wires in a nursery corridor catch clothing and skin.",
    "tableText": "Nearly invisible wires cross the nursery hall at child height and adult knee height.",
    "mechanics": "A creature moving quickly through the wires must make a Dexterity saving throw or be knocked Prone and take slashing damage.",
    "narrative": "This hazard should reveal obsession with correction and restraint.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "nursery wires",
      "correction"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-hazard-splinter-gallows-beam",
    "title": "Splinter-Gallows Beam",
    "slot": "hazard",
    "source": "crucifixion",
    "contexts": [
      "Chapel",
      "Village"
    ],
    "horror": [
      "Religious Horror",
      "Gothic"
    ],
    "intrusion": "Medium",
    "summary": "A stressed beam releases splintered wood under weight or thunder.",
    "tableText": "The overhead beam is split around old nail scars.",
    "mechanics": "A loud impact or failed climb drops splintered wood; creatures beneath must make a Dexterity saving throw or take piercing damage.",
    "narrative": "Use as environmental pressure in martyr spaces.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "splintered beam",
      "nail scars"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-clue-miscounted-skull-row",
    "title": "Miscounted Skull Row",
    "slot": "clue",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "A skull row reveals that one skull has been replaced recently.",
    "tableText": "One skull in the row is cleaner than the others, and the dust line behind it does not match.",
    "mechanics": "Investigation reveals the replacement is fresh and deliberately placed.",
    "narrative": "Use to point toward a recent intruder, victim, or cult act.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "skull row",
      "fresh replacement"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-bone-chandelier-map",
    "title": "Bone Chandelier Map",
    "slot": "clue",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "The chandelier’s bone pattern mirrors the room layout.",
    "tableText": "The bone chandelier repeats the map below in miniature, including one room no door reaches.",
    "mechanics": "Studying the pattern reveals a hidden chamber or alternate route.",
    "narrative": "Strong clue for secret rooms.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "bone chandelier",
      "hidden map"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-insect-free-corpse",
    "title": "Insect-Free Corpse",
    "slot": "clue",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Corpse"
    ],
    "horror": [
      "Disease Horror"
    ],
    "intrusion": "Medium",
    "summary": "A corpse has no insects because something has already claimed it.",
    "tableText": "The corpse is ripe enough for insects, but no fly lands on it.",
    "mechanics": "A successful check reveals the body has been treated, warded, or avoided by natural scavengers.",
    "narrative": "Use to imply a hidden contaminant or supernatural claim.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "insect absence",
      "claimed corpse"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-rot-timeline-wall",
    "title": "Rot Timeline Wall",
    "slot": "clue",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Archive"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "Marks on the wall chart decay stages like a schedule.",
    "tableText": "The wall lists dates beside drawings of swelling, splitting, drying, and wax.",
    "mechanics": "The chart predicts a future event tied to a body or room.",
    "narrative": "Useful for clocks and ritual timing.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "decay chart",
      "ritual schedule"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-bird-path-scratch",
    "title": "Bird-Path Scratch",
    "slot": "clue",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Chapel"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Low",
    "summary": "Claw scratches map the safe path across exposed stone.",
    "tableText": "Tiny claw marks cross the pale stone in a route that avoids several clean circles.",
    "mechanics": "Following the scratches avoids an exposure hazard or sacred boundary.",
    "narrative": "Use to reward attention to animal signs.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "claw marks",
      "safe path"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-purity-ash-line",
    "title": "Purity Ash Line",
    "slot": "clue",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Village"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "A broken ash line shows where someone crossed a ritual boundary.",
    "tableText": "A thin ash line has been scuffed by one set of bare footprints.",
    "mechanics": "The footprints identify who broke the taboo or where they fled.",
    "narrative": "Good for investigation in ritual sites.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "ash line",
      "bare footprints"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-errata-in-skin",
    "title": "Errata in Skin",
    "slot": "clue",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Secret"
    ],
    "horror": [
      "Occult Horror"
    ],
    "intrusion": "Medium",
    "summary": "A skin-bound page corrects itself when a lie is spoken nearby.",
    "tableText": "The ink on one page has shifted, adding a correction in a cramped hand.",
    "mechanics": "Reading the correction reveals a false name, forged lineage, or hidden owner.",
    "narrative": "Useful for archives and noble houses.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "self-correction",
      "false name"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-library-callus-pattern",
    "title": "Library Callus Pattern",
    "slot": "clue",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Noble House"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "Low",
    "summary": "Callus patterns in a binding match a known hand.",
    "tableText": "The cover has callused ridges where no cover should have worked skin.",
    "mechanics": "A close look links the binding to a particular profession, victim, or family member.",
    "narrative": "Use as forensic clue.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "callus pattern",
      "skin cover"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-mask-filter-name",
    "title": "Name on the Filter",
    "slot": "clue",
    "source": "mustard-gas",
    "contexts": [
      "Ruins",
      "Mine",
      "Village"
    ],
    "horror": [
      "War Horror"
    ],
    "intrusion": "Medium",
    "summary": "A gas mask filter has a scratched name and date.",
    "tableText": "A name and date have been scratched into the filter casing with shaking hands.",
    "mechanics": "The date can reveal when the site was sealed or when contamination began.",
    "narrative": "Use for timelines and survivor stories.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "filter name",
      "sealed date"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-dead-canary-cache",
    "title": "Dead Canary Cache",
    "slot": "clue",
    "source": "mustard-gas",
    "contexts": [
      "Mine",
      "Ruins"
    ],
    "horror": [
      "Disease Horror"
    ],
    "intrusion": "Medium",
    "summary": "A line of dead canaries indicates air pockets.",
    "tableText": "Small wrapped birds are hidden at intervals in the tunnel walls.",
    "mechanics": "Their position marks safe and unsafe air pockets.",
    "narrative": "Use as navigational clue for gas hazards.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "canaries",
      "air pockets"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-fog-shadow-delay",
    "title": "Fog Shadow Delay",
    "slot": "clue",
    "source": "the-mist",
    "contexts": [
      "Village",
      "Ruins"
    ],
    "horror": [
      "Cosmic Horror"
    ],
    "intrusion": "Medium",
    "summary": "A shadow in the mist moves seconds after its owner.",
    "tableText": "The character’s shadow lags behind in the fog, then points toward a closed door.",
    "mechanics": "Observing the lag reveals where a mist breach or invisible creature moved.",
    "narrative": "Use to make the mist informative, not only obstructive.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "delayed shadow",
      "mist breach"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-window-breath-script",
    "title": "Window Breath Script",
    "slot": "clue",
    "source": "the-mist",
    "contexts": [
      "Noble House",
      "Village"
    ],
    "horror": [
      "Survival Horror"
    ],
    "intrusion": "Low",
    "summary": "Condensation on glass forms words after breathing near it.",
    "tableText": "Breath fogs the glass and briefly reveals words written from the other side.",
    "mechanics": "The message warns about a creature, exit, or false refuge.",
    "narrative": "Good low-risk clue.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "condensation writing",
      "sealed glass"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-totem-facing-order",
    "title": "Totem Facing Order",
    "slot": "clue",
    "source": "mortuary-totems",
    "contexts": [
      "Forest",
      "Village"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Medium",
    "summary": "The direction each totem faces forms a route.",
    "tableText": "Every carved ancestor looks slightly away from the path except the ones that matter.",
    "mechanics": "Following the gaze order reveals the safe approach or taboo direction.",
    "narrative": "Use for navigation puzzles.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "totem gaze",
      "safe route"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-ash-recipe-note",
    "title": "Ash Recipe Note",
    "slot": "clue",
    "source": "endocannibalism",
    "contexts": [
      "Chapel",
      "Noble House"
    ],
    "horror": [
      "Folk Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "A recipe note hides instructions for a funerary rite.",
    "tableText": "The recipe’s measurements are written like kitchen work, but the ingredients are funerary ash and names.",
    "mechanics": "Decoding it reveals the ritual sequence or the next required victim/object.",
    "narrative": "Use when domestic text should become ritual text.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "recipe",
      "funerary ash"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-family-trait-ledger",
    "title": "Family Trait Ledger",
    "slot": "clue",
    "source": "genetic-mutations",
    "contexts": [
      "Noble House",
      "Archive"
    ],
    "horror": [
      "Psychological Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "A ledger tracks inherited traits with corrections and disappearances.",
    "tableText": "The ledger lists births, traits, corrections, and names crossed out before adulthood.",
    "mechanics": "The pattern identifies the hidden heir or source of the mutation.",
    "narrative": "Use for noble house mysteries.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "trait ledger",
      "crossed names"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-clean-nail-hole",
    "title": "Clean Nail Hole",
    "slot": "clue",
    "source": "crucifixion",
    "contexts": [
      "Chapel",
      "Village"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "A clean nail hole shows a body was removed recently.",
    "tableText": "One nail hole in the beam is clean inside, without the dust gathered in the others.",
    "mechanics": "The mark reveals recent use, a missing victim, or a staged martyrdom.",
    "narrative": "Use to point to recent violence without showing it directly.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "nail hole",
      "missing body"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-nameless-iron-ring",
    "title": "Nameless Iron Ring",
    "slot": "clue",
    "source": "impalement",
    "contexts": [
      "Forest",
      "Ruins",
      "Village"
    ],
    "horror": [
      "Gothic",
      "War Horror"
    ],
    "intrusion": "Medium",
    "summary": "An iron naming ring has been scrubbed clean while the older rings still bear condemned names.",
    "tableText": "The newest iron ring is blank and bright; every older ring is dark with a name cut deep into it.",
    "mechanics": "Comparing the rings reveals that the empty stake is reserved for a living target whose name has not yet been publicly declared.",
    "narrative": "Use this clue to connect the warning boundary to an imminent sentence, political threat, or protected witness.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "blank name ring",
      "reserved sentence"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-twist-bonework-cover-lines",
    "title": "Bonework Cover Lines",
    "slot": "encounterTwist",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel",
      "Boss Fight"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "Bone ornaments create brittle cover and collapsing lines of sight.",
    "tableText": "Skull shelves and femur screens divide the room into narrow devotional lanes.",
    "mechanics": "Creatures can use bonework as half cover, but missed ranged attacks or area damage may collapse it into difficult terrain.",
    "narrative": "Adds tactical texture to ossuary fights.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "bone cover",
      "collapsing screen"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-reliquary-alarm-choir",
    "title": "Reliquary Alarm Choir",
    "slot": "encounterTwist",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "Opening a reliquary causes the room to answer in bone clicks.",
    "tableText": "When the reliquary opens, every skull niche begins clicking like a dry choir.",
    "mechanics": "After a reliquary is disturbed, stealth becomes harder and nearby enemies are alerted unless the sound is muffled.",
    "narrative": "Good twist for loot-first players.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "alarm choir",
      "reliquary"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-soft-floor-grapple",
    "title": "Soft Floor Grapple",
    "slot": "encounterTwist",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Corpse"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "Softened floor matter clings during combat.",
    "tableText": "The floor dents under every step and tries to keep the shape of each boot.",
    "mechanics": "The first time a creature moves more than half its Speed, it must succeed on a Strength saving throw or have its Speed reduced until it spends an action pulling free.",
    "narrative": "Use terrain as a body-horror pressure.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "soft floor",
      "clinging rot"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-bloat-burst-clock",
    "title": "Bloat Burst Clock",
    "slot": "encounterTwist",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Boss Fight"
    ],
    "horror": [
      "Body Horror",
      "Disease Horror"
    ],
    "intrusion": "High",
    "summary": "A swollen corpse or wall sac will burst after several rounds.",
    "tableText": "A swollen shape in the corner trembles more violently each round.",
    "mechanics": "Start a visible three-round clock; when it expires, the sac bursts and creates a poisoned cloud or difficult terrain.",
    "narrative": "Strong encounter timer.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "burst clock",
      "swollen sac"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-open-sky-no-privacy",
    "title": "Open Sky, No Privacy",
    "slot": "encounterTwist",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Boss Fight"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "The exposed room makes hiding and private spellcasting difficult.",
    "tableText": "The chamber has no true ceiling; everything is visible to the ritual sky.",
    "mechanics": "Creatures cannot benefit from mundane hiding in the open center unless they create cover or shadow.",
    "narrative": "Use for vertical/exposure fights.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "open sky",
      "ritual exposure"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-scavenger-patience",
    "title": "Scavenger Patience",
    "slot": "encounterTwist",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Forest"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Medium",
    "summary": "Scavengers wait until a creature is weakened.",
    "tableText": "The birds do not attack first; they watch for limping, blood, or isolation.",
    "mechanics": "When a creature becomes Bloodied, Prone, or separated, scavenger pressure enters or intensifies.",
    "narrative": "Creates readable threat behavior.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "scavenger timing",
      "circling birds"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-bookcase-breathing-wall",
    "title": "Breathing Bookcase Wall",
    "slot": "encounterTwist",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Noble House"
    ],
    "horror": [
      "Occult Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "Bookcases expand and contract, changing lanes.",
    "tableText": "The shelves breathe outward, narrowing the aisle with each exhale.",
    "mechanics": "At initiative count or round end, one aisle narrows into difficult terrain and another opens.",
    "narrative": "Good for archive combats.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "breathing shelves",
      "moving aisles"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-name-index-targeting",
    "title": "Name-Index Targeting",
    "slot": "encounterTwist",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Secret"
    ],
    "horror": [
      "Occult Horror"
    ],
    "intrusion": "Medium",
    "summary": "Enemies target whoever speaks or reveals a true name.",
    "tableText": "The index pages flutter when a true name is spoken.",
    "mechanics": "The first creature to speak a true name becomes the focus of the room’s hazard or guardians until another name is spoken.",
    "narrative": "Use with social/investigation scenes turning to combat.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "true name",
      "index pages"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-low-air-tactics",
    "title": "Low-Air Tactics",
    "slot": "encounterTwist",
    "source": "mustard-gas",
    "contexts": [
      "Mine",
      "Ruins",
      "Boss Fight"
    ],
    "horror": [
      "War Horror",
      "Disease Horror"
    ],
    "intrusion": "High",
    "summary": "Bad air changes the value of height and posture.",
    "tableText": "The yellow haze stays low, turning stairs, tables, and raised stones into urgent terrain.",
    "mechanics": "Prone or low-ground creatures suffer the gas effect; elevated creatures avoid it.",
    "narrative": "Makes movement and verticality matter.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "low haze",
      "elevation"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-mask-resource-loop",
    "title": "Mask Resource Loop",
    "slot": "encounterTwist",
    "source": "mustard-gas",
    "contexts": [
      "Ruins",
      "Mine"
    ],
    "horror": [
      "War Horror"
    ],
    "intrusion": "Medium",
    "summary": "Protective masks exist but limit perception or speech.",
    "tableText": "Old masks hang nearby, their lenses cloudy and their straps cracked.",
    "mechanics": "A mask grants advantage or protection against gas, but imposes disadvantage on sight- or speech-based checks until removed.",
    "narrative": "Creates meaningful equipment choice.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "gas mask",
      "clouded lens"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-mist-repositions-exits",
    "title": "Mist Repositions Exits",
    "slot": "encounterTwist",
    "source": "the-mist",
    "contexts": [
      "Village",
      "Ruins",
      "Boss Fight"
    ],
    "horror": [
      "Cosmic Horror"
    ],
    "intrusion": "Medium",
    "summary": "Mist changes where exits seem to be during stress.",
    "tableText": "Each time the mist thickens, the doors seem to have moved a few feet.",
    "mechanics": "At the end of each round, one exit becomes obscured and another becomes visible; creatures must track position, not only icons.",
    "narrative": "Use to create uncertainty without teleporting everything.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "moving exits",
      "thick mist"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-glass-pressure-breach",
    "title": "Glass Pressure Breach",
    "slot": "encounterTwist",
    "source": "the-mist",
    "contexts": [
      "Noble House",
      "Village"
    ],
    "horror": [
      "Survival Horror"
    ],
    "intrusion": "High",
    "summary": "Breaking glass changes the encounter from containment to breach.",
    "tableText": "Every impact on the windows makes the white outside press harder.",
    "mechanics": "If a window or ward breaks, mist enters and adds a new threat, clock, or line of approach.",
    "narrative": "Good for defense scenes.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "window breach",
      "containment"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-ancestor-facing-judgment",
    "title": "Ancestor Facing Judgment",
    "slot": "encounterTwist",
    "source": "mortuary-totems",
    "contexts": [
      "Forest",
      "Village",
      "Chapel"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Medium",
    "summary": "The direction of ancestor faces determines safe and unsafe spaces.",
    "tableText": "The carved faces rotate only when nobody is looking directly at them.",
    "mechanics": "Areas watched by ancestor faces punish theft or lies; unwatched areas are safe but tactically exposed.",
    "narrative": "Use for moving safe zones.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "rotating faces",
      "watched area"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-feast-obligation",
    "title": "Feast Obligation",
    "slot": "encounterTwist",
    "source": "endocannibalism",
    "contexts": [
      "Noble House",
      "Chapel",
      "Boss Fight"
    ],
    "horror": [
      "Folk Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "The encounter rewards or punishes accepting ritual hospitality.",
    "tableText": "The table is set for more people than entered, and every place has a name.",
    "mechanics": "A creature that accepts the offered seat gains a temporary social or protective benefit but becomes bound by the room’s taboo.",
    "narrative": "Use for tense noncombat/combat hybrids.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "ritual hospitality",
      "named seats"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-inherited-weakness-display",
    "title": "Inherited Weakness Display",
    "slot": "encounterTwist",
    "source": "genetic-mutations",
    "contexts": [
      "Noble House",
      "Boss Fight"
    ],
    "horror": [
      "Body Horror",
      "Psychological Horror"
    ],
    "intrusion": "Medium",
    "summary": "The room reveals a repeating weakness shared by related enemies.",
    "tableText": "Portraits show the same hidden flaw repeated across generations.",
    "mechanics": "A character who studies the portraits can identify a counterplay clue that applies to a bloodline enemy.",
    "narrative": "Use to connect exploration to combat readability.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "family flaw",
      "counterplay clue"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-witness-benches",
    "title": "Witness Benches",
    "slot": "encounterTwist",
    "source": "crucifixion",
    "contexts": [
      "Chapel",
      "Village",
      "Boss Fight"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "Benches, sightlines, and raised platforms turn combat into a spectacle.",
    "tableText": "The benches are angled so every blow can be seen from the nave.",
    "mechanics": "Creatures on raised platforms gain line-of-sight advantages, but become obvious targets and cannot easily hide.",
    "narrative": "Use vertical moral theater.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "witness benches",
      "raised platform"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-twist-stake-line-chokepoint",
    "title": "Stake-Line Chokepoint",
    "slot": "encounterTwist",
    "source": "impalement",
    "contexts": [
      "Forest",
      "Ruins",
      "Village",
      "Boss Fight"
    ],
    "horror": [
      "Gothic",
      "War Horror"
    ],
    "intrusion": "High",
    "summary": "The warning line divides movement into exposed lanes while enemies try to drive intruders toward the empty position.",
    "tableText": "The stakes leave only two clear lanes, and both converge on the single pale point that has not yet been named.",
    "mechanics": "Treat the stake line as dangerous terrain: forced movement toward it creates a clear telegraphed hazard, while breaking a stake opens a safer route at the cost of escalating the site.",
    "narrative": "Use the geometry as readable pressure and counterplay; the threat comes from control of the boundary, not graphic injury.",
    "sensoryKind": "",
    "prep": "Medium",
    "themes": [],
    "motifs": [
      "converging lanes",
      "empty position"
    ],
    "sourceTypes": [],
    "tableRole": "rules"
  },
  {
    "id": "places-reward-counted-among-bones",
    "title": "Counted Among the Bones",
    "slot": "reward",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "The characters can gain passage by being symbolically counted with the dead.",
    "tableText": "A niche opens only after the living offer a name to be counted among the chapel dead.",
    "mechanics": "Offering a true name opens a hidden route or vault, but that name may later be invoked by the site.",
    "narrative": "Use as a reward with a future narrative cost.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "true name",
      "bone niche"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-reliquary-fragment-key",
    "title": "Reliquary Fragment Key",
    "slot": "reward",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "A bone fragment acts as a key to sacred locks.",
    "tableText": "A labeled finger bone rests in a small silver tube, warm only near locked reliquaries.",
    "mechanics": "The fragment opens one reliquary lock or reveals one hidden chapel mechanism.",
    "narrative": "Keep it small, useful, and morally uncomfortable.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "finger bone key",
      "reliquary lock"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-grave-wax-seal",
    "title": "Grave-Wax Seal",
    "slot": "reward",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Corpse"
    ],
    "horror": [
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "A pale wax seal can preserve or conceal a thing unnaturally well.",
    "tableText": "A lump of pale grave wax bears the impression of a mouth that never opened.",
    "mechanics": "The seal can preserve a clue, close a corpse-like door, or hide scent from scavengers once.",
    "narrative": "Useful low-magic reward.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "grave wax",
      "preservation"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-clean-air-route",
    "title": "Clean-Air Route",
    "slot": "reward",
    "source": "mustard-gas",
    "contexts": [
      "Mine",
      "Ruins"
    ],
    "horror": [
      "War Horror",
      "Disease Horror"
    ],
    "intrusion": "Medium",
    "summary": "The characters discover a path of safer air through the site.",
    "tableText": "The chalk marks show where the air stays clear for a few breaths longer.",
    "mechanics": "Following the marks allows the party to bypass one gas hazard or gain advantage against it.",
    "narrative": "A practical exploration reward.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "clean air",
      "chalk marks"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-bird-shadow-warning",
    "title": "Bird-Shadow Warning",
    "slot": "reward",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Forest"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Low",
    "summary": "A scavenger sign warns of an unseen danger before it strikes.",
    "tableText": "A bird shadow circles three times over the place where harm will come next.",
    "mechanics": "Once, the sign warns the party before an ambush, trap, or collapsing ledge.",
    "narrative": "A supernatural omen with tactical value.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "bird omen",
      "warning shadow"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-indexed-secret",
    "title": "Indexed Secret",
    "slot": "reward",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Noble House"
    ],
    "horror": [
      "Occult Horror"
    ],
    "intrusion": "Medium",
    "summary": "The archive offers one secret in exchange for being remembered.",
    "tableText": "The index opens to a blank page headed with the name of someone in the party.",
    "mechanics": "Writing a memory reveals one hidden name, room, or ownership record, but the memory becomes unreliable afterward.",
    "narrative": "Use for costed information.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "memory trade",
      "indexed secret"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-mist-safe-phrase",
    "title": "Mist-Safe Phrase",
    "slot": "reward",
    "source": "the-mist",
    "contexts": [
      "Village",
      "Ruins"
    ],
    "horror": [
      "Cosmic Horror",
      "Survival Horror"
    ],
    "intrusion": "Medium",
    "summary": "A repeated phrase keeps one route stable through the mist.",
    "tableText": "The words are scratched beside every doorframe: do not answer what calls twice.",
    "mechanics": "Repeating the phrase stabilizes one mist-choked exit or prevents one lure.",
    "narrative": "Reward attentive reading.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "safe phrase",
      "doorframe warning"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-ancestor-permission-token",
    "title": "Ancestor Permission Token",
    "slot": "reward",
    "source": "mortuary-totems",
    "contexts": [
      "Forest",
      "Village"
    ],
    "horror": [
      "Folk Horror"
    ],
    "intrusion": "Medium",
    "summary": "A carved token grants permission to cross a taboo boundary.",
    "tableText": "A small carved face has no eyes until held at the boundary.",
    "mechanics": "The token allows safe passage through one watched area, provided the bearer follows the taboo inscribed on its back.",
    "narrative": "Good for route gating.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "permission token",
      "taboo boundary"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-shared-ash-memory",
    "title": "Shared Ash Memory",
    "slot": "reward",
    "source": "endocannibalism",
    "contexts": [
      "Chapel",
      "Noble House"
    ],
    "horror": [
      "Folk Horror",
      "Body Horror"
    ],
    "intrusion": "Medium",
    "summary": "A ritual ash grants a brief inherited memory.",
    "tableText": "A pinch of gray ash shows a scene from the dead person’s final meal.",
    "mechanics": "Using the ash reveals one sensory memory or clue from the dead, then leaves the user with a lingering craving.",
    "narrative": "Keeps the horror useful at the table.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "ash memory",
      "final meal"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-corrected-family-map",
    "title": "Corrected Family Map",
    "slot": "reward",
    "source": "genetic-mutations",
    "contexts": [
      "Noble House",
      "Archive"
    ],
    "horror": [
      "Psychological Horror"
    ],
    "intrusion": "Low",
    "summary": "A corrected genealogy reveals hidden rooms and erased descendants.",
    "tableText": "The family tree has architectural notes hidden inside corrected branches.",
    "mechanics": "Following the corrections reveals a hidden nursery, laboratory, or heir room.",
    "narrative": "Useful for map discovery.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "genealogy map",
      "hidden room"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-witness-pardon",
    "title": "Witness Pardon",
    "slot": "reward",
    "source": "crucifixion",
    "contexts": [
      "Chapel",
      "Village"
    ],
    "horror": [
      "Religious Horror"
    ],
    "intrusion": "Medium",
    "summary": "A written pardon protects a witness who tells the truth.",
    "tableText": "The parchment names no crime, only the duty to witness it fully.",
    "mechanics": "A creature carrying the pardon gains protection or social leverage while openly telling the truth about what happened.",
    "narrative": "Use as roleplay reward.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "pardon",
      "truth witness"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-empty-stake-claim",
    "title": "Empty Stake Claim",
    "slot": "reward",
    "source": "impalement",
    "contexts": [
      "Forest",
      "Ruins"
    ],
    "horror": [
      "Gothic",
      "War Horror"
    ],
    "intrusion": "High",
    "summary": "Claiming an empty stake can redirect the site’s threat.",
    "tableText": "The clean stake bears no name, only a waiting iron ring.",
    "mechanics": "Writing a name on the stake marks that creature or faction as the site’s next warning, creating leverage and consequences.",
    "narrative": "Strong, dangerous reward.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": [],
    "motifs": [
      "empty stake",
      "named warning"
    ],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  }
  ,
  {
    "id": "places-premise-burdened-brood-warren",
    "title": "Burdened Brood Warren",
    "slot": "horrorPremise",
    "source": "wolf-spiders",
    "contexts": ["Cave", "Forest", "Cellar"],
    "horror": ["Body Horror", "Animal Horror"],
    "intrusion": "Medium",
    "summary": "The location behaves like a living nursery where every hiding place protects unseen young.",
    "tableText": "Every surface seems chosen for concealment: cracks, roots, shelves, and torn cloth all hold the stillness of guarded young.",
    "mechanics": "When the party makes loud noise or violent contact with a nursery feature, increase local threat pressure or add a minor swarm complication.",
    "narrative": "Use this premise when protection, infestation, and maternal aggression should define the site.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": ["protective violence", "hidden young"],
    "motifs": ["carried young", "ground hunting", "nursery body"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-premise-hunting-floor-parallax",
    "title": "Hunting-Floor Parallax",
    "slot": "horrorPremise",
    "source": "wolf-spiders",
    "contexts": ["Ruins", "Noble House", "Crypt"],
    "horror": ["Animal Horror", "Gothic"],
    "intrusion": "Medium",
    "summary": "The map rewards stillness and punishes movement across low, open ground.",
    "tableText": "The rooms feel too low and too open, as if the floor itself has learned to watch for moving feet.",
    "mechanics": "Treat exposed floor crossings as risky until the party identifies cover, rhythm, or vibration-safe paths.",
    "narrative": "Use as a movement premise for rooms that should feel hunted rather than haunted.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": ["ambush", "predatory terrain"],
    "motifs": ["low pursuit", "eye shine", "floor vibration"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-sensory-many-pinpoint-eyes",
    "title": "Many Pinpoint Eyes",
    "slot": "sensoryLayer",
    "source": "wolf-spiders",
    "contexts": ["Cave", "Forest", "Ruins"],
    "horror": ["Animal Horror"],
    "intrusion": "Low",
    "summary": "Tiny reflections appear low to the ground whenever light shifts.",
    "tableText": "Your light catches dozens of pinprick reflections close to the floor; when you turn back, they are gone.",
    "mechanics": "Characters using bright light notice movement one room earlier, but also draw attention from hunting creatures.",
    "narrative": "Use for an early warning layer before the site becomes openly dangerous.",
    "sensoryKind": "sight",
    "prep": "None",
    "themes": ["watchfulness"],
    "motifs": ["eye shine", "low reflections"],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sensory-dry-skitter-under-debris",
    "title": "Dry Skitter Under Debris",
    "slot": "sensoryLayer",
    "source": "wolf-spiders",
    "contexts": ["Cellar", "Crypt", "Noble House"],
    "horror": ["Animal Horror", "Gothic"],
    "intrusion": "Low",
    "summary": "A dry skitter moves under loose debris, always stopping when watched.",
    "tableText": "Something small and dry shifts beneath the debris, then becomes perfectly still the moment you listen for it.",
    "mechanics": "Use as a cue for hidden movement, concealed cracks, or a nearby interactive nest feature.",
    "narrative": "Good for haunted-house rooms that should feel biologically occupied.",
    "sensoryKind": "sound",
    "prep": "None",
    "themes": ["concealment"],
    "motifs": ["skitter", "debris", "ambush"],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-back-brood-effigy",
    "title": "Back-Brood Effigy",
    "slot": "visibleAnomaly",
    "source": "wolf-spiders",
    "contexts": ["Chapel", "Crypt", "Village"],
    "horror": ["Body Horror", "Religious Horror"],
    "intrusion": "Medium",
    "summary": "A saint or ancestor figure carries dozens of tiny carved bodies on its back.",
    "tableText": "The figure’s back is crowded with tiny carved bodies, each one clinging to it with too many careful limbs.",
    "mechanics": "Touching the effigy causes nearby loose objects or small creatures to cling to the toucher until removed with care.",
    "narrative": "Use to translate wolf spider brooding into religious or ancestral imagery.",
    "sensoryKind": "sight",
    "prep": "Low",
    "themes": ["burden", "ancestral young"],
    "motifs": ["carried young", "effigy", "clinging bodies"],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-floor-that-flinches",
    "title": "Floor That Flinches",
    "slot": "visibleAnomaly",
    "source": "wolf-spiders",
    "contexts": ["Cave", "Ruins", "Forest"],
    "horror": ["Animal Horror", "Body Horror"],
    "intrusion": "Medium",
    "summary": "The floor covering recoils in tiny waves before settling again.",
    "tableText": "A dark patch on the floor ripples away from your boot, then freezes into the shape of harmless dirt.",
    "mechanics": "Stepping directly onto the patch startles it; careful prodding reveals a hidden passage, nest, or pressure-sensitive hazard.",
    "narrative": "Use when the room should look inert until investigated.",
    "sensoryKind": "sight",
    "prep": "Low",
    "themes": ["camouflage", "living floor"],
    "motifs": ["ground hunting", "scattering young"],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-hazard-scattering-brood",
    "title": "Scattering Brood",
    "slot": "hazard",
    "source": "wolf-spiders",
    "contexts": ["Cellar", "Cave", "Crypt"],
    "horror": ["Animal Horror", "Body Horror"],
    "intrusion": "Medium",
    "summary": "Disturbing a carrier releases a sudden scatter of young across the room.",
    "tableText": "The dark lump bursts into motion as dozens of tiny bodies scatter in every direction.",
    "mechanics": "A creature that disturbs the carrier must succeed on a Dexterity saving throw or have its movement reduced until it uses an action to clear clinging young.",
    "narrative": "Use as a nonlethal but urgent movement hazard.",
    "sensoryKind": "touch",
    "prep": "Low",
    "themes": ["panic", "protective swarm"],
    "motifs": ["scattering young", "clinging legs"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-hazard-tripline-vibration-net",
    "title": "Tripline Vibration Net",
    "slot": "hazard",
    "source": "wolf-spiders",
    "contexts": ["Ruins", "Forest", "Noble House"],
    "horror": ["Animal Horror"],
    "intrusion": "Medium",
    "summary": "Fine lines across the floor do not trap victims; they announce them.",
    "tableText": "Fine threads cross the floor at ankle height, dusty enough to look abandoned until one of them hums.",
    "mechanics": "Crossing the lines carelessly alerts nearby hunters or triggers a prepared ambush; careful cutting or weighting can redirect the alarm.",
    "narrative": "Use for stealth and scouting challenges.",
    "sensoryKind": "sound",
    "prep": "Low",
    "themes": ["alarm", "ambush"],
    "motifs": ["vibration", "tripline", "hunting floor"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-molted-eye-husks",
    "title": "Molted Eye Husks",
    "slot": "clue",
    "source": "wolf-spiders",
    "contexts": ["Cave", "Forest", "Crypt"],
    "horror": ["Animal Horror", "Body Horror"],
    "intrusion": "Low",
    "summary": "Shed skins preserve clusters of eye lenses aimed toward a hidden route.",
    "tableText": "Translucent molts cling to the wall, their empty eye clusters all facing the same narrow crack.",
    "mechanics": "Following the direction of the molts reveals a safe passage, nest boundary, or recent movement pattern.",
    "narrative": "Use as a clue that rewards careful observation.",
    "sensoryKind": "sight",
    "prep": "None",
    "themes": ["tracking", "molting"],
    "motifs": ["shed skin", "eye cluster", "hidden crack"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-dustless-hunting-lane",
    "title": "Dustless Hunting Lane",
    "slot": "clue",
    "source": "wolf-spiders",
    "contexts": ["Noble House", "Ruins", "Cellar"],
    "horror": ["Animal Horror", "Gothic"],
    "intrusion": "Low",
    "summary": "A narrow strip of floor is clean because something repeatedly crosses it.",
    "tableText": "Dust covers everything except one low, narrow lane polished by repeated passage.",
    "mechanics": "The lane indicates a patrol route, a safer crossing, or the shortest path to the nest chamber.",
    "narrative": "Use to connect rooms through ecological evidence.",
    "sensoryKind": "sight",
    "prep": "None",
    "themes": ["tracking", "territory"],
    "motifs": ["hunting lane", "dustless floor"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-twist-mother-guards-key",
    "title": "Mother Guards the Key",
    "slot": "encounterTwist",
    "source": "wolf-spiders",
    "contexts": ["Crypt", "Cave", "Noble House"],
    "horror": ["Animal Horror"],
    "intrusion": "Medium",
    "summary": "The guarded object is under a brooding mother, not behind a lock.",
    "tableText": "The key is visible beneath the creature’s body, sheltered exactly where its young would cling.",
    "mechanics": "The party can fight, lure the guardian away, wait for it to move, or offer a safer replacement shelter.",
    "narrative": "Use to make retrieval a moral and tactical choice instead of a simple attack.",
    "sensoryKind": "sight",
    "prep": "Low",
    "themes": ["guardianship", "retrieval"],
    "motifs": ["brooding mother", "protected object"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-twist-swarm-chooses-warmest",
    "title": "Swarm Chooses Warmest",
    "slot": "encounterTwist",
    "source": "wolf-spiders",
    "contexts": ["Cellar", "Cave", "Forest"],
    "horror": ["Animal Horror", "Body Horror"],
    "intrusion": "Medium",
    "summary": "The brood ignores armor and noise, moving toward warmth and stillness.",
    "tableText": "The smallest shapes do not rush the loudest target; they drift toward the warmest body that holds still.",
    "mechanics": "The safest tactic may be motion, cold objects, or decoys rather than hiding or freezing in place.",
    "narrative": "Use to invert common stealth assumptions.",
    "sensoryKind": "touch",
    "prep": "Low",
    "themes": ["body heat", "bad instinct"],
    "motifs": ["warmth", "brood", "stillness"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-brood-silk-marker",
    "title": "Brood-Silk Marker",
    "slot": "reward",
    "source": "wolf-spiders",
    "contexts": ["Cave", "Forest", "Ruins"],
    "horror": ["Animal Horror"],
    "intrusion": "Low",
    "summary": "A strand of brood silk marks paths that hunting creatures avoid.",
    "tableText": "A dull silk strand clings to your glove, vibrating faintly whenever it points toward a safer route.",
    "mechanics": "Carrying the strand grants advantage or equivalent guidance when navigating one spider-haunted area, but marks the carrier as part of the nest’s ecology.",
    "narrative": "Use as a useful reward with a social/ecological cost.",
    "sensoryKind": "touch",
    "prep": "None",
    "themes": ["navigation", "territory"],
    "motifs": ["brood silk", "safe route"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-eye-shine-lantern",
    "title": "Eye-Shine Lantern",
    "slot": "reward",
    "source": "wolf-spiders",
    "contexts": ["Noble House", "Crypt", "Cave"],
    "horror": ["Animal Horror", "Gothic"],
    "intrusion": "Medium",
    "summary": "A hooded lantern reveals hidden eyes, tracks, and low ambush lanes.",
    "tableText": "When shuttered halfway, the lantern turns hidden eyes and old tracks into pale sparks.",
    "mechanics": "The lantern reveals concealed creatures or routes tied to ground movement, but each use risks drawing attention from watchers.",
    "narrative": "Use as a practical scouting reward.",
    "sensoryKind": "sight",
    "prep": "Low",
    "themes": ["tracking", "revelation"],
    "motifs": ["eye shine", "lantern", "hunting lane"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  }

  ,
  {
    "id": "places-premise-wax-lineage-theater",
    "title": "Wax Lineage Theater",
    "slot": "horrorPremise",
    "source": "wax-death-masks",
    "contexts": ["Noble House", "Archive", "Chapel"],
    "horror": ["Gothic", "Psychological Horror"],
    "intrusion": "Medium",
    "summary": "The location treats preserved faces as authority, testimony, and inheritance.",
    "tableText": "Every important room contains a face that outlasted its owner and still seems entitled to be obeyed.",
    "mechanics": "NPCs or site effects may accept a worn or displayed mask as proof of identity until contradicted by evidence.",
    "narrative": "Use when false ancestry and inherited guilt should drive the place.",
    "sensoryKind": "",
    "prep": "Low",
    "themes": ["identity", "inheritance", "false witness"],
    "motifs": ["wax likeness", "ancestor wall", "preserved face"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-sensory-warm-wax-skin",
    "title": "Warm Wax Skin",
    "slot": "sensoryLayer",
    "source": "wax-death-masks",
    "contexts": ["Noble House", "Archive", "Crypt"],
    "horror": ["Gothic", "Body Horror"],
    "intrusion": "Low",
    "summary": "The air smells of warmed wax and faintly salted skin.",
    "tableText": "A soft wax smell hangs in the room, warm enough to suggest skin rather than candles.",
    "mechanics": "Use as a cue that heat, fire, or living breath can alter nearby masks.",
    "narrative": "A subtle sensory bridge between object and body.",
    "sensoryKind": "smell",
    "prep": "None",
    "themes": ["preservation", "body-object"],
    "motifs": ["warm wax", "skin scent"],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-sensory-soft-face-sag",
    "title": "Soft Face Sag",
    "slot": "sensoryLayer",
    "source": "wax-death-masks",
    "contexts": ["Chapel", "Noble House", "Archive"],
    "horror": ["Gothic"],
    "intrusion": "Low",
    "summary": "A faint wet settling sound comes from a mask losing its shape.",
    "tableText": "Somewhere nearby, a face gives a soft wet sigh as wax settles under its own weight.",
    "mechanics": "Characters who follow the sound can find a changed mask, hidden heat source, or recent intruder.",
    "narrative": "Use as an unsettling navigation cue.",
    "sensoryKind": "sound",
    "prep": "None",
    "themes": ["decay", "preserved expression"],
    "motifs": ["sagging face", "soft wax"],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-expression-mismatch",
    "title": "Expression Mismatch",
    "slot": "visibleAnomaly",
    "source": "wax-death-masks",
    "contexts": ["Noble House", "Archive", "Chapel"],
    "horror": ["Psychological Horror", "Gothic"],
    "intrusion": "Medium",
    "summary": "A death mask shows an expression the corpse could not have worn.",
    "tableText": "The wax face smiles with private amusement, though every portrait of the dead shows a stern and joyless mouth.",
    "mechanics": "The mismatch points to altered testimony, forged identity, or a spirit repeating someone else’s last emotion.",
    "narrative": "Use as a clue-visible anomaly hybrid.",
    "sensoryKind": "sight",
    "prep": "Low",
    "themes": ["false witness", "stolen expression"],
    "motifs": ["wrong smile", "death mask"],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-anomaly-wax-face-perspires",
    "title": "Wax Face Perspires",
    "slot": "visibleAnomaly",
    "source": "wax-death-masks",
    "contexts": ["Crypt", "Noble House", "Archive"],
    "horror": ["Body Horror", "Gothic"],
    "intrusion": "Medium",
    "summary": "A mask beads with moisture when lies are spoken nearby.",
    "tableText": "Tiny beads gather on the wax cheeks, sliding down like sweat from a face pretending not to hear.",
    "mechanics": "When a creature lies in the room, the mask visibly sweats; repeated lies soften or distort it.",
    "narrative": "Use as a diegetic lie detector with horror texture.",
    "sensoryKind": "sight",
    "prep": "Low",
    "themes": ["testimony", "body-object"],
    "motifs": ["wax sweat", "falsehood"],
    "sourceTypes": [],
    "tableRole": "read-aloud"
  },
  {
    "id": "places-hazard-melting-identity-seal",
    "title": "Melting Identity Seal",
    "slot": "hazard",
    "source": "wax-death-masks",
    "contexts": ["Noble House", "Archive", "Chapel"],
    "horror": ["Gothic", "Psychological Horror"],
    "intrusion": "Medium",
    "summary": "Heat causes a mask to soften and temporarily impose its identity on the nearest face.",
    "tableText": "The mask softens at the edges, and for a moment its expression looks easier to wear than to watch.",
    "mechanics": "A creature handling the softened mask must resist adopting the dead person’s manner, voice, or social obligations for the scene.",
    "narrative": "Use as a roleplay hazard rather than direct damage.",
    "sensoryKind": "touch",
    "prep": "Medium",
    "themes": ["identity transfer", "inheritance"],
    "motifs": ["softened mask", "borrowed face"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-fingerprint-in-wax-throat",
    "title": "Fingerprint in Wax Throat",
    "slot": "clue",
    "source": "wax-death-masks",
    "contexts": ["Archive", "Noble House", "Crypt"],
    "horror": ["Gothic"],
    "intrusion": "Low",
    "summary": "A hidden fingerprint inside the mask shows who handled the face after death.",
    "tableText": "Inside the mask, where no viewer would look, a thumbprint is pressed deep into the wax below the chin.",
    "mechanics": "Comparing the print to servants, heirs, or cultists identifies the person who altered or placed the mask.",
    "narrative": "Use as concrete investigation evidence.",
    "sensoryKind": "sight",
    "prep": "Low",
    "themes": ["forensics", "handled corpse"],
    "motifs": ["fingerprint", "wax throat"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-clue-mismatched-funeral-likeness",
    "title": "Mismatched Funeral Likeness",
    "slot": "clue",
    "source": "wax-death-masks",
    "contexts": ["Chapel", "Noble House", "Archive"],
    "horror": ["Gothic", "Psychological Horror"],
    "intrusion": "Low",
    "summary": "The mask belongs to one person, but its label names another.",
    "tableText": "The nameplate is careful and expensive, but the face above it matches a different portrait across the room.",
    "mechanics": "The mismatch reveals adoption fraud, switched bodies, false sainthood, or a hidden heir.",
    "narrative": "Use to connect social intrigue to physical evidence.",
    "sensoryKind": "sight",
    "prep": "Low",
    "themes": ["identity", "inheritance fraud"],
    "motifs": ["wrong nameplate", "portrait match"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-twist-mask-remembers-last-room",
    "title": "Mask Remembers the Last Room",
    "slot": "encounterTwist",
    "source": "wax-death-masks",
    "contexts": ["Archive", "Crypt", "Noble House"],
    "horror": ["Gothic", "Psychological Horror"],
    "intrusion": "Medium",
    "summary": "The mask changes expression only when carried into the room where its owner died.",
    "tableText": "The wax mouth tightens as you cross the threshold, as if the face recognizes the room before you do.",
    "mechanics": "Carrying the mask can locate the death site, but also awakens room-specific memory or hostility.",
    "narrative": "Use as a navigational twist tied to investigation.",
    "sensoryKind": "sight",
    "prep": "Medium",
    "themes": ["memory", "death site"],
    "motifs": ["changing expression", "last room"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  },
  {
    "id": "places-reward-witness-face-impression",
    "title": "Witness-Face Impression",
    "slot": "reward",
    "source": "wax-death-masks",
    "contexts": ["Noble House", "Archive", "Chapel"],
    "horror": ["Gothic"],
    "intrusion": "Medium",
    "summary": "A clean wax impression can preserve a truthful expression for later proof.",
    "tableText": "The blank wax disk is soft enough to take an expression, but cold enough to keep it unchanged.",
    "mechanics": "The party can use the impression to preserve a dying expression, expose a disguised corpse, or prove a supernatural reaction occurred.",
    "narrative": "Use as investigative equipment with gothic flavor.",
    "sensoryKind": "touch",
    "prep": "Low",
    "themes": ["proof", "preserved testimony"],
    "motifs": ["blank wax", "truthful expression"],
    "sourceTypes": [],
    "tableRole": "gm-facing"
  }

]);
export const DARK_PLACES_LOCATION_REGION_BLUEPRINTS = Object.freeze([
  {
    "id": "reliquary-threshold-ossuary",
    "title": "Reliquary Threshold",
    "source": "sedlec-ossuary",
    "contexts": [
      "Crypt",
      "Chapel"
    ],
    "horror": [
      "Religious Horror"
    ],
    "role": "Entrance / Threshold",
    "shape": "small hall",
    "size": "Small",
    "connectors": 2,
    "density": "interactive",
    "compact": "Bone fragments are wired into the arch like teeth around an open mouth.",
    "extended": "The threshold narrows beneath an arch of relic bones, each fragment tagged with a name too faded to read.",
    "feature": "Bone-fragment arch",
    "interaction": "The arch clicks when a false prayer is spoken.",
    "danger": "",
    "secret": "One fragment is fresh and not yet labeled.",
    "reward": "A reliquary tube can be removed and used as a key.",
    "links": [
      "entrance",
      "connector",
      "reliquary"
    ],
    "surfaceKind": "worked-stone",
    "themes": [
      "devotional architecture"
    ],
    "motifs": [
      "bone arch",
      "reliquary"
    ]
  },
  {
    "id": "bone-chandelier-nave",
    "title": "Bone Chandelier Nave",
    "source": "sedlec-ossuary",
    "contexts": [
      "Chapel",
      "Crypt"
    ],
    "horror": [
      "Religious Horror",
      "Gothic"
    ],
    "role": "Central Nave",
    "shape": "wide chamber",
    "size": "Large",
    "connectors": 4,
    "density": "setpiece",
    "compact": "A chandelier of bones hangs over the nave, repeating the map below in miniature.",
    "extended": "The nave opens beneath a bone chandelier so large it seems less hung than rooted into the ceiling.",
    "feature": "Map-like bone chandelier",
    "interaction": "The chandelier can be studied to reveal hidden rooms.",
    "danger": "Falling bonework threatens the center if supports are broken.",
    "secret": "One missing bone marks an unseen chamber.",
    "reward": "A saint fragment is hidden in the chandelier pattern.",
    "links": [
      "chapel",
      "hub",
      "secret"
    ],
    "surfaceKind": "worked-stone",
    "themes": [
      "holy display"
    ],
    "motifs": [
      "bone chandelier",
      "hidden map"
    ]
  },
  {
    "id": "grave-wax-sump",
    "title": "Grave-Wax Sump",
    "source": "decomposition",
    "contexts": [
      "Crypt",
      "Mine"
    ],
    "horror": [
      "Body Horror",
      "Disease Horror"
    ],
    "role": "Lower Hazard Room",
    "shape": "sunken chamber",
    "size": "Medium",
    "connectors": 2,
    "density": "hazardous",
    "compact": "Pale wax gathers in a sunken floor where the stone sweats like skin.",
    "extended": "The floor dips into a pale, waxy sump that gives under pressure and holds every footprint.",
    "feature": "Waxy sunken floor",
    "interaction": "Objects pressed into the wax are preserved with unnatural clarity.",
    "danger": "The sump is difficult terrain and may trap quick movement.",
    "secret": "A preserved message lies just below the surface.",
    "reward": "A wax seal can be cut free intact.",
    "links": [
      "lower room",
      "hazard",
      "clue"
    ],
    "surfaceKind": "natural-stone",
    "themes": [
      "corpse transformation"
    ],
    "motifs": [
      "grave wax",
      "sunken floor"
    ]
  },
  {
    "id": "rot-ledger-archive",
    "title": "Rot Ledger Archive",
    "source": "decomposition",
    "contexts": [
      "Archive",
      "Crypt"
    ],
    "horror": [
      "Body Horror"
    ],
    "role": "Record Room",
    "shape": "rectangular room",
    "size": "Medium",
    "connectors": 2,
    "density": "interactive",
    "compact": "Ledgers swell on damp shelves, each page charting a different stage of decay.",
    "extended": "Damp ledgers line the walls, their pages swollen around diagrams of bodies changing over time.",
    "feature": "Decay ledgers",
    "interaction": "Reading the ledgers reveals a timing clue.",
    "danger": "Mold and gas make rough searching unsafe.",
    "secret": "One ledger predicts a future decay stage in this site.",
    "reward": "A preserved wax impression points to another room.",
    "links": [
      "archive",
      "clue",
      "timer"
    ],
    "surfaceKind": "worked-stone",
    "themes": [
      "forensic decay"
    ],
    "motifs": [
      "decay chart",
      "swollen pages"
    ]
  },
  {
    "id": "exposure-court",
    "title": "Exposure Court",
    "source": "towers-of-silence",
    "contexts": [
      "Ruins",
      "Chapel"
    ],
    "horror": [
      "Religious Horror",
      "Folk Horror"
    ],
    "role": "Open Court",
    "shape": "courtyard",
    "size": "Large",
    "connectors": 3,
    "density": "hazardous",
    "compact": "The court is open to a blank sky, its pale stone marked by rings of old exposure.",
    "extended": "The chamber has no roof, only a hard white sky and rings on the floor where bodies once waited for birds.",
    "feature": "Open ritual court",
    "interaction": "Standing in the clean circles may trigger ritual pressure.",
    "danger": "Edges and height make forced movement dangerous.",
    "secret": "Claw marks reveal a safe crossing.",
    "reward": "A sun-bleached token lies in the center.",
    "links": [
      "courtyard",
      "exposure",
      "hazard"
    ],
    "surfaceKind": "sun-bleached-stone",
    "themes": [
      "ritual purity"
    ],
    "motifs": [
      "open sky",
      "exposure rings"
    ]
  },
  {
    "id": "skinbound-reading-room",
    "title": "Skinbound Reading Room",
    "source": "anthropodermic-bibliopegy",
    "contexts": [
      "Archive",
      "Noble House"
    ],
    "horror": [
      "Body Horror",
      "Occult Horror"
    ],
    "role": "Forbidden Archive",
    "shape": "rectangular room",
    "size": "Medium",
    "connectors": 2,
    "density": "interactive",
    "compact": "The books on the central desk are strapped shut as if they might breathe open.",
    "extended": "A reading desk waits beneath lamp hooks, surrounded by books whose bindings have pores beneath their gilding.",
    "feature": "Skin-bound desk archive",
    "interaction": "Books can reveal names, ownership, and hidden rooms.",
    "danger": "Mishandled books may restrain or mark the reader.",
    "secret": "One binding belongs to someone still listed as alive.",
    "reward": "A page can answer one question at a cost.",
    "links": [
      "archive",
      "secret",
      "interaction"
    ],
    "surfaceKind": "wood-paneling",
    "themes": [
      "skin as archive"
    ],
    "motifs": [
      "warm pages",
      "skin binding"
    ]
  },
  {
    "id": "mask-filter-vestry",
    "title": "Mask-Filter Vestry",
    "source": "mustard-gas",
    "contexts": [
      "Ruins",
      "Chapel",
      "Mine"
    ],
    "horror": [
      "War Horror",
      "Disease Horror"
    ],
    "role": "Equipment Vestry",
    "shape": "small room",
    "size": "Small",
    "connectors": 2,
    "density": "interactive",
    "compact": "Old masks hang where vestments should be, each lens clouded yellow.",
    "extended": "The vestry hooks hold cracked masks instead of robes, and the floor is stained low along the walls.",
    "feature": "Gas mask vestry",
    "interaction": "Masks can protect against gas while limiting sight or speech.",
    "danger": "Cracked phials make rough searching dangerous.",
    "secret": "A filter name reveals who sealed the site.",
    "reward": "One intact mask remains usable.",
    "links": [
      "equipment",
      "gas",
      "safe room"
    ],
    "surfaceKind": "worked-stone",
    "themes": [
      "weaponized air"
    ],
    "motifs": [
      "gas masks",
      "yellow stains"
    ]
  },
  {
    "id": "white-window-parlor",
    "title": "White-Window Parlor",
    "source": "the-mist",
    "contexts": [
      "Noble House",
      "Village"
    ],
    "horror": [
      "Cosmic Horror",
      "Survival Horror"
    ],
    "role": "Contained Room",
    "shape": "parlor",
    "size": "Medium",
    "connectors": 3,
    "density": "setpiece",
    "compact": "Every window is sealed, but handprints keep appearing on the inside of the glass.",
    "extended": "The parlor looks domestic until the white windows show wet handprints blooming from the wrong side.",
    "feature": "Sealed mist windows",
    "interaction": "The room stays safe while the glass holds.",
    "danger": "Breaking glass lets mist pressure enter.",
    "secret": "Condensation reveals a warning phrase.",
    "reward": "A hidden latch opens a stable exit.",
    "links": [
      "parlor",
      "containment",
      "breach"
    ],
    "surfaceKind": "wood-paneling",
    "themes": [
      "threshold breach"
    ],
    "motifs": [
      "sealed glass",
      "white mist"
    ]
  },
  {
    "id": "ancestor-gate-path",
    "title": "Ancestor Gate Path",
    "source": "mortuary-totems",
    "contexts": [
      "Forest",
      "Village"
    ],
    "horror": [
      "Folk Horror",
      "Religious Horror"
    ],
    "role": "Boundary Path",
    "shape": "narrow hall",
    "size": "Medium",
    "connectors": 3,
    "density": "interactive",
    "compact": "Carved faces line the path, all looking slightly away from the safe direction.",
    "extended": "The path bends between ancestor poles whose wooden faces track the party by sound, not sight.",
    "feature": "Totem-lined boundary",
    "interaction": "The gaze order reveals safe movement.",
    "danger": "Speaking a taboo name can trigger a snare.",
    "secret": "One face has been turned inward to hide a secret.",
    "reward": "A permission token hangs behind the reversed face.",
    "links": [
      "boundary",
      "path",
      "guardian"
    ],
    "surfaceKind": "packed-earth",
    "themes": [
      "taboo boundary"
    ],
    "motifs": [
      "ancestor poles",
      "watchful wood"
    ]
  },
  {
    "id": "funeral-feast-hall",
    "title": "Funeral Feast Hall",
    "source": "endocannibalism",
    "contexts": [
      "Noble House",
      "Chapel",
      "Village"
    ],
    "horror": [
      "Folk Horror",
      "Body Horror"
    ],
    "role": "Feast Hall",
    "shape": "long hall",
    "size": "Large",
    "connectors": 4,
    "density": "interactive",
    "compact": "The table is set with ash bowls, empty seats, and names written on folded cards.",
    "extended": "The hall is warm as a kitchen after supper, though the plates hold only ash, broth stains, and names.",
    "feature": "Named funeral table",
    "interaction": "The seating order reveals family relationships and ritual obligations.",
    "danger": "Benches may lock during refusal or panic.",
    "secret": "One place card belongs to someone present.",
    "reward": "A bowl grants an inherited memory.",
    "links": [
      "feast",
      "social",
      "clue"
    ],
    "surfaceKind": "wood-paneling",
    "themes": [
      "grief made physical"
    ],
    "motifs": [
      "ash bowls",
      "named seats"
    ]
  },
  {
    "id": "corrected-nursery",
    "title": "Corrected Nursery",
    "source": "genetic-mutations",
    "contexts": [
      "Noble House",
      "Secret"
    ],
    "horror": [
      "Body Horror",
      "Psychological Horror"
    ],
    "role": "Hidden Nursery",
    "shape": "small room",
    "size": "Medium",
    "connectors": 2,
    "density": "secretive",
    "compact": "The nursery is too clean, and every toy has been modified to teach symmetry.",
    "extended": "A hidden nursery smells of antiseptic and old velvet, its toys altered to correct small imagined flaws.",
    "feature": "Corrective nursery",
    "interaction": "Objects reveal the family defect and its attempted corrections.",
    "danger": "Fine wires and restraints make quick movement dangerous.",
    "secret": "A portrait behind the cradle shows the first corrected heir.",
    "reward": "A hidden genealogy map is tucked under the mattress.",
    "links": [
      "secret",
      "nursery",
      "clue"
    ],
    "surfaceKind": "wood-paneling",
    "themes": [
      "bloodline instability"
    ],
    "motifs": [
      "corrected toys",
      "velvet restraints"
    ]
  },
  {
    "id": "witness-nave",
    "title": "Witness Nave",
    "source": "crucifixion",
    "contexts": [
      "Chapel",
      "Village"
    ],
    "horror": [
      "Religious Horror",
      "Gothic"
    ],
    "role": "Witness Chamber",
    "shape": "wide chamber",
    "size": "Large",
    "connectors": 3,
    "density": "setpiece",
    "compact": "Benches face a raised beam, as if the whole room exists to make pain visible.",
    "extended": "The nave is angled toward a raised beam and a clean floor where every witness would have seen clearly.",
    "feature": "Witness benches and raised beam",
    "interaction": "Line of sight matters; truth spoken from the benches carries social force.",
    "danger": "Damaged beams may drop splinters.",
    "secret": "A clean nail hole reveals a recent removal.",
    "reward": "A pardon parchment is hidden under one bench.",
    "links": [
      "chapel",
      "witness",
      "verticality"
    ],
    "surfaceKind": "worked-stone",
    "themes": [
      "public martyrdom"
    ],
    "motifs": [
      "witness benches",
      "raised beam"
    ]
  },
  {
    "id": "empty-stake-border",
    "title": "Empty-Stake Border",
    "source": "impalement",
    "contexts": [
      "Forest",
      "Ruins",
      "Village"
    ],
    "horror": [
      "Gothic",
      "War Horror"
    ],
    "role": "Warning Boundary",
    "shape": "narrow hall",
    "size": "Medium",
    "connectors": 3,
    "density": "hazardous",
    "compact": "Weathered stakes mark the border, but one pale stake is clean and waiting.",
    "extended": "The boundary path runs between old black stakes until it reaches one pale unused point with an iron naming ring.",
    "feature": "Stake-lined boundary",
    "interaction": "The empty stake can redirect threat or mark a faction.",
    "danger": "Forced movement toward stakes is dangerous.",
    "secret": "The clean stake has no name yet.",
    "reward": "The iron ring can claim a dangerous bargain.",
    "links": [
      "boundary",
      "warning",
      "hazard"
    ],
    "surfaceKind": "packed-earth",
    "themes": [
      "border terror"
    ],
    "motifs": [
      "empty stake",
      "warning path"
    ]
  },
  {
    "id": "wax-mask-gallery",
    "title": "Wax Mask Gallery",
    "source": "wax-death-masks",
    "contexts": [
      "Noble House",
      "Archive",
      "Chapel"
    ],
    "horror": [
      "Gothic",
      "Psychological Horror"
    ],
    "role": "Portrait Gallery",
    "shape": "rectangular room",
    "size": "Medium",
    "connectors": 3,
    "density": "interactive",
    "compact": "Wax faces rest where portraits should hang, each lit from below like a confession.",
    "extended": "The gallery walls hold wax faces in velvet boxes, all calm, all labeled with family names and dates.",
    "feature": "Wax face gallery",
    "interaction": "Masks can reveal identity, inheritance, or imitation clues.",
    "danger": "Heat or damage may soften faces and obscure evidence.",
    "secret": "One mask is warm and recently made.",
    "reward": "A borrowed likeness can unlock a sealed social space.",
    "links": [
      "gallery",
      "identity",
      "clue"
    ],
    "surfaceKind": "wood-paneling",
    "themes": [
      "post-mortem likeness"
    ],
    "motifs": [
      "wax faces",
      "borrowed likeness"
    ]
  }
  ,
  {
    "id": "brood-nursery-floor",
    "title": "Brood Nursery Floor",
    "source": "wolf-spiders",
    "contexts": ["Cave", "Cellar", "Forest"],
    "horror": ["Animal Horror", "Body Horror"],
    "role": "Nursery / Hazard Room",
    "shape": "low chamber",
    "size": "Medium",
    "connectors": 3,
    "density": "interactive",
    "compact": "The floor is broken into shallow hollows lined with lint, molts, and twitching silk.",
    "extended": "The chamber stays low and close to the ground. Shallow hollows dot the floor, each lined with lint, shed skins, and silk that trembles before anything visible moves.",
    "feature": "Low nursery hollows",
    "interaction": "Careful movement can cross the hollows without waking the brood; vibration or fire sends them scattering.",
    "danger": "Disturbing a hollow releases clinging young that slow movement until cleared.",
    "secret": "One hollow hides a clean tunnel used by the mother to bypass the main route.",
    "reward": "A brood-silk marker can be taken from an abandoned hollow.",
    "links": ["nursery", "hazard", "bypass"],
    "surfaceKind": "packed-earth",
    "themes": ["hidden young", "guarded nursery"],
    "motifs": ["carried young", "molts", "vibration"]
  },
  {
    "id": "eye-shine-hunting-gallery",
    "title": "Eye-Shine Hunting Gallery",
    "source": "wolf-spiders",
    "contexts": ["Ruins", "Noble House", "Crypt"],
    "horror": ["Animal Horror", "Gothic"],
    "role": "Ambush Gallery",
    "shape": "long hall",
    "size": "Large",
    "connectors": 4,
    "density": "setpiece",
    "compact": "A long low gallery answers each light source with rows of tiny reflected eyes.",
    "extended": "The gallery runs longer than it first seemed. Every lantern or spell-light returns a line of pinprick reflections from cracks near the floor, each vanishing when approached.",
    "feature": "Low cracks and eye-shine lines",
    "interaction": "Changing the angle of light reveals safe cover and hunting lanes across the floor.",
    "danger": "Crossing exposed lanes too quickly alerts the ambushers waiting below the cracks.",
    "secret": "The reflected eyes outline a hidden door no one can see in full light.",
    "reward": "A shuttered lamp in the gallery can reveal future eye-shine clues.",
    "links": ["ambush", "connector", "secret-door"],
    "surfaceKind": "worked-stone",
    "themes": ["watchfulness", "predatory terrain"],
    "motifs": ["eye shine", "hunting lane", "low cracks"]
  }

]);

function createLocationComponent(blueprint) {
  const sourceMetadata = getSourceMetadata(blueprint.source);
  const sourceAnchors = uniqueArray([blueprint.source]);
  const slot = blueprint.slot;
  const motifs = uniqueArray([...(sourceMetadata.motifs || []), ...(blueprint.motifs || [])]);
  const themes = uniqueArray([...(sourceMetadata.themes || []), ...(blueprint.themes || [])]);
  const horror = uniqueArray([...(blueprint.horror || []), ...(sourceMetadata.horror || [])]);
  const contexts = uniqueArray(blueprint.contexts || ["Any"]);
  const sourceTypes = uniqueArray([...(sourceMetadata.sourceTypes || []), ...(blueprint.sourceTypes || [])]);
  const outputSection = OUTPUT_SECTION_BY_SLOT[slot] || COMPONENT_TYPE_BY_SLOT[slot] || "Location Component";
  const componentType = COMPONENT_TYPE_BY_SLOT[slot] || "Location Component";
  const mapInfluence = getLocationComponentMapInfluence(blueprint);
  const roomDesign = cloneOptionalPlainObject(blueprint.roomDesign);
  const roomCompatibility = cloneOptionalPlainObject(blueprint.roomCompatibility);
  const authoredEffect = cloneOptionalPlainObject(blueprint.effect);
  const location = {
    schemaVersion: LOCATION_COMPONENT_SCHEMA_VERSION,
    componentId: blueprint.id,
    slot,
    slots: [slot],
    assignmentMode: REGION_SCOPED_SLOT_IDS.has(slot) ? "region" : "map",
    outputSection,
    componentType,
    sensoryKind: blueprint.sensoryKind || "",
    intrusion: blueprint.intrusion || "Medium",
    prep: blueprint.prep || "Low",
    gmFacingOnly: blueprint.tableRole === "gm-facing" || Boolean(blueprint.mechanics),
    tableRole: blueprint.tableRole || (blueprint.mechanics ? "rules" : "read-aloud"),
    rules: blueprint.mechanics ? { text: blueprint.mechanics } : null,
    ...(mapInfluence ? { mapInfluence } : {}),
    ...(roomDesign ? { roomDesign } : {}),
    ...(roomCompatibility ? { roomCompatibility } : {}),
    ...(authoredEffect ? { effect: authoredEffect } : {}),
    migration: {
      source: "shared/content/content-packs/dark-places-canonical-expansion-pack.js",
      legacyId: "",
      isCanonical: true,
    },
  };
  const effect = normalizeLocationComponentEffect(
    {
      id: blueprint.id,
      title: blueprint.title,
      slots: [slot],
      sourceAnchors,
      location,
    },
    {
      componentId: blueprint.id,
      componentTitle: blueprint.title,
      slotId: slot,
      assignmentMode: location.assignmentMode,
    },
  );

  return Object.freeze({
    id: blueprint.id,
    title: blueprint.title,
    label: blueprint.title,
    type: componentType,
    contentType: LOCATION_COMPONENT_CONTENT_TYPE,
    status: "published",
    workflows: [DARKEN_LOCATION_WORKFLOW_ID],
    slots: [slot],
    sourceAnchors,
    sourceTypes,
    themes,
    motifs,
    contexts,
    horror,
    sensoryKind: blueprint.sensoryKind || "",
    intrusion: blueprint.intrusion || "Medium",
    prep: blueprint.prep || "Low",
    summary: blueprint.summary || "",
    tableText: blueprint.tableText || blueprint.summary || "",
    mechanics: blueprint.mechanics || "",
    narrative: blueprint.narrative || "",
    location: {
      ...location,
      effect,
    },
    registry: {
      componentId: blueprint.id,
      contentType: LOCATION_COMPONENT_CONTENT_TYPE,
      schemaVersion: LOCATION_COMPONENT_SCHEMA_VERSION,
    },
    contentPack: {
      id: DARK_PLACES_CANONICAL_EXPANSION_PACK_ID,
      title: "Dark Places Canonical Expansion",
    },
    tags: buildTags({ slot, sourceAnchors, contexts, horror, motifs, intrusion: blueprint.intrusion }),
  });
}

function createLocationRegion(blueprint) {
  const sourceMetadata = getSourceMetadata(blueprint.source);
  const sourceAnchors = uniqueArray([blueprint.source]);
  const contexts = uniqueArray(blueprint.contexts || ["Any"]);
  const horror = uniqueArray([...(blueprint.horror || []), ...(sourceMetadata.horror || [])]);
  const sourceTypes = uniqueArray(sourceMetadata.sourceTypes || []);
  const themes = uniqueArray([...(sourceMetadata.themes || []), ...(blueprint.themes || [])]);
  const motifs = uniqueArray([...(sourceMetadata.motifs || []), ...(blueprint.motifs || [])]);
  const templateId = blueprint.id;
  const readAloud = {
    compact: blueprint.compact || blueprint.feature || "",
    extended: blueprint.extended || blueprint.compact || blueprint.feature || "",
  };
  const roomArchetype = getLocationRegionRoomArchetype(blueprint);
  const mapInfluence = getLocationRegionMapInfluence(blueprint);

  return Object.freeze({
    id: `location-region-${templateId}`,
    title: blueprint.title,
    label: blueprint.title,
    type: "Location Region",
    contentType: LOCATION_REGION_CONTENT_TYPE,
    status: "published",
    workflows: [DARKEN_LOCATION_WORKFLOW_ID, MAP_GENERATOR_WORKFLOW_ID],
    slots: ["locationRegion"],
    sourceAnchors,
    sourceTypes,
    themes,
    motifs,
    contexts,
    horror,
    summary: blueprint.feature || readAloud.compact,
    tableText: readAloud.compact,
    mechanics: blueprint.danger || "",
    narrative: blueprint.interaction || blueprint.secret || "",
    locationRegion: {
      schemaVersion: LOCATION_REGION_SCHEMA_VERSION,
      role: blueprint.role || "Location Region",
      size: blueprint.size || "Medium",
      shape: blueprint.shape || "room",
      ...(roomArchetype ? { roomArchetype } : {}),
      ...(mapInfluence ? { mapInfluence } : {}),
      connectors: Number(blueprint.connectors || 1),
      density: blueprint.density || "interactive",
      readAloud,
    },
    map: {
      schemaVersion: LOCATION_REGION_SCHEMA_VERSION,
      templateId,
      role: blueprint.role || "Location Region",
      shape: blueprint.shape || "room",
      preferredShape: blueprint.preferredShape || blueprint.shape || "room",
      ...(roomArchetype ? { roomArchetype } : {}),
      ...(mapInfluence ? { mapInfluence } : {}),
      size: blueprint.size || "Medium",
      connectors: Number(blueprint.connectors || 1),
      density: blueprint.density || "interactive",
      contexts,
      horror,
      sourceAnchors,
      readAloud,
      feature: blueprint.feature || "",
      interaction: blueprint.interaction || "",
      danger: blueprint.danger || "",
      secret: blueprint.secret || "",
      reward: blueprint.reward || "",
      links: uniqueArray(blueprint.links || []),
      surfaceKind: blueprint.surfaceKind || "worked-stone",
      tags: buildTags({ slot: "locationRegion", sourceAnchors, contexts, horror, motifs, intrusion: "Medium" }),
      migration: {
        source: "shared/content/content-packs/dark-places-canonical-expansion-pack.js",
        legacyId: "",
        isCanonical: true,
      },
    },
    registry: {
      componentId: `location-region-${templateId}`,
      contentType: LOCATION_REGION_CONTENT_TYPE,
      schemaVersion: LOCATION_REGION_SCHEMA_VERSION,
    },
    contentPack: {
      id: DARK_PLACES_CANONICAL_EXPANSION_PACK_ID,
      title: "Dark Places Canonical Expansion",
    },
    tags: buildTags({ slot: "locationRegion", sourceAnchors, contexts, horror, motifs, intrusion: "Medium" }),
  });
}

export const DARK_PLACES_CANONICAL_LOCATION_COMPONENTS = Object.freeze(
  DARK_PLACES_LOCATION_COMPONENT_BLUEPRINTS.map(createLocationComponent),
);

export const DARK_PLACES_CANONICAL_LOCATION_REGION_COMPONENTS = Object.freeze(
  DARK_PLACES_LOCATION_REGION_BLUEPRINTS.map(createLocationRegion),
);

export const DARK_PLACES_CANONICAL_EXPANSION_COMPONENTS = Object.freeze([
  ...DARK_PLACES_CANONICAL_LOCATION_COMPONENTS,
  ...DARK_PLACES_CANONICAL_LOCATION_REGION_COMPONENTS,
]);

const REFERENCED_SOURCE_ANCHOR_ID_SET = new Set(DARK_PLACES_CANONICAL_SOURCE_ANCHOR_IDS);
const REFERENCED_SLOT_ID_SET = new Set(DARK_PLACES_CANONICAL_SLOT_IDS);
const REFERENCED_WORKFLOW_ID_SET = new Set([DARKEN_LOCATION_WORKFLOW_ID, MAP_GENERATOR_WORKFLOW_ID]);

export const DARK_PLACES_CANONICAL_EXPANSION_CONTENT_PACK = createContentPack({
  id: DARK_PLACES_CANONICAL_EXPANSION_PACK_ID,
  title: "Dark Places Canonical Expansion",
  summary:
    "Authored Supabase-ready Dark Places components and map regions for sensory layers, anomalies, hazards, clues, encounter twists, rewards, and room templates.",
  version: "0.1.1",
  status: CONTENT_PACK_STATUS.PUBLISHED,
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: ["dark-places", "canonical", "authored", "darken-location", "map-generator", "static"],
  updatedAt: "2026-07-18",
  metadata: {
    bundled: true,
    registryRole: "dark-places-content-expansion",
    source: "shared/content/content-packs/dark-places-canonical-expansion-pack.js",
    schemaVersions: [LOCATION_COMPONENT_SCHEMA_VERSION, LOCATION_REGION_SCHEMA_VERSION],
  },
  collections: {
    workflows: SHARED_WORKFLOWS.filter((workflow) => REFERENCED_WORKFLOW_ID_SET.has(workflow.id)),
    slots: SHARED_DARKEN_LOCATION_SLOTS.filter((slot) => REFERENCED_SLOT_ID_SET.has(slot.id)),
    components: DARK_PLACES_CANONICAL_EXPANSION_COMPONENTS,
    sourceAnchors: SHARED_SOURCE_ANCHORS.filter((sourceAnchor) => REFERENCED_SOURCE_ANCHOR_ID_SET.has(sourceAnchor.id)),
    inspirations: [],
    taxonomies: [],
  },
});
