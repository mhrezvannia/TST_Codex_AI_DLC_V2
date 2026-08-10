import { describe, expect, it } from "vitest";
import { canonicalBookingDetailPath, canonicalBookingListPath, canonicalBookingNewPath } from "./booking-compat";

describe("legacy Booking route compatibility", () => {
  it("maps /bookings list queries to canonical /booking with an allowlist", () => {
    const params = new URLSearchParams([
      ["page", "2"],
      ["page", "3"],
      ["pageSize", "25"],
      ["status", "DRAFT"],
      ["q", "BKG-1"],
      ["returnTo", "https://attacker.example"]
    ]);

    expect(canonicalBookingListPath(params)).toBe("/booking?page=2&pageSize=25&status=DRAFT&q=BKG-1");
  });

  it("drops unknown and empty list query values from object search params", () => {
    expect(canonicalBookingListPath({
      page: "",
      sort: ["createdAt", "updatedAt"],
      direction: "desc",
      unsafe: "/booking/new"
    })).toBe("/booking?sort=createdAt&direction=desc");
  });

  it("maps /bookings/new to /booking/new without carrying query state", () => {
    expect(canonicalBookingNewPath()).toBe("/booking/new");
  });

  it("maps safe one-segment detail ids and encodes the canonical target", () => {
    expect(canonicalBookingDetailPath("booking-1")).toBe("/booking/booking-1");
    expect(canonicalBookingDetailPath("BKG%3A2026-001")).toBe("/booking/BKG%3A2026-001");
  });

  it("rejects traversal, encoded slash, invalid percent encoding, empty, and unsafe detail ids", () => {
    expect(canonicalBookingDetailPath(undefined)).toBeNull();
    expect(canonicalBookingDetailPath("")).toBeNull();
    expect(canonicalBookingDetailPath("..")).toBeNull();
    expect(canonicalBookingDetailPath("booking..1")).toBeNull();
    expect(canonicalBookingDetailPath("booking%2F1")).toBeNull();
    expect(canonicalBookingDetailPath("booking/1")).toBeNull();
    expect(canonicalBookingDetailPath("%E0%A4%A")).toBeNull();
    expect(canonicalBookingDetailPath("booking 1")).toBeNull();
  });
});
