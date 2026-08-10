package com.linercore.platform.booking.applicationservice.query;

import com.linercore.platform.booking.domain.outbox.OutboxStatus;
import java.time.Instant;

public record OutboxStatusQuery(
        String eventId,
        String bookingId,
        OutboxStatus status,
        Instant from,
        Instant to,
        int limit) {
    public int boundedLimit() {
        return Math.max(1, Math.min(limit, 100));
    }
}
