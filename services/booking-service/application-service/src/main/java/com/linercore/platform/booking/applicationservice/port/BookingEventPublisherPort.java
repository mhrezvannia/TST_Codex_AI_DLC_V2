package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.outbox.BookingOutboxEvent;
import com.linercore.platform.booking.domain.outbox.BrokerMetadata;

public interface BookingEventPublisherPort {
    BrokerMetadata publish(BookingOutboxEvent event);
}
