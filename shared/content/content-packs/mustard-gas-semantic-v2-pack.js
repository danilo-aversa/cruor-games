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

export const MUSTARD_GAS_SEMANTIC_V2_PACK_ID = "mustard-gas-semantic-v2";
export const MUSTARD_GAS_SEMANTIC_V2_MODULE_ID = "mustard-gas";
export const MUSTARD_GAS_SEMANTIC_V2_SOURCE_ANCHOR_ID = "mustard-gas";

const REVIEW_VERSION = "phase8-mustard-gas-editorial-approved-v1";

function createProvenance({
  legacyIds = [],
  relation = "derived",
  note = "Editorially re-authored from the frozen Mustard Gas module and its delayed injury, contaminated equipment, low-air hazard, mask, wash-station, and clean-route vocabulary.",
  migrationNote = "AI-assisted editorial candidate. Historical and medical source review, repeatable local sample QA, image provenance, and final human approval remain explicit gates. The module stays high-level and excludes real operational chemical instructions.",
} = {}) {
  return normalizeSemanticProvenance({
    sources: [{ sourceAnchorId: MUSTARD_GAS_SEMANTIC_V2_SOURCE_ANCHOR_ID, relation, note }],
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
  "mustard-gas",
  "inspiration-mustard-gas",
  "Mustard Gas"
],
  relation: "editorial-constraint",
  note: "Sulfur mustard history and occupational emergency references provide bounded context for delayed vesicant injury and contamination. The Delayed Ward, Latency Clock, fictional site layout, and all game procedures are Cruor fantasy abstractions.",
});

function createDarkPlacesComponent({ id, title, semanticType, semantic, legacyIds = [], motifs = [], generation = {} }) {
  const provenance = createProvenance({ legacyIds });
  return {
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
    id, title, status: "in-review", contentType: "semantic-location-component", semanticType,
    workflows: ["darken-location"], slots: [], sourceAnchors: [MUSTARD_GAS_SEMANTIC_V2_SOURCE_ANCHOR_ID],
    sourceTypes: [
  "Historical Weapon",
  "Chemical Hazard",
  "History"
],
    themes: [
  "weaponized air",
  "delayed injury",
  "contamination",
  "hostile environment"
], motifs, horror: [
  "War Horror",
  "Disease Horror",
  "Body Horror"
], contexts: [
  "mine",
  "ruins",
  "village",
  "industrial"
],
    compatibility: { capabilities: ["dark-places"], excludedCapabilities: ["monster-composer"] },
    generation: { phase: 8, ...generation }, semantic: { ...semantic, provenance }, provenance,
  };
}

const DARK_PLACES_COMPONENTS = [
  createDarkPlacesComponent({
    "id": "mustard-gas-place-identity",
    "title": "The Delayed Ward",
    "semanticType": "place-identity",
    "legacyIds": [
      "places-premise-poisoned-airline",
      "location-region-mask-filter-vestry",
      "location-region-yellow-vapor-washroom"
    ],
    "motifs": [
      "sealed wash station",
      "low-air zone",
      "clean route"
    ],
    "generation": {
      "primary": true
    },
    "semantic": {
      "originalPurpose": "A fortified wash and filter station separated contaminated work areas from a protected route, using marked levels, sealed equipment storage, drainage, and records to keep exposure from traveling with people and cloth.",
      "originalUsers": [
        "workers assigned to marked contaminated and clean zones",
        "attendants maintaining masks, seals, wash basins, and route records",
        "supervisors responsible for closing cracked sumps and equipment shelves"
      ],
      "historicalChange": "The site was abandoned after a release, then reopened by scavengers who removed filters and broke sealed storage. A later collapse joined the low-air rooms to the protected route and erased the sequence of who crossed where.",
      "horrorTruth": "The ward now delays every consequence until occupants believe they are safe. Contaminated objects and routes recirculate fictional pressure through Latency Clock rather than through a realistic chemical simulation.",
      "currentFunction": "The party can read low stains, isolate equipment, open the existing clean-air route, and use records to determine which seal was broken without receiving real-world operational instructions.",
      "currentConflict": "Survivors in the clean section want a sealed door opened, while evidence shows their equipment crossed the contaminated line after the release.",
      "playerEntryPoints": [
        "Reach the protected route before the next delayed symptom resolves.",
        "Identify which filter and storage seal were removed after the ward was closed.",
        "Isolate the contaminated equipment without trapping survivors in the low-air section."
      ],
      "stakes": [
        "At Latency 4, only the zone announced at Latency 3 resolves its delayed hazard.",
        "Opening the wrong seal can contaminate the only protected route.",
        "Preserving the records reveals who deliberately reopened the ward."
      ],
      "toneKeywords": [
        "clinical",
        "delayed",
        "airless",
        "contaminated"
      ]
    }
  }),
  createDarkPlacesComponent({
    "id": "mustard-gas-site-atmosphere",
    "title": "Low Air, Oily Sheen, and Late Pain",
    "semanticType": "site-atmosphere",
    "legacyIds": [
      "places-sense-yellow-metal-air",
      "places-sense-delayed-eye-sting"
    ],
    "motifs": [
      "oily film",
      "yellow-brown line",
      "delayed sting"
    ],
    "semantic": {
      "signature": "Low stains, oily beads, sealed cloth, and symptoms that arrive after the crossing make the site feel dangerous through evidence and delay rather than invisible surprise.",
      "manifestations": [
        {
          "id": "low-stain",
          "text": "A yellow-brown line marks the height of the contaminated layer along walls and equipment.",
          "senses": [
            "sight"
          ],
          "intensity": "low",
          "frequency": "pervasive"
        },
        {
          "id": "oily-equipment",
          "text": "Metal, cloth, and ceramic near broken seals carry an oily sheen.",
          "senses": [
            "sight",
            "touch"
          ],
          "intensity": "medium",
          "frequency": "localized"
        },
        {
          "id": "late-eye-sting",
          "text": "Eyes and damp skin begin to sting one room after the first warning signs.",
          "senses": [
            "touch",
            "proprioception"
          ],
          "intensity": "medium",
          "frequency": "recurring"
        },
        {
          "id": "cool-clean-route",
          "text": "A cool draft and intact markings identify the protected route without relying on odor.",
          "senses": [
            "temperature",
            "sight"
          ],
          "intensity": "low",
          "frequency": "recurring"
        }
      ],
      "exclusions": [
        "real operational chemical procedures",
        "odor as reliable detector",
        "unannounced unavoidable injury"
      ],
      "escalationLinks": [
        "latency-clock"
      ]
    }
  }),
  createDarkPlacesComponent({
    "id": "latency-clock",
    "title": "Latency Clock",
    "semanticType": "global-rule",
    "legacyIds": [
      "blistering-yellow-cloud",
      "places-hazard-low-gas-sump",
      "places-hazard-cracked-phial-shelf",
      "places-twist-low-air-tactics",
      "places-twist-mask-resource-loop"
    ],
    "motifs": [
      "delayed symptom",
      "announced zone",
      "clean-air retreat"
    ],
    "semantic": {
      "id": "latency-clock",
      "title": "Latency Clock",
      "scope": "location",
      "category": "pressure-track",
      "trigger": {
        "events": [
          "enter-a-marked-low-air-zone-without-a-seal-or-route",
          "disturb-contaminated-cloth-or-equipment",
          "break-a-seal-on-a-sump-drain-or-phial-shelf",
          "remain-in-the-announced-zone-after-delayed-symptoms-begin"
        ],
        "timing": "Immediately after a listed event; outside combat, also check the track at the end of each ten-minute exploration turn in an affected region.",
        "frequencyLimit": "Once per combat round, or once per ten-minute exploration turn."
      },
      "state": {
        "label": "Latency",
        "minimum": 0,
        "maximum": 4,
        "initial": 0
      },
      "resolution": {
        "timing": "At the end of each combat round; outside combat, at the end of each ten-minute exploration turn.",
        "threshold": 2,
        "savingThrow": null,
        "check": {
          "ability": "Constitution",
          "skills": [
            "Medicine",
            "Survival"
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
          "additionalText": "On a failed check, apply one already announced delayed symptom, contaminated route, or equipment restriction to the named zone. The rule abstracts a fictional contaminated site and never teaches production, dispersal, weaponization, or real-world treatment procedures."
        },
        "duration": "Until countered or until the next track check.",
        "range": "location",
        "area": "one announced route, room, object group, or threshold",
        "frequency": "cadence-bound",
        "actionEconomy": "environmental procedure"
      },
      "counterplay": [
        {
          "id": "leave-the-marked-zone",
          "actionCost": "movement to the visible clean-air route",
          "check": null,
          "success": "Exit the named zone before the next Latency step and prevent one escalation from resolving on that creature."
        },
        {
          "id": "isolate-contaminated-equipment",
          "actionCost": "one action or one exploration interaction",
          "check": {
            "ability": "Intelligence",
            "skills": [
              "Investigation",
              "Medicine"
            ],
            "dc": null,
            "scalingKey": "intrusion"
          },
          "success": "Seal or abandon one visibly contaminated object and reduce Latency by 1."
        },
        {
          "id": "open-the-existing-clean-air-route",
          "actionCost": "one action or ten minutes outside combat",
          "check": {
            "ability": "Strength",
            "skills": [
              "Athletics",
              "Survival"
            ],
            "dc": null,
            "scalingKey": "intrusion"
          },
          "success": "Open a pre-existing vent, door, or wash-station route and protect one announced crossing."
        }
      ],
      "reset": {
        "condition": "The track returns to 0 when the central evidence is secured, the damaged material system is stabilized, or the party withdraws through the visible safe route.",
        "value": 0
      },
      "escalation": [
        {
          "at": 1,
          "effect": "A low stain and oily sheen reveal the contaminated layer and the nearest clean-air route."
        },
        {
          "at": 2,
          "effect": "Delayed eye and skin irritation begins on creatures or objects that crossed the marked line."
        },
        {
          "at": 3,
          "effect": "Announce the exact room or route where the next delayed effect will resolve; keep a clean-air retreat visible."
        },
        {
          "at": 4,
          "effect": "After one full round or ten-minute turn, the announced zone resolves its delayed injury, obstruction, or contamination. Retreat and isolation remain available."
        }
      ],
      "gmSummary": "Use delayed timing, visible zones, and pre-existing safety infrastructure. Never treat odor as reliable detection and never provide real operational chemical instructions.",
      "playerFacingSigns": [
        "Symptoms arrive after exposure rather than instantly.",
        "Every affected zone is marked before resolution.",
        "A visible clean-air route or withdrawal option always remains available."
      ]
    }
  }),
  createDarkPlacesComponent({
    "id": "mustard-gas-sign-filter-reliquary",
    "title": "The Filter Reliquary",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-anomaly-mask-filter-reliquary"
    ],
    "motifs": [
      "sealed filter",
      "equipment custody"
    ],
    "semantic": {
      "id": "mustard-gas-sign-filter-reliquary",
      "description": "A cabinet treats used filters and masks like named evidence, showing which pieces crossed between zones.",
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
        "Each slot bears a route and shift mark.",
        "One missing filter left an oily outline inside a sealed compartment.",
        "A replacement was installed backward after the incident."
      ],
      "interaction": {
        "trigger": "Inspect the cabinet or compare equipment marks.",
        "effect": "Reveal which filter left the protected route and when.",
        "counterplay": "Seal or abandon the matched equipment before opening the next zone."
      },
      "revelationLink": "filter-custody-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "mustard-gas-sign-low-line",
    "title": "The Low Yellow Line",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-anomaly-low-yellow-line"
    ],
    "motifs": [
      "low vapor line",
      "airflow"
    ],
    "semantic": {
      "id": "mustard-gas-sign-low-line",
      "description": "A yellow-brown stain records the height and direction of the contaminated layer.",
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
        "The line rises near a blocked vent.",
        "The line stops sharply at an intact seal.",
        "Footprints cross beneath it toward the wash station."
      ],
      "interaction": {
        "trigger": "Compare line height across connected rooms.",
        "effect": "Reveal the contaminated route and the existing clean-air path.",
        "counterplay": "Remain above or outside the marked zone and open the protected route."
      },
      "revelationLink": "airline-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "mustard-gas-sign-filter-name",
    "title": "The Name on the Filter",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-clue-mask-filter-name"
    ],
    "motifs": [
      "recorded name",
      "removed seal"
    ],
    "semantic": {
      "id": "mustard-gas-sign-filter-name",
      "description": "A personal or shift mark on a filter links a survivor to a specific crossing after closure.",
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
        "The name is scratched beneath newer paint.",
        "The mark matches a record in the wash station.",
        "Oily residue appears only on the outward-facing side."
      ],
      "interaction": {
        "trigger": "Compare the filter with the route record.",
        "effect": "Reveal who reopened the seal and which direction the equipment traveled.",
        "counterplay": "Isolate the named equipment and confront the record rather than handling it."
      },
      "revelationLink": "responsibility-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "mustard-gas-sign-canary-cache",
    "title": "The Dead Canary Cache",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-clue-dead-canary-cache",
      "places-reward-clean-air-route"
    ],
    "motifs": [
      "warning cache",
      "safe route"
    ],
    "semantic": {
      "id": "mustard-gas-sign-canary-cache",
      "description": "A protected cache contains old warning evidence and a map to the surviving clean-air route.",
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
        "The cache sits above the low stain behind an intact seal.",
        "A route diagram marks doors by airflow rather than by room name.",
        "One unused ceramic seal can close a single contaminated object."
      ],
      "interaction": {
        "trigger": "Open the protected cache from the clean side.",
        "effect": "Reveal the safe route and provide one abstract isolation resource.",
        "counterplay": "Use the route map and seal without entering the marked low zone."
      },
      "revelationLink": "clean-route-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "mustard-gas-sensory-profile",
    "title": "Delayed Ward Sensory Profile",
    "semanticType": "sensory-profile",
    "legacyIds": [],
    "motifs": [
      "low stain",
      "oily equipment",
      "late irritation"
    ],
    "semantic": {
      "signature": "Evidence appears before symptoms, and symptoms appear after the apparent crossing.",
      "variants": {
        "sight": [
          "A low yellow-brown line stains walls below the height of the clean-air route.",
          "Oily beads gather on metal and cloth near the contaminated floor."
        ],
        "sound": [
          "Breathing cloth rasps behind old masks and cracked seals.",
          "A faint hiss follows changes in airflow but does not identify safety by itself."
        ],
        "smell": [
          "An unreliable sharp or garlicky odor comes and goes near contaminated equipment.",
          "Clean-air spaces smell mostly of wet stone and sealed ceramic."
        ],
        "touch": [
          "Exposed metal carries an oily film that should not be handled.",
          "Eyes and damp skin begin to sting only after leaving the first marked room."
        ],
        "taste": [
          "A metallic taste arrives after the warning signs, not before them.",
          "Clean water tastes flat beside contaminated cloth."
        ],
        "temperature": [
          "The low vapor layer feels slightly warmer near sealed drains.",
          "A cool draft marks the pre-existing clean-air route."
        ],
        "proprioception": [
          "The lungs feel tight after the body has already crossed the marked line.",
          "Vision and balance worsen one step after the apparent danger has passed."
        ]
      },
      "intensityTiers": {
        "low": [
          "A low stain marks the first zone.",
          "Oily beads appear on broken equipment."
        ],
        "medium": [
          "Eye sting and metallic taste arrive one room late.",
          "The clean route remains cool and visibly marked."
        ],
        "high": [
          "Breathing tightens in the announced zone.",
          "Contaminated cloth darkens and blocks one named route."
        ]
      },
      "roomRoleBias": {
        "entrance": [
          "A low yellow-brown line stains walls below the height of the clean-air route."
        ],
        "threshold": [
          "Exposed metal carries an oily film that should not be handled."
        ],
        "ritual": [
          "Breathing cloth rasps behind old masks and cracked seals."
        ],
        "secret": [
          "An unreliable sharp or garlicky odor comes and goes near contaminated equipment."
        ],
        "climax": [
          "The lungs feel tight after the body has already crossed the marked line."
        ],
        "connector": [
          "The low vapor layer feels slightly warmer near sealed drains."
        ]
      },
      "geometryBias": {
        "circular": [
          "Oily beads gather on metal and cloth near the contaminated floor."
        ],
        "narrow": [
          "A faint hiss follows changes in airflow but does not identify safety by itself."
        ],
        "large": [
          "Clean-air spaces smell mostly of wet stone and sealed ceramic."
        ],
        "vertical": [
          "Vision and balance worsen one step after the apparent danger has passed."
        ],
        "ruined": [
          "Eyes and damp skin begin to sting only after leaving the first marked room."
        ]
      },
      "exclusions": [
        "real treatment instructions",
        "odor-based safety",
        "instant unavoidable damage"
      ],
      "repetitionPolicy": {
        "exactTextCooldown": "all-rooms",
        "senseCooldown": 1,
        "allowSignatureRepeat": false
      }
    }
  }),
  createDarkPlacesComponent({
    "id": "mustard-gas-read-aloud-profile",
    "title": "Delayed Ward Read-Aloud Profile",
    "semanticType": "read-aloud-profile",
    "legacyIds": [],
    "motifs": [
      "sealed washroom",
      "low stain",
      "clean route"
    ],
    "semantic": {
      "fragments": {
        "spatialAnchors": [
          {
            "id": "wash-station",
            "text": "A cracked wash station separates a low work floor from a raised protected passage.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "filter-store",
            "text": "Sealed ceramic cabinets line the wall beside a numbered equipment rack.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "low-sump",
            "text": "A shallow sump occupies the lowest point beneath yellow-brown stains.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "clean-corridor",
            "text": "An intact marked corridor climbs away from the stained floor.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          }
        ],
        "sensoryBeats": [
          {
            "id": "oily-sheen",
            "text": "Metal catches the light beneath a thin oily sheen.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "late-sting",
            "text": "The eyes begin to sting only after the first room is behind.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "cloth-rasp",
            "text": "Old mask cloth rasps softly inside a sealed cabinet.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "cool-route",
            "text": "A cool dry draft follows the protected corridor.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          }
        ],
        "visibleFeatures": [
          {
            "id": "low-line",
            "text": "A yellow-brown line runs below the clean-route markings.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "missing-filter",
            "text": "One filter slot is empty but still oily.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "broken-seal",
            "text": "A ceramic seal lies cracked beside the sump.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "route-record",
            "text": "A wall record tracks equipment between contaminated and protected zones.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          }
        ],
        "unsettlingDetails": [
          {
            "id": "delayed-footprint",
            "text": "A clean footprint develops a dark edge several moments after it appears.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "reverse-filter",
            "text": "One replacement filter was installed backward.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "crossed-equipment",
            "text": "A survivor name appears on equipment stored in the wrong zone.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "recirculating-drain",
            "text": "The blocked drain exhales only after nearby doors close.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          }
        ],
        "motionOrChange": [
          {
            "id": "sheen-spread",
            "text": "The oily sheen advances toward one announced threshold.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "symptom-step",
            "text": "A late sting marks everyone who crossed the same line.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          }
        ],
        "exitsAndDepth": [
          {
            "id": "clean-return",
            "text": "The raised protected corridor remains visible behind intact markings.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
          },
          {
            "id": "announced-zone",
            "text": "The next affected room is named by deepening stains while the clean route stays open.",
            "sourceComponentId": "mustard-gas-read-aloud-profile"
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
    "id": "mustard-gas-session-guide",
    "title": "Running the Delayed Ward",
    "semanticType": "session-guide",
    "legacyIds": [],
    "motifs": [
      "broken seal",
      "route record",
      "delayed symptom"
    ],
    "semantic": {
      "openingBeat": {
        "situation": "Survivors wait behind a protected door while contaminated equipment and a broken record suggest the clean side was crossed after closure.",
        "immediateSignal": "A low yellow-brown stain stops at the door, but eye irritation begins among those who just left the wash station.",
        "playerDecision": "Open the survivor door, isolate the equipment, or restore the clean-air route before the next Latency step."
      },
      "objectives": [
        "Map contaminated and protected zones from visible evidence.",
        "Identify who removed the filter and broke the sump seal.",
        "Open a safe departure without spreading contaminated equipment."
      ],
      "alwaysOnRuleIds": [
        "latency-clock"
      ],
      "pressureTrackId": "latency-clock",
      "clueFlow": {
        "requiredRevelations": [
          "filter-custody-revelation",
          "airline-revelation",
          "responsibility-revelation"
        ],
        "links": [
          {
            "from": "filter-custody-revelation",
            "to": "responsibility-revelation",
            "condition": "The missing filter mark matches the survivor equipment record."
          },
          {
            "from": "airline-revelation",
            "to": "clean-route-revelation",
            "condition": "The low stain stops where the raised route and intact seal begin."
          }
        ],
        "fallbackClues": [
          "Oily residue appears on only one named equipment set.",
          "The low line rises directly toward the blocked sump vent.",
          "A cool draft lifts one loose route-record page toward the clean corridor."
        ]
      },
      "stallMoves": [
        {
          "id": "advance-latency-in-announced-zone",
          "trigger": "The table delays after a clear contamination cue.",
          "action": "Advance Latency by 1 and deepen the stain in one named zone."
        },
        {
          "id": "survivor-moves-equipment",
          "trigger": "The protected group is ignored.",
          "action": "A survivor moves one visible equipment bundle toward the door but does not open it yet."
        },
        {
          "id": "record-reveals-crossing",
          "trigger": "A required revelation has been missed twice.",
          "action": "Condensation reveals the last signed crossing on the route record."
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
        "climaxGuidance": "At Latency 4, resolve only the zone announced at Latency 3 after one full round or ten-minute turn. Keep the raised clean route and isolation action available."
      }
    }
  }),
];

const MUSTARD_GAS_READ_ALOUD_EXPANSIONS = Object.freeze({
  spatialAnchors: "A cool, marked return remains visible behind it, preserving a route toward uncontaminated shelter and washing supplies.",
  sensoryBeats: "The symptom remains delayed but localized, allowing comparison with sealed cloth, clean water, and cooler air.",
  visibleFeatures: "Stains, seals, and wash marks keep the affected route readable without explaining any real chemical procedure.",
  unsettlingDetails: "The alteration follows documented exposure and leaves enough evidence to identify the contaminated object or path.",
  motionOrChange: "The spread advances only after the Latency Clock rises and never erases the announced clean-air retreat.",
  exitsAndDepth: "The route remains visible from the current room and carries a clear warning before deeper exposure resolves.",
});

const MUSTARD_GAS_READ_ALOUD_COMPONENT = DARK_PLACES_COMPONENTS.find(
  (component) => component.semanticType === "read-aloud-profile",
);

if (MUSTARD_GAS_READ_ALOUD_COMPONENT) {
  MUSTARD_GAS_READ_ALOUD_COMPONENT.semantic.fragments =
    expandReadAloudFragments(
      MUSTARD_GAS_READ_ALOUD_COMPONENT.semantic.fragments,
      MUSTARD_GAS_READ_ALOUD_EXPANSIONS,
    );
}

export const MUSTARD_GAS_SEMANTIC_V2_PACK = normalizeContentPackV0_2({
  schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
  id: MUSTARD_GAS_SEMANTIC_V2_PACK_ID,
  title: "Mustard Gas Semantic Content Pack",
  version: "0.2.0-phase8-approved1",
  status: "draft", locale: "en", author: "Cruor Games", license: "internal-prototype",
  tags: ["dark-places", "inspiration-archive", "mustard-gas", "phase8"],
  modules: [{
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    id: MUSTARD_GAS_SEMANTIC_V2_MODULE_ID, title: "Mustard Gas", packId: MUSTARD_GAS_SEMANTIC_V2_PACK_ID,
    status: "in-review", locale: "en", capabilities: ["inspiration-archive", "dark-places"],
    sourceAnchor: {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
      id: MUSTARD_GAS_SEMANTIC_V2_SOURCE_ANCHOR_ID, title: "Mustard Gas", kind: "object", status: "in-review",
      citation: { label: "CDC/NIOSH Emergency Response Safety and Health Database: Sulfur Mustard", url: "https://www.cdc.gov/niosh/ershdb/emergencyresponsecard_29750008.html", accessedVersion: `Accessed 2026-07-17; ${REVIEW_VERSION}` },
      summary: "A bounded medical and historical reference for sulfur mustard as a chemical warfare vesicant associated with delayed injury to skin, eyes, and the respiratory tract and with contamination that may persist on materials.", reliability: "secondary",
      editorialNotes: [
  "Historical boundary: sulfur mustard is a human-made chemical warfare agent and vesicant, not a generic fantasy poison gas.",
  "Medical boundary: effects can be delayed and can involve skin, eyes, and the respiratory tract; apparent early comfort does not establish safety.",
  "Detection boundary: odor is unreliable and must never be the sole in-game safety signal.",
  "Safety boundary: content remains abstract and does not provide synthesis, dispersal, dosage, weaponization, or real treatment instructions.",
  "Fictional transformation: the Delayed Ward, Latency Clock, supernatural recirculation, and all map procedures are Cruor fiction.",
  "Ownership boundary: no modern Monster grafts use the mustard-gas Source Anchor; this module owns only Archive and Dark Places content.",
  "Publication gate: historical/medical review, repeatable local sample QA, human signoff, and verifiable image provenance remain required."
], tags: [
  "sulfur-mustard",
  "chemical-warfare",
  "vesicant",
  "delayed-injury"
],
    },
    inspiration: {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
      id: "inspiration-mustard-gas-v2", slug: "mustard-gas", title: "Mustard Gas", status: "approved",
      sourceAnchors: [MUSTARD_GAS_SEMANTIC_V2_SOURCE_ANCHOR_ID], sourceTypes: [
  "Historical Weapon",
  "Chemical Hazard",
  "History"
],
      themes: [
  "weaponized air",
  "delayed injury",
  "contamination",
  "hostile environment"
], motifs: [
  "low yellow-brown stain",
  "oily contamination",
  "sealed mask",
  "clean-air route"
], horror: [
  "War Horror",
  "Disease Horror",
  "Body Horror"
], contexts: [
  "mine",
  "ruins",
  "village",
  "industrial"
],
      editorial: {
  "deck": "Delayed symptoms, contaminated equipment, low-air zones, and pre-existing clean routes become a fair environmental pressure system while real sulfur mustard history remains distinct from Cruor fiction.",
  "whatItIs": "Sulfur mustard is a chemical warfare vesicant. Exposure can injure skin, eyes, and the respiratory tract, with effects that may be delayed and contamination that can remain on materials. The familiar phrase mustard gas simplifies a substance that may also be encountered as an oily liquid or vapor.",
  "whyItDisturbs": "The body may understand danger after the apparent moment of escape. Cruor horror uses that delay to make time, route choice, equipment custody, and trust in the environment mechanically important.",
  "creativeUses": [
    "Use a delayed clock instead of instant damage.",
    "Make low stains, oily surfaces, and sealed equipment readable evidence.",
    "Build counterplay around withdrawal, isolation, and an existing clean-air route.",
    "Let a wash station or filter record reveal who knowingly reopened the hazard."
  ],
  "cautions": [
    "Do not provide synthesis, dispersal, dosage, weaponization, or operational use instructions.",
    "Do not present odor as reliable detection.",
    "Do not turn real victims of chemical warfare into spectacle or trivial battlefield color.",
    "Keep treatment and decontamination abstract and game-facing rather than medical advice.",
    "Clearly label supernatural recirculation and Latency Clock effects as Cruor fiction."
  ]
},
      media: {
  "imageKey": "card-mustard-gas.webp",
  "imageProvider": "local",
  "imageAlt": "Mustard Gas inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
  "imageCredit": "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep unpublished until provenance is verified or the image is replaced.",
  "icon": "fa-skull-crossbones"
},
      tags: [
  "source:mustard-gas",
  "capability:dark-places",
  "cultural-review-required"
], provenance: MODULE_PROVENANCE,
    },
    components: DARK_PLACES_COMPONENTS,
    metadata: { author: "Cruor Games", revision: 1, reviewedAt: "2026-07-17", sourceFile: "shared/content/content-packs/mustard-gas-semantic-v2-pack.js", capabilityWaivers: [], modernCapabilityLinks: [] },
    provenance: MODULE_PROVENANCE,
  }],
  metadata: {
    bundled: true, registryRole: "semantic-v2-approved", humanApprovalRequired: false,
    retainedLegacyPublicBehavior: true, editorialStatus: "approved",
    publicationBlockers: ["image-provenance-required"],
    culturalSourceBoundary: "Sulfur mustard history, delayed vesicant effects, and contamination are bounded source context; the Delayed Ward, supernatural recirculation, Latency Clock, and all mechanics are fictional and non-operational.", modernCapabilityLinks: [],
  },
});

export const MUSTARD_GAS_SEMANTIC_V2_MODULE = MUSTARD_GAS_SEMANTIC_V2_PACK.modules[0];
