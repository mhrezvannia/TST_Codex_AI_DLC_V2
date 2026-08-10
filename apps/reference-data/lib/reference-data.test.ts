import { describe, expect, test } from "vitest";
import {
  defaultPermissionState,
  findRecord,
  listRecords,
  referenceSetDescriptors,
  referenceSetIds,
  validateMutationDraft
} from "./reference-data";

describe("reference-data helpers", () => {
  test("exposes all MVP reference sets", () => {
    expect(referenceSetDescriptors.map((set) => set.id).sort()).toEqual([...referenceSetIds].sort());
  });

  test("filters records by set and search text", () => {
    expect(listRecords("CURRENCY", "usd")).toHaveLength(1);
    expect(findRecord("CURRENCY", "currency-usd")?.code).toBe("USD");
  });

  test("exposes complete vessel, equipment, and charge reference data", () => {
    expect(listRecords("VESSEL_VOYAGE").map((record) => record.code)).toEqual(["9387425", "LC001E", "LC002E"]);
    expect(listRecords("EQUIPMENT_TYPE").map((record) => record.code).sort()).toEqual(["22G1", "42G1", "45G1"]);
    expect(listRecords("CHARGE_CODE").map((record) => record.code).sort()).toEqual(["BAF", "OFR", "THC"]);
  });

  test("defaults local session to read-only", () => {
    expect(defaultPermissionState("corr-test")).toMatchObject({ canRead: true, canWrite: false, correlationId: "corr-test" });
  });

  test("validates mutation drafts with zod", () => {
    expect(validateMutationDraft({ set: "CURRENCY", code: "USD", displayName: "US Dollar", attributes: {} }).success).toBe(true);
    expect(validateMutationDraft({ set: "CURRENCY", code: "", displayName: "" }).success).toBe(false);
  });
});
