# Map Generator Data Contract

## Normalized Map Request

The map generator should consume this kind of object:

```js
{
  id: string,
  seed: string | number,

  locationType: string,
  environment: string,
  mood: string[],

  size: "small" | "medium" | "large",
  roomCount: number,

  structure: {
    geometry: "organic" | "geometric" | "mixed",
    density: "sparse" | "normal" | "dense",
    linearity: "linear" | "branching" | "looping",
    verticality: "flat" | "some" | "high",
    symmetry: "low" | "medium" | "high"
  },

  requiredAreas: [
    {
      id: string,
      name: string,
      type: string,
      importance: "minor" | "standard" | "major",
      tags: string[]
    }
  ],

  hazards: string[],
  secrets: string[],
  landmarks: string[],

  output: {
    labels: boolean,
    grid: boolean,
    style: string
  }
}
```

## Rule

Darken a Location may have richer narrative data, but the map generator should only receive normalized structural data.

---

## 9. `docs/features/map-generator/REFERENCES.md`

Questo file deve indicare le reference senza incollarle dentro le istruzioni.

# Map Generator References

## External References Stored in Project

Reference files may exist for studying generation techniques and visual goals.

They are not production dependencies unless explicitly integrated.

Important references:

- Watabou One Page Dungeon Generator reference
- Watabou One Page Cave Generator reference
- Dungeon Scrawl reference

## Usage Rules

- Do not copy large blocks directly from reference files.
- Use references to understand algorithms, visual conventions, and useful rendering techniques.
- Reimplement only the necessary ideas in Cruor's architecture.
- Keep Cruor function names simple and project-specific.

## Semantic Room Shape Contract

A normalized required area may carry `roomDesign.shape.kind`. Supported authored kinds are defined only in `shared/content/contracts/room-shapes.js`; the generator must preserve that identity instead of converting it to a similar legacy footprint.

The current engine provides dedicated masks for all registered kinds, including `square`, `gallery`, `t-shape`, `cross`, `niche`, and `irregular`. Shape-specific modifier support is evaluated before assignment. Unknown shapes or unsupported shape/modifier combinations must produce an explicit `unsupported` resolution rather than silently falling back to `rect`, `hall`, `notched`, `alcove`, or `cave`.

An inferred room archetype may still provide detail behavior, but it may not replace an explicit semantic shape mask. Archetype mask substitution is allowed only when the effective room design explicitly supplies a `maskProfile`.
