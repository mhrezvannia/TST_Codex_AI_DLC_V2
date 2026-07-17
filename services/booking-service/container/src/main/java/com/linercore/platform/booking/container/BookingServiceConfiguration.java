package com.linercore.platform.booking.container;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.booking.applicationservice.BookingApplicationService;
import com.linercore.platform.booking.applicationservice.BookingValidationStateService;
import com.linercore.platform.booking.applicationservice.port.AuditRepository;
import com.linercore.platform.booking.applicationservice.port.AuthorizationPort;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.DndPricingPort;
import com.linercore.platform.booking.applicationservice.port.IdGenerator;
import com.linercore.platform.booking.applicationservice.port.IdempotencyRepository;
import com.linercore.platform.booking.applicationservice.port.MovementStatusProjectionRepository;
import com.linercore.platform.booking.applicationservice.port.OutboxRepository;
import com.linercore.platform.booking.applicationservice.port.PricingPort;
import com.linercore.platform.booking.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.booking.applicationservice.port.BookingEventPublisherPort;
import com.linercore.platform.booking.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingPortAdapter;
import com.linercore.platform.booking.container.integration.HttpChargePricingClient;
import com.linercore.platform.booking.container.integration.HttpReferenceValidationAdapter;
import com.linercore.platform.booking.container.integration.HttpReferenceOptionAdapter;
import com.linercore.platform.booking.dataaccess.jdbc.JdbcAuditRepository;
import com.linercore.platform.booking.dataaccess.jdbc.JdbcBookingRepository;
import com.linercore.platform.booking.dataaccess.jdbc.JdbcIdempotencyRepository;
import com.linercore.platform.booking.dataaccess.jdbc.JdbcMovementStatusProjectionRepository;
import com.linercore.platform.booking.dataaccess.jdbc.JdbcOutboxRepository;
import java.time.Clock;
import java.time.Duration;
import java.net.http.HttpClient;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Semaphore;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.Primary;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.ApplicationRunner;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestTemplate;

@Configuration
public class BookingServiceConfiguration {
    @Bean
    FlywayMigrationStrategy bookingFlywayMigrationStrategy(DataSource dataSource) {
        return new BookingFlywayMigrationStrategy(dataSource);
    }

    @Bean
    @Profile("local")
    BookingLocalIdentityFilter bookingLocalIdentityFilter(
            @Value("${booking.security.service-token}") String serviceToken) {
        return new BookingLocalIdentityFilter(serviceToken);
    }

    @Bean
    @Profile("!local")
    ApplicationRunner bookingNonLocalIdentityGuard() {
        return arguments -> {
            throw new IllegalStateException("Non-local Booking identity requires W2-01 JWT/TLS configuration");
        };
    }

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
    MovementStatusProjectionRepository bookingMovementStatusProjectionRepository(JdbcTemplate jdbc) {
        return new JdbcMovementStatusProjectionRepository(jdbc);
    }

    @Bean
    AuthorizationPort bookingAuthorizationPort() {
        return new BookingLocalAuthorization();
    }

    @Bean
    @Primary
    RestTemplate bookingRestTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }

    @Bean("bookingReferenceRestTemplate")
    RestTemplate bookingReferenceRestTemplate() {
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(500)).build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(client);
        requestFactory.setReadTimeout(Duration.ofMillis(1500));
        return new RestTemplate(requestFactory);
    }

    @Bean(name = "bookingReferenceValidationExecutor", destroyMethod = "shutdownGracefully")
    BookingReferenceValidationExecutor bookingReferenceValidationExecutor() {
        return new BookingReferenceValidationExecutor();
    }

    @Bean("bookingReferenceOutboundPermits")
    Semaphore bookingReferenceOutboundPermits() {
        return new Semaphore(10, true);
    }

    @Bean
    BookingValidationStateService bookingValidationStateService(
            BookingRepository bookings,
            AuditRepository audit) {
        return new BookingValidationStateService(bookings, audit, Clock.systemUTC());
    }

    @Bean
    ReferenceValidationPort bookingReferenceValidationPort(
            @Qualifier("bookingReferenceRestTemplate") RestTemplate restTemplate,
            @Qualifier("bookingReferenceValidationExecutor") ExecutorService executor,
            @Qualifier("bookingReferenceOutboundPermits") Semaphore permits,
            @Value("${booking.reference-data-service-url}") String referenceDataServiceUrl,
            @Value("${booking.reference-data.service-id}") String serviceId,
            @Value("${booking.reference-data.service-token}") String serviceToken) {
        return new HttpReferenceValidationAdapter(restTemplate, referenceDataServiceUrl, serviceId, serviceToken,
                executor, permits, Clock.systemUTC(), Duration.ofSeconds(2));
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
            MovementStatusProjectionRepository movementStatusProjections,
            IdGenerator ids,
            BookingEventPublisherPort eventPublisher,
            SchemaRegistryPort schemaRegistry,
            BookingValidationStateService validationState) {
        return new BookingApplicationService(bookings, idempotency, authorization, referenceValidation, pricing,
                dndPricing, audit, outbox, movementStatusProjections, ids, Clock.systemUTC(), eventPublisher,
                schemaRegistry, validationState);
    }

    @Bean
    HttpReferenceOptionAdapter bookingReferenceOptionAdapter(
            @Qualifier("bookingReferenceRestTemplate") RestTemplate restTemplate,
            @Value("${booking.reference-data-service-url}") String referenceDataServiceUrl,
            @Value("${booking.reference-data.service-id}") String serviceId,
            @Value("${booking.reference-data.service-token}") String serviceToken) {
        return new HttpReferenceOptionAdapter(restTemplate, referenceDataServiceUrl, serviceId, serviceToken);
    }
}
