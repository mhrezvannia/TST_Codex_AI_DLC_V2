package com.linercore.platform.referencedata.messaging;

import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.domain.outbox.BrokerMetadata;
import com.linercore.platform.referencedata.domain.outbox.ReferenceEventEnvelope;
import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

public class PlaceholderKafkaReferenceEventPublisher implements ReferenceEventPublisherPort {
    private final AtomicLong offsets = new AtomicLong();
    private final Clock clock;

    public PlaceholderKafkaReferenceEventPublisher(Clock clock) {
        this.clock = clock;
    }

    public BrokerMetadata publish(ReferenceEventEnvelope envelope, Map<String, String> payload) {
        return new BrokerMetadata("referencedata.events", 0, offsets.getAndIncrement(), Instant.now(clock));
    }
}
