package com.linercore.platform.referencedata.messaging;

import com.linercore.platform.referencedata.applicationservice.port.EventPublicationException;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.domain.outbox.BrokerMetadata;
import com.linercore.platform.referencedata.domain.outbox.ReferenceEventEnvelope;
import java.util.Map;

public class LocalNoopReferenceEventPublisher implements ReferenceEventPublisherPort, LocalNoopMessagingAdapter {
    public BrokerMetadata publish(ReferenceEventEnvelope envelope, Map<String, String> payload) {
        throw new EventPublicationException("LOCAL_NOOP_PUBLISHER",
                "local-noop profile does not publish to Kafka", true);
    }
}
