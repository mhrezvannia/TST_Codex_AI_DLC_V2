package com.linercore.platform.referencedata.container;

import com.linercore.platform.messaging.LocalNoopMarker;
import com.linercore.platform.messaging.NoopMessagingGuard;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.applicationservice.port.SchemaRegistryPort;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/** Fails startup if a no-op messaging adapter is active outside the local profile. */
@Component
public class ReferenceDataNoopMessagingGuard implements ApplicationRunner {
    private final Environment environment;
    private final ReferenceEventPublisherPort publisher;
    private final SchemaRegistryPort schemaRegistry;

    public ReferenceDataNoopMessagingGuard(
            Environment environment,
            ReferenceEventPublisherPort publisher,
            SchemaRegistryPort schemaRegistry) {
        this.environment = environment;
        this.publisher = publisher;
        this.schemaRegistry = schemaRegistry;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean noopActive = publisher instanceof LocalNoopMarker || schemaRegistry instanceof LocalNoopMarker;
        NoopMessagingGuard.assertNoopAllowed(environment, noopActive);
    }
}
