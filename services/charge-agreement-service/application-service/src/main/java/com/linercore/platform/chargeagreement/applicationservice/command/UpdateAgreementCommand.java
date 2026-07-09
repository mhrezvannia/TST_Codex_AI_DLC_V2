package com.linercore.platform.chargeagreement.applicationservice.command;

import java.time.LocalDate;
import java.util.List;

public record UpdateAgreementCommand(
        String agreementNumber,
        String customerId,
        String tradeLaneId,
        String commodityId,
        LocalDate validFrom,
        LocalDate validTo,
        List<ChargeTermCommand> terms,
        String actorSubjectId,
        String reason,
        String correlationId) {
    public UpdateAgreementCommand {
        terms = terms == null ? List.of() : List.copyOf(terms);
    }
}
