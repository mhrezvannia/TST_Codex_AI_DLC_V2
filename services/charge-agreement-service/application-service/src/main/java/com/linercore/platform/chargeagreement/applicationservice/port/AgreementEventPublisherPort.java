package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.outbox.AgreementOutboxEvent;
import com.linercore.platform.chargeagreement.domain.outbox.BrokerMetadata;

public interface AgreementEventPublisherPort {
    BrokerMetadata publish(AgreementOutboxEvent event);
}
