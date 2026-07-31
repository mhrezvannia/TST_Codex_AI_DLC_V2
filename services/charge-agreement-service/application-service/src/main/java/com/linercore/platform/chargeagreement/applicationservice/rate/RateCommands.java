package com.linercore.platform.chargeagreement.applicationservice.rate;

import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import java.math.BigDecimal;
import java.time.LocalDate;

public final class RateCommands {
    private RateCommands() {
    }

    public record Create(
            RateCategory category,
            String chargeCodeId,
            String chargeCode,
            BigDecimal unitRate,
            String currencyId,
            String currencyCode,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId,
            String subjectId,
            String correlationId) {
    }

    public record UpdateDraft(
            String rateId,
            String versionId,
            long expectedRowVersion,
            BigDecimal unitRate,
            String currencyId,
            String currencyCode,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId,
            String subjectId,
            String correlationId) {
    }

    public record Approve(
            String rateId,
            String versionId,
            long expectedRowVersion,
            String subjectId,
            String correlationId) {
    }

    public record CreateSuccessor(
            String rateId,
            String sourceVersionId,
            BigDecimal unitRate,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId,
            String subjectId,
            String correlationId) {
    }
}
