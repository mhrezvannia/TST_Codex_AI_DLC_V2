package com.linercore.platform.containermovement.applicationservice.query;

import com.linercore.platform.containermovement.domain.outbox.OutboxStatus;
import java.time.Instant;

public record OutboxStatusQuery(
        String eventId,
        String journeyId,
        OutboxStatus status,
        Instant from,
        Instant to,
        int limit) {
    public int boundedLimit() {
        return Math.max(1, Math.min(limit, 100));
    }
}
