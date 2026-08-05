import { describe, expect, it } from "vitest";
import { isValidIso6346, mapBookingServerFields, validateBookingDraft } from "./index";

const valid = {
  customerId: "CUST-001",
  loadUnLocode: "USNYC",
  dischargeUnLocode: "NLRTM",
  voyageId: "VOY-001",
  equipmentTypeCode: "45G1",
  equipmentId: "MSCU6639870",
  commodityCode: "GENERAL"
};

describe("Booking draft shared contract", () => {
  it("validates the ISO 6346 check digit", () => {
    expect(isValidIso6346("LCRU1000055")).toBe(true);
    expect(isValidIso6346("LCRU1000054")).toBe(false);
    expect(isValidIso6346("not-a-container")).toBe(false);
  });

  it("accepts the canonical W1 booking draft shape", () => {
    expect(validateBookingDraft(valid)).toEqual({});
  });

  it("returns field-addressable route and equipment errors", () => {
    const errors = validateBookingDraft({ ...valid, dischargeUnLocode: "USNYC", equipmentId: "bad" });

    expect(errors.dischargeUnLocode).toContain("differ");
    expect(errors.equipmentId).toContain("ISO 6346");
  });

  it("maps canonical server field paths to form controls", () => {
    expect(mapBookingServerFields(
      ["routing[0].loadUnLocode", "equipment[0].equipmentId", "routing", "unknown"],
      "Reference is invalid"
    )).toEqual({ loadUnLocode: "Reference is invalid", equipmentId: "Reference is invalid" });
  });
});
