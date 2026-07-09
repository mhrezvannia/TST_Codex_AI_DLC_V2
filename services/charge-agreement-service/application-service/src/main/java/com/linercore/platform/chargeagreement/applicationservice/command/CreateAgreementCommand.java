package com.linercore.platform.chargeagreement.applicationservice.command;

import java.time.LocalDate;

public record CreateAgreementCommand(
        String agreementNumber,
        String customerId,
        String tradeLaneId,
        String commodityId,
        LocalDate validFrom,
        LocalDate validTo,
        String actorSubjectId,
        String reason,
        String correlationId) {
}
