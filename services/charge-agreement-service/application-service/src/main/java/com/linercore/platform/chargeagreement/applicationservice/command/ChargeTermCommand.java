package com.linercore.platform.chargeagreement.applicationservice.command;

import com.linercore.platform.chargeagreement.domain.model.ChargeBasis;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ChargeTermCommand(
        String id,
        String chargeCodeId,
        ChargeBasis basis,
        BigDecimal amount,
        String currencyId,
        LocalDate validFrom,
        LocalDate validTo,
        String notes) {
}
