package com.linercore.platform.containermovement.container;

import com.linercore.platform.containermovement.applicationservice.port.MovementEventPublisherPort;
import com.linercore.platform.containermovement.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.messaging.LocalNoopMarker;
import com.linercore.platform.messaging.NoopMessagingGuard;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ContainerMovementNoopMessagingGuard implements ApplicationRunner {
    private final Environment environment;
    private final MovementEventPublisherPort publisher;
    private final SchemaRegistryPort schemaRegistry;

    public ContainerMovementNoopMessagingGuard(
            Environment environment,
            MovementEventPublisherPort publisher,
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
