import { encodeSessionCookie, SESSION_COOKIE_NAME, type AuthSession } from "@erp/auth";
import {
  canonicalRateSearchParams,
  rateFormSchema,
  safeRateReturnTo
} from "./rates";
import { hasRateCapability, proxyRate } from "./rate-proxy";

const session: AuthSession = {
  sessionId: "session-1",
  subjectId: "pricing-user",
  subjectType: "user",
  displayName: "Pricing User",
  roles: ["PRICING"],
  permissions: [
    "charge-rates:read",
    "charge-rates:create",
    "charge-rates:update",
    "charge-rates:approve",
    "charge-rates:create-successor"
  ],
  issuedAt: "2026-07-26T00:00:00.000Z",
  expiresAt: "2099-07-26T00:00:00.000Z",
  policyVersion: "mvp-2026-07-26"
};

describe("Rate client contract", () => {
  beforeEach(() => {
    process.env.AUTH_SESSION_SECRET = "test-session-secret";
    process.env.CHARGE_SERVICE_TOKEN = "test-service-token";
    process.env.CHARGE_AGREEMENT_SERVICE_URL = "http://charge-service:8084";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.AUTH_SESSION_SECRET;
    delete process.env.CHARGE_SERVICE_TOKEN;
    delete process.env.CHARGE_AGREEMENT_SERVICE_URL;
  });

  it("enforces category-specific form shape and exact money precision", () => {
    expect(rateFormSchema.safeParse(form("BASE", "OFR", "destination-1", "10.25")).success).toBe(true);
    expect(rateFormSchema.safeParse(form("LOCAL", "THC", null, "10.25")).success).toBe(true);
    expect(rateFormSchema.safeParse(form("LOCAL", "THC", "destination-1", "10.25")).success).toBe(false);
    expect(rateFormSchema.safeParse(form("BASE", "BAF", "destination-1", "10.25")).success).toBe(false);
    expect(rateFormSchema.safeParse(form("BASE", "OFR", "destination-1", "10.999")).success).toBe(false);
  });

  it("canonicalizes filters and maps browser page one to service page zero", () => {
    const input = new URLSearchParams("q=%20OFR%20&page=1&size=500&ignored=actor");
    const output = canonicalRateSearchParams(input);

    expect(output.toString()).toBe("q=OFR&page=0&size=100");
    expect(canonicalRateSearchParams(new URLSearchParams("page=3&size=10")).get("page")).toBe("2");
  });

  it("derives capabilities from signed session permissions", () => {
    expect(hasRateCapability(session.permissions, "approve")).toBe(true);
    expect(hasRateCapability(["charge-rates:read"], "update")).toBe(false);
    expect(hasRateCapability(["booking:approve"], "approve")).toBe(false);
  });

  it("rejects unauthenticated denied and browser-spoofed actors before proxying", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const unauthenticated = await proxyRate(request(), "/api/charge-rates", "GET", "read");
    const denied = await proxyRate(request(sessionCookie({ ...session, permissions: ["charge-rates:read"] })),
      "/api/charge-rates", "POST", "create");
    const spoofed = await proxyRate(request(sessionCookie(session), {
      "content-type": "application/json",
      "x-actor-subject": "attacker"
    }, "{}"), "/api/charge-rates", "POST", "create");

    expect(unauthenticated.status).toBe(401);
    expect(denied.status).toBe(403);
    expect(spoofed.status).toBe(400);
    expect((await spoofed.json()).code).toBe("AUTHORITY_HEADER_REJECTED");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("proxies the signed actor and preserves backend status field errors and correlation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      code: "RATE_REFERENCE_INVALID",
      message: "One or more references are invalid",
      fields: [{ field: "currencyId", reason: "inactive" }]
    }, { status: 422 })));

    const response = await proxyRate(request(sessionCookie(session), {
      "content-type": "application/json",
      "x-correlation-id": "corr-browser"
    }, JSON.stringify(form("BASE", "OFR", "destination-1", "10.25"))),
    "/api/charge-rates", "POST", "create");

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      code: "RATE_REFERENCE_INVALID",
      correlationId: "corr-browser",
      fields: [{ path: "currencyId", code: "INVALID", message: "inactive" }]
    });
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(new Headers(init?.headers).get("x-actor-subject")).toBe("pricing-user");
    expect(new Headers(init?.headers).get("x-correlation-id")).toBe("corr-browser");
  });

  it("maps unavailable and malformed backend responses to safe envelopes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("token=should-not-leak")));
    const unavailable = await proxyRate(request(sessionCookie(session)), "/api/charge-rates", "GET", "read");
    expect(unavailable.status).toBe(503);
    expect(JSON.stringify(await unavailable.json())).not.toContain("should-not-leak");

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>failure</html>", { status: 500 })));
    const malformed = await proxyRate(request(sessionCookie(session)), "/api/charge-rates", "GET", "read");
    expect(malformed.status).toBe(503);
    expect(await malformed.json()).toMatchObject({ code: "CHARGE_REQUEST_FAILED" });
  });

  it("stops reading command bodies when the streaming byte bound is exceeded", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const oversized = request(sessionCookie(session), {
      "content-type": "application/json"
    }, JSON.stringify({ payload: "x".repeat(33 * 1024) }));

    const response = await proxyRate(oversized, "/api/charge-rates", "POST", "create");

    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ code: "BODY_TOO_LARGE" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows only Rate-local safe return URLs", () => {
    expect(safeRateReturnTo("/charge-agreements/rates/rate-1?mode=edit"))
      .toBe("/charge-agreements/rates/rate-1?mode=edit");
    expect(safeRateReturnTo("https://evil.example/rates")).toBe("/charge-agreements/rates");
    expect(safeRateReturnTo("/booking")).toBe("/charge-agreements/rates");
  });
});

function form(category: "BASE" | "SURCHARGE" | "LOCAL", chargeCode: "OFR" | "BAF" | "THC",
  destinationLocationId: string | null, unitRate: string) {
  return {
    category,
    chargeCodeId: `charge-${chargeCode.toLowerCase()}`,
    chargeCode,
    unitRate,
    currencyId: "currency-usd",
    currency: "USD",
    effectiveFrom: "2026-07-01",
    effectiveTo: "2026-12-31",
    originLocationId: "location-origin",
    destinationLocationId,
    equipmentTypeId: "equipment-40hc"
  };
}

function sessionCookie(value: AuthSession): string {
  return `${SESSION_COOKIE_NAME}=${encodeSessionCookie(value, "test-session-secret")}`;
}

function request(cookie?: string, headers: Record<string, string> = {}, body?: string): Request {
  const values = new Headers(headers);
  if (cookie) values.set("cookie", cookie);
  if (body !== undefined) {
    if (!values.has("origin")) values.set("origin", "http://127.0.0.1:18088");
    if (!values.has("x-linercore-client-request-id")) {
      values.set("x-linercore-client-request-id", "018f52c0-3c2e-7abc-8def-0123456789ab");
    }
  }
  return new Request("http://localhost/api/rates", {
    method: body === undefined ? "GET" : "POST",
    headers: values,
    body
  });
}
