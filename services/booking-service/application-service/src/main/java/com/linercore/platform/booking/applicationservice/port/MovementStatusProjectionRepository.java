package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.applicationservice.event.MovementStatusReceivedEvent;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface MovementStatusProjectionRepository {
    boolean insertReceipt(MovementStatusReceivedEvent event, Instant consumedAt);

    ProjectionUpsertResult upsert(MovementStatusProjection projection);

    void markReceiptDisposition(String eventId, ConsumedEventDisposition disposition);

    Optional<MovementStatusProjection> findLatest(String bookingRef, String containerRef);

    List<MovementStatusProjection> findByBookingRef(String bookingRef);
}
