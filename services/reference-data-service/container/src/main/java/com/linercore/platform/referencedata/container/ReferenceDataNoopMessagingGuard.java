package com.linercore.platform.referencedata.container;

import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.referencedata.messaging.LocalNoopMessagingAdapter;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

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

    public void run(ApplicationArguments args) {
        boolean noopActive = publisher instanceof LocalNoopMessagingAdapter
                || schemaRegistry instanceof LocalNoopMessagingAdapter;
        if (!noopActive) {
            return;
        }
        Set<String> profiles = Arrays.stream(environment.getActiveProfiles()).collect(Collectors.toSet());
        if (!profiles.contains("local")) {
            throw new IllegalStateException("local-noop messaging adapters are only allowed with the local profile");
        }
    }
}
