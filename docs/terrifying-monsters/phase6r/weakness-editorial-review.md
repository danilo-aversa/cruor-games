# Terrifying Monsters — Weakness Graft Editorial Review

## Executive decision

The thirteen Weakness Grafts were mechanically migrated in Phase 6 but were not publishable as a family. Several relied on arbitrary called-shot penalties, unreachable damage thresholds, undefined checks, cross-graft dependencies, or descriptive tells without a usable exploit.

The Phase 6R review preserves every stable ID while replacing each legacy implementation with a bounded, telegraphed player procedure.

## Decisions

| Stable ID | Published title | Source | Decision |
|---|---|---|---|
| `head-weak-spot` | Exposed Skull | Decomposition | Rewrite as control-to-critical setup |
| `mechanical-stress` | Dismemberment | Decomposition | Rewrite and scale Bloodied slashing threshold |
| `radiant-preservation-failure` | Radiant Disruption | Decomposition | Rewrite as a bounded suppression window |
| `daytime-weakness` | Sunlight Weakness | Jikininki | Use canonical title and rule |
| `shameful-feeding` | Shame | Jikininki | Turn witness recognition into a reaction answer |
| `dangerous-hunger` | Consecrated Bait | Jikininki | Replace hidden hunger failure with prepared bait |
| `salt-and-names` | Salt and True Names | Jikininki | Formalize the ritual boundary procedure |
| `thin-legs` | Unsteady Legs | Wolf Spiders | Replace undefined balance checks with forced-movement and terrain triggers |
| `fear-of-fire` | Fear of Fire | Wolf Spiders | Keep canonical identity; use any Fire damage as the trigger |
| `underbelly-weak-spot` | Exposed Underbelly | Wolf Spiders | Replace called shot with a visible transition window and scale payoff |
| `eyes-weak-spot` | Eye Cluster | Wolf Spiders | Replace attack penalty with a damage-for-Blinded tradeoff |
| `brood-tell` | Brood Sac | Wolf Spiders | Replace a pure telegraph with a destroyable encounter object |
| `fire-softens-it` | Softened Wax | Wax Death Masks | Create a two-step Fire and follow-up attack window |

## Source identity

### Decomposition

The weaknesses expose structural failure in a corpse that is no longer mechanically coherent: loose skull, failing limbs, and preservation disrupted by radiant energy.

### Jikininki

The weaknesses are ritual and social rather than anatomical: sunlight, witnessed shame, consecrated food, salt, and true names give the players intentional non-damage answers.

### Wolf Spiders

The weaknesses reward movement control and precision against visible anatomy: unstable legs, fire aversion, underbelly transitions, clustered eyes, and the brood sac.

### Wax Death Masks

Softened Wax creates an explicit combo: Fire opens the mask, and the next hit tears it before it hardens.

## Scaling decisions

Only three Weaknesses scale:

- **Dismemberment:** the qualifying slashing-damage threshold rises by tier;
- **Consecrated Bait:** the radiant backlash rises by tier;
- **Exposed Underbelly:** the first-hit bonus damage rises by tier.

All other Weaknesses remain static because their value comes from action economy, positioning, information, or temporary control rather than raw damage.

## Catalog impact

- stable Weakness IDs retained: 13/13;
- reviewed Weakness Grafts: 13;
- authored Weakness abilities: 13;
- CR-scaled Weakness Grafts: 3;
- new catalog entries: 0;
- removed IDs: 0.
