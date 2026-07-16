import { describe, expect, it } from "vitest";

import {
  createLocationCompilerKey,
  hashLocationCompilerKey,
  rankLocationCompilerChoices,
  scoreLocationCompilerChoice,
} from "./location-compiler-rng.js";

describe("location compiler deterministic ranking", () => {
  it("uses stable FNV-1a keys without clock or global randomness", () => {
    expect(hashLocationCompilerKey("")).toBe(2166136261);
    expect(createLocationCompilerKey("seed", "room-a", 2, "fragment-a")).toBe(
      "seed:room-a:2:fragment-a",
    );
    expect(scoreLocationCompilerChoice("seed", "scope", "room-a")).toBe(
      scoreLocationCompilerChoice("seed", "scope", "room-a"),
    );
    expect(scoreLocationCompilerChoice("seed", "scope", "room-a")).not.toBe(
      scoreLocationCompilerChoice("seed", "other-scope", "room-a"),
    );
  });

  it("ranks equal inputs identically without mutating the source array", () => {
    const choices = [{ id: "gamma" }, { id: "alpha" }, { id: "beta" }];
    const before = JSON.stringify(choices);
    const options = {
      seed: "phase4-ranking-seed",
      scope: "sensory-pool",
      getId: (choice) => choice.id,
    };

    expect(rankLocationCompilerChoices(choices, options)).toEqual(
      rankLocationCompilerChoices([...choices].reverse(), options),
    );
    expect(JSON.stringify(choices)).toBe(before);
  });
});
