import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeContentPackV0_2,
  normalizeSemanticProvenance,
} from "../contracts/semantic/index.js";

function countReadAloudWords(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function ensureReadAloudSentence(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function expandReadAloudFragments(fragments, expansions, minimumWords = 15) {
  return Object.fromEntries(
    Object.entries(fragments || {}).map(([group, entries]) => [
      group,
      (entries || []).map((entry) => {
        const text = ensureReadAloudSentence(entry.text);
        const currentWords = countReadAloudWords(text);
        if (currentWords >= minimumWords) return { ...entry, text };
        const suffix = String(expansions[group] || "")
          .replace(/[.!?]+$/, "")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, minimumWords - currentWords)
          .join(" ");
        return {
          ...entry,
          text: ensureReadAloudSentence(
            `${text.replace(/[.!?]+$/, "")}; ${suffix}`.trim(),
          ),
        };
      }),
    ]),
  );
}

export const MORTUARY_TOTEMS_SEMANTIC_V2_PACK_ID = "mortuary-totems-semantic-v2";
export const MORTUARY_TOTEMS_SEMANTIC_V2_MODULE_ID = "mortuary-totems";
export const MORTUARY_TOTEMS_SEMANTIC_V2_SOURCE_ANCHOR_ID = "mortuary-totems";

const REVIEW_VERSION = "phase8-mortuary-totems-editorial-approved-v1";

function createProvenance({
  legacyIds = [],
  relation = "derived",
  note = "Editorially re-authored from the frozen Mortuary Totems module and its carved memorial, named relationship, boundary, watchfulness, and material-remembrance vocabulary.",
  migrationNote = "AI-assisted editorial candidate. Tlingit-specific source review, repeatable local sample QA, image provenance, and final human approval remain explicit publication gates. Living Indigenous traditions are separated from Cruor supernatural fiction.",
} = {}) {
  return normalizeSemanticProvenance({
    sources: [{ sourceAnchorId: MORTUARY_TOTEMS_SEMANTIC_V2_SOURCE_ANCHOR_ID, relation, note }],
    legacyIds,
    migration: {
      fromSchema: "legacy-inspiration-module-v1",
      method: "editorially-migrated",
      editorialDecision: "approved",
      reviewVersion: REVIEW_VERSION,
      note: migrationNote,
    },
  });
}

const MODULE_PROVENANCE = createProvenance({
  legacyIds: [
  "mortuary-totems",
  "inspiration-mortuary-totems",
  "Mortuary Totems"
],
  relation: "editorial-constraint",
  note: "Tlingit mortuary and memorial poles provide a bounded material-culture context for remembrance, clan history, and the custody of remains. Literal watching wood, Witness Debt, repeated wounds, and all game procedures are original Cruor fantasy extrapolations.",
});

function createDarkPlacesComponent({ id, title, semanticType, semantic, legacyIds = [], motifs = [], generation = {} }) {
  const provenance = createProvenance({ legacyIds });
  return {
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
    id, title, status: "in-review", contentType: "semantic-location-component", semanticType,
    workflows: ["darken-location"], slots: [], sourceAnchors: [MORTUARY_TOTEMS_SEMANTIC_V2_SOURCE_ANCHOR_ID],
    sourceTypes: [
  "Funerary Practice",
  "Material Culture",
  "History"
],
    themes: [
  "remembrance",
  "named relationship",
  "boundary witness",
  "material continuity"
], motifs, horror: [
  "Folk Horror",
  "Psychological Horror"
], contexts: [
  "forest",
  "village",
  "ruins",
  "threshold"
],
    compatibility: { capabilities: ["dark-places"], excludedCapabilities: ["monster-composer"] },
    generation: { phase: 8, ...generation }, semantic: { ...semantic, provenance }, provenance,
  };
}

const DARK_PLACES_COMPONENTS = [
  createDarkPlacesComponent({
    "id": "mortuary-totems-place-identity",
    "title": "The Name-Bearing Boundary",
    "semanticType": "place-identity",
    "legacyIds": [
      "places-premise-ancestor-boundary",
      "location-region-ancestor-gate-path"
    ],
    "motifs": [
      "carved relationship",
      "witnessed crossing",
      "displaced memorial object"
    ],
    "generation": {
      "primary": true
    },
    "semantic": {
      "originalPurpose": "A line of carved memorial markers recorded named people, relationships, and community history at a boundary between settlement, burial ground, and forest route. Some structures also safeguarded a container or remains within a clearly maintained material space.",
      "originalUsers": [
        "families and caretakers responsible for named memorial objects",
        "community members reading relationships and events from the carving order",
        "travelers expected to recognize the boundary and its witnessed route"
      ],
      "historicalChange": "A storm and later theft displaced one container, reversed several carved faces, and mixed memorial markers from different relationships. The community closed the route rather than let the altered sequence make a false public claim.",
      "horrorTruth": "The boundary now treats inaccurate arrangement as testimony. Wood grain, carved orientation, and displaced objects generate Witness Debt whenever visitors reinforce the false sequence.",
      "currentFunction": "The party can read carving order, locate hollow custody spaces, restore displaced objects, and use the witnessed path without speaking sacred formulae or imitating ceremony.",
      "currentConflict": "A claimant intends to move the final marker to prove a false lineage, while a trapped group needs the same threshold opened before nightfall.",
      "playerEntryPoints": [
        "Recover the displaced memorial container before the claimant installs it under the wrong name.",
        "Read the marker sequence to identify which relationship was reversed after the storm.",
        "Open the witnessed route for the trapped group without validating the false lineage."
      ],
      "stakes": [
        "At Witness Debt 4, the announced threshold repeats one ancestral wound as environmental pressure.",
        "Restoring the wrong object may permanently encode a false relationship in the boundary.",
        "Preserving the evidenced sequence lets the route reopen without ritual imitation."
      ],
      "toneKeywords": [
        "rain-soaked",
        "watchful",
        "named",
        "restrained"
      ]
    }
  }),
  createDarkPlacesComponent({
    "id": "mortuary-totems-site-atmosphere",
    "title": "Cedar, Rain, and Remembered Names",
    "semanticType": "site-atmosphere",
    "legacyIds": [
      "places-sense-old-wood-listening",
      "places-sense-resin-and-ash"
    ],
    "motifs": [
      "wet cedar",
      "resin",
      "hollow wood"
    ],
    "semantic": {
      "signature": "Wet cedar, resin, public carvings, and carefully maintained orientations make the site feel witnessed rather than haunted; every object appears to belong to a named relationship.",
      "manifestations": [
        {
          "id": "rain-on-hollow-wood",
          "text": "Rain sounds deeper over hollow sections made to hold a box or keepsake.",
          "senses": [
            "sound",
            "touch"
          ],
          "intensity": "low",
          "frequency": "pervasive"
        },
        {
          "id": "resin-at-repair",
          "text": "Fresh resin scents the seams where one marker was recently moved or repaired.",
          "senses": [
            "smell",
            "sight"
          ],
          "intensity": "low",
          "frequency": "recurring"
        },
        {
          "id": "grain-points-home",
          "text": "Raised grain and weathering lines point from displaced objects toward their prior positions.",
          "senses": [
            "sight",
            "touch"
          ],
          "intensity": "medium",
          "frequency": "localized"
        },
        {
          "id": "dry-witnessed-side",
          "text": "The side facing the correct route remains dry while rain darkens every false approach.",
          "senses": [
            "temperature",
            "sight"
          ],
          "intensity": "medium",
          "frequency": "recurring"
        }
      ],
      "exclusions": [
        "generic tribal curse imagery",
        "anonymous carved faces without named relationships",
        "ritual imitation as puzzle solution"
      ],
      "escalationLinks": [
        "witness-debt"
      ]
    }
  }),
  createDarkPlacesComponent({
    "id": "witness-debt",
    "title": "Witness Debt",
    "semanticType": "global-rule",
    "legacyIds": [
      "totem-remembers-blood",
      "places-hazard-ancestor-snare",
      "places-twist-ancestor-facing-judgment"
    ],
    "motifs": [
      "named accusation",
      "visible threshold",
      "material repair"
    ],
    "semantic": {
      "id": "witness-debt",
      "title": "Witness Debt",
      "scope": "location",
      "category": "pressure-track",
      "trigger": {
        "events": [
          "cross-a-marked-boundary-after-ignoring-a-visible-name-or-relationship",
          "move-a-memorial-object-without-recording-where-it-belonged",
          "damage-or-reverse-a-carved-marker",
          "claim-a-false-kinship-or-purpose-before-a-witness-marker"
        ],
        "timing": "Immediately after a listed event; outside combat, also check the track at the end of each ten-minute exploration turn in an affected region.",
        "frequencyLimit": "Once per combat round, or once per ten-minute exploration turn."
      },
      "state": {
        "label": "Witness",
        "minimum": 0,
        "maximum": 4,
        "initial": 0
      },
      "resolution": {
        "timing": "At the end of each combat round; outside combat, at the end of each ten-minute exploration turn.",
        "threshold": 2,
        "savingThrow": null,
        "check": {
          "ability": "Wisdom",
          "skills": [
            "Insight",
            "Investigation"
          ],
          "dc": null,
          "scalingKey": "intrusion"
        },
        "attackRoll": null,
        "effect": {
          "damage": "",
          "damageType": "",
          "healing": "",
          "conditions": [],
          "additionalText": "On a failed check, advance one already visible accusation, blocked crossing, or remembered wound onto a named threshold. The rule never invents a generic Indigenous curse, requires imitation of living ceremony, or makes ancestry a biological morality score."
        },
        "duration": "Until countered or until the next track check.",
        "range": "location",
        "area": "one announced route, room, object group, or threshold",
        "frequency": "cadence-bound",
        "actionEconomy": "environmental procedure"
      },
      "counterplay": [
        {
          "id": "restore-the-marker",
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
          "success": "Return a displaced object or carving to its evidenced position and reduce Witness Debt by 1."
        },
        {
          "id": "state-the-evidenced-relation",
          "actionCost": "one action",
          "check": {
            "ability": "Wisdom",
            "skills": [
              "Insight",
              "History"
            ],
            "dc": null,
            "scalingKey": "intrusion"
          },
          "success": "Name the relationship shown by the carvings, without performing a sacred formula, and prevent the next advance at that marker."
        },
        {
          "id": "follow-the-witnessed-route",
          "actionCost": "movement along an observed marker sequence",
          "check": null,
          "success": "Move between marked cover points without increasing Witness Debt."
        }
      ],
      "reset": {
        "condition": "The track returns to 0 when the central evidence is secured, the damaged material system is stabilized, or the party withdraws through the visible safe route.",
        "value": 0
      },
      "escalation": [
        {
          "at": 1,
          "effect": "The last crossed marker turns its visible face toward the party and reveals the safe side."
        },
        {
          "at": 2,
          "effect": "One named threshold closes through roots, fallen wood, or frightened witnesses until its evidence is restored."
        },
        {
          "at": 3,
          "effect": "Announce the exact marker and relationship that will carry the final accusation; keep one return route visible."
        },
        {
          "at": 4,
          "effect": "After one full round or ten-minute turn, the announced threshold repeats an ancestral wound as psychic pressure or restraint. The visible return and restoration actions remain available."
        }
      ],
      "gmSummary": "Advance only from named boundary violations or false claims. Keep every accusation attached to visible carving evidence and preserve a material route to repair or withdraw.",
      "playerFacingSigns": [
        "The marker sequence changes visibly before pressure advances.",
        "Every threatened threshold is named one step before resolution.",
        "Restoring evidence or withdrawing through the witnessed route always remains possible."
      ]
    }
  }),
  createDarkPlacesComponent({
    "id": "mortuary-totems-sign-reversed-face",
    "title": "The Reversed Face",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-anomaly-reversed-totem-face"
    ],
    "motifs": [
      "reversed carving",
      "false relationship"
    ],
    "semantic": {
      "id": "mortuary-totems-sign-reversed-face",
      "description": "One carved face has been turned away from the relationship shown by the figures above and below it.",
      "placement": {
        "frequency": "recurring",
        "minimumRooms": 1,
        "maximumRooms": 3,
        "allowedRoomRoles": [
          "entrance",
          "threshold",
          "clue",
          "ritual",
          "connector"
        ],
        "forbiddenRoomRoles": [],
        "preferredFeatures": []
      },
      "variations": [
        "The face looks toward the forest while every related figure faces the village.",
        "Weathering on the back proves the figure was reversed recently.",
        "A repaired peg fits only when the face returns to its earlier orientation."
      ],
      "interaction": {
        "trigger": "Inspect or touch the reversed figure.",
        "effect": "Reveal the direction and relationship that were altered.",
        "counterplay": "Return the figure to the evidenced orientation without invoking a ritual."
      },
      "revelationLink": "reversed-order-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "mortuary-totems-sign-fresh-eye",
    "title": "The Fresh Eye in Old Wood",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-anomaly-fresh-eye-in-wood"
    ],
    "motifs": [
      "fresh carving",
      "watchfulness"
    ],
    "semantic": {
      "id": "mortuary-totems-sign-fresh-eye",
      "description": "A freshly cut eye interrupts old weathered wood and watches one specific threshold.",
      "placement": {
        "frequency": "recurring",
        "minimumRooms": 1,
        "maximumRooms": 3,
        "allowedRoomRoles": [
          "entrance",
          "threshold",
          "clue",
          "ritual",
          "connector"
        ],
        "forbiddenRoomRoles": [],
        "preferredFeatures": []
      },
      "variations": [
        "Pale wood shows inside a single new eye.",
        "Rain beads around the eye but never crosses its pupil.",
        "The eye aligns with a hidden hollow when viewed from the safe side."
      ],
      "interaction": {
        "trigger": "Cross the watched threshold or compare the cut with nearby tools.",
        "effect": "Identify the recent intervention and the person or object it was made to monitor.",
        "counterplay": "Cover the new cut with the matching displaced sliver or avoid the watched line."
      },
      "revelationLink": "recent-intervention-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "mortuary-totems-sign-facing-order",
    "title": "The Facing Order",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-clue-totem-facing-order"
    ],
    "motifs": [
      "carving sequence",
      "relationship clue"
    ],
    "semantic": {
      "id": "mortuary-totems-sign-facing-order",
      "description": "The direction of carved figures encodes who witnesses whom and which path was publicly recognized.",
      "placement": {
        "frequency": "recurring",
        "minimumRooms": 1,
        "maximumRooms": 3,
        "allowedRoomRoles": [
          "entrance",
          "threshold",
          "clue",
          "ritual",
          "connector"
        ],
        "forbiddenRoomRoles": [],
        "preferredFeatures": []
      },
      "variations": [
        "Figures facing inward mark custody; figures facing outward mark departure.",
        "A child figure repeats beside every safe turning.",
        "One missing figure leaves a relationship visibly incomplete."
      ],
      "interaction": {
        "trigger": "Compare at least two markers in sequence.",
        "effect": "Reveal the witnessed route and the false relationship introduced by the moved marker.",
        "counterplay": "Follow the evidenced sequence or restore the missing figure."
      },
      "revelationLink": "witnessed-route-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "mortuary-totems-sign-permission-token",
    "title": "The Ancestor Permission Token",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-reward-ancestor-permission-token"
    ],
    "motifs": [
      "keepsake",
      "custody"
    ],
    "semantic": {
      "id": "mortuary-totems-sign-permission-token",
      "description": "A small carved token matches a hollow and proves temporary permission to move one protected object.",
      "placement": {
        "frequency": "recurring",
        "minimumRooms": 1,
        "maximumRooms": 3,
        "allowedRoomRoles": [
          "entrance",
          "threshold",
          "clue",
          "ritual",
          "connector"
        ],
        "forbiddenRoomRoles": [],
        "preferredFeatures": []
      },
      "variations": [
        "The token repeats the same notch pattern as a sealed hollow.",
        "Its reverse carries a personal repair mark rather than a sacred formula.",
        "Placed beside the correct object, it stops the marker from turning."
      ],
      "interaction": {
        "trigger": "Place the token beside a named object or threshold.",
        "effect": "Suspend one Witness Debt advance and reveal the proper return point.",
        "counterplay": "Return the token after use or document its new custody."
      },
      "revelationLink": "permission-token-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "mortuary-totems-sensory-profile",
    "title": "Name-Bearing Boundary Sensory Profile",
    "semanticType": "sensory-profile",
    "legacyIds": [],
    "motifs": [
      "wet cedar",
      "resin",
      "watched path"
    ],
    "semantic": {
      "signature": "Rain, cedar grain, resin, and orientation make every threshold feel publicly witnessed.",
      "variants": {
        "sight": [
          "Weathered carving sequences repeat a crest, a named relation, and a boundary direction.",
          "One carved face has been turned away from the path while every other figure looks toward it."
        ],
        "sound": [
          "Rain taps differently on hollow sections made to hold a box or keepsake.",
          "Wood clicks once whenever someone crosses the marker line without naming their purpose."
        ],
        "smell": [
          "Wet cedar, resin, and cold smoke gather around the oldest marker.",
          "Fresh-cut wood appears where no recent tool marks should exist."
        ],
        "touch": [
          "One repaired seam feels warmer than the surrounding rain-soaked wood.",
          "Raised grain points from a displaced object back toward its original place."
        ],
        "taste": [
          "Rainwater near the boundary tastes faintly of resin and iron.",
          "A bitter cedar taste lingers after speaking a false relationship aloud."
        ],
        "temperature": [
          "The witnessed side of a marker stays dry and slightly warm.",
          "The unwitnessed side holds a cold draft even in still air."
        ],
        "proprioception": [
          "The path feels straight only while the marker sequence remains visible.",
          "Turning away from the boundary produces the sense of being watched from behind."
        ]
      },
      "intensityTiers": {
        "low": [
          "Rain taps inside a hollow marker.",
          "Resin and wet cedar identify recent repair."
        ],
        "medium": [
          "Carved faces seem to align across separate thresholds.",
          "The dry side of a marker reveals the safe route."
        ],
        "high": [
          "Every carved eye turns toward one announced crossing.",
          "Roots and fallen wood repeat an old wound at the named threshold."
        ]
      },
      "roomRoleBias": {
        "entrance": [
          "Weathered carving sequences repeat a crest, a named relation, and a boundary direction."
        ],
        "threshold": [
          "One repaired seam feels warmer than the surrounding rain-soaked wood."
        ],
        "ritual": [
          "Rain taps differently on hollow sections made to hold a box or keepsake."
        ],
        "secret": [
          "Wet cedar, resin, and cold smoke gather around the oldest marker."
        ],
        "climax": [
          "The path feels straight only while the marker sequence remains visible."
        ],
        "connector": [
          "The witnessed side of a marker stays dry and slightly warm."
        ]
      },
      "geometryBias": {
        "circular": [
          "One carved face has been turned away from the path while every other figure looks toward it."
        ],
        "narrow": [
          "Wood clicks once whenever someone crosses the marker line without naming their purpose."
        ],
        "large": [
          "Fresh-cut wood appears where no recent tool marks should exist."
        ],
        "vertical": [
          "Turning away from the boundary produces the sense of being watched from behind."
        ],
        "ruined": [
          "Raised grain points from a displaced object back toward its original place."
        ]
      },
      "exclusions": [
        "generic drum or chant shorthand",
        "pan-Indigenous costume imagery",
        "bloodline morality"
      ],
      "repetitionPolicy": {
        "exactTextCooldown": "all-rooms",
        "senseCooldown": 1,
        "allowSignatureRepeat": false
      }
    }
  }),
  createDarkPlacesComponent({
    "id": "mortuary-totems-read-aloud-profile",
    "title": "Name-Bearing Boundary Read-Aloud Profile",
    "semanticType": "read-aloud-profile",
    "legacyIds": [],
    "motifs": [
      "carved sequence",
      "wet cedar",
      "witnessed route"
    ],
    "semantic": {
      "fragments": {
        "spatialAnchors": [
          {
            "id": "marker-line",
            "text": "A line of tall carved markers divides the wet forest path from the memorial ground.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "hollow-back",
            "text": "One marker has a carefully sealed hollow on its sheltered side.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "witness-path",
            "text": "Flat stones form a narrow route beneath the direction of the carved faces.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "repair-shelter",
            "text": "A cedar-roofed work recess contains resin, pegs, and labeled fragments.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          }
        ],
        "sensoryBeats": [
          {
            "id": "cedar-rain",
            "text": "Rain darkens the cedar and releases a sharp resin scent.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "hollow-tapping",
            "text": "Water taps with a deeper note over one hollow section.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "dry-side",
            "text": "One side of the boundary remains unexpectedly dry.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "cold-false-path",
            "text": "A cold draft follows the route the carvings refuse to face.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          }
        ],
        "visibleFeatures": [
          {
            "id": "reversed-figure",
            "text": "One figure faces against every related carving in the sequence.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "fresh-eye",
            "text": "A single eye exposes pale new wood among old weathering.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "missing-box-mark",
            "text": "A rectangular stain marks where a small container once rested.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "grain-route",
            "text": "Raised grain lines point toward the witnessed path.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          }
        ],
        "unsettlingDetails": [
          {
            "id": "extra-witness",
            "text": "A carved face appears in the count only when viewed from the false path.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "rain-stops",
            "text": "Rain stops at the exact edge of one old repair.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "wrong-name-tag",
            "text": "A new name tag hangs beneath an older relationship carving.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "return-scratch",
            "text": "Fresh drag marks end at the sealed hollow.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          }
        ],
        "motionOrChange": [
          {
            "id": "face-turn",
            "text": "The fresh eye shifts toward the next crossed threshold.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "root-tighten",
            "text": "Roots tighten visibly around the marker named by the Debt.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          }
        ],
        "exitsAndDepth": [
          {
            "id": "safe-return",
            "text": "The dry witnessed path remains open back to the work recess.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          },
          {
            "id": "announced-threshold",
            "text": "Every face settles on one threshold while the return stones stay visible.",
            "sourceComponentId": "mortuary-totems-read-aloud-profile"
          }
        ]
      },
      "constraints": {
        "forbiddenSpoilerTags": [
          "secret",
          "solution",
          "true-identity"
        ],
        "maximumSentences": {
          "compact": 2,
          "standard": 4,
          "extended": 6
        },
        "wordRanges": {
          "compact": [
            20,
            35
          ],
          "standard": [
            45,
            75
          ],
          "extended": [
            80,
            120
          ]
        }
      },
      "grammar": {
        "openingOrder": [
          "spatial-anchors",
          "sensory-beats"
        ],
        "allowSecondPerson": false,
        "tense": "present"
      }
    }
  }),
  createDarkPlacesComponent({
    "id": "mortuary-totems-session-guide",
    "title": "Running the Name-Bearing Boundary",
    "semanticType": "session-guide",
    "legacyIds": [],
    "motifs": [
      "false lineage",
      "displaced object",
      "witnessed route"
    ],
    "semantic": {
      "openingBeat": {
        "situation": "The party arrives as a claimant prepares to install a displaced memorial object beneath the wrong relationship.",
        "immediateSignal": "Rain darkens every marker except the witnessed route, and one freshly cut eye watches the claimant.",
        "playerDecision": "Read the carving order, recover the original custody record, or stop the installation before Witness Debt advances."
      },
      "objectives": [
        "Identify the original relationship encoded by the marker sequence.",
        "Recover and return the displaced object or document its legitimate custody.",
        "Open the witnessed route without imitating living ceremony."
      ],
      "alwaysOnRuleIds": [
        "witness-debt"
      ],
      "pressureTrackId": "witness-debt",
      "clueFlow": {
        "requiredRevelations": [
          "reversed-order-revelation",
          "recent-intervention-revelation",
          "witnessed-route-revelation"
        ],
        "links": [
          {
            "from": "reversed-order-revelation",
            "to": "recent-intervention-revelation",
            "condition": "The reversed peg and fresh eye share the same recent tool marks."
          },
          {
            "from": "recent-intervention-revelation",
            "to": "witnessed-route-revelation",
            "condition": "The new eye watches the path omitted by the altered relationship."
          }
        ],
        "fallbackClues": [
          "Rain fills the old peg hole and outlines the prior orientation.",
          "A resin chip from the fresh eye fits the claimant's tool.",
          "The permission token stops turning only on the witnessed route."
        ]
      },
      "stallMoves": [
        {
          "id": "advance-debt-at-named-marker",
          "trigger": "The table ignores a clear carving-order clue.",
          "action": "Advance Witness Debt by 1 and name the threshold now under accusation."
        },
        {
          "id": "claimant-moves-object",
          "trigger": "The claimant is left unchallenged.",
          "action": "Move the object one visible step closer to the wrong hollow without sealing it yet."
        },
        {
          "id": "rain-reveals-route",
          "trigger": "A required revelation has been missed twice.",
          "action": "Rain leaves the witnessed route dry and fills every false footprint."
        }
      ],
      "pacing": {
        "defaultRoute": [
          "location-region-1",
          "location-region-2",
          "location-region-3",
          "location-region-4",
          "location-region-5"
        ],
        "escalationRooms": [
          "location-region-3",
          "location-region-5"
        ],
        "climaxGuidance": "At Witness Debt 4, resolve only the threshold announced at Debt 3 after one full round or ten-minute turn. Keep the witnessed return and material repair action visible."
      }
    }
  }),
];

const MORTUARY_TOTEMS_READ_ALOUD_EXPANSIONS = Object.freeze({
  spatialAnchors: "The witnessed return remains visible behind it, preserving a clear route back toward the repair shelter.",
  sensoryBeats: "The change stays tied to named material evidence and can be compared with the dry, witnessed path.",
  visibleFeatures: "Nearby grain, repairs, and labels let the group verify the relationship without imitating any ceremony.",
  unsettlingDetails: "The alteration follows a documented crossing and leaves enough physical evidence to identify what changed.",
  motionOrChange: "The movement advances only after Witness Debt rises and never closes the previously marked retreat.",
  exitsAndDepth: "The route remains legible from the current marker and announces the final threshold before it resolves.",
});

const MORTUARY_TOTEMS_READ_ALOUD_COMPONENT = DARK_PLACES_COMPONENTS.find(
  (component) => component.semanticType === "read-aloud-profile",
);

if (MORTUARY_TOTEMS_READ_ALOUD_COMPONENT) {
  MORTUARY_TOTEMS_READ_ALOUD_COMPONENT.semantic.fragments =
    expandReadAloudFragments(
      MORTUARY_TOTEMS_READ_ALOUD_COMPONENT.semantic.fragments,
      MORTUARY_TOTEMS_READ_ALOUD_EXPANSIONS,
    );
}

export const MORTUARY_TOTEMS_SEMANTIC_V2_PACK = normalizeContentPackV0_2({
  schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
  id: MORTUARY_TOTEMS_SEMANTIC_V2_PACK_ID,
  title: "Mortuary Totems Semantic Content Pack",
  version: "0.2.0-phase8-approved1",
  status: "draft", locale: "en", author: "Cruor Games", license: "internal-prototype",
  tags: ["dark-places", "inspiration-archive", "mortuary-totems", "phase8"],
  modules: [{
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    id: MORTUARY_TOTEMS_SEMANTIC_V2_MODULE_ID, title: "Mortuary Totems", packId: MORTUARY_TOTEMS_SEMANTIC_V2_PACK_ID,
    status: "in-review", locale: "en", capabilities: ["inspiration-archive", "dark-places"],
    sourceAnchor: {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
      id: MORTUARY_TOTEMS_SEMANTIC_V2_SOURCE_ANCHOR_ID, title: "Mortuary Totems", kind: "object", status: "in-review",
      citation: { label: "National Park Service, Cormorant Memorial\u2014Mortuary Column", url: "https://www.nps.gov/places/cormorant-memorial-mortuary-column.htm", accessedVersion: `Accessed 2026-07-17; ${REVIEW_VERSION}` },
      summary: "A bounded reference for Tlingit mortuary and memorial columns, their distinction, and the role of carved public monuments in holding remains or remembering people and relationships.", reliability: "secondary",
      editorialNotes: [
  "Cultural boundary: the legacy title Mortuary Totems is an internal label; the source context is specifically Tlingit mortuary and memorial poles, not a generic pan-Indigenous object.",
  "Material boundary: mortuary columns could hold remains, while memorial columns commemorate people; specific functions and meanings must not be collapsed.",
  "Ethical boundary: carvings encode people, clan histories, relationships, and events; they are not anonymous occult props.",
  "Design boundary: the module uses visible carving order, hollow spaces, weathering, and object placement as investigation clues without reproducing ceremony.",
  "Fictional transformation: moving faces, Witness Debt, repeated wounds, and literal accusation are Cruor fiction.",
  "Ownership boundary: no modern Monster grafts use the mortuary-totems Source Anchor; this module owns only Archive and Dark Places content.",
  "Publication gate: Tlingit-specific cultural review, repeatable local sample QA, human signoff, and verifiable image provenance remain required."
], tags: [
  "tlingit",
  "mortuary-column",
  "memorial-column",
  "material-culture"
],
    },
    inspiration: {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
      id: "inspiration-mortuary-totems-v2", slug: "mortuary-totems", title: "Mortuary Totems", status: "approved",
      sourceAnchors: [MORTUARY_TOTEMS_SEMANTIC_V2_SOURCE_ANCHOR_ID], sourceTypes: [
  "Funerary Practice",
  "Material Culture",
  "History"
],
      themes: [
  "remembrance",
  "named relationship",
  "boundary witness",
  "material continuity"
], motifs: [
  "carved face",
  "cedar marker",
  "hollow memorial space",
  "witnessed path"
], horror: [
  "Folk Horror",
  "Psychological Horror"
], contexts: [
  "forest",
  "village",
  "ruins",
  "threshold"
],
      editorial: {
  "deck": "Carved memorial columns become a readable boundary system of names, relationships, custody, and repair while a specific Tlingit source context remains distinct from Cruor supernatural fiction.",
  "whatItIs": "Within Tlingit material culture, mortuary and memorial columns can serve different commemorative functions. Mortuary examples may hold remains, while memorial columns remember people, clan histories, and events through carved public forms. The legacy label Mortuary Totems is retained only as the internal catalog title.",
  "whyItDisturbs": "A durable public object keeps a person and their relationships present after death. Cruor horror begins when the marker stops merely witnessing history and starts enforcing an inaccurate or manipulated account of it.",
  "creativeUses": [
    "Turn carving sequence and orientation into route evidence.",
    "Use hollow sections and displaced boxes as material clues rather than macabre spectacle.",
    "Let restoring a named relationship reduce pressure without ritual imitation.",
    "Make the climax an announced accusation at a specific threshold with a visible repair route."
  ],
  "cautions": [
    "Do not generalize Tlingit mortuary and memorial poles into a universal Indigenous practice.",
    "Do not call every carved pole a totem or assume all poles contain remains.",
    "Do not detach carving from people, clan relationships, history, and community custody.",
    "Do not require players to imitate living Indigenous ceremony or invent sacred words.",
    "Clearly label moving wood, curses, repeated wounds, and Witness Debt as Cruor fiction."
  ]
},
      media: {
  "imageKey": "card-mortuary-totem-pole.webp",
  "imageProvider": "local",
  "imageAlt": "Mortuary Totems inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
  "imageCredit": "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep unpublished until provenance is verified or the image is replaced.",
  "icon": "fa-monument"
},
      tags: [
  "source:mortuary-totems",
  "capability:dark-places",
  "cultural-review-required"
], provenance: MODULE_PROVENANCE,
    },
    components: DARK_PLACES_COMPONENTS,
    metadata: { author: "Cruor Games", revision: 1, reviewedAt: "2026-07-17", sourceFile: "shared/content/content-packs/mortuary-totems-semantic-v2-pack.js", capabilityWaivers: [], modernCapabilityLinks: [] },
    provenance: MODULE_PROVENANCE,
  }],
  metadata: {
    bundled: true, registryRole: "semantic-v2-approved", humanApprovalRequired: false,
    retainedLegacyPublicBehavior: true, editorialStatus: "approved",
    publicationBlockers: ["image-provenance-required"],
    culturalSourceBoundary: "Tlingit mortuary and memorial columns, carved relationships, and custody of remains are bounded source context; moving faces, Witness Debt, repeated wounds, and all mechanics are fictional.", modernCapabilityLinks: [],
  },
});

export const MORTUARY_TOTEMS_SEMANTIC_V2_MODULE = MORTUARY_TOTEMS_SEMANTIC_V2_PACK.modules[0];
