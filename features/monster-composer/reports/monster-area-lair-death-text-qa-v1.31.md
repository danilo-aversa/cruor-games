# Monster Composer — Area / Lair / Death Text QA v1.31

## Goal

Prevent area, lair, and death-effect grafts from rendering vague or unusable area wording such as `creatures in the Radius`, `creatures in a Radius`, or `the area size`.

## Changes

- Corrected legacy-converted area metadata with missing `areaEffect.size` values.
- Disabled false-positive inferred area effects for grafts that are lair-wide or surface-based rather than fixed-radius effects.
- Added explicit targeting text where the old mechanics used an object, corpse, surface, or point within range.
- Made the rendered stat block parser treat missing concrete area geometry as a publish-blocking error for modeled area effects.
- Added a smoke test for high-risk area/lair/death grafts.

## Corrected Grafts

- `pressure-agony`
- `corpse-bloom-death`
- `purge-fluid-flood`
- `choking-air`
- `corpse-pressure-room`
- `funeral-silence-lair`
- `graveyard-offerings-lair`
- `sticky-surroundings`
- `broodmother-web-lair`
- `dense-web-region`

## Parser Gate

The parser now errors when a modeled `areaEffect` has no concrete model size or renders without concrete text such as `10-foot Radius`, `20-foot Cube`, or `within 5 feet`.

## Expected QA Outcome

- No `Radius` without numeric size.
- No `area size` placeholders.
- No `area-effect-missing-size` blockers in valid area/lair/death text.
- Publish gate blocks any future modeled area effect that lacks concrete geometry.
