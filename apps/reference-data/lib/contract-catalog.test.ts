import { describe, expect, test } from "vitest";
import { contractFindings, contractSummaries, statusLabel } from "./contract-catalog";

describe("contract catalog view data", () => {
  test("exposes API and event contracts", () => {
    expect(contractSummaries.map((contract) => contract.contractId).sort()).toEqual([
      "api-identity-service",
      "api-reference-data-service",
      "event-reference-data-changed"
    ]);
  });

  test("uses text compatibility labels", () => {
    expect(statusLabel("pending")).toBe("Compatibility pending");
  });

  test("exposes safe findings", () => {
    expect(contractFindings[0]).toMatchObject({ status: "deferred", severity: "medium" });
  });
});
