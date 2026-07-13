package com.linercore.platform.booking.container;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.booking.applicationservice.BookingApplicationService;
import com.linercore.platform.booking.applicationservice.port.AuditRepository;
import com.linercore.platform.booking.applicationservice.port.AuthorizationPort;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.DndPricingPort;
import com.linercore.platform.booking.applicationservice.port.IdGenerator;
import com.linercore.platform.booking.applicationservice.port.IdempotencyRepository;
import com.linercore.platform.booking.applicationservice.port.OutboxRepository;
import com.linercore.platform.booking.applicationservice.port.PricingPort;
import com.linercore.platform.booking.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.booking.applicationservice.port.BookingEventPublisherPort;
import com.linercore.platform.booking.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingPortAdapter;
import com.linercore.platform.booking.container.integration.HttpChargePricingClient;
import com.linercore.platform.booking.container.integration.HttpContainerMovementClient;
import com.linercore.platform.booking.container.integration.HttpReferenceValidationAdapter;
import com.linercore.platform.booking.dataaccess.jdbc.JdbcAuditRepository;
import com.linercore.platform.booking.dataaccess.jdbc.JdbcBookingRepository;
import com.linercore.platform.booking.dataaccess.jdbc.JdbcIdempotencyRepository;
import com.linercore.platform.booking.dataaccess.jdbc.JdbcOutboxRepository;
import java.time.Clock;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestTemplate;

@Configuration
public class BookingServiceConfiguration {
    @Bean
    BookingRepository bookingRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcBookingRepository(jdbc, mapper);
    }

    @Bean
    IdempotencyRepository bookingIdempotencyRepository(JdbcTemplate jdbc) {
        return new JdbcIdempotencyRepository(jdbc);
    }

    @Bean
    AuditRepository bookingAuditRepository(JdbcTemplate jdbc) {
        return new JdbcAuditRepository(jdbc);
    }

    @Bean
    OutboxRepository bookingOutboxRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcOutboxRepository(jdbc, mapper);
    }

    @Bean
    AuthorizationPort bookingAuthorizationPort() {
        return (subjectId, resource, action, correlationId) -> subjectId != null && !subjectId.isBlank();
    }

    @Bean
    RestTemplate bookingRestTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }

    @Bean
    ReferenceValidationPort bookingReferenceValidationPort(
            RestTemplate restTemplate,
            @Value("${booking.reference-data-service-url}") String referenceDataServiceUrl) {
        return new HttpReferenceValidationAdapter(restTemplate, referenceDataServiceUrl);
    }

    @Bean
    PricingPort bookingPricingPort(
            RestTemplate restTemplate,
            @Value("${booking.charge-agreement-service-url}") String chargeAgreementServiceUrl) {
        return new ChargePricingPortAdapter(new HttpChargePricingClient(restTemplate, chargeAgreementServiceUrl),
                Clock.systemUTC());
    }

    @Bean
    DndPricingPort bookingDndPricingPort() {
        return (booking, idempotencyKey, correlationId) -> {
            throw new IllegalStateException("dnd pricing is not implemented in the local container yet");
        };
    }

    @Bean
    HttpContainerMovementClient bookingContainerMovementClient(
            RestTemplate restTemplate,
            @Value("${booking.container-movement-service-url}") String containerMovementServiceUrl) {
        return new HttpContainerMovementClient(restTemplate, containerMovementServiceUrl);
    }

    @Bean
    IdGenerator bookingIdGenerator() {
        return () -> UUID.randomUUID().toString();
    }

    @Bean
    BookingApplicationService bookingApplicationService(
            BookingRepository bookings,
            IdempotencyRepository idempotency,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            PricingPort pricing,
            DndPricingPort dndPricing,
            AuditRepository audit,
            OutboxRepository outbox,
            IdGenerator ids,
            BookingEventPublisherPort eventPublisher,
            SchemaRegistryPort schemaRegistry) {
        return new BookingApplicationService(bookings, idempotency, authorization, referenceValidation, pricing,
                dndPricing, audit, outbox, ids, Clock.systemUTC(), eventPublisher, schemaRegistry);
    }
}
