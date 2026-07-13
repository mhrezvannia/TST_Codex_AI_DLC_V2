package com.linercore.platform.referencedata.container;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.referencedata.application.identity.IdentityAuthorizationClient;
import com.linercore.platform.referencedata.applicationservice.ReferenceDataApplicationService;
import com.linercore.platform.referencedata.applicationservice.port.AuthorizationClientPort;
import com.linercore.platform.referencedata.applicationservice.port.IdGenerator;
import com.linercore.platform.referencedata.applicationservice.port.OutboxRepository;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceChangeRepository;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceRepository;
import com.linercore.platform.referencedata.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.referencedata.dataaccess.jdbc.JdbcReferenceChangeRepository;
import com.linercore.platform.referencedata.dataaccess.jdbc.JdbcOutboxRepository;
import com.linercore.platform.referencedata.dataaccess.jdbc.JdbcReferenceRepository;
import com.linercore.platform.referencedata.dataaccess.inmemory.UuidIdGenerator;
import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class ReferenceDataServiceConfiguration {
    @Bean
    ReferenceRepository referenceRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcReferenceRepository(jdbc, mapper);
    }

    @Bean
    ReferenceChangeRepository referenceChangeRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcReferenceChangeRepository(jdbc, mapper);
    }

    @Bean
    OutboxRepository outboxRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcOutboxRepository(jdbc, mapper);
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
