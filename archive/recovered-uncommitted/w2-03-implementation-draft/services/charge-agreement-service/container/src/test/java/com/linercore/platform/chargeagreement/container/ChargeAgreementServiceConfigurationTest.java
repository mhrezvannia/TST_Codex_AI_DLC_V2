package com.linercore.platform.chargeagreement.container;

import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class ChargeAgreementServiceConfigurationTest {
    @Test
    void nonLocalIdentityConfigurationFailsClosed() {
        ChargeAgreementServiceConfiguration configuration = new ChargeAgreementServiceConfiguration();

        assertThrows(IllegalStateException.class,
                () -> configuration.chargeAgreementNonLocalIdentityGuard().run(null));
    }
}
