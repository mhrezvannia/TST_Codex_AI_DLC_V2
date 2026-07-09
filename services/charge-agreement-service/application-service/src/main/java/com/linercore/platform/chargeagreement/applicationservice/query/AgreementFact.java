package com.linercore.platform.chargeagreement.applicationservice.query;

import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementStatus;
import java.time.Instant;

public record AgreementFact(
        String eventId,
        String eventType,
        AgreementId agreementId,
        AgreementStatus status,
        long version,
        Instant occurredAt,
        String correlationId) {
}
