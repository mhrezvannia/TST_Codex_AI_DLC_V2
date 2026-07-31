// @vitest-environment node

import { encodeSessionCookie, SESSION_COOKIE_NAME, type AuthSession } from "@erp/auth";
import { MANUAL_CASE_POLICIES } from "./policies";
import { proxyCharge } from "./proxy-charge";

describe("manual pricing BFF authorization and disclosure boundary", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("authorizes before any count or detail provider call", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("AUTH_SESSION_SECRET", "test-manual-session-secret");
    const provider = vi.fn();
    vi.stubGlobal("fetch", provider);
    const cookie = `${SESSION_COOKIE_NAME}=${encodeSessionCookie(
      session([]), "test-manual-session-secret"
    )}`;

    const list = await proxyCharge(new Request(
      "http://local/charge-agreements/api/manual-cases",
      { headers: { cookie, "x-correlation-id": "corr-manual-denied" } }
    ), MANUAL_CASE_POLICIES.list);
    const detail = await proxyCharge(new Request(
      "http://local/charge-agreements/api/manual-cases/case-secret",
      { headers: { cookie, "x-correlation-id": "corr-manual-denied" } }
    ), MANUAL_CASE_POLICIES.detail, { identifiers: { caseId: "case-secret" } });

    expect(list.status).toBe(403);
    expect(detail.status).toBe(403);
    expect(await list.text()).not.toContain("count");
    expect(await detail.text()).not.toContain("case-secret");
    expect(provider).not.toHaveBeenCalled();
  });

  it("forwards only approved list keys after signed-session authorization", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("AUTH_SESSION_SECRET", "test-manual-session-secret");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [], total: 0, page: 0, size: 25
    }), { status: 200, headers: { "content-type": "application/json" } })));
    const cookie = `${SESSION_COOKIE_NAME}=${encodeSessionCookie(
      session(["charge-manual-cases:read"]), "test-manual-session-secret"
    )}`;

    const response = await proxyCharge(new Request(
      "http://local/charge-agreements/api/manual-cases?status=OPEN&page=0&size=25&unknown=secret",
      { headers: { cookie, "x-correlation-id": "corr-manual-allowed" } }
    ), MANUAL_CASE_POLICIES.list);

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});

function session(permissions: string[]): AuthSession {
  return {
    sessionId: "manual-session",
    subjectId: "pricing-analyst",
    subjectType: "user",
    displayName: "Pricing Analyst",
    roles: [],
    permissions,
    issuedAt: "2026-07-01T00:00:00Z",
    expiresAt: "2099-07-01T00:00:00Z",
    policyVersion: "v1"
  };
}
