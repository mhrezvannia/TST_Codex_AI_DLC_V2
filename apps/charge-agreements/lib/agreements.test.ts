import {
  agreementCommercialSchema,
  agreementFormSchema,
  agreementPageSchema,
  agreementVersionSchema,
  canonicalAgreementSearchParams
} from "./agreements";

const commercial = {
  customerId: "customer-1", tradeLaneId: "lane-1", originLocationId: "origin-1",
  destinationLocationId: "destination-1", equipmentTypeId: "equipment-1",
  validFrom: "2026-08-01", validTo: "2026-08-31",
  baseRateVersionId: "base-1", surchargeRateVersionId: "surcharge-1", localRateVersionId: "local-1"
};

describe("Agreement schemas", () => {
  it("accepts the complete three-link form", () => {
    expect(agreementFormSchema.parse({ agreementNumber: "AGR-1", commercial, reason: "" }).commercial).toEqual(commercial);
  });

  it("rejects duplicate RateVersion identities and inverted dates", () => {
    expect(agreementCommercialSchema.safeParse({ ...commercial, localRateVersionId: "base-1" }).success).toBe(false);
    expect(agreementCommercialSchema.safeParse({ ...commercial, validTo: "2026-07-31" }).success).toBe(false);
  });

  it("rejects origin equal to destination", () => {
    expect(agreementCommercialSchema.safeParse({ ...commercial, destinationLocationId: "origin-1" }).success).toBe(false);
  });

  it("requires exact W2 category links", () => {
    const base = {
      agreementVersionId: "version-1", versionNo: 1, lifecycle: "DRAFT", rowVersion: 0,
      sourceAgreementVersionId: null, customerId: "customer-1", tradeLaneId: "lane-1",
      originLocationId: "origin-1", destinationLocationId: "destination-1", equipmentTypeId: "equipment-1",
      commodityId: null, validFrom: "2026-08-01", validTo: "2026-08-31",
      rateLinks: [{ category: "BASE", rateVersionId: "base-1" }],
      createdBy: "subject", createdAt: "2026-07-28T00:00:00Z", updatedBy: null, updatedAt: null,
      approvedBy: null, approvedAt: null, correlationId: "corr-1"
    };
    expect(agreementVersionSchema.safeParse(base).success).toBe(false);
  });

  it("rejects unknown response fields", () => {
    expect(agreementPageSchema.safeParse({ items: [], page: 0, size: 25, total: 0, hasMore: false, canCreate: true, surprise: true }).success).toBe(false);
  });

  it("canonicalizes browser one-based paging to service zero-based paging", () => {
    const query = canonicalAgreementSearchParams(new URLSearchParams("customerId=c-1&page=3&size=500&ignored=x"));
    expect(query.toString()).toBe("customerId=c-1&page=2&size=100");
  });
});
