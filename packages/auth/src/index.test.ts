import {
  createAccessDeniedContext,
  createServiceSubject,
  createUserSubject,
  actorSubjectFromRequest,
  actorSubjectFromSession,
  decodeSessionCookie,
  encodeSessionCookie,
  evaluateAuthorization,
  isAuthBypassEnabled,
  isLocalBypassEnabled,
  isLocalRuntimeProfile,
  redactTokenLikeValues,
  resolveCookieSigningSecret,
  safeReturnUrl,
  safeSessionSummaryFromRequest,
  sessionFromCookieHeader,
  summarizePermissions,
  toSessionSummary,
  SESSION_COOKIE_NAME,
  type AuthSession
} from "./index";

const cookieSecret = "test-cookie-secret";

test("keeps only internal return urls", () => {
  expect(safeReturnUrl("/session?tab=roles")).toBe("/session?tab=roles");
  expect(safeReturnUrl("https://evil.example/session")).toBe("/session");
});

test("redacts token-like values", () => {
  expect(redactTokenLikeValues({ access_token: "secret", displayName: "A", nested: { nonce: "n1" } })).toEqual({
    access_token: "[REDACTED]",
    displayName: "A",
    nested: { nonce: "[REDACTED]" }
  });
});

test("creates browser-safe session summary", () => {
  const session = testSession();

  expect(toSessionSummary(session, "corr-1")).not.toHaveProperty("accessToken");
  expect(toSessionSummary(session, "corr-1")).toMatchObject({
    subjectType: "user",
    permissionSummary: { total: 1, byResource: { "reference-data": ["create"] } }
  });
});

test("decodes valid session cookies and rejects expired sessions", () => {
  const active = testSession({ subjectId: "local.booking.user", expiresAt: "2099-07-01T00:00:00Z" });
  const expired = testSession({ subjectId: "expired.user", expiresAt: "2020-07-01T00:00:00Z" });

  expect(sessionFromCookieHeader(`${SESSION_COOKIE_NAME}=${encodeSessionCookie(active)}`)?.subjectId)
    .toBe("local.booking.user");
  expect(sessionFromCookieHeader(`${SESSION_COOKIE_NAME}=${encodeSessionCookie(expired)}`)).toBeNull();
  expect(sessionFromCookieHeader(`${SESSION_COOKIE_NAME}=not-json`)).toBeNull();
});

test("rejects a session cookie whose payload or signature was tampered", () => {
  const session = testSession({ subjectId: "local.booking.user" });
  const cookie = encodeSessionCookie(session, cookieSecret);
  const [payload, signature] = cookie.split(".");
  const forgedPayload = Buffer.from(JSON.stringify({ ...session, subjectId: "forged.admin" }), "utf8")
    .toString("base64url");
  const forgedSignature = `${signature[0] === "A" ? "B" : "A"}${signature.slice(1)}`;

  expect(decodeSessionCookie(`${forgedPayload}.${signature}`, cookieSecret)).toBeNull();
  expect(decodeSessionCookie(`${payload}.${forgedSignature}`, cookieSecret)).toBeNull();
  expect(decodeSessionCookie(cookie, cookieSecret)?.subjectId).toBe("local.booking.user");
});

test("builds an unauthenticated safe summary without exposing token fields", () => {
  const summary = safeSessionSummaryFromRequest(new Request("http://shell.local/booking"), "corr-shell");

  expect(summary).toEqual({
    isAuthenticated: false,
    subject: "",
    subjectType: "user",
    displayName: "",
    roles: [],
    permissions: [],
    permissionSummary: { total: 0, byResource: {} },
    correlationId: "corr-shell"
  });
  expect(summary).not.toHaveProperty("accessToken");
});

test("extracts only non-blank actor subjects from server-side sessions", () => {
  const session = testSession({ subjectId: "local.booking.user" });
  const request = new Request("http://shell.local/booking", {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${encodeSessionCookie(session)}` }
  });

  expect(actorSubjectFromSession(session)).toBe("local.booking.user");
  expect(actorSubjectFromSession(testSession({ subjectId: "   " }))).toBeNull();
  expect(actorSubjectFromRequest(request)).toBe("local.booking.user");
  expect(actorSubjectFromRequest(new Request("http://shell.local/booking"))).toBeNull();
});

test("allows auth bypass only in local runtime profiles", () => {
  expect(isAuthBypassEnabled({ AUTH_BYPASS: "true", NODE_ENV: "development" })).toBe(true);
  expect(isAuthBypassEnabled({ AUTH_BYPASS: "true", NODE_ENV: "test" })).toBe(true);
  expect(isAuthBypassEnabled({ AUTH_BYPASS: "true", NODE_ENV: "production", APP_ENV: "local" })).toBe(false);
  expect(isAuthBypassEnabled({ AUTH_BYPASS: "true", AUTH_RUNTIME_PROFILE: "local", APP_ENV: "staging" })).toBe(false);
  expect(isAuthBypassEnabled({ AUTH_BYPASS: "true", APP_ENV: "staging" })).toBe(false);
});

test("supports app-specific local bypass flags through shared guard", () => {
  expect(isLocalRuntimeProfile({ APP_ENV: "local" })).toBe(true);
  expect(isLocalBypassEnabled({ REFERENCE_DATA_AUTH_BYPASS: "true", APP_ENV: "local" }, ["REFERENCE_DATA_AUTH_BYPASS"])).toBe(true);
});

test("evaluates user and service subject capabilities", () => {
  const user = createUserSubject({
    subjectId: "u1",
    displayName: "User One",
    capabilities: [{ resource: "reference-data", action: "read" }]
  });
  const service = createServiceSubject({
    subjectId: "svc-reference-data",
    displayName: "Reference Data Service",
    capabilities: [{ resource: "identity-audit", action: "read" }]
  });

  expect(evaluateAuthorization({
    subject: user,
    resource: "reference-data",
    action: "read",
    correlationId: "corr-1"
  })).toMatchObject({ result: "ALLOW", subjectType: "user" });
  expect(evaluateAuthorization({
    subject: service,
    resource: "identity-audit",
    action: "read",
    correlationId: "corr-2"
  })).toMatchObject({ result: "ALLOW", subjectType: "service" });
});

test("creates audit-safe denied context for service subjects", () => {
  const service = createServiceSubject({
    subjectId: "svc-reference-data",
    displayName: "Reference Data Service",
    capabilities: []
  });
  const decision = evaluateAuthorization({
    subject: service,
    resource: "reference-data",
    action: "create",
    correlationId: "corr-3"
  });

  expect(createAccessDeniedContext(decision)).toMatchObject({
    reasonCode: "DENY_NO_PERMISSION",
    requestAccessAllowed: false,
    correlationId: "corr-3"
  });
});

test("summarizes permissions by resource", () => {
  expect(summarizePermissions(["reference-data:read", "reference-data:create", "identity-roles:assign"])).toEqual({
    total: 3,
    byResource: {
      "identity-roles": ["assign"],
      "reference-data": ["create", "read"]
    }
  });
});

test("requires an explicit cookie secret outside local profiles", () => {
  expect(() => resolveCookieSigningSecret({ NODE_ENV: "production" }))
    .toThrow("AUTH_SESSION_SECRET is required");
  expect(resolveCookieSigningSecret({ NODE_ENV: "production", AUTH_SESSION_SECRET: "configured" }))
    .toBe("configured");
});

function testSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    sessionId: "s1",
    subjectId: "u1",
    displayName: "User One",
    roles: ["reference-admin"],
    permissions: ["reference-data:create"],
    issuedAt: "2026-07-01T00:00:00Z",
    expiresAt: "2099-07-01T01:00:00Z",
    policyVersion: "mvp",
    ...overrides
  };
}
