package com.linercore.platform.containermovement.container;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.containermovement.applicationservice.ContainerMovementApplicationService;
import com.linercore.platform.containermovement.applicationservice.port.AuditRepository;
import com.linercore.platform.containermovement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.containermovement.applicationservice.port.IdGenerator;
import com.linercore.platform.containermovement.applicationservice.port.IdempotencyRepository;
import com.linercore.platform.containermovement.applicationservice.port.JourneyRepository;
import com.linercore.platform.containermovement.applicationservice.port.OutboxRepository;
import com.linercore.platform.containermovement.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.containermovement.applicationservice.port.MovementEventPublisherPort;
import com.linercore.platform.containermovement.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.containermovement.container.integration.HttpLocationValidationAdapter;
import com.linercore.platform.containermovement.dataaccess.jdbc.JdbcAuditRepository;
import com.linercore.platform.containermovement.dataaccess.jdbc.JdbcIdempotencyRepository;
import com.linercore.platform.containermovement.dataaccess.jdbc.JdbcJourneyRepository;
import com.linercore.platform.containermovement.dataaccess.jdbc.JdbcOutboxRepository;
import java.time.Clock;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ContainerMovementServiceConfiguration {
    @Bean
    JourneyRepository journeyRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcJourneyRepository(jdbc, mapper);
    }

    @Bean
    IdempotencyRepository containerMovementIdempotencyRepository(JdbcTemplate jdbc) {
        return new JdbcIdempotencyRepository(jdbc);
    }

    @Bean
    AuditRepository containerMovementAuditRepository(JdbcTemplate jdbc) {
        return new JdbcAuditRepository(jdbc);
    }

    @Bean
    OutboxRepository containerMovementOutboxRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcOutboxRepository(jdbc, mapper);
    }

    @Bean
    AuthorizationPort containerMovementAuthorizationPort() {
        return (subjectId, resource, action, correlationId) -> subjectId != null && !subjectId.isBlank();
    }

    @Bean
    RestTemplate containerMovementRestTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }

    @Bean
    ReferenceValidationPort containerMovementReferenceValidationPort(
            RestTemplate restTemplate,
            @Value("${container-movement.reference-data-service-url}") String referenceDataServiceUrl,
            @Value("${container-movement.reference-data-service-token:}") String referenceDataServiceToken) {
        return new HttpLocationValidationAdapter(restTemplate, referenceDataServiceUrl, referenceDataServiceToken);
    }

    @Bean
    IdGenerator containerMovementIdGenerator() {
        return () -> UUID.randomUUID().toString();
    }

    @Bean
    ContainerMovementApplicationService containerMovementApplicationService(
            JourneyRepository journeys,
            IdempotencyRepository idempotency,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            AuditRepository audit,
            OutboxRepository outbox,
            IdGenerator ids,
            MovementEventPublisherPort eventPublisher,
            SchemaRegistryPort schemaRegistry) {
        return new ContainerMovementApplicationService(journeys, idempotency, authorization, referenceValidation,
                audit, outbox, ids, Clock.systemUTC(), eventPublisher, schemaRegistry);
    }
}
