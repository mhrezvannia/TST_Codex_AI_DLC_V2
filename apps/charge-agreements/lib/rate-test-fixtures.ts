import type { RateCategory, RateDetail, RateListItem, RatePage, RateVersion } from "./rates";

export function rateVersion(overrides: Partial<RateVersion> = {}): RateVersion {
  return {
    versionId: "rate-version-1",
    versionNo: 1,
    lifecycle: "DRAFT",
    presentationState: "DRAFT",
    basis: "PER_CONTAINER",
    currencyId: "currency-usd",
    currency: "USD",
    unitRate: "125.50",
    effectiveFrom: "2026-07-01",
    effectiveTo: "2026-12-31",
    originLocationId: "location-origin",
    destinationLocationId: "location-destination",
    equipmentTypeId: "equipment-40hc",
    rowVersion: 0,
    sourceVersionId: null,
    createdBy: "pricing-user",
    createdAt: "2026-07-26T00:00:00.000Z",
    updatedBy: null,
    updatedAt: null,
    approvedBy: null,
    approvedAt: null,
    correlationId: "corr-rate-1",
    ...overrides
  };
}

export function rateDetail(
  category: RateCategory = "BASE",
  version: RateVersion = rateVersion(),
  overrides: Partial<RateDetail> = {}
): RateDetail {
  const code = { BASE: "OFR" as const, SURCHARGE: "BAF" as const, LOCAL: "THC" as const }[category];
  return {
    rateId: `rate-${category.toLowerCase()}`,
    category,
    chargeCodeId: `charge-code-${code.toLowerCase()}`,
    chargeCode: code,
    versions: [version],
    activities: [{
      activityId: "activity-1",
      versionId: version.versionId,
      versionNo: version.versionNo,
      action: "RATE_CREATED",
      actorSubjectId: "pricing-user",
      occurredAt: "2026-07-26T00:00:00.000Z",
      correlationId: "corr-rate-1",
      reason: null,
      resultingRowVersion: version.rowVersion
    }],
    actions: { canEdit: true, canApprove: true, canCreateSuccessor: false },
    evaluatedAsOf: "2026-07-26",
    ...overrides
  };
}

export function rateListItem(detail = rateDetail()): RateListItem {
  const latest = detail.versions[0];
  return {
    rateId: detail.rateId,
    category: detail.category,
    chargeCodeId: detail.chargeCodeId,
    chargeCode: detail.chargeCode,
    latestVersion: latest,
    selectedSummaryVersion: latest,
    effectiveApprovedVersion: latest.lifecycle === "APPROVED" ? latest : null,
    hasDraft: latest.lifecycle === "DRAFT",
    versionCount: detail.versions.length,
    actions: detail.actions,
    evaluatedAsOf: detail.evaluatedAsOf
  };
}

export function ratePage(items: RateListItem[] = [rateListItem()]): RatePage {
  return {
    items,
    page: 0,
    size: 25,
    total: items.length,
    hasMore: false,
    canCreate: true,
    evaluatedAsOf: "2026-07-26"
  };
}
