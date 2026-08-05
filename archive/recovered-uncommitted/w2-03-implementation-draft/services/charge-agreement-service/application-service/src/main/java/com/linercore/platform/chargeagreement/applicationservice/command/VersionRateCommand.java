package com.linercore.platform.chargeagreement.applicationservice.command;

import java.math.BigDecimal;
import java.time.LocalDate;

public record VersionRateCommand(
        int expectedVersion,
        BigDecimal amount,
        String currencyId,
        LocalDate validFrom,
        LocalDate validTo,
        String actorSubjectId,
        String correlationId) {
}
