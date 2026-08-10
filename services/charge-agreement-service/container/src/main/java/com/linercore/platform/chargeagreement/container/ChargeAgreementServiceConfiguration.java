package com.linercore.platform.chargeagreement.container;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.ChargeAgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementEventPublisherPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAdminReadRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRateVersionPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.applicationservice.port.LegacyPricingRequestRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.ManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.OutboxRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.ReferenceValidationRequest;
import com.linercore.platform.chargeagreement.applicationservice.port.RateAuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.RateReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.RateRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.chargeagreement.applicationservice.port.W2AgreementRepository;
import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.rate.RateApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.pricing.ManualPricingCaseQueryService;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingAuthorityResolver;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingAuthoritySnapshotPort;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingRequestCanonicalizer;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingTerminalRenderer;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingTelemetry;
import com.linercore.platform.chargeagreement.container.integration.HttpRateAuthorizationAdapter;
import com.linercore.platform.chargeagreement.container.integration.HttpRateReferenceValidationAdapter;
import com.linercore.platform.chargeagreement.container.integration.HttpAgreementAuthorizationAdapter;
import com.linercore.platform.chargeagreement.container.integration.HttpAgreementReferenceValidationAdapter;
import com.linercore.platform.chargeagreement.container.integration.LocalAgreementAuthorizationAdapter;
import com.linercore.platform.chargeagreement.container.integration.LocalRateAuthorizationAdapter;
import com.linercore.platform.chargeagreement.container.security.ChargeSubjectAssertionFilter;
import com.linercore.platform.chargeagreement.container.security.ChargeSubjectAssertionReplayCache;
import com.linercore.platform.chargeagreement.container.security.ChargeSubjectAssertionVerifier;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcAgreementRepository;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcAgreementAdminReadRepository;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcAgreementRateVersionAdapter;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcW2AgreementRepository;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcOutboxRepository;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcPricingRequestRepository;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcPricingAuthoritySnapshotAdapter;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcRateRepository;
import com.linercore.platform.chargeagreement.dataaccess.inmemory.UuidIdGenerator;
import com.linercore.platform.chargeagreement.domain.pricing.PricingCalculator;
import com.linercore.platform.chargeagreement.container.api.JacksonPricingTerminalRenderer;
import java.time.Clock;
import java.nio.charset.StandardCharsets;
import io.micrometer.core.instrument.MeterRegistry;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration
public class ChargeAgreementServiceConfiguration {
    @Bean
    FlywayMigrationStrategy chargeFlywayMigrationStrategy(DataSource dataSource) {
        return new ChargeFlywayMigrationStrategy(dataSource);
    }

    @Bean
    AgreementRepository agreementRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcAgreementRepository(jdbc, mapper);
    }

    @Bean
    ManualPricingCaseRepository manualPricingCaseRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcManualPricingCaseRepository(jdbc, mapper);
    }

    @Bean
    JdbcPricingRequestRepository pricingRequestRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcPricingRequestRepository(jdbc, mapper);
    }

    @Bean
    ManualPricingCaseQueryService manualPricingCaseQueryService(
            AuthorizationPort authorization,
            ManualPricingCaseRepository repository,
            PricingTelemetry telemetry) {
        return new ManualPricingCaseQueryService(authorization, repository, telemetry);
    }

    @Bean
    PricingTelemetry pricingTelemetry(MeterRegistry registry) {
        return new MicrometerPricingTelemetry(registry);
    }

    @Bean
    OutboxRepository chargeAgreementOutboxRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcOutboxRepository(jdbc, mapper);
    }

    @Bean
    AuthorizationPort chargeAgreementAuthorizationPort(
            @Qualifier("agreementAuthorizationPort") AgreementAuthorizationPort authorization) {
        return (subjectId, resource, action, correlationId) ->
                authorization.authorize(
                        subjectId,
                        "charge-agreement".equals(resource) ? "charge-agreements" : resource,
                        action,
                        correlationId)
                        == AgreementAuthorizationPort.Decision.ALLOW;
    }

    @Bean
    ReferenceValidationPort chargeAgreementReferenceValidationPort(
            AgreementReferenceValidationPort references) {
        return request -> {
            java.util.List<AgreementReferenceValidationPort.Check> checks =
                    new java.util.ArrayList<>();
            java.util.List<String> values = request.referenceIds();
            for (int index = 0; index < values.size(); index++) {
                String set = switch (index) {
                    case 0 -> "PARTY_CUSTOMER";
                    case 1 -> "TRADE_LANE";
                    case 2 -> "COMMODITY";
                    default -> (index - 3) % 2 == 0 ? "CHARGE_CODE" : "CURRENCY";
                };
                checks.add(new AgreementReferenceValidationPort.Check(
                        "referenceIds[" + index + "]", set, values.get(index)));
            }
            try {
                return references.validate(new AgreementReferenceValidationPort.Request(
                                "legacy-reference-validation", checks))
                        .stream()
                        .map(value -> value.fieldPath() + ": " + value.reason())
                        .toList();
            } catch (RuntimeException exception) {
                return java.util.List.of("reference validation unavailable");
            }
        };
    }

    @Bean
    IdGenerator chargeAgreementIdGenerator() {
        return new UuidIdGenerator();
    }

    @Bean
    RateRepository rateRepository(JdbcTemplate jdbc, PlatformTransactionManager transactionManager) {
        return new JdbcRateRepository(jdbc, new TransactionTemplate(transactionManager));
    }

    @Bean
    RateServiceIdentityFilter rateServiceIdentityFilter(
            @Value("${charge-agreement.rate.inbound.service-id}") String serviceId,
            @Value("${charge-agreement.rate.inbound.service-token}") String serviceToken) {
        return new RateServiceIdentityFilter(serviceId, serviceToken);
    }

    @Bean
    PricingServiceIdentityFilter pricingServiceIdentityFilter(
            @Value("${charge-agreement.pricing.inbound.service-id}") String serviceId,
            @Value("${charge-agreement.pricing.inbound.service-token}") String serviceToken) {
        return new PricingServiceIdentityFilter(serviceId, serviceToken);
    }

    @Bean
    PricingAuthoritySnapshotPort pricingAuthoritySnapshotPort(
            W2AgreementRepository agreements,
            RateRepository rates,
            PlatformTransactionManager transactionManager) {
        return new JdbcPricingAuthoritySnapshotAdapter(
                agreements, rates, new TransactionTemplate(transactionManager));
    }

    @Bean
    PricingApplicationService pricingApplicationService(
            AuthorizationPort authorization,
            PricingRequestRepository receipts,
            PricingAuthoritySnapshotPort snapshots,
            ObjectMapper mapper,
            IdGenerator ids,
            PricingTelemetry telemetry) {
        PricingTerminalRenderer renderer = new JacksonPricingTerminalRenderer(mapper);
        return new PricingApplicationService(
                authorization,
                receipts,
                new PricingAuthorityResolver(snapshots),
                new PricingCalculator(),
                new PricingRequestCanonicalizer(),
                renderer,
                ids,
                Clock.systemUTC(),
                telemetry);
    }

    @Bean("rateAuthorizationPort")
    @ConditionalOnProperty(
            name = "charge-agreement.rate.authorization-mode",
            havingValue = "local-map")
    RateAuthorizationPort localRateAuthorizationPort() {
        return new LocalRateAuthorizationAdapter();
    }

    @Bean("rateAuthorizationPort")
    @ConditionalOnProperty(
            name = "charge-agreement.rate.authorization-mode",
            havingValue = "identity-http")
    RateAuthorizationPort httpRateAuthorizationPort(
            ObjectMapper mapper,
            @Value("${charge-agreement.rate.identity.base-url}") String baseUrl,
            @Value("${charge-agreement.rate.identity.service-id}") String serviceId,
            @Value("${charge-agreement.rate.identity.service-token}") String serviceToken) {
        return new HttpRateAuthorizationAdapter(baseUrl, serviceId, serviceToken, mapper);
    }

    @Bean
    RateReferenceValidationPort rateReferenceValidationPort(
            ObjectMapper mapper,
            @Value("${charge-agreement.rate.reference-data.base-url}") String baseUrl,
            @Value("${charge-agreement.rate.reference-data.service-id}") String serviceId,
            @Value("${charge-agreement.rate.reference-data.service-token}") String serviceToken) {
        return new HttpRateReferenceValidationAdapter(baseUrl, serviceId, serviceToken, mapper);
    }

    @Bean
    RateApplicationService rateApplicationService(
            RateRepository repository,
            @Qualifier("rateAuthorizationPort") RateAuthorizationPort authorization,
            RateReferenceValidationPort references,
            IdGenerator idGenerator) {
        return new RateApplicationService(repository, authorization, references, idGenerator, Clock.systemUTC());
    }

    @Bean
    W2AgreementRepository w2AgreementRepository(JdbcTemplate jdbc) {
        return new JdbcW2AgreementRepository(jdbc);
    }

    @Bean
    AgreementAdminReadRepository agreementAdminReadRepository(
            JdbcTemplate jdbc, W2AgreementRepository repository) {
        return new JdbcAgreementAdminReadRepository(jdbc, (JdbcW2AgreementRepository) repository);
    }

    @Bean
    AgreementRateVersionPort agreementRateVersionPort(JdbcTemplate jdbc) {
        return new JdbcAgreementRateVersionAdapter(new NamedParameterJdbcTemplate(jdbc));
    }

    @Bean("agreementAuthorizationPort")
    @Profile("local")
    AgreementAuthorizationPort localAgreementAuthorizationPort() {
        return new LocalAgreementAuthorizationAdapter();
    }

    @Bean("agreementAuthorizationPort")
    @Profile("!local")
    AgreementAuthorizationPort httpAgreementAuthorizationPort(
            ObjectMapper mapper,
            @Value("${charge-agreement.agreement.identity.base-url}") String baseUrl,
            @Value("${charge-agreement.agreement.identity.service-id}") String serviceId,
            @Value("${charge-agreement.agreement.identity.service-token}") String serviceToken) {
        return new HttpAgreementAuthorizationAdapter(baseUrl, serviceId, serviceToken, mapper);
    }

    @Bean
    AgreementReferenceValidationPort agreementReferenceValidationPort(
            ObjectMapper mapper,
            @Value("${charge-agreement.agreement.reference-data.base-url}") String baseUrl,
            @Value("${charge-agreement.agreement.reference-data.service-id}") String serviceId,
            @Value("${charge-agreement.agreement.reference-data.service-token}") String serviceToken) {
        return new HttpAgreementReferenceValidationAdapter(baseUrl, serviceId, serviceToken, mapper);
    }

    @Bean
    AgreementApplicationService w2AgreementApplicationService(
            W2AgreementRepository repository,
            AgreementAdminReadRepository reads,
            @Qualifier("agreementAuthorizationPort") AgreementAuthorizationPort authorization,
            AgreementReferenceValidationPort references,
            AgreementRateVersionPort rateVersions,
            OutboxRepository outbox,
            IdGenerator idGenerator) {
        return new AgreementApplicationService(
                repository, reads, authorization, references, rateVersions,
                outbox, idGenerator, Clock.systemUTC());
    }

    @Bean
    ChargeSubjectAssertionReplayCache chargeSubjectAssertionReplayCache(
            @Value("${charge-agreement.bff-assertion.replay-capacity:4096}") int replayCapacity) {
        return new ChargeSubjectAssertionReplayCache(replayCapacity);
    }

    @Bean
    ChargeSubjectAssertionVerifier chargeSubjectAssertionVerifier(
            @Value("${charge-agreement.bff-assertion.kid}") String kid,
            @Value("${charge-agreement.bff-assertion.secret}") String secret,
            ChargeSubjectAssertionReplayCache replayCache) {
        return new ChargeSubjectAssertionVerifier(
                kid, secret.getBytes(StandardCharsets.UTF_8), replayCache, Clock.systemUTC());
    }

    @Bean
    ChargeSubjectAssertionFilter chargeSubjectAssertionFilter(ChargeSubjectAssertionVerifier verifier) {
        return new ChargeSubjectAssertionFilter(verifier);
    }

    @Bean
    ChargeAgreementApplicationService chargeAgreementApplicationService(
            AgreementRepository repository,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            IdGenerator idGenerator,
            OutboxRepository outbox,
            AgreementEventPublisherPort eventPublisher,
            SchemaRegistryPort schemaRegistry,
            ManualPricingCaseRepository manualPricingCaseRepository,
            LegacyPricingRequestRepository pricingRequestRepository) {
        return new ChargeAgreementApplicationService(repository, authorization, referenceValidation, idGenerator,
                Clock.systemUTC(), outbox, eventPublisher, schemaRegistry, manualPricingCaseRepository,
                pricingRequestRepository);
    }
}
