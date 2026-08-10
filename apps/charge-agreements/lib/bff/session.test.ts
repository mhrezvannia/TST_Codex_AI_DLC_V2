import type { AuthSession } from "@erp/auth";
import {
  authenticatedSubjectFromSession,
  hasCapability,
  sessionCorrelation
} from "./session";

const session: AuthSession = {
  sessionId: "s1",
  subjectId: "charge-user",
  subjectType: "user",
  displayName: "Charge User",
  roles: [],
  permissions: ["charge-agreements:read", "charge-manual-cases:read"],
  issuedAt: "2026-07-01T00:00:00Z",
  expiresAt: "2099-07-01T00:00:00Z",
  policyVersion: "v1"
};

describe("signed Charge session projection", () => {
  it("projects immutable exact capabilities", () => {
    const subject = authenticatedSubjectFromSession(session)!;
    expect(hasCapability(subject, { resource: "charge-agreements", action: "read" })).toBe(true);
    expect(Object.isFrozen(subject.capabilities)).toBe(true);
  });

  it("does not imply manual access from agreement read", () => {
    const subject = authenticatedSubjectFromSession({
      ...session, permissions: ["charge-agreements:read"]
    })!;
    expect(hasCapability(subject, { resource: "charge-manual-cases", action: "read" })).toBe(false);
  });

  it("rejects missing and non-user subjects", () => {
    expect(authenticatedSubjectFromSession(null)).toBeNull();
    expect(authenticatedSubjectFromSession({ ...session, subjectType: "service" })).toBeNull();
  });

  it("echoes only bounded safe correlation identifiers", () => {
    expect(sessionCorrelation("browser:corr-1")).toBe("browser:corr-1");
    expect(sessionCorrelation("bad\nvalue")).not.toBe("bad\nvalue");
  });
});
