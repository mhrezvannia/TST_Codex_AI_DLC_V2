package com.linercore.platform.referencedata.dataaccess.inmemory;

import com.linercore.platform.referencedata.applicationservice.port.OutboxRepository;
import com.linercore.platform.referencedata.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.referencedata.domain.outbox.EventPublicationStatusView;
import com.linercore.platform.referencedata.domain.outbox.OutboxEvent;
import com.linercore.platform.referencedata.domain.outbox.OutboxStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class InMemoryOutboxRepository implements OutboxRepository {
    private final Map<String, OutboxEvent> events = new LinkedHashMap<>();

    public synchronized void enqueue(OutboxEvent event) {
        events.putIfAbsent(event.eventId(), event);
    }

    public synchronized List<OutboxEvent> claimAvailable(String workerId, Instant now, int batchSize) {
        List<OutboxEvent> claimed = new ArrayList<>();
        for (OutboxEvent event : events.values()) {
            if (claimed.size() >= batchSize) {
                break;
            }
            if (claimable(event, now)) {
                OutboxEvent next = event.claim(workerId, now);
                events.put(next.eventId(), next);
                claimed.add(next);
            }
        }
        return List.copyOf(claimed);
    }

    public synchronized void save(OutboxEvent event) {
        events.put(event.eventId(), event);
    }

    public synchronized Optional<OutboxEvent> findByEventId(String eventId) {
        return Optional.ofNullable(events.get(eventId));
    }

    public synchronized List<EventPublicationStatusView> findStatuses(OutboxStatusQuery query) {
        return events.values().stream()
                .filter(event -> query.eventId() == null || event.eventId().equals(query.eventId()))
                .filter(event -> query.recordId() == null || event.entityId().equals(query.recordId()))
                .filter(event -> query.referenceSet() == null || event.referenceSet() == query.referenceSet())
                .filter(event -> query.status() == null || event.status() == query.status())
                .filter(event -> query.from() == null || !event.occurredAt().isBefore(query.from()))
                .filter(event -> query.to() == null || !event.occurredAt().isAfter(query.to()))
                .limit(query.boundedLimit())
                .map(this::statusView)
                .toList();
    }

    private boolean claimable(OutboxEvent event, Instant now) {
        if (event.status() == OutboxStatus.PENDING) {
            return true;
        }
        return event.status() == OutboxStatus.RETRYABLE
                && (event.nextAttemptAt() == null || !event.nextAttemptAt().isAfter(now));
    }

    private EventPublicationStatusView statusView(OutboxEvent event) {
        String brokerMetadata = event.payload().containsKey("offset")
                ? event.payload().get("topic") + ":" + event.payload().get("partition") + ":" + event.payload().get("offset")
                : null;
        String lastError = event.lastErrorCode() == null ? null : event.lastErrorCode() + ": " + event.lastErrorMessage();
        Instant publishedAt = event.payload().containsKey("publishedAt") ? Instant.parse(event.payload().get("publishedAt")) : null;
        return new EventPublicationStatusView(event.eventId(), event.entityId(), event.referenceSet(), event.operation().name(),
                event.status(), event.attemptCount(), event.claimedAt(), publishedAt, brokerMetadata, lastError, event.correlationId());
    }
}
