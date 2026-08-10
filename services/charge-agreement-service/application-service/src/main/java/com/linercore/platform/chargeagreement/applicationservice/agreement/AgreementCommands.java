package com.linercore.platform.chargeagreement.applicationservice.agreement;

import java.time.LocalDate;

public final class AgreementCommands {
    private AgreementCommands() {
    }

    public record Commercial(
            String customerId,
            String tradeLaneId,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId,
            LocalDate validFrom,
            LocalDate validTo,
            String baseRateVersionId,
            String surchargeRateVersionId,
            String localRateVersionId) {
    }

    public record Create(
            String agreementNumber,
            Commercial commercial,
            String reason,
            String subjectId,
            String correlationId) {
    }

    public record UpdateDraft(
            String agreementId,
            String agreementVersionId,
            long expectedRowVersion,
            Commercial commercial,
            String reason,
            String subjectId,
            String correlationId) {
    }

    public record CreateSuccessor(
            String agreementId,
            String sourceAgreementVersionId,
            Commercial commercial,
            String reason,
            String subjectId,
            String correlationId) {
    }

    public record Approve(
            String agreementId,
            String agreementVersionId,
            long expectedRowVersion,
            String reason,
            String subjectId,
            String correlationId) {
    }

    public record Transition(
            String agreementId,
            String agreementVersionId,
            long expectedRowVersion,
            String reason,
            String subjectId,
            String correlationId) {
    }
}
