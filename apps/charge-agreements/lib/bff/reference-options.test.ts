import { encodeSessionCookie, SESSION_COOKIE_NAME, type AuthSession } from "@erp/auth";
import { resetChargeConfigurationForTests } from "./config";
import { proxyReferenceOptions, referenceSelectorPoolForTests } from "./reference-options";

const session: AuthSession = {
  sessionId: "s-ref",
  subjectId: "charge-reader",
  subjectType: "user",
  displayName: "Charge Reader",
  roles: [],
  permissions: ["charge-agreements:read"],
  issuedAt: "2026-07-01T00:00:00Z",
  expiresAt: "2099-07-01T00:00:00Z",
  policyVersion: "v1"
};

describe("bounded Reference selector proxy", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("AUTH_SESSION_SECRET", "test-reference-session-secret");
    resetChargeConfigurationForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    resetChargeConfigurationForTests();
  });

  it("rejects missing session before lookup", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await proxyReferenceOptions(request("kind=customer&domain=agreements"));
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not imply Rate selector access from Agreement read", async () => {
    const response = await proxyReferenceOptions(
      request("kind=charge-code&domain=rates", cookie(session))
    );
    expect(response.status).toBe(403);
  });

  it("uses a fixed path/token and emits only active bounded options", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      records: [
        { id: "p1", code: "C1", displayName: "Customer One", status: "ACTIVE" },
        { id: "p2", code: "C2", displayName: "Customer Two", status: "INACTIVE" }
      ]
    })));
    const response = await proxyReferenceOptions(
      request("kind=customer&domain=agreements&q=one", cookie(session))
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      options: [{ id: "p1", label: "C1 — Customer One" }]
    });
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe(
      "http://reference-data-service:8083/reference-sets/party-customer/records?includeInactive=false&page=0&size=50"
    );
    expect(new Headers(init?.headers).get("x-linercore-service-id"))
      .toBe("charge-agreements-bff");
    expect(referenceSelectorPoolForTests.active).toBe(0);
  });

  it.each([
    "kind=unknown&domain=agreements",
    "kind=customer&domain=agreements&actor=evil",
    `kind=customer&domain=agreements&q=${"x".repeat(129)}`
  ])("rejects invalid selector query %s", async (query) => {
    expect((await proxyReferenceOptions(request(query, cookie(session)))).status).toBe(400);
  });
});

function cookie(value: AuthSession): string {
  return `${SESSION_COOKIE_NAME}=${encodeSessionCookie(value, "test-reference-session-secret")}`;
}

function request(query: string, cookieHeader?: string): Request {
  return new Request(`http://localhost/charge-agreements/api/reference-options?${query}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined
  });
}
