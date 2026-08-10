package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.outbox.BookingOutboxEvent;
import com.linercore.platform.booking.domain.outbox.EventPublicationStatusView;
import com.linercore.platform.booking.applicationservice.query.OutboxStatusQuery;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OutboxRepository {
    void enqueue(BookingOutboxEvent event);

    default List<BookingOutboxEvent> claimAvailable(String workerId, Instant now, int batchSize) {
        throw new UnsupportedOperationException("outbox claiming is not implemented");
    }

    default void save(BookingOutboxEvent event) {
        throw new UnsupportedOperationException("outbox lifecycle persistence is not implemented");
    }

    default Optional<BookingOutboxEvent> findByEventId(String eventId) {
        return Optional.empty();
    }

    default List<EventPublicationStatusView> findStatuses(OutboxStatusQuery query) {
        return List.of();
    }
}
