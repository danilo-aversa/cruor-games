# v1.35 — Legacy Stats Migration

## Goal

Move Monster Composer balance reads away from direct `feature.stats` access and into a metadata adapter that can accept both the current legacy shape and future structured balance metadata.

This version does **not** change monster math. It preserves DPR, CR, HP, fitting, frame power, graft selection, and publish gate thresholds.

## New metadata adapter

Added `features/monster-composer/model/monster-graft-balance-profile.js`.

The adapter exposes:

- `getMonsterGraftBalanceProfile(feature)`
- `getFeatureBalanceStats(feature)`
- `getFeatureBalanceStat(feature, key)`
- `getFeatureBalanceEntries(feature)`
- `sumFeatureBalanceStats(features)`
- `buildLegacyStatsMigrationAudit(features)`

The current catalog still uses legacy `feature.stats`, so every value is read through the adapter with source `legacyStats`. Future components can provide `balanceProfile` / `balance` without changing the Composer math pipeline.

## Migrated consumers

Direct `feature.stats` reads were replaced in the critical consumers:

- main Monster Composer computed stat aggregation;
- ability score inference;
- Navigator sorting/fairness tie-breaks;
- frame fit scoring;
- compatibility scoring and impact previews;
- pressure and counterplay scoring;
- rules-schema damage inference;
- D&D 2024 rules engine ability inference;
- QA frame builders;
- structured export feature catalog.

## Output-text classification

`mechanics`, `tableText`, and `counterplay` remain legacy authoring/debug fields. v1.35 adds structured migration metadata in exported feature records so these can be audited separately from final stat-block text.

Table-facing run mode now uses normalized/export text where possible instead of raw legacy mechanics for default action and trigger summaries.

## Export metadata

The export migration stage is now:

`rules-v1.15-legacy-stats-adapter`

Structured feature catalog entries now include:

- normalized `stats` from the adapter;
- `balanceProfile` with source information;
- `migration.legacyStatsSource`;
- `migration.legacyTextFields`;
- catalog-level `legacyStatsMigration` audit.

## Verification

Targeted checks performed:

- `node --check` on modified JS modules;
- `monster-graft-balance-profile-smoke.test.js`;
- Monster Per-Graft Coverage QA smoke: 0 issues.

Expected manual QA after extraction:

1. Run **Studio Tests > Monster Per-Graft QA**.
2. Run **Batch QA Realistic 200**.
3. Confirm no parser failures, publish blockers, or CR regressions.
