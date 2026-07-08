import {
  isAuthBypassEnabled,
  isLocalBypassEnabled,
  isLocalRuntimeProfile,
  redactTokenLikeValues,
  safeReturnUrl,
  toSessionSummary,
  type AuthSession
} from "./index";

test("keeps only internal return urls", () => {
  expect(safeReturnUrl("/session?tab=roles")).toBe("/session?tab=roles");
  expect(safeReturnUrl("https://evil.example/session")).toBe("/session");
});

test("redacts token-like values", () => {
  expect(redactTokenLikeValues({ access_token: "secret", displayName: "A" })).toEqual({
    access_token: "[REDACTED]",
    displayName: "A"
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
});

test("allows auth bypass only in local runtime profiles", () => {
  expect(isAuthBypassEnabled({ AUTH_BYPASS: "true", NODE_ENV: "development" })).toBe(true);
  expect(isAuthBypassEnabled({ AUTH_BYPASS: "true", NODE_ENV: "test" })).toBe(true);
  expect(isAuthBypassEnabled({ AUTH_BYPASS: "true", NODE_ENV: "production", APP_ENV: "local" })).toBe(false);
  expect(isAuthBypassEnabled({ AUTH_BYPASS: "true", APP_ENV: "staging" })).toBe(false);
});

test("supports app-specific local bypass flags through shared guard", () => {
  expect(isLocalRuntimeProfile({ APP_ENV: "local" })).toBe(true);
  expect(isLocalBypassEnabled({ REFERENCE_DATA_AUTH_BYPASS: "true", APP_ENV: "local" }, ["REFERENCE_DATA_AUTH_BYPASS"])).toBe(true);
});
