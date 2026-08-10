import { describe, expect, it } from "vitest";
import { SESSION_COOKIE_NAME, encodeSessionCookie, type AuthSession } from "@erp/auth";
import { authSignInPath, requireShellSession } from "./shell-auth";

describe("shell session guard", () => {
  it("redirects unauthenticated protected routes to the existing auth app", () => {
    expect(requireShellSession(null, "/booking", "corr-1")).toEqual({
      ok: false,
      redirectTo: "/auth/api/auth/sign-in?returnUrl=%2Fbooking"
    });
  });

  it("normalizes unsafe return URLs before redirecting", () => {
    expect(authSignInPath("https://attacker.example/booking")).toBe("/auth/api/auth/sign-in?returnUrl=%2F");
  });

  it("returns a safe summary and actor for valid sessions", () => {
    const result = requireShellSession(`${SESSION_COOKIE_NAME}=${encodeSessionCookie(testSession())}`, "/", "corr-2");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.actorSubjectId).toBe("local.booking.user");
      expect(result.summary).toMatchObject({
        isAuthenticated: true,
        subject: "local.booking.user",
        displayName: "Booking User",
        correlationId: "corr-2"
      });
      expect(result.summary).not.toHaveProperty("accessToken");
    }
  });

  it("fails closed when a cookie cannot produce an actor", () => {
    const blankActor = testSession({ subjectId: "   " });

    expect(requireShellSession(`${SESSION_COOKIE_NAME}=${encodeSessionCookie(blankActor)}`, "/booking", "corr-3"))
      .toEqual({ ok: false, redirectTo: "/auth/api/auth/sign-in?returnUrl=%2Fbooking" });
  });

  it("redirects expired sessions before protected shell routes render", () => {
    const expired = testSession({ expiresAt: "2026-07-01T00:00:00Z" });

    expect(requireShellSession(`${SESSION_COOKIE_NAME}=${encodeSessionCookie(expired)}`, "/", "corr-4"))
      .toEqual({ ok: false, redirectTo: "/auth/api/auth/sign-in?returnUrl=%2F" });
    expect(requireShellSession(`${SESSION_COOKIE_NAME}=${encodeSessionCookie(expired)}`, "/booking", "corr-5"))
      .toEqual({ ok: false, redirectTo: "/auth/api/auth/sign-in?returnUrl=%2Fbooking" });
  });
});

function testSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    sessionId: "s1",
    subjectId: "local.booking.user",
    displayName: "Booking User",
    roles: ["booking-desk"],
    permissions: ["booking:read"],
    issuedAt: "2026-07-01T00:00:00Z",
    expiresAt: "2099-07-01T00:00:00Z",
    policyVersion: "mvp",
    ...overrides
  };
}
