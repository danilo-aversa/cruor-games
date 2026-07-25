import { describe, expect, it } from "vitest";
import {
  MONSTER_GRAFT_SOURCE_AUTHORITY,
  MONSTER_GRAFT_SOURCE_AUTHORITY_MODES,
  getMonsterGraftSourceAuthority,
  isCanonicalRegistryMonsterGraft,
  resolveMonsterGraftCatalogue,
  selectMonsterGraftRepresentation,
} from "./monster-graft-source-authority.js";

const nativeGraft = Object.freeze({
  id: "heavy-slam",
  title: "Heavy Slam",
  source: "decomposition",
  sourceAnchors: ["decomposition"],
  slot: "attack",
  mechanics: "Native mechanics.",
  i18n: { it: { title: "Schianto Pesante" } },
  contentPack: { id: "core-cruor" },
});

const generatedRegistryGraft = Object.freeze({
  ...nativeGraft,
  mechanics: "Registry shadow mechanics.",
  authoring: {
    origin: "native-adapter",
    canonical: false,
  },
  contentPack: { id: "decomposition-pack" },
  registry: { componentId: "heavy-slam" },
});

const canonicalRegistryGraft = Object.freeze({
  ...generatedRegistryGraft,
  schemaVersion: "monster-graft-v2.0",
  kind: "attackPattern",
  abilities: [{ id: "slam", title: "Slam" }],
  routine: { mode: "authored", defaultSequence: ["slam"] },
  authoring: {
    origin: "inspiration-module",
    canonical: true,
    migrationStatus: "canonical",
  },
});

describe("monster graft source authority", () => {
  it("keeps every current production source native-authoritative in phase 1", () => {
    expect(
      Object.values(MONSTER_GRAFT_SOURCE_AUTHORITY).every(
        (entry) =>
          entry.mode ===
          MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.NATIVE_LEGACY,
      ),
    ).toBe(true);
  });

  it("defaults unknown sources to native authority", () => {
    expect(getMonsterGraftSourceAuthority("future-source").mode).toBe(
      MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.NATIVE_LEGACY,
    );
  });

  it("recognizes only explicitly canonical registry grafts", () => {
    expect(isCanonicalRegistryMonsterGraft(generatedRegistryGraft)).toBe(false);
    expect(isCanonicalRegistryMonsterGraft(canonicalRegistryGraft)).toBe(true);
  });

  it("preserves current native behavior while retaining registry provenance", () => {
    const result = selectMonsterGraftRepresentation({
      nativeGraft,
      registryGraft: generatedRegistryGraft,
    });

    expect(result.graft.mechanics).toBe("Native mechanics.");
    expect(result.graft.contentPack.id).toBe("decomposition-pack");
    expect(result.graft.registry.componentId).toBe("heavy-slam");
    expect(result.audit.selectedOrigin).toBe("native");
    expect(result.audit.fallbackUsed).toBe(false);
  });

  it("selects a canonical Graft v2 only after a source authority cutover", () => {
    const result = selectMonsterGraftRepresentation({
      nativeGraft,
      registryGraft: canonicalRegistryGraft,
      authority: {
        sourceId: "decomposition",
        mode: MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.REGISTRY_CANONICAL,
        allowNativeFallback: true,
      },
    });

    expect(result.graft.schemaVersion).toBe("monster-graft-v2.0");
    expect(result.graft.kind).toBe("attackPattern");
    expect(result.graft.mechanics).toBe("Registry shadow mechanics.");
    expect(result.audit.selectedOrigin).toBe("registry");
    expect(result.audit.fallbackUsed).toBe(false);
  });

  it("falls back safely when a source is switched before its registry graft is canonical", () => {
    const result = selectMonsterGraftRepresentation({
      nativeGraft,
      registryGraft: generatedRegistryGraft,
      authority: {
        sourceId: "decomposition",
        mode: MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.REGISTRY_CANONICAL,
        allowNativeFallback: true,
      },
    });

    expect(result.graft.mechanics).toBe("Native mechanics.");
    expect(result.audit.selectedOrigin).toBe("native");
    expect(result.audit.fallbackUsed).toBe(true);
    expect(result.audit.fallbackReason).toBe(
      "registry-entry-is-not-canonical",
    );
  });

  it("resolves one deterministic catalogue row per graft id", () => {
    const result = resolveMonsterGraftCatalogue({
      nativeGrafts: [nativeGraft],
      registryGrafts: [generatedRegistryGraft],
    });

    expect(result.grafts).toHaveLength(1);
    expect(result.grafts[0].id).toBe("heavy-slam");
    expect(result.audit.totalGrafts).toBe(1);
    expect(result.audit.selectedNative).toBe(1);
  });

  it("reports a Source Anchor mismatch without letting registry metadata reroute native authority", () => {
    const result = selectMonsterGraftRepresentation({
      nativeGraft,
      registryGraft: {
        ...generatedRegistryGraft,
        source: "wolf-spiders",
        sourceAnchors: ["wolf-spiders"],
      },
    });

    expect(result.audit.sourceId).toBe("decomposition");
    expect(result.audit.sourceMismatch).toBe(true);
    expect(result.audit.nativeSourceId).toBe("decomposition");
    expect(result.audit.registrySourceId).toBe("wolf-spiders");
    expect(result.audit.selectedOrigin).toBe("native");
  });

  it("handles native-only and registry-only compatibility entries", () => {
    const nativeOnly = { ...nativeGraft, id: "native-only" };
    const registryOnly = {
      ...generatedRegistryGraft,
      id: "registry-only",
    };
    const result = resolveMonsterGraftCatalogue({
      nativeGrafts: [nativeOnly],
      registryGrafts: [registryOnly],
    });

    expect(result.grafts.map((graft) => graft.id)).toEqual([
      "registry-only",
      "native-only",
    ]);
    expect(result.audit.nativeOnly).toBe(1);
    expect(result.audit.registryOnly).toBe(1);
    expect(result.audit.fallbacks).toBe(1);
  });
});
