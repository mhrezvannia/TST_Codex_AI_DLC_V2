package com.linercore.platform.chargeagreement.container;

import com.linercore.platform.chargeagreement.applicationservice.ChargeAgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementEventPublisherPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.chargeagreement.dataaccess.inmemory.InMemoryAgreementRepository;
import com.linercore.platform.chargeagreement.dataaccess.inmemory.UuidIdGenerator;
import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChargeAgreementServiceConfiguration {
    @Bean
    AgreementRepository agreementRepository() {
        return new InMemoryAgreementRepository();
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
    AgreementEventPublisherPort chargeAgreementEventPublisherPort() {
        return fact -> {
        };
    }

    @Bean
    ChargeAgreementApplicationService chargeAgreementApplicationService(
            AgreementRepository repository,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            IdGenerator idGenerator,
            AgreementEventPublisherPort eventPublisher) {
        return new ChargeAgreementApplicationService(repository, authorization, referenceValidation, idGenerator,
                Clock.systemUTC(), eventPublisher);
    }
}
