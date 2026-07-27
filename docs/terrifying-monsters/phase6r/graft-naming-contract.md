# Terrifying Monsters — Graft Naming Contract

## Purpose

A Graft name is a navigation and authoring label. It must let a creator understand the concept at a glance. The name is not the place for the full fantasy, tactical explanation, or mechanical procedure; those belong to Fantasy, Tactical Role, Signature, abilities, and routine.

## Rules

For every editorially reviewed Graft:

1. **Attack Patterns use evocative pattern names.** Their published title names the overall combat identity, while the individual abilities retain canonical or descriptive action names.
2. **Body, Mind, Movement, and Horror preserve exact D&D Bestiary feature names** when the Graft remains recognizably based on that feature.
3. Otherwise use one or two familiar English words.
4. Do not introduce hyphens, dash punctuation, stacked adjectives, or literary subtitles.
5. An approved signature name may use a third word when shortening it would make the concept less recognizable.
6. Do not repeat the technical Type, such as `Attack Pattern` or `Trait Bundle`.
7. Keep the internal ID stable when changing the published name.
8. Do not rename canonical actions inside an Attack Pattern merely because the parent Pattern uses an evocative title.

## Attack Pattern convention

The parent Graft and its abilities serve different purposes:

```text
Acid Brute
├── Heavy Slam
└── Acid Vomit
```

`Acid Brute` communicates the monster's overall offensive identity in the Composer. `Heavy Slam` and `Acid Vomit` remain the names printed in the stat block.

Approved Attack Pattern titles:

- Crusher;
- Juggernaut;
- Acid Brute;
- Grappler;
- Grave Eater;
- Plague Eater;
- Rot Eater;
- Corpse Binder;
- Venom Hunter;
- Impaler;
- Web Hunter;
- Shadow Weaver;
- Venom Spitter;
- Broodmaker;
- Cold Touch.

## Canonical names verified against Bestiary.csv

The following exact feature names remain preserved for Body and Movement Graft:

- Cunning Action;
- Ethereal Sight;
- Incorporeal Movement;
- Spider Climb;
- Vanish;
- Web Walker;
- Stench;
- Wail.

`Stumbling Mass` is also preserved at the user's editorial direction, even though that exact string is not present in the supplied Bestiary.csv.

## Examples

| Context | Avoid | Prefer | Reason |
|---|---|---|---|
| Attack Pattern | Heavy Slam | Crusher | The parent title describes the complete offensive pattern |
| Attack Pattern | Acid Vomit | Acid Brute | The pattern contains both Heavy Slam and Acid Vomit |
| Movement | Cunning Hunt | Cunning Action | Exact, immediately recognized Bestiary feature |
| Movement | Ghost Passage | Incorporeal Movement | Exact Bestiary trait name |
| Body | Clinging Body | Spider Climb | Exact Bestiary trait name |
| Body | Web Sense | Web Walker | Exact Bestiary trait name |
| Horror | Decay Aura | Stench | Exact Bestiary feature name |
| Horror | Mourning Chorus | Wail | Exact Bestiary feature name |

## Scope

The automated gate currently covers Attack, Body, Mind, Movement, and Horror. Each later editorial slot must be added to the reviewed-slot list when its names have been approved.
