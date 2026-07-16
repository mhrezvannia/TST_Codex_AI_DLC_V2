package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.chargeagreement.domain.outbox.AgreementOutboxEvent;
import com.linercore.platform.chargeagreement.domain.outbox.EventPublicationStatusView;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@FunctionalInterface
public interface OutboxRepository {
    void enqueue(AgreementOutboxEvent event);

    default List<AgreementOutboxEvent> claimAvailable(String workerId, Instant now, int batchSize) {
        throw new UnsupportedOperationException("outbox claiming is not implemented");
    }

    default void save(AgreementOutboxEvent event) {
        throw new UnsupportedOperationException("outbox lifecycle persistence is not implemented");
    }

    default Optional<AgreementOutboxEvent> findByEventId(String eventId) {
        return Optional.empty();
    }

    default List<EventPublicationStatusView> findStatuses(OutboxStatusQuery query) {
        return List.of();
    }
}
