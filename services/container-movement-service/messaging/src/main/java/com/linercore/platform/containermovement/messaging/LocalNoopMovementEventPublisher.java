package com.linercore.platform.containermovement.messaging;

import com.linercore.platform.containermovement.applicationservice.port.EventPublicationException;
import com.linercore.platform.containermovement.applicationservice.port.MovementEventPublisherPort;
import com.linercore.platform.containermovement.domain.outbox.BrokerMetadata;
import com.linercore.platform.containermovement.domain.outbox.MovementStatusEvent;
import com.linercore.platform.messaging.LocalNoopMarker;

public class LocalNoopMovementEventPublisher implements MovementEventPublisherPort, LocalNoopMarker {
    @Override
    public BrokerMetadata publish(MovementStatusEvent event) {
        throw new EventPublicationException("LOCAL_NOOP_PUBLISHER",
                "local-noop profile does not publish to Kafka", true);
    }
}
