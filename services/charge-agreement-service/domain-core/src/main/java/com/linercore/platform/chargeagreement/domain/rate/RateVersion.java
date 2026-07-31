package com.linercore.platform.chargeagreement.domain.rate;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

public record RateVersion(
        RateVersionId id,
        RateId rateId,
        long versionNo,
        RateLifecycle lifecycle,
        RateBasis basis,
        RateMoney money,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        RateApplicability applicability,
        long rowVersion,
        RateVersionId sourceVersionId,
        String createdBy,
        Instant createdAt,
        String updatedBy,
        Instant updatedAt,
        String approvedBy,
        Instant approvedAt,
        String correlationId) {

    public RateVersion {
        Objects.requireNonNull(id, "version id is required");
        Objects.requireNonNull(rateId, "rate id is required");
        if (versionNo <= 0 || rowVersion < 0) {
            throw new IllegalArgumentException("version values are invalid");
        }
        Objects.requireNonNull(lifecycle, "lifecycle is required");
        Objects.requireNonNull(basis, "basis is required");
        Objects.requireNonNull(money, "money is required");
        Objects.requireNonNull(effectiveFrom, "effective from is required");
        Objects.requireNonNull(effectiveTo, "effective to is required");
        if (effectiveTo.isBefore(effectiveFrom)) {
            throw new IllegalArgumentException("effective to must be on or after effective from");
        }
        Objects.requireNonNull(applicability, "applicability is required");
        requireText(createdBy, "created by");
        Objects.requireNonNull(createdAt, "created at is required");
        requireText(correlationId, "correlation id");
        if (lifecycle == RateLifecycle.APPROVED && (approvedBy == null || approvedAt == null)) {
            throw new IllegalArgumentException("approval evidence is required for an Approved version");
        }
    }

    public RateVersion reviseDraft(
            RateMoney revisedMoney,
            LocalDate revisedFrom,
            LocalDate revisedTo,
            RateApplicability revisedApplicability,
            long expectedRowVersion,
            String actor,
            Instant at,
            String correlation) {
        requireDraft();
        requireExpectedVersion(expectedRowVersion);
        return new RateVersion(id, rateId, versionNo, lifecycle, basis, revisedMoney, revisedFrom, revisedTo,
                revisedApplicability, rowVersion + 1, sourceVersionId, createdBy, createdAt, actor, at,
                null, null, correlation);
    }

    public RateVersion approve(long expectedRowVersion, String actor, Instant at, String correlation) {
        requireDraft();
        requireExpectedVersion(expectedRowVersion);
        return new RateVersion(id, rateId, versionNo, RateLifecycle.APPROVED, basis, money, effectiveFrom,
                effectiveTo, applicability, rowVersion + 1, sourceVersionId, createdBy, createdAt, updatedBy,
                updatedAt, actor, at, correlation);
    }

    public RatePresentationState presentationState(LocalDate asOf) {
        Objects.requireNonNull(asOf, "evaluation date is required");
        if (lifecycle == RateLifecycle.DRAFT) {
            return RatePresentationState.DRAFT;
        }
        if (asOf.isBefore(effectiveFrom)) {
            return RatePresentationState.SCHEDULED;
        }
        if (asOf.isAfter(effectiveTo)) {
            return RatePresentationState.EXPIRED;
        }
        return RatePresentationState.EFFECTIVE;
    }

    private void requireDraft() {
        if (lifecycle != RateLifecycle.DRAFT) {
            throw new IllegalStateException("Approved rate versions are immutable");
        }
    }

    private void requireExpectedVersion(long expectedRowVersion) {
        if (expectedRowVersion != rowVersion) {
            throw new IllegalStateException("rate version conflict");
        }
    }

    private static void requireText(String value, String field) {
        if (value == null || value.isBlank() || value.length() > 128) {
            throw new IllegalArgumentException(field + " is required and must not exceed 128 characters");
        }
    }
}
