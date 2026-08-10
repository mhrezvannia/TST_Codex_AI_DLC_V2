package com.linercore.platform.identity.container;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class IdentityServiceConfigurationTest {
    private final IdentityServiceConfiguration configuration = new IdentityServiceConfiguration();

    @Test
    void bootstrapsSeedActorAndSuperuserOnlyInLocalProfile() {
        MockEnvironment local = new MockEnvironment();
        local.setActiveProfiles("local");

        var localAssignments = configuration.roleAssignmentRepository(local);
        var defaultAssignments = configuration.roleAssignmentRepository(new MockEnvironment());

        assertTrue(localAssignments.findBySubjectAndRole("local.reference.admin", "role-security-admin").isPresent());
        assertTrue(localAssignments.findBySubjectAndRole("local.superuser", "role-superuser").isPresent());
        assertFalse(defaultAssignments.findBySubjectAndRole("local.reference.admin", "role-security-admin").isPresent());
        assertFalse(defaultAssignments.findBySubjectAndRole("local.superuser", "role-superuser").isPresent());
    }
}
