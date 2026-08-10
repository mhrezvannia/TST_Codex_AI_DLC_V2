package com.linercore.platform.chargeagreement.domain.rate;

import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

public record Rate(
        RateId id,
        RateCategory category,
        ReferenceId chargeCodeId,
        String chargeCode,
        long nextVersionNo,
        String createdBy,
        Instant createdAt,
        String correlationId,
        List<RateVersion> versions) {

    public Rate {
        Objects.requireNonNull(id, "rate id is required");
        Objects.requireNonNull(category, "category is required");
        Objects.requireNonNull(chargeCodeId, "charge code id is required");
        category.requireChargeCode(chargeCode);
        if (nextVersionNo <= 0) {
            throw new IllegalArgumentException("next version number must be positive");
        }
        if (versions == null || versions.isEmpty()) {
            throw new IllegalArgumentException("a Rate must contain at least one version");
        }
        versions = List.copyOf(versions);
        long draftCount = versions.stream().filter(version -> version.lifecycle() == RateLifecycle.DRAFT).count();
        if (draftCount > 1) {
            throw new IllegalArgumentException("a Rate may have at most one Draft");
        }
    }

    public static Rate firstDraft(
            RateId rateId,
            RateVersionId versionId,
            RateCategory category,
            ReferenceId chargeCodeId,
            String chargeCode,
            RateMoney money,
            java.time.LocalDate effectiveFrom,
            java.time.LocalDate effectiveTo,
            RateApplicability applicability,
            String actor,
            Instant at,
            String correlation) {
        category.requireChargeCode(chargeCode);
        RateApplicability validated = RateApplicability.forCategory(
                category,
                applicability.originLocationId(),
                applicability.destinationLocationId(),
                applicability.equipmentTypeId());
        RateVersion version = new RateVersion(versionId, rateId, 1, RateLifecycle.DRAFT,
                RateBasis.PER_CONTAINER, money, effectiveFrom, effectiveTo, validated, 0, null,
                actor, at, null, null, null, null, correlation);
        return new Rate(rateId, category, chargeCodeId, chargeCode, 2, actor, at, correlation, List.of(version));
    }

    public RateVersion latestVersion() {
        return versions.stream()
                .max(java.util.Comparator.comparingLong(RateVersion::versionNo))
                .orElseThrow();
    }

    public RateVersion draft() {
        return versions.stream()
                .filter(version -> version.lifecycle() == RateLifecycle.DRAFT)
                .findFirst()
                .orElse(null);
    }
}
