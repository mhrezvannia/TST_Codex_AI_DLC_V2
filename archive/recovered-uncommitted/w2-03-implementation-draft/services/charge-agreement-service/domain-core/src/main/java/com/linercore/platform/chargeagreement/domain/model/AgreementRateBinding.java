package com.linercore.platform.chargeagreement.domain.model;

import java.util.List;

public record AgreementRateBinding(
        AgreementId agreementId,
        long agreementVersion,
        List<String> rateVersionIds) {

    public AgreementRateBinding {
        if (agreementId == null || agreementVersion < 1) {
            throw new IllegalArgumentException("agreement id and positive version are required");
        }
        rateVersionIds = List.copyOf(rateVersionIds == null ? List.of() : rateVersionIds);
        if (rateVersionIds.isEmpty() || rateVersionIds.stream().anyMatch(id -> id == null || id.isBlank())) {
            throw new IllegalArgumentException("at least one rate version id is required");
        }
        if (rateVersionIds.stream().distinct().count() != rateVersionIds.size()) {
            throw new IllegalArgumentException("rate version bindings must be unique");
        }
    }
}
