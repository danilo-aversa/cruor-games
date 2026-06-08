const SOURCE_ANCHOR_STATUS = {
  PUBLISHED: "published",
  DRAFT: "draft",
};

export const SHARED_SOURCE_ANCHORS = [
  {
    id: "decomposition",
    label: "Decomposition",
    type: "Biological Process",
    status: SOURCE_ANCHOR_STATUS.PUBLISHED,
    workflows: ["darken-location", "monster-composer", "inspiration-archive"],
    sourceTypes: ["Biological Process"],
    themes: ["corpse transformation", "organic architecture", "disease", "rot"],
    motifs: ["bloating", "skin slippage", "grave wax", "gas", "sweet rot"],
    horror: ["Body Horror", "Disease Horror"],
    summary:
      "Decay treated as an active design language: swelling, seepage, softening, gas, smell, contagion, and matter changing state.",
  },
  {
    id: "jikininki",
    label: "Jikininki",
    type: "Folklore",
    status: SOURCE_ANCHOR_STATUS.PUBLISHED,
    workflows: ["monster-composer", "inspiration-archive"],
    sourceTypes: ["Folklore", "Religious Tale"],
    themes: ["corpse hunger", "funerary taboo", "shame", "spiritual punishment"],
    motifs: ["grave hunger", "stolen offerings", "funeral silence", "hidden feeding"],
    horror: ["Folk Horror", "Religious Horror"],
    summary:
      "A corpse-eating spirit used as a source for hunger, shame, funeral transgression, and post-mortem punishment.",
  },
    {
    id: "wolf-spiders",
    label: "Wolf Spiders",
    type: "Biological Creature",
    status: SOURCE_ANCHOR_STATUS.PUBLISHED,
    workflows: ["monster-composer", "inspiration-archive"],
    sourceTypes: ["Animal", "Biology"],
    themes: ["predatory motherhood", "multiplying bodies", "ambush", "surface tension"],
    motifs: ["carried spider young", "eye shine", "sudden scatter", "leg vibration"],
    horror: ["Body Horror", "Predatory Horror"],
    summary:
      "A biological anchor for swarms, carried offspring, sudden motion, many eyes, and close predation.",
  },
  {
    id: "wax-death-masks",
    label: "Wax Death Masks",
    type: "Material Culture",
    status: SOURCE_ANCHOR_STATUS.PUBLISHED,
    workflows: ["monster-composer", "inspiration-archive"],
    sourceTypes: ["Material Culture", "Funerary Object"],
    themes: ["post-mortem likeness", "identity residue", "false presence", "memory preservation"],
    motifs: ["wax face", "sunken eyes", "softening features", "borrowed likeness"],
    horror: ["Gothic", "Psychological Horror"],
    summary:
      "Funerary likenesses and preserved faces used for identity horror, imitation, memory, and the uncanny dead.",
  },
  {
    id: "sedlec-ossuary",
    label: "Sedlec Ossuary",
    type: "Architecture / Sacred Site",
    status: SOURCE_ANCHOR_STATUS.DRAFT,
    workflows: ["darken-location", "inspiration-archive"],
    sourceTypes: ["Architecture", "Sacred Site", "Material Culture"],
    themes: ["devotional bonework", "holy display", "mass remains", "ornamental death"],
    motifs: ["bone chandelier", "skull garlands", "arranged remains", "chapel dust"],
    horror: ["Religious Horror", "Gothic"],
    summary:
      "A draft Source Anchor for sacred architecture built from human remains and devotional ornament.",
  },
  {
    id: "towers-of-silence",
    label: "Towers of Silence",
    type: "Funerary Practice",
    status: SOURCE_ANCHOR_STATUS.DRAFT,
    workflows: ["darken-location", "monster-composer", "inspiration-archive"],
    sourceTypes: ["Funerary Practice", "Ritual"],
    themes: ["exposure", "sky burial", "ritual purity", "corpse ecology"],
    motifs: ["circling birds", "open stone", "sun-bleached bone", "ritual boundary"],
    horror: ["Religious Horror", "Folk Horror"],
    summary:
      "A draft Source Anchor for exposed dead, scavenger ecology, sacred disposal, and ritual boundaries.",
  },
  {
    id: "anthropodermic-bibliopegy",
    label: "Anthropodermic Bibliopegy",
    type: "Material Culture",
    status: SOURCE_ANCHOR_STATUS.DRAFT,
    workflows: ["darken-location", "inspiration-archive"],
    sourceTypes: ["Book History", "Material Culture"],
    themes: ["skin as archive", "forbidden preservation", "body text", "ownership after death"],
    motifs: ["warm pages", "skin binding", "faint pores", "human cover"],
    horror: ["Body Horror", "Occult Horror"],
    summary:
      "A draft Source Anchor for books, skin, memory, ownership, and bodies turned into texts.",
  },
  {
    id: "mustard-gas",
    label: "Mustard Gas",
    type: "Historical Weapon",
    status: SOURCE_ANCHOR_STATUS.DRAFT,
    workflows: ["darken-location", "monster-composer", "inspiration-archive"],
    sourceTypes: ["Historical Weapon", "Chemical Hazard"],
    themes: ["weaponized air", "invisible contamination", "delayed injury", "burning lungs"],
    motifs: ["yellow vapor", "blistered skin", "tainted mask", "sour chemical air"],
    horror: ["War Horror", "Disease Horror", "Body Horror"],
    summary:
      "A draft Source Anchor for delayed chemical harm, poisoned atmosphere, masks, and invisible battlefield contamination.",
  },
  {
    id: "the-mist",
    label: "The Mist",
    type: "Literary / Cinematic Source",
    status: SOURCE_ANCHOR_STATUS.DRAFT,
    workflows: ["darken-location", "inspiration-archive"],
    sourceTypes: ["Literature", "Film", "Cosmic Horror"],
    themes: ["unknown ecosystem", "reduced visibility", "social collapse", "threshold breach"],
    motifs: ["white wall", "shapes in fog", "creatures beyond glass", "panic indoors"],
    horror: ["Cosmic Horror", "Survival Horror"],
    summary:
      "A draft Source Anchor for fog-bound spaces, impossible creatures, lost visibility, and social pressure under siege.",
  },
  {
    id: "mortuary-totems",
    label: "Mortuary Totems",
    type: "Funerary Practice",
    status: SOURCE_ANCHOR_STATUS.DRAFT,
    workflows: ["darken-location", "inspiration-archive"],
    sourceTypes: ["Funerary Practice", "Material Culture"],
    themes: ["ancestral memory", "taboo boundary", "carved guardianship", "lineage pressure"],
    motifs: ["carved faces", "ancestor poles", "watchful wood", "borrowed eyes"],
    horror: ["Folk Horror", "Religious Horror"],
    summary:
      "A draft Source Anchor for memorial guardianship, carved ancestry, taboo boundaries, and watchful objects.",
  },
  {
    id: "endocannibalism",
    label: "Endocannibalism",
    type: "Funerary Practice",
    status: SOURCE_ANCHOR_STATUS.DRAFT,
    workflows: ["darken-location", "inspiration-archive"],
    sourceTypes: ["Funerary Practice", "Ritual"],
    themes: ["corpse hunger", "funerary taboo", "ancestral incorporation", "grief made physical"],
    motifs: ["ancestor meal", "taboo communion", "inherited memory", "ash on the tongue"],
    horror: ["Folk Horror", "Body Horror"],
    summary:
      "A draft Source Anchor for ritual incorporation, inherited memory, family hunger, and grief made physical.",
  },
  {
    id: "genetic-mutations",
    label: "Genetic Mutations",
    type: "Medical / Genetic Concept",
    status: SOURCE_ANCHOR_STATUS.DRAFT,
    workflows: ["darken-location", "inspiration-archive"],
    sourceTypes: ["Medical / Genetic Concept"],
    themes: ["heritable corruption", "recessive horror", "bloodline instability", "beautiful defect"],
    motifs: ["repeated traits", "family portraits", "extra fingers", "corrected genealogy"],
    horror: ["Body Horror", "Psychological Horror"],
    summary:
      "A draft Source Anchor for bloodline horror, unstable bodies, family repetition, and inheritance made visible.",
  },
  {
    id: "crucifixion",
    label: "Crucifixion",
    type: "Punitive Practice",
    status: SOURCE_ANCHOR_STATUS.DRAFT,
    workflows: ["darken-location", "inspiration-archive"],
    sourceTypes: ["Punitive Practice", "Religious Image"],
    themes: ["public martyrdom", "ritualized suffering", "witnessed punishment", "sacred shame"],
    motifs: ["nails", "raised bodies", "witnesses", "splintered wood", "warm iron"],
    horror: ["Religious Horror", "Gothic"],
    summary:
      "A draft Source Anchor for public suffering, sacred shame, witness guilt, and pain turned into spectacle.",
  },
  {
    id: "impalement",
    label: "Impalement",
    type: "Punitive Practice",
    status: SOURCE_ANCHOR_STATUS.DRAFT,
    workflows: ["darken-location", "inspiration-archive"],
    sourceTypes: ["Punitive Practice"],
    themes: ["vertical execution", "tyrant justice", "border terror", "warning display"],
    motifs: ["stakes", "raised bodies", "crows", "empty poles", "slow descent"],
    horror: ["Gothic", "War Horror"],
    summary:
      "A draft Source Anchor for warning landscapes, borders, cruelty, authority, and bodies turned into signs.",
  },
];

export const SOURCE_ANCHOR_ALIASES = {
  decomposition: "decomposition",
  decay: "decomposition",
  rot: "decomposition",
  jikininki: "jikininki",
  "wolf-spider": "wolf-spiders",
  "wolf-spiders": "wolf-spiders",
  "wolf spiders": "wolf-spiders",
  "wax-death-mask": "wax-death-masks",
  "wax-death-masks": "wax-death-masks",
  "wax death mask": "wax-death-masks",
  "wax death masks": "wax-death-masks",
  "sedlec-ossuary": "sedlec-ossuary",
  "sedlec ossuary": "sedlec-ossuary",
  "towers-of-silence": "towers-of-silence",
  "towers of silence": "towers-of-silence",
  "tower of silence": "towers-of-silence",
  "anthropodermic-bibliopegy": "anthropodermic-bibliopegy",
  "anthropodermic bibliopegy": "anthropodermic-bibliopegy",
  "mustard-gas": "mustard-gas",
  "mustard gas": "mustard-gas",
  "the-mist": "the-mist",
  "the mist": "the-mist",
  "mortuary-totems": "mortuary-totems",
  "mortuary totems": "mortuary-totems",
  endocannibalism: "endocannibalism",
  "genetic-mutations": "genetic-mutations",
  "genetic mutations": "genetic-mutations",
  crucifixion: "crucifixion",
  impalement: "impalement",
};

export function getSourceAnchorId(value) {
  const key = String(value || "").trim().toLowerCase();
  return SOURCE_ANCHOR_ALIASES[key] || key;
}

export function normalizeSourceAnchorIds(values) {
  const ids = Array.isArray(values) ? values : [values];
  return [...new Set(ids.map(getSourceAnchorId).filter(Boolean))];
}
