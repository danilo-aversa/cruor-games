export const MONSTER_ATTACK_PATTERN_PROGRESSION_VERSION = "monster-attack-pattern-progression-v1.0";
export const MONSTER_GRAFT_PROGRESSION_VERSION = "monster-graft-progression-v1.0";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeCr(value) {
  const number = Number(value);
  return Number.isFinite(number) ? clamp(number, 0, 30) : 0;
}

function uniqueArray(values = []) {
  return [...new Set(asArray(values).map(cleanString).filter(Boolean))];
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function deepMerge(base, patch) {
  if (!isPlainObject(base)) return isPlainObject(patch) ? { ...patch } : patch;
  if (!isPlainObject(patch)) return patch === undefined ? { ...base } : patch;
  const result = { ...base };
  Object.entries(patch).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
      return;
    }
    result[key] = Array.isArray(value) ? [...value] : value;
  });
  return result;
}

function getProjectionVersion(graft = {}) {
  return cleanString(graft.kind) === "attackPattern"
    ? MONSTER_ATTACK_PATTERN_PROGRESSION_VERSION
    : MONSTER_GRAFT_PROGRESSION_VERSION;
}

function applyAbilityPatch(ability = {}, patch = null) {
  if (!isPlainObject(patch)) return ability;
  const merged = deepMerge(ability, patch);
  if (!isPlainObject(patch.rules)) return merged;
  const rules = merged.rules || {};
  return {
    ...merged,
    section: rules.section || merged.section,
    actionEconomy: rules.actionEconomy || merged.actionEconomy,
    usage: rules.usage || merged.usage,
    trigger: rules.trigger ?? merged.trigger,
    targeting: rules.targeting || merged.targeting,
    areaEffect: rules.areaEffect || merged.areaEffect,
    counterplay: rules.counterplay || merged.counterplay,
    multiattack: rules.multiattack || merged.multiattack,
    spellcasting: rules.spellcasting || merged.spellcasting,
    defense: rules.defense || merged.defense,
    summon: rules.summon || merged.summon,
    procedure: rules.procedure || merged.procedure,
    ongoing: rules.ongoing || merged.ongoing,
    references: rules.references || merged.references,
  };
}

function isInBand(targetCr, band = {}) {
  const cr = normalizeCr(targetCr);
  const min = Number.isFinite(Number(band.minCr)) ? Number(band.minCr) : 0;
  const max = Number.isFinite(Number(band.maxCr)) ? Number(band.maxCr) : 30;
  return cr >= min && cr <= max;
}

export function getMonsterAttackPatternProgressionBand(graft = {}, targetCr = 0) {
  const bands = asArray(graft.progression?.bands);
  if (!bands.length) return null;
  return bands.find((band) => isInBand(targetCr, band)) || bands[bands.length - 1] || null;
}

function getAvailableLocalIds(graft = {}, band = null) {
  const authoredIds = asArray(graft.abilities).map((ability) => cleanString(ability.id)).filter(Boolean);
  if (!band) return new Set(authoredIds);
  const requested = uniqueArray(band.abilityIds);
  const filtered = requested.filter((id) => authoredIds.includes(id));
  return new Set(filtered.length ? filtered : authoredIds.slice(0, 1));
}

function filterSequence(sequence = [], availableIds = new Set()) {
  return asArray(sequence).map(cleanString).filter((id) => availableIds.has(id));
}

function fillSequence(sequence = [], availableIds = new Set(), count = 1) {
  const filtered = filterSequence(sequence, availableIds);
  const fallback = [...availableIds][0];
  const seed = filtered.length ? filtered : fallback ? [fallback] : [];
  if (!seed.length) return [];
  const result = [];
  while (result.length < Math.max(1, Number(count || 1))) {
    result.push(seed[result.length % seed.length]);
  }
  return result;
}

function normalizeAttackRef(entry = {}) {
  if (typeof entry === "string") return { ref: cleanString(entry), count: 1 };
  return {
    ...entry,
    ref: cleanString(entry.ref || entry.id || entry.label),
    count: Math.max(1, Number(entry.count || 1)),
  };
}

function allocateFixedAttacks(baseAttacks = [], availableIds = new Set(), desiredCount = 2) {
  const filtered = asArray(baseAttacks)
    .map(normalizeAttackRef)
    .filter((attack) => attack.ref && availableIds.has(attack.ref));
  const fallback = [...availableIds][0];
  const attacks = filtered.length ? filtered.map((attack) => ({ ...attack, count: 0 })) : fallback ? [{ ref: fallback, count: 0 }] : [];
  let remaining = Math.max(1, Number(desiredCount || 1));
  let index = 0;
  while (remaining > 0 && attacks.length) {
    attacks[index % attacks.length].count += 1;
    remaining -= 1;
    index += 1;
  }
  return attacks.filter((attack) => attack.count > 0);
}

function projectMultiattack(routine = {}, band = null, availableIds = new Set()) {
  const base = routine.multiattack || {};
  const override = band?.multiattack || {};
  const enabled = Object.prototype.hasOwnProperty.call(override, "enabled")
    ? Boolean(override.enabled)
    : Boolean(base.enabled);
  if (!enabled) {
    return {
      ...base,
      ...override,
      enabled: false,
      count: 0,
      attacks: [],
      choices: [],
      replacements: [],
    };
  }

  const mode = cleanString(override.mode || base.mode) || "fixed";
  const count = Math.max(1, Number(override.count || base.count || 2));
  const choices = uniqueArray(override.choices?.length ? override.choices : base.choices).filter((id) => availableIds.has(id));
  const attacks = mode === "choice"
    ? choices.map((ref) => ({ ref, count: 1 }))
    : allocateFixedAttacks(override.attacks?.length ? override.attacks : base.attacks, availableIds, count);
  const replacements = asArray(override.replacements?.length ? override.replacements : base.replacements)
    .filter((replacement) => availableIds.has(cleanString(replacement.with || replacement.ref || replacement.id)))
    .map((replacement) => ({ ...replacement }));

  return {
    ...base,
    ...override,
    enabled: attacks.length > 0 || choices.length > 0,
    mode,
    count,
    attacks,
    choices,
    replacements,
  };
}

function projectRoutine(routine = {}, band = null, availableIds = new Set()) {
  const multiattack = projectMultiattack(routine, band, availableIds);
  const turnCount = multiattack.enabled ? multiattack.count : 1;
  const defaultSequence = fillSequence(
    band?.defaultSequence?.length ? band.defaultSequence : routine.defaultSequence,
    availableIds,
    turnCount,
  );
  const opener = filterSequence(
    band?.opener?.length ? band.opener : routine.opener,
    availableIds,
  );
  const alternatives = asArray(routine.alternatives)
    .map((alternative) => ({
      ...alternative,
      sequence: filterSequence(alternative.sequence, availableIds),
    }))
    .filter((alternative) => alternative.sequence.length > 0);

  return {
    ...routine,
    defaultSequence,
    opener,
    alternatives,
    multiattack,
    progressionBandId: cleanString(band?.id) || null,
  };
}

export function projectMonsterGraftForCr(graft = {}, { targetCr = 0 } = {}) {
  const band = getMonsterAttackPatternProgressionBand(graft, targetCr);
  if (!band) return graft;
  const projectedGraft = deepMerge(graft, band.graftPatch || {});
  const availableIds = getAvailableLocalIds(projectedGraft, band);
  const abilityPatches = isPlainObject(band.abilityPatches)
    ? band.abilityPatches
    : {};
  const abilities = asArray(projectedGraft.abilities)
    .filter((ability) => availableIds.has(cleanString(ability.id)))
    .map((ability) =>
      applyAbilityPatch(
        ability,
        abilityPatches[cleanString(ability.id)] || null,
      ),
    );
  const routine = projectRoutine(projectedGraft.routine || {}, band, availableIds);
  return {
    ...projectedGraft,
    abilities,
    routine,
    projection: {
      version: getProjectionVersion(projectedGraft),
      basis: cleanString(projectedGraft.progression?.basis) || "targetCr",
      targetCr: normalizeCr(targetCr),
      bandId: cleanString(band.id) || null,
      abilityIds: [...availableIds],
      authoredAbilityCount: asArray(graft.abilities).length,
      projectedAbilityCount: abilities.length,
      multiattackEnabled: Boolean(routine.multiattack?.enabled),
      multiattackCount: Number(routine.multiattack?.count || 0),
      appliedAbilityPatchIds: Object.keys(abilityPatches),
      graftPatchApplied: isPlainObject(band.graftPatch),
    },
  };
}

export function getAbilityAvailabilityForCr(ability = {}, targetCr = 0) {
  const progression = ability.progression || ability.availabilityProfile || null;
  if (!progression) return { available: true, reason: "unrestricted" };
  const minCr = Number.isFinite(Number(progression.minCr)) ? Number(progression.minCr) : 0;
  const maxCr = Number.isFinite(Number(progression.maxCr)) ? Number(progression.maxCr) : 30;
  const cr = normalizeCr(targetCr);
  return {
    available: cr >= minCr && cr <= maxCr,
    reason: cr < minCr ? "below-min-cr" : cr > maxCr ? "above-max-cr" : "in-range",
    minCr,
    maxCr,
    targetCr: cr,
  };
}

export function projectMonsterAbilitiesForCr(abilities = [], targetCr = 0) {
  return asArray(abilities)
    .map((ability) => {
      if (ability?.synthetic && ability?.rules?.multiattack?.enabled && ability.patternProgression?.bands?.length) {
        const bundle = {
          graftId: ability.sourceGraftId || cleanString(ability.id).split(":")[0],
          progression: ability.patternProgression,
        };
        const band = getBundleProgressionBand(bundle, targetCr);
        return band
          ? projectSyntheticMultiattackAbility(ability, bundle, band, targetCr)
          : ability;
      }
      return getAbilityAvailabilityForCr(ability, targetCr).available ? ability : null;
    })
    .filter(Boolean);
}

function getBundleProgressionBand(bundle = {}, targetCr = 0) {
  const bands = asArray(bundle.progression?.bands);
  if (!bands.length) return null;
  return bands.find((band) => isInBand(targetCr, band)) || bands[bands.length - 1] || null;
}

function toRuntimeAbilityId(graftId = "", localId = "") {
  const cleanGraftId = cleanString(graftId);
  const cleanLocalId = cleanString(localId);
  if (!cleanLocalId) return "";
  if (cleanLocalId.includes(":")) return cleanLocalId;
  return cleanGraftId ? `${cleanGraftId}:${cleanLocalId}` : cleanLocalId;
}

function projectSyntheticMultiattackAbility(ability = {}, bundle = {}, band = null, targetCr = 0) {
  const override = band?.multiattack || {};
  const base = ability.rules?.multiattack || ability.multiattack || {};
  const enabled = Object.prototype.hasOwnProperty.call(override, "enabled")
    ? Boolean(override.enabled)
    : Boolean(base.enabled);
  if (!enabled) return null;

  const activeLocalIds = new Set(uniqueArray(band?.abilityIds));
  const fallbackLocalId = [...activeLocalIds][0] || null;
  const desiredCount = Math.max(1, Number(override.count || base.count || 2));
  const authoredAttacks = asArray(base.attacks)
    .map((attack) => {
      const localId = cleanString(attack.ref).split(":").pop();
      return {
        ...attack,
        localId,
        ref: toRuntimeAbilityId(bundle.graftId, localId),
        count: 0,
      };
    })
    .filter((attack) => !activeLocalIds.size || activeLocalIds.has(attack.localId));
  const attacks = authoredAttacks.length
    ? authoredAttacks
    : fallbackLocalId
      ? [{ ref: toRuntimeAbilityId(bundle.graftId, fallbackLocalId), localId: fallbackLocalId, count: 0 }]
      : [];
  let remaining = desiredCount;
  let index = 0;
  while (remaining > 0 && attacks.length) {
    attacks[index % attacks.length].count += 1;
    remaining -= 1;
    index += 1;
  }

  const replacements = asArray(base.replacements)
    .filter((replacement) => {
      const localId = cleanString(replacement.with).split(":").pop();
      return !activeLocalIds.size || activeLocalIds.has(localId);
    })
    .map((replacement) => {
      const localId = cleanString(replacement.with).split(":").pop();
      return {
        ...replacement,
        with: toRuntimeAbilityId(bundle.graftId, localId),
      };
    });
  const multiattack = {
    ...base,
    ...override,
    enabled: attacks.length > 0,
    count: desiredCount,
    attacks: attacks.map(({ localId: _localId, ...attack }) => attack).filter((attack) => attack.count > 0),
    replacements,
  };

  return {
    ...ability,
    rules: {
      ...(ability.rules || {}),
      multiattack,
    },
    multiattack,
    patternProgression: bundle.progression || ability.patternProgression || null,
    projection: {
      version: MONSTER_ATTACK_PATTERN_PROGRESSION_VERSION,
      targetCr: normalizeCr(targetCr),
      bandId: cleanString(band?.id) || null,
      multiattackCount: desiredCount,
    },
  };
}

function projectBundleForCr(bundle = {}, targetCr = 0) {
  const band = getBundleProgressionBand(bundle, targetCr);
  if (!band) {
    const abilities = projectMonsterAbilitiesForCr(bundle.abilities, targetCr);
    return {
      ...bundle,
      abilities,
      primaryAbility: abilities.find((ability) => !ability.synthetic) || abilities[0] || null,
      projection: {
        version: cleanString(bundle.kind) === "attackPattern"
          ? MONSTER_ATTACK_PATTERN_PROGRESSION_VERSION
          : MONSTER_GRAFT_PROGRESSION_VERSION,
        targetCr: normalizeCr(targetCr),
        authoredAbilityCount: asArray(bundle.abilities).length,
        projectedAbilityCount: abilities.length,
      },
    };
  }

  const activeLocalIds = new Set(uniqueArray(band.abilityIds));
  const abilityPatches = isPlainObject(band.abilityPatches)
    ? band.abilityPatches
    : {};
  const abilities = asArray(bundle.abilities)
    .map((ability) => {
      if (ability.synthetic && ability.rules?.multiattack?.enabled) {
        return projectSyntheticMultiattackAbility(ability, bundle, band, targetCr);
      }
      if (ability.synthetic) return getAbilityAvailabilityForCr(ability, targetCr).available ? ability : null;
      if (!activeLocalIds.has(cleanString(ability.localAbilityId))) return null;
      return applyAbilityPatch(
        ability,
        abilityPatches[cleanString(ability.localAbilityId)] || null,
      );
    })
    .filter(Boolean);

  return {
    ...bundle,
    abilities,
    primaryAbility: abilities.find((ability) => !ability.synthetic) || abilities[0] || null,
    projection: {
      version: cleanString(bundle.kind) === "attackPattern"
        ? MONSTER_ATTACK_PATTERN_PROGRESSION_VERSION
        : MONSTER_GRAFT_PROGRESSION_VERSION,
      targetCr: normalizeCr(targetCr),
      bandId: cleanString(band.id) || null,
      authoredAbilityCount: asArray(bundle.abilities).length,
      projectedAbilityCount: abilities.length,
      multiattackEnabled: abilities.some((ability) => Boolean(ability.rules?.multiattack?.enabled)),
      multiattackCount: Number(band.multiattack?.count || 0),
    },
  };
}

export function projectMonsterAbilityModelForCr(abilityModel = {}, targetCr = 0) {
  const bundles = asArray(abilityModel?.bundles).map((bundle) =>
    projectBundleForCr(bundle, targetCr),
  );
  const abilities = bundles.length
    ? bundles.flatMap((bundle) => bundle.abilities)
    : projectMonsterAbilitiesForCr(abilityModel?.abilities, targetCr);

  return {
    ...abilityModel,
    abilities,
    bundles,
    total: abilities.length,
    synthetic: abilities.filter((ability) => ability.synthetic).length,
    byGraft: bundles.length
      ? Object.fromEntries(bundles.map((bundle) => [bundle.graftId, bundle.abilities.length]))
      : abilityModel.byGraft,
    projection: {
      version: MONSTER_GRAFT_PROGRESSION_VERSION,
      targetCr: normalizeCr(targetCr),
      authoredAbilityCount: asArray(abilityModel?.abilities).length,
      projectedAbilityCount: abilities.length,
    },
  };
}
