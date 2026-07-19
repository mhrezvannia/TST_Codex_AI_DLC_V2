import { afterEach, describe, expect, it } from "vitest";
import { SESSION_COOKIE_NAME, encodeSessionCookie, type AuthSession } from "@erp/auth";
import { bookingReturnTo, loadBookings, proxyBooking, safeBookingReturnTo, serviceHeaders, validateCommandRequest } from "./bookings";

describe("Booking BFF service headers", () => {
  afterEach(() => {
    delete process.env.BOOKING_SERVICE_TOKEN;
  });

  it("owns actor, service identity, correlation, and idempotency headers", () => {
    process.env.BOOKING_SERVICE_TOKEN = "server-only-token";

    const headers = serviceHeaders("corr-1", "local.booking.user", "idem-1");

    expect(headers.get("x-linercore-actor-id")).toBe("local.booking.user");
    expect(headers.get("x-linercore-service-id")).toBe("booking-bff");
    expect(headers.get("x-linercore-service-token")).toBe("server-only-token");
    expect(headers.get("x-correlation-id")).toBe("corr-1");
    expect(headers.get("idempotency-key")).toBe("idem-1");
  });

  it("fails closed when the server token is absent", () => {
    expect(() => serviceHeaders("corr-1", "local.booking.user", "idem-1")).toThrow("BOOKING_SERVICE_TOKEN is required");
  });

  it("fails closed when the actor subject is absent", () => {
    process.env.BOOKING_SERVICE_TOKEN = "server-only-token";

    expect(() => serviceHeaders("corr-1", "", "idem-1")).toThrow("Booking actor subject is required");
    expect(() => serviceHeaders("corr-1", null, "idem-1")).toThrow("Booking actor subject is required");
  });

  it("does not fetch Booking reads without an actor", async () => {
    const originalFetch = global.fetch;
    const calls: string[] = [];
    global.fetch = ((input: RequestInfo | URL) => {
      calls.push(String(input));
      return Promise.resolve(Response.json({ items: [], returned: 0, page: 0, size: 25 }));
    }) as typeof fetch;

    try {
      const result = await loadBookings(new URLSearchParams({ page: "0", size: "25" }), null);

      expect(result).toEqual({ ok: false, status: 401, message: "A signed-in Booking actor is required" });
      expect(calls).toEqual([]);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("derives proxy actor from the session cookie", async () => {
    process.env.BOOKING_SERVICE_TOKEN = "server-only-token";
    const originalFetch = global.fetch;
    let actorHeader: string | null = null;
    global.fetch = ((_: RequestInfo | URL, init?: RequestInit) => {
      actorHeader = new Headers(init?.headers).get("x-linercore-actor-id");
      return Promise.resolve(Response.json({ items: [], returned: 0, page: 0, size: 25 }));
    }) as typeof fetch;

    try {
      const request = new Request("http://localhost/api/bookings", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${encodeSessionCookie(testSession())}` }
      });
      const response = await proxyBooking(request, "/api/bookings?page=0&size=25", "GET");

      expect(response.status).toBe(200);
      expect(actorHeader).toBe("local.booking.user");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("overwrites lifecycle actor fields with the signed session subject", async () => {
    process.env.BOOKING_SERVICE_TOKEN = "server-only-token";
    const originalFetch = global.fetch;
    let forwardedBody = "";
    global.fetch = ((_: RequestInfo | URL, init?: RequestInit) => {
      forwardedBody = String(init?.body ?? "");
      return Promise.resolve(Response.json({ status: "VALIDATED" }));
    }) as typeof fetch;

    try {
      const request = new Request("http://localhost/api/bookings/booking-1/validate", {
        method: "POST",
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${encodeSessionCookie(testSession())}`,
          origin: "http://localhost",
          "content-type": "application/json",
          "idempotency-key": "idem-validate"
        },
        body: JSON.stringify({ actorSubjectId: "spoofed-user" })
      });
      const response = await proxyBooking(request, "/api/bookings/booking-1/validate", "POST");

      expect(response.status).toBe(200);
      expect(JSON.parse(forwardedBody)).toMatchObject({ actorSubjectId: "local.booking.user" });
      expect(JSON.parse(forwardedBody).correlationId).toBeTruthy();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("preserves 403 deny status and replaces backend local correlation fallback", async () => {
    process.env.BOOKING_SERVICE_TOKEN = "server-only-token";
    const originalFetch = global.fetch;
    global.fetch = (() => Promise.resolve(Response.json({
      code: "forbidden",
      message: "booking command denied",
      correlationId: "local-correlation"
    }, { status: 403 }))) as typeof fetch;

    try {
      const request = new Request("http://localhost/api/bookings", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${encodeSessionCookie(testSession({ subjectId: "local.reference.admin" }))}` }
      });
      const response = await proxyBooking(request, "/api/bookings?page=0&size=25", "GET");
      const payload = await response.json();

      expect(response.status).toBe(403);
      expect(payload).toMatchObject({ code: "forbidden", message: "booking command denied" });
      expect(payload.correlationId).not.toBe("local-correlation");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("rejects proxy reads before fetch when the session actor is missing", async () => {
    const originalFetch = global.fetch;
    const calls: string[] = [];
    global.fetch = ((input: RequestInfo | URL) => {
      calls.push(String(input));
      return Promise.resolve(Response.json({}));
    }) as typeof fetch;

    try {
      const response = await proxyBooking(new Request("http://localhost/api/bookings"), "/api/bookings", "GET");
      const payload = await response.json();

      expect(response.status).toBe(401);
      expect(payload).toMatchObject({ code: "AUTH_REQUIRED", message: "Authentication is required for Booking" });
      expect(calls).toEqual([]);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("rejects expired proxy sessions before backend fetch", async () => {
    const originalFetch = global.fetch;
    const calls: string[] = [];
    global.fetch = ((input: RequestInfo | URL) => {
      calls.push(String(input));
      return Promise.resolve(Response.json({}));
    }) as typeof fetch;

    try {
      const request = new Request("http://localhost/api/bookings", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${encodeSessionCookie(testSession({ expiresAt: "2026-07-01T00:00:00Z" }))}` }
      });
      const response = await proxyBooking(request, "/api/bookings", "GET");
      const payload = await response.json();

      expect(response.status).toBe(401);
      expect(payload).toMatchObject({ code: "AUTH_REQUIRED" });
      expect(calls).toEqual([]);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("rejects authenticated proxy sessions with no usable subject before backend fetch", async () => {
    const originalFetch = global.fetch;
    const calls: string[] = [];
    global.fetch = ((input: RequestInfo | URL) => {
      calls.push(String(input));
      return Promise.resolve(Response.json({}));
    }) as typeof fetch;

    try {
      const request = new Request("http://localhost/api/bookings", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${encodeSessionCookie(testSession({ subjectId: "   " }))}` }
      });
      const response = await proxyBooking(request, "/api/bookings", "GET");
      const payload = await response.json();

      expect(response.status).toBe(403);
      expect(payload).toMatchObject({ code: "BOOKING_ACTOR_REQUIRED" });
      expect(calls).toEqual([]);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("accepts only bounded same-origin JSON commands with idempotency", () => {
    const valid = new Request("http://localhost/api/bookings", {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json", "idempotency-key": "idem-1" }
    });
    const crossOrigin = new Request("http://localhost/api/bookings", {
      method: "POST",
      headers: { origin: "https://attacker.example", "content-type": "application/json", "idempotency-key": "idem-1" }
    });
    const oversized = new Request("http://localhost/api/bookings", {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json", "idempotency-key": "idem-1", "content-length": "32769" }
    });
    const forwarded = new Request("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        origin: "https://erp.example",
        "x-forwarded-host": "erp.example",
        "x-forwarded-proto": "https",
        "content-type": "application/json",
        "idempotency-key": "idem-1"
      }
    });

    expect(validateCommandRequest(valid)).toBeNull();
    expect(validateCommandRequest(forwarded)).toBeNull();
    expect(validateCommandRequest(crossOrigin)?.status).toBe(403);
    expect(validateCommandRequest(oversized)?.status).toBe(413);
  });

  it("preserves only safe booking-list return state", () => {
    const returnTo = bookingReturnTo({ search: "BKG-1", status: "DRAFT", page: "2" });

    expect(returnTo).toBe("/bookings?search=BKG-1&status=DRAFT&page=2");
    expect(safeBookingReturnTo(returnTo)).toBe(returnTo);
    expect(safeBookingReturnTo("https://attacker.example")).toBe("/bookings");
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
