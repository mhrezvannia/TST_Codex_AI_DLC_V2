import { describe, expect, it } from "vitest";
import { mapServerFields, validateDraft } from "./booking-form";

const valid = {
  customerId: "CUST-001",
  loadUnLocode: "USNYC",
  dischargeUnLocode: "NLRTM",
  voyageId: "VOY-001",
  equipmentTypeCode: "45G1",
  equipmentId: "MSCU6639870",
  commodityCode: "GENERAL"
};

describe("validateDraft", () => {
  it("accepts the canonical W1 shape", () => {
    expect(validateDraft(valid)).toEqual({});
  });

  it("returns field-addressable route and equipment errors", () => {
    const errors = validateDraft({ ...valid, dischargeUnLocode: "USNYC", equipmentId: "bad" });
    expect(errors.dischargeUnLocode).toContain("differ");
    expect(errors.equipmentId).toContain("ISO 6346");
  });

  it("maps canonical server field paths to form controls", () => {
    expect(mapServerFields(
      ["routing[0].loadUnLocode", "equipment[0].equipmentId", "routing", "unknown"],
      "Reference is invalid"
    )).toEqual({ loadUnLocode: "Reference is invalid", equipmentId: "Reference is invalid" });
  });
});
