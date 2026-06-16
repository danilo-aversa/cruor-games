# Monster Frame/Tier Power Normalization v1.22

## Goal

Normalize Monster Composer frame power so `role`, `monsterTier`, `tacticalRole`, `danger`, and `tempoProfile` do not stack as independent full multipliers.

The previous pipeline applied the tier baseline and then multiplied it again by role/tactical/danger/tempo values. This caused combinations such as `boss + legendary`, `boss + setpiece`, and `horror + ambusher + boss` to overshoot target CR by very large margins.

## Main Change

Added:

```text
features/monster-composer/model/monster-frame-power.js
```

This module exports a single normalized frame profile:

```text
buildMonsterFramePowerProfile()
```

The profile returns:

```text
baselineTierId
hpMult
dprMult
acMod
attackMod
dcMod
budget
complexityCap
pressureMod
diagnostics
```

The pipeline now uses a normal CR baseline and applies a capped normalized frame profile on top of it.

## Updated Runtime Paths

Updated:

```text
features/monster-composer/monster-composer.page.jsx
features/monster-composer/qa/monster-frame-builders.js
features/monster-composer/qa/monster-batch-qa.js
```

The Composer and Studio QA now use the same `framePowerProfile`, so manual generation and batch tests evaluate the same math.

## Behavior

High-power axes are dampened instead of multiplied freely.

Examples:

```text
boss + legendary
boss + setpiece
boss + boss tier
low-CR legendary/setpiece
horror + ambusher + boss
```

These profiles now receive capped HP/DPR/budget values and produce diagnostic warnings such as:

```text
frame-power-stack/high-tier-boss
frame-power-stack/low-cr-high-tier
frame-power-stack/capped-hp-multiplier
frame-power-stack/capped-dpr-multiplier
frame-power-stack/capped-budget
```

## QA Changes

Realistic QA now avoids the most abusive low-CR high-tier combinations when choosing random frames.

Stress QA still allows those combinations so content coverage can be tested deliberately.

Generated monster summaries now include:

```text
framePowerHpMult
framePowerDprMult
framePowerBudget
framePowerDiagnostics
```

The Markdown report also shows frame power values for outliers.

## Expected Result

The next 100-monster Realistic QA batch should show:

```text
lower average CR delta
fewer CR +4 outliers
lower HP ratio for boss/high-tier frames
frame-power diagnostics instead of silent multiplier explosions
```

This does not yet implement closed-loop CR fitting. It only prevents the largest systematic power-stack inflation before final CR validation.

## Verification

Performed syntax checks:

```text
node --check on all .js files in features/monster-composer
node --check on all .js files in features/inspiration-studio
```

A full Vite build was not run because this source zip does not include installed dependencies.
