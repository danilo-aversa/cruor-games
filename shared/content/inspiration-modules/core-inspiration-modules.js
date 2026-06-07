import { SHARED_DARKEN_LOCATION_COMPONENTS } from "../adapters/darken-components.js";
import { SHARED_LOCATION_REGION_COMPONENTS } from "../adapters/location-regions.js";
import { defineInspirationModule, uniqueById } from "../inspiration-module-schema.js";
import { SHARED_MONSTER_COMPONENTS } from "../monster-components.js";
import { normalizeSourceAnchorIds, SHARED_SOURCE_ANCHORS } from "../source-anchors.js";

export const CORE_INSPIRATION_MODULE_PACK_ID = "existing-inspirations";
export const INSPIRATION_ASSET_PROVIDER = "local";

const CRUOR_PUBLIC_BASE_PATH = import.meta.env?.BASE_URL || "/";

/**
 * Base path for public inspiration-card images.
 *
 * The files are stored in:
 *   public/assets/inspiration-cards
 *
 * In local dev they resolve as:
 *   /assets/inspiration-cards
 *
 * On GitHub Pages, with Vite base set to /cruor-games/, they resolve as:
 *   /cruor-games/assets/inspiration-cards
 */
export const INSPIRATION_ASSET_BASE_PATH = `${CRUOR_PUBLIC_BASE_PATH.replace(/\/+$/, "")}/assets/inspiration-cards`;

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeStringArray(value) {
  return asArray(value)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueArray(values) {
  return [...new Set(normalizeStringArray(values))];
}

export function buildInspirationAssetUrl(imageKey, basePath = INSPIRATION_ASSET_BASE_PATH) {
  if (!imageKey) return "";

  const cleanBasePath = String(basePath || "").replace(/\/+$/, "");
  const cleanImageKey = String(imageKey || "").replace(/^\/+/, "");

  return `${cleanBasePath}/${cleanImageKey}`;
}

export const CORE_INSPIRATION_CARD_DEFINITIONS = Object.freeze([
  {
    sourceAnchorId: "towers-of-silence",
    title: "Towers of Silence",
    icon: "fa-tower-observation",
    sourceType: "Funerary Practice",
    caption:
      "Funerary exposure, sun, carrion birds, ritual purity, and bodies that refuse completion.",
    logic:
      "Funerary exposure becomes a vertical dungeon language of sun, carrion, judgment, ritual purity, and bodies that refuse completion.",
    imageNote: "Towers of Silence inspiration image.",
    imageKey: "card-tower-of-silence.webp",
  },
  {
    sourceAnchorId: "sedlec-ossuary",
    title: "Sedlec Ossuary",
    icon: "fa-church",
    sourceType: "Historical Site",
    caption:
      "Bone chandeliers, skull garlands, sacred ornament, anonymous dead, and devotional architecture made from remains.",
    logic:
      "The arrangement of human remains as sacred ornament becomes hostile architecture, devotional pressure, and evidence that the dead have been made decorative.",
    imageNote: "Sedlec Ossuary inspiration image.",
    imageKey: "card-sedlec-ossuary.webp",
  },
  {
    sourceAnchorId: "mortuary-totems",
    title: "Mortuary Totems",
    icon: "fa-monument",
    sourceType: "Funerary Practice",
    caption:
      "Carved memorial guardians, ancestral faces, taboo boundaries, and wood that remembers names and blood.",
    logic:
      "Memorial carving and ancestral guardianship become boundaries that watch, remember blood, and punish trespass without becoming a generic fantasy stereotype.",
    imageNote: "Funerary pole / carved ancestor placeholder.",
    imageKey: "card-mortuary-totem-pole.webp",
  },
  {
    sourceAnchorId: "mustard-gas",
    title: "Mustard Gas",
    icon: "fa-skull-crossbones",
    sourceType: "Weapon",
    caption:
      "Yellow vapor, burning lungs, blistered skin, delayed agony, contaminated cloth, and weaponized air.",
    logic:
      "A historical chemical weapon becomes delayed environmental horror: the air wounds first, and the body understands later.",
    imageNote: "Mustard Gas inspiration image.",
    imageKey: "card-mustard-gas.webp",
  },
  {
    sourceAnchorId: "the-mist",
    title: "The Mist",
    icon: "fa-smog",
    sourceType: "Literary Inspiration",
    caption:
      "Fog as predatory enclosure: collapsed distance, muffled voices, false silhouettes, and things hidden by whiteout.",
    logic:
      "Mist becomes an enclosure that collapses distance, hides impossible life, and turns survival into a visibility problem.",
    imageNote: "The Mist inspiration image.",
    imageKey: "card-the-mist.webp",
  },
  {
    sourceAnchorId: "endocannibalism",
    title: "Endocannibalism",
    icon: "fa-bowl-food",
    sourceType: "Funerary Practice",
    caption:
      "Ancestral incorporation, grief made physical, taboo communion, inherited memory, and hunger inside the family line.",
    logic:
      "Ritual incorporation becomes dark fantasy inheritance: the dead are remembered because they are physically carried inside the living.",
    imageNote: "Endocannibalism inspiration image.",
    imageKey: "card-endocannibalism.webp",
  },
  {
    sourceAnchorId: "genetic-mutations",
    title: "Genetic Mutations",
    icon: "fa-dna",
    sourceType: "Medical / Genetic Concept",
    caption:
      "Heritable corruption, recessive horror, repeated traits, unstable inheritance, and bodies that remember bloodlines.",
    logic:
      "Mutation and inheritance become family horror, visible lineage, unstable bodies, and the terror of what blood remembers.",
    imageNote: "Mutation inspiration image.",
    imageKey: "card-mutations.webp",
  },
  {
    sourceAnchorId: "crucifixion",
    title: "Crucifixion",
    icon: "fa-cross",
    sourceType: "Punitive Practice",
    caption:
      "Raised bodies, nails, witnesses, public suffering, sacred shame, and pain turned into spectacle.",
    logic:
      "Public execution becomes religious pressure, transferred pain, witness guilt, and terrain that remembers displayed suffering.",
    imageNote: "Crucifixion inspiration image.",
    imageKey: "card-crucifixion.webp",
  },
  {
    sourceAnchorId: "impalement",
    title: "Impalement",
    icon: "fa-thumbtack",
    sourceType: "Punitive Practice",
    caption:
      "Stakes, warning displays, border terror, tyrant justice, crows, and bodies made into signs.",
    logic:
      "Impalement becomes a landscape of warnings: authority, cruelty, borders, and bodies turned into signs.",
    imageNote: "Impalement inspiration image.",
    imageKey: "card-impalement.webp",
  },
  {
    sourceAnchorId: "wax-death-masks",
    title: "Wax Death Masks",
    icon: "fa-masks-theater",
    sourceType: "Historical Object",
    caption:
      "Preserved expressions, melting likenesses, false ancestors, copied identity, and faces that remember the dead.",
    logic:
      "A preserved face becomes a portable identity, a false witness, and a relic that remembers expressions better than the living do.",
    imageNote: "Wax Death Masks inspiration image.",
    imageKey: "card-wax-death-mask.webp",
  },
  {
    sourceAnchorId: "anthropodermic-bibliopegy",
    title: "Anthropodermic Bibliopegy",
    icon: "fa-book-open",
    sourceType: "Historical Object",
    caption:
      "Skin-bound books, warm pages, birthmarks on leather, marginal scars, and archives that violate the body.",
    logic:
      "Human-bound books turn knowledge into bodily trespass: the archive reads the reader back.",
    imageNote: "Anthropodermic Bibliopegy inspiration image.",
    imageKey: "card-anthropodermic-bibliopegy.webp",
  },
  {
    sourceAnchorId: "decomposition",
    title: "Decomposition",
    icon: "fa-biohazard",
    sourceType: "Biological Process",
    caption:
      "Forensic decay, gases, bloating, grave wax, insects, skin slippage, and the strange timeline after death.",
    logic:
      "Biological decay becomes pressure, evidence, transformation, contamination, and time out of joint.",
    imageNote: "Decomposition inspiration image.",
    imageKey: "card-decomposition.webp",
  },
  {
    sourceAnchorId: "wolf-spiders",
    title: "Wolf Spiders",
    icon: "fa-spider",
    sourceType: "Animal Behavior",
    caption:
      "Eye shine, carried young, sudden scatter, ground hunting, maternal aggression, and bodies that are also nurseries.",
    logic:
      "Wolf spider behavior becomes horror about carried young, sudden dispersal, protective violence, and bodies that are also nurseries.",
    imageNote: "Wolf Spiders inspiration image.",
    imageKey: "card-wolf-spider.webp",
  },
  {
    sourceAnchorId: "jikininki",
    title: "Jikininki",
    icon: "fa-skull",
    sourceType: "Yokai / Japanese Folklore",
    caption:
      "Corpse hunger, funerary taboo, shame, night feeding, opened graves, and cursed appetite after death.",
    logic:
      "A corpse-eating spirit becomes a toolkit for shame, failed funerary duty, hunger after death, and graveyard mysteries.",
    imageNote: "Jikininki inspiration image.",
    imageKey: "card-jikininki.webp",
  },
  {
    sourceAnchorId: "gashadokuro",
    title: "Gashadokuro",
    icon: "fa-bone",
    sourceType: "Yokai / Japanese Folklore",
    caption:
      "Giant skeletons, famine dead, battlefield bones, rattling teeth, collective resentment, and unburied hunger.",
    logic:
      "The starving skeleton becomes collective death given one body: famine, war, unburied corpses, and hunger large enough to walk.",
    imageNote: "Assembled giant skeleton / battlefield bones placeholder.",
    imageKey: "card-gashadokuro.webp",
  },
]);

const SOURCE_ANCHOR_BY_ID = new Map(SHARED_SOURCE_ANCHORS.map((sourceAnchor) => [sourceAnchor.id, sourceAnchor]));
const COMPONENT_SOURCES = [
  ...SHARED_MONSTER_COMPONENTS,
  ...SHARED_DARKEN_LOCATION_COMPONENTS,
  ...SHARED_LOCATION_REGION_COMPONENTS,
];

export const CORE_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS = Object.freeze(
  CORE_INSPIRATION_CARD_DEFINITIONS.map((card) => card.sourceAnchorId),
);

export const CORE_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET = new Set(
  CORE_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS,
);

export function resolveInspirationCardAsset(card, basePath = INSPIRATION_ASSET_BASE_PATH) {
  return {
    ...card,
    imageProvider: card.imageProvider || INSPIRATION_ASSET_PROVIDER,
    imageUrl: buildInspirationAssetUrl(card.imageKey, basePath),
  };
}

export function buildCoreInspirationFromCard(card) {
  const resolvedCard = resolveInspirationCardAsset(card);
  const sourceAnchorId = card.sourceAnchorId;
  const sourceAnchor = SOURCE_ANCHOR_BY_ID.get(sourceAnchorId) || null;
  const sourceAnchors = normalizeSourceAnchorIds(sourceAnchorId);
  const sourceTypes = uniqueArray([card.sourceType, ...(sourceAnchor?.sourceTypes || [])]);
  const themes = uniqueArray([...(card.themes || []), ...(sourceAnchor?.themes || [])]);
  const motifs = uniqueArray([...(card.motifs || []), ...(sourceAnchor?.motifs || [])]);
  const horror = uniqueArray(sourceAnchor?.horror || []);
  const summary = card.caption || sourceAnchor?.summary || "";

  return {
    id: `inspiration-${sourceAnchorId}`,
    legacyId: card.title,
    title: card.title,
    label: card.title,
    type: "Source Inspiration",
    contentType: "source-inspiration-card",
    status: sourceAnchor?.status || card.status || "draft",
    workflows: ["inspiration-archive"],
    sourceAnchors,
    sourceTypes,
    themes,
    motifs,
    contexts: normalizeStringArray(card.contexts),
    horror,
    summary,
    narrative: card.logic || sourceAnchor?.summary || summary,
    caption: card.caption || "",
    media: {
      icon: card.icon || "fa-book-open",
      imageKey: card.imageKey || "",
      imageNote: card.imageNote || "",
      imageProvider: resolvedCard.imageProvider || "",
      imageUrl: resolvedCard.imageUrl || "",
    },
    inspiration: {
      anchor: card.title,
      sourceType: card.sourceType || sourceAnchor?.type || "",
      logic: card.logic || "",
      imageNote: card.imageNote || "",
    },
    tags: [
      ...sourceAnchors.map((id) => `source:${id}`),
      ...sourceTypes.map((sourceType) => `source-type:${slugify(sourceType)}`),
      ...themes.map((theme) => `theme:${slugify(theme)}`),
      ...motifs.map((motif) => `motif:${slugify(motif)}`),
    ],
  };
}

function entryReferencesSourceAnchor(entry, sourceAnchorId) {
  return normalizeSourceAnchorIds(entry?.sourceAnchors).includes(sourceAnchorId);
}

function getComponentsForSourceAnchor(sourceAnchorId) {
  return uniqueById(COMPONENT_SOURCES.filter((component) => entryReferencesSourceAnchor(component, sourceAnchorId)));
}

function getReferencedSourceAnchorsForModule(module) {
  return uniqueById(
    [
      module.sourceAnchor,
      ...module.components
        .flatMap((component) => normalizeSourceAnchorIds(component.sourceAnchors))
        .map((sourceAnchorId) => SOURCE_ANCHOR_BY_ID.get(sourceAnchorId)),
    ].filter(Boolean),
  );
}

export const CORE_INSPIRATION_MODULES = Object.freeze(
  CORE_INSPIRATION_CARD_DEFINITIONS.map((card) => {
    const sourceAnchor = SOURCE_ANCHOR_BY_ID.get(card.sourceAnchorId) || null;
    const inspiration = buildCoreInspirationFromCard(card);

    return defineInspirationModule({
      id: card.sourceAnchorId,
      title: sourceAnchor?.label || card.title,
      status: sourceAnchor?.status || inspiration.status || "draft",
      packId: CORE_INSPIRATION_MODULE_PACK_ID,
      sourceAnchor,
      inspiration,
      components: getComponentsForSourceAnchor(card.sourceAnchorId),
      metadata: {
        moduleRole: "converted-inspiration",
        source: "shared/content/inspiration-modules/core-inspiration-modules.js",
        migratedFrom: [
          "features/crucible/crucible.sources-data.js",
          "shared/content/source-anchors.js",
          "shared/content/monster-components.js",
          "shared/content/adapters/darken-components.js",
          "shared/content/adapters/location-regions.js",
        ],
      },
    });
  }),
);

const CORE_INSPIRATION_MODULE_BY_SOURCE_ANCHOR_ID = new Map(
  CORE_INSPIRATION_MODULES.map((module) => [module.id, module]),
);

export const CORE_INSPIRATION_MODULE_SOURCE_ANCHORS = Object.freeze(
  uniqueById(CORE_INSPIRATION_MODULES.map((module) => module.sourceAnchor).filter(Boolean)),
);

export const CORE_INSPIRATION_MODULE_INSPIRATIONS = Object.freeze(
  uniqueById(CORE_INSPIRATION_MODULES.map((module) => module.inspiration).filter(Boolean)),
);

export const CORE_INSPIRATION_MODULE_COMPONENTS = Object.freeze(
  uniqueById(CORE_INSPIRATION_MODULES.flatMap((module) => module.components || [])),
);

export const CORE_INSPIRATION_MODULE_REFERENCED_SOURCE_ANCHORS = Object.freeze(
  uniqueById(CORE_INSPIRATION_MODULES.flatMap((module) => getReferencedSourceAnchorsForModule(module))),
);

export function getCoreInspirationModule(sourceAnchorId) {
  return CORE_INSPIRATION_MODULE_BY_SOURCE_ANCHOR_ID.get(sourceAnchorId) || null;
}

export function getCoreInspirationModuleReferencedSourceAnchors(sourceAnchorId) {
  const module = getCoreInspirationModule(sourceAnchorId);
  return module ? getReferencedSourceAnchorsForModule(module) : [];
}
