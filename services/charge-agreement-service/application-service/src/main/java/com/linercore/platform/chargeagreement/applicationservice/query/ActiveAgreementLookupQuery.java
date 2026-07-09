package com.linercore.platform.chargeagreement.applicationservice.query;

import java.time.LocalDate;

public record ActiveAgreementLookupQuery(
        String customerId,
        String tradeLaneId,
        String originLocationId,
        String destinationLocationId,
        String commodityId,
        LocalDate effectiveDate,
        String actorSubjectId,
        String correlationId) {
}
