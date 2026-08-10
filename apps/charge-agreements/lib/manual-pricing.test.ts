import { describe, expect, it } from "vitest";
import {
  canonicalManualSearchParams,
  manualCaseSchema,
  manualReasonSchema
} from "./manual-pricing";

describe("manual pricing evidence contract", () => {
  it("maps one-based browser paging to bounded zero-based service paging", () => {
    const input = new URLSearchParams(
      "page=3&size=999&status=CLOSED&reasonCode=NO_RATE&bookingRef=BK-1&unknown=drop"
    );
    expect(canonicalManualSearchParams(input).toString())
      .toBe("status=OPEN&reasonCode=NO_RATE&bookingRef=BK-1&page=2&size=25");
  });

  it("accepts only the five terminal manual reasons", () => {
    expect(manualReasonSchema.safeParse("AMBIGUOUS_LOCAL_RATE").success).toBe(true);
    expect(manualReasonSchema.safeParse("TRANSIENT_FAILURE").success).toBe(false);
  });

  it("rejects commercial or workflow fields from the safe view model", () => {
    const evidence = {
      caseId: "case-1",
      pricingRequestId: "BK-1:0",
      reasonCode: "NO_RATE",
      status: "OPEN",
      bookingRef: null,
      amendmentSeq: null,
      requestHash: null,
      correlationId: null,
      openedAt: null,
      requestContext: null,
      legacyEvidence: true,
      amount: 125,
      approvalAction: "/approve"
    };
    expect(manualCaseSchema.safeParse(evidence).success).toBe(false);
  });
});
