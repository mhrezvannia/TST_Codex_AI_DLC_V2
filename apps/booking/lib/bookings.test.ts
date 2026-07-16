import { afterEach, describe, expect, it } from "vitest";
import { bookingReturnTo, safeBookingReturnTo, serviceHeaders, validateCommandRequest } from "./bookings";

describe("Booking BFF service headers", () => {
  afterEach(() => {
    delete process.env.BOOKING_SERVICE_TOKEN;
  });

  it("owns actor, service identity, correlation, and idempotency headers", () => {
    process.env.BOOKING_SERVICE_TOKEN = "server-only-token";

    const headers = serviceHeaders("corr-1", "idem-1");

    expect(headers.get("x-linercore-actor-id")).toBe("local-user");
    expect(headers.get("x-linercore-service-id")).toBe("booking-bff");
    expect(headers.get("x-linercore-service-token")).toBe("server-only-token");
    expect(headers.get("x-correlation-id")).toBe("corr-1");
    expect(headers.get("idempotency-key")).toBe("idem-1");
  });

  it("fails closed when the server token is absent", () => {
    expect(() => serviceHeaders("corr-1", "idem-1")).toThrow("BOOKING_SERVICE_TOKEN is required");
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
