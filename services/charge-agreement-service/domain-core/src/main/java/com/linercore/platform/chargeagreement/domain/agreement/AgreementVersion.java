package com.linercore.platform.chargeagreement.domain.agreement;

import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import java.time.Instant;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public record AgreementVersion(
        AgreementVersionId id,
        AgreementId agreementId,
        long versionNo,
        AgreementAuthorityModel authorityModel,
        AgreementLifecycle lifecycle,
        ReferenceId customerId,
        ReferenceId tradeLaneId,
        ReferenceId originLocationId,
        ReferenceId destinationLocationId,
        ReferenceId equipmentTypeId,
        ReferenceId commodityId,
        AgreementValidity validity,
        List<AgreementRateLink> links,
        long rowVersion,
        AgreementVersionId sourceVersionId,
        String createdBy,
        Instant createdAt,
        String updatedBy,
        Instant updatedAt,
        String approvedBy,
        Instant approvedAt,
        String correlationId) {

    public AgreementVersion {
        Objects.requireNonNull(id, "agreement version id is required");
        Objects.requireNonNull(agreementId, "agreement id is required");
        if (versionNo <= 0 || rowVersion < 0) {
            throw new IllegalArgumentException("version values are invalid");
        }
        Objects.requireNonNull(authorityModel, "authority model is required");
        Objects.requireNonNull(lifecycle, "lifecycle is required");
        Objects.requireNonNull(customerId, "customer id is required");
        Objects.requireNonNull(tradeLaneId, "trade lane id is required");
        Objects.requireNonNull(validity, "validity is required");
        AgreementActivity.requireText(createdBy, "created by", 128);
        Objects.requireNonNull(createdAt, "created at is required");
        AgreementActivity.requireText(correlationId, "correlation id", 128);
        links = links == null ? List.of() : List.copyOf(links);

        if (authorityModel == AgreementAuthorityModel.W2_VERSIONED) {
            requireW2Shape(originLocationId, destinationLocationId, equipmentTypeId, commodityId, links);
            if (lifecycle == AgreementLifecycle.LEGACY) {
                throw new IllegalArgumentException("W2 versions cannot use LEGACY lifecycle");
            }
        } else {
            if (lifecycle != AgreementLifecycle.LEGACY || !links.isEmpty()) {
                throw new IllegalArgumentException("LEGACY versions are history-only and cannot contain W2 links");
            }
        }
        if (lifecycle == AgreementLifecycle.APPROVED && (approvedBy == null || approvedAt == null)) {
            throw new IllegalArgumentException("approval evidence is required for an Approved version");
        }
    }

    public AgreementVersion reviseDraft(
            ReferenceId revisedCustomerId,
            ReferenceId revisedTradeLaneId,
            ReferenceId revisedOriginId,
            ReferenceId revisedDestinationId,
            ReferenceId revisedEquipmentId,
            AgreementValidity revisedValidity,
            List<AgreementRateLink> revisedLinks,
            long expectedRowVersion,
            String actor,
            Instant at,
            String correlation) {
        requireDraft();
        requireExpectedVersion(expectedRowVersion);
        return new AgreementVersion(id, agreementId, versionNo, authorityModel, lifecycle,
                revisedCustomerId, revisedTradeLaneId, revisedOriginId, revisedDestinationId,
                revisedEquipmentId, null, revisedValidity, revisedLinks, rowVersion + 1,
                sourceVersionId, createdBy, createdAt, actor, at, null, null, correlation);
    }

    public AgreementVersion approve(
            long expectedRowVersion,
            String actor,
            Instant at,
            String correlation) {
        requireDraft();
        requireExpectedVersion(expectedRowVersion);
        return new AgreementVersion(id, agreementId, versionNo, authorityModel, AgreementLifecycle.APPROVED,
                customerId, tradeLaneId, originLocationId, destinationLocationId, equipmentTypeId,
                null, validity, links, rowVersion + 1, sourceVersionId, createdBy, createdAt,
                updatedBy, updatedAt, actor, at, correlation);
    }

    public AgreementVersion successor(
            AgreementVersionId successorId,
            long successorVersionNo,
            String actor,
            Instant at,
            String correlation) {
        if (lifecycle != AgreementLifecycle.APPROVED || authorityModel != AgreementAuthorityModel.W2_VERSIONED) {
            throw new IllegalStateException("only an Approved W2 version may seed a successor");
        }
        return new AgreementVersion(successorId, agreementId, successorVersionNo, authorityModel,
                AgreementLifecycle.DRAFT, customerId, tradeLaneId, originLocationId,
                destinationLocationId, equipmentTypeId, null, validity, links, 0, id,
                actor, at, null, null, null, null, correlation);
    }

    public AgreementVersion suspend(long expectedRowVersion, String actor, Instant at, String correlation) {
        return terminalTransition(AgreementLifecycle.SUSPENDED, expectedRowVersion, actor, at, correlation);
    }

    public AgreementVersion expire(long expectedRowVersion, String actor, Instant at, String correlation) {
        return terminalTransition(AgreementLifecycle.EXPIRED, expectedRowVersion, actor, at, correlation);
    }

    public Map<RateCategory, AgreementRateLink> linksByCategory() {
        EnumMap<RateCategory, AgreementRateLink> result = new EnumMap<>(RateCategory.class);
        links.forEach(link -> result.put(link.category(), link));
        return Map.copyOf(result);
    }

    public String approvalKey() {
        return "agreement:v1|"
                + part(customerId.value()) + "|"
                + part(tradeLaneId.value()) + "|"
                + part(originLocationId.value()) + "|"
                + part(destinationLocationId.value()) + "|"
                + part(equipmentTypeId.value());
    }

    private AgreementVersion terminalTransition(
            AgreementLifecycle target,
            long expectedRowVersion,
            String actor,
            Instant at,
            String correlation) {
        if (lifecycle != AgreementLifecycle.APPROVED) {
            throw new IllegalStateException("only an Approved agreement version may transition");
        }
        requireExpectedVersion(expectedRowVersion);
        return new AgreementVersion(id, agreementId, versionNo, authorityModel, target,
                customerId, tradeLaneId, originLocationId, destinationLocationId,
                equipmentTypeId, null, validity, links, rowVersion + 1, sourceVersionId,
                createdBy, createdAt, actor, at, approvedBy, approvedAt, correlation);
    }

    private void requireDraft() {
        if (lifecycle != AgreementLifecycle.DRAFT) {
            throw new IllegalStateException("only Draft agreement commercial fields may change");
        }
    }

    private void requireExpectedVersion(long expectedRowVersion) {
        if (expectedRowVersion != rowVersion) {
            throw new IllegalStateException("agreement version conflict");
        }
    }

    private static void requireW2Shape(
            ReferenceId origin,
            ReferenceId destination,
            ReferenceId equipment,
            ReferenceId commodity,
            List<AgreementRateLink> links) {
        Objects.requireNonNull(origin, "origin location id is required");
        Objects.requireNonNull(destination, "destination location id is required");
        Objects.requireNonNull(equipment, "equipment type id is required");
        if (origin.equals(destination)) {
            throw new IllegalArgumentException("origin and destination must differ");
        }
        if (commodity != null) {
            throw new IllegalArgumentException("commodity is not a W2 Agreement discriminator");
        }
        if (links.size() != RateCategory.values().length) {
            throw new IllegalArgumentException("a W2 Agreement version requires exactly three rate links");
        }
        Set<RateCategory> categories = links.stream().map(AgreementRateLink::category).collect(Collectors.toSet());
        Set<?> ids = links.stream().map(AgreementRateLink::rateVersionId).collect(Collectors.toSet());
        if (!categories.equals(Set.of(RateCategory.BASE, RateCategory.SURCHARGE, RateCategory.LOCAL))
                || ids.size() != links.size()) {
            throw new IllegalArgumentException("Agreement links must be distinct BASE, SURCHARGE, and LOCAL versions");
        }
    }

    private static String part(String value) {
        return value.length() + ":" + value;
    }
}
