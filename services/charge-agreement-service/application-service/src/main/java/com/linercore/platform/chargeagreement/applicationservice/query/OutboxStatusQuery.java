package com.linercore.platform.chargeagreement.applicationservice.query;

import com.linercore.platform.chargeagreement.domain.outbox.OutboxStatus;
import java.time.Instant;

public record OutboxStatusQuery(
        String eventId,
        String agreementId,
        OutboxStatus status,
        Instant from,
        Instant to,
        int limit) {
    public int boundedLimit() {
        return Math.max(1, Math.min(limit, 100));
    }
}
