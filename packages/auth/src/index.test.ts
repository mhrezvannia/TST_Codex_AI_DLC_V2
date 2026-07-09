import {
  createAccessDeniedContext,
  createServiceSubject,
  createUserSubject,
  evaluateAuthorization,
  isAuthBypassEnabled,
  isLocalBypassEnabled,
  isLocalRuntimeProfile,
  redactTokenLikeValues,
  safeReturnUrl,
  summarizePermissions,
  toSessionSummary,
  type AuthSession
} from "./index";

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
  const session: AuthSession = {
    sessionId: "s1",
    subjectId: "u1",
    displayName: "User One",
    roles: ["reference-admin"],
    permissions: ["reference-data:create"],
    issuedAt: "2026-07-01T00:00:00Z",
    expiresAt: "2026-07-01T01:00:00Z",
    policyVersion: "mvp"
  };

  expect(toSessionSummary(session, "corr-1")).not.toHaveProperty("accessToken");
  expect(toSessionSummary(session, "corr-1")).toMatchObject({
    subjectType: "user",
    permissionSummary: { total: 1, byResource: { "reference-data": ["create"] } }
  });
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
