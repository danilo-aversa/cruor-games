# Terrifying Monsters — Weakness Graft Editorial Contract

## Purpose

A Weakness is not a generic numerical penalty and not merely a clue. It is a player-facing exploit procedure that turns an observable monster flaw into a concrete tactical answer.

## Required structure

Every published Weakness must provide:

1. **Telegraph.** The table can perceive the flaw before or while it matters.
2. **Access procedure.** The players know what positioning, damage type, control state, object interaction, ritual, or sequencing exposes it.
3. **Bounded payoff.** The exploit produces a specific result such as Advantage, a Critical Hit, a condition, reaction suppression, movement denial, or interruption.
4. **Window or recovery.** Repeatable control has an explicit duration, immunity period, resource requirement, or setup cost.
5. **Independent execution.** The Weakness cannot require another optional Graft unless that dependency is encoded as an explicit compatibility contract.
6. **Structured parity.** Trigger, resolution, effects, public text, and compiled renderer output describe the same procedure.

## Prohibited legacy patterns

The Phase 6R review removes:

- arbitrary attack penalties for called shots;
- damage thresholds based on an implausibly large fraction of maximum Hit Points;
- undefined ability or balance checks;
- vague requirements such as a “large enough” fire;
- permanent maiming without bounded recovery rules;
- references to abilities the monster may not possess;
- telegraphs that do not create an actual exploit;
- hidden random triggers that the players cannot intentionally pursue.

## Naming

Use a familiar D&D title when the rule is recognizably canonical, such as **Sunlight Weakness** or **Fear of Fire**. Use a concise anatomical or procedural title when the rule is source-specific, such as **Brood Sac**, **Exposed Skull**, or **Softened Wax**.

## CR progression

Weaknesses are static by default. Add CR bands only when a fixed threshold or payoff would become irrelevant or excessive across tiers. Scaling must not remove the player answer or add untelegraphed complexity.

Approved scaled IDs:

- `mechanical-stress`;
- `dangerous-hunger`;
- `underbelly-weak-spot`.

## Compatibility

All thirteen legacy IDs remain stable. Presets, source packs, saved drafts, and Content Studio records therefore continue to resolve while receiving the reviewed Graft V2 implementation.
