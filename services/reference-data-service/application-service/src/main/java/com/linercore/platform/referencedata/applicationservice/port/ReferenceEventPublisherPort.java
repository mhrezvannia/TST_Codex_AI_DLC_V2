package com.linercore.platform.referencedata.applicationservice.port;

import com.linercore.platform.referencedata.domain.outbox.BrokerMetadata;
import com.linercore.platform.referencedata.domain.outbox.ReferenceEventEnvelope;
import java.util.Map;

public interface ReferenceEventPublisherPort {
    BrokerMetadata publish(ReferenceEventEnvelope envelope, Map<String, String> payload);
}
