import { describe, expect, it } from "vitest";
import { normalizeBookingList } from "./booking-presentation";

const booking = (id: string) => ({
  id,
  bookingNumber: id,
  revision: 1,
  status: "DRAFT" as const,
  customerId: "C1",
  routing: [],
  equipment: [],
  currency: "USD",
  cargoMode: "FCL_DRY",
  reefer: false,
  dangerousGoods: false,
  legacyIncomplete: false,
  referenceValidation: null,
  pricingSnapshot: null,
  lifecycleEvents: [],
  movementStatuses: [],
  attributes: {}
});

describe("Booking list presentation normalization", () => {
  it("normalizes empty and rejects responses over the 25-row contract", () => {
    expect(normalizeBookingList({ ok: true, value: { items: [], returned: 0, page: 0, size: 25 }, correlationId: "c" }).state).toBe("empty");
    const result = normalizeBookingList({ ok: true, value: { items: Array.from({ length: 30 }, (_, index) => booking(String(index))), returned: 30, page: 0, size: 25 }, correlationId: "c" });
    expect(result.state).toBe("error");
    expect("message" in result ? result.message : "").toContain("violated the 25-row shell contract");
  });

  it("distinguishes denied, degraded, and error outcomes", () => {
    expect(normalizeBookingList({ ok: false, status: 403, message: "Denied", correlationId: "c" }).state).toBe("denied");
    expect(normalizeBookingList({ ok: false, status: 503, message: "Unavailable", correlationId: "c" }).state).toBe("error");
    expect(normalizeBookingList({ ok: true, value: { items: [booking("1")], returned: 1, page: 0, size: 25 }, correlationId: "c", degradedMessage: "Pricing unavailable" }).state).toBe("degraded");
  });
});
