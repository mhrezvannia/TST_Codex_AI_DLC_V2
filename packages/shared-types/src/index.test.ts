import { describe, expect, it } from "vitest";
import { mapBookingServerFields, validateBookingDraft } from "./index";

const valid = {
  customerId: "CUST-001",
  loadUnLocode: "USNYC",
  dischargeUnLocode: "NLRTM",
  voyageId: "VOY-001",
  requestedDepartureDate: "2026-08-01",
  equipmentTypeCode: "45G1",
  equipmentId: "MSCU6639870",
  commodityCode: "GENERAL"
};

describe("Booking draft shared contract", () => {
  it("accepts the canonical W1 booking draft shape", () => {
    expect(validateBookingDraft(valid)).toEqual({});
  });

  it("returns field-addressable route and equipment errors", () => {
    const errors = validateBookingDraft({
      ...valid,
      dischargeUnLocode: "USNYC",
      requestedDepartureDate: "2026-02-30",
      equipmentId: "bad"
    });

    expect(errors.dischargeUnLocode).toContain("differ");
    expect(errors.requestedDepartureDate).toContain("valid departure date");
    expect(errors.equipmentId).toContain("ISO 6346");
  });

  it("maps canonical server field paths to form controls", () => {
    expect(mapBookingServerFields(
      ["routing[0].loadUnLocode", "equipment[0].equipmentId", "routing", "unknown"],
      "Reference is invalid"
    )).toEqual({ loadUnLocode: "Reference is invalid", equipmentId: "Reference is invalid" });
  });
});
