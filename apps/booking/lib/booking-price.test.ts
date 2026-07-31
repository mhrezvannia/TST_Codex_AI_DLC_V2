import { afterEach, describe, expect, it } from "vitest";
import { SESSION_COOKIE_NAME, encodeSessionCookie, type AuthSession } from "@erp/auth";
import {
  pricingCommandResponseSchema,
  proxyBookingPrice
} from "./bookings";

describe("Booking price BFF", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.BOOKING_SERVICE_TOKEN;
    delete process.env.CHARGE_SERVICE_TOKEN;
  });

  it("accepts typed manual evidence without inventing money", () => {
    const parsed = pricingCommandResponseSchema.parse(manualResponse());

    expect(parsed.result.outcome).toBe("MANUAL_PRICING_REQUIRED");
    expect(parsed.result.typedSnapshot).toBeNull();
    expect(parsed.confirmationEligible).toBe(false);
  });

  it("decodes enriched and legacy snapshots without mixing their provenance", () => {
    const enriched = pricingCommandResponseSchema.parse(pricedResponse());
    const legacy = pricingCommandResponseSchema.parse(legacyResponse());

    expect(enriched.result.typedSnapshot?.lines.map((line) => line.rateCategory))
      .toEqual(["BASE", "SURCHARGE", "LOCAL"]);
    expect(enriched.result.legacySnapshot).toBeNull();
    expect(legacy.result.typedSnapshot).toBeNull();
    expect(legacy.result.legacySnapshot?.legacy?.pricingQuoteId).toBe("legacy-quote-1");
  });

  it("keeps no-rate, ambiguity, and outage evidence distinct", () => {
    const noRate = pricingCommandResponseSchema.parse(manualResponse());
    const ambiguity = pricingCommandResponseSchema.parse(manualResponse("AMBIGUOUS_BASE_RATE"));
    const outage = pricingCommandResponseSchema.parse(outageResponse());

    expect(noRate.result.failureEvidence?.reasonCode).toBe("NO_RATE");
    expect(ambiguity.result.failureEvidence?.reasonCode).toBe("AMBIGUOUS_BASE_RATE");
    expect(outage.result.outcome).toBe("UNAVAILABLE");
    expect(outage.result.failureEvidence?.manualCaseId).toBeNull();
  });

  it("rejects unexpected response properties to prevent leakage", () => {
    expect(pricingCommandResponseSchema.safeParse({
      ...manualResponse(),
      serviceToken: "must-not-leak"
    }).success).toBe(false);
  });

  it("rejects invalid booking ids before backend fetch", async () => {
    const calls: string[] = [];
    global.fetch = ((input: RequestInfo | URL) => {
      calls.push(String(input));
      return Promise.resolve(Response.json({}));
    }) as typeof fetch;

    const response = await proxyBookingPrice(commandRequest({}), "../charge");

    expect(response.status).toBe(400);
    expect(calls).toEqual([]);
  });

  it("denies a session without the exact request-pricing permission", async () => {
    const calls: string[] = [];
    global.fetch = ((input: RequestInfo | URL) => {
      calls.push(String(input));
      return Promise.resolve(Response.json({}));
    }) as typeof fetch;

    const response = await proxyBookingPrice(
      commandRequest({}, { permissions: ["booking:read"] }),
      "booking-1"
    );

    expect(response.status).toBe(403);
    expect(calls).toEqual([]);
  });

  it("rejects browser-supplied price fields before backend fetch", async () => {
    const calls: string[] = [];
    global.fetch = ((input: RequestInfo | URL) => {
      calls.push(String(input));
      return Promise.resolve(Response.json({}));
    }) as typeof fetch;

    const response = await proxyBookingPrice(commandRequest({ total: "1.00" }), "booking-1");

    expect(response.status).toBe(400);
    expect(calls).toEqual([]);
  });

  it("forwards only session actor, server idempotency, and Booking service identity", async () => {
    process.env.BOOKING_SERVICE_TOKEN = "booking-only-token";
    process.env.CHARGE_SERVICE_TOKEN = "charge-secret";
    let body: Record<string, unknown> = {};
    let headers = new Headers();
    global.fetch = ((_: RequestInfo | URL, init?: RequestInit) => {
      body = JSON.parse(String(init?.body));
      headers = new Headers(init?.headers);
      return Promise.resolve(Response.json(manualResponse(), { status: 422 }));
    }) as typeof fetch;

    await proxyBookingPrice(commandRequest({}), "booking-1");

    expect(body.actorSubjectId).toBe("local.booking.user");
    expect(body.idempotencyKey).toBe("idem-price-1");
    expect(headers.get("x-linercore-service-token")).toBe("booking-only-token");
    expect(headers.has("x-linercore-charge-token")).toBe(false);
    expect(JSON.stringify(body)).not.toContain("charge-secret");
  });

  it("preserves exact manual status, outcome, and correlation", async () => {
    process.env.BOOKING_SERVICE_TOKEN = "booking-only-token";
    global.fetch = (() => Promise.resolve(Response.json(manualResponse(), { status: 422 }))) as typeof fetch;

    const response = await proxyBookingPrice(commandRequest({}), "booking-1");
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.result.outcome).toBe("MANUAL_PRICING_REQUIRED");
    expect(response.headers.get("x-correlation-id")).toBe("corr-provider");
  });

  it("preserves a safe browser correlation and normalized retry guidance", async () => {
    process.env.BOOKING_SERVICE_TOKEN = "booking-only-token";
    global.fetch = ((_: RequestInfo | URL, init?: RequestInit) => {
      expect(new Headers(init?.headers).get("x-correlation-id")).toBe("corr-browser");
      return Promise.resolve(Response.json(inProgressResponse(), { status: 409 }));
    }) as typeof fetch;

    const response = await proxyBookingPrice(
      commandRequest({}, {}, { "x-correlation-id": "corr-browser" }),
      "booking-1"
    );

    expect(response.status).toBe(409);
    expect(response.headers.get("retry-after")).toBe("5");
    expect(response.headers.get("x-correlation-id")).toBe("corr-browser");
  });

  it("cancels the Booking fetch when the browser request is cancelled", async () => {
    process.env.BOOKING_SERVICE_TOKEN = "booking-only-token";
    const browserAbort = new AbortController();
    let backendSignal: AbortSignal | undefined;
    global.fetch = ((_: RequestInfo | URL, init?: RequestInit) => {
      backendSignal = init?.signal ?? undefined;
      return new Promise((_, reject) => {
        backendSignal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      });
    }) as typeof fetch;

    const pending = proxyBookingPrice(commandRequest({}, {}, {}, browserAbort.signal), "booking-1");
    browserAbort.abort();
    const response = await pending;

    expect(backendSignal?.aborted).toBe(true);
    expect(response.status).toBe(499);
    expect((await response.json()).code).toBe("BOOKING_REQUEST_CANCELLED");
  });

  it("redacts malformed successful upstream payloads", async () => {
    process.env.BOOKING_SERVICE_TOKEN = "booking-only-token";
    global.fetch = (() => Promise.resolve(Response.json({
      serviceToken: "upstream-secret",
      total: "999.00"
    }))) as typeof fetch;

    const response = await proxyBookingPrice(commandRequest({}), "booking-1");
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.code).toBe("BOOKING_PRICE_RESPONSE_INVALID");
    expect(JSON.stringify(payload)).not.toContain("upstream-secret");
  });
});

function commandRequest(
  body: Record<string, unknown>,
  sessionOverrides: Partial<AuthSession> = {},
  headers: Record<string, string> = {},
  signal?: AbortSignal
) {
  return new Request("http://localhost/api/bookings/booking-1/price", {
    method: "POST",
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${encodeSessionCookie(session(sessionOverrides))}`,
      origin: "http://localhost",
      "content-type": "application/json",
      "idempotency-key": "idem-price-1",
      ...headers
    },
    body: JSON.stringify(body),
    signal
  });
}

function session(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    sessionId: "s-price",
    subjectId: "local.booking.user",
    displayName: "Booking User",
    roles: ["booking-desk"],
    permissions: ["booking:read", "booking:request-pricing"],
    issuedAt: "2026-07-01T00:00:00Z",
    expiresAt: "2099-07-01T00:00:00Z",
    policyVersion: "mvp",
    ...overrides
  };
}

function manualResponse(reasonCode = "NO_RATE") {
  return {
    result: {
      outcome: "MANUAL_PRICING_REQUIRED",
      pricingRequestId: "price-1",
      amendmentSeq: 0,
      inputFingerprint: "a".repeat(64),
      typedSnapshot: null,
      legacySnapshot: null,
      failureEvidence: {
        reasonCode,
        reasonMessage: reasonCode,
        pricingRequestId: "price-1",
        manualCaseId: "manual-1",
        attempts: 1,
        circuitState: null,
        nextProbeAt: null,
        correlationId: "corr-provider",
        occurredAt: "2026-07-29T10:00:00Z",
        amendmentSeq: 0
      },
      retryAfterSeconds: 0,
      correlationId: "corr-provider"
    },
    history: {
      current: null,
      prior: [],
      nextCursor: null
    },
    confirmationEligible: false
  };
}

function pricedResponse() {
  const typed = {
    schemaVersion: 2,
    pricingRequestId: "price-1",
    bookingRef: "booking-1",
    amendmentSeq: 0,
    bookingRevision: 1,
    inputFingerprint: "a".repeat(64),
    requestedDepartureDate: "2026-08-01",
    pricingBasis: "AGREEMENT",
    pricingRef: "agreement-1",
    agreementVersionId: "agreement-version-1",
    lines: [
      line("OFR", "FREIGHT", "BASE", 100),
      line("BAF", "SURCHARGE", "SURCHARGE", 20),
      line("THC", "LOCAL", "LOCAL", 10)
    ],
    applicableDndRuleTypes: [],
    total: 130,
    currency: "USD",
    pricedAt: "2026-07-29T10:00:00Z",
    correlationId: "corr-provider",
    createdAt: "2026-07-29T10:00:01Z"
  };
  const envelope = {
    pricingRequestId: "price-1",
    pricingQuoteId: "agreement-1",
    status: "QUOTED",
    quotedAmounts: {},
    receivedAt: "2026-07-29T10:00:01Z",
    correlationId: "corr-provider",
    typed,
    legacy: null
  };
  return {
    result: {
      outcome: "PRICED",
      pricingRequestId: "price-1",
      amendmentSeq: 0,
      inputFingerprint: "a".repeat(64),
      typedSnapshot: typed,
      legacySnapshot: null,
      failureEvidence: null,
      retryAfterSeconds: 0,
      correlationId: "corr-provider"
    },
    history: { current: envelope, prior: [], nextCursor: null },
    confirmationEligible: true
  };
}

function legacyResponse() {
  const legacy = {
    pricingRequestId: "legacy-price-1",
    pricingQuoteId: "legacy-quote-1",
    status: "QUOTED",
    quotedAmounts: { total: "90.00", currency: "USD" },
    receivedAt: "2026-06-01T10:00:00Z",
    correlationId: "corr-legacy"
  };
  const envelope = { ...legacy, typed: null, legacy };
  return {
    result: {
      outcome: "LEGACY_PRICED",
      pricingRequestId: "legacy-price-1",
      amendmentSeq: 0,
      inputFingerprint: "b".repeat(64),
      typedSnapshot: null,
      legacySnapshot: envelope,
      failureEvidence: null,
      retryAfterSeconds: 0,
      correlationId: "corr-legacy"
    },
    history: { current: envelope, prior: [], nextCursor: null },
    confirmationEligible: true
  };
}

function outageResponse() {
  const manual = manualResponse("PRICING_PROVIDER_UNAVAILABLE");
  return {
    ...manual,
    result: {
      ...manual.result,
      outcome: "UNAVAILABLE",
      pricingRequestId: null,
      failureEvidence: {
        ...manual.result.failureEvidence,
        pricingRequestId: null,
        manualCaseId: null,
        attempts: 2
      }
    }
  };
}

function inProgressResponse() {
  return {
    result: {
      outcome: "IN_PROGRESS",
      pricingRequestId: null,
      amendmentSeq: 0,
      inputFingerprint: "a".repeat(64),
      typedSnapshot: null,
      legacySnapshot: null,
      failureEvidence: null,
      retryAfterSeconds: 5,
      correlationId: "corr-browser"
    },
    history: { current: null, prior: [], nextCursor: null },
    confirmationEligible: false
  };
}

function line(chargeCode: string, category: "FREIGHT" | "SURCHARGE" | "LOCAL",
  rateCategory: "BASE" | "SURCHARGE" | "LOCAL", amount: number) {
  return {
    chargeCode,
    category,
    rateCategory,
    basis: "PER_CONTAINER",
    quantity: 1,
    unitRate: amount,
    amount,
    currency: "USD",
    sourceRateVersionId: `rate-${chargeCode}`
  };
}
