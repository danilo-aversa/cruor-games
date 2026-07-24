import { describe, expect, it } from "vitest";
import { authenticateCredentials } from "./auth.adapter.js";
import {
  canAccessContentStudio,
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
  it("derives Studio and Debug access from normalized entitlements", async () => {
    const { session } = await authenticateCredentials({
      username: "admin",
      password: "admin",
    });

    expect(isAuthenticated(session)).toBe(true);
    expect(canAccessContentStudio(session)).toBe(true);
    expect(canUseDebugMode(session)).toBe(true);
  });

  it("rejects incomplete or anonymous sessions", () => {
    expect(isAuthenticated(null)).toBe(false);
    expect(canAccessContentStudio(null)).toBe(false);
    expect(canUseDebugMode({ user: { role: "admin" } })).toBe(false);
  });
});

describe("auth return routes", () => {
  it("allows only the known internal Studio return path", () => {
    expect(normalizeAuthReturnPath("/inspiration-studio")).toBe(
      "/inspiration-studio",
    );
    expect(normalizeAuthReturnPath("//example.com/attack")).toBe("");
    expect(normalizeAuthReturnPath("https://example.com")).toBe("");
  });

  it("builds an encoded login return path", () => {
    expect(buildLoginPath("/inspiration-studio")).toBe(
      "/login?returnTo=%2Finspiration-studio",
    );
  });
});
