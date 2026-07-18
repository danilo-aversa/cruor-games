import { createPhase8SemanticCandidate } from "./phase8-semantic-candidate.factory.js";
import {
  ANTHROPODERMIC_BIBLIOPEGY_INSPIRATION_MODULE,
  ANTHROPODERMIC_BIBLIOPEGY_LOCATION_COMPONENTS,
  ANTHROPODERMIC_BIBLIOPEGY_LOCATION_REGION_COMPONENTS,
} from "../inspiration-modules/anthropodermic-bibliopegy.js";

export const ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_PACK_ID = "anthropodermic-bibliopegy-semantic-v2";
export const ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE_ID = "anthropodermic-bibliopegy";
export const ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_SOURCE_ANCHOR_ID = "anthropodermic-bibliopegy";

const RESULT = createPhase8SemanticCandidate({
  approval: {
    reviewer: "Danilo",
    reviewedAt: "2026-07-17",
    publicationBlockers: ["image-provenance-required"],
  },
  legacyModule: ANTHROPODERMIC_BIBLIOPEGY_INSPIRATION_MODULE,
  legacyComponents: [
    ...ANTHROPODERMIC_BIBLIOPEGY_LOCATION_COMPONENTS,
    ...ANTHROPODERMIC_BIBLIOPEGY_LOCATION_REGION_COMPONENTS,
  ],
  "slug": "anthropodermic-bibliopegy",
  "title": "Anthropodermic Bibliopegy",
  "sourceKind": "object",
  "citation": {
    "label": "Harvard Library, statement on Des destinées de l’âme and its stewardship",
    "url": "https://library.harvard.edu/about/news/2024-03-27/statement-des-destinees-de-lame-and-its-stewardship",
    "reliability": "primary"
  },
  "sourceSummary": "Harvard Library documents a book formerly bound with human skin taken without consent, the institution’s stewardship review, removal of the binding, and continuing provenance and respectful-disposition work. Cruor fiction begins with responsive catalogs and a supernatural Custody Index.",
  "sourceTypes": [
    "Human Remains",
    "Historical Object",
    "Library Stewardship"
  ],
  "themes": [
    "consent and provenance",
    "institutional objectification",
    "custody and restitution",
    "body made catalog"
  ],
  "motifs": [
    "skin binding",
    "redacted name",
    "warm cover",
    "custody ledger"
  ],
  "horror": [
    "Body Horror",
    "Occult Horror",
    "Gothic"
  ],
  "contexts": [
    "archive",
    "library",
    "noble-house",
    "secret"
  ],
  "reviewTag": "human-remains-ethics-review-required",
  "publicationBlockers": [
    "human-editorial-signoff-required",
    "human-remains-ethics-review-required",
    "sample-qa-local-verification-required",
    "image-provenance-required"
  ],
  "sourceBoundary": "Harvard’s documented stewardship case provides bounded evidence about non-consensual human remains in a book binding and institutional responsibility. Responsive pages, bodily indexing, and the Custody Index track are Cruor fiction. No manufacturing or preservation instructions are included.",
  "provenanceNote": "Editorially re-authored from the frozen Anthropodermic Bibliopegy location and region vocabulary, centered on consent, provenance, stewardship, and personhood.",
  "migrationNote": "AI-assisted editorial candidate. Harvard stewardship evidence, human-remains ethics review, local sample QA, image provenance, and final human approval remain explicit publication gates.",
  "editorialNotes": [
    "Human-remains boundary: the binding is treated as remains of a person, not an exotic craft material.",
    "Consent boundary: lack of consent is central and cannot be repaired by collector prestige or institutional custody.",
    "Stewardship boundary: catalogs, provenance research, removal, restitution, and respectful disposition are actionable systems.",
    "Safety boundary: no manufacturing, tanning, preservation, or acquisition instructions are included.",
    "Fictional transformation: responsive pages, bodily marks, and Custody Index are Cruor fiction.",
    "Ownership boundary: this module owns Archive and Dark Places only and has no Monster capability link.",
    "Publication gate: human-remains ethics review, repeatable local sample QA, human signoff, and image provenance remain required."
  ],
  "sourceTags": [
    "human-remains",
    "book-history",
    "provenance",
    "stewardship"
  ],
  "editorial": {
    "deck": "A library has catalogued a violated person as material, and the archive now records readers as future holdings.",
    "whatItIs": "Anthropodermic bibliopegy describes books bound with human skin. The cited Harvard case documents non-consensual acquisition, institutional stewardship failures, removal of the binding, provenance research, and work toward respectful disposition.",
    "whyItDisturbs": "Cruor horror targets the calm institutional conversion of a person into an object and the systems that preserve prestige while erasing consent.",
    "creativeUses": [
      "Use provenance gaps as actionable clues.",
      "Turn catalog language into a coercive spatial system.",
      "Make removal, documentation, and restitution meaningful counterplay.",
      "Center the unnamed person rather than the collector or object."
    ],
    "cautions": [
      "Do not aestheticize human remains as luxury material.",
      "Do not include procedural binding or preservation detail.",
      "Do not imply institutional possession equals ethical legitimacy.",
      "Keep consent, personhood, and respectful disposition visible.",
      "Label responsive books and bodily indexing as fiction."
    ]
  },
  "media": {
    "imageKey": "card-anthropodermic-bibliopegy.webp",
    "imageProvider": "local",
    "imageAlt": "Anthropodermic Bibliopegy inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
    "imageCredit": "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep unpublished until provenance is verified or the image is replaced.",
    "icon": "fa-book-open"
  },
  "identity": {
    "title": "The Archive That Catalogues People",
    "motifs": [
      "custody ledger",
      "redacted patient",
      "warm shelf"
    ],
    "originalPurpose": "A restricted library preserved medical, legal, and family records under documented custody and access rules.",
    "originalUsers": [
      "librarians maintaining provenance",
      "researchers consulting controlled materials",
      "families seeking records about named people"
    ],
    "historicalChange": "Collectors converted an unnamed person into binding material, obscured the acquisition, and rewarded the object’s prestige over the person’s dignity.",
    "horrorTruth": "The archive now treats every reader as potential material and rewrites catalog entries to make possession appear older and more legitimate.",
    "currentFunction": "The party can reconstruct provenance, isolate responsive volumes, recover the erased person’s identity, and redirect custody toward respectful disposition.",
    "currentConflict": "A curator wants the collection sealed to protect institutional reputation while descendants and staff need evidence preserved and the remains removed from display.",
    "playerEntryPoints": [
      "Find the redacted accession record.",
      "Secure the responsive volume without treating it as treasure.",
      "Identify who was erased from the catalog."
    ],
    "stakes": [
      "At Custody Index 4, the announced shelf assigns one living reader as collection material.",
      "Destroying the volume may destroy evidence needed for restitution.",
      "Documented removal and disposition can end the archive’s claim."
    ],
    "toneKeywords": [
      "institutional",
      "intimate",
      "restrained",
      "accusatory"
    ]
  },
  "atmosphere": {
    "title": "Warm Covers, Dry Paper, and Redacted Names",
    "motifs": [
      "warm book",
      "catalog silence",
      "erased person"
    ],
    "signature": "Quiet shelves and precise labels conceal one warm volume whose catalog entry names owners but not the person made into material.",
    "manifestations": [
      {
        "id": "cover-tightens",
        "text": "A cover tightens when an accession number is spoken.",
        "senses": [
          "sight",
          "sound"
        ],
        "intensity": "low",
        "frequency": "recurring"
      },
      {
        "id": "redaction-rubs-off",
        "text": "A catalog redaction leaves dark residue on the reader’s fingers.",
        "senses": [
          "sight",
          "touch"
        ],
        "intensity": "low",
        "frequency": "localized"
      },
      {
        "id": "shelf-breathes",
        "text": "One shelf expands and settles like a held breath.",
        "senses": [
          "sound",
          "motion"
        ],
        "intensity": "medium",
        "frequency": "recurring"
      },
      {
        "id": "return-box-still",
        "text": "The documented return box remains cool, open, and unaffected.",
        "senses": [
          "touch",
          "sight"
        ],
        "intensity": "medium",
        "frequency": "localized"
      }
    ],
    "exclusions": [
      "human remains as decorative luxury",
      "procedural craft detail",
      "the violated person reduced to a monster"
    ]
  },
  "rule": {
    "id": "custody-index",
    "title": "Custody Index",
    "stateLabel": "Claim",
    "ability": "Intelligence",
    "skills": [
      "Investigation",
      "History"
    ],
    "motifs": [
      "accession number",
      "redacted name",
      "custody seal"
    ],
    "events": [
      "handle-the-responsive-volume-without-recording-custody",
      "read-a-persons-name-as-an-ownership-entry",
      "remove-or-destroy-provenance-evidence",
      "remain-in-the-announced-stack-after-the-custody-warning"
    ],
    "effect": "On a failed check, one visible catalog claim advances in the named stack. The effect changes records, access, and temporary spatial assignment; it never turns human remains into loot or grants ownership of a person.",
    "counterplay": [
      {
        "id": "document-chain-of-custody",
        "actionCost": "one action or one exploration interaction",
        "check": {
          "ability": "Intelligence",
          "skills": [
            "Investigation",
            "History"
          ],
          "dc": null,
          "scalingKey": "intrusion"
        },
        "success": "Document one verified custody transition and reduce Custody Index by 1."
      },
      {
        "id": "center-erased-person",
        "actionCost": "one action or one exploration interaction",
        "check": {
          "ability": "Wisdom",
          "skills": [
            "Insight",
            "Medicine"
          ],
          "dc": null,
          "scalingKey": "intrusion"
        },
        "success": "Replace one object-centered entry with evidence about the person and prevent its next escalation."
      },
      {
        "id": "isolate-for-return",
        "actionCost": "movement along the visible safe route",
        "check": null,
        "success": "Move the announced volume or evidence into the visible return box without increasing the track."
      }
    ],
    "reset": "The track returns to 0 when the remains and evidence are placed under documented respectful custody, or when the party withdraws through the public reading-room route.",
    "escalation": [
      "One accession entry identifies the disputed custody claim.",
      "A shelf closes one named access route and prints a new owner line.",
      "Announce the exact stack, reader, or record that the archive will classify next.",
      "After one full round or exploration turn, the announced target imposes temporary cataloging, separation, or route substitution; the return route remains open."
    ],
    "gmSummary": "Make institutional possession, erased consent, and stewardship failure the horror. Preserve personhood and evidence-based restitution.",
    "playerFacingSigns": [
      "The altered entry and affected stack are named before escalation.",
      "Provenance gaps remain physically discoverable.",
      "Documentation, respectful isolation, and withdrawal remain valid counterplay."
    ]
  },
  "signs": [
    {
      "id": "redacted-patient",
      "title": "The Patient’s Name Was Cut Away",
      "motifs": [
        "redaction",
        "patient record"
      ],
      "description": "A catalog card preserves every collector but removes the person whose remains were used.",
      "variations": [
        "The cut follows an older ink line.",
        "A carbon copy preserves two letters.",
        "The removed strip fits a hospital register."
      ],
      "interaction": "Comparing the card with the hospital register restores part of the erased identity.",
      "revelationLink": "identity-revelation"
    },
    {
      "id": "warm-cover",
      "title": "One Cover Holds Body Heat",
      "motifs": [
        "warm cover",
        "custody"
      ],
      "description": "A closed volume remains at body temperature while adjacent books stay cool.",
      "variations": [
        "Heat follows the redacted name.",
        "The spine cools inside the return box.",
        "A custody seal interrupts the warmth."
      ],
      "interaction": "Recording the volume’s movement prevents one false accession update.",
      "revelationLink": "custody-revelation"
    },
    {
      "id": "borrowed-mark",
      "title": "The Catalog Learns a Reader’s Mark",
      "motifs": [
        "body mark",
        "index"
      ],
      "description": "A catalog illustration acquires a harmless visible mark from the last reader.",
      "variations": [
        "A freckle appears beside an accession number.",
        "A scar shape forms in the margin.",
        "The mark fades when the reader leaves the stack."
      ],
      "interaction": "Matching the mark identifies which shelf is preparing the next claim.",
      "revelationLink": "claim-revelation"
    },
    {
      "id": "loose-accession",
      "title": "An Accession Number Has No Object",
      "motifs": [
        "accession",
        "empty space"
      ],
      "description": "A valid number points to an empty shelf position and an undocumented return box.",
      "variations": [
        "The number predates the donation.",
        "Dust outlines a removed volume.",
        "The reverse names a staff objection."
      ],
      "interaction": "Following the number opens the safe custody route.",
      "revelationLink": "route-revelation"
    }
  ],
  "sensoryTitle": "Dry Paper, Warm Leather, and Catalog Dust",
  "sensorySignature": "Dry paper, old glue, warm covers, and the soft movement of catalog cards create institutional pressure without aestheticizing human remains.",
  "sensoryMotifs": [
    "dry paper",
    "warm cover",
    "catalog dust",
    "card scrape"
  ],
  "smellLow": "dry paper and old paste",
  "smellMedium": "warm leather, dust, and iron ink",
  "smellHigh": "hot glue, stale air, and scorched paper",
  "touchLow": "dry and slightly gritty",
  "touchMedium": "warm beneath the fingertips",
  "touchHigh": "tightening like a closed hand",
  "soundBeat": "a catalog card sliding in an empty drawer",
  "sensoryExclusions": [
    "sensual material fascination",
    "procedural preservation detail",
    "human remains treated as treasure"
  ],
  "readAloudTitle": "Read-Aloud — The Archive That Catalogues People",
  "anchorA": "A public reading room with transparent custody rules",
  "anchorB": "A restricted stack divided by accession cabinets",
  "safeAnchor": "An open return route beside the documented isolation box",
  "visibleA": "Rows of labels naming collectors before subjects",
  "visibleB": "One warm volume and its redacted card",
  "visibleC": "Return slips leading back to the public desk",
  "detailA": "A cut-away name",
  "detailB": "A staff objection in carbon copy",
  "detailC": "An empty accession position",
  "motionA": "A catalog drawer",
  "motionB": "The responsive cover",
  "motionC": "The public return indicator",
  "exitA": "The restricted stack",
  "exitB": "The return-box route",
  "exitC": "The sealed provenance room",
  "session": {
    "title": "Session Guide — Custody of the Unnamed",
    "motifs": [
      "consent",
      "provenance",
      "stewardship"
    ],
    "openingBeat": {
      "situation": "A warm volume arrives at the public desk with a complete collector history and no name for the person whose remains form its binding.",
      "immediateSignal": "The catalog card lists every owner but omits the human source, while an old objection note has been cut from the file.",
      "playerDecision": "Reconstruct the chain of custody, secure the remains, or expose the institutional claim before Custody Index advances."
    },
    "objectives": [
      "Reconstruct the chain of custody.",
      "Recover evidence about the erased person.",
      "Remove the remains from coercive display without destroying restitution evidence."
    ],
    "revelations": [
      "identity-revelation",
      "custody-revelation",
      "claim-revelation"
    ],
    "linkConditions": [
      "The cut catalog card matches a hospital-register removal.",
      "The staff objection explains why the return box was hidden."
    ],
    "fallbackClues": [
      "A carbon copy preserves the missing letters.",
      "The return box bears an older ethical-review seal.",
      "A shelf mark points to the staff objection file."
    ],
    "stallMoves": [
      {
        "id": "advance-custody",
        "trigger": "The table delays after a clear provenance clue.",
        "action": "Advance Custody Index by 1 and name the stack, reader, or record that will carry the next effect."
      },
      {
        "id": "curator-seals-stack",
        "trigger": "The curator is left unchallenged.",
        "action": "Move the disputed volume toward the sealed provenance room without resolving custody."
      },
      {
        "id": "drawer-opens",
        "trigger": "A revelation is missed twice.",
        "action": "A catalog drawer opens and exposes the carbon-copy objection."
      }
    ],
    "climaxGuidance": "At Custody Index 4, resolve only the stack, reader, or record announced at Claim 3 after one full round or exploration turn. Keep the return box, public reading room, and documentation route open."
  }
});

export const ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_PACK = RESULT.pack;
export const ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE = RESULT.module;
export const ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_LEGACY_IDS = RESULT.legacyIds;
export const ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_REVIEW_VERSION = RESULT.reviewVersion;
