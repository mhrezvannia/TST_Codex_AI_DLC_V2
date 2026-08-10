package com.linercore.platform.chargeagreement.container;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementEventPublisherPort;
import com.linercore.platform.chargeagreement.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.messaging.LocalNoopMarker;
import com.linercore.platform.messaging.NoopMessagingGuard;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ChargeAgreementNoopMessagingGuard implements ApplicationRunner {
    private final Environment environment;
    private final AgreementEventPublisherPort publisher;
    private final SchemaRegistryPort schemaRegistry;

    public ChargeAgreementNoopMessagingGuard(
            Environment environment,
            AgreementEventPublisherPort publisher,
            SchemaRegistryPort schemaRegistry) {
        this.environment = environment;
        this.publisher = publisher;
        this.schemaRegistry = schemaRegistry;
    }

    @Override
    public void run(ApplicationArguments args) {
        NoopMessagingGuard.assertNoopAllowed(environment,
                publisher instanceof LocalNoopMarker || schemaRegistry instanceof LocalNoopMarker);
    }
}
