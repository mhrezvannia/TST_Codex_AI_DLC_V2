package com.linercore.platform.chargeagreement.domain.agreement;

import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public record Agreement(
        AgreementId id,
        AgreementNumber number,
        AgreementAuthorityModel authorityModel,
        List<AgreementVersion> versions) {

    public Agreement {
        Objects.requireNonNull(id, "agreement id is required");
        Objects.requireNonNull(number, "agreement number is required");
        Objects.requireNonNull(authorityModel, "authority model is required");
        if (versions == null || versions.isEmpty()) {
            throw new IllegalArgumentException("an Agreement must contain at least one version");
        }
        versions = List.copyOf(versions);
        if (versions.stream().anyMatch(version -> !version.agreementId().equals(id)
                || version.authorityModel() != authorityModel)) {
            throw new IllegalArgumentException("every version must belong to the stable Agreement model");
        }
        if (versions.stream().filter(version -> version.lifecycle() == AgreementLifecycle.DRAFT).count() > 1) {
            throw new IllegalArgumentException("an Agreement may have at most one Draft");
        }
    }

    public static Agreement firstDraft(
            AgreementId agreementId,
            AgreementNumber agreementNumber,
            AgreementVersionId versionId,
            ReferenceId customerId,
            ReferenceId tradeLaneId,
            ReferenceId originId,
            ReferenceId destinationId,
            ReferenceId equipmentId,
            AgreementValidity validity,
            List<AgreementRateLink> links,
            String actor,
            Instant at,
            String correlation) {
        AgreementVersion version = new AgreementVersion(
                versionId, agreementId, 1, AgreementAuthorityModel.W2_VERSIONED,
                AgreementLifecycle.DRAFT, customerId, tradeLaneId, originId, destinationId,
                equipmentId, null, validity, links, 0, null, actor, at,
                null, null, null, null, correlation);
        return new Agreement(agreementId, agreementNumber, AgreementAuthorityModel.W2_VERSIONED, List.of(version));
    }

    public AgreementVersion draft() {
        return versions.stream()
                .filter(version -> version.lifecycle() == AgreementLifecycle.DRAFT)
                .findFirst()
                .orElse(null);
    }

    public AgreementVersion latestVersion() {
        return versions.stream().max(Comparator.comparingLong(AgreementVersion::versionNo)).orElseThrow();
    }
}
