package com.linercore.platform.referencedata.messaging;

import com.linercore.platform.messaging.LocalNoopMarker;
import com.linercore.platform.referencedata.applicationservice.port.EventPublicationException;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.domain.outbox.BrokerMetadata;
import com.linercore.platform.referencedata.domain.outbox.ReferenceEventEnvelope;
import java.util.Map;

/** Local-only no-op publisher: never publishes, and is rejected outside the local profile. */
public class LocalNoopReferenceEventPublisher implements ReferenceEventPublisherPort, LocalNoopMarker {
    @Override
    public BrokerMetadata publish(ReferenceEventEnvelope envelope, Map<String, String> payload) {
        throw new EventPublicationException("LOCAL_NOOP_PUBLISHER",
                "local-noop profile does not publish to Kafka", true);
    }
}
