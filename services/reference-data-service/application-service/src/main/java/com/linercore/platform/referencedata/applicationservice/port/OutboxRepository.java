package com.linercore.platform.referencedata.applicationservice.port;

import com.linercore.platform.referencedata.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.referencedata.domain.outbox.EventPublicationStatusView;
import com.linercore.platform.referencedata.domain.outbox.OutboxEvent;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OutboxRepository {
    void enqueue(OutboxEvent event);

    List<OutboxEvent> claimAvailable(String workerId, Instant now, int batchSize);

    void save(OutboxEvent event);

    Optional<OutboxEvent> findByEventId(String eventId);

    List<EventPublicationStatusView> findStatuses(OutboxStatusQuery query);
}
