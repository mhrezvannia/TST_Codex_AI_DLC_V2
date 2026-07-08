package com.linercore.platform.referencedata.container;

import com.linercore.platform.referencedata.application.identity.IdentityAuthorizationClient;
import com.linercore.platform.referencedata.applicationservice.ReferenceDataApplicationService;
import com.linercore.platform.referencedata.applicationservice.port.AuthorizationClientPort;
import com.linercore.platform.referencedata.applicationservice.port.IdGenerator;
import com.linercore.platform.referencedata.applicationservice.port.OutboxRepository;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceChangeRepository;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceRepository;
import com.linercore.platform.referencedata.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.referencedata.dataaccess.inmemory.InMemoryReferenceChangeRepository;
import com.linercore.platform.referencedata.dataaccess.inmemory.InMemoryOutboxRepository;
import com.linercore.platform.referencedata.dataaccess.inmemory.InMemoryReferenceRepository;
import com.linercore.platform.referencedata.dataaccess.inmemory.UuidIdGenerator;
import com.linercore.platform.referencedata.messaging.PlaceholderKafkaReferenceEventPublisher;
import com.linercore.platform.referencedata.messaging.PlaceholderSchemaRegistryAdapter;
import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ReferenceDataServiceConfiguration {
    @Bean
    ReferenceRepository referenceRepository() {
        return new InMemoryReferenceRepository();
    }

    @Bean
    ReferenceChangeRepository referenceChangeRepository() {
        return new InMemoryReferenceChangeRepository();
    }

    @Bean
    OutboxRepository outboxRepository() {
        return new InMemoryOutboxRepository();
    }

    @Bean
    ReferenceEventPublisherPort referenceEventPublisherPort() {
        return new PlaceholderKafkaReferenceEventPublisher(Clock.systemUTC());
    }

    @Bean
    SchemaRegistryPort schemaRegistryPort() {
        return new PlaceholderSchemaRegistryAdapter();
    }

    @Bean
    AuthorizationClientPort authorizationClientPort() {
        return new IdentityAuthorizationClient();
    }

    @Bean
    IdGenerator referenceIdGenerator() {
        return new UuidIdGenerator();
    }

    @Bean
    ReferenceDataApplicationService referenceDataApplicationService(
            ReferenceRepository referenceRepository,
            ReferenceChangeRepository changeRepository,
            AuthorizationClientPort authorizationClient,
            IdGenerator idGenerator,
            OutboxRepository outboxRepository,
            ReferenceEventPublisherPort publisher,
            SchemaRegistryPort schemaRegistry) {
        return new ReferenceDataApplicationService(referenceRepository, changeRepository, authorizationClient, idGenerator,
                Clock.systemUTC(), outboxRepository, publisher, schemaRegistry);
    }
}
