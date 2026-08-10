package com.linercore.platform.booking.container;

import com.linercore.platform.booking.applicationservice.port.BookingEventPublisherPort;
import com.linercore.platform.booking.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.messaging.LocalNoopMarker;
import com.linercore.platform.messaging.NoopMessagingGuard;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class BookingNoopMessagingGuard implements ApplicationRunner {
    private final Environment environment;
    private final BookingEventPublisherPort publisher;
    private final SchemaRegistryPort schemaRegistry;

    public BookingNoopMessagingGuard(
            Environment environment,
            BookingEventPublisherPort publisher,
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
