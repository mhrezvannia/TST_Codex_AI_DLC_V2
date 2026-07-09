package com.linercore.platform.chargeagreement.container.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class ChargeAgreementModuleControllerTest {
    @Test
    void exposesSkeletonModuleInformation() {
        var info = new ChargeAgreementModuleController().moduleInfo();

        assertEquals("charge-agreement-service", info.serviceName());
        assertEquals("local-host-runtime", info.mode());
        assertTrue(info.capabilities().stream().anyMatch(flag -> flag.key().equals("backend-health") && flag.enabled()));
    }
}
