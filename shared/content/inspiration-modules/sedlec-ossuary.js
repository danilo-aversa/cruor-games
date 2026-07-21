import {
  buildCoreInspirationModuleFromCard,
  buildModuleExports,
} from "./inspiration-module.factory.js";

export const SEDLEC_OSSUARY_SOURCE_ANCHOR_ID = "sedlec-ossuary";
export const SEDLEC_OSSUARY_INSPIRATION_MODULE_PACK_ID =
  "sedlec-ossuary-inspiration-module";

const SEDLEC_WHAT_IT_IS = `
Sedlec Ossuary is not simply a chapel decorated with bones. It is the visible result of centuries of burial, exhumation, religious interpretation, architectural repair, and deliberate artistic rearrangement.

## A cemetery shaped by belief and growth

The ossuary occupies the lower chapel of the Cemetery Church of All Saints in Sedlec, now part of Kutná Hora in Czechia. The church belonged to the Cistercian monastery founded at Sedlec in the twelfth century. When silver mining transformed nearby Kutná Hora into a major medieval centre, the monastery and its cemetery became entangled with the growth, wealth, and mortality of the town.

The cemetery acquired unusual prestige. A long-standing legend held that an abbot had brought soil from the Holy Land and scattered it there, making burial at Sedlec especially desirable. Whether approached as documented history or devotional tradition, that story helped establish the cemetery as more than a local necessity: it became a place in which burial promised proximity to sacred ground.

## Why the remains accumulated

Over the fourteenth and fifteenth centuries, the cemetery received the dead of a dense mining region repeatedly affected by famine, epidemic disease, dangerous labour, and warfare. As burial space became scarce, older graves were opened and the skeletal remains were moved rather than discarded. The two-storey cemetery church provided a practical and religious solution: memorial services could be held above while exhumed remains were kept in the lower chapel below ground.

This distinction matters. An ossuary is not inherently an exhibition of death. It is a place for the secondary care of human remains after burial space has been reused. The bones in Sedlec were therefore not originally gathered as curiosities. They were part of a continuing funerary obligation governed by Christian ideas about memory, bodily resurrection, and respectful storage.

## From storage to composition

The arrangement visible today developed gradually. In the early eighteenth century, architect Jan Blažej Santini-Aichel repaired the church and is associated with the first coherent decorative concept in the lower chapel. The official interpretation of the site describes this Baroque approach as an attempt to place death within divine order: the bones were not merely evidence of extinction, but remains waiting in hope of resurrection.

That framework differs from the modern expectation of a “bone church.” The early design was devotional before it was theatrical. Its intended message belonged to the Christian tradition of memento mori—remember that you must die—not as an invitation to morbidity, but as a prompt to consider conduct, judgement, mortality, and the possibility of salvation.

## The transformation of 1870

After the Cistercian monastery was dissolved in the late eighteenth century, the Schwarzenberg family eventually became patrons of the church. During a major nineteenth-century reconstruction, they commissioned woodcarver František Rint to restore and expand the skeletal decoration. His work, completed in 1870, produced the elements for which Sedlec is now famous: the large chandelier, hanging garlands, chalice-like forms, and the Schwarzenberg coat of arms assembled from human bones.

Rint’s intervention did more than tidy or preserve an existing arrangement. It changed the emotional register of the lower chapel. Where the Baroque composition framed the dead through order, expectation, and resurrection, the nineteenth-century work pushed death forward as the dominant visual material. A visitor can recognize craft, symmetry, and virtuosity at the same moment that they recognize skulls, vertebrae, pelvises, and long bones.

## How the site should be read

That double recognition explains much of the ossuary’s power. The room is neither a random heap nor a neutral museum display. It is a religious interior whose decoration is made from the people entrusted to its care. Beauty and discomfort are not opposites here; they depend on each other. The patterns become impressive because the material was once human, and disturbing because skilled composition can make that fact temporarily recede.

Modern visitors often encounter Sedlec through photography, tourism, and the language of the macabre. The site itself asks for a slower reading. It remains a funerary and religious monument, not evidence that historical communities treated their dead carelessly. Its unsettling quality emerges from the coexistence of piety, anonymous mass death, artistic authorship, and the conversion of bodies into a permanent public environment.
`.trim();

export const SEDLEC_OSSUARY_INSPIRATION_CARD_DEFINITION = Object.freeze({
  sourceAnchorId: "sedlec-ossuary",
  title: "Sedlec Ossuary",
  icon: "fa-church",
  sourceType: "Historical Site",
  caption:
    "A funerary chapel where human remains become devotional ornament, architectural order, and a permanent public environment.",
  logic:
    "The arrangement of human remains as sacred ornament becomes hostile architecture, devotional pressure, and evidence that the dead have been made decorative.",
  card: Object.freeze({
    domain: "place",
    obscurity: "uncommon",
    collectionId: "existing-inspirations",
    collectionLabel: "Existing Inspirations",
    number: 2,
    description:
      "A real ossuary chapel where bones become devotional ornament, geometry, and atmosphere. Its power comes from the collision between sacred space, reverence, display, and the uncomfortable beauty of mortality made visible.",
  }),
  editorial: Object.freeze({
    deck: "A sacred interior where human remains cease to be hidden evidence of mortality and become the material language of architecture.",
    thesis:
      "Horror begins when reverence and utility become impossible to separate.",
    whatItIs: SEDLEC_WHAT_IT_IS,
    cruorLensThesis:
      "The ossuary is disturbing not because death is visible, but because human remains have been made useful, repeatable, and architecturally coherent.",
    cruorLens:
      "Once bones become ornament, support, emblem, and pattern, the room introduces a conflict that cannot be resolved by calling it either reverent or exploitative. It is both. Cruor uses that ambiguity as the source’s central pressure: a system can preserve the dead while simultaneously erasing the persons they were. The more successful the composition becomes, the easier it is to perceive the remains as material—and the more violently their humanity returns when the pattern is interrupted.",
    facts: Object.freeze([
      Object.freeze({
        label: "Place",
        value: "Kutná Hora–Sedlec, Czechia",
      }),
      Object.freeze({
        label: "Institution",
        value: "Cemetery Church of All Saints",
      }),
      Object.freeze({
        label: "Key redesign",
        value: "František Rint, completed 1870",
      }),
      Object.freeze({
        label: "Primary frame",
        value: "Memento mori and resurrection",
      }),
    ]),
    horrorStructures: Object.freeze([
      Object.freeze({
        id: "anonymous-multiplicity",
        title: "Anonymous Multiplicity",
        description:
          "A single body carries identity. A mass of similar remains becomes count, texture, and inventory. Horror appears when scale makes empathy difficult.",
        feeds:
          "Feeds collective bodies, repeated props, counted dead, and identity-erasure components.",
        keywords: Object.freeze([
          "collective",
          "repeated",
          "counted",
          "catalog",
          "identity",
          "many bodies",
        ]),
        componentIds: Object.freeze([]),
      }),
      Object.freeze({
        id: "sacred-instrumentality",
        title: "Sacred Instrumentality",
        description:
          "The dead are preserved and used at the same time. Care and utility occupy the same gesture, preventing a clean moral judgement.",
        feeds:
          "Feeds reliquaries, ritual tools, devotional hazards, and sanctified monster anatomy.",
        keywords: Object.freeze([
          "reliquary",
          "ritual",
          "devotional",
          "sacred",
          "sanctified",
          "altar",
        ]),
        componentIds: Object.freeze([]),
      }),
      Object.freeze({
        id: "order-applied-to-death",
        title: "Order Applied to Death",
        description:
          "Symmetry gives mortality a legible system. The system calms the eye while revealing how completely death can be catalogued and managed.",
        feeds:
          "Feeds patterned rooms, sorting procedures, spatial rules, and self-correcting environments.",
        keywords: Object.freeze([
          "pattern",
          "symmetry",
          "sort",
          "order",
          "sequence",
          "arrangement",
        ]),
        componentIds: Object.freeze([]),
      }),
      Object.freeze({
        id: "beauty-without-consent",
        title: "Beauty Without Consent",
        description:
          "The final composition acquires aesthetic value from material that never chose to become art. Admiration therefore carries an unavoidable residue of trespass.",
        feeds:
          "Feeds alluring threats, coerced transformations, display behaviour, and corrupted preservation.",
        keywords: Object.freeze([
          "beautiful",
          "display",
          "preservation",
          "ornament",
          "chandelier",
          "decoration",
        ]),
        componentIds: Object.freeze([]),
      }),
    ]),
    triggerWarnings: Object.freeze([
      "Human remains",
      "Mass death",
      "Exhumation",
      "Religious imagery",
      "Funerary practice",
      "Body horror",
      "Loss of identity",
    ]),
    tableSafety: Object.freeze([
      "Establish the visual boundary. Ask whether the group is comfortable with explicit skeletal imagery, arranged remains, and detailed descriptions of bodies used as objects.",
      "Scale description without removing function. The same component can be presented graphically, clinically, or symbolically. Preserve the gameplay while reducing anatomical detail when needed.",
      "Do not make funerary care itself the villain. The horror should come from Cruor’s fictional transformation, coercion, or impossible behaviour—not from presenting real religious practice as primitive or evil.",
      "Keep an exit available. Use the group’s preferred safety tools, such as Lines and Veils, an X-card, or open-door breaks, and permit any player to reduce or skip a scene without explanation.",
    ]),
    lowIntensityAlternative:
      "Replace identifiable human bones with carved reliquary forms, mineral casts, or anonymous ivory-like structures. The mechanisms of repetition, sacred utility, and imposed order remain intact.",
    sources: Object.freeze([
      Object.freeze({
        title: "Ossuary History",
        url: "https://www.sedlec.info/en/ossuary/history/",
        description:
          "Official Sedlec account of the cemetery church, skeletal decoration, Santini, Rint, and the site’s memento mori interpretation.",
        meta: "Official institution · Primary orientation",
      }),
      Object.freeze({
        title: "The Cemetery and Ossuary at Sedlec",
        url: "https://link.springer.com/chapter/10.1007/978-3-031-03956-0_12",
        description:
          "Open-access academic chapter placing the church, cemetery, archaeology, and agency of the dead within their historical setting.",
        meta: "Academic chapter · Historical analysis",
      }),
      Object.freeze({
        title: "Kutná Hora World Heritage Context",
        url: "https://whc.unesco.org/en/list/732/",
        description:
          "UNESCO overview of the mining city, Sedlec, and the architectural importance of the surrounding historic complex.",
        meta: "UNESCO · Regional context",
      }),
    ]),
    furtherReading: Object.freeze([
      Object.freeze({
        title: "Ossuary Repair",
        url: "https://www.sedlec.info/en/ossuary/repair/",
        description:
          "Official documentation of the ongoing conservation process, including vaults, stucco, and the reconstruction of bone pyramids.",
        meta: "Conservation · Behind the monument",
      }),
      Object.freeze({
        title: "Sedlec Ossuary Interior Archive",
        url: "https://commons.wikimedia.org/wiki/Category:Sedlec_Ossuary_-_Interior",
        description:
          "A broad visual collection useful for comparing chandeliers, garlands, pyramids, inscriptions, and room-scale composition.",
        meta: "Image archive · Visual research",
      }),
      Object.freeze({
        title: "Sedlec Cathedral History",
        url: "https://www.sedlec.info/en/cathedral/history/",
        description:
          "Background on the Cistercian abbey and the larger sacred landscape to which the cemetery church belongs.",
        meta: "Official institution · Wider setting",
      }),
    ]),
    relatedDossiers: Object.freeze([
      Object.freeze({
        sourceAnchorId: "towers-of-silence",
        title: "Towers of Silence",
        relationship: "Shared motif · Funerary transformation",
        description:
          "The dead body becomes part of an exposed ecological and ritual process rather than a sealed private object.",
      }),
      Object.freeze({
        sourceAnchorId: "anthropodermic-bibliopegy",
        title: "Anthropodermic Bibliopegy",
        relationship: "Shared motif · Human material",
        description:
          "Human tissue is preserved by converting it into a carrier for memory, authority, and text.",
      }),
      Object.freeze({
        sourceAnchorId: "decomposition",
        title: "Decomposition",
        relationship: "Opposite principle · Dissolution",
        description:
          "Where the ossuary disciplines the body into order, decomposition makes bodily matter impossible to stabilize.",
      }),
    ]),
    whyItDisturbs: "",
    creativeUses: Object.freeze([]),
    cautions: Object.freeze([]),
  }),
  media: Object.freeze({
    imageTitle: "Sedlec Ossuary Interior",
    imageAlt:
      "Human bones arranged as devotional ornament inside Sedlec Ossuary.",
    imageCredit: "",
  }),
  imageNote: "Sedlec Ossuary inspiration image.",
  imageKey: "card-sedlec-ossuary.webp",
});

export const SEDLEC_OSSUARY_INSPIRATION_MODULE =
  buildCoreInspirationModuleFromCard(
    SEDLEC_OSSUARY_INSPIRATION_CARD_DEFINITION,
    {
      metadata: {
        source: "shared/content/inspiration-modules/sedlec-ossuary.js",
      },
    },
  );

const SEDLEC_OSSUARY_MODULE_EXPORTS = buildModuleExports(
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
);

export const SEDLEC_OSSUARY_SOURCE_ANCHOR =
  SEDLEC_OSSUARY_MODULE_EXPORTS.sourceAnchor;
export const SEDLEC_OSSUARY_INSPIRATION =
  SEDLEC_OSSUARY_MODULE_EXPORTS.inspiration;
export const SEDLEC_OSSUARY_MONSTER_GRAFT_COMPONENTS =
  SEDLEC_OSSUARY_MODULE_EXPORTS.monsterGrafts;
export const SEDLEC_OSSUARY_LOCATION_COMPONENTS =
  SEDLEC_OSSUARY_MODULE_EXPORTS.locationComponents;
export const SEDLEC_OSSUARY_LOCATION_REGION_COMPONENTS =
  SEDLEC_OSSUARY_MODULE_EXPORTS.locationRegions;
export const SEDLEC_OSSUARY_REFERENCED_SOURCE_ANCHORS =
  SEDLEC_OSSUARY_MODULE_EXPORTS.referencedSourceAnchors;
