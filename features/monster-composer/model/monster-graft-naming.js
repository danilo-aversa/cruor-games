export const MONSTER_GRAFT_NAMING_AUDIT_VERSION =
  "monster-graft-naming-audit-v1.4-twist-reviewed";

export const MONSTER_GRAFT_NAMING_REVIEWED_SLOTS = Object.freeze([
  "attack",
  "body",
  "mind",
  "movement",
  "horror",
  "twist",
]);

export const MONSTER_GRAFT_CANONICAL_BESTIARY_NAMES = Object.freeze([
  "Cunning Action",
  "Ethereal Sight",
  "Incorporeal Movement",
  "Siege Monster",
  "Spider Climb",
  "Stench",
  "Undead Fortitude",
  "Vanish",
  "Web",
  "Web Walker",
  "Wail",
]);

export const MONSTER_GRAFT_NAMING_EXCEPTIONS = Object.freeze([
  "Cold Funeral Touch",
]);

export const MONSTER_GRAFT_NAMING_RULES = Object.freeze({
  maxWords: 2,
  maxCharacters: 24,
  punctuationPattern: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
  forbiddenDashPattern: /[-\u2010-\u2015]/,
  genericTitles: Object.freeze([
    "Graft",
    "Attack Pattern",
    "Trait Bundle",
    "Movement Pattern",
    "Mind Graft",
    "Body Graft",
  ]),
});

function cleanString(value) {
  return String(value || "").trim();
}

function titleWordCount(title = "") {
  return cleanString(title).split(/\s+/).filter(Boolean).length;
}

export function auditMonsterGraftDisplayName(graft = {}) {
  const title = cleanString(graft.title);
  const slot = cleanString(graft.slot).toLowerCase();
  const issues = [];

  if (!title) {
    issues.push({
      code: "GRAFT_NAME_MISSING",
      severity: "error",
      message: "The Graft has no published title.",
    });
    return { id: cleanString(graft.id), slot, title, wordCount: 0, issues, pass: false };
  }

  const wordCount = titleWordCount(title);
  const canonicalBestiaryName = MONSTER_GRAFT_CANONICAL_BESTIARY_NAMES.includes(title);
  const approvedException = MONSTER_GRAFT_NAMING_EXCEPTIONS.includes(title);
  if (MONSTER_GRAFT_NAMING_RULES.forbiddenDashPattern.test(title)) {
    issues.push({
      code: "GRAFT_NAME_HAS_DASH",
      severity: "error",
      message: "Published Graft names cannot contain hyphens or dash punctuation.",
    });
  }
  if (
    wordCount > MONSTER_GRAFT_NAMING_RULES.maxWords &&
    !canonicalBestiaryName &&
    !approvedException
  ) {
    issues.push({
      code: "GRAFT_NAME_TOO_COMPOUND",
      severity: "error",
      message: `Published Graft names can use at most ${MONSTER_GRAFT_NAMING_RULES.maxWords} words.`,
    });
  }
  if (title.length > MONSTER_GRAFT_NAMING_RULES.maxCharacters) {
    issues.push({
      code: "GRAFT_NAME_TOO_LONG",
      severity: "error",
      message: `Published Graft names can use at most ${MONSTER_GRAFT_NAMING_RULES.maxCharacters} characters.`,
    });
  }
  if (!MONSTER_GRAFT_NAMING_RULES.punctuationPattern.test(title)) {
    issues.push({
      code: "GRAFT_NAME_COMPLEX_PUNCTUATION",
      severity: "error",
      message: "Published Graft names should contain only letters and a single separating space.",
    });
  }
  if (MONSTER_GRAFT_NAMING_RULES.genericTitles.includes(title)) {
    issues.push({
      code: "GRAFT_NAME_GENERIC_TYPE",
      severity: "error",
      message: "The published name repeats a technical Graft type instead of naming the concept.",
    });
  }

  return {
    id: cleanString(graft.id),
    slot,
    title,
    wordCount,
    canonicalBestiaryName,
    approvedException,
    issues,
    pass: issues.every((issue) => issue.severity !== "error"),
  };
}

export function buildMonsterGraftNamingCatalogAudit(
  grafts = [],
  { reviewedSlots = MONSTER_GRAFT_NAMING_REVIEWED_SLOTS } = {},
) {
  const reviewed = new Set(reviewedSlots.map((slot) => cleanString(slot).toLowerCase()));
  const reports = grafts
    .filter((graft) => reviewed.has(cleanString(graft.slot).toLowerCase()))
    .map(auditMonsterGraftDisplayName)
    .sort((left, right) =>
      left.slot.localeCompare(right.slot) || left.title.localeCompare(right.title),
    );

  const titleOwners = new Map();
  reports.forEach((report) => {
    const key = report.title.toLowerCase();
    if (!titleOwners.has(key)) titleOwners.set(key, []);
    titleOwners.get(key).push(report.id);
  });
  titleOwners.forEach((ids, key) => {
    if (ids.length < 2) return;
    reports
      .filter((report) => report.title.toLowerCase() === key)
      .forEach((report) => {
        report.issues.push({
          code: "GRAFT_NAME_DUPLICATE",
          severity: "error",
          message: `The published title is also used by: ${ids.filter((id) => id !== report.id).join(", ")}.`,
        });
        report.pass = false;
      });
  });

  const bySlot = Object.fromEntries(
    [...reviewed].sort().map((slot) => [
      slot,
      reports.filter((report) => report.slot === slot).length,
    ]),
  );
  const errors = reports.flatMap((report) =>
    report.issues
      .filter((issue) => issue.severity === "error")
      .map((issue) => ({ id: report.id, slot: report.slot, title: report.title, ...issue })),
  );

  return {
    version: MONSTER_GRAFT_NAMING_AUDIT_VERSION,
    reviewedSlots: [...reviewed].sort(),
    rules: {
      ...MONSTER_GRAFT_NAMING_RULES,
      genericTitles: [...MONSTER_GRAFT_NAMING_RULES.genericTitles],
      canonicalBestiaryNames: [...MONSTER_GRAFT_CANONICAL_BESTIARY_NAMES],
      approvedExceptions: [...MONSTER_GRAFT_NAMING_EXCEPTIONS],
    },
    total: reports.length,
    passing: reports.filter((report) => report.pass).length,
    error: reports.filter((report) => !report.pass).length,
    bySlot,
    reports,
    errors,
    pass: reports.length > 0 && errors.length === 0,
  };
}
