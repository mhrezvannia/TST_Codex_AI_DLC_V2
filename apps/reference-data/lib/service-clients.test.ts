import { afterEach, describe, expect, test, vi } from "vitest";
import { encodeSessionCookie, SESSION_COOKIE_NAME, type AuthSession } from "@erp/auth";
import {
  correlationIdFrom,
  isLocalAuthBypassEnabled,
  mutationCommand,
  normalizeReferenceRecord,
  resolveReferenceDataPermissions
} from "./service-clients";

describe("service clients", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.AUTH_BYPASS;
    delete process.env.APP_ENV;
    delete process.env.REFERENCE_DATA_AUTH_BYPASS;
  });

  test("enables auth bypass only for non-production local development", () => {
    process.env.AUTH_BYPASS = "true";
    process.env.APP_ENV = "local";
    expect(isLocalAuthBypassEnabled()).toBe(true);
  });

  test("returns write permissions when local auth bypass is enabled", async () => {
    process.env.REFERENCE_DATA_AUTH_BYPASS = "true";
    process.env.APP_ENV = "local";
    const result = await resolveReferenceDataPermissions(new Request("http://localhost/api"), "corr-test", "create");
    expect(result).toMatchObject({ ok: true, data: { canRead: true, canWrite: true, correlationId: "corr-test" } });
  });

  test("does not enable reference-data bypass in non-local runtime profiles", () => {
    process.env.REFERENCE_DATA_AUTH_BYPASS = "true";
    process.env.APP_ENV = "staging";
    expect(isLocalAuthBypassEnabled()).toBe(false);
  });

  test("normalizes backend value objects for BFF consumers", () => {
    expect(normalizeReferenceRecord({
      id: { value: "currency-usd" },
      set: "CURRENCY",
      code: { value: "USD" },
      displayName: "US Dollar",
      updatedBy: { displayName: "Reference Admin" },
      attributes: { relationship: "Minor unit: 2" }
    }, "CURRENCY", "corr-test")).toMatchObject({
      id: "currency-usd",
      code: "USD",
      classification: "Internal",
      relationship: "Minor unit: 2",
      correlationId: "corr-test"
    });
  });

  test("builds backend mutation command with actor and correlation metadata", () => {
    expect(mutationCommand({
      set: "CURRENCY",
      code: "EUR",
      displayName: "Euro",
      correlationId: "corr-test",
      operation: "create"
    })).toMatchObject({
      set: "CURRENCY",
      code: "EUR",
      displayName: "Euro",
      actorSubjectId: "local.reference.admin",
      operation: "create",
      correlationId: "corr-test"
    });
  });
});

// Regression tests for the fail-open authorization paths. Before this suite existed,
// resolveReferenceDataPermissions returned canRead: true in every branch — including
// an explicit Identity DENY — and accepted its token reference from browser-suppliable
// headers. None of that was covered by a test, which is how it survived.
describe("reference-data authorization fails closed", () => {
  const SECRET = "test-reference-session-secret";

  function activeSession(): AuthSession {
    return {
      sessionId: "sess-1",
      subjectId: "subject-1",
      displayName: "Test Operator",
      roles: [],
      permissions: [],
      issuedAt: new Date(Date.now() - 60_000).toISOString(),
      expiresAt: new Date(Date.now() + 600_000).toISOString(),
      policyVersion: "v1"
    };
  }

  function requestWithSession(headers: Record<string, string> = {}): Request {
    const cookie = `${SESSION_COOKIE_NAME}=${encodeSessionCookie(activeSession(), SECRET)}`;
    return new Request("http://localhost/api", { headers: { cookie, ...headers } });
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    delete process.env.LOCAL_REFERENCE_DATA_TOKEN;
  });

  test("denies when the request carries no session", async () => {
    vi.stubEnv("AUTH_SESSION_SECRET", SECRET);
    process.env.LOCAL_REFERENCE_DATA_TOKEN = "configured-token";

    const result = await resolveReferenceDataPermissions(
      new Request("http://localhost/api"),
      "corr-no-session",
      "read"
    );

    expect(result).toMatchObject({ ok: true, data: { canRead: false, canWrite: false } });
  });

  test("denies when the session is valid but no server-side token is configured", async () => {
    vi.stubEnv("AUTH_SESSION_SECRET", SECRET);

    const result = await resolveReferenceDataPermissions(
      requestWithSession(),
      "corr-unconfigured",
      "read"
    );

    // Previously this branch returned defaultPermissionState() — canRead: true with no
    // Identity call at all.
    expect(result).toMatchObject({ ok: true, data: { canRead: false, canWrite: false } });
  });

  test("denies read when identity returns DENY", async () => {
    vi.stubEnv("AUTH_SESSION_SECRET", SECRET);
    process.env.LOCAL_REFERENCE_DATA_TOKEN = "configured-token";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      JSON.stringify({ result: "DENY", reasonCode: "NOT_PERMITTED" }),
      { status: 200, headers: { "content-type": "application/json" } }
    )));

    const result = await resolveReferenceDataPermissions(
      requestWithSession(),
      "corr-denied",
      "read"
    );

    // canRead was hard-coded true here, so a denied deep link could never render the
    // denied state (FR-012, US-001).
    expect(result).toMatchObject({ ok: true, data: { canRead: false, canWrite: false } });
  });

  test("ignores a browser-supplied authorization header", async () => {
    vi.stubEnv("AUTH_SESSION_SECRET", SECRET);
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({ result: "ALLOW" }),
      { status: 200, headers: { "content-type": "application/json" } }
    ));
    vi.stubGlobal("fetch", fetchMock);

    // No server-side token configured, but the caller supplies its own. It must not be
    // honoured, so the outcome is denial rather than an Identity call.
    const result = await resolveReferenceDataPermissions(
      requestWithSession({ authorization: "attacker-chosen-token" }),
      "corr-browser-token",
      "read"
    );

    expect(result).toMatchObject({ ok: true, data: { canRead: false } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("replaces a malformed inbound correlation id", () => {
    const supplied = correlationIdFrom(
      new Request("http://localhost/api", { headers: { "x-correlation-id": "bad value with spaces" } }),
      "ref-test"
    );
    expect(supplied.startsWith("ref-test-")).toBe(true);

    const accepted = correlationIdFrom(
      new Request("http://localhost/api", { headers: { "x-correlation-id": "corr-valid.1" } }),
      "ref-test"
    );
    expect(accepted).toBe("corr-valid.1");
  });
});
