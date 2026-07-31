import { AGREEMENT_POLICIES, MANUAL_CASE_POLICIES, RATE_POLICIES } from "./policies";
import { safeIdentifier } from "./request-validation";

describe("closed Charge route policies", () => {
  it("keeps Rate compatibility on JSON without subject assertion", () => {
    expect(RATE_POLICIES.list).toMatchObject({
      backendAccept: "application/json", assertionMode: "NONE"
    });
  });

  it("requires the vendor contract and assertion for Agreements", () => {
    expect(AGREEMENT_POLICIES.create).toMatchObject({
      backendAccept: "application/vnd.linercore.charge-agreement-v2+json",
      assertionMode: "SUBJECT_ASSERTION_V1"
    });
  });

  it("uses an independent manual evidence capability", () => {
    expect(MANUAL_CASE_POLICIES.list.requiredCapability)
      .toEqual({ resource: "charge-manual-cases", action: "read" });
  });

  it("constructs only literal backend paths", () => {
    const agreementId = safeIdentifier("agr-1");
    const versionId = safeIdentifier("av-2");
    expect(AGREEMENT_POLICIES.approve.backendPath({ identifiers: { agreementId, versionId } }))
      .toBe("/api/charge-agreements/agr-1/versions/av-2/approve");
    expect(AGREEMENT_POLICIES.successor.backendPath({ identifiers: { agreementId } }))
      .toBe("/api/charge-agreements/agr-1/versions");
  });
});
