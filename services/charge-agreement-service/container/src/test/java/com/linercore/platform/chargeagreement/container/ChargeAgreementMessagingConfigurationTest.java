package com.linercore.platform.chargeagreement.container;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.linercore.platform.chargeagreement.applicationservice.ChargeAgreementApplicationService;
import com.linercore.platform.messaging.ScheduledOutboxRelay;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class ChargeAgreementMessagingConfigurationTest {
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(ChargeAgreementMessagingConfiguration.class)
            .withBean(ChargeAgreementApplicationService.class,
                    () -> mock(ChargeAgreementApplicationService.class));

    @Test
    void missingRelayPropertyCreatesNoClaimant() {
        contextRunner.run(context -> assertThat(context)
                .doesNotHaveBean(ScheduledOutboxRelay.class));
    }

    @Test
    void explicitFalseCreatesNoClaimant() {
        contextRunner
                .withPropertyValues("charge-agreement.outbox-relay.enabled=false")
                .run(context -> assertThat(context)
                        .doesNotHaveBean(ScheduledOutboxRelay.class));
    }

    @Test
    void explicitTrueCreatesScheduledClaimant() {
        contextRunner
                .withPropertyValues("charge-agreement.outbox-relay.enabled=true")
                .run(context -> assertThat(context)
                        .hasSingleBean(ScheduledOutboxRelay.class));
    }
}
