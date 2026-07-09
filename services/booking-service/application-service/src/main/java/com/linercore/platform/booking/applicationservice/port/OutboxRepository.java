package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.outbox.BookingOutboxEvent;

public interface OutboxRepository {
    void enqueue(BookingOutboxEvent event);
}
