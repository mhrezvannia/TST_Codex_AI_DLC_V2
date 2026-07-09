package com.linercore.platform.chargeagreement.domain.model;

import java.time.Instant;

public record ManualPricingCase(
        String caseId,
        String pricingRequestId,
        String reasonCode,
        String correlationId,
        Instant openedAt) {
}
