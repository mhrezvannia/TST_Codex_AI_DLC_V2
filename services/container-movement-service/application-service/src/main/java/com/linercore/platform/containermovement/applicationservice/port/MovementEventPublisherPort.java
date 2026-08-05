package com.linercore.platform.containermovement.applicationservice.port;

import com.linercore.platform.containermovement.domain.outbox.BrokerMetadata;
import com.linercore.platform.containermovement.domain.outbox.MovementStatusEvent;

public interface MovementEventPublisherPort {
    BrokerMetadata publish(MovementStatusEvent event);
}
