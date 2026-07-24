import { TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE } from "./content-packs/towers-of-silence-semantic-v2-pack.js";

export const TOWERS_OF_SILENCE_DOSSIER_REVIEW_VERSION =
  "dossier-towers-of-silence-editorial-approved-v2";

const REVIEWED_AT = "2026-07-23";
const BASE_MODULE = TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE;

const CARD = {
  domain: "rite",
  obscurity: "uncommon",
  collectionId: "existing-inspirations",
  collectionLabel: "Existing Inspirations",
  number: 1,
  description:
    "A roofless funerary enclosure built around exposure, strict boundaries, and the protection of the elements from bodily decay. Its strongest creative lesson is not spectacle, but sequence: every wall, drain, attendant, scavenger, and forbidden threshold exists to carry death safely through a controlled process.",
};

const EDITORIAL = {
  deck:
    "Roofless funerary enclosures turned sunlight, scavenging birds, drainage, and strict boundaries into a way of protecting the living world from the material consequences of death.",
  whatItIs: `## A Place That Refuses the Usual Funeral

In several Zoroastrian traditions, the dead were treated with care while the corpse itself was understood as a source of ritual contamination. This was not a judgment on the person who had died. It was a problem created by death: decay should not be allowed to pollute earth, fire, or water, all of which hold religious importance within Zoroastrian thought.

Exposure offered a solution. The body could be placed in a designated open-air location, separated from ordinary settlement life and handled by appointed funerary attendants. Sun, weather, and carrion birds removed what was perishable; the remaining bones could later be collected or contained. Zoroastrian communities have never been completely uniform, and funerary practice has changed across time and place, but the guiding idea is strikingly consistent: death must be managed without passing its corruption into the elements.

## The Rite Is Older Than the Tower

The word dakhma did not always mean the circular roofless structure now called a Tower of Silence. Its older meaning was closer to “grave,” while the famous enclosed towers are not attested in Iran until the Islamic period. The practice of exposure is therefore older than the architecture most people recognize.

The walls were a later practical answer to a changed world. They protected the exposure ground from trespass, concealed its interior, and turned an elevated place into a controlled enclosure. What looks from outside like a blunt, silent cylinder is better understood as a machine for boundaries: who may enter, where the body may rest, where water may flow, and where the transformed remains may finally go.

## An Interior Built as a Sequence

The best-known Parsi dakhmas of India used concentric stone divisions around a central receptacle. Historical descriptions distinguish areas for men, women, and children, while channels and filtering materials helped manage drainage. This arrangement should not be treated as universal, but it reveals how engineered the process could be. The body was not simply “left outside.” It entered a carefully ordered system whose architecture separated exposure, weathering, collection, and containment.

The nineteenth-century engraving used for this dossier shows that interior through a Western documentary lens. It was published in an 1881 U.S. government report and was based on a model and written description rather than unrestricted observation inside the enclosure. It is useful evidence, but not a neutral sacred image or a plan for every dakhma.

## The Dog's Last Look

One of the most distinctive details of Zoroastrian funerary practice is the sagdid, the “gaze of the dog.” A dog was brought to look upon the deceased during the funerary sequence. Dogs hold a respected protective place in Zoroastrian tradition, and their presence formed part of the ritual response to death.

The detail is memorable because it overturns the usual imagery of horror. The animal is not there to threaten the dead. It stands at a boundary, participating in the community's effort to separate a loved person from the dangerous material condition of the corpse.

## When a Modern Drug Emptied the Sky

Vultures were not decorative omens. They were ecological participants whose speed made the system work. During the late twentieth century, populations of several South Asian vulture species collapsed after feeding on livestock treated with diclofenac, a veterinary painkiller that is highly toxic to them.

The ecological disaster became a funerary crisis for Parsi communities that still used dakhmas. An ancient religious practice was disrupted not by a lost prayer or a conquered temple, but by residues of a modern medicine in an animal food chain. It is a vivid reminder that ritual, architecture, and ecology are never truly separate systems.`,
  cruorLens:
    "Towers of Silence offer a spatial grammar rather than a monster. Their creative power lies in a system of meaningful oppositions—exposure and shelter, interior and exterior, purity and contamination—held together by an architecture in which every wall, drain, attendant, and threshold serves a precise purpose. Horror enters when that sequence fails: the birds do not arrive, a channel carries material beyond the enclosure, a body remains unchanged beneath the sun, or an unauthorized witness crosses a boundary designed to protect both the dead and the community. Cruor should preserve the dignity and internal logic of the historical practice, placing supernatural pressure in the collapse of its safeguards rather than in Zoroastrian belief itself.",
  facts: [],
  horrorStructures: [],
  triggerWarnings: ["Death", "Bones", "Gore", "Religion", "Animal Death"],
  tableSafety: [
    "Fictionalize the site completely: change its name, culture, theology, attendants, symbols, and ritual vocabulary rather than placing a real Zoroastrian community or dakhma directly into the game world.",
    "Preserve the source's dignity through function, not imitation. Keep the ideas of protected elements, restricted thresholds, careful handling of the dead, and an ordered passage without copying prayers or sacred procedures.",
    "Place the horror in the failure or corruption of the fictional system—not in the people who built it, the funerary role itself, or the belief that death requires careful containment.",
    "Avoid caricature, exotic spectacle, comic attendants, moralized scavengers, and imagery that treats exposed bodies as proof that a real culture is primitive or cruel.",
    "Use body exposure, carrion feeding, religiously coded architecture, and visible remains only after checking table boundaries; substitute sealed chambers, empty stone rings, blocked drains, or absent birds when those elements are unwelcome.",
  ],
  lowIntensityAlternative:
    "Use an abandoned, fully fictional exposure sanctuary after its final rite. Replace visible bodies with weathered stone rings, sealed records, blocked drains, absent birds, and one personal object left where nothing should remain.",
  sources: [
    {
      title: "Burial iii. In Zoroastrianism",
      url: "https://www.iranicaonline.org/articles/burial-iii/",
      description:
        "A concise historical overview of Zoroastrian funerary practice, the changing meaning of dakhma, and the later emergence of enclosed Towers of Silence.",
      meta: "Encyclopaedia Iranica",
    },
    {
      title: "Corpse: Disposal of, in Zoroastrianism",
      url: "https://www.iranicaonline.org/articles/corpse-disposal-of-in-zoroastrianism/",
      description:
        "A detailed account of ritual pollution, funerary attendants, sagdid, regional practice, and historical procedures at the dakhma.",
      meta: "Encyclopaedia Iranica · Mary Boyce",
    },
    {
      title: "Parsee Towers of Silence (interior)",
      url: "https://americanhistory.si.edu/collections/nmah_750347",
      description:
        "The Smithsonian object record for Henry Hobart Nichols Sr.'s 1881 engraved woodblock and its original publication context.",
      meta: "National Museum of American History",
    },
  ],
  furtherReading: [
    {
      title: "Astodan: Bone-Receptacle, Ossuary",
      url: "https://www.iranicaonline.org/articles/astodan-ossuary/",
      description:
        "Explains the relationship between exposure, cleaned bones, ossuaries, and the later combination of functions within communal dakhmas.",
      meta: "Encyclopaedia Iranica",
    },
    {
      title: "Removing the Threat of Diclofenac to Critically Endangered Asian Vultures",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1351921/",
      description:
        "An accessible account of the vulture population collapse, the role of veterinary diclofenac, and its social effect on Parsi funerary practice.",
      meta: "PLoS Biology · Open access",
    },
    {
      title: "Chilpik, the Tower of Silence",
      url: "https://whc.unesco.org/en/tentativelists/6902/",
      description:
        "A heritage overview of a surviving Central Asian dakhma and its place in the cultural landscape of Karakalpakstan.",
      meta: "UNESCO World Heritage Centre · Tentative List",
    },
  ],
  relatedDossiers: [
    {
      sourceAnchorId: "decomposition",
      title: "Decomposition",
      relationship: "Material process",
      description:
        "Explore how environments record bodily change when a natural process accelerates, stalls, or spreads beyond its expected boundary.",
    },
    {
      sourceAnchorId: "sedlec-ossuary",
      title: "Sedlec Ossuary",
      relationship: "Bone architecture",
      description:
        "Compare containment and transformation with a site where human remains become visible architectural material rather than an exposure sequence.",
    },
    {
      sourceAnchorId: "jikininki",
      title: "Jikininki",
      relationship: "Death and appetite",
      description:
        "A thematically related but culturally distinct dossier about hunger, the dead, and failed religious duty. Do not treat the traditions as equivalent.",
    },
  ],
  whyItDisturbs:
    "A process designed to carry death safely out of ordinary life becomes frightening when it stalls, reverses, or begins recording every intrusion as unfinished passage.",
  creativeUses: [
    "Use exposed and sheltered routes to make boundaries and cover mechanically readable.",
    "Turn drainage, scratch paths, and receptacles into investigative evidence rather than decorative corpses.",
    "Let restoring material order reduce pressure without requiring players to imitate a sacred rite.",
    "Use an announced sky-facing route as a fair climax while preserving a sheltered retreat.",
  ],
  cautions: [
    "Do not present Zoroastrian funerary practice as barbaric, evil, monolithic, or frozen outside history.",
    "Do not claim that carrion birds or speed of exposure reveal the moral or spiritual worth of the dead.",
    "Do not use exposed remains as spectacle without personhood, community, and material context.",
    "Clearly label supernatural refusal, judgment, shadows, and pressure mechanics as Cruor fantasy rather than historical belief.",
    "Do not require players to reproduce prayers, purity rules, or sacred procedures as a game solution.",
  ],
};

const MEDIA = {
  imageTitle: "Parsee Towers of Silence (interior)",
  imageKey: "card-tower-of-silence.webp",
  imageProvider: "local",
  imageAlt:
    "Nineteenth-century wood engraving of the interior of a Parsi dakhma, showing concentric stone divisions around a central well while vultures line the circular parapet.",
  imageCredit:
    "Parsee Towers of Silence (interior), wood engraving by Henry Hobart Nichols Sr., 1881. U.S. Government Printing Office; scan by Internet Archive Book Images via Wikimedia Commons. Public domain.",
  imageCreator: "Henry Hobart Nichols Sr. (1838–1887)",
  imageSourceTitle:
    "Annual Report of the Bureau of Ethnology, 1879–80 (1881), fig. 3; scan by Internet Archive Book Images",
  imageSourceUrl:
    "https://commons.wikimedia.org/wiki/File:Annual_report_of_the_Bureau_of_ethnology_to_the_secretary_of_the_Smithsonian_Institution_(1881)_(14782082584).jpg",
  imageLicense:
    "Public domain in the United States; Wikimedia Commons reports no known copyright restrictions",
  imageLicenseUrl:
    "https://commons.wikimedia.org/wiki/File:Annual_report_of_the_Bureau_of_ethnology_to_the_secretary_of_the_Smithsonian_Institution_(1881)_(14782082584).jpg#Licensing",
  imageRightsStatus: "public-domain",
  imageRightsVerifiedAt: REVIEWED_AT,
  imageModifications:
    "Converted to WebP for site presentation and displayed with the site's card crop; no substantive alteration to the engraving.",
  icon: "fa-tower-observation",
};

export const TOWERS_OF_SILENCE_PUBLISHED_SEMANTIC_V2_MODULE = Object.freeze({
  ...BASE_MODULE,
  status: "published",
  sourceAnchor: {
    ...BASE_MODULE.sourceAnchor,
    status: "published",
    citation: {
      label: "Encyclopaedia Iranica, Burial iii. In Zoroastrianism",
      url: "https://www.iranicaonline.org/articles/burial-iii/",
      accessedVersion: `Accessed ${REVIEWED_AT}; ${TOWERS_OF_SILENCE_DOSSIER_REVIEW_VERSION}`,
    },
    summary:
      "A respectful source dossier on Zoroastrian exposure practices, later dakhma architecture, the protection of earth, fire, and water from bodily decay, and the ecological role of scavenging birds.",
    editorialNotes: [
      ...(BASE_MODULE.sourceAnchor?.editorialNotes || []).filter(
        (note) => !String(note).includes("image provenance"),
      ),
      "Public Dossier copy and image provenance reviewed on 2026-07-23. The local image remains card-tower-of-silence.webp and is sourced from the identified Wikimedia Commons scan of the 1881 engraving.",
      "The public article distinguishes the living Zoroastrian religion from Cruor's fictional supernatural failures and avoids treating dakhma practice as spectacle or moral judgment.",
    ],
  },
  inspiration: {
    ...BASE_MODULE.inspiration,
    status: "approved",
    card: CARD,
    editorial: {
      ...(BASE_MODULE.inspiration?.editorial || {}),
      ...EDITORIAL,
    },
    media: {
      ...(BASE_MODULE.inspiration?.media || {}),
      ...MEDIA,
    },
    tags: [
      ...new Set([
        ...(BASE_MODULE.inspiration?.tags || []),
        "public-dossier",
        "cultural-source-reviewed",
        "image-provenance-verified",
      ]),
    ],
  },
  components: (BASE_MODULE.components || []).map((component) => ({
    ...component,
    status: "published",
  })),
  metadata: {
    ...(BASE_MODULE.metadata || {}),
    revision: 2,
    reviewedAt: REVIEWED_AT,
    publicationStatus: "published",
    dossierReviewVersion: TOWERS_OF_SILENCE_DOSSIER_REVIEW_VERSION,
    imageProvenanceStatus: "verified",
  },
});

/**
 * Explicit publication boundary for semantic Inspiration v2 modules.
 *
 * Published modules replace their legacy public counterpart and are also
 * exposed to Inspiration Studio through the repository adapter.
 */
export const PUBLISHED_SEMANTIC_INSPIRATION_MODULES = Object.freeze([
  TOWERS_OF_SILENCE_PUBLISHED_SEMANTIC_V2_MODULE,
]);
