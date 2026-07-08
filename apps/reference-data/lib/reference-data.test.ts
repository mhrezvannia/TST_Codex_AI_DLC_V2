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

  test("defaults local session to read-only", () => {
    expect(defaultPermissionState("corr-test")).toMatchObject({ canRead: true, canWrite: false, correlationId: "corr-test" });
  });

  test("validates mutation drafts with zod", () => {
    expect(validateMutationDraft({ set: "CURRENCY", code: "USD", displayName: "US Dollar", attributes: {} }).success).toBe(true);
    expect(validateMutationDraft({ set: "CURRENCY", code: "", displayName: "" }).success).toBe(false);
  });
});
