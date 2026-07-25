import { describe, expect, it } from "vitest";
import { authenticateCredentials } from "./auth.adapter.js";
import {
  canAccessContentStudio,
  canAccessCreatorStudio,
  canUseDebugMode,
  isAuthenticated,
} from "./auth.policy.js";
import { buildLoginPath, normalizeAuthReturnPath } from "./auth.routes.js";

describe("prototype auth adapter", () => {
  it("accepts only the prototype admin credentials", async () => {
    const rejected = await authenticateCredentials({
      username: "admin",
      password: "wrong",
    });
    const accepted = await authenticateCredentials({
      username: "admin",
      password: "admin",
    });

    expect(rejected).toEqual({
      ok: false,
      errorCode: "invalid-credentials",
    });
    expect(accepted.ok).toBe(true);
    expect(accepted.session.user.role).toBe("admin");
  });
});

describe("auth policies", () => {
  it("derives Creator Studio, Content Studio, and Debug access from entitlements", async () => {
    const { session } = await authenticateCredentials({
      username: "admin",
      password: "admin",
    });

    expect(isAuthenticated(session)).toBe(true);
    expect(canAccessCreatorStudio(session)).toBe(true);
    expect(canAccessContentStudio(session)).toBe(true);
    expect(canUseDebugMode(session)).toBe(true);
  });

  it("rejects incomplete or anonymous sessions", () => {
    expect(isAuthenticated(null)).toBe(false);
    expect(canAccessCreatorStudio(null)).toBe(false);
    expect(canAccessContentStudio(null)).toBe(false);
    expect(canUseDebugMode({ user: { role: "admin" } })).toBe(false);
  });

  it("keeps existing Content Studio sessions compatible with the Creator shell", () => {
    const legacySession = {
      schemaVersion: 1,
      provider: "prototype",
      user: { id: "legacy-admin", username: "admin", role: "admin" },
      entitlements: ["content-studio"],
    };

    expect(canAccessCreatorStudio(legacySession)).toBe(true);
    expect(canAccessContentStudio(legacySession)).toBe(true);
  });
});

describe("auth return routes", () => {
  it("allows only the protected Creator Studio routes", () => {
    expect(normalizeAuthReturnPath("/creator-studio")).toBe(
      "/creator-studio",
    );
    expect(normalizeAuthReturnPath("/creator-studio/content")).toBe(
      "/creator-studio/content",
    );
    expect(normalizeAuthReturnPath("/creator-studio/operations")).toBe(
      "/creator-studio/operations",
    );
    expect(normalizeAuthReturnPath("/creator-studio/publishing")).toBe(
      "/creator-studio/publishing",
    );
    expect(normalizeAuthReturnPath("/inspiration-studio")).toBe(
      "/creator-studio/content",
    );
    expect(normalizeAuthReturnPath("//example.com/attack")).toBe("");
    expect(normalizeAuthReturnPath("https://example.com")).toBe("");
  });

  it("builds an encoded login return path", () => {
    expect(buildLoginPath("/creator-studio/content")).toBe(
      "/login?returnTo=%2Fcreator-studio%2Fcontent",
    );
    expect(buildLoginPath("/creator-studio/operations")).toBe(
      "/login?returnTo=%2Fcreator-studio%2Foperations",
    );
    expect(buildLoginPath("/creator-studio/publishing")).toBe(
      "/login?returnTo=%2Fcreator-studio%2Fpublishing",
    );
  });
});
