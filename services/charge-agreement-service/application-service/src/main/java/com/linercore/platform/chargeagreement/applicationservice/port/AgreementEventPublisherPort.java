package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.applicationservice.query.AgreementFact;

public interface AgreementEventPublisherPort {
    void publish(AgreementFact fact);
}
