import { describe, expect, it } from "vitest";
import { MANUAL_CASE_POLICIES, routeIdentifiers } from "./policies";

describe("manual case BFF policy", () => {
  it("uses JSON, exact backend paths, read capability, and approved query keys", () => {
    expect(MANUAL_CASE_POLICIES.list.requiredCapability)
      .toEqual({ resource: "charge-manual-cases", action: "read" });
    expect(MANUAL_CASE_POLICIES.list.backendAccept).toBe("application/json");
    expect(MANUAL_CASE_POLICIES.list.queryKeys).toEqual([
      "status", "reasonCode", "bookingRef", "openedFrom", "openedTo", "page", "size"
    ]);
    expect(MANUAL_CASE_POLICIES.list.backendPath({ query: new URLSearchParams("status=OPEN") }))
      .toBe("/api/manual-pricing-cases?status=OPEN");
    expect(MANUAL_CASE_POLICIES.detail.backendPath({
      identifiers: routeIdentifiers({ caseId: "case-1" as never })
    }))
      .toBe("/api/manual-pricing-cases/case-1");
  });
});
