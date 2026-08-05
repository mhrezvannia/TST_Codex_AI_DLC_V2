package com.linercore.platform.chargeagreement.applicationservice.command;

import com.linercore.platform.chargeagreement.domain.model.ChargeCategory;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateRateCommand(
        ChargeCategory category,
        String chargeCodeId,
        String tradeLaneId,
        String equipmentTypeId,
        String locationId,
        BigDecimal amount,
        String currencyId,
        LocalDate validFrom,
        LocalDate validTo,
        String actorSubjectId,
        String correlationId) {
}
