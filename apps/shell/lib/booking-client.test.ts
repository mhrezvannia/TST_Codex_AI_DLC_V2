import { afterEach, describe, expect, it } from "vitest";
import { forwardToBookingBff, loadShellBooking, loadShellBookings } from "./booking-client";

describe("shell Booking client", () => {
  const originalFetch = global.fetch;
  const originalBookingAppUrl = process.env.BOOKING_APP_URL;

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalBookingAppUrl === undefined) {
      delete process.env.BOOKING_APP_URL;
    } else {
      process.env.BOOKING_APP_URL = originalBookingAppUrl;
    }
  });

  it("calls the existing Booking BFF with session cookie and correlation id", async () => {
    process.env.BOOKING_APP_URL = "http://booking-bff.local";
    let calledUrl = "";
    let cookie = "";
    let correlation = "";
    global.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      calledUrl = String(input);
      const headers = new Headers(init?.headers);
      cookie = headers.get("cookie") ?? "";
      correlation = headers.get("x-correlation-id") ?? "";
      return Promise.resolve(Response.json({ items: [], returned: 0, page: 0, size: 25 }));
    }) as typeof fetch;

    const result = await loadShellBookings(new URLSearchParams({ page: "0", size: "25" }), "lc_session=session", "corr-1");

    expect(result.ok).toBe(true);
    expect(calledUrl).toBe("http://booking-bff.local/api/bookings?page=0&size=25");
    expect(cookie).toBe("lc_session=session");
    expect(correlation).toBe("corr-1");
  });

  it("returns safe error state from BFF failures", async () => {
    global.fetch = (() => Promise.resolve(Response.json({ message: "A signed-in Booking actor is required", correlationId: "corr-bff" }, { status: 401 }))) as typeof fetch;

    await expect(loadShellBookings(new URLSearchParams({ page: "0", size: "25" }), "", "corr-1"))
      .resolves.toEqual({ ok: false, status: 401, message: "A signed-in Booking actor is required", correlationId: "corr-bff" });
  });

  it("loads Booking detail through the existing BFF", async () => {
    process.env.BOOKING_APP_URL = "http://booking-bff.local";
    let calledUrl = "";
    global.fetch = ((input: RequestInfo | URL) => {
      calledUrl = String(input);
      return Promise.resolve(Response.json({ id: "booking-1", bookingNumber: "BKG-1", status: "DRAFT", customerId: "customer-1", routing: [], equipment: [] }));
    }) as typeof fetch;

    const result = await loadShellBooking("booking-1", "lc_session=session", "corr-2");

    expect(result.ok).toBe(true);
    expect(calledUrl).toBe("http://booking-bff.local/api/bookings/booking-1");
  });

  it("forwards shell API calls with cookie, idempotency, and correlation", async () => {
    process.env.BOOKING_APP_URL = "http://booking-bff.local";
    let idempotency = "";
    let cookie = "";
    let correlation = "";
    let origin = "";
    global.fetch = ((_: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      idempotency = headers.get("idempotency-key") ?? "";
      cookie = headers.get("cookie") ?? "";
      correlation = headers.get("x-correlation-id") ?? "";
      origin = headers.get("origin") ?? "";
      return Promise.resolve(Response.json({ id: "booking-1" }, { status: 201 }));
    }) as typeof fetch;

    const request = new Request("http://shell.local/api/booking/bookings", {
      method: "POST",
      headers: { cookie: "lc_session=session", "idempotency-key": "idem-1", "x-correlation-id": "corr-3" }
    });
    const response = await forwardToBookingBff(request, "/api/bookings", { method: "POST", body: "{}" });

    expect(response.status).toBe(201);
    expect(idempotency).toBe("idem-1");
    expect(cookie).toBe("lc_session=session");
    expect(correlation).toBe("corr-3");
    expect(origin).toBe("http://booking-bff.local");
  });
});
