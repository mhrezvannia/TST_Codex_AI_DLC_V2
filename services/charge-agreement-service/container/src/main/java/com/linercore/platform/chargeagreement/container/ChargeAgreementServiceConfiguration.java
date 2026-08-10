package com.linercore.platform.chargeagreement.container;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.ChargeAgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementEventPublisherPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.applicationservice.port.ManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.OutboxRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcAgreementRepository;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcOutboxRepository;
import com.linercore.platform.chargeagreement.dataaccess.jdbc.JdbcPricingRequestRepository;
import com.linercore.platform.chargeagreement.dataaccess.inmemory.UuidIdGenerator;
import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class ChargeAgreementServiceConfiguration {
    @Bean
    AgreementRepository agreementRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcAgreementRepository(jdbc, mapper);
    }

    @Bean
    ManualPricingCaseRepository manualPricingCaseRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcManualPricingCaseRepository(jdbc, mapper);
    }

    @Bean
    PricingRequestRepository pricingRequestRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcPricingRequestRepository(jdbc, mapper);
    }

    @Bean
    OutboxRepository chargeAgreementOutboxRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new JdbcOutboxRepository(jdbc, mapper);
    }

    @Bean
    AuthorizationPort chargeAgreementAuthorizationPort() {
        return (subjectId, resource, action, correlationId) -> subjectId != null && !subjectId.isBlank();
    }

    @Bean
    ReferenceValidationPort chargeAgreementReferenceValidationPort() {
        return request -> request.referenceIds().stream()
                .filter(referenceId -> referenceId == null || referenceId.isBlank())
                .map(referenceId -> "reference id is required")
                .toList();
    }

    @Bean
    IdGenerator chargeAgreementIdGenerator() {
        return new UuidIdGenerator();
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
            PricingRequestRepository pricingRequestRepository) {
        return new ChargeAgreementApplicationService(repository, authorization, referenceValidation, idGenerator,
                Clock.systemUTC(), outbox, eventPublisher, schemaRegistry, manualPricingCaseRepository,
                pricingRequestRepository);
    }
}
