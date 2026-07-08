package com.linercore.platform.referencedata.applicationservice.query;

import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import com.linercore.platform.referencedata.domain.outbox.OutboxStatus;
import java.time.Instant;

public record OutboxStatusQuery(
        String eventId,
        String recordId,
        ReferenceSet referenceSet,
        OutboxStatus status,
        Instant from,
        Instant to,
        int limit) {
    public int boundedLimit() {
        return Math.max(1, Math.min(limit <= 0 ? 100 : limit, 500));
    }
}
