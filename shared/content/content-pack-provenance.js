import { CONTENT_PACK_COLLECTIONS } from "./content-pack-schema.js";

export const CONTENT_PACK_MERGE_POLICY = "first-pack-wins";
export const CONTENT_ENTRY_PROVENANCE_SCHEMA_VERSION = "cruor-content-entry-provenance-v0.1";
export const CONTENT_PACK_COLLISION_REPORT_SCHEMA_VERSION = "cruor-content-pack-collision-report-v0.1";
export const LEGACY_CONTENT_MIGRATION_REPORT_SCHEMA_VERSION = "cruor-legacy-content-migration-report-v0.1";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeId(value) {
  return String(value || "").trim();
}

function stableSerialize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function isLegacyPack(pack = {}) {
  const registryRole = normalizeId(pack?.metadata?.registryRole).toLowerCase();
  const tags = asArray(pack?.tags).map((tag) => normalizeId(tag).toLowerCase());
  return registryRole.includes("legacy") || tags.includes("legacy-adapter") || tags.includes("legacy");
}

export function getContentEntryId(entryOrId) {
  if (typeof entryOrId === "string") return normalizeId(entryOrId);
  return normalizeId(entryOrId?.id || entryOrId?.slug || entryOrId?.legacyId);
}

function createEmptyCollectionIndex() {
  return Object.fromEntries(CONTENT_PACK_COLLECTIONS.map((collectionName) => [collectionName, new Map()]));
}

function buildClaimIndex(contentPacks = []) {
  const index = createEmptyCollectionIndex();

  asArray(contentPacks).forEach((pack, packIndex) => {
    const packId = normalizeId(pack?.id);
    if (!packId) return;

    CONTENT_PACK_COLLECTIONS.forEach((collectionName) => {
      asArray(pack?.collections?.[collectionName]).forEach((entry, entryIndex) => {
        const entryId = getContentEntryId(entry);
        if (!entryId) return;

        const claims = index[collectionName].get(entryId) || [];
        index[collectionName].set(entryId, [
          ...claims,
          {
            collectionName,
            entry,
            entryId,
            entryIndex,
            pack,
            packId,
            packIndex,
          },
        ]);
      });
    });
  });

  return index;
}

function buildCollectionIndex(claimsByCollection = {}) {
  return Object.fromEntries(
    CONTENT_PACK_COLLECTIONS.map((collectionName) => [
      collectionName,
      new Map(
        [...(claimsByCollection[collectionName] || new Map()).entries()].map(([entryId, claims]) => [
          entryId,
          [...new Set(claims.map((claim) => claim.packId))],
        ]),
      ),
    ]),
  );
}

function buildCollisionReport(claimsByCollection = {}) {
  const collisions = CONTENT_PACK_COLLECTIONS.flatMap((collectionName) =>
    [...(claimsByCollection[collectionName] || new Map()).entries()]
      .filter(([, claims]) => claims.length > 1)
      .map(([entryId, claims]) => {
        const winner = claims[0];
        const shadowed = claims.slice(1);
        const definitionsEquivalent = new Set(claims.map((claim) => stableSerialize(claim.entry))).size === 1;
        const legacyPackIds = claims.filter((claim) => isLegacyPack(claim.pack)).map((claim) => claim.packId);

        return Object.freeze({
          collection: collectionName,
          entryId,
          mergePolicy: CONTENT_PACK_MERGE_POLICY,
          winnerPackId: winner.packId,
          shadowedPackIds: shadowed.map((claim) => claim.packId),
          sourcePackIds: claims.map((claim) => claim.packId),
          definitionsEquivalent,
          hasLegacyClaim: legacyPackIds.length > 0,
          legacyPackIds,
          resolution: "kept-first-pack-entry",
        });
      }),
  );

  const byCollection = Object.fromEntries(
    CONTENT_PACK_COLLECTIONS.map((collectionName) => [
      collectionName,
      collisions.filter((collision) => collision.collection === collectionName).length,
    ]),
  );

  return Object.freeze({
    reportType: "cruor-content-pack-collision-report",
    schemaVersion: CONTENT_PACK_COLLISION_REPORT_SCHEMA_VERSION,
    mergePolicy: CONTENT_PACK_MERGE_POLICY,
    summary: Object.freeze({
      total: collisions.length,
      equivalent: collisions.filter((collision) => collision.definitionsEquivalent).length,
      divergent: collisions.filter((collision) => !collision.definitionsEquivalent).length,
      withLegacyClaims: collisions.filter((collision) => collision.hasLegacyClaim).length,
      byCollection: Object.freeze(byCollection),
    }),
    collisions: Object.freeze(collisions),
  });
}

function buildLegacyMigrationReport(contentPacks = [], claimsByCollection = {}) {
  const packs = asArray(contentPacks);
  const legacyPacks = packs.filter(isLegacyPack);
  const legacyPackIds = new Set(legacyPacks.map((pack) => pack.id));
  const activeEntries = [];
  const shadowedEntries = [];
  const migratedEntries = [];

  CONTENT_PACK_COLLECTIONS.forEach((collectionName) => {
    [...(claimsByCollection[collectionName] || new Map()).entries()].forEach(([entryId, claims]) => {
      const winner = claims[0];
      const winnerMigration = winner?.entry?.migration || null;
      if (winnerMigration) {
        migratedEntries.push(
          Object.freeze({
            collection: collectionName,
            entryId,
            primaryPackId: winner.packId,
            migrationStatus: winnerMigration.status || "transitional",
            sourceSchema: winnerMigration.sourceSchema || "",
            targetSchema: winnerMigration.targetSchema || "",
            warnings: Object.freeze(asArray(winnerMigration.warnings).map(String)),
          }),
        );
      }

      const legacyClaims = claims.filter((claim) => legacyPackIds.has(claim.packId));
      legacyClaims.forEach((claim) => {
        const migration = claim.entry?.migration || null;
        const record = Object.freeze({
          collection: collectionName,
          entryId,
          legacyPackId: claim.packId,
          primaryPackId: winner?.packId || "",
          status: winner?.packId === claim.packId ? "active-fallback" : "shadowed-by-earlier-pack",
          migrationStatus: migration?.status || "transitional",
          warnings: Object.freeze(asArray(migration?.warnings).map(String)),
        });

        if (winner?.packId === claim.packId) activeEntries.push(record);
        else shadowedEntries.push(record);
      });
    });
  });

  const reviewRequiredEntries = migratedEntries.filter(
    (entry) => entry.warnings.length || entry.migrationStatus === "review-required",
  );
  const packSummaries = legacyPacks.map((pack) => {
    const activeCount = activeEntries.filter((entry) => entry.legacyPackId === pack.id).length;
    const shadowedCount = shadowedEntries.filter((entry) => entry.legacyPackId === pack.id).length;
    const reviewRequiredCount = [...activeEntries, ...shadowedEntries].filter(
      (entry) =>
        entry.legacyPackId === pack.id &&
        (entry.warnings.length || entry.migrationStatus === "review-required"),
    ).length;
    return Object.freeze({
      id: pack.id,
      title: pack.title,
      registryRole: pack.metadata?.registryRole || "",
      activeEntries: activeCount,
      shadowedEntries: shadowedCount,
      reviewRequiredEntries: reviewRequiredCount,
      removable: activeCount === 0 && reviewRequiredCount === 0,
    });
  });

  return Object.freeze({
    reportType: "cruor-legacy-content-migration-report",
    schemaVersion: LEGACY_CONTENT_MIGRATION_REPORT_SCHEMA_VERSION,
    mergePolicy: CONTENT_PACK_MERGE_POLICY,
    summary: Object.freeze({
      legacyPacks: legacyPacks.length,
      activeEntries: activeEntries.length,
      shadowedEntries: shadowedEntries.length,
      migratedEntries: migratedEntries.length,
      reviewRequiredEntries: reviewRequiredEntries.length,
      removablePacks: packSummaries.filter((pack) => pack.removable).length,
      canRemoveAllLegacyPacks: legacyPacks.length > 0 && packSummaries.every((pack) => pack.removable),
    }),
    packs: Object.freeze(packSummaries),
    activeEntries: Object.freeze(activeEntries),
    shadowedEntries: Object.freeze(shadowedEntries),
    migratedEntries: Object.freeze(migratedEntries),
    reviewRequiredEntries: Object.freeze(reviewRequiredEntries),
  });
}

function summarizeProvenance(contentPacks, entryPackIdsByCollection, collisionReport, migrationReport) {
  return {
    packs: contentPacks.length,
    mergePolicy: CONTENT_PACK_MERGE_POLICY,
    collisions: collisionReport.summary.total,
    activeLegacyEntries: migrationReport.summary.activeEntries,
    collections: Object.fromEntries(
      CONTENT_PACK_COLLECTIONS.map((collectionName) => [
        collectionName,
        entryPackIdsByCollection[collectionName]?.size || 0,
      ]),
    ),
  };
}

export function buildContentPackProvenance(contentPacks = []) {
  const packs = asArray(contentPacks);
  const packById = new Map(packs.map((pack) => [pack.id, pack]).filter(([id]) => Boolean(id)));
  const entryClaimsByCollection = buildClaimIndex(packs);
  const entryPackIdsByCollection = buildCollectionIndex(entryClaimsByCollection);
  const collisionReport = buildCollisionReport(entryClaimsByCollection);
  const legacyMigrationReport = buildLegacyMigrationReport(packs, entryClaimsByCollection);

  function getPack(packId) {
    return packById.get(packId) || null;
  }

  function getClaimsForEntry(collectionName, entryOrId) {
    const entryId = getContentEntryId(entryOrId);
    if (!entryId) return [];
    return [...(entryClaimsByCollection[collectionName]?.get(entryId) || [])];
  }

  function getPackIdsForEntry(collectionName, entryOrId) {
    const entryId = getContentEntryId(entryOrId);
    if (!entryId) return [];
    return [...(entryPackIdsByCollection[collectionName]?.get(entryId) || [])];
  }

  function getPacksForEntry(collectionName, entryOrId) {
    return getClaimsForEntry(collectionName, entryOrId)
      .map((claim) => packById.get(claim.packId))
      .filter(Boolean);
  }

  function getPrimaryPackForEntry(collectionName, entryOrId) {
    return getPacksForEntry(collectionName, entryOrId)[0] || null;
  }

  function getPrimaryEntryForEntry(collectionName, entryOrId) {
    return getClaimsForEntry(collectionName, entryOrId)[0]?.entry || null;
  }

  function getPackLabelForEntry(collectionName, entryOrId, fallback = "Static Registry") {
    return getPrimaryPackForEntry(collectionName, entryOrId)?.title || fallback;
  }

  function getCollisionForEntry(collectionName, entryOrId) {
    const entryId = getContentEntryId(entryOrId);
    return collisionReport.collisions.find(
      (collision) => collision.collection === collectionName && collision.entryId === entryId,
    ) || null;
  }

  function getEntryProvenance(collectionName, entryOrId) {
    const entryId = getContentEntryId(entryOrId);
    const claims = getClaimsForEntry(collectionName, entryId);
    if (!entryId || !claims.length) return null;

    const primaryClaim = claims[0];
    const primaryPack = primaryClaim.pack;
    const migration = primaryClaim.entry?.migration || null;

    return Object.freeze({
      schemaVersion: CONTENT_ENTRY_PROVENANCE_SCHEMA_VERSION,
      mergePolicy: CONTENT_PACK_MERGE_POLICY,
      collection: collectionName,
      entryId,
      primaryPackId: primaryPack.id,
      primaryPackTitle: primaryPack.title,
      primaryPackVersion: primaryPack.version,
      registryRole: primaryPack.metadata?.registryRole || "",
      sourcePackIds: Object.freeze(getPackIdsForEntry(collectionName, entryId)),
      shadowedPackIds: Object.freeze(
        getPackIdsForEntry(collectionName, entryId).filter((packId) => packId !== primaryPack.id),
      ),
      hasCollision: claims.length > 1,
      isLegacy: isLegacyPack(primaryPack),
      isLegacyDerived: Boolean(migration),
      migrationStatus: migration?.status || (isLegacyPack(primaryPack) ? "transitional" : "current"),
    });
  }

  return Object.freeze({
    packs,
    packById,
    entryClaimsByCollection,
    entryPackIdsByCollection,
    collisionReport,
    legacyMigrationReport,
    getPack,
    getClaimsForEntry,
    getPackIdsForEntry,
    getPacksForEntry,
    getPrimaryPackForEntry,
    getPrimaryEntryForEntry,
    getPackLabelForEntry,
    getCollisionForEntry,
    getEntryProvenance,
    getCollisionReport: () => collisionReport,
    getLegacyMigrationReport: () => legacyMigrationReport,
    summarize: () => summarizeProvenance(packs, entryPackIdsByCollection, collisionReport, legacyMigrationReport),
  });
}

export function annotateRegistryDataWithContentPackProvenance(registryData = {}, provenance = null) {
  if (!provenance?.getEntryProvenance) return registryData;

  return Object.fromEntries(
    CONTENT_PACK_COLLECTIONS.map((collectionName) => [
      collectionName,
      asArray(registryData[collectionName]).map((entry) => {
        const contentProvenance = provenance.getEntryProvenance(collectionName, entry);
        return contentProvenance ? { ...entry, contentProvenance } : entry;
      }),
    ]),
  );
}
