const TRIGGER_WARNING_DEFINITIONS = [
  {
    id: "ableism",
    label: "Ableism",
    icon: "fa-wheelchair",
    description: "Prejudice, discrimination, dehumanization, or violence directed at disabled people or people perceived as disabled.",
    aliases: [],
  },
  {
    id: "abortion",
    label: "Abortion",
    icon: "fa-person-pregnant",
    description: "Discussion or depiction of ending a pregnancy, including procedures, decisions, or aftermath.",
    aliases: [],
  },
  {
    id: "abusive-relationship",
    label: "Abusive Relationship",
    icon: "fa-heart-crack",
    description: "A relationship involving coercion, control, intimidation, degradation, or physical or sexual harm.",
    aliases: [],
  },
  {
    id: "acephobia",
    label: "Acephobia",
    icon: "fa-circle-minus",
    description: "Prejudice, hostility, erasure, or discrimination directed at asexual or aromantic-spectrum people.",
    aliases: [],
  },
  {
    id: "ageism",
    label: "Ageism",
    icon: "fa-hourglass-half",
    description: "Prejudice, discrimination, ridicule, or mistreatment based on age.",
    aliases: [],
  },
  {
    id: "alcohol",
    label: "Alcohol",
    icon: "fa-wine-glass",
    description: "Alcohol use, intoxication, drinking culture, or scenes centered on alcoholic beverages.",
    aliases: [],
  },
  {
    id: "alcoholism",
    label: "Alcoholism",
    icon: "fa-bottle-droplet",
    description: "Alcohol dependence, addiction, withdrawal, relapse, or the consequences of compulsive drinking.",
    aliases: [],
  },
  {
    id: "amputation",
    label: "Amputation",
    icon: "fa-scissors",
    description: "Loss or removal of a limb or other body part, whether accidental, medical, or violent.",
    aliases: [],
  },
  {
    id: "animal-abuse",
    label: "Animal Abuse",
    icon: "fa-paw",
    description: "Cruelty, neglect, exploitation, injury, or deliberate harm involving animals.",
    aliases: ["Animal cruelty"],
  },
  {
    id: "animal-death",
    label: "Animal Death",
    icon: "fa-dove",
    description: "The death, killing, euthanasia, or discovery of dead animals.",
    aliases: [],
  },
  {
    id: "antisemitism",
    label: "Antisemitism",
    icon: "fa-star-of-david",
    description: "Prejudice, hatred, conspiracy theories, discrimination, or violence directed at Jewish people.",
    aliases: [],
  },
  {
    id: "anxiety",
    label: "Anxiety",
    icon: "fa-face-grimace",
    description: "Anxiety, panic, severe dread, intrusive fear, or distressing loss of emotional control.",
    aliases: [],
  },
  {
    id: "assault",
    label: "Assault",
    icon: "fa-hand-fist",
    description: "A physical attack, threatened attack, or non-sexual act of interpersonal violence.",
    aliases: [],
  },
  {
    id: "attempted-murder",
    label: "Attempted Murder",
    icon: "fa-crosshairs",
    description: "An intentional but unsuccessful attempt to kill another person.",
    aliases: [],
  },
  {
    id: "attempted-rape",
    label: "Attempted Rape",
    icon: "fa-shield-heart",
    description: "An attempted act of rape or forced sexual penetration that is not completed.",
    aliases: [],
  },
  {
    id: "bestiality",
    label: "Bestiality",
    icon: "fa-dog",
    description: "Sexual contact, attempted sexual contact, or sexualized abuse involving animals.",
    aliases: [],
  },
  {
    id: "blood",
    label: "Blood",
    icon: "fa-droplet",
    description: "Visible blood, bleeding, blood loss, or blood used as a prominent visual or thematic element.",
    aliases: [],
  },
  {
    id: "bones",
    label: "Bones",
    icon: "fa-bone",
    description: "Human or animal bones, exposed skeletal remains, bone fragments, or handling of bones.",
    aliases: [],
  },
  {
    id: "branding",
    label: "Branding",
    icon: "fa-fire-flame-simple",
    description: "Deliberate burning or marking of skin to punish, identify, control, or claim ownership.",
    aliases: [],
  },
  {
    id: "bullying",
    label: "Bullying",
    icon: "fa-people-arrows-left-right",
    description: "Repeated intimidation, humiliation, exclusion, harassment, or abuse of power by peers or authority figures.",
    aliases: [],
  },
  {
    id: "cancer",
    label: "Cancer",
    icon: "fa-ribbon",
    description: "Cancer diagnosis, treatment, progression, recurrence, or death related to cancer.",
    aliases: [],
  },
  {
    id: "cannibalism",
    label: "Cannibalism",
    icon: "fa-utensils",
    description: "Humans or human-like beings consuming human flesh, whether by force, survival, ritual, or compulsion.",
    aliases: [],
  },
  {
    id: "car-accident",
    label: "Car Accident",
    icon: "fa-car-burst",
    description: "A motor-vehicle collision, crash, injury, or death caused by a road accident.",
    aliases: [],
  },
  {
    id: "cheating",
    label: "Cheating",
    icon: "fa-user-xmark",
    description: "Infidelity or betrayal of agreed boundaries within a romantic or sexual relationship.",
    aliases: [],
  },
  {
    id: "child-abuse",
    label: "Child Abuse",
    icon: "fa-child-reaching",
    description: "Physical, emotional, sexual, or neglectful abuse involving a child.",
    aliases: [],
  },
  {
    id: "child-death",
    label: "Child Death",
    icon: "fa-baby",
    description: "The death, killing, or fatal illness of a child or infant.",
    aliases: [],
  },
  {
    id: "childbirth",
    label: "Childbirth",
    icon: "fa-person-breastfeeding",
    description: "Labor, delivery, birth complications, or graphic or distressing aspects of giving birth.",
    aliases: [],
  },
  {
    id: "conversion-therapy",
    label: "Conversion Therapy",
    icon: "fa-arrows-rotate",
    description: "Attempts to change or suppress a person\u2019s sexual orientation or gender identity through coercive practices.",
    aliases: [],
  },
  {
    id: "cults",
    label: "Cults",
    icon: "fa-people-roof",
    description: "High-control groups involving indoctrination, coercion, isolation, exploitation, or ritualized abuse.",
    aliases: [],
  },
  {
    id: "death",
    label: "Death",
    icon: "fa-skull",
    description: "Death, dying, corpses, funerals, grief, or sustained discussion of mortality.",
    aliases: [],
  },
  {
    id: "decapitation",
    label: "Decapitation",
    icon: "fa-user-minus",
    description: "Removal or severing of the head, whether described, shown, threatened, or discovered afterward.",
    aliases: [],
  },
  {
    id: "demons",
    label: "Demons",
    icon: "fa-ghost",
    description: "Demons, demonic entities, possession, summoning, or explicitly demonic imagery.",
    aliases: [],
  },
  {
    id: "depression",
    label: "Depression",
    icon: "fa-cloud-rain",
    description: "Depression, hopelessness, emotional numbness, severe withdrawal, or impaired daily functioning.",
    aliases: [],
  },
  {
    id: "divorce",
    label: "Divorce",
    icon: "fa-ring",
    description: "Divorce, marital separation, custody conflict, or distress surrounding the end of a marriage.",
    aliases: [],
  },
  {
    id: "drugs",
    label: "Drugs",
    icon: "fa-pills",
    description: "Recreational or illicit drug use, intoxication, dealing, overdose risk, or withdrawal.",
    aliases: [],
  },
  {
    id: "eating-disorder",
    label: "Eating Disorder",
    icon: "fa-weight-scale",
    description: "Disordered eating, restriction, purging, bingeing, body-control behaviors, or eating-disorder recovery.",
    aliases: [],
  },
  {
    id: "emesis",
    label: "Emesis",
    icon: "fa-face-dizzy",
    description: "Vomiting, retching, nausea culminating in vomiting, or visible vomit.",
    aliases: ["Vomiting", "Vomit"],
  },
  {
    id: "emotional-abuse",
    label: "Emotional Abuse",
    icon: "fa-face-sad-tear",
    description: "Manipulation, humiliation, threats, gaslighting, coercive control, or sustained psychological degradation.",
    aliases: [],
  },
  {
    id: "eugenics",
    label: "Eugenics",
    icon: "fa-dna",
    description: "Ideologies or practices seeking to control reproduction or eliminate people deemed genetically or socially undesirable.",
    aliases: [],
  },
  {
    id: "famine",
    label: "Famine",
    icon: "fa-wheat-awn-circle-exclamation",
    description: "Large-scale food scarcity, mass hunger, societal collapse from lack of food, or famine-related death.",
    aliases: [],
  },
  {
    id: "fatphobia",
    label: "Fatphobia",
    icon: "fa-person-circle-question",
    description: "Stigma, ridicule, discrimination, medical bias, or dehumanization directed at fat people.",
    aliases: [],
  },
  {
    id: "fire",
    label: "Fire",
    icon: "fa-fire",
    description: "Fire, burning buildings, severe burns, immolation, or danger from uncontrolled flames.",
    aliases: [],
  },
  {
    id: "genocide",
    label: "Genocide",
    icon: "fa-people-group",
    description: "The attempted or systematic destruction of a national, ethnic, racial, religious, or other protected group.",
    aliases: [],
  },
  {
    id: "gore",
    label: "Gore",
    icon: "fa-burst",
    description: "Graphic bodily injury, exposed tissue, dismemberment, mutilation, or explicit physical damage.",
    aliases: [],
  },
  {
    id: "gun-violence",
    label: "Gun Violence",
    icon: "fa-gun",
    description: "Threatened or actual violence involving firearms, including shootings and gun-related injury.",
    aliases: [],
  },
  {
    id: "hallucinations",
    label: "Hallucinations",
    icon: "fa-eye",
    description: "Sensory experiences or perceptions that are not externally present, including frightening or disorienting visions.",
    aliases: [],
  },
  {
    id: "homomisia",
    label: "Homomisia",
    icon: "fa-mars-and-venus",
    description: "Hatred, hostility, dehumanization, or violence directed at gay people or same-sex attraction.",
    aliases: [],
  },
  {
    id: "homophobia",
    label: "Homophobia",
    icon: "fa-rainbow",
    description: "Fear, prejudice, discrimination, harassment, or hostility directed at gay people.",
    aliases: [],
  },
  {
    id: "hospitalisation",
    label: "Hospitalisation",
    icon: "fa-bed-pulse",
    description: "Admission to hospital, emergency treatment, invasive care, or distress associated with being hospitalized.",
    aliases: [],
  },
  {
    id: "hostages",
    label: "Hostages",
    icon: "fa-user-lock",
    description: "People held captive to force compliance, secure demands, or prevent intervention.",
    aliases: [],
  },
  {
    id: "harry-potter-references",
    label: "Harry Potter References",
    icon: "fa-wand-magic-sparkles",
    description: "Direct or indirect references to the Harry Potter franchise, its characters, terminology, creator, or associated imagery.",
    aliases: [],
  },
  {
    id: "incest",
    label: "Incest",
    icon: "fa-people-line",
    description: "Sexual or romantic contact, coercion, or abuse between close family members.",
    aliases: [],
  },
  {
    id: "infertility",
    label: "Infertility",
    icon: "fa-seedling",
    description: "Difficulty or inability to conceive, fertility treatment, reproductive grief, or social pressure around fertility.",
    aliases: [],
  },
  {
    id: "kidnapping",
    label: "Kidnapping",
    icon: "fa-person-circle-minus",
    description: "Abduction, unlawful confinement, forced transport, or disappearance caused by another person.",
    aliases: [],
  },
  {
    id: "lesbiphobia",
    label: "Lesbiphobia",
    icon: "fa-venus",
    description: "Prejudice, hostility, discrimination, harassment, or violence directed specifically at lesbians.",
    aliases: [],
  },
  {
    id: "mental-health-hospitalization",
    label: "Mental Health Hospitalization",
    icon: "fa-hospital-user",
    description: "Inpatient psychiatric care, involuntary commitment, crisis admission, or distressing institutional treatment.",
    aliases: ["Mental health hospitalisation", "Psychiatric hospitalization", "Psychiatric hospitalisation"],
  },
  {
    id: "miscarriage",
    label: "Miscarriage",
    icon: "fa-person-falling-burst",
    description: "Pregnancy loss before birth, including medical, emotional, or graphic discussion of miscarriage.",
    aliases: [],
  },
  {
    id: "misgendering",
    label: "Misgendering",
    icon: "fa-id-card",
    description: "Referring to a person with incorrect pronouns, gendered terms, or identity, whether deliberate or accidental.",
    aliases: [],
  },
  {
    id: "misogyny",
    label: "Misogyny",
    icon: "fa-venus-mars",
    description: "Hatred, contempt, dehumanization, or systemic discrimination directed at women or femininity.",
    aliases: [],
  },
  {
    id: "murder",
    label: "Murder",
    icon: "fa-person-rifle",
    description: "Intentional killing of another person, including planning, commission, or aftermath.",
    aliases: [],
  },
  {
    id: "needles",
    label: "Needles",
    icon: "fa-syringe",
    description: "Hypodermic needles, injections, blood draws, puncture procedures, or needle-related fear.",
    aliases: [],
  },
  {
    id: "occult",
    label: "Occult",
    icon: "fa-hat-wizard",
    description: "Occult practices, rituals, symbols, divination, esoteric magic, or secret supernatural traditions.",
    aliases: [],
  },
  {
    id: "pedophilia",
    label: "Pedophilia",
    icon: "fa-child",
    description: "Sexual attraction to children, grooming, offending behavior, or discussion of child sexual exploitation.",
    aliases: [],
  },
  {
    id: "physical-abuse",
    label: "Physical Abuse",
    icon: "fa-hand",
    description: "Repeated or coercive physical harm within a relationship, family, institution, or dependency.",
    aliases: [],
  },
  {
    id: "plague",
    label: "Plague",
    icon: "fa-virus",
    description: "Epidemic disease, contagion, quarantine, mass illness, or death caused by widespread infection.",
    aliases: [],
  },
  {
    id: "poisoning",
    label: "Poisoning",
    icon: "fa-flask-vial",
    description: "Deliberate or accidental exposure to poison, toxins, contaminated food, gas, or lethal chemicals.",
    aliases: [],
  },
  {
    id: "police-brutality",
    label: "Police Brutality",
    icon: "fa-shield",
    description: "Abuse of authority, excessive force, unlawful killing, intimidation, or violence by police.",
    aliases: [],
  },
  {
    id: "pregnancy",
    label: "Pregnancy",
    icon: "fa-person-walking-arrow-right",
    description: "Pregnancy, prenatal complications, fear of pregnancy, or sustained focus on reproductive changes.",
    aliases: [],
  },
  {
    id: "profanity",
    label: "Profanity",
    icon: "fa-comment-slash",
    description: "Frequent, strong, or aggressive swearing and vulgar language.",
    aliases: [],
  },
  {
    id: "prostitution",
    label: "Prostitution",
    icon: "fa-person-dress",
    description: "Prostitution or sex work, including transactional sex, criminalization, exploitation, or coercion.",
    aliases: ["Sex work"],
  },
  {
    id: "ptsd",
    label: "PTSD",
    icon: "fa-brain",
    description: "Post-traumatic stress symptoms, flashbacks, hypervigilance, avoidance, or trauma-related distress.",
    aliases: [],
  },
  {
    id: "queerphobia",
    label: "Queerphobia",
    icon: "fa-transgender",
    description: "Prejudice, hostility, discrimination, erasure, or violence directed at queer people broadly.",
    aliases: [],
  },
  {
    id: "racism",
    label: "Racism",
    icon: "fa-earth-americas",
    description: "Racial prejudice, slurs, discrimination, segregation, dehumanization, or racially motivated violence.",
    aliases: [],
  },
  {
    id: "rape",
    label: "Rape",
    icon: "fa-user-shield",
    description: "Forced or non-consensual sexual penetration, including explicit or implied rape.",
    aliases: [],
  },
  {
    id: "religion",
    label: "Religion",
    icon: "fa-place-of-worship",
    description: "Religious belief, ritual, institutions, conflict, persecution, blasphemy, or criticism of religion.",
    aliases: [],
  },
  {
    id: "satan-the-devil",
    label: "Satan/The Devil",
    icon: "fa-fire-flame-curved",
    description: "References to Satan, the Devil, satanic imagery, diabolical worship, or related theology.",
    aliases: ["Satan / The Devil", "The Devil"],
  },
  {
    id: "school-shooting",
    label: "School Shooting",
    icon: "fa-school-lock",
    description: "A shooting or armed attack occurring in a school or educational setting.",
    aliases: [],
  },
  {
    id: "self-harm",
    label: "Self-Harm",
    icon: "fa-bandage",
    description: "Intentional self-inflicted injury, urges to self-harm, scars, relapse, or methods of self-injury.",
    aliases: ["Self harm"],
  },
  {
    id: "sexism",
    label: "Sexism",
    icon: "fa-scale-unbalanced-flip",
    description: "Prejudice, discrimination, stereotyping, or unequal treatment based on sex or gender.",
    aliases: [],
  },
  {
    id: "sexual-abuse",
    label: "Sexual Abuse",
    icon: "fa-person-circle-exclamation",
    description: "Sexual exploitation or coercion, especially within relationships of trust, dependency, or authority.",
    aliases: [],
  },
  {
    id: "sexual-assault",
    label: "Sexual Assault",
    icon: "fa-user-secret",
    description: "Non-consensual sexual contact or coercion that may not involve penetration.",
    aliases: [],
  },
  {
    id: "sexual-harassment",
    label: "Sexual Harassment",
    icon: "fa-comments",
    description: "Unwanted sexual comments, advances, intimidation, pressure, or hostile sexualized behavior.",
    aliases: [],
  },
  {
    id: "sexually-explicit-scenes",
    label: "Sexually Explicit Scenes",
    icon: "fa-bed",
    description: "Detailed or explicit depiction of consensual sexual activity.",
    aliases: [],
  },
  {
    id: "skeletons",
    label: "Skeletons",
    icon: "fa-skull-crossbones",
    description: "Visible, animated, displayed, or discovered human or animal skeletons.",
    aliases: [],
  },
  {
    id: "slavery",
    label: "Slavery",
    icon: "fa-link",
    description: "Enslavement, forced labor, ownership of people, trafficking, or institutionalized human exploitation.",
    aliases: [],
  },
  {
    id: "slut-shaming",
    label: "Slut Shaming",
    icon: "fa-comment-dots",
    description: "Humiliation, blame, or moral judgment directed at someone for perceived sexual behavior or appearance.",
    aliases: ["Slut-shaming"],
  },
  {
    id: "snakes",
    label: "Snakes",
    icon: "fa-staff-snake",
    description: "Snakes, snake attacks, constriction, venom, or prominent snake imagery.",
    aliases: [],
  },
  {
    id: "spiders",
    label: "Spiders",
    icon: "fa-spider",
    description: "Spiders, webs, egg sacs, swarms, bites, or prominent arachnid imagery.",
    aliases: ["Arachnids"],
  },
  {
    id: "stalking",
    label: "Stalking",
    icon: "fa-binoculars",
    description: "Repeated unwanted surveillance, pursuit, contact, fixation, or invasion of privacy.",
    aliases: [],
  },
  {
    id: "starvation",
    label: "Starvation",
    icon: "fa-bowl-food",
    description: "Severe hunger, food deprivation, wasting, forced denial of food, or death from lack of nutrition.",
    aliases: [],
  },
  {
    id: "suicide",
    label: "Suicide",
    icon: "fa-person-falling",
    description: "Suicidal ideation, suicide attempts, completed suicide, planning, or aftermath.",
    aliases: [],
  },
  {
    id: "terminal-illness",
    label: "Terminal Illness",
    icon: "fa-heart-pulse",
    description: "An incurable or life-limiting illness, end-of-life care, prognosis, or anticipatory grief.",
    aliases: [],
  },
  {
    id: "terrorism",
    label: "Terrorism",
    icon: "fa-bomb",
    description: "Politically or ideologically motivated violence intended to intimidate civilians or influence institutions.",
    aliases: [],
  },
  {
    id: "torture",
    label: "Torture",
    icon: "fa-dungeon",
    description: "Deliberate infliction of severe physical or psychological pain for punishment, coercion, information, or control.",
    aliases: [],
  },
  {
    id: "transmisia",
    label: "Transmisia",
    icon: "fa-arrow-right-arrow-left",
    description: "Hatred, hostility, dehumanization, or violence directed at transgender or gender-diverse people.",
    aliases: [],
  },
  {
    id: "transphobia",
    label: "Transphobia",
    icon: "fa-person-rays",
    description: "Fear, prejudice, discrimination, harassment, or hostility directed at transgender people.",
    aliases: [],
  },
  {
    id: "violence",
    label: "Violence",
    icon: "fa-bolt",
    description: "Physical conflict, injury, assault, killing, or threats of bodily harm.",
    aliases: [],
  },
  {
    id: "war",
    label: "War",
    icon: "fa-jet-fighter",
    description: "Armed conflict, combat, invasion, occupation, military violence, or civilian suffering caused by war.",
    aliases: [],
  },
];

const LEGACY_TRIGGER_WARNING_EXPANSIONS = Object.freeze({
  "death and funerary practice": Object.freeze(["Death", "Religion"]),
  "human remains": Object.freeze(["Bones"]),
  "human remains and bodily exposure": Object.freeze(["Bones", "Gore"]),
  "decomposition": Object.freeze(["Death", "Gore"]),
  "carrion birds feeding on the dead": Object.freeze(["Death", "Gore"]),
  "graphic violence": Object.freeze(["Gore", "Violence"]),
  "torture": Object.freeze(["Torture"]),
  "execution": Object.freeze(["Death", "Murder", "Violence"]),
  "crucifixion": Object.freeze(["Torture", "Violence", "Death"]),
  "impalement": Object.freeze(["Torture", "Gore", "Violence"]),
  "suffocation and burial alive": Object.freeze(["Death", "Violence"]),
  "chemical warfare and gas exposure": Object.freeze(["War", "Poisoning", "Violence"]),
  "mutation and body horror": Object.freeze(["Gore"]),
  "body horror": Object.freeze(["Gore"]),
  "disease and infection": Object.freeze(["Plague"]),
  "insects and arachnids": Object.freeze(["Spiders"]),
  "predation and animal attack": Object.freeze(["Violence"]),
  "religious ritual and ritual pollution": Object.freeze(["Religion"]),
  "religious ritual": Object.freeze(["Religion"]),
  "ritual pollution": Object.freeze(["Religion"]),
  "desecration and sacrilege": Object.freeze(["Religion"]),
  "desecration": Object.freeze(["Religion"]),
  "sacrilege": Object.freeze(["Religion"]),
  "ecological collapse": Object.freeze(["Animal Death"]),
  "starvation and compulsive hunger": Object.freeze(["Starvation"]),
  "compulsive hunger": Object.freeze(["Starvation"]),
  "human skin and body materials": Object.freeze(["Gore", "Bones"]),
  "human skin": Object.freeze(["Gore"]),
  "body materials": Object.freeze(["Gore", "Bones"]),
  "claustrophobia and confinement": Object.freeze(["Anxiety"]),
  "claustrophobia": Object.freeze(["Anxiety"]),
  "confinement": Object.freeze(["Hostages"]),
  "chemical warfare": Object.freeze(["War", "Poisoning"]),
  "gas exposure": Object.freeze(["Poisoning"]),
});

function normalizeLookupKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function capitalizeInitial(value) {
  const text = String(value || "").trim();
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

export const TRIGGER_WARNING_LIBRARY = Object.freeze(
  TRIGGER_WARNING_DEFINITIONS.map((entry) =>
    Object.freeze({
      ...entry,
      aliases: Object.freeze([...(entry.aliases || [])]),
    }),
  ),
);

export const TRIGGER_WARNING_LABELS = Object.freeze(
  TRIGGER_WARNING_LIBRARY.map((entry) => entry.label),
);

const TRIGGER_WARNING_BY_KEY = new Map();
TRIGGER_WARNING_LIBRARY.forEach((entry) => {
  [entry.id, entry.label, ...(entry.aliases || [])].forEach((value) => {
    const key = normalizeLookupKey(value);
    if (key) TRIGGER_WARNING_BY_KEY.set(key, entry);
  });
});

export function getTriggerWarningDefinition(value) {
  return TRIGGER_WARNING_BY_KEY.get(normalizeLookupKey(value)) || null;
}

export function isKnownTriggerWarning(value) {
  const key = normalizeLookupKey(value);
  return Boolean(TRIGGER_WARNING_BY_KEY.get(key) || LEGACY_TRIGGER_WARNING_EXPANSIONS[key]);
}

export function normalizeTriggerWarning(value) {
  const key = normalizeLookupKey(value);
  const expansion = LEGACY_TRIGGER_WARNING_EXPANSIONS[key];
  if (expansion?.length) return expansion[0];
  const definition = getTriggerWarningDefinition(value);
  return definition?.label || capitalizeInitial(value);
}

export function normalizeTriggerWarnings(values = []) {
  const source = Array.isArray(values) ? values : [];
  const normalized = source.flatMap((value) => {
    const key = normalizeLookupKey(value);
    const expansion = LEGACY_TRIGGER_WARNING_EXPANSIONS[key];
    if (expansion?.length) return expansion;
    const definition = getTriggerWarningDefinition(value);
    return definition?.label || capitalizeInitial(value);
  });
  return [...new Set(normalized.filter(Boolean))];
}

export function getTriggerWarningDefinitions(values = []) {
  return normalizeTriggerWarnings(values).map((label) => {
    const definition = getTriggerWarningDefinition(label);
    return (
      definition || {
        id: normalizeLookupKey(label).replace(/\s+/g, "-"),
        label,
        description:
          "This warning has not yet been added to the shared Trigger Warning library.",
        icon: "fa-triangle-exclamation",
        aliases: [],
      }
    );
  });
}
