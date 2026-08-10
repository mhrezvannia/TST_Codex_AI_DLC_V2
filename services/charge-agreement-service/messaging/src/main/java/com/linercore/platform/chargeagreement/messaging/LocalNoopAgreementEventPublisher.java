package com.linercore.platform.chargeagreement.messaging;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementEventPublisherPort;
import com.linercore.platform.chargeagreement.applicationservice.port.EventPublicationException;
import com.linercore.platform.chargeagreement.domain.outbox.AgreementOutboxEvent;
import com.linercore.platform.chargeagreement.domain.outbox.BrokerMetadata;
import com.linercore.platform.messaging.LocalNoopMarker;

public class LocalNoopAgreementEventPublisher implements AgreementEventPublisherPort, LocalNoopMarker {
    @Override
    public BrokerMetadata publish(AgreementOutboxEvent event) {
        throw new EventPublicationException("LOCAL_NOOP_PUBLISHER",
                "local-noop profile does not publish to Kafka", true);
    }
}
