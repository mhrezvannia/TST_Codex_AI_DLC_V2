package com.linercore.platform.containermovement.applicationservice.port;

import com.linercore.platform.containermovement.domain.outbox.MovementStatusEvent;
import com.linercore.platform.containermovement.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.containermovement.domain.outbox.EventPublicationStatusView;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OutboxRepository {
    void enqueue(MovementStatusEvent event);

    default List<MovementStatusEvent> claimAvailable(String workerId, Instant now, int batchSize) {
        throw new UnsupportedOperationException("outbox claiming is not implemented");
    }

    default void save(MovementStatusEvent event) {
        throw new UnsupportedOperationException("outbox lifecycle persistence is not implemented");
    }

    default Optional<MovementStatusEvent> findByEventId(String eventId) {
        return Optional.empty();
    }

    default List<EventPublicationStatusView> findStatuses(OutboxStatusQuery query) {
        return List.of();
    }
}
