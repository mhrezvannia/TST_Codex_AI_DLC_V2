package com.linercore.platform.booking.messaging;

import com.linercore.platform.booking.applicationservice.port.BookingEventPublisherPort;
import com.linercore.platform.booking.applicationservice.port.EventPublicationException;
import com.linercore.platform.booking.domain.outbox.BookingOutboxEvent;
import com.linercore.platform.booking.domain.outbox.BrokerMetadata;
import com.linercore.platform.messaging.LocalNoopMarker;

public class LocalNoopBookingEventPublisher implements BookingEventPublisherPort, LocalNoopMarker {
    @Override
    public BrokerMetadata publish(BookingOutboxEvent event) {
        throw new EventPublicationException("LOCAL_NOOP_PUBLISHER",
                "local-noop profile does not publish to Kafka", true);
    }
}
