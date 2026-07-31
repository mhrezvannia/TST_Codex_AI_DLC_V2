package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.agreement.Agreement;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementId;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersionId;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

public interface W2AgreementRepository {
    void create(Agreement agreement, AgreementActivity activity);

    Agreement updateDraft(Agreement stable, AgreementVersion revisedVersion, AgreementActivity activity);

    Agreement createSuccessor(
            Agreement stable,
            AgreementVersion source,
            AgreementVersion successor,
            AgreementActivity activity);

    Agreement approveUnderLock(
            Agreement stable,
            AgreementVersion draft,
            long expectedRowVersion,
            ApprovalValidation validation,
            String actor,
            java.time.Instant at,
            String correlationId,
            String activityId,
            String reason);

    Agreement transitionLifecycle(
            Agreement stable,
            AgreementVersion transitionedVersion,
            AgreementActivity activity);

    Optional<Agreement> findById(AgreementId agreementId);

    default List<AgreementVersion> findApprovedPricingCandidates(PricingCandidateQuery query) {
        throw new UnsupportedOperationException("agreement pricing candidate lookup is unavailable");
    }

    default Optional<AgreementVersion> findApprovedPricingVersion(AgreementVersionId versionId) {
        throw new UnsupportedOperationException("exact approved agreement version lookup is unavailable");
    }

    record PricingCandidateQuery(
            String customerId,
            String tradeLaneId,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId,
            LocalDate requestedDepartureDate) {
        public PricingCandidateQuery {
            customerId = required(customerId, "customer id");
            tradeLaneId = required(tradeLaneId, "trade lane id");
            originLocationId = required(originLocationId, "origin location id");
            destinationLocationId = required(destinationLocationId, "destination location id");
            equipmentTypeId = required(equipmentTypeId, "equipment type id");
            Objects.requireNonNull(requestedDepartureDate, "requested departure date is required");
        }
    }

    @FunctionalInterface
    interface ApprovalValidation {
        void validate(AgreementVersion lockedDraft);
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value;
    }
}
